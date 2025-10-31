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

    export abstract class PhaseBase {

        // ┌──────────────────────────────── INIT ────────────────────────────────┐

            protected constructor(
                protected readonly phase    : AnalysisPhase,
                protected readonly config   : AnalysisConfig,
            ) {}

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            abstract reset(): void;

            abstract handle(): boolean;

            abstract logStatistics(): void;

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            protected getNodeGetter(stmt: AST.StmtNode): (() => any) | null {
                switch (stmt.kind) {
                    case 'block'        : return () => stmt.getBlock();
                    case 'section'      : return () => stmt.getSection();
                    case 'def'          : return () => stmt.getDef();
                    case 'use'          : return () => stmt.getUse();
                    case 'let'          : return () => stmt.getLet();
                    case 'func'         : return () => stmt.getFunc();
                    case 'return'       : return () => stmt.getReturn();
                    case 'defer'        : return () => stmt.getDefer();
                    case 'throw'        : return () => stmt.getThrow();
                    case 'continue'     : return () => stmt.getContinue();
                    case 'break'        : return () => stmt.getBreak();
                    case 'expression'   : return () => stmt.getExpr();
                    case 'while'        : return () => stmt.getWhile();
                    case 'do'           : return () => stmt.getDo();
                    case 'for'          : return () => stmt.getFor();
                    case 'test'         : return () => stmt.getTest();
                    default             : return null;
                }
            }

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

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

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

        // └──────────────────────────────────────────────────────────────────────┘
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝