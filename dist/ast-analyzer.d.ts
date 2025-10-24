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
declare enum SymbolKind {
    Use = "Use",
    Definition = "Definition",
    Variable = "Variable",
    Function = "Function",
    Parameter = "Parameter",
    StructField = "StructField",
    EnumVariant = "EnumVariant",
    Type = "Type",
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
    kind: SymbolKind;
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
        errorType?: AST.TypeNode;
        isAsync?: boolean;
        isStatic?: boolean;
        isAbstract?: boolean;
        isBuiltin?: boolean;
        errorMode?: 'err-ident' | 'err-group' | 'any-error' | 'self-group';
        selfGroupErrors?: string[];
        [key: string]: unknown;
    };
    importSource?: string;
    importPath?: string;
    importAlias?: string;
    sourceSymbol?: SymbolId;
    isExported: boolean;
    exportAlias?: string;
}
interface BuiltinSymbolOption {
    type: AST.TypeNode | null;
}
declare class ScopeManager {
    private readonly diagnosticManager;
    private readonly debugManager?;
    private static readonly SYMBOL_PROXIMITY_THRESHOLD;
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
    /**
     * Find a scope by name, optionally filtered by kind.
     * @param name - The scope name to search for
     * @param kind - Optional: Filter by scope kind
     * @param parentScopeId - Optional: Search only within this parent scope's children
     */
    findScopeByName(name: string, kind?: ScopeKind, parentScopeId?: ScopeId): Scope | null;
    /**
     * Find a child scope of the current scope by name.
     */
    findChildScopeByName(name: string, kind?: ScopeKind): Scope | null;
    /**
     * Find a child scope by name from a specific parent scope.
     */
    findChildScopeByNameFromId(name: string, scopeId: ScopeId, kind?: ScopeKind): Scope | null;
    getSymbolInCurrentScope(name: string): Symbol | null;
    getScopeParent(scopeId: ScopeId): Scope | null;
    getScope(id: ScopeId): Scope;
    getAllSymbols(): Symbol[];
    getSymbol(id: SymbolId): Symbol;
    getCurrentScope(): Scope;
    getGlobalScope(): Scope;
    getAllScopes(): Scope[];
    setCurrentScope(scopeId: ScopeId): void;
    addSymbolToScope(symbol: Symbol, scopeId: ScopeId): void;
    enterScope(kind: ScopeKind, name: string): ScopeId;
    exitScope(): ScopeId | null;
    defineSymbol(name: string, kind: SymbolKind, opts: {
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
    getAllSymbolsInScope(scopeId: ScopeId): Symbol[];
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
    * Public method to get symbol at a specific position (used by LSP).
    * This checks if the position directly points to a symbol definition.
    */
    getSymbolAtPosition(position: AST.Span): Symbol | null;
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
    symbolKind: ContextSymbolKind;
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
type ContextSymbolKind = 'let' | 'Param' | 'fn' | 'Use' | 'def';
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
    saveState(): SavedContextState;
    restoreState(state: SavedContextState): void;
    withSavedState<T>(fn: () => T): T;
    private restoreStack;
    private validateSavedState;
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
    startDeclaration(symbolName: string, symbolId: SymbolId, symbolKind: ContextSymbolKind | 'Use', span: AST.Span, parentScope: ScopeId): void;
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
    getCurrentDeclarationSymbolKind(): ContextSymbolKind | undefined;
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
    ERROR_MEMBER_NOT_FOUND = "ERROR_MEMBER_NOT_FOUND",// Error set member not found
    SELFERR_INVALID_CONTEXT = "SELFERR_INVALID_CONTEXT",// selferr used outside self-group
    THROW_NON_ERROR_TYPE = "THROW_NON_ERROR_TYPE",// Throwing non-error value
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
    TYPE_MISMATCH_CALL = "TYPE_MISMATCH_CALL",// Calling non-function
    TYPE_MISMATCH_ASSIGNMENT = "TYPE_MISMATCH_ASSIGNMENT",// Assignment type mismatch
    TYPE_MISMATCH_RETURN = "TYPE_MISMATCH_RETURN",// Return type mismatch
    TYPE_MISMATCH_PARAMETER = "TYPE_MISMATCH_PARAMETER",// Parameter type mismatch
    TYPE_MISMATCH_FIELD = "TYPE_MISMATCH_FIELD",// Struct field type mismatch
    ARRAY_TO_NON_ARRAY = "ARRAY_TO_NON_ARRAY",
    NON_ARRAY_TO_ARRAY = "NON_ARRAY_TO_ARRAY",
    BOOL_TO_NON_BOOL = "BOOL_TO_NON_BOOL",
    NON_BOOL_TO_BOOL = "NON_BOOL_TO_BOOL",
    NEGATIVE_TO_UNSIGNED = "NEGATIVE_TO_UNSIGNED",
    LITERAL_OVERFLOW = "LITERAL_OVERFLOW",
    CANNOT_INFER_TYPE = "CANNOT_INFER_TYPE",
    UNDEFINED_IDENTIFIER = "UNDEFINED_IDENTIFIER",
    UNDEFINED_IDENTIFIER_MEMBER = "UNDEFINED_IDENTIFIER_MEMBER",// Member access on undefined
    UNDEFINED_IDENTIFIER_TYPEOF = "UNDEFINED_IDENTIFIER_TYPEOF",// typeof on undefined
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
    ARITHMETIC_OVERFLOW_COMPTIME = "ARITHMETIC_OVERFLOW_COMPTIME",// Overflow in comptime
    POTENTIAL_OVERFLOW = "POTENTIAL_OVERFLOW",
    DIVISION_BY_ZERO = "DIVISION_BY_ZERO",
    MODULO_BY_ZERO = "MODULO_BY_ZERO",
    PRECISION_LOSS = "PRECISION_LOSS",
    ARITHMETIC_ERROR = "ARITHMETIC_ERROR",
    ARRAY_SIZE_MISMATCH = "ARRAY_SIZE_MISMATCH",
    MUTABILITY_MISMATCH = "MUTABILITY_MISMATCH",
    MUTABILITY_MISMATCH_POINTER = "MUTABILITY_MISMATCH_POINTER",// Pointer mutability mismatch
    POTENTIAL_PRECISION_LOSS = "POTENTIAL_PRECISION_LOSS",
    POTENTIAL_DATA_LOSS = "POTENTIAL_DATA_LOSS",
    COMPTIME_EVAL_FAILED = "COMPTIME_EVAL_FAILED",// Comptime evaluation failed
    COMPTIME_NON_CONST = "COMPTIME_NON_CONST"
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
    private spansOverlap;
}

/** Abstract phase base class */
declare abstract class PhaseBase {
    protected readonly phase: AnalysisPhase;
    protected readonly config: AnalysisConfig;
    protected constructor(phase: AnalysisPhase, config: AnalysisConfig);
    abstract reset(): void;
    abstract handle(): boolean;
    abstract logStatistics(): void;
    protected reportError(code: DiagCode, message: string, span?: AST.Span): void;
    protected reportWarning(code: DiagCode, message: string, span?: AST.Span): void;
    protected reportInfo(code: DiagCode, message: string, span?: AST.Span): void;
    protected log(kind: "verbose" | "symbols" | "scopes" | "errors" | undefined, message: string): void;
    /**
     * Extract getter function for statement node based on its kind.
     * Returns null if the statement kind is invalid or unsupported.
     */
    protected getNodeGetter(stmt: AST.StmtNode): (() => any) | null;
    /**
     * Process a statement by delegating to kind-specific handlers.
     * Returns the result of the handler or null if kind is unsupported.
    */
    protected processStmtByKind<T>(stmt: AST.StmtNode, handlers: Partial<Record<AST.StmtNode['kind'], (node: any) => T>>): T | null;
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
    private handleBlockStmt;
    private createBlockScope;
    private collectBlockStmt;
    private handleTestStmt;
    private handleUseStmt;
    private createUseSymbol;
    private collectUseStmt;
    private extractImportSymbolName;
    private processModuleImport;
    private processWildcardImport;
    private processLocalUse;
    private handleDefStmt;
    private createDefSymbol;
    private collectDefStmt;
    private handleLetStmt;
    private createLetSymbol;
    private collectLetStmt;
    private extractTypeFromInitializer;
    private handleFuncStmt;
    private determineErrorMode;
    private extractSelfGroupErrors;
    private createFuncSymbol;
    private createFuncScope;
    private collectFuncStmt;
    private createParamSymbol;
    private collectParams;
    private injectSelfParameter;
    private injectSelfErrReference;
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
    private refineErrorMode;
    private extractSelfGroupErrors;
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
    private resolveSelfErrMemberAccess;
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
    private resolveIdentifierType;
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

type ComptimeValue = bigint | number | boolean | null;
interface EvaluationResult {
    value: ComptimeValue;
    type: 'int' | 'float' | 'bool' | 'null';
}
interface EvaluationContext {
    allowFloats: boolean;
    maxIntValue: bigint;
    minIntValue: bigint;
    targetType?: AST.TypeNode;
}
declare class ExpressionEvaluator {
    config: AnalysisConfig;
    private readonly MAX_INT_64;
    private readonly MIN_INT_64;
    private comptimeResultCache;
    constructor(config: AnalysisConfig);
    evaluateComptimeExpression(expr: AST.ExprNode, targetType?: AST.TypeNode): bigint | null;
    evaluateComptimeFloat(expr: AST.ExprNode, targetType?: AST.TypeNode): number | null;
    evaluateComptimeValue(expr: AST.ExprNode, targetType?: AST.TypeNode): ComptimeValue | null;
    evaluateExpression(expr: AST.ExprNode, ctx?: EvaluationContext): EvaluationResult | null;
    private evaluatePrimary;
    private evaluateLiteral;
    private evaluateIdentifier;
    private evaluateBinary;
    private evaluateAdditive;
    private evaluateMultiplicative;
    private evaluatePower;
    private evaluateShift;
    private evaluateBitwise;
    private evaluateComparison;
    private evaluateLogical;
    private evaluatePrefix;
    private evaluateAs;
    private evaluateSizeof;
    private evaluateComptimeFunctionCall;
    private extractReturnValueFromComptimeFunction;
    private getParametersFromMetadata;
    private evaluateWithLocals;
    private evaluatePrimaryWithLocals;
    private evaluateIdentifierWithLocals;
    private evaluateBinaryWithLocals;
    private evaluatePrefixWithLocals;
    private evaluateAsWithLocals;
    private createComptimeCacheKey;
    private findCallTargetSymbol;
    private areTypesCompatible;
    private toFloat;
    private compare;
    private isFloatType;
    private isIntegerType;
    private isFloatTargetType;
    private isIntegerTargetType;
    private unwrapType;
    private getFloatBounds;
    private getTypeBounds;
    computeTypeSize(type: AST.TypeNode): number | null;
    extractIntegerValue(expr: AST.ExprNode): number | undefined;
    private reportError;
    private reportWarning;
    private reportInfo;
    private log;
}

declare class TypeInference {
    config: AnalysisConfig;
    private typeValidator;
    inferenceStack: Set<string>;
    readonly CACHE_MAX_SIZE = 10000;
    constructor(config: AnalysisConfig, typeValidator: TypeValidator);
    inferExpressionType(expr: AST.ExprNode): AST.TypeNode | null;
    inferExpressionTypeWithContext(expr: AST.ExprNode, expectedType?: AST.TypeNode): AST.TypeNode | null;
    performTypeInference(expr: AST.ExprNode): AST.TypeNode | null;
    inferPrimaryType(primary: AST.PrimaryNode): AST.TypeNode | null;
    inferLiteralType(literal: AST.LiteralNode): AST.TypeNode;
    inferIdentifierType(ident: AST.IdentNode): AST.TypeNode | null;
    inferArrayLiteralType(literal: AST.LiteralNode): AST.TypeNode;
    inferObjectType(obj: AST.ObjectNode): AST.TypeNode | null;
    inferTupleType(tuple: AST.ExprTupleNode): AST.TypeNode | null;
    inferBinaryType(binary: AST.BinaryNode): AST.TypeNode | null;
    inferPrefixType(prefix: AST.PrefixNode): AST.TypeNode | null;
    inferPostfixType(postfix: AST.PostfixNode): AST.TypeNode | null;
    inferCallType(call: AST.CallNode): AST.TypeNode | null;
    inferArrayAccessType(access: AST.ArrayAccessNode): AST.TypeNode | null;
    inferTupleIndexAccess(tupleType: AST.TypeNode, indexExpr: AST.ExprNode, span: AST.Span): AST.TypeNode | null;
    inferMemberAccessType(access: AST.MemberAccessNode): AST.TypeNode | null;
    inferOrelseType(orelse: AST.OrelseNode): AST.TypeNode | null;
    inferRangeType(range: AST.RangeNode): AST.TypeNode | null;
    inferTryType(tryNode: AST.TryNode): AST.TypeNode | null;
    inferCatchType(catchNode: AST.CatchNode): AST.TypeNode | null;
    inferIfType(ifNode: AST.IfNode): AST.TypeNode | null;
    inferSwitchType(MatchNode: AST.MatchNode): AST.TypeNode | null;
    inferAsType(asNode: AST.AsNode): AST.TypeNode | null;
    isTypeCompatible(target: AST.TypeNode, source: AST.TypeNode, sourceExpr?: AST.ExprNode): boolean;
    isNumericType(type: AST.TypeNode): boolean;
    isAnyType(type: AST.TypeNode): boolean;
    isIntegerType(type: AST.TypeNode): boolean;
    isStringType(type: AST.TypeNode): boolean;
    isErrorType(type: AST.TypeNode): boolean;
    isTypeExpression(expr: AST.ExprNode): boolean;
    isTypeType(typeNode: AST.TypeNode): boolean;
    isPointerDereference(expr: AST.ExprNode): boolean;
    isSameType(type1: AST.TypeNode, type2: AST.TypeNode): boolean;
    isSameErrorType(type1: AST.TypeNode, type2: AST.TypeNode): boolean;
    isConstructorExpression(expr: AST.ExprNode): boolean;
    isLValueExpression(expr: AST.ExprNode): boolean;
    isCharacterLiteral(expr: AST.ExprNode): boolean;
    isBoolLiteral(expr: AST.ExprNode | undefined, value: boolean): boolean;
    isErrorExpression(expr: AST.ExprNode): boolean;
    promoteNumericTypes(type1: AST.TypeNode, type2: AST.TypeNode, span?: AST.Span): AST.TypeNode;
    computeUnaryResultType(operandType: AST.TypeNode, isNegation: boolean, span?: AST.Span): AST.TypeNode;
    unwrapParenType(type: AST.TypeNode): AST.TypeNode;
    resolveIdentifierType(type: AST.TypeNode): AST.TypeNode;
    resolveMemberOnUnwrappedType(type: AST.TypeNode, access: AST.MemberAccessNode, symbol?: Symbol | null, isStaticAccess?: boolean): AST.TypeNode | null;
    resolveStructMember(structType: AST.TypeNode, access: AST.MemberAccessNode, baseSymbol: Symbol | null, isStaticAccess?: boolean): AST.TypeNode | null;
    resolveEnumMember(enumType: AST.TypeNode, access: AST.MemberAccessNode): AST.TypeNode | null;
    resolveWildcardMemberAccess(access: AST.MemberAccessNode, wildcardSymbol: Symbol): AST.TypeNode | null;
    computeTypeSize(type: AST.TypeNode): number | null;
    arePointerTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean;
    areTupleTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean;
    areStructTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean;
    areStructsStructurallyCompatible(target: AST.StructTypeNode, source: AST.StructTypeNode): boolean;
    areNumericTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean;
    areArrayTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean;
    doesObjectMatchStruct(obj: AST.ObjectNode, struct: AST.StructTypeNode): boolean;
    getTypeDisplayName(type: AST.TypeNode): string;
    canConvertTypes(source: AST.TypeNode, target: AST.TypeNode): boolean;
    getExpectedTypeFromContext(): AST.TypeNode | null;
    getExpressionMutability(expr: AST.ExprNode): 'Mutable' | 'Immutable' | 'Literal' | 'Unset';
    normalizeType(type: AST.TypeNode): AST.TypeNode;
    extractMemberName(memberExpr: AST.ExprNode): string | null;
    isStaticMemberAccess(baseExpr: AST.ExprNode): boolean;
    findCallTargetSymbol(baseExpr: AST.ExprNode): Symbol | null;
    createCacheKey(expr: AST.ExprNode): string;
    cacheType(key: string, type: AST.TypeNode): void;
    log(kind: DebugKind, msg: string): void;
    reportError(code: DiagCode, message: string, span?: AST.Span): void;
    reportWarning(code: DiagCode, message: string, span?: AST.Span): void;
}

interface TypeValidatorContext {
    currentModule: string;
    moduleStack: string[];
    typeCache: Map<string, AST.TypeNode | null>;
}
interface TypeValidationStats {
    modulesProcessed: number;
    typesInferred: number;
    typesCached: number;
    compatibilityChecks: number;
    callsValidated: number;
    memberAccessValidated: number;
    assignmentsValidated: number;
    returnsValidated: number;
    errors: number;
    startTime: number;
}
declare class TypeValidator extends PhaseBase {
    stats: TypeValidationStats;
    typeCtx: TypeValidatorContext;
    ExpressionEvaluator: ExpressionEvaluator;
    typeInference: TypeInference;
    circularTypeDetectionStack: Set<string>;
    currentFunctionReturnType: AST.TypeNode | null;
    hasReturnStatement: boolean;
    currentFunctionErrorType: AST.TypeNode | null;
    hasThrowStatement: boolean;
    currentIsStaticMethod: boolean;
    currentStructScope: Scope | null;
    constructor(config: AnalysisConfig);
    handle(): boolean;
    reset(): void;
    validateAllModules(): boolean;
    validateModule(moduleName: string, module: AST.Module, parentScope: Scope): boolean;
    enterModuleContext(moduleName: string, module: AST.Module): void;
    exitModuleContext(): void;
    validateStmt(stmt: AST.StmtNode, currentScope?: Scope, moduleName?: string): void;
    handleBlockStmt(blockNode: AST.BlockStmtNode, scope?: Scope, moduleName?: string): void;
    validateBlockStmt(block: AST.BlockStmtNode, scope?: Scope, moduleName?: string): void;
    handleTestStmt(testNode: AST.TestStmtNode, scope: Scope, moduleName?: string): void;
    handleDefStmt(defNode: AST.DefStmtNode, scope?: Scope, moduleName?: string): void;
    validateDefStmt(defNode: AST.DefStmtNode): void;
    handleLetStmt(letNode: AST.LetStmtNode, scope?: Scope, moduleName?: string): void;
    validateArrayLiteralWithTargetType(initExpr: AST.ExprNode, targetType: AST.TypeNode, contextName: string): boolean;
    validateLetStmt(letNode: AST.LetStmtNode): void;
    handleFuncStmt(funcNode: AST.FuncStmtNode, scope?: Scope, moduleName?: string): void;
    validateFuncStmt(funcNode: AST.FuncStmtNode): void;
    validateParameter(paramNode: AST.FieldNode): void;
    resolveSelfParameter(funcScope: Scope, structScope: Scope): void;
    handleLoopStmt(stmt: AST.StmtNode, scope?: Scope, moduleName?: string): void;
    validateLoopStmt(loopStmt: AST.LoopStmtNode): void;
    handleControlflowStmt(stmt: AST.StmtNode, scope?: Scope, moduleName?: string): void;
    validateReturnStmt(returnNode: AST.ControlFlowStmtNode): void;
    validateDeferStmt(deferNode: AST.ControlFlowStmtNode): void;
    validateThrowStmt(throwNode: AST.ControlFlowStmtNode): void;
    validateThrowExpression(throwExpr: AST.ExprNode, functionErrorType: AST.TypeNode, span: AST.Span): void;
    isValidErrorExpression(expr: AST.ExprNode, expectedType: AST.TypeNode): boolean;
    validateThrowType(thrownType: AST.TypeNode, functionErrorType: AST.TypeNode, throwExpr: AST.ExprNode, span: AST.Span): void;
    getCurrentFunctionSymbol(): Symbol | null;
    extractErrorMemberName(thrownExpr: AST.ExprNode): string | null;
    getCurrentFunctionErrorType(): AST.TypeNode | null;
    resolveTypeNode(typeNode: AST.TypeNode): void;
    validateMethodCallContext(call: AST.CallNode, methodSymbol: Symbol, isStaticAccess: boolean, baseExpr: AST.ExprNode): void;
    validateMutabilityAssignment(leftSymbol: Symbol, leftExpr: AST.ExprNode): boolean;
    validateAssignment(binary: AST.BinaryNode): void;
    validateEnumVariantConstruction(call: AST.CallNode, access: AST.MemberAccessNode, enumType: AST.TypeNode): AST.TypeNode | null;
    validateMemberVisibility(memberSymbol: Symbol, structScope: Scope, accessSpan: AST.Span): void;
    validateBuiltinCall(call: AST.CallNode): AST.TypeNode | null;
    validateStructMethodCall(call: AST.CallNode, access: AST.MemberAccessNode, structType: AST.TypeNode): AST.TypeNode | null;
    validateCallArgumentsWithContext(call: AST.CallNode, funcType: AST.TypeNode): AST.TypeNode | null;
    validateMethodCall(call: AST.CallNode, methodSymbol: Symbol, structScope: Scope, baseExpr: AST.ExprNode): AST.TypeNode | null;
    validateIntegerRangeExpr(expr: AST.ExprNode, rangeType: string, span: AST.Span): void;
    validateStructType(structType: AST.StructTypeNode, symbol: Symbol): void;
    validateStructConstruction(objNode: AST.ObjectNode, structType: AST.TypeNode, initSpan: AST.Span): boolean;
    validateEnumType(enumType: AST.EnumTypeNode, symbol: Symbol): void;
    validateComptimeExpression(expr: AST.ExprNode, context: string): bigint | null;
    validateArraySize(sizeExpr: AST.ExprNode): void;
    validateSwitchExhaustiveness(MatchNode: AST.MatchNode): void;
    validateArrayAssignment(declaredType: AST.TypeNode, initType: AST.TypeNode, initSpan: AST.Span, contextName: string): boolean;
    checkCircularTypeDependency(typeNode: AST.TypeNode, typeName: string, allowIndirection?: boolean, pathHasIndirection?: boolean): boolean;
    validateCharacterLiteralCompatibility(expr: AST.ExprNode, targetType: AST.TypeNode, context: string): boolean;
    validateTypeAssignment(sourceExpr: AST.ExprNode, targetType: AST.TypeNode, context: string): boolean;
    validateValueFitsInType(expr: AST.ExprNode, targetType: AST.TypeNode): void;
    isValidThrowType(thrownType: AST.TypeNode, functionErrorType: AST.TypeNode, span: AST.Span): boolean;
    extractTypeFromInitializer(expr: AST.ExprNode): AST.TypeNode | null;
    extractSymbolFromExpression(expr: AST.ExprNode): Symbol | null;
    extractBuiltinName(expr: AST.ExprNode): string | null;
    extractEnumVariantName(expr: AST.ExprNode): string | null;
    extractTypeName(typeNode: AST.TypeNode): string | null;
    findModuleScope(moduleName: string): Scope | null;
    isBuiltinFunction(baseExpr: AST.ExprNode): boolean;
    isInsideFunctionScope(): boolean;
    init(): boolean;
    initStats(): TypeValidationStats;
    initTypeValidatorContext(): TypeValidatorContext;
    validateTypeCompatibility(target: AST.TypeNode, source: AST.TypeNode, context: string, span: AST.Span, sourceExpr?: AST.ExprNode): boolean;
    validateFunctionScope(stmt: any, stmtType: string): boolean;
    validateEnumVariantAssignment(variant: any, memberName: string, span: AST.Span): void;
    logStatistics(): void;
    markSymbolAsTypeChecked(symbol: Symbol, type?: AST.TypeNode): void;
    logSymbolValidation(action: string, symbolName: string): void;
    handleStatement(stmt: any, validator: (stmt: any) => void, scope?: Scope, moduleName?: string): void;
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

export { type AnalysisConfig, type AnalysisContext, AnalysisPhase, type AnalysisResult, type AnalysisServices, Analyzer, type BuiltinSymbolOption, type ContextSymbolKind, ContextTracker, type DebugKind, DebugManager, type DeclarationContext, DeclarationPhase, DiagCode, DiagKind, type Diagnostic, type DiagnosticFix, DiagnosticManager, ExpressionContext, type ExpressionContextInfo, type PhaseResult, type SavedContextState, type Scope, type ScopeId, ScopeKind, ScopeManager, type Symbol, type SymbolId, SymbolKind };
