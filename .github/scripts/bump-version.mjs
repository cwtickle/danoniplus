// .github/scripts/bump-version.mjs
// usage: node scripts/bump-version.mjs 53.4.0 [--base origin/master] [--date 2026/11/25]
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const [, , version, ...rest] = process.argv;
if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) {
    console.error('version を X.Y.Z 形式で指定してください');
    process.exit(1);
}
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const opt = (name, def) => {
    const i = rest.indexOf(name);
    return i >= 0 ? rest[i + 1] : def;
};
const base = opt('--base', 'origin/master');
const d = new Date(Date.now() + 9 * 3600 * 1000); // JST
const date = opt('--date',
    `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCDate()).padStart(2, '0')}`);
const major = version.split('.')[0];

// 1. master との差分ファイル（js / css など対象を絞る）
const changed = execSync(`git diff --name-only ${base}...HEAD -- js css`, { encoding: 'utf8' })
    .split('\n').filter(f => /\.(js|css)$/.test(f) && fs.existsSync(f));

// ヘッダの " * Revised : 2026/11/22 (v53.3.1)" または " * Revised : 2026/11/22" を更新
const revisedRe = /^(\s*\*\s*Revised\s*:\s*)\d{4}\/\d{2}\/\d{2}(\s*\(v[^)]*\))?/m;
for (const f of changed) {
    let src = fs.readFileSync(f, 'utf8');
    if (!revisedRe.test(src)) { console.warn(`skip (Revised なし): ${f}`); continue; }
    const isMain = f.endsWith('danoni_main.js');
    // danoni_main.js は日付のみ（バージョンは g_version 側に持つ）
    src = src.replace(revisedRe, `$1${date}${isMain ? '' : ` (v${version})`}`);
    if (isMain) {
        src = src
            .replace(/^(const g_version\s*=\s*`Ver )[^`]+(`;)/m, `$1${version}$2`)
            .replace(/^(const g_revisedDate\s*=\s*`)[^`]+(`;)/m, `$1${date}$2`);
    }
    fs.writeFileSync(f, src);
    console.log(`updated: ${f}`);
}

// danoni_main.js が差分に含まれていなくても必ず更新
if (!changed.includes('js/danoni_main.js')) {
    let src = fs.readFileSync('js/danoni_main.js', 'utf8');
    src = src
        .replace(revisedRe, `$1${date}`)
        .replace(/^(const g_version\s*=\s*`Ver )[^`]+(`;)/m, `$1${version}$2`)
        .replace(/^(const g_revisedDate\s*=\s*`)[^`]+(`;)/m, `$1${date}$2`);
    fs.writeFileSync('js/danoni_main.js', src);
    console.log('updated: js/danoni_main.js');
}

// 4. package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = version;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

// 3. SECURITY.md の該当メジャー行の Latest Version
let sec = fs.readFileSync('SECURITY.md', 'utf8');
const safeMajor = escapeRegExp(major);
const rowRe = new RegExp(`^(\\| v${safeMajor}[ :].*)$`, 'm');
const link = `[v${version}](https://github.com/cwtickle/danoniplus/releases/tag/v${version})`;
sec = sec.replace(rowRe, row =>
    row.replace(/\[v\d+\.\d+\.\d+\]\(https:\/\/github\.com\/cwtickle\/danoniplus\/releases\/tag\/v\d+\.\d+\.\d+\)/, link));
fs.writeFileSync('SECURITY.md', sec);
