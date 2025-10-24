// ExpressionEvaluator.ts — Compile-time expression evaluation.
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST                 from '@je-es/ast';
    import { DiagCode }             from '../../components/DiagnosticManager';
    import { AnalysisConfig }       from '../../ast-analyzer';
    import { Scope, Symbol, SymbolKind, ScopeKind }
                                    from '../../components/ScopeManager';
    import { DebugKind }            from '../../components/DebugManager';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export type ComptimeValue = bigint | number | boolean | null;

    export interface EvaluationResult {
        value: ComptimeValue;
        type: 'int' | 'float' | 'bool' | 'null';
    }

    export interface EvaluationContext {
        allowFloats: boolean;
        maxIntValue: bigint;
        minIntValue: bigint;
        targetType?: AST.TypeNode;  // For size-aware validation
    }

    type LocalVariableMap = Map<string, EvaluationResult>;

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class ExpressionEvaluator {

        // ┌──────────────────────────────── INIT ────────────────────────────────┐

            private readonly MAX_INT_64 = BigInt('9223372036854775807'); // i64::MAX
            private readonly MIN_INT_64 = BigInt('-9223372036854775808'); // i64::MIN

            private comptimeResultCache = new Map<string, EvaluationResult>();

            constructor(public config: AnalysisConfig) {}

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ────────────────────────────────┐

            evaluateComptimeExpression(expr: AST.ExprNode, targetType?: AST.TypeNode): bigint | null {
                // Check if target is float type - return early
                if (targetType && this.isFloatTargetType(targetType)) {
                    return null;
                }

                const bounds = this.getTypeBounds(targetType);

                const result = this.evaluateExpression(expr, {
                    allowFloats: false,
                    maxIntValue: this.MAX_INT_64,
                    minIntValue: this.MIN_INT_64,
                    targetType
                });

                if (!result) return null;

                if (result.type !== 'int') {
                    return null;
                }

                const value = result.value as bigint;

                // Check bounds AFTER evaluation
                if (targetType && (value < bounds.min || value > bounds.max)) {
                    this.reportError(
                        DiagCode.ARITHMETIC_OVERFLOW,
                        `Value ${value} does not fit in type '${targetType.toString()}' (valid range: ${bounds.min} to ${bounds.max})`,
                        expr.span
                    );
                    return null;
                }

                return value;
            }

            evaluateComptimeFloat(expr: AST.ExprNode, targetType?: AST.TypeNode): number | null {
                const result = this.evaluateExpression(expr, {
                    allowFloats: true,
                    maxIntValue: this.MAX_INT_64,
                    minIntValue: this.MIN_INT_64,
                    targetType
                });

                if (!result) return null;

                // Convert to float if needed
                if (result.type === 'int') {
                    return Number(result.value);
                }

                if (result.type === 'float') {
                    const value = result.value as number;

                    // Validate float bounds if target type specified
                    if (targetType) {
                        const bounds = this.getFloatBounds(targetType);
                        if (value < bounds.min || value > bounds.max) {
                            this.reportError(
                                DiagCode.ARITHMETIC_OVERFLOW,
                                `Float value ${value} does not fit in type '${targetType.toString()}'`,
                                expr.span
                            );
                            return null;
                        }
                    }

                    return value;
                }

                return null;
            }

            evaluateComptimeValue(expr: AST.ExprNode, targetType?: AST.TypeNode): ComptimeValue | null {
                const allowFloats = !targetType || !this.isIntegerTargetType(targetType);

                const result = this.evaluateExpression(expr, {
                    allowFloats,
                    maxIntValue: this.MAX_INT_64,
                    minIntValue: this.MIN_INT_64,
                    targetType
                });

                return result ? result.value : null;
            }

            evaluateExpression(expr: AST.ExprNode, ctx?: EvaluationContext): EvaluationResult | null {
                const context = ctx || {
                    allowFloats: true,
                    maxIntValue: this.MAX_INT_64,
                    minIntValue: this.MIN_INT_64
                };

                try {
                    switch (expr.kind) {
                        case 'Primary':
                            return this.evaluatePrimary(expr.getPrimary()!, context);
                        case 'Binary':
                            return this.evaluateBinary(expr.getBinary()!, context);
                        case 'Prefix':
                            return this.evaluatePrefix(expr.getPrefix()!, context);
                        case 'Postfix': {
                            const postfix = expr.getPostfix();

                            if (postfix?.kind === 'Call') {
                                return this.evaluateComptimeFunctionCall(postfix.getCall()!, context);
                            }

                            return null;
                        }
                        case 'As':
                            return this.evaluateAs(expr.getAs()!, context);
                        case 'Sizeof':
                            return this.evaluateSizeof(expr.getSizeof()!, context);
                        default:
                            return null;
                    }
                } catch (error) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `Error evaluating compile-time expression: ${error}`,
                        expr.span
                    );
                    return null;
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── PRIMARY ──────────────────────────────┐

            private evaluatePrimary(primary: AST.PrimaryNode, ctx: EvaluationContext): EvaluationResult | null {
                switch (primary.kind) {
                    case 'Literal':
                        return this.evaluateLiteral(primary.getLiteral()!, ctx);
                    case 'Ident':
                        return this.evaluateIdentifier(primary.getIdent()!, ctx);
                    case 'Paren': {
                        const paren = primary.getParen()!;
                        return paren.source ? this.evaluateExpression(paren.source, ctx) : null;
                    }
                    default:
                        return null;
                }
            }

            private evaluateLiteral(literal: AST.LiteralNode, ctx: EvaluationContext): EvaluationResult | null {
                switch (literal.kind) {
                    case 'Integer': {
                        try {
                            const value = BigInt(literal.value as string);
                            return { value, type: 'int' };
                        } catch {
                            this.reportError(
                                DiagCode.ANALYSIS_ERROR,
                                `Invalid integer literal: ${literal.value}`,
                                literal.span
                            );
                            return null;
                        }
                    }

                    case 'Float': {
                        if (!ctx.allowFloats) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                'Float literals not allowed in integer-only context',
                                literal.span
                            );
                            return null;
                        }

                        try {
                            const value = parseFloat(literal.value as string);

                            if (!isFinite(value)) {
                                this.reportError(
                                    DiagCode.ARITHMETIC_OVERFLOW,
                                    'Float literal out of valid range',
                                    literal.span
                                );
                                return null;
                            }

                            return { value, type: 'float' };
                        } catch {
                            this.reportError(
                                DiagCode.ANALYSIS_ERROR,
                                `Invalid float literal: ${literal.value}`,
                                literal.span
                            );
                            return null;
                        }
                    }

                    case 'Character': {
                        const charValue = literal.value as string;

                        if (charValue.length === 0) {
                            return { value: BigInt(0), type: 'int' };
                        }

                        const codePoint = charValue.codePointAt(0) || 0;

                        if (codePoint > 127) {
                            if (codePoint > 0x1FFFFF) {
                                this.reportError(
                                    DiagCode.ARITHMETIC_OVERFLOW,
                                    `Character code point ${codePoint} exceeds u21 maximum (2,097,151)`,
                                    literal.span
                                );
                                return null;
                            }
                        }

                        return { value: BigInt(codePoint), type: 'int' };
                    }

                    case 'Bool':
                        return { value: literal.value as boolean, type: 'bool' };

                    case 'Null':
                        return { value: null, type: 'null' };

                    default:
                        return null;
                }
            }

            private evaluateIdentifier(ident: AST.IdentNode, ctx: EvaluationContext): EvaluationResult | null {
                const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                if (!symbol) return null;

                if (symbol.kind !== SymbolKind.Definition && symbol.kind !== SymbolKind.Variable) {
                    return null;
                }

                if (symbol.mutability.kind !== 'Immutable') {
                    return null;
                }

                if (symbol.metadata && typeof symbol.metadata === 'object') {
                    const metadata = symbol.metadata as any;
                    if (metadata.initializer) {
                        return this.evaluateExpression(metadata.initializer, ctx);
                    }
                }

                return null;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── BINARY ──────────────────────────────┐

            private evaluateBinary(binary: AST.BinaryNode, ctx: EvaluationContext): EvaluationResult | null {
                const left = this.evaluateExpression(binary.left, ctx);
                const right = this.evaluateExpression(binary.right, ctx);

                if (!left || !right) return null;

                if (!this.areTypesCompatible(left.type, right.type, binary.kind)) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot perform ${binary.kind} operation on incompatible types '${left.type}' and '${right.type}'`,
                        binary.span
                    );
                    return null;
                }

                switch (binary.kind) {
                    case 'Additive':
                        return this.evaluateAdditive(left, right, binary.operator, binary.span);
                    case 'Multiplicative':
                        return this.evaluateMultiplicative(left, right, binary.operator, binary.span);
                    case 'Power':
                        return this.evaluatePower(left, right, binary.span);
                    case 'Shift':
                        return this.evaluateShift(left, right, binary.operator, binary.span);
                    case 'BitwiseAnd':
                    case 'BitwiseXor':
                    case 'BitwiseOr':
                        return this.evaluateBitwise(left, right, binary.kind, binary.span);
                    case 'Relational':
                    case 'Equality':
                        return this.evaluateComparison(left, right, binary.operator, binary.span);
                    case 'LogicalAnd':
                    case 'LogicalOr':
                        return this.evaluateLogical(left, right, binary.kind, binary.span);
                    default:
                        return null;
                }
            }

            private evaluateAdditive(
                left: EvaluationResult,
                right: EvaluationResult,
                op: string,
                span: AST.Span
            ): EvaluationResult | null {
                if (left.type === 'bool' || right.type === 'bool') {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot perform ${op === '+' ? 'addition' : 'subtraction'} on boolean type`,
                        span
                    );
                    return null;
                }

                if (left.type === 'float' || right.type === 'float') {
                    const l = this.toFloat(left);
                    const r = this.toFloat(right);
                    const result = op === '+' ? l + r : l - r;

                    if (!isFinite(result)) {
                        this.reportError(
                            DiagCode.ARITHMETIC_OVERFLOW,
                            `Float ${op === '+' ? 'addition' : 'subtraction'} overflow`,
                            span
                        );
                        return null;
                    }

                    return { value: result, type: 'float' };
                }

                const l = left.value as bigint;
                const r = right.value as bigint;

                try {
                    const result = op === '+' ? l + r : l - r;

                    if (result > this.MAX_INT_64 || result < this.MIN_INT_64) {
                        this.reportError(
                            DiagCode.ARITHMETIC_OVERFLOW,
                            `Integer ${op === '+' ? 'addition' : 'subtraction'} overflow: ${l} ${op} ${r} = ${result}`,
                            span
                        );
                        return null;
                    }

                    return { value: result, type: 'int' };
                } catch {
                    this.reportError(
                        DiagCode.ARITHMETIC_OVERFLOW,
                        `Integer ${op === '+' ? 'addition' : 'subtraction'} overflow`,
                        span
                    );
                    return null;
                }
            }

            private evaluateMultiplicative(
                left: EvaluationResult,
                right: EvaluationResult,
                op: string,
                span: AST.Span
            ): EvaluationResult | null {
                if (left.type === 'bool' || right.type === 'bool') {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot perform multiplication/division on boolean type`,
                        span
                    );
                    return null;
                }

                if (left.type === 'float' || right.type === 'float') {
                    const l = this.toFloat(left);
                    const r = this.toFloat(right);

                    if ((op === '/' || op === '%') && r === 0) {
                        this.reportError(
                            DiagCode.DIVISION_BY_ZERO,
                            `${op === '/' ? 'Division' : 'Modulo'} by zero in compile-time expression`,
                            span
                        );
                        return null;
                    }

                    let result: number;
                    switch (op) {
                        case '*': result = l * r; break;
                        case '/': result = l / r; break;
                        case '%': result = l % r; break;
                        default: return null;
                    }

                    if (!isFinite(result)) {
                        this.reportError(
                            DiagCode.ARITHMETIC_OVERFLOW,
                            `Float ${op} overflow`,
                            span
                        );
                        return null;
                    }

                    return { value: result, type: 'float' };
                }

                const l = left.value as bigint;
                const r = right.value as bigint;

                if ((op === '/' || op === '%') && r === BigInt(0)) {
                    this.reportError(
                        DiagCode.DIVISION_BY_ZERO,
                        `${op === '/' ? 'Division' : 'Modulo'} by zero in compile-time expression`,
                        span
                    );
                    return null;
                }

                try {
                    let result: bigint;
                    switch (op) {
                        case '*': result = l * r; break;
                        case '/': result = l / r; break;
                        case '%': result = l % r; break;
                        default: return null;
                    }

                    if (result > this.MAX_INT_64 || result < this.MIN_INT_64) {
                        this.reportError(
                            DiagCode.ARITHMETIC_OVERFLOW,
                            `Integer ${op} overflow: ${l} ${op} ${r}`,
                            span
                        );
                        return null;
                    }

                    return { value: result, type: 'int' };
                } catch {
                    this.reportError(
                        DiagCode.ARITHMETIC_OVERFLOW,
                        `Integer ${op} overflow`,
                        span
                    );
                    return null;
                }
            }

            private evaluatePower(
                left: EvaluationResult,
                right: EvaluationResult,
                span: AST.Span
            ): EvaluationResult | null {
                if (left.type === 'float' || right.type === 'float') {
                    const l = this.toFloat(left);
                    const r = this.toFloat(right);
                    const result = Math.pow(l, r);

                    if (!isFinite(result)) {
                        this.reportError(
                            DiagCode.ARITHMETIC_OVERFLOW,
                            'Float power overflow',
                            span
                        );
                        return null;
                    }

                    return { value: result, type: 'float' };
                }

                const base = left.value as bigint;
                const exp = right.value as bigint;

                if (exp < BigInt(0)) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        'Negative exponent not allowed in compile-time integer expression',
                        span
                    );
                    return null;
                }

                if (exp > BigInt(10000)) {
                    this.reportError(
                        DiagCode.ARITHMETIC_OVERFLOW,
                        'Exponent too large for compile-time evaluation',
                        span
                    );
                    return null;
                }

                try {
                    const result = base ** exp;

                    if (result > this.MAX_INT_64 || result < this.MIN_INT_64) {
                        this.reportError(
                            DiagCode.ARITHMETIC_OVERFLOW,
                            `Integer power overflow: ${base} ** ${exp}`,
                            span
                        );
                        return null;
                    }

                    return { value: result, type: 'int' };
                } catch {
                    this.reportError(
                        DiagCode.ARITHMETIC_OVERFLOW,
                        'Integer power overflow',
                        span
                    );
                    return null;
                }
            }

            private evaluateShift(
                left: EvaluationResult,
                right: EvaluationResult,
                op: string,
                span: AST.Span
            ): EvaluationResult | null {
                if (left.type !== 'int' || right.type !== 'int') {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        'Shift operations require integer operands',
                        span
                    );
                    return null;
                }

                const value = left.value as bigint;
                const shift = right.value as bigint;

                if (shift < BigInt(0)) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        'Negative shift amount not allowed',
                        span
                    );
                    return null;
                }

                if (shift > BigInt(63)) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        'Shift amount too large (max 63 bits)',
                        span
                    );
                    return null;
                }

                const shiftNum = Number(shift);
                const result = op === '<<' ? value << BigInt(shiftNum) : value >> BigInt(shiftNum);

                return { value: result, type: 'int' };
            }

            private evaluateBitwise(
                left: EvaluationResult,
                right: EvaluationResult,
                op: 'BitwiseAnd' | 'BitwiseXor' | 'BitwiseOr',
                span: AST.Span
            ): EvaluationResult | null {
                if (left.type !== 'int' || right.type !== 'int') {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        'Bitwise operations require integer operands',
                        span
                    );
                    return null;
                }

                const l = left.value as bigint;
                const r = right.value as bigint;

                let result: bigint;
                switch (op) {
                    case 'BitwiseAnd': result = l & r; break;
                    case 'BitwiseXor': result = l ^ r; break;
                    case 'BitwiseOr': result = l | r; break;
                }

                return { value: result, type: 'int' };
            }

            private evaluateComparison(
                left: EvaluationResult,
                right: EvaluationResult,
                op: string,
                span: AST.Span
            ): EvaluationResult | null {
                if (left.type === 'null' || right.type === 'null') {
                    if (op === '==' || op === '!=') {
                        const result = (left.value === right.value) === (op === '==');
                        return { value: result, type: 'bool' };
                    }
                    return null;
                }

                if (left.type === 'float' || right.type === 'float') {
                    const l = this.toFloat(left);
                    const r = this.toFloat(right);
                    return { value: this.compare(l, r, op), type: 'bool' };
                }

                if (left.type === 'int' && right.type === 'int') {
                    const l = left.value as bigint;
                    const r = right.value as bigint;
                    return { value: this.compare(l, r, op), type: 'bool' };
                }

                if (left.type === 'bool' && right.type === 'bool') {
                    if (op === '==' || op === '!=') {
                        const result = (left.value === right.value) === (op === '==');
                        return { value: result, type: 'bool' };
                    }
                }

                return null;
            }

            private evaluateLogical(
                left: EvaluationResult,
                right: EvaluationResult,
                op: 'LogicalAnd' | 'LogicalOr',
                span: AST.Span
            ): EvaluationResult | null {
                if (left.type !== 'bool' || right.type !== 'bool') {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        'Logical operations require boolean operands',
                        span
                    );
                    return null;
                }

                const l = left.value as boolean;
                const r = right.value as boolean;

                const result = op === 'LogicalAnd' ? l && r : l || r;
                return { value: result, type: 'bool' };
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── PREFIX ──────────────────────────────┐

            private evaluatePrefix(prefix: AST.PrefixNode, ctx: EvaluationContext): EvaluationResult | null {
                const value = this.evaluateExpression(prefix.expr, ctx);
                if (!value) return null;

                switch (prefix.kind) {
                    case 'UnaryPlus':
                        if (value.type !== 'int' && value.type !== 'float') {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Unary '+' requires numeric operand, got '${value.type}'`,
                                prefix.span
                            );
                            return null;
                        }
                        return value;

                    case 'UnaryMinus':
                        if (value.type !== 'int' && value.type !== 'float') {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Unary '-' requires numeric operand, got '${value.type}'`,
                                prefix.span
                            );
                            return null;
                        }

                        if (value.type === 'int') {
                            const result = -(value.value as bigint);
                            if (result > this.MAX_INT_64 || result < this.MIN_INT_64) {
                                this.reportError(
                                    DiagCode.ARITHMETIC_OVERFLOW,
                                    'Integer negation overflow',
                                    prefix.span
                                );
                                return null;
                            }
                            return { value: result, type: 'int' };
                        }
                        if (value.type === 'float') {
                            return { value: -(value.value as number), type: 'float' };
                        }
                        return null;

                    case 'LogicalNot':
                        if (value.type !== 'bool') {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Logical not requires boolean operand, got '${value.type}'`,
                                prefix.span
                            );
                            return null;
                        }
                        return { value: !(value.value as boolean), type: 'bool' };

                    case 'BitwiseNot':
                        if (value.type !== 'int') {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Bitwise not requires integer operand, got '${value.type}'`,
                                prefix.span
                            );
                            return null;
                        }
                        return { value: ~(value.value as bigint), type: 'int' };

                    default:
                        return null;
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────── SPECIAL EXPRESSIONS ─────────────────────┐

            private evaluateAs(asNode: AST.AsNode, ctx: EvaluationContext): EvaluationResult | null {
                const value = this.evaluateExpression(asNode.base, ctx);
                if (!value) return null;

                const targetType = asNode.type;

                // Int to float
                if (value.type === 'int' && this.isFloatType(targetType)) {
                    return { value: Number(value.value), type: 'float' };
                }

                // Float to int (truncation)
                if (value.type === 'float' && this.isIntegerType(targetType)) {
                    const intValue = BigInt(Math.trunc(value.value as number));
                    if (intValue > this.MAX_INT_64 || intValue < this.MIN_INT_64) {
                        this.reportError(
                            DiagCode.ARITHMETIC_OVERFLOW,
                            'Float to integer conversion overflow',
                            asNode.span
                        );
                        return null;
                    }
                    return { value: intValue, type: 'int' };
                }

                return value;
            }

            private evaluateSizeof(sizeofNode: AST.SizeofNode, ctx: EvaluationContext): EvaluationResult | null {
                const type = sizeofNode.expr.getType()!;
                const size = this.computeTypeSize(type);
                return size !== null ? { value: BigInt(size), type: 'int' } : null;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────── COMPTIME FUNCTION CALLS ────────────────────┐

            private evaluateComptimeFunctionCall(call: AST.CallNode, ctx: EvaluationContext): EvaluationResult | null {
                const functionSymbol = this.findCallTargetSymbol(call.base);

                if (!functionSymbol) {
                    this.reportError(
                        DiagCode.UNDEFINED_IDENTIFIER,
                        'Function not found in compile-time call',
                        call.base.span
                    );
                    return null;
                }

                // Handle function pointer variables
                let targetSymbol = functionSymbol;

                if (functionSymbol.kind === SymbolKind.Variable) {
                    // Check if variable holds a reference to a comptime function
                    if (functionSymbol.metadata?.initializer) {
                        const initExpr = functionSymbol.metadata.initializer as AST.ExprNode;

                        // If initializer is an identifier, resolve it
                        if (initExpr.is('Primary')) {
                            const primary = initExpr.getPrimary();
                            if (primary?.is('Ident')) {
                                const targetIdent = primary.getIdent()!;
                                const resolvedSymbol = this.config.services.scopeManager.lookupSymbol(targetIdent.name);

                                if (resolvedSymbol) {
                                    // Check if the target is a comptime function
                                    if (resolvedSymbol.kind === SymbolKind.Function &&
                                        resolvedSymbol.metadata?.isComptimeFunction === true) {
                                        // Variable holds a comptime function - use it!
                                        targetSymbol = resolvedSymbol;
                                        this.log('verbose',
                                            `[Comptime] Resolved function pointer '${functionSymbol.name}' to comptime function '${resolvedSymbol.name}'`
                                        );
                                    } else {
                                        // Variable holds a non-comptime function - cannot evaluate at compile-time
                                        return null;
                                    }
                                } else {
                                    return null;
                                }
                            } else {
                                return null; // Complex initializer
                            }
                        } else {
                            return null; // Not a simple identifier
                        }
                    } else {
                        return null; // No initializer metadata
                    }
                }

                const isComptimeFunc = targetSymbol.metadata?.isComptimeFunction === true;

                if (!isComptimeFunc) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot call non-comptime function '${targetSymbol.name}' in compile-time context. Mark it with 'comptime' keyword.`,
                        call.base.span
                    );
                    return null;
                }

                // Create cache key including arguments
                const cacheKey = this.createComptimeCacheKey(targetSymbol, call.args, ctx);
                const cached = this.comptimeResultCache.get(cacheKey);

                if (cached) {
                    this.log('verbose',
                        `[Comptime] Using cached result for '${targetSymbol.name}': ${cached.value} (${cached.type})`
                    );
                    return cached;
                }

                // Validate argument count
                const expectedParams = targetSymbol.metadata?.comptimeParameters as AST.FieldNode[] | undefined;
                const expectedCount = expectedParams?.length || 0;

                // Allow fewer arguments if defaults are provided
                if (call.args.length > expectedCount) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Comptime function '${targetSymbol.name}' expects at most ${expectedCount} argument(s), but got ${call.args.length}`,
                        call.span
                    );
                    return null;
                }

                const body = targetSymbol.metadata?.comptimeFunctionBody as AST.StmtNode | undefined;

                if (!body) {
                    this.reportError(
                        DiagCode.INTERNAL_ERROR,
                        `Comptime function '${targetSymbol.name}' has no body stored`,
                        call.base.span
                    );
                    return null;
                }

                // Get the FUNCTION'S scope (where parameters live), not the parent scope
                // functionSymbol.scope is the MODULE scope, we need the child FUNCTION scope
                const parentScope = this.config.services.scopeManager.getScope(targetSymbol.scope);
                const functionScope = this.config.services.scopeManager.findChildScopeByNameFromId(
                    targetSymbol.name,
                    parentScope.id,
                    ScopeKind.Function
                );

                if (!functionScope) {
                    this.reportError(
                        DiagCode.INTERNAL_ERROR,
                        `Cannot find function scope for comptime function '${targetSymbol.name}'`,
                        call.base.span
                    );
                    return null;
                }

                this.log('verbose',
                    `[Comptime] Evaluating function '${targetSymbol.name}' with ${call.args.length} argument(s) in scope ${functionScope.id}`
                );

                // Evaluate call arguments FIRST (in caller's context)
                const evaluatedArgs: EvaluationResult[] = [];

                for (let i = 0; i < call.args.length; i++) {
                    const argValue = this.evaluateExpression(call.args[i], ctx);

                    if (!argValue) {
                        this.reportError(
                            DiagCode.ANALYSIS_ERROR,
                            `Could not evaluate argument ${i + 1} at compile time`,
                            call.args[i].span
                        );
                        return null;
                    }

                    evaluatedArgs.push(argValue);

                    this.log('verbose',
                        `[Comptime] Argument ${i + 1} evaluated to ${argValue.value} (${argValue.type})`
                    );
                }

                // Evaluate default values for missing arguments
                if (expectedParams) {
                    for (let i = call.args.length; i < expectedParams.length; i++) {
                        const param = expectedParams[i];

                        if (!param.initializer) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Comptime function '${targetSymbol.name}' requires ${expectedParams.length} argument(s), but got ${call.args.length}`,
                                call.span
                            );
                            return null;
                        }

                        // Evaluate default value in CALLER'S context
                        const defaultValue = this.evaluateExpression(param.initializer, ctx);

                        if (!defaultValue) {
                            this.reportError(
                                DiagCode.ANALYSIS_ERROR,
                                `Could not evaluate default value for parameter '${param.ident.name}' at compile time`,
                                param.initializer.span
                            );
                            return null;
                        }

                        evaluatedArgs.push(defaultValue);

                        this.log('verbose',
                            `[Comptime] Parameter ${i + 1} using default value ${defaultValue.value} (${defaultValue.type})`
                        );
                    }
                }

                const returnValue = this.extractReturnValueFromComptimeFunction(
                    body,
                    ctx,
                    functionScope,
                    evaluatedArgs
                );

                if (returnValue === null) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `Could not evaluate comptime function '${targetSymbol.name}' at compile time. Ensure it has a simple 'return <constant>' statement.`,
                        call.base.span
                    );
                    return null;
                }

                // Cache the result
                this.comptimeResultCache.set(cacheKey, returnValue);

                this.log('verbose',
                    `[Comptime] Function '${targetSymbol.name}' returned ${returnValue.value} (${returnValue.type})`
                );

                return returnValue;
            }

            private extractReturnValueFromComptimeFunction(
                body: AST.StmtNode | undefined,
                ctx: EvaluationContext,
                functionScope: Scope,
                args: EvaluationResult[] = []
            ): EvaluationResult | null {
                if (!body) {
                    return null;
                }

                const localVariables: LocalVariableMap = new Map();

                // STEP 1: Bind arguments to parameters
                // Get parameters from the function scope in declaration order
                const paramSymbols = Array.from(functionScope.symbols.values());
                    // .filter(s => s.kind === SymbolKind.Parameter)
                    // .sort((a, b) => a.contextSpan.start - b.contextSpan.start);

                this.log('verbose',
                    `[Comptime] Found ${paramSymbols.length} parameters in scope`
                );

                for (let i = 0; i < args.length && i < paramSymbols.length; i++) {
                    const paramName = paramSymbols[i].name;
                    localVariables.set(paramName, args[i]);

                    this.log('verbose',
                        `[Comptime] Bound parameter '${paramName}' = ${args[i].value} (${args[i].type})`
                    );
                }

                // Debug: Show what's in localVariables
                this.log('verbose',
                    `[Comptime] localVariables has ${localVariables.size} entries: ${Array.from(localVariables.keys()).join(', ')}`
                );

                const processStatement = (stmt: AST.StmtNode): EvaluationResult | null => {
                    if (stmt.kind === 'Let') {
                        const letNode = stmt.getLet();
                        if (letNode && letNode.field.initializer) {
                            const value = this.evaluateWithLocals(
                                letNode.field.initializer,
                                ctx,
                                functionScope,
                                localVariables
                            );

                            if (value) {
                                localVariables.set(letNode.field.ident.name, value);

                                this.log('verbose',
                                    `[Comptime] Stored local variable '${letNode.field.ident.name}' = ${value.value} (${value.type})`
                                );
                            }
                            return null;
                        }
                    }

                    if (stmt.kind === 'Return') {
                        const returnNode = stmt.getCtrlflow();
                        if (returnNode?.value) {
                            return this.evaluateWithLocals(
                                returnNode.value,
                                ctx,
                                functionScope,
                                localVariables
                            );
                        }
                    }

                    if (stmt.kind === 'Expression') {
                        const expr = stmt.getExpr();
                        if (expr) {
                            return this.evaluateWithLocals(
                                expr,
                                ctx,
                                functionScope,
                                localVariables
                            );
                        }
                    }

                    return null;
                };

                if (body.kind === 'Block') {
                    const blockNode = body.getBlock();
                    if (!blockNode || blockNode.stmts.length === 0) {
                        return null;
                    }

                    for (const stmt of blockNode.stmts) {
                        const result = processStatement(stmt);

                        if (result !== null) {
                            return result;
                        }
                    }
                } else {
                    return processStatement(body);
                }

                return null;
            }

            // Helper to get parameter names in declaration order
            private getParametersFromMetadata(functionScope: Scope): string[] {
                // Get parameters directly from the scope symbols
                // They're already in the correct order from collection phase
                const paramSymbols = Array.from(functionScope.symbols.values())
                    .filter(s => s.kind === SymbolKind.Parameter)
                    .sort((a, b) => a.contextSpan.start - b.contextSpan.start);

                return paramSymbols.map(s => s.name);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌────────────────────────── EVALUATE WITH LOCALS ──────────────────────┐

            private evaluateWithLocals(
                expr: AST.ExprNode,
                ctx: EvaluationContext,
                scope: Scope,
                locals: LocalVariableMap
            ): EvaluationResult | null {
                try {
                    switch (expr.kind) {
                        case 'Primary':
                            return this.evaluatePrimaryWithLocals(expr.getPrimary()!, ctx, scope, locals);

                        case 'Binary':
                            return this.evaluateBinaryWithLocals(expr.getBinary()!, ctx, scope, locals);

                        case 'Prefix':
                            return this.evaluatePrefixWithLocals(expr.getPrefix()!, ctx, scope, locals);

                        case 'Postfix': {
                            const postfix = expr.getPostfix();
                            if (postfix?.kind === 'Call') {
                                return this.evaluateComptimeFunctionCall(postfix.getCall()!, ctx);
                            }
                            return null;
                        }

                        case 'As':
                            return this.evaluateAsWithLocals(expr.getAs()!, ctx, scope, locals);

                        case 'Sizeof':
                            return this.evaluateSizeof(expr.getSizeof()!, ctx);

                        default:
                            return null;
                    }
                } catch (error) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `Error evaluating compile-time expression: ${error}`,
                        expr.span
                    );
                    return null;
                }
            }

            private evaluatePrimaryWithLocals(
                primary: AST.PrimaryNode,
                ctx: EvaluationContext,
                scope: Scope,
                locals: LocalVariableMap
            ): EvaluationResult | null {
                switch (primary.kind) {
                    case 'Literal':
                        return this.evaluateLiteral(primary.getLiteral()!, ctx);

                    case 'Ident':
                        return this.evaluateIdentifierWithLocals(primary.getIdent()!, ctx, scope, locals);

                    case 'Paren': {
                        const paren = primary.getParen()!;
                        return paren.source ? this.evaluateWithLocals(paren.source, ctx, scope, locals) : null;
                    }

                    default:
                        return null;
                }
            }

            private evaluateIdentifierWithLocals(
                ident: AST.IdentNode,
                ctx: EvaluationContext,
                scope: Scope,
                locals: LocalVariableMap
            ): EvaluationResult | null {
                const localValue = locals.get(ident.name);
                if (localValue) {
                    this.log('verbose',
                        `[Comptime] Found local variable '${ident.name}' = ${localValue.value} (${localValue.type})`
                    );
                    return localValue;
                }

                this.log('verbose',
                    `[Comptime] Variable '${ident.name}' not in locals, checking scope...`
                );

                const scopeSymbol = scope.symbols.get(ident.name);
                if (scopeSymbol) {
                    if (scopeSymbol.metadata && typeof scopeSymbol.metadata === 'object') {
                        const metadata = scopeSymbol.metadata as any;
                        if (metadata.initializer) {
                            return this.evaluateWithLocals(metadata.initializer, ctx, scope, locals);
                        }
                    }
                }

                return this.evaluateIdentifier(ident, ctx);
            }

            private evaluateBinaryWithLocals(
                binary: AST.BinaryNode,
                ctx: EvaluationContext,
                scope: Scope,
                locals: LocalVariableMap
            ): EvaluationResult | null {
                const left = this.evaluateWithLocals(binary.left, ctx, scope, locals);
                const right = this.evaluateWithLocals(binary.right, ctx, scope, locals);

                if (!left || !right) return null;

                if (!this.areTypesCompatible(left.type, right.type, binary.kind)) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot perform ${binary.kind} operation on incompatible types '${left.type}' and '${right.type}'`,
                        binary.span
                    );
                    return null;
                }

                switch (binary.kind) {
                    case 'Additive':
                        return this.evaluateAdditive(left, right, binary.operator, binary.span);
                    case 'Multiplicative':
                        return this.evaluateMultiplicative(left, right, binary.operator, binary.span);
                    case 'Power':
                        return this.evaluatePower(left, right, binary.span);
                    case 'Shift':
                        return this.evaluateShift(left, right, binary.operator, binary.span);
                    case 'BitwiseAnd':
                    case 'BitwiseXor':
                    case 'BitwiseOr':
                        return this.evaluateBitwise(left, right, binary.kind, binary.span);
                    case 'Relational':
                    case 'Equality':
                        return this.evaluateComparison(left, right, binary.operator, binary.span);
                    case 'LogicalAnd':
                    case 'LogicalOr':
                        return this.evaluateLogical(left, right, binary.kind, binary.span);
                    default:
                        return null;
                }
            }

            private evaluatePrefixWithLocals(
                prefix: AST.PrefixNode,
                ctx: EvaluationContext,
                scope: Scope,
                locals: LocalVariableMap
            ): EvaluationResult | null {
                const value = this.evaluateWithLocals(prefix.expr, ctx, scope, locals);
                if (!value) return null;

                switch (prefix.kind) {
                    case 'UnaryPlus':
                        if (value.type !== 'int' && value.type !== 'float') {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Unary '+' requires numeric operand, got '${value.type}'`,
                                prefix.span
                            );
                            return null;
                        }
                        return value;

                    case 'UnaryMinus':
                        if (value.type !== 'int' && value.type !== 'float') {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Unary '-' requires numeric operand, got '${value.type}'`,
                                prefix.span
                            );
                            return null;
                        }

                        if (value.type === 'int') {
                            const result = -(value.value as bigint);
                            if (result > this.MAX_INT_64 || result < this.MIN_INT_64) {
                                this.reportError(
                                    DiagCode.ARITHMETIC_OVERFLOW,
                                    'Integer negation overflow',
                                    prefix.span
                                );
                                return null;
                            }
                            return { value: result, type: 'int' };
                        }
                        if (value.type === 'float') {
                            return { value: -(value.value as number), type: 'float' };
                        }
                        return null;

                    case 'LogicalNot':
                        if (value.type !== 'bool') {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Logical not requires boolean operand, got '${value.type}'`,
                                prefix.span
                            );
                            return null;
                        }
                        return { value: !(value.value as boolean), type: 'bool' };

                    case 'BitwiseNot':
                        if (value.type !== 'int') {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Bitwise not requires integer operand, got '${value.type}'`,
                                prefix.span
                            );
                            return null;
                        }
                        return { value: ~(value.value as bigint), type: 'int' };

                    default:
                        return null;
                }
            }

            private evaluateAsWithLocals(
                asNode: AST.AsNode,
                ctx: EvaluationContext,
                scope: Scope,
                locals: LocalVariableMap
            ): EvaluationResult | null {
                const value = this.evaluateWithLocals(asNode.base, ctx, scope, locals);
                if (!value) return null;

                const targetType = asNode.type;

                if (value.type === 'int' && this.isFloatType(targetType)) {
                    return { value: Number(value.value), type: 'float' };
                }

                if (value.type === 'float' && this.isIntegerType(targetType)) {
                    const intValue = BigInt(Math.trunc(value.value as number));
                    if (intValue > this.MAX_INT_64 || intValue < this.MIN_INT_64) {
                        this.reportError(
                            DiagCode.ARITHMETIC_OVERFLOW,
                            'Float to integer conversion overflow',
                            asNode.span
                        );
                        return null;
                    }
                    return { value: intValue, type: 'int' };
                }

                return value;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── HELP ────────────────────────────────┐

            private createComptimeCacheKey(
                functionSymbol: Symbol,
                args: AST.ExprNode[],
                ctx: EvaluationContext
            ): string {
                // Base key
                let key = `${functionSymbol.name}:${functionSymbol.id}`;

                // Add argument values to key
                for (let i = 0; i < args.length; i++) {
                    const argValue = this.evaluateExpression(args[i], ctx);
                    if (argValue) {
                        key += `:${argValue.type}:${argValue.value}`;
                    } else {
                        key += `:unknown`;
                    }
                }

                return key;
            }

            private findCallTargetSymbol(baseExpr: AST.ExprNode): Symbol | null {
                if (baseExpr.is('Primary')) {
                    const primary = baseExpr.getPrimary();

                    if (primary?.is('Ident')) {
                        const ident = primary.getIdent();
                        if (ident && !ident.builtin) {
                            return this.config.services.scopeManager.lookupSymbol(ident.name);
                        }
                    }
                }

                return null;
            }

            private areTypesCompatible(t1: string, t2: string, op: string): boolean {
                if (t1 === t2) {
                    if (t1 === 'bool') {
                        return op === 'LogicalAnd' ||
                            op === 'LogicalOr' ||
                            op === 'Equality' ||
                            op === 'Relational';
                    }
                    if (t1 === 'null') {
                        return op === 'Equality' || op === 'Relational';
                    }
                    return true;
                }

                if ((t1 === 'int' || t1 === 'float') && (t2 === 'int' || t2 === 'float')) {
                    if (op === 'BitwiseAnd' || op === 'BitwiseXor' || op === 'BitwiseOr' || op === 'Shift') {
                        return t1 === 'int' && t2 === 'int';
                    }
                    return true;
                }

                if (t1 === 'bool' || t2 === 'bool') {
                    return false;
                }

                if (t1 === 'null' || t2 === 'null') {
                    return op === 'Equality';
                }

                return false;
            }

            private toFloat(result: EvaluationResult): number {
                if (result.type === 'float') return result.value as number;
                if (result.type === 'int') return Number(result.value);
                return 0;
            }

            private compare(l: any, r: any, op: string): boolean {
                switch (op) {
                    case '==': return l === r;
                    case '!=': return l !== r;
                    case '<': return l < r;
                    case '<=': return l <= r;
                    case '>': return l > r;
                    case '>=': return l >= r;
                    default: return false;
                }
            }

            private isFloatType(type: AST.TypeNode): boolean {
                return type.isFloat() || type.isComptimeFloat();
            }

            private isIntegerType(type: AST.TypeNode): boolean {
                return type.isSigned() || type.isUnsigned() || type.isComptimeInt();
            }

            private isFloatTargetType(type: AST.TypeNode): boolean {
                const unwrapped = this.unwrapType(type);
                return unwrapped.isFloat() || unwrapped.isComptimeFloat();
            }

            private isIntegerTargetType(type: AST.TypeNode): boolean {
                const unwrapped = this.unwrapType(type);
                return unwrapped.isSigned() || unwrapped.isUnsigned() || unwrapped.isComptimeInt();
            }

            private unwrapType(type: AST.TypeNode): AST.TypeNode {
                let unwrapped = type;

                while (unwrapped.isOptional()) {
                    unwrapped = unwrapped.getOptional()!.target;
                }

                if (unwrapped.isIdent()) {
                    const ident = unwrapped.getIdent()!;
                    if (!ident.builtin) {
                        const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                        if (symbol && symbol.type) {
                            return this.unwrapType(symbol.type);
                        }
                    }
                }

                return unwrapped;
            }

            private getFloatBounds(type: AST.TypeNode): { min: number; max: number } {
                const unwrapped = this.unwrapType(type);

                if (unwrapped.isFloat()) {
                    const width = unwrapped.getWidth();
                    switch (width) {
                        case 16: return { min: -65504, max: 65504 };
                        case 32: return { min: -3.4028235e38, max: 3.4028235e38 };
                        case 64: return { min: -1.7976931348623157e308, max: 1.7976931348623157e308 };
                        case 128: return { min: -Number.MAX_VALUE, max: Number.MAX_VALUE };
                        default: return { min: -Number.MAX_VALUE, max: Number.MAX_VALUE };
                    }
                }

                return { min: -Number.MAX_VALUE, max: Number.MAX_VALUE };
            }

            private getTypeBounds(type?: AST.TypeNode): { min: bigint; max: bigint } {
                if (!type) {
                    return { min: this.MIN_INT_64, max: this.MAX_INT_64 };
                }

                const unwrapped = this.unwrapType(type);

                if (unwrapped.isSigned()) {
                    const width = unwrapped.getWidth() || 64;
                    const max = BigInt(2) ** BigInt(width - 1) - BigInt(1);
                    const min = -(BigInt(2) ** BigInt(width - 1));
                    return { min, max };
                }

                if (unwrapped.isUnsigned()) {
                    const width = unwrapped.getWidth() || 64;
                    const max = BigInt(2) ** BigInt(width) - BigInt(1);
                    return { min: BigInt(0), max };
                }

                if (unwrapped.isComptimeInt()) {
                    return { min: this.MIN_INT_64, max: this.MAX_INT_64 };
                }

                return { min: this.MIN_INT_64, max: this.MAX_INT_64 };
            }

            computeTypeSize(type: AST.TypeNode): number | null {
                switch (type.kind) {
                    case 'primitive': {
                        const prim = type.getPrimitive()!;

                        if (prim.width !== undefined) {
                            return prim.width;
                        }

                        switch (prim.kind) {
                            case 'bool': return 1;
                            case 'void': return 0;
                            default: return null;
                        }
                    }

                    case 'pointer':
                        return 64;

                    case 'optional': {
                        const inner = type.getOptional()!.target;
                        const innerSize = this.computeTypeSize(inner);
                        return innerSize !== null ? innerSize + 1 : null;
                    }

                    case 'array': {
                        const arr = type.getArray()!;
                        const elemSize = this.computeTypeSize(arr.target);
                        if (elemSize === null) return null;

                        if (arr.size) {
                            const sizeValue = this.extractIntegerValue(arr.size);
                            if (sizeValue !== undefined) {
                                return elemSize * sizeValue;
                            }
                        }
                        return null;
                    }

                    case 'tuple': {
                        const tuple = type.getTuple()!;
                        let totalSize = 0;

                        for (const field of tuple.fields) {
                            const fieldSize = this.computeTypeSize(field);
                            if (fieldSize === null) return null;
                            totalSize += fieldSize;
                        }

                        return totalSize;
                    }

                    case 'struct': {
                        const struct = type.getStruct()!;
                        let totalSize = 0;

                        for (const member of struct.members) {
                            if (member.isField()) {
                                const field = member.getField()!;
                                if (field.type) {
                                    const fieldSize = this.computeTypeSize(field.type);
                                    if (fieldSize === null) return null;
                                    totalSize += fieldSize;
                                }
                            }
                        }

                        return totalSize;
                    }

                    default:
                        return null;
                }
            }

            extractIntegerValue(expr: AST.ExprNode): number | undefined {
                const comptimeValue = this.evaluateComptimeExpression(expr);

                if (comptimeValue === null) return undefined;

                if (comptimeValue > BigInt(Number.MAX_SAFE_INTEGER) ||
                    comptimeValue < BigInt(Number.MIN_SAFE_INTEGER)) {
                    return undefined;
                }

                return Number(comptimeValue);
            }

            private reportError(code: DiagCode, message: string, span?: AST.Span): void {
                this.config.services.diagnosticManager.reportError(code, message, span);
            }

            private reportWarning(code: DiagCode, message: string, span?: AST.Span): void {
                this.config.services.diagnosticManager.reportWarning(code, message, span);
            }

            private reportInfo(code: DiagCode, message: string, span?: AST.Span): void {
                this.config.services.diagnosticManager.reportInfo(code, message, span);
            }

            private log(kind: DebugKind, msg: string) {
                this.config.services.debugManager?.log(kind, msg);
            }

        // └──────────────────────────────────────────────────────────────────────┘
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝