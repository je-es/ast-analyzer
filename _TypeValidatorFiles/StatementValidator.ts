// StatementValidator.ts — Statement validation logic for TypeValidator.
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

    export interface StatementValidatorContext {
        config: AnalysisConfig;
        ExpressionEvaluator: ExpressionEvaluator;
        reportError: (code: DiagCode, message: string, span?: AST.Span) => void;
        inferExpressionType: (expr: AST.ExprNode) => AST.TypeNode | null;
        validateTypeCompatibility: (target: AST.TypeNode, source: AST.TypeNode, context: string, span: AST.Span, sourceExpr?: AST.ExprNode) => boolean;
        validateEnumVariantAssignment: (variant: any, memberName: string, span: AST.Span) => void;
        validateFunctionScope: (stmt: any, stmtType: string) => boolean;
        validateComptimeExpression: (expr: AST.ExprNode, context: string) => bigint | null;
        validateMutabilityAssignment: (leftSymbol: Symbol, leftExpr: AST.ExprNode) => boolean;
        validateArrayLiteralWithTargetType: (initExpr: AST.ExprNode, targetType: AST.TypeNode, contextName: string) => boolean;
        validateArrayAssignment: (declaredType: AST.TypeNode, initType: AST.TypeNode, initSpan: AST.Span, contextName: string) => boolean;
        validateTypeAssignment: (sourceExpr: AST.ExprNode, targetType: AST.TypeNode, context: string) => boolean;
        validateThrowExpression: (throwExpr: AST.ExprNode, functionErrorType: AST.TypeNode, span: AST.Span) => void;
        validateThrowType: (thrownType: AST.TypeNode, functionErrorType: AST.TypeNode, throwExpr: AST.ExprNode, span: AST.Span) => void;
        isErrorExpression: (expr: AST.ExprNode) => boolean;
        isValidErrorExpression: (expr: AST.ExprNode, expectedType: AST.TypeNode) => boolean;
        isSameErrorType: (type1: AST.TypeNode, type2: AST.TypeNode) => boolean;
        getCurrentFunctionSymbol: () => Symbol | null;
        extractErrorMemberName: (thrownExpr: AST.ExprNode) => string | null;
        getCurrentFunctionErrorType: () => AST.TypeNode | null;
        isConstructorExpression: (expr: AST.ExprNode) => boolean;
        isPointerDereference: (expr: AST.ExprNode) => boolean;
        extractSymbolFromExpression: (expr: AST.ExprNode) => Symbol | null;
        getTypeDisplayName: (type: AST.TypeNode) => string;
        extractMemberName: (memberExpr: AST.ExprNode) => string | null;
        resolveTypeNode: (typeNode: AST.TypeNode) => void;
        resolveIdentifierType: (type: AST.TypeNode) => AST.TypeNode;
        isInsideFunctionScope: () => boolean;
        currentFunctionReturnType: AST.TypeNode | null;
        hasReturnStatement: boolean;
        currentFunctionErrorType: AST.TypeNode | null;
        hasThrowStatement: boolean;
        currentIsStaticMethod: boolean;
        currentStructScope: Scope | null;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝

// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class StatementValidator {

        constructor(private ctx: StatementValidatorContext) {}

        // ┌──────────────────────────────── STATEMENT VALIDATION ────────────────────────────────┐

        validateStmt(stmt: AST.StmtNode, currentScope?: Scope, moduleName?: string): void {
            if(!currentScope) { currentScope = this.ctx.config.services.scopeManager.getCurrentScope(); }
            if (!stmt) {
                this.ctx.reportError(DiagCode.ANALYSIS_ERROR, 'Found null statement during validation');
                return;
            }

            try {
                switch (stmt.kind) {
                    case 'Block':
                        this.handleBlockStmt(stmt.getBlock()!, currentScope, moduleName);
                        break;
                    case 'Test':
                        this.handleTestStmt(stmt.getTest()!, currentScope, moduleName);
                        break;
                    case 'Def':
                        this.handleDefStmt(stmt.getDef()!, currentScope, moduleName);
                        break;
                    case 'Let':
                        this.handleLetStmt(stmt.getLet()!, currentScope, moduleName);
                        break;
                    case 'Func':
                        this.handleFuncStmt(stmt.getFunc()!, currentScope, moduleName);
                        break;
                    case 'For':
                    case 'While':
                    case 'Do':
                        this.handleLoopStmt(stmt.getLoop()!, currentScope, moduleName);
                        break;
                    case 'Return':
                    case 'Break':
                    case 'Continue':
                    case 'Defer':
                    case 'Throw':
                        this.handleControlflowStmt(stmt.getCtrlflow()!, currentScope, moduleName);
                        break;
                    default:
                        this.ctx.reportError(DiagCode.ANALYSIS_ERROR, `Unsupported statement type: ${stmt.kind}`, stmt.span);
                }
            } catch (error) {
                this.ctx.reportError(
                    DiagCode.ANALYSIS_ERROR,
                    `Failed to validate ${stmt.kind} statement: ${error}`,
                    stmt.span
                );
            }
        }

        private handleBlockStmt(blockNode: AST.BlockStmtNode, scope?: Scope, moduleName?: string): void {
            this.validateBlockStmt(blockNode);
        }

        private validateBlockStmt(block: AST.BlockStmtNode, scope?: Scope, moduleName?: string): void {
            for (const stmt of block.stmts) {
                this.validateStmt(stmt);
            }
        }

        private handleTestStmt(testNode: AST.TestStmtNode, scope: Scope, moduleName?: string): void {
            // Test statements are handled by the test runner, not type validation
            // Just validate the test block
            this.validateBlockStmt(testNode.block);
        }

        private handleDefStmt(defNode: AST.DefStmtNode, scope?: Scope, moduleName?: string): void {
            this.validateDefStmt(defNode);
        }

        private validateDefStmt(defNode: AST.DefStmtNode): void {
            // Def statements define types, not values
            // Type validation happens during symbol resolution
            if (defNode.type) {
                this.ctx.resolveTypeNode(defNode.type);
            }
        }

        private handleLetStmt(letNode: AST.LetStmtNode, scope?: Scope, moduleName?: string): void {
            this.validateLetStmt(letNode);
        }

        private validateLetStmt(letNode: AST.LetStmtNode): void {
            // Validate visibility
            if (letNode.field.visibility.kind === 'Static') {
                if (this.ctx.currentStructScope?.kind !== ScopeKind.Type) {
                    this.ctx.reportError(
                        DiagCode.INVALID_VISIBILITY,
                        `Variable '${letNode.field.ident.name}' cannot be 'static' outside of struct/enum`,
                        letNode.field.ident.span
                    );
                    return;
                }
            }

            // Resolve type if present
            if (letNode.field.type) {
                this.ctx.resolveTypeNode(letNode.field.type);
            }

            // Validate initializer
            if (letNode.field.initializer) {
                // Special handling for array literals with explicit type
                if (letNode.field.type && letNode.field.type.isArray()) {
                    this.ctx.validateArrayLiteralWithTargetType(
                        letNode.field.initializer,
                        letNode.field.type,
                        letNode.field.ident.name
                    );
                    return;
                }

                const initType = this.ctx.inferExpressionType(letNode.field.initializer);

                if (letNode.field.type && initType) {
                    // Check if initializer is an enum variant that requires a value
                    if (letNode.field.initializer.is('Postfix')) {
                        const postfix = letNode.field.initializer.getPostfix();
                        if (postfix?.kind === 'MemberAccess') {
                            const access = postfix.getMemberAccess();
                            const baseExpr = access.base;
                            const baseType = this.ctx.inferExpressionType(baseExpr);

                            if (baseType) {
                                const resolvedBase = this.ctx.resolveIdentifierType(baseType);
                                if (resolvedBase.isEnum()) {
                                    const memberName = this.ctx.extractMemberName(access.target);
                                    const enumDef = resolvedBase.getEnum()!;
                                    const variant = enumDef.variants.find((v: any) => v.ident.name === memberName);

                                    if (variant && variant.type && memberName) {
                                        this.ctx.validateEnumVariantAssignment(variant, memberName, letNode.field.initializer.span);
                                        return;
                                    }
                                }
                            }
                        }
                    }

                    // PASS SOURCE EXPRESSION for strict pointer checking
                    this.ctx.validateTypeCompatibility(
                        letNode.field.type, 
                        initType, 
                        'variable', 
                        letNode.field.initializer!.span,
                        letNode.field.initializer
                    );
                }
            } else if (!letNode.field.type) {
                this.ctx.reportError(
                    DiagCode.CANNOT_INFER_TYPE,
                    `Variable '${letNode.field.ident.name}' requires explicit type or initializer`,
                    letNode.field.span
                );
            }
        }

        private handleFuncStmt(funcNode: AST.FuncStmtNode, scope?: Scope, moduleName?: string): void {
            this.validateFuncStmt(funcNode);
        }

        private validateFuncStmt(funcNode: AST.FuncStmtNode): void {
            const funcSymbol = this.ctx.config.services.scopeManager.lookupSymbol(funcNode.ident.name);
            if (!funcSymbol) {
                this.ctx.reportError(
                    DiagCode.CANNOT_INFER_TYPE,
                    `Function '${funcNode.ident.name}' symbol not found`,
                    funcNode.span
                );
                return;
            }

            // Set function context
            this.ctx.currentFunctionReturnType = funcSymbol.type?.isFunction() ? funcSymbol.type.getFunction()!.returnType ?? null : null;
            this.ctx.hasReturnStatement = false;
            this.ctx.currentFunctionErrorType = funcSymbol.type?.isFunction() ? funcSymbol.type.getFunction()!.errorType ?? null : null;
            this.ctx.hasThrowStatement = false;
            this.ctx.currentIsStaticMethod = funcSymbol.visibility.kind === 'Static';
            this.ctx.currentStructScope = null; // TODO: Find parent scope

            // Validate parameters
            if (funcNode.parameters) {
                for (const param of funcNode.parameters) {
                    this.validateParameter(param);
                }
            }

            // Validate function body
            if (funcNode.body) {
                this.validateStmt(funcNode.body);
            }

            // Check return statement requirements
            if (this.ctx.currentFunctionReturnType && !this.ctx.currentFunctionReturnType.isVoid()) {
                const hasErrorType = this.ctx.currentFunctionErrorType !== null;
                if (!hasErrorType || !this.ctx.hasThrowStatement) {
                    if (!this.ctx.hasReturnStatement) {
                        this.ctx.reportError(
                            DiagCode.MISSING_RETURN_STATEMENT,
                            `Function '${funcNode.ident.name}' with non-void return type must have at least one return statement`,
                            funcNode.ident.span
                        );
                    }
                }
            }
        }

        private validateParameter(paramNode: AST.FieldNode): void {
            // Validate parameter visibility
            if (paramNode.visibility.kind === 'Static') {
                this.ctx.reportError(
                    DiagCode.INVALID_VISIBILITY,
                    `Parameter '${paramNode.ident.name}' cannot be 'static'`,
                    paramNode.ident.span
                );
                return;
            } else if (paramNode.visibility.kind === 'Public') {
                this.ctx.reportError(
                    DiagCode.INVALID_VISIBILITY,
                    `Parameter '${paramNode.ident.name}' cannot be 'public'`,
                    paramNode.ident.span
                );
                return;
            }

            // Resolve parameter type
            if (paramNode.type) {
                this.ctx.resolveTypeNode(paramNode.type);
            } else {
                this.ctx.reportError(
                    DiagCode.CANNOT_INFER_TYPE,
                    `Cannot infer type for parameter '${paramNode.ident.name}'`,
                    paramNode.span
                );
                return;
            }

            // Validate parameter initializer
            if (paramNode.initializer) {
                // Special handling for array literals with explicit type
                if (paramNode.type && paramNode.type.isArray()) {
                    this.ctx.validateArrayLiteralWithTargetType(
                        paramNode.initializer,
                        paramNode.type,
                        paramNode.ident.name
                    );
                    return;
                }

                const initType = this.ctx.inferExpressionType(paramNode.initializer);

                if (paramNode.type && initType) {
                    // Check if initializer is an enum variant that requires a value
                    if (paramNode.initializer.is('Postfix')) {
                        const postfix = paramNode.initializer.getPostfix();
                        if (postfix?.kind === 'MemberAccess') {
                            const access = postfix.getMemberAccess();
                            const baseExpr = access.base;
                            const baseType = this.ctx.inferExpressionType(baseExpr);

                            if (baseType) {
                                const resolvedBase = this.ctx.resolveIdentifierType(baseType);
                                if (resolvedBase.isEnum()) {
                                    const memberName = this.ctx.extractMemberName(access.target);
                                    const enumDef = resolvedBase.getEnum()!;
                                    const variant = enumDef.variants.find((v: any) => v.ident.name === memberName);

                                    if (variant && variant.type && memberName) {
                                        this.ctx.validateEnumVariantAssignment(variant, memberName, paramNode.initializer.span);
                                        return;
                                    }
                                }
                            }
                        }
                    }

                    // PASS SOURCE EXPRESSION for strict pointer checking
                    this.ctx.validateTypeCompatibility(
                        paramNode.type, 
                        initType, 
                        'parameter', 
                        paramNode.initializer.span,
                        paramNode.initializer
                    );
                }
            }

            // Handle self parameter resolution
            if (paramNode.ident.name === 'self' && this.ctx.currentStructScope) {
                this.resolveSelfParameter(this.ctx.config.services.scopeManager.getCurrentScope(), this.ctx.currentStructScope);
            }
        }

        private resolveSelfParameter(funcScope: Scope, structScope: Scope): void {
            const selfSymbol = this.ctx.config.services.scopeManager.lookupSymbol('self');
            if (selfSymbol && selfSymbol.type) {
                const typeIdent = selfSymbol.type.isIdent() ? selfSymbol.type.getIdent() : null;
                if (typeIdent) {
                    if (typeIdent.name !== structScope.name) {
                        this.ctx.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Self type mismatch: expected '${structScope.name}', got '${typeIdent.name}'`,
                            selfSymbol.contextSpan
                        );
                    }
                }
            }
        }

        private handleLoopStmt(loopStmt: AST.LoopStmtNode, scope?: Scope, moduleName?: string): void {
            this.validateLoopStmt(loopStmt);
        }

        private validateLoopStmt(loopStmt: AST.LoopStmtNode): void {
            // Validate loop condition
            if (loopStmt.expr) {
                const condType = this.ctx.inferExpressionType(loopStmt.expr);
                if (condType && !condType.isBool()) {
                    this.ctx.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Loop condition must be boolean, got '${this.ctx.getTypeDisplayName(condType)}'`,
                        loopStmt.expr.span
                    );
                }
            }

            // Validate loop body
            if (loopStmt.stmt) {
                this.validateStmt(loopStmt.stmt);
            }
        }

        private handleControlflowStmt(controlFlowStmt: AST.ControlFlowStmtNode, scope?: Scope, moduleName?: string): void {
            switch (controlFlowStmt.kind) {
                case 'return':
                    this.validateReturnStmt(controlFlowStmt);
                    break;
                case 'defer':
                    this.validateDeferStmt(controlFlowStmt);
                    break;
                case 'throw':
                    this.validateThrowStmt(controlFlowStmt);
                    break;
                default:
                    this.ctx.reportError(DiagCode.ANALYSIS_ERROR, `Unsupported control flow statement: ${controlFlowStmt.kind}`, controlFlowStmt.span);
            }
        }

        private validateReturnStmt(returnNode: AST.ControlFlowStmtNode): void {
            const isInFunction = this.ctx.isInsideFunctionScope();
            
            if (returnNode.value) {
                const returnType = this.ctx.inferExpressionType(returnNode.value);

                if (!returnType && this.ctx.config.services.diagnosticManager.hasErrors()) {
                    return;
                }

                if (returnType && this.ctx.currentFunctionReturnType) {
                    if (!this.ctx.validateTypeCompatibility(this.ctx.currentFunctionReturnType, returnType, 'return', returnNode.value.span, returnNode.value)) {
                        return;
                    }
                } else if (!isInFunction) {
                    this.ctx.validateFunctionScope(returnNode, 'Return');
                }
            } else {
                if (isInFunction && this.ctx.currentFunctionReturnType && !this.ctx.currentFunctionReturnType.isVoid()) {
                    this.ctx.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Function expects return type '${this.ctx.getTypeDisplayName(this.ctx.currentFunctionReturnType)}' but got void return`,
                        returnNode.span
                    );
                } else if (!isInFunction) {
                    this.ctx.validateFunctionScope(returnNode, 'Return');
                }
            }

            this.ctx.hasReturnStatement = true;
        }

        private isConstructorExpression(expr: AST.ExprNode): boolean {
            if (!expr.is('Primary')) return false;
            const primary = expr.getPrimary();
            if (!primary?.is('Object')) return false;
            const obj = primary.getObject();
            // Constructor has a type name: Point { x: 0, y: 0 }
            return obj?.ident !== null && obj?.ident !== undefined;
        }

        private validateDeferStmt(deferNode: AST.ControlFlowStmtNode): void {
            if (deferNode.value) {
                this.ctx.inferExpressionType(deferNode.value);
            }
            this.ctx.validateFunctionScope(deferNode, 'Defer');
        }

        private validateThrowStmt(throwNode: AST.ControlFlowStmtNode): void {
            this.ctx.hasThrowStatement = true;

            // Check if we're in a function scope
            if (!this.ctx.validateFunctionScope(throwNode, 'Throw')) {
                return;
            }

            // Get the current function's error type
            const functionErrorType = this.ctx.getCurrentFunctionErrorType();

            if (!functionErrorType) {
                this.ctx.reportError(
                    DiagCode.THROW_WITHOUT_ERROR_TYPE,
                    `Cannot throw error in function without error type. Add '!ErrorType' to function signature`,
                    throwNode.span
                );
                return;
            }

            if (throwNode.value) {
                this.ctx.validateThrowExpression(throwNode.value, functionErrorType, throwNode.span);
            } else {
                this.ctx.reportError(
                    DiagCode.ANALYSIS_ERROR,
                    `Throw statement must have an error value`,
                    throwNode.span
                );
            }
        }

        // └──────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
