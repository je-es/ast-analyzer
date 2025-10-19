// ScopeManager.ts — Scope and symbol management.
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST                             from '@je-es/ast';
    import { IdGenerator }                      from "./IdGenerator";
    import { DebugManager }                     from './DebugManager';
    import { DiagnosticManager}                 from './DiagnosticManager';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export type ScopeId = number;
    export type SymbolId = number;

    export enum ScopeKind {
        Global          = 'Global',
        Module          = 'Module',
        Function        = 'Function',
        Loop            = 'Loop',
        Block           = 'Block',
        Expression      = 'Expression',
        Type            = 'Type',
    }

    export enum SymbolKind {
        Use             = 'Use',
        Definition      = 'Definition',
        Variable        = 'Variable',
        Function        = 'Function',
        Parameter       = 'Parameter',
        StructField     = 'StructField',
        EnumVariant     = 'EnumVariant',
        Error           = 'Error'
    }

    export interface Scope {
        id              : ScopeId;
        kind            : ScopeKind;
        name            : string;
        parent          : ScopeId | null;
        children        : ScopeId[];
        symbols         : Map<string, Symbol>;
        level           : number;
        metadata       ?: Record<string, unknown>;
    }

    export interface Symbol {
        id              : SymbolId;
        name            : string;
        kind            : SymbolKind;
        type            : AST.TypeNode | null;
        scope           : ScopeId;
        contextSpan     : AST.Span;
        targetSpan?     : AST.Span;

        // State flags
        declared        : boolean;
        initialized     : boolean;
        used            : boolean;
        isTypeChecked   : boolean;

        // Type information
        typeInfo?       : {
            baseTypes?      : SymbolId[];       // Base classes/interfaces
            typeParams?     : Symbol[];         // Generic type parameters
            constraints?    : AST.TypeNode[];   // Type parameter constraints
            isGeneric?      : boolean;          // Whether this is a generic type/function
        };

        // Metadata
        module?             : string;
        namespace?          : string;
        visibility          : AST.VisibilityInfo;
        mutability          : AST.MutabilityInfo;
        metadata?           : {
            callable?       : boolean;      // For callable symbols
            params?         : Symbol[];     // Function parameters
            returnType?     : AST.TypeNode; // Function return type
            isAsync?        : boolean;      // Async function
            isStatic?       : boolean;      // Static member
            isAbstract?     : boolean;      // Abstract member
            isBuiltin?      : boolean;      // Built-in symbol
            [key: string]   : unknown;      // Other metadata
        };

        // Import/Export metadata
        importSource?   : string;       // Source module
        importPath?     : string;       // Import path
        importAlias?    : string;       // Import alias
        sourceSymbol?   : SymbolId;     // Original symbol ID
        isExported      : boolean;      // Is exported
        exportAlias?    : string;       // Export alias
    }


    interface BuiltinSymbolOption {
        type            : AST.TypeNode | null
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class ScopeManager {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            private scopes!             : Map<ScopeId, Scope>;
            private currentScope!       : ScopeId;
            private globalScope!        : Scope;
            private symbolTable!        : Map<SymbolId, Symbol>;
            private namespaceLookup!    : Map<string, Set<SymbolId>>;

            readonly idGenerator        : IdGenerator;
            readonly symbolIdGenerator  : IdGenerator;

            constructor(
                private readonly diagnosticManager  : DiagnosticManager,
                private readonly debugManager?      : DebugManager
            ) {
                this.idGenerator        = new IdGenerator();
                this.symbolIdGenerator  = new IdGenerator();
                this.init();
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ────────────────────────────────┐

            init(): void {
                this.scopes = new Map();
                this.symbolTable = new Map();
                this.namespaceLookup = new Map();

                // Create global scope
                this.globalScope = this.createScope(ScopeKind.Global, 'global', null);
                this.currentScope = this.globalScope.id;

                // Initialize built-in symbols
                this.initializeBuiltins();
            }

            reset(): void {
                // Store global scope ID before cleanup
                const globalScopeId = this.globalScope.id;

                // Clear all collections
                this.scopes.clear();
                this.symbolTable.clear();
                this.namespaceLookup.clear();

                // Re-add global scope
                this.scopes.set(globalScopeId, this.globalScope);
                this.currentScope = globalScopeId;

                // Clear global scope symbols but keep the scope itself
                this.globalScope.symbols.clear();
                this.globalScope.children = [];

                // Reinitialize built-ins
                this.initializeBuiltins();
            }

            createScope(kind: ScopeKind, name: string, parentId: ScopeId | null): Scope {
                const scope: Scope = {
                    id: this.idGenerator.next(),
                    kind,
                    name,
                    parent: parentId,
                    children: [],
                    symbols: new Map(),
                    level: parentId ? this.getScope(parentId).level + 1 : 0
                };

                this.scopes.set(scope.id, scope);

                if (parentId) {
                    const parent = this.getScope(parentId);
                    parent.children.push(scope.id);
                }

                return scope;
            }

            withScope<T>(scopeId: ScopeId, fn: () => T): T {
                const previousScope = this.currentScope;

                if (!this.scopes.has(scopeId)) {
                    throw new Error(`Cannot switch to non-existent scope ${scopeId}`);
                }

                this.debugManager?.log('verbose',
                    `→ Entering scope ${scopeId} (${this.getScope(scopeId).name}) from ${previousScope}`
                );

                this.setCurrentScope(scopeId);

                try {
                    return fn();
                } finally {
                    this.debugManager?.log('verbose',
                        `← Restoring scope ${previousScope} from ${scopeId}`
                    );
                    this.setCurrentScope(previousScope);
                }
            }


        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            findScopeByName(name: string, kind?: ScopeKind): Scope | null {
                for (const scope of this.scopes.values()) {
                    if (scope.name === name && (kind ? scope.kind === kind : true)) {
                        return scope;
                    }
                }
                return null;
            }

            findChildScopeByName(name: string, kind?: ScopeKind): Scope | null {
                const currentScope = this.getScope(this.currentScope);
                for (const childId of currentScope.children) {
                    const childScope = this.getScope(childId);
                    if (childScope.name === name && (kind ? childScope.kind === kind : true)) {
                        return childScope;
                    }
                }
                return null;
            }

            findChildScopeByNameFromId(name: string, scopeId: ScopeId, kind?: ScopeKind): Scope | null {
                const scope = this.getScope(scopeId);
                for (const childId of scope.children) {
                    const childScope = this.getScope(childId);
                    if (childScope.name === name && (kind ? childScope.kind === kind : true)) {
                        return childScope;
                    }
                }
                return null;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            getSymbolInCurrentScope(name: string): Symbol | null {
                const currentScope = this.getScope(this.currentScope);
                return currentScope.symbols.get(name) || null;
            }

            getScopeParent(scopeId: ScopeId): Scope | null {
                const scope = this.getScope(scopeId);
                return scope.parent !== null ? this.getScope(scope.parent) : null;
            }

            getScope(id: ScopeId): Scope {
                const scope = this.scopes.get(id);
                if (!scope) {
                    throw new Error(`Scope ${id} not found`);
                }
                return scope;
            }

            getAllSymbols(): Symbol[] {
                return Array.from(this.symbolTable.values());
            }

            getSymbol(id: SymbolId): Symbol {
                const symbol = this.symbolTable.get(id);
                if (!symbol) {
                    throw new Error(`Symbol ${id} not found`);
                }
                return symbol;
            }

            getCurrentScope(): Scope {
                return this.getScope(this.currentScope);
            }

            getGlobalScope(): Scope {
                return this.globalScope;
            }

            getAllScopes(): Scope[] {
                return Array.from(this.scopes.values());
            }

            enterScopeById(scopeId: ScopeId): void {
                this.currentScope = scopeId;
            }

            getCurrentScopeId(): ScopeId {
                return this.currentScope;
            }

            setCurrentScope(scopeId: ScopeId): void {
                if (!this.scopes.has(scopeId)) {
                    throw new Error(`Scope ${scopeId} does not exist`);
                }
                this.currentScope = scopeId;
            }

            addSymbolToScope(symbol: Symbol, scopeId: ScopeId): void {
                const scope = this.getScope(scopeId);
                scope.symbols.set(symbol.name, symbol);
                this.symbolTable.set(symbol.id, symbol);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            enterScope(kind: ScopeKind, name: string): ScopeId {
                const scope = this.createScope(kind, name, this.currentScope);
                this.currentScope = scope.id;
                return scope.id;
            }

            exitScope(): ScopeId | null {
                const current = this.getScope(this.currentScope);
                if (current.parent !== null) {
                    const parentId = current.parent;
                    this.currentScope = parentId;
                    return parentId;
                }
                return null;
            }

            removeScope(scopeId: ScopeId): void {
                this.scopes.delete(scopeId);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            defineSymbol(name: string, kind: SymbolKind, opts: {
                type?: AST.TypeNode,
                visibility?: AST.VisibilityInfo,
                mutability?: AST.MutabilityInfo,
                namespace?: string,
                metadata?: Symbol['metadata'],
                typeInfo?: Symbol['typeInfo'],
                span?: AST.Span
            }): SymbolId {
                const symbol: Symbol = {
                    id: this.symbolIdGenerator.next(),
                    name,
                    kind,
                    type: opts.type || null,
                    scope: this.currentScope,
                    contextSpan: opts.span || { start: 0, end: 0 },
                    declared: true,
                    initialized: false,
                    used: false,
                    isTypeChecked: false,
                    visibility: opts.visibility || { kind: 'Private' },
                    mutability: opts.mutability || { kind: 'Immutable' },
                    namespace: opts.namespace,
                    metadata: opts.metadata,
                    typeInfo: opts.typeInfo,
                    isExported: false
                };

                const scope = this.getScope(this.currentScope);
                scope.symbols.set(name, symbol);
                this.symbolTable.set(symbol.id, symbol);

                // Add to namespace lookup if in a namespace
                if (opts.namespace) {
                    const nsSymbols = this.namespaceLookup.get(opts.namespace) || new Set();
                    nsSymbols.add(symbol.id);
                    this.namespaceLookup.set(opts.namespace, nsSymbols);
                }

                return symbol.id;
            }

            resolveSymbol(name: string, opts: {
                currentScopeOnly?: boolean,
                includeParents?: boolean,
                namespace?: string
            } = {}): Symbol | null {
                // Check namespace first if specified
                if (opts.namespace) {
                    const nsSymbols = this.namespaceLookup.get(opts.namespace);
                    if (nsSymbols) {
                        for (const symbolId of nsSymbols) {
                            const symbol = this.symbolTable.get(symbolId);
                            if (symbol && symbol.name === name) {
                                return symbol;
                            }
                        }
                    }
                }

                // Regular scope-based lookup
                let scope : Scope | null = this.getScope(this.currentScope);

                do {
                    const symbol = scope.symbols.get(name);
                    if (symbol) {
                        return symbol;
                    }

                    if (opts.currentScopeOnly) {
                        break;
                    }

                    scope = scope.parent !== null ? this.getScope(scope.parent) : null;
                } while (scope && (opts.includeParents ?? true));

                return null;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private initializeBuiltins(): void {
                // functions
                this.createBuiltinSymbol('func', '@print', {
                    type: AST.TypeNode.asFunction({start: 0, end: 0}, [
                            AST.TypeNode.asU8Array({start: 0, end: 0})
                    ], AST.TypeNode.asVoid({start: 0, end: 0}))
                })

                // types
                this.createBuiltinSymbol('type', 'slice', {
                    type: AST.TypeNode.asU8Array({start: 0, end: 0})
                })
                this.createBuiltinSymbol('type', 'char', {
                    type: AST.TypeNode.asUnsigned({start: 0, end: 0}, 'u8', 8),
                })
                this.createBuiltinSymbol('type', 'cpoint', {
                    type: AST.TypeNode.asUnsigned({start: 0, end: 0}, 'u21', 21),
                })
                this.createBuiltinSymbol('type', 'usize', {
                    type: AST.TypeNode.asUnsigned({start: 0, end: 0}, 'usize', 64),
                })
                this.createBuiltinSymbol('type', 'isize', {
                    type: AST.TypeNode.asSigned({start: 0, end: 0}, 'isize', 64),
                })
            }

            private createBuiltinSymbol(kind: 'func' | 'type', name: string, options: BuiltinSymbolOption = { type: null}) : Symbol {
                if(kind == 'func') {
                    const symbol: Symbol = {
                        id: this.symbolIdGenerator.next(),
                        kind: SymbolKind.Function,
                        name: name,
                        contextSpan: { start: 0, end: 0 },
                        scope: this.globalScope.id,
                        visibility: { kind: 'Public' },
                        mutability: { kind: 'Immutable'},
                        type: options.type,
                        used: false,
                        initialized: true,
                        declared: true,
                        isTypeChecked: true,
                        isExported: false,
                        metadata: {
                            callable: true,
                            isBuiltin: true
                        }
                    };

                    this.globalScope.symbols.set(name, symbol);
                    this.symbolTable.set(symbol.id, symbol);

                    return symbol;
                }

                else if(kind == 'type') {
                    const symbol: Symbol = {
                        id: this.symbolIdGenerator.next(),
                        kind: SymbolKind.Definition,
                        name: name,
                        contextSpan: { start: 0, end: 0 },
                        scope: this.globalScope.id,
                        visibility: { kind: 'Public' },
                        mutability: { kind: 'Immutable'},
                        type: options.type,
                        used: false,
                        initialized: true,
                        declared: true,
                        isTypeChecked: true,
                        isExported: false,
                        metadata: {
                            isBuiltin: true
                        }
                    };

                    this.globalScope.symbols.set(name, symbol);
                    this.symbolTable.set(symbol.id, symbol);

                    return symbol;
                }

                throw new Error("Unreachable");
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            markSymbolUsed(symbolId: SymbolId): void {
                const symbol = this.getSymbol(symbolId);
                symbol.used = true;
            }

            markSymbolInitialized(symbolId: SymbolId): void {
                const symbol = this.getSymbol(symbolId);
                symbol.initialized = true;
            }

            markSymbolTypeChecked(symbolId: SymbolId): void {
                const symbol = this.getSymbol(symbolId);
                symbol.isTypeChecked = true;
            }

            setSymbolType(symbolId: SymbolId, type: AST.TypeNode): void {
                const symbol = this.getSymbol(symbolId);
                symbol.type = type;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            getNamespaceSymbols(namespace: string): Symbol[] {
                const nsSymbols = this.namespaceLookup.get(namespace);
                if (!nsSymbols) {
                    return [];
                }

                return Array.from(nsSymbols).map(id => this.getSymbol(id));
            }

            getAllSymbolsInScope(scopeId: ScopeId): Symbol[] {
                const scope = this.getScope(scopeId);
                return Array.from(scope.symbols.values());
            }

            getAllNamespaces(): string[] {
                return Array.from(this.namespaceLookup.keys());
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            /**
             * Look up a symbol in the current scope chain.
             * Prioritizes symbols from the current module before checking imported symbols.
             */
            lookupSymbol(name: string): Symbol | null {
                return this.lookupSymbolInScopeChain(name, this.currentScope);
            }

            /**
             * Walk up scope chain with module boundary awareness.
             * This prevents symbols from other modules from shadowing local definitions.
             */
            lookupSymbolInScopeChain(name: string, scopeId: ScopeId): Symbol | null {
                let scope: Scope | null = this.getScope(scopeId);
                let currentModuleScope: Scope | null = null;

                // STEP 1: Find which module we're currently in
                let checkScope: Scope | null = scope;
                while (checkScope) {
                    if (checkScope.kind === ScopeKind.Module) {
                        currentModuleScope = checkScope;
                        break;
                    }
                    checkScope = checkScope.parent !== null ? this.getScope(checkScope.parent) : null;
                }

                // STEP 2: Search ONLY within the current module first
                if (currentModuleScope) {
                    checkScope = scope;
                    while (checkScope && checkScope.id !== currentModuleScope.id) {
                        const symbol = checkScope.symbols.get(name);
                        if (symbol) {
                            return symbol; // Found in current scope chain
                        }
                        checkScope = checkScope.parent !== null ? this.getScope(checkScope.parent) : null;
                    }

                    // Check the module scope itself
                    const moduleSymbol = currentModuleScope.symbols.get(name);
                    if (moduleSymbol) {
                        return moduleSymbol; // Found in module scope
                    }

                    // STEP 3: Check child Type scopes (for struct/enum definitions)
                    for (const childId of currentModuleScope.children) {
                        const childScope = this.getScope(childId);
                        if (childScope.kind === ScopeKind.Type && childScope.name === name) {
                            // This is a type definition - return its symbol from the module scope
                            return currentModuleScope.symbols.get(name) || null;
                        }
                    }
                }

                // STEP 4: Only check global scope for imports and built-ins
                const globalScope = this.scopes.get(1); // Global scope is always ID 1
                if (globalScope) {
                    const globalSymbol = globalScope.symbols.get(name);
                    if (globalSymbol) {
                        // Only return if it's a Use (import) or built-in
                        if (globalSymbol.kind === SymbolKind.Use ||
                            globalSymbol.metadata?.isBuiltin) {
                            return globalSymbol;
                        }
                    }
                }

                return null; // Not found anywhere
            }

            lookupSymbolInParentScopes(name: string, startingScopeId: ScopeId): Symbol | null {
                let scope: Scope | null = this.getScope(startingScopeId);
                while (scope) {
                    const symbol = scope.symbols.get(name);
                    if (symbol) {
                        return symbol;
                    }
                    scope = scope.parent !== null ? this.getScope(scope.parent) : null;
                }
                return null;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            /**
             * Look up a symbol from LSP position information.
             * This finds the narrowest scope at the given span and searches for the symbol.
             *
             * @param word - The identifier to search for
             * @param position_span - The span where the hover/completion was requested
             * @param moduleName - Optional: The name of the module to restrict search to
             * @returns The symbol if found, null otherwise
             */
            lookupSymbolFromLSP(word: string, position_span: AST.Span, moduleName?: string): Symbol | null {
                console.log(`[ScopeManager] LSP lookup for "${word}" at span ${JSON.stringify(position_span)}${moduleName ? ` in module "${moduleName}"` : ''}`);

                // STEP 1: If module name provided, find that specific module scope
                let searchScope: Scope | null = null;

                if (moduleName) {
                    // Find the module scope by name
                    for (const scope of this.scopes.values()) {
                        if (scope.kind === ScopeKind.Module && scope.name === moduleName) {
                            searchScope = scope;
                            console.log(`[ScopeManager] Restricted search to module: ${moduleName} (id: ${scope.id})`);
                            break;
                        }
                    }

                    if (!searchScope) {
                        console.warn(`[ScopeManager] Module "${moduleName}" not found`);
                        return null;
                    }

                    // Check if position is within an import statement first
                    const importSymbol = this.findImportAtPosition(position_span, searchScope);
                    if (importSymbol) {
                        console.log(`[ScopeManager] Position is within import statement`);
                        console.log(`[ScopeManager] Import symbol name: ${importSymbol.name}, alias: ${importSymbol.importAlias || 'none'}`);
                        console.log(`[ScopeManager] Looking for word: "${word}"`);

                        // Hovering anywhere in "use x as sdsdsds from ..." should show what 'x' is from other module
                        // So always resolve the import to show the source symbol
                        console.log(`[ScopeManager] Resolving import to source symbol`);
                        return this.resolveSymbolThroughImports(importSymbol);
                    }

                    // Within the module, find the narrowest scope at the position
                    const narrowestScope = this.findNarrowestScopeAtPosition(position_span, searchScope.id);
                    searchScope = narrowestScope || searchScope;
                } else {
                    // No module specified - use original behavior
                    searchScope = this.findNarrowestScopeAtPosition(position_span);
                }

                if (!searchScope) {
                    console.log(`[ScopeManager] No scope found at position`);
                    return null;
                }

                console.log(`[ScopeManager] Found search scope: ${searchScope.name} (kind: ${searchScope.kind}, id: ${searchScope.id})`);

                // STEP 2: Search for the symbol starting from the search scope
                const symbol = this.lookupSymbolInScopeChain(word, searchScope.id);

                if (!symbol) {
                    console.log(`[ScopeManager] Symbol "${word}" not found in scope chain`);
                    return null;
                }

                console.log(`[ScopeManager] Found symbol: ${symbol.name} (kind: ${symbol.kind})`);

                // Check if cursor is on the import statement itself or on usage
                if (symbol.kind === SymbolKind.Use) {
                    const isOnImportStatement = this.isPositionOnSymbolDefinition(position_span, symbol);

                    if (isOnImportStatement) {
                        console.log(`[ScopeManager] Position is ON import statement, returning Use symbol`);
                        return symbol; // Show the import itself
                    } else {
                        console.log(`[ScopeManager] Position is on USAGE of imported symbol, resolving to source`);
                        return this.resolveSymbolThroughImports(symbol); // Show what it imports
                    }
                }

                return symbol;
            }

            /**
             * Find if the position is within an import statement.
             * Returns the Use symbol if position is within any import's contextSpan.
             */
            private findImportAtPosition(position: AST.Span, scope: Scope): Symbol | null {
                // Check all symbols in this scope for Use symbols
                for (const symbol of scope.symbols.values()) {
                    if (symbol.kind === SymbolKind.Use) {
                        const contextSpan = symbol.contextSpan;
                        // Check if position is within this import statement
                        if (position.start >= contextSpan.start && position.start <= contextSpan.end) {
                            console.log(`[ScopeManager] Found position within import: ${symbol.name} (alias: ${symbol.importAlias || 'none'}, context: ${contextSpan.start}-${contextSpan.end})`);
                            return symbol;
                        }
                    }
                }
                return null;
            }

            /**
             * Check if the position is on the symbol's definition/declaration.
             * Returns true if hovering on where the symbol is defined, false if hovering on usage.
             */
            private isPositionOnSymbolDefinition(position: AST.Span, symbol: Symbol): boolean {
                // For Use symbols, check BOTH targetSpan and contextSpan
                // because the import statement spans across "use x from ..."
                if (symbol.kind === SymbolKind.Use) {
                    const contextSpan = symbol.contextSpan;
                    const targetSpan = symbol.targetSpan;

                    // Check if position is anywhere within the import statement (contextSpan)
                    const isInContext = position.start >= contextSpan.start && position.start <= contextSpan.end;

                    console.log(`[ScopeManager] Checking Use symbol ${symbol.name}:`);
                    console.log(`  - position: ${position.start}-${position.end}`);
                    console.log(`  - contextSpan: ${contextSpan.start}-${contextSpan.end}`);
                    console.log(`  - targetSpan: ${targetSpan?.start}-${targetSpan?.end}`);
                    console.log(`  - isInContext: ${isInContext}`);

                    return isInContext;
                }

                // For other symbols, check target span only
                const targetSpan = symbol.targetSpan || symbol.contextSpan;
                const isOnTarget = position.start >= targetSpan.start && position.start <= targetSpan.end;

                console.log(`[ScopeManager] Checking if position ${position.start}-${position.end} is on definition of ${symbol.name} (target: ${targetSpan.start}-${targetSpan.end}): ${isOnTarget}`);

                return isOnTarget;
            }

            /**
             * Resolve a symbol through imports to get the actual underlying symbol.
             * If the symbol is a Use (import), this follows the chain to find the real definition.
             */
            private resolveSymbolThroughImports(symbol: Symbol): Symbol {
                // If not an import, return as-is
                if (symbol.kind !== SymbolKind.Use) {
                    return symbol;
                }

                console.log(`[ScopeManager] Resolving import symbol: ${symbol.name} (alias: ${symbol.importAlias || 'none'})`);

                // Try to find the source symbol by ID
                if (symbol.sourceSymbol) {
                    const sourceSymbol = this.symbolTable.get(symbol.sourceSymbol);
                    if (sourceSymbol) {
                        console.log(`[ScopeManager] Resolved via sourceSymbol ID to: ${sourceSymbol.name} (${sourceSymbol.kind}) in module ${sourceSymbol.module}`);
                        return sourceSymbol;
                    }
                }

                // Fallback: Search by import information
                if (symbol.importSource) {
                    console.log(`[ScopeManager] Searching in module "${symbol.importSource}"`);

                    // The original imported name might be different from symbol.name if there's an alias
                    // If symbol has an alias, we need to find what the original name was
                    // For "use x as y", symbol.name is "y", but we need to search for "x" in the source module

                    // Find the source module scope
                    for (const scope of this.scopes.values()) {
                        if (scope.kind === ScopeKind.Module && scope.name === symbol.importSource) {
                            console.log(`[ScopeManager] Found source module scope: ${scope.name}`);

                            // If there's an alias, the original name should be stored somewhere
                            // Check metadata for original name
                            const originalName = symbol.metadata?.originalImportName as string | undefined;
                            const searchName = originalName || symbol.name;

                            console.log(`[ScopeManager] Looking for symbol "${searchName}" in source module`);

                            // Look for the symbol in that module
                            const sourceSymbol = scope.symbols.get(searchName);
                            if (sourceSymbol && sourceSymbol.kind !== SymbolKind.Use) {
                                console.log(`[ScopeManager] Found source symbol: ${sourceSymbol.name} (${sourceSymbol.kind})`);
                                return sourceSymbol;
                            }

                            // If not found with that name, try all exported symbols
                            console.log(`[ScopeManager] Symbol not found directly, checking all exported symbols`);
                            for (const [name, sym] of scope.symbols.entries()) {
                                if (sym.isExported && sym.kind !== SymbolKind.Use) {
                                    console.log(`[ScopeManager]   - Found exported: ${name} (${sym.kind})`);
                                    // For now, if there's an alias but we can't find the original, return first exported
                                    if (originalName === name || (!originalName && name === symbol.name)) {
                                        return sym;
                                    }
                                }
                            }

                            break;
                        }
                    }
                }

                // If we can't resolve, return the import symbol itself
                console.log(`[ScopeManager] Could not resolve import, returning import symbol`);
                return symbol;
            }

            /**
             * Find the narrowest (most specific) scope that contains the given position.
             * This walks the scope tree depth-first to find the deepest scope containing the position.
             *
             * @param position - The position to search for
             * @param rootScopeId - Optional: Start search from this scope instead of global
             */
            private findNarrowestScopeAtPosition(position: AST.Span, rootScopeId?: ScopeId): Scope | null {
                let narrowestScope: Scope | null = null;
                let maxDepth = -1;

                // Helper to check if a span contains a position
                const spanContainsPosition = (scopeSpan: AST.Span | undefined, pos: AST.Span): boolean => {
                    if (!scopeSpan) return false;

                    // Position is within scope if it's between scope's start and end
                    return pos.start >= scopeSpan.start && pos.end <= scopeSpan.end;
                };

                // Helper to check if scope contains symbols near the position
                const scopeContainsSymbolsNearPosition = (scope: Scope, pos: AST.Span): boolean => {
                    for (const symbol of scope.symbols.values()) {
                        const symbolSpan = symbol.targetSpan || symbol.contextSpan;

                        // Check if symbol is close to or contains the position
                        if (Math.abs(symbolSpan.start - pos.start) < 1000 || // Within 1000 chars
                            spanContainsPosition(symbolSpan, pos)) {
                            return true;
                        }
                    }
                    return false;
                };

                // Recursive function to search scopes
                const searchScope = (scopeId: ScopeId, depth: number) => {
                    const scope = this.getScope(scopeId);

                    // Check if this scope contains the position
                    const scopeSpan = scope.metadata?.span as AST.Span | undefined;

                    let containsPosition = false;

                    if (scopeSpan) {
                        containsPosition = spanContainsPosition(scopeSpan, position);
                    } else if (scope.kind === ScopeKind.Module) {
                        // For module scopes, check if they have symbols near this position
                        containsPosition = scopeContainsSymbolsNearPosition(scope, position);
                    } else {
                        // For other scopes, check if any symbols contain the position
                        for (const symbol of scope.symbols.values()) {
                            if (spanContainsPosition(symbol.contextSpan, position) ||
                                (symbol.targetSpan && spanContainsPosition(symbol.targetSpan, position))) {
                                containsPosition = true;
                                break;
                            }
                        }
                    }

                    if (containsPosition && depth > maxDepth) {
                        narrowestScope = scope;
                        maxDepth = depth;
                    }

                    // Search children regardless (they might be more specific)
                    for (const childId of scope.children) {
                        searchScope(childId, depth + 1);
                    }
                };

                // Start search from specified scope or global scope
                const startScopeId = rootScopeId ?? this.globalScope.id;
                searchScope(startScopeId, 0);

                // If we found no scope, try to find by analyzing all symbols (within root scope)
                if (!narrowestScope) {
                    console.log(`[ScopeManager] No scope found via tree search, searching by symbol proximity`);
                    narrowestScope = this.findScopeBySymbolProximity(position, rootScopeId);
                }

                // Final fallback: return the root scope
                if (!narrowestScope) {
                    console.log(`[ScopeManager] Using root scope as final fallback`);
                    narrowestScope = rootScopeId ? this.getScope(rootScopeId) : this.globalScope;
                }

                return narrowestScope;
            }

            /**
             * Find scope by symbol proximity - looks for symbols closest to position.
             * This is used as a fallback when scope span information is not available.
             *
             * @param position - The position to search near
             * @param rootScopeId - Optional: Restrict search to this scope and its children
             */
            private findScopeBySymbolProximity(position: AST.Span, rootScopeId?: ScopeId): Scope | null {
                let bestMatch: { scope: Scope; distance: number; symbol: Symbol } | null = null;

                console.log(`[ScopeManager] Searching by symbol proximity for position ${position.start}-${position.end}${rootScopeId ? ` within scope ${rootScopeId}` : ''}`);

                // Helper to check if scope is within the root scope tree
                const isWithinRootScope = (scope: Scope): boolean => {
                    if (!rootScopeId) return true; // No restriction

                    let current: Scope | null = scope;
                    while (current) {
                        if (current.id === rootScopeId) return true;
                        current = current.parent !== null ? this.getScope(current.parent) : null;
                    }
                    return false;
                };

                // Search all module and function scopes
                for (const scope of this.scopes.values()) {
                    // Skip global scope
                    if (scope.kind === ScopeKind.Global) continue;

                    // If rootScopeId specified, only search within that scope tree
                    if (rootScopeId && !isWithinRootScope(scope)) {
                        continue;
                    }

                    // Prioritize Module and Function scopes
                    if (scope.kind === ScopeKind.Module || scope.kind === ScopeKind.Function) {
                        for (const symbol of scope.symbols.values()) {
                            const symbolSpan = symbol.contextSpan;

                            // If position is within this symbol's context span, this is likely the right scope
                            if (position.start >= symbolSpan.start && position.start <= symbolSpan.end) {
                                console.log(`[ScopeManager] Found scope by direct containment: ${scope.name} (symbol: ${symbol.name})`);
                                return scope;
                            }

                            // Calculate distance from position to symbol
                            const distance = Math.abs(symbolSpan.start - position.start);

                            // Track the closest symbol (likely in the same scope as our position)
                            if (!bestMatch || distance < bestMatch.distance) {
                                bestMatch = { scope, distance, symbol };
                            }
                        }
                    }
                }

                if (bestMatch) {
                    console.log(`[ScopeManager] Found scope by proximity: ${bestMatch.scope.name} (closest symbol: ${bestMatch.symbol.name}, distance: ${bestMatch.distance})`);
                    return bestMatch.scope;
                }

                return null;
            }

            /**
            * Public method to get symbol at a specific position (used by LSP).
            * This checks if the position directly points to a symbol definition.
            */
            getSymbolAtPosition(position: AST.Span): Symbol | null {
                // First, try to find if the position directly points to a symbol
                for (const symbol of this.symbolTable.values()) {
                    const targetSpan = symbol.targetSpan || symbol.contextSpan;

                    // Check if position is exactly on this symbol
                    if (position.start >= targetSpan.start && position.start <= targetSpan.end) {
                        console.log(`[ScopeManager] Found symbol directly at position: ${symbol.name}`);
                        return symbol;
                    }
                }

                return null;
            }

        // └──────────────────────────────────────────────────────────────────────┘
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝