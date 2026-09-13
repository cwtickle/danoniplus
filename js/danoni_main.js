'use strict';
/**
 * Dancing☆Onigiri (CW Edition)
 * 
 * Source by tickle
 * Created : 2018/10/08
 * Revised : 2026/09/12
 *
 * https://github.com/cwtickle/danoniplus
 */
const g_version = `Ver 50.4.0`;
const g_revisedDate = `2026/09/12`;

// カスタム用バージョン (danoni_custom.js 等で指定可)
let g_localVersion = ``;
let g_localVersion2 = ``;

// ショートカット用文字列(↓の文字列を検索することで対象箇所へジャンプできます)
//  共通:water 初期化:peach タイトル:melon データ管理:pear 前提条件表示:mango 設定:lime ディスプレイ:lemon 拡張設定:apple キーコンフィグ:orange 譜面読込:strawberry メイン:banana 結果:grape
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

/**
 * 現在URLのクエリパラメータから指定した値を取得
 * @param {string} _name
 * @returns {string}
 */
const getQueryParamVal = _name => {
	const param = new URL(location.href).searchParams.get(_name);
	return param !== null ? decodeURIComponent(param.replace(/\+/g, ` `)) : null;
};

// 常時デバッグを許可するドメイン
const g_reservedDomains = [
	`danonicw.skr.jp`,
	`tickle.cloudfree.jp`,
];
Object.freeze(g_reservedDomains);

// 外部参照を許可するドメイン
const g_referenceDomains = [
	`cwtickle.github.io/danoniplus`,
	`cdn.jsdelivr.net`,
	`unpkg.com`,
	`www.unpkg.com`,
	`support-v\\d+--danoniplus.netlify.app`,
];
Object.freeze(g_referenceDomains);

// ドメイン管理リスト
const g_domainList = [
	{ label: `jsdelivr`, hosts: [`cdn.jsdelivr.net`] },
	{ label: `unpkg`, hosts: [`unpkg.com`, `www.unpkg.com`] },
];
Object.freeze(g_domainList);

const g_rootPath = current().match(/(^.*\/)/)[0];
let g_workPath;
const hasRemoteDomain = _path => g_referenceDomains.some(domain => _path.match(`^https://${domain}/`) !== null);
const detectDomain = _url => {
	try {
		const host = new URL(_url).hostname; // 例: "cdn.jsdelivr.net"
		return g_domainList.find(({ hosts }) => hosts.some(h => host === h || host.endsWith(`.${h}`)))?.label ?? null;
	} catch {
		return null;
	}
}
const g_remoteFlg = hasRemoteDomain(g_rootPath);
const g_remoteDomain = detectDomain(g_rootPath);

const g_randTime = Date.now();
const g_versionForUrl = g_version.slice(4);    // URL用に先頭の"Ver "を削除
const g_dpr = window.devicePixelRatio || 1;

const g_isFile = location.href.match(/^file/);
const g_isLocal = location.href.match(/^file/) || location.href.indexOf(`localhost`) !== -1;
const g_isDebug = g_isLocal ||
	g_reservedDomains.some(domain => location.href.match(`^https://${domain}/`) !== null) ||
	getQueryParamVal(`debug`) === `true`;
const isLocalMusicFile = _scoreId => g_isFile && !listMatching(getMusicUrl(_scoreId), [`.js`, `.txt`], { suffix: `$` });

// 50msごとにdocument.readyStateをチェックしてcompleteになったらresolve
const waitUntilLoaded = () => {
	return new Promise(resolve => {
		const checkReadyState = setInterval(() => {
			if (document.readyState === 'complete') {
				clearInterval(checkReadyState);
				resolve();
			}
		}, 50);
	});
};
(async () => {
	await waitUntilLoaded();
	g_loadObj.main = true;
	g_currentPage = `initial`;
	const links = document.querySelectorAll(`link`);
	if (Array.from(links).filter(elem => elem.getAttribute(`href`).indexOf(`danoni_main.css`) !== -1).length === 0) {
		await importCssFile2(`${g_rootPath}../css/danoni_main.css?${g_versionForUrl}`);
	}

	// ロード直後に定数・初期化ファイル、旧バージョン定義関数を読込
	// 旧バージョン定義関数はメジャーバージョンが変わった場合にのみ再ロードが掛かるようにする
	await loadScript2(`${g_rootPath}../js/lib/danoni_localbinary.js`, false);
	await loadScript2(`${g_rootPath}../js/lib/dosConverter.js?${g_versionForUrl}`);
	await loadScript2(`${g_rootPath}../js/lib/title.js?${g_versionForUrl}`);
	await loadScript2(`${g_rootPath}../js/lib/settings.js?${g_versionForUrl}`);
	await loadScript2(`${g_rootPath}../js/lib/keyconfig.js?${g_versionForUrl}`);
	await loadScript2(`${g_rootPath}../js/lib/dataLoader.js?${g_versionForUrl}`);
	await loadScript2(`${g_rootPath}../js/lib/mainWindow.js?${g_versionForUrl}`);
	await loadScript2(`${g_rootPath}../js/lib/result.js?${g_versionForUrl}`);
	await loadScript2(`${g_rootPath}../js/lib/danoni_constants.js?${g_versionForUrl}`);
	await loadScript2(`${g_rootPath}../js/lib/legacy_functions.js?${g_versionForUrl.split(`.`)[0]}`, false);
	initialControl();

	// プレイ画面(g_currentPage === `main`)でのみ有効化される、タブ非表示検知(常時1個だけ登録)
	g_handler.addListener(document, `visibilitychange`, () => {
		if (g_currentPage !== `main`) return;
		document.hidden ? g_timelineHooks.pause() : g_timelineHooks.resume();
	});
})();

/*-----------------------------------------------------------*/
/* Scene : COMMON [water] */
/*-----------------------------------------------------------*/

// fps(デフォルトは60)
let g_fps = 60;

// プレイ画面再生時の内部スケジューリング用のマージン時間(100ms)
let g_scheduleLead = 0.1;

// フレーム進行を音源クロック(AudioContext.currentTime)基準で補正するか
// - false の場合は従来通り performance.now() 基準で動作
let g_audioClockSync = true;

// 出力遅延(AudioContext.outputLatency)をタイミング補正に含めるか
// - true にすると出力デバイス(有線/Bluetooth等)によらず同じAdjustmentが使えるが、
//   既存のAdjustment設定値と互換性がなくなるため既定は false
let g_audioLatencyCompensation = false;

// 次フレームまでの待機時間の上限(ms)
// - 音源クロックが一時的に停止した際に待ち続けないようにするための保険
let g_maxFrameWait = 50;

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
const C_FLG_HYPHEN = `---`;
const C_FLG_ALL = `ALL`;
const C_FLG_REVERSE = `Reverse`;
const C_FLG_REVERSE2 = `Rev`;
const C_DIS_NONE = `none`;
const C_DIS_AUTO = `auto`;
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

// 音源のAudioContext管理、リトライ中フラグ
let g_sharedAudioContext = null;
let g_retryInProgress = false;

/** 共通オブジェクト */
const g_loadObj = {};
const g_rootObj = {};
const g_presetObj = {
	keysDataLib: [],
	keysDataLocal: [],
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
	miniMapParams: {},
	scoreMinimap: {},
	scoreMinimapReverse: {},
	scoreMinimapHeader: {},
};

const g_workObj = {
	stepX: [],
	stepRtn: [],
	stepHitRtn: [],
	arrowRtn: [],
	frzArrowInitRtn: [],
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
let g_audioForMS = null;
let g_timeoutEvtId = 0;
let g_timeoutEvtTitleId = 0;
let g_timeoutEvtResultId = 0;

// タブのバックグラウンド化に伴う一時停止/再開のフック
let g_timelineHooks = { pause: () => { }, resume: () => { } };
let g_timelineSessionId = 0; // mainInit()呼び出しごとに採番。古いセッションのfinishResume無効化に使用

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
let g_localStorageUrlOrg;
let g_localStorageMgt;

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
 * @returns {number|boolean|string}
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
 * ストレージ処理のパース
 * @param {string} _keyName 
 * @param {Object} _default 
 * @returns {Object}
 */
const parseStorageData = (_keyName, _default = {}) => {
	const storageText = localStorage.getItem(_keyName);
	if (storageText === null) {
		return _default;
	}
	try {
		return JSON.parse(storageText);
	} catch (err) {
		return _default;
	}
}

/**
 * オブジェクトをキー名でソート
 * @param {Object} _obj 
 * @returns {Object}
 */
const sortObjectByKeys = _obj => Object.keys(_obj).sort().reduce((acc, key) => {
	acc[key] = _obj[key];
	return acc;
}, {});

/**
 * 画面表示用インデント処理
 * @param {number} _level 
 * @returns {string}
 */
const getIndent = (_level) => '&nbsp;'.repeat(_level * 4);

/**
 * ストレージ情報の取得
 * @param {string} _name g_storageFuncの実行キー名
 * @param {string} _key g_storageFuncの実行キーの引数
 * @param {boolean} [_colorFmt=true]
 * @returns {string}
 */
const viewKeyStorage = (_name, _key = ``, _colorFmt = true) => {

	// キャッシュ設定
	if (!viewKeyStorage.cache) {
		viewKeyStorage.cache = new Map();
	}
	const cacheKey = _key + _name + String(_colorFmt);
	if (viewKeyStorage.cache.has(cacheKey)) {
		return viewKeyStorage.cache.get(cacheKey);
	}
	const result = formatObject(g_storageFunc.get(_name)?.(_key) || setVal(_name, ``, C_TYP_CALC), 0, { colorFmt: _colorFmt });
	viewKeyStorage.cache.set(cacheKey, result);
	return result;
}

/**
 * オブジェクトのネスト表示処理
 * @param {Object} _obj 
 * @param {Number} _indent 
 * @param {boolean} [colorFmt=true] フォーマット加工フラグ
 * @param {string} [rootKey=''] オブジェクトの最上位プロパティ名
 * @returns {string}
 */
const formatObject = (_obj, _indent = 0, { colorFmt = true, rootKey = `` } = {}) => {
	const isObj = _obj => typeof _obj === C_TYP_OBJECT && _obj !== null;
	if (!isObj(_obj)) {
		return JSON.stringify(_obj);
	}
	const baseIndent = getIndent(_indent);
	const nestedIndent = getIndent(_indent + 1);

	/**
	 * データの装飾処理
	 * @param {string|boolean|number|Object} _value 
	 * @param {string} _rootKey
	 * @returns {string}
	 */
	const formatValue = (_value, _rootKey) => {
		if (colorFmt) {
			if (typeof _value === C_TYP_STRING) {

				// カラーコードの色付け処理
				_value = escapeHtml(_value).replaceAll(`\n`, `<br>`);
				const colorCodePattern = /(#|0x)(?:[A-Fa-f0-9]{6}(?:[A-Fa-f0-9]{2})?|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{3})/g;
				if (_value === C_FLG_ON) {
					return `<span style="color:#66ff66">${g_emojiObj.checkMark} ON</span>`;
				} else if (colorCodePattern.test(_value)) {
					return _value.replace(colorCodePattern, (match) =>
						`<span style="color:${match.replace(`0x`, `#`)}">◆</span>${match.replace(`0x`, `#`)}`);
				}
			} else if (typeof _value === C_TYP_BOOLEAN) {

				// boolean値の色付け処理
				return (_value ? `<span style="color:#66ff66">${g_emojiObj.checkMark} true</span>` :
					`<span style="color:#ff9999">${g_emojiObj.crossMark} false</span>`);

			} else if (typeof _value === C_TYP_NUMBER) {

				if (_rootKey.startsWith(`scrollDir`)) {
					// scrollDirXのスクロール方向表示処理
					return _value === 1 ? `1|<span style="color:#ff9999">↑</span>` : `-1|<span style="color:#66ff66">↓</span>`;

				} else if (listMatching(_rootKey, [`keyCtrl`, `keyRetry`, `keyTitleBack`, `keyPause`], { prefix: `^` })
					&& !_rootKey.startsWith(`keyCtrlPtn`)) {
					// keyCtrlX, keyRetryX, keyTitleBackX, keyPauseX の対応キー表示処理
					return (g_kCd[_value] && _value !== 0) ? `${_value}|<span style="color:#ffff66">${g_kCd[_value]}</span>` : `----`;
				}
			} else if (isObj(_value)) {
				return formatObject(_value, _indent + 1, { colorFmt, rootKey: _rootKey });
			}
		}
		return JSON.stringify(_value);
	};

	/**
	 * 配列の装飾処理
	 * @param {number[]|string[]} _obj 
	 * @returns {string}
	 */
	const formatArrayValue = (_obj) => {

		const formatSetArray = (_list, _numOfSet = 2) => {
			if (_list.findIndex(val => val === rootKey) >= 0) {
				let result = `[`;
				for (let j = 0; j < _obj.length; j += _numOfSet) {
					result += `<br>${nestedIndent}${_obj[j]}: ${_obj[j + 1]}`;
					for (let k = 0; k < _numOfSet - 2; k++) {
						const idx = j + k + 2;
						if (idx < _obj.length) {
							result += `, ${formatValue(_obj[idx], rootKey)}`;
						}
					}
				}
				result += (_obj.length === 0 ? `` : `<br>${baseIndent}`) + `]`;
				return result;
			}
			return ``;
		};
		if (colorFmt) {
			if (typeof _obj[0] === C_TYP_NUMBER) {
				let result;
				Object.keys(g_dataSetObj).forEach(key =>
					result ||= formatSetArray(g_dataSetObj[key], Number(key)));
				if (result !== ``) {
					return result;
				}
			}
			if (_obj.length > 100) {
				const filteredArray = _obj.reduce((result, value, index) => {
					if (hasVal(value)) {
						result.push(`${index}: ${formatValue(value, rootKey)}`);
					}
					return result;
				}, []);
				return `[<br>${nestedIndent}${filteredArray.join(`,<br>${nestedIndent}`)}<br>${baseIndent}]`;
			}
		}
		return ``;
	};

	/**
	 * 配列・オブジェクトのネスト整形処理
	 * @returns {string}
	 */
	const formatCollection = () => {
		const isArray = Array.isArray(_obj);
		const isArrayOfArrays = isArray && _obj.every(item => Array.isArray(item));
		const getNextObject = (_item, _rootKey) => isObj(_item)
			? formatObject(_item, _indent + 1, { colorFmt, rootKey: _rootKey })
			: formatValue(_item, _rootKey);

		if (isArray) {
			let result = formatArrayValue(_obj);
			if (result !== ``) {
				return result;
			}
		}

		// 配列またはオブジェクトの各要素をフォーマット
		const formattedEntries = (isArray
			? _obj.map(item => {
				const formattedValue = isArrayOfArrays
					? `<br>${nestedIndent}${formatValue(item, rootKey)}`
					: getNextObject(item, rootKey);
				return formattedValue;
			})
			: Object.entries(_obj).map(([key, value]) => {
				const formattedValue = getNextObject(value, rootKey === `` ? key : rootKey);
				return `<br>${nestedIndent}"${key}": ${formattedValue}`;
			})).filter(val => !hasVal(val) || val !== `----`);

		// 配列なら[]で囲む、オブジェクトなら{}で囲む
		if (isArray) {
			return _obj.length === 0
				? '[]'
				: `[${formattedEntries.join(', ')}${isArrayOfArrays ? `<br>${baseIndent}` : ''}]`;
		} else {
			return `{${formattedEntries.join(',')}<br>${baseIndent}}`;
		}
	};

	let result = formatCollection();
	if (!colorFmt) {
		result = result.replaceAll(`<br>`, `\r\n`).replaceAll(`&nbsp;`, ` `);
	}
	return result;
}

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
 * ベース配列(_baseArray)の空要素のみ、別配列(_array)の対応要素で補完する（既存値は上書きしない）
 * @param {string[]|number[]} _array     補完元（ソース）
 * @param {string[]|number[]} _baseArray ベース（既存値を優先）
 * @returns {string[]|number[]}
 */
const fillMissingArrayElem = (_array = [], _baseArray = []) => {
	const maxLen = Math.max(_baseArray.length, _array.length);
	const res = _baseArray.slice();
	for (let j = 0; j < maxLen; j++) {
		if (!hasVal(res[j]) && hasVal(_array[j])) res[j] = _array[j];
	}
	return res;
}

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
 * URLのパスを検証し、絶対URLまたは相対パスであればその値を返す
 * @param {string} _input 
 * @param {string} _defaultUrl 
 * @returns {string}
 */
const validatePath = (_input, _defaultUrl = ``) => {
	// 絶対 URL（http, https, ftp, fileなど）
	const absoluteUrlPattern = /^(https?:\/\/|ftp:\/\/|file:\/\/)/;

	// 相対パス（ルート相対 `/path/to/file` もしくは `./file`, `../file` ）
	const relativePathPattern = /^\/|^\.{1,2}\//;

	const raw = _input && (absoluteUrlPattern.test(_input) || relativePathPattern.test(_input))
		? encodeURI(_input) : _defaultUrl;

	// URL または相対パスが合致すればその値を返し、そうでなければデフォルト URL を返す
	return raw.endsWith(`/`) ? raw : raw + `/`;
};

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
 * @param {Function} _func
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
				x, y, w, siz, fontWeight: `bold`, opacity: 0.75,
			})
		);
	}
};

/**
 * 各画面の汎用ショートカットキー表示
 * @param {string} _displayName 
 */
const createScTextCommon = _displayName => {
	if (g_btnPatterns[_displayName]) {
		Object.keys(g_btnPatterns[_displayName]).filter(target => document.getElementById(`btn${target}`) !== null)
			.forEach(target =>
				createScText(document.getElementById(`btn${target}`), target, {
					displayName: _displayName, targetLabel: `btn${target}`,
					dfLabel: g_lblNameObj[`sc_${_displayName}${target}`] ?? ``,
					x: g_btnPatterns[_displayName][target],
				}));
	}
};

/**
 * ショートカットキー有効化
 * @param {string} _displayName
 * @param {Function} _func 
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
	if (!g_btnWaitFrame[_displayName] ||
		g_btnWaitFrame[_displayName].s_frame === 0 ||
		(g_initialFlg && g_btnWaitFrame[_displayName].initial)) {
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

		// ファイルが属するドメインがリモートの場合は、キャッシュが使えるようにする
		const urlCacheName = listMatching(filePart[1], g_referenceDomains)
			? g_versionForUrl : g_randTime;
		const filePath = `${filePart[1]}${filePart[0]}?${urlCacheName}`;
		if (filePart[0].endsWith(`.css`)) {
			_loadType = `css`;
		}

		// jsファイル、cssファイルにより呼び出す関数を切替
		if (_loadType === `js`) {
			await loadScript2(filePath, false);
		} else if (_loadType === `css`) {
			const cssPath = filePath.split(`.js?`).join(`.css?`);
			await importCssFile2(cssPath);
		}
	}));
};

/**
 * ユーザー定義のカスタム関数配列を安全に実行する共通関数
 * @param {string} _hookName - 識別名
 * @param {Function[]} _funcArray - カスタム関数の配列
 * @param {...any} args - 関数に渡したい引数（可変長）
 */
const safeExecuteCustomHooks = (_hookName, _funcArray, ...args) => {
	if (!Array.isArray(_funcArray)) return true;
	const errorCache = g_errorCache[_hookName];

	for (const [index, func] of _funcArray.entries()) {
		if (typeof func !== C_TYP_FUNCTION) continue;      // 関数以外が入っていた場合の自衛
		if (errorCache && errorCache[index]?.has(func)) continue;  // エラー検知済みの場合は以後スキップ

		try {
			// ...args で受け取った引数をそのまま横流しして実行
			func(...args);
		} catch (e) {

			if (!errorCache) {
				// ループしない場合のエラー処理
				console.group(`${unEscapeEmoji(g_emojiObj.crossMark)} Custom Function Error: [${_hookName}] (Index: ${index}${func.name ? `, Func: ${func.name}` : ``})`);
				console.error(e);
				console.groupEnd();
				makeInfoWindow(g_msgInfoObj.W_0051, `leftToRightFade`);

			} else if (errorCache && !errorCache[index]?.has(func)) {
				// ループがある場合のエラー処理（初回のみ）
				console.group(`${unEscapeEmoji(g_emojiObj.crossMark)} Custom Function Error: [${_hookName}] (Index: ${index}${func.name ? `, Func: ${func.name}` : ``})`);
				console.error(`${unEscapeEmoji(g_emojiObj.policeLight)} [${g_errorFrames[_hookName]()} Frame] ${g_msgObj.customFunctionError}`, e);
				console.groupEnd();
				errorCache[index] = new Set();
				errorCache[index].add(func);
				makeInfoWindow(g_msgInfoObj.W_0051, `leftToRightFade`);
			}
		}
	}
};

/**
 * 与えられたパスより、キーワードとディレクトリに分割
 * @param {string} _fileName 
 * @param {string} [_directory='']
 * @returns {string[]} [ファイルキーワード, ルートディレクトリ]
 */
const getFilePath = (_fileName, _directory = ``) => {
	if (_fileName.startsWith(`https://`)) {
		return [_fileName, ``];
	}
	let fullPath;
	if (_fileName.startsWith(C_MRK_CURRENT_DIRECTORY)) {
		fullPath = `${g_workPath}${_fileName.slice(C_MRK_CURRENT_DIRECTORY.length)}`;
	} else {
		fullPath = `${g_rootPath}${_directory}${_fileName}`;
	}
	const dirPos = fullPath.lastIndexOf(`/`);
	return [fullPath.slice(dirPos + 1), fullPath.slice(0, dirPos + 1)];
};

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
const g_ctx = document.createElement(`canvas`).getContext(`2d`);

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
	g_ctx.fillStyle = _color;
	return g_ctx.fillStyle;
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
	g_ctx.font = `${wUnit(_fontsize)} ${_font}`;
	return g_ctx.measureText(unEscapeHtml(_str)).width;
};

const getStrHeight = (_str, _fontsize, _font = getBasicFont()) => {
	g_ctx.font = `${wUnit(_fontsize)} ${_font}`;
	const lines = unEscapeHtml(_str).split(`<br>`);

	let totalHeight = 0;
	const lineGap = 1;

	lines.forEach((line, index) => {
		const metrics = g_ctx.measureText(line);

		// 基本の高さ（フォントサイズ）を取得
		// fontBoundingBox が使えれば正確ですが、なければ _fontsize を使用
		const h = metrics.fontBoundingBoxAscent
			? (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent)
			: _fontsize;

		if (index < lines.length - 1) {
			totalHeight += h * lineGap; // 途中の行は行間を足す
		} else {
			totalHeight += h; // 最終行
		}
	});

	return totalHeight;
};

/**
 * Canvas上で使用する絵文字を取得
 * - HTMLのdiv要素に絵文字を設定することで、Canvas上で使用できるようにする
 * @param {string} _str 
 * @returns {string}
 */
const getEmojiForCanvas = _str => {
	const div = document.createElement(`div`);
	div.innerHTML = _str;
	const result = div.innerHTML;
	div.remove();
	return result;
};

/**
 * 複数行に跨る可能性のある文字列を、改行タグ付きの文字列とフォントサイズに変換
 * @param {string} _targetStr 
 * @param {number} _maxWidth 
 * @param {object} object
 * @param {string} [object.font=getBasicFont()]
 * @param {number} [object.maxSiz=14]
 * @param {number} [object.minSiz=5]
 * @param {number} [object.maxSizMulti=maxSiz]
 * @param {string} [object.prefix='']
 * @param {number} [object.len=30]
 * @param {string} [object.delim=' ']
 * @returns {[string, number]}
 */
const getFontSizeMulti = (_targetStr, _maxWidth, { font = getBasicFont(),
	maxSiz = 14, minSiz = 5, maxSizMulti = maxSiz, prefix = ``, len = 20, delim = ` ` } = {}) => {

	// _targetStr が長い場合のみ、その中身を 2つ に分解する
	if (_targetStr.length > len) {
		let breakNum = -1;
		const halfIndex = Math.floor(_targetStr.length / 2);

		// 文字列の中央から前に向かってスペースを探す
		for (let j = halfIndex; j > 0; j--) {
			if (_targetStr[j] === delim) {
				breakNum = j;
				break;
			}
		}
		// スペースがなければ、中央（よりやや左）で強制分割
		if (breakNum === -1) {
			breakNum = halfIndex;
		}
		const isSpace = _targetStr[breakNum] === delim;
		const firstPart = _targetStr.slice(0, breakNum);
		const secondPart = _targetStr.slice(isSpace ? breakNum + delim.length : breakNum);

		// 難易度名の中に <br> を仕込む
		_targetStr = `${firstPart}<br>${secondPart}`;
	}

	// 3. 最終的な文字列を結合（prefix と難易度名の1つ目の塊が1行目になる）
	const fullStr = `${prefix}${_targetStr}`;

	return [fullStr, getFontSize2(fullStr, _maxWidth, { font, maxSiz: _targetStr.includes(`<br>`) ? maxSizMulti : maxSiz, minSiz })];
};

/**
 * 指定した横幅に合ったフォントサイズを取得
 * @param {string} _str 
 * @param {number} _maxWidth 
 * @param {string} [object.font=getBasicFont()]
 * @param {number} [object.maxSiz=14]
 * @param {number} [object.minSiz=5]
 * @returns {number}
 */
const getFontSize2 = (_str, _maxWidth, { font = getBasicFont(), maxSiz = 14, minSiz = 5 } = {}) => {
	// 文字列を改行で分割（null/undefined 対策も含む）
	const lines = _str ? _str.split('<br>') : [];
	if (lines.length === 0) return maxSiz;

	// 大きいサイズから順に試す
	for (let siz = maxSiz; siz >= minSiz; siz--) {
		// すべての行が _maxWidth 以内に収まるかチェック
		const isFitAllLines = lines.every(line => _maxWidth >= getStrWidth(line, siz, font));

		if (isFitAllLines) {
			return siz;
		}
	}
	return minSiz;
};

/**
 * 配列中から最も長い文字列を抽出（本体では未使用）
 * @param {string[]} _array 
 * @returns {string}
 */
const getLongestStr = _array => {
	if (_array === undefined) {
		return ``;
	}
	return _array.reduce((longest, current) => {
		return current.length > longest.length ? current : longest;
	}, ``);
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
	createDivCss2Label(_id, _str, {
		...g_lblPosObj[altId],
		siz: getFontSize2(_str, g_lblPosObj[altId]?.w || g_sWidth, { maxSiz: siz }),
	});

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
	siz = g_limitObj.setLblSiz, align = C_ALIGN_CENTER, type = `text`, ...rest } = {}, ..._classes) => {
	const div = createDiv(_id, x, y, w, h, [g_cssObj.title_base, ..._classes]);

	const style = div.style;
	style.fontSize = wUnit(siz);
	style.fontFamily = getBasicFont();
	style.textAlign = `${align}`;
	style.pointerEvents = C_DIS_NONE;
	if (rest?.overflow === C_DIS_AUTO || type !== `text`) {
		style.pointerEvents = C_DIS_AUTO;
	}
	div.innerHTML = _text;
	Object.keys(rest).forEach(property => style[property] = rest[property]);

	return div;
};

/**
 * divをドラッグ可能にする関数
 * @param {string} _divName divのid名
 * @param {number} [minX=0]	ドラッグ可能な範囲の左端
 * @param {number} [minY=0]	ドラッグ可能な範囲の上端
 * @param {number} [maxX=g_sWidth]	ドラッグ可能な範囲の右端
 * @param {number} [maxY=g_sHeight]	ドラッグ可能な範囲の下端 
 */
const dragDiv = (_divName, { minX = 0, minY = 0, maxX = g_sWidth, maxY = g_sHeight } = {}) => {
	if (document.getElementById(_divName) === null) return;
	const div = document.getElementById(_divName);
	div.onpointermove = evt => {
		if (evt.buttons) {
			const nextX = div.offsetLeft + evt.movementX;
			const nextY = div.offsetTop + evt.movementY;
			const clampMaxX = (maxX === minX) ? maxX : (maxX - div.offsetWidth);
			const clampMaxY = (maxY === minY) ? maxY : (maxY - div.offsetHeight);
			div.style.left = wUnit(Math.min(Math.max(nextX, minX), clampMaxX));
			div.style.top = wUnit(Math.min(Math.max(nextY, minY), clampMaxY));
			div.style.position = 'absolute';
			div.draggable = false;
			div.setPointerCapture(evt.pointerId);

			g_posObj[_divName] = { x: div.offsetLeft, y: div.offsetTop };
		}
	};
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
 * @param {Function} _func 
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
	picker.style.pointerEvents = C_DIS_AUTO;
	g_handler.addListener(picker, `change`, _func);
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
	style.pointerEvents = C_DIS_NONE;
	if (rest?.overflow === C_DIS_AUTO) {
		style.pointerEvents = C_DIS_AUTO;
	}
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
	style.pointerEvents = (title !== `` || rest?.overflow === C_DIS_AUTO)
		? C_DIS_AUTO : C_DIS_NONE;
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
const createMultipleSprite = (_baseName, _num, { x = 0, priority = g_transPriority.layer } = {}) => {
	const sprite = createEmptySprite(divRoot, _baseName);
	for (let j = 0; j <= _num; j++) {
		createEmptySprite(sprite, `${_baseName}${j}`);
	}
	addTransform(_baseName, `root`, `translateX(${wUnit(x)})`, priority);
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
		 * @param {boolean|AddEventListenerOptions} [_options=false] 
		 * @returns {number}
		 */
		addListener: (_target, _type, _listener, _options = false) => {
			_target.addEventListener(_type, _listener, _options);
			events[key] = {
				target: _target,
				type: _type,
				listener: _listener,
				options: _options // boolean/objectどちらでもそのまま保持
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
				e.target.removeEventListener(e.type, e.listener, e.options);
				delete events[key];
			}
		},
		/**
		 * すべてのイベントリスナーを削除
		 */
		removeAll: () => {
			Object.values(events).forEach(e => {
				e.target.removeEventListener(e.type, e.listener, e.options);
			});
			for (const k in events) delete events[k];
		},
		/**
		 * 指定した要素配下（自身含む）のイベントリスナーをまとめて削除
		 * @param {HTMLDivElement} _container 
		 */
		removeByContainer: _container => {
			Object.entries(events).forEach(([k, e]) => {
				if (_container.contains(e.target)) {
					e.target.removeEventListener(e.type, e.listener, e.options);
					delete events[k];
				}
			});
		}
	};
})();

// setInterval/setTimeout版
const g_timerHandler = (() => {
	const timers = {}; // key -> { id, type: 'interval' | 'timeout' }
	let key = 0;

	const clearByType = entry => {
		if (entry.type === 'interval') {
			clearInterval(entry.id);
		} else {
			clearTimeout(entry.id);
		}
	};

	const clear = key => {
		if (key in timers) {
			clearByType(timers[key]);
			delete timers[key];
		}
	};

	return {
		setInterval: (_callback, _ms) => {
			const id = setInterval(_callback, _ms);
			timers[key] = { id, type: 'interval' };
			return key++;
		},
		setTimeout: (_callback, _ms, ..._args) => {
			const id = setTimeout(() => {
				_callback(..._args);
				delete timers[myKey]; // 発火し終わったら自動で登録簿から消す
			}, _ms);
			const myKey = key;
			timers[key] = { id, type: 'timeout' };
			return key++;
		},
		clear,
		clearInterval: clear,
		clearTimeout: clear,
		clearAll: () => {
			Object.values(timers).forEach(clearByType);
			for (const k in timers) delete timers[k];
		}
	};
})();

// requestAnimationFrame版
const g_rafHandler = (() => {
	const loops = {};
	let key = 0;

	return {
		start: _callback => {
			const myKey = key++;
			function loop() {
				if (!(myKey in loops)) return; // clearAll済みなら自然停止
				_callback();
				loops[myKey] = requestAnimationFrame(loop);
			}
			loops[myKey] = requestAnimationFrame(loop);
			return myKey;
		},
		stop: key => {
			if (key in loops) {
				cancelAnimationFrame(loops[key]);
				delete loops[key];
			}
		},
		stopAll: () => {
			Object.values(loops).forEach(id => cancelAnimationFrame(id));
			for (const k in loops) delete loops[k];
		}
	};
})();

/**
 * 親スプライト配下の子スプライトを全削除
 * @param {object} _parentObjName 親スプライト名
 */
const deleteChildspriteAll = _parentObjName => {

	const parentsprite = document.getElementById(_parentObjName);
	g_handler.removeByContainer(parentsprite);
	while (parentsprite.hasChildNodes()) {
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
		g_handler.removeByContainer(document.getElementById(_idName));
		_parentId.removeChild(document.getElementById(_idName));
	}
};

/**
 * ボタンの作成 (CSS版・拡張属性対応)
 * @param {string} _id 
 * @param {string} _text
 * @param {Function} _func
 * @param {number} [object.x]
 * @param {number} [object.y]
 * @param {number} [object.w=g_btnWidth() / 3]
 * @param {number} [object.h=g_limitObj.btnHeight]
 * @param {number} [object.siz=g_limitObj.btnSiz]
 * @param {string} [object.align='center']
 * @param {string} [object.title] ボタンオンマウス時のコメント
 * @param {string} [object.groupName] 画面名 (g_btnWaitFrameで定義しているプロパティ名を指定)
 * @param {boolean} [object.initDisabledFlg=true] ボタン有効化までの時間を設けるかどうか
 * @param {Function} [object.resetFunc] カスタム処理後に実行する処理
 * @param {Function} [object.cxtFunc] 右クリック時に実行する処理
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
	style.pointerEvents = C_DIS_AUTO;
	if (rest.animationName !== undefined) {
		style.animationDuration = `1s`;
	}
	Object.keys(rest).forEach(property => style[property] = rest[property]);

	// ボタン有効化操作
	if (initDisabledFlg) {
		if (!g_btnWaitFrame[groupName] ||
			g_btnWaitFrame[groupName].b_frame === 0 ||
			(g_initialFlg && g_btnWaitFrame[groupName].initial)) {
		} else {
			style.pointerEvents = C_DIS_NONE;
			g_timerHandler.setTimeout(() => style.pointerEvents = rest.pointerEvents ?? C_DIS_AUTO,
				g_btnWaitFrame[groupName].b_frame * 1000 / g_fps);
		}
	}

	// ボタンを押したときの動作
	g_handler.addListener(div, `click`, evt => {
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
 * @param {string} [_customDisplayName=''] 画面名(メイン画面: 'Main', それ以外: 空)
 */
const clearWindow = (_customDisplayName = ``) => {
	closeDisplayPreview();
	resetKeyControl();
	resetTransform();
	resetXY();

	// ボタン、オブジェクトをクリア (divRoot配下のもの)
	deleteChildspriteAll(`divRoot`);
	divRoot.style.perspective = ``;
	divRoot.style.perspectiveOrigin = ``;

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

		// 画面背景を指定 (background-color)
		$id(`canvas-frame`).width = wUnit(g_sWidth + diffX);
		layer0.width = g_sWidth + diffX;
		if (!g_headerObj[`customBack${_customDisplayName}Use`]) {
			makeBgCanvas(l0ctx, { w: g_sWidth + diffX });
		}
	}

	// 背景を再描画
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
};

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
 * @param {string} [object._textColor='#000066']
 * @param {string} [object._pointerEvents=C_DIS_NONE]
 * @param {number} [object._x=0]
 * @param {number} [object._y=0]
 */
const makeInfoWindow = (_text, _animationName = ``, { _backColor = `#ccccff`, _textColor = `#000066`, _pointerEvents = C_DIS_NONE, _x = 0, _y = 0 } = {}) => {
	const lblWarning = setWindowStyle(`<p>${_text}</p>`, _backColor, _textColor, C_ALIGN_CENTER, { _x, _y });
	lblWarning.style.pointerEvents = _pointerEvents;

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
		whiteSpace: `normal`, pointerEvents: C_DIS_AUTO,
	});
	if (warnHeight === 150) {
		lbl.style.overflow = C_DIS_AUTO;
	}

	// 一時的な枠を削除
	divRoot.removeChild(tmplbl);

	return lbl;
};

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