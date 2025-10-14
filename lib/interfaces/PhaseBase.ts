// BaseValidator.ts — Base validator interface and types for all validators
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST                             from '@je-es/ast';
    import { DiagCode }                         from '../components/DiagnosticManager';
    import { DebugKind }                        from '../components/DebugManager';
    import { AnalysisPhase }                    from '../components/ContextTracker';
    import { AnalysisConfig }                   from '../ast-analyzer';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    /** Abstract phase base class */
    export abstract class PhaseBase {
        protected constructor(
            protected readonly phase    : AnalysisPhase,
            protected readonly config   : AnalysisConfig,
        ) {
        }

        abstract reset(): void;

        abstract handle(program: AST.Program): boolean;

        abstract logStatistics(): void;

        reportError(code: DiagCode, message: string, span?: AST.Span): void {
            this.config.services.diagnosticManager.reportError(code, message, span);
        }

        reportWarning(code: DiagCode, message: string, span?: AST.Span): void {
            this.config.services.diagnosticManager.reportWarning(code, message, span);
        }

        reportInfo(code: DiagCode, message: string, span?: AST.Span): void {
            this.config.services.diagnosticManager.reportInfo(code, message, span);
        }

        log(kind: DebugKind = 'verbose', message: string ) {
            this.config.services.debugManager.log(kind, message);
        }
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝