// Special.test.ts - Complete Test Suite
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { testAnalyzer, AnalysisPhase } from '../utils';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ INIT ════════════════════════════════════════╗

    const UTF8_ASCII_ExtendedCases = {
        UTF8_ASCII_CasesMustFail: [
            // non-ascii character literal to char type - variable
            {
                name: 'non-ascii character literal to char type - variable',
                input: `
                    let c : char = '🌟';
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Value 127775 does not fit in type 'char' (valid range: 0 to 255)",
                    code: "ARITHMETIC_OVERFLOW"
                }]
            },

            // non-ascii character literal to char type - parameter default value
            {
                name: 'non-ascii character literal to char type - parameter',
                input: `
                    fn T_ST(c: char = '🌟') {}
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Value 127775 does not fit in type 'char' (valid range: 0 to 255)",
                    code: "ARITHMETIC_OVERFLOW"
                }]
            },

            // non-ascii character literal to char type - struct field
            {
                name: 'non-ascii character literal to char type - struct field',
                input: `
                    def Point = struct {
                        c: char = '🌟'
                    };
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Value 127775 does not fit in type 'char' (valid range: 0 to 255)",
                    code: "ARITHMETIC_OVERFLOW"
                }]
            },

            // non-ascii character literal to char type - function argument
            {
                name: 'non-ascii character literal to char type - function argument',
                input: `
                    fn process(c: char) {}

                    fn main() {
                        process('🌟');
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Value 127775 does not fit in type 'char' (valid range: 0 to 255)",
                    code: "ARITHMETIC_OVERFLOW"
                }]
            },

            // non-ascii character literal to char type - struct constructor
            {
                name: 'non-ascii character literal to char type - struct constructor',
                input: `
                    def Point = struct {
                        c: char
                    };

                    fn main() {
                        let p = new Point { c: '🌟' };
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Value 127775 does not fit in type 'char' (valid range: 0 to 255)",
                    code: "ARITHMETIC_OVERFLOW"
                }]
            },

            // overflow for cpoint type (> u21 max)
            {
                name: 'character code point exceeds u21 maximum',
                input: `
                    let c : cpoint = '🌟';
                    let overflow : u8 = c; // This should fail: u21 -> u8
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Value 127775 does not fit in type 'u8' (valid range: 0 to 255)",
                    code: "ARITHMETIC_OVERFLOW"
                }]
            },

            // ascii to char but with explicit wrong cast
            {
                name: 'ascii char to cpoint then to char causes issues',
                input: `
                    let a = 'a'; // infers as char (u8)
                    let cp : cpoint = a; // OK: u8 -> u21 (widening)
                    let back : char = cp; // FAIL: u21 -> u8 (narrowing without check)
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot assign type 'cpoint' to variable of type 'char'",
                    code: "TYPE_MISMATCH"
                }]
            },

            // return type mismatch
            {
                name: 'non-ascii character literal return to char type',
                input: `
                    fn get_emoji() -> char {
                        return '🌟';
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Value 127775 does not fit in type 'char' (valid range: 0 to 255)",
                    code: "ARITHMETIC_OVERFLOW"
                }]
            },

            // array element type
            {
                name: 'non-ascii character in char array',
                input: `
                    let chars : [3]char = ['a', 'b', '🌟'];
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Value 127775 does not fit in type 'char' (valid range: 0 to 255)",
                    code: "ARITHMETIC_OVERFLOW"
                }]
            },
        ],

        UTF8_ASCII_CasesMustSucceed: [
            // u21/u8 inside character literal - basic inference
            {
                name: 'u21/u8 character literal type inference',
                input: `
                    let c = 'a';      // infers as char (u8)
                    let e = '🌟';     // infers as cpoint (u21)
                    let ec : cpoint = c;  // OK: u8 -> u21 (widening)
                    let ee : cpoint = e;  // OK: u21 -> u21
                `,
                success: true,
                diagnostics: []
            },

            // ascii characters stay as char
            {
                name: 'ascii characters infer as char (u8)',
                input: `
                    let a = 'a';
                    let z = 'z';
                    let zero = '0';
                    let space = ' ';
                    let newline = '\\n';

                    // All should be char (u8)
                    let arr : [5]char = [a, z, zero, space, newline];
                `,
                success: true,
                diagnostics: []
            },

            // explicit cpoint assignment of ascii
            {
                name: 'ascii can be assigned to cpoint',
                input: `
                    let a : cpoint = 'a';  // OK: u8 literal to u21
                    let b : cpoint = 'z';  // OK
                `,
                success: true,
                diagnostics: []
            },

            // empty character literal with context
            {
                name: 'empty character literal infers from context',
                input: `
                    let c1 : char = '';    // infers as u8
                    let c2 : cpoint = '';  // infers as u21
                `,
                success: true,
                diagnostics: []
            },

            // mixed characters in cpoint array
            {
                name: 'mixed ascii and unicode in cpoint array',
                input: `
                    let chars : [4]cpoint = ['a', 'b', '🌟', '🚀'];
                `,
                success: true,
                diagnostics: []
            },

            // function parameters
            {
                name: 'character literal function parameters',
                input: `
                    fn process_char(c: char) {}
                    fn process_cpoint(c: cpoint) {}

                    fn main() {
                        process_char('a');      // OK: u8 -> char
                        process_cpoint('a');    // OK: u8 -> u21 (widening)
                        process_cpoint('🌟');   // OK: u21 -> u21
                    }
                `,
                success: true,
                diagnostics: []
            },

            // struct fields
            {
                name: 'character literals in struct',
                input: `
                    def CharData = struct {
                        ascii: char;
                        emoji: cpoint;
                    };

                    fn main() {
                        let data = new CharData {
                            ascii: 'a',
                            emoji: '🌟'
                        };
                    }
                `,
                success: true,
                diagnostics: []
            },

            // return types
            {
                name: 'character literal return types',
                input: `
                    fn get_ascii() -> char {
                        return 'a';
                    }

                    fn get_emoji() -> cpoint {
                        return '🌟';
                    }

                    fn get_either() -> cpoint {
                        return 'a'; // OK: u8 -> u21
                    }
                `,
                success: true,
                diagnostics: []
            },

            // character boundaries
            {
                name: 'character at boundaries',
                input: `
                    let max_ascii : char = '\\x7F';     // 127 - last ASCII
                    let first_unicode : cpoint = '\\u0080'; // 128 - first non-ASCII
                `,
                success: true,
                diagnostics: []
            },

            // tuple types
            {
                name: 'character literals in tuples',
                input: `
                    let t1 : .{ char, char } = .{ 'a', 'b' };
                    let t2 : .{ char, cpoint } = .{ 'a', '🌟' };
                    let t3 : .{ cpoint, cpoint } = .{ 'a', '🌟' };
                `,
                success: true,
                diagnostics: []
            },

            // optional types
            {
                name: 'character literals with optional types',
                input: `
                    let c1 : ?char = 'a';
                    let c2 : ?cpoint = '🌟';
                    let c3 : ?cpoint = 'a';
                `,
                success: true,
                diagnostics: []
            },

            // type aliases work correctly
            {
                name: 'type alias resolution for char and cpoint',
                input: `
                    let c1 : char = 'a';
                    let c2 : cpoint = '🌟';

                    // Verify the aliases resolve to u8/u21
                    let _u1 : u8 = c1;
                    let _u2 : u21 = c2;
                `,
                success: true,
                diagnostics: []
            },
        ]
    };

    const ErrorModesExtendedCases = {
        ErrorModesCasesMustFail: [
            // ======================== any-error mode ========================

            // throw non-error type in any-error function
            {
                name: 'any-error mode - throw non-error type',
                input: `
                    fn process() -> err!void {
                        throw 42; // number, not error
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot throw non-error type 'cint'. Expected error type",
                    code: "TYPE_MISMATCH"
                }]
            },

            // throw struct in any-error function
            {
                name: 'any-error mode - throw struct type',
                input: `
                    def Point = struct { x: i32; y: i32; };

                    fn process() -> err!void {
                        throw new Point { x: 0, y: 0 };
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot throw non-error type 'Point'. Expected error type",
                    code: "TYPE_MISMATCH"
                }]
            },

            // ======================== err-ident mode ========================

            // throw wrong error type in err-ident function
            {
                name: 'err-ident mode - throw incompatible error',
                input: `
                    def MyErrors = errset { IOError, ParseError };
                    def MyErrors2 = errset { IOError, ParseError };
                    let MyError : err = MyErrors.IOError;
                    let OtherError : err = MyErrors2.ParseError;

                    fn process() -> MyError!void {
                        throw OtherError; // Wrong error variable
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Thrown error type 'OtherError' is not compatible with function error type 'MyError'",
                    code: "THROW_TYPE_MISMATCH"
                }]
            },

            // mutable variable with error type
            {
                name: 'mutable variable with error type',
                input: `
                    def MyErrors = errset { IOError, ParseError };
                    let mut MyError : err = MyErrors.IOError;
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Error values cannot be stored in mutable variables. Use 'let MyError: err = ...' instead of 'let mut'",
                    code: "MUTABILITY_MISMATCH"
                }]
            },

            // throw non-error in err-ident function
            {
                name: 'err-ident mode - throw non-error type',
                input: `
                    def MyErrors = errset { IOError, ParseError };
                    let MyError : err = MyErrors.IOError;

                    fn process() -> MyError!void {
                        throw 42;
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Thrown error type 'cint' is not compatible with function error type 'MyError'",
                    code: "THROW_TYPE_MISMATCH"
                }]
            },

            // err-ident undefined
            {
                name: 'err-ident mode - undefined error variable',
                input: `
                    fn process() -> UndefinedError!void {
                        // ...
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Undefined type 'UndefinedError'",
                    code: "UNDEFINED_IDENTIFIER"
                }]
            },

            // err-ident is not error type
            {
                name: 'err-ident mode - identifier is not error type',
                input: `
                    let NotAnError : i32 = 42;

                    fn process() -> NotAnError!void {
                        // ...
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "'NotAnError' is not an error type",
                    code: "TYPE_MISMATCH"
                }]
            },

            // ======================== err-group mode ========================

            // throw error not in group
            {
                name: 'err-group mode - throw error not in group',
                input: `
                    def FileErrors = errset { NotFound, PermissionDenied };
                    def NetworkErrors = errset { Timeout, ConnectionRefused };

                    fn read_file() -> FileErrors!void {
                        throw NetworkErrors.Timeout; // Wrong error group
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Thrown error type 'Timeout' is not compatible with function error type 'FileErrors'",
                    code: "THROW_TYPE_MISMATCH"
                }]
            },

            // throw undefined error member
            {
                name: 'err-group mode - throw undefined error member',
                input: `
                    def FileErrors = errset { NotFound, PermissionDenied };

                    fn read_file() -> FileErrors!void {
                        throw FileErrors.DoesNotExist;
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Error set has no variant 'DoesNotExist'",
                    code: "SYMBOL_NOT_FOUND"
                }]
            },

            // err-group undefined
            {
                name: 'err-group mode - undefined error group',
                input: `
                    fn process() -> UndefinedErrorGroup!void {
                        // ...
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Undefined type 'UndefinedErrorGroup'",
                    code: "UNDEFINED_IDENTIFIER"
                }]
            },

            // err-group is not errset
            {
                name: 'err-group mode - identifier is not error set',
                input: `
                    def NotAnErrorSet = struct { x: i32; };

                    fn process() -> NotAnErrorSet!void {
                        // ...
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "'NotAnErrorSet' is not an error type",
                    code: "TYPE_MISMATCH"
                }]
            },

            // throw non-error in err-group function
            {
                name: 'err-group mode - throw non-error type',
                input: `
                    def FileErrors = errset { NotFound, PermissionDenied };

                    fn read_file() -> FileErrors!void {
                        throw 42;
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Thrown error type 'cint' is not compatible with function error type 'FileErrors'",
                    code: "THROW_TYPE_MISMATCH"
                }]
            },

            // ======================== self-group mode ========================

            // throw error not in self-group
            {
                name: 'self-group mode - throw error not in self-group',
                input: `
                    fn process() -> errset{IOError, ParseError}!void {
                        throw selferr.NetworkError; // Not in self-group
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        msg: "Error 'NetworkError' is not in function's error set [IOError, ParseError]",
                        code: "ERROR_MEMBER_NOT_FOUND"
                    },
                ]
            },

            // use selferr outside self-group function
            {
                name: 'self-group mode - selferr outside self-group function',
                input: `
                    def FileErrors = errset { NotFound, PermissionDenied };

                    fn process() -> FileErrors!void {
                        throw selferr.NotFound; // selferr not available
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        msg: "selferr can only be used in functions with self-group error type",
                        code: "UNDEFINED_IDENTIFIER"
                    },
                ]
            },

            // use selferr in any-error function
            {
                name: 'self-group mode - selferr in any-error function',
                input: `
                    fn process() -> err!void {
                        throw selferr.SomeError;
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "selferr can only be used in functions with self-group error type",
                    code: "UNDEFINED_IDENTIFIER"
                }]
            },

            // use selferr in non-error function
            {
                name: 'self-group mode - selferr in non-error function',
                input: `
                    fn process() -> void {
                        throw selferr.SomeError;
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        msg: "Cannot throw error in function without error type. Add '!ErrorType' to function signature",
                        code: "THROW_WITHOUT_ERROR_TYPE"
                    },
                ]
            },

            // throw non-error in self-group function
            {
                name: 'self-group mode - throw non-error type',
                input: `
                    fn process() -> errset{IOError, ParseError}!void {
                        throw 42;
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot resolve error member from thrown expression",
                    code: "TYPE_MISMATCH"
                }]
            },

            // throw without selferr in self-group (direct identifier)
            {
                name: 'self-group mode - throw error member without selferr',
                input: `
                    fn process() -> errset{IOError, ParseError}!void {
                        throw IOError; // Must use selferr.IOError
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Undefined identifier 'IOError'",
                    code: "UNDEFINED_IDENTIFIER"
                }]
            },

            // ======================== mixed error handling ========================

            // missing throw in error function
            {
                name: 'error function without throw or return',
                input: `
                    fn process() -> err!i32 {
                        // Missing return or throw
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Function 'process' with non-void return type must have at least one return statement",
                    code: "MISSING_RETURN_STATEMENT"
                }]
            },

            // throw in function without error type
            {
                name: 'throw in function without error type',
                input: `
                    def MyError = errset { Failed };

                    fn process() -> void {
                        throw MyError.Failed;
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot throw error in function without error type. Add '!ErrorType' to function signature",
                    code: "THROW_WITHOUT_ERROR_TYPE"
                }]
            },

            // throw in function with return type but no error type
            {
                name: 'throw in function with return type but no error type',
                input: `
                    def MyError = errset { Failed };

                    fn process() -> i32 {
                        throw MyError.Failed;
                    }
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        msg: "Cannot throw error in function without error type. Add '!ErrorType' to function signature",
                        code: "THROW_WITHOUT_ERROR_TYPE"
                    },
                    {
                        kind: 'error',
                        msg: "Function 'process' with non-void return type must have at least one return statement",
                        code: "MISSING_RETURN_STATEMENT"
                    }
                ]
            },
        ],

        ErrorModesCasesMustSucceed: [
            // ======================== any-error mode ========================

            // basic any-error function
            {
                name: 'any-error mode - basic usage',
                input: `
                    def MyError = errset { Failed };

                    fn process() -> err!void {
                        throw MyError.Failed;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // any-error accepts any error type
            {
                name: 'any-error mode - accepts any error',
                input: `
                    def FileError = errset { NotFound };
                    def NetworkError = errset { Timeout };

                    fn process(useFile: bool) -> err!void {
                        if (useFile) {
                            throw FileError.NotFound;
                        } else {
                            throw NetworkError.Timeout;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // any-error with return
            {
                name: 'any-error mode - with return value',
                input: `
                    def MyError = errset { Failed };

                    fn get_value() -> err!i32 {
                        if (true) {
                            throw MyError.Failed;
                        }
                        return 42;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // ======================== err-ident mode ========================

            // basic err-ident function
            {
                name: 'err-ident mode - basic usage',
                input: `
                    def MyErrors = errset { IOError };
                    let MyError : err = MyErrors.IOError;

                    fn process() -> MyError!void {
                        throw MyError;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // err-ident with return
            {
                name: 'err-ident mode - with return value',
                input: `
                    def MyErrors = errset { Failed };
                    let MyError : err = MyErrors.Failed;

                    fn get_value() -> MyError!i32 {
                        if (true) {
                            throw MyError;
                        }
                        return 42;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // err-ident multiple functions
            {
                name: 'err-ident mode - multiple functions with same error',
                input: `
                    def MyErrors = errset { IO };
                    let MyError : err = MyErrors.IO;

                    fn read_file() -> MyError!void {
                        throw MyError;
                    }

                    fn write_file() -> MyError!void {
                        throw MyError;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // ======================== err-group mode ========================

            // basic err-group function
            {
                name: 'err-group mode - basic usage',
                input: `
                    def FileErrors = errset { NotFound, PermissionDenied };

                    fn read_file() -> FileErrors!void {
                        throw FileErrors.NotFound;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // err-group multiple errors
            {
                name: 'err-group mode - throw different errors from group',
                input: `
                    def FileErrors = errset { NotFound, PermissionDenied, AlreadyExists };

                    fn process(op: i32) -> FileErrors!void {
                        if (op == 0) {
                            throw FileErrors.NotFound;
                        } else if (op == 1) {
                            throw FileErrors.PermissionDenied;
                        } else {
                            throw FileErrors.AlreadyExists;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // err-group with return
            {
                name: 'err-group mode - with return value',
                input: `
                    def NetworkErrors = errset { Timeout, ConnectionRefused };

                    fn fetch() -> NetworkErrors!i32 {
                        if (true) {
                            throw NetworkErrors.Timeout;
                        }
                        return 42;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // err-group reuse in multiple functions
            {
                name: 'err-group mode - reuse error group',
                input: `
                    def NetworkErrors = errset { Timeout, ConnectionRefused };

                    fn connect() -> NetworkErrors!void {
                        throw NetworkErrors.ConnectionRefused;
                    }

                    fn send_data() -> NetworkErrors!void {
                        throw NetworkErrors.Timeout;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // ======================== self-group mode ========================

            // basic self-group function
            {
                name: 'self-group mode - basic usage',
                input: `
                    fn process() -> errset{IOError, ParseError}!void {
                        throw selferr.IOError;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // self-group multiple errors
            {
                name: 'self-group mode - throw different self errors',
                input: `
                    fn process(mode: i32) -> errset{IOError, ParseError, NetworkError}!void {
                        if (mode == 0) {
                            throw selferr.IOError;
                        } else if (mode == 1) {
                            throw selferr.ParseError;
                        } else {
                            throw selferr.NetworkError;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },

            // self-group with return
            {
                name: 'self-group mode - with return value',
                input: `
                    fn get_value() -> errset{Failed, Timeout}!i32 {
                        if (true) {
                            throw selferr.Failed;
                        }
                        return 42;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // self-group single error
            {
                name: 'self-group mode - single error in set',
                input: `
                    fn process() -> errset{OnlyError}!void {
                        throw selferr.OnlyError;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // ======================== mixed modes in different functions ========================

            // different error modes in same file
            {
                name: 'mixed modes - different functions different modes',
                input: `
                    def MyErrors = errset { Custom };
                    let MyError : err = MyErrors.Custom;
                    def FileErrors = errset { NotFound, PermissionDenied };

                    fn any_error_fn() -> err!void {
                        throw FileErrors.NotFound;
                    }

                    fn ident_error_fn() -> MyError!void {
                        throw MyError;
                    }

                    fn group_error_fn() -> FileErrors!void {
                        throw FileErrors.PermissionDenied;
                    }

                    fn self_error_fn() -> errset{IOError, ParseError}!void {
                        throw selferr.IOError;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // nested function calls with different error modes
            {
                name: 'mixed modes - nested calls',
                input: `
                    def FileErrors = errset { NotFound };

                    fn inner() -> FileErrors!i32 {
                        throw FileErrors.NotFound;
                    }

                    fn outer() -> err!i32 {
                        return inner(); // err accepts FileErrors
                    }
                `,
                success: true,
                diagnostics: []
            },

            // ======================== error with complex types ========================

            // error with struct return
            {
                name: 'error mode - return struct type',
                input: `
                    def Point = struct { x: i32; y: i32; };
                    def ParseError = errset { Invalid };

                    fn parse() -> ParseError!Point {
                        if (true) {
                            throw ParseError.Invalid;
                        }
                        return new Point { x: 0, y: 0 };
                    }
                `,
                success: true,
                diagnostics: []
            },

            // error with array return
            {
                name: 'error mode - return array type',
                input: `
                    def ReadError = errset { Failed };

                    fn read_bytes() -> ReadError![3]u8 {
                        if (true) {
                            throw ReadError.Failed;
                        }
                        return [1, 2, 3];
                    }
                `,
                success: true,
                diagnostics: []
            },

            // error with optional return
            {
                name: 'error mode - return optional type',
                input: `
                    def LookupError = errset { NotFound };

                    fn find() -> LookupError!?i32 {
                        if (true) {
                            throw LookupError.NotFound;
                        }
                        return 42;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // ======================== error only returns ========================

            // function that only throws
            {
                name: 'error mode - function that only throws',
                input: `
                    def AlwaysError = errset { Failed };

                    fn always_fails() -> AlwaysError!i32 {
                        throw AlwaysError.Failed;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // function that only returns (but has error type)
            {
                name: 'error mode - function with error type but only returns',
                input: `
                    def MaybeError = errset { Failed };

                    fn never_fails() -> MaybeError!i32 {
                        return 42;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // ======================== void error functions ========================

            // void return with errors
            {
                name: 'error mode - void return with errors',
                input: `
                    def ValidationError = errset { Invalid, TooLong, TooShort };

                    fn validate(s: i32) -> ValidationError!void {
                        if (s < 0) {
                            throw ValidationError.TooShort;
                        } else if (s > 100) {
                            throw ValidationError.TooLong;
                        }
                    }
                `,
                success: true,
                diagnostics: []
            },
        ]
    };

    const OptionalTypesExtendedCases = {
        OptionalTypesCasesMustFail: [
            // ======================== Type Mismatch with Orelse ========================

            // orelse with incompatible fallback type
            {
                name: 'orelse - incompatible fallback type',
                input: `
                    let maybe_number: ?i32 = 42;
                    let result = maybe_number ?? "string"; // i32 vs string
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot use type '[]u8' as fallback for '?i32'",
                    code: "TYPE_MISMATCH"
                }]
            },

            {
                name: 'orelse - incompatible optional types',
                input: `
                    let a: ?i32 = null;
                    let b: ?i64 = null;
                    let result = a ?? b; // Should error: i32 vs i64
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot use type '?i64' as fallback for '?i32'",
                    code: "TYPE_MISMATCH"
                }]
            },

            // orelse with struct mismatch
            {
                name: 'orelse - incompatible struct types',
                input: `
                    def Point = struct { x: i32; y: i32; };
                    def Vector = struct { x: i32; y: i32; z: i32; };

                    let maybe_point: ?Point = null;
                    let result = maybe_point ?? new Vector { x: 0, y: 0, z: 0 };
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot use type 'Vector' as fallback for '?Point'",
                    code: "TYPE_MISMATCH"
                }]
            },

            // ======================== Optional Chaining Errors ========================

            // member access on non-optional without ?. operator
            {
                name: 'optional chaining - use on non-optional',
                input: `
                    def User = struct { pub name: slice; };

                    let user: User = new User { name: "Alice" };
                    let name = user?.name; // Should error - user is not optional
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot use optional chaining on non-optional type 'User'",
                    code: "TYPE_MISMATCH"
                }]
            },

            // accessing non-existent member
            {
                name: 'optional chaining - non-existent member',
                input: `
                    def User = struct { pub name: slice; };

                    let user: ?User = null;
                    let age = user?.age; // age doesn't exist
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Struct has no member 'age'",
                    code: "SYMBOL_NOT_FOUND"
                }]
            },

            // ======================== Optional Assignment Errors ========================

            // assign non-optional to optional (should work, but test inverse)
            {
                name: 'optional - assign wrong type',
                input: `
                    let x: ?i32 = "string";
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot assign type '[]u8' to variable of type '?i32'",
                    code: "TYPE_MISMATCH"
                }]
            },

            // assign optional to non-optional without unwrapping
            {
                name: 'optional - assign optional to non-optional',
                input: `
                    let maybe: ?i32 = 42;
                    let actual: i32 = maybe; // Need to unwrap
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot assign type '?i32' to variable of type 'i32'",
                    code: "TYPE_MISMATCH"
                }]
            },

            // ======================== Null Comparison Issues ========================

            // comparing null to non-optional
            {
                name: 'null comparison - compare null to non-optional',
                input: `
                    let x: i32 = 42;
                    if (x == null) { } // Should warn - x can never be null
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot compare non-optional type 'i32' with null",
                    code: "TYPE_MISMATCH"
                }]
            },

            // ======================== Optional in Function Signatures ========================

            // return non-optional from optional function
            {
                name: 'optional function - wrong return type',
                input: `
                    fn maybe_value() -> ?i32 {
                        return "string";
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Return type '[]u8' doesn't match function return type '?i32'",
                    code: "TYPE_MISMATCH"
                }]
            },

            // optional parameter mismatch
            {
                name: 'optional parameter - wrong argument type',
                input: `
                    fn process(x: ?i32) {}

                    fn main() {
                        process("string");
                    }
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Argument type '[]u8' is not assignable to parameter type '?i32'",
                    code: "TYPE_MISMATCH"
                }]
            },
        ],

        OptionalTypesCasesMustSucceed: [
            // ======================== Basic Optional Usage ========================

            // basic optional declaration and null
            {
                name: 'optional - basic declaration with null',
                input: `
                    let maybe_number: ?i32 = null;
                    let actual_number: ?i32 = 42;
                `,
                success: true,
                diagnostics: []
            },

            // optional with different types
            {
                name: 'optional - various types',
                input: `
                    let opt_int: ?i32 = null;
                    let opt_float: ?f32 = 3.14;
                    let opt_bool: ?bool = true;
                    let opt_char: ?char = 'a';
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Orelse Operator ========================

            // basic orelse with matching types
            {
                name: 'orelse - basic usage with same type',
                input: `
                    let maybe_number: ?i32 = null;
                    let safe_value = maybe_number ?? 0;
                `,
                success: true,
                diagnostics: []
            },

            // orelse with non-null optional
            {
                name: 'orelse - with non-null value',
                input: `
                    let maybe_number: ?i32 = 42;
                    let safe_value = maybe_number ?? 0;
                `,
                success: true,
                diagnostics: []
            },

            // orelse chaining
            {
                name: 'orelse - chaining multiple optionals',
                input: `
                    let opt1: ?i32 = null;
                    let opt2: ?i32 = null;
                    let opt3: ?i32 = 42;
                    let result = opt1 ?? opt2 ?? opt3 ?? 0;
                `,
                success: true,
                diagnostics: []
            },

            // orelse with expressions
            {
                name: 'orelse - with complex expressions',
                input: `
                    let maybe_x: ?i32 = null;
                    let result = (maybe_x ?? 10) + 5;
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Null Comparisons ========================

            // null equality check
            {
                name: 'null comparison - equality',
                input: `
                    let maybe_number: ?i32 = null;
                    if (maybe_number == null) {
                        // handle null case
                    }
                `,
                success: true,
                diagnostics: []
            },

            // null inequality check
            {
                name: 'null comparison - inequality',
                input: `
                    let maybe_number: ?i32 = 42;
                    if (maybe_number != null) {
                        // value exists (but not narrowed to i32 yet)
                        let value = maybe_number; // still ?i32
                    }
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Optional with Structs ========================

            // optional struct
            {
                name: 'optional - struct type',
                input: `
                    def User = struct {
                        name: slice;
                        email: ?slice;
                    };

                    let user: ?User = null;
                    let actual_user: ?User = new User {
                        name: "Alice",
                        email: "alice@example.com"
                    };
                `,
                success: true,
                diagnostics: []
            },

            // struct with optional fields
            {
                name: 'optional - optional struct fields',
                input: `
                    def User = struct {
                        name: slice;
                        email: ?slice;
                        age: ?i32;
                    };

                    let user = new User {
                        name: "Bob",
                        email: null,
                        age: 25
                    };
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Optional Chaining ========================

            // basic optional chaining
            {
                name: 'optional chaining - basic usage',
                input: `
                    def User = struct {
                        pub name: slice;
                        pub email: ?slice;
                    };

                    let user: ?User = null;
                    let email = user?.email; // Result: ?slice
                `,
                success: true,
                diagnostics: []
            },

            // nested optional chaining
            {
                name: 'optional chaining - nested structs',
                input: `
                    def Address = struct {
                        pub city: slice;
                        pub zip: ?slice;
                    };

                    def User = struct {
                        pub name: slice;
                        pub address: ?Address;
                    };

                    let user: ?User = null;
                    let zip = user?.address?.zip; // Result: ?slice
                `,
                success: true,
                diagnostics: []
            },

            // optional chaining with orelse
            {
                name: 'optional chaining - combined with orelse',
                input: `
                    def User = struct {
                        pub name: slice;
                        pub email: ?slice;
                    };

                    let user: ?User = null;
                    let email = user?.email ?? "no-email@example.com";
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Optional in Functions ========================

            // optional return type
            {
                name: 'optional function - return optional',
                input: `
                    fn find_user(id: i32) -> ?i32 {
                        if (id > 0) {
                            return id;
                        }
                        return null;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // optional parameter
            {
                name: 'optional function - optional parameter',
                input: `
                    fn greet(name: ?slice) -> slice {
                        let actual_name = name ?? "Guest";
                        return actual_name;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // function returning optional struct
            {
                name: 'optional function - return optional struct',
                input: `
                    def User = struct { name: slice; };

                    fn get_user(id: i32) -> ?User {
                        if (id == 1) {
                            return new User { name: "Alice" };
                        }
                        return null;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Optional with Arrays ========================

            // array of optionals
            {
                name: 'optional - array of optionals',
                input: `
                    let numbers: [3]?i32 = [1, null, 3];
                `,
                success: true,
                diagnostics: []
            },

            // optional array
            {
                name: 'optional - optional array',
                input: `
                    let maybe_array: ?[3]i32 = null;
                    let actual_array: ?[3]i32 = [1, 2, 3];
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Optional with Type Aliases ========================

            // optional with type alias
            {
                name: 'optional - with type alias',
                input: `
                    def UserId = i32;
                    let maybe_id: ?UserId = null;
                    let actual_id: ?UserId = 42;
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Optional Assignment Patterns ========================

            // assign value to optional
            {
                name: 'optional - assign non-optional to optional',
                input: `
                    let x: ?i32 = 42; // Implicitly wraps 42 in optional
                `,
                success: true,
                diagnostics: []
            },

            // assign null to optional
            {
                name: 'optional - assign null',
                input: `
                    let x: ?i32 = null;
                `,
                success: true,
                diagnostics: []
            },

            // reassignment
            {
                name: 'optional - reassignment',
                input: `
                    let mut x: ?i32 = 42;
                    x = null;
                    x = 100;
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Optional in Complex Expressions ========================

            // optional in arithmetic with orelse
            {
                name: 'optional - arithmetic with orelse',
                input: `
                    let a: ?i32 = 10;
                    let b: ?i32 = 20;
                    let sum = (a ?? 0) + (b ?? 0);
                `,
                success: true,
                diagnostics: []
            },

            // optional in conditionals
            {
                name: 'optional - in conditional expressions',
                input: `
                    let maybe_x: ?i32 = 42;
                    let result = if (maybe_x != null) { maybe_x ?? 0 } else { -1 };
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Optional with Tuples ========================

            // tuple with optional fields
            {
                name: 'optional - tuple with optionals',
                input: `
                    let t1: .{ ?i32, ?slice } = .{ 42, null };
                    let t2: .{ ?i32, ?slice } = .{ null, "hello" };
                `,
                success: true,
                diagnostics: []
            },

            // optional tuple
            {
                name: 'optional - optional tuple',
                input: `
                    let maybe_tuple: ?.{ i32, slice } = null;
                    let actual_tuple: ?.{ i32, slice } = .{ 42, "hello" };
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Edge Cases ========================

            // empty optional unwrap with orelse
            {
                name: 'optional - orelse with null on both sides',
                input: `
                    let a: ?i32 = null;
                    let b: ?i32 = null;
                    let result = a ?? b; // Result: ?i32 (still null)
                `,
                success: true,
                diagnostics: []
            },

            // optional with zero value
            {
                name: 'optional - distinguish null from zero',
                input: `
                    let zero: ?i32 = 0;    // Not null, value is 0
                    let nothing: ?i32 = null; // Null
                    let result1 = zero ?? 42;    // Should be 0
                    let result2 = nothing ?? 42; // Should be 42
                `,
                success: true,
                diagnostics: []
            },
        ]
    };

    const PointerTypesExtendedCases = {
        PointerTypesCasesMustFail: [
            // ======================== Immutable Pointer Violations ========================

            // assign through immutable pointer
            {
                name: 'pointer - cannot assign through immutable pointer',
                input: `
                    let value: i32 = 42;
                    let ptr: *i32 = &value;
                    ptr.* = 100; // Error: ptr is immutable
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot assign through immutable pointer. Declare as '*mut T' to allow mutation",
                    code: "MUTABILITY_MISMATCH"
                }]
            },

            // mutable pointer to immutable variable
            {
                name: 'pointer - cannot create mutable pointer to immutable variable',
                input: `
                    let value: i32 = 42;
                    let ptr: *mut i32 = &value; // Error: value is immutable
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot assign type '*i32' to variable of type '*mut i32'",
                    code: "TYPE_MISMATCH"
                }]
            },

            // ======================== Type Mismatch ========================

            // pointer type mismatch
            {
                name: 'pointer - type mismatch on assignment',
                input: `
                    let value: i32 = 42;
                    let ptr: *i64 = &value; // i32 vs i64
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot assign type '*i32' to variable of type '*i64'",
                    code: "TYPE_MISMATCH"
                }]
            },

            // dereference type mismatch
            {
                name: 'pointer - dereference type mismatch',
                input: `
                    let value: i32 = 42;
                    let ptr: *i32 = &value;
                    let result: i64 = ptr.*; // i32 vs i64
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot assign type 'i32' to variable of type 'i64'",
                    code: "TYPE_MISMATCH"
                }]
            },

            // pointer to wrong struct type
            {
                name: 'pointer - wrong struct type',
                input: `
                    def Point = struct { x: i32; y: i32; };
                    def Vector = struct { x: i32; y: i32; z: i32; };

                    let point = new Point { x: 1, y: 2 };
                    let ptr: *Vector = &point; // Point vs Vector
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot assign type '*Point' to variable of type '*Vector'",
                    code: "TYPE_MISMATCH"
                }]
            },

            // ======================== Invalid Reference Operations ========================

            // reference to literal
            {
                name: 'pointer - cannot reference literal',
                input: `
                    let ptr: *i32 = &42; // Cannot take address of literal
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot take reference of non-lvalue expression",
                    code: "TYPE_MISMATCH"
                }]
            },

            // reference to expression
            {
                name: 'pointer - cannot reference expression',
                input: `
                    let a = 10;
                    let b = 20;
                    let ptr: *i32 = &(a + b); // Cannot take address of expression
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot take reference of non-lvalue expression",
                    code: "TYPE_MISMATCH"
                }]
            },

            // ======================== Double Dereference Without Pointer ========================

            // dereference non-pointer
            {
                name: 'pointer - dereference non-pointer type',
                input: `
                    let value: i32 = 42;
                    let result = value.*; // value is not a pointer
                `,
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: "Cannot dereference non-pointer type 'i32'",
                    code: "TYPE_MISMATCH"
                }]
            },

            // ======================== Pointer to Pointer Errors ========================

            // assign single pointer to double pointer
            {
                name: 'pointer - cannot assign *T to **T',
                input: `
                    let value: i32 = 42;
                    let ptr: *i32 = &value;
                    let ptr_ptr: *(*i32) = ptr; // Need &ptr
                `,
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        msg: "Cannot assign '*i32' to variable of type '**i32'",
                        code: "TYPE_MISMATCH"
                    },

                    // TODO: need to filter
                    {
                        "code": "TYPE_MISMATCH",
                        "kind": "error",
                        "msg": "Cannot assign type '*i32' to variable of type '*paren'",
                        "targetSpan": {
                        "start": 129,
                        "end": 132
                        },
                        "sourceModuleName": "main",
                        "sourceModulePath": "./src/main.k",
                        "contextSpan": {
                        "start": 106,
                        "end": 133
                        }
                    }
                ]
            },
        ],

        PointerTypesCasesMustSucceed: [
            // ======================== Basic Pointer Usage ========================

            // immutable pointer
            {
                name: 'pointer - basic immutable pointer',
                input: `
                    let value: i32 = 42;
                    let ptr: *i32 = &value;
                    let dereferenced: i32 = ptr.*;
                `,
                success: true,
                diagnostics: []
            },

            // mutable pointer
            {
                name: 'pointer - basic mutable pointer',
                input: `
                    let mut x: i32 = 10;
                    let mut_ptr: *mut i32 = &x;
                    mut_ptr.* = 20;
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Pointer to Different Types ========================

            // pointer to signed integer
            {
                name: 'pointer - to signed integer',
                input: `
                    let value: i32 = -42;
                    let ptr: *i32 = &value;
                    let result = ptr.*;
                `,
                success: true,
                diagnostics: []
            },

            // pointer to unsigned integer
            {
                name: 'pointer - to unsigned integer',
                input: `
                    let value: u32 = 42;
                    let ptr: *u32 = &value;
                    let result = ptr.*;
                `,
                success: true,
                diagnostics: []
            },

            // pointer to float
            {
                name: 'pointer - to float',
                input: `
                    let value: f32 = 3.14;
                    let ptr: *f32 = &value;
                    let result = ptr.*;
                `,
                success: true,
                diagnostics: []
            },

            // pointer to bool
            {
                name: 'pointer - to bool',
                input: `
                    let value: bool = true;
                    let ptr: *bool = &value;
                    let result = ptr.*;
                `,
                success: true,
                diagnostics: []
            },

            // pointer to char
            {
                name: 'pointer - to char',
                input: `
                    let value: char = 'a';
                    let ptr: *char = &value;
                    let result = ptr.*;
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Pointer to Struct ========================

            // basic struct pointer
            {
                name: 'pointer - to struct',
                input: `
                    def Point = struct { pub x: i32; pub y: i32; };
                    let point = new Point { x: 5, y: 10 };
                    let ptr: *Point = &point;
                    let x_value = ptr.*.x;
                `,
                success: true,
                diagnostics: []
            },

            // mutable struct pointer
            {
                name: 'pointer - mutable struct pointer',
                input: `
                    def Point = struct { pub x: i32; pub y: i32; };
                    let mut point = new Point { x: 5, y: 10 };
                    let ptr: *mut Point = &point;
                    ptr.*.x = 20;
                `,
                success: true,
                diagnostics: []
            },

            // struct pointer member access
            {
                name: 'pointer - struct member access chain',
                input: `
                    def Point = struct { pub x: i32; pub y: i32; };
                    let point = new Point { x: 5, y: 10 };
                    let ptr: *Point = &point;
                    let sum = ptr.*.x + ptr.*.y;
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Pointer to Array ========================

            // basic array pointer
            {
                name: 'pointer - to array',
                input: `
                    let arr: [5]i32 = [1, 2, 3, 4, 5];
                    let ptr: *[5]i32 = &arr;
                    let first = ptr.*[0];
                `,
                success: true,
                diagnostics: []
            },

            // mutable array pointer
            {
                name: 'pointer - mutable array pointer',
                input: `
                    let mut arr: [3]i32 = [1, 2, 3];
                    let ptr: *mut [3]i32 = &arr;
                    ptr.*[0] = 10;
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Pointer to Tuple ========================

            // tuple pointer
            {
                name: 'pointer - to tuple',
                input: `
                    let tuple: .{i32, i32} = .{10, 20};
                    let ptr: *.{i32, i32} = &tuple;
                    let dereferenced = ptr.*;
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Pointer to Pointer ========================

            // double pointer
            {
                name: 'pointer - pointer to pointer',
                input: `
                    let value: i32 = 42;
                    let ptr: *i32 = &value;
                    let ptr_ptr: *(*i32) = &ptr;
                    let dereferenced = ptr_ptr.*.*;
                `,
                success: true,
                diagnostics: []
            },

            // mutable double pointer
            {
                name: 'pointer - mutable pointer to pointer',
                input: `
                    let mut value: i32 = 42;
                    let mut ptr: *mut i32 = &value;
                    let mut ptr_ptr: *(*mut i32) = &ptr;
                    ptr_ptr.*.* = 100;
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Optional Pointers ========================

            // optional pointer with null
            {
                name: 'pointer - optional pointer with null',
                input: `
                    let ptr: ?*i32 = null;
                `,
                success: true,
                diagnostics: []
            },

            // optional pointer with value
            {
                name: 'pointer - optional pointer with value',
                input: `
                    let value: i32 = 42;
                    let ptr: ?*i32 = &value;
                `,
                success: true,
                diagnostics: []
            },

            // optional pointer with orelse
            {
                name: 'pointer - optional pointer with orelse',
                input: `
                    let value: i32 = 42;
                    let ptr1: ?*i32 = null;
                    let ptr2: ?*i32 = &value;
                    let result = ptr1 ?? ptr2;
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Pointer Reassignment ========================

            // reassign pointer
            {
                name: 'pointer - reassign pointer',
                input: `
                    let value1: i32 = 10;
                    let value2: i32 = 20;
                    let mut ptr: *i32 = &value1;
                    ptr = &value2;
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Pointer in Functions ========================

            // pointer parameter
            {
                name: 'pointer - as function parameter',
                input: `
                    fn modify(ptr: *mut i32) {
                        ptr.* = 100;
                    }

                    fn main() {
                        let mut value: i32 = 42;
                        modify(&value);
                    }
                `,
                success: true,
                diagnostics: []
            },

            // pointer return type
            {
                name: 'pointer - as function return',
                input: `
                    fn get_pointer(value: *i32) -> *i32 {
                        return value;
                    }

                    fn main() {
                        let x: i32 = 42;
                        let ptr = get_pointer(&x);
                    }
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Pointer with Type Aliases ========================

            // pointer to type alias
            {
                name: 'pointer - to type alias',
                input: `
                    def MyInt = i32;
                    let value: MyInt = 42;
                    let ptr: *MyInt = &value;
                    let result = ptr.*;
                `,
                success: true,
                diagnostics: []
            },

            // ======================== Complex Pointer Scenarios ========================

            // pointer to optional
            {
                name: 'pointer - to optional type',
                input: `
                    let value: ?i32 = 42;
                    let ptr: *?i32 = &value;
                    let dereferenced = ptr.*;
                `,
                success: true,
                diagnostics: []
            },

            // array of pointers
            {
                name: 'pointer - array of pointers',
                input: `
                    let a: i32 = 1;
                    let b: i32 = 2;
                    let c: i32 = 3;
                    let ptrs: [3]*i32 = [&a, &b, &c];
                `,
                success: true,
                diagnostics: []
            },

            // struct with pointer fields
            {
                name: 'pointer - struct with pointer fields',
                input: `
                    def Node = struct {
                        value: i32;
                        next: ?*Node;
                    };

                    let node = new Node { value: 42, next: null };
                `,
                success: true,
                diagnostics: []
            },

            // pointer arithmetic context (indexing dereferenced array pointer)
            {
                name: 'pointer - array pointer indexing',
                input: `
                    let arr: [3]i32 = [10, 20, 30];
                    let ptr: *[3]i32 = &arr;
                    let first = ptr.*[0];
                    let second = ptr.*[1];
                    let third = ptr.*[2];
                `,
                success: true,
                diagnostics: []
            },

            // OK HERE
            // multiple dereferences
            {
                name: 'pointer - multiple dereferences',
                input: `
                    let value: i32 = 42;
                    let ptr1: *i32 = &value;
                    let ptr2: *(*i32) = &ptr1;
                    let result = ptr2.*.*;
                `,
                success: true,
                diagnostics: []
            },
            {
                name: 'pointer - multiple dereferences',
                input: `
                    let value: i32 = 42;
                    let ptr1: *i32 = &value;
                    let ptr2: *(*i32) = &ptr1;
                    let ptr3: *(*(*i32)) = &ptr2;
                    let result = ptr3.*.*.*;
                `,
                success: true,
                diagnostics: []
            },

            // pointer comparison
            {
                name: 'pointer - comparison',
                input: `
                    let value: i32 = 42;
                    let ptr1: *i32 = &value;
                    let ptr2: *i32 = &value;
                    let are_equal = ptr1 == ptr2;
                `,
                success: true,
                diagnostics: []
            },

            // pointer to function result
            {
                name: 'pointer - to function result',
                input: `
                    fn get_value() -> i32 {
                        return 42;
                    }

                    fn main() {
                        let value = get_value();
                        let ptr: *i32 = &value;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // nested struct pointers
            {
                name: 'pointer - nested struct with pointers',
                input: `
                    def Inner = struct { pub value: i32; };
                    def Outer = struct { pub inner: Inner; };

                    let outer = new Outer { inner: new Inner { value: 42 } };
                    let ptr: *Outer = &outer;
                    let inner_value = ptr.*.inner.value;
                `,
                success: true,
                diagnostics: []
            },

            // pointer with conditional
            {
                name: 'pointer - in conditional',
                input: `
                    let value: i32 = 42;
                    let ptr: ?*i32 = &value;

                    if (ptr != null) {
                        let dereferenced = ptr;
                    }
                `,
                success: true,
                diagnostics: []
            },

            // mutable pointer chain
            {
                name: 'pointer - mutable pointer chain',
                input: `
                    let mut value: i32 = 10;
                    let mut ptr1: *mut i32 = &value;
                    let mut ptr2: *(*mut i32) = &ptr1;

                    ptr2.*.* = 100;
                `,
                success: true,
                diagnostics: []
            },
        ]
    };

    const ComptimeExtendedCases = {
        ComptimeMustFail: [
            // Non-comptime function in array size
            {
                name: 'comptime - cannot call non-comptime function in array size',
                input: 'fn get_size() -> i32 { return 10; } let arr: [get_size()]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: 'Cannot call non-comptime function \'get_size\' in compile-time context. Mark it with \'comptime\' keyword.',
                    code: 'TYPE_MISMATCH'
                }]
            },

            // Comptime function with arguments
            {
                name: 'comptime - function with arguments not yet supported',
                input: 'comptime fn with_args(x: i32 = 10) -> i32 { return x * 2; } let arr: [with_args(5)]i32;',
                success: true,
                diagnostics: []
            },

            // Non-numeric comptime result
            {
                name: 'comptime - non-numeric return type in array size',
                input: 'comptime fn get_bool() -> bool { return true; } let arr: [get_bool()]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: 'Array size must be a compile-time constant expression. Use literals, comptime functions, or compile-time arithmetic.',
                    code: 'TYPE_MISMATCH'
                }]
            },

            // Negative array size from comptime
            {
                name: 'comptime - negative array size',
                input: 'comptime fn neg_size() -> i32 { return -5; } let arr: [neg_size()]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: 'Array size must be positive, got -5',
                    code: 'TYPE_MISMATCH'
                }]
            },

            // Zero array size from comptime
            {
                name: 'comptime - zero array size',
                input: 'comptime fn zero_size() -> i32 { return 0; } let arr: [zero_size()]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: 'Array size must be positive, got 0',
                    code: 'TYPE_MISMATCH'
                }]
            },

            // Overflow in comptime arithmetic
            {
                name: 'comptime - integer overflow in calculation',
                input: 'comptime fn overflow() -> i32 { return 9223372036854775807 + 1; } let arr: [overflow()]i32;',
                success: false,
                diagnostics: [
                    {
                        kind: 'error',
                        msg: "Integer addition overflow: 9223372036854775808 + 1 = 9223372036854775809",
                        code: 'ARITHMETIC_OVERFLOW'
                    },
                    {
                        kind: 'error',
                        msg: "Could not evaluate comptime function 'overflow' at compile time. Ensure it has a simple 'return <constant>' statement.",
                        code: 'ANALYSIS_ERROR'
                    },
                ]
            },

            // Array size exceeds max
            {
                name: 'comptime - array size exceeds maximum',
                input: 'comptime fn huge_size() -> i32 { return 2147483648; } let arr: [huge_size()]i32;',
                success: false,
                diagnostics: [{
                    kind: 'error',
                    msg: 'Array size 2147483648 exceeds maximum allowed size 2147483647',
                    code: 'TYPE_MISMATCH'
                }]
            },

            // Comptime function with no return
            {
                name: 'comptime - function with no return statement',
                input: 'comptime fn no_return() -> i32 { let x = 5; } let arr: [no_return()]i32;',
                success: false,
                diagnostics: [
                    // TODO: need to filter
                    {
                        kind: 'error',
                        msg: "Function 'no_return' with non-void return type must have at least one return statement",
                        code: 'MISSING_RETURN_STATEMENT'
                    },
                    {
                        kind: 'error',
                        msg: "Could not evaluate comptime function 'no_return' at compile time. Ensure it has a simple 'return <constant>' statement.",
                        code: 'ANALYSIS_ERROR'
                    },
                ]
            },
        ],

        ComptimeMustSucceed: [
            // ======================== BASIC COMPTIME FUNCTIONS ========================

            // Simple comptime function
            {
                name: 'comptime - simple no-arg function',
                input: 'comptime fn get_size() -> i32 { return 10; } let arr: [get_size()]i32;',
                success: true,
                diagnostics: []
            },

            // Comptime function with constant
            {
                name: 'comptime - function returning constant',
                input: 'comptime fn five() -> i32 { return 5; } let x: i32 = five();',
                success: true,
                diagnostics: []
            },

            // ======================== COMPTIME ARITHMETIC ========================

            // Addition in comptime
            {
                name: 'comptime - addition in array size',
                input: 'comptime fn base() -> i32 { return 5; } let arr: [base() + base()]i32;',
                success: true,
                diagnostics: []
            },

            // Subtraction in comptime
            {
                name: 'comptime - subtraction in array size',
                input: 'comptime fn size() -> i32 { return 10; } let arr: [size() - 2]i32;',
                success: true,
                diagnostics: []
            },

            // Multiplication in comptime
            {
                name: 'comptime - multiplication in array size',
                input: 'comptime fn base() -> i32 { return 3; } let arr: [base() * 4]i32;',
                success: true,
                diagnostics: []
            },

            // Division in comptime
            {
                name: 'comptime - division in array size',
                input: 'comptime fn size() -> i32 { return 20; } let arr: [size() / 2]i32;',
                success: true,
                diagnostics: []
            },

            // Complex arithmetic
            {
                name: 'comptime - complex arithmetic expression',
                input: 'comptime fn calc() -> i32 { return 2; } let arr: [(calc() + 3) * 2 - 1]i32;',
                success: true,
                diagnostics: []
            },

            // ======================== COMPTIME LITERALS ========================

            // Integer literal in array size
            {
                name: 'comptime - integer literal as array size',
                input: 'let arr: [42]i32;',
                success: true,
                diagnostics: []
            },

            // Large but valid array size
            {
                name: 'comptime - large array size',
                input: 'let arr: [1000000]i32;',
                success: true,
                diagnostics: []
            },

            // ======================== COMPTIME NESTED CALLS ========================

            // Nested comptime function calls
            {
                name: 'comptime - nested function calls',
                input: `
                    comptime fn inner() -> i32 { return 3; }
                    comptime fn outer() -> i32 { return inner() * 2; }
                    let arr: [outer()]i32;
                `,
                success: true,
                diagnostics: []
            },

            // Multiple comptime functions
            {
                name: 'comptime - multiple comptime functions',
                input: `
                    comptime fn size_x() -> i32 { return 5; }
                    comptime fn size_y() -> i32 { return 10; }
                    let arr_x: [size_x()]i32;
                    let arr_y: [size_y()]i32;
                `,
                success: true,
                diagnostics: []
            },

            // ======================== COMPTIME WITH OPERATORS ========================

            // Power operation
            {
                name: 'comptime - power operation',
                input: 'comptime fn base() -> i32 { return 2; } let arr: [base() ** 3]i32;',
                success: true,
                diagnostics: []
            },

            // Bitwise operations
            {
                name: 'comptime - bitwise AND',
                input: 'comptime fn val() -> i32 { return 15; } let arr: [val() & 7]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'comptime - bitwise OR',
                input: 'comptime fn val() -> i32 { return 8; } let arr: [val() | 4]i32;',
                success: true,
                diagnostics: []
            },

            {
                name: 'comptime - left shift',
                input: 'comptime fn val() -> i32 { return 1; } let arr: [val() << 3]i32;',
                success: true,
                diagnostics: []
            },

            // ======================== COMPTIME UNARY OPERATIONS ========================

            // Unary negation
            {
                name: 'comptime - unary negation (positive to negative)',
                input: 'comptime fn pos() -> i32 { return 5; } let x: i32 = -pos();',
                success: true,
                diagnostics: []
            },

            // Unary plus
            {
                name: 'comptime - unary plus',
                input: 'comptime fn val() -> i32 { return 5; } let x: i32 = +val();',
                success: true,
                diagnostics: []
            },

            // Bitwise NOT
            {
                name: 'comptime - bitwise NOT',
                input: 'comptime fn val() -> i32 { return 0; } let x: i32 = ~val();',
                success: true,
                diagnostics: []
            },

            // ======================== COMPTIME WITH LITERALS ========================

            // Mix literals and comptime calls
            {
                name: 'comptime - mix literals and comptime',
                input: 'comptime fn five() -> i32 { return 5; } let arr: [five() + 10 - 2]i32;',
                success: true,
                diagnostics: []
            },

            // Literal arithmetic only
            {
                name: 'comptime - literal arithmetic',
                input: 'let arr: [5 + 3 * 2]i32;',
                success: true,
                diagnostics: []
            },

            // ======================== COMPTIME EDGE CASES ========================

            // Minimum positive size
            {
                name: 'comptime - minimum valid array size',
                input: 'comptime fn one() -> i32 { return 1; } let arr: [one()]i32;',
                success: true,
                diagnostics: []
            },

            // Array of arrays with comptime
            {
                name: 'comptime - nested array sizes',
                input: `
                    comptime fn size() -> i32 { return 5; }
                    let matrix: [size()][size()]i32;
                `,
                success: true,
                diagnostics: []
            },

            // Comptime in struct array field
            {
                name: 'comptime - array in struct field',
                input: `
                    comptime fn get_size() -> i32 { return 10; }
                    def Matrix = struct {
                        pub data: [get_size()]i32;
                    };
                `,
                success: true,
                diagnostics: []
            },

            // ======================== COMPTIME WITH MODULO ========================

            // Modulo operation
            {
                name: 'comptime - modulo operation',
                input: 'comptime fn val() -> i32 { return 17; } let arr: [val() % 5]i32;',
                success: true,
                diagnostics: []
            },

            // ======================== COMPTIME FUNCTION BODY VARIATIONS ========================

            // Comptime with local variable
            {
                name: 'comptime - function with local variable',
                input: `
                    comptime fn calc() -> i32 {
                        let x = 5;
                        return x * 2;
                    }
                    let arr: [calc()]i32;
                `,
                success: true,
                diagnostics: []
            },

            // Comptime with expression in return
            {
                name: 'comptime - complex return expression',
                input: `
                    comptime fn calc() -> i32 {
                        return (10 + 5) * 2 - 3;
                    }
                    let arr: [calc()]i32;
                `,
                success: true,
                diagnostics: []
            },

            // ======================== COMPTIME MULTIPLE USES ========================

            // Reuse comptime function
            {
                name: 'comptime - reuse same comptime function',
                input: `
                    comptime fn size() -> i32 { return 5; }
                    let arr1: [size()]i32;
                    let arr2: [size()]i32;
                    let arr3: [size()]i32;
                `,
                success: true,
                diagnostics: []
            },

            // Comptime in multiple expressions
            {
                name: 'comptime - use in multiple contexts',
                input: `
                    comptime fn base() -> i32 { return 10; }
                    let arr: [base()]i32;
                    let tuple: .{i32, i32} = .{base(), base()};
                `,
                success: true,
                diagnostics: []
            },

            // ======================== COMPTIME RETURN TYPES ========================

            // Unsigned return type
            {
                name: 'comptime - unsigned return type',
                input: 'comptime fn get_size() -> u32 { return 15; } let arr: [get_size()]i32;',
                success: true,
                diagnostics: []
            },

            // Signed return type
            {
                name: 'comptime - signed return type',
                input: 'comptime fn get_size() -> i64 { return 20; } let arr: [get_size()]i32;',
                success: true,
                diagnostics: []
            },

            // ======================== COMPTIME COMBINATIONS ========================

            // Comptime + unary + binary
            {
                name: 'comptime - combined unary and binary',
                input: `
                    comptime fn val() -> i32 { return 5; }
                    let arr: [-val() + 10]i32;
                `,
                success: true,
                diagnostics: []
            },

            // Multiple levels of operations
            {
                name: 'comptime - multiple operation levels',
                input: `
                    comptime fn a() -> i32 { return 2; }
                    comptime fn b() -> i32 { return 3; }
                    let arr: [a() + b() * a() - b()]i32;
                `,
                success: true,
                diagnostics: []
            },
        ]
    };


    const temp = {
        temp: [
            {
                name: 'comptime - function with arguments not yet supported',
                input: 'comptime fn with_args(x: i32 = 10) -> i32 { return x * 2; } let arr: [with_args(5)]i32;',
                success: true,
                diagnostics: []
            },
        ]
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ T_ST ════════════════════════════════════════╗

    testAnalyzer({
        ...UTF8_ASCII_ExtendedCases,
        ...ErrorModesExtendedCases,
        ...OptionalTypesExtendedCases,
        ...PointerTypesExtendedCases,
        ...ComptimeExtendedCases,
        // ...temp

    }, AnalysisPhase.TypeValidation);

// ╚══════════════════════════════════════════════════════════════════════════════════════╝