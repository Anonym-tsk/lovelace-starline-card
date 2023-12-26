import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import pkg from "./package.json" assert { type: 'json' };

import temp from 'temp-dir';

const date = (new Date).toUTCString();
const name = process.env.npm_package_name;
const version = process.env.npm_package_version;

const externalDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
];

export default {
    input: './src/starline.ts',
    external: externalDeps,
    plugins: [
        resolve(),
        commonjs(),
        typescript({
            cacheRoot: temp + '/.rpt2_cache',
            clean: true,
        }),
    ],
    output: {
        file: './tmp/starline-card.js',
        format: 'esm',
        sourcemap: false,
        banner: `/**\n * ${name} v${version}\n * ${date}\n */`,
    }
};
