// SymbolResolver.ts – Symbol resolution phase.
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST                 from '@je-es/ast';
    import { AnalysisPhase, ExpressionContext }
                                    from '../components/ContextTracker';
    import { DiagCode }             from '../components/DiagnosticManager';
    import { Scope, Symbol, SymbolKind, ScopeKind }
                                    from '../components/ScopeManager';
    import { PathUtils }            from '../utils/PathUtils';
    import { PhaseBase }            from '../interfaces/PhaseBase';
    import { AnalysisConfig }       from '../ast-analyzer';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    interface ResolutionContext {
        currentModule               : string;
        moduleStack                 : string[];
        cache             : Map<string, Symbol | null>;
    }

    interface FieldContext {
        currentFieldIndex           : number;
        parameters                  : Array<{ name: string; index: number }>;
    }

    interface ResolutionStats {
        modulesProcessed            : number;
        totalSymbols                : number;
        resolvedSymbols             : number;
        cachedResolutions           : number;
        forwardReferences           : number;
        selfReferences              : number;
        importResolutions           : number;
        structMethodsResolved       : number;
        enumVariantsResolved        : number;
        memberAccessResolved        : number;
        anonymousTypesResolved      : number;
        visibilityChecks            : number;
        errors                      : number;
        startTime                   : number;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class SymbolResolver extends PhaseBase {

        // ┌──────────────────────────────── INIT ────────────────────────────────┐

            private stats                   : ResolutionStats           = this.initStats();
            private resolutionCtx           : ResolutionContext         = this.initResolutionContext();
            private currentIsStaticMethod   : boolean               = false;
            private currentStructScope      : Scope | null          = null;

            constructor( config : AnalysisConfig ) {
                super(AnalysisPhase.Resolution, config);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ────────────────────────────────┐

            handle(): boolean {
                try {
                    this.log('verbose', 'Starting symbol resolution phase...');
                    this.stats.startTime = Date.now();

                    if (!this.init()) return false;
                    if (!this.resolveAllModules()) return false;

                    this.logStatistics();
                    return !this.config.services.diagnosticManager.hasErrors();

                } catch (error) {
                    this.log('errors', `Fatal error during symbol resolution: ${error}`);
                    this.reportError(DiagCode.INTERNAL_ERROR, `Fatal error during symbol resolution: ${error}`);
                    return false;
                }
            }

            reset(): void {
                this.stats          = this.initStats();
                this.resolutionCtx  = this.initResolutionContext();
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌────────────────────────── [1] Program Level ─────────────────────────┐

            private resolveAllModules(): boolean {
                this.log('verbose', 'Resolving symbols from all modules...');
                const globalScope = this.config.services.scopeManager.getCurrentScope();

                for (const [moduleName, module] of this.config.program!.modules) {
                    this.config.services.contextTracker.pushContextSpan({ start: 0, end: 0 });
                    try {
                        if (!this.resolveModule(moduleName, module, globalScope)) {
                            this.log('errors', `Failed to resolve module ${moduleName}, continuing...`);
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

            private resolveModule(moduleName: string, module: AST.Module, parentScope: Scope): boolean {
                this.log('symbols', `Resolving module '${moduleName}'`);

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
                    this.config.services.contextTracker.setScope(moduleScope.id);;

                    this.resetDeclaredFlags(moduleScope);

                    for (const statement of module.statements) {
                        this.resolveStmt(statement, moduleScope, moduleName);
                    }

                    this.exitModuleContext();
                    return true;
                } catch (error) {
                    this.reportError(DiagCode.INTERNAL_ERROR, `Failed to resolve module '${moduleName}': ${error}`);
                    return false;
                }
            }

            private resetDeclaredFlags(scope: Scope): void {
                for (const [_, symbol] of scope.symbols) {
                    if (symbol.kind !== SymbolKind.Use && symbol.kind !== SymbolKind.Parameter) {
                        symbol.declared = false;
                    }
                }

                const childScopes = this.config.services.scopeManager.getAllScopes().filter(s => s.parent === scope.id);
                for (const childScope of childScopes) {
                    this.resetDeclaredFlags(childScope);
                }
            }

            private enterModuleContext(moduleName: string, module: AST.Module): void {
                this.resolutionCtx.moduleStack.push(this.resolutionCtx.currentModule);
                this.resolutionCtx.currentModule = moduleName;
                this.config.services.contextTracker.setModuleName(moduleName);
                if (typeof module.metadata?.path === 'string') {
                    this.config.services.contextTracker.setModulePath(module.metadata.path);
                }
            }

            private exitModuleContext(): void {
                const previousModule = this.resolutionCtx.moduleStack.pop();
                this.resolutionCtx.currentModule = previousModule || '';
            }

            private findModuleScope(moduleName: string): Scope | null {
                const moduleScope = this.config.services.scopeManager.findScopeByName(moduleName, ScopeKind.Module);
                if (!moduleScope) {
                    this.reportError(DiagCode.MODULE_SCOPE_NOT_FOUND, `Module scope for '${moduleName}' not found`);
                }
                return moduleScope;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── [3] Stmt Level ───────────────────────────┐

            private resolveStmt(stmt: AST.StmtNode, currentScope: Scope, moduleName?: string): void {
                if (!stmt) {
                    this.reportError(DiagCode.ANALYSIS_ERROR, 'Found null statement during resolution');
                    return;
                }

                this.log('verbose', `Resolving ${stmt.kind} statement`);
                this.config.services.contextTracker.pushContextSpan(stmt.span);

                try {
                    this.config.services.scopeManager.withScope(currentScope.id, () => {
                        this.config.services.contextTracker.withSavedState(() => {
                            this.config.services.contextTracker.setScope(currentScope.id);
                            this.processStmtByKind(stmt, {
                                'Block'     : (blockNode) => this.handleBlockStmt(blockNode, currentScope, moduleName),
                                'Test'      : (testNode)  => this.handleTestStmt(testNode, currentScope, moduleName),
                                'Use'       : (useNode)   => this.handleUseStmt(useNode, currentScope, moduleName),
                                'Def'       : (defNode)   => this.handleDefStmt(defNode, currentScope, moduleName),
                                'Let'       : (letNode)   => this.handleLetStmt(letNode, currentScope, moduleName),
                                'Func'      : (funcNode)  => this.handleFuncStmt(funcNode, currentScope, moduleName),
                                'Expression': (exprNode)  => this.resolveExprStmt(exprNode),

                                // special cases
                                'While'     : () => this.handleLoopStmt(stmt, currentScope, moduleName),
                                'Do'        : () => this.handleLoopStmt(stmt, currentScope, moduleName),
                                'For'       : () => this.handleLoopStmt(stmt, currentScope, moduleName),

                                'Return'    : () => this.handleControlflowStmt(stmt, currentScope, moduleName),
                                'Defer'     : () => this.handleControlflowStmt(stmt, currentScope, moduleName),
                                'Throw'     : () => this.handleControlflowStmt(stmt, currentScope, moduleName),
                            });
                        });
                    });
                } catch (error) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `Failed to resolve ${stmt.kind} statement: ${error}`,
                        stmt.span
                    );
                } finally {
                    this.config.services.contextTracker.popContextSpan();
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────── [3.1] BLOCK ─────────────────────────────┐

            private handleBlockStmt(blockNode: AST.BlockStmtNode, scope?: Scope, moduleName?: string): void {
                this.resolveBlockStmt(blockNode);
            }

            private resolveBlockStmt(block: AST.BlockStmtNode): void {
                this.log('symbols', 'Resolving block');

                const blockScope = this.config.services.scopeManager.findChildScopeByName('block', ScopeKind.Block);
                if (blockScope) {
                    this.config.services.contextTracker.withSavedState(() => {
                        this.config.services.contextTracker.setScope(blockScope.id);

                        this.config.services.scopeManager.withScope(blockScope.id, () => {
                            for (const stmt of block.stmts) {
                                this.resolveStmt(stmt, blockScope);
                            }
                        });
                    });
                }
            }

            private handleTestStmt(testNode: AST.TestStmtNode, scope?: Scope, moduleName?: string): void {
                this.resolveBlockStmt(testNode.block);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.2] USE ──────────────────────────────┐

            private handleUseStmt(useNode: AST.UseStmtNode, scope?: Scope, moduleName?: string): void {
                this.resolveUseStmt(useNode);
            }

            private resolveUseStmt(useNode: AST.UseStmtNode): void {
                this.log('symbols', 'Resolving use statement');
                this.config.services.contextTracker.pushContextSpan(useNode.span);

                try {
                    if (useNode.path) {
                        this.resolveModuleImport(useNode);
                    } else {
                        this.resolveLocalUse(useNode);
                    }
                    this.stats.importResolutions++;
                } catch (error) {
                    this.reportError(DiagCode.ANALYSIS_ERROR, `Failed to resolve use statement: ${error}`, useNode.span);
                } finally {
                    this.config.services.contextTracker.popContextSpan();
                }
            }

            private resolveModuleImport(useNode: AST.UseStmtNode): void {
                if (!this.config.program || !useNode.path) {
                    this.reportError(DiagCode.MODULE_NOT_FOUND, 'Invalid import: missing path', useNode.span);
                    return;
                }

                const currentModule = this.config.program.modules.get(this.resolutionCtx.currentModule);
                const currentModulePath = currentModule?.metadata?.path as string | undefined;

                // Handle wildcard import
                if (!useNode.targetArr) {
                    if (!useNode.alias) {
                        this.reportError(
                            DiagCode.ANALYSIS_ERROR,
                            `Wildcard import requires an alias`,
                            useNode.span
                        );
                        return;
                    }

                    const symbolName = useNode.alias.name;
                    const existingSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(symbolName);

                    if (!existingSymbol || existingSymbol.kind !== SymbolKind.Use) {
                        return;
                    }

                    if (!PathUtils.validatePath(this.config.program, useNode.path, currentModulePath)) {
                        return;
                    }

                    const resolvedPath = PathUtils.resolveModulePath(this.config.program, useNode.path, currentModulePath);
                    const targetModuleName = PathUtils.findModuleNameByPath(this.config.program, resolvedPath);

                    if (!targetModuleName) {
                        this.reportError(DiagCode.MODULE_NOT_FOUND, `Could not resolve module name for path: ${useNode.path}`, useNode.span);
                        return;
                    }

                    const targetModuleScope = this.findModuleScope(targetModuleName);
                    if (!targetModuleScope) {
                        this.reportError(DiagCode.MODULE_SCOPE_NOT_FOUND, `Could not find scope for module: ${targetModuleName}`, useNode.span);
                        return;
                    }

                    // Mark as declared and resolved
                    existingSymbol.declared = true;
                    existingSymbol.type = AST.TypeNode.asIdentifier(useNode.span, targetModuleName);

                    this.log('verbose', `Resolved wildcard import from '${targetModuleName}' as '${symbolName}'`);
                    return;
                }

                // Only report MODULE_NOT_FOUND if it wasn't already reported in collection phase
                const symbolName = useNode.alias ? useNode.alias.name : useNode.targetArr[useNode.targetArr.length - 1].name;
                const existingSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(symbolName);

                if (!existingSymbol || existingSymbol.kind !== SymbolKind.Use) {
                    // Symbol wasn't collected, so module wasn't found in collection phase
                    // Don't report duplicate error
                    return;
                }

                if (!PathUtils.validatePath(this.config.program, useNode.path, currentModulePath)) {
                    // Only report if this is a new error case
                    if (!existingSymbol.importSource) {
                        this.reportError(DiagCode.MODULE_NOT_FOUND, `Module not found: ${useNode.path}`, useNode.span);
                    }
                    return;
                }

                const resolvedPath = PathUtils.resolveModulePath(this.config.program, useNode.path, currentModulePath);
                const targetModuleName = PathUtils.findModuleNameByPath(this.config.program, resolvedPath);

                if (!targetModuleName) {
                    this.reportError(DiagCode.MODULE_NOT_FOUND, `Could not resolve module name for path: ${useNode.path}`, useNode.span);
                    return;
                }

                const targetModuleScope = this.findModuleScope(targetModuleName);
                if (!targetModuleScope) {
                    this.reportError(DiagCode.MODULE_SCOPE_NOT_FOUND, `Could not find scope for module: ${targetModuleName}`, useNode.span);
                    return;
                }

                this.resolveModuleWithScope(useNode, targetModuleName, targetModuleScope);
            }

            private resolveModuleWithScope(useNode: AST.UseStmtNode, targetModuleName: string, targetModuleScope: Scope): void {
                const originalScope = this.config.services.scopeManager.getCurrentScope();
                const originalContext = this.saveModuleContext();

                try {
                    this.switchToTargetModule(targetModuleName, targetModuleScope);
                    const targetSymbol = this.resolveImportTarget(useNode);
                    if (targetSymbol) {
                        this.propagateImportType(useNode, targetSymbol, originalScope);
                    }
                } finally {
                    this.restoreModuleContext(originalContext, originalScope);
                }
            }

            private resolveLocalUse(useNode: AST.UseStmtNode): void {
                // Wildcard local use doesn't make sense
                if (!useNode.targetArr) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `Wildcard import only supported for module imports (use * as x from "...")`,
                        useNode.span
                    );
                    return;
                }

                const targetName = useNode.targetArr[0].name;
                const targetSymbol = this.config.services.scopeManager.lookupSymbol(targetName);

                if (targetSymbol && !targetSymbol.declared) {
                    this.reportError(
                        DiagCode.USED_BEFORE_DECLARED,
                        `Symbol '${targetName}' used before declaration`,
                        useNode.targetArr[0].span
                    );
                    return;
                }

                this.resolveExprStmt(this.identOrMemberAccess(useNode.targetArr));
                if (useNode.alias) {
                    this.markAliasAsDeclared(useNode.alias);
                }
            }

            private identOrMemberAccess(nodes: AST.IdentNode[]): AST.ExprNode {
                // Safety check for empty array
                if (nodes.length === 0) {
                    throw new Error('Cannot create identifier expression from empty array');
                }

                const base = AST.ExprNode.asIdent(nodes[0].span, nodes[0].name, nodes[0].builtin);
                if (nodes.length === 1) return base;
                return AST.ExprNode.asMemberAccess(nodes[0].span, base, this.identOrMemberAccess(nodes.slice(1)));
            }

            private saveModuleContext() {
                return {
                    moduleName: this.config.services.contextTracker.getModuleName(),
                    modulePath: this.config.services.contextTracker.getModulePath()
                };
            }

            private switchToTargetModule(targetModule: string, targetModuleScope: Scope): void {
                this.config.services.scopeManager.setCurrentScope(targetModuleScope.id);
                this.config.services.contextTracker.setModuleName(targetModule);
                const targetModulePath = this.config.program!.modules.get(targetModule)?.metadata?.path;
                if (targetModulePath) {
                    this.config.services.contextTracker.setModulePath(targetModulePath as string);
                }
            }

            private restoreModuleContext(originalContext: any, originalScope: Scope): void {
                this.config.services.contextTracker.setModuleName(originalContext.moduleName);
                this.config.services.contextTracker.setModulePath(originalContext.modulePath);
                this.config.services.scopeManager.setCurrentScope(originalScope.id);
            }

            private resolveImportTarget(useNode: AST.UseStmtNode): Symbol | null {
                // Handle wildcard import
                if (!useNode.targetArr) {
                    // For wildcard, just check module exists (already validated in resolveModuleImport)
                    if (!useNode.alias) {
                        this.reportError(
                            DiagCode.ANALYSIS_ERROR,
                            'Wildcard import requires an alias',
                            useNode.span
                        );
                        return null;
                    }

                    // Return a synthetic "module namespace" symbol
                    // The actual exported symbols are validated during member access
                    const moduleSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(useNode.alias.name);
                    if (moduleSymbol) {
                        moduleSymbol.declared = true;
                    }
                    return moduleSymbol;
                }

                const targetName = useNode.targetArr[0].name;
                if (!targetName) return null;

                const targetSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(targetName);
                if (targetSymbol) {
                    targetSymbol.declared = true;

                    if (useNode.targetArr.length > 1) {
                        let currentSymbol: Symbol | null = targetSymbol;

                        for (let i = 1; i < useNode.targetArr.length; i++) {
                            const memberName = useNode.targetArr[i].name;

                            if (!currentSymbol || !currentSymbol.type) {
                                this.reportError(
                                    DiagCode.SYMBOL_NOT_FOUND,
                                    `Cannot resolve member path: ${useNode.targetArr.slice(0, i + 1).map((t:AST.IdentNode) => t.name).join('.')}`,
                                    useNode.targetArr[i].span
                                );
                                return null;
                            }

                            const memberSymbol = this.resolveMemberInType(currentSymbol.type, memberName);
                            if (!memberSymbol) {
                                this.reportError(
                                    DiagCode.SYMBOL_NOT_FOUND,
                                    `Member '${memberName}' not found in type`,
                                    useNode.targetArr[i].span
                                );
                                return null;
                            }

                            currentSymbol = memberSymbol;
                            currentSymbol.used = true;
                        }

                        return currentSymbol;
                    }

                    return targetSymbol;
                }
                return null;
            }

            private resolveMemberInType(type: AST.TypeNode, memberName: string): Symbol | null {
                // Unwrap optional types first
                if (type.kind === 'optional') {
                    const optional = type.getOptional()!;
                    return this.resolveMemberInType(optional.target, memberName);
                }

                // Handle struct types - IMPROVED
                if (type.kind === 'struct') {
                    const struct = type.getStruct()!;
                    const scopeId = struct.metadata?.scopeId as number | undefined;
                    if (scopeId !== undefined) {
                        const typeScope = this.config.services.scopeManager.getScope(scopeId);
                        // First check for fields
                        const fieldSymbol = typeScope.symbols.get(memberName);
                        if (fieldSymbol && fieldSymbol.kind === SymbolKind.StructField) {
                            return fieldSymbol;
                        }

                        // Then check for methods
                        const methodSymbol = typeScope.symbols.get(memberName);
                        if (methodSymbol && methodSymbol.kind === SymbolKind.Function) {
                            return methodSymbol;
                        }
                    }
                    return null;
                }

                // Handle enum types
                if (type.kind === 'enum') {
                    const enumType = type.getEnum()!;
                    const scopeId = enumType.metadata?.scopeId as number | undefined;
                    if (scopeId !== undefined) {
                        const typeScope = this.config.services.scopeManager.getScope(scopeId);
                        const variantSymbol = typeScope.symbols.get(memberName);
                        if (variantSymbol && variantSymbol.kind === SymbolKind.EnumVariant) {
                            return variantSymbol;
                        }
                    }
                    return null;
                }

                // Handle identifier types (type aliases)
                if (type.kind === 'ident') {
                    const ident = type.getIdent()!;
                    const typeSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                    if (typeSymbol?.type) {
                        return this.resolveMemberInType(typeSymbol.type, memberName);
                    }
                }

                return null;
            }

            private propagateImportType(useNode: AST.UseStmtNode, targetSymbol: Symbol, originalScope: Scope): void {
                // Handle both wildcard and specific imports
                const importName = useNode.alias
                    ? useNode.alias.name
                    : useNode.targetArr
                        ? useNode.targetArr[useNode.targetArr.length - 1].name
                        : '<invalid>';

                if (!importName || importName === '<invalid>') return;

                const importSymbol = originalScope.symbols.get(importName);
                if (importSymbol) {
                    // For wildcard, type points to the module itself (as identifier)
                    // For specific imports, type is the actual symbol type
                    importSymbol.type = targetSymbol.type;
                    importSymbol.declared = true;
                }
            }

            private markAliasAsDeclared(alias: AST.IdentNode): void {
                const aliasSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(alias.name);
                if (aliasSymbol) {
                    aliasSymbol.declared = true;
                    this.config.services.contextTracker.startDeclaration(alias.name, aliasSymbol.id, 'let', alias.span, this.config.services.scopeManager.getCurrentScope().id);
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.3] DEF ──────────────────────────────┐

            private handleDefStmt(defNode: AST.DefStmtNode, scope?: Scope, moduleName?: string): void {
                this.resolveDefStmt(defNode);
            }

            private resolveDefStmt(defNode: AST.DefStmtNode): void {
                this.log('symbols', `Resolving definition '${defNode.ident.name}'`);

                const symbol = this.config.services.scopeManager.getSymbolInCurrentScope(defNode.ident.name);
                if (!symbol) {
                    this.reportError(DiagCode.INTERNAL_ERROR, `Definition symbol '${defNode.ident.name}' not found in current scope`, defNode.ident.span);
                    return;
                }

                this.config.services.contextTracker.startDeclaration(defNode.ident.name, symbol.id, 'def', defNode.span, this.config.services.scopeManager.getCurrentScope().id);
                symbol.declared = true;
                this.resolveType(defNode.type, symbol);
                this.config.services.contextTracker.completeDeclaration(symbol.id);
                this.stats.resolvedSymbols++;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.4] LET ──────────────────────────────┐

            private handleLetStmt(letNode: AST.LetStmtNode, scope?: Scope, moduleName?: string): void {
                this.resolveLetStmt(letNode);
            }

            private resolveLetStmt(letNode: AST.LetStmtNode): void {
                this.log('symbols', `Resolving let '${letNode.field.ident.name}'`);

                const symbol = this.config.services.scopeManager.getSymbolInCurrentScope(letNode.field.ident.name);
                if (!symbol) {
                    this.reportError(DiagCode.INTERNAL_ERROR, `Variable symbol '${letNode.field.ident.name}' not found in current scope`, letNode.field.ident.span);
                    return;
                }

                this.config.services.contextTracker.startDeclaration(letNode.field.ident.name, symbol.id, 'let', letNode.field.span, this.config.services.scopeManager.getCurrentScope().id);

                if (letNode.field.initializer) {
                    if (this.isConstructorExpression(letNode.field.initializer)) {
                        const primary = letNode.field.initializer.getPrimary()!;
                        const obj = primary.getObject()!;
                        const constructorName = obj.ident!.name;

                        const constructorSymbol = this.config.services.scopeManager.lookupSymbol(constructorName);
                        if (constructorSymbol && constructorSymbol.type) {
                            // Validate constructor fields
                            const isValid = this.validateConstructorFields(obj, constructorSymbol.type);

                            if (isValid) {
                                // Set type only if validation passed
                                symbol.type = constructorSymbol.type;
                                letNode.field.type = constructorSymbol.type;
                            } else {
                                // Validation failed - abort
                                this.config.services.contextTracker.completeDeclaration(symbol.id);
                                return;
                            }
                        }
                    } else if (letNode.field.initializer.kind === 'Primary') {
                        const primary = letNode.field.initializer.getPrimary();
                        if (primary && primary.kind === 'Type') {
                            const anonType = primary.getType()!;
                            this.resolveType(anonType, symbol);
                            symbol.type = anonType;
                            letNode.field.type = anonType;
                            this.stats.anonymousTypesResolved++;
                        }
                    }

                    // Resolve initializer expressions
                    this.resolveVariableInitializer(letNode, symbol);
                }

                symbol.declared = true;

                if (letNode.field.type && !this.resolveType(letNode.field.type, symbol, letNode.field.span)) {
                    return;
                }

                this.config.services.contextTracker.completeDeclaration(symbol.id);
                this.stats.resolvedSymbols++;
            }

            private isConstructorExpression(expr: AST.ExprNode): boolean {
                if (expr.kind !== 'Primary') {
                    return false;
                }

                const primary = expr.getPrimary();
                if (!primary || primary.kind !== 'Object') {
                    return false;
                }

                const obj = primary.getObject();
                if (!obj) {
                    return false;
                }

                // An Object is a constructor if it has an ident (the type name)
                // Example: Point { x: 10, y: 20 }
                //          ^^^^^              ← This is obj.ident
                const hasConstructorName =
                    obj.ident !== null &&
                    obj.ident !== undefined &&
                    typeof obj.ident.name === 'string' &&
                    obj.ident.name.length > 0;

                return hasConstructorName;
            }

            private validateConstructorFields(obj: AST.ObjectNode, type: AST.TypeNode): boolean {
                if (type.kind !== 'struct') return true;

                const struct = type.getStruct()!;
                const scopeId = struct.metadata?.scopeId as number | undefined;

                if (scopeId === undefined) {
                    this.log('verbose', 'Cannot validate constructor: struct has no scope');
                    return true; // Can't validate without scope
                }

                const typeScope = this.config.services.scopeManager.getScope(scopeId);
                const providedFields = new Set<string>();
                let hasError = false;

                // ============================================================================
                // STEP 1: Check for INVALID fields (fields that don't exist in struct)
                // ============================================================================
                for (const prop of obj.props) {
                    const fieldName = prop.key.name;
                    providedFields.add(fieldName);

                    const fieldSymbol = typeScope.symbols.get(fieldName);

                    if (!fieldSymbol || fieldSymbol.kind !== SymbolKind.StructField) {
                        this.reportError(
                            DiagCode.SYMBOL_NOT_FOUND,
                            `Member '${fieldName}' not found in struct`,
                            prop.key.span
                        );
                        hasError = true; // Mark error
                        // Continue checking other fields to report all errors
                    } else {
                        // Field exists - resolve its value expression
                        if (prop.val) {
                            this.resolveExprStmt(prop.val);
                        }
                    }
                }

                // ============================================================================
                // STEP 2: Check for MISSING required fields
                // ============================================================================
                for (const [fieldName, fieldSymbol] of typeScope.symbols) {
                    // Only check struct fields (not methods)
                    if (fieldSymbol.kind === SymbolKind.StructField) {
                        // Field is required if: not provided AND has no default value
                        const isRequired = !providedFields.has(fieldName) && !fieldSymbol.initialized;

                        if (isRequired) {
                            this.reportError(
                                DiagCode.SYMBOL_NOT_FOUND,
                                `Required field '${fieldName}' not provided in constructor`,
                                obj.span
                            );
                            hasError = true; // Mark error
                        }
                    }
                }

                // Return false if ANY error was found
                return !hasError;
            }

            private resolveVariableInitializer(varNode: AST.LetStmtNode, symbol: Symbol): boolean {
                this.config.services.contextTracker.startInitialization(symbol.id);
                this.config.services.contextTracker.enterExpression(ExpressionContext.VariableInitializer, varNode.field.initializer!.span, symbol.id);
                this.resolveExprStmt(varNode.field.initializer!, undefined, undefined, symbol!);
                this.config.services.contextTracker.exitExpression();
                return true;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.5] FUNC ─────────────────────────────┐

            private handleFuncStmt(funcNode: AST.FuncStmtNode, scope?: Scope, moduleName?: string): void {
                this.resolveFuncStmt(funcNode);
            }

            private resolveFuncStmt(funcNode: AST.FuncStmtNode): void {
                this.log('symbols', `Resolving function '${funcNode.ident.name}'`);

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

                this.config.services.contextTracker.startDeclaration(
                    funcNode.ident.name,
                    funcSymbol.id,
                    'fn',
                    funcNode.span,
                    this.config.services.scopeManager.getCurrentScope().id
                );
                funcSymbol.declared = true;

                // Get the scope where the function is defined to check if it's in a struct
                const funcSymbolScope = this.config.services.scopeManager.getScope(funcSymbol.scope);
                const parentScope = funcSymbolScope.parent !== null
                    ? this.config.services.scopeManager.getScope(funcSymbolScope.parent)
                    : null;

                const isStaticMethod = parentScope?.kind === ScopeKind.Type &&
                                    parentScope.metadata?.typeKind === 'Struct' &&
                                    funcNode.visibility.kind === 'Static';

                // Store context for validation
                const previousIsStaticMethod = this.currentIsStaticMethod;
                const previousStructScope = this.currentStructScope;

                this.currentIsStaticMethod = isStaticMethod;
                this.currentStructScope = isStaticMethod ? parentScope : null;

                const isStructMethod = parentScope?.kind === ScopeKind.Type &&
                                    parentScope.metadata?.typeKind === 'Struct' &&
                                    !(funcNode.visibility.kind === 'Static');

                try {
                    this.config.services.contextTracker.withSavedState(() => {
                        this.config.services.scopeManager.withScope(funcScope.id, () => {
                            // Resolve self parameter if struct method
                            if (isStructMethod) {
                                this.resolveSelfParameter(funcScope, parentScope!);
                            }

                            // Validate parameters
                            this.resolveParameters(funcNode.parameters);

                            // Build parameter types INCLUDING self for struct methods
                            const paramTypes: AST.TypeNode[] = [];

                            // Add self parameter type FIRST for struct methods
                            if (isStructMethod) {
                                const selfSymbol = funcScope.symbols.get('self');
                                if (selfSymbol?.type) {
                                    paramTypes.push(selfSymbol.type);
                                } else {
                                    // Self should always exist for struct methods
                                    this.reportError(
                                        DiagCode.INTERNAL_ERROR,
                                        `Struct method '${funcNode.ident.name}' missing 'self' parameter`,
                                        funcNode.span
                                    );
                                }
                            }

                            // Then add explicit parameters
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

                            // Resolve return type
                            let returnType: AST.TypeNode | null = null;
                            if (funcNode.returnType) {
                                const tempReturnSymbol: Symbol = {
                                    id: -1,
                                    name: '<return-type>',
                                    kind: SymbolKind.Variable,
                                    type: null,
                                    scope: funcScope.id,
                                    contextSpan: funcNode.returnType.span,
                                    declared: true,
                                    initialized: true,
                                    used: false,
                                    isTypeChecked: false,
                                    visibility: { kind: 'Private' },
                                    mutability: { kind: 'Immutable' },
                                    isExported: false
                                };
                                this.resolveType(funcNode.returnType, tempReturnSymbol);
                                returnType = funcNode.returnType;
                            }

                            // Resolve and validate error type
                            if (funcNode.errorType) {
                                const tempErrorSymbol: Symbol = {
                                    id: -1,
                                    name: '<func-error-type>',
                                    kind: SymbolKind.Variable,
                                    type: null,
                                    scope: funcScope.id,
                                    contextSpan: funcNode.errorType.span,
                                    declared: true,
                                    initialized: true,
                                    used: false,
                                    isTypeChecked: false,
                                    visibility: { kind: 'Private' },
                                    mutability: { kind: 'Immutable' },
                                    isExported: false
                                };

                                if (!this.resolveType(funcNode.errorType, tempErrorSymbol, funcNode.span)) {
                                    funcSymbol.isTypeChecked = true;
                                    return;
                                }

                                // REFINE ERROR MODE after resolution
                                const refinedMode = this.refineErrorMode(funcNode.errorType, funcSymbol);
                                if (funcSymbol.metadata) {
                                    funcSymbol.metadata.errorMode = refinedMode;

                                    // Update self-group errors if needed
                                    if (refinedMode === 'self-group') {
                                        funcSymbol.metadata.selfGroupErrors = this.extractSelfGroupErrors(funcNode.errorType);
                                    }
                                }

                                // Validate identifier error types
                                if (funcNode.errorType.isIdent()) {
                                    const errorIdent = funcNode.errorType.getIdent()!;

                                    if (!errorIdent.builtin) {
                                        const errorSymbol = this.config.services.scopeManager.lookupSymbol(errorIdent.name);

                                        if (!errorSymbol) {
                                            this.reportError(
                                                DiagCode.UNDEFINED_IDENTIFIER,
                                                `Error type '${errorIdent.name}' is not defined`,
                                                funcNode.errorType.span
                                            );
                                            funcSymbol.isTypeChecked = true;
                                            return;
                                        }

                                        // Validate it's actually an error type
                                        if (errorSymbol.type && !errorSymbol.type.isErrset() && !errorSymbol.type.isErr()) {
                                            this.reportError(
                                                DiagCode.TYPE_MISMATCH,
                                                `'${errorIdent.name}' is not an error type`,
                                                funcNode.errorType.span
                                            );
                                            funcSymbol.isTypeChecked = true;
                                            return;
                                        }
                                    }
                                }
                            }

                            // Build complete function type
                            funcSymbol.type = AST.TypeNode.asFunction(
                                funcNode.span,
                                paramTypes,
                                returnType || AST.TypeNode.asVoid(funcNode.span),
                                funcNode.errorType
                            );

                            // Resolve function body
                            if (funcNode.body) {
                                this.config.services.contextTracker.enterExpression(
                                    ExpressionContext.FunctionBody,
                                    funcNode.body.span
                                );
                                this.resolveStmt(funcNode.body, funcScope);
                                this.config.services.contextTracker.exitExpression();
                            }
                        });
                    });

                    if (isStructMethod) {
                        this.stats.structMethodsResolved++;
                    }
                } finally {
                    this.config.services.contextTracker.completeDeclaration(funcSymbol.id);
                    // Restore context
                    this.currentIsStaticMethod = previousIsStaticMethod;
                    this.currentStructScope = previousStructScope;
                }

                funcSymbol.isTypeChecked = true;
                this.stats.resolvedSymbols++;
            }

            private refineErrorMode(
                errorType: AST.TypeNode,
                funcSymbol: Symbol
            ): 'err-ident' | 'err-group' | 'any-error' | 'self-group' {
                if (errorType.isErr()) {
                    return 'any-error';
                }

                if (errorType.isErrset()) {
                    return 'self-group';
                }

                if (errorType.isIdent()) {
                    const ident = errorType.getIdent()!;
                    const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);

                    if (symbol?.kind === SymbolKind.Variable && symbol.type?.isErr()) {
                        return 'err-ident';
                    }

                    if (symbol?.kind === SymbolKind.Definition && symbol.type?.isErrset()) {
                        return 'err-group';
                    }
                }

                return 'any-error';
            }

            private extractSelfGroupErrors(errorType: AST.TypeNode): string[] {
                if (!errorType.isErrset()) return [];
                const errset = errorType.getErrset()!;
                return errset.members.map(m => m.name);
            }

            private resolveSelfParameter(funcScope: Scope, structScope: Scope): void {
                const selfSymbol = funcScope.symbols.get('self');
                if (!selfSymbol) {
                    this.log('verbose', `Warning: Expected 'self' parameter in struct method but not found`);
                    return;
                }

                // Mark self as declared and used in resolution phase
                selfSymbol.declared = true;

                // Resolve self's type (should point to parent struct)
                if (selfSymbol.type) {
                    // Validate that the type references the correct struct
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

            // ───── PARAMS ─────

            private resolveParameters(parameters: AST.FieldNode[]): void {
                const fieldInfo = parameters.map((param, index) => ({ name: param.ident.name, index }));
                for (let i = 0; i < parameters.length; i++) {
                    this.resolveParameter(parameters[i], i, fieldInfo);
                }
            }

            private resolveParameter(param: AST.FieldNode, index: number, fieldInfo: Array<{ name: string; index: number }>): void {
                const paramSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(param.ident.name);
                if (!paramSymbol) return;

                this.config.services.contextTracker.startDeclaration(param.ident.name, paramSymbol.id, 'Param', param.span, this.config.services.scopeManager.getCurrentScope().id);
                paramSymbol.declared = true;

                if (param.type) {
                    this.resolveType(param.type, paramSymbol);
                }

                if (param.initializer) {
                    this.resolveParameterInitializer(param, index, fieldInfo);
                }

                this.config.services.contextTracker.completeDeclaration(paramSymbol.id);
                this.stats.resolvedSymbols++;
            }

            private resolveParameterInitializer(param: AST.FieldNode, currentFieldIndex: number, fieldInfo: Array<{ name: string; index: number }>): void {
                const paramSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(param.ident.name)!;
                this.config.services.contextTracker.startInitialization(paramSymbol.id);
                this.config.services.contextTracker.enterExpression(ExpressionContext.ParameterInitializer, param.initializer!.span, paramSymbol.id);

                const parameterContext: FieldContext = { currentFieldIndex, parameters: fieldInfo };
                this.resolveExprStmt(param.initializer!, param.span, parameterContext, paramSymbol);
                this.config.services.contextTracker.exitExpression();
            }

            // ───── FIELDS ─────

            private resolveFields(fields: AST.FieldNode[]): void {
                const fieldInfo = fields.map((field, index) => ({ name: field.ident.name, index }));
                for (let i = 0; i < fields.length; i++) {
                    this.resolveField(fields[i], i, fieldInfo);
                }
            }

            private resolveField(field: AST.FieldNode, index: number, fieldInfo: Array<{ name: string; index: number }>): void {
                const fieldSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(field.ident.name);
                if (!fieldSymbol) return;

                this.config.services.contextTracker.startDeclaration(field.ident.name, fieldSymbol.id, 'Param', field.span, this.config.services.scopeManager.getCurrentScope().id);
                fieldSymbol.declared = true;

                if (field.type) {
                    this.resolveType(field.type, fieldSymbol);
                }

                if (field.initializer) {
                    this.resolveFieldInitializer(field, index, fieldInfo);
                }

                this.config.services.contextTracker.completeDeclaration(fieldSymbol.id);
                this.stats.resolvedSymbols++;
            }

            private resolveFieldInitializer(field: AST.FieldNode, currentFieldIndex: number, fieldInfo: Array<{ name: string; index: number }>): void {
                const fieldSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(field.ident.name)!;
                this.config.services.contextTracker.startInitialization(fieldSymbol.id);
                this.config.services.contextTracker.enterExpression(ExpressionContext.ParameterInitializer, field.initializer!.span, fieldSymbol.id);

                const fieldContext: FieldContext = { currentFieldIndex, parameters: fieldInfo };
                this.resolveExprStmt(field.initializer!, field.span, fieldContext, fieldSymbol);
                this.config.services.contextTracker.exitExpression();
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
                            this.resolveLoopStmt(loop);
                            break;
                        }
                        case 'Do' : {
                            const src = data.source as AST.LoopStmtNode;
                            const loop = AST.LoopStmtNode.createDo(data.span, src.expr, src.stmt);
                            this.resolveLoopStmt(loop);
                            break;
                        }
                        case 'For' : {
                            const src = data.source as AST.LoopStmtNode;
                            const loop = AST.LoopStmtNode.createFor(data.span, src.expr, src.stmt);
                            this.resolveLoopStmt(loop);
                            break;
                        }
                    }
                } else {
                    this.resolveLoopStmt(stmt.getLoop()!);
                }
            }

            private resolveLoopStmt(loopStmt: AST.LoopStmtNode): void {
                this.log('symbols', 'Resolving loop statement');

                // Create a new loop scope for this specific loop statement
                const currentScope = this.config.services.scopeManager.getCurrentScope();
                const loopScope = this.config.services.scopeManager.createScope(ScopeKind.Loop, 'loop', currentScope.id);
                
                this.config.services.contextTracker.withSavedState(() => {
                    this.config.services.contextTracker.setScope(loopScope.id);
                    this.config.services.contextTracker.enterLoop();

                    this.config.services.scopeManager.withScope(loopScope.id, () => {
                        if (loopStmt.kind === 'While') {
                            if (loopStmt.expr) this.resolveExprStmt(loopStmt.expr);
                            if (loopStmt.stmt) this.resolveStmt(loopStmt.stmt, loopScope);
                        } else if (loopStmt.kind === 'Do') {
                            if (loopStmt.stmt) this.resolveStmt(loopStmt.stmt, loopScope);
                            if (loopStmt.expr) this.resolveExprStmt(loopStmt.expr);
                        } else if (loopStmt.kind === 'For') {
                            if (loopStmt.expr) this.resolveExprStmt(loopStmt.expr);
                            if (loopStmt.stmt) this.resolveStmt(loopStmt.stmt, loopScope);
                        }
                    });
                });
                
                this.config.services.contextTracker.exitLoop();
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
                            this.resolveReturnStmt(res);
                            break;
                        }
                        case 'Defer' : {
                            const src = data.source as AST.ControlFlowStmtNode;
                            const res = AST.ControlFlowStmtNode.asDefer(data.span, src.value);
                            this.resolveDeferStmt(res);
                            break;
                        }
                        case 'Throw' : {
                            const src = data.source as AST.ControlFlowStmtNode;
                            const res = AST.ControlFlowStmtNode.asThrow(data.span, src.value);
                            this.resolveThrowStmt(res);
                            break;
                        }
                    }
                } else {
                    switch (stmt.getCtrlflow()!.kind) {
                        case 'return' : {
                            this.resolveReturnStmt(stmt.getCtrlflow()!);
                            break;
                        }
                        case 'defer' : {
                            this.resolveDeferStmt(stmt.getCtrlflow()!);
                            break;
                        }
                        case 'throw' : {
                            this.resolveThrowStmt(stmt.getCtrlflow()!);
                            break;
                        }
                    }
                }
            }

            private resolveReturnStmt(returnNode: AST.ControlFlowStmtNode): void {
                this.log('symbols', 'Resolving return statement');
                if (returnNode.value) {
                    this.config.services.contextTracker.enterExpression(ExpressionContext.ReturnExpression, returnNode.value.span);
                    this.resolveExprStmt(returnNode.value);
                    this.config.services.contextTracker.exitExpression();
                }
            }

            private resolveDeferStmt(deferNode: AST.ControlFlowStmtNode): void {
                this.log('symbols', 'Resolving defer statement');
                if (deferNode.value) {
                    this.config.services.contextTracker.enterExpression(ExpressionContext.DeferExpression, deferNode.value.span);
                    this.resolveExprStmt(deferNode.value);
                    this.config.services.contextTracker.exitExpression();
                }
            }

            private resolveThrowStmt(throwNode: AST.ControlFlowStmtNode): void {
                this.log('symbols', 'Resolving throw statement');
                if (throwNode.value) {
                    this.config.services.contextTracker.enterExpression(ExpressionContext.ThrowExpression, throwNode.value.span);
                    this.resolveExprStmt(throwNode.value);
                    this.config.services.contextTracker.exitExpression();
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── [4] EXPR Level ───────────────────────────┐

            private resolveExprStmt(expr: AST.ExprNode, contextSpan?: AST.Span, parameterContext?: FieldContext, symbol?: Symbol): void {
                if (!expr) return;

                this.log('symbols', `Resolving expression of type ${expr.kind}`);
                this.config.services.contextTracker.pushContextSpan(expr.span);

                try {
                    switch (expr.kind) {
                        case 'Primary':
                            this.resolvePrimary(expr.getPrimary()!, contextSpan, parameterContext, symbol);
                            break;
                        case 'Binary':
                            this.resolveBinary(expr.getBinary()!, contextSpan, parameterContext);
                            break;
                        case 'Prefix':
                            this.resolvePrefix(expr.getPrefix()!, contextSpan, parameterContext);
                            break;
                        case 'Postfix':
                            this.resolvePostfix(expr.getPostfix()!, contextSpan, parameterContext);
                            break;
                        case 'As':
                            this.resolveAs(expr.getAs()!, contextSpan, parameterContext);
                            break;
                        case 'Typeof':
                            return this.resolveExprStmt(expr.getTypeof()!.expr, contextSpan, parameterContext);
                        case 'Sizeof':
                            return this.resolveExprStmt(expr.getSizeof()!.expr, contextSpan, parameterContext);
                        case 'Orelse':
                            this.resolveOrelse(expr.getOrelse()!, contextSpan, parameterContext);
                            break;
                        case 'Range':
                            this.resolveRange(expr.getRange()!, contextSpan, parameterContext);
                            break;
                        case 'Try':
                            this.resolveTry(expr.getTry()!, contextSpan, parameterContext);
                            break;
                        case 'Catch':
                            this.resolveCatch(expr.getCatch()!, contextSpan, parameterContext);
                            break;
                        case 'If':
                            this.resolveIf(expr.getIf()!, contextSpan, parameterContext);
                            break;
                        case 'Match':
                            this.resolveSwitch(expr.getMatch()!, contextSpan, parameterContext);
                            break;
                        default:
                            this.log('verbose', `Unhandled expression type: ${expr.kind}`);
                            break;
                    }
                } finally {
                    this.config.services.contextTracker.popContextSpan();
                }
            }

            private resolvePrimary(primary: AST.PrimaryNode, contextSpan?: AST.Span, fieldContext?: FieldContext, symbol?: Symbol): void {
                switch (primary.kind) {
                    case 'Ident':
                        this.resolveIdentifier(primary.getIdent()!, contextSpan, fieldContext);
                        break;
                    case 'Paren': {
                        const paren = primary.getParen()!;
                        if (paren.source) {
                            this.resolveExprStmt(paren.source, contextSpan, fieldContext, symbol);
                        }
                        break;
                    }
                    case 'Literal':
                        break;
                    case 'Tuple':
                        this.resolveTuple(primary.getTuple()!, contextSpan, fieldContext);
                        break;
                    case 'Object':
                        this.resolveObject(primary.getObject()!, contextSpan, fieldContext);
                        break;
                    case 'Type': {
                        const type = primary.getType()!;
                        const tempSymbol: Symbol = {
                            id: -1,
                            name: symbol?.name ?? fieldContext?.parameters[fieldContext?.currentFieldIndex].name ?? type.getIdent()?.name ?? '<type-expr>',
                            kind: SymbolKind.Variable,
                            type: null,
                            scope: this.config.services.scopeManager.getCurrentScope().id,
                            contextSpan: type.span,
                            declared: true,
                            initialized: true,
                            used: false,
                            isTypeChecked: false,
                            visibility: { kind: 'Private' },
                            mutability: { kind: 'Immutable' },
                            isExported: false
                        };
                        this.resolveType(type, tempSymbol, contextSpan);
                        break;
                    }
                    case 'Unreachable': {
                        // Unreachable expressions are handled in type validation phase
                        // No symbol resolution needed for unreachable expressions
                        break;
                    }
                    default:
                        this.log('verbose', `Unhandled primary type: ${primary.kind}`);
                        break;
                }
            }

            private resolveTuple(tuple: AST.ExprTupleNode, contextSpan?: AST.Span, parameterContext?: FieldContext): void {
                for (const field of tuple.fields) {
                    this.resolveExprStmt(field, contextSpan, parameterContext);
                }
            }

            private resolveObject(obj: AST.ObjectNode, contextSpan?: AST.Span, parameterContext?: FieldContext): void {
                if(obj.ident) this.resolveIdentifier(obj.ident, contextSpan, parameterContext);

                for (const prop of obj.props) {
                    if (prop.val) {
                        this.resolveExprStmt(prop.val, contextSpan, parameterContext);
                    }
                }
            }

            private resolveBinary(binary: AST.BinaryNode, contextSpan?: AST.Span, parameterContext?: FieldContext): void {
                if (binary.left) {
                    this.resolveExprStmt(binary.left, contextSpan, parameterContext);
                }
                if (binary.right) {
                    this.resolveExprStmt(binary.right, contextSpan, parameterContext);
                }
            }

            private resolvePrefix(prefix: AST.PrefixNode, contextSpan?: AST.Span, parameterContext?: FieldContext): void {
                if (prefix.expr) {
                    this.resolveExprStmt(prefix.expr, contextSpan, parameterContext);
                }
            }

            private resolvePostfix(postfix: AST.PostfixNode, contextSpan?: AST.Span, parameterContext?: FieldContext): void {
                switch (postfix.kind) {
                    case 'Call':
                        this.resolvePostfixCall(postfix.getCall()!, contextSpan, parameterContext);
                        break;
                    case 'ArrayAccess':
                        this.resolvePostfixArrayAccess(postfix.getArrayAccess()!, contextSpan, parameterContext);
                        break;
                    case 'MemberAccess':
                        this.resolvePostfixMemberAccess(postfix.getMemberAccess()!, contextSpan, parameterContext);
                        break;
                    case 'Increment':
                    case 'Decrement':
                    case 'Dereference':
                        this.resolveExprStmt(postfix.getAsExprNode()!, contextSpan, parameterContext);
                        break;
                    default:
                        this.log('verbose', `Unhandled postfix type: ${postfix.kind}`);
                        break;
                }
            }

            private resolvePostfixCall(call: AST.CallNode, contextSpan?: AST.Span, parameterContext?: FieldContext): void {
                this.log('symbols', 'Resolving call expression');
                this.config.services.contextTracker.enterExpression(ExpressionContext.FunctionCall, call.span);

                try {
                    this.resolveExprStmt(call.base, call.span, parameterContext);

                    const baseSymbol = this.findCallTargetSymbol(call.base);
                    if (baseSymbol) {
                        this.validateCallableSymbol(baseSymbol, call.base.span);
                        baseSymbol.used = true;
                        this.log('symbols', `Marked function '${baseSymbol.name}' as used`);
                    }

                    for (let i = 0; i < call.args.length; i++) {
                        const arg = call.args[i];
                        this.config.services.contextTracker.enterExpression(ExpressionContext.CallArgument, arg.span);
                        try {
                            this.resolveExprStmt(arg, arg.span, parameterContext);
                        } finally {
                            this.config.services.contextTracker.exitExpression();
                        }
                    }
                } finally {
                    this.config.services.contextTracker.exitExpression();
                }
            }

            private resolvePostfixArrayAccess(arrayAccess: AST.ArrayAccessNode, contextSpan?: AST.Span, parameterContext?: FieldContext): void {
                this.log('symbols', 'Resolving array access');
                this.resolveExprStmt(arrayAccess.base, contextSpan, parameterContext);
                this.resolveExprStmt(arrayAccess.index, contextSpan, parameterContext);
            }

            private resolvePostfixMemberAccess(memberAccess: AST.MemberAccessNode, contextSpan?: AST.Span, parameterContext?: FieldContext): void {
                this.log('symbols', 'Resolving member access');

                // CHECK FOR selferr.Member access
                if (memberAccess.base.is('Primary')) {
                    const primary = memberAccess.base.getPrimary();
                    if (primary?.is('Ident')) {
                        const ident = primary.getIdent();
                        if (ident?.name === 'selferr') {
                            this.resolveSelfErrMemberAccess(memberAccess);
                            return;
                        }
                    }
                }

                // SPECIAL CASE: 'self.member' in static method
                if (memberAccess.base.is('Primary')) {
                    const primary = memberAccess.base.getPrimary();
                    if (primary?.is('Ident')) {
                        const ident = primary.getIdent();
                        if (ident?.name === 'self') {
                            // In static methods, 'self' refers to the TYPE
                            // Resolve the target member in the struct scope
                            // The actual validation (static vs instance) happens in TypeValidator
                            this.resolveExprStmt(memberAccess.target, contextSpan, parameterContext);

                            // Mark the member as resolved for statistics
                            this.stats.memberAccessResolved++;
                            return;
                        }
                    }
                }

                // Resolve base first
                this.resolveExprStmt(memberAccess.base, contextSpan, parameterContext);

                // Get base symbol
                const baseSymbol = this.findMemberAccessBaseSymbol(memberAccess.base);

                if (!baseSymbol) {
                    // Special check: if base is 'self' in static method, allow it
                    // The error will be reported in TypeValidator with proper context
                    if (memberAccess.base.is('Primary')) {
                        const primary = memberAccess.base.getPrimary();
                        if (primary?.is('Ident')) {
                            const ident = primary.getIdent();
                            if (ident?.name === 'self' && this.currentIsStaticMethod) {
                                // Don't report error here - let TypeValidator handle it
                                this.stats.memberAccessResolved++;
                                return;
                            }
                        }
                    }

                    this.reportError(
                        DiagCode.TYPE_INFERENCE_FAILED,
                        `Cannot resolve base for member access`,
                        memberAccess.base.span
                    );
                    return;
                }

                this.stats.memberAccessResolved++;
            }

            private resolveSelfErrMemberAccess(memberAccess: AST.MemberAccessNode): void {
                const selfErrSymbol = this.config.services.scopeManager.lookupSymbol('selferr');

                if (!selfErrSymbol || !selfErrSymbol.metadata?.isSelfErr) {
                    this.reportError(
                        DiagCode.UNDEFINED_IDENTIFIER,
                        "selferr can only be used in functions with self-group error type",
                        memberAccess.base.span
                    );
                    return;
                }

                // Extract member name (the error variant)
                if (!memberAccess.target.is('Primary')) {
                    this.reportError(
                        DiagCode.SYMBOL_NOT_FOUND,
                        'Expected error member name after selferr',
                        memberAccess.target.span
                    );
                    return;
                }

                const targetPrimary = memberAccess.target.getPrimary();
                if (!targetPrimary?.is('Ident')) {
                    this.reportError(
                        DiagCode.SYMBOL_NOT_FOUND,
                        'Expected error member name after selferr',
                        memberAccess.target.span
                    );
                    return;
                }

                const errorMemberName = targetPrimary.getIdent()!.name;

                // Validate the member exists in the error set
                const errorType = selfErrSymbol.type;
                if (!errorType || !errorType.isErrset()) {
                    this.reportError(
                        DiagCode.INTERNAL_ERROR,
                        'selferr does not reference a valid error set',
                        memberAccess.span
                    );
                    return;
                }

                const errset = errorType.getErrset()!;
                const memberExists = errset.members.some(m => m.name === errorMemberName);

                if (!memberExists) {
                    this.reportError(
                        DiagCode.ERROR_MEMBER_NOT_FOUND,
                        `Error member '${errorMemberName}' not found in function's error set`,
                        memberAccess.target.span
                    );
                    return;
                }

                // Mark as resolved and used
                selfErrSymbol.used = true;
                this.stats.memberAccessResolved++;

                this.log('symbols', `Resolved selferr.${errorMemberName}`);
            }

            private findMemberAccessBaseSymbol(baseExpr: AST.ExprNode): Symbol | null {
                // Handle identifier base
                if (baseExpr.kind === 'Primary') {
                    const primary = baseExpr.getPrimary();
                    if (primary && primary.kind === 'Ident') {
                        const ident = primary.getIdent();
                        if (ident) {
                            return this.config.services.scopeManager.lookupSymbol(ident.name);
                        }
                    }
                }

                // Handle postfix expressions (member access, dereference, etc.)
                if (baseExpr.kind === 'Postfix') {
                    const postfix = baseExpr.getPostfix();
                    if (!postfix) return null;

                    // Handle dereference - recurse on the dereferenced expression
                    if (postfix.kind === 'Dereference') {
                        const derefExpr = postfix.getAsExprNode();
                        if (derefExpr) {
                            return this.findMemberAccessBaseSymbol(derefExpr);
                        }
                    }

                    // Handle nested member access
                    if (postfix.kind === 'MemberAccess') {
                        const member = postfix.getMemberAccess()!;
                        return this.findMemberAccessBaseSymbol(member.base);
                    }
                }

                return null;
            }

            private resolveSelfMemberAccess(memberAccess: AST.MemberAccessNode, selfSymbol: Symbol): void {
                // Get the FUNCTION scope (where self lives)
                let currentScope = this.config.services.scopeManager.getCurrentScope();

                // Walk up to find the function scope
                while (currentScope && currentScope.kind !== ScopeKind.Function) {
                    const parent = this.config.services.scopeManager.getScopeParent(currentScope.id);
                    if (!parent) break;
                    currentScope = parent;
                }

                if (!currentScope || currentScope.kind !== ScopeKind.Function) {
                    this.reportError(DiagCode.UNDEFINED_IDENTIFIER, "Cannot use 'self' outside of method context", memberAccess.span);
                    return;
                }

                // Get parent struct scope
                const parentScope = this.config.services.scopeManager.getScopeParent(currentScope.id);
                if (!parentScope || parentScope.kind !== ScopeKind.Type) {
                    this.reportError(DiagCode.UNDEFINED_IDENTIFIER, "Cannot use 'self' outside of struct method", memberAccess.span);
                    return;
                }

                // Resolve member in struct scope
                if (memberAccess.target.isIdent()) {
                    const memberIdent = memberAccess.target.getIdent()!;
                    const memberSymbol = parentScope.symbols.get(memberIdent.name);

                    if (!memberSymbol) {
                        this.reportError(
                            DiagCode.SYMBOL_NOT_FOUND,
                            `Member '${memberIdent.name}' not found in struct '${parentScope.name}'`,
                            memberIdent.span
                        );
                        return;
                    }

                    if (memberSymbol.kind !== SymbolKind.StructField) {
                        this.reportError(
                            DiagCode.SYMBOL_NOT_FOUND,
                            `'${memberIdent.name}' is not a field`,
                            memberIdent.span
                        );
                        return;
                    }

                    memberSymbol.used = true;
                    this.log('symbols', `Resolved self.${memberIdent.name} in struct method`);
                }
            }

            private resolveAs(asNode: AST.AsNode, contextSpan?: AST.Span, parameterContext?: FieldContext): void {
                this.resolveExprStmt(asNode.base, contextSpan, parameterContext);
                const tempSymbol: Symbol = {
                    id: -1,
                    name: '<as-expr>',
                    kind: SymbolKind.Variable,
                    type: null,
                    scope: this.config.services.scopeManager.getCurrentScope().id,
                    contextSpan: asNode.span,
                    declared: true,
                    initialized: true,
                    used: false,
                    isTypeChecked: false,
                    visibility: { kind: 'Private' },
                    mutability: { kind: 'Immutable' },
                    isExported: false
                };
                this.resolveType(asNode.type, tempSymbol, contextSpan);
            }

            private resolveOrelse(orelse: AST.OrelseNode, contextSpan?: AST.Span, parameterContext?: FieldContext): void {
                this.resolveExprStmt(orelse.left, contextSpan, parameterContext);
                this.resolveExprStmt(orelse.right, contextSpan, parameterContext);
            }

            private resolveRange(range: AST.RangeNode, contextSpan?: AST.Span, parameterContext?: FieldContext): void {
                if (range.leftExpr) this.resolveExprStmt(range.leftExpr, contextSpan, parameterContext);
                if (range.rightExpr) this.resolveExprStmt(range.rightExpr, contextSpan, parameterContext);
            }

            private resolveTry(tryNode: AST.TryNode, contextSpan?: AST.Span, parameterContext?: FieldContext): void {
                this.resolveExprStmt(tryNode.expr, contextSpan, parameterContext);
            }

            private resolveCatch(catchNode: AST.CatchNode, contextSpan?: AST.Span, parameterContext?: FieldContext): void {
                this.resolveExprStmt(catchNode.leftExpr, contextSpan, parameterContext);

                const exprScope = this.config.services.scopeManager.findChildScopeByName('expr', ScopeKind.Expression);
                if (exprScope) {
                    this.config.services.contextTracker.withSavedState(() => {
                        this.config.services.contextTracker.setScope(exprScope.id);

                        this.config.services.scopeManager.withScope(exprScope.id, () => {
                            this.resolveStmt(catchNode.rightStmt, exprScope);
                        });
                    });
                } else {
                    this.resolveStmt(catchNode.rightStmt, this.config.services.scopeManager.getCurrentScope());
                }
            }

            private resolveIf(ifNode: AST.IfNode, contextSpan?: AST.Span, parameterContext?: FieldContext): void {
                this.config.services.contextTracker.enterExpression(ExpressionContext.ConditionExpression, ifNode.condExpr.span);
                this.resolveExprStmt(ifNode.condExpr, contextSpan, parameterContext);
                this.config.services.contextTracker.exitExpression();

                const currentScope = this.config.services.scopeManager.getCurrentScope();
                this.resolveStmt(ifNode.thenStmt, currentScope);
                if (ifNode.elseStmt) {
                    this.resolveStmt(ifNode.elseStmt, currentScope);
                }
            }

            private resolveSwitch(MatchNode: AST.MatchNode, contextSpan?: AST.Span, parameterContext?: FieldContext): void {
                this.config.services.contextTracker.enterExpression(ExpressionContext.ConditionExpression, MatchNode.condExpr.span);
                this.resolveExprStmt(MatchNode.condExpr, contextSpan, parameterContext);
                this.config.services.contextTracker.exitExpression();

                const currentScope = this.config.services.scopeManager.getCurrentScope();
                for (const switchCase of MatchNode.cases) {
                    if (switchCase.expr) {
                        this.resolveExprStmt(switchCase.expr, contextSpan, parameterContext);
                    }
                    if (switchCase.stmt) {
                        this.resolveStmt(switchCase.stmt, currentScope);
                    }
                }

                if (MatchNode.defCase) {
                    this.resolveStmt(MatchNode.defCase.stmt, currentScope);
                }
            }

            private findCallTargetSymbol(baseExpr: AST.ExprNode): Symbol | null {
                if (baseExpr.kind === 'Primary') {
                    const primary = baseExpr.getPrimary();
                    if (primary && primary.kind === 'Ident') {
                        const ident = primary.getIdent();
                        if (ident) {
                            return this.config.services.scopeManager.lookupSymbol(ident.name);
                        }
                    }
                }
                return null;
            }

            private validateCallableSymbol(symbol: Symbol, span?: AST.Span): void {
                // Quick check: Functions and callable metadata
                if (symbol.kind === SymbolKind.Function || (symbol.metadata as any)?.callable === true) {
                    return;
                }

                // Resolve identifier types (BinaryOp -> fn(...))
                if (symbol.type) {
                    const resolvedType = this.resolveIdentifierType(symbol.type);
                    if (resolvedType.kind === 'function') {
                        return;
                    }
                }

                // Check for imported functions
                if (symbol.kind === SymbolKind.Use && symbol.importSource) {
                    const sourceModuleScope = this.config.services.scopeManager.findScopeByName(symbol.importSource, ScopeKind.Module);
                    if (sourceModuleScope) {
                        let sourceSymbol = sourceModuleScope.symbols.get(symbol.name);

                        if (!sourceSymbol) {
                            for (const [_, potentialSource] of sourceModuleScope.symbols) {
                                if (potentialSource.kind === SymbolKind.Function ||
                                    (potentialSource.metadata as any)?.callable === true) {
                                    sourceSymbol = potentialSource;
                                    break;
                                }
                            }
                        }

                        if (sourceSymbol) {
                            if (sourceSymbol.kind === SymbolKind.Function ||
                                (sourceSymbol.metadata as any)?.callable === true ||
                                sourceSymbol.type?.kind === 'function') {
                                return;
                            }
                        }
                    }
                }

                this.reportError(
                    DiagCode.NOT_A_FUNCTION,
                    `Cannot call value of non-function type. '${symbol.name}' is a ${symbol.kind.toLowerCase()}`,
                    span
                );
            }

            // Add this helper method if it doesn't exist:
            private resolveIdentifierType(type: AST.TypeNode): AST.TypeNode {
                if (!type.isIdent()) return type;

                const ident = type.getIdent()!;
                if (ident.builtin) return type;

                const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                if (symbol && symbol.type) {
                    // Recursively resolve
                    return this.resolveIdentifierType(symbol.type);
                }

                return type;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── [5] Ident Level ──────────────────────────┐

            private resolveIdentifier(ident: AST.IdentNode, contextSpan?: AST.Span, parameterContext?: FieldContext): void {
                this.log('symbols', `Resolving identifier '${ident.name}'`);
                this.config.services.contextTracker.pushContextSpan(ident.span);

                try {
                    if (parameterContext) {
                        if (this.checkParameterForwardReference(ident, parameterContext)) {
                            return;
                        }
                    }

                    if (this.checkSelfReference(ident)) {
                        return;
                    }

                    if (ident.builtin) {
                        this.resolveBuiltinFunction(ident);
                        return;
                    }

                    // Handle 'self' FIRST
                    if (ident.name === 'self') {
                        // ALLOW in static methods (refers to the type)
                        if (this.currentIsStaticMethod && this.currentStructScope) {
                            // Don't lookup symbol - it doesn't exist for static methods
                            // Just mark as resolved, member access validation happens in TypeValidator
                            this.stats.resolvedSymbols++;
                            this.config.services.contextTracker.popContextSpan();
                            return;
                        }

                        // In instance methods, lookup the injected 'self' parameter
                        const selfSymbol = this.config.services.scopeManager.lookupSymbol('self');
                        if (selfSymbol && selfSymbol.metadata?.isSelf) {
                            selfSymbol.used = true;
                            this.stats.resolvedSymbols++;
                            this.config.services.contextTracker.popContextSpan();
                            return;
                        }

                        // If neither, it's an error
                        this.reportError(
                            DiagCode.UNDEFINED_IDENTIFIER,
                            "self can only be used in instance methods",
                            ident.span
                        );
                        this.config.services.contextTracker.popContextSpan();
                        return;
                    }

                    // Check direct field access in static methods (without self)
                    if (this.currentIsStaticMethod && this.currentStructScope) {
                        const fieldSymbol = this.currentStructScope.symbols.get(ident.name);

                        if (fieldSymbol && fieldSymbol.kind === SymbolKind.StructField) {
                            const isStaticField = fieldSymbol.visibility.kind === 'Static';

                            if (!isStaticField) {
                                this.reportError(
                                    DiagCode.INVALID_STATIC_ACCESS,
                                    `Cannot access instance field '${ident.name}' in static method. Static methods can only access static fields.`,
                                    ident.span
                                );
                                return;  // Stop processing and don't mark as used/resolved
                            }
                        }
                    }

                    // Check if we're in a struct method and identifier is a struct field
                    const currentScope = this.config.services.scopeManager.getCurrentScope();
                    if (currentScope.kind === ScopeKind.Function) {
                        const parentScope = this.config.services.scopeManager.getScopeParent(currentScope.id);
                        if (parentScope && parentScope.kind === ScopeKind.Type) {
                            const fieldSymbol = parentScope.symbols.get(ident.name);
                            if (fieldSymbol && fieldSymbol.kind === SymbolKind.StructField) {
                                fieldSymbol.used = true;
                                this.stats.resolvedSymbols++;
                                this.log('symbols', `Resolved struct field '${fieldSymbol.name}' as used`);
                                this.config.services.contextTracker.popContextSpan();
                                return;
                            }
                        }
                    }

                    this.resolveStandardIdentifier(ident, contextSpan);
                } finally {
                    this.config.services.contextTracker.popContextSpan();
                }
            }

            private resolveBuiltinFunction(ident: AST.IdentNode): void {
                const globalScope = this.config.services.scopeManager.getAllScopes().find(s => s.kind === ScopeKind.Global);
                if (!globalScope) {
                    throw new Error('Global scope not found');
                }

                const builtinName = `@${ident.name}`;
                const builtinSymbol = globalScope.symbols.get(builtinName);

                if (!builtinSymbol) {
                    this.reportError(
                        DiagCode.UNDEFINED_BUILTIN,
                        `Undefined builtin function '${builtinName}'`,
                        ident.span
                    );
                    return;
                }

                builtinSymbol.used = true;
                this.stats.resolvedSymbols++;
            }

            private resolveStandardIdentifier(ident: AST.IdentNode, contextSpan?: AST.Span): void {
                this.log('symbols', `Resolving standard identifier '${ident.name}'`);
                const cacheKey = this.createCacheKey(ident);

                let symbol = this.resolutionCtx.cache.get(cacheKey);
                if (symbol !== undefined) {
                    this.stats.cachedResolutions++;
                    if (symbol) {
                        symbol.used = true;
                        this.log('symbols', `Used cached symbol '${symbol.name}'`);
                    }
                    return;
                }

                symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                this.resolutionCtx.cache.set(cacheKey, symbol || null);

                if (!symbol) {
                    this.config.services.contextTracker.recordPendingReference(ident.name, ident.span);
                    this.reportError(
                        DiagCode.UNDEFINED_IDENTIFIER,
                        `Undefined identifier '${ident.name}'`,
                        ident.span
                    );
                    return;
                }

                this.validateSymbolUsage(symbol, ident, contextSpan);
                symbol.used = true;
                this.config.services.contextTracker.resolvePendingReferences(ident.name);
                this.stats.resolvedSymbols++;
                this.log('symbols', `Resolved and marked '${symbol.name}' as used`);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── [6] Type Level ───────────────────────────┐

            private resolveType(typeNode: AST.TypeNode, symbol: Symbol, contextSpan?: AST.Span): boolean {
                this.log('symbols', `Resolving type for symbol '${symbol.name}', typeNode: ${typeNode.toString()}`);

                switch (typeNode.kind) {
                    case 'ident': {
                        const identNode = typeNode.getIdent()!;

                        if (!identNode.builtin) {
                            const typeSymbol = this.config.services.scopeManager.lookupSymbol(identNode.name);

                            if (!typeSymbol) {
                                this.reportError(
                                    DiagCode.UNDEFINED_IDENTIFIER,
                                    `Undefined type '${identNode.name}'`,
                                    identNode.span
                                );
                                return false;
                            }

                            if (!typeSymbol.declared) {
                                this.reportError(
                                    DiagCode.USED_BEFORE_DECLARED,
                                    `Symbol '${identNode.name}' used before declaration`,
                                    identNode.span
                                );
                                return false;
                            }

                            typeSymbol.used = true;
                        }

                        symbol.type = typeNode;
                        return true;
                    }

                    case 'optional': {
                        const optional = typeNode.getOptional()!;
                        if (!this.resolveType(optional.target, symbol, contextSpan)) return false;
                        symbol.type = typeNode;
                        return true;
                    }

                    case 'pointer': {
                        const pointer = typeNode.getPointer()!;

                        // Normalize the target to remove parens before validation
                        let targetType = pointer.target;
                        while (targetType.isParen()) {
                            targetType = targetType.getParen()!.type;
                        }

                        // Validate pointer target is a type identifier, not a variable
                        if (targetType.isIdent()) {
                            const targetIdent = targetType.getIdent()!;

                            if (!targetIdent.builtin) {
                                const targetSymbol = this.config.services.scopeManager.lookupSymbol(targetIdent.name);

                                if (targetSymbol &&
                                    (targetSymbol.kind === SymbolKind.Variable ||
                                    targetSymbol.kind === SymbolKind.Parameter)) {
                                    this.reportError(
                                        DiagCode.TYPE_MISMATCH,
                                        `Cannot use pointer syntax with variable '${targetIdent.name}'. Did you mean to dereference using '.*' postfix operator?`,
                                        typeNode.span
                                    );
                                    return false;
                                }
                            }
                        }

                        if (!this.resolveType(pointer.target, symbol, contextSpan)) return false;
                        symbol.type = typeNode;
                        return true;
                    }

                    case 'array': {
                        const array = typeNode.getArray()!;
                        if (!this.resolveType(array.target, symbol, contextSpan)) return false;
                        if (array.size) this.resolveExprStmt(array.size, contextSpan, undefined, symbol);
                        symbol.type = typeNode;
                        return true;
                    }

                    case 'tuple': {
                        const tuple = typeNode.getTuple()!;
                        for (const field of tuple.fields) {
                            if (!this.resolveType(field, symbol, contextSpan)) return false;
                        }
                        symbol.type = typeNode;
                        return true;
                    }

                    case 'struct': {
                        const struct = typeNode.getStruct()!;

                        let typeScope: Scope | null = null;

                        if (struct.metadata?.scopeId !== undefined) {
                            try {
                                typeScope = this.config.services.scopeManager.getScope(struct.metadata.scopeId as number);
                            } catch {
                                typeScope = null;
                            }
                        }

                        if (!typeScope && struct.name && struct.name !== 'Anonymous') {
                            typeScope = this.config.services.scopeManager.findChildScopeByName(struct.name, ScopeKind.Type);
                        }

                        if (!typeScope) {
                            typeScope = this.config.services.scopeManager.findChildScopeByNameFromId(
                                symbol.name,
                                symbol.scope,
                                ScopeKind.Type
                            );
                        }

                        if (!typeScope) {
                            const parentScope = this.config.services.scopeManager.getScope(symbol.scope);
                            for (const childId of parentScope.children) {
                                const child = this.config.services.scopeManager.getScope(childId);
                                if (child.kind === ScopeKind.Type) {
                                    if (this.scopeMatchesStruct(child, struct)) {
                                        typeScope = child;
                                        break;
                                    }
                                }
                            }
                        }

                        if (typeScope) {
                            this.config.services.contextTracker.withSavedState(() => {
                                this.config.services.contextTracker.setScope(typeScope!.id);

                                this.config.services.scopeManager.withScope(typeScope!.id, () => {
                                    const fields: AST.FieldNode[] = [];
                                    const methods: AST.FuncStmtNode[] = [];

                                    for (const member of struct.members) {
                                        if (member.isField()) {
                                            fields.push(member.getField()!);
                                        } else if (member.isMethod()) {
                                            methods.push(member.getMethod()!);
                                        }
                                    }

                                    this.resolveFields(fields);

                                    for (const m of methods) {
                                        this.resolveFuncStmt(m);
                                    }
                                });
                            });
                        } else {
                            this.reportError(
                                DiagCode.INTERNAL_ERROR,
                                `Cannot find type scope for struct '${struct.name || '<anonymous>'}'`,
                                typeNode.span
                            );
                            return false;
                        }

                        symbol.type = typeNode;
                        return true;
                    }

                    case 'enum': {
                        const enumType = typeNode.getEnum()!;

                        let typeScope: Scope | null = null;

                        if (enumType.metadata?.scopeId !== undefined) {
                            try {
                                typeScope = this.config.services.scopeManager.getScope(enumType.metadata.scopeId as number);
                            } catch {
                                typeScope = null;
                            }
                        }

                        if (!typeScope && symbol.name) {
                            typeScope = this.config.services.scopeManager.findChildScopeByName(symbol.name, ScopeKind.Type);
                        }

                        if (typeScope) {
                            enumType.metadata = { ...enumType.metadata, scopeId: typeScope.id };

                            this.config.services.contextTracker.withSavedState(() => {
                                this.config.services.contextTracker.setScope(typeScope!.id);
                                this.config.services.scopeManager.withScope(typeScope!.id, () => {
                                    for (const variant of enumType.variants) {
                                        // Mark variant as resolved
                                        const variantSymbol = typeScope!.symbols.get(variant.ident.name);
                                        if (variantSymbol) {
                                            variantSymbol.declared = true;
                                            variantSymbol.used = true;
                                            this.stats.enumVariantsResolved++;
                                        }

                                        if (variant.type) {
                                            if (variant.type.isStruct()) {
                                                const structType = variant.type.getStruct()!;

                                                let variantScope: Scope | null = null;

                                                if (structType.metadata?.scopeId !== undefined) {
                                                    try {
                                                        variantScope = this.config.services.scopeManager.getScope(structType.metadata.scopeId as number);
                                                    } catch {
                                                        variantScope = null;
                                                    }
                                                }

                                                if (!variantScope) {
                                                    variantScope = this.config.services.scopeManager.findChildScopeByNameFromId(
                                                        variant.ident.name,
                                                        typeScope!.id,
                                                        ScopeKind.Type
                                                    );
                                                }

                                                if (variantScope) {
                                                    this.config.services.contextTracker.withSavedState(() => {
                                                        this.config.services.scopeManager.withScope(variantScope!.id, () => {
                                                            const tempSymbol: Symbol = {
                                                                id: -1,
                                                                name: variant.ident.name,
                                                                kind: SymbolKind.EnumVariant,
                                                                type: variant.type!,
                                                                scope: variantScope!.id,
                                                                contextSpan: variant.type!.span,
                                                                declared: true,
                                                                initialized: true,
                                                                used: false,
                                                                isTypeChecked: false,
                                                                visibility: { kind: 'Public'},
                                                                mutability: { kind: 'Immutable' },
                                                                isExported: false
                                                            };

                                                            this.resolveType(variant.type!, tempSymbol, contextSpan);
                                                        });
                                                    });
                                                }
                                            } else {
                                                this.resolveType(variant.type, symbol, contextSpan);
                                            }
                                        }
                                    }
                                });
                            });
                        }

                        symbol.type = typeNode;
                        return true;
                    }

                    case 'errset':
                        // Resolve error members
                        const errorType = typeNode.getErrset()!;
                        for (const errorMember of errorType.members) {
                            // Error members are just identifiers - mark them as resolved
                            const errorSymbol = this.config.services.scopeManager.lookupSymbol(errorMember.name);
                            if (errorSymbol) {
                                errorSymbol.used = true;
                                errorSymbol.declared = true;
                            }
                            this.log('symbols', `Resolved error member '${errorMember.name}'`);
                        }
                        symbol.type = typeNode;
                        return true;

                    case 'function': {
                        const func = typeNode.getFunction()!;

                        // Resolve parameters
                        for (const param of func.params) {
                            const tempParamSymbol: Symbol = {
                                id: -1,
                                name: '<func-param-type>',
                                kind: SymbolKind.Variable,
                                type: null,
                                scope: this.config.services.scopeManager.getCurrentScope().id,
                                contextSpan: param.span,
                                declared: true,
                                initialized: true,
                                used: false,
                                isTypeChecked: false,
                                visibility: { kind: 'Private' },
                                mutability: { kind: 'Immutable' },
                                isExported: false
                            };
                            if (!this.resolveType(param, tempParamSymbol, contextSpan)) return false;
                        }

                        // Resolve return type
                        if (func.returnType) {
                            const tempReturnSymbol: Symbol = {
                                id: -1,
                                name: '<func-return-type>',
                                kind: SymbolKind.Variable,
                                type: null,
                                scope: this.config.services.scopeManager.getCurrentScope().id,
                                contextSpan: func.returnType.span,
                                declared: true,
                                initialized: true,
                                used: false,
                                isTypeChecked: false,
                                visibility: { kind: 'Private' },
                                mutability: { kind: 'Immutable' },
                                isExported: false
                            };
                            if (!this.resolveType(func.returnType, tempReturnSymbol, contextSpan)) return false;
                        }

                        // Resolve and validate error type
                        if (func.errorType) {
                            // First, recursively resolve the error type structure
                            const tempErrorSymbol: Symbol = {
                                id: -1,
                                name: '<func-error-type>',
                                kind: SymbolKind.Variable,
                                type: null,
                                scope: this.config.services.scopeManager.getCurrentScope().id,
                                contextSpan: func.errorType.span,
                                declared: true,
                                initialized: true,
                                used: false,
                                isTypeChecked: false,
                                visibility: { kind: 'Private' },
                                mutability: { kind: 'Immutable' },
                                isExported: false
                            };
                            if (!this.resolveType(func.errorType, tempErrorSymbol, contextSpan)) return false;

                            // Then validate the error type identifier exists and is an error type
                            if (func.errorType.isIdent()) {
                                const errorIdent = func.errorType.getIdent()!;

                                if (!errorIdent.builtin) {
                                    const errorSymbol = this.config.services.scopeManager.lookupSymbol(errorIdent.name);

                                    if (!errorSymbol) {
                                        this.reportError(
                                            DiagCode.UNDEFINED_IDENTIFIER,
                                            `Error type '${errorIdent.name}' is not defined`,
                                            func.errorType.span
                                        );
                                        return false;
                                    }

                                    // Validate it's actually an error type
                                    if (errorSymbol.type && !errorSymbol.type.isErrset() && !errorSymbol.type.isErr()) {
                                        this.reportError(
                                            DiagCode.TYPE_MISMATCH,
                                            `'${errorIdent.name}' is not an error type`,
                                            func.errorType.span
                                        );
                                        return false;
                                    }
                                }
                            }
                        }

                        symbol.type = typeNode;
                        return true;
                    }

                    case 'union': {
                        const union = typeNode.getUnion()!;

                        for (const variantType of union.types) {
                            const tempVariantSymbol: Symbol = {
                                id: -1,
                                name: '<union-variant>',
                                kind: SymbolKind.Variable,
                                type: null,
                                scope: this.config.services.scopeManager.getCurrentScope().id,
                                contextSpan: variantType.span,
                                declared: true,
                                initialized: true,
                                used: false,
                                isTypeChecked: false,
                                visibility: { kind: 'Private' },
                                mutability: { kind: 'Immutable' },
                                isExported: false
                            };
                            if (!this.resolveType(variantType, tempVariantSymbol, contextSpan)) return false;
                        }

                        symbol.type = typeNode;
                        return true;
                    }

                    case 'paren': {
                        return this.resolveType(typeNode.getParen()!.type, symbol, contextSpan);
                    }

                    case 'primitive':
                        symbol.type = typeNode;
                        return true;

                    default:
                        this.config.services.diagnosticManager.reportError(DiagCode.UNSUPPORTED_TYPE, `Unsupported type kind: ${typeNode.kind}`, typeNode.span);
                        return false;
                }
            }

            private scopeMatchesStruct(scope: Scope, struct: AST.StructTypeNode): boolean {
                const structFields = struct.members.filter((m: AST.StructMemberNode) => m.isField());
                const scopeFields = Array.from(scope.symbols.values())
                    .filter(s => s.kind === SymbolKind.StructField);

                if (scopeFields.length !== structFields.length) {
                    return false;
                }

                for (const member of structFields) {
                    const field = member.source as AST.FieldNode;
                    const fieldName = field.ident.name;

                    if (!scope.symbols.has(fieldName)) {
                        return false;
                    }

                    const scopeSymbol = scope.symbols.get(fieldName)!;
                    if (scopeSymbol.kind !== SymbolKind.StructField) {
                        return false;
                    }
                }

                return true;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── [x] VALIDATION ───────────────────────────┐

            private checkParameterForwardReference(ident: AST.IdentNode, parameterContext: FieldContext): boolean {
                const forwardRefResult = this.config.services.contextTracker.checkParameterForwardReference(
                    ident.name,
                    parameterContext.currentFieldIndex,
                    parameterContext.parameters
                );

                if (forwardRefResult.isForwardReference) {
                    this.reportError(
                        DiagCode.PARAMETER_FORWARD_REFERENCE,
                        `Parameter '${parameterContext.parameters[parameterContext.currentFieldIndex].name}' default value refers to parameter '${ident.name}' which is not yet declared`,
                        ident.span
                    );
                    this.stats.forwardReferences++;
                    return true;
                }
                return false;
            }

            private checkSelfReference(ident: AST.IdentNode): boolean {
                const selfRefResult = this.config.services.contextTracker.checkSelfReference(ident.name, ident.span);

                if (selfRefResult.isSelfReference) {
                    const errorCode = selfRefResult.errorType === 'VARIABLE_SELF_INIT' ?
                        DiagCode.VARIABLE_SELF_INIT : DiagCode.PARAMETER_SELF_INIT;

                    const symbolType = selfRefResult.declarationContext?.symbolKind;
                    this.reportError(
                        errorCode,
                        `${symbolType} '${ident.name}' cannot be initialized using itself`,
                        ident.span
                    );
                    this.stats.selfReferences++;
                    return true;
                }
                return false;
            }

            private validateSymbolUsage(symbol: Symbol, ident: AST.IdentNode, contextSpan?: AST.Span): void {
                this.log('symbols', `Validating usage of symbol '${symbol.name}'`);

                if (contextSpan) {
                    this.config.services.contextTracker.pushContextSpan(contextSpan);
                }

                if (!symbol.declared) {
                    this.reportError(
                        DiagCode.USED_BEFORE_DECLARED,
                        `Symbol '${ident.name}' used before declaration`,
                        ident.span
                    );
                }

                if (symbol.kind === SymbolKind.Variable && !symbol.initialized) {
                    this.reportError(
                        DiagCode.USED_BEFORE_INITIALIZED,
                        `Variable '${ident.name}' used before initialization`,
                        ident.span
                    );
                }

                if (contextSpan) {
                    this.config.services.contextTracker.popContextSpan();
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private init(): boolean {
                this.config.services.contextTracker.reset();
                this.config.services.contextTracker.setPhase(AnalysisPhase.Resolution);
                this.stats.totalSymbols = Array.from(this.config.services.scopeManager.getAllSymbols()).length;

                const globalScope = this.config.services.scopeManager.getGlobalScope();
                this.config.services.scopeManager.setCurrentScope(globalScope.id);
                this.config.services.contextTracker.setScope(globalScope.id);

                this.log('verbose', `Resolution initialized: ${this.stats.totalSymbols} symbols to resolve`);
                return true;
            }

            private initStats(): ResolutionStats {
                return {
                    totalSymbols            : 0,
                    resolvedSymbols         : 0,
                    cachedResolutions       : 0,
                    forwardReferences       : 0,
                    selfReferences          : 0,
                    importResolutions       : 0,
                    structMethodsResolved   : 0,
                    enumVariantsResolved    : 0,
                    memberAccessResolved    : 0,
                    anonymousTypesResolved  : 0,
                    visibilityChecks        : 0,
                    errors                  : 0,
                    modulesProcessed        : 0,
                    startTime               : Date.now()
                };
            }

            private initResolutionContext(): ResolutionContext {
                return {
                    currentModule: '',
                    moduleStack: [],
                    cache: new Map(),
                };
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private createCacheKey(ident: AST.IdentNode): string {
                    const scope = this.config.services.scopeManager.getCurrentScope();
                    const moduleName = this.resolutionCtx.currentModule;
                    return `${moduleName}:${ident.name}:${ident.span.start}:${ident.span.end}`;
                }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            logStatistics(): void {
                const duration = Date.now() - this.stats.startTime;
                this.log('verbose',
                    `Resolution Statistics      :\n` +
                    `  Duration                 : ${duration}ms\n` +
                    `  Total symbols            : ${this.stats.totalSymbols}\n` +
                    `  Resolved symbols         : ${this.stats.resolvedSymbols}\n` +
                    `  Cached resolutions       : ${this.stats.cachedResolutions}\n` +
                    `  Forward references       : ${this.stats.forwardReferences}\n` +
                    `  Self references          : ${this.stats.selfReferences}\n` +
                    `  Import resolutions       : ${this.stats.importResolutions}\n` +
                    `  Struct methods resolved  : ${this.stats.structMethodsResolved}\n` +
                    `  Enum variants resolved   : ${this.stats.enumVariantsResolved}\n` +
                    `  Member access resolved   : ${this.stats.memberAccessResolved}\n` +
                    `  Anonymous types resolved : ${this.stats.anonymousTypesResolved}\n` +
                    `  Visibility checks        : ${this.stats.visibilityChecks}\n` +
                    `  Errors                   : ${this.stats.errors}`
                );
            }

        // └──────────────────────────────────────────────────────────────────────┘
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝