// PhaseBase.ts — Base validator interface and types for all validators
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST                             from '@je-es/ast';
    import { DiagCode }                         from '../components/DiagnosticManager';
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

        abstract handle(): boolean;

        abstract logStatistics(): void;

        protected reportError(code: DiagCode, message: string, span?: AST.Span): void {
            this.config.services.diagnosticManager.reportError(code, message, span);
        }

        protected reportWarning(code: DiagCode, message: string, span?: AST.Span): void {
            this.config.services.diagnosticManager.reportWarning(code, message, span);
        }

        protected reportInfo(code: DiagCode, message: string, span?: AST.Span): void {
            this.config.services.diagnosticManager.reportInfo(code, message, span);
        }

        protected log(kind: 'verbose' | 'symbols' | 'scopes' | 'errors' = 'verbose', message: string): void {
            if (this.config.services.debugManager) {
                this.config.services.debugManager.log(kind, message);
            }
        }

        /**
         * Extract getter function for statement node based on its kind.
         * Returns null if the statement kind is invalid or unsupported.
         */
        protected getNodeGetter(stmt: AST.StmtNode): (() => any) | null {
            switch (stmt.kind) {
                case 'Def'          : return () => stmt.getDef();
                case 'Use'          : return () => stmt.getUse();
                case 'Let'          : return () => stmt.getLet();
                case 'Func'         : return () => stmt.getFunc();
                case 'Block'        : return () => stmt.getBlock();
                case 'Return'       :
                case 'Defer'        :
                case 'Throw'        : return () => stmt.getCtrlflow();
                case 'Expression'   : return () => stmt.getExpr();
                case 'While'        :
                case 'Do'           :
                case 'For'          : return () => stmt.getLoop();
                case 'Break'        : return () => stmt.getBreak();
                case 'Continue'     : return () => stmt.getContinue();
                case 'Test'         : return () => stmt.getTest();
                default             : return null;
            }
        }

        /**
         * Process a statement by delegating to kind-specific handlers.
         * Returns the result of the handler or null if kind is unsupported.
        */
        protected processStmtByKind<T>(
            stmt: AST.StmtNode,
            handlers: Partial<Record<AST.StmtNode['kind'], (node: any) => T>>
        ): T | null {
            const getter = this.getNodeGetter(stmt);
            if (!getter) {
                this.reportError(
                    DiagCode.INTERNAL_ERROR,
                    `Invalid AST: ${stmt.kind} node getter not found`
                );
                return null;
            }

            const handler = handlers[stmt.kind];
            if (!handler) {
                // No handler registered for this statement kind
                return null;
            }

            const node = getter();
            if (!node) {
                this.reportError(
                    DiagCode.INTERNAL_ERROR,
                    `Invalid AST: ${stmt.kind} node is null`
                );
                return null;
            }

            return handler(node);
        }
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝