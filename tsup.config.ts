import { defineConfig } from 'tsup';
export default defineConfig({
    entry                           : ["lib/ast-analyzer.ts"],
    format                          : ["cjs", "esm"],
    dts                             : true,
    splitting                       : false,
    sourcemap                       : true,
    clean                           : true,
});