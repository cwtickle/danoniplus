#!/usr/bin/env node
/**
 * .github/scripts/update-wiki-changelog.mjs
 *
 * render-changelog.mjs が作ったエントリと Files changed 節を、Wiki クローン内の Changelog ページへ反映する。
 *   1. 対象ページ (Changelog-latest.md / Changelog-vXX.md) の先頭に今回のエントリを挿入 (既にあれば置換)
 *   2. 対象がページ内の最新バージョンの場合のみ Files changed 節を差し替え
 *   3. 「🔖 N Releases」を、ページ内のバージョン見出しの数に合わせる
 *   4. meta.backfill に指定された関連リリースの各エントリに 🎣 行を追記・更新 (サポート版を先に作った場合の後追い)
 * 変更したファイルは標準出力に 1 行ずつ出す。ファイルはローカルで更新し、push するかどうかは workflow の dry_run 入力が制御する。
 *
 * 使い方:
 *   node .github/scripts/update-wiki-changelog.mjs --dir wiki-gh-main --entry changelog-out/gh-ja.md \
 *        --files-changed changelog-out/files-changed.md --meta changelog-out/meta.json [--subdir Ja]
 *
 * 目印が見つからないページは変更せず、エラー終了する (Wiki の構成が想定と違う場合に壊さないため)。
 */
import fs from 'node:fs';
import path from 'node:path';

function fail(msg) {
    console.error(`::error::${msg}`);
    process.exit(1);
}

function parseArgs(argv) {
    const o = { subdir: '' };
    const valued = { '--dir': 'dir', '--subdir': 'subdir', '--entry': 'entry', '--files-changed': 'filesChanged', '--meta': 'meta' };
    for (let i = 0; i < argv.length; i++) {
        const key = valued[argv[i]];
        if (!key) fail(`未知の引数: ${argv[i]}`);
        o[key] = argv[++i];
    }
    for (const k of ['dir', 'entry', 'filesChanged', 'meta']) if (!o[k]) fail(`--${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)} を指定してください`);
    return o;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ENTRY_HEAD = /^## (v\d+\.\d+\.\d+) \(/;

function isNewestEntry(lines, tag) {
    const version = (v) => v.slice(1).split('.').map(Number);
    const [major, minor, patch] = version(tag);
    return !lines.some((line) => {
        const match = ENTRY_HEAD.exec(line);
        if (!match) return false;
        const [a, b, c] = version(match[1]);
        return a > major || (a === major && (b > minor || (b === minor && c > patch)));
    });
}

function readPage(file) {
    const raw = fs.readFileSync(file, 'utf8');
    const crlf = raw.includes('\r\n');
    return { lines: raw.replace(/\r\n/g, '\n').split('\n'), crlf };
}

function writePage(file, lines, crlf) {
    const text = lines.join('\n');
    fs.writeFileSync(file, crlf ? text.replace(/\n/g, '\r\n') : text);
}

/** 見出し行 idx から次の `## ` 見出し直前までの範囲 [start, end) (末尾の空行は含めない) */
function entryRange(lines, tag) {
    const start = lines.findIndex((l) => new RegExp(`^## ${escapeRe(tag)} \\(`).test(l));
    if (start < 0) return null;
    let end = lines.findIndex((l, i) => i > start && /^## /.test(l));
    if (end < 0) end = lines.length;
    while (end > start && lines[end - 1].trim() === '') end--;
    return [start, end];
}

function applyEntry(lines, entry, tag) {
    const entryLines = entry.replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n');
    const range = entryRange(lines, tag);
    if (range) {
        lines.splice(range[0], range[1] - range[0], ...entryLines);
        return 'replaced';
    }
    const first = lines.findIndex((l) => ENTRY_HEAD.test(l));
    if (first < 0) throw new Error('既存のバージョン見出し (## vX.Y.Z (…) が見つかりません');
    lines.splice(first, 0, ...entryLines, '');
    return 'inserted';
}

function applyFilesChanged(lines, section) {
    const start = lines.findIndex((l) => /^## 🔃 Files changed/.test(l));
    if (start < 0) throw new Error('「## 🔃 Files changed」の節が見つかりません');
    let end = lines.findIndex((l, i) => i > start && (/^⭐ New Features/.test(l) || ENTRY_HEAD.test(l)));
    if (end < 0) throw new Error('Files changed 節の終端 (凡例行またはバージョン見出し) が見つかりません');
    lines.splice(start, end - start, ...section.replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n'), '');
}

function applyReleaseCount(lines) {
    const count = lines.filter((l) => ENTRY_HEAD.test(l)).length;
    const idx = lines.findIndex((l) => /🔖 \[\d+ Releases\]/.test(l));
    if (idx < 0) throw new Error('「🔖 [N Releases]」の行が見つかりません');
    lines[idx] = lines[idx].replace(/(🔖 \[)\d+( Releases\])/, `$1${count}$2`);
    return count;
}

/** 引用ブロックの最後の行の末尾に 🎣 行を追加する (貢献者の <br>:heart: は 🎣 行の末尾へ移す) */
function addRelated(lines, tag, relatedLine) {
    const range = entryRange(lines, tag);
    if (!range) return 'missing';
    const [start, end] = range;
    const existing = lines.findIndex((line, i) => i > start && i < end && line.includes('🎣'));
    if (existing >= 0) {
        const generated = /^> \/ 🎣 \[\*\*(v\d+\.\d+\.\d+)\*\*\]\((\.\/[^#)]+#[^)]+)\)(<br>:heart: .*)?$/;
        const before = generated.exec(lines[existing]);
        const after = generated.exec(relatedLine);
        if (!before || !after || before[1] !== after[1] || before[2] === after[2]) return 'exists';
        lines[existing] = `${relatedLine}${before[3] ?? ''}`;
        return 'refreshed';
    }
    const last = end - 1;
    if (!/^(>|\/)/.test(lines[last])) return 'unexpected';
    const m = /^(.*?)(<br>:heart: .*)?$/.exec(lines[last]);
    lines[last] = m[1];
    lines.splice(last + 1, 0, `${relatedLine}${m[2] ?? ''}`);
    return 'added';
}

// ---------------------------------------------------------------- main
const o = parseArgs(process.argv.slice(2));
const meta = JSON.parse(fs.readFileSync(o.meta, 'utf8'));
const entry = fs.readFileSync(o.entry, 'utf8');
const section = fs.readFileSync(o.filesChanged, 'utf8');
const base = path.join(o.dir, o.subdir);
const changed = new Set();
const log = (m) => console.error(`  ${m}`);

// ---- 今回のページ
const pageFile = path.join(base, `${meta.page}.md`);
if (!fs.existsSync(pageFile)) fail(`${pageFile} がありません`);
{
    const { lines, crlf } = readPage(pageFile);
    try {
        const r = applyEntry(lines, entry, meta.tag);
        if (isNewestEntry(lines, meta.tag)) applyFilesChanged(lines, section);
        const n = applyReleaseCount(lines);
        writePage(pageFile, lines, crlf);
        changed.add(path.relative(o.dir, pageFile));
        log(`${meta.page}: ${meta.tag} を${r === 'inserted' ? '追加' : '置換'} / Releases ${n}`);
    } catch (e) {
        fail(`${pageFile}: ${e.message}`);
    }
}

// ---- 🎣 の後追い (最新版の Changelog を作ったとき、既存のサポート版エントリへ)
const newest = meta.newestOfGroup;
for (const member of meta.backfill ?? []) {
    const major = Number(/^v(\d+)\./.exec(member)[1]);
    const page = major === meta.latestMajor ? 'Changelog-latest' : `Changelog-v${major}`;
    const file = path.join(base, `${page}.md`);
    if (!fs.existsSync(file)) {
        log(`${member}: ${page}.md が無いため 🎣 を追記できません`);
        continue;
    }
    const anchor = `${newest.replace(/\./g, '')}-${meta.date}`;
    const line = `> / 🎣 [**${newest}**](./${meta.page}#${anchor})`;
    const { lines, crlf } = readPage(file);
    const r = addRelated(lines, member, line);
    if (r === 'added' || r === 'refreshed') {
        writePage(file, lines, crlf);
        changed.add(path.relative(o.dir, file));
    }
    log(`${member}: 🎣 ${r}`);
}

for (const f of changed) console.log(f);