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

        // Error handling codes - MORE SPECIFIC
        THROW_WITHOUT_ERROR_TYPE    = 'THROW_WITHOUT_ERROR_TYPE',
        THROW_TYPE_MISMATCH         = 'THROW_TYPE_MISMATCH',
        THROW_OUTSIDE_FUNCTION      = 'THROW_OUTSIDE_FUNCTION',
        INVALID_ERROR_TYPE          = 'INVALID_ERROR_TYPE',
        ERROR_MEMBER_NOT_FOUND      = 'ERROR_MEMBER_NOT_FOUND',        // Error set member not found
        SELFERR_INVALID_CONTEXT     = 'SELFERR_INVALID_CONTEXT',       // selferr used outside self-group
        THROW_NON_ERROR_TYPE        = 'THROW_NON_ERROR_TYPE',          // Throwing non-error value

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

        // Type System - MORE SPECIFIC
        TYPE_MISMATCH               = 'TYPE_MISMATCH',
        TYPE_MISMATCH_CALL          = 'TYPE_MISMATCH_CALL',            // Calling non-function
        TYPE_MISMATCH_ASSIGNMENT    = 'TYPE_MISMATCH_ASSIGNMENT',      // Assignment type mismatch
        TYPE_MISMATCH_RETURN        = 'TYPE_MISMATCH_RETURN',          // Return type mismatch
        TYPE_MISMATCH_PARAMETER     = 'TYPE_MISMATCH_PARAMETER',       // Parameter type mismatch
        TYPE_MISMATCH_FIELD         = 'TYPE_MISMATCH_FIELD',           // Struct field type mismatch
        ARRAY_TO_NON_ARRAY          = 'ARRAY_TO_NON_ARRAY',
        NON_ARRAY_TO_ARRAY          = 'NON_ARRAY_TO_ARRAY',
        BOOL_TO_NON_BOOL            = 'BOOL_TO_NON_BOOL',
        NON_BOOL_TO_BOOL            = 'NON_BOOL_TO_BOOL',
        NEGATIVE_TO_UNSIGNED        = 'NEGATIVE_TO_UNSIGNED',
        LITERAL_OVERFLOW            = 'LITERAL_OVERFLOW',
        CANNOT_INFER_TYPE           = 'CANNOT_INFER_TYPE',

        // Symbol Resolution - MORE SPECIFIC
        UNDEFINED_IDENTIFIER        = 'UNDEFINED_IDENTIFIER',
        UNDEFINED_IDENTIFIER_MEMBER = 'UNDEFINED_IDENTIFIER_MEMBER',   // Member access on undefined
        UNDEFINED_IDENTIFIER_TYPEOF = 'UNDEFINED_IDENTIFIER_TYPEOF',   // typeof on undefined
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

        // OVERFLOW - MORE SPECIFIC
        NEGATIVE_SHIFT              = 'NEGATIVE_SHIFT',
        SHIFT_OVERFLOW              = 'SHIFT_OVERFLOW',
        SHIFT_RESULT_OVERFLOW       = 'SHIFT_RESULT_OVERFLOW',
        ARITHMETIC_OVERFLOW         = 'ARITHMETIC_OVERFLOW',
        ARITHMETIC_OVERFLOW_COMPTIME = 'ARITHMETIC_OVERFLOW_COMPTIME',  // Overflow in comptime
        POTENTIAL_OVERFLOW          = 'POTENTIAL_OVERFLOW',

        DIVISION_BY_ZERO            = 'DIVISION_BY_ZERO',
        MODULO_BY_ZERO              = 'MODULO_BY_ZERO',
        PRECISION_LOSS              = 'PRECISION_LOSS',
        ARITHMETIC_ERROR            = 'ARITHMETIC_ERROR',

        ARRAY_SIZE_MISMATCH         = 'ARRAY_SIZE_MISMATCH',
        MUTABILITY_MISMATCH         = 'MUTABILITY_MISMATCH',
        MUTABILITY_MISMATCH_POINTER = 'MUTABILITY_MISMATCH_POINTER',   // Pointer mutability mismatch
        POTENTIAL_PRECISION_LOSS    = 'POTENTIAL_PRECISION_LOSS',
        POTENTIAL_DATA_LOSS         = 'POTENTIAL_DATA_LOSS',

        // Comptime - MORE SPECIFIC
        COMPTIME_EVAL_FAILED        = 'COMPTIME_EVAL_FAILED',          // Comptime evaluation failed
        COMPTIME_NON_CONST          = 'COMPTIME_NON_CONST',            // Non-const in comptime context

        // Builtin validation
        INVALID_BUILTIN_USAGE       = 'INVALID_BUILTIN_USAGE',         // Builtin used in wrong context
        INDEX_OUT_OF_BOUNDS         = 'INDEX_OUT_OF_BOUNDS',           // Index out of bounds error
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
                if (!diagnostic.sourceModuleName) {
                    diagnostic.sourceModuleName = this.contextTracker.getModuleName();
                }
                if (!diagnostic.sourceModulePath) {
                    const ctxPath = this.contextTracker.getModulePath();
                    if (ctxPath && ctxPath.length > 0) {
                        diagnostic.sourceModulePath = ctxPath;
                    } else {
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

            private isMoreSpecific(d1: Diagnostic, d2: Diagnostic): boolean {
                // Define priority hierarchy for related errors
                const errorPriority = new Map<DiagCode, number>([
                    // Most specific errors (highest priority)
                    [DiagCode.MODULE_NOT_FOUND, 100],
                    [DiagCode.ERROR_MEMBER_NOT_FOUND, 100],
                    [DiagCode.USED_BEFORE_DECLARED, 100],
                    [DiagCode.SELFERR_INVALID_CONTEXT, 100],
                    [DiagCode.NOT_A_FUNCTION, 90],
                    [DiagCode.ARITHMETIC_OVERFLOW_COMPTIME, 90],
                    [DiagCode.UNDEFINED_IDENTIFIER_MEMBER, 90],
                    [DiagCode.UNDEFINED_IDENTIFIER_TYPEOF, 90],

                    // Specific errors (high priority)
                    [DiagCode.UNDEFINED_IDENTIFIER, 80],
                    [DiagCode.ARITHMETIC_OVERFLOW, 80],
                    [DiagCode.THROW_WITHOUT_ERROR_TYPE, 80],
                    [DiagCode.MISSING_RETURN_STATEMENT, 70],
                    [DiagCode.SYMBOL_NOT_FOUND, 60],

                    // Generic errors (low priority)
                    [DiagCode.THROW_TYPE_MISMATCH, 40],
                    [DiagCode.TYPE_MISMATCH_CALL, 30],
                    [DiagCode.TYPE_MISMATCH, 20],
                    [DiagCode.TYPE_INFERENCE_FAILED, 10],
                    [DiagCode.COMPTIME_EVAL_FAILED, 10],
                    // [DiagCode.ANALYSIS_ERROR, 5],
                ]);

                const priority1 = errorPriority.get(d1.code) ?? 50;
                const priority2 = errorPriority.get(d2.code) ?? 50;

                if (priority1 !== priority2) {
                    return priority1 > priority2;
                }

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

                    // Check if this is the same issue as any existing diagnostic
                    for (const [key, existingDiagnostic] of seen.entries()) {
                        if (this.isSameIssue(diagnostic, existingDiagnostic)) {
                            foundDuplicate = true;
                            duplicateKey = key;
                            break;
                        }
                    }

                    if (!foundDuplicate) {
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
                return targetKey;
            }

            private isSameIssue(d1: Diagnostic, d2: Diagnostic): boolean {
                const target1 = d1.targetSpan ? `${d1.targetSpan.start}-${d1.targetSpan.end}` : 'no-target';
                const target2 = d2.targetSpan ? `${d2.targetSpan.start}-${d2.targetSpan.end}` : 'no-target';

                // Multiple errors of these types are ALWAYS distinct, even at same location
                const alwaysDistinctCodes = new Set([
                    DiagCode.MODULE_NOT_FOUND,
                    DiagCode.TYPE_MISMATCH,
                    DiagCode.TYPE_MISMATCH_FIELD,
                    DiagCode.SYMBOL_NOT_FOUND,
                    DiagCode.USED_BEFORE_DECLARED,
                    DiagCode.USED_BEFORE_INITIALIZED,
                    DiagCode.MUTABILITY_MISMATCH,
                ]);

                // If both are "always distinct" codes, they're different issues
                if (alwaysDistinctCodes.has(d1.code) && alwaysDistinctCodes.has(d2.code)) {
                    return false;
                }

                // Check for overlapping target spans (not necessarily exact match)
                const hasOverlappingTargets = target1 !== 'no-target' && target2 !== 'no-target' &&
                    this.spansOverlap(d1.targetSpan!, d2.targetSpan!);

                if (hasOverlappingTargets) {
                    // Define known cascading patterns with related error codes
                    const cascadingPatterns = [
                        // [Root cause, Cascading error]
                        [DiagCode.UNDEFINED_IDENTIFIER, DiagCode.TYPE_INFERENCE_FAILED],
                        [DiagCode.UNDEFINED_IDENTIFIER_MEMBER, DiagCode.TYPE_INFERENCE_FAILED],
                        [DiagCode.UNDEFINED_IDENTIFIER_TYPEOF, DiagCode.TYPE_INFERENCE_FAILED],
                        [DiagCode.USED_BEFORE_DECLARED, DiagCode.TYPE_MISMATCH],
                        [DiagCode.NOT_A_FUNCTION, DiagCode.TYPE_MISMATCH],
                        [DiagCode.NOT_A_FUNCTION, DiagCode.TYPE_MISMATCH_CALL],
                        [DiagCode.THROW_WITHOUT_ERROR_TYPE, DiagCode.MISSING_RETURN_STATEMENT],
                        [DiagCode.ARITHMETIC_OVERFLOW, DiagCode.ANALYSIS_ERROR],
                        [DiagCode.MODULE_NOT_FOUND, DiagCode.ANALYSIS_ERROR],
                        [DiagCode.ARITHMETIC_OVERFLOW_COMPTIME, DiagCode.COMPTIME_EVAL_FAILED],
                        [DiagCode.MISSING_RETURN_STATEMENT, DiagCode.ANALYSIS_ERROR],
                        [DiagCode.MISSING_RETURN_STATEMENT, DiagCode.COMPTIME_EVAL_FAILED],

                        // Duplicate detection from different validation layers
                        [DiagCode.SYMBOL_NOT_FOUND, DiagCode.ERROR_MEMBER_NOT_FOUND],  // Error member - both report same issue
                        [DiagCode.SYMBOL_NOT_FOUND, DiagCode.THROW_TYPE_MISMATCH],     // Symbol not found causes throw mismatch
                        [DiagCode.ERROR_MEMBER_NOT_FOUND, DiagCode.THROW_TYPE_MISMATCH], // More specific error + generic
                        [DiagCode.UNDEFINED_IDENTIFIER, DiagCode.SELFERR_INVALID_CONTEXT], // selferr detection in different phases
                        [DiagCode.SELFERR_INVALID_CONTEXT, DiagCode.THROW_TYPE_MISMATCH], // selferr + throw mismatch
                    ];

                    // Check if this matches any known cascading pattern
                    for (const [root, cascade] of cascadingPatterns) {
                        if ((d1.code === root && d2.code === cascade) ||
                            (d2.code === root && d1.code === cascade)) {
                            return true;
                        }
                    }

                    // Extract identifier from message
                    const identifierPatterns = [
                        /identifier '([^']+)'/i,
                        /Symbol '([^']+)'/i,
                        /'([^']+)' already imported/i,
                        /'([^']+)' shadows/i
                    ];

                    let id1: string | null = null;
                    let id2: string | null = null;

                    for (const pattern of identifierPatterns) {
                        id1 = id1 || d1.msg.match(pattern)?.[1] || null;
                        id2 = id2 || d2.msg.match(pattern)?.[1] || null;
                    }

                    // If both mention the same identifier, it's likely the same issue
                    if (id1 && id2 && id1 === id2) {
                        return true;
                    }

                    // Check for duplicate/shadowing patterns
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

                    return true; // Same target = same issue by default
                }

                // Check if they share the same context and are related type errors
                const context1 = d1.contextSpan ? `${d1.contextSpan.start}-${d1.contextSpan.end}` : 'no-context';
                const context2 = d2.contextSpan ? `${d2.contextSpan.start}-${d2.contextSpan.end}` : 'no-context';

                if (context1 === context2 && context1 !== 'no-context') {
                    const isTypeError = (code: DiagCode) =>
                        code === DiagCode.TYPE_MISMATCH ||
                        code === DiagCode.ARITHMETIC_OVERFLOW ||
                        code === DiagCode.LITERAL_OVERFLOW ||
                        code === DiagCode.CANNOT_INFER_TYPE;

                    // If both are type-related errors in the same context, treat as same issue
                    if (isTypeError(d1.code) && isTypeError(d2.code)) {
                        return true;
                    }
                }

                return false;
            }

            private spansOverlap(s1: Span, s2: Span): boolean {
                // Check if spans overlap at all
                return s1.start <= s2.end && s2.start <= s1.end;
            }

        // └────────────────────────────────────────────────────────────────────┘
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝