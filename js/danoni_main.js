'use strict';
/**
 * Dancing☆Onigiri (CW Edition)
 * 
 * Source by tickle
 * Created : 2018/10/08
 * Revised : 2022/08/01
 * 
 * https://github.com/cwtickle/danoniplus
 */
const g_version = `Ver 27.8.1`;
const g_revisedDate = `2022/08/01`;
const g_alphaVersion = ``;

// カスタム用バージョン (danoni_custom.js 等で指定可)
let g_localVersion = ``;
let g_localVersion2 = ``;

// ショートカット用文字列(↓の文字列を検索することで対象箇所へジャンプできます)
//  共通:water　初期化:peach　タイトル:melon  設定:lime　ディスプレイ:lemon  キーコンフィグ:orange  譜面読込:strawberry  メイン:banana  結果:grape
//  シーンジャンプ:Scene

/**
 * ▽ ソースコーディング
 * https://github.com/cwtickle/danoniplus/blob/develop/.github/CONTRIBUTING.md
 * 
 * - 定数・変数名
 * -- グローバル変数： 変数の頭に`g_`をつける。基本はオブジェクトプロパティとして定義。
 * -- 関数の引数　　： アンダースコア始まりのキャメル表記。
 * -- 定数　　　　　： `C_(カテゴリ)_(名前)`の形式。全て英大文字、数字、アンダースコアのみを使用。
 *                    ※この定義方法は今後使用しない方針。
 * 
 * ▽ 画面の構成
 *  [タイトル]-[設定]-[ディスプレイ]-[キーコンフィグ]-[譜面読込]-[メイン]-[リザルト]
 *  ⇒　各画面に Init がついたものが画面の基本構成(ルート)を表す。
 * 
 * ▽ スプライトの親子関係
 *  基本的にdiv要素で管理。最下層を[divRoot]とし、createEmptySprite()でdiv子要素を作成。
 *  clearWindow()で[divRoot]以外の全てのスプライトを削除。
 *  特定のスプライトに限り削除する場合は deleteChildspriteAll() 。
 */
const current = _ => {
	if (document.currentScript) {
		return document.currentScript.src;
	}
	const scripts = Array.from(document.getElementsByTagName(`script`));
	const targetScript = scripts.find(file => file.src.endsWith(`danoni_main.js`));
	return targetScript.src;
};
const g_rootPath = current().match(/(^.*\/)/)[0];
const g_remoteFlg = g_rootPath.match(`^https://cwtickle.github.io/danoniplus/`) !== null;
const g_randTime = Date.now();

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
	await loadScript2(`${g_rootPath}../js/lib/danoni_legacy_function.js?${g_randTime}`, false);
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
let g_baseDisp = `Settings`;

// ライフ・ゲームオーバー・曲終了管理
let g_maxScore = 1000000;
let g_gameOverFlg = false;
let g_finishFlg = true;

/** 共通オブジェクト */
const g_loadObj = {};
const g_rootObj = {};
const g_presetObj = {};
let g_headerObj = {};
let g_scoreObj = {};
let g_attrObj = {};
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
};

// 歌詞制御
let g_wordSprite;

const g_wordObj = {
	wordDir: 0,
	wordDat: ``,
	fadeInFlg0: false,
	fadeInFlg1: false,
	fadeOutFlg0: false,
	fadeOutFlg1: false
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
 */
const $id = _id => document.getElementById(`${_id}`).style;

/**
 * 複数のdiv子要素を親要素へ接続
 * @param {object} _baseObj 
 * @param {...any} rest 
 */
const multiAppend = (_baseObj, ...rest) => _baseObj.append(...rest);

/**
 * 複数の属性をまとめて設定
 * @param {object} _baseObj 
 * @param {object} rest 
 */
const setAttrs = (_baseObj, { ...rest } = {}) =>
	Object.keys(rest).forEach(property => _baseObj.setAttribute(property, rest[property]));

/**
 * 属性値を数値に変換して取得
 * @param {object} _baseObj 
 * @param {string} _attrkey 
 */
const getNumAttr = (_baseObj, _attrkey) => parseFloat(_baseObj.getAttribute(_attrkey));


/*-----------------------------------------------------------*/
/* 値や配列のチェック・変換                                    */
/*-----------------------------------------------------------*/

/**
 * 変数が存在するかどうかをチェック
 * @param {string} _data 
 */
const hasVal = _data => _data !== undefined && _data !== ``;

/**
 * 文字列を想定された型に変換
 * - _type は `float`(小数)、`number`(整数)、`boolean`(真偽値)、
 *   `switch`(ON/OFF), `calc`(数式), `string`(文字列)から選択
 * - 型に合わない場合は _default を返却するが、_default自体の型チェック・変換は行わない
 * @param {string} _checkStr 
 * @param {string} _default 
 * @param {string} _type 
 */
const setVal = (_checkStr, _default, _type = C_TYP_STRING) => {

	let convertStr = _checkStr;

	// 値がundefined相当の場合は無条件でデフォルト値を返却
	if (_checkStr === undefined || _checkStr === null || _checkStr === ``) {
		return _default;
	}

	if (_type === C_TYP_FLOAT) {
		// 数値型(小数可)の場合
		const toFloat = parseFloat(_checkStr);
		convertStr = (isNaN(toFloat) ? _default : toFloat);

	} else if (_type === C_TYP_NUMBER) {
		// 数値型(整数のみ)の場合
		const toInt = parseInt(_checkStr);
		convertStr = (isNaN(toInt) ? _default : toInt);

	} else if (_type === C_TYP_BOOLEAN) {
		// 真偽値の場合
		const lowerCase = _checkStr.toString().toLowerCase();
		convertStr = (lowerCase === `true` ? true : (lowerCase === `false` ? false : _default));

	} else if (_type === C_TYP_SWITCH) {
		// ON/OFFスイッチの場合
		const toSwtich = _checkStr.toString().toUpperCase();
		convertStr = [C_FLG_OFF, C_FLG_ON].includes(toSwtich) ? toSwtich : _default;

	} else if (_type === C_TYP_CALC) {
		try {
			convertStr = new Function(`return ${_checkStr}`)();
		} catch (err) {
			convertStr = _default;
		}
	}

	// 文字列型の場合 (最初でチェック済みのためそのまま値を返却)
	return convertStr;
};

/**
 * ブール値への変換
 * @param {string} _val 
 * @param {boolean} _defaultVal 
 * @returns 
 */
const setBoolVal = (_val, _defaultVal = false) => setVal(_val, _defaultVal, C_TYP_BOOLEAN);

/**
 * 整数値への変換
 * @param {string} _val 
 * @param {number} _defaultVal 
 * @returns 
 */
const setIntVal = (_val, _defaultVal = 0) => setVal(_val, _defaultVal, C_TYP_NUMBER);

/**
 * 先頭のみ大文字に変換（それ以降はそのまま）
 * @param {string} _str 
 */
const toCapitalize = _str => {
	if (!_str || typeof _str !== `string`) return _str;
	return `${_str.charAt(0).toUpperCase()}${_str.slice(1)}`;
};

/**
 * 0以上の数字に変換
 * @param {number} _num 
 * @param {number} _init 0未満の場合に設定する値
 */
const roundZero = (_num, _init = 0) => _num < 0 ? _init : _num;

/**
 * 配列内に存在するかどうかをチェック
 * @param {string} _val 
 * @param {array} _array 
 * @param {integer} _pos 
 * @returns 
 */
const hasValInArray = (_val, _array, _pos = 0) =>
	_array.findIndex(data => data[_pos] === _val) !== -1;

/**
 * 配列が既定長以上かどうかをチェック
 * @param {array} _data 
 * @param {integer} _length 
 * @returns 
 */
const hasArrayList = (_data, _length = 1) => _data !== undefined && _data.length >= _length;

/**
 * 改行コード区切りの配列展開
 * @param {string} _str 
 * @returns 
 */
const splitLF = _str => _str.split(`\r`).join(`\n`).split(`\n`);

/**
 * 改行コード区切りを本来の区切り文字に変換して配列展開
 * （改行区切りで間が空行だった場合は無効化）
 * @param {string} _str 
 * @param {string} _delim 
 * @returns 
 */
const splitLF2 = (_str, _delim = `$`) => splitLF(_str).filter(val => val !== ``).join(_delim).split(_delim);

/**
 * 重複を排除した配列の生成
 * @param {array} _array1 
 * @param {...any} _arrays 
 * @returns 
 */
const makeDedupliArray = (_array1, ..._arrays) =>
	Array.from((new Set([..._array1, ..._arrays.flat()])).values());

/**
 * 二次元配列のコピー
 * @param {array2} _array2d 
 * @returns 
 */
const copyArray2d = _array2d => JSON.parse(JSON.stringify(_array2d));

/**
 * 配列データを合計
 * @param {array} _array 
 * @returns 
 */
const sumData = _array => _array.reduce((p, x) => p + x);

/**
 * 部分一致検索（リストのいずれかに合致、大小文字問わず）
 * @param {string} _str 検索文字
 * @param {array} _list 検索リスト (英字は小文字にする必要あり)
 * @param {string} prefix 前方一致条件 (前方一致時は ^)
 * @param {string} suffix 後方一致条件 (後方一致時は $)
 */
const listMatching = (_str, _list, { prefix = ``, suffix = `` } = {}) =>
	_list.findIndex(value => _str.toLowerCase().match(new RegExp(String.raw`${prefix}${value}${suffix}`, 'i'))) !== -1;

const fuzzyListMatching = (_str, _headerList, _footerList) =>
	listMatching(_str, _headerList, { prefix: `^` }) || listMatching(_str, _footerList, { suffix: `$` });

/**
 * 文字列の置換
 * @param {string} _str 
 * @param {array} _pairs 
 */
const replaceStr = (_str, _pairs) => {
	let tmpStr = _str;
	_pairs.forEach(pair => {
		tmpStr = tmpStr.replaceAll(pair[0], pair[1]);
	});
	return tmpStr;
};

/**
 * 文字列のエスケープ処理
 * @param {string} _str 
 * @param {array} _escapeList
 */
const escapeHtml = (_str, _escapeList = g_escapeStr.escape) => escapeHtmlForEnabledTag(replaceStr(_str, _escapeList));

/**
 * 文字列のエスケープ処理(htmlタグ許容版)
 * @param {string} _str 
 */
const escapeHtmlForEnabledTag = _str => replaceStr(_str, g_escapeStr.escapeTag);

/**
 * エスケープ文字を元の文字に戻す
 * @param {string} _str 
 */
const unEscapeHtml = _str => replaceStr(_str, g_escapeStr.unEscapeTag);

/**
 * 配列の中身を全てエスケープ処理
 * @param {array} _array 
 */
const escapeHtmlForArray = _array => _array.map(str => escapeHtml(str));

/**
 * 次のカーソルへ移動
 * @param {number} _basePos 
 * @param {number} _num 
 * @param {number} _length 
 * @returns 
 */
const nextPos = (_basePos, _num, _length) => (_basePos + _length + _num) % _length;

/*-----------------------------------------------------------*/
/* キーコード関連                                             */
/*-----------------------------------------------------------*/

/**
 * 特定キーコードを置換する処理
 * @param {string} _setCode 
 */
const transCode = _setCode => {
	if ([`Control`, `Shift`, `Alt`].includes(_setCode.slice(0, -5))) {
		return _setCode.replaceAll(`Right`, `Left`);
	}
	return _setCode;
};

/**
 * 特定キーをブロックする処理
 * @param {string} _setCode 
 */
const blockCode = _setCode => !C_BLOCK_KEYS.map(key => g_kCdN[key]).includes(_setCode);


/*-----------------------------------------------------------*/
/* ショートカット制御                                          */
/*-----------------------------------------------------------*/

/**
 * キーを押したときの動作（汎用）
 * @param {object} _evt 
 * @param {string} _displayName 
 * @param {function} _func
 * @param {boolean} _dfEvtFlg
 */
const commonKeyDown = (_evt, _displayName, _func = _code => { }, _dfEvtFlg) => {
	if (!_dfEvtFlg) {
		_evt.preventDefault();
	}
	const setCode = transCode(_evt.code);
	if (_evt.repeat && (g_unrepeatObj.page.includes(_displayName) || g_unrepeatObj.key.includes(setCode))) {
		return blockCode(setCode);
	}
	g_inputKeyBuffer[setCode] = true;

	// 対象ボタンを検索
	const scLists = Object.keys(g_shortcutObj[_displayName]).filter(keys => {
		const keyset = keys.split(`_`);
		return (keyset.length > 2 ? keyIsDown(keyset[0]) && keyIsDown(keyset[1]) && keyIsDown(keyset[2]) :
			(keyset.length > 1 ? keyIsDown(keyset[0]) && keyIsDown(keyset[1]) : keyIsDown(keyset[0])));
	});
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
 * @param {object} _evt 
 */
const commonKeyUp = _evt => {
	g_inputKeyBuffer[g_kCdNameObj.metaKey] = false;
	g_inputKeyBuffer[transCode(_evt.code)] = false;
};

/**
 * ショートカットキー表示
 * @param {object} _obj
 * @param {string} _settingLabel 
 * @param {object} objectList 
 */
const createScText = (_obj, _settingLabel, { displayName = `option`, dfLabel = ``, targetLabel = `lnk${_settingLabel}R`,
	x = g_scViewObj.x, y = g_scViewObj.y, w = g_scViewObj.w, siz = g_scViewObj.siz } = {}) => {
	const scKey = Object.keys(g_shortcutObj[displayName]).filter(key => g_shortcutObj[displayName][key].id === targetLabel);
	if (scKey.length > 0) {
		multiAppend(_obj,
			createDivCss2Label(`sc${_settingLabel}`,
				g_scViewObj.format.split(`{0}`).join(dfLabel !== `` ? `${dfLabel}` : `${g_kCd[g_kCdN.findIndex(kCd => kCd === scKey[0])] ?? ''}`), {
				x, y, w, siz, fontWeight: `bold`, opacity: 0.75, pointerEvents: C_DIS_NONE,
			})
		);
	}
};

/**
 * 各画面の汎用ショートカットキー表示
 * @param {string} _displayName 
 */
const createScTextCommon = _displayName => {
	Object.keys(g_btnPatterns[_displayName]).filter(target => document.getElementById(`btn${target}`) !== null)
		.forEach(target =>
			createScText(document.getElementById(`btn${target}`), target, {
				displayName: _displayName, targetLabel: `btn${target}`,
				dfLabel: g_lblNameObj[`sc_${_displayName}${target}`] ?? ``,
				x: g_btnPatterns[_displayName][target],
			}));
};

/**
 * ショートカットキー有効化
 * @param {string} _displayName
 * @param {function} _func 
 */
const setShortcutEvent = (_displayName, _func = _ => true, { displayFlg = true, dfEvtFlg = false } = {}) => {
	if (displayFlg) {
		createScTextCommon(_displayName);
	}
	const evList = _ => {
		document.onkeydown = evt => commonKeyDown(evt, _displayName, _func, dfEvtFlg);
		document.onkeyup = evt => commonKeyUp(evt);
	};
	if (g_initialFlg && g_btnWaitFrame[_displayName].initial) {
		evList();
	} else {
		setTimeout(_ => {
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
 * プリロードするファイルの設定
 * @param {string} _as 
 * @param {string} _href 
 * @param {string} _type 
 * @param {string} _crossOrigin 
 */
const preloadFile = (_as, _href, _type = ``, _crossOrigin = `anonymous`) => {

	const preloadFlg = g_preloadFiles.all.find(v => v === _href);

	if (preloadFlg === undefined) {
		g_preloadFiles.all.push(_href);

		if (g_preloadFiles[_as] === undefined) {
			g_preloadFiles[_as] = [];
		}
		g_preloadFiles[_as].push(_href);

		if (g_userAgent.indexOf(`firefox`) !== -1 && _as === `image`) {
			// Firefoxの場合のみpreloadが効かないため、画像読込形式にする
			g_loadObj[_href] = false;
			const img = new Image();
			img.src = _href;
			img.onload = _ => g_loadObj[_href] = true;

		} else {
			// それ以外のブラウザの場合はrel=preloadを利用
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
	}
};

/**
 * 外部jsファイルの読込 (Promise)
 * 読込可否を g_loadObj[ファイル名] で管理 (true: 読込成功, false: 読込失敗)
 * @param {string} _url 
 * @param {boolean} _requiredFlg (default : true / 読込必須)
 * @param {string} _charset (default : UTF-8)
 */
const loadScript2 = (_url, _requiredFlg = true, _charset = `UTF-8`) => {
	const baseUrl = _url.split(`?`)[0];
	g_loadObj[baseUrl] = false;

	return new Promise((resolve, reject) => {
		const script = document.createElement(`script`);
		script.type = `text/javascript`;
		script.src = _url;
		script.charset = _charset;
		script.onload = _ => {
			g_loadObj[baseUrl] = true;
			resolve(script);
		};
		script.onerror = _err => {
			if (_requiredFlg) {
				makeWarningWindow(g_msgInfoObj.E_0041.split(`{0}`).join(_url.split(`?`)[0]));
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
 */
const importCssFile2 = _href => {
	const baseUrl = _href.split(`?`)[0];
	g_loadObj[baseUrl] = false;

	return new Promise(resolve => {
		const link = document.createElement(`link`);
		link.rel = `stylesheet`;
		link.href = _href;
		link.onload = _ => {
			g_loadObj[baseUrl] = true;
			resolve(link);
		};
		link.onerror = _ => {
			makeWarningWindow(g_msgInfoObj.E_0041.split(`{0}`).join(baseUrl), { resetFlg: `title` });
			resolve(link);
		};
		document.head.appendChild(link);
	});
};

/**
 * js, cssファイルの連続読込 (async function)
 * @param {array} _fileData 
 * @param {string} _loadType
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
 * 入力されたパスを、ディレクトリとそれ以外に分割
 * 返却値：[ファイルキーワード, ルートディレクトリ]
 * @param {string} _path 
 * @param {number} _pos 
 * @param {string} _directory 
 */
const getFolderAndType = (_path, _pos, _directory = ``) => {
	const rootPath = (_directory === `` ? `` : g_rootPath);
	return (_pos > 0 ? [_path.substring(_pos + 1), `${rootPath}${_path.substring(0, _pos)}/`] : [_path, `${rootPath}${_directory}`]);
};

/**
 * 与えられたパスより、キーワードとディレクトリに分割
 * カレントディレクトリ指定がある場合を考慮して、処理を分けている
 * 返却値：[ファイルキーワード, ルートディレクトリ]
 * @param {string} _fileName 
 * @param {string} _directory 
 */
const getFilePath = (_fileName, _directory = ``) => {
	if (_fileName.indexOf(C_MRK_CURRENT_DIRECTORY) !== -1) {
		const tmpType = _fileName.split(C_MRK_CURRENT_DIRECTORY)[1];
		return getFolderAndType(tmpType, tmpType.indexOf(`/`));
	} else {
		return getFolderAndType(_fileName, _fileName.lastIndexOf(`/`), _directory);
	}
};

/*-----------------------------------------------------------*/
/* 色・グラデーション設定                                      */
/*-----------------------------------------------------------*/

/**
 * 対象のカラーコードが明暗どちらかを判定 (true: 明色, false: 暗色)
 * @param {string} _colorStr 
 * @returns 
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
 */
const colorNameToCode = _color => {
	const cxt = document.createElement(`canvas`).getContext(`2d`);
	cxt.fillStyle = _color;
	return cxt.fillStyle;
};

/**
 * 10進 -> 16進数変換 (カラーコード形式になるよう0埋め)
 * @param {number} _num 
 */
const byteToHex = _num => (`${_num.toString(16).padStart(2, '0')}`);

/**
 * カラーコードかどうかを判定 (簡易版)
 * @param {string} _str 
 * @returns 
 */
const isColorCd = _str => _str.substring(0, 1) === `#`;

/**
 * CSSの位置表記系かどうかをチェック
 * @param {string} _str 
 * @returns 
 */
const hasAnglePointInfo = _str => fuzzyListMatching(_str, g_checkStr.cssHeader, g_checkStr.cssFooter);

/**
 * 色名をカラーコードへ変換 (元々カラーコードの場合は除外)
 * @param {string} _color 色名
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
 */
const colorCdPadding = (_useFlg, _colorStr) => _useFlg ? `#${_colorStr.slice(1).padStart(6, `0`)}` : _colorStr;

/**
 * グラデーション用のカラーフォーマットを作成
 * @param {string} _colorStr 
 * @param {object} _options
 *   defaultColorgrd
 *   colorCdPaddingUse
 *   objType (normal: 汎用, titleMusic: タイトル曲名, titleArrow: タイトル矢印)
 *   shadowFlg
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
	// 背景矢印の場合　　　　：透明度を25%にする
	const alphaVal = (_shadowFlg && _objType !== `frz`) ? `80` : (_objType === `titleArrow` ? `40` : ``);

	let convertColorStr = ``;
	const tmpColorStr = _colorStr.split(`@`);
	const colorArray = tmpColorStr[0].split(`:`);
	for (let j = 0; j < colorArray.length; j++) {
		colorArray[j] = colorCdPadding(_colorCdPaddingUse, colorToHex(colorArray[j].replaceAll(`0x`, `#`)));
		if (isColorCd(colorArray[j]) && colorArray[j].length === 7) {
			colorArray[j] += alphaVal;
		}
	}

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

	return `${gradationType}(${convertColorStr})`;
};

/*-----------------------------------------------------------*/
/* フォント設定                                          */
/*-----------------------------------------------------------*/

/**
 * 画面共通のフォント設定
 * @param {string} _priorityFont 
 */
const getBasicFont = (_priorityFont = ``) =>
	[_priorityFont, g_headerObj.customFont, C_LBL_BASICFONT].filter(value => value !== ``).join(`,`);

/**
 * フォントサイズに応じた横幅を取得
 * @param {string} _str 
 * @param {number} _fontsize 
 * @param {string} _font 
 */
const getStrWidth = (_str, _fontsize, _font) => {
	const ctx = document.createElement(`canvas`).getContext(`2d`);
	ctx.font = `${_fontsize}px ${_font}`;
	return ctx.measureText(unEscapeHtml(_str)).width;
};

/**
 * 指定した横幅に合ったフォントサイズを取得
 * @param {string} _str 
 * @param {number} _maxWidth 
 * @param {string} _font 
 * @param {number} _maxFontsize
 * @param {number} _minFontsize
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
 * @param {string} _altId
 * @returns 
 */
const createDescDiv = (_id, _str, _altId = _id) =>
	createDivCss2Label(_id, _str, Object.assign(g_lblPosObj[_altId], {
		siz: getFontSize(_str, g_sWidth, getBasicFont(), C_SIZ_MAIN),
	}));

/*-----------------------------------------------------------*/
/* ラベル・ボタン・オブジェクトの作成                           */
/*-----------------------------------------------------------*/

/**
 * 図形の描画
 * - div子要素の作成。呼び出しただけでは使用できないので、親divよりappendChildすること。
 * - 詳細は @see {@link createButton} も参照のこと。 
 * @param {string} _id
 * @param {number} _x 
 * @param {number} _y 
 * @param {number} _width 
 * @param {number} _height 
 * @param {array} _classes
 */
const createDiv = (_id, _x, _y, _width, _height, _classes = []) => {
	const div = document.createElement(`div`);

	div.id = _id;
	const style = div.style;
	style.left = `${_x}px`;
	style.top = `${_y}px`;
	style.width = `${_width}px`;
	style.height = `${_height}px`;
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
	_style.msUserSelect = _value;
	_style.mozUserSelect = _value;
	_style.webkitTouchCallout = _value;
};

/**
 * 子div要素のラベル文字作成 (CSS版・拡張属性対応)
 * @param {string} _id 
 * @param {string} _text 
 * @param {object} _obj (x, y, w, h, siz, align, ...rest)
 * @param {...any} _classes 
 */
const createDivCss2Label = (_id, _text, { x = 0, y = 0, w = C_LEN_SETLBL_WIDTH, h = C_LEN_SETLBL_HEIGHT,
	siz = C_SIZ_SETLBL, align = C_ALIGN_CENTER, ...rest } = {}, ..._classes) => {
	const div = createDiv(_id, x, y, w, h, [g_cssObj.title_base, ..._classes]);

	const style = div.style;
	style.fontSize = `${siz}px`;
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
 */
const createImg = (_id, _imgPath, _x, _y, _width, _height) => {
	const div = createDiv(_id, _x, _y, _width, _height);
	div.innerHTML = `<img id="${_id}img" src="${_imgPath}" style="width:${_width}px;height:${_height}px"${g_isFile ? `` : ` crossOrigin="anonimous"`}>`;

	return div;
};

/**
 * ColorPickerの作成
 * @param {string} _parentObj
 * @param {string} _id
 * @param {function} _func 
 * @param {object} _obj 
 * @returns 
 */
const createColorPicker = (_parentObj, _id, _func, { x = 0, y = 0 } = {}) => {
	const picker = document.createElement(`input`);
	picker.setAttribute(`type`, `color`);
	picker.id = _id;
	picker.style.left = `${x}px`;
	picker.style.top = `${y}px`;
	picker.style.position = `absolute`;
	picker.addEventListener(`change`, _func);
	_parentObj.appendChild(picker);
	return picker;
};

/**
 * 色付きオブジェクトの作成 (拡張属性対応)
 * @param {string} _id 
 * @param {object} _obj (x, y, w, h, color, rotate, styleName, ...rest) 
 * @param {...any} _classes 
 */
const createColorObject2 = (_id,
	{ x = 0, y = 0, w = C_ARW_WIDTH, h = C_ARW_WIDTH, rotate = ``, styleName = ``, ...rest } = {}, ..._classes) => {

	const div = createDiv(_id, x, y, w, h, _classes);
	const style = div.style;

	// 矢印・オブジェクト判定
	let charaStyle;
	if (isNaN(parseFloat(rotate))) {
		const objData = rotate.split(`:`);
		rotate = setVal(objData[1], 0, C_TYP_FLOAT);
		charaStyle = `${objData[0]}${styleName}`;
	} else {
		charaStyle = `arrow${styleName}`;
	}
	if (g_stateObj.rotateEnabled) {
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
 * @param {object} _parentObj 親スプライト
 * @param {string} _newObjId 作成する子スプライト名
 * @param {object} _obj (x, y, w, h, ...rest)
 * @param  {...any} _classes 
 * @returns 
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
 * @param {number} _num 
 */
const createMultipleSprite = (_baseName, _num) => {
	const sprite = createEmptySprite(divRoot, `${_baseName}`);
	for (let j = 0; j <= _num; j++) {
		createEmptySprite(sprite, `${_baseName}${j}`);
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
const g_handler = (_ => {
	const events = {};
	let key = 0;

	return {
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

	const parentsprite = document.querySelector(`#${_parentObjName}`);
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
 * @param {object} _obj (x, y, w, h, siz, align, title, groupName, initDisabledFlg, ...rest)
 * @param {...any} _classes 
 */
const createCss2Button = (_id, _text, _func = _ => true, { x = 0, y = g_sHeight - 100, w = g_sWidth / 3, h = C_BTN_HEIGHT,
	siz = C_LBL_BTNSIZE, align = C_ALIGN_CENTER, title = ``, groupName = g_currentPage, initDisabledFlg = true,
	resetFunc = _ => true, cxtFunc = _ => true, ...rest } = {}, ..._classes) => {

	const div = createDiv(_id, x, y, w, h, [`button_common`, ..._classes]);
	div.innerHTML = _text;
	div.title = title;

	const style = div.style;
	style.textAlign = align;
	style.fontSize = `${siz}px`;
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
			setTimeout(_ => style.pointerEvents = rest.pointerEvents ?? `auto`,
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

	// 右クリック時の処理
	div.oncontextmenu = evt => {
		if (typeof cxtFunc === C_TYP_FUNCTION) {
			if (!setBoolVal(g_cxtDeleteFlg[_id])) {
				cxtFunc(evt);
			}
			if (typeof g_cxtAddFunc[_id] === C_TYP_FUNCTION) {
				g_cxtAddFunc[_id](evt, cxtFunc);
			}
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
 * @param {object} _obj (x, y, w, h, siz, align, title, ...rest) 
 */
const changeStyle = (_id, { x, y, w, h, siz, align, title, ...rest } = {}) => {
	const div = document.querySelector(`#${_id}`);
	const style = div.style;

	const obj = {
		left: x,
		top: y,
		width: w,
		height: h,
		fontSize: siz,
	};
	Object.keys(obj).filter(property => setVal(obj[property], ``, C_TYP_FLOAT) !== ``)
		.forEach(property => style[property] = `${obj[property]}px`);

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
 */
const getTitleDivLabel = (_id, _titlename, _x, _y, ..._classes) =>
	createDivCss2Label(_id, _titlename, { x: _x, y: _y, w: g_sWidth, h: 50, siz: C_LBL_BTNSIZE }, ..._classes);

/**
 * キーコントロールの初期化
 */
const resetKeyControl = _ => {
	document.onkeyup = _ => { };
	document.onkeydown = evt => {
		evt.preventDefault();
		return blockCode(transCode(evt.code));
	};
	g_inputKeyBuffer = {};
};

/**
 * 画面上の描画・オブジェクトを全てクリアし、背景を再描画
 * - divオブジェクト(ボタンなど)はdivRoot配下で管理しているため、子要素のみを全削除している。
 * - dicRoot自体を削除しないよう注意すること。
 * - 再描画時に共通で表示する箇所はここで指定している。
 */
const clearWindow = (_redrawFlg = false, _customDisplayName = ``) => {
	resetKeyControl();

	if (document.querySelector(`#layer0`) !== null) {

		// レイヤー情報取得
		const layer0 = document.querySelector(`#layer0`);
		const l0ctx = layer0.getContext(`2d`);
		layer0.width = g_sWidth;

		// 線画、図形をクリア
		l0ctx.clearRect(0, 0, g_sWidth, g_sHeight);

		if (document.querySelector(`#layer1`) !== null) {
			const layer1 = document.querySelector(`#layer1`);
			const l1ctx = layer1.getContext(`2d`);
			layer1.width = g_sWidth;
			l1ctx.clearRect(0, 0, g_sWidth, g_sHeight);

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
		if (document.querySelector(`#layer2`) !== null) {
			const layer2 = document.querySelector(`#layer2`);
			const l2ctx = layer2.getContext(`2d`);
			layer2.width = g_sWidth;
			l2ctx.clearRect(0, 0, g_sWidth, g_sHeight);
		}
	}

	// ボタン、オブジェクトをクリア (divRoot配下のもの)
	deleteChildspriteAll(`divRoot`);

	// 背景を再描画
	if (_redrawFlg) {
		drawDefaultBackImage(_customDisplayName);
	}
};

/**
 * デフォルト背景画像の描画処理
 * @param {string} _key メイン画面かどうか。Main:メイン画面、(空白):それ以外
 */
const drawDefaultBackImage = _key => {

	g_btnAddFunc = {};
	g_btnDeleteFlg = {};
	g_cxtAddFunc = {};
	g_cxtDeleteFlg = {};

	// レイヤー情報取得
	if (document.querySelector(`#layer0`) !== null) {
		const layer0 = document.querySelector(`#layer0`);
		const l0ctx = layer0.getContext(`2d`);

		// 画面背景を指定 (background-color)
		const grd = l0ctx.createLinearGradient(0, 0, 0, g_sHeight);
		if (!g_headerObj[`customBack${_key}Use`]) {
			grd.addColorStop(0, `#000000`);
			grd.addColorStop(1, `#222222`);
			l0ctx.fillStyle = grd;
			l0ctx.fillRect(0, 0, g_sWidth, g_sHeight);

			if (!g_headerObj.defaultSkinFlg) {
				createEmptySprite(divRoot, `divBack`);
			}
		}
	} else {
		createEmptySprite(divRoot, `divBack`);
	}
};

/**
 * 背景・マスク用画像の描画
 * @param {object} _obj 
 */
const makeSpriteImage = _obj => {
	let tmpInnerHTML = `<img src=${_obj.path} class="${_obj.class}"	style="position:absolute;left:${_obj.left}px;top:${_obj.top}px`;
	if (_obj.width > 0) {
		tmpInnerHTML += `;width:${_obj.width}px`;
	}
	if (setIntVal(_obj.height) > 0) {
		tmpInnerHTML += `;height:${_obj.height}px`;
	}
	tmpInnerHTML += `;animation-name:${_obj.animationName};animation-duration:${_obj.animationDuration}s;opacity:${_obj.opacity}">`;
	return tmpInnerHTML;
};

/**
 * 背景・マスク用テキストの描画
 * @param {object} _obj 
 */
const makeSpriteText = _obj => {
	let tmpInnerHTML = `<span class="${_obj.class}"	style="display:inline-block;position:absolute;left:${_obj.left}px;top:${_obj.top}px`;

	// この場合のwidthは font-size と解釈する
	if (_obj.width > 0) {
		tmpInnerHTML += `;font-size:${_obj.width}px`;
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
 * @param {object, array} _obj 
 */
const checkDuplicatedObjects = _obj => {
	let addFrame = 0;
	if (_obj === undefined) {
		_obj = [];
		_obj[0] = [];
	} else {
		for (let m = 1; ; m++) {
			if (_obj[m] === undefined) {
				_obj[m] = [];
				addFrame = m;
				break;
			}
		}
	}
	return [_obj, addFrame];
};

/**
 * 多層スプライトデータの作成処理
 * @param {array} _data 
 * @param {function} _calcFrame 
 */
const makeSpriteData = (_data, _calcFrame = _frame => _frame) => {

	const spriteData = [];
	let maxDepth = -1;

	splitLF(_data).filter(data => hasVal(data)).forEach(tmpData => {
		const tmpSpriteData = tmpData.split(`,`);

		// 深度が"-"の場合はスキップ
		if (tmpSpriteData.length > 1 && tmpSpriteData[1] !== `-`) {

			// 値チェックとエスケープ処理
			let tmpFrame;
			if (setIntVal(tmpSpriteData[0], -1) === 0) {
				tmpFrame = 0;
			} else {
				tmpFrame = roundZero(_calcFrame(setVal(tmpSpriteData[0], 200, C_TYP_CALC)));
			}
			const tmpDepth = (tmpSpriteData[1] === C_FLG_ALL ? C_FLG_ALL : setVal(tmpSpriteData[1], 0, C_TYP_CALC));
			if (tmpDepth !== C_FLG_ALL && tmpDepth > maxDepth) {
				maxDepth = tmpDepth;
			}

			const tmpObj = {
				path: escapeHtml(tmpSpriteData[2] ?? ``, g_escapeStr.escapeCode),   // 画像パス or テキスト
				class: escapeHtml(tmpSpriteData[3] ?? ``),                          // CSSクラス
				left: setVal(tmpSpriteData[4], 0, C_TYP_CALC),                      // X座標
				top: setVal(tmpSpriteData[5], 0, C_TYP_CALC),                       // Y座標
				width: setIntVal(tmpSpriteData[6]),                                 // spanタグの場合は font-size
				height: escapeHtml(tmpSpriteData[7] ?? ``),                         // spanタグの場合は color(文字列可)
				opacity: setVal(tmpSpriteData[8], 1, C_TYP_FLOAT),
				animationName: escapeHtml(setVal(tmpSpriteData[9], C_DIS_NONE)),
				animationDuration: setIntVal(tmpSpriteData[10]) / g_fps,
			};
			if (g_headerObj.autoPreload) {
				if (checkImage(tmpObj.path)) {
					if (g_headerObj.syncBackPath) {
						const [file, dir] = getFilePath(tmpObj.path, `./`);
						tmpObj.path = `${dir}${file}`;
					}
					preloadFile(`image`, tmpObj.path);
				}
			}

			let addFrame = 0;
			[spriteData[tmpFrame], addFrame] =
				checkDuplicatedObjects(spriteData[tmpFrame]);

			const emptyPatterns = [``, `[loop]`, `[jump]`];
			spriteData[tmpFrame][addFrame] = {
				depth: tmpDepth,
				command: tmpObj.path,
				jumpFrame: tmpObj.class,
				maxLoop: tmpObj.left,
				animationName: tmpObj.animationName,
				htmlText: emptyPatterns.includes(tmpObj.path) ?
					`` : (checkImage(tmpObj.path) ? makeSpriteImage(tmpObj) : makeSpriteText(tmpObj)),
			};
		}
	});

	return [spriteData, maxDepth];
};

/**
 * 画像ファイルかどうかをチェック
 * @param {string} _str 
 */
const checkImage = _str => listMatching(_str, g_imgExtensions, { prefix: `[.]`, suffix: `$` });

/**
 * back/masktitle(result)において、ジャンプ先のフレーム数を取得
 * @param {string} _frames 
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
 * @param {boolean} _condition 
 */
const drawBaseSpriteData = (_spriteData, _name, _condition = true) => {
	const baseSprite = document.querySelector(`#${_name}Sprite${_spriteData.depth}`);
	if (_spriteData.command === ``) {
		if (_spriteData.depth === C_FLG_ALL) {
			for (let j = 0; j <= g_scoreObj[`${_name}MaxDepth`]; j++) {
				document.querySelector(`#${_name}Sprite${j}`).textContent = ``;
			}
		} else {
			baseSprite.textContent = ``;
		}
	} else {
		if (_condition) {
			baseSprite.innerHTML = _spriteData.htmlText;
		}
	}
}

/**
 * 背景・マスクモーションの表示（タイトル・リザルト用）
 * @param {number} _frame 
 * @param {string} _displayName title / result
 * @param {string} _depthName back / mask
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
 * タイトル・リザルトモーションの描画
 * @param {string} _displayName
 */
const drawTitleResultMotion = _displayName => {
	g_animationData.forEach(sprite => {
		const spriteName = `${sprite}${toCapitalize(_displayName)}`;
		if (g_headerObj[`${spriteName}Data`][g_scoreObj[`${spriteName}FrameNum`]] !== undefined) {
			g_scoreObj[`${spriteName}FrameNum`] = drawSpriteData(g_scoreObj[`${spriteName}FrameNum`], _displayName, sprite);
		}
	});
};

/*-----------------------------------------------------------*/
/* その他の共通設定                                           */
/*-----------------------------------------------------------*/

// WebAudioAPIでAudio要素風に再生するクラス
class AudioPlayer {
	constructor() {
		const AudioContext = window.AudioContext ?? window.webkitAudioContext;
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

		if (this._eventListeners[`canplaythrough`] !== undefined) {
			this._eventListeners[`canplaythrough`].forEach(_listener => _listener());
		}
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
		if (this._eventListeners[_type] === undefined) {
			this._eventListeners[_type] = [];
		}
		this._eventListeners[_type].push(_listener);
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
 */
const getQueryParamVal = _name => {
	const param = new URL(location.href).searchParams.get(_name);
	return param !== null ? decodeURIComponent(param.replace(/\+/g, ` `)) : null;
};

/**
 * ローディング文字用ラベルの作成
 */
const getLoadingLabel = _ => createDivCss2Label(`lblLoading`, g_lblNameObj.nowLoading, {
	x: 0, y: g_sHeight - 40, w: g_sWidth, h: C_LEN_SETLBL_HEIGHT,
	siz: C_SIZ_SETLBL, align: C_ALIGN_RIGHT,
});

/**
 * フレーム数を時間表示へ変換
 * @param {number} _frame 
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

	const stage = document.querySelector(`#canvas-frame`);
	const divRoot = createEmptySprite(stage, `divRoot`, g_windowObj.divRoot);

	// 背景の表示
	if (document.querySelector(`#layer0`) !== null) {
		const layer0 = document.querySelector(`#layer0`);
		const l0ctx = layer0.getContext(`2d`);
		const grd = l0ctx.createLinearGradient(0, 0, 0, g_sHeight);
		grd.addColorStop(0, `#000000`);
		grd.addColorStop(1, `#222222`);
		l0ctx.fillStyle = grd;
		l0ctx.fillRect(0, 0, g_sWidth, g_sHeight);
	} else {
		createEmptySprite(divRoot, `divBack`, g_windowObj.divBack);
	}

	// Now Loadingを表示
	divRoot.appendChild(getLoadingLabel());

	// 譜面初期情報ロード許可フラグ
	g_canLoadDifInfoFlg = true;

	// 譜面データの読み込みオプション
	g_enableAmpersandSplit = setBoolVal(document.querySelector(`#enableAmpersandSplit`)?.value, true);
	g_enableDecodeURI = setBoolVal(document.querySelector(`#enableDecodeURI`)?.value);

	// 作品別ローカルストレージの読み込み
	loadLocalStorage();

	// 譜面データの読み込み(1ファイル目)
	await loadChartFile(0);

	// 共通設定ファイルの指定
	let [settingType, settingRoot] = getFilePath(g_rootObj.settingType ?? ``, C_DIR_JS);
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
	if (document.querySelector(`#layer0`) === null) {
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
	if (g_presetObj.keysData !== undefined) {
		keysConvert(dosConvert(g_presetObj.keysData));
		g_headerObj.undefinedKeyLists = g_headerObj.undefinedKeyLists.filter(key => g_keyObj[`chara${key}_0`] === undefined);
	}
	g_headerObj.keyExtraList = keysConvert(g_rootObj, {
		keyExtraList: (g_rootObj.keyExtraList !== undefined ?
			makeDedupliArray(g_rootObj.keyExtraList.split(`,`), g_headerObj.undefinedKeyLists) : g_headerObj.undefinedKeyLists),
	});

	// 自動横幅拡張設定
	if (g_headerObj.autoSpread) {
		const widthList = [g_sWidth, g_presetObj.autoMinWidth ?? g_keyObj.minWidth];
		g_headerObj.keyLists.forEach(key => widthList.push(g_keyObj[`minWidth${key}`] ?? g_keyObj.minWidthDefault));

		g_sWidth = Math.max(...widthList);
		$id(`canvas-frame`).width = `${g_sWidth}px`;
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

	getScoreDetailData(0);

	if (g_loadObj.main) {

		// 譜面分割、譜面番号固定かどうかをチェック
		g_stateObj.dosDivideFlg = setBoolVal(document.querySelector(`#externalDosDivide`)?.value ?? getQueryParamVal(`dosDivide`));
		g_stateObj.scoreLockFlg = setBoolVal(document.querySelector(`#externalDosLock`)?.value ?? getQueryParamVal(`dosLock`));

		for (let j = 1; j < g_headerObj.keyLabels.length; j++) {

			// 譜面ファイルが分割されている場合、譜面詳細情報取得のために譜面をロード
			if (g_stateObj.dosDivideFlg) {
				await loadChartFile(j);
				resetColorAndGauge(j);
			}
			getScoreDetailData(j);
		}
	}
	g_customJsObj.preTitle.forEach(func => func());
	titleInit();
};

/**
 * 作品別ローカルストレージの読み込み・初期設定
 */
const loadLocalStorage = _ => {
	// URLからscoreIdを削除
	const url = new URL(location.href);
	url.searchParams.delete('scoreId');
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

	// 作品別ローカルストレージの読込
	const checkStorage = localStorage.getItem(g_localStorageUrl);
	if (checkStorage) {
		g_localStorage = JSON.parse(checkStorage);

		// Adjustment, Volume, Appearance, Opacity初期値設定
		checkLocalParam(`adjustment`, C_TYP_FLOAT, C_MAX_ADJUSTMENT);
		checkLocalParam(`volume`, C_TYP_NUMBER, g_settings.volumes.length - 1);
		checkLocalParam(`appearance`);
		checkLocalParam(`opacity`, C_TYP_NUMBER, g_settings.opacitys.length - 1);

		// ハイスコア取得準備
		if (g_localStorage.highscores === undefined) {
			g_localStorage.highscores = {};
		}

	} else {
		g_localStorage = {
			adjustment: 0,
			volume: 100,
			highscores: {},
		};
	}
};

/**
 * 譜面データを分割して値を取得
 * @param {string} _dos 譜面データ
 */
const dosConvert = _dos => {

	const obj = {};
	const paramsTmp = g_enableAmpersandSplit ? _dos.split(`&`).join(`|`) : _dos;
	const params = paramsTmp.split(`|`);
	for (let j = 0; j < params.length; j++) {
		const pos = params[j].indexOf(`=`);
		if (pos > 0) {
			const pKey = params[j].substring(0, pos);
			const pValue = params[j].substring(pos + 1);

			if (pKey !== undefined) {
				obj[pKey] = g_enableDecodeURI ? decodeURIComponent(pValue) : pValue;
			}
		}
	}
	return obj;
};

/**
 * 譜面読込
 * @param {number} _scoreId 譜面番号
 */
const loadChartFile = async (_scoreId = g_stateObj.scoreId) => {

	const dosInput = document.querySelector(`#dos`);
	const divRoot = document.querySelector(`#divRoot`);
	const queryDos = getQueryParamVal(`dos`) !== null ?
		`dos/${getQueryParamVal('dos')}.txt` : encodeURI(document.querySelector(`#externalDos`)?.value ?? ``);

	if (dosInput === null && queryDos === ``) {
		makeWarningWindow(g_msgInfoObj.E_0023);
		g_loadObj.main = false;
		return;
	}

	// 譜面分割あり、譜面番号固定時のみ譜面データを一時クリア
	if (queryDos !== `` && g_stateObj.dosDivideFlg && g_stateObj.scoreLockFlg) {
		const scoreList = Object.keys(g_rootObj).filter(data => {
			return fuzzyListMatching(data, g_checkStr.resetDosHeader, g_checkStr.resetDosFooter);
		});
		scoreList.forEach(scoredata => g_rootObj[scoredata] = ``);
	}

	// HTML埋め込みdos
	if (dosInput !== null && _scoreId === 0) {
		Object.assign(g_rootObj, dosConvert(dosInput.value));
	}

	// 外部dos読み込み
	if (queryDos !== ``) {
		const charset = document.querySelector(`#externalDosCharset`)?.value ?? document.characterSet;
		const fileBase = queryDos.match(/.+\..*/)[0];
		const fileExtension = fileBase.split(`.`).pop();
		const fileCommon = fileBase.split(`.${fileExtension}`)[0];
		const filename = `${fileCommon}${g_stateObj.dosDivideFlg ? setScoreIdHeader(_scoreId) : ''}.${fileExtension}`;

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
 * 譜面をファイルで分割している場合に初期色やゲージ情報を追加取得
 * @param {string} _scoreId 
 */
const resetColorAndGauge = _scoreId => {
	// 初期矢印・フリーズアロー色の再定義
	if (g_stateObj.scoreLockFlg) {
		Object.assign(g_rootObj, copySetColor(g_rootObj, _scoreId));
	}
	Object.assign(g_headerObj, resetBaseColorList(g_headerObj, g_rootObj, { scoreId: _scoreId }));

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
	const scoreIdHeader = setScoreIdHeader(_scoreId);
	[``, `Shadow`].forEach(pattern => {
		[`set`, `frz`].forEach(arrow => {
			if (hasVal(_baseObj[`${arrow}${pattern}Color`])) {
				obj[`${arrow}${pattern}Color${scoreIdHeader}`] = _baseObj[`${arrow}${pattern}Color`].concat();
			}
		});
	});
	return obj;
};

/**
 * MusicUrlの基本情報を取得
 * @param {number} _scoreId 
 * @returns 
 */
const getMusicUrl = _scoreId => {
	return g_headerObj.musicUrls !== undefined ?
		g_headerObj.musicUrls[g_headerObj.musicNos[_scoreId]] ??
		g_headerObj.musicUrls[0] : `nosound.mp3`;
};

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
	const keyNum = g_keyObj[`chara${_keyCtrlPtn}`].length;

	// 譜面密度グラフ用のデータ作成
	const noteCnt = { arrow: [], frz: [] };
	const densityData = [...Array(C_LEN_DENSITY_DIVISION)].fill(0);
	let allData = 0;

	const types = [`arrow`, `frz`];
	let fullData = [];
	for (let j = 0; j < keyNum; j++) {
		noteCnt.arrow[j] = 0;
		noteCnt.frz[j] = 0;

		const tmpFrzData = _scoreObj.frzData[j].filter((data, k) => k % 2 === 0);
		[_scoreObj.arrowData[j], tmpFrzData].forEach((typeData, m) => {
			typeData.forEach(note => {
				if (isNaN(parseFloat(note))) {
					return;
				}
				const point = Math.floor((note - firstArrowFrame) / playingFrame * C_LEN_DENSITY_DIVISION);
				if (point >= 0) {
					densityData[point]++;
					noteCnt[types[m]][j]++;
					allData++;
				}
			});
		});
		fullData = fullData.concat(..._scoreObj.arrowData[j], ...tmpFrzData);
	}

	fullData = fullData.filter(val => !isNaN(parseFloat(val))).sort((a, b) => a - b);
	let pushCnt = 1;
	const density2PushData = [...Array(C_LEN_DENSITY_DIVISION)].fill(0);
	const density3PushData = [...Array(C_LEN_DENSITY_DIVISION)].fill(0);
	fullData.forEach((note, j) => {
		if (fullData[j] === fullData[j + 1]) {
			pushCnt++;
		} else {
			const point = Math.floor((note - firstArrowFrame) / playingFrame * C_LEN_DENSITY_DIVISION);
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
		for (let j = 0; j < C_LEN_DENSITY_DIVISION; j++) {
			dataList.push(allData === 0 ? 0 : Math.round(_densityData[j] / allData * C_LEN_DENSITY_DIVISION * 10000) / 100);
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

	g_detailObj.maxDensity[_scoreId] = densityData.indexOf(Math.max.apply(null, densityData));

	g_detailObj.arrowCnt[_scoreId] = noteCnt.arrow.concat();
	g_detailObj.frzCnt[_scoreId] = noteCnt.frz.concat();
	g_detailObj.startFrame[_scoreId] = startFrame;
	g_detailObj.playingFrame[_scoreId] = playingFrame;
	g_detailObj.playingFrameWithBlank[_scoreId] = lastFrame - startFrame;
};

/**
 * ツール計算
 * @param {object} _scoreObj 
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

	for (let j = 0; j < _scoreObj.frzData.length; j++) {
		if (_scoreObj.frzData[j].length > 1) {
			for (let k = 0; k < _scoreObj.frzData[j].length; k += 2) {
				_scoreObj.arrowData[j].push(_scoreObj.frzData[j][k]);
				frzStartData.push(_scoreObj.frzData[j][k]);
				frzEndData.push(_scoreObj.frzData[j][k + 1]);
			}
		}
		_scoreObj.arrowData[j] = _scoreObj.arrowData[j].sort((a, b) => a - b)
			.filter((x, i, self) => self.indexOf(x) === i && !isNaN(parseFloat(x)));
	}

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
	allScorebook.push(allScorebook[allScorebook.length - 1] + 100);
	const allCnt = allScorebook.length;

	frzEndData.push(allScorebook[allCnt - 1]);

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
	for (let j = 0; j < _scoreObj.arrowData.length; j++) {
		for (let k = 0; k < _scoreObj.arrowData[j].length; k++) {
			const adjacantFrame = _scoreObj.arrowData[j][k + 1] - _scoreObj.arrowData[j][k];
			if (adjacantFrame < 10) {
				levelcount += 10 / Math.pow(adjacantFrame, 2) - 1 / 10;
			}
		}
	}

	//--------------------------------------------------------------
	//＜表示＞
	//  曲長、3つ押し補正を行い、最終的な難易度レベル値を表示する。
	//--------------------------------------------------------------
	const push3Cnt = push3List.length;
	const calcArrowCnt = allCnt - push3Cnt - 3;
	const toDecimal2 = num => Math.round(num * 100) / 100;
	const calcDifLevel = num => calcArrowCnt <= 0 ? 0 : toDecimal2(num / Math.sqrt(calcArrowCnt) * 4);

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
		push3: push3List,
	};
};

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

	const setJsFiles = (_files, _defaultDir, _type = `custom`) => {
		_files.forEach(file => {
			if (hasVal(file)) {
				const [jsFile, jsDir] = getFilePath(file, _defaultDir);
				obj.jsData.push([_type === `skin` ? `danoni_skin_${jsFile}.js` : jsFile, jsDir]);
			}
		});
	};

	// 外部スキンファイルの指定
	const tmpSkinType = _dosObj.skinType ?? g_presetObj.skinType ?? `default`;
	const tmpSkinTypes = tmpSkinType.split(`,`);
	obj.defaultSkinFlg = tmpSkinTypes.includes(`default`);
	setJsFiles(tmpSkinTypes, C_DIR_SKIN, `skin`);

	// 外部jsファイルの指定
	const tmpCustomjs = _dosObj.customjs ?? g_presetObj.customJs ?? C_JSF_CUSTOM;
	setJsFiles(tmpCustomjs.replaceAll(`*`, g_presetObj.customJs).split(`,`), C_DIR_JS);

	// 外部cssファイルの指定
	const tmpCustomcss = _dosObj.customcss ?? g_presetObj.customCss ?? ``;
	setJsFiles(tmpCustomcss.replaceAll(`*`, g_presetObj.customCss).split(`,`), C_DIR_CSS);

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
 */
const headerConvert = _dosObj => {

	// ヘッダー群の格納先
	const obj = {};

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
		if (tmpImgTypes.length > 0) {
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
	}

	// 末尾にデフォルト画像セットが入るよう追加
	if (obj.imgType.findIndex(imgSets => imgSets.name === ``) === -1) {
		obj.imgType.push({ name: ``, extension: `svg`, rotateEnabled: true, flatStepHeight: C_ARW_WIDTH });
		g_keycons.imgTypes.push(`Original`);
	}
	g_imgType = g_keycons.imgTypes[0];
	g_stateObj.rotateEnabled = obj.imgType[0].rotateEnabled;
	g_stateObj.flatStepHeight = obj.imgType[0].flatStepHeight;

	// サーバ上の場合、画像セットを再読込（ローカルファイル時は読込済みのためスキップ）
	if (!g_isFile) {
		updateImgType(obj.imgType[0]);
	}

	// ラベルテキスト、オンマウステキスト、確認メッセージ定義の上書き設定
	Object.assign(g_lblNameObj, g_lang_lblNameObj[g_localeObj.val], g_presetObj.lblName?.[g_localeObj.val]);
	Object.assign(g_msgObj, g_lang_msgObj[g_localeObj.val], g_presetObj.msg?.[g_localeObj.val]);

	// 自動横幅拡張設定
	obj.autoSpread = setBoolVal(_dosObj.autoSpread, g_presetObj.autoSpread ?? true);

	// 横幅設定
	if (hasVal(_dosObj.windowWidth)) {
		g_sWidth = setIntVal(_dosObj.windowWidth, g_sWidth);
		$id(`canvas-frame`).width = `${g_sWidth}px`;
	}

	// 曲名
	obj.musicTitles = [];
	obj.musicTitlesForView = [];
	obj.artistNames = [];
	obj.musicNos = [];

	if (hasVal(_dosObj.musicTitle)) {
		const musicData = splitLF2(_dosObj.musicTitle);

		if (hasVal(_dosObj.musicNo)) {
			obj.musicNos = _dosObj.musicNo.split(`$`);
		}

		for (let j = 0; j < musicData.length; j++) {
			const musics = musicData[j].split(`,`);

			if (obj.musicNos.length >= j) {
				obj.musicTitles[j] = escapeHtml(getMusicNameSimple(musics[0]));
				obj.musicTitlesForView[j] = escapeHtmlForArray(getMusicNameMultiLine(musics[0]));
				obj.artistNames[j] = escapeHtml(musics[1] ?? ``);
			}
		}
		const musics = musicData[0].split(`,`);
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
	g_settings.speeds = [...Array((obj.maxSpeed - obj.minSpeed) * 20 + 1).keys()].map(i => obj.minSpeed + i / 20);

	// プレイ中のショートカットキー
	obj.keyRetry = setIntVal(_dosObj.keyRetry, C_KEY_RETRY);
	obj.keyRetryDef = obj.keyRetry;
	obj.keyTitleBack = setIntVal(_dosObj.keyTitleBack, C_KEY_TITLEBACK);
	obj.keyTitleBackDef = obj.keyTitleBack;

	// フリーズアローの許容フレーム数設定
	obj.frzAttempt = setIntVal(_dosObj.frzAttempt, C_FRM_FRZATTEMPT);

	// 製作者表示
	if (hasVal(_dosObj.tuning)) {
		const tunings = _dosObj.tuning.split(`,`);
		obj.tuning = escapeHtmlForEnabledTag(tunings[0]);
		obj.creatorUrl = (tunings.length > 1 ? tunings[1] : (g_presetObj.tuningUrl ?? ``));
	} else {
		obj.tuning = escapeHtmlForEnabledTag(g_presetObj.tuning ?? `name`);
		obj.creatorUrl = g_presetObj.tuningUrl ?? ``;
	}
	obj.tuningInit = obj.tuning;

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
				setVal(difDetails[difpos[_type]] || g_presetObj.gauge?.[_type], _default, C_TYP_FLOAT);

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
	obj.keyLists = keyLists.sort((a, b) => parseInt(a) - parseInt(b));
	obj.undefinedKeyLists = obj.keyLists.filter(key => g_keyObj[`chara${key}_0`] === undefined);

	// 譜面変更セレクターの利用有無
	obj.difSelectorUse = (setBoolVal(_dosObj.difSelectorUse, obj.keyLabels.length > 5));

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
			g_gaugeOptionObj.varCustomDefault.push((g_presetObj.gaugeList[key] !== `V` ? C_FLG_OFF : C_FLG_ON));
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

	// ライフ設定のカスタム部分取得（譜面ヘッダー加味）
	Object.keys(g_gaugeOptionObj.customFulls).forEach(gaugePtn => getGaugeSetting(_dosObj, gaugePtn, obj.difLabels.length));

	// ダミー譜面の設定
	if (hasVal(_dosObj.dummyId)) {
		obj.dummyScoreNos = _dosObj.dummyId.split(`$`);
	}

	// 無音のフレーム数
	obj.blankFrame = 200;
	obj.blankFrameDef = 200;
	if (isNaN(parseFloat(_dosObj.blankFrame))) {
	} else {
		obj.blankFrame = parseInt(_dosObj.blankFrame);
		obj.blankFrameDef = parseInt(_dosObj.blankFrame);
	}

	// 開始フレーム数（0以外の場合はフェードインスタート）、終了フレーム数
	[`startFrame`, `endFrame`].filter(tmpParam => hasVal(_dosObj[tmpParam])).forEach(param => {
		obj[param] = _dosObj[param].split(`$`).map(frame => transTimerToFrame(frame));
	});

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

	// ステップゾーン位置
	g_posObj.stepY = (isNaN(parseFloat(_dosObj.stepY)) ? C_STEP_Y : parseFloat(_dosObj.stepY));
	g_posObj.stepYR = (isNaN(parseFloat(_dosObj.stepYR)) ? C_STEP_YR : parseFloat(_dosObj.stepYR));
	g_posObj.stepDiffY = g_posObj.stepY - C_STEP_Y;
	g_posObj.distY = g_sHeight - C_STEP_Y + g_posObj.stepYR;
	g_posObj.reverseStepY = g_posObj.distY - g_posObj.stepY - g_posObj.stepDiffY - C_ARW_WIDTH;
	g_posObj.arrowHeight = g_sHeight + g_posObj.stepYR - g_posObj.stepDiffY * 2;
	obj.bottomWordSetFlg = setBoolVal(_dosObj.bottomWordSet);

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
	obj.hashTag = setVal(_dosObj.hashTag, ``);

	// 自動プリロードの設定
	obj.autoPreload = setBoolVal(_dosObj.autoPreload, true);
	g_headerObj.autoPreload = obj.autoPreload;

	// 読込対象の画像を指定(rel:preload)と同じ
	obj.preloadImages = [];
	if (hasVal(_dosObj.preloadImages)) {
		obj.preloadImages = _dosObj.preloadImages.split(`,`).filter(image => hasVal(image)).map(preloadImage => preloadImage);
	}

	// 最終演出表示有無（noneで無効化）
	obj.finishView = _dosObj.finishView ?? ``;

	// 更新日
	obj.releaseDate = _dosObj.releaseDate ?? ``;

	// デフォルトReady/リザルト表示の遅延時間設定
	[`ready`, `result`].forEach(objName => {
		obj[`${objName}DelayFrame`] = setIntVal(_dosObj[`${objName}DelayFrame`]);
	});

	// デフォルトReady表示のアニメーション時間設定
	obj.readyAnimationFrame = setIntVal(_dosObj.readyAnimationFrame, 150);

	// デフォルトReady表示のアニメーション名
	obj.readyAnimationName = _dosObj.readyAnimationName ?? `leftToRightFade`;

	// デフォルトReady表示の先頭文字色
	obj.readyColor = _dosObj.readyColor ?? ``;

	// デフォルトReady表示を上書きするテキスト
	obj.readyHtml = _dosObj.readyHtml ?? ``;

	// デフォルト曲名表示のフォントサイズ
	obj.titlesize = _dosObj.titlesize ?? ``;

	// デフォルト曲名表示のフォント名
	// (使用例： |titlefont=Century,Meiryo UI|)
	obj.titlefonts = g_titleLists.defaultFonts.concat();
	_dosObj.titlefont?.split(`$`).forEach((font, j) => obj.titlefonts[j] = `'${(font.replaceAll(`,`, `', '`))}'`);
	if (obj.titlefonts[1] === undefined) {
		obj.titlefonts[1] = obj.titlefonts[0];
	}

	// デフォルト曲名表示, 背景矢印のグラデーション指定css
	g_titleLists.grdList.forEach(_name => {
		obj[`${_name}s`] = [];
		if (hasVal(_dosObj[_name])) {
			const tmpTitlegrd = _dosObj[_name].replaceAll(`,`, `:`);
			obj[`${_name}s`] = tmpTitlegrd.split(`$`);
			obj[`${_name}`] = obj[`${_name}s`][0] ?? ``;
		}
	});

	// デフォルト曲名表示の表示位置調整
	obj.titlepos = [[0, 0], [0, 0]];
	_dosObj.titlepos?.split(`$`).forEach((pos, j) => obj.titlepos[j] = pos.split(`,`).map(x => parseFloat(x)));

	// タイトル文字のアニメーション設定
	obj.titleAnimationName = [`leftToRight`];
	obj.titleAnimationDuration = [1.5];
	obj.titleAnimationDelay = [0];
	obj.titleAnimationTimingFunction = [`ease`];
	obj.titleAnimationClass = [``];

	_dosObj.titleanimation?.split(`$`).forEach((pos, j) => {
		const titleAnimation = pos.split(`,`);
		obj.titleAnimationName[j] = setVal(titleAnimation[0], obj.titleAnimationName[0]);
		obj.titleAnimationDuration[j] = setVal(titleAnimation[1] / g_fps, obj.titleAnimationDuration[0], C_TYP_FLOAT);
		obj.titleAnimationDelay[j] = setVal(titleAnimation[2] / g_fps, obj.titleAnimationDelay[0], C_TYP_FLOAT);
		obj.titleAnimationTimingFunction[j] = setVal(titleAnimation[3], obj.titleAnimationName[3]);
	});
	_dosObj.titleanimationclass?.split(`$`).forEach((animationClass, j) => {
		obj.titleAnimationClass[j] = animationClass ?? ``;
	});

	if (obj.titleAnimationName.length === 1) {
		g_titleLists.animation.forEach(pattern => {
			obj[`titleAnimation${pattern}`][1] = obj[`titleAnimation${pattern}`][0];
		});
	}
	if (obj.titleAnimationClass.length === 1) {
		obj.titleAnimationClass[1] = obj.titleAnimationClass[0];
	}

	// デフォルト曲名表示の複数行時の縦間隔
	obj.titlelineheight = setIntVal(_dosObj.titlelineheight, ``);

	// フリーズアローの始点で通常矢印の判定を行うか(dotさんソース方式)
	obj.frzStartjdgUse = setBoolVal(_dosObj.frzStartjdgUse ?? g_presetObj.frzStartjdgUse);

	// 譜面名に制作者名を付加するかどうかのフラグ
	obj.makerView = setBoolVal(_dosObj.makerView);

	// shuffleUse=group 時のみshuffle用配列を組み替える
	if (_dosObj.shuffleUse === `group`) {
		_dosObj.shuffleUse = true;
		g_settings.shuffles = g_settings.shuffles.filter(val => !val.endsWith(`+`));
	}

	// オプション利用可否設定
	g_canDisabledSettings.forEach(option => {
		obj[`${option}Use`] = setBoolVal(_dosObj[`${option}Use`] ?? g_presetObj.settingUse?.[option], true);
	});

	let interlockingErrorFlg = false;
	g_displays.forEach((option, j) => {

		// Display使用可否設定を分解 |displayUse=false,ON|
		const displayTempUse = _dosObj[`${option}Use`] ?? g_presetObj.settingUse?.[option] ?? `true`;
		const displayUse = (displayTempUse !== undefined ? displayTempUse.split(`,`) : [true, C_FLG_ON]);

		// displayUse -> ボタンの有効/無効, displaySet -> ボタンの初期値(ON/OFF)
		obj[`${option}Use`] = setBoolVal(displayUse[0], true);
		obj[`${option}Set`] = setVal(displayUse.length > 1 ? displayUse[1] :
			(obj[`${option}Use`] ? C_FLG_ON : C_FLG_OFF), ``, C_TYP_SWITCH);
		g_stateObj[`d_${option.toLowerCase()}`] = setVal(obj[`${option}Set`], C_FLG_ON, C_TYP_SWITCH);
		obj[`${option}ChainOFF`] = (_dosObj[`${option}ChainOFF`] !== undefined ? _dosObj[`${option}ChainOFF`].split(`,`) : []);

		// Displayのデフォルト設定で、双方向に設定されている場合は設定をブロック
		g_displays.forEach((option2, k) => {
			if (j > k) {
				if (obj[`${option}ChainOFF`].includes(option2) &&
					obj[`${option2}ChainOFF`].includes(option)) {
					interlockingErrorFlg = true;
					makeWarningWindow(g_msgInfoObj.E_0051);
				}
			}
		});
		if (!interlockingErrorFlg && obj[`${option}ChainOFF`].includes(option)) {
			interlockingErrorFlg = true;
			makeWarningWindow(g_msgInfoObj.E_0051);
		}
	});

	if (!interlockingErrorFlg) {
		g_displays.forEach(option => {
			obj[`${option}ChainOFF`].forEach(defaultOption => {
				g_stateObj[`d_${defaultOption.toLowerCase()}`] = C_FLG_OFF;
				interlockingButton(obj, defaultOption, C_FLG_OFF, C_FLG_ON);
			});
		});
	}

	// ローカルストレージに保存済みのDisplay設定・ColorType設定を戻す
	g_storeSettings.filter(tmpSetting => hasVal(g_localStorage[tmpSetting])).forEach(setting =>
		g_stateObj[setting] = g_localStorage[setting]);
	if (g_localStorage.colorType !== undefined) {
		g_colorType = g_localStorage.colorType;
		const typeNum = g_keycons.colorTypes.findIndex(value => value === g_colorType);
		if (obj.colorUse) {
			g_stateObj.d_color = g_keycons.colorDefs[typeNum];
		}
	}

	// 別キーパターンの使用有無
	obj.transKeyUse = setBoolVal(_dosObj.transKeyUse, true);

	// タイトル画面用・背景/マスクデータの分解 (下記すべてで1セット、改行区切り)
	// [フレーム数,階層,背景パス,class(CSSで別定義),X,Y,width,height,opacity,animationName,animationDuration]
	g_animationData.forEach(sprite => {
		obj[`${sprite}TitleData`] = [];
		obj[`${sprite}TitleData`].length = 0;
		obj[`${sprite}TitleMaxDepth`] = -1;

		const dataList = [_dosObj[`${sprite}title${g_localeObj.val}_data`], _dosObj[`${sprite}title_data`]];
		const data = dataList.find((v) => v !== undefined);
		if (hasVal(data)) {
			[obj[`${sprite}TitleData`], obj[`${sprite}TitleMaxDepth`]] = makeSpriteData(data);
		}
	});

	// 結果画面用のマスク透過設定
	obj.masktitleButton = setBoolVal(_dosObj.masktitleButton);

	// 結果画面用のマスク透過設定
	obj.maskresultButton = setBoolVal(_dosObj.maskresultButton);

	// color_dataの過去バージョン互換設定
	obj.colorDataType = _dosObj.colorDataType ?? ``;

	// リザルトモーションをDisplay:BackgroundのON/OFFと連動させるかどうかの設定
	obj.resultMotionSet = setBoolVal(_dosObj.resultMotionSet, true);

	// 譜面明細の使用可否
	obj.scoreDetailUse = setBoolVal(_dosObj.scoreDetailUse, true);

	// 判定位置をBackgroundのON/OFFと連動してリセットする設定
	obj.jdgPosReset = setBoolVal(_dosObj.jdgPosReset, true);

	// タイトル表示用コメント
	const newlineTag = setBoolVal(_dosObj.commentAutoBr, true) ? `<br>` : ``;
	const tmpComment = (_dosObj[`commentVal${g_localeObj.val}`] ?? _dosObj.commentVal ?? ``).split(`\r\n`).join(`\n`);
	obj.commentVal = tmpComment.split(`\n`).join(newlineTag);

	// クレジット表示
	if (document.querySelector(`#webMusicTitle`) !== null) {
		webMusicTitle.innerHTML =
			`<span style="font-size:32px">${obj.musicTitleForView.join(`<br>`)}</span><br>
			<span style="font-size:16px">(Artist: <a href="${obj.artistUrl}" target="_blank">${obj.artistName}</a>)</span>`;
	}

	// コメントの外部化設定
	obj.commentExternal = setBoolVal(_dosObj.commentExternal);

	// Reverse時の歌詞の自動反転制御
	obj.wordAutoReverse = _dosObj.wordAutoReverse ?? g_presetObj.wordAutoReverse ?? `auto`;

	// プレイサイズ(X方向)
	obj.playingWidth = setIntVal(_dosObj.playingWidth, `default`);

	// プレイ左上位置(X座標)
	obj.playingX = setIntVal(_dosObj.playingX);

	// プレイ中クレジットを表示しないエリアのサイズ(X方向)
	obj.customViewWidth = setVal(_dosObj.customViewWidth, 0, C_TYP_FLOAT);

	// ジャストフレームの設定 (ローカル: 0フレーム, リモートサーバ上: 1フレーム以内)
	obj.justFrames = (g_isLocal) ? 0 : 1;

	// リザルトデータのカスタマイズ
	const resultFormatDefault = `【#danoni[hashTag]】[musicTitle]([keyLabel]) /[maker] /Rank:[rank]/Score:[score]/Playstyle:[playStyle]/[arrowJdg]/[frzJdg]/[maxCombo] [url]`;
	obj.resultFormat = escapeHtmlForEnabledTag(_dosObj.resultFormat ?? g_presetObj.resultFormat ?? resultFormatDefault);

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
	g_fadeinStockList.forEach(type => {
		if (hasVal(_dosObj[`${type}StockForceDel`])) {
			g_stockForceDelList[type] = makeDedupliArray(g_stockForceDelList[type], _dosObj[`${type}StockForceDel`].split(`,`));
		}
	});

	return obj;
};

/**
 * 曲名（1行）の取得
 * @param {string} _musicName 
 */
const getMusicNameSimple = _musicName => replaceStr(_musicName, g_escapeStr.musicNameSimple);

/**
 * 曲名（複数行）の取得
 * @param {string} _musicName 
 */
const getMusicNameMultiLine = _musicName => {
	const tmpName = replaceStr(_musicName, g_escapeStr.musicNameMultiLine).split(`<br>`);
	return tmpName.length === 1 ? [tmpName[0], ``] : tmpName;
};

/**
 * 画像セットの入れ替え処理
 * @param {array} _imgType 
 */
const updateImgType = _imgType => {
	resetImgs(_imgType.name, _imgType.extension);
	reloadImgObj();
	Object.keys(g_imgObj).forEach(key => g_imgObj[key] = `${g_rootPath}${g_imgObj[key]}`);
	if (_imgType[1] === undefined && g_presetObj.overrideExtension !== undefined) {
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
 * @param {object} objectList 
 * @returns オブジェクト ※Object.assign(obj, resetBaseColorList(...))の形で呼び出しが必要
 */
const resetBaseColorList = (_baseObj, _dosObj, { scoreId = `` } = {}) => {

	const obj = {};
	const scoreIdHeader = setScoreIdHeader(scoreId);

	[``, `Shadow`].forEach(pattern => {
		const _name = `set${pattern}Color${scoreIdHeader}`;
		const _frzName = `frz${pattern}Color${scoreIdHeader}`;
		const _arrowInit = `set${pattern}ColorInit`;
		const _frzInit = `frz${pattern}ColorInit`;

		const arrowColorTxt = _dosObj[_name] || _dosObj[`set${pattern}Color`];
		const frzColorTxt = _dosObj[_frzName] || _dosObj[`frz${pattern}Color`];

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
		const firstFrzColors = (tmpFrzColors[0] !== undefined ? tmpFrzColors[0].split(`,`) : []);

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
 * @param {array} _colorInit 
 * @param {number} _colorInitLength
 * @param {object} objectList
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
 * @param {object} objectList
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
				obj[`varCustom${scoreId}`][j] = (customGaugeSets[1] !== `V` ? C_FLG_OFF : C_FLG_ON);
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
 * @param {object} objectList
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
	 * @param {number} _scoreId 
	 * @param {array} _gaugeDetails 
	 * @param {boolean} _loopFlg
	 */
	const setGaugeDetails = (_scoreId, _gaugeDetails) => {
		if (_gaugeDetails[0] === `x`) {
			obj.lifeBorders[_scoreId] = `x`;
		} else {
			obj.lifeBorders[_scoreId] = setVal(_gaugeDetails[0], ``, C_TYP_FLOAT);
		}
		obj.lifeRecoverys[_scoreId] = setVal(_gaugeDetails[1], ``, C_TYP_FLOAT);
		obj.lifeDamages[_scoreId] = setVal(_gaugeDetails[2], ``, C_TYP_FLOAT);
		obj.lifeInits[_scoreId] = setVal(_gaugeDetails[3], ``, C_TYP_FLOAT);

		if (gaugeUpdateFlg && hasVal(g_gaugeOptionObj[`gauge${_name}s`])) {
			Object.keys(obj).forEach(key => Object.assign(g_gaugeOptionObj[`gauge${_name}s`][key] || [], obj[key]));
			return false;
		}
		return true;
	};

	/**
	 * gaugeNormal2, gaugeEasy2などの個別設定があった場合にその値から配列を作成
	 * @param {number} _scoreId 
	 * @param {array} _defaultGaugeList
	 */
	const getGaugeDetailList = (_scoreId, _defaultGaugeList) => {
		if (_scoreId > 0) {
			const headerName = `gauge${_name}${setScoreIdHeader(_scoreId)}`;
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
			const gHeaderLen = gauges.length;
			for (let j = 0; j < gHeaderLen; j++) {
				gaugeCreateFlg = setGaugeDetails(j, getGaugeDetailList(j, gauges[j].split(`,`)));
			}
			if (gHeaderLen < _difLength) {
				const defaultGaugeList = gauges[0].split(`,`);
				for (let j = gHeaderLen; j < _difLength; j++) {
					gaugeCreateFlg = setGaugeDetails(j, getGaugeDetailList(j, defaultGaugeList));
				}
			}
		}

	} else if (g_presetObj.gaugeCustom?.[_name] !== undefined) {

		const gaugeDetails = [
			g_presetObj.gaugeCustom[_name].Border, g_presetObj.gaugeCustom[_name].Recovery,
			g_presetObj.gaugeCustom[_name].Damage, g_presetObj.gaugeCustom[_name].Init,
		]
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
 * @returns 
 */
const getKeyName = _key => hasVal(g_keyObj[`keyName${_key}`]) ? g_keyObj[`keyName${_key}`] : _key;

/**
 * 一時的な追加キーの設定
 * @param {object} _dosObj 
 */
const keysConvert = (_dosObj, { keyExtraList = _dosObj.keyExtraList.split(`,`) } = {}) => {

	if (keyExtraList === undefined) {
		return [];
	}

	const existParam = (_data, _paramName) => !hasVal(_data) && g_keyObj[_paramName] !== undefined;
	const toString = _str => _str;
	const toNumber = _num => parseInt(_num, 10);
	const toFloat = _num => parseFloat(_num);
	const toStringOrNumber = _str => isNaN(Number(_str)) ? _str : toNumber(_str);
	const toSplitArray = _str => _str.split(`/`).map(n => toNumber(n));

	/**
	 * 新キー用複合パラメータ
	 * @param {string} _key キー数
	 * @param {string} _name 名前
	 * @param {function} _convFunc マッピング関数
	 * @param {object} _obj errCd エラーコード, baseCopyFlg コピー配列の準備可否, loopFunc パターン別に処理する個別関数
	 * @returns 最小パターン数
	 */
	const newKeyMultiParam = (_key, _name, _convFunc, { errCd = ``, baseCopyFlg = false, loopFunc = _ => true } = {}) => {
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
				g_keyObj[`${keyheader}_${k + dfPtn}`] = g_keyObj[`${_name}${tmpArray[k]}`] !== undefined ?
					copyArray2d(g_keyObj[`${_name}${tmpArray[k]}`]) : tmpArray[k].split(`,`).map(n => _convFunc(n));
				if (baseCopyFlg) {
					g_keyObj[`${keyheader}_${k + dfPtn}d`] = copyArray2d(g_keyObj[`${keyheader}_${k + dfPtn}`]);
				}
				loopFunc(k, keyheader);
			}
		} else if (errCd !== `` && g_keyObj[`${keyheader}_0`] === undefined) {
			makeWarningWindow(g_msgInfoObj[errCd].split(`{0}`).join(_key));
		}
		return tmpMinPatterns;
	};

	/**
	 * 新キー用単一パラメータ
	 * @param {string} _key キー数
	 * @param {string} _name 名前
	 * @param {string} _type float, number, string, boolean
	 */
	const newKeySingleParam = (_key, _name, _type) => {
		const keyheader = _name + _key;
		const dfPtn = setIntVal(g_keyObj.dfPtnNum);
		if (_dosObj[keyheader] !== undefined) {
			const tmps = _dosObj[keyheader].split(`$`);
			for (let k = 0; k < tmps.length; k++) {
				g_keyObj[`${keyheader}_${k + dfPtn}`] = setVal(g_keyObj[`${_name}${tmps[k]}`], setVal(tmps[k], ``, _type));
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

		if (_dosObj[keyheader] !== undefined) {
			const tmpParams = splitLF2(_dosObj[keyheader]);
			for (let k = 0; k < tmpParams.length; k++) {
				const pairName = `${_pairName}${_key}_${k + dfPtn}`;
				if (!hasVal(tmpParams[k])) {
					continue;
				}
				g_keyObj[pairName] = {}
				if (g_keyObj[`${_pairName}${tmpParams[k]}`] !== undefined) {
					Object.assign(g_keyObj[pairName], g_keyObj[`${_pairName}${tmpParams[k]}`]);
				} else {
					if (_defaultName !== ``) {
						g_keyObj[pairName][_defaultName] = [...Array(g_keyObj[`color${_key}_${k + dfPtn}`].length)].fill(_defaultVal);
					}
					tmpParams[k].split(`/`).forEach(pairs => {
						const tmpParamPair = pairs.split(`::`);
						g_keyObj[pairName][tmpParamPair[0]] = tmpParamPair[1].split(`,`).map(n => parseInt(n, 10));
					});
				}
			}
		}
	};

	/**
	 * 子構成配列へのコピー
	 * @param {number} _k 
	 * @param {string} _header 
	 * @returns 
	 */
	const copyChildArray = (_k, _header) =>
		g_keyObj[`${_header}_${_k + g_keyObj.dfPtnNum}_0`] = copyArray2d(g_keyObj[`${_header}_${_k + g_keyObj.dfPtnNum}`]);

	// 対象キー毎に処理
	keyExtraList.forEach(newKey => {
		let tmpDivPtn = [];
		let tmpMinPatterns = 1;
		g_keyObj.dfPtnNum = 0;

		// キーパターンの追記 (appendX)
		if (setBoolVal(_dosObj[`append${newKey}`])) {
			for (let j = 0; ; j++) {
				if (g_keyObj[`color${newKey}_${j}`] === undefined) {
					break;
				}
				g_keyObj.dfPtnNum++;
			}
		}
		const dfPtnNum = g_keyObj.dfPtnNum;

		// キーの名前 (keyNameX)
		g_keyObj[`keyName${newKey}`] = _dosObj[`keyName${newKey}`] ?? newKey;

		// キーの最小横幅 (minWidthX)
		g_keyObj[`minWidth${newKey}`] = _dosObj[`minWidth${newKey}`] ?? g_keyObj[`minWidth${newKey}`] ?? g_keyObj.minWidthDefault;

		// 矢印色パターン (colorX_Y)
		tmpMinPatterns = newKeyMultiParam(newKey, `color`, toNumber, {
			errCd: `E_0101`,
			loopFunc: (k, keyheader) => copyChildArray(k, keyheader),
		});

		// 読込変数の接頭辞 (charaX_Y)
		tmpMinPatterns = newKeyMultiParam(newKey, `chara`, toString, { errCd: `E_0102` });

		// 矢印の回転量指定、キャラクタパターン (stepRtnX_Y)
		tmpMinPatterns = newKeyMultiParam(newKey, `stepRtn`, toStringOrNumber, { errCd: `E_0103` });

		// キーコンフィグ (keyCtrlX_Y)
		tmpMinPatterns = newKeyMultiParam(newKey, `keyCtrl`, toSplitArray, { errCd: `E_0104`, baseCopyFlg: true });

		// 各キーの区切り位置 (divX_Y)
		if (_dosObj[`div${newKey}`] !== undefined) {
			const tmpDivs = _dosObj[`div${newKey}`].split(`$`);
			for (let k = 0; k < tmpDivs.length; k++) {
				tmpDivPtn = tmpDivs[k].split(`,`);
				const ptnName = `${newKey}_${k + dfPtnNum}`;

				if (setIntVal(tmpDivPtn[0], -1) !== -1) {
					g_keyObj[`div${ptnName}`] = setIntVal(tmpDivPtn[0], g_keyObj[`chara${newKey}_0`].length);
				} else if (g_keyObj[`div${tmpDivPtn[0]}`] !== undefined) {
					// 既定キーパターンが指定された場合、存在すればその値を適用
					g_keyObj[`div${ptnName}`] = g_keyObj[`div${tmpDivPtn[0]}`];
					g_keyObj[`divMax${ptnName}`] = setIntVal(g_keyObj[`divMax${tmpDivPtn[0]}`], undefined);
				} else if (setIntVal(g_keyObj[`div${ptnName}`], -1) !== -1) {
					// すでに定義済みの場合はスキップ
					continue;
				} else if (g_keyObj[`chara${newKey}_0`] !== undefined) {
					// 特に指定が無い場合はcharaX_Yの配列長で決定
					g_keyObj[`div${ptnName}`] = g_keyObj[`chara${newKey}_0`].length;
				}

				// ステップゾーン位置の最終番号
				if (tmpDivPtn.length > 1) {
					g_keyObj[`divMax${ptnName}`] = setVal(tmpDivPtn[1], -1, C_TYP_FLOAT);
				}
			}
		}

		// ステップゾーン位置 (posX_Y)
		newKeyMultiParam(newKey, `pos`, toFloat, {
			loopFunc: (k, keyheader) => {
				const ptnName = `${newKey}_${k + dfPtnNum}`;
				if (g_keyObj[`divMax${ptnName}`] === undefined || g_keyObj[`divMax${ptnName}`] === -1) {
					const posLength = g_keyObj[`${keyheader}_${k + dfPtnNum}`].length;
					g_keyObj[`divMax${ptnName}`] = g_keyObj[`${keyheader}_${k + dfPtnNum}`][posLength - 1] + 1;
				}
			}
		});
		if (_dosObj[`pos${newKey}`] === undefined) {
			for (let k = 0; k < tmpMinPatterns; k++) {
				const ptnName = `${newKey}_${k + dfPtnNum}`;
				if (g_keyObj[`color${ptnName}`] !== undefined) {
					g_keyObj[`pos${ptnName}`] = [...Array(g_keyObj[`color${ptnName}`].length).keys()].map(i => i);
				}
			}
		}

		// ステップゾーン間隔 (blankX_Y)
		newKeySingleParam(newKey, `blank`, C_TYP_FLOAT);

		// 矢印群の倍率 (scaleX_Y)
		newKeySingleParam(newKey, `scale`, C_TYP_FLOAT);

		// プレイ中ショートカット：リトライ (keyRetryX_Y)
		newKeySingleParam(newKey, `keyRetry`, C_TYP_NUMBER);

		// プレイ中ショートカット：タイトルバック (keyTitleBackX_Y)
		newKeySingleParam(newKey, `keyTitleBack`, C_TYP_NUMBER);

		// 別キーフラグ (transKeyX_Y)
		newKeySingleParam(newKey, `transKey`, C_TYP_STRING);

		// シャッフルグループ (shuffleX_Y)
		newKeyMultiParam(newKey, `shuffle`, toNumber, {
			loopFunc: (k, keyheader) => copyChildArray(k, keyheader),
		});

		// スクロールパターン (scrollX_Y)
		// |scroll(newKey)=Cross::1,1,-1,-1,-1,1,1/Split::1,1,1,-1,-1,-1,-1$...|
		newKeyPairParam(newKey, `scroll`, `scrollDir`, `---`, 1);

		// アシストパターン (assistX_Y)
		// |assist(newKey)=Onigiri::0,0,0,0,0,1/AA::0,0,0,1,1,1$...|
		newKeyPairParam(newKey, `assist`, `assistPos`);
	});

	return keyExtraList;
};

/*-----------------------------------------------------------*/
/* Scene : TITLE [melon] */
/*-----------------------------------------------------------*/

/**
 *  タイトル画面初期化
 */
const titleInit = _ => {

	clearWindow(true);
	g_currentPage = `title`;

	// タイトル用フレーム初期化
	g_scoreObj.titleFrameNum = 0;
	g_scoreObj.backTitleFrameNum = 0;
	g_scoreObj.maskTitleFrameNum = 0;

	// タイトル用ループカウンター
	g_scoreObj.backTitleLoopCount = 0;
	g_scoreObj.maskTitleLoopCount = 0;

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;

	// 譜面初期情報ロード許可フラグ
	// (初回読み込み時はローカルストレージのロードが必要なため、
	//  ローカルストレージ保存時はフラグを解除しない)
	if (!g_stateObj.dataSaveFlg || hasVal(g_keyObj[`transKey${keyCtrlPtn}`])) {
		g_canLoadDifInfoFlg = false;
	}
	const divRoot = document.querySelector(`#divRoot`);

	// 曲時間制御変数
	let thisTime;
	let buffTime;
	let titleStartTime = performance.now();

	// 背景の矢印オブジェクトを表示
	if (!g_headerObj.customTitleArrowUse) {
		divRoot.appendChild(
			createColorObject2(`lblArrow`, {
				x: (g_sWidth - 500) / 2, y: -15 + (g_sHeight - 500) / 2,
				w: 500, h: 500,
				background: makeColorGradation(g_headerObj.titlearrowgrds[0] || g_headerObj.setColorOrg[0], {
					_defaultColorgrd: [false, `#eeeeee`],
					_objType: `titleArrow`,
				}), rotate: 180,
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
		const titlefontsizes = (g_headerObj.titlesize !== `` ? g_headerObj.titlesize.split(`$`).join(`,`).split(`,`) : [titlefontsize, titlefontsize]);
		const titlefontsize1 = setIntVal(titlefontsizes[0], titlefontsize);
		const titlefontsize2 = setIntVal(titlefontsizes[1], titlefontsize1);

		// 変数 titlelineheight の定義 (使用例： |titlelineheight=50|)
		const titlelineheight = (g_headerObj.titlelineheight !== `` ? g_headerObj.titlelineheight - (titlefontsize2 + 10) : 0);

		let txtAnimations = [``, ``];
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
				font-size:${titlefontsize2}px;
				position:relative;left:${g_headerObj.titlepos[1][0]}px;
				top:${g_headerObj.titlepos[1][1] + titlelineheight}px;
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
	const versionName = `&copy; 2018-${g_revisedDate.slice(0, 4)} ティックル, CW ${g_version}${g_alphaVersion}${customVersion}${releaseDate}`;

	let reloadFlg = false;
	const getLinkSiz = _name => getFontSize(_name, g_sWidth / 2 - 20, getBasicFont(), C_LBL_LNKSIZE, 12);

	/**
	 * クレジット用リンク作成
	 * @param {string} _id 
	 * @param {string} _text 
	 * @param {string} _url 
	 * @returns 
	 */
	const createCreditBtn = (_id, _text, _url) =>
		createCss2Button(_id, _text, _ => true,
			Object.assign(g_lblPosObj[_id], { siz: getLinkSiz(_text), resetFunc: _ => openLink(_url) }), g_cssObj.button_Default);

	// ボタン描画
	multiAppend(divRoot,

		// Click Here
		createCss2Button(`btnStart`, g_lblNameObj.clickHere, _ => clearTimeout(g_timeoutEvtTitleId), {
			w: g_sWidth, siz: C_LBL_TITLESIZE, resetFunc: _ => optionInit(),
		}, g_cssObj.button_Start),

		// Reset
		createCss2Button(`btnReset`, g_lblNameObj.dataReset, _ => {
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
			resetFunc: _ => {
				if (reloadFlg) {
					location.reload();
				}
			},
		}), g_cssObj.button_Reset),

		// ロケール切替
		createCss2Button(`btnReload`, g_localeObj.val, _ => true,
			Object.assign(g_lblPosObj.btnReload, {
				resetFunc: _ => {
					g_localeObj.num = (++g_localeObj.num) % g_localeObj.list.length;
					g_langStorage.locale = g_localeObj.list[g_localeObj.num];
					localStorage.setItem(`danoni-locale`, JSON.stringify(g_langStorage));
					location.reload();
				},
			}), g_cssObj.button_Start),

		// ヘルプ
		createCss2Button(`btnHelp`, `?`, _ => true,
			Object.assign(g_lblPosObj.btnHelp, {
				resetFunc: _ => openLink(`https://github.com/cwtickle/danoniplus/wiki/AboutGameSystem`),
			}), g_cssObj.button_Setting),

		// 製作者表示
		createCreditBtn(`lnkMaker`, `${g_lblNameObj.maker}: ${g_headerObj.tuningInit}`, g_headerObj.creatorUrl),

		// アーティスト表示
		createCreditBtn(`lnkArtist`, `${g_lblNameObj.artist}: ${g_headerObj.artistName}`, g_headerObj.artistUrl),

		// バージョン描画
		createCss2Button(`lnkVersion`, versionName, _ => true,
			Object.assign(g_lblPosObj.lnkVersion, {
				siz: getFontSize(versionName, g_sWidth * 3 / 4 - 20, getBasicFont(), 12),
				resetFunc: _ => openLink(`https://github.com/cwtickle/danoniplus`),
			}), g_cssObj.button_Tweet),

		// セキュリティリンク
		createCss2Button(`lnkComparison`, `&#x1f6e1;`, _ => true,
			Object.assign(g_lblPosObj.lnkComparison, {
				resetFunc: _ => openLink(`https://github.com/cwtickle/danoniplus/security/policy`),
			}), g_cssObj.button_Tweet),
	);

	// コメントエリア作成
	if (g_headerObj.commentVal !== ``) {

		// コメント文の加工
		const comments = g_headerObj.commentVal.split(`}`).join(`{`).split(`{`);
		let convCommentVal = ``;
		for (let j = 0; j < comments.length; j += 2) {
			convCommentVal += escapeHtmlForEnabledTag(comments[j]);
			convCommentVal += setVal(comments[j + 1], ``, C_TYP_CALC);
		}

		if (g_headerObj.commentExternal) {
			if (document.querySelector(`#commentArea`) !== null) {
				commentArea.innerHTML = convCommentVal;
			}
		} else {
			multiAppend(divRoot,
				createDivCss2Label(`lblComment`, convCommentVal, g_lblPosObj.lblComment),
				createCss2Button(`btnComment`, g_lblNameObj.comment, _ => {
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
	const flowTitleTimeline = _ => {

		// ユーザカスタムイベント(フレーム毎)
		g_customJsObj.titleEnterFrame.forEach(func => func());

		// 背景・マスクモーション
		drawTitleResultMotion(g_currentPage);

		thisTime = performance.now();
		buffTime = thisTime - titleStartTime - g_scoreObj.titleFrameNum * 1000 / g_fps;

		g_scoreObj.titleFrameNum++;
		g_scoreObj.backTitleFrameNum++;
		g_scoreObj.maskTitleFrameNum++;
		g_timeoutEvtTitleId = setTimeout(_ => flowTitleTimeline(), 1000 / g_fps - buffTime);
	};

	g_timeoutEvtTitleId = setTimeout(_ => flowTitleTimeline(), 1000 / g_fps);

	// キー操作イベント（デフォルト）
	setShortcutEvent(g_currentPage, _ => true, { dfEvtFlg: true });

	document.oncontextmenu = _ => true;
	divRoot.oncontextmenu = _ => false;

	g_skinJsObj.title.forEach(func => func());
};

/**
 * 警告用ウィンドウ（汎用）を表示
 * @param {string} _text 
 * @param {object} _options resetFlg: 警告リストをクリアして再作成, backBtnUse: Backボタンを付与
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
		divRoot.appendChild(createCss2Button(`btnBack`, g_lblNameObj.b_back, _ => true, {
			resetFunc: _ => titleInit(),
		}, g_cssObj.button_Back));
	}
};

/**
 * お知らせウィンドウ（汎用）を表示
 * @param {string} _text 
 */
const makeInfoWindow = (_text, _animationName = ``, _backColor = `#ccccff`) => {
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
 */
const setWindowStyle = (_text, _bkColor, _textColor, _align = C_ALIGN_LEFT) => {

	deleteDiv(divRoot, `lblWarning`);

	// ウィンドウ枠の行を取得するために一時的な枠を作成
	const tmplbl = createDivCss2Label(`lblTmpWarning`, _text, {
		x: 0, y: 70, w: g_sWidth, h: 20, siz: C_SIZ_MAIN, lineHeight: `15px`, fontFamily: getBasicFont(),
	})
	divRoot.appendChild(tmplbl);
	const range = new Range();
	range.selectNode(tmplbl);

	// ウィンドウ枠の行を元に縦の長さを決定(150pxを超えた場合は縦スクロールバーを付与)
	const warnHeight = Math.min(150, Math.max(range.getClientRects().length,
		_text.split(`<br>`).length + _text.split(`<p>`).length - 1) * 21);
	const lbl = createDivCss2Label(`lblWarning`, _text, {
		x: 0, y: 70, w: g_sWidth, h: warnHeight, siz: C_SIZ_MAIN, backgroundColor: _bkColor,
		opacity: 0.9, lineHeight: `15px`, color: _textColor, align: _align, fontFamily: getBasicFont(),
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
		g_stateObj.dataSaveFlg = !g_stateObj.dataSaveFlg;
		const [from, to] = (g_stateObj.dataSaveFlg ? [C_FLG_OFF, C_FLG_ON] : [C_FLG_ON, C_FLG_OFF]);
		evt.target.classList.replace(g_cssObj[`button_${from}`], g_cssObj[`button_${to}`]);
	};

	multiAppend(divRoot,

		// タイトル画面へ戻る
		createCss2Button(`btnBack`, g_lblNameObj.b_back, _ => true,
			Object.assign(g_lblPosObj.btnBack, {
				animationName: (g_initialFlg ? `` : `smallToNormalY`), resetFunc: _ => titleInit(),
			}), g_cssObj.button_Back),

		// キーコンフィグ画面へ移動
		createCss2Button(`btnKeyConfig`, g_lblNameObj.b_keyConfig, _ => true,
			Object.assign(g_lblPosObj.btnKeyConfig, {
				animationName: (g_initialFlg ? `` : `smallToNormalY`), resetFunc: _ => keyConfigInit(`Main`),
			}), g_cssObj.button_Setting),

		// プレイ開始
		makePlayButton(_ => loadMusic()),

		// Display設定へ移動
		createCss2Button(`btn${_labelName}`, `>`, _ => true,
			Object.assign(g_lblPosObj.btnSwitchSetting, {
				title: g_msgObj[`to${_labelName}`], resetFunc: _ => g_jumpSettingWindow[g_currentPage](),
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
 */
const makePlayButton = _func => createCss2Button(`btnPlay`, g_lblNameObj.b_play, _ => true,
	Object.assign(g_lblPosObj.btnPlay, {
		animationName: (g_initialFlg ? `` : `smallToNormalY`),
		resetFunc: _func,
	}), g_cssObj.button_Next);

/**
 * 設定・オプション画面初期化
 */
const optionInit = _ => {

	clearWindow(true);
	const divRoot = document.querySelector(`#divRoot`);
	g_baseDisp = `Settings`;
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
	setShortcutEvent(g_currentPage, _ => true, { dfEvtFlg: true });
	document.oncontextmenu = _ => true;
	g_initialFlg = true;

	g_skinJsObj.option.forEach(func => func());
};

/**
 * 設定画面用スプライトリストの作成
 * @param {array} _settingList (設定名、縦位置、縦位置差分、幅差分、高さ差分)を設定別にリスト化
 */
const setSpriteList = _settingList => {
	const optionWidth = (g_sWidth - 450) / 2;
	const spriteList = [];
	_settingList.forEach(setting =>
		spriteList[setting[0]] = createEmptySprite(optionsprite, `${setting[0]}Sprite`, {
			x: 25, y: setting[1] * C_LEN_SETLBL_HEIGHT + setting[2] + 20,
			w: optionWidth + setting[3], h: C_LEN_SETLBL_HEIGHT + setting[4],
		}));
	return spriteList;
};

/**
 * 設定ウィンドウの作成
 * @param {string} _sprite 
 * @returns 
 */
const createOptionSprite = _sprite => createEmptySprite(_sprite, `optionsprite`, g_windowObj.optionSprite);

/**
 * スライダー共通処理
 * @param {object} _slider 
 * @param {object} _link 
 * @returns 
 */
const inputSlider = (_slider, _link) => {
	const value = parseInt(_slider.value);
	_link.textContent = `${value}${g_lblNameObj.percent}`;
	return value;
};

/**
 * 設定・オプション画面のラベル・ボタン処理の描画
 * @param {Object} _sprite 基準とするスプライト(ここで指定する座標は、そのスプライトからの相対位置)
 */
const createOptionWindow = _sprite => {

	// 各ボタン用のスプライトを作成
	const optionsprite = createOptionSprite(_sprite);

	// 設定名、縦位置、縦位置差分、幅差分、高さ差分
	const settingList = [
		[`difficulty`, 0, -5, 0, 10],
		[`speed`, 2, 0, 0, 0],
		[`motion`, 3, 0, 0, 0],
		[`reverse`, 4, 0, 0, 0],
		[`scroll`, 4, 0, 0, 0],
		[`shuffle`, 5.5, 0, 0, 0],
		[`autoPlay`, 6.5, 0, 0, 0],
		[`gauge`, 7.5, 0, 0, 0],
		[`adjustment`, 10, 0, 0, 0],
		[`fadein`, 11, 0, 0, 0],
		[`volume`, 12, 0, 0, 0],
	];

	// 設定毎に個別のスプライトを作成し、その中にラベル・ボタン類を配置
	const spriteList = setSpriteList(settingList);

	// ---------------------------------------------------
	// 難易度 (Difficulty)
	// 縦位置: 0 
	spriteList.difficulty.appendChild(createLblSetting(`Difficulty`, -5));

	/**
	 * 譜面変更セレクターの削除
	 */
	const resetDifWindow = _ => {
		if (document.querySelector(`#difList`) !== null) {
			deleteChildspriteAll(`difList`);
			[`difList`, `difCover`, `btnDifU`, `btnDifD`].forEach(obj => optionsprite.removeChild(document.getElementById(obj)));
			g_currentPage = `option`;
			setShortcutEvent(g_currentPage, _ => true, { displayFlg: false, dfEvtFlg: true });
		}
	};

	/**
	 * 譜面選択処理
	 * @param {number} _scrollNum 
	 */
	const nextDifficulty = (_scrollNum = 1) => {
		g_keyObj.prevKey = g_headerObj.keyLabels[g_stateObj.scoreId];
		g_stateObj.scoreId = nextPos(g_stateObj.scoreId, _scrollNum, g_headerObj.keyLabels.length);
		setDifficulty(true);
		resetDifWindow();
	};

	/**
	 * 譜面リストの作成
	 * @param {object} _difList 
	 * @param {string} _targetKey 
	 */
	const makeDifList = (_difList, _targetKey = ``) => {
		let k = 0;
		let pos = 0;
		g_headerObj.keyLabels.forEach((keyLabel, j) => {
			if (_targetKey === `` || keyLabel === _targetKey) {
				let text = `${getKeyName(keyLabel)} / ${g_headerObj.difLabels[j]}`;
				if (g_headerObj.makerView) {
					text += ` (${g_headerObj.creatorNames[j]})`;
				}
				_difList.appendChild(makeDifLblCssButton(`dif${k}`, text, k, _ => {
					nextDifficulty(j - g_stateObj.scoreId);
				}, { btnStyle: (j === g_stateObj.scoreId ? `Setting` : `Default`) }));
				if (j === g_stateObj.scoreId) {
					pos = k + 6;
				}
				k++;
			}
		});
		const overlength = pos * C_LEN_SETLBL_HEIGHT - parseInt(difList.style.height);
		difList.scrollTop = (overlength > 0 ? overlength : 0);
	};

	/**
	 * 譜面セレクター位置の変更ボタン
	 * @param {number} _scrollNum 
	 * @returns 
	 */
	const makeDifBtn = (_scrollNum = 1) => {
		const dir = _scrollNum === 1 ? `D` : `U`;
		return createCss2Button(`btnDif${dir}`, g_settingBtnObj.chara[dir], _ => {
			do {
				g_stateObj.scoreId = nextPos(g_stateObj.scoreId, _scrollNum, g_headerObj.keyLabels.length);
			} while (g_stateObj.filterKeys !== `` && g_stateObj.filterKeys !== g_headerObj.keyLabels[g_stateObj.scoreId]);
			setDifficulty(true);
			deleteChildspriteAll(`difList`);
			makeDifList(difList, g_stateObj.filterKeys);
		}, {
			x: 430 + _scrollNum * 10, y: 40, w: 20, h: 20, siz: C_SIZ_JDGCNTS,
		}, g_cssObj.button_Mini);
	};

	/**
	 * 譜面変更セレクターの作成・再作成
	 * @param {string} _key
	 */
	const createDifWindow = (_key = ``) => {
		g_currentPage = `difSelector`;
		setShortcutEvent(g_currentPage);
		const difList = createEmptySprite(optionsprite, `difList`, g_windowObj.difList, g_cssObj.settings_DifSelector);
		const difCover = createEmptySprite(optionsprite, `difCover`, g_windowObj.difCover, g_cssObj.settings_DifSelector);

		// リスト再作成
		makeDifList(difList, _key);

		// ランダム選択
		difCover.appendChild(
			makeDifLblCssButton(`difRandom`, `RANDOM`, 0, _ => {
				nextDifficulty(Math.floor(Math.random() * g_headerObj.keyLabels.length));
			}, { w: C_LEN_DIFCOVER_WIDTH })
		);

		// 全リスト
		difCover.appendChild(
			makeDifLblCssButton(`keyFilter`, `ALL`, 1.5, _ => {
				resetDifWindow();
				g_stateObj.filterKeys = ``;
				createDifWindow();
			}, { w: C_LEN_DIFCOVER_WIDTH, btnStyle: (g_stateObj.filterKeys === `` ? `Setting` : `Default`) })
		);

		// キー別フィルタボタン作成
		let pos = 0;
		g_headerObj.keyLists.forEach((targetKey, m) => {
			difCover.appendChild(
				makeDifLblCssButton(`keyFilter${m}`, `${getKeyName(targetKey)} key`, m + 2.5, _ => {
					resetDifWindow();
					g_stateObj.filterKeys = targetKey;
					createDifWindow(targetKey);
				}, { w: C_LEN_DIFCOVER_WIDTH, btnStyle: (g_stateObj.filterKeys === targetKey ? `Setting` : `Default`) })
			);
			if (g_stateObj.filterKeys === targetKey) {
				pos = m + 9;
			}
		});
		const overlength = pos * C_LEN_SETLBL_HEIGHT - parseInt(difCover.style.height);
		difCover.scrollTop = (overlength > 0 ? overlength : 0);

		multiAppend(optionsprite, makeDifBtn(-1), makeDifBtn());
	};

	const changeDifficulty = (_num = 1) => {
		if (g_headerObj.difSelectorUse) {
			g_stateObj.filterKeys = ``;
			if (document.querySelector(`#difList`) === null) {
				createDifWindow();
			} else {
				resetDifWindow();
			}
		} else {
			nextDifficulty(_num);
		}
	};
	const lnkDifficulty = makeSettingLblCssButton(`lnkDifficulty`, ``, 0, _ => changeDifficulty(), {
		y: -10, h: C_LEN_SETLBL_HEIGHT + 10, cxtFunc: _ => changeDifficulty(-1),
	});

	// 譜面選択ボタン（メイン、右回し、左回し）
	multiAppend(spriteList.difficulty,
		lnkDifficulty,
		makeMiniCssButton(`lnkDifficulty`, `R`, 0, _ => nextDifficulty(), { dy: -10, dh: 10 }),
		makeMiniCssButton(`lnkDifficulty`, `L`, 0, _ => nextDifficulty(-1), { dy: -10, dh: 10 }),
	)
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
		skipTerms: [20, 5, 1], hiddenBtn: true, scLabel: g_lblNameObj.sc_speed, roundNum: 5,
		unitName: ` ${g_lblNameObj.multi}`,
	});

	/**
	 * 譜面明細子画面・グラフの作成
	 * @param {string} _name 
	 * @param {boolean} _graphUseFlg
	 */
	const createScoreDetail = (_name, _graphUseFlg = true) => {
		const detailObj = createEmptySprite(scoreDetail, `detail${_name}`, g_windowObj.detailObj);

		if (_graphUseFlg) {
			const graphObj = document.createElement(`canvas`);
			const textBaseObj = document.querySelector(`#lnkDifficulty`);
			const bkColor = window.getComputedStyle(textBaseObj, ``).backgroundColor;

			graphObj.id = `graph${_name}`;
			graphObj.width = C_LEN_GRAPH_WIDTH;
			graphObj.height = C_LEN_GRAPH_HEIGHT;
			graphObj.style.left = `125px`;
			graphObj.style.top = `0px`;
			graphObj.style.position = `absolute`;
			graphObj.style.background = bkColor;
			graphObj.style.border = `dotted 2px`;

			detailObj.appendChild(graphObj);
		}

		return detailObj;
	};

	if (g_headerObj.scoreDetailUse) {
		spriteList.speed.appendChild(
			createCss2Button(`btnGraph`, `i`, _ => true, {
				x: -25, y: -60, w: 30, h: 30, siz: C_SIZ_JDGCHARA, title: g_msgObj.graph,
				resetFunc: _ => setScoreDetail(), cxtFunc: _ => setScoreDetail(),
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
			g_stateObj.scoreDetail = g_settings.scoreDetails[_val];
			$id(`detail${g_stateObj.scoreDetail}`).visibility = `visible`;
			document.getElementById(`lnk${g_stateObj.scoreDetail}G`).classList.replace(g_cssObj.button_Default, g_cssObj.button_Setting);
		};

		multiAppend(scoreDetail,
			createScoreDetail(`Speed`),
			createScoreDetail(`Density`),
			createScoreDetail(`ToolDif`, false),
		);
		g_settings.scoreDetails.forEach((sd, j) => {
			scoreDetail.appendChild(
				makeDifLblCssButton(`lnk${sd}G`, getStgDetailName(sd), j, _ => changeScoreDetail(j), { w: C_LEN_DIFCOVER_WIDTH, btnStyle: (g_stateObj.scoreDetail === sd ? `Setting` : `Default`) })
			);
			createScText(document.getElementById(`lnk${sd}G`), `${sd}G`, { targetLabel: `lnk${sd}G`, x: -10 });
		});
	}

	/**
	 * 譜面明細表示／非表示ボタンの処理
	 */
	const setScoreDetail = _ => {
		if (g_currentPage === `difSelector`) {
			resetDifWindow();
			g_stateObj.scoreDetailViewFlg = false;
		}
		const scoreDetail = document.querySelector(`#scoreDetail`);
		const detailObj = document.querySelector(`#detail${g_stateObj.scoreDetail}`);
		const visibles = [`hidden`, `visible`];

		g_stateObj.scoreDetailViewFlg = !g_stateObj.scoreDetailViewFlg;
		scoreDetail.style.visibility = visibles[Number(g_stateObj.scoreDetailViewFlg)];
		detailObj.style.visibility = visibles[Number(g_stateObj.scoreDetailViewFlg)];
	};

	/**
	 * 譜面基礎データの取得
	 * @param {number} _scoreId 
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
			speed: { frame: [0], speed: [1], cnt: 0, strokeColor: C_CLR_SPEEDGRAPH_SPEED },
			boost: { frame: [0], speed: [1], cnt: 0, strokeColor: C_CLR_SPEEDGRAPH_BOOST }
		};

		Object.keys(speedObj).forEach(speedType => {
			let frame = speedObj[speedType].frame;
			let speed = speedObj[speedType].speed;
			const speedData = g_detailObj[`${speedType}Data`][_scoreId];

			if (speedData !== undefined) {
				for (let i = 0; i < speedData.length; i += 2) {
					if (speedData[i] >= startFrame) {
						frame.push(speedData[i] - startFrame);
						speed.push(speedData[i + 1]);
					}
					speedObj[speedType].cnt++;
				}
				frame.push(playingFrame);
				speed.push(speed[speed.length - 1]);
			}
		});

		const canvas = document.querySelector(`#graphSpeed`);
		const context = canvas.getContext(`2d`);
		drawBaseLine(context);

		Object.keys(speedObj).forEach((speedType, j) => {
			context.beginPath();
			let preY;

			for (let i = 0; i < speedObj[speedType].frame.length; i++) {
				const x = speedObj[speedType].frame[i] * (C_LEN_GRAPH_WIDTH - 30) / playingFrame + 30;
				const y = (speedObj[speedType].speed[i] - 1) * -90 + 105;

				context.lineTo(x, preY);
				context.lineTo(x, y);
				preY = y;
			}

			context.lineWidth = 1;
			context.strokeStyle = speedObj[speedType].strokeColor;
			context.stroke();

			const lineX = (speedType === `speed`) ? 125 : 210;
			context.beginPath();
			context.moveTo(lineX, 215);
			context.lineTo(lineX + 30, 215);
			context.stroke();
			context.font = `${C_SIZ_DIFSELECTOR}px ${getBasicFont()}`;
			context.fillText(speedType, lineX + 35, 218);

			updateScoreDetailLabel(`Speed`, `${speedType}S`, speedObj[speedType].cnt, j, g_lblNameObj[`s_${speedType}`]);
		});
	};

	/**
	 * 譜面密度グラフの描画
	 * @param {number} _scoreId 
	 */
	const drawDensityGraph = _scoreId => {

		const canvas = document.querySelector(`#graphDensity`);
		const context = canvas.getContext(`2d`);
		drawBaseLine(context);
		for (let j = 0; j < C_LEN_DENSITY_DIVISION; j++) {
			context.beginPath();
			[``, `2Push`, `3Push`].forEach(val => {
				context.fillStyle = (j === g_detailObj.maxDensity[_scoreId] ? g_graphColorObj[`max${val}`] : g_graphColorObj[`default${val}`]);
				context.fillRect(16 * j * 16 / C_LEN_DENSITY_DIVISION + 30, 195 - 9 * g_detailObj[`density${val}Data`][_scoreId][j] / 10,
					15.5 * 16 / C_LEN_DENSITY_DIVISION, 9 * g_detailObj[`density${val}Diff`][_scoreId][j] / 10
				);
			});
			context.stroke();
		}

		const lineNames = [`1Push`, `2Push`, `3Push+`];
		Object.keys(g_graphColorObj).filter(val => val.indexOf(`max`) !== -1).forEach((val, j) => {
			const lineX = 70 + j * 70;

			context.beginPath();
			context.lineWidth = 3;
			context.fillStyle = g_rankObj.rankColorAllPerfect;
			context.strokeStyle = g_graphColorObj[val];
			context.moveTo(lineX, 215);
			context.lineTo(lineX + 20, 215);
			context.stroke();
			context.font = `${C_SIZ_DIFSELECTOR}px ${getBasicFont()}`;
			context.fillText(lineNames[j], lineX + 20, 218);
		});

		const obj = getScoreBaseData(_scoreId);
		updateScoreDetailLabel(`Density`, `APM`, obj.apm, 0, g_lblNameObj.s_apm);
		updateScoreDetailLabel(`Density`, `Time`, obj.playingTime, 1, g_lblNameObj.s_time);
		updateScoreDetailLabel(`Density`, `Arrow`, obj.arrowCnts, 3, g_lblNameObj.s_arrow);
		updateScoreDetailLabel(`Density`, `Frz`, obj.frzCnts, 4, g_lblNameObj.s_frz);
	};

	/**
	 * 譜面明細内の補足情報の登録・更新
	 * @param {string} _name 表示する譜面明細のラベル
	 * @param {string} _label 
	 * @param {string} _value 
	 * @param {number} _pos 表示位置
	 * @param {string} _labelname
	 */
	const updateScoreDetailLabel = (_name, _label, _value, _pos = 0, _labelname = _label) => {
		const baseLabel = (_bLabel, _bLabelname, _bAlign) =>
			document.querySelector(`#detail${_name}`).appendChild(
				createDivCss2Label(`${_bLabel}`, `${_bLabelname}`, {
					x: 10, y: 105 + _pos * 20, w: 100, h: 20, siz: C_SIZ_DIFSELECTOR, align: _bAlign,
				})
			);
		if (document.querySelector(`#data${_label}`) === null) {
			baseLabel(`lbl${_label}`, `${_labelname}`, C_ALIGN_LEFT);
			baseLabel(`data${_label}`, `${_value}`, C_ALIGN_RIGHT);
		} else {
			document.querySelector(`#data${_label}`).textContent = `${_value}`;
		}
	};

	/**
	 * グラフの縦軸を描画
	 * @param {object} _context 
	 * @param {number} _resolution 
	 */
	const drawBaseLine = (_context, _resolution = 10) => {
		_context.clearRect(0, 0, C_LEN_GRAPH_WIDTH, C_LEN_GRAPH_HEIGHT);

		for (let j = 0; j <= 2 * _resolution; j += 5) {
			drawLine(_context, j / _resolution, `main`, 2);
			for (let k = 1; k < 5; k++) {
				drawLine(_context, (j + k) / _resolution, `sub`, 2);
			}
		}
	};

	/**
	 * グラフ上に目盛を表示
	 * @param {object} _context 
	 * @param {number} _y 
	 * @param {string} _lineType 
	 * @param {number} _fixed
	 */
	const drawLine = (_context, _y, _lineType, _fixed = 0) => {
		const lineY = (_y - 1) * -90 + 105;
		_context.beginPath();
		_context.moveTo(30, lineY);
		_context.lineTo(C_LEN_GRAPH_WIDTH, lineY);
		_context.lineWidth = 1;

		if (_lineType === `main`) {
			const textBaseObj = document.querySelector(`#lnkDifficulty`);
			const textColor = window.getComputedStyle(textBaseObj, ``).color;
			_context.strokeStyle = textColor;
			_context.font = `12px ${getBasicFont()}`;
			_context.fillStyle = textColor;
			_context.fillText(_y.toFixed(_fixed), 0, lineY + 4);
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
		const detailToolDif = document.querySelector(`#detailToolDif`);
		/**
		 * 譜面の難易度情報ラベルの作成
		 * @param {string} _lbl 
		 * @param {string} _data 
		 * @param {object} _obj 
		 */
		const makeDifInfoLabel = (_lbl, _data, { x = 130, y = 25, w = 125, h = 35, siz = C_SIZ_DIFSELECTOR, ...rest } = {}) =>
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
			makeDifLblCssButton(`lnkDifInfo`, g_lblNameObj.s_print, 8, _ => {
				copyTextToClipboard(
					`****** ${g_lblNameObj.s_printTitle} [${g_version}] ******\r\n\r\n`
					+ `\t${g_lblNameObj.s_printHeader}\r\n\r\n${printData}`, g_msgInfoObj.I_0003
				);
			}, g_lblPosObj.lnkDifInfo, g_cssObj.button_RevON),
		);
		createScText(lnkDifInfo, `DifInfo`, { targetLabel: `lnkDifInfo`, x: -10 });
	};

	/**
	 * 譜面の難易度情報更新
	 * @param {number} _scoreId 
	 */
	const makeDifInfo = _scoreId => {

		const arrowCnts = sumData(g_detailObj.arrowCnt[_scoreId]);
		const frzCnts = sumData(g_detailObj.frzCnt[_scoreId]);
		const push3CntStr = (g_detailObj.toolDif[_scoreId].push3.length === 0 ? `None` : `(${g_detailObj.toolDif[_scoreId].push3})`);

		if (document.querySelector(`#lblTooldif`) === null) {
			makeDifInfoLabels(_scoreId);
		}
		dataTooldif.textContent = g_detailObj.toolDif[_scoreId].tool;
		dataDouji.textContent = g_detailObj.toolDif[_scoreId].douji;
		dataTate.textContent = g_detailObj.toolDif[_scoreId].tate;
		lblArrowInfo2.innerHTML = g_lblNameObj.s_linecnts.split(`{0}`).join(g_detailObj.toolDif[_scoreId].push3cnt);
		dataArrowInfo.innerHTML = `${arrowCnts + frzCnts} <span style="font-size:${C_SIZ_DIFSELECTOR}px;">(${arrowCnts} + ${frzCnts})</span>`;
		dataArrowInfo2.innerHTML = `<br>(${g_detailObj.arrowCnt[_scoreId]})<br><br>
			(${g_detailObj.frzCnt[_scoreId]})<br><br>
			${push3CntStr}`.split(`,`).join(`/`);
	};

	// ---------------------------------------------------
	// 速度モーション (Motion)
	// 縦位置: 3
	createGeneralSetting(spriteList.motion, `motion`);

	// ---------------------------------------------------
	// リバース (Reverse) / スクロール (Scroll)
	// 縦位置: 4
	createGeneralSetting(spriteList.reverse, `reverse`, {
		addRFunc: _ => {
			if (g_headerObj.scrollUse && g_settings.scrolls.length > 1) {
				setReverseView(document.getElementById(`btnReverse`));
			}
		}
	});
	if (g_headerObj.scrollUse) {
		createGeneralSetting(spriteList.scroll, `scroll`, { scLabel: g_lblNameObj.sc_scroll });
		[$id(`lnkScroll`).left, $id(`lnkScroll`).width] = [
			`${parseFloat($id(`lnkScroll`).left) + 90}px`, `${parseFloat($id(`lnkScroll`).width) - 90}px`
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

	const setReverse = _btn => {
		g_settings.reverseNum = (g_settings.reverseNum + 1) % 2;
		g_stateObj.reverse = g_settings.reverses[g_settings.reverseNum];
		setReverseView(_btn);
	};

	const setReverseView = _btn => {
		_btn.classList.replace(g_cssObj[`button_Rev${g_settings.reverses[(g_settings.reverseNum + 1) % 2]}`],
			g_cssObj[`button_Rev${g_settings.reverses[g_settings.reverseNum]}`]);
		_btn.textContent = `${g_lblNameObj.Reverse}:${getStgDetailName(g_stateObj.reverse)}`;
	};

	// ---------------------------------------------------
	// ミラー・ランダム (Shuffle)
	// 縦位置: 5.5
	createGeneralSetting(spriteList.shuffle, `shuffle`);

	// ---------------------------------------------------
	// 鑑賞モード設定 (AutoPlay)
	// 縦位置: 6.5
	createGeneralSetting(spriteList.autoPlay, `autoPlay`);

	// ---------------------------------------------------
	// ゲージ設定 (Gauge)
	// 縦位置: 7.5
	spriteList.gauge.appendChild(createLblSetting(`Gauge`));

	// ゲージ設定詳細　縦位置: ゲージ設定+1
	spriteList.gauge.appendChild(createDivCss2Label(`lblGauge2`, ``, g_lblPosObj.lblGauge2));

	/**
	 * ゲージ設定メイン
	 * @param {number} _scrollNum 
	 */
	const setGauge = _scrollNum => {

		// カーソルを動かさない場合は先にゲージ設定をリロード
		if (_scrollNum === 0) {
			gaugeChange(g_settings.gaugeNum);
		}
		setSetting(_scrollNum, `gauge`);

		// カーソルを動かす場合は設定変更後にゲージ設定を再設定
		if (_scrollNum !== 0) {
			gaugeChange(g_settings.gaugeNum);
		}
		lblGauge2.innerHTML = gaugeFormat(g_stateObj.lifeMode,
			g_stateObj.lifeBorder, g_stateObj.lifeRcv, g_stateObj.lifeDmg, g_stateObj.lifeInit, g_stateObj.lifeVariable);
	};

	/**
	 * ゲージ設定の切替処理
	 * @param {number} _gaugeNum 
	 */
	const gaugeChange = _gaugeNum => {
		const tmpScoreId = g_stateObj.scoreId;

		/**
		 * ゲージ詳細変更
		 * @param {object} _baseProperty 
		 * @param {string} _setProperty 
		 * @param {number} _magnification 
		 */
		const setLife = (_baseProperty, _setProperty, _magnification = 1) => {
			if (setVal(_baseProperty[tmpScoreId], ``, C_TYP_FLOAT) !== ``) {
				g_stateObj[_setProperty] = _baseProperty[tmpScoreId] * _magnification;
			}
		};

		/**
		 * ゲージ詳細一括変更
		 * @param {object} _baseObj 
		 * @param {object} _obj 
		 */
		const setLifeCategory = (_baseObj, { _magInit = 1, _magRcv = 1, _magDmg = 1 } = {}) => {
			setLife(_baseObj.lifeInits, `lifeInit`, _magInit);
			setLife(_baseObj.lifeRecoverys, `lifeRcv`, _magRcv);
			setLife(_baseObj.lifeDamages, `lifeDmg`, _magDmg);
		};

		/**
		 * ライフモード切替
		 * @param {object} _baseObj 
		 */
		const changeLifeMode = (_baseObj) => {
			if (_baseObj.lifeBorders[tmpScoreId] === `x`) {
				g_stateObj.lifeBorder = 0;
				g_stateObj.lifeMode = C_LFE_SURVIVAL;
			} else {
				g_stateObj.lifeBorder = _baseObj.lifeBorders[tmpScoreId];
				g_stateObj.lifeMode = C_LFE_BORDER;
			}
		};

		// ゲージ初期化
		if (_gaugeNum === 0) {
			if (hasVal(g_headerObj.lifeBorders[tmpScoreId])) {
				changeLifeMode(g_headerObj);
				g_gaugeType = (g_gaugeOptionObj.custom.length > 0 ? C_LFE_CUSTOM : g_stateObj.lifeMode);

				g_stateObj.lifeVariable = g_gaugeOptionObj[`var${g_gaugeType}`][_gaugeNum];
				g_settings.gauges = copyArray2d(g_gaugeOptionObj[g_gaugeType.toLowerCase()]);
				g_stateObj.gauge = g_settings.gauges[g_settings.gaugeNum];
			}
			setLifeCategory(g_headerObj);

		} else {
			// 設定されたゲージ設定、カーソルに合わせて設定値を更新
			g_stateObj.lifeVariable = g_gaugeOptionObj[`var${g_gaugeType}`][_gaugeNum];
			if (g_gaugeOptionObj.custom.length === 0 ||
				g_gaugeOptionObj.defaultList.includes(g_gaugeOptionObj[`defaultGauge${tmpScoreId}`])) {
				const gType = (g_gaugeType === C_LFE_CUSTOM ?
					toCapitalize(g_gaugeOptionObj[`defaultGauge${tmpScoreId}`]) : g_gaugeType);
				g_stateObj.lifeMode = g_gaugeOptionObj[`type${gType}`][_gaugeNum];
				g_stateObj.lifeBorder = g_gaugeOptionObj[`clear${gType}`][_gaugeNum];
				g_stateObj.lifeInit = g_gaugeOptionObj[`init${gType}`][_gaugeNum];
				g_stateObj.lifeRcv = g_gaugeOptionObj[`rcv${gType}`][_gaugeNum];
				g_stateObj.lifeDmg = g_gaugeOptionObj[`dmg${gType}`][_gaugeNum];
			}
		}

		// ゲージ設定(Light, Easy)の初期化
		if (g_stateObj.gauge === `Light` || g_stateObj.gauge === `Easy`) {
			setLifeCategory(g_headerObj, { _magRcv: 2 });
		}

		// ゲージ設定別に個別設定した場合はここで設定を上書き
		// 譜面ヘッダー：gaugeXXX で設定した値がここで適用される
		if (hasVal(g_gaugeOptionObj[`gauge${g_stateObj.gauge}s`])) {
			const tmpGaugeObj = g_gaugeOptionObj[`gauge${g_stateObj.gauge}s`];
			if (hasVal(tmpGaugeObj.lifeBorders[tmpScoreId])) {
				changeLifeMode(tmpGaugeObj);
			}
			setLifeCategory(tmpGaugeObj);
		}
	};

	/**
	 * ゲージ設定の詳細表示を整形
	 */
	const gaugeFormat = (_mode, _border, _rcv, _dmg, _init, _lifeValFlg) => {
		const initVal = g_headerObj.maxLifeVal * _init / 100;
		const borderVal = (_mode === C_LFE_BORDER && _border !== 0 ?
			Math.round(g_headerObj.maxLifeVal * _border / 100) : `-`);

		let lifeValCss = ``;
		if (_lifeValFlg === C_FLG_ON) {
			lifeValCss = ` settings_lifeVal`;
		}

		// 整形用にライフ初期値を整数、回復・ダメージ量を小数第1位で丸める
		const init = Math.round(initVal);
		const border = (borderVal !== `-` ? borderVal : `-`);
		const rcv = Math.round(_rcv * 100) / 100;
		const dmg = Math.round(_dmg * 100) / 100;

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
					</div>
					<div id="dataGaugeDivTable" class="settings_gaugeDivTable">
						<div id="dataGaugeStart" class="settings_gaugeDivTableCol settings_gaugeVal settings_gaugeStart">
							${init}/${g_headerObj.maxLifeVal}
						</div>
						<div id="dataGaugeBorder" class="settings_gaugeDivTableCol settings_gaugeVal settings_gaugeEtc">
							${border}
						</div>
						<div id="dataGaugeRecovery" class="settings_gaugeDivTableCol settings_gaugeVal settings_gaugeEtc${lifeValCss}">
							${rcv}
						</div>
						<div id="dataGaugeDamage" class="settings_gaugeDivTableCol settings_gaugeVal settings_gaugeEtc${lifeValCss}">
							${dmg}
						</div>
					</div>
				</div>
				`;
	};

	if (g_headerObj.gaugeUse) {
		multiAppend(spriteList.gauge,
			makeSettingLblCssButton(`lnkGauge`, ``, 0, _ => setGauge(1), { cxtFunc: _ => setGauge(-1) }),
			makeMiniCssButton(`lnkGauge`, `R`, 0, _ => setGauge(1)),
			makeMiniCssButton(`lnkGauge`, `L`, 0, _ => setGauge(-1)),
		);
		createScText(spriteList.gauge, `Gauge`);
	} else {
		lblGauge.classList.add(g_cssObj.settings_Disabled);
		spriteList.gauge.appendChild(makeDisabledLabel(`lnkGauge`, 0, getStgDetailName(g_stateObj.gauge)));
	}

	// ---------------------------------------------------
	// タイミング調整 (Adjustment)
	// 縦位置: 10  短縮ショートカットあり
	createGeneralSetting(spriteList.adjustment, `adjustment`, {
		skipTerms: [50, 10, 5], hiddenBtn: true, scLabel: g_lblNameObj.sc_adjustment, roundNum: 5,
		unitName: g_lblNameObj.frame,
	});

	// ---------------------------------------------------
	// フェードイン (Fadein)
	// 縦位置: 11 スライダーあり
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
		makeMiniCssButton(`lnkFadein`, `R`, 0, _ => setFadein(1)),
		makeMiniCssButton(`lnkFadein`, `L`, 0, _ => setFadein(-1)),

		// フェードインのスライダー処理
		createDivCss2Label(`lblFadeinBar`, `<input id="fadeinSlider" type="range" value="${g_stateObj.fadein}" min="0" max="99" step="1">`,
			g_lblPosObj.lblFadeinBar),

	)

	const fadeinSlider = document.querySelector(`#fadeinSlider`);
	fadeinSlider.addEventListener(`input`, _ =>
		g_stateObj.fadein = inputSlider(fadeinSlider, lnkFadein), false);

	// ---------------------------------------------------
	// ボリューム (Volume) 
	// 縦位置: 12
	createGeneralSetting(spriteList.volume, `volume`, { unitName: g_lblNameObj.percent });

	/**
	 * 譜面初期化処理
	 * - 譜面の基本設定（キー数、初期速度、リバース、ゲージ設定）をここで行う
	 * - g_canLoadDifInfoFlg は譜面初期化フラグで、初期化したくない場合は対象画面にて false にしておく
	 *   (Display設定画面、キーコンフィグ画面では通常OFF)
	 *   この関数を実行後、このフラグはONに戻るようになっている 
	 * - [キーコン]->[初期化]->[名称設定]の順に配置する。
	 *   初期化処理にてキー数関連の設定を行っているため、この順序で無いとデータが正しく格納されない
	 */
	const setDifficulty = (_initFlg) => {

		const getCurrentNo = (_list, _target) => roundZero(_list.findIndex(item => item === _target));

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
				// キーパターン、シャッフルグループ初期化
				g_keyObj.currentPtn = 0;
				g_keycons.shuffleGroupNum = 0;
			}
			const hasKeyStorage = localStorage.getItem(`danonicw-${g_keyObj.currentKey}k`);

			if (g_stateObj.extraKeyFlg) {

				// 特殊キーの場合は作品毎のローカルストレージから取得
				if (isNotSameKey) {
					getKeyReverse(g_localStorage, g_keyObj.currentKey);

					// キーコンフィグ初期値設定
					if (g_localStorage[`keyCtrlPtn${g_keyObj.currentKey}`] === undefined) {
						g_localStorage[`keyCtrlPtn${g_keyObj.currentKey}`] = 0;
					}
					getKeyCtrl(g_localStorage, g_keyObj.currentKey);
				}

			} else {

				// キー別のローカルストレージの初期設定　※特殊キーは除く
				g_localKeyStorage = hasKeyStorage ? JSON.parse(hasKeyStorage) : {
					reverse: C_FLG_OFF,
					keyCtrl: [[]],
					keyCtrlPtn: 0,
				};

				if (isNotSameKey) {
					getKeyReverse(g_localKeyStorage);

					// キーコンフィグ初期値設定
					if (g_localKeyStorage.keyCtrlPtn === undefined) {
						g_localKeyStorage.keyCtrlPtn = 0;
					}
					getKeyCtrl(g_localKeyStorage);
				}

			}
			const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
			if (g_keyObj[`shuffle${keyCtrlPtn}_1`] !== undefined) {
				g_keyObj[`shuffle${keyCtrlPtn}`] = g_keyObj[`shuffle${keyCtrlPtn}_${g_keycons.shuffleGroupNum}`].concat();
			}
			if (g_headerObj.keyRetryDef === C_KEY_RETRY) {
				g_headerObj.keyRetry = setIntVal(g_keyObj[`keyRetry${keyCtrlPtn}`], g_headerObj.keyRetryDef);
			}
			if (g_headerObj.keyTitleBackDef === C_KEY_TITLEBACK) {
				g_headerObj.keyTitleBack = setIntVal(g_keyObj[`keyTitleBack${keyCtrlPtn}`], g_headerObj.keyTitleBackDef);
			}
		}

		// スクロール設定用の配列を入れ替え
		g_settings.scrolls = copyArray2d(
			typeof g_keyObj[`scrollDir${g_keyObj.currentKey}_${g_keyObj.currentPtn}`] === C_TYP_OBJECT ?
				Object.keys(g_keyObj[`scrollDir${g_keyObj.currentKey}_${g_keyObj.currentPtn}`]) : g_keyObj.scrollName_def
		);

		// アシスト設定の配列を入れ替え
		g_settings.autoPlays = (typeof g_keyObj[`assistPos${g_keyObj.currentKey}_${g_keyObj.currentPtn}`] === C_TYP_OBJECT ?
			g_autoPlaysBase.concat(Object.keys(g_keyObj[`assistPos${g_keyObj.currentKey}_${g_keyObj.currentPtn}`])) :
			g_autoPlaysBase.concat());

		// 速度、ゲージ、スクロール、アシスト設定のカーソル位置調整
		if (_initFlg) {
			g_stateObj.speed = g_headerObj.initSpeeds[g_stateObj.scoreId];
			g_settings.speedNum = getCurrentNo(g_settings.speeds, g_stateObj.speed);
			g_settings.gaugeNum = 0;
		}
		g_settings.scrollNum = getCurrentNo(g_settings.scrolls, g_stateObj.scroll);
		g_settings.autoPlayNum = getCurrentNo(g_settings.autoPlays, g_stateObj.autoPlay);

		// ---------------------------------------------------
		// 3. 名称の設定

		// 譜面名設定 (Difficulty)
		const difWidth = parseFloat(lnkDifficulty.style.width);
		const difNames = [`${getKeyName(g_keyObj.currentKey)} ${getStgDetailName('key')} / ${g_headerObj.difLabels[g_stateObj.scoreId]}`];
		lnkDifficulty.style.fontSize = `${getFontSize(difNames[0], difWidth, getBasicFont(), C_SIZ_SETLBL)}px`;

		if (g_headerObj.makerView) {
			difNames.push(`(${g_headerObj.creatorNames[g_stateObj.scoreId]})`);
			difNames.forEach((difName, j) => {
				const tmpSize = getFontSize(difName, difWidth, getBasicFont(), 14);
				difNames[j] = `<span style="font-size:${tmpSize}px">${difName}</span>`;
			});
		}
		lnkDifficulty.innerHTML = difNames.join(``);

		// 速度設定 (Speed)
		setSetting(0, `speed`, ` ${g_lblNameObj.multi}`);
		if (g_headerObj.scoreDetailUse) {
			drawSpeedGraph(g_stateObj.scoreId);
			drawDensityGraph(g_stateObj.scoreId);
			makeDifInfo(g_stateObj.scoreId);
		}

		// リバース設定 (Reverse, Scroll)
		if (g_headerObj.scrollUse) {
			g_stateObj.scroll = g_settings.scrolls[g_settings.scrollNum];
			const [visibleScr, hiddenScr] = (g_settings.scrolls.length > 1 ? [`scroll`, `reverse`] : [`reverse`, `scroll`]);
			spriteList[visibleScr].style.display = C_DIS_INHERIT;
			spriteList[hiddenScr].style.display = C_DIS_NONE;
			setSetting(0, visibleScr);
			if (g_settings.scrolls.length > 1) {
				setReverseView(document.querySelector(`#btnReverse`));
			}
		} else {
			g_settings.scrolls = copyArray2d(g_keyObj.scrollName_def);
			setSetting(0, `reverse`);
		}

		// オート・アシスト設定 (AutoPlay)
		g_stateObj.autoPlay = g_settings.autoPlays[g_settings.autoPlayNum];
		lnkAutoPlay.textContent = getStgDetailName(g_stateObj.autoPlay);

		// ゲージ設定 (Gauge)
		const defaultCustomGauge = g_gaugeOptionObj.custom0 || g_gaugeOptionObj.customDefault;
		if (hasVal(defaultCustomGauge)) {
			g_gaugeOptionObj.custom = (g_gaugeOptionObj[`custom${g_stateObj.scoreId}`] || defaultCustomGauge).concat();
			g_gaugeOptionObj.varCustom = (g_gaugeOptionObj[`varCustom${g_stateObj.scoreId}`] || g_gaugeOptionObj.varCustom0 || g_gaugeOptionObj.varCustomDefault).concat();
		}
		setGauge(0);

		// ユーザカスタムイベント(初期)
		g_customJsObj.difficulty.forEach(func => func(_initFlg, g_canLoadDifInfoFlg));

		// ---------------------------------------------------
		// 4. 譜面初期情報ロード許可フラグの設定
		g_canLoadDifInfoFlg = true;
	};

	// 設定画面の一通りのオブジェクトを作成後に譜面・速度・ゲージ設定をまとめて行う
	setDifficulty(false);
	optionsprite.oncontextmenu = _ => false;
};

/**
 * 汎用設定
 * @param {object} _obj 
 * @param {string} _settingName 
 * @param {object} _options
 */
const createGeneralSetting = (_obj, _settingName, { unitName = ``,
	skipTerms = [...Array(3)].fill(1), hiddenBtn = false, addRFunc = _ => { }, addLFunc = _ => { },
	settingLabel = _settingName, displayName = `option`, scLabel = ``, roundNum = 0 } = {}) => {

	const settingUpper = toCapitalize(_settingName);
	const linkId = `lnk${settingUpper}`;
	const initName = `${getStgDetailName(g_stateObj[_settingName])}${unitName}`;
	_obj.appendChild(createLblSetting(settingUpper, 0, toCapitalize(settingLabel)));

	if (g_headerObj[`${_settingName}Use`] === undefined || g_headerObj[`${_settingName}Use`]) {

		multiAppend(_obj,
			makeSettingLblCssButton(linkId, `${initName}${g_localStorage[_settingName] === g_stateObj[_settingName] ? ' *' : ''}`, 0,
				_ => {
					setSetting(skipTerms[1], _settingName, unitName, roundNum);
					addRFunc();
				}, {
				cxtFunc: _ => {
					setSetting(skipTerms[1] * (-1), _settingName, unitName, roundNum);
					addLFunc();
				}
			}),

			// 右回し・左回しボタン（外側）
			makeMiniCssButton(linkId, `R`, 0, _ => {
				setSetting(skipTerms[0], _settingName, unitName, roundNum);
				addRFunc();
			}),
			makeMiniCssButton(linkId, `L`, 0, _ => {
				setSetting(skipTerms[0] * (-1), _settingName, unitName, roundNum);
				addLFunc();
			}),
		)

		// 右回し・左回しボタン（内側）
		if (skipTerms[1] > 1) {
			multiAppend(_obj,
				makeMiniCssButton(linkId, `RR`, 0, _ => setSetting(skipTerms[1], _settingName, unitName, roundNum)),
				makeMiniCssButton(linkId, `LL`, 0, _ => setSetting(skipTerms[1] * (-1), _settingName, unitName, roundNum)),
			);
		}

		// 右回し・左回しボタン（最内側）
		if (skipTerms[2] > 1) {
			multiAppend(_obj,
				makeMiniCssButton(linkId, `RRR`, 0, _ => setSetting(skipTerms[2], _settingName, unitName, roundNum), { dw: -C_LEN_SETMINI_WIDTH / 2 }),
				makeMiniCssButton(linkId, `LLL`, 0, _ => setSetting(skipTerms[2] * (-1), _settingName, unitName, roundNum), { dw: -C_LEN_SETMINI_WIDTH / 2 }),
			);
		}

		// 右回し・左回しボタン（不可視）
		if (hiddenBtn) {
			multiAppend(_obj,
				makeMiniCssButton(linkId, `HR`, 0, _ => setSetting(1, _settingName, unitName, roundNum), { visibility: `hidden` }),
				makeMiniCssButton(linkId, `HL`, 0, _ => setSetting(-1, _settingName, unitName, roundNum), { visibility: `hidden` }),
			);
		}

		// ショートカットキー表示
		createScText(_obj, settingUpper, { displayName: displayName, dfLabel: scLabel });

	} else {
		document.querySelector(`#lbl${settingUpper}`).classList.add(g_cssObj.settings_Disabled);
		_obj.appendChild(makeDisabledLabel(linkId, 0, initName));
	}
};

/**
 * 設定画面用ラベルの作成
 * @param {string} _settingName 
 * @param {number} _adjY 
 * @param {string} _settingLabel 
 */
const createLblSetting = (_settingName, _adjY = 0, _settingLabel = _settingName) => {
	const lbl = createDivCss2Label(`lbl${_settingName}`, g_lblNameObj[_settingLabel], {
		x: 0, y: _adjY, w: 100,
	}, `settings_${_settingName}`);
	lbl.title = g_msgObj[`${_settingName.charAt(0).toLowerCase()}${_settingName.slice(1)}`];
	return lbl;
};

/**
 * 設定名の置き換え処理
 * @param {string} _name 
 */
const getStgDetailName = _name => {
	return g_lblNameObj[`u_${_name}`] !== undefined &&
		(g_presetObj.lblRenames === undefined || g_presetObj.lblRenames[g_currentPage]) ? g_lblNameObj[`u_${_name}`] : _name;
};

/**
 * 設定メイン・汎用
 * @param {number} _scrollNum 
 * @param {string} _settingName
 * @param {string} _unitName
 * @param {number} _roundNum
 */
const setSetting = (_scrollNum, _settingName, _unitName = ``, _roundNum = 0) => {
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
		settingNum = (settingNum === settingMax ?
			0 : (settingNum + _scrollNum > settingMax ? settingMax : settingNum + _scrollNum));
	} else if (_scrollNum < 0) {
		settingNum = (settingNum === 0 ?
			settingMax : (settingNum + _scrollNum <= 0 ? 0 : settingNum + _scrollNum));
	}
	g_stateObj[_settingName] = settingList[settingNum];
	g_settings[`${_settingName}Num`] = settingNum;
	document.querySelector(`#lnk${toCapitalize(_settingName)}`).textContent =
		`${getStgDetailName(g_stateObj[_settingName])}${_unitName}${g_localStorage[_settingName] === g_stateObj[_settingName] ? ' *' : ''}`;
};

/**
 * 無効化用ラベル作成
 * @param {string} _id 
 * @param {number} _heightPos 
 * @param {string} _defaultStr 
 */
const makeDisabledLabel = (_id, _heightPos, _defaultStr) => {
	return createDivCss2Label(_id, _defaultStr, {
		x: C_LEN_SETLBL_LEFT, y: C_LEN_SETLBL_HEIGHT * _heightPos,
	}, g_cssObj.settings_Disabled);
};

/**
 * 保存済みリバース取得処理
 * @param {object} _localStorage 保存先のローカルストレージ名
 * @param {string} _extraKeyName 特殊キー名(通常キーは省略)
 */
const getKeyReverse = (_localStorage, _extraKeyName = ``) => {
	if (_localStorage[`reverse${_extraKeyName}`] !== undefined) {
		g_stateObj.reverse = _localStorage[`reverse${_extraKeyName}`] ?? C_FLG_OFF;
		g_settings.reverseNum = roundZero(g_settings.reverses.findIndex(reverse => reverse === g_stateObj.reverse));
	} else {
		g_stateObj.reverse = C_FLG_OFF;
		g_settings.reverseNum = 0;
	}
};

/**
 * 保存済みキーコンフィグ取得処理
 * @param {object} _localStorage 保存先のローカルストレージ名
 * @param {string} _extraKeyName 特殊キー名(通常キーは省略)
 */
const getKeyCtrl = (_localStorage, _extraKeyName = ``) => {
	const baseKeyCtrlPtn = _localStorage[`keyCtrlPtn${_extraKeyName}`];
	const basePtn = `${g_keyObj.currentKey}_${baseKeyCtrlPtn}`;
	const baseKeyNum = g_keyObj[`chara${basePtn}`].length;

	if (_localStorage[`keyCtrl${_extraKeyName}`] !== undefined && _localStorage[`keyCtrl${_extraKeyName}`][0].length > 0) {
		const prevPtn = g_keyObj.currentPtn;
		g_keyObj.currentPtn = -1;
		const copyPtn = `${g_keyObj.currentKey}_-1`;
		g_keyObj[`keyCtrl${copyPtn}`] = [...Array(baseKeyNum)].map(_ => []);
		g_keyObj[`keyCtrl${copyPtn}d`] = [...Array(baseKeyNum)].map(_ => []);

		for (let j = 0; j < baseKeyNum; j++) {
			for (let k = 0; k < g_keyObj[`keyCtrl${basePtn}`][j].length; k++) {
				g_keyObj[`keyCtrl${copyPtn}d`][j][k] = g_keyObj[`keyCtrl${copyPtn}`][j][k] = _localStorage[`keyCtrl${_extraKeyName}`][j][k];
			}
		}

		const isUpdate = prevPtn !== -1 && g_keyObj.prevKey !== g_keyObj.currentKey;
		g_keyCopyLists.multiple.forEach(header => {
			if (g_keyObj[`${header}${basePtn}`] !== undefined && isUpdate) {
				g_keyObj[`${header}${copyPtn}`] = copyArray2d(g_keyObj[`${header}${basePtn}`]);
			}
		});
		g_keyCopyLists.simple.forEach(header => {
			g_keyObj[`${header}${copyPtn}`] = g_keyObj[`${header}${basePtn}`];
		});

		[`color`, `shuffle`].forEach(type => {
			if (isUpdate) {
				let maxPtn = 0;
				while (g_keyObj[`${type}${basePtn}_${maxPtn}`] !== undefined) {
					maxPtn++;
				}
				for (let j = 0; j < maxPtn; j++) {
					g_keyObj[`${type}${copyPtn}_${j}`] = copyArray2d(g_keyObj[`${type}${basePtn}_${j}`]);
				}
			}
		});
	}
};

/**
 * 設定・オプション表示用ボタン
 * @param {string} _id 
 * @param {string} _name 初期設定文字
 * @param {number} _heightPos 上からの配置順
 * @param {function} _func 通常ボタン処理
 * @param {object} objectList 座標設定(既定を上書き)
 * @param {...any} _classes 追加するクラス
 */
const makeSettingLblCssButton = (_id, _name, _heightPos, _func, { x, y, w, h, siz, cxtFunc = _ => true, ...rest } = {}, ..._classes) => {
	const tmpObj = {
		x: x !== undefined ? x : C_LEN_SETLBL_LEFT,
		y: y !== undefined ? y : C_LEN_SETLBL_HEIGHT * _heightPos,
		w: w !== undefined ? w : C_LEN_SETLBL_WIDTH,
		h: h !== undefined ? h : C_LEN_SETLBL_HEIGHT,
		siz: siz !== undefined ? siz : C_SIZ_SETLBL,
		cxtFunc: cxtFunc !== undefined ? cxtFunc : _ => true,
	};
	return createCss2Button(_id, _name, _func, { ...tmpObj, ...rest }, g_cssObj.button_Default, ..._classes);
};

/**
 * 譜面変更セレクター用ボタン
 * @param {string} _id
 * @param {string} _name 初期設定文字
 * @param {number} _heightPos 上からの配置順
 * @param {function} _func
 */
const makeDifLblCssButton = (_id, _name, _heightPos, _func, { x = 0, w = C_LEN_DIFSELECTOR_WIDTH, btnStyle = `Default` } = {}) => {
	return createCss2Button(_id, _name, _func, {
		x: x, y: C_LEN_SETLBL_HEIGHT * _heightPos,
		w: w, h: C_LEN_SETLBL_HEIGHT,
		siz: C_SIZ_DIFSELECTOR,
		borderStyle: `solid`,
	}, g_cssObj[`button_${btnStyle}`], g_cssObj.button_ON);
};

/**
 * 設定・オプション用の設定変更ミニボタン
 * @param {string} _id 
 * @param {string} _directionFlg 表示用ボタンのどちら側に置くかを設定。(R, RR:右、L, LL:左)
 * @param {number} _heightPos 上からの配置順
 * @param {function} _func 
 */
const makeMiniCssButton = (_id, _directionFlg, _heightPos, _func, { dx = 0, dy = 0, dw = 0, dh = 0, dsiz = 0, visibility = `visible` } = {}) => {
	return createCss2Button(`${_id}${_directionFlg}`, g_settingBtnObj.chara[_directionFlg], _func, {
		x: g_settingBtnObj.pos[_directionFlg] + dx,
		y: C_LEN_SETLBL_HEIGHT * _heightPos + dy,
		w: C_LEN_SETMINI_WIDTH + dw, h: C_LEN_SETLBL_HEIGHT + dh, siz: C_SIZ_SETLBL + dsiz,
		visibility: visibility
	}, g_cssObj.button_Mini);
};

/*-----------------------------------------------------------*/
/* Scene : SETTINGS-DISPLAY [lemon] */
/*-----------------------------------------------------------*/

const settingsDisplayInit = _ => {

	clearWindow(true);
	const divRoot = document.querySelector(`#divRoot`);
	g_baseDisp = `Display`;
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
	document.oncontextmenu = _ => true;

	g_skinJsObj.settingsDisplay.forEach(func => func());
};

/**
 * 設定・オプション画面のラベル・ボタン処理の描画
 * @param {Object} _sprite 基準とするスプライト(ここで指定する座標は、そのスプライトからの相対位置)
 */
const createSettingsDisplayWindow = _sprite => {

	/**
	 * Display表示/非表示ボタン
	 * @param {*} _name 
	 * @param {*} _heightPos 縦位置
	 * @param {*} _widthPos 横位置
	 */
	const makeDisplayButton = (_name, _heightPos, _widthPos) => {

		const flg = g_stateObj[`d_${_name.toLowerCase()}`];
		const list = [C_FLG_OFF, C_FLG_ON];
		const linkId = `lnk${_name}`;

		/**
		 * 無効化用ラベル作成
		 * @param {string} _id 
		 * @param {number} _heightPos 
		 * @param {number} _widthPos
		 * @param {string} _defaultStr 
		 * @param {string} _flg
		 */
		const makeDisabledDisplayLabel = (_id, _heightPos, _widthPos, _defaultStr, _flg) => {
			return createDivCss2Label(_id, _defaultStr, {
				x: 30 + 180 * _widthPos, y: 3 + C_LEN_SETLBL_HEIGHT * _heightPos,
				w: 170, siz: C_SIZ_DIFSELECTOR,
			}, g_cssObj[`button_Disabled${flg}`]);
		};

		if (g_headerObj[`${_name}Use`]) {
			const switchDisplay = evt => {
				const displayFlg = g_stateObj[`d_${_name.toLowerCase()}`];
				const displayNum = list.findIndex(flg => flg === displayFlg);
				const nextDisplayFlg = list[(displayNum + 1) % list.length];
				g_stateObj[`d_${_name.toLowerCase()}`] = nextDisplayFlg;
				evt.target.classList.replace(g_cssObj[`button_${displayFlg}`], g_cssObj[`button_${nextDisplayFlg}`]);

				interlockingButton(g_headerObj, _name, nextDisplayFlg, displayFlg, true);
			}
			displaySprite.appendChild(
				makeSettingLblCssButton(linkId, g_lblNameObj[`d_${toCapitalize(_name)}`], _heightPos, evt => switchDisplay(evt), {
					x: 30 + 180 * _widthPos, w: 170,
					title: g_msgObj[`d_${_name.toLowerCase()}`], borderStyle: `solid`,
					cxtFunc: evt => switchDisplay(evt),
				}, `button_${flg}`)
			);
			createScText(document.getElementById(linkId), `${toCapitalize(_name)}`,
				{ displayName: g_currentPage, targetLabel: linkId, x: -5 });
		} else {
			displaySprite.appendChild(makeDisabledDisplayLabel(linkId, _heightPos, _widthPos,
				g_lblNameObj[`d_${toCapitalize(_name)}`] + `:${g_headerObj[`${_name}Set`]}`, g_headerObj[`${_name}Set`]));
		}
	};

	// 各ボタン用のスプライトを作成
	createOptionSprite(_sprite);

	// 設定名、縦位置、縦位置差分、幅差分、高さ差分
	const settingList = [
		[`appearance`, 7.4, 10, 0, 0],
		[`opacity`, 9, 10, 0, 0],
	];

	// 設定毎に個別のスプライトを作成し、その中にラベル・ボタン類を配置
	const displaySprite = createEmptySprite(optionsprite, `displaySprite`, g_windowObj.displaySprite);
	const spriteList = setSpriteList(settingList);

	_sprite.appendChild(createDivCss2Label(`sdDesc`, g_lblNameObj.sdDesc, g_lblPosObj.sdDesc));
	g_displays.forEach((name, j) => makeDisplayButton(name, j % 7, Math.floor(j / 7)));

	// ---------------------------------------------------
	// 矢印の見え方 (Appearance)
	// 縦位置: 7.4
	createGeneralSetting(spriteList.appearance, `appearance`, {
		displayName: g_currentPage,
		addRFunc: _ => dispAppearanceSlider(),
		addLFunc: _ => dispAppearanceSlider(),
	});

	// Hidden+/Sudden+初期値用スライダー、ロックボタン
	multiAppend(spriteList.appearance,
		createDivCss2Label(`lblAppearancePos`, `${g_hidSudObj.filterPos}${g_lblNameObj.percent}`, g_lblPosObj.lblAppearancePos),
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

	const appearanceSlider = document.querySelector(`#appearanceSlider`);
	appearanceSlider.addEventListener(`input`, _ =>
		g_hidSudObj.filterPos = inputSlider(appearanceSlider, lblAppearancePos), false);

	const dispAppearanceSlider = _ => {
		[`lblAppearancePos`, `lblAppearanceBar`, `lnkLockBtn`].forEach(obj =>
			document.getElementById(obj).style.visibility =
			g_appearanceRanges.includes(g_stateObj.appearance) ? `Visible` : `Hidden`
		);
	};
	dispAppearanceSlider();

	// ---------------------------------------------------
	// 判定表示系の不透明度 (Opacity)
	// 縦位置: 9
	createGeneralSetting(spriteList.opacity, `opacity`, { unitName: g_lblNameObj.percent, displayName: g_currentPage });
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
		_headerObj[`${_name}ChainOFF`].forEach(defaultOption => {

			// 連動してOFFにするボタンの設定
			if (!includeDefaults.includes(defaultOption)) {
				g_stateObj[`d_${defaultOption.toLowerCase()}`] = _next;
				if (_buttonFlg) {
					let txtDisabled = ``;
					if (!g_headerObj[`${defaultOption}Use`]) {
						txtDisabled = `Disabled`;
						document.querySelector(`#lnk${defaultOption}`).textContent = `${toCapitalize(defaultOption)}:${_next}`;
					}
					document.querySelector(`#lnk${defaultOption}`).classList.replace(g_cssObj[`button_${txtDisabled}${_current}`], g_cssObj[`button_Disabled${_next}`]);
				}
				// さらに連動する場合は設定を反転
				interlockingButton(_headerObj, defaultOption, _next, _current, _buttonFlg);
			}
		});
	}
};

/*-----------------------------------------------------------*/
/* Scene : KEYCONFIG [orange] */
/*-----------------------------------------------------------*/

/**
 * キーコンフィグ画面初期化
 */
const keyConfigInit = (_kcType = g_kcType) => {

	clearWindow(true);
	const divRoot = document.querySelector(`#divRoot`);
	g_kcType = _kcType;
	g_currentPage = `keyConfig`;

	// 譜面初期情報ロード許可フラグ
	g_canLoadDifInfoFlg = false;

	multiAppend(divRoot,

		// キーコンフィグ画面タイトル
		getTitleDivLabel(`lblTitle`,
			`<div class="settings_Title">${g_lblNameObj.key}</div><div class="settings_Title2">${g_lblNameObj.config}</div>`
				.replace(/[\t\n]/g, ``), 0, 15, g_cssObj.flex_centering),

		createDescDiv(`kcDesc`, g_lblNameObj.kcDesc.split(`{0}`).join(g_kCd[C_KEY_RETRY])
			.split(`{1}:`).join(g_isMac ? `` : `Delete:`)),

		createDescDiv(`kcShuffleDesc`, g_lblNameObj.kcShuffleDesc),
	);

	// キーの一覧を表示
	const keyconSprite = createEmptySprite(divRoot, `keyconSprite`, g_windowObj.keyconSprite);
	const tkObj = getKeyInfo();
	const [keyCtrlPtn, keyNum, posMax, divideCnt] =
		[tkObj.keyCtrlPtn, tkObj.keyNum, tkObj.posMax, tkObj.divideCnt];

	g_keyCopyLists.simpleDef.forEach(header => updateKeyInfo(header, keyCtrlPtn));
	keyconSprite.style.transform = `scale(${g_keyObj.scale})`;
	const kWidth = parseInt(keyconSprite.style.width);
	changeSetColor();

	const maxLeftPos = Math.max(divideCnt, posMax - divideCnt - 2) / 2;
	const maxLeftX = Math.min(0, (kWidth - C_ARW_WIDTH) / 2 - maxLeftPos * g_keyObj.blank);

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
	 * @param {number} _colorPos 
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
	const changeKeyConfigColor = (_j, _k, _cssName) => {
		const obj = document.querySelector(`#keycon${_j}_${_k}`);
		const resetClass = _className => {
			if (obj.classList.contains(_className)) {
				obj.classList.remove(_className);
			}
		};

		// CSSクラスの除去
		resetClass(g_cssObj.keyconfig_Changekey);
		resetClass(g_cssObj.keyconfig_Defaultkey);
		resetClass(g_cssObj.title_base);

		// 指定されたCSSクラスを適用
		obj.classList.add(_cssName);
	};

	/**
	 * 一時的に矢印色・シャッフルグループを変更（共通処理）
	 * @param {string} _type 
	 * @param {number} _len 
	 * @param {number} _j 
	 * @param {number} _scrollNum 
	 * @returns 
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
		const tmpShuffle = changeTmpData(`shuffle`, 10, _j, _scrollNum);
		document.getElementById(`sArrow${_j}`).textContent = tmpShuffle + 1;

		adjustScrollPoint(parseFloat($id(`arrow${_j}`).left));
	};

	for (let j = 0; j < keyNum; j++) {

		const posj = g_keyObj[`pos${keyCtrlPtn}`][j];
		const stdPos = posj - ((posj > divideCnt ? posMax : 0) + divideCnt) / 2;

		const keyconX = g_keyObj.blank * stdPos + (kWidth - C_ARW_WIDTH) / 2 - maxLeftX;
		const keyconY = C_KYC_HEIGHT * (Number(posj > divideCnt)) + 12;
		const colorPos = g_keyObj[`color${keyCtrlPtn}`][j];
		const arrowColor = getKeyConfigColor(j, colorPos);

		keyconSprite.appendChild(
			createCss2Button(`color${j}`, ``, _ => changeTmpColor(j), {
				x: keyconX, y: keyconY, w: C_ARW_WIDTH, h: C_ARW_WIDTH,
				cxtFunc: _ => changeTmpColor(j, -1),
			}, g_cssObj.button_Default_NoColor, g_cssObj.title_base)
		);
		// キーコンフィグ表示用の矢印・おにぎりを表示
		multiAppend(keyconSprite,
			// 矢印の塗り部分
			createColorObject2(`arrowShadow${j}`, {
				x: keyconX, y: keyconY, background: hasVal(g_headerObj[`setShadowColor${g_colorType}`][colorPos]) ? getShadowColor(colorPos, arrowColor) : ``,
				rotate: g_keyObj[`stepRtn${keyCtrlPtn}`][j], styleName: `Shadow`, pointerEvents: `none`,
			}),
			// 矢印本体
			createColorObject2(`arrow${j}`, {
				x: keyconX, y: keyconY, background: arrowColor, rotate: g_keyObj[`stepRtn${keyCtrlPtn}`][j], pointerEvents: `none`,
			}),
		);
		if (g_headerObj.shuffleUse && g_keyObj[`shuffle${keyCtrlPtn}`] !== undefined) {
			keyconSprite.appendChild(
				createCss2Button(`sArrow${j}`, ``, _ => changeTmpShuffleNum(j), {
					x: keyconX, y: keyconY - 12, w: C_ARW_WIDTH, h: 15, siz: 12, fontWeight: `bold`,
					pointerEvents: (g_settings.shuffles.filter(val => val.endsWith(`+`)).length > 0 ? `auto` : `none`),
					cxtFunc: _ => changeTmpShuffleNum(j, -1),
				}, g_cssObj.button_Default_NoColor, g_cssObj.title_base)
			);
		}

		// 割り当て先のキー名を表示
		for (let k = 0; k < g_keyObj[`keyCtrl${keyCtrlPtn}`][j].length; k++) {
			g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k] = setIntVal(g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]);
			g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k] = setIntVal(g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k]);

			keyconSprite.appendChild(
				createCss2Button(`keycon${j}_${k}`, g_kCd[g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]], _ => {
					g_currentj = j;
					g_currentk = k;
					setKeyConfigCursor();
				}, {
					x: keyconX, y: 50 + C_KYC_REPHEIGHT * k + keyconY,
					w: C_ARW_WIDTH, h: C_KYC_REPHEIGHT, siz: C_SIZ_JDGCNTS,
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
	};

	/**
	 * カラー・シャッフルグループ設定の表示
	 * @param {string} _type 
	 */
	const viewGroup = _type => {
		if (g_headerObj[`${_type}Use`]) {
			if (g_keyObj[`${_type}${keyCtrlPtn}_1`] !== undefined) {
				document.getElementById(`lnk${toCapitalize(_type)}Group`).textContent =
					getStgDetailName(`${g_keycons[`${_type}GroupNum`] + 1}`);
			}
			viewGroupObj[_type](`_${g_keycons[`${_type}GroupNum`]}`);
		}
	};
	const setGroup = (_type, _scrollNum = 1) => {
		const tmpNum = g_keycons[`${_type}GroupNum`] + _scrollNum;
		if (g_keyObj[`${_type}${keyCtrlPtn}_${tmpNum}`] !== undefined) {
			g_keycons[`${_type}GroupNum`] = tmpNum;
		} else {
			let j = 0;
			while (g_keyObj[`${_type}${keyCtrlPtn}_${j}`] !== undefined) {
				j -= _scrollNum;
			}
			g_keycons[`${_type}GroupNum`] = j + _scrollNum;
		}
		g_keyObj[`${_type}${keyCtrlPtn}`] = [...g_keyObj[`${_type}${keyCtrlPtn}_${g_keycons[`${_type}GroupNum`]}`]];
		viewGroup(_type);
	};

	/**
	 * キーコンフィグ用設定ラベル
	 * @param {string} _id 
	 * @param {string} _name 
	 * @param {object} object (x, y, w, h, siz, align, ...rest) 
	 * @param  {...any} _classes 
	 * @returns ラベル
	 */
	const makeKCButtonHeader = (_id, _name, {
		x = g_sWidth * 5 / 6 - 30, y = 0, w = g_sWidth / 6, h = 20, siz = 12, align = C_ALIGN_LEFT, ...rest
	} = {}, ..._classes) => {
		return createDivCss2Label(_id, g_lblNameObj[_name], { x, y, w, h, siz, align, ...rest }, ..._classes);
	};

	/**
	 * キーコンフィグ用設定ボタン
	 * @param {string} _id 
	 * @param {string} _text 
	 * @param {function} _func 
	 * @param {object} object (x, y, w, h, siz, borderStyle, cxtFunc, ...rest)
	 * @param {string} _mainClass 
	 * @param  {...any} _classes 
	 * @returns ボタン
	 */
	const makeKCButton = (_id, _text, _func, { x = g_sWidth * 5 / 6 - 20, y = 15, w = g_sWidth / 6, h = 18,
		siz = C_SIZ_JDGCNTS, borderStyle = `solid`, cxtFunc, ...rest } = {}, _mainClass = g_cssObj.button_RevOFF, ..._classes) => {
		return makeSettingLblCssButton(_id, getStgDetailName(_text), 0, _func, { x, y, w, h, siz, cxtFunc, borderStyle, ...rest }, _mainClass, ..._classes);
	};

	/**
	 * キーコンフィグ用ミニボタン
	 * @param {string} _id 
	 * @param {string} _directionFlg 
	 * @param {function} _func 
	 * @param {*} object (x, y, w, h, siz) 
	 * @returns 
	 */
	const makeMiniKCButton = (_id, _directionFlg, _func, { x = g_sWidth * 5 / 6 - 30, y = 15, w = 15, h = 20, siz = C_SIZ_MAIN } = {}) => {
		return createCss2Button(`${_id}${_directionFlg}`, g_settingBtnObj.chara[_directionFlg], _func,
			{ x, y, w, h, siz }, g_cssObj.button_Mini);
	};

	/**
	 * キーコンフィグ用グループ設定ラベル・ボタンの作成
	 * @param {string} _type 
	 * @param {object} obj (baseX) 
	 */
	const makeGroupButton = (_type, { baseX = g_sWidth * 5 / 6 - 20, cssName } = {}) => {
		if (g_headerObj[`${_type}Use`] && g_keyObj[`${_type}${keyCtrlPtn}_1`] !== undefined) {
			const typeName = toCapitalize(_type);
			multiAppend(divRoot,
				makeKCButtonHeader(`lbl${_type}Group`, `${typeName}Group`, { x: baseX - 10, y: 37 }, cssName),
				makeKCButton(`lnk${typeName}Group`, `${g_keycons[`${_type}GroupNum`] + 1}`, _ => setGroup(_type), {
					x: baseX, y: 50, w: g_sWidth / 18, title: g_msgObj[`${_type}Group`], cxtFunc: _ => setGroup(_type, -1),
				}),
				makeMiniKCButton(`lnk${typeName}Group`, `L`, _ => setGroup(_type, -1), { x: baseX - 10, y: 50 }),
				makeMiniKCButton(`lnk${typeName}Group`, `R`, _ => setGroup(_type), { x: baseX + g_sWidth / 18, y: 50 }),
			);
		} else {
			g_keycons[`${_type}GroupNum`] = 0;
		}
		viewGroup(_type);
	};

	multiAppend(divRoot,

		// ショートカットキーメッセージ
		createDescDiv(`scMsg`, g_lblNameObj.kcShortcutDesc.split(`{0}`).join(g_isMac ? `Shift+${g_kCd[g_headerObj.keyRetry]}` : g_kCd[g_headerObj.keyTitleBack])
			.split(`{1}`).join(g_kCd[g_headerObj.keyRetry]), `scKcMsg`),

		// 別キーモード警告メッセージ
		createDivCss2Label(
			`kcMsg`,
			hasVal(g_keyObj[`transKey${keyCtrlPtn}`]) ? g_lblNameObj.transKeyDesc : ``,
			g_lblPosObj.kcMsg, g_cssObj.keyconfig_warning
		),

		// キーコンフィグタイプ切替ボタン
		makeKCButtonHeader(`lblKcType`, `ConfigType`, { x: 10 }, g_cssObj.keyconfig_ConfigType),
		makeKCButton(`lnkKcType`, g_kcType, _ => setConfigType(), {
			x: 20, title: g_msgObj.configType, cxtFunc: _ => setConfigType(-1),
		}),

		// キーカラータイプ切替ボタン
		makeKCButtonHeader(`lblcolorType`, `ColorType`, {}, g_cssObj.keyconfig_ColorType),
		makeKCButton(`lnkColorType`, g_colorType, _ => setColorType(), {
			title: g_msgObj.colorType, cxtFunc: _ => setColorType(-1),
		}),
		makeMiniKCButton(`lnkColorType`, `L`, _ => setColorType(-1)),
		makeMiniKCButton(`lnkColorType`, `R`, _ => setColorType(), { x: g_sWidth - 20 }),
	);

	if (g_headerObj.imgType.length > 1) {
		const [imgBaseX, imgBaseY] = [20, 50];
		multiAppend(divRoot,
			// オブジェクトタイプの切り替え（リロードあり）
			makeKCButtonHeader(`lblImgType`, `ImgType`, { x: 10, y: 37 }, g_cssObj.keyconfig_ConfigType),
			makeKCButton(`lnkImgType`, g_imgType, _ => setImgType(), {
				x: imgBaseX, y: imgBaseY, title: g_msgObj.imgType, cxtFunc: _ => setImgType(-1),
			}),
			makeMiniKCButton(`lnkImgType`, `L`, _ => setImgType(-1), { x: imgBaseX - 10, y: imgBaseY }),
			makeMiniKCButton(`lnkImgType`, `R`, _ => setImgType(), { x: imgBaseX + g_sWidth / 6, y: imgBaseY }),
		)
	}

	// カラー/シャッフルグループ切替ボタン（カラー/シャッフルパターンが複数ある場合のみ）
	makeGroupButton(`color`, { cssName: g_cssObj.keyconfig_ColorType });
	makeGroupButton(`shuffle`, { baseX: g_sWidth * 11 / 12 - 10, cssName: g_cssObj.settings_Shuffle });

	/**
	 * 次のカーソルへ移動
	 * @param {number} _pos 
	 */
	const searchNextCursor = _pos => {
		for (let j = g_currentj; j < keyNum + g_currentj; j++) {
			if (g_keyObj[`keyCtrl${keyCtrlPtn}`][j % keyNum][_pos] !== undefined) {
				g_currentj = j % keyNum;
				g_currentk = _pos;
				return true;
			}
		}
		return false;
	};

	/**
	 * カーソル位置の設定
	 */
	const setKeyConfigCursor = _ => {
		const posj = g_keyObj[`pos${keyCtrlPtn}`][g_currentj];
		const stdPos = posj - ((posj > divideCnt ? posMax : 0) + divideCnt) / 2;

		const nextLeft = (kWidth - C_ARW_WIDTH) / 2 + g_keyObj.blank * stdPos - maxLeftX - 10;
		cursor.style.left = `${nextLeft}px`;
		const baseY = C_KYC_HEIGHT * Number(posj > divideCnt) + 57;
		cursor.style.top = `${baseY + C_KYC_REPHEIGHT * g_currentk}px`;
		if (g_currentk === 0 && g_kcType === `Replaced`) {
			g_kcType = C_FLG_ALL;
			lnkKcType.textContent = getStgDetailName(g_kcType);
		}

		// 次の位置が見えなくなったらkeyconSpriteの位置を調整する
		adjustScrollPoint(nextLeft);
	};

	/**
	 * キーコンフィグ用カーソルのリセット
	 * @param {number} _resetPos
	 * @param {boolean} _resetCursorFlg
	 */
	const resetCursor = (_resetPos = 0, _resetCursorFlg = true) => {
		g_prevKey = -1;
		if (_resetCursorFlg) {
			g_currentj = 0;
			if (!searchNextCursor(_resetPos)) {
				g_currentk = 0;
			}
		} else {
			if (g_keyObj[`keyCtrl${keyCtrlPtn}`][g_currentj][_resetPos] === undefined) {
				searchNextCursor(_resetPos);
			} else {
				g_currentk = _resetPos;
			}
		}
		setKeyConfigCursor();
	};

	const getNextNum = (_scrollNum, _groupName, _target) => {
		const typeNum = g_keycons[_groupName].findIndex(value => value === _target);
		return nextPos(typeNum, _scrollNum, g_keycons[_groupName].length);
	};

	/**
	 * ConfigTypeの制御
	 * @param {number} _scrollNum 
	 */
	const setConfigType = (_scrollNum = 1) => {
		g_kcType = g_keycons.configTypes[getNextNum(_scrollNum, `configTypes`, g_kcType)];
		resetCursor(Number(g_kcType === `Replaced`), _scrollNum === 0);
		lnkKcType.textContent = getStgDetailName(g_kcType);
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
			document.getElementById(`pick${_type}${_j}`).style.display = C_DIS_INHERIT;
		} else {
			document.getElementById(`pick${_type}${_j}`).style.display = C_DIS_NONE;
		}
	};

	/**
	 * ColorTypeの制御
	 * @param {number} _scrollNum 
	 */
	const setColorType = (_scrollNum = 1, _reloadFlg = true) => {
		const nextNum = getNextNum(_scrollNum, `colorTypes`, g_colorType);
		g_colorType = g_keycons.colorTypes[nextNum];
		if (g_headerObj.colorUse) {
			g_stateObj.d_color = g_keycons.colorDefs[nextNum];
		}
		changeSetColor();
		viewGroupObj.color(`_${g_keycons.colorGroupNum}`);
		lnkColorType.textContent = `${getStgDetailName(g_colorType)}${g_localStorage.colorType === g_colorType ? ' *' : ''}`;
		if (_reloadFlg) {
			colorPickSprite.style.display = ([`Default`, `Type0`].includes(g_colorType) ? C_DIS_NONE : C_DIS_INHERIT);
			for (let j = 0; j < g_headerObj.setColor.length; j++) {
				changeColorPicker(j, `arrow`, g_headerObj.setColor[j]);
				changeColorPicker(j, `arrowShadow`, g_headerObj.setShadowColor[j]);
				changeColorPicker(j, `frz`, g_headerObj.frzColor[j][0]);
				changeColorPicker(j, `frzBar`, g_headerObj.frzColor[j][1]);
			}
		}
	};

	const setImgType = (_scrollNum = 1) => {
		const nextNum = getNextNum(_scrollNum, `imgTypes`, g_imgType);
		g_imgType = g_keycons.imgTypes[nextNum];
		g_stateObj.rotateEnabled = g_headerObj.imgType[nextNum].rotateEnabled;
		g_stateObj.flatStepHeight = g_headerObj.imgType[nextNum].flatStepHeight;

		updateImgType(g_headerObj.imgType[nextNum]);
		keyConfigInit(g_kcType);
	};

	const colorPickSprite = createEmptySprite(divRoot, `colorPickSprite`, g_windowObj.colorPickSprite);
	if ([`Default`, `Type0`].includes(g_colorType)) {
		colorPickSprite.style.display = C_DIS_NONE;
	}
	multiAppend(colorPickSprite,
		createDivCss2Label(`lblPickArrow`, g_lblNameObj.s_arrow, Object.assign({ y: 0 }, g_lblPosObj.pickPos)),
		createDivCss2Label(`lblPickFrz`, g_lblNameObj.s_frz, Object.assign({ y: 140 }, g_lblPosObj.pickPos)),
		createCss2Button(`lnkColorCopy`, `[↓]`, _ => {
			if (window.confirm(g_msgObj.colorCopyConfirm)) {
				for (let j = 0; j < g_headerObj.setColor.length; j++) {
					g_headerObj[`frzColor${g_colorType}`][j] = [...Array(g_headerObj[`frzColor${g_colorType}`][j].length)].fill(g_headerObj[`setColor${g_colorType}`][j]);
					[``, `Bar`].forEach((val, k) =>
						document.getElementById(`pickfrz${val}${j}`).value = g_headerObj[`frzColor${g_colorType}`][j][k]);
				}
			}
		}, g_lblPosObj.lnkColorCopy, g_cssObj.button_Start),
	);

	/**
	 * ColorPicker部分の作成
	 * @param {number} _j 
	 * @param {string} _type 
	 * @param {function} _func 
	 * @param {object} _obj 
	 */
	const createColorPickWindow = (_j, _type, _func, { x = 0, y = 15 } = {}) =>
		createColorPicker(colorPickSprite, `pick${_type}${_j}`, _func, { x, y: y + 25 * _j });

	for (let j = 0; j < g_headerObj.setColor.length; j++) {
		createColorPickWindow(j, `arrow`, _ => {
			g_headerObj[`setColor${g_colorType}`][j] = document.getElementById(`pickarrow${j}`).value;
			setColorType(0, false);
		});

		createColorPickWindow(j, `arrowShadow`, _ => {
			g_headerObj[`setShadowColor${g_colorType}`][j] = `${document.getElementById(`pickarrowShadow${j}`).value}80`;
			setColorType(0, false);
		}, { x: 25 });

		[``, `Bar`].forEach((val, k) =>
			createColorPickWindow(j, `frz${val}`, _ =>
				g_headerObj[`frzColor${g_colorType}`][j][k] = document.getElementById(`pickfrz${val}${j}`).value, { x: 25 * k, y: 155 }));
	}

	// ConfigType, ColorTypeの初期設定
	setConfigType(0);
	setColorType(0);
	keyconSprite.scrollLeft = - maxLeftX;

	// キーパターン表示
	const lblTransKey = hasVal(g_keyObj[`transKey${keyCtrlPtn}`]) ?
		`(${g_keyObj[`transKey${keyCtrlPtn}`] ?? ''})` : ``;

	// パターン検索
	const searchPattern = (_tempPtn, _sign, _transKeyUse = false, _keyCheck = `keyCtrl`) => {
		while (hasVal(g_keyObj[`${_keyCheck}${g_keyObj.currentKey}_${_tempPtn}`]) &&
			_transKeyUse === false) {
			_tempPtn += _sign;
			if (g_keyObj[`keyCtrl${g_keyObj.currentKey}_${_tempPtn}`] === undefined) {
				break;
			}
		}
		return _tempPtn;
	};

	// ユーザカスタムイベント(初期)
	g_customJsObj.keyconfig.forEach(func => func());

	// ラベル・ボタン描画
	multiAppend(divRoot,

		// 設定画面へ戻る
		createCss2Button(`btnBack`, g_lblNameObj.b_settings, _ => {
			g_currentj = 0;
			g_currentk = 0;
			g_prevKey = 0;
		}, Object.assign(g_lblPosObj.btnKcBack, {
			resetFunc: _ => (g_baseDisp === `Settings` ? optionInit() : settingsDisplayInit()),
		}), g_cssObj.button_Back),

		createDivCss2Label(`lblPattern`, `${g_lblNameObj.KeyPattern}: ${g_keyObj.currentPtn === -1 ?
			'Self' : g_keyObj.currentPtn + 1}${lblTransKey}`, g_lblPosObj.lblPattern),

		// パターン変更ボタン描画(右回り)
		createCss2Button(`btnPtnChangeR`, `>>`, _ => true, Object.assign(g_lblPosObj.btnPtnChangeR, {
			resetFunc: _ => {
				const tempPtn = searchPattern(g_keyObj.currentPtn + 1, 1, g_headerObj.transKeyUse, `transKey`);
				g_keyObj.currentPtn = (g_keyObj[`keyCtrl${g_keyObj.currentKey}_${tempPtn}`] !== undefined ?
					tempPtn : (g_keyObj[`keyCtrl${g_keyObj.currentKey}_-1`] !== undefined ? -1 : 0));

				keyConfigInit();
			},
		}), g_cssObj.button_Setting),

		// パターン変更ボタン描画(左回り)
		createCss2Button(`btnPtnChangeL`, `<<`, _ => true, Object.assign(g_lblPosObj.btnPtnChangeL, {
			resetFunc: _ => {
				const tempPtn = searchPattern(g_keyObj.currentPtn - 1, -1, g_headerObj.transKeyUse, `transKey`);
				g_keyObj.currentPtn = (g_keyObj[`keyCtrl${g_keyObj.currentKey}_${tempPtn}`] !== undefined ?
					tempPtn : searchPattern(searchPattern(0, 1) - 1, -1, g_headerObj.transKeyUse, `transKey`));

				keyConfigInit();
			},
		}), g_cssObj.button_Setting),

		// キーコンフィグリセットボタン描画
		createCss2Button(`btnReset`, g_lblNameObj.b_reset, _ => {
			if (window.confirm(g_msgObj.keyResetConfirm)) {
				for (let j = 0; j < keyNum; j++) {
					for (let k = 0; k < g_keyObj[`keyCtrl${keyCtrlPtn}`][j].length; k++) {
						g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k] = setIntVal(g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k]);
						document.querySelector(`#keycon${j}_${k}`).textContent = g_kCd[g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]];
						changeKeyConfigColor(j, k, g_keyObj.currentPtn === -1 ? g_cssObj.keyconfig_Defaultkey : g_cssObj.title_base);
					}
				}
				resetCursor(Number(g_kcType === `Replaced`));
				keyconSprite.scrollLeft = - maxLeftX;
			}
		}, g_lblPosObj.btnKcReset, g_cssObj.button_Reset),

		// プレイ開始
		makePlayButton(_ => loadMusic())
	);

	// キーボード押下時処理
	setShortcutEvent(g_currentPage, setCode => {
		const keyCdObj = document.querySelector(`#keycon${g_currentj}_${g_currentk}`);
		let setKey = g_kCdN.findIndex(kCd => kCd === setCode);

		// 全角切替、BackSpace、Deleteキー、Escキーは割り当て禁止
		// また、直前と同じキーを押した場合(BackSpaceを除く)はキー操作を無効にする
		const disabledKeys = [229, 240, 242, 243, 244, 91, 29, 28, 27, g_prevKey];
		if (disabledKeys.includes(setKey) || g_kCdN[setKey] === undefined) {
			makeInfoWindow(g_msgInfoObj.I_0002, `fadeOut0`);
			return;
		} else if ((setKey === C_KEY_TITLEBACK && g_currentk === 0) ||
			(keyIsDown(g_kCdNameObj.metaKey) && keyIsDown(g_kCdNameObj.shiftKey))) {
			return;
		}

		if (setKey === C_KEY_RETRY && (!g_isMac || (g_isMac && g_currentk === 0))) {
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
			cursor.style.top = `${parseInt(cursor.style.top) + C_KYC_REPHEIGHT}px`;

		} else if (g_currentj < keyNum - 1) {
			// 他の代替キーが存在せず、次の矢印がある場合
			g_currentj++;
			g_currentk = 0;

			// 代替キーのみの場合は次の代替キーがあるキーを探す
			if (g_kcType === `Replaced`) {
				searchNextCursor(1);
			}
			setKeyConfigCursor();

		} else {
			// 全ての矢印・代替キーの巡回が終わった場合は元の位置に戻す
			resetCursor(Number(g_kcType === `Replaced`));
		}
	});

	g_skinJsObj.keyconfig.forEach(func => func());
	document.onkeyup = evt => commonKeyUp(evt);
	document.oncontextmenu = _ => false;
};

/**
 * 影矢印色の取得
 * @param {number} _colorPos 
 * @param {string} _arrowColor 
 * @returns 
 */
const getShadowColor = (_colorPos, _arrowColor) => g_headerObj.setShadowColor[_colorPos] === `Default` ?
	_arrowColor : g_headerObj.setShadowColor[_colorPos];

/**
 * キー数基礎情報の取得
 * @returns 
 */
const getKeyInfo = _ => {
	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;
	const posMax = (g_keyObj[`divMax${keyCtrlPtn}`] !== undefined ?
		g_keyObj[`divMax${keyCtrlPtn}`] : g_keyObj[`pos${keyCtrlPtn}`][keyNum - 1] + 1);
	const divideCnt = g_keyObj[`div${keyCtrlPtn}`] - 1;

	return { keyCtrlPtn: keyCtrlPtn, keyNum: keyNum, posMax: posMax, divideCnt: divideCnt };
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
const changeSetColor = _ => {
	const isDefault = [`Default`, `Type0`].includes(g_colorType);
	const scoreIdHeader = setScoreIdHeader(g_stateObj.scoreId);
	const defaultType = scoreIdHeader + g_colorType;
	const currentTypes = {
		'': (isDefault ? defaultType : g_colorType),
		'Shadow': (isDefault ? defaultType : `${scoreIdHeader}Default`),
	};
	Object.keys(currentTypes).forEach(pattern => {
		g_headerObj[`set${pattern}Color`] = copyArray2d(g_headerObj[`set${pattern}Color${currentTypes[pattern]}`]);
		for (let j = 0; j < g_headerObj.setColorInit.length; j++) {
			g_headerObj[`frz${pattern}Color`][j] = copyArray2d(g_headerObj[`frz${pattern}Color${currentTypes[pattern]}`][j]);
		}
		if (!isDefault) {
			g_headerObj[`set${pattern}Color`] = copyArray2d(g_headerObj[`set${pattern}Color${g_colorType}`]);
		}
	});

	// 影矢印が未指定の場合はType1, Type2の影矢印指定を無くす
	if (!hasVal(g_headerObj[`setShadowColor${scoreIdHeader}Default`][0]) && [`Type1`, `Type2`].includes(g_colorType)) {
		g_headerObj.setShadowColor = [...Array(g_headerObj.setColorInit.length)].fill(``);
	}
};

/*-----------------------------------------------------------*/
/* Scene : LOADING [strawberry] */
/*-----------------------------------------------------------*/

const loadMusic = _ => {

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
	request.addEventListener(`load`, _ => {
		if (request.status >= 200 && request.status < 300) {
			const blobUrl = URL.createObjectURL(request.response);
			createEmptySprite(divRoot, `loader`, g_windowObj.loader);
			lblLoading.textContent = g_lblNameObj.pleaseWait;
			setAudio(blobUrl);
		} else {
			makeWarningWindow(`${g_msgInfoObj.E_0032}<br>(${request.status} ${request.statusText})`, { backBtnUse: true });
		}
	});

	// 進捗時
	request.addEventListener(`progress`, _event => {
		const lblLoading = document.querySelector(`#lblLoading`);

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
	request.addEventListener(`timeout`, _ => makeWarningWindow(`${g_msgInfoObj.E_0033}`, { backBtnUse: true }));
	request.addEventListener(`error`, _ => makeWarningWindow(`${g_msgInfoObj.E_0034}`, { backBtnUse: true }));

	request.send();
};

/**
 * 音楽データの設定
 * iOSの場合はAudioタグによる再生
 * @param {string} _url 
 */
const setAudio = async (_url) => {

	const loadMp3 = _ => {
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
			readyToStart(_ => initWebAudioAPIfromBase64(g_musicdata));
		} else {
			makeWarningWindow(g_msgInfoObj.E_0031);
			musicAfterLoaded();
		}
	} else {
		readyToStart(_ => loadMp3());
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

const musicAfterLoaded = _ => {
	g_audio.load();

	if (g_audio.readyState === 4) {
		// audioの読み込みが終わった後の処理
		loadingScoreInit();
	} else {
		// 読込中の状態
		g_audio.addEventListener(`canplaythrough`, (_ => function f() {
			g_audio.removeEventListener(`canplaythrough`, f, false);
			loadingScoreInit();
		})(), false);

		// エラー時
		g_audio.addEventListener(`error`, (_ => function f() {
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
	g_scoreObj.baseFrame = g_scoreObj.frameNum - g_stateObj.intAdjustment;

	// フレームごとの速度を取得（配列形式）
	let speedOnFrame = setSpeedOnFrame(g_scoreObj.speedData, lastFrame);

	// Motionオプション適用時の矢印別の速度を取得（配列形式）
	const motionOnFrame = setMotionOnFrame();
	g_workObj.motionOnFrames = copyArray2d(motionOnFrame);

	// 最初のフレームで出現する矢印が、ステップゾーンに到達するまでのフレーム数を取得
	const firstFrame = (g_scoreObj.frameNum === 0 ? 0 : g_scoreObj.frameNum + g_headerObj.blankFrame);
	let arrivalFrame = getFirstArrivalFrame(firstFrame, speedOnFrame, motionOnFrame);

	// キーパターン(デフォルト)に対応する矢印番号を格納
	convertReplaceNums();

	const setData = (_data, _minLength = 1) => {
		return (hasArrayList(_data, _minLength) ? _data.concat() : []);
	};

	// フレーム・曲開始位置調整
	let preblankFrame = 0;
	if (g_scoreObj.frameNum === 0) {
		if (firstArrowFrame - C_MAX_ADJUSTMENT < arrivalFrame) {
			preblankFrame = arrivalFrame - firstArrowFrame + C_MAX_ADJUSTMENT;

			// 譜面データの再読み込み
			const noteExistObj = {
				arrow: true,
				frz: true,
				dummyArrow: g_stateObj.shuffle === C_FLG_OFF,
				dummyFrz: g_stateObj.shuffle === C_FLG_OFF,
			};
			const tmpObj = scoreConvert(g_rootObj, g_stateObj.scoreId, preblankFrame, dummyIdHeader);
			for (let j = 0; j < keyNum; j++) {
				Object.keys(noteExistObj).forEach(name => {
					if (tmpObj[`${name}Data`][j] !== undefined && noteExistObj[name]) {
						g_scoreObj[`${name}Data`][j] = copyArray2d(tmpObj[`${name}Data`][j]);
					}
				});
			}

			Object.keys(g_dataMinObj).forEach(dataType => {
				g_scoreObj[`${dataType}Data`] = setData(tmpObj[`${dataType}Data`], g_dataMinObj[dataType]);
			});

			lastFrame += preblankFrame;
			firstArrowFrame += preblankFrame;
			speedOnFrame = setSpeedOnFrame(g_scoreObj.speedData, lastFrame);
			arrivalFrame = getFirstArrivalFrame(firstFrame, speedOnFrame, motionOnFrame);
			g_headerObj.blankFrame += preblankFrame;
		}
	}

	// シャッフルグループ未定義の場合
	if (g_keyObj[`shuffle${keyCtrlPtn}`] === undefined) {
		g_keyObj[`shuffle${keyCtrlPtn}`] = [...Array(keyNum)].fill(0);
	}

	// シャッフルグループを扱いやすくする
	// [0, 0, 0, 1, 0, 0, 0] -> [[0, 1, 2, 4, 5, 6], [3]]
	const shuffleGroupMap = {};
	g_keyObj[`shuffle${keyCtrlPtn}`].forEach((_val, _i) => {
		if (shuffleGroupMap[_val] === undefined) {
			shuffleGroupMap[_val] = [];
		}
		shuffleGroupMap[_val].push(_i);
	});

	// Mirror,Random,S-Randomの適用
	g_shuffleFunc[g_stateObj.shuffle](keyNum, Object.values(shuffleGroupMap));

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
	g_scoreObj.frzData.forEach(data => g_allFrz += data.length);

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

	const tempId = setInterval(() => {
		const executeMain = _ => {
			clearInterval(tempId);
			mainInit();
		}
		if (g_audio.duration !== undefined) {
			if (g_userAgent.indexOf(`firefox`) !== -1) {
				if (g_preloadFiles.image.every(v => g_loadObj[v] === true)) {
					executeMain();
				}
			} else {
				executeMain();
			}
		}
	}, 100);
};

const setScoreIdHeader = (_scoreId = 0, _scoreLockFlg = false) => {
	if (_scoreId > 0 && _scoreLockFlg === false) {
		return Number(_scoreId) + 1;
	}
	return ``;
};

/**
 * Mirror,Randomの適用
 * @param {number} _keyNum
 * @param {array} _shuffleGroup
 * @param {array} _style
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
		const tmpData = copyArray2d(g_scoreObj[`${type}Data`]);
		for (let i = 0; i < _keyNum; i++) {
			g_scoreObj[`${type}Data`][i] = tmpData[index[i]] || [];
		}
	});
};

/**
 * Mirrorの適用
 * @param {number} _keyNum
 * @param {array} _shuffleGroup
 */
const applyMirror = (_keyNum, _shuffleGroup, _asymFlg = false) => {
	// シャッフルグループごとにミラー
	const style = copyArray2d(_shuffleGroup).map(_group => _group.reverse());
	if (_asymFlg) {
		// グループが4の倍数のとき、4n+1, 4n+2のみ入れ替える
		style.forEach((group, i) => {
			if (group.length % 4 === 0) {
				for (let k = 0; k < group.length / 4; k++) {
					[style[i][4 * k + 1], style[i][4 * k + 2]] = [style[i][4 * k + 2], style[i][4 * k + 1]];
				}
			}
		});
	}
	applyShuffle(_keyNum, _shuffleGroup, style);
};

/**
 * Randomの適用
 * @param {number} _keyNum
 * @param {array} _shuffleGroup
 */
const applyRandom = (_keyNum, _shuffleGroup) => {
	// シャッフルグループごとにシャッフル(Fisher-Yates)
	const style = copyArray2d(_shuffleGroup).map(_group => {
		for (let i = _group.length - 1; i > 0; i--) {
			const random = Math.floor(Math.random() * (i + 1));
			const tmp = _group[i];
			_group[i] = _group[random];
			_group[random] = tmp;
		}
		return _group;
	});
	applyShuffle(_keyNum, _shuffleGroup, style);
};

/**
 * S-Randomの適用
 * @param {number} _keyNum
 * @param {array} _shuffleGroup
 */
const applySRandom = (_keyNum, _shuffleGroup, _arrowHeader, _frzHeader) => {

	const tmpArrowData = [...Array(_keyNum)].map(_ => []);
	const tmpFrzData = [...Array(_keyNum)].map(_ => []);

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
			const freeSpaces = _group.filter(
				_key => tmpFrzData[_key].find(_other => _freeze.begin <= _other.end) === undefined
			);
			// ランダムに配置
			const random = Math.floor(Math.random() * freeSpaces.length);
			tmpFrzData[freeSpaces[random]].push(_freeze);
		});

		// 通常矢印の配置
		const allArrows = _group.map(_key => g_scoreObj[`${_arrowHeader}Data`][_key]).flat();
		allArrows.sort((_a, _b) => _a - _b);
		allArrows.forEach(_arrow => {
			// 置ける場所を検索
			const freeSpaces = _group.filter(_key =>
				// フリーズと重ならない
				tmpFrzData[_key].find(_freeze => _arrow >= _freeze.begin && _arrow <= _freeze.end) === undefined
				// 通常矢印と重ならない
				&& tmpArrowData[_key].find(_other => _arrow === _other) === undefined
			);
			// ランダムに配置
			const random = Math.floor(Math.random() * freeSpaces.length);
			tmpArrowData[freeSpaces[random]].push(_arrow);
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
 * @param {string} _dummyNo ダミー用譜面番号添え字
 * @param {string} _keyCtrlPtn 選択キー及びパターン
 * @param {boolean} _scoreAnalyzeFlg (default : false)
 */
const scoreConvert = (_dosObj, _scoreId, _preblankFrame, _dummyNo = ``,
	_keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`, _scoreAnalyzeFlg = false) => {

	// 矢印群の格納先
	const obj = {};

	const scoreIdHeader = setScoreIdHeader(_scoreId, g_stateObj.scoreLockFlg);
	const keyNum = g_keyObj[`chara${_keyCtrlPtn}`].length;
	obj.arrowData = [];
	obj.frzData = [];
	obj.dummyArrowData = [];
	obj.dummyFrzData = [];

	// realAdjustment: 全体, intAdjustment: 整数値のみ(切り捨て), decimalAdjustment: 小数値のみ
	const headerAdjustment = parseFloat(g_headerObj.adjustment[g_stateObj.scoreId] || g_headerObj.adjustment[0]);
	g_stateObj.realAdjustment = parseFloat(g_stateObj.adjustment) + headerAdjustment + _preblankFrame;
	g_stateObj.intAdjustment = Math.floor(g_stateObj.realAdjustment);
	g_stateObj.decimalAdjustment = g_stateObj.realAdjustment - g_stateObj.intAdjustment;

	const blankFrame = g_headerObj.blankFrame;
	const calcFrame = _frame => Math.round((parseFloat(_frame) - blankFrame) / g_headerObj.playbackRate + blankFrame + g_stateObj.intAdjustment);

	/**
	 * 矢印データの格納
	 * @param {string} _data 
	 */
	const storeArrowData = _data => {
		let arrowData = [];

		if (hasVal(_data)) {
			const tmpData = splitLF(_data).join(``);
			if (tmpData !== undefined) {
				arrowData = tmpData.split(`,`);
				if (isNaN(parseFloat(arrowData[0]))) {
					return [];
				} else {
					arrowData = arrowData.map(data => calcFrame(data)).sort((_a, _b) => _a - _b);
				}
			}
		}
		return arrowData;
	};

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
	 */
	const setSpeedData = (_header, _scoreNo, _footer = `_data`) => {
		const speedData = [];

		if (hasVal(_dosObj[`${_header}${_scoreNo}${_footer}`]) && g_stateObj.d_speed === C_FLG_ON) {
			const tmpArrayData = splitLF(_dosObj[`${_header}${_scoreNo}${_footer}`]);

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
	 * @returns 
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
	 */
	const setColorData = (_header, _scoreNo) => {
		const colorData = [];
		const allFlg = (_header.charAt(0) === `a`);

		if (hasVal(_dosObj[`${_header}${_scoreNo}_data`]) && g_stateObj.d_color === C_FLG_ON) {
			const tmpArrayData = splitLF(_dosObj[`${_header}${_scoreNo}_data`]);

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
	 * 矢印モーションデータの分解・格納（フレーム数, 矢印番号）
	 * @param {string} _header 
	 * @param {number} _scoreNo 
	 */
	const setCssMotionData = (_header, _scoreNo) => {
		const dosCssMotionData = _dosObj[`${_header}Motion${_scoreNo}_data`] || _dosObj[`${_header}Motion_data`];
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
			return cssMotionData.sort((_a, _b) => _a[0] - _b[0]).flat();
		}
		return [];
	};

	/**
	 * 譜面データの優先順配列の取得
	 * @param {string} _header 
	 * @param {string} _type 
	 * @param {number} _scoreNo 
	 * @returns 
	 */
	const getPriorityList = (_header, _type, _scoreNo) => [
		_dosObj[`${_header}${_type}${g_localeObj.val}${_scoreNo}_data`],
		_dosObj[`${_header}${_type}${g_localeObj.val}_data`],
		_dosObj[`${_header}${_type}${_scoreNo}_data`],
		_dosObj[`${_header}${_type}_data`]
	];

	/**
	 * 歌詞データの分解
	 * @param {string} _scoreNo 
	 */
	const makeWordData = _scoreNo => {
		const wordDataList = [];
		let wordReverseFlg = false;
		const divideCnt = getKeyInfo().divideCnt;
		const addDataList = (_type = ``) => wordDataList.push(...getPriorityList(`word`, _type, _scoreNo));

		if (g_stateObj.scroll !== `---`) {
			addDataList(`Alt`);
		} else if (g_stateObj.reverse === C_FLG_ON) {
			addDataList(`Rev`);

			// wordRev_dataが指定されている場合はそのままの位置を採用
			// word_dataのみ指定されている場合、下記ルールに従って設定
			if (wordDataList.find((v) => v !== undefined) === undefined) {
				// Reverse時の歌詞の自動反転制御設定
				if (g_headerObj.wordAutoReverse !== `auto`) {
					wordReverseFlg = g_headerObj.wordAutoReverse === C_FLG_ON;
				} else if (keyNum === divideCnt + 1) {
					wordReverseFlg = true;
				}
			}
		}
		addDataList();

		const inputWordData = wordDataList.find((v) => v !== undefined);
		return (inputWordData !== undefined ? makeSpriteWordData(inputWordData, wordReverseFlg) : [[], -1]);
	};

	/**
	 * 多層歌詞データの格納処理
	 * @param {object} _data 
	 * @param {boolean} _reverseFlg
	 */
	const makeSpriteWordData = (_data, _reverseFlg = false) => {
		const wordData = [];
		let wordMaxDepth = -1;
		let wordReverseFlg = _reverseFlg;
		const tmpArrayData = splitLF(_data);

		if (g_headerObj.wordAutoReverse === `auto`) {
			tmpArrayData.filter(data => hasVal(data)).forEach(tmpData => {
				if (tmpData.indexOf(`<br>`) !== -1) {
					wordReverseFlg = false;
				}
			});
		}

		tmpArrayData.filter(data => hasVal(data)).forEach(tmpData => {
			const tmpWordData = tmpData.split(`,`);
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

				let addFrame = 0;
				[wordData[tmpWordData[k]], addFrame] =
					checkDuplicatedObjects(wordData[tmpWordData[k]]);

				if (tmpWordData.length > 3 && tmpWordData.length < 6) {
					tmpWordData[3] = setIntVal(tmpWordData[3], C_WOD_FRAME);
					wordData[tmpWordData[0]][addFrame].push(tmpWordData[1],
						escapeHtmlForEnabledTag(tmpWordData[2]), tmpWordData[3]);
					break;
				} else {
					wordData[tmpWordData[k]][addFrame].push(tmpWordData[k + 1],
						escapeHtmlForEnabledTag(tmpWordData[k + 2] ?? ``));
				}
			}
		});

		return [wordData, wordMaxDepth];
	};

	/**
	 * 背景・マスクデータの分解
	 * @param {string} _header 
	 * @param {string} _scoreNo
	 */
	const makeBackgroundData = (_header, _scoreNo) => {
		const dataList = [];
		const addDataList = (_type = ``) => dataList.push(...getPriorityList(_header, _type, _scoreNo));

		if (g_stateObj.scroll !== `---`) {
			addDataList(`Alt`);
		} else if (g_stateObj.reverse === C_FLG_ON) {
			addDataList(`Rev`);
		}
		addDataList();

		const data = dataList.find((v) => v !== undefined);
		return (data !== undefined ? makeSpriteData(data, calcFrame) : [[], -1]);
	};

	/**
	 * リザルトモーションデータ(結果画面用背景・マスクデータ)の分解
	 * @param {string} _header 
	 * @param {string} _scoreNo 
	 * @param {string} _defaultHeader 
	 */
	const makeBackgroundResultData = (_header, _scoreNo, _defaultHeader = ``) => {
		const dataList = [];
		const addResultDataList = _headerType => dataList.push(...getPriorityList(``, _headerType, _scoreNo));
		addResultDataList(_header);
		if (_defaultHeader !== ``) {
			addResultDataList(_defaultHeader);
		}

		const data = dataList.find((v) => v !== undefined);
		return (data !== undefined ? makeSpriteData(data) : [[], -1]);
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

	// 歌詞データの分解 (3つで1セット, セット毎の改行区切り可)
	obj.wordData = [];
	obj.wordMaxDepth = -1;
	if (g_stateObj.d_lyrics === C_FLG_OFF) {
	} else {
		[obj.wordData, obj.wordMaxDepth] = makeWordData(scoreIdHeader);
	}

	// 背景・マスクデータの分解 (下記すべてで1セット、改行区切り)
	// [フレーム数, 階層, 背景パス, class(CSSで別定義), X, Y, width, height, opacity, animationName, animationDuration]
	obj.maskData = [];
	obj.maskMaxDepth = -1;
	obj.backData = [];
	obj.backMaxDepth = -1;
	if (g_stateObj.d_background === C_FLG_OFF) {
	} else {
		g_animationData.forEach(sprite => {
			[obj[`${sprite}Data`], obj[`${sprite}MaxDepth`]] = makeBackgroundData(sprite, scoreIdHeader);
		});
	}

	// 結果画面用・背景/マスクデータの分解 (下記すべてで1セット、改行区切り)
	// [フレーム数,階層,背景パス,class(CSSで別定義),X,Y,width,height,opacity,animationName,animationDuration]
	if (g_stateObj.d_background === C_FLG_OFF && g_headerObj.resultMotionSet) {
		const backgroundResults = [`backResult`, `maskResult`, `backFailed`, `maskFailed`];
		backgroundResults.forEach(backName => {
			g_headerObj[`${backName}Data`] = [];
			g_headerObj[`${backName}MaxDepth`] = -1;
		});
	} else {
		g_animationData.forEach(sprite => {
			[g_headerObj[`${sprite}ResultData`], g_headerObj[`${sprite}ResultMaxDepth`]] =
				makeBackgroundResultData(`${sprite}result`, scoreIdHeader);
			[g_headerObj[`${sprite}FailedData`], g_headerObj[`${sprite}FailedMaxDepth`]] =
				makeBackgroundResultData(`${sprite}failed${g_stateObj.lifeMode.slice(0, 1)}`, scoreIdHeader, `${sprite}result`);
		});
	}

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
 * @param {string} _keyCtrlPtn
 */
const getLastFrame = (_dataObj, _keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`) => {

	let tmpLastNum = 0;
	const keyNum = g_keyObj[`chara${_keyCtrlPtn}`].length;

	for (let j = 0; j < keyNum; j++) {
		const data = [
			_dataObj.arrowData[j],
			_dataObj.frzData[j],
			_dataObj.dummyArrowData[j],
			_dataObj.dummyFrzData[j]
		];

		data.filter(data => hasVal(data)).forEach(_objData => {
			if (_objData[_objData.length - 1] > tmpLastNum) {
				tmpLastNum = _objData[_objData.length - 1];
			}
		});
	}
	return tmpLastNum;
};

/**
 * 最初の矢印フレームの取得
 * @param {object} _dataObj 
 * @param {string} _keyCtrlPtn
 */
const getFirstArrowFrame = (_dataObj, _keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`) => {

	let tmpFirstNum = Infinity;
	const keyNum = g_keyObj[`chara${_keyCtrlPtn}`].length;

	for (let j = 0; j < keyNum; j++) {
		const data = [
			_dataObj.arrowData[j],
			_dataObj.frzData[j],
			_dataObj.dummyArrowData[j],
			_dataObj.dummyFrzData[j]
		];

		data.filter(data => hasVal(data)).forEach(_objData => {
			if (_objData[0] !== ``) {
				if (_objData[0] < tmpFirstNum && _objData[0] + C_MAX_ADJUSTMENT > 0) {
					tmpFirstNum = _objData[0];
				}
			}
		});
	}
	return (tmpFirstNum === Infinity ? 0 : tmpFirstNum);
};

/**
 * 開始フレームの取得
 * @param {number} _lastFrame 
 * @param {number} _fadein
 * @param {number} _scoreId
 */
const getStartFrame = (_lastFrame, _fadein = 0, _scoreId = g_stateObj.scoreId) => {
	let frameNum = 0;
	if (g_headerObj.startFrame !== undefined) {
		frameNum = parseInt(g_headerObj.startFrame[_scoreId] || g_headerObj.startFrame[0] || 0);
	}
	if (_lastFrame >= frameNum) {
		frameNum = Math.round(_fadein / 100 * (_lastFrame - frameNum)) + frameNum;
	}
	return frameNum;
};

/**
 * 各フレームごとの速度を格納
 * @param {object} _speedData 
 * @param {number} _lastFrame 
 */
const setSpeedOnFrame = (_speedData, _lastFrame) => {

	const speedOnFrame = [];
	let currentSpeed = g_stateObj.speed * 2;

	for (let frm = 0, s = 0; frm <= _lastFrame; frm++) {
		while (_speedData !== undefined && frm >= _speedData[s]) {
			currentSpeed = _speedData[s + 1] * g_stateObj.speed * 2;
			s += 2;
		}
		speedOnFrame[frm] = currentSpeed;
	}
	return speedOnFrame;
};

/**
 * Motionオプション適用時の矢印別の速度設定
 * - 配列の数字は小さいほどステップゾーンに近いことを示す。
 * - 15がステップゾーン上、0～14は矢印の枠外管理用
 */
const setMotionOnFrame = _ => {

	// 矢印が表示される最大フレーム数
	const motionLastFrame = g_sHeight * 20;
	const brakeLastFrame = g_sHeight / 2;

	const motionOnFrame = [...Array(motionLastFrame + 1)].fill(0);

	if (g_stateObj.motion === C_FLG_OFF) {
	} else if (g_stateObj.motion === `Boost`) {
		// ステップゾーンに近づくにつれて加速量を大きくする (16 → 85)
		for (let j = C_MOTION_STD_POS + 1; j < C_MOTION_STD_POS + 70; j++) {
			motionOnFrame[j] = (C_MOTION_STD_POS + 70 - j) * 3 / 50;
		}
	} else if (g_stateObj.motion === `Brake`) {
		// 初期は+2x、ステップゾーンに近づくにつれて加速量を下げる (20 → 34)
		for (let j = C_MOTION_STD_POS + 5; j < C_MOTION_STD_POS + 19; j++) {
			motionOnFrame[j] = (j - 15) * 4 / 14;
		}
		for (let j = C_MOTION_STD_POS + 19; j <= brakeLastFrame; j++) {
			motionOnFrame[j] = 4;
		}
	}

	return motionOnFrame;
};

/**
 * 最初のフレームで出現する矢印が、ステップゾーンに到達するまでのフレーム数を取得
 * @param {number} _startFrame 
 * @param {object} _speedOnFrame 
 * @param {object} _motionOnFrame 
 */
const getFirstArrivalFrame = (_startFrame, _speedOnFrame, _motionOnFrame) => {
	let startY = 0;
	let frm = _startFrame;
	let motionFrm = C_MOTION_STD_POS;

	while (g_posObj.distY - startY > 0) {
		startY += _speedOnFrame[frm];

		if (_speedOnFrame[frm] !== 0) {
			startY += _motionOnFrame[motionFrm];
			motionFrm++;
		}
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
	[``, `Dummy`].forEach(header => {
		g_typeLists.dataList.forEach(name => {
			g_workObj[`mk${header}${name}`] = [];
		});
	});

	/** 矢印の移動距離 */
	g_workObj.initY = [];
	/** 矢印がステップゾーンに到達するまでのフレーム数 */
	g_workObj.arrivalFrame = [];
	/** Motionの適用フレーム数 */
	g_workObj.motionFrame = [];

	const getSpeedPos = _ => {
		let spdk, spdPrev;
		if (_dataObj.speedData !== undefined) {
			spdk = _dataObj.speedData.length - 2;
			spdPrev = _dataObj.speedData[spdk];
		} else {
			spdPrev = 0;
		}
		return [spdk, spdPrev];
	};

	const setNotes = (_j, _k, _data, _startPoint, _header, _frzFlg = false) => {
		if (_startPoint >= 0) {
			if (g_workObj[`mk${_header}Arrow`][_startPoint] === undefined) {
				g_workObj[`mk${_header}Arrow`][_startPoint] = [];
			}
			g_workObj[`mk${_header}Arrow`][_startPoint].push(_j);

			if (_frzFlg) {
				g_workObj[`mk${_header}Length`][_j][_k] = getFrzLength(_speedOnFrame, _data[_k], _data[_k + 1]);
			}
		} else if (_frzFlg && g_workObj[`mk${_header}Length`][_j] !== undefined) {
			g_workObj[`mk${_header}Length`][_j] = copyArray2d(g_workObj[`mk${_header}Length`][_j].slice(_k + 2));
		}
	};

	const calcNotes = (_j, _data, _header = ``, _frzFlg = false) => {
		if (_data === undefined) {
			return;
		}

		const camelHeader = toCapitalize(_header);
		const setcnt = (_frzFlg ? 2 : 1);

		const startPoint = [];
		let spdNext = Infinity;
		let [spdk, spdPrev] = getSpeedPos();

		// 最後尾のデータから計算して格納
		const lastk = _data.length - setcnt;
		let arrowArrivalFrm = _data[lastk];
		let tmpObj = getArrowStartFrame(arrowArrivalFrm, _speedOnFrame, _motionOnFrame);

		startPoint[lastk] = tmpObj.frm;
		let frmPrev = tmpObj.frm;
		g_workObj.initY[frmPrev] = tmpObj.startY;
		g_workObj.arrivalFrame[frmPrev] = tmpObj.arrivalFrm;
		g_workObj.motionFrame[frmPrev] = tmpObj.motionFrm;

		if (_frzFlg) {
			g_workObj[`mk${camelHeader}Length`][_j] = [];
		}
		setNotes(_j, lastk, _data, startPoint[lastk], camelHeader, _frzFlg);

		// 矢印は1つずつ、フリーズアローは2つで1セット
		for (let k = lastk - setcnt; k >= 0; k -= setcnt) {
			arrowArrivalFrm = _data[k];

			if (arrowArrivalFrm < _firstArrivalFrame) {

				// 出現位置が開始前の場合は除外
				if (_frzFlg && g_workObj[`mk${camelHeader}Length`][_j] !== undefined) {
					g_workObj[`mk${camelHeader}Length`][_j] = copyArray2d(g_workObj[`mk${camelHeader}Length`][_j].slice(k + 2));
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

			} else {

				// 速度変化が間に入るときは再計算
				if (arrowArrivalFrm < spdPrev) {
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
			}

			// 出現タイミングを保存
			setNotes(_j, k, _data, startPoint[k], camelHeader, _frzFlg);
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
	let tmpObj;
	g_workObj.boostData = [];
	g_workObj.boostData.length = 0;
	if (hasArrayList(_dataObj.boostData, 2)) {
		let delBoostIdx = 0;
		for (let k = _dataObj.boostData.length - 2; k >= 0; k -= 2) {
			if (_dataObj.boostData[k] < g_scoreObj.frameNum) {
				delBoostIdx = k + 2;
				break;
			} else {
				tmpObj = getArrowStartFrame(_dataObj.boostData[k], _speedOnFrame, _motionOnFrame);
				if (tmpObj.frm < g_scoreObj.frameNum) {
					_dataObj.boostData[k] = g_scoreObj.frameNum;
					delBoostIdx = k;
					break;
				} else {
					_dataObj.boostData[k] = tmpObj.frm;
				}
			}
		}
		for (let k = 0; k < delBoostIdx; k++) {
			_dataObj.boostData.shift();
		}
		g_workObj.boostData = copyArray2d(_dataObj.boostData);
	}

	/**
	 * 色変化・モーションデータのタイミング更新
	 * @param {string} _type 
	 * @param {string} _header 
	 * @param {function} _setFunc 
	 * @param {object} obj _colorFlg: 個別色変化フラグ, _calcFrameFlg: 逆算を無条件で行うかどうかの可否
	 * @returns 
	 */
	const calcDataTiming = (_type, _header, _setFunc = _ => true,
		{ _term = 4, _colorFlg = false, _calcFrameFlg = false } = {}) => {

		const camelHeader = _header === `` ? _type : `${_header}${toCapitalize(_type)}`;
		const baseData = _dataObj[`${camelHeader}Data`];

		if (!hasArrayList(baseData, _term)) {
			return;
		}
		const frontData = [];
		for (let k = baseData.length - _term; k >= 0; k -= _term) {
			const calcFrameFlg = (_colorFlg && !isFrzHitColor(baseData[k + 1]) && !baseData[k + 3]) || _calcFrameFlg;

			if (baseData[k] < g_scoreObj.frameNum) {
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

		const fuzzyCheck = (_str, _list) => listMatching(_str, _list);
		const isExceptData = {
			word: (_exceptList, _j) => fuzzyCheck(_data[startNum][_j][1], _exceptList.word),
			back: (_exceptList, _j) => fuzzyCheck(_data[startNum][_j].animationName, _exceptList.back),
			mask: (_exceptList, _j) => fuzzyCheck(_data[startNum][_j].animationName, _exceptList.mask),
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
		if (getLength(_data[startNum], _type) > 0) {
			_data[startNum] = _data[startNum].filter(list => getLength(list) > 0);
		}

		return _data;
	};

	// 個別・全体色変化、モーションデータのタイミング更新
	[``, `dummy`].forEach(type =>
		calcDataTiming(`color`, type, pushColors, { _colorFlg: true }));

	g_typeLists.arrow.forEach(header =>
		calcDataTiming(`cssMotion`, header, pushCssMotions, { _calcFrameFlg: true }));

	g_fadeinStockList.forEach(type =>
		_dataObj[`${type}Data`] = calcAnimationData(type, _dataObj[`${type}Data`]));


	// 実際に処理させる途中変速配列を作成
	g_workObj.speedData = [];
	g_workObj.speedData.length = 0;
	g_workObj.speedData.push(g_scoreObj.frameNum);
	g_workObj.speedData.push(_speedOnFrame[g_scoreObj.frameNum]);

	if (_dataObj.speedData !== undefined) {
		for (let k = 0; k < _dataObj.speedData.length; k += 2) {
			if (_dataObj.speedData[k] >= g_scoreObj.frameNum) {
				g_workObj.speedData.push(_dataObj.speedData[k]);
				g_workObj.speedData.push(_speedOnFrame[_dataObj.speedData[k]]);
			}
		}
	}
};

/**
 * ステップゾーン到達地点から逆算して開始フレームを取得
 * @param {number} _frame 
 * @param {object} _speedOnFrame 
 * @param {object} _motionOnFrame 
 */
const getArrowStartFrame = (_frame, _speedOnFrame, _motionOnFrame) => {

	const obj = {
		frm: _frame,
		startY: 0,
		arrivalFrm: 0,
		motionFrm: C_MOTION_STD_POS
	};

	while (g_posObj.distY - obj.startY > 0) {
		obj.startY += _speedOnFrame[obj.frm];

		if (_speedOnFrame[obj.frm] !== 0) {
			obj.startY += _motionOnFrame[obj.motionFrm];
			obj.motionFrm++;
		}
		obj.frm--;
		obj.arrivalFrm++;
	}

	return obj;
};

/**
 * 個別色変化におけるフリーズアロー(ヒット時)判定
 * @param {number} _val 
 */
const isFrzHitColor = _val => (g_headerObj.colorDataType === `` && ((_val >= 40 && _val < 50) || (_val >= 55 && _val < 60) || _val === 61));

/**
 * 速度を加味したフリーズアローの長さを取得
 * @param {object} _speedOnFrame 
 * @param {number} _startFrame 
 * @param {number} _endFrame 
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
 */
const convertReplaceNums = _ => {
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
 * @param {number} _val 
 * @param {string} _colorCd 
 * @param {string} _allFlg
 */
const pushColors = (_header, _frame, _val, _colorCd, _allFlg) => {

	const tkObj = getKeyInfo();
	const grdFlg = (g_colorType === `Type0` ? !g_headerObj.defaultColorgrd[0] : g_headerObj.defaultColorgrd[0])
	const colorCd = makeColorGradation(_colorCd, { _defaultColorgrd: [grdFlg, g_headerObj.defaultColorgrd[1]] });
	const addAll = Number(_allFlg) * 1000;
	const allUseTypes = [];

	/**
	 * 色変化用配列（フレーム別）の初期化
	 * @param {string} _baseStr 
	 */
	const initialize = (_baseStr) => {
		if (g_workObj[_baseStr][_frame] === undefined) {
			g_workObj[_baseStr][_frame] = [];
			g_workObj[`${_baseStr}Cd`][_frame] = [];
		}
	};

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
		g_workObj[_baseStr][_frame].push(_cVal);
		g_workObj[`${_baseStr}Cd`][_frame].push(colorCd);
	};

	if (_val < 30 || _val >= 1000) {
		const baseHeaders = [`mk${_header}Color`];
		allUseTypes.push(`Arrow`);

		// フリーズアロー色の追随設定がある場合、対象を追加
		g_headerObj.frzScopeFromArrowColors.forEach(type => {
			baseHeaders.push(`mk${_header}FColor${type}`, `mk${_header}FColor${type}Bar`);
		});
		if (g_headerObj.frzScopeFromArrowColors.length > 0) {
			allUseTypes.push(`Frz`);
		}

		// 矢印の色変化 (追随指定時はフリーズアローも色変化)
		baseHeaders.forEach(baseHeader => {
			initialize(baseHeader);

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
					initialize(baseHeader + ctype);
					pushColor(baseHeader + ctype, k + addAll);
				}
			});
		});
	}

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
 * メイン画面前の初期化処理
 */
const getArrowSettings = _ => {

	g_attrObj = {};
	const tkObj = getKeyInfo();
	const [keyCtrlPtn, keyNum, posMax, divideCnt] =
		[tkObj.keyCtrlPtn, tkObj.keyNum, tkObj.posMax, tkObj.divideCnt];

	g_keyCopyLists.simpleDef.forEach(header => updateKeyInfo(header, keyCtrlPtn));
	g_headerObj.tuning = g_headerObj.creatorNames[g_stateObj.scoreId];

	g_workObj.stepX = [];
	g_workObj.scrollDir = [];
	g_workObj.dividePos = [];
	g_workObj.stepRtn = copyArray2d(g_keyObj[`stepRtn${keyCtrlPtn}`]);
	g_workObj.stepHitRtn = copyArray2d(g_keyObj[`stepRtn${keyCtrlPtn}`]);
	g_workObj.arrowRtn = copyArray2d(g_keyObj[`stepRtn${keyCtrlPtn}`]);
	g_workObj.keyCtrl = copyArray2d(g_keyObj[`keyCtrl${keyCtrlPtn}`]);
	g_workObj.diffList = [];
	g_workObj.mainEndTime = 0;

	const keyCtrlLen = g_workObj.keyCtrl.length;
	g_workObj.keyCtrlN = [...Array(keyCtrlLen)].map(_ => []);
	g_workObj.keyHitFlg = [...Array(keyCtrlLen)].map(_ => []);
	for (let j = 0; j < g_workObj.keyCtrl.length; j++) {
		for (let k = 0; k < g_workObj.keyCtrl[j].length; k++) {
			g_workObj.keyCtrlN[j][k] = g_kCdN[g_workObj.keyCtrl[j][k]];
			g_workObj.keyHitFlg[j][k] = false;
		}
	}

	g_typeLists.arrow.forEach(type => g_workObj[`judg${toCapitalize(type)}Cnt`] = [...Array(keyNum)].fill(1));
	g_workObj.judgFrzHitCnt = [...Array(keyNum)].fill(1);
	g_judgObj.lockFlgs = [...Array(keyNum)].fill(false);

	// TODO: この部分を矢印塗りつぶし部分についても適用できるように変数を作成

	// 矢印色管理 (個別・全体)
	const eachOrAll = [``, `All`];
	eachOrAll.forEach(type => {
		g_workObj[`arrowColors${type}`] = [];
		g_workObj[`dummyArrowColors${type}`] = [];

		[`frz`, `dummyFrz`].forEach(arrowType => {
			g_typeLists.frzColor.forEach(frzType => {
				g_workObj[`${arrowType}${frzType}Colors${type}`] = [];
			});
		});
	});

	// モーション管理
	g_typeLists.arrow.forEach(type => g_workObj[`${type}CssMotions`] = [...Array(keyNum)].fill(``));

	const scrollDirOptions = (g_keyObj[`scrollDir${keyCtrlPtn}`] !== undefined ?
		g_keyObj[`scrollDir${keyCtrlPtn}`][g_stateObj.scroll] : [...Array(keyNum)].fill(1));

	g_stateObj.autoAll = (g_stateObj.autoPlay === C_FLG_ALL ? C_FLG_ON : C_FLG_OFF);
	changeSetColor();

	for (let j = 0; j < keyNum; j++) {

		const posj = g_keyObj[`pos${keyCtrlPtn}`][j];
		const colorj = g_keyObj[`color${keyCtrlPtn}`][j];
		const stdPos = posj - ((posj > divideCnt ? posMax : 0) + divideCnt) / 2;

		g_workObj.stepX[j] = g_keyObj.blank * stdPos + (g_headerObj.playingWidth - C_ARW_WIDTH) / 2;
		g_workObj.dividePos[j] = ((posj <= divideCnt ? 0 : 1) + (scrollDirOptions[j] === 1 ? 0 : 1) + (g_stateObj.reverse === C_FLG_OFF ? 0 : 1)) % 2;
		g_workObj.scrollDir[j] = (posj <= divideCnt ? 1 : -1) * scrollDirOptions[j] * (g_stateObj.reverse === C_FLG_OFF ? 1 : -1);

		// TODO: この部分を矢印塗りつぶし部分についても適用できるように変数を作成

		eachOrAll.forEach(type => {
			g_workObj[`arrowColors${type}`][j] = g_headerObj.setColor[colorj];
			g_workObj[`dummyArrowColors${type}`][j] = g_headerObj.setDummyColor[colorj];

			g_typeLists.frzColor.forEach((frzType, k) => {
				g_workObj[`frz${frzType}Colors${type}`][j] = g_headerObj.frzColor[colorj][k];
				g_workObj[`dummyFrz${frzType}Colors${type}`][j] = g_headerObj.setDummyColor[colorj];
			});
		});
	}

	Object.keys(g_resultObj).forEach(judgeCnt => g_resultObj[judgeCnt] = 0);
	g_resultObj.spState = ``;

	g_displays.forEach(_disp => {
		const lowerDisp = _disp.toLowerCase();
		g_workObj[`${lowerDisp}Disp`] = (g_stateObj[`d_${lowerDisp}`] === C_FLG_OFF ? C_DIS_NONE : C_DIS_INHERIT);
	});

	g_workObj.lifeVal = Math.floor(g_workObj.lifeInit * 100) / 100;
	g_gameOverFlg = false;
	g_finishFlg = true;

	// リバース、キーコンフィグなどをローカルストレージへ保存（Data Save: ON かつ別キーモードで無い場合) 
	if (g_stateObj.dataSaveFlg && !hasVal(g_keyObj[`transKey${keyCtrlPtn}`])) {

		// 次回キーコンフィグ画面へ戻ったとき、保存済みキーコンフィグ設定が表示されるようにする
		g_keyObj.prevKey = `Dummy`;

		// ローカルストレージへAdjustment, Volume, Display関連設定を保存
		g_localStorage.adjustment = g_stateObj.adjustment;
		g_localStorage.volume = g_stateObj.volume;
		g_localStorage.colorType = g_colorType;
		g_storeSettings.forEach(setting => g_localStorage[setting] = g_stateObj[setting]);

		// ローカルストレージ(キー別)へデータ保存　※特殊キーは除く
		if (!g_stateObj.extraKeyFlg) {
			g_localKeyStorage.reverse = g_stateObj.reverse;
			g_localKeyStorage.keyCtrl = setKeyCtrl(g_localKeyStorage, keyNum, keyCtrlPtn);
			if (g_keyObj.currentPtn !== -1) {
				g_localKeyStorage.keyCtrlPtn = g_keyObj.currentPtn;
				g_keyObj[`keyCtrl${keyCtrlPtn}`] = copyArray2d(g_keyObj[`keyCtrl${keyCtrlPtn}d`]);
			}
			localStorage.setItem(`danonicw-${g_keyObj.currentKey}k`, JSON.stringify(g_localKeyStorage));

		} else {
			g_localStorage[`reverse${g_keyObj.currentKey}`] = g_stateObj.reverse;
			g_localStorage[`keyCtrl${g_keyObj.currentKey}`] = setKeyCtrl(g_localKeyStorage, keyNum, keyCtrlPtn);
			if (g_keyObj.currentPtn !== -1) {
				g_localStorage[`keyCtrlPtn${g_keyObj.currentKey}`] = g_keyObj.currentPtn;
				g_keyObj[`keyCtrl${keyCtrlPtn}`] = copyArray2d(g_keyObj[`keyCtrl${keyCtrlPtn}d`]);
			}
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
 */
const setKeyCtrl = (_localStorage, _keyNum, _keyCtrlPtn) => {
	const localPtn = `${g_keyObj.currentKey}_-1`;
	const keyCtrl = [...Array(_keyNum)].map(_ => []);
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
const mainInit = _ => {
	clearWindow(true, `Main`);
	const divRoot = document.querySelector(`#divRoot`);
	document.oncontextmenu = _ => false;
	g_currentPage = `main`;

	g_currentArrows = 0;
	const wordMaxLen = g_scoreObj.wordMaxDepth + 1;
	g_workObj.fadeInNo = [...Array(wordMaxLen)].fill(0);
	g_workObj.fadeOutNo = [...Array(wordMaxLen)].fill(0);
	g_workObj.lastFadeFrame = [...Array(wordMaxLen)].fill(0);
	g_workObj.wordFadeFrame = [...Array(wordMaxLen)].fill(0);

	// 背景スプライトを作成
	createMultipleSprite(`backSprite`, g_scoreObj.backMaxDepth);

	// ステップゾーン、矢印のメインスプライトを作成
	const mainSprite = createEmptySprite(divRoot, `mainSprite`, {
		x: g_headerObj.playingX, y: g_posObj.stepY - C_STEP_Y, w: g_headerObj.playingWidth, transform: `scale(${g_keyObj.scale})`,
	});

	// 曲情報・判定カウント用スプライトを作成（メインスプライトより上位）
	const infoSprite = createEmptySprite(divRoot, `infoSprite`, { x: g_headerObj.playingX, w: g_headerObj.playingWidth });

	// 判定系スプライトを作成（メインスプライトより上位）
	const judgeSprite = createEmptySprite(divRoot, `judgeSprite`, { x: g_headerObj.playingX, w: g_headerObj.playingWidth });

	const tkObj = getKeyInfo();
	const [keyCtrlPtn, keyNum] = [tkObj.keyCtrlPtn, tkObj.keyNum];

	// マスクスプライトを作成 (最上位)
	createMultipleSprite(`maskSprite`, g_scoreObj.maskMaxDepth);

	// カラー・モーションを適用するオブジェクトの種類
	const objList = (g_stateObj.dummyId === `` ? [``] : [`dummy`, ``]);

	// 背景・マスクモーション(0フレーム指定)
	if (g_scoreObj.frameNum === 0) {
		g_animationData.forEach(sprite => {
			if (g_scoreObj[`${sprite}Data`][0] !== undefined) {
				drawMainSpriteData(0, sprite);
				g_scoreObj[`${sprite}Data`][0] = undefined;
			}
		});
	}

	// 矢印・フリーズアロー・速度変化 移動/判定/変化対象の初期化
	const arrowCnts = [...Array(keyNum)].fill(0);
	const frzCnts = [...Array(keyNum)].fill(0);
	const dummyArrowCnts = [...Array(keyNum)].fill(0);
	const dummyFrzCnts = [...Array(keyNum)].fill(0);
	let speedCnts = 0;
	let boostCnts = 0;
	const stepZoneDisp = (g_stateObj.d_stepzone === C_FLG_OFF || g_stateObj.scroll === `Flat`) ? C_DIS_NONE : C_DIS_INHERIT;

	for (let j = 0; j < keyNum; j++) {
		const colorPos = g_keyObj[`color${keyCtrlPtn}`][j];

		// ステップゾーンルート
		const stepRoot = createEmptySprite(mainSprite, `stepRoot${j}`, {
			x: g_workObj.stepX[j], y: C_STEP_Y + g_posObj.reverseStepY * g_workObj.dividePos[j],
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
	if (g_stateObj.scroll === `Flat` && g_stateObj.d_stepzone === C_FLG_ON) {

		// ステップゾーンの代わり
		const lineY = [(C_ARW_WIDTH - g_stateObj.flatStepHeight) / 2, (C_ARW_WIDTH + g_stateObj.flatStepHeight) / 2];
		lineY.forEach((y, j) => {
			mainSprite.appendChild(
				createColorObject2(`stepBar${j}`, {
					x: 0, y: C_STEP_Y + g_posObj.reverseStepY * Number(g_stateObj.reverse === C_FLG_ON) + y,
					w: g_headerObj.playingWidth - 50, h: 1, styleName: `lifeBar`,
				}, g_cssObj.life_Failed)
			);
		});

	}

	// Hidden+, Sudden+用のライン、パーセント表示
	const filterCss = g_stateObj.filterLock === C_FLG_OFF ? g_cssObj.life_Failed : g_cssObj.life_Cleared;
	[`filterBar0`, `filterBar1`, `borderBar0`, `borderBar1`].forEach(obj =>
		mainSprite.appendChild(createColorObject2(obj, g_lblPosObj.filterBar, filterCss)));
	borderBar0.style.top = `${g_posObj.stepDiffY}px`;
	borderBar1.style.top = `${g_posObj.stepDiffY + g_posObj.arrowHeight}px`;

	if (g_appearanceRanges.includes(g_stateObj.appearance)) {
		mainSprite.appendChild(createDivCss2Label(`filterView`, ``, g_lblPosObj.filterView));
		if (g_stateObj.d_filterline === C_FLG_ON) {
			[`filterBar0`, `filterBar1`, `filterView`].forEach(obj => {
				$id(obj).opacity = g_stateObj.opacity / 100;
			});
		}
	}

	// 矢印・フリーズアロー描画スプライト（ステップゾーンの上に配置）
	const arrowSprite = [
		createEmptySprite(mainSprite, `arrowSprite0`, { w: g_headerObj.playingWidth, h: g_posObj.arrowHeight }),
		createEmptySprite(mainSprite, `arrowSprite1`, { w: g_headerObj.playingWidth, h: g_posObj.arrowHeight }),
	];

	// Appearanceのオプション適用時は一部描画を隠す
	changeAppearanceFilter(g_stateObj.appearance, g_appearanceRanges.includes(g_stateObj.appearance) ?
		g_hidSudObj.filterPos : g_hidSudObj.filterPosDefault[g_stateObj.appearance]);

	for (let j = 0; j < keyNum; j++) {

		// フリーズアローヒット部分
		const frzHit = createEmptySprite(mainSprite, `frzHit${j}`, {
			x: g_workObj.stepX[j], y: C_STEP_Y + g_posObj.reverseStepY * g_workObj.dividePos[j],
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

	// 現在の矢印・フリーズアローの速度、個別加算速度の初期化 (速度変化時に直す)
	g_workObj.currentSpeed = 2;
	g_workObj.boostSpd = 1;

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
	if (g_headerObj.fadeFrame !== undefined) {
		let fadeNo = -1;
		if (g_headerObj.fadeFrame.length >= g_stateObj.scoreId + 1) {
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
	}

	// 終了時間指定の場合、その値を適用する
	let endFrameUseFlg = false;
	if (g_headerObj.endFrame !== undefined) {
		const tmpEndFrame = g_headerObj.endFrame[g_stateObj.scoreId] || g_headerObj.endFrame[0];
		if (!isNaN(parseInt(tmpEndFrame))) {
			// 終了時間指定の場合、曲長は EndFrame - (本来のblankFrame)
			duration = parseInt(tmpEndFrame) - g_headerObj.blankFrameDef;
			endFrameUseFlg = true;
		}
	}

	let fullFrame = Math.ceil(duration / g_headerObj.playbackRate + g_headerObj.blankFrame + g_stateObj.adjustment);
	if (g_scoreObj.fadeOutFrame !== Infinity && !endFrameUseFlg) {
		fullFrame += g_scoreObj.fadeOutTerm;
	}
	g_scoreObj.fullFrame = fullFrame;

	const nominalDiff = g_headerObj.blankFrame - g_headerObj.blankFrameDef + g_stateObj.adjustment;
	g_scoreObj.nominalFrameNum = g_scoreObj.frameNum - nominalDiff;
	const fullTime = transFrameToTimer(fullFrame - nominalDiff);

	// フレーム数
	divRoot.appendChild(
		createDivCss2Label(`lblframe`, g_scoreObj.frameNum, { x: 0, y: 0, w: 100, h: 30, siz: 20, display: g_workObj.lifegaugeDisp, })
	);

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
	const musicTitle = g_headerObj.musicTitles[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.musicTitle;
	const artistName = g_headerObj.artistNames[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.artistName;
	const assistFlg = (g_autoPlaysBase.includes(g_stateObj.autoPlay) ? `` : `-${getStgDetailName(g_stateObj.autoPlay)}${getStgDetailName('less')}`);
	const shuffleName = (g_stateObj.shuffle !== C_FLG_OFF ? `: ${getShuffleName()}` : ``);

	// 曲名・アーティスト名、譜面名のサイズ調整
	const checkMusicSiz = (_text, _siz) => getFontSize(_text, g_headerObj.playingWidth - g_headerObj.customViewWidth - 125, getBasicFont(), _siz);

	const makerView = g_headerObj.makerView ? ` (${g_headerObj.creatorNames[g_stateObj.scoreId]})` : ``;
	let difName = `[${getKeyName(g_headerObj.keyLabels[g_stateObj.scoreId])} / ${g_headerObj.difLabels[g_stateObj.scoreId]}${assistFlg}${shuffleName}${makerView}]`;
	let creditName = `${musicTitle} / ${artistName}`;
	if (checkMusicSiz(creditName, C_SIZ_MUSIC_TITLE) < 12) {
		creditName = `${musicTitle}`;
		difName = `/ ${artistName} ` + difName;
	}

	multiAppend(infoSprite,

		// ライフ（数字）
		createDivCss2Label(`lblLife`, intLifeVal, {
			x: 0, y: 30, w: 70, h: 20, siz: C_SIZ_JDGCNTS, display: g_workObj.lifegaugeDisp,
		}, lblInitColor),

		// ライフ背景
		createColorObject2(`lifeBackObj`, {
			x: 5, y: 50, w: 15, h: g_sHeight - 100, styleName: `lifeBar`, display: g_workObj.lifegaugeDisp,
		}, g_cssObj.life_Background),

		// ライフ本体
		createColorObject2(`lifeBar`, {
			x: 5, y: 50 + (g_sHeight - 100) * (g_headerObj.maxLifeVal - intLifeVal) / g_headerObj.maxLifeVal,
			w: 15, h: (g_sHeight - 100) * intLifeVal / g_headerObj.maxLifeVal, styleName: `lifeBar`,
			display: g_workObj.lifegaugeDisp,
		}, lblInitColor),

		// ライフ：ボーダーライン
		// この背景の画像は40x16で作成しているが、`padding-right:5px`があるためサイズを35x16で作成
		createColorObject2(`lifeBorderObj`, {
			x: 10, y: 42 + (g_sHeight - 100) * (g_headerObj.maxLifeVal - g_workObj.lifeBorder) / g_headerObj.maxLifeVal,
			w: 35, h: 16, background: C_CLR_BORDER, styleName: `lifeBorder`,
			fontFamily: getBasicFont(), display: g_workObj.lifegaugeDisp,
		}, g_cssObj.life_Border, g_cssObj.life_BorderColor),

		// 曲名・アーティスト名表示
		createDivCss2Label(`lblCredit`, creditName, Object.assign(g_lblPosObj.lblCredit, { siz: checkMusicSiz(creditName, C_SIZ_MUSIC_TITLE) })),

		// 譜面名表示
		createDivCss2Label(`lblDifName`, difName, Object.assign(g_lblPosObj.lblDifName, { siz: checkMusicSiz(difName, 12) })),

		// 曲時間表示：現在時間
		createDivCss2Label(`lblTime1`, `-:--`, Object.assign(g_lblPosObj.lblTime1, { display: g_workObj.musicinfoDisp })),

		// 曲時間表示：総時間
		createDivCss2Label(`lblTime2`, `/ ${fullTime}`, Object.assign(g_lblPosObj.lblTime2, { display: g_workObj.musicinfoDisp })),
	);

	// ボーダーライン表示
	lifeBorderObj.textContent = g_workObj.lifeBorder;
	if (g_stateObj.lifeBorder === 0 || g_workObj.lifeVal === g_headerObj.maxLifeVal) {
		lifeBorderObj.style.display = C_DIS_NONE;
	}

	// 歌詞表示
	const wordSprite = createEmptySprite(judgeSprite, `wordSprite`, { w: g_headerObj.playingWidth });
	for (let j = 0; j <= g_scoreObj.wordMaxDepth; j++) {
		const wordY = (j % 2 === 0 ? 10 : (g_headerObj.bottomWordSetFlg ? g_posObj.distY + 10 : g_sHeight - 60));
		wordSprite.appendChild(createDivCss2Label(`lblword${j}`, ``, Object.assign(g_lblPosObj.lblWord, { y: wordY, fontFamily: getBasicFont() })));
	}

	const jdgGroups = [`J`, `FJ`];
	const jdgX = [g_headerObj.playingWidth / 2 - 220, g_headerObj.playingWidth / 2 - 120];
	const jdgY = [(g_sHeight + g_posObj.stepYR) / 2 - 60, (g_sHeight + g_posObj.stepYR) / 2 + 10];
	if (g_stateObj.d_background === C_FLG_OFF && g_headerObj.jdgPosReset) {
	} else {
		jdgY[0] += g_diffObj.arrowJdgY;
		jdgY[1] += g_diffObj.frzJdgY;
	}
	const jdgCombos = [`kita`, `ii`];

	jdgGroups.forEach((jdg, j) => {
		// キャラクタ表示
		const charaJ = createDivCss2Label(`chara${jdg}`, ``, {
			x: jdgX[j], y: jdgY[j],
			w: C_LEN_JDGCHARA_WIDTH, h: C_LEN_JDGCHARA_HEIGHT, siz: C_SIZ_JDGCHARA,
			opacity: g_stateObj.opacity / 100, display: g_workObj.judgmentDisp,
		}, g_cssObj.common_ii);
		charaJ.setAttribute(`cnt`, 0);

		multiAppend(judgeSprite,

			// キャラクタ表示
			charaJ,

			// コンボ表示
			createDivCss2Label(`combo${jdg}`, ``, {
				x: jdgX[j] + 170, y: jdgY[j],
				w: C_LEN_JDGCHARA_WIDTH, h: C_LEN_JDGCHARA_HEIGHT, siz: C_SIZ_JDGCHARA,
				opacity: g_stateObj.opacity / 100, display: g_workObj.judgmentDisp,
			}, g_cssObj[`common_${jdgCombos[j]}`]),

			// Fast/Slow表示
			createDivCss2Label(`diff${jdg}`, ``, {
				x: jdgX[j] + 170, y: jdgY[j] + 25,
				w: C_LEN_JDGCHARA_WIDTH, h: C_LEN_JDGCHARA_HEIGHT, siz: C_SIZ_MAIN,
				opacity: g_stateObj.opacity / 100, display: g_workObj.fastslowDisp,
			}, g_cssObj.common_combo),

		);
	});

	// 判定カウンタ表示
	const jdgMainScoreObj = {
		Ii: [`ii`, 0], Shakin: [`shakin`, 1], Matari: [`matari`, 2], Shobon: [`shobon`, 3], Uwan: [`uwan`, 4],
		MCombo: [`combo`, 5], Kita: [`kita`, 7], Iknai: [`iknai`, 8], FCombo: [`combo`, 9],
	};
	Object.keys(jdgMainScoreObj).forEach(jdgScore => {
		infoSprite.appendChild(makeCounterSymbol(`lbl${jdgScore}`, g_headerObj.playingWidth - 110,
			g_cssObj[`common_${jdgMainScoreObj[jdgScore][0]}`], jdgMainScoreObj[jdgScore][1] + 1, 0, g_workObj.scoreDisp));
	});

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
		const readyColor = (g_headerObj.readyColor !== `` ? g_headerObj.readyColor : g_headerObj.setColorOrg[0]);
		let readyDelayFrame = 0;
		if (g_stateObj.fadein === 0 && g_headerObj.readyDelayFrame > 0 &&
			g_headerObj.readyDelayFrame + g_stateObj.adjustment > 0) {
			readyDelayFrame = g_headerObj.readyDelayFrame + g_stateObj.adjustment;
		}
		const readyHtml = (g_headerObj.readyHtml !== `` ? g_headerObj.readyHtml :
			`<span style='color:${readyColor};font-size:60px;'>R</span>EADY<span style='font-size:50px;'>?</span>`);

		divRoot.appendChild(
			createDivCss2Label(`lblReady`, readyHtml, {
				x: g_headerObj.playingX + (g_headerObj.playingWidth - g_sWidth) / 2,
				y: (g_sHeight + g_posObj.stepYR) / 2 - 75,
				w: g_sWidth, h: 50, siz: 40,
				animationDuration: `${g_headerObj.readyAnimationFrame / g_fps}s`,
				animationName: g_headerObj.readyAnimationName,
				animationDelay: `${readyDelayFrame / g_fps}s`, opacity: 0,
			})
		);
	}

	if (getMusicUrl(g_stateObj.scoreId) === `nosound.mp3`) {
		makeInfoWindow(g_msgInfoObj.I_0004, `leftToRightFade`);
	}

	// ユーザカスタムイベント(初期)
	g_customJsObj.main.forEach(func => func());

	/**
	 * キーを押したときの処理
	 */
	const mainKeyDownActFunc = {

		OFF: (_keyCode) => {
			const matchKeys = g_workObj.keyCtrlN;

			for (let j = 0; j < keyNum; j++) {
				matchKeys[j].forEach((key, k) => {
					if (_keyCode === key && !g_workObj.keyHitFlg[j][k] && !g_judgObj.lockFlgs[j]) {
						g_judgObj.lockFlgs[j] = true;
						judgeArrow(j);
						g_judgObj.lockFlgs[j] = false;
					}
				});
			}
		},

		ON: (_keyCode) => { },
	};

	// キー操作イベント
	document.onkeydown = evt => {
		evt.preventDefault();
		const setCode = transCode(evt.code);

		if (evt.repeat && !g_mainRepeatObj.key.includes(setCode)) {
			return blockCode(setCode);
		}

		g_inputKeyBuffer[setCode] = true;
		mainKeyDownActFunc[g_stateObj.autoAll](setCode);

		// 曲中リトライ、タイトルバック
		if (setCode === g_kCdN[g_headerObj.keyRetry]) {

			if (g_isMac && keyIsDown(g_kCdNameObj.shiftKey)) {
				// Mac OS、IPad OSはDeleteキーが無いためShift+BSで代用
				g_audio.pause();
				clearTimeout(g_timeoutEvtId);
				titleInit();

			} else {
				// その他の環境では単にRetryに対応するキーのみで適用
				g_audio.pause();
				clearTimeout(g_timeoutEvtId);
				clearWindow();
				musicAfterLoaded();
			}

		} else if (setCode === g_kCdN[g_headerObj.keyTitleBack]) {
			g_audio.pause();
			clearTimeout(g_timeoutEvtId);
			if (keyIsDown(g_kCdNameObj.shiftKey)) {
				g_gameOverFlg = true;
				g_finishFlg = false;
				resultInit();
			} else {
				titleInit();
			}

		} else if (g_appearanceRanges.includes(g_stateObj.appearance) && g_stateObj.filterLock === C_FLG_OFF) {
			if (setCode === g_hidSudObj.pgDown[g_stateObj.appearance][g_stateObj.reverse]) {
				changeAppearanceFilter(g_stateObj.appearance, g_hidSudObj.filterPos < 100 ?
					g_hidSudObj.filterPos + 1 : g_hidSudObj.filterPos);
			} else if (setCode === g_hidSudObj.pgUp[g_stateObj.appearance][g_stateObj.reverse]) {
				changeAppearanceFilter(g_stateObj.appearance, g_hidSudObj.filterPos > 0 ?
					g_hidSudObj.filterPos - 1 : g_hidSudObj.filterPos);
			}
		}
		return blockCode(setCode);
	};

	/**
	 * キーを離したときの処理
	 */
	const mainKeyUpActFunc = {

		OFF: _ => {
			for (let j = 0; j < keyNum; j++) {
				if (g_workObj.keyCtrlN[j].find(key => keyIsDown(key)) === undefined) {
					$id(`stepDiv${j}`).display = C_DIS_NONE;
				}
			}
		},

		ON: _ => { },
	};

	document.onkeyup = evt => {
		const setCode = transCode(evt.code);
		g_inputKeyBuffer[setCode] = false;
		mainKeyUpActFunc[g_stateObj.autoAll]();
	};

	/**
	 * 全体色変化（矢印）
	 * @param {number} _j 
	 * @param {number} _k 
	 * @param {string} _name 
	 */
	const changeArrowColor = (_j, _k, _name) => {
		if (g_workObj[`mk${toCapitalize(_name)}ColorChangeAll`][g_scoreObj.frameNum]) {
			const colorSelf = g_workObj[`${_name}Colors`][_j];
			const colorAll = g_workObj[`${_name}ColorsAll`][_j];
			const arrowTop = document.querySelector(`#${_name}Top${_j}_${_k}`);

			if (arrowTop.getAttribute(`color`) !== colorSelf && colorAll === colorSelf) {
				arrowTop.style.background = colorAll;
				arrowTop.setAttribute(`color`, colorAll);
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
			const frzTop = document.querySelector(`#${_name}Top${_j}_${_k}`);
			const frzBar = document.querySelector(`#${_name}Bar${_j}_${_k}`);
			const frzBtm = document.querySelector(`#${_name}Btm${_j}_${_k}`);
			const frzName = `${_name}${_state}`;

			// 矢印部分の色変化
			if (frzBtm.getAttribute(`color`) !== g_workObj[`${frzName}Colors`][_j]) {
				const toColorCode = g_workObj[`${frzName}ColorsAll`][_j];
				if (g_workObj[`${frzName}Colors`][_j] === toColorCode) {
					if (_state === `Normal`) {
						frzTop.style.background = toColorCode;
					}
					frzBtm.style.background = toColorCode;
					frzBtm.setAttribute(`color`, toColorCode);
				}
			}
			// 帯部分の色変化
			if (frzBar.getAttribute(`color`) !== g_workObj[`${frzName}BarColors`][_j]) {
				const toBarColorCode = g_workObj[`${frzName}BarColorsAll`][_j];
				if (g_workObj[`${frzName}BarColors`][_j] === toBarColorCode) {
					frzBar.style.background = toBarColorCode;
					frzBar.setAttribute(`color`, toBarColorCode);
				}
			}
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
	 * @param _j 矢印位置
	 * @param _deleteObj 削除オブジェクト
	 */
	const judgeObjDelete = {};
	g_typeLists.arrow.forEach(type => {
		judgeObjDelete[type] = (_j, _deleteName) => {
			g_workObj[`judg${toCapitalize(type)}Cnt`][_j]++;
			arrowSprite[g_attrObj[_deleteName].dividePos].removeChild(document.getElementById(_deleteName));
		}
	});

	/**
	 * 自動判定
	 * ※mainInit内部で指定必須（arrowSprite指定）
	 * 
	 * @param _j 矢印位置
	 * @param _arrow 矢印(オブジェクト)
	 * 
	 * @param _k 矢印の表示順
	 * @param _frzRoot フリーズアロー(オブジェクト)
	 * @param _cnt ステップゾーン到達までのフレーム数
	 * @param _keyUpFrame キーを離したフレーム数
	 */
	const judgeMotionFunc = {

		// 矢印(枠外判定、AutoPlay: OFF)
		arrowOFF: (_j, _arrowName, _cnt) => {
			if (_cnt < (-1) * g_judgObj.arrowJ[g_judgPosObj.uwan]) {
				judgeUwan(_cnt);
				judgeObjDelete.arrow(_j, _arrowName);
			}
		},

		// 矢印(オート、AutoPlay: ON)
		arrowON: (_j, _arrowName, _cnt) => {
			if (_cnt === 0) {
				const stepDivHit = document.querySelector(`#stepHit${_j}`);

				judgeIi(_cnt);
				stepDivHit.style.opacity = 1;
				stepDivHit.setAttribute(`cnt`, C_FRM_HITMOTION);
				judgeObjDelete.arrow(_j, _arrowName);
			}
		},

		// ダミー矢印(オート、AutoPlay: OFF)
		dummyArrowOFF: (_j, _arrowName, _cnt) => {
			if (_cnt === 0) {
				const stepDivHit = document.querySelector(`#stepHit${_j}`);

				g_customJsObj.dummyArrow.forEach(func => func());
				stepDivHit.style.top = `-15px`;
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
	 * 次フリーズアローへ判定を移すかチェック
	 * 
	 * @param _j 矢印の位置
	 * @param _k 矢印の表示順
	 * @param _cnt ステップゾーン到達までのフレーム数
	 */
	const judgeNextFunc = {

		frzOFF: (_j, _k, _cnt) => {

			// フリーズアローの判定領域に入った場合、前のフリーズアローを強制的に削除
			// ただし、前のフリーズアローが押下中または判定領域がジャスト付近(キター領域)の場合は削除しない
			// 削除する場合、前のフリーズアローの判定はイクナイ(＆ウワァン)扱い
			if (g_workObj.judgFrzCnt[_j] !== _k && _cnt <= g_judgObj.frzJ[g_judgPosObj.sfsf] + 1) {
				const prevFrzName = `frz${_j}_${g_workObj.judgFrzCnt[_j]}`;

				if (g_attrObj[prevFrzName].isMoving &&
					g_attrObj[prevFrzName].cnt < (-1) * g_judgObj.frzJ[g_judgPosObj.kita]) {

					// 枠外判定前の場合、このタイミングで枠外判定を行う
					if (g_attrObj[prevFrzName].cnt >= (-1) * g_judgObj.frzJ[g_judgPosObj.iknai]) {
						judgeIknai(_cnt);
						if (g_headerObj.frzStartjdgUse) {
							judgeUwan(_cnt);
						}
					}
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
	 * @param {number} _j 矢印の位置
	 * @param {number} _arrowCnt 現在の判定矢印順
	 * @param {string} _name 矢印名
	 * @param {string} _color 矢印色
	 */
	const makeArrow = (_j, _arrowCnt, _name, _color) => {
		const boostSpdDir = g_workObj.boostSpd * g_workObj.scrollDir[_j];
		const dividePos = g_workObj.dividePos[_j];
		const colorPos = g_keyObj[`color${keyCtrlPtn}`][_j];

		const arrowName = `${_name}${_j}_${_arrowCnt}`;
		const firstPosY = C_STEP_Y + g_posObj.reverseStepY * dividePos + g_workObj.initY[g_scoreObj.frameNum] * boostSpdDir;

		const stepRoot = createEmptySprite(arrowSprite[dividePos], arrowName, {
			x: g_workObj.stepX[_j], y: firstPosY, w: C_ARW_WIDTH, h: C_ARW_WIDTH,
		});
		g_attrObj[arrowName] = {
			cnt: g_workObj.arrivalFrame[g_scoreObj.frameNum] + 1,
			boostCnt: g_workObj.motionFrame[g_scoreObj.frameNum],
			boostSpd: boostSpdDir, dividePos: dividePos,
			prevY: firstPosY, y: firstPosY,
		};
		arrowSprite[dividePos].appendChild(stepRoot);

		if (g_workObj[`${_name}CssMotions`][_j] !== ``) {
			stepRoot.classList.add(g_workObj[`${_name}CssMotions`][_j]);
			stepRoot.style.animationDuration = `${g_workObj.arrivalFrame[g_scoreObj.frameNum] / g_fps}s`;
		}

		// 内側塗りつぶし矢印は、下記の順で作成する。
		// 後に作成するほど前面に表示される。

		// 矢印の内側を塗りつぶすか否か
		if (g_headerObj.setShadowColor[colorPos] !== ``) {
			// 矢印の塗り部分
			const arrShadow = createColorObject2(`${_name}Shadow${_j}_${_arrowCnt}`, {
				background: getShadowColor(colorPos, _color), rotate: g_workObj.arrowRtn[_j], styleName: `Shadow`,
			});
			if (g_headerObj.setShadowColor[colorPos] === `Default`) {
				arrShadow.style.opacity = 0.5;
			}
			stepRoot.appendChild(arrShadow);
		}

		// 矢印
		stepRoot.appendChild(createColorObject2(`${_name}Top${_j}_${_arrowCnt}`, {
			background: _color, rotate: g_workObj.arrowRtn[_j],
		}));
	};

	/**
	 * 矢印移動メイン
	 * @param {number} _j 
	 * @param {number} _k 
	 * @param {string} _name 
	 */
	const movArrow = (_j, _k, _name) => {
		const arrowName = `${_name}${_j}_${_k}`;

		// 全体色変化 (移動時)
		changeColorFunc[_name](_j, _k);

		// 移動
		if (g_workObj.currentSpeed !== 0) {
			const boostCnt = g_attrObj[arrowName].boostCnt;
			g_attrObj[arrowName].prevY = g_attrObj[arrowName].y;
			g_attrObj[arrowName].y -= (g_workObj.currentSpeed + g_workObj.motionOnFrames[boostCnt]) * g_attrObj[arrowName].boostSpd;
			document.getElementById(arrowName).style.top = `${g_attrObj[arrowName].y}px`;
			g_attrObj[arrowName].boostCnt--;
		}
		judgeMotionFunc[`${_name}${g_stateObj.autoAll}`](_j, arrowName, --g_attrObj[arrowName].cnt);
	};

	/**
	 * フリーズアロー生成
	 * @param {number} _j 
	 * @param {number} _arrowCnt 
	 * @param {string} _name 
	 * @param {string} _normalColor
	 * @param {string} _barColor 
	 */
	const makeFrzArrow = (_j, _arrowCnt, _name, _normalColor, _barColor) => {
		const boostSpdDir = g_workObj.boostSpd * g_workObj.scrollDir[_j];
		const dividePos = g_workObj.dividePos[_j];
		const frzNo = `${_j}_${_arrowCnt}`;
		const frzName = `${_name}${frzNo}`;
		const firstPosY = C_STEP_Y + g_posObj.reverseStepY * dividePos + g_workObj.initY[g_scoreObj.frameNum] * boostSpdDir;
		const firstBarLength = g_workObj[`mk${toCapitalize(_name)}Length`][_j][(_arrowCnt - 1) * 2] * g_workObj.boostSpd;

		const frzRoot = createEmptySprite(arrowSprite[dividePos], frzName, {
			x: g_workObj.stepX[_j], y: firstPosY, w: C_ARW_WIDTH, h: C_ARW_WIDTH + firstBarLength,
		});
		g_attrObj[frzName] = {
			cnt: g_workObj.arrivalFrame[g_scoreObj.frameNum] + 1,
			boostCnt: g_workObj.motionFrame[g_scoreObj.frameNum],
			judgEndFlg: false, isMoving: true, frzBarLength: firstBarLength, keyUpFrame: 0,
			boostSpd: boostSpdDir, dividePos: dividePos, dir: g_workObj.scrollDir[_j],
			y: firstPosY,
			barY: C_ARW_WIDTH / 2 - firstBarLength * dividePos,
			btmY: firstBarLength * g_workObj.scrollDir[_j],
		};
		arrowSprite[dividePos].appendChild(frzRoot);

		if (g_workObj[`${_name}CssMotions`][_j] !== ``) {
			frzRoot.classList.add(g_workObj[`${_name}CssMotions`][_j]);
			frzRoot.style.animationDuration = `${g_workObj.arrivalFrame[g_scoreObj.frameNum] / g_fps}s`;
		}

		const colorPos = g_keyObj[`color${keyCtrlPtn}`][_j];
		let shadowColor = ``;
		if (g_headerObj.frzShadowColor[colorPos][0] !== ``) {
			shadowColor = (g_headerObj.frzShadowColor[colorPos][0] === `Default` ?
				_normalColor : g_headerObj.frzShadowColor[colorPos][0]);
		}

		// フリーズアローは、下記の順で作成する。
		// 後に作成するほど前面に表示される。
		multiAppend(frzRoot,

			// フリーズアロー帯(frzBar)
			createColorObject2(`${_name}Bar${frzNo}`, {
				x: 5, y: g_attrObj[frzName].barY, w: C_ARW_WIDTH - 10, h: firstBarLength, background: _barColor, styleName: `frzBar`,
				opacity: 0.75,
			}),

			// 開始矢印の塗り部分。ヒット時は前面に出て光る。
			createColorObject2(`${_name}TopShadow${frzNo}`, {
				background: shadowColor, rotate: g_workObj.arrowRtn[_j], styleName: `Shadow`,
			}, g_cssObj.main_objShadow),

			// 開始矢印。ヒット時は隠れる。
			createColorObject2(`${_name}Top${frzNo}`, {
				background: _normalColor, rotate: g_workObj.arrowRtn[_j],
			}),

			// 後発矢印の塗り部分
			createColorObject2(`${_name}BtmShadow${frzNo}`, {
				x: 0, y: g_attrObj[frzName].btmY,
				background: shadowColor, rotate: g_workObj.arrowRtn[_j], styleName: `Shadow`,
			}, g_cssObj.main_objShadow),

			// 後発矢印
			createColorObject2(`${_name}Btm${frzNo}`, {
				x: 0, y: g_attrObj[frzName].btmY,
				background: _normalColor, rotate: g_workObj.arrowRtn[_j],
			}),

		);
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
		const movY = g_workObj.currentSpeed * g_attrObj[frzName].boostSpd;

		if (!g_attrObj[frzName].judgEndFlg) {
			if (g_attrObj[frzName].isMoving) {

				// 全体色変化 (通常時)
				changeColorFunc[_name](_j, _k, `Normal`);

				// 移動
				if (g_workObj.currentSpeed !== 0) {
					g_attrObj[frzName].y -= movY + g_workObj.motionOnFrames[g_attrObj[frzName].boostCnt] * g_attrObj[frzName].boostSpd;
					document.getElementById(frzName).style.top = `${g_attrObj[frzName].y}px`;
					g_attrObj[frzName].boostCnt--;
				}
				g_attrObj[frzName].cnt--;

				// 次フリーズアローへ判定を移すかチェック
				judgeNextFunc[`${_name}${g_stateObj.autoAll}`](_j, _k, g_attrObj[frzName].cnt);

			} else {

				// 全体色変化 (ヒット時)
				changeColorFunc[_name](_j, _k, `Hit`);

				// フリーズアローがヒット中の処理
				if (g_attrObj[frzName].frzBarLength > 0) {

					g_attrObj[frzName].frzBarLength -= movY * g_attrObj[frzName].dir;
					g_attrObj[frzName].barY -= movY * g_attrObj[frzName].dividePos;
					g_attrObj[frzName].btmY -= movY;

					$id(`${_name}Bar${frzNo}`).height = `${g_attrObj[frzName].frzBarLength}px`;
					$id(`${_name}Bar${frzNo}`).top = `${g_attrObj[frzName].barY}px`;
					$id(`${_name}Btm${frzNo}`).top = `${g_attrObj[frzName].btmY}px`;
					$id(`${_name}BtmShadow${frzNo}`).top = `${g_attrObj[frzName].btmY}px`;

					if (!checkKeyUpFunc[`${_name}${g_stateObj.autoAll}`](_j)) {
						g_attrObj[frzName].keyUpFrame++;
						judgeMotionFunc[`${_name}KeyUp`](_j, _k, frzName, g_attrObj[frzName].cnt);
					}
				} else {
					judgeMotionFunc[`${_name}OK`](_j, _k, frzName, g_attrObj[frzName].cnt);
				}
			}
			// フリーズアローが枠外に出たときの処理
			judgeMotionFunc[`${_name}NG`](_j, _k, frzName, g_attrObj[frzName].cnt);

		} else {
			g_attrObj[frzName].frzBarLength -= g_workObj.currentSpeed;
			if (g_attrObj[frzName].frzBarLength > 0) {
				g_attrObj[frzName].y -= movY;
				document.getElementById(frzName).style.top = `${g_attrObj[frzName].y}px`;
			} else {
				judgeObjDelete[_name](_j, frzName);
			}
		}
	};

	/**
	 * フレーム処理(譜面台)
	 */
	const flowTimeline = _ => {

		const currentFrame = g_scoreObj.frameNum;
		lblframe.textContent = currentFrame;

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

		// 背景・マスクモーション
		g_animationData.forEach(sprite => {
			if (g_scoreObj[`${sprite}Data`][currentFrame] !== undefined) {
				drawMainSpriteData(currentFrame, sprite);
			}
		});

		// フェードイン・アウト
		const isFadeOutArea = currentFrame >= g_scoreObj.fadeOutFrame && currentFrame < g_scoreObj.fadeOutFrame + g_scoreObj.fadeOutTerm;
		if (g_audio.volume >= g_stateObj.volume / 100) {
			musicStartFlg = false;
		}
		if (musicStartFlg) {
			const tmpVolume = (g_audio.volume + (3 * g_stateObj.volume / 100) / 1000);
			g_audio.volume = (tmpVolume > 1 ? 1 : tmpVolume);
		} else if (isFadeOutArea) {
			const tmpVolume = (g_audio.volume - (3 * g_stateObj.volume / 100 * C_FRM_AFTERFADE / g_scoreObj.fadeOutTerm) / 1000);
			g_audio.volume = (tmpVolume < 0 ? 0 : tmpVolume);
		}

		// ユーザカスタムイベント(フレーム毎)
		g_customJsObj.mainEnterFrame.forEach(func => func());
		if (g_customJsObj.mainEnterFrame.length > 0) {
			g_scoreObj.baseFrame++;
		}

		// 速度変化 (途中変速, 個別加速)
		while (g_workObj.speedData !== undefined && currentFrame >= g_workObj.speedData[speedCnts]) {
			g_workObj.currentSpeed = g_workObj.speedData[speedCnts + 1];
			speedCnts += 2;
		}
		while (g_workObj.boostData !== undefined && currentFrame >= g_workObj.boostData[boostCnts]) {
			g_workObj.boostSpd = g_workObj.boostData[boostCnts + 1];
			boostCnts += 2;
		}

		objList.forEach(header => {
			const headerU = toCapitalize(header);

			// 個別・全体色変化 (矢印)
			changeColors(g_workObj[`mk${headerU}Color`][currentFrame],
				g_workObj[`mk${headerU}ColorCd`][currentFrame], header, `arrow`);

			// 個別・全体色変化（フリーズアロー）
			g_typeLists.frzColor.forEach(ctype =>
				changeColors(g_workObj[`mk${headerU}FColor${ctype}`][currentFrame],
					g_workObj[`mk${headerU}FColor${ctype}Cd`][currentFrame], header, `frz${ctype}`));

			// 矢印モーション
			changeCssMotions(header, `arrow`, currentFrame);

			// フリーズアローモーション
			changeCssMotions(header, `frz`, currentFrame);

		});

		// ダミー矢印生成（背面に表示するため先に処理）
		if (g_workObj.mkDummyArrow[currentFrame] !== undefined) {
			g_workObj.mkDummyArrow[currentFrame].forEach(data =>
				makeArrow(data, ++dummyArrowCnts[data], `dummyArrow`, g_workObj.dummyArrowColors[data]));
		}

		// 矢印生成
		if (g_workObj.mkArrow[currentFrame] !== undefined) {
			g_workObj.mkArrow[currentFrame].forEach(data =>
				makeArrow(data, ++arrowCnts[data], `arrow`, g_workObj.arrowColors[data]));
		}

		// ダミーフリーズアロー生成
		if (g_workObj.mkDummyFrzArrow[currentFrame] !== undefined) {
			g_workObj.mkDummyFrzArrow[currentFrame].forEach(data =>
				makeFrzArrow(data, ++dummyFrzCnts[data], `dummyFrz`, g_workObj.dummyFrzNormalColors[data], g_workObj.dummyFrzNormalBarColors[data]));
		}

		// フリーズアロー生成
		if (g_workObj.mkFrzArrow[currentFrame] !== undefined) {
			g_workObj.mkFrzArrow[currentFrame].forEach(data =>
				makeFrzArrow(data, ++frzCnts[data], `frz`, g_workObj.frzNormalColors[data], g_workObj.frzNormalBarColors[data]));
		}

		// 矢印・フリーズアロー移動＆消去
		for (let j = 0; j < keyNum; j++) {
			const stepDivHit = document.querySelector(`#stepHit${j}`);

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
		if (g_scoreObj.wordData[currentFrame] !== undefined) {
			g_scoreObj.wordData[currentFrame].forEach(tmpObj => {
				g_wordObj.wordDir = tmpObj[0];
				g_wordObj.wordDat = tmpObj[1];
				g_wordSprite = document.querySelector(`#lblword${g_wordObj.wordDir}`);

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
					const fontSize = setIntVal(g_wordObj.wordDat.match(/\d+/)[0], C_SIZ_MAIN);
					g_wordSprite.style.fontSize = `${fontSize}px`;

				} else {

					// フェードイン・アウト処理後、表示する歌詞を表示
					const fadingFlg = currentFrame - g_workObj.lastFadeFrame[wordDepth] >= g_workObj.wordFadeFrame[wordDepth];
					[`Out`, `In`].forEach(pattern => {
						if (g_wordObj[`fade${pattern}Flg${g_wordObj.wordDir}`] && fadingFlg) {
							g_wordSprite.style.animationName = `none`;
							g_wordObj[`fade${pattern}Flg${g_wordObj.wordDir}`] = false;
						}
					});
					g_workObj[`word${g_wordObj.wordDir}Data`] = g_wordObj.wordDat;
					g_wordSprite.innerHTML = g_wordObj.wordDat;
				}
			});
		}

		// 判定キャラクタ消去
		jdgGroups.forEach(jdg => {
			let charaJCnt = document.querySelector(`#chara${jdg}`).getAttribute(`cnt`);
			if (charaJCnt > 0) {
				document.querySelector(`#chara${jdg}`).setAttribute(`cnt`, --charaJCnt);
				if (charaJCnt === 0) {
					document.querySelector(`#chara${jdg}`).textContent = ``;
					document.querySelector(`#combo${jdg}`).textContent = ``;
					document.querySelector(`#diff${jdg}`).textContent = ``;
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
			if (Math.floor(g_scoreObj.nominalFrameNum % g_fps) === 0) {
				if (g_scoreObj.nominalFrameNum >= 0) {
					lblTime1.textContent = transFrameToTimer(g_scoreObj.nominalFrameNum);
				}
			}

			// 60fpsから遅延するため、その差分を取って次回のタイミングで遅れをリカバリする
			thisTime = performance.now();
			buffTime = 0;
			if (g_audio instanceof AudioPlayer || currentFrame >= musicStartFrame) {
				buffTime = (thisTime - musicStartTime - (currentFrame - musicStartFrame) * 1000 / g_fps);
			}
			g_scoreObj.frameNum++;
			g_scoreObj.nominalFrameNum++;
			g_timeoutEvtId = setTimeout(_ => flowTimeline(), 1000 / g_fps - buffTime);
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

	g_timeoutEvtId = setTimeout(_ => flowTimeline(), 1000 / g_fps);
};

/**
 * アルファマスクの再描画 (Appearance: Hidden+, Sudden+ 用)
 * @param {string} _appearance
 * @param {number} _num 
 */
const changeAppearanceFilter = (_appearance, _num = 10) => {
	const topNum = g_hidSudObj[g_stateObj.appearance];
	const bottomNum = (g_hidSudObj[g_stateObj.appearance] + 1) % 2;
	if (_appearance === `Hid&Sud+` && _num > 50) {
		_num = 50;
	}

	const numPlus = (_appearance === `Hid&Sud+` ? _num : `0`);
	const topShape = `inset(${_num}% 0% ${numPlus}% 0%)`;
	const bottomShape = `inset(${numPlus}% 0% ${_num}% 0%)`;

	$id(`arrowSprite${topNum}`).clipPath = topShape;
	$id(`arrowSprite${topNum}`).webkitClipPath = topShape;
	$id(`arrowSprite${bottomNum}`).clipPath = bottomShape;
	$id(`arrowSprite${bottomNum}`).webkitClipPath = bottomShape;

	$id(`filterBar0`).top = `${g_posObj.arrowHeight * _num / 100}px`;
	$id(`filterBar1`).top = `${g_posObj.arrowHeight * (100 - _num) / 100}px`;

	if (g_appearanceRanges.includes(_appearance)) {
		$id(`filterView`).top =
			$id(`filterBar${g_hidSudObj.std[g_stateObj.appearance][g_stateObj.reverse]}`).top;
		filterView.textContent = `${_num}%`;

		if (_appearance !== `Hid&Sud+` && g_workObj.dividePos.every(v => v === g_workObj.dividePos[0])) {
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
 * @param {string, number} _text
 */
const makeCounterSymbol = (_id, _x, _class, _heightPos, _text, _display = C_DIS_INHERIT) => {
	return createDivCss2Label(_id, _text, {
		x: _x, y: C_LEN_JDGCNTS_HEIGHT * _heightPos,
		w: C_LEN_JDGCNTS_WIDTH, h: C_LEN_JDGCNTS_HEIGHT, siz: C_SIZ_JDGCNTS, align: C_ALIGN_RIGHT,
		display: _display,
	}, _class);
};

// TODO: この部分を矢印塗りつぶし部分についても適用できるように関数を見直し

/**
 * 個別・全体色変化
 * @param {array} _mkColor 
 * @param {array} _mkColorCd 
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
	const frameData = g_workObj[`mk${toCapitalize(camelHeader)}CssMotion`][_frameNum];

	if (frameData !== undefined) {
		for (let j = 0; j < frameData.length; j++) {
			const targetj = frameData[j];
			g_workObj[`${camelHeader}CssMotions`][targetj] =
				g_workObj[`mk${toCapitalize(camelHeader)}CssMotionName`][_frameNum][2 * j + g_workObj.dividePos[targetj]];
		}
	}
};

/**
 * フリーズアローヒット時の描画変更
 * @param {number} _j 
 * @param {number} _k 
 */
const changeHitFrz = (_j, _k, _name) => {
	const frzNo = `${_j}_${_k}`;
	const frzName = `${_name}${frzNo}`;

	if (g_attrObj[frzName].keyUpFrame !== 0) {
		return;
	}

	const styfrzBar = $id(`${_name}Bar${frzNo}`);
	const styfrzBtm = $id(`${_name}Btm${frzNo}`);
	const styfrzBtmShadow = $id(`${_name}BtmShadow${frzNo}`);
	const colorPos = g_keyObj[`color${g_keyObj.currentKey}_${g_keyObj.currentPtn}`][_j];

	// フリーズアロー位置の修正（ステップゾーン上に来るように）
	const delFrzLength = parseFloat($id(`stepRoot${_j}`).top) - g_attrObj[frzName].y;
	document.getElementById(frzName).style.top = $id(`stepRoot${_j}`).top;

	// 早押ししたboostCnt分のフリーズアロー終端位置の修正
	let delFrzMotionLength = 0;
	for (let i = 0; i < g_attrObj[frzName].cnt; i++) {
		delFrzMotionLength += g_workObj.motionOnFrames[g_attrObj[frzName].boostCnt - i] * g_attrObj[frzName].boostSpd;
	}

	g_attrObj[frzName].frzBarLength -= (delFrzLength + delFrzMotionLength) * g_attrObj[frzName].dir;
	g_attrObj[frzName].barY -= (delFrzLength + delFrzMotionLength) * g_attrObj[frzName].dividePos;
	g_attrObj[frzName].btmY -= delFrzLength + delFrzMotionLength;
	g_attrObj[frzName].y += delFrzLength;
	g_attrObj[frzName].isMoving = false;

	styfrzBar.top = `${g_attrObj[frzName].barY}px`;
	styfrzBar.height = `${g_attrObj[frzName].frzBarLength}px`;
	styfrzBar.background = g_workObj[`${_name}HitBarColors`][_j];
	styfrzBtm.top = `${g_attrObj[frzName].btmY}px`;
	styfrzBtm.background = g_workObj[`${_name}HitColors`][_j];
	styfrzBtmShadow.top = styfrzBtm.top;
	if (_name === `frz`) {
		if (g_headerObj.frzShadowColor[colorPos][1] !== ``) {
			styfrzBtmShadow.background = (g_headerObj.frzShadowColor[colorPos][1] === `Default` ?
				g_workObj.frzHitColors[_j] : g_headerObj.frzShadowColor[colorPos][1]);
		}
		$id(`frzHit${_j}`).opacity = 0.9;
		$id(`frzTop${frzNo}`).display = C_DIS_NONE;
		if (isNaN(parseFloat(g_workObj.arrowRtn[_j]))) {
			$id(`frzHitTop${_j}`).background = g_workObj.frzHitColors[_j];
		}
	}
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
	$id(`frzBar${frzNo}`).background = `#999999`;
	$id(`frzBar${frzNo}`).opacity = 1;
	$id(`frzBtm${frzNo}`).background = `#cccccc`;

	const colorPos = g_keyObj[`color${g_keyObj.currentKey}_${g_keyObj.currentPtn}`][_j];
	if (g_headerObj.frzShadowColor[colorPos][0] !== ``) {
		$id(`frzTopShadow${frzNo}`).background = `#333333`;
		$id(`frzBtmShadow${frzNo}`).background = `#333333`;
	}
};

/**
 * キーを押したかどうかを判定
 * @param {number} _keyCode 
 */
const keyIsDown = _keyCode => g_inputKeyBuffer[_keyCode];

/**
 * 矢印・フリーズアロー判定
 * @param {number} _j 対象矢印・フリーズアロー
 */
const judgeArrow = _j => {

	const currentNo = g_workObj.judgArrowCnt[_j];
	const arrowName = `arrow${_j}_${currentNo}`;
	const existJudgArrow = document.getElementById(arrowName) !== null;

	const fcurrentNo = g_workObj.judgFrzCnt[_j];
	const frzName = `frz${_j}_${fcurrentNo}`;
	const existJudgFrz = document.getElementById(frzName) !== null;

	const judgeTargetArrow = _difFrame => {
		const _difCnt = Math.abs(_difFrame);
		if (_difCnt <= g_judgObj.arrowJ[g_judgPosObj.uwan]) {
			const [resultFunc, resultJdg] = checkJudgment(_difCnt);
			resultFunc(_difFrame);
			countFastSlow(_difFrame, g_headerObj.justFrames);

			const stepDivHit = document.querySelector(`#stepHit${_j}`);
			stepDivHit.style.top = `${g_attrObj[arrowName].prevY - parseFloat($id(`stepRoot${_j}`).top) - 15}px`;
			stepDivHit.style.opacity = 0.75;
			stepDivHit.classList.value = ``;
			stepDivHit.classList.add(g_cssObj[`main_step${resultJdg}`]);
			stepDivHit.setAttribute(`cnt`, C_FRM_HITMOTION);

			document.getElementById(arrowName).remove();
			g_workObj.judgArrowCnt[_j]++;
			return true;
		}
		return false;
	};

	const judgeTargetFrzArrow = _difFrame => {
		const _difCnt = Math.abs(_difFrame);
		if (_difCnt <= g_judgObj.frzJ[g_judgPosObj.sfsf] && !g_attrObj[frzName].judgEndFlg) {
			if (g_headerObj.frzStartjdgUse &&
				(g_workObj.judgFrzHitCnt[_j] === undefined || g_workObj.judgFrzHitCnt[_j] <= fcurrentNo)) {
				const [resultFunc] = checkJudgment(_difCnt);
				resultFunc(_difFrame);
				countFastSlow(_difFrame, g_headerObj.justFrames);
				g_workObj.judgFrzHitCnt[_j] = fcurrentNo + 1;
			}
			changeHitFrz(_j, fcurrentNo, `frz`);
			return true;
		}
		return false;
	};

	let judgeFlg = false;
	const difFrame = (existJudgArrow ? g_attrObj[arrowName].cnt : Infinity);
	const frzDifFrame = (existJudgFrz ? g_attrObj[frzName].cnt : Infinity);
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
 * @param {number} _justFrames
 */
const displayDiff = (_difFrame, _justFrames = 0) => {
	let diffJDisp = ``;
	g_workObj.diffList.push(_difFrame);
	const difCnt = Math.abs(_difFrame);
	if (_difFrame > _justFrames) {
		diffJDisp = `<span class="common_matari">Fast ${difCnt} Frames</span>`;
	} else if (_difFrame < _justFrames * (-1)) {
		diffJDisp = `<span class="common_shobon">Slow ${difCnt} Frames</span>`;
	}
	diffJ.innerHTML = diffJDisp;
};

/**
 * Fast/Slowカウンタ
 * @param {number} _difFrame 
 * @param {number} _justFrames 
 */
const countFastSlow = (_difFrame, _justFrames = 0) => {
	if (_difFrame > _justFrames) {
		g_resultObj.fast++;
	} else if (_difFrame < _justFrames * (-1)) {
		g_resultObj.slow++;
	}
};

/**
 * ライフゲージバーの色、数値を変更
 * @param {string} _state 
 */
const changeLifeColor = (_state = ``) => {
	const lblLife = document.querySelector(`#lblLife`);
	const lifeBar = document.querySelector(`#lifeBar`);
	if (_state !== ``) {
		const lifeCss = g_cssObj[`life_${_state}`];
		lblLife.classList.remove(g_cssObj.life_Max, g_cssObj.life_Cleared, g_cssObj.life_Failed);
		lifeBar.classList.remove(g_cssObj.life_Max, g_cssObj.life_Cleared, g_cssObj.life_Failed);
		lblLife.classList.add(lifeCss);
		lifeBar.classList.add(lifeCss);
	}

	const intLifeVal = Math.floor(g_workObj.lifeVal);
	lblLife.textContent = intLifeVal;
	lifeBar.style.top = `${50 + (g_sHeight - 100) * (g_headerObj.maxLifeVal - intLifeVal) / g_headerObj.maxLifeVal}px`;
	lifeBar.style.height = `${(g_sHeight - 100) * intLifeVal / g_headerObj.maxLifeVal}px`;
};

const lifeRecovery = _ => {
	g_workObj.lifeVal += g_workObj.lifeRcv;

	if (g_workObj.lifeVal >= g_headerObj.maxLifeVal) {
		g_workObj.lifeVal = g_headerObj.maxLifeVal;
		changeLifeColor(`Max`);
	} else {
		changeLifeColor(g_workObj.lifeVal >= g_workObj.lifeBorder ? `Cleared` : ``);
	}
};

const lifeDamage = _ => {
	g_workObj.lifeVal -= g_workObj.lifeDmg;

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
 * @param {string} _freezeFlg 
 */
const changeJudgeCharacter = (_name, _character, _freezeFlg = ``) => {
	g_resultObj[_name]++;
	g_currentArrows++;
	document.querySelector(`#chara${_freezeFlg}J`).innerHTML = `<span class="common_${_name}">${_character}</span>`;
	document.querySelector(`#chara${_freezeFlg}J`).setAttribute(`cnt`, C_FRM_JDGMOTION);
	document.querySelector(`#lbl${toCapitalize(_name)}`).textContent = g_resultObj[_name];
};

/**
 * コンボの更新
 */
const updateCombo = _ => {
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
	displayDiff(_difFrame, g_headerObj.justFrames);

	lifeRecovery();
	finishViewing();

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

	displayDiff(_difFrame, g_headerObj.justFrames);
	finishViewing();

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

// クリア表示
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
		document.querySelector(`#${label}`).textContent = ``);
};

const finishViewing = _ => {
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
const resultInit = _ => {

	clearWindow(true);
	g_currentPage = `result`;

	// 結果画面用フレーム初期化
	g_scoreObj.resultFrameNum = 0;
	g_scoreObj.backResultFrameNum = 0;
	g_scoreObj.maskResultFrameNum = 0;

	// 結果画面用ループカウンター
	g_scoreObj.backResultLoopCount = 0;
	g_scoreObj.maskResultLoopCount = 0;

	const divRoot = document.querySelector(`#divRoot`);

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
					[g_headerObj[`${sprite}ResultData`], g_headerObj[`${sprite}ResultMaxDepth`]] = makeSpriteData(failedData);
				}
			});
		} else if (g_gameOverFlg) {
			g_headerObj.backResultData = g_headerObj.backFailedData.concat();
			g_headerObj.maskResultData = g_headerObj.maskFailedData.concat();
			g_headerObj.backResultMaxDepth = g_headerObj.backFailedMaxDepth;
			g_headerObj.maskResultMaxDepth = g_headerObj.maskFailedMaxDepth;
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
	const estimatedAdj = (diffLength <= 20 ? `` : Math.round((g_stateObj.adjustment - bayesExVal) * 10) / 10);

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

	// ランク計算
	let rankMark = g_rankObj.rankMarkX;
	let rankColor = g_rankObj.rankColorX;
	if (g_gameOverFlg) {
		rankMark = g_rankObj.rankMarkF;
		rankColor = g_rankObj.rankColorF;
		g_resultObj.spState = `failed`;
	} else if (playingArrows === g_fullArrows && g_stateObj.autoAll === C_FLG_OFF) {
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
	const musicTitle = g_headerObj.musicTitles[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.musicTitle;

	const mTitleForView = [g_headerObj.musicTitleForView[0], g_headerObj.musicTitleForView[1] || ``];
	if (g_headerObj.musicTitlesForView[g_headerObj.musicNos[g_stateObj.scoreId]] !== undefined) {
		mTitleForView.forEach((mTitle, j) => {
			mTitleForView[j] = g_headerObj.musicTitlesForView[g_headerObj.musicNos[g_stateObj.scoreId]][j];
		});
	}

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const transKeyData = hasVal(g_keyObj[`transKey${keyCtrlPtn}`]) ? `(` + g_keyObj[`transKey${keyCtrlPtn}`] + `)` : ``;

	/**
	 * プレイスタイルのカスタム有無
	 * @param {string} _flg 
	 * @param {string, boolean} _defaultSet デフォルト値
	 * @param {string} _displayText 
	 */
	const withOptions = (_flg, _defaultSet, _displayText = _flg) =>
		(_flg !== _defaultSet ? getStgDetailName(_displayText) : ``);

	let difData = [
		`${getKeyName(g_headerObj.keyLabels[g_stateObj.scoreId])}${transKeyData} ${getStgDetailName('key')} / ${g_headerObj.difLabels[g_stateObj.scoreId]}`,
		`${withOptions(g_autoPlaysBase.includes(g_stateObj.autoPlay), true, `-${getStgDetailName(g_stateObj.autoPlay)}${getStgDetailName('less')}`)}`,
		`${withOptions(g_headerObj.makerView, false, `(${g_headerObj.creatorNames[g_stateObj.scoreId]})`)}`,
		`${withOptions(g_stateObj.shuffle, C_FLG_OFF, `[${getShuffleName()}]`)}`
	].filter(value => value !== ``).join(` `);

	let playStyleData = [
		`${g_stateObj.speed}${g_lblNameObj.multi}`,
		`${withOptions(g_stateObj.motion, C_FLG_OFF)}`,
		`${withOptions(g_stateObj.reverse, C_FLG_OFF,
			getStgDetailName(g_stateObj.scroll !== '---' ? 'R-' : 'Reverse'))}${withOptions(g_stateObj.scroll, '---')}`,
		`${withOptions(g_stateObj.appearance, `Visible`)}`,
		`${withOptions(g_stateObj.gauge, g_settings.gauges[0])}`
	].filter(value => value !== ``).join(`, `);

	let displayData = [
		withOptions(g_stateObj.d_stepzone, C_FLG_ON, g_lblNameObj.rd_StepZone),
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
		displayData += ` : OFF`;
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

	multiAppend(playDataWindow,
		makeCssResultPlayData(`lblMusic`, 20, g_cssObj.result_lbl, 0, g_lblNameObj.rt_Music, C_ALIGN_LEFT),
		makeCssResultPlayData(`lblMusicData`, 60, g_cssObj.result_style, 0, mTitleForView[0]),
		makeCssResultPlayData(`lblMusicData2`, 60, g_cssObj.result_style, 1, mTitleForView[1]),
		makeCssResultPlayData(`lblDifficulty`, 20, g_cssObj.result_lbl, 2, g_lblNameObj.rt_Difficulty, C_ALIGN_LEFT),
		makeCssResultPlayData(`lblDifData`, 60, g_cssObj.result_style, 2, difData),
		makeCssResultPlayData(`lblStyle`, 20, g_cssObj.result_lbl, 3, g_lblNameObj.rt_Style, C_ALIGN_LEFT),
		makeCssResultPlayData(`lblStyleData`, 60, g_cssObj.result_style, 3, playStyleData),
		makeCssResultPlayData(`lblDisplay`, 20, g_cssObj.result_lbl, 4, g_lblNameObj.rt_Display, C_ALIGN_LEFT),
		makeCssResultPlayData(`lblDisplayData`, 60, g_cssObj.result_style, 4, displayData),
		makeCssResultPlayData(`lblDisplay2Data`, 60, g_cssObj.result_style, 5, display2Data),
	);

	// キャラクタ、スコア描画のID共通部、色CSS名、スコア変数名
	const jdgScoreObj = {
		ii: { pos: 0, id: `Ii`, color: `ii`, label: g_lblNameObj.j_ii, },
		shakin: { pos: 1, id: `Shakin`, color: `shakin`, label: g_lblNameObj.j_shakin, },
		matari: { pos: 2, id: `Matari`, color: `matari`, label: g_lblNameObj.j_matari, },
		shobon: { pos: 3, id: `Shobon`, color: `shobon`, label: g_lblNameObj.j_shobon, },
		uwan: { pos: 4, id: `Uwan`, color: `uwan`, label: g_lblNameObj.j_uwan, },
		kita: { pos: 5, id: `Kita`, color: `kita`, label: g_lblNameObj.j_kita, },
		iknai: { pos: 6, id: `Iknai`, color: `iknai`, label: g_lblNameObj.j_iknai, },
		maxCombo: { pos: 7, id: `MCombo`, color: `combo`, label: g_lblNameObj.j_maxCombo, },
		fmaxCombo: { pos: 8, id: `FCombo`, color: `combo`, label: g_lblNameObj.j_fmaxCombo, },
		score: { pos: 10, id: `Score`, color: `score`, label: g_lblNameObj.j_score, },
	};

	// キャラクタ、スコア描画
	Object.keys(jdgScoreObj).forEach(score => {
		multiAppend(resultWindow,
			makeCssResultSymbol(`lbl${jdgScoreObj[score].id}`, 0, g_cssObj[`common_${jdgScoreObj[score].color}`], jdgScoreObj[score].pos, jdgScoreObj[score].label),
			makeCssResultSymbol(`lbl${jdgScoreObj[score].id}S`, 50, g_cssObj.common_score, jdgScoreObj[score].pos, g_resultObj[score], C_ALIGN_RIGHT),
		);
	});
	if (g_stateObj.autoAll === C_FLG_OFF) {
		multiAppend(resultWindow,
			makeCssResultSymbol(`lblFast`, 350, g_cssObj.common_matari, 0, g_lblNameObj.j_fast),
			makeCssResultSymbol(`lblSlow`, 350, g_cssObj.common_shobon, 2, g_lblNameObj.j_slow),
			makeCssResultSymbol(`lblFastS`, 260, g_cssObj.score, 1, g_resultObj.fast, C_ALIGN_RIGHT),
			makeCssResultSymbol(`lblSlowS`, 260, g_cssObj.score, 3, g_resultObj.slow, C_ALIGN_RIGHT),
		);
		if (estimatedAdj !== ``) {
			multiAppend(resultWindow,
				makeCssResultSymbol(`lblAdj`, 350, g_cssObj.common_shakin, 4, g_lblNameObj.j_adj),
				makeCssResultSymbol(`lblAdjS`, 260, g_cssObj.score, 5, `${getDiffFrame(estimatedAdj)}`, C_ALIGN_RIGHT),
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
		resultViewText(g_gameOverFlg ? `failed` : (playingArrows === g_fullArrows ? g_resultObj.spState : ``)),
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
	let scoreName = `${g_headerObj.keyLabels[g_stateObj.scoreId]}${getStgDetailName('k-')}${g_headerObj.difLabels[g_stateObj.scoreId]}${assistFlg}`;
	if (g_headerObj.makerView) {
		scoreName += `-${g_headerObj.creatorNames[g_stateObj.scoreId]}`;
	}
	const highscoreDfObj = {
		ii: 0, shakin: 0, matari: 0, shobon: 0, uwan: 0,
		kita: 0, iknai: 0,
		maxCombo: 0, fmaxCombo: 0, score: 0,
	};

	const highscoreCondition = (g_stateObj.autoAll === C_FLG_OFF && g_stateObj.shuffle === C_FLG_OFF &&
		!hasVal(g_keyObj[`transKey${keyCtrlPtn}`]));

	if (highscoreCondition) {

		// ハイスコア差分描画
		Object.keys(jdgScoreObj).forEach(score => {
			if (score === `score`) {
			} else {
				multiAppend(resultWindow,
					makeCssResultSymbol(`lbl${jdgScoreObj[score].id}L1`, C_RLT_BRACKET_L, g_cssObj.result_scoreHiBlanket, jdgScoreObj[score].pos, `(+`),
					makeCssResultSymbol(`lbl${jdgScoreObj[score].id}LS`, C_RLT_HIDIF_X, g_cssObj.result_scoreHi, jdgScoreObj[score].pos, 0, C_ALIGN_RIGHT),
					makeCssResultSymbol(`lbl${jdgScoreObj[score].id}L2`, C_RLT_BRACKET_R, g_cssObj.result_scoreHiBlanket, jdgScoreObj[score].pos, `)`),
				);
			}
		});

	} else {
		resultWindow.appendChild(makeCssResultSymbol(`lblAutoView`, 215, g_cssObj.result_noRecord, 4, `(No Record)`));
		const lblAutoView = document.querySelector(`#lblAutoView`);
		lblAutoView.style.fontSize = `20px`;
	}

	// ユーザカスタムイベント(初期)
	g_customJsObj.result.forEach(func => func());

	if (highscoreCondition) {

		if (scoreName in g_localStorage.highscores) {
			Object.keys(jdgScoreObj).forEach(judge => {
				if (judge !== ``) {
					highscoreDfObj[judge] = g_resultObj[judge] - g_localStorage.highscores[scoreName][judge];
				}
			});
		} else {
			Object.keys(jdgScoreObj).forEach(judge => {
				if (judge !== ``) {
					highscoreDfObj[judge] = g_resultObj[judge];
				}
			});
		}
		if (highscoreDfObj.score > 0 && g_stateObj.dataSaveFlg) {
			g_localStorage.highscores[scoreName] = {};
			Object.keys(jdgScoreObj).forEach(judge => {
				if (judge !== ``) {
					g_localStorage.highscores[scoreName][judge] = g_resultObj[judge];
				}
			});
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
				document.querySelector(`#lbl${jdgScore.id}L1`).textContent = `(${highscoreDfObj[score] >= 0 ? "+" : "－"}`;
				document.querySelector(`#lbl${jdgScore.id}LS`).textContent = Math.abs(highscoreDfObj[score]);
			}
		});

	}

	// Twitter用リザルト
	// スコアを上塗りする可能性があるため、カスタムイベント後に配置
	const hashTag = (hasVal(g_headerObj.hashTag) ? ` ${g_headerObj.hashTag}` : ``);
	let tweetDifData = `${getKeyName(g_headerObj.keyLabels[g_stateObj.scoreId])}${transKeyData}${getStgDetailName('k-')}${g_headerObj.difLabels[g_stateObj.scoreId]}${assistFlg}`;
	if (g_stateObj.shuffle !== `OFF`) {
		tweetDifData += `:${getShuffleName()}`;
	}
	const twiturl = new URL(g_localStorageUrl);
	twiturl.searchParams.append(`scoreId`, g_stateObj.scoreId);

	let tweetFrzJdg = ``;
	let tweetMaxCombo = `${g_resultObj.maxCombo}`;
	if (g_allFrz > 0) {
		tweetFrzJdg = `${g_resultObj.kita}-${g_resultObj.iknai}`;
		tweetMaxCombo += `-${g_resultObj.fmaxCombo}`;
	}

	let tweetResultTmp = replaceStr(g_headerObj.resultFormat, [
		[`[hashTag]`, hashTag],
		[`[musicTitle]`, musicTitle],
		[`[keyLabel]`, tweetDifData],
		[`[maker]`, g_headerObj.tuning],
		[`[rank]`, rankMark],
		[`[score]`, g_resultObj.score],
		[`[playStyle]`, playStyleData],
		[`[arrowJdg]`, `${g_resultObj.ii}-${g_resultObj.shakin}-${g_resultObj.matari}-${g_resultObj.shobon}-${g_resultObj.uwan}`],
		[`[frzJdg]`, tweetFrzJdg],
		[`[maxCombo]`, tweetMaxCombo],
		[`[url]`, g_isLocal ? `` : `${twiturl.toString()}`.replace(/[\t\n]/g, ``)]
	]);
	if (g_presetObj.resultVals !== undefined) {
		Object.keys(g_presetObj.resultVals).forEach(key => {
			tweetResultTmp = tweetResultTmp.split(`[${key}]`).join(g_resultObj[g_presetObj.resultVals[key]]);
		});
	}
	const resultText = `${unEscapeHtml(tweetResultTmp)}`;
	const tweetResult = `https://twitter.com/intent/tweet?text=${encodeURIComponent(resultText)}`;

	/** 音源、ループ処理の停止 */
	const resetCommonBtn = (_id, _name, _posObj, _func, _cssClass) =>
		createCss2Button(_id, _name, _ => {
			if (g_finishFlg) {
				g_audio.pause();
			}
			clearTimeout(g_timeoutEvtId);
			clearTimeout(g_timeoutEvtResultId);
		}, Object.assign(_posObj, { resetFunc: _func }), _cssClass);

	// ボタン描画
	multiAppend(divRoot,

		// タイトル画面へ戻る
		resetCommonBtn(`btnBack`, g_lblNameObj.b_back, g_lblPosObj.btnRsBack, titleInit, g_cssObj.button_Back),

		// リザルトデータをクリップボードへコピー
		createCss2Button(`btnCopy`, g_lblNameObj.b_copy, _ => {
			copyTextToClipboard(resultText, g_msgInfoObj.I_0001);
		}, g_lblPosObj.btnRsCopy, g_cssObj.button_Setting),

		// リザルトデータをTwitterへ転送
		createCss2Button(`btnTweet`, g_lblNameObj.b_tweet, _ => true, Object.assign(g_lblPosObj.btnRsTweet, {
			resetFunc: _ => openLink(tweetResult),
		}), g_cssObj.button_Tweet),

		// Gitterへのリンク
		createCss2Button(`btnGitter`, g_lblNameObj.b_gitter, _ => true, Object.assign(g_lblPosObj.btnRsGitter, {
			resetFunc: _ => openLink(`https://gitter.im/danonicw/freeboard`),
		}), g_cssObj.button_Default),

		// リトライ
		resetCommonBtn(`btnRetry`, g_lblNameObj.b_retry, g_lblPosObj.btnRsRetry, loadMusic, g_cssObj.button_Reset),
	);

	// マスクスプライトを作成
	const maskResultSprite = createMultipleSprite(`maskResultSprite`, g_headerObj.maskResultMaxDepth);
	if (!g_headerObj.maskresultButton) {
		maskResultSprite.style.pointerEvents = C_DIS_NONE;
	}

	// リザルトモーションの0フレーム対応
	g_animationData.forEach(sprite => {
		if (g_scoreObj[`${sprite}ResultFrameNum`] === 0) {
			if (g_headerObj[`${sprite}ResultData`][0] !== undefined) {
				g_scoreObj[`${sprite}ResultFrameNum`] = drawSpriteData(0, `result`, sprite);
				g_headerObj[`${sprite}ResultData`][0] = undefined;
			}
		}
	});

	/**
	 * タイトルのモーション設定
	 */
	const flowResultTimeline = _ => {

		// ユーザカスタムイベント(フレーム毎)
		g_customJsObj.resultEnterFrame.forEach(func => func());

		// 背景・マスクモーション
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
		g_scoreObj.backResultFrameNum++;
		g_scoreObj.maskResultFrameNum++;
		g_timeoutEvtResultId = setTimeout(_ => flowResultTimeline(), 1000 / g_fps - buffTime);
	};
	flowResultTimeline();

	// キー操作イベント（デフォルト）
	setShortcutEvent(g_currentPage);
	document.oncontextmenu = _ => true;

	g_skinJsObj.result.forEach(func => func());
};

/**
 * シャッフル名称の取得
 * @returns 
 */
const getShuffleName = _ => {
	let shuffleName = getStgDetailName(g_stateObj.shuffle);
	if (!g_stateObj.shuffle.endsWith(`+`)) {
		shuffleName += setScoreIdHeader(g_keycons.shuffleGroupNum);
	}
	return shuffleName;
};

/**
 * 結果表示作成（曲名、オプション）
 * @param {string} _id 
 * @param {number} _x
 * @param {string} _class 
 * @param {number} _heightPos 
 * @param {string} _text
 * @param {string} _align
 */
const makeCssResultPlayData = (_id, _x, _class, _heightPos, _text, _align = C_ALIGN_CENTER, { w = 400, siz = C_SIZ_MAIN } = {}) =>
	createDivCss2Label(_id, _text, {
		x: _x, y: C_SIZ_SETMINI * _heightPos, w, h: C_SIZ_SETMINI, siz, align: _align,
	}, _class);

/**
 * 結果表示作成（キャラクタ）
 * @param {string} _id 
 * @param {number} _x
 * @param {string} _class
 * @param {number} _heightPos 
 * @param {string} _text
 * @param {string} _align
 */
const makeCssResultSymbol = (_id, _x, _class, _heightPos, _text, _align = C_ALIGN_LEFT) =>
	makeCssResultPlayData(_id, _x, _class, _heightPos, _text, _align, { w: 150, siz: C_SIZ_JDGCNTS });

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