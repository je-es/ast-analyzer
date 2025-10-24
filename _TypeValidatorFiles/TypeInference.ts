// TypeInference.ts — Type inference logic for TypeValidator.
//
// Developed with ❤️ by Maysara.

// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST                     from '@je-es/ast';
    import { DiagCode }                 from '../../components/DiagnosticManager';
    import { AnalysisConfig }           from '../../ast-analyzer';
    import { Scope, Symbol, SymbolKind, ScopeKind }
                                        from '../../components/ScopeManager';
    import { ExpressionEvaluator }      from './ExpressionEvaluator';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝

// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface TypeInferenceContext {
        config: AnalysisConfig;
        ExpressionEvaluator: ExpressionEvaluator;
        reportError: (code: DiagCode, message: string, span?: AST.Span) => void;
        getTypeDisplayName: (type: AST.TypeNode) => string;
        isTypeCompatible: (target: AST.TypeNode, source: AST.TypeNode, sourceExpr?: AST.ExprNode) => boolean;
        isSameType: (type1: AST.TypeNode, type2: AST.TypeNode) => boolean;
        isNumericType: (type: AST.TypeNode) => boolean;
        isIntegerType: (type: AST.TypeNode) => boolean;
        isStringType: (type: AST.TypeNode) => boolean;
        isAnyType: (type: AST.TypeNode) => boolean;
        isErrorType: (type: AST.TypeNode) => boolean;
        isTypeType: (typeNode: AST.TypeNode) => boolean;
        isLValueExpression: (expr: AST.ExprNode) => boolean;
        isStaticMemberAccess: (baseExpr: AST.ExprNode) => boolean;
        isBuiltinFunction: (baseExpr: AST.ExprNode) => boolean;
        isBoolLiteral: (expr: AST.ExprNode | undefined, value: boolean) => boolean;
        isCharacterLiteral: (expr: AST.ExprNode) => boolean;
        validateCharacterLiteralCompatibility: (expr: AST.ExprNode, targetType: AST.TypeNode, context: string) => boolean;
        validateValueFitsInType: (expr: AST.ExprNode, targetType: AST.TypeNode) => void;
        validateMethodCallContext: (call: AST.CallNode, methodSymbol: Symbol, isStaticAccess: boolean, baseExpr: AST.ExprNode) => void;
        validateBuiltinCall: (call: AST.CallNode) => AST.TypeNode | null;
        validateStructMethodCall: (call: AST.CallNode, access: AST.MemberAccessNode, structType: AST.TypeNode) => AST.TypeNode | null;
        validateCallArgumentsWithContext: (call: AST.CallNode, funcType: AST.TypeNode) => AST.TypeNode | null;
        validateEnumVariantConstruction: (call: AST.CallNode, access: AST.MemberAccessNode, enumType: AST.TypeNode) => AST.TypeNode | null;
        validateMemberVisibility: (memberSymbol: Symbol, structScope: Scope, accessSpan: AST.Span) => void;
        validateMethodCall: (call: AST.CallNode, methodSymbol: Symbol, structScope: Scope, baseExpr: AST.ExprNode) => AST.TypeNode | null;
        validateStructConstruction: (objNode: AST.ObjectNode, structType: AST.TypeNode, initSpan: AST.Span) => boolean;
        validateArrayAssignment: (declaredType: AST.TypeNode, initType: AST.TypeNode, initSpan: AST.Span, contextName: string) => boolean;
        validateArrayLiteralWithTargetType: (initExpr: AST.ExprNode, targetType: AST.TypeNode, contextName: string) => boolean;
        validateSwitchExhaustiveness: (MatchNode: AST.MatchNode) => void;
        validateArraySize: (sizeExpr: AST.ExprNode) => void;
        validateComptimeExpression: (expr: AST.ExprNode, context: string) => bigint | null;
        validateIntegerRangeExpr: (expr: AST.ExprNode, rangeType: string, span: AST.Span) => void;
        extractSymbolFromExpression: (expr: AST.ExprNode) => Symbol | null;
        extractBuiltinName: (expr: AST.ExprNode) => string | null;
        extractMemberName: (memberExpr: AST.ExprNode) => string | null;
        extractEnumVariantName: (expr: AST.ExprNode) => string | null;
        extractTypeName: (typeNode: AST.TypeNode) => string | null;
        extractTypeFromInitializer: (expr: AST.ExprNode) => AST.TypeNode | null;
        resolveIdentifierType: (type: AST.TypeNode) => AST.TypeNode;
        normalizeType: (type: AST.TypeNode) => AST.TypeNode;
        findModuleScope: (moduleName: string) => Scope | null;
        findCallTargetSymbol: (baseExpr: AST.ExprNode) => Symbol | null;
        createCacheKey: (expr: AST.ExprNode) => string;
        cacheType: (key: string, type: AST.TypeNode) => void;
        typeCache: Map<string, AST.TypeNode | null>;
        inferenceStack: Set<string>;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝

// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class TypeInference {

        constructor(private ctx: TypeInferenceContext) {}

        // ┌──────────────────────────────── TYPE INFERENCE ────────────────────────────────┐

        inferExpressionType(expr: AST.ExprNode): AST.TypeNode | null {
            if (!expr) return null;

            // Check cache first
            const cacheKey = this.ctx.createCacheKey(expr);
            const cachedType = this.ctx.typeCache.get(cacheKey);
            if (cachedType !== undefined) {
                return cachedType;
            }

            // Check for circular inference
            if (this.ctx.inferenceStack.has(cacheKey)) {
                return null; // Avoid infinite recursion
            }

            this.ctx.inferenceStack.add(cacheKey);

            try {
                const result = this.performTypeInference(expr);
                this.ctx.cacheType(cacheKey, result!);
                return result;
            } finally {
                this.ctx.inferenceStack.delete(cacheKey);
            }
        }

        private performTypeInference(expr: AST.ExprNode): AST.TypeNode | null {
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
                    this.ctx.reportError(DiagCode.ANALYSIS_ERROR, `Unsupported expression type: ${expr.kind}`, expr.span);
                    return null;
            }
        }

        private inferPrimaryType(primary: AST.PrimaryNode): AST.TypeNode | null {
            switch (primary.kind) {
                case 'Literal':
                    return this.inferLiteralType(primary.getLiteral()!);
                case 'Ident':
                    return this.inferIdentifierType(primary.getIdent()!);
                case 'Object':
                    return this.inferObjectType(primary.getObject()!);
                case 'Tuple':
                    return this.inferTupleType(primary.getTuple()!);
                case 'Type':
                    return AST.TypeNode.asPrimitive(primary.span, 'type');
                default:
                    this.ctx.reportError(DiagCode.ANALYSIS_ERROR, `Unsupported primary type: ${primary.kind}`, primary.span);
                    return null;
            }
        }

        private inferLiteralType(literal: AST.LiteralNode): AST.TypeNode {
            switch (literal.kind) {
                case 'String':
                    const str = literal.value as string;
                    const sizeExpr = AST.ExprNode.asInteger(literal.span, str.length);
                    return AST.TypeNode.asArray(literal.span, AST.TypeNode.asUnsigned(literal.span, 'u8', 8), sizeExpr);

                case 'Integer':
                    return AST.TypeNode.asComptimeInt(literal.span, literal.value as string);

                case 'Float':
                    return AST.TypeNode.asComptimeFloat(literal.span, literal.value as string);

                case 'Character':
                    const charValue = literal.value as string;
                    if (charValue.length === 0) {
                        return AST.TypeNode.asUnsigned(literal.span, 'u8', 8);
                    }
                    const codePoint = charValue.codePointAt(0) || 0;
                    if (codePoint > 255) {
                        return AST.TypeNode.asUnsigned(literal.span, 'u21', 21);
                    } else {
                        return AST.TypeNode.asUnsigned(literal.span, 'u8', 8);
                    }

                case 'Bool':
                    return AST.TypeNode.asBool(literal.span);

                default:
                    this.ctx.reportError(DiagCode.ANALYSIS_ERROR, `Unsupported literal type: ${literal.kind}`, literal.span);
                    return AST.TypeNode.asPrimitive(literal.span, 'type');
            }
        }

        private inferIdentifierType(ident: AST.IdentNode): AST.TypeNode | null {
            const symbol = this.ctx.config.services.scopeManager.lookupSymbol(ident.name);
            if (!symbol) {
                this.ctx.reportError(DiagCode.SYMBOL_NOT_FOUND, `Undefined symbol '${ident.name}'`, ident.span);
                return null;
            }

            if (symbol.type) {
                return symbol.type;
            }

            // Handle type symbols
            if (symbol.kind === SymbolKind.Type) {
                return AST.TypeNode.asPrimitive(ident.span, 'type');
            }

            this.ctx.reportError(DiagCode.CANNOT_INFER_TYPE, `Cannot infer type for symbol '${ident.name}'`, ident.span);
            return null;
        }

        private inferObjectType(obj: AST.ObjectNode): AST.TypeNode | null {
            if (obj.ident) {
                // Constructor: Point { x: 0, y: 0 }
                const typeSymbol = this.ctx.config.services.scopeManager.lookupSymbol(obj.ident.name);
                if (!typeSymbol || !typeSymbol.type) {
                    this.ctx.reportError(DiagCode.SYMBOL_NOT_FOUND, `Type '${obj.ident.name}' not found`, obj.ident.span);
                    return null;
                }

                const structType = this.ctx.resolveIdentifierType(typeSymbol.type);
                if (!structType.isStruct()) {
                    this.ctx.reportError(DiagCode.TYPE_MISMATCH, `'${obj.ident.name}' is not a struct type`, obj.ident.span);
                    return null;
                }

                // Validate struct construction
                if (this.ctx.validateStructConstruction(obj, structType, obj.span)) {
                    return structType;
                }
                return null;
            } else {
                // Anonymous struct literal: { x: 0, y: 0 }
                const fields: AST.FieldNode[] = [];
                for (const prop of obj.props) {
                    const fieldType = this.inferExpressionType(prop.val!);
                    if (!fieldType) {
                        return null;
                    }
                    fields.push(AST.FieldNode.create(prop.key.span, { kind: 'Private' }, { kind: 'Runtime' }, { kind: 'Immutable' }, prop.key, fieldType));
                }
                return AST.TypeNode.asStruct(obj.span, [], 'Anonymous');
            }
        }

        private inferTupleType(tuple: AST.ExprTupleNode): AST.TypeNode | null {
            const fieldTypes: AST.TypeNode[] = [];
            for (const expr of tuple.fields) {
                const exprType = this.inferExpressionType(expr);
                if (!exprType) {
                    return null;
                }
                fieldTypes.push(exprType);
            }
            return AST.TypeNode.asTuple(tuple.span, fieldTypes);
        }

        private inferBinaryType(binary: AST.BinaryNode): AST.TypeNode | null {
            const leftType = this.inferExpressionType(binary.left);
            const rightType = this.inferExpressionType(binary.right);

            if (!leftType || !rightType) {
                return null;
            }

            switch (binary.kind) {
                case 'Assignment':
                    this.validateAssignment(binary);
                    return leftType;

                case 'Additive':
                case 'Multiplicative':
                    return this.promoteNumericTypes(leftType, rightType, binary.span);

                case 'Relational':
                case 'Equality':
                    return AST.TypeNode.asBool(binary.span);

                case 'Logical':
                    if (!leftType.isBool() || !rightType.isBool()) {
                        this.ctx.reportError(DiagCode.TYPE_MISMATCH, 'Logical operators require boolean operands', binary.span);
                        return null;
                    }
                    return AST.TypeNode.asBool(binary.span);

                default:
                    this.ctx.reportError(DiagCode.ANALYSIS_ERROR, `Unsupported binary operator: ${binary.kind}`, binary.span);
                    return null;
            }
        }

        private validateAssignment(binary: AST.BinaryNode): void {
            if (binary.kind !== 'Assignment') return;

            // Check for assignment through immutable pointer dereference
            if (binary.left.is('Postfix')) {
                const postfix = binary.left.getPostfix();
                if (postfix?.kind === 'Dereference') {
                    const ptrExpr = postfix.expr as AST.ExprNode;
                    const ptrType = this.inferExpressionType(ptrExpr);

                    if (ptrType) {
                        const normalizedPtrType = this.ctx.normalizeType(ptrType);

                        if (normalizedPtrType.isPointer()) {
                            const ptr = normalizedPtrType.getPointer()!;

                            if (!ptr.mutable) {
                                this.ctx.reportError(
                                    DiagCode.MUTABILITY_MISMATCH,
                                    `Cannot assign through immutable pointer. Declare as '*mut T' to allow mutation`,
                                    binary.left.span
                                );
                                return;
                            }
                        }
                    }
                }
            }

            const leftSymbol = this.ctx.extractSymbolFromExpression(binary.left);

            // Note: Mutability validation would be handled by the main TypeValidator
            // This is just type inference, so we skip mutability checks here

            // Type compatibility check
            const leftType = this.inferExpressionType(binary.left);
            const rightType = this.inferExpressionType(binary.right);

            if (leftType && rightType) {
                if (!this.ctx.isTypeCompatible(leftType, rightType, binary.right)) {
                    this.ctx.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot assign type '${this.ctx.getTypeDisplayName(rightType)}' to variable of type '${this.ctx.getTypeDisplayName(leftType)}'`,
                        binary.right.span
                    );
                }
            }
        }

        private inferPrefixType(prefix: AST.PrefixNode): AST.TypeNode | null {
            const operandType = this.inferExpressionType(prefix.expr);
            if (!operandType) return null;

            switch (prefix.kind) {
                case 'UnaryMinus':
                    return this.computeUnaryResultType(operandType, true, prefix.span);
                case 'LogicalNot':
                    if (!operandType.isBool()) {
                        this.ctx.reportError(DiagCode.TYPE_MISMATCH, 'Logical not requires boolean operand', prefix.span);
                        return null;
                    }
                    return AST.TypeNode.asBool(prefix.span);
                case 'Reference':
                    return AST.TypeNode.asPointer(prefix.span, operandType, false);
                default:
                    this.ctx.reportError(DiagCode.ANALYSIS_ERROR, `Unsupported prefix operator: ${prefix.kind}`, prefix.span);
                    return null;
            }
        }

        private inferPostfixType(postfix: AST.PostfixNode): AST.TypeNode | null {
            const baseType = this.inferExpressionType(postfix.expr as AST.ExprNode);
            if (!baseType) return null;

            switch (postfix.kind) {
                case 'Call':
                    return this.inferCallType(postfix.getCall()!);
                case 'ArrayAccess':
                    return this.inferArrayAccessType(postfix.getArrayAccess()!);
                case 'MemberAccess':
                    return this.inferMemberAccessType(postfix.getMemberAccess()!);
                case 'Dereference':
                    if (!baseType.isPointer()) {
                        this.ctx.reportError(DiagCode.TYPE_MISMATCH, 'Cannot dereference non-pointer type', postfix.span);
                        return null;
                    }
                    return baseType.getPointer()!.target;
                default:
                    this.ctx.reportError(DiagCode.ANALYSIS_ERROR, `Unsupported postfix operator: ${postfix.kind}`, postfix.span);
                    return null;
            }
        }

        private inferCallType(call: AST.CallNode): AST.TypeNode | null {
            const baseType = this.inferExpressionType(call.base);
            if (!baseType) return null;

            // Handle builtin functions
            if (this.ctx.isBuiltinFunction(call.base)) {
                return this.ctx.validateBuiltinCall(call);
            }

            // Handle method calls
            if (call.base.is('Postfix')) {
                const postfix = call.base.getPostfix();
                if (postfix?.kind === 'MemberAccess') {
                    const access = postfix.getMemberAccess()!;
                    const structType = this.inferExpressionType(access.base);
                    
                    if (structType && structType.isStruct()) {
                        return this.ctx.validateStructMethodCall(call, access, structType);
                    }
                    
                    if (structType && structType.isEnum()) {
                        return this.ctx.validateEnumVariantConstruction(call, access, structType);
                    }
                }
            }

            // Handle function calls
            if (baseType.isFunction()) {
                return this.ctx.validateCallArgumentsWithContext(call, baseType);
            }

            this.ctx.reportError(DiagCode.TYPE_MISMATCH, 'Cannot call non-function type', call.base.span);
            return null;
        }

        private inferArrayAccessType(access: AST.ArrayAccessNode): AST.TypeNode | null {
            const baseType = this.inferExpressionType(access.base);
            if (!baseType) return null;

            if (baseType.isArray()) {
                const arrayType = baseType.getArray()!;
                return arrayType.target;
            }

            if (baseType.isPointer()) {
                const ptrType = baseType.getPointer()!;
                return ptrType.target;
            }

            this.ctx.reportError(DiagCode.TYPE_MISMATCH, 'Cannot index non-array/non-pointer type', access.base.span);
            return null;
        }

        private inferMemberAccessType(access: AST.MemberAccessNode): AST.TypeNode | null {
            const baseType = this.inferExpressionType(access.base);
            if (!baseType) return null;

            const memberName = this.ctx.extractMemberName(access.target);
            if (!memberName) {
                this.ctx.reportError(DiagCode.SYMBOL_NOT_FOUND, 'Invalid member access', access.target.span);
                return null;
            }

            // Handle static member access
            if (this.ctx.isStaticMemberAccess(access.base)) {
                return this.resolveMemberOnUnwrappedType(baseType, access, null, true);
            }

            // Handle regular member access
            return this.resolveMemberOnUnwrappedType(baseType, access);
        }

        private resolveMemberOnUnwrappedType(
            type: AST.TypeNode,
            access: AST.MemberAccessNode,
            symbol?: Symbol | null | undefined,
            isStaticAccess: boolean = false
        ): AST.TypeNode | null {
            const resolvedType = this.ctx.resolveIdentifierType(type);

            if (resolvedType.isStruct()) {
                return this.resolveStructMember(resolvedType, access, symbol || null, isStaticAccess);
            }

            if (resolvedType.isEnum()) {
                return this.resolveEnumMember(resolvedType, access);
            }

            this.ctx.reportError(DiagCode.TYPE_MISMATCH, 'Cannot access member on non-struct/non-enum type', access.base.span);
            return null;
        }

        private resolveStructMember(
            structType: AST.TypeNode,
            access: AST.MemberAccessNode,
            baseSymbol: Symbol | null,
            isStaticAccess: boolean = false
        ): AST.TypeNode | null {
            const struct = structType.getStruct()!;
            const memberName = this.ctx.extractMemberName(access.target);
            if (!memberName) return null;

            // Find the member in the struct
            for (const member of struct.members) {
                if (member.isField()) {
                    const field = member.getField()!;
                    if (field.ident.name === memberName) {
                        // Check visibility
                        if (isStaticAccess && field.visibility.kind !== 'Static') {
                            this.ctx.reportError(
                                DiagCode.INVALID_STATIC_ACCESS,
                                `Cannot access non-static field '${memberName}' statically`,
                                access.target.span
                            );
                            return null;
                        }

                        if (!isStaticAccess && field.visibility.kind === 'Static') {
                            this.ctx.reportError(
                                DiagCode.INVALID_STATIC_ACCESS,
                                `Cannot access static field '${memberName}' non-statically`,
                                access.target.span
                            );
                            return null;
                        }

                        return field.type ?? null;
                    }
                }
            }

            this.ctx.reportError(DiagCode.SYMBOL_NOT_FOUND, `Struct has no field '${memberName}'`, access.target.span);
            return null;
        }

        private resolveEnumMember(enumType: AST.TypeNode, access: AST.MemberAccessNode): AST.TypeNode | null {
            const enumDef = enumType.getEnum()!;
            const memberName = this.ctx.extractMemberName(access.target);
            if (!memberName) return null;

            // Find the variant in the enum
            for (const variant of enumDef.variants) {
                if (variant.ident.name === memberName) {
                    return variant.type ?? AST.TypeNode.asPrimitive(access.target.span, 'type');
                }
            }

            this.ctx.reportError(DiagCode.SYMBOL_NOT_FOUND, `Enum has no variant '${memberName}'`, access.target.span);
            return null;
        }

        private inferAsType(asNode: AST.AsNode): AST.TypeNode | null {
            const exprType = this.inferExpressionType(asNode.base);
            if (!exprType) return null;

            // Validate the cast
            if (!this.ctx.isTypeCompatible(asNode.type, exprType)) {
                this.ctx.reportError(
                    DiagCode.TYPE_MISMATCH,
                    `Cannot cast from '${this.ctx.getTypeDisplayName(exprType)}' to '${this.ctx.getTypeDisplayName(asNode.type)}'`,
                    asNode.span
                );
                return null;
            }

            return asNode.type;
        }

        private inferOrelseType(orelse: AST.OrelseNode): AST.TypeNode | null {
            const leftType = this.inferExpressionType(orelse.left);
            const rightType = this.inferExpressionType(orelse.right);

            if (!leftType) return rightType;
            if (!rightType) return leftType;

            // Handle optional types
            if (leftType.isOptional()) {
                const unwrapped = leftType.getOptional()!.target;

                if (rightType.isOptional()) {
                    const rightUnwrapped = rightType.getOptional()!.target;

                    // Validate that T and U are compatible
                    if (!this.ctx.isTypeCompatible(unwrapped, rightUnwrapped)) {
                        this.ctx.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Cannot use type '${this.ctx.getTypeDisplayName(rightType)}' as fallback for '${this.ctx.getTypeDisplayName(leftType)}'`,
                            orelse.right.span
                        );
                    }

                    // Return the optional type (left side takes precedence)
                    return leftType; // ?T
                }

                // CASE 3: ?T ?? T -> T (unwrapped)
                // Example: ?i32 ?? 0 = i32
                if (!this.ctx.isTypeCompatible(unwrapped, rightType)) {
                    this.ctx.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot use type '${this.ctx.getTypeDisplayName(rightType)}' as fallback for '${this.ctx.getTypeDisplayName(leftType)}'`,
                        orelse.right.span
                    );
                }

                return unwrapped; // T
            }

            // Left is not optional, just return it
            return leftType;
        }

        private inferRangeType(range: AST.RangeNode): AST.TypeNode | null {
            if (range.leftExpr) {
                this.ctx.validateIntegerRangeExpr(range.leftExpr, 'start', range.leftExpr.span);
            }

            if (range.rightExpr) {
                this.ctx.validateIntegerRangeExpr(range.rightExpr, 'end', range.rightExpr.span);
            }

            return AST.TypeNode.asPrimitive(range.span, 'type');
        }

        private inferTryType(tryNode: AST.TryNode): AST.TypeNode | null {
            const exprType = this.inferExpressionType(tryNode.expr);
            if (!exprType) return null;
            return exprType;
        }

        private inferCatchType(catchNode: AST.CatchNode): AST.TypeNode | null {
            const leftType = this.inferExpressionType(catchNode.leftExpr);

            const exprScope = this.ctx.config.services.scopeManager.findChildScopeByName('expr', ScopeKind.Expression);
            if (exprScope) {
                this.ctx.config.services.contextTracker.withSavedState(() => {
                    this.ctx.config.services.scopeManager.withScope(exprScope.id, () => {
                        // Validate the catch block
                        if (catchNode.rightStmt) {
                            // This would need to be handled by the statement validator
                            // For now, just infer the type
                        }
                    });
                });
            }

            return leftType;
        }

        private inferIfType(ifNode: AST.IfNode): AST.TypeNode | null {
            const condType = this.inferExpressionType(ifNode.condExpr);
            if (condType && !condType.isBool()) {
                this.ctx.reportError(
                    DiagCode.TYPE_MISMATCH,
                    `If condition must be boolean, got '${this.ctx.getTypeDisplayName(condType)}'`,
                    ifNode.condExpr.span
                );
            }

            const thenType = this.inferExpressionType(ifNode.thenStmt as any);
            const elseType = ifNode.elseStmt ? this.inferExpressionType(ifNode.elseStmt as any) : null;

            if (!thenType) return elseType;
            if (!elseType) return thenType;

            // Both branches must have compatible types
            if (this.ctx.isTypeCompatible(thenType, elseType)) {
                return thenType;
            }

            this.ctx.reportError(
                DiagCode.TYPE_MISMATCH,
                `If branches have incompatible types: '${this.ctx.getTypeDisplayName(thenType)}' vs '${this.ctx.getTypeDisplayName(elseType)}'`,
                ifNode.span
            );
            return thenType;
        }

        private inferSwitchType(MatchNode: AST.MatchNode): AST.TypeNode | null {
            const condType = this.inferExpressionType(MatchNode.condExpr);
            if (!condType) return null;

            // Validate exhaustiveness
            this.ctx.validateSwitchExhaustiveness(MatchNode);

            // Infer type from all branches
            const branchTypes: AST.TypeNode[] = [];
            for (const branch of MatchNode.cases) {
                const branchType = this.inferExpressionType(branch.expr);
                if (branchType) {
                    branchTypes.push(branchType);
                }
            }

            if (branchTypes.length === 0) {
                return AST.TypeNode.asVoid(MatchNode.span);
            }

            // All branches must have compatible types
            const firstType = branchTypes[0];
            for (let i = 1; i < branchTypes.length; i++) {
                if (!this.ctx.isTypeCompatible(firstType, branchTypes[i])) {
                    this.ctx.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Switch branches have incompatible types: '${this.ctx.getTypeDisplayName(firstType)}' vs '${this.ctx.getTypeDisplayName(branchTypes[i])}'`,
                        MatchNode.span
                    );
                    return firstType;
                }
            }

            return firstType;
        }

        private promoteNumericTypes(type1: AST.TypeNode, type2: AST.TypeNode, span?: AST.Span): AST.TypeNode {
            if (type1.isComptimeInt() && this.ctx.isNumericType(type2)) return type2;
            if (type2.isComptimeInt() && this.ctx.isNumericType(type1)) return type1;
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

        private computeUnaryResultType(operandType: AST.TypeNode, isNegation: boolean, span?: AST.Span): AST.TypeNode {
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

        // └──────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
