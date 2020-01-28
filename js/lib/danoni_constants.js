`use strict`;
/**
 * Dancing☆Onigiri (CW Edition)
 * 定数・初期設定用ファイル
 *
 * Source by tickle
 * Created : 2019/11/19
 * Revised : 2019/11/24
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

// 変数型
const C_TYP_BOOLEAN = `boolean`;
const C_TYP_NUMBER = `number`;
const C_TYP_STRING = `string`;
const C_TYP_FLOAT = `float`;
const C_TYP_OBJECT = `object`;
const C_TYP_FUNCTION = `function`;

// 画像ファイル
const C_IMG_ARROW = `../img/arrow.png`;
const C_IMG_ARROWSD = `../img/arrowShadow.png`;
const C_IMG_ONIGIRI = `../img/onigiri.png`;
const C_IMG_AASD = `../img/aaShadow.png`;
const C_IMG_GIKO = `../img/giko.png`;
const C_IMG_IYO = `../img/iyo.png`;
const C_IMG_C = `../img/c.png`;
const C_IMG_MORARA = `../img/morara.png`;
const C_IMG_MONAR = `../img/monar.png`;
const C_IMG_CURSOR = `../img/cursor.png`;
const C_IMG_FRZBAR = `../img/frzbar.png`;
const C_IMG_LIFEBAR = `../img/frzbar.png`;
const C_IMG_LIFEBORDER = `../img/borderline.png`;

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

const g_imgObj = {
    arrow: C_IMG_ARROW,
    arrowShadow: C_IMG_ARROWSD,
    onigiri: C_IMG_ONIGIRI,
    onigiriShadow: C_IMG_AASD,
    giko: C_IMG_GIKO,
    gikoShadow: C_IMG_AASD,
    iyo: C_IMG_IYO,
    iyoShadow: C_IMG_AASD,
    c: C_IMG_C,
    cShadow: C_IMG_AASD,
    morara: C_IMG_MORARA,
    moraraShadow: C_IMG_AASD,
    monar: C_IMG_MONAR,
    monarShadow: C_IMG_AASD,

    arrowStep: C_IMG_ARROW,
    arrowShadowStep: C_IMG_ARROWSD,
    onigiriStep: C_IMG_ONIGIRI,
    onigiriShadowStep: C_IMG_AASD,
    gikoStep: C_IMG_GIKO,
    gikoShadowStep: C_IMG_AASD,
    iyoStep: C_IMG_IYO,
    iyoShadowStep: C_IMG_AASD,
    cStep: C_IMG_C,
    cShadowStep: C_IMG_AASD,
    moraraStep: C_IMG_MORARA,
    moraraShadowStep: C_IMG_AASD,
    monarStep: C_IMG_MONAR,
    monarShadowStep: C_IMG_AASD,

    arrowStepHit: C_IMG_ARROW,
    onigiriStepHit: C_IMG_ONIGIRI,
    gikoStepHit: C_IMG_GIKO,
    iyoStepHit: C_IMG_IYO,
    cStepHit: C_IMG_C,
    moraraStepHit: C_IMG_MORARA,
    monarStepHit: C_IMG_MONAR,

    cursor: C_IMG_CURSOR,
    frzBar: C_IMG_FRZBAR,
    lifeBar: C_IMG_LIFEBAR,
    lifeBorder: C_IMG_LIFEBORDER,
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
const C_LEN_SETLBL_HEIGHT = 23;
const C_SIZ_SETLBL = 17;
const C_LEN_SETDIFLBL_HEIGHT = 25;
const C_SIZ_SETDIFLBL = 17;
const C_LEN_SETMINI_WIDTH = 40;
const C_SIZ_SETMINI = 18;
const C_SIZ_DIFSELECTOR = 14;

const C_LEN_GRAPH_WIDTH = 286;
const C_LEN_GRAPH_HEIGHT = 226;
const C_CLR_SPEEDGRAPH_SPEED = `#cc3333`;
const C_CLR_SPEEDGRAPH_BOOST = `#999900`;

const C_LBL_SETMINIL = `<`;
const C_LEN_SETMINIL_LEFT = C_LEN_SETLBL_LEFT - C_LEN_SETMINI_WIDTH;
const C_LBL_SETMINILL = `<`;
const C_LEN_SETMINILL_LEFT = C_LEN_SETMINIL_LEFT + C_LEN_SETMINI_WIDTH;
const C_LBL_SETMINIR = `>`;
const C_LBL_SETMINIRR = `>`;
const C_LEN_SETMINIR_LEFT = C_LEN_SETLBL_LEFT + C_LEN_SETLBL_WIDTH;
const C_LEN_SETMINIRR_LEFT = C_LEN_SETMINIR_LEFT - C_LEN_SETMINI_WIDTH;

const C_MAX_ADJUSTMENT = 30;
const C_MAX_SPEED = 10;
const C_MIN_SPEED = 1;

const C_KYC_HEIGHT = 150;
const C_KYC_REPHEIGHT = 20;

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
const C_JDG_II = 0;
const C_JDG_SHAKIN = 1;
const C_JDG_MATARI = 2;
const C_JDG_SHOBON = 3;
const C_JDG_UWAN = 4;

const C_JDG_KITA = 0;
const C_JDG_SFSF = 1;
const C_JDG_IKNAI = 2;

let C_JCR_II = "(・∀・)ｲｲ!!";
let C_JCR_SHAKIN = "(`・ω・)ｼｬｷﾝ";
let C_JCR_MATARI = "( ´∀`)ﾏﾀｰﾘ";
let C_JCR_SHOBON = "(´・ω・`)ｼｮﾎﾞｰﾝ";
let C_JCR_UWAN = "( `Д´)ｳﾜｧﾝ!!";

let C_JCR_KITA = "(ﾟ∀ﾟ)ｷﾀ-!!";
let C_JCR_SFSF = "";
let C_JCR_IKNAI = "(・A・)ｲｸﾅｲ";

const C_CLR_DUMMY = `#777777`;

const C_LEN_JDGCHARA_WIDTH = 200;
const C_LEN_JDGCHARA_HEIGHT = 20;
const C_SIZ_JDGCHARA = 20;

const C_LEN_JDGCNTS_WIDTH = 100;
const C_LEN_JDGCNTS_HEIGHT = 20;
const C_SIZ_JDGCNTS = 16;

const C_FRM_HITMOTION = 4;
const C_FRM_JDGMOTION = 60;

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
    score: 0
};

const C_RLT_BRACKET_L = 210;
const C_RLT_HIDIF_X = 165;
const C_RLT_BRACKET_R = 320;

let g_allArrow = 0;
let g_allFrz = 0;
let g_currentArrows = 0;
const g_rankObj = {
    rankMarks: [`SS`, `S`, `SA`, `AAA`, `AA`, `A`, `B`],
    rankRate: [97, 90, 85, 80, 75, 70, 50],
    rankColor: [`#00ccff`, `#6600ff`, `#ff9900`, `#ff0000`, `#00ff00`, `#ff00ff`, `#cc00ff`],

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
    scoreLockFlg: false,
    scoreId: 0,
    dummyId: ``,
    speed: 3.5,
    motion: C_FLG_OFF,
    reverse: C_FLG_OFF,
    scroll: `---`,
    shuffle: C_FLG_OFF,
    autoPlay: C_FLG_OFF,
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

    extraKeyFlg: false,
    dataSaveFlg: true,
    scoreDetailViewFlg: false,
    scoreDetail: `speedGraph`,

    d_stepzone: C_FLG_ON,
    d_judgement: C_FLG_ON,
    d_lifegauge: C_FLG_ON,
    d_musicinfo: C_FLG_ON,
    d_special: C_FLG_ON,
    d_color: C_FLG_ON,
    d_speed: C_FLG_ON,
    d_arroweffect: C_FLG_ON,
    d_lyrics: C_FLG_ON,
    d_background: C_FLG_ON,
    appearance: `Visible`,
};

const C_VAL_MAXLIFE = 1000;
let C_CLR_BORDER = `#555555`;
const C_LFE_SURVIVAL = `Survival`;
const C_LFE_BORDER = `Border`;
const C_LFE_CUSTOM = `Custom`;

let g_gaugeOptionObj = {};
let g_gaugeType;

let g_speeds = [...Array((C_MAX_SPEED - C_MIN_SPEED) * 4 + 1).keys()].map(i => C_MIN_SPEED + i / 4);
let g_speedNum = 0;

let g_motions = [C_FLG_OFF, `Boost`, `Brake`];
let g_motionNum = 0;

let g_reverses = [C_FLG_OFF, C_FLG_ON];
let g_reverseNum = 0;

let g_scrolls = [];
let g_scrollNum = 0;

let g_shuffles = [C_FLG_OFF, `Mirror`, `Random`, `Random+`, `S-Random`, `S-Random+`];
let g_shuffleNum = 0;

let g_gauges = [];
let g_gaugeNum = 0;

let g_autoPlays = [C_FLG_OFF, C_FLG_ON];
let g_autoPlayNum = 0;

let g_adjustments = [...Array(C_MAX_ADJUSTMENT * 2 + 1).keys()].map(i => i - C_MAX_ADJUSTMENT);
let g_adjustmentNum = C_MAX_ADJUSTMENT;

let g_volumes = [0, 0.5, 1, 2, 5, 10, 25, 50, 75, 100];
let g_volumeNum = g_volumes.length - 1;

let g_appearances = [`Visible`, `Hidden`, `Sudden`, `Slit`];
let g_appearanceNum = 0;

let g_scoreDetails = [`speedGraph`, `densityGraph`];
let g_scoreDetailNum = 0;

let g_displays = [`stepZone`, `judgement`, `lifeGauge`, `musicInfo`, `special`,
    `speed`, `color`, `lyrics`, `background`, `arrowEffect`];

// サイズ(後で指定)
let g_sWidth;
let g_sHeight;

// ステップゾーン位置、到達距離(後で指定)
const C_STEP_Y = 70;
const C_STEP_YR = 0;
let g_stepY;
let g_distY;
let g_reverseStepY;
let g_stepYR;

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
for (let j = 0; j < 255; j++) {
    g_kCd[j] = ``;
}
g_kCd[0] = `×`;
g_kCd[8] = `BackSpace`;
g_kCd[9] = `Tab`;
g_kCd[12] = `Clear`;
g_kCd[13] = `Enter`;
g_kCd[16] = `Shift`;
g_kCd[17] = `Ctrl`;
g_kCd[18] = `Alt`;
g_kCd[19] = `Pause`;
g_kCd[27] = `Esc`;
g_kCd[29] = `noCh`;
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
g_kCd[229] = `Z/H`;
g_kCd[240] = `CapsLk`;

// CSS名称
const g_cssObj = {
    title_base: `title_base`,

    settings_DifSelector: `settings_DifSelector`,
    settings_Disabled: `settings_Disabled`,
    settings_FadeinBar: `settings_FadeinBar`,

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

    chara5_1: [`space`, `left`, `down`, `up`, `right`],
    chara7_1: [`left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara9A_1: [`left`, `down`, `up`, `right`, `space`, `sleft`, `sdown`, `sup`, `sright`],
    chara9B_1: [`left`, `down`, `up`, `right`, `space`, `sleft`, `sdown`, `sup`, `sright`],
    chara9i_1: [`left`, `down`, `up`, `right`, `space`, `sleft`, `sdown`, `sup`, `sright`],
    chara11_1: [`sleft`, `sdown`, `sup`, `sright`,
        `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara11L_1: [`sleft`, `sdown`, `sup`, `sright`,
        `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
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
    chara9A_2: [`left`, `down`, `up`, `right`, `space`, `sleft`, `sdown`, `sup`, `sright`],
    chara9B_2: [`left`, `down`, `up`, `right`, `space`, `sleft`, `sdown`, `sup`, `sright`],

    chara9A_3: [`left`, `down`, `gor`, `up`, `right`, `space`,
        `sleft`, `sdown`, `siyo`, `sup`, `sright`],

    // カラーパターン
    color5_0: [0, 0, 0, 0, 2],
    color7_0: [0, 1, 0, 2, 0, 1, 0],
    color7i_0: [2, 2, 2, 0, 0, 0, 0],
    color8_0: [0, 1, 0, 2, 0, 1, 0, 2],
    color9A_0: [0, 0, 0, 0, 2, 3, 3, 3, 3],
    color9B_0: [1, 0, 1, 0, 2, 0, 1, 0, 1],
    color9i_0: [0, 0, 0, 0, 2, 2, 2, 2, 2],
    color11_0: [3, 3, 3, 3, 0, 1, 0, 2, 0, 1, 0],
    color11L_0: [3, 3, 3, 3, 0, 1, 0, 2, 0, 1, 0],
    color11W_0: [2, 3, 3, 2, 0, 1, 0, 2, 0, 1, 0],
    color11i_0: [0, 0, 2, 0, 0, 2, 3, 3, 2, 3, 3],
    color12_0: [3, 3, 3, 3, 2, 0, 1, 0, 1, 0, 1, 0],
    color13_0: [4, 4, 4, 4, 0, 0, 0, 0, 2, 3, 3, 3, 3],
    color14_0: [4, 3, 3, 3, 3, 4, 2, 0, 1, 0, 1, 0, 1, 0],
    color14i_0: [2, 2, 2, 3, 3, 3, 3, 0, 1, 0, 2, 0, 1, 0],
    color15A_0: [3, 3, 3, 3, 4, 4, 4, 4, 0, 1, 0, 2, 0, 1, 0],
    color15B_0: [3, 3, 3, 3, 4, 4, 4, 4, 0, 1, 0, 2, 0, 1, 0],
    color16i_0: [2, 2, 2, 3, 3, 3, 3, 1, 0, 1, 0, 2, 0, 1, 0, 1],
    color17_0: [0, 1, 0, 1, 0, 1, 0, 1, 2, 3, 4, 3, 4, 3, 4, 3, 4],

    color5_1: [2, 0, 0, 0, 0],
    color7_1: [0, 1, 0, 2, 0, 1, 0],
    color9A_1: [0, 0, 0, 0, 2, 3, 3, 3, 3],
    color9B_1: [0, 0, 0, 0, 2, 3, 3, 3, 3],
    color9i_1: [2, 2, 2, 2, 2, 0, 0, 0, 0],
    color11_1: [3, 3, 3, 3, 0, 1, 0, 2, 0, 1, 0],
    color11L_1: [3, 3, 3, 3, 0, 1, 0, 2, 0, 1, 0],
    color12_1: [3, 3, 3, 3, 2, 0, 1, 0, 1, 0, 1, 0],
    color14_1: [4, 3, 3, 3, 3, 4, 2, 0, 1, 0, 1, 0, 1, 0],
    color15A_1: [3, 3, 3, 3, 4, 4, 4, 4, 0, 1, 0, 2, 0, 1, 0],
    color15B_1: [3, 3, 3, 3, 4, 4, 4, 4, 0, 1, 0, 2, 0, 1, 0],
    color17_1: [0, 0, 0, 0, 2, 4, 4, 4, 4, 1, 1, 1, 1, 3, 3, 3, 3],

    color5_2: [0, 0, 2, 0, 0],
    color9A_2: [1, 0, 1, 0, 2, 0, 1, 0, 1],
    color9B_2: [0, 0, 0, 0, 2, 3, 3, 3, 3],

    color9A_3: [0, 0, 2, 0, 0, 2, 3, 3, 2, 3, 3],

    // シャッフルグループ
    //  - Mirror, Random, S-Random使用時、同じグループ同士で入れ替えます
    //  - 同じ数字が同じグループになります
    shuffle5_0: [0, 0, 0, 0, 1],
    shuffle7_0: [0, 0, 0, 1, 0, 0, 0],
    shuffle7i_0: [0, 0, 0, 1, 1, 1, 1],
    shuffle8_0: [0, 0, 0, 1, 0, 0, 0, 2],
    shuffle9A_0: [0, 0, 0, 0, 1, 2, 2, 2, 2],
    shuffle9B_0: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    shuffle9i_0: [0, 0, 0, 0, 1, 1, 1, 1, 1],
    shuffle11_0: [0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1],
    shuffle11L_0: [0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1],
    shuffle11W_0: [0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1],
    shuffle11i_0: [0, 0, 1, 0, 0, 2, 3, 3, 4, 3, 3],
    shuffle12_0: [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
    shuffle13_0: [0, 0, 0, 0, 1, 1, 1, 1, 2, 3, 3, 3, 3],
    shuffle14_0: [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
    shuffle14i_0: [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 2, 2, 2],
    shuffle15A_0: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 2, 2, 2],
    shuffle15B_0: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 2, 2, 2],
    shuffle16i_0: [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2, 2, 2],
    shuffle17_0: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2],

    shuffle5_1: [1, 0, 0, 0, 0],
    shuffle7_1: [0, 0, 0, 1, 0, 0, 0],
    shuffle9A_1: [0, 0, 0, 0, 1, 2, 2, 2, 2],
    shuffle9B_1: [0, 0, 0, 0, 1, 2, 2, 2, 2],
    shuffle9i_1: [0, 0, 0, 0, 0, 1, 1, 1, 1],
    shuffle11_1: [0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1],
    shuffle11L_1: [0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1],
    shuffle12_1: [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
    shuffle14_1: [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
    shuffle15A_1: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 2, 2, 2],
    shuffle15B_1: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 2, 2, 2],
    shuffle17_1: [0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2],

    shuffle5_2: [0, 0, 1, 0, 0],
    shuffle9A_2: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    shuffle9B_2: [0, 0, 0, 0, 1, 2, 2, 2, 2],

    shuffle9A_3: [0, 0, 1, 0, 0, 2, 3, 3, 4, 3, 3],

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

    // 変則パターン (矢印回転、AAキャラクタ)
    // - 末尾の番号をカウントアップさせることで実現できる。keyCtrlと合わせること
    // - 配列の数は、通常パターンと同数で無くてはいけない（keyCtrlも同様）
    stepRtn5_1: [`onigiri`, 0, -90, 90, 180],
    stepRtn7_1: [0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn9A_1: [0, -90, 90, 180, `onigiri`, 0, -90, 90, 180],
    stepRtn9B_1: [0, -90, 90, 180, `onigiri`, 0, -90, 90, 180],
    stepRtn9i_1: [`monar`, `giko`, `c`, `morara`, `onigiri`, 0, -90, 90, 180],
    stepRtn11_1: [0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn11L_1: [0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn12_1: [0, -90, 90, 180, `onigiri`, 0, 30, 60, 90, 120, 150, 180],
    stepRtn14_1: [45, 0, -90, 90, 180, 135, `onigiri`, 0, 30, 60, 90, 120, 150, 180],
    stepRtn15A_1: [0, -90, 90, 180, 0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn15B_1: [0, -90, 90, 180, 0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn17_1: [0, -45, -90, -135, `onigiri`, 45, 90, 135, 180,
        -22.5, -67.5, -112.5, -157.5, 22.5, 67.5, 112.5, 157.5],

    stepRtn5_2: [0, -90, `onigiri`, 90, 180],
    stepRtn9A_2: [45, 0, -45, -90, `onigiri`, 90, 135, 180, 225],
    stepRtn9B_2: [0, -90, 90, 180, `onigiri`, 0, -90, 90, 180],

    stepRtn9A_3: [0, -90, `giko`, 90, 180, `onigiri`, 0, -90, `iyo`, 90, 180],

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

    div5_1: 5,
    div7_1: 7,
    div9A_1: 9,
    div9B_1: 9,
    div9i_1: 9,
    div11_1: 6,
    div11L_1: 6,
    div12_1: 5,
    div14_1: 7,
    div15A_1: 8,
    div15B_1: 8,
    div17_1: 9,

    div5_2: 5,
    div9A_2: 9,
    div9B_2: 9,

    div9A_3: 11,

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

    pos5_1: [0, 1, 2, 3, 4],
    pos7_1: [0, 1, 2, 3, 4, 5, 6],
    pos9A_1: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    pos9B_1: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    pos9i_1: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    pos11_1: [0, 1, 2, 3, 6, 7, 8, 9, 10, 11, 12],
    pos11L_1: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    pos12_1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    pos14_1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    pos15A_1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    pos15B_1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    pos17_1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],

    pos5_2: [0, 1, 2, 3, 4],
    pos9A_2: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    pos9B_2: [0, 1, 2, 3, 4, 5, 6, 7, 8],

    pos9A_3: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

    // 基本パターン (キーコンフィグ)
    // - 末尾dなし(実際の設定値)と末尾dあり(デフォルト値)は必ずセットで揃えること。配列数も合わせる。
    // - 順番はchara, stepRtnと対応している。
    // - 多次元配列内はステップに対応するキーコードを示す。カンマ区切りで複数指定できる。
    keyCtrl5_0: [[37], [40], [38, 0], [39], [32, 0]],
    keyCtrl7_0: [[83], [68], [70], [32, 0], [74], [75], [76]],
    keyCtrl7i_0: [[90], [88], [67], [37], [40], [38, 0], [39]],
    keyCtrl8_0: [[83], [68, 0], [70], [32, 0], [74], [75, 0], [76], [13, 0]],
    keyCtrl9A_0: [[83], [68], [69, 82], [70], [32], [74], [75], [73, 0], [76]],
    keyCtrl9B_0: [[65], [83], [68], [70], [32], [74], [75], [76], [187]],
    keyCtrl9i_0: [[37], [40], [38, 0], [39], [65], [83], [68], [70], [32]],
    keyCtrl11_0: [[37], [40], [38, 0], [39], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl11L_0: [[87], [69], [51, 52], [82], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl11W_0: [[49, 50], [84], [89], [48, 189], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl11i_0: [[83], [88, 67], [68], [69, 82], [70], [32], [74], [77, 188], [75], [73, 79], [76]],
    keyCtrl12_0: [[85], [73], [56, 57], [79], [32], [78], [74], [77], [75], [188], [76], [190]],
    keyCtrl13_0: [[37], [40], [38, 0], [39], [83], [68], [69, 82], [70], [32], [74], [75], [73, 0], [76]],
    keyCtrl14_0: [[84, 89], [85], [73], [56, 55, 57, 48], [79], [192, 80], [32], [78], [74], [77], [75], [188], [76], [190]],
    keyCtrl14i_0: [[90], [88], [67], [37], [40], [38, 0], [39], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl15A_0: [[87], [69], [51, 52], [82], [37], [40], [38, 0], [39], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl15B_0: [[87], [69], [51, 52], [82], [85], [73], [56, 57], [79], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl16i_0: [[90], [88], [67], [37], [40], [38, 0], [39], [65], [83], [68], [70], [32], [74], [75], [76], [187]],
    keyCtrl17_0: [[65], [90], [83], [88], [68], [67], [70], [86], [32], [78], [74], [77], [75], [188], [76], [190], [187]],

    keyCtrl5_0d: [[37], [40], [38, 0], [39], [32, 0]],
    keyCtrl7_0d: [[83], [68], [70], [32, 0], [74], [75], [76]],
    keyCtrl7i_0d: [[90], [88], [67], [37], [40], [38, 0], [39]],
    keyCtrl8_0d: [[83], [68, 0], [70], [32, 0], [74], [75, 0], [76], [13, 0]],
    keyCtrl9A_0d: [[83], [68], [69, 82], [70], [32], [74], [75], [73, 0], [76]],
    keyCtrl9B_0d: [[65], [83], [68], [70], [32], [74], [75], [76], [187]],
    keyCtrl9i_0d: [[37], [40], [38, 0], [39], [65], [83], [68], [70], [32]],
    keyCtrl11_0d: [[37], [40], [38, 0], [39], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl11L_0d: [[87], [69], [51, 52], [82], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl11W_0d: [[49, 50], [84], [89], [48, 189], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl11i_0d: [[83], [88, 67], [68], [69, 82], [70], [32], [74], [77, 188], [75], [73, 79], [76]],
    keyCtrl12_0d: [[85], [73], [56, 57], [79], [32], [78], [74], [77], [75], [188], [76], [190]],
    keyCtrl13_0d: [[37], [40], [38, 0], [39], [83], [68], [69, 82], [70], [32], [74], [75], [73, 0], [76]],
    keyCtrl14_0d: [[84, 89], [85], [73], [56, 55, 57, 48], [79], [192, 80], [32], [78], [74], [77], [75], [188], [76], [190]],
    keyCtrl14i_0d: [[90], [88], [67], [37], [40], [38, 0], [39], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl15A_0d: [[87], [69], [51, 52], [82], [37], [40], [38, 0], [39], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl15B_0d: [[87], [69], [51, 52], [82], [85], [73], [56, 57], [79], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl16i_0d: [[90], [88], [67], [37], [40], [38, 0], [39], [65], [83], [68], [70], [32], [74], [75], [76], [187]],
    keyCtrl17_0d: [[65], [90], [83], [88], [68], [67], [70], [86], [32], [78], [74], [77], [75], [188], [76], [190], [187]],

    // 変則パターン (キーコンフィグ)
    // - 末尾dなし(実際の設定値)と末尾dあり(デフォルト値)は必ずセットで揃えること。配列数も合わせる。
    // - _0, _0dの数字部分をカウントアップすることで実現できる。
    // - 配列数は合わせる必要はあるが、代替キーの数は _X, _Xdで揃っていれば合わせる必要はない。
    keyCtrl5_1: [[32, 0], [37], [40], [38, 0], [39]],
    keyCtrl7_1: [[83], [69], [70], [32, 71, 72], [74], [73], [76]],
    keyCtrl9A_1: [[83], [68], [69, 82], [70], [32], [37], [40], [38, 0], [39]],
    keyCtrl9B_1: [[83], [68], [69, 82], [70], [32], [74], [75], [73, 0], [76]],
    keyCtrl9i_1: [[65], [83], [68], [70], [32], [37], [40], [38, 0], [39]],
    keyCtrl11_1: [[87], [69], [51, 52], [82], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl11L_1: [[37], [40], [38, 0], [39], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl12_1: [[89], [85, 73], [56, 55, 57], [79], [32], [66], [72], [78, 77], [74, 75], [188], [76], [190]],
    keyCtrl14_1: [[82, 84], [89], [85, 73], [56, 54, 55, 57, 48], [79], [192, 80], [32], [66], [72], [78, 77], [74, 75], [188], [76], [190]],
    keyCtrl15A_1: [[87], [69], [51, 52], [82], [85], [73], [56, 57], [79], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl15B_1: [[87], [69], [51, 52], [82], [37], [40], [38, 0], [39], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl17_1: [[65], [83], [68], [70], [32], [74], [75], [76], [187], [90], [88], [67], [86], [78], [77], [188], [190]],

    keyCtrl5_1d: [[32, 0], [37], [40], [38, 0], [39]],
    keyCtrl7_1d: [[83], [69], [70], [32, 71, 72], [74], [73], [76]],
    keyCtrl9A_1d: [[83], [68], [69, 82], [70], [32], [37], [40], [38, 0], [39]],
    keyCtrl9B_1d: [[83], [68], [69, 82], [70], [32], [74], [75], [73, 0], [76]],
    keyCtrl9i_1d: [[65], [83], [68], [70], [32], [37], [40], [38, 0], [39]],
    keyCtrl11_1d: [[87], [69], [51, 52], [82], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl11L_1d: [[37], [40], [38, 0], [39], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl12_1d: [[89], [85, 73], [56, 55, 57], [79], [32], [66], [72], [78, 77], [74, 75], [188], [76], [190]],
    keyCtrl14_1d: [[82, 84], [89], [85, 73], [56, 54, 55, 57, 48], [79], [192, 80], [32], [66], [72], [78, 77], [74, 75], [188], [76], [190]],
    keyCtrl15A_1d: [[87], [69], [51, 52], [82], [85], [73], [56, 57], [79], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl15B_1d: [[87], [69], [51, 52], [82], [37], [40], [38, 0], [39], [83], [68], [70], [32], [74], [75], [76]],
    keyCtrl17_1d: [[65], [83], [68], [70], [32], [74], [75], [76], [187], [90], [88], [67], [86], [78], [77], [188], [190]],

    keyCtrl5_2: [[68], [70], [32, 0], [74, 0], [75]],
    keyCtrl9A_2: [[65], [83], [68], [70], [32], [74], [75], [76], [187]],
    keyCtrl9B_2: [[83], [68], [69, 82], [70], [32], [37], [40], [38, 0], [39]],

    keyCtrl5_2d: [[68], [70], [32, 0], [74, 0], [75]],
    keyCtrl9A_2d: [[65], [83], [68], [70], [32], [74], [75], [76], [187]],
    keyCtrl9B_2d: [[83], [68], [69, 82], [70], [32], [37], [40], [38, 0], [39]],

    keyCtrl9A_3: [[83], [88, 67], [68], [69, 82], [70], [32], [74], [77, 188], [75], [73, 79], [76]],

    keyCtrl9A_3d: [[83], [88, 67], [68], [69, 82], [70], [32], [74], [77, 188], [75], [73, 79], [76]],

    // 矢印間隔補正
    blank: 55,
    blank_def: 55,
    blank11i_0: 50,
    blank17_0: 45,
    blank5_0: 57.5,
    blank5_1: 57.5,
    blank5_2: 57.5,
    blank9A_0: 52.5,
    blank9A_1: 52.5,
    blank9A_2: 52.5,
    blank9A_3: 50,
    blank9B_0: 52.5,
    blank9B_1: 52.5,
    blank9B_2: 52.5,

    // ショートカットキーコード
    keyRetry: 8,
    keyRetry8_0: 9,

    keyTitleBack: 46,

    // 別キー
    transKey9B_1: '9A',
    transKey11_1: '11L',
    transKey11L_1: '11',

    transKey9A_2: '9B',
    transKey9B_2: '9A',

    transKey9A_3: '11i',

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
    scrollDir7i_0: {
        '---': [1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1],
        'Twist': [1, 1, -1, -1, 1, 1, -1],
        'Asymmetry': [1, -1, 1, -1, -1, 1, -1],
    },
    scrollDir8_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, -1, -1, -1, 1, 1, 1],
        'Split': [1, 1, 1, 1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1, -1],
        'Twist': [1, 1, -1, -1, 1, 1, -1, -1],
        'Asymmetry': [1, -1, 1, -1, -1, 1, -1, 1],
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
    scrollDir11L_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir11L_1: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [-1, -1, -1, -1, 1, 1, 1, 1, 1, 1, 1],
    },
    scrollDir11W_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1],
    },

    scrollDir11i_0: {
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

    dummy: 0	// ダミー(カンマ抜け落ち防止)
};

/** 
 * メッセージ定義 
 * - 変数名は `C_MSG_X_YYYY` の形で、末尾に (X-YYYY) をつける。
 * - 記述不正の場合、書き方を2行目に指定すると親切。
*/
const C_MSG_W_0001 = `お使いのブラウザは動作保証外です。<br>
	Chrome/Opera/Vivaldiなど、WebKit系ブラウザの利用を推奨します。(W-0001)`;
const C_MSG_E_0011 = `アーティスト名が未入力です。(E-0011)`;
const C_MSG_E_0012 = `曲名情報が未設定です。(E-0012)<br>
	|musicTitle=曲名,アーティスト名,アーティストURL|`;
const C_MSG_E_0021 = `譜面情報が未指定か、フォーマットが間違っています。(E-0021)<br>
	|difData=キー数,譜面名,初期速度|`;
const C_MSG_E_0022 = `外部譜面ファイルのフォーマットが間違っています。(E-0022)<br>
	function externalDosInit() { g_externalDos = \`(譜面データ)\`; }`;
const C_MSG_E_0023 = `譜面情報が未指定です。(E-0023)<br>
	以下のいずれか、または両方を指定してください。<br>
	&lt;input type="hidden" name="externalDos" id="externalDos" value="dos.txt"&gt;<br>
	&lt;input type="hidden" name="dos" id="dos" value="(譜面データ)"&gt;<br>`;
const C_MSG_E_0031 = `楽曲ファイルが未指定か、フォーマットが間違っています。(E-0031)<br>
	|musicUrl=****.mp3|`;
const C_MSG_E_0032 = `楽曲ファイルの読み込みに失敗しました。(E-0032)`;
const C_MSG_E_0033 = `楽曲ファイルの読み込み中に接続がタイムアウトしました。(E-0033)`;
const C_MSG_E_0034 = `楽曲ファイルの読み込み中にエラーが発生しました。(E-0034)`;
const C_MSG_E_0035 = `お使いのOSでは指定された楽曲フォーマットに対応していません。(E-0035)`;
const C_MSG_E_0041 = `ファイル:{0}の読み込みに失敗しました。(E-0041)<br>`;

const C_MSG_E_0101 = `新しいキー:{0}の[color]が未定義です。(E-0101)<br>
	|color{0}=0,1,0,1,0,2|`;
const C_MSG_E_0102 = `新しいキー:{0}の[chara]が未定義です。(E-0102)<br>
	|chara{0}=arrowA,arrowB,arrowC,arrowD,arrowE,arrowF|`;
const C_MSG_E_0103 = `新しいキー:{0}の[stepRtn]が未定義です。(E-0103)<br>
	|stepRtn{0}=0,45,-90,135,180,onigiri|`;
const C_MSG_E_0104 = `新しいキー:{0}の[keyCtrl]が未定義です。(E-0104)<br>
    |keyCtrl{0}=75,79,76,80,187,32/0|`;

