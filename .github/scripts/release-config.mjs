/**
 * .github/scripts/release-config.mjs
 *
 * リリース関連スクリプト共通の定義。
 * 「どのファイルを Assets に添付するか」「Files changed 表のどの行に対応するか」を
 * 1か所で管理し、build-release-assets.mjs と collect-release-facts.mjs が同じ判定を使う。
 */
import path from 'node:path';

export const TAG_RE = /^v\d+\.\d+\.\d+$/;

/** 個別に添付するファイル (name: Assets 名 / row: Files changed 表の行の特定条件) */
export const SINGLE_RULES = [
    {
        test: (p) => p === 'js/danoni_main.js',
        name: () => 'danoni_main.js',
        row: () => ({ dir: '/js', names: ['danoni_main.js'] }),
    },
    {
        test: (p) => /^js\/lib\/[^/]+\.js$/.test(p),
        name: (p) => path.posix.basename(p),
        row: (p) => ({ dir: '/js/lib', names: [path.posix.basename(p)] }),
    },
    {
        test: (p) => p === 'css/danoni_main.css',
        name: () => 'danoni_main.css',
        row: () => ({ dir: '/css', names: ['danoni_main.css'] }),
    },
    {
        // リポジトリ上は danoni_setting.js、配布名は danoni_setting-template.js、表示は結合表記
        test: (p) => p === 'js/template/danoni_setting.js',
        name: () => 'danoni_setting-template.js',
        row: () => ({ dir: '/js/template', names: ['danoni_setting(-template).js', 'danoni_setting.js', 'danoni_setting-template.js'] }),
    },
];

/**
 * zip にまとめて添付するファイル。中身はディレクトリ全体ではなく「明示したファイル」だけ
 * (Files changed 表の行と同じ)。img/ にはサブフォルダ・png・frzbar.svg 等があるが含めない。
 * 増減する場合はここを意図して編集すること (過去 zip との比較で検知される)。
 */
export const ZIP_GROUPS = [
    {
        asset: 'skin_css.zip',
        files: ['skin/danoni_skin_default.css', 'skin/danoni_skin_light.css', 'skin/danoni_skin_skyblue.css'],
    },
    {
        asset: 'img.zip',
        files: [
            'img/aaShadow.svg', 'img/arrow.svg', 'img/arrowShadow.svg', 'img/borderline.svg', 'img/c.svg', 'img/cursor.svg',
            'img/giko.svg', 'img/iyo.svg', 'img/monar.svg', 'img/morara.svg', 'img/onigiri.svg',
        ],
    },
];

/** 毎リリース必ず変わる(バージョン番号を含む)ため、欠けていたら異常とみなす */
export const REQUIRED_ASSETS = ['danoni_main.js'];

/**
 * 変更パスを Assets / Files changed 表の行に対応付ける。対象外なら null。
 * @returns {{kind:'file'|'zip', asset:string, row:{dir:string,names?:string[]}}|null}
 */
export function classifyPath(p) {
    const rule = SINGLE_RULES.find((r) => r.test(p));
    if (rule) return { kind: 'file', asset: rule.name(p), row: rule.row(p) };
    const group = ZIP_GROUPS.find((g) => g.files.includes(p));
    if (group) return { kind: 'zip', asset: group.asset, row: { dir: `/${path.posix.dirname(group.files[0])}` } };
    return null;
}