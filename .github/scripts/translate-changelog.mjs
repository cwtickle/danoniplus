#!/usr/bin/env node
/**
 * .github/scripts/translate-changelog.mjs
 *
 * Changelog の英語版に使う箇条書きだけを英訳する。この工程だけが LLM (Anthropic API) を使う。
 * 対訳辞書と文体は .github/prompts/changelog-translate.md に置き、この script はそれを system prompt として渡す。
 * ※ 現状未使用だが、今後のためにスクリプトだけ残す方針とする。
 *
 * 使い方:
 *   ANTHROPIC_API_KEY=... node .github/scripts/translate-changelog.mjs \
 *        --in changelog-out/bullets-ja.json --prompt .github/prompts/changelog-translate.md --out changelog-out/bullets-en.json
 *
 * 環境変数:
 *   ANTHROPIC_API_KEY            必須
 *   CHANGELOG_TRANSLATE_MODEL    省略時 claude-sonnet-5-5
 */
import fs from 'node:fs';

function fail(msg) {
    console.error(`::error::${msg}`);
    process.exit(1);
}

const o = {};
const valued = { '--in': 'in', '--prompt': 'prompt', '--out': 'out' };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
    const key = valued[argv[i]];
    if (!key) fail(`未知の引数: ${argv[i]}`);
    o[key] = argv[++i];
}
for (const k of ['in', 'prompt', 'out']) if (!o[k]) fail(`--${k} を指定してください`);

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) fail('ANTHROPIC_API_KEY が設定されていません');
const model = process.env.CHANGELOG_TRANSLATE_MODEL || 'claude-sonnet-5-5';

const input = JSON.parse(fs.readFileSync(o.in, 'utf8'));
const system = fs.readFileSync(o.prompt, 'utf8');
if (!Array.isArray(input) || !input.length) fail('--in に翻訳対象がありません');

const user = `次の JSON 配列の ja を英訳し、{ "key": …, "en": … } の配列だけを同じ順序で出力してください。\n\n${JSON.stringify(
    input.map(({ key, section, ja }) => ({ key, section, ja })),
    null,
    2,
)}`;

const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: 4096, system, messages: [{ role: 'user', content: user }] }),
});
if (!res.ok) fail(`Anthropic API が失敗しました: ${res.status} ${(await res.text()).slice(0, 300)}`);
const text = (await res.json()).content?.map((c) => c.text ?? '').join('') ?? '';

let out;
try {
    out = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim());
} catch (e) {
    fail(`英訳の JSON を読めません: ${e.message}`);
}
if (!Array.isArray(out) || out.length !== input.length) fail(`英訳の件数が一致しません (期待 ${input.length}, 実際 ${Array.isArray(out) ? out.length : '配列でない'})`);
const result = input.map((it, i) => {
    if (out[i]?.key !== it.key || typeof out[i].en !== 'string' || !out[i].en.trim()) fail(`英訳の ${it.key} が不正です`);
    // PR 番号・リンク・改行は script 側で付けるため、混入していたら止める
    if (/\(\s*PR\b|https?:\/\/|\n/.test(out[i].en)) fail(`英訳の ${it.key} に PR 表記・URL・改行が含まれています: ${out[i].en}`);
    return { key: it.key, en: out[i].en.trim() };
});
fs.writeFileSync(o.out, `${JSON.stringify(result, null, 2)}\n`);
console.log(`英訳しました (${result.length} 件, model: ${model}) -> ${o.out}`);