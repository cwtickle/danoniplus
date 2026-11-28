#!/usr/bin/env node
/**
 * .github/scripts/render-changelog.mjs
 *
 * 公開済み Release の本文 (JA の箇条書きの根拠) と release-facts.json (重要度・原因バージョン・Files changed) から、
 * Wiki の Changelog に追記する 4 種のエントリ (GitHub JA/EN, GitLab JA/EN) と Files changed 節を決定的に組み立てる。
 * LLM は使わない。EN のエントリも本文は日本語のままで、EN 版 Wiki に v19 以降のページしか無いことによる
 * リンク先の違い (v18 以前は日本語版 Wiki へ) だけを反映する。
 *
 * 使い方:
 *   node .github/scripts/render-changelog.mjs --facts release-facts.json --body release-body.md \
 *        --wiki-dir wiki-gh-main --date 2026-11-27 [--out-dir changelog-out]
 *
 *   --wiki-dir  日本語版 GitHub Wiki のクローン。過去バージョンの公開日 (## vX.Y.Z ([YYYY-MM-DD]) と最新メジャーの判定に使う
 *
 * 出力 (--out-dir):
 *   gh-ja.md / gh-en.md / gl-ja.md / gl-en.md                                   追記するエントリ
 *   files-changed-gh-ja.md / -gh-en.md / -gl-ja.md / -gl-en.md                  Files changed 節 (EN は v18 以前の行のリンク先が JA 版)
 *   meta.json                                                                    反映スクリプトへ渡す情報 (関連リリースの 🎣 行など)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { markdownLines } from './release-markdown.mjs';

const REPO = 'cwtickle/danoniplus';
const GH = `https://github.com/${REPO}`;
const GL = 'https://gitlab.com/cwtickle/danonicw';
const DL = 'https://dl-danoniplus.qu7-52m.workers.dev';
const PREVIEW = 'https://danonicw.skr.jp';
const MIRROR = 'https://tickle.cloudfree.jp';

const review = [];

function fail(msg) {
    console.error(`::error::${msg}`);
    process.exit(1);
}

// ---------------------------------------------------------------- 引数
function parseArgs(argv) {
    const o = { outDir: 'changelog-out' };
    const valued = { '--facts': 'facts', '--body': 'body', '--wiki-dir': 'wikiDir', '--date': 'date', '--out-dir': 'outDir' };
    for (let i = 0; i < argv.length; i++) {
        const key = valued[argv[i]];
        if (!key) fail(`未知の引数: ${argv[i]}`);
        o[key] = argv[++i];
    }
    for (const k of ['facts', 'body', 'wikiDir', 'date']) if (!o[k]) fail(`--${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)} を指定してください`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(o.date)) fail(`--date は YYYY-MM-DD 形式で指定してください (指定値: ${o.date})`);
    return o;
}

// ---------------------------------------------------------------- バージョンと Wiki の日付
const VER = /^v(\d+)\.(\d+)\.(\d+)$/;
const verKey = (v) => v.slice(1).split('.').map(Number);
const cmpVer = (a, b) => {
    const x = verKey(a);
    const y = verKey(b);
    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};
const majorOf = (v) => Number(VER.exec(v)[1]);
const dotless = (v) => v.replace(/\./g, '');
const anchorOf = (v, date) => `${dotless(v)}-${date}`;
const escapeRegExp = (s) => s.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');

function makeWiki(wikiDir, latestMajor) {
    const cache = new Map();
    const pageOf = (ver) => (majorOf(ver) === latestMajor ? 'Changelog-latest' : `Changelog-v${majorOf(ver)}`);
    const read = (page) => {
        if (!cache.has(page)) {
            const f = path.join(wikiDir, `${page}.md`);
            cache.set(page, fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '');
        }
        return cache.get(page);
    };
    const dateOf = (ver) => {
        const m = new RegExp(`^## ${escapeRegExp(ver)} \\(\\[(\\d{4}-\\d{2}-\\d{2})\\]`, 'm').exec(read(pageOf(ver)));
        return m ? m[1] : null;
    };
    return { pageOf, dateOf };
}

function detectLatestMajor(wikiDir, facts) {
    if (facts.version.isLatestMajor) return Number(facts.version.major.slice(1));
    const f = path.join(wikiDir, 'Changelog-latest.md');
    if (!fs.existsSync(f)) fail(`${f} がありません (--wiki-dir は日本語版 GitHub Wiki のクローンを指定してください)`);
    const m = /\|\s*\*\*v(\d+)\*\*\s*\|/.exec(fs.readFileSync(f, 'utf8'));
    if (!m) fail('Changelog-latest.md から最新メジャーを判定できません');
    return Number(m[1]);
}

/** Wiki に無い日付の代替: 公開済み Release の公開日 (JST) */
function releaseDate(ver) {
    try {
        const out = execFileSync('gh', ['release', 'view', ver, '--json', 'publishedAt,isDraft', '--jq', 'select(.isDraft==false) | .publishedAt'], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
        if (!out) return null;
        return new Date(new Date(out).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------- Release 本文の読み取り
function sectionsOf(body) {
    const map = new Map();
    let cur = null;
    for (const { line, fixIds, outsideFence } of markdownLines(body, { hideComments: true })) {
        if (!outsideFence) continue;
        const h = /^ {0,3}##[ \t]+(.+?)\s*$/.exec(line);
        if (h) {
            cur = [];
            map.set(h[1].replace(/️/g, ''), cur);
        } else if (cur) cur.push({ line, fixIds });
    }
    return map;
}

function parseBullets(lines, where) {
    const out = [];
    for (const { line, fixIds } of lines) {
        const m = /^ {0,3}[-*][ \t]+(.+)$/.exec(line.trimEnd());
        if (!m) continue;
        const pr = /^(.*?)\s*\(\s*PR\s+((?:#\d+(?:\s*,\s*)?)+)\s*\)\s*$/.exec(m[1]);
        if (!pr) {
            review.push(`${where}: PR 番号の書式 ( PR #N ) を読めない行があります: ${m[1]}`);
            out.push({ text: m[1].trim(), prs: [], fixIds });
            continue;
        }
        out.push({ text: pr[1].trim(), prs: [...pr[2].matchAll(/#(\d+)/g)].map((x) => Number(x[1])), fixIds });
    }
    return out;
}

const SEVERITY_ORDER = { A: 0, B: 1, C: 2 };

/** 項目 ID で照合する。古い PR クレジットだけの場合は PR に修正が 1 件のときに限る */
function bindFixes(bullets, items, fixCandidates) {
    const fixes = items.filter((i) => i.fix);
    const byId = new Map(fixes.map((f) => [f.id, f]));
    return bullets.map((b) => {
        const picked = [];
        let unresolved = false;
        if (b.fixIds) {
            for (const id of new Set(b.fixIds)) {
                const hit = byId.get(id);
                if (hit && b.prs.includes(hit.pr)) picked.push(hit);
                else {
                    review.push(`不具合修正「${b.text}」の項目 ID「${id}」を facts と照合できません`);
                    unresolved = true;
                }
            }
        } else {
            for (const pr of new Set(b.prs)) {
                const candidates = (fixCandidates ?? fixes).filter((f) => f.pr === pr);
                if (candidates.length > 1) {
                    review.push(`不具合修正「${b.text}」: PR #${pr} に複数の修正があり、項目 ID がないため特定できません`);
                    unresolved = true;
                } else if (candidates.length === 1 && byId.has(candidates[0].id)) {
                    picked.push(byId.get(candidates[0].id));
                }
            }
        }
        if (unresolved) return { ...b, severity: null, origins: [], initial: false };
        if (!picked.length) {
            review.push(`不具合修正「${b.text}」に対応する facts の項目が見つかりません (重要度・原因バージョンを手で補ってください)`);
            return { ...b, severity: null, origins: [], initial: false };
        }
        const sev = picked.map((p) => p.fix.severity).filter(Boolean).sort((a, c) => SEVERITY_ORDER[a] - SEVERITY_ORDER[c])[0] ?? null;
        const origins = [...new Set(picked.flatMap((p) => p.fix.origins))].sort(cmpVer);
        if (picked.length > 1) review.push(`不具合修正「${b.text}」は複数の項目をまとめています。重要度は最も高いもの (${sev}) を、原因バージョンは全て並べました`);
        return { ...b, severity: sev, origins, initial: picked.some((p) => p.fix.originInitial) };
    });
}

// ---------------------------------------------------------------- リンク生成
const prLinks = (prs) => `( PR ${prs.map((n) => `[#${n}](${GH}/pull/${n})`).join(', ')} )`;

/** 原因バージョンへのリンク (EN の v19 未満は日本語版を参照) */
function originLink(ver, ctx, platform, lang) {
    const date = ctx.wiki.dateOf(ver);
    if (!date) {
        review.push(`原因バージョン ${ver} の公開日が Wiki から見つかりません。リンクを付けずに出力しました`);
        return `**${ver}**`;
    }
    const page = ctx.wiki.pageOf(ver);
    const hash = `#${anchorOf(ver, date)}`;
    return `[**${ver}**](${wikiLink(page, ver, platform, lang)}${hash})`;
}

function bulletLine(b, section, ctx, platform, lang, text) {
    if (section === 'bugfix') {
        const sev = b.severity ? `**${b.severity})**` : '**?)**';
        let line = `- 🐞 ${sev} ${text} ${prLinks(b.prs)}`;
        const origins = b.origins.map((v) => originLink(v, ctx, platform, lang));
        if (b.initial) {
            origins.unshift('**initial**');
            review.push(`「${b.text}」の原因バージョンが initial です。表記を確認してください`);
        }
        if (origins.length) line += ` <- :boom: ${origins.join(' / ')}`;
        else review.push(`不具合修正「${b.text}」の原因バージョンがありません`);
        if (!b.severity) review.push(`不具合修正「${b.text}」の重要度がありません (**?)** を出力。手で A/B/C を記入してください)`);
        return line;
    }
    const emoji = section === 'new' ? '⭐' : '🛠️';
    return `- ${emoji} ${text} ${b.prs.length ? prLinks(b.prs) : ''}`.trimEnd();
}

// ---------------------------------------------------------------- エントリ
function changedFileLinks(facts, tag, platform) {
    const paths = new Set((facts.changedFiles ?? []).map((c) => c.path));
    const base = platform === 'gh' ? `${GH}/blob/${tag}` : `${GL}/-/blob/${tag}`;
    const links = [];
    if (paths.has('js/danoni_main.js')) links.push(`[⚪](${base}/js/danoni_main.js)`);
    if (paths.has('js/lib/danoni_constants.js')) links.push(`[🔵](${base}/js/lib/danoni_constants.js)`);
    if (paths.has('css/danoni_main.css')) links.push(`[🔴](${base}/css/danoni_main.css)`);
    return links.length ? ` ${links.join(' ')}` : '';
}

function renderEntry(ctx, platform, lang) {
    const { tag, base, date, target, bullets, contributors, relatedLine, facts } = ctx;
    const gh = platform === 'gh';
    const heading = `## ${tag} ([${date}](${GH}/releases/tag/${tag}))`;
    const dlRepo = gh ? 'danoniplus' : 'danonicw';
    const badge =
        `[![GitHub Releases (by Release)](${DL}/badge/danoniplus/${tag}/)](${DL}/${dlRepo}/${tag}/archive.zip) ` +
        `[![GitHub commits since tagged version (branch)](https://img.shields.io/github/commits-since/${REPO}/${tag}/${target}?style=social)]` +
        (gh ? `(${GH}/compare/${tag}...${target}#files_bucket)` : `(${GL}/-/compare/${tag}...${target})`);

    const lines = [];
    for (const section of ['new', 'improvements', 'bugfix']) {
        bullets[section].forEach((b) => {
            lines.push(bulletLine(b, section, ctx, platform, lang, b.text));
        });
    }

    const files = changedFileLinks(facts, tag, platform);
    const heart = contributors.length ? `<br>:heart: ${contributors.join(', ')}` : '';
    let quote;
    if (gh) {
        quote = [
            `> 📁 [**Tree**](${GH}/tree/${tag})`,
            `> / ↕️ [**Diffs**](${GH}/compare/${base}...${tag}#files_bucket) / ▶️ [**Preview**](${PREVIEW}/?v=${tag})`,
            `> / 📥 **Download** ( [zip](${DL}/danoniplus/${tag}/archive.zip) / [tar.gz](${DL}/danoniplus/${tag}/archive.tar.gz) )${files}`,
        ];
    } else {
        const d = `${DL}/danonicw/${tag}`;
        quote = [
            `> 📁 [**Tree**](${GL}/-/tree/${tag})`,
            `/ :arrow_up_down: [**Diffs**](${GL}/-/compare/${base}...${tag})`,
            `/ ▶️ [**Preview**](${PREVIEW}/?v=${tag}) ( [Mirror](${MIRROR}/?v=${tag}) ) / :inbox_tray: **Download** ( [zip](${d}/archive.zip) / [tar.gz](${d}/archive.tar.gz) / [tar.bz2](${d}/archive.tar.bz2) / [tar](${d}/archive.tar) )${files}`,
        ];
    }
    if (relatedLine) quote.push(relatedLine);
    quote[quote.length - 1] += heart;

    return [heading, ...(gh ? [''] : []), badge, '', ...lines, '', ...quote, ''].join('\n');
}

// ---------------------------------------------------------------- Files changed
/** Wiki 内リンクの基点。EN 版は v19 以降のページしか無いため、v18 以前は日本語版を参照する */
function wikiLink(page, ver, platform, lang) {
    if (lang === 'en' && majorOf(ver) < 19) return platform === 'gh' ? `${GH}/wiki/${page}` : `../Ja/${page}`;
    return `./${page}`;
}

const EXCLUDED_NAME = /^(legacy_functions\.js|danoni_setting.*)$/;

function renderFilesChanged(facts, ctx, platform, lang) {
    const fc = facts.filesChanged;
    const convertRow = (r) => {
        const names = r.names ?? [];
        if (names.some((n) => EXCLUDED_NAME.test(n)) || /danoni_setting/.test(r.nameCell)) return null;
        const bold = /^\*\*(v\d+\.\d+\.\d+)\*\*$/.exec(r.lastCell);
        let last;
        if (bold) {
            last = r.lastCell;
        } else {
            const v = /^\[(v\d+\.\d+\.\d+)\]/.exec(r.lastCell)?.[1];
            const date = v ? ctx.wiki.dateOf(v) : null;
            if (v && date) last = `[${v}](${wikiLink(ctx.wiki.pageOf(v), v, platform, lang)}#${anchorOf(v, date)})`;
            else {
                last = r.lastCell;
                review.push(`Files changed: ${r.nameCell} の最終更新 ${v ?? r.lastCell} の公開日が Wiki に見つかりません (Release へのリンクのまま出力)`);
            }
        }
        const dl = r.dlCell.replace(/:inbox_tray:/g, '📥');
        return `| ${r.dir} | ${r.nameCell} | ${dl} | ${last} |`;
    };
    const head = ['| Directory | FileName |  | Last Updated |', '| :--- | :--- | :--- | :--- |'];
    const main = fc.mainRows.map(convertRow).filter(Boolean);
    const ref = (fc.referenceRows ?? []).map(convertRow).filter(Boolean);
    const out = [`## 🔃 Files changed (${fc.major})`, '', ...head, ...main];
    if (ref.length) out.push('', '<details>', `<summary>Changed file list before ${fc.prevMajor}</summary>`, '', ...head, ...ref, '', '</details>');
    return `${out.join('\n')}\n`;
}

// ---------------------------------------------------------------- main
const o = parseArgs(process.argv.slice(2));
let facts;
try {
    facts = JSON.parse(fs.readFileSync(o.facts, 'utf8'));
} catch (e) {
    fail(`--facts を読めません: ${e.message}`);
}
if (facts.schema !== 1 || !facts.version || !facts.filesChanged) fail('release-facts.json の形式が想定と異なります (schema: 1)');
if (facts.version.majorBumped) {
    fail('メジャーバージョン更新のリリースは未対応です (Changelog-latest の archive と新ページ作成が必要)。手順を別途実施してください');
}
const body = fs.readFileSync(o.body, 'utf8');
const v = facts.version;
const latestMajor = detectLatestMajor(o.wikiDir, facts);
const wiki = makeWiki(o.wikiDir, latestMajor);
const sec = sectionsOf(body);

const bullets = {
    new: parseBullets(sec.get('⭐ New Features') ?? [], 'New Features'),
    improvements: parseBullets(sec.get('🛠️ Improvements'.replace(/️/g, '')) ?? [], 'Improvements'),
    bugfix: [],
};
bullets.bugfix = bindFixes(parseBullets(sec.get('🐞 Bug Fixes') ?? [], 'Bug Fixes'), facts.items, facts.fixCandidates);
const total = bullets.new.length + bullets.improvements.length + bullets.bugfix.length;
if (!total) fail('Release 本文に New Features / Improvements / Bug Fixes の項目がありません。公開済みの Release か確認してください');

// 貢献者 (Release 本文が正)
const contributors = (sec.get('❤ Contributors') ?? [])
    .map(({ line }) => /^- (.+)$/.exec(line.trim())?.[1]?.trim())
    .filter(Boolean);

// 関連リリース (Release 本文に節がある場合のみ)
let relatedLine = null;
let group = [];
const relatedLines = sec.get('🎣 Related Releases');
if (relatedLines) {
    const members = new Set();
    for (const { line } of relatedLines) {
        if (!/^ {0,3}[-*][ \t]+/.test(line)) continue;
        const tags = [...line.split('<-')[0].matchAll(/\[(v\d+\.\d+\.\d+)\]/g)].map((m) => m[1]);
        for (const tag of tags) members.add(tag);
    }
    group = [...members].sort(cmpVer);
    const newest = group[group.length - 1];
    if (newest && newest !== v.tag) {
        const d = wiki.dateOf(newest) ?? releaseDate(newest);
        if (d) relatedLine = `> / 🎣 [**${newest}**](./${wiki.pageOf(newest)}#${anchorOf(newest, d)})`;
        else review.push(`関連リリース ${newest} の公開日が分かりません。🎣 行を出力していません (${newest} の Changelog 作成後に再実行して追記してください)`);
    }
}

const ctx = {
    tag: v.tag,
    base: v.base,
    date: o.date,
    target: v.targetBranch,
    bullets,
    contributors,
    relatedLine,
    facts,
    wiki,
};

fs.mkdirSync(o.outDir, { recursive: true });

const outputs = { 'gh-ja': ['gh', 'ja'], 'gh-en': ['gh', 'en'], 'gl-ja': ['gl', 'ja'], 'gl-en': ['gl', 'en'] };
for (const [name, [platform, lang]] of Object.entries(outputs)) {
    fs.writeFileSync(path.join(o.outDir, `${name}.md`), renderEntry(ctx, platform, lang));
    fs.writeFileSync(path.join(o.outDir, `files-changed-${name}.md`), renderFilesChanged(facts, ctx, platform, lang));
}

const meta = {
    tag: v.tag,
    major: v.major,
    page: v.wikiPage,
    date: o.date,
    latestMajor,
    group,
    newestOfGroup: group[group.length - 1] ?? null,
    relatedLine,
    // 最新版の Changelog を作ったとき、🎣 が未設定のサポート版へ追記する対象
    backfill: group.length && group[group.length - 1] === v.tag ? group.filter((g) => g !== v.tag) : [],
    needsReview: review,
};
fs.writeFileSync(path.join(o.outDir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);

const md = [
    `## Changelog 下書き: ${v.tag}`,
    '',
    `出力: ${o.outDir}/ (${Object.keys(outputs).join(', ')} と files-changed-*.md)`,
    ...(review.length ? ['', '### 要確認', ...[...new Set([...(facts.needsReview ?? []).filter((r) => /severity|重要度|原因/.test(r.message)).map((r) => `[${r.where}] ${r.message}`), ...review])].map((n) => `- ${n}`)] : []),
].join('\n');
console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md}\n`);