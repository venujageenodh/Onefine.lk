const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/href="\/contact"/g, 'href="/contact-us"');
    content = content.replace(/path\.includes\('\/contact'\)/g, "path.includes('/contact-us')");
    content = content.replace(/window\.location\.replace\('\/contact'\)/g, "window.location.replace('/contact-us')");

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
