// TypeInference.ts — Type inference and compatibility checking.
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST                 from '@je-es/ast';
    import { DiagCode }             from '../../components/DiagnosticManager';
    import { AnalysisConfig }       from '../../ast-analyzer';
    import { Scope, Symbol, SymbolKind, ScopeKind }
                                    from '../../components/ScopeManager';
    import { DebugKind }            from '../../components/DebugManager';
    import { TypeValidator }        from './TypeValidator';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗


// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class TypeInference {

        // ┌──────────────────────────────── INIT ────────────────────────────────┐

            inferenceStack : Set<string> = new Set();
            readonly CACHE_MAX_SIZE     = 10000;

            constructor(public config: AnalysisConfig, private typeValidator: TypeValidator) {}

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ────────────────────────────────┐

            inferExpressionType(expr: AST.ExprNode): AST.TypeNode | null {
                if (!expr) return null;

                const cacheKey = this.createCacheKey(expr);

                if (this.inferenceStack.has(cacheKey)) {
                    this.log('verbose', `Circular type inference detected for ${cacheKey}`);
                    return null;
                }

                this.inferenceStack.add(cacheKey);
                try {
                    const inferredType = this.performTypeInference(expr);
                    if (inferredType) {
                        this.cacheType(cacheKey, inferredType);
                        this.typeValidator.stats.typesInferred++;
                    }
                    return inferredType;
                } finally {
                    this.inferenceStack.delete(cacheKey);
                }
            }

            inferExpressionTypeWithContext(expr: AST.ExprNode, expectedType?: AST.TypeNode): AST.TypeNode | null {
                if (expectedType && expr.is('Primary')) {
                    const primary = expr.getPrimary();
                    if (primary && primary.is('Object')) {
                        const obj = primary.getObject()!;

                        if (!obj.ident) {
                            const resolvedExpected = this.resolveIdentifierType(expectedType);

                            if (resolvedExpected.isStruct()) {
                                this.typeValidator.validateStructConstruction(obj, resolvedExpected, expr.span);
                                return expectedType;
                            }
                        }
                    }
                }

                return this.inferExpressionType(expr);
            }

            performTypeInference(expr: AST.ExprNode): AST.TypeNode | null {
                this.config.services.contextTracker.pushContextSpan(expr.span);
                try {
                    switch (expr.kind) {
                        case 'Primary':
                            return this.inferPrimaryType(expr.getPrimary()!);
                        case 'Binary':
                            return this.inferBinaryType(expr.getBinary()!);
                        case 'Prefix':
                            return this.inferPrefixType(expr.getPrefix()!);
                        case 'Postfix':
                            return this.inferPostfixType(expr.getPostfix()!);
                        case 'As':
                            return this.inferAsType(expr.getAs()!);
                        case 'Typeof': {
                            const typeofNode = expr.getTypeof()!;
                            const innerType = this.inferExpressionType(typeofNode.expr);

                            if (!innerType) {
                                this.reportError(
                                    DiagCode.TYPE_INFERENCE_FAILED,
                                    'Cannot infer type for typeof expression',
                                    typeofNode.expr.span
                                );
                                return null;
                            }

                            // Return the 'type' primitive, NOT the actual type
                            // This makes typeof return a TYPE (not usable in arithmetic)
                            return AST.TypeNode.asPrimitive(expr.span, 'type');
                        }

                        case 'Sizeof': {
                            const sizeofNode = expr.getSizeof()!;
                            const targetType = this.inferExpressionType(sizeofNode.expr);

                            if (!targetType) {
                                this.reportError(
                                    DiagCode.TYPE_INFERENCE_FAILED,
                                    'Cannot infer type for sizeof expression',
                                    sizeofNode.expr.span
                                );
                                return null;
                            }

                            // Compute size at compile time
                            const size = this.computeTypeSize(targetType);

                            if (size === null) {
                                this.reportError(
                                    DiagCode.INVALID_SIZEOF_TARGET,
                                    `Cannot compute size of type '${this.getTypeDisplayName(targetType)}'`,
                                    sizeofNode.expr.span
                                );
                                return AST.TypeNode.asComptimeInt(expr.span, '0');
                            }

                            // Return as compile-time integer
                            return AST.TypeNode.asComptimeInt(expr.span, size.toString());
                        }
                        case 'Orelse':
                            return this.inferOrelseType(expr.getOrelse()!);
                        case 'Range':
                            return this.inferRangeType(expr.getRange()!);
                        case 'Try':
                            return this.inferTryType(expr.getTry()!);
                        case 'Catch':
                            return this.inferCatchType(expr.getCatch()!);
                        case 'If':
                            return this.inferIfType(expr.getIf()!);
                        case 'Match':
                            return this.inferSwitchType(expr.getMatch()!);
                        default:
                            return null;
                    }
                } finally {
                    this.config.services.contextTracker.popContextSpan();
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── PRIMARY ─────────────────────────────┐

            inferPrimaryType(primary: AST.PrimaryNode): AST.TypeNode | null {
                switch (primary.kind) {
                    case 'Literal':
                        return this.inferLiteralType(primary.getLiteral()!);
                    case 'Ident':
                        return this.inferIdentifierType(primary.getIdent()!);
                    case 'Paren':
                        const paren = primary.getParen()!;
                        return paren.source ? this.inferExpressionType(paren.source) : null;
                    case 'Tuple':
                        return this.inferTupleType(primary.getTuple()!);
                    case 'Object':
                        return this.inferObjectType(primary.getObject()!);
                    case 'Type':
                        return primary.getType();
                    default:
                        return null;
                }
            }

            inferLiteralType(literal: AST.LiteralNode): AST.TypeNode {
                switch (literal.kind) {
                    case 'String':
                        const str = literal.value as string;
                        const sizeExpr = AST.ExprNode.asInteger(literal.span, str.length);
                        return AST.TypeNode.asArray(literal.span, AST.TypeNode.asUnsigned(literal.span, 'u8', 8), sizeExpr);

                    case 'Integer':
                        return AST.TypeNode.asComptimeInt(literal.span, literal.value as string);

                    case 'Float':
                        return AST.TypeNode.asComptimeFloat(literal.span, literal.value as string);

                    case 'Character': {
                        const charValue = literal.value as string;

                        // Empty character literal - check context
                        if (charValue.length === 0) {
                            // Try to get expected type from context
                            const expectedType = this.typeValidator.currentFunctionReturnType ||
                                            this.getExpectedTypeFromContext();

                            if (expectedType) {
                                // Resolve identifier types to actual types
                                const resolvedType = this.resolveIdentifierType(expectedType);

                                // Check if context expects cpoint(u21)
                                if (resolvedType.isUnsigned() && resolvedType.getWidth() === 21) {
                                    return AST.TypeNode.asUnsigned(literal.span, 'u21', 21);
                                }
                                // Check if context expects char(u8)
                                if (resolvedType.isUnsigned() && resolvedType.getWidth() === 8) {
                                    return AST.TypeNode.asUnsigned(literal.span, 'u8', 8);
                                }
                            }

                            // Default to char(u8) for empty literals
                            return AST.TypeNode.asUnsigned(literal.span, 'u8', 8);
                        }

                        // Get Unicode code point
                        const codePoint = charValue.codePointAt(0) || 0;

                        // Non-ASCII (> 127) = cpoint(u21)
                        if (codePoint > 127) {
                            return AST.TypeNode.asUnsigned(literal.span, 'u21', 21);
                        }

                        // ASCII (≤ 127) = char(u8)
                        return AST.TypeNode.asUnsigned(literal.span, 'u8', 8);
                    }

                    case 'Bool':
                        return AST.TypeNode.asBool(literal.span);

                    case 'Null':
                        return AST.TypeNode.asNull(literal.span);

                    case 'Undefined':
                        return AST.TypeNode.asUndefined(literal.span);

                    case 'Array':
                        return this.inferArrayLiteralType(literal);

                    default:
                        return AST.TypeNode.asUndefined(literal.span);
                }
            }

            inferIdentifierType(ident: AST.IdentNode): AST.TypeNode | null {
                // Handle 'self' - distinguish static vs instance context
                if (ident.name === 'self') {
                    // // In static methods, using 'self' alone is an error
                    // if (this.typeValidator.currentIsStaticMethod && this.typeValidator.currentStructScope) {
                    //     this.reportError(
                    //         DiagCode.INVALID_STATIC_ACCESS,
                    //         `Cannot use 'self' in static method. Use '${this.typeValidator.currentStructScope.name}' to access static members.`,
                    //         ident.span
                    //     );
                    //     return null;
                    // }

                    // In instance methods, 'self' refers to the instance
                    const selfSymbol = this.config.services.scopeManager.lookupSymbol('self');
                    if (selfSymbol && selfSymbol.metadata?.isSelf) {
                        selfSymbol.used = true; // Mark as used to prevent false warning
                        return selfSymbol.type;
                    }
                }

                // SECOND: Check direct field access in static method (without self)
                if (this.typeValidator.currentIsStaticMethod && this.typeValidator.currentStructScope) {
                    const fieldSymbol = this.typeValidator.currentStructScope.symbols.get(ident.name);

                    if (fieldSymbol) {
                        // Check if it's a struct field OR method
                        if (fieldSymbol.kind === SymbolKind.StructField ||
                            fieldSymbol.kind === SymbolKind.Function) {

                            const isStatic = fieldSymbol.visibility.kind === 'Static';

                            if (!isStatic) {
                                const memberType = fieldSymbol.kind === SymbolKind.Function ? 'method' : 'field';
                                this.reportError(
                                    DiagCode.INVALID_STATIC_ACCESS,
                                    `Cannot access instance ${memberType} '${ident.name}' in static method. Static methods can only access static ${memberType}s.`,
                                    ident.span
                                );
                                return null;  // Stop processing and don't mark as used/resolved
                            }

                            // Valid static member - mark as used and continue
                            fieldSymbol.used = true;
                        }
                    }
                }

                const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                if (!symbol) return null;

                // Handle regular 'self' in instance methods
                if (ident.name === 'self' && symbol.metadata?.isSelf) {
                    symbol.used = true;
                    return symbol.type;
                }

                // If this is a type definition (like slice, char, cpoint), return 'type' primitive
                if (symbol.kind === SymbolKind.Definition && symbol.type?.isType()) {
                    return AST.TypeNode.asPrimitive(ident.span, 'type');
                }

                if (symbol.type) return symbol.type;

                if (symbol.kind === SymbolKind.Function && symbol.metadata) {
                    const metadata = symbol.metadata as any;

                    const paramTypes: AST.TypeNode[] = [];
                    if (metadata.params && Array.isArray(metadata.params)) {
                        for (const param of metadata.params) {
                            if (param.type) {
                                paramTypes.push(param.type);
                            }
                        }
                    }

                    const returnType = metadata.returnType || null;

                    const funcType = AST.TypeNode.asFunction(
                        symbol.contextSpan || ident.span,
                        paramTypes,
                        returnType
                    );

                    symbol.type = funcType;
                    return funcType;
                }

                return null;
            }

            inferArrayLiteralType(literal: AST.LiteralNode): AST.TypeNode {
                const elements = literal.value as AST.ExprNode[];

                if (elements.length === 0) {
                    const sizeExpr = AST.ExprNode.asInteger(literal.span, 0);
                    return AST.TypeNode.asArray(literal.span, AST.TypeNode.asUndefined(literal.span), sizeExpr);
                }

                const firstType = this.inferExpressionType(elements[0]);
                if (!firstType) {
                    const sizeExpr = AST.ExprNode.asInteger(literal.span, elements.length);
                    return AST.TypeNode.asArray(literal.span, AST.TypeNode.asUndefined(literal.span), sizeExpr);
                }

                // Validate subsequent elements against first element's type
                for (let i = 1; i < elements.length; i++) {
                    // Unified validation for array elements
                    if (!this.typeValidator.validateTypeAssignment(elements[i], firstType, `Array element ${i}`)) {
                        // Error already reported, but continue checking other elements
                    }

                    const elemType = this.inferExpressionType(elements[i]);
                    if (!elemType || !this.isTypeCompatible(firstType, elemType)) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            'Array elements have incompatible types',
                            elements[i].span
                        );
                    }
                }

                const sizeExpr = AST.ExprNode.asInteger(literal.span, elements.length);
                return AST.TypeNode.asArray(literal.span, firstType, sizeExpr);
            }

            inferObjectType(obj: AST.ObjectNode): AST.TypeNode | null {
                // CASE 1: Named constructor (MyStruct { ... })
                if (obj.ident) {
                    const typeSymbol = this.config.services.scopeManager.lookupSymbol(obj.ident.name);

                    if (!typeSymbol) {
                        this.reportError(
                            DiagCode.UNDEFINED_IDENTIFIER,
                            `Type '${obj.ident.name}' not found`,
                            obj.span
                        );
                        return null;
                    }

                    if (!typeSymbol.type) {
                        this.reportError(
                            DiagCode.SYMBOL_NOT_FOUND,
                            `Symbol '${obj.ident.name}' has no type`,
                            obj.span
                        );
                        return null;
                    }

                    let actualType = typeSymbol.type;
                    if (actualType.isIdent()) {
                        const typeIdent = actualType.getIdent()!;
                        const resolvedSymbol = this.config.services.scopeManager.lookupSymbol(typeIdent.name);
                        if (resolvedSymbol && resolvedSymbol.type) {
                            actualType = resolvedSymbol.type;
                        }
                    }

                    if (actualType.isStruct()) {
                        this.typeValidator.validateStructConstruction(obj, actualType, obj.span);
                        return typeSymbol.type;
                    } else {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `'${obj.ident.name}' is not a struct type`,
                            obj.span
                        );
                        return null;
                    }
                }

                // CASE 2: Anonymous object literal
                // NEW: Check if we're in an assignment/initialization context with an expected type
                const expectedType = this.getExpectedTypeFromContext();

                if (expectedType) {
                    const resolvedExpected = this.resolveIdentifierType(expectedType);

                    // If expected type is a union, check if any member is a matching struct
                    if (resolvedExpected.isUnion()) {
                        const unionType = resolvedExpected.getUnion()!;

                        for (const memberType of unionType.types) {
                            const resolvedMember = this.resolveIdentifierType(memberType);

                            if (resolvedMember.isStruct()) {
                                const struct = resolvedMember.getStruct()!;

                                // Check if object literal matches this struct's shape
                                if (this.doesObjectMatchStruct(obj, struct)) {
                                    // Return the union member type, not a new anonymous struct
                                    return memberType;
                                }
                            }
                        }
                    }

                    // If expected type is directly a struct
                    if (resolvedExpected.isStruct()) {
                        const struct = resolvedExpected.getStruct()!;

                        if (this.doesObjectMatchStruct(obj, struct)) {
                            return expectedType;
                        }
                    }
                }

                // Fall back to creating anonymous struct (existing code)
                const fields: AST.TypeNode[] = [];
                const fieldNodes: AST.FieldNode[] = [];

                for (const prop of obj.props) {
                    const fieldType = prop.val
                        ? this.inferExpressionType(prop.val)
                        : AST.TypeNode.asUndefined(prop.key.span);

                    if (!fieldType) {
                        this.reportError(
                            DiagCode.CANNOT_INFER_TYPE,
                            `Cannot infer type for property '${prop.key.name}'`,
                            prop.key.span
                        );
                        return null;
                    }

                    fields.push(fieldType);

                    const fieldNode = AST.FieldNode.create(
                        prop.key.span,
                        { kind: 'Private' },
                        { kind: 'Runtime' },
                        { kind: 'Immutable' },
                        prop.key,
                        fieldType,
                        prop.val || undefined
                    );
                    fieldNodes.push(fieldNode);
                }

                const members = fieldNodes.map(f => AST.StructMemberNode.createField(f.span, f));
                return AST.TypeNode.asStruct(obj.span, members, 'Anonymous');
            }

            inferTupleType(tuple: AST.ExprTupleNode): AST.TypeNode | null {
                const fieldTypes: AST.TypeNode[] = [];

                for (const field of tuple.fields) {
                    const fieldType = this.inferExpressionType(field);
                    if (!fieldType) return null;
                    fieldTypes.push(fieldType);
                }

                return AST.TypeNode.asTuple(tuple.span, fieldTypes);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── BINARY ──────────────────────────────┐

            inferBinaryType(binary: AST.BinaryNode): AST.TypeNode | null {
                if (!binary.left || !binary.right) return null;

                // Handle Assignment FIRST, before inferring operand types
                if (binary.kind === 'Assignment') {
                    this.typeValidator.validateAssignment(binary);

                    // Assignment expression evaluates to the right-hand side value
                    return this.inferExpressionType(binary.right);
                }

                const leftType = this.inferExpressionType(binary.left);
                const rightType = this.inferExpressionType(binary.right);

                if (!leftType || !rightType) return null;

                // Reject 'type' in arithmetic
                if (this.isTypeType(leftType) || this.isTypeType(rightType)) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot perform ${binary.kind} operation on type values`,
                        binary.span
                    );
                    return null;
                }

                // slice/u8Array
                if(binary.kind === 'Additive' && binary.operator === '+') {
                    // Resolve both types to their base forms (slice -> []u8)
                    const resolvedLeft = this.resolveIdentifierType(leftType);
                    const resolvedRight = this.resolveIdentifierType(rightType);

                    const leftIsString = this.isStringType(resolvedLeft);
                    const rightIsString = this.isStringType(resolvedRight);

                    if (leftIsString && rightIsString) {
                        const leftMutability = this.getExpressionMutability(binary.left);
                        const rightMutability = this.getExpressionMutability(binary.right);

                        // Ignore literals - they're compatible with everything
                        const leftEffective = leftMutability === 'Literal' ? null : leftMutability;
                        const rightEffective = rightMutability === 'Literal' ? null : rightMutability;

                        // If both are non-literals, they must match
                        if (leftEffective !== null && rightEffective !== null) {
                            if (leftEffective !== rightEffective) {
                                this.reportError(
                                    DiagCode.MUTABILITY_MISMATCH,
                                    `Cannot concatenate arrays with different mutability`,
                                    binary.span
                                );
                                return null;
                            }
                        }

                        return leftType;
                    }

                    // Reject: mixing strings with non-strings
                    if (leftIsString || rightIsString) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Cannot concatenate string with non-string type`,
                            binary.span
                        );
                        return null;
                    }

                    // If neither is string, fall through to numeric check below
                }

                switch (binary.kind) {
                    case 'Additive':
                    case 'Multiplicative':
                    case 'Power':
                        // Validate operands are numeric
                        if (!this.isNumericType(leftType) || !this.isNumericType(rightType)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Cannot perform ${binary.kind} operation on non-numeric types '${this.getTypeDisplayName(leftType)}' and '${this.getTypeDisplayName(rightType)}'`,
                                binary.span
                            );
                            return null;
                        }
                        return this.promoteNumericTypes(leftType, rightType, binary.span);

                    case 'Shift':
                    case 'BitwiseAnd':
                    case 'BitwiseXor':
                    case 'BitwiseOr':
                        // Validate operands are integers
                        if (!this.isIntegerType(leftType) || !this.isIntegerType(rightType)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Bitwise operations require integer types, got '${this.getTypeDisplayName(leftType)}' and '${this.getTypeDisplayName(rightType)}'`,
                                binary.span
                            );
                            return null;
                        }
                        return this.promoteNumericTypes(leftType, rightType, binary.span);

                    case 'Equality':
                    case 'Relational':
                        // NEW: Validate null comparison with non-optional types
                        // Allow: optional types, null itself, and POINTERS to be compared with null
                        if (leftType.isNull() && !rightType.isOptional() && !rightType.isNull() && !rightType.isPointer()) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Cannot compare non-optional type '${this.getTypeDisplayName(rightType)}' with null`,
                                binary.right.span
                            );
                        } else if (rightType.isNull() && !leftType.isOptional() && !leftType.isNull() && !leftType.isPointer()) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Cannot compare non-optional type '${this.getTypeDisplayName(leftType)}' with null`,
                                binary.left.span
                            );
                        }
                        return AST.TypeNode.asBool(binary.span);

                    case 'LogicalAnd':
                    case 'LogicalOr':
                        return AST.TypeNode.asBool(binary.span);

                    default:
                        return null;
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── PREFIX ──────────────────────────────┐

            inferPrefixType(prefix: AST.PrefixNode): AST.TypeNode | null {
                const exprType = this.inferExpressionType(prefix.expr);
                if (!exprType) return null;

                switch (prefix.kind) {
                    case 'UnaryPlus':
                    case 'UnaryMinus':
                        if (!this.isNumericType(exprType)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Unary '${prefix.kind === 'UnaryMinus' ? '-' : '+'}' requires a numeric operand, got '${this.getTypeDisplayName(exprType)}'`,
                                prefix.expr.span
                            );
                            return null;
                        }
                        return this.computeUnaryResultType(exprType, prefix.kind === 'UnaryMinus', prefix.span);

                    case 'Increment':
                    case 'Decrement':
                        if (!this.isNumericType(exprType)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `${prefix.kind} requires a numeric operand`,
                                prefix.expr.span
                            );
                            return null;
                        }
                        return exprType;

                    case 'LogicalNot':
                        return AST.TypeNode.asBool(prefix.span);

                    case 'BitwiseNot':
                        if (!this.isIntegerType(exprType)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Bitwise not requires integer type, got '${this.getTypeDisplayName(exprType)}'`,
                                prefix.expr.span
                            );
                            return null;
                        }
                        return exprType;

                    case 'Reference':
                        // Check if expression is an lvalue before taking reference
                        if (!this.isLValueExpression(prefix.expr)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Cannot take reference of non-lvalue expression`,
                                prefix.expr.span
                            );
                            return null; // Stop type inference
                        }

                        let isMutablePointer = false;
                        let resolvedType = exprType;

                        // Extract the symbol being referenced
                        if (prefix.expr.is('Primary')) {
                            const primary = prefix.expr.getPrimary();
                            if (primary?.is('Ident')) {
                                const ident = primary.getIdent();
                                if (ident) {
                                    const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);

                                    if (symbol && symbol.mutability.kind === 'Mutable') {
                                        isMutablePointer = true;
                                    }

                                    if (symbol && symbol.type) {
                                        resolvedType = symbol.type;
                                    }
                                }
                            }
                        }

                        const normalizedType = this.normalizeType(resolvedType);
                        return AST.TypeNode.asPointer(prefix.span, normalizedType, isMutablePointer);

                    default:
                        return null;
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── POSTFIX ─────────────────────────────┐

            inferPostfixType(postfix: AST.PostfixNode): AST.TypeNode | null {
                switch (postfix.kind) {
                    case 'Call':
                        return this.inferCallType(postfix.getCall()!);

                    case 'ArrayAccess':
                        return this.inferArrayAccessType(postfix.getArrayAccess()!);

                    case 'MemberAccess':
                        return this.inferMemberAccessType(postfix.getMemberAccess()!);

                    case 'Increment':
                    case 'Decrement':
                        const exprType = this.inferExpressionType(postfix.getAsExprNode()!);
                        if (exprType && !this.isNumericType(exprType)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `${postfix.kind} requires numeric type`,
                                postfix.span
                            );
                            return null;
                        }
                        return exprType;

                    case 'Dereference':
                        const ptrType = this.inferExpressionType(postfix.getAsExprNode()!);

                        if (!ptrType) {
                            this.reportError(
                                DiagCode.TYPE_INFERENCE_FAILED,
                                'Cannot infer type for dereference operation',
                                postfix.span
                            );
                            return null;
                        }

                        // Unwrap paren types before checking if pointer
                        const unwrappedPtrType = this.unwrapParenType(ptrType);

                        if (!unwrappedPtrType.isPointer()) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Cannot dereference non-pointer type '${this.getTypeDisplayName(ptrType)}'`,
                                postfix.span
                            );
                            return null;
                        }

                        return unwrappedPtrType.getPointer()!.target;

                    default:
                        return null;
                }
            }

            inferCallType(call: AST.CallNode): AST.TypeNode | null {
                this.typeValidator.stats.callsValidated++;

                // Check builtins FIRST
                if (this.typeValidator.isBuiltinFunction(call.base)) {
                    return this.typeValidator.validateBuiltinCall(call);
                }

                // Check if this is an enum variant constructor BEFORE checking methods
                if (call.base.is('Postfix')) {
                    const postfix = call.base.getPostfix();
                    if (postfix?.kind === 'MemberAccess') {
                        const access = postfix.getMemberAccess()!;
                        const baseType = this.inferExpressionType(access.base);

                        if (baseType) {
                            const resolvedBase = this.resolveIdentifierType(baseType);

                            if (resolvedBase.isEnum()) {
                                return this.typeValidator.validateEnumVariantConstruction(call, access, resolvedBase);
                            }

                            if (resolvedBase.isStruct()) {
                                const memberName = this.extractMemberName(access.target);
                                if (memberName) {
                                    const struct = resolvedBase.getStruct()!;
                                    const scopeId = struct.metadata?.scopeId as number | undefined;

                                    if (scopeId !== undefined) {
                                        const structScope = this.config.services.scopeManager.getScope(scopeId);
                                        const methodSymbol = structScope.symbols.get(memberName);

                                        if (methodSymbol && methodSymbol.kind === SymbolKind.Function) {
                                            const isStaticAccess = this.isStaticMemberAccess(access.base);
                                            this.typeValidator.validateMethodCallContext(call, methodSymbol, isStaticAccess, access.base);
                                            this.typeValidator.validateMemberVisibility(methodSymbol, structScope, access.target.span);
                                        }
                                    }
                                }

                                return this.typeValidator.validateStructMethodCall(call, access, resolvedBase);
                            }
                        }
                    }
                }

                // Regular function call...
                const calleeSymbol = this.findCallTargetSymbol(call.base);
                let calleeType = calleeSymbol ? calleeSymbol.type : this.inferExpressionType(call.base);

                if (!calleeType) {
                    return null;
                }

                // RESOLVE IDENTIFIER TYPES (BinaryOp -> fn(i32, i32) -> i32)
                const resolvedCalleeType = this.resolveIdentifierType(calleeType);

                if (resolvedCalleeType.isFunction()) {
                    return this.typeValidator.validateCallArgumentsWithContext(call, resolvedCalleeType);
                }

                // Now the error is accurate
                this.reportError(
                    DiagCode.TYPE_MISMATCH,
                    `Cannot call value of non-function type '${this.getTypeDisplayName(calleeType)}'`,
                    call.base.span
                );
                return null;
            }

            inferArrayAccessType(access: AST.ArrayAccessNode): AST.TypeNode | null {
                const baseType = this.inferExpressionType(access.base);
                const indexType = this.inferExpressionType(access.index);

                if (!baseType) return null;

                // NEW: Resolve type aliases (slice -> []u8)
                const resolvedType = this.resolveIdentifierType(baseType);

                // Handle range indexing
                if (access.index.kind === 'Range') {
                    // Return same type as base ([]u8 for slice)
                    return resolvedType;
                }

                if (indexType && !this.isIntegerType(indexType)) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Array index must be integer type, got '${this.getTypeDisplayName(indexType)}'`,
                        access.index.span
                    );
                }

                // Check if it's a tuple type
                if (resolvedType.isTuple()) {
                    return this.inferTupleIndexAccess(resolvedType, access.index, access.span);
                }

                // Check resolved type for arrays/strings
                if (resolvedType.isArray() || this.isStringType(resolvedType)) {
                    return resolvedType.getArray()!.target;
                }

                this.reportError(
                    DiagCode.TYPE_MISMATCH,
                    `Cannot index non-array type '${this.getTypeDisplayName(baseType)}'`,
                    access.base.span
                );
                return null;
            }

            inferTupleIndexAccess(tupleType: AST.TypeNode, indexExpr: AST.ExprNode, span: AST.Span): AST.TypeNode | null {
                const tuple = tupleType.getTuple()!;

                // Try to evaluate index as compile-time constant
                const indexValue = this.typeValidator.ExpressionEvaluator.evaluateComptimeExpression(indexExpr);

                if (indexValue === null) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Tuple index must be a compile-time constant`,
                        indexExpr.span
                    );
                    return null;
                }

                const index = Number(indexValue);

                // Validate index range
                if (index < 0 || index >= tuple.fields.length) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Tuple index ${index} out of bounds (tuple has ${tuple.fields.length} field${tuple.fields.length !== 1 ? 's' : ''})`,
                        indexExpr.span
                    );
                    return null;
                }

                return tuple.fields[index];
            }

            inferMemberAccessType(access: AST.MemberAccessNode): AST.TypeNode | null {
                // DEBUG: Log the current context
                this.log('verbose', `inferMemberAccessType: currentIsStaticMethod=${this.typeValidator.currentIsStaticMethod}, currentStructScope=${this.typeValidator.currentStructScope?.name || 'null'}`);


                // Check wildcard imports FIRST, before inferring base type
                if (access.base.is('Primary')) {
                    const primary = access.base.getPrimary();
                    if (primary?.is('Ident')) {
                        const ident = primary.getIdent()!;

                        if (ident?.name === 'self') {
                            // ALLOW self in static methods, but validate member is static
                            if (this.typeValidator.currentIsStaticMethod && this.typeValidator.currentStructScope) {
                                const memberName = this.extractMemberName(access.target);
                                if (!memberName) {
                                    this.reportError(DiagCode.INTERNAL_ERROR, `Could not resolve member access on self`, access.target.span);
                                    return null;
                                }

                                const memberSymbol = this.typeValidator.currentStructScope.symbols.get(memberName);

                                if (!memberSymbol) {
                                    this.reportError(DiagCode.SYMBOL_NOT_FOUND, `Member '${memberName}' not found in struct`, access.target.span);
                                    return null;
                                }

                                const isStaticMember = memberSymbol.visibility.kind === 'Static';

                                // ❌ ERROR if accessing instance member via self in static method
                                if (!isStaticMember) {
                                    const memberType = memberSymbol.kind === SymbolKind.Function ? 'method' : 'field';
                                    this.reportError(
                                        DiagCode.INVALID_STATIC_ACCESS,
                                        `Cannot access instance ${memberType} '${memberName}' via 'self' in static method. Static methods can only access static members.`,
                                        access.target.span
                                    );
                                    return null;
                                }

                                // Valid static member access via self
                                memberSymbol.used = true;
                                return memberSymbol.type || null;
                            }

                            // Instance method - resolve self normally
                            const selfSymbol = this.config.services.scopeManager.lookupSymbol('self');
                            if (selfSymbol && selfSymbol.metadata?.isSelf) {
                                selfSymbol.used = true;
                                const selfType = selfSymbol.type;
                                if (selfType) {
                                    return this.resolveMemberOnUnwrappedType(selfType, access, null, false);
                                }
                            }

                            return null;
                        }

                        const baseSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);

                        // Handle wildcard import member access
                        if (baseSymbol && baseSymbol.kind === SymbolKind.Use &&
                            baseSymbol.metadata?.isWildcardImport) {

                            return this.resolveWildcardMemberAccess(access, baseSymbol);
                        }
                    }
                }

                // Continue with normal resolution...
                let baseType = this.inferExpressionType(access.base);
                if (!baseType) {
                    return null;
                }

                // NEW: Resolve type aliases (slice -> []u8)
                baseType = this.resolveIdentifierType(baseType);

                // NEW: Handle built-in array/slice properties
                if (baseType.isArray() || this.isStringType(baseType)) {
                    const memberName = this.extractMemberName(access.target);

                    if (memberName === 'len') {
                        // Return usize for length
                        return AST.TypeNode.asUnsigned(access.span, 'usize', 64);
                    }

                    // TODO:
                    // if (memberName === 'ptr') {
                    // }

                    // Reject other members
                    this.reportError(
                        DiagCode.SYMBOL_NOT_FOUND,
                        `Type '${this.getTypeDisplayName(baseType)}' has no property '${memberName}'. Available: len`,
                        access.target.span
                    );
                    return null;
                }

                // NEW: Handle built-in tuple properties
                if (baseType.isTuple()) {
                    const memberName = this.extractMemberName(access.target);

                    if (memberName === 'len') {
                        // Return usize for length
                        return AST.TypeNode.asUnsigned(access.span, 'usize', 64);
                    }

                    // Reject other members
                    this.reportError(
                        DiagCode.SYMBOL_NOT_FOUND,
                        `Type '${this.getTypeDisplayName(baseType)}' has no property '${memberName}'. Available: len`,
                        access.target.span
                    );
                    return null;
                }

                if (access.optional && !baseType.isOptional()) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot use optional chaining on non-optional type '${this.getTypeDisplayName(baseType)}'`,
                        access.span
                    );
                    return null;
                }

                // Handle dereference in base expression
                if (access.base.is('Postfix')) {
                    const postfix = access.base.getPostfix();
                    if (postfix?.kind === 'Dereference') {
                        if (baseType.isIdent()) {
                            const ident = baseType.getIdent()!;
                            const typeSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                            if (typeSymbol?.type) {
                                baseType = typeSymbol.type;
                            }
                        }
                        return this.resolveMemberOnUnwrappedType(baseType, access, null);
                    }
                }

                let unwrappedType = baseType;
                let optionalDepth = 0;

                while (unwrappedType.isOptional()) {
                    unwrappedType = unwrappedType.getOptional()!.target;
                    optionalDepth++;
                }

                if (unwrappedType.isIdent()) {
                    const ident = unwrappedType.getIdent()!;
                    const typeSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                    if (typeSymbol?.type) {
                        unwrappedType = typeSymbol.type;
                    }
                }

                if (unwrappedType.isEnum()) {
                    const memberType = this.resolveEnumMember(unwrappedType, access);

                    // NEW: Check if variant requires a value but is used without construction
                    if (memberType) {
                        const enumDef = unwrappedType.getEnum()!;
                        const memberName = this.extractMemberName(access.target);
                        const variant = enumDef.variants.find(v => v.ident.name === memberName);

                        if (variant && variant.type) {
                            // This variant has an associated type but is accessed without ()
                            // Only error if it's NOT being called (checked in parent context)
                            // We'll handle this in the validation phase
                        }
                    }

                    return memberType;
                }

                // Check if accessing static member on type identifier
                const isStaticAccess = this.isStaticMemberAccess(access.base);

                const memberType = this.resolveMemberOnUnwrappedType(
                    unwrappedType,
                    access,
                    null,
                    isStaticAccess
                );

                if (optionalDepth > 0 && memberType) {
                    return AST.TypeNode.asOptional(access.span, memberType);
                }

                return memberType;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────── SPECIAL EXPRESSIONS ─────────────────────┐

            inferOrelseType(orelse: AST.OrelseNode): AST.TypeNode | null {
                const leftType = this.inferExpressionType(orelse.left);
                const rightType = this.inferExpressionType(orelse.right);

                if (!leftType) return rightType;
                if (!rightType) return leftType;

                // Handle ?T ?? something
                if (leftType.isOptional()) {
                    const unwrapped = leftType.getOptional()!.target; // T

                    // CASE 1: ?T ?? null -> T | null
                    if (rightType.isNull()) {
                        return AST.TypeNode.asUnion(orelse.span, [unwrapped, rightType]);
                    }

                    // CASE 2: ?T ?? ?U -> ?T (keeps leftType as-is)
                    // Example: ?i32 ?? ?i32 = ?i32
                    if (rightType.isOptional()) {
                        const rightUnwrapped = rightType.getOptional()!.target;

                        // Validate that T and U are compatible
                        if (!this.isTypeCompatible(unwrapped, rightUnwrapped)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Cannot use type '${this.getTypeDisplayName(rightType)}' as fallback for '${this.getTypeDisplayName(leftType)}'`,
                                orelse.right.span
                            );
                        }

                        // Return the optional type (left side takes precedence)
                        return leftType; // ?T
                    }

                    // CASE 3: ?T ?? T -> T (unwrapped)
                    // Example: ?i32 ?? 0 = i32
                    if (!this.isTypeCompatible(unwrapped, rightType)) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Cannot use type '${this.getTypeDisplayName(rightType)}' as fallback for '${this.getTypeDisplayName(leftType)}'`,
                            orelse.right.span
                        );
                    }

                    return unwrapped; // T
                }

                // Left is not optional, just return it
                return leftType;
            }

            inferRangeType(range: AST.RangeNode): AST.TypeNode | null {
                if (range.leftExpr) {
                    this.typeValidator.validateIntegerRangeExpr(range.leftExpr, 'start', range.leftExpr.span);
                }

                if (range.rightExpr) {
                    this.typeValidator.validateIntegerRangeExpr(range.rightExpr, 'end', range.rightExpr.span);
                }

                return AST.TypeNode.asPrimitive(range.span, 'type');
            }

            inferTryType(tryNode: AST.TryNode): AST.TypeNode | null {
                const exprType = this.inferExpressionType(tryNode.expr);
                if (!exprType) return null;
                return exprType;
            }

            inferCatchType(catchNode: AST.CatchNode): AST.TypeNode | null {
                const leftType = this.inferExpressionType(catchNode.leftExpr);

                const exprScope = this.config.services.scopeManager.findChildScopeByName('expr', ScopeKind.Expression);
                if (exprScope) {
                    this.config.services.contextTracker.withSavedState(() => {
                        this.config.services.scopeManager.withScope(exprScope.id, () => {
                            this.typeValidator.validateStmt(catchNode.rightStmt);
                        });
                    });
                }

                return leftType;
            }

            inferIfType(ifNode: AST.IfNode): AST.TypeNode | null {
                const condType = this.inferExpressionType(ifNode.condExpr);
                if (condType && !condType.isBool()) {
                    this.log('verbose', `If condition has type ${this.getTypeDisplayName(condType)}, expected bool`);
                }

                const exprScope = this.config.services.scopeManager.findChildScopeByName('expr', ScopeKind.Expression);
                if (exprScope) {
                    this.config.services.contextTracker.withSavedState(() => {
                        this.config.services.scopeManager.withScope(exprScope.id, () => {
                            this.typeValidator.validateStmt(ifNode.thenStmt);
                            if (ifNode.elseStmt) {
                                this.typeValidator.validateStmt(ifNode.elseStmt);
                            }
                        });
                    });
                } else {
                    this.typeValidator.validateStmt(ifNode.thenStmt);
                    if (ifNode.elseStmt) {
                        this.typeValidator.validateStmt(ifNode.elseStmt);
                    }
                }

                return null;
            }

            inferSwitchType(MatchNode: AST.MatchNode): AST.TypeNode | null {
                this.inferExpressionType(MatchNode.condExpr);
                this.typeValidator.validateSwitchExhaustiveness(MatchNode);

                const exprScope = this.config.services.scopeManager.findChildScopeByName('expr', ScopeKind.Expression);

                for (const switchCase of MatchNode.cases) {
                    if (switchCase.expr) {
                        this.inferExpressionType(switchCase.expr);
                    }
                    if (switchCase.stmt) {
                        if (exprScope) {
                            this.config.services.contextTracker.withSavedState(() => {
                                this.config.services.scopeManager.withScope(exprScope.id, () => {
                                    this.typeValidator.validateStmt(switchCase.stmt!);
                                });
                            });
                        } else {
                            this.typeValidator.validateStmt(switchCase.stmt);
                        }
                    }
                }

                if (MatchNode.defCase) {
                    if (exprScope) {
                        this.config.services.contextTracker.withSavedState(() => {
                            this.config.services.scopeManager.withScope(exprScope.id, () => {
                                this.typeValidator.validateStmt(MatchNode.defCase!.stmt);
                            });
                        });
                    } else {
                        this.typeValidator.validateStmt(MatchNode.defCase.stmt);
                    }
                }

                return null;
            }

            inferAsType(asNode: AST.AsNode): AST.TypeNode | null {
                const sourceType = this.inferExpressionType(asNode.base);
                if (!sourceType) return null;

                if (!this.canConvertTypes(sourceType, asNode.type)) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot convert type '${this.getTypeDisplayName(sourceType)}' to type '${this.getTypeDisplayName(asNode.type)}'`,
                        asNode.span
                    );
                }

                return asNode.type;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────── TYPE COMPATIBILITY ──────────────────────┐

            isTypeCompatible(target: AST.TypeNode, source: AST.TypeNode, sourceExpr?: AST.ExprNode): boolean {
                this.typeValidator.stats.compatibilityChecks++;

                // ⚠️ STRICT MODE: Pointer dereference requires EXACT type match
                if (sourceExpr && this.isPointerDereference(sourceExpr)) {
                    const normalizedTarget = this.normalizeType(target);
                    const normalizedSource = this.normalizeType(source);

                    // For pointer dereference, only allow exact type match (no widening)
                    if (!this.isSameType(normalizedTarget, normalizedSource)) {
                        return false;
                    }
                    // If types match exactly, continue with normal validation
                }

                // STEP 1: NORMALIZE BOTH TYPES (unwrap parens, etc.)
                const normalizedTarget = this.normalizeType(target);
                const normalizedSource = this.normalizeType(source);

                // STEP 2: RESOLVE IDENTIFIERS EARLY (Point -> struct, slice -> []u8, etc.)
                const resolvedTarget = this.resolveIdentifierType(normalizedTarget);
                const resolvedSource = this.resolveIdentifierType(normalizedSource);

                // STEP 3: QUICK CHECKS

                // 'any' accepts everything
                if (this.isAnyType(resolvedTarget)) return true;

                // Exact type match
                if (this.isSameType(resolvedTarget, resolvedSource)) return true;

                // STEP 4: ERROR TYPE HANDLING

                // 'err' primitive accepts any error type
                if (resolvedTarget.isErr()) {
                    if (this.isErrorType(resolvedSource)) {
                        return true;
                    }

                    // Check if source is an error identifier
                    if (resolvedSource.isIdent()) {
                        const sourceIdent = resolvedSource.getIdent()!;
                        const sourceSymbol = this.config.services.scopeManager.lookupSymbol(sourceIdent.name);

                        if (sourceSymbol && sourceSymbol.kind === SymbolKind.Error) {
                            return true;
                        }
                    }

                    return false;
                }

                // STEP 5: NUMERIC TYPE HANDLING

                // Bool is NOT compatible with numeric types
                if (resolvedSource.isBool() && this.isNumericType(resolvedTarget)) {
                    return false;
                }

                // Numeric compatibility (i32 -> i64, comptime_int -> i32, etc.)
                if (this.isNumericType(resolvedTarget) && this.isNumericType(resolvedSource)) {
                    return this.areNumericTypesCompatible(resolvedTarget, resolvedSource);
                }

                // STEP 6: UNION TYPE HANDLING

                // Union to Union: all source types must be compatible with target union
                if (resolvedTarget.isUnion() && resolvedSource.isUnion()) {
                    const targetUnion = resolvedTarget.getUnion()!;
                    const sourceUnion = resolvedSource.getUnion()!;

                    return sourceUnion.types.every((sourceType: AST.TypeNode) =>
                        targetUnion.types.some((targetType: AST.TypeNode) =>
                            this.isTypeCompatible(targetType, sourceType)
                        )
                    );
                }

                // Target is Union: check if source matches ANY union member
                if (resolvedTarget.isUnion()) {
                    const unionType = resolvedTarget.getUnion()!;

                    // PRIORITY 1: Check NORMALIZED source identifier (BEFORE resolution)
                    if (normalizedSource.isIdent()) {
                        const sourceIdent = normalizedSource.getIdent()!;

                        const identMatch = unionType.types.some((memberType: AST.TypeNode, idx: number) => {
                            if (memberType.isIdent()) {
                                const match = memberType.getIdent()!.name === sourceIdent.name;
                                return match;
                            }
                            return false;
                        });

                        if (identMatch) {
                            return true;
                        }
                    }

                    // PRIORITY 2: Check if RESOLVED source is a named struct
                    if (resolvedSource.isStruct()) {
                        const struct = resolvedSource.getStruct()!;

                        if (struct.name && struct.name !== 'Anonymous') {
                            const structNameMatch = unionType.types.some((memberType: AST.TypeNode, idx: number) => {
                                if (memberType.isIdent()) {
                                    const match = memberType.getIdent()!.name === struct.name;
                                    return match;
                                }
                                return false;
                            });

                            if (structNameMatch) {
                                return true;
                            }
                        }
                    }

                    // PRIORITY 3: Check RESOLVED source for structural matches
                    const structuralMatch = unionType.types.some((memberType: AST.TypeNode, idx: number) => {

                        // Resolve the union member type
                        const resolvedMember = this.resolveIdentifierType(memberType);

                        // For struct types, use specialized structural comparison
                        if (resolvedMember.isStruct() && resolvedSource.isStruct()) {
                            const result = this.areStructsStructurallyCompatible(
                                resolvedMember.getStruct()!,
                                resolvedSource.getStruct()!
                            );
                            return result;
                        }

                        // For array types, use specialized array comparison
                        if (resolvedMember.isArray() && resolvedSource.isArray()) {
                            const result = this.areArrayTypesCompatible(resolvedMember, resolvedSource);
                            return result;
                        }

                        // For other types, recursively check compatibility
                        const result = this.isTypeCompatible(resolvedMember, normalizedSource);
                        return result;
                    });

                    return structuralMatch;
                }

                // Source is Union: check if ALL source types are compatible with target
                // This handles cases like: let x: i32 = (1 | 2); // union value to single type
                if (resolvedSource.isUnion()) {
                    const sourceUnion = resolvedSource.getUnion()!;

                    return sourceUnion.types.every((sourceType: AST.TypeNode) =>
                        this.isTypeCompatible(resolvedTarget, sourceType)
                    );
                }

                // STEP 7: OPTIONAL TYPE HANDLING

                // Target is optional: accept null/undefined OR unwrapped type
                if (resolvedTarget.isOptional()) {
                    if (resolvedSource.isNull() || resolvedSource.isUndefined()) return true;

                    const targetInner = resolvedTarget.getOptional()!.target;
                    return this.isTypeCompatible(targetInner, resolvedSource);
                }

                // Source is optional: for union targets, check if inner type + null are both compatible
                if (resolvedSource.isOptional()) {
                    const sourceInner = resolvedSource.getOptional()!.target;

                    if (resolvedTarget.isUnion()) {
                        const unionType = resolvedTarget.getUnion()!;
                        const hasInnerType = unionType.types.some((t: AST.TypeNode) =>
                            this.isTypeCompatible(t, sourceInner)
                        );
                        const hasNull = unionType.types.some((t: AST.TypeNode) => t.isNull());
                        return hasInnerType && hasNull;
                    }

                    // For non-union targets, optional source is not compatible
                    return false;
                }

                // STEP 8: ARRAY TYPE HANDLING

                if (resolvedTarget.isArray() && resolvedSource.isArray()) {
                    return this.areArrayTypesCompatible(resolvedTarget, resolvedSource);
                }

                // STEP 9: POINTER TYPE HANDLING

                if (resolvedTarget.isPointer()) {
                    if (resolvedSource.isNull()) return true;

                    if (resolvedSource.isPointer()) {
                        return this.arePointerTypesCompatible(resolvedTarget, resolvedSource);
                    }

                    return false;
                }

                // STEP 10: TUPLE TYPE HANDLING

                if (resolvedTarget.isTuple() && resolvedSource.isTuple()) {
                    return this.areTupleTypesCompatible(resolvedTarget, resolvedSource);
                }

                // STEP 11: STRUCT TYPE HANDLING

                if (resolvedTarget.isStruct() && resolvedSource.isStruct()) {
                    return this.areStructTypesCompatible(resolvedTarget, resolvedSource);
                }

                // STEP 12: ENUM TYPE HANDLING

                if (resolvedTarget.isEnum() && resolvedSource.isEnum()) {
                    return this.isSameType(resolvedTarget, resolvedSource);
                }

                // STEP 13: TYPE PRIMITIVE HANDLING

                // 'type' is a special meta-type
                if (resolvedTarget.isType()) {
                    return true;
                }

                // STEP 14: NO MATCH
                return false;
            }

            // Type checking utilities
            isNumericType(type: AST.TypeNode): boolean {
                if (this.isTypeType(type)) return false;
                return type.isFloat() || type.isSigned() || type.isUnsigned() ||
                       type.isComptimeInt() || type.isComptimeFloat();
            }

            isAnyType(type: AST.TypeNode): boolean {
                return type.isPrimitive() && type.getPrimitive()?.kind === 'any';
            }

            isIntegerType(type: AST.TypeNode): boolean {
                return type.isSigned() || type.isUnsigned() || type.isComptimeInt();
            }

            isStringType(type: AST.TypeNode): boolean {
                return type.isArray() && type.getArray()!.target.isUnsigned() &&
                       type.getArray()!.target.getWidth() === 8;
            }

            isErrorType(type: AST.TypeNode): boolean {
                if (type.isErrset() || type.isErr()) return true;

                if (type.isIdent()) {
                    const ident = type.getIdent()!;
                    const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);

                    if (symbol?.kind === SymbolKind.Error || symbol?.type?.isErrset()) {
                        return true;
                    }

                    // Check all scopes for error symbols
                    return this.config.services.scopeManager.getAllScopes()
                        .some(scope => scope.symbols.get(ident.name)?.kind === SymbolKind.Error);
                }

                return false;
            }

            isTypeExpression(expr: AST.ExprNode): boolean {
                if (expr.kind === 'Primary') {
                    const primary = expr.getPrimary();
                    if (!primary) return false;

                    // Check for Object FIRST before Type
                    // Constructors are Objects with an ident: Point { x: 0 }
                    if (primary.kind === 'Object') {
                        const obj = primary.getObject();
                        // If it has an ident, it's a constructor, NOT a type expression
                        if (obj && obj.ident) {
                            return false; // This is Point { x: 0 }, not a type
                        }
                        // If no ident, it's an anonymous object literal, also not a type
                        return false;
                    }

                    // Direct type expression: return i32, return struct{}, etc.
                    if (primary.kind === 'Type') {
                        return true;
                    }

                    // Check if it's an identifier that refers to a type definition
                    if (primary.kind === 'Ident') {
                        const ident = primary.getIdent();
                        if (!ident) return false;

                        // Look up the symbol to check if it's a type definition
                        const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                        if (symbol && symbol.kind === SymbolKind.Definition) {
                            // It's a type definition (like returning `Point` instead of an instance)
                            return true;
                        }
                    }
                }

                return false;
            }

            isTypeType(typeNode: AST.TypeNode): boolean {
                if (!typeNode.isPrimitive()) return false;
                const prim = typeNode.getPrimitive();
                return prim?.kind === 'type';
            }

            isPointerDereference(expr: AST.ExprNode): boolean {
                if (!expr.is('Postfix')) return false;

                const postfix = expr.getPostfix();
                return postfix?.kind === 'Dereference';
            }

            isSameType(type1: AST.TypeNode, type2: AST.TypeNode): boolean {
                if (type1 === type2) return true;
                if (type1.kind !== type2.kind) return false;

                switch (type1.kind) {
                    case 'primitive':
                        const prim1 = type1.getPrimitive()!;
                        const prim2 = type2.getPrimitive()!;
                        return prim1.kind === prim2.kind && prim1.width === prim2.width;

                    case 'array':
                        const arr1 = type1.getArray()!;
                        const arr2 = type2.getArray()!;
                        return this.isSameType(arr1.target, arr2.target);

                    case 'pointer':
                        const ptr1 = type1.getPointer()!;
                        const ptr2 = type2.getPointer()!;
                        return this.isSameType(ptr1.target, ptr2.target) && ptr1.mutable === ptr2.mutable;

                    case 'paren':
                        return this.isSameType(type1.getParen()!.type, type2.getParen()!.type);

                    case 'optional':
                        const opt1 = type1.getOptional()!;
                        const opt2 = type2.getOptional()!;
                        return this.isSameType(opt1.target, opt2.target);

                    case 'tuple':
                        const tup1 = type1.getTuple()!;
                        const tup2 = type2.getTuple()!;
                        if (tup1.fields.length !== tup2.fields.length) return false;
                        return tup1.fields.every((f: AST.TypeNode, i: number) => this.isSameType(f, tup2.fields[i]));

                    case 'function':
                        const func1 = type1.getFunction()!;
                        const func2 = type2.getFunction()!;
                        if (func1.params.length !== func2.params.length) return false;
                        if (!func1.params.every((p: AST.TypeNode, i: number) => this.isSameType(p, func2.params[i]))) return false;
                        const ret1 = func1.returnType;
                        const ret2 = func2.returnType;
                        if (ret1 && ret2) return this.isSameType(ret1, ret2);
                        return ret1 === ret2;

                    case 'ident':
                        const id1 = type1.getIdent()!;
                        const id2 = type2.getIdent()!;
                        return id1.name === id2.name;

                    default:
                        return false;
                }
            }

            isSameErrorType(type1: AST.TypeNode, type2: AST.TypeNode): boolean {
                // Resolve both to their base forms
                const resolved1 = this.resolveIdentifierType(type1);
                const resolved2 = this.resolveIdentifierType(type2);

                // CASE 1: Both are error sets - compare their members (IdentNode names)
                if (resolved1.isErrset() && resolved2.isErrset()) {
                    const set1 = resolved1.getErrset()!;
                    const set2 = resolved2.getErrset()!;

                    if (set1.members.length !== set2.members.length) return false;

                    const members1 = new Set(set1.members.map(m => m.name));
                    const members2 = new Set(set2.members.map(m => m.name));

                    for (const member of members1) {
                        if (!members2.has(member)) return false;
                    }
                    return true;
                }

                // CASE 2: Both are err primitives - compare their text values
                if (resolved1.isErr() && resolved2.isErr()) {
                    const prim1 = resolved1.getPrimitive();
                    const prim2 = resolved2.getPrimitive();
                    return prim1?.text === prim2?.text;
                }

                // CASE 3: Both are identifiers - compare names
                if (resolved1.isIdent() && resolved2.isIdent()) {
                    return resolved1.getIdent()!.name === resolved2.getIdent()!.name;
                }

                // Fall back to standard type comparison
                return this.isSameType(resolved1, resolved2);
            }

            isConstructorExpression(expr: AST.ExprNode): boolean {
                if (!expr.is('Primary')) return false;
                const primary = expr.getPrimary();
                if (!primary?.is('Object')) return false;
                const obj = primary.getObject();
                // Constructor has a type name: Point { x: 0, y: 0 }
                return obj?.ident !== null && obj?.ident !== undefined;
            }

            isLValueExpression(expr: AST.ExprNode): boolean {
                switch (expr.kind) {
                    case 'Primary': {
                        const primary = expr.getPrimary()!;

                        switch (primary.kind) {
                            case 'Ident':
                                // Variables are lvalues
                                return true;

                            case 'Literal':
                                // Literals are NOT lvalues
                                return false;

                            case 'Paren': {
                                // Check the inner expression
                                const paren = primary.getParen()!;
                                return paren.source ? this.isLValueExpression(paren.source) : false;
                            }

                            default:
                                // Tuples, objects, types are not lvalues
                                return false;
                        }
                    }

                    case 'Postfix': {
                        const postfix = expr.getPostfix()!;

                        switch (postfix.kind) {
                            case 'Dereference':
                                // ptr.* is an lvalue (points to memory)
                                return true;

                            case 'ArrayAccess':
                                // arr[i] is an lvalue (array element has memory)
                                return true;

                            case 'MemberAccess':
                                // obj.field is an lvalue (field has memory)
                                return true;

                            case 'Call':
                                // Function calls are NOT lvalues (return temporary values)
                                return false;

                            case 'Increment':
                            case 'Decrement':
                                // Post-increment/decrement return the OLD value (temporary)
                                return false;

                            default:
                                return false;
                        }
                    }

                    case 'Prefix': {
                        const prefix = expr.getPrefix()!;

                        switch (prefix.kind) {
                            case 'Reference':
                                // &ptr is an lvalue
                                return true;

                            case 'Increment':
                            case 'Decrement':
                                // Pre-increment/decrement modify and return the lvalue
                                return this.isLValueExpression(prefix.expr);

                            default:
                                // Unary +, -, !, ~ return temporary values
                                return false;
                        }
                    }

                    case 'Binary':
                    case 'As':
                    case 'Orelse':
                    case 'Range':
                    case 'Try':
                    case 'Catch':
                    case 'If':
                    case 'Match':
                    case 'Typeof':
                    case 'Sizeof':
                        // All of these return temporary values, not lvalues
                        return false;

                    default:
                        return false;
                }
            }

            isCharacterLiteral(expr: AST.ExprNode): boolean {
                if (!expr.is('Primary')) return false;
                const primary = expr.getPrimary();
                if (!primary?.is('Literal')) return false;
                const literal = primary.getLiteral();
                return literal?.kind === 'Character';
            }

            isBoolLiteral(expr: AST.ExprNode | undefined, value: boolean): boolean {
                if (!expr || !expr.is('Primary')) return false;

                const primary = expr.getPrimary();
                if (!primary?.is('Literal')) return false;

                const literal = primary.getLiteral();
                return literal?.kind === 'Bool' && literal.value === value;
            }

            isErrorExpression(expr: AST.ExprNode): boolean {
                // Check for member access (ErrorSet.Member)
                if (expr.is('Postfix')) {
                    const postfix = expr.getPostfix();
                    if (postfix?.kind === 'MemberAccess') {
                        const memberAccess = postfix.getMemberAccess()!;

                        // Check if base is an identifier that refers to an error set
                        if (memberAccess.base.is('Primary')) {
                            const primary = memberAccess.base.getPrimary();
                            if (primary?.is('Ident')) {
                                const ident = primary.getIdent()!;
                                const baseSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);

                                // Check if it's an error set or selferr
                                if (ident.name === 'selferr') return true;
                                if (baseSymbol?.type?.isErrset()) return true;
                                if (baseSymbol?.kind === SymbolKind.Definition && baseSymbol.type?.isErrset()) return true;
                            }
                        }
                        return true; // Assume member access might be error
                    }
                }

                // Check for direct identifier (might be error variable)
                if (expr.is('Primary')) {
                    const primary = expr.getPrimary();
                    if (primary?.is('Ident')) {
                        const ident = primary.getIdent()!;
                        const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);

                        // Check if it's an error variable or error type
                        if (symbol?.kind === SymbolKind.Variable && symbol.type?.isErr()) return true;
                        if (symbol?.kind === SymbolKind.Error) return true;
                        if (symbol?.type?.isErrset()) return true;
                    }
                }

                return false;
            }

            promoteNumericTypes(type1: AST.TypeNode, type2: AST.TypeNode, span?: AST.Span): AST.TypeNode {
                if (type1.isComptimeInt() && this.isNumericType(type2)) return type2;
                if (type2.isComptimeInt() && this.isNumericType(type1)) return type1;
                if (type1.isComptimeFloat() && type2.isFloat()) return type2;
                if (type2.isComptimeFloat() && type1.isFloat()) return type1;

                if (type1.isFloat() || type2.isFloat()) {
                    const width1 = type1.getWidth() ?? 32;
                    const width2 = type2.getWidth() ?? 32;
                    const maxWidth = Math.max(width1, width2);
                    return AST.TypeNode.asFloat(span, `f${maxWidth}`, maxWidth);
                }

                const width1 = type1.getWidth() ?? 32;
                const width2 = type2.getWidth() ?? 32;
                const maxWidth = Math.max(width1, width2);

                if (type1.isSigned() || type2.isSigned()) {
                    return AST.TypeNode.asSigned(span, `i${maxWidth}`, maxWidth);
                }

                return AST.TypeNode.asUnsigned(span, `u${maxWidth}`, maxWidth);
            }

            computeUnaryResultType(operandType: AST.TypeNode, isNegation: boolean, span?: AST.Span): AST.TypeNode {
                if (operandType.isComptimeInt()) {
                    const prim = operandType.getPrimitive();
                    const txtStr = prim?.text !== undefined ? String(prim.text) : 'cint';
                    const resultText = isNegation ?
                        (txtStr.startsWith('-') ? txtStr.slice(1) : `-${txtStr}`) : txtStr;
                    return AST.TypeNode.asComptimeInt(span, resultText);
                }

                if (operandType.isUnsigned() && isNegation) {
                    const width = operandType.getWidth() ?? 32;
                    return AST.TypeNode.asSigned(span, `i${width}`, width);
                }

                return operandType;
            }

            unwrapParenType(type: AST.TypeNode): AST.TypeNode {
                while (type.isParen()) {
                    type = type.getParen()!.type;
                }
                return type;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────── TYPE UTILITIES ──────────────────────────┐

            resolveIdentifierType(type: AST.TypeNode): AST.TypeNode {
                if (!type.isIdent()) return type;

                const ident = type.getIdent()!;
                if (ident.builtin) return type;

                const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                if (symbol && symbol.type) {
                    // RECURSIVELY resolve until we hit a non-identifier
                    return this.resolveIdentifierType(symbol.type);
                }

                return type;
            }

            resolveMemberOnUnwrappedType(
                type: AST.TypeNode,
                access: AST.MemberAccessNode,
                symbol?: Symbol | null,
                isStaticAccess: boolean = false
            ): AST.TypeNode | null {
                if (type.isStruct()) {
                    return this.resolveStructMember(type, access, symbol || null, isStaticAccess);
                }

                if (type.isEnum()) {
                    return this.resolveEnumMember(type, access);
                }

                if (type.isErrset()) {
                    return this.resolveEnumMember(type, access);
                }

                if (type.isOptional()) {
                    const inner = type.getOptional()!.target;
                    const result = this.resolveMemberOnUnwrappedType(inner, access, symbol, isStaticAccess);
                    return result ? AST.TypeNode.asOptional(access.span, result) : null;
                }

                return null;
            }

            resolveStructMember(
                structType: AST.TypeNode,
                access: AST.MemberAccessNode,
                baseSymbol: Symbol | null,
                isStaticAccess: boolean = false
            ): AST.TypeNode | null {
                const struct = structType.getStruct()!;
                const memberName = this.extractMemberName(access.target);
                if (!memberName) return null;

                let structScope: Scope | null = null;

                // PRIORITY 1: Use metadata scopeId (most reliable - unique per struct)
                if (struct.metadata?.scopeId !== undefined) {
                    try {
                        structScope = this.config.services.scopeManager.getScope(struct.metadata.scopeId as number);
                    } catch {
                        structScope = null;
                    }
                }

                // PRIORITY 2: Search by name only if metadata is missing
                if (!structScope && struct.name && struct.name !== 'Anonymous') {
                    // Search in CURRENT scope's children first (to find local Point, not imported Point)
                    const currentScope = this.config.services.scopeManager.getCurrentScope();
                    structScope = this.config.services.scopeManager.findChildScopeByNameFromId(
                        struct.name,
                        currentScope.id,
                        ScopeKind.Type
                    );

                    // Fall back to global search if not found locally
                    if (!structScope) {
                        structScope = this.config.services.scopeManager.findScopeByName(struct.name, ScopeKind.Type);
                    }
                }

                if (!structScope) {
                    this.reportError(
                        DiagCode.SYMBOL_NOT_FOUND,
                        `Cannot find scope for struct type`,
                        access.base.span
                    );
                    return null;
                }

                // Look up the member symbol from the struct scope (where visibility was collected)
                const memberSymbol = structScope.symbols.get(memberName);

                if (!memberSymbol) {
                    this.reportError(
                        DiagCode.SYMBOL_NOT_FOUND,
                        `Struct has no member '${memberName}'`,
                        access.target.span
                    );
                    return null;
                }

                // Check visibility using the COLLECTED symbol, not the AST
                if (memberSymbol.visibility.kind === 'Private') {
                    this.reportError(
                        DiagCode.SYMBOL_NOT_ACCESSIBLE,
                        `Cannot access private ${memberSymbol.kind === SymbolKind.Function ? 'method' : 'field'} '${memberName}' from outside struct`,
                        access.target.span
                    );
                    return null;
                }

                // Handle static vs instance access
                const isStaticField = memberSymbol.visibility.kind === 'Static';

                if (isStaticAccess && !isStaticField && memberSymbol.kind === SymbolKind.StructField) {
                    this.reportError(
                        DiagCode.INVALID_STATIC_ACCESS,
                        `Cannot access instance field '${memberName}' on type. Use an instance instead.`,
                        access.target.span
                    );
                    return null;
                }

                if (!isStaticAccess && isStaticField && memberSymbol.kind === SymbolKind.StructField) {
                    this.reportError(
                        DiagCode.INVALID_STATIC_ACCESS,
                        `Cannot access static field '${memberName}' on instance. Use '${struct.name}.${memberName}' instead.`,
                        access.target.span
                    );
                    return null;
                }

                return memberSymbol.type || null;
            }

            resolveEnumMember(enumType: AST.TypeNode, access: AST.MemberAccessNode): AST.TypeNode | null {
                const memberName = this.extractMemberName(access.target);
                if (!memberName) return null;

                // Handle enum types
                if (enumType.isEnum()) {
                    const enumDef = enumType.getEnum()!;
                    for (const variant of enumDef.variants) {
                        if (variant.ident.name === memberName) {
                            return variant.type || enumType;
                        }
                    }

                    // ADD THIS: Report error if variant not found
                    this.reportError(
                        DiagCode.SYMBOL_NOT_FOUND,
                        `Enum variant '${memberName}' not found`,
                        access.target.span
                    );
                    return null;
                }

                // Handle error types - use 'members' not 'variants'
                if (enumType.isErrset()) {
                    const errorType = enumType.getErrset()!;
                    for (const member of errorType.members) {
                        if (member.name === memberName) {
                            return AST.TypeNode.asIdentifier(member.span, member.name);
                        }
                    }

                    // ADD THIS: Report error if error member not found
                    this.reportError(
                        DiagCode.ERROR_MEMBER_NOT_FOUND,
                        `Error member '${memberName}' not found in error set`,
                        access.target.span
                    );
                    return null;
                }

                // Only report if we get here (neither enum nor errset matched)
                this.reportError(
                    DiagCode.SYMBOL_NOT_FOUND,
                    `${enumType.isErrset() ? 'Error set' : 'Enum'} has no variant '${memberName}'`,
                    access.target.span
                );
                return null;
            }

            resolveWildcardMemberAccess(
                access: AST.MemberAccessNode,
                wildcardSymbol: Symbol
            ): AST.TypeNode | null {
                const memberName = this.extractMemberName(access.target);
                if (!memberName) {
                    this.reportError(
                        DiagCode.INTERNAL_ERROR,
                        `Cannot extract member name from wildcard access`,
                        access.target.span
                    );
                    return null;
                }

                const targetModuleName = wildcardSymbol.importSource;
                if (!targetModuleName) {
                    this.reportError(
                        DiagCode.INTERNAL_ERROR,
                        `Wildcard import has no source module`,
                        access.span
                    );
                    return null;
                }

                // Find target module scope
                const targetModuleScope = this.typeValidator.findModuleScope(targetModuleName);
                if (!targetModuleScope) {
                    this.reportError(
                        DiagCode.MODULE_SCOPE_NOT_FOUND,
                        `Cannot find scope for module '${targetModuleName}'`,
                        access.span
                    );
                    return null;
                }

                // Look up the member in the target module
                const memberSymbol = targetModuleScope.symbols.get(memberName);
                if (!memberSymbol) {
                    // THIS IS THE ERROR THAT SHOULD FIRE
                    this.reportError(
                        DiagCode.SYMBOL_NOT_FOUND,
                        `Module '${targetModuleName}' has no exported symbol '${memberName}'`,
                        access.target.span
                    );
                    return null;
                }

                // Check if symbol is exported
                if (!memberSymbol.isExported) {
                    this.reportError(
                        DiagCode.SYMBOL_NOT_EXPORTED,
                        `Symbol '${memberName}' is not exported from module '${targetModuleName}'`,
                        access.target.span
                    );
                    return null;
                }

                // Mark as used
                memberSymbol.used = true;
                wildcardSymbol.used = true;

                // this.stats.memberAccessResolved++;

                return memberSymbol.type;
            }

            computeTypeSize(type: AST.TypeNode): number | null {
                // Resolve identifier types first
                const resolved = this.resolveIdentifierType(type);
                return this.typeValidator.ExpressionEvaluator.computeTypeSize(resolved);
            }

            arePointerTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean {
                // Use normalizeType instead of unwrapParenType
                const normalizedTarget = this.normalizeType(target);
                const normalizedSource = this.normalizeType(source);

                const targetPtr = normalizedTarget.getPointer()!;
                const sourcePtr = normalizedSource.getPointer()!;

                // Normalize the pointer targets as well
                const resolvedTargetBase = this.normalizeType(this.resolveIdentifierType(targetPtr.target));
                const resolvedSourceBase = this.normalizeType(this.resolveIdentifierType(sourcePtr.target));

                // Special handling for optional: *T -> *?T is allowed
                if (resolvedTargetBase.isOptional()) {
                    const targetInner = resolvedTargetBase.getOptional()!.target;
                    const innerCompatible = this.isSameType(targetInner, resolvedSourceBase);

                    if (!innerCompatible) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Cannot assign '${this.getTypeDisplayName(source)}' to variable of type '${this.getTypeDisplayName(target)}'`,
                            source.span
                        );
                        return false;
                    }
                } else {
                    const baseCompatible = this.isSameType(resolvedTargetBase, resolvedSourceBase);

                    if (!baseCompatible) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Cannot assign '${this.getTypeDisplayName(source)}' to variable of type '${this.getTypeDisplayName(target)}'`,
                            source.span
                        );
                        return false;
                    }
                }

                if (targetPtr.mutable && !sourcePtr.mutable) {
                    this.reportError(
                        DiagCode.MUTABILITY_MISMATCH,
                        `Cannot assign immutable pointer to mutable pointer variable`,
                        source.span
                    );
                    return false;
                }

                return true;
            }

            areTupleTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean {
                const targetTuple = target.getTuple()!;
                const sourceTuple = source.getTuple()!;

                if (targetTuple.fields.length !== sourceTuple.fields.length) {
                    return false;
                }

                for (let i = 0; i < targetTuple.fields.length; i++) {
                    if (!this.isTypeCompatible(targetTuple.fields[i], sourceTuple.fields[i])) {
                        return false;
                    }
                }

                return true;
            }

            areStructTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean {
                // NEW: Resolve identifiers first
                let resolvedTarget = target;
                let resolvedSource = source;

                if (target.isIdent()) {
                    const resolved = this.resolveIdentifierType(target);
                    if (resolved.isStruct()) {
                        resolvedTarget = resolved;
                    }
                }

                if (source.isIdent()) {
                    const resolved = this.resolveIdentifierType(source);
                    if (resolved.isStruct()) {
                        resolvedSource = resolved;
                    }
                }

                // Now check if both are structs after resolution
                if (!resolvedTarget.isStruct() || !resolvedSource.isStruct()) {
                    return false;
                }

                const targetStruct = resolvedTarget.getStruct()!;
                const sourceStruct = resolvedSource.getStruct()!;

                if (targetStruct.metadata?.scopeId !== undefined &&
                    sourceStruct.metadata?.scopeId !== undefined) {
                    return targetStruct.metadata.scopeId === sourceStruct.metadata.scopeId;
                }

                if (targetStruct.name && targetStruct.name !== 'Anonymous' &&
                    sourceStruct.name && sourceStruct.name !== 'Anonymous') {
                    return targetStruct.name === sourceStruct.name;
                }

                return this.areStructsStructurallyCompatible(targetStruct, sourceStruct);
            }

            areStructsStructurallyCompatible(
                target: AST.StructTypeNode,
                source: AST.StructTypeNode
            ): boolean {
                const targetFields = new Map<string, AST.FieldNode>();
                const sourceFields = new Map<string, AST.FieldNode>();

                for (const member of target.members) {
                    if (member.isField()) {
                        const field = member.getField()!;
                        targetFields.set(field.ident.name, field);
                    }
                }

                for (const member of source.members) {
                    if (member.isField()) {
                        const field = member.getField()!;
                        sourceFields.set(field.ident.name, field);
                    }
                }

                // Check size first
                if (targetFields.size !== sourceFields.size) {
                    return false;
                }

                // Check each field
                for (const [fieldName, targetField] of targetFields) {
                    const sourceField = sourceFields.get(fieldName);

                    if (!sourceField) {
                        return false;
                    }

                    // CRITICAL FIX: Both fields must have types
                    if (!targetField.type || !sourceField.type) {
                        return false;
                    }

                    // CRITICAL FIX: Use isTypeCompatible, not isSameType
                    // This allows i32 to match comptime_int, etc.
                    if (!this.isTypeCompatible(targetField.type, sourceField.type)) {
                        return false;
                    }
                }

                return true;
            }

            areNumericTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean {
                // Booleans are NOT numeric types
                if (source.isBool() || target.isBool()) {
                    return false;
                }

                // **CHECK COMPTIME FIRST - BEFORE ANY WIDTH CHECKS**
                if (source.isComptimeInt() || source.isComptimeFloat()) {
                    // Comptime integers to unsigned must be non-negative
                    if (source.isComptimeInt() && target.isUnsigned()) {
                        const prim = source.getPrimitive();
                        const txtStr = prim?.text !== undefined ? String(prim.text) : '0';
                        try {
                            const value = BigInt(txtStr);
                            if (value < BigInt(0)) {
                                return false;
                            }
                        } catch {
                            return false;
                        }
                    }

                    // All other comptime conversions are allowed
                    return true;
                }

                // **NOW CHECK NARROWING - ONLY FOR RUNTIME TYPES**
                const targetWidth = target.getWidth() ?? 64;
                const sourceWidth = source.getWidth() ?? 64;

                if (sourceWidth > targetWidth) {
                    return false; // Narrowing not allowed
                }

                return true;
            }

            areArrayTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean {
                const targetArray = target.getArray()!;
                const sourceArray = source.getArray()!;

                // Allow empty array to match any type
                if (sourceArray.target.isUndefined()) {
                    return true;
                }

                // Check element type compatibility
                if (!this.isTypeCompatible(targetArray.target, sourceArray.target)) {
                    return false;
                }

                // Check size compatibility (don't report error here - done in validateLetStmt)
                if (targetArray.size && sourceArray.size) {
                    const targetSize = this.typeValidator.ExpressionEvaluator.extractIntegerValue(targetArray.size);
                    const sourceSize = this.typeValidator.ExpressionEvaluator.extractIntegerValue(sourceArray.size);

                    if (targetSize !== undefined && sourceSize !== undefined) {
                        return targetSize === sourceSize;
                    }
                }

                return true;
            }

            doesObjectMatchStruct(obj: AST.ObjectNode, struct: AST.StructTypeNode): boolean {
                const structFields = new Map<string, AST.FieldNode>();

                for (const member of struct.members) {
                    if (member.isField()) {
                        const field = member.source as AST.FieldNode;
                        structFields.set(field.ident.name, field);
                    }
                }

                // Check if object has same fields (ignoring order)
                if (obj.props.length !== structFields.size) {
                    return false;
                }

                for (const prop of obj.props) {
                    const structField = structFields.get(prop.key.name);

                    if (!structField) {
                        return false; // Object has field not in struct
                    }

                    // Could add type compatibility check here if needed
                    if (prop.val && structField.type) {
                        const propType = this.inferExpressionType(prop.val);
                        if (propType && !this.isTypeCompatible(structField.type, propType)) {
                            return false;
                        }
                    }
                }

                return true;
            }

            getTypeDisplayName(type: AST.TypeNode): string {
                // Handle pointer types
                if (type.isPointer()) {
                    const ptr = type.getPointer()!;
                    const targetName = this.getTypeDisplayName(ptr.target);
                    return ptr.mutable ? `*mut ${targetName}` : `*${targetName}`;
                }

                // Handle optional types
                if (type.isOptional()) {
                    const opt = type.getOptional()!;
                    const targetName = this.getTypeDisplayName(opt.target);
                    return `?${targetName}`;
                }

                // Handle array types
                if (type.isArray()) {
                    const arr = type.getArray()!;
                    const targetName = this.getTypeDisplayName(arr.target);
                    // return `[${arr.size ? '...' : ''}]${targetName}`;
                    return `[]${targetName}`;
                }

                // Resolve identifier types first
                const resolved = this.resolveIdentifierType(type);

                // NEW: Handle slice type alias specially
                if (this.isStringType(resolved)) {
                    return 'slice';
                }

                // Check for struct with a name
                if (resolved.isStruct()) {
                    const struct = resolved.getStruct()!;
                    if (struct.name && struct.name !== 'Anonymous') {
                        return struct.name;
                    }
                    return 'struct';
                }

                // Check for enum with a name
                if (resolved.isEnum()) {
                    const enumType = resolved.getEnum()!;
                    if (enumType.name && enumType.name !== 'Anonymous') {
                        return enumType.name;
                    }
                    return 'enum';
                }

                // Check for identifier (type alias)
                if (type.isIdent()) {
                    return type.getIdent()!.name;
                }

                // Fall back to toString()
                return type.toString();
            }

            canConvertTypes(source: AST.TypeNode, target: AST.TypeNode): boolean {
                if (source.isIdent()) {
                    const sourceSymbol = this.config.services.scopeManager.lookupSymbol(source.getIdent()!.name);
                    if (sourceSymbol && sourceSymbol.type) {
                        source = sourceSymbol.type;
                    } else {
                        return false;
                    }
                }
                if (target.isIdent()) {
                    const targetSymbol = this.config.services.scopeManager.lookupSymbol(target.getIdent()!.name);
                    if (targetSymbol && targetSymbol.type) {
                        target = targetSymbol.type;
                    } else {
                        return false;
                    }
                }

                if (this.isSameType(source, target)) return true;

                if (this.isNumericType(source) && this.isNumericType(target)) return true;

                if (source.isComptimeInt() && this.isNumericType(target)) return true;
                if (source.isComptimeFloat() && target.isFloat()) return true;

                if (source.isPointer() && target.isPointer()) return true;

                if (this.isIntegerType(source) && target.isPointer()) return true;

                if (source.isEnum() && this.isIntegerType(target)) return true;

                return false;
            }

            getExpectedTypeFromContext(): AST.TypeNode | null {
                // Check if we're in a variable initialization
                const currentDecl = this.config.services.contextTracker.getCurrentDeclaration();
                if (currentDecl) {
                    const symbol = this.config.services.scopeManager.getSymbol(currentDecl.symbolId);
                    if (symbol && symbol.type) {
                        // Resolve type aliases (char -> u8, cpoint -> u21)
                        return this.resolveIdentifierType(symbol.type);
                    }
                }

                // Check if we're in a parameter initialization
                const exprContext = this.config.services.contextTracker.getCurrentExpressionContext();
                if (exprContext && exprContext.relatedSymbol !== undefined) {
                    const symbol = this.config.services.scopeManager.getSymbol(exprContext.relatedSymbol);
                    if (symbol && symbol.type) {
                        // Resolve type aliases (char -> u8, cpoint -> u21)
                        return this.resolveIdentifierType(symbol.type);
                    }
                }

                return null;
            }

            getExpressionMutability(expr: AST.ExprNode): 'Mutable' | 'Immutable' | 'Literal' | 'Unset' {
                // For identifiers, look up the symbol
                if (expr.is('Primary')) {
                    const primary = expr.getPrimary();
                    if (primary?.is('Ident')) {
                        const ident = primary.getIdent();
                        if (ident) {
                            const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                            if (symbol) {

                                // [] mut u8
                                if(symbol.type?.isArray()) {
                                    return symbol.type?.getArray()?.mutable ? 'Mutable' : 'Immutable';
                                }

                                // let mut ..
                                // return symbol.mutability.kind;
                            }
                        }
                    }

                    // String literals - special case (compatible with both)
                    if (primary?.is('Literal')) {
                        const literal = primary.getLiteral();
                        if (literal?.kind === 'String') {
                            return 'Literal';  // Changed from 'Immutable'
                        }
                    }
                }

                // For binary expressions (chained concatenation)
                if (expr.is('Binary')) {
                    const binary = expr.getBinary()!;
                    if (binary.kind === 'Additive' && binary.operator === '+') {
                        const leftMut = this.getExpressionMutability(binary.left);
                        const rightMut = this.getExpressionMutability(binary.right);

                        // Ignore literals - they're compatible with everything
                        if (leftMut === 'Literal') return rightMut;
                        if (rightMut === 'Literal') return leftMut;

                        // If mixing mutable and immutable variables, that's an error
                        if ((leftMut === 'Mutable') !== (rightMut === 'Mutable')) {
                            return 'Unset'; // Signal incompatibility
                        }

                        // Both same mutability
                        return leftMut;
                    }
                }

                // For member access (obj.field), check the field's mutability
                if (expr.is('Postfix')) {
                    const postfix = expr.getPostfix();
                    if (postfix?.kind === 'MemberAccess') {
                        const access = postfix.getMemberAccess()!;
                        const memberName = this.extractMemberName(access.target);

                        if (memberName) {
                            const baseType = this.inferExpressionType(access.base);
                            if (baseType) {
                                const resolvedBase = this.resolveIdentifierType(baseType);
                                if (resolvedBase.isStruct()) {
                                    const struct = resolvedBase.getStruct()!;
                                    const scopeId = struct.metadata?.scopeId as number | undefined;

                                    if (scopeId !== undefined) {
                                        const structScope = this.config.services.scopeManager.getScope(scopeId);
                                        const fieldSymbol = structScope.symbols.get(memberName);

                                        if (fieldSymbol) {
                                            return fieldSymbol.mutability.kind;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Cannot determine mutability - assume immutable (safest default)
                return 'Immutable';
            }

            normalizeType(type: AST.TypeNode): AST.TypeNode {
                // Unwrap all paren layers
                while (type.isParen()) {
                    type = type.getParen()!.type;
                }

                // Recursively normalize nested types
                switch (type.kind) {
                    case 'pointer': {
                        const ptr = type.getPointer()!;
                        const normalizedTarget = this.normalizeType(ptr.target);

                        // Only create new node if target changed
                        if (normalizedTarget !== ptr.target) {
                            return AST.TypeNode.asPointer(type.span, normalizedTarget, ptr.mutable);
                        }
                        return type;
                    }

                    case 'optional': {
                        const opt = type.getOptional()!;
                        const normalizedTarget = this.normalizeType(opt.target);

                        if (normalizedTarget !== opt.target) {
                            return AST.TypeNode.asOptional(type.span, normalizedTarget);
                        }
                        return type;
                    }

                    case 'array': {
                        const arr = type.getArray()!;
                        const normalizedTarget = this.normalizeType(arr.target);

                        if (normalizedTarget !== arr.target) {
                            return AST.TypeNode.asArray(type.span, normalizedTarget, arr.size);
                        }
                        return type;
                    }

                    case 'tuple': {
                        const tuple = type.getTuple()!;
                        const normalizedFields = tuple.fields.map(f => this.normalizeType(f));

                        // Check if any field changed
                        const hasChanges = normalizedFields.some((nf, i) => nf !== tuple.fields[i]);
                        if (hasChanges) {
                            return AST.TypeNode.asTuple(type.span, normalizedFields);
                        }
                        return type;
                    }

                    case 'function': {
                        const func = type.getFunction()!;
                        const normalizedParams = func.params.map(p => this.normalizeType(p));
                        const normalizedReturn = func.returnType ? this.normalizeType(func.returnType) : null;

                        const hasChanges = normalizedParams.some((np, i) => np !== func.params[i]) ||
                                        (normalizedReturn && normalizedReturn !== func.returnType);

                        if (hasChanges) {
                            return AST.TypeNode.asFunction(
                                type.span,
                                normalizedParams,
                                normalizedReturn || undefined
                            );
                        }
                        return type;
                    }

                    case 'union': {
                        const union = type.getUnion()!;
                        const normalizedTypes = union.types.map(t => this.normalizeType(t));

                        const hasChanges = normalizedTypes.some((nt, i) => nt !== union.types[i]);
                        if (hasChanges) {
                            return AST.TypeNode.asUnion(type.span, normalizedTypes);
                        }
                        return type;
                    }

                    default:
                        return type;
                }
            }

            extractMemberName(memberExpr: AST.ExprNode): string | null {
                switch (memberExpr.kind) {
                    case 'Primary': {
                        const src = memberExpr.getPrimary()!;
                        if (src.kind === 'Ident') {
                            return src.getIdent()!.name;
                        }
                        return null;
                    }

                    case 'Prefix': {
                        const src = memberExpr.getPrefix()!;
                        return this.extractMemberName(src.expr);
                    }

                    case 'Postfix': {
                        const src = memberExpr.getPostfix()!;

                        switch (src.kind) {
                            case 'MemberAccess': {
                                const access = src.getMemberAccess()!;
                                return this.extractMemberName(access.target);
                            }

                            case 'Call': {
                                const call = src.getCall()!;
                                return this.extractMemberName(call.base);
                            }

                            case 'ArrayAccess': {
                                const index = src.getArrayAccess()!;
                                return this.extractMemberName(index.base);
                            }

                            case 'Increment':
                            case 'Decrement':
                            case 'Dereference': {
                                return this.extractMemberName(src.getAsExprNode()!);
                            }

                            default:
                                return null;
                        }
                    }

                    case 'Binary':
                    case 'As':
                    case 'Orelse':
                    case 'Range':
                    case 'Try':
                    case 'Catch':
                    case 'If':
                    case 'Match':
                    case 'Typeof':
                    case 'Sizeof':
                        return null;

                    default:
                        this.log('verbose', `Cannot extract member name from expression kind: ${memberExpr.kind}`);
                        return null;
                }
            }

            isStaticMemberAccess(baseExpr: AST.ExprNode): boolean {
                if (!baseExpr.is('Primary')) return false;

                const primary = baseExpr.getPrimary();
                if (!primary?.is('Ident')) return false;

                const ident = primary.getIdent();
                if (!ident) return false;

                const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);

                // Static access if it's a type definition (not an instance)
                return symbol?.kind === SymbolKind.Definition;
            }

            findCallTargetSymbol(baseExpr: AST.ExprNode): Symbol | null {
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

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────── CACHE & UTILITIES ───────────────────────┐

            createCacheKey(expr: AST.ExprNode): string {
                const moduleName = this.config.services.contextTracker.getModuleName() || 'unknown';
                const span = expr.span || { start: 0, end: 0 };
                return `${moduleName}:${span.start}:${span.end}:${expr.kind}`;
            }

            cacheType(key: string, type: AST.TypeNode): void {
                if (this.typeValidator.typeCtx.typeCache.size >= this.CACHE_MAX_SIZE) {
                    const entries = Array.from(this.typeValidator.typeCtx.typeCache.entries());
                    const toKeep = entries.slice(-Math.floor(this.CACHE_MAX_SIZE / 2));
                    this.typeValidator.typeCtx.typeCache.clear();
                    toKeep.forEach(([k, v]) => this.typeValidator.typeCtx.typeCache.set(k, v));
                }

                this.typeValidator.typeCtx.typeCache.set(key, type || null);
            }

            log(kind: DebugKind, msg: string) {
                this.config.services.debugManager.log(kind, msg);
            }

            reportError(code: DiagCode, message: string, span?: AST.Span) {
                this.config.services.diagnosticManager.reportError(code, message, span);
            }

            reportWarning(code: DiagCode, message: string, span?: AST.Span) {
                this.config.services.diagnosticManager.reportWarning(code, message, span);
            }

        // └──────────────────────────────────────────────────────────────────────┘
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝