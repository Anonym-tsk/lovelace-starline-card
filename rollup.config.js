import {readFileSync} from 'node:fs';
import process from 'node:process';

import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import fg from 'fast-glob';
import temp from 'temp-dir';

import pkg from './package.json' with {type: 'json'};
import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import * as sass from 'sass';
import * as b64img from 'css-b64-images';
import fs from 'fs-extra';

const date = (new Date).toUTCString();
const name = process.env.npm_package_name;
const version = process.env.npm_package_version;

const externalDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
];

function postBuild() {
    const buildHtml = () => {
        const html = readFileSync('./src/starline.html', {encoding: 'utf8'});
        const versionTag = `<div class="version">${pkg.version}</div>`;

        return versionTag + html;
    };

    const buildCss = async () => {
        fs.mkdirp('./tmp/assets');
        fs.emptyDirSync('./tmp/assets');

        await imagemin(['./src/assets/*.png'], {
            destination: './tmp/assets',
            plugins: [
                imageminPngquant({
                    quality: [0.6, 0.8]
                })
            ]
        });

        const result = sass.compile('./src/starline.sass', {style: 'compressed'});

        return new Promise((resolve, reject) => {
            b64img.fromString(result.css, './tmp/', null, {maxSize: 1024 * 32}, function (err, css) {
                if (err) {
                    console.error('Error:', err);
                    reject(err);
                } else {
                    resolve(css);
                }
            });
        });
    };

    return {
        name: 'post-build-script',

        async buildStart() {
            const files = await fg([
                'src/starline.sass',
                'src/starline.html',
                'src/assets/**/*',
                'src/styles/**/*',
                'src/scripts/build.js',
                'src/package.json',
            ]);
            for (const f of files) {
                if (f) {
                    this.addWatchFile(f);
                }
            }
        },

        async generateBundle(_, bundle) {
            const css = await buildCss();
            const html = buildHtml();

            for (const [filename, chunk] of Object.entries(bundle)) {
                if (!chunk || chunk.type !== 'chunk') {
                    this.error(`Bundle ${filename} not found`);
                }

                const code = chunk.code;
                chunk.code = code
                    .replace('{%css%}', css)
                    .replace('{%html%}', html);
            }
        },
    };
}

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
        postBuild(),
    ],
    output: {
        file: './dist/starline-card.js',
        format: 'esm',
        sourcemap: false,
        banner: `/**\n * ${name} v${version}\n * ${date}\n */`,
    }
};
