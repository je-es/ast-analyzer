import * as AST from '@je-es/ast';
import { Span } from '@je-es/ast';

declare class IdGenerator {
    private counter;
    next(): number;
    reset(): void;
    current(): number;
}

type DebugKind = 'off' | 'errors' | 'symbols' | 'scopes' | 'nodes' | 'verbose';
declare class DebugManager {
    private debugLevel;
    private indentLevel;
    private contextTracker?;
    constructor(contextTracker?: ContextTracker, debugLevel?: DebugKind);
    reset(): void;
    log(level: DebugKind, message: string): void;
    increaseIndent(): void;
    decreaseIndent(): void;
    setDebugLevel(level: DebugKind): void;
    private getDebugPrefix;
}

type ScopeId = number;
type SymbolId = number;
declare enum ScopeKind {
    Global = "Global",
    Module = "Module",
    Function = "Function",
    Loop = "Loop",
    Block = "Block",
    Expression = "Expression",
    Type = "Type"
}
declare enum SymbolKind$1 {
    Use = "Use",
    Definition = "Definition",
    Variable = "Variable",
    Function = "Function",
    Parameter = "Parameter",
    StructField = "StructField",
    EnumVariant = "EnumVariant",
    Error = "Error"
}
interface Scope {
    id: ScopeId;
    kind: ScopeKind;
    name: string;
    parent: ScopeId | null;
    children: ScopeId[];
    symbols: Map<string, Symbol>;
    level: number;
    metadata?: Record<string, unknown>;
}
interface Symbol {
    id: SymbolId;
    name: string;
    kind: SymbolKind$1;
    type: AST.TypeNode | null;
    scope: ScopeId;
    contextSpan: AST.Span;
    targetSpan?: AST.Span;
    declared: boolean;
    initialized: boolean;
    used: boolean;
    isTypeChecked: boolean;
    typeInfo?: {
        baseTypes?: SymbolId[];
        typeParams?: Symbol[];
        constraints?: AST.TypeNode[];
        isGeneric?: boolean;
    };
    module?: string;
    namespace?: string;
    visibility: AST.VisibilityInfo;
    mutability: AST.MutabilityInfo;
    metadata?: {
        callable?: boolean;
        params?: Symbol[];
        returnType?: AST.TypeNode;
        isAsync?: boolean;
        isStatic?: boolean;
        isAbstract?: boolean;
        isBuiltin?: boolean;
        [key: string]: unknown;
    };
    importSource?: string;
    importPath?: string;
    importAlias?: string;
    sourceSymbol?: SymbolId;
    isExported: boolean;
    exportAlias?: string;
}
declare class ScopeManager {
    private readonly diagnosticManager;
    private readonly debugManager?;
    private scopes;
    private currentScope;
    private globalScope;
    private symbolTable;
    private namespaceLookup;
    readonly idGenerator: IdGenerator;
    readonly symbolIdGenerator: IdGenerator;
    constructor(diagnosticManager: DiagnosticManager, debugManager?: DebugManager | undefined);
    init(): void;
    reset(): void;
    createScope(kind: ScopeKind, name: string, parentId: ScopeId | null): Scope;
    withScope<T>(scopeId: ScopeId, fn: () => T): T;
    findScopeByName(name: string, kind?: ScopeKind): Scope | null;
    findChildScopeByName(name: string, kind?: ScopeKind): Scope | null;
    findChildScopeByNameFromId(name: string, scopeId: ScopeId, kind?: ScopeKind): Scope | null;
    getSymbolInCurrentScope(name: string): Symbol | null;
    getScopeParent(scopeId: ScopeId): Scope | null;
    getScope(id: ScopeId): Scope;
    getAllSymbols(): Symbol[];
    getSymbol(id: SymbolId): Symbol;
    getCurrentScope(): Scope;
    getGlobalScope(): Scope;
    getAllScopes(): Scope[];
    enterScopeById(scopeId: ScopeId): void;
    getCurrentScopeId(): ScopeId;
    setCurrentScope(scopeId: ScopeId): void;
    addSymbolToScope(symbol: Symbol, scopeId: ScopeId): void;
    enterScope(kind: ScopeKind, name: string): ScopeId;
    exitScope(): ScopeId | null;
    removeScope(scopeId: ScopeId): void;
    defineSymbol(name: string, kind: SymbolKind$1, opts: {
        type?: AST.TypeNode;
        visibility?: AST.VisibilityInfo;
        mutability?: AST.MutabilityInfo;
        namespace?: string;
        metadata?: Symbol['metadata'];
        typeInfo?: Symbol['typeInfo'];
        span?: AST.Span;
    }): SymbolId;
    resolveSymbol(name: string, opts?: {
        currentScopeOnly?: boolean;
        includeParents?: boolean;
        namespace?: string;
    }): Symbol | null;
    private initializeBuiltins;
    private createBuiltinSymbol;
    markSymbolUsed(symbolId: SymbolId): void;
    markSymbolInitialized(symbolId: SymbolId): void;
    markSymbolTypeChecked(symbolId: SymbolId): void;
    setSymbolType(symbolId: SymbolId, type: AST.TypeNode): void;
    getNamespaceSymbols(namespace: string): Symbol[];
    getAllSymbolsInScope(scopeId: ScopeId): Symbol[];
    getAllNamespaces(): string[];
    /**
     * Look up a symbol in the current scope chain.
     * Prioritizes symbols from the current module before checking imported symbols.
     */
    lookupSymbol(name: string): Symbol | null;
    /**
     * Walk up scope chain with module boundary awareness.
     * This prevents symbols from other modules from shadowing local definitions.
     */
    lookupSymbolInScopeChain(name: string, scopeId: ScopeId): Symbol | null;
    lookupSymbolInParentScopes(name: string, startingScopeId: ScopeId): Symbol | null;
    /**
     * Look up a symbol from LSP position information.
     * This finds the narrowest scope at the given span and searches for the symbol.
     *
     * @param word - The identifier to search for
     * @param position_span - The span where the hover/completion was requested
     * @param moduleName - Optional: The name of the module to restrict search to
     * @returns The symbol if found, null otherwise
     */
    lookupSymbolFromLSP(word: string, position_span: AST.Span, moduleName?: string): Symbol | null;
    /**
     * Find if the position is within an import statement.
     * Returns the Use symbol if position is within any import's contextSpan.
     */
    private findImportAtPosition;
    /**
     * Check if the position is on the symbol's definition/declaration.
     * Returns true if hovering on where the symbol is defined, false if hovering on usage.
     */
    private isPositionOnSymbolDefinition;
    /**
     * Resolve a symbol through imports to get the actual underlying symbol.
     * If the symbol is a Use (import), this follows the chain to find the real definition.
     */
    private resolveSymbolThroughImports;
    /**
     * Find the narrowest (most specific) scope that contains the given position.
     * This walks the scope tree depth-first to find the deepest scope containing the position.
     *
     * @param position - The position to search for
     * @param rootScopeId - Optional: Start search from this scope instead of global
     */
    private findNarrowestScopeAtPosition;
    /**
     * Find scope by symbol proximity - looks for symbols closest to position.
     * This is used as a fallback when scope span information is not available.
     *
     * @param position - The position to search near
     * @param rootScopeId - Optional: Restrict search to this scope and its children
     */
    private findScopeBySymbolProximity;
    /**
    * Public method to get symbol at a specific position (used by LSP).
    * This checks if the position directly points to a symbol definition.
    */
    getSymbolAtPosition(position: AST.Span): Symbol | null;
}

declare enum DeclarationPhase {
    PreDeclaration = "PreDeclaration",
    InDeclaration = "InDeclaration",
    InInitialization = "InInitialization",
    PostDeclaration = "PostDeclaration"
}
declare enum ExpressionContext {
    VariableInitializer = "VariableInitializer",
    ParameterInitializer = "ParameterInitializer",
    FunctionBody = "FunctionBody",
    AssignmentTarget = "AssignmentTarget",
    AssignmentSource = "AssignmentSource",
    ConditionExpression = "ConditionExpression",
    ReturnExpression = "ReturnExpression",
    DeferExpression = "DeferExpression",
    ThrowExpression = "ThrowExpression",
    CallArgument = "CallArgument",
    FunctionCall = "FunctionCall",
    GeneralExpression = "GeneralExpression"
}
interface DeclarationContext {
    symbolName: string;
    symbolId: SymbolId;
    symbolKind: SymbolKind;
    phase: DeclarationPhase;
    span: AST.Span;
    parentScope: ScopeId;
}
interface ExpressionContextInfo {
    type: ExpressionContext;
    relatedSymbol?: SymbolId;
    depth: number;
    span: AST.Span;
}
interface AnalysisContext {
    currentModuleName: string;
    currentModulePath: string;
    currentPhase: AnalysisPhase;
    contextSpanStack: AST.Span[];
    declarationStack: DeclarationContext[];
    expressionStack: ExpressionContextInfo[];
    currentScope: ScopeId;
    processingSymbols: Set<SymbolId>;
    pendingReferences: Map<string, AST.Span[]>;
    resolvedSymbols: Set<SymbolId>;
}
declare enum AnalysisPhase {
    Collection = "Collection",
    Resolution = "Resolution",
    TypeValidation = "TypeValidation",
    SemanticValidation = "SemanticValidation",
    FinalValidation = "FinalValidation"
}
type SymbolKind = 'let' | 'Param' | 'fn' | 'Use' | 'def';
interface SavedContextState {
    scopeId: ScopeId;
    moduleName: string;
    modulePath: string;
    spanStackDepth: number;
    declarationStackDepth: number;
    expressionStackDepth: number;
}
declare class ContextTracker {
    private debugManager?;
    private diagnosticManager?;
    private context;
    private currentPhase;
    private phaseStack;
    private contextMap;
    constructor(debugManager?: DebugManager | undefined, diagnosticManager?: DiagnosticManager | undefined);
    init(): void;
    reset(): void;
    genAnalysisContext(): AnalysisContext;
    /**
     * Save the current context state before entering a new scope/context.
     * This captures all relevant state that needs to be restored later.
     */
    saveState(): SavedContextState;
    /**
     * Restore with validation to catch state corruption
     */
    restoreState(state: SavedContextState): void;
    private restoreStack;
    private validateSavedState;
    /**
     * Execute a function with saved/restored context.
     * This is a convenience wrapper that automatically handles state management.
     *
     * Usage:
     * ```typescript
     * contextTracker.withSavedState(() => {
     *     // Do work that changes context
     *     contextTracker.setScope(newScope);
     *     processNode(node);
     * });
     * // Context is automatically restored here
     * ```
     */
    withSavedState<T>(fn: () => T): T;
    setModuleName(moduleName: string): void;
    setModulePath(modulePath: string): void;
    pushPhase(phase: AnalysisPhase): void;
    popPhase(): AnalysisPhase | undefined;
    setPhase(phase: AnalysisPhase): void;
    getCurrentPhase(): AnalysisPhase | undefined;
    setScope(scopeId: ScopeId): void;
    setCurrentContextSpan(span?: AST.Span): void;
    pushContextSpan(span: AST.Span): void;
    popContextSpan(): AST.Span | undefined;
    clearContextSpans(): void;
    startDeclaration(symbolName: string, symbolId: SymbolId, symbolKind: SymbolKind | 'Use', span: AST.Span, parentScope: ScopeId): void;
    startInitialization(symbolId: SymbolId): void;
    completeDeclaration(symbolId: SymbolId): void;
    isInDeclaration(symbolName: string): boolean;
    isInInitialization(symbolName: string): boolean;
    getCurrentDeclaration(): DeclarationContext | undefined;
    enterExpression(type: ExpressionContext, span: AST.Span, relatedSymbol?: SymbolId): void;
    exitExpression(): ExpressionContextInfo | undefined;
    getCurrentExpressionContext(): ExpressionContextInfo | undefined;
    isInExpressionType(type: ExpressionContext): boolean;
    getExpressionDepth(): number;
    checkSelfReference(symbolName: string, referenceSpan: AST.Span): {
        isSelfReference: boolean;
        declarationContext?: DeclarationContext;
        errorType?: 'VARIABLE_SELF_INIT' | 'PARAMETER_SELF_INIT';
    };
    recordPendingReference(symbolName: string, span: AST.Span): void;
    resolvePendingReferences(symbolName: string): AST.Span[];
    getPendingReferences(): Map<string, AST.Span[]>;
    checkParameterForwardReference(parameterName: string, currentParameterIndex: number, allParameters: {
        name: string;
        index: number;
    }[]): {
        isForwardReference: boolean;
        referencedParameterIndex?: number;
    };
    getContextSpan(): AST.Span | undefined;
    getContext(): Readonly<AnalysisContext>;
    getPhase(): string;
    getModuleName(): string;
    getModulePath(): string;
    getScope(): ScopeId;
    getProcessingSymbols(): Set<SymbolId>;
    getResolvedSymbols(): Set<SymbolId>;
    getDeclarationStack(): DeclarationContext[];
    getCurrentDeclarationContext(): DeclarationContext | undefined;
    getCurrentDeclarationSymbolId(): SymbolId | undefined;
    getCurrentDeclarationSymbolName(): string | undefined;
    getCurrentDeclarationSymbolKind(): SymbolKind | undefined;
    getCurrentDeclarationPhase(): DeclarationPhase | undefined;
    getCurrentDeclarationSpan(): AST.Span | undefined;
    getCurrentDeclarationParentScope(): ScopeId | undefined;
    getCurrentDeclarationStackDepth(): number;
    getCurrentDeclarationStackTrace(): string[];
    isProcessingSymbol(symbolId: SymbolId): boolean;
    isSymbolResolved(symbolId: SymbolId): boolean;
    getDeclarationStackTrace(): string[];
    getExpressionStackTrace(): string[];
    debugState(): void;
}

declare enum DiagCode {
    INTERNAL_ERROR = "INTERNAL_ERROR",
    PARSER_ERROR = "PARSER_ERROR",
    MODULE_SCOPE_NOT_FOUND = "MODULE_SCOPE_NOT_FOUND",
    MODULE_NOT_FOUND = "MODULE_NOT_FOUND",
    TYPE_INFERENCE_FAILED = "TYPE_INFERENCE_FAILED",
    OPTIMIZATION_HINT = "OPTIMIZATION_HINT",
    SYMBOL_NOT_FOUND = "SYMBOL_NOT_FOUND",
    ANONYMOUS_STRUCT = "ANONYMOUS_STRUCT",
    TYPE_CYCLE_DETECTED = "TYPE_CYCLE_DETECTE",
    TYPE_NESTING_TOO_DEEP = "TYPE_NESTING_TOO_DEEP",
    SYMBOL_NOT_EXPORTED = "SYMBOL_NOT_EXPORTED",
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
    INVALID_VISIBILITY = "INVALID_VISIBILITY",
    INVALID_TYPE_WIDTH = "INVALID_TYPE_WIDTH",
    MISSING_RETURN_STATEMENT = "MISSING_RETURN_STATEMENT",
    INVALID_STATIC_ACCESS = "INVALID_STATIC_ACCESS",
    SYMBOL_NOT_ACCESSIBLE = "SYMBOL_NOT_ACCESSIBLE",
    INVALID_SIZEOF_TARGET = "INVALID_SIZEOF_TARGET",
    THROW_WITHOUT_ERROR_TYPE = "THROW_WITHOUT_ERROR_TYPE",
    THROW_TYPE_MISMATCH = "THROW_TYPE_MISMATCH",
    THROW_OUTSIDE_FUNCTION = "THROW_OUTSIDE_FUNCTION",
    INVALID_ERROR_TYPE = "INVALID_ERROR_TYPE",
    TYPE_VALIDATION_FAILED = "TYPE_VALIDATION_FAILED",
    INVALID_TYPE_OPERATION = "INVALID_TYPE_OPERATION",
    TYPE_INCOMPATIBLE = "TYPE_INCOMPATIBLE",
    TYPE_INFERENCE_ERROR = "TYPE_INFERENCE_ERROR",
    NULL_POINTER_ERROR = "NULL_POINTER_ERROR",
    TYPE_SAFETY_ERROR = "TYPE_SAFETY_ERROR",
    SYNTAX_ERROR = "SYNTAX_ERROR",
    ANALYSIS_ERROR = "ANALYSIS_ERROR",
    ENTRY_MODULE_NOT_FOUND = "ENTRY_MODULE_NOT_FOUND",
    ENTRY_MODULE_NO_MAIN = "ENTRY_MODULE_NO_MAIN",
    ENTRY_MODULE_PRIVATE_MAIN = "ENTRY_MODULE_PRIVATE_MAIN",
    TYPE_MISMATCH = "TYPE_MISMATCH",
    ARRAY_TO_NON_ARRAY = "ARRAY_TO_NON_ARRAY",
    NON_ARRAY_TO_ARRAY = "NON_ARRAY_TO_ARRAY",
    BOOL_TO_NON_BOOL = "BOOL_TO_NON_BOOL",
    NON_BOOL_TO_BOOL = "NON_BOOL_TO_BOOL",
    NEGATIVE_TO_UNSIGNED = "NEGATIVE_TO_UNSIGNED",
    LITERAL_OVERFLOW = "LITERAL_OVERFLOW",
    CANNOT_INFER_TYPE = "CANNOT_INFER_TYPE",
    UNDEFINED_IDENTIFIER = "UNDEFINED_IDENTIFIER",
    UNDEFINED_BUILTIN = "UNDEFINED_BUILTIN",
    UNDEFINED_FUNCTION = "UNDEFINED_FUNCTION",
    NOT_A_FUNCTION = "NOT_A_FUNCTION",
    USED_BEFORE_DECLARED = "USED_BEFORE_DECLARED",
    USED_BEFORE_INITIALIZED = "USED_BEFORE_INITIALIZED",
    UNDEFINED_TYPE = "UNDEFINED_TYPE",
    UNSUPPORTED_TYPE = "UnsupportedType",
    VARIABLE_SELF_INIT = "VARIABLE_SELF_INIT",
    PARAMETER_SELF_INIT = "PARAMETER_SELF_INIT",
    PARAMETER_FORWARD_REFERENCE = "PARAMETER_FORWARD_REFERENCE",
    USE_SHADOWING = "USE_SHADOWING",
    DEFINITION_SHADOWING = "DEFINITION_SHADOWING",
    VARIABLE_SHADOWING = "VARIABLE_SHADOWING",
    FUNCTION_SHADOWING = "FUNCTION_SHADOWING",
    PARAMETER_SHADOWING = "PARAMETER_SHADOWING",
    STRUCT_FIELD_SHADOWING = "STRUCT_FIELD_SHADOWING",
    ENUM_VARIANT_SHADOWING = "ENUM_VARIANT_SHADOWING",
    ERROR_SHADOWING = "ERROR_SHADOWING",
    DUPLICATE_SYMBOL = "DUPLICATE_SYMBOL",
    TOO_FEW_ARGUMENTS = "TOO_FEW_ARGUMENTS",
    TOO_MANY_ARGUMENTS = "TOO_MANY_ARGUMENTS",
    UNUSED_VARIABLE = "UNUSED_VARIABLE",
    UNUSED_PARAMETER = "UNUSED_PARAMETER",
    UNUSED_FUNCTION = "UNUSED_FUNCTION",
    UNARY_MINUS_NON_NUMERIC = "UNARY_MINUS_NON_NUMERIC",
    UNARY_PLUS_NON_NUMERIC = "UNARY_PLUS_NON_NUMERIC",
    IMPORT_NOT_FOUND = "IMPORT_NOT_FOUND",
    IMPORT_CIRCULAR_DEPENDENCY = "IMPORT_CIRCULAR_DEPENDENCY",
    IMPORT_PRIVATE_SYMBOL = "IMPORT_PRIVATE_SYMBOL",
    NEGATIVE_SHIFT = "NEGATIVE_SHIFT",
    SHIFT_OVERFLOW = "SHIFT_OVERFLOW",
    SHIFT_RESULT_OVERFLOW = "SHIFT_RESULT_OVERFLOW",
    ARITHMETIC_OVERFLOW = "ARITHMETIC_OVERFLOW",
    POTENTIAL_OVERFLOW = "POTENTIAL_OVERFLOW",
    DIVISION_BY_ZERO = "DIVISION_BY_ZERO",
    MODULO_BY_ZERO = "MODULO_BY_ZERO",
    PRECISION_LOSS = "PRECISION_LOSS",
    ARITHMETIC_ERROR = "ARITHMETIC_ERROR",
    ARRAY_SIZE_MISMATCH = "ARRAY_SIZE_MISMATCH",
    MUTABILITY_MISMATCH = "MUTABILITY_MISMATCH",
    POTENTIAL_PRECISION_LOSS = "POTENTIAL_PRECISION_LOSS",
    POTENTIAL_DATA_LOSS = "POTENTIAL_DATA_LOSS"
}
declare enum DiagKind {
    ERROR = "error",
    WARNING = "warning",
    INFO = "info"
}
interface Diagnostic {
    code: DiagCode;
    kind: DiagKind;
    contextSpan?: Span;
    targetSpan?: Span;
    msg: string;
    fixes?: DiagnosticFix[];
    sourceModuleName?: string;
    sourceModulePath?: string;
}
interface DiagnosticFix {
    kind: 'add' | 'remove' | 'replace' | 'rename';
    span: Span;
    msg: string;
    fix?: () => void;
}
declare class DiagnosticManager {
    diagnostics: Diagnostic[];
    private readonly strictMode;
    private contextTracker;
    constructor(contextTracker: ContextTracker, strictMode?: boolean);
    push(diagnostic: Diagnostic): void;
    reportError(code: DiagCode, msg: string, targetSpan?: Span): void;
    reportWarning(code: DiagCode, msg: string, targetSpan?: Span): void;
    reportInfo(code: DiagCode, msg: string, targetSpan?: Span): void;
    addErrorDiagnostic(diagnostic: {
        message: string;
        phase: any;
        severity: 'error' | 'warning' | 'info';
    }): void;
    getDiagnostics(): Diagnostic[];
    reset(): void;
    hasErrors(): boolean;
    length(): number;
    getAllErrors(): Diagnostic[];
    getAllWarnings(): Diagnostic[];
    getAllInfos(): Diagnostic[];
    private isMoreSpecific;
    private hasHigherPriority;
    private filterDuplicates;
    private getTargetKey;
    private isSameIssue;
}

/** Abstract phase base class */
declare abstract class PhaseBase {
    protected readonly phase: AnalysisPhase;
    protected readonly config: AnalysisConfig;
    protected constructor(phase: AnalysisPhase, config: AnalysisConfig);
    abstract reset(): void;
    abstract handle(program: AST.Program): boolean;
    abstract logStatistics(): void;
    reportError(code: DiagCode, message: string, span?: AST.Span): void;
    reportWarning(code: DiagCode, message: string, span?: AST.Span): void;
    reportInfo(code: DiagCode, message: string, span?: AST.Span): void;
    log(kind: DebugKind | undefined, message: string): void;
}

declare class SymbolCollector extends PhaseBase {
    private pathContext;
    private stats;
    private typeContext;
    private typeRegistry;
    private moduleExports;
    constructor(config: AnalysisConfig);
    handle(): boolean;
    reset(): void;
    private buildPathMappings;
    private collectAllModules;
    private collectModule;
    private createModuleScope;
    private collectStmt;
    private processStmt;
    private getNodeGetter;
    private handleBlockStatement;
    private createBlockScope;
    private collectBlockStmt;
    private handleTestStmt;
    private handleUseStatement;
    private createUseSymbol;
    private collectUseStmt;
    private extractImportSymbolName;
    private processModuleImport;
    private processWildcardImport;
    private processLocalUse;
    private handleDefStatement;
    private createDefSymbol;
    private collectDefStmt;
    private handleLetStatement;
    private createLetSymbol;
    private collectLetStmt;
    private extractTypeFromInitializer;
    private handleFuncStatement;
    private createFuncSymbol;
    private createFuncScope;
    private collectFuncStmt;
    private createParamSymbol;
    private collectParams;
    private injectSelfParameter;
    private handleLoopStmt;
    private createLoopScope;
    private collectLoopStmt;
    private handleControlflowStmt;
    private collectReturnStmt;
    private collectDeferStmt;
    private collectThrowStmt;
    private createExprScope;
    private collectExpr;
    private processExprKind;
    private handleAsExpr;
    private handleOrelseExpr;
    private handleRangeExpr;
    private handleTryExpr;
    private handleCatchExpr;
    private handleIfExpr;
    private handleSwitchExpr;
    private handleBinaryExpr;
    private handlePostfixExpr;
    private handlePrefixExpr;
    private handlePrimaryExpr;
    private validateSelfUsage;
    private createTypeScope;
    private collectType;
    private collectTypeInternal;
    private handleStructType;
    private handleEnumType;
    private handleTupleType;
    private handleArrayType;
    private handleOptionalType;
    private handlePointerType;
    private handleFunctionType;
    private handleUnionType;
    private collectStructField;
    private createStructFieldSymbol;
    private collectEnumVariantIdent;
    private createEnumVariantSymbol;
    private collectErrorType;
    private createErrorSymbol;
    private checkForShadowing;
    private checkTypeCycle;
    private withTypeContext;
    private validateSymbolExistsInModule;
    private validateMemberPathInModule;
    private init;
    private initStats;
    private initTypeContext;
    private createTypeKey;
    private createBaseSymbol;
    private incrementSymbolsCollected;
    private incrementScopesCreated;
    private trackModuleExport;
    logStatistics(): void;
    getTypeRegistry(): Map<string, Symbol>;
    getModuleExports(moduleName: string): Set<string> | undefined;
    canImportSymbol(moduleName: string, symbolName: string): boolean;
}

declare class SymbolResolver extends PhaseBase {
    private stats;
    private resolutionCtx;
    private currentIsStaticMethod;
    private currentStructScope;
    constructor(config: AnalysisConfig);
    handle(): boolean;
    reset(): void;
    private resolveAllModules;
    private resolveModule;
    private resetDeclaredFlags;
    private enterModuleContext;
    private exitModuleContext;
    private findModuleScope;
    private resolveStmt;
    private processStmt;
    private getNodeGetter;
    private handleBlockStmt;
    private resolveBlockStmt;
    private handleTestStmt;
    private handleUseStmt;
    private resolveUseStmt;
    private resolveModuleImport;
    private resolveModuleWithScope;
    private resolveLocalUse;
    private identOrMemberAccess;
    private saveModuleContext;
    private switchToTargetModule;
    private restoreModuleContext;
    private resolveImportTarget;
    private resolveMemberInType;
    private propagateImportType;
    private markAliasAsDeclared;
    private handleDefStmt;
    private resolveDefStmt;
    private handleLetStmt;
    private resolveLetStmt;
    private isConstructorExpression;
    private validateConstructorFields;
    private resolveVariableInitializer;
    private handleFuncStmt;
    private resolveFuncStmt;
    private resolveSelfParameter;
    private resolveParameters;
    private resolveParameter;
    private resolveParameterInitializer;
    private resolveFields;
    private resolveField;
    private resolveFieldInitializer;
    private handleLoopStmt;
    private resolveLoopStmt;
    private handleControlflowStmt;
    private resolveReturnStmt;
    private resolveDeferStmt;
    private resolveThrowStmt;
    private resolveExprStmt;
    private resolvePrimary;
    private resolveTuple;
    private resolveObject;
    private resolveBinary;
    private resolvePrefix;
    private resolvePostfix;
    private resolvePostfixCall;
    private resolvePostfixArrayAccess;
    private resolvePostfixMemberAccess;
    private findMemberAccessBaseSymbol;
    private resolveSelfMemberAccess;
    private resolveAs;
    private resolveOrelse;
    private resolveRange;
    private resolveTry;
    private resolveCatch;
    private resolveIf;
    private resolveSwitch;
    private findCallTargetSymbol;
    private validateCallableSymbol;
    private resolveIdentifier;
    private resolveBuiltinFunction;
    private resolveStandardIdentifier;
    private resolveType;
    private scopeMatchesStruct;
    private checkParameterForwardReference;
    private checkSelfReference;
    private validateSymbolUsage;
    private init;
    private initStats;
    private initResolutionContext;
    private createCacheKey;
    logStatistics(): void;
}

declare class TypeValidator extends PhaseBase {
    private stats;
    private typeCtx;
    private ExpressionEvaluator;
    private inferenceStack;
    private circularTypeDetectionStack;
    private currentFunctionReturnType;
    private hasReturnStatement;
    private currentFunctionErrorType;
    private hasThrowStatement;
    private currentIsStaticMethod;
    private currentStructScope;
    private readonly CACHE_MAX_SIZE;
    constructor(config: AnalysisConfig);
    handle(): boolean;
    reset(): void;
    private validateAllModules;
    private validateModule;
    private enterModuleContext;
    private exitModuleContext;
    private validateStmt;
    private processStmt;
    private getNodeGetter;
    private handleBlockStmt;
    private validateBlockStmt;
    private handleTestStmt;
    private handleDefStmt;
    private validateDefStmt;
    private handleLetStmt;
    private validateArrayLiteralWithTargetType;
    private validateLetStmt;
    private handleFuncStmt;
    private validateFuncStmt;
    private validateParameter;
    private resolveSelfParameter;
    private handleLoopStmt;
    private validateLoopStmt;
    private handleControlflowStmt;
    private validateReturnStmt;
    private isConstructorExpression;
    private validateDeferStmt;
    private validateThrowStmt;
    private validateThrowType;
    private getCurrentFunctionErrorType;
    private inferExpressionType;
    private performTypeInference;
    private computeTypeSize;
    private resolveTypeNode;
    private isTypeExpression;
    private isTypeType;
    private inferPrimaryType;
    private inferLiteralType;
    private getExpectedTypeFromContext;
    private inferArrayLiteralType;
    private inferIdentifierType;
    private validateMethodCallContext;
    private inferObjectType;
    private inferTupleType;
    private inferBinaryType;
    private validateAssignment;
    private resolveStructFieldSymbol;
    private inferPrefixType;
    private inferPostfixType;
    private inferCallType;
    private validateMemberVisibility;
    private validateBuiltinCall;
    private validateStructMethodCall;
    private validateCallArgumentsWithContext;
    private inferExpressionTypeWithContext;
    private inferArrayAccessType;
    private inferMemberAccessType;
    private resolveWildcardMemberAccess;
    private getFunctionNode;
    private isStaticMemberAccess;
    private resolveMemberOnUnwrappedType;
    private resolveStructMember;
    private validateMethodCall;
    private resolveEnumMember;
    private inferAsType;
    private inferOrelseType;
    private inferRangeType;
    private inferTryType;
    private inferCatchType;
    private inferIfType;
    private inferSwitchType;
    private resolveIdentifierType;
    private validateStructType;
    private validateStructConstruction;
    private validateEnumType;
    private validateArraySize;
    private validateSwitchExhaustiveness;
    private validateArrayAssignment;
    private checkCircularTypeDependency;
    /**
     * Check if an expression is a character literal
     */
    private isCharacterLiteral;
    /**
    * Universal character literal validation
    * Validates that a character literal value fits in the target type
    * Handles ALL contexts: variables, parameters, fields, arguments, returns, arrays
    */
    private validateCharacterLiteralCompatibility;
    private validateTypeAssignment;
    private isTypeCompatible;
    private isNumericType;
    private isAnyType;
    private isIntegerType;
    private isStringType;
    private isAnyErrorType;
    private isErrorType;
    private isSameType;
    private promoteNumericTypes;
    private computeUnaryResultType;
    private arePointerTypesCompatible;
    private areTupleTypesCompatible;
    private areStructTypesCompatible;
    private areStructsStructurallyCompatible;
    private areNumericTypesCompatible;
    private areArrayTypesCompatible;
    private canConvertTypes;
    private validateValueFitsInType;
    private getTypeBounds;
    private isValidThrowType;
    private isErrorMemberOfType;
    private extractTypeFromInitializer;
    private extractSymbolFromExpression;
    private extractBuiltinName;
    private extractMemberName;
    private extractEnumVariantName;
    private extractTypeName;
    private findModuleScope;
    private findCallTargetSymbol;
    private isBuiltinFunction;
    private isInsideFunctionScope;
    private isAccessibleFrom;
    private isBoolLiteral;
    private createCacheKey;
    private cacheType;
    private init;
    private initStats;
    private initTypeValidatorContext;
    logStatistics(): void;
}

declare class SemanticValidator extends PhaseBase {
    private stats;
    constructor(config: AnalysisConfig);
    handle(): boolean;
    reset(): void;
    private validateEntryPoint;
    private performEntryPointValidation;
    private validateMainFunctionSignature;
    private isValidMainReturnType;
    private reportEntryPointErrors;
    private validateUnusedSymbols;
    private analyzeUnusedSymbols;
    private shouldCheckForUnused;
    private reportUnusedSymbols;
    private reportUnusedSymbol;
    private validateModuleIntegrity;
    private validateSingleModuleIntegrity;
    private checkCircularImports;
    private hasCircularImport;
    private validateExportConsistency;
    private validateVisibilityRules;
    private validateSymbolVisibility;
    private validatePrivateSymbolUsage;
    private validatePublicSymbolExposure;
    private findModuleByPath;
    private init;
    private initStats;
    logStatistics(): void;
}

/** Analysis configuration options */
interface AnalysisConfig {
    /** Debug output level */
    debug?: DebugKind;
    /** Stop after specific phase */
    stopAtPhase?: AnalysisPhase;
    /** Enable strict mode (fail fast) */
    strictMode?: boolean;
    /** Maximum number of errors before stopping */
    maxErrors?: number;
    services: AnalysisServices;
    program: AST.Program | null;
}
/** Analysis result with diagnostics and metadata */
interface AnalysisResult {
    /** Whether analysis succeeded without errors */
    success: boolean;
    /** All diagnostic messages */
    diagnostics: Diagnostic[];
    /** Phase where analysis stopped */
    completedPhase?: AnalysisPhase;
    /** Debug information (if enabled) */
    debugInfo?: {
        totalTime: number;
        phaseTimings: Map<AnalysisPhase, number>;
        memoryUsage?: number;
    };
}
/** Internal phase result */
interface PhaseResult {
    success: boolean;
    phase: AnalysisPhase;
    duration: number;
    errors: number;
    warnings: number;
}
/** Analysis services */
interface AnalysisServices {
    debugManager: DebugManager;
    contextTracker: ContextTracker;
    diagnosticManager: DiagnosticManager;
    scopeManager: ScopeManager;
}
/**
 * Multi-phase AST analyzer for je-es language
 *
 * Provides comprehensive analysis including:
 * - Symbol collection and scope management
 * - Symbol resolution and usage validation
 * - Type checking and inference
 * - Semantic validation
 */
declare class Analyzer {
    config: Required<AnalysisConfig>;
    phaseTimings: Map<AnalysisPhase, number>;
    symbolCollector: SymbolCollector;
    symbolResolver: SymbolResolver;
    typeValidator: TypeValidator;
    semanticValidator: SemanticValidator;
    private constructor();
    getDiagMgr: () => DiagnosticManager;
    /** Factory method to create analyzer instance */
    static create(config?: Partial<AnalysisConfig>): Analyzer;
    private log;
    /**
     * Analyze a program through all configured phases
     * @param program The AST program to analyze
     * @param config Optional runtime configuration overrides
     * @returns Analysis result with diagnostics and metadata
     */
    analyze(program: AST.Program, config?: Partial<AnalysisConfig>): AnalysisResult;
    private createServices;
    private createConfig;
    private executePhase1;
    private executePhase2;
    private executePhase3;
    private executePhase4;
    private runPhase;
    private validateProgramStructure;
    private shouldStopAtPhase;
    reset(): void;
    private createFinalResult;
    private createErrorResult;
    private createFatalErrorResult;
    private getMemoryUsage;
}

export { type AnalysisConfig, AnalysisPhase, type AnalysisResult, type AnalysisServices, Analyzer, ContextTracker, DebugManager, DiagCode, DiagKind, type Diagnostic, type DiagnosticFix, DiagnosticManager, type PhaseResult };
