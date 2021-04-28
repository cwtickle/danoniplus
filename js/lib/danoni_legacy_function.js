'use strict';
/**
 * Dancing☆Onigiri (CW Edition)
 * 旧バージョン定義変数・関数
 *
 * Source by tickle
 * Created : 2019/11/19
 * Revised : 2021/04/28 (v22.0.0)
 *
 * https://github.com/cwtickle/danoniplus
 */

// ユーザインタフェース
// カスタム側で変更できるようにletで定義している（v10以降のカラーコード類は互換関数以外の利用用途なし）
let C_CLR_DEFAULT = `#333333`;
let C_CLR_DEFAULTA = `#111133`;
let C_CLR_DEFAULTB = `#333311`;
let C_CLR_DEFAULTC = `#331111`;
let C_CLR_DEFAULTD = `#113311`;
let C_CLR_DEFAULTE = `#113333`;
let C_CLR_DEFHOVER = `#666666`;
let C_CLR_BACK = `#000099`;
let C_CLR_NEXT = `#990000`;
let C_CLR_SETTING = `#999900`;
let C_CLR_RESET = `#009900`;
let C_CLR_TWEET = `#009999`;

let C_CLR_TEXT = `#ffffff`;
let C_CLR_TITLE = `#cccccc`;
let C_CLR_LOADING_BAR = `#eeeeee`;
let C_CLR_LNK = `#111111`;

// 判定キャラクタの色 (v10以降はcssで定義)
const C_CLR_II = `#66ffff`;
const C_CLR_SHAKIN = `#99ff99`;
const C_CLR_MATARI = `#ff9966`;
const C_CLR_UWAN = `#ff9999`;
const C_CLR_SHOBON = `#ccccff`;
const C_CLR_KITA = `#ffff99`;
const C_CLR_SFSF = ``;
const C_CLR_IKNAI = `#99ff66`;

// ライフゲージの色 (v10以降はcssで定義)
let C_CLR_MAXLIFE = `#444400`;
let C_CLR_CLEARLIFE = `#004444`;
let C_CLR_DEFAULTLIFE = `#444444`;
let C_CLR_BACKLIFE = `#222222`;

/**
 * 空スプライト(ムービークリップ相当)の作成
 * - 作成済みの場合はすでに作成済のスプライトを返却する
 * - ここで作成したスプライトは clearWindow() により削除される
 * @deprecated v21以降非推奨
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
 * ラベル文字作成（レイヤー直書き。htmlタグは使用できない）
 * @deprecated v10以降非推奨
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
* 子div要素のラベル文字作成 (v9互換用)
* - ここで指定するテキストはhtmlタグが使える
* @deprecated v10以降非推奨
* @param {string} _id 
* @param {number} _x 
* @param {number} _y 
* @param {number} _width 
* @param {number} _height 
* @param {number} _fontsize 
* @param {string} _color
* @param {string} _text 
*/
function createDivLabel(_id, _x, _y, _width, _height, _fontsize, _color, _text) {
    const div = createDiv(_id, _x, _y, _width, _height);
    const style = div.style;
    style.fontSize = `${_fontsize}px`;
    style.color = _color;
    style.fontFamily = getBasicFont();
    style.textAlign = C_ALIGN_CENTER;
    div.innerHTML = _text;

    return div;
}


/**
 * 子div要素のラベル文字作成 (CSS版, v16互換)
 * @deprecated v17以降非推奨
 * @param {string} _id 
 * @param {number} _x 
 * @param {number} _y 
 * @param {number} _width 
 * @param {number} _height 
 * @param {number} _fontsize 
 * @param {string} _text
 * @param {string} _class 
 */
function createDivCssLabel(_id, _x, _y, _width, _height, _fontsize, _text, _class = g_cssObj.title_base) {
    const div = createDiv(_id, _x, _y, _width, _height);
    div.classList.add(_class);

    const style = div.style;
    style.fontSize = `${_fontsize}px`;
    style.fontFamily = getBasicFont();
    style.textAlign = C_ALIGN_CENTER;
    div.innerHTML = _text;

    return div;
}

/**
 * 矢印オブジェクトの作成（色付きマスク版）- v10以降は未使用
 * @deprecated v10以降非推奨
 * @param {string} _id 
 * @param {string} _color 
 * @param {number} _x 
 * @param {number} _y 
 * @param {number} _size 
 * @param {number, string} _rotate 
 */
function createArrowEffect(_id, _color, _x, _y, _size, _rotate) {

    const div = createDiv(_id, _x, _y, _size, _size);

    // 矢印・おにぎり判定
    let charaStyle;
    if (isNaN(Number(_rotate))) {
        charaStyle = `${_rotate}`;
    } else {
        charaStyle = `arrow`;
        div.style.transform = `rotate(${_rotate}deg)`;
    }
    div.align = C_ALIGN_CENTER;

    if (_color !== ``) {
        div.style.backgroundColor = _color;
    }

    div.style.maskImage = `url("${g_imgObj[charaStyle]}")`;
    div.style.maskSize = `contain`;
    div.style.webkitMaskImage = `url("${g_imgObj[charaStyle]}")`;
    div.style.webkitMaskSize = `contain`;
    div.setAttribute(`color`, _color);

    return div;
}

/**
 * 色付きオブジェクトの作成 (v16互換)
 * @deprecated v17以降非推奨
 * @param {string} _id 
 * @param {string} _color 
 * @param {number} _x 
 * @param {number} _y 
 * @param {number} _width 
 * @param {number} _height 
 * @param {string} _rotate オブジェクト名／回転角度 (default : ``)
 * @param {string} _styleName オブジェクト種類 (default : ``)
 */
function createColorObject(_id, _color, _x, _y, _width, _height,
    _rotate = ``, _styleName = ``) {

    const div = createDiv(_id, _x, _y, _width, _height);

    // 矢印・オブジェクト判定
    let charaStyle;
    if (isNaN(Number(_rotate)) || _rotate === ``) {
        charaStyle = `${_rotate}${_styleName}`;
    } else {
        charaStyle = `arrow${_styleName}`;
        div.style.transform = `rotate(${_rotate}deg)`;
    }

    if (_color !== ``) {
        div.style.background = _color;
    }
    div.style.maskImage = `url("${g_imgObj[charaStyle]}")`;
    div.style.maskSize = `contain`;
    div.style.webkitMaskImage = `url("${g_imgObj[charaStyle]}")`;
    div.style.webkitMaskSize = `contain`;
    div.setAttribute(`color`, _color);
    div.setAttribute(`type`, charaStyle);

    return div;
}

/**
 * ボタンの作成 (v9互換版)
 * - ボタンの位置、色といった基本設定をここで指定
 * - 実際のボタンは以下のように設定して使用すること（表示されなくなる）
 * - ボタンの表示テキスト及びフォントは固定
 * 
 * -  使い方：
 *		const btnBack = createButton({
 *			// ボタンオブジェクト名
 *			id: `btnBack`,
 *			// ボタンに表示する名前
 *			name: `Back`,
 *			// 作成先のx座標 (appendChildする親に対する位置)
 *			x: 0,
 *			// 作成先のy座標 (appendChildする親に対する位置)
 *			y: g_sHeight-100,
 *			// 幅
 *			width: g_sWidth/3, 
 *			// 高さ
 *			height: C_BTN_HEIGHT, 
 *			// フォントサイズ
 *			fontsize: C_LBL_BTNSIZE,
 *			// 通常時の背景色 (カラーコード:#ffffff 形式)
 *			normalColor: C_CLR_DEFAULT, 
 *			// オンマウス時の背景色 (カラーコード:#ffffff 形式)
 *			hoverColor: C_CLR_BACK, 
 *			// 表示位置
 *			align: C_ALIGN_CENTER
 *		}, _ => {
 *			// ボタン押下後の処理
 *			clearWindow();
 *			titleInit();
 *		});
 *		divRoot.appendChild(btnBack);
 *   
 * @deprecated v10以降非推奨
 * @param {object} _obj ボタンオブジェクト
 * @param {function} _func ボタン押下後の処理（マウスハンドラ）
 */
function createButton(_obj, _func) {

    // ボタン用の子要素divを作成
    const div = createDiv(_obj.id, _obj.x, _obj.y, _obj.width, _obj.height);

    // ボタンの装飾を定義
    const style = div.style;
    div.innerHTML = _obj.name;
    style.textAlign = _obj.align;
    style.verticalAlign = C_VALIGN_MIDDLE;
    style.color = C_CLR_TEXT;
    style.fontSize = `${_obj.fontsize}px`;
    style.fontFamily = getBasicFont();
    style.backgroundColor = _obj.normalColor;
    style.transition = `background-color 0.25s linear`;
    if (setVal(_obj.animationName, ``, C_TYP_STRING) !== ``) {
        style.animationName = _obj.animationName;
        style.animationDuration = `1s`;
    }
    style.display = `flex`;
    style.flexDirection = `column`;
    style.justifyContent = `center`;

    // オンマウス・タップ時の挙動 (背景色変更、カーソル変化)
    div.onmouseover = _ => {
        style.backgroundColor = _obj.hoverColor;
        style.cursor = `pointer`;
    }
    const lsnrkeyTS = g_handler.addListener(div, `touchstart`, _ => {
        style.backgroundColor = _obj.hoverColor;
        style.cursor = `pointer`;
    });

    // 通常時の挙動 (背景色変更、カーソル変化)
    div.onmouseout = _ => {
        style.backgroundColor = _obj.normalColor;
        style.cursor = `default`;
    }
    const lsnrkeyTE = g_handler.addListener(div, `touchend`, _ => {
        style.backgroundColor = _obj.normalColor;
        style.cursor = `default`;
    });

    // ボタンを押したときの動作
    const lsnrkey = g_handler.addListener(div, `click`, _ => _func());

    // イベントリスナー用のキーをセット
    div.setAttribute(`lsnrkey`, lsnrkey);
    div.setAttribute(`lsnrkeyTS`, lsnrkeyTS);
    div.setAttribute(`lsnrkeyTE`, lsnrkeyTE);

    return div;
}

/**
 * ボタンの作成 (CSS版, v16互換)
 * - ボタンの位置、色といった基本設定をここで指定
 * - 実際のボタンは以下のように設定して使用すること（表示されなくなる）
 * - ボタンの表示テキスト及びフォントは固定
 * 
 * -  使い方：
 *		const btnBack = createButton({
 *			// ボタンオブジェクト名
 *			id: `btnBack`,
 *			// ボタンに表示する名前
 *			name: `Back`,
 *			// 作成先のx座標 (appendChildする親に対する位置)
 *			x: 0,
 *			// 作成先のy座標 (appendChildする親に対する位置)
 *			y: g_sHeight-100,
 *			// 幅
 *			width: g_sWidth/3, 
 *			// 高さ
 *			height: C_BTN_HEIGHT, 
 *			// フォントサイズ
 *			fontsize: C_LBL_BTNSIZE,
 *			// 表示位置
 *			align: C_ALIGN_CENTER,
 *			// CSSクラス名
 *			class: `class_name`,
 *		}, _ => {
 *			// ボタン押下後の処理
 *			clearWindow();
 *			titleInit();
 *		});
 *		divRoot.appendChild(btnBack);
 *   
 * @deprecated v17以降非推奨
 * @param {object} _obj ボタンオブジェクト
 * @param {function} _func ボタン押下後の処理（マウスハンドラ）
 */
function createCssButton(_obj, _func) {

    // ボタン用の子要素divを作成
    const div = createDiv(_obj.id, _obj.x, _obj.y, _obj.width, _obj.height);
    div.classList.add(`button_common`, _obj.class);

    // ボタンの装飾を定義
    const style = div.style;
    div.innerHTML = _obj.name;
    style.textAlign = _obj.align;
    style.verticalAlign = C_VALIGN_MIDDLE;
    style.fontSize = `${_obj.fontsize}px`;
    style.fontFamily = getBasicFont();
    if (hasVal(_obj.animationName)) {
        style.animationName = _obj.animationName;
        style.animationDuration = `1s`;
    }
    div.ontouchstart = ``;

    // ボタンを押したときの動作
    const lsnrkey = g_handler.addListener(div, `click`, _ => _func());

    // イベントリスナー用のキーをセット
    div.setAttribute(`lsnrkey`, lsnrkey);

    return div;
}

/**
 * 設定・オプション表示用ボタン - v9互換用
 * @deprecated v10以降非推奨
 * @param {string} _id 
 * @param {string} _name 初期設定文字
 * @param {number} _heightPos 上からの配置順
 * @param {function} _func 
 */
function makeSettingLblButton(_id, _name, _heightPos, _func) {
    const settingLblButton = createButton({
        id: _id,
        name: _name,
        x: C_LEN_SETLBL_LEFT,
        y: C_LEN_SETLBL_HEIGHT * _heightPos,
        width: C_LEN_SETLBL_WIDTH,
        height: C_LEN_SETLBL_HEIGHT,
        fontsize: C_SIZ_SETLBL,
        normalColor: C_CLR_LNK,
        hoverColor: C_CLR_DEFHOVER,
        align: C_ALIGN_CENTER
    }, _func);

    return settingLblButton;
}

/**
 * 譜面変更セレクター用ボタン - v9互換用
 * @deprecated v10以降非推奨
 * @param {string} _id
 * @param {string} _name 初期設定文字
 * @param {number} _heightPos 上からの配置順
 * @param {function} _func
 */
function makeDifLblButton(_id, _name, _heightPos, _func) {
    const difLblButton = createButton({
        id: _id,
        name: _name,
        x: 0,
        y: C_LEN_SETLBL_HEIGHT * _heightPos,
        width: C_LEN_SETLBL_WIDTH,
        height: C_LEN_SETLBL_HEIGHT,
        fontsize: C_SIZ_DIFSELECTOR,
        normalColor: C_CLR_LNK,
        hoverColor: C_CLR_DEFHOVER,
        align: C_ALIGN_CENTER
    }, _func);
    difLblButton.style.borderStyle = `solid`;
    difLblButton.style.borderColor = `#000000 #cccccc`;

    return difLblButton;
}

/**
 * 設定・オプション用の設定変更ミニボタン - v9互換用
 * @deprecated v10以降非推奨
 * @param {string} _id 
 * @param {string} _directionFlg 表示用ボタンのどちら側に置くかを設定。(R, RR:右、L, LL:左)
 * @param {number} _heightPos 上からの配置順
 * @param {function} _func 
 */
function makeMiniButton(_id, _directionFlg, _heightPos, _func) {
    const miniButton = createButton({
        id: _id + _directionFlg,
        name: eval(`C_LBL_SETMINI${_directionFlg}`),
        x: eval(`C_LEN_SETMINI${_directionFlg}_LEFT`),
        y: C_LEN_SETLBL_HEIGHT * _heightPos,
        width: C_LEN_SETMINI_WIDTH,
        height: C_LEN_SETLBL_HEIGHT,
        fontsize: C_SIZ_SETLBL,
        normalColor: C_CLR_DEFAULT,
        hoverColor: C_CLR_SETTING,
        align: C_ALIGN_CENTER
    }, _func);

    return miniButton;
}

/**
 * 結果表示作成（曲名、オプション）- v9互換用
 * @deprecated v10以降非推奨
 * @param {string} _id 
 * @param {number} _x
 * @param {string} _color 
 * @param {number} _heightPos 
 * @param {string, number} _text
 * @param {string} _align
 */
function makeResultPlayData(_id, _x, _color, _heightPos, _text, _align) {
    const symbol = createDivLabel(_id, _x, 18 * _heightPos,
        400, 18, 14, _color, _text);
    symbol.style.textAlign = _align;

    return symbol;
}

/**
 * 結果表示作成（キャラクタ）- v9互換用
 * @deprecated v10以降非推奨
 * @param {string} _id 
 * @param {number} _x
 * @param {string} _color 
 * @param {number} _heightPos 
 * @param {string, number} _text
 * @param {string} _align
 */
function makeResultSymbol(_id, _x, _color, _heightPos, _text, _align) {
    const symbol = createDivLabel(_id, _x, 18 * _heightPos,
        150, 18, 16, _color, _text);
    symbol.style.textAlign = _align;

    return symbol;
}

/**
 * 配列の型及び最小配列長のチェック
 * - チェックのみで変換は行わないため、変換が必要な場合は別途処理を組むこと。
 * - 型は最初の要素のみチェックを行う。
 * 
 * @deprecated v20以降非推奨
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
 * 半角換算の文字数を計算
 * @deprecated v20以降非推奨
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
 * @deprecated v20以降非推奨
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
 * 子div要素のラベル文字作成
 * - createDivLabelに加えて、独自フォントが指定できる形式。
 * 
 * @deprecated v20以降非推奨
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
