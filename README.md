<!----------------------------------- BEG ----------------------------------->
<br>
<div align="center">
    <p>
        <img src="./assets/img/logo.png" alt="ast-analyzer" style="" height="50" />
    </p>
</div>


<div align="center">
    <p align="center" style="font-style:italic; color:gray;">
        A static analysis tool that traverses the AST<br>
        to perform semantic checks, validation, scope resolution, and error detection.
        <br>
    </p>
    <img src="https://img.shields.io/badge/Version-0.0.9-black"/>
    <a href="https://github.com/je-es"><img src="https://img.shields.io/badge/Part_of-@je--es-black"/></a>
    <a href="https://github.com/kemet-lang"><img src="https://img.shields.io/badge/Built_for-@kemet--lang-black"/></a>
</div>


<div align="center">
    <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/>
    <br>
</div>

<!--------------------------------------------------------------------------->



<!----------------------------------- --- ----------------------------------->

- ### Install

    ```bash
    npm install @je-es/ast-analyzer
    ```

    ```ts
    import { Analyzer } from "@je-es/ast-analyzer";
    ```

    <div align="center"> <br> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

- ### Usage

    ```rust
    // suppose we want to analyze the represented AST for this statement:
    pub let mut x: i32 = 42
    ```

    ```ts
    // [1] Create syntax
    const syntax = Syntax.create({ // :: using @je-es/syntax(parser/lexer)
            name     : 'Kemet',
            version  : '0.0.1',
            lexer    : lexerRules,
            parser   : parserRules,
            settings : parserSettings
        } as syntax.SyntaxConfig
    );

    // [2] Parsing the input
    const parser_result = syntax.parse('pub let mut x: i32 = 42');

    // [3] Create module using the parser result
    const main_module   = AST.Module.create( // :: using @je-es/ast
        // Name
        'main',

        // Statements
        parser_result.ast.length > 0
            // in my case, first item refers to an array of stmts.
            ? parser_result.ast[0].getCustomData()! as AST.StmtNode[]
            // otherwise, empty module.
            : [],

        // Metadata
        { path: './src/main.k' }
    );

    // [4] Create program with the created module
    const program = AST.Program.create([main_module], { entryModule: 'main', path: './' });

    // [5] Create analyzer for the created program
    const analyzer = Analyzer.create({ debug: 'off' });
    const analyzer_result = analyzer.analyze(program);
    ```


    <div align="center"> <br> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>


- ### Related

    - #### [kemet-lang (MVP)](https://github.com/kemet-lang/.github/blob/main/profile/roadmap/MVP.md)

        > #### 1. [@je-es/lexer](https://github.com/je-es/lexer)

        > #### 2. [@je-es/parser](https://github.com/je-es/parser)

        > #### 3. [@je-es/ast](https://github.com/je-es/ast)

        > #### 4. [@je-es/syntax](https://github.com/je-es/syntax)

        > #### 5. [`@je-es/ast-analyzer`](https://github.com/je-es/ast-analyzer)

        > #### 6. [@je-es/project](https://github.com/je-es/project)

        > #### 7. [@je-es/lsp](https://github.com/je-es/lsp)

        > #### 8. [@je-es/codegen](https://github.com/je-es/codegen)

        > #### 9. [@je-es/compiler](https://github.com/je-es/compiler)



<!--------------------------------------------------------------------------->



<!----------------------------------- END ----------------------------------->

<br>
<div align="center">
    <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/>
</div>
<br>

<div align="center">
    <a href="https://github.com/maysara-elshewehy">
        <img src="https://img.shields.io/badge/by-Maysara-blue"/>
    </a>
</div>

<!-------------------------------------------------------------------------->