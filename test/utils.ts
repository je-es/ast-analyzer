// utils.ts
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as ParseLib                from '@je-es/parser';
    import { ParseError }               from '@je-es/parser';
    import * as AST                     from '@je-es/ast';
    import * as rules                   from '@kemet-lang/rules';
    import { Analyzer, AnalysisPhase, Diagnostic, AnalysisResult, DiagCode, DiagKind }  from '../lib/ast-analyzer';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export type AnalyzerTestCase = Record<string, {
        input               : string,
        success             : boolean,
        diagnostics         ?: unknown[],
        debug               ?: boolean,
        symbolsCollected    ?: number
    }[]>;

    export { AnalysisPhase };

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ INIT ════════════════════════════════════════╗

    export function testAnalyzer(cases: AnalyzerTestCase, stopAtPhase: AnalysisPhase | undefined) {
        // [1] Create syntax
        const syntax = rules.KemetSyntax.from('Root', 'off');

        // [2.A] Create print module
        const printModuleInput = `
        pub let mut mut_bool_var : bool = true;
        pub let mut mut_i32_var : i32 = 1 as i32;

        pub let VERSION: i32 = 1;

        pub fn print(x: []u8) { }
        pub fn println(x: []u8) {}

        pub def utils = struct {
            static fn print(x: []u8) -> void { }
        };

        pub def Point = struct { x: i32; y: i32 };

        let private_var : bool = true;

        pub def Color = enum { Red, Green, Blue };

        pub def Printer = struct {
            static fn print(x: []u8) {}
        };
        `;
        const printModuleParserResult : ParseLib.ParseResult = syntax.parse(printModuleInput);
        if(printModuleParserResult.errors.length > 0) console.warn(JSON.stringify(printModuleParserResult, null, 2));
        expect(printModuleParserResult.errors.length).toEqual(0);
        const printModule = AST.Module.create('print',
            printModuleParserResult.ast.length > 0 ? printModuleParserResult.ast[0].getCustomData()! as AST.StmtNode[] : [],
            { path: './src/utils/print.k' }
        );

        // [2.B] Create program with print module
        const program = AST.Program.create([printModule], { entryModule: 'main', path: './' });

        // [3] Create analyzer
        const analyzer = Analyzer.create({ debug: 'off', stopAtPhase });

        let result : AnalysisResult = { success: false, diagnostics: [] };
        function check (MustBesuccess: boolean, MustBeDiag: Diagnostic[]) {
            // clean up all errors related to print module
            // result.diagnostics = result.diagnostics.filter(d => d.sourceModuleName !== 'print');

            // Success and error count must match
            expect(result.success).toEqual(MustBesuccess);

            // Diagnostic count must match
            expect(result.diagnostics.length).toEqual((MustBeDiag as unknown[]).length);

            // Diagnostic messages must match
            for (let i = 0; i < (MustBeDiag as unknown[]).length; i++) {
                const obj = (MustBeDiag as unknown[])[i] as any;
                if(obj.msg)
                expect(result.diagnostics[i].msg).toEqual(obj.msg);
                if(obj.code)
                expect(result.diagnostics[i].code).toEqual(obj.code);
                if(obj.kind)
                expect(result.diagnostics[i].kind).toEqual(obj.kind);
                if(obj.cspan)
                expect(result.diagnostics[i].contextSpan).toEqual(obj.cspan);
                if(obj.tspan)
                expect(result.diagnostics[i].targetSpan).toEqual(obj.tspan);

                if(obj.module)
                expect(result.diagnostics[i].sourceModuleName).toEqual(obj.module);

                if(obj.path)
                expect(result.diagnostics[i].sourceModulePath).toEqual(obj.path);
            }
        }

        // [4] Run tests
        for (const [group, tests] of Object.entries(cases)) {

            describe(group, () => {
                for (const { input, success, diagnostics } of tests) {
                    it(input, () => {
                        // Parsing
                        const parserResult : ParseLib.ParseResult = syntax.parse(input);

                        // Parser Errors
                        if(parserResult.errors.length > 0) {
                            result = {
                                success: false,
                                diagnostics: parserErrorsToDiags(parserResult.errors),
                            };
                        }

                        // Analyzing
                        else {
                            // Create `main` module
                            {
                                const mainModuleParserResult : ParseLib.ParseResult = syntax.parse(input);
                                if(mainModuleParserResult.errors.length > 0) console.warn(JSON.stringify(mainModuleParserResult, null, 2));
                                expect(mainModuleParserResult.errors.length).toEqual(0);
                                const mainModule = AST.Module.create('main',
                                    parserResult.ast.length > 0 ? parserResult.ast[0].getCustomData()! as AST.StmtNode[] : [],
                                    { path: './src/main.k' }
                                );
                                program.modules.set('main', mainModule);
                            }

                            // Analyze
                            analyzer.reset();
                            result = analyzer.analyze(program);
                        }

                        // Testing
                        {
                            // a trick for debugging (delete it later)
                            try     { check(success, diagnostics as Diagnostic[]); }
                            catch   {
                                console.warn(JSON.stringify(result.diagnostics, null, 2));

                                // // print scope with its symbols
                                // const scopes = analyzer.scopeManager.getAllScopes();
                                // for(const scope of scopes) {
                                //     console.log(`${scope.name} : ${JSON.stringify(scope.symbols, null, 2)}`);
                                // }
                            }

                            check(success, diagnostics as Diagnostic[]);

                            // If no success and no diagnostics, print result for debugging
                            if(!success && (diagnostics as unknown[]).length === 0){ console.warn(JSON.stringify(result, null, 2)); }
                        }
                    });
                }
            });
        }
    }

    export function specialTest_NoEnterModule() {
        describe("EntryModule", () => {
            it("should detect no entry module", () => {
                const program   = AST.Program.create( [], { entryModule: 'main', path: './' } );
                const analyzer  = Analyzer.create({ debug: 'off' });
                const result    = analyzer.analyze(program);

                // TODO: improve this error code and msg (in SemanticValidator).
                expect(result.success).toEqual(false);
                expect(result.diagnostics[0].msg).toEqual("Invalid program structure");
                expect(result.diagnostics[0].code).toEqual("ANALYSIS_ERROR");
                expect(result.diagnostics[0].kind).toEqual("error");
            });
        });
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝


// ╔════════════════════════════════════════ HELP ════════════════════════════════════════╗

    function parserErrorsToDiags(parserErrors: ParseError[]) : Diagnostic[] {
        const diags : Diagnostic[] = [];

        for(const e of parserErrors) {
            diags.push({
                kind: DiagKind.ERROR,
                code: DiagCode.PARSER_ERROR,
                msg: e.msg,
            })
        }

        return diags;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
