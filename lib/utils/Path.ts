// path.ts — Enhanced path resolution utilities.
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import type { Program, Module } from '@je-es/ast';
    import * as path from 'path';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    // Resolves a module import path against the program's root path
    export function resolveModulePath(program: Program, importPath: string, currentModulePath?: string): string {
        const programRoot = program.metadata?.path as string || './';

        // Normalize the import path and add .k extension if missing
        let normalizedImport = importPath;
        if (!normalizedImport.endsWith('.k')) {
            normalizedImport = normalizedImport + '.k';
        }

        // If import path starts with '.' or '..', resolve relative to current module
        if (normalizedImport.startsWith('.') && currentModulePath) {
            const currentDir = path.dirname(currentModulePath);
            const resolved = path.resolve(currentDir, normalizedImport);
            return path.relative(programRoot, resolved);
        }

        // For paths without ./ prefix, try both with and without
        if (!normalizedImport.startsWith('.')) {
            normalizedImport = './' + normalizedImport;
        }

        // For absolute imports, resolve from program root
        if (path.isAbsolute(normalizedImport)) {
            return path.relative(programRoot, normalizedImport);
        }

        // Otherwise resolve relative to program root or current module
        if (currentModulePath) {
            const currentDir = path.dirname(currentModulePath);
            return path.relative(programRoot, path.resolve(currentDir, normalizedImport));
        }

        return path.normalize(normalizedImport);
    }

    // Finds a module by its resolved path - with fuzzy matching
    export function findModuleByPath(program: Program, targetPath: string): Module | undefined {
        const programRoot = program.metadata?.path as string || './';

        // Helper to generate all possible path variations
        const generateVariations = (p: string): string[] => {
            const normalized = path.normalize(p).replace(/\\/g, '/');
            const variations = new Set<string>();

            // Add the path as-is
            variations.add(normalized);

            // Add with/without .k extension
            if (normalized.endsWith('.k')) {
                variations.add(normalized.slice(0, -2));
            } else {
                variations.add(normalized + '.k');
            }

            // Add with/without ./ prefix
            if (normalized.startsWith('./')) {
                const withoutPrefix = normalized.substring(2);
                variations.add(withoutPrefix);
                if (withoutPrefix.endsWith('.k')) {
                    variations.add(withoutPrefix.slice(0, -2));
                } else {
                    variations.add(withoutPrefix + '.k');
                }
            } else {
                variations.add('./' + normalized);
                if (normalized.endsWith('.k')) {
                    variations.add('./' + normalized.slice(0, -2));
                } else {
                    variations.add('./' + normalized + '.k');
                }
            }

            return Array.from(variations);
        };

        const targetVariations = generateVariations(targetPath);

        for (const [_, module] of program.modules) {
            const modulePath = module.metadata?.path as string | undefined;
            if (!modulePath) continue;

            const relativeModulePath = path.relative(programRoot, modulePath);
            const moduleVariations = generateVariations(modulePath);
            moduleVariations.push(...generateVariations(relativeModulePath));

            // Check if any target variation matches any module variation
            for (const targetVar of targetVariations) {
                for (const moduleVar of moduleVariations) {
                    if (targetVar === moduleVar ||
                        moduleVar.endsWith(targetVar) ||
                        targetVar.endsWith(moduleVar)) {
                        return module;
                    }
                }
            }
        }

        return undefined;
    }

    // Validates if a path exists in the program structure
    export function validatePath(program: Program, importPath: string, currentModulePath?: string): boolean {
        try {
            const resolvedPath = resolveModulePath(program, importPath, currentModulePath);
            return findModuleByPath(program, resolvedPath) !== undefined;
        } catch (e) {
            return false;
        }
    }

    // Gets the relative path between two modules
    export function getRelativePath(fromPath: string, toPath: string): string {
        const relativePath = path.relative(path.dirname(fromPath), toPath);
        return relativePath.startsWith('.') ? relativePath : './' + relativePath;
    }

    // Finds the module name by its path
    export function findModuleNameByPath(program: Program, targetPath: string): string | undefined {
        const module = findModuleByPath(program, targetPath);
        if (!module) return undefined;

        // Try to get name from metadata first, then fallback to path-based name
        const metadataName = module.metadata?.name as string | undefined;
        if (metadataName) return metadataName;

        // Extract name from path (remove extension and path separators)
        const baseName = path.basename(targetPath, path.extname(targetPath));
        return baseName === 'index' ? path.basename(path.dirname(targetPath)) : baseName;
    }

    // Normalizes a path for consistent comparison
    export function normalizePath(filePath: string): string {
        return path.normalize(filePath).replace(/\\/g, '/');
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝