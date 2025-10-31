// SymbolCollector.ts – Symbol collection Phase.
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST                 from '@je-es/ast';
    import { AnalysisPhase }        from '../components/ContextTracker';
    import { DiagCode, DiagKind }   from '../components/DiagnosticManager';
    import { Scope, Symbol, SymbolKind, ScopeKind }
                                    from '../components/ScopeManager';
    import { PathUtils }            from '../utils/PathUtils';
    import { PhaseBase }            from '../interfaces/PhaseBase';
    import { AnalysisConfig }       from '../ast-analyzer';
    import { BuiltinConfig }        from '@je-es/syntax';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    interface PathResolutionContext {
        rootPath                    ?: string;
        currentModulePath           ?: string;
        pathMappings                : Map<string, string>;
    }

    interface CollectionStats {
        modulesProcessed            : number;
        symbolsCollected            : number;
        importResolutionFailures    : number;
        scopesCreated               : number;
        startTime                   : number;
        syntheticSymbolsInjected    : number;
    }

    interface TypeCollectionContext {
        visitedTypes                : Set<string>;
        currentTypePath             : string[];
        nestingDepth                : number;
        maxNestingDepth             : number;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class SymbolCollector extends PhaseBase {

        // ┌──────────────────────────────── INIT ────────────────────────────────┐

            private pathContext     : PathResolutionContext     = { pathMappings: new Map() };
            private stats           : CollectionStats           = this.initStats();
            private typeContext     : TypeCollectionContext     = this.initTypeContext();
            private typeRegistry    : Map<string, Symbol> = new Map();
            private moduleExports   : Map<string, Set<string>> = new Map(); // moduleName -> exported symbol names

            constructor( config : AnalysisConfig ) {
                super(AnalysisPhase.Collection, config);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ────────────────────────────────┐

            handle(): boolean {
                try {
                    this.log('verbose', 'Starting symbol collection phase...');
                    this.stats.startTime = Date.now();
                    const globalScope = this.config.services.scopeManager.getCurrentScope();

                    if (!this.init()) { return false; }
                    if (!this.buildPathMappings()) { return false; }
                    if (!this.collectBuiltins(globalScope)) { return false; }

                    // Print Builtins
                    {
                        // get all symbols from the global scope
                        const symbols = this.config.services.scopeManager.getScope(globalScope.id).symbols;

                        // console.log('Builtins:');
                        // for (const symbol of symbols) {
                        //     console.log(`  ${JSON.stringify(symbol, null, 2)}`);
                        // }
                    }

                    if (!this.collectAllModules()) { return false; }

                    this.logStatistics();
                    return !this.config.services.diagnosticManager.hasErrors();

                } catch (error) {
                    this.log('errors', `Fatal error during symbol collection: ${error}`);
                    this.reportError( DiagCode.INTERNAL_ERROR, `Fatal error during symbol collection: ${error}` );
                    console.error(error);
                    return false;
                }
            }

            reset(): void {
                this.pathContext    = { pathMappings: new Map() };
                this.stats          = this.initStats();
                this.typeContext    = this.initTypeContext();
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌────────────────────────── [1] Program Level ─────────────────────────┐

            private buildPathMappings(): boolean {
                this.log('verbose', 'Building module path mappings...');
                this.pathContext.pathMappings.clear();

                const rootPath = this.config.program!.metadata?.path as string | undefined;
                if (!rootPath) {
                    this.reportWarning( DiagCode.MODULE_NOT_FOUND, 'No root path found in program metadata' );
                    return false; // stop immediately
                }

                this.pathContext.rootPath = rootPath;

                for (const [moduleName, module] of this.config.program!.modules) {
                    const modulePath = module.metadata?.path as string | undefined;
                    if (!modulePath) {
                        this.reportWarning( DiagCode.MODULE_NOT_FOUND, `No file path found for module ${moduleName}` );
                        continue;
                    }

                    try {
                        const relativePath = PathUtils.getRelativePath(rootPath, modulePath);
                        const normalizedPath = PathUtils.normalizePath(relativePath);

                        // Detect path collisions
                        if (this.pathContext.pathMappings.has(normalizedPath)) {
                            const existing = this.pathContext.pathMappings.get(normalizedPath)!;
                            if (existing !== moduleName) {
                                this.reportError(
                                    DiagCode.MODULE_NOT_FOUND,
                                    `Path collision: '${normalizedPath}' maps to both '${existing}' and '${moduleName}'`
                                );
                                return false; // Stop immediately - invalid program
                            }
                        }

                        this.pathContext.pathMappings.set(modulePath, moduleName);
                        this.pathContext.pathMappings.set(relativePath, moduleName);
                        this.pathContext.pathMappings.set(normalizedPath, moduleName);
                        this.log('verbose', `Mapped ${moduleName} -> ${relativePath}`);
                    } catch (error) {
                        this.reportWarning( DiagCode.MODULE_NOT_FOUND, `Failed to map module path for ${moduleName}: ${error}` );
                    }
                }

                return true;
            }

            private collectAllModules(): boolean {
                this.log('verbose', 'Collecting symbols from all modules...');
                // [1] global scope and builtin
                const globalScope = this.config.services.scopeManager.getCurrentScope();

                // [2] ..
                for (const [moduleName, module] of this.config.program!.modules) {
                    this.config.services.contextTracker.pushContextSpan({ start: 0, end: 0 });
                    try {
                        if (!this.collectModule(moduleName, module, globalScope)) {
                            if (this.config.services.contextTracker.getCurrentPhase() === AnalysisPhase.Collection) {
                                this.log('errors', `Failed to collect from module ${moduleName}, continuing...`);
                            }
                        }
                        this.stats.modulesProcessed++;
                    } finally {
                        this.config.services.contextTracker.popContextSpan();
                    }
                }

                return true;
            }

            private collectBuiltins(globalScope: Scope): boolean {
                this.log('verbose', 'Collecting symbols from builtins...');

                // Reset type context for each module
                this.typeContext = this.initTypeContext();

                try {
                    for (const i in this.config.builtin.types) {
                        const stmt = this.config.builtin.types[i].stmt;
                        this.log('symbols', `Collect def [${stmt.getDef()!.ident.name}] builtin`)
                        this.collectDefStmt(stmt.getDef()!, globalScope, 'global-scope-module');

                        // set symbol to builtin
                        const symbol = this.config.services.scopeManager.lookupSymbol(stmt.getDef()!.ident.name);
                        if (symbol) {
                            if(!symbol.metadata) symbol.metadata = {};
                            symbol.metadata!.isBuiltin = true;
                        }
                    }

                    for (const i in this.config.builtin.functions) {
                        const stmt = this.config.builtin.functions[i].stmt;
                        this.log('symbols', `Collect func [${stmt.getFunc()!.ident.name}] builtin`)
                        this.collectFuncStmt(stmt.getFunc()!, globalScope, 'global-scope-module');

                        // set symbol to builtin
                        const symbol = this.config.services.scopeManager.lookupSymbol(stmt.getFunc()!.ident.name);
                        if (symbol) {
                            if(!symbol.metadata) symbol.metadata = {};
                            symbol.metadata!.isBuiltin = true;
                        }
                    }

                    return true;

                } catch (error) {
                    this.log('errors', `Fatal error during symbol collection: ${error}`);
                    this.reportError( DiagCode.INTERNAL_ERROR, `Fatal error during symbol collection: ${error}` );
                    console.error(error);
                    return false;
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌────────────────────────── [2] Module Level ──────────────────────────┐

            private collectModule(moduleName: string, module: AST.Module, parentScope: Scope): boolean {
                this.log('symbols', `Collecting from module '${moduleName}'`);

                // Reset type context for each module
                this.typeContext = this.initTypeContext();

                try {
                    this.config.services.contextTracker.setModuleName(moduleName);
                    const modulePath = module.metadata?.path as string;
                    if (modulePath) {
                        this.config.services.contextTracker.setModulePath(modulePath);
                        this.pathContext.currentModulePath = modulePath;
                    }

                    const moduleScope = this.createModuleScope(moduleName, parentScope);

                    // PASS 1: Collect all local definitions FIRST
                    for (const statement of module.statements) {
                        if (statement.kind === 'def' || statement.kind === 'let' || statement.kind === 'func') {
                            this.collectStmt(statement, moduleScope, moduleName);
                        }
                    }

                    // PASS 2: Then process imports
                    for (const statement of module.statements) {
                        if (statement.kind === 'use') {
                            this.collectStmt(statement, moduleScope, moduleName);
                        }
                    }

                    // PASS 3: Process everything else
                    for (const statement of module.statements) {
                        if (statement.kind !== 'def' && statement.kind !== 'let' &&
                            statement.kind !== 'func' && statement.kind !== 'use') {
                            this.collectStmt(statement, moduleScope, moduleName);
                        }
                    }

                    return true;

                } catch (error) {
                    this.reportError( DiagCode.MODULE_NOT_FOUND, `Failed to collect symbols from module '${moduleName}': ${error}` );
                    return false;
                }
            }

            private createModuleScope(moduleName: string, parentScope: Scope): Scope {
                const moduleScope = this.config.services.scopeManager.createScope(ScopeKind.Module, moduleName, parentScope.id);
                this.incrementScopesCreated();
                this.log('scopes', `Created module scope ${moduleScope.id} for '${moduleName}'`);
                return moduleScope;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── [3] Stmt Level ───────────────────────────┐

            private collectStmt(stmt: AST.StmtNode, currentScope: Scope, moduleName: string): void {
                if (!stmt) {
                    this.reportError(DiagCode.ANALYSIS_ERROR, 'Found null statement during collection');
                    return;
                }

                this.log('verbose', `Collecting from ${stmt.kind} statement`);
                this.config.services.contextTracker.pushContextSpan(stmt.span);

                try {
                    // Nest withScope and withSavedState for complete safety
                    this.config.services.scopeManager.withScope(currentScope.id, () => {
                        this.config.services.contextTracker.withSavedState(() => {
                            this.config.services.contextTracker.setScope(currentScope.id);

                            this.processStmtByKind(stmt, {
                                'section'   : (n) => this.collectSectionStmt(n, currentScope, moduleName),
                                'block'     : (n) => this.collectBlockStmt(n, currentScope, moduleName),
                                'test'      : (n) => this.collectTestStmt(n, currentScope, moduleName),
                                'use'       : (n) => this.collectUseStmt(n, currentScope, moduleName),
                                'def'       : (n) => this.collectDefStmt(n, currentScope, moduleName),
                                'let'       : (n) => this.collectLetStmt(n, currentScope, moduleName),
                                'func'      : (n) => this.collectFuncStmt(n, currentScope, moduleName),
                                'expression': (n) => this.collectExpr(n, currentScope, moduleName),

                                'for'       : (n) => this.collectForStmt(n, currentScope, moduleName),
                                'while'     : (n) => this.collectWhileStmt(n, currentScope, moduleName),
                                'do'        : (n) => this.collectDoStmt(n, currentScope, moduleName),

                                'return'    : (n) => this.collectReturnStmt(n, currentScope, moduleName),
                                'defer'     : (n) => this.collectDeferStmt(n, currentScope, moduleName),
                                'throw'     : (n) => this.collectThrowStmt(n, currentScope, moduleName),
                            });
                        });
                    });
                } catch (error) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `Failed to process ${stmt.kind} statement: ${error}`,
                        stmt.span
                    );
                } finally {
                    this.config.services.contextTracker.popContextSpan();
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────── [3.1] BLOCK ─────────────────────────────┐

            private createBlockScope(parentScope: Scope): Scope {
                const blockScope = this.config.services.scopeManager.createScope(ScopeKind.Block, 'block', parentScope.id);
                this.incrementScopesCreated();
                this.log('scopes', `Created block scope ${blockScope.id} under parent ${parentScope.id}`);
                return blockScope;
            }

            private collectBlockStmt(blockNode: AST.BlockStmtNode, parentScope: Scope, moduleName: string): void {
                const blockScope = this.createBlockScope(parentScope);

                this.config.services.scopeManager.withScope(blockScope.id, () => {
                    this.config.services.contextTracker.withSavedState(() => {
                        this.config.services.contextTracker.setScope(blockScope.id);

                        for (const stmt of blockNode.stmts) {
                            this.collectStmt(stmt, blockScope, moduleName);
                        }
                    });
                });
            }

            private collectSectionStmt(sectionNode: AST.SectionStmtNode, parentScope: Scope, moduleName: string): void {
                for (const stmt of sectionNode.stmts) {
                    this.collectStmt(stmt, parentScope, moduleName);
                }
            }

            private collectTestStmt(testNode: AST.TestStmtNode, scope: Scope, moduleName: string): void {
                this.collectBlockStmt(testNode.block, scope, moduleName);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.2] USE ──────────────────────────────┐

            private createUseSymbol(
                useNode: AST.UseStmtNode,
                currentScope: Scope,
                moduleName: string,
                targetModuleName?: string,
            ): Symbol {
                const symbolName = this.extractImportSymbolName(useNode);

                // Handle wildcard vs specific import spans
                const targetSpan = useNode.alias
                    ? useNode.alias.span
                    : useNode.targetArr
                        ? useNode.targetArr[useNode.targetArr.length - 1].span
                        : useNode.span; // Fallback for wildcard without proper span

                const symbol = this.createBaseSymbol(
                    symbolName,
                    SymbolKind.Use,
                    currentScope,
                    moduleName,
                    useNode.span,
                    targetSpan
                );

                const isModuleScope = currentScope.kind === ScopeKind.Module;
                const isPublic = useNode.visibility.kind === 'Public';

                // Handle wildcard import metadata
                const metadata: any = {};

                if (!useNode.targetArr) {
                    // Wildcard import
                    metadata.isWildcardImport = true;
                    metadata.exportedSymbols = targetModuleName
                        ? Array.from(this.getModuleExports(targetModuleName) || [])
                        : [];
                } else if (useNode.targetArr.length > 1) {
                    // Multi-part member path
                    metadata.memberPath = useNode.targetArr.map(t => t.name);
                    metadata.needsFullResolution = true;
                }

                return {
                    ...symbol,
                    initialized     : true,
                    visibility      : useNode.visibility,
                    isExported      : isModuleScope && isPublic,
                    importSource    : targetModuleName,
                    importPath      : targetModuleName ? useNode.path : undefined,
                    importAlias     : targetModuleName ? useNode.alias?.name : undefined,
                    metadata        : Object.keys(metadata).length > 0 ? metadata : undefined,
                    declared        : false, // ⚠️ Not declared until resolution validates it
                };
            }

            private collectUseStmt(useNode: AST.UseStmtNode, currentScope: Scope, moduleName: string): void {
                this.log('symbols', 'Collecting use statement');

                try {
                    if (useNode.path) {
                        this.processModuleImport(useNode, currentScope, moduleName);
                    } else {
                        this.processLocalUse(useNode, currentScope, moduleName);
                    }
                } catch (error) {
                    this.reportError( DiagCode.ANALYSIS_ERROR, `Failed to process use statement: ${error}`, useNode.span );
                }
            }

            private extractImportSymbolName(useNode: AST.UseStmtNode, allow_alias = true): string {
                if (allow_alias && useNode.alias) {
                    return useNode.alias.name;
                }

                // Handle wildcard import
                if (!useNode.targetArr) {
                    // Must have alias for wildcard
                    if (!useNode.alias) {
                        this.reportError(
                            DiagCode.ANALYSIS_ERROR,
                            `Wildcard import requires an alias (use * as <name> from "...")`,
                            useNode.span
                        );
                        return '<invalid>';
                    }
                    return useNode.alias.name;
                }

                const isJustIdent = useNode.targetArr.length === 1;

                if(isJustIdent) {
                    return useNode.targetArr[0].name;
                } else {
                    return useNode.targetArr[useNode.targetArr.length - 1].name;
                }
            }

            private processModuleImport(useNode: AST.UseStmtNode, currentScope: Scope, moduleName: string): void {
                if (!this.config.program! || !useNode.path) {
                    this.reportError(DiagCode.MODULE_NOT_FOUND, 'Invalid import: missing path', useNode.span);
                    return;
                }

                const currentModule = this.config.program!.modules.get(moduleName);
                const currentModulePath = currentModule?.metadata?.path as string | undefined;

                if (!PathUtils.validatePath(this.config.program!, useNode.path, currentModulePath)) {
                    this.reportError(DiagCode.MODULE_NOT_FOUND, `Module not found in path '${useNode.path}'`, useNode.pathSpan);
                    this.stats.importResolutionFailures++;
                    return;
                }

                const resolvedPath = PathUtils.resolveModulePath(this.config.program!, useNode.path, currentModulePath);
                const targetModuleName = PathUtils.findModuleNameByPath(this.config.program!, resolvedPath);

                if (!targetModuleName) {
                    this.reportError(DiagCode.MODULE_NOT_FOUND, `Could not resolve module name for path: ${useNode.path}`, useNode.span);
                    this.stats.importResolutionFailures++;
                    return;
                }

                const targetModule = this.config.program!.modules.get(targetModuleName);
                if (!targetModule) {
                    this.reportError(DiagCode.MODULE_NOT_FOUND, `Target module '${targetModuleName}' not found`, useNode.span);
                    this.stats.importResolutionFailures++;
                    return;
                }

                // Handle wildcard import
                if (!useNode.targetArr) {
                    this.processWildcardImport(useNode, targetModule, targetModuleName, currentScope, moduleName);
                    return;
                }

                // Existing validation for specific imports
                if (!this.validateMemberPathInModule(targetModule, useNode.targetArr, useNode)) {
                    this.reportError(DiagCode.SYMBOL_NOT_FOUND, `Symbol '${useNode.targetArr[0].name}' not found in module '${targetModuleName}'`, useNode.targetArr[0].span);
                    this.stats.importResolutionFailures++;
                    return;
                }

                const symbolName = this.extractImportSymbolName(useNode);

                // Check for duplicate imports
                const existingImport = currentScope.symbols.get(symbolName);
                if (existingImport && existingImport.kind === SymbolKind.Use && existingImport.importSource === targetModuleName) {
                    this.reportWarning(
                        DiagCode.DUPLICATE_SYMBOL,
                        `Symbol '${symbolName}' already imported from module '${targetModuleName}'`,
                        useNode.alias?.span ?? useNode.targetArr[useNode.targetArr.length - 1].span
                    );
                }

                if(this.checkForShadowing(symbolName, currentScope, SymbolKind.Use, useNode.alias?.span ?? useNode.targetArr[useNode.targetArr.length - 1].span)) {
                    return;
                }

                const rootSymbolName = useNode.targetArr[0].name;
                if (!this.canImportSymbol(targetModuleName, rootSymbolName)) {
                    this.reportError(
                        DiagCode.SYMBOL_NOT_EXPORTED,
                        `Symbol '${rootSymbolName}' is private in module '${targetModuleName}'`,
                        useNode.targetArr[0].span
                    );
                    this.stats.importResolutionFailures++;
                    return;
                }

                const useSymbol = this.createUseSymbol(useNode, currentScope, moduleName, targetModuleName);
                this.config.services.scopeManager.addSymbolToScope(useSymbol, currentScope.id);
                this.incrementSymbolsCollected();

                this.log('verbose', `Resolved import ${useNode.path} -> ${targetModuleName}.${useNode.targetArr.map(t => t.name).join('.')}`);
            }

            private processWildcardImport(
                useNode: AST.UseStmtNode,
                targetModule: AST.Module,
                targetModuleName: string,
                currentScope: Scope,
                moduleName: string
            ): void {
                if (!useNode.alias) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `Wildcard import requires an alias (use * as <name> from "...")`,
                        useNode.span
                    );
                    return;
                }

                const aliasName = useNode.alias.name;

                // Check for shadowing
                if(this.checkForShadowing(aliasName, currentScope, SymbolKind.Use, useNode.alias.span)) {
                    return;
                }

                // Get all exported symbols from target module
                const exports = this.getModuleExports(targetModuleName);
                if (!exports || exports.size === 0) {
                    this.reportWarning(
                        DiagCode.ANALYSIS_ERROR,
                        `Module '${targetModuleName}' has no exported symbols`,
                        useNode.span
                    );
                }

                // Create a special symbol for the wildcard import
                const symbol = this.createBaseSymbol(
                    aliasName,
                    SymbolKind.Use,
                    currentScope,
                    moduleName,
                    useNode.span,
                    useNode.alias.span
                );

                const isModuleScope = currentScope.kind === ScopeKind.Module;
                const isPublic = useNode.visibility.kind === 'Public';

                const wildcardSymbol: Symbol = {
                    ...symbol,
                    initialized     : true,
                    visibility      : useNode.visibility,
                    isExported      : isModuleScope && isPublic,
                    importSource    : targetModuleName,
                    importPath      : useNode.path,
                    importAlias     : aliasName,
                    metadata        : {
                        isWildcardImport: true,
                        exportedSymbols: exports ? Array.from(exports) : []
                    },
                    declared        : false, // Will be resolved later
                };

                this.config.services.scopeManager.addSymbolToScope(wildcardSymbol, currentScope.id);
                this.incrementSymbolsCollected();

                this.log('verbose', `Collected wildcard import from '${targetModuleName}' as '${aliasName}'`);
            }

            private processLocalUse(useNode: AST.UseStmtNode, currentScope: Scope, moduleName: string): void {
                // Wildcard not supported for local use
                if (!useNode.targetArr) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `Wildcard import not supported for local use. Use 'use * as x from "path"' for module imports`,
                        useNode.span
                    );
                    return;
                }

                const symbolName = this.extractImportSymbolName(useNode);

                if(this.checkForShadowing(symbolName, currentScope, SymbolKind.Use, useNode.alias?.span ?? useNode.targetArr[0].span)) {
                    return;
                }

                const useSymbol = this.createUseSymbol(useNode, currentScope, moduleName);
                this.config.services.scopeManager.addSymbolToScope(useSymbol, currentScope.id);
                this.incrementSymbolsCollected();
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.3] DEF ──────────────────────────────┐

            private createDefSymbol(defNode: AST.DefStmtNode, scope: Scope, moduleName: string): Symbol {
                const symbol = this.createBaseSymbol(
                    defNode.ident.name,
                    SymbolKind.Definition,
                    scope,
                    moduleName,
                    defNode.span,
                    defNode.ident.span
                );

                const isModuleScope = scope.kind === ScopeKind.Module;
                const isPublic = defNode.visibility.kind === 'Public';

                return {
                    ...symbol,
                    type: defNode.type ?? null,
                    initialized: true,
                    visibility: defNode.visibility,
                    isExported: isModuleScope && isPublic  // Set export flag
                };
            }

            private collectDefStmt(defNode: AST.DefStmtNode, scope: Scope, moduleName: string): void {
                this.log('symbols', `Collecting definition '${defNode.ident.name}'`);

                if(this.checkForShadowing(defNode.ident.name, scope, SymbolKind.Definition, defNode.ident.span)) {
                    return;
                }


                const symbol = this.createDefSymbol(defNode, scope, moduleName);
                this.config.services.scopeManager.addSymbolToScope(symbol, scope.id);
                this.incrementSymbolsCollected();

                this.trackModuleExport(moduleName, defNode.ident.name, symbol.isExported);

                // Register type name for resolution
                this.typeRegistry.set(defNode.ident.name, symbol);

                this.collectType(defNode.type, scope, moduleName, defNode.ident.name);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.4] LET ──────────────────────────────┐

            private createLetSymbol(varNode: AST.LetStmtNode, scope: Scope, moduleName: string): Symbol {
                const symbol = this.createBaseSymbol(
                    varNode.field.ident.name,
                    SymbolKind.Variable,
                    scope,
                    moduleName,
                    varNode.field.span,
                    varNode.field.ident.span
                );

                const isModuleScope = scope.kind === ScopeKind.Module;
                const isPublic = varNode.field.visibility.kind === 'Public'

                return {
                    ...symbol,
                    type            : varNode.field.type ?? null,
                    initialized     : !!varNode.field.initializer,
                    visibility      : varNode.field.visibility,
                    mutability      : varNode.field.mutability,
                    isExported      : isModuleScope && isPublic,
                    metadata: {
                        initializer: varNode.field.initializer
                    }
                };
            }

            private collectLetStmt(letNode: AST.LetStmtNode, scope: Scope, moduleName: string): void {
                this.log('symbols', `Collecting let '${letNode.field.ident.name}'`);

                if(this.checkForShadowing(letNode.field.ident.name, scope, SymbolKind.Variable, letNode.field.ident.span, false)) {
                    return;
                }

                this.checkForShadowing(letNode.field.ident.name, scope, SymbolKind.Variable, letNode.field.ident.span, true);

                // Validate error type mutability BEFORE creating symbol
                if (letNode.field.type) {
                    if (letNode.field.type.isErr() && letNode.field.mutability.kind === 'Mutable') {
                        this.reportError(
                            DiagCode.MUTABILITY_MISMATCH,
                            `Error values cannot be stored in mutable variables. Use 'let ${letNode.field.ident.name}: err = ...' instead of 'let mut'`,
                            letNode.field.ident.span
                        );
                        return;
                    }
                }

                const symbol: Symbol = this.createLetSymbol(letNode, scope, moduleName);
                this.config.services.scopeManager.addSymbolToScope(symbol, scope.id);
                this.incrementSymbolsCollected();

                this.trackModuleExport(moduleName, letNode.field.ident.name, symbol.isExported)

                // Handle constructor expressions during collection
                if (letNode.field.initializer) {
                    const initType = this.extractTypeFromInitializer(letNode.field.initializer);
                    if (initType) {
                        letNode.field.type = initType;
                        symbol.type = initType;

                        // If it's a struct, collect its type structure
                        if (initType.isStruct() || initType.isEnum()) {
                            this.collectType(initType, scope, moduleName, letNode.field.ident.name);
                        }
                    }
                }

                // Handle explicit type annotation
                if (letNode.field.type) {
                    this.collectType(letNode.field.type, scope, moduleName, letNode.field.ident.name);
                }

                // Collect initializer expression (for validation during resolution)
                if (letNode.field.initializer && !letNode.field.type) {
                    this.collectExpr(letNode.field.initializer, scope, moduleName);
                }
            }

            private extractTypeFromInitializer(expr: AST.ExprNode): AST.TypeNode | null {
                if (expr.kind !== 'primary') return null;

                const primary = expr.getPrimary();
                if (!primary) return null;

                // // Handle character literals
                // if (primary.kind === 'literal') {
                //     const literal = primary.getLiteral();
                //     if (literal && literal.kind === 'Character') {
                //         const charValue = literal.value as string;

                //         // Empty character literal - cannot infer without context
                //         if (charValue.length === 0) {
                //             return null; // Must be resolved with context in later phases
                //         }

                //         // Get Unicode code point
                //         const codePoint = charValue.codePointAt(0) || 0;

                //         // Non-ASCII = cpoint(u21), ASCII = char(u8)
                //         if (codePoint > 255) {
                //             return AST.TypeNode.asUnsigned(literal.span, 'u21', 21);
                //         } else {
                //             return AST.TypeNode.asUnsigned(literal.span, 'u8', 8);
                //         }
                //     }
                // }

                // Handle anonymous types: struct { x: i32 }, enum { A, B }
                if (primary.kind === 'type') {
                    return primary.getType();
                }

                // Handle constructor syntax: Point { x: 10, y: 20 }
                if (primary.kind === 'object') {
                    const obj = primary.getObject();
                    if (!obj || !obj.ident) return null;

                    // Look up the type symbol
                    const typeSymbol = this.config.services.scopeManager.lookupSymbol(obj.ident.name);
                    if (!typeSymbol || !typeSymbol.type) return null;

                    // Return the type if it's a struct
                    if (typeSymbol.type.isStruct()) {
                        return typeSymbol.type;
                    }
                }

                return null;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.5] FUNC ─────────────────────────────┐

            private determineErrorMode(errorType: AST.TypeNode): 'err-ident' | 'err-group' | 'any-error' | 'self-group' {
                // CASE 1: Direct 'err' type -> any error
                if (errorType.isErr()) {
                    return 'any-error';
                }

                // CASE 2: Inline error set -> self-group
                if (errorType.isErrset()) {
                    return 'self-group';
                }

                // CASE 3: Identifier -> need to check what it refers to
                if (errorType.isIdent()) {
                    const ident = errorType.getIdent()!;

                    // Skip builtin check
                    if (ident.builtin) {
                        return 'any-error';
                    }

                    // Try to find the symbol
                    const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);

                    if (!symbol) {
                        return 'any-error'; // Safe fallback - will be validated in resolver
                    }

                    // Check symbol kind and type
                    if (symbol.kind === SymbolKind.Variable && symbol.type?.isErr()) {
                        return 'err-ident'; // let MyErr: err = ...
                    }

                    if (symbol.kind === SymbolKind.Definition && symbol.type?.isErrset()) {
                        return 'err-group'; // def ErrGroup = errset{...}
                    }
                }

                return 'any-error'; // Safe default
            }

            private extractSelfGroupErrors(errorType: AST.TypeNode | undefined): string[] | undefined {
                if (!errorType || !errorType.isErrset()) {
                    return undefined;
                }

                const errset = errorType.getErrset()!;
                // errset.members are IdentNode[], extract their names
                return errset.members.map(m => m.name);
            }

            private createFuncSymbol(funcNode: AST.FuncStmtNode, scope: Scope, moduleName: string): Symbol {
                const symbol = this.createBaseSymbol(
                    funcNode.ident.name,
                    SymbolKind.Function,
                    scope,
                    moduleName,
                    funcNode.span,
                    funcNode.ident.span
                );

                const isModuleScope = scope.kind === ScopeKind.Module;
                const isPublic = funcNode.visibility.kind === 'Public';

                // DETECT ERROR MODE
                const errorMode = funcNode.errorType
                    ? this.determineErrorMode(funcNode.errorType)
                    : undefined;

                const selfGroupErrors = errorMode === 'self-group'
                    ? this.extractSelfGroupErrors(funcNode.errorType)
                    : undefined;

                return {
                    ...symbol,
                    initialized: true,
                    visibility: funcNode.visibility,
                    isExported: isModuleScope && isPublic,
                    metadata: {
                        callable: true,
                        params: [] as Symbol[],
                        returnType: funcNode.returnType || undefined,
                        errorType: funcNode.errorType || undefined,
                        errorMode,           // NEW
                        selfGroupErrors      // NEW
                    }
                };
            }

            private createFuncScope(functionName: string, parentScope: Scope): Scope {
                const funcScope = this.config.services.scopeManager.createScope(ScopeKind.Function, functionName, parentScope.id);
                this.incrementScopesCreated();
                return funcScope;
            }

            private collectFuncStmt(funcNode: AST.FuncStmtNode, scope: Scope, moduleName: string): void {
                this.log('symbols', `Collecting function '${funcNode.ident.name}'`);

                if(this.checkForShadowing(funcNode.ident.name, scope, SymbolKind.Function, funcNode.ident.span)) {
                    return;
                }

                this.checkForShadowing(funcNode.ident.name, scope, SymbolKind.Function, funcNode.ident.span, true);

                const funcScope = this.createFuncScope(funcNode.ident.name, scope);
                const funcSymbol = this.createFuncSymbol(funcNode, scope, moduleName);

                // COLLECTION PHASE: Mark function as comptime (metadata only)
                const isComptimeFunc = funcNode.comptime.kind === 'Comptime';
                if (!funcSymbol.metadata) {
                    funcSymbol.metadata = {};
                }
                funcSymbol.metadata.isComptimeFunction = isComptimeFunc;

                // Store the function BODY for later evaluation in type validation phase
                if (isComptimeFunc) {
                    funcSymbol.metadata.comptimeFunctionBody = funcNode.body;
                    funcSymbol.metadata.comptimeParameters = funcNode.parameters;
                }

                this.config.services.scopeManager.addSymbolToScope(funcSymbol, scope.id);
                this.incrementSymbolsCollected();
                this.trackModuleExport(moduleName, funcNode.ident.name, funcSymbol.isExported);

                const errorMode = funcNode.errorType
                ? this.determineErrorMode(funcNode.errorType)
                : undefined;

                // MOVED: Check if struct method BEFORE processing
                const parentScope = this.config.services.scopeManager.getScope(scope.id);
                const isStructMethod = parentScope.kind === ScopeKind.Type &&
                                    parentScope.metadata?.typeKind === 'Struct' &&
                                    !(funcNode.visibility.kind === 'Static');

                this.config.services.scopeManager.withScope(funcScope.id, () => {
                    this.config.services.contextTracker.withSavedState(() => {
                        // INJECT SELF FIRST (if struct method)
                        if (isStructMethod) {
                            this.injectSelfParameter(funcScope, parentScope, moduleName);
                        }

                        // INJECT selferr for self-group error mode
                        if (errorMode === 'self-group' && funcNode.errorType) {
                            this.injectSelfErrReference(funcScope, funcNode.errorType, moduleName);
                        }

                        this.collectType(funcNode.returnType, scope, moduleName, funcNode.ident.name);

                        if (funcSymbol.metadata && funcSymbol.metadata.params) {
                            funcSymbol.metadata.params = this.collectParams(funcNode.parameters, funcScope, moduleName);
                        }

                        // Collect function body
                        if (funcNode.body && !funcSymbol.metadata?.isBuiltin) {
                            this.collectStmt(funcNode.body, funcScope, moduleName);
                        }
                    });
                });
            }

            // ───── PARAMS ─────

            private createParamSymbol(paramNode: AST.FieldNode, scope: Scope, moduleName: string): Symbol {
                const symbol = this.createBaseSymbol(
                    paramNode.ident.name,
                    SymbolKind.Parameter,
                    scope,
                    moduleName,
                    paramNode.span,
                    paramNode.ident.span
                );

                return {
                    ...symbol,
                    type            : paramNode.type ?? null,
                    initialized     : true,
                    visibility      : paramNode.visibility ?? 'Private',
                    mutability      : paramNode.mutability,  // Added
                };
            }

            private collectParams(parameters: AST.FieldNode[], funcScope: Scope, moduleName: string): Symbol[] {
                const collectedParams: Symbol[] = [];
                const seenParams = new Set<string>();

                // Check if 'self' already exists (injected by struct method)
                const hasSelfParam = funcScope.symbols.has('self');

                for (const paramNode of parameters) {
                    // Prevent explicit 'self' parameter if already injected
                    if (paramNode.ident.name === 'self' && hasSelfParam) {
                        this.reportError(
                            DiagCode.PARAMETER_SHADOWING,
                            `Duplicate parameter name 'self'`,
                            paramNode.ident.span
                        );
                        continue;
                    }

                    if(this.checkForShadowing(paramNode.ident.name, funcScope, SymbolKind.Parameter, paramNode.ident.span)) {
                        continue;
                    }

                    // Warn if parameter shadows outer scope (like variables in parent function)
                    this.checkForShadowing(paramNode.ident.name, funcScope, SymbolKind.Parameter, paramNode.ident.span, true);

                    seenParams.add(paramNode.ident.name);

                    const paramSymbol = this.createParamSymbol(paramNode, funcScope, moduleName);
                    this.config.services.scopeManager.addSymbolToScope(paramSymbol, funcScope.id);
                    this.incrementSymbolsCollected();
                    collectedParams.push(paramSymbol);

                    if (paramNode.type) {
                        if (paramNode.type.isStruct() || paramNode.type.isEnum()) {
                            const typeScopeName = `${paramNode.ident.name}-type`;
                            const typeScope = this.createTypeScope(typeScopeName, funcScope);

                            if (paramNode.type.isStruct()) {
                                const struct = paramNode.type.getStruct()!;
                                struct.metadata = { ...struct.metadata, scopeId: typeScope.id };
                            } else if (paramNode.type.isEnum()) {
                                const enumType = paramNode.type.getEnum()!;
                                enumType.metadata = { ...enumType.metadata, scopeId: typeScope.id };
                            }

                            this.collectType(paramNode.type, funcScope, moduleName, typeScopeName);
                        } else {
                            this.collectType(paramNode.type, funcScope, moduleName, paramNode.ident.name);
                        }
                    }
                }

                return collectedParams;
            }

            private injectSelfParameter(
                funcScope: Scope,
                structScope: Scope,
                moduleName: string
            ): void {
                // Create a type reference to the parent struct
                const structType = AST.TypeNode.asIdentifier(
                    { start: 0, end: 0 },
                    structScope.name
                );

                const selfSymbol: Symbol = {
                    id              : this.config.services.scopeManager.symbolIdGenerator.next(),
                    name            : 'self',
                    kind            : SymbolKind.Parameter,
                    type            : structType,
                    scope           : funcScope.id,
                    contextSpan     : { start: 0, end: 0 }, // Synthetic - no source location
                    targetSpan      : { start: 0, end: 0 },
                    declared        : true,
                    initialized     : true,
                    used            : true, // Mark as used by default since it's implicit
                    visibility      : { kind: 'Private' },
                    mutability      : { kind: 'Immutable' },
                    isTypeChecked   : false,
                    isExported      : false,
                    module          : moduleName,
                    metadata        : {
                        isSynthetic : true,
                        isSelf      : true
                    }
                };

                this.config.services.scopeManager.addSymbolToScope(selfSymbol, funcScope.id);
                this.stats.syntheticSymbolsInjected++; // Track synthetic symbols separately
                this.incrementSymbolsCollected();

                this.log('symbols', `Injected implicit 'self' parameter in struct method '${funcScope.name}'`);
            }

            private injectSelfErrReference(
                funcScope: Scope,
                errorType: AST.TypeNode,
                moduleName: string
            ): void {
                const selfErrSymbol: Symbol = {
                    id: this.config.services.scopeManager.symbolIdGenerator.next(),
                    name: 'selferr',
                    kind: SymbolKind.Definition,  // It's a type namespace
                    type: errorType,  // Points to the error set
                    scope: funcScope.id,
                    contextSpan: { start: 0, end: 0 },  // Synthetic
                    targetSpan: { start: 0, end: 0 },
                    declared: true,
                    initialized: true,
                    used: false,  // Will be marked used when referenced
                    visibility: { kind: 'Private' },
                    mutability: { kind: 'Immutable' },
                    isTypeChecked: false,
                    isExported: false,
                    module: moduleName,
                    metadata: {
                        isSynthetic: true,
                        isSelfErr: true  // NEW FLAG to identify selferr
                    }
                };

                this.config.services.scopeManager.addSymbolToScope(selfErrSymbol, funcScope.id);
                this.stats.syntheticSymbolsInjected++;

                this.log('symbols', `Injected 'selferr' reference in function with self-group errors`);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.6] LOOP ─────────────────────────────┐

            private collectForStmt(forNode: AST.ForStmtNode, parentScope: Scope, moduleName: string): void {
                const loopScope = this.createLoopScope(parentScope, 'for');

                this.config.services.scopeManager.withScope(loopScope.id, () => {
                    this.config.services.contextTracker.withSavedState(() => {
                        this.config.services.contextTracker.setScope(loopScope.id);
                        this.config.services.contextTracker.enterLoop();

                        this.collectExpr(forNode.expr, loopScope, moduleName);
                        this.collectStmt(forNode.stmt, loopScope, moduleName);
                    });

                    this.config.services.contextTracker.exitLoop();
                });
            }

            private collectWhileStmt(whileNode: AST.WhileStmtNode, parentScope: Scope, moduleName: string): void {
                const loopScope = this.createLoopScope(parentScope, 'while');

                this.config.services.scopeManager.withScope(loopScope.id, () => {
                    this.config.services.contextTracker.withSavedState(() => {
                        this.config.services.contextTracker.setScope(loopScope.id);
                        this.config.services.contextTracker.enterLoop();

                        this.collectExpr(whileNode.expr, loopScope, moduleName);
                        this.collectStmt(whileNode.stmt, loopScope, moduleName);
                    });

                    this.config.services.contextTracker.exitLoop();
                });
            }

            private collectDoStmt(doNode: AST.DoStmtNode, parentScope: Scope, moduleName: string): void {
                const loopScope = this.createLoopScope(parentScope, 'do');

                this.config.services.scopeManager.withScope(loopScope.id, () => {
                    this.config.services.contextTracker.withSavedState(() => {
                        this.config.services.contextTracker.setScope(loopScope.id);
                        this.config.services.contextTracker.enterLoop();

                        this.collectExpr(doNode.expr, loopScope, moduleName);
                        this.collectStmt(doNode.stmt, loopScope, moduleName);
                    });

                    this.config.services.contextTracker.exitLoop();
                });
            }

            private createLoopScope(parentScope: Scope, mode: 'for' | 'while' | 'do'): Scope {
                const loopScope = this.config.services.scopeManager.createScope(ScopeKind.Loop, 'loop', parentScope.id);
                this.incrementScopesCreated();
                this.log('scopes', `Created loop scope ${loopScope.id} under parent ${parentScope.id}`);
                return loopScope;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────── [3.7] CTRLFLOW ──────────────────────────┐

            private collectReturnStmt(n: AST.ReturnStmtNode, scope: Scope, moduleName: string): void {
                if (n.expr) {
                    this.collectExpr(n.expr, scope, moduleName);
                }
            }

            private collectDeferStmt(n: AST.DeferStmtNode, scope: Scope, moduleName: string): void {
                if (n.expr) {
                    this.collectExpr(n.expr, scope, moduleName);
                }
            }

            private collectThrowStmt(n: AST.ThrowStmtNode, scope: Scope, moduleName: string): void {
                if (n.expr) {
                    this.collectExpr(n.expr, scope, moduleName);
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── [4] EXPR Level ───────────────────────────┐

            private createExprScope(parentScope: Scope): Scope {
                const exprScope = this.config.services.scopeManager.createScope(ScopeKind.Expression, 'expr', parentScope.id);
                this.incrementScopesCreated();
                return exprScope;
            }

            private collectExpr(expr: AST.ExprNode, currentScope: Scope, moduleName: string): void {
                let needsScope = false;

                switch (expr.kind) {
                    case 'if':
                    case 'match':
                    case 'try':
                    case 'catch':
                        needsScope = true;
                        break;
                }

                if (needsScope) {
                    const exprScope = this.createExprScope(currentScope);
                    this.config.services.scopeManager.withScope(exprScope.id, () => {
                        this.config.services.contextTracker.withSavedState(() => {
                            this.config.services.contextTracker.setScope(exprScope.id);
                            this.processExprKind(expr, exprScope, moduleName);
                        });
                    });
                } else {
                    this.processExprKind(expr, currentScope, moduleName);
                }
            }

            private processExprKind(expr: AST.ExprNode, scope: Scope, moduleName: string): void {
                switch (expr.kind) {
                    case 'as':
                        this.handleAsExpr(expr.getAs()!, scope, moduleName);
                        break;
                    case 'typeof':
                        return this.processExprKind(expr.getTypeof()!.expr, scope, moduleName);
                    case 'sizeof':
                        return this.processExprKind(expr.getSizeof()!.expr, scope, moduleName);
                    case 'orelse':
                        this.handleOrelseExpr(expr.getOrelse()!, scope, moduleName);
                        break;
                    case 'range':
                        this.handleRangeExpr(expr.getRange()!, scope, moduleName);
                        break;
                    case 'try':
                        this.handleTryExpr(expr.getTry()!, scope, moduleName);
                        break;
                    case 'catch':
                        this.handleCatchExpr(expr.getCatch()!, scope, moduleName);
                        break;
                    case 'if':
                        this.handleIfExpr(expr.getIf()!, scope, moduleName);
                        break;
                    case 'match':
                        this.handleSwitchExpr(expr.getMatch()!, scope, moduleName);
                        break;
                    case 'binary':
                        this.handleBinaryExpr(expr.getBinary()!, scope, moduleName);
                        break;
                    case 'postfix':
                        this.handlePostfixExpr(expr.getPostfix()!, scope, moduleName);
                        break;
                    case 'prefix':
                        this.handlePrefixExpr(expr.getPrefix()!, scope, moduleName);
                        break;
                    case 'primary':
                        this.handlePrimaryExpr(expr.getPrimary()!, scope, moduleName);
                        break;
                }
            }

            private handleAsExpr(asExpr: AST.AsNode, scope: Scope, moduleName: string): void {
                this.collectType(asExpr.type, scope, moduleName);
                this.collectExpr(asExpr.base, scope, moduleName);
            }

            private handleOrelseExpr(orelseExpr: AST.OrelseNode, scope: Scope, moduleName: string): void {
                this.collectExpr(orelseExpr.left, scope, moduleName);
                this.collectExpr(orelseExpr.right, scope, moduleName);
            }

            private handleRangeExpr(rangeExpr: AST.RangeNode, scope: Scope, moduleName: string): void {
                if(rangeExpr.leftExpr) this.collectExpr(rangeExpr.leftExpr, scope, moduleName);
                if(rangeExpr.rightExpr) this.collectExpr(rangeExpr.rightExpr, scope, moduleName);
            }

            private handleTryExpr(tryExpr: AST.TryNode, scope: Scope, moduleName: string): void {
                this.collectExpr(tryExpr.expr, scope, moduleName);
            }

            private handleCatchExpr(catchExpr: AST.CatchNode, scope: Scope, moduleName: string): void {
                this.collectExpr(catchExpr.leftExpr, scope, moduleName);
                this.collectStmt(catchExpr.rightStmt, scope, moduleName);
            }

            private handleIfExpr(ifExpr: AST.IfNode, scope: Scope, moduleName: string): void {
                this.collectExpr(ifExpr.condExpr, scope, moduleName);
                this.collectStmt(ifExpr.thenStmt, scope, moduleName);
                if (ifExpr.elseStmt) {
                    this.collectStmt(ifExpr.elseStmt, scope, moduleName);
                }
            }

            private handleSwitchExpr(switchExpr: AST.MatchNode, scope: Scope, moduleName: string): void {
                this.collectExpr(switchExpr.condExpr, scope, moduleName);
                for (const switchCase of switchExpr.cases) {
                    if (switchCase.expr) this.collectExpr(switchCase.expr, scope, moduleName);
                    if (switchCase.stmt) this.collectStmt(switchCase.stmt, scope, moduleName);
                }
                if (switchExpr.defCase) {
                    this.collectStmt(switchExpr.defCase.stmt, scope, moduleName);
                }
            }

            private handleBinaryExpr(binaryExpr: AST.BinaryNode, scope: Scope, moduleName: string): void {
                this.collectExpr(binaryExpr.left, scope, moduleName);
                this.collectExpr(binaryExpr.right, scope, moduleName);
            }

            private handlePostfixExpr(postfixExpr: AST.PostfixNode, scope: Scope, moduleName: string): void {
                switch(postfixExpr.kind) {
                    case 'increment':
                    case 'decrement':
                    case 'dereference':
                        this.collectExpr(postfixExpr.getAsExprNode()!, scope, moduleName);
                        break;
                    case 'call': {
                        const callExpr = postfixExpr.getCall()!;
                        this.collectExpr(callExpr.base, scope, moduleName);
                        for (const arg of callExpr.args) {
                            this.collectExpr(arg, scope, moduleName);
                        }
                        break;
                    }
                    case 'arrayAccess': {
                        const arrayAccess = postfixExpr.getArrayAccess()!;
                        this.collectExpr(arrayAccess.base, scope, moduleName);
                        this.collectExpr(arrayAccess.index, scope, moduleName);
                        break;
                    }
                    case 'memberAccess': {
                        const memberAccess = postfixExpr.getMemberAccess()!;
                        this.collectExpr(memberAccess.base, scope, moduleName);
                        break;
                    }
                }
            }

            private handlePrefixExpr(prefixExpr: AST.PrefixNode, scope: Scope, moduleName: string): void {
                this.collectExpr(prefixExpr.expr, scope, moduleName);
            }

            private handlePrimaryExpr(primaryExpr: AST.PrimaryNode, scope: Scope, moduleName: string): void {
                switch(primaryExpr.kind) {
                    case 'ident': {
                        const ident = primaryExpr.getIdent();
                        if (ident && ident.name === 'self') {
                            this.validateSelfUsage(scope, ident.span);
                        }
                        break;
                    }
                    case 'literal':
                        break;
                    case 'type': {
                        const type = primaryExpr.getType()!;
                        this.collectType(type, scope, moduleName);
                        break;
                    }
                    case 'paren': {
                        const paren = primaryExpr.getParen()!;
                        this.collectExpr(paren.source, scope, moduleName);
                        break;
                    }
                    case 'tuple': {
                        const tuple = primaryExpr.getTuple()!;
                        for (const expr of tuple.fields) {
                            this.collectExpr(expr, scope, moduleName);
                        }
                        break;
                    }
                    case 'object': {
                        const object = primaryExpr.getObject()!;
                        if(object.ident) {
                            this.collectExpr(
                                AST.ExprNode.asIdent(object.ident.span, object.ident.name),
                                scope,
                                moduleName
                            );
                        }
                        for (const field of object.props) {
                            if(field.val) this.collectExpr(field.val, scope, moduleName);
                        }
                        break;
                    }
                    case 'unreachable': {
                        // Unreachable expressions are handled in type validation phase
                        // No symbol collection needed for unreachable expressions
                        break;
                    }
                }
            }

            private validateSelfUsage(currentScope: Scope, span: AST.Span): void {
                let checkScope: Scope | null = currentScope;
                let isInStaticMethod = false;
                let structScope: Scope | null = null;

                while (checkScope) {
                    if (checkScope.kind === ScopeKind.Function) {
                        const parentScope = checkScope.parent !== null
                            ? this.config.services.scopeManager.getScope(checkScope.parent)
                            : null;

                        if (parentScope?.kind === ScopeKind.Type &&
                            parentScope.metadata?.typeKind === 'Struct') {
                            structScope = parentScope;

                            const funcSymbol = parentScope.symbols.get(checkScope.name);
                            if (funcSymbol && funcSymbol.visibility.kind === 'Static') {
                                isInStaticMethod = true;
                            }
                            break;
                        }
                    }

                    checkScope = checkScope.parent !== null
                        ? this.config.services.scopeManager.getScope(checkScope.parent)
                        : null;
                }

                // ALLOW 'self' in static methods (validation happens in member access)
                if (isInStaticMethod && structScope) {
                    // Don't block here - let member access validation handle it
                    return;
                }

                // For non-static contexts, validate as before
                const selfSymbol = this.config.services.scopeManager.lookupSymbolInScopeChain('self', currentScope.id);

                if (!selfSymbol || !selfSymbol.metadata?.isSelf) {
                    this.reportError(
                        DiagCode.UNDEFINED_IDENTIFIER,
                        "self can only be used in instance methods",
                        span
                    );
                    return;
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── [5] Type Level ───────────────────────────┐

            private createTypeScope(typeName: string, parentScope: Scope, typeKind?: 'Struct' | 'Enum'): Scope {
                const typeScope = this.config.services.scopeManager.createScope(ScopeKind.Type, typeName, parentScope.id);

                // Set metadata immediately
                if (typeKind) {
                    typeScope.metadata = {
                        ...typeScope.metadata,
                        typeKind
                    };
                }

                this.incrementScopesCreated();
                return typeScope;
            }

            private collectType(
                type: AST.TypeNode | undefined | null,
                parentScope: Scope,
                moduleName: string,
                newScopeName?: string
            ): void {
                if (!type) return;

                // Use withTypeContext for cycle detection
                this.withTypeContext(type, newScopeName, () => {
                    this.collectTypeInternal(type, parentScope, moduleName, newScopeName);
                });
            }

            private collectTypeInternal(
                type: AST.TypeNode,
                parentScope: Scope,
                moduleName: string,
                newScopeName?: string
            ): void {
                let needsScope = false;
                let typeName = 'Anonymous';
                let typeScope: Scope = parentScope;

                switch(type.kind) {
                    case 'struct':
                        needsScope = true;
                        if (newScopeName) {
                            typeName = newScopeName;
                        } else {
                            const anonId = this.config.services.scopeManager.symbolIdGenerator.next();
                            typeName = `<anonymous-struct-${anonId}>`;
                        }
                        break;
                    case 'enum':
                        needsScope = true;
                        if (newScopeName) {
                            typeName = newScopeName;
                        } else {
                            const anonId = this.config.services.scopeManager.symbolIdGenerator.next();
                            typeName = `<anonymous-enum-${anonId}>`;
                        }
                        break;
                    case 'errset':
                        needsScope = true;
                        typeName = newScopeName || '<anonymous-error>';
                        break;
                }

                if (needsScope) {
                    typeScope = this.createTypeScope(typeName, parentScope);

                    // Set metadata immediately after scope creation
                    switch(type.kind) {
                        case 'struct':
                            typeScope.metadata = { ...typeScope.metadata, typeKind: 'Struct' };
                            break;
                        case 'enum':
                            typeScope.metadata = { ...typeScope.metadata, typeKind: 'Enum' };
                            break;
                        case 'errset':
                            typeScope.metadata = { ...typeScope.metadata, typeKind: 'Error' };
                            break;
                    }

                    // Validate scope ID before use
                    if (!this.config.services.scopeManager.getScope(typeScope.id)) {
                        throw new Error(`Invalid scope ID ${typeScope.id} for type ${typeName}`);
                    }
                }

                try {
                    switch(type.kind) {
                        case 'struct':
                            this.handleStructType(type.getStruct()!, typeScope, moduleName);
                            break;
                        case 'enum':
                            this.handleEnumType(type.getEnum()!, typeScope, moduleName);
                            break;
                        case 'errset':
                            this.collectErrorType(type.getErrset()!, typeScope, moduleName);
                            break;
                        case 'tuple':
                            this.handleTupleType(type.getTuple()!, parentScope, moduleName);
                            break;
                        case 'array':
                            this.handleArrayType(type.getArray()!, parentScope, moduleName);
                            break;
                        case 'optional':
                            this.handleOptionalType(type.getOptional()!, parentScope, moduleName);
                            break;
                        case 'pointer':
                            this.handlePointerType(type.getPointer()!, parentScope, moduleName);
                            break;
                        case 'function':
                            this.handleFunctionType(type.getFunction()!, parentScope, moduleName);
                            break;
                        case 'union':
                            this.handleUnionType(type.getUnion()!, parentScope, moduleName);
                            break;
                        case 'paren':
                            this.collectTypeInternal(type.getParen()!.type, parentScope, moduleName);
                    }
                } catch (error) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `Failed to collect type ${type.kind}: ${error}`
                    );
                }
            }

            private handleStructType(structType: AST.StructTypeNode, typeScope: Scope, moduleName: string): void {
                structType.metadata = { ...structType.metadata, scopeId: typeScope.id };

                // Mark scope so we know this is a struct type scope
                typeScope.metadata = {
                    ...typeScope.metadata,
                    typeKind: 'Struct'  // This line exists but might not be executing
                };

                for (const member of structType.members) {
                    if(!member || !member.kind || !member.source) { continue; }

                    if(member.isField()) {
                        this.collectStructField(member.source as AST.FieldNode, typeScope, moduleName);
                    } else {
                        this.collectFuncStmt(member.source as AST.FuncStmtNode, typeScope, moduleName);
                    }
                }
            }

            private handleEnumType(enumType: AST.EnumTypeNode, typeScope: Scope, moduleName: string): void {
                enumType.metadata = { ...enumType.metadata, scopeId: typeScope.id };

                for (const variant of enumType.variants) {
                    if (typeScope.symbols.has(variant.ident.name)) {
                        this.reportError(
                            DiagCode.ENUM_VARIANT_SHADOWING,
                            `Duplicate enum variant '${variant.ident.name}'`,
                            variant.ident.span
                        );
                        continue;
                    }

                    // ALWAYS collect the variant symbol in the enum scope
                    this.collectEnumVariantIdent(variant.ident, typeScope, moduleName);

                    // THEN handle the associated type if it exists
                    if(variant.type) {
                        const variantScope = this.createTypeScope(variant.ident.name, typeScope);
                        if (variant.type.isStruct()) {
                            const structType = variant.type.getStruct()!;
                            structType.metadata = {
                                ...structType.metadata,
                                scopeId: variantScope.id
                            };

                            this.config.services.scopeManager.withScope(variantScope.id, () => {
                                this.config.services.contextTracker.withSavedState(() => {
                                    this.config.services.contextTracker.setScope(variantScope.id);
                                    this.collectType(variant.type!, variantScope, moduleName, variant.ident.name);
                                });
                            });
                        } else {
                            this.collectType(variant.type, typeScope, moduleName);
                        }
                    }
                }
            }

            private handleTupleType(tupleType: AST.TupleTypeNode, parentScope: Scope, moduleName: string): void {
                for (const field of tupleType.fields) {
                    this.collectType(field, parentScope, moduleName);
                }
            }

            private handleArrayType(arrayType: AST.ArrayTypeNode, parentScope: Scope, moduleName: string): void {
                this.collectType(arrayType.target, parentScope, moduleName);
                if(arrayType.size) this.collectExpr(arrayType.size, parentScope, moduleName);
            }

            private handleOptionalType(optionalType: AST.OptionalTypeNode, parentScope: Scope, moduleName: string): void {
                this.collectType(optionalType.target, parentScope, moduleName);
            }

            private handlePointerType(pointerType: AST.PointerTypeNode, parentScope: Scope, moduleName: string): void {
                this.collectType(pointerType.target, parentScope, moduleName);
            }

            private handleFunctionType(funcType: AST.FunctionTypeNode, parentScope: Scope, moduleName: string): void {
                for (const param of funcType.params) {
                    if (param) {
                        this.collectType(param, parentScope, moduleName);
                    }
                }

                if (funcType.returnType) {
                    this.collectType(funcType.returnType, parentScope, moduleName);
                }

                if (funcType.errorType) {
                    this.collectType(funcType.errorType, parentScope, moduleName);
                }
            }

            private handleUnionType(unionType: AST.UnionTypeNode, parentScope: Scope, moduleName: string): void {
                for (const variant of unionType.types) {
                    // CRITICAL FIX: Create isolated scope for each union member
                    if (variant.isStruct()) {
                        const anonId = this.config.services.scopeManager.symbolIdGenerator.next();
                        const scopeName = `<union-struct-${anonId}>`;
                        const structScope = this.createTypeScope(scopeName, parentScope, 'Struct');

                        const struct = variant.getStruct()!;
                        struct.metadata = { ...struct.metadata, scopeId: structScope.id };

                        this.config.services.scopeManager.withScope(structScope.id, () => {
                            this.config.services.contextTracker.withSavedState(() => {
                                this.config.services.contextTracker.setScope(structScope.id);
                                this.handleStructType(struct, structScope, moduleName);
                            });
                        });
                    } else {
                        // For non-struct types, collect normally BUT in isolation
                        this.collectType(variant, parentScope, moduleName);
                    }
                }
            }

            private collectStructField(fieldNode: AST.FieldNode, scope: Scope, moduleName: string): void {
                this.log('symbols', `Collecting structure field '${fieldNode.ident.name}'`);

                // Validate static fields must be immutable
                if (fieldNode.visibility.kind === 'Static') {
                    if (fieldNode.mutability.kind === 'Mutable') {
                        this.reportError(
                            DiagCode.INVALID_VISIBILITY,
                            `Static field '${fieldNode.ident.name}' cannot be mutable. Static fields must be immutable.`,
                            fieldNode.span
                        );
                        // Force it to be immutable to prevent further errors
                        fieldNode.mutability = { kind: 'Immutable' };
                    }
                }

                // Only check for shadowing WITHIN the struct scope
                if(this.checkForShadowing(fieldNode.ident.name, scope, SymbolKind.StructField, fieldNode.ident.span, false)) {
                    return;
                }

                const symbol: Symbol = this.createStructFieldSymbol(fieldNode, scope, moduleName);
                this.config.services.scopeManager.addSymbolToScope(symbol, scope.id);
                this.incrementSymbolsCollected();

                if(fieldNode.type) {
                    this.collectType(fieldNode.type, scope, moduleName);
                }

                if(fieldNode.initializer) {
                    this.collectExpr(fieldNode.initializer, scope, moduleName);
                }
            }

            private createStructFieldSymbol(fieldNode: AST.FieldNode, scope: Scope, moduleName: string): Symbol {
                const symbol = this.createBaseSymbol(
                    fieldNode.ident.name,
                    SymbolKind.StructField,
                    scope,
                    moduleName,
                    fieldNode.span,
                    fieldNode.ident.span
                );

                return {
                    ...symbol,
                    type            : fieldNode.type ?? null,
                    initialized     : !!fieldNode.initializer,
                    visibility      : fieldNode.visibility ?? 'Private',
                    mutability      : fieldNode.mutability,  // Added
                };
            }

            private collectEnumVariantIdent(identNode: AST.IdentNode, scope: Scope, moduleName: string): void {
                const symbol = this.createEnumVariantSymbol(identNode, scope, moduleName);
                this.config.services.scopeManager.addSymbolToScope(symbol, scope.id);
                this.incrementSymbolsCollected();
            }

            private createEnumVariantSymbol(identNode: AST.IdentNode, scope: Scope, moduleName: string): Symbol {
                return this.createBaseSymbol(
                    identNode.name,
                    SymbolKind.EnumVariant,
                    scope,
                    moduleName,
                    identNode.span,
                    identNode.span
                );
            }

            private collectErrorType(errorType: AST.ErrsetTypeNode, scope: Scope, moduleName: string): void {
                if(errorType.members.length === 0) return;

                const seenErrors = new Set<string>();

                // errorType.members are IdentNode[]
                for (const error of errorType.members) {
                    if (seenErrors.has(error.name)) {
                        this.reportError(
                            DiagCode.ERROR_SHADOWING,
                            `Duplicate error member '${error.name}'`,
                            error.span
                        );
                        continue;
                    }

                    seenErrors.add(error.name);

                    const symbol = this.createErrorSymbol(error, scope, moduleName);
                    this.config.services.scopeManager.addSymbolToScope(symbol, scope.id);
                    this.incrementSymbolsCollected();
                }
            }

            private createErrorSymbol(identNode: AST.NameInfo, scope: Scope, moduleName: string): Symbol {
                return this.createBaseSymbol(
                    identNode.name,
                    SymbolKind.Error,
                    scope,
                    moduleName,
                    identNode.span,
                    identNode.span
                );
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── [x] VALIDATION ───────────────────────────┐

            private checkForShadowing(
                newSymbolName: string,
                currentScope: Scope,
                newSymbolKind: SymbolKind,
                span: AST.Span,
                outer = false
            ): boolean {
                // Special handling for 'self' - ALWAYS check parent scopes too
                if (newSymbolName === 'self') {
                    // For 'self', check both current and parent scopes
                    const existingSymbol = outer
                        ? this.config.services.scopeManager.lookupSymbolInParentScopes('self', currentScope.id)
                        : (currentScope.symbols.get('self') ||
                        this.config.services.scopeManager.lookupSymbolInParentScopes('self', currentScope.id));

                    if (existingSymbol && existingSymbol.metadata?.isSelf) {
                        this.reportError(
                            newSymbolKind === SymbolKind.Parameter
                                ? DiagCode.PARAMETER_SHADOWING
                                : DiagCode.VARIABLE_SHADOWING,
                            newSymbolKind === SymbolKind.Parameter
                                ? `Duplicate parameter name 'self'`
                                : `Symbol 'self' shadows parameter 'self' in ${outer ? 'outer' : 'same'} scope`,
                            span
                        );
                        return true; // Always error for 'self'
                    }
                }

                // Prevent built-in shadowing
                // if (newSymbolName.startsWith('@')) {
                //     this.reportError(
                //         DiagCode.DUPLICATE_SYMBOL,
                //         `Cannot shadow built-in symbol '${newSymbolName}'`,
                //         span
                //     );
                //     return true;
                // }

                const existingSymbol = outer
                    ? this.config.services.scopeManager.lookupSymbolInParentScopes(newSymbolName, currentScope.id)
                    : currentScope.symbols.get(newSymbolName);

                if (existingSymbol) {

                    // Check if we're in a type scope (struct/enum)
                    const isInTypeScope = currentScope.kind === ScopeKind.Type;
                    const existingIsInTypeScope = this.config.services.scopeManager.getScope(existingSymbol.scope).kind === ScopeKind.Type;

                    // If one is in type scope and one isn't, they're in different namespaces
                    if (isInTypeScope !== existingIsInTypeScope && outer) {
                        this.log('verbose',
                            `Symbol '${newSymbolName}' in type scope doesn't shadow module-level symbol (different namespaces)`
                        );
                        return false; // No shadowing - different namespaces
                    }

                    let diagnosticCode: DiagCode;
                    let severity: DiagKind = DiagKind.ERROR;

                    switch (newSymbolKind) {
                        case SymbolKind.Use:
                            diagnosticCode = DiagCode.USE_SHADOWING;
                            break;
                        case SymbolKind.Definition:
                            diagnosticCode = DiagCode.DEFINITION_SHADOWING;
                            break;
                        case SymbolKind.Variable:
                            diagnosticCode = DiagCode.VARIABLE_SHADOWING;
                            if (outer) severity = DiagKind.WARNING;
                            break;
                        case SymbolKind.Function:
                            diagnosticCode = DiagCode.FUNCTION_SHADOWING;
                            if (outer) severity = DiagKind.WARNING;
                            break;
                        case SymbolKind.Parameter:
                            diagnosticCode = DiagCode.PARAMETER_SHADOWING;
                            if (outer) severity = DiagKind.WARNING;
                            break;
                        case SymbolKind.StructField:
                            diagnosticCode = DiagCode.STRUCT_FIELD_SHADOWING;
                            break;
                        case SymbolKind.EnumVariant:
                            diagnosticCode = DiagCode.ENUM_VARIANT_SHADOWING;
                            break;
                        case SymbolKind.Error:
                            diagnosticCode = DiagCode.ERROR_SHADOWING;
                            break;
                        default:
                            return false;
                    }

                    const message = `Symbol '${newSymbolName}' shadows ${(existingSymbol.kind as string).toLowerCase()} '${existingSymbol.name}' in ${outer ? 'outer' : 'same'} scope`;

                    if (severity === DiagKind.WARNING) {
                        this.reportWarning(diagnosticCode, message, span);
                    } else {
                        this.reportError(diagnosticCode, message, span);
                    }

                    return severity === DiagKind.ERROR ? !outer : false;
                }
                return false;
            }

            private checkTypeCycle(type: AST.TypeNode, scopeName?: string): boolean {
                const typeKey = this.createTypeKey(type, scopeName);

                if (this.typeContext.visitedTypes.has(typeKey)) {
                    this.log('verbose', `Cycle detected in type: ${typeKey}`);
                    this.log('verbose', `Type path: ${this.typeContext.currentTypePath.join(' -> ')}`);

                    // Report as warning, not error - cycles via pointers are valid
                    this.reportWarning(
                        DiagCode.TYPE_CYCLE_DETECTED,
                        `Circular type reference detected for ${type.kind} (this is OK for pointer types)`,
                        type.span
                    );

                    // Pointer cycles are OK, just log and continue
                    this.log('verbose', `Valid pointer cycle: ${typeKey}`);
                    return false; // Continue processing
                }

                // Track max nesting for diagnostics
                if (this.typeContext.nestingDepth > this.typeContext.maxNestingDepth) {
                    this.typeContext.maxNestingDepth = this.typeContext.nestingDepth;
                }

                // Safety limit: 100 levels should handle any reasonable code
                if (this.typeContext.nestingDepth > 100) {
                    this.reportError(
                        DiagCode.TYPE_NESTING_TOO_DEEP,
                        // `Type nesting exceeds safety limit (${this.typeContext.nestingDepth} levels) - possible infinite recursion`,
                        `Type nesting exceeds safety limit`,
                        type.span
                    );
                    return true;
                }

                return false;
            }

            private withTypeContext(type: AST.TypeNode, scopeName: string | undefined, operation: () => void): void {
                const typeKey = this.createTypeKey(type, scopeName);

                // If cycle detected, stop processing
                if (this.checkTypeCycle(type, scopeName)) {
                    return;
                }

                // Add to visited set and path
                this.typeContext.visitedTypes.add(typeKey);
                this.typeContext.currentTypePath.push(typeKey);
                this.typeContext.nestingDepth++;

                try {
                    operation();
                } finally {
                    // Always cleanup, even on error
                    this.typeContext.visitedTypes.delete(typeKey);
                    this.typeContext.currentTypePath.pop();
                    this.typeContext.nestingDepth--;
                }
            }

            private validateSymbolExistsInModule(module: AST.Module, symbolName: string): boolean {
                for (const stmt of module.statements) {
                    if (stmt.kind === 'let') {
                        const varNode = stmt.getLet();
                        if (varNode && varNode.field.ident.name === symbolName) {
                            return true;
                        }
                    } else if (stmt.kind === 'func') {
                        const funcNode = stmt.getFunc();
                        if (funcNode && funcNode.ident.name === symbolName) {
                            return true;
                        }
                    } else if (stmt.kind === 'def') {
                        const defNode = stmt.getDef();
                        if (defNode && defNode.ident.name === symbolName) {
                            return true;
                        }
                    }
                }
                return false;
            }

            private validateMemberPathInModule(
                module: AST.Module,
                memberPath: AST.IdentNode[] | undefined, // Now can be undefined
                useNode: AST.UseStmtNode
            ): boolean {
                // Wildcard imports don't need validation here
                if (!memberPath) {
                    // Wildcard - always valid if module exists
                    return true;
                }

                if (memberPath.length === 0) return false;
                if (memberPath.length === 1) {
                    return this.validateSymbolExistsInModule(module, memberPath[0].name);
                }

                // Start with the first identifier in the module
                let currentSymbolName = memberPath[0].name;
                if (!this.validateSymbolExistsInModule(module, currentSymbolName)) {
                    this.reportError(
                        DiagCode.SYMBOL_NOT_FOUND,
                        `Symbol '${currentSymbolName}' not found in module`,
                        memberPath[0].span
                    );
                    return false;
                }

                this.log('verbose',
                    `Member path ${memberPath.map(m => m.name).join('.')} found in module (full validation deferred to type checking)`
                );

                return true;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private init(): boolean {
                if (!this.config.program) {
                    this.reportError(DiagCode.ANALYSIS_ERROR, 'No program provided for analysis');
                    return false;
                }

                this.pathContext.rootPath = this.config.program!.metadata.path as string;

                this.config.services.contextTracker.reset();
                this.config.services.contextTracker.setPhase(AnalysisPhase.Collection);

                try {
                    this.config.services.scopeManager.reset();
                    const globalScope = this.config.services.scopeManager.getCurrentScope();
                    if (globalScope.kind !== ScopeKind.Global) {
                        this.reportError( DiagCode.INTERNAL_ERROR, 'Current scope is not global at the start of symbol collection' );
                        return false;
                    }
                    this.incrementScopesCreated();
                } catch (error) {
                    this.reportError( DiagCode.INTERNAL_ERROR, `Failed to initialize scope manager: ${error}` );
                    return false;
                }

                return true;
            }

            private initStats(): CollectionStats {
                return {
                    modulesProcessed            : 0,
                    symbolsCollected            : 0,
                    importResolutionFailures    : 0,
                    scopesCreated               : 0,
                    syntheticSymbolsInjected    : 0,
                    startTime                   : Date.now()
                };
            }

            private initTypeContext(): TypeCollectionContext {
                return {
                    visitedTypes        : new Set<string>(),
                    currentTypePath     : [],
                    nestingDepth        : 0,
                    maxNestingDepth     : 0
                };
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private createTypeKey(type: AST.TypeNode, scopeName?: string): string {
                // Use span for uniqueness, kind for readability
                const baseKey = `${type.kind}:${type.span.start}:${type.span.end}`;
                return scopeName ? `${baseKey}:${scopeName}` : baseKey;
            }

            private createBaseSymbol(
                name: string,
                kind: SymbolKind,
                scope: Scope,
                moduleName: string,
                contextSpan: AST.Span,
                targetSpan: AST.Span
            ): Symbol {
                return {
                    id              : this.config.services.scopeManager.symbolIdGenerator.next(),
                    name,
                    kind,
                    module          : moduleName,
                    scope           : scope.id,
                    contextSpan,
                    targetSpan,
                    type            : null,
                    declared        : true,
                    initialized     : false,
                    used            : false,
                    visibility      : { kind: 'Private' },
                    mutability      : { kind: 'Immutable' },
                    isTypeChecked   : false,
                    isExported      : false
                };
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private incrementSymbolsCollected(): void {
                this.stats.symbolsCollected++;
            }

            private incrementScopesCreated(): void {
                this.stats.scopesCreated++;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private trackModuleExport(moduleName: string, symbolName: string, isExported: boolean): void {
                if (!isExported) return;

                if (!this.moduleExports.has(moduleName)) {
                    this.moduleExports.set(moduleName, new Set());
                }
                this.moduleExports.get(moduleName)!.add(symbolName);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            logStatistics(): void {
                const duration = Date.now() - this.stats.startTime;
                const stats = [
                    `Collection Statistics:`,
                    `  Duration             : ${duration}ms`,
                    `  Modules processed    : ${this.stats.modulesProcessed}`,
                    `  Symbols collected    : ${this.stats.symbolsCollected}`,
                    `  Scopes created       : ${this.stats.scopesCreated}`,
                    `  Import failures      : ${this.stats.importResolutionFailures}`,
                    `  Max type nesting     : ${this.typeContext.maxNestingDepth}`
                ];
                this.log('verbose', stats.join('\n'));
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            getTypeRegistry(): Map<string, Symbol> {
                return new Map(this.typeRegistry); // Return copy for safety
            }

            getModuleExports(moduleName: string): Set<string> | undefined {
                return this.moduleExports.get(moduleName);
            }

            canImportSymbol(moduleName: string, symbolName: string): boolean {
                const exports = this.moduleExports.get(moduleName);
                return exports ? exports.has(symbolName) : false;
            }

        // └──────────────────────────────────────────────────────────────────────┘
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝