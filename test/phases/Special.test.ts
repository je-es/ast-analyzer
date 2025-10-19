// Special.test.ts - Complete Test Suite
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { testAnalyzer, AnalysisPhase } from '../utils';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ INIT ════════════════════════════════════════╗

    const UTF8_ASCII_Cases = {
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
                    msg: "Cannot assign type 'u21' to variable of type 'char'",
                    code: "TYPE_MISMATCH"
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
                    msg: "Cannot assign type 'u21' to parameter of type 'char'",
                    code: "TYPE_MISMATCH"
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
                    msg: "Field 'c' initializer type 'u21' doesn't match field type 'char'",
                    code: "TYPE_MISMATCH"
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
                    msg: "Cannot assign type 'cpoint' to variable of type 'u8'",
                    code: "TYPE_MISMATCH"
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

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ T_ST ════════════════════════════════════════╗

    testAnalyzer({
        ...UTF8_ASCII_Cases,

    }, AnalysisPhase.TypeValidation);

// ╚══════════════════════════════════════════════════════════════════════════════════════╝