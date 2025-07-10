const fs = require('fs');

const target = process.argv[2]; // "gh" ou "local"
if (!target) {
    console.error('Usage: node switch-package.js [gh|local]');
    process.exit(1);
}

const src = target === 'gh' ? 'packageGH.json' : 'packageLocal.json';
fs.copyFileSync(src, 'package.json');
console.log(`package.json remplacé par ${src}`);