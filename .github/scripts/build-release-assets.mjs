#!/usr/bin/env node
/**
 * .github/scripts/build-release-assets.mjs
 *
 * リリースに添付する Assets を「タグ間の差分」から機械的に決定・生成し、
 * 公開前に内容を検証する。Release は immutable (公開後に Assets を直せない)
 * ため、誤りを公開前に必ず検出することが目的。LLM は使わない。
 *
 * 使い方:
 *   node .github/scripts/build-release-assets.mjs --tag v53.4.0 --base v53.3.2
 *   オプション:
 *     --out <dir>           Assets の出力先 (既定: release-assets)
 *     --manifest <file>     期待 Assets 一覧(JSON)の出力先 (既定: release-manifest.json)
 *     --dry-run             計画の表示のみ (ファイルを作らない)
 *     --skip-zip-compare    過去の zip との構成比較を省略 (gh / ネットワーク不要)
 *
 * 添付ルール:
 *   - js/danoni_main.js, js/lib/*.js, css/danoni_main.css : 変更があれば個別添付
 *   - js/template/danoni_setting.js : danoni_setting-template.js の名前で添付
 *   - skin_css.zip / img.zip : 明示した対象ファイルのどれか1つでも変更があれば、
 *     その時点の対象ファイル「全体」を再圧縮して添付 (ZIP_GROUPS 参照)
 *   - 上記以外 (.github, *.md, *.json, danoni/, js/template の他ファイル 等) は対象外
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { REQUIRED_ASSETS, SINGLE_RULES, TAG_RE, ZIP_GROUPS } from './release-config.mjs';

// ---------------------------------------------------------------- 設定
// 添付ルール (SINGLE_RULES / ZIP_GROUPS) は release-config.mjs に定義

// ---------------------------------------------------------------- 共通
const errors = [];
const warnings = [];

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

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const blob = (tag, p) => git(['cat-file', 'blob', `${tag}:${p}`], { buffer: true });

const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c >>> 0;
    }
    return t;
})();

function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

// ---------------------------------------------------------------- zip (依存なし・決定的)
function makeZip(entries) {
    const DOS_TIME = 0;
    const DOS_DATE = ((2020 - 1980) << 9) | (1 << 5) | 1; // 固定日時 (再現性のため)
    const locals = [];
    const centrals = [];
    let offset = 0;

    for (const { name, data } of entries) {
        const nameBuf = Buffer.from(name, 'utf8');
        const crc = crc32(data);
        const deflated = zlib.deflateRawSync(data, { level: 9 });
        const useDeflate = data.length > 0 && deflated.length < data.length;
        const method = useDeflate ? 8 : 0;
        const body = useDeflate ? deflated : data;

        const lh = Buffer.alloc(30);
        lh.writeUInt32LE(0x04034b50, 0);
        lh.writeUInt16LE(20, 4);
        lh.writeUInt16LE(0x0800, 6); // UTF-8 ファイル名
        lh.writeUInt16LE(method, 8);
        lh.writeUInt16LE(DOS_TIME, 10);
        lh.writeUInt16LE(DOS_DATE, 12);
        lh.writeUInt32LE(crc, 14);
        lh.writeUInt32LE(body.length, 18);
        lh.writeUInt32LE(data.length, 22);
        lh.writeUInt16LE(nameBuf.length, 26);
        lh.writeUInt16LE(0, 28);
        locals.push(lh, nameBuf, body);

        const ch = Buffer.alloc(46);
        ch.writeUInt32LE(0x02014b50, 0);
        ch.writeUInt16LE((3 << 8) | 20, 4); // made by: Unix
        ch.writeUInt16LE(20, 6);
        ch.writeUInt16LE(0x0800, 8);
        ch.writeUInt16LE(method, 10);
        ch.writeUInt16LE(DOS_TIME, 12);
        ch.writeUInt16LE(DOS_DATE, 14);
        ch.writeUInt32LE(crc, 16);
        ch.writeUInt32LE(body.length, 20);
        ch.writeUInt32LE(data.length, 24);
        ch.writeUInt16LE(nameBuf.length, 28);
        ch.writeUInt32LE((0o100644 << 16) >>> 0, 38);
        ch.writeUInt32LE(offset, 42);
        centrals.push(ch, nameBuf);

        offset += 30 + nameBuf.length + body.length;
    }

    const cd = Buffer.concat(centrals);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(entries.length, 8);
    end.writeUInt16LE(entries.length, 10);
    end.writeUInt32LE(cd.length, 12);
    end.writeUInt32LE(offset, 16);
    return Buffer.concat([...locals, cd, end]);
}

function readZip(buf) {
    let eocd = -1;
    for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 65535); i--) {
        if (buf.readUInt32LE(i) === 0x06054b50) {
            eocd = i;
            break;
        }
    }
    if (eocd < 0) throw new Error('zip の終端情報が見つかりません');
    const count = buf.readUInt16LE(eocd + 10);
    let p = buf.readUInt32LE(eocd + 16);
    const list = [];
    for (let i = 0; i < count; i++) {
        if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('zip のセントラルディレクトリが不正です');
        const crc = buf.readUInt32LE(p + 16);
        const size = buf.readUInt32LE(p + 24);
        const nl = buf.readUInt16LE(p + 28);
        const el = buf.readUInt16LE(p + 30);
        const cl = buf.readUInt16LE(p + 32);
        const name = buf.toString('utf8', p + 46, p + 46 + nl);
        list.push({ name, crc, size });
        p += 46 + nl + el + cl;
    }
    return list.filter((e) => !e.name.endsWith('/'));
}

// ---------------------------------------------------------------- 引数
function parseArgs(argv) {
    const o = { out: 'release-assets', manifest: 'release-manifest.json', dryRun: false, skipZipCompare: false };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--tag') o.tag = argv[++i];
        else if (a === '--base') o.base = argv[++i];
        else if (a === '--out') o.out = argv[++i];
        else if (a === '--manifest') o.manifest = argv[++i];
        else if (a === '--dry-run') o.dryRun = true;
        else if (a === '--skip-zip-compare') o.skipZipCompare = true;
        else fail(`未知の引数: ${a}`);
    }
    if (!TAG_RE.test(o.tag ?? '')) fail(`--tag は vX.Y.Z 形式で指定してください (指定値: ${o.tag})`);
    if (!TAG_RE.test(o.base ?? '')) fail(`--base は vX.Y.Z 形式で指定してください (指定値: ${o.base})`);
    if (o.tag === o.base) fail('--tag と --base が同じです');
    return o;
}

// ---------------------------------------------------------------- 計画
function changedFiles(base, tag) {
    const out = git(['diff', '--name-status', '-z', '--no-renames', base, tag]);
    const parts = out.split('\0').filter((s) => s !== '');
    const list = [];
    for (let i = 0; i + 1 < parts.length; i += 2) list.push({ status: parts[i][0], path: parts[i + 1] });
    return list;
}

function buildPlan(changes, tag) {
    const singles = new Map(); // assetName -> sourcePath
    const touchedGroups = new Set();
    const ignored = [];

    for (const { status, path: p } of changes) {
        const rule = SINGLE_RULES.find((r) => r.test(p));
        const group = ZIP_GROUPS.find((g) => g.files.includes(p));
        if (rule) {
            const name = rule.name(p);
            if (status === 'D') {
                warnings.push(`配布ファイル ${p} が削除されています (添付なし)`);
                continue;
            }
            if (singles.has(name)) errors.push(`Assets 名が重複しています: ${name} (${singles.get(name)} / ${p})`);
            singles.set(name, p);
        } else if (group) {
            if (status === 'D') errors.push(`${group.asset} の対象ファイル ${p} が削除されています。ZIP_GROUPS を見直してください`);
            touchedGroups.add(group.asset);
        } else {
            ignored.push(p);
        }
    }

    const zips = [];
    for (const group of ZIP_GROUPS.filter((g) => touchedGroups.has(g.asset))) {
        const existing = new Set(git(['ls-tree', '-r', '--name-only', '-z', tag, '--', ...group.files]).split('\0').filter(Boolean));
        const missing = group.files.filter((f) => !existing.has(f));
        if (missing.length) errors.push(`${group.asset}: タグ ${tag} に存在しないファイルがあります: ${missing.join(', ')}`);
        zips.push({
            asset: group.asset,
            files: group.files.map((p) => ({ name: path.posix.basename(p), source: p })),
            paths: group.files,
        });
    }
    return { singles, zips, ignored };
}

// ---------------------------------------------------------------- zip の構成を過去リリースと比較
function compareWithPreviousZip(zip, base) {
    const last = git(['log', '-1', '--format=%H', base, '--', ...zip.paths]).trim();
    if (!last) {
        warnings.push(`${zip.asset}: 過去に対象ファイルの変更履歴が無く、構成比較をスキップしました`);
        return;
    }
    const prevTag = git(['tag', '--contains', last, '--merged', base, '--sort=creatordate'])
        .split('\n')
        .map((s) => s.trim())
        .filter((t) => TAG_RE.test(t))[0];
    if (!prevTag) {
        errors.push(`${zip.asset}: 直近の変更を含む過去タグを特定できませんでした (--skip-zip-compare で省略可)`);
        return;
    }

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prevzip-'));
    try {
        execFileSync('gh', ['release', 'download', prevTag, '-p', zip.asset, '-D', tmp], { stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
        errors.push(
            `${zip.asset}: 過去リリース ${prevTag} から取得できませんでした。構成を比較できないため中止します` +
            ` (--skip-zip-compare で省略可)\n${String(e.stderr ?? e.message).trim()}`
        );
        return;
    }
    const prevNames = readZip(fs.readFileSync(path.join(tmp, zip.asset))).map((e) => e.name);
    const expected = new Set(prevNames);
    const actual = new Set(zip.files.map((f) => f.name));

    const missing = [...expected].filter((n) => !actual.has(n));
    const extra = [...actual].filter((n) => !expected.has(n));
    if (missing.length || extra.length) {
        errors.push(
            `${zip.asset}: 過去(${prevTag})の zip と構成が一致しません。ZIP_GROUPS の内容、または zip 内のフォルダ構成を確認してください。\n` +
            `  不足: ${missing.slice(0, 10).join(', ') || 'なし'}\n  余分: ${extra.slice(0, 10).join(', ') || 'なし'}\n` +
            `  過去zipの先頭: ${prevNames.slice(0, 5).join(', ')}`
        );
    }
}

// ---------------------------------------------------------------- 生成
function build(plan, tag, outDir) {
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });
    const assets = [];

    for (const [name, source] of [...plan.singles].sort(([a], [b]) => a.localeCompare(b))) {
        const data = blob(tag, source);
        fs.writeFileSync(path.join(outDir, name), data);
        assets.push({ name, kind: 'file', sources: [source], size: data.length, sha256: sha256(data) });
    }
    for (const zip of plan.zips) {
        const entries = zip.files.map((f) => ({ name: f.name, data: blob(tag, f.source) }));
        const data = makeZip(entries);
        fs.writeFileSync(path.join(outDir, zip.asset), data);
        assets.push({
            name: zip.asset,
            kind: 'zip',
            sources: zip.files.map((f) => f.source),
            entries: zip.files.map((f) => f.name),
            size: data.length,
            sha256: sha256(data),
        });
    }
    return assets;
}

// ---------------------------------------------------------------- 検証 (ディスク上の成果物を読み直して照合)
function verify(outDir, assets, tag) {
    const onDisk = fs.readdirSync(outDir).sort();
    const expectedNames = assets.map((a) => a.name).sort();
    if (JSON.stringify(onDisk) !== JSON.stringify(expectedNames)) {
        errors.push(`出力ディレクトリの内容が期待と一致しません\n  実際: ${onDisk.join(', ')}\n  期待: ${expectedNames.join(', ')}`);
    }

    for (const a of assets) {
        const file = path.join(outDir, a.name);
        if (!fs.existsSync(file)) {
            errors.push(`${a.name}: ファイルがありません`);
            continue;
        }
        const buf = fs.readFileSync(file);
        if (a.kind === 'file') {
            const src = blob(tag, a.sources[0]);
            if (!buf.equals(src)) errors.push(`${a.name}: タグ ${tag} の ${a.sources[0]} と内容が一致しません`);
        } else {
            let entries;
            try {
                entries = readZip(buf);
            } catch (e) {
                errors.push(`${a.name}: ${e.message}`);
                continue;
            }
            const got = new Map(entries.map((e) => [e.name, e]));
            if (got.size !== a.entries.length) errors.push(`${a.name}: エントリ数が一致しません (${got.size} / 期待 ${a.entries.length})`);
            a.entries.forEach((name, i) => {
                const src = blob(tag, a.sources[i]);
                const e = got.get(name);
                if (!e) errors.push(`${a.name}: ${name} が含まれていません`);
                else if (e.crc !== crc32(src) || e.size !== src.length) errors.push(`${a.name}: ${name} の内容が ${tag} と一致しません`);
            });
        }
    }

    for (const req of REQUIRED_ASSETS) {
        if (!assets.some((a) => a.name === req)) errors.push(`必須の Assets ${req} がありません (バージョン更新が反映されていない可能性)`);
    }

    try {
        const pkg = JSON.parse(blob(tag, 'package.json').toString('utf8'));
        if (`v${pkg.version}` !== tag) errors.push(`package.json の version (${pkg.version}) がタグ ${tag} と一致しません`);
    } catch (e) {
        errors.push(`package.json を読めません: ${e.message}`);
    }
}

// ---------------------------------------------------------------- レポート
function report({ tag, base, assets, ignored }) {
    const lines = [];
    lines.push(`## Release assets: ${tag} (diff base: ${base})`, '');
    lines.push('| Asset | 種別 | サイズ | 元ファイル |', '|---|---|---:|---|');
    for (const a of assets) {
        const src = a.kind === 'zip' ? `${a.entries.length} files (${a.sources[0].split('/')[0]}/)` : a.sources[0];
        lines.push(`| ${a.name} | ${a.kind} | ${a.size} | ${src} |`);
    }
    lines.push('', `添付対象外の変更ファイル: ${ignored.length} 件`);
    if (warnings.length) lines.push('', '### 警告', ...warnings.map((w) => `- ${w}`));
    if (errors.length) lines.push('', '### エラー', ...errors.map((e) => `- ${e}`));
    const md = lines.join('\n');
    console.log(md);
    if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md}\n`);
}

// ---------------------------------------------------------------- main
const opts = parseArgs(process.argv.slice(2));
for (const ref of [opts.tag, opts.base]) {
    try {
        git(['rev-parse', '--verify', '--quiet', `refs/tags/${ref}^{commit}`]);
    } catch {
        fail(`タグ ${ref} が見つかりません (checkout は fetch-depth: 0 / fetch-tags: true が必要です)`);
    }
}

const changes = changedFiles(opts.base, opts.tag);
const plan = buildPlan(changes, opts.tag);

if (!opts.skipZipCompare && !opts.dryRun) for (const zip of plan.zips) compareWithPreviousZip(zip, opts.base);

let assets;
if (opts.dryRun) {
    assets = [
        ...[...plan.singles].map(([name, src]) => ({ name, kind: 'file', sources: [src], size: 0 })),
        ...plan.zips.map((z) => ({ name: z.asset, kind: 'zip', sources: z.files.map((f) => f.source), entries: z.files.map((f) => f.name), size: 0 })),
    ];
} else {
    assets = build(plan, opts.tag, opts.out);
    verify(opts.out, assets, opts.tag);
    fs.writeFileSync(
        opts.manifest,
        `${JSON.stringify({ tag: opts.tag, base: opts.base, assets: assets.map(({ name, kind, size, sha256: h, sources }) => ({ name, kind, size, sha256: h, sources })), ignored: plan.ignored }, null, 2)}\n`
    );
}

report({ tag: opts.tag, base: opts.base, assets, ignored: plan.ignored });
if (errors.length) process.exit(1);