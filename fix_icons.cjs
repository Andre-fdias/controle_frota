const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/**/*.{ts,tsx,js,jsx}');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const regex = /import\s+\{([^}]+)\}\s+from\s+['"]@mui\/icons-material['"];/g;
    
    let changed = false;
    content = content.replace(regex, (match, iconsStr) => {
        changed = true;
        return iconsStr.split(',').map(icon => {
            const i = icon.trim();
            if (!i) return '';
            return `import ${i} from '@mui/icons-material/${i}';`;
        }).filter(Boolean).join('\n');
    });
    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
    }
});
