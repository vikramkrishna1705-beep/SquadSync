const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('src');
let report = {};

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let issues = [];

    // 1. console.log/error/warn
    if (/console\.(log|error|warn)/.test(content)) issues.push('console');
    
    // 2. TODO/FIXME
    if (/(TODO|FIXME)/.test(content)) issues.push('todo');
    
    // 3. Commented out code (naive check: line starts with // import or // const or // let or /* ... */ with code)
    if (/\/\/ (import|const|let|function|return|<div|<p|<span)/.test(content) || /\/\*[\s\S]*?(import|const|let|function|return|<div|<p|<span)[\s\S]*?\*\//.test(content)) issues.push('commented-code');

    // 4. empty useEffect
    if (/useEffect\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*,\s*\[\s*\]\s*\)/.test(content)) issues.push('empty-useeffect');

    // 5. key={index} in map
    if (/\.map\s*\(\s*\([^)]*index[^)]*\)\s*=>[\s\S]*?key\s*=\s*\{index\}/.test(content) || /\.map\s*\([^)]*index[^)]*=>[\s\S]*?key\s*=\s*\{index\}/.test(content) || /key=\{index\}/.test(content)) issues.push('key-index');

    // 6. hardcoded style with colors etc.
    if (/style=\{\{/.test(content)) issues.push('hardcoded-style');

    // 7. implicit any in map/filter/find (missing types)
    if (/\.(map|filter|find)\s*\(\s*([a-zA-Z0-9_]+)\s*=>/.test(content)) issues.push('implicit-any');
    if (/\.(map|filter|find)\s*\(\s*\(\s*([a-zA-Z0-9_]+)(\s*,\s*[a-zA-Z0-9_]+)?\s*\)\s*=>/.test(content)) {
        // Need to check if there is a colon
        // This is a bit tricky with regex. We'll do a simpler test.
    }
    
    // We will just do full analysis manually for the files that are likely to have issues.
    if (issues.length > 0) report[file] = issues;
});

console.log(JSON.stringify(report, null, 2));
