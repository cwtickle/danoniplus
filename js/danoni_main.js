'use strict';
/**
 * Dancing☆Onigiri (CW Edition)
 * 
 * Source by tickle
 * Created : 2018/10/08
 * Revised : 2021/01/20
 * 
 * https://github.com/cwtickle/danoniplus
 */
const g_version = `Ver 19.2.0`;
const g_revisedDate = `2021/01/20`;
const g_alphaVersion = ``;

// カスタム用バージョン (danoni_custom.js 等で指定可)
let g_localVersion = ``;
let g_localVersion2 = ``;

// ショートカット用文字列(↓の文字列を検索することで対象箇所へジャンプできます)
//  タイトル:melon  設定・オプション:lime  キーコンフィグ:orange  譜面読込:strawberry  メイン:banana  結果:grape
//  シーンジャンプ:Scene

/**
 * ▽ ソースコーディング
 * https://github.com/cwtickle/danoniplus/blob/develop/.github/CONTRIBUTING.md
 * 
 * - 定数・変数名
 * -- 定数　　　　　： `C_(カテゴリ)_(名前)`の形式。全て英大文字、数字、アンダースコアのみを使用。
 * -- グローバル変数： 変数の頭に`g_`をつける。
 * -- 関数の引数　　： アンダースコア始まりのキャメル表記。
 * 
 * ▽ 画面の構成
 *  [タイトル]-[設定・オプション]-[キーコンフィグ]-[譜面読込]-[メイン]-[リザルト]
 *  ⇒　各画面に Init がついたものが画面の基本構成(ルート)を表す。
 * 
 * ▽ スプライトの親子関係
 *  基本的にdiv要素で管理。最下層を[divRoot]とし、createSprite()でdiv子要素を作成。
 *  clearWindow()で[divRoot]以外の全てのスプライトを削除。
 *  特定のスプライトに限り削除する場合は deleteChildspriteAll() 。
 */

window.onload = _ => {
	g_loadObj.main = true;

	// ロード直後に定数・初期化ファイル、旧バージョン定義関数を読込
	const randTime = new Date().getTime();
	loadScript(`../js/lib/danoni_localbinary.js?${randTime}`, _ => {
		loadScript(`../js/lib/danoni_constants.js?${randTime}`, _ => {
			loadScript(`../js/lib/danoni_legacy_function.js?${randTime}`, _ => {
				initialControl();
			}, false);
		});
	}, false);
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
const g_preloadImgs = [];

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

// キーコンフィグ初期設定
let g_kcType = `Main`;
let g_colorType = `Default`;
let g_baseDisp = `Settings`;

// ライフ・ゲームオーバー・曲終了管理
let g_maxScore = 1000000;
let g_gameOverFlg = false;
let g_finishFlg = true;

const g_userAgent = window.navigator.userAgent.toLowerCase(); // msie, edge, chrome, safari, firefox, opera

/** 共通オブジェクト */
const g_loadObj = {};
const g_rootObj = {};
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
	densityData: [],
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

// ローカルストレージ設定 (作品別)
let g_localStorage;
let g_localStorageUrl;

// ローカルストレージ設定 (ドメイン・キー別)
let g_checkKeyStorage;
let g_localKeyStorage;
let g_canLoadDifInfoFlg = false;

/**
 * 複数のdiv子要素を親要素へ接続
 * @param {object} _baseObj 
 * @param {...any} rest 
 */
const multiAppend = (_baseObj, ...rest) => {
	_baseObj.append(...rest);
};

/**
 * 複数の属性をまとめて設定
 * @param {object} _baseObj 
 * @param {object} rest 
 */
const setAttrs = (_baseObj, { ...rest } = {}) => {
	Object.keys(rest).forEach(property => _baseObj.setAttribute(property, rest[property]));
};

/**
 * 属性値を数値に変換して取得
 * @param {object} _baseObj 
 * @param {string} _attrkey 
 */
const getNumAttr = (_baseObj, _attrkey) => parseFloat(_baseObj.getAttribute(_attrkey));

/**
 * 変数が存在するかどうかをチェック
 * @param {string} _data 
 */
const hasVal = _data => _data !== undefined && _data !== ``;

/**
 * 部分一致検索（リストのいずれかに合致、大小文字問わず）
 * @param {string} _str 検索文字
 * @param {array} _list 検索リスト (英字は小文字にする必要あり)
 * @param {string} prefix 前方一致条件 (前方一致時は ^)
 * @param {string} suffix 後方一致条件 (後方一致時は $)
 */
const listMatching = (_str, _list, { prefix = ``, suffix = `` } = {}) =>
	_list.findIndex(value => _str.toLowerCase().match(new RegExp(String.raw`${prefix}${value}${suffix}`, 'i'))) !== -1;

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
	}
})();

/**
 * 特定キーコードを置換する処理
 * @param {string} _setCode 
 */
const transCode = _setCode => {
	if ([`Control`, `Shift`, `Alt`].includes(_setCode.slice(0, -5))) {
		return _setCode.replace(`Right`, `Left`);
	}
	return _setCode;
}

/**
 * 特定キーをブロックする処理
 * @param {string} _setCode 
 */
const blockCode = _setCode => C_BLOCK_KEYS.map(key => g_kCdN[key]).includes(_setCode) ? false : true;

/**
 * 外部リンクを新規タグで開く
 * @param {string} _url 
 */
const openLink = _url => {
	if (_url.match(`^(http|https):/`)) {
		window.open(_url, `_blank`, `noopener`);
	}
}

/**
 * 文字列を想定された型に変換
 * - _type は `float`(小数)、`number`(整数)、`boolean`(真偽値)、
 *   `switch`(ON/OFF), `calc`(数式), `string`(文字列)から選択
 * - 型に合わない場合は _default を返却するが、_default自体の型チェック・変換は行わない
 * @param {string} _checkStr 
 * @param {string} _default 
 * @param {string} _type 
 */
function setVal(_checkStr, _default, _type) {

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
}

/**
 * 配列の型及び最小配列長のチェック
 * - チェックのみで変換は行わないため、変換が必要な場合は別途処理を組むこと。
 * - 型は最初の要素のみチェックを行う。
 * @param {array} _checkArray 
 * @param {string} _type 
 * @param {number} _minLength 最小配列長
 */
function checkArrayVal(_checkArray, _type, _minLength) {

	// 値がundefined相当の場合は無条件でデフォルト値を返却
	if (_checkArray === undefined || _checkArray === ``) {
		return false;
	}

	// 配列かどうかをチェック
	if (Object.prototype.toString.call(_checkArray) !== `[object Array]`) {
		return false;
	}

	// 最小配列長が不正の場合は強制的に1を設定
	if (isNaN(parseFloat(_minLength))) {
		_minLength = 1;
	}

	let isNaNflg;
	if (_type === C_TYP_FLOAT) {
		// 数値型(小数可)の場合
		isNaNflg = isNaN(parseFloat(_checkArray[0]));
		if (isNaNflg) {
			return false;
		}
	} else if (_type === C_TYP_NUMBER) {
		// 数値型(整数のみ)の場合
		isNaNflg = isNaN(parseInt(_checkArray[0]));
		if (isNaNflg) {
			return false;
		}
	}

	// 配列長のチェック
	return (_checkArray.length >= _minLength ? true : false);
}

/**
 * div要素のstyleを取得
 * @param {string} _id 
 */
function $id(_id) {
	return document.getElementById(`${_id}`).style;
}

/**
 * 先頭のみ大文字に変換（それ以降はそのまま）
 * @param {string} _str 
 */
function toCapitalize(_str) {
	if (!_str || typeof _str !== `string`) return _str;
	return `${_str.charAt(0).toUpperCase()}${_str.slice(1)}`;
}

/**
 * 0以上の数字に変換
 * @param {number} _num 
 * @param {number} _init 0未満の場合に設定する値
 */
function roundZero(_num, _init = 0) {
	return _num < 0 ? _init : _num;
}

/**
 * プリロードするファイルの設定
 * @param {string} _as 
 * @param {string} _href 
 * @param {string} _type 
 * @param {string} _crossOrigin 
 */
function preloadFile(_as, _href, _type = ``, _crossOrigin = `anonymous`) {

	const preloadFlg = g_preloadImgs.find(v => v === _href);

	if (preloadFlg === undefined) {
		g_preloadImgs.push(_href);

		if (g_userAgent.indexOf(`firefox`) !== -1) {
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
			if (location.href.match(`^file`)) {
			} else {
				link.crossOrigin = _crossOrigin;
			}
			document.head.appendChild(link);
		}
	}
}

/**
 * CSSファイルの読み込み（danoni_main.css以外）
 * デフォルトは danoni_skin_default.css を読み込む
 * @param {url} _href 
 */
function importCssFile(_href) {
	const link = document.createElement(`link`);
	link.rel = `stylesheet`;
	link.href = _href;
	document.head.appendChild(link);
}

/**
 * 基本フォントを取得
 */
function getBasicFont() {
	return (g_headerObj.customFont === `` ? C_LBL_BASICFONT : `${g_headerObj.customFont},${C_LBL_BASICFONT}`);
}

/**
 * 半角換算の文字数を計算
 * @param {string} _str 
 */
function getStrLength(_str) {
	let result = 0;
	for (let i = 0; i < _str.length; i++) {
		const chr = _str.charCodeAt(i);
		if ((chr >= 0x00 && chr < 0x81) ||
			(chr === 0xf8f0) ||
			(chr >= 0xff61 && chr < 0xffa0) ||
			(chr >= 0xf8f1 && chr < 0xf8f4)) {
			//半角文字の場合は1を加算
			result += 1;
		} else {
			//それ以外の文字の場合は2を加算
			result += 2;
		}
	}
	//結果を返す
	return result;
}

/**
 * 左パディング
 * @param {string} _str 元の文字列 
 * @param {number} _length パディング後の長さ 
 * @param {string} _chr パディング文字列
 */
function paddingLeft(_str, _length, _chr) {
	let paddingStr = _str;
	while (paddingStr.length < _length) {
		paddingStr = _chr + paddingStr;
	}
	return paddingStr;
}

/**
 * クリップボードコピー関数
 * 入力値をクリップボードへコピーする
 * @param {string} _textVal 入力値
 */
function copyTextToClipboard(_textVal) {
	// テキストエリアを用意する
	const copyFrom = document.createElement(`textarea`);
	// テキストエリアへ値をセット
	copyFrom.textContent = _textVal;

	// bodyタグの要素を取得
	const bodyElm = document.getElementsByTagName(`body`)[0];
	// 子要素にテキストエリアを配置
	bodyElm.appendChild(copyFrom);

	// テキストエリアの値を選択
	copyFrom.select();
	// コピーコマンド発行
	const retVal = document.execCommand(`copy`);
	// 追加テキストエリアを削除
	bodyElm.removeChild(copyFrom);
	// 処理結果を返却
	return retVal;
}

/**
 * 図形の描画
 * - div子要素の作成。呼び出しただけでは使用できないので、親divよりappendChildすること。
 * - 詳細は @see {@link createButton} も参照のこと。 
 * @param {string} _id
 * @param {number} _x 
 * @param {number} _y 
 * @param {number} _width 
 * @param {number} _height 
 */
function createDiv(_id, _x, _y, _width, _height) {
	const div = document.createElement(`div`);

	div.id = _id;
	const style = div.style;
	style.left = `${_x}px`;
	style.top = `${_y}px`;
	style.width = `${_width}px`;
	style.height = `${_height}px`;
	style.position = `absolute`;

	style.userSelect = C_DIS_NONE;
	style.webkitUserSelect = C_DIS_NONE;
	style.msUserSelect = C_DIS_NONE;
	style.mozUserSelect = C_DIS_NONE;
	style.webkitTouchCallout = C_DIS_NONE;

	return div;
}

/**
 * 子div要素のラベル文字作成
 * - createDivLabelに加えて、独自フォントが指定できる形式。
 * @param {string} _id 
 * @param {number} _x 
 * @param {number} _y 
 * @param {number} _width 
 * @param {number} _height 
 * @param {number} _fontsize 
 * @param {string} _color 
 * @param {string} _text 
 * @param {string} _font 
 */
function createDivCustomLabel(_id, _x, _y, _width, _height, _fontsize, _color, _text, _font) {
	const div = createDiv(_id, _x, _y, _width, _height);
	const style = div.style;
	style.fontSize = `${_fontsize}px`;
	if (_color !== ``) {
		style.color = _color;
	}
	style.fontFamily = _font;
	style.textAlign = C_ALIGN_CENTER;
	div.innerHTML = _text;

	return div;
}

/**
 * 子div要素のラベル文字作成 (CSS版・拡張属性対応)
 * @param {string} _id 
 * @param {string} _text 
 * @param {object} _obj (x, y, w, h, siz, align, ...rest)
 * @param {...any} _classes 
 */
function createDivCss2Label(_id, _text, { x = 0, y = 0, w = C_LEN_SETLBL_WIDTH, h = C_LEN_SETLBL_HEIGHT,
	siz = C_SIZ_SETLBL, align = C_ALIGN_CENTER, ...rest } = {}, ..._classes) {
	const div = createDiv(_id, x, y, w, h);
	div.classList.add(g_cssObj.title_base, ..._classes);

	const style = div.style;
	style.fontSize = `${siz}px`;
	style.fontFamily = getBasicFont();
	style.textAlign = `${align}`;
	div.innerHTML = _text;
	Object.keys(rest).forEach(property => style[property] = rest[property]);

	return div;
}

/**
 * 画像表示
 * @param {string} _id 
 * @param {string} _imgPath 
 * @param {number} _x 
 * @param {number} _y 
 * @param {number} _width 
 * @param {number} _height 
 */
function createImg(_id, _imgPath, _x, _y, _width, _height) {
	const div = createDiv(_id, _x, _y, _width, _height);
	div.innerHTML = `<img id=${_id}img src=${_imgPath} style=width:${_width}px;height:${_height}px>`;

	return div;
}

/**
 * 色付きオブジェクトの作成 (拡張属性対応)
 * @param {string} _id 
 * @param {object} _obj (x, y, w, h, color, rotate, styleName, ...rest) 
 * @param {...any} _classes 
 */
function createColorObject2(_id,
	{ x = 0, y = 0, w = C_ARW_WIDTH, h = C_ARW_WIDTH, rotate = ``, styleName = ``, ...rest } = {}, ..._classes) {

	const div = createDiv(_id, x, y, w, h);
	div.classList.add(..._classes);
	const style = div.style;

	// 矢印・オブジェクト判定
	let charaStyle;
	if (isNaN(parseFloat(rotate))) {
		charaStyle = `${rotate}${styleName}`;
	} else {
		charaStyle = `arrow${styleName}`;
		style.transform = `rotate(${rotate}deg)`;
	}

	style.maskImage = `url("${g_imgObj[charaStyle]}")`;
	style.maskSize = `contain`;
	style.webkitMaskImage = `url("${g_imgObj[charaStyle]}")`;
	style.webkitMaskSize = `contain`;
	Object.keys(rest).forEach(property => style[property] = rest[property]);
	setAttrs(div, { color: rest.background || ``, type: charaStyle, cnt: 0, });

	return div;
}

/**
 * 空スプライト(ムービークリップ相当)の作成
 * - 作成済みの場合はすでに作成済のスプライトを返却する
 * - ここで作成したスプライトは clearWindow() により削除される
 * @param {string} _parentObjName 親スプライト名
 * @param {string} _newObjName 作成する子スプライト名
 * @param {number} _x 作成するスプライトのx座標（親スプライト基準）
 * @param {number} _y 作成するスプライトのy座標（親スプライト基準）
 * @param {number} _width 幅
 * @param {number} _height 高さ
 */
function createSprite(_parentObjName, _newObjName, _x, _y, _width, _height, _options = {}) {
	let newsprite;
	if (document.getElementById(_newObjName) === null) {
		newsprite = createDiv(_newObjName, _x, _y, _width, _height);
		document.getElementById(_parentObjName).appendChild(newsprite);
	} else {
		newsprite = document.getElementById(_newObjName);
	}
	if (_options.description !== undefined) {
		newsprite.title = _options.description;
	}
	return newsprite;
}

/**
 * 階層スプライト（全体）の作成
 * @param {string} _baseName 
 * @param {number} _num 
 */
function createMultipleSprite(_baseName, _num) {
	const sprite = createSprite(`divRoot`, `${_baseName}`, 0, 0, g_sWidth, g_sHeight);
	for (let j = 0; j <= _num; j++) {
		createSprite(_baseName, `${_baseName}${j}`, 0, 0, g_sWidth, g_sHeight);
	}
	return sprite;
}

/**
 * 親スプライト配下の子スプライトを全削除
 * @param {object} _parentObjName 親スプライト名
 */
function deleteChildspriteAll(_parentObjName) {

	const parentsprite = document.querySelector(`#${_parentObjName}`);
	while (parentsprite.hasChildNodes()) {
		g_handler.removeListener(parentsprite.firstChild.getAttribute(`lsnrkey`));
		g_handler.removeListener(parentsprite.firstChild.getAttribute(`lsnrkeyTS`));
		g_handler.removeListener(parentsprite.firstChild.getAttribute(`lsnrkeyTE`));
		parentsprite.removeChild(parentsprite.firstChild);
	}
}

/**
 * ボタンの作成 (CSS版・拡張属性対応)
 * @param {string} _id 
 * @param {string} _text
 * @param {function} _func
 * @param {object} _obj (x, y, w, h, siz, align, ...rest)
 * @param {...any} _classes 
 */
function createCss2Button(_id, _text, _func, { x = 0, y = g_sHeight - 100, w = g_sWidth / 3, h = C_BTN_HEIGHT,
	siz = C_LBL_BTNSIZE, align = C_ALIGN_CENTER, title = ``, cxtFunc = _ => true, ...rest } = {}, ..._classes) {

	const div = createDiv(_id, x, y, w, h);
	div.classList.add(`button_common`, ..._classes);
	div.innerHTML = _text;
	div.title = title;
	div.ontouchstart = ``;

	const style = div.style;
	style.textAlign = align;
	style.fontSize = `${siz}px`;
	style.fontFamily = getBasicFont();
	if (rest.animationName !== undefined) {
		style.animationDuration = `1s`;
	}
	Object.keys(rest).forEach(property => style[property] = rest[property]);

	// ボタンを押したときの動作
	const lsnrkey = g_handler.addListener(div, `click`, evt => {
		if (!setVal(g_btnDeleteFlg[_id], false, C_TYP_BOOLEAN)) {
			_func(evt);
		}
		if (typeof g_btnAddFunc[_id] === C_TYP_FUNCTION) {
			g_btnAddFunc[_id](evt);
		}
	});

	// 右クリック時の処理
	if (typeof cxtFunc === C_TYP_FUNCTION) {
		div.oncontextmenu = evt => {
			if (!setVal(g_cxtDeleteFlg[_id], false, C_TYP_BOOLEAN)) {
				cxtFunc(evt);
			}
			if (typeof g_btnAddFunc[_id] === C_TYP_FUNCTION) {
				g_cxtAddFunc[_id](evt);
			}
			return false;
		}
	}

	// イベントリスナー用のキーをセット
	div.setAttribute(`lsnrkey`, lsnrkey);

	return div;
}

/**
 * オブジェクトのスタイル一括変更
 * @param {string} _id 
 * @param {object} _obj (x, y, w, h, siz, align, title, ...rest) 
 */
function changeStyle(_id, { x, y, w, h, siz, align, title, ...rest } = {}) {
	const div = document.querySelector(`#${_id}`);
	const style = div.style;

	const obj = {
		left: x,
		top: y,
		width: w,
		height: h,
		fontSize: siz,
	};
	Object.keys(obj).filter(property => setVal(obj[property], ``, C_TYP_FLOAT !== ``))
		.forEach(property => style[property] = `${obj[property]}px`);

	if (align !== undefined) {
		style.textAlign = `${align}`;
	}
	if (title !== undefined) {
		div.title = title;
	}
	Object.keys(rest).forEach(property => style[property] = rest[property]);
}

/**
 * ラベル文字作成（レイヤー直書き。htmlタグは使用できない）
 * @param {string} _ctx ラベルを作成する場所のコンテキスト名
 * @param {string} _text 表示するテキスト
 * @param {number} _x 作成先のx座標
 * @param {number} _y 作成先のy座標
 * @param {number} _fontsize フォントサイズ
 * @param {number} _fontname フォント名
 * @param {string} _color 色 (カラーコード:#ffffff 形式 or グラデーション)
 * @param {string} _align テキストの表示位置 (left, center, right)
 */
function createLabel(_ctx, _text, _x, _y, _fontsize, _fontname, _color, _align) {
	const fontFamilys = _fontname.split(`,`);
	let fontView = ``;
	for (let j = 0; j < fontFamilys.length; j++) {
		fontView += `"${fontFamilys[j]}",`;
	}
	fontView += `sans-serif`;

	_ctx.font = `${_fontsize}px ${fontView}`;
	_ctx.textAlign = _align;
	_ctx.fillStyle = _color;
	_ctx.fillText(_text, _x, _y);
}

/**
 * タイトル文字描画
 * @param {string} _id 
 * @param {string} _titlename 
 * @param {number} _x 
 * @param {number} _y 
 */
function getTitleDivLabel(_id, _titlename, _x, _y, ..._classes) {
	return createDivCss2Label(_id, _titlename, { x: _x, y: _y, w: g_sWidth, h: 50, siz: C_LBL_BTNSIZE }, ..._classes);
}

/**
 * 画面上の描画、オブジェクトを全てクリア
 * - divオブジェクト(ボタンなど)はdivRoot配下で管理しているため、子要素のみを全削除している。
 * - dicRoot自体を削除しないよう注意すること。
 * - 再描画時に共通で表示する箇所はここで指定している。
 */
function clearWindow() {
	document.onkeyup = _ => { };
	document.onkeydown = evt => blockCode(transCode(evt.code));

	if (document.querySelector(`#layer0`) !== null) {

		// レイヤー情報取得
		const layer0 = document.querySelector(`#layer0`);
		const l0ctx = layer0.getContext(`2d`);

		const C_MARGIN = 0;

		// 線画、図形をクリア
		l0ctx.clearRect(0, 0, g_sWidth, g_sHeight);

		if (document.querySelector(`#layer1`) !== null) {
			const layer1 = document.querySelector(`#layer1`);
			const l1ctx = layer1.getContext(`2d`);
			l1ctx.clearRect(0, 0, g_sWidth, g_sHeight);

			// 線画 (title-line)
			l1ctx.beginPath();
			l1ctx.strokeStyle = `#cccccc`;
			l1ctx.moveTo(C_MARGIN, C_MARGIN);
			l1ctx.lineTo(g_sWidth - C_MARGIN, C_MARGIN);
			l1ctx.stroke();

			l1ctx.beginPath();
			l1ctx.strokeStyle = `#cccccc`;
			l1ctx.moveTo(C_MARGIN, g_sHeight - C_MARGIN);
			l1ctx.lineTo(g_sWidth - C_MARGIN, g_sHeight - C_MARGIN);
			l1ctx.stroke();
		}
		if (document.querySelector(`#layer2`) !== null) {
			const layer2 = document.querySelector(`#layer2`);
			const l2ctx = layer2.getContext(`2d`);
			l2ctx.clearRect(0, 0, g_sWidth, g_sHeight);
		}
	}

	// ボタン、オブジェクトをクリア (divRoot配下のもの)
	deleteChildspriteAll(`divRoot`);

}

/**
 * 外部jsファイルの読込
 * 読込可否を g_loadObj[ファイル名] で管理 (true: 読込成功, false: 読込失敗)
 * @param {string} _url 
 * @param {function} _callback 
 * @param {boolean} _requiredFlg (default : true / 読込必須)
 * @param {string} _charset (default : UTF-8)
 */
function loadScript(_url, _callback, _requiredFlg = true, _charset = `UTF-8`) {
	g_loadObj[_url.split(`?`)[0]] = true;
	const script = document.createElement(`script`);
	script.type = `text/javascript`;
	script.src = _url;
	script.charset = _charset;
	script.onload = _ => _callback();
	script.onerror = _ => {
		if (_requiredFlg) {
			makeWarningWindow(g_msgInfoObj.E_0041.split(`{0}`).join(_url.split(`?`)[0]));
		} else {
			g_loadObj[_url.split(`?`)[0]] = false;
			_callback();
		}
	};
	document.querySelector(`head`).appendChild(script);
}

// WebAudioAPIでAudio要素風に再生するクラス
class AudioPlayer {
	constructor() {
		const AudioContext = window.AudioContext || window.webkitAudioContext;
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

	play() {
		this._source = this._context.createBufferSource();
		this._source.buffer = this._buffer;
		this._source.playbackRate.value = this.playbackRate;
		this._source.connect(this._gain);
		this._startTime = this._context.currentTime;
		this._source.start(this._context.currentTime, this._fadeinPosition);
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
 * 背景・マスク用画像の描画
 * @param {object} _obj 
 */
function makeSpriteImage(_obj) {
	let tmpInnerHTML = `<img src=${_obj.path} class="${_obj.class}"
					style="position:absolute;left:${_obj.left}px;top:${_obj.top}px`;
	if (_obj.width !== 0 && _obj.width > 0) {
		tmpInnerHTML += `;width:${_obj.width}px`;
	}
	if (_obj.height !== `` && setVal(_obj.height, 0, C_TYP_NUMBER) > 0) {
		tmpInnerHTML += `;height:${_obj.height}px`;
	}
	tmpInnerHTML += `;animation-name:${_obj.animationName}
					;animation-duration:${_obj.animationDuration}s
					;opacity:${_obj.opacity}">`;
	return tmpInnerHTML;
}

/**
 * 背景・マスク用テキストの描画
 * @param {object} _obj 
 */
function makeSpriteText(_obj) {
	let tmpInnerHTML = `<span class="${_obj.class}"
					style="display:inline-block;position:absolute;left:${_obj.left}px;top:${_obj.top}px`;

	// この場合のwidthは font-size と解釈する
	if (_obj.width !== 0 && _obj.width > 0) {
		tmpInnerHTML += `;font-size:${_obj.width}px`;
	}

	// この場合のheightは color と解釈する
	if (_obj.height !== ``) {
		tmpInnerHTML += `;color:${_obj.height}`;
	}
	tmpInnerHTML += `;animation-name:${_obj.animationName}
					;animation-duration:${_obj.animationDuration}s
					;opacity:${_obj.opacity}">${_obj.path}</span>`;
	return tmpInnerHTML;
}

/**
 * 多重配列の存在をチェックし、
 * 存在しない場合は作成、存在する場合は重複を避けて配列を新規作成
 * @param {object, array} _obj 
 */
function checkDuplicatedObjects(_obj) {
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
}

/**
 * 多層スプライトデータの作成処理
 * @param {array} _data 
 * @param {function} _calcFrame 
 */
function makeSpriteData(_data, _calcFrame = _frame => _frame) {

	const spriteData = [];
	let maxDepth = -1;

	const tmpArrayData = _data.split(`\r`).join(`\n`).split(`\n`);

	tmpArrayData.filter(data => hasVal(data)).forEach(tmpData => {
		const tmpSpriteData = tmpData.split(`,`);

		// 深度が"-"の場合はスキップ
		if (tmpSpriteData.length > 1 && tmpSpriteData[1] !== `-`) {

			// 値チェックとエスケープ処理
			let tmpFrame;
			if (setVal(tmpSpriteData[0], 200, C_TYP_NUMBER) === 0) {
				tmpFrame = 0;
			} else {
				tmpFrame = roundZero(_calcFrame(setVal(tmpSpriteData[0], 200, C_TYP_CALC)));
			}
			const tmpDepth = (tmpSpriteData[1] === C_FLG_ALL ? C_FLG_ALL : setVal(tmpSpriteData[1], 0, C_TYP_CALC));
			if (tmpDepth !== C_FLG_ALL && tmpDepth > maxDepth) {
				maxDepth = tmpDepth;
			}

			const tmpObj = {
				path: escapeHtml(setVal(tmpSpriteData[2], ``, C_TYP_STRING), g_escapeStr.escapeCode),	// 画像パス or テキスト
				class: escapeHtml(setVal(tmpSpriteData[3], ``, C_TYP_STRING)),		// CSSクラス
				left: setVal(tmpSpriteData[4], 0, C_TYP_CALC),						// X座標
				top: setVal(tmpSpriteData[5], 0, C_TYP_CALC),						// Y座標
				width: setVal(tmpSpriteData[6], 0, C_TYP_NUMBER),					// spanタグの場合は font-size
				height: escapeHtml(setVal(tmpSpriteData[7], ``, C_TYP_STRING)),		// spanタグの場合は color(文字列可)
				opacity: setVal(tmpSpriteData[8], 1, C_TYP_FLOAT),
				animationName: escapeHtml(setVal(tmpSpriteData[9], C_DIS_NONE, C_TYP_STRING)),
				animationDuration: setVal(tmpSpriteData[10], 0, C_TYP_NUMBER) / g_fps,
			};
			if (g_headerObj.autoPreload) {
				if (checkImage(tmpObj.path)) {
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
				htmlText: emptyPatterns.includes(tmpObj.path) ?
					`` : (checkImage(tmpObj.path) ? makeSpriteImage(tmpObj) : makeSpriteText(tmpObj)),
			};
		}
	});

	return [spriteData, maxDepth];
}

/**
 * 現在URLのクエリパラメータから指定した値を取得
 * @param {string} _name
 */
function getQueryParamVal(_name) {
	const param = new URL(location.href).searchParams.get(_name);
	return param !== null ? decodeURIComponent(param.replace(/\+/g, ` `)) : null;
}

/**
 * ローディング文字用ラベルの作成
 */
function getLoadingLabel() {
	return createDivCss2Label(`lblLoading`, g_lblNameObj.nowLoading, {
		x: 0, y: g_sHeight - 40, w: g_sWidth, h: C_LEN_SETLBL_HEIGHT,
		siz: C_SIZ_SETLBL, align: C_ALIGN_RIGHT,
	});
}

/*-----------------------------------------------------------*/
/* Scene : TITLE [melon] */
/*-----------------------------------------------------------*/

function initialControl() {

	[g_sWidth, g_sHeight] = [
		setVal($id(`canvas-frame`).width, 600, C_TYP_FLOAT), setVal($id(`canvas-frame`).height, 500, C_TYP_FLOAT)
	];

	let divRoot;
	if (document.querySelector(`#divRoot`) === null) {
		const stage = document.querySelector(`#canvas-frame`);
		divRoot = createDiv(`divRoot`, 0, 0, g_sWidth, g_sHeight);
		stage.style.margin = `auto`;
		stage.style.letterSpacing = `normal`;
		stage.appendChild(divRoot);
		clearWindow();
	} else {
		divRoot = document.querySelector(`#divRoot`);
	}

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
		const divBack = createSprite(`divRoot`, `divBack`, 0, 0, g_sWidth, g_sHeight);
		divBack.style.background = `linear-gradient(#000000, #222222)`;
	}

	// Now Loadingを表示
	divRoot.appendChild(getLoadingLabel());

	// 譜面初期情報ロード許可フラグ
	g_canLoadDifInfoFlg = true;

	// 譜面データの読み込みオプション
	const ampSplitInput = document.querySelector(`#enableAmpersandSplit`);
	if (ampSplitInput !== null) {
		g_enableAmpersandSplit = setVal(ampSplitInput.value, true, C_TYP_BOOLEAN);
	}

	const decodeUriInput = document.querySelector(`#enableDecodeURI`);
	if (decodeUriInput !== null) {
		g_enableDecodeURI = setVal(decodeUriInput.value, false, C_TYP_BOOLEAN);
	}

	// 作品別ローカルストレージの読み込み
	loadLocalStorage();

	// 譜面データの読み込み
	loadDos(_ => loadSettingJs(), 0);
}

/**
 * 作品別ローカルストレージの読み込み・初期設定
 */
function loadLocalStorage() {
	// URLからscoreIdを削除
	const url = new URL(location.href);
	url.searchParams.delete('scoreId');
	g_localStorageUrl = url.toString();

	const checkStorage = localStorage.getItem(g_localStorageUrl);
	if (checkStorage) {
		g_localStorage = JSON.parse(checkStorage);

		// Adjustment初期値設定
		if (g_localStorage.adjustment !== undefined) {
			g_stateObj.adjustment = setVal(g_localStorage.adjustment, 0, C_TYP_NUMBER);
			g_adjustmentNum = roundZero(g_adjustments.findIndex(adjustment => adjustment === g_stateObj.adjustment), C_MAX_ADJUSTMENT);
		} else {
			g_localStorage.adjustment = 0;
		}

		// Volume初期値設定
		if (g_localStorage.volume !== undefined) {
			g_stateObj.volume = setVal(g_localStorage.volume, 100, C_TYP_NUMBER);
			g_volumeNum = roundZero(g_volumes.findIndex(volume => volume === g_stateObj.volume));
		} else {
			g_localStorage.volume = 100;
		}

		// Appearance初期値設定
		if (g_localStorage.appearance !== undefined) {
			g_stateObj.appearance = g_localStorage.appearance;
			g_appearanceNum = roundZero(g_appearances.findIndex(setting => setting === g_stateObj.appearance));
		}

		// Opacity初期値設定
		if (g_localStorage.opacity !== undefined) {
			g_stateObj.opacity = g_localStorage.opacity;
			g_opacityNum = roundZero(g_opacitys.findIndex(setting => setting === g_stateObj.opacity));
		}

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
}

/**
 * 譜面読込
 * @param {function} _afterFunc 実行後の処理
 * @param {number} _scoreId 譜面番号
 * @param {boolean} _cyclicFlg 再読込フラグ（譜面詳細情報取得用、再帰的にloadDosを呼び出す）
 */
function loadDos(_afterFunc, _scoreId = g_stateObj.scoreId, _cyclicFlg = false) {

	const dosInput = document.querySelector(`#dos`);
	const externalDosInput = document.querySelector(`#externalDos`);
	const divRoot = document.querySelector(`#divRoot`);
	const queryDos = getQueryParamVal(`dos`) !== null ? `dos/${getQueryParamVal('dos')}.txt` :
		(externalDosInput !== null ? externalDosInput.value : ``);

	if (dosInput === null && queryDos === ``) {
		makeWarningWindow(g_msgInfoObj.E_0023);
		g_loadObj.main = false;
		_afterFunc();
		return;
	}

	// 譜面分割あり、譜面番号固定時のみ譜面データを一時クリア
	const dosDivideInput = document.querySelector(`#externalDosDivide`);
	const dosLockInput = document.querySelector(`#externalDosLock`);
	const dosDivideFlg = setVal(dosDivideInput !== null ? dosDivideInput.value : getQueryParamVal(`dosDivide`), false, C_TYP_BOOLEAN);
	g_stateObj.scoreLockFlg = setVal(dosLockInput !== null ? dosLockInput.value : getQueryParamVal(`dosLock`), false, C_TYP_BOOLEAN);
	if (queryDos !== `` && dosDivideFlg && g_stateObj.scoreLockFlg) {
		const scoreList = Object.keys(g_rootObj).filter(data => {
			return data.endsWith(`_data`) || data.endsWith(`_change`);
		});
		scoreList.forEach(scoredata => g_rootObj[scoredata] = ``);
	}

	// HTML埋め込みdos
	if (dosInput !== null) {
		Object.assign(g_rootObj, dosConvert(dosInput.value));
		if (queryDos === ``) {
			_afterFunc();
			if (_cyclicFlg) {
				reloadDos(_scoreId);
			}
		}
	}

	// 外部dos読み込み
	if (queryDos !== ``) {
		let charset = document.characterSet;
		const charsetInput = document.querySelector(`#externalDosCharset`);
		if (charsetInput !== null) {
			charset = charsetInput.value;
		}
		const filenameBase = queryDos.match(/.+\..*/)[0];
		const filenameExtension = filenameBase.split(`.`).pop();
		const filenameCommon = filenameBase.split(`.${filenameExtension}`)[0];
		const filename = (!dosDivideFlg ?
			`${filenameCommon}.${filenameExtension}` :
			`${filenameCommon}${setScoreIdHeader(_scoreId)}.${filenameExtension}`);

		const randTime = new Date().getTime();
		loadScript(`${filename}?${randTime}`, _ => {
			if (typeof externalDosInit === C_TYP_FUNCTION) {
				if (document.querySelector(`#lblLoading`) !== null) {
					divRoot.removeChild(document.querySelector(`#lblLoading`));
				}

				// 外部データを読込（ファイルが見つからなかった場合は譜面追記をスキップ）
				externalDosInit();
				if (g_loadObj[filename]) {
					Object.assign(g_rootObj, dosConvert(g_externalDos));
				}

			} else {
				makeWarningWindow(g_msgInfoObj.E_0022);
			}
			_afterFunc();
			if (_cyclicFlg) {
				reloadDos(_scoreId);
			}
		}, false, charset);
	}
}

/**
 * 譜面情報の再取得を行う（譜面詳細情報取得用）
 * @param {number} _scoreId 
 */
function reloadDos(_scoreId) {
	_scoreId++;
	if (g_headerObj.keyLabels !== undefined && _scoreId < g_headerObj.keyLabels.length) {
		loadDos(_ => {
			getScoreDetailData(_scoreId);
		}, _scoreId, true);
	} else {
		titleInit();
	}
}

/**
 * 初回読込後に画像プリロードを設定する処理
 */
function initAfterDosLoaded() {

	// クエリで譜面番号が指定されていればセット
	g_stateObj.scoreId = setVal(getQueryParamVal(`scoreId`), 0, C_TYP_NUMBER);

	// 譜面ヘッダー、特殊キー情報の読込
	g_headerObj = headerConvert(g_rootObj);
	keysConvert(g_rootObj);

	// キー数情報を初期化
	g_keyObj.currentKey = g_headerObj.keyLabels[g_stateObj.scoreId];
	g_keyObj.currentPtn = 0;

	// CSSファイル内のbackgroundを取得するために再描画
	if (document.querySelector(`#layer0`) === null) {
		divRoot.removeChild(document.querySelector(`#divBack`));
		createSprite(`divRoot`, `divBack`, 0, 0, g_sWidth, g_sHeight);
	} else if (g_headerObj.skinType !== `default` && !g_headerObj.customBackUse) {
		createSprite(`divRoot`, `divBack`, 0, 0, g_sWidth, g_sHeight);
	}

	// CSSファイルの読み込み
	const randTime = new Date().getTime();
	importCssFile(`${g_headerObj.skinRoot}danoni_skin_${g_headerObj.skinType}.css?${randTime}`);
	if (g_headerObj.skinType2 !== ``) {
		importCssFile(`${g_headerObj.skinRoot2}danoni_skin_${g_headerObj.skinType2}.css?${randTime}`);
	}

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
				lastCnt = setVal(tmpPreloadImages[1], 1, C_TYP_NUMBER);
				paddingLen = String(setVal(tmpPreloadImages[1], 1, C_TYP_STRING)).length;
			} else {
				// Pattern C, Dの場合
				startCnt = setVal(termRoopCnts[0], 1, C_TYP_NUMBER);
				lastCnt = setVal(termRoopCnts[1], 1, C_TYP_NUMBER);
				paddingLen = String(setVal(termRoopCnts[1], 1, C_TYP_STRING)).length;
			}
			for (let k = startCnt; k <= lastCnt; k++) {
				preloadFile(`image`, tmpPreloadImages[0].replace(/\*/g, paddingLeft(String(k), paddingLen, `0`)));
			}
		}
	});

	if (g_loadObj.main) {
		// customjsの読み込み後、譜面詳細情報取得のために譜面をロード
		loadCustomjs(_ => {
			loadDos(_ => {
				getScoreDetailData(0);
			}, 0, true);
		});
	} else {
		getScoreDetailData(0);
		reloadDos(0);
	}
}

/**
 * 譜面ファイル読込後処理（譜面詳細情報取得用）
 * @param {number} _scoreId 
 */
function getScoreDetailData(_scoreId) {
	const keyCtrlPtn = `${g_headerObj.keyLabels[_scoreId]}_0`;
	storeBaseData(_scoreId, scoreConvert(g_rootObj, _scoreId, 0, ``, keyCtrlPtn, true), keyCtrlPtn);
}

/**
 * 譜面詳細データの格納
 * @param {number} _scoreId 
 * @param {object} _scoreObj 
 * @param {number} _keyCtrlPtn 
 */
function storeBaseData(_scoreId, _scoreObj, _keyCtrlPtn) {
	const lastFrame = getLastFrame(_scoreObj, _keyCtrlPtn) + 1;
	const startFrame = getStartFrame(lastFrame, 0, _scoreId);
	const firstArrowFrame = getFirstArrowFrame(_scoreObj, _keyCtrlPtn);
	const playingFrame = lastFrame - firstArrowFrame;
	const keyNum = g_keyObj[`chara${_keyCtrlPtn}`].length;

	// 譜面密度グラフ用のデータ作成
	const noteCnt = { arrow: [], frz: [] };
	const densityData = [];
	let allData = 0;
	for (let j = 0; j < C_LEN_DENSITY_DIVISION; j++) {
		densityData[j] = 0;
	}

	const types = [`arrow`, `frz`];
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
			})
		});
	}

	g_detailObj.toolDif[_scoreId] = calcLevel(_scoreObj);
	g_detailObj.speedData[_scoreId] = _scoreObj.speedData.concat();
	g_detailObj.boostData[_scoreId] = _scoreObj.boostData.concat();

	g_detailObj.maxDensity[_scoreId] = densityData.indexOf(Math.max.apply(null, densityData));
	g_detailObj.densityData[_scoreId] = [];
	for (let j = 0; j < C_LEN_DENSITY_DIVISION; j++) {
		g_detailObj.densityData[_scoreId].push(Math.round(densityData[j] / allData * C_LEN_DENSITY_DIVISION * 10000) / 100);
	}

	g_detailObj.arrowCnt[_scoreId] = noteCnt.arrow.concat();
	g_detailObj.frzCnt[_scoreId] = noteCnt.frz.concat();
	g_detailObj.startFrame[_scoreId] = startFrame;
	g_detailObj.playingFrame[_scoreId] = playingFrame;
	g_detailObj.playingFrameWithBlank[_scoreId] = lastFrame - startFrame;
}

/**
 * ツール計算
 * @param {object} _scoreObj 
 */
function calcLevel(_scoreObj) {
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
		tool: (allCnt === 3 ? `0.01` :
			`${Math.floor(difLevel)}.${`00${Math.round((difLevel * 100) % 100)}`.slice(-2)}${(push3Cnt > 0 ? "*" : "")}`),
		// 縦連打補正
		tate: toDecimal2(baseDifLevel - calcDifLevel(leveltmp)),
		// 同時押し補正
		douji: calcDifLevel(twoPushCount),
		// 3つ押し数
		push3cnt: push3Cnt,
		// 3つ押しリスト
		push3: push3List,
	};
}

/**
 * customjsの読込
 * @param {function} _afterFunc 
 */
function loadCustomjs(_afterFunc) {
	const randTime = new Date().getTime();
	loadScript(`${g_headerObj.customjsRoot}${g_headerObj.customjs}?${randTime}`, _ => {
		loadScript(`${g_headerObj.customjs2Root}${g_headerObj.customjs2}?${randTime}`, _ => {
			loadScript(`${g_headerObj.skinRoot}danoni_skin_${g_headerObj.skinType}.js?${randTime}`, _ => {
				loadScript(`${g_headerObj.skinRoot2}danoni_skin_${g_headerObj.skinType2}.js?${randTime}`, _ => {
					_afterFunc();
				}, false);
			}, false);
		}, false);
	}, false);
}

/**
 * danoni_setting.jsの読込
 */
function loadSettingJs() {

	// 共通設定ファイルの指定
	let settingType = ``;
	let settingRoot = C_DIR_JS;
	if (hasVal(g_rootObj.settingType)) {
		settingType = `_${g_rootObj.settingType}`;
		if (g_rootObj.settingType.indexOf(C_MRK_CURRENT_DIRECTORY) !== -1) {
			settingType = `_${g_rootObj.settingType.split(C_MRK_CURRENT_DIRECTORY)[1]}`;
			settingRoot = ``;
		}
	}

	const randTime = new Date().getTime();
	loadScript(`${settingRoot}danoni_setting${settingType}.js?${randTime}`, _ => {
		if (document.querySelector(`#lblLoading`) !== null) {
			divRoot.removeChild(document.querySelector(`#lblLoading`));
		}
		initAfterDosLoaded();
	}, false);
}

function loadMusic() {

	clearWindow();
	document.onkeydown = evt => blockCode(transCode(evt.code));

	const musicUrl = g_headerObj.musicUrls[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.musicUrls[0];
	let url = `../${g_headerObj.musicFolder}/${musicUrl}`;
	if (musicUrl.indexOf(C_MRK_CURRENT_DIRECTORY) !== -1) {
		url = musicUrl.split(C_MRK_CURRENT_DIRECTORY)[1];
	}

	g_headerObj.musicUrl = musicUrl;
	g_musicEncodedFlg = (musicUrl.slice(-3) === `.js` || musicUrl.slice(-4) === `.txt`) ? true : false;
	drawDefaultBackImage(``);

	// Now Loadingを表示
	const lblLoading = getLoadingLabel();
	divRoot.appendChild(lblLoading);

	// ローカル動作時
	if (location.href.match(`^file`)) {
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
			const loader = createSprite(`divRoot`, `loader`, 0, g_sHeight - 10, g_sWidth, 10);
			loader.style.backgroundColor = `#333333`;
			lblLoading.textContent = g_lblNameObj.pleaseWait;
			setAudio(blobUrl);
		} else {
			makeWarningWindow(`${g_msgInfoObj.E_0032}<br>(${request.status} ${request.statusText})`);
		}
	});

	// 進捗時
	request.addEventListener(`progress`, _event => {
		const lblLoading = document.querySelector(`#lblLoading`);

		if (_event.lengthComputable) {
			const rate = _event.loaded / _event.total;
			const loader = createSprite(`divRoot`, `loader`, 0, g_sHeight - 10, g_sWidth, 10);
			loader.style.width = `${g_sWidth * rate}px`;
			loader.style.backgroundColor = `#eeeeee`;
			lblLoading.textContent = `${g_lblNameObj.nowLoading} ${Math.floor(rate * 100)}%`;
		} else {
			lblLoading.textContent = `${g_lblNameObj.nowLoading} ${_event.loaded}Bytes`;
		}
		// ユーザカスタムイベント
		if (typeof customLoadingProgress === C_TYP_FUNCTION) {
			customLoadingProgress(_event);
			if (typeof customLoadingProgress2 === C_TYP_FUNCTION) {
				customLoadingProgress2(_event);
			}
		}
	});

	// エラー処理
	request.addEventListener(`timeout`, _ => {
		makeWarningWindow(`${g_msgInfoObj.E_0033}`);
	});

	request.addEventListener(`error`, _ => {
		makeWarningWindow(`${g_msgInfoObj.E_0034}`);
	});

	request.send();
}

// Data URIやBlob URIからArrayBufferに変換してWebAudioAPIで再生する準備
async function initWebAudioAPI(_url) {
	g_audio = new AudioPlayer();
	musicAfterLoaded();
	const promise = await fetch(_url);
	const arrayBuffer = await promise.arrayBuffer();
	await g_audio.init(arrayBuffer);
}

/**
 * PLAYボタンの作成
 * @param {function} _func 
 */
function makePlayButton(_func) {
	return createCss2Button(`btnPlay`, g_lblNameObj.b_play, _func, {
		x: g_sWidth * 2 / 3,
		animationName: (g_initialFlg ? `` : `smallToNormalY`),
	}, g_cssObj.button_Next);
}

/**
 * 音楽データの設定
 * iOSの場合はAudioタグによる再生
 * @param {string} _url 
 */
function setAudio(_url) {
	const ua = navigator.userAgent;
	const isIOS = ua.indexOf(`iPhone`) >= 0
		|| ua.indexOf(`iPad`) >= 0
		|| ua.indexOf(`iPod`) >= 0;

	const loadMp3 = _ => {
		if (location.href.match(`^file`)) {
			g_audio.src = _url;
			musicAfterLoaded();
		} else {
			initWebAudioAPI(_url);
		}
	};

	if (g_musicEncodedFlg) {
		loadScript(_url, _ => {
			if (typeof musicInit === C_TYP_FUNCTION) {
				musicInit();
				if (isIOS) {
					lblLoading.textContent = `Click to Start!`;
					divRoot.appendChild(
						makePlayButton(evt => {
							divRoot.removeChild(evt.target);
							initWebAudioAPI(`data:audio/mp3;base64,${g_musicdata}`);
						})
					);
				} else {
					initWebAudioAPI(`data:audio/mp3;base64,${g_musicdata}`);
				}
			} else {
				makeWarningWindow(g_msgInfoObj.E_0031);
				musicAfterLoaded();
			}
		});

	} else if (isIOS) {
		lblLoading.textContent = `Click to Start!`;
		divRoot.appendChild(
			makePlayButton(evt => {
				divRoot.removeChild(evt.target);
				loadMp3();
			})
		);

	} else {
		loadMp3();
	}
}

/**
 * デフォルト背景画像の描画処理
 * @param {string} _key メイン画面かどうか。Main:メイン画面、(空白):それ以外
 */
function drawDefaultBackImage(_key) {

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

			if (g_headerObj.skinType !== `default`) {
				createSprite(`divRoot`, `divBack`, 0, 0, g_sWidth, g_sHeight);
			}
		}
	} else {
		createSprite(`divRoot`, `divBack`, 0, 0, g_sWidth, g_sHeight);
	}
}

/**
 * 画像ファイルかどうかをチェック
 * @param {string} _str 
 */
function checkImage(_str) {
	return listMatching(_str, g_imgExtensions, { prefix: `[.]`, suffix: `$` });
}

/**
 * back/masktitle(result)において、ジャンプ先のフレーム数を取得
 * @param {string} _frames 
 */
function getSpriteJumpFrame(_frames) {
	const jumpFrames = _frames.split(`:`);
	const jumpCnt = Math.floor(Math.random() * jumpFrames.length);
	return setVal(Number(jumpFrames[jumpCnt]) - 1, 0, C_TYP_NUMBER);
}

/**
 * 背景・マスクモーションの表示（タイトル・リザルト用）
 * @param {number} _frame 
 * @param {string} _spriteName title / result
 * @param {string} _depthName back / mask
 */
function drawSpriteData(_frame, _spriteName, _depthName) {

	const spriteUpper = toCapitalize(_spriteName);
	const tmpObjs = g_headerObj[`${_depthName}${spriteUpper}Data`][_frame];

	for (let j = 0; j < tmpObjs.length; j++) {
		const tmpObj = tmpObjs[j];
		const baseSprite = document.querySelector(`#${_depthName}${spriteUpper}Sprite${tmpObj.depth}`);
		if (tmpObj.command !== ``) {
			if (tmpObj.command === `[loop]`) {
				// キーワード指定：ループ
				// 指定フレーム(class)へ移動する
				g_scoreObj[`${_depthName}${spriteUpper}LoopCount`]++;
				return getSpriteJumpFrame(tmpObj.jumpFrame);

			} else if (tmpObj.command === `[jump]`) {
				// キーワード指定：フレームジャンプ
				// 指定回数以上のループ(maxLoop)があれば指定フレーム(jumpFrame)へ移動する
				if (g_scoreObj[`${_depthName}${spriteUpper}LoopCount`] >= Number(tmpObj.maxLoop)) {
					g_scoreObj[`${_depthName}${spriteUpper}LoopCount`] = 0;
					return getSpriteJumpFrame(tmpObj.jumpFrame);
				}
			} else {
				baseSprite.innerHTML = tmpObj.htmlText;
			}
		} else {
			if (tmpObj.depth === C_FLG_ALL) {
				for (let j = 0; j <= g_headerObj[`${_depthName}${spriteUpper}MaxDepth`]; j++) {
					document.querySelector(`#${_depthName}${spriteUpper}Sprite${j}`).textContent = ``;
				}
			} else {
				baseSprite.textContent = ``;
			}
		}
	}
	return _frame;
}

/**
 * 背景・マスクモーションの表示
 * @param {number} _frame 
 * @param {string} _depthName 
 */
function drawMainSpriteData(_frame, _depthName) {

	const tmpObjs = g_scoreObj[`${_depthName}Data`][_frame];

	tmpObjs.forEach(tmpObj => {
		const baseSprite = document.querySelector(`#${_depthName}Sprite${tmpObj.depth}`);
		if (tmpObj.command !== ``) {
			baseSprite.innerHTML = tmpObj.htmlText;
		} else {
			if (tmpObj.depth === C_FLG_ALL) {
				for (let j = 0; j <= g_scoreObj[`${_depthName}MaxDepth`]; j++) {
					document.querySelector(`#${_depthName}Sprite${j}`).textContent = ``;
				}
			} else {
				baseSprite.textContent = ``;
			}
		}
	});
}

/**
 * 色名をカラーコードに変換
 * @param {string} _color 
 */
const colorNameToCode = _color => {
	const cxt = document.createElement(`canvas`).getContext(`2d`);
	cxt.fillStyle = _color;
	return cxt.fillStyle;
}

/**
 * 10進 -> 16進数変換 (カラーコード形式になるよう0埋め)
 * @param {number} _num 
 */
const byteToHex = _num => (`${('0' + _num.toString(16)).slice(-2)}`);

/**
 * 色名をカラーコードへ変換 (元々カラーコードの場合は除外)
 * @param {string} _color 色名
 */
const colorToHex = (_color) => {

	// すでにカラーコードのものやパーセント表記、位置表記系を除外
	if (_color.substring(0, 1) === `#` || !isNaN(parseFloat(_color)) ||
		listMatching(_color, g_cssCheckStr.header, { prefix: `^` }) ||
		listMatching(_color, g_cssCheckStr.footer, { suffix: `$` })) {
		return _color;
	}

	// 色_位置;透明度 (Ex: red 20%;255) の形式で取り込み
	// 透明度はカラーコード形式に変換してRGBの後ろに設定
	const tmpColor = _color.split(`;`);
	const colorSet = tmpColor[0].split(` `);
	let alphaVal = ``;
	if (tmpColor.length > 1) {
		alphaVal = byteToHex(setVal(tmpColor[1], 255, C_TYP_NUMBER));
	}
	return `${colorNameToCode(colorSet[0])}${alphaVal}${colorSet[1] !== undefined ? ` ${colorSet.slice(1).join(' ')}` : ''}`;
}

/**
 * グラデーション用のカラーフォーマットを作成
 * @param {string} _colorStr 
 * @param {object} _options
 *   defaultColorgrd
 *   colorCdPaddingUse
 *   objType (normal: 汎用, titleMusic: タイトル曲名, titleArrow: タイトル矢印)
 *   shadowFlg
 */
function makeColorGradation(_colorStr, { _defaultColorgrd = g_headerObj.defaultColorgrd,
	_colorCdPaddingUse = false, _objType = `normal`, _shadowFlg = false } = {}) {

	// |color_data=300,20,45deg:#ffff99:#ffffff:#9999ff@linear-gradient|
	// |color_data=300,20,#ffff99:#ffffff:#9999ff@radial-gradient|
	// |color_data=300,20,#ffff99:#ffffff:#9999ff@conic-gradient|

	if (_colorStr === `Default`) {
		return `Default`;
	}

	// 矢印の塗りつぶしの場合：透明度を50%にする
	// 背景矢印の場合　　　　：透明度を25%にする
	const alphaVal = (_shadowFlg && _objType !== `frz`) ? `80` : (_objType === `titleArrow` ? `40` : ``);

	let convertColorStr;
	const tmpColorStr = _colorStr.split(`@`);
	const colorArray = tmpColorStr[0].split(`:`);
	for (let j = 0; j < colorArray.length; j++) {
		colorArray[j] = colorToHex(colorArray[j].replace(/0x/g, `#`));
		if (_colorCdPaddingUse) {
			colorArray[j] = `#${paddingLeft(colorArray[j].slice(1), 6, `0`)}`;
		}
		if (j === 0 && colorArray[0].substring(0, 1) !== `#`) {
		} else if (colorArray[j].length === 7) {
			colorArray[j] += alphaVal;
		}
	}

	const gradationType = (tmpColorStr.length > 1 ? tmpColorStr[1] : `linear-gradient`);
	const defaultDir = (_objType === `titleArrow` ? `to left` : `to right`);
	if (colorArray.length === 1) {
		if (_objType === `titleMusic`) {
			convertColorStr = `${defaultDir}, ${colorArray[0]} 100%, #eeeeee${alphaVal} 0%`;
		} else if (_defaultColorgrd[0]) {
			convertColorStr = `${defaultDir}, ${colorArray[0]}, ${_defaultColorgrd[1]}${alphaVal}, ${colorArray[0]}`;
		} else {
			convertColorStr = `${defaultDir}, ${colorArray[0]}, ${colorArray[0]}`;
		}
	} else if (gradationType === `linear-gradient` &&
		(colorArray[0].slice(0, 1) === `#` ||
			(!colorArray[0].startsWith(`to `) && !listMatching(colorArray[0], [`deg`, `rad`, `turn`], { suffix: `$` }))
		)
	) {
		// "to XXXX" もしくは "XXXdeg(rad, grad, turn)"のパターン以外は方向を補完する
		convertColorStr = `${defaultDir}, ${colorArray.join(', ')}`;
	} else {
		convertColorStr = `${colorArray.join(', ')}`;
	}

	return `${gradationType}(${convertColorStr})`;
}

/**
 * タイトル・リザルトモーションの描画
 * @param {string} _spriteName 
 */
function drawTitleResultMotion(_spriteName) {
	g_animationData.forEach(sprite => {
		if (g_headerObj[`${sprite}${_spriteName}Data`][g_scoreObj[`${sprite}${_spriteName}FrameNum`]] !== undefined) {
			g_scoreObj[`${sprite}${_spriteName}FrameNum`] = drawSpriteData(g_scoreObj[`${sprite}${_spriteName}FrameNum`], `${_spriteName.toLowerCase()}`, sprite);
		}
	});
}

/**
 *  タイトル画面初期化
 */
function titleInit() {

	clearWindow();
	drawDefaultBackImage(``);

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
		[titlegrd1, titlegrd2].forEach((titlegrd, j) => {
			titlegrds[j] = makeColorGradation(titlegrd, {
				_defaultColorgrd: false, _objType: `titleMusic`,
			});
		});

		let titlefontsize = 64 * (12 / g_headerObj.musicTitleForView[0].length);
		if (titlefontsize >= 64) {
			titlefontsize = 64;
		}

		// 変数 titlesize の定義 (使用例： |titlesize=40$20|)
		const titlefontsizes = (g_headerObj.titlesize !== `` ? g_headerObj.titlesize.split(`$`).join(`,`).split(`,`) : [titlefontsize, titlefontsize]);
		const titlefontsize1 = setVal(titlefontsizes[0], titlefontsize, C_TYP_NUMBER);
		const titlefontsize2 = setVal(titlefontsizes[1], titlefontsize1, C_TYP_NUMBER);

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
				-webkit-text-fill-color: rgba(255,255,255,0.0);
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
				-webkit-text-fill-color: rgba(255,255,255,0.0);
				${txtAnimations[1]}
			" class="${g_headerObj.titleAnimationClass[1]}">
				${setVal(g_headerObj.musicTitleForView[1], ``, C_TYP_STRING)}
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

	// 非推奨ブラウザに対して警告文を表示
	// Firefoxはローカル環境時、Ver65以降矢印が表示されなくなるため非推奨表示
	if (g_userAgent.indexOf(`msie`) !== -1 ||
		g_userAgent.indexOf(`trident`) !== -1 ||
		g_userAgent.indexOf(`edge`) !== -1 ||
		(g_userAgent.indexOf(`firefox`) !== -1 && location.href.match(`^file`))) {

		makeWarningWindow(g_msgInfoObj.W_0001);
	}

	if (location.href.match(/^file/)) {
		makeWarningWindow(g_msgInfoObj.W_0011);
	}

	// ユーザカスタムイベント(初期)
	if (typeof customTitleInit === C_TYP_FUNCTION) {
		customTitleInit();
		if (typeof customTitleInit2 === C_TYP_FUNCTION) {
			customTitleInit2();
		}
	}

	// バージョン情報取得
	let customVersion = ``;
	if (g_localVersion !== ``) {
		customVersion = ` / ${g_localVersion}`;
	}
	if (g_localVersion2 !== ``) {
		customVersion += ` / ${g_localVersion2}`;
	}
	const releaseDate = (g_headerObj.releaseDate !== `` ? ` @${g_headerObj.releaseDate}` : ``);

	// ボタン描画
	multiAppend(divRoot,

		// Click Here
		createCss2Button(`btnStart`, g_lblNameObj.clickHere, _ => {
			clearTimeout(g_timeoutEvtTitleId);
			optionInit();
		}, {
			w: g_sWidth, siz: C_LBL_TITLESIZE,
		}, g_cssObj.button_Start),

		// Reset
		createCss2Button(`btnReset`, g_lblNameObj.dataReset, _ => {
			if (window.confirm(g_msgObj.dataResetConfirm)) {
				g_localStorage = {
					adjustment: 0,
					volume: 100,
					highscores: {},
				};
				localStorage.setItem(g_localStorageUrl, JSON.stringify(g_localStorage));
				location.reload();
			}
		}, {
			x: 0, y: g_sHeight - 20,
			w: g_sWidth / 5, h: 16, siz: 12,
			title: g_msgObj.dataReset,
		}, g_cssObj.button_Reset),

		// リロードボタン
		createCss2Button(`btnReload`, `R`, _ => location.reload(), {
			x: 10, y: 10,
			w: 30, h: 30, siz: 20,
			title: g_msgObj.reload,
		}, g_cssObj.button_Start),

		// ヘルプ
		createCss2Button(`btnHelp`, `?`, _ => openLink(`https://github.com/cwtickle/danoniplus/wiki/AboutGameSystem`), {
			x: 0, y: g_sHeight - 150,
			w: 40, h: 40, siz: 30,
			title: g_msgObj.howto,
		}, g_cssObj.button_Setting),

		// 製作者表示
		createCss2Button(`lnkMaker`, `${g_lblNameObj.maker}: ${g_headerObj.tuningInit}`, _ => {
			openLink(g_headerObj.creatorUrl);
		}, {
			x: 20, y: g_sHeight - 45,
			w: g_sWidth / 2 - 20, h: C_LNK_HEIGHT, siz: C_LBL_LNKSIZE, align: C_ALIGN_LEFT,
			title: g_headerObj.creatorUrl,
		}, g_cssObj.button_Default),

		// アーティスト表示
		createCss2Button(`lnkArtist`, `${g_lblNameObj.artist}: ${g_headerObj.artistName}`, _ => {
			openLink(g_headerObj.artistUrl);
		}, {
			x: g_sWidth / 2, y: g_sHeight - 45,
			w: g_sWidth / 2 - 20, h: C_LNK_HEIGHT, siz: C_LBL_LNKSIZE, align: C_ALIGN_LEFT,
			title: g_headerObj.artistUrl,
		}, g_cssObj.button_Default),

		// バージョン描画
		createCss2Button(
			`lnkVersion`,
			`&copy; 2018-${g_revisedDate.slice(0, 4)} ティックル, CW ${g_version}${g_alphaVersion}${customVersion}${releaseDate}`,
			_ => openLink(`https://github.com/cwtickle/danoniplus`),
			{
				x: g_sWidth / 4, y: g_sHeight - 20,
				w: g_sWidth * 3 / 4 - 30, h: 16, siz: 12, align: C_ALIGN_RIGHT,
				title: g_msgObj.github,
			},
			g_cssObj.button_Tweet
		),

		// セキュリティリンク
		createCss2Button(`lnkComparison`, `&#x1f6e1;`, _ => openLink(`https://github.com/cwtickle/danoniplus/security/policy`), {
			x: g_sWidth - 30, y: g_sHeight - 20,
			w: 20, h: 16, siz: 12,
			title: g_msgObj.security,
		}, g_cssObj.button_Tweet),
	);

	// コメントエリア作成
	if (g_headerObj.commentVal !== ``) {
		if (g_headerObj.commentExternal) {
			if (document.querySelector(`#commentArea`) !== null) {
				commentArea.innerHTML = g_headerObj.commentVal;
			}
		} else {
			let tmpComment = g_headerObj.commentVal;
			multiAppend(divRoot,

				createDivCss2Label(`lblComment`, tmpComment, {
					x: 0, y: 70, w: g_sWidth, h: g_sHeight - 180, siz: C_SIZ_DIFSELECTOR, align: C_ALIGN_LEFT,
					overflow: `auto`, background: `#222222`, color: `#cccccc`, display: C_DIS_NONE,
				}),

				createCss2Button(`btnComment`, g_lblNameObj.comment, _ => {
					const lblCommentDef = lblComment.style.display;
					lblComment.style.display = (lblCommentDef === C_DIS_NONE ? C_DIS_INHERIT : C_DIS_NONE);
				}, {
					x: g_sWidth - 180, y: (g_sHeight / 2) + 150,
					w: 150, h: 50, siz: 20,
					border: `solid 1px #999999`,
				}, g_cssObj.button_Default),

			);
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
	function flowTitleTimeline() {

		// ユーザカスタムイベント(フレーム毎)
		if (typeof customTitleEnterFrame === C_TYP_FUNCTION) {
			customTitleEnterFrame();
			if (typeof customTitleEnterFrame2 === C_TYP_FUNCTION) {
				customTitleEnterFrame2();
			}
		}

		// 背景・マスクモーション
		drawTitleResultMotion(`Title`);

		thisTime = performance.now();
		buffTime = thisTime - titleStartTime - g_scoreObj.titleFrameNum * 1000 / g_fps;

		g_scoreObj.titleFrameNum++;
		g_scoreObj.backTitleFrameNum++;
		g_scoreObj.maskTitleFrameNum++;
		g_timeoutEvtTitleId = setTimeout(_ => flowTitleTimeline(), 1000 / g_fps - buffTime);
	}

	g_timeoutEvtTitleId = setTimeout(_ => flowTitleTimeline(), 1000 / g_fps);

	// キー操作イベント（デフォルト）
	document.onkeydown = evt => {
		const setCode = transCode(evt.code);

		if (evt.repeat) {
			return blockCode(setCode);
		}

		if (setCode === `Enter`) {
			clearTimeout(g_timeoutEvtTitleId);
			optionInit();
		}
		return blockCode(setCode);
	}

	document.onkeyup = evt => { }

	document.oncontextmenu = _ => true;
	divRoot.oncontextmenu = _ => false;

	if (typeof skinTitleInit === C_TYP_FUNCTION) {
		skinTitleInit();
		if (typeof skinTitleInit2 === C_TYP_FUNCTION) {
			skinTitleInit2();
		}
	}
}

/**
 * 警告用ウィンドウ（汎用）を表示
 * @param {string} _text 
 */
function makeWarningWindow(_text) {
	let lblWarning;
	if (document.querySelector(`#lblWarning`) === null) {
		lblWarning = getTitleDivLabel(`lblWarning`, `<p>${_text}</p>`, 0, 70);
	} else {
		lblWarning = document.querySelector(`#lblWarning`);
		const text = lblWarning.innerHTML + `<p>${_text}</p>`;
		divRoot.removeChild(document.querySelector(`#lblWarning`));
		lblWarning = getTitleDivLabel(`lblWarning`, text, 0, 70);
	}
	setWindowStyle(lblWarning, `#ffcccc`, `#660000`);
	divRoot.appendChild(lblWarning);
}

/**
 * お知らせウィンドウ（汎用）を表示
 * @param {string} _text 
 */
function makeInfoWindow(_text, _animationName = ``) {
	let lblWarning;
	if (document.querySelector(`#lblWarning`) === null) {
	} else {
		lblWarning = document.querySelector(`#lblWarning`);
		divRoot.removeChild(document.querySelector(`#lblWarning`));
	}
	lblWarning = getTitleDivLabel(`lblWarning`, `<p>${_text}</p>`, 0, 70);
	setWindowStyle(lblWarning, `#ccccff`, `#000066`, C_ALIGN_CENTER);

	if (_animationName !== ``) {
		lblWarning.style.animationName = _animationName;
		lblWarning.style.animationDuration = `2.5s`;
		lblWarning.style.animationFillMode = `forwards`;
		lblWarning.style.animationTimingFunction = `cubic-bezier(1.000, 0.000, 0.000, 1.000)`;
	}
	divRoot.appendChild(lblWarning);
}

/**
 * 警告ウィンドウのスタイル設定
 * @param {string} _lbl 
 * @param {string} _bkColor 
 * @param {string} _textColor 
 */
function setWindowStyle(_lbl, _bkColor, _textColor, _align = C_ALIGN_LEFT) {

	const len = _lbl.innerHTML.split(`<br>`).length + _lbl.innerHTML.split(`<p>`).length - 1;
	let warnHeight;
	if (len * 21 <= 150) {
		warnHeight = len * 21;
	} else {
		warnHeight = 150;
		_lbl.style.overflow = `auto`;
	}
	_lbl.style.backgroundColor = _bkColor;
	_lbl.style.opacity = 0.9;
	_lbl.style.height = `${warnHeight}px`;
	_lbl.style.lineHeight = `15px`;
	_lbl.style.fontSize = `${C_SIZ_MAIN}px`;
	_lbl.style.color = _textColor;
	_lbl.style.textAlign = _align;
	_lbl.style.fontFamily = getBasicFont();
}

/**
 * 譜面データを分割して値を取得
 * @param {string} _dos 譜面データ
 */
function dosConvert(_dos) {

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
}

/**
 * 曲名（1行）の取得
 * @param {string} _musicName 
 */
function getMusicNameSimple(_musicName) {
	let tmpName = _musicName.split(`<br>`).join(` `);
	tmpName = tmpName.split(`<nbr>`).join(``);
	return tmpName.split(`<dbr>`).join(`　`);
}

/**
 * 曲名（複数行）の取得
 * @param {string} _musicName 
 */
function getMusicNameMultiLine(_musicName) {
	const tmpName = _musicName.split(`<nbr>`).join(`<br>`).split(`<dbr>`).join(`<br>`).split(`<br>`);
	return tmpName.length === 1 ? [tmpName[0], ``] : tmpName;
}

/**
 * 譜面ヘッダーの分解
 * @param {object} _dosObj 譜面データオブジェクト
 */
function headerConvert(_dosObj) {

	// ヘッダー群の格納先
	const obj = {};

	// フォントの設定
	obj.customFont = setVal(_dosObj.customFont, ``, C_TYP_STRING);
	g_headerObj.customFont = obj.customFont;

	// 画像拡張子の設定 (サーバ上のみ)
	if (typeof g_presetOverrideExtension === C_TYP_STRING && !location.href.match(`^file`)) {
		let key;
		for (key in g_imgObj) {
			g_imgObj[key] = `${g_imgObj[key].slice(0, -3)}${g_presetOverrideExtension}`;
		}
	}

	// ラベルテキスト、オンマウステキスト、確認メッセージ定義の上書き設定
	if (typeof g_local_lblNameObj === C_TYP_OBJECT) {
		Object.keys(g_local_lblNameObj).forEach(property => g_lblNameObj[property] = g_local_lblNameObj[property]);
	}
	if (typeof g_local_msgObj === C_TYP_OBJECT) {
		Object.keys(g_local_msgObj).forEach(property => g_msgObj[property] = g_local_msgObj[property]);
	}

	// 曲名
	obj.musicTitles = [];
	obj.musicTitlesForView = [];
	obj.artistNames = [];
	obj.musicNos = [];

	if (hasVal(_dosObj.musicTitle)) {
		const musicData = _dosObj.musicTitle.split(`$`);

		if (hasVal(_dosObj.musicNo)) {
			obj.musicNos = _dosObj.musicNo.split(`$`);
		}

		for (let j = 0; j < musicData.length; j++) {
			const musics = musicData[j].split(`,`);

			if (obj.musicNos.length >= j) {
				obj.musicTitles[j] = escapeHtml(getMusicNameSimple(musics[0]));
				obj.musicTitlesForView[j] = escapeHtmlForArray(getMusicNameMultiLine(musics[0]));
				obj.artistNames[j] = escapeHtml(setVal(musics[1], ``, C_TYP_STRING));
			}
		}
		const musics = musicData[0].split(`,`);
		obj.musicTitle = obj.musicTitles[0];
		obj.musicTitleForView = obj.musicTitlesForView[0];
		obj.artistName = obj.artistNames[0] || ``;
		if (obj.artistName === ``) {
			makeWarningWindow(g_msgInfoObj.E_0011);
			obj.artistName = `artistName`;
		}
		obj.artistUrl = musics[2] || ``;
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
	g_speeds = [...Array((obj.maxSpeed - obj.minSpeed) * 4 + 1).keys()].map(i => obj.minSpeed + i / 4);


	// プレイ中のショートカットキー
	obj.keyRetry = setVal(_dosObj.keyRetry, C_KEY_RETRY, C_TYP_NUMBER);
	obj.keyRetryDef = obj.keyRetry;
	obj.keyTitleBack = setVal(_dosObj.keyTitleBack, C_KEY_TITLEBACK, C_TYP_NUMBER);
	obj.keyTitleBackDef = obj.keyTitleBack;

	// フリーズアローの許容フレーム数設定
	obj.frzAttempt = setVal(_dosObj.frzAttempt, C_FRM_FRZATTEMPT, C_TYP_NUMBER);

	// 製作者表示
	if (hasVal(_dosObj.tuning)) {
		const tunings = _dosObj.tuning.split(`,`);
		obj.tuning = escapeHtmlForEnabledTag(tunings[0]);
		obj.creatorUrl = (tunings.length > 1 ? tunings[1] : (typeof g_presetTuningUrl === C_TYP_STRING ? g_presetTuningUrl : ``));
	} else {
		obj.tuning = (typeof g_presetTuning === C_TYP_STRING ? escapeHtmlForEnabledTag(g_presetTuning) : `name`);
		obj.creatorUrl = (typeof g_presetTuningUrl === C_TYP_STRING ? g_presetTuningUrl : ``);
	}
	obj.tuningInit = obj.tuning;

	// 譜面情報
	if (hasVal(_dosObj.difData)) {
		const difs = _dosObj.difData.split(`$`);
		const difpos = {
			key: 0, name: 1, speed: 2, border: 3, recovery: 4, damage: 5, init: 6,
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

		const lifeData = (_name, _preData, _default) => {
			const data = (_preData) ? _preData :
				(typeof g_presetGauge === C_TYP_OBJECT && (_name in g_presetGauge) ?
					g_presetGauge[_name] : _default);
			return setVal(data, _default, C_TYP_FLOAT);
		};

		for (let j = 0; j < difs.length; j++) {
			const difDetails = difs[j].split(`,`);

			// ライフ：ノルマ、回復量、ダメージ量、初期値の設定
			const border = (difDetails[difpos.border]) ? difDetails[difpos.border] :
				(typeof g_presetGauge === C_TYP_OBJECT && (`Border` in g_presetGauge) ?
					g_presetGauge.Border : `x`);

			obj.lifeBorders.push(border === `x` ? `x` : setVal(border, 70, C_TYP_FLOAT));
			obj.lifeRecoverys.push(lifeData(`Recovery`, difDetails[difpos.recovery], 6));
			obj.lifeDamages.push(lifeData(`Damage`, difDetails[difpos.damage], 40));
			obj.lifeInits.push(lifeData(`Init`, difDetails[difpos.init], 25));

			// キー数
			const keyLabel = setVal(difDetails[difpos.key], `7`, C_TYP_STRING);
			obj.keyLabels.push(g_keyObj.keyTransPattern[keyLabel] || keyLabel);

			// 譜面名、制作者名
			if (hasVal(difDetails[difpos.name])) {
				const difNameInfo = difDetails[difpos.name].split(`::`);
				obj.difLabels.push(escapeHtml(setVal(difNameInfo[0], `Normal`, C_TYP_STRING)));
				obj.creatorNames.push(difNameInfo.length > 1 ? escapeHtml(difNameInfo[1]) : obj.tuning);
			} else {
				obj.difLabels.push(`Normal`);
				obj.creatorNames.push(obj.tuning);
			}

			// 初期速度
			obj.initSpeeds.push(setVal(difDetails[difpos.speed], 3.5, C_TYP_FLOAT));
		}
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
	const keyLists = obj.keyLabels.filter((x, j, self) => {
		return self.indexOf(x) === j;
	});
	obj.keyLists = keyLists.sort((a, b) => parseInt(a) - parseInt(b));

	// 譜面変更セレクターの利用有無
	obj.difSelectorUse = (setVal(_dosObj.difSelectorUse, (obj.keyLabels.length > 5 ? true : false), C_TYP_BOOLEAN));

	// 初期速度の設定
	g_stateObj.speed = obj.initSpeeds[g_stateObj.scoreId];
	g_speedNum = roundZero(g_speeds.findIndex(speed => speed === g_stateObj.speed));

	// 矢印の色変化を常時グラデーションさせる設定
	obj.defaultColorgrd = [false, `#eeeeee`];
	if (hasVal(_dosObj.defaultColorgrd)) {
		obj.defaultColorgrd = _dosObj.defaultColorgrd.split(`,`);
		obj.defaultColorgrd[0] = setVal(obj.defaultColorgrd[0], false, C_TYP_BOOLEAN);
		obj.defaultColorgrd[1] = setVal(obj.defaultColorgrd[1], `#eeeeee`, C_TYP_STRING);
	}

	// カラーコードのゼロパディング有無設定
	obj.colorCdPaddingUse = setVal(_dosObj.colorCdPaddingUse, false, C_TYP_BOOLEAN);

	// 最大ライフ
	obj.maxLifeVal = setVal(_dosObj.maxLifeVal, C_VAL_MAXLIFE, C_TYP_FLOAT);
	if (obj.maxLifeVal <= 0) {
		obj.maxLifeVal = C_VAL_MAXLIFE;
		makeWarningWindow(g_msgInfoObj.E_0042.split(`{0}`).join(`maxLifeVal`));
	}

	// ゲージ設定詳細（初期値）
	g_gaugeOptionObj = {
		survival: [`Original`, `Heavy`, `NoRecovery`, `SuddenDeath`, `Practice`, `Light`],
		border: [`Normal`, `Hard`, `SuddenDeath`, `Easy`],
		custom: [],

		initSurvival: [25, 50, 100, 100, 50, 25],
		rcvSurvival: [6, 2, 0, 0, 0, 12],
		dmgSurvival: [40, 50, 50, obj.maxLifeVal, 0, 40],
		typeSurvival: [C_LFE_SURVIVAL, C_LFE_SURVIVAL, C_LFE_SURVIVAL, C_LFE_SURVIVAL, C_LFE_SURVIVAL, C_LFE_SURVIVAL],
		varSurvival: [C_FLG_OFF, C_FLG_OFF, C_FLG_OFF, C_FLG_OFF, C_FLG_OFF, C_FLG_OFF],
		clearSurvival: [0, 0, 0, 0, 0, 0],

		initBorder: [25, 100, 100, 25],
		rcvBorder: [2, 1, 0, 4],
		dmgBorder: [7, 50, obj.maxLifeVal, 7],
		typeBorder: [C_LFE_BORDER, C_LFE_BORDER, C_LFE_SURVIVAL, C_LFE_BORDER],
		varBorder: [C_FLG_ON, C_FLG_ON, C_FLG_OFF, C_FLG_ON],
		clearBorder: [70, 0, 0, 70],

		varCustom: [],
	};

	// カスタムゲージ設定
	// |customGauge=Original::F,Normal::V,Escape::V|
	if (hasVal(_dosObj.customGauge)) {
		const customGauges = _dosObj.customGauge.split(`,`);
		for (let j = 0; j < customGauges.length; j++) {
			const customGaugeSets = customGauges[j].split(`::`);
			g_gaugeOptionObj.custom[j] = customGaugeSets[0];
			g_gaugeOptionObj.varCustom[j] = (customGaugeSets[1] !== `V` ? C_FLG_OFF : C_FLG_ON);
		}
	} else if (typeof g_presetGaugeList === C_TYP_OBJECT) {
		Object.keys(g_presetGaugeList).forEach(key => {
			g_gaugeOptionObj.custom.push(key);
			g_gaugeOptionObj.varCustom.push((g_presetGaugeList[key] !== `V` ? C_FLG_OFF : C_FLG_ON));
		});
	}

	// ライフ設定のカスタム部分取得（譜面ヘッダー加味）
	[`survival`, `border`, `custom`].forEach(gaugeType => {
		g_gaugeOptionObj[gaugeType].forEach(gaugePtn => getGaugeSetting(_dosObj, gaugePtn, obj));
	});

	// フリーズアローのデフォルト色セットの利用有無 (true: 使用, false: 矢印色を優先してセット)
	if (hasVal(_dosObj.defaultFrzColorUse)) {
		obj.defaultFrzColorUse = setVal(_dosObj.defaultFrzColorUse, true, C_TYP_BOOLEAN);
	} else if (typeof g_presetFrzColors === C_TYP_BOOLEAN) {
		obj.defaultFrzColorUse = (g_presetFrzColors ? true : false);
	} else {
		obj.defaultFrzColorUse = true;
	}

	// 初期色情報
	Object.keys(g_dfColorObj).forEach(key => obj[key] = g_dfColorObj[key].concat());
	obj.frzColorDefault = [];

	// ダミー用初期矢印色
	obj.setDummyColor = [`#777777`, `#444444`, `#777777`, `#444444`, `#777777`];
	const dfColorgrdSet = {
		'': obj.defaultColorgrd,
		'Type0': [!obj.defaultColorgrd[0], obj.defaultColorgrd[1]],
	};

	[``, `Shadow`].forEach((pattern, k) => {
		const _name = `set${pattern}Color`;
		const _frzName = `frz${pattern}Color`;

		// 矢印色
		Object.keys(dfColorgrdSet).forEach(type => {
			[obj[`${_name}${type}`], obj[`${_name}Str${type}`], obj[`${_name}Org${type}`]] =
				setColorList(_dosObj[`${_name}`], obj[`${_name}Init`], obj[`${_name}Init`].length, {
					_defaultColorgrd: dfColorgrdSet[type],
					_colorCdPaddingUse: obj.colorCdPaddingUse,
					_shadowFlg: Boolean(k),
				});

			obj[`${_frzName}${type}`] = [];
			obj[`${_frzName}Str${type}`] = [];
			obj[`${_frzName}Org${type}`] = [];
		});

		// フリーズアロー色
		const tmpFrzColors = (_dosObj[_frzName] !== undefined ? _dosObj[_frzName].split(`$`) : []);
		const firstFrzColors = (tmpFrzColors[0] !== undefined ? tmpFrzColors[0].split(`,`) : []);

		for (let j = 0; j < obj.setColorInit.length; j++) {

			// デフォルト配列の作成（1番目の要素をベースに、フリーズアロー初期セット or 矢印色からデータを補完）
			let currentFrzColors = [];
			const baseLength = firstFrzColors.length === 0 || obj.defaultFrzColorUse ?
				obj[`${_frzName}Init`].length : firstFrzColors.length;
			for (let k = 0; k < baseLength; k++) {
				currentFrzColors[k] = setVal(firstFrzColors[k],
					obj.defaultFrzColorUse ? obj[`${_frzName}Init`][k] : obj[`${_name}Str`][j], C_TYP_STRING);
			}

			Object.keys(dfColorgrdSet).forEach(type => {
				[obj[`${_frzName}${type}`][j], obj[`${_frzName}Str${type}`][j], obj[`${_frzName}Org${type}`][j]] =
					setColorList(tmpFrzColors[j], currentFrzColors, obj[`${_frzName}Init`].length, {
						_defaultColorgrd: dfColorgrdSet[type],
						_colorCdPaddingUse: obj.colorCdPaddingUse,
						_defaultFrzColorUse: obj.defaultFrzColorUse,
						_objType: `frz`,
						_shadowFlg: Boolean(k),
					});
			});
		}
		if (k === 0) {
			obj[`${_name}Default`] = obj[`${_name}`].concat();
			obj[`${_frzName}Default`] = obj[`${_frzName}`].concat();
		}
	});

	/**
	 * 矢印・フリーズアロー色のデータ展開
	 * @param {array} _data 
	 * @param {array} _colorInit 
	 * @param {object} _options 
	 */
	function setColorList(_data, _colorInit, _colorInitLength,
		{ _defaultColorgrd = g_headerObj.defaultColorgrd, _colorCdPaddingUse = false,
			_defaultFrzColorUse = true, _objType = `normal`, _shadowFlg = false } = {}) {

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
					if (colorStr[j] === undefined || colorStr[j] === ``) {
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
				const tmpSetColorOrg = colorStr[j].replace(/0x/g, `#`).split(`:`);
				tmpSetColorOrg.some(tmpColorOrg => {
					if (tmpColorOrg.indexOf(`#`) !== -1 ||
						(!tmpColorOrg.startsWith(`to `) && !tmpColorOrg.endsWith(`deg`)) || tmpColorOrg === `Default`) {
						colorOrg[j] = tmpColorOrg;
						return true;
					}
				});
				if (_colorCdPaddingUse) {
					colorOrg[j] = `#${paddingLeft(colorOrg[j].slice(1), 6, `0`)}`;
				}
				colorList[j] = makeColorGradation(colorStr[j] === `` ? _colorInit[j] : colorStr[j], {
					_defaultColorgrd: _defaultColorgrd,
					_colorCdPaddingUse: _colorCdPaddingUse,
					_objType: _objType,
					_shadowFlg: _shadowFlg,
				});
			}

		} else {

			// 未定義の場合は指定されたデフォルト配列(_colorInit)で再定義
			colorStr = _colorInit.concat();
			colorOrg = _colorInit.concat();
			for (let j = 0; j < _colorInit.length; j++) {
				colorList[j] = _colorInit[j] === `` ? `` : makeColorGradation(_colorInit[j], {
					_defaultColorgrd: _defaultColorgrd,
					_colorCdPaddingUse: _colorCdPaddingUse,
					_shadowFlg: _shadowFlg,
				});
			}
		}

		return [colorList, colorStr, colorOrg];
	}

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
	if (hasVal(_dosObj.adjustment)) {
		obj.adjustment = _dosObj.adjustment.split(`$`);
	} else {
		obj.adjustment = [0];
	}

	// 再生速度
	obj.playbackRate = setVal(_dosObj.playbackRate, 1, C_TYP_FLOAT);
	if (obj.playbackRate <= 0) {
		obj.playbackRate = 1;
		makeWarningWindow(g_msgInfoObj.E_0042.split(`{0}`).join(`playbackRate`));
	}

	// ファイルパスの取得
	const getFilePath = (_fileName, _directory = ``) => {
		const obj = {};
		if (_fileName.indexOf(C_MRK_CURRENT_DIRECTORY) !== -1) {
			obj.fileName = _fileName.split(C_MRK_CURRENT_DIRECTORY)[1];
			obj.fileRoot = ``;
		} else {
			obj.fileName = _fileName;
			obj.fileRoot = _directory;
		}
		return [obj.fileName, obj.fileRoot];
	};

	// 外部スキンファイルの指定
	obj.skinType = `default`;
	obj.skinRoot = C_DIR_SKIN;
	obj.skinType2 = `blank`;
	obj.skinRoot2 = C_DIR_SKIN;
	if (hasVal(_dosObj.skinType)) {
		const skinTypes = _dosObj.skinType.split(`,`);
		[obj.skinType2, obj.skinRoot2] = getFilePath(skinTypes.length > 1 ? skinTypes[1] : `blank`, C_DIR_SKIN);
		[obj.skinType, obj.skinRoot] = getFilePath(skinTypes[0], C_DIR_SKIN);
	}

	// 外部jsファイルの指定
	obj.customjs = C_JSF_CUSTOM;
	obj.customjsRoot = C_DIR_JS;
	obj.customjs2 = C_JSF_BLANK;
	obj.customjs2Root = C_DIR_JS;
	if (hasVal(_dosObj.customjs)) {
		const customjss = _dosObj.customjs.split(`,`);
		[obj.customjs2, obj.customjs2Root] = getFilePath(customjss.length > 1 ? customjss[1] : C_JSF_BLANK, C_DIR_JS);
		[obj.customjs, obj.customjsRoot] = getFilePath(customjss[0], C_DIR_JS);
	}

	// ステップゾーン位置
	g_posObj.stepY = (isNaN(parseFloat(_dosObj.stepY)) ? C_STEP_Y : parseFloat(_dosObj.stepY));
	g_posObj.stepYR = (isNaN(parseFloat(_dosObj.stepYR)) ? C_STEP_YR : parseFloat(_dosObj.stepYR));
	g_posObj.stepDiffY = g_posObj.stepY - C_STEP_Y;
	g_posObj.distY = g_sHeight - C_STEP_Y + g_posObj.stepYR;
	g_posObj.reverseStepY = g_posObj.distY - g_posObj.stepY - g_posObj.stepDiffY - C_ARW_WIDTH;
	g_posObj.arrowHeight = g_sHeight + g_posObj.stepYR - g_posObj.stepDiffY * 2;
	obj.bottomWordSetFlg = setVal(_dosObj.bottomWordSet, false, C_TYP_BOOLEAN);

	// ステップゾーン位置 (旧変数)
	g_stepY = g_posObj.stepY;
	g_stepYR = g_posObj.stepYR;
	g_distY = g_posObj.distY;
	g_reverseStepY = g_posObj.reverseStepY;

	// 矢印・フリーズアロー判定位置補正
	g_diffObj.arrowJdgY = (isNaN(parseFloat(_dosObj.arrowJdgY)) ? 0 : parseFloat(_dosObj.arrowJdgY));
	g_diffObj.frzJdgY = (isNaN(parseFloat(_dosObj.frzJdgY)) ? 0 : parseFloat(_dosObj.frzJdgY));

	// musicフォルダ設定
	obj.musicFolder = setVal(_dosObj.musicFolder, `music`, C_TYP_STRING);

	// 楽曲URL
	if (hasVal(_dosObj.musicUrl)) {
		obj.musicUrls = _dosObj.musicUrl.split(`$`);
	} else {
		makeWarningWindow(g_msgInfoObj.E_0031);
	}

	// ハッシュタグ
	if (hasVal(_dosObj.hashTag)) {
		obj.hashTag = _dosObj.hashTag;
	}

	// 自動プリロードの設定
	obj.autoPreload = setVal(_dosObj.autoPreload, false, C_TYP_BOOLEAN);
	g_headerObj.autoPreload = obj.autoPreload;

	// 読込対象の画像を指定(rel:preload)と同じ
	obj.preloadImages = [];
	if (hasVal(_dosObj.preloadImages)) {
		obj.preloadImages = _dosObj.preloadImages.split(`,`).filter(image => hasVal(image)).map(preloadImage => preloadImage);
	}

	// 最終演出表示有無（noneで無効化）
	obj.finishView = setVal(_dosObj.finishView, ``, C_TYP_STRING);

	// 更新日
	obj.releaseDate = setVal(_dosObj.releaseDate, ``, C_TYP_STRING);

	// デフォルト曲名表示、背景、Ready表示の利用有無
	g_titleLists.init.forEach(objName => {
		const objUpper = toCapitalize(objName);
		obj[`custom${objUpper}Use`] = setVal(_dosObj[`custom${objUpper}Use`],
			(typeof g_presetCustomDesignUse === C_TYP_OBJECT && (objName in g_presetCustomDesignUse) ?
				setVal(g_presetCustomDesignUse[objName], false, C_TYP_BOOLEAN) : false), C_TYP_BOOLEAN);
	});

	// デフォルトReady/リザルト表示の遅延時間設定
	[`ready`, `result`].forEach(objName => {
		obj[`${objName}DelayFrame`] = setVal(_dosObj[`${objName}DelayFrame`], 0, C_TYP_NUMBER);
	});

	// デフォルトReady表示のアニメーション時間設定
	obj.readyAnimationFrame = setVal(_dosObj.readyAnimationFrame, 150, C_TYP_NUMBER);

	// デフォルトReady表示のアニメーション名
	obj.readyAnimationName = setVal(_dosObj.readyAnimationName, `leftToRightFade`, C_TYP_STRING);

	// デフォルトReady表示の先頭文字色
	obj.readyColor = setVal(_dosObj.readyColor, ``, C_TYP_STRING);

	// デフォルトReady表示を上書きするテキスト
	obj.readyHtml = setVal(_dosObj.readyHtml, ``, C_TYP_STRING);

	// デフォルト曲名表示のフォントサイズ
	obj.titlesize = setVal(_dosObj.titlesize, ``, C_TYP_STRING);

	// デフォルト曲名表示のフォント名
	// (使用例： |titlefont=Century,Meiryo UI|)
	obj.titlefonts = g_titleLists.defaultFonts.concat();
	if (hasVal(_dosObj.titlefont)) {
		_dosObj.titlefont.split(`$`).forEach((font, j) => {
			obj.titlefonts[j] = `'${(font.replace(/,/g, `', '`))}'`;
		});
		if (obj.titlefonts[1] === undefined) {
			obj.titlefonts[1] = obj.titlefonts[0];
		}
	}

	// デフォルト曲名表示, 背景矢印のグラデーション指定css
	g_titleLists.grdList.forEach(_name => {
		obj[`${_name}s`] = [];
		if (hasVal(_dosObj[_name])) {
			const tmpTitlegrd = _dosObj[_name].replace(/,/g, `:`);
			obj[`${_name}s`] = tmpTitlegrd.split(`$`);
			obj[`${_name}`] = setVal(obj[`${_name}s`][0], ``, C_TYP_STRING);
		}
	});

	// デフォルト曲名表示の表示位置調整
	obj.titlepos = [[0, 0], [0, 0]];
	if (hasVal(_dosObj.titlepos)) {
		_dosObj.titlepos.split(`$`).forEach((pos, j) => {
			obj.titlepos[j] = pos.split(`,`).map(x => parseFloat(x));
		});
	}

	// タイトル文字のアニメーション設定
	obj.titleAnimationName = [`leftToRight`];
	obj.titleAnimationDuration = [1.5];
	obj.titleAnimationDelay = [0];
	obj.titleAnimationTimingFunction = [`ease`];
	obj.titleAnimationClass = [``];
	if (hasVal(_dosObj.titleanimation)) {
		_dosObj.titleanimation.split(`$`).forEach((pos, j) => {
			const titleAnimation = pos.split(`,`);
			obj.titleAnimationName[j] = setVal(titleAnimation[0], obj.titleAnimationName[0], C_TYP_STRING);
			obj.titleAnimationDuration[j] = setVal(titleAnimation[1] / g_fps, obj.titleAnimationDuration[0], C_TYP_FLOAT);
			obj.titleAnimationDelay[j] = setVal(titleAnimation[2] / g_fps, obj.titleAnimationDelay[0], C_TYP_FLOAT);
			obj.titleAnimationTimingFunction[j] = setVal(titleAnimation[3], obj.titleAnimationName[3], C_TYP_STRING);
		});
	}
	if (hasVal(_dosObj.titleanimationclass)) {
		_dosObj.titleanimationclass.split(`$`).forEach((animationClass, j) => {
			obj.titleAnimationClass[j] = setVal(animationClass, ``, C_TYP_STRING);
		});
	}
	if (obj.titleAnimationName.length === 1) {
		g_titleLists.animation.forEach(pattern => {
			obj[`titleAnimation${pattern}`][1] = obj[`titleAnimation${pattern}`][0];
		});
	}
	if (obj.titleAnimationClass.length === 1) {
		obj.titleAnimationClass[1] = obj.titleAnimationClass[0];
	}

	// デフォルト曲名表示の複数行時の縦間隔
	obj.titlelineheight = setVal(_dosObj.titlelineheight, ``, C_TYP_NUMBER);

	// フリーズアローの始点で通常矢印の判定を行うか(dotさんソース方式)
	obj.frzStartjdgUse = setVal(_dosObj.frzStartjdgUse,
		(typeof g_presetFrzStartjdgUse === C_TYP_STRING ? setVal(g_presetFrzStartjdgUse, false, C_TYP_BOOLEAN) : false), C_TYP_BOOLEAN);

	// 譜面名に制作者名を付加するかどうかのフラグ
	obj.makerView = setVal(_dosObj.makerView, false, C_TYP_BOOLEAN);

	// オプション利用可否設定
	g_canDisabledSettings.forEach(option => {
		obj[`${option}Use`] = setVal(_dosObj[`${option}Use`],
			(typeof g_presetSettingUse === C_TYP_OBJECT ?
				setVal(g_presetSettingUse[option], true, C_TYP_BOOLEAN) : true), C_TYP_BOOLEAN);
	});

	let interlockingErrorFlg = false;
	g_displays.forEach((option, j) => {

		// Display使用可否設定を分解 |displayUse=false,ON|
		const displayTempUse = setVal(_dosObj[`${option}Use`],
			(typeof g_presetSettingUse === C_TYP_OBJECT ?
				g_presetSettingUse[option] : `true`), C_TYP_STRING);
		const displayUse = (displayTempUse !== undefined ? displayTempUse.split(`,`) : [true, C_FLG_ON]);

		// displayUse -> ボタンの有効/無効, displaySet -> ボタンの初期値(ON/OFF)
		obj[`${option}Use`] = setVal(displayUse[0], true, C_TYP_BOOLEAN);
		obj[`${option}Set`] = setVal(displayUse.length > 1 ? displayUse[1] :
			(obj[`${option}Use`] ? C_FLG_ON : C_FLG_OFF), ``, C_TYP_SWITCH);
		g_stateObj[`d_${option.toLowerCase()}`] = (obj[`${option}Set`] !== `` ? obj[`${option}Set`] : C_FLG_ON);
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
	obj.transKeyUse = setVal(_dosObj.transKeyUse, true, C_TYP_BOOLEAN);

	// タイトル画面用・背景/マスクデータの分解 (下記すべてで1セット、改行区切り)
	// [フレーム数,階層,背景パス,class(CSSで別定義),X,Y,width,height,opacity,animationName,animationDuration]
	g_animationData.forEach(sprite => {
		obj[`${sprite}TitleData`] = [];
		obj[`${sprite}TitleData`].length = 0;
		obj[`${sprite}TitleMaxDepth`] = -1;
		if (hasVal(_dosObj[`${sprite}title_data`])) {
			[obj[`${sprite}TitleData`], obj[`${sprite}TitleMaxDepth`]] = makeSpriteData(_dosObj[`${sprite}title_data`]);
		}
	});

	// 結果画面用のマスク透過設定
	obj.masktitleButton = setVal(_dosObj.masktitleButton, false, C_TYP_BOOLEAN);

	// 結果画面用のマスク透過設定
	obj.maskresultButton = setVal(_dosObj.maskresultButton, false, C_TYP_BOOLEAN);

	// color_dataの過去バージョン互換設定
	obj.colorDataType = setVal(_dosObj.colorDataType, ``, C_TYP_STRING);

	// リザルトモーションをDisplay:BackgroundのON/OFFと連動させるかどうかの設定
	obj.resultMotionSet = setVal(_dosObj.resultMotionSet, true, C_TYP_BOOLEAN);

	// 譜面明細の使用可否
	obj.scoreDetailUse = setVal(_dosObj.scoreDetailUse, true, C_TYP_BOOLEAN);

	// 判定位置をBackgroundのON/OFFと連動してリセットする設定
	obj.jdgPosReset = setVal(_dosObj.jdgPosReset, true, C_TYP_BOOLEAN);

	// タイトル表示用コメント
	const newlineTag = setVal(_dosObj.commentAutoBr, true, C_TYP_BOOLEAN) ? `<br>` : ``;
	let tmpComment = setVal(_dosObj.commentVal, ``, C_TYP_STRING);
	tmpComment = tmpComment.split(`\r\n`).join(`\n`);
	obj.commentVal = escapeHtmlForEnabledTag(tmpComment.split(`\n`).join(newlineTag));

	// クレジット表示
	if (document.querySelector(`#webMusicTitle`) !== null) {
		webMusicTitle.innerHTML =
			`<span style="font-size:32px">${obj.musicTitleForView.join(`<br>`)}</span><br>
			<span style="font-size:16px">(Artist: <a href="${obj.artistUrl}" target="_blank">${obj.artistName}</a>)</span>`;
	}

	// コメントの外部化設定
	obj.commentExternal = setVal(_dosObj.commentExternal, false, C_TYP_BOOLEAN);

	// Reverse時の歌詞の自動反転制御
	obj.wordAutoReverse = setVal(_dosObj.wordAutoReverse,
		(typeof g_presetWordAutoReverse === C_TYP_STRING ? setVal(g_presetWordAutoReverse, `auto`, C_TYP_STRING) : `auto`), C_TYP_STRING);

	// プレイサイズ(X方向)
	obj.playingWidth = setVal(_dosObj.playingWidth, g_sWidth, C_TYP_NUMBER);

	// プレイ左上位置(X座標)
	obj.playingX = setVal(_dosObj.playingX, 0, C_TYP_NUMBER);

	// ジャストフレームの設定 (ローカル: 0フレーム, リモートサーバ上: 1フレーム以内)
	obj.justFrames = (location.href.match(`^file`) || location.href.indexOf(`localhost`) !== -1) ? 0 : 1;

	// リザルトデータのカスタマイズ
	const resultFormatDefault = `【#danoni[hashTag]】[musicTitle]([keyLabel]) /[maker] /Rank:[rank]/Score:[score]/Playstyle:[playStyle]/[arrowJdg]/[frzJdg]/[maxCombo] [url]`;
	obj.resultFormat = escapeHtmlForEnabledTag(setVal(_dosObj.resultFormat, (typeof g_presetResultFormat === C_TYP_STRING ?
		setVal(g_presetResultFormat, resultFormatDefault, C_TYP_STRING) : resultFormatDefault), C_TYP_STRING));

	return obj;
}

/**
 * 疑似タイマー表記をフレーム数へ変換
 * |endFrame=1:35.20|
 * @param {string} _str 
 */
function transTimerToFrame(_str) {
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
}

/**
 * ゲージ別個別設定の取得
 * @param {object} _dosObj 
 * @param {string} _name 
 * @param {number} _headerObj
 */
function getGaugeSetting(_dosObj, _name, _headerObj) {

	const difLength = _headerObj.keyLabels.length;

	const obj = {
		lifeBorders: [],
		lifeRecoverys: [],
		lifeDamages: [],
		lifeInits: []
	};

	const setGaugeDetails = gaugeData => {
		const gaugeDetails = gaugeData.split(`,`);
		if (gaugeDetails[0] === `x`) {
			obj.lifeBorders.push(`x`);
		} else {
			obj.lifeBorders.push(setVal(gaugeDetails[0], ``, C_TYP_FLOAT));
		}
		obj.lifeRecoverys.push(setVal(gaugeDetails[1], ``, C_TYP_FLOAT));
		obj.lifeDamages.push(setVal(gaugeDetails[2], ``, C_TYP_FLOAT));
		obj.lifeInits.push(setVal(gaugeDetails[3], ``, C_TYP_FLOAT));
	};

	if (hasVal(_dosObj[`gauge${_name}`])) {
		const gauges = _dosObj[`gauge${_name}`].split(`$`);

		for (let j = 0; j < gauges.length; j++) {
			setGaugeDetails(gauges[j]);
		}
		if (gauges.length < difLength) {
			for (let j = gauges.length; j < difLength; j++) {
				setGaugeDetails(gauges[0]);
			}
		}
		g_gaugeOptionObj[`gauge${_name}s`] = Object.assign({}, obj);

	} else if (typeof g_presetGaugeCustom === C_TYP_OBJECT && g_presetGaugeCustom[_name]) {
		for (let j = 0; j < difLength; j++) {
			if (g_presetGaugeCustom[_name].Border === `x`) {
				obj.lifeBorders.push(`x`);
			} else {
				obj.lifeBorders.push(setVal(g_presetGaugeCustom[_name].Border, ``, C_TYP_FLOAT));
			}
			obj.lifeRecoverys.push(setVal(g_presetGaugeCustom[_name].Recovery, ``, C_TYP_FLOAT));
			obj.lifeDamages.push(setVal(g_presetGaugeCustom[_name].Damage, ``, C_TYP_FLOAT));
			obj.lifeInits.push(setVal(g_presetGaugeCustom[_name].Init, ``, C_TYP_FLOAT));
		}
		g_gaugeOptionObj[`gauge${_name}s`] = Object.assign({}, obj);
	}
}

/**
 * 一時的な追加キーの設定
 * @param {object} _dosObj 
 */
function keysConvert(_dosObj) {

	if (_dosObj.keyExtraList === undefined) {
		return;
	}
	const keyExtraList = _dosObj.keyExtraList.split(`,`);

	const existParam = (_data, _paramName) => !hasVal(_data) && g_keyObj[_paramName] !== undefined;

	for (let j = 0; j < keyExtraList.length; j++) {
		const newKey = keyExtraList[j];
		let tmpKeyCtrl = [];
		let tmpDivPtn = [];
		let tmpMinPatterns = 1;

		// 矢印色パターン (colorX_Y)
		if (_dosObj[`color${newKey}`] !== undefined) {
			const tmpColors = _dosObj[`color${newKey}`].split(`$`);
			tmpMinPatterns = tmpColors.length;
			for (let k = 0; k < tmpMinPatterns; k++) {
				if (existParam(tmpColors[k], `color${newKey}_${k}`)) {
					continue;
				}
				g_keyObj[`color${newKey}_${k}`] = tmpColors[k].split(`,`).map(n => parseInt(n, 10));
			}
		} else if (g_keyObj[`color${newKey}_0`] === undefined) {
			makeWarningWindow(g_msgInfoObj.E_0101.split(`{0}`).join(newKey));
		}

		// 読込変数の接頭辞 (charaX_Y)
		if (_dosObj[`chara${newKey}`] !== undefined) {
			const tmpCharas = _dosObj[`chara${newKey}`].split(`$`);
			for (let k = 0; k < tmpCharas.length; k++) {
				if (existParam(tmpCharas[k], `chara${newKey}_${k}`)) {
					continue;
				}
				g_keyObj[`chara${newKey}_${k}`] = tmpCharas[k].split(`,`);
				g_keyObj[`chara${newKey}_${k}d`] = g_keyObj[`chara${newKey}_${k}`].concat();
			}
		} else if (g_keyObj[`chara${newKey}_0`] === undefined) {
			makeWarningWindow(g_msgInfoObj.E_0102.split(`{0}`).join(newKey));
		}

		// 各キーの区切り位置 (divX_Y)
		if (_dosObj[`div${newKey}`] !== undefined) {
			const tmpDivs = _dosObj[`div${newKey}`].split(`$`);
			for (let k = 0; k < tmpDivs.length; k++) {
				tmpDivPtn = tmpDivs[k].split(`,`);

				if (setVal(tmpDivPtn[0], -1, C_TYP_NUMBER) !== -1) {
					g_keyObj[`div${newKey}_${k}`] = setVal(tmpDivPtn[0], g_keyObj[`chara${newKey}_0`].length, C_TYP_NUMBER);
				} else if (setVal(g_keyObj[`div${newKey}_${k}`], -1, C_TYP_NUMBER) !== -1) {
					continue;
				} else if (g_keyObj[`chara${newKey}_0`] !== undefined) {
					g_keyObj[`div${newKey}_${k}`] = g_keyObj[`chara${newKey}_0`].length;
				}

				// ステップゾーン位置の最終番号
				if (tmpDivPtn.length > 1) {
					g_keyObj[`divMax${newKey}_${k}`] = setVal(tmpDivPtn[1], -1, C_TYP_NUMBER);
				}
			}
		}

		// 矢印の回転量指定、キャラクタパターン (stepRtnX_Y)
		if (_dosObj[`stepRtn${newKey}`] !== undefined) {
			const tmpStepRtns = _dosObj[`stepRtn${newKey}`].split(`$`);
			for (let k = 0; k < tmpStepRtns.length; k++) {
				if (existParam(tmpStepRtns[k], `stepRtn${newKey}_${k}`)) {
					continue;
				}
				g_keyObj[`stepRtn${newKey}_${k}`] = tmpStepRtns[k].split(`,`).map(n => (isNaN(Number(n)) ? n : parseInt(n, 10)));
				g_keyObj[`stepRtn${newKey}_${k}d`] = g_keyObj[`stepRtn${newKey}_${k}`].concat();
			}
		} else if (g_keyObj[`stepRtn${newKey}_0`] === undefined) {
			makeWarningWindow(g_msgInfoObj.E_0103.split(`{0}`).join(newKey));
		}

		// ステップゾーン位置 (posX_Y)
		if (_dosObj[`pos${newKey}`] !== undefined) {
			const tmpPoss = _dosObj[`pos${newKey}`].split(`$`);
			for (let k = 0; k < tmpPoss.length; k++) {
				if (existParam(tmpPoss[k], `pos${newKey}_${k}`)) {
					continue;
				}
				g_keyObj[`pos${newKey}_${k}`] = tmpPoss[k].split(`,`).map(n => parseInt(n, 10));

				if (g_keyObj[`divMax${newKey}_${k}`] === undefined || g_keyObj[`divMax${newKey}_${k}`] === -1) {
					const posLength = g_keyObj[`pos${newKey}_${k}`].length;
					g_keyObj[`divMax${newKey}_${k}`] = g_keyObj[`pos${newKey}_${k}`][posLength - 1] + 1;
				}
			}

		} else {
			for (let k = 0; k < tmpMinPatterns; k++) {
				if (g_keyObj[`color${newKey}_${k}`] !== undefined) {
					g_keyObj[`pos${newKey}_${k}`] = [...Array(g_keyObj[`color${newKey}_${k}`].length).keys()].map(i => i);
				}
			}
		}

		// キーコンフィグ (keyCtrlX_Y)
		if (_dosObj[`keyCtrl${newKey}`] !== undefined) {
			const tmpKeyCtrls = _dosObj[`keyCtrl${newKey}`].split(`$`);
			for (let p = 0; p < tmpKeyCtrls.length; p++) {
				if (existParam(tmpKeyCtrls[p], `keyCtrl${newKey}_${p}`)) {
					continue;
				}
				tmpKeyCtrl = tmpKeyCtrls[p].split(`,`);

				g_keyObj[`keyCtrl${newKey}_${p}`] = [];
				g_keyObj[`keyCtrl${newKey}_${p}d`] = [];

				for (let k = 0; k < tmpKeyCtrl.length; k++) {
					g_keyObj[`keyCtrl${newKey}_${p}`][k] = tmpKeyCtrl[k].split(`/`).map(n => parseInt(n, 10));
					g_keyObj[`keyCtrl${newKey}_${p}d`][k] = g_keyObj[`keyCtrl${newKey}_${p}`][k].concat();
				}
			}
		} else if (g_keyObj[`keyCtrl${newKey}_0`] === undefined) {
			makeWarningWindow(g_msgInfoObj.E_0104.split(`{0}`).join(newKey));
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
		if (_dosObj[`shuffle${newKey}`] !== undefined) {
			const tmpshuffles = _dosObj[`shuffle${newKey}`].split(`$`);
			for (let k = 0; k < tmpshuffles.length; k++) {
				g_keyObj[`shuffle${newKey}_${k}`] = tmpshuffles[k].split(`,`).map(n => parseInt(n, 10));
			}
		}

		// スクロールパターン (scrollX_Y)
		// |scroll(newKey)=Cross::1,1,-1,-1,-1,1,1/Split::1,1,1,-1,-1,-1,-1$...|
		newKeyPairParam(newKey, `scroll`, `scrollDir`, `---`, 1);

		// アシストパターン (assistX_Y)
		// |assist(newKey)=Onigiri::0,0,0,0,0,1/AA::0,0,0,1,1,1$...|
		newKeyPairParam(newKey, `assist`, `assistPos`);
	}

	/**
	 * 新キー用単一パラメータ
	 * @param {string} _key キー数
	 * @param {string} _name 名前
	 * @param {string} _type float, number, string, boolean
	 */
	function newKeySingleParam(_key, _name, _type) {
		if (_dosObj[`${_name}${_key}`] !== undefined) {
			const tmps = _dosObj[`${_name}${_key}`].split(`$`);
			for (let k = 0, len = tmps.length; k < len; k++) {
				g_keyObj[`${_name}${_key}_${k}`] = setVal(tmps[k], ``, _type);
			}
		}
	}

	/**
	 * 新キー用複合パラメータ（パターン設定用）
	 * @param {string} _key キー数
	 * @param {string} _name 名前
	 * @param {string} _pairName 詳細設定する変数名
	 * @param {string} _defaultName パラメータの初期値
	 * @param {number} _defaultVal パラメータの初期値の場合の一律設定値（colorX_Yの配列幅に対して設定値で埋める）
	 */
	function newKeyPairParam(_key, _name, _pairName, _defaultName = ``, _defaultVal = 0) {
		if (_dosObj[`${_name}${_key}`] !== undefined) {
			const tmpParams = _dosObj[`${_name}${_key}`].split(`$`);
			for (let k = 0; k < tmpParams.length; k++) {
				if (!hasVal(tmpParams[k])) {
					continue;
				}
				g_keyObj[`${_name}Name${_key}`] = [];
				g_keyObj[`${_pairName}${_key}_${k}`] = {};
				if (_defaultName !== ``) {
					g_keyObj[`${_name}Name${_key}`].push(_defaultName);
					g_keyObj[`${_pairName}${_key}_${k}`][_defaultName] = [...Array(g_keyObj[`color${_key}_${k}`].length)].fill(_defaultVal);
				}
				const tmpParamPairs = tmpParams[k].split(`/`);
				for (let m = 0; m < tmpParamPairs.length; m++) {
					const tmpParamPair = tmpParamPairs[m].split(`::`);
					g_keyObj[`${_name}Name${_key}`].push(tmpParamPair[0]);
					g_keyObj[`${_pairName}${_key}_${k}`][tmpParamPair[0]] = tmpParamPair[1].split(`,`).map(n => parseInt(n, 10));
				}
			}
		}
	}
}


/*-----------------------------------------------------------*/
/* Scene : SETTINGS [lime] */
/*-----------------------------------------------------------*/

/**
 * 設定・オプション画面初期化
 */
function optionInit() {

	clearWindow();
	drawDefaultBackImage(``);
	const divRoot = document.querySelector(`#divRoot`);
	g_baseDisp = `Settings`;

	// タイトル文字描画
	divRoot.appendChild(getTitleDivLabel(`lblTitle`, g_lblNameObj.settings, 0, 15, `settings_Title`));

	// オプションボタン用の設置
	createOptionWindow(`divRoot`);

	// ユーザカスタムイベント(初期)
	if (typeof customOptionInit === C_TYP_FUNCTION) {
		customOptionInit();
		if (typeof customOptionInit2 === C_TYP_FUNCTION) {
			customOptionInit2();
		}
	}

	// ボタン描画
	multiAppend(divRoot,

		// タイトル画面へ戻る
		createCss2Button(`btnBack`, g_lblNameObj.b_back, _ => titleInit(), {
			animationName: (g_initialFlg ? `` : `smallToNormalY`),
		}, g_cssObj.button_Back),

		// キーコンフィグ画面へ移動
		createCss2Button(`btnKeyConfig`, g_lblNameObj.b_keyConfig, _ => keyConfigInit(`Main`), {
			x: g_sWidth / 3,
			animationName: (g_initialFlg ? `` : `smallToNormalY`),
		}, g_cssObj.button_Setting),

		// プレイ開始
		makePlayButton(_ => loadMusic()),

		// Display設定へ移動
		createCss2Button(`btnDisplay`, `>`, _ => settingsDisplayInit(), {
			x: g_sWidth / 2 + 175 - C_LEN_SETMINI_WIDTH / 2, y: 25,
			w: C_LEN_SETMINI_WIDTH, h: 40, title: g_msgObj.toDisplay,
		}, g_cssObj.button_Mini),

		// データセーブフラグの切替
		createCss2Button(`btnSave`, g_lblNameObj.dataSave, evt => {
			g_stateObj.dataSaveFlg = !g_stateObj.dataSaveFlg;
			const [from, to] = (g_stateObj.dataSaveFlg ? [C_FLG_OFF, C_FLG_ON] : [C_FLG_ON, C_FLG_OFF]);
			evt.target.classList.replace(g_cssObj[`button_${from}`], g_cssObj[`button_${to}`]);
		}, {
			x: 0, y: 5,
			w: g_sWidth / 5, h: 16, siz: 12,
			title: g_msgObj.dataSave,
			borderStyle: `solid`,
		}, g_cssObj.button_Default, (g_stateObj.dataSaveFlg ? g_cssObj.button_ON : g_cssObj.button_OFF)),

	);

	// キー操作イベント（デフォルト）
	document.onkeydown = evt => {
		const setCode = transCode(evt.code);

		if (evt.repeat) {
			return blockCode(setCode);
		}

		if (setCode === `Enter`) {
			loadMusic();
		}
		return blockCode(setCode);
	}
	document.onkeyup = evt => { }
	document.oncontextmenu = _ => true;
	g_initialFlg = true;

	if (typeof skinOptionInit === C_TYP_FUNCTION) {
		skinOptionInit();
		if (typeof skinOptionInit2 === C_TYP_FUNCTION) {
			skinOptionInit2();
		}
	}
}

function musicAfterLoaded() {
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
			makeWarningWindow(g_msgInfoObj.E_0041.split(`{0}`).join(g_audio.src));
		})(), false);
	}
}

/**
 * 設定画面用スプライトリストの作成
 * @param {array} _settingList (設定名、縦位置、縦位置差分、幅差分、高さ差分)を設定別にリスト化
 */
function setSpriteList(_settingList) {
	const optionWidth = (g_sWidth - 450) / 2;
	const childX = 25;
	const childY = 20;
	const spriteList = [];
	_settingList.forEach(setting => {
		spriteList[setting[0]] = createSprite(`optionsprite`, `${setting[0]}Sprite`,
			childX, setting[1] * C_LEN_SETLBL_HEIGHT + childY + setting[2],
			optionWidth + setting[3], C_LEN_SETLBL_HEIGHT + setting[4], { description: g_msgObj[setting[0]] });
	});
	return spriteList;
}

/**
 * 設定・オプション画面のラベル・ボタン処理の描画
 * @param {Object} _sprite 基準とするスプライト(ここで指定する座標は、そのスプライトからの相対位置)
 */
function createOptionWindow(_sprite) {

	// 各ボタン用のスプライトを作成
	const optionWidth = (g_sWidth - 450) / 2;
	const optionsprite = createSprite(_sprite, `optionsprite`, optionWidth, 65 + (g_sHeight - 500) / 2, 450, 325);

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
			optionsprite.removeChild(document.querySelector(`#difList`));
			optionsprite.removeChild(document.querySelector(`#difCover`));
		}
	};

	/**
	 * 譜面リストの作成
	 * @param {object} _difList 
	 * @param {string} _targetKey 
	 */
	const makeDifList = (_difList, _targetKey = ``) => {
		let k = 0;
		g_headerObj.keyLabels.forEach((keyLabel, j) => {
			if (_targetKey === `` || keyLabel === _targetKey) {
				let text = `${keyLabel} / ${g_headerObj.difLabels[j]}`;
				if (g_headerObj.makerView) {
					text += ` (${g_headerObj.creatorNames[j]})`;
				}
				_difList.appendChild(makeDifLblCssButton(`dif${k}`, text, k, _ => {
					g_stateObj.scoreId = j;
					setDifficulty(true);
					resetDifWindow();
				}));
				k++;
			}
		});
	};

	// 譜面選択処理
	const nextDifficulty = (_scrollNum = 1, _resetFlg = false) => {
		g_stateObj.scoreId = (g_stateObj.scoreId + g_headerObj.keyLabels.length + _scrollNum) % g_headerObj.keyLabels.length;
		setDifficulty(true);
		if (_resetFlg) {
			resetDifWindow();
		}
	};

	const lnkDifficulty = makeSettingLblCssButton(`lnkDifficulty`,
		``, 0, _ => {
			if (g_headerObj.difSelectorUse) {
				if (document.querySelector(`#difList`) === null) {
					const difList = createSprite(`optionsprite`, `difList`, 165, 65, 280, 255);
					difList.style.overflow = `auto`;
					difList.classList.toggle(g_cssObj.settings_DifSelector, true);
					const difCover = createSprite(`optionsprite`, `difCover`, 25, 65, 140, 255);
					difCover.style.overflow = `auto`;
					difCover.classList.toggle(g_cssObj.settings_DifSelector, true);
					difCover.style.opacity = 0.95;

					// 全リスト作成
					makeDifList(difList);

					// ランダム選択
					difCover.appendChild(
						makeDifLblCssButton(`difRandom`, `RANDOM`, 0, _ => {
							g_stateObj.scoreId = Math.floor(Math.random() * g_headerObj.keyLabels.length);
							setDifficulty(true);
							resetDifWindow();
						}, { w: 110 })
					);

					// キー別フィルタボタン作成
					g_headerObj.keyLists.forEach((targetKey, m) => {
						difCover.appendChild(
							makeDifLblCssButton(`keyFilter`, `${targetKey} key`, m + 1.5, _ => {
								deleteChildspriteAll(`difList`);
								makeDifList(difList, targetKey);
							}, { w: 110 })
						);
					});
				} else {
					resetDifWindow();
				}
			} else {
				nextDifficulty();
			}
		}, {
		y: -10, h: C_LEN_SETLBL_HEIGHT + 10,
		cxtFunc: _ => {
			if (g_headerObj.difSelectorUse) {
				resetDifWindow();
			} else {
				nextDifficulty(-1);
			}
		},
	});

	// 譜面選択ボタン（メイン、右回し、左回し）
	multiAppend(spriteList.difficulty,
		lnkDifficulty,
		makeMiniCssButton(`lnkDifficulty`, `R`, 0, _ => nextDifficulty(1, true), { dy: -10, dh: 10 }),
		makeMiniCssButton(`lnkDifficulty`, `L`, 0, _ => nextDifficulty(-1, true), { dy: -10, dh: 10 }),
	)

	// ---------------------------------------------------
	// ハイスコア機能実装時に使用予定のスペース
	// 縦位置: 1

	// ---------------------------------------------------
	// 速度(Speed)
	// 縦位置: 2  短縮ショートカットあり
	createGeneralSetting(spriteList.speed, `speed`, { unitName: ` x`, skipTerm: 4 });

	if (g_headerObj.scoreDetailUse) {
		spriteList.speed.appendChild(
			createCss2Button(`btnGraph`, `i`, _ => {
				setScoreDetail();
			}, {
				x: 415, y: 0,
				w: 23, h: 23, siz: C_SIZ_JDGCNTS,
				title: g_msgObj.graph,
			}, g_cssObj.button_Mini)
		);
		g_stateObj.scoreDetailViewFlg = false;

		const scoreDetail = createSprite(`optionsprite`, `scoreDetail`, 20, 90, 420, 230);
		scoreDetail.classList.add(g_cssObj.settings_DifSelector);
		scoreDetail.style.visibility = `hidden`;
		multiAppend(scoreDetail,
			createScoreDetail(`Speed`),
			createScoreDetail(`Density`),
			createScoreDetail(`ToolDif`, false),
			makeSettingLblCssButton(`lnkScoreDetail`, `${g_stateObj.scoreDetail}`, 0, _ => {
				$id(`detail${g_stateObj.scoreDetail}`).visibility = `hidden`;
				setSetting(1, `scoreDetail`);
				$id(`detail${g_stateObj.scoreDetail}`).visibility = `visible`;
			}, {
				x: 10, w: 100, borderStyle: `solid`,
			}, g_cssObj.button_RevON),
		);
	}

	/**
	 * 譜面明細子画面・グラフの作成
	 * @param {string} _name 
	 * @param {boolean} _graphUseFlg
	 */
	function createScoreDetail(_name, _graphUseFlg = true) {
		const detailObj = createSprite(`scoreDetail`, `detail${_name}`, 0, 0, 420, 230);

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
		detailObj.style.visibility = `hidden`;

		return detailObj;
	}

	/**
	 * 譜面明細表示／非表示ボタンの処理
	 */
	function setScoreDetail() {
		const scoreDetail = document.querySelector(`#scoreDetail`);
		const detailObj = document.querySelector(`#detail${g_stateObj.scoreDetail}`);
		const visibles = [`hidden`, `visible`];

		g_stateObj.scoreDetailViewFlg = !g_stateObj.scoreDetailViewFlg;
		scoreDetail.style.visibility = visibles[Number(g_stateObj.scoreDetailViewFlg)];
		detailObj.style.visibility = visibles[Number(g_stateObj.scoreDetailViewFlg)];
	}

	/**
	 * 速度変化グラフの描画
	 * @param {number} _scoreId
	 */
	function drawSpeedGraph(_scoreId) {
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

			makeScoreDetailLabel(`Speed`, g_lblNameObj[`s_${speedType}`], speedObj[speedType].cnt, j);
		});
	}

	/**
	 * 譜面密度グラフの描画
	 * @param {number} _scoreId 
	 */
	function drawDensityGraph(_scoreId) {

		const arrowCnts = g_detailObj.arrowCnt[_scoreId].reduce((p, x) => p + x);
		const frzCnts = g_detailObj.frzCnt[_scoreId].reduce((p, x) => p + x);

		const canvas = document.querySelector(`#graphDensity`);
		const context = canvas.getContext(`2d`);
		drawBaseLine(context);
		for (let j = 0; j < C_LEN_DENSITY_DIVISION; j++) {
			context.beginPath();
			context.fillStyle = (j === g_detailObj.maxDensity[_scoreId] ? C_CLR_DENSITY_MAX : C_CLR_DENSITY_DEFAULT);
			context.fillRect(16 * j * 16 / C_LEN_DENSITY_DIVISION + 30, 195 - 9 * g_detailObj.densityData[_scoreId][j] / 10,
				15.5 * 16 / C_LEN_DENSITY_DIVISION, 9 * g_detailObj.densityData[_scoreId][j] / 10
			);
			context.stroke();
		}

		const apm = Math.round((arrowCnts + frzCnts) / (g_detailObj.playingFrame[_scoreId] / g_fps / 60));
		makeScoreDetailLabel(`Density`, g_lblNameObj.s_apm, apm, 0);
		const minutes = Math.floor(g_detailObj.playingFrameWithBlank[_scoreId] / g_fps / 60);
		const seconds = `00${Math.floor((g_detailObj.playingFrameWithBlank[_scoreId] / g_fps) % 60)}`.slice(-2);
		const playingTime = `${minutes}:${seconds}`;
		makeScoreDetailLabel(`Density`, g_lblNameObj.s_time, playingTime, 1);
		makeScoreDetailLabel(`Density`, g_lblNameObj.s_arrow, arrowCnts, 3);
		makeScoreDetailLabel(`Density`, g_lblNameObj.s_frz, frzCnts, 4);
	}

	/**
	 * 譜面明細内の補足情報
	 * @param {string} _name 表示する譜面明細のラベル
	 * @param {string} _label 
	 * @param {string} _value 
	 * @param {number} _pos 表示位置
	 * @param {string} _labelname
	 */
	function makeScoreDetailLabel(_name, _label, _value, _pos = 0, _labelname = _label) {
		const baseLabel = (_bLabel, _bLabelname, _bAlign) => {
			document.querySelector(`#detail${_name}`).appendChild(
				createDivCss2Label(`${_bLabel}`, `${_bLabelname}`, {
					x: 10, y: 65 + _pos * 20, w: 100, h: 20, siz: C_SIZ_DIFSELECTOR, align: _bAlign,
				})
			);
		};
		if (document.querySelector(`#data${_label}`) === null) {
			baseLabel(`lbl${_label}`, `${_labelname}`, C_ALIGN_LEFT);
			baseLabel(`data${_label}`, `${_value}`, C_ALIGN_RIGHT);
		} else {
			document.querySelector(`#data${_label}`).textContent = `${_value}`;
		}
	}

	/**
	 * グラフの縦軸を描画
	 * @param {context} _context 
	 * @param {number} _resolution 
	 */
	function drawBaseLine(_context, _resolution = 10) {
		_context.clearRect(0, 0, C_LEN_GRAPH_WIDTH, C_LEN_GRAPH_HEIGHT);

		for (let j = 0; j <= 2 * _resolution; j += 5) {
			drawLine(_context, j / _resolution, `main`, 2);
			for (let k = 1; k < 5; k++) {
				drawLine(_context, (j + k) / _resolution, `sub`, 2);
			}
		}
	}

	/**
	 * グラフ上に目盛を表示
	 * @param {object} _context 
	 * @param {number} _y 
	 * @param {string} _lineType 
	 * @param {number} _fixed
	 */
	function drawLine(_context, _y, _lineType, _fixed = 0) {
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
	}

	/**
	 * 譜面の難易度情報
	 * @param {number} _scoreId 
	 */
	function makeDifInfo(_scoreId) {

		const arrowCnts = g_detailObj.arrowCnt[_scoreId].reduce((p, x) => p + x);
		const frzCnts = g_detailObj.frzCnt[_scoreId].reduce((p, x) => p + x);

		// ツール難易度
		const detailToolDif = document.querySelector(`#detailToolDif`);

		/**
		 * 譜面の難易度情報ラベルの作成
		 * @param {string} _lbl 
		 * @param {string} _data 
		 * @param {object} _obj 
		 */
		const makeDifInfoLabel = (_lbl, _data, { _x = 130, _y = 25, _w = 125, _h = 35, _siz = C_SIZ_DIFSELECTOR, ...rest } = {}) => {
			detailToolDif.appendChild(
				createDivCss2Label(_lbl, _data, {
					x: _x, y: _y, w: _w, h: _h, siz: _siz, align: C_ALIGN_LEFT, ...rest
				})
			);
		}

		if (document.querySelector(`#lblTooldif`) === null) {
			makeDifInfoLabel(`lblTooldif`, g_lblNameObj.s_level, { y: 5, w: 250, siz: C_SIZ_JDGCNTS });
			makeDifInfoLabel(`dataTooldif`, g_detailObj.toolDif[_scoreId].tool, { x: 270, y: 3, w: 160, siz: 18 });
		} else {
			dataTooldif.textContent = g_detailObj.toolDif[_scoreId].tool;
		}

		const push3CntStr = (g_detailObj.toolDif[_scoreId].push3.length === 0 ? `None` : `(${g_detailObj.toolDif[_scoreId].push3})`);
		let ArrowInfo = `${arrowCnts + frzCnts} <span style="font-size:${C_SIZ_DIFSELECTOR}px;">(${arrowCnts} + ${frzCnts})</span>`;
		let ArrowInfo2 = `<br>(${g_detailObj.arrowCnt[_scoreId]})<br><br>
			(${g_detailObj.frzCnt[_scoreId]})<br><br>
			${push3CntStr}`.split(`,`).join(`/`);

		if (document.querySelector(`#lblDouji`) === null) {
			makeDifInfoLabel(`lblDouji`, g_lblNameObj.s_douji);
			makeDifInfoLabel(`lblTate`, g_lblNameObj.s_tate, { x: 270 });
			makeDifInfoLabel(`dataDouji`, g_detailObj.toolDif[_scoreId].douji, { x: 200, w: 160 });
			makeDifInfoLabel(`dataTate`, g_detailObj.toolDif[_scoreId].tate, { x: 345, w: 160 });
			makeDifInfoLabel(`lblArrowInfo`, g_lblNameObj.s_cnts, { x: 130, y: 45, w: 290, siz: C_SIZ_JDGCNTS });
			makeDifInfoLabel(`dataArrowInfo`, ArrowInfo, { x: 270, y: 45, w: 160, siz: C_SIZ_JDGCNTS });
			makeDifInfoLabel(`lblArrowInfo2`, g_lblNameObj.s_linecnts.split(`{0}`).join(g_detailObj.toolDif[_scoreId].push3cnt),
				{ x: 130, y: 70, w: 200, h: 90 });
			makeDifInfoLabel(`dataArrowInfo2`, ArrowInfo2, { x: 140, y: 70, w: 275, h: 150, overflow: `auto` });

		} else {
			dataDouji.textContent = g_detailObj.toolDif[_scoreId].douji;
			dataTate.textContent = g_detailObj.toolDif[_scoreId].tate;
			lblArrowInfo2.innerHTML = g_lblNameObj.s_linecnts.split(`{0}`).join(g_detailObj.toolDif[_scoreId].push3cnt);
			dataArrowInfo.innerHTML = ArrowInfo;
			dataArrowInfo2.innerHTML = ArrowInfo2;
		}

		// データ出力ボタン
		if (document.querySelector(`#lnkDifInfo`) === null) {
			let printData = ``;
			for (let j = 0; j < g_detailObj.arrowCnt.length; j++) {
				const arrowCnts = g_detailObj.arrowCnt[j].reduce((p, x) => p + x);
				const frzCnts = g_detailObj.frzCnt[j].reduce((p, x) => p + x);
				const apm = Math.round((arrowCnts + frzCnts) / (g_detailObj.playingFrame[j] / g_fps / 60));
				const minutes = Math.floor(g_detailObj.playingFrame[j] / g_fps / 60);
				const seconds = `00${Math.floor((g_detailObj.playingFrame[j] / g_fps) % 60)}`.slice(-2);
				const playingTime = `${minutes}:${seconds}`;

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
					`${(arrowCnts + frzCnts)}\t` +
					// 矢印
					`${arrowCnts}\t` +
					// フリーズアロー
					`${frzCnts}\t` +
					// APM
					`${apm}\t` +
					// 時間(分秒)
					`${playingTime}\r\n`;
			}
			detailToolDif.appendChild(
				makeSettingLblCssButton(`lnkDifInfo`, g_lblNameObj.s_print, 0, _ => {
					copyTextToClipboard(
						`****** ${g_lblNameObj.s_printTitle} [${g_version}] ******\r\n\r\n`
						+ `\t${g_lblNameObj.s_printHeader}\r\n\r\n${printData}`
					);
					makeInfoWindow(g_msgInfoObj.I_0003, `leftToRightFade`);
				}, {
					x: 10, y: 30, w: 100, borderStyle: `solid`
				}, g_cssObj.button_RevON)
			);
		}
	}

	// ---------------------------------------------------
	// 速度モーション (Motion)
	// 縦位置: 3
	createGeneralSetting(spriteList.motion, `motion`);

	// ---------------------------------------------------
	// リバース (Reverse) / スクロール (Scroll)
	// 縦位置: 4
	createGeneralSetting(spriteList.reverse, `reverse`);
	if (g_headerObj.scrollUse) {
		createGeneralSetting(spriteList.scroll, `scroll`);
		[$id(`lnkScroll`).left, $id(`lnkScroll`).width] = [
			`${parseFloat($id(`lnkScroll`).left) + 90}px`, `${parseFloat($id(`lnkScroll`).width) - 90}px`
		];

		spriteList.scroll.appendChild(
			createCss2Button(`btnReverse`, `${g_lblNameObj.Reverse}:${g_stateObj.reverse}`, evt => setReverse(evt.target), {
				x: 160, y: 0,
				w: 90, h: 21, siz: C_SIZ_DIFSELECTOR,
				borderStyle: `solid`,
				cxtFunc: evt => setReverse(evt.target),
			}, g_cssObj.button_Default, g_cssObj[`button_Rev${g_stateObj.reverse}`])
		);
		spriteList[g_scrolls.length > 1 ? `reverse` : `scroll`].style.visibility = `hidden`;
	}

	function setReverse(_btn) {
		g_reverseNum = (g_reverseNum + 1) % 2;
		g_stateObj.reverse = g_reverses[g_reverseNum];
		setReverseView(_btn);
	}

	function setReverseView(_btn) {
		_btn.classList.replace(g_cssObj[`button_Rev${g_reverses[(g_reverseNum + 1) % 2]}`],
			g_cssObj[`button_Rev${g_reverses[g_reverseNum]}`]);
		_btn.textContent = `${g_lblNameObj.Reverse}:${g_stateObj.reverse}`;
	}

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
	spriteList.gauge.appendChild(
		createDivCss2Label(`lblGauge2`, ``, {
			x: C_LEN_SETLBL_LEFT - 35, y: C_LEN_SETLBL_HEIGHT,
			w: C_LEN_SETLBL_WIDTH + 60, h: C_LEN_SETLBL_HEIGHT * 2, siz: 11,
		})
	);

	if (g_headerObj.gaugeUse) {
		multiAppend(spriteList.gauge,
			makeSettingLblCssButton(`lnkGauge`, ``, 0, _ => setGauge(1), { cxtFunc: _ => setGauge(-1) }),
			makeMiniCssButton(`lnkGauge`, `R`, 0, _ => setGauge(1)),
			makeMiniCssButton(`lnkGauge`, `L`, 0, _ => setGauge(-1)),
		);
	} else {
		lblGauge.classList.add(g_cssObj.settings_Disabled);
		spriteList.gauge.appendChild(makeDisabledLabel(`lnkGauge`, 0, g_stateObj.gauge));
	}

	/**
	 * ゲージ設定メイン
	 * @param {number} _scrollNum 
	 */
	function setGauge(_scrollNum) {

		// カーソルを動かさない場合は先にゲージ設定をリロード
		if (_scrollNum === 0) {
			gaugeChange(g_gaugeNum);
		}
		setSetting(_scrollNum, `gauge`);

		// カーソルを動かす場合は設定変更後にゲージ設定を再設定
		if (_scrollNum !== 0) {
			gaugeChange(g_gaugeNum);
		}
		lblGauge2.innerHTML = gaugeFormat(g_stateObj.lifeMode,
			g_stateObj.lifeBorder, g_stateObj.lifeRcv, g_stateObj.lifeDmg, g_stateObj.lifeInit, g_stateObj.lifeVariable);
	}

	/**
	 * ゲージ設定の切替処理
	 * @param {number} _gaugeNum 
	 */
	function gaugeChange(_gaugeNum) {
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
				g_gauges = JSON.parse(JSON.stringify(g_gaugeOptionObj[g_gaugeType.toLowerCase()]));
				g_stateObj.gauge = g_gauges[g_gaugeNum];
			}
			setLifeCategory(g_headerObj);

		} else {
			// 設定されたゲージ設定、カーソルに合わせて設定値を更新
			g_stateObj.lifeVariable = g_gaugeOptionObj[`var${g_gaugeType}`][_gaugeNum];
			if (g_gaugeOptionObj.custom.length === 0) {
				g_stateObj.lifeMode = g_gaugeOptionObj[`type${g_gaugeType}`][_gaugeNum];
				g_stateObj.lifeBorder = g_gaugeOptionObj[`clear${g_gaugeType}`][_gaugeNum];
				g_stateObj.lifeInit = g_gaugeOptionObj[`init${g_gaugeType}`][_gaugeNum];
				g_stateObj.lifeRcv = g_gaugeOptionObj[`rcv${g_gaugeType}`][_gaugeNum];
				g_stateObj.lifeDmg = g_gaugeOptionObj[`dmg${g_gaugeType}`][_gaugeNum];
			}
		}

		// ゲージ設定(Light, Easy)の初期化
		if (g_stateObj.gauge === `Light` || g_stateObj.gauge === `Easy`) {
			setLifeCategory(g_headerObj, { _magRcv: 2 });
		}

		// ゲージ設定別に個別設定した場合はここで設定を上書き
		// 譜面ヘッダー：gaugeXXX で設定した値がここで適用される
		if (g_gaugeOptionObj[`gauge${g_stateObj.gauge}s`] !== undefined) {
			const tmpGaugeObj = g_gaugeOptionObj[`gauge${g_stateObj.gauge}s`];
			if (hasVal(tmpGaugeObj.lifeBorders[tmpScoreId])) {
				changeLifeMode(tmpGaugeObj);
			}
			setLifeCategory(tmpGaugeObj);
		}
	}

	/**
	 * ゲージ設定の詳細表示を整形
	 */
	function gaugeFormat(_mode, _border, _rcv, _dmg, _init, _lifeValFlg) {
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
	}

	// ---------------------------------------------------
	// タイミング調整 (Adjustment)
	// 縦位置: 10  短縮ショートカットあり
	createGeneralSetting(spriteList.adjustment, `adjustment`, { skipTerm: 5 });

	// ---------------------------------------------------
	// フェードイン (Fadein)
	// 縦位置: 11 スライダーあり
	spriteList.fadein.appendChild(createLblSetting(`Fadein`));

	const lnkFadein = createDivCss2Label(`lnkFadein`, `${g_stateObj.fadein}%`, {
		x: C_LEN_SETLBL_LEFT, y: 0,
	}, g_cssObj.settings_FadeinBar);
	spriteList.fadein.appendChild(lnkFadein);

	const setFadein = _sign => {
		g_stateObj.fadein = (g_stateObj.fadein + 100 + _sign) % 100;
		fadeinSlider.value = g_stateObj.fadein;
		lnkFadein.textContent = `${g_stateObj.fadein}%`;
	};

	multiAppend(spriteList.fadein,

		// 右回し・左回しボタン
		makeMiniCssButton(`lnkFadein`, `R`, 0, _ => setFadein(1)),
		makeMiniCssButton(`lnkFadein`, `L`, 0, _ => setFadein(-1)),

		// フェードインのスライダー処理
		createDivCss2Label(`lblFadeinBar`, `<input id="fadeinSlider" type="range" value="${g_stateObj.fadein}" min="0" max="99" step="1">`, {
			x: C_LEN_SETLBL_LEFT, y: 0,
		}),

	)

	const fadeinSlider = document.querySelector(`#fadeinSlider`);
	fadeinSlider.addEventListener(`input`, _ => {
		g_stateObj.fadein = parseInt(fadeinSlider.value);
		lnkFadein.textContent = `${g_stateObj.fadein}%`;
	}, false);

	// ---------------------------------------------------
	// ボリューム (Volume) 
	// 縦位置: 12
	createGeneralSetting(spriteList.volume, `volume`, { unitName: `%` });

	/**
	 * 譜面初期化処理
	 * - 譜面の基本設定（キー数、初期速度、リバース、ゲージ設定）をここで行う
	 * - g_canLoadDifInfoFlg は譜面初期化フラグで、初期化したくない場合は対象画面にて false にしておく
	 *   (Display設定画面、キーコンフィグ画面では通常OFF)
	 *   この関数を実行後、このフラグはONに戻るようになっている 
	 * - [キーコン]->[初期化]->[名称設定]の順に配置する。
	 *   初期化処理にてキー数関連の設定を行っているため、この順序で無いとデータが正しく格納されない
	 */
	function setDifficulty(_initFlg) {

		// ---------------------------------------------------
		// 1. キーコンフィグ設定 (KeyConfig)

		// 特殊キーフラグ
		g_stateObj.extraKeyFlg = false;

		g_keyObj.currentKey = g_headerObj.keyLabels[g_stateObj.scoreId];

		if (g_headerObj.dummyScoreNos !== undefined) {
			g_stateObj.dummyId = setVal(g_headerObj.dummyScoreNos[g_stateObj.scoreId], ``, C_TYP_NUMBER);
		}

		if (g_rootObj.keyExtraList !== undefined) {
			g_rootObj.keyExtraList.split(`,`).some(extraKey => {
				if (g_keyObj.currentKey === extraKey) {
					g_stateObj.extraKeyFlg = true;
					return true;
				}
			});
		}

		// アシスト設定の配列を入れ替え
		g_autoPlays = (typeof g_keyObj[`assistName${g_keyObj.currentKey}`] === C_TYP_OBJECT ?
			g_autoPlaysBase.concat(g_keyObj[`assistName${g_keyObj.currentKey}`]) :
			g_autoPlaysBase.concat());

		// ---------------------------------------------------
		// 2. 初期化設定

		if (_initFlg) {

			// 速度、ゲージ、リバースの初期設定
			g_stateObj.speed = g_headerObj.initSpeeds[g_stateObj.scoreId];
			g_speedNum = roundZero(g_speeds.findIndex(speed => speed === g_stateObj.speed));
			g_gaugeNum = 0;
			g_scrollNum = 0;
			if (!g_autoPlays.includes(g_stateObj.autoPlay)) {
				g_autoPlayNum = 0;
			}
		}

		if (g_canLoadDifInfoFlg || _initFlg) {

			// キー別のローカルストレージの初期設定　※特殊キーは除く
			if (!g_stateObj.extraKeyFlg) {

				// キーパターン初期化
				g_keyObj.currentPtn = 0;

				g_checkKeyStorage = localStorage.getItem(`danonicw-${g_keyObj.currentKey}k`);
				if (g_checkKeyStorage) {
					g_localKeyStorage = JSON.parse(g_checkKeyStorage);

					// リバース初期値設定
					if (g_localKeyStorage.reverse !== undefined) {
						g_stateObj.reverse = setVal(g_localKeyStorage.reverse, C_FLG_OFF, C_TYP_STRING);
						g_reverseNum = roundZero(g_reverses.findIndex(reverse => reverse === g_stateObj.reverse));
					}

					// キーコンフィグ初期値設定
					if (g_localKeyStorage.keyCtrlPtn === undefined) {
						g_localKeyStorage.keyCtrlPtn = 0;
					}
					getKeyCtrl(g_localKeyStorage);

				} else {
					g_localKeyStorage = {
						reverse: C_FLG_OFF,
						keyCtrl: [[]],
						keyCtrlPtn: 0,
					};
					g_stateObj.reverse = C_FLG_OFF;
					g_reverseNum = 0;
				}
			} else {

				// 特殊キーの場合は作品毎のローカルストレージから取得
				g_keyObj.currentPtn = 0;

				// リバース初期値設定
				if (g_localStorage[`reverse${g_keyObj.currentKey}`] !== undefined) {
					g_stateObj.reverse = setVal(g_localStorage[`reverse${g_keyObj.currentKey}`], C_FLG_OFF, C_TYP_STRING);
					g_reverseNum = roundZero(g_reverses.findIndex(reverse => reverse === g_stateObj.reverse));
				} else {
					g_stateObj.reverse = C_FLG_OFF;
					g_reverseNum = 0;
				}

				// キーコンフィグ初期値設定
				if (g_localStorage[`keyCtrlPtn${g_keyObj.currentKey}`] === undefined) {
					g_localStorage[`keyCtrlPtn${g_keyObj.currentKey}`] = 0;
				}
				getKeyCtrl(g_localStorage, g_keyObj.currentKey);
			}

			const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
			if (g_headerObj.keyRetryDef === C_KEY_RETRY) {
				g_headerObj.keyRetry = setVal(g_keyObj[`keyRetry${keyCtrlPtn}`], g_headerObj.keyRetryDef, C_TYP_NUMBER);
			}
			if (g_headerObj.keyTitleBackDef === C_KEY_TITLEBACK) {
				g_headerObj.keyTitleBack = setVal(g_keyObj[`keyTitleBack${keyCtrlPtn}`], g_headerObj.keyTitleBackDef, C_TYP_NUMBER);
			}
		}

		// ---------------------------------------------------
		// 3. 名称の設定

		// 譜面名設定 (Difficulty)
		lnkDifficulty.innerHTML = `${g_keyObj.currentKey} key / ${g_headerObj.difLabels[g_stateObj.scoreId]}`;
		if (getStrLength(lnkDifficulty.textContent) > 25) {
			lnkDifficulty.style.fontSize = `14px`;
		} else if (getStrLength(lnkDifficulty.textContent) > 18) {
			lnkDifficulty.style.fontSize = `16px`;
		}
		if (g_headerObj.makerView) {
			lnkDifficulty.innerHTML += `<br>(${g_headerObj.creatorNames[g_stateObj.scoreId]})`;
			lnkDifficulty.style.fontSize = `14px`;
		}

		// 速度設定 (Speed)
		setSetting(0, `speed`, ` x`);
		if (g_headerObj.scoreDetailUse) {
			drawSpeedGraph(g_stateObj.scoreId);
			drawDensityGraph(g_stateObj.scoreId);
			makeDifInfo(g_stateObj.scoreId);
		}

		// リバース設定 (Reverse, Scroll)
		if (g_headerObj.scrollUse) {
			g_scrolls = JSON.parse(JSON.stringify(
				typeof g_keyObj[`scrollName${g_keyObj.currentKey}`] === C_TYP_OBJECT ?
					g_keyObj[`scrollName${g_keyObj.currentKey}`] : g_keyObj.scrollName_def
			));
			g_stateObj.scroll = g_scrolls[g_scrollNum];
			const [visibleScr, hiddenScr] = (g_scrolls.length > 1 ? [`scroll`, `reverse`] : [`reverse`, `scroll`]);
			spriteList[visibleScr].style.visibility = `visible`;
			spriteList[hiddenScr].style.visibility = `hidden`;
			setSetting(0, visibleScr);
			if (g_scrolls.length > 1) {
				setReverseView(document.querySelector(`#btnReverse`));
			}
		} else {
			g_scrolls = JSON.parse(JSON.stringify(g_keyObj.scrollName_def));
			setSetting(0, `reverse`);
		}

		// オート・アシスト設定 (AutoPlay)
		g_stateObj.autoPlay = g_autoPlays[g_autoPlayNum];
		lnkAutoPlay.textContent = g_stateObj.autoPlay;

		// ゲージ設定 (Gauge)
		setGauge(0);

		// ユーザカスタムイベント(初期)
		if (typeof customSetDifficulty === C_TYP_FUNCTION) {
			customSetDifficulty(_initFlg, g_canLoadDifInfoFlg);
			if (typeof customSetDifficulty2 === C_TYP_FUNCTION) {
				customSetDifficulty2(_initFlg, g_canLoadDifInfoFlg);
			}
		}

		// ---------------------------------------------------
		// 4. 譜面初期情報ロード許可フラグの設定
		g_canLoadDifInfoFlg = true;
	}

	// 設定画面の一通りのオブジェクトを作成後に譜面・速度・ゲージ設定をまとめて行う
	setDifficulty(false);
	optionsprite.oncontextmenu = _ => false;
}

/**
 * 汎用設定
 * @param {object} _obj 
 * @param {string} _settingName 
 * @param {object} _options
 */
function createGeneralSetting(_obj, _settingName, _options = {}) {
	const _unitName = setVal(_options.unitName, ``, C_TYP_STRING);
	const _skipTerm = setVal(_options.skipTerm, 0, C_TYP_NUMBER);
	const settingUpper = toCapitalize(_settingName);

	_obj.appendChild(createLblSetting(settingUpper, 0,
		toCapitalize(setVal(_options.settingLabel, _settingName, C_TYP_STRING))));

	if (g_headerObj[`${_settingName}Use`] === undefined || g_headerObj[`${_settingName}Use`]) {

		multiAppend(_obj,
			makeSettingLblCssButton(`lnk${settingUpper}`, `${g_stateObj[_settingName]}${_unitName}${g_localStorage[_settingName] === g_stateObj[_settingName] ? ' *' : ''}`, 0,
				_ => setSetting(1, _settingName, _unitName),
				{ cxtFunc: _ => setSetting(-1, _settingName, _unitName) }),

			// 右回し・左回しボタン（外側）
			makeMiniCssButton(`lnk${settingUpper}`, `R`, 0, _ => setSetting(_skipTerm > 0 ? _skipTerm : 1, _settingName, _unitName)),
			makeMiniCssButton(`lnk${settingUpper}`, `L`, 0, _ => setSetting(_skipTerm > 0 ? _skipTerm * (-1) : -1, _settingName, _unitName)),
		)

		// 右回し・左回しボタン（内側）
		if (_skipTerm > 0) {
			multiAppend(_obj,
				makeMiniCssButton(`lnk${settingUpper}`, `RR`, 0, _ => setSetting(1, _settingName, _unitName)),
				makeMiniCssButton(`lnk${settingUpper}`, `LL`, 0, _ => setSetting(-1, _settingName, _unitName)),
			);
		}
	} else {
		document.querySelector(`#lbl${settingUpper}`).classList.add(g_cssObj.settings_Disabled);
		_obj.appendChild(makeDisabledLabel(`lnk${settingUpper}`, 0, `${g_stateObj[_settingName]}${_unitName}`));
	}
}

/**
 * 設定画面用ラベルの作成
 * @param {string} _settingName 
 * @param {number} _adjY 
 * @param {string} _settingLabel 
 */
function createLblSetting(_settingName, _adjY = 0, _settingLabel = _settingName) {
	return createDivCss2Label(`lbl${_settingName}`, g_lblNameObj[_settingLabel], {
		x: 0, y: _adjY, w: 100,
	}, `settings_${_settingName}`);
}

/**
 * 設定メイン・汎用
 * @param {number} _scrollNum 
 * @param {string} _settingName
 * @param {string} _unitName
 */
function setSetting(_scrollNum, _settingName, _unitName = ``) {
	let settingNum = eval(`g_${_settingName}Num`);
	const settingList = eval(`g_${_settingName}s`);
	const settingMax = settingList.length - 1;

	if (_scrollNum > 0) {
		settingNum = (settingNum === settingMax ?
			0 : (settingNum + _scrollNum > settingMax ? settingMax : settingNum + _scrollNum));
	} else if (_scrollNum < 0) {
		settingNum = (settingNum === 0 ?
			settingMax : (settingNum + _scrollNum <= 0 ? 0 : settingNum + _scrollNum));
	}
	g_stateObj[_settingName] = settingList[settingNum];
	eval(`g_${_settingName}Num = settingNum`);
	document.querySelector(`#lnk${toCapitalize(_settingName)}`).textContent =
		`${g_stateObj[_settingName]}${_unitName}${g_localStorage[_settingName] === g_stateObj[_settingName] ? ' *' : ''}`;
}

/**
 * 無効化用ラベル作成
 * @param {string} _id 
 * @param {number} _heightPos 
 * @param {string} _defaultStr 
 */
function makeDisabledLabel(_id, _heightPos, _defaultStr) {
	return createDivCss2Label(_id, _defaultStr, {
		x: C_LEN_SETLBL_LEFT, y: C_LEN_SETLBL_HEIGHT * _heightPos,
	}, g_cssObj.settings_Disabled);
}

/**
 * 保存済みキーコンフィグ取得処理
 * @param {object} _localStorage 保存先のローカルストレージ名
 * @param {string} _extraKeyName 特殊キー名(通常キーは省略)
 */
function getKeyCtrl(_localStorage, _extraKeyName = ``) {
	const baseKeyCtrlPtn = _localStorage[`keyCtrlPtn${_extraKeyName}`];
	const basePtn = `${g_keyObj.currentKey}_${baseKeyCtrlPtn}`;
	const baseKeyNum = g_keyObj[`chara${basePtn}`].length;

	if (_localStorage[`keyCtrl${_extraKeyName}`] !== undefined) {
		g_keyObj.currentPtn = -1;
		const copyPtn = `${g_keyObj.currentKey}_-1`;
		g_keyObj[`keyCtrl${copyPtn}`] = [];
		g_keyObj[`keyCtrl${copyPtn}d`] = [];

		for (let j = 0; j < baseKeyNum; j++) {
			g_keyObj[`keyCtrl${copyPtn}`][j] = [];
			g_keyObj[`keyCtrl${copyPtn}d`][j] = [];

			for (let k = 0; k < g_keyObj[`keyCtrl${basePtn}`][j].length; k++) {
				g_keyObj[`keyCtrl${copyPtn}d`][j][k] = g_keyObj[`keyCtrl${copyPtn}`][j][k] = _localStorage[`keyCtrl${_extraKeyName}`][j][k];
			}
		}

		g_keyCopyLists.multiple.forEach(header => {
			if (g_keyObj[`${header}${basePtn}`] !== undefined) {
				g_keyObj[`${header}${copyPtn}`] = JSON.parse(JSON.stringify(g_keyObj[`${header}${basePtn}`]));
			}
		});
		g_keyCopyLists.simple.forEach(header => {
			g_keyObj[`${header}${copyPtn}`] = g_keyObj[`${header}${basePtn}`];
		});
	}
}

/**
 * 設定・オプション表示用ボタン
 * @param {string} _id 
 * @param {string} _name 初期設定文字
 * @param {number} _heightPos 上からの配置順
 * @param {function} _func 通常ボタン処理
 * @param {function} _cxtFunc 右クリック時の処理
 * @param {object} _overridePos 座標設定(既定を上書き)
 * @param {...any} _classes 追加するクラス
 */
function makeSettingLblCssButton(_id, _name, _heightPos, _func, { x, y, w, h, siz, cxtFunc = _ => true, ...rest } = {}, ..._classes) {
	const tmpObj = {
		x: x !== undefined ? x : C_LEN_SETLBL_LEFT,
		y: y !== undefined ? y : C_LEN_SETLBL_HEIGHT * _heightPos,
		w: w !== undefined ? w : C_LEN_SETLBL_WIDTH,
		h: h !== undefined ? h : C_LEN_SETLBL_HEIGHT,
		siz: siz !== undefined ? siz : C_SIZ_SETLBL,
		cxtFunc: cxtFunc !== undefined ? cxtFunc : _ => true,
	};
	return createCss2Button(_id, _name, _func, { ...tmpObj, ...rest }, g_cssObj.button_Default, ..._classes);
}

/**
 * 譜面変更セレクター用ボタン
 * @param {string} _id
 * @param {string} _name 初期設定文字
 * @param {number} _heightPos 上からの配置順
 * @param {function} _func
 */
function makeDifLblCssButton(_id, _name, _heightPos, _func, { x = 0, w = C_LEN_DIFSELECTOR_WIDTH, } = {}) {
	return createCss2Button(_id, _name, _func, {
		x: x, y: C_LEN_SETLBL_HEIGHT * _heightPos,
		w: w, h: C_LEN_SETLBL_HEIGHT,
		siz: C_SIZ_DIFSELECTOR,
		borderStyle: `solid`,
	}, g_cssObj.button_Default, g_cssObj.button_ON);
}

/**
 * 設定・オプション用の設定変更ミニボタン
 * @param {string} _id 
 * @param {string} _directionFlg 表示用ボタンのどちら側に置くかを設定。(R, RR:右、L, LL:左)
 * @param {number} _heightPos 上からの配置順
 * @param {function} _func 
 */
function makeMiniCssButton(_id, _directionFlg, _heightPos, _func, { dx = 0, dy = 0, dw = 0, dh = 0, dsiz = 0 } = {}) {
	return createCss2Button(`${_id}${_directionFlg}`, eval(`C_LBL_SETMINI${_directionFlg}`), _func, {
		x: eval(`C_LEN_SETMINI${_directionFlg}_LEFT`) + dx,
		y: C_LEN_SETLBL_HEIGHT * _heightPos + dy,
		w: C_LEN_SETMINI_WIDTH + dw, h: C_LEN_SETLBL_HEIGHT + dh, siz: C_SIZ_SETLBL + dsiz,
	}, g_cssObj.button_Mini);
}

/*-----------------------------------------------------------*/
/* Scene : SETTINGS-DISPLAY [lemon] */
/*-----------------------------------------------------------*/

function settingsDisplayInit() {

	clearWindow();
	drawDefaultBackImage(``);
	const divRoot = document.querySelector(`#divRoot`);
	g_baseDisp = `Display`;

	// 譜面初期情報ロード許可フラグ
	g_canLoadDifInfoFlg = false;

	// タイトル文字描画
	divRoot.appendChild(getTitleDivLabel(`lblTitle`, g_lblNameObj.display, 0, 15, `settings_Display`));

	// オプションボタン用の設置
	createSettingsDisplayWindow(`divRoot`);

	// ショートカットキーメッセージ
	divRoot.appendChild(
		createDivCss2Label(`scMsg`, g_lblNameObj.sdShortcutDesc, {
			x: 0, y: g_sHeight - 45, w: g_sWidth, h: 20, siz: C_SIZ_MAIN,
		})
	);

	// ユーザカスタムイベント(初期)
	if (typeof customSettingsDisplayInit === C_TYP_FUNCTION) {
		customSettingsDisplayInit();
		if (typeof customSettingsDisplayInit2 === C_TYP_FUNCTION) {
			customSettingsDisplayInit2();
		}
	}

	// ボタン描画
	multiAppend(divRoot,

		// タイトル画面へ戻る
		createCss2Button(`btnBack`, g_lblNameObj.b_back, _ => titleInit(), {}, g_cssObj.button_Back),

		// キーコンフィグ画面へ移動
		createCss2Button(`btnKeyConfig`, g_lblNameObj.b_keyConfig, _ => keyConfigInit(`Main`), {
			x: g_sWidth / 3,
		}, g_cssObj.button_Setting),

		// プレイ開始
		makePlayButton(_ => loadMusic()),

		// メイン設定へ戻る
		createCss2Button(`btnSettings`, `<`, _ => optionInit(), {
			x: g_sWidth / 2 - 175 - C_LEN_SETMINI_WIDTH / 2, y: 25,
			w: C_LEN_SETMINI_WIDTH, h: 40, title: g_msgObj.toSettings,
		}, g_cssObj.button_Mini)

	);

	// キー操作イベント（デフォルト）
	document.onkeydown = evt => {
		const setCode = transCode(evt.code);

		if (evt.repeat) {
			return blockCode(setCode);
		}

		if (setCode === `Enter`) {
			loadMusic();
		}
		return blockCode(setCode);
	}
	document.onkeyup = evt => { }
	document.oncontextmenu = _ => true;

	if (typeof skinSettingsDisplayInit === C_TYP_FUNCTION) {
		skinSettingsDisplayInit();
		if (typeof skinSettingsDisplayInit2 === C_TYP_FUNCTION) {
			skinSettingsDisplayInit2();
		}
	}
}

/**
 * 設定・オプション画面のラベル・ボタン処理の描画
 * @param {Object} _sprite 基準とするスプライト(ここで指定する座標は、そのスプライトからの相対位置)
 */
function createSettingsDisplayWindow(_sprite) {

	// 各ボタン用のスプライトを作成
	const optionWidth = (g_sWidth - 450) / 2;
	const childX = 25;
	const childY = 20;
	createSprite(_sprite, `optionsprite`, optionWidth, 65 + (g_sHeight - 500) / 2, 450, 325);

	// 設定名、縦位置、縦位置差分、幅差分、高さ差分
	const settingList = [
		[`appearance`, 8, 10, 0, 0],
		[`opacity`, 9, 10, 0, 0],
	];

	// 設定毎に個別のスプライトを作成し、その中にラベル・ボタン類を配置
	const displaySprite = createSprite(`optionsprite`, `displaySprite`, childX, childY + 10,
		optionWidth, C_LEN_SETLBL_HEIGHT * 5);
	const spriteList = setSpriteList(settingList);

	document.querySelector(`#${_sprite}`).appendChild(
		createDivCss2Label(`sdDesc`, g_lblNameObj.sdDesc, {
			x: 0, y: 65, w: g_sWidth, h: 20, siz: C_SIZ_MAIN,
		})
	);

	g_displays.forEach((name, j) => {
		makeDisplayButton(name, j % 7, Math.floor(j / 7));
	});

	// ---------------------------------------------------
	// 矢印の見え方 (Appearance)
	// 縦位置: 8
	createGeneralSetting(spriteList.appearance, `appearance`);

	// ---------------------------------------------------
	// 判定表示系の不透明度 (Opacity)
	// 縦位置: 9
	createGeneralSetting(spriteList.opacity, `opacity`, { unitName: `%` });

	/**
	 * Display表示/非表示ボタン
	 * @param {*} _name 
	 * @param {*} _heightPos 縦位置
	 * @param {*} _widthPos 横位置
	 */
	function makeDisplayButton(_name, _heightPos, _widthPos) {

		const flg = g_stateObj[`d_${_name.toLowerCase()}`];
		const list = [C_FLG_OFF, C_FLG_ON];

		if (g_headerObj[`${_name}Use`]) {
			displaySprite.appendChild(
				makeSettingLblCssButton(`lnk${_name}`, g_lblNameObj[`d_${toCapitalize(_name)}`], _heightPos, evt => {
					const displayFlg = g_stateObj[`d_${_name.toLowerCase()}`];
					const displayNum = list.findIndex(flg => flg === displayFlg);
					const nextDisplayFlg = list[(displayNum + 1) % list.length];
					g_stateObj[`d_${_name.toLowerCase()}`] = nextDisplayFlg;
					evt.target.classList.replace(g_cssObj[`button_${displayFlg}`], g_cssObj[`button_${nextDisplayFlg}`]);

					interlockingButton(g_headerObj, _name, nextDisplayFlg, displayFlg, true);
				}, {
					x: 30 + 180 * _widthPos,
					w: 170,
					title: g_msgObj[`d_${_name.toLowerCase()}`],
					borderStyle: `solid`,
				}, `button_${flg}`)
			);
		} else {
			displaySprite.appendChild(makeDisabledDisplayLabel(`lnk${_name}`, _heightPos, _widthPos,
				g_lblNameObj[`d_${toCapitalize(_name)}`] + `:${g_headerObj[`${_name}Set`]}`, g_headerObj[`${_name}Set`]));
		}

		/**
		 * 無効化用ラベル作成
		 * @param {string} _id 
		 * @param {number} _heightPos 
		 * @param {number} _widthPos
		 * @param {string} _defaultStr 
		 * @param {string} _flg
		 */
		function makeDisabledDisplayLabel(_id, _heightPos, _widthPos, _defaultStr, _flg) {
			return createDivCss2Label(_id, _defaultStr, {
				x: 30 + 180 * _widthPos, y: 3 + C_LEN_SETLBL_HEIGHT * _heightPos,
				w: 170, siz: C_SIZ_DIFSELECTOR,
			}, g_cssObj[`button_Disabled${flg}`]);
		}
	}
}

/**
 * Displayボタンを切り替えたときに連動して切り替えるボタンの設定
 * @param {object} _headerObj 
 * @param {string} _name 
 * @param {string} _current 変更元
 * @param {string} _next 変更先
 * @param {boolean} _buttonFlg ボタンフラグ (false: 初期, true: ボタン)
 */
function interlockingButton(_headerObj, _name, _current, _next, _buttonFlg = false) {
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
}

/*-----------------------------------------------------------*/
/* Scene : KEYCONFIG [orange] */
/*-----------------------------------------------------------*/

/**
 * キーコンフィグ画面初期化
 */
function keyConfigInit(_kcType = g_kcType) {

	clearWindow();
	drawDefaultBackImage(``);
	const divRoot = document.querySelector(`#divRoot`);
	g_kcType = _kcType;

	// 譜面初期情報ロード許可フラグ
	g_canLoadDifInfoFlg = false;

	multiAppend(divRoot,

		// キーコンフィグ画面タイトル
		getTitleDivLabel(`lblTitle`,
			`<div class="settings_Title">${g_lblNameObj.key}</div><div class="settings_Title2">${g_lblNameObj.config}</div>`
				.replace(/[\t\n]/g, ``), 0, 15, g_cssObj.flex_centering),

		createDivCss2Label(`kcDesc`, g_lblNameObj.kcDesc, {
			x: 0, y: 65, w: g_sWidth, h: 20, siz: C_SIZ_MAIN,
		}),

	);

	// キーの一覧を表示
	const keyconSprite = createSprite(`divRoot`, `keyconSprite`, 0, 100 + (g_sHeight - 500) / 2, g_sWidth, 300);
	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;
	const posMax = (g_keyObj[`divMax${keyCtrlPtn}`] !== undefined ?
		g_keyObj[`divMax${keyCtrlPtn}`] : g_keyObj[`pos${keyCtrlPtn}`][keyNum - 1] + 1);
	const divideCnt = g_keyObj[`div${keyCtrlPtn}`] - 1;

	[`blank`, `scale`].forEach(header => {
		g_keyObj[header] = (g_keyObj[`${header}${keyCtrlPtn}`] !== undefined ?
			g_keyObj[`${header}${keyCtrlPtn}`] : g_keyObj[`${header}_def`]);
	});
	keyconSprite.style.transform = `scale(${g_keyObj.scale})`;
	const kWidth = parseInt(keyconSprite.style.width);

	/** 同行の中心から見た場合の位置(x座標) */
	let stdPos = 0;
	/** 行位置 */
	let dividePos = 0;
	let posj = 0;

	for (let j = 0; j < keyNum; j++) {

		posj = g_keyObj[`pos${keyCtrlPtn}`][j];
		if (posj > divideCnt) {
			stdPos = posj - (posMax + divideCnt) / 2;
			dividePos = 1;
		} else {
			stdPos = posj - divideCnt / 2;
			dividePos = 0;
		}

		// キーコンフィグ表示用の矢印・おにぎりを表示
		const keyconX = g_keyObj.blank * stdPos + (kWidth - C_ARW_WIDTH) / 2;
		const keyconY = C_KYC_HEIGHT * dividePos;
		const colorPos = g_keyObj[`color${keyCtrlPtn}`][j];
		const arrowColor = getKeyConfigColor(j, colorPos);

		if (g_headerObj.setShadowColor[colorPos] !== ``) {
			// 矢印の塗り部分
			const shadowColor = (g_headerObj.setShadowColor[colorPos] === `Default` ? arrowColor :
				g_headerObj.setShadowColor[colorPos]);
			keyconSprite.appendChild(
				createColorObject2(`arrowShadow${j}`, {
					x: keyconX, y: keyconY,
					background: shadowColor, rotate: g_keyObj[`stepRtn${keyCtrlPtn}`][j], styleName: `Shadow`,
					opacity: 0.5,
				})
			);
		}
		keyconSprite.appendChild(createColorObject2(`arrow${j}`, {
			x: keyconX, y: keyconY,
			background: arrowColor, rotate: g_keyObj[`stepRtn${keyCtrlPtn}`][j],
		}));

		for (let k = 0; k < g_keyObj[`keyCtrl${keyCtrlPtn}`][j].length; k++) {
			g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k] = setVal(g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k], 0, C_TYP_NUMBER);
			g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k] = setVal(g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k], 0, C_TYP_NUMBER);

			keyconSprite.appendChild(
				createDivCss2Label(`keycon${j}_${k}`, g_kCd[g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]], {
					x: keyconX, y: 50 + C_KYC_REPHEIGHT * k + keyconY,
					w: C_ARW_WIDTH, h: C_ARW_WIDTH, siz: C_SIZ_JDGCNTS,
				})
			);

			// キーに色付け
			if (g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k] !== g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]) {
				removeClassList(j, k);
				document.querySelector(`#keycon${j}_${k}`).classList.add(g_cssObj.keyconfig_Changekey);
			} else if (g_keyObj.currentPtn === -1) {
				removeClassList(j, k);
				document.querySelector(`#keycon${j}_${k}`).classList.add(g_cssObj.keyconfig_Defaultkey);
			}
		}
	}
	posj = g_keyObj[`pos${keyCtrlPtn}`][0];

	// カーソルの作成
	const cursor = keyconSprite.appendChild(createImg(`cursor`, g_imgObj.cursor,
		(kWidth - C_ARW_WIDTH) / 2 + g_keyObj.blank * (posj - divideCnt / 2) - 10, 45, 15, 30));
	cursor.style.transitionDuration = `0.125s`;

	/**
	 * ConfigTypeの制御
	 * @param {event} _evt 
	 * @param {number} _scrollNum 
	 */
	function setConfigType(_evt, _scrollNum = 1) {
		const typeNum = g_keycons.configTypes.findIndex(value => value === g_kcType);
		const nextNum = (typeNum + g_keycons.configTypes.length + _scrollNum) % g_keycons.configTypes.length;
		g_kcType = g_keycons.configTypes[nextNum];
		g_keycons.configFunc[nextNum](kWidth, divideCnt, keyCtrlPtn, false);
		_evt.target.textContent = g_kcType;
	}

	/**
	 * ColorTypeの制御
	 * @param {number} _scrollNum 
	 */
	function setColorType(_scrollNum = 1) {
		const typeNum = g_keycons.colorTypes.findIndex(value => value === g_colorType);
		const nextNum = (typeNum + g_keycons.colorTypes.length + _scrollNum) % g_keycons.colorTypes.length;
		g_colorType = g_keycons.colorTypes[nextNum];
		if (g_headerObj.colorUse) {
			g_stateObj.d_color = g_keycons.colorDefs[nextNum];
		}

		g_headerObj.setColor = JSON.parse(JSON.stringify(g_headerObj[`setColor${g_colorType}`]));
		for (let j = 0; j < g_headerObj.setColorInit.length; j++) {
			g_headerObj.frzColor[j] = JSON.parse(JSON.stringify(g_headerObj[`frzColor${g_colorType}`][j]));
		}
		for (let j = 0; j < keyNum; j++) {
			$id(`arrow${j}`).background = getKeyConfigColor(j, g_keyObj[`color${keyCtrlPtn}`][j]);
		}
		lnkColorType.textContent = `${g_colorType}${g_localStorage.colorType === g_colorType ? ' *' : ''}`;
	}

	multiAppend(divRoot,

		// ショートカットキーメッセージ
		createDivCss2Label(
			`scMsg`,
			g_lblNameObj.kcShortcutDesc.split(`{0}`).join(g_kCd[g_headerObj.keyTitleBack])
				.split(`{1}`).join(g_kCd[g_headerObj.keyRetry]),
			{
				x: 0, y: g_sHeight - 45, w: g_sWidth, h: 20, siz: C_SIZ_MAIN,
			}),

		// 別キーモード警告メッセージ
		createDivCss2Label(
			`kcMsg`,
			hasVal(g_keyObj[`transKey${keyCtrlPtn}`]) ? g_lblNameObj.transKeyDesc : ``,
			{
				x: 0, y: g_sHeight - 25, w: g_sWidth, h: 20, siz: C_SIZ_MAIN,
			}, g_cssObj.keyconfig_warning
		),

		// キーコンフィグタイプ切替ボタン
		createDivCss2Label(`lblKcType`, g_lblNameObj.ConfigType, {
			x: 30, y: 10, w: 70,
		}, g_cssObj.keyconfig_ConfigType),

		makeSettingLblCssButton(`lnkKcType`, g_kcType, 0, evt => setConfigType(evt), {
			x: 30, y: 35, w: 100,
			cxtFunc: evt => setConfigType(evt, -1),
		}),

		// キーカラータイプ切替ボタン
		createDivCss2Label(`lblcolorType`, g_lblNameObj.ColorType, {
			x: g_sWidth - 120, y: 10, w: 70,
		}, g_cssObj.keyconfig_ColorType),

		makeSettingLblCssButton(`lnkColorType`, g_colorType, 0, _ => setColorType(), {
			x: g_sWidth - 130, y: 35, w: 100,
			cxtFunc: _ => setColorType(-1),
		}),

	);
	setColorType(0);

	/**
	 * キーコンフィグ用の矢印色を取得
	 * @param {number} _colorPos 
	 */
	function getKeyConfigColor(_j, _colorPos) {
		let arrowColor = g_headerObj.setColor[_colorPos];
		if (typeof g_keyObj[`assistPos${keyCtrlPtn}`] === C_TYP_OBJECT &&
			!g_autoPlaysBase.includes(g_stateObj.autoPlay)) {
			if (g_keyObj[`assistPos${keyCtrlPtn}`][g_stateObj.autoPlay][_j] === 1) {
				arrowColor = g_headerObj.setDummyColor[_colorPos];
			};
		}
		return arrowColor;
	}

	// ユーザカスタムイベント(初期)
	if (typeof customKeyConfigInit === C_TYP_FUNCTION) {
		customKeyConfigInit();
		if (typeof customKeyConfigInit2 === C_TYP_FUNCTION) {
			customKeyConfigInit2();
		}
	}

	// キーパターン表示
	let lblTransKey = ``;
	if (hasVal(g_keyObj[`transKey${g_keyObj.currentKey}_${g_keyObj.currentPtn}`])) {
		lblTransKey = '(' + setVal(g_keyObj[`transKey${g_keyObj.currentKey}_${g_keyObj.currentPtn}`], ``, C_TYP_STRING) + ')';
	}

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

	// ラベル・ボタン描画
	multiAppend(divRoot,

		// 設定画面へ戻る
		createCss2Button(`btnBack`, `To Settings`, _ => {
			g_currentj = 0;
			g_currentk = 0;
			g_prevKey = 0;

			if (g_baseDisp === `Settings`) {
				optionInit();
			} else {
				settingsDisplayInit();
			}
		}, {
			x: g_sWidth / 3, y: g_sHeight - 75,
			w: g_sWidth / 3, h: C_BTN_HEIGHT / 2, siz: C_LBL_BTNSIZE * 2 / 3,
		}, g_cssObj.button_Back),

		createDivCss2Label(`lblPattern`, `${g_lblNameObj.KeyPattern}: ${g_keyObj.currentPtn === -1 ? 'Self' : g_keyObj.currentPtn + 1}${lblTransKey}`, {
			x: g_sWidth / 5, y: g_sHeight - 100,
			w: g_sWidth * 3 / 5, h: C_BTN_HEIGHT / 2,
		}),

		// パターン変更ボタン描画(右回り)
		createCss2Button(`btnPtnChangeR`, `>>`, _ => {
			const tempPtn = searchPattern(g_keyObj.currentPtn + 1, 1, g_headerObj.transKeyUse, `transKey`);
			g_keyObj.currentPtn = (g_keyObj[`keyCtrl${g_keyObj.currentKey}_${tempPtn}`] !== undefined ?
				tempPtn : (g_keyObj[`keyCtrl${g_keyObj.currentKey}_-1`] !== undefined ? -1 : 0));

			keyConfigInit();
			const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
			const divideCnt = g_keyObj[`div${keyCtrlPtn}`] - 1;
			eval(`resetCursor${g_kcType}`)(kWidth, divideCnt, keyCtrlPtn);
		}, {
			x: g_sWidth * 4 / 5, y: g_sHeight - 100,
			w: g_sWidth / 5, h: C_BTN_HEIGHT / 2, siz: C_LBL_BTNSIZE * 2 / 3,
		}, g_cssObj.button_Setting),

		// パターン変更ボタン描画(左回り)
		createCss2Button(`btnPtnChangeL`, `<<`, _ => {
			const tempPtn = searchPattern(g_keyObj.currentPtn - 1, -1, g_headerObj.transKeyUse, `transKey`);
			g_keyObj.currentPtn = (g_keyObj[`keyCtrl${g_keyObj.currentKey}_${tempPtn}`] !== undefined ?
				tempPtn : searchPattern(searchPattern(0, 1) - 1, -1, g_headerObj.transKeyUse, `transKey`));

			keyConfigInit();
			const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
			const divideCnt = g_keyObj[`div${keyCtrlPtn}`] - 1;
			eval(`resetCursor${g_kcType}`)(kWidth, divideCnt, keyCtrlPtn);
		}, {
			x: 0, y: g_sHeight - 100,
			w: g_sWidth / 5, h: C_BTN_HEIGHT / 2, siz: C_LBL_BTNSIZE * 2 / 3,
		}, g_cssObj.button_Setting),

		// キーコンフィグリセットボタン描画
		createCss2Button(`btnReset`, g_lblNameObj.b_reset, _ => {
			if (window.confirm(g_msgObj.keyResetConfirm)) {
				g_keyObj.currentKey = g_headerObj.keyLabels[g_stateObj.scoreId];
				const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
				const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;
				const divideCnt = g_keyObj[`div${keyCtrlPtn}`] - 1;

				for (let j = 0; j < keyNum; j++) {
					for (let k = 0; k < g_keyObj[`keyCtrl${keyCtrlPtn}`][j].length; k++) {
						g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k] = setVal(g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k], 0, C_TYP_NUMBER);
						document.querySelector(`#keycon${j}_${k}`).textContent = g_kCd[g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]];
						removeClassList(j, k);
						document.querySelector(`#keycon${j}_${k}`).classList.add(
							g_keyObj.currentPtn === -1 ? g_cssObj.keyconfig_Defaultkey : g_cssObj.title_base
						);
					}
				}
				eval(`resetCursor${g_kcType}`)(kWidth, divideCnt, keyCtrlPtn);
			}
		}, {
			x: 0, y: g_sHeight - 75,
			w: g_sWidth / 3, h: C_BTN_HEIGHT / 2, siz: C_LBL_BTNSIZE * 2 / 3,
		}, g_cssObj.button_Reset)

	);

	// キーボード押下時処理
	document.onkeydown = evt => {
		const setCode = transCode(evt.code);

		if (evt.repeat) {
			return blockCode(setCode);
		}

		const keyCdObj = document.querySelector(`#keycon${g_currentj}_${g_currentk}`);
		const cursor = document.querySelector(`#cursor`);
		const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;
		let setKey = g_kCdN.findIndex(kCd => kCd === setCode);
		g_inputKeyBuffer[setCode] = true;

		// 全角切替、BackSpace、Deleteキー、Escキーは割り当て禁止
		// また、直前と同じキーを押した場合(BackSpaceを除く)はキー操作を無効にする
		const disabledKeys = [229, 240, 242, 243, 244, 91, 29, 28, 27, g_prevKey];
		if (disabledKeys.includes(setKey) || g_kCdN[setKey] === undefined) {
			makeInfoWindow(g_msgInfoObj.I_0002, `fadeOut0`);
			return;
		} else if ((setKey === 46 && g_currentk === 0) ||
			(keyIsDown(`MetaLeft`) && keyIsDown(`ShiftLeft`))) {
			return;
		}
		if (setKey === 8) {
		} else {
			if (setKey === 46) {
				setKey = 0;
			}
			if (g_keyObj[`keyCtrl${keyCtrlPtn}d`][g_currentj][g_currentk] !== setKey) {
				removeClassList(g_currentj, g_currentk);
				keyCdObj.classList.add(g_cssObj.keyconfig_Changekey);
			}
			keyCdObj.textContent = g_kCd[setKey];
			g_keyObj[`keyCtrl${keyCtrlPtn}`][g_currentj][g_currentk] = setKey;
			g_prevKey = setKey;
		}

		// 後続に代替キーが存在する場合
		if (g_currentk < g_keyObj[`keyCtrl${keyCtrlPtn}`][g_currentj].length - 1 &&
			g_kcType !== `Main`) {
			g_currentk++;
			cursor.style.top = `${parseInt(cursor.style.top) + C_KYC_REPHEIGHT}px`;

		} else if (g_currentj < keyNum - 1) {
			// 他の代替キーが存在せず、次の矢印がある場合
			g_currentj++;
			g_currentk = 0;

			// 代替キーのみの場合は次の代替キーがあるキーを探す
			if (g_kcType === `Replaced`) {
				for (let j = g_currentj; j < keyNum + g_currentj; j++) {
					if (g_keyObj[`keyCtrl${keyCtrlPtn}`][j % keyNum][1] !== undefined) {
						g_currentj = j % keyNum;
						g_currentk = 1;
						break;
					}
				}
			}
			setKeyConfigCursor(kWidth, divideCnt, keyCtrlPtn, keyNum);

		} else {
			// 全ての矢印・代替キーの巡回が終わった場合は元の位置に戻す
			eval(`resetCursor${g_kcType}`)(kWidth, divideCnt, keyCtrlPtn);
		}
		return blockCode(setCode);
	}

	if (typeof skinKeyConfigInit === C_TYP_FUNCTION) {
		skinKeyConfigInit();
		if (typeof skinKeyConfigInit2 === C_TYP_FUNCTION) {
			skinKeyConfigInit2();
		}
	}

	document.onkeyup = evt => {
		const setCode = transCode(evt.code);
		g_inputKeyBuffer[`MetaLeft`] = false;
		g_inputKeyBuffer[setCode] = false;
	}

	document.oncontextmenu = _ => false;
}

/**
 * キーコンフィグ用カーソルのリセット
 * @param {number} _width 
 * @param {number} _divideCnt 
 * @param {string} _keyCtrlPtn 
 * @param {boolean} _resetCursorFlg
 * @param {number} _resetPos
 */
function resetCursor(_width, _divideCnt, _keyCtrlPtn, _resetCursorFlg = true, _resetPos = 0) {

	const keyNum = g_keyObj[`chara${_keyCtrlPtn}`].length;
	if (_resetCursorFlg) {
		g_currentj = 0;
		g_currentk = 0;
		g_prevKey = -1;

		for (let j = 0; j < keyNum; j++) {
			if (g_keyObj[`keyCtrl${_keyCtrlPtn}`][j][_resetPos] !== undefined) {
				g_currentj = j;
				g_currentk = _resetPos;
				break;
			}
		}
	} else {
		if (g_keyObj[`keyCtrl${_keyCtrlPtn}`][g_currentj][_resetPos] === undefined) {
			for (let j = g_currentj; j < keyNum + g_currentj; j++) {
				if (g_keyObj[`keyCtrl${_keyCtrlPtn}`][j % keyNum][_resetPos] !== undefined) {
					g_currentj = j % keyNum;
					g_currentk = _resetPos;
					break;
				}
			}
		} else {
			g_currentk = _resetPos;
		}
		g_prevKey = -1;
	}
	setKeyConfigCursor(_width, _divideCnt, _keyCtrlPtn, keyNum);
}

/**
 * カーソル位置の設定
 * @param {number} _width 
 * @param {number} _divideCnt 
 * @param {string} _keyCtrlPtn 
 * @param {number} _keyNum 
 */
function setKeyConfigCursor(_width, _divideCnt, _keyCtrlPtn, _keyNum) {
	const posj = g_keyObj[`pos${_keyCtrlPtn}`][g_currentj];
	const posMax = (g_keyObj[`divMax${_keyCtrlPtn}`] !== undefined ?
		g_keyObj[`divMax${_keyCtrlPtn}`] : g_keyObj[`pos${_keyCtrlPtn}`][_keyNum - 1] + 1);
	let stdPos;
	let dividePos;
	if (posj > _divideCnt) {
		stdPos = posj - (posMax + _divideCnt) / 2;
		dividePos = 1;
	} else {
		stdPos = posj - _divideCnt / 2;
		dividePos = 0;
	}

	const cursor = document.querySelector(`#cursor`);
	cursor.style.left = `${(_width - C_ARW_WIDTH) / 2 + g_keyObj.blank * stdPos - 10}px`;
	if (g_currentk >= 1) {
		cursor.style.top = `${45 + C_KYC_REPHEIGHT + C_KYC_HEIGHT * dividePos}px`;
	} else {
		if (g_kcType === `Replaced`) {
			g_kcType = C_FLG_ALL;
		}
		lnkKcType.textContent = g_kcType;
		cursor.style.top = `${45 + C_KYC_HEIGHT * dividePos}px`;
	}
}

/**
 * キーコンフィグ用カーソルのリセット(ConfigType:Main)
 * @param {number} _width
 * @param {number} _divideCnt
 * @param {string} _keyCtrlPtn
 * @param {boolean} _resetCursorFlg
 */
function resetCursorMain(_width, _divideCnt, _keyCtrlPtn, _resetCursorFlg = true) {
	resetCursor(_width, _divideCnt, _keyCtrlPtn, _resetCursorFlg);
}

/**
 * キーコンフィグ用カーソルのリセット(ConfigType:Replaced)
 * @param {number} _width 
 * @param {number} _divideCnt 
 * @param {string} _keyCtrlPtn 
 * @param {boolean} _resetCursorFlg
 */
function resetCursorReplaced(_width, _divideCnt, _keyCtrlPtn, _resetCursorFlg = true) {
	resetCursor(_width, _divideCnt, _keyCtrlPtn, _resetCursorFlg, 1);
}

/**
 * キーコンフィグ用カーソルのリセット(ConfigType:ALL)
 * @param {number} _width 
 * @param {number} _divideCnt 
 * @param {string} _keyCtrlPtn 
 * @param {boolean} _resetCursorFlg
 */
function resetCursorALL(_width, _divideCnt, _keyCtrlPtn, _resetCursorFlg = true) {
	resetCursor(_width, _divideCnt, _keyCtrlPtn, _resetCursorFlg);
}

/**
 * キーコンフィグ画面の対応キー色変更
 * @param {number} _j 
 * @param {number} _k 
 */
function removeClassList(_j, _k) {
	const obj = document.querySelector(`#keycon${_j}_${_k}`);
	if (obj.classList.contains(g_cssObj.keyconfig_Changekey)) {
		obj.classList.remove(g_cssObj.keyconfig_Changekey);
	}
	if (obj.classList.contains(g_cssObj.keyconfig_Defaultkey)) {
		obj.classList.remove(g_cssObj.keyconfig_Defaultkey);
	}
	if (obj.classList.contains(g_cssObj.title_base)) {
		obj.classList.remove(g_cssObj.title_base);
	}
}

/*-----------------------------------------------------------*/
/* Scene : LOADING [strawberry] */
/*-----------------------------------------------------------*/

/**
 * 読込画面初期化
 */
function loadingScoreInit() {
	// 譜面データの読み込み
	loadDos(_ => {
		const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
		const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;
		g_headerObj.blankFrame = g_headerObj.blankFrameDef;

		// ユーザカスタムイベント
		if (typeof customPreloadingInit === C_TYP_FUNCTION) {
			customPreloadingInit();
			if (typeof customPreloadingInit2 === C_TYP_FUNCTION) {
				customPreloadingInit2();
			}
		}
		if (typeof skinPreloadingInit === C_TYP_FUNCTION) {
			skinPreloadingInit();
			if (typeof skinPreloadingInit2 === C_TYP_FUNCTION) {
				skinPreloadingInit2();
			}
		}

		// 譜面初期情報ロード許可フラグ
		// (タイトルバック時保存したデータを設定画面にて再読み込みするため、
		//  ローカルストレージ保存時はフラグを解除しない)
		if (!g_stateObj.dataSaveFlg || hasVal(g_keyObj[`transKey${keyCtrlPtn}`])) {
			g_canLoadDifInfoFlg = false;
		}

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
		g_scoreObj.baseFrame;

		// フレームごとの速度を取得（配列形式）
		let speedOnFrame = setSpeedOnFrame(g_scoreObj.speedData, lastFrame);

		// Motionオプション適用時の矢印別の速度を取得（配列形式）
		const motionOnFrame = setMotionOnFrame();
		g_workObj.motionOnFrames = JSON.parse(JSON.stringify(motionOnFrame));

		// 最初のフレームで出現する矢印が、ステップゾーンに到達するまでのフレーム数を取得
		const firstFrame = (g_scoreObj.frameNum === 0 ? 0 : g_scoreObj.frameNum + g_headerObj.blankFrame);
		let arrivalFrame = getFirstArrivalFrame(firstFrame, speedOnFrame, motionOnFrame);

		// キーパターン(デフォルト)に対応する矢印番号を格納
		convertreplaceNums();

		const setData = (_data, _minLength = 1) => {
			return (_data !== undefined && _data.length >= _minLength ? _data.concat() : []);
		}

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
							g_scoreObj[`${name}Data`][j] = JSON.parse(JSON.stringify(tmpObj[`${name}Data`][j]));
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
			};
			shuffleGroupMap[_val].push(_i);
		});
		const shuffleGroup = Object.values(shuffleGroupMap);

		// Mirror,Random,S-Randomの適用
		if (g_stateObj.shuffle === `Mirror`) {
			applyMirror(keyNum, shuffleGroup);
		} else if (g_stateObj.shuffle === `Random`) {
			applyRandom(keyNum, shuffleGroup);
		} else if (g_stateObj.shuffle === `Random+`) {
			applyRandom(keyNum, [[...Array(keyNum).keys()]]);
		} else if (g_stateObj.shuffle === `S-Random`) {
			applySRandom(keyNum, shuffleGroup, `arrow`, `frz`);
			applySRandom(keyNum, shuffleGroup, `dummyArrow`, `dummyFrz`);
		} else if (g_stateObj.shuffle === `S-Random+`) {
			applySRandom(keyNum, [[...Array(keyNum).keys()]], `arrow`, `frz`);
			applySRandom(keyNum, [[...Array(keyNum).keys()]], `dummyArrow`, `dummyFrz`);
		}

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
		for (let j = 0; j < keyNum; j++) {
			g_allArrow += (isNaN(parseFloat(g_scoreObj.arrowData[j][0])) ? 0 : g_scoreObj.arrowData[j].length);
			g_allFrz += (isNaN(parseFloat(g_scoreObj.frzData[j][0])) ? 0 : g_scoreObj.frzData[j].length);
		}

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
		if (typeof customLoadingInit === C_TYP_FUNCTION) {
			customLoadingInit();
			if (typeof customLoadingInit2 === C_TYP_FUNCTION) {
				customLoadingInit2();
			}
		}

		const tempId = setInterval(() => {
			const executeMain = _ => {
				clearInterval(tempId);
				MainInit();
			}
			if (g_audio.duration !== undefined) {
				if (g_userAgent.indexOf(`firefox`) !== -1) {
					if (g_preloadImgs.every(v => g_loadObj[v] === true)) {
						executeMain();
					}
				} else {
					executeMain();
				}
			}
		}, 100);
	});
}

function setScoreIdHeader(_scoreId = 0, _scoreLockFlg = false) {
	if (_scoreId > 0 && _scoreLockFlg === false) {
		return Number(_scoreId) + 1;
	}
	return ``;
}

/**
 * Mirror,Randomの適用
 * @param {number} _keyNum
 * @param {array} _shuffleGroup
 * @param {array} _style
 */
function applyShuffle(_keyNum, _shuffleGroup, _style) {
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
		const tmpData = JSON.parse(JSON.stringify(g_scoreObj[`${type}Data`]));
		for (let i = 0; i < _keyNum; i++) {
			g_scoreObj[`${type}Data`][i] = tmpData[index[i]] || [];
		}
	});
}

/**
 * Mirrorの適用
 * @param {number} _keyNum
 * @param {array} _shuffleGroup
 */
function applyMirror(_keyNum, _shuffleGroup) {
	// シャッフルグループごとにミラー
	const style = JSON.parse(JSON.stringify(_shuffleGroup)).map(_group => _group.reverse());
	applyShuffle(_keyNum, _shuffleGroup, style);
}

/**
 * Randomの適用
 * @param {number} _keyNum
 * @param {array} _shuffleGroup
 */
function applyRandom(_keyNum, _shuffleGroup) {
	// シャッフルグループごとにシャッフル(Fisher-Yates)
	const style = JSON.parse(JSON.stringify(_shuffleGroup)).map(_group => {
		for (let i = _group.length - 1; i > 0; i--) {
			const random = Math.floor(Math.random() * (i + 1));
			const tmp = _group[i];
			_group[i] = _group[random];
			_group[random] = tmp;
		}
		return _group;
	});
	applyShuffle(_keyNum, _shuffleGroup, style);
}

/**
 * S-Randomの適用
 * @param {number} _keyNum
 * @param {array} _shuffleGroup
 */
function applySRandom(_keyNum, _shuffleGroup, _arrowHeader, _frzHeader) {

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
}

/**
 * 譜面データの分解
 * @param {object} _dosObj 
 * @param {number} _scoreId 譜面番号
 * @param {number} _preblankFrame 補完フレーム数
 * @param {string} _dummyNo ダミー用譜面番号添え字
 * @param {string} _keyCtrlPtn 選択キー及びパターン
 * @param {boolean} _scoreAnalyzeFlg (default : false)
 */
function scoreConvert(_dosObj, _scoreId, _preblankFrame, _dummyNo = ``,
	_keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`, _scoreAnalyzeFlg = false) {

	// 矢印群の格納先
	const obj = {};

	const scoreIdHeader = setScoreIdHeader(_scoreId, g_stateObj.scoreLockFlg);
	const keyNum = g_keyObj[`chara${_keyCtrlPtn}`].length;
	obj.arrowData = [];
	obj.frzData = [];
	obj.dummyArrowData = [];
	obj.dummyFrzData = [];
	const headerAdjustment = parseInt(g_headerObj.adjustment[_scoreId] || g_headerObj.adjustment[0]);
	const realAdjustment = parseInt(g_stateObj.adjustment) + headerAdjustment + _preblankFrame;
	g_stateObj.realAdjustment = realAdjustment;
	const blankFrame = g_headerObj.blankFrame;
	const calcFrame = _frame => Math.round((parseInt(_frame) - blankFrame) / g_headerObj.playbackRate + blankFrame + realAdjustment);

	for (let j = 0; j < keyNum; j++) {

		// 矢印データの分解
		const arrowName = g_keyObj[`chara${_keyCtrlPtn}`][j];
		obj.arrowData[j] = storeArrowData(_dosObj[`${arrowName}${scoreIdHeader}_data`]);

		if (g_stateObj.dummyId !== ``) {
			obj.dummyArrowData[j] = storeArrowData(_dosObj[`${arrowName}${_dummyNo}_data`]);
		}

		// 矢印名からフリーズアロー名への変換
		let frzName = g_keyObj[`chara${_keyCtrlPtn}`][j].replace(`leftdia`, `frzLdia`);
		frzName = frzName.replace(`rightdia`, `frzRdia`);
		frzName = frzName.replace(`left`, `frzLeft`);
		frzName = frzName.replace(`down`, `frzDown`);
		frzName = frzName.replace(`up`, `frzUp`);
		frzName = frzName.replace(`right`, `frzRight`);
		frzName = frzName.replace(`space`, `frzSpace`);
		frzName = frzName.replace(`iyo`, `frzIyo`);
		frzName = frzName.replace(`gor`, `frzGor`);
		frzName = frzName.replace(`oni`, `foni`);

		if (frzName.indexOf(`frz`) === -1 && frzName.indexOf(`foni`) === -1) {
			if ((frzName.startsWith(`s`)) || frzName.startsWith(`t`) ||
				(frzName.startsWith(`a`) && !frzName.startsWith(`arrow`))) {
				frzName = frzName.replace(frzName.slice(1), `frz${toCapitalize(frzName.slice(1))}`);
			} else {
				frzName = frzName.replace(frzName, `frz${toCapitalize(frzName)}`);
			}
		}

		// フリーズアローデータの分解 (2つで1セット)
		obj.frzData[j] = storeArrowData(_dosObj[`${frzName}${scoreIdHeader}_data`]);

		if (g_stateObj.dummyId !== ``) {
			obj.dummyFrzData[j] = storeArrowData(_dosObj[`${frzName}${_dummyNo}_data`]);
		}
	}

	/**
	 * 矢印データの格納
	 * @param {array} _data 
	 */
	function storeArrowData(_data) {
		let arrowData = [];

		if (_data !== undefined) {
			const tmpData = _data.split(`\r`).join(``).split(`\n`).join(``);
			if (tmpData !== undefined) {
				arrowData = tmpData.split(`,`);
				if (isNaN(parseFloat(arrowData[0]))) {
				} else {
					arrowData = arrowData.map(data => calcFrame(data));
				}
			}
		}
		return arrowData;
	}

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
	g_typeLists.color.forEach(sprite =>
		obj[`${sprite}Data`] = setColorData(sprite, scoreIdHeader));

	if (_scoreAnalyzeFlg) {
		return obj;
	}

	// 矢印モーション（個別）データの分解（3～4つで1セット, セット毎の改行区切り）
	obj.arrowCssMotionData = setCssMotionData(`arrow`, scoreIdHeader);
	obj.frzCssMotionData = setCssMotionData(`frz`, scoreIdHeader);
	obj.dummyArrowCssMotionData = setCssMotionData(`arrow`, _dummyNo);
	obj.dummyFrzCssMotionData = setCssMotionData(`frz`, _dummyNo);

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

	/**
	 * 速度変化データの分解・格納（フレーム数, 矢印番号）
	 * @param {string} _header 
	 * @param {number} _scoreNo 
	 * @param {string} _footer 
	 */
	function setSpeedData(_header, _scoreNo, _footer = `_data`) {
		let speedData = [];

		if (hasVal(_dosObj[`${_header}${_scoreNo}${_footer}`]) && g_stateObj.d_speed === C_FLG_ON) {
			let speedIdx = 0;
			const tmpArrayData = _dosObj[`${_header}${_scoreNo}${_footer}`].split(`\r`).join(`\n`).split(`\n`);

			tmpArrayData.filter(data => hasVal(data)).forEach(tmpData => {
				const tmpSpeedData = tmpData.split(`,`);
				for (let k = 0; k < tmpSpeedData.length; k += 2) {
					if (!hasVal(tmpSpeedData[k])) {
						continue;
					} else if (tmpSpeedData[k + 1] === `-`) {
						break;
					}
					speedData[speedIdx] = calcFrame(setVal(tmpSpeedData[k], ``, C_TYP_CALC));
					speedData[speedIdx + 1] = setVal(tmpSpeedData[k + 1], 1, C_TYP_CALC);
					speedIdx += 2;
				}
			});
		}

		return speedData;
	}

	/**
	 * 色変化データの分解・格納（フレーム数, 矢印番号）
	 * @param {string} _header 
	 * @param {number} _scoreNo 
	 */
	function setColorData(_header, _scoreNo) {
		let colorData = [];

		if (hasVal(_dosObj[`${_header}${_scoreNo}_data`]) && g_stateObj.d_color === C_FLG_ON) {
			let colorIdx = 0;
			const tmpArrayData = _dosObj[`${_header}${_scoreNo}_data`].split(`\r`).join(`\n`).split(`\n`);

			tmpArrayData.filter(data => hasVal(data)).forEach(tmpData => {
				const tmpColorData = tmpData.split(`,`);
				for (let k = 0; k < tmpColorData.length; k += 3) {
					if (!hasVal(tmpColorData[k])) {
						continue;
					} else if (tmpColorData[k + 1] === `-`) {
						break;
					}
					colorData[colorIdx] = calcFrame(setVal(tmpColorData[k], ``, C_TYP_CALC));
					colorData[colorIdx + 1] = setVal(tmpColorData[k + 1], 0, C_TYP_CALC);
					colorData[colorIdx + 2] = tmpColorData[k + 2];
					colorIdx += 3;
				}
			});
		}
		return colorData;
	}

	/**
	 * 矢印モーションデータの分解・格納（フレーム数, 矢印番号）
	 * @param {string} _header 
	 * @param {number} _scoreNo 
	 */
	function setCssMotionData(_header, _scoreNo) {
		let dosCssMotionData;
		if (_dosObj[`${_header}Motion${_scoreNo}_data`] !== undefined) {
			dosCssMotionData = _dosObj[`${_header}Motion${_scoreNo}_data`];
		} else if (_dosObj[`${_header}Motion_data`] !== undefined) {
			dosCssMotionData = _dosObj[`${_header}Motion_data`];
		}

		let cssMotionData = [];

		if (hasVal(dosCssMotionData) && g_stateObj.d_arroweffect === C_FLG_ON) {
			let motionIdx = 0;
			const tmpArrayData = dosCssMotionData.split(`\r`).join(`\n`).split(`\n`);

			tmpArrayData.filter(data => hasVal(data)).forEach(tmpData => {
				const tmpcssMotionData = tmpData.split(`,`);
				if (isNaN(parseInt(tmpcssMotionData[0]))) {
					return;
				}
				cssMotionData[motionIdx] = calcFrame(tmpcssMotionData[0]);
				cssMotionData[motionIdx + 1] = parseFloat(tmpcssMotionData[1]);
				cssMotionData[motionIdx + 2] = (tmpcssMotionData[2] === `none` ? `` : tmpcssMotionData[2]);
				cssMotionData[motionIdx + 3] = (tmpcssMotionData[3] === `none` ? `` : setVal(tmpcssMotionData[3], cssMotionData[motionIdx + 2], C_TYP_STRING));
				motionIdx += 4;
			});
		}
		return cssMotionData;
	}

	/**
	 * 歌詞データの分解
	 * @param {string} _scoreNo 
	 */
	function makeWordData(_scoreNo) {
		let wordDataList = [];
		let wordReverseFlg = false;
		const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
		const divideCnt = g_keyObj[`div${keyCtrlPtn}`] - 1;

		if (g_stateObj.scroll !== `---`) {
			wordDataList = [_dosObj[`wordAlt${_scoreNo}_data`], _dosObj.wordAlt_data];
		} else if (g_stateObj.reverse === C_FLG_ON) {
			wordDataList = [_dosObj[`wordRev${_scoreNo}_data`], _dosObj.wordRev_data];

			// wordRev_dataが指定されている場合はそのままの位置を採用
			// word_dataのみ指定されている場合、下記ルールに従って設定
			if (wordDataList.find((v) => v !== undefined) === undefined) {
				// Reverse時の歌詞の自動反転制御設定
				if (g_headerObj.wordAutoReverse !== `auto`) {
					wordReverseFlg = (g_headerObj.wordAutoReverse === C_FLG_ON ? true : false);
				} else if (keyNum === divideCnt + 1) {
					wordReverseFlg = true;
				}
			}
		}
		wordDataList.push(_dosObj[`word${_scoreNo}_data`], _dosObj.word_data);

		const inputWordData = wordDataList.find((v) => v !== undefined);
		return (inputWordData !== undefined ? makeSpriteWordData(inputWordData, wordReverseFlg) : [[], -1]);
	}

	/**
	 * 多層歌詞データの格納処理
	 * @param {object} _data 
	 * @param {boolean} _reverseFlg
	 */
	function makeSpriteWordData(_data, _reverseFlg = false) {
		const wordData = [];
		let wordMaxDepth = -1;
		let wordReverseFlg = _reverseFlg;

		let tmpArrayData = _data.split(`\r`).join(`\n`);
		tmpArrayData = tmpArrayData.split(`\n`);

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
					tmpWordData[3] = setVal(tmpWordData[3], C_WOD_FRAME, C_TYP_NUMBER);
					wordData[tmpWordData[0]][addFrame].push(tmpWordData[1],
						escapeHtmlForEnabledTag(tmpWordData[2]), tmpWordData[3]);
					break;
				} else {
					wordData[tmpWordData[k]][addFrame].push(tmpWordData[k + 1],
						escapeHtmlForEnabledTag(setVal(tmpWordData[k + 2], ``, C_TYP_STRING)));
				}
			}
		});

		return [wordData, wordMaxDepth];
	}

	/**
	 * 背景・マスクデータの分解
	 * @param {string} _header 
	 * @param {string} _scoreNo
	 */
	function makeBackgroundData(_header, _scoreNo) {
		let dataList = [];
		if (g_stateObj.scroll !== `---`) {
			dataList = [_dosObj[`${_header}Alt${_scoreNo}_data`], _dosObj[`${_header}Alt_data`]];
		} else if (g_stateObj.reverse === C_FLG_ON) {
			dataList = [_dosObj[`${_header}Rev${_scoreNo}_data`], _dosObj[`${_header}Rev_data`]];
		}
		dataList.push(_dosObj[`${_header}${_scoreNo}_data`], _dosObj[`${_header}_data`]);

		const data = dataList.find((v) => v !== undefined);
		return (data !== undefined ? makeSpriteData(data, calcFrame) : [[], -1]);
	}

	/**
	 * リザルトモーションデータ(結果画面用背景・マスクデータ)の分解
	 * @param {string} _header 
	 * @param {string} _scoreNo 
	 * @param {string} _defaultHeader 
	 */
	function makeBackgroundResultData(_header, _scoreNo, _defaultHeader = ``) {
		const dataList = [_dosObj[`${_header}${_scoreNo}_data`], _dosObj[`${_header}_data`]];
		if (_defaultHeader !== ``) {
			dataList.push(_dosObj[`${_defaultHeader}${_scoreNo}_data`], _dosObj[`${_defaultHeader}_data`]);
		}

		const data = dataList.find((v) => v !== undefined);
		return (data !== undefined ? makeSpriteData(data) : [[], -1]);
	}

	return obj;
}

/**
 * 文字列の置換
 * @param {string} _str 
 * @param {array} _pairs 
 */
function replaceStr(_str, _pairs) {
	let tmpStr = _str;
	_pairs.forEach(pair => {
		tmpStr = tmpStr.split(pair[0]).join(pair[1]);
	});
	return tmpStr;
}

/**
 * 文字列のエスケープ処理
 * @param {string} _str 
 * @param {array} _escapeList
 */
function escapeHtml(_str, _escapeList = g_escapeStr.escape) {
	return escapeHtmlForEnabledTag(replaceStr(_str, _escapeList));
}

/**
 * 文字列のエスケープ処理(htmlタグ許容版)
 * @param {string} _str 
 */
function escapeHtmlForEnabledTag(_str) {
	return replaceStr(_str, g_escapeStr.escapeTag);
}

/**
 * エスケープ文字を元の文字に戻す
 * @param {string} _str 
 */
function unEscapeHtml(_str) {
	return replaceStr(_str, g_escapeStr.unEscapeTag);
}

/**
 * 配列の中身を全てエスケープ処理
 * @param {array} _array 
 */
function escapeHtmlForArray(_array) {
	return _array.map(str => escapeHtml(str));
}

/**
 * ライフ回復量・ダメージ量の算出
 * @param {number} _allArrows 
 */
function calcLifeVals(_allArrows) {

	if (g_stateObj.lifeVariable === C_FLG_ON) {
		g_workObj.lifeRcv = calcLifeVal(g_stateObj.lifeRcv, _allArrows);
		g_workObj.lifeDmg = calcLifeVal(g_stateObj.lifeDmg, _allArrows);
	} else {
		g_workObj.lifeRcv = g_stateObj.lifeRcv;
		g_workObj.lifeDmg = g_stateObj.lifeDmg;
	}
	g_workObj.lifeBorder = g_headerObj.maxLifeVal * g_stateObj.lifeBorder / 100;
	g_workObj.lifeInit = g_headerObj.maxLifeVal * g_stateObj.lifeInit / 100;
}

/**
 * ライフ回復量・ダメージ量の算出
 * @param {number} _val 
 * @param {number} _allArrows 
 */
function calcLifeVal(_val, _allArrows) {
	return Math.round(_val * g_headerObj.maxLifeVal * 100 / _allArrows) / 100;
}

/**
 * 最終フレーム数の取得
 * @param {object} _dataObj 
 * @param {string} _keyCtrlPtn
 */
function getLastFrame(_dataObj, _keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`) {

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
}

/**
 * 最初の矢印フレームの取得
 * @param {object} _dataObj 
 * @param {string} _keyCtrlPtn
 */
function getFirstArrowFrame(_dataObj, _keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`) {

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
}

/**
 * 開始フレームの取得
 * @param {number} _lastFrame 
 * @param {number} _fadein
 * @param {number} _scoreId
 */
function getStartFrame(_lastFrame, _fadein = 0, _scoreId = g_stateObj.scoreId) {
	let frameNum = 0;
	if (g_headerObj.startFrame !== undefined) {
		frameNum = parseInt(g_headerObj.startFrame[_scoreId] || g_headerObj.startFrame[0] || 0);
	}
	if (_lastFrame >= frameNum) {
		frameNum = Math.round(_fadein / 100 * (_lastFrame - frameNum)) + frameNum;
	}
	return frameNum;
}

/**
 * 各フレームごとの速度を格納
 * @param {object} _speedData 
 * @param {number} _lastFrame 
 */
function setSpeedOnFrame(_speedData, _lastFrame) {

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
}

/**
 * Motionオプション適用時の矢印別の速度設定
 * - 配列の数字は小さいほどステップゾーンに近いことを示す。
 * - 15がステップゾーン上、0～14は矢印の枠外管理用
 */
function setMotionOnFrame() {

	const motionOnFrame = [];

	// 矢印が表示される最大フレーム数
	const motionLastFrame = g_sHeight * 20;
	const brakeLastFrame = g_sHeight / 2;

	for (let j = 0; j <= motionLastFrame; j++) {
		motionOnFrame[j] = 0;
	}

	if (g_stateObj.motion === C_FLG_OFF) {
	} else if (g_stateObj.motion === `Boost`) {
		// ステップゾーンに近づくにつれて加速量を大きくする (16 → 85)
		for (let j = C_MOTION_STD_POS + 1; j < C_MOTION_STD_POS + 70; j++) {
			motionOnFrame[j] = (C_MOTION_STD_POS + 70 - j) * g_stateObj.speed * 2 / 50;
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
}

/**
 * 最初のフレームで出現する矢印が、ステップゾーンに到達するまでのフレーム数を取得
 * @param {number} _startFrame 
 * @param {object} _speedOnFrame 
 * @param {object} _motionOnFrame 
 */
function getFirstArrivalFrame(_startFrame, _speedOnFrame, _motionOnFrame) {
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
}

/**
 * 矢印・フリーズアロー・速度/色変化格納処理
 * @param {object} _dataObj 
 * @param {object} _speedOnFrame 
 * @param {object} _motionOnFrame 
 * @param {number} _firstArrivalFrame
 */
function pushArrows(_dataObj, _speedOnFrame, _motionOnFrame, _firstArrivalFrame) {

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

	let spdNext = Infinity;
	let spdPrev = 0;
	let spdk;
	let lastk;
	let tmpObj;
	let frmPrev;

	function setNotes(_j, _k, _data, _startPoint, _header, _frzFlg = false) {
		if (_startPoint >= 0) {
			if (g_workObj[`mk${_header}Arrow`][_startPoint] === undefined) {
				g_workObj[`mk${_header}Arrow`][_startPoint] = [];
			}
			g_workObj[`mk${_header}Arrow`][_startPoint].push(_j);

			if (_frzFlg) {
				g_workObj[`mk${_header}Length`][_j][_k] = getFrzLength(_speedOnFrame, _data[_k], _data[_k + 1]);
			}
		} else if (_frzFlg && g_workObj[`mk${_header}Length`][_j] !== undefined) {
			g_workObj[`mk${_header}Length`][_j] = JSON.parse(JSON.stringify(g_workObj[`mk${_header}Length`][_j].slice(_k + 2)));
		}
	}

	function calcNotes(_j, _data, _header = ``, _frzFlg = false) {
		if (_data === undefined) {
			return;
		}

		const camelHeader = toCapitalize(_header);
		const setcnt = (_frzFlg ? 2 : 1);

		const startPoint = [];
		let spdNext = Infinity;
		let spdPrev = 0;
		let spdk;
		let tmpObj;
		let arrowArrivalFrm;
		let frmPrev;

		if (_dataObj.speedData !== undefined) {
			spdk = _dataObj.speedData.length - 2;
			spdPrev = _dataObj.speedData[spdk];
		} else {
			spdPrev = 0;
		}

		// 最後尾のデータから計算して格納
		const lastk = _data.length - setcnt;
		arrowArrivalFrm = _data[lastk];
		tmpObj = getArrowStartFrame(arrowArrivalFrm, _speedOnFrame, _motionOnFrame);

		startPoint[lastk] = tmpObj.frm;
		frmPrev = tmpObj.frm;
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
					g_workObj[`mk${camelHeader}Length`][_j] = JSON.parse(JSON.stringify(g_workObj[`mk${camelHeader}Length`][_j].slice(k + 2)));
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
	}

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;

	for (let j = 0; j < keyNum; j++) {

		// 矢印の出現フレーム数計算
		calcNotes(j, _dataObj.arrowData[j]);
		calcNotes(j, _dataObj.dummyArrowData[j], `dummy`);

		// フリーズアローの出現フレーム数計算
		calcNotes(j, _dataObj.frzData[j], `frz`, true);
		calcNotes(j, _dataObj.dummyFrzData[j], `dummyFrz`, true);
	}

	// 個別加速のタイミング更新
	g_workObj.boostData = [];
	g_workObj.boostData.length = 0;
	if (_dataObj.boostData !== undefined && _dataObj.boostData.length >= 2) {
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
		g_workObj.boostData = JSON.parse(JSON.stringify(_dataObj.boostData));
	}

	// 個別・全体色変化のタイミング更新
	calcColorData(``);
	calcColorData(`shadow`);

	function calcColorData(_header) {

		const colorData = _dataObj[`${_header}colorData`];
		const acolorData = _dataObj[`a${_header}colorData`];

		// 個別色変化のタイミング更新
		// フリーズアロー(ヒット時)の場合のみ、逆算をしない
		if (colorData !== undefined && colorData.length >= 3) {
			if (_dataObj.speedData !== undefined) {
				spdk = _dataObj.speedData.length - 2;
				spdPrev = _dataObj.speedData[spdk];
			} else {
				spdPrev = 0;
			}
			spdNext = Infinity;

			lastk = colorData.length - 3;
			tmpObj = getArrowStartFrame(colorData[lastk], _speedOnFrame, _motionOnFrame);
			frmPrev = tmpObj.frm;
			g_workObj.arrivalFrame[frmPrev] = tmpObj.arrivalFrm;
			pushColors(``, isFrzHitColor(colorData[lastk + 1]) ? colorData[lastk] : tmpObj.frm,
				colorData[lastk + 1], colorData[lastk + 2]);

			for (let k = lastk - 3; k >= 0; k -= 3) {

				if (colorData[k] < g_scoreObj.frameNum) {
					break;
				} else if ((colorData[k] - g_workObj.arrivalFrame[frmPrev] > spdPrev
					&& colorData[k] < spdNext)) {
					if (!isFrzHitColor(colorData[k + 1])) {
						colorData[k] -= g_workObj.arrivalFrame[frmPrev];
					}
				} else {
					if (colorData[k] < spdPrev) {
						spdk -= 2;
						spdNext = spdPrev;
						spdPrev = _dataObj.speedData[spdk];
					}
					tmpObj = getArrowStartFrame(colorData[k], _speedOnFrame, _motionOnFrame);
					frmPrev = tmpObj.frm;
					if (!isFrzHitColor(colorData[k + 1])) {
						colorData[k] = tmpObj.frm;
					}
					g_workObj.arrivalFrame[frmPrev] = tmpObj.arrivalFrm;
				}
				pushColors(`${_header}`, colorData[k], colorData[k + 1], colorData[k + 2]);
			}
		}

		// 全体色変化のタイミング更新
		if (acolorData !== undefined && acolorData.length >= 3) {

			for (let k = acolorData.length - 3; k >= 0; k -= 3) {
				pushColors(`A${_header}`, acolorData[k], acolorData[k + 1], acolorData[k + 2]);
			}
		}
	}

	// 個別モーションのタイミング更新
	calcCssMotion(`arrow`);
	calcCssMotion(`frz`);
	calcCssMotion(`dummyArrow`);
	calcCssMotion(`dummyFrz`);

	function calcCssMotion(_header) {
		const cssMotionData = _dataObj[`${_header}CssMotionData`];
		if (cssMotionData !== undefined && cssMotionData.length >= 4) {
			if (_dataObj.speedData !== undefined) {
				spdk = _dataObj.speedData.length - 2;
				spdPrev = _dataObj.speedData[spdk];
			} else {
				spdPrev = 0;
			}
			spdNext = Infinity;

			lastk = cssMotionData.length - 4;
			tmpObj = getArrowStartFrame(cssMotionData[lastk], _speedOnFrame, _motionOnFrame);
			frmPrev = tmpObj.frm;
			g_workObj.arrivalFrame[frmPrev] = tmpObj.arrivalFrm;
			pushCssMotions(_header, tmpObj.frm, cssMotionData[lastk + 1], cssMotionData[lastk + 2], cssMotionData[lastk + 3]);

			for (let k = lastk - 4; k >= 0; k -= 4) {

				if (cssMotionData[k] < g_scoreObj.frameNum) {
					break;
				} else if ((cssMotionData[k] - g_workObj.arrivalFrame[frmPrev] > spdPrev
					&& cssMotionData[k] < spdNext)) {
					cssMotionData[k] -= g_workObj.arrivalFrame[frmPrev];
				} else {
					if (cssMotionData[k] < spdPrev) {
						spdk -= 2;
						spdNext = spdPrev;
						spdPrev = _dataObj.speedData[spdk];
					}
					tmpObj = getArrowStartFrame(cssMotionData[k], _speedOnFrame, _motionOnFrame);
					frmPrev = tmpObj.frm;
					cssMotionData[k] = tmpObj.frm;
					g_workObj.arrivalFrame[frmPrev] = tmpObj.arrivalFrm;
				}
				pushCssMotions(_header, cssMotionData[k], cssMotionData[k + 1], cssMotionData[k + 2], cssMotionData[k + 3]);
			}
		}
	}

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
}

/**
 * ステップゾーン到達地点から逆算して開始フレームを取得
 * @param {number} _frame 
 * @param {object} _speedOnFrame 
 * @param {object} _motionOnFrame 
 */
function getArrowStartFrame(_frame, _speedOnFrame, _motionOnFrame) {

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
}

/**
 * 個別色変化におけるフリーズアロー(ヒット時)判定
 * @param {number} _val 
 */
function isFrzHitColor(_val) {
	return (g_headerObj.colorDataType === `` && ((_val >= 40 && _val < 50) || (_val >= 55 && _val < 60) || _val === 61)) ? true : false;
}

/**
 * 速度を加味したフリーズアローの長さを取得
 * @param {object} _speedOnFrame 
 * @param {number} _startFrame 
 * @param {number} _endFrame 
 */
function getFrzLength(_speedOnFrame, _startFrame, _endFrame) {
	let frzLength = 0;

	for (let frm = _startFrame; frm < _endFrame; frm++) {
		frzLength += _speedOnFrame[frm];
	}
	return frzLength;
}

/**
 * キーパターン(デフォルト)に対応する矢印番号を格納
 */
function convertreplaceNums() {
	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;
	const baseCharas = g_keyObj[`chara${g_keyObj.currentKey}_0`];
	const convCharas = g_keyObj[`chara${keyCtrlPtn}`];

	g_workObj.replaceNums = [];

	for (let j = 0; j < keyNum; j++) {
		for (let k = 0; k < keyNum; k++) {
			if (baseCharas[j] === convCharas[k]) {
				g_workObj.replaceNums[j] = k;
				continue;
			}
		}
	}
}

/**
 * 色情報の格納
 * @param {string} _header 
 * @param {number} _frame 
 * @param {number} _val 
 * @param {string} _colorCd 
 */
function pushColors(_header, _frame, _val, _colorCd) {

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;
	const grdFlg = (g_colorType === `Type0` ? !g_headerObj.defaultColorgrd[0] : g_headerObj.defaultColorgrd[0])
	const colorCd = makeColorGradation(_colorCd, { _defaultColorgrd: [grdFlg, g_headerObj.defaultColorgrd[1]] });

	if (_val < 30 || _val >= 1000) {
		// 矢印の色変化
		if (g_workObj[`mk${_header}Color`][_frame] === undefined) {
			g_workObj[`mk${_header}Color`][_frame] = [];
			g_workObj[`mk${_header}ColorCd`][_frame] = [];
		}
		if (_val < 20 || _val >= 1000) {
			const realVal = g_workObj.replaceNums[_val % 1000];
			g_workObj[`mk${_header}Color`][_frame].push(realVal);
			g_workObj[`mk${_header}ColorCd`][_frame].push(colorCd);
		} else if (_val >= 20) {
			const colorNum = _val - 20;
			for (let j = 0; j < keyNum; j++) {
				if (g_keyObj[`color${keyCtrlPtn}`][j] === colorNum) {
					g_workObj[`mk${_header}Color`][_frame].push(j);
					g_workObj[`mk${_header}ColorCd`][_frame].push(colorCd);
				}
			}
		}
	} else {
		// フリーズアローの色変化
		if (g_workObj[`mkF${_header}Color`][_frame] === undefined) {
			g_workObj[`mkF${_header}Color`][_frame] = [];
			g_workObj[`mkF${_header}ColorCd`][_frame] = [];
		}
		if (_val < 50) {
			g_workObj[`mkF${_header}Color`][_frame].push(_val % 30);
			g_workObj[`mkF${_header}ColorCd`][_frame].push(colorCd);
		} else if (_val < 60) {
			const tmpVal = (_val % 50) * 2;
			g_workObj[`mkF${_header}Color`][_frame].push(tmpVal, tmpVal + 1);
			g_workObj[`mkF${_header}ColorCd`][_frame].push(colorCd, colorCd);
		} else {
			if (_val === 60) {
				g_workObj[`mkF${_header}Color`][_frame].push(0, 1, 2, 3, 4, 5, 6, 7);
			} else {
				g_workObj[`mkF${_header}Color`][_frame].push(10, 11, 12, 13, 14, 15, 16, 17);
			}
			g_workObj[`mkF${_header}ColorCd`][_frame].push(colorCd, colorCd, colorCd, colorCd, colorCd, colorCd, colorCd, colorCd);
		}
	}
}

/**
 * CSSモーション情報の格納
 * @param {string} _header 
 * @param {number} _frame 
 * @param {number} _val 
 * @param {string} _colorCd 
 */
function pushCssMotions(_header, _frame, _val, _styleName, _styleNameRev) {

	const camelHeader = toCapitalize(_header);
	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;

	if (_val < 30) {
		// 矢印のモーション
		if (g_workObj[`mk${camelHeader}CssMotion`][_frame] === undefined) {
			g_workObj[`mk${camelHeader}CssMotion`][_frame] = [];
			g_workObj[`mk${camelHeader}CssMotionName`][_frame] = [];
		}
		if (_val < 20) {
			const realVal = g_workObj.replaceNums[_val];
			g_workObj[`mk${camelHeader}CssMotion`][_frame].push(realVal);
			g_workObj[`mk${camelHeader}CssMotionName`][_frame].push(_styleName, _styleNameRev);

		} else if (_val >= 20) {
			const colorNum = _val - 20;
			for (let j = 0; j < keyNum; j++) {
				if (g_keyObj[`color${keyCtrlPtn}`][j] === colorNum) {
					g_workObj[`mk${camelHeader}CssMotion`][_frame].push(j);
					g_workObj[`mk${camelHeader}CssMotionName`][_frame].push(_styleName, _styleNameRev);
				}
			}
		}
	}
}

/**
 * メイン画面前の初期化処理
 */
function getArrowSettings() {

	g_attrObj = {};
	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;
	const posMax = (g_keyObj[`divMax${keyCtrlPtn}`] !== undefined ? g_keyObj[`divMax${keyCtrlPtn}`] : g_keyObj[`pos${keyCtrlPtn}`][keyNum - 1] + 1);
	const divideCnt = g_keyObj[`div${keyCtrlPtn}`] - 1;
	[`blank`, `scale`].forEach(header => {
		if (hasVal(g_keyObj[`${header}${keyCtrlPtn}`])) {
			g_keyObj[header] = g_keyObj[`${header}${keyCtrlPtn}`];
		} else {
			g_keyObj[header] = g_keyObj[`${header}_def`];
		}
	});
	g_headerObj.tuning = g_headerObj.creatorNames[g_stateObj.scoreId];

	g_workObj.stepX = [];
	g_workObj.scrollDir = [];
	g_workObj.dividePos = [];
	g_workObj.stepRtn = JSON.parse(JSON.stringify(g_keyObj[`stepRtn${keyCtrlPtn}`]));
	g_workObj.stepHitRtn = JSON.parse(JSON.stringify(g_keyObj[`stepRtn${keyCtrlPtn}`]));
	g_workObj.arrowRtn = JSON.parse(JSON.stringify(g_keyObj[`stepRtn${keyCtrlPtn}`]));
	g_workObj.keyCtrl = JSON.parse(JSON.stringify(g_keyObj[`keyCtrl${keyCtrlPtn}`]));
	g_workObj.keyCtrlN = [];
	g_workObj.keyHitFlg = [];
	for (let j = 0; j < g_workObj.keyCtrl.length; j++) {
		g_workObj.keyCtrlN[j] = [];
		g_workObj.keyHitFlg[j] = [];
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

	for (let j = 0; j < keyNum; j++) {

		const posj = g_keyObj[`pos${keyCtrlPtn}`][j];
		const colorj = g_keyObj[`color${keyCtrlPtn}`][j];
		const stdPos = posj - ((posj <= divideCnt ? 0 : posMax) + divideCnt) / 2;

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

	if (g_stateObj.dataSaveFlg && !hasVal(g_keyObj[`transKey${keyCtrlPtn}`])) {

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
				g_keyObj[`keyCtrl${keyCtrlPtn}`] = JSON.parse(JSON.stringify(g_keyObj[`keyCtrl${keyCtrlPtn}d`]));
			}
			localStorage.setItem(`danonicw-${g_keyObj.currentKey}k`, JSON.stringify(g_localKeyStorage));

		} else {
			g_localStorage[`reverse${g_keyObj.currentKey}`] = g_stateObj.reverse;
			g_localStorage[`keyCtrl${g_keyObj.currentKey}`] = setKeyCtrl(g_localKeyStorage, keyNum, keyCtrlPtn);
			if (g_keyObj.currentPtn !== -1) {
				g_localStorage[`keyCtrlPtn${g_keyObj.currentKey}`] = g_keyObj.currentPtn;
				g_keyObj[`keyCtrl${keyCtrlPtn}`] = JSON.parse(JSON.stringify(g_keyObj[`keyCtrl${keyCtrlPtn}d`]));
			}
		}
		localStorage.setItem(g_localStorageUrl, JSON.stringify(g_localStorage));
	}
}

/**
 * キーコンフィグ保存処理
 * @param {object} _localStorage 保存先のローカルストレージ名
 * @param {number} _keyNum 
 * @param {string} _keyCtrlPtn 
 */
function setKeyCtrl(_localStorage, _keyNum, _keyCtrlPtn) {
	const localPtn = `${g_keyObj.currentKey}_-1`;
	const keyCtrl = [];
	for (let j = 0; j < _keyNum; j++) {
		keyCtrl[j] = [];
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
}

/*-----------------------------------------------------------*/
/* Scene : MAIN [banana] */
/*-----------------------------------------------------------*/

/**
 * メイン画面初期化
 */
function MainInit() {
	clearWindow();
	drawDefaultBackImage(`Main`);
	const divRoot = document.querySelector(`#divRoot`);
	document.oncontextmenu = _ => false;

	g_currentArrows = 0;
	g_workObj.fadeInNo = [];
	g_workObj.fadeOutNo = [];
	g_workObj.lastFadeFrame = [];
	g_workObj.wordFadeFrame = [];

	for (let j = 0; j <= g_scoreObj.wordMaxDepth; j++) {
		g_workObj.fadeInNo[j] = 0;
		g_workObj.fadeOutNo[j] = 0;
		g_workObj.lastFadeFrame[j] = 0;
		g_workObj.wordFadeFrame[j] = 0;
	}

	// 背景スプライトを作成
	createMultipleSprite(`backSprite`, g_scoreObj.backMaxDepth);

	// ステップゾーン、矢印のメインスプライトを作成
	const mainSprite = createSprite(`divRoot`, `mainSprite`, g_headerObj.playingX, g_posObj.stepY - C_STEP_Y, g_headerObj.playingWidth, g_sHeight);
	mainSprite.style.transform = `scale(${g_keyObj.scale})`;

	// 曲情報・判定カウント用スプライトを作成（メインスプライトより上位）
	const infoSprite = createSprite(`divRoot`, `infoSprite`, g_headerObj.playingX, 0, g_headerObj.playingWidth, g_sHeight);

	// 判定系スプライトを作成（メインスプライトより上位）
	const judgeSprite = createSprite(`divRoot`, `judgeSprite`, g_headerObj.playingX, 0, g_headerObj.playingWidth, g_sHeight);

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;

	// マスクスプライトを作成 (最上位)
	createMultipleSprite(`maskSprite`, g_scoreObj.maskMaxDepth);

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
	const arrowCnts = [];
	const frzCnts = [];
	const dummyArrowCnts = [];
	const dummyFrzCnts = [];
	let speedCnts = 0;
	let boostCnts = 0;
	const stepZoneHideFlg = g_stateObj.d_stepzone === C_FLG_OFF || g_stateObj.scroll === `Flat`;

	for (let j = 0; j < keyNum; j++) {

		arrowCnts[j] = 0;
		frzCnts[j] = 0;
		dummyArrowCnts[j] = 0;
		dummyFrzCnts[j] = 0;
		const colorPos = g_keyObj[`color${keyCtrlPtn}`][j];

		// ステップゾーンルート
		const stepRoot = createSprite(`mainSprite`, `stepRoot${j}`,
			g_workObj.stepX[j],
			C_STEP_Y + g_posObj.reverseStepY * g_workObj.dividePos[j],
			C_ARW_WIDTH, C_ARW_WIDTH);

		// 矢印の内側を塗りつぶすか否か
		if (g_headerObj.setShadowColor[colorPos] !== ``) {
			stepRoot.appendChild(
				createColorObject2(`stepShadow${j}`, {
					rotate: g_workObj.stepRtn[j], styleName: `ShadowStep`,
					opacity: 0.7, display: stepZoneHideFlg ? C_DIS_NONE : C_DIS_INHERIT,
				}, g_cssObj.main_objStepShadow)
			);
		}

		// ステップゾーン
		multiAppend(stepRoot,

			// 本体
			createColorObject2(`step${j}`, {
				rotate: g_workObj.stepRtn[j], styleName: `Step`,
				display: stepZoneHideFlg ? C_DIS_NONE : C_DIS_INHERIT,
			}, g_cssObj.main_stepDefault),

			// 空押し
			createColorObject2(`stepDiv${j}`, {
				rotate: g_workObj.stepRtn[j], styleName: `Step`,
				display: C_DIS_NONE,
			}, g_cssObj.main_stepKeyDown),

			// ヒット時モーション
			createColorObject2(`stepHit${j}`, {
				x: -15, y: -15, w: C_ARW_WIDTH + 30, h: C_ARW_WIDTH + 30,
				rotate: g_workObj.stepHitRtn[j], styleName: `StepHit`,
				opacity: 0,
			}, g_cssObj.main_stepDefault),

		);
	}
	if (g_stateObj.scroll === `Flat` && g_stateObj.d_stepzone === C_FLG_ON) {

		// ステップゾーンの代わり
		[0, C_ARW_WIDTH].forEach((y, j) => {
			mainSprite.appendChild(
				createColorObject2(`stepBar${j}`, {
					x: 0, y: C_STEP_Y + g_posObj.reverseStepY * (g_stateObj.reverse === C_FLG_OFF ? 0 : 1) + y,
					w: g_headerObj.playingWidth - 50, h: 1, styleName: `lifeBar`,
				}, g_cssObj.life_Failed)
			);
		});

	}

	// Hidden+, Sudden+用のライン、パーセント表示
	[`filterBar0`, `filterBar1`, `borderBar0`, `borderBar1`].forEach(obj => {
		mainSprite.appendChild(
			createColorObject2(`${obj}`, {
				w: g_headerObj.playingWidth - 50, h: 1, styleName: `lifeBar`,
				opacity: 0.0625,
			}, g_cssObj.life_Failed)
		);
	});
	borderBar0.style.top = `${g_posObj.stepDiffY}px`;
	borderBar1.style.top = `${g_posObj.stepDiffY + g_posObj.arrowHeight}px`;

	if (g_appearanceRanges.includes(g_stateObj.appearance)) {
		mainSprite.appendChild(
			createDivCss2Label(`filterView`, ``, {
				x: g_headerObj.playingWidth - 70, y: 0, w: 10, h: 10, siz: 10, align: C_ALIGN_RIGHT,
			})
		);
		if (g_stateObj.d_filterline === C_FLG_ON) {
			[`filterBar0`, `filterBar1`, `filterView`].forEach(obj => {
				$id(obj).opacity = g_stateObj.opacity / 100;
			});
		}
	}

	// 矢印・フリーズアロー描画スプライト（ステップゾーンの上に配置）
	const arrowSprite = [
		createSprite(`mainSprite`, `arrowSprite0`, 0, 0, g_headerObj.playingWidth, g_posObj.arrowHeight),
		createSprite(`mainSprite`, `arrowSprite1`, 0, 0, g_headerObj.playingWidth, g_posObj.arrowHeight)
	];

	// Appearanceのオプション適用時は一部描画を隠す
	changeAppearanceFilter(g_stateObj.appearance, g_appearanceRanges.includes(g_stateObj.appearance) ?
		g_hidSudObj.filterPos : g_hidSudObj.filterPosDefault[g_stateObj.appearance]);

	for (let j = 0; j < keyNum; j++) {

		// フリーズアローヒット部分
		const frzHit = createSprite(`mainSprite`, `frzHit${j}`,
			g_workObj.stepX[j], C_STEP_Y + g_posObj.reverseStepY * g_workObj.dividePos[j],
			C_ARW_WIDTH, C_ARW_WIDTH);
		frzHit.style.opacity = 0;

		if (isNaN(parseFloat(g_workObj.arrowRtn[j]))) {
			multiAppend(frzHit,
				createColorObject2(`frzHitShadow${j}`, {
					rotate: g_workObj.arrowRtn[j], styleName: `Shadow`
				}, g_cssObj.main_objShadow),
				createColorObject2(`frzHitTop${j}`, {
					background: g_workObj.frzHitColors[j], rotate: g_workObj.arrowRtn[j],
				})
			);
		} else {
			frzHit.appendChild(
				createColorObject2(`frzHitTop${j}`, {
					x: -8, y: -8, w: C_ARW_WIDTH + 16, h: C_ARW_WIDTH + 16,
					rotate: g_workObj.arrowRtn[j], styleName: `Shadow`,
				}, g_cssObj.main_frzHitTop)
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

			if (g_headerObj.fadeFrame[fadeNo].length <= 1) {
			} else {
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
	const nominalFullFrame = fullFrame - nominalDiff;

	const fullMin = Math.floor(nominalFullFrame / 60 / g_fps);
	const fullSec = `00${Math.floor(Math.floor(nominalFullFrame / g_fps) % 60)}`.slice(-2);
	const fullTime = `${fullMin}:${fullSec}`;

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

	// 曲名・アーティスト名表示
	const musicTitle = g_headerObj.musicTitles[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.musicTitle;
	const artistName = g_headerObj.artistNames[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.artistName;

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
		createDivCss2Label(`lblCredit`, `${musicTitle} / ${artistName}`, {
			x: 125, y: g_sHeight - 30, w: g_headerObj.playingWidth - 125, h: 20, siz: C_SIZ_MAIN, align: C_ALIGN_LEFT,
		}),

		// 曲時間表示：現在時間
		createDivCss2Label(`lblTime1`, `-:--`, {
			x: 18, y: g_sHeight - 30, w: 40, h: 20, siz: C_SIZ_MAIN, align: C_ALIGN_RIGHT, display: g_workObj.musicinfoDisp,
		}),

		// 曲時間表示：総時間
		createDivCss2Label(`lblTime2`, `/ ${fullTime}`, {
			x: 60, y: g_sHeight - 30, w: 60, h: 20, siz: C_SIZ_MAIN, display: g_workObj.musicinfoDisp,
		}),
	);

	// ボーダーライン表示
	lifeBorderObj.textContent = g_workObj.lifeBorder;
	if (g_stateObj.lifeBorder === 0 || g_workObj.lifeVal === g_headerObj.maxLifeVal) {
		lifeBorderObj.style.display = C_DIS_NONE;
	}

	// 歌詞表示
	createSprite(`judgeSprite`, `wordSprite`, 0, 0, g_headerObj.playingWidth, g_sHeight);
	for (let j = 0; j <= g_scoreObj.wordMaxDepth; j++) {
		const wordY = (j % 2 === 0 ? 10 : (g_headerObj.bottomWordSetFlg ? g_posObj.distY + 10 : g_sHeight - 60));
		const lblWord = createSprite(`wordSprite`, `lblword${j}`, 100, wordY, g_headerObj.playingWidth - 200, 50);
		changeStyle(`lblword${j}`, {
			siz: C_SIZ_MAIN, align: C_ALIGN_LEFT, color: `#ffffff`, fontFamily: getBasicFont(),
			display: `block`, margin: `auto`,
		})
		lblWord.textContent = ``;
	}

	const jdgGroups = [`J`, `FJ`];
	const jdgX = [g_headerObj.playingWidth / 2 - 200, g_headerObj.playingWidth / 2 - 100];
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
				x: jdgX[j] + 150, y: jdgY[j],
				w: C_LEN_JDGCHARA_WIDTH, h: C_LEN_JDGCHARA_HEIGHT, siz: C_SIZ_JDGCHARA,
				opacity: g_stateObj.opacity / 100, display: g_workObj.judgmentDisp,
			}, g_cssObj[`common_${jdgCombos[j]}`]),

			// Fast/Slow表示
			createDivCss2Label(`diff${jdg}`, ``, {
				x: jdgX[j] + 150, y: jdgY[j] + 25,
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
	judgeSprite.appendChild(
		createDivCss2Label(`finishView`, ``, {
			x: g_headerObj.playingWidth / 2 - 150, y: g_sHeight / 2 - 50,
			w: 300, h: 20, siz: 50,
		}, g_cssObj.common_kita)
	);

	// 曲情報OFF
	if (g_stateObj.d_musicinfo === C_FLG_OFF) {
		changeStyle(`lblCredit`, { x: 20, animationDuration: `4.0s`, animationName: `leftToRightFade`, animationFillMode: `both` });
	}

	// ローカル時のみフレーム数を残す
	if (location.href.match(`^file`) || location.href.indexOf(`localhost`) !== -1) {
	} else {
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
				x: g_headerObj.playingX + g_headerObj.playingWidth / 2 - 100,
				y: (g_sHeight + g_posObj.stepYR) / 2 - 75,
				w: 200, h: 50, siz: 40,
				animationDuration: `${g_headerObj.readyAnimationFrame / g_fps}s`,
				animationName: g_headerObj.readyAnimationName,
				animationDelay: `${readyDelayFrame / g_fps}s`, opacity: 0,
			})
		);
	}

	// ユーザカスタムイベント(初期)
	if (typeof customMainInit === C_TYP_FUNCTION) {
		g_scoreObj.baseFrame = g_scoreObj.frameNum - g_stateObj.realAdjustment;
		customMainInit();
		if (typeof customMainInit2 === C_TYP_FUNCTION) {
			customMainInit2();
		}
	}

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
	}

	// キー操作イベント
	document.onkeydown = evt => {
		evt.preventDefault();
		const setCode = transCode(evt.code);

		if (evt.repeat) {
			return blockCode(setCode);
		}

		g_inputKeyBuffer[setCode] = true;
		mainKeyDownActFunc[g_stateObj.autoAll](setCode);

		// 曲中リトライ、タイトルバック
		if (setCode === g_kCdN[g_headerObj.keyRetry]) {
			if (g_audio.volume >= g_stateObj.volume / 100 && g_scoreObj.frameNum >= g_headerObj.blankFrame) {
				g_audio.pause();
				clearTimeout(g_timeoutEvtId);
				clearWindow();
				musicAfterLoaded();
				document.onkeyup = _ => { };
			}

		} else if (setCode === g_kCdN[g_headerObj.keyTitleBack]) {
			g_audio.pause();
			clearTimeout(g_timeoutEvtId);
			if (keyIsDown(`ShiftLeft`)) {
				g_gameOverFlg = true;
				g_finishFlg = false;
				resultInit();
			} else {
				titleInit();
			}
			document.onkeyup = _ => { };

		} else if (g_appearanceRanges.includes(g_stateObj.appearance)) {
			if (setCode === g_hidSudObj.pgDown[g_stateObj.appearance][g_stateObj.reverse]) {
				changeAppearanceFilter(g_stateObj.appearance, g_hidSudObj.filterPos < 100 ?
					g_hidSudObj.filterPos + 1 : g_hidSudObj.filterPos);
			} else if (setCode === g_hidSudObj.pgUp[g_stateObj.appearance][g_stateObj.reverse]) {
				changeAppearanceFilter(g_stateObj.appearance, g_hidSudObj.filterPos > 0 ?
					g_hidSudObj.filterPos - 1 : g_hidSudObj.filterPos);
			}
		}
		return blockCode(setCode);
	}

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
	}

	/**
	 * 全体色変化
	 * 
	 * @param _j 矢印位置
	 * @param _k 矢印の表示順
	 * @param _state フリーズアローの色変化対象 (Normal: 通常時、Hit: ヒット時)
	 */
	const changeColorFunc = {

		// TODO: この部分を矢印塗りつぶし部分についても適用できるように対応
		arrow: (_j, _k) => {
			const arrowTop = document.querySelector(`#arrowTop${_j}_${_k}`);
			if (g_workObj.mkAColor[g_scoreObj.frameNum] !== undefined) {
				if (arrowTop.getAttribute(`color`) !== g_workObj.arrowColors[_j]) {
					if (g_workObj.arrowColors[_j] === g_workObj.arrowColorsAll[_j]) {
						arrowTop.style.background = g_workObj.arrowColorsAll[_j];
						arrowTop.setAttribute(`color`, g_workObj.arrowColorsAll[_j]);
					}
				}
			}
		},

		dummyArrow: (_j, _k) => { },

		// TODO: この部分を矢印塗りつぶし部分についても適用できるように対応
		frz: (_j, _k, _state) => {
			const frzTop = document.querySelector(`#frzTop${_j}_${_k}`);
			const frzBar = document.querySelector(`#frzBar${_j}_${_k}`);
			const frzBtm = document.querySelector(`#frzBtm${_j}_${_k}`);

			if (g_workObj.mkFAColor[g_scoreObj.frameNum] !== undefined) {
				if (frzBtm.getAttribute(`color`) !== g_workObj[`frz${_state}Colors`][_j]) {
					const toColorCode = g_workObj[`frz${_state}ColorsAll`][_j];
					if (g_workObj[`frz${_state}Colors`][_j] === toColorCode) {
						if (_state === `Normal`) {
							frzTop.style.background = toColorCode;
						}
						frzBtm.style.background = toColorCode;
						frzBtm.setAttribute(`color`, toColorCode);
					}
				}
				if (frzBar.getAttribute(`color`) !== g_workObj[`frz${_state}BarColors`][_j]) {
					const toBarColorCode = g_workObj[`frz${_state}BarColorsAll`][_j];
					if (g_workObj[`frz${_state}BarColors`][_j] === toBarColorCode) {
						frzBar.style.background = toBarColorCode;
						frzBar.setAttribute(`color`, toBarColorCode);
					}
				}
			}
		},

		dummyFrz: (_j, _k, _state) => { },
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
	 * ※MainInit内部で指定必須（arrowSprite指定）
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
			if (_cnt < (-1) * g_judgObj.arrowJ[C_JDG_UWAN]) {
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

				if (typeof customJudgeDummyArrow === C_TYP_FUNCTION) {
					customJudgeDummyArrow(_cnt);
					if (typeof customJudgeDummyArrow2 === C_TYP_FUNCTION) {
						customJudgeDummyArrow2(_cnt);
					}
				}
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
			if (typeof customJudgeDummyFrz === C_TYP_FUNCTION) {
				customJudgeDummyFrz(_cnt);
				if (typeof customJudgeDummyFrz2 === C_TYP_FUNCTION) {
					customJudgeDummyFrz2(_cnt);
				}
			}
			$id(`frzHit${_j}`).opacity = 0;
			g_attrObj[_frzName].judgEndFlg = true;
			judgeObjDelete.dummyFrz(_j, _frzName);
		},

		// フリーズアロー(枠外判定)
		frzNG: (_j, _k, _frzName, _cnt) => {
			if (_cnt < (-1) * g_judgObj.frzJ[C_JDG_IKNAI]) {
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
			// ただし、前のフリーズアローの判定領域がジャスト付近(キター領域)の場合は削除しない
			// 削除する場合、前のフリーズアローの判定はイクナイ(＆ウワァン)扱い
			if (g_workObj.judgFrzCnt[_j] !== _k && _cnt <= g_judgObj.frzJ[C_JDG_SFSF] + 1) {
				const prevFrzName = `frz${_j}_${g_workObj.judgFrzCnt[_j]}`;

				if (g_attrObj[prevFrzName].cnt >= (-1) * g_judgObj.frzJ[C_JDG_KITA]) {
				} else {

					// 枠外判定前の場合、このタイミングで枠外判定を行う
					if (g_attrObj[prevFrzName].cnt >= (-1) * g_judgObj.frzJ[C_JDG_IKNAI]) {
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

		frzOFF: (_j) => {
			return g_workObj.keyHitFlg[_j].find(flg => flg) ? true : false;
		},

		frzON: (_j) => {
			return true;
		},

		dummyFrzOFF: (_j) => {
			return true;
		},

		dummyFrzON: (_j) => {
			return true;
		},
	};

	/**
	 * 矢印生成
	 * @param {number} _j 矢印の位置
	 * @param {number} _arrowCnt 現在の判定矢印順
	 * @param {string} _name 矢印名
	 * @param {string} _color 矢印色
	 */
	function makeArrow(_j, _arrowCnt, _name, _color) {
		const boostSpdDir = g_workObj.boostSpd * g_workObj.scrollDir[_j];
		const dividePos = g_workObj.dividePos[_j];
		const colorPos = g_keyObj[`color${keyCtrlPtn}`][_j];

		const arrowName = `${_name}${_j}_${_arrowCnt}`;
		const firstPosY = C_STEP_Y + g_posObj.reverseStepY * dividePos + g_workObj.initY[g_scoreObj.frameNum] * boostSpdDir;

		const stepRoot = createSprite(`arrowSprite${dividePos}`, arrowName,
			g_workObj.stepX[_j], firstPosY, C_ARW_WIDTH, C_ARW_WIDTH);
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
			const shadowColor = (g_headerObj.setShadowColor[colorPos] === `Default` ? g_workObj.arrowColors[_j] :
				g_headerObj.setShadowColor[colorPos]);
			const arrShadow = createColorObject2(`${_name}Shadow${_j}_${_arrowCnt}`, {
				background: shadowColor, rotate: g_workObj.arrowRtn[_j], styleName: `Shadow`,
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
	}

	/**
	 * 矢印移動メイン
	 * @param {number} _j 
	 * @param {number} _k 
	 * @param {string} _name 
	 */
	function movArrow(_j, _k, _name) {
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
	}

	/**
	 * フリーズアロー生成
	 * @param {number} _j 
	 * @param {number} _arrowCnt 
	 * @param {string} _name 
	 * @param {string} _normalcolor
	 * @param {string} _barColor 
	 */
	function makeFrzArrow(_j, _arrowCnt, _name, _normalColor, _barColor) {
		const boostSpdDir = g_workObj.boostSpd * g_workObj.scrollDir[_j];
		const dividePos = g_workObj.dividePos[_j];
		const frzNo = `${_j}_${_arrowCnt}`;
		const frzName = `${_name}${frzNo}`;
		const firstPosY = C_STEP_Y + g_posObj.reverseStepY * dividePos + g_workObj.initY[g_scoreObj.frameNum] * boostSpdDir;
		const firstBarLength = g_workObj[`mk${toCapitalize(_name)}Length`][_j][(_arrowCnt - 1) * 2] * g_workObj.boostSpd;

		const frzRoot = createSprite(`arrowSprite${dividePos}`, frzName,
			g_workObj.stepX[_j], firstPosY, C_ARW_WIDTH, C_ARW_WIDTH + firstBarLength);
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
	}

	/**
	 * フリーズアロー処理メイン
	 * @param {number} _j 
	 * @param {number} _k 
	 * @param {string} _name 
	 */
	function movFrzArrow(_j, _k, _name) {
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
	}

	/**
	 * フレーム処理(譜面台)
	 */
	function flowTimeline() {

		const currentFrame = g_scoreObj.frameNum;
		lblframe.textContent = currentFrame;

		// キーの押下状態を取得
		for (let j = 0; j < keyNum; j++) {
			for (let m = 0, len = g_workObj.keyCtrlN[j].length; m < len; m++) {
				g_workObj.keyHitFlg[j][m] = keyIsDown(g_workObj.keyCtrlN[j][m]);
			}
		}

		if (currentFrame === musicStartFrame) {
			musicStartFlg = true;
			g_audio.currentTime = firstFrame / g_fps * g_headerObj.playbackRate;
			g_audio.playbackRate = g_headerObj.playbackRate;
			g_audio.play();
			musicStartTime = performance.now();
			g_audio.dispatchEvent(new CustomEvent(`timeupdate`));
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
		if (typeof customMainEnterFrame === C_TYP_FUNCTION) {
			customMainEnterFrame();
			if (typeof customMainEnterFrame2 === C_TYP_FUNCTION) {
				customMainEnterFrame2();
			}
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

		// 個別色変化 (矢印)
		changeArrowColors(g_workObj.mkColor[currentFrame], g_workObj.mkColorCd[currentFrame]);

		// 個別色変化（フリーズアロー）
		changeFrzColors(g_workObj.mkFColor[currentFrame], g_workObj.mkFColorCd[currentFrame],
			g_keyObj[`color${keyCtrlPtn}`]);

		// 全体色変化 (矢印)
		changeArrowColors(g_workObj.mkAColor[currentFrame], g_workObj.mkAColorCd[currentFrame], `A`);

		// 全体色変化 (フリーズアロー)
		changeFrzColors(g_workObj.mkFAColor[currentFrame], g_workObj.mkFAColorCd[currentFrame],
			g_keyObj[`color${keyCtrlPtn}`], `A`);

		// 矢印モーション
		changeCssMotions(g_workObj.mkArrowCssMotion[currentFrame], g_workObj.mkArrowCssMotionName[currentFrame], `arrow`);

		// フリーズアローモーション
		changeCssMotions(g_workObj.mkFrzCssMotion[currentFrame], g_workObj.mkFrzCssMotionName[currentFrame], `frz`);

		// ダミー矢印モーション
		changeCssMotions(g_workObj.mkDummyArrowCssMotion[currentFrame], g_workObj.mkDummyArrowCssMotionName[currentFrame], `dummyArrow`);

		// ダミーフリーズアローモーション
		changeCssMotions(g_workObj.mkDummyFrzCssMotion[currentFrame], g_workObj.mkDummyFrzCssMotionName[currentFrame], `dummyFrz`);

		// ダミー矢印生成（背面に表示するため先に処理）
		if (g_workObj.mkDummyArrow[currentFrame] !== undefined) {
			g_workObj.mkDummyArrow[currentFrame].forEach(data =>
				makeArrow(data, ++dummyArrowCnts[data], `dummyArrow`, C_CLR_DUMMY));
		}

		// 矢印生成
		if (g_workObj.mkArrow[currentFrame] !== undefined) {
			g_workObj.mkArrow[currentFrame].forEach(data =>
				makeArrow(data, ++arrowCnts[data], `arrow`, g_workObj.arrowColors[data]));
		}

		// ダミーフリーズアロー生成
		if (g_workObj.mkDummyFrzArrow[currentFrame] !== undefined) {
			g_workObj.mkDummyFrzArrow[currentFrame].forEach(data => {
				makeFrzArrow(data, ++dummyFrzCnts[data], `dummyFrz`,
					C_CLR_DUMMY, `#888888`);
			});
		}

		// フリーズアロー生成
		if (g_workObj.mkFrzArrow[currentFrame] !== undefined) {
			g_workObj.mkFrzArrow[currentFrame].forEach(data => {
				makeFrzArrow(data, ++frzCnts[data], `frz`,
					g_workObj.frzNormalColors[data], g_workObj.frzNormalBarColors[data]);
			});
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
						setVal(tmpObj[2], C_WOD_FRAME, C_TYP_NUMBER) : C_WOD_FRAME);

					g_wordSprite.style.animationDuration = `${g_workObj.wordFadeFrame[wordDepth] / g_fps}s`;
					g_wordSprite.style.animationTimingFunction = `linear`;
					g_wordSprite.style.animationFillMode = `forwards`;

				} else if ([`[center]`, `[left]`, `[right]`].includes(g_wordObj.wordDat)) {

					// 歌詞位置変更
					g_wordSprite.style.textAlign = g_wordObj.wordDat.slice(1, -1);

				} else if (/\[fontSize=\d+\]/.test(g_wordObj.wordDat)) {

					// フォントサイズ変更
					const fontSize = setVal(g_wordObj.wordDat.match(/\d+/)[0], C_SIZ_MAIN, C_TYP_NUMBER);
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

			document.onkeydown = evt => blockCode(transCode(evt.code));
			document.onkeyup = evt => { }

			clearTimeout(g_timeoutEvtId);
			setTimeout(_ => resultInit(), 100);

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
					const currentMin = Math.floor(g_scoreObj.nominalFrameNum / 60 / g_fps);
					const currentSec = `00${Math.floor(g_scoreObj.nominalFrameNum / g_fps) % 60}`.slice(-2);
					lblTime1.textContent = `${currentMin}:${currentSec}`;
				}
			}

			// 60fpsから遅延するため、その差分を取って次回のタイミングで遅れをリカバリする
			thisTime = performance.now();
			buffTime = 0;
			if (currentFrame >= musicStartFrame) {
				buffTime = (thisTime - musicStartTime - (currentFrame - musicStartFrame) * 1000 / g_fps);
			}
			g_scoreObj.frameNum++;
			g_scoreObj.nominalFrameNum++;
			g_timeoutEvtId = setTimeout(_ => flowTimeline(), 1000 / g_fps - buffTime);
		}
	}
	if (typeof skinMainInit === C_TYP_FUNCTION) {
		skinMainInit();
		if (typeof skinMainInit2 === C_TYP_FUNCTION) {
			skinMainInit2();
		}
	}
	g_timeoutEvtId = setTimeout(_ => flowTimeline(), 1000 / g_fps);
}

/**
 * アルファマスクの再描画 (Appearance: Hidden+, Sudden+ 用)
 * @param {string} _appearance
 * @param {number} _num 
 */
function changeAppearanceFilter(_appearance, _num = 10) {
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
}

/**
 * 判定カウンタ表示作成
 * @param {string} _id 
 * @param {number} _x
 * @param {string} _class 
 * @param {number} _heightPos 
 * @param {string, number} _text
 */
function makeCounterSymbol(_id, _x, _class, _heightPos, _text, _display = C_DIS_INHERIT) {
	return createDivCss2Label(_id, _text, {
		x: _x, y: C_LEN_JDGCNTS_HEIGHT * _heightPos,
		w: C_LEN_JDGCNTS_WIDTH, h: C_LEN_JDGCNTS_HEIGHT, siz: C_SIZ_JDGCNTS, align: C_ALIGN_RIGHT,
		display: _display,
	}, _class);
}

// TODO: この部分を矢印塗りつぶし部分についても適用できるように関数を見直し

/**
 * 個別色変化 (矢印)
 * @param {array} _mkColor 
 * @param {array} _mkColorCd 
 * @param {string} _allFlg
 */
function changeArrowColors(_mkColor, _mkColorCd, _allFlg = ``) {

	if (_mkColor === undefined) {
		return;
	}
	_mkColor.forEach((targetj, j) => {
		g_workObj.arrowColors[targetj] = _mkColorCd[j];
		if (_allFlg === `A`) {
			g_workObj.arrowColorsAll[targetj] = _mkColorCd[j];
		}
	});
}

/**
 * 個別色変化 (フリーズアロー)
 * @param {array} _mkColor 
 * @param {array} _mkColorCd 
 * @param {array} _colorPatterns 
 * @param {string} _allFlg
 */
function changeFrzColors(_mkColor, _mkColorCd, _colorPatterns, _allFlg = ``) {

	if (_mkColor === undefined) {
		return;
	}
	_mkColor.forEach((targetj, j) => {

		// targetj=0,2,4,6,8 ⇒ Arrow, 1,3,5,7,9 ⇒ Bar
		const ctype = (targetj >= 10 ? `Hit` : `Normal`) + (targetj % 2 === 0 ? `` : `Bar`);
		const colorPos = Math.ceil((targetj % 10 - 1) / 2);

		_colorPatterns.forEach((cpattern, k) => {
			if (colorPos === cpattern) {
				g_workObj[`frz${ctype}Colors`][k] = _mkColorCd[j];
				if (_allFlg === `A`) {
					g_workObj[`frz${ctype}ColorsAll`][k] = _mkColorCd[j];
					if (ctype === `HitBar` && isNaN(Number(g_workObj.arrowRtn[k]))) {
						$id(`frzHitTop${k}`).background = _mkColorCd[j];
					}
				}
			}
		});
	});
}

/**
 * 個別モーション
 * @param {array} _mkCssMotion 
 * @param {array} _mkCssMotionName 
 * @param {string} _name
 */
function changeCssMotions(_mkCssMotion, _mkCssMotionName, _name) {

	if (_mkCssMotion !== undefined) {
		for (let j = 0, len = _mkCssMotion.length; j < len; j++) {
			const targetj = _mkCssMotion[j];
			g_workObj[`${_name}CssMotions`][targetj] = _mkCssMotionName[2 * j + g_workObj.dividePos[targetj]];
		}
	}
}

/**
 * フリーズアローヒット時の描画変更
 * @param {number} _j 
 * @param {number} _k 
 */
function changeHitFrz(_j, _k, _name) {
	const frzNo = `${_j}_${_k}`;
	const frzName = `${_name}${frzNo}`;
	const styfrzBar = $id(`${_name}Bar${frzNo}`);
	const styfrzBtm = $id(`${_name}Btm${frzNo}`);
	const styfrzBtmShadow = $id(`${_name}BtmShadow${frzNo}`);
	const colorPos = g_keyObj[`color${g_keyObj.currentKey}_${g_keyObj.currentPtn}`][_j];

	// フリーズアロー位置の修正（ステップゾーン上に来るように）
	const delFrzLength = parseFloat($id(`stepRoot${_j}`).top) - g_attrObj[frzName].y;
	document.getElementById(frzName).style.top = $id(`stepRoot${_j}`).top;

	g_attrObj[frzName].frzBarLength -= delFrzLength * g_attrObj[frzName].dir;
	g_attrObj[frzName].barY -= delFrzLength * g_attrObj[frzName].dividePos;
	g_attrObj[frzName].btmY -= delFrzLength;
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
}

/**
 * フリーズアロー失敗時の描画変更
 * @param {number} _j 
 * @param {number} _k 
 */
function changeFailedFrz(_j, _k) {
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
}

/**
 * キーを押したかどうかを判定
 * @param {number} _keyCode 
 */
function keyIsDown(_keyCode) {
	return (g_inputKeyBuffer[_keyCode] ? true : false);
}

const jdgList = [`ii`, `shakin`, `matari`, `shobon`].map(jdg => toCapitalize(jdg));
const jdgFuncList = [judgeIi, judgeShakin, judgeMatari, judgeShobon];
const checkJudgment = (_difCnt) => {
	const idx = g_judgObj.arrowJ.findIndex(jdgCnt => _difCnt <= jdgCnt);
	return [jdgFuncList[idx], jdgList[idx]];
};

/**
 * 矢印・フリーズアロー判定
 * @param {number} _j 対象矢印・フリーズアロー
 */
function judgeArrow(_j) {

	const currentNo = g_workObj.judgArrowCnt[_j];
	const arrowName = `arrow${_j}_${currentNo}`;
	const judgArrow = document.getElementById(arrowName);

	const fcurrentNo = g_workObj.judgFrzCnt[_j];
	const frzName = `frz${_j}_${fcurrentNo}`;
	const judgFrz = document.getElementById(frzName);

	function judgeTargetArrow(_difFrame) {
		const _difCnt = Math.abs(_difFrame);
		if (_difCnt <= g_judgObj.arrowJ[C_JDG_UWAN]) {
			const [resultFunc, resultJdg] = checkJudgment(_difCnt);
			resultFunc(_difFrame);
			countFastSlow(_difFrame, g_headerObj.justFrames);

			const stepDivHit = document.querySelector(`#stepHit${_j}`);
			stepDivHit.style.top = `${g_attrObj[arrowName].prevY - parseFloat($id(`stepRoot${_j}`).top) - 15}px`;
			stepDivHit.style.opacity = 0.75;
			stepDivHit.classList.value = ``;
			stepDivHit.classList.add(g_cssObj[`main_step${resultJdg}`]);
			stepDivHit.setAttribute(`cnt`, C_FRM_HITMOTION);

			document.querySelector(`#arrowSprite${g_attrObj[arrowName].dividePos}`).removeChild(judgArrow);
			g_workObj.judgArrowCnt[_j]++;
			return true;
		}
		return false;
	}

	function judgeTargetFrzArrow(_difFrame) {
		const _difCnt = Math.abs(_difFrame);
		if (_difCnt <= g_judgObj.frzJ[C_JDG_SFSF] && !g_attrObj[frzName].judgEndFlg) {
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
	}

	let judgeFlg = false;
	if (judgArrow !== null && judgFrz !== null) {
		const difFrame = g_attrObj[arrowName].cnt;
		const frzDifFrame = g_attrObj[frzName].cnt;

		if (difFrame < frzDifFrame) {
			judgeFlg = judgeTargetArrow(difFrame);
		} else {
			judgeFlg = judgeTargetFrzArrow(frzDifFrame);
		}
	} else if (judgArrow !== null) {
		judgeFlg = judgeTargetArrow(g_attrObj[arrowName].cnt);
	} else if (judgFrz !== null) {
		judgeFlg = judgeTargetFrzArrow(g_attrObj[frzName].cnt);
	}

	if (!judgeFlg) {
		$id(`stepDiv${_j}`).display = C_DIS_INHERIT;
	}
}

/**
 * タイミングズレを表示
 * @param {number} _difFrame 
 * @param {number} _justFrames
 */
function displayDiff(_difFrame, _justFrames = 0) {
	let diffJDisp = ``;
	const difCnt = Math.abs(_difFrame);
	if (_difFrame > _justFrames) {
		diffJDisp = `<span class="common_matari">Fast ${difCnt} Frames</span>`;
	} else if (_difFrame < _justFrames * (-1)) {
		diffJDisp = `<span class="common_shobon">Slow ${difCnt} Frames</span>`;
	}
	diffJ.innerHTML = diffJDisp;
}

/**
 * Fast/Slowカウンタ
 * @param {number} _difFrame 
 * @param {number} _justFrames 
 */
function countFastSlow(_difFrame, _justFrames = 0) {
	if (_difFrame > _justFrames) {
		g_resultObj.fast++;
	} else if (_difFrame < _justFrames * (-1)) {
		g_resultObj.slow++;
	}
}

/**
 * ライフゲージバーの色、数値を変更
 * @param {strint} _state 
 */
function changeLifeColor(_state = ``) {
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
}

function lifeRecovery() {
	g_workObj.lifeVal += g_workObj.lifeRcv;

	if (g_workObj.lifeVal >= g_headerObj.maxLifeVal) {
		g_workObj.lifeVal = g_headerObj.maxLifeVal;
		changeLifeColor(`Max`);
	} else {
		changeLifeColor(g_workObj.lifeVal >= g_workObj.lifeBorder ? `Cleared` : ``);
	}
}

function lifeDamage() {
	g_workObj.lifeVal -= g_workObj.lifeDmg;

	if (g_workObj.lifeVal <= 0) {
		g_workObj.lifeVal = 0;
		changeLifeColor();
	} else {
		changeLifeColor(g_workObj.lifeVal < g_workObj.lifeBorder ? `Failed` : `Cleared`);
	}
}

/**
 * 判定キャラクタの表示、判定済矢印数・判定数のカウンタ
 * @param {string} _name 
 * @param {string} _character 
 * @param {string} _freezeFlg 
 */
function changeJudgeCharacter(_name, _character, _freezeFlg = ``) {
	g_resultObj[_name]++;
	g_currentArrows++;
	document.querySelector(`#chara${_freezeFlg}J`).innerHTML = `<span class="common_${_name}">${_character}</span>`;
	document.querySelector(`#chara${_freezeFlg}J`).setAttribute(`cnt`, C_FRM_JDGMOTION);
	document.querySelector(`#lbl${toCapitalize(_name)}`).textContent = g_resultObj[_name];
}

/**
 * コンボの更新
 */
function updateCombo() {
	if (++g_resultObj.combo > g_resultObj.maxCombo) {
		g_resultObj.maxCombo = g_resultObj.combo;
		lblMCombo.textContent = g_resultObj.maxCombo;
	}
	comboJ.textContent = `${g_resultObj.combo} Combo!!`;
}

/**
 * 判定処理：イイ
 * @param {number} difFrame 
 */
function judgeIi(difFrame) {
	changeJudgeCharacter(`ii`, C_JCR_II);

	updateCombo();
	displayDiff(difFrame, g_headerObj.justFrames);

	lifeRecovery();
	finishViewing();

	if (typeof customJudgeIi === C_TYP_FUNCTION) {
		customJudgeIi(difFrame);
		if (typeof customJudgeIi2 === C_TYP_FUNCTION) {
			customJudgeIi2(difFrame);
		}
	}
}

/**
 * 判定処理：シャキン
 * @param {number} difFrame 
 */
function judgeShakin(difFrame) {
	changeJudgeCharacter(`shakin`, C_JCR_SHAKIN);

	updateCombo();
	displayDiff(difFrame, g_headerObj.justFrames);

	lifeRecovery();
	finishViewing();

	if (typeof customJudgeShakin === C_TYP_FUNCTION) {
		customJudgeShakin(difFrame);
		if (typeof customJudgeShakin2 === C_TYP_FUNCTION) {
			customJudgeShakin2(difFrame);
		}
	}
}

/**
 * 判定処理：マターリ
 * @param {number} difFrame 
 */
function judgeMatari(difFrame) {
	changeJudgeCharacter(`matari`, C_JCR_MATARI);
	comboJ.textContent = ``;

	displayDiff(difFrame, g_headerObj.justFrames);
	finishViewing();

	if (typeof customJudgeMatari === C_TYP_FUNCTION) {
		customJudgeMatari(difFrame);
		if (typeof customJudgeMatari2 === C_TYP_FUNCTION) {
			customJudgeMatari2(difFrame);
		}
	}
}

/**
 * ダメージ系共通処理
 */
function judgeDamage() {
	g_resultObj.combo = 0;
	comboJ.textContent = ``;
	diffJ.textContent = ``;
	lifeDamage();
}

/**
 * 判定処理：ショボーン
 * @param {number} difFrame 
 */
function judgeShobon(difFrame) {
	changeJudgeCharacter(`shobon`, C_JCR_SHOBON);
	judgeDamage();

	if (typeof customJudgeShobon === C_TYP_FUNCTION) {
		customJudgeShobon(difFrame);
		if (typeof customJudgeShobon2 === C_TYP_FUNCTION) {
			customJudgeShobon2(difFrame);
		}
	}
}

/**
 * 判定処理：ウワァン
 * @param {number} difFrame 
 */
function judgeUwan(difFrame) {
	changeJudgeCharacter(`uwan`, C_JCR_UWAN);
	judgeDamage();

	if (typeof customJudgeUwan === C_TYP_FUNCTION) {
		customJudgeUwan(difFrame);
		if (typeof customJudgeUwan2 === C_TYP_FUNCTION) {
			customJudgeUwan2(difFrame);
		}
	}
}

/**
 * 判定処理：キター
 * @param {number} difFrame 
 */
function judgeKita(difFrame) {
	changeJudgeCharacter(`kita`, C_JCR_KITA, `F`);

	if (++g_resultObj.fCombo > g_resultObj.fmaxCombo) {
		g_resultObj.fmaxCombo = g_resultObj.fCombo;
		lblFCombo.textContent = g_resultObj.fmaxCombo;
	}
	comboFJ.textContent = `${g_resultObj.fCombo} Combo!!`;

	lifeRecovery();
	finishViewing();

	if (typeof customJudgeKita === C_TYP_FUNCTION) {
		customJudgeKita(difFrame);
		if (typeof customJudgeKita2 === C_TYP_FUNCTION) {
			customJudgeKita2(difFrame);
		}
	}
}

/**
 * 判定処理：イクナイ
 * @param {number} difFrame 
 */
function judgeIknai(difFrame) {
	changeJudgeCharacter(`iknai`, C_JCR_IKNAI, `F`);
	comboFJ.textContent = ``;
	g_resultObj.fCombo = 0;

	lifeDamage();

	if (typeof customJudgeIknai === C_TYP_FUNCTION) {
		customJudgeIknai(difFrame);
		if (typeof customJudgeIknai2 === C_TYP_FUNCTION) {
			customJudgeIknai2(difFrame);
		}
	}
}

/**
 * フルコンボ・パーフェクト演出の作成
 * @param {string} _text 
 */
function makeFinishView(_text) {
	finishView.innerHTML = _text;
	finishView.style.opacity = 1;
	[`charaJ`, `comboJ`, `diffJ`, `charaFJ`, `comboFJ`, `diffFJ`].forEach(label =>
		document.querySelector(`#${label}`).textContent = ``);
}

function finishViewing() {
	if (g_currentArrows === g_fullArrows) {
		if (g_resultObj.ii + g_resultObj.kita === g_fullArrows) {
			g_resultObj.spState = `allPerfect`;
		} else if (g_resultObj.ii + g_resultObj.shakin + g_resultObj.kita === g_fullArrows) {
			g_resultObj.spState = `perfect`;
		} else if (g_resultObj.uwan === 0 && g_resultObj.shobon === 0 && g_resultObj.iknai === 0) {
			g_resultObj.spState = `fullCombo`;
		}
		if (g_headerObj.finishView !== C_DIS_NONE && [`allPerfect`, `perfect`, `fullCombo`].includes(g_resultObj.spState)) {
			makeFinishView(g_resultMsgObj[g_resultObj.spState]);
		}
	}
}

/*-----------------------------------------------------------*/
/* Scene : RESULT [grape] */
/*-----------------------------------------------------------*/

/**
 * リザルト画面初期化
 */
function resultInit() {

	clearWindow();
	drawDefaultBackImage(``);

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
	let resultStartTime = performance.now();

	if (g_stateObj.d_background === C_FLG_OFF && g_headerObj.resultMotionSet) {
	} else {
		// ゲームオーバー時は失敗時のリザルトモーションを適用
		if (!g_finishFlg) {
			const scoreIdHeader = setScoreIdHeader(g_stateObj.scoreId, g_stateObj.scoreLockFlg);

			g_animationData.forEach(sprite => {
				if (g_rootObj[`${sprite}failedS${scoreIdHeader}_data`] !== undefined) {
					[g_headerObj[`${sprite}ResultData`], g_headerObj[`${sprite}ResultMaxDepth`]] = makeSpriteData(g_rootObj[`${sprite}failedS${scoreIdHeader}_data`]);
				} else if (g_rootObj[`${sprite}failedS_data`] !== undefined) {
					[g_headerObj[`${sprite}ResultData`], g_headerObj[`${sprite}ResultMaxDepth`]] = makeSpriteData(g_rootObj[`${sprite}failedS_data`]);
				}
			});
		} else if (g_gameOverFlg) {
			g_headerObj.backResultData = g_headerObj.backFailedData.concat();
			g_headerObj.maskResultData = g_headerObj.maskFailedData.concat();
			g_headerObj.backResultMaxDepth = g_headerObj.backFailedMaxDepth;
			g_headerObj.maskResultMaxDepth = g_headerObj.maskFailedMaxDepth;
		}
	}

	// 背景スプライトを作成
	createMultipleSprite(`backResultSprite`, g_headerObj.backResultMaxDepth);

	// タイトル文字描画
	divRoot.appendChild(getTitleDivLabel(`lblTitle`, g_lblNameObj.result, 0, 15, `settings_Title`));

	const playDataWindow = createSprite(`divRoot`, `playDataWindow`, g_sWidth / 2 - 225, 70 + (g_sHeight - 500) / 2, 450, 110);
	playDataWindow.classList.add(g_cssObj.result_PlayDataWindow);
	const resultWindow = createSprite(`divRoot`, `resultWindow`, g_sWidth / 2 - 200, 185 + (g_sHeight - 500) / 2, 400, 210);

	const playingArrows = g_resultObj.ii + g_resultObj.shakin +
		g_resultObj.matari + g_resultObj.shobon + g_resultObj.uwan +
		g_resultObj.kita + g_resultObj.iknai;

	// スコア計算(一括)
	const scoreTmp = Object.keys(g_pointAllocation).reduce(
		(score, name) => score + g_resultObj[name] * g_pointAllocation[name]
		, 0)

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
		if (g_resultObj.matari + g_resultObj.shobon + g_resultObj.uwan + g_resultObj.sfsf + g_resultObj.iknai === 0) {
			rankMark = g_rankObj.rankMarkPF;
			rankColor = g_rankObj.rankColorPF;
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
	let transKeyData = ``;
	if (hasVal(g_keyObj[`transKey${keyCtrlPtn}`])) {
		transKeyData = `(` + g_keyObj[`transKey${keyCtrlPtn}`] + `)`;
	}

	let difData = [
		`${g_headerObj.keyLabels[g_stateObj.scoreId]}${transKeyData} key / ${g_headerObj.difLabels[g_stateObj.scoreId]}`,
		`${withOptions(g_autoPlaysBase.includes(g_stateObj.autoPlay), true, `-${g_stateObj.autoPlay}less`)}`,
		`${withOptions(g_headerObj.makerView, false, `(${g_headerObj.creatorNames[g_stateObj.scoreId]})`)}`,
		`${withOptions(g_stateObj.shuffle, C_FLG_OFF, `[${g_stateObj.shuffle}]`)}`
	].filter(value => value !== ``).join(` `);

	let playStyleData = [
		`${g_stateObj.speed}x`,
		`${withOptions(g_stateObj.motion, C_FLG_OFF)}`,
		`${withOptions(g_stateObj.reverse, C_FLG_OFF,
			(g_stateObj.scroll !== '---' ? 'R-' : 'Reverse'))}${withOptions(g_stateObj.scroll, '---')}`,
		`${withOptions(g_stateObj.appearance, `Visible`)}`,
		`${withOptions(g_stateObj.gauge, g_gauges[0])}`
	].filter(value => value !== ``).join(`, `);

	let displayData = [
		withOptions(g_stateObj.d_stepzone, C_FLG_ON, `Step`),
		withOptions(g_stateObj.d_judgment, C_FLG_ON, `Judge`),
		withOptions(g_stateObj.d_fastslow, C_FLG_ON, `FS`),
		withOptions(g_stateObj.d_lifegauge, C_FLG_ON, `Life`),
		withOptions(g_stateObj.d_score, C_FLG_ON, `Score`),
		withOptions(g_stateObj.d_musicinfo, C_FLG_ON, `MusicInfo`),
		withOptions(g_stateObj.d_filterline, C_FLG_ON, `Filter`)
	].filter(value => value !== ``).join(`, `);
	if (displayData === ``) {
		displayData = `All Visible`;
	} else {
		displayData += ` : OFF`;
	}

	let display2Data = [
		withOptions(g_stateObj.d_speed, C_FLG_ON, `Speed`),
		withOptions(g_stateObj.d_color, C_FLG_ON, `Color`),
		withOptions(g_stateObj.d_lyrics, C_FLG_ON, `Lyrics`),
		withOptions(g_stateObj.d_background, C_FLG_ON, `Back`),
		withOptions(g_stateObj.d_arroweffect, C_FLG_ON, `Effect`),
		withOptions(g_stateObj.d_special, C_FLG_ON, `SP`)
	].filter(value => value !== ``).join(`, `);
	if (display2Data !== ``) {
		display2Data += ` : OFF`;
	}

	multiAppend(playDataWindow,
		makeCssResultPlayData(`lblMusic`, 20, g_cssObj.result_lbl, 0, `Music`, C_ALIGN_LEFT),
		makeCssResultPlayData(`lblMusicData`, 60, g_cssObj.result_style, 0, mTitleForView[0]),
		makeCssResultPlayData(`lblMusicData2`, 60, g_cssObj.result_style, 1, mTitleForView[1]),
		makeCssResultPlayData(`lblDifficulty`, 20, g_cssObj.result_lbl, 2, `Difficulty`, C_ALIGN_LEFT),
		makeCssResultPlayData(`lblDifData`, 60, g_cssObj.result_style, 2, difData),
		makeCssResultPlayData(`lblStyle`, 20, g_cssObj.result_lbl, 3, `Playstyle`, C_ALIGN_LEFT),
		makeCssResultPlayData(`lblStyleData`, 60, g_cssObj.result_style, 3, playStyleData),
		makeCssResultPlayData(`lblDisplay`, 20, g_cssObj.result_lbl, 4, `Display`, C_ALIGN_LEFT),
		makeCssResultPlayData(`lblDisplayData`, 60, g_cssObj.result_style, 4, displayData),
		makeCssResultPlayData(`lblDisplay2Data`, 60, g_cssObj.result_style, 5, display2Data),
	);

	/**
	 * プレイスタイルのカスタム有無
	 * @param {string} _flg 
	 * @param {string, boolean} _defaultSet デフォルト値
	 * @param {string} _displayText 
	 */
	function withOptions(_flg, _defaultSet, _displayText = _flg) {
		return (_flg !== _defaultSet ? _displayText : ``);
	}

	// キャラクタ、スコア描画のID共通部、色CSS名、スコア変数名
	const jdgScoreObj = {
		ii: { pos: 0, id: `Ii`, color: `ii`, label: C_JCR_II, },
		shakin: { pos: 1, id: `Shakin`, color: `shakin`, label: C_JCR_SHAKIN, },
		matari: { pos: 2, id: `Matari`, color: `matari`, label: C_JCR_MATARI, },
		shobon: { pos: 3, id: `Shobon`, color: `shobon`, label: C_JCR_SHOBON, },
		uwan: { pos: 4, id: `Uwan`, color: `uwan`, label: C_JCR_UWAN, },
		kita: { pos: 5, id: `Kita`, color: `kita`, label: C_JCR_KITA, },
		iknai: { pos: 6, id: `Iknai`, color: `iknai`, label: C_JCR_IKNAI, },
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
	}

	// ランク描画
	const lblRank = createDivCustomLabel(`lblRank`, 340, 160, 70, 20, 50, `#ffffff`,
		`<span style=color:${rankColor}>${rankMark}</span>`, `"Bookman Old Style", "Meiryo UI", sans-serif`);
	lblRank.style.textAlign = C_ALIGN_CENTER;
	resultWindow.appendChild(lblRank);

	// Cleared & Failed表示
	const lblResultPre = createDivCss2Label(
		`lblResultPre`,
		(!g_gameOverFlg ? g_resultMsgObj.cleared : g_resultMsgObj.failed),
		{
			x: g_sWidth / 2 - 150, y: g_sHeight / 2 - 160,
			w: 200, h: 50, siz: 60,
			opacity: 0, animationDuration: (!g_gameOverFlg ? `2.5s` : `3s`),
			animationName: (!g_gameOverFlg ? `leftToRightFade` : `upToDownFade`)
		}, g_cssObj.result_Cleared, g_cssObj.result_Window
	);
	divRoot.appendChild(lblResultPre);

	divRoot.appendChild(
		createDivCss2Label(
			`lblResultPre2`,
			(!g_gameOverFlg ?
				(playingArrows === g_fullArrows ? g_resultMsgObj[g_resultObj.spState] : ``) : g_resultMsgObj.failed),
			{
				x: g_sWidth / 2 + 50, y: 40,
				w: 200, h: 30, siz: 20,
			}, g_cssObj.result_Cleared
		)
	);

	// プレイデータは Cleared & Failed に合わせて表示
	playDataWindow.style.animationDuration = `3s`;
	playDataWindow.style.animationName = `slowlyAppearing`;

	if (g_finishFlg && g_headerObj.resultDelayFrame > 0) {
		lblResultPre.style.animationDelay = `${g_headerObj.resultDelayFrame / g_fps}s`;
		playDataWindow.style.animationDelay = `${g_headerObj.resultDelayFrame / g_fps}s`;
	}

	// ハイスコア差分計算
	const assistFlg = (g_autoPlaysBase.includes(g_stateObj.autoPlay) ? `` : `-${g_stateObj.autoPlay}less`);
	let scoreName = `${g_headerObj.keyLabels[g_stateObj.scoreId]}k-${g_headerObj.difLabels[g_stateObj.scoreId]}${assistFlg}`;
	if (g_headerObj.makerView) {
		scoreName += `-${g_headerObj.creatorNames[g_stateObj.scoreId]}`;
	}
	const highscoreDfObj = {
		ii: 0,
		shakin: 0,
		matari: 0,
		shobon: 0,
		uwan: 0,
		kita: 0,
		iknai: 0,
		maxCombo: 0,
		fmaxCombo: 0,
		score: 0,
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
		resultWindow.appendChild(makeCssResultSymbol(`lblAutoView`, 230, g_cssObj.result_noRecord, 4, `(No Record)`));
		const lblAutoView = document.querySelector(`#lblAutoView`);
		lblAutoView.style.fontSize = `24px`;
	}

	// ユーザカスタムイベント(初期)
	if (typeof customResultInit === C_TYP_FUNCTION) {
		customResultInit();
		if (typeof customResultInit2 === C_TYP_FUNCTION) {
			customResultInit2();
		}
	}

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
	const hashTag = (g_headerObj.hashTag !== undefined ? ` ${g_headerObj.hashTag}` : ``);
	let tweetDifData = `${g_headerObj.keyLabels[g_stateObj.scoreId]}${transKeyData}k-${g_headerObj.difLabels[g_stateObj.scoreId]}${assistFlg}`;
	if (g_stateObj.shuffle !== `OFF`) {
		tweetDifData += `:${g_stateObj.shuffle}`;
	}
	const twiturl = new URL(g_localStorageUrl);
	twiturl.searchParams.append(`scoreId`, g_stateObj.scoreId);

	let tweetFrzJdg = ``;
	let tweetMaxCombo = `${g_resultObj.maxCombo}`;
	if (g_allFrz > 0) {
		tweetFrzJdg = `${g_resultObj.kita}-${g_resultObj.iknai}`;
		tweetMaxCombo += `-${g_resultObj.fmaxCombo}`;
	}

	let tweetResultTmp = g_headerObj.resultFormat.split(`[hashTag]`).join(`${hashTag}`)
		.split(`[musicTitle]`).join(`${musicTitle}`)
		.split(`[keyLabel]`).join(`${tweetDifData}`)
		.split(`[maker]`).join(`${g_headerObj.tuning}`)
		.split(`[rank]`).join(`${rankMark}`)
		.split(`[score]`).join(`${g_resultObj.score}`)
		.split(`[playStyle]`).join(`${playStyleData}`)
		.split(`[arrowJdg]`).join(`${g_resultObj.ii}-${g_resultObj.shakin}-${g_resultObj.matari}-${g_resultObj.shobon}-${g_resultObj.uwan}`)
		.split(`[frzJdg]`).join(tweetFrzJdg)
		.split(`[maxCombo]`).join(tweetMaxCombo)
		.split(`[url]`).join(`${twiturl.toString()}`.replace(/[\t\n]/g, ``));

	if (typeof g_presetResultVals === C_TYP_OBJECT) {
		Object.keys(g_presetResultVals).forEach(key => {
			tweetResultTmp = tweetResultTmp.split(`[${key}]`).join(g_resultObj[g_presetResultVals[key]]);
		});
	}
	const resultText = `${unEscapeHtml(tweetResultTmp)}`;
	const tweetResult = `https://twitter.com/intent/tweet?text=${encodeURIComponent(resultText)}`;

	// ボタン描画
	multiAppend(divRoot,

		// タイトル画面へ戻る
		createCss2Button(`btnBack`, g_lblNameObj.b_back, _ => {
			if (g_finishFlg) {
				g_audio.pause();
			}
			clearTimeout(g_timeoutEvtId);
			clearTimeout(g_timeoutEvtResultId);
			titleInit();
		}, {
			w: g_sWidth / 4, h: C_BTN_HEIGHT * 5 / 4,
			animationName: `smallToNormalY`,
		}, g_cssObj.button_Back),

		// リザルトデータをクリップボードへコピー
		createCss2Button(`btnCopy`, g_lblNameObj.b_copy, _ => {
			copyTextToClipboard(resultText);
			makeInfoWindow(g_msgInfoObj.I_0001, `leftToRightFade`);
		}, {
			x: g_sWidth / 4,
			w: g_sWidth / 2,
			h: C_BTN_HEIGHT * 5 / 8, siz: 24,
			animationName: `smallToNormalY`,
		}, g_cssObj.button_Setting),

		// リザルトデータをTwitterへ転送
		createCss2Button(`btnTweet`, g_lblNameObj.b_tweet, _ => openLink(tweetResult), {
			x: g_sWidth / 4, y: g_sHeight - 100 + C_BTN_HEIGHT * 5 / 8,
			w: g_sWidth / 4, h: C_BTN_HEIGHT * 5 / 8, siz: 24,
			animationName: `smallToNormalY`,
		}, g_cssObj.button_Tweet),

		// Gitterへのリンク
		createCss2Button(`btnGitter`, g_lblNameObj.b_gitter, _ => openLink(`https://gitter.im/danonicw/freeboard`), {
			x: g_sWidth / 2, y: g_sHeight - 100 + C_BTN_HEIGHT * 5 / 8,
			w: g_sWidth / 4, h: C_BTN_HEIGHT * 5 / 8, siz: 24,
			animationName: `smallToNormalY`,
		}, g_cssObj.button_Default),

		// リトライ
		createCss2Button(`btnRetry`, g_lblNameObj.b_retry, _ => {
			if (g_finishFlg) {
				g_audio.pause();
			}
			clearTimeout(g_timeoutEvtId);
			clearTimeout(g_timeoutEvtResultId);
			loadMusic();
		}, {
			x: g_sWidth / 4 * 3,
			w: g_sWidth / 4, h: C_BTN_HEIGHT * 5 / 4,
			animationName: `smallToNormalY`,
		}, g_cssObj.button_Reset),
	)

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
	function flowResultTimeline() {

		// ユーザカスタムイベント(フレーム毎)
		if (typeof customResultEnterFrame === C_TYP_FUNCTION) {
			customResultEnterFrame();
			if (typeof customResultEnterFrame2 === C_TYP_FUNCTION) {
				customResultEnterFrame2();
			}
		}

		// 背景・マスクモーション
		drawTitleResultMotion(`Result`);

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
	}

	g_timeoutEvtResultId = setTimeout(_ => flowResultTimeline(), 1000 / g_fps);

	// キー操作イベント（デフォルト）
	document.onkeydown = evt => blockCode(transCode(evt.code));
	document.onkeyup = evt => { }
	document.oncontextmenu = _ => true;

	if (typeof skinResultInit === C_TYP_FUNCTION) {
		skinResultInit();
		if (typeof skinResultInit2 === C_TYP_FUNCTION) {
			skinResultInit2();
		}
	}
}

/**
 * 結果表示作成（曲名、オプション）
 * @param {string} _id 
 * @param {number} _x
 * @param {string} _class 
 * @param {number} _heightPos 
 * @param {string, number} _text
 * @param {string} _align
 */
function makeCssResultPlayData(_id, _x, _class, _heightPos, _text, _align = C_ALIGN_CENTER) {
	return createDivCss2Label(_id, _text, {
		x: _x, y: 18 * _heightPos,
		w: 400, h: 18, siz: C_SIZ_MAIN, align: _align,
	}, _class);
}

/**
 * 結果表示作成（キャラクタ）
 * @param {string} _id 
 * @param {number} _x
 * @param {string} _class
 * @param {number} _heightPos 
 * @param {string, number} _text
 * @param {string} _align
 */
function makeCssResultSymbol(_id, _x, _class, _heightPos, _text, _align = C_ALIGN_LEFT) {
	return createDivCss2Label(_id, _text, {
		x: _x, y: 18 * _heightPos,
		w: 150, h: 18, siz: C_SIZ_JDGCNTS, align: _align,
	}, _class);
}

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