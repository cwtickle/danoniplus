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
 *     --out <dir>           Assets の出力先 (既定: release-assets、未作成または以前のビルドのみ)
 *     --manifest <file>     期待 Assets 一覧(JSON)の出力先 (--out の外、既定: release-manifest.json)
 *     --dry-run             計画の表示のみ (ファイルを作らない)
 *     --skip-zip-compare    過去の zip との構成比較を省略 (gh / ネットワーク不要)
 *
 * 添付ルール:
 *   - js/danoni_main.js, js/lib/*.js, css/danoni_main.css : 変更があれば個別添付
 *   - js/template/danoni_setting.js : danoni_setting-template.js の名前で添付
 *   - skin_css.zip / img.zip : 明示した対象ファイルのどれか1つでも変更があれば、
 *     その時点の対象ファイル「全体」を再圧縮して添付 (構成の変更でも添付)
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

function readZip(buf, extract = false) {
    let eocd = -1;
    for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 65535); i--) {
        if (buf.readUInt32LE(i) === 0x06054b50) {
            eocd = i;
            break;
        }
    }
    if (eocd < 0) throw new Error('zip の終端情報が見つかりません');
    const count = buf.readUInt16LE(eocd + 10);
    const centralAt = buf.readUInt32LE(eocd + 16);
    let p = centralAt;
    const list = [];
    for (let i = 0; i < count; i++) {
        if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('zip のセントラルディレクトリが不正です');
        const crc = buf.readUInt32LE(p + 16);
        const size = buf.readUInt32LE(p + 24);
        const nl = buf.readUInt16LE(p + 28);
        const el = buf.readUInt16LE(p + 30);
        const cl = buf.readUInt16LE(p + 32);
        const name = buf.toString('utf8', p + 46, p + 46 + nl);
        let data;
        if (extract) {
            const method = buf.readUInt16LE(p + 10);
            const compressedSize = buf.readUInt32LE(p + 20);
            const local = buf.readUInt32LE(p + 42);
            if (local + 30 > centralAt || buf.readUInt32LE(local) !== 0x04034b50 ||
                buf.readUInt16LE(p + 8) !== 0x0800 || buf.readUInt16LE(local + 6) !== 0x0800 ||
                buf.readUInt16LE(local + 8) !== method || buf.readUInt32LE(local + 14) !== crc ||
                buf.readUInt32LE(local + 18) !== compressedSize || buf.readUInt32LE(local + 22) !== size) {
                throw new Error(`zip: ${name} のローカルヘッダーが不正です`);
            }
            const nameEnd = local + 30 + buf.readUInt16LE(local + 26);
            const start = nameEnd + buf.readUInt16LE(local + 28);
            const end = start + compressedSize;
            if (end > centralAt || !buf.subarray(local + 30, nameEnd).equals(buf.subarray(p + 46, p + 46 + nl))) {
                throw new Error(`zip: ${name} のデータ範囲またはファイル名が不正です`);
            }
            const compressed = buf.subarray(start, end);
            if (method === 0) data = compressed;
            else if (method === 8) {
                const { buffer, engine } = zlib.inflateRawSync(compressed, { info: true, maxOutputLength: Math.max(1, size) });
                if (engine.bytesWritten !== compressedSize) throw new Error(`zip: ${name} の圧縮データの長さが不正です`);
                data = buffer;
            } else throw new Error(`zip: ${name} の圧縮方式が不正です`);
            if (data.length !== size || crc32(data) !== crc) throw new Error(`zip: ${name} のサイズまたは CRC が不正です`);
        }
        list.push({ name, data });
        p += 46 + nl + el + cl;
    }
    if (extract && (p !== eocd || p - centralAt !== buf.readUInt32LE(eocd + 12))) {
        throw new Error('zip のセントラルディレクトリのサイズが不正です');
    }
    return extract ? list : list.filter((e) => !e.name.endsWith('/'));
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

const ZIP_CONFIG = '.github/scripts/release-zip-groups.json';
function taggedZipGroups(tag) {
    if (!git(['ls-tree', tag, '--', ZIP_CONFIG]).trim()) return null;
    const groups = JSON.parse(blob(tag, ZIP_CONFIG).toString('utf8'));
    const assets = new Set();
    if (!Array.isArray(groups) || !groups.every((group) => {
        const { asset, files } = group ?? {};
        if (typeof asset !== 'string' || !/^[\w.-]+\.zip$/.test(asset) || assets.has(asset) ||
            !Array.isArray(files) || !files.length ||
            !files.every((file) => typeof file === 'string' && /^[\w.-]+(?:\/[\w.-]+)+$/.test(file) &&
                !file.split('/').some((part) => part === '.' || part === '..')) ||
            new Set(files.map((file) => path.posix.basename(file))).size !== files.length) return false;
        assets.add(asset);
        return true;
    })) throw new Error(`${tag}: ${ZIP_CONFIG} の内容が不正です`);
    return groups;
}

function buildPlan(changes, base, tag) {
    const taggedGroups = taggedZipGroups(tag);
    const groups = taggedGroups ?? ZIP_GROUPS;
    // Older tags have no inventory. On the first tag with one, schedule each declared ZIP.
    const previous = taggedZipGroups(base) ?? (taggedGroups ? [] : ZIP_GROUPS);
    const singles = new Map(); // assetName -> sourcePath
    const touchedGroups = new Set(groups.filter(({ asset, files }) => {
        const old = previous.find((g) => g.asset === asset);
        return !old || JSON.stringify([...old.files].sort()) !== JSON.stringify([...files].sort());
    }).map((g) => g.asset));
    const ignored = [];

    for (const { status, path: p } of changes) {
        const rule = SINGLE_RULES.find((r) => r.test(p));
        const matchingGroups = groups.filter((g) => g.files.includes(p));
        if (rule) {
            const name = rule.name(p);
            if (status === 'D') {
                warnings.push(`配布ファイル ${p} が削除されています (添付なし)`);
            } else {
                if (singles.has(name)) errors.push(`Assets 名が重複しています: ${name} (${singles.get(name)} / ${p})`);
                singles.set(name, p);
            }
        }
        if (matchingGroups.length) {
            for (const group of matchingGroups) {
                if (status === 'D') errors.push(`${group.asset} の対象ファイル ${p} が削除されています。ZIP_GROUPS を見直してください`);
                touchedGroups.add(group.asset);
            }
        } else if (!rule) {
            ignored.push(p);
        }
    }

    const zips = [];
    for (const group of groups.filter((g) => touchedGroups.has(g.asset))) {
        const existing = new Set(git(['ls-tree', '-r', '--name-only', '-z', tag, '--', ...group.files]).split('\0').filter(Boolean));
        const missing = group.files.filter((f) => !existing.has(f));
        if (missing.length) errors.push(`${group.asset}: タグ ${tag} に存在しないファイルがあります: ${missing.join(', ')}`);
        zips.push({
            asset: group.asset,
            files: group.files.map((p) => ({ name: path.posix.basename(p), source: p })),
            paths: previous.find((g) => g.asset === group.asset)?.files ?? group.files,
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
    const candidates = git(['tag', '--contains', last, '--merged', base, '--sort=creatordate'])
        .split('\n')
        .map((s) => s.trim())
        .filter((t) => TAG_RE.test(t));
    let prevTag;
    let prevNames;
    let downloadError;
    for (const candidate of candidates) {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prevzip-'));
        try {
            try {
                execFileSync('gh', ['release', 'download', candidate, '-p', zip.asset, '-D', tmp], { stdio: ['ignore', 'pipe', 'pipe'] });
            } catch (e) {
                downloadError = String(e.stderr || e.message).trim();
                continue;
            }
            const file = path.join(tmp, zip.asset);
            if (!fs.existsSync(file)) continue;
            prevNames = readZip(fs.readFileSync(file)).map((e) => e.name);
            prevTag = candidate;
            break;
        } catch (e) {
            errors.push(`${zip.asset}: 過去リリース ${candidate} の zip を読めません: ${e.message}`);
            return;
        } finally {
            fs.rmSync(tmp, { recursive: true, force: true });
        }
    }
    if (!prevTag) {
        errors.push(`${zip.asset}: 対象の zip を含む過去リリースを取得できませんでした (--skip-zip-compare で省略可)` +
            (downloadError ? `\n${downloadError}` : ''));
        return;
    }
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

const BUILD_MARKER = '.release-assets-build.json';
const containsPath = (dir, file) => dir === file || file.startsWith(dir.endsWith(path.sep) ? dir : dir + path.sep);

function canonicalPath(file) {
    try {
        return fs.realpathSync(file);
    } catch (e) {
        if (e.code !== 'ENOENT') throw e;
        if (fs.lstatSync(file, { throwIfNoEntry: false })) throw e; // dangling symlink
        return path.join(canonicalPath(path.dirname(file)), path.basename(file));
    }
}

function outputPaths(opts) {
    const requestedOut = path.resolve(opts.out);
    const out = canonicalPath(requestedOut);
    const requestedManifest = path.resolve(opts.manifest);
    const manifest = path.join(canonicalPath(path.dirname(requestedManifest)), path.basename(requestedManifest));
    if (containsPath(requestedOut, requestedManifest) || containsPath(out, manifest) ||
        containsPath(out, canonicalPath(requestedManifest))) {
        throw new Error('--manifest は --out の外に指定してください');
    }
    const checkout = canonicalPath(git(['rev-parse', '--show-toplevel']).trim());
    const gitDir = canonicalPath(git(['rev-parse', '--absolute-git-dir']).trim());
    if (containsPath(out, checkout) || containsPath(out, gitDir) || containsPath(gitDir, out) ||
        fs.lstatSync(requestedOut, { throwIfNoEntry: false })?.isSymbolicLink()) {
        throw new Error(`--out に使用できないディレクトリです: ${requestedOut}`);
    }
    return { out, manifest };
}

function isPreviousBuild(dir) {
    try {
        if (!fs.lstatSync(dir).isDirectory()) return false;
        const marker = path.join(dir, BUILD_MARKER);
        if (!fs.lstatSync(marker).isFile()) return false;
        const { schema, assets } = JSON.parse(fs.readFileSync(marker, 'utf8'));
        if (schema !== 1 || !Array.isArray(assets)) return false;
        const names = [BUILD_MARKER, ...assets.map((a) => a.name)].sort();
        if (JSON.stringify(fs.readdirSync(dir).sort()) !== JSON.stringify(names)) return false;
        return assets.every(({ name, sha256: hash }) => {
            const file = path.join(dir, name);
            return fs.lstatSync(file).isFile() && sha256(fs.readFileSync(file)) === hash;
        });
    } catch {
        return false;
    }
}

function buildAndPublish(plan, opts, { out, manifest }) {
    const checkExisting = () => {
        const exists = !!fs.lstatSync(out, { throwIfNoEntry: false });
        if (exists && !isPreviousBuild(out)) throw new Error(`以前のビルドと確認できないため上書きしません: ${out}`);
        return exists;
    };
    checkExisting();
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const tmp = fs.mkdtempSync(path.join(path.dirname(out), '.release-assets-'));
    const stage = path.join(tmp, 'assets');
    const backup = path.join(tmp, 'previous');
    let keepBackup = false;
    try {
        fs.mkdirSync(stage);
        const assets = build(plan, opts.tag, stage);
        verify(stage, assets, opts.tag);
        if (errors.length) return assets;
        const inventory = assets.map(({ name, kind, size, sha256: h, sources }) => ({ name, kind, size, sha256: h, sources }));
        fs.writeFileSync(path.join(stage, BUILD_MARKER), JSON.stringify({ schema: 1, assets: inventory }));
        // Stage the manifest beside its destination so the final rename does not follow symlinks or hard links.
        const manifestStage = fs.mkdtempSync(path.join(path.dirname(manifest), '.release-manifest-'));
        try {
            const file = path.join(manifestStage, 'manifest.json');
            fs.writeFileSync(file, `${JSON.stringify({ tag: opts.tag, base: opts.base, assets: inventory, ignored: plan.ignored }, null, 2)}\n`);
            const replacing = checkExisting();
            if (replacing) fs.renameSync(out, backup);
            try {
                fs.renameSync(stage, out);
                try {
                    fs.renameSync(file, manifest);
                } catch (e) {
                    fs.renameSync(out, stage);
                    throw e;
                }
            } catch (e) {
                if (replacing) {
                    keepBackup = true;
                    fs.renameSync(backup, out);
                    keepBackup = false;
                }
                throw e;
            }
        } finally {
            fs.rmSync(manifestStage, { recursive: true, force: true });
        }
        return assets;
    } finally {
        if (!keepBackup) fs.rmSync(tmp, { recursive: true, force: true });
    }
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
                entries = readZip(buf, true);
            } catch (e) {
                errors.push(`${a.name}: ${e.message}`);
                continue;
            }
            if (new Set(entries.map((e) => e.name)).size !== entries.length) {
                errors.push(`${a.name}: エントリ名が重複しています`);
                continue;
            }
            const got = new Map(entries.map((e) => [e.name, e]));
            if (got.size !== a.entries.length) errors.push(`${a.name}: エントリ数が一致しません (${got.size} / 期待 ${a.entries.length})`);
            a.entries.forEach((name, i) => {
                const src = blob(tag, a.sources[i]);
                const e = got.get(name);
                if (!e) errors.push(`${a.name}: ${name} が含まれていません`);
                else if (!e.data.equals(src)) errors.push(`${a.name}: ${name} の内容が ${tag} と一致しません`);
            });
        }
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
let plan;
try {
    plan = buildPlan(changes, opts.base, opts.tag);
} catch (e) {
    fail(e.message);
}

if (!opts.dryRun) {
    for (const req of REQUIRED_ASSETS) {
        if (!plan.singles.has(req)) errors.push(`必須の Assets ${req} がありません (バージョン更新が反映されていない可能性)`);
    }
}

if (!opts.skipZipCompare && !opts.dryRun) for (const zip of plan.zips) compareWithPreviousZip(zip, opts.base);

let destinations;
try {
    if (!opts.dryRun) destinations = outputPaths(opts);
} catch (e) {
    errors.push(e.message);
}

let assets;
if (opts.dryRun || errors.length) {
    assets = [
        ...[...plan.singles].map(([name, src]) => ({ name, kind: 'file', sources: [src], size: 0 })),
        ...plan.zips.map((z) => ({ name: z.asset, kind: 'zip', sources: z.files.map((f) => f.source), entries: z.files.map((f) => f.name), size: 0 })),
    ];
} else {
    try {
        assets = buildAndPublish(plan, opts, destinations);
    } catch (e) {
        errors.push(e.message);
        assets = [];
    }
}

report({ tag: opts.tag, base: opts.base, assets, ignored: plan.ignored });
if (errors.length) process.exit(1);
