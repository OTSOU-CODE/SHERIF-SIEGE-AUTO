const CleanCSS = require('clean-css');
const Terser = require('terser');
const fs = require('fs');
const path = require('path');

const cssFiles = [
    'style.css',
    'category.css',
    'gallery-page.css',
    'image-preview.css',
    'theme-transition.css',
    'element_style.css'
];

const jsFiles = [
    'script.js',
    'category.js',
    'gallery-page.js',
    'image-preview.js'
];

async function minify() {
    // Minify CSS
    console.log('Minifying CSS...');
    for (const file of cssFiles) {
        if (!fs.existsSync(file)) {
            console.log(`Skipping ${file} (not found)`);
            continue;
        }
        const input = fs.readFileSync(file, 'utf8');
        const output = new CleanCSS().minify(input);
        if (output.errors.length > 0) {
            console.error(`Error minifying ${file}:`, output.errors);
        } else {
            const minFile = file.replace('.css',('.min.css'));
            fs.writeFileSync(minFile, output.styles);
            console.log(`Minified ${file} -> ${minFile}`);
        }
    }

    // Minify JS
    console.log('Minifying JS...');
    for (const file of jsFiles) {
        if (!fs.existsSync(file)) {
            console.log(`Skipping ${file} (not found)`);
            continue;
        }
        const input = fs.readFileSync(file, 'utf8');
        try {
            const result = await Terser.minify(input);
            if (result.error) {
                console.error(`Error minifying ${file}:`, result.error);
            } else {
                const minFile = file.replace('.js', '.min.js');
                fs.writeFileSync(minFile, result.code);
                console.log(`Minified ${file} -> ${minFile}`);
            }
        } catch (e) {
            console.error(`Exception minifying ${file}:`, e);
        }
    }
}

minify();
