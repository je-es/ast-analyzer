// TypeCompatibility.ts — Type compatibility and checking logic for TypeValidator.
//
// Developed with ❤️ by Maysara.

// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST                     from '@je-es/ast';
    import { DiagCode }                 from '../../components/DiagnosticManager';
    import { AnalysisConfig }           from '../../ast-analyzer';
    import { Scope, Symbol, SymbolKind, ScopeKind }
                                        from '../../components/ScopeManager';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝

// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface TypeCompatibilityContext {
        config: AnalysisConfig;
        reportError: (code: DiagCode, message: string, span?: AST.Span) => void;
        getTypeDisplayName: (type: AST.TypeNode) => string;
        resolveIdentifierType: (type: AST.TypeNode) => AST.TypeNode;
        normalizeType: (type: AST.TypeNode) => AST.TypeNode;
        unwrapParenType: (type: AST.TypeNode) => AST.TypeNode;
        isPointerDereference: (expr: AST.ExprNode) => boolean;
        isNumericType: (type: AST.TypeNode) => boolean;
        isAnyType: (type: AST.TypeNode) => boolean;
        isIntegerType: (type: AST.TypeNode) => boolean;
        isStringType: (type: AST.TypeNode) => boolean;
        isErrorType: (type: AST.TypeNode) => boolean;
        isTypeType: (typeNode: AST.TypeNode) => boolean;
        isSameType: (type1: AST.TypeNode, type2: AST.TypeNode) => boolean;
        arePointerTypesCompatible: (target: AST.TypeNode, source: AST.TypeNode) => boolean;
        areTupleTypesCompatible: (target: AST.TypeNode, source: AST.TypeNode) => boolean;
        areStructTypesCompatible: (target: AST.TypeNode, source: AST.TypeNode) => boolean;
        areStructsStructurallyCompatible: (target: AST.StructTypeNode, source: AST.StructTypeNode) => boolean;
        areNumericTypesCompatible: (target: AST.TypeNode, source: AST.TypeNode) => boolean;
        areArrayTypesCompatible: (target: AST.TypeNode, source: AST.TypeNode) => boolean;
        canConvertTypes: (source: AST.TypeNode, target: AST.TypeNode) => boolean;
        isValidThrowType: (thrownType: AST.TypeNode, functionErrorType: AST.TypeNode, span: AST.Span) => boolean;
        promoteNumericTypes: (type1: AST.TypeNode, type2: AST.TypeNode, span?: AST.Span) => AST.TypeNode;
        computeUnaryResultType: (operandType: AST.TypeNode, isNegation: boolean, span?: AST.Span) => AST.TypeNode;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝

// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class TypeCompatibility {

        constructor(private ctx: TypeCompatibilityContext) {}

        // ┌──────────────────────────────── TYPE COMPATIBILITY ────────────────────────────────┐

        isTypeCompatible(target: AST.TypeNode, source: AST.TypeNode, sourceExpr?: AST.ExprNode): boolean {
            // ⚠️ STRICT MODE: Pointer dereference requires EXACT type match
            if (sourceExpr && this.ctx.isPointerDereference(sourceExpr)) {
                const normalizedTarget = this.ctx.normalizeType(target);
                const normalizedSource = this.ctx.normalizeType(source);

                // For pointer dereference, only allow exact type match (no widening)
                if (!this.ctx.isSameType(normalizedTarget, normalizedSource)) {
                    return false;
                }
                // If types match exactly, continue with normal validation
            }

            // STEP 1: NORMALIZE BOTH TYPES (unwrap parens, etc.)
            const normalizedTarget = this.ctx.normalizeType(target);
            const normalizedSource = this.ctx.normalizeType(source);

            // STEP 2: RESOLVE IDENTIFIERS EARLY (Point -> struct, slice -> []u8, etc.)
            const resolvedTarget = this.ctx.resolveIdentifierType(normalizedTarget);
            const resolvedSource = this.ctx.resolveIdentifierType(normalizedSource);

            // STEP 3: QUICK CHECKS

            // 'any' accepts everything
            if (this.ctx.isAnyType(resolvedTarget)) return true;

            // Exact type match
            if (this.ctx.isSameType(resolvedTarget, resolvedSource)) return true;

            // STEP 4: ERROR TYPE HANDLING

            // 'err' primitive accepts any error type
            if (resolvedTarget.isErr() && this.ctx.isErrorType(resolvedSource)) {
                return true;
            }

            // Error set compatibility
            if (resolvedTarget.isErrset() && this.ctx.isErrorType(resolvedSource)) {
                return true;
            }

            // STEP 5: NUMERIC TYPE HANDLING

            // Bool is NOT compatible with numeric types
            if (resolvedSource.isBool() && this.ctx.isNumericType(resolvedTarget)) {
                return false;
            }

            // Numeric compatibility (i32 -> i64, comptime_int -> i32, etc.)
            if (this.ctx.isNumericType(resolvedTarget) && this.ctx.isNumericType(resolvedSource)) {
                return this.ctx.areNumericTypesCompatible(resolvedTarget, resolvedSource);
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

                    if (identMatch) return true;
                }

                // PRIORITY 2: Check RESOLVED source type
                return unionType.types.some((memberType: AST.TypeNode) =>
                    this.isTypeCompatible(memberType, resolvedSource)
                );
            }

            // Source is Union: check if ANY union member matches target
            if (resolvedSource.isUnion()) {
                const unionType = resolvedSource.getUnion()!;
                return unionType.types.some((memberType: AST.TypeNode) =>
                    this.isTypeCompatible(resolvedTarget, memberType)
                );
            }

            // STEP 7: POINTER TYPE HANDLING

            if (resolvedTarget.isPointer() && resolvedSource.isPointer()) {
                return this.ctx.arePointerTypesCompatible(resolvedTarget, resolvedSource);
            }

            // STEP 8: ARRAY TYPE HANDLING

            if (resolvedTarget.isArray() && resolvedSource.isArray()) {
                return this.ctx.areArrayTypesCompatible(resolvedTarget, resolvedSource);
            }

            // STEP 9: TUPLE TYPE HANDLING

            if (resolvedTarget.isTuple() && resolvedSource.isTuple()) {
                return this.ctx.areTupleTypesCompatible(resolvedTarget, resolvedSource);
            }

            // STEP 10: STRUCT TYPE HANDLING

            if (resolvedTarget.isStruct() && resolvedSource.isStruct()) {
                return this.ctx.areStructTypesCompatible(resolvedTarget, resolvedSource);
            }

            // STEP 11: OPTIONAL TYPE HANDLING

            // ?T <- T (wrapping)
            if (resolvedTarget.isOptional() && !resolvedSource.isOptional()) {
                const unwrappedTarget = resolvedTarget.getOptional()!.target;
                return this.isTypeCompatible(unwrappedTarget, resolvedSource);
            }

            // T <- ?T (unwrapping)
            if (!resolvedTarget.isOptional() && resolvedSource.isOptional()) {
                const unwrappedSource = resolvedSource.getOptional()!.target;
                return this.isTypeCompatible(resolvedTarget, unwrappedSource);
            }

            // ?T <- ?U (both optional)
            if (resolvedTarget.isOptional() && resolvedSource.isOptional()) {
                const unwrappedTarget = resolvedTarget.getOptional()!.target;
                const unwrappedSource = resolvedSource.getOptional()!.target;
                return this.isTypeCompatible(unwrappedTarget, unwrappedSource);
            }

            // STEP 12: FUNCTION TYPE HANDLING

            if (resolvedTarget.isFunction() && resolvedSource.isFunction()) {
                const targetFunc = resolvedTarget.getFunction()!;
                const sourceFunc = resolvedSource.getFunction()!;

                // Parameter count must match
                if (targetFunc.params.length !== sourceFunc.params.length) {
                    return false;
                }

                // All parameters must be compatible
                for (let i = 0; i < targetFunc.params.length; i++) {
                    if (!this.isTypeCompatible(targetFunc.params[i], sourceFunc.params[i])) {
                        return false;
                    }
                }

                // Return types must be compatible
                if (targetFunc.returnType && sourceFunc.returnType) {
                    return this.isTypeCompatible(targetFunc.returnType, sourceFunc.returnType);
                }

                return targetFunc.returnType === sourceFunc.returnType;
            }

            // STEP 13: TYPE CONVERSION HANDLING

            if (this.ctx.canConvertTypes(resolvedSource, resolvedTarget)) {
                return true;
            }

            // STEP 14: NO MATCH
            return false;
        }

        // Type checking utilities
        isNumericType(type: AST.TypeNode): boolean {
            if (this.ctx.isTypeType(type)) return false;
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
                const symbol = this.ctx.config.services.scopeManager.lookupSymbol(ident.name);
                
                if (symbol?.kind === SymbolKind.Error || symbol?.type?.isErrset()) {
                    return true;
                }
                
                // Check all scopes for error symbols
                return this.ctx.config.services.scopeManager.getAllScopes()
                    .some(scope => scope.symbols.get(ident.name)?.kind === SymbolKind.Error);
            }
            
            return false;
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

        arePointerTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean {
            const targetPtr = target.getPointer()!;
            const sourcePtr = source.getPointer()!;

            // Check mutability compatibility
            if (targetPtr.mutable && !sourcePtr.mutable) {
                this.ctx.reportError(
                    DiagCode.MUTABILITY_MISMATCH,
                    `Cannot assign immutable pointer to mutable pointer variable`,
                    source.span
                );
                return false;
            }

            // Check target type compatibility
            const resolvedTargetBase = this.ctx.resolveIdentifierType(targetPtr.target);
            const resolvedSourceBase = this.ctx.resolveIdentifierType(sourcePtr.target);

            if (resolvedTargetBase.isIdent() && resolvedSourceBase.isIdent()) {
                const targetIdent = resolvedTargetBase.getIdent()!;
                const sourceIdent = resolvedSourceBase.getIdent()!;

                if (targetIdent.name === sourceIdent.name) {
                    return true;
                }
            } else {
                const baseCompatible = this.isSameType(resolvedTargetBase, resolvedSourceBase);

                if (!baseCompatible) {
                    this.ctx.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot assign '${this.ctx.getTypeDisplayName(source)}' to variable of type '${this.ctx.getTypeDisplayName(target)}'`,
                        source.span
                    );
                    return false;
                }
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
                const resolved = this.ctx.resolveIdentifierType(target);
                if (resolved.isStruct()) {
                    resolvedTarget = resolved;
                }
            }

            if (source.isIdent()) {
                const resolved = this.ctx.resolveIdentifierType(source);
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

            return this.ctx.areStructsStructurallyCompatible(targetStruct, sourceStruct);
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

            // Check if all target fields exist in source
            for (const [fieldName, targetField] of targetFields) {
                const sourceField = sourceFields.get(fieldName);
                if (!sourceField) {
                    return false;
                }

                if (sourceField.type && targetField.type) {
                    if (!this.isTypeCompatible(targetField.type, sourceField.type)) {
                        return false;
                    }
                }
            }

            return true;
        }

        areNumericTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean {
            // Comptime types are compatible with any numeric type
            if (target.isComptimeInt() || target.isComptimeFloat()) return true;
            if (source.isComptimeInt() || source.isComptimeFloat()) return true;

            // Same numeric type
            if (target.kind === source.kind) {
                const targetWidth = target.getWidth() ?? 32;
                const sourceWidth = source.getWidth() ?? 32;
                return targetWidth <= sourceWidth; // Narrowing is allowed
            }

            // Float to float
            if (target.isFloat() && source.isFloat()) {
                const targetWidth = target.getWidth() ?? 32;
                const sourceWidth = source.getWidth() ?? 32;
                return targetWidth <= sourceWidth;
            }

            // Integer to integer
            if (this.ctx.isIntegerType(target) && this.ctx.isIntegerType(source)) {
                const targetWidth = target.getWidth() ?? 32;
                const sourceWidth = source.getWidth() ?? 32;
                return targetWidth <= sourceWidth;
            }

            // Integer to float (with width check)
            if (target.isFloat() && this.ctx.isIntegerType(source)) {
                const targetWidth = target.getWidth() ?? 32;
                const sourceWidth = source.getWidth() ?? 32;
                return targetWidth >= sourceWidth;
            }

            return false;
        }

        areArrayTypesCompatible(target: AST.TypeNode, source: AST.TypeNode): boolean {
            const targetArray = target.getArray()!;
            const sourceArray = source.getArray()!;

            // Check element type compatibility
            if (!this.isTypeCompatible(targetArray.target, sourceArray.target)) {
                return false;
            }

            // Check size compatibility (if both have sizes)
            if (targetArray.size && sourceArray.size) {
                // For now, just check if both have sizes - actual size validation would be more complex
                return true;
            }

            return true;
        }

        canConvertTypes(source: AST.TypeNode, target: AST.TypeNode): boolean {
            // String literal to array
            if (target.isArray() && source.isArray()) {
                const targetArray = target.getArray()!;
                const sourceArray = source.getArray()!;
                
                if (targetArray.target.isUnsigned() && sourceArray.target.isUnsigned()) {
                    return targetArray.target.getWidth() === sourceArray.target.getWidth();
                }
            }

            return false;
        }

        isValidThrowType(thrownType: AST.TypeNode, functionErrorType: AST.TypeNode, span: AST.Span): boolean {
            // Check if thrown type is compatible with function error type
            if (this.isTypeCompatible(functionErrorType, thrownType)) {
                return true;
            }

            // Check if thrown type is a member of the function's error set
            if (functionErrorType.isErrset()) {
                const errorSet = functionErrorType.getErrset()!;
                for (const errorMember of errorSet.members) {
                    // For now, just check if both are error types
                    if (this.ctx.isErrorType(thrownType) && this.ctx.isErrorType(AST.TypeNode.asIdentifier(thrownType.span, errorMember.name))) {
                        return true;
                    }
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

        // └──────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
