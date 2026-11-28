#!/usr/bin/env node
/**
 * .github/scripts/render-release-notes.mjs
 *
 * collect-release-facts.mjs が出力した release-facts.json から、Release Notes 本文 (Markdown) を組み立てる。
 * テンプレート・リンク・表・Remarks の転記はすべて決定的に生成し、LLM は使わない。
 * 箇条書きの文言の言い換え・項目の統合だけは、任意の --bullets ファイルで差し替えられる
 * (生成は .github/prompts/release-bullets.md を参照)。指定が無ければ PR 見出しをそのまま使う。
 *
 * 使い方:
 *   node .github/scripts/render-release-notes.mjs --facts release-facts.json [--bullets release-bullets.json] \
 *        [--date 2026-11-27] [--out release-notes.md]
 *
 * --date は Changelog のアンカー (#v5340-2026-11-27) に使う公開日。省略時は実行日 (JST)。
 *         公開日が実行日と異なる場合は必ず指定すること。
 *
 * --bullets の形式 (項目 id は release-facts.json の items[].id):
 *   [{ "category": "improvements", "text": "…", "items": ["2333-1", "2334-1"], "remarksTitle": "(省略可)" }]
 *   - 参照した項目は既定の箇条書きの代わりに、この 1 行にまとめて出力する (PR 番号は自動で並記)
 *   - 参照されない項目は既定どおり出力する
 *
 * Bug Fixes の箇条書き末尾には照合用の項目 ID を HTML コメントとして残す。
 *
 * 出力に含めない確認事項は標準出力の「要確認」に出す。
 */
import fs from 'node:fs';

const MAINTAINER_REPO = 'cwtickle/danoniplus';
const DOCS_REPO = 'cwtickle/danoniplus-docs';
const DL = 'https://dl-danoniplus.qu7-52m.workers.dev';

const review = [];

function fail(msg) {
    console.error(`::error::${msg}`);
    process.exit(1);
}

// ---------------------------------------------------------------- 引数
function parseArgs(argv) {
    const o = { out: 'release-notes.md' };
    const valued = { '--facts': 'facts', '--bullets': 'bullets', '--date': 'date', '--out': 'out' };
    for (let i = 0; i < argv.length; i++) {
        const key = valued[argv[i]];
        if (!key) fail(`未知の引数: ${argv[i]}`);
        o[key] = argv[++i];
    }
    if (!o.facts) fail('--facts を指定してください');
    if (!o.date) o.date = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(o.date)) fail(`--date は YYYY-MM-DD 形式で指定してください (指定値: ${o.date})`);
    return o;
}

// ---------------------------------------------------------------- 箇条書き・Remarks の組み立て
const CATEGORIES = ['new', 'improvements', 'bugfix', 'chores'];

const prNote = (prs) => `( PR ${[...new Set(prs)].sort((a, b) => a - b).map((n) => `#${n}`).join(', ')} )`;

function buildEntries(items, overrides) {
    const ordered = [...items].sort((a, b) => a.pr - b.pr || a.num - b.num);
    const byId = new Map(ordered.map((i) => [i.id, i]));
    const claimed = new Map(); // 項目 id -> override
    for (const ov of overrides) {
        if (!CATEGORIES.includes(ov.category) || typeof ov.text !== 'string' || !ov.text.trim() ||
            !Array.isArray(ov.items) || !ov.items.length) fail(`--bullets の項目が不正です: ${JSON.stringify(ov)}`);
        for (const id of ov.items) {
            if (!byId.has(id)) fail(`--bullets に存在しない項目 id があります: ${id}`);
            if (claimed.has(id)) fail(`--bullets で項目 ${id} が複数の行に指定されています`);
            claimed.set(id, ov);
        }
    }

    const entries = Object.fromEntries(CATEGORIES.map((c) => [c, []]));
    const emitted = new Set();
    for (const item of ordered) {
        const ov = claimed.get(item.id);
        if (ov) {
            if (emitted.has(ov)) continue;
            emitted.add(ov);
            const members = ov.items.map((id) => byId.get(id));
            entries[ov.category].push({
                text: ov.text.trim(),
                prs: members.map((m) => m.pr),
                bodies: members.map((m) => m.body),
                remarksTitle: (ov.remarksTitle ?? ov.text).trim(),
                items: members,
            });
            continue;
        }
        let category = item.category;
        let text = item.title;
        if (category === 'unknown') {
            category = 'improvements';
            text += ' <!-- 要確認: 分類(feat/improve/fix/chore)が不明です -->';
        }
        entries[category].push({ text, prs: [item.pr], bodies: [item.body], remarksTitle: item.title, items: [item] });
    }
    return entries;
}

// ---------------------------------------------------------------- Markdown の部品
/** 内容があれば有効、無ければ見出しごとコメントアウトした節を返す */
function section({ comment, heading, body }) {
    const lines = [];
    if (comment) lines.push(`<!-- ${comment} -->`);
    if (body.length) lines.push(heading, ...body);
    else lines.push('<!--', heading, '-->');
    return lines.join('\n');
}

function bulletList(entries, includeFixIds = false) {
    return entries.map((e) => {
        const ids = e.items.filter((item) => item.fix).map((item) => item.id);
        const credit = includeFixIds ? ` <!-- fix-items: ${ids.join(', ')} -->` : '';
        return `- ${e.text} ${prNote(e.prs)}${credit}`;
    });
}

function buildRemarks(entries) {
    const blocks = [];
    for (const category of ['new', 'improvements', 'bugfix']) {
        for (const e of entries[category]) {
            const body = e.bodies.map((b) => (b ?? '').trim()).filter(Boolean).join('\n\n');
            if (!body) continue;
            blocks.push(`### ${blocks.length + 1}. ${e.remarksTitle}\n${body}`);
        }
    }
    return blocks;
}

// ---------------------------------------------------------------- 本文
function render(facts, o, overrides) {
    const v = facts.version;
    const tag = v.tag;
    const major = v.major; // 例: v53
    const latest = v.isLatestMajor;
    const wiki = v.wikiPage;
    const anchor = `${tag.replace(/\./g, '')}-${o.date}`;
    const gh = `https://github.com/${MAINTAINER_REPO}`;
    const target = v.targetBranch;

    const entries = buildEntries(facts.items, overrides);

    const header = [
        `Changelog: [**English**](https://github.com/${DOCS_REPO}/wiki/${wiki}) | [**Japanese**](${gh}/wiki/${wiki})`,
        '',
        (latest
            ? `[![GitHub Releases (by Release)](${DL}/badge/danoniplus/${tag}/)](${DL}/danoniplus/${tag}/archive.zip)`
            : `[![support](https://img.shields.io/badge/support-${major}-lightgray)](${DL}/danoniplus/${tag}/archive.zip)`) +
        `  [![GitHub commits since tagged version (branch)](https://img.shields.io/github/commits-since/${MAINTAINER_REPO}/${tag}/${target}?style=social)](${gh}/wiki/${wiki}#${anchor})`,
        '',
        '▼ 更新用ファイルは下記 Files changed より  ',
        `▼ [本体更新方法](${gh}/wiki/HowToUpdate) / [サポートバージョン](${gh}/security/policy) / [ソース構成](${gh}/wiki/AboutSource) / [譜面の作成概要](${gh}/wiki/HowtoMake)  `,
        `▼ [要望・不具合報告](${gh}/blob/develop/.github/CONTRIBUTING.md) ( [Discord](https://discord.gg/5sTXnVag77) )  `,
        '',
        `### [${v.base}](${gh}/releases/tag/${v.base}) [-> ${tag}](${gh}/compare/${v.base}...${tag}#files_bucket) ` +
        `( [vs. latest ${major}](${gh}/compare/${tag}...${target}#files_bucket) ) [📁](${gh}/tree/${tag}) [▶️](https://danonicw.skr.jp/?v=${tag})`,
        '',
    ];

    if (facts.warning) {
        review.push('Release PR 本文に Warning 欄が検出されました。Release Notes 内の配置位置を確認してください (ヘッダー直後に出力しています)');
        header.push('## ⚠️ Warning', facts.warning.trim(), '');
    }

    const download =
        `[![Download](${DL}/dl-button/danoniplus/${tag})](${DL}/danoniplus/${tag}/archive.zip) ` +
        `[![Download](${DL}/dl-button/danoniplus/${tag}?ext=tar.gz)](${DL}/danoniplus/${tag}/archive.tar.gz)`;

    const docLines = [...new Set((facts.documentation ?? []).map((d) => d.line))];
    const contributors = (facts.contributors ?? []).map((c) => `- ${c.login}`);
    const remarks = buildRemarks(entries);
    const related = facts.relatedReleases;

    // Remarks は見出し直後に本文(項目ごとの ### 見出し)を続ける
    const remarksBlock = remarks.length
        ? `<!-- 今回の更新の補足事項 -->\n## 🍀 Remarks\n${remarks.join('\n\n')}`
        : '<!-- 今回の更新の補足事項 -->\n<!--\n## 🍀 Remarks\n-->';

    const details = [
        section({ comment: '機能追加', heading: '## ⭐ New Features', body: bulletList(entries.new) }),
        section({ comment: '機能追加以外の改善内容', heading: '## 🛠️ Improvements', body: bulletList(entries.improvements) }),
        section({ comment: '不具合修正', heading: '## 🐞 Bug Fixes', body: bulletList(entries.bugfix, true) }),
        section({ heading: '## 📝 Chores', body: bulletList(entries.chores) }),
        section({ comment: '今回更新したWikiドキュメントへのリンク', heading: '## 📔 Documentation', body: docLines }),
        facts.rendered.functionsVariables,
        section({ comment: '今回の更新に貢献した方', heading: '## ❤️ Contributors', body: contributors }),
        remarksBlock,
        section({ comment: '関連更新情報', heading: '## 🎣 Related Releases', body: related.show ? related.lines.map((l) => `- ${l}`) : [] }),
        `<!-- 直近の更新 -->\n${facts.rendered.recentChanges}`,
    ];
    const out = [
        ...header,
        '<!-- 変更ファイル一覧 -->',
        facts.rendered.filesChanged,
        '',
        download,
        '',
        '<details open>',
        '<summary>Details (詳細)</summary>',
        '',
        details.join('\n\n'),
        '</details>',
        '',
    ].join('\n');

    // ---- 確認事項
    review.push(`Changelog のアンカーに使う公開日は ${o.date} です。実際の公開日が異なる場合は --date で指定して再生成してください`);
    if (facts.items.some((i) => i.category === 'unknown')) review.push('分類不明の項目を Improvements に仮置きしました (本文中の「要確認」コメントを確認)');
    const remarksCount = remarks.length;
    const listed = ['new', 'improvements', 'bugfix'].reduce((n, c) => n + entries[c].length, 0);
    if (remarksCount < listed) review.push(`Remarks は本文のある項目のみ出力しています (${remarksCount}/${listed} 項目)。本文が空の項目を補足するか確認してください`);
    if (entries.chores.some((e) => e.bodies.some((b) => (b ?? '').trim()))) review.push('Chores の項目は Remarks に出力していません');
    return out;
}

// ---------------------------------------------------------------- main
const o = parseArgs(process.argv.slice(2));
let facts;
try {
    facts = JSON.parse(fs.readFileSync(o.facts, 'utf8'));
} catch (e) {
    fail(`--facts を読めません: ${e.message}`);
}
if (facts.schema !== 1 || !facts.version || !facts.rendered) fail('release-facts.json の形式が想定と異なります (schema: 1)');
let overrides = [];
if (o.bullets) {
    try {
        overrides = JSON.parse(fs.readFileSync(o.bullets, 'utf8'));
    } catch (e) {
        fail(`--bullets を読めません: ${e.message}`);
    }
    if (!Array.isArray(overrides)) fail('--bullets は配列で指定してください');
}

const body = render(facts, o, overrides);
fs.writeFileSync(o.out, body);

const needs = [...(facts.needsReview ?? []).map((r) => `[${r.where}] ${r.message}`), ...review];
const md = [`## Release Notes 下書き: ${facts.version.tag}`, '', `出力: ${o.out}`, ...(needs.length ? ['', '### 要確認', ...needs.map((n) => `- ${n}`)] : [])].join('\n');
console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md}\n`);
