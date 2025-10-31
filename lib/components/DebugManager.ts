// DebugManager.ts — Simplified debug management.
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { ContextTracker } from './ContextTracker';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export type DebugKind = 'off' | 'errors' | 'symbols' | 'scopes' | 'nodes' | 'verbose';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class DebugManager {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            private debugLevel          : DebugKind = 'off';
            private indentLevel         = 0;
            private contextTracker?     : ContextTracker;
            private lastMessage         : string = '';

            constructor(contextTracker?: ContextTracker, debugLevel: DebugKind = 'off') {
                this.debugLevel         = debugLevel;
                this.contextTracker     = contextTracker;
            }

            reset(): void {
                this.indentLevel = 0;
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            log(level: DebugKind, message: string): void {
                if (this.debugLevel === 'off') {return;}

                const levels: DebugKind[] = ['off', 'errors', 'symbols', 'scopes', 'nodes', 'verbose'];
                const currentIndex = levels.indexOf(this.debugLevel);
                const messageIndex = levels.indexOf(level);

                if (messageIndex <= currentIndex) {
                    const prefix = this.getDebugPrefix(level);
                    const indent = '  '.repeat(this.indentLevel);

                    // Get caller function name
                    let callerName = '';
                    try {
                        const err = new Error();
                        if (err.stack) {
                            const stackLines = err.stack.split('\n');

                            // Try to extract function name and method name
                            if (stackLines.length > 2) {
                                const match = stackLines[2].match(/at (?:.*\.)?([a-zA-Z0-9_$]+)(?: \[as .*\])? /);
                                if (match && match[1]) {
                                    callerName = match[1];
                                }
                            }
                        }
                    } catch { /* empty */ }

                    const callerInfo = callerName ? `${callerName}() : ` : '';
                    // Get short file path and line number
                    let short_file_path = 'unknown';
                    let line = 0;
                    let column = 0;
                    try {
                        const err = new Error();
                        if (err.stack) {
                            const stackLines = err.stack.split('\n');

                            // Try to extract file path, line number, and column number
                            if (stackLines.length > 3) {
                                const match = stackLines[3].match(/at .* \((.*):(\d+):(\d+)\)/) ||
                                              stackLines[3].match(/at (.*):(\d+):(\d+)/);
                                if (match && match[1] && match[2] && match[3]) {
                                    const fullPath = match[1];
                                    short_file_path = fullPath.split('/').slice(-2).join('/'); // last two segments
                                    line = parseInt(match[2], 10);
                                    column = parseInt(match[3], 10);
                                }
                            }
                        }
                    } catch { /* empty */ }

                    if(short_file_path !== 'unknown') {
                        // Extract root folder (e.g., src, lib) and reconstruct path
                        const match = short_file_path.match(/(src|lib)[/\\].*/);
                        if (match) {
                            short_file_path = `./${match[0].replace(/\\/g, '/')}`;
                        } else {
                            // fallback to last two segments
                            const parts = short_file_path.split(/[/\\]/);
                            if(parts.length > 2) {
                                short_file_path = `./${parts.slice(-2).join('/')}`;
                            } else if(parts.length === 2) {
                                short_file_path = `./${short_file_path.replace(/\\/g, '/')}`;
                            }
                        }
                    }

                    const msg_to_log = `${prefix} ${indent}${callerInfo}${message} at ${short_file_path}:${line}:${column}`;
                    if(this.lastMessage !== msg_to_log) {
                        console.log(msg_to_log);
                        this.lastMessage = msg_to_log;
                    }
                }
            }

            increaseIndent(): void {
                this.indentLevel++;
            }

            decreaseIndent(): void {
                this.indentLevel = Math.max(0, this.indentLevel - 1);
            }

            setDebugLevel(level: DebugKind): void {
                this.debugLevel = level;
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── HELP ──────────────────────────────┐

            private getDebugPrefix(level: DebugKind): string {
                const prefixes: Record<string, string> = {
                    errors   : '🔥',
                    symbols  : '', // 📝
                    scopes   : '📦',
                    nodes    : '🌳',
                    verbose  : '', // 📊
                };

                const prefix = prefixes[level] === '' ? '' : `[${prefixes[level] || '⚡'}]`;

                let phasePrefix = '';
                if (this.contextTracker) {
                    const phase = this.contextTracker.getCurrentPhase();
                    if (phase) {
                        phasePrefix = `[${phase}] `;
                    }
                }

                return `${phasePrefix}${prefix}`;
            }

        // └────────────────────────────────────────────────────────────────────┘
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝