#!/usr/bin/env node
/**
 * .github/scripts/sync-related-releases.mjs
 *
 * 最新版の公開後に、同じ不具合修正を含む他のバージョン(サポート版)の Release 本文へ
 * 「🎣 Related Releases」を反映して完成させる。
 *
 * 背景: サポート版は最新版より先にタグ・公開するため、公開時点では Related Releases を
 * 完成できない (最新版・他のサポート版がまだ無い)。最新版の Release 本文の Related Releases が
 * 関連バージョンの一覧(= 正)になるので、そこに挙がった各バージョンの本文を揃える。
 *
 * 使い方:
 *   node .github/scripts/sync-related-releases.mjs --tag v53.4.0            # 差分の表示のみ (本文は変更しない)
 *   node .github/scripts/sync-related-releases.mjs --tag v53.4.0 --apply    # Release 本文を更新する
 *
 * 更新するのは Related Releases の節だけ。Assets・タグ・他の節には触れない。
 *   - 節が有効 : 最新版の行を反映する。既存の行のうち、反映する行に包含されるもの(暫定行)は置き換え、
 *               包含されない行(別の不具合の行)は残す
 *   - 節がコメントアウト(<!-- ## 🎣 Related Releases -->) : 有効な節に置き換える
 *   - 節が無い : 「💡 Recent Changes」の直前に挿入する
 *   - 挿入位置が分からない場合は更新せず、警告に出す (手作業)
 *
 * テスト用オプション:
 *   --releases-dir <dir>  <dir>/<タグ>.json ({tag_name, id, draft, body}) を Release として読む
 *   --out-dir <dir>       --apply 時、Release を更新する代わりに <dir>/<タグ>.md へ本文を書き出す
 *   --repo <owner/name>   既定: $GITHUB_REPOSITORY または cwtickle/danoniplus
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const TAG_RE = /^v\d+\.\d+\.\d+$/;
const warnings = [];

function fail(msg) {
    console.error(`::error::${msg}`);
    process.exit(1);
}

function gh(args, input) {
    return execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'], input });
}

// ---------------------------------------------------------------- 引数
function parseArgs(argv) {
    const o = { repo: process.env.GITHUB_REPOSITORY || 'cwtickle/danoniplus', apply: false };
    const valued = { '--tag': 'tag', '--repo': 'repo', '--releases-dir': 'releasesDir', '--out-dir': 'outDir' };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--apply') o.apply = true;
        else if (valued[argv[i]]) o[valued[argv[i]]] = argv[++i];
        else fail(`未知の引数: ${argv[i]}`);
    }
    if (!TAG_RE.test(o.tag ?? '')) fail(`--tag は vX.Y.Z 形式で指定してください (指定値: ${o.tag})`);
    if (!/^[\w.-]+\/[\w.-]+$/.test(o.repo)) fail(`--repo の形式が不正です: ${o.repo}`);
    if (o.apply && o.releasesDir && !o.outDir) fail('--releases-dir を使う場合、--apply には --out-dir が必要です');
    return o;
}

// ---------------------------------------------------------------- Release の取得・更新
function getRelease(o, tag) {
    if (o.releasesDir) {
        const f = path.join(o.releasesDir, `${tag}.json`);
        return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
    }
    try {
        return JSON.parse(gh(['api', `repos/${o.repo}/releases/tags/${tag}`]));
    } catch {
        // ドラフトはタグ指定では取得できないため、一覧から探す
        for (let page = 1; page <= 3; page++) {
            let list;
            try {
                list = JSON.parse(gh(['api', `repos/${o.repo}/releases?per_page=100&page=${page}`]));
            } catch {
                return null;
            }
            const hit = list.find((r) => r.tag_name === tag);
            if (hit) return hit;
            if (list.length < 100) break;
        }
        return null;
    }
}

function updateRelease(o, release, body) {
    if (o.outDir) {
        fs.mkdirSync(o.outDir, { recursive: true });
        fs.writeFileSync(path.join(o.outDir, `${release.tag_name}.md`), body);
        return;
    }
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-related-'));
    try {
        const file = path.join(tmp, 'body.json');
        fs.writeFileSync(file, JSON.stringify({ body }));
        gh(['api', '-X', 'PATCH', `repos/${o.repo}/releases/${release.id}`, '--input', file]);
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
}

// ---------------------------------------------------------------- Markdown の行分類 (コードブロック・HTML コメントを区別)
/** 各行を 'text' | 'fence' | 'comment' に分類し、コメントのブロック番号も返す */
function classify(lines) {
    const kind = [];
    const block = [];
    let fence = null;
    let inComment = false;
    let blockId = 0;
    for (const line of lines) {
        if (inComment) {
            kind.push('comment');
            block.push(blockId);
            if (line.includes('-->')) inComment = false;
            continue;
        }
        if (fence) {
            kind.push('fence');
            block.push(-1);
            const m = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
            if (m && m[1][0] === fence[0] && m[1].length >= fence.length) fence = null;
            continue;
        }
        const f = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
        if (f && (f[1][0] === '~' || !f[2].includes('`'))) {
            fence = f[1];
            kind.push('fence');
            block.push(-1);
            continue;
        }
        const start = line.indexOf('<!--');
        if (start >= 0 && line.slice(0, start).trim() === '') {
            blockId++;
            kind.push('comment');
            block.push(blockId);
            if (!line.slice(start).includes('-->')) inComment = true;
            continue;
        }
        kind.push('text');
        block.push(-1);
    }
    return { kind, block };
}

const isHeading = (kind, line) => kind === 'text' && /^ {0,3}##[ \t]+\S/.test(line);
const isStandaloneComment = (kind, line) => kind === 'comment' && /^\s*<!--[\s\S]*-->\s*$/.test(line);
const RELATED_HEADING = /^ {0,3}##[ \t]+🎣[ \t]*Related Releases[ \t]*$/;
const RECENT_HEADING = /^ {0,3}##[ \t]+💡[ \t]*Recent Changes[ \t]*$/;

/** Related Releases の行 (箇条書き) を { raw, members } に解析する。members は " <- " より前のバージョン */
function parseRelatedLines(lines) {
    const out = [];
    for (const line of lines) {
        const m = line.match(/^\s*[-*]\s+(.*\S)\s*$/);
        if (!m) continue;
        const body = m[1].split(' <- ')[0];
        const members = [...body.matchAll(/\[(v\d+\.\d+\.\d+)\]/g)].map((x) => x[1]);
        out.push({ raw: `- ${m[1]}`, members });
    }
    return out;
}

/** 本文から有効な Related Releases の行を取り出す (無ければ null) */
function readRelatedSection(body) {
    const lines = body.replace(/\r\n/g, '\n').split('\n');
    const { kind } = classify(lines);
    const i = lines.findIndex((l, n) => kind[n] === 'text' && RELATED_HEADING.test(l));
    if (i < 0) return null;
    return parseRelatedLines(sectionLines(lines, kind, i));
}

function sectionLines(lines, kind, headingIndex) {
    const out = [];
    for (let j = headingIndex + 1; j < lines.length; j++) {
        if (isHeading(kind[j], lines[j]) || isStandaloneComment(kind[j], lines[j]) ||
            (kind[j] === 'text' && lines[j].trim() === '</details>')) break;
        out.push(lines[j]);
    }
    return out;
}

// ---------------------------------------------------------------- 本文の更新
/**
 * 1つのバージョンの本文に、反映する行を取り込んだ新しい本文を作る。
 * @returns {{ body: string, action: string } | { skip: string }}
 */
function applyLines(body, tag, selected) {
    const eol = body.includes('\r\n') ? '\r\n' : '\n';
    const lines = body.replace(/\r\n/g, '\n').split('\n');
    const { kind, block } = classify(lines);
    const heading = '## 🎣 Related Releases';
    const bullets = (list) => list.map((l) => l.raw);

    const active = lines.findIndex((l, n) => kind[n] === 'text' && RELATED_HEADING.test(l));
    if (active >= 0) {
        const end = active + 1 + sectionLines(lines, kind, active).length;
        const existing = parseRelatedLines(lines.slice(active + 1, end));
        // 反映する行に包含される既存行(暫定行)は置き換え、それ以外(別の不具合の行)は残す
        const kept = existing.filter((e) => !e.members.length || !selected.some((s) => e.members.every((v) => s.members.includes(v))));
        const merged = [...selected, ...kept.filter((k) => !selected.some((s) => s.raw === k.raw))];
        let last = end - 1;
        while (last > active && lines[last].trim() === '') last--;
        const next = [heading, ...bullets(merged)];
        const before = lines.slice(active, last + 1);
        if (JSON.stringify(before) === JSON.stringify(next)) return { skip: '変更なし' };
        lines.splice(active, last + 1 - active, ...next);
        return { body: lines.join(eol), action: '更新 (有効な節を置き換え)' };
    }

    // コメントアウトされた節: <!--\n## 🎣 Related Releases\n-->
    const hiddenAt = lines.findIndex((l, n) => kind[n] === 'comment' && /^\s*##[ \t]+🎣[ \t]*Related Releases[ \t]*$/.test(l));
    if (hiddenAt >= 0) {
        const id = block[hiddenAt];
        const idx = lines.map((_, n) => n).filter((n) => kind[n] === 'comment' && block[n] === id);
        const inner = idx.map((n) => lines[n].replace(/<!--|-->/g, '').trim()).filter(Boolean);
        if (inner.length !== 1) return { skip: 'コメントアウトされた節に他の内容があり、置き換え位置を特定できません' };
        lines.splice(idx[0], idx.length, heading, ...bullets(selected));
        return { body: lines.join(eol), action: '更新 (コメントアウトされた節を有効化)' };
    }

    // 節が無い: Recent Changes の直前 (直前に独立したコメント行があればその前) に挿入
    const recent = lines.findIndex((l, n) => kind[n] === 'text' && RECENT_HEADING.test(l));
    if (recent < 0) return { skip: '「💡 Recent Changes」が見つからず、挿入位置を特定できません' };
    let at = recent;
    let p = recent - 1;
    while (p >= 0 && lines[p].trim() === '') p--;
    if (p >= 0 && isStandaloneComment(kind[p], lines[p]) && p === recent - 1) at = p;
    lines.splice(at, 0, '<!-- 関連更新情報 -->', heading, ...bullets(selected), '');
    return { body: lines.join(eol), action: '追加 (節が無かったため挿入)' };
}

// ---------------------------------------------------------------- 表示
function diffText(before, after) {
    const a = before.replace(/\r\n/g, '\n').split('\n');
    const b = after.replace(/\r\n/g, '\n').split('\n');
    const sa = new Set(a);
    const sb = new Set(b);
    return [...a.filter((l) => !sb.has(l)).map((l) => `- ${l}`), ...b.filter((l) => !sa.has(l)).map((l) => `+ ${l}`)].join('\n');
}

// ---------------------------------------------------------------- main
const o = parseArgs(process.argv.slice(2));
const latest = getRelease(o, o.tag);
if (!latest) fail(`Release ${o.tag} が見つかりません`);

const groups = readRelatedSection(latest.body ?? '');
if (!groups || groups.length === 0) {
    const msg = `${o.tag} の Release 本文に有効な Related Releases がありません。同期するものがありません`;
    console.log(`::notice::${msg}`);
    if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${msg}\n`);
    process.exit(0);
}
for (const g of groups) if (!g.members.includes(o.tag)) warnings.push(`行に ${o.tag} 自身が含まれていません: ${g.raw}`);

const targets = [...new Set(groups.flatMap((g) => g.members))].filter((v) => v !== o.tag);
const results = [];
for (const tag of targets) {
    const release = getRelease(o, tag);
    if (!release) {
        results.push({ tag, status: 'skip', detail: 'Release が見つかりません (タグのみ、または未作成)' });
        continue;
    }
    const selected = groups.filter((g) => g.members.includes(tag));
    const r = applyLines(release.body ?? '', tag, selected);
    if (r.skip) {
        results.push({ tag, status: r.skip === '変更なし' ? 'unchanged' : 'skip', detail: r.skip });
        continue;
    }
    results.push({ tag, status: o.apply ? 'updated' : 'would-update', detail: r.action, diff: diffText(release.body ?? '', r.body) });
    if (o.apply) updateRelease(o, release, r.body);
}

// ---------------------------------------------------------------- レポート
const label = { updated: '更新済み', 'would-update': '更新予定', unchanged: '変更なし', skip: 'スキップ' };
const lines = [
    `## Related Releases の同期: ${o.tag} ${o.apply ? '(適用)' : '(確認のみ。--apply で本文を更新)'}`,
    '',
    '反映元(最新版の Related Releases):',
    ...groups.map((g) => `- ${g.raw.slice(2)}`),
    '',
    '| バージョン | 結果 | 内容 |',
    '|---|---|---|',
    ...results.map((r) => `| ${r.tag} | ${label[r.status]} | ${r.detail} |`),
];
for (const r of results.filter((x) => x.diff)) lines.push('', `### ${r.tag}`, '```diff', r.diff, '```');
if (warnings.length) lines.push('', '### 警告', ...warnings.map((w) => `- ${w}`));
if (results.some((r) => r.status === 'skip')) lines.push('', '### 要手作業', ...results.filter((r) => r.status === 'skip').map((r) => `- ${r.tag}: ${r.detail}`));
const md = lines.join('\n');
console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md}\n`);
