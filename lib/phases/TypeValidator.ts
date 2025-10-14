// TypeValidator.ts — Type validation Phase.
//
// Developed with ❤️ by Maysara.



// ╔═══════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST                 from '@je-es/ast';
    import { AnalysisPhase }        from '../components/ContextTracker';
    import { DiagCode }             from '../components/DiagnosticManager';
    import { PhaseBase }            from '../interfaces/PhaseBase';
    import { AnalysisConfig }       from '../ast-analyzer';
    import { Scope, Symbol, SymbolKind, ScopeKind } from '../components/ScopeManager';
    import { ExpressionEvaluator }  from '../components/ExpressionEvaluator';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔═══════════════════════════════════════ TYPES ═══════════════════════════════════════╗

    interface TypeValidatorContext {
        currentModule               : string;
        moduleStack                 : string[];
        typeCache                   : Map<string, AST.TypeNode | null>;
    }

    interface TypeValidationStats {
        modulesProcessed            : number;
        typesInferred               : number;
        typesCached                 : number;
        compatibilityChecks         : number;
        callsValidated              : number;
        memberAccessValidated       : number;
        assignmentsValidated        : number;
        returnsValidated            : number;
        errors                      : number;
        startTime                   : number;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔═══════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class TypeValidator extends PhaseBase {

        // ┌──────────────────────────────── INIT ─────────────────────────────────┐

            private stats                       : TypeValidationStats   = this.initStats();

            private typeCtx                     : TypeValidatorContext  = this.initTypeValidatorContext();
            private ExpressionEvaluator         : ExpressionEvaluator;

            private inferenceStack              : Set<string>           = new Set();
            private circularTypeDetectionStack  : Set<string>           = new Set();

            private currentFunctionReturnType   : AST.TypeNode | null   = null;
            private hasReturnStatement          : boolean               = false;

            private currentFunctionErrorType    : AST.TypeNode | null   = null;
            private hasThrowStatement           : boolean               = false;
            private currentIsStaticMethod       : boolean               = false;
            private currentStructScope          : Scope | null          = null;


            private readonly CACHE_MAX_SIZE     = 10000;

            constructor( config : AnalysisConfig ) {
                super(AnalysisPhase.TypeValidation, config);

                this.ExpressionEvaluator = new ExpressionEvaluator(this.config);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ─────────────────────────────────┐

            handle(): boolean {
                try {
                    this.log('verbose', 'Starting symbol validation phase...');
                    this.stats.startTime = Date.now();

                    if (!this.init()) return false;
                    if (!this.validateAllModules()) return false;

                    this.logStatistics();
                    return !this.config.services.diagnosticManager.hasErrors();

                } catch (error) {
                    this.log('errors', `Fatal error during type validation: ${error}`);
                    this.reportError(DiagCode.INTERNAL_ERROR, `Fatal error during type validation: ${error}`);
                    return false;
                }
            }

            reset(): void {
                this.inferenceStack.clear();
                this.circularTypeDetectionStack.clear();
                this.stats          = this.initStats();
                this.typeCtx        = this.initTypeValidatorContext();
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌────────────────────────── [1] Program Level ─────────────────────────┐

            private validateAllModules(): boolean {
                this.log('verbose', 'Validating types from all modules...');
                const globalScope = this.config.services.scopeManager.getCurrentScope();

                for (const [moduleName, module] of this.config.program!.modules) {
                    this.config.services.contextTracker.pushContextSpan({ start: 0, end: 0 });
                    try {
                        if (!this.validateModule(moduleName, module, globalScope)) {
                            this.log('errors', `Failed to validate module ${moduleName}, continuing...`);
                        }
                        this.stats.modulesProcessed++;
                    } finally {
                        this.config.services.contextTracker.popContextSpan();
                    }
                }

                return true;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌────────────────────────── [2] Module Level ──────────────────────────┐

            private validateModule(moduleName: string, module: AST.Module, parentScope: Scope): boolean {
                this.log('symbols', `Validating module '${moduleName}'`);

                try {
                    this.config.services.contextTracker.setModuleName(moduleName);

                    if (typeof module.metadata?.path === 'string') {
                        this.config.services.contextTracker.setModulePath(module.metadata.path);
                    }

                    this.enterModuleContext(moduleName, module);

                    const moduleScope = this.findModuleScope(moduleName);
                    if (!moduleScope) {
                        this.reportError(DiagCode.MODULE_SCOPE_NOT_FOUND, `Module scope for '${moduleName}' not found`);
                        return false;
                    }

                    this.config.services.scopeManager.setCurrentScope(moduleScope.id);
                    this.config.services.contextTracker.setScope(moduleScope.id);

                    for (const statement of module.statements) {
                        this.validateStmt(statement, moduleScope, moduleName);
                    }

                    this.exitModuleContext();
                    return true;
                } catch (error) {
                    this.reportError(DiagCode.INTERNAL_ERROR, `Failed to validate module '${moduleName}': ${error}`);
                    return false;
                }
            }

             private enterModuleContext(moduleName: string, module: AST.Module): void {
                this.typeCtx.moduleStack.push(this.typeCtx.currentModule);
                this.typeCtx.currentModule = moduleName;
                this.config.services.contextTracker.setModuleName(moduleName);
                if (typeof module.metadata?.path === 'string') {
                    this.config.services.contextTracker.setModulePath(module.metadata.path);
                }
            }

            private exitModuleContext(): void {
                const previousModule = this.typeCtx.moduleStack.pop();
                this.typeCtx.currentModule = previousModule || '';
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── [3] Stmt Level ───────────────────────────┐

            private validateStmt(stmt: AST.StmtNode, currentScope?: Scope, moduleName?: string): void {
                if(!currentScope) { currentScope = this.config.services.scopeManager.getCurrentScope(); }
                if (!stmt) {
                    this.reportError(DiagCode.ANALYSIS_ERROR, 'Found null statement during validation');
                    return;
                }

                this.log('verbose', `Validating ${stmt.kind} statement`);
                this.config.services.contextTracker.pushContextSpan(stmt.span);

                try {
                    this.config.services.scopeManager.withScope(currentScope.id, () => {
                        this.config.services.contextTracker.withSavedState(() => {
                            this.config.services.contextTracker.setScope(currentScope.id);
                            this.processStmt(stmt, currentScope, moduleName);
                        });
                    });
                } catch (error) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `Failed to validate ${stmt.kind} statement: ${error}`,
                        stmt.span
                    );
                } finally {
                    this.config.services.contextTracker.popContextSpan();
                }
            }

            private processStmt(stmt: AST.StmtNode, currentScope: Scope, moduleName?: string): void {
                const nodeGetter = this.getNodeGetter(stmt);
                if (!nodeGetter) {
                    this.reportError(DiagCode.INTERNAL_ERROR, `Invalid AST: ${stmt.kind} node is null`);
                    return;
                }

                switch (stmt.kind) {
                        case 'Block':
                            this.handleBlockStmt(stmt.getBlock()!, currentScope, moduleName);
                            break;
                        case 'Test':
                            this.handleTestStmt(stmt.getTest()!, currentScope, moduleName);
                            break;
                        case 'Use':
                            break;
                        case 'Def':
                            this.handleDefStmt(stmt.getDef()!, currentScope, moduleName);
                            break;
                        case 'Let':
                            this.handleLetStmt(stmt.getLet()!, currentScope, moduleName);
                            break;
                        case 'Func':
                            this.handleFuncStmt(stmt.getFunc()!, currentScope, moduleName);
                            break;
                        case 'While':
                        case 'Do':
                        case 'For':
                            this.handleLoopStmt(stmt);
                            break;
                        case 'Return':
                        case 'Defer':
                        case 'Throw':
                            this.handleControlflowStmt(stmt);
                            break;
                        case 'Expression': {
                            const expr = stmt.getExpr()!;

                           // console.log('>>> Processing Expression statement');
                           // console.log('Expression kind:', expr.kind);

                            if (expr.kind === 'Binary') {
                                const binary = expr.getBinary();
                               // console.log('Binary kind:', binary?.kind);

                                if (binary && binary.kind === 'Assignment') {
                                   // console.log('>>> Calling validateAssignment');
                                   // console.log('Error count before validateAssignment:', this.config.services.diagnosticManager.length());

                                    this.validateAssignment(binary);

                                   // console.log('Error count after validateAssignment:', this.config.services.diagnosticManager.length());
                                   // console.log('Has errors after validateAssignment?', this.config.services.diagnosticManager.hasErrors());
                                }
                            }

                           // console.log('>>> Calling inferExpressionType');
                            this.inferExpressionType(expr);

                           // console.log('>>> Expression statement processing complete');
                           // console.log('Final error count:', this.config.services.diagnosticManager.length());
                           // console.log('Final has errors?', this.config.services.diagnosticManager.hasErrors());
                            break;
                        }
                    }
            }

            private getNodeGetter(stmt: AST.StmtNode): (() => any) | null {
                switch (stmt.kind) {
                    case 'Def'          : return () => stmt.getDef();
                    case 'Use'          : return () => stmt.getUse();
                    case 'Let'          : return () => stmt.getLet();
                    case 'Func'         : return () => stmt.getFunc();
                    case 'Block'        : return () => stmt.getBlock();
                    case 'Return'       :
                    case 'Defer'        :
                    case 'Throw'        : return () => stmt.getCtrlflow();
                    case 'While'        :
                    case 'Do'           :
                    case 'For'          : return () => stmt.getLoop();
                    case 'Expression'   : return () => stmt.getExpr();
                    case 'Test'         : return () => stmt.getTest();
                    default             : return null;
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────── [3.1] BLOCK ─────────────────────────────┐

            private handleBlockStmt(blockNode: AST.BlockStmtNode, scope?: Scope, moduleName?: string): void {
                this.validateBlockStmt(blockNode);
            }

            private validateBlockStmt(block: AST.BlockStmtNode, scope?: Scope, moduleName?: string): void {
                this.log('symbols', 'Validating block');

                const blockScope = this.config.services.scopeManager.findChildScopeByName('block', ScopeKind.Block);
                if (blockScope) {
                    this.config.services.contextTracker.withSavedState(() => {
                        this.config.services.contextTracker.setScope(blockScope.id);

                        this.config.services.scopeManager.withScope(blockScope.id, () => {
                            for (const stmt of block.stmts) {
                                this.validateStmt(stmt, blockScope);
                            }
                        });
                    });
                }
            }

            private handleTestStmt(testNode: AST.TestStmtNode, scope: Scope, moduleName?: string): void {
                this.validateBlockStmt(testNode.block, scope, moduleName);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.2] USE ──────────────────────────────┐

            // Skipped for now.

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.3] DEF ──────────────────────────────┐

            private handleDefStmt(defNode: AST.DefStmtNode, scope?: Scope, moduleName?: string): void {
                this.validateDefStmt(defNode);
            }

            private validateDefStmt(defNode: AST.DefStmtNode): void {
                this.log('symbols', `Type checking definition '${defNode.ident.name}'`);

                const symbol = this.config.services.scopeManager.getSymbolInCurrentScope(defNode.ident.name);
                if (!symbol) return;

                if (defNode.type) {
                    if (!this.checkCircularTypeDependency(defNode.type, defNode.ident.name, true)) {
                        this.resolveTypeNode(defNode.type);
                    }
                }

                symbol.isTypeChecked = true;
                symbol.type = defNode.type;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.4] LET ──────────────────────────────┐

            private handleLetStmt(letNode: AST.LetStmtNode, scope?: Scope, moduleName?: string): void {
                this.validateLetStmt(letNode);
            }

            private validateLetStmt(letNode: AST.LetStmtNode): void {
                this.log('symbols', `Type checking variable '${letNode.field.ident.name}'`);

                const symbol = this.config.services.scopeManager.getSymbolInCurrentScope(letNode.field.ident.name);
                if (!symbol) return;

                const currentScope = this.config.services.scopeManager.getCurrentScope();
                // Static variables only allowed in struct/enum types
                if (letNode.field.visibility.kind === 'Static') {
                    const currentScope = this.config.services.scopeManager.getCurrentScope();

                    // Static is only valid inside struct/enum type definitions
                    if (currentScope.kind !== ScopeKind.Type) {
                        this.reportError(
                            DiagCode.INVALID_VISIBILITY,
                            `Variable '${letNode.field.ident.name}' cannot be 'static' outside of struct/enum`,
                            letNode.field.ident.span
                        );
                        return;
                    }
                }

                if (letNode.field.type) {
                    if (this.checkCircularTypeDependency(letNode.field.type, letNode.field.ident.name, false)) {
                        return;
                    }
                    this.resolveTypeNode(letNode.field.type);
                }

                let initType = null;
                if (letNode.field.initializer) {
                    initType = this.extractTypeFromInitializer(letNode.field.initializer);

                    if (initType && (initType.isStruct() || initType.isEnum())) {
                        if (initType.isStruct()) {
                            this.validateStructType(initType.getStruct()!, symbol);
                        }
                        symbol.type = initType;
                        symbol.isTypeChecked = true;
                        return;
                    }
                }

                let structTypeToValidate: AST.TypeNode | null = null;
                let objectNodeToValidate: AST.ObjectNode | null = null;

                if (letNode.field.type && letNode.field.initializer) {
                    // Check for overflow before compatibility check
                    this.validateValueFitsInType(letNode.field.initializer, letNode.field.type);

                    let actualType = this.resolveIdentifierType(letNode.field.type);

                    if (actualType.isStruct()) {
                        if (letNode.field.initializer.is('Primary')) {
                            const primary = letNode.field.initializer.getPrimary();
                            if (primary && primary.is('Object')) {
                                const obj = primary.getObject()!;
                                structTypeToValidate = actualType;
                                objectNodeToValidate = obj;
                            }
                        }
                    }
                }
                else if (letNode.field.initializer && !letNode.field.type) {
                    if (letNode.field.initializer.is('Primary')) {
                        const primary = letNode.field.initializer.getPrimary();
                        if (primary && primary.is('Object')) {
                            const obj = primary.getObject()!;

                            if (obj.ident) {
                                const typeSymbol = this.config.services.scopeManager.lookupSymbol(obj.ident.name);
                                if (typeSymbol && typeSymbol.type) {
                                    let actualType = this.resolveIdentifierType(typeSymbol.type);

                                    if (actualType.isStruct()) {
                                        structTypeToValidate = actualType;
                                        objectNodeToValidate = obj;
                                        letNode.field.type = typeSymbol.type;
                                        symbol.type = typeSymbol.type;
                                    }
                                }
                            }
                        }
                    }
                }

                if (structTypeToValidate && objectNodeToValidate) {
                    this.validateStructConstruction(objectNodeToValidate, structTypeToValidate, letNode.field.initializer!.span);
                    symbol.isTypeChecked = true;
                    this.stats.typesInferred++;
                    return;
                }

                if (letNode.field.initializer) {
                    const initType = this.inferExpressionType(letNode.field.initializer);

                    if (initType) {
                        if (!letNode.field.type) {
                            letNode.field.type = initType;
                            symbol.type = initType;
                            this.stats.typesInferred++;
                        } else {
                            // Use shared helper for array validation
                            if (!this.validateArrayAssignment(
                                letNode.field.type,
                                initType,
                                letNode.field.initializer.span,
                                `Variable '${letNode.field.ident.name}'`
                            )) {
                                symbol.isTypeChecked = true;
                                return;
                            }

                            if (!this.isTypeCompatible(letNode.field.type, initType)) {
                                this.reportError(
                                    DiagCode.TYPE_MISMATCH,
                                    `Cannot assign type '${initType.toString()}' to variable of type '${letNode.field.type.toString()}'`,
                                    initType.span
                                );
                            }
                        }
                    }
                } else if (!letNode.field.type) {
                    this.reportError(
                        DiagCode.CANNOT_INFER_TYPE,
                        `Variable '${letNode.field.ident.name}' requires explicit type or initializer`,
                        letNode.field.span
                    );
                }

                // Check for overflow before compatibility check
                if(letNode.field.initializer) {
                    if(letNode.field.type) {
                        this.validateValueFitsInType(letNode.field.initializer, letNode.field.type);
                    } else if(initType) {
                        this.validateValueFitsInType(letNode.field.initializer, initType);
                    }
                }

                symbol.isTypeChecked = true;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.5] FUNC ─────────────────────────────┐

            private handleFuncStmt(funcNode: AST.FuncStmtNode, scope?: Scope, moduleName?: string): void {
                this.validateFuncStmt(funcNode);
            }

            private validateFuncStmt(funcNode: AST.FuncStmtNode): void {
                this.log('symbols', `Type checking function '${funcNode.ident.name}'`);

                const funcSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(funcNode.ident.name);
                if (!funcSymbol) {
                    this.reportError(
                        DiagCode.CANNOT_INFER_TYPE,
                        `Function '${funcNode.ident.name}' symbol not found`,
                        funcNode.span
                    );
                    return;
                }

                const funcScope = this.config.services.scopeManager.findChildScopeByName(funcNode.ident.name, ScopeKind.Function);
                if (!funcScope) {
                    this.reportError(
                        DiagCode.CANNOT_INFER_TYPE,
                        `Function scope for '${funcNode.ident.name}' not found`,
                        funcNode.span
                    );
                    return;
                }

                // Check if the function is stored IN a Type scope
                const funcSymbolScope = this.config.services.scopeManager.getScope(funcSymbol.scope);

                // For struct methods, funcSymbol.scope points to the Type scope (Point)
                const parentScope = funcSymbolScope.kind === ScopeKind.Type &&
                                funcSymbolScope.metadata?.typeKind === 'Struct'
                    ? funcSymbolScope
                    : null;

                const isStaticMethod = parentScope !== null &&
                                    funcNode.visibility.kind === 'Static';

                const isInstanceMethod = parentScope !== null &&
                                        !(funcNode.visibility.kind === 'Static');

                // Save previous context
                const previousIsStaticMethod = this.currentIsStaticMethod;
                const previousStructScope = this.currentStructScope;

                // SET CONTEXT BEFORE ENTERING NEW SCOPE - THIS IS CRITICAL
                this.currentIsStaticMethod = isStaticMethod;
                this.currentStructScope = isStaticMethod || isInstanceMethod ? parentScope : null;

                this.log('symbols', `Function '${funcNode.ident.name}': isStatic=${isStaticMethod}, isInstance=${isInstanceMethod}, structScope=${this.currentStructScope?.name || 'none'}`);

                // Save and set current function return/error type
                const previousReturnType = this.currentFunctionReturnType;
                const previousHasReturnStmt = this.hasReturnStatement;
                const previousErrorType = this.currentFunctionErrorType;
                const previousHasThrowStmt = this.hasThrowStatement;

                this.currentFunctionReturnType = funcNode.returnType || null;
                this.hasReturnStatement = false;
                this.currentFunctionErrorType = funcNode.errorType || null;
                this.hasThrowStatement = false;

                try {
                    this.config.services.contextTracker.withSavedState(() => {
                        this.config.services.scopeManager.withScope(funcScope.id, () => {
                            // ONLY inject self for instance methods (not static)
                            if (isInstanceMethod) {
                                this.resolveSelfParameter(funcScope, parentScope!);
                            }

                            // Validate parameters
                            for (const param of funcNode.parameters) {
                                this.validateParameter(param);
                            }

                            // Build function type
                            const paramTypes: AST.TypeNode[] = [];
                            for (const param of funcNode.parameters) {
                                if (param.type) {
                                    paramTypes.push(param.type);
                                } else {
                                    const paramSymbol = funcScope.symbols.get(param.ident.name);
                                    if (paramSymbol?.type) {
                                        paramTypes.push(paramSymbol.type);
                                    } else {
                                        this.reportError(
                                            DiagCode.CANNOT_INFER_TYPE,
                                            `Cannot infer type for parameter '${param.ident.name}'`,
                                            param.span
                                        );
                                        paramTypes.push(AST.TypeNode.asUndefined(param.span));
                                    }
                                }
                            }

                            funcSymbol.type = AST.TypeNode.asFunction(
                                funcNode.span,
                                paramTypes,
                                funcNode.returnType ?? this.currentFunctionReturnType ?? undefined
                            );

                            funcSymbol.metadata!.errorType = funcNode.errorType ?? this.currentFunctionErrorType ?? undefined;

                            // Validate body
                            if (funcNode.body) {
                                this.validateStmt(funcNode.body);

                                const expectedReturnType = funcNode.returnType || this.currentFunctionReturnType;

                                if (expectedReturnType && !expectedReturnType.isVoid()) {
                                    const hasErrorType = funcNode.errorType || this.currentFunctionErrorType;

                                    if (!this.hasReturnStatement) {
                                        if (!hasErrorType || !this.hasThrowStatement) {
                                            this.reportError(
                                                DiagCode.MISSING_RETURN_STATEMENT,
                                                `Function '${funcNode.ident.name}' with non-void return type must have at least one return statement`,
                                                funcNode.ident.span
                                            );
                                        }
                                    }
                                }

                                if (!funcNode.returnType) {
                                    if (this.currentFunctionReturnType) {
                                        funcSymbol.type!.getFunction()!.returnType = this.currentFunctionReturnType;
                                    } else {
                                        funcSymbol.type!.getFunction()!.returnType = AST.TypeNode.asVoid(funcNode.span);
                                    }
                                }
                            }
                        });
                    });

                    if (isInstanceMethod) {
                        this.stats.memberAccessValidated++;
                    }
                } finally {
                    this.config.services.contextTracker.completeDeclaration(funcSymbol.id);

                    // RESTORE context - ALWAYS do this, even on error
                    this.currentIsStaticMethod = previousIsStaticMethod;
                    this.currentStructScope = previousStructScope;

                    // Restore previous return/error types
                    this.currentFunctionReturnType = previousReturnType;
                    this.hasReturnStatement = previousHasReturnStmt;
                    this.currentFunctionErrorType = previousErrorType;
                    this.hasThrowStatement = previousHasThrowStmt;
                }

                funcSymbol.isTypeChecked = true;
            }

            // ───── PARAMS ─────

            private validateParameter(paramNode: AST.FieldNode): void {
                const paramSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(paramNode.ident.name);
                if (!paramSymbol) return;

                // Validate parameter visibility
                if (paramNode.visibility.kind === 'Static') {
                    this.reportError(  // Changed from reportWarning
                        DiagCode.INVALID_VISIBILITY,
                        `Parameter '${paramNode.ident.name}' cannot be 'static'`,
                        paramNode.ident.span
                    );
                    return;  // Add early return to prevent further processing
                } else if (paramNode.visibility.kind === 'Public') {
                    this.reportError(  // Changed from reportWarning
                        DiagCode.INVALID_VISIBILITY,
                        `Parameter '${paramNode.ident.name}' cannot be 'public'`,
                        paramNode.ident.span
                    );
                    return;  // Add early return to prevent further processing
                }

                if (paramNode.initializer) {
                    const initType = this.inferExpressionType(paramNode.initializer);

                    if (initType) {
                        if (!paramNode.type) {
                            paramNode.type = initType;
                            paramSymbol.type = initType;
                            this.stats.typesInferred++;
                        } else {
                            // Use shared helper for array validation
                            if (!this.validateArrayAssignment(
                                paramNode.type,
                                initType,
                                paramNode.initializer.span,
                                `Parameter '${paramNode.ident.name}' default value`
                            )) {
                                paramSymbol.isTypeChecked = true;
                                return;
                            }

                            if (!this.isTypeCompatible(paramNode.type, initType)) {
                                this.reportError(
                                    DiagCode.TYPE_MISMATCH,
                                    `Cannot assign type '${initType.toString()}' to parameter of type '${paramNode.type.toString()}'`,
                                    paramNode.initializer.span
                                );
                            }
                        }
                    }

                    // Check for overflow before compatibility check
                    if(paramNode.type) {
                        this.validateValueFitsInType(paramNode.initializer, paramNode.type);
                    } else if(initType) {
                        this.validateValueFitsInType(paramNode.initializer, initType);
                    }
                }

                paramSymbol.isTypeChecked = true;
            }

            private resolveSelfParameter(funcScope: Scope, structScope: Scope): void {
                const selfSymbol = funcScope.symbols.get('self');
                if (!selfSymbol) {
                    this.log('verbose', `Warning: Expected 'self' parameter in struct method but not found`);
                    return;
                }

                // Mark self as declared and used in resolution phase
                selfSymbol.declared = true;
                selfSymbol.used = true; // Mark as used by default since it's implicit

                if (selfSymbol.type) {
                    if (selfSymbol.type.kind === 'ident') {
                        const typeIdent = selfSymbol.type.getIdent()!;
                        if (typeIdent.name !== structScope.name) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Self type mismatch: expected '${structScope.name}', got '${typeIdent.name}'`,
                                selfSymbol.contextSpan
                            );
                        }
                    }
                }

                this.log('symbols', `Resolved 'self' parameter in struct method`);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.6] LOOP ─────────────────────────────┐

            private handleLoopStmt(stmt: AST.StmtNode, scope?: Scope, moduleName?: string): void {
                if(stmt.getLoop === undefined) {
                    const data = stmt;
                    switch (stmt.kind) {
                        case 'While' : {
                            const src = data.source as AST.LoopStmtNode;
                            const loop = AST.LoopStmtNode.createWhile(data.span, src.expr, src.stmt);
                            this.validateLoopStmt(loop);
                            break;
                        }
                        case 'Do' : {
                            const src = data.source as AST.LoopStmtNode;
                            const loop = AST.LoopStmtNode.createDo(data.span, src.expr, src.stmt);
                            this.validateLoopStmt(loop);
                            break;
                        }
                        case 'For' : {
                            const src = data.source as AST.LoopStmtNode;
                            const loop = AST.LoopStmtNode.createFor(data.span, src.expr, src.stmt);
                            this.validateLoopStmt(loop);
                            break;
                        }
                    }
                } else {
                    this.validateLoopStmt(stmt.getLoop()!);
                }
            }

            private validateLoopStmt(loopStmt: AST.LoopStmtNode): void {
                const loopScope = this.config.services.scopeManager.findChildScopeByName('loop', ScopeKind.Loop);
                if (!loopScope) return;

                this.config.services.contextTracker.withSavedState(() => {
                    this.config.services.scopeManager.withScope(loopScope.id, () => {
                        if (loopStmt.expr) {
                            const condType = this.inferExpressionType(loopStmt.expr);

                            if (loopStmt.kind === 'While' && condType && !condType.isBool()) {
                                this.log('verbose', `Loop condition has type ${condType.toString()}, not bool`);
                            }
                        }

                        if (loopStmt.stmt) {
                            this.validateStmt(loopStmt.stmt);
                        }
                    });
                });
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────── [3.7] CTRLFLOW ──────────────────────────┐

            private handleControlflowStmt(stmt: AST.StmtNode, scope?: Scope, moduleName?: string): void {
                if(stmt.getCtrlflow === undefined) {
                    const data = stmt;
                    switch (stmt.kind) {
                        case 'Return' : {
                            const src = data.source as AST.ControlFlowStmtNode;
                            const res = AST.ControlFlowStmtNode.asReturn(data.span, src.value);
                            this.validateReturnStmt(res);
                            break;
                        }
                        case 'Defer' : {
                            const src = data.source as AST.ControlFlowStmtNode;
                            const res = AST.ControlFlowStmtNode.asDefer(data.span, src.value);
                            this.validateDeferStmt(res);
                            break;
                        }
                        case 'Throw' : {
                            const src = data.source as AST.ControlFlowStmtNode;
                            const res = AST.ControlFlowStmtNode.asThrow(data.span, src.value);
                            this.validateThrowStmt(res);
                            break;
                        }
                    }
                } else {
                    switch (stmt.getCtrlflow()!.kind) {
                        case 'return' : {
                            this.validateReturnStmt(stmt.getCtrlflow()!);
                            break;
                        }
                        case 'defer' : {
                            this.validateDeferStmt(stmt.getCtrlflow()!);
                            break;
                        }
                        case 'throw' : {
                            this.validateThrowStmt(stmt.getCtrlflow()!);
                            break;
                        }
                    }
                }
            }

            private validateReturnStmt(returnNode: AST.ControlFlowStmtNode): void {
                this.log('symbols', 'Validating return statement');

                this.stats.returnsValidated++;
                this.hasReturnStatement = true;

                const isInFunction = this.isInsideFunctionScope();

                if (returnNode.value) {
                    const isConstructor = this.isConstructorExpression(returnNode.value);

                    if (!isConstructor && this.isTypeExpression(returnNode.value)) {
                        const functionReturnsType = this.currentFunctionReturnType && this.isTypeType(this.currentFunctionReturnType);

                        if (!functionReturnsType) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Cannot return a type as a value. Expected a value of type '${this.currentFunctionReturnType?.toString() || 'void'}', got type expression`,
                                returnNode.value.span
                            );
                            return;
                        }
                    }

                    this.log('verbose', `Inferring return expression type: ${returnNode.value.kind}`);
                    const returnType = this.inferExpressionType(returnNode.value);
                    this.log('verbose', `Return type inferred: ${returnType?.toString() || 'null'}`);

                    // If type inference returned null AND errors were reported, stop here
                    if (!returnType && this.config.services.diagnosticManager.hasErrors()) {
                        this.log('verbose', 'Type inference failed with errors, aborting return validation');
                        return;
                    }

                    if (isInFunction && this.currentFunctionReturnType) {
                        if (returnType && !this.isTypeCompatible(this.currentFunctionReturnType, returnType)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Return type '${returnType.toString()}' doesn't match function return type '${this.currentFunctionReturnType.toString()}'`,
                                returnNode.value.span
                            );
                        }
                    } else if (!isInFunction) {
                        this.reportError(
                            DiagCode.ANALYSIS_ERROR,
                            `Return statement outside of function`,
                            returnNode.span
                        );
                    }
                } else {
                    if (isInFunction && this.currentFunctionReturnType && !this.currentFunctionReturnType.isVoid()) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Function expects return type '${this.currentFunctionReturnType.toString()}' but got void return`,
                            returnNode.span
                        );
                    } else if (!isInFunction) {
                        this.reportError(
                            DiagCode.ANALYSIS_ERROR,
                            `Return statement outside of function`,
                            returnNode.span
                        );
                    }
                }
            }

            // Helper to detect constructor expressions
            private isConstructorExpression(expr: AST.ExprNode): boolean {
                if (!expr.is('Primary')) return false;
                const primary = expr.getPrimary();
                if (!primary?.is('Object')) return false;
                const obj = primary.getObject();
                // Constructor has a type name: Point { x: 0, y: 0 }
                return obj?.ident !== null && obj?.ident !== undefined;
            }

            private validateDeferStmt(deferNode: AST.ControlFlowStmtNode): void {
                // this.stats.defersValidated++;

                // Check if we're in a function scope by walking up the scope chain
                const isInFunction = this.isInsideFunctionScope();

                if (deferNode.value) {
                    this.inferExpressionType(deferNode.value);
                }

                if (!isInFunction) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `Defer statement outside of function`,
                        deferNode.span
                    );
                }
            }

            private validateThrowStmt(throwNode: AST.ControlFlowStmtNode): void {
                this.log('symbols', 'Validating throw statement');

                // Mark that we encountered a throw statement
                this.hasThrowStatement = true;

                // Check if we're in a function scope
                const isInFunction = this.isInsideFunctionScope();

                if (!isInFunction) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `Throw statement outside of function`,
                        throwNode.span
                    );
                    return;
                }

                // Get the current function's error type
                const functionErrorType = this.getCurrentFunctionErrorType();

                if (!functionErrorType) {
                    this.reportError(
                        DiagCode.THROW_WITHOUT_ERROR_TYPE,
                        `Cannot throw error in function without error type. Add '!ErrorType' to function signature`,
                        throwNode.span
                    );
                    return;
                }

                // Validate the thrown expression
                if (throwNode.value) {
                    const thrownType = this.inferExpressionType(throwNode.value);

                    if (!thrownType) {
                        this.reportError(
                            DiagCode.TYPE_INFERENCE_FAILED,
                            `Cannot infer type of thrown expression`,
                            throwNode.value.span
                        );
                        return;
                    }

                    // Validate that thrown type matches function's error type
                    this.validateThrowType(thrownType, functionErrorType, throwNode.value.span);
                } else {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `Throw statement must have an error value`,
                        throwNode.span
                    );
                }
            }

            private validateThrowType(
                thrownType: AST.TypeNode,
                functionErrorType: AST.TypeNode,
                span: AST.Span
            ): void {
                // CASE 1: Function has 'anyerror' - accepts ANY error type
                if (this.isAnyErrorType(functionErrorType)) {
                    if (!this.isErrorType(thrownType)) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Cannot throw non-error type '${thrownType.toString()}'. Expected error type`,
                            span
                        );
                    }
                    return;
                }

                // CASE 2: Specific error type - resolve both sides
                const resolvedFunctionError = this.resolveIdentifierType(functionErrorType);
                const resolvedThrownType = this.resolveIdentifierType(thrownType);

                // Check if throwing the right error type or member
                if (!this.isValidThrowType(resolvedThrownType, resolvedFunctionError, span)) {
                    this.reportError(
                        DiagCode.THROW_TYPE_MISMATCH,
                        `Thrown error type '${thrownType.toString()}' is not compatible with function error type '${functionErrorType.toString()}'`,
                        span
                    );
                }
            }

            private getCurrentFunctionErrorType(): AST.TypeNode | null {
                // Check if we're in a function scope
                const isInFunction = this.isInsideFunctionScope();

                if(isInFunction && this.currentFunctionErrorType) {
                    return this.currentFunctionErrorType;
                }

                // fallback
                {
                    let currentScope = this.config.services.scopeManager.getCurrentScope();

                    // Walk up to find function scope
                    while (currentScope && currentScope.kind !== ScopeKind.Function) {
                        const parent = this.config.services.scopeManager.getScopeParent(currentScope.id);
                        if (!parent) break;
                        currentScope = parent;
                    }

                    if (!currentScope || currentScope.kind !== ScopeKind.Function) {
                        return null;
                    }

                    // Find the function symbol
                    const parentScope = this.config.services.scopeManager.getScopeParent(currentScope.id);
                    if (!parentScope) return null;

                    const funcSymbol = parentScope.symbols.get(currentScope.name);
                    if (!funcSymbol || !funcSymbol.type || !funcSymbol.type.isFunction()) {
                        return null;
                    }

                    const funcType = funcSymbol.type.getFunction()!;
                    return funcType.errorType || null;
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── [4] EXPR Level ───────────────────────────┐

            private inferExpressionType(expr: AST.ExprNode): AST.TypeNode | null {
                if (!expr) return null;

                const cacheKey = this.createCacheKey(expr);

                if (this.inferenceStack.has(cacheKey)) {
                    this.log('verbose', `Circular type inference detected for ${cacheKey}`);
                    return null;
                }

                this.inferenceStack.add(cacheKey);
                try {
                    const inferredType = this.performTypeInference(expr);
                    if (inferredType) {
                        this.cacheType(cacheKey, inferredType);
                        this.stats.typesInferred++;
                    }
                    return inferredType;
                } finally {
                    this.inferenceStack.delete(cacheKey);
                }
            }

            private performTypeInference(expr: AST.ExprNode): AST.TypeNode | null {
                this.config.services.contextTracker.pushContextSpan(expr.span);
                try {
                    switch (expr.kind) {
                        case 'Primary':
                            return this.inferPrimaryType(expr.getPrimary()!);
                        case 'Binary':
                            return this.inferBinaryType(expr.getBinary()!);
                        case 'Prefix':
                            return this.inferPrefixType(expr.getPrefix()!);
                        case 'Postfix':
                            return this.inferPostfixType(expr.getPostfix()!);
                        case 'As':
                            return this.inferAsType(expr.getAs()!);
                        case 'Typeof': {
                            const typeofNode = expr.getTypeof()!;
                            const innerType = this.inferExpressionType(typeofNode.expr);

                            if (!innerType) {
                                this.reportError(
                                    DiagCode.TYPE_INFERENCE_FAILED,
                                    'Cannot infer type for typeof expression',
                                    typeofNode.expr.span
                                );
                                return null;
                            }

                            // Return the 'type' primitive, NOT the actual type
                            // This makes typeof return a TYPE (not usable in arithmetic)
                            return AST.TypeNode.asPrimitive(expr.span, 'type');
                        }

                        case 'Sizeof': {
                            const sizeofNode = expr.getSizeof()!;
                            const targetType = this.inferExpressionType(sizeofNode.expr);

                            if (!targetType) {
                                this.reportError(
                                    DiagCode.TYPE_INFERENCE_FAILED,
                                    'Cannot infer type for sizeof expression',
                                    sizeofNode.expr.span
                                );
                                return null;
                            }

                            // Compute size at compile time
                            const size = this.computeTypeSize(targetType);

                            if (size === null) {
                                this.reportError(
                                    DiagCode.INVALID_SIZEOF_TARGET,
                                    `Cannot compute size of type '${targetType.toString()}'`,
                                    sizeofNode.expr.span
                                );
                                return AST.TypeNode.asComptimeInt(expr.span, '0');
                            }

                            // Return as compile-time integer
                            return AST.TypeNode.asComptimeInt(expr.span, size.toString());
                        }
                        case 'Orelse':
                            return this.inferOrelseType(expr.getOrelse()!);
                        case 'Range':
                            return this.inferRangeType(expr.getRange()!);
                        case 'Try':
                            return this.inferTryType(expr.getTry()!);
                        case 'Catch':
                            return this.inferCatchType(expr.getCatch()!);
                        case 'If':
                            return this.inferIfType(expr.getIf()!);
                        case 'Switch':
                            return this.inferSwitchType(expr.getSwitch()!);
                        default:
                            return null;
                    }
                } finally {
                    this.config.services.contextTracker.popContextSpan();
                }
            }

            private computeTypeSize(type: AST.TypeNode): number | null {
                // Resolve identifier types first
                const resolved = this.resolveIdentifierType(type);
                return this.ExpressionEvaluator.computeTypeSize(resolved);
            }

            private resolveTypeNode(typeNode: AST.TypeNode): void {
                switch (typeNode.kind) {
                    case 'struct':
                        const tempSymbol: Symbol = {
                            id: -1,
                            name: '<struct-validation>',
                            kind: SymbolKind.Definition,
                            type: typeNode,
                            scope: this.config.services.scopeManager.getCurrentScope().id,
                            contextSpan: typeNode.span,
                            declared: true,
                            initialized: true,
                            used: false,
                            isTypeChecked: false,
                            visibility: { kind: 'Private' },
                            mutability: { kind: 'Immutable' },
                            isExported: false
                        };
                        this.validateStructType(typeNode.getStruct()!, tempSymbol);
                        break;

                    case 'enum':
                        const tempSymbol2: Symbol = {
                            id: -1,
                            name: '<enum-validation>',
                            kind: SymbolKind.Definition,
                            type: typeNode,
                            scope: this.config.services.scopeManager.getCurrentScope().id,
                            contextSpan: typeNode.span,
                            declared: true,
                            initialized: true,
                            used: false,
                            isTypeChecked: false,
                            visibility: { kind: 'Private' },
                            mutability: { kind: 'Immutable' },
                            isExported: false
                        };
                        this.validateEnumType(typeNode.getEnum()!, tempSymbol2);
                        break;

                    case 'array':
                        const arr = typeNode.getArray()!;
                        this.resolveTypeNode(arr.target);
                        if (arr.size) {
                            this.validateArraySize(arr.size);
                        }
                        break;

                    case 'optional':
                        this.resolveTypeNode(typeNode.getOptional()!.target);
                        break;

                    case 'pointer':
                        this.resolveTypeNode(typeNode.getPointer()!.target);
                        break;

                    case 'paren':
                        this.resolveTypeNode(typeNode.getParen()!.type);
                        break;

                    case 'tuple':
                        for (const field of typeNode.getTuple()!.fields) {
                            this.resolveTypeNode(field);
                        }
                        break;

                    case 'primitive': {
                        // special case i/u width must be from 0 to 65535
                        const src = typeNode.getPrimitive()!;

                        if(src.isSigned() || src.isUnsigned()) {
                            const width = src.width!;
                            if(width < 0 || width > 65535) {
                                this.reportError(DiagCode.INVALID_TYPE_WIDTH, `Type width must be from 0 to 65535`, typeNode.span);
                            }
                        }
                    }
                }
            }

            // Helper method to check if expression is a type (not a value)
            private isTypeExpression(expr: AST.ExprNode): boolean {
                if (expr.kind === 'Primary') {
                    const primary = expr.getPrimary();
                    if (!primary) return false;

                    // Check for Object FIRST before Type
                    // Constructors are Objects with an ident: Point { x: 0 }
                    if (primary.kind === 'Object') {
                        const obj = primary.getObject();
                        // If it has an ident, it's a constructor, NOT a type expression
                        if (obj && obj.ident) {
                            return false; // This is Point { x: 0 }, not a type
                        }
                        // If no ident, it's an anonymous object literal, also not a type
                        return false;
                    }

                    // Direct type expression: return i32, return struct{}, etc.
                    if (primary.kind === 'Type') {
                        return true;
                    }

                    // Check if it's an identifier that refers to a type definition
                    if (primary.kind === 'Ident') {
                        const ident = primary.getIdent();
                        if (!ident) return false;

                        // Look up the symbol to check if it's a type definition
                        const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                        if (symbol && symbol.kind === SymbolKind.Definition) {
                            // It's a type definition (like returning `Point` instead of an instance)
                            return true;
                        }
                    }
                }

                return false;
            }

            // Check if expression is the 'type' type
            private isTypeType(typeNode: AST.TypeNode): boolean {
                if (!typeNode.isPrimitive()) return false;
                const prim = typeNode.getPrimitive();
                return prim?.kind === 'type';
            }

            // ===== PRIMARY OPERATIONS =====

            private inferPrimaryType(primary: AST.PrimaryNode): AST.TypeNode | null {
                switch (primary.kind) {
                    case 'Literal':
                        return this.inferLiteralType(primary.getLiteral()!);
                    case 'Ident':
                        return this.inferIdentifierType(primary.getIdent()!);
                    case 'Paren':
                        const paren = primary.getParen()!;
                        return paren.source ? this.inferExpressionType(paren.source) : null;
                    case 'Tuple':
                        return this.inferTupleType(primary.getTuple()!);
                    case 'Object':
                        return this.inferObjectType(primary.getObject()!);
                    case 'Type':
                        return primary.getType();
                    default:
                        return null;
                }
            }

            private inferLiteralType(literal: AST.LiteralNode): AST.TypeNode {
                switch (literal.kind) {
                    case 'String':
                        const str = literal.value as string;
                        const sizeExpr = AST.ExprNode.asInteger(literal.span, str.length);
                        return AST.TypeNode.asArray(literal.span, AST.TypeNode.asUnsigned(literal.span, 'u8', 8), sizeExpr);

                    case 'Integer':
                        return AST.TypeNode.asComptimeInt(literal.span, literal.value as string);

                    case 'Float':
                        return AST.TypeNode.asComptimeFloat(literal.span, literal.value as string);

                    case 'Character':
                        return AST.TypeNode.asUnsigned(literal.span, 'u8', 8);

                    case 'Bool':
                        return AST.TypeNode.asBool(literal.span);

                    case 'Null':
                        return AST.TypeNode.asNull(literal.span);

                    case 'Undefined':
                        return AST.TypeNode.asUndefined(literal.span);

                    case 'Array':
                        return this.inferArrayLiteralType(literal);

                    default:
                        return AST.TypeNode.asUndefined(literal.span);
                }
            }

            private inferArrayLiteralType(literal: AST.LiteralNode): AST.TypeNode {
                const elements = literal.value as AST.ExprNode[];

                if (elements.length === 0) {
                    const sizeExpr = AST.ExprNode.asInteger(literal.span, 0);
                    return AST.TypeNode.asArray(literal.span, AST.TypeNode.asUndefined(literal.span), sizeExpr);
                }

                const firstType = this.inferExpressionType(elements[0]);
                if (!firstType) {
                    const sizeExpr = AST.ExprNode.asInteger(literal.span, elements.length);
                    return AST.TypeNode.asArray(literal.span, AST.TypeNode.asUndefined(literal.span), sizeExpr);
                }

                for (let i = 1; i < elements.length; i++) {
                    const elemType = this.inferExpressionType(elements[i]);
                    if (!elemType || !this.isTypeCompatible(firstType, elemType)) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            'Array elements have incompatible types',
                            elements[i].span
                        );
                    }
                }

                const sizeExpr = AST.ExprNode.asInteger(literal.span, elements.length);
                return AST.TypeNode.asArray(literal.span, firstType, sizeExpr);
            }

            private inferIdentifierType(ident: AST.IdentNode): AST.TypeNode | null {
                // Handle 'self' - distinguish static vs instance context
                if (ident.name === 'self') {
                    // // In static methods, using 'self' alone is an error
                    // if (this.currentIsStaticMethod && this.currentStructScope) {
                    //     this.reportError(
                    //         DiagCode.INVALID_STATIC_ACCESS,
                    //         `Cannot use 'self' in static method. Use '${this.currentStructScope.name}' to access static members.`,
                    //         ident.span
                    //     );
                    //     return null;
                    // }

                    // In instance methods, 'self' refers to the instance
                    const selfSymbol = this.config.services.scopeManager.lookupSymbol('self');
                    if (selfSymbol && selfSymbol.metadata?.isSelf) {
                        selfSymbol.used = true; // Mark as used to prevent false warning
                        return selfSymbol.type;
                    }
                }

                // SECOND: Check direct field access in static method (without self)
                if (this.currentIsStaticMethod && this.currentStructScope) {
                    const fieldSymbol = this.currentStructScope.symbols.get(ident.name);

                    if (fieldSymbol) {
                        // Check if it's a struct field OR method
                        if (fieldSymbol.kind === SymbolKind.StructField ||
                            fieldSymbol.kind === SymbolKind.Function) {

                            const isStatic = fieldSymbol.visibility.kind === 'Static';

                            if (!isStatic) {
                                const memberType = fieldSymbol.kind === SymbolKind.Function ? 'method' : 'field';
                                this.reportError(
                                    DiagCode.INVALID_STATIC_ACCESS,
                                    `Cannot access instance ${memberType} '${ident.name}' in static method. Static methods can only access static ${memberType}s.`,
                                    ident.span
                                );
                                return null;  // Stop processing and don't mark as used/resolved
                            }

                            // Valid static member - mark as used and continue
                            fieldSymbol.used = true;
                        }
                    }
                }

                const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                if (!symbol) return null;

                // Handle regular 'self' in instance methods
                if (ident.name === 'self' && symbol.metadata?.isSelf) {
                    symbol.used = true;
                    return symbol.type;
                }

                if (symbol.type) return symbol.type;

                if (symbol.kind === SymbolKind.Function && symbol.metadata) {
                    const metadata = symbol.metadata as any;

                    const paramTypes: AST.TypeNode[] = [];
                    if (metadata.params && Array.isArray(metadata.params)) {
                        for (const param of metadata.params) {
                            if (param.type) {
                                paramTypes.push(param.type);
                            }
                        }
                    }

                    const returnType = metadata.returnType || null;

                    const funcType = AST.TypeNode.asFunction(
                        symbol.contextSpan || ident.span,
                        paramTypes,
                        returnType
                    );

                    symbol.type = funcType;
                    return funcType;
                }

                return null;
            }

            private validateMethodCallContext(
                call: AST.CallNode,
                methodSymbol: Symbol,
                isStaticAccess: boolean,
                baseExpr: AST.ExprNode
            ): void {
                const isStaticMethod = methodSymbol.visibility.kind === 'Static';

                // CASE 1: Calling instance method on TYPE (Error)
                if (isStaticAccess && !isStaticMethod) {
                    this.reportError(
                        DiagCode.INVALID_STATIC_ACCESS,
                        `Cannot call instance method '${methodSymbol.name}' on type. Create an instance first.`,
                        call.span
                    );
                    return;
                }

                // CASE 2: Calling static method on INSTANCE (Error)
                if (!isStaticAccess && isStaticMethod) {
                    // // Get struct name from method's parent scope
                    // const methodScope = this.config.services.scopeManager.getScope(methodSymbol.scope);
                    // const structName = methodScope.name;

                    // this.reportError(
                    //     DiagCode.INVALID_STATIC_ACCESS,
                    //     `Cannot call static method '${methodSymbol.name}' on instance. Use '${structName}.${methodSymbol.name}()' instead.`,
                    //     call.span
                    // );

                    // Just continue - this is valid
                    return;
                }
            }

            private inferObjectType(obj: AST.ObjectNode): AST.TypeNode | null {
                // CASE 1: Named constructor (MyStruct { ... })
                if (obj.ident) {
                    const typeSymbol = this.config.services.scopeManager.lookupSymbol(obj.ident.name);

                    if (!typeSymbol) {
                        this.reportError(
                            DiagCode.UNDEFINED_IDENTIFIER,
                            `Type '${obj.ident.name}' not found`,
                            obj.span
                        );
                        return null;
                    }

                    if (!typeSymbol.type) {
                        this.reportError(
                            DiagCode.SYMBOL_NOT_FOUND,
                            `Symbol '${obj.ident.name}' has no type`,
                            obj.span
                        );
                        return null;
                    }

                    let actualType = typeSymbol.type;
                    if (actualType.isIdent()) {
                        const typeIdent = actualType.getIdent()!;
                        const resolvedSymbol = this.config.services.scopeManager.lookupSymbol(typeIdent.name);
                        if (resolvedSymbol && resolvedSymbol.type) {
                            actualType = resolvedSymbol.type;
                        }
                    }

                    if (actualType.isStruct()) {
                        this.validateStructConstruction(obj, actualType, obj.span);
                        return typeSymbol.type;
                    } else {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `'${obj.ident.name}' is not a struct type`,
                            obj.span
                        );
                        return null;
                    }
                }

                // CASE 2: Anonymous object literal
                const fields: AST.TypeNode[] = [];
                const fieldNodes: AST.FieldNode[] = [];

                for (const prop of obj.props) {
                    const fieldType = prop.val
                        ? this.inferExpressionType(prop.val)
                        : AST.TypeNode.asUndefined(prop.key.span);

                    if (!fieldType) {
                        this.reportError(
                            DiagCode.CANNOT_INFER_TYPE,
                            `Cannot infer type for property '${prop.key.name}'`,
                            prop.key.span
                        );
                        return null;
                    }

                    fields.push(fieldType);

                    const fieldNode = AST.FieldNode.create(
                        prop.key.span,
                        { kind: 'Private' },
                        { kind: 'Runtime' },
                        { kind: 'Immutable' },
                        prop.key,
                        fieldType,
                        prop.val || undefined
                    );
                    fieldNodes.push(fieldNode);
                }

                const members = fieldNodes.map(f => AST.StructMemberNode.createField(f.span, f));
                return AST.TypeNode.asStruct(obj.span, members, 'Anonymous');
            }

            private inferTupleType(tuple: AST.ExprTupleNode): AST.TypeNode | null {
                const fieldTypes: AST.TypeNode[] = [];

                for (const field of tuple.fields) {
                    const fieldType = this.inferExpressionType(field);
                    if (!fieldType) return null;
                    fieldTypes.push(fieldType);
                }

                return AST.TypeNode.asTuple(tuple.span, fieldTypes);
            }

            // ===== BINARY OPERATIONS =====

            private inferBinaryType(binary: AST.BinaryNode): AST.TypeNode | null {
                if (!binary.left || !binary.right) return null;

               // console.log('>>> inferBinaryType called, kind:', binary.kind);

                // Handle Assignment FIRST, before inferring operand types
                if (binary.kind === 'Assignment') {
                   // console.log('>>> ASSIGNMENT DETECTED in inferBinaryType');
                    this.validateAssignment(binary);
                    
                    // Assignment expression evaluates to the right-hand side value
                    return this.inferExpressionType(binary.right);
                }

                const leftType = this.inferExpressionType(binary.left);
                const rightType = this.inferExpressionType(binary.right);

                if (!leftType || !rightType) return null;

                // Reject 'type' in arithmetic
                if (this.isTypeType(leftType) || this.isTypeType(rightType)) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot perform ${binary.kind} operation on type values`,
                        binary.span
                    );
                    return null;
                }

                switch (binary.kind) {
                    case 'Additive':
                    case 'Multiplicative':
                    case 'Power':
                        // Validate operands are numeric
                        if (!this.isNumericType(leftType) || !this.isNumericType(rightType)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Cannot perform ${binary.kind} operation on non-numeric types '${leftType.toString()}' and '${rightType.toString()}'`,
                                binary.span
                            );
                            return null;
                        }
                        return this.promoteNumericTypes(leftType, rightType, binary.span);

                    case 'Shift':
                    case 'BitwiseAnd':
                    case 'BitwiseXor':
                    case 'BitwiseOr':
                        // Validate operands are integers
                        if (!this.isIntegerType(leftType) || !this.isIntegerType(rightType)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Bitwise operations require integer types, got '${leftType.toString()}' and '${rightType.toString()}'`,
                                binary.span
                            );
                            return null;
                        }
                        return this.promoteNumericTypes(leftType, rightType, binary.span);

                    case 'Equality':
                    case 'Relational':
                        return AST.TypeNode.asBool(binary.span);

                    case 'LogicalAnd':
                    case 'LogicalOr':
                        return AST.TypeNode.asBool(binary.span);

                    default:
                        return null;
                }
            }

            private validateAssignment(binary: AST.BinaryNode): void {
                if (binary.kind !== 'Assignment') return;

               // console.log('=== validateAssignment START ===');
                this.stats.assignmentsValidated++;

                const leftSymbol = this.extractSymbolFromExpression(binary.left);
               // console.log('Assignment left symbol:', leftSymbol?.name, 'mutability:', leftSymbol?.mutability.kind);
               // console.log('Left symbol kind:', leftSymbol?.kind);
               // console.log('Left symbol scope:', leftSymbol?.scope);

                if (leftSymbol) {
                    // Check if the LEFT SIDE SYMBOL is immutable
                    if (leftSymbol.mutability.kind === 'Immutable') {
                        let symbolType = 'variable';
                        if (leftSymbol.kind === SymbolKind.Parameter) {
                            symbolType = 'parameter';
                        } else if (leftSymbol.kind === SymbolKind.StructField) {
                            symbolType = 'field';
                        }

                       // console.log('>>> MUTABILITY ERROR DETECTED <<<');
                       // console.log('Symbol type:', symbolType);
                       // console.log('Symbol name:', leftSymbol.name);
                       // console.log('Error count before:', this.config.services.diagnosticManager.length());

                        this.reportError(
                            DiagCode.MUTABILITY_MISMATCH,
                            `Cannot assign to immutable ${symbolType} '${leftSymbol.name}'`,
                            binary.left.span
                        );

                       // console.log('Error count after:', this.config.services.diagnosticManager.length());
                       // console.log('Has errors?', this.config.services.diagnosticManager.hasErrors());
                       // console.log('=== validateAssignment EARLY RETURN ===');
                        return; // Stop here - don't continue validation
                    }
                }

               // console.log('Continuing with type compatibility check...');

                // Type compatibility check
                const leftType = this.inferExpressionType(binary.left);
                const rightType = this.inferExpressionType(binary.right);

                if (leftType && rightType && !this.isTypeCompatible(leftType, rightType)) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot assign type '${rightType.toString()}' to '${leftType.toString()}'`,
                        binary.right.span
                    );
                }

                // Check for overflow
                if (leftType) {
                    this.validateValueFitsInType(binary.right, leftType);
                }

               // console.log('=== validateAssignment END ===');
            }

            private resolveStructFieldSymbol(structType: AST.TypeNode, fieldName: string): Symbol | null {
                const struct = structType.getStruct()!;
                const scopeId = struct.metadata?.scopeId as number | undefined;

                if (scopeId !== undefined) {
                    try {
                        const typeScope = this.config.services.scopeManager.getScope(scopeId);
                        return typeScope.symbols.get(fieldName) || null;
                    } catch {
                        return null;
                    }
                }
                return null;
            }

            // ===== PREFIX OPERATIONS =====

            private inferPrefixType(prefix: AST.PrefixNode): AST.TypeNode | null {
                const exprType = this.inferExpressionType(prefix.expr);
                if (!exprType) return null;

                switch (prefix.kind) {
                    case 'UnaryPlus':
                    case 'UnaryMinus':
                        if (!this.isNumericType(exprType)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Unary '${prefix.kind === 'UnaryMinus' ? '-' : '+'}' requires a numeric operand, got '${exprType.toString()}'`,
                                prefix.expr.span
                            );
                            return null;
                        }
                        return this.computeUnaryResultType(exprType, prefix.kind === 'UnaryMinus', prefix.span);

                    case 'Increment':
                    case 'Decrement':
                        if (!this.isNumericType(exprType)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `${prefix.kind} requires a numeric operand`,
                                prefix.expr.span
                            );
                            return null;
                        }
                        return exprType;

                    case 'LogicalNot':
                        return AST.TypeNode.asBool(prefix.span);

                    case 'BitwiseNot':
                        if (!this.isIntegerType(exprType)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Bitwise not requires integer type, got '${exprType.toString()}'`,
                                prefix.expr.span
                            );
                            return null;
                        }
                        return exprType;

                    case 'Reference':
                    // Check if the referenced variable is mutable
                    // &mut_var should produce *mut T, &immut_var should produce *T
                    let isMutablePointer = false;

                    // Extract the symbol being referenced
                    if (prefix.expr.is('Primary')) {
                        const primary = prefix.expr.getPrimary();
                        if (primary?.is('Ident')) {
                            const ident = primary.getIdent();
                            if (ident) {
                                const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                                // If the variable is mutable, create a mutable pointer
                                if (symbol && symbol.mutability.kind === 'Mutable') {
                                    isMutablePointer = true;
                                }
                            }
                        }
                    }

                    return AST.TypeNode.asPointer(prefix.span, exprType, isMutablePointer);

                    default:
                        return null;
                }
            }

            // ===== POSTFIX OPERATIONS =====

            private inferPostfixType(postfix: AST.PostfixNode): AST.TypeNode | null {
                switch (postfix.kind) {
                    case 'Call':
                        return this.inferCallType(postfix.getCall()!);

                    case 'ArrayAccess':
                        return this.inferArrayAccessType(postfix.getArrayAccess()!);

                    case 'MemberAccess':
                        return this.inferMemberAccessType(postfix.getMemberAccess()!);

                    case 'Increment':
                    case 'Decrement':
                        const exprType = this.inferExpressionType(postfix.getAsExprNode()!);
                        if (exprType && !this.isNumericType(exprType)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `${postfix.kind} requires numeric type`,
                                postfix.span
                            );
                            return null;
                        }
                        return exprType;

                    case 'Dereference':
                        const ptrType = this.inferExpressionType(postfix.getAsExprNode()!);

                        if (!ptrType) {
                            this.reportError(
                                DiagCode.TYPE_INFERENCE_FAILED,
                                'Cannot infer type for dereference operation',
                                postfix.span
                            );
                            return null;
                        }

                        // Must be a pointer type
                        if (!ptrType.isPointer()) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Cannot dereference non-pointer type '${ptrType.toString()}'`,
                                postfix.span
                            );
                            return null;
                        }

                        return ptrType.getPointer()!.target;

                    default:
                        return null;
                }
            }

            private inferCallType(call: AST.CallNode): AST.TypeNode | null {
                this.stats.callsValidated++;

                // Check builtins FIRST
                if (this.isBuiltinFunction(call.base)) {
                    return this.validateBuiltinCall(call);
                }

                // Check if method call and validate context
                if (call.base.is('Postfix')) {
                    const postfix = call.base.getPostfix();
                    if (postfix?.kind === 'MemberAccess') {
                        const access = postfix.getMemberAccess()!;
                        const baseType = this.inferExpressionType(access.base);

                        if (baseType) {
                            const resolvedBase = this.resolveIdentifierType(baseType);

                            if (resolvedBase.isStruct()) {
                                const memberName = this.extractMemberName(access.target);
                                if (memberName) {
                                    const struct = resolvedBase.getStruct()!;
                                    const scopeId = struct.metadata?.scopeId as number | undefined;

                                    if (scopeId !== undefined) {
                                        const structScope = this.config.services.scopeManager.getScope(scopeId);
                                        const methodSymbol = structScope.symbols.get(memberName);

                                        if (methodSymbol && methodSymbol.kind === SymbolKind.Function) {
                                            // Validate call context (static vs instance)
                                            const isStaticAccess = this.isStaticMemberAccess(access.base);
                                            this.validateMethodCallContext(call, methodSymbol, isStaticAccess, access.base);

                                            // Validate visibility
                                            this.validateMemberVisibility(methodSymbol, structScope, access.target.span);
                                        }
                                    }
                                }

                                return this.validateStructMethodCall(call, access, resolvedBase);
                            }
                        }
                    }
                }

                // Regular function call...
                const calleeSymbol = this.findCallTargetSymbol(call.base);
                let calleeType = calleeSymbol ? calleeSymbol.type : this.inferExpressionType(call.base);

                if (!calleeType) {
                    return null;
                }

                if (calleeType.isFunction()) {
                    return this.validateCallArgumentsWithContext(call, calleeType);
                }

                this.reportError(
                    DiagCode.TYPE_MISMATCH,
                    `Cannot call value of non-function type`,
                    call.base.span
                );
                return null;
            }

            private validateMemberVisibility(
                memberSymbol: Symbol,
                structScope: Scope,
                accessSpan: AST.Span
            ): void {
                // Public members are always accessible - skip check
                if (memberSymbol.visibility.kind === 'Public') {
                    return;
                }

                // Check if member is private and being accessed from outside
                if (memberSymbol.visibility.kind === 'Private') {
                    const currentScope = this.config.services.scopeManager.getCurrentScope();

                    // Walk up to find if we're inside the same struct
                    let isInsideStruct = false;
                    let checkScope: Scope | null = currentScope;

                    while (checkScope) {
                        if (checkScope.id === structScope.id) {
                            isInsideStruct = true;
                            break;
                        }

                        if (checkScope.parent !== null) {
                            checkScope = this.config.services.scopeManager.getScope(checkScope.parent);
                        } else {
                            break;
                        }
                    }

                    if (!isInsideStruct) {
                        this.reportError(
                            DiagCode.SYMBOL_NOT_ACCESSIBLE,
                            `Cannot access private ${memberSymbol.kind === SymbolKind.Function ? 'method' : 'field'} '${memberSymbol.name}' from outside struct`,
                            accessSpan
                        );
                    }
                }
            }

            private validateBuiltinCall(call: AST.CallNode): AST.TypeNode | null {
                const builtinName = this.extractBuiltinName(call.base);
                if (!builtinName) {
                    this.reportError(
                        DiagCode.INTERNAL_ERROR,
                        'Failed to extract builtin name',
                        call.base.span
                    );
                    return AST.TypeNode.asVoid(call.span);
                }

                // Look up builtin in global scope
                const globalScope = this.config.services.scopeManager.getGlobalScope();
                const builtinSymbol = globalScope.symbols.get(builtinName);

                if (!builtinSymbol || !builtinSymbol.type) {
                    this.reportError(
                        DiagCode.UNDEFINED_BUILTIN,
                        `Unknown builtin function '${builtinName}'`,
                        call.base.span
                    );
                    return AST.TypeNode.asVoid(call.span);
                }

                const funcType = builtinSymbol.type;
                if (!funcType.isFunction()) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `'${builtinName}' is not callable`,
                        call.base.span
                    );
                    return AST.TypeNode.asVoid(call.span);
                }

                const func = funcType.getFunction()!;

                // Check argument count
                if (func.params.length !== call.args.length) {
                    const code = func.params.length > call.args.length
                        ? DiagCode.TOO_FEW_ARGUMENTS
                        : DiagCode.TOO_MANY_ARGUMENTS;

                    this.reportError(
                        code,
                        `Builtin '${builtinName}' expects ${func.params.length} argument(s), but got ${call.args.length}`,
                        call.args.length ? { start: call.args[0].span.start, end: call.args[call.args.length-1].span.end } : call.span
                    );
                    return func.returnType || AST.TypeNode.asVoid(call.span);
                }

                // Validate argument types
                for (let i = 0; i < func.params.length; i++) {
                    const paramType = func.params[i];
                    const arg = call.args[i];
                    const argType = this.inferExpressionType(arg);

                    if (!argType) continue;

                    if (!this.isTypeCompatible(paramType, argType)) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Argument type '${argType.toString()}' is not compatible with parameter type '${paramType.toString()}'`,
                            arg.span
                        );
                    }
                }

                return func.returnType || AST.TypeNode.asVoid(call.span);
            }

            private validateStructMethodCall(
                call: AST.CallNode,
                access: AST.MemberAccessNode,
                structType: AST.TypeNode
            ): AST.TypeNode | null {
                const methodName = this.extractMemberName(access.target);
                if (!methodName) return null;

                // Get the struct scope
                const struct = structType.getStruct()!;
                const scopeId = struct.metadata?.scopeId as number | undefined;

                if (scopeId === undefined) {
                    this.reportError(
                        DiagCode.INTERNAL_ERROR,
                        `Cannot find scope for struct method call`,
                        call.span
                    );
                    return null;
                }

                const structScope = this.config.services.scopeManager.getScope(scopeId);

                // Find the method symbol
                const methodSymbol = structScope.symbols.get(methodName);
                if (!methodSymbol || methodSymbol.kind !== SymbolKind.Function) {
                    this.reportError(
                        DiagCode.SYMBOL_NOT_FOUND,
                        `Method '${methodName}' not found in struct`,
                        access.target.span
                    );
                    return null;
                }

                if (!methodSymbol.type || !methodSymbol.type.isFunction()) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `'${methodName}' is not a callable method`,
                        call.span
                    );
                    return null;
                }

                // Actually validate the call arguments!
                return this.validateMethodCall(call, methodSymbol, structScope, access.base);
            }

            private validateCallArgumentsWithContext(call: AST.CallNode, funcType: AST.TypeNode): AST.TypeNode | null {
                const func = funcType.getFunction()!;

                if (func.params.length !== call.args.length) {
                    const code = func.params.length > call.args.length ?
                        DiagCode.TOO_FEW_ARGUMENTS : DiagCode.TOO_MANY_ARGUMENTS;

                    this.reportError(
                        code,
                        `Expected ${func.params.length} arguments, but got ${call.args.length}`,
                        call.span
                    );
                    return null;
                }

                for (let i = 0; i < func.params.length; i++) {
                    const paramType = func.params[i];
                    const arg = call.args[i];

                    let argType = this.inferExpressionTypeWithContext(arg, paramType);

                    // Don't allow undefined/null argument types to pass
                    if (!argType) {
                        this.reportError(
                            DiagCode.TYPE_INFERENCE_FAILED,
                            `Cannot infer type for argument ${i + 1}`,
                            arg.span
                        );
                        continue; // Skip to next argument
                    }

                    // Check compatibility BEFORE reporting error
                    if (!this.isTypeCompatible(paramType, argType)) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Argument type '${argType.toString()}' is not assignable to parameter type '${paramType.toString()}'`,
                            arg.span
                        );
                    }
                }

                return func.returnType || AST.TypeNode.asVoid(call.span);
            }

            private inferExpressionTypeWithContext(expr: AST.ExprNode, expectedType?: AST.TypeNode): AST.TypeNode | null {
                if (expectedType && expr.is('Primary')) {
                    const primary = expr.getPrimary();
                    if (primary && primary.is('Object')) {
                        const obj = primary.getObject()!;

                        if (!obj.ident) {
                            const resolvedExpected = this.resolveIdentifierType(expectedType);

                            if (resolvedExpected.isStruct()) {
                                this.validateStructConstruction(obj, resolvedExpected, expr.span);
                                return expectedType;
                            }
                        }
                    }
                }

                return this.inferExpressionType(expr);
            }

            private inferArrayAccessType(access: AST.ArrayAccessNode): AST.TypeNode | null {
                const baseType = this.inferExpressionType(access.base);
                const indexType = this.inferExpressionType(access.index);

                if (!baseType) return null;

                if (indexType && !this.isIntegerType(indexType)) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Array index must be integer type, got '${indexType.toString()}'`,
                        access.index.span
                    );
                }

                if (baseType.isArray()) {
                    return baseType.getArray()!.target;
                }

                if (this.isStringType(baseType)) {
                    return AST.TypeNode.asUnsigned(access.span, 'u8', 8);
                }

                this.reportError(
                    DiagCode.TYPE_MISMATCH,
                    `Cannot index non-array type '${baseType.toString()}'`,
                    access.base.span
                );
                return null;
            }

            private inferMemberAccessType(access: AST.MemberAccessNode): AST.TypeNode | null {
                // DEBUG: Log the current context
                this.log('verbose', `inferMemberAccessType: currentIsStaticMethod=${this.currentIsStaticMethod}, currentStructScope=${this.currentStructScope?.name || 'null'}`);

                // Check wildcard imports FIRST, before inferring base type
                if (access.base.is('Primary')) {
                    const primary = access.base.getPrimary();
                    if (primary?.is('Ident')) {
                        const ident = primary.getIdent()!;

                        if (ident?.name === 'self') {
                            // In static methods, 'self.member' should error
                            if (this.currentIsStaticMethod && this.currentStructScope) {
                                const memberName = this.extractMemberName(access.target);
                                if (!memberName) {
                                    this.reportError(DiagCode.INTERNAL_ERROR, `Could not resolve member access on self`, access.target.span);
                                    return null;
                                }

                                const memberSymbol = this.currentStructScope.symbols.get(memberName);

                                if (!memberSymbol) {
                                    this.reportError(DiagCode.SYMBOL_NOT_FOUND, `Member '${memberName}' not found in struct`, access.target.span);
                                    return null;
                                }

                                const isStaticMember = memberSymbol.visibility.kind === 'Static';

                                if (!isStaticMember) {
                                    const memberType = memberSymbol.kind === SymbolKind.Function ? 'method' : 'field';
                                    this.reportError(
                                        DiagCode.INVALID_STATIC_ACCESS,
                                        `Cannot access instance ${memberType} '${memberName}' via 'self' in static method. Static methods can only access static members.`,
                                        access.target.span
                                    );
                                    return null;
                                }

                                // Valid static member access via self
                                memberSymbol.used = true;
                                return memberSymbol.type || null;
                            }

                            // Instance method - resolve self normally
                            const selfSymbol = this.config.services.scopeManager.lookupSymbol('self');
                            if (selfSymbol && selfSymbol.metadata?.isSelf) {
                                selfSymbol.used = true;
                                const selfType = selfSymbol.type;
                                if (selfType) {
                                    return this.resolveMemberOnUnwrappedType(selfType, access, null, false);
                                }
                            }

                            return null;
                        }

                        const baseSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);

                        // Handle wildcard import member access
                        if (baseSymbol && baseSymbol.kind === SymbolKind.Use &&
                            baseSymbol.metadata?.isWildcardImport) {

                            return this.resolveWildcardMemberAccess(access, baseSymbol);
                        }
                    }
                }

                // Continue with normal resolution...
                let baseType = this.inferExpressionType(access.base);
                if (!baseType) {
                    return null;
                }

                // Handle dereference in base expression
                if (access.base.is('Postfix')) {
                    const postfix = access.base.getPostfix();
                    if (postfix?.kind === 'Dereference') {
                        if (baseType.isIdent()) {
                            const ident = baseType.getIdent()!;
                            const typeSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                            if (typeSymbol?.type) {
                                baseType = typeSymbol.type;
                            }
                        }
                        return this.resolveMemberOnUnwrappedType(baseType, access, null);
                    }
                }

                let unwrappedType = baseType;
                let optionalDepth = 0;

                while (unwrappedType.isOptional()) {
                    unwrappedType = unwrappedType.getOptional()!.target;
                    optionalDepth++;
                }

                if (unwrappedType.isIdent()) {
                    const ident = unwrappedType.getIdent()!;
                    const typeSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                    if (typeSymbol?.type) {
                        unwrappedType = typeSymbol.type;
                    }
                }

                // Check if accessing static member on type identifier
                const isStaticAccess = this.isStaticMemberAccess(access.base);

                const memberType = this.resolveMemberOnUnwrappedType(
                    unwrappedType,
                    access,
                    null,
                    isStaticAccess
                );

                if (optionalDepth > 0 && memberType) {
                    return AST.TypeNode.asOptional(access.span, memberType);
                }

                return memberType;
            }

            private resolveWildcardMemberAccess(
                access: AST.MemberAccessNode,
                wildcardSymbol: Symbol
            ): AST.TypeNode | null {
                const memberName = this.extractMemberName(access.target);
                if (!memberName) {
                    this.reportError(
                        DiagCode.INTERNAL_ERROR,
                        `Cannot extract member name from wildcard access`,
                        access.target.span
                    );
                    return null;
                }

                const targetModuleName = wildcardSymbol.importSource;
                if (!targetModuleName) {
                    this.reportError(
                        DiagCode.INTERNAL_ERROR,
                        `Wildcard import has no source module`,
                        access.span
                    );
                    return null;
                }

                // Find target module scope
                const targetModuleScope = this.findModuleScope(targetModuleName);
                if (!targetModuleScope) {
                    this.reportError(
                        DiagCode.MODULE_SCOPE_NOT_FOUND,
                        `Cannot find scope for module '${targetModuleName}'`,
                        access.span
                    );
                    return null;
                }

                // Look up the member in the target module
                const memberSymbol = targetModuleScope.symbols.get(memberName);
                if (!memberSymbol) {
                    // THIS IS THE ERROR THAT SHOULD FIRE
                    this.reportError(
                        DiagCode.SYMBOL_NOT_FOUND,
                        `Module '${targetModuleName}' has no exported symbol '${memberName}'`,
                        access.target.span
                    );
                    return null;
                }

                // Check if symbol is exported
                if (!memberSymbol.isExported) {
                    this.reportError(
                        DiagCode.SYMBOL_NOT_EXPORTED,
                        `Symbol '${memberName}' is not exported from module '${targetModuleName}'`,
                        access.target.span
                    );
                    return null;
                }

                // Mark as used
                memberSymbol.used = true;
                wildcardSymbol.used = true;

                // this.stats.memberAccessResolved++;

                return memberSymbol.type;
            }

            private getFunctionNode(methodName: string, structScope: Scope): AST.FuncStmtNode | null {
                const methodSymbol = structScope.symbols.get(methodName);
                if (!methodSymbol || methodSymbol.kind !== SymbolKind.Function) {
                    return null;
                }

                // The function node should be stored in metadata or we need to look it up
                // For now, we'll rely on the visibility info from the symbol's metadata
                return methodSymbol.metadata?.funcNode as AST.FuncStmtNode | null || null;
            }

            // Detect if base is a type identifier (for static access)
            private isStaticMemberAccess(baseExpr: AST.ExprNode): boolean {
                if (!baseExpr.is('Primary')) return false;

                const primary = baseExpr.getPrimary();
                if (!primary?.is('Ident')) return false;

                const ident = primary.getIdent();
                if (!ident) return false;

                const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);

                // Static access if it's a type definition (not an instance)
                return symbol?.kind === SymbolKind.Definition;
            }

            // Add static flag parameter
            private resolveMemberOnUnwrappedType(
                type: AST.TypeNode,
                access: AST.MemberAccessNode,
                symbol?: Symbol | null,
                isStaticAccess: boolean = false
            ): AST.TypeNode | null {
                if (type.isStruct()) {
                    return this.resolveStructMember(type, access, symbol || null, isStaticAccess);
                }

                if (type.isEnum()) {
                    return this.resolveEnumMember(type, access);
                }

                if (type.isErrset()) {
                    return this.resolveEnumMember(type, access);
                }

                if (type.isOptional()) {
                    const inner = type.getOptional()!.target;
                    const result = this.resolveMemberOnUnwrappedType(inner, access, symbol, isStaticAccess);
                    return result ? AST.TypeNode.asOptional(access.span, result) : null;
                }

                return null;
            }

            // Enhanced struct member resolution with static checks
            private resolveStructMember(
                structType: AST.TypeNode,
                access: AST.MemberAccessNode,
                baseSymbol: Symbol | null,
                isStaticAccess: boolean = false
            ): AST.TypeNode | null {
                const struct = structType.getStruct()!;
                const memberName = this.extractMemberName(access.target);
                if (!memberName) return null;

                let structScope: Scope | null = null;

                // PRIORITY 1: Use metadata scopeId (most reliable - unique per struct)
                if (struct.metadata?.scopeId !== undefined) {
                    try {
                        structScope = this.config.services.scopeManager.getScope(struct.metadata.scopeId as number);
                    } catch {
                        structScope = null;
                    }
                }

                // PRIORITY 2: Search by name only if metadata is missing
                if (!structScope && struct.name && struct.name !== 'Anonymous') {
                    // Search in CURRENT scope's children first (to find local Point, not imported Point)
                    const currentScope = this.config.services.scopeManager.getCurrentScope();
                    structScope = this.config.services.scopeManager.findChildScopeByNameFromId(
                        struct.name,
                        currentScope.id,
                        ScopeKind.Type
                    );

                    // Fall back to global search if not found locally
                    if (!structScope) {
                        structScope = this.config.services.scopeManager.findScopeByName(struct.name, ScopeKind.Type);
                    }
                }

                if (!structScope) {
                    this.reportError(
                        DiagCode.SYMBOL_NOT_FOUND,
                        `Cannot find scope for struct type`,
                        access.base.span
                    );
                    return null;
                }

                // Look up the member symbol from the struct scope (where visibility was collected)
                const memberSymbol = structScope.symbols.get(memberName);

                if (!memberSymbol) {
                    this.reportError(
                        DiagCode.SYMBOL_NOT_FOUND,
                        `Struct has no member '${memberName}'`,
                        access.target.span
                    );
                    return null;
                }

                // Check visibility using the COLLECTED symbol, not the AST
                if (memberSymbol.visibility.kind === 'Private') {
                    this.reportError(
                        DiagCode.SYMBOL_NOT_ACCESSIBLE,
                        `Cannot access private ${memberSymbol.kind === SymbolKind.Function ? 'method' : 'field'} '${memberName}' from outside struct`,
                        access.target.span
                    );
                    return null;
                }

                // Handle static vs instance access
                const isStaticField = memberSymbol.visibility.kind === 'Static';

                if (isStaticAccess && !isStaticField && memberSymbol.kind === SymbolKind.StructField) {
                    this.reportError(
                        DiagCode.INVALID_STATIC_ACCESS,
                        `Cannot access instance field '${memberName}' on type. Use an instance instead.`,
                        access.target.span
                    );
                    return null;
                }

                if (!isStaticAccess && isStaticField && memberSymbol.kind === SymbolKind.StructField) {
                    this.reportError(
                        DiagCode.INVALID_STATIC_ACCESS,
                        `Cannot access static field '${memberName}' on instance. Use '${struct.name}.${memberName}' instead.`,
                        access.target.span
                    );
                    return null;
                }

                return memberSymbol.type || null;
            }

            private validateMethodCall(
                call: AST.CallNode,
                methodSymbol: Symbol,
                structScope: Scope,
                baseExpr: AST.ExprNode
            ): AST.TypeNode | null {
                this.log('symbols', `Validating method call '${methodSymbol.name}' on struct instance`);

                if (!methodSymbol.type || !methodSymbol.type.isFunction()) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `'${methodSymbol.name}' is not a callable method`,
                        call.span
                    );
                    return null;
                }

                const funcType = methodSymbol.type.getFunction()!;

                if (funcType.params.length !== call.args.length) {
                    const code = funcType.params.length > call.args.length ?
                        DiagCode.TOO_FEW_ARGUMENTS : DiagCode.TOO_MANY_ARGUMENTS;

                    this.reportError(
                        code,
                        `Expected ${funcType.params.length} arguments, but got ${call.args.length}`,
                        call.span
                    );
                    return null;
                }

                // Validate arguments in CALLER'S scope, not struct scope
                // Arguments are expressions evaluated in the calling context
                for (let i = 0; i < funcType.params.length; i++) {
                    const paramType = funcType.params[i];
                    const arg = call.args[i];

                    const argType = this.inferExpressionTypeWithContext(arg, paramType);

                    if (!argType || !this.isTypeCompatible(paramType, argType)) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Argument type '${argType?.toString() ?? 'unknown'}' is not assignable to parameter type '${paramType.toString()}'`,
                            arg.span
                        );
                    }
                }

                return funcType.returnType || AST.TypeNode.asVoid(call.span);
            }

            private resolveEnumMember(enumType: AST.TypeNode, access: AST.MemberAccessNode): AST.TypeNode | null {
                const memberName = this.extractMemberName(access.target);
                if (!memberName) return null;

                // Handle enum types
                if (enumType.isEnum()) {
                    const enumDef = enumType.getEnum()!;
                    for (const variant of enumDef.variants) {
                        if (variant.ident.name === memberName) {
                            return variant.type || enumType;
                        }
                    }
                }

                // **FIXED**: Handle error types - use 'members' not 'variants'
                if (enumType.isErrset()) {
                    const errorType = enumType.getError()!;
                    for (const member of errorType.members) {
                        if (member.name === memberName) {
                            // Return an identifier type for the error member
                            return AST.TypeNode.asIdentifier(member.span, member.name);
                        }
                    }
                }

                this.reportError(
                    DiagCode.SYMBOL_NOT_FOUND,
                    `${enumType.isErrset() ? 'Error set' : 'enum'} has no variant '${memberName}'`,
                    access.target.span
                );
                return null;
            }

            // ===== SPECIAL EXPRESSIONS =====

            private inferAsType(asNode: AST.AsNode): AST.TypeNode | null {
                const sourceType = this.inferExpressionType(asNode.base);
                if (!sourceType) return null;

                if (!this.canConvertTypes(sourceType, asNode.type)) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot convert type '${sourceType.toString()}' to type '${asNode.type.toString()}'`,
                        asNode.span
                    );
                }

                return asNode.type;
            }

            private inferOrelseType(orelse: AST.OrelseNode): AST.TypeNode | null {
                const leftType = this.inferExpressionType(orelse.left);
                const rightType = this.inferExpressionType(orelse.right);

                if (!leftType) return rightType;
                if (!rightType) return leftType;

                // Handle ?T ?? null -> T | null (union type)
                if (leftType.isOptional()) {
                    const unwrapped = leftType.getOptional()!.target;

                    // If right side is null, return union of unwrapped type and null
                    if (rightType.isNull()) {
                        const result = AST.TypeNode.asUnion(orelse.span, [unwrapped, rightType]);
                        return result;
                    }

                    return unwrapped;
                }

                return leftType;
            }

            private inferRangeType(range: AST.RangeNode): AST.TypeNode | null {
                if (range.leftExpr) {
                    const leftType = this.inferExpressionType(range.leftExpr);
                    if (leftType && !this.isIntegerType(leftType)) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Range start must be integer type, got '${leftType.toString()}'`,
                            range.leftExpr.span
                        );
                    }
                }

                if (range.rightExpr) {
                    const rightType = this.inferExpressionType(range.rightExpr);
                    if (rightType && !this.isIntegerType(rightType)) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Range end must be integer type, got '${rightType.toString()}'`,
                            range.rightExpr.span
                        );
                    }
                }

                return null;
            }

            private inferTryType(tryNode: AST.TryNode): AST.TypeNode | null {
                const exprType = this.inferExpressionType(tryNode.expr);
                if (!exprType) return null;
                return exprType;
            }

            private inferCatchType(catchNode: AST.CatchNode): AST.TypeNode | null {
                const leftType = this.inferExpressionType(catchNode.leftExpr);

                const exprScope = this.config.services.scopeManager.findChildScopeByName('expr', ScopeKind.Expression);
                if (exprScope) {
                    this.config.services.contextTracker.withSavedState(() => {
                        this.config.services.scopeManager.withScope(exprScope.id, () => {
                            this.validateStmt(catchNode.rightStmt);
                        });
                    });
                }

                return leftType;
            }

            private inferIfType(ifNode: AST.IfNode): AST.TypeNode | null {
                const condType = this.inferExpressionType(ifNode.condExpr);
                if (condType && !condType.isBool()) {
                    this.log('verbose', `If condition has type ${condType.toString()}, expected bool`);
                }

                const exprScope = this.config.services.scopeManager.findChildScopeByName('expr', ScopeKind.Expression);
                if (exprScope) {
                    this.config.services.contextTracker.withSavedState(() => {
                        this.config.services.scopeManager.withScope(exprScope.id, () => {
                            this.validateStmt(ifNode.thenStmt);
                            if (ifNode.elseStmt) {
                                this.validateStmt(ifNode.elseStmt);
                            }
                        });
                    });
                } else {
                    this.validateStmt(ifNode.thenStmt);
                    if (ifNode.elseStmt) {
                        this.validateStmt(ifNode.elseStmt);
                    }
                }

                return null;
            }

            private inferSwitchType(switchNode: AST.SwitchNode): AST.TypeNode | null {
                this.inferExpressionType(switchNode.condExpr);
                this.validateSwitchExhaustiveness(switchNode);

                const exprScope = this.config.services.scopeManager.findChildScopeByName('expr', ScopeKind.Expression);

                for (const switchCase of switchNode.cases) {
                    if (switchCase.expr) {
                        this.inferExpressionType(switchCase.expr);
                    }
                    if (switchCase.stmt) {
                        if (exprScope) {
                            this.config.services.contextTracker.withSavedState(() => {
                                this.config.services.scopeManager.withScope(exprScope.id, () => {
                                    this.validateStmt(switchCase.stmt!);
                                });
                            });
                        } else {
                            this.validateStmt(switchCase.stmt);
                        }
                    }
                }

                if (switchNode.defCase) {
                    if (exprScope) {
                        this.config.services.contextTracker.withSavedState(() => {
                            this.config.services.scopeManager.withScope(exprScope.id, () => {
                                this.validateStmt(switchNode.defCase!.stmt);
                            });
                        });
                    } else {
                        this.validateStmt(switchNode.defCase.stmt);
                    }
                }

                return null;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── [5] Ident Level ──────────────────────────┐

            private resolveIdentifierType(type: AST.TypeNode): AST.TypeNode {
                if (!type.isIdent()) return type;

                const ident = type.getIdent()!;
                if (ident.builtin) return type;

                const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                if (symbol && symbol.type) {
                    return this.resolveIdentifierType(symbol.type);
                }

                return type;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── [6] Type Level ───────────────────────────┐

            private validateStructType(structType: AST.StructTypeNode, symbol: Symbol): void {
                let typeScope: Scope | null = null;

                if (structType.metadata?.scopeId !== undefined) {
                    try {
                        typeScope = this.config.services.scopeManager.getScope(structType.metadata.scopeId as number);
                    } catch {
                        typeScope = null;
                    }
                }

                if (!typeScope && structType.name && structType.name !== 'Anonymous') {
                    typeScope = this.config.services.scopeManager.findScopeByName(structType.name, ScopeKind.Type);
                }

                if (!typeScope) {
                    typeScope = this.config.services.scopeManager.findChildScopeByNameFromId(
                        symbol.name,
                        symbol.scope,
                        ScopeKind.Type
                    );
                }

                if (!typeScope) {
                    this.reportError(
                        DiagCode.INTERNAL_ERROR,
                        `Cannot find type scope for struct validation`,
                        structType.span
                    );
                    return;
                }

                this.config.services.contextTracker.withSavedState(() => {
                    this.config.services.scopeManager.withScope(typeScope!.id, () => {
                        for (const member of structType.members) {
                            if (member.isField()) {
                                const field = member.getField()!;

                                // Validate field visibility
                                if (field.visibility.kind === 'Static' && field.mutability.kind === 'Mutable') {
                                    this.reportError(  // Changed from reportWarning
                                        DiagCode.INVALID_VISIBILITY,
                                        `Struct field '${field.ident.name}' cannot be 'static'`,
                                        field.span
                                    );
                                    continue;  // Skip this field and continue with next
                                }

                                // Resolve field type
                                if (field.type) {
                                    this.resolveTypeNode(field.type);
                                }

                                // Validate field initializer
                                if (field.initializer) {
                                    const initType = this.inferExpressionType(field.initializer);

                                    if (field.type && initType) {
                                        // Use shared helper for array validation
                                        if (!this.validateArrayAssignment(
                                            field.type,
                                            initType,
                                            field.initializer.span,
                                            `Field '${field.ident.name}' initializer`
                                        )) {
                                            continue; // Skip to next field
                                        }

                                        if (!this.isTypeCompatible(field.type, initType)) {
                                            this.reportError(
                                                DiagCode.TYPE_MISMATCH,
                                                `Field '${field.ident.name}' initializer type '${initType.toString()}' doesn't match field type '${field.type.toString()}'`,
                                                field.initializer.span
                                            );
                                        }
                                    } else if (!field.type && initType) {
                                        field.type = initType;
                                    }

                                    // Check for overflow before compatibility check
                                    if(field.type) {
                                        this.validateValueFitsInType(field.initializer, field.type);
                                    } else if(initType) {
                                        this.validateValueFitsInType(field.initializer, initType);
                                    }
                                }
                            } else {
                                const method = member.getMethod()!;

                                // Validate method visibility
                                // Static methods are valid in structs
                                this.validateFuncStmt(method);
                            }
                        }
                    });
                });
            }

            private validateStructConstruction(
                objNode: AST.ObjectNode,
                structType: AST.TypeNode,
                initSpan: AST.Span
            ): boolean {
                if (!structType.isStruct()) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot initialize non-struct type with object literal`,
                        initSpan
                    );
                    return false;
                }

                const struct = structType.getStruct()!;

                // Validate constructor name matches type name
                if (objNode.ident) {
                    const constructorName = objNode.ident.name;
                    const expectedName = struct.name || this.extractTypeName(structType);

                    if (expectedName && constructorName !== expectedName) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Constructor '${constructorName}' does not match expected type '${expectedName}'`,
                            objNode.ident.span
                        );
                        return false;
                    }
                }

                // Build map of struct fields
                const structFields = new Map<string, AST.FieldNode>();
                for (const member of struct.members) {
                    if (member.isField()) {
                        const field = member.source as AST.FieldNode;
                        structFields.set(field.ident.name, field);
                    }
                }

                const providedFields = new Set<string>();

                // Validate each provided field
                for (const prop of objNode.props) {
                    const fieldName = prop.key.name;
                    providedFields.add(fieldName);

                    const structField = structFields.get(fieldName);
                    if (!structField) {
                        this.reportError(
                            DiagCode.SYMBOL_NOT_FOUND,
                            `Struct '${struct.name || '<anonymous>'}' has no field '${fieldName}'`,
                            prop.key.span
                        );
                        continue;
                    }

                    // Check if trying to initialize static field
                    if (structField.visibility.kind === 'Static') {
                        this.reportError(
                            DiagCode.INVALID_STATIC_ACCESS,
                            `Cannot initialize static field '${fieldName}' in constructor. Static fields belong to the type, not instances.`,
                            prop.key.span
                        );
                        continue;
                    }

                    // Validate field value type
                    if (prop.val && structField.type) {
                        const valueType = this.inferExpressionType(prop.val);

                        if (valueType && !this.isTypeCompatible(structField.type, valueType)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Field '${fieldName}' expects type '${structField.type.toString()}' but got '${valueType.toString()}'`,
                                prop.val.span
                            );
                        }
                    }
                }

                // Check for missing required fields (skip static fields)
                let hasMissingFields = false;
                for (const [fieldName, field] of structFields) {
                    // Skip static fields - they belong to the type, not instances
                    if (field.visibility.kind === 'Static') {
                        continue;
                    }

                    if (!providedFields.has(fieldName) && !field.initializer) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Missing required field '${fieldName}' in struct initialization`,
                            initSpan
                        );
                        hasMissingFields = true;
                    }
                }

                return !hasMissingFields;
            }

            private validateEnumType(enumType: AST.EnumTypeNode, symbol: Symbol): void {
                const typeScope = this.config.services.scopeManager.findChildScopeByName(symbol.name, ScopeKind.Type);
                if (!typeScope) return;

                this.config.services.contextTracker.withSavedState(() => {
                    this.config.services.scopeManager.withScope(typeScope.id, () => {
                        for (const variant of enumType.variants) {
                            if (variant.type) {
                                this.resolveTypeNode(variant.type);
                            }
                        }
                    });
                });
            }

            private validateArraySize(sizeExpr: AST.ExprNode): void {
                // Track errors before evaluation
                const errorCountBefore = this.config.services.diagnosticManager.length();

                // Try to evaluate the expression at compile-time
                const comptimeValue = this.ExpressionEvaluator.evaluateComptimeExpression(sizeExpr);

                // Check if evaluation added errors (type errors, overflow, etc.)
                const errorCountAfter = this.config.services.diagnosticManager.length();
                const evaluationFailed = errorCountAfter > errorCountBefore;

                // If evaluation failed (added errors), stop here - don't add more errors
                if (evaluationFailed) {
                    return;
                }

                // If evaluation returned null but didn't report errors, it's not a constant expression
                if (comptimeValue === null) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        'Array size must be a compile-time constant expression',
                        sizeExpr.span
                    );
                    return;
                }

                // Validate the computed size is positive
                if (comptimeValue <= BigInt(0)) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Array size must be positive, got ${comptimeValue}`,
                        sizeExpr.span
                    );
                    return;
                }

                // Check for reasonable size limits
                const MAX_ARRAY_SIZE = BigInt(2_147_483_647);
                if (comptimeValue > MAX_ARRAY_SIZE) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Array size ${comptimeValue} exceeds maximum allowed size ${MAX_ARRAY_SIZE}`,
                        sizeExpr.span
                    );
                    return;
                }
            }

            private validateSwitchExhaustiveness(switchNode: AST.SwitchNode): void {
                const condType = this.inferExpressionType(switchNode.condExpr);
                if (!condType) return;

                // Resolve identifier types first
                let resolvedType = condType;
                if (condType.isIdent()) {
                    const ident = condType.getIdent()!;
                    const typeSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                    if (typeSymbol && typeSymbol.type) {
                        resolvedType = typeSymbol.type;
                    }
                }

                // Handle enum exhaustiveness
                if (resolvedType.isEnum()) {
                    const enumType = resolvedType.getEnum()!;
                    const coveredVariants = new Set<string>();

                    for (const switchCase of switchNode.cases) {
                        if (switchCase.expr) {
                            const variantName = this.extractEnumVariantName(switchCase.expr);
                            if (variantName) {
                                coveredVariants.add(variantName);
                            }
                        }
                    }

                    // Check exhaustiveness only if no default case
                    if (!switchNode.defCase) {
                        const missingVariants: string[] = [];
                        for (const variant of enumType.variants) {
                            if (!coveredVariants.has(variant.ident.name)) {
                                missingVariants.push(variant.ident.name);
                            }
                        }

                        if (missingVariants.length > 0) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Switch is not exhaustive. Missing variants: ${missingVariants.join(', ')}`,
                                switchNode.span
                            );
                        }
                    }
                }

                // Handle boolean exhaustiveness
                if (resolvedType.isBool()) {
                    const hasTrue = switchNode.cases.some((c: AST.CaseNode) => this.isBoolLiteral(c.expr, true));
                    const hasFalse = switchNode.cases.some((c: AST.CaseNode) => this.isBoolLiteral(c.expr, false));

                    if (!switchNode.defCase && (!hasTrue || !hasFalse)) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            'Switch on boolean must handle both true and false cases or have a default',
                            switchNode.span
                        );
                    }
                }
            }

            private validateArrayAssignment(
                declaredType: AST.TypeNode,
                initType: AST.TypeNode,
                initSpan: AST.Span,
                contextName: string
            ): boolean {
                if (!declaredType.isArray() || !initType.isArray()) {
                    return true; // Not an array assignment, validation not applicable
                }

                const targetArray = declaredType.getArray()!;
                const sourceArray = initType.getArray()!;

                if (!targetArray.size || !sourceArray.size) {
                    return true; // No size constraints to validate
                }

                const targetSize = this.ExpressionEvaluator.extractIntegerValue(targetArray.size);
                const sourceSize = this.ExpressionEvaluator.extractIntegerValue(sourceArray.size);

                if (targetSize === undefined || sourceSize === undefined) {
                    return true; // Cannot extract sizes, skip validation
                }

                if (targetSize !== sourceSize) {
                    const msg = sourceSize > targetSize
                        ? `Array literal has more elements than the fixed array type`
                        : `Array literal has fewer elements than the fixed array type`;

                    this.reportError(
                        DiagCode.ARRAY_SIZE_MISMATCH,
                        `${msg}`,
                        initSpan
                    );
                    return false; // Validation failed
                }

                return true; // Sizes match, validation passed
            }

            private checkCircularTypeDependency(
                typeNode: AST.TypeNode,
                typeName: string,
                allowIndirection: boolean = false,
                pathHasIndirection: boolean = false
            ): boolean {
                const key = `${typeName}:${typeNode.kind}:${typeNode.span.start}`;

                if (this.circularTypeDetectionStack.has(key)) {
                    if (!pathHasIndirection) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Circular type dependency detected for '${typeName}'. Use pointer or optional to break the cycle.`,
                            typeNode.span
                        );
                        return true;
                    }
                    return false;
                }

                this.circularTypeDetectionStack.add(key);

                try {
                    switch (typeNode.kind) {
                        case 'ident': {
                            const ident = typeNode.getIdent()!;
                            if (!ident.builtin && ident.name === typeName) {
                                if (!pathHasIndirection) {
                                    this.reportError(
                                        DiagCode.TYPE_MISMATCH,
                                        `Direct self-reference in type '${typeName}'. Use pointer or optional to break the cycle.`,
                                        typeNode.span
                                    );
                                    return true;
                                }
                                return false;
                            }

                            if (!ident.builtin) {
                                const typeSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                                if (typeSymbol && typeSymbol.type && typeSymbol.kind === SymbolKind.Definition) {
                                    return this.checkCircularTypeDependency(
                                        typeSymbol.type,
                                        typeName,
                                        allowIndirection,
                                        pathHasIndirection
                                    );
                                }
                            }
                            break;
                        }

                        case 'array':
                            return this.checkCircularTypeDependency(
                                typeNode.getArray()!.target,
                                typeName,
                                allowIndirection,
                                pathHasIndirection
                            );

                        case 'optional':
                        case 'pointer':
                            if (allowIndirection) {
                                return false;
                            }
                            return this.checkCircularTypeDependency(
                                typeNode.kind === 'optional'
                                    ? typeNode.getOptional()!.target
                                    : typeNode.getPointer()!.target,
                                typeName,
                                allowIndirection,
                                true
                            );

                        case 'tuple':
                            for (const field of typeNode.getTuple()!.fields) {
                                if (this.checkCircularTypeDependency(
                                    field,
                                    typeName,
                                    allowIndirection,
                                    pathHasIndirection
                                )) {
                                    return true;
                                }
                            }
                            break;

                        case 'struct': {
                            const struct = typeNode.getStruct()!;
                            for (const member of struct.members) {
                                if (member.isField()) {
                                    const field = member.source as AST.FieldNode;
                                    if (field.type && this.checkCircularTypeDependency(
                                        field.type,
                                        typeName,
                                        allowIndirection,
                                        pathHasIndirection
                                    )) {
                                        return true;
                                    }
                                }
                            }
                            break;
                        }

                        case 'enum': {
                            const enumType = typeNode.getEnum()!;
                            for (const variant of enumType.variants) {
                                if (variant.type && this.checkCircularTypeDependency(
                                    variant.type,
                                    typeName,
                                    allowIndirection,
                                    pathHasIndirection
                                )) {
                                    return true;
                                }
                            }
                            break;
                        }

                        case 'union': {
                            const unionType = typeNode.getUnion()!;
                            for (const member of unionType.types) {
                                if (this.checkCircularTypeDependency(
                                    member,
                                    typeName,
                                    allowIndirection,
                                    pathHasIndirection
                                )) {
                                    return true;
                                }
                            }
                            break;
                        }

                        case 'paren': {
                            return this.checkCircularTypeDependency(
                                typeNode.getParen()!.type,
                                typeName,
                                allowIndirection,
                                pathHasIndirection
                            )
                        }
                    }

                    return false;
                } finally {
                    this.circularTypeDetectionStack.delete(key);
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private isTypeCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean {
                this.stats.compatibilityChecks++;

                // any accepts everything
                if (this.isAnyType(target)) return true;

                // anyerror accepts any error type or error member
                if (this.isAnyErrorType(target)) {
                    // Accept any error type or error member identifier
                    if (this.isErrorType(source)) {
                        return true;
                    }

                    // Check if source is an error member (identifier that resolves to error)
                    if (source.isIdent()) {
                        const sourceIdent = source.getIdent()!;
                        const sourceSymbol = this.config.services.scopeManager.lookupSymbol(sourceIdent.name);

                        // If it's an error member, it's compatible with anyerror
                        if (sourceSymbol && sourceSymbol.kind === SymbolKind.Error) {
                            return true;
                        }
                    }

                    return false;
                }

                if (this.isSameType(target, source)) return true;

                const resolvedTarget = this.resolveIdentifierType(target);
                const resolvedSource = this.resolveIdentifierType(source);

                if (this.isSameType(resolvedTarget, resolvedSource)) return true;

                // Handle error member to anyerror conversion
                if (this.isAnyErrorType(resolvedTarget)) {
                    if (this.isErrorType(resolvedSource)) {
                        return true;
                    }

                    // Check if resolved source is an error member
                    if (resolvedSource.isIdent()) {
                        const ident = resolvedSource.getIdent()!;
                        const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                        if (symbol && symbol.kind === SymbolKind.Error) {
                            return true;
                        }
                    }

                    return false;
                }

                // Bool is NOT compatible with numeric types
                if (resolvedSource.isBool() && this.isNumericType(resolvedTarget)) {
                    return false;
                }

                if (this.isNumericType(resolvedTarget) && this.isNumericType(resolvedSource)) {
                    return this.areNumericTypesCompatible(resolvedTarget, resolvedSource);
                }

                // Handle union-to-union compatibility
                if (resolvedTarget.isUnion() && resolvedSource.isUnion()) {
                    const targetUnion = resolvedTarget.getUnion()!;
                    const sourceUnion = resolvedSource.getUnion()!;

                    // Every type in source must be compatible with at least one type in target
                    return sourceUnion.types.every((sourceType: AST.TypeNode) =>
                        targetUnion.types.some((targetType: AST.TypeNode) =>
                            this.isTypeCompatible(targetType, sourceType)
                        )
                    );
                }

                if (resolvedTarget.isOptional()) {
                    if (resolvedSource.isNull() || resolvedSource.isUndefined()) return true;
                    const targetInner = resolvedTarget.getOptional()!.target;
                    return this.isTypeCompatible(targetInner, source);
                }

                if (resolvedTarget.isArray() && resolvedSource.isArray()) {
                    return this.areArrayTypesCompatible(resolvedTarget, resolvedSource);
                }

                if (resolvedTarget.isPointer()) {
                    if (resolvedSource.isNull()) return true;
                    if (resolvedSource.isPointer()) {
                        return this.arePointerTypesCompatible(resolvedTarget, resolvedSource);
                    }
                }

                if (resolvedTarget.isTuple() && resolvedSource.isTuple()) {
                    return this.areTupleTypesCompatible(resolvedTarget, resolvedSource);
                }

                if (resolvedTarget.isStruct() && resolvedSource.isStruct()) {
                    return this.areStructTypesCompatible(resolvedTarget, resolvedSource);
                }

                if (resolvedTarget.isEnum() && resolvedSource.isEnum()) {
                    return this.isSameType(resolvedTarget, resolvedSource);
                }

                if (resolvedTarget.isUnion()) {
                    const unionType = resolvedTarget.getUnion()!;
                    return unionType.types.some((type: AST.TypeNode) => this.isTypeCompatible(type, source));
                }

                // Handle optional-to-union conversion
                // ?T is compatible with T | null
                if (resolvedSource.isOptional()) {
                    const sourceInner = resolvedSource.getOptional()!.target;

                    // If target is union, check if it contains both the inner type and null
                    if (resolvedTarget.isUnion()) {
                        const unionType = resolvedTarget.getUnion()!;
                        const hasInnerType = unionType.types.some((t: AST.TypeNode) =>
                            this.isTypeCompatible(t, sourceInner)
                        );
                        const hasNull = unionType.types.some((t: AST.TypeNode) => t.isNull());
                        return hasInnerType && hasNull;
                    }
                }

                return false;
            }

            private isNumericType(type: AST.TypeNode): boolean {
                // Exclude 'type' primitive
                if (this.isTypeType(type)) {
                    return false;
                }

                return type.isFloat() || type.isSigned() || type.isUnsigned() ||
                       type.isComptimeInt() || type.isComptimeFloat();
            }

            private isAnyType(type: AST.TypeNode): boolean {
                if (!type.isPrimitive()) return false;
                const prim = type.getPrimitive();
                return prim?.kind === 'any';
            }

            private isIntegerType(type: AST.TypeNode): boolean {
                return type.isSigned() || type.isUnsigned() || type.isComptimeInt();
            }

            private isStringType(type: AST.TypeNode): boolean {
                if (!type.isArray()) return false;
                const arrayType = type.getArray()!;
                const elemType = arrayType.target;
                return elemType.isUnsigned() && elemType.getWidth() === 8;
            }

            private isAnyErrorType(type: AST.TypeNode): boolean {
                if (!type.isPrimitive()) return false;
                const prim = type.getPrimitive();
                return prim?.kind === 'err';
            }

            private isErrorType(type: AST.TypeNode): boolean {
                // Direct error set: error{A, B, C}
                if (type.isErrset()) {
                    return true;
                }

                // Error identifier: check if it resolves to an error type
                if (type.isIdent()) {
                    const ident = type.getIdent()!;

                    // Check if it's anyerror
                    if (ident.name === 'anyerror') {
                        return true;
                    }

                    // Try to lookup symbol in current scope chain
                    const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);

                    if (symbol) {
                        // Check if it's an Error symbol (member of error set)
                        if (symbol.kind === SymbolKind.Error) {
                            return true;
                        }

                        // Check if it's an error type definition
                        if (symbol.type && symbol.type.isErrset()) {
                            return true;
                        }
                    }

                    // If not found in current scope chain, check ALL scopes
                    // This handles error members that are in their parent error type's scope
                    const allScopes = this.config.services.scopeManager.getAllScopes();
                    for (const scope of allScopes) {
                        const scopeSymbol = scope.symbols.get(ident.name);
                        if (scopeSymbol && scopeSymbol.kind === SymbolKind.Error) {
                            return true;
                        }
                    }
                }

                return false;
            }

            private isSameType(type1: AST.TypeNode, type2: AST.TypeNode): boolean {
                if (type1 === type2) return true;
                if (type1.kind !== type2.kind) return false;

                switch (type1.kind) {
                    case 'primitive':
                        const prim1 = type1.getPrimitive()!;
                        const prim2 = type2.getPrimitive()!;
                        return prim1.kind === prim2.kind && prim1.width === prim2.width;

                    case 'array':
                        const arr1 = type1.getArray()!;
                        const arr2 = type2.getArray()!;
                        return this.isSameType(arr1.target, arr2.target);

                    case 'pointer':
                        const ptr1 = type1.getPointer()!;
                        const ptr2 = type2.getPointer()!;
                        return this.isSameType(ptr1.target, ptr2.target) && ptr1.mutable === ptr2.mutable;

                    case 'paren':
                        return this.isSameType(type1.getParen()!.type, type2.getParen()!.type);

                    case 'optional':
                        const opt1 = type1.getOptional()!;
                        const opt2 = type2.getOptional()!;
                        return this.isSameType(opt1.target, opt2.target);

                    case 'tuple':
                        const tup1 = type1.getTuple()!;
                        const tup2 = type2.getTuple()!;
                        if (tup1.fields.length !== tup2.fields.length) return false;
                        return tup1.fields.every((f: AST.TypeNode, i: number) => this.isSameType(f, tup2.fields[i]));

                    case 'function':
                        const func1 = type1.getFunction()!;
                        const func2 = type2.getFunction()!;
                        if (func1.params.length !== func2.params.length) return false;
                        if (!func1.params.every((p: AST.TypeNode, i: number) => this.isSameType(p, func2.params[i]))) return false;
                        const ret1 = func1.returnType;
                        const ret2 = func2.returnType;
                        if (ret1 && ret2) return this.isSameType(ret1, ret2);
                        return ret1 === ret2;

                    case 'ident':
                        const id1 = type1.getIdent()!;
                        const id2 = type2.getIdent()!;
                        return id1.name === id2.name;

                    default:
                        return false;
                }
            }

            private promoteNumericTypes(type1: AST.TypeNode, type2: AST.TypeNode, span?: AST.Span): AST.TypeNode {
                if (type1.isComptimeInt() && this.isNumericType(type2)) return type2;
                if (type2.isComptimeInt() && this.isNumericType(type1)) return type1;
                if (type1.isComptimeFloat() && type2.isFloat()) return type2;
                if (type2.isComptimeFloat() && type1.isFloat()) return type1;

                if (type1.isFloat() || type2.isFloat()) {
                    const width1 = type1.getWidth() ?? 32;
                    const width2 = type2.getWidth() ?? 32;
                    const maxWidth = Math.max(width1, width2);
                    return AST.TypeNode.asFloat(span, `f${maxWidth}`, maxWidth);
                }

                const width1 = type1.getWidth() ?? 32;
                const width2 = type2.getWidth() ?? 32;
                const maxWidth = Math.max(width1, width2);

                if (type1.isSigned() || type2.isSigned()) {
                    return AST.TypeNode.asSigned(span, `i${maxWidth}`, maxWidth);
                }

                return AST.TypeNode.asUnsigned(span, `u${maxWidth}`, maxWidth);
            }

            private computeUnaryResultType(operandType: AST.TypeNode, isNegation: boolean, span?: AST.Span): AST.TypeNode {
                if (operandType.isComptimeInt()) {
                    const prim = operandType.getPrimitive();
                    const txtStr = prim?.text !== undefined ? String(prim.text) : 'cint';
                    const resultText = isNegation ?
                        (txtStr.startsWith('-') ? txtStr.slice(1) : `-${txtStr}`) : txtStr;
                    return AST.TypeNode.asComptimeInt(span, resultText);
                }

                if (operandType.isUnsigned() && isNegation) {
                    const width = operandType.getWidth() ?? 32;
                    return AST.TypeNode.asSigned(span, `i${width}`, width);
                }

                return operandType;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private arePointerTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean {
                const targetPtr = target.getPointer()!;
                const sourcePtr = source.getPointer()!;

                const baseCompatible = targetPtr.target.isOptional() ?
                    this.isSameType(targetPtr.target.getOptional()!.target, sourcePtr.target) :
                    this.isSameType(targetPtr.target, sourcePtr.target);

                if (!baseCompatible) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot assign '${source.toString()}' to variable of type '${target.toString()}'`,
                        source.span
                    );
                    return false;
                }

                if (targetPtr.mutable && !sourcePtr.mutable) {
                    this.reportError(
                        DiagCode.MUTABILITY_MISMATCH,
                        `Cannot assign immutable pointer to mutable pointer variable`,
                        source.span
                    );
                    return false;
                }

                // Check base type compatibility first
                if (!this.isTypeCompatible(targetPtr.target, sourcePtr.target)) {
                    return false;
                }

                // Cannot assign immutable pointer to mutable pointer variable
                if (targetPtr.mutable && !sourcePtr.mutable) {
                    // Don't report here - let caller handle error
                    return false;
                }

                return true;
            }

            private areTupleTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean {
                const targetTuple = target.getTuple()!;
                const sourceTuple = source.getTuple()!;

                if (targetTuple.fields.length !== sourceTuple.fields.length) {
                    return false;
                }

                for (let i = 0; i < targetTuple.fields.length; i++) {
                    if (!this.isTypeCompatible(targetTuple.fields[i], sourceTuple.fields[i])) {
                        return false;
                    }
                }

                return true;
            }

            private areStructTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean {
                const targetStruct = target.getStruct()!;
                const sourceStruct = source.getStruct()!;

                if (targetStruct.metadata?.scopeId !== undefined &&
                    sourceStruct.metadata?.scopeId !== undefined) {
                    return targetStruct.metadata.scopeId === sourceStruct.metadata.scopeId;
                }

                if (targetStruct.name && targetStruct.name !== 'Anonymous' &&
                    sourceStruct.name && sourceStruct.name !== 'Anonymous') {
                    return targetStruct.name === sourceStruct.name;
                }

                return this.areStructsStructurallyCompatible(targetStruct, sourceStruct);
            }

            private areStructsStructurallyCompatible(
                target: AST.StructTypeNode,
                source: AST.StructTypeNode
            ): boolean {
                const targetFields = new Map<string, AST.FieldNode>();
                const sourceFields = new Map<string, AST.FieldNode>();

                for (const member of target.members) {
                    if (member.isField()) {
                        const field = member.source as AST.FieldNode;
                        targetFields.set(field.ident.name, field);
                    }
                }

                for (const member of source.members) {
                    if (member.isField()) {
                        const field = member.source as AST.FieldNode;
                        sourceFields.set(field.ident.name, field);
                    }
                }

                for (const [fieldName, targetField] of targetFields) {
                    const sourceField = sourceFields.get(fieldName);

                    if (!sourceField) {
                        return false;
                    }

                    if (targetField.type && sourceField.type) {
                        if (!this.isTypeCompatible(targetField.type, sourceField.type)) {
                            return false;
                        }
                    }
                }

                return true;
            }

            private areNumericTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean {
                // Booleans are NOT numeric types
                if (source.isBool() || target.isBool()) {
                    return false;
                }

                if (source.isComptimeInt() && target.isUnsigned()) {
                    const prim = source.getPrimitive();
                    const txtStr = prim?.text !== undefined ? String(prim.text) : '0';
                    try {
                        const value = BigInt(txtStr);
                        if (value < BigInt(0)) {
                            return false;
                        }
                    } catch {
                        return false;
                    }
                }

                if (source.isComptimeInt() || source.isComptimeFloat()) {
                    return true;
                }

                return true;
            }

            private areArrayTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean {
                const targetArray = target.getArray()!;
                const sourceArray = source.getArray()!;

                // Allow empty array to match any type
                if (sourceArray.target.isUndefined()) {
                    return true;
                }

                // Check element type compatibility
                if (!this.isTypeCompatible(targetArray.target, sourceArray.target)) {
                    return false;
                }

                // Check size compatibility (don't report error here - done in validateLetStmt)
                if (targetArray.size && sourceArray.size) {
                    const targetSize = this.ExpressionEvaluator.extractIntegerValue(targetArray.size);
                    const sourceSize = this.ExpressionEvaluator.extractIntegerValue(sourceArray.size);

                    if (targetSize !== undefined && sourceSize !== undefined) {
                        return targetSize === sourceSize;
                    }
                }

                return true;
            }

            private canConvertTypes(source: AST.TypeNode, target: AST.TypeNode): boolean {
                if (source.isIdent()) {
                    const sourceSymbol = this.config.services.scopeManager.lookupSymbol(source.getIdent()!.name);
                    if (sourceSymbol && sourceSymbol.type) {
                        source = sourceSymbol.type;
                    } else {
                        return false;
                    }
                }
                if (target.isIdent()) {
                    const targetSymbol = this.config.services.scopeManager.lookupSymbol(target.getIdent()!.name);
                    if (targetSymbol && targetSymbol.type) {
                        target = targetSymbol.type;
                    } else {
                        return false;
                    }
                }

                if (this.isSameType(source, target)) return true;

                if (this.isNumericType(source) && this.isNumericType(target)) return true;

                if (source.isComptimeInt() && this.isNumericType(target)) return true;
                if (source.isComptimeFloat() && target.isFloat()) return true;

                if (source.isPointer() && target.isPointer()) return true;

                if (this.isIntegerType(source) && target.isPointer()) return true;

                if (source.isEnum() && this.isIntegerType(target)) return true;

                return false;
            }

            private validateValueFitsInType(expr: AST.ExprNode, targetType: AST.TypeNode): void {
                // Only check for integer/float literals and compile-time constants
                const value = this.ExpressionEvaluator.evaluateComptimeExpression(expr, targetType);

                if (value === null) {
                    // Not a compile-time constant, can't check overflow statically
                    return;
                }

                // Get the bounds for the target type
                const bounds = this.getTypeBounds(targetType);

                // Check if value fits in range
                if (value < bounds.min || value > bounds.max) {
                    this.reportError(
                        DiagCode.ARITHMETIC_OVERFLOW,
                        `Value ${value} does not fit in type '${targetType.toString()}' (valid range: ${bounds.min} to ${bounds.max})`,
                        expr.span
                    );
                }
            }

            private getTypeBounds(type: AST.TypeNode): { min: bigint; max: bigint } {
                if (type.isSigned()) {
                    const width = type.getWidth() || 64;
                    if (width === 64) {
                        return {
                            min: BigInt('-9223372036854775808'),
                            max: BigInt('9223372036854775807')
                        };
                    }
                    const max = BigInt(2) ** BigInt(width - 1) - BigInt(1);
                    const min = -(BigInt(2) ** BigInt(width - 1));
                    return { min, max };
                }

                if (type.isUnsigned()) {
                    const width = type.getWidth() || 64;
                    const max = BigInt(2) ** BigInt(width) - BigInt(1);
                    return { min: BigInt(0), max };
                }

                // For other types, use full range
                return {
                    min: BigInt('-9223372036854775808'),
                    max: BigInt('9223372036854775807')
                };
            }

            private isValidThrowType(thrownType: AST.TypeNode, functionErrorType: AST.TypeNode, span: AST.Span): boolean {
                // Direct type match
                if (this.isSameType(thrownType, functionErrorType)) {
                    return true;
                }

                // **CASE 1**: Function error type is an error set
                if (functionErrorType.isErrset()) {
                    const errorSet = functionErrorType.getError()!;

                    // Check if thrown type is a member of the error set
                    if (thrownType.isIdent()) {
                        const thrownIdent = thrownType.getIdent()!;
                        const isMember = errorSet.members.some(member => member.name === thrownIdent.name);

                        if (isMember) {
                            return true;
                        }
                    }

                    return false;
                }

                // **CASE 2**: Function error type is an identifier (e.g., MyError)
                if (functionErrorType.isIdent()) {
                    const funcErrorIdent = functionErrorType.getIdent()!;

                    // Look up the actual error type definition
                    const errorSymbol = this.config.services.scopeManager.lookupSymbol(funcErrorIdent.name);
                    if (errorSymbol && errorSymbol.type && errorSymbol.type.isErrset()) {
                        const errorSet = errorSymbol.type.getError()!;

                        // Check if thrown type is a member
                        if (thrownType.isIdent()) {
                            const thrownIdent = thrownType.getIdent()!;
                            return errorSet.members.some(member => member.name === thrownIdent.name);
                        }
                    }
                }

                // Handle when thrown type is an error member identifier
                // and function expects anyerror or a broader error type
                if (thrownType.isIdent()) {
                    const thrownIdent = thrownType.getIdent()!;
                    const thrownSymbol = this.config.services.scopeManager.lookupSymbol(thrownIdent.name);

                    // If it's an error member, check if function accepts it
                    if (thrownSymbol && thrownSymbol.kind === SymbolKind.Error) {
                        // If function error type is anyerror, accept it
                        if (this.isAnyErrorType(functionErrorType)) {
                            return true;
                        }

                        // Otherwise, need to verify it's part of the allowed error set
                        return this.isErrorMemberOfType(thrownIdent.name, functionErrorType);
                    }
                }

                return false;
            }

            private isErrorMemberOfType(memberName: string, errorType: AST.TypeNode): boolean {
                // Resolve the error type if it's an identifier
                const resolvedType = this.resolveIdentifierType(errorType);

                if (resolvedType.isErrset()) {
                    const errorSet = resolvedType.getError()!;
                    return errorSet.members.some(member => member.name === memberName);
                }

                return false;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private extractTypeFromInitializer(expr: AST.ExprNode): AST.TypeNode | null {
                if (expr.kind !== 'Primary') return null;

                const primary = expr.getPrimary();
                if (!primary || primary.kind !== 'Type') return null;

                return primary.getType();
            }

            private extractSymbolFromExpression(expr: AST.ExprNode): Symbol | null {
                if (expr.is('Primary')) {
                    const primary = expr.getPrimary();
                    if (primary?.is('Ident')) {
                        const ident = primary.getIdent();
                        if (ident) {
                            return this.config.services.scopeManager.lookupSymbol(ident.name);
                        }
                    }
                }
                return null;
            }

            private extractBuiltinName(expr: AST.ExprNode): string | null {
                if (expr.kind !== 'Primary') return null;
                const primary = expr.getPrimary();
                if (!primary || primary.kind !== 'Ident') return null;
                const ident = primary.getIdent();
                return (ident?.name ? '@'+ident.name : null) || null;
            }

            private extractMemberName(memberExpr: AST.ExprNode): string | null {
                switch (memberExpr.kind) {
                    case 'Primary': {
                        const src = memberExpr.getPrimary()!;
                        if (src.kind === 'Ident') {
                            return src.getIdent()!.name;
                        }
                        return null;
                    }

                    case 'Prefix': {
                        const src = memberExpr.getPrefix()!;
                        return this.extractMemberName(src.expr);
                    }

                    case 'Postfix': {
                        const src = memberExpr.getPostfix()!;

                        switch (src.kind) {
                            case 'MemberAccess': {
                                const access = src.getMemberAccess()!;
                                return this.extractMemberName(access.target);
                            }

                            case 'Call': {
                                const call = src.getCall()!;
                                return this.extractMemberName(call.base);
                            }

                            case 'ArrayAccess': {
                                const index = src.getArrayAccess()!;
                                return this.extractMemberName(index.base);
                            }

                            case 'Increment':
                            case 'Decrement':
                            case 'Dereference': {
                                return this.extractMemberName(src.getAsExprNode()!);
                            }

                            default:
                                return null;
                        }
                    }

                    case 'Binary':
                    case 'As':
                    case 'Orelse':
                    case 'Range':
                    case 'Try':
                    case 'Catch':
                    case 'If':
                    case 'Switch':
                    case 'Typeof':
                    case 'Sizeof':
                        return null;

                    default:
                        this.log('verbose', `Cannot extract member name from expression kind: ${memberExpr.kind}`);
                        return null;
                }
            }

            private extractEnumVariantName(expr: AST.ExprNode): string | null {
                if (expr.is('Postfix')) {
                    const postfix = expr.getPostfix();
                    if (postfix?.kind === 'MemberAccess') {
                        const access = postfix.getMemberAccess()!;
                        return this.extractMemberName(access.target);
                    }
                }
                return null;
            }

            private extractTypeName(typeNode: AST.TypeNode): string | null {
                if (typeNode.isIdent()) {
                    return typeNode.getIdent()!.name;
                }
                if (typeNode.isStruct()) {
                    return typeNode.getStruct()!.name || null;
                }
                return null;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private findModuleScope(moduleName: string): Scope | null {
                const moduleScope = this.config.services.scopeManager.findScopeByName(moduleName, ScopeKind.Module);
                if (!moduleScope) {
                    this.reportError(DiagCode.MODULE_SCOPE_NOT_FOUND, `Module scope for '${moduleName}' not found`);
                }
                return moduleScope;
            }

            private findCallTargetSymbol(baseExpr: AST.ExprNode, objectScope?: Scope): Symbol | undefined {
                if (baseExpr.kind === 'Primary') {
                    const primary = baseExpr.getPrimary()!;

                    if (primary.kind === 'Ident') {
                        const ident = primary.getIdent();
                        if (ident) {
                            const s = objectScope
                            ? this.config.services.scopeManager.lookupSymbolInScopeChain(ident.name, objectScope.id)
                            : this.config.services.scopeManager.lookupSymbol(ident.name) ?? undefined;
                            return s ?? undefined;
                        }
                    }
                }

                return undefined;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private isBuiltinFunction(baseExpr: AST.ExprNode): boolean {
                if (baseExpr.isIdent()) {
                    const ident = baseExpr.getIdent();
                    return ident?.builtin === true || (ident?.name.startsWith('@') === true);
                }

                return false;
            }

            private isInsideFunctionScope(): boolean {
                let currentScope = this.config.services.scopeManager.getCurrentScope();

                while (currentScope) {
                    if (currentScope.kind === ScopeKind.Function) {
                        return true;
                    }

                    // Don't stop at Type scopes - they can contain methods
                    // Only stop at Module boundaries
                    if (currentScope.kind === ScopeKind.Module || currentScope.kind === ScopeKind.Global) {
                        return false;
                    }

                    // Walk up the scope chain
                    if (currentScope.parent !== null) {
                        try {
                            currentScope = this.config.services.scopeManager.getScope(currentScope.parent);
                        } catch {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }

                return false;
            }

            private isAccessibleFrom(targetScope: Scope): boolean {
                const currentScope = this.config.services.scopeManager.getCurrentScope();

                let current: Scope | null = currentScope;
                let target: Scope | null = targetScope;

                while (current && current.kind !== ScopeKind.Module) {
                    current = current.parent !== null ? this.config.services.scopeManager.getScope(current.parent) : null;
                }

                while (target && target.kind !== ScopeKind.Module) {
                    target = target.parent !== null ? this.config.services.scopeManager.getScope(target.parent) : null;
                }

                return current?.id === target?.id;
            }

            private isBoolLiteral(expr: AST.ExprNode | undefined, value: boolean): boolean {
                if (!expr || !expr.is('Primary')) return false;

                const primary = expr.getPrimary();
                if (!primary?.is('Literal')) return false;

                const literal = primary.getLiteral();
                return literal?.kind === 'Bool' && literal.value === value;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private createCacheKey(expr: AST.ExprNode): string {
                const moduleName = this.config.services.contextTracker.getModuleName() || 'unknown';
                const span = expr.span || { start: 0, end: 0 };
                return `${moduleName}:${span.start}:${span.end}:${expr.kind}`;
            }

            private cacheType(key: string, type: AST.TypeNode): void {
                if (this.typeCtx.typeCache.size >= this.CACHE_MAX_SIZE) {
                    const entries = Array.from(this.typeCtx.typeCache.entries());
                    const toKeep = entries.slice(-Math.floor(this.CACHE_MAX_SIZE / 2));
                    this.typeCtx.typeCache.clear();
                    toKeep.forEach(([k, v]) => this.typeCtx.typeCache.set(k, v));
                }

                this.typeCtx.typeCache.set(key, type || null);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private init(): boolean {
                this.config.services.contextTracker.reset();
                this.config.services.contextTracker.setPhase(AnalysisPhase.TypeValidation);

                const globalScope = this.config.services.scopeManager.getGlobalScope();
                this.config.services.scopeManager.setCurrentScope(globalScope.id);
                this.config.services.contextTracker.setScope(globalScope.id);

                this.log('verbose', 'Type validation initialized');
                return true;
            }

            private initStats(): TypeValidationStats {
                return {
                    modulesProcessed        : 0,
                    typesInferred           : 0,
                    typesCached             : 0,
                    compatibilityChecks     : 0,
                    callsValidated          : 0,
                    memberAccessValidated   : 0,
                    assignmentsValidated    : 0,
                    returnsValidated        : 0,
                    errors                  : 0,
                    startTime               : Date.now()
                };
            }

            private initTypeValidatorContext(): TypeValidatorContext {
                return {
                    currentModule   : '',
                    moduleStack     : [],
                    typeCache       : new Map(),
                };
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            logStatistics(): void {
                const duration = Date.now() - this.stats.startTime;
                this.log('verbose',
                    `Type Validation Statistics :\n` +
                    `  Duration                 : ${duration}ms\n` +
                    `  Types inferred           : ${this.stats.typesInferred}\n` +
                    `  Types cached             : ${this.stats.typesCached}\n` +
                    `  Compatibility checks     : ${this.stats.compatibilityChecks}\n` +
                    `  Calls validated          : ${this.stats.callsValidated}\n` +
                    `  Member access validated  : ${this.stats.memberAccessValidated}\n` +
                    `  Assignments validated    : ${this.stats.assignmentsValidated}\n` +
                    `  Returns validated        : ${this.stats.returnsValidated}\n` +
                    `  Cache size               : ${this.typeCtx.typeCache.size}\n` +
                    `  Errors                   : ${this.stats.errors}`
                );
            }

        // └──────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝