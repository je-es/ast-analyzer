// TypeValidator.ts — Type validation Phase.
//
// Developed with ❤️ by Maysara.



// ╔═══════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST                     from '@je-es/ast';
    import { AnalysisPhase }            from '../../components/ContextTracker';
    import { DiagCode }                 from '../../components/DiagnosticManager';
    import { PhaseBase }                from '../../interfaces/PhaseBase';
    import { AnalysisConfig }           from '../../ast-analyzer';
    import { Scope, Symbol, SymbolKind, ScopeKind }
                                        from '../../components/ScopeManager';
    import { ExpressionEvaluator }      from './ExpressionEvaluator';
    import { TypeInference }            from './TypeInference';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔═══════════════════════════════════════ TYPES ═══════════════════════════════════════╗

    interface TypeValidatorContext {
        currentModule               : string;
        moduleStack                 : string[];
        typeCache                   : Map<string, AST.TypeNode | null>;
    }

    interface TypeValidationStats {
        modulesProcessed            : number;
        typesInferred               : number;
        typesCached                 : number;
        compatibilityChecks         : number;
        callsValidated              : number;
        memberAccessValidated       : number;
        assignmentsValidated        : number;
        returnsValidated            : number;
        errors                      : number;
        startTime                   : number;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔═══════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class TypeValidator extends PhaseBase {

        // ┌──────────────────────────────── INIT ─────────────────────────────────┐

            stats                        : TypeValidationStats   = this.initStats();

            typeCtx                      : TypeValidatorContext  = this.initTypeValidatorContext();
            ExpressionEvaluator          : ExpressionEvaluator;
            typeInference                : TypeInference;

            circularTypeDetectionStack  : Set<string>           = new Set();

            currentFunctionReturnType   : AST.TypeNode | null   = null;
            hasReturnStatement          : boolean               = false;

            currentFunctionErrorType    : AST.TypeNode | null   = null;
            hasThrowStatement           : boolean               = false;
            currentIsStaticMethod       : boolean               = false;
            currentStructScope          : Scope | null          = null;

            constructor( config : AnalysisConfig ) {
                super(AnalysisPhase.TypeValidation, config);

                this.ExpressionEvaluator = new ExpressionEvaluator(this.config);
                this.typeInference = new TypeInference(this.config, this);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ─────────────────────────────────┐

            handle(): boolean {
                try {
                    this.log('verbose', 'Starting symbol validation phase...');
                    this.stats.startTime = Date.now();

                    if (!this.init()) return false;
                    if (!this.validateAllModules()) return false;

                    this.logStatistics();
                    return !this.config.services.diagnosticManager.hasErrors();

                } catch (error) {
                    this.log('errors', `Fatal error during type validation: ${error}`);
                    this.reportError(DiagCode.INTERNAL_ERROR, `Fatal error during type validation: ${error}`);
                    return false;
                }
            }

            reset(): void {
                this.typeInference.inferenceStack.clear();
                this.circularTypeDetectionStack.clear();
                this.stats          = this.initStats();
                this.typeCtx        = this.initTypeValidatorContext();
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌────────────────────────── [1] Program Level ─────────────────────────┐

            validateAllModules(): boolean {
                this.log('verbose', 'Validating types from all modules...');
                const globalScope = this.config.services.scopeManager.getCurrentScope();

                for (const [moduleName, module] of this.config.program!.modules) {
                    this.config.services.contextTracker.pushContextSpan({ start: 0, end: 0 });
                    try {
                        if (!this.validateModule(moduleName, module, globalScope)) {
                            this.log('errors', `Failed to validate module ${moduleName}, continuing...`);
                        }
                        this.stats.modulesProcessed++;
                    } finally {
                        this.config.services.contextTracker.popContextSpan();
                    }
                }

                return true;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌────────────────────────── [2] Module Level ──────────────────────────┐

            validateModule(moduleName: string, module: AST.Module, parentScope: Scope): boolean {
                this.log('symbols', `Validating module '${moduleName}'`);

                try {
                    this.config.services.contextTracker.setModuleName(moduleName);

                    if (typeof module.metadata?.path === 'string') {
                        this.config.services.contextTracker.setModulePath(module.metadata.path);
                    }

                    this.enterModuleContext(moduleName, module);

                    const moduleScope = this.findModuleScope(moduleName);
                    if (!moduleScope) {
                        this.reportError(DiagCode.MODULE_SCOPE_NOT_FOUND, `Module scope for '${moduleName}' not found`);
                        return false;
                    }

                    this.config.services.scopeManager.setCurrentScope(moduleScope.id);
                    this.config.services.contextTracker.setScope(moduleScope.id);

                    for (const statement of module.statements) {
                        this.validateStmt(statement, moduleScope, moduleName);
                    }

                    this.exitModuleContext();
                    return true;
                } catch (error) {
                    this.reportError(DiagCode.INTERNAL_ERROR, `Failed to validate module '${moduleName}': ${error}`);
                    return false;
                }
            }

             enterModuleContext(moduleName: string, module: AST.Module): void {
                this.typeCtx.moduleStack.push(this.typeCtx.currentModule);
                this.typeCtx.currentModule = moduleName;
                this.config.services.contextTracker.setModuleName(moduleName);
                if (typeof module.metadata?.path === 'string') {
                    this.config.services.contextTracker.setModulePath(module.metadata.path);
                }
            }

            exitModuleContext(): void {
                const previousModule = this.typeCtx.moduleStack.pop();
                this.typeCtx.currentModule = previousModule || '';
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── [3] Stmt Level ───────────────────────────┐

            validateStmt(stmt: AST.StmtNode, currentScope?: Scope, moduleName?: string): void {
                if(!currentScope) { currentScope = this.config.services.scopeManager.getCurrentScope(); }
                if (!stmt) {
                    this.reportError(DiagCode.ANALYSIS_ERROR, 'Found null statement during validation');
                    return;
                }

                this.log('verbose', `Validating ${stmt.kind} statement`);

                this.config.services.contextTracker.pushContextSpan(stmt.span);

                try {
                    this.config.services.scopeManager.withScope(currentScope.id, () => {
                        this.config.services.contextTracker.withSavedState(() => {
                            this.config.services.contextTracker.setScope(currentScope.id);
                            this.processStmtByKind(stmt, {
                                'section'   : (n) => this.validateSectionStmt(n, currentScope, moduleName),
                                'block'     : (n) => this.validateBlockStmt(n, currentScope, moduleName),
                                'test'      : (n) => this.handleTestStmt(n, currentScope, moduleName),
                                'def'       : (n) => this.handleDefStmt(n, currentScope, moduleName),
                                'let'       : (n) => this.handleLetStmt(n, currentScope, moduleName),
                                'func'      : (n) => this.handleFuncStmt(n, currentScope, moduleName),

                                'expression': (n) => {
                                    const expr = stmt.getExpr()!;

                                    // Check for unreachable expressions
                                    this.validateUnreachableExpression(expr);

                                    if (expr.kind === 'binary') {
                                        const binary = expr.getBinary();

                                        if (binary && binary.kind === 'assignment') {
                                            this.validateAssignment(binary);
                                        }
                                    }

                                    this.typeInference.inferExpressionType(expr);
                                },

                                'while'     : (n) => this.validateWhileStmt(n),
                                'do'        : (n) => this.validateDoStmt(n),
                                'for'       : (n) => this.validateForStmt(n),

                                'return'    : (n) => this.validateReturnStmt(n),
                                'defer'     : (n) => this.validateDeferStmt(n),
                                'throw'     : (n) => this.validateThrowStmt(n),
                            });
                        });
                    });
                } catch (error) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `Failed to validate ${stmt.kind} statement: ${error}`,
                        stmt.span
                    );
                } finally {
                    this.config.services.contextTracker.popContextSpan();
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────── [3.1] BLOCK ─────────────────────────────┐

            validateBlockStmt(block: AST.BlockStmtNode, scope?: Scope, moduleName?: string): void {
                this.log('symbols', 'Validating block');

                const blockScope = this.config.services.scopeManager.findChildScopeByName('block', ScopeKind.Block);
                if (blockScope) {
                    this.config.services.contextTracker.withSavedState(() => {
                        this.config.services.contextTracker.setScope(blockScope.id);

                        this.config.services.scopeManager.withScope(blockScope.id, () => {
                            let reachedUnreachablePoint = false;

                            for (let i = 0; i < block.stmts.length; i++) {
                                const stmt = block.stmts[i];

                                // Report if we're past an unreachable point
                                if (reachedUnreachablePoint) {
                                    this.reportError(
                                        DiagCode.UNREACHABLE_CODE,
                                        'Unreachable code detected',
                                        stmt.span
                                    );
                                    // Continue checking syntax but skip deep validation
                                    continue;
                                }

                                // Validate the statement normally
                                this.validateStmt(stmt, blockScope);

                                // Check if THIS statement makes subsequent code unreachable
                                if (this.statementAlwaysExits(stmt)) {
                                    reachedUnreachablePoint = true;
                                }
                            }
                        });
                    });
                }
            }

            validateSectionStmt(section: AST.SectionStmtNode, scope?: Scope, moduleName?: string): void {
                this.log('symbols', 'Validating section');

                const currentScope = this.config.services.scopeManager.getCurrentScope();
                this.config.services.contextTracker.withSavedState(() => {
                    this.config.services.contextTracker.setScope(currentScope.id);

                    this.config.services.scopeManager.withScope(currentScope.id, () => {
                        let reachedUnreachablePoint = false;

                        for (let i = 0; i < section.stmts.length; i++) {
                            const stmt = section.stmts[i];

                            // Report if we're past an unreachable point
                            if (reachedUnreachablePoint) {
                                this.reportError(
                                    DiagCode.UNREACHABLE_CODE,
                                    'Unreachable code detected',
                                    stmt.span
                                );
                                // Continue checking syntax but skip deep validation
                                continue;
                            }

                            // Validate the statement normally
                            this.validateStmt(stmt, currentScope);

                            // Check if THIS statement makes subsequent code unreachable
                            if (this.statementAlwaysExits(stmt)) {
                                reachedUnreachablePoint = true;
                            }
                        }
                    });
                });
            }

            handleTestStmt(testNode: AST.TestStmtNode, scope: Scope, moduleName?: string): void {
                this.validateBlockStmt(testNode.block, scope, moduleName);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.2] USE ──────────────────────────────┐

            // Skipped for now.

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.3] DEF ──────────────────────────────┐

            handleDefStmt(defNode: AST.DefStmtNode, scope?: Scope, moduleName?: string): void {
                this.handleStatement(defNode, this.validateDefStmt.bind(this), scope, moduleName);
            }

            validateDefStmt(defNode: AST.DefStmtNode): void {
                this.logSymbolValidation('Type checking definition', defNode.ident.name);

                const symbol = this.config.services.scopeManager.getSymbolInCurrentScope(defNode.ident.name);
                if (!symbol) return;

                if (defNode.type) {
                    if (!this.checkCircularTypeDependency(defNode.type, defNode.ident.name, true)) {
                        this.resolveTypeNode(defNode.type);
                    }
                }

                this.markSymbolAsTypeChecked(symbol, defNode.type);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.4] LET ──────────────────────────────┐

            handleLetStmt(letNode: AST.LetStmtNode, scope?: Scope, moduleName?: string): void {
                this.handleStatement(letNode, this.validateLetStmt.bind(this), scope, moduleName);
            }

            validateArrayLiteralWithTargetType(
                initExpr: AST.ExprNode,
                targetType: AST.TypeNode,
                contextName: string
            ): boolean {
                // Only handle array literals
                if (!initExpr.is('primary')) return true;
                const primary = initExpr.getPrimary();
                if (!primary?.is('literal')) return true;
                const literal = primary.getLiteral();
                if (literal?.kind !== 'Array') return true;

                const elements = literal.value as AST.ExprNode[];

                // Extract target array info
                if (!targetType.isArray()) return true;
                const targetArray = targetType.getArray()!;
                const targetElementType = targetArray.target;

                // CHECK ARRAY SIZE MISMATCH
                if (targetArray.size) {
                    const targetSize = this.ExpressionEvaluator.extractIntegerValue(targetArray.size);
                    const sourceSize = elements.length;

                    if (targetSize !== undefined && targetSize !== sourceSize) {
                        const msg = sourceSize > targetSize
                            ? `Array literal has more elements than the fixed array type`
                            : `Array literal has fewer elements than the fixed array type`;

                        this.reportError(
                            DiagCode.ARRAY_SIZE_MISMATCH,
                            msg,
                            initExpr.span
                        );
                        return false; // Size mismatch - stop validation
                    }
                }

                // Empty array is valid
                if (elements.length === 0) return true;

                // Validate ALL elements against target element type
                for (let i = 0; i < elements.length; i++) {
                    // Unified validation for each element
                    if (!this.validateTypeAssignment(
                        elements[i],
                        targetElementType,
                        `Array element ${i} in '${contextName}'`
                    )) {
                        // Error already reported, continue checking other elements
                        continue;
                    }

                    const elemType = this.typeInference.inferExpressionType(elements[i]);
                    if (!elemType || !this.typeInference.isTypeCompatible(targetElementType, elemType)) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Array element ${i} has type '${elemType ? this.typeInference.getTypeDisplayName(elemType!) : 'unknown'}' which is not compatible with target element type '${ this.typeInference.getTypeDisplayName(targetElementType) }'`,
                            elements[i].span
                        );
                    }
                }

                return true;
            }

            validateLetStmt(letNode: AST.LetStmtNode): void {
                this.logSymbolValidation('Type checking variable', letNode.field.ident.name);

                const symbol = this.config.services.scopeManager.getSymbolInCurrentScope(letNode.field.ident.name);
                if (!symbol) return;

                const currentScope = this.config.services.scopeManager.getCurrentScope();
                // Static variables only allowed in struct/enum types
                if (letNode.field.visibility.kind === 'Static') {
                    const currentScope = this.config.services.scopeManager.getCurrentScope();

                    // Static is only valid inside struct/enum type definitions
                    if (currentScope.kind !== ScopeKind.Type) {
                        this.reportError(
                            DiagCode.INVALID_VISIBILITY,
                            `Variable '${letNode.field.ident.name}' cannot be 'static' outside of struct/enum`,
                            letNode.field.ident.span
                        );
                        return;
                    }
                }

                if (letNode.field.type) {
                    if (this.checkCircularTypeDependency(letNode.field.type, letNode.field.ident.name, false)) {
                        return;
                    }
                    this.resolveTypeNode(letNode.field.type);
                }

                let initType = null;
                if (letNode.field.initializer) {
                    // Check for unreachable expressions in initializer
                    // Only report error if the variable type is not noreturn
                    if (letNode.field.type?.isNoreturn()) {
                        // Allow unreachable expressions for noreturn variables
                        // Don't call validateUnreachableExpression
                    } else {
                        this.validateUnreachableExpression(letNode.field.initializer);
                    }

                    initType = this.extractTypeFromInitializer(letNode.field.initializer);

                    if (initType && (initType.isStruct() || initType.isEnum())) {
                        if (initType.isStruct()) {
                            this.validateStructType(initType.getStruct()!, symbol);
                        }
                        this.markSymbolAsTypeChecked(symbol, initType);
                        return;
                    }
                }

                let structTypeToValidate: AST.TypeNode | null = null;
                let objectNodeToValidate: AST.ObjectNode | null = null;

                // Check for overflow before compatibility check
                if (letNode.field.initializer) {
                    if (letNode.field.type) {
                        // Unified validation handles both character literals and overflow
                        this.validateTypeAssignment(
                            letNode.field.initializer,
                            letNode.field.type,
                            `Variable '${letNode.field.ident.name}'`
                        );
                        this.validateValueFitsInType(letNode.field.initializer, letNode.field.type);
                    } else if (initType) {
                        this.validateTypeAssignment(
                            letNode.field.initializer,
                            initType,
                            `Variable '${letNode.field.ident.name}'`
                        );
                    }
                }

                else if (letNode.field.initializer && !letNode.field.type) {
                    if ((letNode.field.initializer! as AST.ExprNode).is('primary')) {
                        const primary = (letNode.field.initializer! as AST.ExprNode).getPrimary();
                        if (primary && primary.is('object')) {
                            const obj = primary.getObject()!;

                            if (obj.ident) {
                                const typeSymbol = this.config.services.scopeManager.lookupSymbol(obj.ident.name);
                                if (typeSymbol && typeSymbol.type) {
                                    let actualType = this.typeInference.resolveIdentifierType(typeSymbol.type);

                                    if (actualType.isStruct()) {
                                        structTypeToValidate = actualType;
                                        objectNodeToValidate = obj;
                                        letNode.field.type = typeSymbol.type;
                                        symbol.type = typeSymbol.type;
                                    }
                                }
                            }
                        }
                    }
                }

                if (structTypeToValidate && objectNodeToValidate) {
                    this.validateStructConstruction(objectNodeToValidate, structTypeToValidate, letNode.field.initializer!.span);
                    this.markSymbolAsTypeChecked(symbol);
                    this.stats.typesInferred++;
                    return;
                }

                if (letNode.field.initializer) {
                    // Special handling for array literals with explicit type
                    if (letNode.field.type && letNode.field.type.isArray()) {
                        this.validateArrayLiteralWithTargetType(
                            letNode.field.initializer,
                            letNode.field.type,
                            letNode.field.ident.name
                        );
                        this.markSymbolAsTypeChecked(symbol, letNode.field.type);
                        this.stats.typesInferred++;
                        return;
                    }

                    const initType = this.typeInference.inferExpressionType(letNode.field.initializer);

                    if (initType) {
                        if (!letNode.field.type) {
                            letNode.field.type = initType;
                            symbol.type = initType;
                            this.stats.typesInferred++;
                        } else {
                            // Use shared helper for array validation
                            if (!this.validateArrayAssignment(
                                letNode.field.type,
                                initType,
                                letNode.field.initializer.span,
                                `Variable '${letNode.field.ident.name}'`
                            )) {
                                this.markSymbolAsTypeChecked(symbol);
                                return;
                            }

                            // PASS SOURCE EXPRESSION for strict pointer checking
                            this.validateTypeCompatibility(
                                letNode.field.type,
                                initType,
                                'variable',
                                letNode.field.initializer!.span,
                                letNode.field.initializer
                            );
                        }
                    }

                    // NEW: Check if initializer is an enum variant that requires a value
                    if (letNode.field.initializer.is('postfix')) {
                        const postfix = letNode.field.initializer.getPostfix();
                        if (postfix?.kind === 'memberAccess') {
                            const access = postfix.getMemberAccess()!;
                            const baseType = this.typeInference.inferExpressionType(access.base);

                            if (baseType) {
                                const resolvedBase = this.typeInference.resolveIdentifierType(baseType);

                                if (resolvedBase.isEnum()) {
                                    const memberName = this.typeInference.extractMemberName(access.target);
                                    const enumDef = resolvedBase.getEnum()!;
                                    const variant = enumDef.variants.find(v => v.ident.name === memberName);

                                    if (variant && variant.type && memberName) {
                                        this.validateEnumVariantAssignment(variant, memberName, letNode.field.initializer.span);
                                        return;
                                    }
                                }
                            }
                        }
                    }

                } else if (!letNode.field.type) {
                    this.reportError(
                        DiagCode.CANNOT_INFER_TYPE,
                        `Variable '${letNode.field.ident.name}' requires explicit type or initializer`,
                        letNode.field.span
                    );
                }

                if(symbol.type)
                letNode.field.type = symbol.type;

                this.markSymbolAsTypeChecked(symbol);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.5] FUNC ─────────────────────────────┐

            handleFuncStmt(funcNode: AST.FuncStmtNode, scope?: Scope, moduleName?: string): void {
                this.handleStatement(funcNode, this.validateFuncStmt.bind(this), scope, moduleName);
            }

            validateFuncStmt(funcNode: AST.FuncStmtNode): void {
                this.logSymbolValidation('Type checking function', funcNode.ident.name);

                const funcSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(funcNode.ident.name);
                if (!funcSymbol) {
                    this.reportError(
                        DiagCode.CANNOT_INFER_TYPE,
                        `Function '${funcNode.ident.name}' symbol not found`,
                        funcNode.span
                    );
                    return;
                }

                const funcScope = this.config.services.scopeManager.findChildScopeByName(funcNode.ident.name, ScopeKind.Function);
                if (!funcScope) {
                    this.reportError(
                        DiagCode.CANNOT_INFER_TYPE,
                        `Function scope for '${funcNode.ident.name}' not found`,
                        funcNode.span
                    );
                    return;
                }

                // Check if the function is stored IN a Type scope
                const funcSymbolScope = this.config.services.scopeManager.getScope(funcSymbol.scope);

                // For struct methods, funcSymbol.scope points to the Type scope (Point)
                const parentScope = funcSymbolScope.kind === ScopeKind.Type &&
                                        funcSymbolScope.metadata?.typeKind === 'Struct'
                    ? funcSymbolScope
                    : null;

                const isStaticMethod = parentScope !== null &&
                                    funcNode.visibility.kind === 'Static';

                const isInstanceMethod = parentScope !== null &&
                                        !(funcNode.visibility.kind === 'Static');

                // Save previous context
                const previousIsStaticMethod = this.currentIsStaticMethod;
                const previousStructScope = this.currentStructScope;

                // SET CONTEXT BEFORE ENTERING NEW SCOPE - THIS IS CRITICAL
                this.currentIsStaticMethod = isStaticMethod;
                this.currentStructScope = isStaticMethod || isInstanceMethod ? parentScope : null;

                this.log('symbols', `Function '${funcNode.ident.name}': isStatic=${isStaticMethod}, isInstance=${isInstanceMethod}, structScope=${this.currentStructScope?.name || 'none'}`);

                // Save and set current function return/error type
                const previousReturnType = this.currentFunctionReturnType;
                const previousHasReturnStmt = this.hasReturnStatement;
                const previousErrorType = this.currentFunctionErrorType;
                const previousHasThrowStmt = this.hasThrowStatement;

                this.currentFunctionReturnType = funcNode.returnType || null;
                this.hasReturnStatement = false;
                this.currentFunctionErrorType = funcNode.errorType || null;
                this.hasThrowStatement = false;

                try {
                    this.config.services.contextTracker.withSavedState(() => {
                        this.config.services.scopeManager.withScope(funcScope.id, () => {
                            // ONLY inject self for instance methods (not static)
                            if (isInstanceMethod) {
                                this.resolveSelfParameter(funcScope, parentScope!);
                            }

                            // Validate parameters
                            for (const param of funcNode.parameters) {
                                this.validateParameter(param);
                            }

                            // Build function type
                            const paramTypes: AST.TypeNode[] = [];
                            for (const param of funcNode.parameters) {
                                if (param.type) {
                                    paramTypes.push(param.type);
                                } else {
                                    const paramSymbol = funcScope.symbols.get(param.ident.name);
                                    if (paramSymbol?.type) {
                                        paramTypes.push(paramSymbol.type);
                                    } else {
                                        this.reportError(
                                            DiagCode.CANNOT_INFER_TYPE,
                                            `Cannot infer type for parameter '${param.ident.name}'`,
                                            param.span
                                        );
                                        paramTypes.push(AST.TypeNode.asUndefined(param.span));
                                    }
                                }
                            }

                            funcSymbol.type = AST.TypeNode.asFunction(
                                funcNode.span,
                                paramTypes,
                                funcNode.returnType ?? this.currentFunctionReturnType ?? undefined
                            );

                            funcSymbol.metadata!.errorType = funcNode.errorType ?? this.currentFunctionErrorType ?? undefined;

                            // Store information about default parameters
                            const defaultParamIndices: number[] = [];
                            for (let i = 0; i < funcNode.parameters.length; i++) {
                                if (funcNode.parameters[i].initializer) {
                                    defaultParamIndices.push(i);
                                }
                            }
                            funcSymbol.metadata!.defaultParamIndices = defaultParamIndices;

                            // Validate body
                            if (funcNode.body) {
                                this.validateStmt(funcNode.body);

                                const expectedReturnType = funcNode.returnType || this.currentFunctionReturnType;

                                if (expectedReturnType && !expectedReturnType.isVoid()) {
                                    const hasErrorType = funcNode.errorType || this.currentFunctionErrorType;

                                    if (!this.hasReturnStatement && !funcNode.returnType?.isNoreturn()) {
                                        if (!hasErrorType || !this.hasThrowStatement) {
                                            this.reportError(
                                                DiagCode.MISSING_RETURN_STATEMENT,
                                                `Function '${funcNode.ident.name}' with non-void return type must have at least one return statement`,
                                                funcNode.ident.span
                                            );
                                        }
                                    }
                                }

                                if (!funcNode.returnType) {
                                    if (this.currentFunctionReturnType) {
                                        funcSymbol.type!.getFunction()!.returnType = this.currentFunctionReturnType;
                                    } else {
                                        funcSymbol.type!.getFunction()!.returnType = AST.TypeNode.asVoid(funcNode.span);
                                    }
                                }
                            }
                        });
                    });

                    if (isInstanceMethod) {
                        this.stats.memberAccessValidated++;
                    }
                } finally {
                    this.config.services.contextTracker.completeDeclaration(funcSymbol.id);

                    // RESTORE context - ALWAYS do this, even on error
                    this.currentIsStaticMethod = previousIsStaticMethod;
                    this.currentStructScope = previousStructScope;

                    // Restore previous return/error types
                    this.currentFunctionReturnType = previousReturnType;
                    this.hasReturnStatement = previousHasReturnStmt;
                    this.currentFunctionErrorType = previousErrorType;
                    this.hasThrowStatement = previousHasThrowStmt;
                }

                funcSymbol.isTypeChecked = true;
            }

            // ───── PARAMS ─────

            validateParameter(paramNode: AST.FieldNode): void {
                const paramSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(paramNode.ident.name);
                if (!paramSymbol) return;

                // Validate parameter visibility
                if (paramNode.visibility.kind === 'Static') {
                    this.reportError(
                        DiagCode.INVALID_VISIBILITY,
                        `Parameter '${paramNode.ident.name}' cannot be 'static'`,
                        paramNode.ident.span
                    );
                    return;
                } else if (paramNode.visibility.kind === 'Public') {
                    this.reportError(
                        DiagCode.INVALID_VISIBILITY,
                        `Parameter '${paramNode.ident.name}' cannot be 'public'`,
                        paramNode.ident.span
                    );
                    return;
                }

                if (paramNode.initializer) {
                    // Special handling for array literals with explicit type
                    if (paramNode.type && paramNode.type.isArray()) {
                        this.validateArrayLiteralWithTargetType(
                            paramNode.initializer,
                            paramNode.type,
                            paramNode.ident.name
                        );
                        paramSymbol.type = paramNode.type;
                        paramSymbol.isTypeChecked = true;
                        return;
                    }

                    const initType = this.typeInference.inferExpressionType(paramNode.initializer);

                    if (initType) {
                        if (!paramNode.type) {
                            paramNode.type = initType;
                            paramSymbol.type = initType;
                            this.stats.typesInferred++;
                        } else {
                            // Unified validation
                            this.validateTypeAssignment(
                                paramNode.initializer,
                                paramNode.type,
                                `Parameter '${paramNode.ident.name}' default value`
                            );

                            if (!this.validateArrayAssignment(
                                paramNode.type,
                                initType,
                                paramNode.initializer.span,
                                `Parameter '${paramNode.ident.name}' default value`
                            )) {
                                paramSymbol.isTypeChecked = true;
                                return;
                            }

                            // PASS SOURCE EXPRESSION for strict pointer checking
                            this.validateTypeCompatibility(
                                paramNode.type,
                                initType,
                                'parameter',
                                paramNode.initializer.span,
                                paramNode.initializer
                            );
                        }
                    }

                    // NEW: Check if initializer is an enum variant that requires a value
                    if (paramNode.initializer.is('postfix')) {
                        const postfix = paramNode.initializer.getPostfix();
                        if (postfix?.kind === 'memberAccess') {
                            const access = postfix.getMemberAccess()!;
                            const baseType = this.typeInference.inferExpressionType(access.base);

                            if (baseType) {
                                const resolvedBase = this.typeInference.resolveIdentifierType(baseType);

                                if (resolvedBase.isEnum()) {
                                    const memberName = this.typeInference.extractMemberName(access.target);
                                    const enumDef = resolvedBase.getEnum()!;
                                    const variant = enumDef.variants.find(v => v.ident.name === memberName);

                                    if (variant && variant.type && memberName) {
                                        this.validateEnumVariantAssignment(variant, memberName, paramNode.initializer.span);
                                        return;
                                    }
                                }
                            }
                        }
                    }

                    if(paramNode.type) {
                        this.validateValueFitsInType(paramNode.initializer, paramNode.type!);
                    }
                }

                paramSymbol.isTypeChecked = true;
            }

            resolveSelfParameter(funcScope: Scope, structScope: Scope): void {
                const selfSymbol = funcScope.symbols.get('self');
                if (!selfSymbol) {
                    this.log('verbose', `Warning: Expected 'self' parameter in struct method but not found`);
                    return;
                }

                // Mark self as declared and used in resolution phase
                selfSymbol.declared = true;
                selfSymbol.used = true; // Mark as used by default since it's implicit

                if (selfSymbol.type) {
                    if (selfSymbol.type.kind === 'ident') {
                        const typeIdent = selfSymbol.type.getIdent()!;
                        if (typeIdent.name !== structScope.name) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Self type mismatch: expected '${structScope.name}', got '${typeIdent.name}'`,
                                selfSymbol.contextSpan
                            );
                        }
                    }
                }

                this.log('symbols', `Resolved 'self' parameter in struct method`);
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌───────────────────────────── [3.6] LOOP ─────────────────────────────┐

            validateWhileStmt(n: AST.WhileStmtNode): void {
                const loopScope = this.config.services.scopeManager.findChildScopeByName('while', ScopeKind.Loop);
                if (!loopScope) return;

                this.config.services.contextTracker.withSavedState(() => {
                    this.config.services.scopeManager.withScope(loopScope.id, () => {
                        this.config.services.contextTracker.enterLoop();

                        if (n.expr) {
                            const condType = this.typeInference.inferExpressionType(n.expr);

                            if (condType && !condType.isBool()) {
                                this.log('verbose', `While loop condition has type ${this.typeInference.getTypeDisplayName(condType)}, not bool`);
                            }
                        }

                        if (n.stmt) {
                            this.validateStmt(n.stmt);
                        }
                    });

                    this.config.services.contextTracker.exitLoop();
                });
            }

            validateDoStmt(n: AST.DoStmtNode): void {
                const loopScope = this.config.services.scopeManager.findChildScopeByName('do', ScopeKind.Loop);
                if (!loopScope) return;

                this.config.services.contextTracker.withSavedState(() => {
                    this.config.services.scopeManager.withScope(loopScope.id, () => {
                        this.config.services.contextTracker.enterLoop();

                        if (n.expr) {
                            const condType = this.typeInference.inferExpressionType(n.expr);

                            if (condType && !condType.isBool()) {
                                this.log('verbose', `Do loop condition has type ${this.typeInference.getTypeDisplayName(condType)}, not bool`);
                            }
                        }

                        if (n.stmt) {
                            this.validateStmt(n.stmt);
                        }
                    });

                    this.config.services.contextTracker.exitLoop();
                });
            }

            validateForStmt(n: AST.ForStmtNode): void {
                const loopScope = this.config.services.scopeManager.findChildScopeByName('for', ScopeKind.Loop);
                if (!loopScope) return;

                this.config.services.contextTracker.withSavedState(() => {
                    this.config.services.scopeManager.withScope(loopScope.id, () => {
                        this.config.services.contextTracker.enterLoop();

                        if (n.expr) {
                            const condType = this.typeInference.inferExpressionType(n.expr);

                            if (condType && !condType.isBool()) {
                                this.log('verbose', `Do loop condition has type ${this.typeInference.getTypeDisplayName(condType)}, not bool`);
                            }
                        }

                        if (n.stmt) {
                            this.validateStmt(n.stmt);
                        }
                    });

                    this.config.services.contextTracker.exitLoop();
                });
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────── [3.7] CTRLFLOW ──────────────────────────┐

            validateReturnStmt(returnNode: AST.ReturnStmtNode): void {
                this.log('symbols', 'Validating return statement');

                this.stats.returnsValidated++;
                this.hasReturnStatement = true;

                const isInFunction = this.isInsideFunctionScope();

                if (returnNode.expr) {
                    const isConstructor = this.typeInference.isConstructorExpression(returnNode.expr);

                    if (!isConstructor && this.typeInference.isTypeExpression(returnNode.expr)) {
                        const functionReturnsType = this.currentFunctionReturnType && this.typeInference.isTypeType(this.currentFunctionReturnType);

                        if (!functionReturnsType) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Cannot return a type as a value. Expected a value of type '${this.currentFunctionReturnType ? this.typeInference.getTypeDisplayName(this.currentFunctionReturnType!) : 'void'}', got type expression`,
                                returnNode.expr.span
                            );
                            return;
                        }
                    }

                    // Unified character literal validation for returns
                    if (isInFunction && this.currentFunctionReturnType) {
                        if (!this.validateTypeAssignment(
                            returnNode.expr,
                            this.currentFunctionReturnType,
                            'Return value'
                        )) {
                            return; // Error already reported
                        }
                    }

                    const returnType = this.typeInference.inferExpressionType(returnNode.expr);

                    if (!returnType && this.config.services.diagnosticManager.hasErrors()) {
                        return;
                    }

                    if (isInFunction && this.currentFunctionReturnType) {
                        // PASS SOURCE EXPRESSION for strict pointer checking
                        if (returnType && !this.typeInference.isTypeCompatible(this.currentFunctionReturnType, returnType, returnNode.expr)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Return type '${this.typeInference.getTypeDisplayName(returnType)}' doesn't match function return type '${this.typeInference.getTypeDisplayName(this.currentFunctionReturnType)}'`,
                                returnNode.expr.span
                            );
                        }
                    } else if (!isInFunction) {
                        this.validateFunctionScope(returnNode, 'return');
                    }
                } else {
                    if (isInFunction && this.currentFunctionReturnType && !this.currentFunctionReturnType.isVoid()) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Function expects return type '${this.typeInference.getTypeDisplayName(this.currentFunctionReturnType)}' but got void return`,
                            returnNode.span
                        );
                    } else if (!isInFunction) {
                        this.validateFunctionScope(returnNode, 'return');
                    }
                }
            }

            validateDeferStmt(deferNode: AST.DeferStmtNode): void {
                if (deferNode.expr) {
                    this.typeInference.inferExpressionType(deferNode.expr);
                }
                this.validateFunctionScope(deferNode, 'defer');
            }

            validateThrowStmt(throwNode: AST.ThrowStmtNode): void {
                this.log('symbols', 'Validating throw statement');

                // Mark that we encountered a throw statement
                this.hasThrowStatement = true;

                // Check if we're in a function scope
                if (!this.validateFunctionScope(throwNode, 'throw')) {
                    return;
                }

                // Get the current function's error type
                const functionErrorType = this.getCurrentFunctionErrorType();

                if (!functionErrorType) {
                    this.reportError(
                        DiagCode.THROW_WITHOUT_ERROR_TYPE,
                        `Cannot throw error in function without error type. Add '!ErrorType' to function signature`,
                        throwNode.span
                    );
                    return;
                }

                // Validate the thrown expression
                if (throwNode.expr) {
                    // TRY to infer type, but don't fail if we can't
                    const thrownType = this.typeInference.inferExpressionType(throwNode.expr);

                    // For error members, we might not get a full type
                    // Instead, validate directly using the expression
                    if (!thrownType) {
                        // Can't infer type - validate using expression directly
                        this.validateThrowExpression(throwNode.expr, functionErrorType, throwNode.expr.span);
                        return;
                    }

                    // Normal path: validate with both type and expression
                    this.validateThrowType(thrownType, functionErrorType, throwNode.expr, throwNode.expr.span);
                } else {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `Throw statement must have an error value`,
                        throwNode.span
                    );
                }
            }

            validateThrowExpression(
                throwExpr: AST.ExprNode,
                functionErrorType: AST.TypeNode,
                span: AST.Span
            ): void {
                const funcSymbol = this.getCurrentFunctionSymbol();
                const errorMode = funcSymbol?.metadata?.errorMode as string | undefined;

                this.log('symbols', `Validating throw expression with error mode: ${errorMode || 'unknown'}`);

                switch (errorMode) {
                    case 'any-error':
                        // For any-error mode, check if expression looks like an error
                        // (member access on error set, identifier that might be error, etc.)
                        if (!this.typeInference.isErrorExpression(throwExpr)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Cannot throw non-error type. Expected error type`,
                                span
                            );
                        }
                        break;

                    case 'err-ident':
                    case 'err-group':
                        // For specific error types, validate the expression matches
                        if (!this.isValidErrorExpression(throwExpr, functionErrorType)) {
                            this.reportError(
                                DiagCode.THROW_TYPE_MISMATCH,
                                `Thrown error does not match function error type '${this.typeInference.getTypeDisplayName(functionErrorType)}'`,
                                span
                            );
                        }
                        break;

                    case 'self-group':
                        // For self-group, validate member access on selferr
                        const errorName = this.extractErrorMemberName(throwExpr);
                        const allowedErrors = funcSymbol?.metadata?.selfGroupErrors as string[] | undefined;

                        if (!errorName) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Cannot resolve error member from thrown expression`,
                                span
                            );
                        } else if (!allowedErrors || !allowedErrors.includes(errorName)) {
                            this.reportError(
                                DiagCode.ERROR_MEMBER_NOT_FOUND,
                                `Error '${errorName}' is not in function's error set [${allowedErrors?.join(', ') || ''}]`,
                                span
                            );
                        }
                        break;

                    default:
                        // Unknown mode - be lenient but warn
                        this.log('verbose', `Unknown error mode in validateThrowExpression`);
                        if (!this.typeInference.isErrorExpression(throwExpr)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Cannot throw non-error type`,
                                span
                            );
                        }
                }
            }

            isValidErrorExpression(expr: AST.ExprNode, expectedType: AST.TypeNode): boolean {
                // For member access: ErrorSet.Member
                if (expr.is('postfix')) {
                    const postfix = expr.getPostfix();
                    if (postfix?.kind === 'memberAccess') {
                        const memberAccess = postfix.getMemberAccess()!;

                        if (memberAccess.base.is('primary')) {
                            const primary = memberAccess.base.getPrimary();
                            if (primary?.is('ident')) {
                                const ident = primary.getIdent()!;

                                // Check if base matches expected type name
                                if (expectedType.isIdent()) {
                                    const expectedIdent = expectedType.getIdent()!;
                                    return ident.name === expectedIdent.name;
                                }

                                // Check if base symbol matches expected type
                                const baseSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                                if (baseSymbol?.type) {
                                    const resolvedExpected = this.typeInference.resolveIdentifierType(expectedType);
                                    return this.typeInference.isSameType(baseSymbol.type, resolvedExpected);
                                }
                            }
                        }
                    }
                }

                // For direct identifier: check if it matches expected error variable
                if (expr.is('primary')) {
                    const primary = expr.getPrimary();
                    if (primary?.is('ident')) {
                        const ident = primary.getIdent()!;

                        // Check if identifier matches expected type name
                        if (expectedType.isIdent()) {
                            const expectedIdent = expectedType.getIdent()!;
                            return ident.name === expectedIdent.name;
                        }
                    }
                }

                return true; // If we can't determine, be lenient
            }

            validateThrowType(
                thrownType: AST.TypeNode,
                functionErrorType: AST.TypeNode,
                throwExpr: AST.ExprNode,
                span: AST.Span
            ): void {
                const funcSymbol = this.getCurrentFunctionSymbol();
                const errorMode = funcSymbol?.metadata?.errorMode as string | undefined;

                this.log('symbols', `Validating throw with error mode: ${errorMode || 'unknown'}`);

                switch (errorMode) {
                    case 'any-error':
                        // Accept ANY error type
                        if (!this.typeInference.isErrorType(thrownType)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Cannot throw non-error type '${this.typeInference.getTypeDisplayName(thrownType)}'. Expected error type`,
                                span
                            );
                        }
                        break;

                    case 'err-ident':
                    case 'err-group': {
                        // Quick check: if throwing an identifier, check if it matches the function's expected error type
                        if (throwExpr.is('primary')) {
                            const primary = throwExpr.getPrimary();
                            if (primary?.is('ident')) {
                                const thrownIdent = primary.getIdent()!.name;

                                // Check if function expects an identifier type
                                if (functionErrorType.isIdent()) {
                                    const funcIdent = functionErrorType.getIdent()!.name;
                                    if (thrownIdent === funcIdent) {
                                        // Same identifier - always valid
                                        break;
                                    }
                                }
                            }
                        }

                        // Extract what the thrown expression actually refers to
                        let thrownErrorName: string = '';
                        let thrownErrorSet: AST.TypeNode | null = null;

                        // If throwing an identifier (like MyError), look up what it refers to
                        if (throwExpr.is('primary')) {
                            const primary = throwExpr.getPrimary();
                            if (primary?.is('ident')) {
                                const thrownIdent = primary.getIdent()!.name;
                                thrownErrorName = thrownIdent;

                                // Look up the symbol to get what it actually refers to
                                const thrownSymbol = this.config.services.scopeManager.lookupSymbol(thrownIdent);
                                if (thrownSymbol && thrownSymbol.type) {
                                    thrownErrorSet = this.typeInference.resolveIdentifierType(thrownSymbol.type);
                                }
                            }
                        }

                        // If throwing a member access (like FileErrors.NotFound)
                        if (throwExpr.is('postfix')) {
                            const postfix = throwExpr.getPostfix();
                            if (postfix?.kind === 'memberAccess') {
                                const memberAccess = postfix.getMemberAccess()!;
                                thrownErrorName = this.typeInference.extractMemberName(memberAccess.target) || '';

                                // Get the base type (FileErrors)
                                const baseType = this.typeInference.inferExpressionType(memberAccess.base);
                                if (baseType) {
                                    thrownErrorSet = this.typeInference.resolveIdentifierType(baseType);
                                }
                            }
                        }

                        // Resolve the function's expected error type
                        const resolvedFunctionError = this.typeInference.resolveIdentifierType(functionErrorType);

                        // CASE 1: Both are error sets - check if member is in set or if sets are identical
                        if (thrownErrorSet?.isErrset() && resolvedFunctionError.isErrset()) {
                            const thrownSet = thrownErrorSet.getErrset()!;
                            const expectedSet = resolvedFunctionError.getErrset()!;

                            // Check if thrown error set is the same as expected set
                            if (this.typeInference.isSameErrorType(thrownErrorSet, resolvedFunctionError)) {
                                break;
                            }

                            // Check if the specific thrown member is in the expected set
                            if (thrownErrorName) {
                                const isMember = expectedSet.members.some(m => m.name === thrownErrorName);
                                if (isMember) {
                                    break;
                                }
                            }

                            this.reportError(
                                DiagCode.THROW_TYPE_MISMATCH,
                                `Thrown error type '${thrownErrorName || this.typeInference.getTypeDisplayName(thrownType)}' is not compatible with function error type '${this.typeInference.getTypeDisplayName(functionErrorType)}'`,
                                span
                            );
                            break;
                        }

                        // CASE 2: Function expects identifier that resolves to error set
                        if (resolvedFunctionError.isErrset()) {
                            const expectedSet = resolvedFunctionError.getErrset()!;

                            // Check if thrown member is in the expected set
                            if (thrownErrorName) {
                                const isMember = expectedSet.members.some(m => m.name === thrownErrorName);
                                if (isMember) {
                                    break;
                                }
                            }

                            this.reportError(
                                DiagCode.THROW_TYPE_MISMATCH,
                                `Thrown error type '${thrownErrorName || this.typeInference.getTypeDisplayName(thrownType)}' is not compatible with function error type '${this.typeInference.getTypeDisplayName(functionErrorType)}'`,
                                span
                            );
                            break;
                        }

                        // If we get here, something didn't match - report error
                        this.reportError(
                            DiagCode.THROW_TYPE_MISMATCH,
                            `Thrown error type '${thrownErrorName || this.typeInference.getTypeDisplayName(thrownType)}' is not compatible with function error type '${this.typeInference.getTypeDisplayName(functionErrorType)}'`,
                            span
                        );
                        break;
                    }

                    case 'self-group':
                        // Extract error name from the EXPRESSION, not the type
                        const errorName = this.extractErrorMemberName(throwExpr);
                        const allowedErrors = funcSymbol?.metadata?.selfGroupErrors as string[] | undefined;

                        if (!errorName) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Cannot resolve error member from thrown expression`,
                                span
                            );
                        } else if (!allowedErrors || !allowedErrors.includes(errorName)) {
                            this.reportError(
                                DiagCode.ERROR_MEMBER_NOT_FOUND,
                                `Error '${errorName}' is not in function's error set [${allowedErrors?.join(', ') || ''}]`,
                                span
                            );
                        }
                        break;

                    default:
                        // No error mode (shouldn't happen) - fall back to original logic
                        this.log('verbose', `Unknown error mode, falling back to legacy validation`);
                        if (functionErrorType.isErr()) {
                            if (!this.typeInference.isErrorType(thrownType)) {
                                this.reportError(
                                    DiagCode.TYPE_MISMATCH,
                                    `Cannot throw non-error type`,
                                    span
                                );
                            }
                        } else {
                            const resolvedFunctionError = this.typeInference.resolveIdentifierType(functionErrorType);
                            const resolvedThrownType = this.typeInference.resolveIdentifierType(thrownType);

                            if (!this.isValidThrowType(resolvedThrownType, resolvedFunctionError, span)) {
                                this.reportError(
                                    DiagCode.THROW_TYPE_MISMATCH,
                                    `Thrown error type is not compatible with function error type`,
                                    span
                                );
                            }
                        }
                }
            }

            getCurrentFunctionSymbol(): Symbol | null {
                let currentScope = this.config.services.scopeManager.getCurrentScope();

                while (currentScope && currentScope.kind !== ScopeKind.Function) {
                    const parent = this.config.services.scopeManager.getScopeParent(currentScope.id);
                    if (!parent) break;
                    currentScope = parent;
                }

                if (!currentScope || currentScope.kind !== ScopeKind.Function) {
                    return null;
                }

                const parentScope = this.config.services.scopeManager.getScopeParent(currentScope.id);
                if (!parentScope) return null;

                return parentScope.symbols.get(currentScope.name) || null;
            }

            extractErrorMemberName(thrownExpr: AST.ExprNode): string | null {
                // Handle direct identifier: throw IOError
                if (thrownExpr.is('primary')) {
                    const primary = thrownExpr.getPrimary();
                    if (primary?.is('ident')) {
                        return primary.getIdent()!.name;
                    }
                }

                // Handle member access: throw selferr.IOError
                if (thrownExpr.is('postfix')) {
                    const postfix = thrownExpr.getPostfix();
                    if (postfix?.kind === 'memberAccess') {
                        const memberAccess = postfix.getMemberAccess()!;

                        // Check if base is 'selferr'
                        if (memberAccess.base.is('primary')) {
                            const primary = memberAccess.base.getPrimary();
                            if (primary?.is('ident')) {
                                const ident = primary.getIdent();
                                if (ident?.name === 'selferr') {
                                    // Extract the member name (the error variant)
                                    if (memberAccess.target.is('primary')) {
                                        const targetPrimary = memberAccess.target.getPrimary();
                                        if (targetPrimary?.is('ident')) {
                                            return targetPrimary.getIdent()!.name;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                return null;
            }

            getCurrentFunctionErrorType(): AST.TypeNode | null {
                // Check if we're in a function scope
                const isInFunction = this.isInsideFunctionScope();

                if(isInFunction && this.currentFunctionErrorType) {
                    return this.currentFunctionErrorType;
                }

                // fallback
                {
                    let currentScope = this.config.services.scopeManager.getCurrentScope();

                    // Walk up to find function scope
                    while (currentScope && currentScope.kind !== ScopeKind.Function) {
                        const parent = this.config.services.scopeManager.getScopeParent(currentScope.id);
                        if (!parent) break;
                        currentScope = parent;
                    }

                    if (!currentScope || currentScope.kind !== ScopeKind.Function) {
                        return null;
                    }

                    // Find the function symbol
                    const parentScope = this.config.services.scopeManager.getScopeParent(currentScope.id);
                    if (!parentScope) return null;

                    const funcSymbol = parentScope.symbols.get(currentScope.name);
                    if (!funcSymbol || !funcSymbol.type || !funcSymbol.type.isFunction()) {
                        return null;
                    }

                    const funcType = funcSymbol.type.getFunction()!;
                    if(funcSymbol.metadata) { funcSymbol.metadata.errorType = funcType.errorType; }

                    return funcType.errorType || null;
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── [4] EXPR Level ───────────────────────────┐

            resolveTypeNode(typeNode: AST.TypeNode): void {
                switch (typeNode.kind) {
                    case 'struct':
                        const tempSymbol: Symbol = {
                            id: -1,
                            name: '<struct-validation>',
                            kind: SymbolKind.Definition,
                            type: typeNode,
                            scope: this.config.services.scopeManager.getCurrentScope().id,
                            contextSpan: typeNode.span,
                            declared: true,
                            initialized: true,
                            used: false,
                            isTypeChecked: false,
                            visibility: { kind: 'Private' },
                            mutability: { kind: 'Immutable' },
                            isExported: false
                        };
                        this.validateStructType(typeNode.getStruct()!, tempSymbol);
                        break;

                    case 'enum':
                        const tempSymbol2: Symbol = {
                            id: -1,
                            name: '<enum-validation>',
                            kind: SymbolKind.Definition,
                            type: typeNode,
                            scope: this.config.services.scopeManager.getCurrentScope().id,
                            contextSpan: typeNode.span,
                            declared: true,
                            initialized: true,
                            used: false,
                            isTypeChecked: false,
                            visibility: { kind: 'Private' },
                            mutability: { kind: 'Immutable' },
                            isExported: false
                        };
                        this.validateEnumType(typeNode.getEnum()!, tempSymbol2);
                        break;

                    case 'array':
                        const arr = typeNode.getArray()!;
                        this.resolveTypeNode(arr.target);
                        if (arr.size) {
                            this.validateArraySize(arr.size);
                        }
                        break;

                    case 'optional':
                        this.resolveTypeNode(typeNode.getOptional()!.target);
                        break;

                    case 'pointer':
                        this.resolveTypeNode(typeNode.getPointer()!.target);
                        break;

                    case 'paren':
                        this.resolveTypeNode(typeNode.getParen()!.type);
                        break;

                    case 'tuple':
                        for (const field of typeNode.getTuple()!.fields) {
                            this.resolveTypeNode(field);
                        }
                        break;

                    case 'primitive': {
                        // special case i/u width must be from 0 to 65535
                        const src = typeNode.getPrimitive()!;

                        if(src.isSigned() || src.isUnsigned()) {
                            const width = src.width!;
                            if(width < 0 || width > 65535) {
                                this.reportError(DiagCode.INVALID_TYPE_WIDTH, `Type width must be from 0 to 65535`, typeNode.span);
                            }
                        }
                    }
                }
            }

            // ===== PRIMARY OPERATIONS =====

            validateMethodCallContext(
                call: AST.CallNode,
                methodSymbol: Symbol,
                isStaticAccess: boolean,
                baseExpr: AST.ExprNode
            ): void {
                const isStaticMethod = methodSymbol.visibility.kind === 'Static';

                // CASE 1: Calling instance method on TYPE (Error)
                if (isStaticAccess && !isStaticMethod) {
                    this.reportError(
                        DiagCode.INVALID_STATIC_ACCESS,
                        `Cannot call instance method '${methodSymbol.name}' on type. Create an instance first.`,
                        call.span
                    );
                    return;
                }

                // CASE 2: Static calling instance via Type.method() - ADD THIS CHECK
                if (isStaticAccess && isStaticMethod) {
                    // Check if we're in a static method context
                    if (this.currentIsStaticMethod) {
                        // Verify the called method is also static
                        // (already checked above, but this prevents static->instance calls)
                    }
                }
            }

            // ===== BINARY OPERATIONS =====

            validateMutabilityAssignment(leftSymbol: Symbol, leftExpr: AST.ExprNode): boolean {
                // Check if trying to assign to static field
                if (leftSymbol.kind === SymbolKind.StructField && leftSymbol.visibility.kind === 'Static') {
                    this.reportError(
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

                    this.reportError(
                        DiagCode.MUTABILITY_MISMATCH,
                        `Cannot assign to immutable ${symbolType} '${leftSymbol.name}'`,
                        leftExpr.span
                    );
                    return false;
                }

                return true;
            }

            validateAssignment(binary: AST.BinaryNode): void {
                if (binary.kind !== 'assignment') return;

                this.stats.assignmentsValidated++;

                // Check for assignment through immutable pointer dereference
                if (binary.left.is('postfix')) {
                    const postfix = binary.left.getPostfix();
                    if (postfix?.kind === 'dereference') {
                        const ptrExpr = postfix.getAsExprNode()!;
                        const ptrType = this.typeInference.inferExpressionType(ptrExpr);

                        if (ptrType) {
                            const normalizedPtrType = this.typeInference.normalizeType(ptrType);

                            if (normalizedPtrType.isPointer()) {
                                const ptr = normalizedPtrType.getPointer()!;

                                if (!ptr.mutable) {
                                    this.reportError(
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

                const leftSymbol = this.extractSymbolFromExpression(binary.left);

                if (leftSymbol && !this.validateMutabilityAssignment(leftSymbol, binary.left)) {
                    return;
                }

                // Type compatibility check
                const leftType = this.typeInference.inferExpressionType(binary.left);
                const rightType = this.typeInference.inferExpressionType(binary.right);

                // PASS SOURCE EXPRESSION for strict pointer checking
                if (leftType && rightType && !this.typeInference.isTypeCompatible(leftType, rightType, binary.right)) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot assign type '${this.typeInference.getTypeDisplayName(rightType)}' to '${this.typeInference.getTypeDisplayName(leftType)}'`,
                        binary.right.span
                    );
                }

                // Check for overflow
                if (leftType) {
                    this.validateValueFitsInType(binary.right, leftType);
                }
            }

            validateUnreachableExpression(expr: AST.ExprNode): void {
                // Check if this is an unreachable expression
                if (expr.is('primary')) {
                    const primary = expr.getPrimary();
                    if (primary?.kind === 'unreachable') {
                        // Check if we're in an appropriate context
                        const isInAppropriateContext = this.isInAppropriateUnreachableContext(expr);
                        if (!isInAppropriateContext) {
                            this.reportError(
                                DiagCode.UNREACHABLE_CODE,
                                'Unreachable code detected',
                                primary?.span || expr.span
                            );
                        }
                    }
                }
            }

            isInAppropriateUnreachableContext(expr: AST.ExprNode): boolean {
                // Check if we're in a noreturn function
                if (this.currentFunctionReturnType?.isNoreturn()) {
                    return true;
                }

                // unreachable is also valid in error contexts where we must throw
                // but for now, be restrictive
                return false;
            }

            // ===== PREFIX OPERATIONS =====

            // ===== POSTFIX OPERATIONS =====

            validateEnumVariantConstruction(
                call: AST.CallNode,
                access: AST.MemberAccessNode,
                enumType: AST.TypeNode
            ): AST.TypeNode | null {
                const variantName = this.typeInference.extractMemberName(access.target);
                if (!variantName) return null;

                const enumDef = enumType.getEnum()!;
                const scopeId = enumDef.metadata?.scopeId as number | undefined;

                if (scopeId === undefined) {
                    this.reportError(
                        DiagCode.INTERNAL_ERROR,
                        `Cannot find scope for enum`,
                        call.span
                    );
                    return null;
                }

                const enumScope = this.config.services.scopeManager.getScope(scopeId);
                const variantSymbol = enumScope.symbols.get(variantName);

                if (!variantSymbol || variantSymbol.kind !== SymbolKind.EnumVariant) {
                    this.reportError(
                        DiagCode.SYMBOL_NOT_FOUND,
                        `Variant '${variantName}' not found in enum`,
                        access.target.span
                    );
                    return null;
                }

                // Find the variant definition
                const variant = enumDef.variants.find(v => v.ident.name === variantName);
                if (!variant) return null;

                // Check if variant has associated type
                if (!variant.type) {
                    this.reportError(
                        DiagCode.TOO_MANY_ARGUMENTS,
                        `Variant '${variantName}' does not take any arguments`,
                        call.span
                    );
                    return null;
                }

                // Validate argument count (should be exactly 1 for now)
                if (call.args.length !== 1) {
                    this.reportError(
                        DiagCode.TOO_MANY_ARGUMENTS,
                        `Variant '${variantName}' expects exactly 1 argument`,
                        call.span
                    );
                    return null;
                }

                // Validate argument type
                const argType = this.typeInference.inferExpressionType(call.args[0]);
                if (argType && !this.typeInference.isTypeCompatible(variant.type, argType)) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Argument type '${this.typeInference.getTypeDisplayName(argType)}' is not compatible with variant type '${this.typeInference.getTypeDisplayName(variant.type)}'`,
                        call.args[0].span
                    );
                }

                // Return the enum type itself
                return enumType;
            }

            validateMemberVisibility(
                memberSymbol: Symbol,
                structScope: Scope,
                accessSpan: AST.Span
            ): void {
                // Public members are always accessible - skip check
                if (memberSymbol.visibility.kind === 'Public') {
                    return;
                }

                // Check if member is private and being accessed from outside
                if (memberSymbol.visibility.kind === 'Private') {
                    const currentScope = this.config.services.scopeManager.getCurrentScope();

                    // Walk up to find if we're inside the same struct
                    let isInsideStruct = false;
                    let checkScope: Scope | null = currentScope;

                    while (checkScope) {
                        if (checkScope.id === structScope.id) {
                            isInsideStruct = true;
                            break;
                        }

                        if (checkScope.parent !== null) {
                            checkScope = this.config.services.scopeManager.getScope(checkScope.parent);
                        } else {
                            break;
                        }
                    }

                    if (!isInsideStruct) {
                        this.reportError(
                            DiagCode.SYMBOL_NOT_ACCESSIBLE,
                            `Cannot access private ${memberSymbol.kind === SymbolKind.Function ? 'method' : 'field'} '${memberSymbol.name}' from outside struct`,
                            accessSpan
                        );
                    }
                }
            }

            validateBuiltinCall(call: AST.CallNode): AST.TypeNode | null {
                const builtinName = this.extractBuiltinName(call.base);
                if (!builtinName) {
                    this.reportError(
                        DiagCode.INTERNAL_ERROR,
                        'Failed to extract builtin name',
                        call.base.span
                    );
                    return AST.TypeNode.asVoid(call.span);
                }

                // Look up builtin in global scope
                const globalScope = this.config.services.scopeManager.getGlobalScope();
                const builtinSymbol = globalScope.symbols.get(builtinName);

                if (!builtinSymbol || !builtinSymbol.type) {
                    this.reportError(
                        DiagCode.UNDEFINED_BUILTIN,
                        `Unknown builtin function '${builtinName}'`,
                        call.base.span
                    );
                    return AST.TypeNode.asVoid(call.span);
                }

                const funcType = builtinSymbol.type;
                if (!funcType.isFunction()) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `'${builtinName}' is not callable`,
                        call.base.span
                    );
                    return AST.TypeNode.asVoid(call.span);
                }

                const func = funcType.getFunction()!;

                // Special handling for @i function
                if (builtinName === '@i') {
                    return this.validateLoopIndexCall(call, builtinSymbol);
                }

                // Check argument count
                if (func.params.length !== call.args.length) {
                    const code = func.params.length > call.args.length
                        ? DiagCode.TOO_FEW_ARGUMENTS
                        : DiagCode.TOO_MANY_ARGUMENTS;

                    this.reportError(
                        code,
                        `Builtin '${builtinName}' expects ${func.params.length} argument(s), but got ${call.args.length}`,
                        call.args.length ? { start: call.args[0].span.start, end: call.args[call.args.length-1].span.end } : call.span
                    );
                    return func.returnType || AST.TypeNode.asVoid(call.span);
                }

                // Validate argument types
                for (let i = 0; i < func.params.length; i++) {
                    const paramType = func.params[i];
                    const arg = call.args[i];
                    const argType = this.typeInference.inferExpressionType(arg);

                    if (!argType) continue;

                    if (!this.typeInference.isTypeCompatible(paramType, argType)) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Argument type '${this.typeInference.getTypeDisplayName(argType)}' is not compatible with parameter type '${this.typeInference.getTypeDisplayName(paramType)}'`,
                            arg.span
                        );
                    }
                }

                return func.returnType || AST.TypeNode.asVoid(call.span);
            }

            validateLoopIndexCall(call: AST.CallNode, builtinSymbol: Symbol): AST.TypeNode | null {
                // Check if we're inside a loop
                if (!this.config.services.contextTracker.isInLoop()) {
                    this.reportError(
                        DiagCode.INVALID_BUILTIN_USAGE,
                        "Builtin '@i' can only be used inside a loop context",
                        call.base.span
                    );
                    return AST.TypeNode.asUnsigned(call.span, 'usize', 64);
                }

                const func = builtinSymbol.type!.getFunction()!;
                const currentLoopDepth = this.config.services.contextTracker.getLoopDepth();

                // Handle no arguments (default to 0)
                if (call.args.length === 0) {
                    return func.returnType || AST.TypeNode.asUnsigned(call.span, 'usize', 64);
                }

                // Handle one argument
                if (call.args.length === 1) {
                    const arg = call.args[0];
                    const argType = this.typeInference.inferExpressionType(arg);

                    if (!argType) {
                        return func.returnType || AST.TypeNode.asUnsigned(call.span, 'usize', 64);
                    }

                    // Check for negative integers first (before type compatibility check)
                    const argValue = this.evaluateConstantExpression(arg);
                    if (argValue !== null && typeof argValue === 'number' && argValue < 0) {
                        this.reportError(
                            DiagCode.INDEX_OUT_OF_BOUNDS,
                            "Loop index must be non-negative, got " + argValue,
                            arg.span
                        );
                        return func.returnType || AST.TypeNode.asUnsigned(call.span, 'usize', 64);
                    }

                    // Check if argument is compatible with usize
                    if (!this.typeInference.isTypeCompatible(func.params[0], argType)) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Argument type '${this.typeInference.getTypeDisplayName(argType)}' is not compatible with parameter type '${this.typeInference.getTypeDisplayName(func.params[0])}'`,
                            arg.span
                        );
                        return func.returnType || AST.TypeNode.asUnsigned(call.span, 'usize', 64);
                    }

                    // Check bounds for positive values
                    if (argValue !== null && typeof argValue === 'number' && argValue >= currentLoopDepth) {
                        this.reportError(
                            DiagCode.INDEX_OUT_OF_BOUNDS,
                            `Loop index ${argValue} is out of bounds (current loop depth: ${currentLoopDepth})`,
                            arg.span
                        );
                    }

                    return func.returnType || AST.TypeNode.asUnsigned(call.span, 'usize', 64);
                }

                // Too many arguments
                this.reportError(
                    DiagCode.TOO_MANY_ARGUMENTS,
                    `Builtin '@i' expects at most 1 argument, but got ${call.args.length}`,
                    call.args.length > 1 ? { start: call.args[1].span.start, end: call.args[call.args.length-1].span.end } : call.span
                );

                return func.returnType || AST.TypeNode.asUnsigned(call.span, 'usize', 64);
            }

            evaluateConstantExpression(expr: AST.ExprNode): number | null {
                if (expr.is('primary')) {
                    const primary = expr.getPrimary();
                    if (primary?.is('literal')) {
                        const literal = primary.getLiteral();
                        if (literal?.kind === 'Integer') {
                            try {
                                return parseInt(literal.value as string, 10);
                            } catch {
                                return null;
                            }
                        }
                    }
                }
                return null;
            }

            validateStructMethodCall(
                call: AST.CallNode,
                access: AST.MemberAccessNode,
                structType: AST.TypeNode
            ): AST.TypeNode | null {
                const methodName = this.typeInference.extractMemberName(access.target);
                if (!methodName) return null;

                // Get the struct scope
                const struct = structType.getStruct()!;
                const scopeId = struct.metadata?.scopeId as number | undefined;

                if (scopeId === undefined) {
                    this.reportError(
                        DiagCode.INTERNAL_ERROR,
                        `Cannot find scope for struct method call`,
                        call.span
                    );
                    return null;
                }

                const structScope = this.config.services.scopeManager.getScope(scopeId);

                // Find the method symbol
                const methodSymbol = structScope.symbols.get(methodName);
                if (!methodSymbol || methodSymbol.kind !== SymbolKind.Function) {
                    this.reportError(
                        DiagCode.SYMBOL_NOT_FOUND,
                        `Method '${methodName}' not found in struct`,
                        access.target.span
                    );
                    return null;
                }

                if (!methodSymbol.type || !methodSymbol.type.isFunction()) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `'${methodName}' is not a callable method`,
                        call.span
                    );
                    return null;
                }

                // Actually validate the call arguments!
                return this.validateMethodCall(call, methodSymbol, structScope, access.base);
            }

            validateCallArgumentsWithContext(call: AST.CallNode, funcType: AST.TypeNode): AST.TypeNode | null {
                const func = funcType.getFunction()!;

                // Get default parameter information from the function symbol
                const funcSymbol = this.typeInference.findCallTargetSymbol(call.base);
                const defaultParamIndices: number[] = (funcSymbol?.metadata as any)?.defaultParamIndices || [];

                // Calculate minimum required arguments (total params minus those with defaults)
                const minRequiredArgs = func.params.length - defaultParamIndices.length;

                // Check if we have too few arguments (less than minimum required)
                if (call.args.length < minRequiredArgs) {
                    this.reportError(
                        DiagCode.TOO_FEW_ARGUMENTS,
                        `Expected at least ${minRequiredArgs} arguments, but got ${call.args.length}`,
                        call.span
                    );
                    return null;
                }

                // Check if we have too many arguments (more than total params)
                if (call.args.length > func.params.length) {
                    this.reportError(
                        DiagCode.TOO_MANY_ARGUMENTS,
                        `Expected at most ${func.params.length} arguments, but got ${call.args.length}`,
                        call.span
                    );
                    return null;
                }

                for (let i = 0; i < call.args.length; i++) {
                    const paramType = func.params[i];
                    const arg = call.args[i];

                    // Unified character literal validation
                    if (!this.validateTypeAssignment(arg, paramType, `Argument ${i + 1}`)) {
                        continue; // Error already reported
                    }

                    let argType = this.typeInference.inferExpressionTypeWithContext(arg, paramType);

                    if (!argType) {
                        this.reportError(
                            DiagCode.TYPE_INFERENCE_FAILED,
                            `Cannot infer type for argument ${i + 1}`,
                            arg.span
                        );
                        continue;
                    }

                    if (!this.typeInference.isTypeCompatible(paramType, argType)) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Argument type '${this.typeInference.getTypeDisplayName(argType)}' is not assignable to parameter type '${this.typeInference.getTypeDisplayName(paramType)}'`,
                            arg.span
                        );
                    }
                }

                return func.returnType || AST.TypeNode.asVoid(call.span);
            }

            validateMethodCall(
                call: AST.CallNode,
                methodSymbol: Symbol,
                structScope: Scope,
                baseExpr: AST.ExprNode
            ): AST.TypeNode | null {
                this.log('symbols', `Validating method call '${methodSymbol.name}' on struct instance`);

                if (!methodSymbol.type || !methodSymbol.type.isFunction()) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `'${methodSymbol.name}' is not a callable method`,
                        call.span
                    );
                    return null;
                }

                const funcType = methodSymbol.type.getFunction()!;

                // Get default parameter information from the method symbol
                const defaultParamIndices: number[] = (methodSymbol.metadata as any)?.defaultParamIndices || [];

                // Calculate minimum required arguments (total params minus those with defaults)
                const minRequiredArgs = funcType.params.length - defaultParamIndices.length;

                // Check if we have too few arguments (less than minimum required)
                if (call.args.length < minRequiredArgs) {
                    this.reportError(
                        DiagCode.TOO_FEW_ARGUMENTS,
                        `Expected at least ${minRequiredArgs} arguments, but got ${call.args.length}`,
                        call.span
                    );
                    return null;
                }

                // Check if we have too many arguments (more than total params)
                if (call.args.length > funcType.params.length) {
                    this.reportError(
                        DiagCode.TOO_MANY_ARGUMENTS,
                        `Expected at most ${funcType.params.length} arguments, but got ${call.args.length}`,
                        call.span
                    );
                    return null;
                }

                // Validate arguments in CALLER'S scope, not struct scope
                // Arguments are expressions evaluated in the calling context
                for (let i = 0; i < call.args.length; i++) {
                    const paramType = funcType.params[i];
                    const arg = call.args[i];

                    const argType = this.typeInference.inferExpressionTypeWithContext(arg, paramType);

                    if (!argType || !this.typeInference.isTypeCompatible(paramType, argType)) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Argument type '${argType ? this.typeInference.getTypeDisplayName(argType!) : 'unknown'}' is not assignable to parameter type '${this.typeInference.getTypeDisplayName(paramType)}'`,
                            arg.span
                        );
                    }
                }

                return funcType.returnType || AST.TypeNode.asVoid(call.span);
            }

            // ===== SPECIAL EXPRESSIONS =====

            validateIntegerRangeExpr(expr: AST.ExprNode, rangeType: string, span: AST.Span): void {
                const exprType = this.typeInference.inferExpressionType(expr);
                if (exprType && !this.typeInference.isIntegerType(exprType)) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Range ${rangeType} must be integer type, got '${this.typeInference.getTypeDisplayName(exprType)}'`,
                        span
                    );
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────── [5] Type Level ───────────────────────────┐

            validateStructType(structType: AST.StructTypeNode, symbol: Symbol): void {
                let typeScope: Scope | null = null;

                if (structType.metadata?.scopeId !== undefined) {
                    try {
                        typeScope = this.config.services.scopeManager.getScope(structType.metadata.scopeId as number);
                    } catch {
                        typeScope = null;
                    }
                }

                if (!typeScope && structType.name && structType.name !== 'Anonymous') {
                    typeScope = this.config.services.scopeManager.findScopeByName(structType.name, ScopeKind.Type);
                }

                if (!typeScope) {
                    typeScope = this.config.services.scopeManager.findChildScopeByNameFromId(
                        symbol.name,
                        symbol.scope,
                        ScopeKind.Type
                    );
                }

                if (!typeScope) {
                    this.reportError(
                        DiagCode.INTERNAL_ERROR,
                        `Cannot find type scope for struct validation`,
                        structType.span
                    );
                    return;
                }

                this.config.services.contextTracker.withSavedState(() => {
                    this.config.services.scopeManager.withScope(typeScope!.id, () => {
                        for (const member of structType.members) {
                            if (member.isField()) {
                                const field = member.getField()!;

                                // Validate field visibility
                                if (field.visibility.kind === 'Static' && field.mutability.kind === 'Mutable') {
                                    this.reportError(
                                        DiagCode.INVALID_VISIBILITY,
                                        `Struct field '${field.ident.name}' cannot be 'static'`,
                                        field.span
                                    );
                                    continue;
                                }

                                // Resolve field type
                                if (field.type) {
                                    this.resolveTypeNode(field.type);
                                }

                                // Validate field initializer
                                if (field.initializer) {
                                    // Special handling for array literals with explicit type
                                    if (field.type && field.type.isArray()) {
                                        this.validateArrayLiteralWithTargetType(
                                            field.initializer,
                                            field.type,
                                            field.ident.name
                                        );
                                        continue; // Skip to next field
                                    }

                                    const initType = this.typeInference.inferExpressionType(field.initializer);

                                    if (field.type && initType) {
                                        // Unified validation
                                        this.validateTypeAssignment(
                                            field.initializer,
                                            field.type,
                                            `Field '${field.ident.name}' initializer`
                                        );

                                        if (!this.validateArrayAssignment(
                                            field.type,
                                            initType,
                                            field.initializer.span,
                                            `Field '${field.ident.name}' initializer`
                                        )) {
                                            continue;
                                        }

                                        // PASS SOURCE EXPRESSION for strict pointer checking
                                        if (!this.typeInference.isTypeCompatible(field.type, initType, field.initializer)) {
                                            this.reportError(
                                                DiagCode.TYPE_MISMATCH,
                                                `Field '${field.ident.name}' initializer type '${this.typeInference.getTypeDisplayName(initType)}' doesn't match field type '${this.typeInference.getTypeDisplayName(field.type)}'`,
                                                field.initializer.span
                                            );
                                        }
                                    } else if (!field.type && initType) {
                                        field.type = initType;
                                    }

                                    // NEW: Check if initializer is an enum variant that requires a value
                                    if (field.initializer.is('postfix')) {
                                        const postfix = field.initializer.getPostfix();
                                        if (postfix?.kind === 'memberAccess') {
                                            const access = postfix.getMemberAccess()!;
                                            const baseType = this.typeInference.inferExpressionType(access.base);

                                            if (baseType) {
                                                const resolvedBase = this.typeInference.resolveIdentifierType(baseType);

                                                if (resolvedBase.isEnum()) {
                                                    const memberName = this.typeInference.extractMemberName(access.target);
                                                    const enumDef = resolvedBase.getEnum()!;
                                                    const variant = enumDef.variants.find(v => v.ident.name === memberName);

                                                    if (variant && variant.type && memberName) {
                                                        this.validateEnumVariantAssignment(variant, memberName, field.initializer.span);
                                                        return;
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    if (field.type) {
                                        this.validateValueFitsInType(field.initializer, field.type);
                                    }
                                }
                            } else {
                                const method = member.getMethod()!;
                                this.validateFuncStmt(method);
                            }
                        }
                    });
                });
            }

            validateStructConstruction(
                objNode: AST.ObjectNode,
                structType: AST.TypeNode,
                initSpan: AST.Span
            ): boolean {
                if (!structType.isStruct()) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Cannot initialize non-struct type with object literal`,
                        initSpan
                    );
                    return false;
                }

                const struct = structType.getStruct()!;

                // Validate constructor name matches type name
                if (objNode.ident) {
                    const constructorName = objNode.ident.name;
                    const expectedName = struct.name || this.extractTypeName(structType);

                    if (expectedName && constructorName !== expectedName) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Constructor '${constructorName}' does not match expected type '${expectedName}'`,
                            objNode.ident.span
                        );
                        return false;
                    }
                }

                const structFields = new Map<string, AST.FieldNode>();
                for (const member of struct.members) {
                    if (member.isField()) {
                        const field = member.source as AST.FieldNode;
                        structFields.set(field.ident.name, field);
                    }
                }

                const providedFields = new Set<string>();

                for (const prop of objNode.props) {
                    const fieldName = prop.key.name;
                    providedFields.add(fieldName);

                    const structField = structFields.get(fieldName);
                    if (!structField) {
                        this.reportError(
                            DiagCode.SYMBOL_NOT_FOUND,
                            `Struct '${struct.name || '<anonymous>'}' has no field '${fieldName}'`,
                            prop.key.span
                        );
                        continue;
                    }

                    if (structField.visibility.kind === 'Static') {
                        this.reportError(
                            DiagCode.INVALID_STATIC_ACCESS,
                            `Cannot initialize static field '${fieldName}' in constructor. Static fields belong to the type, not instances.`,
                            prop.key.span
                        );
                        continue;
                    }

                    // Unified validation for field values
                    if (prop.val && structField.type) {
                        if (!this.validateTypeAssignment(
                            prop.val,
                            structField.type,
                            `Field '${fieldName}'`
                        )) {
                            continue; // Error already reported
                        }

                        const valueType = this.typeInference.inferExpressionType(prop.val);

                        if (valueType && !this.typeInference.isTypeCompatible(structField.type, valueType)) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Field '${fieldName}' expects type '${this.typeInference.getTypeDisplayName(structField.type)}' but got '${this.typeInference.getTypeDisplayName(valueType)}'`,
                                prop.val.span
                            );
                        }
                    }
                }

                // Check for missing required fields (skip static fields)
                let hasMissingFields = false;
                for (const [fieldName, field] of structFields) {
                    if (field.visibility.kind === 'Static') {
                        continue;
                    }

                    if (!providedFields.has(fieldName) && !field.initializer) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Missing required field '${fieldName}' in struct initialization`,
                            initSpan
                        );
                        hasMissingFields = true;
                    }
                }

                return !hasMissingFields;
            }

            validateEnumType(enumType: AST.EnumTypeNode, symbol: Symbol): void {
                const typeScope = this.config.services.scopeManager.findChildScopeByName(symbol.name, ScopeKind.Type);
                if (!typeScope) return;

                this.config.services.contextTracker.withSavedState(() => {
                    this.config.services.scopeManager.withScope(typeScope.id, () => {
                        for (const variant of enumType.variants) {
                            if (variant.type) {
                                this.resolveTypeNode(variant.type);
                            }
                        }
                    });
                });
            }

            validateComptimeExpression(expr: AST.ExprNode, context: string): bigint | null {
                const errorCountBefore = this.config.services.diagnosticManager.length();
                const comptimeValue = this.ExpressionEvaluator.evaluateComptimeExpression(expr);
                const errorCountAfter = this.config.services.diagnosticManager.length();

                if (errorCountAfter > errorCountBefore) {
                    return null; // Errors already reported
                }

                if (comptimeValue === null) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `${context} must be a compile-time constant expression. Use literals, comptime functions, or compile-time arithmetic.`,
                        expr.span
                    );
                    return null;
                }

                return comptimeValue;
            }

            validateArraySize(sizeExpr: AST.ExprNode): void {
                const comptimeValue = this.validateComptimeExpression(sizeExpr, 'Array size');
                if (comptimeValue === null) return;

                // Validate the computed size is positive
                if (comptimeValue <= BigInt(0)) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Array size must be positive, got ${comptimeValue}`,
                        sizeExpr.span
                    );
                    return;
                }

                // Check for reasonable size limits
                const MAX_ARRAY_SIZE = BigInt(2_147_483_647);
                if (comptimeValue > MAX_ARRAY_SIZE) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Array size ${comptimeValue} exceeds maximum allowed size ${MAX_ARRAY_SIZE}`,
                        sizeExpr.span
                    );
                    return;
                }

            }

            validateSwitchExhaustiveness(MatchNode: AST.MatchNode): void {
                const condType = this.typeInference.inferExpressionType(MatchNode.condExpr);
                if (!condType) return;

                // Resolve identifier types first
                let resolvedType = condType;
                if (condType.isIdent()) {
                    const ident = condType.getIdent()!;
                    const typeSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                    if (typeSymbol && typeSymbol.type) {
                        resolvedType = typeSymbol.type;
                    }
                }

                // Handle enum exhaustiveness
                if (resolvedType.isEnum()) {
                    const enumType = resolvedType.getEnum()!;
                    const coveredVariants = new Set<string>();

                    for (const switchCase of MatchNode.cases) {
                        if (switchCase.expr) {
                            const variantName = this.extractEnumVariantName(switchCase.expr);
                            if (variantName) {
                                coveredVariants.add(variantName);
                            }
                        }
                    }

                    // Check exhaustiveness only if no default case
                    if (!MatchNode.defCase) {
                        const missingVariants: string[] = [];
                        for (const variant of enumType.variants) {
                            if (!coveredVariants.has(variant.ident.name)) {
                                missingVariants.push(variant.ident.name);
                            }
                        }

                        if (missingVariants.length > 0) {
                            this.reportError(
                                DiagCode.TYPE_MISMATCH,
                                `Switch is not exhaustive. Missing variants: ${missingVariants.join(', ')}`,
                                MatchNode.span
                            );
                        }
                    }
                }

                // Handle boolean exhaustiveness
                if (resolvedType.isBool()) {
                    const hasTrue = MatchNode.cases.some((c: AST.CaseNode) => this.typeInference.isBoolLiteral(c.expr, true));
                    const hasFalse = MatchNode.cases.some((c: AST.CaseNode) => this.typeInference.isBoolLiteral(c.expr, false));

                    if (!MatchNode.defCase && (!hasTrue || !hasFalse)) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            'Match on boolean must handle both true and false cases or have a default',
                            MatchNode.span
                        );
                    }
                }
            }

            validateArrayAssignment(
                declaredType: AST.TypeNode,
                initType: AST.TypeNode,
                initSpan: AST.Span,
                contextName: string
            ): boolean {
                if (!declaredType.isArray() || !initType.isArray()) {
                    return true; // Not an array assignment, validation not applicable
                }

                const targetArray = declaredType.getArray()!;
                const sourceArray = initType.getArray()!;

                if (!targetArray.size || !sourceArray.size) {
                    return true; // No size constraints to validate
                }

                const targetSize = this.ExpressionEvaluator.extractIntegerValue(targetArray.size);
                const sourceSize = this.ExpressionEvaluator.extractIntegerValue(sourceArray.size);

                if (targetSize === undefined || sourceSize === undefined) {
                    return true; // Cannot extract sizes, skip validation
                }

                if (targetSize !== sourceSize) {
                    const msg = sourceSize > targetSize
                        ? `Array literal has more elements than the fixed array type`
                        : `Array literal has fewer elements than the fixed array type`;

                    this.reportError(
                        DiagCode.ARRAY_SIZE_MISMATCH,
                        `${msg}`,
                        initSpan
                    );
                    return false; // Validation failed
                }

                return true; // Sizes match, validation passed
            }

            checkCircularTypeDependency(
                typeNode: AST.TypeNode,
                typeName: string,
                allowIndirection: boolean = false,
                pathHasIndirection: boolean = false
            ): boolean {
                const key = `${typeName}:${typeNode.kind}:${typeNode.span.start}`;

                if (this.circularTypeDetectionStack.has(key)) {
                    if (!pathHasIndirection) {
                        this.reportError(
                            DiagCode.TYPE_MISMATCH,
                            `Circular type dependency detected for '${typeName}'. Use pointer or optional to break the cycle.`,
                            typeNode.span
                        );
                        return true;
                    }
                    return false;
                }

                this.circularTypeDetectionStack.add(key);

                try {
                    switch (typeNode.kind) {
                        case 'ident': {
                            const ident = typeNode.getIdent()!;
                            if (!ident.builtin && ident.name === typeName) {
                                if (!pathHasIndirection) {
                                    this.reportError(
                                        DiagCode.TYPE_MISMATCH,
                                        `Direct self-reference in type '${typeName}'. Use pointer or optional to break the cycle.`,
                                        typeNode.span
                                    );
                                    return true;
                                }
                                return false;
                            }

                            if (!ident.builtin) {
                                const typeSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
                                if (typeSymbol && typeSymbol.type && typeSymbol.kind === SymbolKind.Definition) {
                                    return this.checkCircularTypeDependency(
                                        typeSymbol.type,
                                        typeName,
                                        allowIndirection,
                                        pathHasIndirection
                                    );
                                }
                            }
                            break;
                        }

                        case 'array':
                            return this.checkCircularTypeDependency(
                                typeNode.getArray()!.target,
                                typeName,
                                allowIndirection,
                                pathHasIndirection
                            );

                        case 'optional':
                        case 'pointer':
                            if (allowIndirection) {
                                return false;
                            }
                            return this.checkCircularTypeDependency(
                                typeNode.kind === 'optional'
                                    ? typeNode.getOptional()!.target
                                    : typeNode.getPointer()!.target,
                                typeName,
                                allowIndirection,
                                true
                            );

                        case 'tuple':
                            for (const field of typeNode.getTuple()!.fields) {
                                if (this.checkCircularTypeDependency(
                                    field,
                                    typeName,
                                    allowIndirection,
                                    pathHasIndirection
                                )) {
                                    return true;
                                }
                            }
                            break;

                        case 'struct': {
                            const struct = typeNode.getStruct()!;
                            for (const member of struct.members) {
                                if (member.isField()) {
                                    const field = member.source as AST.FieldNode;
                                    if (field.type && this.checkCircularTypeDependency(
                                        field.type,
                                        typeName,
                                        allowIndirection,
                                        pathHasIndirection
                                    )) {
                                        return true;
                                    }
                                }
                            }
                            break;
                        }

                        case 'enum': {
                            const enumType = typeNode.getEnum()!;
                            for (const variant of enumType.variants) {
                                if (variant.type && this.checkCircularTypeDependency(
                                    variant.type,
                                    typeName,
                                    allowIndirection,
                                    pathHasIndirection
                                )) {
                                    return true;
                                }
                            }
                            break;
                        }

                        case 'union': {
                            const unionType = typeNode.getUnion()!;
                            for (const member of unionType.types) {
                                if (this.checkCircularTypeDependency(
                                    member,
                                    typeName,
                                    allowIndirection,
                                    pathHasIndirection
                                )) {
                                    return true;
                                }
                            }
                            break;
                        }

                        case 'paren': {
                            return this.checkCircularTypeDependency(
                                typeNode.getParen()!.type,
                                typeName,
                                allowIndirection,
                                pathHasIndirection
                            )
                        }
                    }

                    return false;
                } finally {
                    this.circularTypeDetectionStack.delete(key);
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────── UNIFIED CHARACTER LITERAL VALIDATION ────────────────────────┐

            validateCharacterLiteralCompatibility(
                expr: AST.ExprNode,
                targetType: AST.TypeNode,
                context: string
            ): boolean {
                // Only validate character literals
                if (!this.typeInference.isCharacterLiteral(expr)) {
                    return true; // Not a character literal, skip validation
                }

                const primary = expr.getPrimary()!;
                const literal = primary.getLiteral()!;
                const charValue = literal.value as string;

                // Empty character - always valid
                if (charValue.length === 0) return true;

                const codePoint = charValue.codePointAt(0) || 0;
                const resolvedType = this.typeInference.resolveIdentifierType(targetType);

                // Check if target is char (u8) - can only hold ASCII (0-255)
                if (resolvedType.isUnsigned() && resolvedType.getWidth() === 8) {
                    if (codePoint > 255) {
                        this.reportError(
                            DiagCode.ARITHMETIC_OVERFLOW,
                            `Value ${codePoint} does not fit in type '${this.typeInference.getTypeDisplayName(targetType)}' (valid range: 0 to 255)`,
                            expr.span
                        );
                        return false;
                    }
                }
                // Check if target is cpoint (u21) - can hold up to 2,097,151
                else if (resolvedType.isUnsigned() && resolvedType.getWidth() === 21) {
                    if (codePoint > 0x1FFFFF) {
                        this.reportError(
                            DiagCode.ARITHMETIC_OVERFLOW,
                            `Value ${codePoint} does not fit in type '${this.typeInference.getTypeDisplayName(targetType)}' (valid range: 0 to 2097151)`,
                            expr.span
                        );
                        return false;
                    }
                }

                return true;
            }

            validateTypeAssignment(
                sourceExpr: AST.ExprNode,
                targetType: AST.TypeNode,
                context: string
            ): boolean {
                // Only validate character literal compatibility (value range check)
                if (!this.validateCharacterLiteralCompatibility(sourceExpr, targetType, context)) {
                    return false; // Error already reported
                }

                // Don't do type compatibility check here - it's done by the caller
                // (validateLetStmt, validateParameter, etc.)
                return true;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            validateValueFitsInType(expr: AST.ExprNode, targetType: AST.TypeNode): void {
                // Handle both integers and floats
                const unwrapped = this.typeInference.resolveIdentifierType(targetType);

                // Check if it's an integer type
                if (unwrapped.isSigned() || unwrapped.isUnsigned() || unwrapped.isComptimeInt()) {
                    const value = this.ExpressionEvaluator.evaluateComptimeExpression(expr, targetType);
                    // Value check already done in evaluateComptimeExpression
                    return;
                }

                // Check if it's a float type
                if (unwrapped.isFloat() || unwrapped.isComptimeFloat()) {
                    const value = this.ExpressionEvaluator.evaluateComptimeFloat(expr, targetType);
                    // Value check already done in evaluateComptimeFloat
                    return;
                }

                // Not a numeric type - no validation needed
            }

            isValidThrowType(thrownType: AST.TypeNode, functionErrorType: AST.TypeNode, span: AST.Span): boolean {
                // Resolve the error type if it's an identifier
                const resolvedErrorType = this.typeInference.resolveIdentifierType(functionErrorType);

                // CASE 1: Function expects errset
                if (resolvedErrorType.isErrset()) {
                    const errorSet = resolvedErrorType.getErrset()!;

                    // If throwing an identifier, check if it's a member of the error set
                    if (thrownType.isIdent()) {
                        const thrownIdent = thrownType.getIdent()!;
                        const isMember = errorSet.members.some(member => member.name === thrownIdent.name);
                        return isMember;
                    }

                    return false;
                }

                // CASE 2: Function expects err primitive type
                if (resolvedErrorType.isPrimitive()) {
                    const prim = resolvedErrorType.getPrimitive();
                    if (prim?.kind === 'err') {
                        // The error name is stored in text field
                        // Compare with thrown type's name
                        if (thrownType.isIdent()) {
                            return thrownType.getIdent()!.name === prim.text;
                        }
                    }
                }

                return true;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            extractTypeFromInitializer(expr: AST.ExprNode): AST.TypeNode | null {
                if (expr.kind !== 'primary') return null;

                const primary = expr.getPrimary();
                if (!primary || primary.kind !== 'type') return null;

                return primary.getType();
            }

            extractSymbolFromExpression(expr: AST.ExprNode): Symbol | null {
                if (expr.is('primary')) {
                    const primary = expr.getPrimary();
                    if (primary?.is('ident')) {
                        const ident = primary.getIdent();
                        if (ident) {
                            return this.config.services.scopeManager.lookupSymbol(ident.name);
                        }
                    }
                }
                return null;
            }

            extractBuiltinName(expr: AST.ExprNode): string | null {
                if (expr.kind !== 'primary') return null;
                const primary = expr.getPrimary();
                if (!primary || primary.kind !== 'ident') return null;
                const ident = primary.getIdent();
                return (ident?.name ? '@'+ident.name : null) || null;
            }

            extractEnumVariantName(expr: AST.ExprNode): string | null {
                if (expr.is('postfix')) {
                    const postfix = expr.getPostfix();
                    if (postfix?.kind === 'memberAccess') {
                        const access = postfix.getMemberAccess()!;
                        return this.typeInference.extractMemberName(access.target);
                    }
                }
                return null;
            }

            extractTypeName(typeNode: AST.TypeNode): string | null {
                if (typeNode.isIdent()) {
                    return typeNode.getIdent()!.name;
                }
                if (typeNode.isStruct()) {
                    return typeNode.getStruct()!.name || null;
                }
                return null;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            findModuleScope(moduleName: string): Scope | null {
                const moduleScope = this.config.services.scopeManager.findScopeByName(moduleName, ScopeKind.Module);
                if (!moduleScope) {
                    this.reportError(DiagCode.MODULE_SCOPE_NOT_FOUND, `Module scope for '${moduleName}' not found`);
                }
                return moduleScope;
            }

            private statementAlwaysExits(stmt: AST.StmtNode): boolean {
                switch (stmt.kind) {
                    case 'return':
                    case 'throw':
                        return true;

                    case 'expression': {
                        const expr = stmt.getExpr();
                        if (expr?.is('primary')) {
                            const primary = expr.getPrimary();
                            if (primary?.kind === 'unreachable') {
                                return true;
                            }
                        }
                        return false;
                    }

                    case 'block': {
                        const block = stmt.getBlock?.();
                        if (block) {
                            return this.blockAlwaysExits(block);
                        }
                        return false;
                    }

                    case 'while':
                    case 'do':
                    case 'for':
                        // Loops don't guarantee exit (might not execute or might break)
                        return false;

                    default:
                        return false;
                }
            }
            private blockAlwaysExits(block: AST.BlockStmtNode): boolean {
                // A block exits if any statement in it exits
                for (const stmt of block.stmts) {
                    if (this.statementAlwaysExits(stmt)) {
                        return true;
                    }
                }
                return false;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            isBuiltinFunction(baseExpr: AST.ExprNode): boolean {
                if (baseExpr.isIdent()) {
                    const ident = baseExpr.getIdent();
                    return ident?.builtin === true || (ident?.name.startsWith('@') === true);
                }

                return false;
            }

            isInsideFunctionScope(): boolean {
                let currentScope = this.config.services.scopeManager.getCurrentScope();

                while (currentScope) {
                    if (currentScope.kind === ScopeKind.Function) {
                        return true;
                    }

                    // Don't stop at Type scopes - they can contain methods
                    // Only stop at Module boundaries
                    if (currentScope.kind === ScopeKind.Module || currentScope.kind === ScopeKind.Global) {
                        return false;
                    }

                    // Walk up the scope chain
                    if (currentScope.parent !== null) {
                        try {
                            currentScope = this.config.services.scopeManager.getScope(currentScope.parent);
                        } catch {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }

                return false;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            init(): boolean {
                this.config.services.contextTracker.reset();
                this.config.services.contextTracker.setPhase(AnalysisPhase.TypeValidation);

                const globalScope = this.config.services.scopeManager.getGlobalScope();
                this.config.services.scopeManager.setCurrentScope(globalScope.id);
                this.config.services.contextTracker.setScope(globalScope.id);

                this.log('verbose', 'Type validation initialized');
                return true;
            }

            initStats(): TypeValidationStats {
                return {
                    modulesProcessed        : 0,
                    typesInferred           : 0,
                    typesCached             : 0,
                    compatibilityChecks     : 0,
                    callsValidated          : 0,
                    memberAccessValidated   : 0,
                    assignmentsValidated    : 0,
                    returnsValidated        : 0,
                    errors                  : 0,
                    startTime               : Date.now()
                };
            }

            initTypeValidatorContext(): TypeValidatorContext {
                return {
                    currentModule   : '',
                    moduleStack     : [],
                    typeCache       : new Map(),
                };
            }

            validateTypeCompatibility(
                target: AST.TypeNode,
                source: AST.TypeNode,
                context: string,
                span: AST.Span,
                sourceExpr?: AST.ExprNode
            ): boolean {
                if (this.typeInference.isTypeCompatible(target, source, sourceExpr)) {
                    return true;
                }

                this.reportError(
                    DiagCode.TYPE_MISMATCH,
                    `Cannot assign type '${this.typeInference.getTypeDisplayName(source)}' to ${context} of type '${this.typeInference.getTypeDisplayName(target)}'`,
                    span
                );
                return false;
            }

            validateFunctionScope(stmt: any, stmtType: string): boolean {
                const isInFunction = this.isInsideFunctionScope();
                if (!isInFunction) {
                    this.reportError(
                        DiagCode.ANALYSIS_ERROR,
                        `${stmtType} statement outside of function`,
                        stmt.span
                    );
                }
                return isInFunction;
            }

            validateEnumVariantAssignment(
                variant: any,
                memberName: string,
                span: AST.Span
            ): void {
                if (variant.type) {
                    this.reportError(
                        DiagCode.TYPE_MISMATCH,
                        `Enum variant '${memberName}' requires a value of type '${this.typeInference.getTypeDisplayName(variant.type)}'. Use '${memberName}(value)' syntax.`,
                        span
                    );
                }
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ---- ────────────────────────────────┐

            logStatistics(): void {
                const duration = Date.now() - this.stats.startTime;
                this.log('verbose',
                    `Type Validation Statistics :\n` +
                    `  Duration                 : ${duration}ms\n` +
                    `  Types inferred           : ${this.stats.typesInferred}\n` +
                    `  Types cached             : ${this.stats.typesCached}\n` +
                    `  Compatibility checks     : ${this.stats.compatibilityChecks}\n` +
                    `  Calls validated          : ${this.stats.callsValidated}\n` +
                    `  Member access validated  : ${this.stats.memberAccessValidated}\n` +
                    `  Assignments validated    : ${this.stats.assignmentsValidated}\n` +
                    `  Returns validated        : ${this.stats.returnsValidated}\n` +
                    `  Cache size               : ${this.typeCtx.typeCache.size}\n` +
                    `  Errors                   : ${this.stats.errors}`
                );
            }

            markSymbolAsTypeChecked(symbol: Symbol, type?: AST.TypeNode): void {
                symbol.isTypeChecked = true;
                if (type) {
                    symbol.type = type;
                }
            }

            logSymbolValidation(action: string, symbolName: string): void {
                this.log('symbols', `${action} '${symbolName}'`);
            }

            handleStatement(
                stmt: any,
                validator: (stmt: any) => void,
                scope?: Scope,
                moduleName?: string
            ): void {
                validator(stmt);
            }

        // └──────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝