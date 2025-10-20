var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// lib/components/DiagnosticManager.ts
var DiagCode = /* @__PURE__ */ ((DiagCode2) => {
  DiagCode2["INTERNAL_ERROR"] = "INTERNAL_ERROR";
  DiagCode2["PARSER_ERROR"] = "PARSER_ERROR";
  DiagCode2["MODULE_SCOPE_NOT_FOUND"] = "MODULE_SCOPE_NOT_FOUND";
  DiagCode2["MODULE_NOT_FOUND"] = "MODULE_NOT_FOUND";
  DiagCode2["TYPE_INFERENCE_FAILED"] = "TYPE_INFERENCE_FAILED";
  DiagCode2["OPTIMIZATION_HINT"] = "OPTIMIZATION_HINT";
  DiagCode2["SYMBOL_NOT_FOUND"] = "SYMBOL_NOT_FOUND";
  DiagCode2["ANONYMOUS_STRUCT"] = "ANONYMOUS_STRUCT";
  DiagCode2["TYPE_CYCLE_DETECTED"] = "TYPE_CYCLE_DETECTE";
  DiagCode2["TYPE_NESTING_TOO_DEEP"] = "TYPE_NESTING_TOO_DEEP";
  DiagCode2["SYMBOL_NOT_EXPORTED"] = "SYMBOL_NOT_EXPORTED";
  DiagCode2["MISSING_REQUIRED_FIELD"] = "MISSING_REQUIRED_FIELD";
  DiagCode2["INVALID_VISIBILITY"] = "INVALID_VISIBILITY";
  DiagCode2["INVALID_TYPE_WIDTH"] = "INVALID_TYPE_WIDTH";
  DiagCode2["MISSING_RETURN_STATEMENT"] = "MISSING_RETURN_STATEMENT";
  DiagCode2["INVALID_STATIC_ACCESS"] = "INVALID_STATIC_ACCESS";
  DiagCode2["SYMBOL_NOT_ACCESSIBLE"] = "SYMBOL_NOT_ACCESSIBLE";
  DiagCode2["INVALID_SIZEOF_TARGET"] = "INVALID_SIZEOF_TARGET";
  DiagCode2["THROW_WITHOUT_ERROR_TYPE"] = "THROW_WITHOUT_ERROR_TYPE";
  DiagCode2["THROW_TYPE_MISMATCH"] = "THROW_TYPE_MISMATCH";
  DiagCode2["THROW_OUTSIDE_FUNCTION"] = "THROW_OUTSIDE_FUNCTION";
  DiagCode2["INVALID_ERROR_TYPE"] = "INVALID_ERROR_TYPE";
  DiagCode2["ERROR_MEMBER_NOT_FOUND"] = "ERROR_MEMBER_NOT_FOUND";
  DiagCode2["SELFERR_INVALID_CONTEXT"] = "SELFERR_INVALID_CONTEXT";
  DiagCode2["THROW_NON_ERROR_TYPE"] = "THROW_NON_ERROR_TYPE";
  DiagCode2["TYPE_VALIDATION_FAILED"] = "TYPE_VALIDATION_FAILED";
  DiagCode2["INVALID_TYPE_OPERATION"] = "INVALID_TYPE_OPERATION";
  DiagCode2["TYPE_INCOMPATIBLE"] = "TYPE_INCOMPATIBLE";
  DiagCode2["TYPE_INFERENCE_ERROR"] = "TYPE_INFERENCE_ERROR";
  DiagCode2["NULL_POINTER_ERROR"] = "NULL_POINTER_ERROR";
  DiagCode2["TYPE_SAFETY_ERROR"] = "TYPE_SAFETY_ERROR";
  DiagCode2["SYNTAX_ERROR"] = "SYNTAX_ERROR";
  DiagCode2["ANALYSIS_ERROR"] = "ANALYSIS_ERROR";
  DiagCode2["ENTRY_MODULE_NOT_FOUND"] = "ENTRY_MODULE_NOT_FOUND";
  DiagCode2["ENTRY_MODULE_NO_MAIN"] = "ENTRY_MODULE_NO_MAIN";
  DiagCode2["ENTRY_MODULE_PRIVATE_MAIN"] = "ENTRY_MODULE_PRIVATE_MAIN";
  DiagCode2["TYPE_MISMATCH"] = "TYPE_MISMATCH";
  DiagCode2["TYPE_MISMATCH_CALL"] = "TYPE_MISMATCH_CALL";
  DiagCode2["TYPE_MISMATCH_ASSIGNMENT"] = "TYPE_MISMATCH_ASSIGNMENT";
  DiagCode2["TYPE_MISMATCH_RETURN"] = "TYPE_MISMATCH_RETURN";
  DiagCode2["TYPE_MISMATCH_PARAMETER"] = "TYPE_MISMATCH_PARAMETER";
  DiagCode2["TYPE_MISMATCH_FIELD"] = "TYPE_MISMATCH_FIELD";
  DiagCode2["ARRAY_TO_NON_ARRAY"] = "ARRAY_TO_NON_ARRAY";
  DiagCode2["NON_ARRAY_TO_ARRAY"] = "NON_ARRAY_TO_ARRAY";
  DiagCode2["BOOL_TO_NON_BOOL"] = "BOOL_TO_NON_BOOL";
  DiagCode2["NON_BOOL_TO_BOOL"] = "NON_BOOL_TO_BOOL";
  DiagCode2["NEGATIVE_TO_UNSIGNED"] = "NEGATIVE_TO_UNSIGNED";
  DiagCode2["LITERAL_OVERFLOW"] = "LITERAL_OVERFLOW";
  DiagCode2["CANNOT_INFER_TYPE"] = "CANNOT_INFER_TYPE";
  DiagCode2["UNDEFINED_IDENTIFIER"] = "UNDEFINED_IDENTIFIER";
  DiagCode2["UNDEFINED_IDENTIFIER_MEMBER"] = "UNDEFINED_IDENTIFIER_MEMBER";
  DiagCode2["UNDEFINED_IDENTIFIER_TYPEOF"] = "UNDEFINED_IDENTIFIER_TYPEOF";
  DiagCode2["UNDEFINED_BUILTIN"] = "UNDEFINED_BUILTIN";
  DiagCode2["UNDEFINED_FUNCTION"] = "UNDEFINED_FUNCTION";
  DiagCode2["NOT_A_FUNCTION"] = "NOT_A_FUNCTION";
  DiagCode2["USED_BEFORE_DECLARED"] = "USED_BEFORE_DECLARED";
  DiagCode2["USED_BEFORE_INITIALIZED"] = "USED_BEFORE_INITIALIZED";
  DiagCode2["UNDEFINED_TYPE"] = "UNDEFINED_TYPE";
  DiagCode2["UNSUPPORTED_TYPE"] = "UnsupportedType";
  DiagCode2["VARIABLE_SELF_INIT"] = "VARIABLE_SELF_INIT";
  DiagCode2["PARAMETER_SELF_INIT"] = "PARAMETER_SELF_INIT";
  DiagCode2["PARAMETER_FORWARD_REFERENCE"] = "PARAMETER_FORWARD_REFERENCE";
  DiagCode2["USE_SHADOWING"] = "USE_SHADOWING";
  DiagCode2["DEFINITION_SHADOWING"] = "DEFINITION_SHADOWING";
  DiagCode2["VARIABLE_SHADOWING"] = "VARIABLE_SHADOWING";
  DiagCode2["FUNCTION_SHADOWING"] = "FUNCTION_SHADOWING";
  DiagCode2["PARAMETER_SHADOWING"] = "PARAMETER_SHADOWING";
  DiagCode2["STRUCT_FIELD_SHADOWING"] = "STRUCT_FIELD_SHADOWING";
  DiagCode2["ENUM_VARIANT_SHADOWING"] = "ENUM_VARIANT_SHADOWING";
  DiagCode2["ERROR_SHADOWING"] = "ERROR_SHADOWING";
  DiagCode2["DUPLICATE_SYMBOL"] = "DUPLICATE_SYMBOL";
  DiagCode2["TOO_FEW_ARGUMENTS"] = "TOO_FEW_ARGUMENTS";
  DiagCode2["TOO_MANY_ARGUMENTS"] = "TOO_MANY_ARGUMENTS";
  DiagCode2["UNUSED_VARIABLE"] = "UNUSED_VARIABLE";
  DiagCode2["UNUSED_PARAMETER"] = "UNUSED_PARAMETER";
  DiagCode2["UNUSED_FUNCTION"] = "UNUSED_FUNCTION";
  DiagCode2["UNARY_MINUS_NON_NUMERIC"] = "UNARY_MINUS_NON_NUMERIC";
  DiagCode2["UNARY_PLUS_NON_NUMERIC"] = "UNARY_PLUS_NON_NUMERIC";
  DiagCode2["IMPORT_NOT_FOUND"] = "IMPORT_NOT_FOUND";
  DiagCode2["IMPORT_CIRCULAR_DEPENDENCY"] = "IMPORT_CIRCULAR_DEPENDENCY";
  DiagCode2["IMPORT_PRIVATE_SYMBOL"] = "IMPORT_PRIVATE_SYMBOL";
  DiagCode2["NEGATIVE_SHIFT"] = "NEGATIVE_SHIFT";
  DiagCode2["SHIFT_OVERFLOW"] = "SHIFT_OVERFLOW";
  DiagCode2["SHIFT_RESULT_OVERFLOW"] = "SHIFT_RESULT_OVERFLOW";
  DiagCode2["ARITHMETIC_OVERFLOW"] = "ARITHMETIC_OVERFLOW";
  DiagCode2["ARITHMETIC_OVERFLOW_COMPTIME"] = "ARITHMETIC_OVERFLOW_COMPTIME";
  DiagCode2["POTENTIAL_OVERFLOW"] = "POTENTIAL_OVERFLOW";
  DiagCode2["DIVISION_BY_ZERO"] = "DIVISION_BY_ZERO";
  DiagCode2["MODULO_BY_ZERO"] = "MODULO_BY_ZERO";
  DiagCode2["PRECISION_LOSS"] = "PRECISION_LOSS";
  DiagCode2["ARITHMETIC_ERROR"] = "ARITHMETIC_ERROR";
  DiagCode2["ARRAY_SIZE_MISMATCH"] = "ARRAY_SIZE_MISMATCH";
  DiagCode2["MUTABILITY_MISMATCH"] = "MUTABILITY_MISMATCH";
  DiagCode2["MUTABILITY_MISMATCH_POINTER"] = "MUTABILITY_MISMATCH_POINTER";
  DiagCode2["POTENTIAL_PRECISION_LOSS"] = "POTENTIAL_PRECISION_LOSS";
  DiagCode2["POTENTIAL_DATA_LOSS"] = "POTENTIAL_DATA_LOSS";
  DiagCode2["COMPTIME_EVAL_FAILED"] = "COMPTIME_EVAL_FAILED";
  DiagCode2["COMPTIME_NON_CONST"] = "COMPTIME_NON_CONST";
  return DiagCode2;
})(DiagCode || {});
var DiagKind = /* @__PURE__ */ ((DiagKind2) => {
  DiagKind2["ERROR"] = "error";
  DiagKind2["WARNING"] = "warning";
  DiagKind2["INFO"] = "info";
  return DiagKind2;
})(DiagKind || {});
var DiagnosticManager = class {
  constructor(contextTracker, strictMode = false) {
    // ┌──────────────────────────────── INIT ──────────────────────────────┐
    this.diagnostics = [];
    this.strictMode = strictMode;
    this.contextTracker = contextTracker;
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── MAIN ──────────────────────────────┐
  push(diagnostic) {
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
    if (this.strictMode && this.diagnostics.length > 0 && diagnostic.kind === "error" /* ERROR */) {
      return;
    }
    this.diagnostics.push(diagnostic);
  }
  reportError(code, msg, targetSpan) {
    this.push({ code, kind: "error" /* ERROR */, msg, targetSpan });
  }
  reportWarning(code, msg, targetSpan) {
    this.push({ code, kind: "warning" /* WARNING */, msg, targetSpan });
  }
  reportInfo(code, msg, targetSpan) {
    this.push({ code, kind: "info" /* INFO */, msg, targetSpan });
  }
  addErrorDiagnostic(diagnostic) {
    this.push({
      code: "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
      kind: diagnostic.severity === "error" ? "error" /* ERROR */ : diagnostic.severity === "warning" ? "warning" /* WARNING */ : "info" /* INFO */,
      msg: diagnostic.message
    });
  }
  getDiagnostics() {
    return this.filterDuplicates(this.diagnostics);
  }
  reset() {
    this.diagnostics = [];
  }
  hasErrors() {
    return this.diagnostics.some((d) => d.kind === "error" /* ERROR */);
  }
  length() {
    return this.diagnostics.length;
  }
  getAllErrors() {
    return this.diagnostics.filter((d) => d.kind === "error" /* ERROR */);
  }
  getAllWarnings() {
    return this.diagnostics.filter((d) => d.kind === "warning" /* WARNING */);
  }
  getAllInfos() {
    return this.diagnostics.filter((d) => d.kind === "info" /* INFO */);
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── HELP ──────────────────────────────┐
  isMoreSpecific(d1, d2) {
    var _a, _b;
    const errorPriority = /* @__PURE__ */ new Map([
      // Most specific errors (highest priority)
      ["MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */, 100],
      ["ERROR_MEMBER_NOT_FOUND" /* ERROR_MEMBER_NOT_FOUND */, 100],
      ["USED_BEFORE_DECLARED" /* USED_BEFORE_DECLARED */, 100],
      ["SELFERR_INVALID_CONTEXT" /* SELFERR_INVALID_CONTEXT */, 100],
      ["NOT_A_FUNCTION" /* NOT_A_FUNCTION */, 90],
      ["ARITHMETIC_OVERFLOW_COMPTIME" /* ARITHMETIC_OVERFLOW_COMPTIME */, 90],
      ["UNDEFINED_IDENTIFIER_MEMBER" /* UNDEFINED_IDENTIFIER_MEMBER */, 90],
      ["UNDEFINED_IDENTIFIER_TYPEOF" /* UNDEFINED_IDENTIFIER_TYPEOF */, 90],
      // Specific errors (high priority)
      ["UNDEFINED_IDENTIFIER" /* UNDEFINED_IDENTIFIER */, 80],
      ["ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */, 80],
      ["THROW_WITHOUT_ERROR_TYPE" /* THROW_WITHOUT_ERROR_TYPE */, 80],
      ["MISSING_RETURN_STATEMENT" /* MISSING_RETURN_STATEMENT */, 70],
      ["SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */, 60],
      // Generic errors (low priority)
      ["THROW_TYPE_MISMATCH" /* THROW_TYPE_MISMATCH */, 40],
      ["TYPE_MISMATCH_CALL" /* TYPE_MISMATCH_CALL */, 30],
      ["TYPE_MISMATCH" /* TYPE_MISMATCH */, 20],
      ["TYPE_INFERENCE_FAILED" /* TYPE_INFERENCE_FAILED */, 10],
      ["COMPTIME_EVAL_FAILED" /* COMPTIME_EVAL_FAILED */, 10]
      // [DiagCode.ANALYSIS_ERROR, 5],
    ]);
    const priority1 = (_a = errorPriority.get(d1.code)) != null ? _a : 50;
    const priority2 = (_b = errorPriority.get(d2.code)) != null ? _b : 50;
    if (priority1 !== priority2) {
      return priority1 > priority2;
    }
    if (d1.msg.length !== d2.msg.length) {
      return d1.msg.length > d2.msg.length;
    }
    const context1Size = d1.contextSpan ? d1.contextSpan.end - d1.contextSpan.start : 0;
    const context2Size = d2.contextSpan ? d2.contextSpan.end - d2.contextSpan.start : 0;
    if (context1Size !== context2Size) {
      return context1Size > context2Size;
    }
    return this.hasHigherPriority(d1, d2);
  }
  hasHigherPriority(d1, d2) {
    const priority = { error: 2, warning: 1, info: 0 };
    return (priority[d1.kind] || 0) > (priority[d2.kind] || 0);
  }
  filterDuplicates(diagnostics) {
    const seen = /* @__PURE__ */ new Map();
    for (const diagnostic of diagnostics) {
      let foundDuplicate = false;
      let duplicateKey = null;
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
        const existing = seen.get(duplicateKey);
        if (this.isMoreSpecific(diagnostic, existing)) {
          seen.set(duplicateKey, diagnostic);
        }
      }
    }
    return Array.from(seen.values());
  }
  getTargetKey(diagnostic) {
    const targetKey = diagnostic.targetSpan ? `t:${diagnostic.targetSpan.start}-${diagnostic.targetSpan.end}` : "no-target";
    return targetKey;
  }
  isSameIssue(d1, d2) {
    var _a, _b;
    const target1 = d1.targetSpan ? `${d1.targetSpan.start}-${d1.targetSpan.end}` : "no-target";
    const target2 = d2.targetSpan ? `${d2.targetSpan.start}-${d2.targetSpan.end}` : "no-target";
    const alwaysDistinctCodes = /* @__PURE__ */ new Set([
      "MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */,
      "TYPE_MISMATCH" /* TYPE_MISMATCH */,
      "TYPE_MISMATCH_FIELD" /* TYPE_MISMATCH_FIELD */,
      "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
      "USED_BEFORE_DECLARED" /* USED_BEFORE_DECLARED */,
      "USED_BEFORE_INITIALIZED" /* USED_BEFORE_INITIALIZED */,
      "MUTABILITY_MISMATCH" /* MUTABILITY_MISMATCH */
    ]);
    if (alwaysDistinctCodes.has(d1.code) && alwaysDistinctCodes.has(d2.code)) {
      return false;
    }
    const hasOverlappingTargets = target1 !== "no-target" && target2 !== "no-target" && this.spansOverlap(d1.targetSpan, d2.targetSpan);
    if (hasOverlappingTargets) {
      const cascadingPatterns = [
        // [Root cause, Cascading error]
        ["UNDEFINED_IDENTIFIER" /* UNDEFINED_IDENTIFIER */, "TYPE_INFERENCE_FAILED" /* TYPE_INFERENCE_FAILED */],
        ["UNDEFINED_IDENTIFIER_MEMBER" /* UNDEFINED_IDENTIFIER_MEMBER */, "TYPE_INFERENCE_FAILED" /* TYPE_INFERENCE_FAILED */],
        ["UNDEFINED_IDENTIFIER_TYPEOF" /* UNDEFINED_IDENTIFIER_TYPEOF */, "TYPE_INFERENCE_FAILED" /* TYPE_INFERENCE_FAILED */],
        ["USED_BEFORE_DECLARED" /* USED_BEFORE_DECLARED */, "TYPE_MISMATCH" /* TYPE_MISMATCH */],
        ["NOT_A_FUNCTION" /* NOT_A_FUNCTION */, "TYPE_MISMATCH" /* TYPE_MISMATCH */],
        ["NOT_A_FUNCTION" /* NOT_A_FUNCTION */, "TYPE_MISMATCH_CALL" /* TYPE_MISMATCH_CALL */],
        ["THROW_WITHOUT_ERROR_TYPE" /* THROW_WITHOUT_ERROR_TYPE */, "MISSING_RETURN_STATEMENT" /* MISSING_RETURN_STATEMENT */],
        ["ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */, "ANALYSIS_ERROR" /* ANALYSIS_ERROR */],
        ["MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */, "ANALYSIS_ERROR" /* ANALYSIS_ERROR */],
        ["ARITHMETIC_OVERFLOW_COMPTIME" /* ARITHMETIC_OVERFLOW_COMPTIME */, "COMPTIME_EVAL_FAILED" /* COMPTIME_EVAL_FAILED */],
        ["MISSING_RETURN_STATEMENT" /* MISSING_RETURN_STATEMENT */, "ANALYSIS_ERROR" /* ANALYSIS_ERROR */],
        ["MISSING_RETURN_STATEMENT" /* MISSING_RETURN_STATEMENT */, "COMPTIME_EVAL_FAILED" /* COMPTIME_EVAL_FAILED */],
        // Duplicate detection from different validation layers
        ["SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */, "ERROR_MEMBER_NOT_FOUND" /* ERROR_MEMBER_NOT_FOUND */],
        // Error member - both report same issue
        ["SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */, "THROW_TYPE_MISMATCH" /* THROW_TYPE_MISMATCH */],
        // Symbol not found causes throw mismatch
        ["ERROR_MEMBER_NOT_FOUND" /* ERROR_MEMBER_NOT_FOUND */, "THROW_TYPE_MISMATCH" /* THROW_TYPE_MISMATCH */],
        // More specific error + generic
        ["UNDEFINED_IDENTIFIER" /* UNDEFINED_IDENTIFIER */, "SELFERR_INVALID_CONTEXT" /* SELFERR_INVALID_CONTEXT */],
        // selferr detection in different phases
        ["SELFERR_INVALID_CONTEXT" /* SELFERR_INVALID_CONTEXT */, "THROW_TYPE_MISMATCH" /* THROW_TYPE_MISMATCH */]
        // selferr + throw mismatch
      ];
      for (const [root, cascade] of cascadingPatterns) {
        if (d1.code === root && d2.code === cascade || d2.code === root && d1.code === cascade) {
          return true;
        }
      }
      const identifierPatterns = [
        /identifier '([^']+)'/i,
        /Symbol '([^']+)'/i,
        /'([^']+)' already imported/i,
        /'([^']+)' shadows/i
      ];
      let id1 = null;
      let id2 = null;
      for (const pattern of identifierPatterns) {
        id1 = id1 || ((_a = d1.msg.match(pattern)) == null ? void 0 : _a[1]) || null;
        id2 = id2 || ((_b = d2.msg.match(pattern)) == null ? void 0 : _b[1]) || null;
      }
      if (id1 && id2 && id1 === id2) {
        return true;
      }
      const isDuplicateRelated = (code) => code === "DUPLICATE_SYMBOL" /* DUPLICATE_SYMBOL */ || code === "USE_SHADOWING" /* USE_SHADOWING */ || code === "VARIABLE_SHADOWING" /* VARIABLE_SHADOWING */ || code === "FUNCTION_SHADOWING" /* FUNCTION_SHADOWING */ || code === "DEFINITION_SHADOWING" /* DEFINITION_SHADOWING */ || code === "PARAMETER_SHADOWING" /* PARAMETER_SHADOWING */;
      if (isDuplicateRelated(d1.code) && isDuplicateRelated(d2.code)) {
        return true;
      }
      return true;
    }
    const context1 = d1.contextSpan ? `${d1.contextSpan.start}-${d1.contextSpan.end}` : "no-context";
    const context2 = d2.contextSpan ? `${d2.contextSpan.start}-${d2.contextSpan.end}` : "no-context";
    if (context1 === context2 && context1 !== "no-context") {
      const isTypeError = (code) => code === "TYPE_MISMATCH" /* TYPE_MISMATCH */ || code === "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */ || code === "LITERAL_OVERFLOW" /* LITERAL_OVERFLOW */ || code === "CANNOT_INFER_TYPE" /* CANNOT_INFER_TYPE */;
      if (isTypeError(d1.code) && isTypeError(d2.code)) {
        return true;
      }
    }
    return false;
  }
  spansOverlap(s1, s2) {
    return s1.start <= s2.end && s2.start <= s1.end;
  }
  // └────────────────────────────────────────────────────────────────────┘
};

// lib/components/ContextTracker.ts
var AnalysisPhase = /* @__PURE__ */ ((AnalysisPhase2) => {
  AnalysisPhase2["Collection"] = "Collection";
  AnalysisPhase2["Resolution"] = "Resolution";
  AnalysisPhase2["TypeValidation"] = "TypeValidation";
  AnalysisPhase2["SemanticValidation"] = "SemanticValidation";
  AnalysisPhase2["FinalValidation"] = "FinalValidation";
  return AnalysisPhase2;
})(AnalysisPhase || {});
var ContextTracker = class {
  constructor(debugManager, diagnosticManager) {
    this.debugManager = debugManager;
    this.diagnosticManager = diagnosticManager;
    this.context = this.genAnalysisContext();
    this.currentPhase = "Collection" /* Collection */;
    this.phaseStack = [];
    this.contextMap = /* @__PURE__ */ new Map();
  }
  init() {
    this.reset();
  }
  reset() {
    this.context = this.genAnalysisContext();
    this.currentPhase = "Collection" /* Collection */;
    this.phaseStack = [];
    this.contextMap.clear();
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── MAIN ──────────────────────────────┐
  genAnalysisContext() {
    return {
      currentModuleName: "",
      currentModulePath: "",
      currentPhase: "Collection" /* Collection */,
      contextSpanStack: [],
      declarationStack: [],
      expressionStack: [],
      currentScope: 0,
      processingSymbols: /* @__PURE__ */ new Set(),
      pendingReferences: /* @__PURE__ */ new Map(),
      resolvedSymbols: /* @__PURE__ */ new Set()
    };
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────── STATE SAVE/RESTORE (NEW) ──────────────────┐
  saveState() {
    var _a;
    const state = {
      scopeId: this.context.currentScope,
      moduleName: this.context.currentModuleName,
      modulePath: this.context.currentModulePath,
      spanStackDepth: this.context.contextSpanStack.length,
      declarationStackDepth: this.context.declarationStack.length,
      expressionStackDepth: this.context.expressionStack.length
    };
    (_a = this.debugManager) == null ? void 0 : _a.log(
      "verbose",
      `\u{1F4BE} Saved context state: scope=${state.scopeId}, module=${state.moduleName}, spans=${state.spanStackDepth}`
    );
    return state;
  }
  restoreState(state) {
    var _a, _b;
    (_a = this.debugManager) == null ? void 0 : _a.log(
      "verbose",
      `\u267B\uFE0F  Restoring context state: scope=${state.scopeId}, module=${state.moduleName}`
    );
    if (!this.validateSavedState(state)) {
      (_b = this.debugManager) == null ? void 0 : _b.log("errors", `\u26A0\uFE0F  Invalid saved state detected, attempting recovery`);
    }
    this.context.currentScope = state.scopeId;
    this.context.currentModuleName = state.moduleName;
    this.context.currentModulePath = state.modulePath;
    this.restoreStack(this.context.contextSpanStack, state.spanStackDepth, "contextSpan");
    this.restoreStack(this.context.expressionStack, state.expressionStackDepth, "expression");
    while (this.context.declarationStack.length > state.declarationStackDepth) {
      const decl = this.context.declarationStack.pop();
      if (decl) {
        this.context.processingSymbols.delete(decl.symbolId);
      }
    }
  }
  withSavedState(fn) {
    const savedState = this.saveState();
    try {
      return fn();
    } finally {
      this.restoreState(savedState);
    }
  }
  restoreStack(stack, targetDepth, name) {
    var _a;
    if (stack.length < targetDepth) {
      (_a = this.debugManager) == null ? void 0 : _a.log(
        "errors",
        `\u26A0\uFE0F Stack underflow for ${name}: current=${stack.length}, target=${targetDepth}. Clearing stack.`
      );
      stack.length = 0;
      return;
    }
    while (stack.length > targetDepth) {
      stack.pop();
    }
  }
  validateSavedState(state) {
    if (state.scopeId < 0) return false;
    if (state.spanStackDepth < 0) return false;
    if (state.declarationStackDepth < 0) return false;
    if (state.expressionStackDepth < 0) return false;
    return true;
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────── MODULE & PHASE ────────────────────────┐
  setModuleName(moduleName) {
    var _a;
    this.context.currentModuleName = moduleName;
    (_a = this.debugManager) == null ? void 0 : _a.log("verbose", `Context: Set module name to '${moduleName}'`);
  }
  setModulePath(modulePath) {
    var _a;
    this.context.currentModulePath = modulePath;
    (_a = this.debugManager) == null ? void 0 : _a.log("verbose", `Context: Set module path to '${modulePath}'`);
  }
  pushPhase(phase) {
    var _a;
    this.phaseStack.push(this.currentPhase);
    this.setPhase(phase);
    (_a = this.debugManager) == null ? void 0 : _a.log("verbose", `Context: Pushed phase '${phase}' (stack: ${this.phaseStack.length})`);
  }
  popPhase() {
    var _a;
    const previousPhase = this.phaseStack.pop();
    if (previousPhase) {
      this.setPhase(previousPhase);
      (_a = this.debugManager) == null ? void 0 : _a.log("verbose", `Context: Popped phase, returned to '${previousPhase}'`);
    }
    return previousPhase;
  }
  setPhase(phase) {
    var _a;
    this.currentPhase = phase;
    this.context.currentPhase = phase;
    (_a = this.debugManager) == null ? void 0 : _a.log("verbose", `Context: Entered phase '${phase}'`);
  }
  getCurrentPhase() {
    return this.context.currentPhase;
  }
  setScope(scopeId) {
    this.context.currentScope = scopeId;
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────── CONTEXT SPAN MANAGEMENT ────────────────────┐
  setCurrentContextSpan(span) {
    var _a, _b;
    if (span) {
      this.context.contextSpanStack.push(span);
      (_a = this.debugManager) == null ? void 0 : _a.log("verbose", `Context: Pushed span [${span.start}-${span.end}] (stack depth: ${this.context.contextSpanStack.length})`);
    } else {
      if (this.context.contextSpanStack.length > 0) {
        const removed = this.context.contextSpanStack.pop();
        (_b = this.debugManager) == null ? void 0 : _b.log("verbose", `Context: Popped span [${removed == null ? void 0 : removed.start}-${removed == null ? void 0 : removed.end}] (stack depth: ${this.context.contextSpanStack.length})`);
      }
    }
  }
  pushContextSpan(span) {
    var _a;
    this.context.contextSpanStack.push(span);
    (_a = this.debugManager) == null ? void 0 : _a.log("verbose", `Context: Pushed scoped span [${span.start}-${span.end}]`);
  }
  popContextSpan() {
    var _a;
    const span = this.context.contextSpanStack.pop();
    if (span) {
      (_a = this.debugManager) == null ? void 0 : _a.log("verbose", `Context: Popped scoped span [${span.start}-${span.end}]`);
    }
    return span;
  }
  clearContextSpans() {
    var _a;
    const count = this.context.contextSpanStack.length;
    this.context.contextSpanStack = [];
    (_a = this.debugManager) == null ? void 0 : _a.log("verbose", `Context: Cleared ${count} context spans`);
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────── DECLARATION TRACKING ──────────────────────┐
  startDeclaration(symbolName, symbolId, symbolKind, span, parentScope) {
    var _a;
    const declaration = {
      symbolName,
      symbolId,
      symbolKind,
      phase: "InDeclaration" /* InDeclaration */,
      span,
      parentScope
    };
    this.context.declarationStack.push(declaration);
    this.context.processingSymbols.add(symbolId);
    this.pushContextSpan(span);
    (_a = this.debugManager) == null ? void 0 : _a.log("verbose", `Context: Started declaration of ${symbolKind} '${symbolName}' (id: ${symbolId})`);
  }
  startInitialization(symbolId) {
    var _a;
    const current = this.getCurrentDeclaration();
    if (current && current.symbolId === symbolId) {
      current.phase = "InInitialization" /* InInitialization */;
      (_a = this.debugManager) == null ? void 0 : _a.log("verbose", `Context: Started initialization of symbol '${current.symbolName}' (id: ${symbolId})`);
    }
  }
  completeDeclaration(symbolId) {
    var _a;
    const index = this.context.declarationStack.findIndex((d) => d.symbolId === symbolId);
    if (index >= 0) {
      const declaration = this.context.declarationStack[index];
      declaration.phase = "PostDeclaration" /* PostDeclaration */;
      this.context.declarationStack.splice(index, 1);
      this.popContextSpan();
      (_a = this.debugManager) == null ? void 0 : _a.log("verbose", `Context: Completed declaration of '${declaration.symbolName}' (id: ${symbolId})`);
    }
    this.context.processingSymbols.delete(symbolId);
    this.context.resolvedSymbols.add(symbolId);
  }
  isInDeclaration(symbolName) {
    return this.context.declarationStack.some((d) => d.symbolName === symbolName);
  }
  isInInitialization(symbolName) {
    return this.context.declarationStack.some(
      (d) => d.symbolName === symbolName && d.phase === "InInitialization" /* InInitialization */
    );
  }
  getCurrentDeclaration() {
    return this.context.declarationStack[this.context.declarationStack.length - 1];
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────── EXPRESSION TRACKING ──────────────────────┐
  enterExpression(type, span, relatedSymbol) {
    var _a, _b;
    if (!span) {
      (_a = this.debugManager) == null ? void 0 : _a.log("verbose", "Warning: Attempted to enter expression context without span");
      return;
    }
    const depth = this.context.expressionStack.length;
    this.context.expressionStack.push({ type, relatedSymbol, depth, span });
    this.pushContextSpan(span);
    (_b = this.debugManager) == null ? void 0 : _b.log("verbose", `Context: Entered expression ${type} at depth ${depth}`);
  }
  exitExpression() {
    var _a;
    if (this.context.expressionStack.length === 0) {
      return void 0;
    }
    const exited = this.context.expressionStack.pop();
    this.popContextSpan();
    if (exited) {
      (_a = this.debugManager) == null ? void 0 : _a.log("verbose", `Context: Exited expression ${exited.type} from depth ${exited.depth}`);
    }
    return exited;
  }
  getCurrentExpressionContext() {
    return this.context.expressionStack[this.context.expressionStack.length - 1];
  }
  isInExpressionType(type) {
    return this.context.expressionStack.some((ctx) => ctx.type === type);
  }
  getExpressionDepth() {
    return this.context.expressionStack.length;
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌────────────────────── SELF-REFERENCE DETECTION ────────────────────┐
  checkSelfReference(symbolName, referenceSpan) {
    const currentDeclaration = this.context.declarationStack.find(
      (d) => d.symbolName === symbolName && d.phase === "InInitialization" /* InInitialization */
    );
    if (currentDeclaration) {
      const errorType = currentDeclaration.symbolKind === "let" ? "VARIABLE_SELF_INIT" : "PARAMETER_SELF_INIT";
      return {
        isSelfReference: true,
        declarationContext: currentDeclaration,
        errorType
      };
    }
    return { isSelfReference: false };
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────── FORWARD REFERENCE TRACKING ───────────────────┐
  recordPendingReference(symbolName, span) {
    if (!this.context.pendingReferences.has(symbolName)) {
      this.context.pendingReferences.set(symbolName, []);
    }
    this.context.pendingReferences.get(symbolName).push(span);
  }
  resolvePendingReferences(symbolName) {
    const spans = this.context.pendingReferences.get(symbolName) || [];
    this.context.pendingReferences.delete(symbolName);
    return spans;
  }
  getPendingReferences() {
    return new Map(this.context.pendingReferences);
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────── PARAMETER ORDER VALIDATION ───────────────────┐
  checkParameterForwardReference(parameterName, currentParameterIndex, allParameters) {
    const referencedParam = allParameters.find((p) => p.name === parameterName);
    if (referencedParam && referencedParam.index > currentParameterIndex) {
      return {
        isForwardReference: true,
        referencedParameterIndex: referencedParam.index
      };
    }
    return { isForwardReference: false };
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── CONTEXT QUERIES ────────────────────────┐
  getContextSpan() {
    if (this.context.contextSpanStack.length > 0) {
      return this.context.contextSpanStack[this.context.contextSpanStack.length - 1];
    }
    const currentExpression = this.getCurrentExpressionContext();
    if (currentExpression == null ? void 0 : currentExpression.span) {
      return currentExpression.span;
    }
    const currentDeclaration = this.getCurrentDeclaration();
    if (currentDeclaration == null ? void 0 : currentDeclaration.span) {
      return currentDeclaration.span;
    }
    return void 0;
  }
  getContext() {
    return this.context;
  }
  getPhase() {
    return this.context.currentPhase;
  }
  getModuleName() {
    return this.context.currentModuleName;
  }
  getModulePath() {
    return this.context.currentModulePath;
  }
  getScope() {
    return this.context.currentScope;
  }
  getProcessingSymbols() {
    return new Set(this.context.processingSymbols);
  }
  getResolvedSymbols() {
    return new Set(this.context.resolvedSymbols);
  }
  getDeclarationStack() {
    return [...this.context.declarationStack];
  }
  getCurrentDeclarationContext() {
    return this.context.declarationStack[this.context.declarationStack.length - 1];
  }
  getCurrentDeclarationSymbolId() {
    const current = this.getCurrentDeclaration();
    return current ? current.symbolId : void 0;
  }
  getCurrentDeclarationSymbolName() {
    const current = this.getCurrentDeclaration();
    return current ? current.symbolName : void 0;
  }
  getCurrentDeclarationSymbolKind() {
    const current = this.getCurrentDeclaration();
    return current ? current.symbolKind : void 0;
  }
  getCurrentDeclarationPhase() {
    const current = this.getCurrentDeclaration();
    return current ? current.phase : void 0;
  }
  getCurrentDeclarationSpan() {
    const current = this.getCurrentDeclaration();
    return current ? current.span : void 0;
  }
  getCurrentDeclarationParentScope() {
    const current = this.getCurrentDeclaration();
    return current ? current.parentScope : void 0;
  }
  getCurrentDeclarationStackDepth() {
    return this.context.declarationStack.length;
  }
  getCurrentDeclarationStackTrace() {
    return this.context.declarationStack.map(
      (d) => `${d.symbolKind} '${d.symbolName}' (${d.phase})`
    );
  }
  isProcessingSymbol(symbolId) {
    return this.context.processingSymbols.has(symbolId);
  }
  isSymbolResolved(symbolId) {
    return this.context.resolvedSymbols.has(symbolId);
  }
  getDeclarationStackTrace() {
    return this.context.declarationStack.map(
      (d) => `${d.symbolKind} '${d.symbolName}' (${d.phase})`
    );
  }
  getExpressionStackTrace() {
    return this.context.expressionStack.map(
      (e) => `${e.type} at depth ${e.depth}`
    );
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── DEBUG UTILITIES ────────────────────────┐
  debugState() {
    console.log("Enhanced Context Tracker State:", {
      module: this.context.currentModuleName,
      phase: this.context.currentPhase,
      scope: this.context.currentScope,
      contextSpanStack: this.context.contextSpanStack.map((s) => `[${s.start}-${s.end}]`),
      declarationStack: this.getDeclarationStackTrace(),
      expressionStack: this.getExpressionStackTrace(),
      processingSymbols: Array.from(this.context.processingSymbols),
      pendingReferences: Array.from(this.context.pendingReferences.keys())
    });
  }
  // └────────────────────────────────────────────────────────────────────┘
};

// lib/components/DebugManager.ts
var DebugManager = class {
  constructor(contextTracker, debugLevel = "off") {
    // ┌──────────────────────────────── INIT ──────────────────────────────┐
    this.debugLevel = "off";
    this.indentLevel = 0;
    this.debugLevel = debugLevel;
    this.contextTracker = contextTracker;
  }
  reset() {
    this.indentLevel = 0;
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── MAIN ──────────────────────────────┐
  log(level, message) {
    if (this.debugLevel === "off") {
      return;
    }
    const levels = ["off", "errors", "symbols", "scopes", "nodes", "verbose"];
    const currentIndex = levels.indexOf(this.debugLevel);
    const messageIndex = levels.indexOf(level);
    if (messageIndex <= currentIndex) {
      const prefix = this.getDebugPrefix(level);
      const indent = "  ".repeat(this.indentLevel);
      let callerName = "";
      try {
        const err = new Error();
        if (err.stack) {
          const stackLines = err.stack.split("\n");
          if (stackLines.length > 2) {
            const match = stackLines[2].match(/at (?:.*\.)?([a-zA-Z0-9_$]+)(?: \[as .*\])? /);
            if (match && match[1]) {
              callerName = match[1];
            }
          }
        }
      } catch (e) {
      }
      const callerInfo = callerName ? `${callerName}() : ` : "";
      let short_file_path = "unknown";
      let line = 0;
      let column = 0;
      try {
        const err = new Error();
        if (err.stack) {
          const stackLines = err.stack.split("\n");
          if (stackLines.length > 2) {
            const match = stackLines[2].match(/at .* \((.*):(\d+):(\d+)\)/) || stackLines[2].match(/at (.*):(\d+):(\d+)/);
            if (match && match[1] && match[2] && match[3]) {
              const fullPath = match[1];
              short_file_path = fullPath.split("/").slice(-2).join("/");
              line = parseInt(match[2], 10);
              column = parseInt(match[3], 10);
            }
          }
        }
      } catch (e) {
      }
      if (short_file_path !== "unknown") {
        const match = short_file_path.match(/(src|lib)[/\\].*/);
        if (match) {
          short_file_path = `./${match[0].replace(/\\/g, "/")}`;
        } else {
          const parts = short_file_path.split(/[/\\]/);
          if (parts.length > 2) {
            short_file_path = `./${parts.slice(-2).join("/")}`;
          } else if (parts.length === 2) {
            short_file_path = `./${short_file_path.replace(/\\/g, "/")}`;
          }
        }
      }
      console.log(`${prefix} ${indent}${callerInfo}${message} at ${short_file_path}:${line}:${column}`);
    }
  }
  increaseIndent() {
    this.indentLevel++;
  }
  decreaseIndent() {
    this.indentLevel = Math.max(0, this.indentLevel - 1);
  }
  setDebugLevel(level) {
    this.debugLevel = level;
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── HELP ──────────────────────────────┐
  getDebugPrefix(level) {
    const prefixes = {
      errors: "\u{1F525}",
      symbols: "",
      // 📝
      scopes: "\u{1F4E6}",
      nodes: "\u{1F333}",
      verbose: ""
      // 📊
    };
    const prefix = prefixes[level] === "" ? "" : `[${prefixes[level] || "\u26A1"}]`;
    let phasePrefix = "";
    if (this.contextTracker) {
      const phase = this.contextTracker.getCurrentPhase();
      if (phase) {
        phasePrefix = `[${phase}] `;
      }
    }
    return `${phasePrefix}${prefix}`;
  }
  // └────────────────────────────────────────────────────────────────────┘
};

// lib/components/ScopeManager.ts
import * as AST from "@je-es/ast";

// lib/components/IdGenerator.ts
var IdGenerator = class {
  constructor() {
    this.counter = 0;
  }
  next() {
    return ++this.counter;
  }
  reset() {
    this.counter = 0;
  }
  current() {
    return this.counter;
  }
};

// lib/components/ScopeManager.ts
var ScopeManager = class {
  constructor(diagnosticManager, debugManager) {
    this.diagnosticManager = diagnosticManager;
    this.debugManager = debugManager;
    this.idGenerator = new IdGenerator();
    this.symbolIdGenerator = new IdGenerator();
    this.init();
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── MAIN ────────────────────────────────┐
  init() {
    this.scopes = /* @__PURE__ */ new Map();
    this.symbolTable = /* @__PURE__ */ new Map();
    this.namespaceLookup = /* @__PURE__ */ new Map();
    this.globalScope = this.createScope("Global" /* Global */, "global", null);
    this.currentScope = this.globalScope.id;
    this.initializeBuiltins();
  }
  reset() {
    const globalScopeId = this.globalScope.id;
    this.scopes.clear();
    this.symbolTable.clear();
    this.namespaceLookup.clear();
    this.scopes.set(globalScopeId, this.globalScope);
    this.currentScope = globalScopeId;
    this.globalScope.symbols.clear();
    this.globalScope.children = [];
    this.initializeBuiltins();
  }
  createScope(kind, name, parentId) {
    const scope = {
      id: this.idGenerator.next(),
      kind,
      name,
      parent: parentId,
      children: [],
      symbols: /* @__PURE__ */ new Map(),
      level: parentId ? this.getScope(parentId).level + 1 : 0
    };
    this.scopes.set(scope.id, scope);
    if (parentId) {
      const parent = this.getScope(parentId);
      parent.children.push(scope.id);
    }
    return scope;
  }
  withScope(scopeId, fn) {
    var _a, _b;
    const previousScope = this.currentScope;
    if (!this.scopes.has(scopeId)) {
      throw new Error(`Cannot switch to non-existent scope ${scopeId}`);
    }
    (_a = this.debugManager) == null ? void 0 : _a.log(
      "verbose",
      `\u2192 Entering scope ${scopeId} (${this.getScope(scopeId).name}) from ${previousScope}`
    );
    this.currentScope = scopeId;
    try {
      return fn();
    } finally {
      (_b = this.debugManager) == null ? void 0 : _b.log(
        "verbose",
        `\u2190 Restoring scope ${previousScope} from ${scopeId}`
      );
      this.currentScope = previousScope;
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── MAIN ────────────────────────────────┐
  /**
   * Find a scope by name, optionally filtered by kind.
   * @param name - The scope name to search for
   * @param kind - Optional: Filter by scope kind
   * @param parentScopeId - Optional: Search only within this parent scope's children
   */
  findScopeByName(name, kind, parentScopeId) {
    if (parentScopeId !== void 0) {
      const parentScope = this.getScope(parentScopeId);
      for (const childId of parentScope.children) {
        const childScope = this.getScope(childId);
        if (childScope.name === name && (!kind || childScope.kind === kind)) {
          return childScope;
        }
      }
      return null;
    }
    for (const scope of this.scopes.values()) {
      if (scope.name === name && (!kind || scope.kind === kind)) {
        return scope;
      }
    }
    return null;
  }
  /**
   * Find a child scope of the current scope by name.
   */
  findChildScopeByName(name, kind) {
    return this.findScopeByName(name, kind, this.currentScope);
  }
  /**
   * Find a child scope by name from a specific parent scope.
   */
  findChildScopeByNameFromId(name, scopeId, kind) {
    return this.findScopeByName(name, kind, scopeId);
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── SCOPE ACCESSORS ──────────────────────────┐
  getSymbolInCurrentScope(name) {
    const currentScope = this.getScope(this.currentScope);
    return currentScope.symbols.get(name) || null;
  }
  getScopeParent(scopeId) {
    const scope = this.getScope(scopeId);
    return scope.parent !== null ? this.getScope(scope.parent) : null;
  }
  getScope(id) {
    const scope = this.scopes.get(id);
    if (!scope) {
      throw new Error(`Scope ${id} not found`);
    }
    return scope;
  }
  getAllSymbols() {
    return Array.from(this.symbolTable.values());
  }
  getSymbol(id) {
    const symbol = this.symbolTable.get(id);
    if (!symbol) {
      throw new Error(`Symbol ${id} not found`);
    }
    return symbol;
  }
  getCurrentScope() {
    return this.getScope(this.currentScope);
  }
  getGlobalScope() {
    return this.globalScope;
  }
  getAllScopes() {
    return Array.from(this.scopes.values());
  }
  setCurrentScope(scopeId) {
    if (!this.scopes.has(scopeId)) {
      throw new Error(`Scope ${scopeId} does not exist`);
    }
    this.currentScope = scopeId;
  }
  addSymbolToScope(symbol, scopeId) {
    const scope = this.getScope(scopeId);
    scope.symbols.set(symbol.name, symbol);
    this.symbolTable.set(symbol.id, symbol);
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌────────────────────────── SCOPE NAVIGATION ──────────────────────────┐
  enterScope(kind, name) {
    const scope = this.createScope(kind, name, this.currentScope);
    this.currentScope = scope.id;
    return scope.id;
  }
  exitScope() {
    const current = this.getScope(this.currentScope);
    if (current.parent !== null) {
      const parentId = current.parent;
      this.currentScope = parentId;
      return parentId;
    }
    return null;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌────────────────────────── SCOPE DEFINITION ──────────────────────────┐
  defineSymbol(name, kind, opts) {
    const symbol = {
      id: this.symbolIdGenerator.next(),
      name,
      kind,
      type: opts.type || null,
      scope: this.currentScope,
      contextSpan: opts.span || { start: 0, end: 0 },
      declared: true,
      initialized: false,
      used: false,
      isTypeChecked: false,
      visibility: opts.visibility || { kind: "Private" },
      mutability: opts.mutability || { kind: "Immutable" },
      namespace: opts.namespace,
      metadata: opts.metadata,
      typeInfo: opts.typeInfo,
      isExported: false
    };
    const scope = this.getScope(this.currentScope);
    scope.symbols.set(name, symbol);
    this.symbolTable.set(symbol.id, symbol);
    if (opts.namespace) {
      const nsSymbols = this.namespaceLookup.get(opts.namespace) || /* @__PURE__ */ new Set();
      nsSymbols.add(symbol.id);
      this.namespaceLookup.set(opts.namespace, nsSymbols);
    }
    return symbol.id;
  }
  resolveSymbol(name, opts = {}) {
    var _a;
    if (opts.namespace) {
      const nsSymbols = this.namespaceLookup.get(opts.namespace);
      if (nsSymbols) {
        for (const symbolId of nsSymbols) {
          const symbol = this.symbolTable.get(symbolId);
          if (symbol && symbol.name === name) {
            return symbol;
          }
        }
      }
    }
    let scope = this.getScope(this.currentScope);
    do {
      const symbol = scope.symbols.get(name);
      if (symbol) {
        return symbol;
      }
      if (opts.currentScopeOnly) {
        break;
      }
      scope = scope.parent !== null ? this.getScope(scope.parent) : null;
    } while (scope && ((_a = opts.includeParents) != null ? _a : true));
    return null;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌────────────────────────────── BUILTINS ──────────────────────────────┐
  initializeBuiltins() {
    this.createBuiltinSymbol("Function" /* Function */, "@print", {
      type: AST.TypeNode.asFunction({ start: 0, end: 0 }, [
        AST.TypeNode.asU8Array({ start: 0, end: 0 })
      ], AST.TypeNode.asVoid({ start: 0, end: 0 })),
      callable: true
    });
    this.createBuiltinSymbol("Definition" /* Definition */, "slice", {
      type: AST.TypeNode.asU8Array({ start: 0, end: 0 })
    });
    this.createBuiltinSymbol("Definition" /* Definition */, "char", {
      type: AST.TypeNode.asUnsigned({ start: 0, end: 0 }, "u8", 8)
    });
    this.createBuiltinSymbol("Definition" /* Definition */, "cpoint", {
      type: AST.TypeNode.asUnsigned({ start: 0, end: 0 }, "u21", 21)
    });
    this.createBuiltinSymbol("Definition" /* Definition */, "usize", {
      type: AST.TypeNode.asUnsigned({ start: 0, end: 0 }, "usize", 64)
    });
    this.createBuiltinSymbol("Definition" /* Definition */, "isize", {
      type: AST.TypeNode.asSigned({ start: 0, end: 0 }, "isize", 64)
    });
  }
  createBuiltinSymbol(kind, name, options) {
    const symbol = {
      id: this.symbolIdGenerator.next(),
      kind,
      name,
      contextSpan: { start: 0, end: 0 },
      scope: this.globalScope.id,
      visibility: { kind: "Public" },
      mutability: { kind: "Immutable" },
      type: options.type,
      used: false,
      initialized: true,
      declared: true,
      isTypeChecked: true,
      isExported: false,
      metadata: {
        callable: options.callable || false,
        isBuiltin: true
      }
    };
    this.globalScope.symbols.set(name, symbol);
    this.symbolTable.set(symbol.id, symbol);
    return symbol;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── SYMBOL MARKERS ───────────────────────────┐
  markSymbolUsed(symbolId) {
    const symbol = this.getSymbol(symbolId);
    symbol.used = true;
  }
  markSymbolInitialized(symbolId) {
    const symbol = this.getSymbol(symbolId);
    symbol.initialized = true;
  }
  markSymbolTypeChecked(symbolId) {
    const symbol = this.getSymbol(symbolId);
    symbol.isTypeChecked = true;
  }
  setSymbolType(symbolId, type) {
    const symbol = this.getSymbol(symbolId);
    symbol.type = type;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────── NAMESPACE QUERIES ──────────────────────────┐
  getAllSymbolsInScope(scopeId) {
    const scope = this.getScope(scopeId);
    return Array.from(scope.symbols.values());
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌────────────────────────── SYMBOL LOOKUP ─────────────────────────────┐
  /**
   * Look up a symbol in the current scope chain.
   * Prioritizes symbols from the current module before checking imported symbols.
   */
  lookupSymbol(name) {
    return this.lookupSymbolInScopeChain(name, this.currentScope);
  }
  /**
   * Walk up scope chain with module boundary awareness.
   * This prevents symbols from other modules from shadowing local definitions.
   */
  lookupSymbolInScopeChain(name, scopeId) {
    var _a;
    let scope = this.getScope(scopeId);
    let currentModuleScope = null;
    let checkScope = scope;
    while (checkScope) {
      if (checkScope.kind === "Module" /* Module */) {
        currentModuleScope = checkScope;
        break;
      }
      checkScope = checkScope.parent !== null ? this.getScope(checkScope.parent) : null;
    }
    if (currentModuleScope) {
      checkScope = scope;
      while (checkScope && checkScope.id !== currentModuleScope.id) {
        const symbol = checkScope.symbols.get(name);
        if (symbol) {
          return symbol;
        }
        checkScope = checkScope.parent !== null ? this.getScope(checkScope.parent) : null;
      }
      const moduleSymbol = currentModuleScope.symbols.get(name);
      if (moduleSymbol) {
        return moduleSymbol;
      }
      for (const childId of currentModuleScope.children) {
        const childScope = this.getScope(childId);
        if (childScope.kind === "Type" /* Type */ && childScope.name === name) {
          return currentModuleScope.symbols.get(name) || null;
        }
      }
    }
    if (this.globalScope) {
      const globalSymbol = this.globalScope.symbols.get(name);
      if (globalSymbol) {
        if (globalSymbol.kind === "Use" /* Use */ || ((_a = globalSymbol.metadata) == null ? void 0 : _a.isBuiltin)) {
          return globalSymbol;
        }
      }
    }
    return null;
  }
  lookupSymbolInParentScopes(name, startingScopeId) {
    let scope = this.getScope(startingScopeId);
    while (scope) {
      const symbol = scope.symbols.get(name);
      if (symbol) {
        return symbol;
      }
      scope = scope.parent !== null ? this.getScope(scope.parent) : null;
    }
    return null;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── LSP SUPPORT ──────────────────────────────┐
  /**
   * Look up a symbol from LSP position information.
   * This finds the narrowest scope at the given span and searches for the symbol.
   *
   * @param word - The identifier to search for
   * @param position_span - The span where the hover/completion was requested
   * @param moduleName - Optional: The name of the module to restrict search to
   * @returns The symbol if found, null otherwise
   */
  lookupSymbolFromLSP(word, position_span, moduleName) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    (_a = this.debugManager) == null ? void 0 : _a.log(
      "verbose",
      `LSP lookup for "${word}" at span ${JSON.stringify(position_span)}${moduleName ? ` in module "${moduleName}"` : ""}`
    );
    let searchScope = null;
    if (moduleName) {
      for (const scope of this.scopes.values()) {
        if (scope.kind === "Module" /* Module */ && scope.name === moduleName) {
          searchScope = scope;
          (_b = this.debugManager) == null ? void 0 : _b.log("verbose", `Restricted search to module: ${moduleName} (id: ${scope.id})`);
          break;
        }
      }
      if (!searchScope) {
        (_c = this.debugManager) == null ? void 0 : _c.log("errors", `Module "${moduleName}" not found`);
        return null;
      }
      const importSymbol = this.findImportAtPosition(position_span, searchScope);
      if (importSymbol) {
        (_d = this.debugManager) == null ? void 0 : _d.log("verbose", `Position is within import statement, resolving to source symbol`);
        return this.resolveSymbolThroughImports(importSymbol);
      }
      const narrowestScope = this.findNarrowestScopeAtPosition(position_span, searchScope.id);
      searchScope = narrowestScope || searchScope;
    } else {
      searchScope = this.findNarrowestScopeAtPosition(position_span);
    }
    if (!searchScope) {
      (_e = this.debugManager) == null ? void 0 : _e.log("verbose", `No scope found at position`);
      return null;
    }
    (_f = this.debugManager) == null ? void 0 : _f.log(
      "verbose",
      `Found search scope: ${searchScope.name} (kind: ${searchScope.kind}, id: ${searchScope.id})`
    );
    const symbol = this.lookupSymbolInScopeChain(word, searchScope.id);
    if (!symbol) {
      (_g = this.debugManager) == null ? void 0 : _g.log("verbose", `Symbol "${word}" not found in scope chain`);
      return null;
    }
    (_h = this.debugManager) == null ? void 0 : _h.log("verbose", `Found symbol: ${symbol.name} (kind: ${symbol.kind})`);
    if (symbol.kind === "Use" /* Use */) {
      const isOnImportStatement = this.isPositionOnSymbolDefinition(position_span, symbol);
      if (isOnImportStatement) {
        (_i = this.debugManager) == null ? void 0 : _i.log("verbose", `Position is ON import statement, returning Use symbol`);
        return symbol;
      } else {
        (_j = this.debugManager) == null ? void 0 : _j.log("verbose", `Position is on USAGE of imported symbol, resolving to source`);
        return this.resolveSymbolThroughImports(symbol);
      }
    }
    return symbol;
  }
  /**
  * Public method to get symbol at a specific position (used by LSP).
  * This checks if the position directly points to a symbol definition.
  */
  getSymbolAtPosition(position) {
    var _a;
    for (const symbol of this.symbolTable.values()) {
      const targetSpan = symbol.targetSpan || symbol.contextSpan;
      if (position.start >= targetSpan.start && position.start <= targetSpan.end) {
        (_a = this.debugManager) == null ? void 0 : _a.log("verbose", `Found symbol directly at position: ${symbol.name}`);
        return symbol;
      }
    }
    return null;
  }
  /**
   * Find if the position is within an import statement.
   * Returns the Use symbol if position is within any import's contextSpan.
   */
  findImportAtPosition(position, scope) {
    var _a;
    for (const symbol of scope.symbols.values()) {
      if (symbol.kind === "Use" /* Use */) {
        const contextSpan = symbol.contextSpan;
        if (position.start >= contextSpan.start && position.start <= contextSpan.end) {
          (_a = this.debugManager) == null ? void 0 : _a.log(
            "verbose",
            `Found position within import: ${symbol.name} (alias: ${symbol.importAlias || "none"})`
          );
          return symbol;
        }
      }
    }
    return null;
  }
  /**
   * Check if the position is on the symbol's definition/declaration.
   * Returns true if hovering on where the symbol is defined, false if hovering on usage.
   */
  isPositionOnSymbolDefinition(position, symbol) {
    if (symbol.kind === "Use" /* Use */) {
      const contextSpan = symbol.contextSpan;
      const isInContext = position.start >= contextSpan.start && position.start <= contextSpan.end;
      return isInContext;
    }
    const targetSpan = symbol.targetSpan || symbol.contextSpan;
    return position.start >= targetSpan.start && position.start <= targetSpan.end;
  }
  /**
   * Resolve a symbol through imports to get the actual underlying symbol.
   * If the symbol is a Use (import), this follows the chain to find the real definition.
   */
  resolveSymbolThroughImports(symbol) {
    var _a;
    if (symbol.kind !== "Use" /* Use */) {
      return symbol;
    }
    console.log(`[ScopeManager] Resolving import symbol: ${symbol.name} (alias: ${symbol.importAlias || "none"})`);
    if (symbol.sourceSymbol) {
      const sourceSymbol = this.symbolTable.get(symbol.sourceSymbol);
      if (sourceSymbol) {
        console.log(`[ScopeManager] Resolved via sourceSymbol ID to: ${sourceSymbol.name} (${sourceSymbol.kind}) in module ${sourceSymbol.module}`);
        return sourceSymbol;
      }
    }
    if (symbol.importSource) {
      console.log(`[ScopeManager] Searching in module "${symbol.importSource}"`);
      for (const scope of this.scopes.values()) {
        if (scope.kind === "Module" /* Module */ && scope.name === symbol.importSource) {
          console.log(`[ScopeManager] Found source module scope: ${scope.name}`);
          const originalName = (_a = symbol.metadata) == null ? void 0 : _a.originalImportName;
          const searchName = originalName || symbol.name;
          console.log(`[ScopeManager] Looking for symbol "${searchName}" in source module`);
          const sourceSymbol = scope.symbols.get(searchName);
          if (sourceSymbol && sourceSymbol.kind !== "Use" /* Use */) {
            console.log(`[ScopeManager] Found source symbol: ${sourceSymbol.name} (${sourceSymbol.kind})`);
            return sourceSymbol;
          }
          console.log(`[ScopeManager] Symbol not found directly, checking all exported symbols`);
          for (const [name, sym] of scope.symbols.entries()) {
            if (sym.isExported && sym.kind !== "Use" /* Use */) {
              console.log(`[ScopeManager]   - Found exported: ${name} (${sym.kind})`);
              if (originalName === name || !originalName && name === symbol.name) {
                return sym;
              }
            }
          }
          break;
        }
      }
    }
    console.log(`[ScopeManager] Could not resolve import, returning import symbol`);
    return symbol;
  }
  /**
   * Find the narrowest (most specific) scope that contains the given position.
   * This walks the scope tree depth-first to find the deepest scope containing the position.
   *
   * @param position - The position to search for
   * @param rootScopeId - Optional: Start search from this scope instead of global
   */
  findNarrowestScopeAtPosition(position, rootScopeId) {
    let narrowestScope = null;
    let maxDepth = -1;
    const spanContainsPosition = (scopeSpan, pos) => {
      if (!scopeSpan) return false;
      return pos.start >= scopeSpan.start && pos.end <= scopeSpan.end;
    };
    const scopeContainsSymbolsNearPosition = (scope, pos) => {
      for (const symbol of scope.symbols.values()) {
        const symbolSpan = symbol.targetSpan || symbol.contextSpan;
        if (Math.abs(symbolSpan.start - pos.start) < 1e3 || // Within 1000 chars
        spanContainsPosition(symbolSpan, pos)) {
          return true;
        }
      }
      return false;
    };
    const searchScope = (scopeId, depth) => {
      var _a;
      const scope = this.getScope(scopeId);
      const scopeSpan = (_a = scope.metadata) == null ? void 0 : _a.span;
      let containsPosition = false;
      if (scopeSpan) {
        containsPosition = spanContainsPosition(scopeSpan, position);
      } else if (scope.kind === "Module" /* Module */) {
        containsPosition = scopeContainsSymbolsNearPosition(scope, position);
      } else {
        for (const symbol of scope.symbols.values()) {
          if (spanContainsPosition(symbol.contextSpan, position) || symbol.targetSpan && spanContainsPosition(symbol.targetSpan, position)) {
            containsPosition = true;
            break;
          }
        }
      }
      if (containsPosition && depth > maxDepth) {
        narrowestScope = scope;
        maxDepth = depth;
      }
      for (const childId of scope.children) {
        searchScope(childId, depth + 1);
      }
    };
    const startScopeId = rootScopeId != null ? rootScopeId : this.globalScope.id;
    searchScope(startScopeId, 0);
    if (!narrowestScope) {
      console.log(`[ScopeManager] No scope found via tree search, searching by symbol proximity`);
      narrowestScope = this.findScopeBySymbolProximity(position, rootScopeId);
    }
    if (!narrowestScope) {
      console.log(`[ScopeManager] Using root scope as final fallback`);
      narrowestScope = rootScopeId ? this.getScope(rootScopeId) : this.globalScope;
    }
    return narrowestScope;
  }
  /**
   * Find scope by symbol proximity - looks for symbols closest to position.
   * This is used as a fallback when scope span information is not available.
   *
   * @param position - The position to search near
   * @param rootScopeId - Optional: Restrict search to this scope and its children
   */
  findScopeBySymbolProximity(position, rootScopeId) {
    let bestMatch = null;
    console.log(`[ScopeManager] Searching by symbol proximity for position ${position.start}-${position.end}${rootScopeId ? ` within scope ${rootScopeId}` : ""}`);
    const isWithinRootScope = (scope) => {
      if (!rootScopeId) return true;
      let current = scope;
      while (current) {
        if (current.id === rootScopeId) return true;
        current = current.parent !== null ? this.getScope(current.parent) : null;
      }
      return false;
    };
    for (const scope of this.scopes.values()) {
      if (scope.kind === "Global" /* Global */) continue;
      if (rootScopeId && !isWithinRootScope(scope)) {
        continue;
      }
      if (scope.kind === "Module" /* Module */ || scope.kind === "Function" /* Function */) {
        for (const symbol of scope.symbols.values()) {
          const symbolSpan = symbol.contextSpan;
          if (position.start >= symbolSpan.start && position.start <= symbolSpan.end) {
            console.log(`[ScopeManager] Found scope by direct containment: ${scope.name} (symbol: ${symbol.name})`);
            return scope;
          }
          const distance = Math.abs(symbolSpan.start - position.start);
          if (!bestMatch || distance < bestMatch.distance) {
            bestMatch = { scope, distance, symbol };
          }
        }
      }
    }
    if (bestMatch) {
      console.log(`[ScopeManager] Found scope by proximity: ${bestMatch.scope.name} (closest symbol: ${bestMatch.symbol.name}, distance: ${bestMatch.distance})`);
      return bestMatch.scope;
    }
    return null;
  }
  // └──────────────────────────────────────────────────────────────────────┘
};
// ┌──────────────────────────────── INIT ────────────────────────────────┐
ScopeManager.SYMBOL_PROXIMITY_THRESHOLD = 1e3;

// lib/phases/SymbolCollector.ts
import * as AST2 from "@je-es/ast";

// lib/utils/PathUtils.ts
import * as path from "path";
var PathUtils = class {
  /**
   * Resolves a module import path against the program's root path
   */
  static resolveModulePath(program, importPath, currentModulePath) {
    var _a;
    const programRoot = ((_a = program.metadata) == null ? void 0 : _a.path) || "./";
    if (importPath.startsWith(".") && currentModulePath) {
      const currentDir = path.dirname(currentModulePath);
      const resolved = path.resolve(currentDir, importPath);
      return path.relative(programRoot, resolved);
    }
    if (path.isAbsolute(importPath)) {
      return path.relative(programRoot, importPath);
    }
    return path.normalize(importPath);
  }
  /**
   * Finds a module by its resolved path
   */
  static findModuleByPath(program, targetPath) {
    var _a, _b;
    const programRoot = ((_a = program.metadata) == null ? void 0 : _a.path) || "./";
    const normalizedTarget = path.normalize(targetPath);
    for (const [_, module] of program.modules) {
      const modulePath = (_b = module.metadata) == null ? void 0 : _b.path;
      if (!modulePath) continue;
      const relativeModulePath = path.relative(programRoot, modulePath);
      const normalizedModulePath = path.normalize(modulePath);
      const normalizedRelativePath = path.normalize(relativeModulePath);
      if (normalizedModulePath === normalizedTarget || normalizedRelativePath === normalizedTarget || modulePath === targetPath || relativeModulePath === targetPath) {
        return module;
      }
    }
    return void 0;
  }
  /**
   * Validates if a path exists in the program structure
   */
  static validatePath(program, importPath, currentModulePath) {
    try {
      const resolvedPath = this.resolveModulePath(program, importPath, currentModulePath);
      return this.findModuleByPath(program, resolvedPath) !== void 0;
    } catch (e) {
      return false;
    }
  }
  /**
   * Gets the relative path between two modules
   */
  static getRelativePath(fromPath, toPath) {
    const relativePath = path.relative(path.dirname(fromPath), toPath);
    return relativePath.startsWith(".") ? relativePath : "./" + relativePath;
  }
  /**
   * Finds the module name by its path
   */
  static findModuleNameByPath(program, targetPath) {
    var _a;
    const module = this.findModuleByPath(program, targetPath);
    if (!module) return void 0;
    const metadataName = (_a = module.metadata) == null ? void 0 : _a.name;
    if (metadataName) return metadataName;
    const baseName = path.basename(targetPath, path.extname(targetPath));
    return baseName === "index" ? path.basename(path.dirname(targetPath)) : baseName;
  }
  /**
   * Normalizes a path for consistent comparison
   */
  static normalizePath(filePath) {
    return path.normalize(filePath).replace(/\\/g, "/");
  }
};

// lib/interfaces/PhaseBase.ts
var PhaseBase = class {
  constructor(phase, config) {
    this.phase = phase;
    this.config = config;
  }
  reportError(code, message, span) {
    this.config.services.diagnosticManager.reportError(code, message, span);
  }
  reportWarning(code, message, span) {
    this.config.services.diagnosticManager.reportWarning(code, message, span);
  }
  reportInfo(code, message, span) {
    this.config.services.diagnosticManager.reportInfo(code, message, span);
  }
  log(kind = "verbose", message) {
    if (this.config.services.debugManager) {
      this.config.services.debugManager.log(kind, message);
    }
  }
  /**
   * Extract getter function for statement node based on its kind.
   * Returns null if the statement kind is invalid or unsupported.
   */
  getNodeGetter(stmt) {
    switch (stmt.kind) {
      case "Def":
        return () => stmt.getDef();
      case "Use":
        return () => stmt.getUse();
      case "Let":
        return () => stmt.getLet();
      case "Func":
        return () => stmt.getFunc();
      case "Block":
        return () => stmt.getBlock();
      case "Return":
      case "Defer":
      case "Throw":
        return () => stmt.getCtrlflow();
      case "Expression":
        return () => stmt.getExpr();
      case "While":
      case "Do":
      case "For":
        return () => stmt.getLoop();
      case "Break":
        return () => stmt.getBreak();
      case "Continue":
        return () => stmt.getContinue();
      case "Test":
        return () => stmt.getTest();
      default:
        return null;
    }
  }
  /**
   * Process a statement by delegating to kind-specific handlers.
   * Returns the result of the handler or null if kind is unsupported.
  */
  processStmtByKind(stmt, handlers) {
    const getter = this.getNodeGetter(stmt);
    if (!getter) {
      this.reportError(
        "INTERNAL_ERROR" /* INTERNAL_ERROR */,
        `Invalid AST: ${stmt.kind} node getter not found`
      );
      return null;
    }
    const handler = handlers[stmt.kind];
    if (!handler) {
      return null;
    }
    const node = getter();
    if (!node) {
      this.reportError(
        "INTERNAL_ERROR" /* INTERNAL_ERROR */,
        `Invalid AST: ${stmt.kind} node is null`
      );
      return null;
    }
    return handler(node);
  }
};

// lib/phases/SymbolCollector.ts
var SymbolCollector = class extends PhaseBase {
  // moduleName -> exported symbol names
  constructor(config) {
    super("Collection" /* Collection */, config);
    // ┌──────────────────────────────── INIT ────────────────────────────────┐
    this.pathContext = { pathMappings: /* @__PURE__ */ new Map() };
    this.stats = this.initStats();
    this.typeContext = this.initTypeContext();
    this.typeRegistry = /* @__PURE__ */ new Map();
    this.moduleExports = /* @__PURE__ */ new Map();
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── MAIN ────────────────────────────────┐
  handle() {
    try {
      this.log("verbose", "Starting symbol collection phase...");
      this.stats.startTime = Date.now();
      if (!this.init()) {
        return false;
      }
      if (!this.buildPathMappings()) {
        return false;
      }
      if (!this.collectAllModules()) {
        return false;
      }
      this.logStatistics();
      return !this.config.services.diagnosticManager.hasErrors();
    } catch (error) {
      this.log("errors", `Fatal error during symbol collection: ${error}`);
      this.reportError("INTERNAL_ERROR" /* INTERNAL_ERROR */, `Fatal error during symbol collection: ${error}`);
      return false;
    }
  }
  reset() {
    this.pathContext = { pathMappings: /* @__PURE__ */ new Map() };
    this.stats = this.initStats();
    this.typeContext = this.initTypeContext();
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌────────────────────────── [1] Program Level ─────────────────────────┐
  buildPathMappings() {
    var _a, _b;
    this.log("verbose", "Building module path mappings...");
    this.pathContext.pathMappings.clear();
    const rootPath = (_a = this.config.program.metadata) == null ? void 0 : _a.path;
    if (!rootPath) {
      this.reportWarning("MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */, "No root path found in program metadata");
      return false;
    }
    this.pathContext.rootPath = rootPath;
    for (const [moduleName, module] of this.config.program.modules) {
      const modulePath = (_b = module.metadata) == null ? void 0 : _b.path;
      if (!modulePath) {
        this.reportWarning("MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */, `No file path found for module ${moduleName}`);
        continue;
      }
      try {
        const relativePath = PathUtils.getRelativePath(rootPath, modulePath);
        const normalizedPath = PathUtils.normalizePath(relativePath);
        if (this.pathContext.pathMappings.has(normalizedPath)) {
          const existing = this.pathContext.pathMappings.get(normalizedPath);
          if (existing !== moduleName) {
            this.reportError(
              "MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */,
              `Path collision: '${normalizedPath}' maps to both '${existing}' and '${moduleName}'`
            );
            return false;
          }
        }
        this.pathContext.pathMappings.set(modulePath, moduleName);
        this.pathContext.pathMappings.set(relativePath, moduleName);
        this.pathContext.pathMappings.set(normalizedPath, moduleName);
        this.log("verbose", `Mapped ${moduleName} -> ${relativePath}`);
      } catch (error) {
        this.reportWarning("MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */, `Failed to map module path for ${moduleName}: ${error}`);
      }
    }
    return true;
  }
  collectAllModules() {
    this.log("verbose", "Collecting symbols from all modules...");
    const globalScope = this.config.services.scopeManager.getCurrentScope();
    for (const [moduleName, module] of this.config.program.modules) {
      this.config.services.contextTracker.pushContextSpan({ start: 0, end: 0 });
      try {
        if (!this.collectModule(moduleName, module, globalScope)) {
          if (this.config.services.contextTracker.getCurrentPhase() === "Collection" /* Collection */) {
            this.log("errors", `Failed to collect from module ${moduleName}, continuing...`);
          }
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
  collectModule(moduleName, module, parentScope) {
    var _a;
    this.log("symbols", `Collecting from module '${moduleName}'`);
    this.typeContext = this.initTypeContext();
    try {
      this.config.services.contextTracker.setModuleName(moduleName);
      const modulePath = (_a = module.metadata) == null ? void 0 : _a.path;
      if (modulePath) {
        this.config.services.contextTracker.setModulePath(modulePath);
        this.pathContext.currentModulePath = modulePath;
      }
      const moduleScope = this.createModuleScope(moduleName, parentScope);
      for (const statement of module.statements) {
        if (statement.kind === "Def" || statement.kind === "Let" || statement.kind === "Func") {
          this.collectStmt(statement, moduleScope, moduleName);
        }
      }
      for (const statement of module.statements) {
        if (statement.kind === "Use") {
          this.collectStmt(statement, moduleScope, moduleName);
        }
      }
      for (const statement of module.statements) {
        if (statement.kind !== "Def" && statement.kind !== "Let" && statement.kind !== "Func" && statement.kind !== "Use") {
          this.collectStmt(statement, moduleScope, moduleName);
        }
      }
      return true;
    } catch (error) {
      this.reportError("MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */, `Failed to collect symbols from module '${moduleName}': ${error}`);
      return false;
    }
  }
  createModuleScope(moduleName, parentScope) {
    const moduleScope = this.config.services.scopeManager.createScope("Module" /* Module */, moduleName, parentScope.id);
    this.incrementScopesCreated();
    this.log("scopes", `Created module scope ${moduleScope.id} for '${moduleName}'`);
    return moduleScope;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── [3] Stmt Level ───────────────────────────┐
  collectStmt(stmt, currentScope, moduleName) {
    if (!stmt) {
      this.reportError("ANALYSIS_ERROR" /* ANALYSIS_ERROR */, "Found null statement during collection");
      return;
    }
    this.log("verbose", `Collecting from ${stmt.kind} statement`);
    this.config.services.contextTracker.pushContextSpan(stmt.span);
    try {
      this.config.services.scopeManager.withScope(currentScope.id, () => {
        this.config.services.contextTracker.withSavedState(() => {
          this.config.services.contextTracker.setScope(currentScope.id);
          this.processStmtByKind(stmt, {
            "Block": (blockNode) => this.handleBlockStmt(blockNode, currentScope, moduleName),
            "Test": (testNode) => this.handleTestStmt(testNode, currentScope, moduleName),
            "Use": (useNode) => this.handleUseStmt(useNode, currentScope, moduleName),
            "Def": (defNode) => this.handleDefStmt(defNode, currentScope, moduleName),
            "Let": (letNode) => this.handleLetStmt(letNode, currentScope, moduleName),
            "Func": (funcNode) => this.handleFuncStmt(funcNode, currentScope, moduleName),
            "Expression": (exprNode) => this.collectExpr(exprNode, currentScope, moduleName),
            // special cases
            "While": () => this.handleLoopStmt(stmt, currentScope, moduleName),
            "Do": () => this.handleLoopStmt(stmt, currentScope, moduleName),
            "For": () => this.handleLoopStmt(stmt, currentScope, moduleName),
            "Return": () => this.handleControlflowStmt(stmt, currentScope, moduleName),
            "Defer": () => this.handleControlflowStmt(stmt, currentScope, moduleName),
            "Throw": () => this.handleControlflowStmt(stmt, currentScope, moduleName)
          });
        });
      });
    } catch (error) {
      this.reportError(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        `Failed to process ${stmt.kind} statement: ${error}`,
        stmt.span
      );
    } finally {
      this.config.services.contextTracker.popContextSpan();
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────── [3.1] BLOCK ─────────────────────────────┐
  handleBlockStmt(blockNode, scope, moduleName) {
    this.collectBlockStmt(blockNode, scope, moduleName);
  }
  createBlockScope(parentScope) {
    const blockScope = this.config.services.scopeManager.createScope("Block" /* Block */, "block", parentScope.id);
    this.incrementScopesCreated();
    this.log("scopes", `Created block scope ${blockScope.id} under parent ${parentScope.id}`);
    return blockScope;
  }
  collectBlockStmt(blockNode, parentScope, moduleName) {
    const blockScope = this.createBlockScope(parentScope);
    this.config.services.scopeManager.withScope(blockScope.id, () => {
      this.config.services.contextTracker.withSavedState(() => {
        this.config.services.contextTracker.setScope(blockScope.id);
        for (const stmt of blockNode.stmts) {
          this.collectStmt(stmt, blockScope, moduleName);
        }
      });
    });
  }
  handleTestStmt(testNode, scope, moduleName) {
    this.collectBlockStmt(testNode.block, scope, moduleName);
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────────── [3.2] USE ──────────────────────────────┐
  handleUseStmt(useNode, scope, moduleName) {
    this.collectUseStmt(useNode, scope, moduleName);
  }
  createUseSymbol(useNode, currentScope, moduleName, targetModuleName) {
    var _a;
    const symbolName = this.extractImportSymbolName(useNode);
    const targetSpan = useNode.alias ? useNode.alias.span : useNode.targetArr ? useNode.targetArr[useNode.targetArr.length - 1].span : useNode.span;
    const symbol = this.createBaseSymbol(
      symbolName,
      "Use" /* Use */,
      currentScope,
      moduleName,
      useNode.span,
      targetSpan
    );
    const isModuleScope = currentScope.kind === "Module" /* Module */;
    const isPublic = useNode.visibility.kind === "Public";
    const metadata = {};
    if (!useNode.targetArr) {
      metadata.isWildcardImport = true;
      metadata.exportedSymbols = targetModuleName ? Array.from(this.getModuleExports(targetModuleName) || []) : [];
    } else if (useNode.targetArr.length > 1) {
      metadata.memberPath = useNode.targetArr.map((t) => t.name);
      metadata.needsFullResolution = true;
    }
    return __spreadProps(__spreadValues({}, symbol), {
      initialized: true,
      visibility: useNode.visibility,
      isExported: isModuleScope && isPublic,
      importSource: targetModuleName,
      importPath: targetModuleName ? useNode.path : void 0,
      importAlias: targetModuleName ? (_a = useNode.alias) == null ? void 0 : _a.name : void 0,
      metadata: Object.keys(metadata).length > 0 ? metadata : void 0,
      declared: false
      // ⚠️ Not declared until resolution validates it
    });
  }
  collectUseStmt(useNode, currentScope, moduleName) {
    this.log("symbols", "Collecting use statement");
    try {
      if (useNode.path) {
        this.processModuleImport(useNode, currentScope, moduleName);
      } else {
        this.processLocalUse(useNode, currentScope, moduleName);
      }
    } catch (error) {
      this.reportError("ANALYSIS_ERROR" /* ANALYSIS_ERROR */, `Failed to process use statement: ${error}`, useNode.span);
    }
  }
  extractImportSymbolName(useNode, allow_alias = true) {
    if (allow_alias && useNode.alias) {
      return useNode.alias.name;
    }
    if (!useNode.targetArr) {
      if (!useNode.alias) {
        this.reportError(
          "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
          `Wildcard import requires an alias (use * as <name> from "...")`,
          useNode.span
        );
        return "<invalid>";
      }
      return useNode.alias.name;
    }
    const isJustIdent = useNode.targetArr.length === 1;
    if (isJustIdent) {
      return useNode.targetArr[0].name;
    } else {
      return useNode.targetArr[useNode.targetArr.length - 1].name;
    }
  }
  processModuleImport(useNode, currentScope, moduleName) {
    var _a, _b, _c, _d, _e;
    if (!this.config.program || !useNode.path) {
      this.reportError("MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */, "Invalid import: missing path", useNode.span);
      return;
    }
    const currentModule = this.config.program.modules.get(moduleName);
    const currentModulePath = (_a = currentModule == null ? void 0 : currentModule.metadata) == null ? void 0 : _a.path;
    if (!PathUtils.validatePath(this.config.program, useNode.path, currentModulePath)) {
      this.reportError("MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */, `Module not found in path '${useNode.path}'`, useNode.pathSpan);
      this.stats.importResolutionFailures++;
      return;
    }
    const resolvedPath = PathUtils.resolveModulePath(this.config.program, useNode.path, currentModulePath);
    const targetModuleName = PathUtils.findModuleNameByPath(this.config.program, resolvedPath);
    if (!targetModuleName) {
      this.reportError("MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */, `Could not resolve module name for path: ${useNode.path}`, useNode.span);
      this.stats.importResolutionFailures++;
      return;
    }
    const targetModule = this.config.program.modules.get(targetModuleName);
    if (!targetModule) {
      this.reportError("MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */, `Target module '${targetModuleName}' not found`, useNode.span);
      this.stats.importResolutionFailures++;
      return;
    }
    if (!useNode.targetArr) {
      this.processWildcardImport(useNode, targetModule, targetModuleName, currentScope, moduleName);
      return;
    }
    if (!this.validateMemberPathInModule(targetModule, useNode.targetArr, useNode)) {
      this.reportError("SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */, `Symbol '${useNode.targetArr[0].name}' not found in module '${targetModuleName}'`, useNode.targetArr[0].span);
      this.stats.importResolutionFailures++;
      return;
    }
    const symbolName = this.extractImportSymbolName(useNode);
    const existingImport = currentScope.symbols.get(symbolName);
    if (existingImport && existingImport.kind === "Use" /* Use */ && existingImport.importSource === targetModuleName) {
      this.reportWarning(
        "DUPLICATE_SYMBOL" /* DUPLICATE_SYMBOL */,
        `Symbol '${symbolName}' already imported from module '${targetModuleName}'`,
        (_c = (_b = useNode.alias) == null ? void 0 : _b.span) != null ? _c : useNode.targetArr[useNode.targetArr.length - 1].span
      );
    }
    if (this.checkForShadowing(symbolName, currentScope, "Use" /* Use */, (_e = (_d = useNode.alias) == null ? void 0 : _d.span) != null ? _e : useNode.targetArr[useNode.targetArr.length - 1].span)) {
      return;
    }
    const rootSymbolName = useNode.targetArr[0].name;
    if (!this.canImportSymbol(targetModuleName, rootSymbolName)) {
      this.reportError(
        "SYMBOL_NOT_EXPORTED" /* SYMBOL_NOT_EXPORTED */,
        `Symbol '${rootSymbolName}' is private in module '${targetModuleName}'`,
        useNode.targetArr[0].span
      );
      this.stats.importResolutionFailures++;
      return;
    }
    const useSymbol = this.createUseSymbol(useNode, currentScope, moduleName, targetModuleName);
    this.config.services.scopeManager.addSymbolToScope(useSymbol, currentScope.id);
    this.incrementSymbolsCollected();
    this.log("verbose", `Resolved import ${useNode.path} -> ${targetModuleName}.${useNode.targetArr.map((t) => t.name).join(".")}`);
  }
  processWildcardImport(useNode, targetModule, targetModuleName, currentScope, moduleName) {
    if (!useNode.alias) {
      this.reportError(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        `Wildcard import requires an alias (use * as <name> from "...")`,
        useNode.span
      );
      return;
    }
    const aliasName = useNode.alias.name;
    if (this.checkForShadowing(aliasName, currentScope, "Use" /* Use */, useNode.alias.span)) {
      return;
    }
    const exports = this.getModuleExports(targetModuleName);
    if (!exports || exports.size === 0) {
      this.reportWarning(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        `Module '${targetModuleName}' has no exported symbols`,
        useNode.span
      );
    }
    const symbol = this.createBaseSymbol(
      aliasName,
      "Use" /* Use */,
      currentScope,
      moduleName,
      useNode.span,
      useNode.alias.span
    );
    const isModuleScope = currentScope.kind === "Module" /* Module */;
    const isPublic = useNode.visibility.kind === "Public";
    const wildcardSymbol = __spreadProps(__spreadValues({}, symbol), {
      initialized: true,
      visibility: useNode.visibility,
      isExported: isModuleScope && isPublic,
      importSource: targetModuleName,
      importPath: useNode.path,
      importAlias: aliasName,
      metadata: {
        isWildcardImport: true,
        exportedSymbols: exports ? Array.from(exports) : []
      },
      declared: false
      // Will be resolved later
    });
    this.config.services.scopeManager.addSymbolToScope(wildcardSymbol, currentScope.id);
    this.incrementSymbolsCollected();
    this.log("verbose", `Collected wildcard import from '${targetModuleName}' as '${aliasName}'`);
  }
  processLocalUse(useNode, currentScope, moduleName) {
    var _a, _b;
    if (!useNode.targetArr) {
      this.reportError(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        `Wildcard import not supported for local use. Use 'use * as x from "path"' for module imports`,
        useNode.span
      );
      return;
    }
    const symbolName = this.extractImportSymbolName(useNode);
    if (this.checkForShadowing(symbolName, currentScope, "Use" /* Use */, (_b = (_a = useNode.alias) == null ? void 0 : _a.span) != null ? _b : useNode.targetArr[0].span)) {
      return;
    }
    const useSymbol = this.createUseSymbol(useNode, currentScope, moduleName);
    this.config.services.scopeManager.addSymbolToScope(useSymbol, currentScope.id);
    this.incrementSymbolsCollected();
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────────── [3.3] DEF ──────────────────────────────┐
  handleDefStmt(defNode, scope, moduleName) {
    this.collectDefStmt(defNode, scope, moduleName);
  }
  createDefSymbol(defNode, scope, moduleName) {
    var _a;
    const symbol = this.createBaseSymbol(
      defNode.ident.name,
      "Definition" /* Definition */,
      scope,
      moduleName,
      defNode.span,
      defNode.ident.span
    );
    const isModuleScope = scope.kind === "Module" /* Module */;
    const isPublic = defNode.visibility.kind === "Public";
    return __spreadProps(__spreadValues({}, symbol), {
      type: (_a = defNode.type) != null ? _a : null,
      initialized: true,
      visibility: defNode.visibility,
      isExported: isModuleScope && isPublic
      // Set export flag
    });
  }
  collectDefStmt(defNode, scope, moduleName) {
    this.log("symbols", `Collecting definition '${defNode.ident.name}'`);
    if (this.checkForShadowing(defNode.ident.name, scope, "Definition" /* Definition */, defNode.ident.span)) {
      return;
    }
    const symbol = this.createDefSymbol(defNode, scope, moduleName);
    this.config.services.scopeManager.addSymbolToScope(symbol, scope.id);
    this.incrementSymbolsCollected();
    this.trackModuleExport(moduleName, defNode.ident.name, symbol.isExported);
    this.typeRegistry.set(defNode.ident.name, symbol);
    this.collectType(defNode.type, scope, moduleName, defNode.ident.name);
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────────── [3.4] LET ──────────────────────────────┐
  handleLetStmt(letNode, scope, moduleName) {
    this.collectLetStmt(letNode, scope, moduleName);
  }
  createLetSymbol(varNode, scope, moduleName) {
    var _a;
    const symbol = this.createBaseSymbol(
      varNode.field.ident.name,
      "Variable" /* Variable */,
      scope,
      moduleName,
      varNode.field.span,
      varNode.field.ident.span
    );
    const isModuleScope = scope.kind === "Module" /* Module */;
    const isPublic = varNode.field.visibility.kind === "Public";
    return __spreadProps(__spreadValues({}, symbol), {
      type: (_a = varNode.field.type) != null ? _a : null,
      initialized: !!varNode.field.initializer,
      visibility: varNode.field.visibility,
      mutability: varNode.field.mutability,
      isExported: isModuleScope && isPublic,
      metadata: {
        initializer: varNode.field.initializer
      }
    });
  }
  collectLetStmt(letNode, scope, moduleName) {
    this.log("symbols", `Collecting let '${letNode.field.ident.name}'`);
    if (this.checkForShadowing(letNode.field.ident.name, scope, "Variable" /* Variable */, letNode.field.ident.span, false)) {
      return;
    }
    this.checkForShadowing(letNode.field.ident.name, scope, "Variable" /* Variable */, letNode.field.ident.span, true);
    if (letNode.field.type) {
      if (letNode.field.type.isErr() && letNode.field.mutability.kind === "Mutable") {
        this.reportError(
          "MUTABILITY_MISMATCH" /* MUTABILITY_MISMATCH */,
          `Error values cannot be stored in mutable variables. Use 'let ${letNode.field.ident.name}: err = ...' instead of 'let mut'`,
          letNode.field.ident.span
        );
        return;
      }
    }
    const symbol = this.createLetSymbol(letNode, scope, moduleName);
    this.config.services.scopeManager.addSymbolToScope(symbol, scope.id);
    this.incrementSymbolsCollected();
    this.trackModuleExport(moduleName, letNode.field.ident.name, symbol.isExported);
    if (letNode.field.initializer) {
      const initType = this.extractTypeFromInitializer(letNode.field.initializer);
      if (initType) {
        letNode.field.type = initType;
        symbol.type = initType;
        if (initType.isStruct() || initType.isEnum()) {
          this.collectType(initType, scope, moduleName, letNode.field.ident.name);
        }
      }
    }
    if (letNode.field.type) {
      this.collectType(letNode.field.type, scope, moduleName, letNode.field.ident.name);
    }
    if (letNode.field.initializer && !letNode.field.type) {
      this.collectExpr(letNode.field.initializer, scope, moduleName);
    }
  }
  extractTypeFromInitializer(expr) {
    if (expr.kind !== "Primary") return null;
    const primary = expr.getPrimary();
    if (!primary) return null;
    if (primary.kind === "Type") {
      return primary.getType();
    }
    if (primary.kind === "Object") {
      const obj = primary.getObject();
      if (!obj || !obj.ident) return null;
      const typeSymbol = this.config.services.scopeManager.lookupSymbol(obj.ident.name);
      if (!typeSymbol || !typeSymbol.type) return null;
      if (typeSymbol.type.isStruct()) {
        return typeSymbol.type;
      }
    }
    return null;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────────── [3.5] FUNC ─────────────────────────────┐
  handleFuncStmt(funcNode, scope, moduleName) {
    this.collectFuncStmt(funcNode, scope, moduleName);
  }
  determineErrorMode(errorType) {
    var _a, _b;
    if (errorType.isErr()) {
      return "any-error";
    }
    if (errorType.isErrset()) {
      return "self-group";
    }
    if (errorType.isIdent()) {
      const ident = errorType.getIdent();
      if (ident.builtin) {
        return "any-error";
      }
      const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
      if (!symbol) {
        return "any-error";
      }
      if (symbol.kind === "Variable" /* Variable */ && ((_a = symbol.type) == null ? void 0 : _a.isErr())) {
        return "err-ident";
      }
      if (symbol.kind === "Definition" /* Definition */ && ((_b = symbol.type) == null ? void 0 : _b.isErrset())) {
        return "err-group";
      }
    }
    return "any-error";
  }
  extractSelfGroupErrors(errorType) {
    if (!errorType || !errorType.isErrset()) {
      return void 0;
    }
    const errset = errorType.getErrset();
    return errset.members.map((m) => m.name);
  }
  createFuncSymbol(funcNode, scope, moduleName) {
    const symbol = this.createBaseSymbol(
      funcNode.ident.name,
      "Function" /* Function */,
      scope,
      moduleName,
      funcNode.span,
      funcNode.ident.span
    );
    const isModuleScope = scope.kind === "Module" /* Module */;
    const isPublic = funcNode.visibility.kind === "Public";
    const errorMode = funcNode.errorType ? this.determineErrorMode(funcNode.errorType) : void 0;
    const selfGroupErrors = errorMode === "self-group" ? this.extractSelfGroupErrors(funcNode.errorType) : void 0;
    return __spreadProps(__spreadValues({}, symbol), {
      initialized: true,
      visibility: funcNode.visibility,
      isExported: isModuleScope && isPublic,
      metadata: {
        callable: true,
        params: [],
        returnType: funcNode.returnType || void 0,
        errorType: funcNode.errorType || void 0,
        errorMode,
        // NEW
        selfGroupErrors
        // NEW
      }
    });
  }
  createFuncScope(functionName, parentScope) {
    const funcScope = this.config.services.scopeManager.createScope("Function" /* Function */, functionName, parentScope.id);
    this.incrementScopesCreated();
    return funcScope;
  }
  collectFuncStmt(funcNode, scope, moduleName) {
    var _a;
    this.log("symbols", `Collecting function '${funcNode.ident.name}'`);
    if (this.checkForShadowing(funcNode.ident.name, scope, "Function" /* Function */, funcNode.ident.span)) {
      return;
    }
    this.checkForShadowing(funcNode.ident.name, scope, "Function" /* Function */, funcNode.ident.span, true);
    const funcScope = this.createFuncScope(funcNode.ident.name, scope);
    const funcSymbol = this.createFuncSymbol(funcNode, scope, moduleName);
    const isComptimeFunc = funcNode.comptime.kind === "Comptime";
    if (!funcSymbol.metadata) {
      funcSymbol.metadata = {};
    }
    funcSymbol.metadata.isComptimeFunction = isComptimeFunc;
    if (isComptimeFunc) {
      funcSymbol.metadata.comptimeFunctionBody = funcNode.body;
      funcSymbol.metadata.comptimeParameters = funcNode.parameters;
    }
    this.config.services.scopeManager.addSymbolToScope(funcSymbol, scope.id);
    this.incrementSymbolsCollected();
    this.trackModuleExport(moduleName, funcNode.ident.name, funcSymbol.isExported);
    const errorMode = funcNode.errorType ? this.determineErrorMode(funcNode.errorType) : void 0;
    const parentScope = this.config.services.scopeManager.getScope(scope.id);
    const isStructMethod = parentScope.kind === "Type" /* Type */ && ((_a = parentScope.metadata) == null ? void 0 : _a.typeKind) === "Struct" && !(funcNode.visibility.kind === "Static");
    this.config.services.scopeManager.withScope(funcScope.id, () => {
      this.config.services.contextTracker.withSavedState(() => {
        if (isStructMethod) {
          this.injectSelfParameter(funcScope, parentScope, moduleName);
        }
        if (errorMode === "self-group" && funcNode.errorType) {
          this.injectSelfErrReference(funcScope, funcNode.errorType, moduleName);
        }
        this.collectType(funcNode.returnType, scope, moduleName, funcNode.ident.name);
        if (funcSymbol.metadata && funcSymbol.metadata.params) {
          funcSymbol.metadata.params = this.collectParams(funcNode.parameters, funcScope, moduleName);
        }
        if (funcNode.body) {
          this.collectStmt(funcNode.body, funcScope, moduleName);
        }
      });
    });
  }
  // ───── PARAMS ─────
  createParamSymbol(paramNode, scope, moduleName) {
    var _a, _b;
    const symbol = this.createBaseSymbol(
      paramNode.ident.name,
      "Parameter" /* Parameter */,
      scope,
      moduleName,
      paramNode.span,
      paramNode.ident.span
    );
    return __spreadProps(__spreadValues({}, symbol), {
      type: (_a = paramNode.type) != null ? _a : null,
      initialized: true,
      visibility: (_b = paramNode.visibility) != null ? _b : "Private",
      mutability: paramNode.mutability
      // Added
    });
  }
  collectParams(parameters, funcScope, moduleName) {
    const collectedParams = [];
    const seenParams = /* @__PURE__ */ new Set();
    const hasSelfParam = funcScope.symbols.has("self");
    for (const paramNode of parameters) {
      if (paramNode.ident.name === "self" && hasSelfParam) {
        this.reportError(
          "PARAMETER_SHADOWING" /* PARAMETER_SHADOWING */,
          `Duplicate parameter name 'self'`,
          paramNode.ident.span
        );
        continue;
      }
      if (this.checkForShadowing(paramNode.ident.name, funcScope, "Parameter" /* Parameter */, paramNode.ident.span)) {
        continue;
      }
      this.checkForShadowing(paramNode.ident.name, funcScope, "Parameter" /* Parameter */, paramNode.ident.span, true);
      seenParams.add(paramNode.ident.name);
      const paramSymbol = this.createParamSymbol(paramNode, funcScope, moduleName);
      this.config.services.scopeManager.addSymbolToScope(paramSymbol, funcScope.id);
      this.incrementSymbolsCollected();
      collectedParams.push(paramSymbol);
      if (paramNode.type) {
        if (paramNode.type.isStruct() || paramNode.type.isEnum()) {
          const typeScopeName = `${paramNode.ident.name}-type`;
          const typeScope = this.createTypeScope(typeScopeName, funcScope);
          if (paramNode.type.isStruct()) {
            const struct = paramNode.type.getStruct();
            struct.metadata = __spreadProps(__spreadValues({}, struct.metadata), { scopeId: typeScope.id });
          } else if (paramNode.type.isEnum()) {
            const enumType = paramNode.type.getEnum();
            enumType.metadata = __spreadProps(__spreadValues({}, enumType.metadata), { scopeId: typeScope.id });
          }
          this.collectType(paramNode.type, funcScope, moduleName, typeScopeName);
        } else {
          this.collectType(paramNode.type, funcScope, moduleName, paramNode.ident.name);
        }
      }
    }
    return collectedParams;
  }
  injectSelfParameter(funcScope, structScope, moduleName) {
    const structType = AST2.TypeNode.asIdentifier(
      { start: 0, end: 0 },
      structScope.name
    );
    const selfSymbol = {
      id: this.config.services.scopeManager.symbolIdGenerator.next(),
      name: "self",
      kind: "Parameter" /* Parameter */,
      type: structType,
      scope: funcScope.id,
      contextSpan: { start: 0, end: 0 },
      // Synthetic - no source location
      targetSpan: { start: 0, end: 0 },
      declared: true,
      initialized: true,
      used: true,
      // Mark as used by default since it's implicit
      visibility: { kind: "Private" },
      mutability: { kind: "Immutable" },
      isTypeChecked: false,
      isExported: false,
      module: moduleName,
      metadata: {
        isSynthetic: true,
        isSelf: true
      }
    };
    this.config.services.scopeManager.addSymbolToScope(selfSymbol, funcScope.id);
    this.stats.syntheticSymbolsInjected++;
    this.incrementSymbolsCollected();
    this.log("symbols", `Injected implicit 'self' parameter in struct method '${funcScope.name}'`);
  }
  injectSelfErrReference(funcScope, errorType, moduleName) {
    const selfErrSymbol = {
      id: this.config.services.scopeManager.symbolIdGenerator.next(),
      name: "selferr",
      kind: "Definition" /* Definition */,
      // It's a type namespace
      type: errorType,
      // Points to the error set
      scope: funcScope.id,
      contextSpan: { start: 0, end: 0 },
      // Synthetic
      targetSpan: { start: 0, end: 0 },
      declared: true,
      initialized: true,
      used: false,
      // Will be marked used when referenced
      visibility: { kind: "Private" },
      mutability: { kind: "Immutable" },
      isTypeChecked: false,
      isExported: false,
      module: moduleName,
      metadata: {
        isSynthetic: true,
        isSelfErr: true
        // NEW FLAG to identify selferr
      }
    };
    this.config.services.scopeManager.addSymbolToScope(selfErrSymbol, funcScope.id);
    this.stats.syntheticSymbolsInjected++;
    this.log("symbols", `Injected 'selferr' reference in function with self-group errors`);
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────────── [3.6] LOOP ─────────────────────────────┐
  handleLoopStmt(stmt, scope, moduleName) {
    if (stmt.getLoop === void 0) {
      const data = stmt;
      switch (stmt.kind) {
        case "While": {
          const src = data.source;
          const loop = AST2.LoopStmtNode.createWhile(data.span, src.expr, src.stmt);
          this.collectLoopStmt(loop, scope, moduleName);
          break;
        }
        case "Do": {
          const src = data.source;
          const loop = AST2.LoopStmtNode.createDo(data.span, src.expr, src.stmt);
          this.collectLoopStmt(loop, scope, moduleName);
          break;
        }
        case "For": {
          const src = data.source;
          const loop = AST2.LoopStmtNode.createFor(data.span, src.expr, src.stmt);
          this.collectLoopStmt(loop, scope, moduleName);
          break;
        }
      }
    } else {
      this.collectLoopStmt(stmt.getLoop(), scope, moduleName);
    }
  }
  createLoopScope(parentScope) {
    const loopScope = this.config.services.scopeManager.createScope("Loop" /* Loop */, "loop", parentScope.id);
    this.incrementScopesCreated();
    this.log("scopes", `Created loop scope ${loopScope.id} under parent ${parentScope.id}`);
    return loopScope;
  }
  collectLoopStmt(loopNode, parentScope, moduleName) {
    const loopScope = this.createLoopScope(parentScope);
    this.config.services.scopeManager.withScope(loopScope.id, () => {
      this.config.services.contextTracker.withSavedState(() => {
        this.config.services.contextTracker.setScope(loopScope.id);
        switch (loopNode.kind) {
          case "While":
            this.collectExpr(loopNode.expr, loopScope, moduleName);
            this.collectStmt(loopNode.stmt, loopScope, moduleName);
            break;
          case "Do":
            this.collectStmt(loopNode.stmt, loopScope, moduleName);
            this.collectExpr(loopNode.expr, loopScope, moduleName);
            break;
          case "For":
            this.collectExpr(loopNode.expr, loopScope, moduleName);
            this.collectStmt(loopNode.stmt, loopScope, moduleName);
            break;
        }
      });
    });
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────── [3.7] CTRLFLOW ──────────────────────────┐
  handleControlflowStmt(stmt, scope, moduleName) {
    if (stmt.getCtrlflow === void 0) {
      const data = stmt;
      switch (stmt.kind) {
        case "Return": {
          const src = data.source;
          const res = AST2.ControlFlowStmtNode.asReturn(data.span, src.value);
          this.collectReturnStmt(res, scope, moduleName);
          break;
        }
        case "Defer": {
          const src = data.source;
          const res = AST2.ControlFlowStmtNode.asDefer(data.span, src.value);
          this.collectDeferStmt(res, scope, moduleName);
          break;
        }
        case "Throw": {
          const src = data.source;
          const res = AST2.ControlFlowStmtNode.asThrow(data.span, src.value);
          this.collectThrowStmt(res, scope, moduleName);
          break;
        }
      }
    } else {
      switch (stmt.getCtrlflow().kind) {
        case "return": {
          this.collectReturnStmt(stmt.getCtrlflow(), scope, moduleName);
          break;
        }
        case "defer": {
          this.collectDeferStmt(stmt.getCtrlflow(), scope, moduleName);
          break;
        }
        case "throw": {
          this.collectThrowStmt(stmt.getCtrlflow(), scope, moduleName);
          break;
        }
      }
    }
  }
  collectReturnStmt(returnNode, scope, moduleName) {
    if (returnNode.value) {
      this.collectExpr(returnNode.value, scope, moduleName);
    }
  }
  collectDeferStmt(deferNode, scope, moduleName) {
    if (deferNode.value) {
      this.collectExpr(deferNode.value, scope, moduleName);
    }
  }
  collectThrowStmt(throwNode, scope, moduleName) {
    if (throwNode.value) {
      this.collectExpr(throwNode.value, scope, moduleName);
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── [4] EXPR Level ───────────────────────────┐
  createExprScope(parentScope) {
    const exprScope = this.config.services.scopeManager.createScope("Expression" /* Expression */, "expr", parentScope.id);
    this.incrementScopesCreated();
    return exprScope;
  }
  collectExpr(expr, currentScope, moduleName) {
    let needsScope = false;
    switch (expr.kind) {
      case "If":
      case "Switch":
      case "Try":
      case "Catch":
        needsScope = true;
        break;
    }
    if (needsScope) {
      const exprScope = this.createExprScope(currentScope);
      this.config.services.scopeManager.withScope(exprScope.id, () => {
        this.config.services.contextTracker.withSavedState(() => {
          this.config.services.contextTracker.setScope(exprScope.id);
          this.processExprKind(expr, exprScope, moduleName);
        });
      });
    } else {
      this.processExprKind(expr, currentScope, moduleName);
    }
  }
  processExprKind(expr, scope, moduleName) {
    switch (expr.kind) {
      case "As":
        this.handleAsExpr(expr.getAs(), scope, moduleName);
        break;
      case "Typeof":
        return this.processExprKind(expr.getTypeof().expr, scope, moduleName);
      case "Sizeof":
        return this.processExprKind(expr.getSizeof().expr, scope, moduleName);
      case "Orelse":
        this.handleOrelseExpr(expr.getOrelse(), scope, moduleName);
        break;
      case "Range":
        this.handleRangeExpr(expr.getRange(), scope, moduleName);
        break;
      case "Try":
        this.handleTryExpr(expr.getTry(), scope, moduleName);
        break;
      case "Catch":
        this.handleCatchExpr(expr.getCatch(), scope, moduleName);
        break;
      case "If":
        this.handleIfExpr(expr.getIf(), scope, moduleName);
        break;
      case "Switch":
        this.handleSwitchExpr(expr.getSwitch(), scope, moduleName);
        break;
      case "Binary":
        this.handleBinaryExpr(expr.getBinary(), scope, moduleName);
        break;
      case "Postfix":
        this.handlePostfixExpr(expr.getPostfix(), scope, moduleName);
        break;
      case "Prefix":
        this.handlePrefixExpr(expr.getPrefix(), scope, moduleName);
        break;
      case "Primary":
        this.handlePrimaryExpr(expr.getPrimary(), scope, moduleName);
        break;
    }
  }
  handleAsExpr(asExpr, scope, moduleName) {
    this.collectType(asExpr.type, scope, moduleName);
    this.collectExpr(asExpr.base, scope, moduleName);
  }
  handleOrelseExpr(orelseExpr, scope, moduleName) {
    this.collectExpr(orelseExpr.left, scope, moduleName);
    this.collectExpr(orelseExpr.right, scope, moduleName);
  }
  handleRangeExpr(rangeExpr, scope, moduleName) {
    if (rangeExpr.leftExpr) this.collectExpr(rangeExpr.leftExpr, scope, moduleName);
    if (rangeExpr.rightExpr) this.collectExpr(rangeExpr.rightExpr, scope, moduleName);
  }
  handleTryExpr(tryExpr, scope, moduleName) {
    this.collectExpr(tryExpr.expr, scope, moduleName);
  }
  handleCatchExpr(catchExpr, scope, moduleName) {
    this.collectExpr(catchExpr.leftExpr, scope, moduleName);
    this.collectStmt(catchExpr.rightStmt, scope, moduleName);
  }
  handleIfExpr(ifExpr, scope, moduleName) {
    this.collectExpr(ifExpr.condExpr, scope, moduleName);
    this.collectStmt(ifExpr.thenStmt, scope, moduleName);
    if (ifExpr.elseStmt) {
      this.collectStmt(ifExpr.elseStmt, scope, moduleName);
    }
  }
  handleSwitchExpr(switchExpr, scope, moduleName) {
    this.collectExpr(switchExpr.condExpr, scope, moduleName);
    for (const switchCase of switchExpr.cases) {
      if (switchCase.expr) this.collectExpr(switchCase.expr, scope, moduleName);
      if (switchCase.stmt) this.collectStmt(switchCase.stmt, scope, moduleName);
    }
    if (switchExpr.defCase) {
      this.collectStmt(switchExpr.defCase.stmt, scope, moduleName);
    }
  }
  handleBinaryExpr(binaryExpr, scope, moduleName) {
    this.collectExpr(binaryExpr.left, scope, moduleName);
    this.collectExpr(binaryExpr.right, scope, moduleName);
  }
  handlePostfixExpr(postfixExpr, scope, moduleName) {
    switch (postfixExpr.kind) {
      case "Increment":
      case "Decrement":
      case "Dereference":
        this.collectExpr(postfixExpr.getAsExprNode(), scope, moduleName);
        break;
      case "Call": {
        const callExpr = postfixExpr.getCall();
        this.collectExpr(callExpr.base, scope, moduleName);
        for (const arg of callExpr.args) {
          this.collectExpr(arg, scope, moduleName);
        }
        break;
      }
      case "ArrayAccess": {
        const arrayAccess = postfixExpr.getArrayAccess();
        this.collectExpr(arrayAccess.base, scope, moduleName);
        this.collectExpr(arrayAccess.index, scope, moduleName);
        break;
      }
      case "MemberAccess": {
        const memberAccess = postfixExpr.getMemberAccess();
        this.collectExpr(memberAccess.base, scope, moduleName);
        break;
      }
    }
  }
  handlePrefixExpr(prefixExpr, scope, moduleName) {
    this.collectExpr(prefixExpr.expr, scope, moduleName);
  }
  handlePrimaryExpr(primaryExpr, scope, moduleName) {
    switch (primaryExpr.kind) {
      case "Ident": {
        const ident = primaryExpr.getIdent();
        if (ident && ident.name === "self") {
          this.validateSelfUsage(scope, ident.span);
        }
        break;
      }
      case "Literal":
        break;
      case "Type": {
        const type = primaryExpr.getType();
        this.collectType(type, scope, moduleName);
        break;
      }
      case "Paren": {
        const paren = primaryExpr.getParen();
        this.collectExpr(paren.source, scope, moduleName);
        break;
      }
      case "Tuple": {
        const tuple = primaryExpr.getTuple();
        for (const expr of tuple.fields) {
          this.collectExpr(expr, scope, moduleName);
        }
        break;
      }
      case "Object": {
        const object = primaryExpr.getObject();
        if (object.ident) {
          this.collectExpr(
            AST2.ExprNode.asIdent(object.ident.span, object.ident.name),
            scope,
            moduleName
          );
        }
        for (const field of object.props) {
          if (field.val) this.collectExpr(field.val, scope, moduleName);
        }
        break;
      }
    }
  }
  validateSelfUsage(currentScope, span) {
    var _a, _b;
    let checkScope = currentScope;
    let isInStaticMethod = false;
    let structScope = null;
    while (checkScope) {
      if (checkScope.kind === "Function" /* Function */) {
        const parentScope = checkScope.parent !== null ? this.config.services.scopeManager.getScope(checkScope.parent) : null;
        if ((parentScope == null ? void 0 : parentScope.kind) === "Type" /* Type */ && ((_a = parentScope.metadata) == null ? void 0 : _a.typeKind) === "Struct") {
          structScope = parentScope;
          const funcSymbol = parentScope.symbols.get(checkScope.name);
          if (funcSymbol && funcSymbol.visibility.kind === "Static") {
            isInStaticMethod = true;
          }
          break;
        }
      }
      checkScope = checkScope.parent !== null ? this.config.services.scopeManager.getScope(checkScope.parent) : null;
    }
    if (isInStaticMethod && structScope) {
      return;
    }
    const selfSymbol = this.config.services.scopeManager.lookupSymbolInScopeChain("self", currentScope.id);
    if (!selfSymbol || !((_b = selfSymbol.metadata) == null ? void 0 : _b.isSelf)) {
      this.reportError(
        "UNDEFINED_IDENTIFIER" /* UNDEFINED_IDENTIFIER */,
        "self can only be used in instance methods",
        span
      );
      return;
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── [5] Type Level ───────────────────────────┐
  createTypeScope(typeName, parentScope, typeKind) {
    const typeScope = this.config.services.scopeManager.createScope("Type" /* Type */, typeName, parentScope.id);
    if (typeKind) {
      typeScope.metadata = __spreadProps(__spreadValues({}, typeScope.metadata), {
        typeKind
      });
    }
    this.incrementScopesCreated();
    return typeScope;
  }
  collectType(type, parentScope, moduleName, newScopeName) {
    if (!type) return;
    this.withTypeContext(type, newScopeName, () => {
      this.collectTypeInternal(type, parentScope, moduleName, newScopeName);
    });
  }
  collectTypeInternal(type, parentScope, moduleName, newScopeName) {
    let needsScope = false;
    let typeName = "Anonymous";
    let typeScope = parentScope;
    switch (type.kind) {
      case "struct":
        needsScope = true;
        if (newScopeName) {
          typeName = newScopeName;
        } else {
          const anonId = this.config.services.scopeManager.symbolIdGenerator.next();
          typeName = `<anonymous-struct-${anonId}>`;
        }
        break;
      case "enum":
        needsScope = true;
        if (newScopeName) {
          typeName = newScopeName;
        } else {
          const anonId = this.config.services.scopeManager.symbolIdGenerator.next();
          typeName = `<anonymous-enum-${anonId}>`;
        }
        break;
      case "errset":
        needsScope = true;
        typeName = newScopeName || "<anonymous-error>";
        break;
    }
    if (needsScope) {
      typeScope = this.createTypeScope(typeName, parentScope);
      switch (type.kind) {
        case "struct":
          typeScope.metadata = __spreadProps(__spreadValues({}, typeScope.metadata), { typeKind: "Struct" });
          break;
        case "enum":
          typeScope.metadata = __spreadProps(__spreadValues({}, typeScope.metadata), { typeKind: "Enum" });
          break;
        case "errset":
          typeScope.metadata = __spreadProps(__spreadValues({}, typeScope.metadata), { typeKind: "Error" });
          break;
      }
      if (!this.config.services.scopeManager.getScope(typeScope.id)) {
        throw new Error(`Invalid scope ID ${typeScope.id} for type ${typeName}`);
      }
    }
    try {
      switch (type.kind) {
        case "struct":
          this.handleStructType(type.getStruct(), typeScope, moduleName);
          break;
        case "enum":
          this.handleEnumType(type.getEnum(), typeScope, moduleName);
          break;
        case "errset":
          this.collectErrorType(type.getErrset(), typeScope, moduleName);
          break;
        case "tuple":
          this.handleTupleType(type.getTuple(), parentScope, moduleName);
          break;
        case "array":
          this.handleArrayType(type.getArray(), parentScope, moduleName);
          break;
        case "optional":
          this.handleOptionalType(type.getOptional(), parentScope, moduleName);
          break;
        case "pointer":
          this.handlePointerType(type.getPointer(), parentScope, moduleName);
          break;
        case "function":
          this.handleFunctionType(type.getFunction(), parentScope, moduleName);
          break;
        case "union":
          this.handleUnionType(type.getUnion(), parentScope, moduleName);
          break;
        case "paren":
          this.collectTypeInternal(type.getParen().type, parentScope, moduleName);
      }
    } catch (error) {
      this.reportError(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        `Failed to collect type ${type.kind}: ${error}`
      );
    }
  }
  handleStructType(structType, typeScope, moduleName) {
    structType.metadata = __spreadProps(__spreadValues({}, structType.metadata), { scopeId: typeScope.id });
    typeScope.metadata = __spreadProps(__spreadValues({}, typeScope.metadata), {
      typeKind: "Struct"
      // This line exists but might not be executing
    });
    for (const member of structType.members) {
      if (!member || !member.kind || !member.source) {
        continue;
      }
      if (member.isField()) {
        this.collectStructField(member.source, typeScope, moduleName);
      } else {
        this.collectFuncStmt(member.source, typeScope, moduleName);
      }
    }
  }
  handleEnumType(enumType, typeScope, moduleName) {
    enumType.metadata = __spreadProps(__spreadValues({}, enumType.metadata), { scopeId: typeScope.id });
    for (const variant of enumType.variants) {
      if (typeScope.symbols.has(variant.ident.name)) {
        this.reportError(
          "ENUM_VARIANT_SHADOWING" /* ENUM_VARIANT_SHADOWING */,
          `Duplicate enum variant '${variant.ident.name}'`,
          variant.ident.span
        );
        continue;
      }
      if (variant.type) {
        const variantScope = this.createTypeScope(variant.ident.name, typeScope);
        if (variant.type.isStruct()) {
          const structType = variant.type.getStruct();
          structType.metadata = __spreadProps(__spreadValues({}, structType.metadata), {
            scopeId: variantScope.id
          });
          this.config.services.scopeManager.withScope(variantScope.id, () => {
            this.config.services.contextTracker.withSavedState(() => {
              this.config.services.contextTracker.setScope(variantScope.id);
              this.collectType(variant.type, variantScope, moduleName, variant.ident.name);
            });
          });
        } else {
          this.collectType(variant.type, typeScope, moduleName);
        }
      } else {
        this.collectEnumVariantIdent(variant.ident, typeScope, moduleName);
      }
    }
  }
  handleTupleType(tupleType, parentScope, moduleName) {
    for (const field of tupleType.fields) {
      this.collectType(field, parentScope, moduleName);
    }
  }
  handleArrayType(arrayType, parentScope, moduleName) {
    this.collectType(arrayType.target, parentScope, moduleName);
    if (arrayType.size) this.collectExpr(arrayType.size, parentScope, moduleName);
  }
  handleOptionalType(optionalType, parentScope, moduleName) {
    this.collectType(optionalType.target, parentScope, moduleName);
  }
  handlePointerType(pointerType, parentScope, moduleName) {
    this.collectType(pointerType.target, parentScope, moduleName);
  }
  handleFunctionType(funcType, parentScope, moduleName) {
    for (const param of funcType.params) {
      if (param) {
        this.collectType(param, parentScope, moduleName);
      }
    }
    if (funcType.returnType) {
      this.collectType(funcType.returnType, parentScope, moduleName);
    }
    if (funcType.errorType) {
      this.collectType(funcType.errorType, parentScope, moduleName);
    }
  }
  handleUnionType(unionType, parentScope, moduleName) {
    for (const variant of unionType.types) {
      this.collectType(variant, parentScope, moduleName);
    }
  }
  collectStructField(fieldNode, scope, moduleName) {
    this.log("symbols", `Collecting structure field '${fieldNode.ident.name}'`);
    if (fieldNode.visibility.kind === "Static") {
      if (fieldNode.mutability.kind === "Mutable") {
        this.reportError(
          "INVALID_VISIBILITY" /* INVALID_VISIBILITY */,
          `Static field '${fieldNode.ident.name}' cannot be mutable. Static fields must be immutable.`,
          fieldNode.span
        );
        fieldNode.mutability = { kind: "Immutable" };
      }
    }
    if (this.checkForShadowing(fieldNode.ident.name, scope, "StructField" /* StructField */, fieldNode.ident.span, false)) {
      return;
    }
    const symbol = this.createStructFieldSymbol(fieldNode, scope, moduleName);
    this.config.services.scopeManager.addSymbolToScope(symbol, scope.id);
    this.incrementSymbolsCollected();
    if (fieldNode.type) {
      this.collectType(fieldNode.type, scope, moduleName);
    }
    if (fieldNode.initializer) {
      this.collectExpr(fieldNode.initializer, scope, moduleName);
    }
  }
  createStructFieldSymbol(fieldNode, scope, moduleName) {
    var _a, _b;
    const symbol = this.createBaseSymbol(
      fieldNode.ident.name,
      "StructField" /* StructField */,
      scope,
      moduleName,
      fieldNode.span,
      fieldNode.ident.span
    );
    return __spreadProps(__spreadValues({}, symbol), {
      type: (_a = fieldNode.type) != null ? _a : null,
      initialized: !!fieldNode.initializer,
      visibility: (_b = fieldNode.visibility) != null ? _b : "Private",
      mutability: fieldNode.mutability
      // Added
    });
  }
  collectEnumVariantIdent(identNode, scope, moduleName) {
    const symbol = this.createEnumVariantSymbol(identNode, scope, moduleName);
    this.config.services.scopeManager.addSymbolToScope(symbol, scope.id);
    this.incrementSymbolsCollected();
  }
  createEnumVariantSymbol(identNode, scope, moduleName) {
    return this.createBaseSymbol(
      identNode.name,
      "EnumVariant" /* EnumVariant */,
      scope,
      moduleName,
      identNode.span,
      identNode.span
    );
  }
  collectErrorType(errorType, scope, moduleName) {
    if (errorType.members.length === 0) return;
    const seenErrors = /* @__PURE__ */ new Set();
    for (const error of errorType.members) {
      if (seenErrors.has(error.name)) {
        this.reportError(
          "ERROR_SHADOWING" /* ERROR_SHADOWING */,
          `Duplicate error member '${error.name}'`,
          error.span
        );
        continue;
      }
      seenErrors.add(error.name);
      const symbol = this.createErrorSymbol(error, scope, moduleName);
      this.config.services.scopeManager.addSymbolToScope(symbol, scope.id);
      this.incrementSymbolsCollected();
    }
  }
  createErrorSymbol(identNode, scope, moduleName) {
    return this.createBaseSymbol(
      identNode.name,
      "Error" /* Error */,
      scope,
      moduleName,
      identNode.span,
      identNode.span
    );
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── [x] VALIDATION ───────────────────────────┐
  checkForShadowing(newSymbolName, currentScope, newSymbolKind, span, outer = false) {
    var _a;
    if (newSymbolName === "self") {
      const existingSymbol2 = outer ? this.config.services.scopeManager.lookupSymbolInParentScopes("self", currentScope.id) : currentScope.symbols.get("self") || this.config.services.scopeManager.lookupSymbolInParentScopes("self", currentScope.id);
      if (existingSymbol2 && ((_a = existingSymbol2.metadata) == null ? void 0 : _a.isSelf)) {
        this.reportError(
          newSymbolKind === "Parameter" /* Parameter */ ? "PARAMETER_SHADOWING" /* PARAMETER_SHADOWING */ : "VARIABLE_SHADOWING" /* VARIABLE_SHADOWING */,
          newSymbolKind === "Parameter" /* Parameter */ ? `Duplicate parameter name 'self'` : `Symbol 'self' shadows parameter 'self' in ${outer ? "outer" : "same"} scope`,
          span
        );
        return true;
      }
    }
    if (newSymbolName.startsWith("@")) {
      this.reportError(
        "DUPLICATE_SYMBOL" /* DUPLICATE_SYMBOL */,
        `Cannot shadow built-in symbol '${newSymbolName}'`,
        span
      );
      return true;
    }
    const existingSymbol = outer ? this.config.services.scopeManager.lookupSymbolInParentScopes(newSymbolName, currentScope.id) : currentScope.symbols.get(newSymbolName);
    if (existingSymbol) {
      const isInTypeScope = currentScope.kind === "Type" /* Type */;
      const existingIsInTypeScope = this.config.services.scopeManager.getScope(existingSymbol.scope).kind === "Type" /* Type */;
      if (isInTypeScope !== existingIsInTypeScope && outer) {
        this.log(
          "verbose",
          `Symbol '${newSymbolName}' in type scope doesn't shadow module-level symbol (different namespaces)`
        );
        return false;
      }
      let diagnosticCode;
      let severity = "error" /* ERROR */;
      switch (newSymbolKind) {
        case "Use" /* Use */:
          diagnosticCode = "USE_SHADOWING" /* USE_SHADOWING */;
          break;
        case "Definition" /* Definition */:
          diagnosticCode = "DEFINITION_SHADOWING" /* DEFINITION_SHADOWING */;
          break;
        case "Variable" /* Variable */:
          diagnosticCode = "VARIABLE_SHADOWING" /* VARIABLE_SHADOWING */;
          if (outer) severity = "warning" /* WARNING */;
          break;
        case "Function" /* Function */:
          diagnosticCode = "FUNCTION_SHADOWING" /* FUNCTION_SHADOWING */;
          if (outer) severity = "warning" /* WARNING */;
          break;
        case "Parameter" /* Parameter */:
          diagnosticCode = "PARAMETER_SHADOWING" /* PARAMETER_SHADOWING */;
          if (outer) severity = "warning" /* WARNING */;
          break;
        case "StructField" /* StructField */:
          diagnosticCode = "STRUCT_FIELD_SHADOWING" /* STRUCT_FIELD_SHADOWING */;
          break;
        case "EnumVariant" /* EnumVariant */:
          diagnosticCode = "ENUM_VARIANT_SHADOWING" /* ENUM_VARIANT_SHADOWING */;
          break;
        case "Error" /* Error */:
          diagnosticCode = "ERROR_SHADOWING" /* ERROR_SHADOWING */;
          break;
        default:
          return false;
      }
      const message = `Symbol '${newSymbolName}' shadows ${existingSymbol.kind.toLowerCase()} '${existingSymbol.name}' in ${outer ? "outer" : "same"} scope`;
      if (severity === "warning" /* WARNING */) {
        this.reportWarning(diagnosticCode, message, span);
      } else {
        this.reportError(diagnosticCode, message, span);
      }
      return severity === "error" /* ERROR */ ? !outer : false;
    }
    return false;
  }
  checkTypeCycle(type, scopeName) {
    const typeKey = this.createTypeKey(type, scopeName);
    if (this.typeContext.visitedTypes.has(typeKey)) {
      this.log("verbose", `Cycle detected in type: ${typeKey}`);
      this.log("verbose", `Type path: ${this.typeContext.currentTypePath.join(" -> ")}`);
      this.reportWarning(
        "TYPE_CYCLE_DETECTE" /* TYPE_CYCLE_DETECTED */,
        `Circular type reference detected for ${type.kind} (this is OK for pointer types)`,
        type.span
      );
      this.log("verbose", `Valid pointer cycle: ${typeKey}`);
      return false;
    }
    if (this.typeContext.nestingDepth > this.typeContext.maxNestingDepth) {
      this.typeContext.maxNestingDepth = this.typeContext.nestingDepth;
    }
    if (this.typeContext.nestingDepth > 100) {
      this.reportError(
        "TYPE_NESTING_TOO_DEEP" /* TYPE_NESTING_TOO_DEEP */,
        // `Type nesting exceeds safety limit (${this.typeContext.nestingDepth} levels) - possible infinite recursion`,
        `Type nesting exceeds safety limit`,
        type.span
      );
      return true;
    }
    return false;
  }
  withTypeContext(type, scopeName, operation) {
    const typeKey = this.createTypeKey(type, scopeName);
    if (this.checkTypeCycle(type, scopeName)) {
      return;
    }
    this.typeContext.visitedTypes.add(typeKey);
    this.typeContext.currentTypePath.push(typeKey);
    this.typeContext.nestingDepth++;
    try {
      operation();
    } finally {
      this.typeContext.visitedTypes.delete(typeKey);
      this.typeContext.currentTypePath.pop();
      this.typeContext.nestingDepth--;
    }
  }
  validateSymbolExistsInModule(module, symbolName) {
    for (const stmt of module.statements) {
      if (stmt.kind === "Let") {
        const varNode = stmt.getLet();
        if (varNode && varNode.field.ident.name === symbolName) {
          return true;
        }
      } else if (stmt.kind === "Func") {
        const funcNode = stmt.getFunc();
        if (funcNode && funcNode.ident.name === symbolName) {
          return true;
        }
      } else if (stmt.kind === "Def") {
        const defNode = stmt.getDef();
        if (defNode && defNode.ident.name === symbolName) {
          return true;
        }
      }
    }
    return false;
  }
  validateMemberPathInModule(module, memberPath, useNode) {
    if (!memberPath) {
      return true;
    }
    if (memberPath.length === 0) return false;
    if (memberPath.length === 1) {
      return this.validateSymbolExistsInModule(module, memberPath[0].name);
    }
    let currentSymbolName = memberPath[0].name;
    if (!this.validateSymbolExistsInModule(module, currentSymbolName)) {
      this.reportError(
        "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
        `Symbol '${currentSymbolName}' not found in module`,
        memberPath[0].span
      );
      return false;
    }
    this.log(
      "verbose",
      `Member path ${memberPath.map((m) => m.name).join(".")} found in module (full validation deferred to type checking)`
    );
    return true;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  init() {
    var _a;
    this.pathContext.rootPath = (_a = this.config.program.metadata) == null ? void 0 : _a.path;
    this.config.services.contextTracker.reset();
    this.config.services.contextTracker.setPhase("Collection" /* Collection */);
    if (!this.config.program) {
      this.reportError("ANALYSIS_ERROR" /* ANALYSIS_ERROR */, "No program provided for analysis");
      return false;
    }
    try {
      this.config.services.scopeManager.reset();
      const globalScope = this.config.services.scopeManager.getCurrentScope();
      if (globalScope.kind !== "Global" /* Global */) {
        this.reportError("INTERNAL_ERROR" /* INTERNAL_ERROR */, "Current scope is not global at the start of symbol collection");
        return false;
      }
      this.incrementScopesCreated();
    } catch (error) {
      this.reportError("INTERNAL_ERROR" /* INTERNAL_ERROR */, `Failed to initialize scope manager: ${error}`);
      return false;
    }
    return true;
  }
  initStats() {
    return {
      modulesProcessed: 0,
      symbolsCollected: 0,
      importResolutionFailures: 0,
      scopesCreated: 0,
      syntheticSymbolsInjected: 0,
      startTime: Date.now()
    };
  }
  initTypeContext() {
    return {
      visitedTypes: /* @__PURE__ */ new Set(),
      currentTypePath: [],
      nestingDepth: 0,
      maxNestingDepth: 0
    };
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  createTypeKey(type, scopeName) {
    const baseKey = `${type.kind}:${type.span.start}:${type.span.end}`;
    return scopeName ? `${baseKey}:${scopeName}` : baseKey;
  }
  createBaseSymbol(name, kind, scope, moduleName, contextSpan, targetSpan) {
    return {
      id: this.config.services.scopeManager.symbolIdGenerator.next(),
      name,
      kind,
      module: moduleName,
      scope: scope.id,
      contextSpan,
      targetSpan,
      type: null,
      declared: true,
      initialized: false,
      used: false,
      visibility: { kind: "Private" },
      mutability: { kind: "Immutable" },
      isTypeChecked: false,
      isExported: false
    };
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  incrementSymbolsCollected() {
    this.stats.symbolsCollected++;
  }
  incrementScopesCreated() {
    this.stats.scopesCreated++;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  trackModuleExport(moduleName, symbolName, isExported) {
    if (!isExported) return;
    if (!this.moduleExports.has(moduleName)) {
      this.moduleExports.set(moduleName, /* @__PURE__ */ new Set());
    }
    this.moduleExports.get(moduleName).add(symbolName);
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  logStatistics() {
    const duration = Date.now() - this.stats.startTime;
    const stats = [
      `Collection Statistics:`,
      `  Duration             : ${duration}ms`,
      `  Modules processed    : ${this.stats.modulesProcessed}`,
      `  Symbols collected    : ${this.stats.symbolsCollected}`,
      `  Scopes created       : ${this.stats.scopesCreated}`,
      `  Import failures      : ${this.stats.importResolutionFailures}`,
      `  Max type nesting     : ${this.typeContext.maxNestingDepth}`
    ];
    this.log("verbose", stats.join("\n"));
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  getTypeRegistry() {
    return new Map(this.typeRegistry);
  }
  getModuleExports(moduleName) {
    return this.moduleExports.get(moduleName);
  }
  canImportSymbol(moduleName, symbolName) {
    const exports = this.moduleExports.get(moduleName);
    return exports ? exports.has(symbolName) : false;
  }
  // └──────────────────────────────────────────────────────────────────────┘
};

// lib/phases/SymbolResolver.ts
import * as AST3 from "@je-es/ast";
var SymbolResolver = class extends PhaseBase {
  constructor(config) {
    super("Resolution" /* Resolution */, config);
    // ┌──────────────────────────────── INIT ────────────────────────────────┐
    this.stats = this.initStats();
    this.resolutionCtx = this.initResolutionContext();
    this.currentIsStaticMethod = false;
    this.currentStructScope = null;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── MAIN ────────────────────────────────┐
  handle() {
    try {
      this.log("verbose", "Starting symbol resolution phase...");
      this.stats.startTime = Date.now();
      if (!this.init()) return false;
      if (!this.resolveAllModules()) return false;
      this.logStatistics();
      return !this.config.services.diagnosticManager.hasErrors();
    } catch (error) {
      this.log("errors", `Fatal error during symbol resolution: ${error}`);
      this.reportError("INTERNAL_ERROR" /* INTERNAL_ERROR */, `Fatal error during symbol resolution: ${error}`);
      return false;
    }
  }
  reset() {
    this.stats = this.initStats();
    this.resolutionCtx = this.initResolutionContext();
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌────────────────────────── [1] Program Level ─────────────────────────┐
  resolveAllModules() {
    this.log("verbose", "Resolving symbols from all modules...");
    const globalScope = this.config.services.scopeManager.getCurrentScope();
    for (const [moduleName, module] of this.config.program.modules) {
      this.config.services.contextTracker.pushContextSpan({ start: 0, end: 0 });
      try {
        if (!this.resolveModule(moduleName, module, globalScope)) {
          this.log("errors", `Failed to resolve module ${moduleName}, continuing...`);
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
  resolveModule(moduleName, module, parentScope) {
    var _a;
    this.log("symbols", `Resolving module '${moduleName}'`);
    try {
      this.config.services.contextTracker.setModuleName(moduleName);
      if (typeof ((_a = module.metadata) == null ? void 0 : _a.path) === "string") {
        this.config.services.contextTracker.setModulePath(module.metadata.path);
      }
      this.enterModuleContext(moduleName, module);
      const moduleScope = this.findModuleScope(moduleName);
      if (!moduleScope) {
        this.reportError("MODULE_SCOPE_NOT_FOUND" /* MODULE_SCOPE_NOT_FOUND */, `Module scope for '${moduleName}' not found`);
        return false;
      }
      this.config.services.scopeManager.setCurrentScope(moduleScope.id);
      this.config.services.contextTracker.setScope(moduleScope.id);
      ;
      this.resetDeclaredFlags(moduleScope);
      for (const statement of module.statements) {
        this.resolveStmt(statement, moduleScope, moduleName);
      }
      this.exitModuleContext();
      return true;
    } catch (error) {
      this.reportError("INTERNAL_ERROR" /* INTERNAL_ERROR */, `Failed to resolve module '${moduleName}': ${error}`);
      return false;
    }
  }
  resetDeclaredFlags(scope) {
    for (const [_, symbol] of scope.symbols) {
      if (symbol.kind !== "Use" /* Use */ && symbol.kind !== "Parameter" /* Parameter */) {
        symbol.declared = false;
      }
    }
    const childScopes = this.config.services.scopeManager.getAllScopes().filter((s) => s.parent === scope.id);
    for (const childScope of childScopes) {
      this.resetDeclaredFlags(childScope);
    }
  }
  enterModuleContext(moduleName, module) {
    var _a;
    this.resolutionCtx.moduleStack.push(this.resolutionCtx.currentModule);
    this.resolutionCtx.currentModule = moduleName;
    this.config.services.contextTracker.setModuleName(moduleName);
    if (typeof ((_a = module.metadata) == null ? void 0 : _a.path) === "string") {
      this.config.services.contextTracker.setModulePath(module.metadata.path);
    }
  }
  exitModuleContext() {
    const previousModule = this.resolutionCtx.moduleStack.pop();
    this.resolutionCtx.currentModule = previousModule || "";
  }
  findModuleScope(moduleName) {
    const moduleScope = this.config.services.scopeManager.findScopeByName(moduleName, "Module" /* Module */);
    if (!moduleScope) {
      this.reportError("MODULE_SCOPE_NOT_FOUND" /* MODULE_SCOPE_NOT_FOUND */, `Module scope for '${moduleName}' not found`);
    }
    return moduleScope;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── [3] Stmt Level ───────────────────────────┐
  resolveStmt(stmt, currentScope, moduleName) {
    if (!stmt) {
      this.reportError("ANALYSIS_ERROR" /* ANALYSIS_ERROR */, "Found null statement during resolution");
      return;
    }
    this.log("verbose", `Resolving ${stmt.kind} statement`);
    this.config.services.contextTracker.pushContextSpan(stmt.span);
    try {
      this.config.services.scopeManager.withScope(currentScope.id, () => {
        this.config.services.contextTracker.withSavedState(() => {
          this.config.services.contextTracker.setScope(currentScope.id);
          this.processStmtByKind(stmt, {
            "Block": (blockNode) => this.handleBlockStmt(blockNode, currentScope, moduleName),
            "Test": (testNode) => this.handleTestStmt(testNode, currentScope, moduleName),
            "Use": (useNode) => this.handleUseStmt(useNode, currentScope, moduleName),
            "Def": (defNode) => this.handleDefStmt(defNode, currentScope, moduleName),
            "Let": (letNode) => this.handleLetStmt(letNode, currentScope, moduleName),
            "Func": (funcNode) => this.handleFuncStmt(funcNode, currentScope, moduleName),
            "Expression": (exprNode) => this.resolveExprStmt(exprNode),
            // special cases
            "While": () => this.handleLoopStmt(stmt, currentScope, moduleName),
            "Do": () => this.handleLoopStmt(stmt, currentScope, moduleName),
            "For": () => this.handleLoopStmt(stmt, currentScope, moduleName),
            "Return": () => this.handleControlflowStmt(stmt, currentScope, moduleName),
            "Defer": () => this.handleControlflowStmt(stmt, currentScope, moduleName),
            "Throw": () => this.handleControlflowStmt(stmt, currentScope, moduleName)
          });
        });
      });
    } catch (error) {
      this.reportError(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        `Failed to resolve ${stmt.kind} statement: ${error}`,
        stmt.span
      );
    } finally {
      this.config.services.contextTracker.popContextSpan();
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────── [3.1] BLOCK ─────────────────────────────┐
  handleBlockStmt(blockNode, scope, moduleName) {
    this.resolveBlockStmt(blockNode);
  }
  resolveBlockStmt(block) {
    this.log("symbols", "Resolving block");
    const blockScope = this.config.services.scopeManager.findChildScopeByName("block", "Block" /* Block */);
    if (blockScope) {
      this.config.services.contextTracker.withSavedState(() => {
        this.config.services.contextTracker.setScope(blockScope.id);
        this.config.services.scopeManager.withScope(blockScope.id, () => {
          for (const stmt of block.stmts) {
            this.resolveStmt(stmt, blockScope);
          }
        });
      });
    }
  }
  handleTestStmt(testNode, scope, moduleName) {
    this.resolveBlockStmt(testNode.block);
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────────── [3.2] USE ──────────────────────────────┐
  handleUseStmt(useNode, scope, moduleName) {
    this.resolveUseStmt(useNode);
  }
  resolveUseStmt(useNode) {
    this.log("symbols", "Resolving use statement");
    this.config.services.contextTracker.pushContextSpan(useNode.span);
    try {
      if (useNode.path) {
        this.resolveModuleImport(useNode);
      } else {
        this.resolveLocalUse(useNode);
      }
      this.stats.importResolutions++;
    } catch (error) {
      this.reportError("ANALYSIS_ERROR" /* ANALYSIS_ERROR */, `Failed to resolve use statement: ${error}`, useNode.span);
    } finally {
      this.config.services.contextTracker.popContextSpan();
    }
  }
  resolveModuleImport(useNode) {
    var _a;
    if (!this.config.program || !useNode.path) {
      this.reportError("MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */, "Invalid import: missing path", useNode.span);
      return;
    }
    const currentModule = this.config.program.modules.get(this.resolutionCtx.currentModule);
    const currentModulePath = (_a = currentModule == null ? void 0 : currentModule.metadata) == null ? void 0 : _a.path;
    if (!useNode.targetArr) {
      if (!useNode.alias) {
        this.reportError(
          "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
          `Wildcard import requires an alias`,
          useNode.span
        );
        return;
      }
      const symbolName2 = useNode.alias.name;
      const existingSymbol2 = this.config.services.scopeManager.getSymbolInCurrentScope(symbolName2);
      if (!existingSymbol2 || existingSymbol2.kind !== "Use" /* Use */) {
        return;
      }
      if (!PathUtils.validatePath(this.config.program, useNode.path, currentModulePath)) {
        return;
      }
      const resolvedPath2 = PathUtils.resolveModulePath(this.config.program, useNode.path, currentModulePath);
      const targetModuleName2 = PathUtils.findModuleNameByPath(this.config.program, resolvedPath2);
      if (!targetModuleName2) {
        this.reportError("MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */, `Could not resolve module name for path: ${useNode.path}`, useNode.span);
        return;
      }
      const targetModuleScope2 = this.findModuleScope(targetModuleName2);
      if (!targetModuleScope2) {
        this.reportError("MODULE_SCOPE_NOT_FOUND" /* MODULE_SCOPE_NOT_FOUND */, `Could not find scope for module: ${targetModuleName2}`, useNode.span);
        return;
      }
      existingSymbol2.declared = true;
      existingSymbol2.type = AST3.TypeNode.asIdentifier(useNode.span, targetModuleName2);
      this.log("verbose", `Resolved wildcard import from '${targetModuleName2}' as '${symbolName2}'`);
      return;
    }
    const symbolName = useNode.alias ? useNode.alias.name : useNode.targetArr[useNode.targetArr.length - 1].name;
    const existingSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(symbolName);
    if (!existingSymbol || existingSymbol.kind !== "Use" /* Use */) {
      return;
    }
    if (!PathUtils.validatePath(this.config.program, useNode.path, currentModulePath)) {
      if (!existingSymbol.importSource) {
        this.reportError("MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */, `Module not found: ${useNode.path}`, useNode.span);
      }
      return;
    }
    const resolvedPath = PathUtils.resolveModulePath(this.config.program, useNode.path, currentModulePath);
    const targetModuleName = PathUtils.findModuleNameByPath(this.config.program, resolvedPath);
    if (!targetModuleName) {
      this.reportError("MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */, `Could not resolve module name for path: ${useNode.path}`, useNode.span);
      return;
    }
    const targetModuleScope = this.findModuleScope(targetModuleName);
    if (!targetModuleScope) {
      this.reportError("MODULE_SCOPE_NOT_FOUND" /* MODULE_SCOPE_NOT_FOUND */, `Could not find scope for module: ${targetModuleName}`, useNode.span);
      return;
    }
    this.resolveModuleWithScope(useNode, targetModuleName, targetModuleScope);
  }
  resolveModuleWithScope(useNode, targetModuleName, targetModuleScope) {
    const originalScope = this.config.services.scopeManager.getCurrentScope();
    const originalContext = this.saveModuleContext();
    try {
      this.switchToTargetModule(targetModuleName, targetModuleScope);
      const targetSymbol = this.resolveImportTarget(useNode);
      if (targetSymbol) {
        this.propagateImportType(useNode, targetSymbol, originalScope);
      }
    } finally {
      this.restoreModuleContext(originalContext, originalScope);
    }
  }
  resolveLocalUse(useNode) {
    if (!useNode.targetArr) {
      this.reportError(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        `Wildcard import only supported for module imports (use * as x from "...")`,
        useNode.span
      );
      return;
    }
    const targetName = useNode.targetArr[0].name;
    const targetSymbol = this.config.services.scopeManager.lookupSymbol(targetName);
    if (targetSymbol && !targetSymbol.declared) {
      this.reportError(
        "USED_BEFORE_DECLARED" /* USED_BEFORE_DECLARED */,
        `Symbol '${targetName}' used before declaration`,
        useNode.targetArr[0].span
      );
      return;
    }
    this.resolveExprStmt(this.identOrMemberAccess(useNode.targetArr));
    if (useNode.alias) {
      this.markAliasAsDeclared(useNode.alias);
    }
  }
  identOrMemberAccess(nodes) {
    if (nodes.length === 0) {
      throw new Error("Cannot create identifier expression from empty array");
    }
    const base = AST3.ExprNode.asIdent(nodes[0].span, nodes[0].name, nodes[0].builtin);
    if (nodes.length === 1) return base;
    return AST3.ExprNode.asMemberAccess(nodes[0].span, base, this.identOrMemberAccess(nodes.slice(1)));
  }
  saveModuleContext() {
    return {
      moduleName: this.config.services.contextTracker.getModuleName(),
      modulePath: this.config.services.contextTracker.getModulePath()
    };
  }
  switchToTargetModule(targetModule, targetModuleScope) {
    var _a, _b;
    this.config.services.scopeManager.setCurrentScope(targetModuleScope.id);
    this.config.services.contextTracker.setModuleName(targetModule);
    const targetModulePath = (_b = (_a = this.config.program.modules.get(targetModule)) == null ? void 0 : _a.metadata) == null ? void 0 : _b.path;
    if (targetModulePath) {
      this.config.services.contextTracker.setModulePath(targetModulePath);
    }
  }
  restoreModuleContext(originalContext, originalScope) {
    this.config.services.contextTracker.setModuleName(originalContext.moduleName);
    this.config.services.contextTracker.setModulePath(originalContext.modulePath);
    this.config.services.scopeManager.setCurrentScope(originalScope.id);
  }
  resolveImportTarget(useNode) {
    if (!useNode.targetArr) {
      if (!useNode.alias) {
        this.reportError(
          "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
          "Wildcard import requires an alias",
          useNode.span
        );
        return null;
      }
      const moduleSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(useNode.alias.name);
      if (moduleSymbol) {
        moduleSymbol.declared = true;
      }
      return moduleSymbol;
    }
    const targetName = useNode.targetArr[0].name;
    if (!targetName) return null;
    const targetSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(targetName);
    if (targetSymbol) {
      targetSymbol.declared = true;
      if (useNode.targetArr.length > 1) {
        let currentSymbol = targetSymbol;
        for (let i = 1; i < useNode.targetArr.length; i++) {
          const memberName = useNode.targetArr[i].name;
          if (!currentSymbol || !currentSymbol.type) {
            this.reportError(
              "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
              `Cannot resolve member path: ${useNode.targetArr.slice(0, i + 1).map((t) => t.name).join(".")}`,
              useNode.targetArr[i].span
            );
            return null;
          }
          const memberSymbol = this.resolveMemberInType(currentSymbol.type, memberName);
          if (!memberSymbol) {
            this.reportError(
              "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
              `Member '${memberName}' not found in type`,
              useNode.targetArr[i].span
            );
            return null;
          }
          currentSymbol = memberSymbol;
          currentSymbol.used = true;
        }
        return currentSymbol;
      }
      return targetSymbol;
    }
    return null;
  }
  resolveMemberInType(type, memberName) {
    var _a, _b;
    if (type.kind === "optional") {
      const optional = type.getOptional();
      return this.resolveMemberInType(optional.target, memberName);
    }
    if (type.kind === "struct") {
      const struct = type.getStruct();
      const scopeId = (_a = struct.metadata) == null ? void 0 : _a.scopeId;
      if (scopeId !== void 0) {
        const typeScope = this.config.services.scopeManager.getScope(scopeId);
        const fieldSymbol = typeScope.symbols.get(memberName);
        if (fieldSymbol && fieldSymbol.kind === "StructField" /* StructField */) {
          return fieldSymbol;
        }
        const methodSymbol = typeScope.symbols.get(memberName);
        if (methodSymbol && methodSymbol.kind === "Function" /* Function */) {
          return methodSymbol;
        }
      }
      return null;
    }
    if (type.kind === "enum") {
      const enumType = type.getEnum();
      const scopeId = (_b = enumType.metadata) == null ? void 0 : _b.scopeId;
      if (scopeId !== void 0) {
        const typeScope = this.config.services.scopeManager.getScope(scopeId);
        const variantSymbol = typeScope.symbols.get(memberName);
        if (variantSymbol && variantSymbol.kind === "EnumVariant" /* EnumVariant */) {
          return variantSymbol;
        }
      }
      return null;
    }
    if (type.kind === "ident") {
      const ident = type.getIdent();
      const typeSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
      if (typeSymbol == null ? void 0 : typeSymbol.type) {
        return this.resolveMemberInType(typeSymbol.type, memberName);
      }
    }
    return null;
  }
  propagateImportType(useNode, targetSymbol, originalScope) {
    const importName = useNode.alias ? useNode.alias.name : useNode.targetArr ? useNode.targetArr[useNode.targetArr.length - 1].name : "<invalid>";
    if (!importName || importName === "<invalid>") return;
    const importSymbol = originalScope.symbols.get(importName);
    if (importSymbol) {
      importSymbol.type = targetSymbol.type;
      importSymbol.declared = true;
    }
  }
  markAliasAsDeclared(alias) {
    const aliasSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(alias.name);
    if (aliasSymbol) {
      aliasSymbol.declared = true;
      this.config.services.contextTracker.startDeclaration(alias.name, aliasSymbol.id, "let", alias.span, this.config.services.scopeManager.getCurrentScope().id);
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────────── [3.3] DEF ──────────────────────────────┐
  handleDefStmt(defNode, scope, moduleName) {
    this.resolveDefStmt(defNode);
  }
  resolveDefStmt(defNode) {
    this.log("symbols", `Resolving definition '${defNode.ident.name}'`);
    const symbol = this.config.services.scopeManager.getSymbolInCurrentScope(defNode.ident.name);
    if (!symbol) {
      this.reportError("INTERNAL_ERROR" /* INTERNAL_ERROR */, `Definition symbol '${defNode.ident.name}' not found in current scope`, defNode.ident.span);
      return;
    }
    this.config.services.contextTracker.startDeclaration(defNode.ident.name, symbol.id, "def", defNode.span, this.config.services.scopeManager.getCurrentScope().id);
    symbol.declared = true;
    this.resolveType(defNode.type, symbol);
    this.config.services.contextTracker.completeDeclaration(symbol.id);
    this.stats.resolvedSymbols++;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────────── [3.4] LET ──────────────────────────────┐
  handleLetStmt(letNode, scope, moduleName) {
    this.resolveLetStmt(letNode);
  }
  resolveLetStmt(letNode) {
    this.log("symbols", `Resolving let '${letNode.field.ident.name}'`);
    const symbol = this.config.services.scopeManager.getSymbolInCurrentScope(letNode.field.ident.name);
    if (!symbol) {
      this.reportError("INTERNAL_ERROR" /* INTERNAL_ERROR */, `Variable symbol '${letNode.field.ident.name}' not found in current scope`, letNode.field.ident.span);
      return;
    }
    this.config.services.contextTracker.startDeclaration(letNode.field.ident.name, symbol.id, "let", letNode.field.span, this.config.services.scopeManager.getCurrentScope().id);
    if (letNode.field.initializer) {
      if (this.isConstructorExpression(letNode.field.initializer)) {
        const primary = letNode.field.initializer.getPrimary();
        const obj = primary.getObject();
        const constructorName = obj.ident.name;
        const constructorSymbol = this.config.services.scopeManager.lookupSymbol(constructorName);
        if (constructorSymbol && constructorSymbol.type) {
          const isValid = this.validateConstructorFields(obj, constructorSymbol.type);
          if (isValid) {
            symbol.type = constructorSymbol.type;
            letNode.field.type = constructorSymbol.type;
          } else {
            this.config.services.contextTracker.completeDeclaration(symbol.id);
            return;
          }
        }
      } else if (letNode.field.initializer.kind === "Primary") {
        const primary = letNode.field.initializer.getPrimary();
        if (primary && primary.kind === "Type") {
          const anonType = primary.getType();
          this.resolveType(anonType, symbol);
          symbol.type = anonType;
          letNode.field.type = anonType;
          this.stats.anonymousTypesResolved++;
        }
      }
      this.resolveVariableInitializer(letNode, symbol);
    }
    symbol.declared = true;
    if (letNode.field.type && !this.resolveType(letNode.field.type, symbol, letNode.field.span)) {
      return;
    }
    this.config.services.contextTracker.completeDeclaration(symbol.id);
    this.stats.resolvedSymbols++;
  }
  isConstructorExpression(expr) {
    if (expr.kind !== "Primary") {
      return false;
    }
    const primary = expr.getPrimary();
    if (!primary || primary.kind !== "Object") {
      return false;
    }
    const obj = primary.getObject();
    if (!obj) {
      return false;
    }
    const hasConstructorName = obj.ident !== null && obj.ident !== void 0 && typeof obj.ident.name === "string" && obj.ident.name.length > 0;
    return hasConstructorName;
  }
  validateConstructorFields(obj, type) {
    var _a;
    if (type.kind !== "struct") return true;
    const struct = type.getStruct();
    const scopeId = (_a = struct.metadata) == null ? void 0 : _a.scopeId;
    if (scopeId === void 0) {
      this.log("verbose", "Cannot validate constructor: struct has no scope");
      return true;
    }
    const typeScope = this.config.services.scopeManager.getScope(scopeId);
    const providedFields = /* @__PURE__ */ new Set();
    let hasError = false;
    for (const prop of obj.props) {
      const fieldName = prop.key.name;
      providedFields.add(fieldName);
      const fieldSymbol = typeScope.symbols.get(fieldName);
      if (!fieldSymbol || fieldSymbol.kind !== "StructField" /* StructField */) {
        this.reportError(
          "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
          `Member '${fieldName}' not found in struct`,
          prop.key.span
        );
        hasError = true;
      } else {
        if (prop.val) {
          this.resolveExprStmt(prop.val);
        }
      }
    }
    for (const [fieldName, fieldSymbol] of typeScope.symbols) {
      if (fieldSymbol.kind === "StructField" /* StructField */) {
        const isRequired = !providedFields.has(fieldName) && !fieldSymbol.initialized;
        if (isRequired) {
          this.reportError(
            "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
            `Required field '${fieldName}' not provided in constructor`,
            obj.span
          );
          hasError = true;
        }
      }
    }
    return !hasError;
  }
  resolveVariableInitializer(varNode, symbol) {
    this.config.services.contextTracker.startInitialization(symbol.id);
    this.config.services.contextTracker.enterExpression("VariableInitializer" /* VariableInitializer */, varNode.field.initializer.span, symbol.id);
    this.resolveExprStmt(varNode.field.initializer, void 0, void 0, symbol);
    this.config.services.contextTracker.exitExpression();
    return true;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────────── [3.5] FUNC ─────────────────────────────┐
  handleFuncStmt(funcNode, scope, moduleName) {
    this.resolveFuncStmt(funcNode);
  }
  resolveFuncStmt(funcNode) {
    var _a, _b;
    this.log("symbols", `Resolving function '${funcNode.ident.name}'`);
    const funcSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(funcNode.ident.name);
    if (!funcSymbol) {
      this.reportError(
        "CANNOT_INFER_TYPE" /* CANNOT_INFER_TYPE */,
        `Function '${funcNode.ident.name}' symbol not found`,
        funcNode.span
      );
      return;
    }
    const funcScope = this.config.services.scopeManager.findChildScopeByName(funcNode.ident.name, "Function" /* Function */);
    if (!funcScope) {
      this.reportError(
        "CANNOT_INFER_TYPE" /* CANNOT_INFER_TYPE */,
        `Function scope for '${funcNode.ident.name}' not found`,
        funcNode.span
      );
      return;
    }
    this.config.services.contextTracker.startDeclaration(
      funcNode.ident.name,
      funcSymbol.id,
      "fn",
      funcNode.span,
      this.config.services.scopeManager.getCurrentScope().id
    );
    funcSymbol.declared = true;
    const funcSymbolScope = this.config.services.scopeManager.getScope(funcSymbol.scope);
    const parentScope = funcSymbolScope.parent !== null ? this.config.services.scopeManager.getScope(funcSymbolScope.parent) : null;
    const isStaticMethod = (parentScope == null ? void 0 : parentScope.kind) === "Type" /* Type */ && ((_a = parentScope.metadata) == null ? void 0 : _a.typeKind) === "Struct" && funcNode.visibility.kind === "Static";
    const previousIsStaticMethod = this.currentIsStaticMethod;
    const previousStructScope = this.currentStructScope;
    this.currentIsStaticMethod = isStaticMethod;
    this.currentStructScope = isStaticMethod ? parentScope : null;
    const isStructMethod = (parentScope == null ? void 0 : parentScope.kind) === "Type" /* Type */ && ((_b = parentScope.metadata) == null ? void 0 : _b.typeKind) === "Struct" && !(funcNode.visibility.kind === "Static");
    try {
      this.config.services.contextTracker.withSavedState(() => {
        this.config.services.scopeManager.withScope(funcScope.id, () => {
          if (isStructMethod) {
            this.resolveSelfParameter(funcScope, parentScope);
          }
          this.resolveParameters(funcNode.parameters);
          const paramTypes = [];
          if (isStructMethod) {
            const selfSymbol = funcScope.symbols.get("self");
            if (selfSymbol == null ? void 0 : selfSymbol.type) {
              paramTypes.push(selfSymbol.type);
            } else {
              this.reportError(
                "INTERNAL_ERROR" /* INTERNAL_ERROR */,
                `Struct method '${funcNode.ident.name}' missing 'self' parameter`,
                funcNode.span
              );
            }
          }
          for (const param of funcNode.parameters) {
            if (param.type) {
              paramTypes.push(param.type);
            } else {
              const paramSymbol = funcScope.symbols.get(param.ident.name);
              if (paramSymbol == null ? void 0 : paramSymbol.type) {
                paramTypes.push(paramSymbol.type);
              } else {
                this.reportError(
                  "CANNOT_INFER_TYPE" /* CANNOT_INFER_TYPE */,
                  `Cannot infer type for parameter '${param.ident.name}'`,
                  param.span
                );
                paramTypes.push(AST3.TypeNode.asUndefined(param.span));
              }
            }
          }
          let returnType = null;
          if (funcNode.returnType) {
            const tempReturnSymbol = {
              id: -1,
              name: "<return-type>",
              kind: "Variable" /* Variable */,
              type: null,
              scope: funcScope.id,
              contextSpan: funcNode.returnType.span,
              declared: true,
              initialized: true,
              used: false,
              isTypeChecked: false,
              visibility: { kind: "Private" },
              mutability: { kind: "Immutable" },
              isExported: false
            };
            this.resolveType(funcNode.returnType, tempReturnSymbol);
            returnType = funcNode.returnType;
          }
          if (funcNode.errorType) {
            const tempErrorSymbol = {
              id: -1,
              name: "<func-error-type>",
              kind: "Variable" /* Variable */,
              type: null,
              scope: funcScope.id,
              contextSpan: funcNode.errorType.span,
              declared: true,
              initialized: true,
              used: false,
              isTypeChecked: false,
              visibility: { kind: "Private" },
              mutability: { kind: "Immutable" },
              isExported: false
            };
            if (!this.resolveType(funcNode.errorType, tempErrorSymbol, funcNode.span)) {
              funcSymbol.isTypeChecked = true;
              return;
            }
            const refinedMode = this.refineErrorMode(funcNode.errorType, funcSymbol);
            if (funcSymbol.metadata) {
              funcSymbol.metadata.errorMode = refinedMode;
              if (refinedMode === "self-group") {
                funcSymbol.metadata.selfGroupErrors = this.extractSelfGroupErrors(funcNode.errorType);
              }
            }
            if (funcNode.errorType.isIdent()) {
              const errorIdent = funcNode.errorType.getIdent();
              if (!errorIdent.builtin) {
                const errorSymbol = this.config.services.scopeManager.lookupSymbol(errorIdent.name);
                if (!errorSymbol) {
                  this.reportError(
                    "UNDEFINED_IDENTIFIER" /* UNDEFINED_IDENTIFIER */,
                    `Error type '${errorIdent.name}' is not defined`,
                    funcNode.errorType.span
                  );
                  funcSymbol.isTypeChecked = true;
                  return;
                }
                if (errorSymbol.type && !errorSymbol.type.isErrset() && !errorSymbol.type.isErr()) {
                  this.reportError(
                    "TYPE_MISMATCH" /* TYPE_MISMATCH */,
                    `'${errorIdent.name}' is not an error type`,
                    funcNode.errorType.span
                  );
                  funcSymbol.isTypeChecked = true;
                  return;
                }
              }
            }
          }
          funcSymbol.type = AST3.TypeNode.asFunction(
            funcNode.span,
            paramTypes,
            returnType || AST3.TypeNode.asVoid(funcNode.span),
            funcNode.errorType
          );
          if (funcNode.body) {
            this.config.services.contextTracker.enterExpression(
              "FunctionBody" /* FunctionBody */,
              funcNode.body.span
            );
            this.resolveStmt(funcNode.body, funcScope);
            this.config.services.contextTracker.exitExpression();
          }
        });
      });
      if (isStructMethod) {
        this.stats.structMethodsResolved++;
      }
    } finally {
      this.config.services.contextTracker.completeDeclaration(funcSymbol.id);
      this.currentIsStaticMethod = previousIsStaticMethod;
      this.currentStructScope = previousStructScope;
    }
    funcSymbol.isTypeChecked = true;
    this.stats.resolvedSymbols++;
  }
  refineErrorMode(errorType, funcSymbol) {
    var _a, _b;
    if (errorType.isErr()) {
      return "any-error";
    }
    if (errorType.isErrset()) {
      return "self-group";
    }
    if (errorType.isIdent()) {
      const ident = errorType.getIdent();
      const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
      if ((symbol == null ? void 0 : symbol.kind) === "Variable" /* Variable */ && ((_a = symbol.type) == null ? void 0 : _a.isErr())) {
        return "err-ident";
      }
      if ((symbol == null ? void 0 : symbol.kind) === "Definition" /* Definition */ && ((_b = symbol.type) == null ? void 0 : _b.isErrset())) {
        return "err-group";
      }
    }
    return "any-error";
  }
  extractSelfGroupErrors(errorType) {
    if (!errorType.isErrset()) return [];
    const errset = errorType.getErrset();
    return errset.members.map((m) => m.name);
  }
  resolveSelfParameter(funcScope, structScope) {
    const selfSymbol = funcScope.symbols.get("self");
    if (!selfSymbol) {
      this.log("verbose", `Warning: Expected 'self' parameter in struct method but not found`);
      return;
    }
    selfSymbol.declared = true;
    if (selfSymbol.type) {
      if (selfSymbol.type.kind === "ident") {
        const typeIdent = selfSymbol.type.getIdent();
        if (typeIdent.name !== structScope.name) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Self type mismatch: expected '${structScope.name}', got '${typeIdent.name}'`,
            selfSymbol.contextSpan
          );
        }
      }
    }
    this.log("symbols", `Resolved 'self' parameter in struct method`);
  }
  // ───── PARAMS ─────
  resolveParameters(parameters) {
    const fieldInfo = parameters.map((param, index) => ({ name: param.ident.name, index }));
    for (let i = 0; i < parameters.length; i++) {
      this.resolveParameter(parameters[i], i, fieldInfo);
    }
  }
  resolveParameter(param, index, fieldInfo) {
    const paramSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(param.ident.name);
    if (!paramSymbol) return;
    this.config.services.contextTracker.startDeclaration(param.ident.name, paramSymbol.id, "Param", param.span, this.config.services.scopeManager.getCurrentScope().id);
    paramSymbol.declared = true;
    if (param.type) {
      this.resolveType(param.type, paramSymbol);
    }
    if (param.initializer) {
      this.resolveParameterInitializer(param, index, fieldInfo);
    }
    this.config.services.contextTracker.completeDeclaration(paramSymbol.id);
    this.stats.resolvedSymbols++;
  }
  resolveParameterInitializer(param, currentFieldIndex, fieldInfo) {
    const paramSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(param.ident.name);
    this.config.services.contextTracker.startInitialization(paramSymbol.id);
    this.config.services.contextTracker.enterExpression("ParameterInitializer" /* ParameterInitializer */, param.initializer.span, paramSymbol.id);
    const parameterContext = { currentFieldIndex, parameters: fieldInfo };
    this.resolveExprStmt(param.initializer, param.span, parameterContext, paramSymbol);
    this.config.services.contextTracker.exitExpression();
  }
  // ───── FIELDS ─────
  resolveFields(fields) {
    const fieldInfo = fields.map((field, index) => ({ name: field.ident.name, index }));
    for (let i = 0; i < fields.length; i++) {
      this.resolveField(fields[i], i, fieldInfo);
    }
  }
  resolveField(field, index, fieldInfo) {
    const fieldSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(field.ident.name);
    if (!fieldSymbol) return;
    this.config.services.contextTracker.startDeclaration(field.ident.name, fieldSymbol.id, "Param", field.span, this.config.services.scopeManager.getCurrentScope().id);
    fieldSymbol.declared = true;
    if (field.type) {
      this.resolveType(field.type, fieldSymbol);
    }
    if (field.initializer) {
      this.resolveFieldInitializer(field, index, fieldInfo);
    }
    this.config.services.contextTracker.completeDeclaration(fieldSymbol.id);
    this.stats.resolvedSymbols++;
  }
  resolveFieldInitializer(field, currentFieldIndex, fieldInfo) {
    const fieldSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(field.ident.name);
    this.config.services.contextTracker.startInitialization(fieldSymbol.id);
    this.config.services.contextTracker.enterExpression("ParameterInitializer" /* ParameterInitializer */, field.initializer.span, fieldSymbol.id);
    const fieldContext = { currentFieldIndex, parameters: fieldInfo };
    this.resolveExprStmt(field.initializer, field.span, fieldContext, fieldSymbol);
    this.config.services.contextTracker.exitExpression();
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────────── [3.6] LOOP ─────────────────────────────┐
  handleLoopStmt(stmt, scope, moduleName) {
    if (stmt.getLoop === void 0) {
      const data = stmt;
      switch (stmt.kind) {
        case "While": {
          const src = data.source;
          const loop = AST3.LoopStmtNode.createWhile(data.span, src.expr, src.stmt);
          this.resolveLoopStmt(loop);
          break;
        }
        case "Do": {
          const src = data.source;
          const loop = AST3.LoopStmtNode.createDo(data.span, src.expr, src.stmt);
          this.resolveLoopStmt(loop);
          break;
        }
        case "For": {
          const src = data.source;
          const loop = AST3.LoopStmtNode.createFor(data.span, src.expr, src.stmt);
          this.resolveLoopStmt(loop);
          break;
        }
      }
    } else {
      this.resolveLoopStmt(stmt.getLoop());
    }
  }
  resolveLoopStmt(loopStmt) {
    this.log("symbols", "Resolving loop statement");
    const loopScope = this.config.services.scopeManager.findChildScopeByName("loop", "Loop" /* Loop */);
    if (loopScope) {
      this.config.services.contextTracker.withSavedState(() => {
        this.config.services.contextTracker.setScope(loopScope.id);
        this.config.services.scopeManager.withScope(loopScope.id, () => {
          if (loopStmt.kind === "While") {
            if (loopStmt.expr) this.resolveExprStmt(loopStmt.expr);
            if (loopStmt.stmt) this.resolveStmt(loopStmt.stmt, loopScope);
          } else if (loopStmt.kind === "Do") {
            if (loopStmt.stmt) this.resolveStmt(loopStmt.stmt, loopScope);
            if (loopStmt.expr) this.resolveExprStmt(loopStmt.expr);
          } else if (loopStmt.kind === "For") {
            if (loopStmt.expr) this.resolveExprStmt(loopStmt.expr);
            if (loopStmt.stmt) this.resolveStmt(loopStmt.stmt, loopScope);
          }
        });
      });
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────── [3.7] CTRLFLOW ──────────────────────────┐
  handleControlflowStmt(stmt, scope, moduleName) {
    if (stmt.getCtrlflow === void 0) {
      const data = stmt;
      switch (stmt.kind) {
        case "Return": {
          const src = data.source;
          const res = AST3.ControlFlowStmtNode.asReturn(data.span, src.value);
          this.resolveReturnStmt(res);
          break;
        }
        case "Defer": {
          const src = data.source;
          const res = AST3.ControlFlowStmtNode.asDefer(data.span, src.value);
          this.resolveDeferStmt(res);
          break;
        }
        case "Throw": {
          const src = data.source;
          const res = AST3.ControlFlowStmtNode.asThrow(data.span, src.value);
          this.resolveThrowStmt(res);
          break;
        }
      }
    } else {
      switch (stmt.getCtrlflow().kind) {
        case "return": {
          this.resolveReturnStmt(stmt.getCtrlflow());
          break;
        }
        case "defer": {
          this.resolveDeferStmt(stmt.getCtrlflow());
          break;
        }
        case "throw": {
          this.resolveThrowStmt(stmt.getCtrlflow());
          break;
        }
      }
    }
  }
  resolveReturnStmt(returnNode) {
    this.log("symbols", "Resolving return statement");
    if (returnNode.value) {
      this.config.services.contextTracker.enterExpression("ReturnExpression" /* ReturnExpression */, returnNode.value.span);
      this.resolveExprStmt(returnNode.value);
      this.config.services.contextTracker.exitExpression();
    }
  }
  resolveDeferStmt(deferNode) {
    this.log("symbols", "Resolving defer statement");
    if (deferNode.value) {
      this.config.services.contextTracker.enterExpression("DeferExpression" /* DeferExpression */, deferNode.value.span);
      this.resolveExprStmt(deferNode.value);
      this.config.services.contextTracker.exitExpression();
    }
  }
  resolveThrowStmt(throwNode) {
    this.log("symbols", "Resolving throw statement");
    if (throwNode.value) {
      this.config.services.contextTracker.enterExpression("ThrowExpression" /* ThrowExpression */, throwNode.value.span);
      this.resolveExprStmt(throwNode.value);
      this.config.services.contextTracker.exitExpression();
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── [4] EXPR Level ───────────────────────────┐
  resolveExprStmt(expr, contextSpan, parameterContext, symbol) {
    if (!expr) return;
    this.log("symbols", `Resolving expression of type ${expr.kind}`);
    this.config.services.contextTracker.pushContextSpan(expr.span);
    try {
      switch (expr.kind) {
        case "Primary":
          this.resolvePrimary(expr.getPrimary(), contextSpan, parameterContext, symbol);
          break;
        case "Binary":
          this.resolveBinary(expr.getBinary(), contextSpan, parameterContext);
          break;
        case "Prefix":
          this.resolvePrefix(expr.getPrefix(), contextSpan, parameterContext);
          break;
        case "Postfix":
          this.resolvePostfix(expr.getPostfix(), contextSpan, parameterContext);
          break;
        case "As":
          this.resolveAs(expr.getAs(), contextSpan, parameterContext);
          break;
        case "Typeof":
          return this.resolveExprStmt(expr.getTypeof().expr, contextSpan, parameterContext);
        case "Sizeof":
          return this.resolveExprStmt(expr.getSizeof().expr, contextSpan, parameterContext);
        case "Orelse":
          this.resolveOrelse(expr.getOrelse(), contextSpan, parameterContext);
          break;
        case "Range":
          this.resolveRange(expr.getRange(), contextSpan, parameterContext);
          break;
        case "Try":
          this.resolveTry(expr.getTry(), contextSpan, parameterContext);
          break;
        case "Catch":
          this.resolveCatch(expr.getCatch(), contextSpan, parameterContext);
          break;
        case "If":
          this.resolveIf(expr.getIf(), contextSpan, parameterContext);
          break;
        case "Switch":
          this.resolveSwitch(expr.getSwitch(), contextSpan, parameterContext);
          break;
        default:
          this.log("verbose", `Unhandled expression type: ${expr.kind}`);
          break;
      }
    } finally {
      this.config.services.contextTracker.popContextSpan();
    }
  }
  resolvePrimary(primary, contextSpan, fieldContext, symbol) {
    var _a, _b, _c, _d;
    switch (primary.kind) {
      case "Ident":
        this.resolveIdentifier(primary.getIdent(), contextSpan, fieldContext);
        break;
      case "Paren": {
        const paren = primary.getParen();
        if (paren.source) {
          this.resolveExprStmt(paren.source, contextSpan, fieldContext, symbol);
        }
        break;
      }
      case "Literal":
        break;
      case "Tuple":
        this.resolveTuple(primary.getTuple(), contextSpan, fieldContext);
        break;
      case "Object":
        this.resolveObject(primary.getObject(), contextSpan, fieldContext);
        break;
      case "Type": {
        const type = primary.getType();
        const tempSymbol = {
          id: -1,
          name: (_d = (_c = (_a = symbol == null ? void 0 : symbol.name) != null ? _a : fieldContext == null ? void 0 : fieldContext.parameters[fieldContext == null ? void 0 : fieldContext.currentFieldIndex].name) != null ? _c : (_b = type.getIdent()) == null ? void 0 : _b.name) != null ? _d : "<type-expr>",
          kind: "Variable" /* Variable */,
          type: null,
          scope: this.config.services.scopeManager.getCurrentScope().id,
          contextSpan: type.span,
          declared: true,
          initialized: true,
          used: false,
          isTypeChecked: false,
          visibility: { kind: "Private" },
          mutability: { kind: "Immutable" },
          isExported: false
        };
        this.resolveType(type, tempSymbol, contextSpan);
        break;
      }
      default:
        this.log("verbose", `Unhandled primary type: ${primary.kind}`);
        break;
    }
  }
  resolveTuple(tuple, contextSpan, parameterContext) {
    for (const field of tuple.fields) {
      this.resolveExprStmt(field, contextSpan, parameterContext);
    }
  }
  resolveObject(obj, contextSpan, parameterContext) {
    if (obj.ident) this.resolveIdentifier(obj.ident, contextSpan, parameterContext);
    for (const prop of obj.props) {
      if (prop.val) {
        this.resolveExprStmt(prop.val, contextSpan, parameterContext);
      }
    }
  }
  resolveBinary(binary, contextSpan, parameterContext) {
    if (binary.left) {
      this.resolveExprStmt(binary.left, contextSpan, parameterContext);
    }
    if (binary.right) {
      this.resolveExprStmt(binary.right, contextSpan, parameterContext);
    }
  }
  resolvePrefix(prefix, contextSpan, parameterContext) {
    if (prefix.expr) {
      this.resolveExprStmt(prefix.expr, contextSpan, parameterContext);
    }
  }
  resolvePostfix(postfix, contextSpan, parameterContext) {
    switch (postfix.kind) {
      case "Call":
        this.resolvePostfixCall(postfix.getCall(), contextSpan, parameterContext);
        break;
      case "ArrayAccess":
        this.resolvePostfixArrayAccess(postfix.getArrayAccess(), contextSpan, parameterContext);
        break;
      case "MemberAccess":
        this.resolvePostfixMemberAccess(postfix.getMemberAccess(), contextSpan, parameterContext);
        break;
      case "Increment":
      case "Decrement":
      case "Dereference":
        this.resolveExprStmt(postfix.getAsExprNode(), contextSpan, parameterContext);
        break;
      default:
        this.log("verbose", `Unhandled postfix type: ${postfix.kind}`);
        break;
    }
  }
  resolvePostfixCall(call, contextSpan, parameterContext) {
    this.log("symbols", "Resolving call expression");
    this.config.services.contextTracker.enterExpression("FunctionCall" /* FunctionCall */, call.span);
    try {
      this.resolveExprStmt(call.base, call.span, parameterContext);
      const baseSymbol = this.findCallTargetSymbol(call.base);
      if (baseSymbol) {
        this.validateCallableSymbol(baseSymbol, call.base.span);
        baseSymbol.used = true;
        this.log("symbols", `Marked function '${baseSymbol.name}' as used`);
      }
      for (let i = 0; i < call.args.length; i++) {
        const arg = call.args[i];
        this.config.services.contextTracker.enterExpression("CallArgument" /* CallArgument */, arg.span);
        try {
          this.resolveExprStmt(arg, arg.span, parameterContext);
        } finally {
          this.config.services.contextTracker.exitExpression();
        }
      }
    } finally {
      this.config.services.contextTracker.exitExpression();
    }
  }
  resolvePostfixArrayAccess(arrayAccess, contextSpan, parameterContext) {
    this.log("symbols", "Resolving array access");
    this.resolveExprStmt(arrayAccess.base, contextSpan, parameterContext);
    this.resolveExprStmt(arrayAccess.index, contextSpan, parameterContext);
  }
  resolvePostfixMemberAccess(memberAccess, contextSpan, parameterContext) {
    this.log("symbols", "Resolving member access");
    if (memberAccess.base.is("Primary")) {
      const primary = memberAccess.base.getPrimary();
      if (primary == null ? void 0 : primary.is("Ident")) {
        const ident = primary.getIdent();
        if ((ident == null ? void 0 : ident.name) === "selferr") {
          this.resolveSelfErrMemberAccess(memberAccess);
          return;
        }
      }
    }
    if (memberAccess.base.is("Primary")) {
      const primary = memberAccess.base.getPrimary();
      if (primary == null ? void 0 : primary.is("Ident")) {
        const ident = primary.getIdent();
        if ((ident == null ? void 0 : ident.name) === "self") {
          this.resolveExprStmt(memberAccess.target, contextSpan, parameterContext);
          this.stats.memberAccessResolved++;
          return;
        }
      }
    }
    this.resolveExprStmt(memberAccess.base, contextSpan, parameterContext);
    const baseSymbol = this.findMemberAccessBaseSymbol(memberAccess.base);
    if (!baseSymbol) {
      if (memberAccess.base.is("Primary")) {
        const primary = memberAccess.base.getPrimary();
        if (primary == null ? void 0 : primary.is("Ident")) {
          const ident = primary.getIdent();
          if ((ident == null ? void 0 : ident.name) === "self" && this.currentIsStaticMethod) {
            this.stats.memberAccessResolved++;
            return;
          }
        }
      }
      this.reportError(
        "TYPE_INFERENCE_FAILED" /* TYPE_INFERENCE_FAILED */,
        `Cannot resolve base for member access`,
        memberAccess.base.span
      );
      return;
    }
    this.stats.memberAccessResolved++;
  }
  resolveSelfErrMemberAccess(memberAccess) {
    var _a;
    const selfErrSymbol = this.config.services.scopeManager.lookupSymbol("selferr");
    if (!selfErrSymbol || !((_a = selfErrSymbol.metadata) == null ? void 0 : _a.isSelfErr)) {
      this.reportError(
        "UNDEFINED_IDENTIFIER" /* UNDEFINED_IDENTIFIER */,
        "selferr can only be used in functions with self-group error type",
        memberAccess.base.span
      );
      return;
    }
    if (!memberAccess.target.is("Primary")) {
      this.reportError(
        "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
        "Expected error member name after selferr",
        memberAccess.target.span
      );
      return;
    }
    const targetPrimary = memberAccess.target.getPrimary();
    if (!(targetPrimary == null ? void 0 : targetPrimary.is("Ident"))) {
      this.reportError(
        "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
        "Expected error member name after selferr",
        memberAccess.target.span
      );
      return;
    }
    const errorMemberName = targetPrimary.getIdent().name;
    const errorType = selfErrSymbol.type;
    if (!errorType || !errorType.isErrset()) {
      this.reportError(
        "INTERNAL_ERROR" /* INTERNAL_ERROR */,
        "selferr does not reference a valid error set",
        memberAccess.span
      );
      return;
    }
    const errset = errorType.getErrset();
    const memberExists = errset.members.some((m) => m.name === errorMemberName);
    if (!memberExists) {
      this.reportError(
        "ERROR_MEMBER_NOT_FOUND" /* ERROR_MEMBER_NOT_FOUND */,
        `Error member '${errorMemberName}' not found in function's error set`,
        memberAccess.target.span
      );
      return;
    }
    selfErrSymbol.used = true;
    this.stats.memberAccessResolved++;
    this.log("symbols", `Resolved selferr.${errorMemberName}`);
  }
  findMemberAccessBaseSymbol(baseExpr) {
    if (baseExpr.kind === "Primary") {
      const primary = baseExpr.getPrimary();
      if (primary && primary.kind === "Ident") {
        const ident = primary.getIdent();
        if (ident) {
          return this.config.services.scopeManager.lookupSymbol(ident.name);
        }
      }
    }
    if (baseExpr.kind === "Postfix") {
      const postfix = baseExpr.getPostfix();
      if (!postfix) return null;
      if (postfix.kind === "Dereference") {
        const derefExpr = postfix.getAsExprNode();
        if (derefExpr) {
          return this.findMemberAccessBaseSymbol(derefExpr);
        }
      }
      if (postfix.kind === "MemberAccess") {
        const member = postfix.getMemberAccess();
        return this.findMemberAccessBaseSymbol(member.base);
      }
    }
    return null;
  }
  resolveSelfMemberAccess(memberAccess, selfSymbol) {
    let currentScope = this.config.services.scopeManager.getCurrentScope();
    while (currentScope && currentScope.kind !== "Function" /* Function */) {
      const parent = this.config.services.scopeManager.getScopeParent(currentScope.id);
      if (!parent) break;
      currentScope = parent;
    }
    if (!currentScope || currentScope.kind !== "Function" /* Function */) {
      this.reportError("UNDEFINED_IDENTIFIER" /* UNDEFINED_IDENTIFIER */, "Cannot use 'self' outside of method context", memberAccess.span);
      return;
    }
    const parentScope = this.config.services.scopeManager.getScopeParent(currentScope.id);
    if (!parentScope || parentScope.kind !== "Type" /* Type */) {
      this.reportError("UNDEFINED_IDENTIFIER" /* UNDEFINED_IDENTIFIER */, "Cannot use 'self' outside of struct method", memberAccess.span);
      return;
    }
    if (memberAccess.target.isIdent()) {
      const memberIdent = memberAccess.target.getIdent();
      const memberSymbol = parentScope.symbols.get(memberIdent.name);
      if (!memberSymbol) {
        this.reportError(
          "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
          `Member '${memberIdent.name}' not found in struct '${parentScope.name}'`,
          memberIdent.span
        );
        return;
      }
      if (memberSymbol.kind !== "StructField" /* StructField */) {
        this.reportError(
          "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
          `'${memberIdent.name}' is not a field`,
          memberIdent.span
        );
        return;
      }
      memberSymbol.used = true;
      this.log("symbols", `Resolved self.${memberIdent.name} in struct method`);
    }
  }
  resolveAs(asNode, contextSpan, parameterContext) {
    this.resolveExprStmt(asNode.base, contextSpan, parameterContext);
    const tempSymbol = {
      id: -1,
      name: "<as-expr>",
      kind: "Variable" /* Variable */,
      type: null,
      scope: this.config.services.scopeManager.getCurrentScope().id,
      contextSpan: asNode.span,
      declared: true,
      initialized: true,
      used: false,
      isTypeChecked: false,
      visibility: { kind: "Private" },
      mutability: { kind: "Immutable" },
      isExported: false
    };
    this.resolveType(asNode.type, tempSymbol, contextSpan);
  }
  resolveOrelse(orelse, contextSpan, parameterContext) {
    this.resolveExprStmt(orelse.left, contextSpan, parameterContext);
    this.resolveExprStmt(orelse.right, contextSpan, parameterContext);
  }
  resolveRange(range, contextSpan, parameterContext) {
    if (range.leftExpr) this.resolveExprStmt(range.leftExpr, contextSpan, parameterContext);
    if (range.rightExpr) this.resolveExprStmt(range.rightExpr, contextSpan, parameterContext);
  }
  resolveTry(tryNode, contextSpan, parameterContext) {
    this.resolveExprStmt(tryNode.expr, contextSpan, parameterContext);
  }
  resolveCatch(catchNode, contextSpan, parameterContext) {
    this.resolveExprStmt(catchNode.leftExpr, contextSpan, parameterContext);
    const exprScope = this.config.services.scopeManager.findChildScopeByName("expr", "Expression" /* Expression */);
    if (exprScope) {
      this.config.services.contextTracker.withSavedState(() => {
        this.config.services.contextTracker.setScope(exprScope.id);
        this.config.services.scopeManager.withScope(exprScope.id, () => {
          this.resolveStmt(catchNode.rightStmt, exprScope);
        });
      });
    } else {
      this.resolveStmt(catchNode.rightStmt, this.config.services.scopeManager.getCurrentScope());
    }
  }
  resolveIf(ifNode, contextSpan, parameterContext) {
    this.config.services.contextTracker.enterExpression("ConditionExpression" /* ConditionExpression */, ifNode.condExpr.span);
    this.resolveExprStmt(ifNode.condExpr, contextSpan, parameterContext);
    this.config.services.contextTracker.exitExpression();
    const currentScope = this.config.services.scopeManager.getCurrentScope();
    this.resolveStmt(ifNode.thenStmt, currentScope);
    if (ifNode.elseStmt) {
      this.resolveStmt(ifNode.elseStmt, currentScope);
    }
  }
  resolveSwitch(switchNode, contextSpan, parameterContext) {
    this.config.services.contextTracker.enterExpression("ConditionExpression" /* ConditionExpression */, switchNode.condExpr.span);
    this.resolveExprStmt(switchNode.condExpr, contextSpan, parameterContext);
    this.config.services.contextTracker.exitExpression();
    const currentScope = this.config.services.scopeManager.getCurrentScope();
    for (const switchCase of switchNode.cases) {
      if (switchCase.expr) {
        this.resolveExprStmt(switchCase.expr, contextSpan, parameterContext);
      }
      if (switchCase.stmt) {
        this.resolveStmt(switchCase.stmt, currentScope);
      }
    }
    if (switchNode.defCase) {
      this.resolveStmt(switchNode.defCase.stmt, currentScope);
    }
  }
  findCallTargetSymbol(baseExpr) {
    if (baseExpr.kind === "Primary") {
      const primary = baseExpr.getPrimary();
      if (primary && primary.kind === "Ident") {
        const ident = primary.getIdent();
        if (ident) {
          return this.config.services.scopeManager.lookupSymbol(ident.name);
        }
      }
    }
    return null;
  }
  validateCallableSymbol(symbol, span) {
    var _a, _b, _c, _d, _e;
    if (symbol.kind === "Function" /* Function */ || ((_a = symbol.metadata) == null ? void 0 : _a.callable) === true) {
      return;
    }
    if (((_b = symbol.type) == null ? void 0 : _b.kind) === "function") {
      return;
    }
    if (symbol.kind === "Use" /* Use */ && symbol.importSource) {
      const sourceModuleScope = this.config.services.scopeManager.findScopeByName(symbol.importSource, "Module" /* Module */);
      if (sourceModuleScope) {
        let sourceSymbol = sourceModuleScope.symbols.get(symbol.name);
        if (!sourceSymbol) {
          for (const [_, potentialSource] of sourceModuleScope.symbols) {
            if (potentialSource.kind === "Function" /* Function */ || ((_c = potentialSource.metadata) == null ? void 0 : _c.callable) === true) {
              sourceSymbol = potentialSource;
              break;
            }
          }
        }
        if (sourceSymbol) {
          if (sourceSymbol.kind === "Function" /* Function */ || ((_d = sourceSymbol.metadata) == null ? void 0 : _d.callable) === true || ((_e = sourceSymbol.type) == null ? void 0 : _e.kind) === "function") {
            return;
          }
        }
      }
    }
    this.reportError(
      "NOT_A_FUNCTION" /* NOT_A_FUNCTION */,
      `Cannot call value of non-function type. '${symbol.name}' is a ${symbol.kind.toLowerCase()}`,
      span
    );
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── [5] Ident Level ──────────────────────────┐
  resolveIdentifier(ident, contextSpan, parameterContext) {
    var _a;
    this.log("symbols", `Resolving identifier '${ident.name}'`);
    this.config.services.contextTracker.pushContextSpan(ident.span);
    try {
      if (parameterContext) {
        if (this.checkParameterForwardReference(ident, parameterContext)) {
          return;
        }
      }
      if (this.checkSelfReference(ident)) {
        return;
      }
      if (ident.builtin) {
        this.resolveBuiltinFunction(ident);
        return;
      }
      if (ident.name === "self") {
        if (this.currentIsStaticMethod && this.currentStructScope) {
          this.stats.resolvedSymbols++;
          this.config.services.contextTracker.popContextSpan();
          return;
        }
        const selfSymbol = this.config.services.scopeManager.lookupSymbol("self");
        if (selfSymbol && ((_a = selfSymbol.metadata) == null ? void 0 : _a.isSelf)) {
          selfSymbol.used = true;
          this.stats.resolvedSymbols++;
          this.config.services.contextTracker.popContextSpan();
          return;
        }
        this.reportError(
          "UNDEFINED_IDENTIFIER" /* UNDEFINED_IDENTIFIER */,
          "self can only be used in instance methods",
          ident.span
        );
        this.config.services.contextTracker.popContextSpan();
        return;
      }
      if (this.currentIsStaticMethod && this.currentStructScope) {
        const fieldSymbol = this.currentStructScope.symbols.get(ident.name);
        if (fieldSymbol && fieldSymbol.kind === "StructField" /* StructField */) {
          const isStaticField = fieldSymbol.visibility.kind === "Static";
          if (!isStaticField) {
            this.reportError(
              "INVALID_STATIC_ACCESS" /* INVALID_STATIC_ACCESS */,
              `Cannot access instance field '${ident.name}' in static method. Static methods can only access static fields.`,
              ident.span
            );
            return;
          }
        }
      }
      const currentScope = this.config.services.scopeManager.getCurrentScope();
      if (currentScope.kind === "Function" /* Function */) {
        const parentScope = this.config.services.scopeManager.getScopeParent(currentScope.id);
        if (parentScope && parentScope.kind === "Type" /* Type */) {
          const fieldSymbol = parentScope.symbols.get(ident.name);
          if (fieldSymbol && fieldSymbol.kind === "StructField" /* StructField */) {
            fieldSymbol.used = true;
            this.stats.resolvedSymbols++;
            this.log("symbols", `Resolved struct field '${fieldSymbol.name}' as used`);
            this.config.services.contextTracker.popContextSpan();
            return;
          }
        }
      }
      this.resolveStandardIdentifier(ident, contextSpan);
    } finally {
      this.config.services.contextTracker.popContextSpan();
    }
  }
  resolveBuiltinFunction(ident) {
    const globalScope = this.config.services.scopeManager.getAllScopes().find((s) => s.kind === "Global" /* Global */);
    if (!globalScope) {
      throw new Error("Global scope not found");
    }
    const builtinName = `@${ident.name}`;
    const builtinSymbol = globalScope.symbols.get(builtinName);
    if (!builtinSymbol) {
      this.reportError(
        "UNDEFINED_BUILTIN" /* UNDEFINED_BUILTIN */,
        `Undefined builtin function '${builtinName}'`,
        ident.span
      );
      return;
    }
    builtinSymbol.used = true;
    this.stats.resolvedSymbols++;
  }
  resolveStandardIdentifier(ident, contextSpan) {
    this.log("symbols", `Resolving standard identifier '${ident.name}'`);
    const cacheKey = this.createCacheKey(ident);
    let symbol = this.resolutionCtx.cache.get(cacheKey);
    if (symbol !== void 0) {
      this.stats.cachedResolutions++;
      if (symbol) {
        symbol.used = true;
        this.log("symbols", `Used cached symbol '${symbol.name}'`);
      }
      return;
    }
    symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
    this.resolutionCtx.cache.set(cacheKey, symbol || null);
    if (!symbol) {
      this.config.services.contextTracker.recordPendingReference(ident.name, ident.span);
      this.reportError(
        "UNDEFINED_IDENTIFIER" /* UNDEFINED_IDENTIFIER */,
        `Undefined identifier '${ident.name}'`,
        ident.span
      );
      return;
    }
    this.validateSymbolUsage(symbol, ident, contextSpan);
    symbol.used = true;
    this.config.services.contextTracker.resolvePendingReferences(ident.name);
    this.stats.resolvedSymbols++;
    this.log("symbols", `Resolved and marked '${symbol.name}' as used`);
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── [6] Type Level ───────────────────────────┐
  resolveType(typeNode, symbol, contextSpan) {
    var _a, _b;
    this.log("symbols", `Resolving type for symbol '${symbol.name}', typeNode: ${typeNode.toString()}`);
    switch (typeNode.kind) {
      case "ident": {
        const identNode = typeNode.getIdent();
        if (!identNode.builtin) {
          const typeSymbol = this.config.services.scopeManager.lookupSymbol(identNode.name);
          if (!typeSymbol) {
            this.reportError(
              "UNDEFINED_IDENTIFIER" /* UNDEFINED_IDENTIFIER */,
              `Undefined type '${identNode.name}'`,
              identNode.span
            );
            return false;
          }
          if (!typeSymbol.declared) {
            this.reportError(
              "USED_BEFORE_DECLARED" /* USED_BEFORE_DECLARED */,
              `Symbol '${identNode.name}' used before declaration`,
              identNode.span
            );
            return false;
          }
          typeSymbol.used = true;
        }
        symbol.type = typeNode;
        return true;
      }
      case "optional": {
        const optional = typeNode.getOptional();
        if (!this.resolveType(optional.target, symbol, contextSpan)) return false;
        symbol.type = typeNode;
        return true;
      }
      case "pointer": {
        const pointer = typeNode.getPointer();
        let targetType = pointer.target;
        while (targetType.isParen()) {
          targetType = targetType.getParen().type;
        }
        if (targetType.isIdent()) {
          const targetIdent = targetType.getIdent();
          if (!targetIdent.builtin) {
            const targetSymbol = this.config.services.scopeManager.lookupSymbol(targetIdent.name);
            if (targetSymbol && (targetSymbol.kind === "Variable" /* Variable */ || targetSymbol.kind === "Parameter" /* Parameter */)) {
              this.reportError(
                "TYPE_MISMATCH" /* TYPE_MISMATCH */,
                `Cannot use pointer syntax with variable '${targetIdent.name}'. Did you mean to dereference using '.*' postfix operator?`,
                typeNode.span
              );
              return false;
            }
          }
        }
        if (!this.resolveType(pointer.target, symbol, contextSpan)) return false;
        symbol.type = typeNode;
        return true;
      }
      case "array": {
        const array = typeNode.getArray();
        if (!this.resolveType(array.target, symbol, contextSpan)) return false;
        if (array.size) this.resolveExprStmt(array.size, contextSpan, void 0, symbol);
        symbol.type = typeNode;
        return true;
      }
      case "tuple": {
        const tuple = typeNode.getTuple();
        for (const field of tuple.fields) {
          if (!this.resolveType(field, symbol, contextSpan)) return false;
        }
        symbol.type = typeNode;
        return true;
      }
      case "struct": {
        const struct = typeNode.getStruct();
        let typeScope = null;
        if (((_a = struct.metadata) == null ? void 0 : _a.scopeId) !== void 0) {
          try {
            typeScope = this.config.services.scopeManager.getScope(struct.metadata.scopeId);
          } catch (e) {
            typeScope = null;
          }
        }
        if (!typeScope && struct.name && struct.name !== "Anonymous") {
          typeScope = this.config.services.scopeManager.findChildScopeByName(struct.name, "Type" /* Type */);
        }
        if (!typeScope) {
          typeScope = this.config.services.scopeManager.findChildScopeByNameFromId(
            symbol.name,
            symbol.scope,
            "Type" /* Type */
          );
        }
        if (!typeScope) {
          const parentScope = this.config.services.scopeManager.getScope(symbol.scope);
          for (const childId of parentScope.children) {
            const child = this.config.services.scopeManager.getScope(childId);
            if (child.kind === "Type" /* Type */) {
              if (this.scopeMatchesStruct(child, struct)) {
                typeScope = child;
                break;
              }
            }
          }
        }
        if (typeScope) {
          this.config.services.contextTracker.withSavedState(() => {
            this.config.services.contextTracker.setScope(typeScope.id);
            this.config.services.scopeManager.withScope(typeScope.id, () => {
              const fields = [];
              const methods = [];
              for (const member of struct.members) {
                if (member.isField()) {
                  fields.push(member.getField());
                } else if (member.isMethod()) {
                  methods.push(member.getMethod());
                }
              }
              this.resolveFields(fields);
              for (const m of methods) {
                this.resolveFuncStmt(m);
              }
            });
          });
        } else {
          this.reportError(
            "INTERNAL_ERROR" /* INTERNAL_ERROR */,
            `Cannot find type scope for struct '${struct.name || "<anonymous>"}'`,
            typeNode.span
          );
          return false;
        }
        symbol.type = typeNode;
        return true;
      }
      case "enum": {
        const enumType = typeNode.getEnum();
        let typeScope = null;
        if (((_b = enumType.metadata) == null ? void 0 : _b.scopeId) !== void 0) {
          try {
            typeScope = this.config.services.scopeManager.getScope(enumType.metadata.scopeId);
          } catch (e) {
            typeScope = null;
          }
        }
        if (!typeScope && symbol.name) {
          typeScope = this.config.services.scopeManager.findChildScopeByName(symbol.name, "Type" /* Type */);
        }
        if (typeScope) {
          enumType.metadata = __spreadProps(__spreadValues({}, enumType.metadata), { scopeId: typeScope.id });
          this.config.services.contextTracker.withSavedState(() => {
            this.config.services.contextTracker.setScope(typeScope.id);
            this.config.services.scopeManager.withScope(typeScope.id, () => {
              var _a2;
              for (const variant of enumType.variants) {
                const variantSymbol = typeScope.symbols.get(variant.ident.name);
                if (variantSymbol) {
                  variantSymbol.declared = true;
                  variantSymbol.used = true;
                  this.stats.enumVariantsResolved++;
                }
                if (variant.type) {
                  if (variant.type.isStruct()) {
                    const structType = variant.type.getStruct();
                    let variantScope = null;
                    if (((_a2 = structType.metadata) == null ? void 0 : _a2.scopeId) !== void 0) {
                      try {
                        variantScope = this.config.services.scopeManager.getScope(structType.metadata.scopeId);
                      } catch (e) {
                        variantScope = null;
                      }
                    }
                    if (!variantScope) {
                      variantScope = this.config.services.scopeManager.findChildScopeByNameFromId(
                        variant.ident.name,
                        typeScope.id,
                        "Type" /* Type */
                      );
                    }
                    if (variantScope) {
                      this.config.services.contextTracker.withSavedState(() => {
                        this.config.services.scopeManager.withScope(variantScope.id, () => {
                          const tempSymbol = {
                            id: -1,
                            name: variant.ident.name,
                            kind: "EnumVariant" /* EnumVariant */,
                            type: variant.type,
                            scope: variantScope.id,
                            contextSpan: variant.type.span,
                            declared: true,
                            initialized: true,
                            used: false,
                            isTypeChecked: false,
                            visibility: { kind: "Public" },
                            mutability: { kind: "Immutable" },
                            isExported: false
                          };
                          this.resolveType(variant.type, tempSymbol, contextSpan);
                        });
                      });
                    }
                  } else {
                    this.resolveType(variant.type, symbol, contextSpan);
                  }
                }
              }
            });
          });
        }
        symbol.type = typeNode;
        return true;
      }
      case "errset":
        const errorType = typeNode.getErrset();
        for (const errorMember of errorType.members) {
          const errorSymbol = this.config.services.scopeManager.lookupSymbol(errorMember.name);
          if (errorSymbol) {
            errorSymbol.used = true;
            errorSymbol.declared = true;
          }
          this.log("symbols", `Resolved error member '${errorMember.name}'`);
        }
        symbol.type = typeNode;
        return true;
      case "function": {
        const func = typeNode.getFunction();
        for (const param of func.params) {
          const tempParamSymbol = {
            id: -1,
            name: "<func-param-type>",
            kind: "Variable" /* Variable */,
            type: null,
            scope: this.config.services.scopeManager.getCurrentScope().id,
            contextSpan: param.span,
            declared: true,
            initialized: true,
            used: false,
            isTypeChecked: false,
            visibility: { kind: "Private" },
            mutability: { kind: "Immutable" },
            isExported: false
          };
          if (!this.resolveType(param, tempParamSymbol, contextSpan)) return false;
        }
        if (func.returnType) {
          const tempReturnSymbol = {
            id: -1,
            name: "<func-return-type>",
            kind: "Variable" /* Variable */,
            type: null,
            scope: this.config.services.scopeManager.getCurrentScope().id,
            contextSpan: func.returnType.span,
            declared: true,
            initialized: true,
            used: false,
            isTypeChecked: false,
            visibility: { kind: "Private" },
            mutability: { kind: "Immutable" },
            isExported: false
          };
          if (!this.resolveType(func.returnType, tempReturnSymbol, contextSpan)) return false;
        }
        if (func.errorType) {
          const tempErrorSymbol = {
            id: -1,
            name: "<func-error-type>",
            kind: "Variable" /* Variable */,
            type: null,
            scope: this.config.services.scopeManager.getCurrentScope().id,
            contextSpan: func.errorType.span,
            declared: true,
            initialized: true,
            used: false,
            isTypeChecked: false,
            visibility: { kind: "Private" },
            mutability: { kind: "Immutable" },
            isExported: false
          };
          if (!this.resolveType(func.errorType, tempErrorSymbol, contextSpan)) return false;
          if (func.errorType.isIdent()) {
            const errorIdent = func.errorType.getIdent();
            if (!errorIdent.builtin) {
              const errorSymbol = this.config.services.scopeManager.lookupSymbol(errorIdent.name);
              if (!errorSymbol) {
                this.reportError(
                  "UNDEFINED_IDENTIFIER" /* UNDEFINED_IDENTIFIER */,
                  `Error type '${errorIdent.name}' is not defined`,
                  func.errorType.span
                );
                return false;
              }
              if (errorSymbol.type && !errorSymbol.type.isErrset() && !errorSymbol.type.isErr()) {
                this.reportError(
                  "TYPE_MISMATCH" /* TYPE_MISMATCH */,
                  `'${errorIdent.name}' is not an error type`,
                  func.errorType.span
                );
                return false;
              }
            }
          }
        }
        symbol.type = typeNode;
        return true;
      }
      case "union": {
        const union = typeNode.getUnion();
        for (const variantType of union.types) {
          const tempVariantSymbol = {
            id: -1,
            name: "<union-variant>",
            kind: "Variable" /* Variable */,
            type: null,
            scope: this.config.services.scopeManager.getCurrentScope().id,
            contextSpan: variantType.span,
            declared: true,
            initialized: true,
            used: false,
            isTypeChecked: false,
            visibility: { kind: "Private" },
            mutability: { kind: "Immutable" },
            isExported: false
          };
          if (!this.resolveType(variantType, tempVariantSymbol, contextSpan)) return false;
        }
        symbol.type = typeNode;
        return true;
      }
      case "paren": {
        return this.resolveType(typeNode.getParen().type, symbol, contextSpan);
      }
      case "primitive":
        symbol.type = typeNode;
        return true;
      default:
        this.config.services.diagnosticManager.reportError("UnsupportedType" /* UNSUPPORTED_TYPE */, `Unsupported type kind: ${typeNode.kind}`, typeNode.span);
        return false;
    }
  }
  scopeMatchesStruct(scope, struct) {
    const structFields = struct.members.filter((m) => m.isField());
    const scopeFields = Array.from(scope.symbols.values()).filter((s) => s.kind === "StructField" /* StructField */);
    if (scopeFields.length !== structFields.length) {
      return false;
    }
    for (const member of structFields) {
      const field = member.source;
      const fieldName = field.ident.name;
      if (!scope.symbols.has(fieldName)) {
        return false;
      }
      const scopeSymbol = scope.symbols.get(fieldName);
      if (scopeSymbol.kind !== "StructField" /* StructField */) {
        return false;
      }
    }
    return true;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── [x] VALIDATION ───────────────────────────┐
  checkParameterForwardReference(ident, parameterContext) {
    const forwardRefResult = this.config.services.contextTracker.checkParameterForwardReference(
      ident.name,
      parameterContext.currentFieldIndex,
      parameterContext.parameters
    );
    if (forwardRefResult.isForwardReference) {
      this.reportError(
        "PARAMETER_FORWARD_REFERENCE" /* PARAMETER_FORWARD_REFERENCE */,
        `Parameter '${parameterContext.parameters[parameterContext.currentFieldIndex].name}' default value refers to parameter '${ident.name}' which is not yet declared`,
        ident.span
      );
      this.stats.forwardReferences++;
      return true;
    }
    return false;
  }
  checkSelfReference(ident) {
    var _a;
    const selfRefResult = this.config.services.contextTracker.checkSelfReference(ident.name, ident.span);
    if (selfRefResult.isSelfReference) {
      const errorCode = selfRefResult.errorType === "VARIABLE_SELF_INIT" ? "VARIABLE_SELF_INIT" /* VARIABLE_SELF_INIT */ : "PARAMETER_SELF_INIT" /* PARAMETER_SELF_INIT */;
      const symbolType = (_a = selfRefResult.declarationContext) == null ? void 0 : _a.symbolKind;
      this.reportError(
        errorCode,
        `${symbolType} '${ident.name}' cannot be initialized using itself`,
        ident.span
      );
      this.stats.selfReferences++;
      return true;
    }
    return false;
  }
  validateSymbolUsage(symbol, ident, contextSpan) {
    this.log("symbols", `Validating usage of symbol '${symbol.name}'`);
    if (contextSpan) {
      this.config.services.contextTracker.pushContextSpan(contextSpan);
    }
    if (!symbol.declared) {
      this.reportError(
        "USED_BEFORE_DECLARED" /* USED_BEFORE_DECLARED */,
        `Symbol '${ident.name}' used before declaration`,
        ident.span
      );
    }
    if (symbol.kind === "Variable" /* Variable */ && !symbol.initialized) {
      this.reportError(
        "USED_BEFORE_INITIALIZED" /* USED_BEFORE_INITIALIZED */,
        `Variable '${ident.name}' used before initialization`,
        ident.span
      );
    }
    if (contextSpan) {
      this.config.services.contextTracker.popContextSpan();
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  init() {
    this.config.services.contextTracker.reset();
    this.config.services.contextTracker.setPhase("Resolution" /* Resolution */);
    this.stats.totalSymbols = Array.from(this.config.services.scopeManager.getAllSymbols()).length;
    const globalScope = this.config.services.scopeManager.getGlobalScope();
    this.config.services.scopeManager.setCurrentScope(globalScope.id);
    this.config.services.contextTracker.setScope(globalScope.id);
    this.log("verbose", `Resolution initialized: ${this.stats.totalSymbols} symbols to resolve`);
    return true;
  }
  initStats() {
    return {
      totalSymbols: 0,
      resolvedSymbols: 0,
      cachedResolutions: 0,
      forwardReferences: 0,
      selfReferences: 0,
      importResolutions: 0,
      structMethodsResolved: 0,
      enumVariantsResolved: 0,
      memberAccessResolved: 0,
      anonymousTypesResolved: 0,
      visibilityChecks: 0,
      errors: 0,
      modulesProcessed: 0,
      startTime: Date.now()
    };
  }
  initResolutionContext() {
    return {
      currentModule: "",
      moduleStack: [],
      cache: /* @__PURE__ */ new Map()
    };
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  createCacheKey(ident) {
    const scope = this.config.services.scopeManager.getCurrentScope();
    const moduleName = this.resolutionCtx.currentModule;
    return `${moduleName}:${ident.name}:${ident.span.start}:${ident.span.end}`;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  logStatistics() {
    const duration = Date.now() - this.stats.startTime;
    this.log(
      "verbose",
      `Resolution Statistics      :
  Duration                 : ${duration}ms
  Total symbols            : ${this.stats.totalSymbols}
  Resolved symbols         : ${this.stats.resolvedSymbols}
  Cached resolutions       : ${this.stats.cachedResolutions}
  Forward references       : ${this.stats.forwardReferences}
  Self references          : ${this.stats.selfReferences}
  Import resolutions       : ${this.stats.importResolutions}
  Struct methods resolved  : ${this.stats.structMethodsResolved}
  Enum variants resolved   : ${this.stats.enumVariantsResolved}
  Member access resolved   : ${this.stats.memberAccessResolved}
  Anonymous types resolved : ${this.stats.anonymousTypesResolved}
  Visibility checks        : ${this.stats.visibilityChecks}
  Errors                   : ${this.stats.errors}`
    );
  }
  // └──────────────────────────────────────────────────────────────────────┘
};

// lib/phases/TypeValidator.ts
import * as AST4 from "@je-es/ast";

// lib/components/ExpressionEvaluator.ts
var ExpressionEvaluator = class {
  constructor(config) {
    this.config = config;
    // ┌──────────────────────────────── INIT ────────────────────────────────┐
    this.MAX_INT_64 = BigInt("9223372036854775807");
    // i64::MAX
    this.MIN_INT_64 = BigInt("-9223372036854775808");
    // i64::MIN
    this.comptimeResultCache = /* @__PURE__ */ new Map();
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── MAIN ────────────────────────────────┐
  evaluateComptimeExpression(expr, targetType) {
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
    if (result.type !== "int") {
      return null;
    }
    const value = result.value;
    if (targetType && (value < bounds.min || value > bounds.max)) {
      this.reportError(
        "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
        `Value ${value} does not fit in type '${targetType.toString()}' (valid range: ${bounds.min} to ${bounds.max})`,
        expr.span
      );
      return null;
    }
    return value;
  }
  evaluateComptimeFloat(expr, targetType) {
    const result = this.evaluateExpression(expr, {
      allowFloats: true,
      maxIntValue: this.MAX_INT_64,
      minIntValue: this.MIN_INT_64,
      targetType
    });
    if (!result) return null;
    if (result.type === "int") {
      return Number(result.value);
    }
    if (result.type === "float") {
      const value = result.value;
      if (targetType) {
        const bounds = this.getFloatBounds(targetType);
        if (value < bounds.min || value > bounds.max) {
          this.reportError(
            "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
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
  evaluateComptimeValue(expr, targetType) {
    const allowFloats = !targetType || !this.isIntegerTargetType(targetType);
    const result = this.evaluateExpression(expr, {
      allowFloats,
      maxIntValue: this.MAX_INT_64,
      minIntValue: this.MIN_INT_64,
      targetType
    });
    return result ? result.value : null;
  }
  evaluateExpression(expr, ctx) {
    const context = ctx || {
      allowFloats: true,
      maxIntValue: this.MAX_INT_64,
      minIntValue: this.MIN_INT_64
    };
    try {
      switch (expr.kind) {
        case "Primary":
          return this.evaluatePrimary(expr.getPrimary(), context);
        case "Binary":
          return this.evaluateBinary(expr.getBinary(), context);
        case "Prefix":
          return this.evaluatePrefix(expr.getPrefix(), context);
        case "Postfix": {
          const postfix = expr.getPostfix();
          if ((postfix == null ? void 0 : postfix.kind) === "Call") {
            return this.evaluateComptimeFunctionCall(postfix.getCall(), context);
          }
          return null;
        }
        case "As":
          return this.evaluateAs(expr.getAs(), context);
        case "Sizeof":
          return this.evaluateSizeof(expr.getSizeof(), context);
        default:
          return null;
      }
    } catch (error) {
      this.reportError(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        `Error evaluating compile-time expression: ${error}`,
        expr.span
      );
      return null;
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── PRIMARY ──────────────────────────────┐
  evaluatePrimary(primary, ctx) {
    switch (primary.kind) {
      case "Literal":
        return this.evaluateLiteral(primary.getLiteral(), ctx);
      case "Ident":
        return this.evaluateIdentifier(primary.getIdent(), ctx);
      case "Paren": {
        const paren = primary.getParen();
        return paren.source ? this.evaluateExpression(paren.source, ctx) : null;
      }
      default:
        return null;
    }
  }
  evaluateLiteral(literal, ctx) {
    switch (literal.kind) {
      case "Integer": {
        try {
          const value = BigInt(literal.value);
          return { value, type: "int" };
        } catch (e) {
          this.reportError(
            "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
            `Invalid integer literal: ${literal.value}`,
            literal.span
          );
          return null;
        }
      }
      case "Float": {
        if (!ctx.allowFloats) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            "Float literals not allowed in integer-only context",
            literal.span
          );
          return null;
        }
        try {
          const value = parseFloat(literal.value);
          if (!isFinite(value)) {
            this.reportError(
              "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
              "Float literal out of valid range",
              literal.span
            );
            return null;
          }
          return { value, type: "float" };
        } catch (e) {
          this.reportError(
            "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
            `Invalid float literal: ${literal.value}`,
            literal.span
          );
          return null;
        }
      }
      case "Character": {
        const charValue = literal.value;
        if (charValue.length === 0) {
          return { value: BigInt(0), type: "int" };
        }
        const codePoint = charValue.codePointAt(0) || 0;
        if (codePoint > 127) {
          if (codePoint > 2097151) {
            this.reportError(
              "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
              `Character code point ${codePoint} exceeds u21 maximum (2,097,151)`,
              literal.span
            );
            return null;
          }
        }
        return { value: BigInt(codePoint), type: "int" };
      }
      case "Bool":
        return { value: literal.value, type: "bool" };
      case "Null":
        return { value: null, type: "null" };
      default:
        return null;
    }
  }
  evaluateIdentifier(ident, ctx) {
    const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
    if (!symbol) return null;
    if (symbol.kind !== "Definition" /* Definition */ && symbol.kind !== "Variable" /* Variable */) {
      return null;
    }
    if (symbol.mutability.kind !== "Immutable") {
      return null;
    }
    if (symbol.metadata && typeof symbol.metadata === "object") {
      const metadata = symbol.metadata;
      if (metadata.initializer) {
        return this.evaluateExpression(metadata.initializer, ctx);
      }
    }
    return null;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── BINARY ──────────────────────────────┐
  evaluateBinary(binary, ctx) {
    const left = this.evaluateExpression(binary.left, ctx);
    const right = this.evaluateExpression(binary.right, ctx);
    if (!left || !right) return null;
    if (!this.areTypesCompatible(left.type, right.type, binary.kind)) {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `Cannot perform ${binary.kind} operation on incompatible types '${left.type}' and '${right.type}'`,
        binary.span
      );
      return null;
    }
    switch (binary.kind) {
      case "Additive":
        return this.evaluateAdditive(left, right, binary.operator, binary.span);
      case "Multiplicative":
        return this.evaluateMultiplicative(left, right, binary.operator, binary.span);
      case "Power":
        return this.evaluatePower(left, right, binary.span);
      case "Shift":
        return this.evaluateShift(left, right, binary.operator, binary.span);
      case "BitwiseAnd":
      case "BitwiseXor":
      case "BitwiseOr":
        return this.evaluateBitwise(left, right, binary.kind, binary.span);
      case "Relational":
      case "Equality":
        return this.evaluateComparison(left, right, binary.operator, binary.span);
      case "LogicalAnd":
      case "LogicalOr":
        return this.evaluateLogical(left, right, binary.kind, binary.span);
      default:
        return null;
    }
  }
  evaluateAdditive(left, right, op, span) {
    if (left.type === "bool" || right.type === "bool") {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `Cannot perform ${op === "+" ? "addition" : "subtraction"} on boolean type`,
        span
      );
      return null;
    }
    if (left.type === "float" || right.type === "float") {
      const l2 = this.toFloat(left);
      const r2 = this.toFloat(right);
      const result = op === "+" ? l2 + r2 : l2 - r2;
      if (!isFinite(result)) {
        this.reportError(
          "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
          `Float ${op === "+" ? "addition" : "subtraction"} overflow`,
          span
        );
        return null;
      }
      return { value: result, type: "float" };
    }
    const l = left.value;
    const r = right.value;
    try {
      const result = op === "+" ? l + r : l - r;
      if (result > this.MAX_INT_64 || result < this.MIN_INT_64) {
        this.reportError(
          "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
          `Integer ${op === "+" ? "addition" : "subtraction"} overflow: ${l} ${op} ${r} = ${result}`,
          span
        );
        return null;
      }
      return { value: result, type: "int" };
    } catch (e) {
      this.reportError(
        "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
        `Integer ${op === "+" ? "addition" : "subtraction"} overflow`,
        span
      );
      return null;
    }
  }
  evaluateMultiplicative(left, right, op, span) {
    if (left.type === "bool" || right.type === "bool") {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `Cannot perform multiplication/division on boolean type`,
        span
      );
      return null;
    }
    if (left.type === "float" || right.type === "float") {
      const l2 = this.toFloat(left);
      const r2 = this.toFloat(right);
      if ((op === "/" || op === "%") && r2 === 0) {
        this.reportError(
          "DIVISION_BY_ZERO" /* DIVISION_BY_ZERO */,
          `${op === "/" ? "Division" : "Modulo"} by zero in compile-time expression`,
          span
        );
        return null;
      }
      let result;
      switch (op) {
        case "*":
          result = l2 * r2;
          break;
        case "/":
          result = l2 / r2;
          break;
        case "%":
          result = l2 % r2;
          break;
        default:
          return null;
      }
      if (!isFinite(result)) {
        this.reportError(
          "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
          `Float ${op} overflow`,
          span
        );
        return null;
      }
      return { value: result, type: "float" };
    }
    const l = left.value;
    const r = right.value;
    if ((op === "/" || op === "%") && r === BigInt(0)) {
      this.reportError(
        "DIVISION_BY_ZERO" /* DIVISION_BY_ZERO */,
        `${op === "/" ? "Division" : "Modulo"} by zero in compile-time expression`,
        span
      );
      return null;
    }
    try {
      let result;
      switch (op) {
        case "*":
          result = l * r;
          break;
        case "/":
          result = l / r;
          break;
        case "%":
          result = l % r;
          break;
        default:
          return null;
      }
      if (result > this.MAX_INT_64 || result < this.MIN_INT_64) {
        this.reportError(
          "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
          `Integer ${op} overflow: ${l} ${op} ${r}`,
          span
        );
        return null;
      }
      return { value: result, type: "int" };
    } catch (e) {
      this.reportError(
        "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
        `Integer ${op} overflow`,
        span
      );
      return null;
    }
  }
  evaluatePower(left, right, span) {
    if (left.type === "float" || right.type === "float") {
      const l = this.toFloat(left);
      const r = this.toFloat(right);
      const result = Math.pow(l, r);
      if (!isFinite(result)) {
        this.reportError(
          "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
          "Float power overflow",
          span
        );
        return null;
      }
      return { value: result, type: "float" };
    }
    const base = left.value;
    const exp = right.value;
    if (exp < BigInt(0)) {
      this.reportError(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        "Negative exponent not allowed in compile-time integer expression",
        span
      );
      return null;
    }
    if (exp > BigInt(1e4)) {
      this.reportError(
        "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
        "Exponent too large for compile-time evaluation",
        span
      );
      return null;
    }
    try {
      const result = base ** exp;
      if (result > this.MAX_INT_64 || result < this.MIN_INT_64) {
        this.reportError(
          "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
          `Integer power overflow: ${base} ** ${exp}`,
          span
        );
        return null;
      }
      return { value: result, type: "int" };
    } catch (e) {
      this.reportError(
        "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
        "Integer power overflow",
        span
      );
      return null;
    }
  }
  evaluateShift(left, right, op, span) {
    if (left.type !== "int" || right.type !== "int") {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        "Shift operations require integer operands",
        span
      );
      return null;
    }
    const value = left.value;
    const shift = right.value;
    if (shift < BigInt(0)) {
      this.reportError(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        "Negative shift amount not allowed",
        span
      );
      return null;
    }
    if (shift > BigInt(63)) {
      this.reportError(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        "Shift amount too large (max 63 bits)",
        span
      );
      return null;
    }
    const shiftNum = Number(shift);
    const result = op === "<<" ? value << BigInt(shiftNum) : value >> BigInt(shiftNum);
    return { value: result, type: "int" };
  }
  evaluateBitwise(left, right, op, span) {
    if (left.type !== "int" || right.type !== "int") {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        "Bitwise operations require integer operands",
        span
      );
      return null;
    }
    const l = left.value;
    const r = right.value;
    let result;
    switch (op) {
      case "BitwiseAnd":
        result = l & r;
        break;
      case "BitwiseXor":
        result = l ^ r;
        break;
      case "BitwiseOr":
        result = l | r;
        break;
    }
    return { value: result, type: "int" };
  }
  evaluateComparison(left, right, op, span) {
    if (left.type === "null" || right.type === "null") {
      if (op === "==" || op === "!=") {
        const result = left.value === right.value === (op === "==");
        return { value: result, type: "bool" };
      }
      return null;
    }
    if (left.type === "float" || right.type === "float") {
      const l = this.toFloat(left);
      const r = this.toFloat(right);
      return { value: this.compare(l, r, op), type: "bool" };
    }
    if (left.type === "int" && right.type === "int") {
      const l = left.value;
      const r = right.value;
      return { value: this.compare(l, r, op), type: "bool" };
    }
    if (left.type === "bool" && right.type === "bool") {
      if (op === "==" || op === "!=") {
        const result = left.value === right.value === (op === "==");
        return { value: result, type: "bool" };
      }
    }
    return null;
  }
  evaluateLogical(left, right, op, span) {
    if (left.type !== "bool" || right.type !== "bool") {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        "Logical operations require boolean operands",
        span
      );
      return null;
    }
    const l = left.value;
    const r = right.value;
    const result = op === "LogicalAnd" ? l && r : l || r;
    return { value: result, type: "bool" };
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── PREFIX ──────────────────────────────┐
  evaluatePrefix(prefix, ctx) {
    const value = this.evaluateExpression(prefix.expr, ctx);
    if (!value) return null;
    switch (prefix.kind) {
      case "UnaryPlus":
        if (value.type !== "int" && value.type !== "float") {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Unary '+' requires numeric operand, got '${value.type}'`,
            prefix.span
          );
          return null;
        }
        return value;
      case "UnaryMinus":
        if (value.type !== "int" && value.type !== "float") {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Unary '-' requires numeric operand, got '${value.type}'`,
            prefix.span
          );
          return null;
        }
        if (value.type === "int") {
          const result = -value.value;
          if (result > this.MAX_INT_64 || result < this.MIN_INT_64) {
            this.reportError(
              "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
              "Integer negation overflow",
              prefix.span
            );
            return null;
          }
          return { value: result, type: "int" };
        }
        if (value.type === "float") {
          return { value: -value.value, type: "float" };
        }
        return null;
      case "LogicalNot":
        if (value.type !== "bool") {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Logical not requires boolean operand, got '${value.type}'`,
            prefix.span
          );
          return null;
        }
        return { value: !value.value, type: "bool" };
      case "BitwiseNot":
        if (value.type !== "int") {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Bitwise not requires integer operand, got '${value.type}'`,
            prefix.span
          );
          return null;
        }
        return { value: ~value.value, type: "int" };
      default:
        return null;
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────── SPECIAL EXPRESSIONS ─────────────────────┐
  evaluateAs(asNode, ctx) {
    const value = this.evaluateExpression(asNode.base, ctx);
    if (!value) return null;
    const targetType = asNode.type;
    if (value.type === "int" && this.isFloatType(targetType)) {
      return { value: Number(value.value), type: "float" };
    }
    if (value.type === "float" && this.isIntegerType(targetType)) {
      const intValue = BigInt(Math.trunc(value.value));
      if (intValue > this.MAX_INT_64 || intValue < this.MIN_INT_64) {
        this.reportError(
          "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
          "Float to integer conversion overflow",
          asNode.span
        );
        return null;
      }
      return { value: intValue, type: "int" };
    }
    return value;
  }
  evaluateSizeof(sizeofNode, ctx) {
    const type = sizeofNode.expr.getType();
    const size = this.computeTypeSize(type);
    return size !== null ? { value: BigInt(size), type: "int" } : null;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────── COMPTIME FUNCTION CALLS ────────────────────┐
  evaluateComptimeFunctionCall(call, ctx) {
    var _a, _b, _c;
    const functionSymbol = this.findCallTargetSymbol(call.base);
    if (!functionSymbol) {
      this.reportError(
        "UNDEFINED_IDENTIFIER" /* UNDEFINED_IDENTIFIER */,
        "Function not found in compile-time call",
        call.base.span
      );
      return null;
    }
    const isComptimeFunc = ((_a = functionSymbol.metadata) == null ? void 0 : _a.isComptimeFunction) === true;
    if (!isComptimeFunc) {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `Cannot call non-comptime function '${functionSymbol.name}' in compile-time context. Mark it with 'comptime' keyword.`,
        call.base.span
      );
      return null;
    }
    const cacheKey = this.createComptimeCacheKey(functionSymbol, call.args, ctx);
    const cached = this.comptimeResultCache.get(cacheKey);
    if (cached) {
      this.log(
        "verbose",
        `[Comptime] Using cached result for '${functionSymbol.name}': ${cached.value} (${cached.type})`
      );
      return cached;
    }
    const expectedParams = (_b = functionSymbol.metadata) == null ? void 0 : _b.comptimeParameters;
    const expectedCount = (expectedParams == null ? void 0 : expectedParams.length) || 0;
    if (call.args.length > expectedCount) {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `Comptime function '${functionSymbol.name}' expects at most ${expectedCount} argument(s), but got ${call.args.length}`,
        call.span
      );
      return null;
    }
    const body = (_c = functionSymbol.metadata) == null ? void 0 : _c.comptimeFunctionBody;
    if (!body) {
      this.reportError(
        "INTERNAL_ERROR" /* INTERNAL_ERROR */,
        `Comptime function '${functionSymbol.name}' has no body stored`,
        call.base.span
      );
      return null;
    }
    const parentScope = this.config.services.scopeManager.getScope(functionSymbol.scope);
    const functionScope = this.config.services.scopeManager.findChildScopeByNameFromId(
      functionSymbol.name,
      parentScope.id,
      "Function" /* Function */
    );
    if (!functionScope) {
      this.reportError(
        "INTERNAL_ERROR" /* INTERNAL_ERROR */,
        `Cannot find function scope for comptime function '${functionSymbol.name}'`,
        call.base.span
      );
      return null;
    }
    this.log(
      "verbose",
      `[Comptime] Evaluating function '${functionSymbol.name}' with ${call.args.length} argument(s) in scope ${functionScope.id}`
    );
    const evaluatedArgs = [];
    for (let i = 0; i < call.args.length; i++) {
      const argValue = this.evaluateExpression(call.args[i], ctx);
      if (!argValue) {
        this.reportError(
          "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
          `Could not evaluate argument ${i + 1} at compile time`,
          call.args[i].span
        );
        return null;
      }
      evaluatedArgs.push(argValue);
      this.log(
        "verbose",
        `[Comptime] Argument ${i + 1} evaluated to ${argValue.value} (${argValue.type})`
      );
    }
    if (expectedParams) {
      for (let i = call.args.length; i < expectedParams.length; i++) {
        const param = expectedParams[i];
        if (!param.initializer) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Comptime function '${functionSymbol.name}' requires ${expectedParams.length} argument(s), but got ${call.args.length}`,
            call.span
          );
          return null;
        }
        const defaultValue = this.evaluateExpression(param.initializer, ctx);
        if (!defaultValue) {
          this.reportError(
            "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
            `Could not evaluate default value for parameter '${param.ident.name}' at compile time`,
            param.initializer.span
          );
          return null;
        }
        evaluatedArgs.push(defaultValue);
        this.log(
          "verbose",
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
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        `Could not evaluate comptime function '${functionSymbol.name}' at compile time. Ensure it has a simple 'return <constant>' statement.`,
        call.base.span
      );
      return null;
    }
    this.comptimeResultCache.set(cacheKey, returnValue);
    this.log(
      "verbose",
      `[Comptime] Function '${functionSymbol.name}' returned ${returnValue.value} (${returnValue.type})`
    );
    return returnValue;
  }
  extractReturnValueFromComptimeFunction(body, ctx, functionScope, args = []) {
    if (!body) {
      return null;
    }
    const localVariables = /* @__PURE__ */ new Map();
    const paramSymbols = Array.from(functionScope.symbols.values());
    this.log(
      "verbose",
      `[Comptime] Found ${paramSymbols.length} parameters in scope`
    );
    for (let i = 0; i < args.length && i < paramSymbols.length; i++) {
      const paramName = paramSymbols[i].name;
      localVariables.set(paramName, args[i]);
      this.log(
        "verbose",
        `[Comptime] Bound parameter '${paramName}' = ${args[i].value} (${args[i].type})`
      );
    }
    this.log(
      "verbose",
      `[Comptime] localVariables has ${localVariables.size} entries: ${Array.from(localVariables.keys()).join(", ")}`
    );
    const processStatement = (stmt) => {
      if (stmt.kind === "Let") {
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
            this.log(
              "verbose",
              `[Comptime] Stored local variable '${letNode.field.ident.name}' = ${value.value} (${value.type})`
            );
          }
          return null;
        }
      }
      if (stmt.kind === "Return") {
        const returnNode = stmt.getCtrlflow();
        if (returnNode == null ? void 0 : returnNode.value) {
          return this.evaluateWithLocals(
            returnNode.value,
            ctx,
            functionScope,
            localVariables
          );
        }
      }
      if (stmt.kind === "Expression") {
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
    if (body.kind === "Block") {
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
  getParametersFromMetadata(functionScope) {
    const paramSymbols = Array.from(functionScope.symbols.values()).filter((s) => s.kind === "Parameter" /* Parameter */).sort((a, b) => a.contextSpan.start - b.contextSpan.start);
    return paramSymbols.map((s) => s.name);
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌────────────────────────── EVALUATE WITH LOCALS ──────────────────────┐
  evaluateWithLocals(expr, ctx, scope, locals) {
    try {
      switch (expr.kind) {
        case "Primary":
          return this.evaluatePrimaryWithLocals(expr.getPrimary(), ctx, scope, locals);
        case "Binary":
          return this.evaluateBinaryWithLocals(expr.getBinary(), ctx, scope, locals);
        case "Prefix":
          return this.evaluatePrefixWithLocals(expr.getPrefix(), ctx, scope, locals);
        case "Postfix": {
          const postfix = expr.getPostfix();
          if ((postfix == null ? void 0 : postfix.kind) === "Call") {
            return this.evaluateComptimeFunctionCall(postfix.getCall(), ctx);
          }
          return null;
        }
        case "As":
          return this.evaluateAsWithLocals(expr.getAs(), ctx, scope, locals);
        case "Sizeof":
          return this.evaluateSizeof(expr.getSizeof(), ctx);
        default:
          return null;
      }
    } catch (error) {
      this.reportError(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        `Error evaluating compile-time expression: ${error}`,
        expr.span
      );
      return null;
    }
  }
  evaluatePrimaryWithLocals(primary, ctx, scope, locals) {
    switch (primary.kind) {
      case "Literal":
        return this.evaluateLiteral(primary.getLiteral(), ctx);
      case "Ident":
        return this.evaluateIdentifierWithLocals(primary.getIdent(), ctx, scope, locals);
      case "Paren": {
        const paren = primary.getParen();
        return paren.source ? this.evaluateWithLocals(paren.source, ctx, scope, locals) : null;
      }
      default:
        return null;
    }
  }
  evaluateIdentifierWithLocals(ident, ctx, scope, locals) {
    const localValue = locals.get(ident.name);
    if (localValue) {
      this.log(
        "verbose",
        `[Comptime] Found local variable '${ident.name}' = ${localValue.value} (${localValue.type})`
      );
      return localValue;
    }
    this.log(
      "verbose",
      `[Comptime] Variable '${ident.name}' not in locals, checking scope...`
    );
    const scopeSymbol = scope.symbols.get(ident.name);
    if (scopeSymbol) {
      if (scopeSymbol.metadata && typeof scopeSymbol.metadata === "object") {
        const metadata = scopeSymbol.metadata;
        if (metadata.initializer) {
          return this.evaluateWithLocals(metadata.initializer, ctx, scope, locals);
        }
      }
    }
    return this.evaluateIdentifier(ident, ctx);
  }
  evaluateBinaryWithLocals(binary, ctx, scope, locals) {
    const left = this.evaluateWithLocals(binary.left, ctx, scope, locals);
    const right = this.evaluateWithLocals(binary.right, ctx, scope, locals);
    if (!left || !right) return null;
    if (!this.areTypesCompatible(left.type, right.type, binary.kind)) {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `Cannot perform ${binary.kind} operation on incompatible types '${left.type}' and '${right.type}'`,
        binary.span
      );
      return null;
    }
    switch (binary.kind) {
      case "Additive":
        return this.evaluateAdditive(left, right, binary.operator, binary.span);
      case "Multiplicative":
        return this.evaluateMultiplicative(left, right, binary.operator, binary.span);
      case "Power":
        return this.evaluatePower(left, right, binary.span);
      case "Shift":
        return this.evaluateShift(left, right, binary.operator, binary.span);
      case "BitwiseAnd":
      case "BitwiseXor":
      case "BitwiseOr":
        return this.evaluateBitwise(left, right, binary.kind, binary.span);
      case "Relational":
      case "Equality":
        return this.evaluateComparison(left, right, binary.operator, binary.span);
      case "LogicalAnd":
      case "LogicalOr":
        return this.evaluateLogical(left, right, binary.kind, binary.span);
      default:
        return null;
    }
  }
  evaluatePrefixWithLocals(prefix, ctx, scope, locals) {
    const value = this.evaluateWithLocals(prefix.expr, ctx, scope, locals);
    if (!value) return null;
    switch (prefix.kind) {
      case "UnaryPlus":
        if (value.type !== "int" && value.type !== "float") {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Unary '+' requires numeric operand, got '${value.type}'`,
            prefix.span
          );
          return null;
        }
        return value;
      case "UnaryMinus":
        if (value.type !== "int" && value.type !== "float") {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Unary '-' requires numeric operand, got '${value.type}'`,
            prefix.span
          );
          return null;
        }
        if (value.type === "int") {
          const result = -value.value;
          if (result > this.MAX_INT_64 || result < this.MIN_INT_64) {
            this.reportError(
              "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
              "Integer negation overflow",
              prefix.span
            );
            return null;
          }
          return { value: result, type: "int" };
        }
        if (value.type === "float") {
          return { value: -value.value, type: "float" };
        }
        return null;
      case "LogicalNot":
        if (value.type !== "bool") {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Logical not requires boolean operand, got '${value.type}'`,
            prefix.span
          );
          return null;
        }
        return { value: !value.value, type: "bool" };
      case "BitwiseNot":
        if (value.type !== "int") {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Bitwise not requires integer operand, got '${value.type}'`,
            prefix.span
          );
          return null;
        }
        return { value: ~value.value, type: "int" };
      default:
        return null;
    }
  }
  evaluateAsWithLocals(asNode, ctx, scope, locals) {
    const value = this.evaluateWithLocals(asNode.base, ctx, scope, locals);
    if (!value) return null;
    const targetType = asNode.type;
    if (value.type === "int" && this.isFloatType(targetType)) {
      return { value: Number(value.value), type: "float" };
    }
    if (value.type === "float" && this.isIntegerType(targetType)) {
      const intValue = BigInt(Math.trunc(value.value));
      if (intValue > this.MAX_INT_64 || intValue < this.MIN_INT_64) {
        this.reportError(
          "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
          "Float to integer conversion overflow",
          asNode.span
        );
        return null;
      }
      return { value: intValue, type: "int" };
    }
    return value;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── HELP ────────────────────────────────┐
  createComptimeCacheKey(functionSymbol, args, ctx) {
    let key = `${functionSymbol.name}:${functionSymbol.id}`;
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
  findCallTargetSymbol(baseExpr) {
    if (baseExpr.is("Primary")) {
      const primary = baseExpr.getPrimary();
      if (primary == null ? void 0 : primary.is("Ident")) {
        const ident = primary.getIdent();
        if (ident && !ident.builtin) {
          return this.config.services.scopeManager.lookupSymbol(ident.name);
        }
      }
    }
    return null;
  }
  areTypesCompatible(t1, t2, op) {
    if (t1 === t2) {
      if (t1 === "bool") {
        return op === "LogicalAnd" || op === "LogicalOr" || op === "Equality" || op === "Relational";
      }
      if (t1 === "null") {
        return op === "Equality" || op === "Relational";
      }
      return true;
    }
    if ((t1 === "int" || t1 === "float") && (t2 === "int" || t2 === "float")) {
      if (op === "BitwiseAnd" || op === "BitwiseXor" || op === "BitwiseOr" || op === "Shift") {
        return t1 === "int" && t2 === "int";
      }
      return true;
    }
    if (t1 === "bool" || t2 === "bool") {
      return false;
    }
    if (t1 === "null" || t2 === "null") {
      return op === "Equality";
    }
    return false;
  }
  toFloat(result) {
    if (result.type === "float") return result.value;
    if (result.type === "int") return Number(result.value);
    return 0;
  }
  compare(l, r, op) {
    switch (op) {
      case "==":
        return l === r;
      case "!=":
        return l !== r;
      case "<":
        return l < r;
      case "<=":
        return l <= r;
      case ">":
        return l > r;
      case ">=":
        return l >= r;
      default:
        return false;
    }
  }
  isFloatType(type) {
    return type.isFloat() || type.isComptimeFloat();
  }
  isIntegerType(type) {
    return type.isSigned() || type.isUnsigned() || type.isComptimeInt();
  }
  isFloatTargetType(type) {
    const unwrapped = this.unwrapType(type);
    return unwrapped.isFloat() || unwrapped.isComptimeFloat();
  }
  isIntegerTargetType(type) {
    const unwrapped = this.unwrapType(type);
    return unwrapped.isSigned() || unwrapped.isUnsigned() || unwrapped.isComptimeInt();
  }
  unwrapType(type) {
    let unwrapped = type;
    while (unwrapped.isOptional()) {
      unwrapped = unwrapped.getOptional().target;
    }
    if (unwrapped.isIdent()) {
      const ident = unwrapped.getIdent();
      if (!ident.builtin) {
        const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
        if (symbol && symbol.type) {
          return this.unwrapType(symbol.type);
        }
      }
    }
    return unwrapped;
  }
  getFloatBounds(type) {
    const unwrapped = this.unwrapType(type);
    if (unwrapped.isFloat()) {
      const width = unwrapped.getWidth();
      switch (width) {
        case 16:
          return { min: -65504, max: 65504 };
        case 32:
          return { min: -34028235e31, max: 34028235e31 };
        case 64:
          return { min: -17976931348623157e292, max: 17976931348623157e292 };
        case 128:
          return { min: -Number.MAX_VALUE, max: Number.MAX_VALUE };
        default:
          return { min: -Number.MAX_VALUE, max: Number.MAX_VALUE };
      }
    }
    return { min: -Number.MAX_VALUE, max: Number.MAX_VALUE };
  }
  getTypeBounds(type) {
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
  computeTypeSize(type) {
    switch (type.kind) {
      case "primitive": {
        const prim = type.getPrimitive();
        if (prim.width !== void 0) {
          return prim.width;
        }
        switch (prim.kind) {
          case "bool":
            return 1;
          case "void":
            return 0;
          default:
            return null;
        }
      }
      case "pointer":
        return 64;
      case "optional": {
        const inner = type.getOptional().target;
        const innerSize = this.computeTypeSize(inner);
        return innerSize !== null ? innerSize + 1 : null;
      }
      case "array": {
        const arr = type.getArray();
        const elemSize = this.computeTypeSize(arr.target);
        if (elemSize === null) return null;
        if (arr.size) {
          const sizeValue = this.extractIntegerValue(arr.size);
          if (sizeValue !== void 0) {
            return elemSize * sizeValue;
          }
        }
        return null;
      }
      case "tuple": {
        const tuple = type.getTuple();
        let totalSize = 0;
        for (const field of tuple.fields) {
          const fieldSize = this.computeTypeSize(field);
          if (fieldSize === null) return null;
          totalSize += fieldSize;
        }
        return totalSize;
      }
      case "struct": {
        const struct = type.getStruct();
        let totalSize = 0;
        for (const member of struct.members) {
          if (member.isField()) {
            const field = member.getField();
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
  extractIntegerValue(expr) {
    const comptimeValue = this.evaluateComptimeExpression(expr);
    if (comptimeValue === null) return void 0;
    if (comptimeValue > BigInt(Number.MAX_SAFE_INTEGER) || comptimeValue < BigInt(Number.MIN_SAFE_INTEGER)) {
      return void 0;
    }
    return Number(comptimeValue);
  }
  reportError(code, message, span) {
    this.config.services.diagnosticManager.reportError(code, message, span);
  }
  reportWarning(code, message, span) {
    this.config.services.diagnosticManager.reportWarning(code, message, span);
  }
  reportInfo(code, message, span) {
    this.config.services.diagnosticManager.reportInfo(code, message, span);
  }
  log(kind, msg) {
    var _a;
    (_a = this.config.services.debugManager) == null ? void 0 : _a.log(kind, msg);
  }
  // └──────────────────────────────────────────────────────────────────────┘
};

// lib/phases/TypeValidator.ts
var TypeValidator = class extends PhaseBase {
  constructor(config) {
    super("TypeValidation" /* TypeValidation */, config);
    // ┌──────────────────────────────── INIT ─────────────────────────────────┐
    this.stats = this.initStats();
    this.typeCtx = this.initTypeValidatorContext();
    this.inferenceStack = /* @__PURE__ */ new Set();
    this.circularTypeDetectionStack = /* @__PURE__ */ new Set();
    this.currentFunctionReturnType = null;
    this.hasReturnStatement = false;
    this.currentFunctionErrorType = null;
    this.hasThrowStatement = false;
    this.currentIsStaticMethod = false;
    this.currentStructScope = null;
    this.CACHE_MAX_SIZE = 1e4;
    this.ExpressionEvaluator = new ExpressionEvaluator(this.config);
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── MAIN ─────────────────────────────────┐
  handle() {
    try {
      this.log("verbose", "Starting symbol validation phase...");
      this.stats.startTime = Date.now();
      if (!this.init()) return false;
      if (!this.validateAllModules()) return false;
      this.logStatistics();
      return !this.config.services.diagnosticManager.hasErrors();
    } catch (error) {
      this.log("errors", `Fatal error during type validation: ${error}`);
      this.reportError("INTERNAL_ERROR" /* INTERNAL_ERROR */, `Fatal error during type validation: ${error}`);
      return false;
    }
  }
  reset() {
    this.inferenceStack.clear();
    this.circularTypeDetectionStack.clear();
    this.stats = this.initStats();
    this.typeCtx = this.initTypeValidatorContext();
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌────────────────────────── [1] Program Level ─────────────────────────┐
  validateAllModules() {
    this.log("verbose", "Validating types from all modules...");
    const globalScope = this.config.services.scopeManager.getCurrentScope();
    for (const [moduleName, module] of this.config.program.modules) {
      this.config.services.contextTracker.pushContextSpan({ start: 0, end: 0 });
      try {
        if (!this.validateModule(moduleName, module, globalScope)) {
          this.log("errors", `Failed to validate module ${moduleName}, continuing...`);
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
  validateModule(moduleName, module, parentScope) {
    var _a;
    this.log("symbols", `Validating module '${moduleName}'`);
    try {
      this.config.services.contextTracker.setModuleName(moduleName);
      if (typeof ((_a = module.metadata) == null ? void 0 : _a.path) === "string") {
        this.config.services.contextTracker.setModulePath(module.metadata.path);
      }
      this.enterModuleContext(moduleName, module);
      const moduleScope = this.findModuleScope(moduleName);
      if (!moduleScope) {
        this.reportError("MODULE_SCOPE_NOT_FOUND" /* MODULE_SCOPE_NOT_FOUND */, `Module scope for '${moduleName}' not found`);
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
      this.reportError("INTERNAL_ERROR" /* INTERNAL_ERROR */, `Failed to validate module '${moduleName}': ${error}`);
      return false;
    }
  }
  enterModuleContext(moduleName, module) {
    var _a;
    this.typeCtx.moduleStack.push(this.typeCtx.currentModule);
    this.typeCtx.currentModule = moduleName;
    this.config.services.contextTracker.setModuleName(moduleName);
    if (typeof ((_a = module.metadata) == null ? void 0 : _a.path) === "string") {
      this.config.services.contextTracker.setModulePath(module.metadata.path);
    }
  }
  exitModuleContext() {
    const previousModule = this.typeCtx.moduleStack.pop();
    this.typeCtx.currentModule = previousModule || "";
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── [3] Stmt Level ───────────────────────────┐
  validateStmt(stmt, currentScope, moduleName) {
    if (!currentScope) {
      currentScope = this.config.services.scopeManager.getCurrentScope();
    }
    if (!stmt) {
      this.reportError("ANALYSIS_ERROR" /* ANALYSIS_ERROR */, "Found null statement during validation");
      return;
    }
    this.log("verbose", `Validating ${stmt.kind} statement`);
    this.config.services.contextTracker.pushContextSpan(stmt.span);
    try {
      this.config.services.scopeManager.withScope(currentScope.id, () => {
        this.config.services.contextTracker.withSavedState(() => {
          this.config.services.contextTracker.setScope(currentScope.id);
          this.processStmtByKind(stmt, {
            "Block": (blockNode) => this.handleBlockStmt(blockNode, currentScope, moduleName),
            "Test": (testNode) => this.handleTestStmt(testNode, currentScope, moduleName),
            // 'Use'       : (useNode)   => this.handleUseStmt(useNode, currentScope, moduleName),
            "Def": (defNode) => this.handleDefStmt(defNode, currentScope, moduleName),
            "Let": (letNode) => this.handleLetStmt(letNode, currentScope, moduleName),
            "Func": (funcNode) => this.handleFuncStmt(funcNode, currentScope, moduleName),
            "Expression": (exprNode) => {
              const expr = stmt.getExpr();
              if (expr.kind === "Binary") {
                const binary = expr.getBinary();
                if (binary && binary.kind === "Assignment") {
                  this.validateAssignment(binary);
                }
              }
              this.inferExpressionType(expr);
            },
            // special cases
            "While": () => this.handleLoopStmt(stmt, currentScope, moduleName),
            "Do": () => this.handleLoopStmt(stmt, currentScope, moduleName),
            "For": () => this.handleLoopStmt(stmt, currentScope, moduleName),
            "Return": () => this.handleControlflowStmt(stmt, currentScope, moduleName),
            "Defer": () => this.handleControlflowStmt(stmt, currentScope, moduleName),
            "Throw": () => this.handleControlflowStmt(stmt, currentScope, moduleName)
          });
        });
      });
    } catch (error) {
      this.reportError(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        `Failed to validate ${stmt.kind} statement: ${error}`,
        stmt.span
      );
    } finally {
      this.config.services.contextTracker.popContextSpan();
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────── [3.1] BLOCK ─────────────────────────────┐
  handleBlockStmt(blockNode, scope, moduleName) {
    this.validateBlockStmt(blockNode);
  }
  validateBlockStmt(block, scope, moduleName) {
    this.log("symbols", "Validating block");
    const blockScope = this.config.services.scopeManager.findChildScopeByName("block", "Block" /* Block */);
    if (blockScope) {
      this.config.services.contextTracker.withSavedState(() => {
        this.config.services.contextTracker.setScope(blockScope.id);
        this.config.services.scopeManager.withScope(blockScope.id, () => {
          for (const stmt of block.stmts) {
            this.validateStmt(stmt, blockScope);
          }
        });
      });
    }
  }
  handleTestStmt(testNode, scope, moduleName) {
    this.validateBlockStmt(testNode.block, scope, moduleName);
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────────── [3.2] USE ──────────────────────────────┐
  // Skipped for now.
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────────── [3.3] DEF ──────────────────────────────┐
  handleDefStmt(defNode, scope, moduleName) {
    this.validateDefStmt(defNode);
  }
  validateDefStmt(defNode) {
    this.log("symbols", `Type checking definition '${defNode.ident.name}'`);
    const symbol = this.config.services.scopeManager.getSymbolInCurrentScope(defNode.ident.name);
    if (!symbol) return;
    if (defNode.type) {
      if (!this.checkCircularTypeDependency(defNode.type, defNode.ident.name, true)) {
        this.resolveTypeNode(defNode.type);
      }
    }
    symbol.isTypeChecked = true;
    symbol.type = defNode.type;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────────── [3.4] LET ──────────────────────────────┐
  handleLetStmt(letNode, scope, moduleName) {
    this.validateLetStmt(letNode);
  }
  validateArrayLiteralWithTargetType(initExpr, targetType, contextName) {
    if (!initExpr.is("Primary")) return true;
    const primary = initExpr.getPrimary();
    if (!(primary == null ? void 0 : primary.is("Literal"))) return true;
    const literal = primary.getLiteral();
    if ((literal == null ? void 0 : literal.kind) !== "Array") return true;
    const elements = literal.value;
    if (!targetType.isArray()) return true;
    const targetArray = targetType.getArray();
    const targetElementType = targetArray.target;
    if (targetArray.size) {
      const targetSize = this.ExpressionEvaluator.extractIntegerValue(targetArray.size);
      const sourceSize = elements.length;
      if (targetSize !== void 0 && targetSize !== sourceSize) {
        const msg = sourceSize > targetSize ? `Array literal has more elements than the fixed array type` : `Array literal has fewer elements than the fixed array type`;
        this.reportError(
          "ARRAY_SIZE_MISMATCH" /* ARRAY_SIZE_MISMATCH */,
          msg,
          initExpr.span
        );
        return false;
      }
    }
    if (elements.length === 0) return true;
    for (let i = 0; i < elements.length; i++) {
      if (!this.validateTypeAssignment(
        elements[i],
        targetElementType,
        `Array element ${i} in '${contextName}'`
      )) {
        continue;
      }
      const elemType = this.inferExpressionType(elements[i]);
      if (!elemType || !this.isTypeCompatible(targetElementType, elemType)) {
        this.reportError(
          "TYPE_MISMATCH" /* TYPE_MISMATCH */,
          `Array element ${i} has type '${elemType ? this.getTypeDisplayName(elemType) : "unknown"}' which is not compatible with target element type '${this.getTypeDisplayName(targetElementType)}'`,
          elements[i].span
        );
      }
    }
    return true;
  }
  validateLetStmt(letNode) {
    this.log("symbols", `Type checking variable '${letNode.field.ident.name}'`);
    const symbol = this.config.services.scopeManager.getSymbolInCurrentScope(letNode.field.ident.name);
    if (!symbol) return;
    const currentScope = this.config.services.scopeManager.getCurrentScope();
    if (letNode.field.visibility.kind === "Static") {
      const currentScope2 = this.config.services.scopeManager.getCurrentScope();
      if (currentScope2.kind !== "Type" /* Type */) {
        this.reportError(
          "INVALID_VISIBILITY" /* INVALID_VISIBILITY */,
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
      initType = this.extractTypeFromInitializer(letNode.field.initializer);
      if (initType && (initType.isStruct() || initType.isEnum())) {
        if (initType.isStruct()) {
          this.validateStructType(initType.getStruct(), symbol);
        }
        symbol.type = initType;
        symbol.isTypeChecked = true;
        return;
      }
    }
    let structTypeToValidate = null;
    let objectNodeToValidate = null;
    if (letNode.field.initializer) {
      if (letNode.field.type) {
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
    } else if (letNode.field.initializer && !letNode.field.type) {
      if (letNode.field.initializer.is("Primary")) {
        const primary = letNode.field.initializer.getPrimary();
        if (primary && primary.is("Object")) {
          const obj = primary.getObject();
          if (obj.ident) {
            const typeSymbol = this.config.services.scopeManager.lookupSymbol(obj.ident.name);
            if (typeSymbol && typeSymbol.type) {
              let actualType = this.resolveIdentifierType(typeSymbol.type);
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
      this.validateStructConstruction(objectNodeToValidate, structTypeToValidate, letNode.field.initializer.span);
      symbol.isTypeChecked = true;
      this.stats.typesInferred++;
      return;
    }
    if (letNode.field.initializer) {
      if (letNode.field.type && letNode.field.type.isArray()) {
        this.validateArrayLiteralWithTargetType(
          letNode.field.initializer,
          letNode.field.type,
          letNode.field.ident.name
        );
        symbol.type = letNode.field.type;
        symbol.isTypeChecked = true;
        this.stats.typesInferred++;
        return;
      }
      const initType2 = this.inferExpressionType(letNode.field.initializer);
      if (initType2) {
        if (!letNode.field.type) {
          letNode.field.type = initType2;
          symbol.type = initType2;
          this.stats.typesInferred++;
        } else {
          if (!this.validateArrayAssignment(
            letNode.field.type,
            initType2,
            letNode.field.initializer.span,
            `Variable '${letNode.field.ident.name}'`
          )) {
            symbol.isTypeChecked = true;
            return;
          }
          if (!this.isTypeCompatible(letNode.field.type, initType2, letNode.field.initializer)) {
            this.reportError(
              "TYPE_MISMATCH" /* TYPE_MISMATCH */,
              `Cannot assign type '${this.getTypeDisplayName(initType2)}' to variable of type '${this.getTypeDisplayName(letNode.field.type)}'`,
              letNode.field.initializer.span
            );
          }
        }
      }
    } else if (!letNode.field.type) {
      this.reportError(
        "CANNOT_INFER_TYPE" /* CANNOT_INFER_TYPE */,
        `Variable '${letNode.field.ident.name}' requires explicit type or initializer`,
        letNode.field.span
      );
    }
    symbol.isTypeChecked = true;
  }
  isPointerDereference(expr) {
    if (!expr.is("Postfix")) return false;
    const postfix = expr.getPostfix();
    return (postfix == null ? void 0 : postfix.kind) === "Dereference";
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────────── [3.5] FUNC ─────────────────────────────┐
  handleFuncStmt(funcNode, scope, moduleName) {
    this.validateFuncStmt(funcNode);
  }
  validateFuncStmt(funcNode) {
    var _a, _b;
    this.log("symbols", `Type checking function '${funcNode.ident.name}'`);
    const funcSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(funcNode.ident.name);
    if (!funcSymbol) {
      this.reportError(
        "CANNOT_INFER_TYPE" /* CANNOT_INFER_TYPE */,
        `Function '${funcNode.ident.name}' symbol not found`,
        funcNode.span
      );
      return;
    }
    const funcScope = this.config.services.scopeManager.findChildScopeByName(funcNode.ident.name, "Function" /* Function */);
    if (!funcScope) {
      this.reportError(
        "CANNOT_INFER_TYPE" /* CANNOT_INFER_TYPE */,
        `Function scope for '${funcNode.ident.name}' not found`,
        funcNode.span
      );
      return;
    }
    const funcSymbolScope = this.config.services.scopeManager.getScope(funcSymbol.scope);
    const parentScope = funcSymbolScope.kind === "Type" /* Type */ && ((_a = funcSymbolScope.metadata) == null ? void 0 : _a.typeKind) === "Struct" ? funcSymbolScope : null;
    const isStaticMethod = parentScope !== null && funcNode.visibility.kind === "Static";
    const isInstanceMethod = parentScope !== null && !(funcNode.visibility.kind === "Static");
    const previousIsStaticMethod = this.currentIsStaticMethod;
    const previousStructScope = this.currentStructScope;
    this.currentIsStaticMethod = isStaticMethod;
    this.currentStructScope = isStaticMethod || isInstanceMethod ? parentScope : null;
    this.log("symbols", `Function '${funcNode.ident.name}': isStatic=${isStaticMethod}, isInstance=${isInstanceMethod}, structScope=${((_b = this.currentStructScope) == null ? void 0 : _b.name) || "none"}`);
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
          var _a2, _b2, _c, _d;
          if (isInstanceMethod) {
            this.resolveSelfParameter(funcScope, parentScope);
          }
          for (const param of funcNode.parameters) {
            this.validateParameter(param);
          }
          const paramTypes = [];
          for (const param of funcNode.parameters) {
            if (param.type) {
              paramTypes.push(param.type);
            } else {
              const paramSymbol = funcScope.symbols.get(param.ident.name);
              if (paramSymbol == null ? void 0 : paramSymbol.type) {
                paramTypes.push(paramSymbol.type);
              } else {
                this.reportError(
                  "CANNOT_INFER_TYPE" /* CANNOT_INFER_TYPE */,
                  `Cannot infer type for parameter '${param.ident.name}'`,
                  param.span
                );
                paramTypes.push(AST4.TypeNode.asUndefined(param.span));
              }
            }
          }
          funcSymbol.type = AST4.TypeNode.asFunction(
            funcNode.span,
            paramTypes,
            (_b2 = (_a2 = funcNode.returnType) != null ? _a2 : this.currentFunctionReturnType) != null ? _b2 : void 0
          );
          funcSymbol.metadata.errorType = (_d = (_c = funcNode.errorType) != null ? _c : this.currentFunctionErrorType) != null ? _d : void 0;
          if (funcNode.body) {
            this.validateStmt(funcNode.body);
            const expectedReturnType = funcNode.returnType || this.currentFunctionReturnType;
            if (expectedReturnType && !expectedReturnType.isVoid()) {
              const hasErrorType = funcNode.errorType || this.currentFunctionErrorType;
              if (!this.hasReturnStatement) {
                if (!hasErrorType || !this.hasThrowStatement) {
                  this.reportError(
                    "MISSING_RETURN_STATEMENT" /* MISSING_RETURN_STATEMENT */,
                    `Function '${funcNode.ident.name}' with non-void return type must have at least one return statement`,
                    funcNode.ident.span
                  );
                }
              }
            }
            if (!funcNode.returnType) {
              if (this.currentFunctionReturnType) {
                funcSymbol.type.getFunction().returnType = this.currentFunctionReturnType;
              } else {
                funcSymbol.type.getFunction().returnType = AST4.TypeNode.asVoid(funcNode.span);
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
      this.currentIsStaticMethod = previousIsStaticMethod;
      this.currentStructScope = previousStructScope;
      this.currentFunctionReturnType = previousReturnType;
      this.hasReturnStatement = previousHasReturnStmt;
      this.currentFunctionErrorType = previousErrorType;
      this.hasThrowStatement = previousHasThrowStmt;
    }
    funcSymbol.isTypeChecked = true;
  }
  // ───── PARAMS ─────
  validateParameter(paramNode) {
    const paramSymbol = this.config.services.scopeManager.getSymbolInCurrentScope(paramNode.ident.name);
    if (!paramSymbol) return;
    if (paramNode.visibility.kind === "Static") {
      this.reportError(
        "INVALID_VISIBILITY" /* INVALID_VISIBILITY */,
        `Parameter '${paramNode.ident.name}' cannot be 'static'`,
        paramNode.ident.span
      );
      return;
    } else if (paramNode.visibility.kind === "Public") {
      this.reportError(
        "INVALID_VISIBILITY" /* INVALID_VISIBILITY */,
        `Parameter '${paramNode.ident.name}' cannot be 'public'`,
        paramNode.ident.span
      );
      return;
    }
    if (paramNode.initializer) {
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
      const initType = this.inferExpressionType(paramNode.initializer);
      if (initType) {
        if (!paramNode.type) {
          paramNode.type = initType;
          paramSymbol.type = initType;
          this.stats.typesInferred++;
        } else {
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
          if (!this.isTypeCompatible(paramNode.type, initType, paramNode.initializer)) {
            this.reportError(
              "TYPE_MISMATCH" /* TYPE_MISMATCH */,
              `Cannot assign type '${this.getTypeDisplayName(initType)}' to parameter of type '${this.getTypeDisplayName(paramNode.type)}'`,
              paramNode.initializer.span
            );
          }
        }
      }
      if (paramNode.type) {
        this.validateValueFitsInType(paramNode.initializer, paramNode.type);
      }
    }
    paramSymbol.isTypeChecked = true;
  }
  resolveSelfParameter(funcScope, structScope) {
    const selfSymbol = funcScope.symbols.get("self");
    if (!selfSymbol) {
      this.log("verbose", `Warning: Expected 'self' parameter in struct method but not found`);
      return;
    }
    selfSymbol.declared = true;
    selfSymbol.used = true;
    if (selfSymbol.type) {
      if (selfSymbol.type.kind === "ident") {
        const typeIdent = selfSymbol.type.getIdent();
        if (typeIdent.name !== structScope.name) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Self type mismatch: expected '${structScope.name}', got '${typeIdent.name}'`,
            selfSymbol.contextSpan
          );
        }
      }
    }
    this.log("symbols", `Resolved 'self' parameter in struct method`);
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────────── [3.6] LOOP ─────────────────────────────┐
  handleLoopStmt(stmt, scope, moduleName) {
    if (stmt.getLoop === void 0) {
      const data = stmt;
      switch (stmt.kind) {
        case "While": {
          const src = data.source;
          const loop = AST4.LoopStmtNode.createWhile(data.span, src.expr, src.stmt);
          this.validateLoopStmt(loop);
          break;
        }
        case "Do": {
          const src = data.source;
          const loop = AST4.LoopStmtNode.createDo(data.span, src.expr, src.stmt);
          this.validateLoopStmt(loop);
          break;
        }
        case "For": {
          const src = data.source;
          const loop = AST4.LoopStmtNode.createFor(data.span, src.expr, src.stmt);
          this.validateLoopStmt(loop);
          break;
        }
      }
    } else {
      this.validateLoopStmt(stmt.getLoop());
    }
  }
  validateLoopStmt(loopStmt) {
    const loopScope = this.config.services.scopeManager.findChildScopeByName("loop", "Loop" /* Loop */);
    if (!loopScope) return;
    this.config.services.contextTracker.withSavedState(() => {
      this.config.services.scopeManager.withScope(loopScope.id, () => {
        if (loopStmt.expr) {
          const condType = this.inferExpressionType(loopStmt.expr);
          if (loopStmt.kind === "While" && condType && !condType.isBool()) {
            this.log("verbose", `Loop condition has type ${this.getTypeDisplayName(condType)}, not bool`);
          }
        }
        if (loopStmt.stmt) {
          this.validateStmt(loopStmt.stmt);
        }
      });
    });
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────── [3.7] CTRLFLOW ──────────────────────────┐
  handleControlflowStmt(stmt, scope, moduleName) {
    if (stmt.getCtrlflow === void 0) {
      const data = stmt;
      switch (stmt.kind) {
        case "Return": {
          const src = data.source;
          const res = AST4.ControlFlowStmtNode.asReturn(data.span, src.value);
          this.validateReturnStmt(res);
          break;
        }
        case "Defer": {
          const src = data.source;
          const res = AST4.ControlFlowStmtNode.asDefer(data.span, src.value);
          this.validateDeferStmt(res);
          break;
        }
        case "Throw": {
          const src = data.source;
          const res = AST4.ControlFlowStmtNode.asThrow(data.span, src.value);
          this.validateThrowStmt(res);
          break;
        }
      }
    } else {
      switch (stmt.getCtrlflow().kind) {
        case "return": {
          this.validateReturnStmt(stmt.getCtrlflow());
          break;
        }
        case "defer": {
          this.validateDeferStmt(stmt.getCtrlflow());
          break;
        }
        case "throw": {
          this.validateThrowStmt(stmt.getCtrlflow());
          break;
        }
      }
    }
  }
  validateReturnStmt(returnNode) {
    this.log("symbols", "Validating return statement");
    this.stats.returnsValidated++;
    this.hasReturnStatement = true;
    const isInFunction = this.isInsideFunctionScope();
    if (returnNode.value) {
      const isConstructor = this.isConstructorExpression(returnNode.value);
      if (!isConstructor && this.isTypeExpression(returnNode.value)) {
        const functionReturnsType = this.currentFunctionReturnType && this.isTypeType(this.currentFunctionReturnType);
        if (!functionReturnsType) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Cannot return a type as a value. Expected a value of type '${this.currentFunctionReturnType ? this.getTypeDisplayName(this.currentFunctionReturnType) : "void"}', got type expression`,
            returnNode.value.span
          );
          return;
        }
      }
      if (isInFunction && this.currentFunctionReturnType) {
        if (!this.validateTypeAssignment(
          returnNode.value,
          this.currentFunctionReturnType,
          "Return value"
        )) {
          return;
        }
      }
      const returnType = this.inferExpressionType(returnNode.value);
      if (!returnType && this.config.services.diagnosticManager.hasErrors()) {
        return;
      }
      if (isInFunction && this.currentFunctionReturnType) {
        if (returnType && !this.isTypeCompatible(this.currentFunctionReturnType, returnType, returnNode.value)) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Return type '${this.getTypeDisplayName(returnType)}' doesn't match function return type '${this.getTypeDisplayName(this.currentFunctionReturnType)}'`,
            returnNode.value.span
          );
        }
      } else if (!isInFunction) {
        this.reportError(
          "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
          `Return statement outside of function`,
          returnNode.span
        );
      }
    } else {
      if (isInFunction && this.currentFunctionReturnType && !this.currentFunctionReturnType.isVoid()) {
        this.reportError(
          "TYPE_MISMATCH" /* TYPE_MISMATCH */,
          `Function expects return type '${this.getTypeDisplayName(this.currentFunctionReturnType)}' but got void return`,
          returnNode.span
        );
      } else if (!isInFunction) {
        this.reportError(
          "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
          `Return statement outside of function`,
          returnNode.span
        );
      }
    }
  }
  isConstructorExpression(expr) {
    if (!expr.is("Primary")) return false;
    const primary = expr.getPrimary();
    if (!(primary == null ? void 0 : primary.is("Object"))) return false;
    const obj = primary.getObject();
    return (obj == null ? void 0 : obj.ident) !== null && (obj == null ? void 0 : obj.ident) !== void 0;
  }
  validateDeferStmt(deferNode) {
    const isInFunction = this.isInsideFunctionScope();
    if (deferNode.value) {
      this.inferExpressionType(deferNode.value);
    }
    if (!isInFunction) {
      this.reportError(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        `Defer statement outside of function`,
        deferNode.span
      );
    }
  }
  validateThrowStmt(throwNode) {
    this.log("symbols", "Validating throw statement");
    this.hasThrowStatement = true;
    const isInFunction = this.isInsideFunctionScope();
    if (!isInFunction) {
      this.reportError(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        `Throw statement outside of function`,
        throwNode.span
      );
      return;
    }
    const functionErrorType = this.getCurrentFunctionErrorType();
    if (!functionErrorType) {
      this.reportError(
        "THROW_WITHOUT_ERROR_TYPE" /* THROW_WITHOUT_ERROR_TYPE */,
        `Cannot throw error in function without error type. Add '!ErrorType' to function signature`,
        throwNode.span
      );
      return;
    }
    if (throwNode.value) {
      const thrownType = this.inferExpressionType(throwNode.value);
      if (!thrownType) {
        this.validateThrowExpression(throwNode.value, functionErrorType, throwNode.value.span);
        return;
      }
      this.validateThrowType(thrownType, functionErrorType, throwNode.value, throwNode.value.span);
    } else {
      this.reportError(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        `Throw statement must have an error value`,
        throwNode.span
      );
    }
  }
  validateThrowExpression(throwExpr, functionErrorType, span) {
    var _a, _b;
    const funcSymbol = this.getCurrentFunctionSymbol();
    const errorMode = (_a = funcSymbol == null ? void 0 : funcSymbol.metadata) == null ? void 0 : _a.errorMode;
    this.log("symbols", `Validating throw expression with error mode: ${errorMode || "unknown"}`);
    switch (errorMode) {
      case "any-error":
        if (!this.isErrorExpression(throwExpr)) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Cannot throw non-error type. Expected error type`,
            span
          );
        }
        break;
      case "err-ident":
      case "err-group":
        if (!this.isValidErrorExpression(throwExpr, functionErrorType)) {
          this.reportError(
            "THROW_TYPE_MISMATCH" /* THROW_TYPE_MISMATCH */,
            `Thrown error does not match function error type '${this.getTypeDisplayName(functionErrorType)}'`,
            span
          );
        }
        break;
      case "self-group":
        const errorName = this.extractErrorMemberName(throwExpr);
        const allowedErrors = (_b = funcSymbol == null ? void 0 : funcSymbol.metadata) == null ? void 0 : _b.selfGroupErrors;
        if (!errorName) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Cannot resolve error member from thrown expression`,
            span
          );
        } else if (!allowedErrors || !allowedErrors.includes(errorName)) {
          this.reportError(
            "ERROR_MEMBER_NOT_FOUND" /* ERROR_MEMBER_NOT_FOUND */,
            `Error '${errorName}' is not in function's error set [${(allowedErrors == null ? void 0 : allowedErrors.join(", ")) || ""}]`,
            span
          );
        }
        break;
      default:
        this.log("verbose", `Unknown error mode in validateThrowExpression`);
        if (!this.isErrorExpression(throwExpr)) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Cannot throw non-error type`,
            span
          );
        }
    }
  }
  isErrorExpression(expr) {
    var _a, _b, _c, _d;
    if (expr.is("Postfix")) {
      const postfix = expr.getPostfix();
      if ((postfix == null ? void 0 : postfix.kind) === "MemberAccess") {
        const memberAccess = postfix.getMemberAccess();
        if (memberAccess.base.is("Primary")) {
          const primary = memberAccess.base.getPrimary();
          if (primary == null ? void 0 : primary.is("Ident")) {
            const ident = primary.getIdent();
            const baseSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
            if (ident.name === "selferr") return true;
            if ((_a = baseSymbol == null ? void 0 : baseSymbol.type) == null ? void 0 : _a.isErrset()) return true;
            if ((baseSymbol == null ? void 0 : baseSymbol.kind) === "Definition" /* Definition */ && ((_b = baseSymbol.type) == null ? void 0 : _b.isErrset())) return true;
          }
        }
        return true;
      }
    }
    if (expr.is("Primary")) {
      const primary = expr.getPrimary();
      if (primary == null ? void 0 : primary.is("Ident")) {
        const ident = primary.getIdent();
        const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
        if ((symbol == null ? void 0 : symbol.kind) === "Variable" /* Variable */ && ((_c = symbol.type) == null ? void 0 : _c.isErr())) return true;
        if ((symbol == null ? void 0 : symbol.kind) === "Error" /* Error */) return true;
        if ((_d = symbol == null ? void 0 : symbol.type) == null ? void 0 : _d.isErrset()) return true;
      }
    }
    return false;
  }
  isValidErrorExpression(expr, expectedType) {
    if (expr.is("Postfix")) {
      const postfix = expr.getPostfix();
      if ((postfix == null ? void 0 : postfix.kind) === "MemberAccess") {
        const memberAccess = postfix.getMemberAccess();
        if (memberAccess.base.is("Primary")) {
          const primary = memberAccess.base.getPrimary();
          if (primary == null ? void 0 : primary.is("Ident")) {
            const ident = primary.getIdent();
            if (expectedType.isIdent()) {
              const expectedIdent = expectedType.getIdent();
              return ident.name === expectedIdent.name;
            }
            const baseSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
            if (baseSymbol == null ? void 0 : baseSymbol.type) {
              const resolvedExpected = this.resolveIdentifierType(expectedType);
              return this.isSameType(baseSymbol.type, resolvedExpected);
            }
          }
        }
      }
    }
    if (expr.is("Primary")) {
      const primary = expr.getPrimary();
      if (primary == null ? void 0 : primary.is("Ident")) {
        const ident = primary.getIdent();
        if (expectedType.isIdent()) {
          const expectedIdent = expectedType.getIdent();
          return ident.name === expectedIdent.name;
        }
      }
    }
    return true;
  }
  validateThrowType(thrownType, functionErrorType, throwExpr, span) {
    var _a, _b;
    const funcSymbol = this.getCurrentFunctionSymbol();
    const errorMode = (_a = funcSymbol == null ? void 0 : funcSymbol.metadata) == null ? void 0 : _a.errorMode;
    this.log("symbols", `Validating throw with error mode: ${errorMode || "unknown"}`);
    switch (errorMode) {
      case "any-error":
        if (!this.isErrorType(thrownType)) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Cannot throw non-error type '${this.getTypeDisplayName(thrownType)}'. Expected error type`,
            span
          );
        }
        break;
      case "err-ident":
      case "err-group": {
        if (throwExpr.is("Primary")) {
          const primary = throwExpr.getPrimary();
          if (primary == null ? void 0 : primary.is("Ident")) {
            const thrownIdent = primary.getIdent().name;
            if (functionErrorType.isIdent()) {
              const funcIdent = functionErrorType.getIdent().name;
              if (thrownIdent === funcIdent) {
                break;
              }
            }
          }
        }
        let thrownErrorName = "";
        let thrownErrorSet = null;
        if (throwExpr.is("Primary")) {
          const primary = throwExpr.getPrimary();
          if (primary == null ? void 0 : primary.is("Ident")) {
            const thrownIdent = primary.getIdent().name;
            thrownErrorName = thrownIdent;
            const thrownSymbol = this.config.services.scopeManager.lookupSymbol(thrownIdent);
            if (thrownSymbol && thrownSymbol.type) {
              thrownErrorSet = this.resolveIdentifierType(thrownSymbol.type);
            }
          }
        }
        if (throwExpr.is("Postfix")) {
          const postfix = throwExpr.getPostfix();
          if ((postfix == null ? void 0 : postfix.kind) === "MemberAccess") {
            const memberAccess = postfix.getMemberAccess();
            thrownErrorName = this.extractMemberName(memberAccess.target) || "";
            const baseType = this.inferExpressionType(memberAccess.base);
            if (baseType) {
              thrownErrorSet = this.resolveIdentifierType(baseType);
            }
          }
        }
        const resolvedFunctionError = this.resolveIdentifierType(functionErrorType);
        if ((thrownErrorSet == null ? void 0 : thrownErrorSet.isErrset()) && resolvedFunctionError.isErrset()) {
          const thrownSet = thrownErrorSet.getErrset();
          const expectedSet = resolvedFunctionError.getErrset();
          if (this.isSameErrorType(thrownErrorSet, resolvedFunctionError)) {
            break;
          }
          if (thrownErrorName) {
            const isMember = expectedSet.members.some((m) => m.name === thrownErrorName);
            if (isMember) {
              break;
            }
          }
          this.reportError(
            "THROW_TYPE_MISMATCH" /* THROW_TYPE_MISMATCH */,
            `Thrown error type '${thrownErrorName || this.getTypeDisplayName(thrownType)}' is not compatible with function error type '${this.getTypeDisplayName(functionErrorType)}'`,
            span
          );
          break;
        }
        if (resolvedFunctionError.isErrset()) {
          const expectedSet = resolvedFunctionError.getErrset();
          if (thrownErrorName) {
            const isMember = expectedSet.members.some((m) => m.name === thrownErrorName);
            if (isMember) {
              break;
            }
          }
          this.reportError(
            "THROW_TYPE_MISMATCH" /* THROW_TYPE_MISMATCH */,
            `Thrown error type '${thrownErrorName || this.getTypeDisplayName(thrownType)}' is not compatible with function error type '${this.getTypeDisplayName(functionErrorType)}'`,
            span
          );
          break;
        }
        this.reportError(
          "THROW_TYPE_MISMATCH" /* THROW_TYPE_MISMATCH */,
          `Thrown error type '${thrownErrorName || this.getTypeDisplayName(thrownType)}' is not compatible with function error type '${this.getTypeDisplayName(functionErrorType)}'`,
          span
        );
        break;
      }
      case "self-group":
        const errorName = this.extractErrorMemberName(throwExpr);
        const allowedErrors = (_b = funcSymbol == null ? void 0 : funcSymbol.metadata) == null ? void 0 : _b.selfGroupErrors;
        if (!errorName) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Cannot resolve error member from thrown expression`,
            span
          );
        } else if (!allowedErrors || !allowedErrors.includes(errorName)) {
          this.reportError(
            "ERROR_MEMBER_NOT_FOUND" /* ERROR_MEMBER_NOT_FOUND */,
            `Error '${errorName}' is not in function's error set [${(allowedErrors == null ? void 0 : allowedErrors.join(", ")) || ""}]`,
            span
          );
        }
        break;
      default:
        this.log("verbose", `Unknown error mode, falling back to legacy validation`);
        if (functionErrorType.isErr()) {
          if (!this.isErrorType(thrownType)) {
            this.reportError(
              "TYPE_MISMATCH" /* TYPE_MISMATCH */,
              `Cannot throw non-error type`,
              span
            );
          }
        } else {
          const resolvedFunctionError = this.resolveIdentifierType(functionErrorType);
          const resolvedThrownType = this.resolveIdentifierType(thrownType);
          if (!this.isValidThrowType(resolvedThrownType, resolvedFunctionError, span)) {
            this.reportError(
              "THROW_TYPE_MISMATCH" /* THROW_TYPE_MISMATCH */,
              `Thrown error type is not compatible with function error type`,
              span
            );
          }
        }
    }
  }
  isSameErrorType(type1, type2) {
    const resolved1 = this.resolveIdentifierType(type1);
    const resolved2 = this.resolveIdentifierType(type2);
    if (resolved1.isErrset() && resolved2.isErrset()) {
      const set1 = resolved1.getErrset();
      const set2 = resolved2.getErrset();
      if (set1.members.length !== set2.members.length) return false;
      const members1 = new Set(set1.members.map((m) => m.name));
      const members2 = new Set(set2.members.map((m) => m.name));
      for (const member of members1) {
        if (!members2.has(member)) return false;
      }
      return true;
    }
    if (resolved1.isErr() && resolved2.isErr()) {
      const prim1 = resolved1.getPrimitive();
      const prim2 = resolved2.getPrimitive();
      return (prim1 == null ? void 0 : prim1.text) === (prim2 == null ? void 0 : prim2.text);
    }
    if (resolved1.isIdent() && resolved2.isIdent()) {
      return resolved1.getIdent().name === resolved2.getIdent().name;
    }
    return this.isSameType(resolved1, resolved2);
  }
  getCurrentFunctionSymbol() {
    let currentScope = this.config.services.scopeManager.getCurrentScope();
    while (currentScope && currentScope.kind !== "Function" /* Function */) {
      const parent = this.config.services.scopeManager.getScopeParent(currentScope.id);
      if (!parent) break;
      currentScope = parent;
    }
    if (!currentScope || currentScope.kind !== "Function" /* Function */) {
      return null;
    }
    const parentScope = this.config.services.scopeManager.getScopeParent(currentScope.id);
    if (!parentScope) return null;
    return parentScope.symbols.get(currentScope.name) || null;
  }
  extractErrorMemberName(thrownExpr) {
    if (thrownExpr.is("Primary")) {
      const primary = thrownExpr.getPrimary();
      if (primary == null ? void 0 : primary.is("Ident")) {
        return primary.getIdent().name;
      }
    }
    if (thrownExpr.is("Postfix")) {
      const postfix = thrownExpr.getPostfix();
      if ((postfix == null ? void 0 : postfix.kind) === "MemberAccess") {
        const memberAccess = postfix.getMemberAccess();
        if (memberAccess.base.is("Primary")) {
          const primary = memberAccess.base.getPrimary();
          if (primary == null ? void 0 : primary.is("Ident")) {
            const ident = primary.getIdent();
            if ((ident == null ? void 0 : ident.name) === "selferr") {
              if (memberAccess.target.is("Primary")) {
                const targetPrimary = memberAccess.target.getPrimary();
                if (targetPrimary == null ? void 0 : targetPrimary.is("Ident")) {
                  return targetPrimary.getIdent().name;
                }
              }
            }
          }
        }
      }
    }
    return null;
  }
  getCurrentFunctionErrorType() {
    const isInFunction = this.isInsideFunctionScope();
    if (isInFunction && this.currentFunctionErrorType) {
      return this.currentFunctionErrorType;
    }
    {
      let currentScope = this.config.services.scopeManager.getCurrentScope();
      while (currentScope && currentScope.kind !== "Function" /* Function */) {
        const parent = this.config.services.scopeManager.getScopeParent(currentScope.id);
        if (!parent) break;
        currentScope = parent;
      }
      if (!currentScope || currentScope.kind !== "Function" /* Function */) {
        return null;
      }
      const parentScope = this.config.services.scopeManager.getScopeParent(currentScope.id);
      if (!parentScope) return null;
      const funcSymbol = parentScope.symbols.get(currentScope.name);
      if (!funcSymbol || !funcSymbol.type || !funcSymbol.type.isFunction()) {
        return null;
      }
      const funcType = funcSymbol.type.getFunction();
      return funcType.errorType || null;
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── [4] EXPR Level ───────────────────────────┐
  inferExpressionType(expr) {
    if (!expr) return null;
    const cacheKey = this.createCacheKey(expr);
    if (this.inferenceStack.has(cacheKey)) {
      this.log("verbose", `Circular type inference detected for ${cacheKey}`);
      return null;
    }
    this.inferenceStack.add(cacheKey);
    try {
      const inferredType = this.performTypeInference(expr);
      if (inferredType) {
        this.cacheType(cacheKey, inferredType);
        this.stats.typesInferred++;
      }
      return inferredType;
    } finally {
      this.inferenceStack.delete(cacheKey);
    }
  }
  performTypeInference(expr) {
    this.config.services.contextTracker.pushContextSpan(expr.span);
    try {
      switch (expr.kind) {
        case "Primary":
          return this.inferPrimaryType(expr.getPrimary());
        case "Binary":
          return this.inferBinaryType(expr.getBinary());
        case "Prefix":
          return this.inferPrefixType(expr.getPrefix());
        case "Postfix":
          return this.inferPostfixType(expr.getPostfix());
        case "As":
          return this.inferAsType(expr.getAs());
        case "Typeof": {
          const typeofNode = expr.getTypeof();
          const innerType = this.inferExpressionType(typeofNode.expr);
          if (!innerType) {
            this.reportError(
              "TYPE_INFERENCE_FAILED" /* TYPE_INFERENCE_FAILED */,
              "Cannot infer type for typeof expression",
              typeofNode.expr.span
            );
            return null;
          }
          return AST4.TypeNode.asPrimitive(expr.span, "type");
        }
        case "Sizeof": {
          const sizeofNode = expr.getSizeof();
          const targetType = this.inferExpressionType(sizeofNode.expr);
          if (!targetType) {
            this.reportError(
              "TYPE_INFERENCE_FAILED" /* TYPE_INFERENCE_FAILED */,
              "Cannot infer type for sizeof expression",
              sizeofNode.expr.span
            );
            return null;
          }
          const size = this.computeTypeSize(targetType);
          if (size === null) {
            this.reportError(
              "INVALID_SIZEOF_TARGET" /* INVALID_SIZEOF_TARGET */,
              `Cannot compute size of type '${this.getTypeDisplayName(targetType)}'`,
              sizeofNode.expr.span
            );
            return AST4.TypeNode.asComptimeInt(expr.span, "0");
          }
          return AST4.TypeNode.asComptimeInt(expr.span, size.toString());
        }
        case "Orelse":
          return this.inferOrelseType(expr.getOrelse());
        case "Range":
          return this.inferRangeType(expr.getRange());
        case "Try":
          return this.inferTryType(expr.getTry());
        case "Catch":
          return this.inferCatchType(expr.getCatch());
        case "If":
          return this.inferIfType(expr.getIf());
        case "Switch":
          return this.inferSwitchType(expr.getSwitch());
        default:
          return null;
      }
    } finally {
      this.config.services.contextTracker.popContextSpan();
    }
  }
  computeTypeSize(type) {
    const resolved = this.resolveIdentifierType(type);
    return this.ExpressionEvaluator.computeTypeSize(resolved);
  }
  resolveTypeNode(typeNode) {
    switch (typeNode.kind) {
      case "struct":
        const tempSymbol = {
          id: -1,
          name: "<struct-validation>",
          kind: "Definition" /* Definition */,
          type: typeNode,
          scope: this.config.services.scopeManager.getCurrentScope().id,
          contextSpan: typeNode.span,
          declared: true,
          initialized: true,
          used: false,
          isTypeChecked: false,
          visibility: { kind: "Private" },
          mutability: { kind: "Immutable" },
          isExported: false
        };
        this.validateStructType(typeNode.getStruct(), tempSymbol);
        break;
      case "enum":
        const tempSymbol2 = {
          id: -1,
          name: "<enum-validation>",
          kind: "Definition" /* Definition */,
          type: typeNode,
          scope: this.config.services.scopeManager.getCurrentScope().id,
          contextSpan: typeNode.span,
          declared: true,
          initialized: true,
          used: false,
          isTypeChecked: false,
          visibility: { kind: "Private" },
          mutability: { kind: "Immutable" },
          isExported: false
        };
        this.validateEnumType(typeNode.getEnum(), tempSymbol2);
        break;
      case "array":
        const arr = typeNode.getArray();
        this.resolveTypeNode(arr.target);
        if (arr.size) {
          this.validateArraySize(arr.size);
        }
        break;
      case "optional":
        this.resolveTypeNode(typeNode.getOptional().target);
        break;
      case "pointer":
        this.resolveTypeNode(typeNode.getPointer().target);
        break;
      case "paren":
        this.resolveTypeNode(typeNode.getParen().type);
        break;
      case "tuple":
        for (const field of typeNode.getTuple().fields) {
          this.resolveTypeNode(field);
        }
        break;
      case "primitive": {
        const src = typeNode.getPrimitive();
        if (src.isSigned() || src.isUnsigned()) {
          const width = src.width;
          if (width < 0 || width > 65535) {
            this.reportError("INVALID_TYPE_WIDTH" /* INVALID_TYPE_WIDTH */, `Type width must be from 0 to 65535`, typeNode.span);
          }
        }
      }
    }
  }
  isTypeExpression(expr) {
    if (expr.kind === "Primary") {
      const primary = expr.getPrimary();
      if (!primary) return false;
      if (primary.kind === "Object") {
        const obj = primary.getObject();
        if (obj && obj.ident) {
          return false;
        }
        return false;
      }
      if (primary.kind === "Type") {
        return true;
      }
      if (primary.kind === "Ident") {
        const ident = primary.getIdent();
        if (!ident) return false;
        const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
        if (symbol && symbol.kind === "Definition" /* Definition */) {
          return true;
        }
      }
    }
    return false;
  }
  isTypeType(typeNode) {
    if (!typeNode.isPrimitive()) return false;
    const prim = typeNode.getPrimitive();
    return (prim == null ? void 0 : prim.kind) === "type";
  }
  // ===== PRIMARY OPERATIONS =====
  inferPrimaryType(primary) {
    switch (primary.kind) {
      case "Literal":
        return this.inferLiteralType(primary.getLiteral());
      case "Ident":
        return this.inferIdentifierType(primary.getIdent());
      case "Paren":
        const paren = primary.getParen();
        return paren.source ? this.inferExpressionType(paren.source) : null;
      case "Tuple":
        return this.inferTupleType(primary.getTuple());
      case "Object":
        return this.inferObjectType(primary.getObject());
      case "Type":
        return primary.getType();
      default:
        return null;
    }
  }
  inferLiteralType(literal) {
    switch (literal.kind) {
      case "String":
        const str = literal.value;
        const sizeExpr = AST4.ExprNode.asInteger(literal.span, str.length);
        return AST4.TypeNode.asArray(literal.span, AST4.TypeNode.asUnsigned(literal.span, "u8", 8), sizeExpr);
      case "Integer":
        return AST4.TypeNode.asComptimeInt(literal.span, literal.value);
      case "Float":
        return AST4.TypeNode.asComptimeFloat(literal.span, literal.value);
      case "Character": {
        const charValue = literal.value;
        if (charValue.length === 0) {
          const expectedType = this.currentFunctionReturnType || this.getExpectedTypeFromContext();
          if (expectedType) {
            const resolvedType = this.resolveIdentifierType(expectedType);
            if (resolvedType.isUnsigned() && resolvedType.getWidth() === 21) {
              return AST4.TypeNode.asUnsigned(literal.span, "u21", 21);
            }
            if (resolvedType.isUnsigned() && resolvedType.getWidth() === 8) {
              return AST4.TypeNode.asUnsigned(literal.span, "u8", 8);
            }
          }
          return AST4.TypeNode.asUnsigned(literal.span, "u8", 8);
        }
        const codePoint = charValue.codePointAt(0) || 0;
        if (codePoint > 127) {
          return AST4.TypeNode.asUnsigned(literal.span, "u21", 21);
        }
        return AST4.TypeNode.asUnsigned(literal.span, "u8", 8);
      }
      case "Bool":
        return AST4.TypeNode.asBool(literal.span);
      case "Null":
        return AST4.TypeNode.asNull(literal.span);
      case "Undefined":
        return AST4.TypeNode.asUndefined(literal.span);
      case "Array":
        return this.inferArrayLiteralType(literal);
      default:
        return AST4.TypeNode.asUndefined(literal.span);
    }
  }
  getExpectedTypeFromContext() {
    const currentDecl = this.config.services.contextTracker.getCurrentDeclaration();
    if (currentDecl) {
      const symbol = this.config.services.scopeManager.getSymbol(currentDecl.symbolId);
      if (symbol && symbol.type) {
        return this.resolveIdentifierType(symbol.type);
      }
    }
    const exprContext = this.config.services.contextTracker.getCurrentExpressionContext();
    if (exprContext && exprContext.relatedSymbol !== void 0) {
      const symbol = this.config.services.scopeManager.getSymbol(exprContext.relatedSymbol);
      if (symbol && symbol.type) {
        return this.resolveIdentifierType(symbol.type);
      }
    }
    return null;
  }
  inferArrayLiteralType(literal) {
    const elements = literal.value;
    if (elements.length === 0) {
      const sizeExpr2 = AST4.ExprNode.asInteger(literal.span, 0);
      return AST4.TypeNode.asArray(literal.span, AST4.TypeNode.asUndefined(literal.span), sizeExpr2);
    }
    const firstType = this.inferExpressionType(elements[0]);
    if (!firstType) {
      const sizeExpr2 = AST4.ExprNode.asInteger(literal.span, elements.length);
      return AST4.TypeNode.asArray(literal.span, AST4.TypeNode.asUndefined(literal.span), sizeExpr2);
    }
    for (let i = 1; i < elements.length; i++) {
      if (!this.validateTypeAssignment(elements[i], firstType, `Array element ${i}`)) {
      }
      const elemType = this.inferExpressionType(elements[i]);
      if (!elemType || !this.isTypeCompatible(firstType, elemType)) {
        this.reportError(
          "TYPE_MISMATCH" /* TYPE_MISMATCH */,
          "Array elements have incompatible types",
          elements[i].span
        );
      }
    }
    const sizeExpr = AST4.ExprNode.asInteger(literal.span, elements.length);
    return AST4.TypeNode.asArray(literal.span, firstType, sizeExpr);
  }
  inferIdentifierType(ident) {
    var _a, _b;
    if (ident.name === "self") {
      const selfSymbol = this.config.services.scopeManager.lookupSymbol("self");
      if (selfSymbol && ((_a = selfSymbol.metadata) == null ? void 0 : _a.isSelf)) {
        selfSymbol.used = true;
        return selfSymbol.type;
      }
    }
    if (this.currentIsStaticMethod && this.currentStructScope) {
      const fieldSymbol = this.currentStructScope.symbols.get(ident.name);
      if (fieldSymbol) {
        if (fieldSymbol.kind === "StructField" /* StructField */ || fieldSymbol.kind === "Function" /* Function */) {
          const isStatic = fieldSymbol.visibility.kind === "Static";
          if (!isStatic) {
            const memberType = fieldSymbol.kind === "Function" /* Function */ ? "method" : "field";
            this.reportError(
              "INVALID_STATIC_ACCESS" /* INVALID_STATIC_ACCESS */,
              `Cannot access instance ${memberType} '${ident.name}' in static method. Static methods can only access static ${memberType}s.`,
              ident.span
            );
            return null;
          }
          fieldSymbol.used = true;
        }
      }
    }
    const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
    if (!symbol) return null;
    if (ident.name === "self" && ((_b = symbol.metadata) == null ? void 0 : _b.isSelf)) {
      symbol.used = true;
      return symbol.type;
    }
    if (symbol.type) return symbol.type;
    if (symbol.kind === "Function" /* Function */ && symbol.metadata) {
      const metadata = symbol.metadata;
      const paramTypes = [];
      if (metadata.params && Array.isArray(metadata.params)) {
        for (const param of metadata.params) {
          if (param.type) {
            paramTypes.push(param.type);
          }
        }
      }
      const returnType = metadata.returnType || null;
      const funcType = AST4.TypeNode.asFunction(
        symbol.contextSpan || ident.span,
        paramTypes,
        returnType
      );
      symbol.type = funcType;
      return funcType;
    }
    return null;
  }
  validateMethodCallContext(call, methodSymbol, isStaticAccess, baseExpr) {
    const isStaticMethod = methodSymbol.visibility.kind === "Static";
    if (isStaticAccess && !isStaticMethod) {
      this.reportError(
        "INVALID_STATIC_ACCESS" /* INVALID_STATIC_ACCESS */,
        `Cannot call instance method '${methodSymbol.name}' on type. Create an instance first.`,
        call.span
      );
      return;
    }
    if (!isStaticAccess && isStaticMethod) {
      return;
    }
  }
  inferObjectType(obj) {
    if (obj.ident) {
      const typeSymbol = this.config.services.scopeManager.lookupSymbol(obj.ident.name);
      if (!typeSymbol) {
        this.reportError(
          "UNDEFINED_IDENTIFIER" /* UNDEFINED_IDENTIFIER */,
          `Type '${obj.ident.name}' not found`,
          obj.span
        );
        return null;
      }
      if (!typeSymbol.type) {
        this.reportError(
          "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
          `Symbol '${obj.ident.name}' has no type`,
          obj.span
        );
        return null;
      }
      let actualType = typeSymbol.type;
      if (actualType.isIdent()) {
        const typeIdent = actualType.getIdent();
        const resolvedSymbol = this.config.services.scopeManager.lookupSymbol(typeIdent.name);
        if (resolvedSymbol && resolvedSymbol.type) {
          actualType = resolvedSymbol.type;
        }
      }
      if (actualType.isStruct()) {
        this.validateStructConstruction(obj, actualType, obj.span);
        return typeSymbol.type;
      } else {
        this.reportError(
          "TYPE_MISMATCH" /* TYPE_MISMATCH */,
          `'${obj.ident.name}' is not a struct type`,
          obj.span
        );
        return null;
      }
    }
    const fields = [];
    const fieldNodes = [];
    for (const prop of obj.props) {
      const fieldType = prop.val ? this.inferExpressionType(prop.val) : AST4.TypeNode.asUndefined(prop.key.span);
      if (!fieldType) {
        this.reportError(
          "CANNOT_INFER_TYPE" /* CANNOT_INFER_TYPE */,
          `Cannot infer type for property '${prop.key.name}'`,
          prop.key.span
        );
        return null;
      }
      fields.push(fieldType);
      const fieldNode = AST4.FieldNode.create(
        prop.key.span,
        { kind: "Private" },
        { kind: "Runtime" },
        { kind: "Immutable" },
        prop.key,
        fieldType,
        prop.val || void 0
      );
      fieldNodes.push(fieldNode);
    }
    const members = fieldNodes.map((f) => AST4.StructMemberNode.createField(f.span, f));
    return AST4.TypeNode.asStruct(obj.span, members, "Anonymous");
  }
  inferTupleType(tuple) {
    const fieldTypes = [];
    for (const field of tuple.fields) {
      const fieldType = this.inferExpressionType(field);
      if (!fieldType) return null;
      fieldTypes.push(fieldType);
    }
    return AST4.TypeNode.asTuple(tuple.span, fieldTypes);
  }
  // ===== BINARY OPERATIONS =====
  inferBinaryType(binary) {
    if (!binary.left || !binary.right) return null;
    if (binary.kind === "Assignment") {
      this.validateAssignment(binary);
      return this.inferExpressionType(binary.right);
    }
    const leftType = this.inferExpressionType(binary.left);
    const rightType = this.inferExpressionType(binary.right);
    if (!leftType || !rightType) return null;
    if (this.isTypeType(leftType) || this.isTypeType(rightType)) {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `Cannot perform ${binary.kind} operation on type values`,
        binary.span
      );
      return null;
    }
    switch (binary.kind) {
      case "Additive":
      case "Multiplicative":
      case "Power":
        if (!this.isNumericType(leftType) || !this.isNumericType(rightType)) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Cannot perform ${binary.kind} operation on non-numeric types '${this.getTypeDisplayName(leftType)}' and '${this.getTypeDisplayName(rightType)}'`,
            binary.span
          );
          return null;
        }
        return this.promoteNumericTypes(leftType, rightType, binary.span);
      case "Shift":
      case "BitwiseAnd":
      case "BitwiseXor":
      case "BitwiseOr":
        if (!this.isIntegerType(leftType) || !this.isIntegerType(rightType)) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Bitwise operations require integer types, got '${this.getTypeDisplayName(leftType)}' and '${this.getTypeDisplayName(rightType)}'`,
            binary.span
          );
          return null;
        }
        return this.promoteNumericTypes(leftType, rightType, binary.span);
      case "Equality":
      case "Relational":
        if (leftType.isNull() && !rightType.isOptional() && !rightType.isNull() && !rightType.isPointer()) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Cannot compare non-optional type '${this.getTypeDisplayName(rightType)}' with null`,
            binary.right.span
          );
        } else if (rightType.isNull() && !leftType.isOptional() && !leftType.isNull() && !leftType.isPointer()) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Cannot compare non-optional type '${this.getTypeDisplayName(leftType)}' with null`,
            binary.left.span
          );
        }
        return AST4.TypeNode.asBool(binary.span);
      case "LogicalAnd":
      case "LogicalOr":
        return AST4.TypeNode.asBool(binary.span);
      default:
        return null;
    }
  }
  validateAssignment(binary) {
    if (binary.kind !== "Assignment") return;
    this.stats.assignmentsValidated++;
    if (binary.left.is("Postfix")) {
      const postfix = binary.left.getPostfix();
      if ((postfix == null ? void 0 : postfix.kind) === "Dereference") {
        const ptrExpr = postfix.getAsExprNode();
        const ptrType = this.inferExpressionType(ptrExpr);
        if (ptrType) {
          const normalizedPtrType = this.normalizeType(ptrType);
          if (normalizedPtrType.isPointer()) {
            const ptr = normalizedPtrType.getPointer();
            if (!ptr.mutable) {
              this.reportError(
                "MUTABILITY_MISMATCH" /* MUTABILITY_MISMATCH */,
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
    if (leftSymbol) {
      if (leftSymbol.kind === "StructField" /* StructField */ && leftSymbol.visibility.kind === "Static") {
        this.reportError(
          "MUTABILITY_MISMATCH" /* MUTABILITY_MISMATCH */,
          `Cannot assign to static field '${leftSymbol.name}'. Static fields are immutable.`,
          binary.left.span
        );
        return;
      }
      if (leftSymbol.mutability.kind === "Immutable") {
        let symbolType = "variable";
        if (leftSymbol.kind === "Parameter" /* Parameter */) {
          symbolType = "parameter";
        } else if (leftSymbol.kind === "StructField" /* StructField */) {
          symbolType = "field";
        }
        this.reportError(
          "MUTABILITY_MISMATCH" /* MUTABILITY_MISMATCH */,
          `Cannot assign to immutable ${symbolType} '${leftSymbol.name}'`,
          binary.left.span
        );
        return;
      }
    }
    const leftType = this.inferExpressionType(binary.left);
    const rightType = this.inferExpressionType(binary.right);
    if (leftType && rightType && !this.isTypeCompatible(leftType, rightType, binary.right)) {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `Cannot assign type '${this.getTypeDisplayName(rightType)}' to '${this.getTypeDisplayName(leftType)}'`,
        binary.right.span
      );
    }
    if (leftType) {
      this.validateValueFitsInType(binary.right, leftType);
    }
  }
  // ===== PREFIX OPERATIONS =====
  inferPrefixType(prefix) {
    const exprType = this.inferExpressionType(prefix.expr);
    if (!exprType) return null;
    switch (prefix.kind) {
      case "UnaryPlus":
      case "UnaryMinus":
        if (!this.isNumericType(exprType)) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Unary '${prefix.kind === "UnaryMinus" ? "-" : "+"}' requires a numeric operand, got '${this.getTypeDisplayName(exprType)}'`,
            prefix.expr.span
          );
          return null;
        }
        return this.computeUnaryResultType(exprType, prefix.kind === "UnaryMinus", prefix.span);
      case "Increment":
      case "Decrement":
        if (!this.isNumericType(exprType)) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `${prefix.kind} requires a numeric operand`,
            prefix.expr.span
          );
          return null;
        }
        return exprType;
      case "LogicalNot":
        return AST4.TypeNode.asBool(prefix.span);
      case "BitwiseNot":
        if (!this.isIntegerType(exprType)) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Bitwise not requires integer type, got '${this.getTypeDisplayName(exprType)}'`,
            prefix.expr.span
          );
          return null;
        }
        return exprType;
      case "Reference":
        if (!this.isLValueExpression(prefix.expr)) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Cannot take reference of non-lvalue expression`,
            prefix.expr.span
          );
          return null;
        }
        let isMutablePointer = false;
        let resolvedType = exprType;
        if (prefix.expr.is("Primary")) {
          const primary = prefix.expr.getPrimary();
          if (primary == null ? void 0 : primary.is("Ident")) {
            const ident = primary.getIdent();
            if (ident) {
              const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
              if (symbol && symbol.mutability.kind === "Mutable") {
                isMutablePointer = true;
              }
              if (symbol && symbol.type) {
                resolvedType = symbol.type;
              }
            }
          }
        }
        const normalizedType = this.normalizeType(resolvedType);
        return AST4.TypeNode.asPointer(prefix.span, normalizedType, isMutablePointer);
      default:
        return null;
    }
  }
  /**
   * Checks if an expression is an lvalue (has a memory location that can be referenced).
   *
   * Lvalues include:
   * - Variables: x, y, myVar
   * - Dereferences: ptr.*, arr[0]
   * - Member access: obj.field, self.x
   *
   * Non-lvalues (cannot take address):
   * - Literals: 42, "hello", true
   * - Function calls: foo()
   * - Arithmetic: x + y
   * - Temporary values
   */
  isLValueExpression(expr) {
    switch (expr.kind) {
      case "Primary": {
        const primary = expr.getPrimary();
        switch (primary.kind) {
          case "Ident":
            return true;
          case "Literal":
            return false;
          case "Paren": {
            const paren = primary.getParen();
            return paren.source ? this.isLValueExpression(paren.source) : false;
          }
          default:
            return false;
        }
      }
      case "Postfix": {
        const postfix = expr.getPostfix();
        switch (postfix.kind) {
          case "Dereference":
            return true;
          case "ArrayAccess":
            return true;
          case "MemberAccess":
            return true;
          case "Call":
            return false;
          case "Increment":
          case "Decrement":
            return false;
          default:
            return false;
        }
      }
      case "Prefix": {
        const prefix = expr.getPrefix();
        switch (prefix.kind) {
          case "Reference":
            return true;
          case "Increment":
          case "Decrement":
            return this.isLValueExpression(prefix.expr);
          default:
            return false;
        }
      }
      case "Binary":
      case "As":
      case "Orelse":
      case "Range":
      case "Try":
      case "Catch":
      case "If":
      case "Switch":
      case "Typeof":
      case "Sizeof":
        return false;
      default:
        return false;
    }
  }
  // ===== POSTFIX OPERATIONS =====
  inferPostfixType(postfix) {
    switch (postfix.kind) {
      case "Call":
        return this.inferCallType(postfix.getCall());
      case "ArrayAccess":
        return this.inferArrayAccessType(postfix.getArrayAccess());
      case "MemberAccess":
        return this.inferMemberAccessType(postfix.getMemberAccess());
      case "Increment":
      case "Decrement":
        const exprType = this.inferExpressionType(postfix.getAsExprNode());
        if (exprType && !this.isNumericType(exprType)) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `${postfix.kind} requires numeric type`,
            postfix.span
          );
          return null;
        }
        return exprType;
      case "Dereference":
        const ptrType = this.inferExpressionType(postfix.getAsExprNode());
        if (!ptrType) {
          this.reportError(
            "TYPE_INFERENCE_FAILED" /* TYPE_INFERENCE_FAILED */,
            "Cannot infer type for dereference operation",
            postfix.span
          );
          return null;
        }
        const unwrappedPtrType = this.unwrapParenType(ptrType);
        if (!unwrappedPtrType.isPointer()) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Cannot dereference non-pointer type '${this.getTypeDisplayName(ptrType)}'`,
            postfix.span
          );
          return null;
        }
        return unwrappedPtrType.getPointer().target;
      default:
        return null;
    }
  }
  inferCallType(call) {
    var _a;
    this.stats.callsValidated++;
    if (this.isBuiltinFunction(call.base)) {
      return this.validateBuiltinCall(call);
    }
    if (call.base.is("Postfix")) {
      const postfix = call.base.getPostfix();
      if ((postfix == null ? void 0 : postfix.kind) === "MemberAccess") {
        const access = postfix.getMemberAccess();
        const baseType = this.inferExpressionType(access.base);
        if (baseType) {
          const resolvedBase = this.resolveIdentifierType(baseType);
          if (resolvedBase.isStruct()) {
            const memberName = this.extractMemberName(access.target);
            if (memberName) {
              const struct = resolvedBase.getStruct();
              const scopeId = (_a = struct.metadata) == null ? void 0 : _a.scopeId;
              if (scopeId !== void 0) {
                const structScope = this.config.services.scopeManager.getScope(scopeId);
                const methodSymbol = structScope.symbols.get(memberName);
                if (methodSymbol && methodSymbol.kind === "Function" /* Function */) {
                  const isStaticAccess = this.isStaticMemberAccess(access.base);
                  this.validateMethodCallContext(call, methodSymbol, isStaticAccess, access.base);
                  this.validateMemberVisibility(methodSymbol, structScope, access.target.span);
                }
              }
            }
            return this.validateStructMethodCall(call, access, resolvedBase);
          }
        }
      }
    }
    const calleeSymbol = this.findCallTargetSymbol(call.base);
    let calleeType = calleeSymbol ? calleeSymbol.type : this.inferExpressionType(call.base);
    if (!calleeType) {
      return null;
    }
    if (calleeType.isFunction()) {
      return this.validateCallArgumentsWithContext(call, calleeType);
    }
    this.reportError(
      "TYPE_MISMATCH" /* TYPE_MISMATCH */,
      `Cannot call value of non-function type`,
      call.base.span
    );
    return null;
  }
  validateMemberVisibility(memberSymbol, structScope, accessSpan) {
    if (memberSymbol.visibility.kind === "Public") {
      return;
    }
    if (memberSymbol.visibility.kind === "Private") {
      const currentScope = this.config.services.scopeManager.getCurrentScope();
      let isInsideStruct = false;
      let checkScope = currentScope;
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
          "SYMBOL_NOT_ACCESSIBLE" /* SYMBOL_NOT_ACCESSIBLE */,
          `Cannot access private ${memberSymbol.kind === "Function" /* Function */ ? "method" : "field"} '${memberSymbol.name}' from outside struct`,
          accessSpan
        );
      }
    }
  }
  validateBuiltinCall(call) {
    const builtinName = this.extractBuiltinName(call.base);
    if (!builtinName) {
      this.reportError(
        "INTERNAL_ERROR" /* INTERNAL_ERROR */,
        "Failed to extract builtin name",
        call.base.span
      );
      return AST4.TypeNode.asVoid(call.span);
    }
    const globalScope = this.config.services.scopeManager.getGlobalScope();
    const builtinSymbol = globalScope.symbols.get(builtinName);
    if (!builtinSymbol || !builtinSymbol.type) {
      this.reportError(
        "UNDEFINED_BUILTIN" /* UNDEFINED_BUILTIN */,
        `Unknown builtin function '${builtinName}'`,
        call.base.span
      );
      return AST4.TypeNode.asVoid(call.span);
    }
    const funcType = builtinSymbol.type;
    if (!funcType.isFunction()) {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `'${builtinName}' is not callable`,
        call.base.span
      );
      return AST4.TypeNode.asVoid(call.span);
    }
    const func = funcType.getFunction();
    if (func.params.length !== call.args.length) {
      const code = func.params.length > call.args.length ? "TOO_FEW_ARGUMENTS" /* TOO_FEW_ARGUMENTS */ : "TOO_MANY_ARGUMENTS" /* TOO_MANY_ARGUMENTS */;
      this.reportError(
        code,
        `Builtin '${builtinName}' expects ${func.params.length} argument(s), but got ${call.args.length}`,
        call.args.length ? { start: call.args[0].span.start, end: call.args[call.args.length - 1].span.end } : call.span
      );
      return func.returnType || AST4.TypeNode.asVoid(call.span);
    }
    for (let i = 0; i < func.params.length; i++) {
      const paramType = func.params[i];
      const arg = call.args[i];
      const argType = this.inferExpressionType(arg);
      if (!argType) continue;
      if (!this.isTypeCompatible(paramType, argType)) {
        this.reportError(
          "TYPE_MISMATCH" /* TYPE_MISMATCH */,
          `Argument type '${this.getTypeDisplayName(argType)}' is not compatible with parameter type '${this.getTypeDisplayName(paramType)}'`,
          arg.span
        );
      }
    }
    return func.returnType || AST4.TypeNode.asVoid(call.span);
  }
  validateStructMethodCall(call, access, structType) {
    var _a;
    const methodName = this.extractMemberName(access.target);
    if (!methodName) return null;
    const struct = structType.getStruct();
    const scopeId = (_a = struct.metadata) == null ? void 0 : _a.scopeId;
    if (scopeId === void 0) {
      this.reportError(
        "INTERNAL_ERROR" /* INTERNAL_ERROR */,
        `Cannot find scope for struct method call`,
        call.span
      );
      return null;
    }
    const structScope = this.config.services.scopeManager.getScope(scopeId);
    const methodSymbol = structScope.symbols.get(methodName);
    if (!methodSymbol || methodSymbol.kind !== "Function" /* Function */) {
      this.reportError(
        "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
        `Method '${methodName}' not found in struct`,
        access.target.span
      );
      return null;
    }
    if (!methodSymbol.type || !methodSymbol.type.isFunction()) {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `'${methodName}' is not a callable method`,
        call.span
      );
      return null;
    }
    return this.validateMethodCall(call, methodSymbol, structScope, access.base);
  }
  validateCallArgumentsWithContext(call, funcType) {
    const func = funcType.getFunction();
    if (func.params.length !== call.args.length) {
      const code = func.params.length > call.args.length ? "TOO_FEW_ARGUMENTS" /* TOO_FEW_ARGUMENTS */ : "TOO_MANY_ARGUMENTS" /* TOO_MANY_ARGUMENTS */;
      this.reportError(
        code,
        `Expected ${func.params.length} arguments, but got ${call.args.length}`,
        call.span
      );
      return null;
    }
    for (let i = 0; i < func.params.length; i++) {
      const paramType = func.params[i];
      const arg = call.args[i];
      if (!this.validateTypeAssignment(arg, paramType, `Argument ${i + 1}`)) {
        continue;
      }
      let argType = this.inferExpressionTypeWithContext(arg, paramType);
      if (!argType) {
        this.reportError(
          "TYPE_INFERENCE_FAILED" /* TYPE_INFERENCE_FAILED */,
          `Cannot infer type for argument ${i + 1}`,
          arg.span
        );
        continue;
      }
      if (!this.isTypeCompatible(paramType, argType)) {
        this.reportError(
          "TYPE_MISMATCH" /* TYPE_MISMATCH */,
          `Argument type '${this.getTypeDisplayName(argType)}' is not assignable to parameter type '${this.getTypeDisplayName(paramType)}'`,
          arg.span
        );
      }
    }
    return func.returnType || AST4.TypeNode.asVoid(call.span);
  }
  inferExpressionTypeWithContext(expr, expectedType) {
    if (expectedType && expr.is("Primary")) {
      const primary = expr.getPrimary();
      if (primary && primary.is("Object")) {
        const obj = primary.getObject();
        if (!obj.ident) {
          const resolvedExpected = this.resolveIdentifierType(expectedType);
          if (resolvedExpected.isStruct()) {
            this.validateStructConstruction(obj, resolvedExpected, expr.span);
            return expectedType;
          }
        }
      }
    }
    return this.inferExpressionType(expr);
  }
  inferArrayAccessType(access) {
    const baseType = this.inferExpressionType(access.base);
    const indexType = this.inferExpressionType(access.index);
    if (!baseType) return null;
    if (indexType && !this.isIntegerType(indexType)) {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `Array index must be integer type, got '${this.getTypeDisplayName(indexType)}'`,
        access.index.span
      );
    }
    if (baseType.isArray()) {
      return baseType.getArray().target;
    }
    if (this.isStringType(baseType)) {
      return AST4.TypeNode.asUnsigned(access.span, "u8", 8);
    }
    this.reportError(
      "TYPE_MISMATCH" /* TYPE_MISMATCH */,
      `Cannot index non-array type '${this.getTypeDisplayName(baseType)}'`,
      access.base.span
    );
    return null;
  }
  inferMemberAccessType(access) {
    var _a, _b, _c;
    this.log("verbose", `inferMemberAccessType: currentIsStaticMethod=${this.currentIsStaticMethod}, currentStructScope=${((_a = this.currentStructScope) == null ? void 0 : _a.name) || "null"}`);
    if (access.base.is("Primary")) {
      const primary = access.base.getPrimary();
      if (primary == null ? void 0 : primary.is("Ident")) {
        const ident = primary.getIdent();
        if ((ident == null ? void 0 : ident.name) === "self") {
          if (this.currentIsStaticMethod && this.currentStructScope) {
            const memberName = this.extractMemberName(access.target);
            if (!memberName) {
              this.reportError("INTERNAL_ERROR" /* INTERNAL_ERROR */, `Could not resolve member access on self`, access.target.span);
              return null;
            }
            const memberSymbol = this.currentStructScope.symbols.get(memberName);
            if (!memberSymbol) {
              this.reportError("SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */, `Member '${memberName}' not found in struct`, access.target.span);
              return null;
            }
            const isStaticMember = memberSymbol.visibility.kind === "Static";
            if (!isStaticMember) {
              const memberType2 = memberSymbol.kind === "Function" /* Function */ ? "method" : "field";
              this.reportError(
                "INVALID_STATIC_ACCESS" /* INVALID_STATIC_ACCESS */,
                `Cannot access instance ${memberType2} '${memberName}' via 'self' in static method. Static methods can only access static members.`,
                access.target.span
              );
              return null;
            }
            memberSymbol.used = true;
            return memberSymbol.type || null;
          }
          const selfSymbol = this.config.services.scopeManager.lookupSymbol("self");
          if (selfSymbol && ((_b = selfSymbol.metadata) == null ? void 0 : _b.isSelf)) {
            selfSymbol.used = true;
            const selfType = selfSymbol.type;
            if (selfType) {
              return this.resolveMemberOnUnwrappedType(selfType, access, null, false);
            }
          }
          return null;
        }
        const baseSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
        if (baseSymbol && baseSymbol.kind === "Use" /* Use */ && ((_c = baseSymbol.metadata) == null ? void 0 : _c.isWildcardImport)) {
          return this.resolveWildcardMemberAccess(access, baseSymbol);
        }
      }
    }
    let baseType = this.inferExpressionType(access.base);
    if (!baseType) {
      return null;
    }
    if (access.optional && !baseType.isOptional()) {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `Cannot use optional chaining on non-optional type '${this.getTypeDisplayName(baseType)}'`,
        access.span
      );
      return null;
    }
    if (access.base.is("Postfix")) {
      const postfix = access.base.getPostfix();
      if ((postfix == null ? void 0 : postfix.kind) === "Dereference") {
        if (baseType.isIdent()) {
          const ident = baseType.getIdent();
          const typeSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
          if (typeSymbol == null ? void 0 : typeSymbol.type) {
            baseType = typeSymbol.type;
          }
        }
        return this.resolveMemberOnUnwrappedType(baseType, access, null);
      }
    }
    let unwrappedType = baseType;
    let optionalDepth = 0;
    while (unwrappedType.isOptional()) {
      unwrappedType = unwrappedType.getOptional().target;
      optionalDepth++;
    }
    if (unwrappedType.isIdent()) {
      const ident = unwrappedType.getIdent();
      const typeSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
      if (typeSymbol == null ? void 0 : typeSymbol.type) {
        unwrappedType = typeSymbol.type;
      }
    }
    const isStaticAccess = this.isStaticMemberAccess(access.base);
    const memberType = this.resolveMemberOnUnwrappedType(
      unwrappedType,
      access,
      null,
      isStaticAccess
    );
    if (optionalDepth > 0 && memberType) {
      return AST4.TypeNode.asOptional(access.span, memberType);
    }
    return memberType;
  }
  resolveWildcardMemberAccess(access, wildcardSymbol) {
    const memberName = this.extractMemberName(access.target);
    if (!memberName) {
      this.reportError(
        "INTERNAL_ERROR" /* INTERNAL_ERROR */,
        `Cannot extract member name from wildcard access`,
        access.target.span
      );
      return null;
    }
    const targetModuleName = wildcardSymbol.importSource;
    if (!targetModuleName) {
      this.reportError(
        "INTERNAL_ERROR" /* INTERNAL_ERROR */,
        `Wildcard import has no source module`,
        access.span
      );
      return null;
    }
    const targetModuleScope = this.findModuleScope(targetModuleName);
    if (!targetModuleScope) {
      this.reportError(
        "MODULE_SCOPE_NOT_FOUND" /* MODULE_SCOPE_NOT_FOUND */,
        `Cannot find scope for module '${targetModuleName}'`,
        access.span
      );
      return null;
    }
    const memberSymbol = targetModuleScope.symbols.get(memberName);
    if (!memberSymbol) {
      this.reportError(
        "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
        `Module '${targetModuleName}' has no exported symbol '${memberName}'`,
        access.target.span
      );
      return null;
    }
    if (!memberSymbol.isExported) {
      this.reportError(
        "SYMBOL_NOT_EXPORTED" /* SYMBOL_NOT_EXPORTED */,
        `Symbol '${memberName}' is not exported from module '${targetModuleName}'`,
        access.target.span
      );
      return null;
    }
    memberSymbol.used = true;
    wildcardSymbol.used = true;
    return memberSymbol.type;
  }
  isStaticMemberAccess(baseExpr) {
    if (!baseExpr.is("Primary")) return false;
    const primary = baseExpr.getPrimary();
    if (!(primary == null ? void 0 : primary.is("Ident"))) return false;
    const ident = primary.getIdent();
    if (!ident) return false;
    const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
    return (symbol == null ? void 0 : symbol.kind) === "Definition" /* Definition */;
  }
  resolveMemberOnUnwrappedType(type, access, symbol, isStaticAccess = false) {
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
      const inner = type.getOptional().target;
      const result = this.resolveMemberOnUnwrappedType(inner, access, symbol, isStaticAccess);
      return result ? AST4.TypeNode.asOptional(access.span, result) : null;
    }
    return null;
  }
  resolveStructMember(structType, access, baseSymbol, isStaticAccess = false) {
    var _a;
    const struct = structType.getStruct();
    const memberName = this.extractMemberName(access.target);
    if (!memberName) return null;
    let structScope = null;
    if (((_a = struct.metadata) == null ? void 0 : _a.scopeId) !== void 0) {
      try {
        structScope = this.config.services.scopeManager.getScope(struct.metadata.scopeId);
      } catch (e) {
        structScope = null;
      }
    }
    if (!structScope && struct.name && struct.name !== "Anonymous") {
      const currentScope = this.config.services.scopeManager.getCurrentScope();
      structScope = this.config.services.scopeManager.findChildScopeByNameFromId(
        struct.name,
        currentScope.id,
        "Type" /* Type */
      );
      if (!structScope) {
        structScope = this.config.services.scopeManager.findScopeByName(struct.name, "Type" /* Type */);
      }
    }
    if (!structScope) {
      this.reportError(
        "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
        `Cannot find scope for struct type`,
        access.base.span
      );
      return null;
    }
    const memberSymbol = structScope.symbols.get(memberName);
    if (!memberSymbol) {
      this.reportError(
        "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
        `Struct has no member '${memberName}'`,
        access.target.span
      );
      return null;
    }
    if (memberSymbol.visibility.kind === "Private") {
      this.reportError(
        "SYMBOL_NOT_ACCESSIBLE" /* SYMBOL_NOT_ACCESSIBLE */,
        `Cannot access private ${memberSymbol.kind === "Function" /* Function */ ? "method" : "field"} '${memberName}' from outside struct`,
        access.target.span
      );
      return null;
    }
    const isStaticField = memberSymbol.visibility.kind === "Static";
    if (isStaticAccess && !isStaticField && memberSymbol.kind === "StructField" /* StructField */) {
      this.reportError(
        "INVALID_STATIC_ACCESS" /* INVALID_STATIC_ACCESS */,
        `Cannot access instance field '${memberName}' on type. Use an instance instead.`,
        access.target.span
      );
      return null;
    }
    if (!isStaticAccess && isStaticField && memberSymbol.kind === "StructField" /* StructField */) {
      this.reportError(
        "INVALID_STATIC_ACCESS" /* INVALID_STATIC_ACCESS */,
        `Cannot access static field '${memberName}' on instance. Use '${struct.name}.${memberName}' instead.`,
        access.target.span
      );
      return null;
    }
    return memberSymbol.type || null;
  }
  validateMethodCall(call, methodSymbol, structScope, baseExpr) {
    this.log("symbols", `Validating method call '${methodSymbol.name}' on struct instance`);
    if (!methodSymbol.type || !methodSymbol.type.isFunction()) {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `'${methodSymbol.name}' is not a callable method`,
        call.span
      );
      return null;
    }
    const funcType = methodSymbol.type.getFunction();
    if (funcType.params.length !== call.args.length) {
      const code = funcType.params.length > call.args.length ? "TOO_FEW_ARGUMENTS" /* TOO_FEW_ARGUMENTS */ : "TOO_MANY_ARGUMENTS" /* TOO_MANY_ARGUMENTS */;
      this.reportError(
        code,
        `Expected ${funcType.params.length} arguments, but got ${call.args.length}`,
        call.span
      );
      return null;
    }
    for (let i = 0; i < funcType.params.length; i++) {
      const paramType = funcType.params[i];
      const arg = call.args[i];
      const argType = this.inferExpressionTypeWithContext(arg, paramType);
      if (!argType || !this.isTypeCompatible(paramType, argType)) {
        this.reportError(
          "TYPE_MISMATCH" /* TYPE_MISMATCH */,
          `Argument type '${argType ? this.getTypeDisplayName(argType) : "unknown"}' is not assignable to parameter type '${this.getTypeDisplayName(paramType)}'`,
          arg.span
        );
      }
    }
    return funcType.returnType || AST4.TypeNode.asVoid(call.span);
  }
  resolveEnumMember(enumType, access) {
    const memberName = this.extractMemberName(access.target);
    if (!memberName) return null;
    if (enumType.isEnum()) {
      const enumDef = enumType.getEnum();
      for (const variant of enumDef.variants) {
        if (variant.ident.name === memberName) {
          return variant.type || enumType;
        }
      }
    }
    if (enumType.isErrset()) {
      const errorType = enumType.getErrset();
      for (const member of errorType.members) {
        if (member.name === memberName) {
          return AST4.TypeNode.asIdentifier(member.span, member.name);
        }
      }
    }
    this.reportError(
      "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
      `${enumType.isErrset() ? "Error set" : "enum"} has no variant '${memberName}'`,
      access.target.span
    );
    return null;
  }
  // ===== SPECIAL EXPRESSIONS =====
  inferAsType(asNode) {
    const sourceType = this.inferExpressionType(asNode.base);
    if (!sourceType) return null;
    if (!this.canConvertTypes(sourceType, asNode.type)) {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `Cannot convert type '${this.getTypeDisplayName(sourceType)}' to type '${this.getTypeDisplayName(asNode.type)}'`,
        asNode.span
      );
    }
    return asNode.type;
  }
  inferOrelseType(orelse) {
    const leftType = this.inferExpressionType(orelse.left);
    const rightType = this.inferExpressionType(orelse.right);
    if (!leftType) return rightType;
    if (!rightType) return leftType;
    if (leftType.isOptional()) {
      const unwrapped = leftType.getOptional().target;
      if (rightType.isNull()) {
        return AST4.TypeNode.asUnion(orelse.span, [unwrapped, rightType]);
      }
      if (rightType.isOptional()) {
        const rightUnwrapped = rightType.getOptional().target;
        if (!this.isTypeCompatible(unwrapped, rightUnwrapped)) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Cannot use type '${this.getTypeDisplayName(rightType)}' as fallback for '${this.getTypeDisplayName(leftType)}'`,
            orelse.right.span
          );
        }
        return leftType;
      }
      if (!this.isTypeCompatible(unwrapped, rightType)) {
        this.reportError(
          "TYPE_MISMATCH" /* TYPE_MISMATCH */,
          `Cannot use type '${this.getTypeDisplayName(rightType)}' as fallback for '${this.getTypeDisplayName(leftType)}'`,
          orelse.right.span
        );
      }
      return unwrapped;
    }
    return leftType;
  }
  inferRangeType(range) {
    if (range.leftExpr) {
      const leftType = this.inferExpressionType(range.leftExpr);
      if (leftType && !this.isIntegerType(leftType)) {
        this.reportError(
          "TYPE_MISMATCH" /* TYPE_MISMATCH */,
          `Range start must be integer type, got '${this.getTypeDisplayName(leftType)}'`,
          range.leftExpr.span
        );
      }
    }
    if (range.rightExpr) {
      const rightType = this.inferExpressionType(range.rightExpr);
      if (rightType && !this.isIntegerType(rightType)) {
        this.reportError(
          "TYPE_MISMATCH" /* TYPE_MISMATCH */,
          `Range end must be integer type, got '${this.getTypeDisplayName(rightType)}'`,
          range.rightExpr.span
        );
      }
    }
    return null;
  }
  inferTryType(tryNode) {
    const exprType = this.inferExpressionType(tryNode.expr);
    if (!exprType) return null;
    return exprType;
  }
  inferCatchType(catchNode) {
    const leftType = this.inferExpressionType(catchNode.leftExpr);
    const exprScope = this.config.services.scopeManager.findChildScopeByName("expr", "Expression" /* Expression */);
    if (exprScope) {
      this.config.services.contextTracker.withSavedState(() => {
        this.config.services.scopeManager.withScope(exprScope.id, () => {
          this.validateStmt(catchNode.rightStmt);
        });
      });
    }
    return leftType;
  }
  inferIfType(ifNode) {
    const condType = this.inferExpressionType(ifNode.condExpr);
    if (condType && !condType.isBool()) {
      this.log("verbose", `If condition has type ${this.getTypeDisplayName(condType)}, expected bool`);
    }
    const exprScope = this.config.services.scopeManager.findChildScopeByName("expr", "Expression" /* Expression */);
    if (exprScope) {
      this.config.services.contextTracker.withSavedState(() => {
        this.config.services.scopeManager.withScope(exprScope.id, () => {
          this.validateStmt(ifNode.thenStmt);
          if (ifNode.elseStmt) {
            this.validateStmt(ifNode.elseStmt);
          }
        });
      });
    } else {
      this.validateStmt(ifNode.thenStmt);
      if (ifNode.elseStmt) {
        this.validateStmt(ifNode.elseStmt);
      }
    }
    return null;
  }
  inferSwitchType(switchNode) {
    this.inferExpressionType(switchNode.condExpr);
    this.validateSwitchExhaustiveness(switchNode);
    const exprScope = this.config.services.scopeManager.findChildScopeByName("expr", "Expression" /* Expression */);
    for (const switchCase of switchNode.cases) {
      if (switchCase.expr) {
        this.inferExpressionType(switchCase.expr);
      }
      if (switchCase.stmt) {
        if (exprScope) {
          this.config.services.contextTracker.withSavedState(() => {
            this.config.services.scopeManager.withScope(exprScope.id, () => {
              this.validateStmt(switchCase.stmt);
            });
          });
        } else {
          this.validateStmt(switchCase.stmt);
        }
      }
    }
    if (switchNode.defCase) {
      if (exprScope) {
        this.config.services.contextTracker.withSavedState(() => {
          this.config.services.scopeManager.withScope(exprScope.id, () => {
            this.validateStmt(switchNode.defCase.stmt);
          });
        });
      } else {
        this.validateStmt(switchNode.defCase.stmt);
      }
    }
    return null;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── [5] Ident Level ──────────────────────────┐
  resolveIdentifierType(type) {
    if (!type.isIdent()) return type;
    const ident = type.getIdent();
    if (ident.builtin) return type;
    const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
    if (symbol && symbol.type) {
      return this.resolveIdentifierType(symbol.type);
    }
    return type;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────────── [6] Type Level ───────────────────────────┐
  validateStructType(structType, symbol) {
    var _a;
    let typeScope = null;
    if (((_a = structType.metadata) == null ? void 0 : _a.scopeId) !== void 0) {
      try {
        typeScope = this.config.services.scopeManager.getScope(structType.metadata.scopeId);
      } catch (e) {
        typeScope = null;
      }
    }
    if (!typeScope && structType.name && structType.name !== "Anonymous") {
      typeScope = this.config.services.scopeManager.findScopeByName(structType.name, "Type" /* Type */);
    }
    if (!typeScope) {
      typeScope = this.config.services.scopeManager.findChildScopeByNameFromId(
        symbol.name,
        symbol.scope,
        "Type" /* Type */
      );
    }
    if (!typeScope) {
      this.reportError(
        "INTERNAL_ERROR" /* INTERNAL_ERROR */,
        `Cannot find type scope for struct validation`,
        structType.span
      );
      return;
    }
    this.config.services.contextTracker.withSavedState(() => {
      this.config.services.scopeManager.withScope(typeScope.id, () => {
        for (const member of structType.members) {
          if (member.isField()) {
            const field = member.getField();
            if (field.visibility.kind === "Static" && field.mutability.kind === "Mutable") {
              this.reportError(
                "INVALID_VISIBILITY" /* INVALID_VISIBILITY */,
                `Struct field '${field.ident.name}' cannot be 'static'`,
                field.span
              );
              continue;
            }
            if (field.type) {
              this.resolveTypeNode(field.type);
            }
            if (field.initializer) {
              if (field.type && field.type.isArray()) {
                this.validateArrayLiteralWithTargetType(
                  field.initializer,
                  field.type,
                  field.ident.name
                );
                continue;
              }
              const initType = this.inferExpressionType(field.initializer);
              if (field.type && initType) {
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
                if (!this.isTypeCompatible(field.type, initType, field.initializer)) {
                  this.reportError(
                    "TYPE_MISMATCH" /* TYPE_MISMATCH */,
                    `Field '${field.ident.name}' initializer type '${this.getTypeDisplayName(initType)}' doesn't match field type '${this.getTypeDisplayName(field.type)}'`,
                    field.initializer.span
                  );
                }
              } else if (!field.type && initType) {
                field.type = initType;
              }
              if (field.type) {
                this.validateValueFitsInType(field.initializer, field.type);
              }
            }
          } else {
            const method = member.getMethod();
            this.validateFuncStmt(method);
          }
        }
      });
    });
  }
  validateStructConstruction(objNode, structType, initSpan) {
    if (!structType.isStruct()) {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `Cannot initialize non-struct type with object literal`,
        initSpan
      );
      return false;
    }
    const struct = structType.getStruct();
    if (objNode.ident) {
      const constructorName = objNode.ident.name;
      const expectedName = struct.name || this.extractTypeName(structType);
      if (expectedName && constructorName !== expectedName) {
        this.reportError(
          "TYPE_MISMATCH" /* TYPE_MISMATCH */,
          `Constructor '${constructorName}' does not match expected type '${expectedName}'`,
          objNode.ident.span
        );
        return false;
      }
    }
    const structFields = /* @__PURE__ */ new Map();
    for (const member of struct.members) {
      if (member.isField()) {
        const field = member.source;
        structFields.set(field.ident.name, field);
      }
    }
    const providedFields = /* @__PURE__ */ new Set();
    for (const prop of objNode.props) {
      const fieldName = prop.key.name;
      providedFields.add(fieldName);
      const structField = structFields.get(fieldName);
      if (!structField) {
        this.reportError(
          "SYMBOL_NOT_FOUND" /* SYMBOL_NOT_FOUND */,
          `Struct '${struct.name || "<anonymous>"}' has no field '${fieldName}'`,
          prop.key.span
        );
        continue;
      }
      if (structField.visibility.kind === "Static") {
        this.reportError(
          "INVALID_STATIC_ACCESS" /* INVALID_STATIC_ACCESS */,
          `Cannot initialize static field '${fieldName}' in constructor. Static fields belong to the type, not instances.`,
          prop.key.span
        );
        continue;
      }
      if (prop.val && structField.type) {
        if (!this.validateTypeAssignment(
          prop.val,
          structField.type,
          `Field '${fieldName}'`
        )) {
          continue;
        }
        const valueType = this.inferExpressionType(prop.val);
        if (valueType && !this.isTypeCompatible(structField.type, valueType)) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Field '${fieldName}' expects type '${this.getTypeDisplayName(structField.type)}' but got '${this.getTypeDisplayName(valueType)}'`,
            prop.val.span
          );
        }
      }
    }
    let hasMissingFields = false;
    for (const [fieldName, field] of structFields) {
      if (field.visibility.kind === "Static") {
        continue;
      }
      if (!providedFields.has(fieldName) && !field.initializer) {
        this.reportError(
          "TYPE_MISMATCH" /* TYPE_MISMATCH */,
          `Missing required field '${fieldName}' in struct initialization`,
          initSpan
        );
        hasMissingFields = true;
      }
    }
    return !hasMissingFields;
  }
  validateEnumType(enumType, symbol) {
    const typeScope = this.config.services.scopeManager.findChildScopeByName(symbol.name, "Type" /* Type */);
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
  validateArraySize(sizeExpr) {
    const errorCountBefore = this.config.services.diagnosticManager.length();
    const comptimeValue = this.ExpressionEvaluator.evaluateComptimeExpression(sizeExpr);
    const errorCountAfter = this.config.services.diagnosticManager.length();
    const evaluationFailed = errorCountAfter > errorCountBefore;
    if (evaluationFailed) {
      return;
    }
    if (comptimeValue === null) {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        "Array size must be a compile-time constant expression. Use literals, comptime functions, or compile-time arithmetic.",
        sizeExpr.span
      );
      return;
    }
    if (comptimeValue <= BigInt(0)) {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `Array size must be positive, got ${comptimeValue}`,
        sizeExpr.span
      );
      return;
    }
    const MAX_ARRAY_SIZE = BigInt(2147483647);
    if (comptimeValue > MAX_ARRAY_SIZE) {
      this.reportError(
        "TYPE_MISMATCH" /* TYPE_MISMATCH */,
        `Array size ${comptimeValue} exceeds maximum allowed size ${MAX_ARRAY_SIZE}`,
        sizeExpr.span
      );
      return;
    }
  }
  validateSwitchExhaustiveness(switchNode) {
    const condType = this.inferExpressionType(switchNode.condExpr);
    if (!condType) return;
    let resolvedType = condType;
    if (condType.isIdent()) {
      const ident = condType.getIdent();
      const typeSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
      if (typeSymbol && typeSymbol.type) {
        resolvedType = typeSymbol.type;
      }
    }
    if (resolvedType.isEnum()) {
      const enumType = resolvedType.getEnum();
      const coveredVariants = /* @__PURE__ */ new Set();
      for (const switchCase of switchNode.cases) {
        if (switchCase.expr) {
          const variantName = this.extractEnumVariantName(switchCase.expr);
          if (variantName) {
            coveredVariants.add(variantName);
          }
        }
      }
      if (!switchNode.defCase) {
        const missingVariants = [];
        for (const variant of enumType.variants) {
          if (!coveredVariants.has(variant.ident.name)) {
            missingVariants.push(variant.ident.name);
          }
        }
        if (missingVariants.length > 0) {
          this.reportError(
            "TYPE_MISMATCH" /* TYPE_MISMATCH */,
            `Switch is not exhaustive. Missing variants: ${missingVariants.join(", ")}`,
            switchNode.span
          );
        }
      }
    }
    if (resolvedType.isBool()) {
      const hasTrue = switchNode.cases.some((c) => this.isBoolLiteral(c.expr, true));
      const hasFalse = switchNode.cases.some((c) => this.isBoolLiteral(c.expr, false));
      if (!switchNode.defCase && (!hasTrue || !hasFalse)) {
        this.reportError(
          "TYPE_MISMATCH" /* TYPE_MISMATCH */,
          "Switch on boolean must handle both true and false cases or have a default",
          switchNode.span
        );
      }
    }
  }
  validateArrayAssignment(declaredType, initType, initSpan, contextName) {
    if (!declaredType.isArray() || !initType.isArray()) {
      return true;
    }
    const targetArray = declaredType.getArray();
    const sourceArray = initType.getArray();
    if (!targetArray.size || !sourceArray.size) {
      return true;
    }
    const targetSize = this.ExpressionEvaluator.extractIntegerValue(targetArray.size);
    const sourceSize = this.ExpressionEvaluator.extractIntegerValue(sourceArray.size);
    if (targetSize === void 0 || sourceSize === void 0) {
      return true;
    }
    if (targetSize !== sourceSize) {
      const msg = sourceSize > targetSize ? `Array literal has more elements than the fixed array type` : `Array literal has fewer elements than the fixed array type`;
      this.reportError(
        "ARRAY_SIZE_MISMATCH" /* ARRAY_SIZE_MISMATCH */,
        `${msg}`,
        initSpan
      );
      return false;
    }
    return true;
  }
  checkCircularTypeDependency(typeNode, typeName, allowIndirection = false, pathHasIndirection = false) {
    const key = `${typeName}:${typeNode.kind}:${typeNode.span.start}`;
    if (this.circularTypeDetectionStack.has(key)) {
      if (!pathHasIndirection) {
        this.reportError(
          "TYPE_MISMATCH" /* TYPE_MISMATCH */,
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
        case "ident": {
          const ident = typeNode.getIdent();
          if (!ident.builtin && ident.name === typeName) {
            if (!pathHasIndirection) {
              this.reportError(
                "TYPE_MISMATCH" /* TYPE_MISMATCH */,
                `Direct self-reference in type '${typeName}'. Use pointer or optional to break the cycle.`,
                typeNode.span
              );
              return true;
            }
            return false;
          }
          if (!ident.builtin) {
            const typeSymbol = this.config.services.scopeManager.lookupSymbol(ident.name);
            if (typeSymbol && typeSymbol.type && typeSymbol.kind === "Definition" /* Definition */) {
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
        case "array":
          return this.checkCircularTypeDependency(
            typeNode.getArray().target,
            typeName,
            allowIndirection,
            pathHasIndirection
          );
        case "optional":
        case "pointer":
          if (allowIndirection) {
            return false;
          }
          return this.checkCircularTypeDependency(
            typeNode.kind === "optional" ? typeNode.getOptional().target : typeNode.getPointer().target,
            typeName,
            allowIndirection,
            true
          );
        case "tuple":
          for (const field of typeNode.getTuple().fields) {
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
        case "struct": {
          const struct = typeNode.getStruct();
          for (const member of struct.members) {
            if (member.isField()) {
              const field = member.source;
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
        case "enum": {
          const enumType = typeNode.getEnum();
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
        case "union": {
          const unionType = typeNode.getUnion();
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
        case "paren": {
          return this.checkCircularTypeDependency(
            typeNode.getParen().type,
            typeName,
            allowIndirection,
            pathHasIndirection
          );
        }
      }
      return false;
    } finally {
      this.circularTypeDetectionStack.delete(key);
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────── UNIFIED CHARACTER LITERAL VALIDATION ────────────────────────┐
  isCharacterLiteral(expr) {
    if (!expr.is("Primary")) return false;
    const primary = expr.getPrimary();
    if (!(primary == null ? void 0 : primary.is("Literal"))) return false;
    const literal = primary.getLiteral();
    return (literal == null ? void 0 : literal.kind) === "Character";
  }
  validateCharacterLiteralCompatibility(expr, targetType, context) {
    if (!this.isCharacterLiteral(expr)) {
      return true;
    }
    const primary = expr.getPrimary();
    const literal = primary.getLiteral();
    const charValue = literal.value;
    if (charValue.length === 0) return true;
    const codePoint = charValue.codePointAt(0) || 0;
    const resolvedType = this.resolveIdentifierType(targetType);
    if (resolvedType.isUnsigned() && resolvedType.getWidth() === 8) {
      if (codePoint > 255) {
        this.reportError(
          "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
          `Value ${codePoint} does not fit in type '${this.getTypeDisplayName(targetType)}' (valid range: 0 to 255)`,
          expr.span
        );
        return false;
      }
    } else if (resolvedType.isUnsigned() && resolvedType.getWidth() === 21) {
      if (codePoint > 2097151) {
        this.reportError(
          "ARITHMETIC_OVERFLOW" /* ARITHMETIC_OVERFLOW */,
          `Value ${codePoint} does not fit in type '${this.getTypeDisplayName(targetType)}' (valid range: 0 to 2097151)`,
          expr.span
        );
        return false;
      }
    }
    return true;
  }
  validateTypeAssignment(sourceExpr, targetType, context) {
    if (!this.validateCharacterLiteralCompatibility(sourceExpr, targetType, context)) {
      return false;
    }
    return true;
  }
  unwrapParenType(type) {
    while (type.isParen()) {
      type = type.getParen().type;
    }
    return type;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  isTypeCompatible(target, source, sourceExpr) {
    this.stats.compatibilityChecks++;
    if (sourceExpr && this.isPointerDereference(sourceExpr)) {
      const normalizedTarget2 = this.normalizeType(target);
      const normalizedSource2 = this.normalizeType(source);
      if (!this.isSameType(normalizedTarget2, normalizedSource2)) {
        return false;
      }
    }
    const normalizedTarget = this.normalizeType(target);
    const normalizedSource = this.normalizeType(source);
    if (this.isAnyType(normalizedTarget)) return true;
    if (normalizedTarget.isErr()) {
      if (this.isErrorType(normalizedSource)) {
        return true;
      }
      if (normalizedSource.isIdent()) {
        const sourceIdent = normalizedSource.getIdent();
        const sourceSymbol = this.config.services.scopeManager.lookupSymbol(sourceIdent.name);
        if (sourceSymbol && sourceSymbol.kind === "Error" /* Error */) {
          return true;
        }
      }
      return false;
    }
    if (this.isSameType(normalizedTarget, normalizedSource)) return true;
    const resolvedTarget = this.resolveIdentifierType(normalizedTarget);
    const resolvedSource = this.resolveIdentifierType(normalizedSource);
    if (this.isSameType(resolvedTarget, resolvedSource)) return true;
    if (resolvedTarget.isErr()) {
      if (this.isErrorType(resolvedSource)) {
        return true;
      }
      if (resolvedSource.isIdent()) {
        const ident = resolvedSource.getIdent();
        const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
        if (symbol && symbol.kind === "Error" /* Error */) {
          return true;
        }
      }
      return false;
    }
    if (resolvedSource.isBool() && this.isNumericType(resolvedTarget)) {
      return false;
    }
    if (this.isNumericType(resolvedTarget) && this.isNumericType(resolvedSource)) {
      return this.areNumericTypesCompatible(resolvedTarget, resolvedSource);
    }
    if (resolvedTarget.isUnion() && resolvedSource.isUnion()) {
      const targetUnion = resolvedTarget.getUnion();
      const sourceUnion = resolvedSource.getUnion();
      return sourceUnion.types.every(
        (sourceType) => targetUnion.types.some(
          (targetType) => this.isTypeCompatible(targetType, sourceType)
        )
      );
    }
    if (resolvedTarget.isOptional()) {
      if (resolvedSource.isNull() || resolvedSource.isUndefined()) return true;
      const targetInner = resolvedTarget.getOptional().target;
      return this.isTypeCompatible(targetInner, source);
    }
    if (resolvedTarget.isArray() && resolvedSource.isArray()) {
      return this.areArrayTypesCompatible(resolvedTarget, resolvedSource);
    }
    if (resolvedTarget.isPointer()) {
      if (resolvedSource.isNull()) return true;
      if (resolvedSource.isPointer()) {
        return this.arePointerTypesCompatible(resolvedTarget, resolvedSource);
      }
    }
    if (resolvedTarget.isTuple() && resolvedSource.isTuple()) {
      return this.areTupleTypesCompatible(resolvedTarget, resolvedSource);
    }
    if (resolvedTarget.isStruct() && resolvedSource.isStruct()) {
      return this.areStructTypesCompatible(resolvedTarget, resolvedSource);
    }
    if (resolvedTarget.isEnum() && resolvedSource.isEnum()) {
      return this.isSameType(resolvedTarget, resolvedSource);
    }
    if (resolvedTarget.isUnion()) {
      const unionType = resolvedTarget.getUnion();
      return unionType.types.some((type) => this.isTypeCompatible(type, source));
    }
    if (resolvedSource.isOptional()) {
      const sourceInner = resolvedSource.getOptional().target;
      if (resolvedTarget.isUnion()) {
        const unionType = resolvedTarget.getUnion();
        const hasInnerType = unionType.types.some(
          (t) => this.isTypeCompatible(t, sourceInner)
        );
        const hasNull = unionType.types.some((t) => t.isNull());
        return hasInnerType && hasNull;
      }
    }
    return false;
  }
  isNumericType(type) {
    if (this.isTypeType(type)) {
      return false;
    }
    return type.isFloat() || type.isSigned() || type.isUnsigned() || type.isComptimeInt() || type.isComptimeFloat();
  }
  isAnyType(type) {
    if (!type.isPrimitive()) return false;
    const prim = type.getPrimitive();
    return (prim == null ? void 0 : prim.kind) === "any";
  }
  isIntegerType(type) {
    return type.isSigned() || type.isUnsigned() || type.isComptimeInt();
  }
  isStringType(type) {
    if (!type.isArray()) return false;
    const arrayType = type.getArray();
    const elemType = arrayType.target;
    return elemType.isUnsigned() && elemType.getWidth() === 8;
  }
  isErrorType(type) {
    if (type.isErrset()) {
      return true;
    }
    if (type.isErr()) {
      return true;
    }
    if (type.isIdent()) {
      const ident = type.getIdent();
      const symbol = this.config.services.scopeManager.lookupSymbol(ident.name);
      if (symbol) {
        if (symbol.kind === "Error" /* Error */) {
          return true;
        }
        if (symbol.type && symbol.type.isErrset()) {
          return true;
        }
      }
      const allScopes = this.config.services.scopeManager.getAllScopes();
      for (const scope of allScopes) {
        const scopeSymbol = scope.symbols.get(ident.name);
        if (scopeSymbol && scopeSymbol.kind === "Error" /* Error */) {
          return true;
        }
      }
    }
    return false;
  }
  isSameType(type1, type2) {
    if (type1 === type2) return true;
    if (type1.kind !== type2.kind) return false;
    switch (type1.kind) {
      case "primitive":
        const prim1 = type1.getPrimitive();
        const prim2 = type2.getPrimitive();
        return prim1.kind === prim2.kind && prim1.width === prim2.width;
      case "array":
        const arr1 = type1.getArray();
        const arr2 = type2.getArray();
        return this.isSameType(arr1.target, arr2.target);
      case "pointer":
        const ptr1 = type1.getPointer();
        const ptr2 = type2.getPointer();
        return this.isSameType(ptr1.target, ptr2.target) && ptr1.mutable === ptr2.mutable;
      case "paren":
        return this.isSameType(type1.getParen().type, type2.getParen().type);
      case "optional":
        const opt1 = type1.getOptional();
        const opt2 = type2.getOptional();
        return this.isSameType(opt1.target, opt2.target);
      case "tuple":
        const tup1 = type1.getTuple();
        const tup2 = type2.getTuple();
        if (tup1.fields.length !== tup2.fields.length) return false;
        return tup1.fields.every((f, i) => this.isSameType(f, tup2.fields[i]));
      case "function":
        const func1 = type1.getFunction();
        const func2 = type2.getFunction();
        if (func1.params.length !== func2.params.length) return false;
        if (!func1.params.every((p, i) => this.isSameType(p, func2.params[i]))) return false;
        const ret1 = func1.returnType;
        const ret2 = func2.returnType;
        if (ret1 && ret2) return this.isSameType(ret1, ret2);
        return ret1 === ret2;
      case "ident":
        const id1 = type1.getIdent();
        const id2 = type2.getIdent();
        return id1.name === id2.name;
      default:
        return false;
    }
  }
  promoteNumericTypes(type1, type2, span) {
    var _a, _b, _c, _d;
    if (type1.isComptimeInt() && this.isNumericType(type2)) return type2;
    if (type2.isComptimeInt() && this.isNumericType(type1)) return type1;
    if (type1.isComptimeFloat() && type2.isFloat()) return type2;
    if (type2.isComptimeFloat() && type1.isFloat()) return type1;
    if (type1.isFloat() || type2.isFloat()) {
      const width12 = (_a = type1.getWidth()) != null ? _a : 32;
      const width22 = (_b = type2.getWidth()) != null ? _b : 32;
      const maxWidth2 = Math.max(width12, width22);
      return AST4.TypeNode.asFloat(span, `f${maxWidth2}`, maxWidth2);
    }
    const width1 = (_c = type1.getWidth()) != null ? _c : 32;
    const width2 = (_d = type2.getWidth()) != null ? _d : 32;
    const maxWidth = Math.max(width1, width2);
    if (type1.isSigned() || type2.isSigned()) {
      return AST4.TypeNode.asSigned(span, `i${maxWidth}`, maxWidth);
    }
    return AST4.TypeNode.asUnsigned(span, `u${maxWidth}`, maxWidth);
  }
  computeUnaryResultType(operandType, isNegation, span) {
    var _a;
    if (operandType.isComptimeInt()) {
      const prim = operandType.getPrimitive();
      const txtStr = (prim == null ? void 0 : prim.text) !== void 0 ? String(prim.text) : "cint";
      const resultText = isNegation ? txtStr.startsWith("-") ? txtStr.slice(1) : `-${txtStr}` : txtStr;
      return AST4.TypeNode.asComptimeInt(span, resultText);
    }
    if (operandType.isUnsigned() && isNegation) {
      const width = (_a = operandType.getWidth()) != null ? _a : 32;
      return AST4.TypeNode.asSigned(span, `i${width}`, width);
    }
    return operandType;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  arePointerTypesCompatible(target, source) {
    const normalizedTarget = this.normalizeType(target);
    const normalizedSource = this.normalizeType(source);
    const targetPtr = normalizedTarget.getPointer();
    const sourcePtr = normalizedSource.getPointer();
    const resolvedTargetBase = this.normalizeType(this.resolveIdentifierType(targetPtr.target));
    const resolvedSourceBase = this.normalizeType(this.resolveIdentifierType(sourcePtr.target));
    if (resolvedTargetBase.isOptional()) {
      const targetInner = resolvedTargetBase.getOptional().target;
      const innerCompatible = this.isSameType(targetInner, resolvedSourceBase);
      if (!innerCompatible) {
        this.reportError(
          "TYPE_MISMATCH" /* TYPE_MISMATCH */,
          `Cannot assign '${this.getTypeDisplayName(source)}' to variable of type '${this.getTypeDisplayName(target)}'`,
          source.span
        );
        return false;
      }
    } else {
      const baseCompatible = this.isSameType(resolvedTargetBase, resolvedSourceBase);
      if (!baseCompatible) {
        this.reportError(
          "TYPE_MISMATCH" /* TYPE_MISMATCH */,
          `Cannot assign '${this.getTypeDisplayName(source)}' to variable of type '${this.getTypeDisplayName(target)}'`,
          source.span
        );
        return false;
      }
    }
    if (targetPtr.mutable && !sourcePtr.mutable) {
      this.reportError(
        "MUTABILITY_MISMATCH" /* MUTABILITY_MISMATCH */,
        `Cannot assign immutable pointer to mutable pointer variable`,
        source.span
      );
      return false;
    }
    return true;
  }
  areTupleTypesCompatible(target, source) {
    const targetTuple = target.getTuple();
    const sourceTuple = source.getTuple();
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
  areStructTypesCompatible(target, source) {
    var _a, _b;
    const targetStruct = target.getStruct();
    const sourceStruct = source.getStruct();
    if (((_a = targetStruct.metadata) == null ? void 0 : _a.scopeId) !== void 0 && ((_b = sourceStruct.metadata) == null ? void 0 : _b.scopeId) !== void 0) {
      return targetStruct.metadata.scopeId === sourceStruct.metadata.scopeId;
    }
    if (targetStruct.name && targetStruct.name !== "Anonymous" && sourceStruct.name && sourceStruct.name !== "Anonymous") {
      return targetStruct.name === sourceStruct.name;
    }
    return this.areStructsStructurallyCompatible(targetStruct, sourceStruct);
  }
  areStructsStructurallyCompatible(target, source) {
    const targetFields = /* @__PURE__ */ new Map();
    const sourceFields = /* @__PURE__ */ new Map();
    for (const member of target.members) {
      if (member.isField()) {
        const field = member.source;
        targetFields.set(field.ident.name, field);
      }
    }
    for (const member of source.members) {
      if (member.isField()) {
        const field = member.source;
        sourceFields.set(field.ident.name, field);
      }
    }
    for (const [fieldName, targetField] of targetFields) {
      const sourceField = sourceFields.get(fieldName);
      if (!sourceField) {
        return false;
      }
      if (targetField.type && sourceField.type) {
        if (!this.isTypeCompatible(targetField.type, sourceField.type)) {
          return false;
        }
      }
    }
    return true;
  }
  areNumericTypesCompatible(target, source) {
    var _a, _b;
    if (source.isBool() || target.isBool()) {
      return false;
    }
    if (source.isComptimeInt() || source.isComptimeFloat()) {
      if (source.isComptimeInt() && target.isUnsigned()) {
        const prim = source.getPrimitive();
        const txtStr = (prim == null ? void 0 : prim.text) !== void 0 ? String(prim.text) : "0";
        try {
          const value = BigInt(txtStr);
          if (value < BigInt(0)) {
            return false;
          }
        } catch (e) {
          return false;
        }
      }
      return true;
    }
    const targetWidth = (_a = target.getWidth()) != null ? _a : 64;
    const sourceWidth = (_b = source.getWidth()) != null ? _b : 64;
    if (sourceWidth > targetWidth) {
      return false;
    }
    return true;
  }
  areArrayTypesCompatible(target, source) {
    const targetArray = target.getArray();
    const sourceArray = source.getArray();
    if (sourceArray.target.isUndefined()) {
      return true;
    }
    if (!this.isTypeCompatible(targetArray.target, sourceArray.target)) {
      return false;
    }
    if (targetArray.size && sourceArray.size) {
      const targetSize = this.ExpressionEvaluator.extractIntegerValue(targetArray.size);
      const sourceSize = this.ExpressionEvaluator.extractIntegerValue(sourceArray.size);
      if (targetSize !== void 0 && sourceSize !== void 0) {
        return targetSize === sourceSize;
      }
    }
    return true;
  }
  canConvertTypes(source, target) {
    if (source.isIdent()) {
      const sourceSymbol = this.config.services.scopeManager.lookupSymbol(source.getIdent().name);
      if (sourceSymbol && sourceSymbol.type) {
        source = sourceSymbol.type;
      } else {
        return false;
      }
    }
    if (target.isIdent()) {
      const targetSymbol = this.config.services.scopeManager.lookupSymbol(target.getIdent().name);
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
  validateValueFitsInType(expr, targetType) {
    const unwrapped = this.resolveIdentifierType(targetType);
    if (unwrapped.isSigned() || unwrapped.isUnsigned() || unwrapped.isComptimeInt()) {
      const value = this.ExpressionEvaluator.evaluateComptimeExpression(expr, targetType);
      return;
    }
    if (unwrapped.isFloat() || unwrapped.isComptimeFloat()) {
      const value = this.ExpressionEvaluator.evaluateComptimeFloat(expr, targetType);
      return;
    }
  }
  isValidThrowType(thrownType, functionErrorType, span) {
    const resolvedErrorType = this.resolveIdentifierType(functionErrorType);
    if (resolvedErrorType.isErrset()) {
      const errorSet = resolvedErrorType.getErrset();
      if (thrownType.isIdent()) {
        const thrownIdent = thrownType.getIdent();
        const isMember = errorSet.members.some((member) => member.name === thrownIdent.name);
        return isMember;
      }
      return false;
    }
    if (resolvedErrorType.isPrimitive()) {
      const prim = resolvedErrorType.getPrimitive();
      if ((prim == null ? void 0 : prim.kind) === "err") {
        if (thrownType.isIdent()) {
          return thrownType.getIdent().name === prim.text;
        }
      }
    }
    return true;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  extractTypeFromInitializer(expr) {
    if (expr.kind !== "Primary") return null;
    const primary = expr.getPrimary();
    if (!primary || primary.kind !== "Type") return null;
    return primary.getType();
  }
  extractSymbolFromExpression(expr) {
    if (expr.is("Primary")) {
      const primary = expr.getPrimary();
      if (primary == null ? void 0 : primary.is("Ident")) {
        const ident = primary.getIdent();
        if (ident) {
          return this.config.services.scopeManager.lookupSymbol(ident.name);
        }
      }
    }
    return null;
  }
  extractBuiltinName(expr) {
    if (expr.kind !== "Primary") return null;
    const primary = expr.getPrimary();
    if (!primary || primary.kind !== "Ident") return null;
    const ident = primary.getIdent();
    return ((ident == null ? void 0 : ident.name) ? "@" + ident.name : null) || null;
  }
  extractMemberName(memberExpr) {
    switch (memberExpr.kind) {
      case "Primary": {
        const src = memberExpr.getPrimary();
        if (src.kind === "Ident") {
          return src.getIdent().name;
        }
        return null;
      }
      case "Prefix": {
        const src = memberExpr.getPrefix();
        return this.extractMemberName(src.expr);
      }
      case "Postfix": {
        const src = memberExpr.getPostfix();
        switch (src.kind) {
          case "MemberAccess": {
            const access = src.getMemberAccess();
            return this.extractMemberName(access.target);
          }
          case "Call": {
            const call = src.getCall();
            return this.extractMemberName(call.base);
          }
          case "ArrayAccess": {
            const index = src.getArrayAccess();
            return this.extractMemberName(index.base);
          }
          case "Increment":
          case "Decrement":
          case "Dereference": {
            return this.extractMemberName(src.getAsExprNode());
          }
          default:
            return null;
        }
      }
      case "Binary":
      case "As":
      case "Orelse":
      case "Range":
      case "Try":
      case "Catch":
      case "If":
      case "Switch":
      case "Typeof":
      case "Sizeof":
        return null;
      default:
        this.log("verbose", `Cannot extract member name from expression kind: ${memberExpr.kind}`);
        return null;
    }
  }
  extractEnumVariantName(expr) {
    if (expr.is("Postfix")) {
      const postfix = expr.getPostfix();
      if ((postfix == null ? void 0 : postfix.kind) === "MemberAccess") {
        const access = postfix.getMemberAccess();
        return this.extractMemberName(access.target);
      }
    }
    return null;
  }
  extractTypeName(typeNode) {
    if (typeNode.isIdent()) {
      return typeNode.getIdent().name;
    }
    if (typeNode.isStruct()) {
      return typeNode.getStruct().name || null;
    }
    return null;
  }
  /**
   * Normalizes a type by unwrapping all parentheses while preserving
   * the original type for span-based error reporting.
   *
   * This ensures type comparisons work correctly regardless of parenthesization.
   */
  normalizeType(type) {
    while (type.isParen()) {
      type = type.getParen().type;
    }
    switch (type.kind) {
      case "pointer": {
        const ptr = type.getPointer();
        const normalizedTarget = this.normalizeType(ptr.target);
        if (normalizedTarget !== ptr.target) {
          return AST4.TypeNode.asPointer(type.span, normalizedTarget, ptr.mutable);
        }
        return type;
      }
      case "optional": {
        const opt = type.getOptional();
        const normalizedTarget = this.normalizeType(opt.target);
        if (normalizedTarget !== opt.target) {
          return AST4.TypeNode.asOptional(type.span, normalizedTarget);
        }
        return type;
      }
      case "array": {
        const arr = type.getArray();
        const normalizedTarget = this.normalizeType(arr.target);
        if (normalizedTarget !== arr.target) {
          return AST4.TypeNode.asArray(type.span, normalizedTarget, arr.size);
        }
        return type;
      }
      case "tuple": {
        const tuple = type.getTuple();
        const normalizedFields = tuple.fields.map((f) => this.normalizeType(f));
        const hasChanges = normalizedFields.some((nf, i) => nf !== tuple.fields[i]);
        if (hasChanges) {
          return AST4.TypeNode.asTuple(type.span, normalizedFields);
        }
        return type;
      }
      case "function": {
        const func = type.getFunction();
        const normalizedParams = func.params.map((p) => this.normalizeType(p));
        const normalizedReturn = func.returnType ? this.normalizeType(func.returnType) : null;
        const hasChanges = normalizedParams.some((np, i) => np !== func.params[i]) || normalizedReturn && normalizedReturn !== func.returnType;
        if (hasChanges) {
          return AST4.TypeNode.asFunction(
            type.span,
            normalizedParams,
            normalizedReturn || void 0
          );
        }
        return type;
      }
      case "union": {
        const union = type.getUnion();
        const normalizedTypes = union.types.map((t) => this.normalizeType(t));
        const hasChanges = normalizedTypes.some((nt, i) => nt !== union.types[i]);
        if (hasChanges) {
          return AST4.TypeNode.asUnion(type.span, normalizedTypes);
        }
        return type;
      }
      default:
        return type;
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  findModuleScope(moduleName) {
    const moduleScope = this.config.services.scopeManager.findScopeByName(moduleName, "Module" /* Module */);
    if (!moduleScope) {
      this.reportError("MODULE_SCOPE_NOT_FOUND" /* MODULE_SCOPE_NOT_FOUND */, `Module scope for '${moduleName}' not found`);
    }
    return moduleScope;
  }
  findCallTargetSymbol(baseExpr) {
    if (baseExpr.is("Primary")) {
      const primary = baseExpr.getPrimary();
      if (primary == null ? void 0 : primary.is("Ident")) {
        const ident = primary.getIdent();
        if (ident && !ident.builtin) {
          return this.config.services.scopeManager.lookupSymbol(ident.name);
        }
      }
    }
    return null;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  isBuiltinFunction(baseExpr) {
    if (baseExpr.isIdent()) {
      const ident = baseExpr.getIdent();
      return (ident == null ? void 0 : ident.builtin) === true || (ident == null ? void 0 : ident.name.startsWith("@")) === true;
    }
    return false;
  }
  isInsideFunctionScope() {
    let currentScope = this.config.services.scopeManager.getCurrentScope();
    while (currentScope) {
      if (currentScope.kind === "Function" /* Function */) {
        return true;
      }
      if (currentScope.kind === "Module" /* Module */ || currentScope.kind === "Global" /* Global */) {
        return false;
      }
      if (currentScope.parent !== null) {
        try {
          currentScope = this.config.services.scopeManager.getScope(currentScope.parent);
        } catch (e) {
          return false;
        }
      } else {
        return false;
      }
    }
    return false;
  }
  isBoolLiteral(expr, value) {
    if (!expr || !expr.is("Primary")) return false;
    const primary = expr.getPrimary();
    if (!(primary == null ? void 0 : primary.is("Literal"))) return false;
    const literal = primary.getLiteral();
    return (literal == null ? void 0 : literal.kind) === "Bool" && literal.value === value;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  createCacheKey(expr) {
    const moduleName = this.config.services.contextTracker.getModuleName() || "unknown";
    const span = expr.span || { start: 0, end: 0 };
    return `${moduleName}:${span.start}:${span.end}:${expr.kind}`;
  }
  cacheType(key, type) {
    if (this.typeCtx.typeCache.size >= this.CACHE_MAX_SIZE) {
      const entries = Array.from(this.typeCtx.typeCache.entries());
      const toKeep = entries.slice(-Math.floor(this.CACHE_MAX_SIZE / 2));
      this.typeCtx.typeCache.clear();
      toKeep.forEach(([k, v]) => this.typeCtx.typeCache.set(k, v));
    }
    this.typeCtx.typeCache.set(key, type || null);
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  init() {
    this.config.services.contextTracker.reset();
    this.config.services.contextTracker.setPhase("TypeValidation" /* TypeValidation */);
    const globalScope = this.config.services.scopeManager.getGlobalScope();
    this.config.services.scopeManager.setCurrentScope(globalScope.id);
    this.config.services.contextTracker.setScope(globalScope.id);
    this.log("verbose", "Type validation initialized");
    return true;
  }
  initStats() {
    return {
      modulesProcessed: 0,
      typesInferred: 0,
      typesCached: 0,
      compatibilityChecks: 0,
      callsValidated: 0,
      memberAccessValidated: 0,
      assignmentsValidated: 0,
      returnsValidated: 0,
      errors: 0,
      startTime: Date.now()
    };
  }
  initTypeValidatorContext() {
    return {
      currentModule: "",
      moduleStack: [],
      typeCache: /* @__PURE__ */ new Map()
    };
  }
  getTypeDisplayName(type) {
    if (type.isPointer()) {
      const ptr = type.getPointer();
      const targetName = this.getTypeDisplayName(ptr.target);
      return ptr.mutable ? `*mut ${targetName}` : `*${targetName}`;
    }
    if (type.isOptional()) {
      const opt = type.getOptional();
      const targetName = this.getTypeDisplayName(opt.target);
      return `?${targetName}`;
    }
    if (type.isArray()) {
      const arr = type.getArray();
      const targetName = this.getTypeDisplayName(arr.target);
      return `[]${targetName}`;
    }
    const resolved = this.resolveIdentifierType(type);
    if (resolved.isStruct()) {
      const struct = resolved.getStruct();
      if (struct.name && struct.name !== "Anonymous") {
        return struct.name;
      }
      return "struct";
    }
    if (resolved.isEnum()) {
      const enumType = resolved.getEnum();
      if (enumType.name && enumType.name !== "Anonymous") {
        return enumType.name;
      }
      return "enum";
    }
    if (type.isIdent()) {
      return type.getIdent().name;
    }
    return type.toString();
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  logStatistics() {
    const duration = Date.now() - this.stats.startTime;
    this.log(
      "verbose",
      `Type Validation Statistics :
  Duration                 : ${duration}ms
  Types inferred           : ${this.stats.typesInferred}
  Types cached             : ${this.stats.typesCached}
  Compatibility checks     : ${this.stats.compatibilityChecks}
  Calls validated          : ${this.stats.callsValidated}
  Member access validated  : ${this.stats.memberAccessValidated}
  Assignments validated    : ${this.stats.assignmentsValidated}
  Returns validated        : ${this.stats.returnsValidated}
  Cache size               : ${this.typeCtx.typeCache.size}
  Errors                   : ${this.stats.errors}`
    );
  }
  // └──────────────────────────────────────────────────────────────────────┘
};

// lib/phases/SemanticValidator.ts
var SemanticValidator = class extends PhaseBase {
  constructor(config) {
    super("SemanticValidation" /* SemanticValidation */, config);
    // ┌──────────────────────────────── INIT ──────────────────────────────┐
    this.stats = this.initStats();
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── MAIN ────────────────────────────────┐
  handle() {
    try {
      this.log("verbose", "Starting semantic validation phase...");
      this.stats.startTime = Date.now();
      this.validateEntryPoint();
      this.validateUnusedSymbols();
      this.validateModuleIntegrity();
      this.validateVisibilityRules();
      this.logStatistics();
      return !this.config.services.diagnosticManager.hasErrors();
    } catch (error) {
      this.log("errors", `Fatal error during semantic validation: ${error}`);
      this.reportError(
        "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
        `Semantic validation failed: ${error}`
      );
      return false;
    }
  }
  reset() {
    this.stats = this.initStats();
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  validateEntryPoint() {
    var _a;
    this.log("symbols", "Validating entry point");
    this.stats.entryPointChecks++;
    const entryModuleName = (_a = this.config.program.metadata) == null ? void 0 : _a.entryModule;
    if (!entryModuleName) {
      this.log("verbose", "No entry module specified, skipping entry point validation");
      return;
    }
    const validation = this.performEntryPointValidation(entryModuleName);
    this.reportEntryPointErrors(validation, entryModuleName);
  }
  performEntryPointValidation(entryModuleName) {
    var _a;
    const result = {
      hasEntryModule: false,
      hasMainFunction: false,
      mainIsPublic: false,
      errors: []
    };
    const entryModule = this.config.program.modules.get(entryModuleName);
    if (!entryModule) {
      result.errors.push(`Entry module '${entryModuleName}' not found`);
      return result;
    }
    result.hasEntryModule = true;
    this.config.services.contextTracker.setModuleName(entryModuleName);
    if (typeof ((_a = entryModule.metadata) == null ? void 0 : _a.path) === "string") {
      this.config.services.contextTracker.setModulePath(entryModule.metadata.path);
    }
    const mainFunc = entryModule.findFunction("main");
    if (!mainFunc) {
      result.errors.push(`Entry module '${entryModuleName}' does not contain 'main' function`);
      return result;
    }
    result.hasMainFunction = true;
    if (mainFunc.visibility.kind !== "Public") {
      result.errors.push(`Main function in entry module '${entryModuleName}' must be public`);
      return result;
    }
    result.mainIsPublic = true;
    this.validateMainFunctionSignature(mainFunc, result);
    return result;
  }
  validateMainFunctionSignature(mainFunc, result) {
    if (mainFunc.parameters.length > 2) {
      result.errors.push(`Main function should not have more than 2 parameters`);
    }
    if (mainFunc.returnType && !this.isValidMainReturnType(mainFunc.returnType)) {
      result.errors.push(`Main function should return void or exit code type`);
    }
  }
  isValidMainReturnType(returnType) {
    return returnType.isVoid() || returnType.isSigned() && returnType.getWidth() === 32 || returnType.isUnsigned() && returnType.getWidth() === 8;
  }
  reportEntryPointErrors(validation, entryModuleName) {
    for (const error of validation.errors) {
      let code;
      if (error.includes("not found")) {
        code = "ENTRY_MODULE_NOT_FOUND" /* ENTRY_MODULE_NOT_FOUND */;
      } else if (error.includes("does not contain")) {
        code = "ENTRY_MODULE_NO_MAIN" /* ENTRY_MODULE_NO_MAIN */;
      } else if (error.includes("must be public")) {
        code = "ENTRY_MODULE_PRIVATE_MAIN" /* ENTRY_MODULE_PRIVATE_MAIN */;
      } else {
        code = "ANALYSIS_ERROR" /* ANALYSIS_ERROR */;
      }
      this.reportError(code, error);
      this.stats.errors++;
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  validateUnusedSymbols() {
    this.log("symbols", "Validating unused symbols");
    this.stats.unusedSymbolChecks++;
    const analysis = this.analyzeUnusedSymbols();
    this.reportUnusedSymbols(analysis);
  }
  analyzeUnusedSymbols() {
    const analysis = {
      unusedVariables: [],
      unusedParameters: [],
      unusedFunctions: [],
      totalUnused: 0
    };
    for (const symbol of this.config.services.scopeManager.getAllSymbols().values()) {
      if (!symbol.used && this.shouldCheckForUnused(symbol)) {
        switch (symbol.kind) {
          case "Variable" /* Variable */:
            analysis.unusedVariables.push(symbol);
            break;
          case "Parameter" /* Parameter */:
            analysis.unusedParameters.push(symbol);
            break;
          case "Function" /* Function */:
            analysis.unusedFunctions.push(symbol);
            break;
        }
        analysis.totalUnused++;
      }
    }
    return analysis;
  }
  shouldCheckForUnused(symbol) {
    if (symbol.name.startsWith("_")) {
      return false;
    }
    if (symbol.visibility.kind === "Public") {
      return false;
    }
    if (symbol.name === "main" && symbol.kind === "Function" /* Function */) {
      return false;
    }
    if (symbol.name.startsWith("@")) {
      return false;
    }
    if (symbol.importSource) {
      return false;
    }
    return true;
  }
  reportUnusedSymbols(analysis) {
    for (const symbol of analysis.unusedVariables) {
      this.reportUnusedSymbol(symbol, "UNUSED_VARIABLE" /* UNUSED_VARIABLE */, "Variable");
    }
    for (const symbol of analysis.unusedParameters) {
      this.reportUnusedSymbol(symbol, "UNUSED_PARAMETER" /* UNUSED_PARAMETER */, "Parameter");
    }
    for (const symbol of analysis.unusedFunctions) {
      this.reportUnusedSymbol(symbol, "UNUSED_FUNCTION" /* UNUSED_FUNCTION */, "Function");
    }
    if (analysis.totalUnused > 0) {
      this.log(
        "verbose",
        `Found ${analysis.totalUnused} unused symbols: ${analysis.unusedVariables.length} variables, ${analysis.unusedParameters.length} parameters, ${analysis.unusedFunctions.length} functions`
      );
    }
  }
  reportUnusedSymbol(symbol, code, symbolType) {
    var _a;
    const prevModule = this.config.services.contextTracker.getModuleName();
    const prevPath = this.config.services.contextTracker.getModulePath();
    const prevSpan = this.config.services.contextTracker.getContextSpan();
    try {
      if (symbol.module) {
        this.config.services.contextTracker.setModuleName(symbol.module);
        const module = this.config.program.modules.get(symbol.module);
        if (module && typeof ((_a = module.metadata) == null ? void 0 : _a.path) === "string") {
          this.config.services.contextTracker.setModulePath(module.metadata.path);
        }
      }
      this.config.services.contextTracker.setCurrentContextSpan(symbol.contextSpan);
      if (symbol.kind === "Function" /* Function */) {
        const parentScope = this.config.services.scopeManager.getScope(symbol.scope);
        if (parentScope.kind === "Type" /* Type */) {
          if (symbol.visibility.kind === "Static") {
            return;
          }
        }
      }
      if (symbol.name === "self" && symbol.kind === "Parameter" /* Parameter */) {
        return;
      }
      this.config.services.diagnosticManager.push({
        code,
        kind: "warning" /* WARNING */,
        msg: `${symbolType} '${symbol.name}' is declared but never used`,
        targetSpan: symbol.targetSpan
      });
      this.stats.warnings++;
    } finally {
      this.config.services.contextTracker.setModuleName(prevModule);
      this.config.services.contextTracker.setModulePath(prevPath);
      this.config.services.contextTracker.setCurrentContextSpan(prevSpan);
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  validateModuleIntegrity() {
    this.log("symbols", "Validating module integrity");
    this.stats.moduleIntegrityChecks++;
    for (const [moduleName, module] of this.config.program.modules) {
      this.validateSingleModuleIntegrity(moduleName, module);
    }
  }
  validateSingleModuleIntegrity(moduleName, module) {
    var _a, _b;
    const prevModule = this.config.services.contextTracker.getModuleName();
    const prevPath = this.config.services.contextTracker.getModulePath();
    const prevSpan = this.config.services.contextTracker.getContextSpan();
    try {
      this.config.services.contextTracker.setModuleName(moduleName);
      if (typeof ((_a = module.metadata) == null ? void 0 : _a.path) === "string") {
        this.config.services.contextTracker.setModulePath(module.metadata.path);
      }
      const moduleSpan = (_b = module.metadata) == null ? void 0 : _b.span;
      if (moduleSpan && typeof moduleSpan === "object" && "start" in moduleSpan && "end" in moduleSpan) {
        this.config.services.contextTracker.setCurrentContextSpan(moduleSpan);
      }
      if (module.statements.length === 0) {
        this.reportWarning(
          "ANALYSIS_ERROR" /* ANALYSIS_ERROR */,
          `Module '${moduleName}' is empty`
        );
        return;
      }
    } finally {
      this.config.services.contextTracker.setModuleName(prevModule);
      this.config.services.contextTracker.setModulePath(prevPath);
      this.config.services.contextTracker.setCurrentContextSpan(prevSpan);
    }
    this.checkCircularImports(moduleName, module);
    this.validateExportConsistency(moduleName, module);
  }
  checkCircularImports(moduleName, module) {
    const importedModules = /* @__PURE__ */ new Set();
    for (const stmt of module.statements) {
      if (stmt.kind === "Use") {
        const useNode = stmt.getUse();
        if (useNode.path) {
          const importedModule = this.findModuleByPath(useNode.path);
          if (importedModule) {
            importedModules.add(importedModule);
            if (this.hasCircularImport(moduleName, importedModule, /* @__PURE__ */ new Set())) {
              this.reportWarning(
                "IMPORT_CIRCULAR_DEPENDENCY" /* IMPORT_CIRCULAR_DEPENDENCY */,
                `Circular import detected between '${moduleName}' and '${importedModule}'`,
                useNode.span
              );
            }
          }
        }
      }
    }
  }
  hasCircularImport(originalModule, currentModule, visited) {
    if (visited.has(currentModule)) {
      return currentModule === originalModule;
    }
    visited.add(currentModule);
    const module = this.config.program.modules.get(currentModule);
    if (!module) return false;
    for (const stmt of module.statements) {
      if (stmt.kind === "Use") {
        const useNode = stmt.getUse();
        if (useNode.path) {
          const importedModule = this.findModuleByPath(useNode.path);
          if (importedModule === originalModule) {
            return true;
          }
          if (importedModule && this.hasCircularImport(originalModule, importedModule, new Set(visited))) {
            return true;
          }
        }
      }
    }
    return false;
  }
  validateExportConsistency(moduleName, module) {
    const moduleScope = this.config.services.scopeManager.findScopeByName(moduleName, "Module");
    if (!moduleScope) return;
    for (const [symbolName, symbol] of moduleScope.symbols) {
      if (symbol.visibility.kind === "Public" && !symbol.used) {
      }
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  validateVisibilityRules() {
    this.log("symbols", "Validating visibility rules");
    this.stats.visibilityChecks++;
    for (const symbol of this.config.services.scopeManager.getAllSymbols().values()) {
      this.validateSymbolVisibility(symbol);
    }
  }
  validateSymbolVisibility(symbol) {
    if (symbol.visibility.kind === "Private" && symbol.used) {
      this.validatePrivateSymbolUsage(symbol);
    }
    if (symbol.visibility.kind === "Public") {
      this.validatePublicSymbolExposure(symbol);
    }
  }
  validatePrivateSymbolUsage(symbol) {
  }
  validatePublicSymbolExposure(symbol) {
    if (!symbol.used && symbol.kind !== "Function" /* Function */) {
    }
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  findModuleByPath(importPath) {
    var _a;
    for (const [name, module] of this.config.program.modules) {
      const modulePath = (_a = module.metadata) == null ? void 0 : _a.path;
      if (modulePath === importPath) {
        return name;
      }
    }
    return void 0;
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  init() {
    this.config.services.contextTracker.reset();
    this.config.services.contextTracker.setPhase("SemanticValidation" /* SemanticValidation */);
    this.log("verbose", "Semantic validation initialized");
    return true;
  }
  initStats() {
    return {
      entryPointChecks: 0,
      unusedSymbolChecks: 0,
      visibilityChecks: 0,
      moduleIntegrityChecks: 0,
      errors: 0,
      warnings: 0,
      startTime: Date.now()
    };
  }
  // └──────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────────────── ---- ────────────────────────────────┐
  logStatistics() {
    const duration = Date.now() - this.stats.startTime;
    this.log(
      "verbose",
      `Semantic Validation Statistics     :
  Duration                         : ${duration}ms
  Entry point checks               : ${this.stats.entryPointChecks}
  Unused symbol checks             : ${this.stats.unusedSymbolChecks}
  Visibility checks                : ${this.stats.visibilityChecks}
  Module integrity checks          : ${this.stats.moduleIntegrityChecks}
  Errors                           : ${this.stats.errors}
  Warnings                         : ${this.stats.warnings}`
    );
  }
  // └──────────────────────────────────────────────────────────────────────┘
};

// lib/ast-analyzer.ts
var Analyzer = class _Analyzer {
  constructor(config = {}) {
    this.phaseTimings = /* @__PURE__ */ new Map();
    this.getDiagMgr = () => this.config.services.diagnosticManager;
    this.config = this.createConfig(config);
    this.symbolCollector = new SymbolCollector(this.config);
    this.symbolResolver = new SymbolResolver(this.config);
    this.typeValidator = new TypeValidator(this.config);
    this.semanticValidator = new SemanticValidator(this.config);
    this.log("verbose", `\u{1F680} Analyzer initialized with config: ${JSON.stringify(this.config)}`);
  }
  /** Factory method to create analyzer instance */
  static create(config) {
    return new _Analyzer(config);
  }
  log(kind = "verbose", message) {
    this.config.services.debugManager.log(kind, message);
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌──────────────────────── MAIN ANALYSIS INTERFACE ───────────────────┐
  /**
   * Analyze a program through all configured phases
   * @param program The AST program to analyze
   * @param config Optional runtime configuration overrides
   * @returns Analysis result with diagnostics and metadata
   */
  analyze(program, config) {
    const startTime = Date.now();
    this.log("verbose", "\u{1F50D} Starting multi-phase analysis...");
    try {
      const effectiveConfig = __spreadValues(__spreadValues({}, this.config), config);
      if (!this.validateProgramStructure(program)) {
        return this.createErrorResult("Invalid program structure", "Collection" /* Collection */);
      }
      this.config.program = program;
      const phases = [
        { phase: "Collection" /* Collection */, executor: () => this.executePhase1() },
        { phase: "Resolution" /* Resolution */, executor: () => this.executePhase2() },
        { phase: "TypeValidation" /* TypeValidation */, executor: () => this.executePhase3() },
        { phase: "SemanticValidation" /* SemanticValidation */, executor: () => this.executePhase4() }
      ];
      let completedPhase = "Collection" /* Collection */;
      let shouldContinue = true;
      for (const { phase, executor } of phases) {
        if (!shouldContinue || this.shouldStopAtPhase(phase, effectiveConfig.stopAtPhase)) {
          break;
        }
        const phaseResult = this.runPhase(phase, executor);
        completedPhase = phase;
        if (!phaseResult.success) {
          if (effectiveConfig.strictMode) {
            this.log("errors", `\u274C Stopping analysis at phase ${phase} due to errors (strict mode)`);
            shouldContinue = false;
          }
        }
        if (this.config.services.diagnosticManager.length() >= effectiveConfig.maxErrors) {
          this.log("errors", `\u26A0\uFE0F Stopping analysis due to error limit (${effectiveConfig.maxErrors})`);
          shouldContinue = false;
        }
      }
      const totalTime = Date.now() - startTime;
      const result = this.createFinalResult(completedPhase, totalTime);
      this.log(
        "verbose",
        `Analysis completed in ${totalTime}ms
   Success: ${result.success}
   Errors: ${result.diagnostics.filter((d) => d.kind === "error").length}
   Warnings: ${result.diagnostics.filter((d) => d.kind === "warning").length}
   Completed phase: ${completedPhase}`
      );
      for (const diagnostic of result.diagnostics) {
        this.log("errors", `${diagnostic.kind}: ${diagnostic.msg}`);
      }
      return result;
    } catch (error) {
      this.log("errors", `\u{1F4A5} Fatal analysis error: ${error}`);
      return this.createFatalErrorResult(error instanceof Error ? error.message : String(error));
    }
  }
  createServices(config) {
    var _a, _b;
    const debugManager = new DebugManager(void 0, (_a = config == null ? void 0 : config.debug) != null ? _a : "off");
    const contextTracker = new ContextTracker(debugManager);
    const diagnosticManager = new DiagnosticManager(contextTracker, (_b = config == null ? void 0 : config.strictMode) != null ? _b : false);
    const scopeManager = new ScopeManager(diagnosticManager, debugManager);
    return { debugManager, contextTracker, diagnosticManager, scopeManager };
  }
  createConfig(config) {
    var _a, _b, _c, _d, _e;
    return {
      debug: (_a = config.debug) != null ? _a : "off",
      stopAtPhase: (_b = config.stopAtPhase) != null ? _b : "SemanticValidation" /* SemanticValidation */,
      strictMode: (_c = config.strictMode) != null ? _c : false,
      maxErrors: (_d = config.maxErrors) != null ? _d : 100,
      services: this.createServices(config),
      program: (_e = config.program) != null ? _e : null
    };
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌────────────────────────── PHASE EXECUTION ─────────────────────────┐
  executePhase1() {
    this.log("symbols", "\u{1F4C2} Phase 1: Symbol Collection");
    return this.symbolCollector.handle();
  }
  executePhase2() {
    this.log("symbols", "\u{1F517} Phase 2: Symbol Resolution");
    return this.symbolResolver.handle();
  }
  executePhase3() {
    this.log("symbols", "\u{1F50D} Phase 3: Type Validation");
    return this.typeValidator.handle();
  }
  executePhase4() {
    this.log("symbols", "Phase 4: Semantic Validation");
    return this.semanticValidator.handle();
  }
  runPhase(phase, executor) {
    const startTime = Date.now();
    const errorsBefore = this.config.services.diagnosticManager.length();
    this.log("verbose", `\u{1F504} Starting phase: ${phase}`);
    this.config.services.debugManager.increaseIndent();
    try {
      const success = executor();
      const duration = Date.now() - startTime;
      const errorsAfter = this.config.services.diagnosticManager.length();
      const newErrors = Math.max(0, errorsAfter - errorsBefore);
      const newWarnings = this.config.services.diagnosticManager.getDiagnostics().slice(errorsBefore).filter((d) => d.kind === "warning").length;
      this.phaseTimings.set(phase, duration);
      const result = {
        success,
        phase,
        duration,
        errors: newErrors,
        warnings: newWarnings
      };
      this.log(
        "verbose",
        `\u2728 Phase ${phase} completed in ${duration}ms (${newErrors} errors, ${newWarnings} warnings)`
      );
      for (const diagnostic of this.config.services.diagnosticManager.getDiagnostics().slice(errorsBefore)) {
        this.log("errors", `${diagnostic.kind}: ${diagnostic.msg}`);
      }
      return result;
    } finally {
      this.config.services.debugManager.decreaseIndent();
    }
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌─────────────────────── VALIDATION AND UTILITIES ───────────────────┐
  validateProgramStructure(program) {
    var _a;
    if (!program) {
      this.config.services.diagnosticManager.reportError(
        "INTERNAL_ERROR" /* INTERNAL_ERROR */,
        "Program is null or undefined"
      );
      return false;
    }
    if (!program.modules || program.modules.size === 0) {
      this.config.services.diagnosticManager.reportError(
        "MODULE_NOT_FOUND" /* MODULE_NOT_FOUND */,
        "Program contains no modules"
      );
      return false;
    }
    const entryModule = (_a = program.metadata) == null ? void 0 : _a.entryModule;
    if (entryModule && !program.modules.has(entryModule)) {
      this.config.services.diagnosticManager.reportError(
        "ENTRY_MODULE_NOT_FOUND" /* ENTRY_MODULE_NOT_FOUND */,
        `Entry module '${entryModule}' not found`
      );
      return false;
    }
    return true;
  }
  shouldStopAtPhase(currentPhase, targetPhase) {
    const phaseOrder = [
      "Collection" /* Collection */,
      "Resolution" /* Resolution */,
      "TypeValidation" /* TypeValidation */,
      "SemanticValidation" /* SemanticValidation */
    ];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    const targetIndex = phaseOrder.indexOf(targetPhase);
    return currentIndex > targetIndex;
  }
  reset() {
    this.log("verbose", "\u{1F504} Resetting analyzer state...");
    this.phaseTimings.clear();
    this.config.services.contextTracker.reset();
    this.config.services.diagnosticManager.reset();
    this.config.services.debugManager.reset();
    this.config.services.scopeManager.reset();
    this.config.program = null;
    this.symbolCollector.reset();
    this.symbolResolver.reset();
    this.typeValidator.reset();
    this.semanticValidator.reset();
  }
  // └────────────────────────────────────────────────────────────────────┘
  // ┌───────────────────────── RESULT GENERATION ────────────────────────┐
  createFinalResult(completedPhase, totalTime) {
    const diagnostics = this.config.services.diagnosticManager.getDiagnostics();
    const hasErrors = diagnostics.some((d) => d.kind === "error" /* ERROR */);
    const result = {
      success: !hasErrors,
      diagnostics,
      completedPhase,
      debugInfo: {
        totalTime,
        phaseTimings: new Map(this.phaseTimings),
        memoryUsage: this.getMemoryUsage()
      }
    };
    return result;
  }
  createErrorResult(message, phase) {
    this.config.services.diagnosticManager.reportError("ANALYSIS_ERROR" /* ANALYSIS_ERROR */, message);
    return {
      success: false,
      diagnostics: this.config.services.diagnosticManager.getDiagnostics(),
      completedPhase: phase
    };
  }
  createFatalErrorResult(message) {
    return {
      success: false,
      diagnostics: [{
        code: "INTERNAL_ERROR" /* INTERNAL_ERROR */,
        kind: "error" /* ERROR */,
        msg: `Fatal analysis error: ${message}`,
        targetSpan: { start: 0, end: 0 }
      }]
    };
  }
  getMemoryUsage() {
    try {
      if (typeof process !== "undefined" && process.memoryUsage) {
        return process.memoryUsage().heapUsed;
      }
    } catch (e) {
    }
    return void 0;
  }
  // └────────────────────────────────────────────────────────────────────┘
};
export {
  AnalysisPhase,
  Analyzer,
  ContextTracker,
  DebugManager,
  DiagCode,
  DiagKind,
  DiagnosticManager
};
//# sourceMappingURL=ast-analyzer.mjs.map