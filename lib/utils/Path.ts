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

        // If import path starts with '.' or '..', resolve relative to current module
        if (importPath.startsWith('.') && currentModulePath) {
            const currentDir = path.dirname(currentModulePath);
            const resolved = path.resolve(currentDir, importPath);
            // Normalize to relative path from program root
            return path.relative(programRoot, resolved);
        }

        // For absolute imports, resolve from program root
        if (path.isAbsolute(importPath)) {
            return path.relative(programRoot, importPath);
        }

        // Otherwise resolve relative to program root
        return path.normalize(importPath);
    }

    // Finds a module by its resolved path
    export function findModuleByPath(program: Program, targetPath: string): Module | undefined {
        const programRoot = program.metadata?.path as string || './';
        const normalizedTarget = path.normalize(targetPath);

        for (const [_, module] of program.modules) {
            const modulePath = module.metadata?.path as string | undefined;
            if (!modulePath) continue;

            // Compare both absolute and relative paths
            const relativeModulePath = path.relative(programRoot, modulePath);
            const normalizedModulePath = path.normalize(modulePath);
            const normalizedRelativePath = path.normalize(relativeModulePath);

            if (normalizedModulePath === normalizedTarget ||
                normalizedRelativePath === normalizedTarget ||
                modulePath === targetPath ||
                relativeModulePath === targetPath) {
                return module;
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