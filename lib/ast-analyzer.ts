// Analyzer.ts — A library for analyzing and validating Abstract Syntax Trees.
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST                                 from '@je-es/ast';
    import * as Diag                                from './components/DiagnosticManager';
    import { ContextTracker, AnalysisPhase }        from './components/ContextTracker';
    import { DebugManager, DebugKind }              from './components/DebugManager';
    import { ScopeManager }                         from './components/ScopeManager';
    import { SymbolCollector }                      from './phases/SymbolCollector';
    import { SymbolResolver }                       from './phases/SymbolResolver';
    import { TypeValidator }                        from './phases/TypeValidator';
    import { SemanticValidator }                    from './phases/SemanticValidator';

    // Re-export
    export { type Diagnostic, DiagCode, DiagKind, DiagnosticFix, DiagnosticManager }
                                                from './components/DiagnosticManager';
    export { DebugManager }                     from './components/DebugManager';
    export { ContextTracker, AnalysisPhase }    from './components/ContextTracker';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    /** Analysis configuration options */
    export interface AnalysisConfig {
        /** Debug output level */
        debug               ?: DebugKind;
        /** Stop after specific phase */
        stopAtPhase         ?: AnalysisPhase;
        /** Enable strict mode (fail fast) */
        strictMode          ?: boolean;
        /** Maximum number of errors before stopping */
        maxErrors           ?: number;

        services            : AnalysisServices;

        program             : AST.Program | null;
    }

    /** Analysis result with diagnostics and metadata */
    export interface AnalysisResult {

        /** Whether analysis succeeded without errors */
        success             : boolean;

        /** All diagnostic messages */
        diagnostics         : Diag.Diagnostic[];

        // /** Analysis performance metrics */
        // performance?: PerformanceReport;

        /** Phase where analysis stopped */
        completedPhase      ?: AnalysisPhase;

        /** Debug information (if enabled) */
        debugInfo           ?: {
            totalTime: number;
            phaseTimings: Map<AnalysisPhase, number>;
            memoryUsage?: number;
        };
    }

    /** Internal phase result */
    export interface PhaseResult {
        success             : boolean;
        phase               : AnalysisPhase;
        duration            : number;
        errors              : number;
        warnings            : number;
    }

    /** Analysis services */
    export interface AnalysisServices {
        debugManager        : DebugManager;
        contextTracker      : ContextTracker;
        diagnosticManager   : Diag.DiagnosticManager;
        scopeManager        : ScopeManager;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    /**
     * Multi-phase AST analyzer for je-es language
     *
     * Provides comprehensive analysis including:
     * - Symbol collection and scope management
     * - Symbol resolution and usage validation
     * - Type checking and inference
     * - Semantic validation
     */
    export class Analyzer {

        // ┌────────────────────────── INITIALIZATION ──────────────────────────┐

            config              : Required<AnalysisConfig>;
            phaseTimings        : Map<AnalysisPhase, number> = new Map();
            symbolCollector     : SymbolCollector;
            symbolResolver      : SymbolResolver;
            typeValidator       : TypeValidator;
            semanticValidator   : SemanticValidator;

            private constructor(config: Partial<AnalysisConfig> = {}) {
                // Merge with defaults
                this.config = this.createConfig(config);

                // Initialize phase validators
                this.symbolCollector    = new SymbolCollector(this.config);
                this.symbolResolver     = new SymbolResolver(this.config);
                this.typeValidator      = new TypeValidator(this.config);
                this.semanticValidator  = new SemanticValidator(this.config);

                this.log('verbose', `🚀 Analyzer initialized with config: ${JSON.stringify(this.config)}`);
            }

            getDiagMgr = () => this.config.services.diagnosticManager;

            /** Factory method to create analyzer instance */
            static create(config?: Partial<AnalysisConfig>): Analyzer {
                return new Analyzer(config);
            }

            private log(kind: DebugKind = 'verbose', message: string ) {
                this.config.services.debugManager.log(kind, message);
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────── MAIN ANALYSIS INTERFACE ───────────────────┐

            /**
             * Analyze a program through all configured phases
             * @param program The AST program to analyze
             * @param config Optional runtime configuration overrides
             * @returns Analysis result with diagnostics and metadata
             */
            analyze(program: AST.Program, config?: Partial<AnalysisConfig>): AnalysisResult {
                const startTime = Date.now();
                this.log('verbose', '🔍 Starting multi-phase analysis...');

                try {
                    // Apply runtime config overrides
                    const effectiveConfig = { ...this.config, ...config };

                    // Reset all components
                    // this.reset();

                    // Validate program structure
                    if (!this.validateProgramStructure(program)) {
                        return this.createErrorResult('Invalid program structure', AnalysisPhase.Collection);
                    }

                    // Set the program
                    this.config.program = program;

                    // Execute phases in order
                    const phases: Array<{ phase: AnalysisPhase, executor: () => boolean }> = [

                        { phase: AnalysisPhase.Collection,          executor: () => this.executePhase1() },
                        { phase: AnalysisPhase.Resolution,          executor: () => this.executePhase2() },
                        { phase: AnalysisPhase.TypeValidation,      executor: () => this.executePhase3() },
                        { phase: AnalysisPhase.SemanticValidation,  executor: () => this.executePhase4() },
                    ];

                    let completedPhase: AnalysisPhase = AnalysisPhase.Collection;
                    let shouldContinue = true;

                    for (const { phase, executor } of phases) {
                        if (!shouldContinue || this.shouldStopAtPhase(phase, effectiveConfig.stopAtPhase)) {
                            break;
                        }

                        const phaseResult = this.runPhase(phase, executor);
                        completedPhase = phase;

                        // Check if we should continue
                        if (!phaseResult.success) {
                            if (effectiveConfig.strictMode) {
                                this.log('errors', `❌ Stopping analysis at phase ${phase} due to errors (strict mode)`);
                                shouldContinue = false;
                            }
                        }

                        // Check error limit
                        if (this.config.services.diagnosticManager.length() >= effectiveConfig.maxErrors) {
                            this.log('errors', `⚠️ Stopping analysis due to error limit (${effectiveConfig.maxErrors})`);
                            shouldContinue = false;
                        }
                    }

                    // Generate final result
                    const totalTime = Date.now() - startTime;
                    const result = this.createFinalResult(completedPhase, totalTime);

                    this.log('verbose',
                        `Analysis completed in ${totalTime}ms\n` +
                        `   Success: ${result.success}\n` +
                        `   Errors: ${result.diagnostics.filter(d => d.kind === 'error').length}\n` +
                        `   Warnings: ${result.diagnostics.filter(d => d.kind === 'warning').length}\n` +
                        `   Completed phase: ${completedPhase}`
                    );

                    // if we have errors log it
                    for (const diagnostic of result.diagnostics) {
                        this.log('errors', `${diagnostic.kind}: ${diagnostic.msg}`);
                    }

                    return result;

                } catch (error) {
                    this.log('errors', `💥 Fatal analysis error: ${error}`);
                    return this.createFatalErrorResult(error instanceof Error ? error.message : String(error));
                }
            }

            private createServices(config ?: Partial<AnalysisConfig>): AnalysisServices {
                const debugManager       = new DebugManager(undefined, config?.debug ?? 'off');
                const contextTracker     = new ContextTracker(debugManager);
                const diagnosticManager  = new Diag.DiagnosticManager(contextTracker, config?.strictMode ?? false);
                const scopeManager       = new ScopeManager(diagnosticManager, debugManager);

                return { debugManager, contextTracker, diagnosticManager, scopeManager }
            }

            private createConfig(config: Partial<AnalysisConfig>): Required<AnalysisConfig> {
                return {
                    debug           : config.debug          ?? 'off',
                    stopAtPhase     : config.stopAtPhase    ?? AnalysisPhase.SemanticValidation,
                    strictMode      : config.strictMode     ?? false,
                    maxErrors       : config.maxErrors      ?? 100,
                    services        : this.createServices(config),
                    program         : config.program     ?? null,
                };
            }

        // └────────────────────────────────────────────────────────────────────┘

        // ┌────────────────────────── PHASE EXECUTION ─────────────────────────┐

            private executePhase1(): boolean {
                this.log('symbols', '📂 Phase 1: Symbol Collection');
                return this.symbolCollector.handle();
            }

            private executePhase2(): boolean {
                this.log('symbols', '🔗 Phase 2: Symbol Resolution');
                return this.symbolResolver.handle();
            }

            private executePhase3(): boolean {
                this.log('symbols', '🔍 Phase 3: Type Validation');
                return this.typeValidator.handle();
            }

            private executePhase4(): boolean {
                this.log('symbols', 'Phase 4: Semantic Validation');
                return this.semanticValidator.handle();
            }

            private runPhase(phase: AnalysisPhase, executor: () => boolean): PhaseResult {
                const startTime = Date.now();
                const errorsBefore = this.config.services.diagnosticManager.length();

                this.log('verbose', `🔄 Starting phase: ${phase}`);
                this.config.services.debugManager.increaseIndent();

                try {
                    const success = executor();
                    const duration = Date.now() - startTime;
                    const errorsAfter = this.config.services.diagnosticManager.length();
                    const newErrors = Math.max(0, errorsAfter - errorsBefore);
                    const newWarnings = this.config.services.diagnosticManager.getDiagnostics()
                        .slice(errorsBefore)
                        .filter(d => d.kind === 'warning').length;

                    this.phaseTimings.set(phase, duration);

                    const result: PhaseResult = {
                        success,
                        phase,
                        duration,
                        errors: newErrors,
                        warnings: newWarnings
                    };

                    this.log('verbose',
                        `✨ Phase ${phase} completed in ${duration}ms ` +
                        `(${newErrors} errors, ${newWarnings} warnings)`
                    );

                    // if we have errors log it
                    for (const diagnostic of this.config.services.diagnosticManager.getDiagnostics().slice(errorsBefore)) {
                        this.log('errors', `${diagnostic.kind}: ${diagnostic.msg}`);
                    }

                    return result;
                } finally {
                    this.config.services.debugManager.decreaseIndent();
                }
            }

        // └────────────────────────────────────────────────────────────────────┘

        // ┌─────────────────────── VALIDATION AND UTILITIES ───────────────────┐

            private validateProgramStructure(program: AST.Program): boolean {
                if (!program) {
                    this.config.services.diagnosticManager.reportError(
                        Diag.DiagCode.INTERNAL_ERROR,
                        'Program is null or undefined'
                    );
                    return false;
                }

                if (!program.modules || program.modules.size === 0) {
                    this.config.services.diagnosticManager.reportError(
                        Diag.DiagCode.MODULE_NOT_FOUND,
                        'Program contains no modules'
                    );
                    return false;
                }

                // Validate entry module exists if specified
                const entryModule = program.metadata?.entryModule as string;
                if (entryModule && !program.modules.has(entryModule)) {
                    this.config.services.diagnosticManager.reportError(
                        Diag.DiagCode.ENTRY_MODULE_NOT_FOUND,
                        `Entry module '${entryModule}' not found`
                    );
                    return false;
                }

                return true;
            }

            private shouldStopAtPhase(currentPhase: AnalysisPhase, targetPhase: AnalysisPhase): boolean {
                const phaseOrder = [
                    AnalysisPhase.Collection,
                    AnalysisPhase.Resolution,
                    AnalysisPhase.TypeValidation,
                    AnalysisPhase.SemanticValidation,
                ];

                const currentIndex = phaseOrder.indexOf(currentPhase);
                const targetIndex = phaseOrder.indexOf(targetPhase);

                return currentIndex > targetIndex;
            }

            reset(): void {
                this.log('verbose', '🔄 Resetting analyzer state...');

                this.phaseTimings.clear();
                this.config.services.contextTracker.reset();
                this.config.services.diagnosticManager.reset();
                this.config.services.debugManager.reset();
                this.config.services.scopeManager.reset();

                this.config.program = null;

                this.symbolCollector.reset();
                this.symbolResolver.reset();
                this.typeValidator.reset();
                this.semanticValidator.reset();
            }

        // └────────────────────────────────────────────────────────────────────┘

        // ┌───────────────────────── RESULT GENERATION ────────────────────────┐

            private createFinalResult(completedPhase: AnalysisPhase, totalTime: number): AnalysisResult {
                const diagnostics = this.config.services.diagnosticManager.getDiagnostics();
                const hasErrors = diagnostics.some(d => d.kind === Diag.DiagKind.ERROR);

                const result: AnalysisResult = {
                    success: !hasErrors,
                    diagnostics,
                    completedPhase,
                    debugInfo: {
                        totalTime,
                        phaseTimings: new Map(this.phaseTimings),
                        memoryUsage: this.getMemoryUsage()
                    }
                };

                return result;
            }

            private createErrorResult(message: string, phase: AnalysisPhase): AnalysisResult {
                this.config.services.diagnosticManager.reportError(Diag.DiagCode.ANALYSIS_ERROR, message);

                return {
                    success: false,
                    diagnostics: this.config.services.diagnosticManager.getDiagnostics(),
                    completedPhase: phase
                };
            }

            private createFatalErrorResult(message: string): AnalysisResult {
                return {
                    success: false,
                    diagnostics: [{
                        code: Diag.DiagCode.INTERNAL_ERROR,
                        kind: Diag.DiagKind.ERROR,
                        msg: `Fatal analysis error: ${message}`,
                        targetSpan: { start: 0, end: 0 }
                    }]
                };
            }

            private getMemoryUsage(): number | undefined {
                try {
                    if (typeof process !== 'undefined' && process.memoryUsage) {
                        return process.memoryUsage().heapUsed;
                    }
                } catch {
                    // Ignore memory usage collection errors
                }
                return undefined;
            }

        // └────────────────────────────────────────────────────────────────────┘
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝