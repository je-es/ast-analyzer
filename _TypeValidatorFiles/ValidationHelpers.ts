// ValidationHelpers.ts — Common validation utilities for TypeValidator.
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

    export interface ValidationHelpersContext {
        config: AnalysisConfig;
        ExpressionEvaluator: ExpressionEvaluator;
        reportError: (code: DiagCode, message: string, span?: AST.Span) => void;
        inferExpressionType: (expr: AST.ExprNode) => AST.TypeNode | null;
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

    export class ValidationHelpers {

        constructor(private ctx: ValidationHelpersContext) {}

        // ┌──────────────────────────────── VALIDATION HELPERS ────────────────────────────────┐

        // Common validation helpers
        validateTypeCompatibility(
            target: AST.TypeNode, 
            source: AST.TypeNode, 
            context: string, 
            span: AST.Span,
            sourceExpr?: AST.ExprNode
        ): boolean {
            if (this.ctx.isTypeCompatible(target, source, sourceExpr)) {
                return true;
            }
            
            this.ctx.reportError(
                DiagCode.TYPE_MISMATCH,
                `Cannot assign type '${this.ctx.getTypeDisplayName(source)}' to ${context} of type '${this.ctx.getTypeDisplayName(target)}'`,
                span
            );
            return false;
        }

        validateEnumVariantAssignment(
            variant: any, 
            memberName: string, 
            span: AST.Span
        ): void {
            if (variant.type) {
                this.ctx.reportError(
                    DiagCode.TYPE_MISMATCH,
                    `Enum variant '${memberName}' requires a value of type '${this.ctx.getTypeDisplayName(variant.type)}'. Use '${memberName}(value)' syntax.`,
                    span
                );
            }
        }

        validateFunctionScope(stmt: any, stmtType: string): boolean {
            const isInFunction = this.isInsideFunctionScope();
            if (!isInFunction) {
                this.ctx.reportError(
                    DiagCode.ANALYSIS_ERROR,
                    `${stmtType} statement outside of function`,
                    stmt.span
                );
            }
            return isInFunction;
        }

        validateComptimeExpression(expr: AST.ExprNode, context: string): bigint | null {
            const errorCountBefore = this.ctx.config.services.diagnosticManager.length();
            const comptimeValue = this.ctx.ExpressionEvaluator.evaluateComptimeExpression(expr);
            const errorCountAfter = this.ctx.config.services.diagnosticManager.length();
            
            if (errorCountAfter > errorCountBefore) {
                return null; // Errors already reported
            }
            
            if (comptimeValue === null) {
                this.ctx.reportError(
                    DiagCode.TYPE_MISMATCH,
                    `${context} must be a compile-time constant expression. Use literals, comptime functions, or compile-time arithmetic.`,
                    expr.span
                );
                return null;
            }
            
            return comptimeValue;
        }

        validateMutabilityAssignment(leftSymbol: Symbol, leftExpr: AST.ExprNode): boolean {
            // Check if trying to assign to static field
            if (leftSymbol.kind === SymbolKind.StructField && leftSymbol.visibility.kind === 'Static') {
                this.ctx.reportError(
                    DiagCode.MUTABILITY_MISMATCH,
                    `Cannot assign to static field '${leftSymbol.name}'. Static fields are immutable.`,
                    leftExpr.span
                );
                return false;
            }

            // Check if the LEFT SIDE SYMBOL is immutable
            if (leftSymbol.mutability.kind === 'Immutable') {
                let symbolType = 'variable';
                if (leftSymbol.kind === SymbolKind.Parameter) {
                    symbolType = 'parameter';
                } else if (leftSymbol.kind === SymbolKind.StructField) {
                    symbolType = 'field';
                }

                this.ctx.reportError(
                    DiagCode.MUTABILITY_MISMATCH,
                    `Cannot assign to immutable ${symbolType} '${leftSymbol.name}'`,
                    leftExpr.span
                );
                return false;
            }

            return true;
        }

        validateIntegerRangeExpr(expr: AST.ExprNode, rangeType: string, span: AST.Span): void {
            const exprType = this.ctx.inferExpressionType(expr);
            if (exprType && !this.ctx.isIntegerType(exprType)) {
                this.ctx.reportError(
                    DiagCode.TYPE_MISMATCH,
                    `Range ${rangeType} must be integer type, got '${this.ctx.getTypeDisplayName(exprType)}'`,
                    span
                );
                return;
            }
            
            const comptimeValue = this.validateComptimeExpression(expr, rangeType);
            if (comptimeValue !== null && comptimeValue <= 0) {
                this.ctx.reportError(
                    DiagCode.TYPE_MISMATCH,
                    `${rangeType} must be positive, got ${comptimeValue}`,
                    span
                );
            }
        }

        validateArraySize(sizeExpr: AST.ExprNode): void {
            const exprType = this.ctx.inferExpressionType(sizeExpr);
            if (exprType && !this.ctx.isIntegerType(exprType)) {
                this.ctx.reportError(
                    DiagCode.TYPE_MISMATCH,
                    `Array size expression must be an integer type, got '${this.ctx.getTypeDisplayName(exprType)}'`,
                    sizeExpr.span
                );
                return;
            }
            
            const comptimeValue = this.validateComptimeExpression(sizeExpr, 'Array size');
            if (comptimeValue !== null && comptimeValue <= 0) {
                this.ctx.reportError(
                    DiagCode.TYPE_MISMATCH,
                    `Array size must be positive, got ${comptimeValue}`,
                    sizeExpr.span
                );
            }
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

        isTypeType(typeNode: AST.TypeNode): boolean {
            return typeNode.isPrimitive() && typeNode.getPrimitive()?.kind === 'type';
        }

        isLValueExpression(expr: AST.ExprNode): boolean {
            switch (expr.kind) {
                case 'Primary':
                    const primary = expr.getPrimary();
                    if (primary?.is('Ident')) {
                        const symbol = this.ctx.extractSymbolFromExpression(expr);
                        return symbol !== null && symbol.mutability.kind === 'Mutable';
                    }
                    return false;

                case 'Postfix':
                    const postfix = expr.getPostfix();
                    if (postfix?.kind === 'Dereference') {
                        return true; // *ptr is always an lvalue
                    }
                    if (postfix?.kind === 'MemberAccess') {
                        const access = postfix.getMemberAccess()!;
                        const baseType = this.inferExpressionType(access.base);
                        if (baseType && baseType.isPointer()) {
                            return true; // ptr.field is an lvalue
                        }
                    }
                    if (postfix?.kind === 'ArrayAccess') {
                        return true; // array[index] is always an lvalue
                    }
                    return false;

                default:
                    return false;
            }
        }

        isStaticMemberAccess(baseExpr: AST.ExprNode): boolean {
            if (baseExpr.is('Primary')) {
                const primary = baseExpr.getPrimary();
                if (primary?.is('Ident')) {
                    const symbol = this.ctx.config.services.scopeManager.lookupSymbol(primary.getIdent()!.name);
                    return symbol?.kind === SymbolKind.Type || false;
                }
            }
            return false;
        }

        isBuiltinFunction(baseExpr: AST.ExprNode): boolean {
            if (baseExpr.is('Primary')) {
                const primary = baseExpr.getPrimary();
                if (primary?.is('Ident')) {
                    const ident = primary.getIdent()!;
                    return ident.name.startsWith('@');
                }
            }
            return false;
        }

        isBoolLiteral(expr: AST.ExprNode | undefined, value: boolean): boolean {
            if (!expr || !expr.is('Primary')) return false;

            const primary = expr.getPrimary();
            if (!primary?.is('Literal')) return false;

            const literal = primary.getLiteral();
            return literal?.kind === 'Bool' && literal.value === value;
        }

        isCharacterLiteral(expr: AST.ExprNode): boolean {
            if (!expr.is('Primary')) return false;
            const primary = expr.getPrimary();
            if (!primary?.is('Literal')) return false;
            const literal = primary.getLiteral();
            return literal?.kind === 'Character';
        }

        validateCharacterLiteralCompatibility(
            expr: AST.ExprNode,
            targetType: AST.TypeNode,
            context: string
        ): boolean {
            if (!this.isCharacterLiteral(expr)) {
                return false;
            }

            const charValue = expr.getPrimary()!.getLiteral()!.value as string;
            
            if (charValue.length === 0) {
                this.ctx.reportError(
                    DiagCode.TYPE_MISMATCH,
                    `Empty character literal cannot be used in ${context}`,
                    expr.span
                );
                return false;
            }

            const codePoint = charValue.codePointAt(0) || 0;

            if (targetType.isUnsigned()) {
                const width = targetType.getWidth() ?? 8;
                if (width === 8 && codePoint > 255) {
                    this.ctx.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Character '${charValue}' (U+${codePoint.toString(16).toUpperCase()}) cannot fit in u8. Use u21 for Unicode characters.`,
                        expr.span
                    );
                    return false;
                }
                if (width === 21 && codePoint > 0x10FFFF) {
                    this.ctx.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Character '${charValue}' (U+${codePoint.toString(16).toUpperCase()}) is not a valid Unicode code point.`,
                        expr.span
                    );
                    return false;
                }
            }

            return true;
        }

        validateValueFitsInType(expr: AST.ExprNode, targetType: AST.TypeNode): void {
            if (this.isCharacterLiteral(expr)) {
                this.validateCharacterLiteralCompatibility(expr, targetType, 'assignment');
            }
        }

        // Expression analysis utilities
        extractSymbolFromExpression(expr: AST.ExprNode): Symbol | null {
            if (expr.is('Primary')) {
                const primary = expr.getPrimary();
                if (primary?.is('Ident')) {
                    const ident = primary.getIdent();
                    if (ident) {
                        return this.ctx.config.services.scopeManager.lookupSymbol(ident.name);
                    }
                }
            }
            return null;
        }

        extractBuiltinName(expr: AST.ExprNode): string | null {
            if (expr.kind !== 'Primary') return null;
            const primary = expr.getPrimary();
            if (!primary || primary.kind !== 'Ident') return null;
            const ident = primary.getIdent();
            return (ident?.name ? '@'+ident.name : null) || null;
        }

        extractMemberName(memberExpr: AST.ExprNode): string | null {
            switch (memberExpr.kind) {
                case 'Primary':
                    const primary = memberExpr.getPrimary();
                    if (primary?.is('Ident')) {
                        return primary.getIdent()!.name;
                    }
                    break;
                case 'Postfix':
                    const postfix = memberExpr.getPostfix();
                    if (postfix?.kind === 'MemberAccess') {
                        return this.extractMemberName(postfix.getMemberAccess()!.target);
                    }
                    break;
            }
            return null;
        }

        extractEnumVariantName(expr: AST.ExprNode): string | null {
            if (expr.is('Primary')) {
                const primary = expr.getPrimary();
                if (primary?.is('Ident')) {
                    return primary.getIdent()!.name;
                }
            }
            return null;
        }

        extractTypeName(typeNode: AST.TypeNode): string | null {
            if (typeNode.isIdent()) {
                return typeNode.getIdent()!.name;
            }
            return null;
        }

        extractTypeFromInitializer(expr: AST.ExprNode): AST.TypeNode | null {
            if (expr.kind !== 'Primary') return null;

            const primary = expr.getPrimary();
            if (!primary || primary.kind !== 'Type') return null;

            return primary.getType();
        }

        // Type resolution utilities
        resolveIdentifierType(type: AST.TypeNode): AST.TypeNode {
            if (!type.isIdent()) return type;

            const ident = type.getIdent()!;
            const symbol = this.ctx.config.services.scopeManager.lookupSymbol(ident.name);

            if (symbol && symbol.type) {
                return symbol.type;
            }

            return type;
        }

        normalizeType(type: AST.TypeNode): AST.TypeNode {
            let current = type;
            while (current.isParen()) {
                current = current.getParen()!.type;
            }
            return current;
        }

        unwrapParenType(type: AST.TypeNode): AST.TypeNode {
            while (type.isParen()) {
                type = type.getParen()!.type;
            }
            return type;
        }

        // Scope utilities
        findModuleScope(moduleName: string): Scope | null {
            return this.ctx.config.services.scopeManager.findScopeByName(moduleName);
        }

        findCallTargetSymbol(baseExpr: AST.ExprNode): Symbol | null {
            if (baseExpr.is('Primary')) {
                const primary = baseExpr.getPrimary();
                if (primary?.is('Ident')) {
                    return this.ctx.config.services.scopeManager.lookupSymbol(primary.getIdent()!.name);
                }
            }
            return null;
        }

        isInsideFunctionScope(): boolean {
            const currentScope = this.ctx.config.services.scopeManager.getCurrentScope();
            let scope: Scope | null = currentScope;
            while (scope) {
                if (scope.kind === ScopeKind.Function) {
                    return true;
                }
                scope = this.ctx.config.services.scopeManager.getScopeParent(scope.id);
            }
            return false;
        }

        // Cache utilities
        createCacheKey(expr: AST.ExprNode): string {
            return `${expr.kind}:${expr.span.start}:${expr.span.end}`;
        }

        cacheType(key: string, type: AST.TypeNode): void {
            if (this.ctx.typeCache.size >= 10000) {
                // Clear cache if it gets too large
                this.ctx.typeCache.clear();
            }
            this.ctx.typeCache.set(key, type);
        }

        // Type inference helper
        inferExpressionType(expr: AST.ExprNode): AST.TypeNode | null {
            // This would be implemented by the TypeInference class
            // For now, return null as this is just a helper
            return null;
        }

        // └──────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
