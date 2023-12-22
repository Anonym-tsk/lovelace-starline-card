import * as sass from 'node-sass';
import * as b64img from 'css-b64-images'
import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import replace from 'replace-in-file';
import fs from 'fs-extra';

fs.mkdirp('./tmp/assets');
fs.emptyDirSync('./tmp/assets');

(async () => {
    await imagemin(['./src/assets/*.png'], {
        destination: './tmp/assets',
        plugins: [
            imageminPngquant({
                quality: [0.6, 0.8]
            })
        ]
    });

    var result = sass.renderSync({
        file: './src/starline.sass',
        outputStyle: 'compact'
    });

    b64img.fromString(result.css, './tmp/', null, {maxSize: 1024 * 32}, function(err, css) {
        if (err) {
            console.error('Error:', err);
            return;
        }

        fs.copySync('./src/starline-card.js', './tmp/starline-card.js');

        replace.sync({
            files: './tmp/starline-card.js',
            from: '{%css%}',
            to: css,
        });

        fs.readFile('./src/starline.html', 'utf8', function(err, contents) {
            replace.sync({
                files: './tmp/starline-card.js',
                from: '{%html%}',
                to: contents,
            });

            fs.copySync('./tmp/starline-card.js', './dist/starline-card.js');
        });
    });
})();
