// DiagnosticManager.ts — Simplified diagnostic management.
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { Span }                 from '@je-es/ast';
    import { ContextTracker }       from './ContextTracker';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export enum DiagCode {
        // General
        INTERNAL_ERROR              = 'INTERNAL_ERROR',
        PARSER_ERROR                = 'PARSER_ERROR',
        MODULE_SCOPE_NOT_FOUND      = 'MODULE_SCOPE_NOT_FOUND',
        MODULE_NOT_FOUND            = 'MODULE_NOT_FOUND',
        TYPE_INFERENCE_FAILED       = 'TYPE_INFERENCE_FAILED',
        OPTIMIZATION_HINT           = 'OPTIMIZATION_HINT',
        SYMBOL_NOT_FOUND            = 'SYMBOL_NOT_FOUND',
        ANONYMOUS_STRUCT            = 'ANONYMOUS_STRUCT',
        TYPE_CYCLE_DETECTED         = 'TYPE_CYCLE_DETECTE',
        TYPE_NESTING_TOO_DEEP       = 'TYPE_NESTING_TOO_DEEP',
        SYMBOL_NOT_EXPORTED         = 'SYMBOL_NOT_EXPORTED',
        MISSING_REQUIRED_FIELD      = 'MISSING_REQUIRED_FIELD',
        INVALID_VISIBILITY          = 'INVALID_VISIBILITY',
        INVALID_TYPE_WIDTH          = 'INVALID_TYPE_WIDTH',
        MISSING_RETURN_STATEMENT    = 'MISSING_RETURN_STATEMENT',
        INVALID_STATIC_ACCESS       = 'INVALID_STATIC_ACCESS',
        SYMBOL_NOT_ACCESSIBLE       = 'SYMBOL_NOT_ACCESSIBLE',
        INVALID_SIZEOF_TARGET       = 'INVALID_SIZEOF_TARGET',

        // Error handling codes
        THROW_WITHOUT_ERROR_TYPE    = 'THROW_WITHOUT_ERROR_TYPE',
        THROW_TYPE_MISMATCH         = 'THROW_TYPE_MISMATCH',
        THROW_OUTSIDE_FUNCTION      = 'THROW_OUTSIDE_FUNCTION',
        INVALID_ERROR_TYPE          = 'INVALID_ERROR_TYPE',

        TYPE_VALIDATION_FAILED      = 'TYPE_VALIDATION_FAILED',
        INVALID_TYPE_OPERATION      = 'INVALID_TYPE_OPERATION',
        TYPE_INCOMPATIBLE           = 'TYPE_INCOMPATIBLE',
        TYPE_INFERENCE_ERROR        = 'TYPE_INFERENCE_ERROR',
        NULL_POINTER_ERROR          = 'NULL_POINTER_ERROR',
        TYPE_SAFETY_ERROR           = 'TYPE_SAFETY_ERROR',

        // Syntax & Structure
        SYNTAX_ERROR                = 'SYNTAX_ERROR',
        ANALYSIS_ERROR              = 'ANALYSIS_ERROR',

        // Entry Point
        ENTRY_MODULE_NOT_FOUND      = 'ENTRY_MODULE_NOT_FOUND',
        ENTRY_MODULE_NO_MAIN        = 'ENTRY_MODULE_NO_MAIN',
        ENTRY_MODULE_PRIVATE_MAIN   = 'ENTRY_MODULE_PRIVATE_MAIN',

        // Type System
        TYPE_MISMATCH               = 'TYPE_MISMATCH',
        ARRAY_TO_NON_ARRAY          = 'ARRAY_TO_NON_ARRAY',
        NON_ARRAY_TO_ARRAY          = 'NON_ARRAY_TO_ARRAY',
        BOOL_TO_NON_BOOL            = 'BOOL_TO_NON_BOOL',
        NON_BOOL_TO_BOOL            = 'NON_BOOL_TO_BOOL',
        NEGATIVE_TO_UNSIGNED        = 'NEGATIVE_TO_UNSIGNED',
        LITERAL_OVERFLOW            = 'LITERAL_OVERFLOW',
        CANNOT_INFER_TYPE           = 'CANNOT_INFER_TYPE',

        // Symbol Resolution
        UNDEFINED_IDENTIFIER        = 'UNDEFINED_IDENTIFIER',
        UNDEFINED_BUILTIN           = 'UNDEFINED_BUILTIN',
        UNDEFINED_FUNCTION          = 'UNDEFINED_FUNCTION',
        NOT_A_FUNCTION              = 'NOT_A_FUNCTION',
        USED_BEFORE_DECLARED        = 'USED_BEFORE_DECLARED',
        USED_BEFORE_INITIALIZED     = 'USED_BEFORE_INITIALIZED',
        UNDEFINED_TYPE              = 'UNDEFINED_TYPE',
        UNSUPPORTED_TYPE            = 'UnsupportedType',

        // Self Reference
        VARIABLE_SELF_INIT          = 'VARIABLE_SELF_INIT',
        PARAMETER_SELF_INIT         = 'PARAMETER_SELF_INIT',
        PARAMETER_FORWARD_REFERENCE = 'PARAMETER_FORWARD_REFERENCE',

        // Shadowing
        USE_SHADOWING               = 'USE_SHADOWING',
        DEFINITION_SHADOWING        = 'DEFINITION_SHADOWING',
        VARIABLE_SHADOWING          = 'VARIABLE_SHADOWING',
        FUNCTION_SHADOWING          = 'FUNCTION_SHADOWING',
        PARAMETER_SHADOWING         = 'PARAMETER_SHADOWING',
        STRUCT_FIELD_SHADOWING      = 'STRUCT_FIELD_SHADOWING',
        ENUM_VARIANT_SHADOWING      = 'ENUM_VARIANT_SHADOWING',
        ERROR_SHADOWING             = 'ERROR_SHADOWING',
        DUPLICATE_SYMBOL            = 'DUPLICATE_SYMBOL',

        // Function Calls
        TOO_FEW_ARGUMENTS           = 'TOO_FEW_ARGUMENTS',
        TOO_MANY_ARGUMENTS          = 'TOO_MANY_ARGUMENTS',

        // Unused Symbols
        UNUSED_VARIABLE             = 'UNUSED_VARIABLE',
        UNUSED_PARAMETER            = 'UNUSED_PARAMETER',
        UNUSED_FUNCTION             = 'UNUSED_FUNCTION',

        // Type Operations
        UNARY_MINUS_NON_NUMERIC     = 'UNARY_MINUS_NON_NUMERIC',
        UNARY_PLUS_NON_NUMERIC      = 'UNARY_PLUS_NON_NUMERIC',

        // Import System
        IMPORT_NOT_FOUND            = 'IMPORT_NOT_FOUND',
        IMPORT_CIRCULAR_DEPENDENCY  = 'IMPORT_CIRCULAR_DEPENDENCY',
        IMPORT_PRIVATE_SYMBOL       = 'IMPORT_PRIVATE_SYMBOL',

        // OVERFLOW
        NEGATIVE_SHIFT              = 'NEGATIVE_SHIFT',
        SHIFT_OVERFLOW              = 'SHIFT_OVERFLOW',
        SHIFT_RESULT_OVERFLOW       = 'SHIFT_RESULT_OVERFLOW',
        ARITHMETIC_OVERFLOW         = 'ARITHMETIC_OVERFLOW',
        POTENTIAL_OVERFLOW          = 'POTENTIAL_OVERFLOW',

        DIVISION_BY_ZERO            = 'DIVISION_BY_ZERO',
        MODULO_BY_ZERO              = 'MODULO_BY_ZERO',
        PRECISION_LOSS              = 'PRECISION_LOSS',
        ARITHMETIC_ERROR            = 'ARITHMETIC_ERROR',

        ARRAY_SIZE_MISMATCH         = 'ARRAY_SIZE_MISMATCH',
        MUTABILITY_MISMATCH         = 'MUTABILITY_MISMATCH',
        POTENTIAL_PRECISION_LOSS    = 'POTENTIAL_PRECISION_LOSS',
        POTENTIAL_DATA_LOSS         = 'POTENTIAL_DATA_LOSS',

    }

    export enum DiagKind {
        ERROR                       = 'error',
        WARNING                     = 'warning',
        INFO                        = 'info'
    }

    export interface Diagnostic {
        code        : DiagCode;
        kind        : DiagKind;
        contextSpan ?: Span;
        targetSpan  ?: Span;
        msg         : string;
        fixes       ?: DiagnosticFix[];

        sourceModuleName ?: string;
        sourceModulePath ?: string;
    }

    export interface DiagnosticFix {
        kind        : 'add' | 'remove' | 'replace' | 'rename';
        span        : Span;
        msg         : string;
        fix         ?: () => void;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class DiagnosticManager {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            public diagnostics          : Diagnostic[] = [];
            private readonly strictMode : boolean;
            private contextTracker      : ContextTracker;

            constructor(contextTracker: ContextTracker, strictMode = false) {
                this.strictMode         = strictMode;
                this.contextTracker     = contextTracker;
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            push(diagnostic: Diagnostic): void {

                // Enrich diagnostic only if values are not already provided by the caller
                if (!diagnostic.sourceModuleName) {
                    diagnostic.sourceModuleName = this.contextTracker.getModuleName();
                }
                if (!diagnostic.sourceModulePath) {
                    // Prefer the explicit module path from the context tracker when available
                    const ctxPath = this.contextTracker.getModulePath();
                    if (ctxPath && ctxPath.length > 0) {
                        diagnostic.sourceModulePath = ctxPath;
                    } else {
                        // Best-effort fallback: if we know the module name, synthesize a
                        // reasonable relative path like './<moduleName>' so downstream
                        // consumers get a non-empty path. This avoids clearing path in
                        // earlier phases and provides a predictable default.
                        const moduleName = this.contextTracker.getModuleName();
                        if (moduleName && moduleName.length > 0) {
                            diagnostic.sourceModulePath = `./${moduleName}`;
                        }
                    }
                }
                if (!diagnostic.contextSpan) {
                    diagnostic.contextSpan = this.contextTracker.getContextSpan();
                }

                if (this.strictMode && this.diagnostics.length > 0 && diagnostic.kind === DiagKind.ERROR) {
                    // In strict mode, avoid pushing more errors after the first
                    return;
                }

                this.diagnostics.push(diagnostic);
            }

            reportError(code: DiagCode, msg: string, targetSpan?: Span): void {
                this.push({ code, kind: DiagKind.ERROR, msg, targetSpan });
            }

            reportWarning(code: DiagCode, msg: string, targetSpan?: Span): void {
                this.push({ code, kind: DiagKind.WARNING, msg, targetSpan });
            }

            reportInfo(code: DiagCode, msg: string, targetSpan?: Span): void {
                this.push({ code, kind: DiagKind.INFO, msg, targetSpan });
            }

            addErrorDiagnostic(diagnostic: { message: string, phase: any, severity: 'error' | 'warning' | 'info' }): void {
                this.push({
                    code: DiagCode.ANALYSIS_ERROR,
                    kind: diagnostic.severity === 'error' ? DiagKind.ERROR :
                          diagnostic.severity === 'warning' ? DiagKind.WARNING :
                          DiagKind.INFO,
                    msg: diagnostic.message
                });
            }

            getDiagnostics(): Diagnostic[] {
                return this.filterDuplicates(this.diagnostics);
            }

            reset(): void {
                this.diagnostics = [];
            }

            hasErrors(): boolean {
                return this.diagnostics.some(d => d.kind === DiagKind.ERROR);
            }

            length(): number {
                return this.diagnostics.length;
            }

            getAllErrors(): Diagnostic[] {
                return this.diagnostics.filter(d => d.kind === DiagKind.ERROR);
            }

            getAllWarnings(): Diagnostic[] {
                return this.diagnostics.filter(d => d.kind === DiagKind.WARNING);
            }

            getAllInfos(): Diagnostic[] {
                return this.diagnostics.filter(d => d.kind === DiagKind.INFO);
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── HELP ──────────────────────────────┐

            private getContextKey(diagnostic: Diagnostic): string {
                return diagnostic.contextSpan
                    ? `c:${diagnostic.contextSpan.start}-${diagnostic.contextSpan.end}`
                    : 'no-context';
            }

            private isMoreSpecific(d1: Diagnostic, d2: Diagnostic): boolean {
                // Longer message usually means more context
                if (d1.msg.length !== d2.msg.length) {
                    return d1.msg.length > d2.msg.length;
                }

                // Larger context span means more detail
                const context1Size = d1.contextSpan
                    ? d1.contextSpan.end - d1.contextSpan.start
                    : 0;
                const context2Size = d2.contextSpan
                    ? d2.contextSpan.end - d2.contextSpan.start
                    : 0;

                if (context1Size !== context2Size) {
                    return context1Size > context2Size;
                }

                // Check priority (error > warning)
                return this.hasHigherPriority(d1, d2);
            }

            private hasHigherPriority(d1: Diagnostic, d2: Diagnostic): boolean {
                const priority = { error: 2, warning: 1, info: 0 };
                return (priority[d1.kind] || 0) > (priority[d2.kind] || 0);
            }

            private filterDuplicates(diagnostics: Diagnostic[]): Diagnostic[] {
                const seen = new Map<string, Diagnostic>();

                for (const diagnostic of diagnostics) {
                    let foundDuplicate = false;
                    let duplicateKey: string | null = null;

                    // First, check if this is the same issue as any existing diagnostic
                    for (const [key, existingDiagnostic] of seen.entries()) {
                        if (this.isSameIssue(diagnostic, existingDiagnostic)) {
                            foundDuplicate = true;
                            duplicateKey = key;
                            break;
                        }
                    }

                    if (!foundDuplicate) {
                        // No duplicate found, use the normal target key
                        const targetKey = this.getTargetKey(diagnostic);
                        seen.set(targetKey, diagnostic);
                    } else if (duplicateKey) {
                        // Found a duplicate - keep the more specific one
                        const existing = seen.get(duplicateKey)!;
                        if (this.isMoreSpecific(diagnostic, existing)) {
                            seen.set(duplicateKey, diagnostic);
                        }
                    }
                }

                return Array.from(seen.values());
            }

            private getTargetKey(diagnostic: Diagnostic): string {
                const targetKey = diagnostic.targetSpan
                    ? `t:${diagnostic.targetSpan.start}-${diagnostic.targetSpan.end}`
                    : 'no-target';
                // Remove diagnostic code from key to allow different codes for same location
                return targetKey;
            }

            private isSameIssue(d1: Diagnostic, d2: Diagnostic): boolean {
                // Same target span is the primary indicator
                const target1 = d1.targetSpan ? `${d1.targetSpan.start}-${d1.targetSpan.end}` : 'no-target';
                const target2 = d2.targetSpan ? `${d2.targetSpan.start}-${d2.targetSpan.end}` : 'no-target';

                if (target1 !== target2) {
                    return false;
                }

                // Extract identifier from message using more flexible patterns
                const identifierPatterns = [
                    /identifier '([^']+)'/i,
                    /Symbol '([^']+)'/i,
                    /'([^']+)' already imported/i,
                    /'([^']+)' shadows use/i
                ];

                let id1: string | null = null;
                let id2: string | null = null;

                for (const pattern of identifierPatterns) {
                    id1 = id1 || d1.msg.match(pattern)?.[1] || null;
                    id2 = id2 || d2.msg.match(pattern)?.[1] || null;
                }

                // If both mention the same identifier, it's the same issue
                if (id1 && id2 && id1 === id2) {
                    return true;
                }

                // Check for duplicate/shadowing patterns with same target
                const isDuplicateRelated = (code: DiagCode) =>
                    code === DiagCode.DUPLICATE_SYMBOL ||
                    code === DiagCode.USE_SHADOWING ||
                    code === DiagCode.VARIABLE_SHADOWING ||
                    code === DiagCode.FUNCTION_SHADOWING ||
                    code === DiagCode.DEFINITION_SHADOWING ||
                    code === DiagCode.PARAMETER_SHADOWING;

                if (isDuplicateRelated(d1.code) && isDuplicateRelated(d2.code)) {
                    return true;
                }

                return false;
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝