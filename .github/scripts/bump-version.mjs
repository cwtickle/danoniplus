// .github/scripts/bump-version.mjs
// usage: node .github/scripts/bump-version.mjs 54.0.0 [--base origin/master] [--date 2026/11/25] [--no-security]
//   --no-security: SECURITY.md を更新しない (サポートバージョン用)
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
const skipSecurity = rest.includes('--no-security');
const d = new Date(Date.now() + 9 * 3600 * 1000); // JST
const date = opt(
    '--date',
    `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCDate()).padStart(2, '0')}`
);
// SECURITY.md の First Release 用（YYYY-MM-DD）
const isoDate = date.replace(/\//g, '-');

const [majorStr] = version.split('.');
const majorNum = Number(majorStr);
const prevMajor = majorNum - 1;
// 5n + 4 のメジャーバージョンは 9 メジャー先まで延長サポート、それ以外は 3 メジャー先
const isExtendedSupport = majorNum % 5 === 4;
const eosMajor = majorNum + (isExtendedSupport ? 9 : 3);
const safeMajor = escapeRegExp(majorStr);

// 書き込み予定をまとめて保持: { path, content, log }
const pendingWrites = [];

// 1. master との差分ファイル（js / css）
const changed = execSync(`git diff --name-only ${base}...HEAD -- js css`, { encoding: 'utf8' })
    .split('\n')
    .filter((f) => /\.(js|css)$/.test(f) && fs.existsSync(f));

const revisedRe = /^(\s*(?:\*\s*)?Revised\s*:\s*)\d{4}\/\d{2}\/\d{2}(\s*\(v[^)]*\))?/m;
const targets = new Set(changed);
targets.add('js/danoni_main.js');

for (const f of targets) {
    if (!fs.existsSync(f)) continue;
    let src = fs.readFileSync(f, 'utf8');
    const isMain = f.endsWith('danoni_main.js');

    if (!revisedRe.test(src) && !isMain) {
        console.warn(`skip (Revised なし): ${f}`);
        continue;
    }

    if (revisedRe.test(src)) {
        src = src.replace(revisedRe, `$1${date}${isMain ? '' : ` (v${version})`}`);
    }
    // danoni_main.js は日付のみ（バージョンは g_version 側に持つ）
    if (isMain) {
        src = src
            .replace(/^(const g_version\s*=\s*`Ver )[^`]+(`;)/m, `$1${version}$2`)
            .replace(/^(const g_revisedDate\s*=\s*`)[^`]+(`;)/m, `$1${date}$2`);
    }

    pendingWrites.push({ path: f, content: src, log: `updated: ${f}` });
}

// 2. package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = version;
pendingWrites.push({
    path: 'package.json',
    content: JSON.stringify(pkg, null, 2) + '\n',
    log: 'updated: package.json',
});

// 3. SECURITY.md（既存行の更新 or 新メジャー行追加＋直前メジャーの Logs 切替）
//    サポートバージョン (--no-security) では更新しない
if (!skipSecurity) {
    let sec = fs.readFileSync('SECURITY.md', 'utf8');
    const rowRe = new RegExp(`^(\\|[ \\t]*v${safeMajor}(?:[ :].*))$`, 'm');
    const targetRe = /\[v\d+\.\d+\.\d+\]\(https:\/\/github\.com\/cwtickle\/danoniplus\/releases\/tag\/v\d+\.\d+\.\d+\)/;
    const latestLogsUrl = 'https://github.com/cwtickle/danoniplus/wiki/Changelog-latest';
    const link = `[v${version}](https://github.com/cwtickle/danoniplus/releases/tag/v${version})`;

    if (rowRe.test(sec)) {
        let matched = false;
        sec = sec.replace(rowRe, (row) => {
            if (!targetRe.test(row)) {
                throw new Error(`SECURITY.md の v${majorStr} 行で Latest Version リンクが一致しません: ${row}`);
            }
            matched = true;
            return row.replace(targetRe, link);
        });
        if (!matched) {
            throw new Error(`SECURITY.md の v${majorStr} 行を更新できませんでした。`);
        }
    } else {
        const separatorRe = /^(\|[ \t-]+\|[ \t-]+\|[^\n]*)$/m;
        if (!separatorRe.test(sec)) {
            throw new Error('SECURITY.md のテーブル区切り行が見つかりません。');
        }

        const newRow = `| v${majorNum} | :heavy_check_mark: | ${link} | [:memo:](${latestLogsUrl}) | ${isoDate} | (At Release v${eosMajor}) |`;
        sec = sec.replace(separatorRe, `$1\n${newRow}`);

        if (prevMajor >= 1) {
            const prevRowRe = new RegExp(`^(\\|[ \\t]*v${prevMajor}[ \\t]*\\|[^\\n]*)$`, 'm');
            if (prevRowRe.test(sec)) {
                sec = sec.replace(prevRowRe, (prevRow) =>
                    prevRow.replace(
                        latestLogsUrl,
                        `https://github.com/cwtickle/danoniplus/wiki/Changelog-v${prevMajor}`
                    )
                );
            }
        }
    }

    pendingWrites.push({ path: 'SECURITY.md', content: sec, log: 'updated: SECURITY.md' });
}

// 4. すべて問題なく生成できたあとに一括書き出し
for (const item of pendingWrites) {
    fs.writeFileSync(item.path, item.content, 'utf8');
    console.log(item.log);
}