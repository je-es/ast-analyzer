// SemanticValidator.ts — Semantic validation phase.
//
// Developed with ❤️ by Maysara.


// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST                     from '@je-es/ast';
    import { AnalysisPhase }            from '../components/ContextTracker';
    import { DiagCode, DiagKind }       from '../components/DiagnosticManager';
    import { AnalysisConfig }           from '../ast-analyzer';
    import { PhaseBase }                from '../interfaces/PhaseBase';
    import { ScopeKind, Symbol, SymbolKind }       from '../components/ScopeManager';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    interface EntryPointValidation {
        hasEntryModule: boolean;
        hasMainFunction: boolean;
        mainIsPublic: boolean;
        errors: string[];
    }

    interface UnusedSymbolAnalysis {
        unusedVariables: Symbol[];
        unusedParameters: Symbol[];
        unusedFunctions: Symbol[];
        totalUnused: number;
    }

    interface SemanticStats {
        entryPointChecks: number;
        unusedSymbolChecks: number;
        visibilityChecks: number;
        moduleIntegrityChecks: number;
        errors: number;
        warnings: number;
        startTime: number;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class SemanticValidator extends PhaseBase {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            private stats               : SemanticStats         = this.initStats();

            constructor( config : AnalysisConfig ) {
                super(AnalysisPhase.SemanticValidation, config);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ────────────────────────────────┐

            handle(): boolean {
                try {
                    this.log('verbose', 'Starting semantic validation phase...');
                    this.stats.startTime = Date.now();

                    this.validateEntryPoint();
                    this.validateUnusedSymbols();
                    this.validateModuleIntegrity();
                    this.validateVisibilityRules();

                    this.logStatistics();
                    return !this.config.services.diagnosticManager.hasErrors();

                } catch (error) {
                    this.log('errors', `Fatal error during semantic validation: ${error}`);
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `Semantic validation failed: ${error}`
                    );
                    return false;
                }
            }

            reset(): void {
                this.stats              = this.initStats();
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private validateEntryPoint(): void {
                this.log('symbols', 'Validating entry point');
                this.stats.entryPointChecks++;

                const entryModuleName = this.config.program!.metadata?.entryModule as string;
                if (!entryModuleName) {
                    // No entry module specified - this might be a library, so just return
                    this.log('verbose', 'No entry module specified, skipping entry point validation');
                    return;
                }

                const validation = this.performEntryPointValidation(entryModuleName);
                this.reportEntryPointErrors(validation, entryModuleName);
            }

            private performEntryPointValidation(entryModuleName: string): EntryPointValidation {
                const result: EntryPointValidation = {
                    hasEntryModule: false,
                    hasMainFunction: false,
                    mainIsPublic: false,
                    errors: []
                };

                // Check if entry module exists
                const entryModule = this.config.program!.modules.get(entryModuleName);
                if (!entryModule) {
                    result.errors.push(`Entry module '${entryModuleName}' not found`);
                    return result;
                }
                result.hasEntryModule = true;

                // Set context for better error reporting
                this.config.services.contextTracker.setModuleName(entryModuleName);
                if (typeof entryModule.metadata?.path === 'string') {
                    this.config.services.contextTracker.setModulePath(entryModule.metadata.path);
                }

                // Look for main function
                const mainFunc = entryModule.findFunction('main');
                if (!mainFunc) {
                    result.errors.push(`Entry module '${entryModuleName}' does not contain 'main' function`);
                    return result;
                }
                result.hasMainFunction = true;

                // Check if main is public
                if (mainFunc.visibility.kind !== 'Public') {
                    result.errors.push(`Main function in entry module '${entryModuleName}' must be public`);
                    return result;
                }
                result.mainIsPublic = true;

                // Additional validation for main function signature
                this.validateMainFunctionSignature(mainFunc, result);

                return result;
            }

            private validateMainFunctionSignature(mainFunc: AST.FuncStmtNode, result: EntryPointValidation): void {
                // Validate parameter count (main should have 0 or specific parameters)
                if (mainFunc.parameters.length > 2) {
                    result.errors.push(`Main function should not have more than 2 parameters`);
                }

                // Check return type if specified
                if (mainFunc.returnType && !this.isValidMainReturnType(mainFunc.returnType)) {
                    result.errors.push(`Main function should return void or exit code type`);
                }
            }

            private isValidMainReturnType(returnType: AST.TypeNode): boolean {
                return returnType.isVoid() ||
                       (returnType.isSigned() && returnType.getWidth() === 32) ||
                       (returnType.isUnsigned() && returnType.getWidth() === 8);
            }

            private reportEntryPointErrors(validation: EntryPointValidation, entryModuleName: string): void {
                for (const error of validation.errors) {
                    let code: DiagCode;

                    if (error.includes('not found')) {
                        code = DiagCode.ENTRY_MODULE_NOT_FOUND;
                    } else if (error.includes('does not contain')) {
                        code = DiagCode.ENTRY_MODULE_NO_MAIN;
                    } else if (error.includes('must be public')) {
                        code = DiagCode.ENTRY_MODULE_PRIVATE_MAIN;
                    } else {
                        code = DiagCode.ANALYSIS_ERROR;
                    }

                    this.reportError(code, error);
                    this.stats.errors++;
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private validateUnusedSymbols(): void {
                this.log('symbols', 'Validating unused symbols');
                this.stats.unusedSymbolChecks++;

                const analysis = this.analyzeUnusedSymbols();
                this.reportUnusedSymbols(analysis);
            }

            private analyzeUnusedSymbols(): UnusedSymbolAnalysis {
                const analysis: UnusedSymbolAnalysis = {
                    unusedVariables: [],
                    unusedParameters: [],
                    unusedFunctions: [],
                    totalUnused: 0
                };

                for (const symbol of this.config.services.scopeManager.getAllSymbols().values()) {
                    if (!symbol.used && this.shouldCheckForUnused(symbol)) {
                        switch (symbol.kind) {
                            case SymbolKind.Variable:
                                analysis.unusedVariables.push(symbol);
                                break;
                            case SymbolKind.Parameter:
                                analysis.unusedParameters.push(symbol);
                                break;
                            case SymbolKind.Function:
                                analysis.unusedFunctions.push(symbol);
                                break;
                        }
                        analysis.totalUnused++;
                    }
                }

                return analysis;
            }

            private shouldCheckForUnused(symbol: Symbol): boolean {
                // Skip symbols that start with underscore (conventional ignore)
                if (symbol.name.startsWith('_')) {
                    return false;
                }

                // Skip public symbols (may be used by other modules or external code)
                if (symbol.visibility.kind === 'Public') {
                    return false;
                }

                // Skip main function
                if (symbol.name === 'main' && symbol.kind === SymbolKind.Function) {
                    return false;
                }

                // Skip builtin functions
                if (symbol.name.startsWith('@')) {
                    return false;
                }

                // Skip imported symbols (they might be used indirectly)
                if (symbol.importSource) {
                    return false;
                }

                return true;
            }

            private reportUnusedSymbols(analysis: UnusedSymbolAnalysis): void {
                // Report unused variables
                for (const symbol of analysis.unusedVariables) {
                    this.reportUnusedSymbol(symbol, DiagCode.UNUSED_VARIABLE, 'Variable');
                }

                // Report unused parameters
                for (const symbol of analysis.unusedParameters) {
                    this.reportUnusedSymbol(symbol, DiagCode.UNUSED_PARAMETER, 'Parameter');
                }

                // Report unused functions
                for (const symbol of analysis.unusedFunctions) {
                    this.reportUnusedSymbol(symbol, DiagCode.UNUSED_FUNCTION, 'Function');
                }

                // Log summary
                if (analysis.totalUnused > 0) {
                    this.log('verbose',
                        `Found ${analysis.totalUnused} unused symbols: ` +
                        `${analysis.unusedVariables.length} variables, ` +
                        `${analysis.unusedParameters.length} parameters, ` +
                        `${analysis.unusedFunctions.length} functions`
                    );
                }
            }

            private reportUnusedSymbol(symbol: Symbol, code: DiagCode, symbolType: string): void {
                const prevModule = this.config.services.contextTracker.getModuleName();
                const prevPath = this.config.services.contextTracker.getModulePath();
                const prevSpan = this.config.services.contextTracker.getContextSpan();

                try {
                    // Set module context for better error reporting
                    if (symbol.module) {
                        this.config.services.contextTracker.setModuleName(symbol.module);
                        const module = this.config.program!.modules.get(symbol.module);
                        if (module && typeof module.metadata?.path === 'string') {
                            this.config.services.contextTracker.setModulePath(module.metadata.path);
                        }
                    }

                    this.config.services.contextTracker.setCurrentContextSpan(symbol.contextSpan);

                    // Don't warn about unused static methods
                    if (symbol.kind === SymbolKind.Function) {
                        const parentScope = this.config.services.scopeManager.getScope(symbol.scope);
                        if (parentScope.kind === ScopeKind.Type) {
                            // Check if it's a static method
                            if (symbol.visibility.kind === 'Static') {
                                return; // Skip warning for static methods
                            }
                        }
                    }

                    if(symbol.name === 'self' && symbol.kind === SymbolKind.Parameter) {
                        return; // Skip warning for 'self' in function
                    }

                    this.config.services.diagnosticManager.push({
                        code,
                        kind: DiagKind.WARNING,
                        msg: `${symbolType} '${symbol.name}' is declared but never used`,
                        targetSpan: symbol.targetSpan
                    });

                    this.stats.warnings++;
                } finally {
                    // Restore previous context
                    this.config.services.contextTracker.setModuleName(prevModule);
                    this.config.services.contextTracker.setModulePath(prevPath);
                    this.config.services.contextTracker.setCurrentContextSpan(prevSpan);
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private validateModuleIntegrity(): void {
                this.log('symbols', 'Validating module integrity');
                this.stats.moduleIntegrityChecks++;

                for (const [moduleName, module] of this.config.program!.modules) {
                    this.validateSingleModuleIntegrity(moduleName, module);
                }
            }

            private validateSingleModuleIntegrity(moduleName: string, module: AST.Module): void {
                const prevModule = this.config.services.contextTracker.getModuleName();
                const prevPath = this.config.services.contextTracker.getModulePath();
                const prevSpan = this.config.services.contextTracker.getContextSpan();

                try {
                    this.config.services.contextTracker.setModuleName(moduleName);
                    if (typeof module.metadata?.path === 'string') {
                        this.config.services.contextTracker.setModulePath(module.metadata.path);
                    }

                    // Set span context from module metadata if it's a valid span
                    const moduleSpan = module.metadata?.span;
                    if (moduleSpan && typeof moduleSpan === 'object' &&
                        'start' in moduleSpan && 'end' in moduleSpan) {
                        this.config.services.contextTracker.setCurrentContextSpan(moduleSpan as AST.Span);
                    }

                    // Check for empty modules
                    if (module.statements.length === 0) {
                        this.reportWarning(
                            DiagCode.ANALYSIS_ERROR,
                            `Module '${moduleName}' is empty`
                        );
                        return;
                    }
                } finally {
                    // Restore previous context
                    this.config.services.contextTracker.setModuleName(prevModule);
                    this.config.services.contextTracker.setModulePath(prevPath);
                    this.config.services.contextTracker.setCurrentContextSpan(prevSpan);
                }

                // Check for circular imports
                this.checkCircularImports(moduleName, module);

                // Validate export consistency
                this.validateExportConsistency(moduleName, module);
            }

            private checkCircularImports(moduleName: string, module: AST.Module): void {
                const importedModules = new Set<string>();

                for (const stmt of module.statements) {
                    if (stmt.kind === 'Use') {
                        const useNode = stmt.getUse()!;
                        if (useNode.path) {
                            const importedModule = this.findModuleByPath(useNode.path);
                            if (importedModule) {
                                importedModules.add(importedModule);

                                // Check if imported module also imports this module
                                if (this.hasCircularImport(moduleName, importedModule, new Set())) {
                                    this.reportWarning(
                                        DiagCode.IMPORT_CIRCULAR_DEPENDENCY,
                                        `Circular import detected between '${moduleName}' and '${importedModule}'`,
                                        useNode.span
                                    );
                                }
                            }
                        }
                    }
                }
            }

            private hasCircularImport(originalModule: string, currentModule: string, visited: Set<string>): boolean {
                if (visited.has(currentModule)) {
                    return currentModule === originalModule;
                }

                visited.add(currentModule);
                const module = this.config.program!.modules.get(currentModule);
                if (!module) return false;

                for (const stmt of module.statements) {
                    if (stmt.kind === 'Use') {
                        const useNode = stmt.getUse()!;
                        if (useNode.path) {
                            const importedModule = this.findModuleByPath(useNode.path);
                            if (importedModule === originalModule) {
                                return true;
                            }
                            if (importedModule && this.hasCircularImport(originalModule, importedModule, new Set(visited))) {
                                return true;
                            }
                        }
                    }
                }

                return false;
            }

            private validateExportConsistency(moduleName: string, module: AST.Module): void {
                // Check that all public symbols are actually accessible
                const moduleScope = this.config.services.scopeManager.findScopeByName(moduleName, 'Module' as any);
                if (!moduleScope) return;

                for (const [symbolName, symbol] of moduleScope.symbols) {
                    if (symbol.visibility.kind === 'Public' && !symbol.used) {
                        // This is handled by unused symbol validation, but we could add
                        // module-specific export consistency checks here
                    }
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private validateVisibilityRules(): void {
                this.log('symbols', 'Validating visibility rules');
                this.stats.visibilityChecks++;

                for (const symbol of this.config.services.scopeManager.getAllSymbols().values()) {
                    this.validateSymbolVisibility(symbol);
                }
            }

            private validateSymbolVisibility(symbol: Symbol): void {
                // Private symbols should not be accessed outside their module
                if (symbol.visibility.kind === 'Private' && symbol.used) {
                    this.validatePrivateSymbolUsage(symbol);
                }

                // Public symbols should be meaningfully public
                if (symbol.visibility.kind === 'Public') {
                    this.validatePublicSymbolExposure(symbol);
                }
            }

            private validatePrivateSymbolUsage(symbol: Symbol): void {
                // This would require more sophisticated cross-module usage analysis
                // For now, we trust that the symbol resolver has handled this correctly
            }

            private validatePublicSymbolExposure(symbol: Symbol): void {
                // Check if public symbols are actually used or meant to be API
                if (!symbol.used && symbol.kind !== SymbolKind.Function) {
                    // Public unused symbols might indicate API design issues
                    // But this is more of a design hint than an error
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private findModuleByPath(importPath: string): string | undefined {
                for (const [name, module] of this.config.program!.modules) {
                    const modulePath = module.metadata?.path as string | undefined;
                    if (modulePath === importPath) {
                        return name;
                    }
                }
                return undefined;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private init(): boolean {
                this.config.services.contextTracker.reset();
                this.config.services.contextTracker.setPhase(AnalysisPhase.SemanticValidation);

                this.log('verbose', 'Semantic validation initialized');
                return true;
            }

            private initStats(): SemanticStats {
                return {
                    entryPointChecks: 0,
                    unusedSymbolChecks: 0,
                    visibilityChecks: 0,
                    moduleIntegrityChecks: 0,
                    errors: 0,
                    warnings: 0,
                    startTime: Date.now()
                };
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            logStatistics(): void {
                const duration = Date.now() - this.stats.startTime;
                this.log('verbose',
                    `Semantic Validation Statistics     :\n` +
                    `  Duration                         : ${duration}ms\n` +
                    `  Entry point checks               : ${this.stats.entryPointChecks}\n` +
                    `  Unused symbol checks             : ${this.stats.unusedSymbolChecks}\n` +
                    `  Visibility checks                : ${this.stats.visibilityChecks}\n` +
                    `  Module integrity checks          : ${this.stats.moduleIntegrityChecks}\n` +
                    `  Errors                           : ${this.stats.errors}\n` +
                    `  Warnings                         : ${this.stats.warnings}`
                );
            }

        // └──────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝