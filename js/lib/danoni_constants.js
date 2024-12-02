'use strict';
/**
 * Dancing☆Onigiri (CW Edition)
 * 定数・初期設定用ファイル
 *
 * Source by tickle
 * Created : 2019/11/19
 * Revised : 2024/12/02 (v38.1.0)
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

const C_LBL_BASICFONT = `"Meiryo UI", sans-serif`;

/** 設定幅、位置などを管理するプロパティ */
const g_limitObj = {

    // Adjustment, HitPositionの設定幅
    adjustment: 30,
    hitPosition: 50,

    // playbackRate有効時のAdjustmentの設定値の文字サイズ、行幅
    adjustmentViewSiz: 14,
    adjustmentViewOrgSiz: 11,
    adjustmentLineHeight: 12,

    // 譜面密度グラフの分割数、上位色付け数
    densityDivision: 16,
    densityMaxVals: 3,

    // ボタン・リンクの高さ、フォントサイズ
    btnHeight: 50,
    btnSiz: 28,
    lnkHeight: 30,
    lnkSiz: 16,

    // 設定画面用のボタンの位置、幅、高さ、フォントサイズ
    setLblLeft: 160,
    setLblWidth: 210,
    setLblHeight: 22,
    setLblSiz: 17,

    // 設定画面の左右移動ボタンの幅、フォントサイズ
    setMiniWidth: 40,
    setMiniSiz: 18,

    // 譜面選択エリアの幅、フォントサイズ
    difSelectorWidth: 250,
    difSelectorSiz: 14,
    difCoverWidth: 110,

    // 判定キャラクタの幅、高さ、フォントサイズ
    jdgCharaWidth: 200,
    jdgCharaHeight: 22,
    jdgCharaSiz: 20,

    // 判定数の幅、高さ、フォントサイズ
    jdgCntsWidth: 100,
    jdgCntsHeight: 20,
    jdgCntsSiz: 16,

    // グラフ表示部分の幅、高さ
    graphWidth: 286,
    graphHeight: 240,
    graphMiniSiz: 12,

    // その他のフォントサイズ
    titleSiz: 32,
    mainSiz: 14,
    musicTitleSiz: 13,
    keySetSiz: 15,

    // ボタン基準横幅（最大）
    btnBaseWidth: 900,

    // キーコンフィグのカラーピッカー幅
    kcColorPickerX: 60,

    // キーコンフィグで表示するカラーピッカー数
    kcColorPickerNum: 5,
};

/** 設定項目の位置 */
const g_settingPos = {
    option: {
        difficulty: { heightPos: 0, y: -5, dw: 0, dh: 10 },
        speed: { heightPos: 2, y: 0, dw: 0, dh: 0 },
        motion: { heightPos: 3, y: 0, dw: 0, dh: 0 },
        reverse: { heightPos: 4, y: 0, dw: 0, dh: 0 },
        scroll: { heightPos: 4, y: 0, dw: 0, dh: 0 },
        shuffle: { heightPos: 5.5, y: 0, dw: 0, dh: 0 },
        autoPlay: { heightPos: 6.5, y: 0, dw: 0, dh: 0 },
        gauge: { heightPos: 7.5, y: 0, dw: 0, dh: 0 },
        adjustment: { heightPos: 10.5, y: 0, dw: 0, dh: 0 },
        fadein: { heightPos: 11.5, y: 0, dw: 0, dh: 0 },
        volume: { heightPos: 12.5, y: 0, dw: 0, dh: 0 },
    },
    settingsDisplay: {
        appearance: { heightPos: 7.4, y: 10, dw: 0, dh: 0 },
        opacity: { heightPos: 9, y: 10, dw: 0, dh: 0 },
        hitPosition: { heightPos: 10, y: 10, dw: 0, dh: 0 },
    },
};

// スプライト（ムービークリップ相当）のルート
const C_SPRITE_ROOT = `divRoot`;

/**
 * ロケール管理
 */
const g_localeObj = {
    val: `Ja`,
    list: [`Ja`, `En`],
    num: 0,
};

const g_userAgent = window.navigator.userAgent.toLowerCase(); // msie, edge, chrome, safari, firefox, opera
const g_isIos = listMatching(g_userAgent, [`iphone`, `ipad`, `ipod`]);
const g_isMac = listMatching(g_userAgent, [`iphone`, `ipad`, `ipod`, `mac os`]);

// 変数型
const C_TYP_BOOLEAN = `boolean`;
const C_TYP_NUMBER = `number`;
const C_TYP_STRING = `string`;
const C_TYP_FLOAT = `float`;
const C_TYP_OBJECT = `object`;
const C_TYP_FUNCTION = `function`;
const C_TYP_SWITCH = `switch`;
const C_TYP_CALC = `calc`;

// ウィンドウサイズ
let [g_sWidth, g_sHeight] = [
    setVal($id(`canvas-frame`).width, 500, C_TYP_FLOAT), setVal($id(`canvas-frame`).height, 500, C_TYP_FLOAT)
];
$id(`canvas-frame`).width = `${Math.max(g_sWidth, 500)}px`;
$id(`canvas-frame`).height = `${Math.max(g_sHeight, 500)}px`;
$id(`canvas-frame`).margin = `auto`;

const g_btnWidth = (_multi = 1) => Math.min(g_sWidth, g_limitObj.btnBaseWidth) * _multi;
const g_btnX = (_multi = 0) => g_btnWidth(_multi) + Math.max((g_sWidth - g_limitObj.btnBaseWidth) / 2, 0);

// 固定ウィンドウサイズ
const g_windowObj = {
    divRoot: { margin: `auto`, letterSpacing: `normal` },
    divBack: { background: `linear-gradient(#000000, #222222)` },

    colorPickSprite: { x: 0, y: 90, w: 50, h: 280 },
};

const g_lblPosObj = {};

/**
 * 可変部分のウィンドウサイズを更新
 * - 指定しているプロパティ名は基本的にCSSのスタイル名が使用できる
 * - 特殊な関数及びプロパティについては下記の通り。
 * - g_btnX() :画面横幅を意識せず自動でX座標を設定。引数を入れるとボタン幅×引数だけ位置がずれる。(Default: 0)
 * - g_btnWidth(): 画面横幅を意識せず自動でボタン横幅を設定。引数には倍率を指定する。(Default: 1)
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 * @property {number} siz フォントサイズ
 * @property {number} title オンマウス時のメッセージ文
 */
const updateWindowSiz = () => {
    Object.assign(g_windowObj, {
        optionSprite: { x: (g_sWidth - 450) / 2, y: 65, w: 450, h: 325 },
        difList: { x: 165, y: 60, w: 280, h: 270 + g_sHeight - 500, overflow: `auto` },
        difCover: { x: 20, y: 60, w: 145, h: 270 + g_sHeight - 500, opacity: 0.95 },
        difFilter: { x: 0, y: 66, w: 140, h: 204 + g_sHeight - 500, overflow: `auto` },
        displaySprite: { x: 25, y: 30, w: (g_sWidth - 450) / 2, h: g_limitObj.setLblHeight * 5 },
        scoreDetail: { x: 20, y: 85, w: (g_sWidth - 500) / 2 + 420, h: 245, visibility: `hidden` },
        detailObj: { w: (g_sWidth - 500) / 2 + 420, h: 230, visibility: `hidden` },
        keyconSprite: { y: 105, h: g_sHeight - 105, overflow: `auto` },
        loader: { y: g_sHeight - 10, h: 10, backgroundColor: `#333333` },
        playDataWindow: { x: g_sWidth / 2 - 225, y: 70, w: 450, h: 110 },
        resultWindow: { x: g_sWidth / 2 - 200, y: 185, w: 400, h: 210 },
    });

    Object.assign(g_lblPosObj, {

        /** タイトル画面 */
        btnReset: {
            x: g_btnX(), y: g_sHeight - 20, w: g_btnWidth(1 / 4), h: 16, siz: 12, title: g_msgObj.dataReset,
        },
        btnReload: {
            x: 10 + g_btnX(), y: 10, w: 30, h: 30, siz: 20, title: g_msgObj.reload,
        },
        btnHelp: {
            x: g_btnX(), y: g_sHeight - 150, w: 40, h: 40, siz: 30, title: g_msgObj.howto,
        },
        lnkMaker: {
            x: g_btnX(), y: g_sHeight - 50, w: g_btnWidth(1 / 2), h: g_limitObj.lnkHeight,
            align: C_ALIGN_LEFT, title: g_headerObj.creatorUrl,
        },
        lnkArtist: {
            x: g_btnX(1 / 2), y: g_sHeight - 50, w: g_btnWidth(1 / 2), h: g_limitObj.lnkHeight,
            align: C_ALIGN_LEFT, title: g_headerObj.artistUrl,
        },
        lnkVersion: {
            x: g_btnX(1 / 4), y: g_sHeight - 20, w: g_btnWidth(3 / 4) - 20, h: 16,
            align: C_ALIGN_RIGHT, title: g_msgObj.github,
        },
        lnkComparison: {
            x: g_btnX(1) - 20, y: g_sHeight - 20, w: 20, h: 16, siz: 12, title: g_msgObj.security,
        },
        lblComment: {
            x: g_btnX(), y: 70, w: g_btnWidth(), h: g_sHeight - 180, siz: g_limitObj.difSelectorSiz, align: C_ALIGN_LEFT,
            overflow: `auto`, background: `#222222`, color: `#cccccc`, display: C_DIS_NONE,
            whiteSpace: `normal`,
        },
        btnComment: {
            x: g_btnX(1) - 160, y: (g_sHeight / 2) + 150, w: 140, h: 50, siz: 20, border: `solid 1px #999999`,
        },

        /** 設定画面 */
        btnBack: {
            x: g_btnX(),
        },
        btnKeyConfig: {
            x: g_btnX(1 / 3),
        },
        btnPlay: {
            x: g_btnX(2 / 3),
        },
        btnSwitchSetting: {
            x: g_sWidth / 2 + 175 - g_limitObj.setMiniWidth / 2, y: 25, w: g_limitObj.setMiniWidth, h: 40,
        },
        btnSave: {
            x: g_btnX(), y: 5, w: g_btnWidth(1 / 5), h: 16, siz: 12,
            title: g_msgObj.dataSave, borderStyle: `solid`,
        },

        lblBaseSpd: {
            x: g_sWidth - 100, y: 0, w: 100, h: 20, siz: 14,
        },
        btnReverse: {
            x: 160, y: 0, w: 90, h: 21, siz: g_limitObj.difSelectorSiz, borderStyle: `solid`,
        },
        btnExcessive: {
            x: 5, y: 25, w: 90, h: 21, siz: g_limitObj.difSelectorSiz, borderStyle: `solid`,
        },
        lblGauge2: {
            x: g_limitObj.setLblLeft - 55, y: g_limitObj.setLblHeight,
            w: g_limitObj.setLblWidth + 60, h: g_limitObj.setLblHeight * 2, siz: 11,
        },
        lnkFadein: {
            x: g_limitObj.setLblLeft, y: 0,
        },
        lblFadeinBar: {
            x: g_limitObj.setLblLeft, y: 0,
        },

        /** 設定: 譜面明細子画面 */
        lblTooldif: {
            y: 5, w: 250, siz: g_limitObj.jdgCntsSiz,
        },
        dataTooldif: {
            x: 270, y: 3, w: 160, siz: 18,
        },
        lblDouji: {},
        lblTate: {
            x: 270,
        },
        dataDouji: {
            x: 200, w: 160,
        },
        dataTate: {
            x: 345, w: 160,
        },
        lblArrowInfo: {
            x: 130, y: 45, w: 290, siz: g_limitObj.jdgCntsSiz,
        },
        dataArrowInfo: {
            x: 270, y: 45, w: 160, siz: g_limitObj.jdgCntsSiz,
        },
        lblArrowInfo2: {
            x: 130, y: 70, w: 200, h: 90,
        },
        dataArrowInfo2: {
            x: 140, y: 70, w: (g_sWidth - 500) / 2 + 275, h: 150, overflow: `auto`,
        },
        lnkDifInfo: {
            w: g_limitObj.difCoverWidth, h: 20, borderStyle: `solid`,
        },
        lnkHighScore: {
            w: g_limitObj.difCoverWidth, h: 20, borderStyle: `solid`,
        },
        lblHRank: {
            x: 290, y: 145, w: 120, h: 20, siz: 50, align: C_ALIGN_CENTER,
        },

        /** ディスプレイ画面 */
        scMsg: {
            x: 0, y: g_sHeight - 45, w: g_sWidth, h: 20,
        },
        sdDesc: {
            x: 0, y: 65, w: g_sWidth, h: 20, siz: g_limitObj.mainSiz,
        },
        lblAppearancePos: {
            x: g_limitObj.setLblLeft, y: 20, siz: 12, align: C_ALIGN_CENTER,
        },
        lblAppearanceBar: {
            x: g_limitObj.setLblLeft, y: 15,
        },
        lnkLockBtn: {
            x: g_limitObj.setLblLeft + g_limitObj.setLblWidth - 40, y: 0, w: 40, h: g_limitObj.setLblHeight, siz: 12,
            borderStyle: `solid`,
        },

        /** キーコンフィグ画面 */
        scKcMsg: {
            x: g_btnX(), y: g_sHeight - 50, w: g_btnWidth(), h: 20,
        },
        kcMsg: {
            x: g_btnX(), y: g_sHeight - 33, w: g_btnWidth(), h: 20, siz: g_limitObj.mainSiz,
            pointerEvents: `none`,
        },
        kcDesc: {
            x: g_btnX() + 50, y: 68, w: g_btnWidth() - 100, h: 20,
        },
        kcShuffleDesc: {
            x: g_btnX() + 50, y: 85, w: g_btnWidth() - 100, h: 20,
        },
        pickPos: {
            x: 0, w: 50, h: 15, siz: 11, align: C_ALIGN_LEFT, background: `#${g_headerObj.baseBrightFlg ? `eeeeee` : `111111`}80`,
        },
        lnkColorR: {
            x: 0, y: -20, w: 30, h: 20, siz: 14, title: g_msgObj.pickColorR,
        },
        lnkColorCopy: {
            x: 30, y: -20, w: 30, h: 20, siz: 14, title: g_msgObj.pickColorCopy,
        },
        lnkColorReset: {
            x: 0, y: 280, w: 50, h: 20, siz: 14, title: g_msgObj.pickColorReset,
        },
        lblkey: {
            x: g_sWidth - 80, y: 90, w: 60, h: 20, siz: 14,
        },
        lnkKeySwitch: {
            x: g_sWidth - 60, w: 50, h: 20, siz: 14,
        },

        btnKcBack: {
            x: g_btnX(1 / 3), y: g_sHeight - 75,
            w: g_btnWidth(1 / 3), h: g_limitObj.btnHeight / 2, siz: g_limitObj.btnSiz * 2 / 3,
        },
        lblPattern: {
            x: g_btnX(1 / 6), y: g_sHeight - 100, w: g_btnWidth() / 3, h: g_limitObj.btnHeight / 2,
        },
        btnPtnChangeR: {
            x: g_btnX(1 / 2), y: g_sHeight - 100,
            w: g_btnWidth(1 / 9), h: g_limitObj.btnHeight / 2, siz: g_limitObj.btnSiz * 2 / 3,
        },
        btnPtnChangeL: {
            x: g_btnX(1 / 18), y: g_sHeight - 100,
            w: g_btnWidth(1 / 9), h: g_limitObj.btnHeight / 2, siz: g_limitObj.btnSiz * 2 / 3,
        },
        btnPtnChangeRR: {
            x: g_btnX(11 / 18), y: g_sHeight - 100,
            w: g_btnWidth(1 / 18), h: g_limitObj.btnHeight / 2, siz: g_limitObj.btnSiz * 2 / 3,
        },
        btnPtnChangeLL: {
            x: g_btnX(), y: g_sHeight - 100,
            w: g_btnWidth(1 / 18), h: g_limitObj.btnHeight / 2, siz: g_limitObj.btnSiz * 2 / 3,
        },
        btnKcReset: {
            x: g_btnX(), y: g_sHeight - 75,
            w: g_btnWidth(1 / 3), h: g_limitObj.btnHeight / 2, siz: g_limitObj.btnSiz * 2 / 3,
            title: g_msgObj.kcReset,
        },

        /** メイン画面 */
        stepHit: {
            x: -15, y: -15, w: C_ARW_WIDTH + 30, h: C_ARW_WIDTH + 30,
        },
        filterBar: {
            w: g_headerObj.playingWidth - 50, h: 1, styleName: `lifeBar`, opacity: 0.0625,
        },
        filterView: {
            x: g_headerObj.playingWidth - 70, y: 0, w: 10, h: 10, siz: 10, align: C_ALIGN_RIGHT,
        },
        frzHitTop: {
            x: -8, y: -8, w: C_ARW_WIDTH + 16, h: C_ARW_WIDTH + 16,
        },
        lblframe: {
            x: 0, y: 0, w: 100, h: 30, siz: 20,
        },
        lblCredit: {
            x: 125, y: g_headerObj.playingHeight - 30, w: g_headerObj.playingWidth - 125, h: 20, align: C_ALIGN_LEFT,
        },
        lblDifName: {
            x: 125, y: g_headerObj.playingHeight - 16, w: g_headerObj.playingWidth, h: 20, align: C_ALIGN_LEFT,
        },
        lblTime1: {
            x: 18, y: g_headerObj.playingHeight - 30, w: 40, h: 20, siz: g_limitObj.mainSiz, align: C_ALIGN_RIGHT,
        },
        lblTime2: {
            x: 60, y: g_headerObj.playingHeight - 30, w: 60, h: 20, siz: g_limitObj.mainSiz,
        },
        lblWord: {
            x: 100, w: g_headerObj.playingWidth - 200, h: 50,
            siz: g_limitObj.mainSiz, align: C_ALIGN_LEFT, display: `block`, margin: `auto`,
        },
        finishView: {
            x: g_headerObj.playingWidth / 2 - 150, y: g_headerObj.playingHeight / 2 - 50, w: 300, h: 20, siz: 50,
        },
        musicInfoOFF: {
            x: 20, animationDuration: `4.0s`, animationName: `leftToRightFade`, animationFillMode: `both`,
        },
        lblMainScHeader: {
            x: g_sWidth + g_headerObj.scAreaWidth - 85, w: 80, h: 20, siz: 12, align: C_ALIGN_RIGHT,
        },
        lblMainScKey: {
            x: g_sWidth + g_headerObj.scAreaWidth - 85, w: 80, h: 20, siz: 12, align: C_ALIGN_RIGHT,
        },

        /** 結果画面 */
        lblRank: {
            x: 340, y: 160, w: 70, h: 20, siz: 50, align: C_ALIGN_CENTER,
        },
        lblResultPre: {
            x: g_sWidth / 2 - 150, y: 90, w: 200, h: 50, siz: 60, opacity: 0,
        },
        lblResultPre2: {
            x: g_sWidth / 2 + 50, y: 40, w: 200, h: 30, siz: 20,
        },
        btnRsBack: {
            x: g_btnX(), w: g_btnWidth(1 / 4), h: g_limitObj.btnHeight * 5 / 4, animationName: `smallToNormalY`,
        },
        btnRsCopy: {
            x: g_btnX(1 / 4), w: g_btnWidth(1 / 2), h: g_limitObj.btnHeight * 5 / 8, siz: 24, animationName: `smallToNormalY`,
        },
        btnRsTweet: {
            x: g_btnX(1 / 4), y: g_sHeight - 100 + g_limitObj.btnHeight * 5 / 8,
            w: g_btnWidth(1 / 4), h: g_limitObj.btnHeight * 5 / 8, siz: 24, animationName: `smallToNormalY`,
        },
        btnRsGitter: {
            x: g_btnX(1 / 2), y: g_sHeight - 100 + g_limitObj.btnHeight * 5 / 8,
            w: g_btnWidth(1 / 4), h: g_limitObj.btnHeight * 5 / 8, siz: 24, animationName: `smallToNormalY`,
        },
        btnRsRetry: {
            x: g_btnX(3 / 4), w: g_btnWidth(1 / 4), h: g_limitObj.btnHeight * 5 / 4, animationName: `smallToNormalY`,
        },
        btnRsCopyImage: {
            x: g_btnX(1) - 40, y: 0, w: 40, h: 40, siz: 30,
        },
        btnRsCopyClose: {
            x: g_btnX(1) - 80, y: 0, w: 80, h: 40, siz: 20,
        },
        resultImageDesc: {
            x: 0, y: g_sHeight - 30, w: g_sWidth, h: 20, siz: g_limitObj.mainSiz,
        },
    });
};

// ウィンドウ位置
const g_windowAlign = {
    left: () => {
        $id(`canvas-frame`).marginLeft = `0px`;
        $id(`canvas-frame`).marginRight = `auto`;
    },
    center: () => {
        $id(`canvas-frame`).margin = `auto`;
    },
    right: () => {
        $id(`canvas-frame`).marginLeft = `auto`;
        $id(`canvas-frame`).marginRight = `0px`;
    },
};

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
let C_IMG_TITLE_ARROW;

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

    if (g_presetObj.customImageList !== undefined) {
        g_presetObj.customImageList.forEach(image => reloadImgCustomObj(image, _baseDir, _exp));
    }
};

const reloadImgObj = () => {
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

    g_imgObj.titleArrow = C_IMG_TITLE_ARROW;
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
    color: [`color`, `acolor`],
    arrowColor: [``, `Shadow`],
    frzColor: [`Normal`, `NormalBar`, `Hit`, `HitBar`, `NormalShadow`, `HitShadow`],
    dataList: [
        `Arrow`, `FrzArrow`, `FrzLength`,
        `Color`, `ColorCd`, `ColorShadow`, `ColorShadowCd`, `ScrollchArrow`, `ScrollchStep`, `ScrollchArrowDir`, `ScrollchStepDir`,
        `FColorNormal`, `FColorNormalCd`, `FColorNormalBar`, `FColorNormalBarCd`,
        `FColorNormalShadow`, `FColorNormalShadowCd`,
        `FColorHit`, `FColorHitCd`, `FColorHitBar`, `FColorHitBarCd`,
        `FColorHitShadow`, `FColorHitShadowCd`,
        `ArrowCssMotion`, `ArrowCssMotionName`,
        `FrzCssMotion`, `FrzCssMotionName`,
        `ArrowColorChangeAll`, `FrzColorChangeAll`,
    ],
};

// Motionオプション配列の基準位置
const C_MOTION_STD_POS = 15;

// キーブロック対象(KeyBoardEvent.codeを指定)
const C_BLOCK_KEYS = [
    `Backspace`, `Tab`, `Enter`, `ControlLeft`, `ControlRight`, `AltLeft`, `AltRight`, `Space`,
    `PageUp`, `PageDown`, `End`, `Home`,
    `ArrowLeft`, `ArrowDown`, `ArrowUp`, `ArrowRight`, `Delete`,
    `F1`, `F2`, `F3`, `F4`, `F6`, `F7`, `F8`, `F9`, `F10`, `F11`, `F12`, `F13`, `F14`, `F15`, `Escape`
];

/**
 * 特殊文字列の置き換えリスト
 * (置き換え元、置き換え先の組で二次元配列として定義。主にreplaceStr関数で使用)
 * - 先に合致したものを置換するため、複雑なパターンは先に配置する必要がある
 * 
 * @property {string[][]} escape 特殊文字 -> エスケープ文字列
 * @property {string[][]} escapeTag CW Edition定義の特殊文字列 -> エスケープ文字列
 * @property {string[][]} unEscapeTag エスケープ文字列 -> 特殊文字
 * @property {string[][]} escapeCode 使用禁止文字の無効化
 * @property {string[][]} musicNameSimple 曲名中の改行タグ -> 空白化
 * @property {string[][]} musicNameMultiLine 曲名中の特殊改行タグ -> 通常タグ化
 * @property {string[][]} frzName 矢印データ名 -> フリーズアローデータ名
 * @property {string[][]} keyCtrlName キー割当正式名 -> 略名
 * @property {string[][]} colorPatternName 色変化指定先略名 -> 正式名
 * @property {string[][]} targetPatternName 色変化指定先略名(all) -> 正式適用先(g0～g49)
 * @property {string[][]} gaugeParamName ゲージ数式用略名 -> 計算式 ({0}にはscoreIdが入る)
 */
const g_escapeStr = {
    escape: [[`&`, `&amp;`], [`<`, `&lt;`], [`>`, `&gt;`], [`"`, `&quot;`]],
    escapeTag: [
        [`*amp*`, `&amp;`], [`*pipe*`, `|`], [`*dollar*`, `$`], [`*rsquo*`, `&rsquo;`],
        [`*quot*`, `&quot;`], [`*comma*`, `&sbquo;`], [`*squo*`, `&#39;`], [`*bkquo*`, `&#96;`],
        [`*lt*`, `&lt;`], [`*gt*`, `&gt;`], [`*lbrace*`, `{`], [`*rbrace*`, `}`],
    ],
    unEscapeTag: [
        [`&amp;`, `&`], [`&rsquo;`, `’`], [`&quot;`, `"`], [`&sbquo;`, `,`],
        [`&lt;`, `<`], [`&gt;`, `>`], [`&#39;`, `'`], [`&#96;`, `\``],
    ],
    escapeCode: [
        [`<script>`, ``], [`</script>`, ``],
    ],
    musicNameSimple: [
        [`<br>`, ` `], [`<nbr>`, ``], [`<dbr>`, `　`],
    ],
    musicNameMultiLine: [
        [`<nbr>`, `<br>`], [`<dbr>`, `<br>`],
    ],
    frzName: [
        [`leftdia`, `frzLdia`], [`rightdia`, `frzRdia`],
        [`left`, `frzLeft`], [`down`, `frzDown`], [`up`, `frzUp`], [`right`, `frzRight`],
        [`space`, `frzSpace`], [`iyo`, `frzIyo`], [`gor`, `frzGor`], [`oni`, `foni`],
    ],
    keyCtrlName: [
        [`ShiftLeft`, `Shift`], [`ControlLeft`, `Control`], [`AltLeft`, `Alt`],
        [`Digit`, `D`], [`Numpad`, `N`], [`Semicolon`, `;`],
        [`Multiply`, `*`], [`Add`, `+`], [`Subtract`, `-`], [`Decimal`, `.`], [`Divide`, `Div`],
        [`Quote`, `Ja-Colon`], [`BracketLeft`, `Ja-@`], [`BracketRight`, `Ja-[`],
        [`Backslash`, `Ja-]`], [`Equal`, `Ja-^`],
    ],
    colorPatternName: [
        [`AR`, `Arrow`], [`AS`, `ArrowShadow`],
        [`NA`, `Normal`], [`NB`, `NormalBar`], [`NS`, `NormalShadow`],
        [`HA`, `Hit`], [`HB`, `HitBar`], [`HS`, `HitShadow`],
        [`FN`, `Normal/NormalBar`], [`FH`, `Hit/HitBar`], [`FS`, `NormalShadow/HitShadow`],
        [`AF`, `Arrow/Normal/NormalBar/Hit/HitBar`],
        [`FrzNormal`, `Normal/NormalBar`], [`FrzHit`, `Hit/HitBar`],
        [`FrzShadow`, `NormalShadow/HitShadow`],
        [`Frz`, `Normal/NormalBar/Hit/HitBar`],
    ],
    targetPatternName: [
        [`all`, [...Array(50).keys()].map(i => `g${i}`).join(`/`)],
    ],
    gaugeParamName: [
        [`arrow[]`, `sumData(g_detailObj.arrowCnt[{0}])`],
        [`frz[]`, `sumData(g_detailObj.frzCnt[{0}])`],
        [`all[]`, `sumData(g_detailObj.arrowCnt[{0}]) + sumData(g_detailObj.frzCnt[{0}])`],
        [`maxlife[]`, `g_headerObj.maxLifeVal`],
    ],
};

/** 設定・オプション画面用共通 */
const g_graphColorObj = {
    max: `#993333cc`,
    default: `#999999cc`,
    max2Push: `#9933cccc`,
    default2Push: `#777777cc`,
    max3Push: `#003399cc`,
    default3Push: `#555555cc`,

    speed: `#cc3333`,
    boost: `#999900`,
};

const g_settingBtnObj = {
    chara: {
        L: `<`,
        LL: `<`,
        LLL: `-`,
        HL: ``,
        R: `>`,
        RR: `>`,
        RRR: `+`,
        HR: ``,
        D: `↓`,
        U: `↑`,
    },
    pos: {
        L: g_limitObj.setLblLeft - g_limitObj.setMiniWidth,
        LL: g_limitObj.setLblLeft,
        LLL: g_limitObj.setLblLeft + g_limitObj.setMiniWidth + 1,
        HL: g_limitObj.setLblLeft,
        R: g_limitObj.setLblLeft + g_limitObj.setLblWidth,
        RR: g_limitObj.setLblLeft + g_limitObj.setLblWidth - g_limitObj.setMiniWidth,
        RRR: g_limitObj.setLblLeft + g_limitObj.setLblWidth - g_limitObj.setMiniWidth * 3 / 2 - 1,
        HR: g_limitObj.setLblLeft + g_limitObj.setLblWidth - g_limitObj.setMiniWidth,
    }
};

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
    arrowJ: [2, 4, 6, 8, 16],
    frzJ: [2, 4, 8]
};
const g_judgPosObj = {
    ii: 0, shakin: 1, matari: 2, shobon: 3, uwan: 4,
    kita: 0, sfsf: 1, iknai: 2,
};

const C_CLR_DUMMY = `#777777`;

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
    excessive: 0,

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
    rankMarks: [`SS`, `S`, `SA`, `AAA`, `AA`, `A`, `B`, `C`, `D`],
    rankRate: [97, 90, 85, 80, 75, 70, 65, 60, 0],
    rankColor: [`#00ccff`, `#6600ff`, `#ff9900`, `#ff0000`, `#00ff00`, `#ff00ff`, `#cc00ff`, `#cc9933`, `#33cc99`],

    rankMarkAllPerfect: `AP`,
    rankColorAllPerfect: ``,
    rankMarkPerfect: `PF`,
    rankColorPerfect: `#cccc00`,
    rankMarkC: `C`,
    rankColorC: `#cc9933`,
    rankMarkF: `F`,
    rankColorF: `#999999`,
    rankMarkX: `X`,
    rankColorX: `#996600`
};

const g_templateObj = {
    resultFormatDf: `【 #danoni[hashTag] 】[musicTitle]([keyLabel]) /[maker] /Rank:[rank]/Score:[score]/Playstyle:[playStyle]/[arrowJdg]/[frzJdg]/[maxCombo] [url]`,
};

const g_pointAllocation = {
    ii: 8,
    shakin: 4,
    matari: 2,
    kita: 8,
    sfsf: 4,
    maxCombo: 2,
    fmaxCombo: 2,
};

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
    hitPosition: 0,
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
    filterLock: C_FLG_OFF,
    opacity: 100,

    rotateEnabled: true,
    flatStepHeight: C_ARW_WIDTH,
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

const makeSpeedList = (_minSpd, _maxSpd) => [...Array((_maxSpd - _minSpd) * 20 + 1).keys()].map(i => _minSpd + i / 20);

// 設定系全般管理
const g_settings = {
    speeds: makeSpeedList(C_MIN_SPEED, C_MAX_SPEED),
    speedNum: 0,
    speedTerms: [20, 5, 1],

    motions: [C_FLG_OFF, `Boost`, `Hi-Boost`, `Brake`, `Compress`, `Fountain`],
    motionNum: 0,

    reverses: [C_FLG_OFF, C_FLG_ON],
    reverseNum: 0,

    scrolls: [],
    scrollNum: 0,

    shuffles: [C_FLG_OFF, `Mirror`, `X-Mirror`, `Turning`, `Random`, `Random+`, `S-Random`, `S-Random+`, `Scatter`, `Scatter+`],
    shuffleNum: 0,
    swapPattern: [4, 5, 6, 7],

    gauges: [],
    gaugeNum: 0,

    excessives: [C_FLG_OFF, C_FLG_ON],
    excessiveNum: 0,

    autoPlays: [C_FLG_OFF, C_FLG_ALL],
    autoPlayNum: 0,

    adjustments: [...Array(g_limitObj.adjustment * 20 + 1).keys()].map(i => (i - g_limitObj.adjustment * 10) / 10),
    adjustmentNum: g_limitObj.adjustment * 10,
    adjustmentTerms: [50, 10, 5],

    hitPositions: [...Array(g_limitObj.hitPosition * 20 + 1).keys()].map(i => (i - g_limitObj.hitPosition * 10) / 10),
    hitPositionNum: g_limitObj.hitPosition * 10,
    hitPositionTerms: [50, 10],

    volumes: [0, 0.5, 1, 2, 5, 10, 25, 50, 75, 100],

    appearances: [`Visible`, `Hidden`, `Hidden+`, `Sudden`, `Sudden+`, `Hid&Sud+`],
    appearanceNum: 0,

    filterLocks: [C_FLG_OFF, C_FLG_ON],
    filterLockNum: 0,

    opacitys: [10, 25, 50, 75, 100],

    scoreDetailDefs: [`Density`, `Speed`, `ToolDif`, `HighScore`],
    scoreDetails: [],
    scoreDetailCursors: [],

    scoreDetailTrans: [[`Velocity`, `Speed`], [`DifLevel`, `ToolDif`]],

    // Display設定の拡張用デザイン
    d_cssBarExName: `RevON`,
    d_cssBgName: `Default`,
    d_cssBgExName: `Setting`,

    // Display設定の拡張リスト
    d_stepZones: [`FlatBar`],

    displayNum: {
        stepZone: 0,
        judgment: 0,
        fastSlow: 0,
        lifeGauge: 0,
        score: 0,
        musicInfo: 0,
        speed: 0,
        color: 0,
        lyrics: 0,
        background: 0,
        arrowEffect: 0,
        special: 0,
    },
};

g_settings.volumeNum = g_settings.volumes.length - 1;
g_settings.opacityNum = g_settings.opacitys.length - 1;

/**
 * 設定画面間移動
 */
const g_jumpSettingWindow = {
    option: () => settingsDisplayInit(),
    difSelector: () => settingsDisplayInit(),
    settingsDisplay: () => optionInit(),
};

/**
 * シャッフル適用関数
 * @param {number} keyNum
 * @param {array} shuffleGroup
 */
const g_shuffleFunc = {
    'OFF': () => true,
    'Mirror': (keyNum, shuffleGroup) => applyMirror(keyNum, shuffleGroup),
    'X-Mirror': (keyNum, shuffleGroup) => applyMirror(keyNum, shuffleGroup, true),
    'Turning': (keyNum, shuffleGroup) => applyTurning(keyNum, shuffleGroup),
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
    'Scatter': (keyNum, shuffleGroup) => {
        applySRandom(keyNum, shuffleGroup, `arrow`, `frz`);
        applySRandom(keyNum, shuffleGroup, `dummyArrow`, `dummyFrz`);
    },
    'Scatter+': keyNum => {
        applySRandom(keyNum, [[...Array(keyNum).keys()]], `arrow`, `frz`);
        applySRandom(keyNum, [[...Array(keyNum).keys()]], `dummyArrow`, `dummyFrz`);
    },
};

/**
 * モーション適用関数
 * @param {array} frms フレーム別の速度設定用配列。配列の15がステップゾーン上、0～14は矢印の枠外管理用
 */
const g_motionFunc = {
    'OFF': _frms => _frms,
    'Boost': _frms => getBoostTrace(_frms, 3),
    'Hi-Boost': _frms => getBoostTrace(_frms, g_stateObj.speed * 2),
    'Brake': _frms => getBrakeTrace(_frms),
    'Compress': _frms => getBoostTrace(_frms, g_stateObj.speed * 5 / 8, -1),
    'Fountain': _frms => getFountainTrace(_frms, g_stateObj.speed * 2),
};

const g_keycons = {
    configTypes: [`Main`, `Replaced`, `ALL`],
    configTypeNum: 0,

    colorTypes: [`Default`, `Type0`, `Type1`, `Type2`, `Type3`, `Type4`],
    colorDefTypes: [`Default`, `Type0`],
    colorTypeNum: 0,
    colorSelf: `TypeS`,

    imgTypes: [],
    imgTypeNum: 0,

    colorGroups: [0],
    colorGroupNum: 0,

    shuffleGroups: [0],
    shuffleGroupNum: 0,

    stepRtnGroups: [0],
    stepRtnGroupNum: 0,

    groupSelf: `S`,

    groups: [`color`, `shuffle`, `stepRtn`],

    cursorNumList: [],
    cursorNum: 0,
    keySwitchNum: 0,
    colorCursorNum: 0,
};

let g_displays = [`stepZone`, `judgment`, `fastSlow`, `lifeGauge`, `score`, `musicInfo`, `filterLine`,
    `speed`, `color`, `lyrics`, `background`, `arrowEffect`, `special`];

// ローカルストレージ保存対象
let g_storeSettings = [`adjustment`, `volume`, `appearance`, `opacity`, `hitPosition`];

// 廃棄対象のリスト(過去の登録対象をリスト化。ここに乗せるとローカルストレージから自動消去される)
let g_storeSettingsEx = [`d_stepzone`, `d_judgment`, `d_fastslow`, `d_lifegauge`,
    `d_score`, `d_musicinfo`, `d_filterline`];

let g_canDisabledSettings = [`motion`, `scroll`, `reverse`, `shuffle`, `autoPlay`, `gauge`, `excessive`, `appearance`];

const g_hidSudFunc = {
    filterPos: _filterPos => `${_filterPos}${g_lblNameObj.percent}`,
    range: () => `${Math.round(g_posObj.arrowHeight - g_posObj.stepY)}px`,
    hidden: _filterPos => `${Math.min(Math.round(g_posObj.arrowHeight * (100 - _filterPos) / 100), g_posObj.arrowHeight - g_posObj.stepY)}`,
    sudden: _filterPos => `${Math.max(Math.round(g_posObj.arrowHeight * (100 - _filterPos) / 100) - g_posObj.stepY, 0)}`,
};

const g_hidSudObj = {
    filterPos: 10,

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
    distH: {
        'Visible': () => ``,
        'Hidden': () => `${g_hidSudFunc.filterPos(50)} (${g_hidSudFunc.hidden(50)} / ${g_hidSudFunc.range()})`,
        'Hidden+': (_filterPos) => `${g_hidSudFunc.filterPos(_filterPos)} (${g_hidSudFunc.hidden(_filterPos)} / ${g_hidSudFunc.range()})`,
        'Sudden': () => `${g_hidSudFunc.filterPos(40)} (${g_hidSudFunc.sudden(40)} / ${g_hidSudFunc.range()})`,
        'Sudden+': (_filterPos) => `${g_hidSudFunc.filterPos(_filterPos)} (${g_hidSudFunc.sudden(_filterPos)} / ${g_hidSudFunc.range()})`,
        'Hid&Sud+': (_filterPos) => `${g_hidSudFunc.filterPos(_filterPos)} (${Math.max(g_hidSudFunc.sudden(_filterPos)
            - (g_posObj.arrowHeight - g_posObj.stepY - g_hidSudFunc.hidden(_filterPos)), 0)} / ${g_hidSudFunc.range()})`,
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
};

const g_diffObj = {
    arrowJdgY: 0,
    frzJdgY: 0,
};

// キーコンフィグカーソル
let g_currentj = 0;
let g_currentk = 0;
let g_prevKey = -1;

// キーコード
const g_kCd = {};
const g_kCdN = [];
for (let j = 0; j < 260; j++) {
    g_kCd[j] = ``;
    g_kCdN[j] = ``;
}

// キーボード配列の言語設定
const g_lang_kCd = {
    Ja: {
        48: `0`,
        49: `1`,
        50: `2`,
        51: `3`,
        52: `4`,
        53: `5`,
        54: `6`,
        55: `7`,
        56: `8`,
        57: `9`,
        186: `： *`,
        187: `; +`,
        188: `, <`,
        189: `- =`,
        190: `. >`,
        191: `/ ?`,
        192: "@ `",
        219: `[ {`,
        220: `\\ |`,
        221: `] }`,
        222: `^ ~`,
        226: `\\ _`,
        229: `IME`,
    },
    En: {
        48: `0 )`,
        49: `1 !`,
        50: `2 @`,
        51: `3 #`,
        52: `4 $`,
        53: `5 %`,
        54: `6 ^`,
        55: `7 &`,
        56: `8 *`,
        57: `9 (`,
        186: `' "`,
        187: `; :`,
        188: `, <`,
        189: `- _`,
        190: `. >`,
        191: `/ ?`,
        192: `[ {`,
        219: `] }`,
        220: `IntlYen`,
        221: `\\ |`,
        222: `= +`,
        226: `IntlRo`,
        229: "` ~",
    },
};

// キー表示用
g_kCd[0] = `- - -`;
g_kCd[1] = `Unknown`;
g_kCd[8] = (g_isMac ? `Delete` : `BackSpace`);
g_kCd[9] = `Tab`;
g_kCd[12] = `Clear`;
g_kCd[13] = `Enter`;
g_kCd[16] = `L)Shift`;
g_kCd[17] = `L)Ctrl`;
g_kCd[18] = `L)Alt`;
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
g_kCd[240] = `CapsLk`;
g_kCd[256] = `R)Shift`;
g_kCd[257] = `R)Ctrl`;
g_kCd[258] = `R)Alt`;
g_kCd[259] = `Window`;
g_kCd[260] = `R-Shift`;

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
g_kCdN[256] = `ShiftRight`;
g_kCdN[257] = `ControlRight`;
g_kCdN[258] = `AltRight`;
g_kCdN[259] = `MetaRight`;
g_kCdN[260] = ``;

const g_kCdNameObj = {
    shiftLKey: `ShiftLeft`,
    shiftRKey: `ShiftRight`,
    metaLKey: `MetaLeft`,
    metaRKey: `MetaRight`,
    unknownKey: `Unknown`,
};

const g_kCdObj = {
    unknown: 1,
    shiftRkey: 256,
    shiftRAltKey: 260,
};

/**
 * 画面別ショートカット
 * - 画面別にオブジェクトを定義し、KeyboardEvent.code別(略記可)にプロパティを定義し処理をidにて割り当てる
 * - 複数キーの同時押しで反応させる場合は間を"_"で挟む。3つ押しの場合も同様
 * - 上から順に適用されるため、複数キーのショートカットは先に定義するようにする
 * @property {string} id 実行対象のボタンのId
 * @property {boolean} reset リンク先にジャンプする場合でonKeyUpが利かないとき、"true"を指定することで回避
 * @property {string} dfId 実行対象のボタンのId(デフォルト)
 * @property {string} exId 実行対象のボタンのId(別パターン)
 */
const g_shortcutObj = {
    title: {
        Enter: { id: `btnStart` },
        NumpadEnter: { id: `btnStart` },
        Slash: { id: `btnHelp`, reset: true },
        F1: { id: `btnHelp`, reset: true },
        ControlLeft_KeyC: { id: `` },
        KeyC: { id: `btnComment` },
    },
    option: {
        ShiftLeft_KeyD: { id: `lnkDifficultyL` },
        ShiftRight_KeyD: { id: `lnkDifficultyL` },
        KeyD: { id: `lnkDifficultyR` },

        ShiftLeft_ArrowRight: { id: `lnkSpeedR` },
        ShiftRight_ArrowRight: { id: `lnkSpeedR` },
        AltLeft_ArrowRight: { id: `lnkSpeedHR` },
        AltRight_ArrowRight: { id: `lnkSpeedHR` },
        ArrowRight: { id: `lnkSpeedRR` },
        ShiftLeft_ArrowLeft: { id: `lnkSpeedL` },
        ShiftRight_ArrowLeft: { id: `lnkSpeedL` },
        AltLeft_ArrowLeft: { id: `lnkSpeedHL` },
        AltRight_ArrowLeft: { id: `lnkSpeedHL` },
        ArrowLeft: { id: `lnkSpeedLL` },

        KeyL: { id: `lnkDifficulty` },

        ShiftLeft_KeyM: { id: `lnkMotionL` },
        ShiftRight_KeyM: { id: `lnkMotionL` },
        KeyM: { id: `lnkMotionR` },
        ArrowUp: { id: `lnkScrollL` },
        ArrowDown: { id: `lnkScrollR` },
        KeyR: { id: `lnkReverseR`, dfId: `lnkReverseR`, exId: `btnReverse` },

        ShiftLeft_KeyS: { id: `lnkShuffleL` },
        ShiftRight_KeyS: { id: `lnkShuffleL` },
        KeyS: { id: `lnkShuffleR` },
        ShiftLeft_KeyA: { id: `lnkAutoPlayL` },
        ShiftRight_KeyA: { id: `lnkAutoPlayL` },
        KeyA: { id: `lnkAutoPlayR` },
        ShiftLeft_KeyG: { id: `lnkGaugeL` },
        ShiftRight_KeyG: { id: `lnkGaugeL` },
        KeyG: { id: `lnkGaugeR` },
        KeyE: { id: `lnkExcessive` },

        AltLeft_ShiftLeft_Semicolon: { id: `lnkAdjustmentHR` },
        AltLeft_ShiftRight_Semicolon: { id: `lnkAdjustmentHR` },
        AltRight_ShiftLeft_Semicolon: { id: `lnkAdjustmentHR` },
        AltRight_ShiftRight_Semicolon: { id: `lnkAdjustmentHR` },
        ShiftLeft_Semicolon: { id: `lnkAdjustmentR` },
        ShiftRight_Semicolon: { id: `lnkAdjustmentR` },
        AltLeft_Semicolon: { id: `lnkAdjustmentRRR` },
        AltRight_Semicolon: { id: `lnkAdjustmentRRR` },
        Semicolon: { id: `lnkAdjustmentRR` },
        AltLeft_ShiftLeft_Minus: { id: `lnkAdjustmentHL` },
        AltLeft_ShiftRight_Minus: { id: `lnkAdjustmentHL` },
        AltRight_ShiftLeft_Minus: { id: `lnkAdjustmentHL` },
        AltRight_ShiftRight_Minus: { id: `lnkAdjustmentHL` },
        ShiftLeft_Minus: { id: `lnkAdjustmentL` },
        ShiftRight_Minus: { id: `lnkAdjustmentL` },
        AltLeft_Minus: { id: `lnkAdjustmentLLL` },
        AltRight_Minus: { id: `lnkAdjustmentLLL` },
        Minus: { id: `lnkAdjustmentLL` },

        AltLeft_ShiftLeft_NumpadAdd: { id: `lnkAdjustmentHR` },
        AltLeft_ShiftRight_NumpadAdd: { id: `lnkAdjustmentHR` },
        AltRight_ShiftLeft_NumpadAdd: { id: `lnkAdjustmentHR` },
        AltRight_ShiftRight_NumpadAdd: { id: `lnkAdjustmentHR` },
        ShiftLeft_NumpadAdd: { id: `lnkAdjustmentR` },
        ShiftRight_NumpadAdd: { id: `lnkAdjustmentR` },
        AltLeft_NumpadAdd: { id: `lnkAdjustmentRRR` },
        AltRight_NumpadAdd: { id: `lnkAdjustmentRRR` },
        NumpadAdd: { id: `lnkAdjustmentRR` },
        AltLeft_ShiftLeft_NumpadSubtract: { id: `lnkAdjustmentHL` },
        AltLeft_ShiftRight_NumpadSubtract: { id: `lnkAdjustmentHL` },
        AltRight_ShiftLeft_NumpadSubtract: { id: `lnkAdjustmentHL` },
        AltRight_ShiftRight_NumpadSubtract: { id: `lnkAdjustmentHL` },
        ShiftLeft_NumpadSubtract: { id: `lnkAdjustmentL` },
        ShiftRight_NumpadSubtract: { id: `lnkAdjustmentL` },
        AltLeft_NumpadSubtract: { id: `lnkAdjustmentLLL` },
        ShiftRight_NumpadSubtract: { id: `lnkAdjustmentL` },
        NumpadSubtract: { id: `lnkAdjustmentLL` },

        ShiftLeft_KeyV: { id: `lnkVolumeL` },
        ShiftRight_KeyV: { id: `lnkVolumeL` },
        KeyV: { id: `lnkVolumeR` },

        KeyI: { id: `btnGraph` },
        Digit1: { id: `lnkDensityG` },
        Digit2: { id: `lnkSpeedG` },
        Digit3: { id: `lnkToolDifG` },
        Digit4: { id: `lnkHighScoreG` },
        Numpad1: { id: `lnkDensityG` },
        Numpad2: { id: `lnkSpeedG` },
        Numpad3: { id: `lnkToolDifG` },
        Numpad4: { id: `lnkHighScoreG` },
        KeyQ: { id: `lnkDensityG` },
        KeyP: { id: `lnkDifInfo` },
        KeyZ: { id: `btnSave` },
        ControlLeft_KeyC: { id: `` },
        ControlRight_KeyC: { id: `` },
        KeyC: { id: `lnkHighScore`, reset: true },

        Escape: { id: `btnBack` },
        Space: { id: `btnKeyConfig` },
        Enter: { id: `btnPlay` },
        NumpadEnter: { id: `btnPlay` },
        ShiftLeft_Tab: { id: `btnBack` },
        ShiftRight_Tab: { id: `btnBack` },
        Tab: { id: `btnDisplay` },
    },
    difSelector: {
        ShiftLeft_KeyD: { id: `lnkDifficultyL` },
        ShiftRight_KeyD: { id: `lnkDifficultyL` },
        KeyD: { id: `lnkDifficultyR` },
        KeyR: { id: `difRandom` },
        KeyL: { id: `lnkDifficulty` },
        ArrowDown: { id: `btnDifD` },
        ArrowUp: { id: `btnDifU` },

        KeyI: { id: `btnGraph` },
        Digit1: { id: `lnkDensityG` },
        Digit2: { id: `lnkSpeedG` },
        Digit3: { id: `lnkToolDifG` },
        Digit4: { id: `lnkHighScoreG` },
        Numpad1: { id: `lnkDensityG` },
        Numpad2: { id: `lnkSpeedG` },
        Numpad3: { id: `lnkToolDifG` },
        Numpad4: { id: `lnkHighScoreG` },
        KeyQ: { id: `lnkDensityG` },
        KeyP: { id: `lnkDifInfo` },
        ControlLeft_KeyC: { id: `` },
        ControlRight_KeyC: { id: `` },
        KeyC: { id: `lnkHighScore`, reset: true },

        Escape: { id: `btnBack` },
        Space: { id: `btnKeyConfig` },
        Enter: { id: `lnkDifficulty` },
        NumpadEnter: { id: `lnkDifficulty` },
        ShiftLeft_Tab: { id: `btnBack` },
        ShiftRight_Tab: { id: `btnBack` },
        Tab: { id: `btnDisplay` },
    },
    settingsDisplay: {
        ShiftLeft_KeyA: { id: `lnkAppearanceL` },
        ShiftRight_KeyA: { id: `lnkAppearanceL` },
        KeyA: { id: `lnkAppearanceR` },
        KeyL: { id: `lnkLockBtn` },
        ShiftLeft_KeyO: { id: `lnkOpacityL` },
        ShiftRight_KeyO: { id: `lnkOpacityL` },
        KeyO: { id: `lnkOpacityR` },

        ShiftLeft_KeyB: { id: `lnkHitPositionR` },
        ShiftRight_KeyB: { id: `lnkHitPositionR` },
        KeyB: { id: `lnkHitPositionRR` },
        ShiftLeft_KeyT: { id: `lnkHitPositionL` },
        ShiftRight_KeyT: { id: `lnkHitPositionL` },
        KeyT: { id: `lnkHitPositionLL` },

        ShiftLeft_Digit1: { id: `lnkstepZoneR` },
        ShiftRight_Digit1: { id: `lnkstepZoneR` },
        ShiftLeft_Digit2: { id: `lnkjudgmentR` },
        ShiftRight_Digit2: { id: `lnkjudgmentR` },
        ShiftLeft_Digit3: { id: `lnkfastSlowR` },
        ShiftRight_Digit3: { id: `lnkfastSlowR` },
        ShiftLeft_Digit4: { id: `lnklifeGaugeR` },
        ShiftRight_Digit4: { id: `lnklifeGaugeR` },
        ShiftLeft_Digit5: { id: `lnkscoreR` },
        ShiftRight_Digit5: { id: `lnkscoreR` },
        ShiftLeft_Digit6: { id: `lnkmusicInfoR` },
        ShiftRight_Digit6: { id: `lnkmusicInfoR` },
        ShiftLeft_Digit7: { id: `lnkfilterLineR` },
        ShiftRight_Digit7: { id: `lnkfilterLineR` },
        ShiftLeft_Digit8: { id: `lnkspeedR` },
        ShiftRight_Digit8: { id: `lnkspeedR` },
        ShiftLeft_Digit9: { id: `lnkcolorR` },
        ShiftRight_Digit9: { id: `lnkcolorR` },
        ShiftLeft_Digit0: { id: `lnklyricsR` },
        ShiftRight_Digit0: { id: `lnklyricsR` },
        ShiftLeft_Semicolon: { id: `lnkbackgroundR` },
        ShiftRight_Semicolon: { id: `lnkbackgroundR` },
        ShiftLeft_Minus: { id: `lnkarrowEffectR` },
        ShiftRight_Minus: { id: `lnkarrowEffectR` },
        ShiftLeft_Slash: { id: `lnkspecialR` },
        ShiftRight_Slash: { id: `lnkspecialR` },

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

        ShiftLeft_Numpad1: { id: `lnkstepZoneR` },
        ShiftRight_Numpad1: { id: `lnkstepZoneR` },
        ShiftLeft_Numpad2: { id: `lnkjudgmentR` },
        ShiftRight_Numpad2: { id: `lnkjudgmentR` },
        ShiftLeft_Numpad3: { id: `lnkfastSlowR` },
        ShiftRight_Numpad3: { id: `lnkfastSlowR` },
        ShiftLeft_Numpad4: { id: `lnklifeGaugeR` },
        ShiftRight_Numpad4: { id: `lnklifeGaugeR` },
        ShiftLeft_Numpad5: { id: `lnkscoreR` },
        ShiftRight_Numpad5: { id: `lnkscoreR` },
        ShiftLeft_Numpad6: { id: `lnkmusicInfoR` },
        ShiftRight_Numpad6: { id: `lnkmusicInfoR` },
        ShiftLeft_Numpad7: { id: `lnkfilterLineR` },
        ShiftRight_Numpad7: { id: `lnkfilterLineR` },
        ShiftLeft_Numpad8: { id: `lnkspeedR` },
        ShiftRight_Numpad8: { id: `lnkspeedR` },
        ShiftLeft_Numpad9: { id: `lnkcolorR` },
        ShiftRight_Numpad9: { id: `lnkcolorR` },
        ShiftLeft_Numpad0: { id: `lnklyricsR` },
        ShiftRight_Numpad0: { id: `lnklyricsR` },
        ShiftLeft_NumpadAdd: { id: `lnkbackgroundR` },
        ShiftRight_NumpadAdd: { id: `lnkbackgroundR` },
        ShiftLeft_NumpadSubtract: { id: `lnkarrowEffectR` },
        ShiftRight_NumpadSubtract: { id: `lnkarrowEffectR` },
        ShiftLeft_NumpadDivide: { id: `lnkspecialR` },
        ShiftRight_NumpadDivide: { id: `lnkspecialR` },

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
        NumpadEnter: { id: `btnPlay` },
        ShiftLeft_Tab: { id: `btnBack` },
        ShiftRight_Tab: { id: `btnBack` },
        Tab: { id: `btnSettings` },
    },
    keyConfig: {
        Escape: { id: `btnBack` },
        Backspace_Enter: { id: `btnPlay` },
        Backspace_NumpadEnter: { id: `btnPlay` },
    },
    loadingIos: {
        Enter: { id: `btnPlay` },
        NumpadEnter: { id: `btnPlay` },
    },
    result: {
        Escape: { id: `btnBack` },
        ShiftLeft_Tab: { id: `btnBack` },
        ShiftRight_Tab: { id: `btnBack` },
        ControlLeft_KeyC: { id: `` },
        ControlRight_KeyC: { id: `` },
        KeyC: { id: `btnCopy`, reset: true },
        KeyX: { id: `btnTweet`, reset: true }, // x
        KeyD: { id: `btnGitter`, reset: true }, // Discord
        KeyP: { id: `btnCopyImage` },
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
    keyConfig: { Back: -3, Play: 0 },
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
    settings_Adjustment: `settings_Adjustment`,

    keyconfig_warning: `keyconfig_warning`,
    keyconfig_ConfigType: `keyconfig_ConfigType`,
    keyconfig_ColorType: `keyconfig_ColorType`,
    keyconfig_ColorGr: `keyconfig_ColorGr`,
    keyconfig_ShuffleGr: `keyconfig_ShuffleGr`,
    keyconfig_StepRtnGr: `keyconfig_StepRtnGr`,
    keyconfig_Changekey: `keyconfig_Changekey`,
    keyconfig_Defaultkey: `keyconfig_Defaultkey`,

    main_stepKeyDown: `main_stepKeyDown`,
    main_stepDefault: `main_stepDefault`,
    main_stepDummy: `main_stepDummy`,
    main_stepIi: `main_stepIi`,
    main_stepShakin: `main_stepShakin`,
    main_stepMatari: `main_stepMatari`,
    main_stepShobon: `main_stepShobon`,
    main_stepExcessive: `main_stepExcessive`,

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

    common_comboJ: `common_comboJ`,
    common_comboFJ: `common_comboFJ`,
    common_diffSlow: `common_diffSlow`,
    common_diffFast: `common_diffFast`,
    common_excessive: `common_excessive`,
    common_estAdj: `common_estAdj`,

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
    button_Discord: `button_Discord`,

    button_OFF: `button_OFF`,
    button_ON: `button_ON`,
    button_RevOFF: `button_RevOFF`,
    button_RevON: `button_RevON`,

    button_DisabledOFF: `button_DisabledOFF`,
    button_DisabledON: `button_DisabledON`,

    flex_centering: `flex_centering`,
};

// キーパターンの定義
// - カスタムキーの定義は keysConvert により、このオブジェクト内で同様に定義される
const g_keyObj = {

    // 現在の選択キー、選択パターン
    // - キーとパターンの組み合わせで、ステップゾーンや対応キー等が決まる
    // - 原則、キー×パターンの数だけ設定が必要
    currentKey: 7,
    currentPtn: 0,
    storagePtn: 0,
    defaultProp: `keyCtrl`,

    prevKey: `Dummy`,
    dfPtnNum: 0,

    minKeyCtrlNum: 2,

    // キー別ヘッダー
    // - 譜面データ中に出てくる矢印(ノーツ)の種類と順番(ステップゾーン表示順)を管理する
    // - ここで出てくる順番は、この後のstepRtn, keyCtrlとも対応している
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
    chara16i_0: [`gor`, `space`, `iyo`, `left`, `down`, `up`, `right`,
        `sleft`, `sdown`, `sup`, `sright`, `aspace`, `aleft`, `adown`, `aup`, `aright`],
    chara17_0: [`aleft`, `bleft`, `adown`, `bdown`, `aup`, `bup`, `aright`, `bright`, `space`,
        `cleft`, `dleft`, `cdown`, `ddown`, `cup`, `dup`, `cright`, `dright`],
    chara23_0: [`aleft`, `adown`, `aup`, `aright`, `bleft`, `bdown`, `bup`, `bright`,
        `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`, `oni`,
        `sleft`, `sleftdia`, `sdown`, `sspace`, `sup`, `srightdia`, `sright`],

    chara5_1: [`space`, `left`, `down`, `up`, `right`],
    chara8_1: [`sleft`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],
    chara9i_1: [`left`, `down`, `up`, `right`, `space`, `sleft`, `sdown`, `sup`, `sright`],
    chara17_1: [`aleft`, `adown`, `aup`, `aright`, `space`, `dleft`, `ddown`, `dup`, `dright`,
        `bleft`, `bdown`, `bup`, `bright`, `cleft`, `cdown`, `cup`, `cright`],

    chara5_2: [`left`, `down`, `space`, `up`, `right`],
    chara8_2: [`sleft`, `left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],

    // 頻度の高い譜面データ名パターン
    // 後で chara4A, chara4A_a, chara4A_b, ... に変換する
    ptchara4A: [`left`, `down`, `up`, `right`],
    ptchara3S: [`left`, `leftdia`, `down`],
    ptchara3J: [`up`, `rightdia`, `right`],
    ptchara7: [`left`, `leftdia`, `down`, `space`, `up`, `rightdia`, `right`],

    // ColorGroup - 1
    //  - 同じ数字が同じグループになる
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
    color16i_0_0: [2, 2, 2, 3, 3, 3, 3, 1, 0, 1, 0, 2, 0, 1, 0, 1],
    color17_0_0: [1, 0, 1, 0, 1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0, 1],
    color23_0_0: [3, 3, 3, 3, 4, 4, 4, 4, 0, 1, 0, 1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0],

    color5_1_0: [2, 0, 0, 0, 0],
    color8_1_0: [2, 0, 1, 0, 2, 0, 1, 0],
    color9B_1_0: [0, 0, 0, 0, 2, 1, 1, 1, 1],
    color9i_1_0: [2, 2, 2, 2, 2, 0, 0, 0, 0],
    color17_1_0: [0, 0, 0, 0, 2, 4, 4, 4, 4, 1, 1, 1, 1, 3, 3, 3, 3],

    color5_2_0: [0, 0, 2, 0, 0],
    color7_2_0: [2, 2, 2, 0, 0, 0, 0],
    color8_2_0: [2, 0, 1, 0, 1, 0, 1, 0],
    color9A_2_0: [3, 0, 3, 0, 2, 0, 3, 0, 3],
    color9B_2_0: [0, 0, 0, 0, 2, 1, 1, 1, 1],

    // ColorGroup - 2
    color9A_0_1: [0, 0, 3, 0, 2, 0, 0, 3, 0],
    color9B_0_1: [4, 3, 1, 0, 2, 0, 1, 3, 4],
    color13_0_1: [4, 4, 3, 4, 0, 0, 3, 0, 2, 0, 0, 3, 0],
    color17_0_1: [0, 1, 0, 1, 0, 1, 0, 1, 2, 3, 4, 3, 4, 3, 4, 3, 4],

    color9B_1_1: [0, 0, 1, 0, 2, 0, 0, 1, 0],
    color17_1_1: [1, 1, 1, 1, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],

    color9A_2_1: [4, 1, 3, 0, 2, 0, 3, 1, 4],
    color9B_2_1: [0, 0, 1, 0, 2, 0, 0, 1, 0],

    // ColorGroup - 3
    color17_0_2: [1, 4, 0, 3, 1, 4, 0, 3, 2, 3, 0, 4, 1, 3, 0, 4, 1],
    color17_1_2: [1, 0, 1, 0, 2, 0, 1, 0, 1, 3, 4, 3, 4, 4, 3, 4, 3],

    // ColorGroup - 4
    color17_0_3: [1, 1, 0, 0, 1, 1, 0, 0, 2, 0, 0, 1, 1, 0, 0, 1, 1],
    color17_1_3: [1, 0, 1, 0, 2, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1],

    // ShuffleGroup - 1
    //  - Mirror, Random, S-Random使用時、同じグループ同士で入れ替える
    //  - 同じ数字が同じグループになる
    shuffle5_0_0: [0, 0, 0, 0, 1],
    shuffle7_0_0: [0, 0, 0, 1, 0, 0, 0],
    shuffle7i_0_0: [0, 0, 0, 1, 1, 1, 1],
    shuffle8_0_0: [0, 0, 0, 1, 0, 0, 0, 2],
    shuffle9A_0_0: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    shuffle9B_0_0: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    shuffle9i_0_0: [0, 0, 0, 0, 1, 1, 1, 1, 1],
    shuffle11_0_0: [0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1],
    shuffle11L_0_0: [0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1],
    shuffle11W_0_0: [0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1],
    shuffle11i_0_0: [0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0],
    shuffle12_0_0: [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
    shuffle13_0_0: [0, 0, 0, 0, 1, 1, 1, 1, 2, 3, 3, 3, 3],
    shuffle14_0_0: [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
    shuffle14i_0_0: [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 2, 2, 2],
    shuffle15A_0_0: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 2, 2, 2],
    shuffle16i_0_0: [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2, 2, 2],
    shuffle17_0_0: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    shuffle23_0_0: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 4, 4, 4, 4, 4, 4, 4],

    shuffle5_1_0: [1, 0, 0, 0, 0],
    shuffle8_1_0: [2, 0, 0, 0, 1, 0, 0, 0],
    shuffle9i_1_0: [0, 0, 0, 0, 0, 1, 1, 1, 1],
    shuffle17_1_0: [0, 0, 0, 0, 1, 2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2],

    shuffle5_2_0: [0, 0, 1, 0, 0],
    shuffle8_2_0: [1, 0, 0, 0, 0, 0, 0, 0],

    // ShuffleGroup - 2
    shuffle9A_0_1: [0, 0, 0, 0, 1, 2, 2, 2, 2],
    shuffle11_0_1: [0, 0, 0, 0, 1, 1, 1, 2, 3, 3, 3],
    shuffle11L_0_1: [0, 0, 0, 0, 1, 1, 1, 2, 3, 3, 3],
    shuffle11i_0_1: [0, 0, 1, 0, 0, 2, 3, 3, 4, 3, 3],
    shuffle15A_0_1: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 4, 4, 4],
    shuffle17_0_1: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    shuffle23_0_1: [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2],

    shuffle17_1_1: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

    // ShuffleGroup - 3
    shuffle15A_0_2: [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 3, 2, 2, 2],
    shuffle17_0_2: [0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 2, 0, 2, 0, 2, 0],
    shuffle17_1_2: [0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2],

    // ShapeGroup - 1 (矢印回転、AAキャラクタ)
    // - AAキャラクタの場合、キャラクタ名を指定
    stepRtn5_0_0: [0, -90, 90, 180, `onigiri`],
    stepRtn7_0_0: [0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn7i_0_0: [`giko`, `onigiri`, `iyo`, 0, -90, 90, 180],
    stepRtn8_0_0: [0, -45, -90, `onigiri`, 90, 135, 180, `onigiri`],
    stepRtn9A_0_0: [0, -90, 90, 180, `onigiri`, 0, -90, 90, 180],
    stepRtn9B_0_0: [45, 0, -45, -90, `onigiri`, 90, 135, 180, 225],
    stepRtn9i_0_0: [0, -90, 90, 180, `monar`, `giko`, `c`, `morara`, `onigiri`],
    stepRtn11_0_0: [0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn11L_0_0: [0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn11W_0_0: [`giko`, 135, 45, `iyo`, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn11i_0_0: [0, -90, `giko`, 90, 180, `onigiri`, 0, -90, `iyo`, 90, 180],
    stepRtn12_0_0: [0, -90, 90, 180, `onigiri`, 0, 30, 60, 90, 120, 150, 180],
    stepRtn13_0_0: [0, -90, 90, 180, 0, -90, 90, 180, `onigiri`, 0, -90, 90, 180],
    stepRtn14_0_0: [45, 0, -90, 90, 180, 135, `onigiri`, 0, 30, 60, 90, 120, 150, 180],
    stepRtn14i_0_0: [`giko`, `onigiri`, `iyo`, 0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn15A_0_0: [0, -90, 90, 180, 0, -90, 90, 180, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn16i_0_0: [`giko`, `onigiri`, `iyo`, 0, -90, 90, 180, 45, 0, -45, -90, `onigiri`, 90, 135, 180, 225],
    stepRtn17_0_0: [0, -22.5, -45, -67.5, -90, -112.5, -135, -157.5, `onigiri`, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180],
    stepRtn23_0_0: [0, -90, 90, 180, 0, -90, 90, 180, 0, 30, 60, 90, 120, 150, 180, `onigiri`, 0, 30, 60, 90, 120, 150, 180],

    stepRtn5_1_0: [`onigiri`, 0, -90, 90, 180],
    stepRtn8_1_0: [`onigiri`, 0, -45, -90, `onigiri`, 90, 135, 180],
    stepRtn9i_1_0: [`monar`, `giko`, `c`, `morara`, `onigiri`, 0, -90, 90, 180],
    stepRtn17_1_0: [0, -45, -90, -135, `onigiri`, 45, 90, 135, 180,
        -22.5, -67.5, -112.5, -157.5, 22.5, 67.5, 112.5, 157.5],
    stepRtn17_1_1: [45, 0, -45, -90, `onigiri`, 90, 135, 180, 225,
        45, 0, -45, -90, 90, 135, 180, 225],

    stepRtn5_2_0: [0, -90, `onigiri`, 90, 180],
    stepRtn8_2_0: [`onigiri`, 0, 30, 60, 90, 120, 150, 180],

    // ShapeGroup - 2 (矢印回転、AAキャラクタ)
    stepRtn11i_0_1: [0, -135, `giko`, 45, 180, `onigiri`, 0, -135, `iyo`, 45, 180],
    stepRtn17_0_1: [-30, 0, 30, 60, 90, 120, 150, 180, `onigiri`, 0, 30, 60, 90, 120, 150, 180, 210],

    // ShapeGroup - 3 (矢印回転、AAキャラクタ)
    stepRtn17_0_2: [45, 45, 0, 0, -45, -45, -90, -90, `onigiri`, 90, 90, 135, 135, 180, 180, 225, 225],

    // 頻度の高い部分ShapeGroupの定義
    stepRtn4A: [0, -90, 90, 180],
    stepRtn3S: [0, -45, -90],
    stepRtn3J: [90, 135, 180],
    stepRtn3Z: [`giko`, `onigiri`, `iyo`],

    // 各キーの区切り位置
    // - 未指定の場合は下段への折り返し無し
    div9i_0: 6,
    div11_0: 6,
    div11L_0: 6,
    div11W_0: 6,
    div12_0: 5,
    div13_0: 8,
    div14_0: 7,
    div14i_0: 8,
    div15A_0: 8,
    div16i_0: 8,
    div23_0: 12,

    div17_1: 9,

    // 各キーの位置関係
    // - 未指定の場合は0からの連番が入る
    pos9i_0: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    pos11_0: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    pos11L_0: [0, 1, 2, 3, 6, 7, 8, 9, 10, 11, 12],
    pos11W_0: [0, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12],
    pos12_0: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    pos13_0: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    pos14_0: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    pos14i_0: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14],
    pos16i_0: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    pos23_0: [0, 1, 2, 3, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],

    // 基本パターン (キーコンフィグ)
    // - 順番はchara, stepRtnと対応している。
    // - 多次元配列内はステップに対応するキーコードもしくはコード名を示す。カンマ区切りで複数指定できる。
    keyCtrl5_0: [[`Left`], [`Down`], [`Up`], [`Right`], [`Space`]],
    keyCtrl7_0: [[`S`], [`D`], [`F`], [`Space`], [`J`], [`K`], [`L`]],
    keyCtrl7i_0: [[`Z`], [`X`], [`C`], [`Left`], [`Down`], [`Up`], [`Right`]],
    keyCtrl8_0: [[`S`], [`D`], [`F`], [`Space`], [`J`], [`K`], [`L`], [`Enter`]],
    keyCtrl9A_0: [[`S`], [`D`], [`E`, `R`], [`F`], [`Space`], [`J`], [`K`], [`I`], [`L`]],
    keyCtrl9B_0: [[`A`], [`S`], [`D`], [`F`], [`Space`], [`J`], [`K`], [`L`], [`;`]],
    keyCtrl9i_0: [[`Left`], [`Down`], [`Up`], [`Right`], [`A`], [`S`], [`D`], [`F`], [`Space`]],
    keyCtrl11_0: [[`Left`], [`Down`], [`Up`], [`Right`], [`S`], [`D`], [`F`], [`Space`], [`J`], [`K`], [`L`]],
    keyCtrl11L_0: [[`W`], [`E`], [`D3`, `D4`], [`R`], [`S`], [`D`], [`F`], [`Space`], [`J`], [`K`], [`L`]],
    keyCtrl11W_0: [[`D1`, `D2`], [`T`], [`Y`], [`D0`, `Minus`], [`S`], [`D`], [`F`], [`Space`], [`J`], [`K`], [`L`]],
    keyCtrl11i_0: [[`S`], [`X`, `C`], [`D`], [`E`, `R`], [`F`], [`Space`], [`J`], [`M`, `Comma`], [`K`], [`I`, `O`], [`L`]],
    keyCtrl12_0: [[`U`], [`I`], [`D8`, `D9`], [`O`], [`Space`], [`N`], [`J`], [`M`], [`K`], [`Comma`], [`L`], [`Period`]],
    keyCtrl13_0: [[`Left`], [`Down`], [`Up`], [`Right`], [`S`], [`D`], [`E`, `R`], [`F`], [`Space`], [`J`], [`K`], [`I`], [`L`]],
    keyCtrl14_0: [[`T`, `Y`], [`U`], [`I`], [`D8`, `D7`, `D9`, `D0`], [`O`], [`BracketLeft`, `P`], [`Space`], [`N`], [`J`], [`M`], [`K`], [`Comma`], [`L`], [`Period`]],
    keyCtrl14i_0: [[`Z`, `W`], [`X`, `E`], [`C`, `R`], [`Left`], [`Down`], [`Up`], [`Right`], [`S`], [`D`], [`F`], [`Space`], [`J`], [`K`], [`L`]],
    keyCtrl15A_0: [[`W`], [`E`], [`D3`, `D4`], [`R`], [`Left`], [`Down`], [`Up`], [`Right`], [`S`], [`D`], [`F`], [`Space`], [`J`], [`K`], [`L`]],
    keyCtrl15B_0: [[`W`], [`E`], [`D3`, `D4`], [`R`], [`U`], [`I`], [`D8`, `D9`], [`O`], [`S`], [`D`], [`F`], [`Space`], [`J`], [`K`], [`L`]],
    keyCtrl16i_0: [[`Z`, `W`], [`X`, `E`], [`C`, `R`], [`Left`], [`Down`], [`Up`], [`Right`], [`A`], [`S`], [`D`], [`F`], [`Space`], [`J`], [`K`], [`L`], [`;`]],
    keyCtrl17_0: [[`A`], [`Z`], [`S`], [`X`], [`D`], [`C`], [`F`], [`V`], [`Space`], [`N`], [`J`], [`M`], [`K`], [`Comma`], [`L`], [`Period`], [`;`]],
    keyCtrl23_0: [[`W`], [`E`], [`D3`, `D4`], [`R`], [`U`], [`I`], [`D8`, `D9`], [`O`],
    [`Z`], [`S`], [`X`], [`D`], [`C`], [`F`], [`V`], [`Space`], [`N`], [`J`], [`M`], [`K`], [`Comma`], [`L`], [`Period`]],

    // 変則パターン (キーコンフィグ)
    // - _0 の数字部分をカウントアップすることで実現できる。
    keyCtrl5_1: [[`Space`], [`Left`], [`Down`], [`Up`], [`Right`]],
    keyCtrl7_1: [[`S`], [`E`], [`F`], [`Space`, `G`, `H`], [`J`], [`I`], [`L`]],
    keyCtrl8_1: [[`Enter`], [`S`], [`D`], [`F`], [`Space`], [`J`], [`K`], [`L`]],
    keyCtrl9A_1: [[`S`], [`D`], [`E`, `R`], [`F`], [`Space`], [`Left`], [`Down`], [`Up`], [`Right`]],
    keyCtrl9i_1: [[`A`], [`S`], [`D`], [`F`], [`Space`], [`Left`], [`Down`], [`Up`], [`Right`]],
    keyCtrl12_1: [[`Y`], [`U`, `I`], [`D8`, `D7`, `D9`], [`O`], [`Space`], [`B`], [`H`], [`N`, `M`], [`J`, `K`], [`Comma`], [`L`], [`Period`]],
    keyCtrl14_1: [[`R`, `T`], [`Y`], [`U`, `I`], [`D8`, `D6`, `D7`, `D9`, `D0`], [`O`], [`BracketLeft`, `P`], [`Space`], [`B`], [`H`], [`N`, `M`], [`J`, `K`], [`Comma`], [`L`], [`Period`]],
    keyCtrl17_1: [[`A`], [`S`], [`D`], [`F`], [`Space`], [`J`], [`K`], [`L`], [`;`], [`Z`], [`X`], [`C`], [`V`], [`N`], [`M`], [`Comma`], [`Period`]],

    keyCtrl5_2: [[`D`], [`F`], [`Space`], [`J`], [`K`]],
    keyCtrl8_2: [[`Space`], [`N`], [`J`], [`M`], [`K`], [`Comma`], [`L`], [`Period`]],
    keyCtrl12_2: [[`W`], [`E`], [`D3`, `D4`], [`R`], [`Shift`], [`Z`], [`S`], [`X`], [`D`], [`C`], [`F`], [`V`]],
    keyCtrl14_2: [[`Tab`, `Q`], [`W`], [`E`], [`D3`, `D2`, `D4`, `D5`], [`R`], [`Y`, `T`], [`Shift`], [`Z`], [`S`], [`X`], [`D`], [`C`], [`F`], [`V`]],

    keyCtrl8_3: [[`Space`], [`B`], [`H`], [`N`, `M`], [`J`, `K`], [`Comma`], [`L`], [`Period`]],
    keyCtrl12_3: [[`W`], [`E`, `R`], [`D3`, `D4`, `D5`], [`T`], [`Shift`], [`Z`], [`S`], [`X`, `C`], [`D`, `F`], [`V`], [`G`], [`B`]],
    keyCtrl14_3: [[`Tab`, `Q`], [`W`], [`E`, `R`], [`D3`, `D2`, `D4`, `D5`, `D6`], [`T`], [`U`, `Y`], [`Shift`], [`Z`], [`S`], [`X`, `C`], [`D`, `F`], [`V`], [`G`], [`B`]],

    keyCtrl8_4: [[`Shift`], [`Z`], [`S`], [`X`], [`D`], [`C`], [`F`], [`V`]],

    keyCtrl8_5: [[`Shift`], [`Z`], [`S`], [`X`, `C`], [`D`, `F`], [`V`], [`G`], [`B`]],

    // 頻度の高い部分キーコンフィグの定義
    keyCtrl4A: [[`Left`], [`Down`], [`Up`], [`Right`]],
    keyCtrl4S: [[`S`], [`D`], [`E`, `R`], [`F`]],
    keyCtrl4J: [[`J`], [`K`], [`I`, `O`], [`L`]],
    keyCtrl4W: [[`W`], [`E`], [`D3`, `D4`], [`R`]],
    keyCtrl4U: [[`U`], [`I`], [`D8`, `D9`], [`O`]],
    keyCtrl3S: [[`S`], [`D`], [`F`]],
    keyCtrl3J: [[`J`], [`K`], [`L`]],
    keyCtrl3W: [[`W`], [`E`], [`R`]],
    keyCtrl3Z: [[`Z`], [`X`], [`C`]],

    // 隣接するステップゾーン間の距離
    blank: 55,
    blank_def: 55,
    blank11i_0: 50,
    blank17_0: 45,
    blank5_0: 57.5,
    blank5_1: 57.5,
    blank5_2: 57.5,
    blank9A_0: 52.5,
    blank9B_0: 52.5,
    blank23_0: 50,

    // 矢印群の倍率指定
    scale: 1,
    scale_def: 1,
    scale17_0: 0.95,

    // ショートカットキーコード
    keyRetry: 8,
    keyRetry8_0: 9,
    keyRetry8_1: 9,

    keyTitleBack: 46,

    // 別キー
    transKey8_2: '12',
    transKey15A_1: '',
    transKey15B_0: '',
    transKey15B_1: '',

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

    scrollDir9A_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, -1, -1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, 1, -1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1, -1, 1],
        'Twist': [1, 1, -1, -1, -1, 1, 1, -1, -1],
        'Asymmetry': [1, -1, -1, 1, -1, -1, 1, 1, -1],
    },
    scrollDir9B_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, -1, -1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, 1, -1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1, -1, 1],
        'Twist': [1, 1, -1, -1, -1, 1, 1, -1, -1],
        'Asymmetry': [1, -1, -1, 1, -1, -1, 1, 1, -1],
    },

    scrollDir9i_1: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, -1, -1, -1, -1, -1, 1, 1],
        'Split': [1, 1, 1, 1, -1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1, -1, 1],
        'Twist': [1, 1, -1, -1, 1, 1, 1, -1, -1],
        'Asymmetry': [1, -1, -1, 1, -1, -1, 1, 1, -1],
    },

    scrollDir11_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir11L_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1],
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
        'Twist': [1, 1, 1, -1, -1, -1, 1, 1, 1, -1, -1],
        'Asymmetry': [1, -1, 1, -1, 1, -1, -1, 1, -1, 1, -1],
    },

    scrollDir12_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1],
        'Twist': [1, 1, 1, 1, -1, -1, 1, 1, 1, 1, 1, -1],
    },
    scrollDir13_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        'Cross': [-1, -1, -1, -1, 1, 1, 1, 1, -1, -1, -1, -1, -1],
    },
    scrollDir14_0: {
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
    scrollDir16i_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    },
    scrollDir17_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Cross': [1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 1, 1, 1],
        'Split': [1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        'Alternate': [1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1],
    },
    scrollDir23_0: {
        '---': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Flat': [1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        'Cross': [-1, -1, -1, -1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, 1, 1, 1, 1, 1, 1, 1, 1],
        'Twist': [1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 1, 1, 1, 1, -1, -1, -1, 1, 1, 1, 1, 1, -1],
        'Asymmetry': [-1, -1, -1, -1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, 1, -1, -1, 1, 1, 1, 1, 1, -1],
    },

    // プレイアシスト設定
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

    // 横幅最小値
    minWidth: 500,
    minWidthDefault: 600,

    minWidth5: 500,
    minWidth7i: 550,
    minWidth9A: 650,
    minWidth11i: 650,
    minWidth13: 650,
    minWidth16i: 650,
    minWidth17: 825,
    minWidth23: 900,

};

// g_keyObj.defaultProp の上書きを禁止
Object.defineProperty(g_keyObj, `defaultProp`, { writable: false });

// キーパターンのコピーリスト
// ・コピー先：コピー元の順に指定する
// ・上から順に処理する
const g_copyKeyPtn = {
    '8_3': `8_2`,
    '8_4': `8_2`,
    '8_5': `8_2`,
    '7_1': `7_0`,
    '7_2': `7i_0`,
    '7_3': `8_2`,
    '7_4': `8_3`,
    '7_5': `8_4`,
    '7_6': `8_5`,

    '7i_1': `7_0`,
    '7i_2': `7_1`,
    '7i_3': `8_2`,
    '7i_4': `8_3`,
    '7i_5': `8_4`,
    '7i_6': `8_5`,

    '9A_1': `9A_0`,
    '9A_2': `9B_0`,
    '9A_3': `11i_0`,
    '9B_1': `9A_0`,
    '9B_2': `9A_1`,

    '12_1': `12_0`,
    '12_2': `12_0`,
    '12_3': `12_0`,
    '11_1': `11L_0`,
    '11_2': `12_0`,
    '11_3': `12_1`,
    '11_4': `12_2`,
    '11_5': `12_3`,
    '11L_1': `11_0`,
    '11L_2': `12_0`,
    '11L_3': `12_1`,
    '11L_4': `12_2`,
    '11L_5': `12_3`,
    '11W_1': `12_0`,
    '11W_2': `12_1`,
    '11W_3': `12_2`,
    '11W_4': `12_3`,

    '14_1': `14_0`,
    '14_2': `14_0`,
    '14_3': `14_0`,

    '15B_0': `15A_0`,
    '15A_1': `15B_0`,
    '15B_1': `15A_0`,
};

// charaX_Y, posX_Y, keyGroupX_Y, divX_Y, divMaxX_Yが未定義のときに0からの連番で補完する処理 (charaX_Yが定義されていることが前提)
// この後g_copyKeyPtnにてデータコピーするため、ここのみcharaX_Yがあるものだけについて処理
Object.keys(g_keyObj).filter(val => val.startsWith(`chara`) &&
    !Object.keys(g_copyKeyPtn).includes(val.slice(`chara`.length))).forEach(charaPtn => {
        setKeyDfVal(charaPtn.slice(`chara`.length));
    });

// キー名をキーコードに変換
Object.keys(g_keyObj).filter(val => val.startsWith(`keyCtrl`)).forEach(property =>
    g_keyObj[property].forEach((list, j) => g_keyObj[property][j] = list.map(valN => getKeyCtrlVal(valN))));

// キーパターンのコピー処理
// ただし、すでに定義済みの場合は定義済みのものを優先する
Object.keys(g_copyKeyPtn).forEach(keyPtnTo => {
    let colorGr = 0, shuffleGr = 0, stepRtnGr = 0;
    const keyPtnFrom = g_copyKeyPtn[keyPtnTo];
    const copyKeyPtn = (_name, _from = keyPtnFrom, _to = keyPtnTo) => {
        if (g_keyObj[`${_name}${_to}`] === undefined) {
            g_keyObj[`${_name}${_to}`] = structuredClone(g_keyObj[`${_name}${_from}`]);
        }
    };
    const copyKeyPtnVal = _name => {
        if (g_keyObj[`${_name}${keyPtnFrom}`] !== undefined && g_keyObj[`${_name}${keyPtnTo}`] === undefined) {
            g_keyObj[`${_name}${keyPtnTo}`] = g_keyObj[`${_name}${keyPtnFrom}`];
        }
    };

    while (g_keyObj[`color${keyPtnFrom}_${colorGr}`] !== undefined) {
        copyKeyPtn(`color`, `${keyPtnFrom}_${colorGr}`, `${keyPtnTo}_${colorGr}`);
        colorGr++;
    }
    while (g_keyObj[`shuffle${keyPtnFrom}_${shuffleGr}`] !== undefined) {
        copyKeyPtn(`shuffle`, `${keyPtnFrom}_${shuffleGr}`, `${keyPtnTo}_${shuffleGr}`);
        shuffleGr++;
    }
    while (g_keyObj[`stepRtn${keyPtnFrom}_${stepRtnGr}`] !== undefined) {
        copyKeyPtn(`stepRtn`, `${keyPtnFrom}_${stepRtnGr}`, `${keyPtnTo}_${stepRtnGr}`);
        stepRtnGr++;
    }
    copyKeyPtn(`keyCtrl`);
    copyKeyPtn(`chara`);
    copyKeyPtn(`pos`);
    copyKeyPtn(`scrollDir`);
    copyKeyPtn(`assistPos`);

    copyKeyPtnVal(`div`);
    copyKeyPtnVal(`divMax`);
    copyKeyPtnVal(`blank`);
    copyKeyPtnVal(`scale`);
    copyKeyPtnVal(`keyRetry`);
    copyKeyPtnVal(`keyTitleBack`);

    if (g_keyObj[`transKey${keyPtnFrom}`] !== undefined) {
        g_keyObj[`transKey${keyPtnTo}`] = g_keyObj[`transKey${keyPtnFrom}`];
    } else if (g_keyObj[`transKey${keyPtnTo}`] === undefined && keyPtnFrom.split(`_`)[0] !== keyPtnTo.split(`_`)[0]) {
        g_keyObj[`transKey${keyPtnTo}`] = keyPtnFrom.split(`_`)[0];
    }
});

// 頻度の高い譜面データ名の自動生成 (left -> aleft, bleft, ..., zleft を生成)
Object.keys(g_keyObj).filter(val => val.startsWith(`ptchara`)).forEach(charaPtn => {
    g_keyObj[`${charaPtn.slice(2)}`] = g_keyObj[charaPtn].concat();
    [...Array(26)].map((a, b) => (10 + b).toString(36)).forEach(alphabet =>
        g_keyObj[`${charaPtn.slice(2)}_${alphabet}`] = g_keyObj[charaPtn].map(str => `${alphabet}${str}`));
});

// デフォルト配列のコピー (g_keyObj.aaa_X から g_keyObj.aaa_Xd を作成)
// keyCtrlX_Yについて1キーにつき2キー割り当てできるように配列を補完
const keyCtrlName = Object.keys(g_keyObj).filter(val => val.startsWith(`keyCtrl`));
keyCtrlName.forEach(property => {
    g_keyObj[property].forEach((list, j) => g_keyObj[property][j] = makeBaseArray(g_keyObj[property][j], g_keyObj.minKeyCtrlNum, 0));
    g_keyObj[`${property}d`] = structuredClone(g_keyObj[property]);
});

// shuffleX_Y, colorX_Y, stepRtnX_Yについてデフォルト配列を作成
g_keycons.groups.forEach(type => {
    const tmpName = Object.keys(g_keyObj).filter(val => val.startsWith(type) && val.endsWith(`_0`));
    tmpName.forEach(property => g_keyObj[`${property.slice(0, -2)}`] = g_keyObj[property].concat());
});

// 特殊キーのコピー種 (simple: 代入、multiple: 配列ごと代入)
const g_keyCopyLists = {
    simpleDef: [`blank`, `scale`],
    simple: [`div`, `divMax`, `blank`, `scale`, `keyRetry`, `keyTitleBack`, `transKey`, `scrollDir`, `assistPos`, `flatMode`],
    multiple: [`chara`, `color`, `stepRtn`, `pos`, `shuffle`, `keyGroup`, `keyGroupOrder`],
};

// タイトル画面関連のリスト群
const g_titleLists = {
    /** タイトル画面で利用する初期オブジェクトのリスト */
    init: [`title`, `titleArrow`, `titleAnimation`, `back`, `backMain`, `ready`],

    /** タイトルのデフォルトフォント */
    defaultFonts: [`'メイリオ'`],

    /** タイトル用アニメーションの設定種 */
    animation: [`Name`, `Duration`, `Delay`, `TimingFunction`],

};

const g_animationData = [`back`, `mask`, `style`];
const g_animationFunc = {
    make: {
        back: makeSpriteData,
        mask: makeSpriteData,
        style: makeStyleData,
    },
    draw: {
        back: drawSpriteData,
        mask: drawSpriteData,
        style: drawStyleData,
    },
    drawMain: {
        back: drawMainSpriteData,
        mask: drawMainSpriteData,
        style: drawMainStyleData,
    },
};

let g_fadeinStockList = [`word`, `back`, `mask`, `style`];

/** フェードイン時でもプリロードを除外しないリスト */
const g_preloadExceptList = {
    word: [`[left]`, `[center]`, `[right]`],
    back: [],
    mask: [],
    style: [],
};

/** フェードイン時、プリロードを強制削除するリスト（初期値は空） */
const g_stockForceDelList = {
    word: [],
    back: [],
    mask: [],
    style: [],
};

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
    style: 1,
};

const g_dfColorObj = {

    // 矢印初期色情報
    setColorInit: [`#6666ff`, `#99ffff`, `#ffffff`, `#ffff99`, `#ff9966`, `#6666ff`, `#99ffff`, `#ffffff`, `#ffff99`, `#ff9966`],
    setShadowColorInit: [``, ``, ``, ``, ``, ``, ``, ``, ``, ``],

    // フリーズアロー初期色情報
    frzColorInit: [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
    frzShadowColorInit: [``, ``, ``, ``],

};

const g_cssBkProperties = {};

const g_dfColorBaseObj = {

    dark: {
        setColorType1: [`#6666ff`, `#99ffff`, `#ffffff`, `#ffff99`, `#ff9966`, `#ff9999`, `#ff6699`, `#99ff99`, `#6699ff`, `#9966ff`],
        setColorType2: [`#ffffff`, `#9999ff`, `#99ccff`, `#ffccff`, `#ff9999`, `#669966`, `#ccffcc`, `#cc99ff`, `#ffff99`, `#cc9966`],
        setColorType3: [`#ccccff`, `#ccffff`, `#ffffff`, `#ffffcc`, `#ffcc99`, `#ffcccc`, `#ff99cc`, `#ccffcc`, `#99ccff`, `#cc99ff`],
        setColorType4: [`#ffffff`, `#ccccff`, `#99ccff`, `#ffccff`, `#ffcccc`, `#99cc99`, `#ccffcc`, `#cc99ff`, `#ffff99`, `#ffcc99`],

        setShadowColorType1: [`#00000080`, `#00000080`, `#00000080`, `#00000080`, `#00000080`, `#00000080`, `#00000080`, `#00000080`, `#00000080`, `#00000080`],
        setShadowColorType2: [`#00000080`, `#00000080`, `#00000080`, `#00000080`, `#00000080`, `#00000080`, `#00000080`, `#00000080`, `#00000080`, `#00000080`],
        setShadowColorType3: [`#6666ff60`, `#33999960`, `#66666660`, `#99993360`, `#cc663360`, `#99666660`, `#99336660`, `#33993360`, `#33669960`, `#66339960`],
        setShadowColorType4: [`#66666660`, `#6666ff60`, `#3366cc60`, `#99339960`, `#99333360`, `#33663360`, `#66996660`, `#66339960`, `#66663360`, `#99663360`],

        frzColorType1: [
            [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
            [`#00ffcc`, `#339999`, `#cccc33`, `#999933`],
            [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
            [`#cc99ff`, `#9966ff`, `#cccc33`, `#999933`],
            [`#ff99cc`, `#ff6699`, `#cccc33`, `#999933`],
            [`#ff9999`, `#ffcccc`, `#cccc33`, `#999933`],
            [`#ff6699`, `#ff99cc`, `#cccc33`, `#999933`],
            [`#99ff99`, `#ccffcc`, `#cccc33`, `#999933`],
            [`#6699ff`, `#99ccff`, `#cccc33`, `#999933`],
            [`#9966ff`, `#cc99ff`, `#cccc33`, `#999933`],
        ],
        frzColorType2: [
            [`#cccccc`, `#999999`, `#cccc33`, `#999933`],
            [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
            [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
            [`#cc99cc`, `#ff99ff`, `#cccc33`, `#999933`],
            [`#ff6666`, `#ff9999`, `#cccc33`, `#999933`],
            [`#669966`, `#669966`, `#cccc33`, `#999933`],
            [`#ccffcc`, `#ccffcc`, `#cccc33`, `#999933`],
            [`#cc99ff`, `#cc99ff`, `#cccc33`, `#999933`],
            [`#ffff99`, `#ffff99`, `#cccc33`, `#999933`],
            [`#cc9966`, `#cc9966`, `#cccc33`, `#999933`],
        ],
        frzColorType3: [
            [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
            [`#00ffcc`, `#339999`, `#cccc33`, `#999933`],
            [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
            [`#cc99ff`, `#9966ff`, `#cccc33`, `#999933`],
            [`#ff99cc`, `#ff6699`, `#cccc33`, `#999933`],
            [`#ff9999`, `#ffcccc`, `#cccc33`, `#999933`],
            [`#ff6699`, `#ff99cc`, `#cccc33`, `#999933`],
            [`#99ff99`, `#ccffcc`, `#cccc33`, `#999933`],
            [`#6699ff`, `#99ccff`, `#cccc33`, `#999933`],
            [`#9966ff`, `#cc99ff`, `#cccc33`, `#999933`],
        ],
        frzColorType4: [
            [`#cccccc`, `#999999`, `#cccc33`, `#999933`],
            [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
            [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
            [`#cc99cc`, `#ff99ff`, `#cccc33`, `#999933`],
            [`#ff6666`, `#ff9999`, `#cccc33`, `#999933`],
            [`#669966`, `#669966`, `#cccc33`, `#999933`],
            [`#ccffcc`, `#ccffcc`, `#cccc33`, `#999933`],
            [`#cc99ff`, `#cc99ff`, `#cccc33`, `#999933`],
            [`#ffff99`, `#ffff99`, `#cccc33`, `#999933`],
            [`#cc9966`, `#cc9966`, `#cccc33`, `#999933`],
        ],
    },
    light: {
        setColorType1: [`#6666ff`, `#66cccc`, `#000000`, `#999966`, `#cc6600`, `#996666`, `#ff6699`, `#66cc66`, `#3399ff`, `#6633cc`],
        setColorType2: [`#000000`, `#6666ff`, `#cc0000`, `#cc99cc`, `#cc3366`, `#669966`, `#336633`, `#9966cc`, `#999900`, `#996633`],
        setColorType3: [`#000000`, `#000000`, `#000000`, `#000000`, `#000000`, `#000000`, `#000000`, `#000000`, `#000000`, `#000000`],
        setColorType4: [`#000000`, `#000000`, `#000000`, `#000000`, `#000000`, `#000000`, `#000000`, `#000000`, `#000000`, `#000000`],

        setShadowColorType1: [`#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`],
        setShadowColorType2: [`#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`, `#ffffff80`],
        setShadowColorType3: [`#6666ff80`, `#66cccc80`, `#ffffff80`, `#99996680`, `#cc660080`, `#ff666680`, `#cc669980`, `#99cc9980`, `#6699cc80`, `#9966cc80`],
        setShadowColorType4: [`#00000080`, `#6666ff80`, `#cc000080`, `#cc99cc80`, `#cc336680`, `#66996680`, `#99cc9980`, `#9966cc80`, `#99993380`, `#cc996680`],

        frzColorType1: [
            [`#66ffff`, `#6600ff`, `#ffff00`, `#999900`],
            [`#00ffcc`, `#339999`, `#ffff00`, `#999900`],
            [`#66ffff`, `#6600ff`, `#ffff00`, `#999900`],
            [`#cc99ff`, `#9966ff`, `#ffff00`, `#999900`],
            [`#ff99cc`, `#ff6699`, `#ffff00`, `#999900`],
            [`#996666`, `#996666`, `#cccc33`, `#999933`],
            [`#ff6699`, `#ff6699`, `#cccc33`, `#999933`],
            [`#66cc66`, `#66cc66`, `#cccc33`, `#999933`],
            [`#3399ff`, `#3399ff`, `#cccc33`, `#999933`],
            [`#6633cc`, `#6633cc`, `#cccc33`, `#999933`],
        ],
        frzColorType2: [
            [`#cccccc`, `#999999`, `#ffff00`, `#999900`],
            [`#66ffff`, `#6600ff`, `#ffff00`, `#999900`],
            [`#66ffff`, `#6600ff`, `#ffff00`, `#999900`],
            [`#cc99cc`, `#ff99ff`, `#ffff00`, `#999900`],
            [`#ff6666`, `#ff9999`, `#ffff00`, `#999900`],
            [`#669966`, `#669966`, `#cccc33`, `#999933`],
            [`#336633`, `#336633`, `#cccc33`, `#999933`],
            [`#9966cc`, `#9966cc`, `#cccc33`, `#999933`],
            [`#999900`, `#999900`, `#cccc33`, `#999933`],
            [`#996633`, `#996633`, `#cccc33`, `#999933`],
        ],
        frzColorType3: [
            [`#66ffff`, `#6600ff`, `#ffff00`, `#999900`],
            [`#00ffcc`, `#339999`, `#ffff00`, `#999900`],
            [`#66ffff`, `#6600ff`, `#ffff00`, `#999900`],
            [`#cc99ff`, `#9966ff`, `#ffff00`, `#999900`],
            [`#ff99cc`, `#ff6699`, `#ffff00`, `#999900`],
            [`#996666`, `#996666`, `#cccc33`, `#999933`],
            [`#ff6699`, `#ff6699`, `#cccc33`, `#999933`],
            [`#66cc66`, `#66cc66`, `#cccc33`, `#999933`],
            [`#3399ff`, `#3399ff`, `#cccc33`, `#999933`],
            [`#6633cc`, `#6633cc`, `#cccc33`, `#999933`],
        ],
        frzColorType4: [
            [`#cccccc`, `#999999`, `#ffff00`, `#999900`],
            [`#66ffff`, `#6600ff`, `#ffff00`, `#999900`],
            [`#66ffff`, `#6600ff`, `#ffff00`, `#999900`],
            [`#cc99cc`, `#ff99ff`, `#ffff00`, `#999900`],
            [`#ff6666`, `#ff9999`, `#ffff00`, `#999900`],
            [`#669966`, `#669966`, `#cccc33`, `#999933`],
            [`#336633`, `#336633`, `#cccc33`, `#999933`],
            [`#9966cc`, `#9966cc`, `#cccc33`, `#999933`],
            [`#999900`, `#999900`, `#cccc33`, `#999933`],
            [`#996633`, `#996633`, `#cccc33`, `#999933`],
        ],
    },
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

};

const g_lang_msgInfoObj = {
    Ja: {
        W_0001: `お使いのブラウザは動作保証外です。<br>
        Chrome/Opera/Vivaldiなど、WebKit系ブラウザの利用を推奨します。(W-0001)`,
        W_0011: `fileスキームでの動作のため、内蔵の画像データを使用します。<br>
        imgフォルダ以下の画像の変更は適用されません。(W-0011)`,
        W_0012: `現在の設定では音源再生方法により小数の Adjustment が利用できません。<br>
        また、Fadein を使用した場合は通常よりズレが発生することがあります。<br>
        音源ファイルを js/txt 化するか、サーバー上動作とすれば解消します。(W-0012)`,
        W_0021: `クリップボードのコピーに失敗しました。`,

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
        |keyCtrl{0}=S,D,E/R,F,Space,J,M/Comma,K,L|`,

        E_0201: `色変化データで指定した色変化対象が存在しません。[pattern={0}] (E-0201)`,

        I_0001: `リザルトデータをクリップボードにコピーしました！`,
        I_0002: `入力したキーは割り当てできません。他のキーを指定してください。`,
        I_0003: `各譜面の明細情報をクリップボードにコピーしました！`,
        I_0004: `musicUrlが設定されていないため、無音モードで再生します`,
        I_0005: `正規のミラー譜面で無いため、ハイスコアは保存されません`,
    },
    En: {
        W_0001: `Your browser is not guaranteed to work.<br>
        We recommend using a WebKit browser such as Chrome, Opera and Vivaldi. (W-0001)`,
        W_0011: `Uses built-in image data for operation with the file scheme.<br>
        Changes to the images under the "img" folder will not be applied. (W-0011)`,
        W_0012: `With the current settings, a decimal of "Adjustment" cannot be used 
        depending on the sound source playback method.<br>
        Also, if you use "Fadein", it may be out of alignment.<br>
        It can be solved by converting the sound source file to encoded data (js, txt) or 
        operating it on the server. (W-0012)`,
        W_0021: `Failed to copy the clipboard.`,

        E_0011: `The artist name is not set. (E-0011)`,
        E_0012: `The song title information is not set. (E-0012)<br>
        |musicTitle=Song title,Artist name,Artist's site URL|`,
        E_0021: `Music information is not set or the format is incorrect.(E-0021)<br>
        |difData=Key type's name,chart's name,Specified speed|`,
        E_0022: `The format of the external music file is incorrect.(E-0022)<br>
        function externalDosInit() { g_externalDos = \`(Chart data)\`; }`,
        E_0023: `Music information is not set. (E-0023)<br>
	    Specify either or both of the following:<br>
	    &lt;input type="hidden" name="externalDos" id="externalDos" value="dos.txt"&gt;<br>
        &lt;input type="hidden" name="dos" id="dos" value="(Chart data)"&gt;<br>`,
        E_0031: `The music file is not set or the format is incorrect.(E-0031)<br>
        |musicUrl=****.mp3|`,
        E_0032: `Failed to read the music file. (E-0032)`,
        E_0033: `The connection timed out while loading a music file. (E-0033)`,
        E_0034: `An error occurred while reading the music file. (E-0034)`,
        E_0035: `Your OS does not support the specified music format. (E-0035)`,
        E_0041: `Failed to read file: {0}. (E-0041)<br>`,
        E_0042: `{0} must be greater than 0. (E-0042)`,
        E_0051: `In the default setting (XXXXChainOFF) of the Display option, <br>a combination that cannot be specified is set. (E-0051)`,

        E_0101: `New key: {0} [color] is not set. (E-0101)<br>
        |color{0}=0,1,0,1,0,2|`,
        E_0102: `New key: {0} [chara] is not set. (E-0102)<br>
        |chara{0}=arrowA,arrowB,arrowC,arrowD,arrowE,arrowF|`,
        E_0103: `New key: {0} [stepRtn] is not set. (E-0103)<br>
        |stepRtn{0}=0,45,-90,135,180,onigiri|`,
        E_0104: `New key: {0} [keyCtrl] is not set. (E-0104)<br>
        |keyCtrl{0}=S,D,E/R,F,Space,J,M/Comma,K,L|`,

        E_0201: `The color change target specified in the color change data does not exist. [pattern={0}] (E-0201)`,

        I_0001: `Your result data is copied to the clipboard!`,
        I_0002: `The specified key cannot be assigned. Please specify another key.`,
        I_0003: `Charts information is copied to the clipboard!`,
        I_0004: `Play in silence mode because "musicUrl" is not set`,
        I_0005: `Highscore is not saved because not a regular mirrored chart.`,
    },
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
 * ラベル表示定義（共通部）
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
    b_reset: `Reset Key`,
    b_settings: `To Settings`,
    b_copy: `CopyResult`,
    b_tweet: `Post X`,
    b_gitter: `Discord`,
    b_retry: `Retry`,
    b_close: `Close`,
    b_cReset: `Reset`,

    Difficulty: `Difficulty`,
    Speed: `Speed`,
    Motion: `Motion`,
    Scroll: `Scroll`,
    Reverse: `Reverse`,
    Shuffle: `Shuffle`,
    AutoPlay: `AutoPlay`,
    Gauge: `Gauge`,
    Excessive: `Excessive`,
    Adjustment: `Adjustment`,
    Fadein: `Fadein`,
    Volume: `Volume`,

    multi: `x`,
    frame: `f`,
    percent: `%`,
    pixel: `px`,
    filterLock: `Lock`,

    sc_speed: `←→`,
    sc_scroll: `R/<br>↑↓`,
    sc_adjustment: `- +`,
    sc_hitPosition: `T B`,
    sc_keyConfigPlay: g_isMac ? `Del+Enter` : `BS+Enter`,

    g_start: `Start`,
    g_border: `Border`,
    g_recovery: `Recovery`,
    g_damage: `Damage`,
    g_rate: `Accuracy`,

    s_speed: `Overall`,
    s_boost: `Boost`,
    s_avg: `Avg.`,
    s_avgDspeed: `AvgO)`,
    s_avgDboost: `AvgB)`,

    s_apm: `APM`,
    s_time: `Time`,
    s_arrow: `Arrow`,
    s_frz: `Frz`,

    d_StepZone: `StepZone`,
    d_Judgment: `Judgment`,
    d_FastSlow: `FastSlow`,
    d_LifeGauge: `LifeGauge`,
    d_Score: `Score`,
    d_MusicInfo: `MusicInfo`,
    d_FilterLine: `FilterLine`,
    d_Speed: `Velocity`,
    d_Color: `Color`,
    d_Lyrics: `Lyrics`,
    d_Background: `Background`,
    d_ArrowEffect: `ArrowEffect`,
    d_Special: `Special`,

    Appearance: `Appearance`,
    Opacity: `Opacity`,
    HitPosition: `HitPosition`,

    'u_x': `x`,
    'u_%': `%`,
    'u_key': `key`,
    'u_k-': `k-`,

    'u_OFF': `OFF`,
    'u_ON': `ON`,
    'u_Boost': `Boost`,
    'u_Hi-Boost': `Hi-Boost`,
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
    'u_X-Mirror': `X-Mirror`,
    'u_Turning': `Turning`,
    'u_Random': `Random`,
    'u_Random+': `Random+`,
    'u_S-Random': `S-Random`,
    'u_S-Random+': `S-Random+`,
    'u_(S)': `(S)`,

    'u_ALL': `ALL`,
    'u_Onigiri': `Onigiri`,
    'u_Left': `Left`,
    'u_Right': `Right`,
    'u_less': `less`,

    'u_Original': `Original`,
    'u_Heavy': `Heavy`,
    'u_NoRecovery': `NoRecovery`,
    'u_SuddenDeath': `SuddenDeath`,
    'u_Practice': `Practice`,
    'u_Light': `Light`,

    'u_Normal': `Normal`,
    'u_Hard': `Hard`,
    'u_Easy': `Easy`,

    'u_FlatBar': `FlatBar`,

    'u_Visible': `Visible`,
    'u_Hidden': `Hidden`,
    'u_Hidden+': `Hidden+`,
    'u_Sudden': `Sudden`,
    'u_Sudden+': `Sudden+`,
    'u_Hid&Sud+': `Hid&Sud+`,

    'u_Speed': `Velocity`,
    'u_Density': `Density`,
    'u_ToolDif': `DifLevel`,
    'u_HighScore': `HighScore`,

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
    StepRtnGroup: `ShapeGr.`,
    KeyPattern: `KeyPattern`,

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
 * リンク先管理
 */
const g_linkObj = {
    x: `https://x.com/intent/post`,
    discord: `https://discord.gg/5Hxu4wDEZR`,
};

/**
 * ラベル表示定義（言語別）
 */
const g_lang_lblNameObj = {
    Ja: {
        kcDesc: `[{0}:スキップ / {1}:(代替キーのみ)キー無効化]`,
        kcShuffleDesc: `番号をクリックでシャッフルグループ、矢印をクリックでカラーグループを変更`,
        kcNoShuffleDesc: `矢印をクリックでカラーグループを変更`,
        sdDesc: `[クリックでON/OFFを切替、灰色でOFF]`,
        kcShortcutDesc: `プレイ中ショートカット：「{0}」タイトルバック / 「{1}」リトライ`,
        transKeyDesc: `別キーモードではキーコンフィグ、ColorType等は保存されません`,
        sdShortcutDesc: `Hid+/Sud+時ショートカット：「pageUp」カバーを上へ / 「pageDown」下へ`,
        resultImageDesc: `画像を右クリックしてコピーできます`,

        s_level: `Level`,
        s_douji: `同時補正`,
        s_tate: `縦連補正`,
        s_cnts: `All Arrows`,
        s_linecnts: `- 矢印 Arrow:<br><br>- 氷矢 Frz:<br><br>- 3つ押し位置 ({0}):`,
        s_print: `データ出力`,
        s_result: `CopyResult`,
        s_resetResult: `Reset`,
        s_printTitle: `Dancing☆Onigiri レベル計算ツール+++`,
        s_printHeader: `難易度\t同時\t縦連\t総数\t矢印\t氷矢印\tAPM\t時間`,

        j_ii: "(・∀・)ｲｲ!!",
        j_shakin: "(`・ω・)ｼｬｷﾝ",
        j_matari: "( ´∀`)ﾏﾀｰﾘ",
        j_shobon: "(´・ω・`)ｼｮﾎﾞｰﾝ",
        j_uwan: "( `Д´)ｳﾜｧﾝ!!",

        j_kita: "(ﾟ∀ﾟ)ｷﾀ-!!",
        j_iknai: "(・A・)ｲｸﾅｲ",

        j_adj: `推定Adj`,
        j_excessive: `Excessive`,

        l_retry: `リトライ`,
        l_titleBack: `タイトルバック`,

        helpUrl: `https://github.com/cwtickle/danoniplus/wiki/AboutGameSystem`,
        securityUrl: `https://github.com/cwtickle/danoniplus/security/policy`,
    },
    En: {
        kcDesc: `[{0}:Skip / {1}:Key invalidation (Alternate keys only)]`,
        kcShuffleDesc: `Click the number to change the shuffle group, and click the arrow to change the color.`,
        kcNoShuffleDesc: `Click the arrow to change the color group.`,
        sdDesc: `[Click to switch, gray to OFF]`,
        kcShortcutDesc: `Shortcut during play: "{0}" Return to title / "{1}" Retry the game`,
        transKeyDesc: `Key config, Color type, etc. are not saved in another key mode`,
        sdShortcutDesc: `When "Hidden+" or "Sudden+" select, "pageUp" cover up / "pageDown" cover down`,
        resultImageDesc: `You can copy the image by right-clicking on it.`,

        s_level: `Level`,
        s_douji: `Chords`,
        s_tate: `Jack Corr.`,
        s_cnts: `All Arrows`,
        s_linecnts: `- Arrow:<br><br>- Freeze Arrow:<br><br>- Polychord positions ({0}):`,
        s_print: `CopyData`,
        s_result: `CopyResult`,
        s_resetResult: `Reset`,
        s_printTitle: `Dancing☆Onigiri Level Calculator+++`,
        s_printHeader: `Level\tChords\tJack\tAll\tArrow\tFrz\tAPM\tTime`,

        j_ii: ":D Perfect!!",
        j_shakin: ":) Great!",
        j_matari: ":| Good",
        j_shobon: ":( Bad",
        j_uwan: ":_( Miss...",

        j_kita: ":) O.K.",
        j_iknai: ":( N.G.",

        j_adj: `Est-Adj.`,
        j_excessive: `Excessive`,

        l_retry: `Retry`,
        l_titleBack: `Go to title`,

        helpUrl: `https://github.com/cwtickle/danoniplus-docs/wiki/AboutGameSystem`,
        securityUrl: `https://github.com/cwtickle/danoniplus-docs/wiki/SecurityPolicy`,
    },
};

/**
 * オンマウステキスト、確認メッセージ定義（共通）
 */
const g_msgObj = {
    reload: `説明文の言語を変更します。\nChange the language of the description.`,
};

/**
 * オンマウステキスト、確認メッセージ定義（言語別）
 */
const g_lang_msgObj = {

    Ja: {
        howto: `ゲーム画面の見方や設定の詳細についてのページへ移動します（GitHub Wiki）。`,
        dataReset: `この作品で保存されているハイスコアや\nAdjustment情報等をリセットします。`,
        github: `Dancing☆Onigiri (CW Edition)のGitHubページへ移動します。`,
        security: `Dancing☆Onigiri (CW Edition)のサポート情報ページへ移動します。`,

        dataResetConfirm: `この作品のローカル設定をクリアします。よろしいですか？\n(ハイスコアやAdjustment等のデータが全てクリアされます)`,
        keyResetConfirm: `キーを初期配置に戻します。よろしいですか？`,
        highscResetConfirm: `この譜面のハイスコアを消去します。よろしいですか？`,
        colorCopyConfirm: `フリーズアローの配色を矢印色に置き換えます\n(通常・ヒット時双方を置き換えます)。よろしいですか？`,
        colorResetConfirm: `矢印・フリーズアローの配色を元に戻します。よろしいですか？`,

        difficulty: `譜面を選択します。`,
        speed: `矢印の流れる速度を設定します。\n外側のボタンは1x単位、内側は0.25x単位で変更できます。`,
        motion: `矢印の速度を一定ではなく、\n変動させるモーションをつけるか設定します。`,
        reverse: `矢印の流れる向きを設定します。`,
        scroll: `各レーンのスクロール方向をパターンに沿って設定します。\nReverse:ONでスクロール方向を反転します。`,
        shuffle: `譜面を左右反転したり、ランダムにします。\nランダムにした場合は別譜面扱いとなり、ハイスコアは保存されません。`,
        autoPlay: `オートプレイや一部キーを自動で打たせる設定を行います。\nオートプレイ時はハイスコアを保存しません。`,
        gauge: `クリア条件を設定します。\n[Start] ゲージ初期値, [Border] クリア条件(ハイフン時は0),\n[Recovery] 回復量, [Damage] ダメージ量, [Accuracy] クリアに必要な正確率(オンマウスで許容ミス数表示)`,
        excessive: `空押し判定を行うか設定します。`,
        adjustment: `曲とのタイミングにズレを感じる場合、\n数値を変えることでフレーム単位のズレを直すことができます。\n外側のボタンは5f刻み、真ん中は1f刻み、内側は0.5f刻みで調整できます。`,
        fadein: `譜面を途中から再生します。\n途中から開始した場合はハイスコアを保存しません。`,
        volume: `ゲーム内の音量を設定します。`,

        graph: `譜面密度や速度変化状況、\n譜面の難易度などの情報を表示します。`,
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

        lnkSpeedG: `譜面の進行別の速度変化状況を表示`,
        lnkDensityG: `譜面の密度状況を表示`,
        lnkToolDifG: `譜面の難易度、矢印・フリーズアローの分布状況を表示`,
        lnkHighScoreG: `譜面のハイスコアを表示`,
        lnkDifInfo: `譜面の難易度、矢印・フリーズアローの分布状況をクリップボードへコピー`,
        lnkResetHighScore: `譜面のハイスコア情報を消去`,
        lnkHighScore: `譜面のハイスコアをクリップボードへコピー`,

        appearance: `流れる矢印の見え方を制御します。`,
        opacity: `判定キャラクタ、コンボ数、Fast/Slow、Hidden+/Sudden+の\n境界線表示の透明度を設定します。`,
        hitPosition: `判定位置にズレを感じる場合、\n数値を変えることで判定の中央位置を1px単位(プラス:手前, マイナス:奥側)で調整することができます。\n早押し・遅押し傾向にある場合に使用します。`,

        configType: `キーコンフィグ対象を切り替えます。\n[Main] メインキーのみ, [Replaced] 代替キーのみ, [ALL] 全て`,
        colorType: `矢印・フリーズアローの配色セットをあらかじめ定義されたリストから選択できます。\nType1～4選択時は色変化が自動でOFFになり、カラーピッカーから好きな色に変更できます。\n[Type0] グラデーション切替, [Type1～4] デフォルトパターン`,
        imgType: `矢印・フリーズアローなどのオブジェクトの見た目を変更します。`,
        colorGroup: `矢印・フリーズアロー色グループの割り当てパターンを変更します。`,
        shuffleGroup: `Mirror/X-Mirror/Turning/Random/S-Random選択時、シャッフルするグループを変更します。\n矢印の上にある同じ数字同士でシャッフルします。`,
        stepRtnGroup: `矢印などノーツの種類、回転に関するパターンを切り替えます。\nあらかじめ設定されている場合のみ変更可能です。`,
        kcReset: `対応するキーの割り当てを元に戻します。`,

        pickArrow: `色番号ごとの矢印色（枠、塗りつぶし）、通常時のフリーズアロー色（枠、帯）を\nカラーピッカーから選んで変更できます。`,
        pickColorR: `設定する矢印色の種類を切り替えます。`,
        pickColorCopy: `このボタンを押すと、フリーズアローの配色を矢印（枠）の色で上書きします。\nヒット時のフリーズアローの色も上書きします。`,
        pickColorReset: `矢印・フリーズアローの配色を元に戻します。`,
    },

    En: {
        howto: `Go to the page about the game screen and settings at GitHub Wiki.`,
        dataReset: `Resets the high score, adjustment information, etc. saved in this game.`,
        github: `Go to the GitHub page of Dancing Onigiri "CW Edition".`,
        security: `Go to the support information page for Dancing Onigiri "CW Edition".`,

        dataResetConfirm: `Delete the local settings in this game. Is it OK?\n(High score, adjustment, volume and some settings will be initialized)`,
        keyResetConfirm: `Resets the assigned key to the initial state. Is it OK?`,
        highscResetConfirm: `Erases the high score for this chart. Is it OK?`,
        colorCopyConfirm: `Replace freeze arrow color scheme with arrow color\n(replace both normal and hit). Is this OK?`,
        colorResetConfirm: `Restore the color scheme for arrows and freeze arrows. Is this OK?`,

        difficulty: `Select a chart.`,
        speed: `Set the speed of the sequences.\nThe outer button can be changed in 1x increments and the inner button in 0.25x increments.`,
        motion: `Set whether to turn on acceleration or deceleration\nin the middle of the sequence.`,
        reverse: `Set the flow direction of the sequences.`,
        scroll: `Set the scroll direction for each lane according to the pattern.\nIf "Reverse:ON" sets, reverse the scroll direction.`,
        shuffle: `Flip the chart left and right or make it random.\nIf you make it random, it will be treated as other charts and the high score will not be saved.`,
        autoPlay: `Set to auto play and to hit some keys automatically.\nHigh score is not saved during auto play.`,
        gauge: `Set the clear condition.\n[Start] initial value, [Border] borderline value (hyphen means zero),\n[Recovery] recovery amount, [Damage] damage amount,\n[Accuracy] accuracy required to clear (mouseover to see the number of allowed mistakes)`,
        excessive: `Set whether to use excessive miss judgment.`,
        adjustment: `If you feel that the timing is out of sync with the music, \nyou can correct the shift in frame units by changing the value.\nThe outer button can be adjusted in 5 frame increments, the middle in 1 frame increments, \nand the inner button in 0.5 frame increments.`,
        fadein: `Plays the chart from the middle.\nIf you start in the middle, the high score will not be saved.`,
        volume: `Set the in-game volume.`,

        graph: `Displays detailed information about the chart, such as chart's density status, sequences' velocity changes, and chart's difficulty.`,
        dataSave: `Set whether to save the high score, reverse setting, and key config.`,
        toDisplay: `Set the display or non-display (partial transparency) of objects on the play screen.`,
        toSettings: `Return to the SETTINGS screen.`,

        d_stepzone: `Display step zone`,
        d_judgment: `Display judgment and combo counts`,
        d_fastslow: `Display fast and slow `,
        d_lifegauge: `Display lifegauge`,
        d_score: `Display the current number of judgments`,
        d_musicinfo: `Display the music credits and current time`,
        d_filterline: `Filter border display when using "Hidden+" or "Sudden+"`,
        d_speed: `Enable speed change settings`,
        d_color: `Enable color change settings`,
        d_lyrics: `Enable lyrics display`,
        d_background: `Enable background images and animations`,
        d_arroweffect: `Enable sequences' animations`,
        d_special: `Enable setting of special effects to the work`,

        lnkSpeedG: `Displays the speed change status by progression of the chart.`,
        lnkDensityG: `Displays the density status of the chart.`,
        lnkToolDifG: `Displays the difficulty level of the chart and the distribution of arrows and freeze arrows.`,
        lnkHighScoreG: `Displays the high score of the chart.`,
        lnkDifInfo: `Copy the difficulty of the chart and the distribution of arrows and freeze arrows to the clipboard.`,
        lnkResetHighScore: `Erase the high score information in the chart.`,
        lnkHighScore: `Copies the high score of the chart to the clipboard.`,

        appearance: `Controls how the flowing sequences look.`,
        opacity: `Set the transparency of some objects such as judgment, combo counts, fast and slow`,
        hitPosition: `If you feel a discrepancy in the judgment position, \nyou can adjust the center position of the judgment in 1px increments \n (plus: in front, minus: at the back) by changing the numerical value. \nUse this function when there is a tendency to push too fast or too slow.`,

        configType: `Switch the key config target.\n[Main] main keys only, [Replaced] alternate keys only, [ALL] all keys`,
        colorType: `Change the color scheme set for arrows and freeze-arrows from the predefined set.\nWhen Type1 to 4 is selected, color change is automatically turned off and can be changed to any color from the color picker.\n[Type0] Switch the sequences color gradations, [Type1～4] default color scheme`,
        imgType: `Change the appearance of sequences.`,
        colorGroup: `Change the sequences color group assignment pattern.`,
        shuffleGroup: `Change the shuffle group when Mirror, X-Mirror, Turning, Random or S-Random are selected.\nShuffle with the same numbers listed above.`,
        stepRtnGroup: `Switches the type of notes, such as arrows, and the pattern regarding rotation.\nThis can only be changed if it has been set in advance.`,
        kcReset: `Restores the corresponding key assignments.`,

        pickArrow: `Change the frame or fill of arrow color and the frame or bar of normal freeze-arrow color\nfor each color number from the color picker.`,
        pickColorR: `Switches the arrow color type to be set.`,
        pickColorCopy: `Pressing this button will override the color scheme of the freeze arrow with the frame color of the arrow. \nIt also overrides the color of the freeze arrow on hit.`,
        pickColorReset: `Restore the color scheme for arrows and freeze arrows.`,
    },

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

/**
 * カスタム関数の定義
 * - 挿入場所ごとに名前を分けて定義
 */
const g_customJsObj = {
    preTitle: [],
    title: [],
    titleEnterFrame: [],
    option: [],
    difficulty: [],
    settingsDisplay: [],
    keyconfig: [],

    preloading: [],
    loading: [],
    progress: [],
    main: [],
    dummyArrow: [],
    dummyFrz: [],

    judg_ii: [],
    judg_shakin: [],
    judg_matari: [],
    judg_shobon: [],
    judg_uwan: [],
    judg_kita: [],
    judg_iknai: [],

    judg_frzHit: [],
    judg_dummyFrzHit: [],

    mainEnterFrame: [],
    result: [],
    resultEnterFrame: [],
};

/**
 * スキン関数の定義
 * - 挿入場所ごとに名前を分けて定義
 */
const g_skinJsObj = {
    title: [],
    option: [],
    settingsDisplay: [],
    keyconfig: [],

    preloading: [],
    loading: [],
    main: [],
    result: [],
};

/**
 * 従来のカスタム関数をg_customJsObj, g_skinJsObjへ追加
 * - customjsファイルを読み込んだ直後にこの関数を呼び出している
 */
const loadLegacyCustomFunc = () => {

    const customFuncMap = {
        title: [`customTitleInit`, `customTitleInit2`],
        titleEnterFrame: [`customTitleEnterFrame`, `customTitleEnterFrame2`],
        option: [`customOptionInit`, `customOptionInit2`],
        difficulty: [`customSetDifficulty`, `customSetDifficulty2`],
        settingsDisplay: [`customSettingsDisplayInit`, `customSettingsDisplayInit2`],
        keyconfig: [`customKeyConfigInit`, `customKeyConfigInit2`],
        preloading: [`customPreloadingInit`, `customPreloadingInit2`],
        loading: [`customLoadingInit`, `customLoadingInit2`],
        progress: [`customLoadingProgress`, `customLoadingProgress2`],
        main: [`customMainInit`, `customMainInit2`],
        dummyArrow: [`customJudgeDummyArrow`, `customJudgeDummyArrow2`],
        dummyFrz: [`customJudgeDummyFrz`, `customJudgeDummyFrz2`],
        mainEnterFrame: [`customMainEnterFrame`, `customMainEnterFrame2`],
        judg_ii: [`customJudgeIi`, `customJudgeIi2`],
        judg_shakin: [`customJudgeShakin`, `customJudgeShakin2`],
        judg_matari: [`customJudgeMatari`, `customJudgeMatari2`],
        judg_shobon: [`customJudgeShobon`, `customJudgeShobon2`],
        judg_uwan: [`customJudgeUwan`, `customJudgeUwan2`],
        judg_kita: [`customJudgeKita`, `customJudgeKita2`],
        judg_iknai: [`customJudgeIknai`, `customJudgeIknai2`],
        result: [`customResultInit`, `customResultInit2`],
        resultEnterFrame: [`customResultEnterFrame`, `customResultEnterFrame2`],
    };

    const skinFuncMap = {
        title: [`skinTitleInit`, `skinTitleInit2`],
        option: [`skinOptionInit`, `skinOptionInit2`],
        settingsDisplay: [`skinSettingsDisplayInit`, `skinSettingsDisplayInit2`],
        keyconfig: [`skinKeyConfigInit`, `skinKeyConfigInit2`],
        preloading: [`skinPreloadingInit`, `skinPreloadingInit2`],
        main: [`skinMainInit`, `skinMainInit2`],
        result: [`skinResultInit`, `skinResultInit2`],
    };

    const loadFunctions = (_funcMap, _targetObj) => {
        Object.entries(_funcMap).forEach(([category, funcNames]) => {
            funcNames.forEach(funcName => {
                if (typeof window[funcName] === C_TYP_FUNCTION) {
                    _targetObj[category].push(window[funcName]);
                }
            });
        });
    }

    loadFunctions(customFuncMap, g_customJsObj);
    loadFunctions(skinFuncMap, g_skinJsObj);
};

/**
 * 従来の共通設定変数をg_presetObjへ移動 
 * - settingjsファイルを読み込んだ直後にこの関数を呼び出している
 */
const loadLegacySettingFunc = () => {

    if (typeof g_presetTuning === C_TYP_STRING) {
        g_presetObj.tuning = g_presetTuning;
    }
    if (typeof g_presetTuningUrl === C_TYP_STRING) {
        g_presetObj.tuningUrl = g_presetTuningUrl;
    }
    if (typeof g_presetSkinType === C_TYP_STRING) {
        g_presetObj.skinType = g_presetSkinType;
    }
    if (typeof g_presetCustomJs === C_TYP_STRING) {
        g_presetObj.customJs = g_presetCustomJs;
    }
    if (typeof g_presetCustomCss === C_TYP_STRING) {
        g_presetObj.customCss = g_presetCustomCss;
    }
    if (typeof g_presetSyncBackPath === C_TYP_BOOLEAN) {
        g_presetObj.syncBackPath = g_presetSyncBackPath;
    }
    if (typeof g_presetGauge === C_TYP_OBJECT) {
        g_presetObj.gauge = g_presetGauge;
    }
    if (typeof g_presetFrzColors === C_TYP_BOOLEAN) {
        g_presetObj.frzColors = g_presetFrzColors;
    }
    if (typeof g_presetFrzScopeFromAC === C_TYP_OBJECT) {
        g_presetObj.frzScopeFromAC = g_presetFrzScopeFromAC;
    }
    if (typeof g_presetGaugeCustom === C_TYP_OBJECT) {
        g_presetObj.gaugeCustom = g_presetGaugeCustom;
    }
    if (typeof g_presetGaugeList === C_TYP_OBJECT) {
        g_presetObj.gaugeList = g_presetGaugeList;
    }
    if (typeof g_presetCustomDesignUse === C_TYP_OBJECT) {
        g_presetObj.customDesignUse = g_presetCustomDesignUse;
    }
    if (typeof g_presetSettingUse === C_TYP_OBJECT) {
        g_presetObj.settingUse = g_presetSettingUse;
    }
    if (typeof g_presetFrzStartjdgUse === C_TYP_STRING) {
        g_presetObj.frzStartjdgUse = g_presetFrzStartjdgUse;
    }
    if (typeof g_presetImageSets === C_TYP_OBJECT) {
        g_presetObj.imageSets = g_presetImageSets;
    }
    if (typeof g_presetOverrideExtension === C_TYP_STRING) {
        g_presetObj.overrideExtension = g_presetOverrideExtension;
    }
    if (typeof g_presetCustomImageList === C_TYP_OBJECT) {
        g_presetObj.customImageList = g_presetCustomImageList;
    }
    if (typeof g_presetWordAutoReverse === C_TYP_STRING) {
        g_presetObj.wordAutoReverse = g_presetWordAutoReverse;
    }
    if (typeof g_presetResultFormat === C_TYP_STRING) {
        g_presetObj.resultFormat = g_presetResultFormat;
    }
    if (typeof g_presetResultVals === C_TYP_OBJECT) {
        g_presetObj.resultVals = g_presetResultVals;
    }
    if (typeof g_local_lblNameObj === C_TYP_OBJECT) {
        g_presetObj.lblName = g_local_lblNameObj;
    }
    if (typeof g_local_msgObj === C_TYP_OBJECT) {
        g_presetObj.msg = g_local_msgObj;
    }
    if (typeof g_lblRenames === C_TYP_OBJECT) {
        g_presetObj.lblRenames = g_lblRenames;
    }
    if (typeof g_presetUnStockCategories === C_TYP_OBJECT) {
        g_presetObj.unStockCategories = g_presetUnStockCategories;
    }
    if (typeof g_presetStockForceDelList === C_TYP_OBJECT) {
        g_presetObj.stockForceDelList = g_presetStockForceDelList;
    }
    if (typeof g_presetKeysData === C_TYP_STRING) {
        g_presetObj.keysData = g_presetKeysData;
    }
};