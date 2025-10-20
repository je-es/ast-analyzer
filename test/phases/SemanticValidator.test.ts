// SemanticValidator.test.ts
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { testAnalyzer, AnalysisPhase } from '../utils';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ INIT ════════════════════════════════════════╗

    const cases = {

        UnusedVariable: [
            // unused variable in function
            {
                input       : 'pub fn main() { let a = 1; }',
                success     : true,
                diagnostics : [
                    {
                        cspan       : { start: 16, end: 25 },
                        tspan       : { start: 20, end: 21 },
                        kind    : 'warning',
                        msg     : "Variable 'a' is declared but never used",
                        code    : "UNUSED_VARIABLE"
                    },
                ],
            },
            // used variable
            {
                input       : 'pub fn main() { let a = 1; let b = a; }',
                success     : true,
                diagnostics : [
                    {
                        cspan       : { start: 27, end: 36 },
                        tspan       : { start: 31, end: 32 },
                        kind    : 'warning',
                        msg     : "Variable 'b' is declared but never used",
                        code    : "UNUSED_VARIABLE"
                    }
                ],
            },
        ],

        UnusedParameter: [
            // unused parameter
            {
                input       : 'pub fn main(a: i32) {}',
                success     : true,
                diagnostics : [
                    {
                        cspan       : { start: 12, end: 19 },
                        tspan       : { start: 12, end: 13 },
                        kind    : 'warning',
                        msg     : "Parameter 'a' is declared but never used",
                        code    : "UNUSED_PARAMETER"
                    },
                ],
            },
            // used parameter
            {
                input       : 'pub fn main(a: i32) { let b = a; }',
                success     : true,
                diagnostics : [
                    {
                        cspan       : { start: 22, end: 31 },
                        tspan       : { start: 26, end: 27 },
                        kind    : 'warning',
                        msg     : "Variable 'b' is declared but never used",
                        code    : "UNUSED_VARIABLE"
                    },
                ],
            },
        ],

    };

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TEST ════════════════════════════════════════╗

    testAnalyzer( {
        ...cases,
    }, AnalysisPhase.SemanticValidation );

// ╚══════════════════════════════════════════════════════════════════════════════════════╝