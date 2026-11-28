#!/usr/bin/env node
/**
 * .github/scripts/collect-release-facts.mjs
 *
 * Release Notes / Changelog の下書きに必要な「事実」を、LLM を使わずに収集して JSON にまとめる。
 * 文章の生成(箇条書き文言・英訳など)は後段で行い、ここでは決定的に決まるものだけを扱う。
 * 人の判断が必要な箇所は needsReview に理由付きで列挙する (推測で埋めない)。
 *
 * 使い方:
 *   node .github/scripts/collect-release-facts.mjs --tag v53.4.0 --base v53.3.2 [--out release-facts.json]
 *
 * 必要な環境 (Actions 上): fetch-depth: 0 / fetch-tags: true、GH_TOKEN (gh api を使用)
 *
 * サポート版 (過去メジャー) の指定:
 *   --pr-spec "2333:2+3,2340"  対象の PR と項目番号 ("PR番号:項目番号+項目番号" をカンマ区切り)。
 *     項目番号を省略した PR は全項目が対象。項目番号は PR 本文の「### N.」の N。
 *     サポート版は develop の PR を丸ごと取り込まない/cherry-pick できない場合があるため必須
 *     (未指定ならスキップして何も出力しない)。最新版でも指定すれば git log からの検出より優先する。
 *
 * テスト用オプション (API を呼ばずに固定データで実行):
 *   --prs-dir <dir>     <dir>/<番号>.json (GitHub REST の pulls レスポンス形式) を PR 情報として使う
 *   --prev-body <file>  前回リリース(base)の Release 本文として使う
 *   --releases-file <file> 公開済み Release のタグ一覧(1行1タグ)として使う
 *   --pr-numbers 1,2    git log からの PR 番号検出の代わりに指定する
 *   --releases-json <file>  直近の Release 一覧(GitHub REST の releases レスポンス形式, 新しい順)。Backport の自動検出に使う
 *   --repo <owner/name> 既定: $GITHUB_REPOSITORY または cwtickle/danoniplus
 *
 * 出力 (主なキー):
 *   version / date / prs / items / fixCandidates / filesChanged / functionsVariables / recentChanges /
 *   relatedReleases / contributors / documentation / warning / needsReview / rendered
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { markdownLines } from './release-markdown.mjs';
import { changedZipGroups, SINGLE_RULES, TAG_RE } from './release-config.mjs';

const DL_BASE = 'https://dl-danoniplus.qu7-52m.workers.dev/danoniplus';

// ---------------------------------------------------------------- 共通
const needsReview = [];
const review = (where, message) => needsReview.push({ where, message });

function fail(msg) {
    console.error(`::error::${msg}`);
    process.exit(1);
}

function git(args, { buffer = false } = {}) {
    return execFileSync('git', args, {
        encoding: buffer ? 'buffer' : 'utf8',
        maxBuffer: 512 * 1024 * 1024,
        stdio: ['ignore', 'pipe', 'pipe'],
    });
}

function gh(args) {
    return execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
}

const parseVer = (v) => v.replace(/^v/, '').split('.').map(Number);
const cmpVer = (a, b) => {
    const x = parseVer(a);
    const y = parseVer(b);
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
    return 0;
};
const releaseUrl = (repo, v) => `https://github.com/${repo}/releases/tag/${v}`;

// ---------------------------------------------------------------- 引数
function parseArgs(argv) {
    const o = { out: 'release-facts.json', repo: process.env.GITHUB_REPOSITORY || 'cwtickle/danoniplus' };
    const valued = {
        '--tag': 'tag', '--base': 'base', '--out': 'out', '--repo': 'repo', '--owner': 'owner',
        '--prs-dir': 'prsDir', '--prev-body': 'prevBody', '--releases-file': 'releasesFile', '--pr-numbers': 'prNumbers', '--pr-spec': 'prSpec', '--releases-json': 'releasesJson',
    };
    for (let i = 0; i < argv.length; i++) {
        const key = valued[argv[i]];
        if (!key) fail(`未知の引数: ${argv[i]}`);
        o[key] = argv[++i];
    }
    if (!TAG_RE.test(o.tag ?? '')) fail(`--tag は vX.Y.Z 形式で指定してください (指定値: ${o.tag})`);
    if (!TAG_RE.test(o.base ?? '')) fail(`--base は vX.Y.Z 形式で指定してください (指定値: ${o.base})`);
    if (o.tag === o.base) fail('--tag と --base が同じです');
    if (!/^[\w.-]+\/[\w.-]+$/.test(o.repo)) fail(`--repo の形式が不正です: ${o.repo}`);
    o.owner ??= o.repo.split('/')[0];
    return o;
}

// ---------------------------------------------------------------- バージョン情報
/**
 * 公開済み Release のタグ一覧。git のタグではなく Release を使う理由:
 * 欠番(タグはあるが Release を公開しなかったバージョン)を Recent Changes で飛ばすため。
 * 処理中のタグ自身はドラフト状態の可能性があるので必ず含める。
 */
function listTags(o) {
    let raw;
    if (o.releasesFile) raw = fs.readFileSync(o.releasesFile, 'utf8');
    else {
        try {
            raw = gh(['api', '--paginate', `repos/${o.repo}/releases?per_page=100`, '--jq', '.[] | select(.draft == false) | .tag_name']);
        } catch (e) {
            fail(`Release の一覧を取得できませんでした\n${String(e.stderr ?? e.message).trim()}`);
        }
    }
    const tags = new Set(raw.split('\n').map((s) => s.trim()).filter((t) => TAG_RE.test(t)));
    tags.add(o.tag);
    return [...tags].sort(cmpVer);
}

function versionInfo(o, allTags) {
    const major = parseVer(o.tag)[0];
    const baseMajor = parseVer(o.base)[0];
    const latestMajor = Math.max(...allTags.map((t) => parseVer(t)[0]));
    const isLatestMajor = major === latestMajor;
    const iso = git(['log', '-1', '--format=%cI', o.tag]).trim();
    const jst = new Date(new Date(iso).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    return {
        tag: o.tag,
        base: o.base,
        major: `v${major}`,
        prevMajor: `v${major - 1}`,
        majorBumped: baseMajor !== major,
        isLatestMajor,
        targetBranch: isLatestMajor ? 'master' : `support/v${major}`,
        wikiPage: isLatestMajor ? 'Changelog-latest' : `Changelog-v${major}`,
        tagDate: jst,
        tagDateNote: 'タグのコミット日時(JST)。Changelog に使う公開日は Release の公開日を優先すること',
    };
}

// ---------------------------------------------------------------- PR の収集
/** "2333:2+3,2340" -> Map(2333 => Set{2,3}, 2340 => null(全項目)) */
function parsePrSpec(spec) {
    const map = new Map();
    for (const tok of spec.split(/[,\s]+/).filter(Boolean)) {
        const m = tok.match(/^#?(\d+)(?::(\d+(?:\+\d+)*))?$/);
        if (!m) fail(`--pr-spec を解釈できません: "${tok}" (例: 2333:2+3,2340)`);
        const n = Number(m[1]);
        if (map.has(n)) fail(`--pr-spec に PR #${n} が重複しています`);
        map.set(n, m[2] ? new Set(m[2].split('+').map(Number)) : null);
    }
    if (map.size === 0) fail('--pr-spec が空です');
    return map;
}

function detectPrNumbers(o) {
    if (o.prSpec) return [...parsePrSpec(o.prSpec).keys()];
    if (o.prNumbers) return o.prNumbers.split(',').map((s) => Number(s.trim())).filter(Boolean);
    const log = git(['log', '--format=%s%x00', `${o.base}..${o.tag}`]);
    const nums = new Set();
    for (const subject of log.split('\0').map((s) => s.trim()).filter(Boolean)) {
        const m1 = subject.match(/^Merge pull request #(\d+)/);
        const m2 = subject.match(/\(#(\d+)\)\s*$/);
        if (m1) nums.add(Number(m1[1]));
        else if (m2) nums.add(Number(m2[1]));
    }
    return [...nums];
}

function fetchPr(o, n) {
    if (o.prsDir) {
        const f = path.join(o.prsDir, `${n}.json`);
        if (!fs.existsSync(f)) fail(`PR #${n} の固定データがありません: ${f}`);
        return JSON.parse(fs.readFileSync(f, 'utf8'));
    }
    try {
        return JSON.parse(gh(['api', `repos/${o.repo}/pulls/${n}`]));
    } catch (e) {
        return fail(`PR #${n} の本文を取得できませんでした。推測で要約しないため中止します\n${String(e.stderr ?? e.message).trim()}`);
    }
}

function normalizePr(raw, repo) {
    return {
        number: raw.number,
        title: raw.title ?? '',
        body: raw.body ?? '',
        url: raw.html_url ?? `https://github.com/${repo}/pull/${raw.number}`,
        author: raw.user?.login ?? '',
        authorIsBot: raw.user?.type === 'Bot' || /\[bot\]$/.test(raw.user?.login ?? ''),
        labels: (raw.labels ?? []).map((l) => (typeof l === 'string' ? l : l.name)),
        mergedAt: raw.merged_at ?? null,
    };
}

function collectPrs(o) {
    const found = detectPrNumbers(o).map((n) => normalizePr(fetchPr(o, n), o.repo));
    const all = new Map(found.map((p) => [p.number, p]));
    const releasePrs = found.filter((p) => /^\[ver\d/i.test(p.title));

    // リリースPR本文に列挙された子PR (`- #1234`) を追加で取得
    for (const rp of releasePrs) {
        for (const { line, outsideFence } of markdownLines(stripComments(rp.body))) {
            const m = outsideFence && line.match(/^ {0,3}-[ \t]+#(\d+)[ \t]*$/);
            if (!m) continue;
            const n = Number(m[1]);
            if (!all.has(n) && n !== rp.number) all.set(n, normalizePr(fetchPr(o, n), o.repo));
        }
    }
    const releaseNums = new Set(releasePrs.map((p) => p.number));
    const prs = [...all.values()].filter((p) => !releaseNums.has(p.number)).sort((a, b) => a.number - b.number);
    if (prs.length === 0) review('prs', '対象範囲に PR が見つかりませんでした');
    return { prs, releasePrs };
}

// ---------------------------------------------------------------- PR 本文の解析
function stripComments(s) {
    let prev;
    let cur = s;
    do {
        prev = cur;
        cur = cur.replace(/<!--[\s\S]*?-->/g, '');
    } while (cur !== prev);
    return cur;
}

function splitSections(body, level = 2) {
    const heading = new RegExp(`^ {0,3}#{${level}}[ \t]+(.*)$`);
    const sections = [];
    let current;
    for (const { line, outsideFence } of markdownLines(body)) {
        const match = outsideFence && line.match(heading);
        if (match) {
            current = { title: match[1].trim(), lines: [] };
            sections.push(current);
        } else current?.lines.push(line);
    }
    return sections.map(({ title, lines }) => ({ title, content: lines.join('\n') }));
}

const findSection = (sections, re) => sections.find((s) => re.test(s.title))?.content.trim() ?? '';

const TYPE_RE = /^(feat|improve|refactor|fix|chore|docs?)(?:\([^)]*\))?[ \t]*[:：][ \t]*(.+)$/i;
const CATEGORY = { feat: 'new', improve: 'improvements', refactor: 'improvements', fix: 'bugfix', chore: 'chores', doc: 'chores', docs: 'chores' };
const vers = (s) => [...new Set([...(s.match(/v?\d+\.\d+\.\d+/g) ?? [])].map((v) => (v.startsWith('v') ? v : `v${v}`)))].sort(cmpVer).reverse();

/** 不具合修正の項目に書かれたメタ情報行を取り出し、本文からは除く */
function extractFixMeta(body) {
    const meta = { severity: null, origins: [], originInitial: false, backports: [] };
    const lines = [...markdownLines(body)].filter(({ line, outsideFence }) => {
        if (!outsideFence) return true;
        let m = line.match(/^\s*[-*]\s*(?:重要度|Severity)[^:：\n]*[:：]\s*(.*)$/i);
        if (m) {
            meta.severity = m[1].match(/\b([ABC])\b/i)?.[1].toUpperCase() ?? null;
            return false;
        }
        m = line.match(/^\s*[-*]\s*(?:原因バージョン|Origin)[^:：\n]*[:：]\s*(.*)$/i);
        if (m) {
            meta.origins = vers(m[1]);
            meta.originInitial = /initial/i.test(m[1]);
            return false;
        }
        m = line.match(/^\s*[-*]\s*(?:他バージョン適用|Backport)[^:：\n]*[:：]\s*(.*)$/i);
        if (m) {
            meta.backports = vers(m[1]);
            return false;
        }
        return true;
    });
    return { meta, body: lines.map(({ line }) => line).join('\n').trim() };
}

function parseItems(pr, only = null) {
    const sections = splitSections(stripComments(pr.body));
    const details = findSection(sections, /変更内容|Details of Changes/i);
    const items = [];
    const fixCandidates = [];
    const seen = new Set();
    let ordinal = 0;
    for (const { title: rawHeading, content } of splitSections(details, 3)) {
        const headingText = rawHeading.replace(/^\d+\.[ \t]*/, '').trim();
        if (!headingText) continue; // 未記入のテンプレート項目
        ordinal++;
        const num = Number(rawHeading.match(/^(\d+)\./)?.[1] ?? ordinal);
        const m = headingText.match(TYPE_RE);
        const type = m ? m[1].toLowerCase() : null;
        const title = (m ? m[2] : headingText).trim();
        const id = `${pr.number}-${num}`;
        if (type === 'fix') fixCandidates.push({ pr: pr.number, id });
        if (only && !only.has(num)) continue; // --pr-spec で対象外の項目
        seen.add(num);
        const { meta, body } = type === 'fix' ? extractFixMeta(content) : { meta: null, body: content.trim() };
        const item = {
            id,
            pr: pr.number,
            num,
            rawHeading,
            type,
            category: type ? CATEGORY[type] : 'unknown',
            title,
            body,
            fix: type === 'fix' ? meta : null,
        };
        if (!type) review(`PR #${pr.number}`, `見出し「${title}」に分類の接頭辞(feat:/improve:/refactor:/fix:/chore:)がありません`);
        if (type === 'fix') {
            if (!meta.severity) review(`PR #${pr.number}`, `不具合修正「${title}」に重要度(A/B/C)の記載がありません`);
            if (!meta.origins.length && !meta.originInitial) review(`PR #${pr.number}`, `不具合修正「${title}」に原因バージョンの記載がありません (既に公開済みの不具合でなければ improve に分類)`);
        }
        items.push(item);
    }
    for (const n of only ?? []) if (!seen.has(n)) review(`PR #${pr.number}`, `--pr-spec で指定された項目 ${n} が PR 本文に見つかりません`);
    if (items.length === 0) review(`PR #${pr.number}`, '「変更内容」に項目(### N. 見出し)が見つかりませんでした');

    const wiki = findSection(sections, /Wiki|ドキュメント|Documentation/i)
        .split('\n').map((l) => l.trim()).filter((l) => /^[-*]\s+\S/.test(l) || /https?:\/\//.test(l));
    return {
        items,
        fixCandidates,
        wiki,
        otherComments: findSection(sections, /その他コメント|Other Comments/i),
    };
}

// ---------------------------------------------------------------- Files changed
const filesHeaderMain = '|フォルダ<br>Directory|ファイル名<br>FileName||最終更新<br>Last Updated|\n|----|----|----|----|';
const filesHeaderRef = '|フォルダ|ファイル名||最終更新|\n|----|----|----|----|';
const DEFAULT_PREAMBLE = [
    '- danoni_setting.js の変更は、追加した設定を使用しない限り、更新不要です。',
    '- legacy_functions.js は過去関数群です。',
];

function parseTable(block) {
    const lines = [...markdownLines(block)].map(({ line, outsideFence }) => outsideFence ? line.trim() : '');
    const first = lines.findIndex((line) => line.startsWith('|'));
    if (first < 0) return null;
    const cells = (line) => line?.startsWith('|') ? line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()) : [];
    const header = cells(lines[first]);
    const separator = cells(lines[first + 1]);
    if (header.length !== 4 || !header[0] || !header[1] || !header[3] ||
        separator.length !== 4 || !separator.every((cell) => /^:?-{3,}:?$/.test(cell))) return null;

    const rows = [];
    let end = first + 2;
    for (; lines[end]?.startsWith('|'); end++) {
        const values = cells(lines[end]);
        if (values.length !== 4 || !values[0] || !values[1]) return null;
        const [dir, nameCell, dlCell, lastCell] = values;
        const linkText = nameCell.match(/^\[(.*?)\]\(.*\)$/)?.[1];
        rows.push({ dir, nameCell, names: (linkText ?? nameCell).split(/<br\s*\/?>/).map((s) => s.trim()), dlCell, lastCell });
    }
    if (lines.slice(end).some((line) => line.startsWith('|'))) return null;
    return { start: first, rows };
}

function parsePreviousFilesChanged(body) {
    const section = splitSections(body).find(({ title }) => /^🔃[ \t]*Files changed(?:[ \t(]|$)/.test(title));
    if (!section) return null;
    const lines = [...markdownLines(section.content)];
    const detailsAt = lines.findIndex(({ line, outsideFence }) => outsideFence && line.trim() === '<details>');
    const detailsEnd = lines.findIndex(({ line, outsideFence }, i) => i > detailsAt && outsideFence && line.trim() === '</details>');
    if (detailsAt < 0 || detailsEnd < 0) return null;
    const mainLines = lines.slice(0, detailsAt).map(({ line }) => line);
    const main = parseTable(mainLines.join('\n'));
    const reference = parseTable(lines.slice(detailsAt + 1, detailsEnd).map(({ line }) => line).join('\n'));
    if (!main || !reference) return null;
    const preamble = mainLines.slice(0, main.start).map((line) => line.trimEnd()).filter(Boolean);
    return { preamble: preamble.length ? preamble : DEFAULT_PREAMBLE, mainRows: main.rows, referenceRows: reference.rows };
}

const boldToLink = (cell, repo) => {
    const m = cell.match(/^\*\*(v\d+\.\d+\.\d+)\*\*$/);
    return m ? `[${m[1]}](${releaseUrl(repo, m[1])})` : cell;
};
const rowMatches = (row, hit) => {
    const linkedZip = row.dlCell.match(/\/([^/()]+\.zip)\)/)?.[1];
    if (linkedZip) return linkedZip === hit.asset;
    if (hit.group) {
        return [...(hit.group.previousFiles ?? []), ...hit.group.files].some((file) =>
            row.dir === `/${path.posix.dirname(file)}` && row.names.includes(path.posix.basename(file)));
    }
    return row.dir === hit.row.dir && hit.row.names.some((n) => row.names.includes(n));
};

function buildFilesChanged(o, ver, changes, prevBody) {
    const prev = parsePreviousFilesChanged(prevBody);
    if (!prev) fail(`前回リリース ${o.base} の本文から Files changed 表を読み取れませんでした。表の整合性を確認できないため中止します`);

    // 変更のあった配布ファイル -> 行
    const hits = [];
    for (const { status, path: p } of changes) {
        if (status === 'D') continue;
        const rule = SINGLE_RULES.find((r) => r.test(p));
        if (rule) hits.push({ asset: rule.name(p), row: rule.row(p), path: p });
    }
    for (const group of changedZipGroups(git, o.base, o.tag, changes)) {
        const file = group.files[0];
        hits.push({ asset: group.asset, row: { dir: `/${path.posix.dirname(file)}` }, path: file, group });
    }

    const hitForRow = (row) => hits.find((hit) => rowMatches(row, hit));

    const refresh = (row, { asset, group, row: hitRow }) => {
        const out = { ...row, dlCell: `[:inbox_tray:](${DL_BASE}/${o.tag}/${asset})`, lastCell: `**${o.tag}**` };
        const compareText = row.nameCell.match(/^\[(.*)\]\(.*compare.*\)$/)?.[1];
        if (group?.membershipChanged) {
            out.dir = hitRow.dir;
            out.names = group.files.map((file) => path.posix.basename(file));
            if (JSON.stringify([...row.names].sort()) !== JSON.stringify([...out.names].sort())) {
                out.nameCell = out.names.join('<br>');
            }
        }
        if (compareText) {
            const text = out.nameCell === row.nameCell ? compareText : out.nameCell;
            out.nameCell = `[${text}](https://github.com/${o.repo}/compare/${o.base}...${o.tag}#files_bucket)`;
            review('filesChanged', `${text} の比較リンクを ${o.base}...${o.tag} に更新しました。範囲が正しいか確認してください`);
        }
        return out;
    };
    const demote = (row) => ({ ...row, lastCell: boldToLink(row.lastCell, o.repo) });

    let main = [];
    let reference = [];
    for (const row of prev.mainRows) {
        const hit = hitForRow(row);
        if (hit) main.push(refresh(row, hit));
        else if (ver.majorBumped) reference.push(demote(row)); // メジャー更新: 未更新のメイン枠は参考枠へ
        else main.push(demote(row));
    }
    if (ver.majorBumped) review('filesChanged', `メジャー更新: 未更新のメイン枠の行を参考枠へ移しました (${ver.prevMajor}以前の枠内の並び順を確認してください)`);
    const movedIn = [];
    for (const row of prev.referenceRows) {
        const hit = hitForRow(row);
        if (hit) {
            movedIn.push(refresh(row, hit));
            review('filesChanged', `参考枠からメイン枠へ移動: ${row.names.join(', ')} (メイン枠内の並び順を確認してください)`);
        } else reference.push(row);
    }
    // 移動してきた行は、同じフォルダの最後の行の後ろ (無ければ末尾) に置く
    for (const row of movedIn) {
        const last = main.map((r) => r.dir).lastIndexOf(row.dir);
        main.splice(last >= 0 ? last + 1 : main.length, 0, row);
    }
    // どの行にも対応しない配布ファイル -> 新規行
    const known = [...prev.mainRows, ...prev.referenceRows];
    const missing = new Map();
    for (const hit of hits) {
        if (!known.some((row) => rowMatches(row, hit)) && !missing.has(hit.asset)) missing.set(hit.asset, hit);
    }
    for (const h of missing.values()) {
        const names = (h.group?.files ?? [h.path]).map((file) => path.posix.basename(file));
        main.push({
            dir: h.row.dir,
            nameCell: names.join('<br>'),
            names,
            dlCell: `[:inbox_tray:](${DL_BASE}/${o.tag}/${h.asset})`,
            lastCell: `**${o.tag}**`,
        });
        review('filesChanged', `Files changed 表に行が無いファイルを追加しました: ${h.path}`);
    }

    const renderRows = (rows) => rows.map((r) => `|${r.dir}|${r.nameCell}|${r.dlCell}|${r.lastCell}|`).join('\n');
    const markdown = [
        `## 🔃 Files changed (${ver.major})`,
        '',
        ...prev.preamble,
        '',
        filesHeaderMain,
        renderRows(main),
        '',
        '<details>',
        `<summary>（参考）${ver.prevMajor}以前の差分ファイル一覧</summary>`,
        '',
        filesHeaderRef,
        renderRows(reference),
        '',
        '</details>',
    ].join('\n');

    return { major: ver.major, prevMajor: ver.prevMajor, mainRows: main, referenceRows: reference, markdown };
}

// ---------------------------------------------------------------- Functions & Variables
const LITERAL = /"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|`(?:\\[\s\S]|[^`\\])*`/g;

const SIGNATURE_TOKEN = new RegExp(String.raw`\s+|/\*[\s\S]*?\*/|//[^\r\n\u2028\u2029]*|${LITERAL.source}|[\p{ID_Continue}$]+|=>|\.\.\.|\+\+|--|\?\.|[!=]==?|\*\*=?|&&=?|\|\|=?|\?\?=?|>>>=?|>>=?|<<=?|[+*/%&|^<>-]=|[^\s]`, 'uy');
const REGEX_LITERAL = /\/(?:\\.|\[(?:\\.|[^\]\\\r\n\u2028\u2029])*\]|[^/\\[\r\n\u2028\u2029])+\/[a-z]*/iy;
const EXPRESSION_PREFIX = /^(?:[({[;,?:~]|=>|[=!<>+*/%&|^-]=*|&&=?|\|\|=?|\?\?=?|\*\*=?|(?:>>>?|<<)=?)$/;
const EXPRESSION_KEYWORD = /^(?:return|throw|case|yield|await|typeof|void|delete|in|instanceof|of|else|do|new)$/;
const CONTROL_KEYWORD = /^(?:if|while|for|with|switch|catch)$/;

function* sourceTokens(src) {
    let offset = 0;
    let regexAllowed = true;
    let control = false;
    let previous = '';
    const parens = [];
    while (offset < src.length) {
        SIGNATURE_TOKEN.lastIndex = offset;
        let [token] = SIGNATURE_TOKEN.exec(src);
        const comment = token.startsWith('//') || token.startsWith('/*');
        const whitespace = /^\s/.test(token);
        let literal = /^["'\x60]/.test(token);
        if (!comment && !whitespace) {
            if (regexAllowed && token.startsWith('/')) {
                REGEX_LITERAL.lastIndex = offset;
                const match = REGEX_LITERAL.exec(src);
                if (match) {
                    [token] = match;
                    literal = true;
                }
            }

            // A control condition can be followed by a regex expression statement.
            if (token === '(') parens.push(control);
            const isProperty = previous === '.' || previous === '?.';
            regexAllowed = !literal && (EXPRESSION_PREFIX.test(token) ||
                (!isProperty && EXPRESSION_KEYWORD.test(token)) || (token === ')' && parens.pop()));
            control = !isProperty && CONTROL_KEYWORD.test(token);
            previous = token;
        }
        yield { token, offset, comment, whitespace, literal };
        offset += token.length;
    }
}

/** コメントを同じ長さの空白に置き換える (位置・改行を保つ) */
function blankComments(src) {
    const parts = [];
    const literals = new Map();
    let start = 0;
    for (const { token, offset, comment, literal } of sourceTokens(src)) {
        if (comment) {
            parts.push(src.slice(start, offset), token.replace(/[^\r\n\u2028\u2029]/g, ' '));
            start = offset + token.length;
        } else if (literal) literals.set(offset, offset + token.length);
    }
    parts.push(src.slice(start));
    return { text: parts.join(''), literals };
}

const normalizeSignature = (text) => JSON.stringify(
    [...sourceTokens(text)].filter(({ whitespace, comment }) => !whitespace && !comment).map(({ token }) => token));

/** text[open] の '(' に対応する ')' の位置を返す (リテラルは読み飛ばす) */
function matchParen(text, open, literals) {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        if (literals.has(i)) i = literals.get(i) - 1;
        else if (text[i] === '(') depth++;
        else if (text[i] === ')' && --depth === 0) return i;
    }
    return -1;
}

/** 行頭(インデント無し)で宣言された関数・変数・クラスを抽出する */
export function extractTopLevel(source) {
    const { text, literals } = blankComments(source);
    const out = [];
    const re = /^(?:export\s+)?(?:(async\s+)?function\s*\*?\s+([A-Za-z_$][\w$]*)\s*\(|(?:const|let|var)\s+([A-Za-z_$][\w$]*)(?:\s*(=)\s*|[^\S\r\n\u2028\u2029]*(?=;|$))|class\s+([A-Za-z_$][\w$]*))/gm;
    const ranges = literals.entries(); // In source order, like the declaration matches.
    let range = ranges.next().value;
    let m;
    while ((m = re.exec(text))) {
        while (range && range[1] <= m.index) range = ranges.next().value;
        if (range && range[0] <= m.index) continue;
        if (m[2]) {
            const open = m.index + m[0].length - 1;
            const close = matchParen(text, open, literals);
            out.push({ name: m[2], kind: 'function', sig: normalizeSignature(text.slice(open + 1, close)) });
        } else if (m[4]) {
            const rest = text.slice(m.index + m[0].length, m.index + m[0].length + 400);
            let sig = null;
            let fm = rest.match(/^(?:async\s+)?function\s*\*?\s*[\w$]*\s*\(/);
            if (fm) {
                const open = m.index + m[0].length + fm[0].length - 1;
                sig = normalizeSignature(text.slice(open + 1, matchParen(text, open, literals)));
            } else if ((fm = rest.match(/^(?:async\s+)?\(/))) {
                const open = m.index + m[0].length + fm[0].length - 1;
                const close = matchParen(text, open, literals);
                if (close > 0 && /^\s*=>/.test(text.slice(close + 1, close + 20))) sig = normalizeSignature(text.slice(open + 1, close));
            } else if ((fm = rest.match(/^(?:async\s+)?([A-Za-z_$][\w$]*)\s*=>/))) sig = normalizeSignature(fm[1]);
            out.push(sig === null ? { name: m[3], kind: 'variable', sig: '' } : { name: m[3], kind: 'function', sig });
        } else out.push({ name: m[3] ?? m[5], kind: 'variable', sig: '' });
    }
    return out;
}

const FV_FILE_RE = /^js\/(danoni_main\.js|lib\/[^/]+\.js)$/;

function collectDeclarations(ref) {
    const files = git(['ls-tree', '-r', '--name-only', '-z', ref, '--', 'js/']).split('\0').filter((p) => FV_FILE_RE.test(p));
    const order = [...files].sort((a, b) => (a === 'js/danoni_main.js' ? -1 : b === 'js/danoni_main.js' ? 1 : a.localeCompare(b)));
    const map = new Map();
    for (const f of order) {
        const src = git(['cat-file', 'blob', `${ref}:${f}`], { buffer: true }).toString('utf8');
        for (const d of extractTopLevel(src)) {
            const prev = map.get(d.name);
            if (!prev || (prev.kind !== 'function' && d.kind === 'function')) map.set(d.name, { ...d, file: f });
        }
    }
    return map;
}

function buildFunctionsVariables(o) {
    const before = collectDeclarations(o.base);
    const after = collectDeclarations(o.tag);
    const add = [];
    const change = [];
    const del = [];
    for (const [name, d] of after) {
        const b = before.get(name);
        if (!b) add.push(d);
        else if (b.kind !== d.kind || (d.kind === 'function' && b.sig !== d.sig)) change.push(d);
    }
    for (const [name, b] of before) if (!after.has(name)) del.push(b);

    // 関数 -> 変数 の順で、ソース上の出現順に並べる
    const order = (list) => [...list.filter((d) => d.kind === 'function'), ...list.filter((d) => d.kind !== 'function')];
    const names = (list) => order(list).map((d) => d.name);
    const result = { add: names(add), change: names(change), delete: names(del) };
    const cell = (a) => (a.length ? a.join(', ') : 'ー');
    const markdown = [
        '## 🐝 Functions &amp; Variables Changed',
        '',
        '||Functions &amp; Variables|',
        '|----|----|',
        `|Add|${cell(result.add)}|`,
        `|Change|${cell(result.change)}|`,
        `|Delete|${cell(result.delete)}|`,
    ].join('\n');
    if (result.change.length) review('functionsVariables', `シグネチャ変更の判定が必要です(引数の意味が変わっていないか確認): ${result.change.join(', ')}`);
    return { ...result, markdown, note: '行頭で宣言されたトップレベルの関数・変数のみ。関数はシグネチャ(引数リスト)の変更を Change とする' };
}

// ---------------------------------------------------------------- Recent Changes / Related Releases
function buildRecentChanges(o, allTags) {
    const [major, minor] = parseVer(o.tag);
    const firstOfMinor = new Map(); // "M.m" -> 最初にリリースされたバージョン (X.Y.0 が欠番なら最初のパッチ)
    for (const t of allTags) {
        const [M, m] = parseVer(t);
        const k = `${M}.${m}`;
        if (!firstOfMinor.has(k)) firstOfMinor.set(k, t);
    }
    const keys = [...firstOfMinor.keys()]
        .map((k) => k.split('.').map(Number))
        .filter(([M, m]) => M < major || (M === major && m <= minor))
        .sort((a, b) => b[0] - a[0] || b[1] - a[1])
        .slice(0, 5);
    const versions = keys.map(([M, m]) => firstOfMinor.get(`${M}.${m}`));
    const slid = versions.filter((v) => parseVer(v)[2] !== 0);
    const markdown = `## 💡 Recent Changes\n- ${versions.map((v) => `[${v}](${releaseUrl(o.repo, v)})`).join(' / ')}`;
    return { versions, slidToPatch: slid, markdown };
}

/** 直近の Release 一覧 (新しい順)。ドラフトも含める (サポート版は最新版より先にタグ・ドラフトが作られるため) */
function fetchRecentReleases(o) {
    try {
        const raw = o.releasesJson ? fs.readFileSync(o.releasesJson, 'utf8') : gh(['api', `repos/${o.repo}/releases?per_page=100`]);
        return JSON.parse(raw).filter((r) => TAG_RE.test(r.tag_name ?? ''));
    } catch (e) {
        review('relatedReleases', `Release 一覧を取得できず Backport を自動検出できませんでした: ${String(e.stderr ?? e.message).trim()}`);
        return [];
    }
}

/** Bug Fixes の箇条書き末尾にある PR クレジットと項目 ID を取得する */
function creditedBugFixes(body) {
    const credits = [];
    let inBugFixes = false;
    for (const { line, fixIds, outsideFence } of markdownLines(body ?? '', { hideComments: true })) {
        if (!outsideFence) continue;
        const heading = /^ {0,3}##[ 	]+(.+)$/.exec(line);
        if (heading) inBugFixes = /Bug Fixes/i.test(heading[1]);
        if (!inBugFixes) continue;
        const m = line.match(/^ {0,3}[-*][ 	]+.+?\s+\(\s*PR\s+(#\d+(?:\s*,\s*#\d+)*)\s*\)\s*$/i);
        if (m) credits.push({ fixIds, prs: m[1].match(/\d+/g).map(Number) });
    }
    return credits;
}

/**
 * 最新版の作成時点では、サポート版のタグ・Release は先に作られている。
 * Bug Fixes の項目 ID を使う。古い Release の PR クレジットは修正が 1 件の場合のみ使う。
 * Release Notes / PR 本文に Backport が明記されている場合はそちらを優先する。
 */
function detectBackports(o, items, fixCandidates) {
    const fixes = items.filter((i) => i.category === 'bugfix' && !i.fix.backports.length);
    if (fixes.length === 0) return;
    const releases = fetchRecentReleases(o);
    const idx = releases.findIndex((r) => r.tag_name === o.base);
    if (releases.length && idx < 0) review('relatedReleases', `前回リリース ${o.base} が直近100件に見つからず、Backport の検出範囲が不明です`);
    const major = parseVer(o.tag)[0];
    const older = (idx < 0 ? releases : releases.slice(0, idx))
        .filter((r) => parseVer(r.tag_name)[0] < major)
        .map((r) => ({ ...r, credits: creditedBugFixes(r.body) }));
    const ambiguous = new Set();
    for (const it of fixes) {
        const candidates = fixCandidates.filter((f) => f.pr === it.pr);
        const hits = older.filter((r) => {
            let matched = false;
            for (const credit of r.credits) {
                if (!credit.prs.includes(it.pr)) continue;
                if (credit.fixIds) {
                    matched ||= credit.fixIds.includes(it.id);
                } else if (candidates.length === 1) {
                    matched = true;
                } else {
                    const key = `${r.tag_name} / PR #${it.pr}`;
                    if (!ambiguous.has(key)) {
                        ambiguous.add(key);
                        review('relatedReleases', `${key}: 項目 ID がなく、複数の修正から Backport 対象を特定できません`);
                    }
                }
            }
            return matched;
        });
        it.fix.backports = hits.map((r) => r.tag_name).sort(cmpVer).reverse();
        it.fix.backportsDetected = hits.length > 0;
        const drafts = hits.filter((r) => r.draft).map((r) => r.tag_name);
        if (drafts.length) review('relatedReleases', `Backport として検出した ${drafts.join(', ')} は未公開(ドラフト)です。公開順を確認してください`);
        if (!hits.length) review('relatedReleases', `「${it.title}」(PR #${it.pr}) の Backport は検出されませんでした (サポート版が無い場合は問題ありません)`);
    }
}

function buildRelatedReleases(o, items, ver) {
    const fixes = items.filter((i) => i.category === 'bugfix');
    if (fixes.length === 0) return { show: false, partial: false, lines: [], markdown: '' };
    const link = (v) => `[${v}](${releaseUrl(o.repo, v)})`;
    const lines = [];
    for (const it of fixes) {
        const f = it.fix;
        // 公開バージョン自身を先頭に、他バージョンへの適用を新しい順に続ける
        const versions = [o.tag, ...[...f.backports].sort(cmpVer).reverse().filter((v) => v !== o.tag)];
        const origin = f.originInitial ? '**initial**' : f.origins.map(link).join(' / ');
        const line = `${versions.map(link).join(' / ')}${origin ? ` <- ${origin}` : ''}`;
        if (!lines.includes(line)) lines.push(line);
        if (f.originInitial) review('relatedReleases', `原因バージョンが initial の場合の表記(**initial**)を確認してください: ${it.title}`);
    }
    if (lines.length > 1) review('relatedReleases', '不具合修正が複数あり Related Releases が複数行になります。表記・統合を確認してください');
    // サポート版は最新版・他のサポート版より先に出すため、この時点では一部しか分からない
    const partial = !ver.isLatestMajor;
    if (partial) review('relatedReleases', 'サポート版のため Related Releases は暫定です。最新版・他のサポート版の公開後に同期して完成させてください');
    return { show: true, partial, lines, markdown: `## 🎣 Related Releases\n${lines.map((l) => `- ${l}`).join('\n')}` };
}

// ---------------------------------------------------------------- main
const o = parseArgs(process.argv.slice(2));
for (const ref of [o.tag, o.base]) {
    try {
        git(['rev-parse', '--verify', '--quiet', `refs/tags/${ref}^{commit}`]);
    } catch {
        fail(`タグ ${ref} が見つかりません (checkout は fetch-depth: 0 / fetch-tags: true が必要です)`);
    }
}

const allTags = listTags(o);
const version = versionInfo(o, allTags);

if (!version.isLatestMajor && !o.prSpec) {
    const msg = `${o.tag} はサポート版です。取り込む PR・項目を --pr-spec で指定してください (例: --pr-spec "2333:2+3,2340")。Release facts の収集をスキップしました`;
    console.log(`::notice::${msg}`);
    if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${msg}\n`);
    process.exit(0);
}
const prSpec = o.prSpec ? parsePrSpec(o.prSpec) : null;

const { prs, releasePrs } = collectPrs(o);
const items = [];
const fixCandidates = [];
const documentation = [];
const otherComments = [];
for (const pr of prs) {
    const parsed = parseItems(pr, prSpec?.get(pr.number) ?? null);
    items.push(...parsed.items);
    fixCandidates.push(...parsed.fixCandidates);
    documentation.push(...parsed.wiki.map((line) => ({ pr: pr.number, line })));
    if (parsed.otherComments) otherComments.push({ pr: pr.number, text: parsed.otherComments });
}

const contributors = [];
for (const pr of prs) {
    if (!pr.author || pr.authorIsBot || pr.author.toLowerCase() === o.owner.toLowerCase()) continue;
    const c = contributors.find((x) => x.login === pr.author);
    if (c) c.prs.push(pr.number);
    else contributors.push({ login: pr.author, prs: [pr.number] });
}
if (contributors.length) review('contributors', `オーナー以外の PR 作成者がいます。Contributors への記載名を確認してください: ${contributors.map((c) => c.login).join(', ')}`);

const warning = releasePrs.map((p) => findSection(splitSections(stripComments(p.body)), /⚠|Warning/i)).find(Boolean) ?? '';

const changes = (() => {
    const out = git(['diff', '--name-status', '-z', '--no-renames', o.base, o.tag]);
    const parts = out.split('\0').filter((s) => s !== '');
    const list = [];
    for (let i = 0; i + 1 < parts.length; i += 2) list.push({ status: parts[i][0], path: parts[i + 1] });
    return list;
})();

let prevBody;
if (o.prevBody) prevBody = fs.readFileSync(o.prevBody, 'utf8');
else {
    try {
        prevBody = JSON.parse(gh(['api', `repos/${o.repo}/releases/tags/${o.base}`])).body ?? '';
    } catch (e) {
        fail(`前回リリース ${o.base} の本文を取得できませんでした。Files changed 表の整合性を確認できないため中止します\n${String(e.stderr ?? e.message).trim()}`);
    }
}

const filesChanged = buildFilesChanged(o, version, changes, prevBody);
const functionsVariables = buildFunctionsVariables(o);
const recentChanges = buildRecentChanges(o, allTags);
if (version.isLatestMajor) detectBackports(o, items, fixCandidates);
else review('items', 'サポート版です。Remarks 等は develop 側 PR 本文の転記です。実装が異なる場合は手修正してください');
const relatedReleases = buildRelatedReleases(o, items, version);

const facts = {
    schema: 1,
    version,
    prs: prs.map(({ body, ...rest }) => rest),
    releasePrs: releasePrs.map(({ body, ...rest }) => rest),
    items,
    fixCandidates,
    otherComments,
    documentation,
    contributors,
    warning,
    filesChanged,
    functionsVariables,
    recentChanges,
    relatedReleases,
    changedFiles: changes,
    needsReview,
    rendered: {
        filesChanged: filesChanged.markdown,
        functionsVariables: functionsVariables.markdown,
        recentChanges: recentChanges.markdown,
        relatedReleases: relatedReleases.markdown,
    },
};
fs.writeFileSync(o.out, `${JSON.stringify(facts, null, 2)}\n`);

// ---------------------------------------------------------------- サマリー
const byCat = (c) => items.filter((i) => i.category === c).length;
const lines = [
    `## Release facts: ${o.tag} (base: ${o.base}, ${version.isLatestMajor ? '最新メジャー' : '過去メジャー'})`,
    '',
    `- PR: ${prs.map((p) => `#${p.number}`).join(', ') || 'なし'}`,
    `- 項目: new ${byCat('new')} / improvements ${byCat('improvements')} / bugfix ${byCat('bugfix')} / chores ${byCat('chores')} / unknown ${byCat('unknown')}`,
    `- Functions & Variables: Add ${functionsVariables.add.length} / Change ${functionsVariables.change.length} / Delete ${functionsVariables.delete.length}`,
    `- Recent Changes: ${recentChanges.versions.join(', ')}`,
];
if (needsReview.length) lines.push('', '### 要確認', ...needsReview.map((r) => `- [${r.where}] ${r.message}`));
const md = lines.join('\n');
console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md}\n`);
