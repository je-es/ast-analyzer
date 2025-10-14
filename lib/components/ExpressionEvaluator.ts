// ExpressionEvaluator.ts — Compile-time expression evaluation.
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST                 from '@je-es/ast';
    import { DiagCode }             from './DiagnosticManager';
    import { AnalysisConfig }       from '../ast-analyzer';
    import { Scope, Symbol, SymbolKind, ScopeKind } from './ScopeManager';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    type ComptimeValue = bigint | number | boolean | null;

    interface EvaluationResult {
        value: ComptimeValue;
        type: 'int' | 'float' | 'bool' | 'null';
    }

    interface EvaluationContext {
        allowFloats: boolean;
        maxIntValue: bigint;
        minIntValue: bigint;
        targetType?: AST.TypeNode;  // For size-aware validation
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class ExpressionEvaluator {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            private readonly MAX_INT_64 = BigInt('9223372036854775807'); // i64::MAX
            private readonly MIN_INT_64 = BigInt('-9223372036854775808'); // i64::MIN

            constructor(public config: AnalysisConfig) {}

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            evaluateComptimeExpression(expr: AST.ExprNode, targetType?: AST.TypeNode): bigint | null {
                const bounds = this.getTypeBounds(targetType);

                const result = this.evaluateExpression(expr, {
                    allowFloats: false,
                    maxIntValue: BigInt('9223372036854775807'), // Use max range during evaluation
                    minIntValue: BigInt('-9223372036854775808'),
                    targetType
                });

                if (!result) return null;

                if (result.type !== 'int') {
                    return null;
                }

                const value = result.value as bigint;

                // Check bounds AFTER evaluation, using the target type bounds
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

            private getTypeBounds(type?: AST.TypeNode): { min: bigint; max: bigint } {
                if (!type) {
                    return { min: this.MIN_INT_64, max: this.MAX_INT_64 };
                }

                // Signed integers
                if (type.isSigned()) {
                    const width = type.getWidth() || 64;
                    const max = BigInt(2) ** BigInt(width - 1) - BigInt(1);
                    const min = -(BigInt(2) ** BigInt(width - 1));
                    return { min, max };
                }

                // Unsigned integers
                if (type.isUnsigned()) {
                    const width = type.getWidth() || 64;
                    const max = BigInt(2) ** BigInt(width) - BigInt(1);
                    return { min: BigInt(0), max };
                }

                // Comptime integers - use full range
                if (type.isComptimeInt()) {
                    return { min: this.MIN_INT_64, max: this.MAX_INT_64 };
                }

                // Default to i64 range
                return { min: this.MIN_INT_64, max: this.MAX_INT_64 };
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


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

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

                            // // Check overflow
                            // if (value > ctx.maxIntValue || value < ctx.minIntValue) {
                            //     this.reportError(
                            //         DiagCode.ARITHMETIC_OVERFLOW,
                            //         `Integer literal ${value} exceeds valid range [${ctx.minIntValue}, ${ctx.maxIntValue}]`,
                            //         literal.span
                            //     );
                            //     return null;
                            // }

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

                    case 'Bool':
                        return { value: literal.value as boolean, type: 'bool' };

                    case 'Null':
                        return { value: null, type: 'null' };

                    default:
                        return null;
                }
            }

            private evaluateIdentifier(ident: AST.IdentNode, ctx: EvaluationContext): EvaluationResult | null {
                // Only evaluate immutable const-like symbols
                const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                if (!symbol) return null;

                // Must be immutable definition or variable
                if (symbol.kind !== SymbolKind.Definition && symbol.kind !== SymbolKind.Variable) {
                    return null;
                }

                if (symbol.mutability.kind !== 'Immutable') {
                    return null;
                }

                // Get initializer from metadata
                if (symbol.metadata && typeof symbol.metadata === 'object') {
                    const metadata = symbol.metadata as any;
                    if (metadata.initializer) {
                        return this.evaluateExpression(metadata.initializer, ctx);
                    }
                }

                return null;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private evaluateBinary(binary: AST.BinaryNode, ctx: EvaluationContext): EvaluationResult | null {
                const left = this.evaluateExpression(binary.left, ctx);
                const right = this.evaluateExpression(binary.right, ctx);

                if (!left || !right) return null;

                // Type compatibility check
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
                // CRITICAL: Reject boolean operands immediately
                if (left.type === 'bool' || right.type === 'bool') {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot perform ${op === '+' ? 'addition' : 'subtraction'} on boolean type`,
                        span
                    );
                    return null;
                }

                // Handle float operations
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

                // Integer operations
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
                // CRITICAL: Reject boolean operands immediately
                if (left.type === 'bool' || right.type === 'bool') {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot perform ${op === '+' ? 'addition' : 'subtraction'} on boolean type`,
                        span
                    );
                    return null;
                }

                // Handle float operations
                if (left.type === 'float' || right.type === 'float') {
                    const l = this.toFloat(left);
                    const r = this.toFloat(right);

                    if (op === '/' && r === 0) {
                        this.reportError(
                            DiagCode.DIVISION_BY_ZERO,
                            'Division by zero in compile-time expression',
                            span
                        );
                        return null;
                    }

                    if (op === '%' && r === 0) {
                        this.reportError(
                            DiagCode.DIVISION_BY_ZERO,
                            'Modulo by zero in compile-time expression',
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

                // Integer operations
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
                // Handle float operations
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

                // Integer operations
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
                // Handle nulls
                if (left.type === 'null' || right.type === 'null') {
                    if (op === '==' || op === '!=') {
                        const result = (left.value === right.value) === (op === '==');
                        return { value: result, type: 'bool' };
                    }
                    return null;
                }

                // Convert to common type
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


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private evaluatePrefix(prefix: AST.PrefixNode, ctx: EvaluationContext): EvaluationResult | null {
                const value = this.evaluateExpression(prefix.expr, ctx);
                if (!value) return null;

                switch (prefix.kind) {
                    case 'UnaryPlus':
                        // Check for numeric type
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
                        // Check for numeric type
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


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private evaluateAs(asNode: AST.AsNode, ctx: EvaluationContext): EvaluationResult | null {
                const value = this.evaluateExpression(asNode.base, ctx);
                if (!value) return null;

                // Type conversion based on target type
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

                // Same type conversion
                return value;
            }

            private evaluateSizeof(sizeofNode: AST.SizeofNode, ctx: EvaluationContext): EvaluationResult | null {
                const type = sizeofNode.expr.getType()!;
                return { value: this.computeTypeSize(type), type: 'int' };
            }

            computeTypeSize(type: AST.TypeNode): number | null {

                switch (type.kind) {
                    case 'primitive': {
                        const prim = type.getPrimitive()!;

                        // Handle sized primitives
                        if (prim.width !== undefined) {
                            return prim.width;
                        }

                        // Handle standard primitives
                        switch (prim.kind) {
                            case 'bool': return 1;
                            case 'void': return 0;
                            default:
                                return null;
                        }
                    }

                    case 'pointer':
                        return 64; // Assume 64-bit pointers

                    case 'optional':
                        // Optional adds 1 bit for the tag + size of inner type
                        const inner = type.getOptional()!.target;
                        const innerSize = this.computeTypeSize(inner);
                        return innerSize !== null ? innerSize + 1 : null;

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
                        return null; // Dynamic size
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
                        return null; // Size cannot be determined
                }
            }

            extractIntegerValue(expr: AST.ExprNode): number | undefined {
                const comptimeValue = this.evaluateComptimeExpression(expr);

                if (comptimeValue === null) return undefined;

                // Convert BigInt to number if within safe range
                if (comptimeValue > BigInt(Number.MAX_SAFE_INTEGER) ||
                    comptimeValue < BigInt(Number.MIN_SAFE_INTEGER)) {
                    return undefined;
                }

                return Number(comptimeValue);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private areTypesCompatible(t1: string, t2: string, op: string): boolean {
                // Same types - but check if operation is valid for that type
                if (t1 === t2) {
                    // Bool is only compatible with bool for logical/comparison operations
                    if (t1 === 'bool') {
                        return op === 'LogicalAnd' ||
                            op === 'LogicalOr' ||
                            op === 'Equality' ||
                            op === 'Relational';
                    }
                    // Null only for equality
                    if (t1 === 'null') {
                        return op === 'Equality' || op === 'Relational';
                    }
                    return true;
                }

                // Numeric types can mix (int + float = float)
                if ((t1 === 'int' || t1 === 'float') && (t2 === 'int' || t2 === 'float')) {
                    // But NOT for bitwise or shift operations
                    if (op === 'BitwiseAnd' || op === 'BitwiseXor' || op === 'BitwiseOr' || op === 'Shift') {
                        return t1 === 'int' && t2 === 'int';
                    }
                    return true;
                }

                // Bool with anything else is incompatible
                if (t1 === 'bool' || t2 === 'bool') {
                    return false;
                }

                // Null can only compare with null
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

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            private reportError(code: DiagCode, message: string, span?: AST.Span): void {
                this.config.services.diagnosticManager.reportError(code, message, span);
            }

            private reportWarning(code: DiagCode, message: string, span?: AST.Span): void {
                this.config.services.diagnosticManager.reportWarning(code, message, span);
            }

            private reportInfo(code: DiagCode, message: string, span?: AST.Span): void {
                this.config.services.diagnosticManager.reportInfo(code, message, span);
            }

        // └──────────────────────────────────────────────────────────────────────┘
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝