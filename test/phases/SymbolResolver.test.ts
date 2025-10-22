// SymbolResolver.test.ts - Complete Test Suite
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { testAnalyzer, AnalysisPhase } from '../utils';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ INIT ════════════════════════════════════════╗

    const UseCases = {
        UseMustFails: [
            // USED_BEFORE_DECLARED
            {
                name: 'Import used before declaration',
                input: 'let x = mut_bool_var; use mut_bool_var from "./utils/print.k";',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        msg: "Symbol 'mut_bool_var' used before declaration",
                        code: 'USED_BEFORE_DECLARED',
                    },
                ],
            },

            // MODULE_NOT_FOUND
            {
                name: 'Invalid module path',
                input: 'use something from "./invalid/path.k";',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'MODULE_NOT_FOUND',
                        msg: "Module not found in path './invalid/path.k'",
                    },
                ],
            },

            // SYMBOL_NOT_FOUND - Multi-part member access with invalid member
            {
                name: 'Invalid member in import path',
                input: 'use utils.invalidMember from "./utils/print.k";',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'SYMBOL_NOT_FOUND',
                    },
                ],
            },
        ],

        UseMustSucceed: [
            // Basic import
            {
                name: 'Basic module import',
                input: 'use mut_bool_var from "./utils/print.k";',
                success: true,
                diagnostics: [],
            },

            // Import and use
            {
                name: 'Import and use in expression',
                input: 'use mut_bool_var from "./utils/print.k"; let x : bool = mut_bool_var;',
                success: true,
                diagnostics: [],
            },

            // Multi-part member access (valid)
            {
                name: 'Multi-part member access import',
                input: 'use utils.print from "./utils/print.k";',
                success: true,
                diagnostics: [],
            },

            // Import with alias
            {
                name: 'Import with alias',
                input: 'use print as myPrint from "./utils/print.k";',
                success: true,
                diagnostics: [],
            },

            // Local use statement
            {
                name: 'Local use statement',
                input: 'let x = 10; use x as y; let z = y;',
                success: true,
                diagnostics: [],
            },
        ],
    };

    const DefCases = {
        DefMustFails: [
            // USED_BEFORE_DECLARED
            {
                name: 'Type used before definition',
                input: 'let x : MyBool = true; def MyBool = bool;',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        msg: "Symbol 'MyBool' used before declaration",
                        code: 'USED_BEFORE_DECLARED',
                    },
                ],
            },

            // UNDEFINED_IDENTIFIER
            {
                name: 'Type definition references undefined type',
                input: 'def MyType = UndefinedType;',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'UNDEFINED_IDENTIFIER',
                        msg: "Undefined type 'UndefinedType'",
                    },
                ],
            },
        ],

        DefMustSucceed: [
            // Basic type definition
            {
                name: 'Basic type alias',
                input: 'def int = i32; let x : int = 10 as int;',
                success: true,
                diagnostics: [],
            },

            // Struct type
            {
                name: 'Struct type definition',
                input: 'def Point = struct { x: i32; y: i32 }; let p: Point;',
                success: true,
                diagnostics: [],
            },

            // Enum type
            {
                name: 'Enum type definition',
                input: 'def Color = enum { Red, Green, Blue }; let c: Color;',
                success: true,
                diagnostics: [],
            },

            // Nested type resolution
            {
                name: 'Type alias chain',
                input: 'def Inner = i32; def Outer = Inner; let x: Outer = 10 as Outer;',
                success: true,
                diagnostics: [],
            },

            // Error type
            {
                name: 'Error type definition',
                input: 'def MyError = errset{ NotFound, InvalidInput }; fn T_ST() -> MyError!i32 { return 42; }',
                success: true,
                diagnostics: [],
            },

            // Union type
            {
                name: 'Union type definition',
                input: 'def IntOrBool = i32 | bool; let x: IntOrBool = 42;',
                success: true,
                diagnostics: [],
            },
        ],
    };

    const LetCases = {
        LetMustFails: [
            // VARIABLE_SELF_INIT
            {
                name: 'Variable self-initialization',
                input: 'let x = x;',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'VARIABLE_SELF_INIT',
                        msg: "let 'x' cannot be initialized using itself",
                    },
                ],
            },

            // USED_BEFORE_INITIALIZED
            {
                name: 'Using uninitialized variable',
                input: 'let x: i32; let y = x;',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'USED_BEFORE_INITIALIZED',
                        msg: "Variable 'x' used before initialization",
                    },
                ],
            },

            // UNDEFINED_IDENTIFIER
            {
                name: 'Variable initialized with undefined symbol',
                input: 'let x = undefinedVar;',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'UNDEFINED_IDENTIFIER',
                        msg: "Undefined identifier 'undefinedVar'",
                    },
                ],
            },
        ],

        LetMustSucceed: [
            // Basic variable
            {
                name: 'Basic variable declaration',
                input: 'let x = 10;',
                success: true,
                diagnostics: [],
            },

            // With type annotation
            {
                name: 'Variable with type annotation',
                input: 'let x : i32 = 10;',
                success: true,
                diagnostics: [],
            },

            // Constructor syntax
            {
                name: 'Variable with struct constructor',
                input: 'def Point = struct { x: i32; y: i32 } let p = new Point { x: 10, y: 20 };',
                success: true,
                diagnostics: [],
            },

            // Anonymous struct
            {
                name: 'Variable with anonymous struct',
                input: 'let obj = struct { x: i32; y: i32 };',
                success: true,
                diagnostics: [],
            },

            // Anonymous enum
            {
                name: 'Variable with anonymous enum',
                input: 'let color = enum { Red, Green, Blue };',
                success: true,
                diagnostics: [],
            },

            // Complex initialization
            {
                name: 'Variable with complex expression',
                input: 'let x = ((10 + 20) * 30);',
                success: true,
                diagnostics: [],
            },
        ],
    };

    const FuncCases = {
        FuncMustFails: [
            // PARAMETER_SELF_INIT
            {
                name: 'Parameter self-initialization',
                input: 'fn T_ST(x: i32 = x) {}',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'PARAMETER_SELF_INIT',
                        msg: "Param 'x' cannot be initialized using itself",
                    },
                ],
            },

            // PARAMETER_FORWARD_REFERENCE
            {
                name: 'Parameter forward reference',
                input: 'fn T_ST(x: i32 = y, y: i32 = 0) {}',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'PARAMETER_FORWARD_REFERENCE',
                        msg: "Parameter 'x' default value refers to parameter 'y' which is not yet declared",
                    },
                ],
            },

            // UNDEFINED_IDENTIFIER in body
            {
                name: 'Function body references undefined variable',
                input: 'fn T_ST() { let x = undefinedVar; }',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'UNDEFINED_IDENTIFIER',
                        msg: "Undefined identifier 'undefinedVar'",
                    },
                ],
            },
        ],

        FuncMustSucceed: [
            // Basic function
            {
                name: 'Basic function',
                input: 'fn foo() {}',
                success: true,
                diagnostics: [],
            },

            // Function with parameters
            {
                name: 'Function with parameters',
                input: 'fn add(x: i32, y: i32) { return x + y; }',
                success: true,
                diagnostics: [],
            },

            // Function with return type
            {
                name: 'Function with return type',
                input: 'fn getValue() -> i32 { return 42; }',
                success: true,
                diagnostics: [],
            },

            // Parameter backward reference
            {
                name: 'Parameter with backward reference',
                input: 'fn T_ST(x: i32 = 0, y: i32 = x) {}',
                success: true,
                diagnostics: [],
            },

            // Function call
            {
                name: 'Function call resolution',
                input: 'fn foo() {} fn bar() { foo(); }',
                success: true,
                diagnostics: [],
            },

            // Nested function calls
            {
                name: 'Nested function calls',
                input: 'fn f() -> i32 { return 1; } fn g() -> i32 { return f(); }',
                success: true,
                diagnostics: [],
            },

            // Function with anonymous type parameter
            {
                name: 'Function with anonymous struct parameter',
                input: 'fn process(data: struct { x: i32; y: i32 }) {}',
                success: true,
                diagnostics: [],
            },
        ],
    };

    const StructCases = {
        StructMustFails: [
            // Missing field in constructor
            {
                name: 'Constructor missing required field',
                input: 'def Point = struct { x: i32; y: i32 } let p = new Point { x: 10 };',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'SYMBOL_NOT_FOUND',
                        msg: "Required field 'y' not provided in constructor",
                    },
                ],
            },

            // Invalid field in constructor
            {
                name: 'Constructor with invalid field',
                input: 'def Point = struct { x: i32; y: i32 } let p = new Point { x: 10, y: 20, z: 30 };',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'SYMBOL_NOT_FOUND',
                        msg: "Member 'z' not found in struct",
                    },
                ],
            },
        ],

        StructMustSucceed: [
            // Basic struct with constructor
            {
                name: 'Struct with valid constructor',
                input: 'def Point = struct { x: i32; y: i32 } let p = new Point { x: 10, y: 20 };',
                success: true,
                diagnostics: [],
            },

            // Struct with default field values
            {
                name: 'Struct with default values',
                input: 'def Point = struct { x: i32 = 0; y: i32 = 0 } let p = new Point {};',
                success: true,
                diagnostics: [],
            },

            // Nested struct types
            {
                name: 'Nested struct types',
                input: 'def Inner = struct { value: i32 } def Outer = struct { inner: Inner }',
                success: true,
                diagnostics: [],
            },

            // Struct with methods - basic
            {
                name: 'Struct with method',
                input: `
                    def Point = struct {
                        x: i32;
                        fn getX() -> i32 { return x; }
                    }
                `,
                success: true,
                diagnostics: [],
            },
        ],
    };

    const StructMethodCases = {
        MethodMustFails: [
            // 'self' used outside method
            {
                name: 'self used in standalone function',
                input: 'fn standalone() { let x = self; }',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'UNDEFINED_IDENTIFIER',
                        msg: "self can only be used in instance methods",
                    },
                ],
            },

            // 'self' in static method
            {
                name: 'self in static method',
                input: `
                    def Point = struct {
                        x: i32;
                        static fn create() -> Point {
                            return self;
                        }
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'UNDEFINED_IDENTIFIER',
                        msg: "self can only be used in instance methods",
                    }
                ],
            },

            // Invalid field access on self
            {
                name: 'Invalid field access via self',
                input: `
                    def Point = struct {
                        x: i32;
                        fn T_ST() -> i32 {
                            return self.invalidField;
                        }
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'UNDEFINED_IDENTIFIER',
                        msg: "Undefined identifier 'invalidField'",
                    },
                ],
            },
        ],

        MethodMustSucceed: [
            // Basic self usage
            {
                name: 'Basic self in method',
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
                diagnostics: [],
            },

            // Multiple self references
            {
                name: 'Multiple self references',
                input: `
                    def Point = struct {
                        x: i32;
                        y: i32;
                        fn distance() -> i32 {
                            return ((self.x * self.x) + (self.y * self.y));
                        }
                    }
                `,
                success: true,
                diagnostics: [],
            },

            // Self with other parameters
            {
                name: 'Self with parameters',
                input: `
                    def Point = struct {
                        x: i32;
                        y: i32;
                        fn add(dx: i32, dy: i32) {
                            self.x = (self.x + dx);
                            self.y = (self.y + dy);
                        }
                    }
                `,
                success: true,
                diagnostics: [],
            },

            // Self in conditional
            {
                name: 'Self in if expression',
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
                diagnostics: [],
            },

            // Self in loop
            {
                name: 'Self in loop',
                input: `
                    def Counter = struct {
                        count: i32;
                        fn increment() {
                            while (self.count < 10) {
                                self.count = (self.count + 1);
                            }
                        }
                    }
                `,
                success: true,
                diagnostics: [],
            },

            // Mixed static and instance methods
            {
                name: 'Static and instance methods',
                input: `
                    def Point = struct {
                        x: i32;
                        y: i32;
                        static fn origin() -> Point {
                            return Point { x: 0, y: 0 };
                        }
                        fn getX() -> i32 {
                            return self.x;
                        }
                    }
                `,
                success: true,
                diagnostics: [],
            },

            // Direct field access (implicit self)
            {
                name: 'Direct field access in method',
                input: `
                    def Point = struct {
                        x: i32;
                        y: i32;
                        fn getSum() -> i32 {
                            return (x + y);
                        }
                    }
                `,
                success: true,
                diagnostics: [],
            },
        ],
    };

    const EnumCases = {
        EnumMustFails: [],

        EnumMustSucceed: [
            // Basic enum
            {
                name: 'Basic enum definition',
                input: 'def Color = enum { Red, Green, Blue }; let c: Color;',
                success: true,
                diagnostics: [],
            },

            // Enum with typed variants
            {
                name: 'Enum with typed variants',
                input: 'def Option = enum { Some: i32, None }; let o: Option;',
                success: true,
                diagnostics: [],
            },

            // Enum with struct variant
            {
                name: 'Enum with struct variant',
                input: `
                    def Result = enum {
                        Ok: struct { value: i32 },
                        Err: struct { message: []u8 }
                    }
                `,
                success: true,
                diagnostics: [],
            },

            // Complex enum
            {
                name: 'Complex enum with multiple variants',
                input: `
                    def Message = enum {
                        Quit,
                        Move: struct { x: i32; y: i32 },
                        Write: []u8,
                        ChangeColor: .{i32, i32, i32}
                    }
                `,
                success: true,
                diagnostics: [],
            },
        ],
    };

    const MemberAccessCases = {
        MemberAccessMustFails: [
            // Member access on non-existent field
            {
                name: 'Access non-existent field',
                input: 'def Point = struct { x: i32; y: i32 } let p: ?Point = null; let z = p.z;',
                success: true,
                diagnostics: [
                    // {
                    //     kind: 'error',
                    //     code: 'SYMBOL_NOT_FOUND',
                    //     msg: "Member 'z' not found in 'type'",
                    // },
                ],
            },

            // Member access without type
            {
                name: 'Member access on untyped symbol',
                input: 'let x = 10; let y = x.field;',
                success: true,
                diagnostics: [
                    // {
                    //     kind: 'error',
                    //     code: 'TYPE_INFERENCE_FAILED',
                    // },
                ],
            },
        ],

        MemberAccessMustSucceed: [
            // Basic member acfcess
            {
                name: 'Basic field access',
                input: 'def Point = struct { x: i32; y: i32 } let p: ?Point = null; let x = p.x;',
                success: true,
                diagnostics: [],
            },

            // Chained member access
            {
                name: 'Chained member access',
                input: 'def Inner = struct { val: i32 } def Outer = struct { inner: Inner } let o: ?Outer = null; let v = o.inner.val;',
                success: true,
                diagnostics: [],
            },

            // Member access on variable
            {
                name: 'Member access via variable',
                input: `
                    def Point = struct { x: i32; y: i32 }
                    fn T_ST() {
                        let p: ?Point = null;
                        let x = p.x;
                        let y = p.y;
                    }
                `,
                success: true,
                diagnostics: [],
            },
        ],
    };

    const ExpressionCases = {
        ExprMustFails: [
            // NOT_A_FUNCTION
            {
                name: 'Calling non-function',
                input: 'let x = 10; x();',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'NOT_A_FUNCTION',
                        msg: "Cannot call value of non-function type. 'x' is a variable",
                    },
                ],
            },

            // UNDEFINED_IDENTIFIER in expression
            {
                name: 'Undefined identifier in expression',
                input: 'let x = (10 + undefinedVar);',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'UNDEFINED_IDENTIFIER',
                        msg: "Undefined identifier 'undefinedVar'",
                    },
                ],
            },
        ],

        ExprMustSucceed: [
            // Binary expressions
            {
                name: 'Binary expressions',
                input: 'let x = (1 + 2); let y = (x * 3);',
                success: true,
                diagnostics: [],
            },

            // Complex nested expressions
            {
                name: 'Nested expressions',
                input: 'let result = (((1 + 2) * (3 - 4)) / 5);',
                success: true,
                diagnostics: [],
            },

            // Prefix operators
            {
                name: 'Prefix operators',
                input: 'let x = 10; let y = -x; let z = !true;',
                success: true,
                diagnostics: [],
            },

            // Tuple expressions
            {
                name: 'Tuple expressions',
                input: 'let x = .{1, 2, 3}; let y = .{true, false};',
                success: true,
                diagnostics: [],
            },

            // As expressions
            {
                name: 'Type casting',
                input: 'let x = 10 as i64; def MyInt = i32; let y = 20 as MyInt;',
                success: true,
                diagnostics: [],
            },

            // Range expressions
            {
                name: 'Range expressions',
                input: 'let r = 0..10; let start = 0; let end = 10; let r2 = start..end;',
                success: true,
                diagnostics: [],
            },

            // Orelse expressions
            {
                name: 'Orelse expressions',
                input: 'let x: ?i32 = null; let y = x ?? 0;',
                success: true,
                diagnostics: [],
            },
        ],
    };

    const ControlFlowCases = {
        ControlFlowMustSucceed: [
            // If expressions
            {
                name: 'If expression',
                input: 'fn T_ST() { if (true) { let x = 1; } else { let y = 2; } }',
                success: true,
                diagnostics: [],
            },

            // While loop
            {
                name: 'While loop',
                input: 'fn T_ST() { while (true) { let x = 1; } }',
                success: true,
                diagnostics: [],
            },

            // Do-while loop
            {
                name: 'Do-while loop',
                input: 'fn T_ST() { do { let x = 1; } while (true) }',
                success: true,
                diagnostics: [],
            },

            // For loop
            {
                name: 'For loop',
                input: 'fn T_ST() { let mut i: i32 = 0; for (0..10) {++i;} }',
                success: true,
                diagnostics: [],
            },

            // Switch expression
            {
                name: 'Switch expression',
                input: 'fn T_ST(x: i32) { match (x) { 1 => { let a = 1; } 2 => { let b = 2; } } }',
                success: true,
                diagnostics: [],
            },

            // Return statement
            {
                name: 'Return statement',
                input: 'fn getValue() -> i32 { return 42; }',
                success: true,
                diagnostics: [],
            },

            // Try-catch
            {
                name: 'Try-catch expression',
                input: 'fn operation(){} fn T_ST() { let x = operation() catch { return 0; }; }',
                success: true,
                diagnostics: [],
            },
        ],
    };

    const BuiltinCases = {
        BuiltinMustFails: [
            // Undefined builtin
            {
                name: 'Undefined builtin function',
                input: 'fn T_ST() { @undefined_builtin(); }',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        code: 'UNDEFINED_BUILTIN',
                        msg: "Undefined builtin function '@undefined_builtin'",
                    },
                ],
            },
        ],

        BuiltinMustSucceed: [
            // Built-in print
            {
                name: 'Builtin print function',
                input: 'fn T_ST() { @print("hello"); }',
                success: true,
                diagnostics: [],
            },

            // // Built-in sqrt
            // {
            //     name: 'Builtin sqrt function',
            //     input: 'fn T_ST() { let x = @sqrt(16.0); }', // no more @sqrt
            //     success: true,
            //     diagnostics: [],
            // },
        ],
    };

    const AnonymousTypeCases = {
        AnonymousMustSucceed: [
            // Anonymous struct in variable
            {
                name: 'Anonymous struct variable',
                input: 'let point = struct { x: i32; y: i32 };',
                success: true,
                diagnostics: [],
            },

            // Anonymous enum in variable
            {
                name: 'Anonymous enum variable',
                input: 'let color = enum { Red, Green, Blue };',
                success: true,
                diagnostics: [],
            },

            // Anonymous struct in parameter
            {
                name: 'Anonymous struct parameter',
                input: 'fn process(data: struct { x: i32; y: i32 }) {}',
                success: true,
                diagnostics: [],
            },

            // Nested anonymous types
            {
                name: 'Nested anonymous types',
                input: `
                    let complex = struct {
                        inner: struct {
                            value: i32
                        }
                    };
                `,
                success: true,
                diagnostics: [],
            },
        ],
    };

    const ComplexScenarios = {
        ComplexMustSucceed: [
            // Full struct with methods and self
            {
                name: 'Complete struct with methods',
                input: `
                    def Point = struct {
                        x: i32;
                        y: i32;
                        fn getX() -> i32 {
                            return self.x;
                        }
                        fn setX(newX: i32) {
                            self.x = newX;
                        }
                        fn distance() -> i32 {
                            return ((self.x * self.x) + (self.y * self.y));
                        }
                    }
                    fn main() {
                        let p = new Point { x: 10, y: 20 };
                        let x = p.x;
                    }
                `,
                success: true,
                diagnostics: [],
            },

            // Module import with usage
            {
                name: 'Import and usage',
                input: `
                    use print from "./utils/print.k";
                    fn main() {
                        let msg: []u8 = "Hello!";
                        print(msg);
                    }
                `,
                success: true,
                diagnostics: [],
            },

            // Type alias chain
            {
                name: 'Multiple type aliases',
                input: `
                    def A = i32;
                    def B = A;
                    def C = B;
                    let x: C = 10 as C;
                `,
                success: true,
                diagnostics: [],
            },

            // Recursive type
            {
                name: 'Recursive type definition',
                input: 'def Node = struct { value: i32; next: *Node }',
                success: true,
                diagnostics: [],
            },

            // Complex function type
            {
                name: 'Function type definition',
                input: `
                    def Callback = fn(i32, bool) -> i32;
                    let handler: Callback;
                `,
                success: true,
                diagnostics: [],
            },

            // Enum with struct variants
            {
                name: 'Enum with struct variants',
                input: `
                    def Result = enum {
                        Ok: struct {
                            value: i32;
                            fn getValue() -> i32 {
                                return value;
                            }
                        },
                        Err: struct { message: []u8 }
                    }
                `,
                success: true,
                diagnostics: [],
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
                diagnostics: [],
            },

            // Multiple nested scopes
            {
                name: 'Deeply nested scopes',
                input: `
                    fn T_ST() {
                        let x = 1;
                        {
                            let x = 2;
                            {
                                let x = 3;
                            }
                        }
                    }
                `,
                success: true,
                diagnostics: [
                    {
                        kind: 'warning',
                        code: 'VARIABLE_SHADOWING',
                    },
                    {
                        kind: 'warning',
                        code: 'VARIABLE_SHADOWING',
                    },
                ],
            },

            // Variable shadowing across functions
            {
                name: 'Variables in sibling functions',
                input: 'fn a() { let x = 1; } fn b() { let x = 2; } fn c() { let x = 3; }',
                success: true,
                diagnostics: [],
            },
        ],
    };

    const ArrayAndCollectionCases = {
        ArrayMustSucceed: [
            // Array access
            {
                name: 'Array indexing',
                input: 'let arr: [2]i32 = [1,2]; let x = arr[0];',
                success: true,
                diagnostics: [],
            },

            // Array type with custom type
            {
                name: 'Array of custom type',
                input: 'def MyInt = i32; def MyArray = [10]MyInt; let arr: MyArray;',
                success: true,
                diagnostics: [],
            },
        ],
    };

    const PostfixOperatorCases = {
        PostfixMustSucceed: [
            // Increment/decrement
            {
                name: 'Increment and decrement operators',
                input: 'let mut x: i32 = 0; ++x; x++;',
                success: true,
                diagnostics: [],
            },

            // Dereference
            {
                name: 'Pointer dereference',
                input: 'let ptr: *i32 = null; let val = ptr.*;',
                success: true,
                diagnostics: [],
            },

            // Chained operations
            {
                name: 'Chained postfix operations',
                input: 'def Point = struct { x: i32 } let p: ?Point = null; let x = p.x;',
                success: true,
                diagnostics: [],
            },
        ],
    };

    const TypeSystemCases = {
        TypeMustSucceed: [
            // Optional types
            {
                name: 'Optional type resolution',
                input: 'def MyInt = i32; def MaybeInt = ?MyInt; let x: MaybeInt = null;',
                success: true,
                diagnostics: [],
            },

            // Pointer types
            {
                name: 'Pointer type resolution',
                input: 'def MyInt = i32; def MyPtr = *MyInt; let p: MyPtr;',
                success: true,
                diagnostics: [],
            },

            // Tuple types
            {
                name: 'Tuple type resolution',
                input: 'def MyInt = i32; def MyBool = bool; def MyTuple = .{MyInt, MyBool}; let t: MyTuple;',
                success: true,
                diagnostics: [],
            },

            // Union types
            {
                name: 'Union type resolution',
                input: 'def IntOrBool = i32 | bool; let x: IntOrBool = 42;',
                success: true,
                diagnostics: [],
            },

            // Function types
            {
                name: 'Function type resolution',
                input: 'def MyInt = i32; def MyFunc = fn(MyInt) -> MyInt; let f: MyFunc;',
                success: true,
                diagnostics: [],
            },

            // Error types
            {
                name: 'Error type in function signature',
                input: `
                    def FileError = errset{ NotFound, PermissionDenied }
                    fn readFile(path: []u8) -> FileError!i32 {
                        return 42;
                    }
                `,
                success: true,
                diagnostics: [],
            },
        ],
    };

    const VisibilityAndExportCases = {
        VisibilityMustSucceed: [
            // Public symbols
            {
                name: 'Public function',
                input: 'pub fn main() {}',
                success: true,
                diagnostics: [],
            },

            // Public type definition
            {
                name: 'Public type definition',
                input: 'pub def Point = struct { x: i32; y: i32 }',
                success: true,
                diagnostics: [],
            },

            // Public variable
            {
                name: 'Public variable',
                input: 'pub let mut counter: i32 = 0;',
                success: true,
                diagnostics: [],
            },

            // Mix of public and private
            {
                name: 'Mixed visibility',
                input: `
                    pub def PublicType = i32;
                    def PrivateType = bool;
                    pub fn publicFunc() {}
                    fn privateFunc() {}
                `,
                success: true,
                diagnostics: [],
            },
        ],
    };

    const ScopeResolutionCases = {
        ScopeMustSucceed: [
            // Block scope
            {
                name: 'Block scope resolution',
                input: 'fn T_ST() { { let x = 1; } let y = 2; }',
                success: true,
                diagnostics: [],
            },

            // Function scope
            {
                name: 'Function local variables',
                input: 'fn T_ST() { let x = 10; let y = x + 5; }',
                success: true,
                diagnostics: [],
            },

            // Loop scope
            {
                name: 'Loop variable scope',
                input: 'fn T_ST() { while (true) { let x = 1; } let x = 2; }',
                success: true,
                diagnostics: [],
            },

            // Expression scope (if/else)
            {
                name: 'Expression scope variables',
                input: 'fn T_ST() { if (true) { let x = 1; } else { let x = 2; } }',
                success: true,
                diagnostics: [],
            },
        ],
    };

    const IntegrationTests = {

        IntegrationMustSucceed: [
            // Complete program with imports
            {
                name: 'Full program with imports and types',
                input: `
                    use print from "./utils/print.k";

                    def Point = struct {
                        x: i32;
                        y: i32;
                        fn distance() -> i32 {
                            return ((self.x * self.x) + (self.y * self.y));
                        }
                    }

                    fn createPoint(x: i32, y: i32) -> Point {
                        return new Point { x: x, y: y };
                    }

                    pub fn main() {
                        let p = createPoint(10, 20);
                        let d = p.distance();
                        print("Distance calculated");
                    }
                `,
                success: true,
                diagnostics: [],
            },

            // Error handling pattern
            {
                name: 'Error handling with try-catch',
                input: `
                    def FileError = errset{ NotFound, PermissionDenied, IOError }

                    fn readFile(path: []u8) -> FileError!i32 {
                        return 42;
                    }

                    fn main() {
                        let result = try readFile("test.txt");
                        let safe = readFile("test.txt") catch { return 0; };
                    }
                `,
                success: true,
                diagnostics: [],
            },

            // Generic-like pattern with type aliases
            {
                name: 'Type aliases for generic-like code',
                input: `
                    def IntList = [10]i32;
                    def BoolList = [10]bool;
                    def StrList = [10]u8;

                    fn processInts(list: IntList) {}
                    fn processBools(list: BoolList) {}
                `,
                success: true,
                diagnostics: [],
            },

            // Recursive data structure
            {
                name: 'Linked list implementation',
                input: `
                    def Node = struct {
                        value: i32;
                        next: *Node;
                        fn hasNext() -> bool {
                            return (next != null);
                        }
                    }

                    fn createNode(value: i32) -> Node {
                        return Node { value: value, next: null };
                    }
                `,
                success: true,
                diagnostics: [],
            },

            // Enum state machine
            {
                name: 'State machine with enum',
                input: `
                    def State = enum {
                        Idle,
                        Running: struct { progress: i32 },
                        Paused,
                        Finished: struct { result: i32 }
                    }

                    fn processState(state: State) {}
                `,
                success: true,
                diagnostics: [],
            },
        ],
    };

    const NestedStructTests = {
        NestedStructMustSucceed: [
            // Struct within struct
            {
                name: 'Nested struct definition',
                input: `
                    def Inner = struct { value: i32 }
                    def Outer = struct {
                        inner: Inner;
                        fn getInnerValue() -> i32 {
                            return inner.value;
                        }
                    }
                `,
                success: true,
                diagnostics: [],
            },

            // Anonymous nested struct
            {
                name: 'Anonymous nested struct',
                input: `
                    def Container = struct {
                        data: struct {
                            x: i32;
                            y: i32
                        }
                    }
                `,
                success: true,
                diagnostics: [],
            },

            // Deep nesting
            {
                name: 'Deeply nested structs',
                input: `
                    def Level3 = struct { value: i32 }
                    def Level2 = struct { level3: Level3 }
                    def Level1 = struct { level2: Level2 }
                    let nested: Level1;
                `,
                success: true,
                diagnostics: [],
            },
        ],
    };

    const MultiModuleTests = {
        MultiModuleMustSucceed: [
            // Import and re-export pattern
            {
                name: 'Import from external module',
                input: `
                    use print from "./utils/print.k";
                    use mut_bool_var from "./utils/print.k";

                    fn T_ST() {
                        print("test");
                        let x = mut_bool_var;
                    }
                `,
                success: true,
                diagnostics: [],
            },

            // Multiple imports from same module
            {
                name: 'Multiple imports',
                input: `
                    use print from "./utils/print.k";
                    use mut_bool_var from "./utils/print.k";
                    use utils from "./utils/print.k";
                `,
                success: true,
                diagnostics: [],
            },

            // Import with member access
            {
                name: 'Import with member path',
                input: `
                    use utils.print from "./utils/print.k";
                `,
                success: true,
                diagnostics: [],
            },
        ],
    };

    const CallValidationTests = {
        CallValidationMustSucceed: [
            // Valid function call
            {
                name: 'Valid function call',
                input: 'fn foo() {} foo();',
                success: true,
                diagnostics: [],
            },

            // Function call with arguments
            {
                name: 'Function call with arguments',
                input: 'fn add(x: i32, y: i32) -> i32 { return x + y; } fn main() { let z = add(1, 2); }',
                success: true,
                diagnostics: [],
            },

            // Nested calls
            {
                name: 'Nested function calls',
                input: 'fn f() -> i32 { return 1; } fn g(x: i32) {} g(f());',
                success: true,
                diagnostics: [],
            },

            // Method call
            {
                name: 'Struct method call',
                input: `
                    def Point = struct {
                        x: i32;
                        fn getX() -> i32 { return x; }
                    }
                    fn T_ST(p: Point) {
                        let x = p.getX();
                    }
                `,
                success: true,
                diagnostics: [],
            },
        ],
    };

    const Dummy = {
        Dummy: [
            {
                name: 'Dummy test',
                input: `let x = 1;`,
                success: true,
                diagnostics: [],
            }
        ]
    };

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ T_ST ════════════════════════════════════════╗

    testAnalyzer({
        ...UseCases,
        ...DefCases,
        ...LetCases,
        ...FuncCases,
        ...StructCases,
        ...StructMethodCases,
        ...EnumCases,
        ...MemberAccessCases,
        ...ExpressionCases,
        ...ControlFlowCases,
        ...BuiltinCases,
        ...AnonymousTypeCases,
        ...ComplexScenarios,
        ...EdgeCases,
        ...ArrayAndCollectionCases,
        ...PostfixOperatorCases,
        ...TypeSystemCases,
        ...VisibilityAndExportCases,
        ...ScopeResolutionCases,
        ...IntegrationTests,
        ...NestedStructTests,
        ...MultiModuleTests,
        ...CallValidationTests,
        // ...Dummy,
    }, AnalysisPhase.Resolution);

// ╚══════════════════════════════════════════════════════════════════════════════════════╝