// SymbolCollector.test.ts - Comprehensive Test Suite
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { testAnalyzer, AnalysisPhase } from '../utils';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ INIT ════════════════════════════════════════╗

    const UseCases = {

        UseMustFails: [
            // MODULE_NOT_FOUND - Invalid relative path
            {
                input       : 'use mut_bool_var from "./src/utils/print.k";',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        msg         : "Module not found in path './src/utils/print.k'",
                        code        : 'MODULE_NOT_FOUND',
                        cspan       : { start: 0, end: 44 },
                        tspan       : { start: 22, end: 43 },
                    },
                ],
            },

            // SYMBOL_NOT_FOUND - Symbol doesn't exist in module
            {
                input       : 'use xxx from "./utils/print.k";',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        msg         : "Symbol 'xxx' not found in module 'print'",
                        code        : 'SYMBOL_NOT_FOUND',
                        cspan       : { start: 0, end: 31 },
                        tspan       : { start: 4, end: 7 },
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },

            // USE_SHADOWING - Duplicate alias in same scope
            {
                input       : 'let x = 10; use x as y; use x as y;',
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 24, end: 35 },
                        tspan       : { start: 33, end: 34 },
                        kind        : 'error',
                        msg         : "Symbol 'y' shadows use 'y' in same scope",
                        code        : "USE_SHADOWING",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },

            // USE_SHADOWING - Import shadows existing variable
            {
                input       : 'let x = 10; use x as x;',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        msg         : "Symbol 'x' shadows variable 'x' in same scope",
                        cspan       : { start: 12, end: 23 },
                        tspan       : { start: 21, end: 22 },
                        code        : "USE_SHADOWING",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },

            // USE_SHADOWING - Alias shadows existing variable
            {
                input       : 'let y = 5; let x = 10; use x as y;',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        msg         : "Symbol 'y' shadows variable 'y' in same scope",
                        code        : "USE_SHADOWING",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },
        ],

        UseMustSucceed: [
            // Import from external module
            {
                input       : 'use mut_bool_var from "./utils/print.k"; let y = mut_bool_var; fn f() { let z = mut_bool_var; }',
                success     : true,
                diagnostics : [],
            },

            // Import with alias from external module
            {
                input       : 'use mut_bool_var as x from "./utils/print.k"; let y = x; fn f() { let z = x; }',
                success     : true,
                diagnostics : [],
            },

            // Local use with alias
            {
                input       : 'let x = 10; use x as y; fn f() { let z = y; }',
                success     : true,
                diagnostics : [],
            },

            // Multiple imports from same module
            {
                input       : 'use mut_bool_var from "./utils/print.k"; use print from "./utils/print.k";',
                success     : true,
                diagnostics : [],
            },

            // Use in nested scope doesn't shadow parent
            {
                input       : 'let x = 10; fn f() { use x as y; }',
                success     : true,
                diagnostics : [],
            },
        ],
    }

    const DefCases = {

        DefMustFails: [
            // DEFINITION_SHADOWING - Duplicate definition in same scope
            {
                input       : 'def x = i32; def x = bool;',
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 13, end: 26 },
                        tspan       : { start: 17, end: 18 },
                        kind        : 'error',
                        msg         : "Symbol 'x' shadows definition 'x' in same scope",
                        code        : "DEFINITION_SHADOWING",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },

            // DEFINITION_SHADOWING - Definition shadows variable
            {
                input       : 'let x = 10; def x = i32;',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        msg         : "Symbol 'x' shadows variable 'x' in same scope",
                        code        : "DEFINITION_SHADOWING",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },

            // DEFINITION_SHADOWING - Definition shadows function
            {
                input       : 'fn foo() {} def foo = i32;',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        msg         : "Symbol 'foo' shadows function 'foo' in same scope",
                        code        : "DEFINITION_SHADOWING",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },

            // Empty error set
            {
                input: 'def Empty = errset{}',
                success: false,
                diagnostics: [
                    {
                        kind        : 'error',
                        msg         : "Expected members after `{`",
                        code        : "PARSER_ERROR",
                    },
                ]
            },
        ],

        DefMustSucceed: [
            // Basic type definition
            {
                input       : 'def int = i32; let x : int = 10 as int;',
                success     : true,
                diagnostics : [],
            },

            // Struct type definition
            {
                input       : 'def Point = struct { x: i32; y: i32 }',
                success     : true,
                diagnostics : [],
            },

            // Enum type definition
            {
                input       : 'def Color = enum { Red, Green, Blue }',
                success     : true,
                diagnostics : [],
            },

            // Array type definition
            {
                input       : 'def IntArray = [10]i32',
                success     : true,
                diagnostics : [],
            },

            // Tuple type definition
            {
                input       : 'def Pair = .{i32, i32}',
                success     : true,
                diagnostics : [],
            },

            // Optional type definition
            {
                input       : 'def MaybeInt = ?i32',
                success     : true,
                diagnostics : [],
            },

            // Pointer type definition
            {
                input       : 'def IntPtr = *i32',
                success     : true,
                diagnostics : [],
            },

            // Error type definition
            {
                input       : 'def Result = errset{ OutOfMemory, InvalidInput }',
                success     : true,
                diagnostics : [],
            },

            // Multiple type definitions
            {
                input       : 'def A = i32; def B = bool; def C = A',
                success     : true,
                diagnostics : [],
            },
        ],
    }

    const LetCases = {

        LetMustFails: [
            // VARIABLE_SHADOWING - Duplicate variable in same scope
            {
                input       : 'let x = 10; let x = 20;',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        msg         : "Symbol 'x' shadows variable 'x' in same scope",
                        code        : "VARIABLE_SHADOWING",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },

            // VARIABLE_SHADOWING - Variable shadows definition
            {
                input       : 'def x = i32; let x = 10;',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        msg         : "Symbol 'x' shadows definition 'x' in same scope",
                        code        : "VARIABLE_SHADOWING",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },

            // VARIABLE_SHADOWING - Variable shadows function
            {
                input       : 'fn foo() {} let foo = 10;',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        msg         : "Symbol 'foo' shadows function 'foo' in same scope",
                        code        : "VARIABLE_SHADOWING",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },
        ],

        LetMustSucceed: [
            // Debug: Simple case to count symbols
            {
                input       : 'let x = 10;',
                success     : true,
                diagnostics : [],
            },

            // Variable with type annotation
            {
                input       : 'let x : i32 = 10;',
                success     : true,
                diagnostics : [],
            },

            // Variable without initializer
            {
                input       : 'let x : i32;',
                success     : true,
                diagnostics : [],
            },

            // Multiple variables
            {
                input       : 'let x = 10; let y = 20; let z = 30;',
                success     : true,
                diagnostics : [],
            },

            // Variable in nested scope (shadowing warning expected)
            {
                input       : 'let x = 10; fn f() { let x = 20; }',
                success     : true,
                diagnostics : [
                    {
                        kind        : 'warning',
                        code        : 'VARIABLE_SHADOWING',
                        msg         : "Symbol 'x' shadows variable 'x' in outer scope",
                    },
                ],
            },

            // Variables in sibling scopes
            {
                input       : 'fn f() { { let x = 1; } { let x = 2; } }',
                success     : true,
                diagnostics : [],
            },

            // Variable with complex initializer
            {
                input       : 'let x = ((1 + 2) * 3);',
                success     : true,
                diagnostics : [],
            },
        ],
    }

    const FuncCases = {

        FuncMustFails: [
            // FUNCTION_SHADOWING - Duplicate function in same scope
            {
                input       : 'fn foo() {} fn foo() {}',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        msg         : "Symbol 'foo' shadows function 'foo' in same scope",
                        code        : "FUNCTION_SHADOWING",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },

            // FUNCTION_SHADOWING - Function shadows variable
            {
                input       : 'let foo = 10; fn foo() {}',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        msg         : "Symbol 'foo' shadows variable 'foo' in same scope",
                        code        : "FUNCTION_SHADOWING",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },

            // FUNCTION_SHADOWING - Function shadows definition
            {
                input       : 'def foo = i32; fn foo() {}',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        msg         : "Symbol 'foo' shadows definition 'foo' in same scope",
                        code        : "FUNCTION_SHADOWING",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },

            // PARAMETER_SHADOWING - Duplicate parameter names
            {
                input       : 'fn foo(x: i32, x: i32) {}',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        msg         : "Symbol 'x' shadows parameter 'x' in same scope",
                        code        : "PARAMETER_SHADOWING",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },

            // PARAMETER_SHADOWING - Parameter shadows another parameter
            {
                input       : 'fn foo(x: i32, y: bool, x: f32) {}',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        msg         : "Symbol 'x' shadows parameter 'x' in same scope",
                        code        : "PARAMETER_SHADOWING",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },
        ],

        FuncMustSucceed: [
            // Basic function
            {
                input       : 'fn foo() {}',
                success     : true,
                diagnostics : [],
            },

            // Function with parameters
            {
                input       : 'fn add(x: i32, y: i32) { return x + y; }',
                success     : true,
                diagnostics : [],
            },

            // Function with return type
            {
                input       : 'fn get_value() -> i32 { return 42; }',
                success     : true,
                diagnostics : [],
            },

            // Function with parameters and return type
            {
                input       : 'fn multiply(a: i32, b: i32) -> i32 { return a * b; }',
                success     : true,
                diagnostics : [],
            },

            // Nested functions (if supported)
            {
                input       : 'fn outer() { fn inner() {} }',
                success     : true,
                diagnostics : [],
            },

            // Function shadowing in nested scope (warning expected)
            {
                input       : 'fn foo() {} fn bar() { fn foo() {} }',
                success     : true,
                diagnostics : [
                    {
                        kind        : 'warning',
                        code        : 'FUNCTION_SHADOWING',
                        msg         : "Symbol 'foo' shadows function 'foo' in outer scope",
                    },
                ],
            },

            // Parameter usage in body
            {
                input       : 'fn foo(x: i32) { let y = x; }',
                success     : true,
                diagnostics : [],
            },

            // Multiple functions
            {
                input       : 'fn foo() {} fn bar() {} fn baz() {}',
                success     : true,
                diagnostics : [],
            },

            // Parameter shadowing in nested block (warning expected)
            {
                input       : 'fn f(x: i32) { { let x = 2; } }',
                success     : true,
                diagnostics : [
                    {
                        kind        : 'warning',
                        code        : 'VARIABLE_SHADOWING',
                        msg         : "Symbol 'x' shadows parameter 'x' in outer scope",
                    },
                ],
            },
        ],
    }

    const StructCases = {

        StructMustFails: [
            // STRUCT_FIELD_SHADOWING - Duplicate field names
            {
                input       : 'def S = struct { x: i32; x: bool }',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        code        : 'STRUCT_FIELD_SHADOWING',
                        msg         : "Symbol 'x' shadows structfield 'x' in same scope",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },

            // STRUCT_FIELD_SHADOWING - Multiple duplicate fields
            {
                input       : 'def S = struct { x: i32; y: bool; x: f32; y: i32 }',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        code        : 'STRUCT_FIELD_SHADOWING',
                        msg         : "Symbol 'x' shadows structfield 'x' in same scope",
                    },
                    {
                        kind        : 'error',
                        code        : 'STRUCT_FIELD_SHADOWING',
                        msg         : "Symbol 'y' shadows structfield 'y' in same scope",
                    },
                ],
            },
        ],

        StructMustSucceed: [
            // Basic struct
            {
                input       : 'def Point = struct { x: i32; y: i32 }',
                success     : true,
                diagnostics : [],
            },

            // Struct with different field types
            {
                input       : 'def Person = struct { name: slice; age: i32; active: bool }',
                success     : true,
                diagnostics : [],
            },

            // Empty struct
            {
                input       : 'def Empty = struct { }',
                success     : true,
                diagnostics : [],
            },

            // Nested struct types
            {
                input       : 'def Inner = struct { value: i32 } def Outer = struct { inner: Inner }',
                success     : true,
                diagnostics : [],
            },

            // Struct with array field
            {
                input       : 'def Container = struct { items: [10]i32 }',
                success     : true,
                diagnostics : [],
            },

            // Struct with optional field
            {
                input       : 'def User = struct { name: slice; email: ?[]u8 }',
                success     : true,
                diagnostics : [],
            },

            // Struct with pointer field
            {
                input       : 'def Node = struct { value: i32; next: *Node }',
                success     : true,
                diagnostics : [],
            },

            // Struct with tuple field
            {
                input       : 'def Data = struct { coords: .{i32, i32} }',
                success     : true,
                diagnostics : [],
            },
        ],
    }

    const EnumCases = {

        EnumMustFails: [
            // Note: Enum variant shadowing might not be an error depending on language design
            // If variants should be unique, add tests here
        ],

        EnumMustSucceed: [
            // Basic enum
            {
                input       : 'def Color = enum { Red, Green, Blue }',
                success     : true,
                diagnostics : [],
            },

            // Enum with single variant
            {
                input       : 'def Single = enum { Only }',
                success     : true,
                diagnostics : [],
            },

            // Enum with many variants
            {
                input       : 'def Day = enum { Mon, Tue, Wed, Thu, Fri, Sat, Sun }',
                success     : true,
                diagnostics : [],
            },

            // Enum with typed variants
            {
                input       : 'def Option = enum { Some: i32, None }',
                success     : true,
                diagnostics : [],
            },

            // Enum with complex variant types
            {
                input       : 'def Result = enum { Ok: i32, Err: slice }',
                success     : true,
                diagnostics : [],
            },

            // Multiple enums
            {
                input       : 'def A = enum { X, Y } def B = enum { Z, W }',
                success     : true,
                diagnostics : [],
            },
        ],
    }

    const BlockCases = {

        BlockMustFails: [
            // VARIABLE_SHADOWING - Duplicate in block
            {
                input       : 'fn f() { { let x = 1; let x = 2; } }',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        code        : 'VARIABLE_SHADOWING',
                        msg         : "Symbol 'x' shadows variable 'x' in same scope",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },
        ],

        BlockMustSucceed: [
            // Basic block scope
            {
                input       : 'fn f() { { let x = 1; } }',
                success     : true,
                diagnostics : [],
            },

            // Sibling blocks with same variable name
            {
                input       : 'fn f() { { let x = 1; } { let x = 2; } }',
                success     : true,
                diagnostics : [],
            },

            // Nested blocks
            {
                input       : 'fn f() { { { let x = 1; } } }',
                success     : true,
                diagnostics : [],
            },

            // Block shadowing outer scope (warning expected)
            {
                input       : 'fn f() { let x = 1; { let x = 2; } }',
                success     : true,
                diagnostics : [
                    {
                        kind        : 'warning',
                        code        : 'VARIABLE_SHADOWING',
                        msg         : "Symbol 'x' shadows variable 'x' in outer scope",
                    },
                ],
            },

            // Multiple variables in block
            {
                input       : 'fn f() { { let x = 1; let y = 2; let z = 3; } }',
                success     : true,
                diagnostics : [],
            },
        ],
    }

    const LoopCases = {

        LoopMustFails: [
            // VARIABLE_SHADOWING - Duplicate in loop
            {
                input       : 'fn f() { while (true) { let x = 1; let x = 2; } }',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        code        : 'VARIABLE_SHADOWING',
                        msg         : "Symbol 'x' shadows variable 'x' in same scope",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },
        ],

        LoopMustSucceed: [
            // While loop
            {
                input       : 'fn main() { while (true) { let x = 1; } }',
                success     : true,
                diagnostics : [],
            },

            // Do-while loop
            {
                input       : 'fn main() { do x while true }',
                success     : true,
                diagnostics : [],
            },

            // For loop
            {
                input       : 'fn main() { let mut x : i32 = 0; for 0..10 ++x; }',
                success     : true,
                diagnostics : [],
            },

            // Loop variable doesn't leak to outer scope
            {
                input       : 'fn main() { while (true) { let x = 1; } let x = 2; }',
                success     : true,
                diagnostics : [],
            },

            // Nested loops
            {
                input       : 'fn main() { while (true) { while (false) { let x = 1; } } }',
                success     : true,
                diagnostics : [],
            },

            // Loop shadowing outer scope (warning expected)
            {
                input       : 'fn main() { let x = 10; while (true) { let x = 20; } }',
                success     : true,
                diagnostics : [
                    {
                        kind        : 'warning',
                        code        : 'VARIABLE_SHADOWING',
                        msg         : "Symbol 'x' shadows variable 'x' in outer scope",
                    },
                ],
            },
        ],
    }

    const ExprCases = {

        IfElseMustFails: [
            // VARIABLE_SHADOWING in if branch
            {
                input       : 'pub fn main() { let x = 10; if (x > 5) { let y = x; let y = 20; } else { let z = x; let z = 5; } }',
                success     : false,
                diagnostics : [
                    {
                        cspan       : { start: 52, end: 63 },
                        tspan       : { start: 56, end: 57 },
                        kind        : 'error',
                        msg         : "Symbol 'y' shadows variable 'y' in same scope",
                        code        : "VARIABLE_SHADOWING",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                    {
                        cspan       : { start: 84, end: 94 },
                        tspan       : { start: 88, end: 89 },
                        kind        : 'error',
                        msg         : "Symbol 'z' shadows variable 'z' in same scope",
                        code        : "VARIABLE_SHADOWING",
                        module      : "main",
                        path        : "./src/main.k",
                    },
                ],
            },

            // VARIABLE_SHADOWING in if expression
            {
                input       : 'fn f() { if (true) { let x = 1; let x = 2; } }',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        code        : 'VARIABLE_SHADOWING',
                        msg         : "Symbol 'x' shadows variable 'x' in same scope",
                    },
                ],
            },
        ],

        IfElseMustSucceed: [
            // Basic if-else
            {
                input       : 'pub fn main() { let x = 10; if (x > 5) { let y = x; } else { let z = x; } }',
                success     : true,
                diagnostics : [],
            },

            // If without else
            {
                input       : 'fn f() { if (true) { let x = 1; } }',
                success     : true,
                diagnostics : [],
            },

            // Nested if-else
            {
                input       : 'fn f() { if (true) { if (false) { let x = 1; } else { let y = 2; } } }',
                success     : true,
                diagnostics : [],
            },

            // Same variable in both branches (different scopes)
            {
                input       : 'fn f() { if (true) { let x = 1; } else { let x = 2; } }',
                success     : true,
                diagnostics : [],
            },

            // If shadowing outer scope (warning expected)
            {
                input       : 'fn f() { let x = 1; if (true) { let x = 2; } }',
                success     : true,
                diagnostics : [
                    {
                        kind        : 'warning',
                        code        : 'VARIABLE_SHADOWING',
                        msg         : "Symbol 'x' shadows variable 'x' in outer scope",
                    },
                ],
            },
        ],

        MatchMustFails: [
            // VARIABLE_SHADOWING in match case
            {
                input       : 'fn f() { match (x) { 1 => { let y = 1; let y = 2; } } }',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        code        : 'VARIABLE_SHADOWING',
                        msg         : "Symbol 'y' shadows variable 'y' in same scope",
                    },
                ],
            },
        ],

        SwitchMustSucceed: [
            // Basic switch
            {
                input       : 'fn f(x: i32) { match (x) { 1 => { let y = 1; } 2 => { let z = 2; } } }',
                success     : true,
                diagnostics : [],
            },

            // Switch with default case
            {
                input       : 'fn f(x: i32) { match (x) { 1 => { let y = 1; } default => { let z = 0; } } }',
                success     : true,
                diagnostics : [],
            },

            // Same variable in different cases
            {
                input       : 'fn f(x: i32) { match (x) { 1 => { let y = 1; } 2 => { let y = 2; } } }',
                success     : true,
                diagnostics : [],
            },
        ],

        BinaryMustSucceed: [
            // Binary expressions with variables
            {
                input       : 'fn f() { let x = 1 + 2; }',
                success     : true,
                diagnostics : [],
            },

            // Complex binary expression
            {
                input       : 'fn f() { let result = (((a + b) * (c - d)) / e); }',
                success     : true,
                diagnostics : [],
            },
        ],

        CallMustSucceed: [
            // Function call
            {
                input       : 'fn foo() {} fn bar() { foo(); }',
                success     : true,
                diagnostics : [],
            },

            // Function call with arguments
            {
                input       : 'fn add(x: i32, y: i32) -> i32 { return x + y; } fn main() { let z = add(1, 2); }',
                success     : true,
                diagnostics : [],
            },

            // Nested function calls
            {
                input       : 'fn f() { g(h(i())); }',
                success     : true,
                diagnostics : [],
            },
        ],

        TryCatchMustSucceed: [
            // Try expression
            {
                input       : 'fn f() { let x = try some_operation(); }',
                success     : true,
                diagnostics : [],
            },

            // Catch expression
            {
                input       : 'fn f() { let x = operation() catch { return 0; }; }',
                success     : true,
                diagnostics : [],
            },
        ],
    }

    const ComplexCases = {

        ComplexMustFails: [
            // Multiple shadowing errors
            {
                input       : 'let x = 1; let x = 2; fn x() {}',
                success     : false,
                diagnostics : [
                    {
                        kind        : 'error',
                        code        : 'VARIABLE_SHADOWING',
                        msg         : "Symbol 'x' shadows variable 'x' in same scope",
                    },
                    {
                        kind        : 'error',
                        code        : 'FUNCTION_SHADOWING',
                        msg         : "Symbol 'x' shadows variable 'x' in same scope",
                    },
                ],
            },
        ],

        ComplexMustSucceed: [
            // Complex nested structure
            {
                input       : `
                    def Point = struct { x: i32; y: i32 }
                    def Color = enum { Red, Green, Blue }
                    fn create_point(x: i32, y: i32) -> .{Point} {
                        let p: Point;
                        return p;
                    }
                    fn main() {
                        let p = create_point(10, 20);
                        if (p.x > 5) {
                            let color = Color.Red;
                        }
                    }
                `,
                success     : true,
                diagnostics : [],
            },

            // Multiple modules interaction
            {
                input       : `
                    use print from "./utils/print.k";
                    def MyInt = i32;
                    fn process(x: MyInt) -> MyInt {
                        print(x);
                        return (x + 1);
                    }
                    fn main() {
                        let value: MyInt = 42;
                        let result = process(value);
                    }
                `,
                success     : true,
                diagnostics : [],
            },

            // Recursive type definition
            {
                input       : 'def Node = struct { value: i32; next: *Node }',
                success     : true,
                diagnostics : [],
            },

            // Generic-like pattern with type definitions
            {
                input       : 'def IntList = [10]i32; def BoolList = [10]bool;',
                success     : true,
                diagnostics : [],
            },

            // Error handling pattern
            {
                input       : `
                    def FileError = errset{ NotFound, PermissionDenied, IOError }
                    fn read_file(path: str) -> FileError!i32 {
                        return 42;
                    }
                    fn main() {
                        let result = try read_file("test.txt");
                    }
                `,
                success     : true,
                diagnostics : [],
            },
        ],
    }

    const EdgeCases = {

        EdgeMustSucceed: [
            // Empty program
            {
                input       : '',
                success     : true,
                diagnostics : [],
            },

            // Only comments
            {
                input       : '// This is a comment',
                success     : true,
                diagnostics : [],
            },

            // Deeply nested scopes
            {
                input       : 'fn f() { { { { { let x = 1; } } } } }',
                success     : true,
                diagnostics : [],
            },

            // Long chain of shadowing warnings
            {
                input       : 'let x = 1; fn f() { let x = 2; { let x = 3; { let x = 4; } } }',
                success     : true,
                diagnostics : [
                    {
                        kind        : 'warning',
                        msg         :  "Symbol 'x' shadows variable 'x' in outer scope",
                        code        : 'VARIABLE_SHADOWING',
                    },
                    {
                        kind        : 'warning',
                        msg         :  "Symbol 'x' shadows variable 'x' in outer scope",
                        code        : 'VARIABLE_SHADOWING',
                    },
                    {
                        kind        : 'warning',
                        msg         :  "Symbol 'x' shadows variable 'x' in outer scope",
                        code        : 'VARIABLE_SHADOWING',
                    },
                ],
            },

            // Variable name reuse across scopes (valid)
            {
                input       : 'fn a() { let x = 1; } fn b() { let x = 2; } fn c() { let x = 3; }',
                success     : true,
                diagnostics : [],
            },
        ],
    }

    const CriticalTestCases = {

        // NOTE: we cannot run this test because it requires multi-module setup
        // TODO: test it live via LSP.
        // // T01: Circular Import Detection
        CircularImportTests: [
        //     {
        //         name: 'Circular import should be detected',
        //         input: `
        //             // Note: This requires multi-module setup
        //             // Module A imports B, Module B imports A
        //         `,
        //         success: false,
        //         diagnostics: [
        //             {
        //                 kind: 'error',
        //                 code: 'IMPORT_CIRCULAR_DEPENDENCY',
        //                 msg: 'Circular import dependency detected'
        //             }
        //         ]
        //     }
        ],

        // T02: Deeply Nested Anonymous Types
        DeeplyNestedTypeTests: [
            {
                name: 'Deeply nested anonymous structs',
                input: `
                    def Deep = struct {
                        level1: struct {
                            level2: struct {
                                level3: struct {
                                    level4: struct {
                                        value: i32
                                    }
                                }
                            }
                        }
                    }
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Deeply nested anonymous enums',
                input: `
                    def Deep = enum {
                        A: enum {
                            B: enum {
                                C: enum {
                                    D: i32
                                }
                            }
                        }
                    }
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Mixed nested types',
                input: `
                    def Complex = struct {
                        field1: enum {
                            Variant: struct {
                                nested: i32
                            }
                        }
                    }
                `,
                success: true,
                diagnostics: [],
            }
        ],

        // T03: Error Types in Function Returns
        ErrorTypeTests: [
            {
                name: 'Function with error type return',
                input: `
                    fn process() -> errset{ IoError, ParseError }!i32 {
                        return 42;
                    }
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Function with anonymous error type',
                input: `
                    fn read_file(path: str) -> errset{ NotFound, PermissionDenied }![]u8 {
                        return "data";
                    }
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Nested error types',
                input: `
                    def FileError = errset{ NotFound, IOError }
                    fn process() -> FileError!i32 {
                        return 42;
                    }
                `,
                success: true,
                diagnostics: [],
            }
        ],

        // T04: Enum Variant with Inline Struct Shadowing
        EnumVariantShadowingTests: [
            {
                name: 'Enum variant struct field does not shadow outer scope',
                input: `
                    let x = 10;
                    def Option = enum {
                        Some: struct { x: i32 },
                        None
                    }
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Enum variant with duplicate field names',
                input: `
                    def Result = enum {
                        Ok: struct { value: i32; value: bool }
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'STRUCT_FIELD_SHADOWING',
                        msg: "Symbol 'value' shadows structfield 'value' in same scope"
                    }
                ]
            },
            {
                name: 'Multiple enum variants with same field names (different scopes)',
                input: `
                    def Result = enum {
                        Ok: struct { value: i32 },
                        Err: struct { value: slice }
                    }
                `,
                success: true,
                diagnostics: [],
            }
        ],

        // T05: Self-Referential Types
        SelfReferentialTypeTests: [
            {
                name: 'Recursive struct with pointer',
                input: `
                    def Node = struct {
                        value: i32;
                        next: *Node
                    }
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Parameter with self-referential type',
                input: `
                    def Node = struct {
                        value: i32;
                        next: *Node
                    }
                    fn process(node: *Node) -> i32 {
                        return node.*.value;
                    }
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Mutually recursive types',
                input: `
                    def NodeA = struct {
                        value: i32;
                        linkB: *NodeB
                    }
                    def NodeB = struct {
                        value: i32;
                        linkA: *NodeA
                    }
                `,
                success: true,
                diagnostics: [],
            },
        ],

        // T06: Use Statement with Member Access
        UseStatementEdgeCases: [
            {
                name: 'Multi-part member access succeeds',
                input: `use utils.printFN from "./utils/print.k";`,
                success: true,
                diagnostics: []
            },
            {
                name: 'Multi-part with alias',
                input: `use utils.printFN as myPrint from "./utils/print.k";`,
                success: true,
                diagnostics: []
            },
            {
                name: 'Duplicate import detection',
                input: `
                    use print from "./utils/print.k";
                    use print from "./utils/print.k";
                `,
                success: true,
                diagnostics: [
                    {
                        kind: 'warning',
                        code: 'DUPLICATE_SYMBOL',
                        msg: "Symbol 'print' already imported from module 'print'"
                    }
                ]
            },

            // TODO: support as alias check too.
            // {
            //     name: 'Duplicate import detection',
            //     input: `
            //         use print as p1 from "./utils/print.k";
            //         use print as p2 from "./utils/print.k";
            //     `,
            //     success: true,
            //     diagnostics: [
            //         {
            //             kind: 'warning',
            //             code: 'DUPLICATE_SYMBOL',
            //             msg: "Symbol 'print' already imported from module 'print'"
            //         }
            //     ]
            // },
            {
                name: 'Import with different aliases',
                input: `
                    use print as p1 from "./utils/print.k";
                    use print as p2 from "./utils/print.k";
                `,
                success: true,
                diagnostics: [],
            }
        ],

        // T07: Built-in Symbol Protection
        // BuiltinSymbolTests: [
        //     {
        //         name: 'Can use built-in symbols normally',
        //         input: `
        //             fn main() {
        //                 @print("Hello");
        //                 let x = @sqrt(16.0); // no more @sqrt
        //             }
        //         `,
        //         success: true,
        //         diagnostics: [],
        //     }
        // ],

        // Function Types
        FunctionTypeTests: [
            {
                name: 'Function type with parameters',
                input: `
                    def Callback = fn(i32, bool) -> i32;
                    let handler: Callback;
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Function type with complex parameters',
                input: `
                    def Processor = fn([]u8, usize) -> errset{Failed}!bool;
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Nested function types',
                input: `
                    def HigherOrder = fn(fn(i32) -> i32) -> fn(i32) -> i32;
                `,
                success: true,
                diagnostics: [],
            }
        ],

        // Union Types
        UnionTypeTests: [
            {
                name: 'Simple union type',
                input: `
                    def IntOrBool = i32 | bool;
                    let value: IntOrBool = 42;
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Union with complex types',
                input: `
                    def Result = struct { value: i32 } | errset { Failed };
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Union with multiple variants',
                input: `
                    def Value = i32 | f64 | bool | str | null_t;
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Circular reference in union types',
                input: 'def A = B | i32; def B = A | bool;',
                success: true, // Should handle gracefully
                diagnostics: []
            },
        ],

        // Inline Type Definitions
        InlineTypeTests: [
            {
                name: 'Inline struct in variable',
                input: `
                    let point = struct { x: i32; y: i32 };
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Inline enum in variable',
                input: `
                    let color = enum { Red, Green, Blue };
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Inline struct in parameter',
                input: `
                    fn process(data: struct { x: i32; y: i32 }) {}
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Inline enum in parameter',
                input: `
                    fn handle(state: enum { Active, Inactive }) {}
                `,
                success: true,
                diagnostics: [],
            }
        ],

        // Complex Scope Nesting
        ComplexScopeTests: [
            {
                name: 'Deeply nested scopes with shadowing',
                input: `
                    let x = 1;
                    fn f() {
                        let x = 2;
                        {
                            let x = 3;
                            {
                                let x = 4;
                                {
                                    let x = 5;
                                }
                            }
                        }
                    }
                `,
                success: true,
                diagnostics: [
                    {
                        kind: 'warning',
                        code: 'VARIABLE_SHADOWING',
                        msg: "Symbol 'x' shadows variable 'x' in outer scope"
                    },
                    {
                        kind: 'warning',
                        code: 'VARIABLE_SHADOWING',
                        msg: "Symbol 'x' shadows variable 'x' in outer scope"
                    },
                    {
                        kind: 'warning',
                        code: 'VARIABLE_SHADOWING',
                        msg: "Symbol 'x' shadows variable 'x' in outer scope"
                    },
                    {
                        kind: 'warning',
                        code: 'VARIABLE_SHADOWING',
                        msg: "Symbol 'x' shadows variable 'x' in outer scope"
                    }
                ],
            },
            {
                name: 'Complex nested types with methods',
                input: `
                    def Outer = struct {
                        inner: struct {
                            deep: struct {
                                value: i32
                            };
                            fn getDeep() -> i32 {
                                return deep.value; // 'self' is keyword, not supported yet 'self.deep.value'
                            }
                        };
                        fn getInner() -> i32 {
                            return inner.getDeep();
                        }
                    }
                `,
                success: true,
                diagnostics: [],
            }
        ],

        // Error Recovery
        ErrorRecoveryTests: [
            {
                name: 'Multiple errors in same scope',
                input: `
                    let x = 10;
                    let x = 20;
                    let x = 30;
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        msg: "Symbol 'x' shadows variable 'x' in same scope",
                        code: 'VARIABLE_SHADOWING'
                    },
                    {
                        kind: 'error',
                        msg: "Symbol 'x' shadows variable 'x' in same scope",
                        code: 'VARIABLE_SHADOWING'
                    }
                ]
            },
            {
                name: 'Error in one function should not affect others',
                input: `
                    fn good1() { let x = 10; }
                    fn bad() { let y = 1; let y = 2; }
                    fn good2() { let z = 30; }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'VARIABLE_SHADOWING',
                        msg: "Symbol 'y' shadows variable 'y' in same scope"
                    }
                ]
            }
        ],

        // Visibility Modifiers
        VisibilityTests: [
            {
                name: 'Public type definition',
                input: `
                    pub def Point = struct { x: i32; y: i32 }
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Public function',
                input: `
                    pub fn main() {}
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Public mutable variable',
                input: `
                    pub let mut counter: i32 = 0;
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Mix of public and private symbols',
                input: `
                    pub def PublicType = i32;
                    def PrivateType = bool;
                    pub fn publicFunc() {}
                    fn privateFunc() {}
                `,
                success: true,
                diagnostics: [],
            }
        ],

        // Anonymous Type Naming
        AnonymousTypeNamingTests: [
            {
                name: 'Multiple anonymous structs get unique IDs',
                input: `
                    let a = struct { x: i32 };
                    let b = struct { y: i32 };
                    let c = struct { z: i32 };
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Anonymous types in different scopes',
                input: `
                    fn f1() { let x = struct { a: i32 }; }
                    fn f2() { let y = struct { b: i32 }; }
                `,
                success: true,
                diagnostics: [],
            }
        ]
    };

    const More = {
        DeepNestedTypes: [
            {
                name: 'Very deep nested struct (20+ levels)',
                input: `
                    def Level1 = struct {
                        level2: struct {
                            level3: struct {
                                // ... continue to level 20+
                                value: i32
                            }
                        }
                    }
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Mixed deep nesting with cycles',
                input: `
                    def A = struct {
                        b: B;
                        c: struct {
                            d: struct {
                                e: A  // cycle at deep level
                            }
                        }
                    }
                    def B = struct { a: A }
                `,
                success: true, // Should handle pointer cycles
                diagnostics: [],
            }
        ],

        // works but requires a lot of errors (49 error, symbol shadowing) written by hand so skip for now.
        // PerformanceTests: [
        //     {
        //         name: 'Large number of symbols in single scope',
        //         input: `
        //             ${Array.from({length: 1000}, (_, i) => `let var${i} = ${i};`).join('\n')}
        //         `,
        //         success: true,
        //         diagnostics: []
        //     },
        //     {
        //         name: 'Many nested scopes',
        //         input: `
        //             ${'fn deep() { '.repeat(50)} let x = 1; ${'}'.repeat(50)}
        //         `,
        //         success: true,
        //         diagnostics: []
        //     }
        // ],

        TypeEdgeCases: [
            {
                name: 'Complex function types with nested errors',
                input: `
                    def ComplexFn = fn(fn(i32) -> errset{A}!bool, fn(bool) -> errset{B}![]u8) -> errset{C}!fn() -> void;
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Union of all type kinds',
                input: `
                    def MegaUnion = i32 | bool | []u8 | [10]i32 | ?f64 | *void |
                                fn() -> i32 | struct { x: i32 } | enum { A, B } |
                                errset { E1, E2 } | .{i32, bool} | null_t;
                `,
                success: true,
                diagnostics: [],
            }
        ],

        // TODO: add setup field to case interface first
        // ImportEdgeCases: [
        //     {
        //         name: 'Circular imports between modules',
        //         input: `
        //             // This requires multi-module setup
        //             use moduleA from "./moduleA.k";
        //         `,
        //         setup: {
        //             'moduleA.k': 'use main from "../src/main.k"; def A = i32;',
        //             'main.k': 'use moduleA from "./moduleA.k"; def B = bool;'
        //         },
        //         success: false,
        //         diagnostics: [
        //             {
        //                 kind: 'error',
        //                 code: 'IMPORT_CIRCULAR_DEPENDENCY',
        //                 msg: 'Circular import detected'
        //             }
        //         ]
        //     }
        // ],

        ErrorRecoveryTests: [
            {
                name: 'Multiple errors with continued processing',
                input: `
                    let x = 1;
                    let x = 2;          // Error 1
                    fn y() {}
                    fn y() {}           // Error 2
                    def z = i32;
                    def z = bool;       // Error 3
                    // Valid code after errors
                    let valid = 42;
                    fn good() { return valid; }
                `,
                success: false,
                diagnostics: [
                    { kind: 'error', code: 'VARIABLE_SHADOWING' },
                    { kind: 'error', code: 'FUNCTION_SHADOWING' },
                    { kind: 'error', code: 'DEFINITION_SHADOWING' }
                ],
                // Should still collect 'valid' and 'good' symbols
            }
        ],

        AnonymousComplexTypes: [
            {
                name: 'Complex anonymous types in expressions',
                input: `
                    let complex = struct {
                        nested: enum {
                            Variant: struct {
                                deep: fn(i32) -> struct {
                                    inner: [10]?*bool
                                }
                            }
                        }
                    };
                `,
                success: true,
                diagnostics: [],
            },
            {
                name: 'Anonymous types with methods',
                input: `
                    let obj = struct {
                        value: i32;
                        fn get_value() -> i32 { return value; };
                        fn set_value(v: i32) { value = v; };
                    };
                `,
                success: true,
                diagnostics: [],
            }
        ],

        SystemLimitTests: [
            {
                name: 'Type nesting beyond safety limit',
                input: `
                    ${'def Level = ' + 'struct { next: '.repeat(150)} i32 ${'}'.repeat(150)}
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'TYPE_NESTING_TOO_DEEP',
                        msg: 'Type nesting exceeds safety limit'
                    }
                ]
            }
        ],

        ASTCompatibilityTests: [
            {
                name: 'All statement types coverage',
                input: `
                    // Cover all statement kinds
                    let x = 1;                          // Let
                    def T = i32;                        // Def
                    use print from "./utils/print.k";   // Use
                    fn f() { return 1; }                // Func
                    { let y = 2; }                      // Block
                    while (true) { break; }             // While
                    do { continue; } while (false) ;    // Do
                    for (0..10) { }                     // For
                    return 42;                          // Return
                    x + 1;                              // Expression
                `,
                success: true,
                diagnostics: [],
            }
        ],
    }

    const SelfKeywordCases = {
        SelfMustFails: [
            // 1. self in static method
            {
                name: 'self cannot be used in static methods',
                input: `
                    def Point = struct {
                        x: i32;
                        static fn create() -> Point {
                            return self;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // 2. self in module-level function
            {
                name: 'self cannot be used in module-level functions',
                input: `
                    fn standalone() -> i32 {
                        return self.x;
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'UNDEFINED_IDENTIFIER',
                        msg: "self can only be used in instance methods"
                    }
                ]
            },

            // 4. self in nested function inside struct method
            // THIS MUST BE ALLOWED !!!
            {
                name: 'self in nested function loses context',
                input: `
                    def Point = struct {
                        x: i32;
                        fn process() {
                            fn inner() {
                                return self.x;
                            }
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // 5. Shadowing self parameter
            {
                name: 'cannot shadow self with variable',
                input: `
                    def Point = struct {
                        x: i32;
                        fn method() {
                            let self = 10;
                        }
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'VARIABLE_SHADOWING',
                        msg: "Symbol 'self' shadows parameter 'self' in same scope"
                    }
                ]
            },

            // 6. self as function parameter
            {
                name: 'cannot use self as explicit parameter name',
                input: `
                    def Point = struct {
                        x: i32;
                        fn method(self: i32) {
                            return self;
                        }
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'PARAMETER_SHADOWING',
                        msg: "Duplicate parameter name 'self'"
                    }
                ]
            },

            // 7. self in global scope
            {
                name: 'self not valid in global scope',
                input: `
                    let x = self;
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'UNDEFINED_IDENTIFIER',
                        msg: "self can only be used in instance methods"
                    }
                ]
            },

            // 8. self in block scope
            {
                name: 'self not valid in block scope',
                input: `
                    fn main() {
                        {
                            let y = self;
                        }
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'UNDEFINED_IDENTIFIER',
                        msg: "self can only be used in instance methods"
                    }
                ]
            },

            {
                name: 'self in enum variant struct method',
                input: `
                    def Result = enum {
                        Ok: struct {
                            value: i32;
                            fn getValue() -> i32 {
                                return self.value;
                            }
                        }
                    }
                `,
                success: true,
                diagnostics: []
            }
        ],

        SelfMustSucceed: [
            // 1. Basic self usage
            {
                name: 'self in struct method',
                input: `
                    def Point = struct {
                        x: i32;
                        y: i32;
                        fn getX() -> i32 {
                            return self.x;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // // 2. Multiple self references
            // {
            //     name: 'multiple self references in method',
            //     input: `
            //         def Point = struct {
            //             x: i32;
            //             y: i32;
            //             fn distance() -> f64 {
            //                 return @sqrt(((self.x * self.x) + (self.y * self.y)) as f64); // no more @sqrt
            //             }
            //         }
            //     `,
            //     success: true,
            //     diagnostics: []
            // },

            // 3. self in method with parameters
            {
                name: 'self with other parameters',
                input: `
                    def Point = struct {
                        x: i32;
                        y: i32;
                        fn add(dx: i32, dy: i32) -> Point {
                            let newX = (self.x + dx);
                            let newY = (self.y + dy);
                            return Point;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // 4. self in if expression
            {
                name: 'self in conditional',
                input: `
                    def Point = struct {
                        x: i32;
                        fn isPositive() -> bool {
                            if (self.x > 0) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // 5. self in loop
            {
                name: 'self in loop',
                input: `
                    def Counter = struct {
                        count: i32;
                        fn increment() {
                            while (self.count < 10) {
                                self.count = self.count + 1;
                            }
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // 6. self in switch
            {
                name: 'self in switch',
                input: `
                    def Point = struct {
                        x: i32;
                        fn classify() -> i32 {
                            match (self.x) {
                                0 => { return 0; }
                                default => { return 1; }
                            }
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // 7. self in binary expression
            {
                name: 'self in binary operations',
                input: `
                    def Vector = struct {
                        x: i32;
                        y: i32;
                        fn magnitude() -> i32 {
                            return ((self.x * self.x) + (self.y * self.y));
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // 8. Multiple methods using self
            {
                name: 'multiple methods all using self',
                input: `
                    def Rectangle = struct {
                        width: i32;
                        height: i32;
                        fn area() -> i32 {
                            return (self.width * self.height);
                        }
                        fn perimeter() -> i32 {
                            return ((self.width + self.height) * 2);
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // 9. self with method call chain
            {
                name: 'self as part of member access chain',
                input: `
                    def Point = struct {
                        x: i32;
                        fn double() -> Point {
                            self.x = (self.x * 2);
                            return self;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // 10. self in assignment
            {
                name: 'assigning to self members',
                input: `
                    def Counter = struct {
                        value: i32;
                        fn reset() {
                            self.value = 0;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // 11. Mixed static and instance methods
            {
                name: 'struct with both static and instance methods',
                input: `
                    def Point = struct {
                        x: i32;
                        y: i32;
                        static fn origin() -> Point {
                            return Point;
                        }
                        fn getX() -> i32 {
                            return self.x;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // 12. self in nested struct
            {
                name: 'self in nested struct method',
                input: `
                    def Outer = struct {
                        inner: struct {
                            value: i32;
                            fn getValue() -> i32 {
                                return self.value;
                            }
                        };
                        fn getInnerValue() -> i32 {
                            return self.inner.getValue();
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },
        ],

        // Edge cases that test symbol collector behavior
        SelfEdgeCases: [
            {
                name: 'self symbol should be marked as synthetic',
                input: `
                    def Point = struct {
                        x: i32;
                        fn T_ST() {
                            let y = self.x;
                        }
                    }
                `,
                success: true,
                diagnostics: [],
                // Additional validation: Check that 'self' symbol has metadata.isSynthetic = true
            },

            {
                name: 'self should not leak between methods',
                input: `
                    def Point = struct {
                        x: i32;
                        fn method1() {
                            let a = self.x;
                        }
                        fn method2() {
                            let b = self.x;
                        }
                    }
                `,
                success: true,
                diagnostics: [],
                // Each method should have its own 'self' symbol
            },

            {
                name: 'self type should reference parent struct',
                input: `
                    def Point = struct {
                        x: i32;
                        fn getSelf() -> Point {
                            return self;
                        }
                    }
                `,
                success: true,
                diagnostics: [],
                // self's type should be 'Point'
            },
        ]
    }

    const VisibilityValidation = {
        VisibilityMustFail: [
            {
                name: 'Cannot import private symbol',
                input: `use private_var from "./utils/print.k";`, // Assuming private_var is not pub
                success: false,
                diagnostics: [{
                    kind: 'error',
                    code: 'SYMBOL_NOT_EXPORTED',
                    msg: "Symbol 'private_var' is private in module 'print'"
                }]
            }
        ],

        VisibilityMustSucceed: [
            {
                name: 'Can import public symbol',
                input: `use print from "./utils/print.k";`, // Assuming print is pub
                success: true,
                diagnostics: []
            }
        ]
    }

    const Dummy = {
        Dummy: [
            {
                name: 'Dummy',
                input: `let x = 1;`,
                success: true,
                diagnostics: [],
            }
        ]
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ T_ST ════════════════════════════════════════╗

    testAnalyzer({
        ...UseCases,
        ...DefCases,
        ...LetCases,
        ...FuncCases,
        ...StructCases,
        ...EnumCases,
        ...BlockCases,
        ...LoopCases,
        ...ExprCases,
        ...ComplexCases,
        ...EdgeCases,
        ...CriticalTestCases,
        ...More,
        ...SelfKeywordCases,
        ...VisibilityValidation,
        // ...Dummy,
    }, AnalysisPhase.Collection);

// ╚══════════════════════════════════════════════════════════════════════════════════════╝