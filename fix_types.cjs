const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/**/*.{ts,tsx}');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    // Fix imports from types
    const regex = /import\s+\{([^}]*)\}\s+from\s+['"](?:\.\.\/)+types['"]/g;
    content = content.replace(regex, (match, types) => {
        if (match.includes('import type')) return match;
        changed = true;
        return `import type {${types}} from '../../types'`; // Note: assuming depth 2 which is standard for pages, but actually it might be different. Let's preserve the original path!
    });
    
    // Better regex to preserve original path:
    const regex2 = /import\s+\{([^}]*)\}\s+from\s+(['"](?:.*?\/)?types['"])/g;
    content = content.replace(regex2, (match, types, pth) => {
        if (match.includes('import type')) return match;
        changed = true;
        return `import type {${types}} from ${pth}`;
    });

    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Fixed types in', file);
    }
});
