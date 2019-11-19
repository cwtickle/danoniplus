`use strict`;
/**
 * Dancing☆Onigiri (CW Edition)
 * 旧バージョン定義関数
 *
 * Source by tickle
 * Created : 2019/11/19
 * Revised : 2019/11/19
 *
 * https://github.com/cwtickle/danoniplus
 */

/**
* 子div要素のラベル文字作成 (v9互換用)
* - ここで指定するテキストはhtmlタグが使える
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
 * 矢印オブジェクトの作成（色付きマスク版）- v10以降は未使用
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
 * 設定・オプション表示用ボタン - v9互換用
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

