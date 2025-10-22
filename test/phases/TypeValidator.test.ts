// TypeValidator.test.ts - Complete Test Suite
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { testAnalyzer, AnalysisPhase, specialTest_NoEnterModule } from '../utils';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ INIT ════════════════════════════════════════╗

    const Primitive = {

        PrimitiveMustFails: [
            // bool -> void
            {
                input       : 'let a : void = true; pub fn main() {}',
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 0, end: 20 },
                        tspan       : { start: 15, end: 19 },
                        kind    : 'error',
                        msg     : "Cannot assign type 'bool' to variable of type 'void'",
                        code    : "TYPE_MISMATCH"
                    },
                ],
            },

            // bool -> und
            {
                input       : 'let a : und_t = true; pub fn main() {}',
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 0, end: 21 },
                        tspan       : { start: 16, end: 20 },
                        kind    : 'error',
                        msg     : "Cannot assign type 'bool' to variable of type 'undefined'",
                        code    : "TYPE_MISMATCH"
                    },
                ],
            },

            // bool -> comptime-int
            {
                input       : 'let a : cint = true; pub fn main() {}',
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 0, end: 20 },
                        tspan       : { start: 15, end: 19 },
                        kind    : 'error',
                        msg     : "Cannot assign type 'bool' to variable of type 'cint'",
                        code    : "TYPE_MISMATCH"
                    },
                ],
            },

            // bool -> comptime-float
            {
                input       : 'let a : cflt = true; pub fn main() {}',
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 0, end: 20 },
                        tspan       : { start: 15, end: 19 },
                        kind    : 'error',
                        msg     : "Cannot assign type 'bool' to variable of type 'cflt'",
                        code    : "TYPE_MISMATCH"
                    },
                ],
            },

            // bool -> signed
            {
                input       : 'let a : i77 = true; pub fn main() {}',
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 0, end: 19 },
                        tspan       : { start: 14, end: 18 },
                        kind    : 'error',
                        msg     : "Cannot assign type 'bool' to variable of type 'i77'",
                        code    : "TYPE_MISMATCH"
                    },
                ],
            },

            // bool -> unsigned
            {
                input       : 'let a : u44 = true; pub fn main() {}',
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 0, end: 19 },
                        tspan       : { start: 14, end: 18 },
                        kind    : 'error',
                        msg     : "Cannot assign type 'bool' to variable of type 'u44'",
                        code    : "TYPE_MISMATCH"
                    },
                ],
            },

            // bool -> float
            {
                input       : 'let a : f80 = true; pub fn main() {}',
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 0, end: 19 },
                        tspan       : { start: 14, end: 18 },
                        kind    : 'error',
                        msg     : "Cannot assign type 'bool' to variable of type 'f80'",
                        code    : "TYPE_MISMATCH"
                    },
                ],
            },

            // slice -> bool
            {
                input       : 'let a : bool = "xyz"; pub fn main() {}',
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 0, end: 21 },
                        tspan       : { start: 15, end: 20 },
                        kind    : 'error',
                        msg     : "Cannot assign type '[]u8' to variable of type 'bool'",
                        code    : "TYPE_MISMATCH"
                    },
                ],
            },

            // char -> bool
            {
                input       : "let a : bool = 'x'; pub fn main() {}",
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 0, end: 19 },
                        tspan       : { start: 15, end: 18 },
                        kind    : 'error',
                        msg     : "Cannot assign type 'u8' to variable of type 'bool'",
                        code    : "TYPE_MISMATCH"
                    },
                ],
            },

            // array -> bool
            {
                input       : 'let a : bool = [1,2,3]; pub fn main() {}',
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 0, end: 23 },
                        tspan       : { start: 15, end: 22 },
                        kind    : 'error',
                        msg     : "Cannot assign type '[]cint' to variable of type 'bool'",
                        code    : "TYPE_MISMATCH"
                    },
                ],
            },

            // signed -> unsigned assignment (disallowed)
            {
                input       : 'let a : u32 = -5; pub fn main() {}',
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 0, end: 17 },
                        tspan       : { start: 14, end: 16 },
                        kind    : 'error',
                        msg     : "Value -5 does not fit in type 'u32' (valid range: 0 to 4294967295)",
                        code    : "ARITHMETIC_OVERFLOW"
                    },
                ],
            },
        ],

        PrimitiveMustSucceed: [
            // bool -> bool
            {
                input       : 'let a : bool = true; pub fn main() {}',
                success     : true,
                diagnostics : [],
            },

            // unsigned -> signed assignment (allowed)
            {
                input       : 'let a : i32 = 5 as u32; pub fn main() {}',
                success     : true,
                diagnostics : [],
            },
        ]
    }

    const Optional = {

        OptionalMustFails: [
            // wrong assignments
            {
                input   : 'let a : ?i32 = true; pub fn main() {}',
                success : false,
                diagnostics: [
                    {
                        cspan: { start: 0, end: 20 },
                        tspan: { start: 15, end: 19 },
                        kind: 'error',
                        msg: "Cannot assign type 'bool' to variable of type '?i32'",
                        code: 'TYPE_MISMATCH'
                    }
                ]
            }
        ],

        OptionalMustSucceed: [
            // optional target accepts value
            {
                input   : 'let a : ?i32 = 1; pub fn main() {}',
                success : true,
                diagnostics: [],
            },
            {
                input   : 'let a : ?i32 = und; pub fn main() {}',
                success : true,
                diagnostics: [],
            },
            {
                input   : 'let a : ?i32 = null; pub fn main() {}',
                success : true,
                diagnostics: [],
            },
        ]
    }

    const Array = {
        ArrayMustFails: [
            // array literal with extra element
            {
                input: 'let a : [2]i32 = [1 as i32,2 as i32,3 as i32]; pub fn main() {}',
                success: false,
                diagnostics: [
                    {
                        cspan: { start: 0, end: 46 },
                        tspan: { start: 17, end: 45 },
                        kind: 'error',
                        msg: 'Array literal has more elements than the fixed array type',
                        code: 'ARRAY_SIZE_MISMATCH'
                    }
                ]
            },

            // array literal with less element
            {
                input: 'let a : [3]i32 = [1 as i32,2 as i32]; pub fn main() {}',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        msg: 'Array literal has fewer elements than the fixed array type',
                        code: 'ARRAY_SIZE_MISMATCH'
                    }
                ]
            },

            // array literal incompatible elements
            {
                input: 'let a : [3]i32 = [1, true, 3]; pub fn main() {}',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        msg: "Array element 1 has type 'bool' which is not compatible with target element type 'i32'",
                        code: 'TYPE_MISMATCH'
                    }
                ]
            },
        ],

        ArrayMustSucceed: [
            // array literal inference
            {
                input: 'let a = [1,2,3]; pub fn main() {}',
                success: true,
                diagnostics: [],
            },

            // string literal to fixed array
            {
                input: "let a : [3]u8 = \"hey\"; pub fn main() {}",
                success: true,
                diagnostics: []
            }
        ]
    }

    const Tuple = {
        TuplesMustFails: [
            // tuple arity mismatch
            {
                input: 'let a : .{i32, bool} = true; pub fn main() {}',
                success: false,
                diagnostics: [
                    {
                        cspan: { start: 0, end: 28 },
                        tspan: { start: 23, end: 27 },
                        kind: 'error',
                        msg: "Cannot assign type 'bool' to variable of type '(i32, bool)'",
                        code: 'TYPE_MISMATCH'
                    }
                ]
            },

            // tuple arity mismatch
            {
                input: 'let a : .{i32, bool} = .{und, null}; pub fn main() {}',
                success: false,
                diagnostics: [
                    {
                        cspan: { start: 0, end: 36 },
                        tspan: { start: 23, end: 35 },
                        kind: 'error',
                        msg: "Cannot assign type '(undefined, null)' to variable of type '(i32, bool)'",
                        code: 'TYPE_MISMATCH'
                    }
                ]
            },
        ],

        TuplesMustSucceed: [
            // tuple assignment ok
            {
                input: 'let a : .{i32, bool} = .{1, true}; pub fn main() {}',
                success: true,
                diagnostics: []
            },

            // passed"Cannot assign type '(und, null)' to variable of type '(i32, bool)'",
            {
                input: 'let a : .{i32, bool} = .{44, true}; pub fn main() {}',
                success: true,
                diagnostics: []
            }
        ]
    }

    const Pointers = {
        PointersMustFails: [
            // pointer type mismatch (different base type)
            {
                input: 'let a : *u8 = &(1 as i32); pub fn main() {}',
                success: false,
                diagnostics: [
                    {
                        tspan: { start: 15, end: 25 },
                        kind: 'error',
                        msg: "Cannot take reference of non-lvalue expression",
                        code: 'TYPE_MISMATCH'
                    }
                ]
            },

            // pointer assignment from undefined
            {
                input: 'let a : *i32 = und; pub fn main() {}',
                success: false,
                diagnostics: [
                    {
                        cspan: { start: 0, end: 19 },
                        tspan: { start: 15, end: 18 },
                        kind: 'error',
                        msg: "Cannot assign type 'undefined' to variable of type '*i32'",
                        code: 'TYPE_MISMATCH'
                    }
                ]
            },

            // pointer mutability mismatch
            {
                input: 'let a : *mut i32 = &(1 as i32); pub fn main() {}',
                success: false,
                diagnostics: [
                    {
                        tspan: { start: 20, end: 30 },
                        kind: 'error',
                        msg: "Cannot take reference of non-lvalue expression",
                        code: 'TYPE_MISMATCH'
                    }
                ]
            },
        ],

        PointersMustSucceed: [
            // pointer assignment to optional pointer (null allowed)
            {
                input: 'let a : ?*i32 = null; pub fn main() {}',
                success: true,
                diagnostics: []
            },

            // pointer assignment from null
            {
                input: 'let a : *i32 = null; pub fn main() {}',
                success: true,
                diagnostics: []
            },
        ]
    }

    const FunctionParams = {
        FunctionParamsMustFails: [
            // parameter initializer mismatch
            {
                input: 'pub fn f(x: bool = 5) {} pub fn main() { }',
                success: false,
                diagnostics: [
                    {
                        cspan: { start: 0, end: 24 },
                        tspan: { start: 19, end: 20 },
                        kind: 'error',
                        msg: "Cannot assign type 'cint' to parameter of type 'bool'",
                        code: 'TYPE_MISMATCH'
                    }
                ]
            }
        ],

        FunctionParamsMustSucceed: [
            // parameter initializer matching
            {
                input: 'pub fn f(x: i32 = 5) {} pub fn main() { }',
                success: true,
                diagnostics: []
            },
        ]
    }

    const BinaryOps = {

        BinaryOpsMustFails: [
            // addition: int + float => float
            {
                input: 'let a = 1 + 1; pub fn main() {}',
                success: true,
                diagnostics: []
            },

            // logical op result is bool
            {
                input: 'let a = (true and false); pub fn main() {}',
                success: true,
                diagnostics: []
            }
        ],
    }

    const PrefixUnary = {

        PrefixUnaryMustFails: [
            // +bool
            {
                input       : 'let a = +true; pub fn main() {}',
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 8, end: 13 },
                        tspan       : { start: 9, end: 13 },
                        kind    : 'error',
                        msg     : "Unary '+' requires a numeric operand, got 'bool'",
                        code    : "TYPE_MISMATCH"
                    },
                ],
            },

            // -bool
            {
                input       : 'let a = -true; pub fn main() {}',
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 8, end: 13 },
                        tspan       : { start: 9, end: 13 },
                        kind    : 'error',
                        msg     : "Unary '-' requires a numeric operand, got 'bool'",
                        code    : "TYPE_MISMATCH"
                    },
                ],
            },

            // -int -> unsigned (negative comptime)
            {
                input       : 'let a : u8 = -1; pub fn main() {}',
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 0, end: 16 },
                        tspan       : { start: 13, end: 15 },
                        kind    : 'error',
                        msg     : "Value -1 does not fit in type 'u8' (valid range: 0 to 255)",
                        code    : "ARITHMETIC_OVERFLOW"
                    },
                ],
            },
        ],

        PrefixUnaryMustSucceed: [
            // +int
            {
                input       : 'let a = +1; pub fn main() {}',
                success     : true,
                diagnostics : [],
            },

            // -int
            {
                input       : 'let a = -1; pub fn main() {}',
                success     : true,
                diagnostics : [],
            },

            // -int -> cint
            {
                input       : 'let a : cint = -1; pub fn main() {}',
                success     : true,
                diagnostics : [],
            },
        ]

    }

    const Comptime = {
        ComptimeMustFails: [
            // negative comptime int assigned to unsigned fails
            {
                input: 'let a : u16 = -10; pub fn main() {}',
                success: false,
                diagnostics: [
                    {
                        cspan: { start: 0, end: 18 },
                        tspan: { start: 14, end: 17 },
                        kind: 'error',
                        msg: "Cannot assign type 'cint' to variable of type 'u16'",
                        code: 'TYPE_MISMATCH'
                    }
                ]
            },
        ],

        ComptimeMustSucceed: [
            // comptime int to signed ok
            {
                input: 'let a : i16 = -10; pub fn main() {}',
                success: true,
                diagnostics: []
            }
        ],
    }

    const Promotions = {
        PromotionsMustSucceed: [
            // unsigned + signed -> signed
            {
                input: 'let a = (5 as u8) + (-3); pub fn main() {}',
                success: true,
                diagnostics: []
            },

            // float + int -> float
            {
                input: 'let a = 1 + 2; pub fn main() {}',
                success: true,
                diagnostics: []
            }
        ],
    }

    const PostfixCall = {
        PostfixCallMustFails: [
            // call non-function type
            {
                input: 'let x = true(); pub fn main() {}',
                success: false,
                diagnostics: [
                    {
                        cspan: { start: 8, end: 14 },
                        tspan: { start: 8, end: 12 },
                        kind: 'error',
                        msg: "Cannot call value of non-function type 'bool'",
                        code: 'TYPE_MISMATCH'
                    }
                ]
            },

            // call with wrong number of arguments
            {
                input: 'pub fn f(x: i32) {} pub fn main() { f(); }',
                success: false,
                diagnostics: [
                    {
                        cspan: { start: 36, end: 39 },
                        tspan: { start: 36, end: 39 },
                        kind: 'error',
                        msg: "Expected 1 arguments, but got 0",
                        code: 'TOO_FEW_ARGUMENTS'
                    }
                ]
            },
            {
                input: 'pub fn f(x: i32) {} pub fn main() { f(55 as i32, false); }',
                success: false,
                diagnostics: [
                    {
                        cspan: { start: 36, end: 55 },
                        tspan: { start: 36, end: 55 },
                        kind: 'error',
                        msg: "Expected 1 arguments, but got 2",
                        code: 'TOO_MANY_ARGUMENTS'
                    }
                ]
            },

            // call with mismatched argument type
            {
                input: 'pub fn f(x: i32) {} pub fn main() { f(true); }',
                success: false,
                diagnostics: [
                    {
                        cspan: { start: 36, end: 43 },
                        tspan: { start: 38, end: 42 },
                        kind: 'error',
                        msg: "Argument type 'bool' is not assignable to parameter type 'i32'",
                        code: 'TYPE_MISMATCH'
                    }
                ]
            },

            // call with non-function identifier
            {
                input: 'let f : cint = 55; pub fn main() { f(); }',
                success: false,
                diagnostics: [
                    {
                        cspan: { start: 35, end: 38 },
                        tspan: { start: 35, end: 36 },
                        kind: 'error',
                        msg: "Cannot call value of non-function type. 'f' is a variable",
                        code: 'NOT_A_FUNCTION'
                    }
                ]
            },

            // call with non-function identifier (auto infer)
            {
                input: 'let f = 55; pub fn main() { f(); }',
                success: false,
                diagnostics: [
                    {
                        cspan: { start: 28, end: 31 },
                        tspan: { start: 28, end: 29 },
                        kind: 'error',
                        msg: "Cannot call value of non-function type. 'f' is a variable",
                        code: 'NOT_A_FUNCTION'
                    }
                ]
            },
        ],

        PostfixCallMustSucceed: [

            // call with correct arguments
            {
                input: 'pub fn f(x: i32) {} pub fn main() { f(42); }',
                success: true,
                diagnostics: []
            },

            // call with type coercion (unsigned to signed)
            {
                input: 'pub fn f(x: i32) {} pub fn main() { f(42 as u32); }',
                success: true,
                diagnostics: []
            },
        ]
    }

    const ReturnTypeValidation = {
        ReturnTypeMustFail: [
            // Return type mismatch
            {
                input: 'fn T_ST() -> i32 { return true; }',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Return type 'bool' doesn't match function return type 'i32'",
                }]
            },

            // Void return when expecting type
            {
                input: 'fn T_ST() -> i32 { return; }',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Function expects return type 'i32' but got void return",
                }]
            },

            // Wrong type in nested return
            {
                input: 'fn T_ST() -> i32 { if (true) { return "text"; } return 0; }',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Return type '[]u8' doesn't match function return type 'i32'",
                }]
            },
        ],

        ReturnTypeMustSucceed: [
            // Correct return type
            {
                input: 'fn T_ST() -> i32 { return 42; }',
                success: true,
                diagnostics: []
            },

            // Void return
            {
                input: 'fn T_ST() { return; }',
                success: true,
                diagnostics: []
            },

            // Type compatible return
            {
                input: 'fn T_ST() -> i32 { return 10; }',
                success: true,
                diagnostics: []
            },
        ],
    };

    const StructFieldValidation = {
        StructFieldMustFail: [
            // Field initializer type mismatch
            {
                input: 'def Point = struct { x: i32 = true; y: i32 }',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Field 'x' initializer type 'bool' doesn't match field type 'i32'",
                }]
            },

            // Multiple field errors
            {
                input: 'def Data = struct { a: i32 = "text"; b: bool = 42 }',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        msg: "Field 'a' initializer type '[]u8' doesn't match field type 'i32'",
                    },
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        msg: "Field 'b' initializer type 'cint' doesn't match field type 'bool'",
                    }
                ]
            },
        ],

        StructFieldMustSucceed: [
            // Valid field initializers
            {
                input: 'def Point = struct { x: i32 = 0; y: i32 = 0 }',
                success: true,
                diagnostics: []
            },

            // Mixed initialized and uninitialized
            {
                input: 'def Data = struct { id: i32; name: []u8 = "default" }',
                success: true,
                diagnostics: []
            },
        ],
    };

    const CircularTypeDetection = {
        CircularTypeMustFail: [
            // Direct circular reference
            {
                input: 'def A = A;',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        msg: "Direct self-reference in type 'A'. Use pointer or optional to break the cycle.",
                    }
                ]
            },

            // Indirect circular reference
            // USED_BEFORE_DECLARED detected before TYPE_MISMATCH
            {
                input: 'def A = B; def B = A;',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        msg: "Direct self-reference in type 'B'. Use pointer or optional to break the cycle.",
                    },
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        msg: "Direct self-reference in type 'A'. Use pointer or optional to break the cycle.",
                    },
                ]
            },

            // Circular through struct
            {
                input: 'def Node = struct { value: i32; next: Node }',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Direct self-reference in type 'Node'. Use pointer or optional to break the cycle.",
                }]
            },
        ],

        CircularTypeMustSucceed: [
            // Pointer breaks circular dependency
            {
                input: 'def Node = struct { value: i32; next: *Node }',
                success: true,
                diagnostics: []
            },

            // Optional breaks circular dependency
            {
                input: 'def Node = struct { value: i32; next: ?Node }',
                success: true,
                diagnostics: []
            },

            // Valid type chain
            {
                input: 'def A = i32; def B = A; def C = B;',
                success: true,
                diagnostics: []
            },
        ],
    };

    const MutabilityChecking = {
        MutabilityMustFail: [
            // Assign to immutable variable
            {
                input: 'let x = 10; x = 20;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'MUTABILITY_MISMATCH',
                    msg: "Cannot assign to immutable variable 'x'",
                }]
            },

            // Assign in expression
            {
                input: 'let x = 10; let y = (x = 20);',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'MUTABILITY_MISMATCH',
                    msg: "Cannot assign to immutable variable 'x'",
                }]
            },

            // Multiple assignments to immutable
            {
                input: 'fn T_ST() { let x = 5; x = 10; x = 15; }',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'MUTABILITY_MISMATCH',
                        msg: "Cannot assign to immutable variable 'x'",
                    },
                    {
                        kind: 'error',
                        code: 'MUTABILITY_MISMATCH',
                        msg: "Cannot assign to immutable variable 'x'",
                    }
                ]
            },
        ],

        MutabilityMustSucceed: [
            // Mutable variable assignment
            {
                input: 'let mut x = 10; x = 20;',
                success: true,
                diagnostics: []
            },

            // Multiple mutable assignments
            {
                input: 'fn T_ST() { let mut x = 5; x = 10; x = 15; }',
                success: true,
                diagnostics: []
            },

            // Mutable in loop
            {
                input: 'fn T_ST() { let mut i = 0; while (i < 10) { i = i + 1; } }',
                success: true,
                diagnostics: []
            },
        ],
    };

    const ComptimeValidation = {
        ComptimeMustSucceed: [
            // let array size
            {
                input: 'let x = 10; let arr: [x]i32;',
                success: true,
                diagnostics: []
            },

            // Literal array size
            {
                input: 'let arr: [10]i32;',
                success: true,
                diagnostics: []
            },

            // Const expression array size
            {
                input: 'let SIZE = 10; let arr: [SIZE]i32;',
                success: true,
                diagnostics: []
            },

            // Comptime arithmetic
            {
                input: 'let arr: [(5 + 5)]i32;',
                success: true,
                diagnostics: []
            },
        ],
    };

    const ErrorUnionValidation = {
        ErrorUnionMustFail: [
            // Undefined error in union
            {
                input: 'fn T_ST() -> UndefinedError!i32 { return 42; }',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'UNDEFINED_IDENTIFIER',
                    msg: "Undefined type 'UndefinedError'",
                }]
            },
        ],

        ErrorUnionMustSucceed: [
            // Valid error union
            {
                input: 'def MyError = errset{NotFound, Invalid}; fn T_ST() -> MyError!i32 { return 42; }',
                success: true,
                diagnostics: []
            },
        ],
    };

    const SwitchExhaustiveness = {
        SwitchMustFail: [
            // Non-exhaustive enum switch
            {
                input: `
                    def Color = enum { Red, Green, Blue };
                    fn T_ST(c: Color) {
                        match (c) {
                            Color.Red=> {}
                            Color.Green=> {}
                        }
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Switch is not exhaustive. Missing variants: Blue",
                }]
            },

            // Non-exhaustive boolean switch
            {
                input: `
                    fn T_ST(b: bool) {
                        match (b) {
                            true => {}
                        }
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: 'Match on boolean must handle both true and false cases or have a default',
                }]
            },
        ],

        SwitchMustSucceed: [
            // Exhaustive enum switch
            {
                input: `
                    def Color = enum { Red, Green, Blue };
                    fn T_ST(c: Color) {
                        match (c) {
                            Color.Red=> {}
                            Color.Green=> {}
                            Color.Blue=> {}
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Switch with default case
            {
                input: `
                    def Color = enum { Red, Green, Blue };
                    fn T_ST(c: Color) {
                        match (c) {
                            Color.Red=> {}
                            default=> {}
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Exhaustive boolean switch
            {
                input: `
                    fn T_ST(b: bool) {
                        match (b) {
                            true => {}
                            false => {}
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },
        ],
    };

    const ComplexIntegration = {
        IntegrationMustFail: [
            // Multiple validation failures
            {
                input: `
                    def Point = struct { pub x: i32 = true; pub y: i32 };
                    fn distance(p: Point) -> bool {
                        return p.x + p.y;
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        msg: "Field 'x' initializer type 'bool' doesn't match field type 'i32'",
                    },
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        msg: "Return type 'i32' doesn't match function return type 'bool'",
                    }
                ]
            },

            // Circular type with wrong return and mutability
            {
                input: `
                    def Node = struct { value: i32; next: Node };
                    fn create() -> Node {
                        let n: Node;
                        n = n;
                        return "invalid";
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'MUTABILITY_MISMATCH',
                        msg: "Cannot assign to immutable variable 'n'",
                    },
                    {
                        kind: 'error',
                        code: 'USED_BEFORE_INITIALIZED',
                        msg: "Variable 'n' used before initialization",
                    },
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        msg: "Direct self-reference in type 'Node'. Use pointer or optional to break the cycle.",
                    },
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        msg: "Circular type dependency detected for 'n'. Use pointer or optional to break the cycle.",
                    },
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        msg: "Return type '[]u8' doesn't match function return type 'Node'",
                    }
                ]
            },
        ],

        IntegrationMustSucceed: [

            // Complex valid code
            {
                input: `
                    def Result = enum { Ok: i32, Err: []u8 };
                    def Point = struct { x: i32; y: i32 };

                    // fn calculate(p: Point) -> i32 {
                    //     let mut sum = p.x;
                    //     sum = sum + p.y;
                    //     return sum;
                    // }

                    // pub fn main() {
                    //     let p: Point = { x: 1, y: 2 };
                    //     let result = calculate(p);
                    // }
                `,
                success: true,
                diagnostics: []
            },

            // Valid recursive type with pointer
            {
                input: `
                    def Node = struct {
                        pub value: i32;
                        pub next: *Node
                    };

                    fn traverse(n: *Node) -> i32 {
                        if (n == null) {
                            return 0;
                        }
                        return n.*.value + traverse(n.*.next);
                    }
                `,
                success: true,
                diagnostics: []
            },
        ],
    };

    const StructConstructorValidation = {
        StructConstructorMustFail: [
            // Missing required field
            {
                name: 'Constructor missing required field',
                input: 'def Point = struct { x: i32; y: i32 } let p = new Point { x: 10 };',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Missing required field 'y' in struct initialization",
                }]
            },

            // Invalid field in constructor
            {
                name: 'Constructor with invalid field',
                input: 'def Point = struct { x: i32; y: i32 } let p = new Point { x: 10, y: 20, z: 30 };',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'SYMBOL_NOT_FOUND',
                    msg: "Struct 'Point' has no field 'z'",
                }]
            },

            // Type mismatch in field value
            {
                name: 'Constructor field type mismatch',
                input: 'def Point = struct { x: i32; y: i32 } let p = new Point { x: true, y: 20 };',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Field 'x' expects type 'i32' but got 'bool'",
                }]
            },

            // Multiple field errors
            {
                name: 'Multiple constructor errors',
                input: 'def Point = struct { x: i32; y: i32 } let p = new Point { x: true, z: 30 };',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'SYMBOL_NOT_FOUND',
                        msg: "Struct 'Point' has no field 'z'",
                    },
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        msg: "Missing required field 'y' in struct initialization",
                    },
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        msg: "Field 'x' expects type 'i32' but got 'bool'",
                    }
                ]
            },
        ],

        StructConstructorMustSucceed: [
            // Valid constructor
            {
                name: 'Valid struct constructor',
                input: 'def Point = struct { x: i32; y: i32 } let p = Point { x: 10, y: 20 };',
                success: true,
                diagnostics: []
            },

            // Constructor with default values
            {
                name: 'Constructor with partial fields (defaults)',
                input: 'def Point = struct { x: i32 = 0; y: i32 = 0 } let p = Point { x: 10 };',
                success: true,
                diagnostics: []
            },

            // Empty constructor with all defaults
            {
                name: 'Empty constructor with defaults',
                input: 'def Point = struct { x: i32 = 0; y: i32 = 0 } let p = Point {};',
                success: true,
                diagnostics: []
            },

            // Constructor with type inference
            {
                name: 'Constructor without explicit type',
                input: 'def Point = struct { x: i32; y: i32 } let p = Point { x: 10, y: 20 };',
                success: true,
                diagnostics: []
            },
        ],
    };

    const StructMethodValidation = {
        StructMethodMustFail: [
            // Invalid field access in method
            {
                name: 'Method accessing non-existent field',
                input: `
                    def Point = struct {
                        x: i32;
                        fn getZ() -> i32 {
                            return self.z;
                        }
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'UNDEFINED_IDENTIFIER',
                }]
            },

            // Method call with wrong arguments
            {
                name: 'Method call with type mismatch',
                input: `
                    def Point = struct {
                        mut x: i32;
                        pub fn setX(newX: i32) {
                            self.x = newX;
                        }
                    }
                    fn T_ST(p: Point) {
                        p.setX(true);
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Argument type 'bool' is not assignable to parameter type 'i32'",
                }]
            },
        ],

        StructMethodMustSucceed: [
            // Valid method call
            {
                name: 'Valid struct method call',
                input: `
                    def Point = struct {
                        x: i32;
                        y: i32;
                        pub fn getX() -> i32 {
                            return self.x;
                        }
                    }
                    fn T_ST(p: Point) {
                        let x = p.getX();
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Method with parameters
            {
                name: 'Method with parameters',
                input: `
                    def Point = struct {
                        x: i32;
                        pub fn add(dx: i32) -> i32 {
                            return (self.x + dx);
                        }
                    }
                    fn T_ST(p: Point) {
                        let result = p.add(5);
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Direct field access (implicit self)
            {
                name: 'Direct field access in method',
                input: `
                    def Point = struct {
                        x: i32;
                        y: i32;
                        fn sum() -> i32 {
                            return (x + y);
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },
        ],
    };

    const MemberAccessValidation = {
        MemberAccessMustFail: [
            // Member access on undefined variable
            {
                name: 'Member access on undefined',
                input: 'let x = undefined_var.field;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'UNDEFINED_IDENTIFIER',
                }]
            },

            // Chained access with invalid member
            {
                name: 'Invalid member in chain',
                input: `
                    def Inner = struct { pub val: i32 }
                    def Outer = struct { pub inner: Inner }
                    let o: Outer = new Outer { inner: new Inner { val: 0 as i32 } };
                    let x = o.inner.invalid;
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'SYMBOL_NOT_FOUND',
                }]
            },
        ],

        MemberAccessMustSucceed: [
            // Use proper constructor syntax
            {
                name: 'Simple field access',
                input: 'def Point = struct { pub x: i32 }; let p = Point { x: 5 }; let x = p.x;',
                success: true,
                diagnostics: []
            },

            // Chained member access
            {
                name: 'Chained member access',
                input: `
                    def Inner = struct { pub val: i32; };
                    def Outer = struct { pub inner: Inner; };
                    let o = new Outer {
                        inner : new Inner { val: 0,  },
                    };
                    let v = o.inner.val;
                `,
                success: true,
                diagnostics: []
            },

            // This one is tricky - optional chaining on null
            {
                input: 'def Point = struct { pub x: i32 } let p: ?Point = null; let x = p.x;',
                success: true,
                diagnostics: []
            }
        ]
    };

    const EnumValidation = {
        EnumMustFail: [
            // Invalid variant access
            {
                name: 'Accessing non-existent variant',
                input: `
                    def Color = enum { Red, Green, Blue }
                    let c = Color.Yellow;
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'SYMBOL_NOT_FOUND',
                    msg: "Enum variant 'Yellow' not found",
                }]
            },
        ],

        EnumMustSucceed: [
            // Valid enum usage
            {
                name: 'Valid enum variant access',
                input: `
                    def Color = enum { Red, Green, Blue }
                    let c = Color.Red;
                `,
                success: true,
                diagnostics: []
            },

            // Enum with typed variants
            {
                name: 'Enum variant with type',
                input: `
                    def Option = enum { Some: i32, None }
                    let o = Option.Some(0 as i32);
                `,
                success: true,
                diagnostics: []
            },
        ],
    };

    const ArrayAccessValidation = {
        ArrayAccessMustFail: [
            // Non-integer index
            {
                name: 'Array index with non-integer',
                input: 'let arr: [3]i32; let x = arr[true];',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: "USED_BEFORE_INITIALIZED",
                        msg: "Variable 'arr' used before initialization",
                    },
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        msg: "Array index must be integer type, got 'bool'",
                    }
                ]
            },

            // Indexing non-array
            {
                name: 'Indexing non-array type',
                input: 'let x: i32 = 10; let y = x[0];',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Cannot index non-array type 'i32'",
                }]
            },
        ],

        ArrayAccessMustSucceed: [
            // Valid array access
            {
                name: 'Valid array indexing',
                input: 'let arr: [3]i32 = [0 as i32,0 as i32,0 as i32,]; let x = arr[0];',
                success: true,
                diagnostics: []
            },

            // String indexing
            {
                name: 'String indexing',
                input: 'let s = "hello"; let c = s[0];',
                success: true,
                diagnostics: []
            },
        ],
    };

    const UnionTypeValidation = {
        UnionMustSucceed: [
            // Union type assignment
            {
                name: 'Union type with compatible value',
                input: 'def IntOrBool = i32 | bool; let x: IntOrBool = 42;',
                success: true,
                diagnostics: []
            },

            // Union with bool
            {
                name: 'Union accepting bool',
                input: 'def IntOrBool = i32 | bool; let x: IntOrBool = true;',
                success: true,
                diagnostics: []
            },
        ],
    };

    const DereferenceValidation = {
        DereferenceMustFail: [
            // Dereference non-pointer
            {
                name: 'Dereferencing non-pointer',
                input: 'let x: i32 = 10; let y = x.*;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Cannot dereference non-pointer type 'i32'",
                }]
            },

            // {
            //     name: 'Dereferencing non-pointer',
            //     input: 'let x: i32 = 10; let y = *x;',
            //     success: false,
            //     diagnostics: [{
            //         kind: 'error',
            //         code: 'TYPE_MISMATCH',
            //         msg: "Cannot use pointer syntax with variable 'x'. Did you mean to dereference using '.*' postfix operator?",
            //     }]
            // },
        ],

        DereferenceMustSucceed: [
            // Valid dereference
            {
                name: 'Valid pointer dereference',
                input: 'let ptr: *i32 = null; let val = ptr.*;',
                success: true,
                diagnostics: []
            },
        ],
    };

    const BitwiseOperationValidation = {
        BitwiseMustFail: [
            // Bitwise on non-integer
            {
                name: 'Bitwise operation on bool',
                input: 'let x = (true & false);',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Bitwise operations require integer types, got 'bool' and 'bool'",
                }]
            },

            // Bitwise on float
            {
                name: 'Bitwise operation on float',
                input: 'let x = (1.5 | 2.5);',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Bitwise operations require integer types, got 'cflt' and 'cflt'",
                }]
            },
        ],

        BitwiseMustSucceed: [
            // Valid bitwise operations
            {
                name: 'Bitwise AND on integers',
                input: 'let x = (5 & 3);',
                success: true,
                diagnostics: []
            },

            {
                name: 'Bitwise OR on integers',
                input: 'let x = (5 | 3);',
                success: true,
                diagnostics: []
            },

            {
                name: 'Bitwise XOR on integers',
                input: 'let x = (5 ^ 3);',
                success: true,
                diagnostics: []
            },

            {
                name: 'Bitwise shift',
                input: 'let x = (5 << 2);',
                success: true,
                diagnostics: []
            },
        ],
    };

    const IncrementDecrementValidation = {
        IncrementDecrementMustFail: [
            // Increment non-numeric
            {
                name: 'Increment boolean',
                input: 'let x = true; ++x;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Increment requires a numeric operand",
                }]
            },

            // Decrement non-numeric
            {
                name: 'Decrement boolean',
                input: 'let x = true; --x;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Decrement requires a numeric operand",
                }]
            },
        ],

        IncrementDecrementMustSucceed: [
            // Valid increment/decrement
            {
                name: 'Increment integer',
                input: 'let mut x: i32 = 0; ++x;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Decrement integer',
                input: 'let mut x: i32 = 0; --x;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Post-increment',
                input: 'let mut x: i32 = 0; x++;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Post-decrement',
                input: 'let mut x: i32 = 0; x--;',
                success: true,
                diagnostics: []
            },
        ],
    };

    const TypeCastValidation = {
        TypeCastMustFail: [
            // Invalid cast
            {
                name: 'Cannot cast array to bool',
                input: 'let x = [1,2,3] as bool;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Cannot convert type '[]cint' to type 'bool'",
                }]
            },
        ],

        TypeCastMustSucceed: [
            // Valid casts
            {
                name: 'Integer to float',
                input: 'let x = 10 as f32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Unsigned to signed',
                input: 'let x = (10 as u32) as i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Pointer cast',
                input: 'let p0: i32 = 0 as i32; let p1: *i32 = &p0; let p2 = p1 as *u32;',
                success: true,
                diagnostics: []
            },
        ],
    };

    const NestedTypeValidation = {
        NestedTypeMustSucceed: [
            // Deeply nested structs
            {
                name: 'Nested struct types',
                input: `
                    def Inner = struct { val: i32 }
                    def Middle = struct { inner: Inner }
                    def Outer = struct { middle: Middle }
                    let o: Outer;
                `,
                success: true,
                diagnostics: []
            },

            // Nested enums
            {
                name: 'Enum with struct variant',
                input: `
                    def Result = enum {
                        Ok: struct { value: i32 },
                        Err: struct { msg: []u8 }
                    }
                `,
                success: true,
                diagnostics: []
            },
        ],
    };

    const AnonymousTypeValidation = {
        AnonymousMustSucceed: [
            // Anonymous struct
            {
                name: 'Anonymous struct variable',
                input: 'let p = struct { x: i32; y: i32 };',
                success: true,
                diagnostics: []
            },

            // Anonymous enum
            {
                name: 'Anonymous enum variable',
                input: 'let c = enum { Red, Green, Blue };',
                success: true,
                diagnostics: []
            },

            // Anonymous struct in parameter
            {
                name: 'Anonymous struct parameter',
                input: 'fn process(data: struct { x: i32 }) {}',
                success: true,
                diagnostics: []
            },
        ],
    };

    const ErrorHandlingValidation = {
        ErrorHandlingMustSucceed: [
            // // Try expression
            {
                name: 'Try expression',
                input: 'fn op() -> i32 { return 42; } fn T_ST() { let x = try op(); }',
                success: true,
                diagnostics: []
            },

            // Catch expression
            {
                name: 'Catch expression',
                input: 'fn op() -> i32 { return 42 as i32; } fn T_ST() { let x = op() catch { return 0; }; }',
                success: true,
                diagnostics: []
            },

            // Error union type
            {
                name: 'Error union in function',
                input: `
                    def FileError = errset{ NotFound, IOError }
                    fn readFile() -> FileError!i32 {
                        return 42;
                    }
                `,
                success: true,
                diagnostics: []
            },
        ],
    };

    const ComplexIntegrationTests = {
        ComplexMustFail: [
            // Multiple type errors
            {
                name: 'Multiple type mismatches',
                input: `
                    fn process(x: i32, y: bool) -> i32 {
                        return (x + y);
                    }
                    fn T_ST() {
                        let result = process(true, 42);
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        "msg": "Cannot perform Additive operation on non-numeric types 'i32' and 'bool'"
                    },
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        "msg": "Argument type 'bool' is not assignable to parameter type 'i32'"
                    },
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        "msg": "Argument type 'cint' is not assignable to parameter type 'bool'"
                    },
                ]
            },

            // Struct with method errors
            {
                name: 'Struct method with multiple errors',
                input: `
                    def Point = struct {
                        x: i32;
                        fn bad() -> bool {
                            return (self.x + self.y);
                        }
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'UNDEFINED_IDENTIFIER',
                        msg: "Undefined identifier 'y'"
                    },
                ]
            },
        ],

        ComplexMustSucceed: [
            // Complex valid code
            {
                name: 'Complex struct with methods',
                input: `
                    def Point = struct {
                        pub mut x: i32;
                        pub mut y: i32;
                        pub fn distance() -> i32 {
                            return ((self.x * self.x) + (self.y * self.y));
                        }
                        pub fn scale(factor: i32) {
                            self.x = (self.x * factor);
                            self.y = (self.y * factor);
                        }
                    }
                    fn main() {
                        let mut p = Point { x: 3, y: 4 };
                        let d = p.distance();
                        p.scale(2);
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Generic-like pattern
            {
                name: 'Type alias pattern',
                input: `
                    def IntList = [10]i32;
                    def BoolList = [10]bool;
                    fn processInts(list: IntList) {}
                    fn processBools(list: BoolList) {}
                `,
                success: true,
                diagnostics: []
            },
        ],
    };

    const RangeValidation = {
        RangeMustFail: [
            // Non-integer range
            {
                name: 'Range with float',
                input: 'let r = 0.5..10.5;',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        msg: "Range start must be integer type, got 'cflt'",
                    },
                    {
                        kind: 'error',
                        code: 'TYPE_MISMATCH',
                        msg: "Range end must be integer type, got 'cflt'",
                    }
                ]
            },
        ],

        RangeMustSucceed: [
            // Valid range
            {
                name: 'Integer range',
                input: 'let r = 0..10;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Variable range',
                input: 'let start = 0; let end = 10; let r = start..end;',
                success: true,
                diagnostics: []
            },
        ],
    };

    const OrelseValidation = {
        OrelseMusSucceed: [
            // Orelse with optional
            {
                name: 'Orelse with optional type',
                input: 'let x: ?i32 = null; let y = x ?? 0;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Orelse chaining',
                input: 'let a: ?i32 = null; let b: ?i32 = null; let c = a ?? b ?? 0;',
                success: true,
                diagnostics: []
            },
        ],
    };

    const LogicalOperationValidation = {
        LogicalMustSucceed: [
            // Logical operations
            {
                name: 'Logical AND',
                input: 'let x = (true and false);',
                success: true,
                diagnostics: []
            },

            {
                name: 'Logical OR',
                input: 'let x = (true or false);',
                success: true,
                diagnostics: []
            },

            {
                name: 'Logical NOT',
                input: 'let x = !true;',
                success: true,
                diagnostics: []
            },
        ],
    };

    const IfElseValidation = {
        IfElseMustSucceed: [
            // If without else
            {
                name: 'If without else',
                input: 'fn T_ST() { if (true) { let x = 1; } }',
                success: true,
                diagnostics: []
            },

            // If with else
            {
                name: 'If with else',
                input: 'fn T_ST() { if (true) { let x = 1; } else { let y = 2; } }',
                success: true,
                diagnostics: []
            },

            // Nested if
            {
                name: 'Nested if expressions',
                input: `
                    fn T_ST() {
                        if (true) {
                            if (false) {
                                let x = 1;
                            }
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },
        ],
    };

    const WhileLoopValidation = {
        WhileMustSucceed: [
            // Basic while
            {
                name: 'Basic while loop',
                input: 'fn T_ST() { while (true) { let x = 1; } }',
                success: true,
                diagnostics: []
            },

            // While with break
            {
                name: 'While with counter',
                input: `
                    fn T_ST() {
                        let mut i: i32 = 0;
                        while (i < 10) {
                            i = (i + 1);
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },
        ],
    };

    const ForLoopValidation = {
        ForMustSucceed: [
            // For loop with range
            {
                name: 'For loop with range',
                input: 'fn T_ST() { for (0..10) { let x = 1; } }',
                success: true,
                diagnostics: []
            },

            // For with variable range
            {
                name: 'For with variable range',
                input: `
                    fn T_ST() {
                        let start = 0;
                        let end = 10;
                        for (start..end) {
                            let x = 1;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },
        ],
    };

    const EdgeCases = {
        EdgeMustSucceed: [
            // Empty function
            {
                name: 'Empty function',
                input: 'fn empty() {}',
                success: true,
                diagnostics: []
            },

            // Multiple return paths
            {
                name: 'Multiple return paths',
                input: `
                    fn T_ST(x: bool) -> i32 {
                        if (x) {
                            return 1;
                        } else {
                            return 2;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Deeply nested expressions
            {
                name: 'Deeply nested arithmetic',
                input: 'let x = (((1 + 2) * (3 - 4)) / (5 + 6));',
                success: true,
                diagnostics: []
            },
        ],
    };

    const VisibilityValidationTests = {
        VisibilityMustFail: [
            // Static visibility on regular variable
            {
                input: 'static let x: i32 = 10;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'INVALID_VISIBILITY',
                    msg: "Variable 'x' cannot be 'static' outside of struct/enum"
                }]
            },

            // Static struct field
            {
                input: `
                    def Point = struct {
                        static mut x: i32;
                        y: i32
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'INVALID_VISIBILITY',
                    msg: "Static field 'x' cannot be mutable. Static fields must be immutable."
                }]
            }
        ],

        VisibilityMustSucceed: [
            // Static method in struct is OK
            {
                input: `
                    def Point = struct {
                        x: i32;
                        y: i32;
                        static fn origin() -> Point {
                            return new Point { x: 0, y: 0 };
                        }
                    }
                `,
                success: true,
                diagnostics: []
            }
        ]
    };

    const MutabilityValidationTests = {
        // MutabilityMustFail: [
        //     // fields immutable by defeult (everything in kemet is const by defualt)
        //     // Cannot modify immutable field
        //     {
        //         input: `
        //             def Point = struct {
        //                 pub x: i32;
        //                 pub y: i32;
        //             }
        //             fn T_ST(p: Point) {
        //                 p.x = 10;
        //             }
        //         `,
        //         success: false,
        //         diagnostics: [{
        //             kind: 'error',
        //             code: 'SYMBOL_NOT_FOUND',
        //             msg: "Cannot access private field 'x' from outside struct"
        //         }]
        //     },

        //     // Cannot modify parameter (IF NOT 'mut')
        //     {
        //         input: `
        //             fn T_ST(x: i32) {
        //                 x = 20;
        //             }
        //         `,
        //         success: false,
        //         diagnostics: [{
        //             kind: 'error',
        //             code: 'MUTABILITY_MISMATCH',
        //             msg: "Cannot assign to immutable parameter 'x'"
        //         }]
        //     },
        //     {
        //         input: `
        //             fn T_ST(mut x: i32) {
        //                 x = 20;
        //             }
        //         `,
        //         success: true,
        //         diagnostics: []
        //     }
        // ],

        // THIIIIS
        MutabilityMustSucceed: [
            // Mutable field assignment is OK
            {
                input: `
                    def Point = struct {
                        pub mut x: i32;
                        pub mut y: i32
                    }
                    fn T_ST(p: Point) {
                        p.x = 10;
                        p.y = 20;
                    }
                `,
                success: true,
                diagnostics: []
            }
        ]
    };

    const ArrayInferenceTests = {
        ArrayInferenceMustSucceed: [
            // Array size inferred from literal
            {
                input: 'let a: []i32 = [1, 2, 3];',
                success: true,
                diagnostics: []
            },

            // Array size inferred and propagated
            {
                input: `
                    def MyArray = []i32;
                    let a: MyArray = [1, 2, 3, 4, 5];
                `,
                success: true,
                diagnostics: []
            }
        ]
    };

    const OptionalAndPointerTests = {
        OptionalMustSucceed: [
            // Nested optional member access
            {
                input: `
                    def Inner = struct { pub value: i32 }
                    def Outer = struct { pub inner: ?Inner }
                    let o: ?Outer = null;
                    let v : i32 | null_t = o?.inner?.value ?? null;
                `,
                success: true,
                diagnostics: []
            },

            // Optional chaining
            {
                input: `
                    def C = struct { pub value: i32 }
                    def B = struct { pub c: ?C }
                    def A = struct { pub b: ?B }

                    let a: ?A = null;
                    let v = a?.b?.c?.value ?? null;
                `,
                success: true,
                diagnostics: []
            }
        ],

        PointerMustSucceed: [
            // Pointer dereference chain
            {
                input: `
                    def Node = struct {
                        pub value: i32;
                        pub next: *Node;
                    }
                    fn getNextValue(n: *Node) -> i32 {
                        return n.*.next.*.value;
                    }
                `,
                success: true,
                diagnostics: []
            }
        ]
    };

    const ReferenceAndDereferenceTests = {
        ReferenceMustSucceed: [
            // Taking reference
            {
                input: `
                    let x: i32 = 10;
                    let ptr: *i32 = &x;
                `,
                success: true,
                diagnostics: []
            },

            // Mutable reference
            {
                input: `
                    let mut x: i32 = 10;
                    let ptr: *mut i32 = &x;
                `,
                success: true,
                diagnostics: []
            }
        ],

        DereferenceMustSucceed: [
            // Basic dereference
            {
                input: `
                    let x: i32 = 10;
                    let ptr: *i32 = &x;
                    let y: i32 = ptr.*;
                `,
                success: true,
                diagnostics: []
            }
        ]
    };

    const ComptimeExpressionTests = {
        ComptimeExprMustSucceed: [
            // Literal sizes
            {
                name: 'Simple literal size',
                input: 'let arr: [10]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Large literal size',
                input: 'let arr: [1000]i32;',
                success: true,
                diagnostics: []
            },

            // Const variable reference
            {
                name: 'Immutable variable size',
                input: 'let SIZE = 10; let arr: [SIZE]i32;',
                success: true,
                diagnostics: []
            },

            // Arithmetic operations
            {
                name: 'Addition in size',
                input: 'let arr: [(5 + 5)]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Subtraction in size',
                input: 'let arr: [(20 - 5)]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Multiplication in size',
                input: 'let arr: [(5 * 3)]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Division in size',
                input: 'let arr: [(20 / 4)]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Modulo in size',
                input: 'let arr: [(17 % 5)]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Power in size',
                input: 'let arr: [(2 ** 3)]i32;',
                success: true,
                diagnostics: []
            },

            // Complex expressions
            {
                name: 'Parenthesized expression',
                input: 'let arr: [((5 + 3) * 2)]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Nested arithmetic',
                input: 'let arr: [((((10 + 5) * 2)) / 3)]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Mixed operations',
                input: 'let arr: [((10 + 5) * (20 - 15))]i32;',
                success: true,
                diagnostics: []
            },

            // Bitwise operations
            {
                name: 'Bitwise AND in size',
                input: 'let arr: [(15 & 7)]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Bitwise OR in size',
                input: 'let arr: [(8 | 4)]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Bitwise XOR in size',
                input: 'let arr: [(15 ^ 7)]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Left shift in size',
                input: 'let arr: [(1 << 3)]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Right shift in size',
                input: 'let arr: [(32 >> 2)]i32;',
                success: true,
                diagnostics: []
            },

            // Unary operations
            {
                name: 'Unary plus in size',
                input: 'let arr: [+10]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Bitwise NOT in size',
                input: 'let arr: [~(-11)]i32;',
                success: true,
                diagnostics: []
            },

            // Using const expressions
            {
                name: 'Multiple const variables',
                input: 'let A = 5; let B = 3; let arr: [(A + B)]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Nested const reference',
                input: 'let BASE = 10; let SIZE = (BASE * 2); let arr: [SIZE]i32;',
                success: true,
                diagnostics: []
            },

            // Type cast in size
            {
                name: 'Type cast in size',
                input: 'let arr: [10 as i32]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Type cast with expression',
                input: 'let arr: [(5 + 5) as i32]i32;',
                success: true,
                diagnostics: []
            },

            // Edge cases
            {
                name: 'Maximum reasonable size',
                input: 'let arr: [1000000]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'Size of 1',
                input: 'let arr: [1]i32;',
                success: true,
                diagnostics: []
            },
        ],
    };

    const StaticTests = {
        TempName: [
            {
                name: 'TempName 1',
                input: `
                pub def Printer = struct {
                    static fn printAny(val: any) -> void {
                    }

                    static fn printNum(val: i32) -> void {
                        return Printer.printAny(val)
                    }
                };
                `,
                success: true,
                diagnostics: []
            },
        ]
    };

    const ComptimeEvaluatorTests = {
        // ═══════════════════════════ BASIC OPERATIONS ═══════════════════════════

        EvaluatorBasicMustSucceed: [
            // Integer literals
            {
                name: 'Simple integer literal',
                input: 'let arr: [10]i32;',
                success: true,
                diagnostics: []
            },
            {
                name: 'Large integer literal',
                input: 'let arr: [1000000]i32;',
                success: true,
                diagnostics: []
            },

            // Arithmetic operations
            {
                name: 'Addition',
                input: 'let arr: [(5 + 3)]i32;',
                success: true,
                diagnostics: []
            },
            {
                name: 'Subtraction',
                input: 'let arr: [(10 - 3)]i32;',
                success: true,
                diagnostics: []
            },
            {
                name: 'Multiplication',
                input: 'let arr: [(4 * 5)]i32;',
                success: true,
                diagnostics: []
            },
            {
                name: 'Division',
                input: 'let arr: [(20 / 4)]i32;',
                success: true,
                diagnostics: []
            },
            {
                name: 'Modulo',
                input: 'let arr: [(17 % 5)]i32;',
                success: true,
                diagnostics: []
            },
            {
                name: 'Power',
                input: 'let arr: [(2 ** 3)]i32;',
                success: true,
                diagnostics: []
            },

            // Bitwise operations
            {
                name: 'Bitwise AND',
                input: 'let arr: [(15 & 7)]i32;',
                success: true,
                diagnostics: []
            },
            {
                name: 'Bitwise OR',
                input: 'let arr: [(8 | 4)]i32;',
                success: true,
                diagnostics: []
            },
            {
                name: 'Bitwise XOR',
                input: 'let arr: [(15 ^ 7)]i32;',
                success: true,
                diagnostics: []
            },
            {
                name: 'Left shift',
                input: 'let arr: [(1 << 3)]i32;',
                success: true,
                diagnostics: []
            },
            {
                name: 'Right shift',
                input: 'let arr: [(32 >> 2)]i32;',
                success: true,
                diagnostics: []
            },

            // Unary operations
            {
                name: 'Unary plus',
                input: 'let arr: [+10]i32;',
                success: true,
                diagnostics: []
            },
            {
                name: 'Unary minus',
                input: 'let arr: [(~(-11))]i32;',
                success: true,
                diagnostics: []
            },

            // Complex expressions
            {
                name: 'Nested arithmetic',
                input: 'let arr: [(((5 + 3) * 2) / 4)]i32;',
                success: true,
                diagnostics: []
            },
            {
                name: 'Multiple operations',
                input: 'let arr: [((10 + 5) * (20 - 15))]i32;',
                success: true,
                diagnostics: []
            },
        ],

        // ═══════════════════════════ TYPE ERRORS ═══════════════════════════

        EvaluatorTypeMustFail: [
            // Boolean in arithmetic
            {
                name: 'Addition with boolean',
                input: 'let arr: [(2 + true)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Cannot perform Additive operation on incompatible types 'int' and 'bool'"
                }]
            },
            {
                name: 'Boolean in subtraction',
                input: 'let arr: [(5 - false)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Cannot perform Additive operation on incompatible types 'int' and 'bool'"
                }]
            },
            {
                name: 'Boolean in multiplication',
                input: 'let arr: [(3 * true)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Cannot perform Multiplicative operation on incompatible types 'int' and 'bool'"
                }]
            },

            // Boolean in bitwise
            {
                name: 'Bitwise AND with boolean',
                input: 'let arr: [(5 & true)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Cannot perform BitwiseAnd operation on incompatible types 'int' and 'bool'"
                }]
            },
            {
                name: 'Bitwise OR with boolean',
                input: 'let arr: [(3 | false)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Cannot perform BitwiseOr operation on incompatible types 'int' and 'bool'"
                }]
            },

            // Shift with non-integer
            {
                name: 'Left shift with boolean',
                input: 'let arr: [(5 << true)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Cannot perform Shift operation on incompatible types 'int' and 'bool'"
                }]
            },

            // Unary on wrong type
            {
                name: 'Unary minus on boolean',
                input: 'let arr: [(-true)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Unary '-' requires numeric operand, got 'bool'"
                }]
            },
            {
                name: 'Bitwise NOT on boolean',
                input: 'let arr: [(~true)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Bitwise not requires integer operand, got 'bool'"
                }]
            },

            {
                name: 'Bitwise AND produces zero',
                input: 'let arr: [((5 + 3) & 7)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: 'Array size must be positive, got 0'
                }]
            }
        ],

        // ═══════════════════════════ OVERFLOW ERRORS ═══════════════════════════

        EvaluatorOverflowMustFail: [
            // Addition overflow
            {
                name: 'Integer addition overflow',
                input: 'let arr: [(9223372036854775807 + 1)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'ARITHMETIC_OVERFLOW'
                }]
            },

            // Subtraction overflow
            {
                name: 'Integer subtraction overflow',
                input: 'let arr: [(-9223372036854775808 - 1)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'ARITHMETIC_OVERFLOW'
                }]
            },

            // Multiplication overflow
            {
                name: 'Integer multiplication overflow',
                input: 'let arr: [(9223372036854775807 * 2)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'ARITHMETIC_OVERFLOW'
                }]
            },

            // Power overflow
            {
                name: 'Integer power overflow',
                input: 'let arr: [(2 ** 100)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'ARITHMETIC_OVERFLOW'
                }]
            },

            // Negation overflow (MIN_INT)
            {
                name: 'Negation overflow',
                input: 'let arr: [(-(-9223372036854775808))]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'ARITHMETIC_OVERFLOW'
                }]
            },
        ],

        // ═══════════════════════════ DIVISION ERRORS ═══════════════════════════

        EvaluatorDivisionMustFail: [
            // Division by zero
            {
                name: 'Division by zero literal',
                input: 'let arr: [(10 / 0)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'DIVISION_BY_ZERO',
                    msg: 'Division by zero in compile-time expression'
                }]
            },
            {
                name: 'Division by zero expression',
                input: 'let arr: [(10 / (5 - 5))]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'DIVISION_BY_ZERO',
                    msg: 'Division by zero in compile-time expression'
                }]
            },

            // Modulo by zero
            {
                name: 'Modulo by zero literal',
                input: 'let arr: [(10 % 0)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'DIVISION_BY_ZERO',
                    msg: 'Modulo by zero in compile-time expression'
                }]
            },
            {
                name: 'Modulo by zero expression',
                input: 'let arr: [(17 % (3 - 3))]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'DIVISION_BY_ZERO',
                    msg: 'Modulo by zero in compile-time expression'
                }]
            },
        ],

        // ═══════════════════════════ SHIFT ERRORS ═══════════════════════════

        EvaluatorShiftMustFail: [
            // Negative shift
            {
                name: 'Negative left shift',
                input: 'let arr: [(5 << (-1))]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'ANALYSIS_ERROR',
                    msg: 'Negative shift amount not allowed'
                }]
            },
            {
                name: 'Negative right shift',
                input: 'let arr: [(5 >> (-1))]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'ANALYSIS_ERROR',
                    msg: 'Negative shift amount not allowed'
                }]
            },

            // Excessive shift
            {
                name: 'Shift amount too large',
                input: 'let arr: [(5 << 64)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'ANALYSIS_ERROR',
                    msg: 'Shift amount too large (max 63 bits)'
                }]
            },
            {
                name: 'Shift amount way too large',
                input: 'let arr: [(5 << 1000)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'ANALYSIS_ERROR',
                    msg: 'Shift amount too large (max 63 bits)'
                }]
            },
        ],

        // ═══════════════════════════ POWER ERRORS ═══════════════════════════

        EvaluatorPowerMustFail: [
            // Negative exponent
            {
                name: 'Negative exponent',
                input: 'let arr: [(5 ** (-1))]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'ANALYSIS_ERROR',
                    msg: 'Negative exponent not allowed in compile-time integer expression'
                }]
            },

            // Excessive exponent
            {
                name: 'Exponent too large',
                input: 'let arr: [(2 ** 10001)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'ARITHMETIC_OVERFLOW',
                    msg: 'Exponent too large for compile-time evaluation'
                }]
            },
        ],

        // ═══════════════════════════ COMPLEX EXPRESSIONS ═══════════════════════════

        EvaluatorComplexMustSucceed: [
            // Parenthesized expressions
            {
                name: 'Nested parentheses',
                input: 'let arr: [(((5 + 3) * 2))]i32;',
                success: true,
                diagnostics: []
            },
            {
                name: 'Multiple levels',
                input: 'let arr: [((((10 + 5) * 2)) / 3)]i32;',
                success: true,
                diagnostics: []
            },

            // Mixed operations
            {
                name: 'Shift and arithmetic',
                input: 'let arr: [((1 << 3) + 2)]i32;',
                success: true,
                diagnostics: []
            },

            // Unary in complex expressions
            {
                name: 'Unary in arithmetic',
                input: 'let arr: [((-5) + 10)]i32;',
                success: true,
                diagnostics: []
            },
            {
                name: 'Bitwise NOT in expression',
                input: 'let arr: [((~5) & 7)]i32;',
                success: true,
                diagnostics: []
            },
        ],

        EvaluatorComplexMustFail: [
            // Type mismatch in complex expressions
            {
                name: 'Boolean in nested arithmetic',
                input: 'let arr: [(((5 + true) * 2))]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Cannot perform Additive operation on incompatible types 'int' and 'bool'"
                }]
            },
            {
                name: 'Mixed invalid types',
                input: 'let arr: [((5 & true) + 2)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Cannot perform BitwiseAnd operation on incompatible types 'int' and 'bool'"
                }]
            },

            // Overflow in nested expressions
            {
                name: 'Overflow in nested expression',
                input: 'let arr: [(((9223372036854775807 + 1) * 2))]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'ARITHMETIC_OVERFLOW'
                }]
            },
        ],

        // ═══════════════════════════ CONSTANT REFERENCES ═══════════════════════════

        EvaluatorConstRefMustSucceed: [
            // Single constant
            {
                name: 'Simple const reference',
                input: 'let SIZE = 10; let arr: [SIZE]i32;',
                success: true,
                diagnostics: []
            },

            // Const in expression
            {
                name: 'Const in arithmetic',
                input: 'let BASE = 5; let arr: [(BASE * 2)]i32;',
                success: true,
                diagnostics: []
            },

            // Multiple constants
            {
                name: 'Multiple const references',
                input: 'let A = 5; let B = 3; let arr: [(A + B)]i32;',
                success: true,
                diagnostics: []
            },

            // Nested const references
            {
                name: 'Nested const definitions',
                input: 'let BASE = 10; let SIZE = (BASE * 2); let arr: [SIZE]i32;',
                success: true,
                diagnostics: []
            },
        ],

        // ═══════════════════════════ EDGE CASES ═══════════════════════════

        EvaluatorEdgeCasesMustSucceed: [
            // Zero values
            {
                name: 'Zero literal',
                input: 'let arr: [1]i32;', // Changed from [0] since size must be positive
                success: true,
                diagnostics: []
            },
            {
                name: 'Identity operations',
                input: 'let arr: [(5 + 0)]i32;',
                success: true,
                diagnostics: []
            },

            // One value
            {
                name: 'Array size of 1',
                input: 'let arr: [1]i32;',
                success: true,
                diagnostics: []
            },

            // Large valid values
            {
                name: 'Large but valid size',
                input: 'let arr: [1000000]i32;',
                success: true,
                diagnostics: []
            },

            // Identity operations
            {
                name: 'Multiply by 1',
                input: 'let arr: [(10 * 1)]i32;',
                success: true,
                diagnostics: []
            },
            {
                name: 'Add zero',
                input: 'let arr: [(10 + 0)]i32;',
                success: true,
                diagnostics: []
            },
        ],

        EvaluatorEdgeCasesMustFail: [
            // Negative size (after evaluation)
            {
                name: 'Negative array size',
                input: 'let arr: [(5 - 10)]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: 'Array size must be positive, got -5'
                }]
            },

            // Zero size
            {
                name: 'Zero array size',
                input: 'let arr: [0]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: 'Array size must be positive, got 0'
                }]
            },
        ],

        // ═══════════════════════════ REAL WORLD PATTERNS ═══════════════════════════

        EvaluatorRealWorldMustSucceed: [
            // Buffer size calculations
            {
                name: 'Buffer size pattern',
                input: 'let BLOCK = 64; let COUNT = 16; let arr: [(BLOCK * COUNT)]i32;',
                success: true,
                diagnostics: []
            },

            // Power of two calculations
            {
                name: 'Power of two size',
                input: 'let arr: [(1 << 10)]i32;',
                success: true,
                diagnostics: []
            },

            // Bit manipulation
            {
                name: 'Bit mask calculation',
                input: 'let BITS = 8; let arr: [((1 << BITS) - 1)]i32;',
                success: true,
                diagnostics: []
            },
        ],
    };

    const ThrowStatementValidation = {
        ThrowMustFail: [
            // Throw without function error type
            {
                name: 'Throw without error type',
                input: `
                    fn T_ST() {
                        throw "error";
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'THROW_WITHOUT_ERROR_TYPE',
                    msg: "Cannot throw error in function without error type. Add '!ErrorType' to function signature"
                }]
            },

            // Throw wrong error type
            {
                name: 'Throw incompatible error',
                input: `
                    def FileError = errset{ NotFound, PermissionDenied };
                    def NetworkError = errset{ Timeout, ConnectionFailed };

                    fn T_ST() -> FileError!i32 {
                        throw NetworkError.Timeout;
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'THROW_TYPE_MISMATCH',
                    msg: "Thrown error type 'Timeout' is not compatible with function error type 'FileError'"
                }]
            },

            // Throw non-error type
            {
                name: 'Throw non-error value',
                input: `
                    fn T_ST() -> err!i32 {
                        throw 42;
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Cannot throw non-error type 'cint'. Expected error type"
                }]
            },

            // Throw outside function
            {
                name: 'Throw at module level',
                input: `
                    throw "error";
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'ANALYSIS_ERROR',
                    msg: 'Throw statement outside of function'
                }]
            },

            // Throw undefined error member
            {
                name: 'Throw undefined error variant',
                input: `
                    def MyError = errset{ NotFound, Invalid };

                    fn T_ST() -> MyError!i32 {
                        throw MyError.Unknown;
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'ERROR_MEMBER_NOT_FOUND',
                        msg: "Error member 'Unknown' not found in error set"
                    },
                ]
            }
        ],

        ThrowMustSucceed: [
            // Valid throw with err
            {
                name: 'Throw with err',
                input: `
                    def MyError = errset{ Failed };
                    fn T_ST() -> err!i32 {
                        throw MyError.Failed;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Valid throw with specific error
            {
                name: 'Throw specific error',
                input: `
                    def FileError = errset{ NotFound, PermissionDenied };

                    fn T_ST() -> FileError!i32 {
                        throw FileError.NotFound;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Throw different error members
            {
                name: 'Throw different error variants',
                input: `
                    def Error = errset{ A, B, C };

                    fn T_ST(x: i32) -> Error!i32 {
                        if (x == 0) {
                            throw Error.A;
                        } else if (x == 1) {
                            throw Error.B;
                        } else {
                            throw Error.C;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Nested throw in control flow
            {
                name: 'Throw in nested blocks',
                input: `
                    def Error = errset{ Failed };

                    fn T_ST(x: i32) -> Error!i32 {
                        {
                            if (x < 0) {
                                throw Error.Failed;
                            }
                        }
                        return x;
                    }
                `,
                success: true,
                diagnostics: []
            }
        ]
    };

    const AnyErrorValidation = {
        AnyErrorMustSucceed: [
            // err accepts any error type
            {
                name: 'err accepts all errors',
                input: `
                    def Error1 = errset{ A };
                    def Error2 = errset{ B };

                    fn T_ST1() -> err!i32 {
                        throw Error1.A;
                    }

                    fn T_ST2() -> err!i32 {
                        throw Error2.B;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Function returning err can call any error-returning function
            {
                name: 'err propagates all errors',
                input: `
                    def SpecificError = errset{ Failed };

                    fn specific() -> SpecificError!i32 {
                        throw SpecificError.Failed;
                    }

                    fn general() -> err!i32 {
                        return try specific();
                    }
                `,
                success: true,
                diagnostics: []
            }
        ]
    };

    const ErrorPropagation = {
        ErrorPropagationMustSucceed: [
            // Try expression propagates error
            {
                name: 'Try expression with matching error',
                input: `
                    def Error = errset{ Failed };

                    fn inner() -> Error!i32 {
                        throw Error.Failed;
                    }

                    fn outer() -> Error!i32 {
                        return try inner();
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Catch handles error
            {
                name: 'Catch expression handles error',
                input: `
                    def Error = errset{ Failed };

                    fn inner() -> Error!i32 {
                        throw Error.Failed;
                    }

                    fn outer() -> i32 {
                        return inner() catch { return 0; };
                    }
                `,
                success: true,
                diagnostics: []
            }
        ]
    };

    const StaticMemberValidation = {
        StaticMustFail: [
            // Static method accessing instance field via self
            {
                name: 'Static method cannot access instance field via self',
                input: `
                    def Point = struct {
                        x: i32;
                        static fn bad() -> i32 {
                            return self.x;
                        }
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'INVALID_STATIC_ACCESS',
                    msg: "Cannot access instance field 'x' via 'self' in static method. Static methods can only access static members."
                }]
            },

            // Static method accessing instance field directly
            {
                name: 'Static method cannot access instance field directly',
                input: `
                    def Point = struct {
                        x: i32;
                        static fn bad() -> i32 {
                            return x;
                        }
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'INVALID_STATIC_ACCESS',
                    msg: "Cannot access instance field 'x' in static method. Static methods can only access static fields."
                }]
            },

            // Static method calling instance method via self
            {
                name: 'Static method cannot call instance method via self',
                input: `
                    def Point = struct {
                        x: i32;
                        fn getX() -> i32 { return self.x; }
                        static fn bad() -> i32 {
                            return self.getX();
                        }
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'INVALID_STATIC_ACCESS',
                        msg: "Cannot access instance method 'getX' via 'self' in static method. Static methods can only access static members."
                    },
                ]
            },

            // Static method calling instance method on type
            {
                name: 'Static method cannot call instance method on type',
                input: `
                    def Point = struct {
                        x: i32;
                        fn getX() -> i32 { return self.x; }
                        static fn bad() -> i32 {
                            return Point.getX();
                        }
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'INVALID_STATIC_ACCESS',
                    msg: "Cannot call instance method 'getX' on type. Create an instance first."
                }]
            },

            // Accessing static field on instance
            {
                name: 'Cannot access static field on instance',
                input: `
                    def Point = struct {
                        static count: i32 = 0;
                        x: i32;
                    }
                    fn T_ST(p: Point) -> i32 {
                        return p.count;
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'INVALID_STATIC_ACCESS',
                    msg: "Cannot access static field 'count' on instance. Use 'Point.count' instead."
                }]
            },

            // Calling static method on instance
            {
                name: 'Call static method on instance',
                input: `
                    def Point = struct {
                        x: i32;
                        static fn create() -> Point {
                            return new Point { x: 0 };
                        }
                    }
                    fn T_ST(p: Point) -> Point {
                        return p.create();
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Accessing instance field on type
            {
                name: 'Cannot access instance field on type',
                input: `
                    def Point = struct {
                        x: i32;
                    }
                    fn T_ST() -> i32 {
                        return Point.x;
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'SYMBOL_NOT_ACCESSIBLE',
                    msg: "Cannot access private field 'x' from outside struct"
                }]
            },

            // Mixed static/instance access errors
            {
                name: 'Multiple static access violations',
                input: `
                    def Point = struct {
                        static count: i32 = 0;
                        x: i32;
                        y: i32;

                        static fn bad() -> i32 {
                            return self.x + self.y + self.count;
                        }
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'INVALID_STATIC_ACCESS',
                        msg: "Cannot access instance field 'x' via 'self' in static method. Static methods can only access static members."
                    },
                    {
                        kind: 'error',
                        code: 'INVALID_STATIC_ACCESS',
                        msg: "Cannot access instance field 'y' via 'self' in static method. Static methods can only access static members."
                    }
                ]
            },
        ],

        StaticMustSucceed: [
            // Static method accessing static field via self
            {
                name: 'Static method can access static field via self',
                input: `
                    def Point = struct {
                        static count: i32 = 0;
                        x: i32;

                        static fn getCount() -> i32 {
                            return self.count;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Static method accessing static field via type name
            {
                name: 'Static method can access static field via type name',
                input: `
                    def Point = struct {
                        static count: i32 = 0;
                        x: i32;

                        static fn getCount() -> i32 {
                            return Point.count;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Static method calling another static method via self
            {
                name: 'Static method can call static method via self',
                input: `
                    def Point = struct {
                        static count: i32 = 0;

                        static fn increment() -> i32 {
                            return Point.count + 1;
                        }

                        static fn getNext() -> i32 {
                            return Point.increment();
                        }
                    }
                `,
                // should fail with error, but for now it success
                success: true,
                diagnostics: []
            },

            // Static method calling another static method via type name
            {
                name: 'Static method can call static method via type name',
                input: `
                    def Point = struct {
                        static count: i32 = 0;

                        static fn increment() -> i32 {
                            return Point.count + 1;
                        }

                        static fn getNext() -> i32 {
                            return Point.increment();
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Instance method accessing static field
            {
                name: 'Instance method can access static field',
                input: `
                    def Point = struct {
                        static count: i32 = 0;
                        x: i32;

                        fn getInfo() -> i32 {
                            return Point.count + self.x;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Instance method calling static method
            {
                name: 'Instance method can call static method',
                input: `
                    def Point = struct {
                        x: i32;

                        static fn origin() -> Point {
                            return new Point { x: 0 };
                        }

                        fn reset() -> Point {
                            return Point.origin();
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Static factory method pattern
            {
                name: 'Static factory method creating instances',
                input: `
                    def Point = struct {
                        x: i32;
                        y: i32;

                        static fn origin() -> Point {
                            return new Point { x: 0, y: 0 };
                        }

                        static fn at(_x: i32, _y: i32) -> Point {
                            return new Point { x: _x, y: _y };
                        }
                    }

                    fn T_ST() {
                        let p1 = Point.origin();
                        let p2 = Point.at(10, 20);
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Multiple static fields accessed correctly
            {
                name: 'Multiple static fields in static method',
                input: `
                    def Config = struct {
                        static width: i32 = 800;
                        static height: i32 = 600;

                        static fn area() -> i32 {
                            return self.width * self.height;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Instance and static methods working together
            {
                name: 'Instance and static methods coexisting',
                input: `
                    def Point = struct {
                        static origin_x: i32 = 0;
                        static origin_y: i32 = 0;
                        x: i32;
                        y: i32;

                        static fn getOrigin() -> Point {
                            return new Point {
                                x: self.origin_x,
                                y: self.origin_y
                            };
                        }

                        fn distanceFromOrigin() -> i32 {
                            let dx = self.x - Point.origin_x;
                            let dy = self.y - Point.origin_y;
                            return (dx * dx) + (dy * dy);
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },
        ]
    };

    const TypeofSizeofValidation = {
        TypeofSizeofMustFail: [
            // typeof returns type, cannot use in arithmetic
            {
                name: 'Cannot add typeof result',
                input: 'let MyType = typeof 22; let x : u2 = MyType + 55;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Cannot perform Additive operation on type values"
                }]
            },

            // sizeof returns value, but overflow check
            {
                name: 'sizeof overflow check',
                input: 'let size = sizeof i32; let x : u2 = size + 55;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'ARITHMETIC_OVERFLOW',
                    msg: "Value 87 does not fit in type 'u2' (valid range: 0 to 3)"
                }]
            },

            // typeof on invalid expression
            {
                name: 'typeof undefined symbol',
                input: 'let x = typeof undefinedVar;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'UNDEFINED_IDENTIFIER'
                }]
            }
        ],

        TypeofSizeofMustSucceed: [
            // sizeof for array size
            {
                name: 'sizeof for array dimension',
                input: 'let arr: [sizeof i32]u8;',
                success: true,
                diagnostics: []
            },
        ]
    };

    const WildcardImportValidation = {
        WildcardImportMustFail: [
            // Access non-existent member
            {
                name: 'Wildcard import accessing non-existent member',
                input: `
                    // In utils/print.k:
                    // pub fn print(x: []u8) {}
                    // pub let var1: i32 = 10;

                    use * as utils from "./utils/print.k";
                    let x = utils.nonExistent;
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'SYMBOL_NOT_FOUND',
                    msg: "Module 'print' has no exported symbol 'nonExistent'"
                }]
            },

            // Access private member via wildcard
            {
                name: 'Wildcard import cannot access private symbols',
                input: `
                    // In utils/print.k:
                    // pub fn print(x: []u8) {}
                    // let privateVar: i32 = 10;  // not exported

                    use * as utils from "./utils/print.k";
                    let x = utils.privateVar;
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'SYMBOL_NOT_FOUND',
                    msg: "Module 'print' has no exported symbol 'privateVar'"
                }]
            },

            // Wildcard without alias
            {
                name: 'Wildcard import requires alias',
                input: `
                    use * from "./utils/print.k";
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'ANALYSIS_ERROR',
                    msg: "Wildcard import requires an alias (use * as <name> from \"...\")"
                }]
            },

            // Wildcard on non-module import
            {
                name: 'Wildcard only for module imports',
                input: `
                    let x = 10;
                    use * as y from x;  // Invalid syntax anyway
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'PARSER_ERROR',
                    msg: "Expected module path after `from` keyword"
                }]
            },

            // Call non-existent function via wildcard
            {
                name: 'Call non-existent function via wildcard',
                input: `
                    use * as utils from "./utils/print.k";
                    utils.nonExistentFunc();
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'SYMBOL_NOT_FOUND',
                    msg: "Module 'print' has no exported symbol 'nonExistentFunc'"
                }]
            },

            // Module path doesn't exist
            {
                name: 'Wildcard import from non-existent module',
                input: `
                    use * as utils from "./non/existent/path.k";
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'MODULE_NOT_FOUND',
                    msg: "Module not found in path './non/existent/path.k'"
                }]
            },
        ],

        WildcardImportMustSucceed: [
            // Valid wildcard import and access
            {
                name: 'Valid wildcard import accessing exported function',
                input: `
                    // Assume print.k has: pub fn print(x: []u8) {}

                    use * as utils from "./utils/print.k";

                    fn T_ST() {
                        utils.print("hello");
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Wildcard import accessing multiple members
            {
                name: 'Access multiple exported members',
                input: `
                    // In utils/print.k:
                    // pub fn print(x: []u8) {}
                    // pub fn println(x: []u8) {}
                    // pub let VERSION: i32 = 1;

                    use * as utils from "./utils/print.k";

                    fn T_ST() {
                        utils.print("hello");
                        utils.println("world");
                        let v = utils.VERSION;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Wildcard with static method call
            {
                name: 'Call static method via wildcard',
                input: `
                    // In utils/print.k:
                    // pub def Printer = struct {
                    //     static fn print(x: []u8) {}
                    // };

                    use * as utils from "./utils/print.k";

                    fn T_ST() {
                        utils.Printer.print("hello");
                    }
                `,
                success: true,
                diagnostics: []
            },

            // Wildcard with enum access
            {
                name: 'Access enum via wildcard',
                input: `
                    // In utils/print.k:
                    // pub def Color = enum { Red, Green, Blue };

                    use * as types from "./utils/print.k";
                    let c = types.Color.Red;
                `,
                success: true,
                diagnostics: []
            },
        ]
    };

    const WildcardImportEdgeCases = {
        WildcardEdgeMustFail: [
            // Shadowing with wildcard
            {
                name: 'Wildcard alias shadows existing symbol',
                input: `
                    let utils = 10;
                    use * as utils from "./utils/print.k";  // Should error
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'USE_SHADOWING',
                    msg: "Symbol 'utils' shadows variable 'utils' in same scope"
                }]
            },

            // Type mismatch in wildcard member call
            {
                name: 'Wrong argument type in wildcard function call',
                input: `
                    // print.k: pub fn print(x: []u8) {}

                    use * as utils from "./utils/print.k";

                    fn T_ST() {
                        utils.print(42);  // Wrong type
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'TYPE_MISMATCH',
                    msg: "Argument type 'cint' is not assignable to parameter type '[]u8'"
                }]
            },
        ],

        WildcardEdgeMustSucceed: [
            // Re-export via wildcard
            {
                name: 'Re-export wildcard import',
                input: `
                    pub use * as utils from "./utils/print.k";

                    // Other modules can now: use utils from "./this_module.k";
                `,
                success: true,
                diagnostics: []
            },

            // // Empty module wildcard import
            // {
            //     name: 'Wildcard import from module with no exports',
            //     input: `
            //         // empty.k has no pub members

            //         use * as empty from "./utils/empty.k";

            //         // Valid but useless - should warn, not error
            //     `,
            //     success: true,
            //     diagnostics: []  // Maybe add warning in future
            // },
        ]
    };

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ T_ST ════════════════════════════════════════╗

    testAnalyzer({
        ...Primitive,
        ...Optional,
        ...Array,
        ...Tuple,
        ...Pointers,
        ...FunctionParams,
        ...BinaryOps,
        ...PrefixUnary,
        ...Promotions,
        ...PostfixCall,

        ...ReturnTypeValidation,
        ...StructFieldValidation,
        ...CircularTypeDetection,
        ...MutabilityChecking,
        ...ComptimeValidation,
        ...ErrorUnionValidation,
        ...SwitchExhaustiveness,
        ...ComplexIntegration,

        ...StructConstructorValidation,
        ...StructMethodValidation,
        ...MemberAccessValidation,
        ...EnumValidation,
        ...ArrayAccessValidation,
        ...UnionTypeValidation,
        ...DereferenceValidation,
        ...BitwiseOperationValidation,
        ...IncrementDecrementValidation,
        ...TypeCastValidation,
        ...NestedTypeValidation,
        ...AnonymousTypeValidation,
        ...ErrorHandlingValidation,
        ...ComplexIntegrationTests,
        ...RangeValidation,
        ...OrelseValidation,
        ...LogicalOperationValidation,
        ...IfElseValidation,
        ...WhileLoopValidation,
        ...ForLoopValidation,
        ...EdgeCases,

        ...VisibilityValidationTests,
        ...MutabilityValidationTests,
        ...ArrayInferenceTests,
        ...OptionalAndPointerTests,
        ...ReferenceAndDereferenceTests,

        ...ComptimeExpressionTests,

        ...StaticTests,
        ...ComptimeEvaluatorTests,

        ...ThrowStatementValidation,
        ...AnyErrorValidation,
        ...ErrorPropagation,

        ...StaticMemberValidation,
        ...TypeofSizeofValidation,

        ...WildcardImportValidation,
        ...WildcardImportEdgeCases,

        // ...MutabilityChecking,


    }, AnalysisPhase.TypeValidation);

    // temp-place (if used in utils will runs multiple times)
    specialTest_NoEnterModule();

// ╚══════════════════════════════════════════════════════════════════════════════════════╝