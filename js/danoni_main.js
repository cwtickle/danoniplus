'use strict';
/**
 * Dancing☆Onigiri (CW Edition)
 * 
 * Source by tickle
 * Created : 2018/10/08
 * Revised : 2025/02/01
 * 
 * https://github.com/cwtickle/danoniplus
 */
const g_version = `Ver 39.0.0`;
const g_revisedDate = `2025/02/01`;

// カスタム用バージョン (danoni_custom.js 等で指定可)
let g_localVersion = ``;
let g_localVersion2 = ``;

// ショートカット用文字列(↓の文字列を検索することで対象箇所へジャンプできます)
//  共通:water 初期化:peach タイトル:melon 設定:lime ディスプレイ:lemon 拡張設定:apple キーコンフィグ:orange 譜面読込:strawberry メイン:banana 結果:grape
//  シーンジャンプ:Scene

/**
 * ▽ 画面の構成
 *  [タイトル]-[設定]-[ディスプレイ]-[キーコンフィグ]-[譜面読込]-[メイン]-[リザルト]
 *  ⇒ 各画面に Init がついたものが画面の基本構成(ルート)を表す。
 * 
 * ▽ スプライトの親子関係
 *  基本的にdiv要素で管理。最下層を[divRoot]とし、createEmptySprite()でdiv子要素を作成。
 *  clearWindow()で[divRoot]以外の全てのスプライトを削除。
 *  特定のスプライトに限り削除する場合は deleteChildspriteAll() 。
 */
const current = () => {
	if (document.currentScript) {
		return document.currentScript.src;
	}
	const scripts = Array.from(document.getElementsByTagName(`script`));
	const targetScript = scripts.find(file => file.src.endsWith(`danoni_main.js`));
	return targetScript.src;
};
const g_rootPath = current().match(/(^.*\/)/)[0];
const g_workPath = new URL(location.href).href.match(/(^.*\/)/)[0];
const g_remoteFlg = g_rootPath.match(`^https://cwtickle.github.io/danoniplus/`) !== null ||
	g_rootPath.match(/danoniplus.netlify.app/) !== null;
const g_randTime = Date.now();
const g_isFile = location.href.match(/^file/);
const g_isLocal = location.href.match(/^file/) || location.href.indexOf(`localhost`) !== -1;
const isLocalMusicFile = _scoreId => g_isFile && !listMatching(getMusicUrl(_scoreId), [`.js`, `.txt`], { suffix: `$` });

window.onload = async () => {
	g_loadObj.main = true;
	g_currentPage = `initial`;
	const links = document.querySelectorAll(`link`);
	if (Array.from(links).filter(elem => elem.getAttribute(`href`).indexOf(`danoni_main.css`) !== -1).length === 0) {
		await importCssFile2(`${g_rootPath}../css/danoni_main.css?${g_randTime}`);
	}

	// ロード直後に定数・初期化ファイル、旧バージョン定義関数を読込
	await loadScript2(`${g_rootPath}../js/lib/danoni_localbinary.js?${g_randTime}`, false);
	await loadScript2(`${g_rootPath}../js/lib/danoni_constants.js?${g_randTime}`);
	await loadScript2(`${g_rootPath}../js/lib/legacy_functions.js?${g_randTime}`, false);
	initialControl();
};

/*-----------------------------------------------------------*/
/* Scene : COMMON [water] */
/*-----------------------------------------------------------*/

// fps(デフォルトは60)
let g_fps = 60;

// 譜面データの&区切りを有効にするか
let g_enableAmpersandSplit = true;

// 譜面データをdecodeURIするか
let g_enableDecodeURI = false;

// プリロード済ファイル
const g_preloadFiles = {
	all: [],
	image: [],
	font: [],
};

// 矢印サイズ
const C_ARW_WIDTH = 50;

// ON/OFFスイッチ
const C_FLG_ON = `ON`;
const C_FLG_OFF = `OFF`;
const C_FLG_ALL = `ALL`;
const C_DIS_NONE = `none`;
const C_DIS_INHERIT = `inherit`;

// 初期化フラグ（ボタンアニメーション制御）
let g_initialFlg = false;

let g_currentPage = ``;

// キーコンフィグ初期設定
let g_kcType = `Main`;
let g_colorType = `Default`;
let g_imgType = `Original`;

// ライフ・ゲームオーバー・曲終了管理
let g_maxScore = 1000000;
let g_gameOverFlg = false;
let g_finishFlg = true;

/** 共通オブジェクト */
const g_loadObj = {};
const g_rootObj = {};
const g_presetObj = {
	keysDataLib: [],
};
let g_headerObj = {};
let g_scoreObj = {};
let g_attrObj = {};

const g_btnFunc = {
	base: {}, reset: {}, cxt: {},
};
let g_btnAddFunc = {};
let g_btnDeleteFlg = {};
let g_cxtAddFunc = {};
let g_cxtDeleteFlg = {};

const g_detailObj = {
	arrowCnt: [],
	frzCnt: [],
	maxDensity: [],
	maxDensity2Push: [],
	maxDensity3Push: [],
	densityData: [],
	density2PushData: [],
	density3PushData: [],
	densityDiff: [],
	density2PushDiff: [],
	density3PushDiff: [],
	startFrame: [],
	playingFrame: [],
	playingFrameWithBlank: [],
	speedData: [],
	boostData: [],
	toolDif: [],
};

const g_workObj = {
	stepX: [],
	stepRtn: [],
	stepHitRtn: [],
	arrowRtn: [],
	keyCtrl: [],
	keyCtrlN: [],
	keyHitFlg: [],
	scrollDir: [],
	dividePos: [],
	nonDefaultSc: false,
};

// 歌詞制御
let g_wordSprite;

const g_wordObj = {
	wordDir: 0,
	wordDat: ``,
	fadeInFlg0: false,
	fadeInFlg1: false,
	fadeOutFlg0: false,
	fadeOutFlg1: false,
};

// オーディオ設定・タイマー管理
let g_audio = new Audio();
let g_timeoutEvtId = 0;
let g_timeoutEvtTitleId = 0;
let g_timeoutEvtResultId = 0;
let g_inputKeyBuffer = {};

// 音楽ファイル エンコードフラグ
let g_musicEncodedFlg = false;

// 外部dosデータ
let g_externalDos = ``;
let g_musicdata = ``;

let g_langStorage = {};

// ローカルストレージ設定 (作品別)
let g_localStorage;
let g_localStorageUrl;

// ローカルストレージ設定 (ドメイン・キー別)
let g_localKeyStorage;
let g_canLoadDifInfoFlg = false;

/*-----------------------------------------------------------*/
/* 要素・属性                                                 */
/*-----------------------------------------------------------*/

/**
 * div要素のstyleを取得
 * @param {string} _id 
 * @returns {CSSStyleDeclaration}
 */
const $id = _id => document.getElementById(_id).style;

/**
 * 複数のdiv子要素を親要素へ接続
 * @param {Element} _baseObj 
 * @param {...any} [rest] 
 */
const multiAppend = (_baseObj, ...rest) => _baseObj.append(...rest);

/**
 * 複数の属性をまとめて設定
 * @param {Element} _baseObj 
 * @param {...any} [rest] 
 */
const setAttrs = (_baseObj, { ...rest } = {}) =>
	Object.keys(rest).forEach(property => _baseObj.setAttribute(property, rest[property]));

/**
 * 属性値を数値に変換して取得
 * @param {Element} _baseObj 
 * @param {string} _attrkey 
 * @returns {number}
 */
const getNumAttr = (_baseObj, _attrkey) => parseFloat(_baseObj.getAttribute(_attrkey));

/**
 * 文字列に埋め込まれた変数を展開
 * @param {string} _str 
 * @returns {string} 埋め込み後の変数
 */
const convertStrToVal = _str => {
	if (!hasVal(_str)) return _str;
	const strs = _str.split(`}`).join(`{`).split(`{`);
	let convStrs = ``;
	for (let j = 0; j < strs.length; j += 2) {
		convStrs += escapeHtmlForEnabledTag(strs[j]);
		convStrs += setVal(strs[j + 1], ``, C_TYP_CALC);
	}
	return convStrs;
};

/**
 * 半角スペース、タブを文字列から除去
 * @param {string} _str 
 * @returns {string} 半角スペース、タブ除去後の文字列
 */
const trimStr = _str => _str?.split(`\t`).join(``).replace(/^ +| +$/g, ``);

/*-----------------------------------------------------------*/
/* 値や配列のチェック・変換                                    */
/*-----------------------------------------------------------*/

/**
 * 変数が存在するかどうかをチェック
 * @param {string} _data
 * @param {...any} [strs] 空とundefined以外で除外したい文字列
 * @returns {boolean}
 */
const hasVal = (_data, ...strs) => _data !== undefined && _data !== `` && (!strs || strs.every(str => _data !== str));

/**
 * 変数が存在するかどうかをチェック(null無しを含む)
 * @param {string} _data
 * @param {...any} [strs]
 * @returns {boolean}
 */
const hasValN = (_data, ...strs) => hasVal(_data, ...strs) && _data !== null;

/**
 * 文字列から他の型へ変換する処理群
 * @param {string} _checkStr
 * @param {string} _default
 * @returns {number|boolean|string}
 */
const g_convFunc = {
	float: (_checkStr, _default) => isNaN(parseFloat(_checkStr)) ? _default : parseFloat(_checkStr),
	number: (_checkStr, _default) => isNaN(parseInt(_checkStr)) ? _default : parseInt(_checkStr),
	boolean: (_checkStr, _default) => _checkStr.toString().toLowerCase() === `true` ? true :
		(_checkStr.toString().toLowerCase() === `false` ? false : _default),
	switch: (_checkStr, _default) => [C_FLG_OFF, C_FLG_ON].includes(_checkStr.toString().toUpperCase()) ? _checkStr.toString().toUpperCase() : _default,
	calc: (_checkStr, _default) => {
		try {
			return new Function(`return ${_checkStr}`)();
		} catch (err) {
			return _default;
		}
	},
	string: (_checkStr) => _checkStr,
};

/**
 * 文字列を想定された型に変換
 * - _type は `float`(小数)、`number`(整数)、`boolean`(真偽値)、
 *   `switch`(ON/OFF), `calc`(数式), `string`(文字列)から選択
 * - 型に合わない場合は _default を返却するが、_default自体の型チェック・変換は行わない
 * @param {string} _checkStr 
 * @param {string} _default 
 * @param {string} [_type='string'] 
 * @returns 
 */
const setVal = (_checkStr, _default, _type = C_TYP_STRING) =>
	hasValN(_checkStr) ? g_convFunc[_type](_checkStr, _default) : _default;

/**
 * ブール値からON/OFFへ変換
 * @param {boolean} _condition 
 * @returns {string}
 */
const boolToSwitch = _condition => _condition ? C_FLG_ON : C_FLG_OFF;

/**
 * 単位付きの値を返却
 * @param {number} _val 
 * @param {string} [_unitName='px'] 
 * @returns {string}
 */
const wUnit = (_val, _unitName = `px`) => `${_val}${_unitName}`;

/**
 * ブール値への変換
 * @param {string} _val 
 * @param {boolean} [_defaultVal=false]
 * @returns {boolean}
 */
const setBoolVal = (_val, _defaultVal = false) => hasValN(_val) ? g_convFunc.boolean(_val, _defaultVal) : _defaultVal;

/**
 * 整数値への変換
 * @param {string} _val 
 * @param {number} [_defaultVal=0]
 * @returns {number}
 */
const setIntVal = (_val, _defaultVal = 0) => hasValN(_val) ? g_convFunc.number(_val, _defaultVal) : _defaultVal;

/**
 * 先頭のみ大文字に変換（それ以降はそのまま）
 * @param {string} _str 
 * @returns {string}
 */
const toCapitalize = _str => {
	if (!_str || typeof _str !== `string`) return _str;
	return `${_str.charAt(0).toUpperCase()}${_str.slice(1)}`;
};

/**
 * 0以上の数字に変換
 * @param {number} _num 
 * @param {number} [_init=0] 0未満の場合に設定する値
 * @returns {number}
 */
const roundZero = (_num, _init = 0) => _num < 0 ? _init : _num;

/**
 * 配列から_targetに合致する配列位置を返す
 * 存在しない場合は0を返却
 * @param {string[]} _list 
 * @param {string} _target
 * @returns {number}
 */
const getCurrentNo = (_list, _target) => roundZero(_list.indexOf(_target));

/**
 * 配列内に存在するかどうかをチェック
 * @param {string} _val 
 * @param {string[]} _array 
 * @param {number} [_pos=0]
 * @returns {boolean}
 */
const hasValInArray = (_val, _array, _pos = 0) =>
	_array.findIndex(data => data[_pos] === _val) !== -1;

/**
 * 配列が既定長以上かどうかをチェック
 * @param {any[]} _data 
 * @param {number} [_length=1]
 * @returns {boolean}
 */
const hasArrayList = (_data, _length = 1) => _data?.length >= _length;

/**
 * 改行コード区切りの配列展開
 * @param {string} _str
 * @returns {string[]}
 */
const splitLF = _str => _str?.split(`\r`).join(`\n`).split(`\n`);

/**
 * 改行コード区切りを本来の区切り文字に変換して配列展開
 * （改行区切りで間が空行だった場合は無効化）
 * @param {string} _str 
 * @param {string} [_delim='$']
 * @returns {string[]}
 */
const splitLF2 = (_str, _delim = `$`) => splitLF(_str)?.filter(val => val !== ``).join(_delim).split(_delim);

/**
 * カンマ区切り処理
 * （ただし、カンマ+半角スペースの組の場合は区切り文字と見做さない）
 * @param {string} _str 
 * @returns {string[]}
 */
const splitComma = _str => _str?.split(`, `).join(`*comma* `).split(`,`);

/**
 * 重複を排除した配列の生成
 * @param {any[]} _array1 
 * @param {...any} [_arrays]
 * @returns {any[]}
 */
const makeDedupliArray = (_array1, ..._arrays) =>
	Array.from((new Set([..._array1, ..._arrays.flat()])).values()).filter(val => val !== undefined);

/**
 * 二次元配列のコピー
 * @param {any[][]} _array2d
 * @returns {any[][]}
 */
const copyArray2d = _array2d => structuredClone(_array2d);

/**
 * 配列データを合計
 * @param {number[]} _array
 * @returns {number}
 */
const sumData = _array => _array.reduce((p, x) => p + x);

/**
 * 特定の値で埋めた配列を作成
 * @param {number} _length 
 * @param {string|number} [_val=0] 
 * @returns {string[]|number[]}
 */
const fillArray = (_length, _val = 0) => [...Array(_length)].fill(_val);

/**
 * 最小配列長の配列を作成
 * @param {any[]} _array 
 * @param {number} _minLength 
 * @param {number} _defaultVal
 * @returns {string[]|number[]}
 */
const makeBaseArray = (_array = [], _minLength, _defaultVal) => padArray(_array, fillArray(_minLength, _defaultVal));

/**
 * ベースとする配列に対して別の配列で上書き
 * @param {string[]|number[]} _array 
 * @param {string[]|number[]} _baseArray ベースとする配列
 * @returns {string[]|number[]}
 */
const padArray = (_array, _baseArray) => {
	_array?.filter(val => hasVal(val)).forEach((val, j) => _baseArray[j] = val);
	return _baseArray;
};

/**
 * 配列から上位N番目までに一致する位置を取得
 * 
 * ex. 上位3番目 (_num = 3) の場合
 *     [1, 3, 2, 4, 6, 4, 5] -> [[4], [6], [3, 5]]
 *     [9, 6, 9, 9, 8, 7, 5] -> [[0, 2, 3]]
 * @param {number[]} _array 
 * @param {number} [_num=1]
 * @returns {number[][]}
 */
const getMaxValIdxs = (_array, _num = 1) => {
	let baseArray = _array.concat();
	const maxIdxs = [];

	for (let j = 0; j < _num; j++) {
		maxIdxs[j] = [];
		const maxVal = baseArray.reduce((a, b) => Math.max(a, b));
		_array.map((val, idx) => {
			if (val === maxVal) {
				maxIdxs[j].push(idx);
			}
		});
		baseArray = baseArray.filter(val => val < maxVal);

		// 同率で上位N番目まで取得した場合は途中で終了
		if (baseArray.length === 0 || maxIdxs.flat().length >= _num) {
			break;
		}
	}
	return maxIdxs;
};

/**
 * 部分一致検索（リストのいずれかに合致、大小文字問わず）
 * @param {string} _str 検索文字
 * @param {string[]} _list 検索リスト (英字は小文字にする必要あり)
 * @param {string} [object.prefix=''] 前方一致条件 (前方一致時は ^)
 * @param {string} [object.suffix=''] 後方一致条件 (後方一致時は $)
 * @returns {boolean}
 */
const listMatching = (_str, _list, { prefix = ``, suffix = `` } = {}) =>
	_list.findIndex(value => _str.toLowerCase().match(new RegExp(String.raw`${prefix}${value}${suffix}`, 'i'))) !== -1;

/**
 * 前方・後方一致検索の組み合わせ（あいまい検索）
 * @param {string} _str 検索文字
 * @param {string[]} _headerList 前方一致させるリスト
 * @param {string[]} _footerList 後方一致させるリスト
 * @returns {boolean}
 */
const fuzzyListMatching = (_str, _headerList, _footerList) =>
	listMatching(_str, _headerList, { prefix: `^` }) || listMatching(_str, _footerList, { suffix: `$` });

/**
 * 文字列の置換
 * @param {string} _str 
 * @param {string[][]} _pairs 置換ペア配列。[[置換前A,置換後A],[置換前B,置換後B]]の形式で指定
 * @returns {string} 置換後文字列
 */
const replaceStr = (_str, _pairs) => {
	if (_str === undefined) {
		return _str;
	}
	let tmpStr = _str;
	_pairs.forEach(pair => tmpStr = String(tmpStr)?.split(pair[0]).join(pair[1]));
	return tmpStr;
};

/**
 * 文字列のエスケープ処理
 * @param {string} _str 
 * @param {string[][]} [_escapeList=g_escapeStr.escape]
 * @returns {string}
 */
const escapeHtml = (_str, _escapeList = g_escapeStr.escape) => escapeHtmlForEnabledTag(replaceStr(_str, _escapeList));

/**
 * 文字列のエスケープ処理(htmlタグ許容版)
 * @param {string} _str 
 * @returns {string}
 */
const escapeHtmlForEnabledTag = _str => replaceStr(_str, g_escapeStr.escapeTag);

/**
 * HTML Entityから元の文字に戻す
 * @param {string} _str 
 * @returns {string}
 */
const unEscapeEmoji = _str => _str?.replace(/&#(.*?);/g, (_, p1) => String.fromCodePoint(`0${p1}`));

/**
 * エスケープ文字を元の文字に戻す
 * @param {string} _str 
 * @returns {string}
 */
const unEscapeHtml = _str => unEscapeEmoji(replaceStr(_str, g_escapeStr.unEscapeTag));

/**
 * 配列の中身を全てエスケープ処理
 * @param {string[]} _array 
 * @returns {string[]}
 */
const escapeHtmlForArray = _array => _array.map(str => escapeHtml(str));

/**
 * 次のカーソルへ移動
 * @param {number} _basePos 
 * @param {number} _num 
 * @param {number} _length
 * @returns {number}
 */
const nextPos = (_basePos, _num, _length) => (_basePos + _num + _length) % _length;

/*-----------------------------------------------------------*/
/* キーコード関連                                             */
/*-----------------------------------------------------------*/

/**
 * 特定キーコードを置換する処理
 * @param {KeyboardEvent} _evt 
 * @returns {string}
 */
const transCode = _evt => {
	const evtCode = _evt.code;
	if (evtCode === `` && _evt.key === `Shift`) {
		return `ShiftRight`;
	}
	return evtCode;
};

/**
 * 特定キーをブロックする処理
 * @param {string} _setCode 
 * @returns {boolean}
 */
const blockCode = _setCode => !C_BLOCK_KEYS.includes(_setCode);

/*-----------------------------------------------------------*/
/* ショートカット制御                                          */
/*-----------------------------------------------------------*/

/**
 * キーを押したときの動作（汎用）
 * @param {KeyboardEvent} _evt 
 * @param {string} _displayName 
 * @param {function} _func
 * @param {boolean} _dfEvtFlg
 * @returns {boolean}
 */
const commonKeyDown = (_evt, _displayName, _func = _code => { }, _dfEvtFlg) => {
	if (!_dfEvtFlg) {
		_evt.preventDefault();
	}
	const setCode = transCode(_evt);
	if (_evt.repeat && (g_unrepeatObj.page.includes(_displayName) || g_unrepeatObj.key.includes(setCode))) {
		return blockCode(setCode);
	}
	g_inputKeyBuffer[setCode] = true;

	// 対象ボタンを検索
	const scLists = Object.keys(g_shortcutObj[_displayName])
		.filter(keys => keys.split(`_`).every(key => keyIsDown(key)));
	if (scLists.length > 0) {
		// リンク先にジャンプする場合はonkeyUpイベントが動かないため、事前にキー状態をリセット
		if (g_shortcutObj[_displayName][scLists[0]].reset) {
			g_inputKeyBuffer[setCode] = false;
		}
		// 対象ボタン処理を実行
		const targetId = document.getElementById(g_shortcutObj[_displayName][scLists[0]].id);
		if (targetId !== null && targetId.style.display !== C_DIS_NONE && targetId.style.pointerEvents !== C_DIS_NONE) {
			targetId.click();
		}
		return blockCode(setCode);
	}
	_func(setCode);
	return blockCode(setCode);
};

/**
 * キーを離したときの動作（汎用）
 * @param {KeyboardEvent} _evt 
 */
const commonKeyUp = _evt => {
	g_inputKeyBuffer[g_kCdNameObj.metaLKey] = false;
	g_inputKeyBuffer[g_kCdNameObj.metaRKey] = false;
	g_inputKeyBuffer[transCode(_evt)] = false;
};

/**
 * ショートカットキー表示
 * @param {object} _obj
 * @param {string} _settingLabel 
 * @param {string} [object.displayName='option'] 
 * @param {string} [object.dfLabel=''] ショートカットキーの表示名
 * @param {string} [object.targetLabel='lnk${_settingLabel}R'] ショートカットキーを押したときのボタン名
 * @param {number} [object.x=g_scViewObj.x]
 * @param {number} [object.y=g_scViewObj.y]
 * @param {number} [object.w=g_scViewObj.w]
 * @param {number} [object.siz=g_scViewObj.siz]
 */
const createScText = (_obj, _settingLabel, { displayName = `option`, dfLabel = ``, targetLabel = `lnk${_settingLabel}R`,
	x = g_scViewObj.x, y = g_scViewObj.y, w = g_scViewObj.w, siz = g_scViewObj.siz } = {}) => {
	const scKey = Object.keys(g_shortcutObj[displayName]).filter(key => g_shortcutObj[displayName][key].id === targetLabel);
	if (scKey.length > 0) {
		multiAppend(_obj,
			createDivCss2Label(`sc${_settingLabel}`,
				g_scViewObj.format.split(`{0}`).join(dfLabel || (`${g_kCd[g_kCdN.findIndex(kCd => kCd === scKey[0])] ?? ''}`)), {
				x, y, w, siz, fontWeight: `bold`, opacity: 0.75, pointerEvents: C_DIS_NONE,
			})
		);
	}
};

/**
 * 各画面の汎用ショートカットキー表示
 * @param {string} _displayName 
 */
const createScTextCommon = _displayName =>
	Object.keys(g_btnPatterns[_displayName]).filter(target => document.getElementById(`btn${target}`) !== null)
		.forEach(target =>
			createScText(document.getElementById(`btn${target}`), target, {
				displayName: _displayName, targetLabel: `btn${target}`,
				dfLabel: g_lblNameObj[`sc_${_displayName}${target}`] ?? ``,
				x: g_btnPatterns[_displayName][target],
			}));

/**
 * ショートカットキー有効化
 * @param {string} _displayName
 * @param {function} _func 
 * @param {boolean} [object.displayFlg=true]
 * @param {boolean} [object.dfEvtFlg=false] 
 */
const setShortcutEvent = (_displayName, _func = () => true, { displayFlg = true, dfEvtFlg = false } = {}) => {
	if (displayFlg) {
		createScTextCommon(_displayName);
	}
	const evList = () => {
		document.onkeydown = evt => commonKeyDown(evt, _displayName, _func, dfEvtFlg);
		document.onkeyup = evt => commonKeyUp(evt);
	};
	if (g_initialFlg && g_btnWaitFrame[_displayName].initial) {
		evList();
	} else {
		setTimeout(() => {
			if (g_currentPage === _displayName) {
				evList();
			}
		}, g_btnWaitFrame[_displayName].s_frame * 1000 / g_fps);
	}
};


/*-----------------------------------------------------------*/
/* ファイル・リンク制御                                        */
/*-----------------------------------------------------------*/

/**
 * 外部リンクを新規タブで開く
 * @param {string} _url 
 */
const openLink = _url => {
	if (_url.match(`^(http|https):/`)) {
		window.open(_url, `_blank`, `noopener`);
	}
};

/**
 * URLのフルパスを取得
 * @param {string} _url
 * @returns {string}
 */
const getFullPath = _url => {
	const link = document.createElement(`a`);
	link.href = _url;
	return link.href;
};

/**
 * プリロードするファイルの設定
 * @param {string} _as 
 * @param {string} _href 
 * @param {string} [_type=''] 
 * @param {string} [_crossOrigin='anonymous'] 
 */
const preloadFile = (_as, _href, _type = ``, _crossOrigin = `anonymous`) => {

	const preloadFlg = g_preloadFiles.all.find(v => v === _href);

	if (preloadFlg === undefined) {
		g_preloadFiles.all.push(_href);
		g_preloadFiles[_as]?.push(_href) || (g_preloadFiles[_as] = [_href]);

		const link = document.createElement(`link`);
		link.rel = `preload`;
		link.as = _as;
		link.href = _href;
		if (_type !== ``) {
			link.type = _type;
		}
		if (!g_isFile) {
			link.crossOrigin = _crossOrigin;
		}
		document.head.appendChild(link);
	}
};

/**
 * 外部jsファイルの読込 (Promise)
 * 読込可否を g_loadObj[ファイル名] で管理 (true: 読込成功, false: 読込失敗)
 * @param {string} _url 
 * @param {boolean} [_requiredFlg=true] 読込必須フラグ
 * @param {string} [_charset='UTF-8']
 * @returns {Promise<any>}
 */
const loadScript2 = (_url, _requiredFlg = true, _charset = `UTF-8`) => {
	const baseUrl = _url.split(`?`)[0];
	g_loadObj[baseUrl] = false;

	return new Promise((resolve, reject) => {
		const script = document.createElement(`script`);
		script.type = `text/javascript`;
		script.src = _url;
		script.charset = _charset;
		script.onload = () => {
			g_loadObj[baseUrl] = true;
			resolve(script);
		};
		script.onerror = _err => {
			if (_requiredFlg) {
				makeWarningWindow(g_msgInfoObj.E_0041.split(`{0}`).join(getFullPath(baseUrl)));
				reject(_err);
			} else {
				resolve(script);
			}
		};
		document.querySelector(`head`).appendChild(script);
	});
};

/**
 * CSSファイルの読み込み (Promise)
 * デフォルトは danoni_skin_default.css を読み込む
 * @param {url} _href 
 * @param {string} [object.crossOrigin='anonymous'] 
 * @returns {Promise<any>}
 */
const importCssFile2 = (_href, { crossOrigin = `anonymous` } = {}) => {
	const baseUrl = _href.split(`?`)[0];
	g_loadObj[baseUrl] = false;

	return new Promise(resolve => {
		const link = document.createElement(`link`);
		link.rel = `stylesheet`;
		link.href = _href;
		if (!g_isFile) {
			link.crossOrigin = crossOrigin;
		}
		link.onload = () => {
			g_loadObj[baseUrl] = true;
			resolve(link);
		};
		link.onerror = () => {
			makeWarningWindow(g_msgInfoObj.E_0041.split(`{0}`).join(getFullPath(baseUrl)), { resetFlg: `title` });
			resolve(link);
		};
		document.head.appendChild(link);
	});
};

/**
 * js, cssファイルの連続読込 (async function)
 * @param {string[]} _fileData 
 * @param {string} _loadType
 * @returns {Promise<void>}
 */
const loadMultipleFiles2 = async (_fileData, _loadType) => {
	await Promise.all(_fileData.map(async filePart => {
		const filePath = `${filePart[1]}${filePart[0]}?${g_randTime}`;
		if (filePart[0].endsWith(`.css`)) {
			_loadType = `css`;
		}

		// jsファイル、cssファイルにより呼び出す関数を切替
		if (_loadType === `js`) {
			await loadScript2(filePath, false);
		} else if (_loadType === `css`) {
			const cssPath = filePath.split(`.js`).join(`.css`);
			await importCssFile2(cssPath);
		}
	}));
};

/**
 * 与えられたパスより、キーワードとディレクトリに分割
 * @param {string} _fileName 
 * @param {string} [_directory='']
 * @returns {string[]} [ファイルキーワード, ルートディレクトリ]
 */
const getFilePath = (_fileName, _directory = ``) => {
	let fullPath;
	if (_fileName.startsWith(C_MRK_CURRENT_DIRECTORY)) {
		fullPath = `${g_workPath}${_fileName.slice(C_MRK_CURRENT_DIRECTORY.length)}`;
	} else {
		fullPath = `${g_rootPath}${_directory}${_fileName}`;
	}
	const dirPos = fullPath.lastIndexOf(`/`);
	return [fullPath.slice(dirPos + 1), fullPath.slice(0, dirPos + 1)];
}

/**
 * 画像ファイルの存在チェック後、プリロードする処理
 * @param {string} _imgPath
 * @param {string} [object.directory='']
 * @param {boolean} [object.syncBackPath=true] 
 * @returns {string}
 */
const preloadImgFile = (_imgPath, { directory = ``, syncBackPath = true } = {}) => {

	let imgPath = _imgPath;
	if (g_headerObj.autoPreload && checkImage(_imgPath)) {
		if (syncBackPath) {
			const [file, dir] = getFilePath(_imgPath, directory);
			imgPath = `${dir}${file}`;
		}
		preloadFile(`image`, imgPath);
	}
	return imgPath;
};

/**
 * 画像パス部分の取得
 * @param {string} _str 
 * @returns {string}
 */
const getImageUrlPath = _str => {
	const matches = _str?.match(/url\("([^"]*)"\)/);
	return matches && matches.length >= 2 ? matches[1] : ``;
};

/**
 * カレントディレクトリを含む文字列を置換し、変更後の文字列を作成
 * @param {string} _str 
 * @returns {string}
 */
const reviseCssText = _str => {
	if (getImageUrlPath(_str) !== ``) {
		const imgOriginal = getImageUrlPath(_str);
		const imgPath = preloadImgFile(imgOriginal);
		return replaceStr(_str, [[imgOriginal, imgPath]]);
	}
	return _str;
};

/*-----------------------------------------------------------*/
/* 色・グラデーション設定                                      */
/*-----------------------------------------------------------*/

/**
 * 対象のカラーコードが明暗どちらかを判定 (true: 明色, false: 暗色)
 * @param {string} _colorStr
 * @returns {boolean}
 */
const checkLightOrDark = _colorStr => {
	const r = parseInt(_colorStr.substring(1, 3), 16);
	const g = parseInt(_colorStr.substring(3, 5), 16);
	const b = parseInt(_colorStr.substring(5, 7), 16);
	return ((((r * 299) + (g * 587) + (b * 114)) / 1000) < 128);
};

/**
 * 色名をカラーコードに変換
 * @param {string} _color 
 * @returns {string}
 */
const colorNameToCode = _color => {
	const cxt = document.createElement(`canvas`).getContext(`2d`);
	cxt.fillStyle = _color;
	return cxt.fillStyle;
};

/**
 * 10進 -> 16進数変換 (カラーコード形式になるよう0埋め)
 * @param {number} _num 
 * @returns {string}
 */
const byteToHex = _num => _num.toString(16).padStart(2, '0');

/**
 * カラーコードかどうかを判定 (簡易版)
 * @param {string} _str
 * @returns {boolean}
 */
const isColorCd = _str => _str.substring(0, 1) === `#`;

/**
 * CSSの位置表記系かどうかをチェック
 * @param {string} _str
 * @returns {boolean}
 */
const hasAnglePointInfo = _str => fuzzyListMatching(_str, g_checkStr.cssHeader, g_checkStr.cssFooter);

/**
 * 色名をカラーコードへ変換 (元々カラーコードの場合は除外)
 * @param {string} _color 色名
 * @returns {string}
 */
const colorToHex = (_color) => {

	// すでにカラーコードのものやパーセント表記、位置表記系を除外
	if (!isNaN(parseFloat(_color)) || isColorCd(_color) || hasAnglePointInfo(_color)) {
		return _color;
	}

	// 色_位置;透明度 (Ex: red 20%;255) の形式で取り込み
	// 透明度はカラーコード形式に変換してRGBの後ろに設定
	const tmpColor = _color.split(`;`);
	const colorSet = tmpColor[0].split(` `);
	return colorNameToCode(colorSet[0]) +
		(tmpColor.length > 1 ? byteToHex(setIntVal(tmpColor[1], 255)) : '') +
		(colorSet[1] !== undefined ? ` ${colorSet.slice(1).join(' ')}` : '');
};

/**
 * カラーコードの前パディング (旧Option Editor対応)
 * @param {boolean} _useFlg
 * @param {string} _colorStr 
 * @returns {string}
 */
const colorCdPadding = (_useFlg, _colorStr) => _useFlg ? `#${_colorStr.slice(1).padStart(6, `0`)}` : _colorStr;

/**
 * グラデーション用のカラーフォーマットを作成
 * @param {string} _colorStr 
 * @param {string[]} [object._defaultColorgrd=g_headerObj.defaultColorgrd]
 * @param {boolean} [object._colorCdPaddingUse=false]
 * @param {string} [object._objType='normal'] (normal: 汎用, titleMusic: タイトル曲名, titleArrow: タイトル矢印)
 * @param {boolean} [object._shadowFlg=false]
 * @returns {string}
 */
const makeColorGradation = (_colorStr, { _defaultColorgrd = g_headerObj.defaultColorgrd,
	_colorCdPaddingUse = false, _objType = `normal`, _shadowFlg = false } = {}) => {

	// |color_data=300,20,45deg:#ffff99:#ffffff:#9999ff@linear-gradient|
	// |color_data=300,20,#ffff99:#ffffff:#9999ff@radial-gradient|
	// |color_data=300,20,#ffff99:#ffffff:#9999ff@conic-gradient|

	if (_colorStr === `Default` || _colorStr === ``) {
		return _colorStr;
	}

	// 矢印の塗りつぶしの場合：透明度を50%にする
	// 背景矢印の場合       ：透明度を25%にする
	const alphaVal = (_shadowFlg && _objType !== `frz`) ? `80` : (_objType === `titleArrow` ? `40` : ``);

	let convertColorStr = ``;
	const tmpBackgroundStr = _colorStr.split(`;;`);

	// 色情報以外の部分を退避
	const addData = tmpBackgroundStr[1] !== undefined ? tmpBackgroundStr.slice(1).join(` `) : ``;
	if ([``, `-`, `none`].includes(tmpBackgroundStr[0]) ||
		tmpBackgroundStr[0].startsWith(`url(`) || tmpBackgroundStr[0].startsWith(`var(`)) {
		return addData;
	}

	// 色情報からグラデーションを作成
	const tmpColorStr = tmpBackgroundStr[0].split(`@`);
	const colorArray = tmpColorStr[0].split(`:`);
	colorArray.forEach((colorCd, j) => {
		colorArray[j] = colorCdPadding(_colorCdPaddingUse, colorToHex(colorCd.replaceAll(`0x`, `#`)));
		if (isColorCd(colorArray[j]) && colorArray[j].length === 7) {
			colorArray[j] += alphaVal;
		}
	});

	const gradationType = (tmpColorStr.length > 1 ? tmpColorStr[1] : `linear-gradient`);
	const defaultDir = `to ${(_objType === 'titleArrow' ? 'left' : 'right')}, `;
	if (colorArray.length === 1) {
		if (_objType === `titleMusic`) {
			convertColorStr = `${defaultDir}${colorArray[0]} 100%, #eeeeee${alphaVal} 0%`;
		} else if (_defaultColorgrd[0]) {
			convertColorStr = `${defaultDir}${colorArray[0]}, ${_defaultColorgrd[1]}${alphaVal}, ${colorArray[0]}`;
		} else {
			return colorArray[0];
		}
	} else {
		if (gradationType === `linear-gradient` && (isColorCd(colorArray[0]) || !hasAnglePointInfo(colorArray[0]))) {
			// "to XXXX" もしくは "XXXdeg(rad, grad, turn)"のパターン以外は方向を補完する
			convertColorStr = `${defaultDir}`;
		}
		convertColorStr += `${colorArray.join(', ')}`;
	}

	return `${hasVal(addData) ? `${addData} ` : ''}${gradationType}(${convertColorStr})`;
};

/*-----------------------------------------------------------*/
/* フォント設定                                          */
/*-----------------------------------------------------------*/

/**
 * 画面共通のフォント設定 (font-family設定を作成)
 * @param {string} [_priorityFont=''] 優先させるフォント名 
 * @returns {string}
 */
const getBasicFont = (_priorityFont = ``) =>
	[_priorityFont, g_headerObj.customFont, C_LBL_BASICFONT].filter(value => value !== ``).join(`,`);

/**
 * フォントサイズに応じた横幅を取得
 * @param {string} _str 
 * @param {number} _fontsize 
 * @param {string} _font 
 * @returns {number}
 */
const getStrWidth = (_str, _fontsize, _font) => {
	const ctx = document.createElement(`canvas`).getContext(`2d`);
	ctx.font = `${wUnit(_fontsize)} ${_font}`;
	return ctx.measureText(unEscapeHtml(_str)).width;
};

/**
 * 指定した横幅に合ったフォントサイズを取得
 * @param {string} _str 
 * @param {number} _maxWidth 
 * @param {string} _font 
 * @param {number} _maxFontsize
 * @param {number} _minFontsize
 * @returns {number}
 */
const getFontSize = (_str, _maxWidth, _font = getBasicFont(), _maxFontsize = 64, _minFontsize = 5) => {
	for (let siz = _maxFontsize; siz >= _minFontsize; siz--) {
		if (_maxWidth >= getStrWidth(_str, siz, _font)) {
			return siz;
		}
	}
	return _minFontsize;
};

/**
 * 補足説明部分のラベル作成
 * @param {string} _id 
 * @param {string} _str 
 * @param {string} [object.altId=_id]
 * @param {number} [object.siz=g_limitObj.mainSiz] 
 * @returns {HTMLDivElement}
 */
const createDescDiv = (_id, _str, { altId = _id, siz = g_limitObj.mainSiz } = {}) =>
	createDivCss2Label(_id, _str, Object.assign(g_lblPosObj[altId], {
		siz: getFontSize(_str, g_lblPosObj[altId]?.w || g_sWidth, getBasicFont(), siz),
		pointerEvents: C_DIS_NONE,
	}));

/*-----------------------------------------------------------*/
/* ラベル・ボタン・オブジェクトの作成                           */
/*-----------------------------------------------------------*/

/**
 * 図形の描画 (div要素)
 * - 親divに対してこの関数の返却値に対してappendすることで描画される
 * @param {string} _id
 * @param {number} _x 
 * @param {number} _y 
 * @param {number} _width 
 * @param {number} _height 
 * @param {string[]} _classes
 * @returns {HTMLDivElement}
 */
const createDiv = (_id, _x, _y, _width, _height, _classes = []) => {
	const div = document.createElement(`div`);

	div.id = _id;
	const style = div.style;
	style.left = wUnit(_x);
	style.top = wUnit(_y);
	style.width = wUnit(_width);
	style.height = wUnit(_height);
	style.position = `absolute`;
	div.classList.add(..._classes);
	setUserSelect(style);

	return div;
};

/**
 * user-select属性の値変更
 * @param {object} _style 
 * @param {string} _value 
 */
const setUserSelect = (_style, _value = C_DIS_NONE) => {
	_style.userSelect = _value;
	_style.webkitUserSelect = _value;
	_style.webkitTouchCallout = _value;
};

/**
 * 子div要素のラベル文字作成 (CSS版・拡張属性対応)
 * @param {string} _id 
 * @param {string} _text 
 * @param {number} [object.x=0]
 * @param {number} [object.y=0]
 * @param {number} [object.w=g_limitObj.setLblWidth]
 * @param {number} [object.h=g_limitObj.setLblHeight]
 * @param {number} [object.siz=g_limitObj.setLblSiz]
 * @param {number} [object.align='center']
 * @param {...any} [object.rest]
 * @param {...any} _classes 
 * @returns {HTMLDivElement}
 */
const createDivCss2Label = (_id, _text, { x = 0, y = 0, w = g_limitObj.setLblWidth, h = g_limitObj.setLblHeight,
	siz = g_limitObj.setLblSiz, align = C_ALIGN_CENTER, ...rest } = {}, ..._classes) => {
	const div = createDiv(_id, x, y, w, h, [g_cssObj.title_base, ..._classes]);

	const style = div.style;
	style.fontSize = wUnit(siz);
	style.fontFamily = getBasicFont();
	style.textAlign = `${align}`;
	div.innerHTML = _text;
	Object.keys(rest).forEach(property => style[property] = rest[property]);

	return div;
};

/**
 * 画像表示
 * @param {string} _id 
 * @param {string} _imgPath 
 * @param {number} _x 
 * @param {number} _y 
 * @param {number} _width 
 * @param {number} _height 
 * @returns {HTMLDivElement}
 */
const createImg = (_id, _imgPath, _x, _y, _width, _height) => {
	const div = createDiv(_id, _x, _y, _width, _height);
	div.innerHTML = `<img id="${_id}img" src="${_imgPath}" style="width:${wUnit(_width)};height:${wUnit(_height)}"${g_isFile ? `` : ` crossOrigin="anonimous"`}>`;

	return div;
};

/**
 * ColorPickerの作成
 * @param {string} _parentObj
 * @param {string} _id
 * @param {function} _func 
 * @param {number} [object.x=0]
 * @param {number} [object.y=0]
 * @returns {HTMLInputElement}
 */
const createColorPicker = (_parentObj, _id, _func, { x = 0, y = 0 } = {}) => {
	const picker = document.createElement(`input`);
	picker.setAttribute(`type`, `color`);
	picker.id = _id;
	picker.style.left = wUnit(x);
	picker.style.top = wUnit(y);
	picker.style.position = `absolute`;
	picker.addEventListener(`change`, _func);
	_parentObj.appendChild(picker);
	return picker;
};

/**
 * 色付きオブジェクトの作成 (拡張属性対応)
 * @param {string} _id 
 * @param {number} [object.x=0]
 * @param {number} [object.y=0]
 * @param {number} [object.w=C_ARW_WIDTH]
 * @param {number} [object.h=C_ARW_WIDTH]
 * @param {string} [object.rotate='']
 * @param {string} [object.styleName='']
 * @param {...any} [object.rest]
 * @param {...any} _classes 
 * @returns {HTMLDivElement}
 */
const createColorObject2 = (_id,
	{ x = 0, y = 0, w = C_ARW_WIDTH, h = C_ARW_WIDTH, rotate = ``, styleName = ``,
		rotateEnabled = g_stateObj.rotateEnabled, ...rest } = {}, ..._classes) => {

	const div = createDiv(_id, x, y, w, h, _classes);
	const style = div.style;

	// 矢印・オブジェクト判定
	let charaStyle = `arrow${styleName}`;
	if (isNaN(parseFloat(rotate))) {
		const objData = rotate.split(`:`);
		rotate = setVal(objData[1], 0, C_TYP_FLOAT);
		charaStyle = `${objData[0]}${styleName}`;
	}
	if (rotateEnabled) {
		style.transform = `rotate(${rotate}deg)`;
	}

	style.maskImage = `url("${g_imgObj[charaStyle]}")`;
	style.maskSize = `contain`;
	style.webkitMaskImage = `url("${g_imgObj[charaStyle]}")`;
	style.webkitMaskSize = `contain`;
	Object.keys(rest).forEach(property => style[property] = rest[property]);
	setAttrs(div, { color: rest.background ?? ``, type: charaStyle, cnt: 0, });

	return div;
};

/**
 * 空スプライト(ムービークリップ相当)の作成
 * - 作成済みの場合はすでに作成済のスプライトを返却する
 * @param {HTMLDivElement} _parentObj 親スプライト
 * @param {string} _newObjId 作成する子スプライト名
 * @param {number} [object.x=0]
 * @param {number} [object.y=0]
 * @param {number} [object.w=g_sWidth]
 * @param {number} [object.h=g_sHeight]
 * @param {string} [object.title]
 * @param {...any} [object.rest]
 * @param  {...any} _classes
 * @returns {HTMLDivElement}
 */
const createEmptySprite = (_parentObj, _newObjId, { x = 0, y = 0, w = g_sWidth, h = g_sHeight, title = ``, ...rest } = {}, ..._classes) => {
	if (document.getElementById(_newObjId) !== null) {
		changeStyle(_newObjId, { x, y, w, h, title, ...rest });
		return document.getElementById(_newObjId);
	}
	const div = createDiv(_newObjId, x, y, w, h, _classes);
	div.title = title;

	const style = div.style;
	Object.keys(rest).forEach(property => style[property] = rest[property]);
	_parentObj.appendChild(div);

	return div;
};

/**
 * 階層スプライト（全体）の作成
 * @param {string} _baseName 
 * @param {number} _num 階層数
 * @param {number} [object.x=0]
 * @returns {HTMLDivElement}
 */
const createMultipleSprite = (_baseName, _num, { x = 0 } = {}) => {
	const sprite = createEmptySprite(divRoot, _baseName);
	for (let j = 0; j <= _num; j++) {
		createEmptySprite(sprite, `${_baseName}${j}`, { x });
	}
	return sprite;
};

/**
 * イベントハンドラ用オブジェクト
 * 参考: http://webkatu.com/remove-eventlistener/
 * 
 * - イベントリスナー作成時にリスナーキー(key)を発行する
 * - 削除時は発行したリスナーキーを指定して削除する
 */
const g_handler = (() => {
	const events = {};
	let key = 0;

	return {
		/**
		 * イベントリスナーへの追加
		 * @param {EventTarget} _target 
		 * @param {string} _type 
		 * @param {EventListenerOrEventListenerObject} _listener 
		 * @param {boolean} [_capture=false] 
		 * @returns {number}
		 */
		addListener: (_target, _type, _listener, _capture = false) => {
			_target.addEventListener(_type, _listener, _capture);
			events[key] = {
				target: _target,
				type: _type,
				listener: _listener,
				capture: _capture
			};
			return key++;
		},
		/**
		 * イベントリスナーの削除
		 * @param {number} key 
		 */
		removeListener: key => {
			if (key in events) {
				const e = events[key];
				e.target.removeEventListener(e.type, e.listener, e.capture);
			}
		}
	};
})();

/**
 * 親スプライト配下の子スプライトを全削除
 * @param {object} _parentObjName 親スプライト名
 */
const deleteChildspriteAll = _parentObjName => {

	const parentsprite = document.getElementById(_parentObjName);
	while (parentsprite.hasChildNodes()) {
		g_handler.removeListener(parentsprite.firstChild.getAttribute(`lsnrkey`));
		g_handler.removeListener(parentsprite.firstChild.getAttribute(`lsnrkeyTS`));
		g_handler.removeListener(parentsprite.firstChild.getAttribute(`lsnrkeyTE`));
		parentsprite.removeChild(parentsprite.firstChild);
	}
};

/**
 * div要素の削除
 * @param {object} _parentId 
 * @param {string} _idName 
 */
const deleteDiv = (_parentId, _idName) => {
	if (document.getElementById(_idName) !== null) {
		_parentId.removeChild(document.getElementById(_idName));
	}
};

/**
 * ボタンの作成 (CSS版・拡張属性対応)
 * @param {string} _id 
 * @param {string} _text
 * @param {function} _func
 * @param {number} [object.x]
 * @param {number} [object.y]
 * @param {number} [object.w=g_btnWidth() / 3]
 * @param {number} [object.h=g_limitObj.btnHeight]
 * @param {number} [object.siz=g_limitObj.btnSiz]
 * @param {string} [object.align='center']
 * @param {string} [object.title] ボタンオンマウス時のコメント
 * @param {string} [object.groupName] 画面名 (g_btnWaitFrameで定義しているプロパティ名を指定)
 * @param {boolean} [object.initDisabledFlg=true] ボタン有効化までの時間を設けるかどうか
 * @param {function} [object.resetFunc] カスタム処理後に実行する処理
 * @param {function} [object.cxtFunc] 右クリック時に実行する処理
 * @param {...any} [object.rest]
 * @param {...any} _classes 
 */
const createCss2Button = (_id, _text, _func = () => true, {
	x = 0, y = g_sHeight - 100, w = g_btnWidth() / 3, h = g_limitObj.btnHeight,
	siz = g_limitObj.btnSiz, align = C_ALIGN_CENTER, title = ``, groupName = g_currentPage, initDisabledFlg = true,
	resetFunc = () => true, cxtFunc = () => true, ...rest } = {}, ..._classes) => {

	const div = createDiv(_id, x, y, w, h, [`button_common`, ..._classes]);
	div.innerHTML = _text;
	div.title = title;

	const style = div.style;
	style.textAlign = align;
	style.fontSize = wUnit(siz);
	style.fontFamily = getBasicFont();
	if (rest.animationName !== undefined) {
		style.animationDuration = `1s`;
	}
	Object.keys(rest).forEach(property => style[property] = rest[property]);

	// ボタン有効化操作
	if (initDisabledFlg) {
		if (g_initialFlg && g_btnWaitFrame[groupName].initial) {
		} else {
			style.pointerEvents = C_DIS_NONE;
			setTimeout(() => style.pointerEvents = rest.pointerEvents ?? `auto`,
				g_btnWaitFrame[groupName].b_frame * 1000 / g_fps);
		}
	}

	// ボタンを押したときの動作
	const lsnrkey = g_handler.addListener(div, `click`, evt => {
		if (!setBoolVal(g_btnDeleteFlg[_id])) {
			_func(evt);
		}
		if (typeof g_btnAddFunc[_id] === C_TYP_FUNCTION) {
			g_btnAddFunc[_id](evt, _func, resetFunc);
		}
		if (!setBoolVal(g_btnDeleteFlg[_id])) {
			resetFunc(evt);
		}
	});
	g_btnFunc.base[_id] = _func;
	g_btnFunc.reset[_id] = resetFunc;

	// 右クリック時の処理
	div.oncontextmenu = evt => {
		if (typeof cxtFunc === C_TYP_FUNCTION) {
			if (!setBoolVal(g_cxtDeleteFlg[_id])) {
				cxtFunc(evt);
			}
			if (typeof g_cxtAddFunc[_id] === C_TYP_FUNCTION) {
				g_cxtAddFunc[_id](evt, cxtFunc);
			}
			g_btnFunc.cxt[_id] = cxtFunc;

		} else if (typeof g_cxtAddFunc[_id] === C_TYP_FUNCTION) {
			g_cxtAddFunc[_id](evt);
		}
		return false;
	};

	// イベントリスナー用のキーをセット
	div.setAttribute(`lsnrkey`, lsnrkey);

	return div;
};

/**
 * オブジェクトのスタイル一括変更
 * @param {string} _id 
 * @param {number} [object.x]
 * @param {number} [object.y]
 * @param {number} [object.w]
 * @param {number} [object.h]
 * @param {string} [object.align]
 * @param {string} [object.title]
 * @param {...any} [object.rest]
 */
const changeStyle = (_id, { x, y, w, h, siz, align, title, ...rest } = {}) => {
	const div = document.getElementById(_id);
	const style = div.style;

	const obj = {
		left: x,
		top: y,
		width: w,
		height: h,
		fontSize: siz,
	};
	Object.keys(obj).filter(property => setVal(obj[property], ``, C_TYP_FLOAT) !== ``)
		.forEach(property => style[property] = wUnit(obj[property]));

	if (align !== undefined) {
		style.textAlign = `${align}`;
	}
	if (title !== undefined) {
		div.title = title;
	}
	Object.keys(rest).forEach(property => style[property] = rest[property]);
};

/**
 * タイトル文字描画
 * @param {string} _id 
 * @param {string} _titlename 
 * @param {number} _x 
 * @param {number} _y 
 * @param {...any} [_classes]
 */
const getTitleDivLabel = (_id, _titlename, _x, _y, ..._classes) =>
	createDivCss2Label(_id, _titlename, { x: _x, y: _y, w: g_sWidth, h: 50, siz: g_limitObj.btnSiz }, ..._classes);

/**
 * キーコントロールの初期化
 */
const resetKeyControl = () => {
	document.onkeyup = () => { };
	document.onkeydown = evt => {
		evt.preventDefault();
		return blockCode(transCode(evt));
	};
	g_inputKeyBuffer = {};
};

/**
 * Canvasのベース背景を作成
 * @param {CanvasRenderingContext2D} _ctx
 * @param {number} [object.w=g_sWidth]
 * @param {number} [object.h=g_sHeight] 
 */
const makeBgCanvas = (_ctx, { w = g_sWidth, h = g_sHeight } = {}) => {
	const grd = _ctx.createLinearGradient(0, 0, 0, h);
	grd.addColorStop(0, `#000000`);
	grd.addColorStop(1, `#222222`);
	_ctx.fillStyle = grd;
	_ctx.fillRect(0, 0, w, h);
};

/**
 * 画面上の描画・オブジェクトを全てクリアし、背景を再描画
 * - divオブジェクト(ボタンなど)はdivRoot配下で管理しているため、子要素のみを全削除している。
 * - dicRoot自体を削除しないよう注意すること。
 * - 再描画時に共通で表示する箇所はここで指定している。
 * @param {boolean} [_redrawFlg=false] 画面横幅を再定義し、Canvas背景を再描画するかどうか
 * @param {string} [_customDisplayName=''] 画面名(メイン画面: 'Main', それ以外: 空)
 */
const clearWindow = (_redrawFlg = false, _customDisplayName = ``) => {
	resetKeyControl();

	// ボタン、オブジェクトをクリア (divRoot配下のもの)
	deleteChildspriteAll(`divRoot`);

	// 拡張範囲を取得
	const diffX = (_customDisplayName === `Main` && g_workObj.nonDefaultSc ?
		g_headerObj.scAreaWidth * (g_headerObj.playingLayout ? 2 : 1) : 0);

	const getLayerWithClear = (_name) => {
		const layer = document.getElementById(_name);
		const ctx = layer.getContext(`2d`);
		ctx.clearRect(0, 0, layer.width, g_sHeight);
		return ctx;
	};

	if (document.getElementById(`layer0`) !== null) {

		// レイヤー情報取得
		const l0ctx = getLayerWithClear(`layer0`);

		if (document.getElementById(`layer1`) !== null) {
			const l1ctx = getLayerWithClear(`layer1`);

			// 線画 (title-line)
			l1ctx.beginPath();
			l1ctx.strokeStyle = `#cccccc`;
			l1ctx.moveTo(0, 0);
			l1ctx.lineTo(layer1.width, 0);
			l1ctx.stroke();

			l1ctx.beginPath();
			l1ctx.strokeStyle = `#cccccc`;
			l1ctx.moveTo(0, g_sHeight);
			l1ctx.lineTo(layer1.width, g_sHeight);
			l1ctx.stroke();
		}
		if (document.getElementById(`layer2`) !== null) {
			getLayerWithClear(`layer2`);
		}

		if (_redrawFlg) {
			// 画面背景を指定 (background-color)
			$id(`canvas-frame`).width = wUnit(g_sWidth + diffX);
			layer0.width = g_sWidth + diffX;
			if (!g_headerObj[`customBack${_customDisplayName}Use`]) {
				makeBgCanvas(l0ctx, { w: g_sWidth + diffX });
			}
		}
	}

	// 背景を再描画
	if (_redrawFlg) {
		g_btnAddFunc = {};
		g_btnDeleteFlg = {};
		g_cxtAddFunc = {};
		g_cxtDeleteFlg = {};

		if (document.getElementById(`layer0`) === null ||
			(!g_headerObj[`customBack${_customDisplayName}Use`] && !g_headerObj.defaultSkinFlg)) {

			$id(`canvas-frame`).width = wUnit(g_sWidth + diffX);
			createEmptySprite(divRoot, `divBack`, { w: g_sWidth + diffX });
		}

		// CSSスタイルの初期化
		Object.keys(g_cssBkProperties).forEach(prop =>
			document.documentElement.style.setProperty(prop, g_cssBkProperties[prop]));

		Object.keys(g_headerObj).filter(val => val.startsWith(`--`) && hasVal(g_headerObj[val])).forEach(prop =>
			document.documentElement.style.setProperty(prop, getCssCustomProperty(prop, g_headerObj[prop])));
	}
};

/**
 * CSSカスタムプロパティの値を作成
 * @param {string} _prop 
 * @param {string} _propData 
 * @returns {string}
 */
const getCssCustomProperty = (_prop, _propData) =>
	document.documentElement.style.getPropertyValue(_propData) || (g_cssBkProperties[_propData] ?? (
		_prop.endsWith(`-x`) ? _propData : reviseCssText(makeColorGradation(_propData, { _defaultColorgrd: false }))
	));

/**
 * CSSカスタムプロパティの値をオブジェクトへ退避
 */
const getCssCustomProperties = () => {
	try {
		const htmlStyle = document.documentElement.computedStyleMap();
		for (const [propertyName, value] of htmlStyle.entries()) {
			if (/^--/.test(propertyName)) {
				g_cssBkProperties[propertyName] = value.toString();
			}
		}
	} catch (error) {

		try {
			// FirefoxではcomputedStyleMapが使えないため、
			// CSSの全スタイルシート定義から :root がセレクタのルールを抽出し、カスタムプロパティを抽出
			const sheets = document.styleSheets;
			Array.from(sheets).filter(sheet => !g_isFile && sheet.href !== null &&
				sheet.href.includes(`danoni_skin_`) && sheet.cssRules).forEach(sheet => {
					for (const rule of sheet.cssRules) {
						if (rule.selectorText === ':root') {
							for (let i = 0; i < rule.style.length; i++) {
								const propertyName = rule.style.item(i);
								if (/^--/.test(propertyName)) {
									g_cssBkProperties[propertyName] = rule.style.getPropertyValue(propertyName);
								}
							}
						}
					}
				});
		} catch (error) {
			// 上記でもNGの場合は何もしない
		}
	}
}

/**
 * 背景・マスク用画像の描画
 * @param {object} _obj 
 * @param {string} _obj.path 画像のパス
 * @param {string} _obj.class 画像を装飾するCSSクラス名
 * @param {string} _obj.left 画像の位置(x座標)
 * @param {string} _obj.top 画像の位置(y座標)
 * @param {number} _obj.width 画像の幅
 * @param {string} _obj.height 画像の高さ (他との共用項目のため、stringで受ける)
 * @param {string} _obj.animationName アニメーション名
 * @param {string} _obj.animationDuration アニメーションを動かす間隔(秒)
 * @param {number} _obj.opacity 画像の不透明度
 * @returns {string}
 */
const makeSpriteImage = _obj => {
	let tmpInnerHTML = `<img src=${_obj.path} class="${_obj.class}"	style="position:absolute;left:${wUnit(_obj.left)};top:${wUnit(_obj.top)}`;
	if (_obj.width > 0) {
		tmpInnerHTML += `;width:${wUnit(_obj.width)}`;
	}
	if (setIntVal(_obj.height) > 0) {
		tmpInnerHTML += `;height:${wUnit(_obj.height)}`;
	}
	tmpInnerHTML += `;animation-name:${_obj.animationName};animation-duration:${_obj.animationDuration}s;opacity:${_obj.opacity}">`;
	return tmpInnerHTML;
};

/**
 * 背景・マスク用テキストの描画
 * @param {object} _obj 
 * @param {string} _obj.path テキスト本体
 * @param {string} _obj.class テキストを装飾するCSSクラス名
 * @param {string} _obj.left テキストの位置(x座標)
 * @param {string} _obj.top テキストの位置(y座標)
 * @param {number} _obj.width テキストのフォントサイズ (font-size)
 * @param {string} _obj.height テキストの色 (color)
 * @param {string} _obj.animationName アニメーション名
 * @param {string} _obj.animationDuration アニメーションを動かす間隔(秒)
 * @param {number} _obj.opacity テキストの不透明度
 * @returns {string}
 */
const makeSpriteText = _obj => {
	let tmpInnerHTML = `<span class="${_obj.class}"	style="display:inline-block;position:absolute;left:${wUnit(_obj.left)};top:${wUnit(_obj.top)}`;

	// この場合のwidthは font-size と解釈する
	if (_obj.width > 0) {
		tmpInnerHTML += `;font-size:${wUnit(_obj.width)}`;
	}

	// この場合のheightは color と解釈する
	if (_obj.height !== ``) {
		tmpInnerHTML += `;color:${_obj.height}`;
	}
	tmpInnerHTML += `;animation-name:${_obj.animationName};animation-duration:${_obj.animationDuration}s;opacity:${_obj.opacity}">${_obj.path}</span>`;
	return tmpInnerHTML;
};

/**
 * 多重配列の存在をチェックし、
 * 存在しない場合は作成、存在する場合は重複を避けて配列を新規作成
 * @param {any[][]} _obj 
 * @returns [多重配列(初期化済),配列初期化済数]
 */
const checkDuplicatedObjects = _obj => {
	let dataCnts = 0;
	if (_obj === undefined) {
		_obj = [];
		_obj[0] = [];
	} else {
		for (let m = 1; ; m++) {
			if (_obj[m] === undefined) {
				_obj[m] = [];
				dataCnts = m;
				break;
			}
		}
	}
	return [_obj, dataCnts];
};

/**
 * 多層スプライトデータの作成処理
 * @param {string} _data 
 * @param {function} _calcFrame 
 * @returns [多層スプライトデータ, 最大深度]
 */
const makeSpriteData = (_data, _calcFrame = _frame => _frame) => {

	const spriteData = [];
	let maxDepth = -1;

	splitLF(_data).filter(data => hasVal(data)).forEach(tmpData => {
		const tmpSpriteData = tmpData.split(`,`).map(val => trimStr(val));

		// 深度が"-"の場合はスキップ
		if (tmpSpriteData[1] === undefined || tmpSpriteData[1] === `-` ||
			(tmpSpriteData[1] === `` && ![`[loop]`, `[jump]`].includes(tmpSpriteData[2]))) {
			return;
		}

		// 値チェックとエスケープ処理
		const tmpFrame = setIntVal(tmpSpriteData[0], -1) === 0 ? 0 :
			roundZero(_calcFrame(setVal(tmpSpriteData[0], 200, C_TYP_CALC)));
		const tmpDepth = (tmpSpriteData[1] === C_FLG_ALL ? C_FLG_ALL : setVal(tmpSpriteData[1], 0, C_TYP_CALC));
		if (tmpDepth !== C_FLG_ALL && tmpDepth > maxDepth) {
			maxDepth = tmpDepth;
		}

		const tmpObj = {
			path: escapeHtml(tmpSpriteData[2] ?? ``, g_escapeStr.escapeCode),   // 画像パス or テキスト
			class: escapeHtml(tmpSpriteData[3] ?? ``),                          // CSSクラス
			left: setVal(tmpSpriteData[4], `0`).includes(`{`) ?
				`${setVal(tmpSpriteData[4], 0)}` : `{${setVal(tmpSpriteData[4], 0)}}`, // X座標
			top: setVal(tmpSpriteData[5], `0`).includes(`{`) ?
				`${setVal(tmpSpriteData[5], 0)}` : `{${setVal(tmpSpriteData[5], 0)}}`, // Y座標
			width: `${setIntVal(tmpSpriteData[6])}`,                            // spanタグの場合は font-size
			height: `${escapeHtml(tmpSpriteData[7] ?? ``)}`,                    // spanタグの場合は color(文字列可)
			opacity: setVal(tmpSpriteData[8], 1, C_TYP_FLOAT),
			animationName: escapeHtml(setVal(tmpSpriteData[9], C_DIS_NONE)),
			animationDuration: setIntVal(tmpSpriteData[10]) / g_fps,
		};
		if (setVal(tmpSpriteData[11], g_presetObj.animationFillMode) !== undefined) {
			tmpObj.animationFillMode = setVal(tmpSpriteData[11], g_presetObj.animationFillMode);
		}
		tmpObj.path = preloadImgFile(tmpObj.path, { syncBackPath: g_headerObj.syncBackPath });

		let dataCnts = 0;
		[spriteData[tmpFrame], dataCnts] =
			checkDuplicatedObjects(spriteData[tmpFrame]);

		const emptyPatterns = [``, `[loop]`, `[jump]`];
		const colorObjFlg = tmpSpriteData[2]?.startsWith(`[c]`) || false;
		const spriteFrameData = spriteData[tmpFrame][dataCnts] = {
			depth: tmpDepth,
		};

		if (colorObjFlg) {
			// [c]始まりの場合、カラーオブジェクト用の作成準備を行う
			const data = tmpObj.path.slice(`[c]`.length).split(`/`);
			spriteFrameData.colorObjInfo = {
				x: tmpObj.left, y: tmpObj.top, w: tmpObj.width, h: tmpObj.height,
				rotate: setVal(data[0], `0`), opacity: tmpObj.opacity,
				background: makeColorGradation(setVal(data[1], `#ffffff`), { _defaultColorgrd: false }),
				animationName: tmpObj.animationName,
				animationDuration: `${tmpObj.animationDuration}s`,
			};
			spriteFrameData.colorObjId = `${tmpFrame}_${dataCnts}`;
			spriteFrameData.colorObjClass = setVal(tmpObj.class, undefined);
			if (tmpObj.animationFillMode !== undefined) {
				spriteFrameData.colorObjInfo.animationFillMode = tmpObj.animationFillMode;
			}

		} else if (emptyPatterns.includes(tmpObj.path)) {
			// ループ、フレームジャンプ、空の場合の処理
			spriteFrameData.command = tmpObj.path;
			spriteFrameData.jumpFrame = tmpObj.class;
			spriteFrameData.maxLoop = tmpObj.left;
			spriteFrameData.htmlText = ``;
		} else {
			// それ以外の画像、テキストの場合
			spriteFrameData.animationName = tmpObj.animationName;
			spriteFrameData.htmlText = (checkImage(tmpObj.path) ? makeSpriteImage(tmpObj) : makeSpriteText(tmpObj));
		}
	});

	return [spriteData, maxDepth];
};

/**
 * スタイル変更データの作成処理
 * @param {string} _data 
 * @param {function} _calcFrame 
 * @returns [多層スプライトデータ, 1(固定)]
 */
const makeStyleData = (_data, _calcFrame = _frame => _frame) => {
	const spriteData = [];
	splitLF(_data).filter(data => hasVal(data)).forEach(tmpData => {
		const tmpSpriteData = tmpData.split(`,`).map(val => trimStr(val));

		// カスタムプロパティの名称(--始まり)で無い場合はコメントと見做してスキップ
		if (tmpSpriteData.length <= 1 || !tmpSpriteData[1].startsWith(`--`)) {
			return;
		}
		const tmpFrame = setIntVal(tmpSpriteData[0], -1) === 0 ? 0 :
			roundZero(_calcFrame(setVal(tmpSpriteData[0], 200, C_TYP_CALC)));

		let dataCnts = 0;
		[spriteData[tmpFrame], dataCnts] = checkDuplicatedObjects(spriteData[tmpFrame]);
		spriteData[tmpFrame][dataCnts] = {
			depth: tmpSpriteData[1],
			styleData: getCssCustomProperty(tmpSpriteData[1], tmpSpriteData[2]),
		};
	});
	return [spriteData, 1];
};

/**
 * 画像ファイルかどうかをチェック
 * @param {string} _str 
 * @returns {boolean}
 */
const checkImage = _str => listMatching(_str, g_imgExtensions, { prefix: `[.]`, suffix: `$` });

/**
 * back/masktitle(result)において、ジャンプ先のフレーム数を取得
 * @param {string} _frames ジャンプ先のフレーム数情報。コロン指定でジャンプ先を確率で分岐 (ex. 300:1500:1500)
 * @returns {number}
 */
const getSpriteJumpFrame = _frames => {
	const jumpFrames = _frames.split(`:`);
	const jumpCnt = Math.floor(Math.random() * jumpFrames.length);
	return setIntVal(Number(jumpFrames[jumpCnt]) - 1);
};

/**
 * 背景・マスクモーションの表示（共通処理）
 * @param {object} _spriteData 
 * @param {string} _name 
 * @param {boolean} [_condition=true] 
 */
const drawBaseSpriteData = (_spriteData, _name, _condition = true) => {
	const baseSprite = document.getElementById(`${_name}Sprite${_spriteData.depth}`);
	if (_spriteData.command === ``) {
		if (_spriteData.depth === C_FLG_ALL) {
			for (let j = 0; j <= g_scoreObj[`${_name}MaxDepth`]; j++) {
				document.getElementById(`${_name}Sprite${j}`).textContent = ``;
			}
		} else {
			baseSprite.textContent = ``;
		}
	} else {
		if (_condition) {
			if (_spriteData.colorObjInfo !== undefined) {
				const colorObjClass = _spriteData.colorObjClass?.split(`/`) ?? [];
				const id = `${_name}${_spriteData.depth}${_spriteData.colorObjId}`;
				[`x`, `y`, `w`, `h`].forEach(val => _spriteData.colorObjInfo[val] = convertStrToVal(_spriteData.colorObjInfo[val]));
				baseSprite.appendChild(
					createColorObject2(id, _spriteData.colorObjInfo, ...colorObjClass)
				);
			} else {
				baseSprite.innerHTML = convertStrToVal(_spriteData.htmlText);
			}
		}
	}
};

/**
 * 背景・マスクモーションの表示（タイトル・リザルト用）
 * @param {number} _frame 
 * @param {string} _displayName title / result
 * @param {string} _depthName back / mask
 * @returns {number}
 */
const drawSpriteData = (_frame, _displayName, _depthName) => {

	const spriteName = `${_depthName}${toCapitalize(_displayName)}`;
	const tmpObjs = g_headerObj[`${spriteName}Data`][_frame];

	for (let j = 0; j < tmpObjs.length; j++) {
		const tmpObj = tmpObjs[j];
		drawBaseSpriteData(tmpObj, spriteName, ![`[loop]`, `[jump]`].includes(tmpObj.command));
		if (tmpObj.command === `[loop]`) {
			// キーワード指定：ループ
			// 指定フレーム(class)へ移動する
			g_scoreObj[`${spriteName}LoopCount`]++;
			return getSpriteJumpFrame(tmpObj.jumpFrame);

		} else if (tmpObj.command === `[jump]`) {
			// キーワード指定：フレームジャンプ
			// 指定回数以上のループ(maxLoop)があれば指定フレーム(jumpFrame)へ移動する
			if (g_scoreObj[`${spriteName}LoopCount`] >= Number(tmpObj.maxLoop)) {
				g_scoreObj[`${spriteName}LoopCount`] = 0;
				return getSpriteJumpFrame(tmpObj.jumpFrame);
			}
		}
	}
	return _frame;
};

/**
 * 背景・マスクモーションの表示
 * @param {number} _frame 
 * @param {string} _depthName 
 */
const drawMainSpriteData = (_frame, _depthName) =>
	g_scoreObj[`${_depthName}Data`][_frame].forEach(tmpObj => drawBaseSpriteData(tmpObj, _depthName));

/**
 * スタイル切替
 * @param {number} _frame 
 * @param {string} _displayName
 * @returns {number}
 */
const drawStyleData = (_frame, _displayName) => {
	g_headerObj[`style${toCapitalize(_displayName)}Data`][_frame].forEach(tmpObj =>
		document.documentElement.style.setProperty(tmpObj.depth, tmpObj.styleData));

	return _frame;
};

const drawMainStyleData = (_frame) =>
	g_scoreObj.styleData[_frame].forEach(tmpObj =>
		document.documentElement.style.setProperty(tmpObj.depth, tmpObj.styleData));

/**
 * タイトル・リザルトモーションの描画
 * @param {string} _displayName
 */
const drawTitleResultMotion = _displayName =>
	g_animationData.forEach(sprite => {
		const spriteName = `${sprite}${toCapitalize(_displayName)}`;
		if (g_headerObj[`${spriteName}Data`][g_scoreObj[`${spriteName}FrameNum`]] !== undefined) {
			g_scoreObj[`${spriteName}FrameNum`] = g_animationFunc.draw[sprite](g_scoreObj[`${spriteName}FrameNum`], _displayName, sprite);
		}
	});

/*-----------------------------------------------------------*/
/* その他の共通設定                                           */
/*-----------------------------------------------------------*/

// WebAudioAPIでAudio要素風に再生するクラス
class AudioPlayer {
	constructor() {
		this._context = new AudioContext();
		this._gain = this._context.createGain();
		this._gain.connect(this._context.destination);
		this._startTime = 0;
		this._fadeinPosition = 0;
		this._eventListeners = {};
		this.playbackRate = 1;
	}

	async init(_arrayBuffer) {
		this._arrayBuffer = _arrayBuffer;
		await this._context.decodeAudioData(this._arrayBuffer, _buffer => {
			this._duration = _buffer.duration;
			this._buffer = _buffer;
		});
		this._eventListeners[`canplaythrough`]?.forEach(_listener => _listener());
	}

	play(_adjustmentTime = 0) {
		this._source = this._context.createBufferSource();
		this._source.buffer = this._buffer;
		this._source.playbackRate.value = this.playbackRate;
		this._source.connect(this._gain);
		this._startTime = this._context.currentTime;
		this._source.start(this._context.currentTime + _adjustmentTime, this._fadeinPosition);
	}

	pause() {
		if (this._source) {
			this._source.stop(0);
		}
	}

	set currentTime(_currentTime) {
		this._fadeinPosition = _currentTime;
	}

	get volume() {
		return this._gain.gain.value;
	}

	set volume(_volume) {
		this._gain.gain.value = _volume;
	}

	get duration() {
		return this._duration;
	}

	get readyState() {
		if (this._duration) {
			return 4;
		} else {
			return 0;
		}
	}

	addEventListener(_type, _listener) {
		this._eventListeners[_type]?.push(_listener) || (this._eventListeners[_type] = [_listener]);
	}

	removeEventListener(_type, _listener) {
		if (this._eventListeners[_type] === undefined) {
			return;
		}
		this._eventListeners[_type] = this._eventListeners[_type].filter(_element => _element !== _listener);
	}

	load() { }
	dispatchEvent() { }
}

/**
 * クリップボードコピー関数
 * 入力値をクリップボードへコピーし、メッセージを表示
 * @param {string} _textVal 入力値
 * @param {string} _msg
 */
const copyTextToClipboard = async (_textVal, _msg) => {
	try {
		await navigator.clipboard.writeText(_textVal);

	} catch (error) {
		// http環境では navigator.clipboard が使えないため、従来の方法を実行
		// テキストエリアを用意し、値をセット
		const copyFrom = document.createElement(`textarea`);
		copyFrom.textContent = _textVal;

		// bodyタグの要素を取得
		const bodyElm = document.getElementsByTagName(`body`)[0];
		// 子要素にテキストエリアを配置
		bodyElm.appendChild(copyFrom);

		// テキストエリアの値を選択し、コピーコマンド発行
		copyFrom.select();
		document.execCommand(`copy`);
		// 追加テキストエリアを削除
		bodyElm.removeChild(copyFrom);

	} finally {
		makeInfoWindow(_msg, `leftToRightFade`);
	}
};

/**
 * 現在URLのクエリパラメータから指定した値を取得
 * @param {string} _name
 * @returns {string}
 */
const getQueryParamVal = _name => {
	const param = new URL(location.href).searchParams.get(_name);
	return param !== null ? decodeURIComponent(param.replace(/\+/g, ` `)) : null;
};

/**
 * ローディング文字用ラベルの作成
 * @returns {HTMLDivElement}
 */
const getLoadingLabel = () => createDivCss2Label(`lblLoading`, g_lblNameObj.nowLoading, {
	x: 0, y: g_sHeight - 40, w: g_sWidth, h: g_limitObj.setLblHeight,
	siz: g_limitObj.setLblSiz, align: C_ALIGN_RIGHT,
});

/**
 * フレーム数を時間表示へ変換
 * @param {number} _frame 
 * @returns {string}
 */
const transFrameToTimer = _frame => {
	const minutes = Math.floor(_frame / g_fps / 60);
	const seconds = `${Math.floor((_frame / g_fps) % 60)}`.padStart(2, `0`);
	return `${minutes}:${seconds}`;
};

/**
 * 疑似タイマー表記をフレーム数へ変換
 * |endFrame=1:35.20|
 * @param {string} _str 
 * @returns {number|string}
 */
const transTimerToFrame = _str => {
	if (_str.indexOf(`:`) !== -1) {
		const tmpTimes = _str.split(`:`);
		if (tmpTimes[1].indexOf(`.`) !== -1) {
			const tmpSeconds = tmpTimes[1].split(`.`);
			return g_fps * (Number(tmpTimes[0]) * 60 + Number(tmpSeconds[0])) + Number(tmpSeconds[1]);
		} else {
			return g_fps * (Number(tmpTimes[0]) * 60 + Number(tmpTimes[1]));
		}
	}
	return _str;
};

/*-----------------------------------------------------------*/
/* Scene : INITIALIZE [peach] */
/*-----------------------------------------------------------*/

const initialControl = async () => {

	const stage = document.getElementById(`canvas-frame`);
	const divRoot = createEmptySprite(stage, `divRoot`, g_windowObj.divRoot);

	// 背景の表示
	if (document.getElementById(`layer0`) !== null) {
		const layer0 = document.getElementById(`layer0`);
		makeBgCanvas(layer0.getContext(`2d`));
	} else {
		createEmptySprite(divRoot, `divBack`, g_windowObj.divBack);
	}

	// Now Loadingを表示
	divRoot.appendChild(getLoadingLabel());

	// 譜面初期情報ロード許可フラグ
	g_canLoadDifInfoFlg = true;

	// 譜面データの読み込みオプション
	g_enableAmpersandSplit = setBoolVal(document.getElementById(`enableAmpersandSplit`)?.value, true);
	g_enableDecodeURI = setBoolVal(document.getElementById(`enableDecodeURI`)?.value);

	// 作品別ローカルストレージの読み込み
	loadLocalStorage();

	// 譜面データの読み込み(1ファイル目)
	await loadChartFile(0);

	// 共通設定ファイルの指定
	let [settingType, settingRoot] = getFilePath(g_rootObj.settingType ?? ``);
	if (settingType !== ``) {
		settingType = `_${settingType}`;
	}

	// 共通設定ファイルの読込
	await loadScript2(`${settingRoot}danoni_setting${settingType}.js?${g_randTime}`, false);
	loadLegacySettingFunc();
	deleteDiv(divRoot, `lblLoading`);

	// クエリで譜面番号が指定されていればセット
	g_stateObj.scoreId = setIntVal(getQueryParamVal(`scoreId`));

	// 譜面ヘッダーの読込
	Object.assign(g_headerObj, preheaderConvert(g_rootObj));

	// CSSファイル内のbackgroundを取得するために再描画
	if (document.getElementById(`layer0`) === null) {
		deleteDiv(divRoot, `divBack`);
		createEmptySprite(divRoot, `divBack`);
	} else if (!g_headerObj.defaultSkinFlg && !g_headerObj.customBackUse) {
		createEmptySprite(divRoot, `divBack`);
	}

	// CSSファイルの読み込み
	const skinList = g_headerObj.jsData.filter(file => file[0].indexOf(`danoni_skin`) !== -1);
	await loadMultipleFiles2(skinList, `css`);

	// JSファイルの読み込み
	await loadMultipleFiles2(g_headerObj.jsData, `js`);
	loadLegacyCustomFunc();

	// 譜面ヘッダー、特殊キー情報の読込
	Object.assign(g_headerObj, headerConvert(g_rootObj));
	const importKeysData = _data => {
		keysConvert(dosConvert(_data));
		g_headerObj.undefinedKeyLists = g_headerObj.undefinedKeyLists.filter(key => g_keyObj[`${g_keyObj.defaultProp}${key}_0`] === undefined);
	};
	g_presetObj.keysDataLib.forEach(list => importKeysData(list));
	if (g_presetObj.keysData !== undefined) {
		importKeysData(g_presetObj.keysData);
	}
	g_headerObj.keyExtraList = keysConvert(g_rootObj, {
		keyExtraList: makeDedupliArray(g_headerObj.undefinedKeyLists, g_rootObj.keyExtraList?.split(`,`)),
	});

	// デフォルトのカラー・シャッフルグループ設定を退避
	g_keycons.groups.forEach(type =>
		Object.keys(g_keyObj).filter(val => val.startsWith(type))
			.forEach(property => g_keyObj[`${property}d`] = structuredClone(g_keyObj[property])));

	// 自動横幅拡張設定
	if (g_headerObj.autoSpread) {
		const widthList = [g_sWidth, g_presetObj.autoMinWidth ?? g_keyObj.minWidth];
		g_headerObj.keyLists.forEach(key => widthList.push(g_keyObj[`minWidth${key}`] ?? g_keyObj.minWidthDefault));

		g_sWidth = Math.max(...widthList);
		$id(`canvas-frame`).width = wUnit(g_sWidth);
		$id(`divRoot`).width = wUnit(g_sWidth);
	}
	if (g_headerObj.playingWidth === `default`) {
		g_headerObj.playingWidth = g_sWidth;
	}

	// 可変ウィンドウサイズを更新
	updateWindowSiz();

	// キー数情報を初期化
	g_keyObj.currentKey = g_headerObj.keyLabels[g_stateObj.scoreId];
	g_keyObj.currentPtn = 0;

	// 画像ファイルの読み込み
	g_imgInitList.forEach(img => preloadFile(`image`, g_imgObj[img]));

	// その他の画像ファイルの読み込み
	g_headerObj.preloadImages.filter(image => hasVal(image)).forEach(preloadImage => {

		// Pattern A: |preloadImages=file.png|
		// Pattern B: |preloadImages=file*.png@10|  -> file01.png ~ file10.png
		// Pattern C: |preloadImages=file*.png@2-9| -> file2.png  ~ file9.png
		// Pattern D: |preloadImages=file*.png@003-018| -> file003.png  ~ file018.png

		const tmpPreloadImages = preloadImage.split(`@`);
		if (tmpPreloadImages.length === 1) {
			// Pattern Aの場合
			preloadFile(`image`, preloadImage);
		} else {
			const termRoopCnts = tmpPreloadImages[1].split(`-`);
			let startCnt = 1;
			let lastCnt;
			let paddingLen;

			if (termRoopCnts.length === 1) {
				// Pattern Bの場合
				lastCnt = setIntVal(tmpPreloadImages[1], 1);
				paddingLen = String(setVal(tmpPreloadImages[1], 1)).length;
			} else {
				// Pattern C, Dの場合
				startCnt = setIntVal(termRoopCnts[0], 1);
				lastCnt = setIntVal(termRoopCnts[1], 1);
				paddingLen = String(setVal(termRoopCnts[1], 1)).length;
			}
			for (let k = startCnt; k <= lastCnt; k++) {
				preloadFile(`image`, tmpPreloadImages[0].replaceAll(`*`, String(k).padStart(paddingLen, `0`)));
			}
		}
	});

	// ローカルファイル起動時に各種警告文を表示
	if (g_isFile) {
		makeWarningWindow(g_msgInfoObj.W_0011);
		if (!listMatching(getMusicUrl(g_stateObj.scoreId), [`.js`, `.txt`], { suffix: `$` })) {
			if (g_userAgent.indexOf(`firefox`) !== -1) {
				makeWarningWindow(g_msgInfoObj.W_0001);
			}
			makeWarningWindow(g_msgInfoObj.W_0012);
		}
	}

	if (g_loadObj.main) {

		// 譜面分割、譜面番号固定かどうかをチェック
		g_stateObj.dosDivideFlg = setBoolVal(document.getElementById(`externalDosDivide`)?.value ?? getQueryParamVal(`dosDivide`));
		g_stateObj.scoreLockFlg = setBoolVal(document.getElementById(`externalDosLock`)?.value ?? getQueryParamVal(`dosLock`));

		for (let j = 0; j < g_headerObj.keyLabels.length; j++) {

			// 譜面ファイルが分割されている場合、譜面詳細情報取得のために譜面をロード
			if (g_stateObj.dosDivideFlg) {
				await loadChartFile(j);
				resetColorSetting(j);
			}
			getScoreDetailData(j);
		}
		const loopCount = g_stateObj.dosDivideFlg ? g_headerObj.keyLabels.length : 1;
		for (let j = 0; j < loopCount; j++) {
			resetGaugeSetting(j);
		}
	}
	g_customJsObj.preTitle.forEach(func => func());
	titleInit();
};

/**
 * 作品別ローカルストレージの読み込み・初期設定
 */
const loadLocalStorage = () => {
	// URLからscoreId, h(高さ)を削除
	const url = new URL(location.href);
	url.searchParams.delete(`scoreId`);
	url.searchParams.delete(`h`);
	g_localStorageUrl = url.toString();

	/**
	 * ローカルストレージの初期値設定
	 * @param {string} _name 
	 * @param {string} _type 
	 * @param {number} _defaultPos 
	 */
	const checkLocalParam = (_name, _type = C_TYP_STRING, _defaultPos = 0) => {
		const defaultVal = g_settings[`${_name}s`][_defaultPos];
		if (g_localStorage[_name] !== undefined) {
			g_stateObj[_name] = setVal(g_localStorage[_name], defaultVal, _type);
			g_settings[`${_name}Num`] = roundZero(g_settings[`${_name}s`].findIndex(val => val === g_stateObj[_name]), defaultVal);
		} else {
			g_localStorage[_name] = defaultVal;
		}
	};

	// ロケールの読込、警告メッセージの入替
	const checkLocale = localStorage.getItem(`danoni-locale`);
	if (checkLocale) {
		g_langStorage = JSON.parse(checkLocale);
		g_localeObj.val = g_langStorage.locale;
		g_localeObj.num = g_localeObj.list.findIndex(val => val === g_localeObj.val);
	}
	Object.assign(g_msgInfoObj, g_lang_msgInfoObj[g_localeObj.val]);
	Object.assign(g_kCd, g_lang_kCd[g_localeObj.val]);

	// 作品別ローカルストレージの読込
	const checkStorage = localStorage.getItem(g_localStorageUrl);
	if (checkStorage) {
		g_localStorage = JSON.parse(checkStorage);

		// Adjustment, Volume, Appearance, Opacity, HitPosition初期値設定
		checkLocalParam(`adjustment`, C_TYP_FLOAT, g_settings.adjustmentNum);
		checkLocalParam(`volume`, C_TYP_NUMBER, g_settings.volumes.length - 1);
		checkLocalParam(`appearance`);
		checkLocalParam(`opacity`, C_TYP_NUMBER, g_settings.opacitys.length - 1);
		checkLocalParam(`hitPosition`, C_TYP_FLOAT, g_settings.hitPositionNum);

		// ハイスコア取得準備
		if (g_localStorage.highscores === undefined) {
			g_localStorage.highscores = {};
		}

		// 廃棄済みリストからデータを消去
		g_storeSettingsEx.filter(val => g_localStorage[val] !== undefined)
			.forEach(val => delete g_localStorage[val]);

	} else {
		g_localStorage = {
			adjustment: 0,
			hitPosition: 0,
			volume: 100,
			highscores: {},
		};
	}
};

/**
 * 譜面データを分割して値を取得
 * @param {string} _dos 譜面データ
 * @returns 
 */
const dosConvert = (_dos = ``) => {

	const obj = {};
	const paramsTmp = g_enableAmpersandSplit ? _dos.split(`&`).join(`|`) : _dos;
	paramsTmp.split(`|`).filter(param => param.indexOf(`=`) > 0).forEach(param => {
		const pos = param.indexOf(`=`);
		const pKey = param.substring(0, pos);
		const pValue = param.substring(pos + 1);

		if (pKey !== undefined) {
			obj[pKey] = g_enableDecodeURI ? decodeURIComponent(pValue) : pValue;
		}
	});
	return obj;
};

/**
 * 譜面読込
 * @param {number} _scoreId 譜面番号
 */
const loadChartFile = async (_scoreId = g_stateObj.scoreId) => {

	const dosInput = document.getElementById(`dos`);
	const divRoot = document.getElementById(`divRoot`);
	const queryDos = getQueryParamVal(`dos`) !== null ?
		`dos/${getQueryParamVal('dos')}.txt` : encodeURI(document.getElementById(`externalDos`)?.value ?? ``);

	if (dosInput === null && queryDos === ``) {
		makeWarningWindow(g_msgInfoObj.E_0023);
		g_loadObj.main = false;
		return;
	}

	// 譜面分割あり、譜面番号固定時のみ譜面データを一時クリア
	if (queryDos !== `` && g_stateObj.dosDivideFlg && g_stateObj.scoreLockFlg) {
		Object.keys(g_rootObj).filter(data => fuzzyListMatching(data, g_checkStr.resetDosHeader, g_checkStr.resetDosFooter))
			.forEach(scoredata => g_rootObj[scoredata] = ``);
	}

	// HTML埋め込みdos
	if (dosInput !== null && _scoreId === 0) {
		Object.assign(g_rootObj, dosConvert(dosInput.value));
	}

	// 外部dos読み込み
	if (queryDos !== ``) {
		const charset = document.getElementById(`externalDosCharset`)?.value ?? document.characterSet;
		const fileBase = queryDos.match(/.+\..*/)[0];
		const fileExtension = fileBase.split(`.`).pop();
		const fileCommon = fileBase.split(`.${fileExtension}`)[0];
		const filename = `${fileCommon}${g_stateObj.dosDivideFlg ?
			setDosIdHeader(_scoreId, g_stateObj.scoreLockFlg) : ''}.${fileExtension}`;

		await loadScript2(`${filename}?${Date.now()}`, false, charset);
		if (typeof externalDosInit === C_TYP_FUNCTION) {
			deleteDiv(divRoot, `lblLoading`);

			// 外部データを読込（ファイルが見つからなかった場合は譜面追記をスキップ）
			externalDosInit();
			if (g_loadObj[filename]) {
				Object.assign(g_rootObj, dosConvert(g_externalDos));
			}

		} else {
			makeWarningWindow(g_msgInfoObj.E_0022);
		}
	}
};

/**
 * 譜面をファイルで分割している場合に初期色を追加取得
 * @param {string} _scoreId 
 */
const resetColorSetting = _scoreId => {
	// 初期矢印・フリーズアロー色の再定義
	if (g_stateObj.scoreLockFlg) {
		Object.assign(g_rootObj, copySetColor(g_rootObj, _scoreId));
	}
	Object.assign(g_headerObj, resetBaseColorList(g_headerObj, g_rootObj, { scoreId: _scoreId }));
};

/**
 * 譜面をファイルで分割している場合にゲージ情報を追加取得
 * @param {string} _scoreId 
 */
const resetGaugeSetting = _scoreId => {
	// ライフ設定のカスタム部分再取得（譜面ヘッダー加味）
	Object.assign(g_gaugeOptionObj, resetCustomGauge(g_rootObj, { scoreId: _scoreId }));
	Object.keys(g_gaugeOptionObj.customFulls).forEach(gaugePtn => getGaugeSetting(g_rootObj, gaugePtn, g_headerObj.difLabels.length, { scoreId: _scoreId }));
};

/**
 * 譜面番号固定かつ譜面ファイル分割時に初期色情報を他譜面へコピー
 * @param {object} _baseObj 
 * @param {number} _scoreId
 * @returns 
 */
const copySetColor = (_baseObj, _scoreId) => {
	const obj = {};
	const scoreIdHeader = setScoreIdHeader(_scoreId, g_stateObj.scoreLockFlg);
	const idHeader = setScoreIdHeader(_scoreId);
	[``, `Shadow`].forEach(pattern =>
		[`set`, `frz`].filter(arrow => hasVal(_baseObj[`${arrow}${pattern}Color`]))
			.forEach(arrow => obj[`${arrow}${pattern}Color${idHeader}`] =
				(_baseObj[`${arrow}${pattern}Color${scoreIdHeader}`] ?? _baseObj[`${arrow}${pattern}Color`]).concat()));
	return obj;
};

/**
 * MusicUrlの基本情報を取得
 * @param {number} _scoreId
 * @returns {string}
 */
const getMusicUrl = _scoreId =>
	g_headerObj.musicUrls?.[g_headerObj.musicNos[_scoreId]] ?? g_headerObj.musicUrls?.[0] ?? `nosound.mp3`;

/**
 * 譜面ファイル読込後処理（譜面詳細情報取得用）
 * @param {number} _scoreId 
 */
const getScoreDetailData = _scoreId => {
	const keyCtrlPtn = `${g_headerObj.keyLabels[_scoreId]}_0`;
	storeBaseData(_scoreId, scoreConvert(g_rootObj, _scoreId, 0, ``, keyCtrlPtn, true), keyCtrlPtn);
};

/**
 * 譜面詳細データの格納
 * @param {number} _scoreId 
 * @param {object} _scoreObj 
 * @param {number} _keyCtrlPtn 
 */
const storeBaseData = (_scoreId, _scoreObj, _keyCtrlPtn) => {
	const lastFrame = getLastFrame(_scoreObj, _keyCtrlPtn) + 1;
	const startFrame = getStartFrame(lastFrame, 0, _scoreId);
	const firstArrowFrame = getFirstArrowFrame(_scoreObj, _keyCtrlPtn);
	const playingFrame = lastFrame - firstArrowFrame;
	const keyNum = g_keyObj[`${g_keyObj.defaultProp}${_keyCtrlPtn}`].length;

	// 譜面密度グラフ用のデータ作成
	const noteCnt = { arrow: [], frz: [] };
	const densityData = fillArray(g_limitObj.densityDivision);
	let allData = 0;

	const types = [`arrow`, `frz`];
	let fullData = [];
	for (let j = 0; j < keyNum; j++) {
		noteCnt.arrow[j] = 0;
		noteCnt.frz[j] = 0;

		const tmpFrzData = _scoreObj.frzData[j].filter((data, k) => k % 2 === 0);
		[_scoreObj.arrowData[j], tmpFrzData].forEach((typeData, m) =>
			typeData.forEach(note => {
				if (isNaN(parseFloat(note))) {
					return;
				}
				const point = Math.floor((note - firstArrowFrame) / playingFrame * g_limitObj.densityDivision);
				if (point >= 0) {
					densityData[point]++;
					noteCnt[types[m]][j]++;
					allData++;
				}
			}));
		fullData = fullData.concat(..._scoreObj.arrowData[j], ...tmpFrzData);
	}

	fullData = fullData.filter(val => !isNaN(parseFloat(val))).sort((a, b) => a - b);
	let pushCnt = 1;
	const density2PushData = fillArray(g_limitObj.densityDivision);
	const density3PushData = fillArray(g_limitObj.densityDivision);
	fullData.forEach((note, j) => {
		if (fullData[j] === fullData[j + 1]) {
			pushCnt++;
		} else {
			const point = Math.floor((note - firstArrowFrame) / playingFrame * g_limitObj.densityDivision);
			if (point >= 0) {
				if (pushCnt >= 2) {
					density2PushData[point] += pushCnt;
					if (pushCnt >= 3) {
						density3PushData[point] += pushCnt;
					}
				}
			}
			pushCnt = 1;
		}
	});

	g_detailObj.toolDif[_scoreId] = calcLevel(_scoreObj);
	g_detailObj.speedData[_scoreId] = _scoreObj.speedData.concat();
	g_detailObj.boostData[_scoreId] = _scoreObj.boostData.concat();

	const storeDensity = _densityData => {
		const dataList = [];
		for (let j = 0; j < g_limitObj.densityDivision; j++) {
			dataList.push(allData === 0 ? 0 : Math.round(_densityData[j] / allData * g_limitObj.densityDivision * 10000) / 100);
		}
		return dataList;
	};
	const diffArray = (_array1, _array2) => {
		const list = [];
		_array1.forEach((val, j) => list.push(_array1[j] - _array2[j]));
		return list;
	};
	g_detailObj.densityData[_scoreId] = storeDensity(densityData);
	g_detailObj.density2PushData[_scoreId] = storeDensity(density2PushData);
	g_detailObj.density3PushData[_scoreId] = storeDensity(density3PushData);

	g_detailObj.densityDiff[_scoreId] = diffArray(g_detailObj.densityData[_scoreId], g_detailObj.density2PushData[_scoreId]);
	g_detailObj.density2PushDiff[_scoreId] = diffArray(g_detailObj.density2PushData[_scoreId], g_detailObj.density3PushData[_scoreId]);
	g_detailObj.density3PushDiff[_scoreId] = g_detailObj.density3PushData[_scoreId].concat();

	g_detailObj.maxDensity[_scoreId] = getMaxValIdxs(densityData, g_limitObj.densityMaxVals).flat();

	g_detailObj.arrowCnt[_scoreId] = noteCnt.arrow.concat();
	g_detailObj.frzCnt[_scoreId] = noteCnt.frz.map((val, k) => _scoreObj.frzData[k].length % 2 === 0 ? val : val - 0.5);
	g_detailObj.startFrame[_scoreId] = startFrame;
	g_detailObj.playingFrame[_scoreId] = playingFrame;
	g_detailObj.playingFrameWithBlank[_scoreId] = lastFrame - startFrame;
};

/**
 * ツール計算
 * @param {object} _scoreObj 
 * @param {number[][]} _scoreObj.arrowData
 * @param {number[][]} _scoreObj.frzData
 */
const calcLevel = _scoreObj => {
	//--------------------------------------------------------------
	//＜フリーズデータ分解＞
	//  フリーズデータを分解し、矢印データに組み込む
	//
	//  (イメージ)
	//    &left_data=400,500,700&
	//    &frzLeft_data=550,650&
	//  ⇒
	//    left_data=[400,500,550,700];  // フリーズの始点を組込
	//    frzStartData=[550];	// フリーズ始点
	//    frzEndData  =[650];	// フリーズ終点
	//--------------------------------------------------------------
	const frzStartData = [];
	const frzEndData = [];

	_scoreObj.frzData.forEach((frzs, j) => {
		if (frzs.length > 1) {
			for (let k = 0; k < frzs.length; k += 2) {
				_scoreObj.arrowData[j].push(frzs[k]);
				frzStartData.push(frzs[k]);
				frzEndData.push(frzs[k + 1]);
			}
		}
		_scoreObj.arrowData[j] = _scoreObj.arrowData[j].sort((a, b) => a - b)
			.filter((x, i, self) => self.indexOf(x) === i && !isNaN(parseFloat(x)));
	})

	frzStartData.sort((a, b) => a - b);
	frzEndData.sort((a, b) => a - b);

	//--------------------------------------------------------------
	//＜データ結合･整理＞
	//  矢印データを連結してソートする。
	//
	//  重複は後の同時押し補正で使用する。
	//  後の同時押し補正の都合上、firstFrame-100, lastFrame+100 のデータを末尾に追加。
	//
	//  (イメージ)
	//    |left_data=300,400,550|	// フリーズデータ(始点)を含む
	//    |down_data=500|
	//    |up_data=600|
	//    |right_data=700,800|
	//    |space_data=200,300,1000|
	//    frzEndData = [650];	// フリーズデータ(終点) ※allScorebook対象外
	//  ⇒
	//    allScorebook = [100,200,300,300,400,500,550,600,700,800,1000,1100];
	//
	//--------------------------------------------------------------
	let allScorebook = [];
	_scoreObj.arrowData.forEach(data => allScorebook = allScorebook.concat(data));

	allScorebook.sort((a, b) => a - b);
	allScorebook.unshift(allScorebook[0] - 100);
	allScorebook.push(allScorebook.at(-1) + 100);
	const allCnt = allScorebook.length;

	frzEndData.push(allScorebook.at(-1));

	//--------------------------------------------------------------
	//＜間隔フレーム数の調和平均計算+いろいろ補正＞
	//  レベル計算メイン。
	//
	//  [レベル計算ツール++ ver1.18] 3つ押し以上でも同時押し補正ができるよう調整
	//--------------------------------------------------------------
	let levelcount = 0;   // 難易度レベル
	let freezenum = 0; // フリーズアロー数
	let pushCnt = 1;   // 同時押し数カウント
	let twoPushCount = 0; // 同時押し補正値
	const push3List = [];    // 3つ押し判定数

	for (let i = 1; i < allCnt - 2; i++) {
		// フリーズ始点の検索
		while (frzStartData[0] === allScorebook[i]) {
			// 同時押しの場合
			if (allScorebook[i] === allScorebook[i + 1]) {
				break;
			}

			// 現フレームに存在するフリーズ数を1増やす
			// (フリーズアローの同時チェック開始)
			frzStartData.shift();
			freezenum++;
		}

		// フリーズ終点の検索
		while (frzEndData[0] < allScorebook[i + 1]) {
			// 現フレームに存在するフリーズ数を1減らす
			frzEndData.shift();
			freezenum--;
		}

		// 同時押し補正処理(フリーズアローが絡まない場合)
		if (allScorebook[i + 1] === allScorebook[i] && !freezenum) {

			const chk = (allScorebook[i + 2] - allScorebook[i + 1]) * (allScorebook[i] - allScorebook[i - pushCnt]);
			if (chk !== 0) {
				twoPushCount += 40 / chk;
			} else {
				// 3つ押しが絡んだ場合は加算しない
				push3List.push(allScorebook[i]);
			}
			pushCnt++;

		} else {
			// 単押し＋フリーズアローの補正処理(フリーズアロー中の矢印)
			pushCnt = 1;
			const chk2 = (2 - freezenum) * (allScorebook[i + 1] - allScorebook[i]);
			if (chk2 > 0) {
				levelcount += 2 / chk2;
			} else {
				// 3つ押しが絡んだ場合は加算しない
				push3List.push(allScorebook[i]);
			}
		}
	}
	levelcount += twoPushCount;
	const leveltmp = levelcount;

	//--------------------------------------------------------------
	//＜同方向連打補正＞
	//  同方向矢印(フリーズアロー)の隣接間隔が10フレーム未満の場合に加算する。
	//--------------------------------------------------------------
	_scoreObj.arrowData.forEach(arrows =>
		arrows.forEach((val, k) => {
			if (arrows[k + 1] - arrows[k] < 10) {
				levelcount += 10 / Math.pow(arrows[k + 1] - arrows[k], 2) - 1 / 10;
			}
		}));

	//--------------------------------------------------------------
	//＜表示＞
	//  曲長、3つ押し補正を行い、最終的な難易度レベル値を表示する。
	//--------------------------------------------------------------
	const push3Cnt = push3List.length;
	const calcArrowCnt = allCnt - push3Cnt - 3;
	const toDecimal2 = num => Math.round(num * 100) / 100;
	const calcDifLevel = num => calcArrowCnt > 0 ? toDecimal2(num / Math.sqrt(calcArrowCnt) * 4) : 0;

	const baseDifLevel = calcDifLevel(levelcount);
	const difLevel = toDecimal2(baseDifLevel * (allCnt - 3) / calcArrowCnt);

	//--------------------------------------------------------------
	//＜計算結果を格納＞
	//--------------------------------------------------------------
	return {
		// 難易度レベル
		tool: (allCnt === 3 ? `0.01` : `${difLevel.toFixed(2)}${(push3Cnt > 0 ? "*" : "")}`),
		// 縦連打補正
		tate: toDecimal2(baseDifLevel - calcDifLevel(leveltmp)),
		// 同時押し補正
		douji: calcDifLevel(twoPushCount),
		// 3つ押し数
		push3cnt: push3Cnt,
		// 3つ押しリスト
		push3: makeDedupliArray(push3List),
	};
};

/**
 * ロケールを含んだヘッダーの優先度設定
 * @param {object} _obj 
 * @param {...any} [_params]
 */
const getHeader = (_obj, ..._params) => {
	let headerLocale, headerDf;
	Object.keys(_params).forEach(j => {
		headerLocale ??= _obj[`${_params[j]}${g_localeObj.val}`];
		headerDf ??= _obj[_params[j]];
	});
	return headerLocale ?? headerDf;
};

/**
 * ヘッダー名の互換設定
 * @param {string} _param 
 * @returns {string[]}
 */
const getHname = _param => [_param, _param.toLowerCase()];

/**
 * 譜面ヘッダーの分解（スキン、jsファイルなどの設定）
 * @param {object} _dosObj
 * @returns
 */
const preheaderConvert = _dosObj => {

	// ヘッダー群の格納先
	const obj = {};

	// ウィンドウ位置の設定
	const align = _dosObj.windowAlign ?? g_presetObj.windowAlign;
	if (align !== undefined) {
		g_windowAlign[align]();
	}

	obj.jsData = [];
	obj.stepRtnUse = true;

	const setJsFiles = (_files, _defaultDir, _type = `custom`) =>
		_files.filter(file => hasVal(file)).forEach(file => {
			const [jsFile, jsDir] = getFilePath(file, _defaultDir);
			obj.jsData.push([_type === `skin` ? `danoni_skin_${jsFile}.js` : jsFile, jsDir]);
		});

	const convLocalPath = (_file, _type) =>
		g_remoteFlg && !_file.includes(`(..)`) ? `(..)../${_type}/${_file}` : _file;

	// 外部スキンファイルの指定
	const tmpSkinType = _dosObj.skinType ?? g_presetObj.skinType ?? `default`;
	const tmpSkinTypes = tmpSkinType.split(`,`);
	obj.defaultSkinFlg = tmpSkinTypes.includes(`default`) && setBoolVal(_dosObj.bgCanvasUse ?? g_presetObj.bgCanvasUse, true);
	setJsFiles(tmpSkinTypes, C_DIR_SKIN, `skin`);

	// 外部jsファイルの指定
	const tmpCustomjs = getHeader(_dosObj, ...getHname(`customJs`)) ?? g_presetObj.customJs ?? C_JSF_CUSTOM;
	setJsFiles(tmpCustomjs.replaceAll(`*`, g_presetObj.customJs).split(`,`)
		.map(file => convLocalPath(file, `js`)), C_DIR_JS);

	// 外部cssファイルの指定
	const tmpCustomcss = getHeader(_dosObj, ...getHname(`customCss`)) ?? g_presetObj.customCss ?? ``;
	setJsFiles(tmpCustomcss.replaceAll(`*`, g_presetObj.customCss).split(`,`)
		.map(file => convLocalPath(file, `css`)), C_DIR_CSS);

	// デフォルト曲名表示、背景、Ready表示の利用有無
	g_titleLists.init.forEach(objName => {
		const objUpper = toCapitalize(objName);
		obj[`custom${objUpper}Use`] =
			setBoolVal(_dosObj[`custom${objUpper}Use`] ?? g_presetObj.customDesignUse?.[objName]);
	});

	// 背景・マスクモーションのパス指定方法を他の設定に合わせる設定
	obj.syncBackPath = setBoolVal(_dosObj.syncBackPath ?? g_presetObj.syncBackPath);

	return obj;
};

/**
 * 譜面ヘッダーの分解（その他の設定）
 * @param {object} _dosObj 譜面データオブジェクト
 * @returns
 */
const headerConvert = _dosObj => {

	// ヘッダー群の格納先
	const obj = {};

	// 自動プリロードの設定
	obj.autoPreload = setBoolVal(_dosObj.autoPreload, true);
	g_headerObj.autoPreload = obj.autoPreload;

	// デフォルトスタイルのバックアップ
	getCssCustomProperties();

	// 初期で変更するカスタムプロパティを設定
	Object.keys(_dosObj).filter(val => val.startsWith(`--`) && hasVal(_dosObj[val])).forEach(prop => {
		g_cssBkProperties[prop] = getCssCustomProperty(prop, _dosObj[prop]);
		document.documentElement.style.setProperty(prop, g_cssBkProperties[prop]);
	});

	// フォントの設定
	obj.customFont = _dosObj.customFont ?? ``;
	g_headerObj.customFont = obj.customFont;

	// 画像ルートパス、拡張子の設定 (サーバ上のみ)
	obj.imgType = [];
	if (!g_isFile) {
		let tmpImgTypes = [];
		if (hasVal(_dosObj.imgType)) {
			tmpImgTypes = splitLF2(_dosObj.imgType);
		} else if (g_presetObj.imageSets !== undefined) {
			tmpImgTypes = g_presetObj.imageSets.concat();
		}
		tmpImgTypes.forEach((tmpImgType, j) => {
			const imgTypes = tmpImgType.split(`,`);
			obj.imgType[j] = {
				name: imgTypes[0],
				extension: imgTypes[1] || `svg`,
				rotateEnabled: setBoolVal(imgTypes[2], true),
				flatStepHeight: setVal(imgTypes[3], C_ARW_WIDTH, C_TYP_FLOAT),
			};
			g_keycons.imgTypes[j] = (imgTypes[0] === `` ? `Original` : imgTypes[0]);
		});
	}

	// 末尾にデフォルト画像セットが入るよう追加
	if (obj.imgType.findIndex(imgSets => imgSets.name === ``) === -1) {
		obj.imgType.push({ name: ``, extension: `svg`, rotateEnabled: true, flatStepHeight: C_ARW_WIDTH });
		g_keycons.imgTypes.push(`Original`);
	}
	g_imgType = g_keycons.imgTypes[0];
	g_stateObj.rotateEnabled = obj.imgType[0].rotateEnabled;
	g_stateObj.flatStepHeight = obj.imgType[0].flatStepHeight;

	const [titleArrowName, titleArrowRotate] = padArray(_dosObj.titleArrowName?.split(`:`), [`Original`, 180]);
	obj.titleArrowNo = roundZero(g_keycons.imgTypes.findIndex(imgType => imgType === titleArrowName));
	obj.titleArrowRotate = titleArrowRotate;

	// サーバ上の場合、画像セットを再読込（ローカルファイル時は読込済みのためスキップ）
	if (!g_isFile) {
		updateImgType(obj.imgType[obj.titleArrowNo], true);
		updateImgType(obj.imgType[0]);
	} else {
		g_imgObj.titleArrow = C_IMG_ARROW;
	}

	// ラベルテキスト、オンマウステキスト、確認メッセージ定義の上書き設定
	Object.assign(g_lblNameObj, g_lang_lblNameObj[g_localeObj.val], g_presetObj.lblName?.[g_localeObj.val]);
	Object.assign(g_msgObj, g_lang_msgObj[g_localeObj.val], g_presetObj.msg?.[g_localeObj.val]);

	// 自動横幅拡張設定
	obj.autoSpread = setBoolVal(_dosObj.autoSpread, g_presetObj.autoSpread ?? true);

	// 横幅設定
	if (hasVal(_dosObj.windowWidth)) {
		g_sWidth = Math.max(setIntVal(_dosObj.windowWidth, g_sWidth), g_sWidth);
		$id(`canvas-frame`).width = wUnit(g_sWidth);
	}
	// 高さ設定
	obj.heightVariable = getQueryParamVal(`h`) !== null && (_dosObj.heightVariable || g_presetObj.heightVariable || false);
	if (hasVal(_dosObj.windowHeight || g_presetObj.autoMinHeight) || obj.heightVariable) {
		g_sHeight = Math.max(setIntVal(_dosObj.windowHeight, g_presetObj.autoMinHeight ?? g_sHeight),
			setIntVal(getQueryParamVal(`h`), g_sHeight), g_sHeight);
		$id(`canvas-frame`).height = wUnit(g_sHeight);
	}
	if (!(_dosObj.heightVariable || g_presetObj.heightVariable || false)) {
		obj.heightLockFlg = true;
		g_settings.playWindows = g_settings.playWindows.filter(val => !val.endsWith(`Slope`) && !val.endsWith(`SideScroll`));
	}

	// 曲名
	obj.musicTitles = [];
	obj.musicTitlesForView = [];
	obj.artistNames = [];
	obj.musicNos = [];

	const dosMusicTitle = getHeader(_dosObj, `musicTitle`);
	if (hasVal(dosMusicTitle)) {
		const musicData = splitLF2(dosMusicTitle);

		if (hasVal(_dosObj.musicNo)) {
			obj.musicNos = _dosObj.musicNo.split(`$`);
		}

		for (let j = 0; j < musicData.length; j++) {
			const musics = splitComma(musicData[j]);

			if (obj.musicNos.length >= j) {
				obj.musicTitles[j] = escapeHtml(getMusicNameSimple(musics[0]));
				obj.musicTitlesForView[j] = escapeHtmlForArray(getMusicNameMultiLine(musics[0]));
				obj.artistNames[j] = escapeHtml(musics[1] ?? ``);
			}
		}
		const musics = splitComma(musicData[0]);
		obj.musicTitle = obj.musicTitles[0];
		obj.musicTitleForView = obj.musicTitlesForView[0];
		obj.artistName = obj.artistNames[0] ?? ``;
		if (obj.artistName === ``) {
			makeWarningWindow(g_msgInfoObj.E_0011);
			obj.artistName = `artistName`;
		}
		obj.artistUrl = musics[2] ?? ``;
		if (musics[3] !== undefined) {
			obj.musicTitles[0] = escapeHtml(getMusicNameSimple(musics[3]));
			obj.musicTitlesForView[0] = escapeHtmlForArray(getMusicNameMultiLine(musics[3]));
		}

	} else {
		makeWarningWindow(g_msgInfoObj.E_0012);
		obj.musicTitle = `musicName`;
		obj.musicTitleForView = [`musicName`];
		obj.artistName = `artistName`;
		obj.artistUrl = ``;
	}

	// 最小・最大速度の設定
	obj.minSpeed = Math.round(setVal(_dosObj.minSpeed, C_MIN_SPEED, C_TYP_FLOAT) * 4) / 4;
	obj.maxSpeed = Math.round(setVal(_dosObj.maxSpeed, C_MAX_SPEED, C_TYP_FLOAT) * 4) / 4;
	if (obj.minSpeed > obj.maxSpeed || obj.minSpeed < 0.5 || obj.maxSpeed < 0.5) {
		obj.minSpeed = C_MIN_SPEED;
		obj.maxSpeed = C_MAX_SPEED;
	}
	g_settings.speeds = makeSpeedList(obj.minSpeed, obj.maxSpeed);

	// プレイ中のショートカットキー
	obj.keyRetry = setIntVal(getKeyCtrlVal(_dosObj.keyRetry), C_KEY_RETRY);
	obj.keyRetryDef = obj.keyRetry;
	obj.keyRetryDef2 = obj.keyRetry;
	obj.keyTitleBack = setIntVal(getKeyCtrlVal(_dosObj.keyTitleBack), C_KEY_TITLEBACK);
	obj.keyTitleBackDef = obj.keyTitleBack;
	obj.keyTitleBackDef2 = obj.keyTitleBack;

	// フリーズアローの許容フレーム数設定
	obj.frzAttempt = setIntVal(_dosObj.frzAttempt, C_FRM_FRZATTEMPT);

	// 製作者表示
	const dosTuning = getHeader(_dosObj, `tuning`);
	if (hasVal(dosTuning)) {
		const tunings = dosTuning.split(`,`);
		obj.tuning = escapeHtmlForEnabledTag(tunings[0]);
		obj.creatorUrl = (tunings.length > 1 ? tunings[1] : (g_presetObj.tuningUrl ?? ``));
	} else {
		obj.tuning = escapeHtmlForEnabledTag(getHeader(g_presetObj, `tuning`) ?? `name`);
		obj.creatorUrl = g_presetObj.tuningUrl ?? ``;
	}
	obj.tuningInit = obj.tuning;

	obj.dosNos = [];
	obj.scoreNos = [];
	if (hasVal(_dosObj.dosNo)) {
		splitLF2(_dosObj.dosNo).map((val, j) => [obj.dosNos[j], obj.scoreNos[j]] = val.split(`,`));
		const dosNoCnt = {};
		obj.dosNos.forEach((val, j) => {
			if (dosNoCnt[val] === undefined) {
				dosNoCnt[val] = 0;
			}
			if (obj.scoreNos[j] === undefined) {
				dosNoCnt[val]++;
				obj.scoreNos[j] = dosNoCnt[val];
			} else {
				dosNoCnt[val] = Number(obj.scoreNos[j]);
			}
		});
	}

	// 譜面情報
	if (hasVal(_dosObj.difData)) {
		const difs = splitLF2(_dosObj.difData);
		const difpos = {
			Key: 0, Name: 1, Speed: 2, Border: 3, Recovery: 4, Damage: 5, Init: 6,
		};
		obj.keyLabels = [];
		obj.difLabels = [];
		obj.initSpeeds = [];
		obj.lifeBorders = [];
		obj.lifeRecoverys = [];
		obj.lifeDamages = [];
		obj.lifeInits = [];
		obj.creatorNames = [];
		g_stateObj.scoreId = (g_stateObj.scoreId < difs.length ? g_stateObj.scoreId : 0);

		difs.forEach(dif => {
			const difDetails = dif.split(`,`);
			const lifeData = (_type, _default) =>
				difDetails[difpos[_type]] || g_presetObj.gauge?.[_type] || _default;

			// ライフ：ノルマ、回復量、ダメージ量、初期値の設定
			obj.lifeBorders.push(lifeData(`Border`, `x`));
			obj.lifeRecoverys.push(lifeData(`Recovery`, 6));
			obj.lifeDamages.push(lifeData(`Damage`, 40));
			obj.lifeInits.push(lifeData(`Init`, 25));

			// キー数
			const keyLabel = difDetails[difpos.Key] || `7`;
			obj.keyLabels.push(g_keyObj.keyTransPattern[keyLabel] ?? keyLabel);

			// 譜面名、制作者名
			if (hasVal(difDetails[difpos.Name])) {
				const difNameInfo = difDetails[difpos.Name].split(`::`);
				obj.difLabels.push(escapeHtml(difNameInfo[0] ?? `Normal`));
				obj.creatorNames.push(difNameInfo.length > 1 ? escapeHtml(difNameInfo[1]) : obj.tuning);
			} else {
				obj.difLabels.push(`Normal`);
				obj.creatorNames.push(obj.tuning);
			}

			// 初期速度
			obj.initSpeeds.push(setVal(difDetails[difpos.Speed], 3.5, C_TYP_FLOAT));
		});
	} else {
		makeWarningWindow(g_msgInfoObj.E_0021);
		obj.keyLabels = [`7`];
		obj.difLabels = [`Normal`];
		obj.initSpeeds = [3.5];
		obj.lifeBorders = [`x`];
		obj.lifeRecoverys = [6];
		obj.lifeDamages = [40];
		obj.lifeInits = [25];
		obj.creatorNames = [obj.tuning];
	}
	const keyLists = makeDedupliArray(obj.keyLabels);
	obj.viewLists = [...Array(obj.keyLabels.length).keys()];
	obj.keyLists = keyLists.sort((a, b) => parseInt(a) - parseInt(b));
	obj.undefinedKeyLists = obj.keyLists.filter(key => g_keyObj[`${g_keyObj.defaultProp}${key}_0`] === undefined);

	// 譜面変更セレクターの利用有無
	obj.difSelectorUse = getDifSelectorUse(_dosObj.difSelectorUse, obj.viewLists);

	// 初期速度の設定
	g_stateObj.speed = obj.initSpeeds[g_stateObj.scoreId];
	g_settings.speedNum = roundZero(g_settings.speeds.findIndex(speed => speed === g_stateObj.speed));

	// グラデーションのデフォルト中間色を設定
	divRoot.appendChild(createDivCss2Label(`dummyLabel`, ``, { pointerEvents: C_DIS_NONE }));
	obj.baseBrightFlg = setBoolVal(_dosObj.baseBright, checkLightOrDark(colorNameToCode(window.getComputedStyle(dummyLabel, ``).color)));
	const intermediateColor = obj.baseBrightFlg ? `#111111` : `#eeeeee`;

	// 矢印の色変化を常時グラデーションさせる設定
	obj.defaultColorgrd = [false, intermediateColor];
	if (hasVal(_dosObj.defaultColorgrd)) {
		obj.defaultColorgrd = _dosObj.defaultColorgrd.split(`,`);
		obj.defaultColorgrd[0] = setBoolVal(obj.defaultColorgrd[0]);
		obj.defaultColorgrd[1] = obj.defaultColorgrd[1] ?? intermediateColor;
	}
	g_rankObj.rankColorAllPerfect = intermediateColor;

	// カラーコードのゼロパディング有無設定
	obj.colorCdPaddingUse = setBoolVal(_dosObj.colorCdPaddingUse);

	// 最大ライフ
	obj.maxLifeVal = setVal(_dosObj.maxLifeVal, C_VAL_MAXLIFE, C_TYP_FLOAT);
	if (obj.maxLifeVal <= 0) {
		obj.maxLifeVal = C_VAL_MAXLIFE;
		makeWarningWindow(g_msgInfoObj.E_0042.split(`{0}`).join(`maxLifeVal`));
	}

	// ゲージ初期設定（最大ライフ反映）
	g_gaugeOptionObj.defaultList.forEach(type => {
		const pos = g_gaugeOptionObj[`dmg${toCapitalize(type)}`].findIndex(val => val === C_LFE_MAXLIFE);
		g_gaugeOptionObj[`dmg${toCapitalize(type)}`][pos] = obj.maxLifeVal;
	});

	// フリーズアローのデフォルト色セットの利用有無 (true: 使用, false: 矢印色を優先してセット)
	obj.defaultFrzColorUse = setBoolVal(_dosObj.defaultFrzColorUse ?? g_presetObj.frzColors, true);

	// 矢印色変化に対応してフリーズアロー色を追随する範囲の設定
	// (defaultFrzColorUse=false時のみ)
	obj.frzScopeFromArrowColors = [];

	if (!obj.defaultFrzColorUse) {
		const tmpFrzScope = [];

		if (hasVal(_dosObj.frzScopeFromAC)) {
			tmpFrzScope.push(..._dosObj.frzScopeFromAC.split(`,`));
		} else if (g_presetObj.frzScopeFromAC !== undefined) {
			tmpFrzScope.push(...g_presetObj.frzScopeFromAC);
		}
		tmpFrzScope.filter(type => [`Normal`, `Hit`].includes(type))
			.forEach(data => obj.frzScopeFromArrowColors.push(data));
	}

	// 初期色情報
	const baseColor = (obj.baseBrightFlg ? `light` : `dark`);
	Object.assign(g_dfColorObj, g_dfColorBaseObj[baseColor]);
	Object.keys(g_dfColorObj).forEach(key => obj[key] = g_dfColorObj[key].concat());
	obj.frzColorDefault = [];

	// ダミー用初期矢印色
	obj.setDummyColor = [`#777777`, `#444444`, `#777777`, `#444444`, `#777777`];
	obj.dfColorgrdSet = {
		'': obj.defaultColorgrd,
		'Type0': [!obj.defaultColorgrd[0], obj.defaultColorgrd[1]],
	};

	// カスタムゲージ設定（共通設定ファイル）
	addGaugeFulls(g_gaugeOptionObj.survival);
	addGaugeFulls(g_gaugeOptionObj.border);

	if (g_presetObj.gaugeList !== undefined) {
		Object.keys(g_presetObj.gaugeList).forEach(key => {
			g_gaugeOptionObj.customDefault.push(key);
			g_gaugeOptionObj.varCustomDefault.push(boolToSwitch(g_presetObj.gaugeList[key] === `V`));
		});
		g_gaugeOptionObj.custom = g_gaugeOptionObj.customDefault.concat();
		g_gaugeOptionObj.varCustom = g_gaugeOptionObj.varCustomDefault.concat();
		addGaugeFulls(g_gaugeOptionObj.customDefault);
	}

	// カスタムゲージ設定、初期色設定（譜面ヘッダー）の譜面別設定
	for (let j = 0; j < obj.difLabels.length; j++) {
		Object.assign(g_gaugeOptionObj, resetCustomGauge(_dosObj, { scoreId: j }));
		Object.assign(obj, resetBaseColorList(obj, _dosObj, { scoreId: j }));
	}

	// ダミー譜面の設定
	if (hasVal(_dosObj.dummyId)) {
		obj.dummyScoreNos = _dosObj.dummyId.split(`$`);
	}

	// 無音のフレーム数
	obj.blankFrameDefs = [200];
	if (isNaN(parseFloat(_dosObj.blankFrame))) {
	} else {
		obj.blankFrameDefs = _dosObj.blankFrame.split(`$`).map(val => parseInt(val));
	}
	obj.blankFrame = obj.blankFrameDefs[0];
	obj.blankFrameDef = obj.blankFrameDefs[0];

	// 開始フレーム数（0以外の場合はフェードインスタート）、終了フレーム数
	[`startFrame`, `endFrame`].filter(tmpParam => hasVal(_dosObj[tmpParam]))
		.forEach(param => obj[param] = _dosObj[param].split(`$`).map(frame => transTimerToFrame(frame)));

	// フェードアウトフレーム数(譜面別)
	if (hasVal(_dosObj.fadeFrame)) {
		const fadeFrames = _dosObj.fadeFrame.split(`$`);
		obj.fadeFrame = [];
		fadeFrames.forEach((fadeInfo, j) => {
			obj.fadeFrame[j] = fadeInfo.split(`,`);
			obj.fadeFrame[j][0] = transTimerToFrame(obj.fadeFrame[j][0]);
		});
	}

	// タイミング調整
	obj.adjustment = (hasVal(_dosObj.adjustment) ? _dosObj.adjustment.split(`$`) : [0]);

	// 再生速度
	obj.playbackRate = setVal(_dosObj.playbackRate, 1, C_TYP_FLOAT);
	if (obj.playbackRate <= 0) {
		obj.playbackRate = 1;
		makeWarningWindow(g_msgInfoObj.E_0042.split(`{0}`).join(`playbackRate`));
	}

	// プレイサイズ(X方向, Y方向)
	obj.playingWidth = setIntVal(_dosObj.playingWidth, g_presetObj.playingWidth ?? `default`);
	const tmpPlayingHeight = setIntVal(_dosObj.playingHeight, g_presetObj.playingHeight ?? g_sHeight);
	obj.playingHeight = Math.max(obj.heightVariable ?
		setIntVal(getQueryParamVal(`h`) - (g_sHeight - tmpPlayingHeight), tmpPlayingHeight) : tmpPlayingHeight, 400);

	// プレイ左上位置(X座標, Y座標)
	obj.playingX = setIntVal(_dosObj.playingX, g_presetObj.playingX ?? 0);
	obj.playingY = setIntVal(_dosObj.playingY, g_presetObj.playingY ?? 0);

	// ステップゾーン位置
	g_posObj.stepY = (isNaN(parseFloat(_dosObj.stepY)) ? C_STEP_Y : parseFloat(_dosObj.stepY));
	g_posObj.stepYR = (isNaN(parseFloat(_dosObj.stepYR)) ? C_STEP_YR : parseFloat(_dosObj.stepYR));
	g_posObj.stepDiffY = g_posObj.stepY - C_STEP_Y;
	g_posObj.distY = obj.playingHeight - C_STEP_Y + g_posObj.stepYR;
	g_posObj.reverseStepY = g_posObj.distY - g_posObj.stepY - g_posObj.stepDiffY - C_ARW_WIDTH;
	g_posObj.arrowHeight = obj.playingHeight + g_posObj.stepYR - g_posObj.stepDiffY * 2;
	obj.bottomWordSetFlg = setBoolVal(_dosObj.bottomWordSet);

	// ウィンドウサイズ(高さ)とステップゾーン位置の組み合わせで基準速度を変更
	obj.baseSpeed = 1 + ((g_posObj.distY - (g_posObj.stepY - C_STEP_Y) * 2) / (500 - C_STEP_Y) - 1) * 0.85;

	// 矢印・フリーズアロー判定位置補正
	g_diffObj.arrowJdgY = (isNaN(parseFloat(_dosObj.arrowJdgY)) ? 0 : parseFloat(_dosObj.arrowJdgY));
	g_diffObj.frzJdgY = (isNaN(parseFloat(_dosObj.frzJdgY)) ? 0 : parseFloat(_dosObj.frzJdgY));

	// musicフォルダ設定
	obj.musicFolder = _dosObj.musicFolder ?? (g_remoteFlg ? `(..)../music` : `music`);

	// 楽曲URL
	if (hasVal(_dosObj.musicUrl)) {
		obj.musicUrls = splitLF2(_dosObj.musicUrl);
	} else {
		makeWarningWindow(g_msgInfoObj.E_0031);
	}

	// ハッシュタグ
	obj.hashTag = _dosObj.hashTag ?? ``;

	// 読込対象の画像を指定(rel:preload)と同じ
	obj.preloadImages = [];
	if (hasVal(_dosObj.preloadImages)) {
		obj.preloadImages = _dosObj.preloadImages.split(`,`).filter(image => hasVal(image)).map(preloadImage => preloadImage);
	}

	// 初期表示する部分キーの設定
	obj.keyGroupOrder = [];
	_dosObj.keyGroupOrder?.split(`$`).forEach((val, j) => {
		if (val !== ``) {
			obj.keyGroupOrder[j] = val.split(`,`);
		}
	});

	// 最終演出表示有無（noneで無効化）
	obj.finishView = _dosObj.finishView ?? ``;

	// 更新日
	obj.releaseDate = _dosObj.releaseDate ?? ``;

	// デフォルトReady/リザルト表示の遅延時間設定
	[`ready`, `result`].forEach(objName =>
		obj[`${objName}DelayFrame`] = setIntVal(_dosObj[`${objName}DelayFrame`]));

	// デフォルトReady表示のアニメーション時間設定
	obj.readyAnimationFrame = setIntVal(_dosObj.readyAnimationFrame, 150);

	// デフォルトReady表示のアニメーション名
	obj.readyAnimationName = _dosObj.readyAnimationName ?? `leftToRightFade`;

	// デフォルトReady表示の先頭文字色
	obj.readyColor = _dosObj.readyColor ?? ``;

	// デフォルトReady表示を上書きするテキスト
	obj.readyHtml = _dosObj.readyHtml ?? ``;

	// デフォルト曲名表示のフォントサイズ
	obj.titlesize = getHeader(_dosObj, ...getHname(`titleSize`)) ?? ``;

	// デフォルト曲名表示のフォント名
	// (使用例： |titlefont=Century,Meiryo UI|)
	obj.titlefonts = g_titleLists.defaultFonts.concat();
	getHeader(_dosObj, ...getHname(`titleFont`))?.split(`$`).forEach((font, j) => obj.titlefonts[j] = `'${(font.replaceAll(`,`, `', '`))}'`);
	if (obj.titlefonts[1] === undefined) {
		obj.titlefonts[1] = obj.titlefonts[0];
	}

	// デフォルト曲名表示, 背景矢印のグラデーション指定css
	[`titlegrd`, `titleArrowgrd`].forEach(_name => {
		const objName = `${_name.toLowerCase()}`;
		obj[`${objName}s`] = [];
		const tmpTitlegrd = getHeader(_dosObj, ...getHname(_name))?.replaceAll(`,`, `:`);
		if (hasVal(tmpTitlegrd)) {
			obj[`${objName}s`] = tmpTitlegrd.split(`$`);
			obj[`${objName}`] = obj[`${objName}s`][0] ?? ``;
		}
	});

	// デフォルト曲名表示の表示位置調整
	obj.titlepos = [[0, 0], [0, 0]];
	getHeader(_dosObj, ...getHname(`titlePos`))?.split(`$`).forEach((pos, j) => obj.titlepos[j] = pos.split(`,`).map(x => parseFloat(x)));

	// タイトル文字のアニメーション設定
	obj.titleAnimationName = [`leftToRight`];
	obj.titleAnimationDuration = [1.5];
	obj.titleAnimationDelay = [0];
	obj.titleAnimationTimingFunction = [`ease`];
	obj.titleAnimationClass = [``];

	getHeader(_dosObj, ...getHname(`titleAnimation`))?.split(`$`).forEach((pos, j) => {
		const titleAnimation = pos.split(`,`);
		obj.titleAnimationName[j] = setVal(titleAnimation[0], obj.titleAnimationName[0]);
		obj.titleAnimationDuration[j] = setVal(titleAnimation[1] / g_fps, obj.titleAnimationDuration[0], C_TYP_FLOAT);
		obj.titleAnimationDelay[j] = setVal(titleAnimation[2] / g_fps, obj.titleAnimationDelay[0], C_TYP_FLOAT);
		obj.titleAnimationTimingFunction[j] = setVal(titleAnimation[3], obj.titleAnimationName[3]);
	});
	getHeader(_dosObj, ...getHname(`titleAnimationClass`))?.split(`$`).forEach((animationClass, j) =>
		obj.titleAnimationClass[j] = animationClass ?? ``);

	if (obj.titleAnimationName.length === 1) {
		g_titleLists.animation.forEach(pattern =>
			obj[`titleAnimation${pattern}`][1] = obj[`titleAnimation${pattern}`][0]);
	}
	if (obj.titleAnimationClass.length === 1) {
		obj.titleAnimationClass[1] = obj.titleAnimationClass[0];
	}

	// デフォルト曲名表示の複数行時の縦間隔
	obj.titlelineheight = setIntVal(getHeader(_dosObj, ...getHname(`titleLineHeight`)), ``);

	// フリーズアローの始点で通常矢印の判定を行うか(dotさんソース方式)
	obj.frzStartjdgUse = setBoolVal(_dosObj.frzStartjdgUse ?? g_presetObj.frzStartjdgUse);

	// 空押し判定を行うか
	obj.excessiveJdgUse = setBoolVal(_dosObj.excessiveJdgUse ?? g_presetObj.excessiveJdgUse);
	g_stateObj.excessive = boolToSwitch(obj.excessiveJdgUse);
	g_settings.excessiveNum = Number(obj.excessiveJdgUse);

	// 譜面名に制作者名を付加するかどうかのフラグ
	obj.makerView = setBoolVal(_dosObj.makerView);

	// shuffleUse=group 時のみshuffle用配列を組み替える
	if (_dosObj.shuffleUse === `group`) {
		_dosObj.shuffleUse = true;
		g_settings.shuffles = g_settings.shuffles.filter(val => !val.endsWith(`+`));
	}

	// オプション利用可否設定
	g_canDisabledSettings.forEach(option =>
		obj[`${option}Use`] = setBoolVal(_dosObj[`${option}Use`] ?? g_presetObj.settingUse?.[option], true));

	let interlockingErrorFlg = false;
	g_displays.forEach((option, j) => {

		// Display使用可否設定を分解 |displayUse=false,ON|
		const displayTempUse = _dosObj[`${option}Use`] ?? g_presetObj.settingUse?.[option] ?? `true`;
		const displayUse = displayTempUse?.split(`,`) ?? [true, C_FLG_ON];

		// displayUse -> ボタンの有効/無効, displaySet -> ボタンの初期値(ON/OFF)
		obj[`${option}Use`] = setBoolVal(displayUse[0], true);
		obj[`${option}Set`] = setVal(displayUse.length > 1 ? displayUse[1] :
			boolToSwitch(obj[`${option}Use`]), ``, C_TYP_SWITCH);
		g_stateObj[`d_${option.toLowerCase()}`] = setVal(obj[`${option}Set`], C_FLG_ON, C_TYP_SWITCH);
		obj[`${option}ChainOFF`] = _dosObj[`${option}ChainOFF`]?.split(`,`) ?? [];

		// Displayのデフォルト設定で、双方向に設定されている場合は設定をブロック
		g_displays.filter((option2, k) =>
			j > k && (obj[`${option}ChainOFF`].includes(option2) && obj[`${option2}ChainOFF`].includes(option)))
			.forEach(() => {
				interlockingErrorFlg = true;
				makeWarningWindow(g_msgInfoObj.E_0051);
			});
		if (!interlockingErrorFlg && obj[`${option}ChainOFF`].includes(option)) {
			interlockingErrorFlg = true;
			makeWarningWindow(g_msgInfoObj.E_0051);
		}
	});

	if (!interlockingErrorFlg) {
		g_displays.forEach(option =>
			obj[`${option}ChainOFF`].forEach(defaultOption => {
				g_stateObj[`d_${defaultOption.toLowerCase()}`] = C_FLG_OFF;
				interlockingButton(obj, defaultOption, C_FLG_OFF, C_FLG_ON);
			}));
	}
	obj.arrowEffectUseOrg = obj.arrowEffectUse;
	obj.arrowEffectSetFlg = obj.arrowEffectSet === C_FLG_ON;

	// ローカルストレージに保存済みのColorType設定からDisplayのColor設定を反映
	if (g_localStorage.colorType !== undefined) {
		g_colorType = g_localStorage.colorType;
		if (obj.colorUse) {
			g_stateObj.d_color = boolToSwitch(g_keycons.colorDefTypes.findIndex(val => val === g_colorType) !== -1);
		}
	}

	// 別キーパターンの使用有無
	obj.transKeyUse = setBoolVal(_dosObj.transKeyUse, true);

	// タイトル画面用・背景/マスクデータの分解 (下記すべてで1セット、改行区切り)
	// [フレーム数,階層,背景パス,class(CSSで別定義),X,Y,width,height,opacity,animationName,animationDuration]
	g_animationData.forEach(sprite => {
		obj[`${sprite}TitleData`] = [];
		obj[`${sprite}TitleMaxDepth`] = -1;

		const dataList = [_dosObj[`${sprite}title${g_localeObj.val}_data`], _dosObj[`${sprite}title_data`]];
		const data = dataList.find((v) => v !== undefined);
		if (hasVal(data)) {
			[obj[`${sprite}TitleData`], obj[`${sprite}TitleMaxDepth`]] = g_animationFunc.make[sprite](data);
		}
	});

	// 結果画面用のマスク透過設定
	obj.masktitleButton = setBoolVal(_dosObj.masktitleButton);

	// 結果画面用のマスク透過設定
	obj.maskresultButton = setBoolVal(_dosObj.maskresultButton);

	// リザルトモーションをDisplay:BackgroundのON/OFFと連動させるかどうかの設定
	obj.resultMotionSet = setBoolVal(_dosObj.resultMotionSet, true);

	// 譜面明細の使用可否
	const tmpDetails = getHeader(_dosObj, `scoreDetailUse`, `chartDetailUse`)?.split(`,`).filter(val => hasVal(val) && val !== `false`)
		.map(val => replaceStr(val, g_settings.scoreDetailTrans));
	g_settings.scoreDetails = g_settings.scoreDetailDefs.filter(val => tmpDetails?.includes(val) || tmpDetails === undefined);

	g_stateObj.scoreDetail = g_settings.scoreDetails[0] || ``;
	g_settings.scoreDetailCursors = g_settings.scoreDetails.map(val => `lnk${val}G`);
	g_settings.scoreDetailCursors.push(`btnGraphB`);
	[`option`, `difSelector`].forEach(page => g_shortcutObj[page].KeyQ.id = g_settings.scoreDetailCursors[0]);

	// 判定位置をBackgroundのON/OFFと連動してリセットする設定
	obj.jdgPosReset = setBoolVal(_dosObj.jdgPosReset, true);

	// タイトル表示用コメント
	const newlineTag = setBoolVal(_dosObj.commentAutoBr, true) ? `<br>` : ``;
	const tmpComment = (_dosObj[`commentVal${g_localeObj.val}`] ?? _dosObj.commentVal ?? ``).split(`\r\n`).join(`\n`);
	obj.commentVal = tmpComment.split(`\n`).join(newlineTag);

	// クレジット表示
	if (document.getElementById(`webMusicTitle`) !== null) {
		webMusicTitle.innerHTML =
			`<span style="font-size:${wUnit(32)}">${obj.musicTitleForView.join(`<br>`)}</span><br>
			<span style="font-size:${wUnit(16)}">(Artist: <a href="${obj.artistUrl}" target="_blank">${obj.artistName}</a>)</span>`;
	}

	// コメントの外部化設定
	obj.commentExternal = setBoolVal(_dosObj.commentExternal);

	// Reverse時の歌詞の自動反転制御
	obj.wordAutoReverse = _dosObj.wordAutoReverse ?? g_presetObj.wordAutoReverse ?? `auto`;

	// プレイ中クレジットを表示しないエリアのサイズ(X方向)
	obj.customViewWidth = setVal(_dosObj.customViewWidth ?? _dosObj.customCreditWidth, 0, C_TYP_FLOAT);

	// ショートカットキーが既定値ではない場合の左右の拡張エリアのサイズ
	if (hasVal(_dosObj.scArea)) {
		const tmp = _dosObj.scArea.split(`,`);
		obj.scAreaWidth = setVal(tmp[0], 0, C_TYP_FLOAT);
		obj.playingLayout = tmp[1] !== `left`;
	} else {
		obj.scAreaWidth = g_presetObj.scAreaWidth ?? 0;
		obj.playingLayout = g_presetObj.playingLayout ?? true;
	}

	// ジャストフレームの設定 (ローカル: 0フレーム, リモートサーバ上: 1フレーム以内)
	obj.justFrames = (g_isLocal) ? 0 : 1;

	// リザルトデータのカスタマイズ
	obj.resultFormat = escapeHtmlForEnabledTag(_dosObj.resultFormat ?? g_presetObj.resultFormat ?? g_templateObj.resultFormatDf);

	// リザルト画像データのカスタム設定
	obj.resultValsView = _dosObj.resultValsView?.split(`,`) ?? g_presetObj.resultValsView ?? Array.from(Object.keys(g_presetObj.resultVals ?? {}));

	// フェードイン時にそれ以前のデータを蓄積しない種別(word, back, mask)を指定
	obj.unStockCategories = (_dosObj.unStockCategory ?? ``).split(`,`);
	if (g_presetObj.unStockCategories !== undefined) {
		obj.unStockCategories = makeDedupliArray(obj.unStockCategories, g_presetObj.unStockCategories);
	}
	g_fadeinStockList = g_fadeinStockList.filter(cg => obj.unStockCategories.indexOf(cg) === -1);

	// フェードイン時にそれ以前のデータを蓄積しないパターンを指定
	if (g_presetObj.stockForceDelList !== undefined) {
		Object.assign(g_stockForceDelList, g_presetObj.stockForceDelList);
	}
	g_fadeinStockList.filter(type => hasVal(_dosObj[`${type}StockForceDel`]))
		.forEach(type => g_stockForceDelList[type] = makeDedupliArray(g_stockForceDelList[type], _dosObj[`${type}StockForceDel`].split(`,`)));

	return obj;
};

/**
 * 譜面リスト作成有無の状態を取得
 * @param {boolean} _headerFlg 
 * @param {number[]} _viewLists 
 * @returns {boolean}
 */
const getDifSelectorUse = (_headerFlg, _viewLists = g_headerObj.viewLists) => setBoolVal(_headerFlg, _viewLists.length > 5);

/**
 * カラーセットの格納
 * @param {string} object._from コピー元矢印カラーセット（の譜面番号）
 * @param {string} object._to コピー先矢印のカラーセット（の譜面番号）
 * @param {object} object._fromObj コピー元オブジェクト
 * @param {object} object._toObj コピー先オブジェクト
 */
const resetColorType = ({ _from = ``, _to = ``, _fromObj = g_headerObj, _toObj = g_headerObj } = {}) => {
	_toObj[`setColor${_to}`] = structuredClone(_fromObj[`setColor${_from}`]);
	_toObj[`setShadowColor${_to}`] = structuredClone(_fromObj[`setShadowColor${_from}`]);
	_toObj[`frzColor${_to}`] = structuredClone(_fromObj[`frzColor${_from}`]);
	_toObj[`frzShadowColor${_to}`] = structuredClone(_fromObj[`frzShadowColor${_from}`]);
};

/**
 * 配列にデータを先頭に追加
 * @param {string[]|number[]} _arr 
 * @param {string} _target 
 * @returns {string[]|number[]}
 */
const addValtoArray = (_arr, _target) => {
	if (!_arr.includes(_target)) {
		_arr.unshift(_target);
	}
	return _arr;
};

/**
 * 曲名（1行）の取得
 * @param {string} _musicName 
 * @returns {string}
 */
const getMusicNameSimple = _musicName => replaceStr(_musicName, g_escapeStr.musicNameSimple);

/**
 * 曲名（複数行）の取得
 * @param {string} _musicName 
 * @returns {string[]}
 */
const getMusicNameMultiLine = _musicName => {
	const tmpName = replaceStr(_musicName, g_escapeStr.musicNameMultiLine).split(`<br>`);
	return tmpName.length === 1 ? [tmpName[0], ``] : tmpName;
};

/**
 * 画像セットの入れ替え処理
 * @param {object} _imgType
 * @param {string} _imgType.name
 * @param {string} _imgType.extension
 * @param {boolean} _initFlg  
 */
const updateImgType = (_imgType, _initFlg = false) => {
	if (_initFlg) {
		const baseDir = (_imgType.name === `` ? `` : `${_imgType.name}/`);
		C_IMG_TITLE_ARROW = `../img/${baseDir}arrow.${_imgType.extension}`;
	}
	resetImgs(_imgType.name, _imgType.extension);
	reloadImgObj();
	Object.keys(g_imgObj).forEach(key => g_imgObj[key] = `${g_rootPath}${g_imgObj[key]}`);
	if (_imgType.extension === undefined && g_presetObj.overrideExtension !== undefined) {
		Object.keys(g_imgObj).forEach(key => g_imgObj[key] = `${g_imgObj[key].slice(0, -3)}${g_presetObj.overrideExtension}`);
	}
	if (!g_isFile) {
		g_imgInitList.forEach(img => preloadFile(`image`, g_imgObj[img]));
	}
};

/**
 * ゲージ設定リストへの追加
 * @param {object} _obj
 */
const addGaugeFulls = _obj => _obj.map(key => g_gaugeOptionObj.customFulls[key] = false);

/**
 * 矢印・フリーズアロー色のデータ変換
 * @param {object} _baseObj 
 * @param {object} _dosObj
 * @param {string} [object.scoreId=''] 
 * @returns オブジェクト ※Object.assign(obj, resetBaseColorList(...))の形で呼び出しが必要
 */
const resetBaseColorList = (_baseObj, _dosObj, { scoreId = `` } = {}) => {

	const obj = {};
	const idHeader = setScoreIdHeader(scoreId);
	const getRefData = (_header, _dataName) => {
		const data = _dosObj[`${_header}${_dataName}`];
		return data?.startsWith(_header) ? _dosObj[data] : data;
	}

	[``, `Shadow`].forEach(pattern => {
		const _arrowCommon = `set${pattern}Color`;
		const _frzCommon = `frz${pattern}Color`;

		const _name = `${_arrowCommon}${idHeader}`;
		const _frzName = `${_frzCommon}${idHeader}`;
		const _arrowInit = `${_arrowCommon}Init`;
		const _frzInit = `${_frzCommon}Init`;

		const arrowColorTxt = getRefData(_arrowCommon, idHeader) || _dosObj[_arrowCommon];
		const frzColorTxt = getRefData(_frzCommon, idHeader) || _dosObj[_frzCommon];

		// 矢印色
		Object.keys(_baseObj.dfColorgrdSet).forEach(type => {
			[obj[`${_name}${type}`], obj[`${_name}Str${type}`], obj[`${_name}Org${type}`]] =
				setColorList(arrowColorTxt, _baseObj[_arrowInit], _baseObj[_arrowInit].length, {
					_defaultColorgrd: _baseObj.dfColorgrdSet[type],
					_colorCdPaddingUse: _baseObj.colorCdPaddingUse,
					_shadowFlg: pattern === `Shadow`,
				});

			obj[`${_frzName}${type}`] = [];
			obj[`${_frzName}Str${type}`] = [];
			obj[`${_frzName}Org${type}`] = [];
		});

		// フリーズアロー色
		const tmpFrzColors = (frzColorTxt !== undefined ? splitLF2(frzColorTxt) : []);
		const firstFrzColors = tmpFrzColors[0]?.split(`,`) ?? [];

		for (let j = 0; j < _baseObj.setColorInit.length; j++) {

			// デフォルト配列の作成（1番目の要素をベースに、フリーズアロー初期セット or 矢印色からデータを補完）
			const currentFrzColors = [];
			const baseLength = firstFrzColors.length === 0 || _baseObj.defaultFrzColorUse ?
				_baseObj[_frzInit].length : firstFrzColors.length;
			for (let k = 0; k < baseLength; k++) {
				currentFrzColors[k] = setVal(firstFrzColors[k],
					_baseObj.defaultFrzColorUse ? _baseObj[_frzInit][k] : obj[`${_name}Str`][j]);
			}

			Object.keys(_baseObj.dfColorgrdSet).forEach(type =>
				[obj[`${_frzName}${type}`][j], obj[`${_frzName}Str${type}`][j], obj[`${_frzName}Org${type}`][j]] =
				setColorList(tmpFrzColors[j], currentFrzColors, _baseObj[_frzInit].length, {
					_defaultColorgrd: _baseObj.dfColorgrdSet[type],
					_colorCdPaddingUse: _baseObj.colorCdPaddingUse,
					_defaultFrzColorUse: _baseObj.defaultFrzColorUse,
					_objType: `frz`,
					_shadowFlg: pattern === `Shadow`,
				}));
		}

		obj[`${_name}Default`] = obj[_name].concat();
		obj[`${_frzName}Default`] = obj[_frzName].concat();
	});

	return obj;
};

/**
 * 矢印・フリーズアロー色のデータ展開
 * @param {string} _data 
 * @param {string[]} _colorInit 
 * @param {number} _colorInitLength
 * @param {string[]} [object._defaultColorgrd=g_headerObj.defaultColorgrd]
 * @param {boolean} [object._colorCdPaddingUse=false]
 * @param {boolean} [object._defaultFrzColorUse=true]
 * @param {string} [object._objType='normal']
 * @param {boolean} [object._shadowFlg=false]
 * @returns {string[][]}
 */
const setColorList = (_data, _colorInit, _colorInitLength,
	{ _defaultColorgrd = g_headerObj.defaultColorgrd, _colorCdPaddingUse = false,
		_defaultFrzColorUse = true, _objType = `normal`, _shadowFlg = false } = {}) => {

	// グラデーション文字列 #ffff99:#9999ff@linear-gradient
	let colorStr = [];

	// カラーコード抽出用 #ffff99 - Ready文字、背景矢印のデフォルト色で使用
	let colorOrg = [];

	// グラデーション適用後文字列 linear-gradient(to right, #ffff99, #9999ff)
	let colorList = [];

	// 譜面側で指定されているデータを配列に変換
	if (hasVal(_data)) {
		colorList = _data.split(`,`);
		colorStr = colorList.concat();

		// データ補完処理
		const defaultLength = colorStr.length;
		if (_objType === `frz` && _defaultFrzColorUse) {
			// デフォルト配列に満たない・足りない部分はデフォルト配列で穴埋め
			for (let j = 0; j < _colorInitLength; j++) {
				if (!hasVal(colorStr[j])) {
					colorStr[j] = _colorInit[j];
				}
			}
		} else {
			// デフォルト配列長をループさせて格納
			for (let j = 0; j < _colorInitLength; j++) {
				colorStr[j] = colorStr[j % defaultLength];
			}
		}
		colorList = colorStr.concat();

		for (let j = 0; j < colorList.length; j++) {
			const tmpSetColorOrg = colorStr[j].replaceAll(`0x`, `#`).split(`:`);
			const hasColor = tmpSetColorOrg.some(tmpColorOrg => {
				if (hasVal(tmpColorOrg) && (isColorCd(tmpColorOrg) || !hasAnglePointInfo(tmpColorOrg) || tmpColorOrg === `Default`)) {
					colorOrg[j] = colorCdPadding(_colorCdPaddingUse, colorToHex(tmpColorOrg));
					return true;
				}
			});
			if (!hasColor) {
				colorOrg[j] = _colorInit[j];
			}
			colorList[j] = makeColorGradation(colorStr[j] === `` ? _colorInit[j] : colorStr[j], {
				_defaultColorgrd, _colorCdPaddingUse, _objType, _shadowFlg,
			});
		}

	} else {

		// 未定義の場合は指定されたデフォルト配列(_colorInit)で再定義
		colorStr = _colorInit.concat();
		colorOrg = _colorInit.concat();
		colorList = _colorInit.map(colorStr => makeColorGradation(colorStr, {
			_defaultColorgrd, _colorCdPaddingUse, _shadowFlg,
		}));
	}

	return [colorList, colorStr, colorOrg];
};

/**
 * 複合カスタムゲージの定義設定
 * |customGauge=Original::F,Normal::V,Escape::V|
 * @param {object} _dosObj 
 * @param {string} [object.scoreId=0]
 * @returns オブジェクト ※Object.assign(obj, resetCustomGauge(...))の形で呼び出しが必要
 */
const resetCustomGauge = (_dosObj, { scoreId = 0 } = {}) => {

	const obj = {};
	const scoreIdHeader = setScoreIdHeader(scoreId, g_stateObj.scoreLockFlg);
	const dosCustomGauge = _dosObj[`customGauge${scoreIdHeader}`];
	if (hasVal(dosCustomGauge)) {
		if (g_gaugeOptionObj.defaultPlusList.includes(dosCustomGauge)) {
			obj[`custom${scoreId}`] = g_gaugeOptionObj[dosCustomGauge].concat();
			obj[`varCustom${scoreId}`] = g_gaugeOptionObj[`var${toCapitalize(dosCustomGauge)}`].concat();
			if (g_gaugeOptionObj.defaultList.includes(dosCustomGauge)) {
				obj[`defaultGauge${scoreId}`] = dosCustomGauge;
				obj[`typeCustom${scoreId}`] = g_gaugeOptionObj[`type${toCapitalize(dosCustomGauge)}`].concat();
			}
		} else {
			const customGauges = dosCustomGauge.split(`,`);

			obj[`custom${scoreId}`] = [];
			obj[`varCustom${scoreId}`] = [];

			for (let j = 0; j < customGauges.length; j++) {
				const customGaugeSets = customGauges[j].split(`::`);
				obj[`custom${scoreId}`][j] = customGaugeSets[0];
				obj[`varCustom${scoreId}`][j] = boolToSwitch(customGaugeSets[1] === `V`);
			}
			if (scoreId === 0) {
				obj.custom = obj.custom0.concat();
				obj.varCustom = obj.varCustom0.concat();
			}
			addGaugeFulls(obj[`custom${scoreId}`]);
		}
	}
	return obj;
};

/**
 * ゲージ別個別設定の取得
 * @param {object} _dosObj 
 * @param {string} _name 
 * @param {number} _difLength
 * @param {string} [object.scoreId=0]
 */
const getGaugeSetting = (_dosObj, _name, _difLength, { scoreId = 0 } = {}) => {

	const obj = {
		lifeBorders: [],
		lifeRecoverys: [],
		lifeDamages: [],
		lifeInits: []
	};
	/** ゲージ設定再作成フラグ */
	let gaugeCreateFlg = false;

	/** ゲージ設定上書きフラグ */
	const gaugeUpdateFlg = g_stateObj.scoreLockFlg && scoreId > 0;

	/**
	 * ゲージ別個別配列への値格納
	 * この時点では各種ゲージ設定は文字列のまま。setGauge関数にて数式に変換される
	 * @param {number} _scoreId 
	 * @param {string[]} _gaugeDetails
	 * @returns {boolean}
	 */
	const setGaugeDetails = (_scoreId, _gaugeDetails) => {

		obj.lifeBorders[_scoreId] = _gaugeDetails[0] === `x` ? `x` : _gaugeDetails[0];
		obj.lifeRecoverys[_scoreId] = _gaugeDetails[1];
		obj.lifeDamages[_scoreId] = _gaugeDetails[2];
		obj.lifeInits[_scoreId] = _gaugeDetails[3];

		if (gaugeUpdateFlg && hasVal(g_gaugeOptionObj[`gauge${_name}s`])) {
			Object.keys(obj).forEach(key => Object.assign(g_gaugeOptionObj[`gauge${_name}s`][key] || [], obj[key]));
			return false;
		}
		return true;
	};

	/**
	 * gaugeNormal2, gaugeEasy2などの個別設定があった場合にその値から配列を作成
	 * @param {number} _scoreId 
	 * @param {number[]} _defaultGaugeList
	 * @returns {number[]}
	 */
	const getGaugeDetailList = (_scoreId, _defaultGaugeList) => {
		if (_scoreId > 0) {
			const headerName = `gauge${_name}${setScoreIdHeader(_scoreId, g_stateObj.scoreLockFlg)}`;
			if (hasVal(_dosObj[headerName])) {
				return _dosObj[headerName].split(`,`);
			}
		}
		return _defaultGaugeList;
	};

	if (hasVal(_dosObj[`gauge${_name}`])) {

		if (gaugeUpdateFlg) {
			gaugeCreateFlg = setGaugeDetails(scoreId, _dosObj[`gauge${_name}`].split(`,`));
		} else {
			const gauges = splitLF2(_dosObj[`gauge${_name}`]);
			for (let j = 0; j < _difLength; j++) {
				gaugeCreateFlg = setGaugeDetails(j, getGaugeDetailList(j, (gauges[j] ?? gauges[0]).split(`,`)));
			}
		}

	} else if (g_presetObj.gaugeCustom?.[_name] !== undefined) {

		const gaugeDetails = [
			g_presetObj.gaugeCustom[_name].Border, g_presetObj.gaugeCustom[_name].Recovery,
			g_presetObj.gaugeCustom[_name].Damage, g_presetObj.gaugeCustom[_name].Init,
		];
		if (gaugeUpdateFlg) {
			gaugeCreateFlg = setGaugeDetails(scoreId, gaugeDetails);
		} else {
			for (let j = 0; j < _difLength; j++) {
				gaugeCreateFlg = setGaugeDetails(j, getGaugeDetailList(j, gaugeDetails));
			}
		}
	}
	if (gaugeCreateFlg) {
		g_gaugeOptionObj[`gauge${_name}s`] = obj;
	}
};

/**
 * キー名の取得
 * @param {string} _key
 * @returns {string} キー名
 */
const getKeyName = _key => unEscapeHtml(escapeHtml(g_keyObj[`keyName${_key}`]?.[0] ?? _key));

/**
 * キー単位名の取得
 * @param {string} _key 
 * @returns {string} キー単位名(デフォルト: key)
 */
const getKeyUnitName = _key => unEscapeHtml(escapeHtml(g_keyObj[`keyName${_key}`]?.[1] ?? `key`));

/**
 * KeyBoardEvent.code の値をCW Edition用のキーコードに変換
 * 簡略指定ができるように、以下の記述を許容
 * 例) KeyD -> D, ArrowDown -> Down, AltLeft -> Alt
 * @param {string} _kCdN
 * @returns {number}
 */
const getKeyCtrlVal = _kCdN => {
	const convVal = Object.keys(g_kCdN).findIndex(val =>
		[_kCdN, `Key${_kCdN}`, `Arrow${_kCdN}`].includes(g_kCdN[val]) || _kCdN === replaceStr(g_kCdN[val], g_escapeStr.keyCtrlName));
	return convVal !== -1 ? convVal : parseInt(_kCdN, 10);
};

/**
 * 一時的な追加キーの設定
 * @param {object} _dosObj 
 * @param {string[]} object.keyExtraList
 * @returns {string[]}
 */
const keysConvert = (_dosObj, { keyExtraList = _dosObj.keyExtraList?.split(`,`) } = {}) => {

	if (keyExtraList === undefined) {
		keyExtraList = [];
		Object.keys(_dosObj).filter(val => val.startsWith(g_keyObj.defaultProp))
			.forEach(keyName => keyExtraList.push(keyName.slice(g_keyObj.defaultProp.length)));

		if (keyExtraList.length === 0) {
			return [];
		}
	}

	const existParam = (_data, _paramName) => !hasVal(_data) && g_keyObj[_paramName] !== undefined;
	const toString = _str => _str;
	const toFloat = _num => isNaN(parseFloat(_num)) ? _num : parseFloat(_num);
	const toKeyCtrlArray = _str =>
		makeBaseArray(_str.split(`/`).map(n => getKeyCtrlVal(n)), g_keyObj.minKeyCtrlNum, 0);
	const toSplitArrayStr = _str => _str.split(`/`).map(n => n);

	// 略記記法を元の文字列に復元後、配列に変換 (1...3,5...7 -> 1,2,3,5,6,7)
	const toOriginalArray = (_val, _func) => _val?.split(`,`).map(n => _func(n)).join(`,`).split(`,`);

	/**
	 * 略記記法を元の文字列に変換 (1...5 -> 1,2,3,4,5 / 3...+4 -> 3,4,5,6,7)
	 * @param {string} _str 
	 * @returns {string}
	 */
	const toFloatStr = _str => {
		const nums = _str?.split(`...`);
		const bottomMark = nums[0].startsWith(`b`) ? `b` : ``;
		const [startN, endN] = [parseFloat(bottomMark === `b` ? nums[0].slice(1) : nums[0]), parseFloat(nums[1])];

		if (nums.length === 2 && !isNaN(startN) && !isNaN(endN)) {
			const endN2 = nums[1].startsWith(`+`) ? startN + endN : endN;
			const arr = [];
			for (let k = startN; k <= endN2; k++) {
				arr.push(`${bottomMark}${k}`);
			}
			return arr.join(`,`);
		} else {
			return _str;
		}
	};

	/**
	 * 略記記法を元の文字列に変換 (1@:5 -> 1,1,1,1,1 / onigiri!giko!c@:2 -> onigiri,giko,c,onigiri,giko,c)
	 * @param {string} _str
	 * @returns {string}
	 */
	const toSameValStr = _str => {
		const nums = _str?.split(`@:`);
		const groupStr = toFloatStr(nums[0]).split(`!`).join(`,`);
		return nums.length === 2 && !isNaN(parseInt(nums[1])) ?
			fillArray(Math.floor(parseInt(nums[1])), groupStr).join(`,`) : groupStr;
	};

	/**
	 * キーパターン（相対パターン）をキーパターン（実際のパターン番号）に変換
	 * 例) 12_(0) -> 12_4
	 * それ以外の文字列が来た場合は、そのままの値を戻す
	 * @param {string} _str
	 * @returns {string}
	 */
	const getKeyPtnName = _str => {
		const regex = /\((\d+)\)/;
		const checkStr = _str.match(regex);
		if (checkStr !== null) {
			return _str.replace(regex, (match, p) => `${parseInt(p, 10) + setIntVal(g_keyObj.dfPtnNum)}`);
		}
		return _str;
	};

	/**
	 * divMaxX, posXの下段補完処理
	 * ・divXの1番目の指定があるとき、その値を元に下段の位置を補完
	 * 例) |div11x=7,b6|pos11x=0,1,2,3,4,5,6,b0,b1,b5,b6|
	 *  -> |div11x=7,13|pos11x=0,1,2,3,4,5,6,7,8,12,13|
	 * @param {number} _num 
	 * @param {number} _divNum 
	 * @returns {number}
	 */
	const getKeyPosNum = (_num, _divNum = 0) => {
		if (!hasVal(_num) || (!_num.startsWith(`b`) && isNaN(parseFloat(_num)))) {
			return _num;
		}
		return _num.startsWith(`b`) ? parseFloat(_num.slice(1)) + _divNum : parseFloat(_num);
	}

	/**
	 * キーパターンの略名から実際のデータへ展開
	 * @param {string} _str 
	 * @param {string} _name 
	 * @param {function} _convFunc
	 * @returns {string[]|number[]}
	 */
	const expandKeyPtn = (_str, _name, _convFunc) => {
		const pos = _str.indexOf(`>`);
		const expandData = _ptnstr => structuredClone(g_keyObj[`${_name}${getKeyPtnName(_ptnstr)}`]) ?? [_convFunc(_ptnstr)];

		if (pos > 0 && _name === `chara`) {
			const [header, ptn] = [_str.substring(0, pos), _str.substring(pos + 1)];
			return expandData(ptn)?.map(n => `${header}${n}`);
		} else {
			return expandData(_str);
		}
	};

	/**
	 * 新キー用複合パラメータ
	 * @param {string} _key キー数
	 * @param {string} _name 名前
	 * @param {function} _convFunc マッピング関数
	 * @param {string} object.errCd エラーコード
	 * @param {boolean} object.baseCopyFlg コピー配列の準備可否
	 * @param {function} object.loopFunc パターン別に処理する個別関数
	 * @returns {number} 最小パターン数
	 */
	const newKeyMultiParam = (_key, _name, _convFunc, { errCd = ``, baseCopyFlg = false, loopFunc = () => true } = {}) => {
		let tmpMinPatterns = 1;
		const keyheader = _name + _key;
		const dfPtn = setIntVal(g_keyObj.dfPtnNum);

		if (hasVal(_dosObj[keyheader])) {
			const tmpArray = splitLF2(_dosObj[keyheader]);
			tmpMinPatterns = tmpArray.length;
			for (let k = 0; k < tmpMinPatterns; k++) {
				if (existParam(tmpArray[k], `${keyheader}_${k + dfPtn}`)) {
					continue;
				}
				// |keyCtrl9j=Tab,7_0,Enter| -> |keyCtrl9j=Tab,S,D,F,Space,J,K,L,Enter| のように補完
				// |pos9j=0..4,6..9| -> |pos9j=0,1,2,3,4,6,7,8,9|
				g_keyObj[`${keyheader}_${k + dfPtn}`] =
					toOriginalArray(tmpArray[k], toSameValStr).map(n => expandKeyPtn(n, _name, _convFunc)).flat();
				if (baseCopyFlg) {
					g_keyObj[`${keyheader}_${k + dfPtn}d`] = structuredClone(g_keyObj[`${keyheader}_${k + dfPtn}`]);
				}
				loopFunc(k, keyheader);
			}

		} else if (errCd !== `` && g_keyObj[`${keyheader}_0`] === undefined) {
			makeWarningWindow(g_msgInfoObj[errCd].split(`{0}`).join(_key));
		}
		return tmpMinPatterns;
	};

	/**
	 * 新キー用複合パラメータ（特殊）
	 * @param {string} _key キー数
	 * @param {string} _name 名前
	 */
	const newKeyTripleParam = (_key, _name) => {
		const keyheader = _name + _key;
		const dfPtn = setIntVal(g_keyObj.dfPtnNum);

		if (hasVal(_dosObj[keyheader])) {
			splitLF2(_dosObj[keyheader])?.forEach((tmpParam, k) => {
				if (existParam(tmpParam, `${keyheader}_${k + dfPtn}`)) {
					return;
				}

				let ptnCnt = 0;
				tmpParam.split(`/`).forEach(list => {

					const keyPtn = getKeyPtnName(list);
					if (list === ``) {
						// 空指定の場合は一律同じグループへ割り当て
						g_keyObj[`${keyheader}_${k + dfPtn}_${ptnCnt}`] = fillArray(g_keyObj[`${g_keyObj.defaultProp}${_key}_${k + dfPtn}`].length);

					} else if (g_keyObj[`${_name}${keyPtn}_0`] !== undefined) {
						// 他のキーパターン (例: |shuffle8i=8_0| ) を直接指定した場合、該当があれば既存パターンからコピー
						// 既存パターンが複数ある場合、全てコピーする
						let m = 0;
						while (g_keyObj[`${_name}${keyPtn}_${m}`] !== undefined) {
							g_keyObj[`${keyheader}_${k + dfPtn}_${ptnCnt}`] = structuredClone(g_keyObj[`${_name}${keyPtn}_${m}`]);
							m++;
							ptnCnt++;
						}
					} else {
						// 通常の指定方法 (例: |shuffle8i=1,1,1,2,0,0,0,0/1,1,1,1,0,0,0,0| )の場合の取り込み
						// 部分的にキーパターン指定があった場合は既存パターンを展開 (例: |shuffle9j=2,7_0_0,2|)
						g_keyObj[`${keyheader}_${k + dfPtn}_${ptnCnt}`] =
							makeBaseArray(toOriginalArray(list, toSameValStr).map(n =>
								expandKeyPtn(n, _name, _str => isNaN(parseInt(_str)) ? _str : parseInt(_str, 10))
							).flat(), g_keyObj[`${g_keyObj.defaultProp}${_key}_${k + dfPtn}`].length, 0);
						ptnCnt++;
					}
				});
				g_keyObj[`${keyheader}_${k + dfPtn}`] = structuredClone(g_keyObj[`${keyheader}_${k + dfPtn}_0`]);
			});

		} else if (g_keyObj[`${keyheader}_${dfPtn}_0`] === undefined) {
			// 特に指定が無い場合はkeyCtrlX_Yの配列長で決定
			for (let k = 0; k < g_keyObj.minPatterns; k++) {
				const ptnName = `${_key}_${k + dfPtn}`;
				g_keyObj[`${_name}${ptnName}_0`] = fillArray(g_keyObj[`${g_keyObj.defaultProp}${ptnName}`].length);
				g_keyObj[`${_name}${ptnName}`] = structuredClone(g_keyObj[`${_name}${ptnName}_0`]);
			}
		}
	};

	/**
	 * 新キー用単一パラメータ
	 * @param {string} _key キー数
	 * @param {string} _name 名前
	 * @param {string} _type float, number, string, boolean
	 * @param {string} _defaultVal
	 */
	const newKeySingleParam = (_key, _name, _type, _defaultVal) => {
		const keyheader = _name + _key;
		const dfPtn = setIntVal(g_keyObj.dfPtnNum);
		if (_dosObj[keyheader] !== undefined) {
			const tmps = _dosObj[keyheader].split(`$`);
			for (let k = 0; k < tmps.length; k++) {
				g_keyObj[`${keyheader}_${k + dfPtn}`] = setVal(g_keyObj[`${_name}${getKeyPtnName(tmps[k])}`],
					tmps[k].indexOf(`_`) !== -1 ? _defaultVal : setVal(tmps[k], ``, _type));
			}
			for (let k = tmps.length; k < g_keyObj.minPatterns; k++) {
				g_keyObj[`${keyheader}_${k + dfPtn}`] = g_keyObj[`${keyheader}_0`];
			}
		}
	};

	/**
	 * 新キー用複合パラメータ（パターン設定用）
	 * @param {string} _key キー数
	 * @param {string} _name 名前
	 * @param {string} _pairName 詳細設定する変数名
	 * @param {string} _defaultName パラメータの初期値
	 * @param {number} _defaultVal パラメータの初期値の場合の一律設定値（colorX_Yの配列幅に対して設定値で埋める）
	 */
	const newKeyPairParam = (_key, _name, _pairName, _defaultName = ``, _defaultVal = 0) => {
		const keyheader = _name + _key;
		const dfPtn = setIntVal(g_keyObj.dfPtnNum);

		splitLF2(_dosObj[keyheader])?.forEach((tmpParam, k) => {
			const pairName = `${_pairName}${_key}_${k + dfPtn}`;
			if (!hasVal(tmpParam)) {
				return;
			}
			g_keyObj[pairName] = {};

			// デフォルト項目がある場合は先に定義
			if (_defaultName !== ``) {
				g_keyObj[pairName][_defaultName] = fillArray(g_keyObj[`${g_keyObj.defaultProp}${_key}_${k + dfPtn}`].length, _defaultVal);
			}
			tmpParam.split(`/`).forEach(pairs => {
				const keyPtn = getKeyPtnName(pairs);
				if (pairs === ``) {
				} else if (g_keyObj[`${_pairName}${keyPtn}`] !== undefined) {
					// 他のキーパターン指定時、該当があればプロパティを全コピー
					Object.assign(g_keyObj[pairName], g_keyObj[`${_pairName}${keyPtn}`]);
				} else {
					// 通常の指定方法（例：|scroll8i=Cross::1,1,1,-,-,-,1,1/Split::1,1,1,1,-,-,-,-|）から取り込み
					// 部分的にキーパターン指定があった場合は既存パターンを展開 (例: |scroll9j=Cross::1,7_0,1|)
					const tmpParamPair = pairs.split(`::`);
					g_keyObj[pairName][tmpParamPair[0]] =
						makeBaseArray(toOriginalArray(tmpParamPair[1], toSameValStr)?.map(n =>
							structuredClone(g_keyObj[`${_pairName}${getKeyPtnName(n)}`]?.[tmpParamPair[0]]) ??
							[n === `-` ? -1 : parseInt(n, 10)]
						).flat(), g_keyObj[`${g_keyObj.defaultProp}${_key}_${k + dfPtn}`].length, _defaultVal);
				}
			});
		});
	};

	// 対象キー毎に処理
	keyExtraList.forEach(newKey => {
		g_keyObj.minPatterns = 1;
		g_keyObj.dfPtnNum = 0;

		// キーパターンの追記 (appendX)
		if (setBoolVal(_dosObj[`append${newKey}`])) {
			for (let j = 0; ; j++) {
				if (g_keyObj[`${g_keyObj.defaultProp}${newKey}_${j}`] === undefined) {
					break;
				}
				g_keyObj.dfPtnNum++;
			}
		}
		const dfPtnNum = g_keyObj.dfPtnNum;

		// キーの名前 (keyNameX)
		g_keyObj[`keyName${newKey}`] = _dosObj[`keyName${newKey}`]?.split(`,`) ?? [newKey, `key`];

		// キーの最小横幅 (minWidthX)
		g_keyObj[`minWidth${newKey}`] = _dosObj[`minWidth${newKey}`] ?? g_keyObj[`minWidth${newKey}`] ?? g_keyObj.minWidthDefault;

		// キーコンフィグ (keyCtrlX_Y)
		g_keyObj.minPatterns = newKeyMultiParam(newKey, `keyCtrl`, toKeyCtrlArray, {
			errCd: `E_0104`, baseCopyFlg: true,
		});

		// 読込変数の接頭辞 (charaX_Y)
		newKeyMultiParam(newKey, `chara`, toString);

		// 矢印色パターン (colorX_Y)
		newKeyTripleParam(newKey, `color`);

		// 矢印の回転量指定、キャラクタパターン (stepRtnX_Y)
		newKeyTripleParam(newKey, `stepRtn`);

		// 各キーの区切り位置 (divX_Y)
		_dosObj[`div${newKey}`]?.split(`$`).forEach((tmpDiv, k) => {
			const tmpDivPtn = tmpDiv.split(`,`);
			const ptnName = `${newKey}_${k + dfPtnNum}`;

			if (g_keyObj[`div${tmpDivPtn[0]}`] !== undefined) {
				// 既定キーパターンが指定された場合、存在すればその値を適用
				g_keyObj[`div${ptnName}`] = g_keyObj[`div${tmpDivPtn[0]}`];
				g_keyObj[`divMax${ptnName}`] = setVal(g_keyObj[`divMax${tmpDivPtn[0]}`], undefined, C_TYP_FLOAT);
			} else if (!hasVal(tmpDivPtn[0]) && setIntVal(g_keyObj[`div${ptnName}`], -1) !== -1) {
				// カスタムキー側のdivXが未定義だが、すでに初期設定で定義済みの場合はスキップ
				return;
			} else {
				// それ以外の場合は指定された値を適用（未指定時はその後で指定）
				g_keyObj[`div${ptnName}`] = setVal(tmpDivPtn[0], undefined, C_TYP_NUMBER);
				g_keyObj[`divMax${ptnName}`] = setVal(getKeyPosNum(tmpDivPtn[1], g_keyObj[`div${ptnName}`]), undefined, C_TYP_FLOAT);
			}
		});

		// ステップゾーン位置 (posX_Y)
		newKeyMultiParam(newKey, `pos`, toFloat, {
			loopFunc: (k, keyheader) => {
				g_keyObj[`${keyheader}_${k + dfPtnNum}`].forEach((val, j) =>
					g_keyObj[`${keyheader}_${k + dfPtnNum}`][j] = getKeyPosNum(String(val), g_keyObj[`div${newKey}_${k + dfPtnNum}`]));
			},
		});

		// charaX_Y, posX_Y, keyGroupX_Y, divX_Y, divMaxX_Yが未指定の場合はkeyCtrlX_Yを元に適用
		for (let k = 0; k < g_keyObj.minPatterns; k++) {
			setKeyDfVal(`${newKey}_${k + dfPtnNum}`);
		}

		// ステップゾーン間隔 (blankX_Y)
		newKeySingleParam(newKey, `blank`, C_TYP_FLOAT, g_keyObj.blank_def);

		// 矢印群の倍率 (scaleX_Y)
		newKeySingleParam(newKey, `scale`, C_TYP_FLOAT, g_keyObj.scale_def);

		// プレイ中ショートカット：リトライ (keyRetryX_Y)
		newKeySingleParam(newKey, `keyRetry`, C_TYP_STRING, C_KEY_RETRY);

		// プレイ中ショートカット：タイトルバック (keyTitleBackX_Y)
		newKeySingleParam(newKey, `keyTitleBack`, C_TYP_STRING, C_KEY_TITLEBACK);

		// 別キーフラグ (transKeyX_Y)
		newKeySingleParam(newKey, `transKey`, C_TYP_STRING, ``);

		// フラットモード (flatModeX_Y)
		newKeySingleParam(newKey, `flatMode`, C_TYP_BOOLEAN, false);

		// シャッフルグループ (shuffleX_Y)
		newKeyTripleParam(newKey, `shuffle`);

		// キーグループ (keyGroupX_Y)
		newKeyMultiParam(newKey, `keyGroup`, toSplitArrayStr);

		// キーグループの表示制御 (keyGroupOrderX_Y)
		newKeyMultiParam(newKey, `keyGroupOrder`, toString);

		// スクロールパターン (scrollX_Y)
		// |scroll(newKey)=Cross::1,1,-1,-1,-1,1,1/Split::1,1,1,-1,-1,-1,-1$...|
		newKeyPairParam(newKey, `scroll`, `scrollDir`, `---`, 1);

		// アシストパターン (assistX_Y)
		// |assist(newKey)=Onigiri::0,0,0,0,0,1/AA::0,0,0,1,1,1$...|
		newKeyPairParam(newKey, `assist`, `assistPos`);

		// keyRetry, keyTitleBackのキー名をキーコードに変換
		const keyTypePatterns = Object.keys(g_keyObj).filter(val => val.startsWith(`keyRetry${newKey}`) || val.startsWith(`keyTitleBack${newKey}`));
		keyTypePatterns.forEach(name => g_keyObj[name] = getKeyCtrlVal(g_keyObj[name]));
	});

	return keyExtraList;
};

/**
 * キーパターンのデフォルト値設定
 * @param {string} _ptnName 
 */
const setKeyDfVal = _ptnName => {
	const baseLength = g_keyObj[`${g_keyObj.defaultProp}${_ptnName}`].length;
	g_keyObj[`chara${_ptnName}`] = padArray(g_keyObj[`chara${_ptnName}`], [...Array(baseLength).keys()].map(i => `${i + 1}a`));
	g_keyObj[`pos${_ptnName}`] = padArray(g_keyObj[`pos${_ptnName}`], [...Array(baseLength).keys()].map(i => i));
	g_keyObj[`keyGroup${_ptnName}`] = padArray(g_keyObj[`keyGroup${_ptnName}`], fillArray(baseLength, [`0`]));

	if (g_keyObj[`div${_ptnName}`] === undefined) {
		g_keyObj[`div${_ptnName}`] = Math.max(...g_keyObj[`pos${_ptnName}`]) + 1;
	}
	if (g_keyObj[`divMax${_ptnName}`] === undefined) {
		g_keyObj[`divMax${_ptnName}`] = Math.max(...g_keyObj[`pos${_ptnName}`]) + 1;
	}
};

/*-----------------------------------------------------------*/
/* Scene : TITLE [melon] */
/*-----------------------------------------------------------*/

/**
 *  タイトル画面初期化
 */
const titleInit = () => {

	clearWindow(true);
	g_currentPage = `title`;

	// タイトル用フレーム初期化
	g_scoreObj.titleFrameNum = 0;

	// 設定画面位置初期化
	g_settings.settingWindowNum = 0;

	// タイトルアニメーション用フレーム初期化、ループカウンター設定
	g_animationData.forEach(sprite => {
		g_scoreObj[`${sprite}TitleFrameNum`] = 0;
		g_scoreObj[`${sprite}TitleLoopCount`] = 0;
	});

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;

	// 譜面初期情報ロード許可フラグ
	// (初回読み込み時はローカルストレージのロードが必要なため、
	//  ローカルストレージ保存時はフラグを解除しない)
	if (!g_stateObj.dataSaveFlg || hasVal(g_keyObj[`transKey${keyCtrlPtn}`])) {
		g_canLoadDifInfoFlg = false;
	}
	const divRoot = document.getElementById(`divRoot`);

	// 曲時間制御変数
	let thisTime;
	let buffTime;
	let titleStartTime = performance.now();

	// 背景の矢印オブジェクトを表示
	if (!g_headerObj.customTitleArrowUse) {
		divRoot.appendChild(
			createColorObject2(`lblArrow`, {
				x: (g_sWidth - 500) / 2, y: -15 + (g_sHeight - 500) / 2,
				w: 500, h: 500, rotateEnabled: true,
				background: makeColorGradation(g_headerObj.titlearrowgrds[0] || g_headerObj.setColorOrg[0], {
					_defaultColorgrd: [false, `#eeeeee`],
					_objType: `titleArrow`,
				}), rotate: `titleArrow:${g_headerObj.titleArrowRotate}`,
			})
		);
	}

	// 背景スプライトを作成
	createMultipleSprite(`backTitleSprite`, g_headerObj.backTitleMaxDepth);

	// タイトル文字描画
	divRoot.appendChild(
		getTitleDivLabel(`lblTitle`,
			`<div class="settings_Title">${g_lblNameObj.dancing}</div>
		<div class="settings_TitleStar">${g_lblNameObj.star}</div>
		<div class="settings_Title2">${g_lblNameObj.onigiri}</div>`
				.replace(/[\t\n]/g, ``), 0, 15, g_cssObj.flex_centering)
	);

	// 曲名文字描画（曲名は譜面データから取得）
	if (!g_headerObj.customTitleUse) {

		// グラデーションの指定がない場合、
		// 矢印色の1番目と3番目を使ってタイトルをグラデーション
		const titlegrd1 = g_headerObj.titlegrds[0] || `${g_headerObj.setColorOrg[0]}:${g_headerObj.setColorOrg[2]}`;
		const titlegrd2 = g_headerObj.titlegrds[1] || titlegrd1;

		const titlegrds = [];
		[titlegrd1, titlegrd2].forEach((titlegrd, j) =>
			titlegrds[j] = makeColorGradation(titlegrd, { _defaultColorgrd: false, _objType: `titleMusic` }));

		let titlefontsize = 64;
		for (let j = 0; j < g_headerObj.musicTitleForView.length; j++) {
			if (g_headerObj.musicTitleForView[j] !== ``) {
				titlefontsize = getFontSize(g_headerObj.musicTitleForView[j], g_sWidth - 100, g_headerObj.titlefonts[j], titlefontsize);
			}
		}

		// 変数 titlesize の定義 (使用例： |titlesize=40$20|)
		const titlefontsizes = (g_headerObj.titlesize?.split(`$`).join(`,`).split(`,`) || [titlefontsize, titlefontsize]);
		const titlefontsize1 = setIntVal(titlefontsizes[0], titlefontsize);
		const titlefontsize2 = setIntVal(titlefontsizes[1], titlefontsize1);

		// 変数 titlelineheight の定義 (使用例： |titlelineheight=50|)
		const titlelineheight = (g_headerObj.titlelineheight !== `` ? g_headerObj.titlelineheight - (titlefontsize2 + 10) : 0);

		const txtAnimations = [``, ``];
		if (!g_headerObj.customTitleAnimationUse) {
			for (let j = 0; j < txtAnimations.length; j++) {
				txtAnimations[j] = `animation-name:${g_headerObj.titleAnimationName[j]};
				animation-duration:${g_headerObj.titleAnimationDuration[j]}s;
				animation-delay:${g_headerObj.titleAnimationDelay[j]}s;
				animation-timing-function:${g_headerObj.titleAnimationTimingFunction[j]};`;
			}
		}
		const lblmusicTitle = createDivCss2Label(`lblmusicTitle`,
			`<div id="lblmusicTitle1" style="
				font-family:${g_headerObj.titlefonts[0]};
				background: ${titlegrds[0]};
				background-clip: text;
				-webkit-background-clip: text;
				color: rgba(255,255,255,0.0);
				${txtAnimations[0]}
			" class="${g_headerObj.titleAnimationClass[0]}">
				${g_headerObj.musicTitleForView[0]}
			</div>
			<div id="lblmusicTitle2" style="
				font-size:${wUnit(titlefontsize2)};
				position:relative;left:${wUnit(g_headerObj.titlepos[1][0])};
				top:${wUnit(g_headerObj.titlepos[1][1] + titlelineheight)};
				font-family:${g_headerObj.titlefonts[1]};
				background: ${titlegrds[1]};
				background-clip: text;
				-webkit-background-clip: text;
				color: rgba(255,255,255,0.0);
				${txtAnimations[1]}
			" class="${g_headerObj.titleAnimationClass[1]}">
				${g_headerObj.musicTitleForView[1] ?? ``}
			</div>
			`,
			{
				x: Number(g_headerObj.titlepos[0][0]), y: Number(g_headerObj.titlepos[0][1]),
				w: g_sWidth, h: g_sHeight - 40, siz: titlefontsize1,
				display: `flex`, flexDirection: `column`, justifyContent: `center`, alignItems: `center`,
			}
		);
		divRoot.appendChild(lblmusicTitle);
	}

	if (g_errMsgObj.title !== ``) {
		makeWarningWindow();
	}

	// ユーザカスタムイベント(初期)
	g_customJsObj.title.forEach(func => func());

	// バージョン情報取得
	let customVersion = ``;
	if (g_localVersion !== ``) {
		customVersion = ` / ${g_localVersion}`;
	}
	if (g_localVersion2 !== ``) {
		customVersion += ` / ${g_localVersion2}`;
	}
	const releaseDate = (g_headerObj.releaseDate !== `` ? ` @${g_headerObj.releaseDate}` : ``);
	const versionName = `&copy; 2018-${g_revisedDate.slice(0, 4)} ティックル, CW ${g_version}${customVersion}${releaseDate}`;

	let reloadFlg = false;
	const getLinkSiz = _name => getFontSize(_name, g_sWidth / 2 - 20, getBasicFont(), g_limitObj.lnkSiz, 12);

	/**
	 * クレジット用リンク作成
	 * @param {string} _id 
	 * @param {string} _text 
	 * @param {string} _url 
	 * @returns {HTMLDivElement}
	 */
	const createCreditBtn = (_id, _text, _url) =>
		createCss2Button(_id, _text, () => true,
			Object.assign(g_lblPosObj[_id], { siz: getLinkSiz(_text), whiteSpace: `normal`, resetFunc: () => openLink(_url) }), g_cssObj.button_Default);

	// ボタン描画
	multiAppend(divRoot,

		// Click Here
		createCss2Button(`btnStart`, g_lblNameObj.clickHere, () => clearTimeout(g_timeoutEvtTitleId), {
			x: g_btnX(), w: g_btnWidth(), siz: g_limitObj.titleSiz, resetFunc: () => optionInit(),
		}, g_cssObj.button_Start),

		// Reset
		createCss2Button(`btnReset`, g_lblNameObj.dataReset, () => {
			reloadFlg = false;
			if (window.confirm(g_msgObj.dataResetConfirm)) {
				g_localStorage = {
					adjustment: 0,
					volume: 100,
					highscores: {},
				};
				localStorage.setItem(g_localStorageUrl, JSON.stringify(g_localStorage));
				reloadFlg = true;
			}
		}, Object.assign(g_lblPosObj.btnReset, {
			resetFunc: () => {
				if (reloadFlg) {
					location.reload();
				}
			},
		}), g_cssObj.button_Reset),

		// ロケール切替
		createCss2Button(`btnReload`, g_localeObj.val, () => true,
			Object.assign(g_lblPosObj.btnReload, {
				resetFunc: () => {
					g_localeObj.num = (++g_localeObj.num) % g_localeObj.list.length;
					g_langStorage.locale = g_localeObj.list[g_localeObj.num];
					localStorage.setItem(`danoni-locale`, JSON.stringify(g_langStorage));
					location.reload();
				},
			}), g_cssObj.button_Start),

		// ヘルプ
		createCss2Button(`btnHelp`, `?`, () => true,
			Object.assign(g_lblPosObj.btnHelp, {
				resetFunc: () => openLink(g_lblNameObj.helpUrl),
			}), g_cssObj.button_Setting),

		// 製作者表示
		createCreditBtn(`lnkMaker`, `${g_lblNameObj.maker}: ${g_headerObj.tuningInit}`, g_headerObj.creatorUrl),

		// アーティスト表示
		createCreditBtn(`lnkArtist`, `${g_lblNameObj.artist}: ${g_headerObj.artistName}`, g_headerObj.artistUrl),

		// バージョン描画
		createCss2Button(`lnkVersion`, versionName, () => true,
			Object.assign(g_lblPosObj.lnkVersion, {
				siz: getFontSize(versionName, g_sWidth * 3 / 4 - 20, getBasicFont(), 12),
				resetFunc: () => openLink(`https://github.com/cwtickle/danoniplus`),
			}), g_cssObj.button_Tweet),

		// セキュリティリンク
		createCss2Button(`lnkComparison`, `&#x1f6e1;`, () => true,
			Object.assign(g_lblPosObj.lnkComparison, {
				resetFunc: () => openLink(g_lblNameObj.securityUrl),
			}), g_cssObj.button_Tweet),
	);

	// コメントエリア作成
	if (g_headerObj.commentVal !== ``) {

		// コメント文の加工
		const convCommentVal = convertStrToVal(g_headerObj.commentVal);
		if (g_headerObj.commentExternal) {
			if (document.getElementById(`commentArea`) !== null) {
				commentArea.innerHTML = convCommentVal;
			}
		} else {
			multiAppend(divRoot,
				createDivCss2Label(`lblComment`, convCommentVal, g_lblPosObj.lblComment),
				createCss2Button(`btnComment`, g_lblNameObj.comment, () => {
					const lblCommentDef = lblComment.style.display;
					lblComment.style.display = (lblCommentDef === C_DIS_NONE ? C_DIS_INHERIT : C_DIS_NONE);
				}, g_lblPosObj.btnComment, g_cssObj.button_Default),
			);
			setUserSelect(lblComment.style, `text`);
		}
	}

	// マスクスプライトを作成
	const maskTitleSprite = createMultipleSprite(`maskTitleSprite`, g_headerObj.maskTitleMaxDepth);
	if (!g_headerObj.masktitleButton) {
		maskTitleSprite.style.pointerEvents = C_DIS_NONE;
	}

	/**
	 * タイトルのモーション設定
	 */
	const flowTitleTimeline = () => {

		// ユーザカスタムイベント(フレーム毎)
		g_customJsObj.titleEnterFrame.forEach(func => func());

		// 背景・マスクモーション、スキン変更
		drawTitleResultMotion(g_currentPage);

		thisTime = performance.now();
		buffTime = thisTime - titleStartTime - g_scoreObj.titleFrameNum * 1000 / g_fps;

		g_scoreObj.titleFrameNum++;
		g_animationData.forEach(sprite => g_scoreObj[`${sprite}TitleFrameNum`]++);
		g_timeoutEvtTitleId = setTimeout(flowTitleTimeline, 1000 / g_fps - buffTime);
	};

	g_timeoutEvtTitleId = setTimeout(flowTitleTimeline, 1000 / g_fps);

	// キー操作イベント（デフォルト）
	setShortcutEvent(g_currentPage, () => true, { dfEvtFlg: true });

	document.oncontextmenu = () => true;
	divRoot.oncontextmenu = () => false;

	g_skinJsObj.title.forEach(func => func());
};

/**
 * 警告用ウィンドウ（汎用）を表示
 * @param {string} _text 
 * @param {boolean} [object.resetFlg=false] 警告リストをクリアして再作成
 * @param {boolean} [object.backBtnUse=false] Backボタンを付与
 */
const makeWarningWindow = (_text = ``, { resetFlg = false, backBtnUse = false } = {}) => {
	const displayName = (g_currentPage === `initial` ? `title` : g_currentPage);
	if (_text !== ``) {
		if (resetFlg) {
			g_errMsgObj[displayName] = [_text];
		} else if (g_errMsgObj[displayName].findIndex(val => val === _text) === -1) {
			g_errMsgObj[displayName].push(_text);
		}
	}
	if (g_errMsgObj[displayName].length > 0) {
		divRoot.appendChild(setWindowStyle(`<p>${g_errMsgObj[displayName].join('</p><p>')}</p>`, `#ffcccc`, `#660000`));
		setUserSelect(lblWarning.style, `text`);
	}
	if (backBtnUse) {
		// タイトルバック用ボタン
		divRoot.appendChild(createCss2Button(`btnBack`, g_lblNameObj.b_back, () => true, {
			resetFunc: () => titleInit(),
		}, g_cssObj.button_Back));
	}
};

/**
 * お知らせウィンドウ（汎用）を表示
 * @param {string} _text 
 * @param {string} _animationName
 * @param {string} [object._backColor='#ccccff']
 */
const makeInfoWindow = (_text, _animationName = ``, { _backColor = `#ccccff` } = {}) => {
	const lblWarning = setWindowStyle(`<p>${_text}</p>`, _backColor, `#000066`, C_ALIGN_CENTER);
	lblWarning.style.pointerEvents = C_DIS_NONE;

	if (_animationName !== ``) {
		lblWarning.style.animationName = _animationName;
		lblWarning.style.animationDuration = `2.5s`;
		lblWarning.style.animationFillMode = `forwards`;
		lblWarning.style.animationTimingFunction = `cubic-bezier(1.000, 0.000, 0.000, 1.000)`;
	}
	divRoot.appendChild(lblWarning);
};

/**
 * 警告ウィンドウのスタイル設定
 * @param {string} _text 
 * @param {string} _bkColor 
 * @param {string} _textColor 
 * @param {string} _align
 * @param {number} [object._x=g_btnX()]
 * @param {number} [object._y=0]
 * @param {number} [object._w=g_btnWidth()]
 * @returns {HTMLDivElement}
 */
const setWindowStyle = (_text, _bkColor, _textColor, _align = C_ALIGN_LEFT, { _x = g_btnX(), _y = 0, _w = g_btnWidth() } = {}) => {

	deleteDiv(divRoot, `lblWarning`);

	// ウィンドウ枠の行を取得するために一時的な枠を作成
	const tmplbl = createDivCss2Label(`lblTmpWarning`, _text, {
		x: _x, y: 70, w: _w, h: 20, siz: g_limitObj.mainSiz, lineHeight: wUnit(15), fontFamily: getBasicFont(),
		whiteSpace: `normal`,
	});
	divRoot.appendChild(tmplbl);
	const range = new Range();
	range.selectNode(tmplbl);

	// ウィンドウ枠の行を元に縦の長さを決定(150pxを超えた場合は縦スクロールバーを付与)
	const warnHeight = Math.min(150, Math.max(range.getClientRects().length,
		_text.split(`<br>`).length + _text.split(`<p>`).length - 1) * 21);
	const lbl = createDivCss2Label(`lblWarning`, _text, {
		x: _x, y: 70 + _y, w: _w, h: warnHeight, siz: g_limitObj.mainSiz, backgroundColor: _bkColor,
		opacity: 0.9, lineHeight: wUnit(15), color: _textColor, align: _align, fontFamily: getBasicFont(),
		whiteSpace: `normal`,
	});
	if (warnHeight === 150) {
		lbl.style.overflow = `auto`;
	}

	// 一時的な枠を削除
	divRoot.removeChild(tmplbl);

	return lbl;
};


/*-----------------------------------------------------------*/
/* Scene : SETTINGS [lime] */
/*-----------------------------------------------------------*/

const commonSettingBtn = _labelName => {

	const switchSave = evt => {
		const from = boolToSwitch(g_stateObj.dataSaveFlg);
		g_stateObj.dataSaveFlg = !g_stateObj.dataSaveFlg;

		const to = boolToSwitch(g_stateObj.dataSaveFlg);
		evt.target.classList.replace(g_cssObj[`button_${from}`], g_cssObj[`button_${to}`]);
	};

	multiAppend(divRoot,

		// タイトル画面へ戻る
		createCss2Button(`btnBack`, g_lblNameObj.b_back, () => true,
			Object.assign(g_lblPosObj.btnBack, {
				animationName: (g_initialFlg ? `` : `smallToNormalY`), resetFunc: () => titleInit(),
			}), g_cssObj.button_Back),

		// キーコンフィグ画面へ移動
		createCss2Button(`btnKeyConfig`, g_lblNameObj.b_keyConfig, () => true,
			Object.assign(g_lblPosObj.btnKeyConfig, {
				animationName: (g_initialFlg ? `` : `smallToNormalY`), resetFunc: () => keyConfigInit(`Main`),
			}), g_cssObj.button_Setting),

		// プレイ開始
		makePlayButton(() => loadMusic()),

		// Display設定へ移動
		createCss2Button(`btn${_labelName}`, `>`, () => true,
			Object.assign(g_lblPosObj.btnSwitchSetting, {
				title: g_msgObj[`to${_labelName}`], resetFunc: () => g_moveSettingWindow(),
				cxtFunc: () => g_moveSettingWindow(true, -1),
			}), g_cssObj.button_Mini),

		// データセーブフラグの切替
		createCss2Button(`btnSave`, g_lblNameObj.dataSave, evt => switchSave(evt),
			Object.assign(g_lblPosObj.btnSave, {
				cxtFunc: evt => switchSave(evt),
			}), g_cssObj.button_Default, (g_stateObj.dataSaveFlg ? g_cssObj.button_ON : g_cssObj.button_OFF)),
	);
};

/**
 * PLAYボタンの作成
 * @param {function} _func 
 * @returns {HTMLDivElement}
 */
const makePlayButton = _func => createCss2Button(`btnPlay`, g_lblNameObj.b_play, () => true,
	Object.assign(g_lblPosObj.btnPlay, {
		animationName: (g_initialFlg ? `` : `smallToNormalY`), resetFunc: _func,
	}), g_cssObj.button_Next);

/**
 * 設定・オプション画面初期化
 */
const optionInit = () => {

	clearWindow(true);
	const divRoot = document.getElementById(`divRoot`);
	g_currentPage = `option`;
	g_stateObj.filterKeys = ``;

	// タイトル文字描画
	divRoot.appendChild(getTitleDivLabel(`lblTitle`, g_lblNameObj.settings, 0, 15, `settings_Title`));

	// オプションボタン用の設置
	createOptionWindow(divRoot);

	// ユーザカスタムイベント(初期)
	g_customJsObj.option.forEach(func => func());

	// ボタン描画
	commonSettingBtn(`Display`);

	// キー操作イベント（デフォルト）
	setShortcutEvent(g_currentPage, () => true, { dfEvtFlg: true });
	document.oncontextmenu = () => true;
	g_initialFlg = true;

	g_skinJsObj.option.forEach(func => func());
};

/**
 * 設定画面用スプライトリストの作成
 * @param {object} _settingList (設定名、縦位置、縦位置差分、幅差分、高さ差分)を設定別にリスト化
 * @returns
 */
const setSpriteList = _settingList => {
	const optionWidth = (g_sWidth - 450) / 2;
	const spriteList = [];
	Object.keys(_settingList).forEach(setting =>
		spriteList[setting] = createEmptySprite(optionsprite, `${setting}Sprite`, {
			x: 25, y: _settingList[setting].heightPos * g_limitObj.setLblHeight + _settingList[setting].y + 20,
			w: optionWidth + _settingList[setting].dw, h: g_limitObj.setLblHeight + _settingList[setting].dh,
		}));
	return spriteList;
};

/**
 * スライダー共通処理 (Fadein)
 * @param {HTMLInputElement} _slider 
 * @param {HTMLDivElement} _link 
 * @returns {string}
 */
const inputSlider = (_slider, _link) => {
	const value = parseInt(_slider.value);
	_link.textContent = `${value}${g_lblNameObj.percent}`;
	return value;
};

/**
 * スライダー共通処理 (Appearance)
 * @param {HTMLInputElement} _slider 
 * @param {HTMLDivElement} _link 
 * @returns {string}
 */
const inputSliderAppearance = (_slider, _link) => {
	const value = parseInt(_slider.value);
	_link.textContent = `${g_hidSudObj.distH[g_stateObj.appearance](value)}`;
	return value;
};

/**
 * 譜面変更セレクターの削除
 */
const resetDifWindow = () => {
	if (document.getElementById(`difList`) !== null) {
		deleteChildspriteAll(`difList`);
		[`difList`, `difCover`, `btnDifU`, `btnDifD`].forEach(obj => document.getElementById(obj).remove());
		g_currentPage = `option`;
		setShortcutEvent(g_currentPage, () => true, { displayFlg: false, dfEvtFlg: true });
	}
};

/**
 * 次の譜面番号を取得 
 * @param {number} _scoreId 
 * @param {number} _scrollNum 
 * @returns {number}
 */
const getNextDifficulty = (_scoreId, _scrollNum) => {
	const currentPosIdx = g_headerObj.viewLists.findIndex(val => val === _scoreId);
	const nextPosIdx = (currentPosIdx === -1 ? 0 : nextPos(currentPosIdx, _scrollNum, g_headerObj.viewLists.length));
	return g_headerObj.viewLists[nextPosIdx];
};

/**
 * 譜面選択処理
 * @param {number} _scrollNum 
 */
const nextDifficulty = (_scrollNum = 1) => {
	g_keyObj.prevKey = g_headerObj.keyLabels[g_stateObj.scoreId];
	g_stateObj.scoreId = getNextDifficulty(g_stateObj.scoreId, _scrollNum);
	setDifficulty(true);
	resetDifWindow();
};

/**
 * 譜面リストの作成
 * @param {HTMLDivElement} _difList 
 * @param {string} _targetKey 
 */
const makeDifList = (_difList, _targetKey = ``) => {
	let k = 0, pos = 0, curk = -1;
	g_headerObj.viewLists.forEach(j => {
		const keyLabel = g_headerObj.keyLabels[j];
		if (_targetKey === `` || keyLabel === _targetKey) {
			let text = `${getKeyName(keyLabel)} / ${g_headerObj.difLabels[j]}`;
			if (g_headerObj.makerView) {
				text += ` (${g_headerObj.creatorNames[j]})`;
			}
			_difList.appendChild(makeDifLblCssButton(`dif${k}`, text, k, () => nextDifficulty(j - g_stateObj.scoreId),
				{ btnStyle: (j === g_stateObj.scoreId ? `Setting` : `Default`) }));
			if (j === g_stateObj.scoreId) {
				pos = k + 6.5 * (g_sHeight - 239) / 261;
				curk = k;
			}
			k++;
		}
	});
	if (document.getElementById(`lblDifCnt`) === null) {
		difCover.appendChild(createDivCss2Label(`lblDifCnt`, ``, {
			x: 0, y: 27, w: g_limitObj.difCoverWidth, h: 16, siz: 12, fontWeight: `bold`,
		}));
	}
	// フィルタなし> ALL: 1/ 5, フィルタあり> 7k: 1/ 1 のように現在位置と(フィルタされた)譜面数を表示
	// 現在位置が不確定の場合は、7k: -/ 1 のように現在位置を「-」で表示
	const keyUnitAbbName = getStgDetailName(getKeyUnitName(_targetKey)).slice(0, 1) || ``;
	lblDifCnt.innerHTML = `${_targetKey === '' ? 'ALL' : getKeyName(_targetKey) + keyUnitAbbName}: ${curk === -1 ? '-' : curk + 1} / ${k}`;
	_difList.scrollTop = Math.max(pos * g_limitObj.setLblHeight - parseInt(_difList.style.height), 0);
};

/**
 * 譜面セレクター位置の変更ボタン
 * @param {number} _scrollNum 
 */
const makeDifBtn = (_scrollNum = 1) => {
	const dir = _scrollNum === 1 ? `D` : `U`;
	return createCss2Button(`btnDif${dir}`, g_settingBtnObj.chara[dir], () => {
		do {
			g_stateObj.scoreId = getNextDifficulty(g_stateObj.scoreId, _scrollNum);
		} while (g_stateObj.filterKeys !== `` && g_stateObj.filterKeys !== g_headerObj.keyLabels[g_stateObj.scoreId]);
		setDifficulty(true);
		deleteChildspriteAll(`difList`);
		makeDifList(difList, g_stateObj.filterKeys);
		g_keyObj.prevKey = g_keyObj.currentKey;
	}, {
		x: 430 + _scrollNum * 10, y: 40, w: 20, h: 20, siz: g_limitObj.jdgCntsSiz,
	}, g_cssObj.button_Mini);
};

/**
 * 譜面変更セレクターの作成・再作成
 * @param {string} [_key=''] 絞り込みするキー名(無指定で絞り込みしない)
 */
const createDifWindow = (_key = ``) => {
	g_currentPage = `difSelector`;
	setShortcutEvent(g_currentPage);
	const difList = createEmptySprite(optionsprite, `difList`, g_windowObj.difList, g_cssObj.settings_DifSelector);
	const difCover = createEmptySprite(optionsprite, `difCover`, g_windowObj.difCover, g_cssObj.settings_DifSelector);
	const difFilter = createEmptySprite(difCover, `difFilter`, g_windowObj.difFilter, g_cssObj.settings_DifSelector)

	// リスト再作成
	makeDifList(difList, _key);

	// ランダム選択
	difCover.appendChild(
		makeDifLblCssButton(`difRandom`, `RANDOM`, 0, () => {
			nextDifficulty(Math.floor(Math.random() * g_headerObj.keyLabels.length));
		}, { w: g_limitObj.difCoverWidth })
	);

	// 全リスト
	difCover.appendChild(
		makeDifLblCssButton(`keyFilter`, `ALL`, 1.9, () => {
			resetDifWindow();
			g_stateObj.filterKeys = ``;
			createDifWindow();
		}, { w: g_limitObj.difCoverWidth, btnStyle: (g_stateObj.filterKeys === `` ? `Setting` : `Default`) })
	);

	// キー別フィルタボタン作成
	let pos = 0;
	g_headerObj.viewKeyLists.forEach((targetKey, m) => {
		difFilter.appendChild(
			makeDifLblCssButton(`keyFilter${m}`, `${getKeyName(targetKey)} ${getStgDetailName(getKeyUnitName(targetKey))}`, m, () => {
				resetDifWindow();
				g_stateObj.filterKeys = targetKey;
				createDifWindow(targetKey);
			}, { w: g_limitObj.difCoverWidth, btnStyle: (g_stateObj.filterKeys === targetKey ? `Setting` : `Default`) })
		);
		if (g_stateObj.filterKeys === targetKey) {
			pos = m + 5 * (g_sHeight - 300) / 200;
		}
	});
	difFilter.scrollTop = Math.max(pos * g_limitObj.setLblHeight - parseInt(difFilter.style.height), 0);

	multiAppend(optionsprite, makeDifBtn(-1), makeDifBtn());
};

/**
 * 譜面変更ボタンを押したときの処理
 * @param {number} [_num=1] 
 */
const changeDifficulty = (_num = 1) => {
	if (g_headerObj.difSelectorUse) {
		g_stateObj.filterKeys = ``;
		if (document.getElementById(`difList`) === null) {
			g_keyObj.prevKey = g_keyObj.currentKey;
			createDifWindow();
		} else {
			resetDifWindow();
		}
	} else {
		nextDifficulty(_num);
	}
};

/**
 * 譜面基礎データの取得
 * @param {number} _scoreId 
 * @returns {{ arrowCnts: number, frzCnts: number, apm: number, playingTime: string }}
 */
const getScoreBaseData = _scoreId => {
	const arrowCnts = sumData(g_detailObj.arrowCnt[_scoreId]);
	const frzCnts = sumData(g_detailObj.frzCnt[_scoreId]);
	return {
		arrowCnts: arrowCnts,
		frzCnts: frzCnts,
		apm: Math.round((arrowCnts + frzCnts) / (g_detailObj.playingFrame[_scoreId] / g_fps / 60)),
		playingTime: transFrameToTimer(g_detailObj.playingFrame[_scoreId]),
	};
};

/**
 * 速度変化グラフの描画
 * @param {number} _scoreId
 */
const drawSpeedGraph = _scoreId => {
	const startFrame = g_detailObj.startFrame[_scoreId];
	const playingFrame = g_detailObj.playingFrameWithBlank[_scoreId];
	const speedObj = {
		speed: { frame: [0], speed: [1], cnt: 0, strokeColor: g_graphColorObj.speed },
		boost: { frame: [0], speed: [1], cnt: 0, strokeColor: g_graphColorObj.boost }
	};

	Object.keys(speedObj).forEach(speedType => {
		const frame = speedObj[speedType].frame;
		const speed = speedObj[speedType].speed;
		const speedData = g_detailObj[`${speedType}Data`][_scoreId];

		for (let i = 0; i < speedData?.length; i += 2) {
			if (speedData[i] >= startFrame) {
				frame.push(speedData[i] - startFrame);
				speed.push(speedData[i + 1]);
			}
			speedObj[speedType].cnt++;
		}
		frame.push(playingFrame);
		speed.push(speed.at(-1));
	});

	const canvas = document.getElementById(`graphSpeed`);
	const context = canvas.getContext(`2d`);
	const [_a, _b] = [-75, 100];
	const [_min, _max] = [-0.2, 2.2];
	drawBaseLine(context, { _fixed: 1, _mark: `x`, _a, _b, _min, _max });

	const avgX = [0, 0];
	const avgSubX = [0, 0];
	const lineX = [0, 150], lineY = 208;
	Object.keys(speedObj).forEach((speedType, j) => {
		const frame = speedObj[speedType].frame;
		const speed = speedObj[speedType].speed;

		context.beginPath();
		let preY;
		let avgSubFrame = 0;

		for (let i = 0; i < frame.length; i++) {
			const x = frame[i] * (g_limitObj.graphWidth - 30) / playingFrame + 30;
			const y = (Math.min(Math.max(speed[i], _min - 0.05), _max + 0.05) - 1) * _a + _b;

			context.lineTo(x, preY);
			context.lineTo(x, y);
			preY = y;

			const deltaFrame = frame[i] - (frame[i - 1] ?? startFrame);
			avgX[j] += deltaFrame * (speed[i - 1] ?? 1);
			if ((speed[i - 1] ?? 1) !== 1) {
				avgSubFrame += deltaFrame;
				avgSubX[j] += deltaFrame * (speed[i - 1]);
			}
		}
		avgX[j] /= playingFrame;
		avgSubX[j] /= Math.max(avgSubFrame, 1);

		context.lineWidth = 2;
		context.strokeStyle = speedObj[speedType].strokeColor;
		context.stroke();

		context.beginPath();
		context.moveTo(lineX[j], lineY);
		context.lineTo(lineX[j] + 25, lineY);
		context.stroke();
		context.font = `${wUnit(g_limitObj.mainSiz)} ${getBasicFont()}`;
		context.fillText(g_lblNameObj[`s_${speedType}`], lineX[j] + 30, lineY + 3);

		const maxSpeed = Math.max(...speed);
		const minSpeed = Math.min(...speed);
		context.font = `${wUnit(g_limitObj.graphMiniSiz)} ${getBasicFont()}`;
		context.fillText(`(${minSpeed.toFixed(2)}x` + (minSpeed === maxSpeed ? `` : ` -- ${Math.max(...speed).toFixed(2)}x`) + `)`, lineX[j] + 30, lineY + 16);
		context.fillText(`Avg. ` + (avgX[j] === 1 ? `----` : `${(avgSubX[j]).toFixed(2)}x`), lineX[j] + 30, lineY + 29);
		updateScoreDetailLabel(`Speed`, `${speedType}S`, speedObj[speedType].cnt, j, g_lblNameObj[`s_${speedType}`]);
	});
	updateScoreDetailLabel(`Speed`, `avgS`, `${(avgX[0] * avgX[1]).toFixed(2)}x`, 2, g_lblNameObj.s_avg);
};

/**
 * 譜面密度グラフの描画
 * @param {number} _scoreId 
 */
const drawDensityGraph = _scoreId => {

	const canvas = document.getElementById(`graphDensity`);
	const context = canvas.getContext(`2d`);
	drawBaseLine(context);
	for (let j = 0; j < g_limitObj.densityDivision; j++) {
		context.beginPath();
		[``, `2Push`, `3Push`].forEach(val => {
			context.fillStyle = (g_detailObj.maxDensity[_scoreId].includes(j) ? g_graphColorObj[`max${val}`] : g_graphColorObj[`default${val}`]);
			context.fillRect(16 * j * 16 / g_limitObj.densityDivision + 30, 195 - 9 * g_detailObj[`density${val}Data`][_scoreId][j] / 10,
				15.5 * 16 / g_limitObj.densityDivision, 9 * g_detailObj[`density${val}Diff`][_scoreId][j] / 10
			);
		});
		context.stroke();
	}

	const lineNames = [`Single`, `Chord`, `Triad+`];
	Object.keys(g_graphColorObj).filter(val => val.indexOf(`max`) !== -1).forEach((val, j) => {
		const lineX = 70 + j * 70;

		context.beginPath();
		context.lineWidth = 3;
		context.fillStyle = g_rankObj.rankColorAllPerfect;
		context.strokeStyle = g_graphColorObj[val];
		context.moveTo(lineX, 215);
		context.lineTo(lineX + 20, 215);
		context.stroke();
		context.font = `${wUnit(g_limitObj.difSelectorSiz)} ${getBasicFont()}`;
		context.fillText(lineNames[j], lineX + 20, 218);
	});

	const obj = getScoreBaseData(_scoreId);
	updateScoreDetailLabel(`Density`, `APM`, obj.apm, 0, g_lblNameObj.s_apm);
	updateScoreDetailLabel(`Density`, `Time`, obj.playingTime, 1, g_lblNameObj.s_time);
	updateScoreDetailLabel(`Density`, `Arrow`, obj.arrowCnts, 3, g_lblNameObj.s_arrow);
	updateScoreDetailLabel(`Density`, `Frz`, obj.frzCnts, 4, `${g_lblNameObj.s_frz}${g_headerObj.frzStartjdgUse ? ' <span class="common_bold">(2x)</span>' : ''}`);
};

/**
 * 譜面明細内の補足情報の登録・更新
 * @param {string} _name 表示する譜面明細のラベル
 * @param {string} _label 
 * @param {string} _value 
 * @param {number} [_pos=0] 表示位置
 * @param {string} [_labelname=_label]
 */
const updateScoreDetailLabel = (_name, _label, _value, _pos = 0, _labelname = _label) => {
	const baseLabel = (_bLabel, _bLabelname, _bAlign) =>
		document.getElementById(`detail${_name}`).appendChild(
			createDivCss2Label(_bLabel, _bLabelname, {
				x: 10, y: 110 + _pos * 20, w: 100, h: 20, siz: g_limitObj.difSelectorSiz, align: _bAlign,
			})
		);
	if (document.getElementById(`data${_label}`) === null) {
		baseLabel(`lbl${_label}`, `${_labelname}`, C_ALIGN_LEFT);
		baseLabel(`data${_label}`, `${_value}`, C_ALIGN_RIGHT);
	} else {
		document.getElementById(`data${_label}`).textContent = `${_value}`;
	}
};

/**
 * グラフの縦軸を描画
 * @param {CanvasRenderingContext2D} _context 
 * @param {number} [object._fixed=2] y座標）目盛表記する小数桁数
 * @param {string} [object._mark=''] y座標）目盛の単位
 * @param {number} [object._resolution=10] y座標）明細分割数
 * @param {number} [object._a=-90]
 * @param {number} [object._b=105]
 * @param {number} [object._min=0] y座標）目盛の下限値
 * @param {number} [object._max=2] y座標）目盛の上限値
 */
const drawBaseLine = (_context, { _fixed = 2, _mark = ``, _resolution = 10, _a = -90, _b = 105, _min = 0, _max = 2 } = {}) => {
	_context.clearRect(0, 0, g_limitObj.graphWidth, g_limitObj.graphHeight);

	for (let j = _min * _resolution; j <= _max * _resolution; j += 5) {
		for (let k = 0; k < 5; k++) {
			if ((j + k) % 5 === 0) {
				drawLine(_context, (j + k) / _resolution, `main`, { _fixed, _mark, _a, _b });
			} else {
				drawLine(_context, (j + k) / _resolution, `sub`, { _fixed, _mark, _a, _b });
			}
		}
	}
};

/**
 * グラフ上に目盛を表示
 * @param {CanvasRenderingContext2D} _context 
 * @param {number} _y 
 * @param {string} _lineType 
 * @param {number} [object._fixed] y座標）目盛表記する小数桁数
 * @param {string} [object._mark] y座標）目盛の単位
 * @param {number} [object._a]
 * @param {number} [object._b]
 */
const drawLine = (_context, _y, _lineType, { _fixed, _mark, _a, _b } = {}) => {
	const lineY = (_y - 1) * _a + _b;
	_context.beginPath();
	_context.moveTo(30, lineY);
	_context.lineTo(g_limitObj.graphWidth, lineY);
	_context.lineWidth = 1;

	if (_lineType === `main`) {
		const textBaseObj = document.getElementById(`lnkDifficulty`);
		const textColor = window.getComputedStyle(textBaseObj, ``).color;
		_context.strokeStyle = textColor;
		_context.font = `${wUnit(12)} ${getBasicFont()}`;
		_context.fillStyle = textColor;
		_context.fillText(_y.toFixed(_fixed) + _mark, 2, lineY + 4);
	} else {
		_context.strokeStyle = `#646464`;
	}
	_context.stroke();
};

/**
 * 譜面の難易度情報用ラベル作成
 * @param {number} _scoreId 
 */
const makeDifInfoLabels = _scoreId => {

	// ツール難易度
	const detailToolDif = document.getElementById(`detailToolDif`);
	/**
	 * 譜面の難易度情報ラベルの作成
	 * @param {string} _lbl 
	 * @param {string} _data 
	 * @param {object} _obj 
	 * @returns {HTMLDivElement}
	 */
	const makeDifInfoLabel = (_lbl, _data, { x = 130, y = 25, w = 125, h = 35, siz = g_limitObj.difSelectorSiz, ...rest } = {}) =>
		createDivCss2Label(_lbl, _data, { x, y, w, h, siz, align: C_ALIGN_LEFT, ...rest });

	let printData = ``;
	for (let j = 0; j < g_detailObj.arrowCnt.length; j++) {
		const obj = getScoreBaseData(j);
		printData +=
			// 譜面番号
			`[${j + 1}]\t` +
			// ツール値
			`${g_detailObj.toolDif[j].tool}\t` +
			// 同時
			`${g_detailObj.toolDif[j].douji}\t` +
			// 縦連
			`${g_detailObj.toolDif[j].tate}\t` +
			// 総矢印数
			`${(obj.arrowCnts + obj.frzCnts)}\t` +
			// 矢印
			`${obj.arrowCnts}\t` +
			// フリーズアロー
			`${obj.frzCnts}\t` +
			// APM
			`${obj.apm}\t` +
			// 時間(分秒)
			`${obj.playingTime}\r\n`;
	}
	multiAppend(detailToolDif,
		makeDifInfoLabel(`lblTooldif`, g_lblNameObj.s_level, g_lblPosObj.lblTooldif),
		makeDifInfoLabel(`dataTooldif`, ``, g_lblPosObj.dataTooldif),
		makeDifInfoLabel(`lblDouji`, g_lblNameObj.s_douji, g_lblPosObj.lblDouji),
		makeDifInfoLabel(`lblTate`, g_lblNameObj.s_tate, g_lblPosObj.lblTate),
		makeDifInfoLabel(`dataDouji`, ``, g_lblPosObj.dataDouji),
		makeDifInfoLabel(`dataTate`, ``, g_lblPosObj.dataTate),
		makeDifInfoLabel(`lblArrowInfo`, g_lblNameObj.s_cnts, g_lblPosObj.lblArrowInfo),
		makeDifInfoLabel(`dataArrowInfo`, ``, g_lblPosObj.dataArrowInfo),
		makeDifInfoLabel(`lblArrowInfo2`, ``, g_lblPosObj.lblArrowInfo2),
		makeDifInfoLabel(`dataArrowInfo2`, ``, g_lblPosObj.dataArrowInfo2),
		makeDifLblCssButton(`lnkDifInfo`, g_lblNameObj.s_print, 8, () => {
			copyTextToClipboard(
				`****** ${g_lblNameObj.s_printTitle} [${g_version}] ******\r\n\r\n`
				+ `\t${g_lblNameObj.s_printHeader}\r\n\r\n${printData}`, g_msgInfoObj.I_0003
			);
		}, g_lblPosObj.lnkDifInfo),
	);
	createScText(lnkDifInfo, `DifInfo`, { targetLabel: `lnkDifInfo`, x: -10 });
};

/**
 * 譜面の難易度情報更新
 * @param {number} _scoreId 
 */
const makeDifInfo = _scoreId => {

	const arrowCnts = sumData(g_detailObj.arrowCnt[_scoreId]);
	const frzCnts = sumData(g_detailObj.frzCnt[_scoreId].map(val => Math.floor(val)));
	const push3CntStr = (g_detailObj.toolDif[_scoreId].push3.length === 0 ? `None` : `(${g_detailObj.toolDif[_scoreId].push3.join(', ')})`);

	if (document.getElementById(`lblTooldif`) === null) {
		makeDifInfoLabels(_scoreId);
	}
	dataTooldif.textContent = g_detailObj.toolDif[_scoreId].tool;
	dataDouji.textContent = g_detailObj.toolDif[_scoreId].douji;
	dataTate.textContent = g_detailObj.toolDif[_scoreId].tate;
	lblArrowInfo2.innerHTML = g_lblNameObj.s_linecnts.split(`{0}`)
		.join(`${makeDedupliArray(g_detailObj.toolDif[_scoreId].push3).length} /cnt:${g_detailObj.toolDif[_scoreId].push3cnt}`);
	dataArrowInfo.innerHTML = `${arrowCnts + frzCnts * (g_headerObj.frzStartjdgUse ? 2 : 1)} 
	<span style="font-size:${wUnit(g_limitObj.difSelectorSiz)};">(${arrowCnts} + ${frzCnts}${g_headerObj.frzStartjdgUse ? ' <span class="common_bold">x 2</span>' : ''})</span>`;

	const makeArrowCntsView = (_cntlist) => {
		const targetKey = g_headerObj.keyLabels[_scoreId];
		const cntlist = [
			_cntlist.filter((val, j) =>
				g_keyObj[`pos${targetKey}_0`][j] < g_keyObj[`div${targetKey}_0`]),
			_cntlist.filter((val, j) =>
				g_keyObj[`pos${targetKey}_0`][j] >= g_keyObj[`div${targetKey}_0`])
		];

		let cntlistStr = ``;
		cntlist.filter(array => array.length > 0).forEach(array => {
			const maxVal = array.reduce((a, b) => Math.max(a, b));
			const minVal = array.reduce((a, b) => Math.min(a, b));

			cntlistStr += `[ `;
			array.forEach((val, j) => {
				if (maxVal !== minVal) {
					array[j] = (val === minVal ? `<span class="settings_minArrowCnts">${val}</span>` :
						(val === maxVal ? `<span class="settings_maxArrowCnts common_bold">${val}</span>` : val));
				}
				if (val - Math.floor(val) > 0) {
					array[j] = `<span class="keyconfig_warning">${val}</span>`;
				}
			});
			cntlistStr += array.join(`, `) + ` ]`;
		});

		return cntlistStr;
	}

	dataArrowInfo2.innerHTML = `<br>${makeArrowCntsView(g_detailObj.arrowCnt[_scoreId])}<br><br>
			${makeArrowCntsView(g_detailObj.frzCnt[_scoreId])}<br><br>${push3CntStr}`;
};

/**
 * ハイスコア表示
 * @param {number} _scoreId 
 */
const makeHighScore = _scoreId => {
	const detailHighScore = document.getElementById(`detailHighScore`);

	// 再描画のため一度クリア
	deleteChildspriteAll(`detailHighScore`);

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const assistFlg = (g_autoPlaysBase.includes(g_stateObj.autoPlay) ? `` : `-${getStgDetailName(g_stateObj.autoPlay)}${getStgDetailName('less')}`);
	const mirrorName = (g_stateObj.shuffle === C_FLG_OFF ? `` : `-${g_stateObj.shuffle}`);
	const transKeyName = (hasVal(g_keyObj[`transKey${keyCtrlPtn}`]) ? `(${g_keyObj[`transKey${keyCtrlPtn}`]})` : ``);
	let scoreName = `${g_headerObj.keyLabels[_scoreId]}${transKeyName}${getStgDetailName('k-')}${g_headerObj.difLabels[_scoreId]}${assistFlg}${mirrorName}`;
	if (g_headerObj.makerView) {
		scoreName += `-${g_headerObj.creatorNames[_scoreId]}`;
	}

	const createScoreLabel = (_id, _text, { xPos = 0, yPos = 0, dx = 0, w = 150, h = 17, colorName = _id, align = C_ALIGN_LEFT, overflow = `visible` } = {}) =>
		createDivCss2Label(`lblH${toCapitalize(_id)}`, _text, {
			x: xPos * 150 + 130 + dx, y: yPos * 16 + 5, w, h, siz: 14, align, overflow,
		}, g_cssObj[`common_${colorName}`]);

	const charas = [
		`ii`, `shakin`, `matari`, `shobon`, `uwan`, `kita`, `iknai`, `maxCombo`, `fmaxCombo`, ``, `score`,
	];
	const extData = {
		fast: `diffFast`, slow: `diffSlow`, adj: `estAdj`, excessive: `excessive`,
	};
	// 各判定 (FreezeComboとScoreの間に1行の空白を入れる)
	charas.forEach((chara, j) => {
		if (chara === ``) {
			return;
		}
		multiAppend(detailHighScore,
			createScoreLabel(chara, g_lblNameObj[`j_${chara}`], { yPos: j }),
			createScoreLabel(`${chara}S`, g_localStorage.highscores?.[scoreName]?.[chara] ?? `---`,
				{ xPos: 0, yPos: j, align: C_ALIGN_RIGHT }),
		);
	});
	// Fast, Slow, 推定Adj, Excessive (値が無ければスキップ)
	Object.keys(extData).forEach((chara, j) => {
		if (!hasVal(g_localStorage.highscores?.[scoreName]?.[chara], `---`)) {
			return;
		}
		multiAppend(detailHighScore,
			createScoreLabel(chara, g_lblNameObj[`j_${chara}`], { xPos: 1, yPos: j, dx: 20, colorName: extData[chara] }),
			createScoreLabel(`${chara}S`, g_localStorage.highscores?.[scoreName]?.[chara],
				{ xPos: 1, yPos: j, dx: -25, align: C_ALIGN_RIGHT }),
		);
	});
	if (hasVal(g_localStorage.highscores?.[scoreName]?.adj)) {
		multiAppend(detailHighScore, createScoreLabel(`adjF`, `f`, { xPos: 2, yPos: 2, dx: -23 }));
	}

	// カスタム表示 (resultValsViewに指定した表示のみ)
	g_headerObj.resultValsView
		.filter(key => hasVal(g_localStorage.highscores?.[scoreName]?.[g_presetObj.resultVals?.[key]]))
		.forEach((key, j) => {
			multiAppend(detailHighScore,
				createScoreLabel(key, g_presetObj.resultVals[key], { xPos: 1, yPos: j + 5, dx: 20 }),
				createScoreLabel(`${key}S`, g_localStorage.highscores?.[scoreName]?.[g_presetObj.resultVals[key]],
					{ xPos: 1, yPos: j + 5, dx: -25, align: C_ALIGN_RIGHT }),
			);
		});
	// ランク、クリアランプ、特殊設定条件
	multiAppend(detailHighScore,
		createDivCss2Label(`lblHRank`, g_localStorage.highscores?.[scoreName]?.rankMark ?? `--`, Object.assign(g_lblPosObj.lblHRank, {
			color: g_localStorage.highscores?.[scoreName]?.rankColor ?? `#666666`,
			fontFamily: getBasicFont(`"Bookman Old Style"`),
		})),
		createScoreLabel(`lblHDateTime`, g_localStorage.highscores?.[scoreName]?.dateTime ?? `----/--/-- --:--`, { yPos: 12 }),
		createScoreLabel(`lblHMarks`,
			`${g_localStorage.highscores?.[scoreName]?.fullCombo ?? '' ? '<span class="result_FullCombo">◆</span>' : ''}` +
			`${g_localStorage.highscores?.[scoreName]?.perfect ?? '' ? '<span class="result_Perfect">◆</span>' : ''}` +
			`${g_localStorage.highscores?.[scoreName]?.allPerfect ?? '' ? '<span class="result_AllPerfect">◆</span>' : ''}`, { xPos: 1, dx: 20, yPos: 12, w: 100, align: C_ALIGN_CENTER }),
		createScoreLabel(`lblHClearLamps`, `Cleared: ` + (g_localStorage.highscores?.[scoreName]?.clearLamps?.join(', ') ?? `---`), { yPos: 13, overflow: `auto`, w: g_sWidth / 2 + 40, h: 37 }),

		createScoreLabel(`lblHShuffle`, g_stateObj.shuffle.indexOf(`Mirror`) < 0 ? `` : `Shuffle: <span class="common_iknai">${g_stateObj.shuffle}</span>`, { yPos: 11.5, dx: -130 }),
		createScoreLabel(`lblHAssist`, g_autoPlaysBase.includes(g_stateObj.autoPlay) ? `` : `Assist: <span class="common_kita">${g_stateObj.autoPlay}</span>`, { yPos: 12.5, dx: -130 }),
		createScoreLabel(`lblHAnother`, !hasVal(g_keyObj[`transKey${keyCtrlPtn}`]) ? `` : `A.Keymode: <span class="common_ii">${g_keyObj[`transKey${keyCtrlPtn}`]}</span>`, { yPos: 13.5, dx: -130 }),
	);

	// 結果をクリップボードへコピー (ハイスコア保存分)
	if (g_localStorage.highscores?.[scoreName] !== undefined) {
		const twiturl = new URL(g_localStorageUrl);
		twiturl.searchParams.append(`scoreId`, _scoreId);
		const baseTwitUrl = g_isLocal ? `` : `${twiturl.toString()}`.replace(/[\t\n]/g, ``);

		let tweetFrzJdg = ``;
		let tweetMaxCombo = `${g_localStorage.highscores?.[scoreName]?.maxCombo}`;
		if (g_allFrz > 0) {
			tweetFrzJdg = `${g_localStorage.highscores?.[scoreName]?.kita}-${g_localStorage.highscores?.[scoreName]?.iknai}`;
			tweetMaxCombo += `-${g_localStorage.highscores?.[scoreName]?.fmaxCombo}`;
		}

		const musicTitle = g_headerObj.musicTitles[g_headerObj.musicNos[_scoreId]] || g_headerObj.musicTitle;
		let tweetDifData = `${getKeyName(g_headerObj.keyLabels[_scoreId])}${transKeyName}${getStgDetailName('k-')}${g_headerObj.difLabels[_scoreId]}${assistFlg}`;
		if (g_stateObj.shuffle !== `OFF`) {
			tweetDifData += `:${getStgDetailName(g_stateObj.shuffle)}`;
		}

		const resultParams = {
			hashTag: (hasVal(g_headerObj.hashTag) ? ` ${g_headerObj.hashTag}` : ``),
			tuning: g_headerObj.creatorNames[_scoreId],
			rankMark: g_localStorage.highscores?.[scoreName]?.rankMark || `--`,
			playStyleData: g_localStorage.highscores[scoreName]?.playStyle || `--`,
			highscore: g_localStorage.highscores[scoreName],
			tweetExcessive: hasVal(g_localStorage.highscores[scoreName]?.excessive, `---`) ? `(+${g_resultObj.excessive})` : ``,
			musicTitle, tweetDifData, tweetFrzJdg, tweetMaxCombo, baseTwitUrl,
		};
		const resultCommon = unEscapeHtml(makeResultText(g_templateObj.resultFormatDf, resultParams));
		let tweetResultTmp = makeResultText(g_headerObj.resultFormat, resultParams);
		if (g_presetObj.resultVals !== undefined) {
			Object.keys(g_presetObj.resultVals).forEach(key =>
				tweetResultTmp = tweetResultTmp.split(`[${key}]`).join(g_localStorage.highscores[scoreName][g_presetObj.resultVals[key]] || ``));
		}
		const resultText = `${unEscapeHtml(tweetResultTmp)}`;
		multiAppend(detailHighScore,
			makeDifLblCssButton(`lnkResetHighScore`, g_lblNameObj.s_resetResult, 7, () => {
				if (window.confirm(g_msgObj.highscResetConfirm)) {
					delete g_localStorage.highscores[scoreName];
					makeHighScore(_scoreId);
				}
			}, Object.assign({ btnStyle: `Reset` }, g_lblPosObj.lnkHighScore)),
			makeDifLblCssButton(`lnkHighScore`, g_lblNameObj.s_result, 8, () => {
				copyTextToClipboard(keyIsShift() ? resultCommon : resultText, g_msgInfoObj.I_0001);
			}, g_lblPosObj.lnkHighScore),
		);
	}
};

/**
 * 譜面初期化処理
 * - 譜面の基本設定（キー数、初期速度、リバース、ゲージ設定）をここで行う
 * - g_canLoadDifInfoFlg は譜面初期化フラグで、初期化したくない場合は対象画面にて false にしておく
 *   (Display設定画面、キーコンフィグ画面では通常OFF)
 *   この関数を実行後、このフラグはONに戻るようになっている 
 * - [キーコン]->[初期化]->[名称設定]の順に配置する。
 *   初期化処理にてキー数関連の設定を行っているため、この順序で無いとデータが正しく格納されない
 * 
 * @param {boolean} _initFlg
 */
const setDifficulty = (_initFlg) => {

	// ---------------------------------------------------
	// 1. キーコンフィグ設定 (KeyConfig)
	g_keyObj.currentKey = g_headerObj.keyLabels[g_stateObj.scoreId];
	const isNotSameKey = (g_keyObj.prevKey !== g_keyObj.currentKey);

	if (g_headerObj.dummyScoreNos !== undefined) {
		g_stateObj.dummyId = setIntVal(g_headerObj.dummyScoreNos[g_stateObj.scoreId], ``);
	}
	// 特殊キーフラグ
	g_stateObj.extraKeyFlg = g_headerObj.keyExtraList.includes(g_keyObj.currentKey);

	// ---------------------------------------------------
	// 2. 初期化設定

	// 保存した設定の再読込条件（設定画面切り替え時はスキップ）
	// ローカルストレージで保存した設定を呼び出し
	if ((g_canLoadDifInfoFlg && (isNotSameKey && g_stateObj.dataSaveFlg)) || _initFlg) {

		if (isNotSameKey && g_keyObj.prevKey !== `Dummy`) {
			// キーパターン初期化
			g_keyObj.currentPtn = 0;
			g_keycons.keySwitchNum = 0;
		}
		const hasKeyStorage = localStorage.getItem(`danonicw-${g_keyObj.currentKey}k`);
		let storageObj, addKey = ``;

		if (!g_stateObj.extraKeyFlg) {

			// キー別のローカルストレージの初期設定 ※特殊キーは除く
			g_localKeyStorage = hasKeyStorage ? JSON.parse(hasKeyStorage) : {
				reverse: C_FLG_OFF,
				keyCtrl: [[]],
				keyCtrlPtn: 0,
				setColor: [],
			};
			storageObj = g_localKeyStorage;

		} else {
			storageObj = g_localStorage;
			addKey = g_keyObj.currentKey;
		}
		if (isNotSameKey) {
			getKeyReverse(storageObj, addKey);

			// キーコンフィグ初期値設定
			if (storageObj[`keyCtrlPtn${addKey}`] === undefined) {
				storageObj[`keyCtrlPtn${addKey}`] = 0;
			}
			getKeyCtrl(storageObj, addKey);

			// カラーセット初期値設定
			if (storageObj[`setColor${addKey}`] === undefined) {
				storageObj[`setColor${addKey}`] = [];
			}
			if (storageObj[`setColor${addKey}`].length > 0) {
				g_keycons.colorTypes = addValtoArray(g_keycons.colorTypes, g_keycons.colorSelf);
				resetColorType({ _fromObj: storageObj, _from: addKey, _to: g_keycons.colorSelf });
				resetColorType({ _fromObj: storageObj, _from: addKey, _toObj: g_dfColorObj, _to: g_keycons.colorSelf });

			} else {
				if (g_localStorage.colorType === g_keycons.colorSelf) {
					g_colorType = `Default`;
				}
				g_keycons.colorTypes = g_keycons.colorTypes.filter(val => val !== g_keycons.colorSelf);
			}

			const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;

			// カラーグループ、シャッフルグループの設定
			g_keycons.groups.forEach(type => {
				resetGroupList(type, keyCtrlPtn);
				if (g_keyObj.currentPtn === -1) {
					const storageKeyName = storageObj[`${type}${addKey}`] || storageObj[`${type}${g_keyObj.currentKey}_-1_-1`];
					if (storageKeyName !== undefined) {
						g_keyObj[`${type}${g_keyObj.currentKey}_-1`] = structuredClone(storageKeyName);
					}
					g_keyObj[`${type}${g_keyObj.currentKey}_-1_-1`] = structuredClone(g_keyObj[`${type}${g_keyObj.currentKey}_-1`]);
				} else {
					g_keyObj[`${type}${keyCtrlPtn}`] = structuredClone(g_keyObj[`${type}${keyCtrlPtn}_0`]);
				}
			});

		}

		const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
		if (g_headerObj.keyRetryDef === C_KEY_RETRY) {
			g_headerObj.keyRetry = setIntVal(getKeyCtrlVal(g_keyObj[`keyRetry${keyCtrlPtn}`]), g_headerObj.keyRetryDef);
		}
		if (g_headerObj.keyTitleBackDef === C_KEY_TITLEBACK) {
			g_headerObj.keyTitleBack = setIntVal(getKeyCtrlVal(g_keyObj[`keyTitleBack${keyCtrlPtn}`]), g_headerObj.keyTitleBackDef);
		}
	}

	// スクロール設定用の配列を入れ替え
	g_settings.scrolls = structuredClone(
		typeof g_keyObj[`scrollDir${g_keyObj.currentKey}_${g_keyObj.currentPtn}`] === C_TYP_OBJECT ?
			Object.keys(g_keyObj[`scrollDir${g_keyObj.currentKey}_${g_keyObj.currentPtn}`]) : g_keyObj.scrollName_def
	);

	// アシスト設定の配列を入れ替え
	g_settings.autoPlays = (typeof g_keyObj[`assistPos${g_keyObj.currentKey}_${g_keyObj.currentPtn}`] === C_TYP_OBJECT ?
		g_autoPlaysBase.concat(Object.keys(g_keyObj[`assistPos${g_keyObj.currentKey}_${g_keyObj.currentPtn}`])) :
		g_autoPlaysBase.concat());

	// ゲージ設定及びカーソル位置調整
	setGauge(0, true);

	// 速度、スクロール、アシスト設定のカーソル位置調整
	if (_initFlg) {
		g_stateObj.speed = g_headerObj.initSpeeds[g_stateObj.scoreId];
		g_settings.speedNum = getCurrentNo(g_settings.speeds, g_stateObj.speed);
	}
	g_settings.scrollNum = getCurrentNo(g_settings.scrolls, g_stateObj.scroll);
	g_settings.autoPlayNum = getCurrentNo(g_settings.autoPlays, g_stateObj.autoPlay);

	// ---------------------------------------------------
	// 3. 名称の設定

	// 譜面名設定 (Difficulty)
	const difWidth = parseFloat(lnkDifficulty.style.width);
	const keyUnitName = getStgDetailName(getKeyUnitName(g_keyObj.currentKey));
	const difNames = [`${getKeyName(g_keyObj.currentKey)} ${keyUnitName} / ${g_headerObj.difLabels[g_stateObj.scoreId]}`];
	lnkDifficulty.style.fontSize = wUnit(getFontSize(difNames[0], difWidth, getBasicFont(), g_limitObj.setLblSiz));

	if (g_headerObj.makerView) {
		difNames.push(`(${g_headerObj.creatorNames[g_stateObj.scoreId]})`);
		difNames.forEach((difName, j) => {
			const tmpSize = getFontSize(difName, difWidth, getBasicFont(), 14);
			difNames[j] = `<span style="font-size:${wUnit(tmpSize)}">${difName}</span>`;
		});
	}
	lnkDifficulty.innerHTML = difNames.join(``);

	// 速度設定 (Speed)
	setSetting(0, `speed`, ` ${g_lblNameObj.multi}`);

	// リバース設定 (Reverse, Scroll)
	if (g_headerObj.scrollUse) {
		g_stateObj.scroll = g_settings.scrolls[g_settings.scrollNum];
		const [visibleScr, hiddenScr] = (g_settings.scrolls.length > 1 ? [`scroll`, `reverse`] : [`reverse`, `scroll`]);
		document.getElementById(`${visibleScr}Sprite`).style.display = C_DIS_INHERIT;
		document.getElementById(`${hiddenScr}Sprite`).style.display = C_DIS_NONE;
		setSetting(0, visibleScr);

		g_shortcutObj.option.KeyR.id = g_settings.scrolls.includes(`Reverse`) ?
			g_shortcutObj.option.KeyR.exId : g_shortcutObj.option.KeyR.dfId;

		if (g_settings.scrolls.length > 1) {
			setReverseView(document.getElementById(`btnReverse`));
		}
	} else {
		g_settings.scrolls = structuredClone(g_keyObj.scrollName_def);
		setSetting(0, `reverse`);
	}

	// オート・アシスト設定 (AutoPlay)
	g_stateObj.autoPlay = g_settings.autoPlays[g_settings.autoPlayNum];
	lnkAutoPlay.textContent = getStgDetailName(g_stateObj.autoPlay);

	// 譜面明細画面の再描画
	if (g_settings.scoreDetails.length > 0) {
		drawSpeedGraph(g_stateObj.scoreId);
		drawDensityGraph(g_stateObj.scoreId);
		makeDifInfo(g_stateObj.scoreId);
		makeHighScore(g_stateObj.scoreId);
	}

	// ユーザカスタムイベント(初期)
	g_customJsObj.difficulty.forEach(func => func(_initFlg, g_canLoadDifInfoFlg));

	// ---------------------------------------------------
	// 4. 譜面初期情報ロード許可フラグの設定
	g_canLoadDifInfoFlg = true;
};

/**
 * 設定・オプション画面のラベル・ボタン処理の描画
 * @param {Object} _sprite 基準とするスプライト(ここで指定する座標は、そのスプライトからの相対位置)
 */
const createOptionWindow = _sprite => {

	// 各ボタン用のスプライトを作成
	const optionsprite = createEmptySprite(_sprite, `optionsprite`, g_windowObj.optionSprite);

	// 設定毎に個別のスプライトを作成し、その中にラベル・ボタン類を配置
	const spriteList = setSpriteList(g_settingPos.option);

	// ---------------------------------------------------
	// 難易度 (Difficulty)
	// 縦位置: 0 
	spriteList.difficulty.appendChild(createLblSetting(`Difficulty`, -5));

	const lnkDifficulty = makeSettingLblCssButton(`lnkDifficulty`, ``, 0, () => changeDifficulty(), {
		y: -10, h: g_limitObj.setLblHeight + 10, cxtFunc: () => changeDifficulty(-1),
	});

	// 譜面選択ボタン（メイン、右回し、左回し）
	multiAppend(spriteList.difficulty,
		lnkDifficulty,
		makeMiniCssButton(`lnkDifficulty`, `R`, 0, () => nextDifficulty(), { dy: -10, dh: 10 }),
		makeMiniCssButton(`lnkDifficulty`, `L`, 0, () => nextDifficulty(-1), { dy: -10, dh: 10 }),
	);
	createScText(spriteList.difficulty, `Difficulty`);
	if (g_headerObj.difSelectorUse) {
		createScText(spriteList.difficulty, `DifficultyList`, { x: 147, y: -10, targetLabel: `lnkDifficulty` });
	}

	// ---------------------------------------------------
	// ハイスコア機能実装時に使用予定のスペース
	// 縦位置: 1

	// ---------------------------------------------------
	// 速度(Speed)
	// 縦位置: 2  短縮ショートカットあり
	createGeneralSetting(spriteList.speed, `speed`, {
		skipTerms: g_settings.speedTerms, hiddenBtn: true, scLabel: g_lblNameObj.sc_speed, roundNum: 5,
		unitName: ` ${g_lblNameObj.multi}`,
	});
	if (g_headerObj.baseSpeed !== 1) {
		divRoot.appendChild(
			createDivCss2Label(`lblBaseSpd`, `Δv: ${Math.round(g_headerObj.baseSpeed * 100) / 100}x`, g_lblPosObj.lblBaseSpd)
		);
	}

	/**
	 * 譜面明細子画面・グラフの作成
	 * @param {string} _name 
	 * @param {boolean} _graphUseFlg
	 * @returns {HTMLDivElement}
	 */
	const createScoreDetail = (_name, _graphUseFlg = true) => {
		const detailObj = createEmptySprite(scoreDetail, `detail${_name}`, g_windowObj.detailObj);

		if (_graphUseFlg) {
			const graphObj = document.createElement(`canvas`);
			const textBaseObj = document.getElementById(`lnkDifficulty`);
			const bkColor = window.getComputedStyle(textBaseObj, ``).backgroundColor;

			graphObj.id = `graph${_name}`;
			graphObj.width = g_limitObj.graphWidth;
			graphObj.height = g_limitObj.graphHeight;
			graphObj.style.left = wUnit(125);
			graphObj.style.top = wUnit(0);
			graphObj.style.position = `absolute`;
			graphObj.style.background = bkColor;
			graphObj.style.border = `dotted ${wUnit(2)}`;

			detailObj.appendChild(graphObj);
		}

		return detailObj;
	};

	if (g_settings.scoreDetails.length > 0) {
		multiAppend(spriteList.speed,
			createCss2Button(`btnGraphB`, ``, () => true, {
				x: -25, y: -60, w: 0, h: 0, opacity: 0, resetFunc: () => setScoreDetail(true),
			}, g_cssObj.button_Mini),
			createCss2Button(`btnGraph`, `i`, () => true, {
				x: -25, y: -60, w: 30, h: 30, siz: g_limitObj.jdgCharaSiz, title: g_msgObj.graph,
				resetFunc: () => setScoreDetail(), cxtFunc: () => setScoreDetail(),
			}, g_cssObj.button_Mini)
		);
		g_stateObj.scoreDetailViewFlg = false;
		const scoreDetail = createEmptySprite(optionsprite, `scoreDetail`, g_windowObj.scoreDetail, g_cssObj.settings_DifSelector);

		/**
		 * 譜面明細表示の切替
		 * @param {number} _val 
		 */
		const changeScoreDetail = (_val = 0) => {
			if (g_currentPage === `difSelector`) {
				resetDifWindow();
			}
			g_stateObj.scoreDetailViewFlg = true;
			scoreDetail.style.visibility = `visible`;

			// 表示内容を非表示化、ボタン色をデフォルトに戻す
			$id(`detail${g_stateObj.scoreDetail}`).visibility = `hidden`;
			document.getElementById(`lnk${g_stateObj.scoreDetail}G`).classList.replace(g_cssObj.button_Setting, g_cssObj.button_Default);

			// 選択先を表示、ボタン色を選択中に変更
			// Qキーを押したときのリンク先を次の明細へ変更
			g_stateObj.scoreDetail = g_settings.scoreDetails[_val];
			[`option`, `difSelector`].forEach(page => g_shortcutObj[page].KeyQ.id = g_settings.scoreDetailCursors[(_val + 1) % g_settings.scoreDetailCursors.length]);

			$id(`detail${g_stateObj.scoreDetail}`).visibility = `visible`;
			document.getElementById(`lnk${g_stateObj.scoreDetail}G`).classList.replace(g_cssObj.button_Default, g_cssObj.button_Setting);
		};

		multiAppend(scoreDetail,
			createScoreDetail(`Speed`),
			createScoreDetail(`Density`),
			createScoreDetail(`ToolDif`, false),
			createScoreDetail(`HighScore`, false),
		);
		g_settings.scoreDetails.forEach((sd, j) => {
			scoreDetail.appendChild(
				makeDifLblCssButton(`lnk${sd}G`, getStgDetailName(sd), j, () => changeScoreDetail(j), {
					w: g_limitObj.difCoverWidth, h: 20, title: g_msgObj[`s_${sd}`],
					btnStyle: (g_stateObj.scoreDetail === sd ? `Setting` : `Default`),
				})
			);
			createScText(document.getElementById(`lnk${sd}G`), `${sd}G`, { targetLabel: `lnk${sd}G`, x: -5 });
		});
	}

	/**
	 * 譜面明細表示／非表示ボタンの処理
	 * @param {boolean} _resetFlg
	 */
	const setScoreDetail = (_resetFlg = false) => {
		if (g_currentPage === `difSelector`) {
			resetDifWindow();
			g_stateObj.scoreDetailViewFlg = false;
			g_shortcutObj.difSelector.KeyQ.id = g_settings.scoreDetailCursors[0];
		}
		const scoreDetail = document.getElementById(`scoreDetail`);
		const detailObj = document.getElementById(`detail${g_stateObj.scoreDetail}`);
		const visibles = [`hidden`, `visible`];

		g_stateObj.scoreDetailViewFlg = !g_stateObj.scoreDetailViewFlg;
		scoreDetail.style.visibility = visibles[Number(g_stateObj.scoreDetailViewFlg)];
		detailObj.style.visibility = visibles[Number(g_stateObj.scoreDetailViewFlg)];

		// Qキーを押したときのカーソル位置を先頭に初期化
		if (_resetFlg) {
			g_shortcutObj.option.KeyQ.id = g_settings.scoreDetailCursors[0];
		}
	};

	// ---------------------------------------------------
	// 速度モーション (Motion)
	// 縦位置: 3
	createGeneralSetting(spriteList.motion, `motion`);

	// ---------------------------------------------------
	// リバース (Reverse) / スクロール (Scroll)
	// 縦位置: 4
	createGeneralSetting(spriteList.reverse, `reverse`, {
		addRFunc: () => {
			if (g_headerObj.scrollUse && g_settings.scrolls.length > 1) {
				setReverseView(document.getElementById(`btnReverse`));
			}
		}
	});
	if (g_headerObj.scrollUse) {
		createGeneralSetting(spriteList.scroll, `scroll`, { scLabel: g_lblNameObj.sc_scroll });
		[$id(`lnkScroll`).left, $id(`lnkScroll`).width] = [
			wUnit(parseFloat($id(`lnkScroll`).left) + 90), wUnit(parseFloat($id(`lnkScroll`).width) - 90)
		];

		spriteList.scroll.appendChild(
			createCss2Button(`btnReverse`, `${g_lblNameObj.Reverse}:${getStgDetailName(g_stateObj.reverse)}`, evt => setReverse(evt.target),
				Object.assign(g_lblPosObj.btnReverse, {
					cxtFunc: evt => setReverse(evt.target),
				}), g_cssObj.button_Default, g_cssObj[`button_Rev${g_stateObj.reverse}`])
		);
		spriteList[g_settings.scrolls.length > 1 ? `reverse` : `scroll`].style.display = C_DIS_NONE;
	} else {
		spriteList.scroll.style.pointerEvents = C_DIS_NONE;
	}

	// ---------------------------------------------------
	// ミラー・ランダム (Shuffle)
	// 縦位置: 5.5
	createGeneralSetting(spriteList.shuffle, `shuffle`, g_settings.scoreDetails.length > 0 ? {
		addRFunc: () => makeHighScore(g_stateObj.scoreId),
	} : {});

	// ---------------------------------------------------
	// 鑑賞モード設定 (AutoPlay)
	// 縦位置: 6.5
	createGeneralSetting(spriteList.autoPlay, `autoPlay`, g_settings.scoreDetails.length > 0 ? {
		addRFunc: () => makeHighScore(g_stateObj.scoreId),
	} : {});

	// ---------------------------------------------------
	// ゲージ設定 (Gauge)
	// 縦位置: 7.5
	spriteList.gauge.appendChild(createLblSetting(`Gauge`));

	// ゲージ設定詳細 縦位置: ゲージ設定+1
	spriteList.gauge.appendChild(createDivCss2Label(`lblGauge2`, ``, g_lblPosObj.lblGauge2));

	if (g_headerObj.gaugeUse) {
		multiAppend(spriteList.gauge,
			makeSettingLblCssButton(`lnkGauge`, ``, 0, () => setGauge(1), { cxtFunc: () => setGauge(-1) }),
			makeMiniCssButton(`lnkGauge`, `R`, 0, () => setGauge(1)),
			makeMiniCssButton(`lnkGauge`, `L`, 0, () => setGauge(-1)),
		);
		createScText(spriteList.gauge, `Gauge`);
	} else {
		lblGauge.classList.add(g_cssObj.settings_Disabled);
		spriteList.gauge.appendChild(makeDisabledLabel(`lnkGauge`, 0, getStgDetailName(g_stateObj.gauge)));
	}

	// 空押し判定設定 (Excessive)
	if (g_headerObj.excessiveUse) {
		spriteList.gauge.appendChild(
			createCss2Button(`lnkExcessive`, g_lblNameObj.Excessive, evt => setExcessive(evt.target),
				Object.assign(g_lblPosObj.btnExcessive, {
					title: g_msgObj.excessive, cxtFunc: evt => setExcessive(evt.target),
				}), g_cssObj.button_Default, g_cssObj[`button_Rev${g_stateObj.excessive}`])
		);
	} else if (g_headerObj.excessiveJdgUse) {
		spriteList.gauge.appendChild(
			createDivCss2Label(`lnkExcessive`, `${g_lblNameObj.Excessive}:${C_FLG_ON}`,
				Object.assign(g_lblPosObj.btnExcessive, { x: 0, w: 100, border: C_DIS_NONE }), g_cssObj[`button_Disabled${C_FLG_ON}`]
			)
		);
	}

	// ---------------------------------------------------
	// タイミング調整 (Adjustment)
	// 縦位置: 10.5  短縮ショートカットあり
	createGeneralSetting(spriteList.adjustment, `adjustment`, {
		skipTerms: g_settings.adjustmentTerms, hiddenBtn: true, scLabel: g_lblNameObj.sc_adjustment, roundNum: 5,
		unitName: g_lblNameObj.frame, addRFunc: () => viewAdjustment(),
	});

	const viewAdjustment = () => {
		if (g_headerObj.playbackRate !== 1) {
			const adjustmentVal = isLocalMusicFile(g_stateObj.scoreId) ?
				Math.round(g_stateObj.adjustment / g_headerObj.playbackRate) :
				(g_stateObj.adjustment / g_headerObj.playbackRate).toFixed(1);
			document.getElementById(`lnkAdjustment`).innerHTML = `${adjustmentVal}${g_lblNameObj.frame}`
				+ `<span style="font-size:${g_limitObj.adjustmentViewOrgSiz}px"> (${g_stateObj.adjustment.toFixed(1)}${g_localStorage.adjustment === g_stateObj.adjustment ? '*' : ''})</span>`;
			document.getElementById(`lnkAdjustment`).style.fontSize = `${g_limitObj.adjustmentViewSiz}px`;
			document.getElementById(`lnkAdjustment`).style.lineHeight = `${g_limitObj.adjustmentLineHeight}px`;
		}
	};
	viewAdjustment();

	// ---------------------------------------------------
	// フェードイン (Fadein)
	// 縦位置: 11.5 スライダーあり
	spriteList.fadein.appendChild(createLblSetting(`Fadein`));

	const lnkFadein = createDivCss2Label(`lnkFadein`, `${g_stateObj.fadein}${g_lblNameObj.percent}`,
		g_lblPosObj.lnkFadein, g_cssObj.settings_FadeinBar);
	spriteList.fadein.appendChild(lnkFadein);

	const setFadein = _sign => {
		g_stateObj.fadein = nextPos(g_stateObj.fadein, _sign, 100);
		fadeinSlider.value = g_stateObj.fadein;
		lnkFadein.textContent = `${g_stateObj.fadein}${g_lblNameObj.percent}`;
	};

	multiAppend(spriteList.fadein,

		// 右回し・左回しボタン
		makeMiniCssButton(`lnkFadein`, `R`, 0, () => setFadein(1)),
		makeMiniCssButton(`lnkFadein`, `L`, 0, () => setFadein(-1)),

		// フェードインのスライダー処理
		createDivCss2Label(`lblFadeinBar`, `<input id="fadeinSlider" type="range" value="${g_stateObj.fadein}" min="0" max="99" step="1">`,
			g_lblPosObj.lblFadeinBar),

	);

	const fadeinSlider = document.getElementById(`fadeinSlider`);
	fadeinSlider.addEventListener(`input`, () =>
		g_stateObj.fadein = inputSlider(fadeinSlider, lnkFadein), false);

	// ---------------------------------------------------
	// ボリューム (Volume) 
	// 縦位置: 12.5
	createGeneralSetting(spriteList.volume, `volume`, { unitName: g_lblNameObj.percent });

	// 譜面番号の再取得
	g_stateObj.scoreId = getNextDifficulty(g_stateObj.scoreId, 0);
	const keyLists = makeDedupliArray(g_headerObj.viewLists.map(j => g_headerObj.keyLabels[j]));
	g_headerObj.viewKeyLists = keyLists.sort((a, b) => parseInt(a) - parseInt(b));
	g_headerObj.difSelectorUse = getDifSelectorUse(g_rootObj.difSelectorUse);

	// 設定画面の一通りのオブジェクトを作成後に譜面・速度・ゲージ設定をまとめて行う
	setDifficulty(false);
	optionsprite.oncontextmenu = () => false;
};

/**
 * 汎用設定
 * @param {HTMLDivElement} _obj 
 * @param {string} _settingName 
 * @param {string} [object.unitName=''] 設定名の単位
 * @param {number[]} [object.skipTerms] ボタンの設定スキップ間隔(デフォルト:[1(外側), 1(内側), 1(最内側)])
 * @param {boolean} [object.hiddenBtn=false] 隠しボタン(ショートカットキーのみ)の利用有無
 * @param {function} [object.addRFunc] 右側のボタンを押したときの追加処理
 * @param {function} [object.addLFunc] 左側のボタンを押したときの追加処理
 * @param {string} [object.settingLabel=_settingName] 設定名
 * @param {string} [object.displayName] 画面名
 * @param {string} [object.scLabel=''] ショートカットキーの表示名
 * @param {number} [object.roundNum=0] 設定スキップ間隔の丸め基準数
 * @param {number} [object.adjY=0] 設定ボタンのY座標位置
 */
const createGeneralSetting = (_obj, _settingName, { unitName = ``,
	skipTerms = fillArray(3, 1), hiddenBtn = false, addRFunc = () => { }, addLFunc = addRFunc,
	settingLabel = _settingName, displayName = g_currentPage, scLabel = ``, roundNum = 0, adjY = 0 } = {}) => {

	const settingUpper = toCapitalize(_settingName);
	const linkId = `lnk${settingUpper}`;
	const initName = `${getStgDetailName(g_stateObj[_settingName])}${unitName}`;
	_obj.appendChild(createLblSetting(settingUpper, adjY, toCapitalize(settingLabel)));

	if (g_headerObj[`${_settingName}Use`] === undefined || g_headerObj[`${_settingName}Use`]) {

		multiAppend(_obj,
			makeSettingLblCssButton(linkId, `${initName}${g_localStorage[_settingName] === g_stateObj[_settingName] ? ' *' : ''}`, 0,
				() => {
					setSetting(skipTerms[1], _settingName, unitName, roundNum, { func: () => addRFunc() });
				}, {
				cxtFunc: () => {
					setSetting(skipTerms[1] * (-1), _settingName, unitName, roundNum, { func: () => addLFunc() });
				}
			}),

			// 右回し・左回しボタン（外側）
			makeMiniCssButton(linkId, `R`, 0, () =>
				setSetting(skipTerms[0], _settingName, unitName, roundNum, { func: () => addRFunc() })),
			makeMiniCssButton(linkId, `L`, 0, () =>
				setSetting(skipTerms[0] * (-1), _settingName, unitName, roundNum, { func: () => addLFunc() })),
		);

		// 右回し・左回しボタン（内側）
		if (skipTerms[1] > 1) {
			multiAppend(_obj,
				makeMiniCssButton(linkId, `RR`, 0, () =>
					setSetting(skipTerms[1], _settingName, unitName, roundNum, { func: () => addRFunc() })),
				makeMiniCssButton(linkId, `LL`, 0, () =>
					setSetting(skipTerms[1] * (-1), _settingName, unitName, roundNum, { func: () => addLFunc() })),
			);
		}

		// 右回し・左回しボタン（最内側）
		if (skipTerms[2] > 1) {
			multiAppend(_obj,
				makeMiniCssButton(linkId, `RRR`, 0, () =>
					setSetting(skipTerms[2], _settingName, unitName, roundNum, { func: () => addRFunc() })
					, { dw: -g_limitObj.setMiniWidth / 2 }),
				makeMiniCssButton(linkId, `LLL`, 0, () =>
					setSetting(skipTerms[2] * (-1), _settingName, unitName, roundNum, { func: () => addLFunc() })
					, { dw: -g_limitObj.setMiniWidth / 2 }),
			);
		}

		// 右回し・左回しボタン（不可視）
		if (hiddenBtn) {
			multiAppend(_obj,
				makeMiniCssButton(linkId, `HR`, 0, () => setSetting(1, _settingName, unitName, roundNum, { func: () => addRFunc() }), { visibility: `hidden` }),
				makeMiniCssButton(linkId, `HL`, 0, () => setSetting(-1, _settingName, unitName, roundNum, { func: () => addLFunc() }), { visibility: `hidden` }),
			);
		}

		// ショートカットキー表示
		createScText(_obj, settingUpper, { displayName: displayName, dfLabel: scLabel });

	} else {
		document.getElementById(`lbl${settingUpper}`).classList.add(g_cssObj.settings_Disabled);
		_obj.appendChild(makeDisabledLabel(linkId, 0, initName));
	}
};

/**
 * 設定画面用ラベルの作成
 * @param {string} _settingName 
 * @param {number} _adjY 
 * @param {string} _settingLabel 
 * @returns {HTMLDivElement}
 */
const createLblSetting = (_settingName, _adjY = 0, _settingLabel = _settingName) => {
	const lbl = createDivCss2Label(`lbl${_settingName}`, g_lblNameObj[_settingLabel], {
		x: -5, y: _adjY, w: 110,
	}, `settings_${_settingName}`);
	lbl.title = g_msgObj[`${_settingName.charAt(0).toLowerCase()}${_settingName.slice(1)}`];
	return lbl;
};

/**
 * 設定名の置き換え処理
 * @param {string} _name 
 * @returns {string}
 */
const getStgDetailName = _name => {
	return g_lblNameObj[`u_${_name}`] !== undefined &&
		(g_presetObj.lblRenames === undefined || g_presetObj.lblRenames[g_currentPage]) ? g_lblNameObj[`u_${_name}`] : _name;
};

/**
 * 設定メイン・汎用
 * @param {number} _scrollNum 
 * @param {string} _settingName
 * @param {string} [_unitName] 設定の単位名
 * @param {number} [_roundNum] 設定スキップ間隔の丸め基準数
 * @param {function} [object.func] 設定ボタンを押した後の追加処理
 */
const setSetting = (_scrollNum, _settingName, _unitName = ``, _roundNum = 0, { func = () => true } = {}) => {
	let settingNum = g_settings[`${_settingName}Num`];
	const settingList = g_settings[`${_settingName}s`];
	const settingMax = settingList.length - 1;

	// _roundNum単位で丸める
	if (_roundNum > 0 && _scrollNum >= _roundNum) {
		settingNum = Math.floor(settingNum / _roundNum) * _roundNum;
	} else if (_roundNum > 0 && -_scrollNum >= _roundNum) {
		settingNum = Math.ceil(settingNum / _roundNum) * _roundNum;
	}

	if (_scrollNum > 0) {
		settingNum = (settingNum === settingMax ? 0 : Math.min(settingNum + _scrollNum, settingMax));
	} else if (_scrollNum < 0) {
		settingNum = (settingNum === 0 ? settingMax : Math.max(settingNum + _scrollNum, 0));
	}
	g_stateObj[_settingName] = settingList[settingNum];
	g_settings[`${_settingName}Num`] = settingNum;
	document.getElementById(`lnk${toCapitalize(_settingName)}`).textContent =
		`${getStgDetailName(g_stateObj[_settingName])}${_unitName}${g_localStorage[_settingName] === g_stateObj[_settingName] ? ' *' : ''}`;
	func();
};

/**
 * 無効化用ラベル作成
 * @param {string} _id 
 * @param {number} _heightPos 
 * @param {string} _defaultStr 
 * @returns {HTMLDivElement}
 */
const makeDisabledLabel = (_id, _heightPos, _defaultStr) =>
	createDivCss2Label(_id, _defaultStr, {
		x: g_limitObj.setLblLeft, y: g_limitObj.setLblHeight * _heightPos,
	}, g_cssObj.settings_Disabled);

/**
 * 保存済みリバース取得処理
 * @param {object} _localStorage 保存先のローカルストレージ名
 * @param {string} _extraKeyName 特殊キー名(通常キーは省略)
 */
const getKeyReverse = (_localStorage, _extraKeyName = ``) => {
	if (_localStorage[`reverse${_extraKeyName}`] !== undefined && g_headerObj.reverseUse) {
		g_stateObj.reverse = _localStorage[`reverse${_extraKeyName}`] ?? C_FLG_OFF;
		g_settings.reverseNum = roundZero(g_settings.reverses.findIndex(reverse => reverse === g_stateObj.reverse));
	} else {
		setReverseDefault();
	}
};

/**
 * リバースのデフォルト化処理
 */
const setReverseDefault = () => {
	g_stateObj.reverse = C_FLG_OFF;
	g_settings.reverseNum = 0;
};

const setReverse = _btn => {
	if (!g_settings.scrolls.includes(`Reverse`) && g_headerObj.reverseUse) {
		g_settings.reverseNum = (g_settings.reverseNum + 1) % 2;
		g_stateObj.reverse = g_settings.reverses[g_settings.reverseNum];
		setReverseView(_btn);
	}
};

const setReverseView = _btn => {
	_btn.classList.replace(g_cssObj[`button_Rev${g_settings.reverses[(g_settings.reverseNum + 1) % 2]}`],
		g_cssObj[`button_Rev${g_settings.reverses[g_settings.reverseNum]}`]);
	if (!g_settings.scrolls.includes(`Reverse`) && g_headerObj.reverseUse) {
		_btn.textContent = `${g_lblNameObj.Reverse}:${getStgDetailName(g_stateObj.reverse)}`;
	} else {
		_btn.textContent = `X`;
		setReverseDefault();
	}
};

/**
 * ゲージ設定メイン
 * @param {number} _scrollNum 
 * @param {boolean} _gaugeInitFlg
 */
const setGauge = (_scrollNum, _gaugeInitFlg = false) => {

	/**
	 * 数式からゲージ値に変換
	 * arrow[] -> 矢印数, frz[] -> フリーズアロー数, all[] -> 矢印＋フリーズアロー数に置換する
	 * @param {string} _val 
	 * @param {string} _defaultVal
	 * @returns {number}
	 */
	const getGaugeCalc = (_val, _defaultVal) => {
		return setVal(convertStrToVal(
			replaceStr(_val, g_escapeStr.gaugeParamName)?.split(`{0}`).join(g_stateObj.scoreId)
		), _defaultVal, C_TYP_CALC);
	};
	/**
	 * ゲージ詳細一括変更
	 * @param {object} _baseObj 
	 * @param {number} object.magInit
	 * @param {number} object.magRcv
	 * @param {number} object.magDmg
	 */
	const setLifeCategory = (_baseObj, { _magInit = 1, _magRcv = 1, _magDmg = 1 } = {}) => {
		g_stateObj.lifeInit = getGaugeCalc(_baseObj.lifeInits[g_stateObj.scoreId], g_stateObj.lifeInit) * _magInit;
		g_stateObj.lifeRcv = getGaugeCalc(_baseObj.lifeRecoverys[g_stateObj.scoreId], g_stateObj.lifeRcv) * _magRcv;
		g_stateObj.lifeDmg = getGaugeCalc(_baseObj.lifeDamages[g_stateObj.scoreId], g_stateObj.lifeDmg) * _magDmg;
	};

	/**
	 * ライフモード切替
	 * @param {object} _baseObj 
	 */
	const changeLifeMode = (_baseObj) => {
		if (_baseObj.lifeBorders[g_stateObj.scoreId] === `x`) {
			g_stateObj.lifeBorder = 0;
			g_stateObj.lifeMode = C_LFE_SURVIVAL;
		} else {
			g_stateObj.lifeBorder = getGaugeCalc(_baseObj.lifeBorders[g_stateObj.scoreId], g_stateObj.lifeBorder);
			g_stateObj.lifeMode = C_LFE_BORDER;
		}
	};

	// ゲージ初期化

	// カスタムゲージの設定取得
	const defaultCustomGauge = g_gaugeOptionObj.custom0 || g_gaugeOptionObj.customDefault;
	if (hasVal(defaultCustomGauge)) {
		g_gaugeOptionObj.custom = (g_gaugeOptionObj[`custom${g_stateObj.scoreId}`] || defaultCustomGauge).concat();
		g_gaugeOptionObj.varCustom = (g_gaugeOptionObj[`varCustom${g_stateObj.scoreId}`] || g_gaugeOptionObj.varCustom0 || g_gaugeOptionObj.varCustomDefault).concat();
	}

	// ゲージタイプの設定
	changeLifeMode(g_headerObj);
	g_gaugeType = (g_gaugeOptionObj.custom.length > 0 ? C_LFE_CUSTOM : g_stateObj.lifeMode);

	// ゲージ配列を入れ替え
	g_settings.gauges = structuredClone(g_gaugeOptionObj[g_gaugeType.toLowerCase()]);
	g_settings.gaugeNum = getCurrentNo(g_settings.gauges, g_stateObj.gauge);
	g_stateObj.gauge = g_settings.gauges[g_settings.gaugeNum];

	setSetting(_scrollNum, `gauge`);
	g_stateObj.lifeVariable = g_gaugeOptionObj[`var${g_gaugeType}`][g_settings.gaugeNum];

	// デフォルトゲージの設定を適用（g_gaugeOptionObjから取得）
	if (g_settings.gaugeNum !== 0 &&
		(g_gaugeOptionObj.custom.length === 0 ||
			g_gaugeOptionObj.defaultList.includes(g_gaugeOptionObj[`defaultGauge${g_stateObj.scoreId}`]))) {

		const gType = (g_gaugeType === C_LFE_CUSTOM ?
			toCapitalize(g_gaugeOptionObj[`defaultGauge${g_stateObj.scoreId}`]) : g_gaugeType);
		const getGaugeVal = _type => g_gaugeOptionObj[`${_type}${gType}`][g_settings.gaugeNum];
		g_stateObj.lifeMode = getGaugeVal(`type`);
		g_stateObj.lifeBorder = getGaugeVal(`clear`);
		g_stateObj.lifeInit = getGaugeVal(`init`);
		g_stateObj.lifeRcv = getGaugeVal(`rcv`);
		g_stateObj.lifeDmg = getGaugeVal(`dmg`);
	}

	// デフォルトゲージの初期設定（Light, Easyでは回復量を2倍にする）
	if ([`Original`, `Light`, `Normal`, `Easy`].includes(g_stateObj.gauge)) {
		setLifeCategory(g_headerObj, { _magRcv: [`Light`, `Easy`].includes(g_stateObj.gauge) ? 2 : 1 });
	}

	// ゲージ設定別に個別設定した場合はここで設定を上書き
	// 譜面ヘッダー：gaugeXXX で設定した値がここで適用される
	if (hasVal(g_gaugeOptionObj[`gauge${g_stateObj.gauge}s`])) {
		const tmpGaugeObj = g_gaugeOptionObj[`gauge${g_stateObj.gauge}s`];
		if (hasVal(tmpGaugeObj.lifeBorders[g_stateObj.scoreId])) {
			changeLifeMode(tmpGaugeObj);
		}
		setLifeCategory(tmpGaugeObj);
	}

	// ゲージ詳細情報を表示
	lblGauge2.innerHTML = gaugeFormat(g_stateObj.lifeMode,
		g_stateObj.lifeBorder, g_stateObj.lifeRcv, g_stateObj.lifeDmg, g_stateObj.lifeInit, g_stateObj.lifeVariable);
};

/**
 * ゲージ設定の詳細表示を整形
 * @param {string} _mode 
 * @param {number} _border 
 * @param {number} _rcv 
 * @param {number} _dmg 
 * @param {number} _init 
 * @param {string} _lifeValFlg 
 * @returns {string}
 */
const gaugeFormat = (_mode, _border, _rcv, _dmg, _init, _lifeValFlg) => {
	const initVal = g_headerObj.maxLifeVal * _init / 100;
	const borderVal = g_headerObj.maxLifeVal * _border / 100;

	// 整形用にライフ初期値を整数、回復・ダメージ量を小数第1位で丸める
	const init = Math.round(initVal);
	const borderText = (_mode === C_LFE_BORDER && _border !== 0 ? Math.round(borderVal) : `-`);
	const toFixed2 = _val => Math.round(_val * 100) / 100;

	let rcvText = toFixed2(_rcv), dmgText = toFixed2(_dmg);
	let realRcv = _rcv, realDmg = _dmg;
	const allCnt = sumData(g_detailObj.arrowCnt[g_stateObj.scoreId]) +
		(g_headerObj.frzStartjdgUse ? 2 : 1) * sumData(g_detailObj.frzCnt[g_stateObj.scoreId]);

	if (_lifeValFlg === C_FLG_ON) {
		rcvText = ``, dmgText = ``;
		if (allCnt > 0) {
			realRcv = Math.min(calcLifeVal(_rcv, allCnt), g_headerObj.maxLifeVal);
			realDmg = Math.min(calcLifeVal(_dmg, allCnt), g_headerObj.maxLifeVal);
			rcvText = `${toFixed2(realRcv)}<br>`;
			dmgText = `${toFixed2(realDmg)}<br>`;
		}
		rcvText += `<span class="settings_lifeVal">(${toFixed2(_rcv)})</span>`;
		dmgText += `<span class="settings_lifeVal">(${toFixed2(_dmg)})</span>`;
	}

	// 達成率(Accuracy)・許容ミス数の計算
	const [rateText, allowableCntsText] = getAccuracy(borderVal, realRcv, realDmg, initVal, allCnt);
	g_workObj.requiredAccuracy = rateText;

	return `<div id="gaugeDivCover" class="settings_gaugeDivCover">
		<div id="lblGaugeDivTable" class="settings_gaugeDivTable">
			<div id="lblGaugeStart" class="settings_gaugeDivTableCol settings_gaugeStart">
				${g_lblNameObj.g_start}
			</div>
			<div id="lblGaugeBorder" class="settings_gaugeDivTableCol settings_gaugeEtc">
				${g_lblNameObj.g_border}
			</div>
			<div id="lblGaugeRecovery" class="settings_gaugeDivTableCol settings_gaugeEtc">
				${g_lblNameObj.g_recovery}
			</div>
			<div id="lblGaugeDamage" class="settings_gaugeDivTableCol settings_gaugeEtc">
				${g_lblNameObj.g_damage}
			</div>
			<div id="lblGaugeRate" class="settings_gaugeDivTableCol settings_gaugeEtc">
				${g_lblNameObj.g_rate}
			</div>
		</div>
		<div id="dataGaugeDivTable" class="settings_gaugeDivTable">
			<div id="dataGaugeStart" class="settings_gaugeDivTableCol settings_gaugeVal settings_gaugeStart">
				${init}/${g_headerObj.maxLifeVal}
			</div>
			<div id="dataGaugeBorder" class="settings_gaugeDivTableCol settings_gaugeVal settings_gaugeEtc">
				${borderText}
			</div>
			<div id="dataGaugeRecovery" class="settings_gaugeDivTableCol settings_gaugeVal settings_gaugeEtc">
				${rcvText}
			</div>
			<div id="dataGaugeDamage" class="settings_gaugeDivTableCol settings_gaugeVal settings_gaugeEtc">
				${dmgText}
			</div>
			<div id="dataGaugeRate" class="settings_gaugeDivTableCol settings_gaugeVal settings_gaugeEtc" title="${allowableCntsText}">
				${rateText}
			</div>
		</div>
	</div>
	`;
};

/**
 * 達成率、許容ミス数の取得
 * @param {number} _border 
 * @param {number} _rcv 
 * @param {number} _dmg 
 * @param {number} _init 
 * @param {number} _allCnt 
 * @returns {string[]}
 */
const getAccuracy = (_border, _rcv, _dmg, _init, _allCnt) => {
	const justPoint = _rcv + _dmg > 0 ? Math.max(_border - _init + _dmg * _allCnt, 0) / (_rcv + _dmg) : 0;
	const minRecovery = (_border === 0 ? Math.floor(justPoint + 1) : Math.ceil(justPoint));
	const rate = Math.max(minRecovery / _allCnt * 100, 0);
	let rateText = _allCnt > 0 ? (rate <= 100 ? `${rate.toFixed(2)}%` : `<span class="settings_lifeVal">${rate.toFixed(2)}%</span>`) : `----`;

	// 許容ミス数の計算
	const allowableCnts = Math.min(_allCnt - minRecovery, _allCnt);
	let allowableCntsText = _allCnt > 0 ? (allowableCnts >= 0 ? `${allowableCnts}miss↓` : `Impossible (${allowableCnts}miss)`) : ``;

	if ((_rcv === 0 && _dmg === 0) || _rcv < 0 || _dmg < 0) {
		rateText = `----`;
		allowableCntsText = ``;
	}
	return [rateText, allowableCntsText];
};

/**
 * 空押し判定の設定
 * @param {HTMLDivElement} _btn
 */
const setExcessive = _btn => {
	g_settings.excessiveNum = (g_settings.excessiveNum + 1) % 2;
	g_stateObj.excessive = g_settings.excessives[g_settings.excessiveNum];
	_btn.classList.replace(g_cssObj[`button_Rev${g_settings.excessives[(g_settings.excessiveNum + 1) % 2]}`],
		g_cssObj[`button_Rev${g_settings.excessives[g_settings.excessiveNum]}`]);
};

/**
 * 保存済みキーコンフィグ取得処理
 * @param {object} _localStorage 保存先のローカルストレージ名
 * @param {string} _extraKeyName 特殊キー名(通常キーは省略)
 */
const getKeyCtrl = (_localStorage, _extraKeyName = ``) => {
	g_keyObj.storagePtn = _localStorage[`keyCtrlPtn${_extraKeyName}`];
	const basePtn = `${g_keyObj.currentKey}_${g_keyObj.storagePtn}`;
	const baseKeyNum = g_keyObj[`${g_keyObj.defaultProp}${basePtn}`].length;

	if (_localStorage[`keyCtrl${_extraKeyName}`]?.[0].length > 0) {
		const prevPtn = g_keyObj.currentPtn;
		g_keyObj.currentPtn = -1;
		const copyPtn = `${g_keyObj.currentKey}_-1`;
		g_keyObj[`keyCtrl${copyPtn}`] = [...Array(baseKeyNum)].map(() => []);
		g_keyObj[`keyCtrl${copyPtn}d`] = [...Array(baseKeyNum)].map(() => []);

		for (let j = 0; j < baseKeyNum; j++) {
			for (let k = 0; k < g_keyObj[`keyCtrl${basePtn}`][j].length; k++) {
				g_keyObj[`keyCtrl${copyPtn}d`][j][k] = g_keyObj[`keyCtrl${copyPtn}`][j][k] = _localStorage[`keyCtrl${_extraKeyName}`][j][k];
			}
		}

		const isUpdate = prevPtn !== -1 && g_keyObj.prevKey !== g_keyObj.currentKey;
		g_keyCopyLists.multiple.filter(header => g_keyObj[`${header}${basePtn}`] !== undefined && isUpdate)
			.forEach(header => g_keyObj[`${header}${copyPtn}`] = structuredClone(g_keyObj[`${header}${basePtn}`]));
		g_keyCopyLists.simple.forEach(header => g_keyObj[`${header}${copyPtn}`] = g_keyObj[`${header}${basePtn}`]);

		g_keycons.groups.forEach(type => {
			let maxPtn = 0;
			while (g_keyObj[`${type}${basePtn}_${maxPtn}`] !== undefined) {
				maxPtn++;
			}
			for (let j = 0; j < maxPtn; j++) {
				g_keyObj[`${type}${copyPtn}_${j}`] = structuredClone(g_keyObj[`${type}${basePtn}_${j}`]);
			}
			g_keyObj[`${type}${copyPtn}_0d`] = structuredClone(g_keyObj[`${type}${copyPtn}_0`]);
		});
	}
};

/**
 * 設定・オプション表示用ボタン
 * @param {string} _id 
 * @param {string} _name 初期設定文字
 * @param {number} _heightPos 上からの配置順
 * @param {function} _func 通常ボタン処理
 * @param {number} [object.x]
 * @param {number} [object.y]
 * @param {number} [object.w]
 * @param {number} [object.h]
 * @param {number} [object.siz]
 * @param {function} [object.cxtFunc] 右クリック時の処理
 * @param {...any} [object.rest]
 * @param {...any} _classes 追加するクラス
 * @returns {HTMLDivElement}
 */
const makeSettingLblCssButton = (_id, _name, _heightPos, _func, {
	x = g_limitObj.setLblLeft, y = g_limitObj.setLblHeight * _heightPos,
	w = g_limitObj.setLblWidth, h = g_limitObj.setLblHeight, siz = g_limitObj.setLblSiz,
	cxtFunc = () => true, ...rest } = {}, ..._classes) =>
	createCss2Button(_id, _name, _func, { x, y, w, h, siz, cxtFunc, ...rest }, g_cssObj.button_Default, ..._classes);

/**
 * 譜面変更セレクター用ボタン
 * @param {string} _id
 * @param {string} _name 初期設定文字
 * @param {number} _heightPos 上からの配置順
 * @param {function} _func
 * @param {number} [object.x]
 * @param {number} [object.h]
 * @param {number} [object.y=h*_heightPos]
 * @param {number} [object.w]
 * @param {number} [object.siz]
 * @param {string} [object.btnStyle='Default']
 * @returns {HTMLDivElement}
 */
const makeDifLblCssButton = (_id, _name, _heightPos, _func, {
	x = 0, h = g_limitObj.setLblHeight, y = h * _heightPos,
	w = g_limitObj.difSelectorWidth, siz = g_limitObj.difSelectorSiz, btnStyle = `Default` } = {}) =>
	createCss2Button(_id, _name, _func, {
		x, y, w, h, siz, borderStyle: `solid`, title: g_msgObj[_id] ?? ``,
	}, g_cssObj[`button_${btnStyle}`], g_cssObj.button_ON);

/**
 * 設定・オプション用の設定変更ミニボタン
 * @param {string} _id 
 * @param {string} _directionFlg 表示用ボタンのどちら側に置くかを設定。(R, RR:右、L, LL:左)
 * @param {number} _heightPos 上からの配置順
 * @param {function} _func 
 * @param {number} [object.dx=0]
 * @param {number} [object.dy=0]
 * @param {number} [object.dw=0]
 * @param {number} [object.dh=0]
 * @param {number} [object.dsiz=0]
 * @param {string} [object.visibility='visible']
 * @returns {HTMLDivElement}
 */
const makeMiniCssButton = (_id, _directionFlg, _heightPos, _func, { dx = 0, dy = 0, dw = 0, dh = 0, dsiz = 0, visibility = `visible` } = {}) =>
	createCss2Button(`${_id}${_directionFlg}`, g_settingBtnObj.chara[_directionFlg], _func, {
		x: g_settingBtnObj.pos[_directionFlg] + dx, y: g_limitObj.setLblHeight * _heightPos + dy,
		w: g_limitObj.setMiniWidth + dw, h: g_limitObj.setLblHeight + dh, siz: g_limitObj.setLblSiz + dsiz, visibility,
	}, g_cssObj.button_Mini);

/**
 * カラーグループ、シャッフルグループの再設定
 * @param {string} _type 
 * @param {string} _keyCtrlPtn
 */
const resetGroupList = (_type, _keyCtrlPtn) => {
	let k = 1;
	g_keycons[`${_type}Groups`] = [0];

	if (g_keyObj.currentPtn === -1) {
		g_keycons[`${_type}Groups`] = addValtoArray(g_keycons[`${_type}Groups`], -1);
	}
	g_keycons[`${_type}GroupNum`] = Math.min(g_keyObj.currentPtn, 0);
	while (g_keyObj[`${_type}${_keyCtrlPtn}_${k}`] !== undefined) {
		g_keycons[`${_type}Groups`].push(k);
		k++;
	}
};

/*-----------------------------------------------------------*/
/* Scene : SETTINGS-DISPLAY [lemon] */
/*-----------------------------------------------------------*/

const settingsDisplayInit = () => {

	clearWindow(true);
	const divRoot = document.getElementById(`divRoot`);
	g_currentPage = `settingsDisplay`;

	// 譜面初期情報ロード許可フラグ
	g_canLoadDifInfoFlg = false;

	// タイトル文字描画
	divRoot.appendChild(getTitleDivLabel(`lblTitle`, g_lblNameObj.display, 0, 15, `settings_Display`));

	// オプションボタン用の設置
	createSettingsDisplayWindow(divRoot);

	// ショートカットキーメッセージ
	divRoot.appendChild(createDescDiv(`scMsg`, g_lblNameObj.sdShortcutDesc));

	// ユーザカスタムイベント(初期)
	g_customJsObj.settingsDisplay.forEach(func => func());

	// ボタン描画
	commonSettingBtn(`Settings`);

	// キー操作イベント（デフォルト）
	setShortcutEvent(g_currentPage);
	document.oncontextmenu = () => true;

	g_skinJsObj.settingsDisplay.forEach(func => func());
};

/**
 * 設定・オプション画面のラベル・ボタン処理の描画
 * @param {Object} _sprite 基準とするスプライト(ここで指定する座標は、そのスプライトからの相対位置)
 */
const createSettingsDisplayWindow = _sprite => {

	/**
	 * Display表示/非表示ボタン
	 * @param {string} _name 
	 * @param {number} _heightPos 縦位置
	 * @param {number} _widthPos 横位置
	 */
	const makeDisplayButton = (_name, _heightPos, _widthPos) => {

		const flg = g_stateObj[`d_${_name.toLowerCase()}`];
		const linkId = `lnk${_name}`;

		if (g_headerObj[`${_name}Use`]) {

			// 設定名、CSS名(2種)、表示名
			const list = [C_FLG_OFF, C_FLG_ON].concat(g_settings[`d_${_name}s`] || []);
			const cssBarList = [C_FLG_OFF, C_FLG_ON].concat(Array(g_settings[`d_${_name}s`]?.length).fill(g_settings.d_cssBarExName) || []);
			const cssBgList = [g_settings.d_cssBgName, g_settings.d_cssBgName].concat(Array(g_settings[`d_${_name}s`]?.length).fill(g_settings.d_cssBgExName) || []);
			const lbls = [toCapitalize(_name), toCapitalize(_name)].concat(g_settings[`d_${_name}s`] || []);

			const dispView = () => [C_FLG_OFF, C_FLG_ON].includes(g_stateObj[`d_${_name.toLowerCase()}`]) ?
				g_lblNameObj[`d_${toCapitalize(_name)}`] : getStgDetailName(lbls[g_settings.displayNum[_name]]);

			const withShortCutDesc = () => createScText(document.getElementById(linkId), `${toCapitalize(_name)}`,
				{ displayName: g_currentPage, targetLabel: linkId, x: -5 });

			/**
			 * Displayボタン処理
			 * @param {number} _scrollNum 
			 * @param {boolean} _filterFlg 
			 */
			const switchDisplay = (_scrollNum = 1, _filterFlg = true) => {
				const prevDisp = g_settings.displayNum[_name];
				const [prevBarColor, prevBgColor] = [cssBarList[prevDisp], cssBgList[prevDisp]];

				g_settings.displayNum[_name] = (prevDisp + _scrollNum) % (_filterFlg ? 2 : list.length);
				const nextDisp = g_settings.displayNum[_name];
				const [nextBarColor, nextBgColor] = [cssBarList[nextDisp], cssBgList[nextDisp]];

				g_stateObj[`d_${_name.toLowerCase()}`] = list[g_settings.displayNum[_name]];
				document.getElementById(linkId).innerHTML = dispView();
				document.getElementById(linkId).classList.replace(g_cssObj[`button_${prevBarColor}`], g_cssObj[`button_${nextBarColor}`]);
				document.getElementById(linkId).classList.replace(g_cssObj[`button_${prevBgColor}`], g_cssObj[`button_${nextBgColor}`]);

				withShortCutDesc();
				interlockingButton(g_headerObj, _name, nextBarColor, prevBarColor, true);
			};

			// Displayボタン初期化
			g_settings.displayNum[_name] = list.findIndex(flg => flg === g_stateObj[`d_${_name.toLowerCase()}`]);
			displaySprite.appendChild(
				makeSettingLblCssButton(linkId, dispView(), _heightPos, () => switchDisplay(), {
					x: 30 + 180 * _widthPos, w: 170,
					title: g_msgObj[`d_${_name.toLowerCase()}`], borderStyle: `solid`,
					cxtFunc: () => switchDisplay(-1),
				}, `button_${cssBgList[g_settings.displayNum[_name]]}`, `button_${cssBarList[g_settings.displayNum[_name]]}`)
			);
			withShortCutDesc();

			// Display切替ボタン（ON/OFF以外用）
			if (g_settings[`d_${_name}s`] !== undefined) {
				displaySprite.appendChild(
					makeSettingLblCssButton(`${linkId}R`, `>`, _heightPos, () => switchDisplay(1, false), {
						x: 175 + 180 * _widthPos, w: 25,
					}, g_cssObj.button_Mini)
				);
			}
		} else {
			displaySprite.appendChild(
				createDivCss2Label(linkId, g_lblNameObj[`d_${toCapitalize(_name)}`] + `:${g_headerObj[`${_name}Set`]}`, {
					x: 30 + 180 * _widthPos, y: 3 + g_limitObj.setLblHeight * _heightPos,
					w: 170, siz: g_limitObj.difSelectorSiz,
				}, g_cssObj[`button_Disabled${flg}`])
			);
		}
	};

	// 各ボタン用のスプライトを作成
	const optionsprite = createEmptySprite(_sprite, `optionsprite`, g_windowObj.optionSprite);

	// 設定毎に個別のスプライトを作成し、その中にラベル・ボタン類を配置
	const displaySprite = createEmptySprite(optionsprite, `displaySprite`, g_windowObj.displaySprite);
	const spriteList = setSpriteList(g_settingPos.settingsDisplay);

	_sprite.appendChild(createDivCss2Label(`sdDesc`, g_lblNameObj.sdDesc, g_lblPosObj.sdDesc));
	g_displays.forEach((name, j) => makeDisplayButton(name, j % 7, Math.floor(j / 7)));

	// ---------------------------------------------------
	// 矢印の見え方 (Appearance)
	// 縦位置: 7.4
	createGeneralSetting(spriteList.appearance, `appearance`, {
		addRFunc: () => dispAppearanceSlider(),
	});

	// Hidden+/Sudden+初期値用スライダー、ロックボタン
	multiAppend(spriteList.appearance,
		createDivCss2Label(`lblAppearancePos`, `${g_hidSudObj.distH[g_stateObj.appearance](g_hidSudObj.filterPos)}`, g_lblPosObj.lblAppearancePos),
		createDivCss2Label(`lblAppearanceBar`, `<input id="appearanceSlider" type="range" value="${g_hidSudObj.filterPos}" min="0" max="100" step="1">`,
			g_lblPosObj.lblAppearanceBar),
		createCss2Button(`lnkLockBtn`, g_lblNameObj.filterLock, evt => setLockView(evt.target),
			Object.assign(g_lblPosObj.lnkLockBtn, {
				cxtFunc: evt => setLockView(evt.target),
			}), g_cssObj.button_Default, g_cssObj[`button_Rev${g_stateObj.filterLock}`]),
	);

	const setLockView = (_btn) => {
		const prevLock = g_stateObj.filterLock;
		g_settings.filterLockNum = (g_settings.filterLockNum + 1) % 2;
		g_stateObj.filterLock = g_settings.filterLocks[g_settings.filterLockNum];

		_btn.classList.replace(g_cssObj[`button_Rev${prevLock}`],
			g_cssObj[`button_Rev${g_stateObj.filterLock}`]);
	};

	const appearanceSlider = document.getElementById(`appearanceSlider`);
	appearanceSlider.addEventListener(`input`, () =>
		g_hidSudObj.filterPos = inputSliderAppearance(appearanceSlider, lblAppearancePos), false);

	const dispAppearanceSlider = () => {
		[`lblAppearanceBar`, `lnkLockBtn`, `lnkfilterLine`].forEach(obj =>
			$id(obj).visibility = g_appearanceRanges.includes(g_stateObj.appearance) ? `Visible` : `Hidden`);
		inputSliderAppearance(appearanceSlider, lblAppearancePos);
	};
	dispAppearanceSlider();

	// ---------------------------------------------------
	// 判定表示系の不透明度 (Opacity)
	// 縦位置: 9
	g_headerObj.opacityUse = false;
	[`judgment`, `fastSlow`, `filterLine`].forEach(display =>
		g_headerObj.opacityUse ||= g_headerObj[`${display}Use`] || g_headerObj[`${display}Set`] === C_FLG_ON);

	createGeneralSetting(spriteList.opacity, `opacity`, { unitName: g_lblNameObj.percent });

	// ---------------------------------------------------
	// タイミング調整 (HitPosition)
	// 縦位置: 10
	createGeneralSetting(spriteList.hitPosition, `hitPosition`, {
		skipTerms: g_settings.hitPositionTerms, scLabel: g_lblNameObj.sc_hitPosition, roundNum: 5,
		unitName: g_lblNameObj.pixel,
	});
};

/**
 * Displayボタンを切り替えたときに連動して切り替えるボタンの設定
 * @param {object} _headerObj 
 * @param {string} _name 
 * @param {string} _current 変更元
 * @param {string} _next 変更先
 * @param {boolean} _buttonFlg ボタンフラグ (false: 初期, true: ボタン)
 */
const interlockingButton = (_headerObj, _name, _current, _next, _buttonFlg = false) => {
	let includeDefaults = [];
	if (g_stateObj[`d_${_name.toLowerCase()}`] === C_FLG_OFF) {
		g_displays.forEach(option => {
			if (option === _name) {
				return;
			}
			if (g_stateObj[`d_${option.toLowerCase()}`] === C_FLG_ON && _headerObj[`${option}Default`] !== undefined) {
				includeDefaults = includeDefaults.concat(_headerObj[`${option}ChainOFF`]);
			}
		});
	}

	if (_headerObj[`${_name}ChainOFF`].length !== 0) {

		// 連動してOFFにするボタンの設定
		_headerObj[`${_name}ChainOFF`].filter(defaultOption => !includeDefaults.includes(defaultOption))
			.forEach(defaultOption => {
				g_stateObj[`d_${defaultOption.toLowerCase()}`] = _next;
				if (_buttonFlg) {
					let txtDisabled = ``;
					if (!g_headerObj[`${defaultOption}Use`]) {
						txtDisabled = `Disabled`;
						document.getElementById(`lnk${defaultOption}`).textContent = `${toCapitalize(defaultOption)}:${_next}`;
					}
					document.getElementById(`lnk${defaultOption}`).classList.replace(g_cssObj[`button_${txtDisabled}${_current}`], g_cssObj[`button_Disabled${_next}`]);
				}
				// さらに連動する場合は設定を反転
				interlockingButton(_headerObj, defaultOption, _next, _current, _buttonFlg);
			});
	}
};

/*-----------------------------------------------------------*/
/* Scene : EX-SETTINGS [apple] */
/*-----------------------------------------------------------*/

const exSettingInit = () => {
	clearWindow(true);
	g_currentPage = `exSetting`;

	multiAppend(divRoot,

		// 画面タイトル
		getTitleDivLabel(`lblTitle`,
			`<div class="settings_Title">EX-</div><div class="settings_Title2">SETTINGS</div>`
				.replace(/[\t\n]/g, ``), 0, 15, g_cssObj.flex_centering),

	);

	// 各ボタン用のスプライトを作成
	createEmptySprite(divRoot, `optionsprite`, g_windowObj.optionSprite);
	const spriteList = setSpriteList(g_settingPos.exSetting);

	createGeneralSetting(spriteList.playWindow, `playWindow`);
	lblPlayWindow.title += g_headerObj.heightLockFlg ? g_msgObj.sideScrollDisable : g_msgObj.sideScrollMsg;

	createGeneralSetting(spriteList.stepArea, `stepArea`);
	createGeneralSetting(spriteList.frzReturn, `frzReturn`);
	createGeneralSetting(spriteList.shaking, `shaking`);
	createGeneralSetting(spriteList.effect, `effect`, {
		addRFunc: () => {
			g_stateObj.d_arroweffect = boolToSwitch(g_stateObj.effect !== C_FLG_OFF || g_headerObj.arrowEffectSetFlg);
			g_headerObj.arrowEffectUse = g_stateObj.effect === C_FLG_OFF && g_headerObj.arrowEffectUseOrg;
			g_headerObj.arrowEffectSet = g_stateObj.d_arroweffect;
		},
	});
	createGeneralSetting(spriteList.camoufrage, `camoufrage`);
	createGeneralSetting(spriteList.swapping, `swapping`);
	createGeneralSetting(spriteList.judgRange, `judgRange`, {
		addRFunc: () => {
			[g_judgObj.arrowJ, g_judgObj.frzJ] = g_judgRanges[g_stateObj.judgRange];
			lblJudgRangeView.innerHTML = getJudgRangeView();
		}
	});
	createGeneralSetting(spriteList.autoRetry, `autoRetry`);

	// 判定範囲の設定を表示
	const getJudgRangeView = () => `| ` +
		`<span class="common_ii">${g_lblNameObj.j_ii}</span>: ≦ <b>±${g_judgObj.arrowJ[0]} f</b> | ` +
		`<span class="common_shakin">${g_lblNameObj.j_shakin}</span>: ≦ <b>±${g_judgObj.arrowJ[1]} f</b> | ` +
		`<span class="common_matari">${g_lblNameObj.j_matari}</span>: ≦ <b>±${g_judgObj.arrowJ[2]} f</b> | <br>| ` +
		`<span class="common_shobon">${g_lblNameObj.j_shobon}</span>: ≦ <b>±${g_judgObj.arrowJ[3]} f</b> | ` +
		`<span class="common_uwan">${g_lblNameObj.j_uwan}</span>: > <b>±${g_judgObj.arrowJ[3]} f</b> | <br>| ` +
		`<span class="common_kita">${g_lblNameObj.j_kita}</span>: ≦ <b>±${g_judgObj.frzJ[1]} f</b> | ` +
		`<span class="common_iknai">${g_lblNameObj.j_iknai}</span>: > <b>±${g_judgObj.frzJ[1]} f</b> |`;

	multiAppend(judgRangeSprite,
		createDivCss2Label(`lblJudgRangeView`, getJudgRangeView(), {
			x: parseFloat($id(`lblJudgRange`).left) + 10, y: parseFloat($id(`lblJudgRange`).top) + 25, w: 300, h: 30, siz: 13,
			align: C_ALIGN_LEFT,
		}),
	);

	// ユーザカスタムイベント(初期)
	g_customJsObj.exSetting.forEach(func => func());

	// 設定系のボタン群をまとめて作成（Data Save, Display切替, Back, KeyConfig, Playボタン）
	commonSettingBtn(g_currentPage);

	// キー操作イベント（デフォルト）
	setShortcutEvent(g_currentPage, () => true, { dfEvtFlg: true });
	document.oncontextmenu = () => true;

	g_skinJsObj.exSetting.forEach(func => func());
};

/*-----------------------------------------------------------*/
/* Scene : KEYCONFIG [orange] */
/*-----------------------------------------------------------*/

/**
 * キーコンフィグ画面初期化
 * @param {string} _kcType
 */
const keyConfigInit = (_kcType = g_kcType) => {

	clearWindow(true);
	const divRoot = document.getElementById(`divRoot`);
	g_kcType = _kcType;
	g_currentPage = `keyConfig`;
	let selectedKc = `Default`;

	// 譜面初期情報ロード許可フラグ
	g_canLoadDifInfoFlg = false;

	multiAppend(divRoot,

		// キーコンフィグ画面タイトル
		getTitleDivLabel(`lblTitle`,
			`<div class="settings_Title">${g_lblNameObj.key}</div><div class="settings_Title2">${g_lblNameObj.config}</div>`
				.replace(/[\t\n]/g, ``), 0, 15, g_cssObj.flex_centering),

		createDescDiv(`kcDesc`, g_lblNameObj.kcDesc.split(`{0}`).join(g_kCd[C_KEY_RETRY])
			.split(`{1}:`).join(g_isMac ? `` : `Delete:`)),

		createDescDiv(`kcShuffleDesc`, g_headerObj.shuffleUse ? g_lblNameObj.kcShuffleDesc : g_lblNameObj.kcNoShuffleDesc),
	);

	// キーの一覧を表示
	const keyconSprite = createEmptySprite(divRoot, `keyconSprite`, g_windowObj.keyconSprite);
	const tkObj = getKeyInfo();
	const [keyCtrlPtn, keyNum, posMax, divideCnt] =
		[tkObj.keyCtrlPtn, tkObj.keyNum, tkObj.posMax, tkObj.divideCnt];

	g_keyCopyLists.simpleDef.forEach(header => updateKeyInfo(header, keyCtrlPtn));
	keyconSprite.style.transform = `scale(${g_keyObj.scale})`;
	keyconSprite.style.height = `${parseFloat(keyconSprite.style.height) / ((1 + g_keyObj.scale) / 2)}px`;
	const kWidth = parseInt(keyconSprite.style.width);
	changeSetColor();

	const maxLeftPos = Math.max(divideCnt, posMax - divideCnt - 2) / 2;
	const maxLeftX = Math.min(0, (kWidth - C_ARW_WIDTH) / 2 - maxLeftPos * g_keyObj.blank);

	g_keycons.cursorNumList = [...Array(keyNum).keys()].map(i => i);
	const configKeyGroupList = g_headerObj.keyGroupOrder[g_stateObj.scoreId] ??
		g_keyObj[`keyGroupOrder${keyCtrlPtn}`] ?? tkObj.keyGroupList;
	g_keycons.colorCursorNum = 0;

	/**
	 * keyconSpriteのスクロール位置調整
	 * @param {number} _targetX 
	 */
	const adjustScrollPoint = _targetX => {
		if (maxLeftX !== 0) {
			keyconSprite.scrollLeft = Math.max(0, _targetX - g_sWidth / 2);
		}
	};

	/**
	 * キーコンフィグ用の矢印色を取得
	 * @param {number} _j
	 * @param {number} _colorPos
	 * @returns {string} 
	 */
	const getKeyConfigColor = (_j, _colorPos) => {
		let arrowColor = g_headerObj.setColor[_colorPos];
		if (typeof g_keyObj[`assistPos${keyCtrlPtn}`] === C_TYP_OBJECT &&
			!g_autoPlaysBase.includes(g_stateObj.autoPlay)) {
			if (g_keyObj[`assistPos${keyCtrlPtn}`][g_stateObj.autoPlay][_j] === 1) {
				arrowColor = g_headerObj.setDummyColor[_colorPos];
			}
		}
		return arrowColor;
	};

	/**
	 * 対象割り当てキーの色変更
	 * @param {number} _j 
	 * @param {number} _k 
	 * @param {string} _cssName 
	 */
	const changeKeyConfigColor = (_j, _k, _cssName) =>
		changeConfigColor(document.getElementById(`keycon${_j}_${_k}`), _cssName);

	/**
	 * 一時的に矢印色・シャッフルグループを変更（共通処理）
	 * @param {string} _type 
	 * @param {number} _len 
	 * @param {number} _j 
	 * @param {number} _scrollNum 
	 * @returns {number}
	 */
	const changeTmpData = (_type, _len, _j, _scrollNum) => {
		const tmpNo = nextPos(g_keyObj[`${_type}${keyCtrlPtn}_${g_keycons[`${_type}GroupNum`]}`][_j], _scrollNum, _len);
		g_keyObj[`${_type}${keyCtrlPtn}`][_j] = tmpNo;
		g_keyObj[`${_type}${keyCtrlPtn}_${g_keycons[`${_type}GroupNum`]}`][_j] = tmpNo;

		return tmpNo;
	};

	/**
	 * 一時的に矢印色を変更
	 * @param {number} _j
	 * @param {number} _scrollNum 
	 */
	const changeTmpColor = (_j, _scrollNum = 1) => {
		changeTmpData(`color`, g_headerObj.setColor.length, _j, _scrollNum);
		const arrowColor = getKeyConfigColor(_j, g_keyObj[`color${keyCtrlPtn}`][_j]);
		$id(`arrow${_j}`).background = arrowColor;
		$id(`arrowShadow${_j}`).background = getShadowColor(g_keyObj[`color${keyCtrlPtn}`][_j], arrowColor);

		adjustScrollPoint(parseFloat($id(`arrow${_j}`).left));
	};

	/**
	 * 一時的にシャッフルグループ番号を変更
	 * @param {number} _j 
	 * @param {number} _scrollNum 
	 */
	const changeTmpShuffleNum = (_j, _scrollNum = 1) => {
		const tmpShuffle = changeTmpData(`shuffle`, g_keyObj[`keyCtrl${keyCtrlPtn}`].length - 1, _j, _scrollNum);
		document.getElementById(`sArrow${_j}`).textContent = tmpShuffle + 1;

		changeShuffleConfigColor(keyCtrlPtn, g_keyObj[`shuffle${keyCtrlPtn}_${g_keycons.shuffleGroupNum}`][_j], _j);
		adjustScrollPoint(parseFloat($id(`arrow${_j}`).left));
	};

	const addLeft = (maxLeftX === 0 ? 0 : - maxLeftX + g_limitObj.kcColorPickerX);
	for (let j = 0; j < keyNum; j++) {

		const posj = g_keyObj[`pos${keyCtrlPtn}`][j];
		const stdPos = posj - ((posj > divideCnt ? posMax : 0) + divideCnt) / 2;

		const keyconX = g_keyObj.blank * stdPos + (kWidth - C_ARW_WIDTH) / 2 + addLeft;
		const keyconY = C_KYC_HEIGHT * (Number(posj > divideCnt)) + 12;
		const colorPos = g_keyObj[`color${keyCtrlPtn}`][j];
		const arrowColor = getKeyConfigColor(j, colorPos);

		keyconSprite.appendChild(
			createCss2Button(`color${j}`, ``, () => changeTmpColor(j), {
				x: keyconX, y: keyconY, w: C_ARW_WIDTH, h: C_ARW_WIDTH,
				cxtFunc: () => changeTmpColor(j, -1),
			}, g_cssObj.button_Default_NoColor, g_cssObj.title_base)
		);
		// キーコンフィグ表示用の矢印・おにぎりを表示
		multiAppend(keyconSprite,
			// 矢印の塗り部分
			createColorObject2(`arrowShadow${j}`, {
				x: keyconX, y: keyconY, background: hasVal(g_headerObj[`setShadowColor${g_colorType}`][colorPos]) ? getShadowColor(colorPos, arrowColor) : ``,
				rotate: g_keyObj[`stepRtn${keyCtrlPtn}_${g_keycons.stepRtnGroupNum}`][j], styleName: `Shadow`, pointerEvents: `none`,
			}),
			// 矢印本体
			createColorObject2(`arrow${j}`, {
				x: keyconX, y: keyconY, background: arrowColor, rotate: g_keyObj[`stepRtn${keyCtrlPtn}_${g_keycons.stepRtnGroupNum}`][j], pointerEvents: `none`,
			}),
		);
		if (g_headerObj.shuffleUse && g_keyObj[`shuffle${keyCtrlPtn}`] !== undefined) {
			keyconSprite.appendChild(
				createCss2Button(`sArrow${j}`, ``, () => changeTmpShuffleNum(j), {
					x: keyconX, y: keyconY - 12, w: C_ARW_WIDTH, h: 15, siz: 12, fontWeight: `bold`,
					pointerEvents: (g_settings.shuffles.filter(val => val.endsWith(`+`)).length > 0 ? `auto` : `none`),
					cxtFunc: () => changeTmpShuffleNum(j, -1),
				}, g_cssObj.button_Default_NoColor, g_cssObj.title_base)
			);
		}

		// 割り当て先のキー名を表示
		for (let k = 0; k < g_keyObj[`keyCtrl${keyCtrlPtn}`][j].length; k++) {
			g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k] = setIntVal(g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]);
			g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k] = setIntVal(g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k]);

			keyconSprite.appendChild(
				createCss2Button(`keycon${j}_${k}`, g_kCd[g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]], () => {
					g_currentj = j;
					g_currentk = k;
					g_prevKey = -1;
					selectedKc = `Default`;
					g_keycons.cursorNum = g_keycons.cursorNumList.findIndex(val => val === g_currentj);
					setKeyConfigCursor();
				}, {
					x: keyconX - 5, y: 50 + C_KYC_REPHEIGHT * k + keyconY,
					w: C_ARW_WIDTH + 10, h: C_KYC_REPHEIGHT, siz: g_limitObj.keySetSiz,
				}, g_cssObj.button_Default_NoColor, g_cssObj.title_base)
			);

			// キーに色付け
			if (g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k] !== g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]) {
				changeKeyConfigColor(j, k, g_cssObj.keyconfig_Changekey);
			} else if (g_keyObj.currentPtn === -1) {
				changeKeyConfigColor(j, k, g_cssObj.keyconfig_Defaultkey);
			}
		}
	}
	const posj = g_keyObj[`pos${keyCtrlPtn}`][0];

	// カーソルの作成
	const cursor = keyconSprite.appendChild(createImg(`cursor`, g_imgObj.cursor,
		(kWidth - C_ARW_WIDTH) / 2 + g_keyObj.blank * (posj - divideCnt / 2) - 10, 57, 15, 30));
	cursor.style.transitionDuration = `0.125s`;

	const viewGroupObj = {
		shuffle: (_type = ``) => {
			if (g_keyObj[`shuffle${keyCtrlPtn}`] !== undefined) {
				for (let j = 0; j < keyNum; j++) {
					document.getElementById(`sArrow${j}`).textContent = g_keyObj[`shuffle${keyCtrlPtn}${_type}`][j] + 1;
				}
			}
		},
		color: (_type = ``) => {
			for (let j = 0; j < keyNum; j++) {
				const colorPos = g_keyObj[`color${keyCtrlPtn}${_type}`][j];
				const arrowColor = getKeyConfigColor(j, colorPos);
				$id(`arrow${j}`).background = arrowColor;
				$id(`arrowShadow${j}`).background = hasVal(g_headerObj.setShadowColor[colorPos]) ?
					getShadowColor(colorPos, arrowColor) : ``;
				if (g_headerObj.setShadowColor[colorPos] === `Default`) {
					$id(`arrowShadow${j}`).opacity = 0.5;
				}
			}
		},
		stepRtn: (_type = ``) => { },
	};

	/**
	 * カラー・シャッフルグループ設定の表示
	 * - シャッフルグループではデフォルトからの差異表示もここで行う
	 * @param {string} _type 
	 */
	const viewGroup = _type => {
		if (g_headerObj[`${_type}Use`]) {
			const num = g_keycons[`${_type}GroupNum`] === -1 ? g_keycons.groupSelf : g_keycons[`${_type}GroupNum`] + 1;
			if (document.getElementById(`lnk${toCapitalize(_type)}Group`) !== null) {
				document.getElementById(`lnk${toCapitalize(_type)}Group`).textContent = getStgDetailName(num);
			}
			viewGroupObj[_type](`_${g_keycons[`${_type}GroupNum`]}`);

			if (_type === `shuffle`) {
				changeShuffleConfigColor(keyCtrlPtn, g_keyObj[`shuffle${keyCtrlPtn}_${g_keycons.shuffleGroupNum}`]);
			}
		}
	};
	/**
	 * カラー・シャッフルグループ設定
	 * @param {string} _type 
	 * @param {number} [_scrollNum=1] 
	 */
	const setGroup = (_type, _scrollNum = 1) => {
		g_keycons[`${_type}GroupNum`] = g_keycons[`${_type}Groups`][getNextNum(_scrollNum, `${_type}Groups`, g_keycons[`${_type}GroupNum`])];
		g_keyObj[`${_type}${keyCtrlPtn}`] = structuredClone(g_keyObj[`${_type}${keyCtrlPtn}_${g_keycons[`${_type}GroupNum`]}`]);
		viewGroup(_type);
		if (_type === `stepRtn`) {
			keyConfigInit(g_kcType);
		}
	};

	/**
	 * キーコンフィグ用設定ラベル
	 * @param {string} _id 
	 * @param {string} _name 
	 * @param {number} [object.x=g_btnX(5 / 6)]
	 * @param {number} [object.y=0]
	 * @param {number} [object.w=g_btnWidth(1 / 6)]
	 * @param {number} [object.h=20]
	 * @param {number} [object.siz=12]
	 * @param {string} [object.align='left']
	 * @param {...any} [object.rest]
	 * @param {...any} _classes 
	 * @returns {HTMLDivElement}
	 */
	const makeKCButtonHeader = (_id, _name, {
		x = g_btnX(5 / 6) - 30, y = 0, w = g_btnWidth(1 / 6), h = 20, siz = 12, align = C_ALIGN_LEFT, ...rest
	} = {}, ..._classes) => createDivCss2Label(_id, g_lblNameObj[_name], { x, y, w, h, siz, align, ...rest }, ..._classes);

	/**
	 * キーコンフィグ用設定ボタン
	 * @param {string} _id 
	 * @param {string} _text 
	 * @param {function} _func 
	 * @param {number} [object.x=g_btnX(5 / 6) - 20]
	 * @param {number} [object.y=15]
	 * @param {number} [object.w=g_btnWidth(1 / 6)]
	 * @param {number} [object.h=18]
	 * @param {number} [object.siz=g_limitObj.jdgCntsSiz]
	 * @param {string} [object.borderStyle='solid']
	 * @param {function} [object.cxtFunc]
	 * @param {...any} [object.rest]
	 * @param {string} [_mainClass=g_cssObj.button_RevOFF] 
	 * @param  {...any} _classes 
	 * @returns {HTMLDivElement}
	 */
	const makeKCButton = (_id, _text, _func, { x = g_btnX(5 / 6) - 20, y = 15, w = g_btnWidth(1 / 6), h = 18,
		siz = g_limitObj.jdgCntsSiz, borderStyle = `solid`, cxtFunc, ...rest } = {}, _mainClass = g_cssObj.button_RevOFF, ..._classes) =>
		makeSettingLblCssButton(_id, getStgDetailName(_text), 0, _func, { x, y, w, h, siz, cxtFunc, borderStyle, ...rest }, _mainClass, ..._classes);

	/**
	 * キーコンフィグ用ミニボタン
	 * @param {string} _id 
	 * @param {string} _directionFlg 
	 * @param {function} _func 
	 * @param {number} [object.x=g_btnX(5 / 6) - 30]
	 * @param {number} [object.y=15]
	 * @param {number} [object.w=15]
	 * @param {number} [object.h=20]
	 * @param {number} [object.siz=g_limitObj.mainSiz]
	 */
	const makeMiniKCButton = (_id, _directionFlg, _func, { x = g_btnX(5 / 6) - 30, y = 15, w = 15, h = 20, siz = g_limitObj.mainSiz } = {}) =>
		createCss2Button(`${_id}${_directionFlg}`, g_settingBtnObj.chara[_directionFlg], _func, { x, y, w, h, siz }, g_cssObj.button_Mini);

	/**
	 * キーコンフィグ用グループ設定ラベル・ボタンの作成
	 * @param {string} _type 
	 * @param {number} [object.baseX=g_btnX(5 / 6) - 20]
	 * @param {number} [object.baseY=0]
	 * @param {string} [object.cssName]
	 */
	const makeGroupButton = (_type, { baseX = g_btnX(5 / 6) - 20, baseY = 0, cssName } = {}) => {
		if (g_headerObj[`${_type}Use`] && g_keycons[`${_type}Groups`].length > 1) {
			const typeName = toCapitalize(_type);
			multiAppend(divRoot,
				makeKCButtonHeader(`lbl${_type}Group`, `${typeName}Group`, { x: baseX - 10, y: baseY }, cssName),
				makeKCButton(`lnk${typeName}Group`, ``, () => setGroup(_type), {
					x: baseX, y: baseY + 13, w: g_btnWidth(1 / 18), title: g_msgObj[`${_type}Group`], cxtFunc: () => setGroup(_type, -1),
				}),
				makeMiniKCButton(`lnk${typeName}Group`, `L`, () => setGroup(_type, -1), { x: baseX - 10, y: baseY + 13 }),
				makeMiniKCButton(`lnk${typeName}Group`, `R`, () => setGroup(_type), { x: baseX + g_btnWidth(1 / 18), y: baseY + 13 }),
			);
		} else {
			g_keycons[`${_type}GroupNum`] = 0;
		}
		viewGroup(_type);
	};

	const kcSubX = parseFloat(keyconSprite.style.width) * ((1 - g_keyObj.scale) / 4);
	const kcSubY = parseFloat(keyconSprite.style.height) / ((1 + g_keyObj.scale) / 2) - parseFloat(keyconSprite.style.height);
	multiAppend(divRoot,

		// ショートカットキーメッセージ
		createDescDiv(`scMsg`, g_lblNameObj.kcShortcutDesc, { altId: `scKcMsg` }),

		// タイトルバックのショートカットキー変更
		createCss2Button(`scTitleBack`, getScMsg.TitleBack(), () => {
			if (!g_isMac) {
				cursor.style.left = wUnit(g_btnX(1 / 4) - kcSubX);
				cursor.style.top = wUnit(g_sHeight - 160 + kcSubY);
				selectedKc = `TitleBack`;
			}
		}, g_lblPosObj.scTitleBack, g_cssObj.button_Default_NoColor,
			g_headerObj.keyTitleBack === g_headerObj.keyTitleBackDef2 ?
				g_cssObj.title_base : g_cssObj.keyconfig_Changekey),

		// リトライのショートカットキー変更
		createCss2Button(`scRetry`, getScMsg.Retry(), () => {
			cursor.style.left = wUnit(g_btnX(5 / 8) + kcSubX);
			cursor.style.top = wUnit(g_sHeight - 160 + kcSubY);
			selectedKc = `Retry`;
		}, g_lblPosObj.scRetry, g_cssObj.button_Default_NoColor,
			g_headerObj.keyRetry === g_headerObj.keyRetryDef2 ?
				g_cssObj.title_base : g_cssObj.keyconfig_Changekey),

		// 別キーモード警告メッセージ
		createDivCss2Label(
			`kcMsg`,
			hasVal(g_keyObj[`transKey${keyCtrlPtn}`]) ? g_lblNameObj.transKeyDesc : ``,
			g_lblPosObj.kcMsg, g_cssObj.keyconfig_warning
		),

		// キーカラータイプ切替ボタン
		makeKCButtonHeader(`lblcolorType`, `ColorType`, { x: 10 + g_btnX() }, g_cssObj.keyconfig_ColorType),
		makeKCButton(`lnkColorType`, g_colorType, () => setColorType(), {
			x: 20 + g_btnX(), title: g_msgObj.colorType, cxtFunc: () => setColorType(-1),
		}),
		makeMiniKCButton(`lnkColorType`, `L`, () => setColorType(-1), { x: 10 + g_btnX() }),
		makeMiniKCButton(`lnkColorType`, `R`, () => setColorType(), { x: 20 + g_btnX(1 / 6) }),
	);

	if (g_headerObj.imgType.length > 1) {
		const [imgBaseX, imgBaseY] = [20 + g_btnX(), 50];
		multiAppend(divRoot,
			// オブジェクトタイプの切り替え（リロードあり）
			makeKCButtonHeader(`lblImgType`, `ImgType`, { x: imgBaseX - 10, y: 37 }, g_cssObj.keyconfig_ConfigType),
			makeKCButton(`lnkImgType`, g_imgType, () => setImgType(), {
				x: imgBaseX, y: imgBaseY, title: g_msgObj.imgType, cxtFunc: () => setImgType(-1),
			}),
			makeMiniKCButton(`lnkImgType`, `L`, () => setImgType(-1), { x: imgBaseX - 10, y: imgBaseY }),
			makeMiniKCButton(`lnkImgType`, `R`, () => setImgType(), { x: imgBaseX + g_btnWidth(1 / 6), y: imgBaseY }),
		);
	}

	// カラー/シャッフルグループ切替ボタン（カラー/シャッフルパターンが複数ある場合のみ）
	makeGroupButton(`color`, { cssName: g_cssObj.keyconfig_ColorGr });
	makeGroupButton(`shuffle`, { baseX: g_btnX(11 / 12) - 10, cssName: g_cssObj.keyconfig_ShuffleGr });
	makeGroupButton(`stepRtn`, { baseY: 37, cssName: g_cssObj.keyconfig_StepRtnGr });

	/**
	 * カーソル位置の設定
	 */
	const setKeyConfigCursor = () => {
		const posj = g_keyObj[`pos${keyCtrlPtn}`][g_currentj];
		const stdPos = posj - ((posj > divideCnt ? posMax : 0) + divideCnt) / 2;

		const nextLeft = (kWidth - C_ARW_WIDTH) / 2 + g_keyObj.blank * stdPos + addLeft - 10;
		cursor.style.left = wUnit(nextLeft);
		cursor.style.top = wUnit(C_KYC_HEIGHT * Number(posj > divideCnt) + 57 + C_KYC_REPHEIGHT * g_currentk);
		g_kcType = (g_currentk === 0 ? `Main` : `Replaced`);

		// 次の位置が見えなくなったらkeyconSpriteの位置を調整する
		adjustScrollPoint(nextLeft);
	};

	/**
	 * カーソル位置の変更
	 * @param {number} [_nextj] 次のカーソル位置
	 */
	const changeConfigCursor = (_nextj = ++g_keycons.cursorNum % g_keycons.cursorNumList.length) => {
		g_keycons.cursorNum = _nextj;

		g_currentj = g_keycons.cursorNumList[_nextj];
		g_currentk = 0;
		if (g_kcType === `Replaced`) {
			g_currentk = 1;

			// 代替キー設定の場合は次の代替キーが見つかるまで移動
			while (g_keyObj[`keyCtrl${keyCtrlPtn}`][g_currentj][1] === undefined) {
				g_keycons.cursorNum = (g_keycons.cursorNum + 1) % g_keycons.cursorNumList.length;
				g_currentj = g_keycons.cursorNumList[g_keycons.cursorNum];

				// 一周して対象が無い場合は代替キーが無いため処理を抜ける（無限ループ対策）
				if (g_keycons.cursorNum === _nextj) {
					g_kcType = `Main`;
					g_currentk = 0;
					break;
				}
			}
		}
		setKeyConfigCursor();
	};

	/**
	 * 次のカーソル位置の取得
	 * @param {number} _scrollNum 
	 * @param {string} _groupName 
	 * @param {string} _target 
	 * @returns {number}
	 */
	const getNextNum = (_scrollNum, _groupName, _target) =>
		nextPos(g_keycons[_groupName].findIndex(value => value === _target), _scrollNum, g_keycons[_groupName].length);

	/**
	 * ConfigTypeの制御
	 * @param {number} _scrollNum 
	 */
	const setConfigType = (_scrollNum = 1) => {
		g_kcType = g_keycons.configTypes[getNextNum(_scrollNum, `configTypes`, g_kcType)];
		changeConfigCursor(g_keycons.cursorNum);
	};

	/**
	 * 一部のキーコンフィグを表示する
	 * （キーグループ毎にフィルターされたもののみを表示する）
	 * @param {number} _num 
	 */
	const appearConfigSteps = _num => {

		const appearConfigView = (_j, _display) => {
			$id(`arrow${_j}`).display = _display;
			$id(`arrowShadow${_j}`).display = _display;
			$id(`color${_j}`).display = _display;
			if (document.getElementById(`sArrow${_j}`) !== null) {
				$id(`sArrow${_j}`).display = _display;
			}
			const ctrlPtn = g_keyObj[`keyCtrl${g_headerObj.keyLabels[g_stateObj.scoreId]}_${g_keyObj.currentPtn}`][_j];
			for (let k = 0; k < ctrlPtn.length; k++) {
				$id(`keycon${_j}_${k}`).display = _display;
			}
		};

		g_keycons.keySwitchNum = _num;
		g_keycons.cursorNumList = [];
		for (let j = 0; j < keyNum; j++) {
			appearConfigView(j, C_DIS_NONE);

			if (tkObj.keyGroupMaps[j].includes(configKeyGroupList[_num])) {
				g_keycons.cursorNumList.push(j);
				appearConfigView(j, C_DIS_INHERIT);
			}
		}
		if (g_keycons.cursorNumList.length === 0) {
			appearConfigSteps(0);
		} else {
			changeConfigCursor(0);

			// keySwitchボタンを一旦非選択にして、選択中のものを再度色付け
			if (configKeyGroupList.length > 1) {
				for (let j = 0; j < configKeyGroupList.length; j++) {
					document.getElementById(`key${j}`).classList.replace(g_cssObj.button_Next, g_cssObj.button_Mini);
				}
				document.getElementById(`key${_num}`).classList.replace(g_cssObj.button_Mini, g_cssObj.button_Next);
			}
		}
	};

	/**
	 * ColorPickerの色切替
	 * @param {number} _j 
	 * @param {string} _type 
	 * @param {string} _color 
	 */
	const changeColorPicker = (_j, _type, _color) => {
		if (_color !== ``) {
			document.getElementById(`pick${_type}${_j}`).value = _color.slice(0, 7);
			$id(`pick${_type}${_j}`).display = C_DIS_INHERIT;
		} else {
			$id(`pick${_type}${_j}`).display = C_DIS_NONE;
		}
	};

	/**
	 * ColorPickerに対応する実際の番号を取得
	 * @param {number} _j 
	 */
	const getGroupNum = _j => _j + g_keycons.colorCursorNum * g_limitObj.kcColorPickerNum;

	/**
	 * ColorPicker（一式）の切替
	 */
	const changeColorPickers = () => {
		lnkColorR.innerHTML = `[${g_keycons.colorCursorNum + 1} /`;
		for (let j = 0; j < g_limitObj.kcColorPickerNum; j++) {
			const m = getGroupNum(j);
			changeColorPicker(j, `arrow`, g_headerObj.setColor[m]);
			changeColorPicker(j, `arrowShadow`, g_headerObj.setShadowColor[m]);
			changeColorPicker(j, `frz`, g_headerObj.frzColor[m][0]);
			changeColorPicker(j, `frzBar`, g_headerObj.frzColor[m][1]);
		}
	};

	/**
	 * ColorTypeの制御
	 * @param {number} [_scrollNum=1] 
	 * @param {boolean} [_reloadFlg=true]
	 */
	const setColorType = (_scrollNum = 1, _reloadFlg = true) => {
		const nextNum = getNextNum(_scrollNum, `colorTypes`, g_colorType);
		g_colorType = g_keycons.colorTypes[nextNum];
		if (g_headerObj.colorUse) {
			g_stateObj.d_color = boolToSwitch(g_keycons.colorDefTypes.findIndex(val => val === g_colorType) !== -1);
		}
		changeSetColor();
		viewGroupObj.color(`_${g_keycons.colorGroupNum}`);
		lnkColorType.textContent = `${getStgDetailName(g_colorType)}${g_localStorage.colorType === g_colorType ? ' *' : ''}`;
		if (_reloadFlg) {
			colorPickSprite.style.display = ([`Default`, `Type0`].includes(g_colorType) ? C_DIS_NONE : C_DIS_INHERIT);
			g_keycons.colorCursorNum = g_keycons.colorCursorNum % Math.ceil(g_headerObj.setColor.length / g_limitObj.kcColorPickerNum);
			changeColorPickers();
		}
	};

	/**
	 * ImgTypeの制御
	 * @param {number} [_scrollNum=1] 
	 */
	const setImgType = (_scrollNum = 1) => {
		const nextNum = getNextNum(_scrollNum, `imgTypes`, g_imgType);
		g_imgType = g_keycons.imgTypes[nextNum];
		g_stateObj.rotateEnabled = g_headerObj.imgType[nextNum].rotateEnabled;
		g_stateObj.flatStepHeight = g_headerObj.imgType[nextNum].flatStepHeight;

		updateImgType(g_headerObj.imgType[nextNum]);
		keyConfigInit(g_kcType);
	};

	const colorPickSprite = createEmptySprite(divRoot, `colorPickSprite`, Object.assign({ title: g_msgObj.pickArrow }, g_windowObj.colorPickSprite));
	if ([`Default`, `Type0`].includes(g_colorType)) {
		colorPickSprite.style.display = C_DIS_NONE;
	}
	multiAppend(colorPickSprite,

		// ColorPickerの切替
		createCss2Button(`lnkColorR`, `[${g_keycons.colorCursorNum + 1} /`, () => {
			g_keycons.colorCursorNum = (g_keycons.colorCursorNum + 1) % Math.ceil(g_headerObj.setColor.length / g_limitObj.kcColorPickerNum);
			changeColorPickers();
		}, g_lblPosObj.lnkColorR, g_cssObj.button_Start),

		// 矢印の配色をフリーズアローへ反映
		createCss2Button(`lnkColorCopy`, `↓]`, () => {
			if (window.confirm(g_msgObj.colorCopyConfirm)) {
				for (let j = 0; j < g_headerObj.setColor.length; j++) {
					g_headerObj.frzColor[j] = g_headerObj[`frzColor${g_colorType}`][j] =
						fillArray(g_headerObj[`frzColor${g_colorType}`][j].length, g_headerObj[`setColor${g_colorType}`][j]);
				}
				for (let j = 0; j < g_limitObj.kcColorPickerNum; j++) {
					const m = getGroupNum(j);
					[``, `Bar`].forEach((val, k) =>
						document.getElementById(`pickfrz${val}${j}`).value = g_headerObj[`frzColor${g_colorType}`][m][k]);
				}
			}
		}, g_lblPosObj.lnkColorCopy, g_cssObj.button_Start),

		createDivCss2Label(`lblPickArrow`, g_lblNameObj.s_arrow, Object.assign({ y: 0 }, g_lblPosObj.pickPos)),
		createDivCss2Label(`lblPickFrz`, g_lblNameObj.s_frz, Object.assign({ y: 140 }, g_lblPosObj.pickPos)),

		// ColorPickerの色を元に戻す
		createCss2Button(`lnkColorReset`, g_lblNameObj.b_cReset, () => {
			if (window.confirm(g_msgObj.colorResetConfirm)) {
				resetColorType({ _from: g_colorType, _to: ``, _fromObj: g_dfColorObj });
				resetColorType({ _from: g_colorType, _to: g_colorType, _fromObj: g_dfColorObj });

				// 影矢印が未指定の場合はType1, Type2の影矢印指定を無くす
				if (!hasVal(g_headerObj[`setShadowColor${setScoreIdHeader(g_stateObj.scoreId)}Default`][0]) &&
					[`Type1`, `Type2`].includes(g_colorType)) {

					g_headerObj.setShadowColor = fillArray(g_headerObj.setColorInit.length, ``);
					g_headerObj[`setShadowColor${g_colorType}`] = fillArray(g_headerObj.setColorInit.length, ``);
				}

				changeColorPickers();
				viewGroupObj.color(`_${g_keycons.colorGroupNum}`);
			}
		}, g_lblPosObj.lnkColorReset, g_cssObj.button_Reset),
	);

	/**
	 * ColorPicker部分の作成
	 * @param {number} _j 
	 * @param {string} _type 
	 * @param {function} _func 
	 * @param {number} [object.x=0]
	 * @param {number} [object.y=15] 
	 */
	const createColorPickWindow = (_j, _type, _func, { x = 0, y = 15 } = {}) =>
		createColorPicker(colorPickSprite, `pick${_type}${_j}`, _func, { x, y: y + 25 * _j });

	for (let j = 0; j < g_limitObj.kcColorPickerNum; j++) {
		createColorPickWindow(j, `arrow`, () => {
			g_headerObj[`setColor${g_colorType}`][getGroupNum(j)] = document.getElementById(`pickarrow${j}`).value;
			setColorType(0, false);
		});

		createColorPickWindow(j, `arrowShadow`, () => {
			g_headerObj[`setShadowColor${g_colorType}`][getGroupNum(j)] = `${document.getElementById(`pickarrowShadow${j}`).value}80`;
			setColorType(0, false);
		}, { x: 25 });

		[``, `Bar`].forEach((val, k) =>
			createColorPickWindow(j, `frz${val}`, () => {
				g_headerObj[`frzColor${g_colorType}`][getGroupNum(j)][k] = document.getElementById(`pickfrz${val}${j}`).value;
			}, { x: 25 * k, y: 155 }));
	}

	// ConfigType, ColorTypeの初期設定
	setConfigType(0);
	setColorType(0);
	keyconSprite.scrollLeft = - maxLeftX;

	// キーパターン表示
	const lblTransKey = hasVal(g_keyObj[`transKey${keyCtrlPtn}`]) ? `(${g_keyObj[`transKey${keyCtrlPtn}`] ?? ''})` : ``;

	/**
	 * キーパターン検索
	 * @param {number} _tempPtn 
	 * @param {number} _sign 
	 * @param {boolean} [_transKeyUse=false] 
	 * @param {boolean} [_skipFlg=false]
	 */
	const searchPattern = (_tempPtn, _sign, _transKeyUse = false, _skipFlg = false) => {
		let nextPtn = _tempPtn + _sign;
		const initialPtn = hasVal(g_keyObj[`keyCtrl${g_keyObj.currentKey}_-1`]) ? -1 : 0;

		const searchStart = () => {
			if (!hasVal(g_keyObj[`keyCtrl${g_keyObj.currentKey}_${nextPtn}`])) {
				nextPtn = 0;
				while (hasVal(g_keyObj[`keyCtrl${g_keyObj.currentKey}_${nextPtn}`])) {
					nextPtn -= _sign;
				}
				nextPtn += _sign;
			}
		};

		const searchNextGroup = () => {
			while (nextPtn !== initialPtn &&
				g_keyObj[`transKey${g_keyObj.currentKey}_${_tempPtn}`] === g_keyObj[`transKey${g_keyObj.currentKey}_${nextPtn}`] &&
				hasVal(g_keyObj[`keyCtrl${g_keyObj.currentKey}_${nextPtn}`])) {
				nextPtn += _sign;
			}
		};

		searchStart();
		if (_skipFlg) {
			searchNextGroup();
			searchStart();
		}
		if (!_transKeyUse) {
			while (hasVal(g_keyObj[`transKey${g_keyObj.currentKey}_${nextPtn}`])) {
				nextPtn += _sign;
			}
			searchStart();
		}
		return nextPtn;
	};

	/**
	 * キーパターン変更時処理
	 * @param {number} [_sign=1] 
	 * @param {boolean} [_skipFlg=false]
	 */
	const changePattern = (_sign = 1, _skipFlg = false) => {

		// キーパターンの変更
		g_keyObj.currentPtn = searchPattern(g_keyObj.currentPtn, _sign, g_headerObj.transKeyUse, _skipFlg);

		// カラーグループ、シャッフルグループの再設定
		g_keycons.groups.forEach(type => resetGroupList(type, `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`));

		// キーコンフィグ画面を再呼び出し
		keyConfigInit();

		// シャッフルグループのデフォルト値からの差異表示（色付け）
		// 再描画後で無いと色付けできないため、keyConfigInit() 実行後に処理
		if (g_headerObj.shuffleUse) {
			changeShuffleConfigColor(`${g_keyObj.currentKey}_${g_keyObj.currentPtn}`, g_keyObj[`shuffle${g_keyObj.currentKey}_${g_keyObj.currentPtn}_${g_keycons.shuffleGroupNum}`]);
		}
	};

	// ユーザカスタムイベント(初期)
	g_customJsObj.keyconfig.forEach(func => func());

	// 部分キー表示用ボタン描画
	if (configKeyGroupList.length > 1) {
		multiAppend(divRoot,
			createDivCss2Label(`lblkey`, `KeySwitch`, g_lblPosObj.lblkey));
		configKeyGroupList.forEach((val, j) =>
			divRoot.appendChild(
				createCss2Button(`key${j}`, `${j + 1}`, () => appearConfigSteps(j),
					Object.assign({ y: 110 + j * 20 }, g_lblPosObj.lnkKeySwitch), g_cssObj.button_Mini),
			));
	}

	// カーソル位置の初期化
	appearConfigSteps(g_keycons.keySwitchNum);

	// ラベル・ボタン描画
	multiAppend(divRoot,

		// 設定画面へ戻る
		createCss2Button(`btnBack`, g_lblNameObj.b_settings, () => {
			g_currentj = 0;
			g_currentk = 0;
			g_prevKey = 0;
		}, Object.assign(g_lblPosObj.btnKcBack, {
			resetFunc: () => g_moveSettingWindow(false),
		}), g_cssObj.button_Back),

		createDivCss2Label(`lblPattern`, `${g_lblNameObj.KeyPattern}: ${g_keyObj.currentPtn === -1 ?
			'Self' : g_keyObj.currentPtn + 1}${lblTransKey}`, g_lblPosObj.lblPattern),

		// パターン変更ボタン描画(右回り)
		createCss2Button(`btnPtnChangeR`, `>`, () => true, Object.assign(g_lblPosObj.btnPtnChangeR, {
			resetFunc: () => changePattern(),
		}), g_cssObj.button_Mini),

		// パターン変更ボタン描画(左回り)
		createCss2Button(`btnPtnChangeL`, `<`, () => true, Object.assign(g_lblPosObj.btnPtnChangeL, {
			resetFunc: () => changePattern(-1),
		}), g_cssObj.button_Mini),

		// パターン変更ボタン描画(右回り/別キーモード間スキップ)
		createCss2Button(`btnPtnChangeRR`, `|>`, () => true, Object.assign(g_lblPosObj.btnPtnChangeRR, {
			resetFunc: () => changePattern(1, true),
		}), g_cssObj.button_Setting),

		// パターン変更ボタン描画(左回り/別キーモード間スキップ)
		createCss2Button(`btnPtnChangeLL`, `<|`, () => true, Object.assign(g_lblPosObj.btnPtnChangeLL, {
			resetFunc: () => changePattern(-1, true),
		}), g_cssObj.button_Setting),

		// キーコンフィグリセットボタン描画
		createCss2Button(`btnReset`, g_lblNameObj.b_reset, () => {
			if (window.confirm(g_msgObj.keyResetConfirm)) {
				const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;

				for (let m = 0; m < g_keycons.cursorNumList.length; m++) {
					const j = g_keycons.cursorNumList[m];
					for (let k = 0; k < g_keyObj[`keyCtrl${keyCtrlPtn}`][j].length; k++) {
						g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k] = setIntVal(g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k]);
						document.getElementById(`keycon${j}_${k}`).textContent = g_kCd[g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]];
						changeKeyConfigColor(j, k, g_keyObj.currentPtn === -1 ? g_cssObj.keyconfig_Defaultkey : g_cssObj.title_base);
					}
				}
				changeConfigCursor(0);
			}
		}, g_lblPosObj.btnKcReset, g_cssObj.button_Reset),

		// プレイ開始
		makePlayButton(() => loadMusic())
	);

	// キーボード押下時処理
	setShortcutEvent(g_currentPage, (kbCode) => {
		const keyCdObj = document.getElementById(`keycon${g_currentj}_${g_currentk}`);
		let setKey = g_kCdN.findIndex(kCd => kCd === kbCode);

		// 全角切替、BackSpace、Deleteキー、Escキーは割り当て禁止
		// また、直前と同じキーを押した場合(BackSpaceを除く)はキー操作を無効にする
		const disabledKeys = [240, 242, 243, 244, 91, 29, 28, 27, 259, g_prevKey];

		if (selectedKc === `TitleBack` || selectedKc === `Retry`) {
			// プレイ中ショートカットキー変更
			if (disabledKeys.includes(setKey) || g_kCdN[setKey] === undefined) {
				makeInfoWindow(g_msgInfoObj.I_0002, `fadeOut0`);
				return;
			}
			g_headerObj[`key${selectedKc}`] = setKey;
			g_headerObj[`key${selectedKc}Def`] = setKey;
			document.getElementById(`sc${selectedKc}`).textContent = getScMsg[selectedKc]();
			document.getElementById(`sc${selectedKc}`).style.fontSize = `${getFontSize(getScMsg[selectedKc](), g_btnWidth(5 / 12) - 40, getBasicFont(), 13)}px`;
			if (g_isMac) {
				scTitleBack.textContent = getScMsg.TitleBack();
				scTitleBack.style.fontSize = `${getFontSize(getScMsg.TitleBack(), g_btnWidth(5 / 12) - 40, getBasicFont(), 13)}px`;
			}
			changeConfigColor(document.getElementById(`sc${selectedKc}`),
				g_headerObj[`key${selectedKc}`] === g_headerObj[`key${selectedKc}Def2`] ?
					g_cssObj.title_base : g_cssObj.keyconfig_Changekey);
			return;
		}

		if (g_localeObj.val === `Ja`) {
			disabledKeys.unshift(229);
		}
		if (disabledKeys.includes(setKey) || g_kCdN[setKey] === undefined) {
			makeInfoWindow(g_msgInfoObj.I_0002, `fadeOut0`);
			return;
		} else if ((setKey === C_KEY_TITLEBACK && g_currentk === 0) ||
			((keyIsDown(g_kCdNameObj.metaLKey) || keyIsDown(g_kCdNameObj.metaRKey)) && keyIsShift())) {
			return;
		}

		if (setKey === C_KEY_RETRY && (!g_isMac || g_currentk === 0)) {
			// スキップ
		} else {
			// キー割り当て処理
			if (setKey === C_KEY_TITLEBACK || setKey === C_KEY_RETRY) {
				// キー無効化（代替キーのみ）
				setKey = 0;
			}
			if (g_keyObj[`keyCtrl${keyCtrlPtn}d`][g_currentj][g_currentk] !== setKey) {
				// 既定キーと異なる場合は色付け
				changeKeyConfigColor(g_currentj, g_currentk, g_cssObj.keyconfig_Changekey);
			}
			keyCdObj.textContent = g_kCd[setKey];
			g_keyObj[`keyCtrl${keyCtrlPtn}`][g_currentj][g_currentk] = setKey;
			g_prevKey = setKey;
		}

		// カーソル移動
		if (g_currentk < g_keyObj[`keyCtrl${keyCtrlPtn}`][g_currentj].length - 1 && g_kcType !== `Main`) {
			// 後続に代替キーが存在する場合
			g_currentk++;
			cursor.style.top = wUnit(parseInt(cursor.style.top) + C_KYC_REPHEIGHT);

		} else {
			changeConfigCursor();
		}
	});

	g_skinJsObj.keyconfig.forEach(func => func());
	document.onkeyup = evt => commonKeyUp(evt);
	document.oncontextmenu = () => false;
};

/**
 * 影矢印色の取得
 * @param {number} _colorPos 
 * @param {string} _arrowColor 
 * @returns {string}
 */
const getShadowColor = (_colorPos, _arrowColor) => g_headerObj.setShadowColor[_colorPos] === `Default` ?
	_arrowColor : g_headerObj.setShadowColor[_colorPos];

/**
 * キー数基礎情報の取得
 * @returns {{ 
 * 	keyCtrlPtn: string, keyNum: number, posMax: number,
 * 	divideCnt: number, keyGroupMaps: string[], keyGroupList: string[] 
 * }}
 */
const getKeyInfo = () => {
	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`${g_keyObj.defaultProp}${keyCtrlPtn}`].length;
	const posMax = g_keyObj[`divMax${keyCtrlPtn}`] ?? Math.max(...g_keyObj[`pos${keyCtrlPtn}`]) + 1;
	const divideCnt = g_keyObj[`div${keyCtrlPtn}`] - 1;
	const keyGroupMaps = setVal(g_keyObj[`keyGroup${keyCtrlPtn}`], fillArray(keyNum, [`0`]), C_TYP_STRING);
	const keyGroupList = makeDedupliArray(keyGroupMaps.flat()).sort((a, b) => parseInt(a) - parseInt(b));

	return {
		keyCtrlPtn, keyNum, posMax, divideCnt, keyGroupMaps, keyGroupList,
	};
};

/**
 * ステップゾーン間隔、大きさの更新
 * @param {string} _header 
 * @param {string} _keyCtrlPtn 
 */
const updateKeyInfo = (_header, _keyCtrlPtn) => {
	const kcPtn = hasVal(g_keyObj[`${_header}${_keyCtrlPtn}`]) ? _keyCtrlPtn : `_def`;
	g_keyObj[_header] = g_keyObj[`${_header}${kcPtn}`];
};

/**
 * 初期矢印色・フリーズアロー色の変更
 */
const changeSetColor = () => {
	const isDefault = [`Default`, `Type0`].includes(g_colorType);
	const idHeader = setScoreIdHeader(g_stateObj.scoreId);
	const defaultType = idHeader + g_colorType;
	const currentTypes = {
		'': (isDefault ? defaultType : g_colorType),
		'Shadow': (isDefault ? defaultType : `${idHeader}Default`),
	};
	Object.keys(currentTypes).forEach(pattern => {
		g_headerObj[`set${pattern}Color`] = structuredClone(g_headerObj[`set${pattern}Color${currentTypes[pattern]}`]);
		if (g_headerObj[`frz${pattern}Color`] === undefined) {
			g_headerObj[`frz${pattern}Color`] = fillArray(g_headerObj.setColorInit.length, ``);
		}
		for (let j = 0; j < g_headerObj.setColorInit.length; j++) {
			g_headerObj[`frz${pattern}Color`][j] = structuredClone(g_headerObj[`frz${pattern}Color${currentTypes[pattern]}`][j]);
		}
		if (!isDefault) {
			g_headerObj[`set${pattern}Color`] = structuredClone(g_headerObj[`set${pattern}Color${g_colorType}`]);
		}
	});

	// 影矢印が未指定の場合はType1, Type2の影矢印指定を無くす
	if (!hasVal(g_headerObj[`setShadowColor${idHeader}Default`][0]) && [`Type1`, `Type2`].includes(g_colorType)) {
		g_headerObj.setShadowColor = fillArray(g_headerObj.setColorInit.length, ``);
	}
};

/**
 * コンフィグの色変更
 * @param {HTMLDivElement} _obj 
 * @param {string} _cssName 
 */
const changeConfigColor = (_obj, _cssName) => {
	_obj.classList.remove(g_cssObj.keyconfig_Changekey, g_cssObj.keyconfig_Defaultkey, g_cssObj.title_base);
	_obj.classList.add(_cssName);
};

/**
 * シャッフルグループの色変更
 * - デフォルト値と違う番号になった場合、色付けする
 * @param {string} _keyCtrlPtn キーコンフィグパターン
 * @param {number[]} _vals シャッフルグループ番号（群）
 * @param {number} _j (-1: 全体に対して色付け, それ以外: 指定箇所のみ色付け)
 */
const changeShuffleConfigColor = (_keyCtrlPtn, _vals, _j = -1) => {
	const changeTargetColor = (_val, _k) => {
		const isEqualShuffleGr = (_val === g_keyObj[`shuffle${_keyCtrlPtn}_0d`][_k]);
		changeConfigColor(document.getElementById(`sArrow${_k}`), isEqualShuffleGr ? g_cssObj.title_base : g_cssObj.keyconfig_Changekey);
	};

	if (_j === -1) {
		_vals.forEach((val, m) => changeTargetColor(val, m));
	} else {
		changeTargetColor(_vals, _j);
	}
};

/*-----------------------------------------------------------*/
/* Scene : LOADING [strawberry] */
/*-----------------------------------------------------------*/

const loadMusic = () => {

	clearWindow(true);
	g_currentPage = `loading`;

	const musicUrl = getMusicUrl(g_stateObj.scoreId);
	let url = `${g_rootPath}../${g_headerObj.musicFolder}/${musicUrl}`;
	if (musicUrl.indexOf(C_MRK_CURRENT_DIRECTORY) !== -1) {
		url = musicUrl.split(C_MRK_CURRENT_DIRECTORY)[1];
	} else if (g_headerObj.musicFolder.indexOf(C_MRK_CURRENT_DIRECTORY) !== -1) {
		url = `${g_headerObj.musicFolder.split(C_MRK_CURRENT_DIRECTORY)[1]}/${musicUrl}`;
	}

	g_headerObj.musicUrl = musicUrl;
	g_musicEncodedFlg = listMatching(musicUrl, [`.js`, `.txt`], { suffix: `$` });

	// Now Loadingを表示
	const lblLoading = getLoadingLabel();
	divRoot.appendChild(lblLoading);

	// ローカル動作時
	if (g_isFile) {
		setAudio(url);
		return;
	}

	// XHRで読み込み
	const request = new XMLHttpRequest();
	request.open(`GET`, url, true);
	request.responseType = `blob`;

	// 読み込み完了時
	request.addEventListener(`load`, () => {
		if (request.status >= 200 && request.status < 300) {
			const blobUrl = URL.createObjectURL(request.response);
			createEmptySprite(divRoot, `loader`, g_windowObj.loader);
			lblLoading.textContent = g_lblNameObj.pleaseWait;
			setAudio(blobUrl);
		} else {
			makeWarningWindow(`${g_msgInfoObj.E_0041.split('{0}').join(getFullPath(url))}<br>(${request.status} ${request.statusText})`, { backBtnUse: true });
		}
	});

	// 進捗時
	request.addEventListener(`progress`, _event => {
		const lblLoading = document.getElementById(`lblLoading`);

		if (_event.lengthComputable) {
			const rate = _event.loaded / _event.total;
			createEmptySprite(divRoot, `loader`, { y: g_sHeight - 10, h: 10, w: g_sWidth * rate, backgroundColor: `#eeeeee` });
			lblLoading.textContent = `${g_lblNameObj.nowLoading} ${Math.floor(rate * 100)}%`;
		} else {
			lblLoading.textContent = `${g_lblNameObj.nowLoading} ${_event.loaded}Bytes`;
		}
		// ユーザカスタムイベント
		g_customJsObj.progress.forEach(func => func(_event));
	});

	// エラー処理
	request.addEventListener(`timeout`, () => makeWarningWindow(g_msgInfoObj.E_0033, { backBtnUse: true }));
	request.addEventListener(`error`, () => makeWarningWindow(g_msgInfoObj.E_0034, { backBtnUse: true }));

	request.send();
};

/**
 * 音楽データの設定
 * iOSの場合はAudioタグによる再生
 * @param {string} _url 
 */
const setAudio = async (_url) => {

	const loadMp3 = () => {
		if (g_isFile) {
			g_audio.src = _url;
			musicAfterLoaded();
		} else {
			initWebAudioAPIfromURL(_url);
		}
	};

	const readyToStart = _func => {
		if (g_isIos) {
			g_currentPage = `loadingIos`;
			lblLoading.textContent = `Click to Start!`;
			divRoot.appendChild(makePlayButton(evt => {
				g_currentPage = `loading`;
				resetKeyControl();
				divRoot.removeChild(evt.target);
				_func();
			}));
			setShortcutEvent(g_currentPage);
		} else {
			_func();
		}
	};

	if (g_musicEncodedFlg) {
		await loadScript2(_url);
		if (typeof musicInit === C_TYP_FUNCTION) {
			musicInit();
			readyToStart(() => initWebAudioAPIfromBase64(g_musicdata));
		} else {
			makeWarningWindow(g_msgInfoObj.E_0031);
			musicAfterLoaded();
		}
	} else {
		readyToStart(() => loadMp3());
	}
};

// Base64から音声データに変換してWebAudioAPIで再生する準備
const initWebAudioAPIfromBase64 = async (_base64) => {
	g_audio = new AudioPlayer();
	musicAfterLoaded();
	const array = Uint8Array.from(atob(_base64), v => v.charCodeAt(0))
	await g_audio.init(array.buffer);
};

// 音声ファイルを読み込んでWebAudioAPIで再生する準備
const initWebAudioAPIfromURL = async (_url) => {
	g_audio = new AudioPlayer();
	musicAfterLoaded();
	const promise = await fetch(_url);
	const arrayBuffer = await promise.arrayBuffer();
	await g_audio.init(arrayBuffer);
};

const musicAfterLoaded = () => {
	g_audio.load();

	if (g_audio.readyState === 4) {
		// audioの読み込みが終わった後の処理
		loadingScoreInit();
	} else {
		// 読込中の状態
		g_audio.addEventListener(`canplaythrough`, (() => function f() {
			g_audio.removeEventListener(`canplaythrough`, f, false);
			loadingScoreInit();
		})(), false);

		// エラー時
		g_audio.addEventListener(`error`, (() => function f() {
			g_audio.removeEventListener(`error`, f, false);
			makeWarningWindow(g_msgInfoObj.E_0041.split(`{0}`).join(g_audio.src), { backBtnUse: true });
		})(), false);
	}
};

/**
 * 読込画面初期化
 */
const loadingScoreInit = async () => {

	// 譜面データの読み込み
	await loadChartFile();
	const tkObj = getKeyInfo();
	const [keyCtrlPtn, keyNum] = [tkObj.keyCtrlPtn, tkObj.keyNum];
	g_headerObj.blankFrameDef = setVal(g_headerObj.blankFrameDefs[g_stateObj.scoreId], g_headerObj.blankFrameDefs[0]);
	g_headerObj.blankFrame = g_headerObj.blankFrameDef;

	// ユーザカスタムイベント
	g_customJsObj.preloading.forEach(func => func());
	g_skinJsObj.preloading.forEach(func => func());

	let dummyIdHeader = ``;
	if (g_stateObj.dummyId !== ``) {
		if (g_stateObj.dummyId === 0 || g_stateObj.dummyId === 1) {
			dummyIdHeader = ``;
		} else {
			dummyIdHeader = g_stateObj.dummyId;
		}
	}
	g_scoreObj = scoreConvert(g_rootObj, g_stateObj.scoreId, 0, dummyIdHeader);

	// 最終フレーム数の取得
	let lastFrame = getLastFrame(g_scoreObj) + g_headerObj.blankFrame;

	// 最初の矢印データがあるフレーム数を取得
	let firstArrowFrame = getFirstArrowFrame(g_scoreObj);

	// 開始フレーム数の取得(フェードイン加味)
	g_scoreObj.frameNum = getStartFrame(lastFrame, g_stateObj.fadein);

	// フレームごとの速度を取得（配列形式）
	let speedOnFrame = setSpeedOnFrame(g_scoreObj.speedData, lastFrame);

	// Motionオプション適用時の矢印別の速度を取得（配列形式）
	const motionOnFrame = setMotionOnFrame();
	g_workObj.motionOnFrames = structuredClone(motionOnFrame);

	// 最初のフレームで出現する矢印が、ステップゾーンに到達するまでのフレーム数を取得
	const firstFrame = (g_scoreObj.frameNum === 0 ? 0 : g_scoreObj.frameNum + g_headerObj.blankFrame);
	let arrivalFrame = getFirstArrivalFrame(firstFrame, speedOnFrame, motionOnFrame);

	// キーパターン(デフォルト)に対応する矢印番号を格納
	convertReplaceNums();

	const setData = (_data, _minLength = 1) => hasArrayList(_data, _minLength) ? _data.concat() : [];

	// フレーム・曲開始位置調整
	let preblankFrame = 0;
	if (g_scoreObj.frameNum === 0) {
		if (firstArrowFrame - g_limitObj.adjustment < arrivalFrame) {
			preblankFrame = arrivalFrame - firstArrowFrame + g_limitObj.adjustment;

			// 譜面データの再読み込み
			const noteExistObj = {
				arrow: true,
				frz: true,
				dummyArrow: g_stateObj.shuffle === C_FLG_OFF,
				dummyFrz: g_stateObj.shuffle === C_FLG_OFF,
			};
			const tmpObj = scoreConvert(g_rootObj, g_stateObj.scoreId, preblankFrame, dummyIdHeader);
			for (let j = 0; j < keyNum; j++) {
				Object.keys(noteExistObj).filter(name => tmpObj[`${name}Data`][j] !== undefined && noteExistObj[name])
					.forEach(name => g_scoreObj[`${name}Data`][j] = structuredClone(tmpObj[`${name}Data`][j]));
			}

			Object.keys(g_dataMinObj).forEach(dataType =>
				g_scoreObj[`${dataType}Data`] = setData(tmpObj[`${dataType}Data`], g_dataMinObj[dataType]));

			lastFrame += preblankFrame;
			firstArrowFrame += preblankFrame;
			speedOnFrame = setSpeedOnFrame(g_scoreObj.speedData, lastFrame);
			arrivalFrame = getFirstArrivalFrame(firstFrame, speedOnFrame, motionOnFrame);
			g_headerObj.blankFrame += preblankFrame;
		}
	}
	g_scoreObj.baseFrame = g_scoreObj.frameNum - g_stateObj.intAdjustment;

	// シャッフルグループ未定義の場合
	if (g_keyObj[`shuffle${keyCtrlPtn}`] === undefined) {
		g_keyObj[`shuffle${keyCtrlPtn}`] = fillArray(keyNum);
	}

	// シャッフルグループを扱いやすくする
	// [0, 0, 0, 1, 0, 0, 0] -> [[0, 1, 2, 4, 5, 6], [3]]
	g_workObj.shuffleGroupMap = {};
	g_keyObj[`shuffle${keyCtrlPtn}`].forEach((_val, _i) =>
		g_workObj.shuffleGroupMap[_val]?.push(_i) || (g_workObj.shuffleGroupMap[_val] = [_i]));

	// Mirror,Random,S-Randomの適用
	g_shuffleFunc[g_stateObj.shuffle](keyNum, Object.values(g_workObj.shuffleGroupMap));

	// アシスト用の配列があれば、ダミーデータで上書き
	if (typeof g_keyObj[`assistPos${keyCtrlPtn}`] === C_TYP_OBJECT &&
		!g_autoPlaysBase.includes(g_stateObj.autoPlay)) {
		const assistArray = g_keyObj[`assistPos${keyCtrlPtn}`][g_stateObj.autoPlay];
		for (let j = 0; j < keyNum; j++) {
			if (assistArray[j] === 1) {
				g_scoreObj.dummyArrowData[j] = g_scoreObj.arrowData[j].concat();
				g_scoreObj.arrowData[j] = [];
				g_scoreObj.dummyFrzData[j] = g_scoreObj.frzData[j].concat();
				g_scoreObj.frzData[j] = [];
			} else {
				g_scoreObj.dummyArrowData[j] = [];
				g_scoreObj.dummyFrzData[j] = [];
			}
		}
	}

	// 矢印・フリーズアロー数をカウント
	g_allArrow = 0;
	g_allFrz = 0;
	g_scoreObj.arrowData.forEach(data => g_allArrow += data.length);
	g_scoreObj.frzData.forEach(data => g_allFrz += Math.floor(data.length / 2) * 2);

	// ライフ回復・ダメージ量の計算
	// フリーズ始点でも通常判定させる場合は総矢印数を水増しする
	if (g_headerObj.frzStartjdgUse) {
		g_allArrow += g_allFrz / 2;
	}
	g_fullArrows = g_allArrow + g_allFrz / 2;

	calcLifeVals(g_fullArrows);

	// 矢印・フリーズアロー・速度/色変化格納処理
	pushArrows(g_scoreObj, speedOnFrame, motionOnFrame, arrivalFrame);

	// メインに入る前の最終初期化処理
	getArrowSettings();

	// ユーザカスタムイベント
	g_customJsObj.loading.forEach(func => func());

	mainInit();
};

/**
 * 譜面番号の取得
 * @param {number} _scoreId 
 * @param {boolean} _scoreLockFlg 
 * @returns {number|string}
 */
const setScoreIdHeader = (_scoreId = 0, _scoreLockFlg = false) => {
	if (!_scoreLockFlg && _scoreId > 0) {
		return Number(_scoreId) + 1;
	} else if (_scoreLockFlg && g_headerObj.scoreNos?.[_scoreId] > 1) {
		return g_headerObj.scoreNos[_scoreId];
	}
	return ``;
};

/**
 * 譜面ファイル番号の取得
 * @param {number} [_scoreId=0] 
 * @param {boolean} [_scoreLockFlg=false] 
 * @returns {number|string}
 */
const setDosIdHeader = (_scoreId = 0, _scoreLockFlg = false) => {
	if (_scoreLockFlg && g_headerObj.dosNos?.[_scoreId] > 0) {
		return g_headerObj.dosNos?.[_scoreId] > 1 ? g_headerObj.dosNos[_scoreId] : ``;
	} else if (_scoreId > 0) {
		return Number(_scoreId) + 1;
	}
	return ``;
};

/**
 * Mirror,Randomの適用
 * @param {number} _keyNum
 * @param {number[][]} _shuffleGroup
 * @param {number[][]} _style
 */
const applyShuffle = (_keyNum, _shuffleGroup, _style) => {
	// 並べ替え用の配列を作成
	// index[i]番目のキーの譜面がi番目のキーに流れるようになります
	const index = [...Array(_keyNum).keys()];
	for (let i = 0; i < _shuffleGroup.length; i++) {
		for (let j = 0; j < _shuffleGroup[i].length; j++) {
			index[_shuffleGroup[i][j]] = _style[i][j];
		}
	}

	// indexに従って並べ替え
	g_typeLists.arrow.forEach(type => {
		const tmpData = structuredClone(g_scoreObj[`${type}Data`]);
		for (let i = 0; i < _keyNum; i++) {
			g_scoreObj[`${type}Data`][i] = tmpData[index[i]] || [];
		}
	});
};

/**
 * X-Mirror作成用の入れ替え関数
 * グループが4の倍数のとき、4n+1, 4n+2のみ入れ替える
 * @param {number[][]} _style 
 * @param {number[]} _group 
 * @param {number} _i 
 * @param {number} _divideNum 
 * @returns 
 */
const swapGroupNums = (_style, _group, _i, _divideNum) => {
	if (_group.length % _divideNum === 0) {
		for (let k = 0; k < _group.length / _divideNum; k++) {
			const swap1 = Math.floor(_divideNum * (k + 1 / 2) - 1);
			const swap2 = Math.ceil(_divideNum * (k + 1 / 2));
			[_style[_i][swap1], _style[_i][swap2]] = [_style[_i][swap2], _style[_i][swap1]];
		}
	}
	return _style;
};

/**
 * Mirrorの適用
 * @param {number} _keyNum
 * @param {number[][]} _shuffleGroup
 * @param {boolean} [_swapFlg=false]
 */
const applyMirror = (_keyNum, _shuffleGroup, _swapFlg = false) => {

	// シャッフルグループごとにミラー
	const style = structuredClone(_shuffleGroup).map(_group => _group.reverse());
	const mirStyle = structuredClone(style);

	if (_swapFlg) {
		style.forEach((group, i) => g_settings.swapPattern.forEach(val => swapGroupNums(style, group, i, val)));
		let swapUseFlg = false;
		style.forEach((_group, j) => {
			_group.forEach((val, k) => {
				if (style[j][k] !== mirStyle[j][k]) {
					swapUseFlg = true;
					return;
				}
			});
		});
		if (!swapUseFlg) {
			g_stateObj.shuffle = `Mirror`;
		}
	}
	applyShuffle(_keyNum, _shuffleGroup, style);
};

/**
 * Turningの適用
 * @param {number} _keyNum 
 * @param {number[][]} _shuffleGroup 
 */
const applyTurning = (_keyNum, _shuffleGroup) => {
	const mirrorOrNot = _array => Math.random() >= 0.5 ? _array.reverse() : _array;
	const style = structuredClone(_shuffleGroup).map(_group => {
		const startNum = Math.floor(Math.random() * (_group.length - 1)) + 1;
		return mirrorOrNot(makeDedupliArray(_group.slice(startNum), _group.slice(0, startNum)));
	});
	applyShuffle(_keyNum, _shuffleGroup, style);
};

/**
 * Randomの適用
 * @param {number} _keyNum
 * @param {number[][]} _shuffleGroup
 */
const applyRandom = (_keyNum, _shuffleGroup) => {
	// シャッフルグループごとにシャッフル(Fisher-Yates)
	const style = structuredClone(_shuffleGroup).map(_group => {
		for (let i = _group.length - 1; i > 0; i--) {
			const random = Math.floor(Math.random() * (i + 1));
			[_group[i], _group[random]] = [_group[random], _group[i]];
		}
		return _group;
	});
	applyShuffle(_keyNum, _shuffleGroup, style);
};

/**
 * S-Randomの適用
 * @param {number} _keyNum
 * @param {number[][]} _shuffleGroup
 * @param {string} _arrowHeader
 * @param {string} _frzHeader
 */
const applySRandom = (_keyNum, _shuffleGroup, _arrowHeader, _frzHeader) => {

	const tmpArrowData = [...Array(_keyNum)].map(() => []);
	const tmpFrzData = [...Array(_keyNum)].map(() => []);
	const scatterFrame = 10;

	// シャッフルグループごとに処理
	_shuffleGroup.forEach(_group => {
		// 全フリーズを開始フレーム順に並べる
		const allFreezeArrows = [];
		_group.forEach(_key => {
			const frzData = g_scoreObj[`${_frzHeader}Data`][_key] || [];
			for (let i = 0; i < frzData.length; i += 2) {
				allFreezeArrows.push({ begin: frzData[i], end: frzData[i + 1] });
			}
		});
		allFreezeArrows.sort((_a, _b) => _a.begin - _b.begin);

		// 重ならないようにフリーズを配置
		allFreezeArrows.forEach(_freeze => {
			// 置ける場所を検索
			const freeSpacesFlat = _group.filter(
				_key => tmpFrzData[_key].find(_other => _freeze.begin - scatterFrame <= _other.end + scatterFrame) === undefined
			);
			const freeSpaces = _group.filter(
				_key => tmpFrzData[_key].find(_other => _freeze.begin <= _other.end) === undefined
			);
			let currentFreeSpaces = freeSpaces;
			if (g_stateObj.shuffle.startsWith(`Scatter`)) {
				currentFreeSpaces = freeSpacesFlat.length > 0 ? freeSpacesFlat : freeSpaces;
			}
			// ランダムに配置
			const random = Math.floor(Math.random() * currentFreeSpaces.length);
			tmpFrzData[currentFreeSpaces[random]].push(_freeze);
		});

		// 通常矢印の配置
		const allArrows = _group.map(_key => g_scoreObj[`${_arrowHeader}Data`][_key]).flat();
		allArrows.sort((_a, _b) => _a - _b);
		let prev2Num = 0, prevNum = 0, sameFlg = true;
		allArrows.forEach(_arrow => {

			// 直前の矢印のフレーム数を取得
			sameFlg = true;
			if (prev2Num !== _arrow && prevNum !== _arrow) {
				prev2Num = prevNum;
				prevNum = _arrow;
				sameFlg = false;
			}

			const getFreeSpaces = ({ scatterFrame = 0, frzFlg = false, prevFlg = false } = {}) =>
				_group.filter(_key =>
					// 通常矢印と重ならない
					tmpArrowData[_key].find(_other => _arrow >= _other - scatterFrame && _arrow <= _other + scatterFrame) === undefined
					// フリーズと重ならない
					&& (!frzFlg || tmpFrzData[_key].find(_freeze => _arrow >= _freeze.begin - scatterFrame && _arrow <= _freeze.end + scatterFrame) === undefined)
					// 直前の矢印と重ならない
					&& (!prevFlg || tmpArrowData[_key].find(_other => prev2Num === _other) === undefined)
				);

			// 置ける場所を検索
			const freeSpacesFlat = getFreeSpaces({ scatterFrame, frzFlg: true, prevFlg: true });
			const freeSpaces = getFreeSpaces({ frzFlg: true });
			const freeSpacesAlt = getFreeSpaces();

			// ランダムに配置
			let currentFreeSpaces = freeSpaces.length > 0 ? freeSpaces : freeSpacesAlt;
			if (g_stateObj.shuffle.startsWith(`Scatter`)) {
				currentFreeSpaces = freeSpacesFlat.length > 0 && !sameFlg ? freeSpacesFlat : currentFreeSpaces;
			}
			const random = Math.floor(Math.random() * currentFreeSpaces.length);
			tmpArrowData[currentFreeSpaces[random]].push(_arrow);
		})
	});

	g_scoreObj[`${_arrowHeader}Data`] = tmpArrowData;
	g_scoreObj[`${_frzHeader}Data`] = tmpFrzData.map(_freezes =>
		_freezes.map(_freeze => [_freeze.begin, _freeze.end]).flat()
	);
};

/**
 * 譜面データの分解
 * @param {object} _dosObj 
 * @param {number} _scoreId 譜面番号
 * @param {number} _preblankFrame 補完フレーム数
 * @param {string} [_dummyNo] ダミー用譜面番号添え字
 * @param {string} [_keyCtrlPtn] 選択キー及びパターン
 * @param {boolean} [_scoreAnalyzeFlg=false] 譜面詳細データのために必要分で読込を中断
 * @returns
 */
const scoreConvert = (_dosObj, _scoreId, _preblankFrame, _dummyNo = ``,
	_keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`, _scoreAnalyzeFlg = false) => {

	// 矢印群の格納先
	const obj = {};

	const scoreIdHeader = setScoreIdHeader(_scoreId, g_stateObj.scoreLockFlg);
	const keyNum = g_keyObj[`${g_keyObj.defaultProp}${_keyCtrlPtn}`].length;
	obj.arrowData = [];
	obj.frzData = [];
	obj.dummyArrowData = [];
	obj.dummyFrzData = [];

	// realAdjustment: 全体, intAdjustment: 整数値のみ(切り捨て、ファイル時のみ四捨五入), decimalAdjustment: 小数値のみ
	const headerAdjustment = parseFloat(g_headerObj.adjustment[g_stateObj.scoreId] || g_headerObj.adjustment[0]);
	g_stateObj.realAdjustment = (parseFloat(g_stateObj.adjustment) + headerAdjustment) / g_headerObj.playbackRate + _preblankFrame;
	g_stateObj.intAdjustment = isLocalMusicFile(g_stateObj.scoreId) ?
		Math.round(g_stateObj.realAdjustment) : Math.floor(g_stateObj.realAdjustment);
	g_stateObj.decimalAdjustment = g_stateObj.realAdjustment - g_stateObj.intAdjustment;

	const blankFrame = g_headerObj.blankFrame;
	const calcFrame = _frame => Math.round((parseFloat(_frame) - blankFrame) / g_headerObj.playbackRate + blankFrame + g_stateObj.intAdjustment);

	/**
	 * 矢印データの格納
	 * @param {string} _data 
	 * @returns {number[]}
	 */
	const storeArrowData = _data => hasVal(_data) ?
		splitLF(_data)?.join(``).split(`,`).filter(data => !isNaN(parseFloat(data))).map(data => calcFrame(data)).sort((_a, _b) => _a - _b) : [];

	for (let j = 0; j < keyNum; j++) {

		// 矢印データの分解
		const arrowName = g_keyObj[`chara${_keyCtrlPtn}`][j];
		obj.arrowData[j] = storeArrowData(_dosObj[`${arrowName}${scoreIdHeader}_data`]);

		if (g_stateObj.dummyId !== ``) {
			obj.dummyArrowData[j] = storeArrowData(_dosObj[`${arrowName}${_dummyNo}_data`]);
		}

		// 矢印名からフリーズアロー名への変換
		let frzName = replaceStr(g_keyObj[`chara${_keyCtrlPtn}`][j], g_escapeStr.frzName);
		if (frzName.indexOf(`frz`) === -1 && frzName.indexOf(`foni`) === -1) {
			frzName = frzName.replaceAll(frzName, `frz${toCapitalize(frzName)}`);
		}

		// フリーズアローデータの分解 (2つで1セット)
		obj.frzData[j] = storeArrowData(_dosObj[`${frzName}${scoreIdHeader}_data`]);

		if (g_stateObj.dummyId !== ``) {
			obj.dummyFrzData[j] = storeArrowData(_dosObj[`${frzName}${_dummyNo}_data`]);
		}
	}

	/**
	 * 速度変化データの分解・格納（フレーム数, 矢印番号）
	 * @param {string} _header 
	 * @param {number} _scoreNo 
	 * @param {string} _footer 
	 * @returns {number[]}
	 */
	const setSpeedData = (_header, _scoreNo, _footer = `_data`) => {
		const dosSpeedData = getRefData(_header, `${_scoreNo}${_footer}`);
		const speedData = [];

		if (hasVal(dosSpeedData) && g_stateObj.d_speed === C_FLG_ON) {
			const tmpArrayData = splitLF(dosSpeedData);

			tmpArrayData.filter(data => hasVal(data)).forEach(tmpData => {
				const tmpSpeedData = tmpData.split(`,`);
				for (let k = 0; k < tmpSpeedData.length; k += 2) {
					if (!hasVal(tmpSpeedData[k])) {
						continue;
					} else if (tmpSpeedData[k + 1] === `-`) {
						break;
					}
					const frame = calcFrame(setVal(tmpSpeedData[k], ``, C_TYP_CALC));
					const speed = setVal(tmpSpeedData[k + 1], 1, C_TYP_CALC);

					speedData.push([frame, speed]);
				}
			});
			return speedData.sort((_a, _b) => _a[0] - _b[0]).flat();
		}
		return [];
	};

	/**
	 * 個別・全体色変化データをマージして整列し、単純配列として返却
	 * @param {string} _header 
	 * @returns {any[]}
	 */
	const mergeColorData = (_header = ``) => {
		if (obj[`color${_header}Data`] === undefined) return [];
		const tmpArr = obj[`color${_header}Data`].concat(obj[`acolor${_header}Data`]);
		return tmpArr.sort((_a, _b) => _a[0] - _b[0]).flat();
	};

	/**
	 * 色変化データの分解・格納（フレーム数, 矢印番号）
	 * 後で個別・全体色変化をマージするため、二次元配列として返却
	 * @param {string} _header 
	 * @param {number} _scoreNo 
	 * @returns {any[][]}
	 */
	const setColorData = (_header, _scoreNo) => {
		const dosColorData = getRefData(_header, `${_scoreNo}_data`);
		const colorData = [];
		const allFlg = (_header.charAt(0) === `a`);

		if (hasVal(dosColorData) && g_stateObj.d_color === C_FLG_ON) {
			const tmpArrayData = splitLF(dosColorData);

			tmpArrayData.filter(data => hasVal(data)).forEach(tmpData => {
				const tmpColorData = tmpData.split(`,`);
				for (let k = 0; k < tmpColorData.length; k += 3) {
					if (!hasVal(tmpColorData[k])) {
						continue;
					} else if (tmpColorData[k + 1] === `-`) {
						break;
					}
					const frame = calcFrame(setVal(tmpColorData[k], ``, C_TYP_CALC));
					const colorNum = setVal(tmpColorData[k + 1], 0, C_TYP_CALC);
					const colorCd = tmpColorData[k + 2];

					// フレーム数、色番号、カラーコード、全体色変化フラグをセットとして配列化
					colorData.push([frame, colorNum, colorCd, allFlg]);
				}
			});
			return colorData.sort((_a, _b) => _a[0] - _b[0]);
		}
		return [];
	};

	/**
	 * 色変化データの分解・格納（新形式）
	 * - 個別・全体色変化を一体で管理するため通常の配列で返却
	 * @param {string} _header 
	 * @param {number} _scoreNo 
	 * @returns 
	 */
	const setColor2Data = (_header, _scoreNo) => {
		const dosColorData = getRefData(_header, `${_scoreNo}_data`);
		const colorData = {
			Arrow: [], ArrowShadow: [], Normal: [], NormalBar: [], NormalShadow: [],
			Hit: [], HitBar: [], HitShadow: [],
		};

		if (hasVal(dosColorData) && g_stateObj.d_color === C_FLG_ON) {

			splitLF(dosColorData).filter(data => hasVal(data)).forEach(tmpData => {
				const tmpColorData = tmpData.split(`,`).map(val => trimStr(val));
				if (!hasVal(tmpColorData[0]) || tmpColorData[1] === `-`) {
					return;
				}
				const frame = calcFrame(setVal(tmpColorData[0], ``, C_TYP_CALC));
				const colorCd = tmpColorData[2];

				// 色変化対象の取得
				const pos = tmpColorData[1]?.indexOf(`:`);
				const patternStr = pos > 0 ? [trimStr(tmpColorData[1].substring(0, pos)), trimStr(tmpColorData[1].substring(pos + 1))]
					: [tmpColorData[1]];
				const patterns = replaceStr(trimStr(patternStr[1] || `Arrow`), g_escapeStr.colorPatternName).split(`/`);

				// 矢印番号の組み立て
				const colorVals = [];
				replaceStr(patternStr[0], g_escapeStr.targetPatternName)?.split(`/`)?.forEach(val => {
					if (val.indexOf(`...`) > 0) {
						// 範囲指定表記の補完 例. 0...3 -> 0/1/2/3
						const [valMin, valMax] = [val.split(`...`)[0], val.split(`...`)[1]].map(val => setIntVal(val));
						for (let k = valMin; k <= valMax; k++) {
							colorVals.push(String(k));
						}
					} else {
						colorVals.push(val);
					}
				});

				// フレーム数、色番号、カラーコード、全体色変化フラグ、変更対象をセットとして配列化し、色変化対象ごとのプロパティへ追加
				patterns.forEach(pattern => {
					try {
						colorVals.forEach(val => colorData[pattern].push([frame, val, colorCd, hasVal(tmpColorData[3]), pattern]));
					} catch (error) {
						makeWarningWindow(g_msgInfoObj.E_0201.split(`{0}`).join(pattern));
					}
				});
			});
			// 色変化対象ごとにフレーム数をキーにソートしてフラット化
			Object.keys(colorData).forEach(pattern =>
				colorData[pattern] = colorData[pattern].sort((_a, _b) => _a[0] - _b[0]).flat());
		}
		return colorData;
	};

	/**
	 * 矢印モーションデータの分解・格納（フレーム数, 矢印番号）
	 * @param {string} _header 
	 * @param {number} _scoreNo 
	 * @returns {any[]}
	 */
	const setCssMotionData = (_header, _scoreNo) => {
		const dosCssMotionData = getRefData(`${_header}Motion`, `${_scoreNo}_data`) || _dosObj[`${_header}Motion_data`];
		const cssMotionData = [];

		if (hasVal(dosCssMotionData) && g_stateObj.d_arroweffect === C_FLG_ON) {
			splitLF(dosCssMotionData).filter(data => hasVal(data)).forEach(tmpData => {
				const tmpcssMotionData = tmpData.split(`,`);
				if (isNaN(parseInt(tmpcssMotionData[0]))) {
					return;
				}
				const frame = calcFrame(tmpcssMotionData[0]);
				const arrowNum = parseFloat(tmpcssMotionData[1]);
				const styleUp = (tmpcssMotionData[2] === `none` ? `` : tmpcssMotionData[2]);
				const styleDown = (tmpcssMotionData[3] === `none` ? `` : setVal(tmpcssMotionData[3], styleUp));

				cssMotionData.push([frame, arrowNum, styleUp, styleDown]);
			});

			// 個別のモーションデータが存在する場合、Effect設定を自動リセット
			if (cssMotionData.length > 0) {
				g_stateObj.effect = C_FLG_OFF;
				g_settings.effectNum = 0;
			}
			return cssMotionData.sort((_a, _b) => _a[0] - _b[0]).flat();
		}
		return [];
	};

	/**
	 * スクロール変化データの分解
	 * @param {number} _scoreNo 
	 * @returns {number[]}
	 */
	const setScrollchData = (_scoreNo) => {
		const dosScrollchData = getRefData(`scrollch`, `${_scoreNo}_data`) || _dosObj.scrollch_data;
		const scrollchData = [];

		if (hasVal(dosScrollchData)) {
			splitLF(dosScrollchData).filter(data => hasVal(data)).forEach(tmpData => {
				const tmpScrollchData = tmpData.split(`,`);
				if (isNaN(parseInt(tmpScrollchData[0]))) {
					return;
				}
				const frame = calcFrame(tmpScrollchData[0]);
				const arrowNum = parseFloat(tmpScrollchData[1]);
				const scrollDir = parseFloat(tmpScrollchData[2] ?? `1`);

				scrollchData.push([frame, arrowNum, frame, scrollDir]);
			});

			// 個別のスクロール変化が存在する場合、StepAreaを自動リセット
			if (scrollchData.length > 0) {
				g_stateObj.stepArea = `Default`;
				g_settings.stepAreaNum = 0;
			}
			return scrollchData.sort((_a, _b) => _a[0] - _b[0]).flat();
		}
		return [];
	};

	/**
	 * 譜面データに別の関連名が含まれていた場合、関連名の変数を返す
	 * 例) |backA2_data=back_data| -> back_dataで定義された値を使用
	 * @param {string} _header 
	 * @param {string} _dataName 
	 * @returns
	 */
	const getRefData = (_header, _dataName) => {
		const data = _dosObj[`${_header}${_dataName}`];
		let dataStr = data;
		splitLF(data)?.filter(val => val?.startsWith(_header) && _dosObj[val] !== undefined)
			.forEach(val => dataStr = dataStr.replace(val, _dosObj[val]));
		return dataStr;
	}

	/**
	 * 譜面データの優先順配列パターンの取得
	 * @param {string} _type 
	 * @param {number} _scoreNo 
	 * @returns {string[]}
	 */
	const getPriorityVal = (_type, _scoreNo) => [
		`${_type}${g_localeObj.val}${_scoreNo}_data`,
		`${_type}${g_localeObj.val}_data`,
		`${_type}${_scoreNo}_data`,
		`${_type}_data`
	];

	/**
	 * 歌詞表示、背景・マスクデータの優先順取得
	 * @param {string[]} _defaultHeaders 
	 * @returns {string[]}
	 */
	const getPriorityHeader = (_defaultHeaders = []) => {
		if (_defaultHeaders.length > 0) {
			return makeDedupliArray(_defaultHeaders);
		}

		const list = [];
		const ptnName = `${(g_keyObj.currentPtn === -1 ? g_keyObj.storagePtn : g_keyObj.currentPtn) + 1}`;
		const keyName = setVal(g_keyObj[`transKey${_keyCtrlPtn}`], g_keyObj.currentKey);
		let type = ``;
		if (g_stateObj.scroll !== `---`) {
			type = `Alt`;
		} else if (g_stateObj.reverse === C_FLG_ON) {
			type = `Rev`;
		}

		[g_stateObj.scroll, type, ``].forEach(header => {
			list.push(`${header}[${ptnName}]`, `${header}<${keyName}>`);
			if (hasVal(g_keyObj[`transKey${_keyCtrlPtn}`])) {
				list.push(`${header}A`);
			}
		});
		list.push(g_stateObj.scroll, type, ``);

		return makeDedupliArray(list);
	};

	/**
	 * 歌詞データの分解
	 * @param {string} _scoreNo 
	 * @returns
	 */
	const makeWordData = _scoreNo => {
		const wordDataList = [];
		const wordTargets = [];
		let wordReverseFlg = false;
		const divideCnt = getKeyInfo().divideCnt;
		const addDataList = (_type = ``) => wordTargets.push(...getPriorityVal(_type, _scoreNo));
		getPriorityHeader().forEach(val => addDataList(val));
		makeDedupliArray(wordTargets).forEach(val => wordDataList.push(getRefData(`word`, val)));

		if (g_stateObj.reverse === C_FLG_ON) {
			let wordTarget = ``;
			for (let val of makeDedupliArray(wordTargets)) {
				if (getRefData(`word`, val) !== undefined) {
					wordTarget = val;
					break;
				}
			}

			// wordRev_dataが指定されている場合はそのままの位置を採用
			// word_dataのみ指定されている場合、下記ルールに従って設定
			if (!wordTarget.includes(`Rev`) && g_stateObj.scroll === `---`) {
				// Reverse時の歌詞の自動反転制御設定
				if (g_headerObj.wordAutoReverse !== `auto`) {
					wordReverseFlg = g_headerObj.wordAutoReverse === C_FLG_ON;
				} else if (keyNum === divideCnt + 1) {
					wordReverseFlg = true;
				}
			}
		}

		const inputWordData = wordDataList.find((v) => v !== undefined);
		return (inputWordData !== undefined ? makeSpriteWordData(inputWordData, wordReverseFlg) : [[], -1]);
	};

	/**
	 * 多層歌詞データの格納処理
	 * @param {object} _data 
	 * @param {boolean} _reverseFlg
	 * @returns
	 */
	const makeSpriteWordData = (_data, _reverseFlg = false) => {
		const wordData = [];
		let wordMaxDepth = -1;
		let wordReverseFlg = _reverseFlg;
		const tmpArrayData = splitLF(_data);

		if (g_headerObj.wordAutoReverse === `auto`) {
			tmpArrayData.filter(data => hasVal(data) && data?.indexOf(`<br>`) !== -1).forEach(() => wordReverseFlg = false);
		}

		tmpArrayData.filter(data => hasVal(data)).forEach(tmpData => {
			const tmpWordData = tmpData.split(`,`).map(val => trimStr(val));
			for (let k = 0; k < tmpWordData.length; k += 3) {
				if (!hasVal(tmpWordData[k])) {
					continue;
				} else if (tmpWordData[k + 1] === `-`) {
					break;
				}
				tmpWordData[k] = calcFrame(setVal(tmpWordData[k], ``, C_TYP_CALC));
				tmpWordData[k + 1] = setVal(tmpWordData[k + 1], 0, C_TYP_CALC);
				tmpWordData[k + 1] = Math.floor(tmpWordData[k + 1] / 2) * 2 +
					(tmpWordData[k + 1] + Number(wordReverseFlg)) % 2;

				if (tmpWordData[k + 1] > wordMaxDepth) {
					wordMaxDepth = tmpWordData[k + 1];
				}

				// 同一行数で数字が取得できるまでは歌詞表示と見做して結合
				let m = 3;
				while (hasVal(tmpWordData[m]) && isNaN(parseInt(tmpWordData[m])) && m < tmpWordData.length) {
					tmpWordData[k + 2] += `,${tmpWordData[k + m]}`;
					tmpWordData.splice(k + m, 1);
				}

				// 歌詞表示データの格納
				let dataCnts = 0;
				[wordData[tmpWordData[k]], dataCnts] =
					checkDuplicatedObjects(wordData[tmpWordData[k]]);

				if (tmpWordData.length > 3 && tmpWordData.length < 6) {
					tmpWordData[3] = setIntVal(tmpWordData[3], C_WOD_FRAME);
					wordData[tmpWordData[0]][dataCnts].push(tmpWordData[1],
						escapeHtmlForEnabledTag(tmpWordData[2]), tmpWordData[3]);
					break;
				} else {
					wordData[tmpWordData[k]][dataCnts].push(tmpWordData[k + 1],
						escapeHtmlForEnabledTag(tmpWordData[k + 2] ?? ``));
				}
			}
		});

		return [wordData, wordMaxDepth];
	};

	/**
	 * 背景・マスク、スキン変更データの分解
	 * @param {string} _header 
	 * @param {string} _scoreNo 譜面番号
	 * @param {string[]} [object.resultTypes] リザルトモーションの種類 (result, failedB, failedS)
	 * @returns
	 */
	const makeBackgroundData = (_header, _scoreNo, { resultTypes = [] } = {}) => {
		const dataList = [];
		const animationTargets = [];
		const calcFrameFunc = resultTypes.length > 0 ? undefined : calcFrame;
		const addDataList = (_type = ``) => animationTargets.push(...getPriorityVal(_type, _scoreNo));
		getPriorityHeader(resultTypes).forEach(val => addDataList(val));
		makeDedupliArray(animationTargets).forEach(val => dataList.push(getRefData(_header, val)));

		const data = dataList.find((v) => v !== undefined);
		return (data !== undefined ? g_animationFunc.make[_header](data, calcFrameFunc) : [[], -1]);
	};

	// 速度変化データの分解 (2つで1セット)
	let speedFooter = ``;
	if (hasVal(_dosObj[`speed${scoreIdHeader}_data`])) {
		speedFooter = `_data`;
	}
	if (hasVal(_dosObj[`speed${scoreIdHeader}_change`])) {
		speedFooter = `_change`;
	}

	// 速度変化（個別・全体）の分解 (2つで1セット, セット毎の改行区切り可)
	obj.boostData = setSpeedData(`boost`, scoreIdHeader);
	obj.speedData = setSpeedData(`speed`, scoreIdHeader, speedFooter);

	// 色変化（個別・全体）の分解 (3つで1セット, セット毎の改行区切り可)
	g_typeLists.color.forEach(sprite => {
		obj[`${sprite}Data`] = setColorData(sprite, scoreIdHeader);
		if (g_stateObj.dummyId !== ``) {
			obj[`${sprite}DummyData`] = setColorData(sprite, _dummyNo);
		}
	});
	// 色変化（新形式）の分解（3～4つで1セット, セット毎の改行区切り）
	obj.ncolorData = setColor2Data(`ncolor`, scoreIdHeader);
	if (g_stateObj.dummyId !== ``) {
		obj.ncolorDummyData = setColor2Data(`ncolor`, _dummyNo);
	}

	if (_scoreAnalyzeFlg) {
		return obj;
	}

	obj.colorData = mergeColorData();
	obj.dummyColorData = mergeColorData(`Dummy`);

	// 矢印モーション（個別）データの分解（3～4つで1セット, セット毎の改行区切り）
	obj.arrowCssMotionData = setCssMotionData(`arrow`, scoreIdHeader);
	obj.frzCssMotionData = setCssMotionData(`frz`, scoreIdHeader);
	if (g_stateObj.dummyId !== ``) {
		obj.dummyArrowCssMotionData = setCssMotionData(`arrow`, _dummyNo);
		obj.dummyFrzCssMotionData = setCssMotionData(`frz`, _dummyNo);
	}

	// スクロール変化データの分解
	obj.scrollchData = setScrollchData(scoreIdHeader);

	// 歌詞データの分解 (3つで1セット, セット毎の改行区切り可)
	obj.wordData = [];
	obj.wordMaxDepth = -1;
	if (g_stateObj.d_lyrics === C_FLG_OFF) {
	} else {
		[obj.wordData, obj.wordMaxDepth] = makeWordData(scoreIdHeader);
	}

	// 背景・マスク・スキン変更データの分解 (下記すべてで1セット、改行区切り)
	// - 背景・マスク: [フレーム数, 階層, 背景パス, class(CSSで別定義), X, Y, width, height, opacity, animationName, animationDuration, animationFillMode]
	// - スキン変更  : [フレーム数, CSSカスタムプロパティ名, 設定内容]
	g_animationData.forEach(sprite => {
		obj[`${sprite}Data`] = [];
		obj[`${sprite}MaxDepth`] = -1;

		if (g_stateObj.d_background === C_FLG_OFF) {
		} else {
			[obj[`${sprite}Data`], obj[`${sprite}MaxDepth`]] = makeBackgroundData(sprite, scoreIdHeader);
		}

		if (g_stateObj.d_background === C_FLG_OFF && g_headerObj.resultMotionSet) {
			[`Result`, `Failed`].forEach(backName => {
				g_headerObj[`${backName}Data`] = [];
				g_headerObj[`${backName}MaxDepth`] = -1;
			});
		} else {
			[g_headerObj[`${sprite}ResultData`], g_headerObj[`${sprite}ResultMaxDepth`]] =
				makeBackgroundData(sprite, scoreIdHeader, { resultTypes: [`result`] });
			[g_headerObj[`${sprite}FailedData`], g_headerObj[`${sprite}FailedMaxDepth`]] =
				makeBackgroundData(sprite, scoreIdHeader, { resultTypes: [`failed${g_stateObj.lifeMode.slice(0, 1)}`, `result`] });
		}
	});

	// キー変化定義
	obj.keychFrames = [];
	obj.keychTarget = [];
	obj.keychTargetAlpha = [];
	if (hasVal(getRefData(`keych`, `${scoreIdHeader}_data`))) {
		const keychdata = splitLF2(getRefData(`keych`, `${scoreIdHeader}_data`), `,`);
		obj.keychFrames.push(...(keychdata.filter((val, j) => j % 2 === 0)).map(val => val === `0` ? 0 : calcFrame(val)));

		keychdata.filter((val, j) => j % 2 === 1)?.forEach(targets => {
			const targetKeyList = [], targetKeyAlpha = [];
			targets?.split(`/`).forEach(target => {
				targetKeyList.push(trimStr(target?.split(`:`)[0]));
				targetKeyAlpha.push(trimStr(target?.split(`:`)[1]) || 1);
			})
			obj.keychTarget.push(targetKeyList);
			obj.keychTargetAlpha.push(targetKeyAlpha);
		});
	}
	obj.keychFrames.unshift(0);
	obj.keychTarget.unshift([`0`]);
	obj.keychTargetAlpha.unshift([1]);

	return obj;
};

/**
 * ライフ回復量・ダメージ量の算出
 * @param {number} _allArrows 
 */
const calcLifeVals = _allArrows => {

	if (g_stateObj.lifeVariable === C_FLG_ON) {
		g_workObj.lifeRcv = calcLifeVal(g_stateObj.lifeRcv, _allArrows);
		g_workObj.lifeDmg = calcLifeVal(g_stateObj.lifeDmg, _allArrows);
	} else {
		g_workObj.lifeRcv = g_stateObj.lifeRcv;
		g_workObj.lifeDmg = g_stateObj.lifeDmg;
	}
	g_workObj.lifeBorder = g_headerObj.maxLifeVal * g_stateObj.lifeBorder / 100;
	g_workObj.lifeInit = g_headerObj.maxLifeVal * g_stateObj.lifeInit / 100;
};

/**
 * ライフ回復量・ダメージ量の算出
 * @param {number} _val 
 * @param {number} _allArrows 
 */
const calcLifeVal = (_val, _allArrows) => Math.round(_val * g_headerObj.maxLifeVal * 100 / _allArrows) / 100;

/**
 * 最終フレーム数の取得
 * @param {object} _dataObj 
 * @param {string} [_keyCtrlPtn]
 * @returns {number}
 */
const getLastFrame = (_dataObj, _keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`) => {

	let tmpLastNum = 0;
	const keyNum = g_keyObj[`${g_keyObj.defaultProp}${_keyCtrlPtn}`].length;

	for (let j = 0; j < keyNum; j++) {
		const data = [
			_dataObj.arrowData[j],
			_dataObj.frzData[j],
			_dataObj.dummyArrowData[j],
			_dataObj.dummyFrzData[j]
		];

		data.filter(data => hasVal(data)).forEach(_objData => {
			if (_objData.at(-1) > tmpLastNum) {
				tmpLastNum = _objData.at(-1);
			}
		});
	}
	return tmpLastNum;
};

/**
 * 最初の矢印フレームの取得
 * @param {object} _dataObj 
 * @param {string} [_keyCtrlPtn]
 * @returns {number}
 */
const getFirstArrowFrame = (_dataObj, _keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`) => {

	let tmpFirstNum = Infinity;
	const keyNum = g_keyObj[`${g_keyObj.defaultProp}${_keyCtrlPtn}`].length;

	for (let j = 0; j < keyNum; j++) {
		const data = [
			_dataObj.arrowData[j],
			_dataObj.frzData[j],
			_dataObj.dummyArrowData[j],
			_dataObj.dummyFrzData[j]
		];

		data.filter(data => hasVal(data)).forEach(_objData => {
			if (_objData[0] !== `` && _objData[0] < tmpFirstNum && _objData[0] + g_limitObj.adjustment > 0) {
				tmpFirstNum = _objData[0];
			}
		});
	}
	return (tmpFirstNum === Infinity ? 0 : tmpFirstNum);
};

/**
 * 開始フレームの取得
 * @param {number} _lastFrame 
 * @param {number} [_fadein=0]
 * @param {number} [_scoreId=g_scoreObj.scoreId]
 * @returns {number}
 */
const getStartFrame = (_lastFrame, _fadein = 0, _scoreId = g_stateObj.scoreId) => {
	let frameNum = setIntVal(g_headerObj.startFrame?.[_scoreId], setIntVal(g_headerObj.startFrame?.[0], 0));
	if (_lastFrame >= frameNum) {
		frameNum = Math.round(_fadein / 100 * (_lastFrame - frameNum)) + frameNum;
	}
	return frameNum;
};

/**
 * 各フレームごとの速度を格納
 * @param {object} _speedData 
 * @param {number} _lastFrame 
 * @returns {number[]}
 */
const setSpeedOnFrame = (_speedData, _lastFrame) => {

	const speedOnFrame = [];
	let currentSpeed = g_stateObj.speed * g_headerObj.baseSpeed * 2;

	for (let frm = 0, s = 0; frm <= _lastFrame; frm++) {
		while (frm >= _speedData?.[s]) {
			currentSpeed = _speedData[s + 1] * g_stateObj.speed * g_headerObj.baseSpeed * 2;
			s += 2;
		}
		speedOnFrame[frm] = currentSpeed;
	}
	return speedOnFrame;
};

/**
 * Motionオプション適用時の矢印別の速度設定
 * - 矢印が表示される最大フレーム数を 縦ピクセル数×20 と定義。
 */
const setMotionOnFrame = () => g_motionFunc[g_stateObj.motion](fillArray(g_headerObj.playingHeight * 20 + 1));

/**
 * Boost用の適用関数
 * - ステップゾーンに近づくにつれて加速量を大きく/小さくする (16 → 85)
 * @param {number[]} _frms 
 * @param {number} _spd 
 * @param {number} [_pnFlg=1] 正負(1 もしくは -1) 
 * @returns {number[]}
 */
const getBoostTrace = (_frms, _spd, _pnFlg = 1) => {
	for (let j = C_MOTION_STD_POS + 1; j < C_MOTION_STD_POS + 70; j++) {
		_frms[j] = (C_MOTION_STD_POS + 70 - j) * _pnFlg * _spd / 50;
	}
	return _frms;
};

/**
 * Brake用の適用関数
 * - 初期は+2x、ステップゾーンに近づくにつれて加速量を下げる (20 → 34)
 * @param {number[]} _frms
 * @returns {number[]} 
 */
const getBrakeTrace = _frms => {
	for (let j = C_MOTION_STD_POS + 5; j < C_MOTION_STD_POS + 19; j++) {
		_frms[j] = (j - 15) * 4 / 14;
	}
	for (let j = C_MOTION_STD_POS + 19; j <= g_headerObj.playingHeight / 2; j++) {
		_frms[j] = 4;
	}
	return _frms;
};

/**
 * Fountain用の適用関数
 * - 反対側から出現し、画面中央付近で折り返す。タイミングは初期速度により変化。
 * @param {number[]} _frms 
 * @param {number} _spd
 * @returns {number[]}
 */
const getFountainTrace = (_frms, _spd) => {
	const minj = C_MOTION_STD_POS + 1;
	const maxj = C_MOTION_STD_POS + Math.ceil(400 / _spd) + 1;
	const maxMotionFrm = Math.max(maxj, C_MOTION_STD_POS + g_sHeight / 2);
	const diff = 50 / (maxj - minj);
	const factor = 0.5 + _spd / 40;

	for (let j = minj; j < maxMotionFrm; j++) {
		_frms[j] = Math.floor((10 - (j - C_MOTION_STD_POS - 1) * diff) * factor);
	}
	return _frms;
}

/**
 * 最初のフレームで出現する矢印が、ステップゾーンに到達するまでのフレーム数を取得
 * @param {number} _startFrame 
 * @param {object} _speedOnFrame 
 * @param {object} _motionOnFrame
 * @returns {number} 
 */
const getFirstArrivalFrame = (_startFrame, _speedOnFrame, _motionOnFrame) => {
	let startY = 0;
	let frm = _startFrame;

	while (g_posObj.distY - startY > 0) {
		startY += _speedOnFrame[frm];
		frm++;
	}
	return frm;
};

/**
 * 矢印・フリーズアロー・速度/色変化格納処理
 * @param {object} _dataObj 
 * @param {object} _speedOnFrame 
 * @param {object} _motionOnFrame 
 * @param {number} _firstArrivalFrame
 */
const pushArrows = (_dataObj, _speedOnFrame, _motionOnFrame, _firstArrivalFrame) => {

	// 矢印・フリーズアロー・速度/色変化用 フレーム別処理配列
	[``, `Dummy`].forEach(header =>
		g_typeLists.dataList.forEach(name => g_workObj[`mk${header}${name}`] = []));

	/** 矢印の移動距離 */
	g_workObj.initY = [];
	/** 矢印の移動距離 (Motion加算分) */
	g_workObj.initBoostY = [];
	/** 矢印がステップゾーンに到達するまでのフレーム数 */
	g_workObj.arrivalFrame = [];
	/** Motionの適用フレーム数 */
	g_workObj.motionFrame = [];

	/**
	 * 矢印・フリーズアローのデータ格納処理
	 * @param {number} _j 
	 * @param {number} _k 
	 * @param {number[]} _data 
	 * @param {number} _startPoint 
	 * @param {string} _header 
	 * @param {boolean} _frzFlg 
	 * @param {number} object.initY
	 * @param {number} object.initBoostY
	 * @param {number} object.arrivalFrame
	 * @param {number} object.motionFrame 
	 */
	const setNotes = (_j, _k, _data, _startPoint, _header, _frzFlg = false, { initY, initBoostY, arrivalFrame, motionFrame } = {}) => {
		if (_startPoint >= 0) {
			const arrowAttrs = { pos: _j, initY, initBoostY, arrivalFrame, motionFrame };
			if (g_workObj[`mk${_header}Arrow`][_startPoint] === undefined) {
				g_workObj[`mk${_header}Arrow`][_startPoint] = [arrowAttrs];
			} else {
				let insertFlg = false;
				for (let m = 0; m < g_workObj[`mk${_header}Arrow`][_startPoint].length; m++) {
					if (arrowAttrs.arrivalFrame < g_workObj[`mk${_header}Arrow`][_startPoint][m].arrivalFrame) {
						g_workObj[`mk${_header}Arrow`][_startPoint].splice(m, 0, arrowAttrs);
						insertFlg = true;
						break;
					}
				}
				if (!insertFlg) {
					g_workObj[`mk${_header}Arrow`][_startPoint].push(arrowAttrs);
				}
			}
			if (_frzFlg) {
				g_workObj[`mk${_header}Length`][_j][_k] = getFrzLength(_speedOnFrame, _data[_k], _data[_k + 1]);
			}
		} else if (_frzFlg && g_workObj[`mk${_header}Length`][_j] !== undefined) {
			g_workObj[`mk${_header}Length`][_j] = structuredClone(g_workObj[`mk${_header}Length`][_j].slice(_k + 2));
		}
	};

	/**
	 * 矢印・フリーズアローの出現位置計算
	 * @param {number} _j 
	 * @param {number[]} _data 
	 * @param {string} _header 
	 * @param {boolean} _frzFlg 
	 */
	const calcNotes = (_j, _data, _header = ``, _frzFlg = false) => {
		if (_data === undefined) {
			return;
		}

		const calcInitBoostY = _frm => sumData(g_workObj.motionOnFrames.filter((val, j) => j <= g_workObj.motionFrame[_frm]));
		const camelHeader = toCapitalize(_header);
		const setcnt = (_frzFlg ? 2 : 1);
		if (_frzFlg && _data.length % 2 !== 0) {
			_data.pop();
		}

		const startPoint = [];
		let spdNext = Infinity;
		let spdk = (_dataObj.speedData?.length ?? 0) - 2;
		let spdPrev = _dataObj.speedData?.[spdk] ?? 0;

		// 最後尾のデータから計算して格納
		const lastk = _data.length - setcnt;
		let arrowArrivalFrm = _data[lastk];
		let tmpObj = getArrowStartFrame(arrowArrivalFrm, _speedOnFrame, _motionOnFrame);

		startPoint[lastk] = tmpObj.frm;
		let frmPrev = tmpObj.frm;
		g_workObj.initY[frmPrev] = tmpObj.startY;
		g_workObj.arrivalFrame[frmPrev] = tmpObj.arrivalFrm;
		g_workObj.motionFrame[frmPrev] = tmpObj.motionFrm;
		g_workObj.initBoostY[frmPrev] = calcInitBoostY(frmPrev);

		if (_frzFlg) {
			g_workObj[`mk${camelHeader}Length`][_j] = [];
		}
		setNotes(_j, lastk, _data, startPoint[lastk], camelHeader, _frzFlg,
			{ initY: tmpObj.startY, initBoostY: g_workObj.initBoostY[frmPrev], arrivalFrame: tmpObj.arrivalFrm, motionFrame: tmpObj.motionFrm });

		// 矢印は1つずつ、フリーズアローは2つで1セット
		for (let k = lastk - setcnt; k >= 0; k -= setcnt) {
			arrowArrivalFrm = _data[k];

			if (arrowArrivalFrm < _firstArrivalFrame) {

				// 出現位置が開始前の場合は除外
				if (_frzFlg && g_workObj[`mk${camelHeader}Length`][_j] !== undefined) {
					g_workObj[`mk${camelHeader}Length`][_j] = structuredClone(g_workObj[`mk${camelHeader}Length`][_j].slice(k + 2));
				}
				break;

			} else if ((arrowArrivalFrm - g_workObj.arrivalFrame[frmPrev] > spdPrev)
				&& arrowArrivalFrm < spdNext) {

				// 最初から最後まで同じスピードのときは前回のデータを流用
				const tmpFrame = arrowArrivalFrm - g_workObj.arrivalFrame[frmPrev];
				startPoint[k] = tmpFrame;
				g_workObj.initY[tmpFrame] = g_workObj.initY[frmPrev];
				g_workObj.arrivalFrame[tmpFrame] = g_workObj.arrivalFrame[frmPrev];
				g_workObj.motionFrame[tmpFrame] = g_workObj.motionFrame[frmPrev];
				g_workObj.initBoostY[tmpFrame] = calcInitBoostY(tmpFrame);

			} else {

				// 速度変化が間に入るときは再計算
				while (arrowArrivalFrm < spdPrev) {
					spdk -= 2;
					spdNext = spdPrev;
					spdPrev = _dataObj.speedData[spdk];
				}
				tmpObj = getArrowStartFrame(arrowArrivalFrm, _speedOnFrame, _motionOnFrame);

				startPoint[k] = tmpObj.frm;
				frmPrev = tmpObj.frm;
				g_workObj.initY[frmPrev] = tmpObj.startY;
				g_workObj.arrivalFrame[frmPrev] = tmpObj.arrivalFrm;
				g_workObj.motionFrame[frmPrev] = tmpObj.motionFrm;
				g_workObj.initBoostY[frmPrev] = calcInitBoostY(frmPrev);
			}

			// 出現タイミングを保存
			setNotes(_j, k, _data, startPoint[k], camelHeader, _frzFlg,
				{ initY: tmpObj.startY, initBoostY: g_workObj.initBoostY[frmPrev], arrivalFrame: tmpObj.arrivalFrm, motionFrame: tmpObj.motionFrm }
			);
		}
	};

	for (let j = 0; j < getKeyInfo().keyNum; j++) {

		// 矢印の出現フレーム数計算
		calcNotes(j, _dataObj.arrowData[j]);
		calcNotes(j, _dataObj.dummyArrowData[j], `dummy`);

		// フリーズアローの出現フレーム数計算
		calcNotes(j, _dataObj.frzData[j], `frz`, true);
		calcNotes(j, _dataObj.dummyFrzData[j], `dummyFrz`, true);
	}

	// 個別加速のタイミング更新
	const calcBoostData = _data => {
		if (hasArrayList(_data, 2)) {
			let delIdx = 0;
			for (let k = _data.length - 2; k >= 0; k -= 2) {
				const tmpObj = getArrowStartFrame(_data[k], _speedOnFrame, _motionOnFrame);
				if (tmpObj.frm < g_scoreObj.frameNum) {
					_data[k] = g_scoreObj.frameNum;
					delIdx = k;
					break;
				} else {
					_data[k] = tmpObj.frm;
				}
			}
			for (let k = 0; k < delIdx; k++) {
				_data.shift();
			}
			return _data;
		}
		return [];
	};
	g_workObj.boostData = calcBoostData(_dataObj.boostData);

	/**
	 * 色変化・モーションデータ・スクロール反転データのタイミング更新
	 * - この関数を使用する場合、配列グループの先頭2つが「フレーム数、矢印番号」となっていないと動作しない
	 * @param {string} _type 
	 * @param {string} _header 
	 * @param {function} _setFunc 後続実行関数
	 * @param {number} object._term 1セット当たりのデータ数 
	 * @param {boolean} object._colorFlg 個別色変化フラグ
	 * @param {boolean} object._calcFrameFlg 逆算を無条件で行うかどうかの可否
	 * @param {string} object._propName 色変化種類 (Arrow, ArrowShadow, FrzNormal, FrzNormalBar, ...)
	 */
	const calcDataTiming = (_type, _header, _setFunc = () => true,
		{ _term = 4, _colorFlg = false, _calcFrameFlg = false, _propName = `` } = {}) => {

		const camelHeader = _header === `` ? _type : `${_header}${toCapitalize(_type)}`;
		const baseData = hasVal(_propName) ? _dataObj[`${camelHeader}Data`][_propName] : _dataObj[`${camelHeader}Data`];

		if (!hasArrayList(baseData, _term)) {
			return;
		}
		const frontData = [];
		for (let k = baseData.length - _term; k >= 0; k -= _term) {
			const calcFrameFlg = (_colorFlg && !baseData[k + 3]) || _calcFrameFlg;

			if (baseData[k] < g_scoreObj.frameNum) {
				// フェードイン直前にある色変化・モーションデータ・スクロール反転データを取得して格納
				if (!hasValInArray(baseData[k + 1], frontData)) {
					frontData.unshift(baseData.slice(k + 1, k + _term));
				}
			} else {
				if (calcFrameFlg) {
					const tmpObj = getArrowStartFrame(baseData[k], _speedOnFrame, _motionOnFrame);
					if (tmpObj.frm < g_scoreObj.frameNum) {
						const diff = g_scoreObj.frameNum - tmpObj.frm;
						tmpObj.frm = g_scoreObj.frameNum;
						tmpObj.arrivalFrm -= diff;
					}
					g_workObj.arrivalFrame[tmpObj.frm] = tmpObj.arrivalFrm;
					baseData[k] = tmpObj.frm;
				}
				_setFunc(toCapitalize(_header), ...baseData.slice(k, k + _term));
			}
		}
		frontData.forEach(data => _setFunc(toCapitalize(_header), g_scoreObj.frameNum, ...data));
	};

	/**
	 * 歌詞表示、背景・マスク表示のフェードイン時調整処理
	 * @param {string} _type
	 * @param {object} _data 
	 * @returns
	 */
	const calcAnimationData = (_type, _data) => {

		const startNum = g_scoreObj.frameNum;
		const cgArrays = [`word`];

		const isSameDepth = (_j, _k) =>
			_data[startNum][_j] !== undefined &&
			_data[startNum][_k] !== undefined &&
			(cgArrays.includes(_type) ? _data[startNum][_j][0] === _data[startNum][_k][0] :
				_data[startNum][_j].depth === _data[startNum][_k].depth);

		const isExceptData = {
			word: (_exceptList, _j) => listMatching(_data[startNum][_j][1] || ``, _exceptList.word),
			back: (_exceptList, _j) => listMatching(_data[startNum][_j].animationName || ``, _exceptList.back),
			mask: (_exceptList, _j) => listMatching(_data[startNum][_j].animationName || ``, _exceptList.mask),
			style: (_exceptList, _j) => listMatching(_data[startNum][_j].depth || ``, _exceptList.style),
		};

		const getLength = _list =>
			_list === undefined ? 0 :
				(cgArrays.includes(_type) ? _list.length : Object.keys(_list).length);

		// フェードイン位置にそれ以前のデータを前追加
		if (startNum > 0 && _data[startNum] === undefined) {
			_data[startNum] = [];
		}
		for (let j = _data.length - 1; j >= 0; j--) {
			if (_data[j] !== undefined && j < g_scoreObj.frameNum) {
				_data[startNum].unshift(..._data[j]);
				_data[j] = undefined;
			}
		}

		// 重複する深度をカット（後方優先）
		// ただし、除外リストにあるデータは残す
		for (let j = getLength(_data[startNum]) - 1; j >= 0; j--) {
			if (_data[startNum][j] !== undefined) {
				for (let k = j - 1; k >= 0; k--) {
					if (isSameDepth(j, k) && !isExceptData[_type](g_preloadExceptList, k)) {
						_data[startNum][k] = undefined;
					}
				}
			}
		}
		// g_stockForceDelList に合致する消去対象データを検索し、削除
		for (let j = getLength(_data[startNum]) - 1; j >= 0; j--) {
			if (_data[startNum][j] !== undefined && isExceptData[_type](g_stockForceDelList, j)) {
				_data[startNum][j] = undefined;
			}
		}

		// カットした箇所をリストから削除
		if (getLength(_data[startNum]) > 0) {
			_data[startNum] = _data[startNum].filter(list => getLength(list) > 0);
		}

		return _data;
	};

	// 個別・全体色変化、モーションデータ・スクロール反転データのタイミング更新
	[``, `dummy`].forEach(type => {
		calcDataTiming(`color`, type, pushColors, { _colorFlg: true });
		if (_dataObj[`ncolor${type}Data`] !== undefined) {
			Object.keys(_dataObj[`ncolor${type}Data`]).forEach(pattern =>
				calcDataTiming(`ncolor`, type, pushColors, { _term: 5, _colorFlg: true, _propName: pattern }));
		}
	});

	g_typeLists.arrow.forEach(header =>
		calcDataTiming(`cssMotion`, header, pushCssMotions, { _calcFrameFlg: true }));

	calcDataTiming(`scrollch`, ``, pushScrollchs, { _calcFrameFlg: true });

	g_fadeinStockList.forEach(type =>
		_dataObj[`${type}Data`] = calcAnimationData(type, _dataObj[`${type}Data`]));


	// 実際に処理させる途中変速配列を作成
	g_workObj.speedData = [];
	g_workObj.speedData.push(g_scoreObj.frameNum);
	g_workObj.speedData.push(_speedOnFrame[g_scoreObj.frameNum]);

	for (let k = 0; k < _dataObj?.speedData.length; k += 2) {
		if (_dataObj.speedData[k] >= g_scoreObj.frameNum) {
			g_workObj.speedData.push(_dataObj.speedData[k]);
			g_workObj.speedData.push(_speedOnFrame[_dataObj.speedData[k]]);
		}
	}
};

/**
 * ステップゾーン到達地点から逆算して開始フレームを取得
 * @param {number} _frame 
 * @param {object} _speedOnFrame 
 * @param {object} _motionOnFrame 
 * @returns {{ frm: number, startY: number, arrivalFrm: number, motionFrm: number }}
 */
const getArrowStartFrame = (_frame, _speedOnFrame, _motionOnFrame) => {

	const obj = {
		frm: _frame,
		startY: 0,
		arrivalFrm: 0,
		motionFrm: C_MOTION_STD_POS
	};

	while (g_posObj.distY - obj.startY > 0) {
		obj.startY += _speedOnFrame[obj.frm - 1];

		if (_speedOnFrame[obj.frm - 1] !== 0) {
			obj.motionFrm++;
		}
		obj.frm--;
		obj.arrivalFrm++;
	}

	return obj;
};

/**
 * 速度を加味したフリーズアローの長さを取得
 * @param {object} _speedOnFrame 
 * @param {number} _startFrame 
 * @param {number} _endFrame 
 * @returns {number}
 */
const getFrzLength = (_speedOnFrame, _startFrame, _endFrame) => {
	let frzLength = 0;

	for (let frm = _startFrame; frm < _endFrame; frm++) {
		frzLength += _speedOnFrame[frm];
	}
	return frzLength;
};

/**
 * キーパターン(デフォルト)に対応する矢印番号を格納
 * - 色変化、矢印・フリーズアローモーション、スクロール変化で
 *   矢印レーンの番号を実際のキーパターンに対応する番号に置き換える際に使用
 * - 例: [0, 1, 2, 3, 4] -> [4, 0, 1, 2, 3]
 */
const convertReplaceNums = () => {
	const tkObj = getKeyInfo();
	const baseCharas = g_keyObj[`chara${g_keyObj.currentKey}_0`];
	const convCharas = g_keyObj[`chara${tkObj.keyCtrlPtn}`];

	g_workObj.replaceNums = [];

	for (let j = 0; j < tkObj.keyNum; j++) {
		for (let k = 0; k < tkObj.keyNum; k++) {
			if (baseCharas[j] === convCharas[k]) {
				g_workObj.replaceNums[j] = k;
				continue;
			}
		}
	}
};

/**
 * 色情報の格納
 * @param {string} _header 
 * @param {number} _frame 
 * @param {number} _val 色番号
 * @param {string} _colorCd カラーコード
 * @param {string} _allFlg 全体色変化有無
 * @param {string} _pattern 色変化種類 (Arrow, ArrowShadow, FrzNormal, FrzNormalBar, ...)
 */
const pushColors = (_header, _frame, _val, _colorCd, _allFlg, _pattern = ``) => {

	const tkObj = getKeyInfo();
	const grdFlg = (g_colorType === `Type0` ? !g_headerObj.defaultColorgrd[0] : g_headerObj.defaultColorgrd[0]);
	const colorCd = makeColorGradation(_colorCd, { _defaultColorgrd: [grdFlg, g_headerObj.defaultColorgrd[1]] });
	const addAll = Number(_allFlg) * 1000;
	const allUseTypes = [];

	/**
	 * 全体色変化の有効化（フレーム別）
	 * @param  {...any} _types 
	 */
	const enabledAll = (..._types) => {
		if (_allFlg) {
			_types.forEach(type => g_workObj[`mk${type}ColorChangeAll`][_frame] = true);
		}
	};

	/**
	 * 色変化用配列（フレーム別）へのデータ追加
	 * @param {string} _baseStr 
	 * @param {number} _cVal 
	 */
	const pushColor = (_baseStr, _cVal) => {
		g_workObj[_baseStr][_frame]?.push(_cVal) || (g_workObj[_baseStr][_frame] = [_cVal]);
		g_workObj[`${_baseStr}Cd`][_frame]?.push(colorCd) || (g_workObj[`${_baseStr}Cd`][_frame] = [colorCd]);
	};

	/**
	 * 色変化データ(ncolor_data)の格納処理
	 */
	const executePushColors = () => {
		const baseHeaders = [];
		if (_pattern.startsWith(`Arrow`)) {
			baseHeaders.push(`mk${_header}Color${_pattern.slice('Arrow'.length)}`);
			allUseTypes.push(`Arrow`);

			// フリーズアロー色の追随設定がある場合、対象を追加
			if (_pattern === `Arrow`) {
				g_headerObj.frzScopeFromArrowColors.forEach(type =>
					baseHeaders.push(`mk${_header}FColor${type}`, `mk${_header}FColor${type}Bar`));
				if (g_headerObj.frzScopeFromArrowColors.length > 0) {
					allUseTypes.push(`Frz`);
				}
			}
		} else {
			baseHeaders.push(`mk${_header}FColor${_pattern}`);
			allUseTypes.push(`Frz`);
		}
		// 色変化情報の格納
		if (_val.startsWith('g')) {
			// g付きの場合は矢印グループから対象の矢印番号を検索
			const groupVal = setIntVal(_val.slice(1));
			for (let j = 0; j < tkObj.keyNum; j++) {
				if (g_keyObj[`color${tkObj.keyCtrlPtn}`][j] === groupVal) {
					baseHeaders.forEach(baseHeader => pushColor(baseHeader, j + addAll));
				}
			}
		} else {
			baseHeaders.forEach(baseHeader => pushColor(baseHeader, g_workObj.replaceNums[setIntVal(_val)] + addAll));
		}
	};

	/**
	 * 従来の色変化データ派生(color_data, acolor_data)の格納処理
	 */
	const executePushColorsOld = () => {

		if (_val < 30 || _val >= 1000) {
			const baseHeaders = [`mk${_header}Color`];
			allUseTypes.push(`Arrow`);

			// フリーズアロー色の追随設定がある場合、対象を追加
			g_headerObj.frzScopeFromArrowColors.forEach(type =>
				baseHeaders.push(`mk${_header}FColor${type}`, `mk${_header}FColor${type}Bar`));
			if (g_headerObj.frzScopeFromArrowColors.length > 0) {
				allUseTypes.push(`Frz`);
			}

			// 矢印の色変化 (追随指定時はフリーズアローも色変化)
			baseHeaders.forEach(baseHeader => {
				if (_val < 20 || _val >= 1000) {
					pushColor(baseHeader, g_workObj.replaceNums[_val % 1000] + addAll);
				} else if (_val >= 20) {
					const colorNum = _val - 20;
					for (let j = 0; j < tkObj.keyNum; j++) {
						if (g_keyObj[`color${tkObj.keyCtrlPtn}`][j] === colorNum) {
							pushColor(baseHeader, j + addAll);
						}
					}
				}
			});

		} else {
			const baseHeader = `mk${_header}FColor`;
			allUseTypes.push(`Frz`);

			// フリーズアローの色変化
			const tmpVals = [];
			if (_val < 50) {
				tmpVals.push(_val % 30);
			} else if (_val < 60) {
				tmpVals.push((_val % 50) * 2, (_val % 50) * 2 + 1);
			} else {
				if (_val === 60) {
					tmpVals.push(...Array(8).keys());
				} else {
					tmpVals.push(...[...Array(8).keys()].map(j => j + 10));
				}
			}
			tmpVals.forEach(targetj => {

				// targetj=0,2,4,6,8 ⇒ Arrow, 1,3,5,7,9 ⇒ Bar
				const ctype = (targetj >= 10 ? `Hit` : `Normal`) + (targetj % 2 === 0 ? `` : `Bar`);
				const colorPos = Math.ceil((targetj % 10 - 1) / 2);

				g_keyObj[`color${tkObj.keyCtrlPtn}`].forEach((cpattern, k) => {
					if (colorPos === cpattern) {
						pushColor(baseHeader + ctype, k + addAll);
					}
				});
			});
		}
	};
	hasVal(_pattern) ? executePushColors() : executePushColorsOld();
	enabledAll(...allUseTypes);
};

/**
 * CSSモーション情報の格納
 * @param {string} _header 
 * @param {number} _frame 
 * @param {number} _val 
 * @param {string} _styleName
 * @param {string} _styleNameRev
 */
const pushCssMotions = (_header, _frame, _val, _styleName, _styleNameRev) => {

	const camelHeader = toCapitalize(_header);
	const tkObj = getKeyInfo();

	// 矢印のモーション
	if (g_workObj[`mk${camelHeader}CssMotion`][_frame] === undefined) {
		g_workObj[`mk${camelHeader}CssMotion`][_frame] = [];
		g_workObj[`mk${camelHeader}CssMotionName`][_frame] = [];
	}
	if (_val < 20 || _val >= 1000) {
		const realVal = g_workObj.replaceNums[_val % 1000];
		g_workObj[`mk${camelHeader}CssMotion`][_frame].push(realVal);
		g_workObj[`mk${camelHeader}CssMotionName`][_frame].push(_styleName, _styleNameRev);

	} else {
		const colorNum = _val - 20;
		for (let j = 0; j < tkObj.keyNum; j++) {
			if (g_keyObj[`color${tkObj.keyCtrlPtn}`][j] === colorNum) {
				g_workObj[`mk${camelHeader}CssMotion`][_frame].push(j);
				g_workObj[`mk${camelHeader}CssMotionName`][_frame].push(_styleName, _styleNameRev);
			}
		}
	}
};

/**
 * スクロール変化情報の格納
 * @param {string} _header 
 * @param {number} _frameArrow 
 * @param {number} _val 
 * @param {number} _frameStep 
 * @param {number} _scrollDir 
 */
const pushScrollchs = (_header, _frameArrow, _val, _frameStep, _scrollDir) => {
	const tkObj = getKeyInfo();

	const frameArrow = Math.max(_frameArrow, g_scoreObj.frameNum);
	const frameStep = Math.max(_frameStep, g_scoreObj.frameNum);
	const pushData = (_pattern, _frame, _val) =>
		g_workObj[`mkScrollch${_pattern}`][_frame]?.push(_val) || (g_workObj[`mkScrollch${_pattern}`][_frame] = [_val]);

	if (_val < 20 || _val >= 1000) {
		const realVal = g_workObj.replaceNums[_val % 1000];
		pushData(`Arrow`, frameArrow, realVal);
		pushData(`ArrowDir`, frameArrow, _scrollDir);
		pushData(`Step`, frameStep, realVal);
		pushData(`StepDir`, frameStep, _scrollDir);

	} else {
		const colorNum = _val - 20;
		for (let j = 0; j < tkObj.keyNum; j++) {
			if (g_keyObj[`color${tkObj.keyCtrlPtn}`][j] === colorNum) {
				pushData(`Arrow`, frameArrow, j);
				pushData(`ArrowDir`, frameArrow, _scrollDir);
				pushData(`Step`, frameStep, j);
				pushData(`StepDir`, frameStep, _scrollDir);
			}
		}
	}
};

/**
 * メイン画面前の初期化処理
 */
const getArrowSettings = () => {

	g_attrObj = {};
	const tkObj = getKeyInfo();
	const [keyCtrlPtn, keyNum, posMax, divideCnt] =
		[tkObj.keyCtrlPtn, tkObj.keyNum, tkObj.posMax, tkObj.divideCnt];

	g_keyCopyLists.simpleDef.forEach(header => updateKeyInfo(header, keyCtrlPtn));
	g_headerObj.tuning = g_headerObj.creatorNames[g_stateObj.scoreId];

	delete g_workObj.initY;
	delete g_workObj.initBoostY;
	delete g_workObj.arrivalFrame;
	delete g_workObj.motionFrame;

	g_workObj.stepX = [];
	g_workObj.scrollDir = [];
	g_workObj.scrollDirDefault = [];
	g_workObj.dividePos = [];
	g_workObj.stepRtn = structuredClone(g_keyObj[`stepRtn${keyCtrlPtn}`]);
	g_workObj.stepHitRtn = structuredClone(g_keyObj[`stepRtn${keyCtrlPtn}`]);
	g_workObj.arrowRtn = structuredClone(g_keyObj[`stepRtn${keyCtrlPtn}`]);
	g_workObj.keyCtrl = structuredClone(g_keyObj[`keyCtrl${keyCtrlPtn}`]);
	g_workObj.diffList = [];
	g_workObj.mainEndTime = 0;

	g_workObj.keyGroupMaps = tkObj.keyGroupMaps;
	g_workObj.keyGroupList = tkObj.keyGroupList;

	const keyCtrlLen = g_workObj.keyCtrl.length;
	g_workObj.keyCtrlN = [...Array(keyCtrlLen)].map(() => []);
	g_workObj.keyHitFlg = [...Array(keyCtrlLen)].map(() => []);
	for (let j = 0; j < g_workObj.keyCtrl.length; j++) {
		for (let k = 0; k < g_workObj.keyCtrl[j].length; k++) {
			g_workObj.keyCtrlN[j][k] = g_kCdN[g_workObj.keyCtrl[j][k]];
			g_workObj.keyHitFlg[j][k] = false;
		}
	}

	g_typeLists.arrow.forEach(type => g_workObj[`judg${toCapitalize(type)}Cnt`] = fillArray(keyNum, 1));
	g_workObj.judgFrzHitCnt = fillArray(keyNum, 1);
	g_judgObj.lockFlgs = fillArray(keyNum, false);

	// 矢印色管理 (個別・全体)
	const eachOrAll = [``, `All`];
	eachOrAll.forEach(type => {
		[`arrow`, `dummyArrow`].forEach(arrowType =>
			g_typeLists.arrowColor.forEach(objType => g_workObj[`${arrowType}${objType}Colors${type}`] = []));

		[`frz`, `dummyFrz`].forEach(arrowType =>
			g_typeLists.frzColor.forEach(frzType => g_workObj[`${arrowType}${frzType}Colors${type}`] = []));
	});

	// モーション管理
	g_typeLists.arrow.forEach(type => g_workObj[`${type}CssMotions`] = fillArray(keyNum, ``));
	g_workObj.frzArrowCssMotions = fillArray(keyNum, ``);
	g_workObj.dummyFrzArrowCssMotions = fillArray(keyNum, ``);

	const scrollDirOptions = g_keyObj[`scrollDir${keyCtrlPtn}`]?.[g_stateObj.scroll] ?? fillArray(keyNum, 1);

	g_stateObj.autoAll = boolToSwitch(g_stateObj.autoPlay === C_FLG_ALL);
	g_workObj.hitPosition = (g_stateObj.autoAll === C_FLG_ON ? 0 : g_stateObj.hitPosition);
	changeSetColor();

	for (let j = 0; j < keyNum; j++) {

		const posj = g_keyObj[`pos${keyCtrlPtn}`][j];
		const colorj = g_keyObj[`color${keyCtrlPtn}`][j];
		const stdPos = posj - ((posj > divideCnt ? posMax : 0) + divideCnt) / 2;

		g_workObj.stepX[j] = g_keyObj.blank * stdPos + (g_headerObj.playingWidth - C_ARW_WIDTH) / 2;
		g_workObj.dividePos[j] = ((posj <= divideCnt ? 0 : 1) + (scrollDirOptions[j] === 1 ? 0 : 1) + (g_stateObj.reverse === C_FLG_OFF ? 0 : 1)) % 2;
		if (g_stateObj.stepArea === `X-Flower`) {
			g_workObj.dividePos[j] = (g_workObj.stepX[j] < (g_headerObj.playingWidth - C_ARW_WIDTH) / 2 ? 0 : 1) * 2 + g_workObj.dividePos[j] % 2;
		}
		g_workObj.scrollDir[j] = (posj <= divideCnt ? 1 : -1) * scrollDirOptions[j] * (g_stateObj.reverse === C_FLG_OFF ? 1 : -1);

		eachOrAll.forEach(type => {
			g_workObj[`arrowColors${type}`][j] = g_headerObj.setColor[colorj];
			g_workObj[`dummyArrowColors${type}`][j] = g_headerObj.setDummyColor[colorj];
			g_workObj[`arrowShadowColors${type}`][j] = g_headerObj.setShadowColor[colorj] || ``;
			g_workObj[`dummyArrowShadowColors${type}`][j] = g_headerObj.setDummyColor[colorj] || ``;

			g_typeLists.frzColor.forEach((frzType, k) => {
				g_workObj[`frz${frzType}Colors${type}`][j] = g_headerObj.frzColor[colorj][k] || ``;
				g_workObj[`dummyFrz${frzType}Colors${type}`][j] =
					frzType.includes(`Shadow`) ? `` : g_headerObj.setDummyColor[colorj] || ``;
			});
			g_workObj[`frzNormalShadowColors${type}`][j] = g_headerObj.frzShadowColor[colorj][0] || ``;
			g_workObj[`frzHitShadowColors${type}`][j] = g_headerObj.frzShadowColor[colorj][1] || ``;
		});
	}
	g_workObj.scrollDirDefault = g_workObj.scrollDir.concat();
	g_stateObj.layerNum = Math.ceil((Math.max(...g_workObj.dividePos) + 1) / 2) * 2;

	Object.keys(g_resultObj).forEach(judgeCnt => g_resultObj[judgeCnt] = 0);
	g_resultObj.spState = ``;

	g_displays.forEach(_disp => {
		const lowerDisp = _disp.toLowerCase();
		g_workObj[`${lowerDisp}Disp`] = (g_stateObj[`d_${lowerDisp}`] === C_FLG_OFF ? C_DIS_NONE : C_DIS_INHERIT);
	});

	g_workObj.lifeVal = Math.floor(g_workObj.lifeInit * 100) / 100;
	g_gameOverFlg = false;
	g_finishFlg = true;
	g_workObj.nonDefaultSc = g_headerObj.keyRetry !== C_KEY_RETRY || g_headerObj.keyTitleBack !== C_KEY_TITLEBACK;
	if (g_headerObj.scAreaWidth === 0 && (g_headerObj.keyRetry !== g_headerObj.keyRetryDef2 || g_headerObj.keyTitleBack !== g_headerObj.keyTitleBackDef2)) {
		g_workObj.nonDefaultSc = false;
	}

	g_workObj.backX = (g_workObj.nonDefaultSc && g_headerObj.playingLayout ? g_headerObj.scAreaWidth : 0);
	g_workObj.playingX = g_headerObj.playingX + g_workObj.backX;

	// Swapping設定に応じたステップゾーンの入れ替え
	if (g_stateObj.swapping.includes(`Mirror`)) {

		let _style = structuredClone(Object.values(g_workObj.shuffleGroupMap));
		if (g_stateObj.swapping === `Mirror`) {
			_style.map(_group => _group.reverse());

		} else if (g_stateObj.swapping === `X-Mirror`) {
			// X-Mirrorの場合、グループの内側だけ入れ替える
			_style.forEach((group, i) => g_settings.swapPattern.forEach(val => swapGroupNums(_style, group, i, val)));
		}

		// 入れ替えた結果に合わせてX座標位置を入れ替える
		g_workObj.stepX_df = structuredClone(g_workObj.stepX);
		_style.forEach((_group, _i) => {
			_group.forEach((_val, _j) => {
				g_workObj.stepX[_group[_j]] = g_workObj.stepX_df[g_workObj.shuffleGroupMap[_i][_j]];
			});
		});
	}

	// FrzReturnの初期化
	g_workObj.frzReturnFlg = false;

	// AutoRetryの初期化
	g_workObj.autoRetryFlg = false;

	// Camoufrageの設定
	if (!g_stateObj.rotateEnabled) {

		// 矢印の回転が無効の場合は、設定を変える
		if (g_stateObj.camoufrage === `Arrow`) {
			g_stateObj.camoufrage = C_FLG_OFF;
		} else if (g_stateObj.camoufrage === C_FLG_ALL) {
			g_stateObj.camoufrage = `Color`;
		}
		g_settings.camoufrageNum = g_settings.camoufrages.findIndex(val => val === g_stateObj.camoufrage);
	}
	if (g_stateObj.camoufrage !== C_FLG_OFF) {
		const eachOrAll = [``, `All`];
		const keyNum = g_keyObj[`chara${g_keyObj.currentKey}_${g_keyObj.currentPtn}`].length;

		// 位置変更用の配列を作成
		const randArray = [...Array(keyNum).keys()].map(_i => _i);
		let _i = randArray.length;
		while (_i) {
			const _j = Math.floor(Math.random() * _i--);
			[randArray[_i], randArray[_j]] = [randArray[_j], randArray[_i]];
		}

		// 位置変更用の配列に従い、初期矢印・初期色の位置変更
		const getSwapArray = (_array) => {
			const _copiedArray = structuredClone(_array);
			return _array.map((_val, _i) => _array[_i] = _copiedArray[randArray[_i]]);
		};
		if (g_stateObj.camoufrage === `Arrow` || g_stateObj.camoufrage === C_FLG_ALL) {

			// 矢印ヒット時に元の矢印がわかるようにするため、あえて g_workObj.stepHitRtn はそのままにする
			g_workObj.stepRtn = getSwapArray(g_workObj.stepRtn);
			g_workObj.arrowRtn = getSwapArray(g_workObj.arrowRtn);
		}
		eachOrAll.forEach(type => {
			if (g_stateObj.camoufrage === `Color` || g_stateObj.camoufrage === C_FLG_ALL) {

				// ダミー矢印は対象外
				g_workObj[`arrowColors${type}`] = getSwapArray(g_workObj[`arrowColors${type}`]);
				g_workObj[`arrowShadowColors${type}`] = getSwapArray(g_workObj[`arrowShadowColors${type}`]);

				g_typeLists.frzColor.forEach(frzType => {
					g_workObj[`frz${frzType}Colors${type}`] = getSwapArray(g_workObj[`frz${frzType}Colors${type}`]);
				});
				g_workObj[`frzNormalShadowColors${type}`] = getSwapArray(g_workObj[`frzNormalShadowColors${type}`]);
				g_workObj[`frzHitShadowColors${type}`] = getSwapArray(g_workObj[`frzHitShadowColors${type}`]);
			}
		});

		// 位置変更用の配列に従い、個別・全体色変化の位置変更
		if (g_stateObj.camoufrage === `Color` || g_stateObj.camoufrage === C_FLG_ALL) {
			const getSwapList = (_array) => {
				const _copiedArray = structuredClone(_array);
				return _array.map((_val, _i) => _array[_i] = randArray[_copiedArray[_i]]);
			};
			[`mkColor`, `mkColorShadow`, `mkFColor`, `mkFColorShadow`].forEach(type => {
				if (g_workObj[type] !== undefined) {
					for (let j = 0; j < g_workObj[type].length; j++) {
						if (g_workObj[type][j] === undefined) {
							continue;
						}
						g_workObj[type][j] = getSwapList(g_workObj[type][j]);
					}
				}
			});
		}
	}

	// Shaking: Drunkでの画面揺れ設定 (X方向、Y方向)
	g_workObj.drunkXFlg = false;
	g_workObj.drunkYFlg = false;

	if (g_stateObj.dataSaveFlg) {
		// ローカルストレージへAdjustment, HitPosition, Volume設定を保存
		g_storeSettings.forEach(setting => g_localStorage[setting] = g_stateObj[setting]);
		localStorage.setItem(g_localStorageUrl, JSON.stringify(g_localStorage));
	}

	// リバース、キーコンフィグなどをローカルストレージへ保存（Data Save: ON かつ別キーモードで無い場合) 
	if (g_stateObj.dataSaveFlg && !hasVal(g_keyObj[`transKey${keyCtrlPtn}`])) {

		// 次回キーコンフィグ画面へ戻ったとき、保存済みキーコンフィグ設定が表示されるようにする
		g_keyObj.prevKey = `Dummy`;

		// ローカルストレージへcolorType設定を保存
		g_localStorage.colorType = g_colorType;

		let storageObj = g_localKeyStorage;
		let addKey = ``;

		// リバース、キーコンフィグの保存（キー別）
		if (g_stateObj.extraKeyFlg) {
			storageObj = g_localStorage;
			addKey = g_keyObj.currentKey;
		}
		if (g_headerObj.reverseUse) {
			storageObj[`reverse${addKey}`] = g_stateObj.reverse;
		}
		storageObj[`keyCtrl${addKey}`] = setKeyCtrl(g_localKeyStorage, keyNum, keyCtrlPtn);
		if (g_keyObj.currentPtn !== -1) {
			storageObj[`keyCtrlPtn${addKey}`] = g_keyObj.currentPtn;
			g_keyObj[`keyCtrl${keyCtrlPtn}`] = structuredClone(g_keyObj[`keyCtrl${keyCtrlPtn}d`]);
		}

		// カラーセットの保存（キー別）
		if (!g_keycons.colorDefTypes.includes(g_colorType)) {

			resetColorType({ _toObj: storageObj, _to: addKey });
			resetColorType({ _from: g_colorType, _to: g_colorType, _fromObj: g_dfColorObj });

			g_colorType = g_keycons.colorSelf;
			g_localStorage.colorType = g_keycons.colorSelf;
			g_keycons.colorTypes = addValtoArray(g_keycons.colorTypes, g_keycons.colorSelf);
			resetColorType({ _to: g_keycons.colorSelf });
		}

		g_keycons.groups.forEach(type => {
			const groupNum = g_keycons[`${type}GroupNum`];
			storageObj[`${type}${addKey}`] = structuredClone(g_keyObj[`${type}${keyCtrlPtn}_${groupNum}`]);
			g_keyObj[`${type}${g_keyObj.currentKey}_-1_${groupNum}`] = structuredClone(g_keyObj[`${type}${keyCtrlPtn}_${groupNum}d`]);
			g_keyObj[`${type}${keyCtrlPtn}_${groupNum}`] = structuredClone(g_keyObj[`${type}${keyCtrlPtn}_${groupNum}d`]);

			// 古いキーデータの削除 (互換用)
			if (storageObj[`${type}${g_keyObj.currentKey}_-1_-1`] !== undefined) {
				delete storageObj[`${type}${g_keyObj.currentKey}_-1_-1`];
			}
		});

		if (!g_stateObj.extraKeyFlg) {
			localStorage.setItem(`danonicw-${g_keyObj.currentKey}k`, JSON.stringify(g_localKeyStorage));
		}

		localStorage.setItem(g_localStorageUrl, JSON.stringify(g_localStorage));
		g_canLoadDifInfoFlg = true;

	} else {
		// データ未保存 もしくは 別キーモード時はキーコンフィグ設定を初期化しない
		g_keyObj.prevKey = g_keyObj.currentKey;
		g_canLoadDifInfoFlg = false;
	}
};

/**
 * キーコンフィグ保存処理
 * @param {object} _localStorage 保存先のローカルストレージ名
 * @param {number} _keyNum 
 * @param {string} _keyCtrlPtn 
 * @returns {any[][]}
 */
const setKeyCtrl = (_localStorage, _keyNum, _keyCtrlPtn) => {
	const localPtn = `${g_keyObj.currentKey}_-1`;
	const keyCtrl = [...Array(_keyNum)].map(() => []);
	for (let j = 0; j < _keyNum; j++) {
		for (let k = 0; k < g_keyObj[`keyCtrl${_keyCtrlPtn}`][j].length; k++) {
			keyCtrl[j][k] = g_keyObj[`keyCtrl${_keyCtrlPtn}`][j][k];
		}
		if (g_keyObj[`keyCtrl${localPtn}`] !== undefined) {
			if (g_keyObj[`keyCtrl${_keyCtrlPtn}`][j].length < g_keyObj[`keyCtrl${localPtn}`][j].length) {
				for (let k = g_keyObj[`keyCtrl${_keyCtrlPtn}`][j].length; k < g_keyObj[`keyCtrl${localPtn}`][j].length; k++) {
					keyCtrl[j][k] = undefined;
				}
			}
		}
	}
	return keyCtrl;
};

/*-----------------------------------------------------------*/
/* Scene : MAIN [banana] */
/*-----------------------------------------------------------*/

/**
 * メイン画面初期化
 */
const mainInit = () => {
	clearWindow(true, `Main`);
	const divRoot = document.getElementById(`divRoot`);
	document.oncontextmenu = () => false;
	g_currentPage = `main`;

	g_currentArrows = 0;
	const wordMaxLen = g_scoreObj.wordMaxDepth + 1;
	g_workObj.fadeInNo = fillArray(wordMaxLen);
	g_workObj.fadeOutNo = fillArray(wordMaxLen);
	g_workObj.lastFadeFrame = fillArray(wordMaxLen);
	g_workObj.wordFadeFrame = fillArray(wordMaxLen);

	// 背景スプライトを作成
	createMultipleSprite(`backSprite`, g_scoreObj.backMaxDepth, { x: g_workObj.backX });

	// ステップゾーン、矢印のメインスプライトを作成
	const mainSprite = createEmptySprite(divRoot, `mainSprite`, {
		x: g_workObj.playingX, y: g_posObj.stepY - C_STEP_Y + g_headerObj.playingY, w: g_headerObj.playingWidth, h: g_headerObj.playingHeight,
		transform: `scale(${g_keyObj.scale})`,
	});

	// 曲情報・判定カウント用スプライトを作成（メインスプライトより上位）
	const infoSprite = createEmptySprite(divRoot, `infoSprite`, { x: g_workObj.playingX, y: g_headerObj.playingY, w: g_headerObj.playingWidth, h: g_headerObj.playingHeight });

	// 判定系スプライトを作成（メインスプライトより上位）
	const judgeSprite = createEmptySprite(divRoot, `judgeSprite`, { x: g_workObj.playingX, y: g_headerObj.playingY, w: g_headerObj.playingWidth, h: g_headerObj.playingHeight });

	const tkObj = getKeyInfo();
	const [keyCtrlPtn, keyNum] = [tkObj.keyCtrlPtn, tkObj.keyNum];

	// マスクスプライトを作成 (最上位)
	createMultipleSprite(`maskSprite`, g_scoreObj.maskMaxDepth, { x: g_workObj.backX });

	// カラー・モーションを適用するオブジェクトの種類
	const objList = (g_stateObj.dummyId === `` ? [``] : [`dummy`, ``]);

	// 背景・マスクモーション、スキン変更(0フレーム指定)
	if (g_scoreObj.frameNum === 0) {
		g_animationData.filter(sprite => g_scoreObj[`${sprite}Data`][0] !== undefined).forEach(sprite => {
			g_animationFunc.drawMain[sprite](0, sprite);
			g_scoreObj[`${sprite}Data`][0] = undefined;
		});
	}

	// 矢印・フリーズアロー・速度変化 移動/判定/変化対象の初期化
	const arrowCnts = fillArray(keyNum);
	const frzCnts = fillArray(keyNum);
	const dummyArrowCnts = fillArray(keyNum);
	const dummyFrzCnts = fillArray(keyNum);
	let speedCnts = 0;
	let boostCnts = 0;
	let keychCnts = 0;

	const flatMode = g_stateObj.d_stepzone === `FlatBar` ||
		g_stateObj.scroll.endsWith(`Flat`) ||
		g_keyObj[`flatMode${keyCtrlPtn}`] ||
		(g_stateObj.stepArea === `Halfway` &&
			g_keyObj[`div${keyCtrlPtn}`] < g_keyObj[`${g_keyObj.defaultProp}${keyCtrlPtn}`].length);
	const stepZoneDisp = (g_stateObj.d_stepzone === C_FLG_OFF || flatMode) ? C_DIS_NONE : C_DIS_INHERIT;

	// Hidden+, Sudden+用のライン、パーセント表示
	const filterCss = g_stateObj.filterLock === C_FLG_OFF ? g_cssObj.life_Failed : g_cssObj.life_Cleared;
	[`filterBar0`, `filterBar1`, `borderBar0`, `borderBar1`].forEach(obj =>
		mainSprite.appendChild(createColorObject2(obj, g_lblPosObj.filterBar, filterCss)));
	borderBar0.style.top = wUnit(g_posObj.stepDiffY + g_stateObj.hitPosition);
	borderBar1.style.top = wUnit(g_posObj.stepDiffY + g_posObj.arrowHeight - g_stateObj.hitPosition);

	if (g_appearanceRanges.includes(g_stateObj.appearance)) {
		mainSprite.appendChild(createDivCss2Label(`filterView`, ``, g_lblPosObj.filterView));
		if (g_stateObj.d_filterline === C_FLG_ON) {
			$id(`filterView`).opacity = g_stateObj.opacity / 100;
			$id(`filterBar0`).opacity = g_stateObj.opacity / 100;
			$id(`filterBar1`).opacity = g_stateObj.opacity / 100;
		}
	}

	// mainSprite配下に層別のスプライトを作成し、ステップゾーン・矢印本体・フリーズアローヒット部分に分ける
	const mainSpriteN = [], stepSprite = [], arrowSprite = [], frzHitSprite = [];
	const mainCommonPos = { w: g_headerObj.playingWidth, h: g_posObj.arrowHeight };
	for (let j = 0; j < g_stateObj.layerNum; j++) {
		const mainSpriteJ = createEmptySprite(mainSprite, `mainSprite${j}`, mainCommonPos);
		mainSpriteN.push(mainSpriteJ);
		stepSprite.push(createEmptySprite(mainSpriteJ, `stepSprite${j}`, mainCommonPos));
		arrowSprite.push(createEmptySprite(mainSpriteJ, `arrowSprite${j}`, Object.assign({ y: g_workObj.hitPosition * (j % 2 === 0 ? 1 : -1) }, mainCommonPos)));
		frzHitSprite.push(createEmptySprite(mainSpriteJ, `frzHitSprite${j}`, mainCommonPos));
	}

	for (let j = 0; j < keyNum; j++) {
		const colorPos = g_keyObj[`color${keyCtrlPtn}`][j];

		// ステップゾーンルート
		const stepRoot = createEmptySprite(stepSprite[g_workObj.dividePos[j]], `stepRoot${j}`, {
			x: g_workObj.stepX[j], y: C_STEP_Y + g_posObj.reverseStepY * (g_workObj.dividePos[j] % 2),
			w: C_ARW_WIDTH, h: C_ARW_WIDTH,
		});

		// 矢印の内側を塗りつぶすか否か
		if (g_headerObj.setShadowColor[colorPos] !== ``) {
			stepRoot.appendChild(
				createColorObject2(`stepShadow${j}`, {
					rotate: g_workObj.stepRtn[j], styleName: `ShadowStep`,
					opacity: 0.7, display: stepZoneDisp,
				}, g_cssObj.main_objStepShadow)
			);
		}

		appearStepZone(j, C_DIS_NONE);

		// ステップゾーン
		multiAppend(stepRoot,

			// 本体
			createColorObject2(`step${j}`, {
				rotate: g_workObj.stepRtn[j], styleName: `Step`, display: stepZoneDisp,
			}, g_cssObj.main_stepDefault),

			// 空押し
			createColorObject2(`stepDiv${j}`, {
				rotate: g_workObj.stepRtn[j], styleName: `Step`, display: C_DIS_NONE,
			}, g_cssObj.main_stepKeyDown),

			// ヒット時モーション
			createColorObject2(`stepHit${j}`, Object.assign(g_lblPosObj.stepHit, {
				rotate: g_workObj.stepHitRtn[j], styleName: `StepHit`, opacity: 0,
			}), g_cssObj.main_stepDefault),

		);
	}
	if (flatMode && g_stateObj.d_stepzone !== C_FLG_OFF) {

		// スクロール名に`R-`が含まれていればリバースと見做す
		const reverseFlg = g_stateObj.reverse === C_FLG_ON || g_stateObj.scroll.startsWith(`R-`);

		// ステップゾーンの代わり
		const lineY = [(C_ARW_WIDTH - g_stateObj.flatStepHeight) / 2, (C_ARW_WIDTH + g_stateObj.flatStepHeight) / 2];
		const reverses = [reverseFlg, reverseFlg];
		if (makeDedupliArray(g_workObj.scrollDir).length > 1) {
			lineY.push(lineY[0], lineY[1]);
			reverses.push(!reverses[0], !reverses[1]);
		}
		for (let k = 0; k < g_stateObj.layerNum; k += 2) {
			lineY.forEach((y, j) => {
				stepSprite[Number(reverses[j]) + k].appendChild(
					createColorObject2(`stepBar${j + k}`, {
						x: 0, y: C_STEP_Y + g_posObj.reverseStepY * Number(reverses[j]) + y,
						w: g_headerObj.playingWidth - 50, h: 1, styleName: `lifeBar`,
					}, g_cssObj.life_Failed)
				);
			});
		}
	}

	for (let j = 0; j < keyNum; j++) {

		// フリーズアローヒット部分
		const frzHit = createEmptySprite(frzHitSprite[g_workObj.dividePos[j]], `frzHit${j}`, {
			x: g_workObj.stepX[j], y: C_STEP_Y + g_posObj.reverseStepY * (g_workObj.dividePos[j] % 2),
			w: C_ARW_WIDTH, h: C_ARW_WIDTH, opacity: 0,
		});
		if (isNaN(parseFloat(g_workObj.arrowRtn[j]))) {
			multiAppend(frzHit,
				createColorObject2(`frzHitShadow${j}`, {
					rotate: g_workObj.arrowRtn[j], styleName: `Shadow`,
				}, g_cssObj.main_objShadow),
				createColorObject2(`frzHitTop${j}`, {
					background: g_workObj.frzHitColors[j], rotate: g_workObj.arrowRtn[j],
				})
			);
		} else {
			frzHit.appendChild(
				createColorObject2(`frzHitTop${j}`, Object.assign(g_lblPosObj.frzHitTop, {
					rotate: g_workObj.arrowRtn[j], styleName: `Shadow`,
				}), g_cssObj.main_frzHitTop)
			);
		}
	}

	// StepArea処理
	g_stepAreaFunc[g_stateObj.stepArea]();

	// Appearanceのオプション適用時は一部描画を隠す
	changeAppearanceFilter(g_appearanceRanges.includes(g_stateObj.appearance) ?
		g_hidSudObj.filterPos : g_hidSudObj.filterPosDefault[g_stateObj.appearance]);

	// 現在の矢印・フリーズアローの速度、個別加算速度の初期化 (速度変化時に直す)
	g_workObj.currentSpeed = 2;
	g_workObj.boostSpd = 1;
	g_workObj.boostDir = 1;

	// 開始位置、楽曲再生位置の設定
	const firstFrame = g_scoreObj.frameNum;
	const musicStartFrame = firstFrame + g_headerObj.blankFrame;
	const fadeFlgs = { fadein: [`In`, `Out`], fadeout: [`Out`, `In`] };
	g_audio.volume = (firstFrame === 0 ? g_stateObj.volume / 100 : 0);

	// 曲時間制御変数
	let thisTime;
	let buffTime;
	let musicStartTime;
	let musicStartFlg = false;

	g_inputKeyBuffer = {};

	// 終了時間の設定
	let duration = g_audio.duration * g_fps;
	g_scoreObj.fadeOutFrame = Infinity;
	g_scoreObj.fadeOutTerm = C_FRM_AFTERFADE;

	// フェードアウト時間指定の場合、その7秒(=420フレーム)後に終了する
	let fadeNo = -1;
	if (g_headerObj.fadeFrame?.length >= g_stateObj.scoreId + 1) {
		fadeNo = (isNaN(parseInt(g_headerObj.fadeFrame[g_stateObj.scoreId][0])) ? -1 : g_stateObj.scoreId);
	}
	if (fadeNo !== -1) {
		// フェードアウト指定の場合、曲長(フェードアウト開始まで)は FadeFrame - (本来のblankFrame)
		duration = parseInt(g_headerObj.fadeFrame[fadeNo][0]) - g_headerObj.blankFrameDef;
		g_scoreObj.fadeOutFrame = Math.ceil(duration / g_headerObj.playbackRate + g_headerObj.blankFrame + g_stateObj.adjustment);

		if (g_headerObj.fadeFrame[fadeNo].length > 1) {
			g_scoreObj.fadeOutTerm = Number(g_headerObj.fadeFrame[fadeNo][1]);
		}
	}

	// 終了時間指定の場合、その値を適用する
	let endFrameUseFlg = false;
	const tmpEndFrame = g_headerObj.endFrame?.[g_stateObj.scoreId] || g_headerObj.endFrame?.[0];
	if (!isNaN(parseInt(tmpEndFrame))) {
		// 終了時間指定の場合、曲長は EndFrame - (本来のblankFrame)
		duration = parseInt(tmpEndFrame) - g_headerObj.blankFrameDef;
		endFrameUseFlg = true;
	}

	let fullFrame = Math.ceil(duration / g_headerObj.playbackRate + g_headerObj.blankFrame + g_stateObj.adjustment);
	if (g_scoreObj.fadeOutFrame !== Infinity && !endFrameUseFlg) {
		fullFrame += g_scoreObj.fadeOutTerm;
	}
	g_scoreObj.fullFrame = fullFrame;
	const fullTime = transFrameToTimer(fullFrame - g_stateObj.intAdjustment);

	// フレーム数
	divRoot.appendChild(createDivCss2Label(`lblframe`, g_scoreObj.baseFrame, Object.assign(g_lblPosObj.lblframe, { display: g_workObj.lifegaugeDisp })));

	// ライフ(数字)部作成
	const intLifeVal = Math.floor(g_workObj.lifeVal);
	let lblInitColor;
	if (g_workObj.lifeVal === g_headerObj.maxLifeVal) {
		lblInitColor = g_cssObj.life_Max;
	} else if (g_workObj.lifeVal >= g_workObj.lifeBorder) {
		lblInitColor = g_cssObj.life_Cleared;
	} else {
		lblInitColor = g_cssObj.life_Failed;
	}

	// 曲名・アーティスト名、譜面名表示
	const playbackView = (g_headerObj.playbackRate === 1 ? `` : ` [Rate:${g_headerObj.playbackRate}]`);
	const musicTitle = (g_headerObj.musicTitles[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.musicTitle) + playbackView;
	const artistName = g_headerObj.artistNames[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.artistName;
	const assistFlg = (g_autoPlaysBase.includes(g_stateObj.autoPlay) ? `` : `-${getStgDetailName(g_stateObj.autoPlay)}${getStgDetailName('less')}`);
	const shuffleName = (g_stateObj.shuffle !== C_FLG_OFF ? `: ${getStgDetailName(g_stateObj.shuffle)}` : ``);

	// 曲名・アーティスト名、譜面名のサイズ調整
	const checkMusicSiz = (_text, _siz) => getFontSize(_text, g_headerObj.playingWidth - g_headerObj.customViewWidth - 125, getBasicFont(), _siz);

	const makerView = g_headerObj.makerView ? ` (${g_headerObj.creatorNames[g_stateObj.scoreId]})` : ``;
	let difName = `[${getKeyName(g_headerObj.keyLabels[g_stateObj.scoreId])} / ${g_headerObj.difLabels[g_stateObj.scoreId]}${assistFlg}${shuffleName}${makerView}]`;
	let creditName = `${musicTitle} / ${artistName}`;
	if (checkMusicSiz(creditName, g_limitObj.musicTitleSiz) < 12) {
		creditName = `${musicTitle}`;
		difName = `/ ${artistName} ` + difName;
	}

	multiAppend(infoSprite,

		// ライフ（数字）
		createDivCss2Label(`lblLife`, intLifeVal, {
			x: 0, y: 30, w: 70, h: 20, siz: g_limitObj.jdgCntsSiz, display: g_workObj.lifegaugeDisp,
		}, lblInitColor),

		// ライフ背景
		createColorObject2(`lifeBackObj`, {
			x: 5, y: 50, w: 15, h: g_headerObj.playingHeight - 100, styleName: `lifeBar`, display: g_workObj.lifegaugeDisp,
		}, g_cssObj.life_Background),

		// ライフ本体
		createColorObject2(`lifeBar`, {
			x: 5, y: 50 + (g_headerObj.playingHeight - 100) * (g_headerObj.maxLifeVal - intLifeVal) / g_headerObj.maxLifeVal,
			w: 15, h: (g_headerObj.playingHeight - 100) * intLifeVal / g_headerObj.maxLifeVal, styleName: `lifeBar`,
			display: g_workObj.lifegaugeDisp,
		}, lblInitColor),

		// ライフ：ボーダーライン
		// この背景の画像は40x16で作成しているが、`padding-right:5px`があるためサイズを35x16で作成
		createColorObject2(`lifeBorderObj`, {
			x: 10, y: 42 + (g_headerObj.playingHeight - 100) * (g_headerObj.maxLifeVal - g_workObj.lifeBorder) / g_headerObj.maxLifeVal,
			w: 35, h: 16, background: C_CLR_BORDER, styleName: `lifeBorder`,
			fontFamily: getBasicFont(), display: g_workObj.lifegaugeDisp,
		}, g_cssObj.life_Border, g_cssObj.life_BorderColor),

		// 曲名・アーティスト名表示
		createDivCss2Label(`lblCredit`, creditName, Object.assign(g_lblPosObj.lblCredit, { siz: checkMusicSiz(creditName, g_limitObj.musicTitleSiz) })),

		// 譜面名表示
		createDivCss2Label(`lblDifName`, difName, Object.assign(g_lblPosObj.lblDifName, { siz: checkMusicSiz(difName, 12) })),

		// 曲時間表示：現在時間
		createDivCss2Label(`lblTime1`, `-:--`, Object.assign(g_lblPosObj.lblTime1, { display: g_workObj.musicinfoDisp })),

		// 曲時間表示：総時間
		createDivCss2Label(`lblTime2`, `/ ${fullTime}`, Object.assign(g_lblPosObj.lblTime2, { display: g_workObj.musicinfoDisp })),
	);

	if (g_workObj.nonDefaultSc) {
		multiAppend(infoSprite,
			createDivCss2Label(`lblRetry`, `[${g_lblNameObj.l_retry}]`, Object.assign(g_lblPosObj.lblMainScHeader, { y: g_headerObj.playingHeight - 65 })),
		);
		multiAppend(infoSprite,
			createDivCss2Label(`lblRetrySc`, g_kCd[g_headerObj.keyRetry],
				Object.assign(g_lblPosObj.lblMainScKey, { y: g_headerObj.playingHeight - 50, fontWeight: g_headerObj.keyRetry === C_KEY_RETRY ? `normal` : `bold` })),
		);
		multiAppend(infoSprite,
			createDivCss2Label(`lblTitleBack`, `[${g_lblNameObj.l_titleBack}]`, Object.assign(g_lblPosObj.lblMainScHeader, { y: g_headerObj.playingHeight - 35 })),
		);
		multiAppend(infoSprite,
			createDivCss2Label(`lblTitleBackSc`, g_isMac ? `Shift+${g_kCd[g_headerObj.keyRetry]}` : g_kCd[g_headerObj.keyTitleBack],
				Object.assign(g_lblPosObj.lblMainScKey, { y: g_headerObj.playingHeight - 20, fontWeight: g_headerObj.keyTitleBack === C_KEY_TITLEBACK ? `normal` : `bold` })),
		);
	}

	// ボーダーライン表示
	lifeBorderObj.textContent = g_workObj.lifeBorder;
	if (g_stateObj.lifeBorder === 0 || g_workObj.lifeVal === g_headerObj.maxLifeVal) {
		lifeBorderObj.style.display = C_DIS_NONE;
	}

	// 歌詞表示
	const wordSprite = createEmptySprite(judgeSprite, `wordSprite`, { w: g_headerObj.playingWidth });
	for (let j = 0; j <= g_scoreObj.wordMaxDepth; j++) {
		const wordY = (j % 2 === 0 ? 10 : (g_headerObj.bottomWordSetFlg ? g_posObj.distY + 10 : g_headerObj.playingHeight - 60));
		wordSprite.appendChild(createDivCss2Label(`lblword${j}`, ``, Object.assign(g_lblPosObj.lblWord, { y: wordY, fontFamily: getBasicFont() })));
	}

	const jdgGroups = [`J`, `FJ`];
	const jdgX = [g_headerObj.playingWidth / 2 - 220, g_headerObj.playingWidth / 2 - 120];
	const jdgY = [(g_headerObj.playingHeight + g_posObj.stepYR) / 2 - 60, (g_headerObj.playingHeight + g_posObj.stepYR) / 2 + 10];
	if (g_stateObj.d_background === C_FLG_OFF && g_headerObj.jdgPosReset) {
	} else {
		jdgY[0] += g_diffObj.arrowJdgY;
		jdgY[1] += g_diffObj.frzJdgY;
	}

	jdgGroups.forEach((jdg, j) => {
		// キャラクタ表示
		const charaJ = createDivCss2Label(`chara${jdg}`, ``, {
			x: jdgX[j], y: jdgY[j],
			w: g_limitObj.jdgCharaWidth, h: g_limitObj.jdgCharaHeight, siz: g_limitObj.jdgCharaSiz,
			opacity: g_stateObj.opacity / 100, display: g_workObj.judgmentDisp,
		}, g_cssObj.common_ii);
		charaJ.setAttribute(`cnt`, 0);

		multiAppend(judgeSprite,

			// キャラクタ表示
			charaJ,

			// コンボ表示
			createDivCss2Label(`combo${jdg}`, ``, {
				x: jdgX[j] + 170, y: jdgY[j],
				w: g_limitObj.jdgCharaWidth, h: g_limitObj.jdgCharaHeight, siz: g_limitObj.jdgCharaSiz,
				opacity: g_stateObj.opacity / 100, display: g_workObj.judgmentDisp,
			}, g_cssObj[`common_combo${jdg}`]),

			// Fast/Slow表示
			createDivCss2Label(`diff${jdg}`, ``, {
				x: jdgX[j] + 170, y: jdgY[j] + 25,
				w: g_limitObj.jdgCharaWidth, h: g_limitObj.jdgCharaHeight, siz: g_limitObj.mainSiz,
				opacity: g_stateObj.opacity / 100, display: g_workObj.fastslowDisp,
			}, g_cssObj.common_combo),

		);
	});

	// 判定カウンタ表示
	const jdgMainScoreObj = {
		Ii: [`ii`, 0], Shakin: [`shakin`, 1], Matari: [`matari`, 2], Shobon: [`shobon`, 3], Uwan: [`uwan`, 4],
		MCombo: [`combo`, 5], Kita: [`kita`, 7], Iknai: [`iknai`, 8], FCombo: [`combo`, 9],
	};
	Object.keys(jdgMainScoreObj).forEach(jdgScore =>
		infoSprite.appendChild(makeCounterSymbol(`lbl${jdgScore}`, g_headerObj.playingWidth - 110 + (g_workObj.nonDefaultSc ? g_headerObj.scAreaWidth : 0),
			g_cssObj[`common_${jdgMainScoreObj[jdgScore][0]}`], jdgMainScoreObj[jdgScore][1] + 1, 0, g_workObj.scoreDisp)));

	// パーフェクト演出
	judgeSprite.appendChild(createDivCss2Label(`finishView`, ``, g_lblPosObj.finishView, g_cssObj.common_kita));

	// 曲情報OFF
	if (g_stateObj.d_musicinfo === C_FLG_OFF) {
		[`lblCredit`, `lblDifName`].forEach(labelName => changeStyle(labelName, g_lblPosObj.musicInfoOFF));
	}

	// ローカル時のみフレーム数を残す
	if (!g_isLocal) {
		lblframe.style.display = C_DIS_NONE;
	}

	// Ready?表示
	if (!g_headerObj.customReadyUse) {
		const readyColor = g_headerObj.readyColor || g_headerObj.setColorOrg[0];
		let readyDelayFrame = 0;
		if (g_stateObj.fadein === 0 && g_headerObj.readyDelayFrame > 0 &&
			g_headerObj.readyDelayFrame + g_stateObj.adjustment > 0) {
			readyDelayFrame = g_headerObj.readyDelayFrame + g_stateObj.adjustment;
		}
		const readyHtml = g_headerObj.readyHtml ||
			`<span style='color:${readyColor};font-size:${wUnit(60)};'>R</span>EADY<span style='font-size:${wUnit(50)};'>?</span>`;

		divRoot.appendChild(
			createDivCss2Label(`lblReady`, readyHtml, {
				x: g_workObj.playingX + (g_headerObj.playingWidth - g_sWidth) / 2,
				y: g_headerObj.playingY + (g_headerObj.playingHeight + g_posObj.stepYR) / 2 - 75,
				w: g_sWidth, h: 50, siz: 40,
				animationDuration: `${g_headerObj.readyAnimationFrame / g_fps}s`,
				animationName: g_headerObj.readyAnimationName,
				animationDelay: `${readyDelayFrame / g_fps}s`, opacity: 0,
			})
		);
	}

	const msg = [];
	if (getMusicUrl(g_stateObj.scoreId) === `nosound.mp3`) {
		msg.push(g_msgInfoObj.I_0004);
	}
	if (g_stateObj.shuffle.indexOf(`Mirror`) !== -1 &&
		g_stateObj.dataSaveFlg && g_stateObj.autoAll === C_FLG_OFF &&
		g_keyObj[`shuffle${keyCtrlPtn}`].filter((shuffleGr, j) => shuffleGr !== g_keyObj[`shuffle${keyCtrlPtn}_0d`][j]).length > 0) {
		msg.push(g_msgInfoObj.I_0005);
	}
	if (msg.length > 0) {
		makeInfoWindow(msg.join(`<br>`), `leftToRightFade`, { _x: g_workObj.playingX, _y: g_headerObj.playingY });
	}

	// ユーザカスタムイベント(初期)
	g_customJsObj.main.forEach(func => func());

	// mainSpriteのtransform追加処理
	g_workObj.transform = mainSprite.style.transform || ``;
	g_workObj.transform += g_playWindowFunc[g_stateObj.playWindow]();
	mainSprite.style.transform = g_workObj.transform;

	// EffectのArrowEffect追加処理
	g_effectFunc[g_stateObj.effect]();

	/**
	 * キーを押したときの処理
	 */
	const mainKeyDownActFunc = {

		OFF: (_code) => {
			const matchKeys = g_workObj.keyCtrlN;

			for (let j = 0; j < keyNum; j++) {
				matchKeys[j].filter((key, k) => _code === key && !g_workObj.keyHitFlg[j][k] && !g_judgObj.lockFlgs[j])
					.forEach(() => {
						g_judgObj.lockFlgs[j] = true;
						judgeArrow(j);
						g_judgObj.lockFlgs[j] = false;
					});
			}
		},

		ON: (_code) => { },
	};

	// キー操作イベント
	document.onkeydown = evt => {
		evt.preventDefault();
		const setCode = transCode(evt);

		if (evt.repeat && !g_mainRepeatObj.key.includes(setCode)) {
			return blockCode(setCode);
		}
		g_inputKeyBuffer[setCode] = true;
		mainKeyDownActFunc[g_stateObj.autoAll](setCode);

		// 曲中リトライ、タイトルバック
		if (setCode === g_kCdN[g_headerObj.keyRetry]) {
			g_audio.pause();
			clearTimeout(g_timeoutEvtId);

			if (g_isMac && keyIsShift()) {
				// Mac OS、IPad OSはDeleteキーが無いためShift+BSで代用
				titleInit();

			} else {
				// その他の環境では単にRetryに対応するキーのみで適用
				clearWindow();
				musicAfterLoaded();
			}

		} else if (setCode === g_kCdN[g_headerObj.keyTitleBack]) {
			g_audio.pause();
			clearTimeout(g_timeoutEvtId);
			if (keyIsShift()) {
				if (g_currentArrows !== g_fullArrows || g_stateObj.lifeMode === C_LFE_BORDER && g_workObj.lifeVal < g_workObj.lifeBorder) {
					g_gameOverFlg = true;
					g_finishFlg = false;
				}
				resultInit();
			} else {
				titleInit();
			}

		} else if (g_appearanceRanges.includes(g_stateObj.appearance) && g_stateObj.filterLock === C_FLG_OFF) {
			const MAX_FILTER_POS = 100;
			const MIN_FILTER_POS = 0;
			if (setCode === g_hidSudObj.pgDown[g_stateObj.appearance][g_stateObj.reverse]) {
				changeAppearanceFilter(Math.min(g_hidSudObj.filterPos + 1, MAX_FILTER_POS));
			} else if (setCode === g_hidSudObj.pgUp[g_stateObj.appearance][g_stateObj.reverse]) {
				changeAppearanceFilter(Math.max(g_hidSudObj.filterPos - 1, MIN_FILTER_POS));
			}
		}
		return blockCode(setCode);
	};

	/**
	 * キーを離したときの処理
	 */
	const mainKeyUpActFunc = {

		OFF: () => {
			for (let j = 0; j < keyNum; j++) {
				if (g_workObj.keyCtrlN[j].find(key => keyIsDown(key)) === undefined) {
					$id(`stepDiv${j}`).display = C_DIS_NONE;
				}
			}
		},

		ON: () => { },
	};

	document.onkeyup = evt => {
		g_inputKeyBuffer[transCode(evt)] = false;
		mainKeyUpActFunc[g_stateObj.autoAll]();
	};

	/**
	 * 全体色変化（矢印）
	 * @param {number} _j 矢印位置
	 * @param {number} _k 矢印の表示順
	 * @param {string} _name 通常, ダミー
	 */
	const changeArrowColor = (_j, _k, _name) => {
		if (g_workObj[`mk${toCapitalize(_name)}ColorChangeAll`][g_scoreObj.frameNum]) {

			/**
			 * 全体色の変更処理
			 * - 次の全体色変化対象の色と比較して一致した場合に色を変更
			 * @param {string} _type 
			 * @param {element} _baseObj 
			 */
			const changeColor = (_type, _baseObj) => {
				const cArrowColor = g_workObj[`${_name}${_type}Colors`][_j];
				const cArrowColorAll = g_workObj[`${_name}${_type}ColorsAll`][_j];
				if (_baseObj.getAttribute(`color`) !== cArrowColor && cArrowColorAll === cArrowColor) {
					_baseObj.style.background = cArrowColorAll;
					_baseObj.setAttribute(`color`, cArrowColorAll);
				}
			};

			// 矢印枠の色変化
			const arrowTop = document.getElementById(`${_name}Top${_j}_${_k}`);
			changeColor(``, arrowTop);

			// 矢印塗りつぶし部分の色変化
			if (g_headerObj.setShadowColor[0] !== ``) {
				const arrowShadow = document.getElementById(`${_name}Shadow${_j}_${_k}`);
				changeColor(`Shadow`, arrowShadow);
			}
		}
	};

	/**
	 * 全体色変化（フリーズアロー）
	 * @param {number} _j 矢印位置
	 * @param {number} _k 矢印の表示順
	 * @param {string} _name 通常, ダミー
	 * @param {string} _state フリーズアローの色変化対象 (Normal: 通常時、Hit: ヒット時)
	 */
	const changeFrzColor = (_j, _k, _name, _state) => {

		if (g_workObj[`mk${toCapitalize(_name)}ColorChangeAll`][g_scoreObj.frameNum]) {
			const frzNo = `${_j}_${_k}`;
			const frzTop = document.getElementById(`${_name}Top${frzNo}`);
			const frzBar = document.getElementById(`${_name}Bar${frzNo}`);
			const frzBtm = document.getElementById(`${_name}Btm${frzNo}`);
			const frzTopShadow = document.getElementById(`${_name}TopShadow${frzNo}`);
			const frzBtmShadow = document.getElementById(`${_name}BtmShadow${frzNo}`);

			/**
			 * 全体色の変更処理
			 * @param {string} _type 
			 * @param {element} _baseObj 
			 * @param {element} _baseObj2 
			 */
			const changeColor = (_type, _baseObj, _baseObj2) => {
				const cFrzColor = g_workObj[`${_name}${_state}${_type}Colors`][_j];
				const cFrzColorAll = g_workObj[`${_name}${_state}${_type}ColorsAll`][_j];
				if (_baseObj.getAttribute(`color${_state}`) !== cFrzColor && cFrzColorAll === cFrzColor) {
					if (_baseObj2 && _state === `Normal`) {
						_baseObj2.style.background = cFrzColorAll;
					}
					_baseObj.style.background = cFrzColorAll;
					_baseObj.setAttribute(`color${_state}`, cFrzColorAll);
				}
			};

			// 矢印部分の色変化
			changeColor(``, frzBtm, frzTop);

			// 帯部分の色変化
			changeColor(`Bar`, frzBar);

			// 矢印塗りつぶし部分の色変化
			changeColor(`Shadow`, frzBtmShadow, frzTopShadow);
		}
	};


	/**
	 * 全体色変化
	 */
	const changeColorFunc = {
		arrow: (_j, _k) => changeArrowColor(_j, _k, `arrow`),
		dummyArrow: (_j, _k) => changeArrowColor(_j, _k, `dummyArrow`),
		frz: (_j, _k, _state) => changeFrzColor(_j, _k, `frz`, _state),
		dummyFrz: (_j, _k, _state) => changeFrzColor(_j, _k, `dummyFrz`, _state),
	};

	/**
	 * 矢印・フリーズアロー消去
	 * 
	 * @param {number} _j 矢印位置
	 * @param {string} _deleteName 削除オブジェクト名
	 */
	const judgeObjDelete = {};
	g_typeLists.arrow.forEach(type =>
		judgeObjDelete[type] = (_j, _deleteName) => {
			g_workObj[`judg${toCapitalize(type)}Cnt`][_j]++;
			document.getElementById(_deleteName).remove();
			delete g_attrObj[_deleteName];
		});

	/**
	 * 自動判定
	 * ※mainInit内部で指定必須（arrowSprite指定）
	 * 
	 * @param {number} _j 矢印位置
	 * @param {object} _arrow 矢印(オブジェクト)
	 * 
	 * @param {number} _k 矢印の表示順
	 * @param {object} _frzRoot フリーズアロー(オブジェクト)
	 * @param {number} _cnt ステップゾーン到達までのフレーム数
	 * @param {number} _keyUpFrame キーを離したフレーム数
	 */
	const judgeMotionFunc = {

		// 矢印(枠外判定、AutoPlay: OFF)
		arrowOFF: (_j, _arrowName, _cnt) => {
			if (_cnt < (-1) * g_judgObj.arrowJ[g_judgPosObj.shobon]) {
				judgeUwan(_cnt);
				judgeObjDelete.arrow(_j, _arrowName);
			}
		},

		// 矢印(オート、AutoPlay: ON)
		arrowON: (_j, _arrowName, _cnt) => {
			if (_cnt === 0) {
				const stepDivHit = document.getElementById(`stepHit${_j}`);

				judgeIi(_cnt);
				stepDivHit.style.opacity = 1;
				stepDivHit.setAttribute(`cnt`, C_FRM_HITMOTION);
				judgeObjDelete.arrow(_j, _arrowName);
			}
		},

		// ダミー矢印(オート、AutoPlay: OFF)
		dummyArrowOFF: (_j, _arrowName, _cnt) => {
			if (_cnt === 0) {
				const stepDivHit = document.getElementById(`stepHit${_j}`);

				g_customJsObj.dummyArrow.forEach(func => func());
				stepDivHit.style.top = wUnit(-15);
				stepDivHit.style.opacity = 1;
				stepDivHit.classList.value = ``;
				stepDivHit.classList.add(g_cssObj.main_stepDummy);
				stepDivHit.setAttribute(`cnt`, C_FRM_HITMOTION);
				judgeObjDelete.dummyArrow(_j, _arrowName);
			}
		},

		// フリーズアロー(成功時)
		frzOK: (_j, _k, _frzName, _cnt) => {
			judgeKita(_cnt);
			$id(`frzHit${_j}`).opacity = 0;
			g_attrObj[_frzName].judgEndFlg = true;
			judgeObjDelete.frz(_j, _frzName);
		},

		// ダミーフリーズアロー(成功時)
		dummyFrzOK: (_j, _k, _frzName, _cnt) => {
			g_customJsObj.dummyFrz.forEach(func => func());
			$id(`frzHit${_j}`).opacity = 0;
			g_attrObj[_frzName].judgEndFlg = true;
			judgeObjDelete.dummyFrz(_j, _frzName);
		},

		// フリーズアロー(枠外判定)
		frzNG: (_j, _k, _frzName, _cnt) => {
			if (_cnt < (-1) * g_judgObj.frzJ[g_judgPosObj.iknai]) {
				judgeIknai(_cnt);
				g_attrObj[_frzName].judgEndFlg = true;

				changeFailedFrz(_j, _k);
				if (g_headerObj.frzStartjdgUse) {
					judgeUwan(_cnt);
				}
			}
		},

		// ダミーフリーズアロー(枠外判定)
		dummyFrzNG: (_j, _k, _frzName, _cnt) => { },

		// フリーズアロー(キーを離したときの処理)
		frzKeyUp: (_j, _k, _frzName, _cnt) => {
			if (g_attrObj[_frzName].keyUpFrame > g_headerObj.frzAttempt) {
				judgeIknai(_cnt);
				g_attrObj[_frzName].judgEndFlg = true;
				changeFailedFrz(_j, _k);
			}
		},

		// ダミーフリーズアロー(キーを離したときの処理)
		// ※処理上通ることはないが、統一のために定義
		dummyFrzKeyUp: (_j, _k, _frzName, _cnt) => { },

	};
	judgeMotionFunc.dummyArrowON = (_j, _arrowName, _cnt) => judgeMotionFunc.dummyArrowOFF(_j, _arrowName, _cnt);

	/**
	 * 次矢印・フリーズアローへ判定を移すかチェック
	 * 
	 * - 判定対象の矢印／フリーズアローが未判定の状態で、現在の矢印／フリーズアローの判定領域が回復判定内に入った場合、
	 *   自身より前の判定をNG判定とした上で、判定対象の矢印／フリーズアローを強制的に削除
	 * - ただし、判定対象の矢印／フリーズアローがジャスト付近の場合は判定対象を優先する
	 *   (フリーズアローの場合、ヒット中の場合も判定対象が優先される)
	 * 
	 * @param {number} _j 矢印の位置
	 * @param {number} _k 矢印の表示順
	 * @param {number} _cnt ステップゾーン到達までのフレーム数
	 */
	const judgeNextFunc = {

		arrowOFF: (_j, _k, _cnt) => {

			// 直前のフリーズアローが未判定で、自身の判定範囲がキター(O.K.)の範囲内のとき判定対象を矢印側へ移す
			// 本来はシャキン(Great)の範囲内としたいところだが、実装が複雑になるため上記条件とする
			judgeNextFunc.frzOFF(_j, g_workObj.judgFrzCnt[_j] + 1, _cnt);

			if (g_workObj.judgArrowCnt[_j] === _k - 1 && _cnt <= g_judgObj.arrowJ[g_judgPosObj.shakin]) {
				const prevArrowName = `arrow${_j}_${g_workObj.judgArrowCnt[_j]}`;
				const prevArrow = g_attrObj[prevArrowName];

				if (prevArrow.cnt < (-1) * g_judgObj.arrowJ[g_judgPosObj.ii]) {

					// 自身より前の矢印が未判定の場合、強制的に枠外判定を行い矢印を削除
					if (prevArrow.cnt >= (-1) * g_judgObj.arrowJ[g_judgPosObj.uwan]) {
						judgeUwan(prevArrow.cnt);
						judgeObjDelete.arrow(_j, prevArrowName);
					}
				}
			}
		},

		arrowON: (_j, _k, _cnt) => true,
		dummyArrowOFF: (_j, _k, _cnt) => true,
		dummyArrowON: (_j, _k, _cnt) => true,

		frzOFF: (_j, _k, _cnt) => {

			// 判定対象が自身より前のフリーズアローで、自身の判定範囲がキター(O.K.)の範囲内のとき
			if (g_workObj.judgFrzCnt[_j] === _k - 1 && _cnt <= g_judgObj.frzJ[g_judgPosObj.sfsf]) {
				const prevFrzName = `frz${_j}_${g_workObj.judgFrzCnt[_j]}`;
				const prevFrz = g_attrObj[prevFrzName];

				// 自身より前のフリーズアローが移動中かつキター(O.K.)の領域外のとき
				if (prevFrz && prevFrz.isMoving && prevFrz.cnt < (-1) * g_judgObj.frzJ[g_judgPosObj.kita]) {

					// 自身より前のフリーズアローが未判定の場合、強制的に枠外判定を行う
					if (prevFrz.cnt >= (-1) * g_judgObj.frzJ[g_judgPosObj.iknai] && !prevFrz.judgEndFlg) {
						judgeIknai(prevFrz.cnt);
						if (g_headerObj.frzStartjdgUse) {
							judgeUwan(prevFrz.cnt);
						}
					}
					// 自身より前のフリーズアローを削除して判定対象を自身に変更 (g_workObj.judgFrzCnt[_j]をカウントアップ)
					judgeObjDelete.frz(_j, prevFrzName);
				}
			}
		},

		frzON: (_j, _k, _cnt) => {

			if (_cnt === 0) {
				changeHitFrz(_j, _k, `frz`);
				if (g_headerObj.frzStartjdgUse) {
					judgeIi(_cnt);
				}
			}
		},

		dummyFrzOFF: (_j, _k, _cnt) => {
			if (_cnt === 0) {
				changeHitFrz(_j, _k, `dummyFrz`);
			}
		},
		dummyFrzON: (_j, _k, _cnt) => {
			if (_cnt === 0) {
				changeHitFrz(_j, _k, `dummyFrz`);
			}
		},
	};

	/**
	 * フリーズアローヒット中に手を離したかどうかをチェック
	 * 
	 * @param _j 矢印の位置
	 */
	const checkKeyUpFunc = {
		frzOFF: (_j) => g_workObj.keyHitFlg[_j].find(flg => flg),
		frzON: (_j) => true,
		dummyFrzOFF: (_j) => true,
		dummyFrzON: (_j) => true,
	};

	/**
	 * 矢印生成
	 * @param {object} _attrs 矢印個別の属性
	 *   (pos: 矢印種類, arrivalFrame: 到達フレーム数, initY: 初期表示位置, 
	 *    initBoostY: Motion有効時の初期表示位置加算, motionFrame: アニメーション有効フレーム数)
	 * @param {number} _arrowCnt 現在の判定矢印順
	 * @param {string} _name 矢印名
	 * @param {string} _color 矢印色
	 * @param {string} _shadowColor 矢印塗りつぶし部分の色
	 */
	const makeArrow = (_attrs, _arrowCnt, _name, _color, _shadowColor) => {
		const _j = _attrs.pos;
		const dividePos = g_workObj.dividePos[_j] % 2;
		const colorPos = g_keyObj[`color${keyCtrlPtn}`][_j];

		const arrowName = `${_name}${_j}_${_arrowCnt}`;
		const firstPosY = C_STEP_Y + g_posObj.reverseStepY * dividePos +
			(_attrs.initY * g_workObj.boostSpd +
				_attrs.initBoostY * g_workObj.boostDir) * g_workObj.scrollDir[_j];

		const stepRoot = createEmptySprite(arrowSprite[g_workObj.dividePos[_j]], arrowName, {
			x: g_workObj.stepX[_j], y: firstPosY, w: C_ARW_WIDTH, h: C_ARW_WIDTH,
		});
		/**
		 * 矢印毎の属性情報
		 */
		g_attrObj[arrowName] = {
			// 生存フレーム数
			cnt: _attrs.arrivalFrame + 1,
			// 生存フレーム数 (ストップ分除去、個別加速/Motionオプション用)
			boostCnt: _attrs.motionFrame,
			// 個別加速量
			boostSpd: g_workObj.boostSpd,
			// ステップゾーン位置 (0: デフォルト, 1: リバース)
			dividePos: dividePos,
			// スクロール方向 (1: デフォルト, -1: リバース)
			dir: g_workObj.scrollDir[_j],
			// 個別加速方向 (1: 順方向加速, -1: 逆方向加速)
			boostDir: g_workObj.boostDir,
			// 前フレーム時の位置 (判定で使用)
			prevY: firstPosY,
			// 現フレーム時の位置
			y: firstPosY,
		};
		// 矢印色の設定
		// - 枠/塗りつぶし色: g_attrObj[arrowName].Arrow / ArrowShadow
		g_typeLists.arrowColor.forEach(val => g_attrObj[arrowName][`Arrow${val}`] = g_workObj[`${_name}${val}Colors`][_j]);
		arrowSprite[g_workObj.dividePos[_j]].appendChild(stepRoot);

		if (g_workObj[`${_name}CssMotions`][_j] !== ``) {
			stepRoot.classList.add(g_workObj[`${_name}CssMotions`][_j]);
			stepRoot.style.animationDuration = `${_attrs.arrivalFrame / g_fps}s`;
		}

		/**
		 * 矢印オブジェクトの生成
		 * - 後で生成されたものが手前に表示されるため、塗りつぶし ⇒ 枠の順で作成
		 */
		// 矢印の内側を塗りつぶすか否か
		if (g_headerObj.setShadowColor[colorPos] !== ``) {
			// 矢印 (塗りつぶし)
			const arrShadow = createColorObject2(`${_name}Shadow${_j}_${_arrowCnt}`, {
				background: _shadowColor === `Default` ? _color : _shadowColor,
				rotate: g_workObj.arrowRtn[_j], styleName: `Shadow`,
			});
			if (_shadowColor === `Default`) {
				arrShadow.style.opacity = 0.5;
			}
			stepRoot.appendChild(arrShadow);
		}

		// 矢印 (枠)
		stepRoot.appendChild(createColorObject2(`${_name}Top${_j}_${_arrowCnt}`, {
			background: _color, rotate: g_workObj.arrowRtn[_j],
		}));
		g_customJsObj.makeArrow.forEach(func => func(_attrs, arrowName, _name, _arrowCnt));
	};

	/**
	 * 矢印移動メイン
	 * @param {number} _j 
	 * @param {number} _k 
	 * @param {string} _name 
	 */
	const movArrow = (_j, _k, _name) => {
		const arrowName = `${_name}${_j}_${_k}`;
		const currentArrow = g_attrObj[arrowName];

		// 全体色変化 (移動時)
		changeColorFunc[_name](_j, _k);

		// 移動
		if (g_workObj.currentSpeed !== 0) {
			const boostCnt = currentArrow.boostCnt;
			currentArrow.prevY = currentArrow.y;
			currentArrow.y -= (g_workObj.currentSpeed * currentArrow.boostSpd + g_workObj.motionOnFrames[boostCnt] * currentArrow.boostDir) * currentArrow.dir;
			$id(arrowName).top = wUnit(currentArrow.y);
			currentArrow.boostCnt--;
		}
		judgeMotionFunc[`${_name}${g_stateObj.autoAll}`](_j, arrowName, --currentArrow.cnt);
		judgeNextFunc[`${_name}${g_stateObj.autoAll}`](_j, _k, currentArrow.cnt);
	};

	/**
	 * フリーズアロー生成
	 * @param {object} _attrs フリーズアロー個別の属性
	 *   (pos: 矢印種類, arrivalFrame: 到達フレーム数, initY: 初期表示位置, 
	 *    initBoostY: Motion有効時の初期表示位置加算, motionFrame: アニメーション有効フレーム数)
	 * @param {number} _arrowCnt 現在の判定フリーズアロー順
	 * @param {string} _name フリーズアロー名
	 * @param {string} _normalColor フリーズアロー(矢印)の色
	 * @param {string} _barColor フリーズアロー(帯)の色
	 * @param {string} _shadowColor フリーズアロー(塗りつぶし)の色
	 */
	const makeFrzArrow = (_attrs, _arrowCnt, _name, _normalColor, _barColor, _shadowColor) => {
		const _j = _attrs.pos;
		const dividePos = g_workObj.dividePos[_j] % 2;
		const frzNo = `${_j}_${_arrowCnt}`;
		const frzName = `${_name}${frzNo}`;
		const firstPosY = C_STEP_Y + g_posObj.reverseStepY * dividePos +
			(_attrs.initY * g_workObj.boostSpd +
				_attrs.initBoostY * g_workObj.boostDir) * g_workObj.scrollDir[_j];
		const firstBarLength = g_workObj[`mk${toCapitalize(_name)}Length`][_j][(_arrowCnt - 1) * 2] * g_workObj.boostSpd;

		const frzRoot = createEmptySprite(arrowSprite[g_workObj.dividePos[_j]], frzName, {
			x: g_workObj.stepX[_j], y: firstPosY, w: C_ARW_WIDTH, h: C_ARW_WIDTH + firstBarLength,
		});
		/**
		 * フリーズアロー毎の属性情報
		 */
		g_attrObj[frzName] = {
			// 生存フレーム数
			cnt: _attrs.arrivalFrame + 1,
			// 生存フレーム数 (ストップ分除去、個別加速/Motionオプション用)
			boostCnt: _attrs.motionFrame,
			// 判定終了フラグ (false: 未判定, true: 判定済)
			judgEndFlg: false,
			// 移動中フラグ (false: 押しっぱなしの状態, true: 移動中)
			isMoving: true,
			// フリーズアローの長さ
			frzBarLength: firstBarLength,
			// キーを離していたフレーム数 (基準値超えでNG判定)
			keyUpFrame: 0,
			// 個別加速量
			boostSpd: g_workObj.boostSpd,
			// ステップゾーン位置 (0: デフォルト, 1: リバース)
			dividePos: dividePos,
			// スクロール方向 (1: デフォルト, -1: リバース)
			dir: g_workObj.scrollDir[_j],
			// 個別加速方向 (1: 順方向加速, -1: 逆方向加速)
			boostDir: g_workObj.boostDir,
			// 現フレーム時のフリーズアロー本体の位置
			y: firstPosY,
			// フリーズアロー(帯)の相対位置
			barY: C_ARW_WIDTH / 2 - firstBarLength * dividePos,
			// フリーズアロー(対矢印)の相対位置
			btmY: firstBarLength * g_workObj.scrollDir[_j],
		};
		// フリーズアロー色の設定
		// - 通常時 (矢印枠/矢印塗りつぶし/帯): g_attrObj[frzName].Normal / NormalShadow / NormalBar
		// - ヒット時 (矢印枠/矢印塗りつぶし/帯): g_attrObj[frzName].Hit / HitShadow / HitBar
		g_typeLists.frzColor.forEach(val => g_attrObj[frzName][val] = g_workObj[`${_name}${val}Colors`][_j]);
		arrowSprite[g_workObj.dividePos[_j]].appendChild(frzRoot);
		let shadowColor = _shadowColor === `Default` ? _normalColor : _shadowColor;

		/**
		 * フリーズアローオブジェクトの生成
		 * - 後で生成されたものが手前に表示されるため、以下の順で作成
		 */
		multiAppend(frzRoot,

			// フリーズアロー帯(frzBar)
			createColorObject2(`${_name}Bar${frzNo}`, {
				x: 5, y: g_attrObj[frzName].barY, w: C_ARW_WIDTH - 10, h: firstBarLength, background: _barColor, styleName: `frzBar`,
				opacity: 0.75,
			}),
		);
		const frzTopRoot = createEmptySprite(frzRoot, `${_name}TopRoot${frzNo}`,
			{ x: 0, y: 0, w: C_ARW_WIDTH, h: C_ARW_WIDTH });
		const frzBtmRoot = createEmptySprite(frzRoot, `${_name}BtmRoot${frzNo}`,
			{ x: 0, y: g_attrObj[frzName].btmY, w: C_ARW_WIDTH, h: C_ARW_WIDTH });

		multiAppend(frzTopRoot,

			// 開始矢印の塗り部分。ヒット時は前面に表示
			createColorObject2(`${_name}TopShadow${frzNo}`, {
				background: shadowColor, rotate: g_workObj.arrowRtn[_j], styleName: `Shadow`,
			}, g_cssObj.main_objShadow),

			// 開始矢印。ヒット時は非表示
			createColorObject2(`${_name}Top${frzNo}`, {
				background: _normalColor, rotate: g_workObj.arrowRtn[_j],
			}),
		);

		multiAppend(frzBtmRoot,

			// 後発矢印の塗り部分
			createColorObject2(`${_name}BtmShadow${frzNo}`, {
				background: shadowColor, rotate: g_workObj.arrowRtn[_j], styleName: `Shadow`,
			}, g_cssObj.main_objShadow),

			// 後発矢印
			createColorObject2(`${_name}Btm${frzNo}`, {
				background: _normalColor, rotate: g_workObj.arrowRtn[_j],
			}),

		);
		if (g_workObj[`${_name}CssMotions`][_j] !== ``) {
			frzRoot.classList.add(g_workObj[`${_name}CssMotions`][_j]);
			frzRoot.style.animationDuration = `${_attrs.arrivalFrame / g_fps}s`;
		}
		if (g_workObj[`${_name}ArrowCssMotions`][_j] !== ``) {
			[frzTopRoot, frzBtmRoot].forEach(obj => {
				obj.classList.add(g_workObj[`${_name}ArrowCssMotions`][_j]);
				obj.style.animationDuration = `${_attrs.arrivalFrame / g_fps}s`;
			});
		}
		g_customJsObj.makeFrzArrow.forEach(func => func(_attrs, frzName, _name, _arrowCnt));
	};

	/**
	 * フリーズアロー処理メイン
	 * @param {number} _j 
	 * @param {number} _k 
	 * @param {string} _name 
	 */
	const movFrzArrow = (_j, _k, _name) => {
		const frzNo = `${_j}_${_k}`;
		const frzName = `${_name}${frzNo}`;
		const currentFrz = g_attrObj[frzName];
		const movY = g_workObj.currentSpeed * currentFrz.boostSpd * currentFrz.dir;

		if (!currentFrz.judgEndFlg) {
			if (currentFrz.isMoving) {

				// 全体色変化 (通常時)
				changeColorFunc[_name](_j, _k, `Normal`);

				// 移動
				if (g_workObj.currentSpeed !== 0) {
					currentFrz.y -= movY + g_workObj.motionOnFrames[currentFrz.boostCnt] * currentFrz.dir * currentFrz.boostDir;
					$id(frzName).top = wUnit(currentFrz.y);
					currentFrz.boostCnt--;
				}
				currentFrz.cnt--;

				// 次フリーズアローへ判定を移すかチェック
				judgeNextFunc[`${_name}${g_stateObj.autoAll}`](_j, _k, currentFrz.cnt);

			} else {

				// 全体色変化 (ヒット時)
				changeColorFunc[_name](_j, _k, `Hit`);

				// フリーズアローがヒット中の処理
				if (currentFrz.frzBarLength > 0) {

					currentFrz.frzBarLength -= movY * currentFrz.dir;
					currentFrz.barY -= movY * currentFrz.dividePos;
					currentFrz.btmY -= movY;

					$id(`${_name}Bar${frzNo}`).height = wUnit(currentFrz.frzBarLength);
					$id(`${_name}Bar${frzNo}`).top = wUnit(currentFrz.barY);
					$id(`${_name}BtmRoot${frzNo}`).top = wUnit(currentFrz.btmY);

					if (!checkKeyUpFunc[`${_name}${g_stateObj.autoAll}`](_j)) {
						currentFrz.keyUpFrame++;
						judgeMotionFunc[`${_name}KeyUp`](_j, _k, frzName, currentFrz.cnt);
					}
				} else {
					judgeMotionFunc[`${_name}OK`](_j, _k, frzName, currentFrz.cnt);
				}
			}
			// フリーズアローが枠外に出たときの処理
			judgeMotionFunc[`${_name}NG`](_j, _k, frzName, currentFrz.cnt);

		} else {
			currentFrz.frzBarLength -= movY * currentFrz.dir;
			if (currentFrz.frzBarLength > 0) {
				currentFrz.y -= movY;
				$id(frzName).top = wUnit(currentFrz.y);
			} else {
				judgeObjDelete[_name](_j, frzName);
			}
		}
	};

	/**
	 * フレーム処理(譜面台)
	 */
	const flowTimeline = () => {

		const currentFrame = g_scoreObj.frameNum;
		lblframe.textContent = g_scoreObj.baseFrame;

		// キーの押下状態を取得
		for (let j = 0; j < keyNum; j++) {
			for (let m = 0; m < g_workObj.keyCtrlN[j].length; m++) {
				g_workObj.keyHitFlg[j][m] = keyIsDown(g_workObj.keyCtrlN[j][m]);
			}
		}

		if (currentFrame === musicStartFrame) {
			musicStartFlg = true;

			// ローカルかつBase64エンコード無し(WebAudioAPI使用不可)のときは従来通り再生
			if (!(g_audio instanceof AudioPlayer)) {
				musicStartTime = performance.now();
				g_audio.play();
				g_audio.dispatchEvent(new CustomEvent(`timeupdate`));
			}
		}

		// 背景・マスクモーション、スキン変更
		g_animationData.filter(sprite => g_scoreObj[`${sprite}Data`][currentFrame] !== undefined)
			.forEach(sprite => g_animationFunc.drawMain[sprite](currentFrame, sprite));

		// フェードイン・アウト
		const isFadeOutArea = currentFrame >= g_scoreObj.fadeOutFrame && currentFrame < g_scoreObj.fadeOutFrame + g_scoreObj.fadeOutTerm;
		if (g_audio.volume >= g_stateObj.volume / 100) {
			musicStartFlg = false;
		}
		if (musicStartFlg) {
			g_audio.volume = Math.min((g_audio.volume + (3 * g_stateObj.volume / 100) / 1000), 1);
		} else if (isFadeOutArea) {
			g_audio.volume = Math.max((g_audio.volume - (3 * g_stateObj.volume / 100 * C_FRM_AFTERFADE / g_scoreObj.fadeOutTerm) / 1000), 0);
		}

		// 画面揺れの設定
		g_shakingFunc[g_stateObj.shaking]();

		// ユーザカスタムイベント(フレーム毎)
		g_customJsObj.mainEnterFrame.forEach(func => func());

		// 速度変化 (途中変速, 個別加速)
		while (currentFrame >= g_workObj.speedData?.[speedCnts]) {
			g_workObj.currentSpeed = g_workObj.speedData[speedCnts + 1];
			speedCnts += 2;
		}
		while (currentFrame >= g_workObj.boostData?.[boostCnts]) {
			g_workObj.boostSpd = g_workObj.boostData[boostCnts + 1];
			g_workObj.boostDir = (g_workObj.boostSpd > 0 ? 1 : -1);
			boostCnts += 2;
		}

		objList.forEach(header => {
			const headerU = toCapitalize(header);

			// 個別・全体色変化 (矢印)
			g_typeLists.arrowColor.forEach(ctype =>
				changeColors(g_workObj[`mk${headerU}Color${ctype}`][currentFrame],
					g_workObj[`mk${headerU}Color${ctype}Cd`][currentFrame], header, `arrow${ctype}`));

			// 個別・全体色変化（フリーズアロー）
			g_typeLists.frzColor.forEach(ctype =>
				changeColors(g_workObj[`mk${headerU}FColor${ctype}`][currentFrame],
					g_workObj[`mk${headerU}FColor${ctype}Cd`][currentFrame], header, `frz${ctype}`));

			// 矢印モーション
			changeCssMotions(header, `arrow`, currentFrame);

			// フリーズアローモーション
			changeCssMotions(header, `frz`, currentFrame);

		});

		// キー変化
		while (currentFrame >= g_scoreObj.keychFrames[keychCnts]) {
			for (let j = 0; j < keyNum; j++) {
				appearKeyTypes(j, g_scoreObj.keychTarget[keychCnts], g_scoreObj.keychTargetAlpha[keychCnts]);
			}
			keychCnts++;
		}

		// スクロール変化
		changeScrollArrowDirs(currentFrame);
		changeStepY(currentFrame);

		// ダミー矢印生成（背面に表示するため先に処理）
		g_workObj.mkDummyArrow[currentFrame]?.forEach(data =>
			makeArrow(data, ++dummyArrowCnts[data.pos], `dummyArrow`, g_workObj.dummyArrowColors[data.pos], g_workObj.dummyArrowShadowColors[data.pos]));

		// 矢印生成
		g_workObj.mkArrow[currentFrame]?.forEach(data =>
			makeArrow(data, ++arrowCnts[data.pos], `arrow`, g_workObj.arrowColors[data.pos], g_workObj.arrowShadowColors[data.pos]));

		// ダミーフリーズアロー生成
		g_workObj.mkDummyFrzArrow[currentFrame]?.forEach(data =>
			makeFrzArrow(data, ++dummyFrzCnts[data.pos], `dummyFrz`, g_workObj.dummyFrzNormalColors[data.pos],
				g_workObj.dummyFrzNormalBarColors[data.pos], g_workObj.dummyFrzNormalShadowColors[data.pos]));

		// フリーズアロー生成
		g_workObj.mkFrzArrow[currentFrame]?.forEach(data =>
			makeFrzArrow(data, ++frzCnts[data.pos], `frz`, g_workObj.frzNormalColors[data.pos],
				g_workObj.frzNormalBarColors[data.pos], g_workObj.frzNormalShadowColors[data.pos]));

		// 矢印・フリーズアロー移動＆消去
		for (let j = 0; j < keyNum; j++) {
			const stepDivHit = document.getElementById(`stepHit${j}`);

			// ダミー矢印
			for (let k = g_workObj.judgDummyArrowCnt[j]; k <= dummyArrowCnts[j]; k++) {
				movArrow(j, k, `dummyArrow`);
			}

			// 通常矢印
			for (let k = g_workObj.judgArrowCnt[j]; k <= arrowCnts[j]; k++) {
				movArrow(j, k, `arrow`);
			}

			// ダミーフリーズアロー移動
			for (let k = g_workObj.judgDummyFrzCnt[j]; k <= dummyFrzCnts[j]; k++) {
				movFrzArrow(j, k, `dummyFrz`);
			}

			// フリーズアロー移動
			for (let k = g_workObj.judgFrzCnt[j]; k <= frzCnts[j]; k++) {
				movFrzArrow(j, k, `frz`);
			}

			// ステップゾーンのヒット領域は一定時間で非表示化
			let hitCnt = stepDivHit.getAttribute(`cnt`);
			if (hitCnt > 0) {
				stepDivHit.setAttribute(`cnt`, --hitCnt);
				if (hitCnt === 0) {
					stepDivHit.style.opacity = 0;
				}
			}
		}

		// 歌詞表示
		g_scoreObj.wordData[currentFrame]?.forEach(tmpObj => {
			g_wordObj.wordDir = tmpObj[0];
			g_wordObj.wordDat = tmpObj[1];
			g_wordSprite = document.getElementById(`lblword${g_wordObj.wordDir}`);

			const wordDepth = Number(g_wordObj.wordDir);
			if (g_wordObj.wordDat.substring(0, 5) === `[fade`) {

				// フェードイン・アウト開始
				const fkey = fadeFlgs[Object.keys(fadeFlgs).find(flg => g_wordObj.wordDat === `[${flg}]`)];
				g_wordObj[`fade${fkey[0]}Flg${wordDepth}`] = true;
				g_wordObj[`fade${fkey[1]}Flg${wordDepth}`] = false;
				g_wordSprite.style.animationName =
					`fade${fkey[0]}${(++g_workObj[`fade${fkey[0]}No`][wordDepth] % 2)}`;

				g_workObj.lastFadeFrame[wordDepth] = currentFrame;
				g_workObj.wordFadeFrame[wordDepth] = (tmpObj.length > 2 ?
					setIntVal(tmpObj[2], C_WOD_FRAME) : C_WOD_FRAME);

				g_wordSprite.style.animationDuration = `${g_workObj.wordFadeFrame[wordDepth] / g_fps}s`;
				g_wordSprite.style.animationTimingFunction = `linear`;
				g_wordSprite.style.animationFillMode = `forwards`;

			} else if ([`[center]`, `[left]`, `[right]`].includes(g_wordObj.wordDat)) {

				// 歌詞位置変更
				g_wordSprite.style.textAlign = g_wordObj.wordDat.slice(1, -1);

			} else if (/\[fontSize=\d+\]/.test(g_wordObj.wordDat)) {

				// フォントサイズ変更
				const fontSize = setIntVal(g_wordObj.wordDat.match(/\d+/)[0], g_limitObj.mainSiz);
				g_wordSprite.style.fontSize = wUnit(fontSize);

			} else {

				// フェードイン・アウト処理後、表示する歌詞を表示
				const fadingFlg = currentFrame - g_workObj.lastFadeFrame[wordDepth] >= g_workObj.wordFadeFrame[wordDepth];
				[`Out`, `In`].filter(pattern => g_wordObj[`fade${pattern}Flg${g_wordObj.wordDir}`] && fadingFlg).forEach(pattern => {
					g_wordSprite.style.animationName = `none`;
					g_wordObj[`fade${pattern}Flg${g_wordObj.wordDir}`] = false;
				});
				g_workObj[`word${g_wordObj.wordDir}Data`] = g_wordObj.wordDat;
				g_wordSprite.innerHTML = g_wordObj.wordDat;
			}
		});

		// 判定キャラクタ消去
		jdgGroups.forEach(jdg => {
			let charaJCnt = document.getElementById(`chara${jdg}`).getAttribute(`cnt`);
			if (charaJCnt > 0) {
				document.getElementById(`chara${jdg}`).setAttribute(`cnt`, --charaJCnt);
				if (charaJCnt === 0) {
					document.getElementById(`chara${jdg}`).textContent = ``;
					document.getElementById(`combo${jdg}`).textContent = ``;
					document.getElementById(`diff${jdg}`).textContent = ``;
				}
			}
		});

		// 曲終了判定
		if (currentFrame >= fullFrame) {
			if (g_stateObj.lifeMode === C_LFE_BORDER && g_workObj.lifeVal < g_workObj.lifeBorder) {
				g_gameOverFlg = true;
			}
			resetKeyControl();
			clearTimeout(g_timeoutEvtId);
			g_workObj.mainEndTime = thisTime;
			resultInit();

		} else if (g_workObj.lifeVal === 0 && g_workObj.lifeBorder === 0) {

			// ライフ制＆ライフ０の場合は途中終了
			g_audio.pause();
			clearTimeout(g_timeoutEvtId);
			g_gameOverFlg = true;
			g_finishFlg = false;
			resultInit();

		} else {

			// タイマー
			if (Math.floor(g_scoreObj.baseFrame % g_fps) === 0) {
				if (g_scoreObj.baseFrame >= 0) {
					lblTime1.textContent = transFrameToTimer(g_scoreObj.baseFrame);
				}
			}

			// 60fpsから遅延するため、その差分を取って次回のタイミングで遅れをリカバリする
			thisTime = performance.now();
			buffTime = 0;
			if (g_audio instanceof AudioPlayer || currentFrame >= musicStartFrame) {
				buffTime = (thisTime - musicStartTime - (currentFrame - musicStartFrame) * 1000 / g_fps);
			}
			g_scoreObj.frameNum++;
			g_scoreObj.baseFrame++;
			g_timeoutEvtId = setTimeout(flowTimeline, 1000 / g_fps - buffTime);
		}
	};
	g_skinJsObj.main.forEach(func => func());

	g_audio.currentTime = firstFrame / g_fps * g_headerObj.playbackRate;
	g_audio.playbackRate = g_headerObj.playbackRate;

	// WebAudioAPIが使用できる場合は小数フレーム分だけ音源位置を調整
	if (g_audio instanceof AudioPlayer) {
		const musicStartAdjustment = (g_headerObj.blankFrame - g_stateObj.decimalAdjustment + 1) / g_fps;
		musicStartTime = performance.now() + musicStartAdjustment * 1000;
		g_audio.play(musicStartAdjustment);
	}

	g_timeoutEvtId = setTimeout(flowTimeline, 1000 / g_fps);
};

/**
 * アルファマスクの再描画 (Appearance: Hidden+, Sudden+ 用)
 * @param {number} _num 
 */
const changeAppearanceFilter = (_num = 10) => {
	const MAX_FILTER_POS = 100;
	const topNum = g_hidSudObj[g_stateObj.appearance];
	const bottomNum = (g_hidSudObj[g_stateObj.appearance] + 1) % 2;
	if (g_stateObj.appearance === `Hid&Sud+` && _num > MAX_FILTER_POS / 2) {
		_num = MAX_FILTER_POS / 2;
	}

	const numPlus = (g_stateObj.appearance === `Hid&Sud+` ? _num : 0);
	const topShape = `inset(${_num}% 0% ${numPlus}% 0%)`;
	const bottomShape = `inset(${numPlus}% 0% ${_num}% 0%)`;

	for (let j = 0; j < g_stateObj.layerNum; j += 2) {
		$id(`arrowSprite${topNum + j}`).clipPath = topShape;
		$id(`arrowSprite${bottomNum + j}`).clipPath = bottomShape;
	}
	$id(`filterBar0`).top = wUnit(parseFloat($id(`arrowSprite${topNum}`).top) + g_posObj.arrowHeight * _num / MAX_FILTER_POS);
	$id(`filterBar1`).top = wUnit(parseFloat($id(`arrowSprite${bottomNum}`).top) + g_posObj.arrowHeight * (MAX_FILTER_POS - _num) / MAX_FILTER_POS);
	if (g_appearanceRanges.includes(g_stateObj.appearance)) {
		$id(`filterView`).top =
			$id(`filterBar${g_hidSudObj.std[g_stateObj.appearance][g_stateObj.reverse]}`).top;
		filterView.textContent = `${_num}%`;

		if (g_stateObj.appearance !== `Hid&Sud+` && g_workObj.dividePos.every(v => v === g_workObj.dividePos[0])) {
			$id(`filterBar${(g_hidSudObj.std[g_stateObj.appearance][g_stateObj.reverse] + 1) % 2}`).display = C_DIS_NONE;
		}
		g_hidSudObj.filterPos = _num;
	}
};

/**
 * 判定カウンタ表示作成
 * @param {string} _id 
 * @param {number} _x
 * @param {string} _class 
 * @param {number} _heightPos 
 * @param {string|number} _text
 * @param {string} [_display='inherit'] 表示有無 (inherit: 表示 / none: 非表示)
 * @returns {HTMLDivElement}
 */
const makeCounterSymbol = (_id, _x, _class, _heightPos, _text, _display = C_DIS_INHERIT) => {
	return createDivCss2Label(_id, _text, {
		x: _x, y: g_limitObj.jdgCntsHeight * _heightPos,
		w: g_limitObj.jdgCntsWidth, h: g_limitObj.jdgCntsHeight, siz: g_limitObj.jdgCntsSiz, align: C_ALIGN_RIGHT,
		display: _display,
	}, _class);
};

/**
 * ステップゾーンの表示・非表示切替
 * @param {number} _j
 * @param {string} _display
 * @param {number} [_alpha=1] 
 */
const appearStepZone = (_j, _display, _alpha = 1) => {
	$id(`stepRoot${_j}`).display = _display;
	$id(`stepRoot${_j}`).opacity = _alpha;
};

/**
 * 部分キーのステップゾーン出現処理
 * @param {number} _j 
 * @param {string[]} _targets
 * @param {number[]} [_alphas] ステップゾーン毎の可視状況 (style.opacity の値)
 */
const appearKeyTypes = (_j, _targets, _alphas = fillArray(_targets.length, 1)) => {
	appearStepZone(_j, C_DIS_NONE);
	_targets.forEach((target, k) => {
		if (g_workObj.keyGroupMaps[_j].includes(target)) {
			appearStepZone(_j, C_DIS_INHERIT, _alphas[k]);
		}
	});
};

/**
 * FrzReturnの追加処理
 * @param {number} _rad 回転角度
 * @param {number[]} _axis 回転軸
 */
const changeReturn = (_rad, _axis) => {
	g_workObj.frzReturnFlg = true;
	let _transform = g_workObj.transform;
	_transform += ` rotate${_axis[0]}(${_rad}deg)`;
	if (_axis[1] !== undefined) {
		_transform += ` rotate${_axis[1]}(${_rad}deg)`;
	}
	if (document.getElementById(`mainSprite`) !== null) {
		mainSprite.style.transform = _transform;

		if (_rad < 360 && g_workObj.frzReturnFlg) {
			setTimeout(() => changeReturn(_rad + 4, _axis), 20);
		} else {
			g_workObj.frzReturnFlg = false;
		}
	}
}

/**
 * AutoRetryの設定
 * @param {number} _retryNum AutoRetryの設定位置（g_settings.autoRetryNum）
 */
const quickRetry = (_retryNum) => {
	if (g_settings.autoRetryNum >= _retryNum && !g_workObj.autoRetryFlg) {
		g_workObj.autoRetryFlg = true;
		setTimeout(() => {
			g_audio.pause();
			clearTimeout(g_timeoutEvtId);
			clearWindow();
			musicAfterLoaded();
		}, 16);
	}
};

/**
 * 個別・全体色変化
 * @param {number[]} _mkColor 
 * @param {string[]} _mkColorCd 
 * @param {string} _header
 * @param {string} _name
 */
const changeColors = (_mkColor, _mkColorCd, _header, _name) => {

	if (_mkColor === undefined) {
		return;
	}
	const camelHeader = _header === `` ? _name : `${_header}${toCapitalize(_name)}`;
	_mkColor.forEach((tempj, j) => {
		const targetj = tempj % 1000;
		g_workObj[`${camelHeader}Colors`][targetj] = _mkColorCd[j];
		if (tempj >= 1000) {
			g_workObj[`${camelHeader}ColorsAll`][targetj] = _mkColorCd[j];
			if (camelHeader.indexOf(`frzHitBar`) !== -1 && isNaN(Number(g_workObj.arrowRtn[targetj]))) {
				$id(`frzHitTop${targetj}`).background = _mkColorCd[j];
			}
		}
	});
};

/**
 * 個別モーション
 * @param {string} _header
 * @param {string} _name
 * @param {number} _frameNum
 */
const changeCssMotions = (_header, _name, _frameNum) => {
	const camelHeader = _header === `` ? _name : `${_header}${toCapitalize(_name)}`;
	g_workObj[`mk${toCapitalize(camelHeader)}CssMotion`][_frameNum]?.forEach((targetj, j) =>
		g_workObj[`${camelHeader}CssMotions`][targetj] =
		g_workObj[`mk${toCapitalize(camelHeader)}CssMotionName`][_frameNum][2 * j + (g_workObj.dividePos[targetj] % 2)]);
};

/**
 * スクロール方向の変更（矢印・フリーズアロー）
 * @param {number} _frameNum 
 */
const changeScrollArrowDirs = (_frameNum) =>
	g_workObj.mkScrollchArrow[_frameNum]?.forEach((targetj, j) => {
		g_workObj.scrollDir[targetj] = g_workObj.scrollDirDefault[targetj] * g_workObj.mkScrollchArrowDir[_frameNum][j];
		const baseLayer = Math.floor(g_workObj.dividePos[targetj] / 2) * 2;
		g_workObj.dividePos[targetj] = baseLayer + (g_workObj.scrollDir[targetj] === 1 ? 0 : 1);
	});

/**
 * ステップゾーンの位置反転
 * @param {number} _frameNum 
 */
const changeStepY = (_frameNum) =>
	g_workObj.mkScrollchStep[_frameNum]?.forEach((targetj, j) => {
		const dividePos = (g_workObj.scrollDirDefault[targetj] * g_workObj.mkScrollchStepDir[_frameNum][j] === 1 ? 0 : 1);
		const baseY = C_STEP_Y + g_posObj.reverseStepY * dividePos;
		$id(`stepRoot${targetj}`).top = wUnit(baseY);
		$id(`frzHit${targetj}`).top = wUnit(baseY);
	});

/**
 * フリーズアローヒット時の描画変更
 * @param {number} _j 
 * @param {number} _k 
 * @param {string} _name
 * @param {number} [_difFrame=0]
 */
const changeHitFrz = (_j, _k, _name, _difFrame = 0) => {
	const frzNo = `${_j}_${_k}`;
	const frzName = `${_name}${frzNo}`;
	const currentFrz = g_attrObj[frzName];

	if (currentFrz.keyUpFrame !== 0) {
		return;
	}

	const styfrzBar = $id(`${_name}Bar${frzNo}`);
	const styfrzBtmRoot = $id(`${_name}BtmRoot${frzNo}`);
	const styfrzBtm = $id(`${_name}Btm${frzNo}`);
	const styfrzTopRoot = $id(`${_name}TopRoot${frzNo}`);
	const styfrzTop = $id(`${_name}Top${frzNo}`);
	const styfrzBtmShadow = $id(`${_name}BtmShadow${frzNo}`);

	// フリーズアロー位置の修正（ステップゾーン上に来るように）
	const delFrzLength = parseFloat($id(`stepRoot${_j}`).top) - currentFrz.y;
	$id(frzName).top = $id(`stepRoot${_j}`).top;

	// 早押ししたboostCnt分のフリーズアロー終端位置の修正
	const delFrzMotionLength = sumData(g_workObj.motionOnFrames.slice(0, currentFrz.boostCnt + 1));

	// 判定位置調整分の補正
	const hitPos = g_workObj.hitPosition * g_workObj.scrollDir[_j];

	currentFrz.frzBarLength -= (delFrzLength + delFrzMotionLength) * currentFrz.dir;
	currentFrz.barY -= (delFrzLength + delFrzMotionLength) * currentFrz.dividePos + hitPos;
	currentFrz.btmY -= delFrzLength + delFrzMotionLength + hitPos;
	currentFrz.y += delFrzLength;
	currentFrz.isMoving = false;

	/**
	 * フリーズアロー(ヒット時)の色変更
	 * - 生成時以降で全体色変化がある場合はその値へ置き換える
	 * @param {string} _type 
	 * @returns {string}
	 */
	const getColor = (_type) => {
		const cColor = g_workObj[`${_name}${_type}Colors`][_j];
		const cColorAll = g_workObj[`${_name}${_type}ColorsAll`][_j];
		return currentFrz[_type] !== cColor && cColorAll === cColor ? cColorAll : currentFrz[_type];
	};

	const tmpHitColor = getColor(`Hit`);
	styfrzBar.top = wUnit(currentFrz.barY);
	styfrzBar.height = wUnit(currentFrz.frzBarLength);
	styfrzBar.background = getColor(`HitBar`);
	styfrzBtmRoot.top = wUnit(currentFrz.btmY);
	styfrzBtm.background = tmpHitColor;
	styfrzTopRoot.top = wUnit(- hitPos);
	if (_name === `frz`) {
		const tmpShadowColor = getColor(`HitShadow`);
		styfrzBtmShadow.background = tmpShadowColor === `Default` ? tmpHitColor : tmpShadowColor;
		$id(`frzHit${_j}`).opacity = 0.9;
		$id(`frzTop${frzNo}`).display = C_DIS_NONE;
		if (isNaN(parseFloat(g_workObj.arrowRtn[_j]))) {
			$id(`frzHitTop${_j}`).background = tmpHitColor;
		}
	}

	// FrzReturnの設定
	if (g_stateObj.frzReturn !== C_FLG_OFF) {
		if (!g_workObj.frzReturnFlg) {
			changeReturn(4, g_frzReturnFunc[g_stateObj.frzReturn]());
		}
	}
	g_customJsObj[`judg_${_name}Hit`].forEach(func => func(_difFrame));
};

/**
 * フリーズアロー失敗時の描画変更
 * @param {number} _j 
 * @param {number} _k 
 */
const changeFailedFrz = (_j, _k) => {
	const frzNo = `${_j}_${_k}`;
	$id(`frzHit${_j}`).opacity = 0;
	$id(`frzTop${frzNo}`).display = C_DIS_INHERIT;
	$id(`frzTop${frzNo}`).background = `#cccccc`;
	$id(`frzTopShadow${frzNo}`).background = `#333333`;
	$id(`frzBtmShadow${frzNo}`).background = `#333333`;
	$id(`frzBar${frzNo}`).background = `#999999`;
	$id(`frzBar${frzNo}`).opacity = 1;
	$id(`frzBtm${frzNo}`).background = `#cccccc`;

	// FrzReturnの設定
	if (g_stateObj.frzReturn !== C_FLG_OFF) {
		if (!g_workObj.frzReturnFlg) {
			changeReturn(4, g_frzReturnFunc[g_stateObj.frzReturn]());
		}
	}
};

/**
 * キーを押したかどうかを判定
 * @param {number} _keyCode 
 * @returns {boolean}
 */
const keyIsDown = _keyCode => g_inputKeyBuffer[_keyCode];

/**
 * 押したキーがシフトキーかどうかを判定
 * @returns {boolean}
 */
const keyIsShift = () => keyIsDown(g_kCdNameObj.shiftLKey) || keyIsDown(g_kCdNameObj.shiftRKey);

/**
 * 矢印・フリーズアロー判定
 * @param {number} _j 対象矢印・フリーズアロー
 */
const judgeArrow = _j => {

	const currentNo = g_workObj.judgArrowCnt[_j];
	const arrowName = `arrow${_j}_${currentNo}`;
	const currentArrow = g_attrObj[arrowName];
	const existJudgArrow = document.getElementById(arrowName) !== null;

	const fcurrentNo = g_workObj.judgFrzCnt[_j];
	const frzName = `frz${_j}_${fcurrentNo}`;
	const currentFrz = g_attrObj[frzName];
	const existJudgFrz = document.getElementById(frzName) !== null;

	const judgeTargetArrow = _difFrame => {
		const _difCnt = Math.abs(_difFrame);
		const stepHitTargetArrow = _resultJdg => {
			const stepDivHit = document.getElementById(`stepHit${_j}`);
			stepDivHit.style.top = wUnit(currentArrow.prevY - parseFloat($id(`stepRoot${_j}`).top) - 15 + g_workObj.hitPosition * g_workObj.scrollDir[_j]);
			stepDivHit.style.opacity = 0.75;
			stepDivHit.classList.value = ``;
			stepDivHit.classList.add(g_cssObj[`main_step${_resultJdg}`]);
			stepDivHit.setAttribute(`cnt`, C_FRM_HITMOTION);
		}

		if (g_stateObj.excessive === C_FLG_ON && _difFrame <= g_judgObj.arrowJ[g_judgPosObj.uwan] && _difFrame > g_judgObj.arrowJ[g_judgPosObj.shobon]) {
			// 空押し判定（有効かつ早押し時のみ）
			displayDiff(_difFrame);
			stepHitTargetArrow(`Excessive`);
			return true;

		} else if (_difCnt <= g_judgObj.arrowJ[g_judgPosObj.shobon]) {
			// 通常判定
			const [resultFunc, resultJdg] = checkJudgment(_difCnt);
			resultFunc(_difFrame);
			displayDiff(_difFrame);
			stepHitTargetArrow(resultJdg);
			document.getElementById(arrowName).remove();
			g_workObj.judgArrowCnt[_j]++;
			return true;
		}
		return false;
	};

	const judgeTargetFrzArrow = _difFrame => {
		const _difCnt = Math.abs(_difFrame);
		if (_difCnt <= g_judgObj.frzJ[g_judgPosObj.iknai] && !currentFrz.judgEndFlg
			&& g_workObj.judgFrzHitCnt[_j] <= fcurrentNo) {

			if (g_headerObj.frzStartjdgUse) {
				const [resultFunc] = checkJudgment(_difCnt);
				resultFunc(_difFrame);
				displayDiff(_difFrame);
			} else {
				displayDiff(_difFrame, `F`);
			}

			if (_difCnt <= g_judgObj.frzJ[g_judgPosObj.sfsf]) {
				changeHitFrz(_j, fcurrentNo, `frz`, _difFrame);
			} else {
				changeFailedFrz(_j, fcurrentNo);
				if (g_headerObj.frzStartjdgUse) {
					judgeIknai(_difFrame);
					currentFrz.judgEndFlg = true;
				}
			}
			g_workObj.judgFrzHitCnt[_j] = fcurrentNo + 1;
			return true;
		}
		return false;
	};

	let judgeFlg = false;
	const difFrame = (existJudgArrow ? currentArrow.cnt : Infinity);
	const frzDifFrame = (existJudgFrz ? currentFrz.cnt : Infinity);
	if (difFrame < frzDifFrame) {
		judgeFlg = judgeTargetArrow(difFrame);
	} else if (difFrame > frzDifFrame) {
		judgeFlg = judgeTargetFrzArrow(frzDifFrame);
	}
	if (!judgeFlg) {
		$id(`stepDiv${_j}`).display = C_DIS_INHERIT;
	}
};

/**
 * タイミングズレを表示
 * @param {number} _difFrame 
 * @param {string} _fjdg フリーズアロー判定有無 (フリーズアローのときは"F"が入る)
 * @param {number} _justFrames Fast/Slowの表示条件フレーム数
 */
const displayDiff = (_difFrame, _fjdg = ``, _justFrames = g_headerObj.justFrames) => {
	let diffJDisp = ``;
	g_workObj.diffList.push(_difFrame);
	const difCnt = Math.abs(_difFrame);
	if (_difFrame > g_judgObj.arrowJ[g_judgPosObj.shobon]) {
		diffJDisp = `<span class="common_excessive">Excessive</span>`;
		g_resultObj.excessive++;
		lifeDamage(true);
	} else if (_difFrame > _justFrames) {
		diffJDisp = `<span class="common_diffFast">Fast ${difCnt} Frames</span>`;
		g_resultObj.fast++;
		quickRetry(4);
	} else if (_difFrame < _justFrames * (-1)) {
		diffJDisp = `<span class="common_diffSlow">Slow ${difCnt} Frames</span>`;
		g_resultObj.slow++;
		quickRetry(4);
	}
	document.getElementById(`diff${_fjdg}J`).innerHTML = diffJDisp;
};

/**
 * ライフゲージバーの色、数値を変更
 * @param {string} [_state=''] 
 */
const changeLifeColor = (_state = ``) => {
	const lblLife = document.getElementById(`lblLife`);
	const lifeBar = document.getElementById(`lifeBar`);
	if (_state !== ``) {
		const lifeCss = g_cssObj[`life_${_state}`];
		lblLife.classList.remove(g_cssObj.life_Max, g_cssObj.life_Cleared, g_cssObj.life_Failed);
		lifeBar.classList.remove(g_cssObj.life_Max, g_cssObj.life_Cleared, g_cssObj.life_Failed);
		lblLife.classList.add(lifeCss);
		lifeBar.classList.add(lifeCss);
	}

	const intLifeVal = Math.floor(g_workObj.lifeVal);
	lblLife.textContent = intLifeVal;
	lifeBar.style.top = wUnit(50 + (g_headerObj.playingHeight - 100) * (g_headerObj.maxLifeVal - intLifeVal) / g_headerObj.maxLifeVal);
	lifeBar.style.height = wUnit((g_headerObj.playingHeight - 100) * intLifeVal / g_headerObj.maxLifeVal);
};

/**
 * ゲージ回復処理
 */
const lifeRecovery = () => {
	g_workObj.lifeVal += g_workObj.lifeRcv;

	if (g_workObj.lifeVal >= g_headerObj.maxLifeVal) {
		g_workObj.lifeVal = g_headerObj.maxLifeVal;
		changeLifeColor(`Max`);
	} else {
		changeLifeColor(g_workObj.lifeVal >= g_workObj.lifeBorder ? `Cleared` : ``);
	}
};

/**
 * ゲージダメージ処理
 * @param {boolean} [_excessive=false] 空押し判定有無
 */
const lifeDamage = (_excessive = false) => {
	g_workObj.lifeVal -= g_workObj.lifeDmg * (_excessive ? 0.25 : 1);
	quickRetry(1);

	if (g_workObj.lifeVal <= 0) {
		g_workObj.lifeVal = 0;
		changeLifeColor();
	} else {
		changeLifeColor(g_workObj.lifeVal < g_workObj.lifeBorder ? `Failed` : `Cleared`);
	}
};

/**
 * 判定キャラクタの表示、判定済矢印数・判定数のカウンタ
 * @param {string} _name 
 * @param {string} _character 
 * @param {string} [_fjdg=''] 
 */
const changeJudgeCharacter = (_name, _character, _fjdg = ``) => {
	g_resultObj[_name]++;
	g_currentArrows++;
	document.getElementById(`chara${_fjdg}J`).innerHTML = `<span class="common_${_name}">${_character}</span>`;
	document.getElementById(`chara${_fjdg}J`).setAttribute(`cnt`, C_FRM_JDGMOTION);
	document.getElementById(`lbl${toCapitalize(_name)}`).textContent = g_resultObj[_name];
};

/**
 * コンボの更新
 */
const updateCombo = () => {
	if (++g_resultObj.combo > g_resultObj.maxCombo) {
		g_resultObj.maxCombo = g_resultObj.combo;
		lblMCombo.textContent = g_resultObj.maxCombo;
	}
	comboJ.textContent = `${g_resultObj.combo} Combo!!`;
};

/**
 * 回復判定の共通処理
 * @param {string} _name 
 * @param {number} _difFrame 
 */
const judgeRecovery = (_name, _difFrame) => {
	changeJudgeCharacter(_name, g_lblNameObj[`j_${_name}`]);
	updateCombo();
	lifeRecovery();
	finishViewing();

	if (g_stateObj.freezeReturn !== C_FLG_OFF) {
		if ((g_resultObj.ii + g_resultObj.shakin) % 100 === 0 && !g_workObj.frzReturnFlg) {
			changeReturn(1, g_frzReturnFunc[g_stateObj.frzReturn]());
		}
	}
	if (_name === `shakin`) {
		quickRetry(3);
	}
	g_customJsObj[`judg_${_name}`].forEach(func => func(_difFrame));
};

/**
 * ダメージ系共通処理
 * @param {string} _name 
 * @param {number} _difFrame 
 */
const judgeDamage = (_name, _difFrame) => {
	changeJudgeCharacter(_name, g_lblNameObj[`j_${_name}`]);
	g_resultObj.combo = 0;
	comboJ.textContent = ``;
	diffJ.textContent = ``;
	lifeDamage();
	g_customJsObj[`judg_${_name}`].forEach(func => func(_difFrame));
};

/**
 * 判定処理：イイ
 * @param {number} _difFrame 
 */
const judgeIi = _difFrame => judgeRecovery(`ii`, _difFrame);

/**
 * 判定処理：シャキン
 * @param {number} _difFrame 
 */
const judgeShakin = _difFrame => judgeRecovery(`shakin`, _difFrame);

/**
 * 判定処理：マターリ
 * @param {number} _difFrame 
 */
const judgeMatari = _difFrame => {
	changeJudgeCharacter(`matari`, g_lblNameObj.j_matari);
	comboJ.textContent = ``;
	finishViewing();
	quickRetry(2);

	g_customJsObj.judg_matari.forEach(func => func(_difFrame));
};

/**
 * 判定処理：ショボーン
 * @param {number} _difFrame 
 */
const judgeShobon = _difFrame => judgeDamage(`shobon`, _difFrame);

/**
 * 判定処理：ウワァン
 * @param {number} _difFrame 
 */
const judgeUwan = _difFrame => judgeDamage(`uwan`, _difFrame);

/**
 * 判定処理：キター
 * @param {number} _difFrame 
 */
const judgeKita = _difFrame => {
	changeJudgeCharacter(`kita`, g_lblNameObj.j_kita, `F`);

	if (++g_resultObj.fCombo > g_resultObj.fmaxCombo) {
		g_resultObj.fmaxCombo = g_resultObj.fCombo;
		lblFCombo.textContent = g_resultObj.fmaxCombo;
	}
	comboFJ.textContent = `${g_resultObj.fCombo} Combo!!`;

	lifeRecovery();
	finishViewing();

	g_customJsObj.judg_kita.forEach(func => func(_difFrame));
};

/**
 * 判定処理：イクナイ
 * @param {number} _difFrame 
 */
const judgeIknai = _difFrame => {
	changeJudgeCharacter(`iknai`, g_lblNameObj.j_iknai, `F`);
	comboFJ.textContent = ``;
	g_resultObj.fCombo = 0;

	lifeDamage();

	g_customJsObj.judg_iknai.forEach(func => func(_difFrame));
};

const jdgList = [`ii`, `shakin`, `matari`, `shobon`].map(jdg => toCapitalize(jdg));
const jdgFuncList = [judgeIi, judgeShakin, judgeMatari, judgeShobon];
const checkJudgment = (_difCnt) => {
	const idx = g_judgObj.arrowJ.findIndex(jdgCnt => _difCnt <= jdgCnt);
	return [jdgFuncList[idx], jdgList[idx]];
};

/**
 * クリア表示
 * @param {string} _state 
 * @returns {string}
 */
const resultViewText = _state => _state === `` ? `` :
	`<span class="result_${toCapitalize(_state)}">${g_lblNameObj[_state]}</span>`;

/**
 * フルコンボ・パーフェクト演出の作成
 * @param {string} _text 
 */
const makeFinishView = _text => {
	finishView.innerHTML = _text;
	finishView.style.opacity = 1;
	[`charaJ`, `comboJ`, `diffJ`, `charaFJ`, `comboFJ`, `diffFJ`].forEach(label =>
		document.getElementById(label).textContent = ``);
};

const finishViewing = () => {
	if (g_currentArrows === g_fullArrows) {
		if (g_resultObj.ii + g_resultObj.kita === g_fullArrows) {
			g_resultObj.spState = `allPerfect`;
		} else if (g_resultObj.ii + g_resultObj.shakin + g_resultObj.kita === g_fullArrows) {
			g_resultObj.spState = `perfect`;
		} else if (g_resultObj.uwan === 0 && g_resultObj.shobon === 0 && g_resultObj.iknai === 0) {
			g_resultObj.spState = `fullCombo`;
		}
		if (g_headerObj.finishView !== C_DIS_NONE && [`allPerfect`, `perfect`, `fullCombo`].includes(g_resultObj.spState)) {
			makeFinishView(resultViewText(g_resultObj.spState));
		}
	}
};

/*-----------------------------------------------------------*/
/* Scene : RESULT [grape] */
/*-----------------------------------------------------------*/

/**
 * リザルト画面初期化
 */
const resultInit = () => {

	clearWindow(true);
	g_currentPage = `result`;

	// 結果画面用フレーム初期化
	g_scoreObj.resultFrameNum = 0;

	// リザルトアニメーション用フレーム初期化、ループカウンター設定
	g_animationData.forEach(sprite => {
		g_scoreObj[`${sprite}ResultFrameNum`] = 0;
		g_scoreObj[`${sprite}ResultLoopCount`] = 0;
	});

	const divRoot = document.getElementById(`divRoot`);

	// 曲時間制御変数
	let thisTime;
	let buffTime;
	let resultStartTime = g_workObj.mainEndTime > 0 ? g_workObj.mainEndTime : performance.now();

	if (g_stateObj.d_background === C_FLG_OFF && g_headerObj.resultMotionSet) {
	} else {
		// ゲームオーバー時は失敗時のリザルトモーションを適用
		if (!g_finishFlg) {
			const scoreIdHeader = setScoreIdHeader(g_stateObj.scoreId, g_stateObj.scoreLockFlg);

			g_animationData.forEach(sprite => {
				const failedData = g_rootObj[`${sprite}failedS${scoreIdHeader}_data`] ?? g_rootObj[`${sprite}failedS_data`];
				if (failedData !== undefined) {
					[g_headerObj[`${sprite}ResultData`], g_headerObj[`${sprite}ResultMaxDepth`]] = g_animationFunc.make[sprite](failedData);
				}
			});
		} else if (g_gameOverFlg) {
			g_animationData.forEach(sprite => {
				g_headerObj[`${sprite}ResultData`] = g_headerObj[`${sprite}FailedData`].concat();
				g_headerObj[`${sprite}ResultMaxDepth`] = g_headerObj[`${sprite}FailedMaxDepth`];
			});
		}
	}

	// diffListから適正Adjを算出（20個以下の場合は算出しない）
	const getSign = _val => (_val > 0 ? `+` : ``);
	const getDiffFrame = _val => `${getSign(_val)}${_val}${g_lblNameObj.frame}`;
	const diffLength = g_workObj.diffList.length;
	const bayesFunc = (_offset, _length) => {
		let result = 0;
		for (let j = _offset; j < _length; j++) {
			result += (_length - j) * (j + 1) * g_workObj.diffList[j];
		}
		return result;
	};
	const bayesExVal = 6 * bayesFunc(0, diffLength) / (diffLength * (diffLength + 1) * (diffLength + 2));
	const estimatedAdj = (diffLength <= 20 ? `` : Math.round((g_stateObj.adjustment / g_headerObj.playbackRate - bayesExVal) * 10) / 10);

	// 背景スプライトを作成
	createMultipleSprite(`backResultSprite`, g_headerObj.backResultMaxDepth);

	// タイトル文字描画
	divRoot.appendChild(getTitleDivLabel(`lblTitle`, g_lblNameObj.result, 0, 15, `settings_Title`));

	const playDataWindow = createEmptySprite(divRoot, `playDataWindow`, g_windowObj.playDataWindow, g_cssObj.result_PlayDataWindow);
	const resultWindow = createEmptySprite(divRoot, `resultWindow`, g_windowObj.resultWindow);

	const playingArrows = g_resultObj.ii + g_resultObj.shakin +
		g_resultObj.matari + g_resultObj.shobon + g_resultObj.uwan +
		g_resultObj.kita + g_resultObj.iknai;

	// スコア計算(一括)
	const scoreTmp = Object.keys(g_pointAllocation).reduce(
		(score, name) => score + g_resultObj[name] * g_pointAllocation[name], 0);

	const allScore = g_fullArrows * 10;
	const resultScore = Math.round(scoreTmp / allScore * g_maxScore) || 0;
	g_resultObj.score = resultScore;
	const allArrowsPlayed = playingArrows === g_fullArrows;

	// ランク計算
	let rankMark = g_rankObj.rankMarkX;
	let rankColor = g_rankObj.rankColorX;
	if (g_gameOverFlg) {
		rankMark = g_rankObj.rankMarkF;
		rankColor = g_rankObj.rankColorF;
		g_resultObj.spState = `failed`;
	} else if (allArrowsPlayed && g_stateObj.autoAll === C_FLG_OFF && !(g_headerObj.excessiveJdgUse && g_stateObj.excessive === C_FLG_OFF)) {
		if (g_resultObj.spState === ``) {
			g_resultObj.spState = `cleared`;
		}
		if (g_resultObj.spState === `perfect` || g_resultObj.spState === `allPerfect`) {
			rankMark = g_rankObj[`rankMark${toCapitalize(g_resultObj.spState)}`];
			rankColor = g_rankObj[`rankColor${toCapitalize(g_resultObj.spState)}`];
		} else {
			const rPos = g_rankObj.rankRate.findIndex(rate => resultScore * 100 / g_maxScore >= rate);
			rankMark = g_rankObj.rankMarks[rPos];
			rankColor = g_rankObj.rankColor[rPos];
		}
	}

	// 曲名・オプション描画
	const playbackView = (g_headerObj.playbackRate === 1 ? `` : ` [Rate:${g_headerObj.playbackRate}]`);
	const musicTitle = (g_headerObj.musicTitles[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.musicTitle) + playbackView;

	const mTitleForView = [g_headerObj.musicTitleForView[0], (g_headerObj.musicTitleForView[1] || ``) + playbackView];
	if (g_headerObj.musicTitlesForView[g_headerObj.musicNos[g_stateObj.scoreId]] !== undefined) {
		mTitleForView.forEach((mTitle, j) =>
			mTitleForView[j] = g_headerObj.musicTitlesForView[g_headerObj.musicNos[g_stateObj.scoreId]][j] + (j === 1 ? playbackView : ``));
	}

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const transKeyName = (hasVal(g_keyObj[`transKey${keyCtrlPtn}`]) ? `(${g_keyObj[`transKey${keyCtrlPtn}`]})` : ``);
	const orgShuffleFlg = g_keyObj[`shuffle${keyCtrlPtn}`].filter((shuffleGr, j) => shuffleGr !== g_keyObj[`shuffle${keyCtrlPtn}_0d`][j]).length === 0;
	const shuffleName = `${getStgDetailName(g_stateObj.shuffle)}${!orgShuffleFlg && !g_stateObj.shuffle.endsWith(`+`) ? getStgDetailName('(S)') : ''}`;

	/**
	 * プレイスタイルのカスタム有無
	 * @param {string} _flg 
	 * @param {string|boolean} _defaultSet デフォルト値
	 * @param {string} _displayText 
	 * @returns {string}
	 */
	const withOptions = (_flg, _defaultSet, _displayText = _flg) =>
		(_flg !== _defaultSet ? getStgDetailName(_displayText) : ``);

	// 譜面名の組み立て処理 (Ex: 9Akey / Normal-Leftless (maker) [X-Mirror])
	const keyUnitName = getStgDetailName(getKeyUnitName(g_keyObj.currentKey));
	const difDatas = [
		`${getKeyName(g_headerObj.keyLabels[g_stateObj.scoreId])}${transKeyName} ${keyUnitName} / ${g_headerObj.difLabels[g_stateObj.scoreId]}`,
		`${withOptions(g_autoPlaysBase.includes(g_stateObj.autoPlay), true, `-${getStgDetailName(g_stateObj.autoPlay)}${getStgDetailName('less')}`)}`,
		`${withOptions(g_headerObj.makerView, false, `(${g_headerObj.creatorNames[g_stateObj.scoreId]})`)}`,
		`${withOptions(g_stateObj.shuffle, C_FLG_OFF, `[${shuffleName}]`)}`
	];
	let difData = difDatas.filter(value => value !== ``).join(` `);
	const difDataForImage = difDatas.filter((value, j) => value !== `` && j !== 2).join(` `);

	// 設定の組み立て処理 (Ex: 4x, Brake, Reverse, Sudden+, NoRecovery)
	let playStyleData = [
		`${g_stateObj.speed}${g_lblNameObj.multi}`,
		withOptions(g_stateObj.motion, C_FLG_OFF),
		`${withOptions(g_stateObj.reverse, C_FLG_OFF,
			getStgDetailName(g_stateObj.scroll !== '---' ? 'R-' : 'Reverse'))}${withOptions(g_stateObj.scroll, '---')}`,
		withOptions(g_stateObj.appearance, `Visible`),
		withOptions(g_stateObj.gauge, g_settings.gauges[0]),
		withOptions(g_stateObj.playWindow, `Default`),
		withOptions(g_stateObj.stepArea, `Default`),
		withOptions(g_stateObj.frzReturn, C_FLG_OFF, `FR:${g_stateObj.frzReturn}`),
		withOptions(g_stateObj.shaking, C_FLG_OFF),
		withOptions(g_stateObj.effect, C_FLG_OFF),
		withOptions(g_stateObj.camoufrage, C_FLG_OFF, `Cmf:${g_stateObj.camoufrage}`),
		withOptions(g_stateObj.swapping, C_FLG_OFF, `Swap:${g_stateObj.swapping}`),
		withOptions(g_stateObj.judgRange, `Normal`, `Judg:${g_stateObj.judgRange}`),
	].filter(value => value !== ``).join(`, `);

	// Display設定の組み立て処理 (Ex: Step : FlatBar, Judge, Life : OFF)
	let displayData = [
		withOptions(g_stateObj.d_stepzone, C_FLG_ON, g_lblNameObj.rd_StepZone +
			`${g_stateObj.d_stepzone === C_FLG_OFF ? `` : ` : ${g_stateObj.d_stepzone}`}`),
		withOptions(g_stateObj.d_judgment, C_FLG_ON, g_lblNameObj.rd_Judgment),
		withOptions(g_stateObj.d_fastslow, C_FLG_ON, g_lblNameObj.rd_FastSlow),
		withOptions(g_stateObj.d_lifegauge, C_FLG_ON, g_lblNameObj.rd_LifeGauge),
		withOptions(g_stateObj.d_score, C_FLG_ON, g_lblNameObj.rd_Score),
		withOptions(g_stateObj.d_musicinfo, C_FLG_ON, g_lblNameObj.rd_MusicInfo),
		withOptions(g_stateObj.d_filterline, C_FLG_ON, g_lblNameObj.rd_FilterLine),
	].filter(value => value !== ``).join(`, `);
	if (displayData === ``) {
		displayData = `All Visible`;
	} else {
		if (!displayData.includes(`,`) && g_stateObj.d_stepzone !== C_FLG_OFF) {
		} else {
			displayData += ` : OFF`;
		}
	}

	let display2Data = [
		withOptions(g_stateObj.d_speed, C_FLG_ON, g_lblNameObj.rd_Speed),
		withOptions(g_stateObj.d_color, C_FLG_ON, g_lblNameObj.rd_Color),
		withOptions(g_stateObj.d_lyrics, C_FLG_ON, g_lblNameObj.rd_Lyrics),
		withOptions(g_stateObj.d_background, C_FLG_ON, g_lblNameObj.rd_Background),
		withOptions(g_stateObj.d_arroweffect, C_FLG_ON, g_lblNameObj.rd_ArrowEffect),
		withOptions(g_stateObj.d_special, C_FLG_ON, g_lblNameObj.rd_Special),
	].filter(value => value !== ``).join(`, `);
	if (display2Data !== ``) {
		display2Data += ` : OFF`;
	}

	const [lblRX, dataRX] = [20, 60];
	multiAppend(playDataWindow,
		makeCssResultPlayData(`lblMusic`, lblRX, g_cssObj.result_lbl, 0, g_lblNameObj.rt_Music, C_ALIGN_LEFT),
		makeCssResultPlayData(`lblMusicData`, dataRX, g_cssObj.result_style, 0, mTitleForView[0]),
		makeCssResultPlayData(`lblMusicData2`, dataRX, g_cssObj.result_style, 1, mTitleForView[1]),
		makeCssResultPlayData(`lblDifficulty`, lblRX, g_cssObj.result_lbl, 2, g_lblNameObj.rt_Difficulty, C_ALIGN_LEFT),
		makeCssResultPlayData(`lblDifData`, dataRX, g_cssObj.result_style, 2, difData),
		makeCssResultPlayData(`lblStyle`, lblRX, g_cssObj.result_lbl, 3, g_lblNameObj.rt_Style, C_ALIGN_LEFT),
		makeCssResultPlayData(`lblStyleData`, dataRX, g_cssObj.result_style, 3, playStyleData),
		makeCssResultPlayData(`lblDisplay`, lblRX, g_cssObj.result_lbl, 4, g_lblNameObj.rt_Display, C_ALIGN_LEFT),
		makeCssResultPlayData(`lblDisplayData`, dataRX, g_cssObj.result_style, 4, displayData),
		makeCssResultPlayData(`lblDisplay2Data`, dataRX, g_cssObj.result_style, 5, display2Data),
	);

	// 設定項目が多い場合に2行に分解して表示する処理
	let playStyleBreakNum = lblStyleData.textContent.length;
	if (lblStyleData.textContent.length > 60) {
		for (let j = Math.floor(lblStyleData.textContent.length / 2); j > 0; j--) {
			if (lblStyleData.textContent[j] === `,`) {
				playStyleBreakNum = j + 2;
				break;
			}
		}
		lblStyleData.style.top = `${parseFloat(lblStyleData.style.top) - 3}px`;
		lblStyleData.innerHTML = `${lblStyleData.textContent.slice(0, playStyleBreakNum)}<br>` +
			`${lblStyleData.textContent.slice(playStyleBreakNum)}`;
		lblStyleData.style.fontSize = `${getFontSize(lblStyleData.textContent.slice(0, playStyleBreakNum), 350, getBasicFont(), 10)}px`;
	} else {
		lblStyleData.style.fontSize = `${getFontSize(lblStyleData.textContent, 350, getBasicFont(), 14)}px`;
	}

	/**
	 * キャラクタ、スコア描画のID共通部、色CSS名、スコア変数名
	 * @property {number} pos 表示位置(縦)
	 * @property {string} id 表示用ラベルフッター
	 * @property {string} color CSS用ラベルフッター
	 * @property {string} label 表示名
	 * @property {string} dfColor 表示する文字のカラーコード (リザルト画像で使用)
	 */
	const jdgScoreObj = {
		ii: { pos: 0, id: `Ii`, color: `ii`, label: g_lblNameObj.j_ii, dfColor: `#66ffff`, },
		shakin: { pos: 1, id: `Shakin`, color: `shakin`, label: g_lblNameObj.j_shakin, dfColor: `#99ff99`, },
		matari: { pos: 2, id: `Matari`, color: `matari`, label: g_lblNameObj.j_matari, dfColor: `#ff9966`, },
		shobon: { pos: 3, id: `Shobon`, color: `shobon`, label: g_lblNameObj.j_shobon, dfColor: `#ccccff`, },
		uwan: { pos: 4, id: `Uwan`, color: `uwan`, label: g_lblNameObj.j_uwan, dfColor: `#ff9999`, },
		kita: { pos: 5, id: `Kita`, color: `kita`, label: g_lblNameObj.j_kita, dfColor: `#ffff99`, },
		iknai: { pos: 6, id: `Iknai`, color: `iknai`, label: g_lblNameObj.j_iknai, dfColor: `#99ff66`, },
		maxCombo: { pos: 7, id: `MCombo`, color: `combo`, label: g_lblNameObj.j_maxCombo, dfColor: `#ffffff`, },
		fmaxCombo: { pos: 8, id: `FCombo`, color: `combo`, label: g_lblNameObj.j_fmaxCombo, dfColor: `#ffffff`, },
		score: { pos: 10, id: `Score`, color: `score`, label: g_lblNameObj.j_score, dfColor: `#ffffff`, },
	};

	// キャラクタ、スコア描画
	Object.keys(jdgScoreObj).forEach(score =>
		multiAppend(resultWindow,
			makeCssResultSymbol(`lbl${jdgScoreObj[score].id}`, 0, g_cssObj[`common_${jdgScoreObj[score].color}`], jdgScoreObj[score].pos, jdgScoreObj[score].label),
			makeCssResultSymbol(`lbl${jdgScoreObj[score].id}S`, 50, g_cssObj.common_score, jdgScoreObj[score].pos, g_resultObj[score], C_ALIGN_RIGHT),
		));
	if (g_stateObj.autoAll === C_FLG_OFF) {
		const [lblPosX, dataPosX] = [350, 260];
		multiAppend(resultWindow,
			makeCssResultSymbol(`lblFast`, lblPosX, g_cssObj.common_diffFast, 0, g_lblNameObj.j_fast),
			makeCssResultSymbol(`lblSlow`, lblPosX, g_cssObj.common_diffSlow, 2, g_lblNameObj.j_slow),
			makeCssResultSymbol(`lblFastS`, dataPosX, g_cssObj.score, 1, g_resultObj.fast, C_ALIGN_RIGHT),
			makeCssResultSymbol(`lblSlowS`, dataPosX, g_cssObj.score, 3, g_resultObj.slow, C_ALIGN_RIGHT),
		);
		if (estimatedAdj !== ``) {
			multiAppend(resultWindow,
				makeCssResultSymbol(`lblAdj`, lblPosX, g_cssObj.common_estAdj, 4, g_lblNameObj.j_adj),
				makeCssResultSymbol(`lblAdjS`, dataPosX, g_cssObj.score, 5, `${getDiffFrame(estimatedAdj)}`, C_ALIGN_RIGHT),
			);
		}
		if (g_stateObj.excessive === C_FLG_ON) {
			multiAppend(resultWindow,
				makeCssResultSymbol(`lblExcessive`, lblPosX, g_cssObj.common_excessive, 6, g_lblNameObj.j_excessive),
				makeCssResultSymbol(`lblExcessiveS`, dataPosX, g_cssObj.score, 7, g_resultObj.excessive, C_ALIGN_RIGHT),
			);
		}
	}

	// ランク描画
	resultWindow.appendChild(
		createDivCss2Label(`lblRank`, rankMark, Object.assign(g_lblPosObj.lblRank, {
			color: rankColor, fontFamily: getBasicFont(`"Bookman Old Style"`),
		}))
	);

	// Cleared & Failed表示
	const lblResultPre = createDivCss2Label(
		`lblResultPre`,
		resultViewText(g_gameOverFlg ? `failed` : `cleared`),
		Object.assign(g_lblPosObj.lblResultPre, {
			animationDuration: (g_gameOverFlg ? `3s` : `2.5s`),
			animationName: (g_gameOverFlg ? `upToDownFade` : `leftToRightFade`)
		}), g_cssObj.result_Cleared, g_cssObj.result_Window
	);
	divRoot.appendChild(lblResultPre);

	divRoot.appendChild(createDivCss2Label(`lblResultPre2`,
		resultViewText(g_gameOverFlg ? `failed` : (allArrowsPlayed ? g_resultObj.spState : ``)),
		g_lblPosObj.lblResultPre2, g_cssObj.result_Cleared));

	// プレイデータは Cleared & Failed に合わせて表示
	playDataWindow.style.animationDuration = `3s`;
	playDataWindow.style.animationName = `slowlyAppearing`;

	if (g_finishFlg && g_headerObj.resultDelayFrame > 0) {
		lblResultPre.style.animationDelay = `${g_headerObj.resultDelayFrame / g_fps}s`;
		playDataWindow.style.animationDelay = `${g_headerObj.resultDelayFrame / g_fps}s`;
	}

	// ハイスコア差分計算
	const assistFlg = (g_autoPlaysBase.includes(g_stateObj.autoPlay) ? `` : `-${g_stateObj.autoPlay}less`);
	const mirrorName = (g_stateObj.shuffle.indexOf(`Mirror`) !== -1 ? `-${g_stateObj.shuffle}` : ``);
	let scoreName = `${g_headerObj.keyLabels[g_stateObj.scoreId]}${transKeyName}${getStgDetailName('k-')}${g_headerObj.difLabels[g_stateObj.scoreId]}${assistFlg}${mirrorName}`;
	if (g_headerObj.makerView) {
		scoreName += `-${g_headerObj.creatorNames[g_stateObj.scoreId]}`;
	}
	const highscoreDfObj = {
		ii: 0, shakin: 0, matari: 0, shobon: 0, uwan: 0,
		kita: 0, iknai: 0,
		maxCombo: 0, fmaxCombo: 0, score: 0,
	};

	const highscoreCondition = (g_stateObj.autoAll === C_FLG_OFF && g_headerObj.playbackRate === 1 &&
		(g_stateObj.shuffle === C_FLG_OFF || (mirrorName !== `` && orgShuffleFlg)));
	if (highscoreCondition) {

		// ハイスコア差分描画
		Object.keys(jdgScoreObj).filter(score => score !== `score`).forEach(score =>
			multiAppend(resultWindow,
				makeCssResultSymbol(`lbl${jdgScoreObj[score].id}L1`, C_RLT_BRACKET_L, g_cssObj.result_scoreHiBlanket, jdgScoreObj[score].pos, `(+`),
				makeCssResultSymbol(`lbl${jdgScoreObj[score].id}LS`, C_RLT_HIDIF_X, g_cssObj.result_scoreHi, jdgScoreObj[score].pos, 0, C_ALIGN_RIGHT),
				makeCssResultSymbol(`lbl${jdgScoreObj[score].id}L2`, C_RLT_BRACKET_R, g_cssObj.result_scoreHiBlanket, jdgScoreObj[score].pos, `)`),
			));

	} else {
		resultWindow.appendChild(makeCssResultSymbol(`lblAutoView`, 215, g_cssObj.result_noRecord, 4, `(No Record)`));
		const lblAutoView = document.getElementById(`lblAutoView`);
		lblAutoView.style.fontSize = wUnit(20);
	}

	// ユーザカスタムイベント(初期)
	const currentDateTime = new Date().toLocaleString();
	g_customJsObj.result.forEach(func => func());

	if (highscoreCondition) {

		Object.keys(jdgScoreObj).filter(judge => judge !== ``)
			.forEach(judge => highscoreDfObj[judge] = g_resultObj[judge] -
				(scoreName in g_localStorage.highscores ? g_localStorage.highscores[scoreName][judge] : 0));

		if (g_stateObj.dataSaveFlg) {

			const setScoreData = () => {
				g_localStorage.highscores[scoreName].dateTime = currentDateTime;
				g_localStorage.highscores[scoreName].rankMark = rankMark;
				g_localStorage.highscores[scoreName].rankColor = rankColor;
				g_localStorage.highscores[scoreName].playStyle = playStyleData;

				g_localStorage.highscores[scoreName].fast = g_resultObj.fast;
				g_localStorage.highscores[scoreName].slow = g_resultObj.slow;
				g_localStorage.highscores[scoreName].adj = estimatedAdj;
				g_localStorage.highscores[scoreName].excessive = g_stateObj.excessive === C_FLG_ON ?
					g_resultObj.excessive : `---`;

				if (g_presetObj.resultVals !== undefined) {
					Object.keys(g_presetObj.resultVals).forEach(key =>
						g_localStorage.highscores[scoreName][g_presetObj.resultVals[key]] = g_resultObj[g_presetObj.resultVals[key]]);
				}
			};

			// All Perfect時(かつスコアが同一時)はFast+Slowが最小のときに更新処理を行う
			if (rankMark === g_rankObj.rankMarkAllPerfect &&
				g_localStorage.highscores[scoreName]?.score === g_resultObj.score) {
				if (g_localStorage.highscores[scoreName].fast === undefined ||
					g_localStorage.highscores[scoreName].fast + g_localStorage.highscores[scoreName].slow >
					g_resultObj.fast + g_resultObj.slow) {
					setScoreData();
					g_localStorage.highscores[scoreName].score = g_resultObj.score;
				}
			}

			// ハイスコア更新時処理
			if (highscoreDfObj.score > 0) {
				if (g_localStorage.highscores[scoreName] === undefined) {
					g_localStorage.highscores[scoreName] = {};
				}
				Object.keys(jdgScoreObj).filter(judge => judge !== ``)
					.forEach(judge => g_localStorage.highscores[scoreName][judge] = g_resultObj[judge]);
				setScoreData();
			}

			// クリアランプ点灯処理
			if (![``, `failed`, `cleared`].includes(g_resultObj.spState)) {
				g_localStorage.highscores[scoreName][g_resultObj.spState] = true;
			}
			const isGameCompleted = !g_gameOverFlg && g_finishFlg;
			const hasValidAccuracy = g_workObj.requiredAccuracy !== `----`;
			if (isGameCompleted && hasValidAccuracy && allArrowsPlayed) {
				if (g_localStorage.highscores[scoreName].clearLamps === undefined) {
					g_localStorage.highscores[scoreName].clearLamps = [];
				}
				g_localStorage.highscores[scoreName].clearLamps =
					makeDedupliArray(g_localStorage.highscores[scoreName].clearLamps, [g_stateObj.gauge]);
			}
			localStorage.setItem(g_localStorageUrl, JSON.stringify(g_localStorage));
		}

		// ハイスコア差分値適用、ハイスコア部分作成
		Object.keys(jdgScoreObj).forEach(score => {
			const jdgScore = jdgScoreObj[score];
			if (score === `score`) {
				multiAppend(resultWindow,
					makeCssResultSymbol(`lbl${jdgScore.id}L1`, C_RLT_BRACKET_L, `${highscoreDfObj.score > 0 ? g_cssObj.result_scoreHiPlus : g_cssObj.result_scoreHiBlanket}`,
						jdgScore.pos, `(${highscoreDfObj[score] >= 0 ? "+" : "－"}`),
					makeCssResultSymbol(`lbl${jdgScore.id}LS`, C_RLT_HIDIF_X, `${highscoreDfObj.score > 0 ? g_cssObj.result_scoreHiPlus : g_cssObj.result_scoreHi}`,
						jdgScore.pos, Math.abs(highscoreDfObj[score]), C_ALIGN_RIGHT),
					makeCssResultSymbol(`lbl${jdgScore.id}L2`, C_RLT_BRACKET_R, `${highscoreDfObj.score > 0 ? g_cssObj.result_scoreHiPlus : g_cssObj.result_scoreHiBlanket}`,
						jdgScore.pos, `)`),
				);
			} else {
				document.getElementById(`lbl${jdgScore.id}L1`).textContent = `(${highscoreDfObj[score] >= 0 ? "+" : "－"}`;
				document.getElementById(`lbl${jdgScore.id}LS`).textContent = Math.abs(highscoreDfObj[score]);
			}
		});

	}

	// X (Twitter)用リザルト
	// スコアを上塗りする可能性があるため、カスタムイベント後に配置
	const hashTag = (hasVal(g_headerObj.hashTag) ? ` ${g_headerObj.hashTag}` : ``);
	const keyUnitAbbName = keyUnitName.slice(0, 1) || ``;
	let tweetDifData = `${getKeyName(g_headerObj.keyLabels[g_stateObj.scoreId])}${transKeyName}${getStgDetailName(keyUnitAbbName + '-')}${g_headerObj.difLabels[g_stateObj.scoreId]}${assistFlg}`;
	if (g_stateObj.shuffle !== `OFF`) {
		tweetDifData += `:${shuffleName}`;
	}
	const twiturl = new URL(g_localStorageUrl);
	twiturl.searchParams.append(`scoreId`, g_stateObj.scoreId);
	const baseTwitUrl = g_isLocal ? `` : `${twiturl.toString()}`.replace(/[\t\n]/g, ``);

	const tweetExcessive = (g_stateObj.excessive === C_FLG_ON) ? `(+${g_resultObj.excessive})` : ``;

	let tweetFrzJdg = ``;
	let tweetMaxCombo = `${g_resultObj.maxCombo}`;
	if (g_allFrz > 0) {
		tweetFrzJdg = `${g_resultObj.kita}-${g_resultObj.iknai}`;
		tweetMaxCombo += `-${g_resultObj.fmaxCombo}`;
	}

	const resultParams = {
		tuning: g_headerObj.tuning,
		highscore: g_resultObj,
		hashTag, musicTitle, tweetDifData, playStyleData, rankMark,
		tweetExcessive, tweetFrzJdg, tweetMaxCombo, baseTwitUrl
	};
	let tweetResultTmp = makeResultText(g_headerObj.resultFormat, resultParams);
	let resultCommonTmp = makeResultText(g_templateObj.resultFormatDf, resultParams);

	if (g_presetObj.resultVals !== undefined) {
		Object.keys(g_presetObj.resultVals).forEach(key =>
			tweetResultTmp = tweetResultTmp.split(`[${key}]`).join(g_resultObj[g_presetObj.resultVals[key]]));
	}
	const resultText = `${unEscapeHtml(tweetResultTmp)}`;
	const tweetResult = `${g_linkObj.x}?text=${encodeURIComponent(resultText)}`;

	/**
	 * リザルト画像をCanvasで作成しクリップボードへコピー
	 * @param {string} _msg 
	 */
	const copyResultImageData = _msg => {
		const tmpDiv = createEmptySprite(divRoot, `tmpDiv`, { x: 0, y: 0, w: g_sWidth, h: g_sHeight });
		tmpDiv.style.background = `#000000cc`;
		const canvas = document.createElement(`canvas`);
		const artistName = g_headerObj.artistNames[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.artistName;

		canvas.id = `resultImage`;
		canvas.width = 400;
		canvas.height = g_sHeight - 90;
		canvas.style.left = wUnit((g_sWidth - canvas.width) / 2);
		canvas.style.top = wUnit(20);
		canvas.style.position = `absolute`;

		const context = canvas.getContext(`2d`);
		const drawText = (_text, { x = 30, dy = 0, hy, siz = 15, color = `#cccccc`, align = C_ALIGN_LEFT, font } = {}) => {
			context.font = `${wUnit(siz)} ${getBasicFont(font)}`;
			context.fillStyle = color;
			context.textAlign = align;
			context.fillText(_text, x, 35 + hy * 18 + dy);
		};
		makeBgCanvas(context, { h: canvas.height });

		drawText(`R`, { dy: -5, hy: 0, siz: 40, color: `#9999ff` });
		drawText(`ESULT`, { x: 57, dy: -5, hy: 0, siz: 25 });
		drawText(`${g_lblNameObj.dancing}${g_lblNameObj.star}${g_lblNameObj.onigiri}`,
			{ x: 280, dy: -15, hy: 0, siz: 20, color: `#999999`, align: C_ALIGN_CENTER });
		drawText(unEscapeHtml(mTitleForView[0]), { hy: 1 });
		drawText(unEscapeHtml(mTitleForView[1]), { hy: 2 });
		drawText(`📝 ${unEscapeHtml(g_headerObj.tuning)} / 🎵 ${unEscapeHtml(artistName)}`, { hy: mTitleForView[1] !== `` ? 3 : 2, siz: 12 });
		drawText(unEscapeHtml(difDataForImage), { hy: 4 });

		if (playStyleData.length > 60) {
			drawText(playStyleData.slice(0, playStyleBreakNum), { hy: 5, siz: getFontSize(playStyleData.slice(0, playStyleBreakNum), 370, getBasicFont(), 14) });
			drawText(playStyleData.slice(playStyleBreakNum), { hy: 6, siz: getFontSize(playStyleData.slice(playStyleBreakNum), 370, getBasicFont(), 14) });
		} else {
			drawText(playStyleData, { hy: 5, siz: getFontSize(lblStyleData.textContent, 370, getBasicFont(), 15) });
		}
		Object.keys(jdgScoreObj).forEach(score => {
			drawText(g_lblNameObj[`j_${score}`], { hy: 7 + jdgScoreObj[score].pos, color: jdgScoreObj[score].dfColor });
			drawText(g_resultObj[score], { x: 200, hy: 7 + jdgScoreObj[score].pos, align: C_ALIGN_RIGHT });
		});

		if (highscoreCondition) {
			drawText(`(${highscoreDfObj.score >= 0 ? '+' : '-'} ${Math.abs(highscoreDfObj.score)})`,
				{ x: 206, hy: 18, color: highscoreDfObj.score > 0 ? `#ffff99` : `#cccccc`, align: C_ALIGN_RIGHT });
		}

		if (g_stateObj.autoAll === C_FLG_OFF) {
			drawText(g_lblNameObj.j_fast, { x: 240, hy: 7, color: `#ff9966` });
			drawText(g_resultObj.fast, { x: 360, hy: 7, align: C_ALIGN_RIGHT });
			drawText(g_lblNameObj.j_slow, { x: 240, hy: 8, color: `#ccccff` });
			drawText(g_resultObj.slow, { x: 360, hy: 8, align: C_ALIGN_RIGHT });
			if (estimatedAdj !== ``) {
				drawText(g_lblNameObj.j_adj, { x: 240, hy: 9, color: `#99ff99` });
				drawText(getDiffFrame(estimatedAdj), { x: 360, hy: 9, align: C_ALIGN_RIGHT });
			}
			if (g_stateObj.excessive === C_FLG_ON) {
				drawText(g_lblNameObj.j_excessive, { x: 240, hy: 10, color: `#ffff99` });
				drawText(g_resultObj.excessive, { x: 360, hy: 10, align: C_ALIGN_RIGHT });
			}
			g_headerObj.resultValsView
				.filter(key => hasVal(g_resultObj[g_presetObj.resultVals[key]]))
				.forEach((key, j) => {
					drawText(g_presetObj.resultVals[key], { x: 240, hy: j + 12, color: `#ffffff` });
					drawText(g_resultObj[g_presetObj.resultVals[key]], { x: 360, hy: j + 12, align: C_ALIGN_RIGHT });
				});
		}
		drawText(rankMark, { x: 240, hy: 18, siz: 50, color: rankColor, font: `"Bookman Old Style"` });
		drawText(baseTwitUrl, { hy: 19, siz: 8 });
		drawText(currentDateTime, { hy: 20 });

		tmpDiv.appendChild(canvas);

		const viewResultImage = () => {
			if (document.getElementById(`tmpClose`) === null) {
				divRoot.oncontextmenu = () => true;
				makeLinkButton(tmpDiv, `Tmp`);
				tmpDiv.appendChild(createCss2Button(`tmpClose`, g_lblNameObj.b_close, () => true,
					Object.assign(g_lblPosObj.btnRsCopyClose, {
						resetFunc: () => {
							tmpDiv.removeChild(canvas);
							divRoot.removeChild(tmpDiv);
							divRoot.oncontextmenu = () => false;
						},
					}), g_cssObj.button_Back));
				tmpDiv.appendChild(createDescDiv(`resultImageDesc`, g_lblNameObj.resultImageDesc));
			}
		};

		try {
			if (ClipboardItem === undefined) {
				throw new Error(`error`);
			}
			if (keyIsShift()) {
				viewResultImage();
			} else {
				// Canvas の内容を PNG 画像として取得
				canvas.toBlob(async blob => {
					await navigator.clipboard.write([
						new ClipboardItem({
							'image/png': blob
						})
					]);
				});
				tmpDiv.removeChild(canvas);
				divRoot.removeChild(tmpDiv);
				makeInfoWindow(_msg, `leftToRightFade`);
			}

		} catch (err) {
			// 画像をクリップボードへコピーできないときは代替で画像保存可能な画面を表示
			viewResultImage();
		}
	};

	/**
	 * 音源、ループ処理の停止
	 * @param {string} _id 
	 * @param {string} _name 
	 * @param {object} _posObj 
	 * @param {function} _func 
	 * @param {...any} _cssClass 
	 * @returns {HTMLDivElement}
	 */
	const resetCommonBtn = (_id, _name, _posObj, _func, _cssClass) =>
		createCss2Button(_id, _name, () => {
			if (g_finishFlg) {
				g_audio.pause();
			}
			clearTimeout(g_timeoutEvtId);
			clearTimeout(g_timeoutEvtResultId);
		}, Object.assign(_posObj, { resetFunc: _func }), _cssClass);

	/**
	 * 外部リンクボタンを作成
	 * @param {object} _div 
	 * @param {string} _param 
	 */
	const makeLinkButton = (_div = divRoot, _param = ``) => {
		multiAppend(_div,
			// リザルトデータをX (Twitter)へ転送
			createCss2Button(`btnTweet${_param}`, g_lblNameObj.b_tweet, () => true, Object.assign(g_lblPosObj.btnRsTweet, {
				resetFunc: () => openLink(tweetResult),
			}), g_cssObj.button_Tweet),

			// Discordへのリンク
			createCss2Button(`btnGitter${_param}`, g_lblNameObj.b_gitter, () => true, Object.assign(g_lblPosObj.btnRsGitter, {
				resetFunc: () => openLink(g_linkObj.discord),
			}), g_cssObj.button_Discord),
		);
	}

	// ボタン描画
	multiAppend(divRoot,

		// タイトル画面へ戻る
		resetCommonBtn(`btnBack`, g_lblNameObj.b_back, g_lblPosObj.btnRsBack, titleInit, g_cssObj.button_Back),

		// リザルトデータをクリップボードへコピー
		createCss2Button(`btnCopy`, g_lblNameObj.b_copy, () =>
			copyTextToClipboard(keyIsShift() ?
				unEscapeHtml(resultCommonTmp) : resultText, g_msgInfoObj.I_0001),
			g_lblPosObj.btnRsCopy, g_cssObj.button_Setting),
	);
	makeLinkButton();
	multiAppend(divRoot,
		// リトライ
		resetCommonBtn(`btnRetry`, g_lblNameObj.b_retry, g_lblPosObj.btnRsRetry, loadMusic, g_cssObj.button_Reset),

		createCss2Button(`btnCopyImage`, `📷`, () => true,
			Object.assign(g_lblPosObj.btnRsCopyImage, {
				resetFunc: () => copyResultImageData(g_msgInfoObj.I_0001),
			}), g_cssObj.button_Default_NoColor),
	);

	// マスクスプライトを作成
	const maskResultSprite = createMultipleSprite(`maskResultSprite`, g_headerObj.maskResultMaxDepth);
	if (!g_headerObj.maskresultButton) {
		maskResultSprite.style.pointerEvents = C_DIS_NONE;
	}

	// リザルトモーションの0フレーム対応
	g_animationData.filter(sprite => g_scoreObj[`${sprite}ResultFrameNum`] === 0 && g_headerObj[`${sprite}ResultData`][0] !== undefined)
		.forEach(sprite => {
			g_scoreObj[`${sprite}ResultFrameNum`] = g_animationFunc.draw[sprite](0, `result`, sprite);
			g_headerObj[`${sprite}ResultData`][0] = undefined;
		});

	/**
	 * タイトルのモーション設定
	 */
	const flowResultTimeline = () => {

		// ユーザカスタムイベント(フレーム毎)
		g_customJsObj.resultEnterFrame.forEach(func => func());

		// 背景・マスクモーション、スキン変更
		drawTitleResultMotion(g_currentPage);

		// リザルト画面移行後のフェードアウト処理
		if (g_scoreObj.fadeOutFrame >= g_scoreObj.frameNum) {
			if (g_scoreObj.frameNum >= g_scoreObj.fullFrame) {
				clearTimeout(g_timeoutEvtId);
			}
			g_scoreObj.frameNum++;
		} else {
			const tmpVolume = (g_audio.volume - (3 * g_stateObj.volume / 100 * C_FRM_AFTERFADE / g_scoreObj.fadeOutTerm) / 1000);
			if (tmpVolume < 0) {
				g_audio.volume = 0;
				clearTimeout(g_timeoutEvtId);
			} else {
				g_audio.volume = tmpVolume;
			}
		}

		thisTime = performance.now();
		buffTime = thisTime - resultStartTime - g_scoreObj.resultFrameNum * 1000 / g_fps;

		g_scoreObj.resultFrameNum++;
		g_animationData.forEach(sprite => g_scoreObj[`${sprite}ResultFrameNum`]++);
		g_timeoutEvtResultId = setTimeout(flowResultTimeline, 1000 / g_fps - buffTime);
	};
	flowResultTimeline();

	// キー操作イベント（デフォルト）
	setShortcutEvent(g_currentPage, () => true, { dfEvtFlg: true });
	document.oncontextmenu = () => true;

	g_skinJsObj.result.forEach(func => func());
};

/**
 * リザルトフォーマットの整形処理
 * @param {string} _format 
 * @param {object} object フォーマット置き換え変数群
 * @param {string} object.hashTag ハッシュタグ
 * @param {string} object.musicTitle 曲名
 * @param {string} object.tweetDifData 譜面名
 * @param {string} object.tuning 製作者名
 * @param {string} object.rankMark ランク
 * @param {string} object.playStyleData プレイ設定
 * @param {object} object.highscore ハイスコア（判定別）
 * @param {string} object.tweetExcessive 空押し判定状況
 * @param {string} object.tweetFrzJdg フリーズアロー判定状況
 * @param {string} object.tweetMaxCombo コンボ数状況
 * @param {string} object.baseTwitUrl X投稿用URL
 * @returns {string}
 */
const makeResultText = (_format, {
	hashTag, musicTitle, tweetDifData, tuning, rankMark, playStyleData,
	highscore, tweetExcessive, tweetFrzJdg, tweetMaxCombo, baseTwitUrl } = {}) =>
	replaceStr(_format, [
		[`[hashTag]`, hashTag],
		[`[musicTitle]`, musicTitle],
		[`[keyLabel]`, tweetDifData],
		[`[maker]`, tuning],
		[`[rank]`, rankMark],
		[`[score]`, highscore?.score],
		[`[playStyle]`, playStyleData],
		[`[arrowJdg]`, `${highscore?.ii}-${highscore?.shakin}-${highscore?.matari}-${highscore?.shobon}-${highscore?.uwan}${tweetExcessive}`],
		[`[frzJdg]`, tweetFrzJdg],
		[`[maxCombo]`, tweetMaxCombo],
		[`[url]`, baseTwitUrl]
	]);

/**
 * 結果表示作成（曲名、オプション）
 * @param {string} _id 
 * @param {number} _x
 * @param {string} _class 
 * @param {number} _heightPos 
 * @param {string} _text
 * @param {string} _align
 * @param {number} [object.w=400]
 * @param {number} [object.siz=g_limitObj.mainSiz]
 * @returns {HTMLDivElement}
 */
const makeCssResultPlayData = (_id, _x, _class, _heightPos, _text, _align = C_ALIGN_CENTER, { w = 400, siz = g_limitObj.mainSiz } = {}) =>
	createDivCss2Label(_id, _text, {
		x: _x, y: g_limitObj.setMiniSiz * _heightPos, w, h: g_limitObj.setMiniSiz, siz, align: _align,
	}, _class);

/**
 * 結果表示作成（キャラクタ）
 * @param {string} _id 
 * @param {number} _x
 * @param {string} _class
 * @param {number} _heightPos 
 * @param {string} _text
 * @param {string} _align
 * @returns {HTMLDivElement}
 */
const makeCssResultSymbol = (_id, _x, _class, _heightPos, _text, _align = C_ALIGN_LEFT) =>
	makeCssResultPlayData(_id, _x, _class, _heightPos, _text, _align, { w: 150, siz: g_limitObj.jdgCntsSiz });

// ライセンス原文、以下は削除しないでください
/*-----------------------------------------------------------*/
/*

MIT License

Copyright (c) 2018 tickle

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

 */
/*-----------------------------------------------------------*/