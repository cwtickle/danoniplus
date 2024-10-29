'use strict';
/**
 * Dancing☆Onigiri (CW Edition)
 * 旧関数のラップ関数群
 *
 * Source by tickle
 * Created : 2024/10/29 
 * Revised : ----/--/--
 *
 * https://github.com/cwtickle/danoniplus
 */

const createSprite = (_parentObjName, _newObjName, x, y, w, h, _options = {}) =>
    createEmptySprite(document.getElementById(_parentObjName), _newObjName, { x, y, w, h, title: _options?.description });

const createDivLabel = (_id, x, y, w, h, siz, color, _text) =>
    createDivCss2Label(_id, _text, { x, y, w, h, siz, color });

const createDivCustomLabel = (_id, x, y, w, h, siz, color, _text, _font) =>
    createDivCss2Label(_id, _text, { x, y, w, h, siz, color, fontFamily: _font });

const createDivCssLabel = (_id, x, y, w, h, siz, _text, _class = g_cssObj.title_base) =>
    createDivCss2Label(_id, _text, { x, y, w, h, siz }, _class);

const createArrowEffect = (_id, color, x, y, siz, rotate) =>
    createColorObject2(_id, { x, y, w: siz, h: siz, rotate, background: color });

const createColorObject = (_id, color, x, y, w, h, rotate = ``, styleName = ``) =>
    createColorObject2(_id, { x, y, w, h, rotate, styleName, background: color });

const createButton = (_obj, _func) => {
    const div = createCss2Button(_obj.id, _obj.name, _func, {
        x: _obj.x, y: _obj.y, w: _obj.w, h: _obj.h,
        siz: _obj?.fontsize, align: _obj?.align, animationName: _obj?.animationName,
        backgroundColor: _obj?.normalColor,
    });
    div.onmouseover = () => div.style.backgroundColor = _obj?.hoverColor;
    div.onmouseout = () => div.style.backgroundColor = _obj?.normalColor;
    return div;
};

const createCssButton = (_obj, _func) =>
    createCss2Button(_obj.id, _obj.name, _func, {
        x: _obj?.x, y: _obj?.y, w: _obj?.w, h: _obj?.h,
        siz: _obj?.fontsize, align: _obj?.align, animationName: _obj?.animationName
    }, _obj?.class);

const makeSettingLblButton = (_id, _name, _heightPos, _func) =>
    makeSettingLblCssButton(_id, _name, _heightPos, _func);

const makeDifLblButton = (_id, _name, _heightPos, _func) =>
    makeDifLblCssButton(_id, _name, _heightPos, _func);

const makeMiniButton = (_id, _directionFlg, _heightPos, _func) =>
    makeMiniCssButton(_id, _directionFlg, _heightPos, _func);

const makeResultPlayData = (_id, _x, _color, _heightPos, _text, _align) => {
    const div = makeCssResultPlayData(_id, _x, ``, _heightPos, _text, _align);
    div.style.color = _color;
    return div;
};

const makeResultSymbol = (_id, _x, _color, _heightPos, _text, _align) => {
    const div = makeCssResultSymbol(_id, _x, ``, _heightPos, _text, _align);
    div.style.color = _color;
    return div;
}

const checkArrayVal = (_checkArray, _type, _minLength) => {
    const checkFlg = hasArrayList(_checkArray, _minLength);
    if (_type === C_TYP_FLOAT) {
        if (Number.isNaN(parseFloat(_checkArray[0]))) {
            return false;
        }
    } else if (_type === C_TYP_NUMBER) {
        if (Number.isNaN(parseInt(_checkArray[0]))) {
            return false;
        }
    }
    return checkFlg;
};

const paddingLeft = (_str, _length, _chr) => String(_str)?.padStart(_length, _chr);

const convertreplaceNums = () => {
    console.warn('convertreplaceNums is deprecated. Use convertReplaceNums instead.');
    convertReplaceNums();
};
const MainInit = () => {
    console.warn('MainInit is deprecated. Use mainInit instead.');
    mainInit();
};

let C_CLR_DEFAULT = `#333333`;
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

const C_CLR_II = `#66ffff`;
const C_CLR_SHAKIN = `#99ff99`;
const C_CLR_MATARI = `#ff9966`;
const C_CLR_UWAN = `#ff9999`;
const C_CLR_SHOBON = `#ccccff`;
const C_CLR_KITA = `#ffff99`;
const C_CLR_IKNAI = `#99ff66`;

let C_CLR_MAXLIFE = `#444400`;
let C_CLR_CLEARLIFE = `#004444`;
let C_CLR_DEFAULTLIFE = `#444444`;
let C_CLR_BACKLIFE = `#222222`;

const C_LBL_TITLESIZE = 32;
const C_LBL_BTNSIZE = 28;
const C_LBL_LNKSIZE = 16;

const C_BTN_HEIGHT = 50;
const C_LNK_HEIGHT = 30;
const C_LEN_SETLBL_LEFT = 160;
const C_LEN_SETLBL_WIDTH = 210;
const C_LEN_DIFSELECTOR_WIDTH = 250;
const C_LEN_DIFCOVER_WIDTH = 110;
const C_LEN_SETLBL_HEIGHT = 22;
const C_SIZ_SETLBL = 17;
const C_LEN_SETDIFLBL_HEIGHT = 25;
const C_SIZ_SETDIFLBL = 17;
const C_LEN_SETMINI_WIDTH = 40;
const C_SIZ_SETMINI = 18;
const C_SIZ_DIFSELECTOR = 14;
const C_SIZ_MAIN = 14;
const C_SIZ_MUSIC_TITLE = 13;

const C_LEN_JDGCHARA_WIDTH = 200;
const C_LEN_JDGCHARA_HEIGHT = 20;
const C_SIZ_JDGCHARA = 20;

const C_LEN_JDGCNTS_WIDTH = 100;
const C_LEN_JDGCNTS_HEIGHT = 20;
const C_SIZ_JDGCNTS = 16;

const C_LEN_GRAPH_WIDTH = 286;
const C_LEN_GRAPH_HEIGHT = 226;
const C_CLR_SPEEDGRAPH_SPEED = `#cc3333`;
const C_CLR_SPEEDGRAPH_BOOST = `#999900`;
const C_CLR_DENSITY_MAX = `#990000cc`;
const C_CLR_DENSITY_DEFAULT = `#999999cc`;
const C_LEN_DENSITY_DIVISION = 16;

const C_MAX_ADJUSTMENT = 30;