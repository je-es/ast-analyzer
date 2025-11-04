// ast-analyzer.ts — Traverses the AST to perform static analysis, semantic checks, and error detection.
//
// repo   : https://github.com/je-es/ast-analyzer
// author : https://github.com/maysara-elshewehy
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST                             from '@je-es/ast';
    import * as Diag                            from './components/DiagnosticManager';
    import { ContextTracker, AnalysisPhase }    from './components/ContextTracker';
    import { DebugManager, DebugKind }          from './components/DebugManager';
    import { ScopeManager }                     from './components/ScopeManager';
    import { SymbolCollector }                  from './phases/SymbolCollector';
    import { SymbolResolver }                   from './phases/SymbolResolver';
    import { TypeValidator }                    from './phases/TypeValidator/TypeValidator';
    import { SemanticValidator }                from './phases/SemanticValidator';
    import { Formatter }                        from './phases/Formatter';
    import { BuiltinConfig }                    from '@je-es/syntax';

    // export
    export * from './components/DiagnosticManager';
    export * from './components/ScopeManager';
    export * from './components/DebugManager';
    export * from './components/ContextTracker';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface AnalysisConfig {
        debug               ?: DebugKind;
        stopAtPhase         ?: AnalysisPhase;
        strictMode          ?: boolean;
        maxErrors           ?: number;
        enableFormatting    ?: boolean;

        services            : AnalysisServices;
        program             : AST.Program;
        builtin             : BuiltinConfig;
        diagnosticFilter    ?: boolean;
    }

    export interface AnalysisResult {
        success             : boolean;
        diagnostics         : Diag.Diagnostic[];
        completedPhase      ?: AnalysisPhase;
        debugInfo           ?: {
            totalTime: number;
            phaseTimings: Map<AnalysisPhase, number>;
            memoryUsage?: number;
        };
    }

    export interface PhaseResult {
        success             : boolean;
        phase               : AnalysisPhase;
        duration            : number;
        errors              : number;
        warnings            : number;
    }

    export interface AnalysisServices {
        debugManager        : DebugManager;
        contextTracker      : ContextTracker;
        diagnosticManager   : Diag.DiagnosticManager;
        scopeManager        : ScopeManager;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class Analyzer {

        // ┌──────────────────────────────── INIT ────────────────────────────────┐

            config              : Required<AnalysisConfig>;
            phaseTimings        : Map<AnalysisPhase, number> = new Map();
            symbolCollector     : SymbolCollector;
            symbolResolver      : SymbolResolver;
            typeValidator       : TypeValidator;
            semanticValidator   : SemanticValidator;
            formatter           : Formatter;

            private constructor(config: Partial<AnalysisConfig> = {}) {
                // Merge with defaults
                this.config = this.createConfig(config);

                // Initialize phase validators
                this.symbolCollector    = new SymbolCollector(this.config);
                this.symbolResolver     = new SymbolResolver(this.config);
                this.typeValidator      = new TypeValidator(this.config);
                this.semanticValidator  = new SemanticValidator(this.config);
                this.formatter          = new Formatter(this.config);

                this.log('verbose', `🚀 Analyzer initialized with config: ${"..."}`);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ────────────────────────────────┐

            analyze(new_program: AST.Program | null, config?: Partial<AnalysisConfig>): AnalysisResult {
                const startTime = Date.now();
                this.log('verbose', '🔍 Starting multi-phase analysis...');

                try {
                    if(new_program !== null) this.config.program = new_program;

                    if (!this.validateProgramStructure(this.config.program)) {
                        return this.createErrorResult('Invalid program structure', AnalysisPhase.Collection);
                    }

                    // Apply runtime config overrides
                    if (config) {
                        this.config = { ...this.config, ...config };
                    }

                    // Execute analysis phases
                    const phases: Array<{ phase: AnalysisPhase, executor: () => boolean }> = [
                        { phase: AnalysisPhase.Collection,          executor: () => this.executePhase1() },
                        { phase: AnalysisPhase.Resolution,          executor: () => this.executePhase2() },
                        { phase: AnalysisPhase.TypeValidation,      executor: () => this.executePhase3() },
                        { phase: AnalysisPhase.SemanticValidation,  executor: () => this.executePhase4() },
                    ];

                    let completedPhase: AnalysisPhase = AnalysisPhase.Collection;
                    let shouldContinue = true;

                    for (const { phase, executor } of phases) {
                        if (!shouldContinue || this.shouldStopAtPhase(phase, this.config.stopAtPhase)) {
                            break;
                        }

                        const phaseResult = this.runPhase(phase, executor);
                        completedPhase = phase;

                        if (!phaseResult.success) {
                            if (this.config.strictMode) {
                                this.log('errors', `❌ Stopping at phase ${phase} (strict mode)`);
                                shouldContinue = false;
                            }
                        }

                        if (this.config.services.diagnosticManager.length() >= this.config.maxErrors) {
                            this.log('errors', `⚠️ Stopping due to error limit`);
                            shouldContinue = false;
                        }
                    }

                    // Run formatting phase if enabled and no errors
                    if (this.config.enableFormatting && !this.config.services.diagnosticManager.hasErrors()) {
                        this.log('verbose', '📝 Running formatting phase...');
                        const formatResult = this.runPhase(AnalysisPhase.Formatting, () => this.executePhaseFormat());
                        if (!formatResult.success) {
                            this.log('errors', `❌ Formatting phase failed`);
                            shouldContinue = false;
                        }
                    }

                    const totalTime = Date.now() - startTime;
                    const result = this.createFinalResult(completedPhase, totalTime);


                    this.log('verbose',
                        `Analysis completed in ${totalTime}ms\n` +
                        `   Success         : ${result.success}\n` +
                        `   Errors          : ${result.diagnostics.filter(d => d.kind === 'error').length}\n` +
                        `   Warnings        : ${result.diagnostics.filter(d => d.kind === 'warning').length}\n`
                    );

                    return result;

                } catch (error) {
                    this.log('errors', `💥 Fatal analysis error: ${error}`);
                    return this.createFatalErrorResult(error instanceof Error ? error.message : String(error));
                }
            }

            reset(): void {
                this.log('verbose', '🔄 Resetting analyzer state...');

                this.phaseTimings.clear();
                this.config.services.contextTracker.reset();
                this.config.services.diagnosticManager.reset();
                this.config.services.debugManager.reset();
                this.config.services.scopeManager.reset();

                this.symbolCollector.reset();
                this.symbolResolver.reset();
                this.typeValidator.reset();
                this.semanticValidator.reset();
                this.formatter.reset();
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

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

            private executePhaseFormat(): boolean {
                this.log('symbols', '📝 Phase 5: Code Formatting');
                return this.formatter.handle();
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

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

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

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private createServices(config : Partial<AnalysisConfig>): AnalysisServices {
                const debugManager       = new DebugManager(undefined, config.debug ?? 'off');
                const contextTracker     = new ContextTracker(debugManager);
                const diagnosticManager  = new Diag.DiagnosticManager(contextTracker, config.strictMode ?? false, config.diagnosticFilter ?? false);
                if(config.builtin === undefined) throw new Error('Builtin symbols must be provided');
                const scopeManager       = new ScopeManager(debugManager);

                return { debugManager, contextTracker, diagnosticManager, scopeManager }
            }

            private createConfig(config: Partial<AnalysisConfig>): Required<AnalysisConfig> {
                if(!config.program) {
                    throw new Error("Program must be provided")
                }
                const config_without_services : Partial<AnalysisConfig> = {
                    debug               : config.debug              ?? 'off',
                    stopAtPhase         : config.stopAtPhase        ?? AnalysisPhase.SemanticValidation,
                    strictMode          : config.strictMode         ?? false,
                    maxErrors           : config.maxErrors          ?? 100,
                    enableFormatting    : config.enableFormatting   ?? false,
                    program             : config.program            ?? null,
                    builtin             : config.builtin            ?? { types: [], functions: [] },
                    diagnosticFilter    : config.diagnosticFilter   ?? true
                };

                return {
                    debug               : config_without_services.debug!,
                    stopAtPhase         : config_without_services.stopAtPhase!,
                    strictMode          : config_without_services.strictMode!,
                    maxErrors           : config_without_services.maxErrors!,
                    enableFormatting    : config_without_services.enableFormatting!,
                    program             : config_without_services.program!,
                    builtin             : config_without_services.builtin!,
                    diagnosticFilter    : config_without_services.diagnosticFilter!,
                    services            : this.createServices(config_without_services)
                }
            }

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

            private log(kind: DebugKind = 'verbose', message: string ) {
                this.config.services.debugManager.log(kind, message);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            static create = (config?: Partial<AnalysisConfig>) => new Analyzer(config);

            getDiagMgr = () => this.config.services.diagnosticManager;

        // └──────────────────────────────────────────────────────────────────────┘
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝