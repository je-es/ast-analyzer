// Formatter.ts — AST reorganization and transformation phase.
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as AST from '@je-es/ast';
    import { AnalysisPhase } from '../components/ContextTracker';
    import { PhaseBase } from '../interfaces/PhaseBase';
    import { AnalysisConfig } from '../ast-analyzer';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    interface FormatterConfig {
        addMissingDocs: boolean;
        organizeImports: boolean;
        createSections: boolean;
        sortByVisibility: boolean;
    }

    interface CategorizedStatements {
        pack: AST.StmtNode[];    // use statements
        type: AST.StmtNode[];    // def statements
        init: AST.StmtNode[];    // module-level let statements
        main: AST.StmtNode[];    // public functions
        help: AST.StmtNode[];    // private functions
        other: AST.StmtNode[];   // everything else
    }

    interface FormatterStats {
        modulesFormatted: number;
        sectionsCreated: number;
        statementsReorganized: number;
        docsAdded: number;
        startTime: number;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class Formatter extends PhaseBase {

        // ┌──────────────────────────────── INIT ────────────────────────────────┐

            private stats: FormatterStats = this.initStats();
            private formatterConfig: FormatterConfig;

            constructor(config: AnalysisConfig, formatterConfig?: Partial<FormatterConfig>) {
                super(AnalysisPhase.Formatting, config);

                this.formatterConfig = {
                    addMissingDocs: formatterConfig?.addMissingDocs ?? true,
                    organizeImports: formatterConfig?.organizeImports ?? true,
                    createSections: formatterConfig?.createSections ?? true,
                    sortByVisibility: formatterConfig?.sortByVisibility ?? true
                };
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ────────────────────────────────┐

            handle(): boolean {
                try {
                    this.log('verbose','Starting formatter phase...');
                    this.stats.startTime = Date.now();

                    this.init()

                    // Transform each module in the program
                    for (const [moduleName, module] of this.config.program!.modules) {
                        this.log('verbose',`Formatting module '${moduleName}'`);
                        this.formatModule(moduleName, module);
                        this.stats.modulesFormatted++;
                    }

                    this.logStatistics();
                    return true;

                } catch (error) {
                    this.log('errors', `Fatal error during formatting: ${error}`);
                    return false;
                }
            }

            reset(): void {
                this.stats = this.initStats();
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── FORMAT ──────────────────────────────┐

            private formatModule(moduleName: string, module: AST.Module): void {
                this.log('verbose',`Formatting module '${moduleName}'`);

                // Add missing documentation
                if (this.formatterConfig.addMissingDocs) {
                    this.ensureModuleDocs(module);
                }

                // Categorize statements
                const categorized = this.categorizeStatements(module.stmts);

                // Sort if configured
                if (this.formatterConfig.organizeImports) {
                    this.sortImports(categorized.pack);
                }

                if (this.formatterConfig.sortByVisibility) {
                    this.sortByVisibility(categorized.main);
                    this.sortByVisibility(categorized.help);
                }

                // Rebuild module statements with sections
                if (this.formatterConfig.createSections) {
                    module.stmts = this.createSectionedStatements(categorized, moduleName);
                } else {
                    // Just reorganize without sections
                    module.stmts = [
                        ...categorized.pack,
                        ...categorized.type,
                        ...categorized.init,
                        ...categorized.main,
                        ...categorized.help,
                        ...categorized.other
                    ];
                }

                this.stats.statementsReorganized += module.stmts.length;
            }

            private categorizeStatements(statements: AST.StmtNode[]): CategorizedStatements {
                const categorized: CategorizedStatements = {
                    pack: [],
                    type: [],
                    init: [],
                    main: [],
                    help: [],
                    other: []
                };

                for (const stmt of statements) {
                    // Skip if already a section (don't re-section)
                    if (stmt.kind === 'section') {
                        categorized.other.push(stmt);
                        continue;
                    }

                    switch (stmt.kind) {
                        case 'use':
                            categorized.pack.push(stmt);
                            break;

                        case 'def':
                            categorized.type.push(stmt);
                            break;

                        case 'let':
                            categorized.init.push(stmt);
                            break;

                        case 'func':
                            const funcNode = stmt.getFunc()!;
                            if (funcNode.visibility.kind === 'Public') {
                                categorized.main.push(stmt);
                            } else {
                                categorized.help.push(stmt);
                            }
                            break;

                        default:
                            categorized.other.push(stmt);
                            break;
                    }
                }

                return categorized;
            }

            private createSectionedStatements(
                categorized: CategorizedStatements,
                moduleName: string
            ): AST.StmtNode[] {
                const sections: AST.StmtNode[] = [];

                // PACK section
                if (categorized.pack.length > 0) {
                    sections.push(this.createSection('PACK', categorized.pack));
                    this.stats.sectionsCreated++;
                }

                // TYPE section
                if (categorized.type.length > 0) {
                    sections.push(this.createSection('TYPE', categorized.type));
                    this.stats.sectionsCreated++;
                }

                // INIT section
                if (categorized.init.length > 0) {
                    sections.push(this.createSection('INIT', categorized.init));
                    this.stats.sectionsCreated++;
                }

                // MAIN section
                if (categorized.main.length > 0) {
                    sections.push(this.createSection('MAIN', categorized.main));
                    this.stats.sectionsCreated++;
                }

                // HELP section
                if (categorized.help.length > 0) {
                    sections.push(this.createSection('HELP', categorized.help));
                    this.stats.sectionsCreated++;
                }

                // Other statements (not in sections)
                sections.push(...categorized.other);

                return sections;
            }

            private createSection(name: string, stmts: AST.StmtNode[]): AST.StmtNode {
                // Create a section node with the given name and statements
                const section = AST.StmtNode.asSection(
                    this.calculateSpan(stmts),
                    { name, span: { start: 0, end: 0 } },
                    0, // TODO
                    stmts
                );

                return section;
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── HELPERS ─────────────────────────────┐

            private ensureModuleDocs(module: AST.Module): void {
                if (!module.docs) {
                    module.docs = {
                        name: '???',
                        desc: 'No description provided',
                        repo: '???',
                        docs: '???',
                        footer: 'Made with ❤️ by Maysara.'
                    };
                    this.stats.docsAdded++;
                    return;
                }

                let modified = false;

                if (!module.docs.name || module.docs.name === '') {
                    module.docs.name = '???';
                    modified = true;
                }

                if (!module.docs.desc || module.docs.desc === '') {
                    module.docs.desc = 'No description provided';
                    modified = true;
                }

                if (!module.docs.repo || module.docs.repo === '') {
                    module.docs.repo = '???';
                    modified = true;
                }

                if (!module.docs.docs || module.docs.docs === '') {
                    module.docs.docs = '???';
                    modified = true;
                }

                if (!module.docs.footer || module.docs.footer === '') {
                    module.docs.footer = 'Made with ❤️ by Maysara.';
                    modified = true;
                }

                if (modified) {
                    this.stats.docsAdded++;
                }
            }

            private sortImports(imports: AST.StmtNode[]): void {
                imports.sort((a, b) => {
                    const useA = a.getUse()!;
                    const useB = b.getUse()!;

                    // Sort by path first
                    const pathA = useA.path || '';
                    const pathB = useB.path || '';

                    if (pathA !== pathB) {
                        return pathA.localeCompare(pathB);
                    }

                    // Then by target name
                    const nameA = useA.alias?.name || useA.targetArr?.[0]?.name || '';
                    const nameB = useB.alias?.name || useB.targetArr?.[0]?.name || '';

                    return nameA.localeCompare(nameB);
                });
            }

            private sortByVisibility(functions: AST.StmtNode[]): void {
                // Sort functions: public first, then by name
                functions.sort((a, b) => {
                    const funcA = a.getFunc()!;
                    const funcB = b.getFunc()!;

                    // Public before private
                    const visA = funcA.visibility.kind === 'Public' ? 0 : 1;
                    const visB = funcB.visibility.kind === 'Public' ? 0 : 1;

                    if (visA !== visB) {
                        return visA - visB;
                    }

                    // Then alphabetically
                    return funcA.ident.name.localeCompare(funcB.ident.name);
                });
            }

            private calculateSpan(stmts: AST.StmtNode[]): AST.Span {
                if (stmts.length === 0) {
                    return { start: 0, end: 0 };
                }

                const first = stmts[0].span;
                const last = stmts[stmts.length - 1].span;

                return {
                    start: first.start,
                    end: last.end
                };
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── INIT ────────────────────────────────┐

            private init() {
                this.config.services.contextTracker.reset();
                this.config.services.contextTracker.setPhase(AnalysisPhase.Formatting);
                this.log('verbose','Formatter initialized');
            }

            private initStats(): FormatterStats {
                return {
                    modulesFormatted: 0,
                    sectionsCreated: 0,
                    statementsReorganized: 0,
                    docsAdded: 0,
                    startTime: Date.now()
                };
            }

        // └──────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── STATS ───────────────────────────────┐

            logStatistics(): void {
                const duration = Date.now() - this.stats.startTime;
                this.log('verbose',
                    `Formatter Statistics:\n` +
                    `  Duration                 : ${duration}ms\n` +
                    `  Modules formatted        : ${this.stats.modulesFormatted}\n` +
                    `  Sections created         : ${this.stats.sectionsCreated}\n` +
                    `  Statements reorganized   : ${this.stats.statementsReorganized}\n` +
                    `  Docs added               : ${this.stats.docsAdded}`
                );
            }

        // └──────────────────────────────────────────────────────────────────────┘
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝