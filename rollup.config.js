"use strict";

/**
 * This is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or
 * distribute this software, either in source code form or as a compiled
 * binary, for any purpose, commercial or non-commercial, and by any
 * means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors
 * of this software dedicate any and all copyright interest in the
 * software to the public domain. We make this dedication for the benefit
 * of the public at large and to the detriment of our heirs and
 * successors. We intend this dedication to be an overt act of
 * relinquishment in perpetuity of all present and future rights to this
 * software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * For more information, please refer to <http://unlicense.org>
 */


import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import fg from "fast-glob";
import clear from "rollup-plugin-clear";
import typescript from "rollup-plugin-typescript2";

let targetArena = "";
if (process.argv[3] === "--config-") {
    // we running dynamic mode2
    targetArena = process.argv[4] || "";
} else if (process.argv[3] === "--environment") {
    targetArena = process.env.DEST;
}

function getOptions(arenaSrc) {
    const outDir = arenaSrc.replace("src/", "dist/");

    return {
        input: `${arenaSrc}/main.ts`,
        external: ["game", "game/prototypes", "game/constants", "game/utils", "game/path-finder", "arena", "game/visual"], // <-- suppresses the warning
        output: {
            dir: outDir,
            format: "esm",
            entryFileNames: "[name].mjs",
            sourcemap: false,
            preserveModules: true,
            preserveModulesRoot: arenaSrc,
            paths: path => {
                // https://rollupjs.org/guide/en/#outputpaths
                // TS requires that we use non-relative paths for these "ambient" modules
                // The game requires relative paths, so prefix all game modules with "/" in the output bundle
                if (path.startsWith("game") || path.startsWith("arena")) {
                    return "/" + path;
                }
            }
        },

        plugins: [
            clear({ targets: targetArena === "" ? ["dist"] : [outDir] }), // If targeted build, only clear target sub-directory
            resolve({ rootDir: "src" }),
            commonjs(),
            typescript({ tsconfig: "./tsconfig.json" })
        ]
    };
}

const arenas = fg.sync(`src/*arena-*${targetArena}*`, { onlyDirectories: true });
if (arenas.length === 0) {
    throw new Error("No matching arenas found in src/. Exiting");
} else {
    if (targetArena === "") {
        console.log(`No arena targeted. Building all ${arenas.length} arenas.`);
    } else {
        console.log(`Buidling ${arenas.length} arena(s) for target "${targetArena}"`);
    }
}

export default arenas.map(getOptions);
