﻿'use strict';
/**
 * Dancing☆Onigiri (CW Edition)
 * 定数・初期設定用ファイル
 *
 * Source by tickle
 * Created : 2019/11/19
 * Revised : 2021/06/13 (v22.5.1)
 *
 * https://github.com/cwtickle/danoniplus
 */

/**
 * 汎用定数定義
 */
// 表示位置
const C_ALIGN_LEFT = `left`;
const C_ALIGN_CENTER = `center`;
const C_ALIGN_RIGHT = `right`;
const C_VALIGN_TOP = `top`;
const C_VALIGN_MIDDLE = `middle`;
const C_VALIGN_BOTTOM = `bottom`;

const C_LBL_TITLESIZE = 32;
const C_LBL_BTNSIZE = 28;
const C_LBL_LNKSIZE = 16;
const C_LBL_BASICFONT = `"Meiryo UI", sans-serif`;

const C_BTN_HEIGHT = 50;
const C_LNK_HEIGHT = 20;

// スプライト（ムービークリップ相当）のルート
const C_SPRITE_ROOT = `divRoot`;

const g_userAgent = window.navigator.userAgent.toLowerCase(); // msie, edge, chrome, safari, firefox, opera
const g_isIos = listMatching(g_userAgent, [`iphone`, `ipad`, `ipod`]);
const g_isMac = listMatching(g_userAgent, [`iphone`, `ipad`, `ipod`, `mac os`]);

const g_isFile = location.href.match(/^file/);
const g_isLocal = location.href.match(/^file/) || location.href.indexOf(`localhost`) !== -1;

// 変数型
const C_TYP_BOOLEAN = `boolean`;
const C_TYP_NUMBER = `number`;
const C_TYP_STRING = `string`;
const C_TYP_FLOAT = `float`;
const C_TYP_OBJECT = `object`;
const C_TYP_FUNCTION = `function`;
const C_TYP_SWITCH = `switch`;
const C_TYP_CALC = `calc`;

const g_imgObj = {};

// 画像ファイル
let C_IMG_ARROW = `../img/arrow.svg`;
let C_IMG_ARROWSD = `../img/arrowShadow.svg`;
let C_IMG_ONIGIRI = `../img/onigiri.svg`;
let C_IMG_AASD = `../img/aaShadow.svg`;
let C_IMG_GIKO = `../img/giko.svg`;
let C_IMG_IYO = `../img/iyo.svg`;
let C_IMG_C = `../img/c.svg`;
let C_IMG_MORARA = `../img/morara.svg`;
let C_IMG_MONAR = `../img/monar.svg`;
let C_IMG_CURSOR = `../img/cursor.svg`;
let C_IMG_FRZBAR = `../img/frzbar.svg`;
let C_IMG_LIFEBAR = `../img/frzbar.svg`;
let C_IMG_LIFEBORDER = `../img/borderline.svg`;

if (typeof loadBinary === C_TYP_FUNCTION) {
    loadBinary();
}

// jsファイル
const C_JSF_CUSTOM = `danoni_custom.js`;
const C_JSF_BLANK = `danoni_blank.js`;

// ディレクトリパス
const C_DIR_JS = `../js/`;
const C_DIR_CSS = `../css/`;
const C_DIR_MUSIC = `../music/`;
const C_DIR_SKIN = `../skin/`;

// カレントディレクトリマーク
const C_MRK_CURRENT_DIRECTORY = `(..)`;

/**
 * カスタム画像セットの設定（サーバ上の場合のみ有効）
 * 
 * 用途としては、StepRtnにて既定種以外のオブジェクトを指定するときに使用することを想定
 * 例：stepRtn7i_0: [`giko2`, `onigiri`, `iyo`, 0, -90, 90, 180],
 *     この場合は、`giko2`について giko2.svg(png), giko2Shadow.svg, giko2StepHit.svg というファイルを
 *     個別にimgフォルダに入れておくことで使用できるようにする（現状、回転には非対応）
 * 
 * @param {string} _name 追加するオブジェクト種の名前
 * @param {string} _baseDir ベースディレクトリ
 * @param {string} _exp 拡張子 
 */
const reloadImgCustomObj = (_name, _baseDir = ``, _exp = `svg`) => {
    const baseDir = (_baseDir === `` ? `` : `${_baseDir}/`);
    g_imgObj[_name] = `../img/${baseDir}${_name}.${_exp}`;
    g_imgObj[`${_name}Shadow`] = `../img/${baseDir}${_name}Shadow.${_exp}`;
    g_imgObj[`${_name}Step`] = `../img/${baseDir}${_name}.${_exp}`;
    g_imgObj[`${_name}StepHit`] = `../img/${baseDir}${_name}StepHit.${_exp}`;
};

/**
 * 画像セットのリセット処理（サーバ上の場合のみ有効）
 * 下記のreloadImgObjとセットで使用して有効になる
 * @param {string} _baseDir 
 * @param {string} _exp 
 */
const resetImgs = (_baseDir = ``, _exp = `svg`) => {
    const baseDir = (_baseDir === `` ? `` : `${_baseDir}/`);
    C_IMG_ARROW = `../img/${baseDir}arrow.${_exp}`;
    C_IMG_ARROWSD = `../img/${baseDir}arrowShadow.${_exp}`;
    C_IMG_ONIGIRI = `../img/${baseDir}onigiri.${_exp}`;
    C_IMG_AASD = `../img/${baseDir}aaShadow.${_exp}`;
    C_IMG_GIKO = `../img/${baseDir}giko.${_exp}`;
    C_IMG_IYO = `../img/${baseDir}iyo.${_exp}`;
    C_IMG_C = `../img/${baseDir}c.${_exp}`;
    C_IMG_MORARA = `../img/${baseDir}morara.${_exp}`;
    C_IMG_MONAR = `../img/${baseDir}monar.${_exp}`;
    C_IMG_CURSOR = `../img/${baseDir}cursor.${_exp}`;
    C_IMG_FRZBAR = `../img/${baseDir}frzbar.${_exp}`;
    C_IMG_LIFEBAR = `../img/${baseDir}frzbar.${_exp}`;
    C_IMG_LIFEBORDER = `../img/${baseDir}borderline.${_exp}`;

    if (typeof g_presetCustomImageList === C_TYP_OBJECT) {
        g_presetCustomImageList.forEach(image => reloadImgCustomObj(image, _baseDir, _exp));
    }
}

const reloadImgObj = _ => {
    g_imgObj.arrow = C_IMG_ARROW;
    g_imgObj.arrowShadow = C_IMG_ARROWSD;
    g_imgObj.onigiri = C_IMG_ONIGIRI;
    g_imgObj.onigiriShadow = C_IMG_AASD;
    g_imgObj.giko = C_IMG_GIKO;
    g_imgObj.gikoShadow = C_IMG_AASD;
    g_imgObj.iyo = C_IMG_IYO;
    g_imgObj.iyoShadow = C_IMG_AASD;
    g_imgObj.c = C_IMG_C;
    g_imgObj.cShadow = C_IMG_AASD;
    g_imgObj.morara = C_IMG_MORARA;
    g_imgObj.moraraShadow = C_IMG_AASD;
    g_imgObj.monar = C_IMG_MONAR;
    g_imgObj.monarShadow = C_IMG_AASD;

    g_imgObj.arrowStep = C_IMG_ARROW;
    g_imgObj.arrowShadowStep = C_IMG_ARROWSD;
    g_imgObj.onigiriStep = C_IMG_ONIGIRI;
    g_imgObj.onigiriShadowStep = C_IMG_AASD;
    g_imgObj.gikoStep = C_IMG_GIKO;
    g_imgObj.gikoShadowStep = C_IMG_AASD;
    g_imgObj.iyoStep = C_IMG_IYO;
    g_imgObj.iyoShadowStep = C_IMG_AASD;
    g_imgObj.cStep = C_IMG_C;
    g_imgObj.cShadowStep = C_IMG_AASD;
    g_imgObj.moraraStep = C_IMG_MORARA;
    g_imgObj.moraraShadowStep = C_IMG_AASD;
    g_imgObj.monarStep = C_IMG_MONAR;
    g_imgObj.monarShadowStep = C_IMG_AASD;

    g_imgObj.arrowStepHit = C_IMG_ARROW;
    g_imgObj.onigiriStepHit = C_IMG_ONIGIRI;
    g_imgObj.gikoStepHit = C_IMG_GIKO;
    g_imgObj.iyoStepHit = C_IMG_IYO;
    g_imgObj.cStepHit = C_IMG_C;
    g_imgObj.moraraStepHit = C_IMG_MORARA;
    g_imgObj.monarStepHit = C_IMG_MONAR;

    g_imgObj.cursor = C_IMG_CURSOR;
    g_imgObj.frzBar = C_IMG_FRZBAR;
    g_imgObj.lifeBar = C_IMG_LIFEBAR;
    g_imgObj.lifeBorder = C_IMG_LIFEBORDER;
};
reloadImgObj();

// g_imgObjのうち、初期読込するリスト
const g_imgInitList = [
    `arrow`, `arrowShadow`, `onigiri`, `onigiriShadow`,
    `giko`, `iyo`, `c`, `morara`, `monar`, `cursor`, `frzBar`, `lifeBorder`,
];

// 読込対象の画像拡張子
let g_imgExtensions = [`png`, `gif`, `bmp`, `jpg`, `jpeg`, `svg`];

// オブジェクト種別
const g_typeLists = {
    arrow: [`arrow`, `dummyArrow`, `frz`, `dummyFrz`],
    color: [`color`, `acolor`, `shadowColor`, `ashadowColor`],
    frzColor: [`Normal`, `NormalBar`, `Hit`, `HitBar`],
    dataList: [
        `Arrow`, `FrzArrow`, `FrzLength`,
        `Color`, `ColorCd`, `FColor`, `FColorCd`,
        `AColor`, `AColorCd`, `FAColor`, `FAColorCd`,
        `shadowColor`, `shadowColorCd`, `FshadowColor`, `FshadowColorCd`,
        `AshadowColor`, `AshadowColorCd`, `FAshadowColor`, `FAshadowColorCd`,
        `ArrowCssMotion`, `ArrowCssMotionName`,
        `FrzCssMotion`, `FrzCssMotionName`,
    ],
};

// Motionオプション配列の基準位置
const C_MOTION_STD_POS = 15;

// キーブロック対象(キーコードを指定)
const C_BLOCK_KEYS = [
    8, 9, 13, 17, 18, 32, /* BackSpace, Tab, Enter, Ctrl, Alt, Space */
    33, 34, 35, 36,       /* PageUp, PageDown, End, Home */
    37, 38, 39, 40, 46,   /* Left, Down, Up, Right, Delete */
    112, 113, 114, 115, 0, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, /* F1～F15 (F5は除く) */
    27 /* Esc */
];

/** 設定・オプション画面用共通 */
const C_LEN_SETLBL_LEFT = 160;
const C_LEN_SETLBL_WIDTH = 210;
const C_LEN_DIFSELECTOR_WIDTH = 250;
const C_LEN_DIFCOVER_WIDTH = 110;
const C_LEN_SETLBL_HEIGHT = 23;
const C_SIZ_SETLBL = 17;
const C_LEN_SETDIFLBL_HEIGHT = 25;
const C_SIZ_SETDIFLBL = 17;
const C_LEN_SETMINI_WIDTH = 40;
const C_SIZ_SETMINI = 18;
const C_SIZ_DIFSELECTOR = 14;
const C_SIZ_MAIN = 14;

const C_LEN_GRAPH_WIDTH = 286;
const C_LEN_GRAPH_HEIGHT = 226;
const C_CLR_SPEEDGRAPH_SPEED = `#cc3333`;
const C_CLR_SPEEDGRAPH_BOOST = `#999900`;
const C_CLR_DENSITY_MAX = `#990000cc`;
const C_CLR_DENSITY_DEFAULT = `#999999cc`;
const C_LEN_DENSITY_DIVISION = 16;

const g_settingBtnObj = {
    chara: {
        L: `<`,
        LL: `<`,
        R: `>`,
        RR: `>`,
        D: `↓`,
        U: `↑`,
    },
    pos: {
        L: C_LEN_SETLBL_LEFT - C_LEN_SETMINI_WIDTH,
        LL: C_LEN_SETLBL_LEFT,
        R: C_LEN_SETLBL_LEFT + C_LEN_SETLBL_WIDTH,
        RR: C_LEN_SETLBL_LEFT + C_LEN_SETLBL_WIDTH - C_LEN_SETMINI_WIDTH,
    }
};

const C_MAX_ADJUSTMENT = 30;
const C_MAX_SPEED = 10;
const C_MIN_SPEED = 1;

const C_KYC_HEIGHT = 145;
const C_KYC_REPHEIGHT = 16;

const C_FRM_AFTERFADE = 420;
const C_FRM_FRZATTEMPT = 5;

/** ショートカットキー */
const C_KEY_RETRY = 8;
const C_KEY_TITLEBACK = 46;

/** 判定系共通オブジェクト */
const g_judgObj = {
    arrowJ: [2, 4, 6, 8, 8],
    frzJ: [2, 4, 8]
};
const g_judgPosObj = {
    ii: 0, shakin: 1, matari: 2, shobon: 3, uwan: 4,
    kita: 0, sfsf: 1, iknai: 2,
};

const C_CLR_DUMMY = `#777777`;

const C_LEN_JDGCHARA_WIDTH = 200;
const C_LEN_JDGCHARA_HEIGHT = 20;
const C_SIZ_JDGCHARA = 20;

const C_LEN_JDGCNTS_WIDTH = 100;
const C_LEN_JDGCNTS_HEIGHT = 20;
const C_SIZ_JDGCNTS = 16;

let C_FRM_HITMOTION = 4;
let C_FRM_JDGMOTION = 60;

/** 結果画面用共通オブジェクト */
const g_resultObj = {
    ii: 0,
    shakin: 0,
    matari: 0,
    shobon: 0,
    uwan: 0,
    kita: 0,
    sfsf: 0,
    iknai: 0,
    combo: 0,
    maxCombo: 0,
    fCombo: 0,
    fmaxCombo: 0,
    score: 0,

    fast: 0,
    slow: 0,

    spState: ``,
};

const C_RLT_BRACKET_L = 210;
const C_RLT_HIDIF_X = 165;
const C_RLT_BRACKET_R = 320;

let g_allArrow = 0;
let g_allFrz = 0;
let g_fullArrows = 0;
let g_currentArrows = 0;
const g_rankObj = {
    rankMarks: [`SS`, `S`, `SA`, `AAA`, `AA`, `A`, `B`, `C`],
    rankRate: [97, 90, 85, 80, 75, 70, 50, 0],
    rankColor: [`#00ccff`, `#6600ff`, `#ff9900`, `#ff0000`, `#00ff00`, `#ff00ff`, `#cc00ff`, `#cc9933`],

    rankMarkPF: `PF`,
    rankColorPF: `#cccc00`,
    rankMarkC: `C`,
    rankColorC: `#cc9933`,
    rankMarkF: `F`,
    rankColorF: `#999999`,
    rankMarkX: `X`,
    rankColorX: `#996600`
};

const g_pointAllocation = {
    ii: 8,
    shakin: 4,
    matari: 2,
    kita: 8,
    sfsf: 4,
    maxCombo: 2,
    fmaxCombo: 2,
}

let C_WOD_FRAME = 30;

// 譜面データ持ち回り用
const g_stateObj = {
    dosDivideFlg: false,
    scoreLockFlg: false,
    scoreId: 0,
    dummyId: ``,
    speed: 3.5,
    motion: C_FLG_OFF,
    reverse: C_FLG_OFF,
    scroll: `---`,
    shuffle: C_FLG_OFF,
    autoPlay: C_FLG_OFF,
    autoAll: C_FLG_OFF,
    gauge: `Normal`,
    adjustment: 0,
    fadein: 0,
    volume: 100,
    lifeRcv: 2,
    lifeDmg: 7,
    lifeMode: `Border`,
    lifeBorder: 70,
    lifeInit: 25,
    lifeVariable: C_FLG_OFF,
    filterKeys: ``,

    extraKeyFlg: false,
    dataSaveFlg: true,
    scoreDetailViewFlg: false,
    scoreDetail: `Speed`,

    d_stepzone: C_FLG_ON,
    d_judgment: C_FLG_ON,
    d_fastslow: C_FLG_ON,
    d_lifegauge: C_FLG_ON,
    d_musicinfo: C_FLG_ON,
    d_score: C_FLG_ON,
    d_filterline: C_FLG_ON,

    d_color: C_FLG_ON,
    d_speed: C_FLG_ON,
    d_arroweffect: C_FLG_ON,
    d_lyrics: C_FLG_ON,
    d_background: C_FLG_ON,
    d_special: C_FLG_ON,
    appearance: `Visible`,
    opacity: 100,
};

const C_VAL_MAXLIFE = 1000;
let C_CLR_BORDER = `#555555`;
const C_LFE_SURVIVAL = `Survival`;
const C_LFE_BORDER = `Border`;
const C_LFE_CUSTOM = `Custom`;
const C_LFE_MAXLIFE = `maxLife`;

/**
 * ゲージ初期設定
 */
const g_gaugeOptionObj = {
    survival: [`Original`, `Heavy`, `NoRecovery`, `SuddenDeath`, `Practice`, `Light`],
    border: [`Normal`, `Hard`, `SuddenDeath`, `Easy`],
    custom: [],
    customDefault: [],
    customFulls: {},

    initSurvival: [25, 50, 100, 100, 50, 25],
    rcvSurvival: [6, 2, 0, 0, 0, 12],
    dmgSurvival: [40, 50, 50, C_LFE_MAXLIFE, 0, 40],
    typeSurvival: [C_LFE_SURVIVAL, C_LFE_SURVIVAL, C_LFE_SURVIVAL, C_LFE_SURVIVAL, C_LFE_SURVIVAL, C_LFE_SURVIVAL],
    varSurvival: [C_FLG_OFF, C_FLG_OFF, C_FLG_OFF, C_FLG_OFF, C_FLG_OFF, C_FLG_OFF],
    clearSurvival: [0, 0, 0, 0, 0, 0],

    initBorder: [25, 100, 100, 25],
    rcvBorder: [2, 1, 0, 4],
    dmgBorder: [7, 50, C_LFE_MAXLIFE, 7],
    typeBorder: [C_LFE_BORDER, C_LFE_BORDER, C_LFE_SURVIVAL, C_LFE_BORDER],
    varBorder: [C_FLG_ON, C_FLG_ON, C_FLG_OFF, C_FLG_ON],
    clearBorder: [70, 0, 0, 70],

    varCustom: [],
    varCustomDefault: [],
    defaultList: [`survival`, `border`],
    defaultPlusList: [`survival`, `border`, `customDefault`],
};
let g_gaugeType;

const g_autoPlaysBase = [C_FLG_OFF, C_FLG_ALL];

let g_appearanceRanges = [`Hidden+`, `Sudden+`, `Hid&Sud+`];

// 設定系全般管理
const g_settings = {
    speeds: [...Array((C_MAX_SPEED - C_MIN_SPEED) * 4 + 1).keys()].map(i => C_MIN_SPEED + i / 4),
    speedNum: 0,

    motions: [C_FLG_OFF, `Boost`, `Brake`],
    motionNum: 0,

    reverses: [C_FLG_OFF, C_FLG_ON],
    reverseNum: 0,

    scrolls: [],
    scrollNum: 0,

    shuffles: [C_FLG_OFF, `Mirror`, `Asym-Mirror`, `Random`, `Random+`, `S-Random`, `S-Random+`],
    shuffleNum: 0,

    gauges: [],
    gaugeNum: 0,

    autoPlays: [C_FLG_OFF, C_FLG_ALL],
    autoPlayNum: 0,

    adjustments: [...Array(C_MAX_ADJUSTMENT * 2 + 1).keys()].map(i => i - C_MAX_ADJUSTMENT),
    adjustmentNum: C_MAX_ADJUSTMENT,

    volumes: [0, 0.5, 1, 2, 5, 10, 25, 50, 75, 100],

    appearances: [`Visible`, `Hidden`, `Hidden+`, `Sudden`, `Sudden+`, `Hid&Sud+`],
    appearanceNum: 0,

    opacitys: [10, 25, 50, 75, 100],

    scoreDetails: [`Speed`, `Density`, `ToolDif`],
    scoreDetailNum: 0,
};

g_settings.volumeNum = g_settings.volumes.length - 1;
g_settings.opacityNum = g_settings.opacitys.length - 1;

/**
 * シャッフル適用関数
 */
const g_shuffleFunc = {
    'OFF': _ => true,
    'Mirror': (keyNum, shuffleGroup) => applyMirror(keyNum, shuffleGroup),
    'Asym-Mirror': (keyNum, shuffleGroup) => applyMirror(keyNum, shuffleGroup, true),
    'Random': (keyNum, shuffleGroup) => applyRandom(keyNum, shuffleGroup),
    'Random+': keyNum => applyRandom(keyNum, [[...Array(keyNum).keys()]]),
    'S-Random': (keyNum, shuffleGroup) => {
        applySRandom(keyNum, shuffleGroup, `arrow`, `frz`);
        applySRandom(keyNum, shuffleGroup, `dummyArrow`, `dummyFrz`);
    },
    'S-Random+': keyNum => {
        applySRandom(keyNum, [[...Array(keyNum).keys()]], `arrow`, `frz`);
        applySRandom(keyNum, [[...Array(keyNum).keys()]], `dummyArrow`, `dummyFrz`);
    },
};

const g_keycons = {
    configTypes: [`Main`, `Replaced`, `ALL`],
    configTypeNum: 0,

    colorTypes: [`Default`, `Type0`, `Type1`, `Type2`, `Type3`, `Type4`],
    colorDefs: [C_FLG_ON, C_FLG_ON, C_FLG_OFF, C_FLG_OFF, C_FLG_OFF, C_FLG_OFF],
    colorTypeNum: 0,

    imgTypes: [`Default`, `Base`],
    imgTypeNum: 0,

    colorGroupNum: 0,
    shuffleGroupNum: 0,
};

let g_displays = [`stepZone`, `judgment`, `fastSlow`, `lifeGauge`, `score`, `musicInfo`, `filterLine`,
    `speed`, `color`, `lyrics`, `background`, `arrowEffect`, `special`];

let g_storeSettings = [`appearance`, `opacity`, `d_stepzone`, `d_judgment`, `d_fastslow`, `d_lifegauge`,
    `d_score`, `d_musicinfo`, `d_filterline`];

let g_canDisabledSettings = [`motion`, `scroll`, `shuffle`, `autoPlay`, `gauge`, `appearance`];

// サイズ(後で指定)
let g_sWidth;
let g_sHeight;

const g_hidSudObj = {
    filterPos: 10,
    pgDown: {},
    pgUp: {},
    std: {},
    filterPosDefault: {},

    'Visible': 1,
    'Hidden': 0,
    'Hidden+': 0,
    'Sudden': 1,
    'Sudden+': 1,
    'Hid&Sud+': 1,

    filterPosDefault: {
        'Visible': 0,
        'Hidden': 50,
        'Sudden': 40,
    },
    pgDown: {
        'Hidden+': { OFF: `PageDown`, ON: `PageUp`, },
        'Sudden+': { OFF: `PageUp`, ON: `PageDown`, },
        'Hid&Sud+': { OFF: `PageUp`, ON: `PageDown`, },
    },
    pgUp: {
        'Hidden+': { OFF: `PageUp`, ON: `PageDown`, },
        'Sudden+': { OFF: `PageDown`, ON: `PageUp`, },
        'Hid&Sud+': { OFF: `PageDown`, ON: `PageUp`, },
    },
    std: {
        'Hidden+': { OFF: 0, ON: 1, },
        'Sudden+': { OFF: 1, ON: 0, },
        'Hid&Sud+': { OFF: 1, ON: 0, },
    },
};

// ステップゾーン位置、到達距離(後で指定)
const C_STEP_Y = 70;
const C_STEP_YR = 0;

const g_posObj = {
    stepY: 70,
    distY: 0,
    reverseStepY: 0,
    stepYR: 0,
    stepDiffY: 0,
    arrowHeight: 0,
}

const g_diffObj = {
    arrowJdgY: 0,
    frzJdgY: 0,
};

// キーコンフィグカーソル
let g_currentj = 0;
let g_currentk = 0;
let g_prevKey = -1;

// キーコード
const g_kCd = [];
const g_kCdN = [];
for (let j = 0; j < 255; j++) {
    g_kCd[j] = ``;
    g_kCdN[j] = ``;
}

// キー表示用
g_kCd[0] = `- - -`;
g_kCd[1] = `Unknown`;
g_kCd[8] = (g_isMac ? `Delete` : `BackSpace`);
g_kCd[9] = `Tab`;
g_kCd[12] = `Clear`;
g_kCd[13] = `Enter`;
g_kCd[16] = `Shift`;
g_kCd[17] = `Ctrl`;
g_kCd[18] = `Alt`;
g_kCd[19] = `Pause`;
g_kCd[27] = `Esc`;
g_kCd[28] = `Conv`;
g_kCd[29] = `noConv`;
g_kCd[32] = `Space`;
g_kCd[33] = `PgUp`;
g_kCd[34] = `PgDown`;
g_kCd[35] = `End`;
g_kCd[36] = `Home`;
g_kCd[37] = `←`;
g_kCd[38] = `↑`;
g_kCd[39] = `→`;
g_kCd[40] = `↓`;
g_kCd[44] = `PS`;
g_kCd[45] = `Insert`;
g_kCd[46] = `Delete`;
g_kCd[47] = `Help`;
g_kCd[48] = `0`;
g_kCd[49] = `1`;
g_kCd[50] = `2`;
g_kCd[51] = `3`;
g_kCd[52] = `4`;
g_kCd[53] = `5`;
g_kCd[54] = `6`;
g_kCd[55] = `7`;
g_kCd[56] = `8`;
g_kCd[57] = `9`;
g_kCd[65] = `A`;
g_kCd[66] = `B`;
g_kCd[67] = `C`;
g_kCd[68] = `D`;
g_kCd[69] = `E`;
g_kCd[70] = `F`;
g_kCd[71] = `G`;
g_kCd[72] = `H`;
g_kCd[73] = `I`;
g_kCd[74] = `J`;
g_kCd[75] = `K`;
g_kCd[76] = `L`;
g_kCd[77] = `M`;
g_kCd[78] = `N`;
g_kCd[79] = `O`;
g_kCd[80] = `P`;
g_kCd[81] = `Q`;
g_kCd[82] = `R`;
g_kCd[83] = `S`;
g_kCd[84] = `T`;
g_kCd[85] = `U`;
g_kCd[86] = `V`;
g_kCd[87] = `W`;
g_kCd[88] = `X`;
g_kCd[89] = `Y`;
g_kCd[90] = `Z`;
g_kCd[91] = `Window`;
g_kCd[93] = `Appli`;
g_kCd[96] = `T0`;
g_kCd[97] = `T1`;
g_kCd[98] = `T2`;
g_kCd[99] = `T3`;
g_kCd[100] = `T4`;
g_kCd[101] = `T5`;
g_kCd[102] = `T6`;
g_kCd[103] = `T7`;
g_kCd[104] = `T8`;
g_kCd[105] = `T9`;
g_kCd[106] = `T*`;
g_kCd[107] = `T+`;
g_kCd[108] = `TEnter`;
g_kCd[109] = `T-`;
g_kCd[110] = `T_`;
g_kCd[111] = `T/`;
g_kCd[112] = `F1`;
g_kCd[113] = `F2`;
g_kCd[114] = `F3`;
g_kCd[115] = `F4`;
g_kCd[116] = `F5`;
g_kCd[117] = `F6`;
g_kCd[118] = `F7`;
g_kCd[119] = `F8`;
g_kCd[120] = `F9`;
g_kCd[121] = `F10`;
g_kCd[122] = `F11`;
g_kCd[123] = `F12`;
g_kCd[124] = `F13`;
g_kCd[125] = `F14`;
g_kCd[126] = `F15`;
g_kCd[134] = `FN`;
g_kCd[144] = `NumLk`;
g_kCd[145] = `SL`;
g_kCd[186] = `： *`;
g_kCd[187] = `; +`;
g_kCd[188] = `, <`;
g_kCd[189] = `- =`;
g_kCd[190] = `. >`;
g_kCd[191] = `/ ?`;
g_kCd[192] = "@ `";
g_kCd[219] = `[ {`;
g_kCd[220] = `\\ |`;
g_kCd[221] = `] }`;
g_kCd[222] = `^ ~`;
g_kCd[226] = `\\ _`;
g_kCd[229] = `IME`;
g_kCd[240] = `CapsLk`;

// 従来のキーコードとの変換用
g_kCdN[0] = `- - -`; // 無効値
g_kCdN[1] = ``; // 特殊キー(PR #924 参照)
g_kCdN[8] = `Backspace`;
g_kCdN[9] = `Tab`;
g_kCdN[12] = `Clear`;
g_kCdN[13] = `Enter`;
g_kCdN[16] = `ShiftLeft`;
g_kCdN[17] = `ControlLeft`;
g_kCdN[18] = `AltLeft`;
g_kCdN[19] = `Pause`;
g_kCdN[27] = `Escape`;
g_kCdN[28] = `Convert`;
g_kCdN[29] = `NonConvert`;
g_kCdN[32] = `Space`;
g_kCdN[33] = `PageUp`;
g_kCdN[34] = `PageDown`;
g_kCdN[35] = `End`;
g_kCdN[36] = `Home`;
g_kCdN[37] = `ArrowLeft`;
g_kCdN[38] = `ArrowUp`;
g_kCdN[39] = `ArrowRight`;
g_kCdN[40] = `ArrowDown`;
g_kCdN[44] = `PrintScreen`;
g_kCdN[45] = `Insert`;
g_kCdN[46] = `Delete`;
g_kCdN[47] = `Help`;
g_kCdN[48] = `Digit0`;
g_kCdN[49] = `Digit1`;
g_kCdN[50] = `Digit2`;
g_kCdN[51] = `Digit3`;
g_kCdN[52] = `Digit4`;
g_kCdN[53] = `Digit5`;
g_kCdN[54] = `Digit6`;
g_kCdN[55] = `Digit7`;
g_kCdN[56] = `Digit8`;
g_kCdN[57] = `Digit9`;
g_kCdN[65] = `KeyA`;
g_kCdN[66] = `KeyB`;
g_kCdN[67] = `KeyC`;
g_kCdN[68] = `KeyD`;
g_kCdN[69] = `KeyE`;
g_kCdN[70] = `KeyF`;
g_kCdN[71] = `KeyG`;
g_kCdN[72] = `KeyH`;
g_kCdN[73] = `KeyI`;
g_kCdN[74] = `KeyJ`;
g_kCdN[75] = `KeyK`;
g_kCdN[76] = `KeyL`;
g_kCdN[77] = `KeyM`;
g_kCdN[78] = `KeyN`;
g_kCdN[79] = `KeyO`;
g_kCdN[80] = `KeyP`;
g_kCdN[81] = `KeyQ`;
g_kCdN[82] = `KeyR`;
g_kCdN[83] = `KeyS`;
g_kCdN[84] = `KeyT`;
g_kCdN[85] = `KeyU`;
g_kCdN[86] = `KeyV`;
g_kCdN[87] = `KeyW`;
g_kCdN[88] = `KeyX`;
g_kCdN[89] = `KeyY`;
g_kCdN[90] = `KeyZ`;
g_kCdN[91] = `MetaLeft`;
g_kCdN[93] = `ContextMenu`;
g_kCdN[96] = `Numpad0`;
g_kCdN[97] = `Numpad1`;
g_kCdN[98] = `Numpad2`;
g_kCdN[99] = `Numpad3`;
g_kCdN[100] = `Numpad4`;
g_kCdN[101] = `Numpad5`;
g_kCdN[102] = `Numpad6`;
g_kCdN[103] = `Numpad7`;
g_kCdN[104] = `Numpad8`;
g_kCdN[105] = `Numpad9`;
g_kCdN[106] = `NumpadMultiply`;
g_kCdN[107] = `NumpadAdd`;
g_kCdN[108] = `NumpadEnter`;
g_kCdN[109] = `NumpadSubtract`;
g_kCdN[110] = `NumpadDecimal`;
g_kCdN[111] = `NumpadDivide`;
g_kCdN[112] = `F1`;
g_kCdN[113] = `F2`;
g_kCdN[114] = `F3`;
g_kCdN[115] = `F4`;
g_kCdN[116] = `F5`;
g_kCdN[117] = `F6`;
g_kCdN[118] = `F7`;
g_kCdN[119] = `F8`;
g_kCdN[120] = `F9`;
g_kCdN[121] = `F10`;
g_kCdN[122] = `F11`;
g_kCdN[123] = `F12`;
g_kCdN[124] = `F13`;
g_kCdN[125] = `F14`;
g_kCdN[126] = `F15`;
g_kCdN[134] = `FN`;
g_kCdN[144] = `NumLock`;
g_kCdN[145] = `ScrollLock`;
g_kCdN[186] = `Quote`;
g_kCdN[187] = `Semicolon`;
g_kCdN[188] = `Comma`;
g_kCdN[189] = `Minus`;
g_kCdN[190] = `Period`;
g_kCdN[191] = `Slash`;
g_kCdN[192] = `BracketLeft`;
g_kCdN[219] = `BracketRight`;
g_kCdN[220] = `IntlYen`;
g_kCdN[221] = `Backslash`;
g_kCdN[222] = `Equal`;
g_kCdN[226] = `IntlRo`;
g_kCdN[229] = `Backquote`;
g_kCdN[240] = `CapsLock`;

// 画面別ショートカット
const g_shortcutObj = {
    title: {
        Enter: { id: `btnStart` },
        Slash: { id: `btnHelp`, reset: true },
        F1: { id: `btnHelp`, reset: true },
        ControlLeft_KeyC: { id: `` },
        KeyC: { id: `btnComment` },
    },
    option: {
        ShiftLeft_KeyD: { id: `lnkDifficultyL` },
        KeyD: { id: `lnkDifficultyR` },
        ShiftLeft_ArrowRight: { id: `lnkSpeedR` },
        ArrowRight: { id: `lnkSpeedRR` },
        ShiftLeft_ArrowLeft: { id: `lnkSpeedL` },
        ArrowLeft: { id: `lnkSpeedLL` },
        KeyL: { id: `lnkDifficulty` },

        ShiftLeft_KeyM: { id: `lnkMotionL` },
        KeyM: { id: `lnkMotionR` },
        ArrowUp: { id: `btnReverse` },
        ShiftLeft_ArrowDown: { id: `lnkScrollL` },
        ArrowDown: { id: `lnkScrollR` },
        KeyR: { id: `lnkReverseR` },

        ShiftLeft_KeyS: { id: `lnkShuffleL` },
        KeyS: { id: `lnkShuffleR` },
        ShiftLeft_KeyA: { id: `lnkAutoPlayL` },
        KeyA: { id: `lnkAutoPlayR` },
        ShiftLeft_KeyG: { id: `lnkGaugeL` },
        KeyG: { id: `lnkGaugeR` },

        ShiftLeft_Semicolon: { id: `lnkAdjustmentR` },
        Semicolon: { id: `lnkAdjustmentRR` },
        ShiftLeft_Minus: { id: `lnkAdjustmentL` },
        Minus: { id: `lnkAdjustmentLL` },

        ShiftLeft_NumpadAdd: { id: `lnkAdjustmentR` },
        NumpadAdd: { id: `lnkAdjustmentRR` },
        ShiftLeft_NumpadSubtract: { id: `lnkAdjustmentL` },
        NumpadSubtract: { id: `lnkAdjustmentLL` },

        ShiftLeft_KeyV: { id: `lnkVolumeL` },
        KeyV: { id: `lnkVolumeR` },

        KeyI: { id: `btnGraph` },
        ShiftLeft_KeyQ: { id: `lnkScoreDetailB` },
        KeyQ: { id: `lnkScoreDetail` },
        KeyP: { id: `lnkDifInfo` },
        KeyZ: { id: `btnSave` },

        Escape: { id: `btnBack` },
        Space: { id: `btnKeyConfig` },
        Enter: { id: `btnPlay` },
        ShiftLeft_Tab: { id: `btnBack` },
        Tab: { id: `btnDisplay` },
    },
    difSelector: {
        ShiftLeft_KeyD: { id: `lnkDifficultyL` },
        KeyD: { id: `lnkDifficultyR` },
        KeyR: { id: `difRandom` },
        KeyL: { id: `lnkDifficulty` },
        ArrowDown: { id: `btnDifD` },
        ArrowUp: { id: `btnDifU` },

        Escape: { id: `btnBack` },
        Space: { id: `btnKeyConfig` },
        Enter: { id: `lnkDifficulty` },
        ShiftLeft_Tab: { id: `btnBack` },
        Tab: { id: `btnDisplay` },
    },
    settingsDisplay: {
        ShiftLeft_KeyA: { id: `lnkAppearanceL` },
        KeyA: { id: `lnkAppearanceR` },
        ShiftLeft_KeyO: { id: `lnkOpacityL` },
        KeyO: { id: `lnkOpacityR` },

        Digit1: { id: `lnkstepZone` },
        Digit2: { id: `lnkjudgment` },
        Digit3: { id: `lnkfastSlow` },
        Digit4: { id: `lnklifeGauge` },
        Digit5: { id: `lnkscore` },
        Digit6: { id: `lnkmusicInfo` },
        Digit7: { id: `lnkfilterLine` },
        Digit8: { id: `lnkspeed` },
        Digit9: { id: `lnkcolor` },
        Digit0: { id: `lnklyrics` },
        Semicolon: { id: `lnkbackground` },
        Minus: { id: `lnkarrowEffect` },
        Slash: { id: `lnkspecial` },

        Numpad1: { id: `lnkstepZone` },
        Numpad2: { id: `lnkjudgment` },
        Numpad3: { id: `lnkfastSlow` },
        Numpad4: { id: `lnklifeGauge` },
        Numpad5: { id: `lnkscore` },
        Numpad6: { id: `lnkmusicInfo` },
        Numpad7: { id: `lnkfilterLine` },
        Numpad8: { id: `lnkspeed` },
        Numpad9: { id: `lnkcolor` },
        Numpad0: { id: `lnklyrics` },
        NumpadAdd: { id: `lnkbackground` },
        NumpadSubtract: { id: `lnkarrowEffect` },
        NumpadDivide: { id: `lnkspecial` },

        KeyZ: { id: `btnSave` },
        Escape: { id: `btnBack` },
        Space: { id: `btnKeyConfig` },
        Enter: { id: `btnPlay` },
        ShiftLeft_Tab: { id: `btnBack` },
        Tab: { id: `btnSettings` },
    },
    keyConfig: {
        Escape: { id: `btnBack` },
    },
    loadingIos: {
        Enter: { id: `btnPlay` },
    },
    result: {
        Escape: { id: `btnBack` },
        ShiftLeft_Tab: { id: `btnBack` },
        ControlLeft_KeyC: { id: `` },
        KeyC: { id: `btnCopy`, reset: true },
        KeyT: { id: `btnTweet`, reset: true },
        KeyG: { id: `btnGitter`, reset: true },
        Backspace: { id: `btnRetry` },
    },
};

// ボタン・ショートカットキーの有効化時間（フレーム数）
// b_frame: ボタンの有効化フレーム数、s_frame: ショートカットキーの有効化フレーム数
// initial: 初回のみ有効化時間を設定する場合、trueを設定
const g_btnWaitFrame = {
    initial: { b_frame: 0, s_frame: 0 },
    title: { b_frame: 0, s_frame: 0 },
    option: { b_frame: 0, s_frame: 0, initial: true },
    difSelector: { b_frame: 0, s_frame: 0 },
    settingsDisplay: { b_frame: 0, s_frame: 0 },
    keyConfig: { b_frame: 0, s_frame: 30 },
    loading: { b_frame: 0, s_frame: 0 },
    loadingIos: { b_frame: 0, s_frame: 0 },
    main: { b_frame: 0, s_frame: 0 },
    result: { b_frame: 0, s_frame: 120 },
};

// 主要ボタンのリスト
const g_btnPatterns = {
    title: { Start: 0, Comment: -10 },
    option: { Back: 0, KeyConfig: 0, Play: 0, Display: -5, Save: -10, Graph: -25 },
    difSelector: {},
    settingsDisplay: { Back: 0, KeyConfig: 0, Play: 0, Save: -10, Settings: -5 },
    loadingIos: { Play: 0 },
    keyConfig: { Back: -3 },
    result: { Back: -5, Copy: -5, Tweet: -5, Gitter: -5, Retry: 0 },
};

// メイン画面以外でキーリピートを許可しないキーを設定
const g_unrepeatObj = {
    key: [`Enter`, `Backspace`, `Delete`, `Escape`, `NumpadEnter`, `Tab`],
    page: [`keyConfig`, `loading`, `loadingIos`],
};

// メイン画面でキーリピートを許可するキーを設定
const g_mainRepeatObj = {
    key: [`PageDown`, `PageUp`],
};

// CSS名称
const g_cssObj = {
    title_base: `title_base`,

    settings_DifSelector: `settings_DifSelector`,
    settings_Disabled: `settings_Disabled`,
    settings_FadeinBar: `settings_FadeinBar`,
    settings_Shuffle: `settings_Shuffle`,

    keyconfig_warning: `keyconfig_warning`,
    keyconfig_ConfigType: `keyconfig_ConfigType`,
    keyconfig_ColorType: `keyconfig_ColorType`,
    keyconfig_Changekey: `keyconfig_Changekey`,
    keyconfig_Defaultkey: `keyconfig_Defaultkey`,

    main_stepKeyDown: `main_stepKeyDown`,
    main_stepDefault: `main_stepDefault`,
    main_stepDummy: `main_stepDummy`,
    main_stepIi: `main_stepIi`,
    main_stepShakin: `main_stepShakin`,
    main_stepMatari: `main_stepMatari`,
    main_stepShobon: `main_stepShobon`,

    main_objStepShadow: `main_objStepShadow`,
    main_objShadow: `main_objShadow`,
    main_frzHitTop: `main_frzHitTop`,

    life_Max: `life_Max`,
    life_Cleared: `life_Cleared`,
    life_Failed: `life_Failed`,
    life_Background: `life_Background`,
    life_Border: `life_Border`,
    life_BorderColor: `life_BorderColor`,

    result_lbl: `result_lbl`,
    result_style: `result_style`,

    common_ii: `common_ii`,
    common_shakin: `common_shakin`,
    common_matari: `common_matari`,
    common_shobon: `common_shobon`,
    common_uwan: `common_uwan`,
    common_kita: `common_kita`,
    common_iknai: `common_iknai`,
    common_combo: `common_combo`,
    common_score: `common_score`,

    result_score: `result_score`,
    result_scoreHiBlanket: `result_scoreHiBlanket`,
    result_scoreHi: `result_scoreHi`,
    result_scoreHiPlus: `result_scoreHiPlus`,
    result_noRecord: `result_noRecord`,

    result_AllPerfect: `result_AllPerfect`,
    result_Perfect: `result_Perfect`,
    result_FullCombo: `result_FullCombo`,
    result_Cleared: `result_Cleared`,
    result_Failed: `result_Failed`,
    result_Window: `result_Window`,
    result_PlayDataWindow: `result_PlayDataWindow`,

    button_Start: `button_Start`,
    button_Default: `button_Default`,
    button_Default_NoColor: `button_Default_NoColor`,
    button_Mini: `button_Mini`,
    button_Back: `button_Back`,
    button_Setting: `button_Setting`,
    button_Next: `button_Next`,
    button_Reset: `button_Reset`,
    button_Tweet: `button_Tweet`,

    button_OFF: `button_OFF`,
    button_ON: `button_ON`,
    button_RevOFF: `button_RevOFF`,
    button_RevON: `button_RevON`,

    button_DisabledOFF: `button_DisabledOFF`,
    button_DisabledON: `button_DisabledON`,

    flex_centering: `flex_centering`,
};

// キー別の設定（一旦ここで定義）
// ステップゾーンの位置関係は自動化を想定
const g_keyObj = {

    // 現在の選択キー、選択パターン
    // - キーとパターンの組み合わせで、ステップゾーンや対応キー等が決まる
    // - 原則、キー×パターンの数だけ設定が必要
    currentKey: 7,
    currentPtn: 0,

    // キー別ヘッダー
    // - 譜面データ中に出てくる矢印(ノーツ)の種類と順番(ステップゾーン表示順)を管理する。
    // - ここで出てくる順番は、この後のstepRtn, keyCtrlとも対応している。 
    chara5_0: [`left`, `down`, `up`, `right`, `space`],
    chara7_0: [`left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara7i_0: [`left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara8_0: [`left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`, `sleft`],
    chara9A_0: [`left`, `down`, `up`, `right`, `space`, `sleft`, `sdown`, `sup`, `sright`],
    chara9B_0: [`left`, `down`, `up`, `right`, `space`, `sleft`, `sdown`, `sup`, `sright`],
    chara9i_0: [`sleft`, `sdown`, `sup`, `sright`, `left`, `down`, `up`, `right`, `space`],
    chara11_0: [`sleft`, `sdown`, `sup`, `sright`,
        `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara11L_0: [`sleft`, `sdown`, `sup`, `sright`,
        `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara11i_0: [`left`, `down`, `gor`, `up`, `right`, `space`,
        `sleft`, `sdown`, `siyo`, `sup`, `sright`],
    chara11W_0: [`sleft`, `sdown`, `sup`, `sright`,
        `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara12_0: [`sleft`, `sdown`, `sup`, `sright`,
        `oni`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara13_0: [`tleft`, `tdown`, `tup`, `tright`,
        `left`, `down`, `up`, `right`, `space`, `sleft`, `sdown`, `sup`, `sright`],
    chara14_0: [`sleftdia`, `sleft`, `sdown`, `sup`, `sright`, `srightdia`,
        `oni`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara14i_0: [`gor`, `space`, `iyo`, `left`, `down`, `up`, `right`,
        `sleft`, `sleftdia`, `sdown`, `sspace`, `sup`, `srightdia`, `sright`],
    chara15A_0: [`sleft`, `sdown`, `sup`, `sright`, `tleft`, `tdown`, `tup`, `tright`,
        `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara15B_0: [`sleft`, `sdown`, `sup`, `sright`, `tleft`, `tdown`, `tup`, `tright`,
        `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara16i_0: [`gor`, `space`, `iyo`, `left`, `down`, `up`, `right`,
        `sleft`, `sdown`, `sup`, `sright`, `aspace`, `aleft`, `adown`, `aup`, `aright`],
    chara17_0: [`aleft`, `bleft`, `adown`, `bdown`, `aup`, `bup`, `aright`, `bright`, `space`,
        `cleft`, `dleft`, `cdown`, `ddown`, `cup`, `dup`, `cright`, `dright`],
    chara23_0: [`aleft`, `adown`, `aup`, `aright`, `bleft`, `bdown`, `bup`, `bright`,
        `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`, `oni`,
        `sleft`, `sleftdia`, `sdown`, `sspace`, `sup`, `srightdia`, `sright`],

    chara5_1: [`space`, `left`, `down`, `up`, `right`],
    chara7_1: [`left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara8_1: [`sleft`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara9A_1: [`left`, `down`, `up`, `right`, `space`, `sleft`, `sdown`, `sup`, `sright`],
    chara9B_1: [`left`, `down`, `up`, `right`, `space`, `sleft`, `sdown`, `sup`, `sright`],
    chara9i_1: [`left`, `down`, `up`, `right`, `space`, `sleft`, `sdown`, `sup`, `sright`],
    chara11_1: [`sleft`, `sdown`, `sup`, `sright`,
        `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara11L_1: [`sleft`, `sdown`, `sup`, `sright`,
        `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara11i_1: [`left`, `down`, `gor`, `up`, `right`, `space`,
        `sleft`, `sdown`, `siyo`, `sup`, `sright`],
    chara11W_1: [`sleft`, `sdown`, `sup`, `sright`,
        `oni`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara12_1: [`sleft`, `sdown`, `sup`, `sright`,
        `oni`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara14_1: [`sleftdia`, `sleft`, `sdown`, `sup`, `sright`, `srightdia`,
        `oni`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara15A_1: [`sleft`, `sdown`, `sup`, `sright`, `tleft`, `tdown`, `tup`, `tright`,
        `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara15B_1: [`sleft`, `sdown`, `sup`, `sright`, `tleft`, `tdown`, `tup`, `tright`,
        `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara17_1: [`aleft`, `adown`, `aup`, `aright`, `space`, `dleft`, `ddown`, `dup`, `dright`,
        `bleft`, `bdown`, `bup`, `bright`, `cleft`, `cdown`, `cup`, `cright`],

    chara5_2: [`left`, `down`, `space`, `up`, `right`],
    chara7_2: [`oni`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara8_2: [`sleft`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara9A_2: [`left`, `down`, `up`, `right`, `space`, `sleft`, `sdown`, `sup`, `sright`],
    chara9B_2: [`left`, `down`, `up`, `right`, `space`, `sleft`, `sdown`, `sup`, `sright`],
    chara11_2: [`sleft`, `sdown`, `sup`, `sright`,
        `oni`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara11L_2: [`sleft`, `sdown`, `sup`, `sright`,
        `oni`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara11W_2: [`sleft`, `sdown`, `sup`, `sright`,
        `oni`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],

    chara7_3: [`oni`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara8_3: [`sleft`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara9A_3: [`left`, `down`, `gor`, `up`, `right`, `space`,
        `sleft`, `sdown`, `siyo`, `sup`, `sright`],
    chara11_3: [`sleft`, `sdown`, `sup`, `sright`,
        `oni`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara11L_3: [`sleft`, `sdown`, `sup`, `sright`,
        `oni`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],

    chara9A_4: [`left`, `down`, `gor`, `up`, `right`, `space`,
        `sleft`, `sdown`, `siyo`, `sup`, `sright`],

    // カラーパターン(パターン1)
    color5_0_0: [0, 0, 0, 0, 2],
    color7_0_0: [0, 1, 0, 2, 0, 1, 0],
    color7i_0_0: [2, 2, 2, 0, 0, 0, 0],
    color8_0_0: [0, 1, 0, 2, 0, 1, 0, 2],
    color9A_0_0: [0, 0, 0, 0, 2, 3, 3, 3, 3],
    color9B_0_0: [1, 0, 1, 0, 2, 0, 1, 0, 1],
    color9i_0_0: [0, 0, 0, 0, 2, 2, 2, 2, 2],
    color11_0_0: [3, 3, 3, 3, 0, 1, 0, 2, 0, 1, 0],
    color11L_0_0: [3, 3, 3, 3, 0, 1, 0, 2, 0, 1, 0],
    color11W_0_0: [2, 3, 3, 2, 0, 1, 0, 2, 0, 1, 0],
    color11i_0_0: [0, 0, 2, 0, 0, 2, 3, 3, 2, 3, 3],
    color12_0_0: [3, 3, 3, 3, 2, 0, 1, 0, 1, 0, 1, 0],
    color13_0_0: [4, 4, 4, 4, 0, 0, 0, 0, 2, 3, 3, 3, 3],
    color14_0_0: [4, 3, 3, 3, 3, 4, 2, 0, 1, 0, 1, 0, 1, 0],
    color14i_0_0: [2, 2, 2, 3, 3, 3, 3, 0, 1, 0, 2, 0, 1, 0],
    color15A_0_0: [3, 3, 3, 3, 4, 4, 4, 4, 0, 1, 0, 2, 0, 1, 0],
    color15B_0_0: [3, 3, 3, 3, 4, 4, 4, 4, 0, 1, 0, 2, 0, 1, 0],
    color16i_0_0: [2, 2, 2, 3, 3, 3, 3, 1, 0, 1, 0, 2, 0, 1, 0, 1],
    color17_0_0: [0, 1, 0, 1, 0, 1, 0, 1, 2, 3, 4, 3, 4, 3, 4, 3, 4],
    color23_0_0: [3, 3, 3, 3, 4, 4, 4, 4, 0, 1, 0, 1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0],

    color5_1_0: [2, 0, 0, 0, 0],
    color7_1_0: [0, 1, 0, 2, 0, 1, 0],
    color8_1_0: [2, 0, 1, 0, 2, 0, 1, 0],
    color9A_1_0: [0, 0, 0, 0, 2, 3, 3, 3, 3],
    color9B_1_0: [0, 0, 0, 0, 2, 1, 1, 1, 1],
    color9i_1_0: [2, 2, 2, 2, 2, 0, 0, 0, 0],
    color11_1_0: [3, 3, 3, 3, 0, 1, 0, 2, 0, 1, 0],
    color11L_1_0: [3, 3, 3, 3, 0, 1, 0, 2, 0, 1, 0],
    color11W_1_0: [3, 3, 3, 3, 2, 0, 1, 0, 1, 0, 1, 0],
    color11i_1_0: [0, 0, 2, 0, 0, 2, 3, 3, 2, 3, 3],
    color12_1_0: [3, 3, 3, 3, 2, 0, 1, 0, 1, 0, 1, 0],
    color14_1_0: [4, 3, 3, 3, 3, 4, 2, 0, 1, 0, 1, 0, 1, 0],
    color15A_1_0: [3, 3, 3, 3, 4, 4, 4, 4, 0, 1, 0, 2, 0, 1, 0],
    color15B_1_0: [3, 3, 3, 3, 4, 4, 4, 4, 0, 1, 0, 2, 0, 1, 0],
    color17_1_0: [0, 0, 0, 0, 2, 4, 4, 4, 4, 1, 1, 1, 1, 3, 3, 3, 3],

    color5_2_0: [0, 0, 2, 0, 0],
    color7_2_0: [2, 0, 1, 0, 1, 0, 1, 0],
    color8_2_0: [2, 0, 1, 0, 1, 0, 1, 0],
    color9A_2_0: [3, 0, 3, 0, 2, 0, 3, 0, 3],
    color9B_2_0: [0, 0, 0, 0, 2, 1, 1, 1, 1],
    color11_2_0: [3, 3, 3, 3, 2, 0, 1, 0, 1, 0, 1, 0],
    color11L_2_0: [3, 3, 3, 3, 2, 0, 1, 0, 1, 0, 1, 0],
    color11W_2_0: [3, 3, 3, 3, 2, 0, 1, 0, 1, 0, 1, 0],

    color7_3_0: [2, 0, 1, 0, 1, 0, 1, 0],
    color8_3_0: [2, 0, 1, 0, 1, 0, 1, 0],
    color9A_3_0: [0, 0, 2, 0, 0, 2, 3, 3, 2, 3, 3],
    color11_3_0: [3, 3, 3, 3, 2, 0, 1, 0, 1, 0, 1, 0],
    color11L_3_0: [3, 3, 3, 3, 2, 0, 1, 0, 1, 0, 1, 0],

    color9A_4_0: [0, 0, 2, 0, 0, 2, 3, 3, 2, 3, 3],

    // カラーパターン(パターン2)
    color9B_0_1: [4, 3, 1, 0, 2, 0, 1, 3, 4],
    color9A_2_1: [4, 1, 3, 0, 2, 0, 3, 1, 4],
    color17_0_1: [1, 0, 1, 0, 1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0, 1],

    color17_1_1: [1, 1, 1, 1, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],

    // シャッフルグループ(パターン1)
    //  - Mirror, Random, S-Random使用時、同じグループ同士で入れ替えます
    //  - 同じ数字が同じグループになります
    shuffle5_0_0: [0, 0, 0, 0, 1],
    shuffle7_0_0: [0, 0, 0, 1, 0, 0, 0],
    shuffle7i_0_0: [0, 0, 0, 1, 1, 1, 1],
    shuffle8_0_0: [0, 0, 0, 1, 0, 0, 0, 2],
    shuffle9A_0_0: [0, 0, 0, 0, 1, 2, 2, 2, 2],
    shuffle9B_0_0: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    shuffle9i_0_0: [0, 0, 0, 0, 1, 1, 1, 1, 1],
    shuffle11_0_0: [0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1],
    shuffle11L_0_0: [0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1],
    shuffle11W_0_0: [0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1],
    shuffle11i_0_0: [0, 0, 1, 0, 0, 2, 3, 3, 4, 3, 3],
    shuffle12_0_0: [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
    shuffle13_0_0: [0, 0, 0, 0, 1, 1, 1, 1, 2, 3, 3, 3, 3],
    shuffle14_0_0: [3, 0, 0, 0, 0, 3, 1, 2, 2, 2, 2, 2, 2, 2],
    shuffle14i_0_0: [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 2, 2, 2],
    shuffle15A_0_0: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 2, 2, 2],
    shuffle15B_0_0: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 2, 2, 2],
    shuffle16i_0_0: [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2, 2, 2],
    shuffle17_0_0: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    shuffle23_0_0: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 4, 4, 4, 4, 4, 4, 4],

    shuffle5_1_0: [1, 0, 0, 0, 0],
    shuffle7_1_0: [0, 0, 0, 1, 0, 0, 0],
    shuffle8_1_0: [2, 0, 0, 0, 1, 0, 0, 0],
    shuffle9A_1_0: [0, 0, 0, 0, 1, 2, 2, 2, 2],
    shuffle9B_1_0: [0, 0, 0, 0, 1, 2, 2, 2, 2],
    shuffle9i_1_0: [0, 0, 0, 0, 0, 1, 1, 1, 1],
    shuffle11_1_0: [0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1],
    shuffle11L_1_0: [0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1],
    shuffle11W_1_0: [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
    shuffle11i_1_0: [0, 0, 1, 0, 0, 2, 3, 3, 4, 3, 3],
    shuffle12_1_0: [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
    shuffle14_1_0: [3, 0, 0, 0, 0, 3, 1, 2, 2, 2, 2, 2, 2, 2],
    shuffle15A_1_0: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 2, 2, 2],
    shuffle15B_1_0: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 2, 2, 2],
    shuffle17_1_0: [0, 0, 0, 0, 1, 2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2],

    shuffle5_2_0: [0, 0, 1, 0, 0],
    shuffle7_2_0: [1, 0, 0, 0, 0, 0, 0, 0],
    shuffle8_2_0: [1, 0, 0, 0, 0, 0, 0, 0],
    shuffle9A_2_0: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    shuffle9B_2_0: [0, 0, 0, 0, 1, 2, 2, 2, 2],
    shuffle11_2_0: [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
    shuffle11L_2_0: [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
    shuffle11W_2_0: [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2],

    shuffle7_3_0: [1, 0, 0, 0, 0, 0, 0, 0],
    shuffle8_3_0: [1, 0, 0, 0, 0, 0, 0, 0],
    shuffle9A_3_0: [0, 0, 1, 0, 0, 2, 3, 3, 4, 3, 3],
    shuffle11_3_0: [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
    shuffle11L_3_0: [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2],

    shuffle9A_4_0: [0, 0, 1, 0, 0, 2, 3, 3, 4, 3, 3],

    // シャッフルグループ(パターン2)
    shuffle9A_0_1: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    shuffle11_0_1: [0, 0, 0, 0, 1, 1, 1, 2, 3, 3, 3],
    shuffle11L_0_1: [0, 0, 0, 0, 1, 1, 1, 2, 3, 3, 3],
    shuffle11i_0_1: [0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0],
    shuffle14_0_1: [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
    shuffle15A_0_1: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 4, 4, 4],
    shuffle15B_0_1: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 4, 4, 4],
    shuffle17_0_1: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],

    shuffle9A_1_1: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    shuffle9B_1_1: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    shuffle11_1_1: [0, 0, 0, 0, 1, 1, 1, 2, 3, 3, 3],
    shuffle11L_1_1: [0, 0, 0, 0, 1, 1, 1, 2, 3, 3, 3],
    shuffle11i_1_1: [0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0],
    shuffle14_1_1: [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
    shuffle15A_1_1: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 4, 4, 4],
    shuffle15B_1_1: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 4, 4, 4],
    shuffle17_1_1: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

    shuffle9B_2_1: [0, 0, 0, 0, 1, 0, 0, 0, 0],

    shuffle9A_3_1: [0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0],

    shuffle9A_4_1: [0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0],

    // シャッフルグループ(パターン3)
    shuffle15A_0_2: [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 3, 2, 2, 2],
    shuffle15B_0_2: [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 3, 2, 2, 2],

    shuffle15A_1_2: [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 3, 2, 2, 2],
    shuffle15B_1_2: [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 3, 2, 2, 2],

    // 基本パターン (矢印回転、AAキャラクタ)
    // - AAキャラクタの場合、キャラクタ名を指定
    stepRtn5_0: [0, -90, 90, 180, `onigiri`],
    stepRtn7_0: [0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn7i_0: [`giko`, `onigiri`, `iyo`, 0, -90, 90, 180],
    stepRtn8_0: [0, -45, -90, `onigiri`, 90, 135, 180, `onigiri`],
    stepRtn9A_0: [0, -90, 90, 180, `onigiri`, 0, -90, 90, 180],
    stepRtn9B_0: [45, 0, -45, -90, `onigiri`, 90, 135, 180, 225],
    stepRtn9i_0: [0, -90, 90, 180, `monar`, `giko`, `c`, `morara`, `onigiri`],
    stepRtn11_0: [0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn11L_0: [0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn11W_0: [`giko`, 135, 45, `iyo`, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn11i_0: [0, -90, `giko`, 90, 180, `onigiri`, 0, -90, `iyo`, 90, 180],
    stepRtn12_0: [0, -90, 90, 180, `onigiri`, 0, 30, 60, 90, 120, 150, 180],
    stepRtn13_0: [0, -90, 90, 180, 0, -90, 90, 180, `onigiri`, 0, -90, 90, 180],
    stepRtn14_0: [45, 0, -90, 90, 180, 135, `onigiri`, 0, 30, 60, 90, 120, 150, 180],
    stepRtn14i_0: [`giko`, `onigiri`, `iyo`, 0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn15A_0: [0, -90, 90, 180, 0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn15B_0: [0, -90, 90, 180, 0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn16i_0: [`giko`, `onigiri`, `iyo`, 0, -90, 90, 180, 45, 0, -45, -90, `onigiri`, 90, 135, 180, 225],
    stepRtn17_0: [0, -22.5, -45, -67.5, -90, -112.5, -135, -157.5, `onigiri`,
        22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180],
    stepRtn23_0: [0, -90, 90, 180, 0, -90, 90, 180, 0, 30, 60, 90, 120, 150, 180, `onigiri`, 0, 30, 60, 90, 120, 150, 180],

    // 変則パターン (矢印回転、AAキャラクタ)
    // - 末尾の番号をカウントアップさせることで実現できる。keyCtrlと合わせること
    // - 配列の数は、通常パターンと同数で無くてはいけない（keyCtrlも同様）
    stepRtn5_1: [`onigiri`, 0, -90, 90, 180],
    stepRtn7_1: [0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn8_1: [`onigiri`, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn9A_1: [0, -90, 90, 180, `onigiri`, 0, -90, 90, 180],
    stepRtn9B_1: [0, -90, 90, 180, `onigiri`, 0, -90, 90, 180],
    stepRtn9i_1: [`monar`, `giko`, `c`, `morara`, `onigiri`, 0, -90, 90, 180],
    stepRtn11_1: [0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn11L_1: [0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn11W_1: [0, -90, 90, 180, `onigiri`, 0, 30, 60, 90, 120, 150, 180],
    stepRtn11i_1: [0, -135, `giko`, 45, 180, `onigiri`, 0, -135, `iyo`, 45, 180],
    stepRtn12_1: [0, -90, 90, 180, `onigiri`, 0, 30, 60, 90, 120, 150, 180],
    stepRtn14_1: [45, 0, -90, 90, 180, 135, `onigiri`, 0, 30, 60, 90, 120, 150, 180],
    stepRtn15A_1: [0, -90, 90, 180, 0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn15B_1: [0, -90, 90, 180, 0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn17_1: [0, -45, -90, -135, `onigiri`, 45, 90, 135, 180,
        -22.5, -67.5, -112.5, -157.5, 22.5, 67.5, 112.5, 157.5],

    stepRtn5_2: [0, -90, `onigiri`, 90, 180],
    stepRtn7_2: [`onigiri`, 0, 30, 60, 90, 120, 150, 180],
    stepRtn8_2: [`onigiri`, 0, 30, 60, 90, 120, 150, 180],
    stepRtn9A_2: [45, 0, -45, -90, `onigiri`, 90, 135, 180, 225],
    stepRtn9B_2: [0, -90, 90, 180, `onigiri`, 0, -90, 90, 180],
    stepRtn11_2: [0, -90, 90, 180, `onigiri`, 0, 30, 60, 90, 120, 150, 180],
    stepRtn11L_2: [0, -90, 90, 180, `onigiri`, 0, 30, 60, 90, 120, 150, 180],
    stepRtn11W_2: [0, -90, 90, 180, `onigiri`, 0, 30, 60, 90, 120, 150, 180],

    stepRtn7_3: [`onigiri`, 0, 30, 60, 90, 120, 150, 180],
    stepRtn8_3: [`onigiri`, 0, 30, 60, 90, 120, 150, 180],
    stepRtn9A_3: [0, -90, `giko`, 90, 180, `onigiri`, 0, -90, `iyo`, 90, 180],
    stepRtn11_3: [0, -90, 90, 180, `onigiri`, 0, 30, 60, 90, 120, 150, 180],
    stepRtn11L_3: [0, -90, 90, 180, `onigiri`, 0, 30, 60, 90, 120, 150, 180],

    stepRtn9A_4: [0, -135, `giko`, 45, 180, `onigiri`, 0, -135, `iyo`, 45, 180],

    // 各キーの区切り位置
    div5_0: 5,
    div7_0: 7,
    div7i_0: 7,
    div8_0: 8,
    div9A_0: 9,
    div9B_0: 9,
    div9i_0: 6,
    div11_0: 6,
    div11L_0: 6,
    div11W_0: 6,
    div11i_0: 11,
    div12_0: 5,
    div13_0: 8,
    div14_0: 7,
    div14i_0: 8,
    div15A_0: 8,
    div15B_0: 8,
    div16i_0: 8,
    div17_0: 17,
    div23_0: 12,

    div5_1: 5,
    div7_1: 7,
    div8_1: 8,
    div9A_1: 9,
    div9B_1: 9,
    div9i_1: 9,
    div11_1: 6,
    div11L_1: 6,
    div11W_1: 5,
    div11i_1: 11,
    div12_1: 5,
    div14_1: 7,
    div15A_1: 8,
    div15B_1: 8,
    div17_1: 9,

    div5_2: 5,
    div7_2: 8,
    div8_2: 8,
    div9A_2: 9,
    div9B_2: 9,
    div11_2: 5,
    div11L_2: 5,
    div11W_2: 5,

    div7_3: 8,
    div8_3: 8,
    div9A_3: 11,
    div11_3: 5,
    div11L_3: 5,

    div9A_4: 11,

    // 各キーの位置関係
    pos5_0: [0, 1, 2, 3, 4],
    pos7_0: [0, 1, 2, 3, 4, 5, 6],
    pos7i_0: [0, 1, 2, 3, 4, 5, 6],
    pos8_0: [0, 1, 2, 3, 4, 5, 6, 7],
    pos9A_0: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    pos9B_0: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    pos9i_0: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    pos11_0: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    pos11L_0: [0, 1, 2, 3, 6, 7, 8, 9, 10, 11, 12],
    pos11W_0: [0, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12],
    pos11i_0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    pos12_0: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    pos13_0: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    pos14_0: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    pos14i_0: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15],
    pos15A_0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    pos15B_0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    pos16i_0: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    pos17_0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    pos23_0: [0, 1, 2, 3, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],

    pos5_1: [0, 1, 2, 3, 4],
    pos7_1: [0, 1, 2, 3, 4, 5, 6],
    pos8_1: [0, 1, 2, 3, 4, 5, 6, 7],
    pos9A_1: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    pos9B_1: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    pos9i_1: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    pos11_1: [0, 1, 2, 3, 6, 7, 8, 9, 10, 11, 12],
    pos11L_1: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    pos11W_1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    pos11i_1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    pos12_1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    pos14_1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    pos15A_1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    pos15B_1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    pos17_1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],

    pos5_2: [0, 1, 2, 3, 4],
    pos7_2: [0, 1, 2, 3, 4, 5, 6, 7],
    pos8_2: [0, 1, 2, 3, 4, 5, 6, 7],
    pos9A_2: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    pos9B_2: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    pos11_2: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    pos11L_2: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    pos11W_2: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],

    pos7_3: [0, 1, 2, 3, 4, 5, 6, 7],
    pos8_3: [0, 1, 2, 3, 4, 5, 6, 7],
    pos9A_3: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    pos11_3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    pos11L_3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],

    pos9A_4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

    // 基本パターン (キーコンフィグ)
    // - 順番はchara, stepRtnと対応している。
    // - 多次元配列内はステップに対応するキーコードを示す。カンマ区切りで複数指定できる。
    keyCtrl5_0: [[37, 0], [40, 0], [38, 0], [39, 0], [32, 0]],
    keyCtrl7_0: [[83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0]],
    keyCtrl7i_0: [[90, 0], [88, 0], [67, 0], [37, 0], [40, 0], [38, 0], [39, 0]],
    keyCtrl8_0: [[83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0], [13, 0]],
    keyCtrl9A_0: [[83, 0], [68, 0], [69, 82], [70, 0], [32, 0], [74, 0], [75, 0], [73, 0], [76, 0]],
    keyCtrl9B_0: [[65, 0], [83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0], [187, 0]],
    keyCtrl9i_0: [[37, 0], [40, 0], [38, 0], [39, 0], [65, 0], [83, 0], [68, 0], [70, 0], [32, 0]],
    keyCtrl11_0: [[37, 0], [40, 0], [38, 0], [39, 0], [83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0]],
    keyCtrl11L_0: [[87, 0], [69, 0], [51, 52], [82, 0], [83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0]],
    keyCtrl11W_0: [[49, 50], [84, 0], [89, 0], [48, 189], [83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0]],
    keyCtrl11i_0: [[83, 0], [88, 67], [68, 0], [69, 82], [70, 0], [32, 0], [74, 0], [77, 188], [75, 0], [73, 79], [76, 0]],
    keyCtrl12_0: [[85, 0], [73, 0], [56, 57], [79, 0], [32, 0], [78, 0], [74, 0], [77, 0], [75, 0], [188, 0], [76, 0], [190, 0]],
    keyCtrl13_0: [[37, 0], [40, 0], [38, 0], [39, 0], [83, 0], [68, 0], [69, 82], [70, 0], [32, 0], [74, 0], [75, 0], [73, 0], [76, 0]],
    keyCtrl14_0: [[84, 89], [85, 0], [73, 0], [56, 55, 57, 48], [79, 0], [192, 80], [32, 0], [78, 0], [74, 0], [77, 0], [75, 0], [188, 0], [76, 0], [190, 0]],
    keyCtrl14i_0: [[90, 0], [88, 0], [67, 0], [37, 0], [40, 0], [38, 0], [39, 0], [83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0]],
    keyCtrl15A_0: [[87, 0], [69, 0], [51, 52], [82, 0], [37, 0], [40, 0], [38, 0], [39, 0], [83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0]],
    keyCtrl15B_0: [[87, 0], [69, 0], [51, 52], [82, 0], [85, 0], [73, 0], [56, 57], [79, 0], [83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0]],
    keyCtrl16i_0: [[90, 0], [88, 0], [67, 0], [37, 0], [40, 0], [38, 0], [39, 0], [65, 0], [83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0], [187, 0]],
    keyCtrl17_0: [[65, 0], [90, 0], [83, 0], [88, 0], [68, 0], [67, 0], [70, 0], [86, 0], [32, 0], [78, 0], [74, 0], [77, 0], [75, 0], [188, 0], [76, 0], [190, 0], [187, 0]],
    keyCtrl23_0: [[87, 0], [69, 0], [51, 52], [82, 0], [85, 0], [73, 0], [56, 57], [79, 0],
    [90, 0], [83, 0], [88, 0], [68, 0], [67, 0], [70, 0], [86, 0], [32, 0], [78, 0], [74, 0], [77, 0], [75, 0], [188, 0], [76, 0], [190, 0]],

    // 変則パターン (キーコンフィグ)
    // - _0 の数字部分をカウントアップすることで実現できる。
    keyCtrl5_1: [[32, 0], [37, 0], [40, 0], [38, 0], [39, 0]],
    keyCtrl7_1: [[83, 0], [69, 0], [70, 0], [32, 71, 72], [74, 0], [73, 0], [76, 0]],
    keyCtrl8_1: [[13, 0], [83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0]],
    keyCtrl9A_1: [[83, 0], [68, 0], [69, 82], [70, 0], [32, 0], [37, 0], [40, 0], [38, 0], [39, 0]],
    keyCtrl9B_1: [[83, 0], [68, 0], [69, 82], [70, 0], [32, 0], [74, 0], [75, 0], [73, 0], [76, 0]],
    keyCtrl9i_1: [[65, 0], [83, 0], [68, 0], [70, 0], [32, 0], [37, 0], [40, 0], [38, 0], [39, 0]],
    keyCtrl11_1: [[87, 0], [69, 0], [51, 52], [82, 0], [83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0]],
    keyCtrl11L_1: [[37, 0], [40, 0], [38, 0], [39, 0], [83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0]],
    keyCtrl11W_1: [[85, 0], [73, 0], [56, 57], [79, 0], [32, 0], [78, 0], [74, 0], [77, 0], [75, 0], [188, 0], [76, 0], [190, 0]],
    keyCtrl11i_1: [[83, 0], [88, 67], [68, 0], [69, 82], [70, 0], [32, 0], [74, 0], [77, 188], [75, 0], [73, 79], [76, 0]],
    keyCtrl12_1: [[89, 0], [85, 73], [56, 55, 57], [79, 0], [32, 0], [66, 0], [72, 0], [78, 77], [74, 75], [188, 0], [76, 0], [190, 0]],
    keyCtrl14_1: [[82, 84], [89, 0], [85, 73], [56, 54, 55, 57, 48], [79, 0], [192, 80], [32, 0], [66, 0], [72, 0], [78, 77], [74, 75], [188, 0], [76, 0], [190, 0]],
    keyCtrl15A_1: [[87, 0], [69, 0], [51, 52], [82, 0], [85, 0], [73, 0], [56, 57], [79, 0], [83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0]],
    keyCtrl15B_1: [[87, 0], [69, 0], [51, 52], [82, 0], [37, 0], [40, 0], [38, 0], [39, 0], [83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0]],
    keyCtrl17_1: [[65, 0], [83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0], [187, 0], [90, 0], [88, 0], [67, 0], [86, 0], [78, 0], [77, 0], [188, 0], [190, 0]],

    keyCtrl5_2: [[68, 0], [70, 0], [32, 0], [74, 0], [75, 0]],
    keyCtrl7_2: [[32, 0], [78, 0], [74, 0], [77, 0], [75, 0], [188, 0], [76, 0], [190, 0]],
    keyCtrl8_2: [[32, 0], [78, 0], [74, 0], [77, 0], [75, 0], [188, 0], [76, 0], [190, 0]],
    keyCtrl9A_2: [[65, 0], [83, 0], [68, 0], [70, 0], [32, 0], [74, 0], [75, 0], [76, 0], [187, 0]],
    keyCtrl9B_2: [[83, 0], [68, 0], [69, 82], [70, 0], [32, 0], [37, 0], [40, 0], [38, 0], [39, 0]],
    keyCtrl11_2: [[85, 0], [73, 0], [56, 57], [79, 0], [32, 0], [78, 0], [74, 0], [77, 0], [75, 0], [188, 0], [76, 0], [190, 0]],
    keyCtrl11L_2: [[85, 0], [73, 0], [56, 57], [79, 0], [32, 0], [78, 0], [74, 0], [77, 0], [75, 0], [188, 0], [76, 0], [190, 0]],
    keyCtrl11W_2: [[89, 0], [85, 73], [56, 55, 57], [79, 0], [32, 0], [66, 0], [72, 0], [78, 77], [74, 75], [188, 0], [76, 0], [190, 0]],

    keyCtrl7_3: [[32, 0], [66, 0], [72, 0], [78, 77], [74, 75], [188, 0], [76, 0], [190, 0]],
    keyCtrl8_3: [[32, 0], [66, 0], [72, 0], [78, 77], [74, 75], [188, 0], [76, 0], [190, 0]],
    keyCtrl9A_3: [[83, 0], [88, 67], [68, 0], [69, 82], [70, 0], [32, 0], [74, 0], [77, 188], [75, 0], [73, 79], [76, 0]],
    keyCtrl11_3: [[89, 0], [85, 73], [56, 55, 57], [79, 0], [32, 0], [66, 0], [72, 0], [78, 77], [74, 75], [188, 0], [76, 0], [190, 0]],
    keyCtrl11L_3: [[89, 0], [85, 73], [56, 55, 57], [79, 0], [32, 0], [66, 0], [72, 0], [78, 77], [74, 75], [188, 0], [76, 0], [190, 0]],

    keyCtrl9A_4: [[83, 0], [88, 67], [68, 0], [69, 82], [70, 0], [32, 0], [74, 0], [77, 188], [75, 0], [73, 79], [76, 0]],

    // 矢印間隔補正
    blank: 55,
    blank_def: 55,
    blank11i_0: 50,
    blank11i_1: 50,
    blank17_0: 45,
    blank5_0: 57.5,
    blank5_1: 57.5,
    blank5_2: 57.5,
    blank9A_0: 52.5,
    blank9A_1: 52.5,
    blank9A_2: 52.5,
    blank9A_3: 50,
    blank9A_4: 50,
    blank9B_0: 52.5,
    blank9B_1: 52.5,
    blank9B_2: 52.5,
    blank23_0: 50,

    // 矢印群の倍率指定
    scale: 1,
    scale_def: 1,
    scale17_0: 0.85,

    // ショートカットキーコード
    keyRetry: 8,
    keyRetry8_0: 9,
    keyRetry8_1: 9,

    keyTitleBack: 46,

    // 別キー
    transKey9B_1: '9A',
    transKey11_1: '11L',
    transKey11L_1: '11',
    transKey11W_1: '12',

    transKey9A_2: '9B',
    transKey9B_2: '9A',
    transKey7_2: '12',
    transKey8_2: '12',
    transKey11_2: '12',
    transKey11L_2: '12',
    transKey11W_2: '12',

    transKey7_3: '12',
    transKey8_3: '12',
    transKey9A_3: '11i',
    transKey11_3: '12',
    transKey11L_3: '12',

    transKey9A_4: '11i',

    // キー置換用(ParaFla版との互換)
    keyTransPattern: {
        '9': '9A',
        'DP': '9A',
        '9A-1': '9A',
        '9A-2': '9A',
        '9B-1': '9B',
        '9B-2': '9B',
        'TP': '13',
        '15': '15A',
        '15R': '15B',
    },

    // スクロール拡張オプション
    scrollName_def: [`---`],
    scrollName5: [`---`, `Cross`, `Split`, `Alternate`],
    scrollName7: [`---`, `Cross`, `Split`, `Alternate`, `Twist`, `Asymmetry`],
    scrollName7i: [`---`, `Cross`, `Split`, `Alternate`, `Twist`, `Asymmetry`],
    scrollName8: [`---`, `Cross`, `Split`, `Alternate`, `Twist`, `Asymmetry`],
    scrollName9A: [`---`, `Cross`, `Split`, `Alternate`],
    scrollName9B: [`---`, `Cross`, `Split`, `Alternate`],
    scrollName11: [`---`, `Flat`],
    scrollName11L: [`---`, `Flat`],
    scrollName11W: [`---`, `Flat`],
    scrollName11i: [`---`, `Cross`, `Split`, `Alternate`],
    scrollName12: [`---`, `Flat`],
    scrollName13: [`---`, `Flat`],
    scrollName14: [`---`, `Flat`],
    scrollName14i: [`---`, `Flat`],
    scrollName15A: [`---`, `Flat`],
    scrollName15B: [`---`, `Flat`],
    scrollName16i: [`---`, `Flat`],
    scrollName23: [`---`, `Flat`],

    scrollDir5_0: {
        '---': [1, 1, 1, 1, 1],
        'Cross': [1, -1, -1, 1, 1],
        'Split': [1, 1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1],
    },
    scrollDir5_1: {
        '---': [1, 1, 1, 1, 1],
        'Cross': [1, 1, -1, -1, 1],
        'Split': [1, 1, 1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1],
    },
    scrollDir5_2: {
        '---': [1, 1, 1, 1, 1],
        'Cross': [1, -1, -1, -1, 1],
        'Split': [1, 1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1],
    },
    scrollDir7_0: {
        '---': [1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1],
        'Twist': [1, 1, -1, -1, 1, 1, -1],
        'Asymmetry': [1, -1, 1, -1, -1, 1, -1],
    },
    scrollDir7_1: {
        '---': [1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1],
        'Twist': [1, 1, -1, -1, 1, 1, -1],
        'Asymmetry': [1, -1, 1, -1, -1, 1, -1],
    },
    scrollDir7_2: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, 1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, 1, 1, -1, -1, -1],
        'Alternate': [-1, 1, -1, 1, -1, 1, -1, 1],
        'Twist': [1, 1, -1, -1, 1, 1, -1, -1],
        'Asymmetry': [1, 1, -1, 1, -1, -1, 1, -1],
    },
    scrollDir7_3: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, 1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, 1, 1, -1, -1, -1],
        'Alternate': [-1, 1, -1, 1, -1, 1, -1, 1],
        'Twist': [1, 1, -1, -1, 1, 1, -1, -1],
        'Asymmetry': [1, 1, -1, 1, -1, -1, 1, -1],
    },

    scrollDir7i_0: {
        '---': [1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1],
        'Twist': [1, 1, -1, -1, 1, 1, -1],
        'Asymmetry': [1, -1, 1, 1, -1, 1, -1],
    },
    scrollDir8_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, -1, -1, -1, 1, 1, 1],
        'Split': [1, 1, 1, 1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1, -1],
        'Twist': [1, 1, -1, -1, 1, 1, -1, -1],
        'Asymmetry': [1, -1, 1, -1, -1, 1, -1, 1],
    },
    scrollDir8_1: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, 1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, 1, -1, -1, -1, -1],
        'Alternate': [-1, 1, -1, 1, -1, 1, -1, 1],
        'Twist': [1, 1, -1, -1, 1, 1, -1, -1],
        'Asymmetry': [1, -1, 1, -1, -1, 1, -1, 1],
    },
    scrollDir8_2: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, 1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, 1, 1, -1, -1, -1],
        'Alternate': [-1, 1, -1, 1, -1, 1, -1, 1],
        'Twist': [1, 1, -1, -1, 1, 1, -1, -1],
        'Asymmetry': [1, 1, -1, 1, -1, -1, 1, -1],
    },
    scrollDir8_3: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, 1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, 1, 1, -1, -1, -1],
        'Alternate': [-1, 1, -1, 1, -1, 1, -1, 1],
        'Twist': [1, 1, -1, -1, 1, 1, -1, -1],
        'Asymmetry': [1, 1, -1, 1, -1, -1, 1, -1],
    },
    scrollDir9A_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, -1, -1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, 1, -1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1, -1, 1],
    },
    scrollDir9A_1: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, -1, -1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, 1, -1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1, -1, 1],
    },
    scrollDir9A_2: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, -1, -1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, 1, -1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1, -1, 1],
    },
    scrollDir9A_3: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, 1, -1, -1, -1, -1, -1, 1, 1, 1],
        'Split': [1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1],
    },
    scrollDir9A_4: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, 1, -1, -1, -1, -1, -1, 1, 1, 1],
        'Split': [1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1],
    },

    scrollDir9B_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, -1, -1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, 1, -1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1, -1, 1],
    },
    scrollDir9B_1: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, -1, -1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, 1, -1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1, -1, 1],
    },
    scrollDir9B_2: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, -1, -1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, 1, -1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1, -1, 1],
    },

    scrollDir11_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir11_1: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [-1, -1, -1, -1, 1, 1, 1, 1, 1, 1, 1],
    },
    scrollDir11_2: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir11_3: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1],
    },

    scrollDir11L_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir11L_1: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [-1, -1, -1, -1, 1, 1, 1, 1, 1, 1, 1],
    },
    scrollDir11L_2: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir11L_3: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1],
    },

    scrollDir11W_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir11W_1: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir11W_2: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1],
    },

    scrollDir11i_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, 1, -1, -1, -1, -1, -1, 1, 1, 1],
        'Split': [1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1],
    },
    scrollDir11i_1: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, 1, -1, -1, -1, -1, -1, 1, 1, 1],
        'Split': [1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1],
    },

    scrollDir12_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir12_1: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir13_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir14_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir14_1: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir14i_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir15A_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir15A_1: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir15B_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir15B_1: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir16i_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir23_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    },

    // プレイアシスト設定
    assistName5: [`Onigiri`],
    assistName9A: [`Left`, `Right`],
    assistName11i: [`Left`, `Right`],
    assistName17: [`Left`, `Right`],
    assistName23: [`Left`, `Right`],

    assistPos5_0: {
        'Onigiri': [0, 0, 0, 0, 1],
    },
    assistPos5_1: {
        'Onigiri': [1, 0, 0, 0, 0],
    },
    assistPos5_2: {
        'Onigiri': [0, 0, 1, 0, 0],
    },

    assistPos9A_0: {
        'Left': [1, 1, 1, 1, 0, 0, 0, 0, 0],
        'Right': [0, 0, 0, 0, 0, 1, 1, 1, 1],
    },
    assistPos9A_1: {
        'Left': [1, 1, 1, 1, 0, 0, 0, 0, 0],
        'Right': [0, 0, 0, 0, 0, 1, 1, 1, 1],
    },
    assistPos9A_2: {
        'Left': [1, 1, 1, 1, 0, 0, 0, 0, 0],
        'Right': [0, 0, 0, 0, 0, 1, 1, 1, 1],
    },
    assistPos9A_3: {
        'Left': [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        'Right': [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    },

    assistPos11i_0: {
        'Left': [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        'Right': [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    },

    assistPos17_0: {
        'Left': [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        'Right': [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    assistPos17_1: {
        'Left': [1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        'Right': [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1],
    },
    assistPos23_0: {
        'Left': [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        'Right': [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    },

    dummy: 0	// ダミー(カンマ抜け落ち防止)
};

// デフォルト配列のコピー (g_keyObj.aaa_X から g_keyObj.aaa_Xd を作成)
const keyCtrlName = Object.keys(g_keyObj).filter(val => val.startsWith(`keyCtrl`));
keyCtrlName.forEach(property => g_keyObj[`${property}d`] = copyArray2d(g_keyObj[property]));

[`color`, `shuffle`].forEach(type => {
    const tmpName = Object.keys(g_keyObj).filter(val => val.startsWith(type) && val.endsWith(`_0`));
    tmpName.forEach(property => g_keyObj[`${property.slice(0, -2)}`] = g_keyObj[property].concat());
});

// 特殊キーのコピー種 (simple: 代入、multiple: 配列ごと代入)
const g_keyCopyLists = {
    simpleDef: [`blank`, `scale`],
    simple: [`div`, `blank`, `scale`, `keyRetry`, `keyTitleBack`, `transKey`, `scrollDir`, `assistPos`],
    multiple: [`chara`, `color`, `stepRtn`, `pos`, `shuffle`],
};

// タイトル画面関連のリスト群
const g_titleLists = {
    /** タイトル画面で利用する初期オブジェクトのリスト */
    init: [`title`, `titleArrow`, `titleAnimation`, `back`, `backMain`, `ready`],

    /** タイトルのデフォルトフォント */
    defaultFonts: [`'メイリオ'`],

    /** グラデーション関連初期リスト */
    grdList: [`titlegrd`, `titlearrowgrd`],

    /** タイトル用アニメーションの設定種 */
    animation: [`Name`, `Duration`, `Delay`, `TimingFunction`],

};

const g_animationData = [`back`, `mask`];

/**
 * データ種, 最小データ長のセット
 */
const g_dataMinObj = {
    speed: 2,
    boost: 2,
    color: 3,
    acolor: 3,
    shadowcolor: 3,
    ashadowcolor: 3,
    arrowCssMotion: 3,
    frzCssMotion: 3,
    dummyArrowCssMotion: 3,
    dummyFrzCssMotion: 3,
    word: 3,
    mask: 1,
    back: 1,
};

const g_dfColorObj = {

    // 矢印初期色情報
    setColorInit: [`#6666ff`, `#99ffff`, `#ffffff`, `#ffff99`, `#ff9966`],
    setShadowColorInit: [``, ``, ``, ``, ``],

    setColorType1: [`#6666ff`, `#99ffff`, `#ffffff`, `#ffff99`, `#ff9966`],
    setColorType2: [`#ffffff`, `#9999ff`, `#99ccff`, `#ffccff`, `#ff9999`],
    setColorType3: [`#ccccff`, `#ccffff`, `#ffffff`, `#ffffcc`, `#ffcc99`],
    setColorType4: [`#ffffff`, `#ccccff`, `#99ccff`, `#ffccff`, `#ffcccc`],

    setShadowColorType1: [`#00000080`, `#00000080`, `#00000080`, `#00000080`, `#00000080`],
    setShadowColorType2: [`#00000080`, `#00000080`, `#00000080`, `#00000080`, `#00000080`],
    setShadowColorType3: [`#6666ff60`, `#33999960`, `#66666660`, `#99993360`, `#cc663360`],
    setShadowColorType4: [`#66666660`, `#6666ff60`, `#3366cc60`, `#99339960`, `#99333360`],

    // フリーズアロー初期色情報
    frzColorInit: [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
    frzShadowColorInit: [``, ``, ``, ``],
    frzColorType1: [
        [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
        [`#00ffcc`, `#339999`, `#cccc33`, `#999933`],
        [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
        [`#cc99ff`, `#9966ff`, `#cccc33`, `#999933`],
        [`#ff99cc`, `#ff6699`, `#cccc33`, `#999933`]
    ],
    frzColorType2: [
        [`#cccccc`, `#999999`, `#cccc33`, `#999933`],
        [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
        [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
        [`#cc99cc`, `#ff99ff`, `#cccc33`, `#999933`],
        [`#ff6666`, `#ff9999`, `#cccc33`, `#999933`]
    ],
    frzColorType3: [
        [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
        [`#00ffcc`, `#339999`, `#cccc33`, `#999933`],
        [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
        [`#cc99ff`, `#9966ff`, `#cccc33`, `#999933`],
        [`#ff99cc`, `#ff6699`, `#cccc33`, `#999933`]
    ],
    frzColorType4: [
        [`#cccccc`, `#999999`, `#cccc33`, `#999933`],
        [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
        [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
        [`#cc99cc`, `#ff99ff`, `#cccc33`, `#999933`],
        [`#ff6666`, `#ff9999`, `#cccc33`, `#999933`]
    ],
};

const g_dfColorLightObj = {
    setColorType1: [`#6666ff`, `#66cccc`, `#000000`, `#999966`, `#cc6600`],
    setColorType2: [`#000000`, `#6666ff`, `#cc0000`, `#cc99cc`, `#cc3366`],
    setColorType3: [`#000000`, `#000000`, `#000000`, `#000000`, `#000000`],
    setColorType4: [`#000000`, `#000000`, `#000000`, `#000000`, `#000000`],

    setShadowColorType1: [`#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`],
    setShadowColorType2: [`#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`],
    setShadowColorType3: [`#6666ff80`, `#66cccc80`, `#ffffff80`, `#99996680`, `#cc660080`],
    setShadowColorType4: [`#00000080`, `#6666ff80`, `#cc000080`, `#cc99cc80`, `#cc336680`],

    frzColorType1: [
        [`#66ffff`, `#6600ff`, `#ffff00`, `#999900`],
        [`#00ffcc`, `#339999`, `#ffff00`, `#999900`],
        [`#66ffff`, `#6600ff`, `#ffff00`, `#999900`],
        [`#cc99ff`, `#9966ff`, `#ffff00`, `#999900`],
        [`#ff99cc`, `#ff6699`, `#ffff00`, `#999900`]
    ],
    frzColorType2: [
        [`#cccccc`, `#999999`, `#ffff00`, `#999900`],
        [`#66ffff`, `#6600ff`, `#ffff00`, `#999900`],
        [`#66ffff`, `#6600ff`, `#ffff00`, `#999900`],
        [`#cc99cc`, `#ff99ff`, `#ffff00`, `#999900`],
        [`#ff6666`, `#ff9999`, `#ffff00`, `#999900`]
    ],
    frzColorType3: [
        [`#66ffff`, `#6600ff`, `#ffff00`, `#999900`],
        [`#00ffcc`, `#339999`, `#ffff00`, `#999900`],
        [`#66ffff`, `#6600ff`, `#ffff00`, `#999900`],
        [`#cc99ff`, `#9966ff`, `#ffff00`, `#999900`],
        [`#ff99cc`, `#ff6699`, `#ffff00`, `#999900`]
    ],
    frzColorType4: [
        [`#cccccc`, `#999999`, `#ffff00`, `#999900`],
        [`#66ffff`, `#6600ff`, `#ffff00`, `#999900`],
        [`#66ffff`, `#6600ff`, `#ffff00`, `#999900`],
        [`#cc99cc`, `#ff99ff`, `#ffff00`, `#999900`],
        [`#ff6666`, `#ff9999`, `#ffff00`, `#999900`]
    ],
};

const g_escapeStr = {
    escape: [[`&`, `&amp;`], [`<`, `&lt;`], [`>`, `&gt;`], [`"`, `&quot;`]],
    escapeTag: [
        [`*amp*`, `&amp;`], [`*pipe*`, `|`], [`*dollar*`, `$`], [`*rsquo*`, `&rsquo;`],
        [`*quot*`, `&quot;`], [`*comma*`, `&sbquo;`], [`*squo*`, `&#39;`], [`*bkquo*`, `&#96;`],
        [`*lt*`, `&lt;`], [`*gt*`, `&gt;`],
    ],
    unEscapeTag: [
        [`&amp;`, `&`], [`&rsquo;`, `’`], [`&quot;`, `"`], [`&sbquo;`, `,`],
        [`&lt;`, `<`], [`&gt;`, `>`], [`&#39;`, `'`], [`&#96;`, `\``],
    ],
    escapeCode: [
        [`<script>`, ``], [`</script>`, ``],
    ],
};

/**
 * 文字列部分一致用リスト
 */
const g_checkStr = {
    // グラデーションで、カラーコードではないパーセント表記、位置表記系を除外するためのリスト
    // 'at', 'to'のみ、'to left'や'to right'のように方向が入るため、半角スペースまで込みで判断
    cssHeader: [`at `, `to `, `from`, `circle`, `ellipse`, `closest-`, `farthest-`, `transparent`],
    cssFooter: [`deg`, `rad`, `grad`, `turn`, `repeat`],

    // 譜面分割あり、譜面番号固定時のみ譜面データを一時クリアする際の条件
    resetDosHeader: [`gauge`],
    resetDosFooter: [`_data`, `_change`, `Color`, `customGauge`],
};

/** 
 * メッセージ定義 
 * - 変数名は `X_YYYY` の形で、末尾に (X-YYYY) をつける。
 * - 記述不正の場合、書き方を2行目に指定すると親切。
*/
const g_msgInfoObj = {
    W_0001: `お使いのブラウザは動作保証外です。<br>
    Chrome/Opera/Vivaldiなど、WebKit系ブラウザの利用を推奨します。(W-0001)`,
    W_0011: `fileスキームでの動作のため、内蔵の画像データを使用します。(W-0011)<br>
    imgフォルダ以下の画像の変更は適用されません。`,

    E_0011: `アーティスト名が未入力です。(E-0011)`,
    E_0012: `曲名情報が未設定です。(E-0012)<br>
    |musicTitle=曲名,アーティスト名,アーティストURL|`,
    E_0021: `譜面情報が未指定か、フォーマットが間違っています。(E-0021)<br>
    |difData=キー数,譜面名,初期速度|`,
    E_0022: `外部譜面ファイルのフォーマットが間違っています。(E-0022)<br>
    function externalDosInit() { g_externalDos = \`(譜面データ)\`; }`,
    E_0023: `譜面情報が未指定です。(E-0023)<br>
	以下のいずれか、または両方を指定してください。<br>
	&lt;input type="hidden" name="externalDos" id="externalDos" value="dos.txt"&gt;<br>
    &lt;input type="hidden" name="dos" id="dos" value="(譜面データ)"&gt;<br>`,
    E_0031: `楽曲ファイルが未指定か、フォーマットが間違っています。(E-0031)<br>
    |musicUrl=****.mp3|`,
    E_0032: `楽曲ファイルの読み込みに失敗しました。(E-0032)`,
    E_0033: `楽曲ファイルの読み込み中に接続がタイムアウトしました。(E-0033)`,
    E_0034: `楽曲ファイルの読み込み中にエラーが発生しました。(E-0034)`,
    E_0035: `お使いのOSでは指定された楽曲フォーマットに対応していません。(E-0035)`,
    E_0041: `ファイル:{0}の読み込みに失敗しました。(E-0041)<br>`,
    E_0042: `{0}は0より大きい値を指定する必要があります。(E-0042)`,
    E_0051: `Displayオプションのデフォルト設定(XXXXChainOFF)で、<br>指定できない組み合わせが設定されています。(E-0051)`,

    E_0101: `新しいキー:{0}の[color]が未定義です。(E-0101)<br>
    |color{0}=0,1,0,1,0,2|`,
    E_0102: `新しいキー:{0}の[chara]が未定義です。(E-0102)<br>
    |chara{0}=arrowA,arrowB,arrowC,arrowD,arrowE,arrowF|`,
    E_0103: `新しいキー:{0}の[stepRtn]が未定義です。(E-0103)<br>
    |stepRtn{0}=0,45,-90,135,180,onigiri|`,
    E_0104: `新しいキー:{0}の[keyCtrl]が未定義です。(E-0104)<br>
    |keyCtrl{0}=75,79,76,80,187,32/0|`,

    I_0001: `リザルトデータをクリップボードにコピーしました！`,
    I_0002: `入力したキーは割り当てできません。他のキーを指定してください。`,
    I_0003: `各譜面の明細情報をクリップボードにコピーしました！`,
};

/**
 * ショートカット表示のデフォルト値設定
 */
const g_scViewObj = {
    x: 95,
    y: 0,
    w: 40,
    siz: 12,
    format: `{0})`,
};

/**
 * ラベル表示定義
 */
const g_lblNameObj = {
    dancing: `DANCING`,
    star: `☆`,
    onigiri: `ONIGIRI`,
    settings: `SETTINGS`,
    display: `DISPLAY`,
    key: `KEY`,
    config: `CONFIG`,
    result: `RESULT`,

    kcDesc: `[{0}:スキップ / {1}:(代替キーのみ)キー無効化]`,
    kcShuffleDesc: `番号はシャッフルグループを表す<br>番号をクリックでシャッフルグループ、矢印をクリックでカラーグループを一時的に変更可`,
    sdDesc: `[クリックでON/OFFを切替、灰色でOFF]`,
    kcShortcutDesc: `プレイ中ショートカット：「{0}」タイトルバック / 「{1}」リトライ`,
    transKeyDesc: `別キーモードではハイスコア、キーコンフィグ等は保存されません`,
    sdShortcutDesc: `Hid+/Sud+時ショートカット：「pageUp」カバーを上へ / 「pageDown」下へ`,

    maker: `Maker`,
    artist: `Artist`,

    dataReset: `Data Reset`,
    dataSave: `Data Save`,
    clickHere: `Click Here!!`,
    comment: `Comment`,

    nowLoading: `Now Loading...`,
    pleaseWait: `Please Wait...`,

    b_back: `Back`,
    b_keyConfig: `KeyConfig`,
    b_play: `PLAY!`,
    b_reset: `Reset`,
    b_settings: `To Settings`,
    b_copy: `CopyResult`,
    b_tweet: `Tweet`,
    b_gitter: `Gitter`,
    b_retry: `Retry`,

    Difficulty: `Difficulty`,
    Speed: `Speed`,
    Motion: `Motion`,
    Scroll: `Scroll`,
    Reverse: `Reverse`,
    Shuffle: `Shuffle`,
    AutoPlay: `AutoPlay`,
    Gauge: `Gauge`,
    Adjustment: `Adjustment`,
    Fadein: `Fadein`,
    Volume: `Volume`,

    multi: `x`,
    percent: `%`,

    sc_speed: `←→`,
    sc_scroll: `↑/↓`,
    sc_adjustment: `- +`,

    g_start: `Start`,
    g_border: `Border`,
    g_recovery: `Recovery`,
    g_damage: `Damage`,

    s_speed: `Speed`,
    s_boost: `Boost`,
    s_apm: `APM`,
    s_time: `Time`,
    s_arrow: `Arrow`,
    s_frz: `Frz`,

    s_level: `Level`,
    s_douji: `同時補正`,
    s_tate: `縦連補正`,
    s_cnts: `All Arrows`,
    s_linecnts: `- 矢印 Arrow:<br><br>- 氷矢 Frz:<br><br>- 3つ押し位置 ({0}):`,
    s_print: `データ出力`,
    s_printTitle: `Dancing☆Onigiri レベル計算ツール+++`,
    s_printHeader: `難易度\t同時\t縦連\t総数\t矢印\t氷矢印\tAPM\t時間`,

    d_StepZone: `StepZone`,
    d_Judgment: `Judgment`,
    d_FastSlow: `FastSlow`,
    d_LifeGauge: `LifeGauge`,
    d_Score: `Score`,
    d_MusicInfo: `MusicInfo`,
    d_FilterLine: `FilterLine`,
    d_Speed: `Speed`,
    d_Color: `Color`,
    d_Lyrics: `Lyrics`,
    d_Background: `Background`,
    d_ArrowEffect: `ArrowEffect`,
    d_Special: `Special`,

    Appearance: `Appearance`,
    Opacity: `Opacity`,

    'u_x': `x`,
    'u_%': `%`,

    'u_OFF': `OFF`,
    'u_ON': `ON`,
    'u_Boost': `Boost`,
    'u_Brake': `Brake`,

    'u_Cross': `Cross`,
    'u_Split': `Split`,
    'u_Alternate': `Alternate`,
    'u_Twist': `Twist`,
    'u_Asymmetry': `Asymmetry`,
    'u_Flat': `Flat`,
    'u_R-': `R-`,
    'u_Reverse': `Reverse`,

    'u_Mirror': `Mirror`,
    'u_Asym-Mirror': `Asym-Mirror`,
    'u_Random': `Random`,
    'u_Random+': `Random+`,
    'u_S-Random': `S-Random`,
    'u_S-Random+': `S-Random+`,

    'u_ALL': `ALL`,
    'u_Onigiri': `Onigiri`,
    'u_Left': `Left`,
    'u_Right': `Right`,

    'u_Original': `Original`,
    'u_Heavy': `Heavy`,
    'u_NoRecovery': `NoRecovery`,
    'u_SuddenDeath': `SuddenDeath`,
    'u_Practice': `Practice`,
    'u_Light': `Light`,

    'u_Normal': `Normal`,
    'u_Hard': `Hard`,
    'u_Easy': `Easy`,

    'u_Visible': `Visible`,
    'u_Hidden': `Hidden`,
    'u_Hidden+': `Hidden+`,
    'u_Sudden': `Sudden`,
    'u_Sudden+': `Sudden+`,
    'u_Hid&Sud+': `Hid&Sud+`,

    'u_Speed': `Speed`,
    'u_Density': `Density`,
    'u_ToolDif': `ToolDif`,

    'u_Main': `Main`,
    'u_Replaced': `Replaced`,

    'u_Default': `Default`,
    'u_Type0': `Type0`,
    'u_Type1': `Type1`,
    'u_Type2': `Type2`,
    'u_Type3': `Type3`,
    'u_Type4': `Type4`,

    ConfigType: `ConfigType`,
    ColorType: `ColorType`,
    ImgType: `ImgType`,
    ColorGroup: `ColorGr.`,
    ShuffleGroup: `ShuffleGr.`,
    KeyPattern: `KeyPattern`,

    j_ii: "(・∀・)ｲｲ!!",
    j_shakin: "(`・ω・)ｼｬｷﾝ",
    j_matari: "( ´∀`)ﾏﾀｰﾘ",
    j_shobon: "(´・ω・`)ｼｮﾎﾞｰﾝ",
    j_uwan: "( `Д´)ｳﾜｧﾝ!!",

    j_kita: "(ﾟ∀ﾟ)ｷﾀ-!!",
    j_iknai: "(・A・)ｲｸﾅｲ",

    j_maxCombo: `MaxCombo`,
    j_fmaxCombo: `FreezeCombo`,
    j_score: `Score`,

    j_fast: `Fast`,
    j_slow: `Slow`,

    allPerfect: `All Perfect!!`,
    perfect: `Perfect!!`,
    fullCombo: `FullCombo!`,
    cleared: `CLEARED!`,
    failed: `FAILED...`,

    rt_Music: `Music`,
    rt_Difficulty: `Difficulty`,
    rt_Style: `Playstyle`,
    rt_Display: `Display`,

    rd_StepZone: `Step`,
    rd_Judgment: `Judge`,
    rd_FastSlow: `FS`,
    rd_LifeGauge: `Life`,
    rd_Score: `Score`,
    rd_MusicInfo: `MusicInfo`,
    rd_FilterLine: `Filter`,
    rd_Speed: `Speed`,
    rd_Color: `Color`,
    rd_Lyrics: `Lyrics`,
    rd_Background: `Back`,
    rd_ArrowEffect: `Effect`,
    rd_Special: `SP`,
};

/**
 * オンマウステキスト、確認メッセージ定義
 */
const g_msgObj = {

    reload: `ページを再読込します。`,
    howto: `ゲーム画面の見方や設定の詳細についてのページへ移動します（GitHub Wiki）。`,
    dataReset: `この作品で保存されているハイスコアや\nAdjustment情報等をリセットします。`,
    github: `Dancing☆Onigiri (CW Edition)のGitHubページへ移動します。`,
    security: `Dancing☆Onigiri (CW Edition)のサポート情報ページへ移動します。`,

    dataResetConfirm: `この作品のローカル設定をクリアします。よろしいですか？\n(ハイスコアやAdjustment等のデータがクリアされます)`,
    keyResetConfirm: `キーを初期配置に戻します。よろしいですか？`,

    difficulty: `譜面を選択します。`,
    speed: `矢印の流れる速度を設定します。`,
    motion: `矢印の速度を一定ではなく、\n変動させるモーションをつけるか設定します。`,
    reverse: `矢印の流れる向きを設定します。`,
    scroll: `各レーンのスクロール方向をパターンに沿って設定します。\nReverse:ONでスクロール方向を反転します。`,
    shuffle: `譜面を左右反転したり、ランダムにします。\nランダムにした場合は別譜面扱いとなり、ハイスコアは保存されません。`,
    autoPlay: `オートプレイや一部キーを自動で打たせる設定を行います。\nオートプレイ時はハイスコアを保存しません。`,
    gauge: `クリア条件を設定します。\n[Start] ゲージ初期値, [Border] クリア条件(ハイフン時は0),\n[Recovery] 回復量, [Damage] ダメージ量`,
    adjustment: `タイミングにズレを感じる場合、\n数値を変えることでズレを直すことができます。`,
    fadein: `譜面を途中から再生します。\n途中から開始した場合はハイスコアを保存しません。`,
    volume: `ゲーム内の音量を設定します。`,

    graph: `速度変化や譜面密度状況、\n譜面の難易度など譜面の詳細情報を表示します。`,
    dataSave: `ハイスコア、リバース設定、\nキーコンフィグの保存の有無を設定します。`,
    toDisplay: `プレイ画面上のオブジェクトの\n表示・非表示（一部透明度）を設定します。`,
    toSettings: `SETTINGS画面へ戻ります。`,

    d_stepzone: `ステップゾーンの表示`,
    d_judgment: `判定キャラクタ・コンボの表示`,
    d_fastslow: `Fast/Slow表示`,
    d_lifegauge: `ライフゲージの表示`,
    d_score: `現時点の判定数を表示`,
    d_musicinfo: `音楽情報（時間表示含む）`,
    d_filterline: `Hidden+, Sudden+使用時のフィルターの境界線表示`,
    d_speed: `途中変速、個別加速の有効化設定`,
    d_color: `色変化の有効化設定`,
    d_lyrics: `歌詞表示の有効化設定`,
    d_background: `背景・マスクモーションの有効化設定`,
    d_arroweffect: `矢印・フリーズアローモーションの有効化設定`,
    d_special: `作品固有の特殊演出の有効化設定`,

    appearance: `流れる矢印の見え方を制御します。`,
    opacity: `判定キャラクタ、コンボ数、Fast/Slow、Hidden+/Sudden+の\n境界線表示の透明度を設定します。`,

    configType: `キーコンフィグ対象を切り替えます。\n[Main] メインキーのみ, [Replaced] 代替キーのみ, [ALL] 全て`,
    colorType: `矢印色の配色パターンを変更します。\nType1～4選択時は色変化が自動でOFFになります。\n[Type0] グラデーション切替, [Type1～4] デフォルトパターン`,
    imgType: `矢印・フリーズアローなどのオブジェクトの見た目を変更します。`,
    colorGroup: `矢印・フリーズアロー色グループの割り当てパターンを変更します。`,
    shuffleGroup: `Mirror/Asym-Mirror/Random/S-Random選択時、シャッフルするグループを変更します。\n矢印の上にある同じ数字同士でシャッフルします。`,

};

/**
 * エラーメッセージ管理
 */
const g_errMsgObj = {
    title: [],
    option: [],
    settingsDisplay: [],
    loading: [],
    main: [],
    result: [],
};