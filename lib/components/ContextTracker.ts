// ContextTracker.ts — Context tracking utilitys.
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST                 from '@je-es/ast';
    import { ScopeId, SymbolId }    from './ScopeManager';
    import { DebugManager }         from './DebugManager';
    import { DiagnosticManager }    from './DiagnosticManager';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPES ════════════════════════════════════════╗

    export enum DeclarationPhase {
        PreDeclaration          = 'PreDeclaration',
        InDeclaration           = 'InDeclaration',
        InInitialization        = 'InInitialization',
        PostDeclaration         = 'PostDeclaration'
    }

    export enum ExpressionContext {
        VariableInitializer     = 'VariableInitializer',
        ParameterInitializer    = 'ParameterInitializer',
        FunctionBody            = 'FunctionBody',
        AssignmentTarget        = 'AssignmentTarget',
        AssignmentSource        = 'AssignmentSource',
        ConditionExpression     = 'ConditionExpression',
        ReturnExpression        = 'ReturnExpression',
        DeferExpression         = 'DeferExpression',
        ThrowExpression         = 'ThrowExpression',
        CallArgument            = 'CallArgument',
        FunctionCall            = 'FunctionCall',
        GeneralExpression       = 'GeneralExpression'
    }

    export interface DeclarationContext {
        symbolName              : string;
        symbolId                : SymbolId;
        symbolKind              : ContextSymbolKind;
        phase                   : DeclarationPhase;
        span                    : AST.Span;
        parentScope             : ScopeId;
    }

    export interface ExpressionContextInfo {
        type                    : ExpressionContext;
        relatedSymbol           ?: SymbolId;
        depth                   : number;
        span                    : AST.Span;
    }

    export interface AnalysisContext {
        currentModuleName       : string;
        currentModulePath       : string;
        currentPhase            : AnalysisPhase;
        contextSpanStack        : AST.Span[];
        declarationStack        : DeclarationContext[];
        expressionStack         : ExpressionContextInfo[];
        currentScope            : ScopeId;
        processingSymbols       : Set<SymbolId>;
        pendingReferences       : Map<string, AST.Span[]>;
        resolvedSymbols         : Set<SymbolId>;
    }

    export enum AnalysisPhase {
        Collection              = 'Collection',
        Resolution              = 'Resolution',
        TypeValidation          = 'TypeValidation',
        SemanticValidation      = 'SemanticValidation',
        FinalValidation         = 'FinalValidation'
    }

    export type ContextSymbolKind = 'let' | 'Param' | 'fn' | 'Use' | 'def';

    export interface SavedContextState {
        scopeId                 : ScopeId;
        moduleName              : string;
        modulePath              : string;
        spanStackDepth          : number;
        declarationStackDepth   : number;
        expressionStackDepth    : number;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class ContextTracker {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            private context             : AnalysisContext;
            private currentPhase        : AnalysisPhase;
            private phaseStack          : AnalysisPhase[];
            private contextMap          : Map<string, unknown>;

            constructor(
                private debugManager?: DebugManager,
                private diagnosticManager?: DiagnosticManager
            ) {
                this.context = this.genAnalysisContext();
                this.currentPhase = AnalysisPhase.Collection;
                this.phaseStack = [];
                this.contextMap = new Map();
            }

            init(): void {
                this.reset();
            }

            reset(): void {
                this.context = this.genAnalysisContext();
                this.currentPhase = AnalysisPhase.Collection;
                this.phaseStack = [];
                this.contextMap.clear();
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            genAnalysisContext(): AnalysisContext {
                return {
                    currentModuleName   : '',
                    currentModulePath   : '',
                    currentPhase        : AnalysisPhase.Collection,
                    contextSpanStack    : [],
                    declarationStack    : [],
                    expressionStack     : [],
                    currentScope        : 0,
                    processingSymbols   : new Set(),
                    pendingReferences   : new Map(),
                    resolvedSymbols     : new Set()
                };
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────── STATE SAVE/RESTORE (NEW) ──────────────────┐

            saveState(): SavedContextState {
                const state: SavedContextState = {
                    scopeId                 : this.context.currentScope,
                    moduleName              : this.context.currentModuleName,
                    modulePath              : this.context.currentModulePath,
                    spanStackDepth          : this.context.contextSpanStack.length,
                    declarationStackDepth   : this.context.declarationStack.length,
                    expressionStackDepth    : this.context.expressionStack.length
                };

                this.debugManager?.log('verbose',
                    `💾 Saved context state: scope=${state.scopeId}, ` +
                    `module=${state.moduleName}, spans=${state.spanStackDepth}`
                );

                return state;
            }

            restoreState(state: SavedContextState): void {
                this.debugManager?.log('verbose',
                    `♻️  Restoring context state: scope=${state.scopeId}, module=${state.moduleName}`
                );

                // Validate state before restoration
                if (!this.validateSavedState(state)) {
                    this.debugManager?.log('errors', `⚠️  Invalid saved state detected, attempting recovery`);
                    // Don't throw - try to recover gracefully
                }

                // Restore scope
                this.context.currentScope = state.scopeId;

                // Restore module info
                this.context.currentModuleName = state.moduleName;
                this.context.currentModulePath = state.modulePath;

                // Restore stack depths with overflow protection
                this.restoreStack(this.context.contextSpanStack, state.spanStackDepth, 'contextSpan');
                this.restoreStack(this.context.expressionStack, state.expressionStackDepth, 'expression');

                // Declaration stack needs special handling for symbol cleanup
                while (this.context.declarationStack.length > state.declarationStackDepth) {
                    const decl = this.context.declarationStack.pop();
                    if (decl) {
                        this.context.processingSymbols.delete(decl.symbolId);
                    }
                }
            }

            withSavedState<T>(fn: () => T): T {
                const savedState = this.saveState();
                try {
                    return fn();
                } finally {
                    this.restoreState(savedState);
                }
            }

            private restoreStack<T>(stack: T[], targetDepth: number, name: string): void {
                if (stack.length < targetDepth) {
                    this.debugManager?.log('errors',
                        `⚠️ Stack underflow for ${name}: current=${stack.length}, target=${targetDepth}. Clearing stack.`
                    );
                    stack.length = 0; // Clear corrupted stack
                    return;
                }
                while (stack.length > targetDepth) {
                    stack.pop();
                }
            }

            private validateSavedState(state: SavedContextState): boolean {
                if (state.scopeId < 0) return false;
                if (state.spanStackDepth < 0) return false;
                if (state.declarationStackDepth < 0) return false;
                if (state.expressionStackDepth < 0) return false;
                return true;
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────── MODULE & PHASE ────────────────────────┐

            setModuleName(moduleName: string): void {
                this.context.currentModuleName = moduleName;
                this.debugManager?.log('verbose', `Context: Set module name to '${moduleName}'`);
            }

            setModulePath(modulePath: string): void {
                this.context.currentModulePath = modulePath;
                this.debugManager?.log('verbose', `Context: Set module path to '${modulePath}'`);
            }

            pushPhase(phase: AnalysisPhase): void {
                this.phaseStack.push(this.currentPhase);
                this.setPhase(phase);
                this.debugManager?.log('verbose', `Context: Pushed phase '${phase}' (stack: ${this.phaseStack.length})`);
            }

            popPhase(): AnalysisPhase | undefined {
                const previousPhase = this.phaseStack.pop();
                if (previousPhase) {
                    this.setPhase(previousPhase);
                    this.debugManager?.log('verbose', `Context: Popped phase, returned to '${previousPhase}'`);
                }
                return previousPhase;
            }

            setPhase(phase: AnalysisPhase): void {
                this.currentPhase = phase;
                this.context.currentPhase = phase;
                this.debugManager?.log('verbose', `Context: Entered phase '${phase}'`);
            }

            getCurrentPhase(): AnalysisPhase | undefined {
                return this.context.currentPhase;
            }

            setScope(scopeId: ScopeId): void {
                this.context.currentScope = scopeId;
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────── CONTEXT SPAN MANAGEMENT ────────────────────┐

            setCurrentContextSpan(span?: AST.Span): void {
                if (span) {
                    this.context.contextSpanStack.push(span);
                    this.debugManager?.log('verbose', `Context: Pushed span [${span.start}-${span.end}] (stack depth: ${this.context.contextSpanStack.length})`);
                } else {
                    if (this.context.contextSpanStack.length > 0) {
                        const removed = this.context.contextSpanStack.pop();
                        this.debugManager?.log('verbose', `Context: Popped span [${removed?.start}-${removed?.end}] (stack depth: ${this.context.contextSpanStack.length})`);
                    }
                }
            }

            pushContextSpan(span: AST.Span): void {
                this.context.contextSpanStack.push(span);
                this.debugManager?.log('verbose', `Context: Pushed scoped span [${span.start}-${span.end}]`);
            }

            popContextSpan(): AST.Span | undefined {
                const span = this.context.contextSpanStack.pop();
                if (span) {
                    this.debugManager?.log('verbose', `Context: Popped scoped span [${span.start}-${span.end}]`);
                }
                return span;
            }

            clearContextSpans(): void {
                const count = this.context.contextSpanStack.length;
                this.context.contextSpanStack = [];
                this.debugManager?.log('verbose', `Context: Cleared ${count} context spans`);
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────── DECLARATION TRACKING ──────────────────────┐

            startDeclaration(
                symbolName: string,
                symbolId: SymbolId,
                symbolKind: ContextSymbolKind | 'Use',
                span: AST.Span,
                parentScope: ScopeId
            ): void {
                const declaration: DeclarationContext = {
                    symbolName,
                    symbolId,
                    symbolKind,
                    phase: DeclarationPhase.InDeclaration,
                    span,
                    parentScope
                };

                this.context.declarationStack.push(declaration);
                this.context.processingSymbols.add(symbolId);
                this.pushContextSpan(span);

                this.debugManager?.log('verbose', `Context: Started declaration of ${symbolKind} '${symbolName}' (id: ${symbolId})`);
            }

            startInitialization(symbolId: SymbolId): void {
                const current = this.getCurrentDeclaration();
                if (current && current.symbolId === symbolId) {
                    current.phase = DeclarationPhase.InInitialization;
                    this.debugManager?.log('verbose', `Context: Started initialization of symbol '${current.symbolName}' (id: ${symbolId})`);
                }
            }

            completeDeclaration(symbolId: SymbolId): void {
                const index = this.context.declarationStack.findIndex(d => d.symbolId === symbolId);
                if (index >= 0) {
                    const declaration = this.context.declarationStack[index];
                    declaration.phase = DeclarationPhase.PostDeclaration;
                    this.context.declarationStack.splice(index, 1);
                    this.popContextSpan();
                    this.debugManager?.log('verbose', `Context: Completed declaration of '${declaration.symbolName}' (id: ${symbolId})`);
                }

                this.context.processingSymbols.delete(symbolId);
                this.context.resolvedSymbols.add(symbolId);
            }

            isInDeclaration(symbolName: string): boolean {
                return this.context.declarationStack.some(d => d.symbolName === symbolName);
            }

            isInInitialization(symbolName: string): boolean {
                return this.context.declarationStack.some(d =>
                    d.symbolName === symbolName && d.phase === DeclarationPhase.InInitialization
                );
            }

            getCurrentDeclaration(): DeclarationContext | undefined {
                return this.context.declarationStack[this.context.declarationStack.length - 1];
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────── EXPRESSION TRACKING ──────────────────────┐

            enterExpression(type: ExpressionContext, span: AST.Span, relatedSymbol?: SymbolId): void {
                if (!span) {
                    this.debugManager?.log('verbose', 'Warning: Attempted to enter expression context without span');
                    return;
                }

                const depth = this.context.expressionStack.length;
                this.context.expressionStack.push({ type, relatedSymbol, depth, span });
                this.pushContextSpan(span);
                this.debugManager?.log('verbose', `Context: Entered expression ${type} at depth ${depth}`);
            }

            exitExpression(): ExpressionContextInfo | undefined {
                if (this.context.expressionStack.length === 0) {
                    return undefined;
                }

                const exited = this.context.expressionStack.pop();
                this.popContextSpan();

                if (exited) {
                    this.debugManager?.log('verbose', `Context: Exited expression ${exited.type} from depth ${exited.depth}`);
                }

                return exited;
            }

            getCurrentExpressionContext(): ExpressionContextInfo | undefined {
                return this.context.expressionStack[this.context.expressionStack.length - 1];
            }

            isInExpressionType(type: ExpressionContext): boolean {
                return this.context.expressionStack.some(ctx => ctx.type === type);
            }

            getExpressionDepth(): number {
                return this.context.expressionStack.length;
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌────────────────────── SELF-REFERENCE DETECTION ────────────────────┐

            checkSelfReference(symbolName: string, referenceSpan: AST.Span): {
                isSelfReference: boolean;
                declarationContext?: DeclarationContext;
                errorType?: 'VARIABLE_SELF_INIT' | 'PARAMETER_SELF_INIT';
            } {
                const currentDeclaration = this.context.declarationStack.find(d =>
                    d.symbolName === symbolName && d.phase === DeclarationPhase.InInitialization
                );

                if (currentDeclaration) {
                    const errorType = currentDeclaration.symbolKind === 'let' ?
                        'VARIABLE_SELF_INIT' as const : 'PARAMETER_SELF_INIT' as const;

                    return {
                        isSelfReference: true,
                        declarationContext: currentDeclaration,
                        errorType
                    };
                }

                return { isSelfReference: false };
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────── FORWARD REFERENCE TRACKING ───────────────────┐

            recordPendingReference(symbolName: string, span: AST.Span): void {
                if (!this.context.pendingReferences.has(symbolName)) {
                    this.context.pendingReferences.set(symbolName, []);
                }
                this.context.pendingReferences.get(symbolName)!.push(span);
            }

            resolvePendingReferences(symbolName: string): AST.Span[] {
                const spans = this.context.pendingReferences.get(symbolName) || [];
                this.context.pendingReferences.delete(symbolName);
                return spans;
            }

            getPendingReferences(): Map<string, AST.Span[]> {
                return new Map(this.context.pendingReferences);
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────── PARAMETER ORDER VALIDATION ───────────────────┐

            checkParameterForwardReference(
                parameterName: string,
                currentParameterIndex: number,
                allParameters: { name: string; index: number }[]
            ): {
                isForwardReference: boolean;
                referencedParameterIndex?: number;
            } {
                const referencedParam = allParameters.find(p => p.name === parameterName);

                if (referencedParam && referencedParam.index > currentParameterIndex) {
                    return {
                        isForwardReference: true,
                        referencedParameterIndex: referencedParam.index
                    };
                }

                return { isForwardReference: false };
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── CONTEXT QUERIES ────────────────────────┐

            getContextSpan(): AST.Span | undefined {
                if (this.context.contextSpanStack.length > 0) {
                    return this.context.contextSpanStack[this.context.contextSpanStack.length - 1];
                }

                const currentExpression = this.getCurrentExpressionContext();
                if (currentExpression?.span) {
                    return currentExpression.span;
                }

                const currentDeclaration = this.getCurrentDeclaration();
                if (currentDeclaration?.span) {
                    return currentDeclaration.span;
                }

                return undefined;
            }

            getContext(): Readonly<AnalysisContext> {
                return this.context;
            }

            getPhase(): string {
                return this.context.currentPhase;
            }

            getModuleName(): string {
                return this.context.currentModuleName;
            }

            getModulePath(): string {
                return this.context.currentModulePath;
            }

            getScope(): ScopeId {
                return this.context.currentScope;
            }

            getProcessingSymbols(): Set<SymbolId> {
                return new Set(this.context.processingSymbols);
            }

            getResolvedSymbols(): Set<SymbolId> {
                return new Set(this.context.resolvedSymbols);
            }

            getDeclarationStack(): DeclarationContext[] {
                return [...this.context.declarationStack];
            }

            getCurrentDeclarationContext(): DeclarationContext | undefined {
                return this.context.declarationStack[this.context.declarationStack.length - 1];
            }

            getCurrentDeclarationSymbolId(): SymbolId | undefined {
                const current = this.getCurrentDeclaration();
                return current ? current.symbolId : undefined;
            }

            getCurrentDeclarationSymbolName(): string | undefined {
                const current = this.getCurrentDeclaration();
                return current ? current.symbolName : undefined;
            }

            getCurrentDeclarationSymbolKind(): ContextSymbolKind | undefined {
                const current = this.getCurrentDeclaration();
                return current ? current.symbolKind : undefined;
            }

            getCurrentDeclarationPhase(): DeclarationPhase | undefined {
                const current = this.getCurrentDeclaration();
                return current ? current.phase : undefined;
            }

            getCurrentDeclarationSpan(): AST.Span | undefined {
                const current = this.getCurrentDeclaration();
                return current ? current.span : undefined;
            }

            getCurrentDeclarationParentScope(): ScopeId | undefined {
                const current = this.getCurrentDeclaration();
                return current ? current.parentScope : undefined;
            }

            getCurrentDeclarationStackDepth(): number {
                return this.context.declarationStack.length;
            }

            getCurrentDeclarationStackTrace(): string[] {
                return this.context.declarationStack.map(d =>
                    `${d.symbolKind} '${d.symbolName}' (${d.phase})`
                );
            }

            isProcessingSymbol(symbolId: SymbolId): boolean {
                return this.context.processingSymbols.has(symbolId);
            }

            isSymbolResolved(symbolId: SymbolId): boolean {
                return this.context.resolvedSymbols.has(symbolId);
            }

            getDeclarationStackTrace(): string[] {
                return this.context.declarationStack.map(d =>
                    `${d.symbolKind} '${d.symbolName}' (${d.phase})`
                );
            }

            getExpressionStackTrace(): string[] {
                return this.context.expressionStack.map(e =>
                    `${e.type} at depth ${e.depth}`
                );
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── DEBUG UTILITIES ────────────────────────┐

            debugState(): void {
                console.log('Enhanced Context Tracker State:', {
                    module: this.context.currentModuleName,
                    phase: this.context.currentPhase,
                    scope: this.context.currentScope,
                    contextSpanStack: this.context.contextSpanStack.map(s => `[${s.start}-${s.end}]`),
                    declarationStack: this.getDeclarationStackTrace(),
                    expressionStack: this.getExpressionStackTrace(),
                    processingSymbols: Array.from(this.context.processingSymbols),
                    pendingReferences: Array.from(this.context.pendingReferences.keys())
                });
            }

        // └────────────────────────────────────────────────────────────────────┘
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝