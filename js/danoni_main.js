`use strict`;
/**
 * Dancing☆Onigiri (CW Edition)
 * 
 * Source by tickle
 * Created : 2018/10/08
 * Revised : 2019/06/08
 * 
 * https://github.com/cwtickle/danoniplus
 */
const g_version = `Ver 5.8.1`;
const g_revisedDate = `2019/06/08`;
const g_alphaVersion = ``;

// カスタム用バージョン (danoni_custom.js 等で指定可)
let g_localVersion = ``;
let g_localVersion2 = ``;

// ショートカット用文字列(↓の文字列を検索することで対象箇所へジャンプできます)
//  タイトル:melon  設定・オプション:lime  キーコンフィグ:orange  譜面読込:strawberry  メイン:banana  結果:grape
//  シーンジャンプ:Scene

/**
 * ▽ ソースコーディングルール
 * - 定数・変数名はわかりやすく、名前で判断がつくように。
 * -- 定数　　　　　： `C_(カテゴリ)_(名前)`の形式。全て英大文字、数字、アンダースコアのみを使用。
 * -- グローバル変数： 変数の頭に`g_`をつける。
 * -- 関数の引数　　： アンダースコア始まりのキャメル表記。
 * 
 * - 構造はシンプルに。繰り返しが多いときは関数化を検討する。
 * - コメントは処理単位ごとに簡潔に記述。ただの英訳は極力避ける。
 * - 画面の見取りがわかるように詳細設定やロジックは別関数化し、実行内容を明確にする。
 * 
 * ▽ 画面の構成
 *  [タイトル]-[設定・オプション]-[キーコンフィグ]-[譜面読込]-[メイン]-[リザルト]
 *  ⇒　各画面に Init がついたものが画面の基本構成(ルート)を表す。
 * 
 * ▽ スプライトの親子関係
 *  基本的にdiv要素で管理。最下層を[divRoot]とし、createSprite()でdiv子要素を作成していく。
 *  clearWindow()で[divRoot]以外の全てのスプライトを削除できる。
 *  特定のスプライトに限り削除する場合は deleteChildspriteAll() で実現。
 */

window.onload = _ => initialControl();

/*-----------------------------------------------------------*/
/* Scene : COMMON [water] */
/*-----------------------------------------------------------*/

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

// ユーザインタフェース
const C_CLR_DEFAULT = `#333333`;
const C_CLR_DEFHOVER = `#666666`;
const C_CLR_BACK = `#000033`;
const C_CLR_NEXT = `#330000`;
const C_CLR_SETTING = `#333300`;
const C_CLR_RESET = `#003300`;
const C_CLR_TWEET = `#003333`;
const C_CLR_TEXT = `#ffffff`;
const C_CLR_TITLE = `#cccccc`;
const C_CLR_LOADING_BAR = `#eeeeee`;

const C_LBL_TITLESIZE = 32;
const C_LBL_BTNSIZE = 28;
const C_LBL_LNKSIZE = 16;
const C_LBL_BASICFONT = `"Meiryo UI", sans-serif`;

const C_CLR_LNK = `#111111`;
const C_BTN_HEIGHT = 50;
const C_LNK_HEIGHT = 20;

// スプライト（ムービークリップ相当）のルート
const C_SPRITE_ROOT = `divRoot`;

// 画像ファイル
const C_IMG_ARROW = `../img/arrow_500.png`;
const C_IMG_ARROWSD = `../img/arrowShadow_500.png`;
const C_IMG_ONIGIRI = `../img/onigiri_600.png`;
const C_IMG_AASD = `../img/aaShadow_500.png`;
const C_IMG_GIKO = `../img/giko_600.png`;
const C_IMG_IYO = `../img/iyo_600.png`;
const C_IMG_C = `../img/c_600.png`;
const C_IMG_MORARA = `../img/morara_600.png`;
const C_IMG_MONAR = `../img/monar_600.png`;
const C_IMG_CURSOR = `../img/cursor.png`;
const C_IMG_FRZBAR = `../img/frzbar.png`;
const C_IMG_LIFEBAR = `../img/frzbar.png`;
const C_IMG_LIFEBORDER = `../img/borderline.png`;

const C_IMG_ARROWSHADOW = `../img/arrowShadow_500.png`;
const C_IMG_ONIGIRIARROWSHADOW = `../img/aaShadow_500.png`;
const C_IMG_GIKOARROWSHADOW = `../img/aaShadow_500.png`;
const C_IMG_IYOARROWSHADOW = `../img/aaShadow_500.png`;
const C_IMG_CARROWSHADOW = `../img/aaShadow_500.png`;
const C_IMG_MORARAARROWSHADOW = `../img/aaShadow_500.png`;
const C_IMG_MONARARROWSHADOW = `../img/aaShadow_500.png`;

const C_IMG_ONIGIRIFRZBAR = `../img/frzbar.png`;
const C_IMG_GIKOFRZBAR = `../img/frzbar.png`;
const C_IMG_IYOFRZBAR = `../img/frzbar.png`;
const C_IMG_CFRZBAR = `../img/frzbar.png`;
const C_IMG_MORARAFRZBAR = `../img/frzbar.png`;
const C_IMG_MONARFRZBAR = `../img/frzbar.png`;

// 音楽ファイル エンコードフラグ
let g_musicEncodedFlg = false;
let g_musicdata = ``;

// 外部dosデータ
let g_externalDos = ``;

// 譜面データの&区切りを有効にするか
let g_enableAmpersandSplit = true;

// 譜面データをdecodeURIするか
let g_enableDecodeURI = false;

// Motionオプション配列の基準位置
const C_MOTION_STD_POS = 15;

// キーブロック対象(キーコードを指定)
const C_BLOCK_KEYS = [
	8, 9, 13, 17, 18, 32, /* BackSpace, Tab, Enter, Ctrl, Alt, Space */
	37, 38, 39, 40, 46,   /* Left, Down, Up, Right, Delete */
	112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126 /* F1～F15 */
];

// ON/OFFスイッチ
const C_FLG_ON = `ON`;
const C_FLG_OFF = `OFF`;
const C_DIS_NONE = `none`;

/** 設定・オプション画面用共通 */
const C_LEN_SETLBL_LEFT = 140;
const C_LEN_SETLBL_WIDTH = 250;
const C_LEN_SETLBL_HEIGHT = 23;
const C_SIZ_SETLBL = 17;
const C_LEN_SETDIFLBL_HEIGHT = 25;
const C_SIZ_SETDIFLBL = 17;
const C_LEN_SETMINI_WIDTH = 40;
const C_SIZ_SETMINI = 18;

const C_LBL_SETMINIL = `<`;
const C_LEN_SETMINIL_LEFT = C_LEN_SETLBL_LEFT - C_LEN_SETMINI_WIDTH / 2;
const C_LBL_SETMINILL = `<`;
const C_LEN_SETMINILL_LEFT = C_LEN_SETMINIL_LEFT + C_LEN_SETMINI_WIDTH;
const C_LBL_SETMINIR = `>`;
const C_LBL_SETMINIRR = `>`;
const C_LEN_SETMINIR_LEFT = C_LEN_SETLBL_LEFT + C_LEN_SETLBL_WIDTH - C_LEN_SETMINI_WIDTH / 2;
const C_LEN_SETMINIRR_LEFT = C_LEN_SETMINIR_LEFT - C_LEN_SETMINI_WIDTH;

const C_MAX_ADJUSTMENT = 30;
const C_MAX_SPEED = 10;
const C_MIN_SPEED = 1;

/** キーコンフィグ設定 */
let g_kcType = `Main`;
let g_colorType = `Default`;

/** メイン画面用共通オブジェクト */
const g_workObj = {};
g_workObj.stepX = [];
g_workObj.stepRtn = [];
g_workObj.keyCtrl = [];
g_workObj.keyHitFlg = [];
g_workObj.scrollDir = [];
g_workObj.dividePos = [];

const C_FRM_AFTERFADE = 420;
const C_FRM_FRZATTEMPT = 5;

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

const C_CLR_II = `#66ffff`;
const C_CLR_SHAKIN = `#99ff99`;
const C_CLR_MATARI = `#ff9966`;
const C_CLR_UWAN = `#ff9999`;
const C_CLR_SHOBON = `#ccccff`;
const C_CLR_KITA = `#ffff99`;
const C_CLR_SFSF = ``;
const C_CLR_IKNAI = `#99ff66`;

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

let g_gameOverFlg = false;

const g_userAgent = window.navigator.userAgent.toLowerCase(); // msie, edge, chrome, safari, firefox, opera

let g_audio = new Audio();
let g_timeoutEvtId = 0;
let g_timeoutEvtTitleId = 0;
let g_inputKeyBuffer = [];

// 歌詞制御
const g_wordObj = {
	wordDir: 0,
	wordDat: ``,
	fadeInFlg0: false,
	fadeInFlg1: false,
	fadeOutFlg0: false,
	fadeOutFlg1: false
};
let g_wordSprite;
let C_WOD_FRAME = 30;

// 譜面データ持ち回り用
let g_rootObj = {};
let g_headerObj = {};
let g_scoreObj = {};
const g_stateObj = {
	scoreId: 0,
	speed: 3.5,
	motion: C_FLG_OFF,
	reverse: C_FLG_OFF,
	shuffle: `OFF`,
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

	extraKeyFlg: false,
	dataSaveFlg: true,

	d_stepzone: C_FLG_ON,
	d_judgement: C_FLG_ON,
	d_lifegauge: C_FLG_ON,
	d_musicinfo: C_FLG_ON,
	d_color: C_FLG_ON,
	d_speed: C_FLG_ON,
	d_lyrics: C_FLG_ON,
	d_background: C_FLG_ON
};

const C_VAL_MAXLIFE = 1000;
let C_CLR_MAXLIFE = `#444400`;
let C_CLR_CLEARLIFE = `#004444`;
let C_CLR_DEFAULTLIFE = `#444444`;
let C_CLR_BORDER = `#555555`;
let C_CLR_BACKLIFE = `#222222`;
const C_LFE_SURVIVAL = `Survival`;
const C_LFE_BORDER = `Border`;

const g_gaugeOptionObj = {
	survival: [`Original`, `Light`, `No Recovery`, `SuddenDeath`, `Practice`],
	border: [`Normal`, `Easy`, `Hard`, `SuddenDeath`],

	initSurvival: [250, 250, C_VAL_MAXLIFE, C_VAL_MAXLIFE, C_VAL_MAXLIFE / 2],
	rcvSurvival: [6, 6, 0, 0, 0],
	dmgSurvival: [40, 20, 50, C_VAL_MAXLIFE, 0],
	typeSurvival: [C_LFE_SURVIVAL, C_LFE_SURVIVAL, C_LFE_SURVIVAL, C_LFE_SURVIVAL, C_LFE_SURVIVAL],
	clearSurvival: [0, 0, 0, 0, 0],

	initBorder: [250, 250, C_VAL_MAXLIFE, C_VAL_MAXLIFE],
	rcvBorder: [2, 2, 1, 0],
	dmgBorder: [7, 4, 50, C_VAL_MAXLIFE],
	typeBorder: [C_LFE_BORDER, C_LFE_BORDER, C_LFE_BORDER, C_LFE_SURVIVAL],
	clearBorder: [70, 70, 0, 0]
};
let g_gaugeType;

let g_speeds = [...Array((C_MAX_SPEED - C_MIN_SPEED) * 4 + 1).keys()].map(i => C_MIN_SPEED + i / 4);
let g_speedNum = 0;

let g_motions = [C_FLG_OFF, `Boost`, `Brake`];
let g_motionNum = 0;

let g_reverses = [C_FLG_OFF, C_FLG_ON];
let g_reverseNum = 0;

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

// サイズ(後で指定)
let g_sWidth;
let g_sHeight;

// ステップゾーン位置、到達距離(後で指定)
const C_STEP_Y = 70;
let g_stepY;
let g_distY;

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
g_kCd[8] = `BS`;
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
	keyCtrl7_0: [[83], [68, 0], [70], [32, 0], [74], [75, 0], [76]],
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
	keyCtrl7_0d: [[83], [68, 0], [70], [32, 0], [74], [75, 0], [76]],
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

	keyCtrl5_2: [[37], [40], [32, 0], [38, 0], [39]],
	keyCtrl9A_2: [[65], [83], [68], [70], [32], [74], [75], [76], [187]],
	keyCtrl9B_2: [[83], [68], [69, 82], [70], [32], [37], [40], [38, 0], [39]],

	keyCtrl5_2d: [[37], [40], [32, 0], [38, 0], [39]],
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

	// 別キー
	transKey5_0: '',
	transKey7_0: '',
	transKey7i_0: '',
	transKey8_0: '',
	transKey9A_0: '',
	transKey9B_0: '',
	transKey9i_0: '',
	transKey11_0: '',
	transKey11L_0: '',
	transKey11W_0: '',
	transKey12_0: '',
	transKey13_0: '',
	transKey14_0: '',
	transKey14i_0: '',
	transKey15A_0: '',
	transKey15B_0: '',
	transKey16i_0: '',
	transKey17_0: '',

	transKey5_1: '',
	transKey9A_1: '',
	transKey9B_1: '9A',
	transKey9i_1: '',
	transKey11_1: '11L',
	transKey11L_1: '11',
	transKey12_1: '',
	transKey14_1: '',
	transKey15A_1: '',
	transKey15B_1: '',
	transKey17_1: '',

	transKey5_2: '',
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

const C_MSG_E_0101 = `新しいキー:{0}の[color]が未定義です。(E-0101)<br>
	|color{0}=0,1,0,1,0,2|`;
const C_MSG_E_0102 = `新しいキー:{0}の[chara]が未定義です。(E-0102)<br>
	|chara{0}=arrowA,arrowB,arrowC,arrowD,arrowE,arrowF|`;
const C_MSG_E_0103 = `新しいキー:{0}の[stepRtn]が未定義です。(E-0103)<br>
	|stepRtn{0}=0,45,-90,135,180,onigiri|`;
const C_MSG_E_0104 = `新しいキー:{0}の[keyCtrl]が未定義です。(E-0104)<br>
	|keyCtrl{0}=75,79,76,80,187,32/0|`;

// ローカルストレージ設定
const g_checkStorage = localStorage.getItem(location.href);
let g_localStorage;
if (g_checkStorage) {
	g_localStorage = JSON.parse(g_checkStorage);

	// Adjustment初期値設定
	if (g_localStorage.adjustment !== undefined) {
		g_stateObj.adjustment = setVal(g_localStorage.adjustment, 0, `number`);
		g_adjustmentNum = g_adjustments.findIndex(adjustment => adjustment === g_stateObj.adjustment);
		if (g_volumeNum < 0) {
			g_volumeNum = C_MAX_ADJUSTMENT;
		}
	} else {
		g_localStorage.adjustment = 0;
	}

	// Volume初期値設定
	if (g_localStorage.volume !== undefined) {
		g_stateObj.volume = setVal(g_localStorage.volume, 100, `number`);
		g_volumeNum = g_volumes.findIndex(volume => volume === g_stateObj.volume);
		if (g_volumeNum < 0) {
			g_volumeNum = 0;
		}
	} else {
		g_localStorage.volume = 100;
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

// ローカルストレージ設定 (ドメイン・キー別)
let g_checkKeyStorage;
let g_localKeyStorage;
let g_canLoadDifInfoFlg = false;

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
 * 文字列を想定された型に変換
 * - _type は `float`(小数)、`number`(整数)、`boolean`(真偽値)、`string`(文字列)から選択
 * - 型に合わない場合は _default を返却するが、_default自体の型チェック・変換は行わない
 * @param {string} _checkStr 
 * @param {string} _default 
 * @param {string} _type 
 */
function setVal(_checkStr, _default, _type) {

	// 値がundefined相当の場合は無条件でデフォルト値を返却
	if (_checkStr === undefined || _checkStr === null || _checkStr === ``) {
		return _default;
	}

	let isNaNflg;
	if (_type === `float`) {
		// 数値型(小数可)の場合
		isNaNflg = isNaN(parseFloat(_checkStr));
		return (isNaNflg ? _default : parseFloat(_checkStr));

	} else if (_type === `number`) {
		// 数値型(整数のみ)の場合
		isNaNflg = isNaN(parseInt(_checkStr));
		return (isNaNflg ? _default : parseInt(_checkStr));

	} else if (_type === `boolean`) {
		const lowerCase = _checkStr.toString().toLowerCase();
		if (lowerCase === `true`) {
			return true;
		} else if (lowerCase === `false`) {
			return false;
		}
		return _default
	}

	// 文字列型の場合 (最初でチェック済みのためそのまま値を返却)
	return _checkStr;
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
	if (_type === `float`) {
		// 数値型(小数可)の場合
		isNaNflg = isNaN(parseFloat(_checkArray[0]));
		if (isNaNflg) {
			return false;
		}
	} else if (_type === `number`) {
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
 * プリロードするファイルの設定
 * @param {string} _as 
 * @param {string} _href 
 * @param {string} _type 
 * @param {string} _crossOrigin 
 */
function preloadFile(_as, _href, _type, _crossOrigin) {
	const link = document.createElement(`link`);
	link.rel = `preload`;
	link.as = _as;
	link.href = _href;
	if (_type !== ``) {
		link.type = _type;
	}
	if (_crossOrigin !== ``) {
		link.crossOrigin = _crossOrigin
	}
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
 * @param {string} str 
 */
function getStrLength(str) {
	let result = 0;
	for (let i = 0; i < str.length; i++) {
		const chr = str.charCodeAt(i);
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
	style.khtmlUserSelect = C_DIS_NONE;
	style.webkitTouchCallout = C_DIS_NONE;

	return div;
}

/**
 * 子div要素のラベル文字作成
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
	style.color = _color;
	style.fontFamily = _font;
	style.textAlign = C_ALIGN_CENTER;
	div.innerHTML = _text;

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
 * 矢印オブジェクトの作成（色付きマスク版）
 * - cssスタイルに mask-image を使っているため、Chrome/Safari/FirefoxとIE/Edgeで処理を振り分ける。
 * - IE/Edgeは色指定なし。
 * @param {string} _id 
 * @param {string} _color 
 * @param {number} _x 
 * @param {number} _y 
 * @param {number} _size 
 * @param {number, string} _rotate 
 */
function createArrowEffect(_id, _color, _x, _y, _size, _rotate) {

	// 矢印・おにぎり判定
	let rotate;
	let charaStyle;
	let charaImg;
	let sizeX;
	if (isNaN(Number(_rotate))) {
		rotate = 0;
		charaStyle = _rotate;
		charaImg = eval(`C_IMG_${_rotate.toUpperCase()}`);
		sizeX = _size;
	} else {
		rotate = _rotate;
		charaStyle = `arrow`;
		charaImg = C_IMG_ARROW;
		sizeX = _size;
	}

	const div = createDiv(_id, _x, _y, sizeX, _size);
	div.align = C_ALIGN_CENTER;

	let edgeVersion = 0;
	if (g_userAgent.indexOf(`edge`) !== -1) {
		edgeVersion = Math.floor(g_userAgent.slice(g_userAgent.indexOf(`edge`) + 5));
	}

	// IE/Edge(V17以前)の場合は色なし版を表示
	if (g_userAgent.indexOf(`msie`) !== -1 ||
		g_userAgent.indexOf(`trident`) !== -1 ||
		(g_userAgent.indexOf(`edge`) !== -1 && edgeVersion < 18)) {
		div.innerHTML = `<img id=${_id}img src=${charaImg}
			style=width:${sizeX}px;height:${_size}px;transform:rotate(${rotate}deg)>`;

	} else {
		// それ以外は指定された色でマスク
		if (_color !== ``) {
			div.style.backgroundColor = _color;
		}
		div.className = charaStyle;
		div.style.transform = `rotate(${rotate}deg)`;
	}
	div.setAttribute(`color`, _color);

	return div;
}

function createColorObject(_id, _color, _x, _y, _width, _height,
	_rotate, _styleName) {

	const div = createDiv(_id, _x, _y, _width, _height);

	// 矢印・おにぎり判定
	let rotate;
	let charaStyle;
	let charaImg;
	if (isNaN(Number(_rotate))) {
		rotate = 0;
		charaStyle = _rotate + _styleName;
		div.setAttribute(`type`, `AA`);
	} else {
		rotate = _rotate;
		charaStyle = _styleName;
		div.setAttribute(`type`, `arrow`);
	}
	charaImg = eval(`C_IMG_${charaStyle.toUpperCase()}`);
	div.align = C_ALIGN_CENTER;

	let edgeVersion = 0;
	if (g_userAgent.indexOf(`edge`) !== -1) {
		edgeVersion = Math.floor(g_userAgent.slice(g_userAgent.indexOf(`edge`) + 5));
	}

	// IE/Edge(V17以前)の場合は色なし版を表示
	if (g_userAgent.indexOf(`msie`) !== -1 ||
		g_userAgent.indexOf(`trident`) !== -1 ||
		(g_userAgent.indexOf(`edge`) !== -1 && edgeVersion < 18)) {
		div.innerHTML = `<img id=${_id}img src=${charaImg}
			style=width:${_width}px;height:${_height}px;transform:rotate(${rotate}deg)>`;

	} else {
		// それ以外は指定された色でマスク
		if (_color !== ``) {
			div.style.backgroundColor = _color;
		}
		div.className = charaStyle;
		div.style.transform = `rotate(${rotate}deg)`;
	}
	div.setAttribute(`color`, _color);

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
function createSprite(_parentObjName, _newObjName, _x, _y, _width, _height) {
	let newsprite;
	if (document.querySelector(`#${_newObjName}`) === null) {
		const parentsprite = document.querySelector(`#${_parentObjName}`);
		newsprite = createDiv(_newObjName, _x, _y, _width, _height);
		parentsprite.appendChild(newsprite);
	} else {
		newsprite = document.querySelector(`#${_newObjName}`);
	}
	return newsprite;
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
 * ボタンの作成
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
function getTitleDivLabel(_id, _titlename, _x, _y) {
	const div = createDivLabel(_id, _x, _y, g_sWidth, 50, C_LBL_BTNSIZE, C_CLR_TITLE, _titlename);
	div.style.textAlign = C_ALIGN_CENTER;
	return div;
}

/**
 * 画面上の描画、オブジェクトを全てクリア
 * - divオブジェクト(ボタンなど)はdivRoot配下で管理しているため、子要素のみを全削除している。
 * - dicRoot自体を削除しないよう注意すること。
 * - 再描画時に共通で表示する箇所はここで指定している。
 */
function clearWindow() {

	// レイヤー情報取得
	const layer0 = document.querySelector(`#layer0`);
	const l0ctx = layer0.getContext(`2d`);

	g_sWidth = layer0.width;
	g_sHeight = layer0.height;
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

	// ボタン、オブジェクトをクリア (divRoot配下のもの)
	const divRoot = document.querySelector(`#divRoot`);
	while (divRoot.hasChildNodes()) {
		/*
		alert(divRoot.firstChild.getAttribute(`lsnrkey`));
		*/
		g_handler.removeListener(divRoot.firstChild.getAttribute(`lsnrkey`));
		g_handler.removeListener(divRoot.firstChild.getAttribute(`lsnrkeyTS`));
		g_handler.removeListener(divRoot.firstChild.getAttribute(`lsnrkeyTE`));
		divRoot.removeChild(divRoot.firstChild);
	}

}

/**
 * 外部jsファイルの読込
 * @param {string} _url 
 * @param {function} _callback 
 * @param {string} _charset (default : UTF-8)
 */
function loadScript(_url, _callback, _charset = `UTF-8`) {
	const script = document.createElement(`script`);
	script.type = `text/javascript`;
	script.src = _url;
	script.charset = _charset;
	script.onload = _ => _callback();
	document.querySelector(`head`).appendChild(script);
}

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

/*-----------------------------------------------------------*/
/* Scene : TITLE [melon] */
/*-----------------------------------------------------------*/

function initialControl() {
	const layer0 = document.querySelector(`#layer0`);
	g_sWidth = layer0.width;
	g_sHeight = layer0.height;

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
	const l0ctx = layer0.getContext(`2d`);
	const grd = l0ctx.createLinearGradient(0, 0, 0, g_sHeight);
	grd.addColorStop(0, `#000000`);
	grd.addColorStop(1, `#222222`);
	l0ctx.fillStyle = grd;
	l0ctx.fillRect(0, 0, g_sWidth, g_sHeight);

	// Now Loadingを表示
	const lblLoading = createDivLabel(`lblLoading`, 0, g_sHeight - 40,
		g_sWidth, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TEXT, `Now Loading...`);
	lblLoading.style.textAlign = C_ALIGN_RIGHT;
	divRoot.appendChild(lblLoading);

	// 譜面初期情報ロード許可フラグ
	g_canLoadDifInfoFlg = true;

	// 譜面データの読み込みオプション
	const ampSplitInput = document.querySelector(`#enableAmpersandSplit`);
	if (ampSplitInput !== null) {
		g_enableAmpersandSplit = setVal(ampSplitInput.value, true, `boolean`);
	}

	const decodeUriInput = document.querySelector(`#enableDecodeURI`);
	if (decodeUriInput !== null) {
		g_enableDecodeURI = setVal(decodeUriInput.value, false, `boolean`);
	}

	// 譜面データの読み込み
	const dosInput = document.querySelector(`#dos`);
	const externalDosInput = document.querySelector(`#externalDos`);

	if (dosInput === null && externalDosInput === null) {
		makeWarningWindow(C_MSG_E_0023);
		initAfterDosLoaded();
	}

	// HTML埋め込みdos
	if (dosInput !== null) {
		g_rootObj = dosConvert(dosInput.value);
		if (externalDosInput === null) {
			const randTime = new Date().getTime();
			loadScript(`../js/danoni_setting.js?${randTime}`, _ => {
				initAfterDosLoaded();
			});
		}
	}

	// 外部dos読み込み
	if (externalDosInput !== null) {
		let charset = document.characterSet;
		const charsetInput = document.querySelector(`#externalDosCharset`);
		if (charsetInput !== null) {
			charset = charsetInput.value;
		}

		const filename = externalDosInput.value.match(/.+\..*/)[0];
		const randTime = new Date().getTime();
		loadScript(`${filename}?${randTime}`, _ => {
			if (typeof externalDosInit === `function`) {
				externalDosInit();
				Object.assign(g_rootObj, dosConvert(g_externalDos));
			} else {
				makeWarningWindow(C_MSG_E_0022);
			}
			const randTime = new Date().getTime();
			loadScript(`../js/danoni_setting.js?${randTime}`, _ => {
				initAfterDosLoaded();
			});
		}, charset);
	}
}

function initAfterDosLoaded() {
	g_headerObj = headerConvert(g_rootObj);
	keysConvert(g_rootObj);

	g_keyObj.currentKey = g_headerObj.keyLabels[g_stateObj.scoreId];
	g_keyObj.currentPtn = 0;

	// 画像ファイルの読み込み
	preloadFile(`image`, C_IMG_ARROW, ``, ``);
	preloadFile(`image`, C_IMG_ARROWSD, ``, ``);
	preloadFile(`image`, C_IMG_ONIGIRI, ``, ``);
	preloadFile(`image`, C_IMG_AASD, ``, ``);
	preloadFile(`image`, C_IMG_GIKO, ``, ``);
	preloadFile(`image`, C_IMG_IYO, ``, ``);
	preloadFile(`image`, C_IMG_C, ``, ``);
	preloadFile(`image`, C_IMG_MORARA, ``, ``);
	preloadFile(`image`, C_IMG_MONAR, ``, ``);
	preloadFile(`image`, C_IMG_CURSOR, ``, ``);
	preloadFile(`image`, C_IMG_FRZBAR, ``, ``);
	preloadFile(`image`, C_IMG_LIFEBORDER, ``, ``);

	// その他の画像ファイルの読み込み
	for (let j = 0, len = g_headerObj.preloadImages.length; j < len; j++) {
		if (setVal(g_headerObj.preloadImages[j], ``, `string`) !== ``) {
			preloadFile(`image`, g_headerObj.preloadImages[j], ``, ``);
		}
	}

	// customjs、音楽ファイルの読み込み
	const randTime = new Date().getTime();
	loadScript(`../js/${g_headerObj.customjs}?${randTime}`, _ => {
		if (g_headerObj.customjs2 !== ``) {
			loadScript(`../js/${g_headerObj.customjs2}?${randTime}`, _ => {
				titleInit();
			});
		} else {
			titleInit();
		}
	});
}

function loadMusic() {
	const musicUrl = g_headerObj.musicUrls[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.musicUrls[0];
	const url = `../${g_headerObj.musicFolder}/${musicUrl}`;

	g_headerObj.musicUrl = musicUrl;

	if (musicUrl.slice(-3) === `.js` || musicUrl.slice(-4) === `.txt`) {
		g_musicEncodedFlg = true;
	} else {
		g_musicEncodedFlg = false;
	}

	drawDefaultBackImage(``);

	// Now Loadingを表示
	const lblLoading = createDivLabel(`lblLoading`, 0, g_sHeight - 40,
		g_sWidth, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TEXT, `Now Loading...`);
	lblLoading.style.textAlign = C_ALIGN_RIGHT;
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
			lblLoading.innerText = `Please Wait...`;
			setAudio(blobUrl);
		} else {
			makeWarningWindow(`${C_MSG_E_0032}<br>(${request.status} ${request.statusText})`);
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
			lblLoading.innerText = `Now Loading... ${Math.floor(rate * 100)}%`;
		} else {
			lblLoading.innerText = `Now Loading... ${_event.loaded}Bytes`;
		}
		// ユーザカスタムイベント
		if (typeof customLoadingProgress === `function`) {
			customLoadingProgress(_event);
			if (typeof customLoadingProgress2 === `function`) {
				customLoadingProgress2(_event);
			}
		}
	});

	// エラー処理
	request.addEventListener(`timeout`, _ => {
		makeWarningWindow(`${C_MSG_E_0033}`);
	});

	request.addEventListener(`error`, _ => {
		makeWarningWindow(`${C_MSG_E_0034}`);
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

function setAudio(_url) {
	if (g_musicEncodedFlg) {
		loadScript(_url, _ => {
			if (typeof musicInit === `function`) {
				musicInit();
				initWebAudioAPI(`data:audio/mp3;base64,${g_musicdata}`);
			} else {
				makeWarningWindow(C_MSG_E_0031);
				musicAfterLoaded();
			}
		});
	} else if (location.href.match(`^file`)) {
		g_audio.src = _url;
		musicAfterLoaded();
	} else {
		initWebAudioAPI(_url);
	}
}

/**
 * デフォルト背景画像の描画処理
 * @param {string} _key メイン画面かどうか。Main:メイン画面、(空白):それ以外
 */
function drawDefaultBackImage(_key) {

	// レイヤー情報取得
	const layer0 = document.querySelector(`#layer0`);
	const l0ctx = layer0.getContext(`2d`);

	g_sWidth = layer0.width;
	g_sHeight = layer0.height;

	// 画面背景を指定 (background-color)
	const grd = l0ctx.createLinearGradient(0, 0, 0, g_sHeight);
	if (setVal(g_headerObj[`customBack${_key}Use`], ``, `string`) === `` || g_headerObj[`customBack${_key}Use`] === `false`) {
		grd.addColorStop(0, `#000000`);
		grd.addColorStop(1, `#222222`);
		l0ctx.fillStyle = grd;
		l0ctx.fillRect(0, 0, g_sWidth, g_sHeight);
	}
}

/**
 *  タイトル画面初期化
 */
function titleInit() {
	clearWindow();
	drawDefaultBackImage(``);

	// タイトル用フレーム初期化
	g_scoreObj.titleFrameNum = 0;

	// タイトル用ループカウンター
	g_scoreObj.titleLoopCount = 0;

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;

	// 譜面初期情報ロード許可フラグ
	// (初回読み込み時はローカルストレージのロードが必要なため、
	//  ローカルストレージ保存時はフラグを解除しない)
	if (!g_stateObj.dataSaveFlg || setVal(g_keyObj[`transKey${keyCtrlPtn}`], ``, `string`) !== ``) {
		g_canLoadDifInfoFlg = false;
	}
	const divRoot = document.querySelector(`#divRoot`);

	// タイトル文字描画
	const lblTitle = getTitleDivLabel(`lblTitle`,
		`<span style=color:#6666ff;font-size:40px>D</span>ANCING
		<span style=color:#ffff66;font-size:40px>☆</span>
		<span style=color:#ff6666;font-size:40px>O</span>NIGIRI`
			.replace(/[\t\n]/g, ``), 0, 15);
	divRoot.appendChild(lblTitle);

	// 背景の矢印オブジェクトを表示
	if (g_headerObj.customTitleArrowUse === `false`) {
		const lblArrow = createArrowEffect(`lblArrow`, g_headerObj.setColorDefault[0], (g_sWidth - 500) / 2, -15 + (g_sHeight - 500) / 2, 500, 180);
		lblArrow.style.opacity = 0.25;
		lblArrow.style.zIndex = 0;
		divRoot.appendChild(lblArrow);
	}

	// 曲名文字描画（曲名は譜面データから取得）
	let titlefontgrd = ``;
	let titlefontgrd2 = ``;
	if (g_headerObj.customTitleUse === `false`) {

		// グラデーションの指定がない場合、
		// 矢印色の1番目と3番目を使ってタイトルをグラデーション
		if (setVal(g_headerObj.titlegrd, ``, `string`) !== ``) {
			titlefontgrd = g_headerObj.titlegrd;
		} else {
			if (g_headerObj.setColorDefault[0] !== undefined) {
				titlefontgrd += g_headerObj.setColorDefault[0];
			} else {
				titlefontgrd += `#ffffff`;
			}

			titlefontgrd += `,`;

			if (g_headerObj.setColorDefault[2] !== undefined) {
				titlefontgrd += g_headerObj.setColorDefault[2];
			} else {
				titlefontgrd += `#66ffff`;
			}
		}

		// グラデーションの方向の指定がない場合、左から右へグラデーションさせる
		// 先頭1文字目が#かどうかで判断するので、redやwhiteのような色コードの指定はNG
		if (titlefontgrd[0] === `#`) {
			titlefontgrd = `to right,${titlefontgrd}`;
		}

		// グラデーションが1色しか指定されていない場合、自動的に補完する
		if (titlefontgrd.split(`#`).length <= 2) {
			titlefontgrd += `,#ffffff`;
		}

		if (g_headerObj.titlegrds.length > 1 && setVal(g_headerObj.titlegrds[1], ``, `string`) !== ``) {

			// グラデーションの方向の指定がない場合、左から右へグラデーションさせる
			titlefontgrd2 = g_headerObj.titlegrds[1];
			if (titlefontgrd2[0] === `#`) {
				titlefontgrd2 = `to right,${titlefontgrd2}`;
			}

			// グラデーションが1色しか指定されていない場合、自動的に補完する
			if (titlefontgrd2.split(`#`).length <= 2) {
				titlefontgrd2 += `,#ffffff`;
			}
		} else {
			titlefontgrd2 = titlefontgrd;
		}

		let titlefontsize = 64 * (12 / g_headerObj.musicTitleForView[0].length);
		if (titlefontsize >= 64) {
			titlefontsize = 64;
		}

		// 変数 titlesize の定義 (使用例： |titlesize=40,20|)
		let titlefontsize1;
		let titlefontsize2;
		if (g_headerObj.titlesize !== ``) {
			let titlefontsizes = g_headerObj.titlesize.split(`,`);
			titlefontsize1 = setVal(titlefontsizes[0], titlefontsize, `number`);
			titlefontsize2 = setVal(titlefontsizes[1], titlefontsize1, `number`);
		} else {
			titlefontsize1 = titlefontsize;
		}

		// 変数 titlefont の定義 (使用例： |titlefont=Century,Meiryo UI|)
		let titlefontname = `メイリオ`;
		if (g_headerObj.titlefont !== ``) {
			titlefontname = setVal(g_headerObj.titlefont, titlefontname, `string`);
		}
		titlefontname = `'${(titlefontname.replace(/,/g, `','`))}'`;

		// 変数 titlepos の定義 (使用例： |titlepos=0,10| マイナス、小数点の指定もOK)
		let titlefontpos = (
			(setVal(g_headerObj.titlepos, ``, `string`) !== ``)
				? g_headerObj.titlepos.split(`,`)
				: [0, 0]
		);

		// 変数 titlelineheight の定義 (使用例： |titlelineheight=50|)
		let titlelineheight = g_headerObj.titlelineheight;
		if (g_headerObj.titlelineheight === ``) {
			titlelineheight = setVal(g_headerObj.titlelineheight, titlefontsize2 + 5, `number`);
		}

		const lblmusicTitle = createDivLabel(`lblmusicTitle`,
			g_sWidth * -1 + Number(titlefontpos[0]), 0 + Number(titlefontpos[1]),
			g_sWidth * 3, g_sHeight - 40,
			titlefontsize, `#ffffff`,
			`<span style="
				align:${C_ALIGN_CENTER};
				position:relative;top:${titlefontsize1 - (titlefontsize1 + titlefontsize2) / 2}px;
				font-family:${titlefontname};
				font-size:${titlefontsize1}px;
				background: linear-gradient(${titlefontgrd});
				background-clip: text;
				-webkit-background-clip: text;
				-webkit-text-fill-color: rgba(255,255,255,0.0);
				color: #ffffff;
			">
				${g_headerObj.musicTitleForView[0]}<br>
				<span style="
					font-size:${titlefontsize2}px;
					position:relative;top:${titlelineheight - (titlefontsize1 + titlefontsize2) / 2 - titlefontsize1 + titlefontsize2}px;
					background: linear-gradient(${titlefontgrd2});
					background-clip: text;
					-webkit-background-clip: text;
					-webkit-text-fill-color: rgba(255,255,255,0.0);
				">
					${setVal(g_headerObj.musicTitleForView[1], ``, `string`)}
				</span>
			</span>`
		);
		lblmusicTitle.style.display = `flex`;
		lblmusicTitle.style.flexDirection = `column`;
		lblmusicTitle.style.justifyContent = `center`;
		lblmusicTitle.style.alignItems = `center`;
		divRoot.appendChild(lblmusicTitle);
	}

	// 非推奨ブラウザに対して警告文を表示
	// Firefoxはローカル環境時、Ver65以降矢印が表示されなくなるため非推奨表示
	if (g_userAgent.indexOf(`msie`) !== -1 ||
		g_userAgent.indexOf(`trident`) !== -1 ||
		g_userAgent.indexOf(`edge`) !== -1 ||
		(g_userAgent.indexOf(`firefox`) !== -1 && location.href.match(`^file`))) {

		makeWarningWindow(C_MSG_W_0001);
	}

	// 背景スプライトを作成
	createSprite(`divRoot`, `backTitleSprite`, 0, 0, g_sWidth, g_sHeight);
	for (let j = 0; j <= g_headerObj.backTitleMaxDepth; j++) {
		createSprite(`backTitleSprite`, `backTitleSprite${j}`, 0, 0, g_sWidth, g_sHeight);
	}

	// ユーザカスタムイベント(初期)
	if (typeof customTitleInit === `function`) {
		customTitleInit();
		if (typeof customTitleInit2 === `function`) {
			customTitleInit2();
		}
	}

	/**
	 * タイトルのモーション設定
	 */
	function flowTitleTimeline() {

		// ユーザカスタムイベント(フレーム毎)
		if (typeof customTitleEnterFrame === `function`) {
			customTitleEnterFrame();
			if (typeof customTitleEnterFrame2 === `function`) {
				customTitleEnterFrame2();
			}
		}

		// 背景表示・背景モーション
		if (g_headerObj.backTitleData[g_scoreObj.titleFrameNum] !== undefined) {
			const tmpObj = g_headerObj.backTitleData[g_scoreObj.titleFrameNum];
			const backTitleSprite = document.querySelector(`#backTitleSprite${tmpObj.depth}`);
			if (tmpObj.path !== ``) {
				if (tmpObj.path === `[loop]`) {
					// キーワード指定：ループ
					// 指定フレーム(class)へ移動する
					g_scoreObj.titleFrameNum = setVal(Number(tmpObj.class) - 1, 0, `number`);
					g_scoreObj.titleLoopCount++;

				} else if (tmpObj.path === `[jump]`) {
					// キーワード指定：フレームジャンプ
					// 指定回数以上のループ(left)があれば指定フレーム(class)へ移動する
					if (g_scoreObj.titleLoopCount >= Number(tmpObj.left)) {
						g_scoreObj.titleFrameNum = setVal(Number(tmpObj.class) - 1, 0, `number`);
						g_scoreObj.titleLoopCount = 0;
					}
				} else if (tmpObj.path.indexOf(`.png`) !== -1 || tmpObj.path.indexOf(`.gif`) !== -1 ||
					tmpObj.path.indexOf(`.bmp`) !== -1 || tmpObj.path.indexOf(`.jpg`) !== -1) {

					// imgタグの場合
					let tmpInnerHTML = `<img src=${tmpObj.path} class="${tmpObj.class}"
						style="position:absolute;left:${tmpObj.left}px;top:${tmpObj.top}px`;
					if (tmpObj.width !== 0 && tmpObj.width > 0) {
						tmpInnerHTML += `;width:${tmpObj.width}px`;
					}
					if (tmpObj.height !== `` && setVal(tmpObj.height, 0, `number`) > 0) {
						tmpInnerHTML += `;height:${tmpObj.height}px`;
					}
					tmpInnerHTML += `;animation-name:${tmpObj.animationName}
						;animation-duration:${tmpObj.animationDuration}s
						;opacity:${tmpObj.opacity}">`;
					backTitleSprite.innerHTML = tmpInnerHTML;

				} else {

					// spanタグの場合
					let tmpInnerHTML = `<span class="${tmpObj.class}"
						style="display:inline-block;position:absolute;left:${tmpObj.left}px;top:${tmpObj.top}px`;

					// この場合のwidthは font-size と解釈する
					if (tmpObj.width !== 0 && tmpObj.width > 0) {
						tmpInnerHTML += `;font-size:${tmpObj.width}px`;
					}

					// この場合のheightは color と解釈する
					if (tmpObj.height !== ``) {
						tmpInnerHTML += `;color:${tmpObj.height}`;
					}
					tmpInnerHTML += `;animation-name:${tmpObj.animationName}
						;animation-duration:${tmpObj.animationDuration}s
						;opacity:${tmpObj.opacity}">${tmpObj.path}</span>`;
					backTitleSprite.innerHTML = tmpInnerHTML;
				}
			} else {
				backTitleSprite.innerHTML = ``;
			}

		}

		g_scoreObj.titleFrameNum++;
		g_timeoutEvtTitleId = setTimeout(_ => flowTitleTimeline(), 1000 / 60);
	}

	g_timeoutEvtTitleId = setTimeout(_ => flowTitleTimeline(), 1000 / 60);

	// ボタン描画
	const btnStart = createButton({
		id: `btnStart`,
		name: `Click Here!!`,
		x: 0,
		y: g_sHeight - 100,
		width: g_sWidth,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_TITLESIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_DEFHOVER,
		align: C_ALIGN_CENTER
	}, _ => {
		clearTimeout(g_timeoutEvtTitleId);
		clearWindow();
		optionInit();
	});
	divRoot.appendChild(btnStart);

	// ローカルストレージ設定をクリア
	const btnReset = createButton({
		id: `btnReset`,
		name: `Data Reset`,
		x: 0,
		y: g_sHeight - 20,
		width: g_sWidth / 5,
		height: 16,
		fontsize: 12,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_RESET,
		align: C_ALIGN_CENTER
	}, _ => {
		if (window.confirm(`この作品のローカル設定をクリアします。よろしいですか？\n(ハイスコアやAdjustment等のデータがクリアされます)`)) {
			g_localStorage = {
				adjustment: 0,
				volume: 100,
				highscores: {},
			};
			localStorage.setItem(location.href, JSON.stringify(g_localStorage));
			location.reload(true);
		}
	});
	divRoot.appendChild(btnReset);

	// リロードボタン
	const btnReload = createButton({
		id: `btnReload`,
		name: `R`,
		x: 10,
		y: 10,
		width: 30,
		height: 30,
		fontsize: 20,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_DEFHOVER,
		align: C_ALIGN_CENTER
	}, _ => location.reload(true));
	divRoot.appendChild(btnReload);

	// 製作者表示
	const lnkMaker = createButton({
		id: `lnkMaker`,
		name: `Maker: ${g_headerObj.tuning}`,
		x: 20,
		y: g_sHeight - 45,
		width: g_sWidth / 2 - 10,
		height: C_LNK_HEIGHT,
		fontsize: C_LBL_LNKSIZE,
		normalColor: C_CLR_LNK,
		hoverColor: C_CLR_DEFAULT,
		align: C_ALIGN_LEFT
	}, _ => {
		if (setVal(g_headerObj.creatorUrl, ``, `string`) !== ``) {
			window.open(g_headerObj.creatorUrl, `_blank`);
		}
	});
	divRoot.appendChild(lnkMaker);

	// 作曲者リンク表示
	const lnkArtist = createButton({
		id: `lnkArtist`,
		name: `Artist: ${g_headerObj.artistName}`,
		x: g_sWidth / 2,
		y: g_sHeight - 45,
		width: g_sWidth / 2 - 10,
		height: C_LNK_HEIGHT,
		fontsize: C_LBL_LNKSIZE,
		normalColor: C_CLR_LNK,
		hoverColor: C_CLR_DEFAULT,
		align: C_ALIGN_LEFT
	}, _ => {
		if (setVal(g_headerObj.artistUrl, ``, `string`) !== ``) {
			window.open(g_headerObj.artistUrl, `_blank`);
		}
	});
	divRoot.appendChild(lnkArtist);

	// バージョン描画
	let customVersion = ``;
	if (setVal(g_localVersion, ``, `string`) !== ``) {
		customVersion = ` / ${g_localVersion}`;
	}
	if (setVal(g_localVersion2, ``, `string`) !== ``) {
		customVersion += ` / ${g_localVersion2}`;
	}
	let releaseDate = ``;
	if (setVal(g_headerObj.releaseDate, ``, `string`) !== ``) {
		releaseDate += ` @${g_headerObj.releaseDate}`;
	}
	const lnkVersion = createButton({
		id: `lnkVersion`,
		name: `&copy; 2018-${g_revisedDate.slice(0, 4)} ティックル, CW ${g_version}${g_alphaVersion}${customVersion}${releaseDate}`,
		x: g_sWidth / 4,
		y: g_sHeight - 20,
		width: g_sWidth * 3 / 4 - 10,
		height: 16,
		fontsize: 12,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_TWEET,
		align: C_ALIGN_RIGHT
	}, _ => window.open(`https://github.com/cwtickle/danoniplus`, `_blank`));
	divRoot.appendChild(lnkVersion);

	// キー操作イベント（デフォルト）
	document.onkeydown = evt => {
		// ブラウザ判定
		let setKey;
		if (g_userAgent.indexOf(`firefox`) !== -1) {
			setKey = evt.which;
		} else {
			setKey = event.keyCode;
		}
		if (setKey === 13) {
			clearTimeout(g_timeoutEvtTitleId);
			clearWindow();
			optionInit();
		}
		for (let j = 0; j < C_BLOCK_KEYS.length; j++) {
			if (setKey === C_BLOCK_KEYS[j]) {
				return false;
			}
		}
	}

	document.onkeyup = evt => { }

	divRoot.oncontextmenu = _ => false;
}

/**
 * 警告用ウィンドウ（汎用）を表示
 * @param {string} _id 
 * @param {string} _text 
 */
function makeWarningWindow(_text) {
	let lblWarning;
	if (document.querySelector(`#lblWarning`) === null) {
		lblWarning = getTitleDivLabel(`lblWarning`, `<p>${_text}</p>`, 0, 70);
		lblWarning.style.backgroundColor = `#ffcccc`;
		lblWarning.style.opacity = 0.9;
	} else {
		lblWarning = document.querySelector(`#lblWarning`);
		lblWarning.innerHTML += `<p>${_text}</p>`;
	}
	const len = lblWarning.innerHTML.split(`<br>`).length + lblWarning.innerHTML.split(`<p>`).length - 1;
	const warnHeight = 21 * len;
	lblWarning.style.height = `${warnHeight}px`;
	lblWarning.style.lineHeight = `15px`;
	lblWarning.style.fontSize = `14px`;
	lblWarning.style.color = `#660000`;
	lblWarning.style.textAlign = C_ALIGN_LEFT;
	lblWarning.style.fontFamily = getBasicFont();

	divRoot.appendChild(lblWarning);
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
 * 譜面ヘッダーの分解
 * @param {object} _dosObj 譜面データオブジェクト
 */
function headerConvert(_dosObj) {

	// ヘッダー群の格納先
	const obj = {};

	// 曲名
	obj.musicTitles = [];
	obj.musicTitlesForView = [];
	obj.artistNames = [];
	obj.musicNos = [];

	if (_dosObj.musicTitle !== undefined && _dosObj.musicTitle !== ``) {
		const musicData = _dosObj.musicTitle.split(`$`);

		if (_dosObj.musicNo !== undefined && _dosObj.musicNo !== ``) {
			obj.musicNos = _dosObj.musicNo.split(`$`);
		}

		for (let j = 0; j < musicData.length; j++) {
			const musics = musicData[j].split(`,`);

			if (obj.musicNos.length >= j) {
				obj.musicTitles[j] = musics[0].split(`<br>`).join(` `);
				obj.musicTitlesForView[j] = musics[0].split("<br>");
				obj.artistNames[j] = setVal(musics[1], ``, `string`);
			}
			if (j == 0) {
				obj.musicTitle = musics[0].split(`<br>`).join(` `);
				obj.musicTitleForView = musics[0].split("<br>");
				if (musics.length > 1) {
					obj.artistName = musics[1];
				} else {
					makeWarningWindow(C_MSG_E_0011);
					obj.artistName = `artistName`;
				}
				if (musics.length > 2) {
					obj.artistUrl = musics[2];
					if (musics.length > 3) {
						obj.musicTitles[j] = musics[3].split(`<br>`).join(` `);
						obj.musicTitlesForView[j] = musics[3].split("<br>");
					}
				} else {
					obj.artistUrl = location.href;
				}
			}
		}
	} else {
		makeWarningWindow(C_MSG_E_0012);
		obj.musicTitle = `musicName`;
		obj.artistName = `artistName`;
		obj.artistUrl = location.href;
	}

	// 最小・最大速度の設定
	obj.minSpeed = Math.round(setVal(_dosObj.minSpeed, C_MIN_SPEED, `float`) * 4) / 4;
	obj.maxSpeed = Math.round(setVal(_dosObj.maxSpeed, C_MAX_SPEED, `float`) * 4) / 4;
	if (obj.minSpeed > obj.maxSpeed || obj.minSpeed < 0.5 || obj.maxSpeed < 0.5) {
		obj.minSpeed = C_MIN_SPEED;
		obj.maxSpeed = C_MAX_SPEED;
	}
	g_speeds = [...Array((obj.maxSpeed - obj.minSpeed) * 4 + 1).keys()].map(i => obj.minSpeed + i / 4);


	// 譜面情報
	if (_dosObj.difData !== undefined && _dosObj.difData !== ``) {
		const difs = _dosObj.difData.split(`$`);
		obj.keyLabels = [];
		obj.difLabels = [];
		obj.initSpeeds = [];
		obj.lifeBorders = [];
		obj.lifeRecoverys = [];
		obj.lifeDamages = [];
		obj.lifeInits = [];
		for (let j = 0; j < difs.length; j++) {
			const difDetails = difs[j].split(`,`);
			const border = (difDetails[3]) ? difDetails[3] :
				(g_presetGauge !== undefined && (`Border` in g_presetGauge) ?
					g_presetGauge.Border : `x`);
			const recovery = (difDetails[4]) ? difDetails[4] :
				(g_presetGauge !== undefined && (`Recovery` in g_presetGauge) ?
					g_presetGauge.Recovery : 6);
			const damage = (difDetails[5]) ? difDetails[5] :
				(g_presetGauge !== undefined && (`Damage` in g_presetGauge) ?
					g_presetGauge.Damage : 40);
			const init = (difDetails[6]) ? difDetails[6] :
				(g_presetGauge !== undefined && (`Init` in g_presetGauge) ?
					g_presetGauge.Init : 25);
			const keyLabel = setVal(difDetails[0], `7`, `string`);
			obj.keyLabels.push(g_keyObj.keyTransPattern[keyLabel] || keyLabel);
			obj.difLabels.push(setVal(difDetails[1], `Normal`, `string`));
			obj.initSpeeds.push(setVal(difDetails[2], 3.5, `float`));
			if (border !== `x`) {
				obj.lifeBorders.push(setVal(border, 70, `float`));
			} else {
				obj.lifeBorders.push(`x`);
			}
			obj.lifeRecoverys.push(setVal(recovery, 6, `float`));
			obj.lifeDamages.push(setVal(damage, 40, `float`));
			obj.lifeInits.push(setVal(init, 25, `float`) * 10);
		}
	} else {
		makeWarningWindow(C_MSG_E_0021);
		obj.keyLabels = [`7`];
		obj.difLabels = [`Normal`];
		obj.initSpeeds = [3.5];
		obj.lifeBorders = [`x`];
		obj.lifeRecoverys = [6];
		obj.lifeDamages = [40];
		obj.lifeInits = [250];
	}
	if (obj.initSpeeds[0] !== undefined) {
		g_stateObj.speed = obj.initSpeeds[0];
		g_speedNum = g_speeds.findIndex(speed => speed === g_stateObj.speed);
		if (g_speedNum < 0) {
			g_speedNum = 0;
		}
	}
	if (obj.lifeBorders[0] === `x`) {
		g_stateObj.lifeBorder = 0;
		g_stateObj.lifeMode = C_LFE_SURVIVAL;
		g_gaugeType = C_LFE_SURVIVAL;
	} else {
		g_stateObj.lifeBorder = obj.lifeBorders[0];
		g_stateObj.lifeMode = C_LFE_BORDER;
		g_gaugeType = C_LFE_BORDER;
	}

	// ノルマ制設定
	for (let j = 0; j < g_gaugeOptionObj.border.length; j++) {
		if (g_gaugeOptionObj.border[j] != `SuddenDeath`) {
			getGaugeSetting(_dosObj, g_gaugeOptionObj.border[j], obj);
		}
	}

	g_gauges = JSON.parse(JSON.stringify(g_gaugeOptionObj[g_gaugeType.toLowerCase()]));
	g_stateObj.gauge = g_gauges[g_gaugeNum];

	if (g_gaugeOptionObj[`gauge${g_stateObj.gauge}s`] != undefined) {
		if (g_gaugeOptionObj[`gauge${g_stateObj.gauge}s`].lifeBorders[0] === `x`) {
			g_stateObj.lifeBorder = 0;
		} else {
			g_stateObj.lifeBorder = g_gaugeOptionObj[`gauge${g_stateObj.gauge}s`].lifeBorders[0];
		}
		g_stateObj.lifeRcv = g_gaugeOptionObj[`gauge${g_stateObj.gauge}s`].lifeRecoverys[0];
		g_stateObj.lifeDmg = g_gaugeOptionObj[`gauge${g_stateObj.gauge}s`].lifeDamages[0];
		g_stateObj.lifeInit = g_gaugeOptionObj[`gauge${g_stateObj.gauge}s`].lifeInits[0];
	} else {
		g_stateObj.lifeRcv = obj.lifeRecoverys[0];
		g_stateObj.lifeDmg = obj.lifeDamages[0];
		g_stateObj.lifeInit = obj.lifeInits[0];
	}

	// 初期色情報
	obj.setColorInit = [`#6666ff`, `#99ffff`, `#ffffff`, `#ffff99`, `#ff9966`];
	obj.setColorType1 = [`#6666ff`, `#99ffff`, `#ffffff`, `#ffff99`, `#ff9966`];
	obj.setColorType2 = [`#ffffff`, `#9999ff`, `#ffffff`, `#ffccff`, `#ff9999`];
	obj.setColorDefault = [];

	if (_dosObj.setColor !== undefined && _dosObj.setColor !== ``) {
		obj.setColor = _dosObj.setColor.split(`,`);
		for (let j = 0; j < obj.setColor.length; j++) {
			obj.setColor[j] = obj.setColor[j].replace(`0x`, `#`);
		}
		for (let j = obj.setColor.length; j < obj.setColorInit.length; j++) {
			obj.setColor[j] = obj.setColorInit[j];
		}
	} else {
		obj.setColor = JSON.parse(JSON.stringify(obj.setColorInit));
	}
	obj.setColorDefault = JSON.parse(JSON.stringify(obj.setColor));


	// フリーズアロー初期色情報
	obj.frzColorInit = [`#66ffff`, `#6600ff`, `#cccc33`, `#999933`];
	obj.frzColorType1 = [[`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
	[`#00ffcc`, `#339999`, `#cccc33`, `#999933`],
	[`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
	[`#cc99ff`, `#9966ff`, `#cccc33`, `#999933`],
	[`#ff99cc`, `#ff6699`, `#cccc33`, `#999933`]];
	obj.frzColorType2 = [[`#cccccc`, `#999999`, `#cccc33`, `#999933`],
	[`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
	[`#66ffff`, `#6600ff`, `#cccc33`, `#999933`],
	[`#cc99cc`, `#ff99ff`, `#cccc33`, `#999933`],
	[`#ff6666`, `#ff9999`, `#cccc33`, `#999933`]];
	obj.frzColor = [];
	obj.frzColorDefault = [];

	if (_dosObj.frzColor !== undefined && _dosObj.frzColor !== ``) {
		const tmpFrzColors = _dosObj.frzColor.split(`$`);
		for (let j = 0, len = tmpFrzColors.length; j < len; j++) {
			obj.frzColor[j] = tmpFrzColors[j].split(`,`);

			for (let k = 0; k < obj.frzColor[j].length; k++) {
				obj.frzColor[j][k] = obj.frzColor[j][k].replace(`0x`, `#`);
			}
			for (let k = obj.frzColor[j].length; k < obj.frzColorInit.length; k++) {
				obj.frzColor[j][k] = obj.frzColorInit[k];
			}

			obj.frzColorDefault[j] = JSON.parse(JSON.stringify(obj.frzColor[j]));
		}
		for (let j = tmpFrzColors.length, len = obj.setColorInit.length; j < len; j++) {
			obj.frzColor[j] = JSON.parse(JSON.stringify(obj.frzColor[0]));
			obj.frzColorDefault[j] = JSON.parse(JSON.stringify(obj.frzColor[j]));
		}

	} else {
		for (let j = 0, len = obj.setColorInit.length; j < len; j++) {
			obj.frzColor[j] = JSON.parse(JSON.stringify(obj.frzColorInit));
			obj.frzColorDefault[j] = JSON.parse(JSON.stringify(obj.frzColor[j]));
		}
	}


	// 製作者表示
	if (_dosObj.tuning !== undefined && _dosObj.tuning !== ``) {
		const tunings = _dosObj.tuning.split(`,`);
		obj.tuning = tunings[0];
		if (tunings.length > 1) {
			obj.creatorUrl = tunings[1];
		} else {
			obj.creatorUrl = location.href;
		}
	} else {
		obj.tuning = (g_presetTuning) ? g_presetTuning : `name`;
		obj.creatorUrl = (g_presetTuningUrl) ? g_presetTuningUrl : location.href;
	}

	// 無音のフレーム数
	obj.blankFrame = 200;
	obj.blankFrameDef = 200;
	if (isNaN(parseFloat(_dosObj.blankFrame))) {
	} else {
		obj.blankFrame = parseInt(_dosObj.blankFrame);
		obj.blankFrameDef = parseInt(_dosObj.blankFrame);
	}

	// 開始フレーム数（0以外の場合はフェードインスタート）
	if (_dosObj.startFrame !== undefined) {
		obj.startFrame = _dosObj.startFrame.split(`$`);
	}

	// フェードアウトフレーム数(譜面別)
	if (_dosObj.fadeFrame !== undefined) {
		obj.fadeFrame = _dosObj.fadeFrame.split(`$`);
	}

	// 終了フレーム数
	if (_dosObj.endFrame !== undefined) {
		obj.endFrame = _dosObj.endFrame.split(`$`);
	}

	// タイミング調整
	if (_dosObj.adjustment !== undefined) {
		obj.adjustment = _dosObj.adjustment.split(`$`);
	} else {
		obj.adjustment = [0];
	}

	// 再生速度
	obj.playbackRate = setVal(_dosObj.playbackRate, 1, `float`);

	// 外部jsファイルの指定
	if (_dosObj.customjs !== undefined && _dosObj.customjs !== ``) {
		const customjss = _dosObj.customjs.split(`,`);
		if (customjss.length > 1) {
			obj.customjs2 = customjss[1];
		} else {
			obj.customjs2 = ``;
		}
		obj.customjs = setVal(customjss[0], `danoni_custom.js`, `string`);
	} else {
		obj.customjs = `danoni_custom.js`;
		obj.customjs2 = ``;
	}

	// ステップゾーン位置
	if (isNaN(parseFloat(_dosObj.stepY))) {
		g_stepY = C_STEP_Y;
	} else {
		g_stepY = parseFloat(_dosObj.stepY);
	}
	g_distY = g_sHeight - g_stepY;

	// musicフォルダ設定
	obj.musicFolder = setVal(_dosObj.musicFolder, `music`, `string`);

	// 楽曲URL
	if (_dosObj.musicUrl !== undefined) {
		obj.musicUrls = _dosObj.musicUrl.split(`$`);
	} else {
		makeWarningWindow(C_MSG_E_0031);
	}

	// ハッシュタグ
	if (_dosObj.hashTag !== undefined) {
		obj.hashTag = _dosObj.hashTag;
	}

	// 読込対象の画像を指定(rel:preload)と同じ
	obj.preloadImages = [];
	if (_dosObj.preloadImages !== undefined) {
		const preloadImgs = _dosObj.preloadImages.split(`,`);

		for (let j = 0, len = preloadImgs.length; j < len; j++) {
			if (setVal(preloadImgs[j], ``, `string`) !== ``) {
				obj.preloadImages[j] = preloadImgs[j];
			}
		}
	}

	// フォントの設定
	obj.customFont = setVal(_dosObj.customFont, ``, `string`);

	// 最終演出表示有無（noneで無効化）
	obj.finishView = setVal(_dosObj.finishView, ``, `string`);

	// 更新日
	obj.releaseDate = setVal(_dosObj.releaseDate, ``, `string`);

	// タイトル画面のデフォルト曲名表示の利用有無
	obj.customTitleUse = setVal(_dosObj.customTitleUse,
		(g_presetCustomDesignUse !== undefined && (`title` in g_presetCustomDesignUse) ?
			g_presetCustomDesignUse.title : `false`), `string`);

	// タイトル画面のデフォルト背景矢印の利用有無
	obj.customTitleArrowUse = setVal(_dosObj.customTitleArrowUse,
		(g_presetCustomDesignUse !== undefined && (`titleArrow` in g_presetCustomDesignUse) ?
			g_presetCustomDesignUse.titleArrow : `false`), `string`);

	// デフォルト背景の利用有無
	obj.customBackUse = setVal(_dosObj.customBackUse,
		(g_presetCustomDesignUse !== undefined && (`back` in g_presetCustomDesignUse) ?
			g_presetCustomDesignUse.back : `false`), `string`);

	// デフォルト背景の利用有無（メイン画面のみ適用）
	obj.customBackMainUse = setVal(_dosObj.customBackMainUse,
		(g_presetCustomDesignUse !== undefined && (`backMain` in g_presetCustomDesignUse) ?
			g_presetCustomDesignUse.backMain : `false`), `string`);

	// デフォルトReady表示の利用有無
	obj.customReadyUse = setVal(_dosObj.customReadyUse,
		(g_presetCustomDesignUse !== undefined && (`ready` in g_presetCustomDesignUse) ?
			g_presetCustomDesignUse.ready : `false`), `string`);

	// デフォルト曲名表示のフォントサイズ
	obj.titlesize = setVal(_dosObj.titlesize, ``, `string`);

	// デフォルト曲名表示のフォント名
	obj.titlefont = setVal(_dosObj.titlefont, ``, `string`);

	// デフォルト曲名表示のグラデーション指定css
	obj.titlegrds = [];
	if (_dosObj.titlegrd !== undefined) {
		const tmpTitlegrd = _dosObj.titlegrd.replace(`0x`, `#`);
		obj.titlegrds = tmpTitlegrd.split(`$`);
		obj.titlegrd = setVal(obj.titlegrds[0], ``, `string`);
	}

	// デフォルト曲名表示の表示位置調整
	obj.titlepos = setVal(_dosObj.titlepos, ``, `string`);

	// デフォルト曲名表示の複数行時の縦間隔
	obj.titlelineheight = setVal(_dosObj.titlelineheight, ``, `number`);

	// フリーズアローの始点で通常矢印の判定を行うか(dotさんソース方式)
	obj.frzStartjdgUse = setVal(_dosObj.frzStartjdgUse,
		(typeof g_presetFrzStartjdgUse === `string` ? setVal(g_presetFrzStartjdgUse, `false`, `string`) : `false`), `string`);

	// オプション利用可否設定
	// Motion
	obj.motionUse = setVal(_dosObj.motionUse, setVal(g_presetSettingUse.motion, `true`, `string`), `string`);

	// Shuffle
	obj.shuffleUse = setVal(_dosObj.shuffleUse, setVal(g_presetSettingUse.shuffle, `true`, `string`), `string`);

	// AutoPlay
	obj.autoPlayUse = setVal(_dosObj.autoPlayUse, setVal(g_presetSettingUse.autoPlay, `true`, `string`), `string`);

	// Gauge
	obj.gaugeUse = setVal(_dosObj.gaugeUse, setVal(g_presetSettingUse.gauge, `true`, `string`), `string`);

	// 別キーパターンの使用有無
	obj.transKeyUse = setVal(_dosObj.transKeyUse, `true`, `string`);

	// 背景データの分解 (下記すべてで1セット、改行区切り)
	// [フレーム数,階層,背景パス,class(CSSで別定義),X,Y,width,height,opacity,animationName,animationDuration]
	obj.backTitleData = [];
	obj.backTitleData.length = 0;
	obj.backTitleMaxDepth = -1;
	if (_dosObj.backtitle_data !== undefined) {

		let tmpArrayData = _dosObj.backtitle_data.split(`\r`).join(`\n`);
		tmpArrayData = tmpArrayData.split(`\n`);

		for (let j = 0, len = tmpArrayData.length; j < len; j++) {
			const tmpData = tmpArrayData[j];

			if (tmpData !== undefined && tmpData !== ``) {
				const tmpBackTitleData = tmpData.split(`,`);

				// 値チェックとエスケープ処理
				const tmpFrame = setVal(tmpBackTitleData[0], 200, `number`);
				const tmpDepth = setVal(tmpBackTitleData[1], 0, `number`);
				const tmpPath = escapeHtml(setVal(tmpBackTitleData[2], ``, `string`));
				const tmpClass = escapeHtml(setVal(tmpBackTitleData[3], ``, `string`));
				const tmpX = setVal(tmpBackTitleData[4], 0, `float`);
				const tmpY = setVal(tmpBackTitleData[5], 0, `float`);
				const tmpWidth = setVal(tmpBackTitleData[6], 0, `number`);					// spanタグの場合は font-size
				const tmpHeight = escapeHtml(setVal(tmpBackTitleData[7], ``, `string`));	// spanタグの場合は color(文字列可)
				const tmpOpacity = setVal(tmpBackTitleData[8], 1, `float`);
				const tmpAnimationName = escapeHtml(setVal(tmpBackTitleData[9], C_DIS_NONE, `string`));
				const tmpAnimationDuration = setVal(tmpBackTitleData[10], 0, `number`) / 60;

				if (tmpDepth > obj.backTitleMaxDepth) {
					obj.backTitleMaxDepth = tmpDepth;
				}

				let addFrame = 0;
				if (obj.backTitleData[tmpFrame] === undefined) {
					obj.backTitleData[tmpFrame] = {};
				} else {
					for (let m = 1; ; m++) {
						if (obj.backTitleData[tmpFrame + m] === undefined) {
							obj.backTitleData[tmpFrame + m] = {};
							addFrame = m;
							break;
						}
					}
				}
				obj.backTitleData[tmpFrame + addFrame] = {
					depth: tmpDepth,
					path: tmpPath,
					class: tmpClass,
					left: tmpX,
					top: tmpY,
					width: tmpWidth,
					height: tmpHeight,
					opacity: tmpOpacity,
					animationName: tmpAnimationName,
					animationDuration: tmpAnimationDuration
				};
			}
		}
	}

	return obj;
}

/**
 * ゲージ別個別設定の取得
 * @param {object} _dosObj 
 * @param {string} _name 
 * @param {number} _headerObj
 */
function getGaugeSetting(_dosObj, _name, _headerObj) {

	const difLength = _headerObj.keyLabels.length;

	if (_dosObj[`gauge${_name}`] !== undefined && _dosObj[`gauge${_name}`] !== ``) {
		const gauges = _dosObj[`gauge${_name}`].split(`$`);

		g_gaugeOptionObj[`gauge${_name}s`] = {
			lifeBorders: [],
			lifeRecoverys: [],
			lifeDamages: [],
			lifeInits: []
		};

		for (let j = 0; j < gauges.length; j++) {
			const gaugeDetails = gauges[j].split(`,`);
			if (gaugeDetails[0] === `x`) {
				g_gaugeOptionObj[`gauge${_name}s`].lifeBorders.push(`x`);
			} else {
				g_gaugeOptionObj[`gauge${_name}s`].lifeBorders.push(setVal(gaugeDetails[0], 70, `float`));
			}
			g_gaugeOptionObj[`gauge${_name}s`].lifeRecoverys.push(setVal(gaugeDetails[1], 2, `float`));
			g_gaugeOptionObj[`gauge${_name}s`].lifeDamages.push(setVal(gaugeDetails[2], 7, `float`));
			g_gaugeOptionObj[`gauge${_name}s`].lifeInits.push(C_VAL_MAXLIFE * setVal(gaugeDetails[3], 25, `float`) / 100);
		}
		if (gauges.length < difLength) {
			for (let j = gauges.length; j < difLength; j++) {
				g_gaugeOptionObj[`gauge${_name}s`].lifeBorders.push(_headerObj.lifeBorders[j]);
				g_gaugeOptionObj[`gauge${_name}s`].lifeRecoverys.push(_headerObj.lifeRecoverys[j]);
				g_gaugeOptionObj[`gauge${_name}s`].lifeDamages.push(_headerObj.lifeDamages[j]);
				g_gaugeOptionObj[`gauge${_name}s`].lifeInits.push(_headerObj.lifeInits[j]);
			}
		}
	} else if (g_presetGaugeCustom[_name]) {
		g_gaugeOptionObj[`gauge${_name}s`] = {
			lifeBorders: [],
			lifeRecoverys: [],
			lifeDamages: [],
			lifeInits: []
		};
		for (let j = 0; j < difLength; j++) {
			if (g_presetGaugeCustom[_name].Border === `x`) {
				g_gaugeOptionObj[`gauge${_name}s`].lifeBorders.push(`x`);
			} else {
				g_gaugeOptionObj[`gauge${_name}s`].lifeBorders.push(setVal(g_presetGaugeCustom[_name].Border, 70, `float`));
			}
			g_gaugeOptionObj[`gauge${_name}s`].lifeRecoverys.push(setVal(g_presetGaugeCustom[_name].Recovery, 2, `float`));
			g_gaugeOptionObj[`gauge${_name}s`].lifeDamages.push(setVal(g_presetGaugeCustom[_name].Damage, 7, `float`));
			g_gaugeOptionObj[`gauge${_name}s`].lifeInits.push(C_VAL_MAXLIFE * setVal(g_presetGaugeCustom[_name].Init, 25, `float`) / 100);
		}
	}
}

/**
 * 一時的な追加キーの設定
 * @param {object} _dosObj 
 */
function keysConvert(_dosObj) {

	let newKey = ``;

	if (_dosObj.keyExtraList !== undefined) {
		const keyExtraList = _dosObj.keyExtraList.split(`,`);
		let tmpKeyCtrl = [];
		let tmpKeyPtn = [];
		let tmpDivPtn = [];
		let tmpMinPatterns = 1;

		for (let j = 0; j < keyExtraList.length; j++) {
			newKey = keyExtraList[j];

			// 矢印色パターン (colorX_Y)
			if (_dosObj[`color${newKey}`] !== undefined) {
				const tmpColors = _dosObj[`color${newKey}`].split(`$`);
				if (tmpColors.length > 0) {
					for (let k = 0, len = tmpColors.length; k < len; k++) {
						if (setVal(tmpColors[k], ``, `string`) === `` && g_keyObj[`color${newKey}_${k}`] !== undefined) {
							continue;
						}
						g_keyObj[`color${newKey}_${k}`] = tmpColors[k].split(`,`);
						for (let m = 0, len2 = g_keyObj[`color${newKey}_${k}`].length; m < len2; m++) {
							g_keyObj[`color${newKey}_${k}`][m] = Number(g_keyObj[`color${newKey}_${k}`][m]);
						}
					}
					tmpMinPatterns = tmpColors.length;
				}
			} else if (g_keyObj[`color${newKey}_0`] === undefined) {
				makeWarningWindow(C_MSG_E_0101.split(`{0}`).join(newKey));
			}

			// 読込変数の接頭辞 (charaX_Y)
			if (_dosObj[`chara${newKey}`] !== undefined) {
				const tmpCharas = _dosObj[`chara${newKey}`].split(`$`);
				if (tmpCharas.length > 0) {
					for (let k = 0, len = tmpCharas.length; k < len; k++) {
						if (setVal(tmpCharas[k], ``, `string`) === `` && g_keyObj[`chara${newKey}_${k}`] !== undefined) {
							continue;
						}
						g_keyObj[`chara${newKey}_${k}`] = tmpCharas[k].split(`,`);
						g_keyObj[`chara${newKey}_${k}d`] = tmpCharas[k].split(`,`);
					}
				}
			} else if (g_keyObj[`chara${newKey}_0`] === undefined) {
				makeWarningWindow(C_MSG_E_0102.split(`{0}`).join(newKey));
			}

			// 各キーの区切り位置 (divX_Y)
			if (_dosObj[`div${newKey}`] !== undefined) {
				const tmpDivs = _dosObj[`div${newKey}`].split(`$`);
				if (tmpDivs.length > 0) {
					for (let k = 0, len = tmpDivs.length; k < len; k++) {
						tmpDivPtn = tmpDivs[k].split(`,`);

						if (setVal(tmpDivPtn[0], -1, `number`) === -1) {
							if (setVal(g_keyObj[`div${newKey}_${k}`], -1, `number`) !== -1) {
								continue;
							} else if (g_keyObj[`chara${newKey}_0`] !== undefined) {
								g_keyObj[`div${newKey}_${k}`] = g_keyObj[`chara${newKey}_0`].length;
							}
						} else {
							g_keyObj[`div${newKey}_${k}`] = setVal(tmpDivPtn[0], g_keyObj[`chara${newKey}_0`].length, `number`);
						}

						// ステップゾーン位置の最終番号
						if (tmpDivPtn.length > 1) {
							g_keyObj[`divMax${newKey}_${k}`] = setVal(tmpDivPtn[1], -1, `number`);
						}
					}
				}
			}

			// 矢印の回転量指定、キャラクタパターン (StepRtnX_Y)
			if (_dosObj[`stepRtn${newKey}`] !== undefined) {
				const tmpStepRtns = _dosObj[`stepRtn${newKey}`].split(`$`);
				if (tmpStepRtns.length > 0) {
					for (let k = 0, len = tmpStepRtns.length; k < len; k++) {
						if (setVal(tmpStepRtns[k], ``, `string`) === `` && g_keyObj[`stepRtn${newKey}_${k}`] !== undefined) {
							continue;
						}
						g_keyObj[`stepRtn${newKey}_${k}`] = tmpStepRtns[k].split(`,`);
						g_keyObj[`stepRtn${newKey}_${k}d`] = tmpStepRtns[k].split(`,`);

						for (let m = 0, lenc = g_keyObj[`stepRtn${newKey}_${k}`].length; m < lenc; m++) {
							if (isNaN(Number(g_keyObj[`stepRtn${newKey}_${k}`][m]))) {
							} else {
								g_keyObj[`stepRtn${newKey}_${k}`][m] = parseFloat(g_keyObj[`stepRtn${newKey}_${k}`][m]);
								g_keyObj[`stepRtn${newKey}_${k}d`][m] = g_keyObj[`stepRtn${newKey}_${k}`][m];
							}
						}
					}
				}
			} else if (g_keyObj[`stepRtn${newKey}_0`] === undefined) {
				makeWarningWindow(C_MSG_E_0103.split(`{0}`).join(newKey));
			}

			// ステップゾーン位置 (posX_Y)
			if (_dosObj[`pos${newKey}`] !== undefined) {
				const tmpPoss = _dosObj[`pos${newKey}`].split(`$`);
				if (tmpPoss.length > 0) {
					for (let k = 0, len = tmpPoss.length; k < len; k++) {
						if (setVal(tmpPoss[k], ``, `string`) === `` && g_keyObj[`pos${newKey}_${k}`] !== undefined) {
							continue;
						}
						g_keyObj[`pos${newKey}_${k}`] = tmpPoss[k].split(`,`);
						for (let m = 0, len2 = g_keyObj[`pos${newKey}_${k}`].length; m < len2; m++) {
							g_keyObj[`pos${newKey}_${k}`][m] = Number(g_keyObj[`pos${newKey}_${k}`][m]);
						}

						if (g_keyObj[`divMax${newKey}_${k}`] === undefined || g_keyObj[`divMax${newKey}_${k}`] === -1) {
							const posLength = g_keyObj[`pos${newKey}_${k}`].length;
							g_keyObj[`divMax${newKey}_${k}`] = g_keyObj[`pos${newKey}_${k}`][posLength - 1] + 1;
						}
					}
				}

			} else {
				for (let k = 0; k < tmpMinPatterns; k++) {
					if (g_keyObj[`color${newKey}_${k}`] !== undefined) {
						g_keyObj[`pos${newKey}_${k}`] = [];
						for (let m = 0; m < g_keyObj[`color${newKey}_${k}`].length; m++) {
							g_keyObj[`pos${newKey}_${k}`][m] = m;
						}
					}
				}
			}

			// キーコンフィグ (keyCtrlX_Y)
			if (_dosObj[`keyCtrl${newKey}`] !== undefined) {
				const tmpKeyCtrls = _dosObj[`keyCtrl${newKey}`].split(`$`);

				if (tmpKeyCtrls.length > 0) {
					for (let p = 0, len = tmpKeyCtrls.length; p < len; p++) {
						if (setVal(tmpKeyCtrls[p], ``, `string`) === `` && g_keyObj[`keyCtrl${newKey}_${p}`] !== undefined) {
							continue;
						}
						tmpKeyCtrl = tmpKeyCtrls[p].split(`,`);

						g_keyObj[`keyCtrl${newKey}_${p}`] = [];
						g_keyObj[`keyCtrl${newKey}_${p}d`] = [];

						for (let k = 0; k < tmpKeyCtrl.length; k++) {
							tmpKeyPtn = tmpKeyCtrl[k].split(`/`);
							g_keyObj[`keyCtrl${newKey}_${p}`][k] = [];
							g_keyObj[`keyCtrl${newKey}_${p}d`][k] = [];

							for (let m = 0; m < tmpKeyPtn.length; m++) {
								g_keyObj[`keyCtrl${newKey}_${p}`][k][m] = Number(tmpKeyPtn[m]);
								g_keyObj[`keyCtrl${newKey}_${p}d`][k][m] = Number(tmpKeyPtn[m]);
							}
						}
					}
				}
			} else if (g_keyObj[`keyCtrl${newKey}_0`] === undefined) {
				makeWarningWindow(C_MSG_E_0104.split(`{0}`).join(newKey));
			}

			// ステップゾーン間隔 (blankX_Y)
			if (_dosObj[`blank${newKey}`] !== undefined) {
				const tmpBlanks = _dosObj[`blank${newKey}`].split(`$`);
				if (tmpBlanks.length > 0) {
					for (let k = 0, len = tmpBlanks.length; k < len; k++) {
						if (isNaN(Number(tmpBlanks[k]))) {
						} else {
							g_keyObj[`blank${newKey}_${k}`] = parseFloat(tmpBlanks[k]);
						}
					}
				}
			}

			// 別キーフラグ (transKeyX_Y)
			if (_dosObj[`transKey${newKey}`] !== undefined) {
				const tmpTransKeys = _dosObj[`transKey${newKey}`].split(`$`);
				if (tmpTransKeys.length > 0) {
					for (let k = 0, len = tmpTransKeys.length; k < len; k++) {
						g_keyObj[`transKey${newKey}_${k}`] = setVal(tmpTransKeys[k], ``, `string`);
					}
				}
			}

			// シャッフルグループ (shuffleX_Y)
			if (_dosObj[`shuffle${newKey}`] !== undefined) {
				const tmpshuffles = _dosObj[`shuffle${newKey}`].split(`$`);
				for (let k = 0; k < tmpshuffles.length; k++) {
					g_keyObj[`shuffle${newKey}_${k}`] = tmpshuffles[k].split(`,`).map(n => parseInt(n, 10));
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

	drawDefaultBackImage(``);
	const divRoot = document.querySelector(`#divRoot`);

	// タイトル文字描画
	const lblTitle = getTitleDivLabel(`lblTitle`,
		`<span style=color:#6666ff;font-size:40px>S</span>ETTINGS`, 0, 15);
	divRoot.appendChild(lblTitle);

	// オプションボタン用の設置
	createOptionWindow(`divRoot`);

	// ユーザカスタムイベント(初期)
	if (typeof customOptionInit === `function`) {
		customOptionInit();
		if (typeof customOptionInit2 === `function`) {
			customOptionInit2();
		}
	}

	// 戻るボタン描画
	const btnBack = createButton({
		id: `btnBack`,
		name: `Back`,
		x: 0,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_BACK,
		align: C_ALIGN_CENTER
	}, _ => {
		// タイトル画面へ戻る
		clearWindow();
		titleInit();
	});
	divRoot.appendChild(btnBack);

	// キーコンフィグボタン描画
	const btnKeyConfig = createButton({
		id: `btnKeyConfig`,
		name: `KeyConfig`,
		x: g_sWidth / 3,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_SETTING,
		align: C_ALIGN_CENTER
	}, _ => {
		// キーコンフィグ画面へ遷移
		g_kcType = `Main`;
		clearWindow();
		keyConfigInit();
	});
	divRoot.appendChild(btnKeyConfig);

	// 進むボタン描画
	const btnPlay = createButton({
		id: `btnPlay`,
		name: `Play`,
		x: g_sWidth / 3 * 2,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_NEXT,
		align: C_ALIGN_CENTER
	}, _ => {
		clearWindow();
		loadMusic();
	});
	divRoot.appendChild(btnPlay);

	// SETTING-DISPLAYボタン描画
	const btnDisplay = createButton({
		id: `btnDisplay`,
		name: `>`,
		x: g_sWidth / 2 + 175 - C_LEN_SETMINI_WIDTH / 2,
		y: 25,
		width: C_LEN_SETMINI_WIDTH,
		height: 40,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_SETTING,
		align: C_ALIGN_CENTER
	}, _ => {
		// タイトル画面へ戻る
		clearWindow();
		settingsDisplayInit();
	});
	divRoot.appendChild(btnDisplay);

	// キー操作イベント（デフォルト）
	document.onkeydown = evt => {
		// ブラウザ判定
		let setKey;
		if (g_userAgent.indexOf(`firefox`) !== -1) {
			setKey = evt.which;
		} else {
			setKey = event.keyCode;
		}
		if (setKey === 13) {
			clearWindow();
			loadMusic();
		}
		for (let j = 0; j < C_BLOCK_KEYS.length; j++) {
			if (setKey === C_BLOCK_KEYS[j]) {
				return false;
			}
		}
	}
	document.onkeyup = evt => { }

	// データセーブフラグの切替
	const btnSave = createButton({
		id: `btnSave`,
		name: `Data Save`,
		x: 0,
		y: 5,
		width: g_sWidth / 5,
		height: 16,
		fontsize: 12,
		normalColor: `#111111`,
		hoverColor: C_CLR_RESET,
		align: C_ALIGN_CENTER
	}, _ => {
		if (g_stateObj.dataSaveFlg) {
			g_stateObj.dataSaveFlg = false;
			btnSave.style.color = `#666666`;
			btnSave.style.borderColor = `#000000 #333333`;
		} else {
			g_stateObj.dataSaveFlg = true;
			btnSave.style.color = `#cccccc`;
			btnSave.style.borderColor = `#000000 #cccccc`;
		}
	});
	divRoot.appendChild(btnSave);
	btnSave.style.color = (g_stateObj.dataSaveFlg ? `#ffffff` : `#666666`);
	btnSave.style.borderStyle = `solid`;
	btnSave.style.borderColor = (g_stateObj.dataSaveFlg ? `#000000 #cccccc` : `#000000 #333333`);
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
	}
}

/**
 * 設定・オプション画面のラベル・ボタン処理の描画
 * @param {Object} _sprite 基準とするスプライト(ここで指定する座標は、そのスプライトからの相対位置)
 */
function createOptionWindow(_sprite) {

	// 各ボタン用のスプライトを作成
	const optionsprite = createSprite(_sprite, `optionsprite`, (g_sWidth - 400) / 2, 85 + (g_sHeight - 500) / 2, 400, 300);

	// ---------------------------------------------------
	// 難易度 (Difficulty)
	// 縦位置: 0 
	const setNoDifficulty = 0;
	const lblDifficulty = createDivLabel(`lblDifficulty`, 0, C_LEN_SETLBL_HEIGHT * setNoDifficulty,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETDIFLBL, C_CLR_TITLE,
		`<span style=color:#ff9999>D</span>ifficulty`);
	optionsprite.appendChild(lblDifficulty);

	const lnkDifficulty = makeSettingLblButton(`lnkDifficulty`,
		``, setNoDifficulty, _ => {
			g_stateObj.scoreId = (g_stateObj.scoreId < g_headerObj.keyLabels.length - 1 ? ++g_stateObj.scoreId : 0);
			setDifficulty(true);
		});
	lnkDifficulty.oncontextmenu = _ => {
		g_stateObj.scoreId = (g_stateObj.scoreId > 0 ? --g_stateObj.scoreId : g_headerObj.keyLabels.length - 1);
		setDifficulty(true);
		return false;
	}
	optionsprite.appendChild(lnkDifficulty);

	// 右回し・左回しボタン
	optionsprite.appendChild(makeMiniButton(`lnkDifficulty`, `R`, setNoDifficulty, _ => {
		g_stateObj.scoreId = (g_stateObj.scoreId < g_headerObj.keyLabels.length - 1 ? ++g_stateObj.scoreId : 0);
		setDifficulty(true);
	}));
	optionsprite.appendChild(makeMiniButton(`lnkDifficulty`, `L`, setNoDifficulty, _ => {
		g_stateObj.scoreId = (g_stateObj.scoreId > 0 ? --g_stateObj.scoreId : g_headerObj.keyLabels.length - 1);
		setDifficulty(true);
	}));

	// ---------------------------------------------------
	// ハイスコア機能実装時に使用予定のスペース
	// 縦位置: 1

	// ---------------------------------------------------
	// 速度(Speed)
	// 縦位置: 2  短縮ショートカットあり
	const setNoSpeed = 2;
	const lblSpeed = createDivLabel(`lblSpeed`, 0, C_LEN_SETLBL_HEIGHT * setNoSpeed,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		`<span style=color:#ffff99>S</span>peed`);
	optionsprite.appendChild(lblSpeed);

	const lnkSpeed = makeSettingLblButton(`lnkSpeed`, ``, setNoSpeed, _ => {
		setSetting(1, `speed`, ` x`);
	});
	lnkSpeed.oncontextmenu = _ => {
		setSetting(-1, `speed`, ` x`);
		return false;
	}
	optionsprite.appendChild(lnkSpeed);

	// 早右回し・早左回しボタン
	optionsprite.appendChild(makeMiniButton(`lnkSpeed`, `R`, setNoSpeed, _ => {
		setSetting(4, `speed`, ` x`);
	}));
	optionsprite.appendChild(makeMiniButton(`lnkSpeed`, `L`, setNoSpeed, _ => {
		setSetting(-4, `speed`, ` x`);
	}));

	// 右回し・左回しボタン
	optionsprite.appendChild(makeMiniButton(`lnkSpeed`, `RR`, setNoSpeed, _ => {
		setSetting(1, `speed`, ` x`);
	}));
	optionsprite.appendChild(makeMiniButton(`lnkSpeed`, `LL`, setNoSpeed, _ => {
		setSetting(-1, `speed`, ` x`);
	}));

	// ---------------------------------------------------
	// 速度モーション (Motion)
	// 縦位置: 3
	const setNoMotion = 3;
	const lblMotion = createDivLabel(`lblMotion`, 0, C_LEN_SETLBL_HEIGHT * setNoMotion,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		`<span style=color:#eeff99>M</span>otion`);
	optionsprite.appendChild(lblMotion);

	if (g_headerObj.motionUse !== `false`) {
		const lnkMotion = makeSettingLblButton(`lnkMotion`, g_stateObj.motion, setNoMotion, _ => {
			setSetting(1, `motion`);
		});
		lnkMotion.oncontextmenu = _ => {
			setSetting(-1, `motion`);
			return false;
		}
		optionsprite.appendChild(lnkMotion);

		// 右回し・左回しボタン
		optionsprite.appendChild(makeMiniButton(`lnkMotion`, `R`, setNoMotion, _ => {
			setSetting(1, `motion`);
		}));
		optionsprite.appendChild(makeMiniButton(`lnkMotion`, `L`, setNoMotion, _ => {
			setSetting(-1, `motion`);
		}));
	} else {
		lblMotion.style.color = `#666666`;
		optionsprite.appendChild(makeDisabledLabel(`lnkMotion`, setNoMotion, g_stateObj.motion));
	}

	// ---------------------------------------------------
	// リバース (Reverse)
	// 縦位置: 4
	const setNoReverse = 4;
	const lblReverse = createDivLabel(`lblReverse`, 0, C_LEN_SETLBL_HEIGHT * setNoReverse,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		`<span style=color:#ddff99>R</span>everse`);
	optionsprite.appendChild(lblReverse);

	const lnkReverse = makeSettingLblButton(`lnkReverse`, ``, setNoReverse, _ => {
		setSetting(1, `reverse`);
	});
	lnkReverse.oncontextmenu = _ => {
		setSetting(-1, `reverse`);
		return false;
	}
	optionsprite.appendChild(lnkReverse);

	// 右回し・左回しボタン
	optionsprite.appendChild(makeMiniButton(`lnkReverse`, `R`, setNoReverse, _ => {
		setSetting(1, `reverse`);
	}));
	optionsprite.appendChild(makeMiniButton(`lnkReverse`, `L`, setNoReverse, _ => {
		setSetting(-1, `reverse`);
	}));

	// ---------------------------------------------------
	// ミラー・ランダム (Shuffle)
	// 縦位置: 5.5
	const setNoShuffle = 5.5;
	const lblShuffle = createDivLabel(`lblShuffle`, 0, C_LEN_SETLBL_HEIGHT * setNoShuffle,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		`<span style=color:#99ff99>S</span>huffle`);
	optionsprite.appendChild(lblShuffle);

	if (g_headerObj.shuffleUse !== `false`) {
		const lnkShuffle = makeSettingLblButton(`lnkShuffle`, g_stateObj.shuffle, setNoShuffle, _ => {
			setSetting(1, `shuffle`);
		});
		lnkShuffle.oncontextmenu = _ => {
			setSetting(-1, `shuffle`);
			return false;
		}
		optionsprite.appendChild(lnkShuffle);

		// 右回し・左回しボタン
		optionsprite.appendChild(makeMiniButton(`lnkShuffle`, `R`, setNoShuffle, _ => {
			setSetting(1, `shuffle`);
		}));
		optionsprite.appendChild(makeMiniButton(`lnkShuffle`, `L`, setNoShuffle, _ => {
			setSetting(-1, `shuffle`);
		}));
	} else {
		lblShuffle.style.color = `#666666`;
		optionsprite.appendChild(makeDisabledLabel(`lnkShuffle`, setNoShuffle, g_stateObj.shuffle));
	}

	// ---------------------------------------------------
	// 鑑賞モード設定 (AutoPlay)
	// 縦位置: 6.5
	const setNoAutoPlay = 6.5;
	const lblAutoPlay = createDivLabel(`lblAutoPlay`, 0, C_LEN_SETLBL_HEIGHT * setNoAutoPlay,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		`<span style=color:#99ffbb>A</span>utoPlay`);
	optionsprite.appendChild(lblAutoPlay);

	if (g_headerObj.autoPlayUse !== `false`) {
		const lnkAutoPlay = makeSettingLblButton(`lnkAutoPlay`, g_stateObj.autoPlay, setNoAutoPlay, _ => {
			setSetting(1, `autoPlay`);
		});
		lnkAutoPlay.oncontextmenu = _ => {
			setSetting(-1, `autoPlay`);
			return false;
		}
		optionsprite.appendChild(lnkAutoPlay);

		// 右回し・左回しボタン
		optionsprite.appendChild(makeMiniButton(`lnkAutoPlay`, `R`, setNoAutoPlay, _ => {
			setSetting(1, `autoPlay`);
		}));
		optionsprite.appendChild(makeMiniButton(`lnkAutoPlay`, `L`, setNoAutoPlay, _ => {
			setSetting(-1, `autoPlay`);
		}));
	} else {
		lblAutoPlay.style.color = `#666666`;
		optionsprite.appendChild(makeDisabledLabel(`lnkAutoPlay`, setNoAutoPlay, g_stateObj.autoPlay));
	}

	// ---------------------------------------------------
	// ゲージ設定 (Gauge)
	// 縦位置: 7.5
	const setNoGauge = 7.5;
	const lblGauge = createDivLabel(`lblGauge`, 0, C_LEN_SETLBL_HEIGHT * setNoGauge,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		`<span style=color:#99ffdd>G</span>auge`);
	optionsprite.appendChild(lblGauge);

	// ゲージ設定詳細　縦位置: ゲージ設定+1
	const lblGauge2 = createDivLabel(`lblGauge2`, C_LEN_SETLBL_LEFT, C_LEN_SETLBL_HEIGHT * (setNoGauge + 1) - 3,
		C_LEN_SETLBL_WIDTH, C_LEN_SETLBL_HEIGHT, 11, C_CLR_TITLE, ``);
	optionsprite.appendChild(lblGauge2);

	if (g_headerObj.gaugeUse !== `false`) {
		const lnkGauge = makeSettingLblButton(`lnkGauge`,
			``, setNoGauge, _ => {
				setGauge(1);
			});
		lnkGauge.oncontextmenu = _ => {
			setGauge(-1);
			return false;
		}
		optionsprite.appendChild(lnkGauge);

		// 右回し・左回しボタン
		optionsprite.appendChild(makeMiniButton(`lnkGauge`, `R`, setNoGauge, _ => {
			setGauge(1);
		}));
		optionsprite.appendChild(makeMiniButton(`lnkGauge`, `L`, setNoGauge, _ => {
			setGauge(-1);
		}));
	} else {
		lblGauge.style.color = `#666666`;
		optionsprite.appendChild(makeDisabledLabel(`lnkGauge`, setNoGauge, g_stateObj.gauge));
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
		document.querySelector(`#lblGauge2`).innerHTML = gaugeFormat(g_stateObj.lifeMode, g_stateObj.lifeBorder, g_stateObj.lifeRcv, g_stateObj.lifeDmg, g_stateObj.lifeInit);
	}

	/**
	 * ゲージ設定の切替処理
	 * @param {number} _gaugeNum 
	 */
	function gaugeChange(_gaugeNum) {
		g_stateObj.lifeMode = g_gaugeOptionObj[`type${g_gaugeType}`][_gaugeNum];

		g_stateObj.lifeBorder = g_gaugeOptionObj[`clear${g_gaugeType}`][_gaugeNum];
		g_stateObj.lifeInit = g_gaugeOptionObj[`init${g_gaugeType}`][_gaugeNum];
		g_stateObj.lifeRcv = g_gaugeOptionObj[`rcv${g_gaugeType}`][_gaugeNum];
		g_stateObj.lifeDmg = g_gaugeOptionObj[`dmg${g_gaugeType}`][_gaugeNum];

		if (_gaugeNum === 0) {
			if (setVal(g_headerObj.lifeBorders[g_stateObj.scoreId], ``, `string`) !== ``) {
				if (g_headerObj.lifeBorders[g_stateObj.scoreId] === `x`) {
					g_gaugeType = C_LFE_SURVIVAL;
					g_stateObj.lifeBorder = 0;
					g_stateObj.lifeMode = C_LFE_SURVIVAL;
				} else {
					g_gaugeType = C_LFE_BORDER;
					g_stateObj.lifeBorder = g_headerObj.lifeBorders[g_stateObj.scoreId];
					g_stateObj.lifeMode = C_LFE_BORDER;
				}
				g_gauges = JSON.parse(JSON.stringify(g_gaugeOptionObj[g_gaugeType.toLowerCase()]));
				g_stateObj.gauge = g_gauges[g_gaugeNum];
			}
			if (setVal(g_headerObj.lifeInits[g_stateObj.scoreId], ``, `number`) !== ``) {
				g_stateObj.lifeInit = g_headerObj.lifeInits[g_stateObj.scoreId];
			}
			if (setVal(g_headerObj.lifeRecoverys[g_stateObj.scoreId], ``, `number`) !== ``) {
				g_stateObj.lifeRcv = g_headerObj.lifeRecoverys[g_stateObj.scoreId];
			}
			if (setVal(g_headerObj.lifeDamages[g_stateObj.scoreId], ``, `number`) !== ``) {
				g_stateObj.lifeDmg = g_headerObj.lifeDamages[g_stateObj.scoreId];
			}

		} else if (g_stateObj.gauge == `Light` || g_stateObj.gauge == `Easy`) {
			// ゲージ設定がLight/Easyのとき、Original/Normalに合わせて設定を見直す

			if (setVal(g_headerObj.lifeInits[g_stateObj.scoreId], ``, `number`) !== ``) {
				g_stateObj.lifeInit = g_headerObj.lifeInits[g_stateObj.scoreId];
			}
			if (setVal(g_headerObj.lifeRecoverys[g_stateObj.scoreId], ``, `number`) !== ``) {
				g_stateObj.lifeRcv = g_headerObj.lifeRecoverys[g_stateObj.scoreId] * 2;
			}
			if (setVal(g_headerObj.lifeDamages[g_stateObj.scoreId], ``, `number`) !== ``) {
				g_stateObj.lifeDmg = g_headerObj.lifeDamages[g_stateObj.scoreId];
			}
		}

		// ゲージ設定別に個別設定した場合はここで設定を上書き
		const tmpScoreId = g_stateObj.scoreId;

		if (g_gaugeOptionObj[`gauge${g_stateObj.gauge}s`] != undefined) {
			const tmpGaugeObj = g_gaugeOptionObj[`gauge${g_stateObj.gauge}s`];

			if (setVal(tmpGaugeObj.lifeBorders[tmpScoreId], `string`) != ``) {
				if (tmpGaugeObj.lifeBorders[tmpScoreId] === `x`) {
					g_stateObj.lifeBorder = 0;
				} else {
					g_stateObj.lifeBorder = tmpGaugeObj.lifeBorders[tmpScoreId];
				}
			}
			if (setVal(tmpGaugeObj.lifeRecoverys[tmpScoreId], `float`) != ``) {
				g_stateObj.lifeRcv = tmpGaugeObj.lifeRecoverys[tmpScoreId];
			}
			if (setVal(tmpGaugeObj.lifeDamages[tmpScoreId], `float`) != ``) {
				g_stateObj.lifeDmg = tmpGaugeObj.lifeDamages[tmpScoreId];
			}
			if (setVal(tmpGaugeObj.lifeInits[tmpScoreId], `float`) != ``) {
				g_stateObj.lifeInit = tmpGaugeObj.lifeInits[tmpScoreId];
			}
		}
	}

	/**
	 * ゲージ設定の詳細表示を整形
	 */
	function gaugeFormat(_mode, _border, _rcv, _dmg, _init) {
		const initVal = C_VAL_MAXLIFE * _init / 1000;
		const borderVal = C_VAL_MAXLIFE * _border / 100;

		if (_mode === C_LFE_BORDER) {
			if (borderVal !== 0) {
				return `[Start:${initVal}, Border:${borderVal}, <br>Rcv:${_rcv}, Dmg:${_dmg}]`;
			}
		}
		return `[Start:${initVal}, Rcv:${_rcv}, Dmg:${_dmg}]`;
	}

	// ---------------------------------------------------
	// タイミング調整 (Adjustment)
	// 縦位置: 10  短縮ショートカットあり
	const setNoAdjustment = 10;
	const lblAdjustment = createDivLabel(`lblAdjustment`, 0, C_LEN_SETLBL_HEIGHT * setNoAdjustment,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		`<span style=color:#99ffff>A</span>djustment`);
	optionsprite.appendChild(lblAdjustment);

	const lnkAdjustment = makeSettingLblButton(`lnkAdjustment`, g_stateObj.adjustment, setNoAdjustment, _ => {
		setSetting(1, `adjustment`);
	});
	lnkAdjustment.oncontextmenu = _ => {
		setSetting(-1, `adjustment`);
		return false;
	}
	optionsprite.appendChild(lnkAdjustment);

	// 早右回し・早左回しボタン
	optionsprite.appendChild(makeMiniButton(`lnkAdjustment`, `R`, setNoAdjustment, _ => {
		setSetting(5, `adjustment`);
	}));
	optionsprite.appendChild(makeMiniButton(`lnkAdjustment`, `L`, setNoAdjustment, _ => {
		setSetting(-5, `adjustment`);
	}));
	// 右回し・左回しボタン
	optionsprite.appendChild(makeMiniButton(`lnkAdjustment`, `RR`, setNoAdjustment, _ => {
		setSetting(1, `adjustment`);
	}));
	optionsprite.appendChild(makeMiniButton(`lnkAdjustment`, `LL`, setNoAdjustment, _ => {
		setSetting(-1, `adjustment`);
	}));

	// ---------------------------------------------------
	// フェードイン (Fadein)
	// 縦位置: 11 スライダーあり
	const setNoFadein = 11;
	const lblFadein = createDivLabel(`lblFadein`, 0, C_LEN_SETLBL_HEIGHT * setNoFadein,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		`<span style=color:#99eeff>F</span>adein`);
	optionsprite.appendChild(lblFadein);

	const lnkFadein = createDivLabel(`lblFadein`, C_LEN_SETLBL_LEFT, C_LEN_SETLBL_HEIGHT * setNoFadein,
		C_LEN_SETLBL_WIDTH, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TEXT, `${g_stateObj.fadein}%`);
	optionsprite.appendChild(lnkFadein);

	// 右回し・左回しボタン
	optionsprite.appendChild(makeMiniButton(`lnkFadein`, `R`, setNoFadein, _ => {
		g_stateObj.fadein = (g_stateObj.fadein === 99 ? 0 : g_stateObj.fadein + 1);
		fadeinSlider.value = g_stateObj.fadein;
		lnkFadein.innerHTML = `${g_stateObj.fadein}%`;
	}));
	optionsprite.appendChild(makeMiniButton(`lnkFadein`, `L`, setNoFadein, _ => {
		g_stateObj.fadein = (g_stateObj.fadein === 0 ? 99 : g_stateObj.fadein - 1);
		fadeinSlider.value = g_stateObj.fadein;
		lnkFadein.innerHTML = `${g_stateObj.fadein}%`;
	}));

	// フェードインのスライダー処理
	let addXPos = 0;
	let addYPos = 0;
	if (g_userAgent.indexOf(`firefox`) !== -1) {
		addXPos = -8;
		addYPos = 1;
	}
	const lblFadeinSlider = createDivLabel(`lblFadeinBar`, 160 + addXPos, C_LEN_SETLBL_HEIGHT * setNoFadein + addYPos, ``, ``, ``, ``,
		`<input id=fadeinSlider type=range value=0 min=0 max=99 step=1>`);
	optionsprite.appendChild(lblFadeinSlider);

	const fadeinSlider = document.querySelector(`#fadeinSlider`);
	fadeinSlider.value = g_stateObj.fadein;

	fadeinSlider.addEventListener(`input`, _ => {
		g_stateObj.fadein = parseInt(fadeinSlider.value);
		lnkFadein.innerHTML = `${g_stateObj.fadein}%`;
	}, false);

	fadeinSlider.addEventListener(`change`, _ => {
		g_stateObj.fadein = parseInt(fadeinSlider.value);
		lnkFadein.innerHTML = `${g_stateObj.fadein}%`;
	}, false);

	// ---------------------------------------------------
	// ボリューム (Volume) 
	// 縦位置: 12
	const setNoVolume = 12;
	const lblVolume = createDivLabel(`lblVolume`, 0, C_LEN_SETLBL_HEIGHT * setNoVolume,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		`<span style=color:#99ddff>V</span>olume`);
	optionsprite.appendChild(lblVolume);

	const lnkVolume = makeSettingLblButton(`lnkVolume`, `${g_stateObj.volume}%`, setNoVolume, _ => {
		setSetting(1, `volume`, `%`);
	});
	lnkVolume.oncontextmenu = _ => {
		setSetting(-1, `volume`, `%`);
		return false;
	}
	optionsprite.appendChild(lnkVolume);

	// 右回し・左回しボタン
	optionsprite.appendChild(makeMiniButton(`lnkVolume`, `R`, setNoVolume, _ => {
		setSetting(1, `volume`, `%`);
	}));
	optionsprite.appendChild(makeMiniButton(`lnkVolume`, `L`, setNoVolume, _ => {
		setSetting(-1, `volume`, `%`);
	}));

	// ---------------------------------------------------
	/**
	 * 無効化用ラベル作成
	 * @param {string} _id 
	 * @param {number} _heightPos 
	 * @param {string} _defaultStr 
	 */
	function makeDisabledLabel(_id, _heightPos, _defaultStr) {
		const lbl = createDivLabel(_id, C_LEN_SETLBL_LEFT, C_LEN_SETLBL_HEIGHT * _heightPos,
			C_LEN_SETLBL_WIDTH, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, `#666666`,
			_defaultStr);
		lbl.style.textAlign = C_ALIGN_CENTER;
		return lbl;
	}

	/**
	 * 設定メイン・汎用
	 * @param {number} _scrollNum 
	 * @param {string} _settingName
	 * @param {string} _unitName
	 */
	function setSetting(_scrollNum, _settingName, _unitName = ``) {
		if (_scrollNum > 0) {
			eval(`g_${_settingName}Num = (g_${_settingName}Num === g_${_settingName}s.length - 1 ? 0 : (g_${_settingName}Num + _scrollNum >= g_${_settingName}s.length ? g_${_settingName}s.length - 1 : g_${_settingName}Num + _scrollNum))`);
		} else if (_scrollNum < 0) {
			eval(`g_${_settingName}Num = (g_${_settingName}Num === 0 ? g_${_settingName}s.length - 1 : (g_${_settingName}Num + _scrollNum <= 0 ? 0 : g_${_settingName}Num + _scrollNum))`);
		}
		eval(`g_stateObj.${_settingName} = g_${_settingName}s[g_${_settingName}Num]`);
		eval(`document.querySelector('#lnk${_settingName.slice(0, 1).toUpperCase()}${_settingName.slice(1)}').innerHTML = g_stateObj.${_settingName} + _unitName`);
	}

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

		if (g_rootObj.keyExtraList !== undefined) {
			const keyExtraList = g_rootObj.keyExtraList.split(`,`);
			for (let j = 0; j < keyExtraList.length; j++) {
				if (g_keyObj.currentKey === keyExtraList[j]) {
					g_stateObj.extraKeyFlg = true;
					break;
				}
			}
		}

		// ---------------------------------------------------
		// 2. 初期化設定

		if (_initFlg) {

			// 速度、ゲージ、リバースの初期設定
			g_stateObj.speed = g_headerObj.initSpeeds[g_stateObj.scoreId];
			g_speedNum = g_speeds.findIndex(speed => speed === g_stateObj.speed);
			if (g_speedNum < 0) {
				g_speedNum = 0;
			}
			g_gaugeNum = 0;
			if (!g_stateObj.extraKeyFlg) {
				g_localKeyStorage.reverse = C_FLG_OFF;
			} else {
				g_stateObj.reverse = C_FLG_OFF;
				g_reverseNum = 0;
			}
		}

		if (g_canLoadDifInfoFlg || _initFlg) {

			// キーパターン初期化
			g_keyObj.currentPtn = 0;

			// キー別のローカルストレージの初期設定　※特殊キーは除く
			if (!g_stateObj.extraKeyFlg) {
				g_checkKeyStorage = localStorage.getItem(`danonicw-${g_keyObj.currentKey}k`);
				if (g_checkKeyStorage) {
					g_localKeyStorage = JSON.parse(g_checkKeyStorage);

					// リバース初期値設定
					if (g_localKeyStorage.reverse !== undefined) {
						g_stateObj.reverse = setVal(g_localKeyStorage.reverse, C_FLG_OFF, `string`);
						g_reverseNum = g_reverses.findIndex(reverse => reverse === g_stateObj.reverse);
						if (g_reverseNum < 0) {
							g_reverseNum = 0;
						}
					}

					// キーコンフィグ初期値設定
					if (g_localKeyStorage.keyCtrlPtn === undefined) {
						g_localKeyStorage.keyCtrlPtn = 0;
					}
					const baseKeyCtrlPtn = g_localKeyStorage.keyCtrlPtn;
					const basePtn = `${g_keyObj.currentKey}_${baseKeyCtrlPtn}`;
					const baseKeyNum = g_keyObj[`chara${basePtn}`].length;

					if (g_localKeyStorage.keyCtrl !== undefined) {
						g_keyObj.currentPtn = -1;
						const copyPtn = `${g_keyObj.currentKey}_-1`;
						g_keyObj[`keyCtrl${copyPtn}`] = [];
						g_keyObj[`keyCtrl${copyPtn}d`] = [];

						for (let j = 0; j < baseKeyNum; j++) {
							g_keyObj[`keyCtrl${copyPtn}`][j] = [];
							g_keyObj[`keyCtrl${copyPtn}d`][j] = [];

							for (let k = 0; k < g_keyObj[`keyCtrl${basePtn}`][j].length; k++) {
								g_keyObj[`keyCtrl${copyPtn}`][j][k] = g_localKeyStorage.keyCtrl[j][k];
								g_keyObj[`keyCtrl${copyPtn}d`][j][k] = g_localKeyStorage.keyCtrl[j][k];
							}
						}

						g_keyObj[`chara${copyPtn}`] = JSON.parse(JSON.stringify(g_keyObj[`chara${basePtn}`]));
						g_keyObj[`color${copyPtn}`] = JSON.parse(JSON.stringify(g_keyObj[`color${basePtn}`]));
						g_keyObj[`stepRtn${copyPtn}`] = JSON.parse(JSON.stringify(g_keyObj[`stepRtn${basePtn}`]));
						g_keyObj[`pos${copyPtn}`] = JSON.parse(JSON.stringify(g_keyObj[`pos${basePtn}`]));
						g_keyObj[`div${copyPtn}`] = g_keyObj[`div${basePtn}`];
						g_keyObj[`blank${copyPtn}`] = g_keyObj[`blank${basePtn}`];
						g_keyObj[`transKey${copyPtn}`] = g_keyObj[`transKey${basePtn}`];
						if (g_keyObj[`shuffle${basePtn}`] !== undefined) {
							g_keyObj[`shuffle${copyPtn}`] = JSON.parse(JSON.stringify(g_keyObj[`shuffle${basePtn}`]));
						}
					}

				} else {
					g_localKeyStorage = {
						reverse: C_FLG_OFF,
						keyCtrl: [[]],
						keyCtrlPtn: 0,
					};
					g_stateObj.reverse = C_FLG_OFF;
					g_reverseNum = 0;
				}
			}
		}

		// ---------------------------------------------------
		// 3. 名称の設定

		// 譜面名設定 (Difficulty)
		lnkDifficulty.innerHTML = `${g_keyObj.currentKey} key / ${g_headerObj.difLabels[g_stateObj.scoreId]}`;
		if (getStrLength(lnkDifficulty.innerHTML) > 25) {
			lnkDifficulty.style.fontSize = `14px`;
		} else if (getStrLength(lnkDifficulty.innerHTML) > 18) {
			lnkDifficulty.style.fontSize = `16px`;
		}

		// 速度設定 (Speed)
		setSetting(0, `speed`, ` x`);

		// リバース設定 (Reverse)
		setSetting(0, `reverse`);

		// ゲージ設定 (Gauge)
		setGauge(0);

		// ユーザカスタムイベント(初期)
		if (typeof customSetDifficulty === `function`) {
			customSetDifficulty(_initFlg, g_canLoadDifInfoFlg);
			if (typeof customSetDifficulty2 === `function`) {
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
 * 設定・オプション表示用ボタン
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
		hoverColor: C_CLR_DEFAULT,
		align: C_ALIGN_CENTER
	}, _func);

	return settingLblButton;
}

/**
 * 設定・オプション用の設定変更ミニボタン
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

/*-----------------------------------------------------------*/
/* Scene : SETTINGS-DISPLAY [lemon] */
/*-----------------------------------------------------------*/

function settingsDisplayInit() {

	drawDefaultBackImage(``);
	const divRoot = document.querySelector(`#divRoot`);

	// 譜面初期情報ロード許可フラグ
	g_canLoadDifInfoFlg = false;

	// タイトル文字描画
	const lblTitle = getTitleDivLabel(`lblTitle`,
		`<span style=color:#ffff66;font-size:40px>D</span>ISPLAY`, 0, 15);
	divRoot.appendChild(lblTitle);

	// オプションボタン用の設置
	createSettingsDisplayWindow(`divRoot`);

	// ユーザカスタムイベント(初期)
	if (typeof customSettingsDisplayInit === `function`) {
		customSettingsDisplayInit();
		if (typeof customSettingsDisplayInit2 === `function`) {
			customSettingsDisplayInit2();
		}
	}

	// 戻るボタン描画
	const btnBack = createButton({
		id: `btnBack`,
		name: `Back`,
		x: 0,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_BACK,
		align: C_ALIGN_CENTER
	}, _ => {
		// タイトル画面へ戻る
		clearWindow();
		titleInit();
	});
	divRoot.appendChild(btnBack);

	// キーコンフィグボタン描画
	const btnKeyConfig = createButton({
		id: `btnKeyConfig`,
		name: `KeyConfig`,
		x: g_sWidth / 3,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_SETTING,
		align: C_ALIGN_CENTER
	}, _ => {
		// キーコンフィグ画面へ遷移
		g_kcType = `Main`;
		clearWindow();
		keyConfigInit();
	});
	divRoot.appendChild(btnKeyConfig);

	// 進むボタン描画
	const btnPlay = createButton({
		id: `btnPlay`,
		name: `Play`,
		x: g_sWidth / 3 * 2,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_NEXT,
		align: C_ALIGN_CENTER
	}, _ => {
		clearWindow();
		loadMusic();
	});
	divRoot.appendChild(btnPlay);

	// SETTINGボタン描画
	const btnSettings = createButton({
		id: `btnSettings`,
		name: `<`,
		x: g_sWidth / 2 - 175 - C_LEN_SETMINI_WIDTH / 2,
		y: 25,
		width: C_LEN_SETMINI_WIDTH,
		height: 40,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_SETTING,
		align: C_ALIGN_CENTER
	}, _ => {
		// タイトル画面へ戻る
		clearWindow();
		optionInit();
	});
	divRoot.appendChild(btnSettings);


	// キー操作イベント（デフォルト）
	document.onkeydown = evt => {
		// ブラウザ判定
		let setKey;
		if (g_userAgent.indexOf(`firefox`) !== -1) {
			setKey = evt.which;
		} else {
			setKey = event.keyCode;
		}
		if (setKey === 13) {
			clearWindow();
			loadMusic();
		}
		for (let j = 0; j < C_BLOCK_KEYS.length; j++) {
			if (setKey === C_BLOCK_KEYS[j]) {
				return false;
			}
		}
	}
	document.onkeyup = evt => { }
}

/**
 * 設定・オプション画面のラベル・ボタン処理の描画
 * @param {Object} _sprite 基準とするスプライト(ここで指定する座標は、そのスプライトからの相対位置)
 */
function createSettingsDisplayWindow(_sprite) {

	// 各ボタン用のスプライトを作成
	const optionsprite = createSprite(_sprite, `optionsprite`, (g_sWidth - 400) / 2, 100 + (g_sHeight - 500) / 2, 400, 300);

	const divRoot = document.querySelector(`#divRoot`);
	const sdDesc = createDivLabel(`sdDesc`, 0, 65, g_sWidth, 20, 14, C_CLR_TITLE,
		`[クリックでON/OFFを切替、灰色でOFF]`);
	divRoot.appendChild(sdDesc);

	makeDisplayButton(`stepZone`, 0, 0);
	makeDisplayButton(`judgement`, 1, 0);
	makeDisplayButton(`lifeGauge`, 2, 0);
	makeDisplayButton(`musicInfo`, 3, 0);
	makeDisplayButton(`speed`, 0, 1);
	makeDisplayButton(`color`, 1, 1);
	makeDisplayButton(`lyrics`, 2, 1);
	makeDisplayButton(`background`, 3, 1);

	/**
	 * Display表示/非表示ボタン
	 * @param {*} _name 
	 * @param {*} _heightPos 縦位置
	 * @param {*} _widthPos 横位置
	 */
	function makeDisplayButton(_name, _heightPos, _widthPos) {

		const lnk = makeSettingLblButton(`lnk${_name}`, `${_name.slice(0, 1).toUpperCase()}${_name.slice(1)}`, _heightPos, _ => {
			g_stateObj[`d_${_name.toLowerCase()}`] = (g_stateObj[`d_${_name.toLowerCase()}`] === C_FLG_OFF ? C_FLG_ON : C_FLG_OFF);
			lnk.style.color = (g_stateObj[`d_${_name.toLowerCase()}`] === C_FLG_OFF ? `#666666` : `#ffffff`);
			lnk.style.borderColor = (g_stateObj[`d_${_name.toLowerCase()}`] === C_FLG_OFF ? `#000000 #333333` : `#000000 #cccccc`);
		});
		lnk.style.width = `170px`;
		lnk.style.left = `calc(30px + 180px * ${_widthPos})`;
		lnk.style.color = (g_stateObj[`d_${_name.toLowerCase()}`] === C_FLG_OFF ? `#666666` : `#ffffff`);
		lnk.style.borderStyle = `solid`;
		lnk.style.borderColor = (g_stateObj[`d_${_name.toLowerCase()}`] === C_FLG_OFF ? `#000000 #333333` : `#000000 #cccccc`);
		optionsprite.appendChild(lnk);
	}

}

/*-----------------------------------------------------------*/
/* Scene : KEYCONFIG [orange] */
/*-----------------------------------------------------------*/

/**
 * キーコンフィグ画面初期化
 */
function keyConfigInit() {

	drawDefaultBackImage(``);
	const divRoot = document.querySelector(`#divRoot`);

	// 譜面初期情報ロード許可フラグ
	g_canLoadDifInfoFlg = false;

	// タイトル文字描画
	const lblTitle = getTitleDivLabel(`lblTitle`,
		`<span style=color:#6666ff;font-size:40px>K</span>EY
		<span style=color:#ff6666;font-size:40px>C</span>ONFIG`
			.replace(/[\t\n]/g, ``), 0, 15);
	divRoot.appendChild(lblTitle);

	const kcDesc = createDivLabel(`kcDesc`, 0, 65, g_sWidth, 20, 14, C_CLR_TITLE,
		`[BackSpaceキー:スキップ / Deleteキー:(代替キーのみ)キー無効化]`);
	kcDesc.style.align = C_ALIGN_CENTER;
	divRoot.appendChild(kcDesc);

	// キーの一覧を表示
	const keyconSprite = createSprite(`divRoot`, `keyconSprite`, 0, 100 + (g_sHeight - 500) / 2, g_sWidth, 300);
	const kWidth = parseInt(keyconSprite.style.width);

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;
	const posMax = (g_keyObj[`divMax${keyCtrlPtn}`] !== undefined ?
		g_keyObj[`divMax${keyCtrlPtn}`] : g_keyObj[`pos${keyCtrlPtn}`][keyNum - 1] + 1);
	const divideCnt = g_keyObj[`div${keyCtrlPtn}`];
	if (g_keyObj[`blank${keyCtrlPtn}`] !== undefined) {
		g_keyObj.blank = g_keyObj[`blank${keyCtrlPtn}`];
	} else {
		g_keyObj.blank = g_keyObj.blank_def;
	}

	// 別キーモード警告メッセージ
	const kcMsg = createDivLabel(`kcMsg`, 0, g_sHeight - 35, g_sWidth, 20, 14, `#ffff99`,
		``);
	kcMsg.style.align = C_ALIGN_CENTER;
	divRoot.appendChild(kcMsg);
	if (setVal(g_keyObj[`transKey${keyCtrlPtn}`], ``, `string`) !== ``) {
		document.querySelector(`#kcMsg`).innerHTML = `別キーモードではハイスコア、キーコンフィグ等は保存されません`;
	} else {
		document.querySelector(`#kcMsg`).innerHTML = ``;
	}

	/** 同行の左から数えた場合の位置(x座標) */
	let leftCnt = 0;
	/** 同行の中心から見た場合の位置(x座標) */
	let stdPos = 0;
	/** 行位置 */
	let dividePos = 0;
	let posj = 0;

	for (let j = 0; j < keyNum; j++) {

		posj = g_keyObj[`pos${keyCtrlPtn}`][j];
		leftCnt = (posj >= divideCnt ? posj - divideCnt : posj);
		stdPos = (posj >= divideCnt ? leftCnt + 1 - (posMax - (divideCnt - 1)) / 2 : leftCnt - (divideCnt - 1) / 2);
		dividePos = (posj >= divideCnt ? 1 : 0);

		// キーコンフィグ表示用の矢印・おにぎりを表示
		keyconSprite.appendChild(createArrowEffect(`arrow${j}`, g_headerObj.setColor[g_keyObj[`color${keyCtrlPtn}`][j]],
			g_keyObj.blank * stdPos + kWidth / 2 - 25,
			150 * dividePos, 50,
			g_keyObj[`stepRtn${keyCtrlPtn}`][j]));

		for (let k = 0; k < g_keyObj[`keyCtrl${keyCtrlPtn}`][j].length; k++) {
			keyconSprite.appendChild(createDivLabel(`keycon${j}_${k}`,
				g_keyObj.blank * stdPos + kWidth / 2 - 25,
				50 + 20 * k + 150 * dividePos,
				50, 20, 16, `#cccccc`, g_kCd[g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]]));
			if (g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k] !== g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]) {
				document.querySelector(`#keycon${j}_${k}`).style.color = `#ffff00`;
			} else if (g_keyObj.currentPtn === -1) {
				document.querySelector(`#keycon${j}_${k}`).style.color = `#99ccff`;
			}
		}
	}
	posj = g_keyObj[`pos${keyCtrlPtn}`][0];

	// カーソルの作成
	const cursor = keyconSprite.appendChild(createImg(`cursor`, C_IMG_CURSOR,
		kWidth / 2 + g_keyObj.blank * (posj - (divideCnt - 1) / 2) - 10 - 25, 45, 15, 30));
	cursor.style.transitionDuration = `0.125s`;

	// キーコンフィグタイプ切替ボタン
	const lblKcType = createDivLabel(`lblKcType`, 30, 10,
		70, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		`<span style=color:#99ddff>C</span>onfigType`);
	divRoot.appendChild(lblKcType);

	const lnkKcType = makeSettingLblButton(`lnkKcType`, g_kcType, 0, _ => {
		switch (g_kcType) {
			case `Main`:
				g_kcType = `Replaced`;
				resetCursorReplaced(kWidth, divideCnt, keyCtrlPtn);
				break;

			case `Replaced`:
				g_kcType = `ALL`;
				resetCursorALL(kWidth, divideCnt, keyCtrlPtn);
				break;

			case `ALL`:
				g_kcType = `Main`;
				resetCursorMain(kWidth, divideCnt, keyCtrlPtn);
				break;
		}
		lnkKcType.innerHTML = g_kcType;
	});
	lnkKcType.style.width = `100px`;
	lnkKcType.style.left = `30px`;
	lnkKcType.style.top = `35px`;
	divRoot.appendChild(lnkKcType);

	// キーカラータイプ切替ボタン
	const lblcolorType = createDivLabel(`lblcolorType`, g_sWidth - 120, 10,
		70, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		`<span style=color:#ffdd99>C</span>olorType`);
	divRoot.appendChild(lblcolorType);

	const lnkcolorType = makeSettingLblButton(`lnkKcType`, g_colorType, 0, _ => {
		switch (g_colorType) {
			case `Default`:
				g_colorType = `Type1`;
				g_stateObj.d_color = `OFF`;
				break;
			case `Type1`:
				g_colorType = `Type2`;
				g_stateObj.d_color = `OFF`;
				break;
			case `Type2`:
				g_colorType = `Default`;
				g_stateObj.d_color = `ON`;
				break;
		}
		g_headerObj.setColor = JSON.parse(JSON.stringify(g_headerObj[`setColor${g_colorType}`]));
		for (let j = 0; j < g_headerObj.setColorInit.length; j++) {
			g_headerObj.frzColor[j] = JSON.parse(JSON.stringify(g_headerObj[`frzColor${g_colorType}`][j]));
		}
		for (let j = 0; j < keyNum; j++) {

			// IE/Edge(V17以前)の場合は何もしない
			if (g_userAgent.indexOf(`msie`) !== -1 ||
				g_userAgent.indexOf(`trident`) !== -1 ||
				(g_userAgent.indexOf(`edge`) !== -1 && edgeVersion < 18)) {
			} else {
				document.querySelector(`#arrow${j}`).style.backgroundColor = g_headerObj.setColor[g_keyObj[`color${keyCtrlPtn}`][j]];
			}
		}
		lnkcolorType.innerHTML = g_colorType;
	});
	lnkcolorType.style.width = `100px`;
	lnkcolorType.style.left = `calc(${g_sWidth}px - 130px)`;
	lnkcolorType.style.top = `35px`;
	divRoot.appendChild(lnkcolorType);

	// ユーザカスタムイベント(初期)
	if (typeof customKeyConfigInit === `function`) {
		customKeyConfigInit();
		if (typeof customKeyConfigInit2 === `function`) {
			customKeyConfigInit2();
		}
	}

	// 戻るボタン描画
	const btnBack = createButton({
		id: `btnBack`,
		name: `Back`,
		x: 0,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_BACK,
		align: C_ALIGN_CENTER
	}, _ => {
		// 設定・オプション画面へ戻る
		g_currentj = 0;
		g_currentk = 0;
		g_prevKey = 0;
		clearWindow();
		optionInit();
	});
	divRoot.appendChild(btnBack);

	// パターン変更ボタン描画
	const btnPtnChange = createButton({
		id: `btnPtnChange`,
		name: `PtnChange`,
		x: g_sWidth / 3,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_SETTING,
		align: C_ALIGN_CENTER
	}, _ => {
		let tempPtn = g_keyObj.currentPtn + 1;
		while (setVal(g_keyObj[`transKey${g_keyObj.currentKey}_${tempPtn}`], ``, `string`) !== `` &&
			g_headerObj.transKeyUse === `false`) {

			tempPtn++;
			if (g_keyObj[`keyCtrl${g_keyObj.currentKey}_${tempPtn}`] === undefined) {
				break;
			}
		}
		if (g_keyObj[`keyCtrl${g_keyObj.currentKey}_${tempPtn}`] !== undefined) {
			g_keyObj.currentPtn = tempPtn;
		} else {
			if (g_keyObj[`keyCtrl${g_keyObj.currentKey}_-1`] !== undefined) {
				g_keyObj.currentPtn = -1;
			} else {
				g_keyObj.currentPtn = 0;
			}
		}
		clearWindow();
		keyConfigInit();
		const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
		eval(`resetCursor${g_kcType}`)(kWidth, g_keyObj[`div${keyCtrlPtn}`], keyCtrlPtn);
	});
	divRoot.appendChild(btnPtnChange);

	// キーコンフィグリセットボタン描画
	const btnReset = createButton({
		id: `btnReset`,
		name: `Reset`,
		x: g_sWidth / 3 * 2,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_RESET,
		align: C_ALIGN_CENTER
	}, _ => {
		if (window.confirm(`キーを初期配置に戻します。よろしいですか？`)) {
			g_keyObj.currentKey = g_headerObj.keyLabels[g_stateObj.scoreId];
			const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
			const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;
			const divideCnt = g_keyObj[`div${keyCtrlPtn}`];

			for (let j = 0; j < keyNum; j++) {
				for (let k = 0; k < g_keyObj[`keyCtrl${keyCtrlPtn}`][j].length; k++) {
					g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k] = g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k];
					document.querySelector(`#keycon${j}_${k}`).innerHTML = g_kCd[g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]];

					if (g_keyObj.currentPtn === -1) {
						document.querySelector(`#keycon${j}_${k}`).style.color = `#99ccff`;
					} else {
						document.querySelector(`#keycon${j}_${k}`).style.color = `#cccccc`;
					}
				}
			}
			eval(`resetCursor${g_kcType}`)(kWidth, divideCnt, keyCtrlPtn);
		}
	});
	divRoot.appendChild(btnReset);


	// キーボード押下時処理
	document.onkeydown = evt => {
		const keyCdObj = document.querySelector(`#keycon${g_currentj}_${g_currentk}`);
		const cursor = document.querySelector(`#cursor`);

		// ブラウザ判定
		let setKey;
		if (g_userAgent.indexOf(`firefox`) !== -1) {
			setKey = evt.which;
		} else {
			setKey = event.keyCode;
		}

		// 全角切替、BackSpace、Deleteキーは割り当て禁止
		// また、直前と同じキーを押した場合(BackSpaceを除く)はキー操作を無効にする
		if (setKey === 229 || setKey === 242 || setKey === 243 || setKey === 244 ||
			setKey === 91 || setKey === 29 || setKey === 28 ||
			(setKey === 46 && g_currentk === 0) || setKey === g_prevKey) {
		} else {
			if (setKey === 8) {
			} else {
				if (setKey === 46) {
					setKey = 0;
				}
				if (g_keyObj[`keyCtrl${keyCtrlPtn}d`][g_currentj][g_currentk] !== setKey) {
					keyCdObj.style.color = `#ffff00`;
				}
				keyCdObj.innerHTML = g_kCd[setKey];
				g_keyObj[`keyCtrl${keyCtrlPtn}`][g_currentj][g_currentk] = setKey;
				g_prevKey = setKey;
			}

			// 後続に代替キーが存在する場合
			if (g_currentk < g_keyObj[`keyCtrl${keyCtrlPtn}`][g_currentj].length - 1 &&
				g_kcType !== `Main`) {
				g_currentk++;
				cursor.style.top = `${parseInt(cursor.style.top) + 20}px`;

			} else if (g_currentj < g_keyObj[`keyCtrl${keyCtrlPtn}`].length - 1) {
				// 他の代替キーが存在せず、次の矢印がある場合
				g_currentj++;
				g_currentk = 0;

				// 代替キーのみの場合は次の代替キーがあるキーを探す
				if (g_kcType === `Replaced`) {
					for (let j = g_currentj, len = g_keyObj[`keyCtrl${keyCtrlPtn}`].length; j < len; j++) {
						if (g_keyObj[`keyCtrl${keyCtrlPtn}`][j][1] !== undefined) {
							g_currentj = j;
							g_currentk = 1;
							break;
						}
					}
					if (g_currentk === 0) {
						for (let j = 0, len = g_currentj; j < len; j++) {
							if (g_keyObj[`keyCtrl${keyCtrlPtn}`][j][1] !== undefined) {
								g_currentj = j;
								g_currentk = 1;
								break;
							}
						}
					}
				}
				const posj = g_keyObj[`pos${keyCtrlPtn}`][g_currentj];

				leftCnt = (posj >= divideCnt ? posj - divideCnt : posj);
				stdPos = (posj >= divideCnt ? leftCnt + 1 - (posMax - (divideCnt - 1)) / 2 : leftCnt - (divideCnt - 1) / 2);
				dividePos = (posj >= divideCnt ? 1 : 0);

				cursor.style.left = `${kWidth / 2 + g_keyObj.blank * stdPos - 10 - 25}px`;
				cursor.style.top = `${50 + 150 * dividePos}px`;
				if (g_kcType === `Replaced`) {
					cursor.style.top = `${parseFloat(cursor.style.top) + 20}px`;
				}

			} else {
				// 全ての矢印・代替キーの巡回が終わった場合は元の位置に戻す
				eval(`resetCursor${g_kcType}`)(kWidth, divideCnt, keyCtrlPtn);
			}
		}
		for (let j = 0; j < C_BLOCK_KEYS.length; j++) {
			if (setKey === C_BLOCK_KEYS[j]) {
				return false;
			}
		}
	}
}

/**
 * キーコンフィグ用カーソルのリセット(ConfigType:Main)
 * @param {number} _width 
 * @param {number} _divideCnt 
 * @param {string} _keyCtrlPtn 
 */
function resetCursorMain(_width, _divideCnt, _keyCtrlPtn) {

	g_currentj = 0;
	g_currentk = 0;
	g_prevKey = -1;
	const posj = g_keyObj[`pos${_keyCtrlPtn}`][0];

	const cursor = document.querySelector(`#cursor`);
	cursor.style.left = `${_width / 2 + g_keyObj.blank * (posj - (_divideCnt - 1) / 2) - 10 - 25}px`;
	cursor.style.top = `45px`;
}

/**
 * キーコンフィグ用カーソルのリセット(ConfigType:Replaced)
 * @param {number} _width 
 * @param {number} _divideCnt 
 * @param {string} _keyCtrlPtn 
 */
function resetCursorReplaced(_width, _divideCnt, _keyCtrlPtn) {
	g_currentj = 0;
	g_currentk = 0;
	g_prevKey = -1;
	const keyNum = g_keyObj[`chara${_keyCtrlPtn}`].length;

	for (let j = 0; j < keyNum; j++) {
		if (g_keyObj[`keyCtrl${_keyCtrlPtn}`][j][1] !== undefined) {
			g_currentj = j;
			g_currentk = 1;
			break;
		}
	}
	const posj = g_keyObj[`pos${_keyCtrlPtn}`][g_currentj];

	const cursor = document.querySelector(`#cursor`);
	const leftCnt = (posj >= _divideCnt ? posj - _divideCnt : posj);
	const posMax = (g_keyObj[`divMax${_keyCtrlPtn}`] !== undefined ?
		g_keyObj[`divMax${_keyCtrlPtn}`] : g_keyObj[`pos${_keyCtrlPtn}`][keyNum - 1] + 1);
	const stdPos = (posj >= _divideCnt ? leftCnt + 1 - (posMax - (_divideCnt - 1)) / 2 : leftCnt - (_divideCnt - 1) / 2);
	cursor.style.left = `${_width / 2 + g_keyObj.blank * stdPos - 10 - 25}px`;

	const dividePos = (posj >= _divideCnt ? 1 : 0);
	if (g_currentk === 1) {
		cursor.style.top = `${65 + 150 * dividePos}px`;
	} else {
		g_kcType = `ALL`;
		cursor.style.top = `${45 + 150 * dividePos}px`;
	}
}

/**
 * キーコンフィグ用カーソルのリセット(ConfigType:ALL)
 * @param {number} _width 
 * @param {number} _divideCnt 
 * @param {string} _keyCtrlPtn 
 */
function resetCursorALL(_width, _divideCnt, _keyCtrlPtn) {

	g_currentj = 0;
	g_currentk = 0;
	g_prevKey = -1;
	const posj = g_keyObj[`pos${_keyCtrlPtn}`][0];

	const cursor = document.querySelector(`#cursor`);
	cursor.style.left = `${_width / 2 + g_keyObj.blank * (posj - (_divideCnt - 1) / 2) - 10 - 25}px`;
	cursor.style.top = `45px`;
}

/*-----------------------------------------------------------*/
/* Scene : LOADING [strawberry] */
/*-----------------------------------------------------------*/

/**
 * 読込画面初期化
 */
function loadingScoreInit() {

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;
	g_headerObj.blankFrame = g_headerObj.blankFrameDef;

	// 譜面初期情報ロード許可フラグ
	// (タイトルバック時保存したデータを設定画面にて再読み込みするため、
	//  ローカルストレージ保存時はフラグを解除しない)
	if (!g_stateObj.dataSaveFlg || setVal(g_keyObj[`transKey${keyCtrlPtn}`], ``, `string`) !== ``) {
		g_canLoadDifInfoFlg = false;
	}

	// 譜面データの読み込み
	let scoreIdHeader = ``;
	if (g_stateObj.scoreId > 0) {
		scoreIdHeader = Number(g_stateObj.scoreId) + 1;
	}
	g_scoreObj = scoreConvert(g_rootObj, scoreIdHeader, 0);

	// ライフ回復・ダメージ量の計算
	// フリーズ始点でも通常判定させる場合は総矢印数を水増しする
	if (g_headerObj.frzStartjdgUse === `true`) {
		g_allArrow += g_allFrz / 2;
	}
	calcLifeVals(g_allArrow + g_allFrz / 2);

	// 最終フレーム数の取得
	let lastFrame = getLastFrame(g_scoreObj) + g_headerObj.blankFrame;

	// 最初の矢印データがあるフレーム数を取得
	let firstArrowFrame = getFirstArrowFrame(g_scoreObj);

	// 開始フレーム数の取得(フェードイン加味)
	g_scoreObj.frameNum = getStartFrame(lastFrame);
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

	// フレーム・曲開始位置調整
	let preblankFrame = 0;
	if (g_scoreObj.frameNum === 0) {
		if (firstArrowFrame < arrivalFrame) {
			preblankFrame = arrivalFrame - firstArrowFrame + 10;

			// 譜面データの再読み込み
			const tmpObj = scoreConvert(g_rootObj, scoreIdHeader, preblankFrame);
			for (let j = 0; j < keyNum; j++) {
				if (tmpObj.arrowData[j] !== undefined) {
					g_scoreObj.arrowData[j] = JSON.parse(JSON.stringify(tmpObj.arrowData[j]));
				}
				if (tmpObj.frzData[j] !== undefined) {
					g_scoreObj.frzData[j] = JSON.parse(JSON.stringify(tmpObj.frzData[j]));
				}
			}
			if (tmpObj.speedData !== undefined && tmpObj.speedData.length >= 2) {
				g_scoreObj.speedData = JSON.parse(JSON.stringify(tmpObj.speedData));
			}
			if (tmpObj.boostData !== undefined && tmpObj.boostData.length >= 2) {
				g_scoreObj.boostData = JSON.parse(JSON.stringify(tmpObj.boostData));
			}
			if (tmpObj.colorData !== undefined && tmpObj.colorData.length >= 3) {
				g_scoreObj.colorData = JSON.parse(JSON.stringify(tmpObj.colorData));
			}
			if (tmpObj.acolorData !== undefined && tmpObj.acolorData.length >= 3) {
				g_scoreObj.acolorData = JSON.parse(JSON.stringify(tmpObj.acolorData));
			}
			if (tmpObj.wordData !== undefined && tmpObj.wordData.length >= 3) {
				g_scoreObj.wordData = tmpObj.wordData.concat();
			}
			if (tmpObj.maskData !== undefined && tmpObj.maskData.length >= 1) {
				g_scoreObj.maskData = tmpObj.maskData.concat();
			}
			if (tmpObj.backData !== undefined && tmpObj.backData.length >= 1) {
				g_scoreObj.backData = tmpObj.backData.concat();
			}

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
		applySRandom(keyNum, shuffleGroup);
	} else if (g_stateObj.shuffle === `S-Random+`) {
		applySRandom(keyNum, [[...Array(keyNum).keys()]]);
	}

	// 矢印・フリーズアロー・速度/色変化格納処理
	pushArrows(g_scoreObj, speedOnFrame, motionOnFrame, arrivalFrame);

	// メインに入る前の最終初期化処理
	getArrowSettings();

	// ユーザカスタムイベント
	if (typeof customLoadingInit === `function`) {
		customLoadingInit();
		if (typeof customLoadingInit2 === `function`) {
			customLoadingInit2();
		}
	}

	clearWindow();
	MainInit();
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
	const tmpArrowData = JSON.parse(JSON.stringify(g_scoreObj.arrowData));
	const tmpFrzData = JSON.parse(JSON.stringify(g_scoreObj.frzData));
	for (let i = 0; i < _keyNum; i++) {
		g_scoreObj.arrowData[i] = tmpArrowData[index[i]] || [];
		g_scoreObj.frzData[i] = tmpFrzData[index[i]] || [];
	}
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
function applySRandom(_keyNum, _shuffleGroup) {
	const tmpArrowData = [...Array(_keyNum)].map(_ => []);
	const tmpFrzData = [...Array(_keyNum)].map(_ => []);

	// シャッフルグループごとに処理
	_shuffleGroup.forEach(_group => {
		// 全フリーズを開始フレーム順に並べる
		const allFreezeArrows = [];
		_group.forEach(_key => {
			const frzData = g_scoreObj.frzData[_key] || [];
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
		const allArrows = _group.map(_key => g_scoreObj.arrowData[_key]).flat();
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

	g_scoreObj.arrowData = tmpArrowData;
	g_scoreObj.frzData = tmpFrzData.map(_freezes =>
		_freezes.map(_freeze => [_freeze.begin, _freeze.end]).flat()
	);
}

/**
 * 譜面データの分解
 * @param {object} _dosObj 
 * @param {string} _scoreNo
 */
function scoreConvert(_dosObj, _scoreNo, _preblankFrame) {

	// 矢印群の格納先
	const obj = {};
	g_allArrow = 0;
	g_allFrz = 0;

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;
	obj.arrowData = [];
	obj.frzData = [];
	const headerAdjustment = parseInt(g_headerObj.adjustment[g_stateObj.scoreId] || g_headerObj.adjustment[0]);
	const realAdjustment = parseInt(g_stateObj.adjustment) + headerAdjustment + _preblankFrame;
	g_stateObj.realAdjustment = realAdjustment;
	const blankFrame = g_headerObj.blankFrame;
	const calcFrame = _frame => Math.round((parseInt(_frame) - blankFrame) / g_headerObj.playbackRate + blankFrame + realAdjustment);

	for (let j = 0, k = 0; j < keyNum; j++) {

		// 矢印データの分解
		if (_dosObj[`${g_keyObj[`chara${keyCtrlPtn}`][j]}${_scoreNo}_data`] !== undefined) {
			let tmpData = _dosObj[`${g_keyObj[`chara${keyCtrlPtn}`][j]}${_scoreNo}_data`].split(`\r`).join(``);
			tmpData = tmpData.split(`\n`).join(``);

			if (tmpData !== undefined) {
				obj.arrowData[j] = tmpData.split(`,`);
				if (isNaN(parseFloat(obj.arrowData[j][0]))) {
				} else {
					g_allArrow += obj.arrowData[j].length;
					for (let k = 0; k < obj.arrowData[j].length; k++) {
						obj.arrowData[j][k] = calcFrame(obj.arrowData[j][k]);
					}
				}
			}
		}

		// 矢印名からフリーズアロー名への変換
		let frzName = g_keyObj[`chara${keyCtrlPtn}`][j].replace(`leftdia`, `frzLdia`);
		frzName = frzName.replace(`rightdia`, `frzRdia`);
		frzName = frzName.replace(`left`, `frzLeft`);
		frzName = frzName.replace(`down`, `frzDown`);
		frzName = frzName.replace(`up`, `frzUp`);
		frzName = frzName.replace(`right`, `frzRight`);
		frzName = frzName.replace(`space`, `frzSpace`);
		frzName = frzName.replace(`iyo`, `frzIyo`);
		frzName = frzName.replace(`gor`, `frzGor`);
		frzName = frzName.replace(`oni`, `foni`);
		frzName = frzName.replace(`arrow`, `frzArrow`);

		// フリーズアローデータの分解 (2つで1セット)
		if (_dosObj[`${frzName}${_scoreNo}_data`] !== undefined) {
			let tmpData = _dosObj[`${frzName}${_scoreNo}_data`].split(`\r`).join(``);
			tmpData = tmpData.split(`\n`).join(``);

			if (tmpData !== undefined) {
				obj.frzData[j] = tmpData.split(`,`);
				if (isNaN(parseFloat(obj.frzData[j][0]))) {
				} else {
					g_allFrz += obj.frzData[j].length;
					for (let k = 0; k < obj.frzData[j].length; k++) {
						obj.frzData[j][k] = calcFrame(obj.frzData[j][k]);
					}
				}
			}
		}
	}

	// 速度変化（全体）データの分解 (2つで1セット)
	obj.speedData = [];
	obj.speedData.length = 0;
	const speedFooter = (g_keyObj.currentKey === `5` ? `_data` : `_change`);
	if (_dosObj[`speed${_scoreNo}${speedFooter}`] !== undefined && g_stateObj.d_speed === C_FLG_ON) {
		let speedIdx = 0;
		let tmpArrayData = _dosObj[`speed${_scoreNo}${speedFooter}`].split(`\r`).join(`\n`);
		tmpArrayData = tmpArrayData.split(`\n`);

		for (let j = 0, len = tmpArrayData.length; j < len; j++) {
			const tmpData = tmpArrayData[j];

			if (tmpData !== undefined && tmpData !== ``) {
				const tmpSpeedData = tmpData.split(`,`);
				for (let k = 0; k < tmpSpeedData.length; k += 2) {
					if (isNaN(parseInt(tmpSpeedData[k]))) {
						continue;
					}
					obj.speedData[speedIdx] = calcFrame(tmpSpeedData[k]);
					obj.speedData[speedIdx + 1] = parseFloat(tmpSpeedData[k + 1]);
					speedIdx += 2;
				}
			}
		}
	}

	// 速度変化（個別）データの分解 (2つで1セット, セット毎の改行区切り可)
	obj.boostData = [];
	obj.boostData.length = 0;
	if (_dosObj[`boost${_scoreNo}_data`] !== undefined && g_stateObj.d_speed === C_FLG_ON) {
		let speedIdx = 0;
		let tmpArrayData = _dosObj[`boost${_scoreNo}_data`].split(`\r`).join(`\n`);
		tmpArrayData = tmpArrayData.split(`\n`);

		for (let j = 0, len = tmpArrayData.length; j < len; j++) {
			const tmpData = tmpArrayData[j];

			if (tmpData !== undefined && tmpData !== ``) {
				const tmpSpeedData = tmpData.split(`,`);
				for (let k = 0; k < tmpSpeedData.length; k += 2) {
					if (isNaN(parseInt(tmpSpeedData[k]))) {
						continue;
					}
					obj.boostData[speedIdx] = calcFrame(tmpSpeedData[k]);
					obj.boostData[speedIdx + 1] = parseFloat(tmpSpeedData[k + 1]);
					speedIdx += 2;
				}
			}
		}
	}

	// 色変化（個別）データの分解（3つで1セット, セット毎の改行区切り可）
	obj.colorData = [];
	obj.colorData.length = 0;
	if (_dosObj[`color${_scoreNo}_data`] !== undefined && _dosObj[`color${_scoreNo}_data`] !== `` && g_stateObj.d_color === C_FLG_ON) {
		let colorIdx = 0;
		let tmpArrayData = _dosObj[`color${_scoreNo}_data`].split(`\r`).join(`\n`);
		tmpArrayData = tmpArrayData.split(`\n`);

		for (let j = 0, len = tmpArrayData.length; j < len; j++) {
			const tmpData = tmpArrayData[j];

			if (tmpData !== undefined && tmpData !== ``) {
				const tmpColorData = tmpData.split(`,`);
				for (let k = 0; k < tmpColorData.length; k += 3) {
					if (isNaN(parseInt(tmpColorData[k]))) {
						continue;
					}
					obj.colorData[colorIdx] = calcFrame(tmpColorData[k]);
					obj.colorData[colorIdx + 1] = parseFloat(tmpColorData[k + 1]);
					obj.colorData[colorIdx + 2] = tmpColorData[k + 2];
					colorIdx += 3;
				}
			}
		}
	}

	// 色変化（全体）データの分解 (3つで1セット, セット毎の改行区切り可)
	obj.acolorData = [];
	obj.acolorData.length = 0;
	if (_dosObj[`acolor${_scoreNo}_data`] !== undefined && _dosObj[`acolor${_scoreNo}data`] !== `` && g_stateObj.d_color === C_FLG_ON) {
		let colorIdx = 0;
		let tmpArrayData = _dosObj[`acolor${_scoreNo}_data`].split(`\r`).join(`\n`);
		tmpArrayData = tmpArrayData.split(`\n`);

		for (let j = 0, len = tmpArrayData.length; j < len; j++) {
			const tmpData = tmpArrayData[j];

			if (tmpData !== undefined && tmpData !== ``) {
				const tmpColorData = tmpData.split(`,`);
				for (let k = 0; k < tmpColorData.length; k += 3) {
					if (isNaN(parseInt(tmpColorData[k]))) {
						continue;
					}
					obj.acolorData[colorIdx] = calcFrame(tmpColorData[k]);
					obj.acolorData[colorIdx + 1] = parseFloat(tmpColorData[k + 1]);
					obj.acolorData[colorIdx + 2] = tmpColorData[k + 2];
					colorIdx += 3;
				}
			}
		}
	}

	// 歌詞データの分解 (3つで1セット, セット毎の改行区切り可)
	obj.wordData = [];
	obj.wordData.length = 0;
	obj.wordMaxDepth = -1;
	if (g_stateObj.d_lyrics === C_FLG_ON) {

		let inputWordData = ``;
		if (_dosObj[`word${_scoreNo}_data`] !== undefined) {
			inputWordData = _dosObj[`word${_scoreNo}_data`];
		} else if (_dosObj.word_data !== undefined) {
			inputWordData = _dosObj.word_data;
		}
		if (inputWordData != ``) {
			let tmpArrayData = inputWordData.split(`\r`).join(`\n`);
			tmpArrayData = tmpArrayData.split(`\n`);

			for (let j = 0, len = tmpArrayData.length; j < len; j++) {
				const tmpData = tmpArrayData[j];

				if (tmpData !== undefined && tmpData !== ``) {
					const tmpWordData = tmpData.split(`,`);
					for (let k = 0; k < tmpWordData.length; k += 3) {
						if (isNaN(parseInt(tmpWordData[k]))) {
							continue;
						}
						tmpWordData[k] = calcFrame(tmpWordData[k]);
						tmpWordData[k + 1] = parseFloat(tmpWordData[k + 1]);

						if (tmpWordData[k + 1] > obj.wordMaxDepth) {
							obj.wordMaxDepth = tmpWordData[k + 1];
						}

						let addFrame = 0;
						if (obj.wordData[tmpWordData[k]] === undefined) {
							obj.wordData[tmpWordData[k]] = [];
						} else {
							for (let m = 1; ; m++) {
								if (obj.wordData[tmpWordData[k] + m] === undefined) {
									obj.wordData[tmpWordData[k] + m] = [];
									addFrame = m;
									break;
								}
							}
						}

						if (tmpWordData.length > 3 && tmpWordData.length < 6) {
							tmpWordData[3] = setVal(tmpWordData[3], C_WOD_FRAME, `number`);
							obj.wordData[tmpWordData[0] + addFrame].push(tmpWordData[1], tmpWordData[2], tmpWordData[3]);
							break;
						} else {
							obj.wordData[tmpWordData[k] + addFrame].push(tmpWordData[k + 1], tmpWordData[k + 2]);
						}
					}
				}
			}
		}
	}

	// マスクデータの分解 (下記すべてで1セット、改行区切り)
	// [フレーム数,階層,背景パス,class(CSSで別定義),X,Y,width,height,opacity,animationName,animationDuration]
	obj.maskData = [];
	obj.maskData.length = 0;
	obj.maskMaxDepth = -1;
	if (_dosObj[`mask${_scoreNo}_data`] !== undefined && g_stateObj.d_background === C_FLG_ON) {

		let tmpArrayData = _dosObj[`mask${_scoreNo}_data`].split(`\r`).join(`\n`);
		tmpArrayData = tmpArrayData.split(`\n`);

		for (let j = 0, len = tmpArrayData.length; j < len; j++) {
			const tmpData = tmpArrayData[j];

			if (tmpData !== undefined && tmpData !== ``) {
				const tmpMaskData = tmpData.split(`,`);

				// 値チェックとエスケープ処理
				const tmpFrame = calcFrame(setVal(tmpMaskData[0], 200, `number`));
				const tmpDepth = setVal(tmpMaskData[1], 0, `number`);
				const tmpPath = escapeHtml(setVal(tmpMaskData[2], ``, `string`));
				const tmpClass = escapeHtml(setVal(tmpMaskData[3], ``, `string`));
				const tmpX = setVal(tmpMaskData[4], 0, `float`);
				const tmpY = setVal(tmpMaskData[5], 0, `float`);
				const tmpWidth = setVal(tmpMaskData[6], 0, `number`);				// spanタグの場合は font-size
				const tmpHeight = escapeHtml(setVal(tmpMaskData[7], ``, `string`));	// spanタグの場合は color(文字列可)
				const tmpOpacity = setVal(tmpMaskData[8], 1, `float`);
				const tmpAnimationName = escapeHtml(setVal(tmpMaskData[9], C_DIS_NONE, `string`));
				const tmpAnimationDuration = setVal(tmpMaskData[10], 0, `number`) / 60;

				if (tmpDepth > obj.maskMaxDepth) {
					obj.maskMaxDepth = tmpDepth;
				}

				let addFrame = 0;
				if (obj.maskData[tmpFrame] === undefined) {
					obj.maskData[tmpFrame] = {};
				} else {
					for (let m = 1; ; m++) {
						if (obj.maskData[tmpFrame + m] === undefined) {
							obj.maskData[tmpFrame + m] = {};
							addFrame = m;
							break;
						}
					}
				}
				obj.maskData[tmpFrame + addFrame] = {
					depth: tmpDepth,
					path: tmpPath,
					class: tmpClass,
					left: tmpX,
					top: tmpY,
					width: tmpWidth,
					height: tmpHeight,
					opacity: tmpOpacity,
					animationName: tmpAnimationName,
					animationDuration: tmpAnimationDuration
				};
			}
		}
	}

	// 背景データの分解 (下記すべてで1セット、改行区切り)
	// [フレーム数,階層,背景パス,class(CSSで別定義),X,Y,width,height,opacity,animationName,animationDuration]
	obj.backData = [];
	obj.backData.length = 0;
	obj.backMaxDepth = -1;
	if (_dosObj[`back${_scoreNo}_data`] !== undefined && g_stateObj.d_background === C_FLG_ON) {

		let tmpArrayData = _dosObj[`back${_scoreNo}_data`].split(`\r`).join(`\n`);
		tmpArrayData = tmpArrayData.split(`\n`);

		for (let j = 0, len = tmpArrayData.length; j < len; j++) {
			const tmpData = tmpArrayData[j];

			if (tmpData !== undefined && tmpData !== ``) {
				const tmpBackData = tmpData.split(`,`);

				// 値チェックとエスケープ処理
				const tmpFrame = calcFrame(setVal(tmpBackData[0], 200, `number`));
				const tmpDepth = setVal(tmpBackData[1], 0, `number`);
				const tmpPath = escapeHtml(setVal(tmpBackData[2], ``, `string`));
				const tmpClass = escapeHtml(setVal(tmpBackData[3], ``, `string`));
				const tmpX = setVal(tmpBackData[4], 0, `float`);
				const tmpY = setVal(tmpBackData[5], 0, `float`);
				const tmpWidth = setVal(tmpBackData[6], 0, `number`);					// spanタグの場合は font-size
				const tmpHeight = escapeHtml(setVal(tmpBackData[7], ``, `string`));	// spanタグの場合は color(文字列可)
				const tmpOpacity = setVal(tmpBackData[8], 1, `float`);
				const tmpAnimationName = escapeHtml(setVal(tmpBackData[9], C_DIS_NONE, `string`));
				const tmpAnimationDuration = setVal(tmpBackData[10], 0, `number`) / 60;

				if (tmpDepth > obj.backMaxDepth) {
					obj.backMaxDepth = tmpDepth;
				}

				let addFrame = 0;
				if (obj.backData[tmpFrame] === undefined) {
					obj.backData[tmpFrame] = {};
				} else {
					for (let m = 1; ; m++) {
						if (obj.backData[tmpFrame + m] === undefined) {
							obj.backData[tmpFrame + m] = {};
							addFrame = m;
							break;
						}
					}
				}
				obj.backData[tmpFrame + addFrame] = {
					depth: tmpDepth,
					path: tmpPath,
					class: tmpClass,
					left: tmpX,
					top: tmpY,
					width: tmpWidth,
					height: tmpHeight,
					opacity: tmpOpacity,
					animationName: tmpAnimationName,
					animationDuration: tmpAnimationDuration
				};
			}
		}
	}

	return obj;
}

/**
 * 文字列のエスケープ処理
 * @param {string} _str 
 */
function escapeHtml(_str) {
	let newstr = _str.split(`<`).join(`&lt;`);
	newstr = newstr.split(`>`).join(`&gt;`);
	newstr = newstr.split("`").join(`&quot;`);
	newstr = newstr.split(`&`).join(`&amp;`);

	return newstr;
}

/**
 * ライフ回復量・ダメージ量の算出
 * @param {number} _allArrows 
 */
function calcLifeVals(_allArrows) {

	if (g_stateObj.lifeMode === C_LFE_BORDER) {
		g_workObj.lifeRcv = calcLifeVal(g_stateObj.lifeRcv, _allArrows);
		g_workObj.lifeDmg = calcLifeVal(g_stateObj.lifeDmg, _allArrows);
	} else {
		g_workObj.lifeRcv = g_stateObj.lifeRcv;
		g_workObj.lifeDmg = g_stateObj.lifeDmg;
	}
	g_workObj.lifeBorder = C_VAL_MAXLIFE * g_stateObj.lifeBorder / 100;
	g_workObj.lifeInit = C_VAL_MAXLIFE * g_stateObj.lifeInit / 1000;
}

/**
 * ライフ回復量・ダメージ量の算出
 * @param {number} _val 
 * @param {number} _allArrows 
 */
function calcLifeVal(_val, _allArrows) {
	return Math.round(_val * 100000 / _allArrows) / 100;
}

/**
 * 最終フレーム数の取得
 * @param {object} _dataObj 
 */
function getLastFrame(_dataObj) {

	let tmpLastNum = 0;
	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;

	for (let j = 0; j < keyNum; j++) {
		if (_dataObj.arrowData[j] !== undefined && _dataObj.arrowData[j] !== ``) {
			if (_dataObj.arrowData[j][_dataObj.arrowData[j].length - 1] > tmpLastNum) {
				tmpLastNum = _dataObj.arrowData[j][_dataObj.arrowData[j].length - 1];
			}
		}
		if (_dataObj.frzData[j] !== undefined && _dataObj.frzData[j] !== ``) {
			if (_dataObj.frzData[j][_dataObj.frzData[j].length - 1] > tmpLastNum) {
				tmpLastNum = _dataObj.frzData[j][_dataObj.frzData[j].length - 1];
			}
		}
	}
	return tmpLastNum;
}

/**
 * 最初の矢印フレームの取得
 * @param {object} _dataObj 
 */
function getFirstArrowFrame(_dataObj) {

	let tmpFirstNum = Infinity;
	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;

	for (let j = 0; j < keyNum; j++) {
		if (_dataObj.arrowData[j] !== undefined && _dataObj.arrowData[j] !== ``) {
			if (_dataObj.arrowData[j][0] < tmpFirstNum && _dataObj.arrowData[j][0] > 0) {
				tmpFirstNum = _dataObj.arrowData[j][0];
			}
		}
		if (_dataObj.frzData[j] !== undefined && _dataObj.frzData[j] !== ``) {
			if (_dataObj.frzData[j][0] < tmpFirstNum && _dataObj.frzData[j][0] > 0) {
				tmpFirstNum = _dataObj.frzData[j][0];
			}
		}
	}
	return tmpFirstNum;
}

/**
 * 開始フレームの取得
 * @param {number} _lastFrame 
 */
function getStartFrame(_lastFrame) {
	let frameNum = 0;
	if (g_headerObj.startFrame !== undefined) {
		frameNum = parseInt(g_headerObj.startFrame[g_stateObj.scoreId] || g_headerObj.startFrame[0] || 0);
	}
	if (_lastFrame >= frameNum) {
		frameNum = Math.round(g_stateObj.fadein / 100 * (_lastFrame - frameNum)) + frameNum;
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
		if (_speedData !== undefined && frm === _speedData[s]) {
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

	while (g_distY - startY > 0) {
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

	const startPoint = [];
	const frzStartPoint = [];

	// 矢印・フリーズアロー・速度/色変化用 フレーム別処理配列
	g_workObj.mkArrow = [];
	g_workObj.mkFrzArrow = [];
	g_workObj.mkFrzLength = [];
	g_workObj.mkColor = [];
	g_workObj.mkColorCd = [];
	g_workObj.mkFColor = [];
	g_workObj.mkFColorCd = [];
	g_workObj.mkAColor = [];
	g_workObj.mkAColorCd = [];
	g_workObj.mkFAColor = [];
	g_workObj.mkFAColorCd = [];

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
	let arrowArrivalFrm;
	let frmPrev;

	for (let j = 0; j < _dataObj.arrowData.length; j++) {

		// 矢印の出現フレーム数計算
		if (_dataObj.arrowData[j] !== undefined) {

			startPoint[j] = [];
			if (_dataObj.speedData !== undefined) {
				spdk = _dataObj.speedData.length - 2;
				spdPrev = _dataObj.speedData[spdk];
			} else {
				spdPrev = 0;
			}
			spdNext = Infinity;

			// 最後尾のデータから計算して格納
			lastk = _dataObj.arrowData[j].length - 1;
			arrowArrivalFrm = _dataObj.arrowData[j][lastk];
			tmpObj = getArrowStartFrame(arrowArrivalFrm, _speedOnFrame, _motionOnFrame);

			startPoint[j][lastk] = tmpObj.frm;
			frmPrev = tmpObj.frm;
			g_workObj.initY[frmPrev] = tmpObj.startY;
			g_workObj.arrivalFrame[frmPrev] = tmpObj.arrivalFrm;
			g_workObj.motionFrame[frmPrev] = tmpObj.motionFrm;

			if (g_workObj.mkArrow[startPoint[j][lastk]] === undefined) {
				g_workObj.mkArrow[startPoint[j][lastk]] = [];
			}
			g_workObj.mkArrow[startPoint[j][lastk]].push(j);

			for (let k = lastk - 1; k >= 0; k--) {
				arrowArrivalFrm = _dataObj.arrowData[j][k];

				if (arrowArrivalFrm < _firstArrivalFrame) {
					// 矢印の出現位置が開始前の場合は除外
					break;

				} else if ((arrowArrivalFrm - g_workObj.arrivalFrame[frmPrev] > spdPrev)
					&& arrowArrivalFrm < spdNext) {

					// 最初から最後まで同じスピードのときは前回のデータを流用
					const tmpFrame = arrowArrivalFrm - g_workObj.arrivalFrame[frmPrev];
					startPoint[j][k] = tmpFrame;
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

					startPoint[j][k] = tmpObj.frm;
					frmPrev = tmpObj.frm;
					g_workObj.initY[frmPrev] = tmpObj.startY;
					g_workObj.arrivalFrame[frmPrev] = tmpObj.arrivalFrm;
					g_workObj.motionFrame[frmPrev] = tmpObj.motionFrm;
				}

				// 矢印の出現タイミングを保存
				if (startPoint[j][k] >= 0) {
					if (g_workObj.mkArrow[startPoint[j][k]] === undefined) {
						g_workObj.mkArrow[startPoint[j][k]] = [];
					}
					g_workObj.mkArrow[startPoint[j][k]].push(j);
				}
			}
		}

		// フリーズアローの出現フレーム数計算
		if (_dataObj.frzData[j] !== undefined) {

			frzStartPoint[j] = [];
			g_workObj.mkFrzLength[j] = [];
			if (_dataObj.speedData !== undefined) {
				spdk = _dataObj.speedData.length - 2;
				spdPrev = _dataObj.speedData[spdk];
			} else {
				spdPrev = 0;
			}
			spdNext = Infinity;

			// 最後尾のデータから計算して格納
			lastk = _dataObj.frzData[j].length - 2;
			arrowArrivalFrm = _dataObj.frzData[j][lastk];
			tmpObj = getArrowStartFrame(arrowArrivalFrm, _speedOnFrame, _motionOnFrame);

			frzStartPoint[j][lastk] = tmpObj.frm;
			frmPrev = tmpObj.frm;
			g_workObj.initY[frmPrev] = tmpObj.startY;
			g_workObj.arrivalFrame[frmPrev] = tmpObj.arrivalFrm;
			g_workObj.motionFrame[frmPrev] = tmpObj.motionFrm;
			g_workObj.mkFrzLength[j][lastk] = getFrzLength(_speedOnFrame,
				_dataObj.frzData[j][lastk], _dataObj.frzData[j][lastk + 1]);

			if (g_workObj.mkFrzArrow[frzStartPoint[j][lastk]] === undefined) {
				g_workObj.mkFrzArrow[frzStartPoint[j][lastk]] = [];
			}
			g_workObj.mkFrzArrow[frzStartPoint[j][lastk]].push(j);

			// フリーズアローは2つで1セット
			for (let k = lastk - 2; k >= 0; k -= 2) {
				arrowArrivalFrm = _dataObj.frzData[j][k];

				if (arrowArrivalFrm < _firstArrivalFrame) {

					// フリーズアローの出現位置が開始前の場合は除外
					if (g_workObj.mkFrzLength[j] !== undefined) {
						g_workObj.mkFrzLength[j] = JSON.parse(JSON.stringify(g_workObj.mkFrzLength[j].slice(k + 2)));
					}
					break;

				} else if ((arrowArrivalFrm - g_workObj.arrivalFrame[frmPrev] > spdPrev)
					&& arrowArrivalFrm < spdNext) {

					// 最初から最後まで同じスピードのときは前回のデータを流用
					const tmpFrame = arrowArrivalFrm - g_workObj.arrivalFrame[frmPrev];
					frzStartPoint[j][k] = tmpFrame;
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

					frzStartPoint[j][k] = tmpObj.frm;
					frmPrev = tmpObj.frm;
					g_workObj.initY[frmPrev] = tmpObj.startY;
					g_workObj.arrivalFrame[frmPrev] = tmpObj.arrivalFrm;
					g_workObj.motionFrame[frmPrev] = tmpObj.motionFrm;
				}

				// フリーズアローの出現タイミングを保存
				if (frzStartPoint[j][k] >= 0) {
					g_workObj.mkFrzLength[j][k] = getFrzLength(_speedOnFrame,
						_dataObj.frzData[j][k], _dataObj.frzData[j][k + 1]);
					if (g_workObj.mkFrzArrow[frzStartPoint[j][k]] === undefined) {
						g_workObj.mkFrzArrow[frzStartPoint[j][k]] = [];
					}
					g_workObj.mkFrzArrow[frzStartPoint[j][k]].push(j);

				} else {
					if (g_workObj.mkFrzLength[j] !== undefined) {
						g_workObj.mkFrzLength[j] = JSON.parse(JSON.stringify(g_workObj.mkFrzLength[j].slice(k + 2)));
					}
				}
			}
		}
	}

	// 個別加速のタイミング更新
	g_workObj.boostData = [];
	g_workObj.boostData.length = 0;
	if (_dataObj.boostData !== undefined && _dataObj.boostData.length >= 2) {

		let delBoostIdx = 0;
		for (let k = _dataObj.boostData.length - 2; k >= 0; k -= 2) {
			if (_dataObj.boostData[k] < g_scoreObj.frameNum) {
				delBoostIdx = k;
				break;
			} else {
				tmpObj = getArrowStartFrame(_dataObj.boostData[k], _speedOnFrame, _motionOnFrame);
				_dataObj.boostData[k] = tmpObj.frm;
			}
		}
		for (let k = 0; k < delBoostIdx; k++) {
			_dataObj.boostData.shift();
		}
		g_workObj.boostData = JSON.parse(JSON.stringify(_dataObj.boostData));
	}

	// 個別色変化のタイミング更新
	if (_dataObj.colorData !== undefined && _dataObj.colorData.length >= 3) {
		if (_dataObj.speedData !== undefined) {
			spdk = _dataObj.speedData.length - 2;
			spdPrev = _dataObj.speedData[spdk];
		} else {
			spdPrev = 0;
		}
		spdNext = Infinity;

		lastk = _dataObj.colorData.length - 3;
		tmpObj = getArrowStartFrame(_dataObj.colorData[lastk], _speedOnFrame, _motionOnFrame);
		frmPrev = tmpObj.frm;
		g_workObj.arrivalFrame[frmPrev] = tmpObj.arrivalFrm;
		pushColors(``, tmpObj.frm, _dataObj.colorData[lastk + 1], _dataObj.colorData[lastk + 2].replace(`0x`, `#`));

		for (let k = lastk - 3; k >= 0; k -= 3) {

			if (_dataObj.colorData[k] < g_scoreObj.frameNum) {
				break;
			} else if ((_dataObj.colorData[k] - g_workObj.arrivalFrame[frmPrev] > spdPrev
				&& _dataObj.colorData[k] < spdNext)) {
				_dataObj.colorData[k] -= g_workObj.arrivalFrame[frmPrev];
			} else {
				if (_dataObj.colorData[k] < spdPrev) {
					spdk -= 2;
					spdNext = spdPrev;
					spdPrev = _dataObj.speedData[spdk];
				}
				tmpObj = getArrowStartFrame(_dataObj.colorData[k], _speedOnFrame, _motionOnFrame);
				frmPrev = tmpObj.frm;
				_dataObj.colorData[k] = tmpObj.frm;
				g_workObj.arrivalFrame[frmPrev] = tmpObj.arrivalFrm;
			}
			pushColors(``, _dataObj.colorData[k], _dataObj.colorData[k + 1], _dataObj.colorData[k + 2].replace(`0x`, `#`));
		}
	}

	// 全体色変化のタイミング更新
	if (_dataObj.acolorData !== undefined && _dataObj.acolorData.length >= 3) {

		for (let k = _dataObj.acolorData.length - 3; k >= 0; k -= 3) {
			pushColors(`A`, _dataObj.acolorData[k], _dataObj.acolorData[k + 1], _dataObj.acolorData[k + 2].replace(`0x`, `#`));
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

	while (g_distY - obj.startY > 0) {
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

	if (_val < 30) {
		// 矢印の色変化
		if (g_workObj[`mk${_header}Color`][_frame] === undefined) {
			g_workObj[`mk${_header}Color`][_frame] = [];
			g_workObj[`mk${_header}ColorCd`][_frame] = [];
		}
		if (_val < 20) {
			const realVal = g_workObj.replaceNums[_val];
			g_workObj[`mk${_header}Color`][_frame].push(realVal);
			g_workObj[`mk${_header}ColorCd`][_frame].push(_colorCd);
		} else if (_val >= 20) {
			const colorNum = _val - 20;
			for (let j = 0; j < keyNum; j++) {
				if (g_keyObj[`color${keyCtrlPtn}`][j] === colorNum) {
					g_workObj[`mk${_header}Color`][_frame].push(j);
					g_workObj[`mk${_header}ColorCd`][_frame].push(_colorCd);
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
			g_workObj[`mkF${_header}ColorCd`][_frame].push(_colorCd);
		} else if (_val < 60) {
			const tmpVal = (_val % 50) * 2;
			g_workObj[`mkF${_header}Color`][_frame].push(tmpVal, tmpVal + 1);
			g_workObj[`mkF${_header}ColorCd`][_frame].push(_colorCd, _colorCd);
		} else {
			if (_val === 60) {
				g_workObj[`mkF${_header}Color`][_frame].push(0, 1, 2, 3, 4, 5, 6, 7);
			} else {
				g_workObj[`mkF${_header}Color`][_frame].push(10, 11, 12, 13, 14, 15, 16, 17);
			}
			g_workObj[`mkF${_header}ColorCd`][_frame].push(_colorCd, _colorCd, _colorCd, _colorCd, _colorCd, _colorCd, _colorCd, _colorCd);
		}
	}
}

/**
 * メイン画面前の初期化処理
 */
function getArrowSettings() {

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;
	const posMax = (g_keyObj[`divMax${keyCtrlPtn}`] !== undefined ? g_keyObj[`divMax${keyCtrlPtn}`] : g_keyObj[`pos${keyCtrlPtn}`][keyNum - 1] + 1);
	const divideCnt = g_keyObj[`div${keyCtrlPtn}`];
	if (g_keyObj[`blank${keyCtrlPtn}`] !== undefined) {
		g_keyObj.blank = g_keyObj[`blank${keyCtrlPtn}`];
	} else {
		g_keyObj.blank = g_keyObj.blank_def;
	}

	g_workObj.stepX = [];
	g_workObj.scrollDir = [];
	g_workObj.dividePos = [];
	g_workObj.stepRtn = JSON.parse(JSON.stringify(g_keyObj[`stepRtn${keyCtrlPtn}`]));
	g_workObj.keyCtrl = JSON.parse(JSON.stringify(g_keyObj[`keyCtrl${keyCtrlPtn}`]));
	g_workObj.keyHitFlg = [];
	for (let j = 0; j < g_workObj.keyCtrl.length; j++) {
		g_workObj.keyHitFlg[j] = [];
		for (let k = 0; k < g_workObj.keyCtrl[j].length; k++) {
			g_workObj.keyHitFlg[j][k] = false;
		}
	}

	g_workObj.judgArrowCnt = [];
	g_workObj.judgFrzCnt = [];
	g_workObj.judgFrzHitCnt = [];
	g_judgObj.lockFlgs = [];

	// 矢印色管理 (個別)
	g_workObj.arrowColors = [];
	g_workObj.frzNormalColors = [];
	g_workObj.frzNormalBarColors = [];
	g_workObj.frzHitColors = [];
	g_workObj.frzHitBarColors = [];

	// 矢印色管理 (全体)
	g_workObj.arrowColorsAll = [];
	g_workObj.frzNormalColorsAll = [];
	g_workObj.frzNormalBarColorsAll = [];
	g_workObj.frzHitColorsAll = [];
	g_workObj.frzHitBarColorsAll = [];

	for (let j = 0; j < keyNum; j++) {

		const posj = g_keyObj[`pos${keyCtrlPtn}`][j];
		const leftCnt = (posj >= divideCnt ? posj - divideCnt : posj);
		const stdPos = (posj >= divideCnt ? leftCnt + 1 - (posMax - (divideCnt - 1)) / 2 : leftCnt - (divideCnt - 1) / 2);
		g_workObj.stepX[j] = g_keyObj.blank * stdPos + g_sWidth / 2 - 25;

		if (g_stateObj.reverse === C_FLG_ON) {
			g_workObj.dividePos[j] = (posj >= divideCnt ? 0 : 1);
			g_workObj.scrollDir[j] = (posj >= divideCnt ? 1 : -1);
		} else {
			g_workObj.dividePos[j] = (posj >= divideCnt ? 1 : 0);
			g_workObj.scrollDir[j] = (posj >= divideCnt ? -1 : 1);
		}

		g_workObj.judgArrowCnt[j] = 1;
		g_workObj.judgFrzCnt[j] = 1;
		g_workObj.judgFrzHitCnt[j] = 1;
		g_judgObj.lockFlgs[j] = false;

		g_workObj.arrowColors[j] = g_headerObj.setColor[g_keyObj[`color${keyCtrlPtn}`][j]];

		g_workObj.frzNormalColors[j] = g_headerObj.frzColor[g_keyObj[`color${keyCtrlPtn}`][j]][0];
		g_workObj.frzNormalBarColors[j] = g_headerObj.frzColor[g_keyObj[`color${keyCtrlPtn}`][j]][1];
		g_workObj.frzHitColors[j] = g_headerObj.frzColor[g_keyObj[`color${keyCtrlPtn}`][j]][2];
		g_workObj.frzHitBarColors[j] = g_headerObj.frzColor[g_keyObj[`color${keyCtrlPtn}`][j]][3];

		g_workObj.arrowColorsAll[j] = g_headerObj.setColor[g_keyObj[`color${keyCtrlPtn}`][j]];

		g_workObj.frzNormalColorsAll[j] = g_headerObj.frzColor[g_keyObj[`color${keyCtrlPtn}`][j]][0];
		g_workObj.frzNormalBarColorsAll[j] = g_headerObj.frzColor[g_keyObj[`color${keyCtrlPtn}`][j]][1];
		g_workObj.frzHitColorsAll[j] = g_headerObj.frzColor[g_keyObj[`color${keyCtrlPtn}`][j]][2];
		g_workObj.frzHitBarColorsAll[j] = g_headerObj.frzColor[g_keyObj[`color${keyCtrlPtn}`][j]][3];
	}

	g_resultObj.ii = 0;
	g_resultObj.shakin = 0;
	g_resultObj.matari = 0;
	g_resultObj.shobon = 0;
	g_resultObj.uwan = 0;
	g_resultObj.combo = 0;
	g_resultObj.maxCombo = 0;

	g_resultObj.kita = 0;
	g_resultObj.sfsf = 0;
	g_resultObj.iknai = 0;
	g_resultObj.fCombo = 0;
	g_resultObj.fmaxCombo = 0;

	g_workObj.lifeVal = Math.round(g_workObj.lifeInit);
	g_gameOverFlg = false;

	if (g_stateObj.dataSaveFlg && setVal(g_keyObj[`transKey${keyCtrlPtn}`], ``, `string`) === ``) {

		// ローカルストレージへAdjustment, Volumeを保存
		g_localStorage.adjustment = g_stateObj.adjustment;
		g_localStorage.volume = g_stateObj.volume;
		localStorage.setItem(location.href, JSON.stringify(g_localStorage));

		// ローカルストレージ(キー別)へデータ保存　※特殊キーは除く
		if (!g_stateObj.extraKeyFlg) {
			g_localKeyStorage.reverse = g_stateObj.reverse;
			if (g_keyObj.currentPtn !== -1) {
				g_localKeyStorage.keyCtrlPtn = g_keyObj.currentPtn;
			}
			const localPtn = `${g_keyObj.currentKey}_-1`;
			for (let j = 0; j < keyNum; j++) {
				g_localKeyStorage.keyCtrl[j] = [];
				for (let k = 0; k < g_keyObj[`keyCtrl${keyCtrlPtn}`][j].length; k++) {
					g_localKeyStorage.keyCtrl[j][k] = g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k];
					if (g_keyObj.currentPtn !== -1) {
						g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k] = g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k];
					}
				}
				if (g_keyObj[`keyCtrl${localPtn}`] !== undefined) {
					if (g_keyObj[`keyCtrl${keyCtrlPtn}`][j].length < g_keyObj[`keyCtrl${localPtn}`][j].length) {
						for (let k = g_keyObj[`keyCtrl${keyCtrlPtn}`][j].length; k < g_keyObj[`keyCtrl${localPtn}`][j].length; k++) {
							g_localKeyStorage.keyCtrl[j][k] = undefined;
						}
					}
				}
			}
			localStorage.setItem(`danonicw-${g_keyObj.currentKey}k`, JSON.stringify(g_localKeyStorage));
		}
	}
}

/*-----------------------------------------------------------*/
/* Scene : MAIN [banana] */
/*-----------------------------------------------------------*/

/**
 * メイン画面初期化
 */
function MainInit() {
	drawDefaultBackImage(`Main`);
	const divRoot = document.querySelector(`#divRoot`);

	g_currentArrows = 0;
	g_workObj.fadeInNo = [];
	g_workObj.fadeOutNo = [];
	g_workObj.fadingFrame = [];
	g_workObj.lastFadeFrame = [];
	g_workObj.wordFadeFrame = [];

	for (let j = 0; j <= g_scoreObj.wordMaxDepth; j++) {
		g_workObj.fadeInNo[j] = 0;
		g_workObj.fadeOutNo[j] = 0;
		g_workObj.fadingFrame[j] = 0;
		g_workObj.lastFadeFrame[j] = 0;
		g_workObj.wordFadeFrame[j] = 0;
	}

	// 背景スプライトを作成
	createSprite(`divRoot`, `backSprite`, 0, 0, g_sWidth, g_sHeight);
	for (let j = 0; j <= g_scoreObj.backMaxDepth; j++) {
		createSprite(`backSprite`, `backSprite${j}`, 0, 0, g_sWidth, g_sHeight);
	}

	// ステップゾーン、矢印のメインスプライトを作成
	const mainSprite = createSprite(`divRoot`, `mainSprite`, 0, 0, g_sWidth, g_sHeight);

	// 曲情報・判定カウント用スプライトを作成（メインスプライトより上位）
	const infoSprite = createSprite(`divRoot`, `infoSprite`, 0, 0, g_sWidth, g_sHeight);

	// 判定系スプライトを作成（メインスプライトより上位）
	const judgeSprite = createSprite(`divRoot`, `judgeSprite`, 0, 0, g_sWidth, g_sHeight);

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`chara${keyCtrlPtn}`].length;

	// マスクスプライトを作成 (最上位)
	const maskSprite = createSprite(`divRoot`, `maskSprite`, 0, 0, g_sWidth, g_sHeight);
	for (let j = 0; j <= g_scoreObj.maskMaxDepth; j++) {
		createSprite(`maskSprite`, `maskSprite${j}`, 0, 0, g_sWidth, g_sHeight);
	}

	// ステップゾーンを表示
	for (let j = 0; j < keyNum; j++) {
		const step = createArrowEffect(`step${j}`, `#999999`,
			g_workObj.stepX[j],
			g_stepY + (g_distY - g_stepY - 50) * g_workObj.dividePos[j], 50,
			g_workObj.stepRtn[j]);
		mainSprite.appendChild(step);

		const stepHit = createArrowEffect(`stepHit${j}`, `#999999`,
			g_workObj.stepX[j] - 15,
			g_stepY + (g_distY - g_stepY - 50) * g_workObj.dividePos[j] - 15, 80,
			g_workObj.stepRtn[j]);
		stepHit.style.opacity = 0;
		stepHit.setAttribute(`cnt`, 0);
		mainSprite.appendChild(stepHit);

		// ステップゾーンOFF設定
		if (g_stateObj.d_stepzone === C_FLG_OFF) {
			step.style.display = C_DIS_NONE;
		}
	}

	// 矢印・フリーズアロー・速度変化 移動/判定/変化対象の初期化
	const arrowCnts = [];
	const frzCnts = [];
	for (let j = 0; j < keyNum; j++) {
		arrowCnts[j] = 0;
		frzCnts[j] = 0;
	}
	let speedCnts = 0;
	let boostCnts = 0;

	// 現在の矢印・フリーズアローの速度、個別加算速度の初期化 (速度変化時に直す)
	g_workObj.currentSpeed = 2;
	g_workObj.boostSpd = 1;

	// 開始位置、楽曲再生位置の設定
	const firstFrame = g_scoreObj.frameNum;
	const musicStartFrame = firstFrame + g_headerObj.blankFrame;
	g_audio.volume = 0;
	if (firstFrame === 0) {
		g_audio.volume = g_stateObj.volume / 100;
	}

	// 曲時間制御変数
	let thisTime;
	let buffTime;
	let musicStartTime;
	let musicStartFlg = false;

	g_inputKeyBuffer = [];

	// 終了時間の設定
	let duration = g_audio.duration;
	let fadeOutFrame = Infinity;
	const preblankFrameForTime = Number(g_headerObj.blankFrame - g_headerObj.blankFrameDef);

	// フェードアウト時間指定の場合、その7秒(=420フレーム)後に終了する
	if (g_headerObj.fadeFrame !== undefined) {
		if (isNaN(parseInt(g_headerObj.fadeFrame[g_stateObj.scoreId]))) {
		} else {
			fadeOutFrame = parseInt(g_headerObj.fadeFrame[g_stateObj.scoreId]);
			duration = (fadeOutFrame + preblankFrameForTime - g_headerObj.blankFrame) / 60;
			fadeOutFrame = (fadeOutFrame - g_headerObj.blankFrame) / g_headerObj.playbackRate + g_headerObj.blankFrame;
		}
	}

	// 終了時間指定の場合、その値を適用する
	let endFrameUseFlg = false;
	if (g_headerObj.endFrame !== undefined) {
		if (!isNaN(parseInt(g_headerObj.endFrame[g_stateObj.scoreId]))) {
			duration = (parseInt(g_headerObj.endFrame[g_stateObj.scoreId]) - g_headerObj.blankFrame) / 60;
			endFrameUseFlg = true;
		} else if (!isNaN(parseInt(g_headerObj.endFrame[0]))) {
			duration = (parseInt(g_headerObj.endFrame[0]) - g_headerObj.blankFrame) / 60;
			endFrameUseFlg = true;
		}
	}

	let fullSecond = Math.ceil(g_headerObj.blankFrame / 60 + duration / g_headerObj.playbackRate);
	if (fadeOutFrame !== Infinity && !endFrameUseFlg) {
		fullSecond += Math.ceil(C_FRM_AFTERFADE / 60);
	}

	const fullMin = Math.floor(fullSecond / 60);
	const fullSec = `00${Math.floor(fullSecond % 60)}`.slice(-2);
	const fullTime = `${fullMin}:${fullSec}`;

	// フレーム数
	const lblframe = createDivLabel(`lblframe`, 0, 0, 100, 30, 20, C_CLR_TITLE,
		g_scoreObj.frameNum);
	divRoot.appendChild(lblframe);

	// ライフ(数字)
	const lblLife = createDivLabel(`lblLife`, 0, 30, 70, 20, 16, C_CLR_TITLE,
		g_workObj.lifeVal);
	let lblInitColor;
	if (g_workObj.lifeVal === C_VAL_MAXLIFE) {
		lblInitColor = C_CLR_MAXLIFE;
	} else if (g_workObj.lifeVal >= g_workObj.lifeBorder) {
		lblInitColor = C_CLR_CLEARLIFE;
	} else {
		lblInitColor = C_CLR_DEFAULTLIFE;
	}
	lblLife.style.backgroundColor = lblInitColor;
	infoSprite.appendChild(lblLife);

	// ライフ背景
	const lifeBackObj = createColorObject(`lifeBackObj`, C_CLR_BACKLIFE,
		5, 50,
		15, g_sHeight - 100, 0, `lifeBar`);
	infoSprite.appendChild(lifeBackObj);

	// ライフ本体
	const lifeBar = createColorObject(`lifeBar`, lblInitColor,
		5, 50 + (g_sHeight - 100) * (C_VAL_MAXLIFE - g_workObj.lifeVal) / C_VAL_MAXLIFE,
		15, (g_sHeight - 100) * g_workObj.lifeVal / C_VAL_MAXLIFE, 0, `lifeBar`);
	infoSprite.appendChild(lifeBar);

	// ライフ：ボーダーライン
	// この背景の画像は40x16で作成しているが、`padding-right:5px`があるためサイズを35x16で作成
	const lifeBorderObj = createColorObject(`lifeBorderObj`, C_CLR_BORDER,
		5, 42 + (g_sHeight - 100) * (C_VAL_MAXLIFE - g_workObj.lifeBorder) / C_VAL_MAXLIFE,
		35, 16, 0, `lifeBorder`);
	lifeBorderObj.innerHTML = g_workObj.lifeBorder;
	lifeBorderObj.style.textAlign = C_ALIGN_RIGHT;
	lifeBorderObj.style.paddingRight = `5px`;
	lifeBorderObj.style.fontFamily = getBasicFont();
	lifeBorderObj.style.fontSize = `14px`;
	lifeBorderObj.style.color = `#cccccc`;
	infoSprite.appendChild(lifeBorderObj);

	if (g_stateObj.lifeBorder === 0 || g_workObj.lifeVal === C_VAL_MAXLIFE) {
		lifeBorderObj.style.display = C_DIS_NONE;
	}

	// 判定カウンタ表示
	infoSprite.appendChild(makeCounterSymbol(`lblIi`, g_sWidth - 110, C_CLR_II, 1, 0));
	infoSprite.appendChild(makeCounterSymbol(`lblShakin`, g_sWidth - 110, C_CLR_SHAKIN, 2, 0));
	infoSprite.appendChild(makeCounterSymbol(`lblMatari`, g_sWidth - 110, C_CLR_MATARI, 3, 0));
	infoSprite.appendChild(makeCounterSymbol(`lblShobon`, g_sWidth - 110, C_CLR_SHOBON, 4, 0));
	infoSprite.appendChild(makeCounterSymbol(`lblUwan`, g_sWidth - 110, C_CLR_UWAN, 5, 0));
	infoSprite.appendChild(makeCounterSymbol(`lblMCombo`, g_sWidth - 110, `#ffffff`, 6, 0));

	infoSprite.appendChild(makeCounterSymbol(`lblKita`, g_sWidth - 110, C_CLR_KITA, 8, 0));
	infoSprite.appendChild(makeCounterSymbol(`lblIknai`, g_sWidth - 110, C_CLR_IKNAI, 9, 0));
	infoSprite.appendChild(makeCounterSymbol(`lblFCombo`, g_sWidth - 110, `#ffffff`, 10, 0));

	// 歌詞表示
	createSprite(`judgeSprite`, `wordSprite`, 0, 0, g_sWidth, g_sHeight);
	for (let j = 0; j <= g_scoreObj.wordMaxDepth; j++) {
		let lblWord;
		if (j % 2 === 0) {
			lblWord = createSprite(`wordSprite`, `lblword${j}`, 100, 10, g_sWidth - 200, 30);
		} else {
			lblWord = createSprite(`wordSprite`, `lblword${j}`, 100, g_sHeight - 60, g_sWidth - 200, 20);
		}
		lblWord.style.fontSize = `14px`;
		lblWord.style.color = `#ffffff`;
		lblWord.style.fontFamily = getBasicFont();
		lblWord.style.textAlign = C_ALIGN_LEFT;
		lblWord.innerHTML = ``;
	}

	// 曲名・アーティスト名表示
	const musicTitle = g_headerObj.musicTitles[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.musicTitle;
	const artistName = g_headerObj.artistNames[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.artistName;
	const lblCredit = createDivLabel(`lblCredit`, 125, g_sHeight - 30, g_sWidth - 125, 20, 14, `#cccccc`,
		`${musicTitle} / ${artistName}`);
	lblCredit.style.textAlign = C_ALIGN_LEFT;
	infoSprite.appendChild(lblCredit);

	// 曲時間表示：現在時間
	const lblTime1 = createDivLabel(`lblTime1`, 18, g_sHeight - 30, 40, 20, 14, `#cccccc`,
		`-:--`);
	lblTime1.style.textAlign = C_ALIGN_RIGHT;
	infoSprite.appendChild(lblTime1);

	// 曲時間表示：総時間
	const lblTime2 = createDivLabel(`lblTime2`, 60, g_sHeight - 30, 60, 20, 14, `#cccccc`,
		`/ ${fullTime}`);
	lblTime1.style.textAlign = C_ALIGN_RIGHT;
	infoSprite.appendChild(lblTime2);

	// 判定キャラクタ表示：矢印
	const charaJ = createDivLabel(`charaJ`, g_sWidth / 2 - 200, g_sHeight / 2 - 50,
		C_LEN_JDGCHARA_WIDTH, C_LEN_JDGCHARA_HEIGHT, C_SIZ_JDGCHARA, C_CLR_II, ``);
	charaJ.style.textAlign = C_ALIGN_CENTER;
	charaJ.setAttribute(`cnt`, 0);
	judgeSprite.appendChild(charaJ);

	// コンボ表示：矢印
	const comboJ = createDivLabel(`comboJ`, g_sWidth / 2 - 50, g_sHeight / 2 - 50,
		C_LEN_JDGCHARA_WIDTH, C_LEN_JDGCHARA_HEIGHT, C_SIZ_JDGCHARA, C_CLR_KITA, ``);
	comboJ.style.textAlign = C_ALIGN_CENTER;
	comboJ.setAttribute(`cnt`, 0);
	judgeSprite.appendChild(comboJ);

	// 判定キャラクタ表示：フリーズアロー
	const charaFJ = createDivLabel(`charaFJ`, g_sWidth / 2 - 100, g_sHeight / 2,
		C_LEN_JDGCHARA_WIDTH, C_LEN_JDGCHARA_HEIGHT, C_SIZ_JDGCHARA, C_CLR_KITA, ``);
	charaFJ.style.textAlign = C_ALIGN_CENTER;
	charaFJ.setAttribute(`cnt`, 0);
	judgeSprite.appendChild(charaFJ);

	// コンボ表示：フリーズアロー
	const comboFJ = createDivLabel(`comboFJ`, g_sWidth / 2 + 50, g_sHeight / 2,
		C_LEN_JDGCHARA_WIDTH, C_LEN_JDGCHARA_HEIGHT, C_SIZ_JDGCHARA, C_CLR_II, ``);
	comboFJ.style.textAlign = C_ALIGN_CENTER;
	comboFJ.setAttribute(`cnt`, 0);
	judgeSprite.appendChild(comboFJ);

	// パーフェクト演出
	const finishView = createDivLabel(`finishView`, g_sWidth / 2 - 150, g_sHeight / 2 - 50,
		300, 20, 50, C_CLR_KITA, ``);
	finishView.style.textAlign = C_ALIGN_CENTER;
	judgeSprite.appendChild(finishView);

	// 判定系OFF設定
	if (g_stateObj.d_judgement === C_FLG_OFF) {
		document.querySelector(`#lblIi`).style.display = C_DIS_NONE;
		document.querySelector(`#lblShakin`).style.display = C_DIS_NONE;
		document.querySelector(`#lblMatari`).style.display = C_DIS_NONE;
		document.querySelector(`#lblShobon`).style.display = C_DIS_NONE;
		document.querySelector(`#lblUwan`).style.display = C_DIS_NONE;
		document.querySelector(`#lblMCombo`).style.display = C_DIS_NONE;

		document.querySelector(`#lblKita`).style.display = C_DIS_NONE;
		document.querySelector(`#lblIknai`).style.display = C_DIS_NONE;
		document.querySelector(`#lblFCombo`).style.display = C_DIS_NONE;

		document.querySelector(`#comboJ`).style.display = C_DIS_NONE;
		document.querySelector(`#charaJ`).style.display = C_DIS_NONE;
		document.querySelector(`#comboFJ`).style.display = C_DIS_NONE;
		document.querySelector(`#charaFJ`).style.display = C_DIS_NONE;
	}

	// 曲情報OFF
	if (g_stateObj.d_musicinfo === C_FLG_OFF) {
		document.querySelector(`#lblCredit`).style.left = `20px`;
		document.querySelector(`#lblTime1`).style.display = C_DIS_NONE;
		document.querySelector(`#lblTime2`).style.display = C_DIS_NONE;
	}

	// ライフゲージOFF (フレーム数もテスト的に消す)
	if (g_stateObj.d_lifegauge === C_FLG_OFF) {
		document.querySelector(`#lblLife`).style.display = C_DIS_NONE;
		document.querySelector(`#lifeBackObj`).style.display = C_DIS_NONE;
		document.querySelector(`#lifeBar`).style.display = C_DIS_NONE;
		document.querySelector(`#lifeBorderObj`).style.display = C_DIS_NONE;
		document.querySelector(`#lblframe`).style.display = C_DIS_NONE;
	}

	// ローカル時のみフレーム数を残す
	if (location.href.match(`^file`)) {
	} else {
		document.querySelector(`#lblframe`).style.display = C_DIS_NONE;
	}

	// ユーザカスタムイベント(初期)
	if (typeof customMainInit === `function`) {
		g_scoreObj.baseFrame = g_scoreObj.frameNum - g_stateObj.realAdjustment;
		customMainInit();
		if (typeof customMainInit2 === `function`) {
			customMainInit2();
		}
	}

	// Ready?表示
	if (g_headerObj.customReadyUse === `false`) {
		const lblReady = createDivLabel(`lblReady`, g_sWidth / 2 - 100, g_sHeight / 2 - 75,
			200, 50, 40, C_CLR_TITLE,
			`<span style='color:` + g_headerObj.setColor[0] + `;font-size:60px;'>R</span>EADY<span style='font-size:50px;'>?</span>`);
		divRoot.appendChild(lblReady);
		lblReady.style.animationDuration = `2.5s`;
		lblReady.style.animationName = `leftToRightFade`;
		lblReady.style.opacity = 0;
	}

	// キー操作イベント
	document.onkeydown = evt => {

		// ブラウザ判定
		let setKey;
		if (g_userAgent.indexOf(`firefox`) !== -1) {
			setKey = evt.which;
		} else {
			setKey = event.keyCode;
		}
		g_inputKeyBuffer[setKey] = true;

		eval(`mainKeyDownAct${g_stateObj.autoPlay}`)(setKey);

		// 曲中リトライ、タイトルバック
		if (setKey === 8) {
			g_audio.pause();
			clearTimeout(g_timeoutEvtId);
			clearWindow();
			musicAfterLoaded();

		} else if (setKey === 46) {
			g_audio.pause();
			clearTimeout(g_timeoutEvtId);
			setTimeout(_ => {
				clearWindow();
				if (keyIsDown(16)) {
					g_gameOverFlg = true;
					resultInit();
				} else {
					titleInit();
				}
			}, 200);
		}

		for (let j = 0; j < C_BLOCK_KEYS.length; j++) {
			if (setKey === C_BLOCK_KEYS[j]) {
				return false;
			}
		}
	}

	/**
	 * キーを押したときの処理 (AutoPlay:OFF時)
	 * @param {number} _keyCode 
	 */
	function mainKeyDownActOFF(_keyCode) {
		const matchKeys = g_keyObj[`keyCtrl${keyCtrlPtn}`];

		for (let j = 0; j < keyNum; j++) {
			for (let k = 0; k < matchKeys[j].length; k++) {
				if (_keyCode === matchKeys[j][k] && !g_workObj.keyHitFlg[j][k]) {
					judgeArrow(j);
				}
			}
		}
	}

	/**
	 * キーを押したときの処理 (AutoPlay:ON時)
	 * @param {number} _keyCode 
	 */
	function mainKeyDownActON(_keyCode) {

	}

	document.onkeyup = evt => {
		// ブラウザ判定
		let setKey;
		if (g_userAgent.indexOf(`firefox`) !== -1) {
			setKey = evt.which;
		} else {
			setKey = event.keyCode;
		}
		g_inputKeyBuffer[setKey] = false;

		eval(`mainKeyUpAct${g_stateObj.autoPlay}`)();
	}

	/**
	 * キーを離したときの処理 (AutoPlay:OFF時)
	 */
	function mainKeyUpActOFF() {
		for (let j = 0; j < keyNum; j++) {

			let keyDownFlg = false;
			for (let m = 0, len = g_workObj.keyCtrl[j].length; m < len; m++) {
				if (keyIsDown(g_workObj.keyCtrl[j][m])) {
					keyDownFlg = true;
					break;
				}
			}
			if (!keyDownFlg) {

				// ステップゾーンに対応するキーを離したとき
				const stepDiv = document.querySelector(`#step${j}`);
				stepDiv.style.backgroundColor = `#999999`;

			}
		}
	}

	/**
	 * キーを離したときの処理 (AutoPlay:ON時)
	 */
	function mainKeyUpActON() {

	}

	/**
	 * フレーム処理(譜面台)
	 */
	function flowTimeline() {
		lblframe.innerHTML = g_scoreObj.frameNum;

		// キーの押下状態を取得
		for (let j = 0; j < keyNum; j++) {
			for (let m = 0, len = g_workObj.keyCtrl[j].length; m < len; m++) {
				g_workObj.keyHitFlg[j][m] = keyIsDown(g_workObj.keyCtrl[j][m]);
			}
		}

		if (g_scoreObj.frameNum === musicStartFrame) {
			musicStartFlg = true;
			g_audio.currentTime = firstFrame / 60 * g_headerObj.playbackRate;
			g_audio.playbackRate = g_headerObj.playbackRate;
			g_audio.play();
			musicStartTime = performance.now();
			g_audio.dispatchEvent(new CustomEvent(`timeupdate`));
		}

		// フェードイン・アウト
		if (g_audio.volume >= g_stateObj.volume / 100) {
			musicStartFlg = false;
			if (g_scoreObj.frameNum >= fadeOutFrame && g_scoreObj.frameNum < fadeOutFrame + C_FRM_AFTERFADE) {
				const tmpVolume = (g_audio.volume - (3 * g_stateObj.volume / 100) / 1000);
				if (tmpVolume < 0) {
					g_audio.volume = 0;
				} else {
					g_audio.volume = tmpVolume;
				}
			}
		} else {
			if (musicStartFlg) {
				const tmpVolume = (g_audio.volume + (3 * g_stateObj.volume / 100) / 1000);
				if (tmpVolume > 1) {
					g_audio.volume = 1;
				} else {
					g_audio.volume = tmpVolume;
				}
			} else if (g_scoreObj.frameNum >= fadeOutFrame && g_scoreObj.frameNum < fadeOutFrame + C_FRM_AFTERFADE) {
				const tmpVolume = (g_audio.volume - (3 * g_stateObj.volume / 100) / 1000);
				if (tmpVolume < 0) {
					g_audio.volume = 0;
				} else {
					g_audio.volume = tmpVolume;
				}
			}
		}

		// ユーザカスタムイベント(フレーム毎)
		if (typeof customMainEnterFrame === `function`) {
			customMainEnterFrame();
			if (typeof customMainEnterFrame2 === `function`) {
				customMainEnterFrame2();
			}
			g_scoreObj.baseFrame++;
		}

		// 速度変化 (途中変速, 個別加速)
		if (g_workObj.speedData !== undefined && g_scoreObj.frameNum === g_workObj.speedData[speedCnts]) {
			g_workObj.currentSpeed = g_workObj.speedData[speedCnts + 1];
			speedCnts += 2;
		}
		if (g_workObj.boostData !== undefined && g_scoreObj.frameNum === g_workObj.boostData[boostCnts]) {
			g_workObj.boostSpd = g_workObj.boostData[boostCnts + 1];
			boostCnts += 2;
		}

		// 個別色変化 (矢印)
		changeArrowColors(g_workObj.mkColor[g_scoreObj.frameNum], g_workObj.mkColorCd[g_scoreObj.frameNum], ``);

		// 個別色変化（フリーズアロー）
		changeFrzColors(g_workObj.mkFColor[g_scoreObj.frameNum], g_workObj.mkFColorCd[g_scoreObj.frameNum],
			g_keyObj[`color${keyCtrlPtn}`], keyNum, ``);

		// 全体色変化 (矢印)
		changeArrowColors(g_workObj.mkAColor[g_scoreObj.frameNum], g_workObj.mkAColorCd[g_scoreObj.frameNum], `A`);

		// 全体色変化 (フリーズアロー)
		changeFrzColors(g_workObj.mkFAColor[g_scoreObj.frameNum], g_workObj.mkFAColorCd[g_scoreObj.frameNum],
			g_keyObj[`color${keyCtrlPtn}`], keyNum, `A`);

		// 矢印生成
		if (g_workObj.mkArrow[g_scoreObj.frameNum] !== undefined) {
			for (let j = 0, len = g_workObj.mkArrow[g_scoreObj.frameNum].length; j < len; j++) {

				const targetj = g_workObj.mkArrow[g_scoreObj.frameNum][j];
				const boostSpdDir = g_workObj.boostSpd * g_workObj.scrollDir[targetj];

				const step = createArrowEffect(`arrow${targetj}_${++arrowCnts[targetj]}`, g_workObj.arrowColors[targetj],
					g_workObj.stepX[targetj],
					g_stepY + (g_distY - g_stepY - 50) * g_workObj.dividePos[targetj] + g_workObj.initY[g_scoreObj.frameNum] * boostSpdDir, 50,
					g_workObj.stepRtn[targetj]);
				step.setAttribute(`cnt`, g_workObj.arrivalFrame[g_scoreObj.frameNum] + 1);
				step.setAttribute(`boostCnt`, g_workObj.motionFrame[g_scoreObj.frameNum]);
				step.setAttribute(`judgEndFlg`, `false`);
				step.setAttribute(`boostSpd`, boostSpdDir);

				mainSprite.appendChild(step);
			}
		}

		// 矢印移動＆消去
		for (let j = 0; j < keyNum; j++) {

			const stepDivHit = document.querySelector(`#stepHit${j}`);

			for (let k = g_workObj.judgArrowCnt[j]; k <= arrowCnts[j]; k++) {
				const arrow = document.querySelector(`#arrow${j}_${k}`);
				let boostCnt = arrow.getAttribute(`boostCnt`);
				const boostSpdDir = arrow.getAttribute(`boostSpd`);
				let cnt = arrow.getAttribute(`cnt`);

				// 全体色変化 (移動時)
				if (g_workObj.mkAColor[g_scoreObj.frameNum] !== undefined) {
					if (arrow.getAttribute(`color`) !== g_workObj.arrowColors[j]) {
						if (g_workObj.arrowColors[j] === g_workObj.arrowColorsAll[j]) {
							arrow.style.backgroundColor = g_workObj.arrowColorsAll[j];
							arrow.setAttribute(`color`, g_workObj.arrowColorsAll[j]);
						}
					}
				}

				// 移動
				if (g_workObj.currentSpeed !== 0) {
					arrow.style.top = `${parseFloat(arrow.style.top) -
						(g_workObj.currentSpeed + g_workObj.motionOnFrames[boostCnt]) * boostSpdDir}px`;
					arrow.setAttribute(`boostCnt`, --boostCnt);
				}
				arrow.setAttribute(`cnt`, --cnt);

				if (g_stateObj.autoPlay === C_FLG_ON) {
					if (cnt === 0) {
						judgeIi(cnt);
						stepDivHit.style.opacity = 1;
						stepDivHit.setAttribute(`cnt`, C_FRM_HITMOTION);
						g_workObj.judgArrowCnt[j]++;
						mainSprite.removeChild(arrow);
					}

				} else if (cnt < (-1) * g_judgObj.arrowJ[C_JDG_UWAN]) {
					judgeUwan(cnt);
					g_workObj.judgArrowCnt[j]++;
					mainSprite.removeChild(arrow);
				}
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

		// フリーズアロー生成
		if (g_workObj.mkFrzArrow[g_scoreObj.frameNum] !== undefined) {
			for (let j = 0, len = g_workObj.mkFrzArrow[g_scoreObj.frameNum].length; j < len; j++) {
				const targetj = g_workObj.mkFrzArrow[g_scoreObj.frameNum][j];
				const frzLength = g_workObj.mkFrzLength[targetj][frzCnts[targetj] * 2];
				const boostSpdDir = g_workObj.boostSpd * g_workObj.scrollDir[targetj];

				const frzRoot = createSprite(`mainSprite`, `frz${targetj}_${++frzCnts[targetj]}`,
					g_workObj.stepX[targetj],
					g_stepY + (g_distY - g_stepY - 50) * g_workObj.dividePos[targetj] + g_workObj.initY[g_scoreObj.frameNum] * boostSpdDir,
					50, 100 + frzLength);
				frzRoot.setAttribute(`cnt`, g_workObj.arrivalFrame[g_scoreObj.frameNum] + 1);
				frzRoot.setAttribute(`boostCnt`, g_workObj.motionFrame[g_scoreObj.frameNum]);
				frzRoot.setAttribute(`judgEndFlg`, `false`);
				frzRoot.setAttribute(`isMoving`, `true`);
				frzRoot.setAttribute(`frzBarLength`, frzLength);
				frzRoot.setAttribute(`frzAttempt`, 0);
				frzRoot.setAttribute(`boostSpd`, boostSpdDir);
				frzRoot.setAttribute(`dividePos`, g_workObj.dividePos[targetj]);
				mainSprite.appendChild(frzRoot);

				// フリーズアローは、下記の順で作成する。
				// 後に作成するほど前面に表示される。

				// フリーズアロー帯(frzBar)
				const frzBar = createColorObject(`frzBar${targetj}_${frzCnts[targetj]}`, g_workObj.frzNormalBarColors[targetj],
					5, 25 - frzLength * g_workObj.boostSpd * g_workObj.dividePos[targetj], 40, frzLength * g_workObj.boostSpd, 0, `frzBar`);
				frzRoot.appendChild(frzBar);

				// 開始矢印の塗り部分。ヒット時は前面に出て光る。
				const frzTopShadow = createColorObject(`frzTopShadow${targetj}_${frzCnts[targetj]}`, `#000000`,
					0, 0, 50, 50, g_workObj.stepRtn[targetj], `arrowShadow`);
				frzRoot.appendChild(frzTopShadow);

				// 開始矢印。ヒット時は隠れる。
				const frzTop = createArrowEffect(`frzTop${targetj}_${frzCnts[targetj]}`, g_workObj.frzNormalColors[targetj],
					0, 0, 50, g_workObj.stepRtn[targetj]);
				frzRoot.appendChild(frzTop);

				// 後発矢印の塗り部分
				const frzBtmShadow = createColorObject(`frzBtmShadow${targetj}_${frzCnts[targetj]}`, `#000000`,
					0, frzLength * boostSpdDir, 50, 50, g_workObj.stepRtn[targetj], `arrowShadow`);
				frzRoot.appendChild(frzBtmShadow);

				// 後発矢印
				const frzBtm = createArrowEffect(`frzBtm${targetj}_${frzCnts[targetj]}`, g_workObj.frzNormalColors[targetj],
					0, frzLength * boostSpdDir, 50, g_workObj.stepRtn[targetj]);
				frzRoot.appendChild(frzBtm);
			}
		}

		// フリーズアロー移動＆消去
		for (let j = 0; j < keyNum; j++) {
			for (let k = g_workObj.judgFrzCnt[j]; k <= frzCnts[j]; k++) {
				const frzRoot = document.querySelector(`#frz${j}_${k}`);
				let boostCnt = frzRoot.getAttribute(`boostCnt`);
				const boostSpdDir = frzRoot.getAttribute(`boostSpd`);
				let cnt = frzRoot.getAttribute(`cnt`);
				let frzAttempt = frzRoot.getAttribute(`frzAttempt`);

				const frzTop = document.querySelector(`#frzTop${j}_${k}`);
				const frzBar = document.querySelector(`#frzBar${j}_${k}`);
				const frzBtm = document.querySelector(`#frzBtm${j}_${k}`);
				let frzBarLength = frzRoot.getAttribute(`frzBarLength`);

				if (frzRoot.getAttribute(`judgEndFlg`) === `false`) {
					if (frzRoot.getAttribute(`isMoving`) === `true`) {

						// 全体色変化 (通常時)
						if (g_workObj.mkFAColor[g_scoreObj.frameNum] !== undefined) {
							if (frzBtm.getAttribute(`color`) !== g_workObj.frzNormalColors[j]) {
								if (g_workObj.frzNormalColors[j] === g_workObj.frzNormalColorsAll[j]) {
									frzTop.style.backgroundColor = g_workObj.frzNormalColorsAll[j];
									frzBtm.style.backgroundColor = g_workObj.frzNormalColorsAll[j];
									frzBtm.setAttribute(`color`, g_workObj.frzNormalColorsAll[j]);
								}
							}
							if (frzBar.getAttribute(`color`) !== g_workObj.frzNormalBarColors[j]) {
								if (g_workObj.frzNormalBarColors[j] === g_workObj.frzNormalBarColorsAll[j]) {
									frzBar.style.backgroundColor = g_workObj.frzNormalBarColorsAll[j];
									frzBar.setAttribute(`color`, g_workObj.frzNormalBarColorsAll[j]);
								}
							}
						}

						// 移動
						if (g_workObj.currentSpeed !== 0) {
							frzRoot.style.top = `${parseFloat(frzRoot.style.top) -
								(g_workObj.currentSpeed + g_workObj.motionOnFrames[boostCnt]) * boostSpdDir}px`;
							frzRoot.setAttribute(`boostCnt`, --boostCnt);
						}
						frzRoot.setAttribute(`cnt`, --cnt);

						if (g_stateObj.autoPlay === C_FLG_ON && cnt === 0) {
							changeHitFrz(j, k);
							if (g_headerObj.frzStartjdgUse === `true`) {
								judgeIi(cnt);
							}
						}
					} else {
						const frzBtmShadow = document.querySelector(`#frzBtmShadow${j}_${k}`);

						// 全体色変化 (ヒット時)
						if (g_workObj.mkFAColor[g_scoreObj.frameNum] !== undefined) {
							if (frzBtm.getAttribute(`color`) !== g_workObj.frzHitColors[j]) {
								if (g_workObj.frzHitColors[j] === g_workObj.frzHitColorsAll[j]) {
									frzBtm.style.backgroundColor = g_workObj.frzHitColorsAll[j];
									frzBtm.setAttribute(`color`, g_workObj.frzHitColorsAll[j]);
								}
							}
							if (frzBar.getAttribute(`color`) !== g_workObj.frzHitBarColors[j]) {
								if (g_workObj.frzHitBarColors[j] === g_workObj.frzHitBarColorsAll[j]) {
									frzBar.style.backgroundColor = g_workObj.frzHitBarColorsAll[j];
									frzBar.setAttribute(`color`, g_workObj.frzHitBarColorsAll[j]);
								}
							}
						}

						// フリーズアローがヒット中の処理
						if (frzBarLength > 0) {
							const dividePos = frzRoot.getAttribute(`dividePos`);
							frzBarLength = parseFloat(frzBar.style.height) - g_workObj.currentSpeed * Math.abs(boostSpdDir);
							frzRoot.setAttribute(`frzBarLength`, frzBarLength);
							frzBar.style.height = `${frzBarLength}px`;
							frzBar.style.top = `${parseFloat(frzBar.style.top) + g_workObj.currentSpeed * Math.abs(boostSpdDir) * dividePos}px`;
							frzBtm.style.top = `${parseFloat(frzBtm.style.top) - g_workObj.currentSpeed * boostSpdDir}px`;
							frzBtmShadow.style.top = `${parseFloat(frzBtmShadow.style.top) - g_workObj.currentSpeed * boostSpdDir}px`;

							let keyDownFlg = false;
							for (let m = 0, len = g_workObj.keyCtrl[j].length; m < len; m++) {
								if (g_workObj.keyHitFlg[j][m]) {
									keyDownFlg = true;
									break;
								}
							}
							if (!keyDownFlg && g_stateObj.autoPlay === C_FLG_OFF) {
								frzRoot.setAttribute(`frzAttempt`, ++frzAttempt);

								if (frzAttempt > C_FRM_FRZATTEMPT) {

									// フリーズアローを離したとき
									if (frzRoot.getAttribute(`judgEndFlg`) === `false`) {
										if (frzRoot.getAttribute(`isMoving`) === `false`) {
											judgeIknai(cnt);
											frzRoot.setAttribute(`judgEndFlg`, `true`);

											changeFailedFrz(j, k);
										}
									}
								}
							}
						} else {
							judgeKita(cnt);

							g_workObj.judgFrzCnt[j]++;
							frzRoot.setAttribute(`judgEndFlg`, `true`);
							mainSprite.removeChild(frzRoot);
						}
					}

					// フリーズアローが枠外に出たときの処理
					if (cnt < (-1) * g_judgObj.frzJ[C_JDG_IKNAI]) {
						judgeIknai(cnt);
						frzRoot.setAttribute(`judgEndFlg`, `true`);

						changeFailedFrz(j, k);
						if (g_headerObj.frzStartjdgUse === `true`) {
							judgeUwan(cnt);
						}
					}
				} else {
					frzBarLength -= g_workObj.currentSpeed;
					frzRoot.setAttribute(`frzBarLength`, frzBarLength);
					frzRoot.style.top = `${parseFloat(frzRoot.style.top) - (g_workObj.currentSpeed) * boostSpdDir}px`;

					if (frzBarLength <= 0) {
						g_workObj.judgFrzCnt[j]++;
						mainSprite.removeChild(frzRoot);
					}
				}
			}
		}


		// 歌詞表示
		if (g_scoreObj.wordData[g_scoreObj.frameNum] !== undefined) {
			g_wordObj.wordDir = g_scoreObj.wordData[g_scoreObj.frameNum][0];
			g_wordObj.wordDat = g_scoreObj.wordData[g_scoreObj.frameNum][1];
			g_wordSprite = document.querySelector(`#lblword${g_wordObj.wordDir}`);

			if (g_wordSprite !== null) {
				const wordDepth = Number(g_wordObj.wordDir);
				if (g_wordObj.wordDat === `[fadein]`) {
					g_wordObj[`fadeInFlg${wordDepth}`] = true;
					g_wordObj[`fadeOutFlg${wordDepth}`] = false;
					g_workObj.fadingFrame[wordDepth] = 0;
					g_workObj.lastFadeFrame[wordDepth] = g_scoreObj.frameNum;

					if (g_scoreObj.wordData[g_scoreObj.frameNum].length > 2) {
						g_workObj.wordFadeFrame[wordDepth] = setVal(g_scoreObj.wordData[g_scoreObj.frameNum][2], C_WOD_FRAME, `number`);
					} else {
						g_workObj.wordFadeFrame[wordDepth] = C_WOD_FRAME;
					}

					g_wordSprite.style.animationName = `fadeIn${(++g_workObj.fadeInNo[wordDepth] % 2)}`;
					g_wordSprite.style.animationDuration = `${g_workObj.wordFadeFrame[wordDepth] / 60}s`;
					g_wordSprite.style.animationTimingFunction = `linear`;
					g_wordSprite.style.animationFillMode = `forwards`;

				} else if (g_wordObj.wordDat === `[fadeout]`) {
					g_wordObj[`fadeInFlg${wordDepth}`] = false;
					g_wordObj[`fadeOutFlg${wordDepth}`] = true;
					g_workObj.fadingFrame[wordDepth] = 0;
					g_workObj.lastFadeFrame[wordDepth] = g_scoreObj.frameNum;

					if (g_scoreObj.wordData[g_scoreObj.frameNum].length > 2) {
						g_workObj.wordFadeFrame[wordDepth] = setVal(g_scoreObj.wordData[g_scoreObj.frameNum][2], C_WOD_FRAME, `number`);
					} else {
						g_workObj.wordFadeFrame[wordDepth] = C_WOD_FRAME;
					}

					g_wordSprite.style.animationName = `fadeOut${(++g_workObj.fadeOutNo[wordDepth] % 2)}`;
					g_wordSprite.style.animationDuration = `${g_workObj.wordFadeFrame[wordDepth] / 60}s`;
					g_wordSprite.style.animationTimingFunction = `linear`;
					g_wordSprite.style.animationFillMode = `forwards`;

				} else if (g_wordObj.wordDat === `[center]` ||
					g_wordObj.wordDat === `[left]` || g_wordObj.wordDat === `[right]`) {

				} else {
					g_workObj.fadingFrame = g_scoreObj.frameNum - g_workObj.lastFadeFrame[wordDepth];
					if (g_wordObj[`fadeOutFlg${g_wordObj.wordDir}`]
						&& g_workObj.fadingFrame >= g_workObj.wordFadeFrame[wordDepth]) {
						g_wordSprite.style.animationName = `none`;
						g_wordObj[`fadeOutFlg${g_wordObj.wordDir}`] = false;
					}
					if (g_wordObj[`fadeInFlg${g_wordObj.wordDir}`]
						&& g_workObj.fadingFrame >= g_workObj.wordFadeFrame[wordDepth]) {
						g_wordSprite.style.animationName = `none`;
						g_wordObj[`fadeInFlg${g_wordObj.wordDir}`] = false;
					}
					g_workObj[`word${g_wordObj.wordDir}Data`] = g_wordObj.wordDat;
					g_wordSprite.innerHTML = g_wordObj.wordDat;
				}

				if (g_wordObj.wordDat === `[center]`) {
					g_wordSprite.style.textAlign = C_ALIGN_CENTER;
					g_wordSprite.style.display = `block`;
					g_wordSprite.style.margin = `auto`;
				} else if (g_wordObj.wordDat === `[left]`) {
					g_wordSprite.style.textAlign = C_ALIGN_LEFT;
					g_wordSprite.style.display = `inline`;
					g_wordSprite.style.margin = `0`;
				} else if (g_wordObj.wordDat === `[right]`) {
					g_wordSprite.style.textAlign = C_ALIGN_RIGHT;
					g_wordSprite.style.display = `block`;
					g_wordSprite.style.margin = `auto`;
				}
			}
		}

		// マスク表示・マスクモーション
		if (g_scoreObj.maskData[g_scoreObj.frameNum] !== undefined) {
			const tmpObj = g_scoreObj.maskData[g_scoreObj.frameNum];
			const maskSprite = document.querySelector(`#maskSprite${tmpObj.depth}`);
			if (tmpObj.path !== ``) {
				if (tmpObj.path.indexOf(`.png`) !== -1 || tmpObj.path.indexOf(`.gif`) !== -1 ||
					tmpObj.path.indexOf(`.bmp`) !== -1 || tmpObj.path.indexOf(`.jpg`) !== -1) {

					// imgタグの場合
					let tmpInnerHTML = `<img src=${tmpObj.path} class="${tmpObj.class}"
						style="position:absolute;left:${tmpObj.left}px;top:${tmpObj.top}px`;
					if (tmpObj.width !== 0 && tmpObj.width > 0) {
						tmpInnerHTML += `;width:${tmpObj.width}px`;
					}
					if (tmpObj.height !== `` && setVal(tmpObj.height, 0, `number`) > 0) {
						tmpInnerHTML += `;height:${tmpObj.height}px`;
					}
					tmpInnerHTML += `;animation-name:${tmpObj.animationName}
						;animation-duration:${tmpObj.animationDuration}s
						;opacity:${tmpObj.opacity}">`;
					maskSprite.innerHTML = tmpInnerHTML;

				} else {

					// spanタグの場合
					let tmpInnerHTML = `<span class="${tmpObj.class}"
						style="display:inline-block;position:absolute;left:${tmpObj.left}px;top:${tmpObj.top}px`;

					// この場合のwidthは font-size と解釈する
					if (tmpObj.width !== 0 && tmpObj.width > 0) {
						tmpInnerHTML += `;font-size:${tmpObj.width}px`;
					}

					// この場合のheightは color と解釈する
					if (tmpObj.height !== ``) {
						tmpInnerHTML += `;color:${tmpObj.height}`;
					}
					tmpInnerHTML += `;animation-name:${tmpObj.animationName}
						;animation-duration:${tmpObj.animationDuration}s
						;opacity:${tmpObj.opacity}">${tmpObj.path}</span>`;
					maskSprite.innerHTML = tmpInnerHTML;
				}
			} else {
				maskSprite.innerHTML = ``;
			}

		}

		// 背景表示・背景モーション
		if (g_scoreObj.backData[g_scoreObj.frameNum] !== undefined) {
			const tmpObj = g_scoreObj.backData[g_scoreObj.frameNum];
			const backSprite = document.querySelector(`#backSprite${tmpObj.depth}`);
			if (tmpObj.path !== ``) {
				if (tmpObj.path.indexOf(`.png`) !== -1 || tmpObj.path.indexOf(`.gif`) !== -1 ||
					tmpObj.path.indexOf(`.bmp`) !== -1 || tmpObj.path.indexOf(`.jpg`) !== -1) {

					// imgタグの場合
					let tmpInnerHTML = `<img src=${tmpObj.path} class="${tmpObj.class}"
						style="position:absolute;left:${tmpObj.left}px;top:${tmpObj.top}px`;
					if (tmpObj.width !== 0 && tmpObj.width > 0) {
						tmpInnerHTML += `;width:${tmpObj.width}px`;
					}
					if (tmpObj.height !== `` && setVal(tmpObj.height, 0, `number`) > 0) {
						tmpInnerHTML += `;height:${tmpObj.height}px`;
					}
					tmpInnerHTML += `;animation-name:${tmpObj.animationName}
						;animation-duration:${tmpObj.animationDuration}s
						;opacity:${tmpObj.opacity}">`;
					backSprite.innerHTML = tmpInnerHTML;

				} else {

					// spanタグの場合
					let tmpInnerHTML = `<span class="${tmpObj.class}"
						style="display:inline-block;position:absolute;left:${tmpObj.left}px;top:${tmpObj.top}px`;

					// この場合のwidthは font-size と解釈する
					if (tmpObj.width !== 0 && tmpObj.width > 0) {
						tmpInnerHTML += `;font-size:${tmpObj.width}px`;
					}

					// この場合のheightは color と解釈する
					if (tmpObj.height !== ``) {
						tmpInnerHTML += `;color:${tmpObj.height}`;
					}
					tmpInnerHTML += `;animation-name:${tmpObj.animationName}
						;animation-duration:${tmpObj.animationDuration}s
						;opacity:${tmpObj.opacity}">${tmpObj.path}</span>`;
					backSprite.innerHTML = tmpInnerHTML;
				}
			} else {
				backSprite.innerHTML = ``;
			}

		}

		// 判定キャラクタ消去
		let charaJCnt = document.querySelector(`#charaJ`).getAttribute(`cnt`);
		if (charaJCnt > 0) {
			document.querySelector(`#charaJ`).setAttribute(`cnt`, --charaJCnt);
			if (charaJCnt === 0) {
				document.querySelector(`#charaJ`).innerHTML = ``;
				document.querySelector(`#comboJ`).innerHTML = ``;
			}
		}
		let charaFJCnt = document.querySelector(`#charaFJ`).getAttribute(`cnt`);
		if (charaFJCnt > 0) {
			document.querySelector(`#charaFJ`).setAttribute(`cnt`, --charaFJCnt);
			if (charaFJCnt === 0) {
				document.querySelector(`#charaFJ`).innerHTML = ``;
				document.querySelector(`#comboFJ`).innerHTML = ``;
			}
		}

		// 60fpsから遅延するため、その差分を取って次回のタイミングで遅れをリカバリする
		thisTime = performance.now();
		buffTime = 0;
		if (g_scoreObj.frameNum >= musicStartFrame) {
			buffTime = (thisTime - musicStartTime - (g_scoreObj.frameNum - musicStartFrame) * 1000 / 60);
		}
		g_scoreObj.frameNum++;
		g_timeoutEvtId = setTimeout(_ => flowTimeline(), 1000 / 60 - buffTime);

		// タイマー、曲終了判定
		if (g_scoreObj.frameNum % 60 === 0) {
			const currentSecond = Math.ceil(g_scoreObj.frameNum / 60);
			const currentMin = Math.floor(g_scoreObj.frameNum / 3600);
			const currentSec = `00${(g_scoreObj.frameNum / 60) % 60}`.slice(-2);
			const currentTime = `${currentMin}:${currentSec}`;
			lblTime1.innerHTML = currentTime;

			if (currentSecond >= fullSecond) {
				if (fadeOutFrame === Infinity && isNaN(parseInt(g_headerObj.endFrame))) {
					g_audio.pause();
				}
				if (g_stateObj.lifeMode === C_LFE_BORDER && g_workObj.lifeVal < g_workObj.lifeBorder) {
					g_gameOverFlg = true;
				}
				clearTimeout(g_timeoutEvtId);
				setTimeout(_ => {
					clearWindow();
					resultInit();
				}, 100);
			}
		}
	}
	g_timeoutEvtId = setTimeout(_ => flowTimeline(), 1000 / 60);
}

/**
 * 判定カウンタ表示作成
 * @param {string} _id 
 * @param {number} _x
 * @param {string} _color 
 * @param {number} _heightPos 
 * @param {string, number} _text
 */
function makeCounterSymbol(_id, _x, _color, _heightPos, _text) {
	const counter = createDivLabel(_id, _x, C_LEN_JDGCNTS_HEIGHT * _heightPos,
		C_LEN_JDGCNTS_WIDTH, C_LEN_JDGCNTS_HEIGHT, C_SIZ_JDGCNTS, _color, _text);
	counter.style.textAlign = C_ALIGN_RIGHT;

	return counter;
}

/**
 * 個別色変化 (矢印)
 * @param {array} _mkColor 
 * @param {array} _mkColorCd 
 * @param {string} _allFlg
 */
function changeArrowColors(_mkColor, _mkColorCd, _allFlg) {

	if (_mkColor !== undefined) {
		for (let j = 0, len = _mkColor.length; j < len; j++) {
			const targetj = _mkColor[j];
			g_workObj.arrowColors[targetj] = _mkColorCd[j];
			if (_allFlg === `A`) {
				g_workObj.arrowColorsAll[targetj] = _mkColorCd[j];
			}
		}
	}
}

/**
 * 個別色変化 (フリーズアロー)
 * @param {array} _mkColor 
 * @param {array} _mkColorCd 
 * @param {array} _colorPatterns 
 * @param {number} _keyNum 
 * @param {string} _allFlg
 */
function changeFrzColors(_mkColor, _mkColorCd, _colorPatterns, _keyNum, _allFlg) {

	if (_mkColor !== undefined) {
		for (let j = 0, len = _mkColor.length; j < len; j++) {

			const targetj = _mkColor[j];

			// targetj=0,2,4,6,8 ⇒ Arrow, 1,3,5,7,9 ⇒ Bar
			if (targetj < 10) {
				if (targetj % 2 === 0) {
					// 矢印 (通常)
					for (let k = 0; k < _keyNum; k++) {
						if (targetj / 2 === _colorPatterns[k]) {
							g_workObj.frzNormalColors[k] = _mkColorCd[j];
							if (_allFlg === `A`) {
								g_workObj.frzNormalColorsAll[k] = _mkColorCd[j];
							}
						}
					}
				} else {
					// 帯 (通常)
					for (let k = 0; k < _keyNum; k++) {
						if ((targetj - 1) / 2 === _colorPatterns[k]) {
							g_workObj.frzNormalBarColors[k] = _mkColorCd[j];
							if (_allFlg === `A`) {
								g_workObj.frzNormalBarColorsAll[k] = _mkColorCd[j];
							}
						}
					}
				}
			} else {
				const targetj2 = targetj - 10;
				if (targetj2 % 2 === 0) {
					// 矢印 (ヒット時)
					for (let k = 0; k < _keyNum; k++) {
						if (targetj2 / 2 === _colorPatterns[k]) {
							g_workObj.frzHitColors[k] = _mkColorCd[j];
							if (_allFlg === `A`) {
								g_workObj.frzHitColorsAll[k] = _mkColorCd[j];
							}
						}
					}
				} else {
					// 帯 (ヒット時)
					for (let k = 0; k < _keyNum; k++) {
						if ((targetj2 - 1) / 2 === _colorPatterns[k]) {
							g_workObj.frzHitBarColors[k] = _mkColorCd[j];
							if (_allFlg === `A`) {
								g_workObj.frzHitBarColorsAll[k] = _mkColorCd[j];
							}
						}
					}
				}
			}
		}
	}
}

/**
 * フリーズアローヒット時の描画変更
 * @param {number} _j 
 * @param {number} _k 
 */
function changeHitFrz(_j, _k) {

	const frzTopShadow = document.querySelector(`#frzTopShadow${_j}_${_k}`);
	if (frzTopShadow.getAttribute(`type`) === `arrow`) {
		const fstyle = frzTopShadow.style;
		fstyle.backgroundColor = `#ffffff`;
		fstyle.top = `-10px`;
		fstyle.left = `-10px`;
		fstyle.width = `70px`;
		fstyle.height = `70px`;
		document.querySelector(`#frzTop${_j}_${_k}`).style.opacity = 0;
	} else {
		document.querySelector(`#frzTop${_j}_${_k}`).style.backgroundColor = g_workObj.frzHitColors[_j];
	}

	const frzBar = document.querySelector(`#frzBar${_j}_${_k}`);
	const frzRoot = document.querySelector(`#frz${_j}_${_k}`);
	const frzBtm = document.querySelector(`#frzBtm${_j}_${_k}`);
	const frzBtmShadow = document.querySelector(`#frzBtmShadow${_j}_${_k}`);

	frzBar.style.backgroundColor = g_workObj.frzHitBarColors[_j];
	frzBtm.style.backgroundColor = g_workObj.frzHitColors[_j];

	// フリーズアロー位置の修正（ステップゾーン上に来るように）
	const delFrzLength = parseFloat(document.querySelector(`#step${_j}`).style.top) - parseFloat(frzRoot.style.top);

	frzRoot.style.top = document.querySelector(`#step${_j}`).style.top;
	frzBtm.style.top = `${parseFloat(frzBtm.style.top) - delFrzLength}px`;
	frzBtmShadow.style.top = `${parseFloat(frzBtmShadow.style.top) - delFrzLength}px`;
	frzBar.style.top = `${parseFloat(frzBar.style.top) - delFrzLength * g_workObj.dividePos[_j]}px`;
	frzBar.style.height = `${parseFloat(frzBar.style.height) - delFrzLength * g_workObj.scrollDir[_j]}px`;

	frzRoot.setAttribute(`isMoving`, `false`);
}

/**
 * フリーズアロー失敗時の描画変更
 * @param {number} _j 
 * @param {number} _k 
 */
function changeFailedFrz(_j, _k) {
	const frzTopShadow = document.querySelector(`#frzTopShadow${_j}_${_k}`);
	const fstyle = frzTopShadow.style;
	fstyle.backgroundColor = `#000000`;
	fstyle.top = `0px`;
	fstyle.left = `0px`;
	fstyle.width = `50px`;
	fstyle.height = `50px`;
	fstyle.opacity = 1;
	document.querySelector(`#frzTop${_j}_${_k}`).style.opacity = 1;
	document.querySelector(`#frzTop${_j}_${_k}`).style.backgroundColor = `#cccccc`;
	document.querySelector(`#frzBar${_j}_${_k}`).style.backgroundColor = `#999999`;
	document.querySelector(`#frzBtm${_j}_${_k}`).style.backgroundColor = `#cccccc`;
}

/**
 * キーを押したかどうかを判定
 * @param {number} _keyCode 
 */
function keyIsDown(_keyCode) {
	return (g_inputKeyBuffer[_keyCode] ? true : false);
}

/**
 * 矢印・フリーズアロー判定
 * @param {*} _j 対象矢印・フリーズアロー
 */
function judgeArrow(_j) {

	if (!g_judgObj.lockFlgs[_j]) {
		g_judgObj.lockFlgs[_j] = true;

		const mainSprite = document.querySelector(`#mainSprite`);
		const currentNo = g_workObj.judgArrowCnt[_j];
		const stepDivHit = document.querySelector(`#stepHit${_j}`);
		const judgArrow = document.querySelector(`#arrow${_j}_${currentNo}`);

		const fcurrentNo = g_workObj.judgFrzCnt[_j];

		if (judgArrow !== null) {
			const difFrame = Number(judgArrow.getAttribute(`cnt`));
			const difCnt = Math.abs(judgArrow.getAttribute(`cnt`));
			const judgEndFlg = judgArrow.getAttribute(`judgEndFlg`);

			if (difCnt <= g_judgObj.arrowJ[C_JDG_UWAN] && judgEndFlg === `false`) {
				stepDivHit.style.opacity = 0.75;

				if (difCnt <= g_judgObj.arrowJ[C_JDG_II]) {
					judgeIi(difFrame);
					stepDivHit.style.background = C_CLR_II;
				} else if (difCnt <= g_judgObj.arrowJ[C_JDG_SHAKIN]) {
					judgeShakin(difFrame);
					stepDivHit.style.background = C_CLR_SHAKIN;
				} else if (difCnt <= g_judgObj.arrowJ[C_JDG_MATARI]) {
					judgeMatari(difFrame);
					stepDivHit.style.background = C_CLR_MATARI;
				} else {
					judgeShobon(difFrame);
					stepDivHit.style.background = C_CLR_SHOBON;
				}
				stepDivHit.setAttribute(`cnt`, C_FRM_HITMOTION);

				mainSprite.removeChild(judgArrow);
				g_workObj.judgArrowCnt[_j]++;

				g_judgObj.lockFlgs[_j] = false;
				return;
			}
		}

		const judgFrz = document.querySelector(`#frz${_j}_${fcurrentNo}`);

		if (judgFrz !== null) {
			const difCnt = Math.abs(judgFrz.getAttribute(`cnt`));
			const judgEndFlg = judgFrz.getAttribute(`judgEndFlg`);

			if (difCnt <= g_judgObj.frzJ[C_JDG_SFSF] && judgEndFlg === `false`) {
				if (g_headerObj.frzStartjdgUse === `true`) {
					if (g_workObj.judgFrzHitCnt[_j] === undefined || g_workObj.judgFrzHitCnt[_j] <= fcurrentNo) {
						if (difCnt <= g_judgObj.arrowJ[C_JDG_II]) {
							judgeIi(difCnt);
						} else if (difCnt <= g_judgObj.arrowJ[C_JDG_SHAKIN]) {
							judgeShakin(difCnt);
						} else if (difCnt <= g_judgObj.arrowJ[C_JDG_MATARI]) {
							judgeMatari(difCnt);
						} else {
							judgeShobon(difCnt);
						}
						g_workObj.judgFrzHitCnt[_j] = fcurrentNo + 1;
					}
				}
				changeHitFrz(_j, fcurrentNo);
				g_judgObj.lockFlgs[_j] = false;
				return;
			}
		}
		const stepDiv = document.querySelector(`#step${_j}`);
		stepDiv.style.backgroundColor = `#66ffff`;
		g_judgObj.lockFlgs[_j] = false;
	}
}

function lifeRecovery() {
	let lifeColor;
	g_workObj.lifeVal += g_workObj.lifeRcv;
	if (g_workObj.lifeVal >= C_VAL_MAXLIFE) {
		g_workObj.lifeVal = C_VAL_MAXLIFE;
		lifeColor = C_CLR_MAXLIFE;
	} else if (g_workObj.lifeVal >= g_workObj.lifeBorder) {
		lifeColor = C_CLR_CLEARLIFE;
	}
	document.querySelector(`#lblLife`).style.backgroundColor = lifeColor;
	document.querySelector(`#lblLife`).innerHTML = Math.floor(g_workObj.lifeVal);
	document.querySelector(`#lifeBar`).style.backgroundColor = lifeColor;
	document.querySelector(`#lifeBar`).style.top = `${50 + (g_sHeight - 100) * (C_VAL_MAXLIFE - g_workObj.lifeVal) / C_VAL_MAXLIFE}px`;
	document.querySelector(`#lifeBar`).style.height = `${(g_sHeight - 100) * g_workObj.lifeVal / C_VAL_MAXLIFE}px`;
}

function lifeDamage() {
	let lifeColor;
	g_workObj.lifeVal -= g_workObj.lifeDmg;
	if (g_workObj.lifeVal <= 0) {
		g_workObj.lifeVal = 0;
		if (g_workObj.lifeBorder === 0) {
			g_audio.pause();
			clearTimeout(g_timeoutEvtId);
			setTimeout(_ => {
				clearWindow();
				g_gameOverFlg = true;
				resultInit();
			}, 200);
		}
	} else if (g_workObj.lifeVal < g_workObj.lifeBorder) {
		lifeColor = C_CLR_DEFAULTLIFE;
	} else {
		lifeColor = C_CLR_CLEARLIFE;
	}
	document.querySelector(`#lblLife`).style.backgroundColor = lifeColor;
	document.querySelector(`#lblLife`).innerHTML = Math.floor(g_workObj.lifeVal);
	document.querySelector(`#lifeBar`).style.backgroundColor = lifeColor;
	document.querySelector(`#lifeBar`).style.top = `${50 + (g_sHeight - 100) * (C_VAL_MAXLIFE - g_workObj.lifeVal) / C_VAL_MAXLIFE}px`;
	document.querySelector(`#lifeBar`).style.height = `${(g_sHeight - 100) * g_workObj.lifeVal / C_VAL_MAXLIFE}px`;
}

/**
 * 判定処理：イイ
 * @param {number} difFrame 
 */
function judgeIi(difFrame) {
	g_resultObj.ii++;
	g_currentArrows++;
	document.querySelector(`#charaJ`).innerHTML = `<span style=color:${C_CLR_II}>${C_JCR_II}</span>`;
	document.querySelector(`#charaJ`).setAttribute(`cnt`, C_FRM_JDGMOTION);

	document.querySelector(`#lblIi`).innerHTML = g_resultObj.ii;
	if (++g_resultObj.combo > g_resultObj.maxCombo) {
		g_resultObj.maxCombo = g_resultObj.combo;
		document.querySelector(`#lblMCombo`).innerHTML = g_resultObj.maxCombo;
	}
	document.querySelector(`#comboJ`).innerHTML = `${g_resultObj.combo} Combo!!`;

	lifeRecovery();
	finishViewing();

	if (typeof customJudgeIi === `function`) {
		customJudgeIi(difFrame);
		if (typeof customJudgeIi2 === `function`) {
			customJudgeIi2(difFrame);
		}
	}
}

/**
 * 判定処理：シャキン
 * @param {number} difFrame 
 */
function judgeShakin(difFrame) {
	g_resultObj.shakin++;
	g_currentArrows++;
	document.querySelector(`#charaJ`).innerHTML = `<span style=color:${C_CLR_SHAKIN}>${C_JCR_SHAKIN}</span>`;
	document.querySelector(`#charaJ`).setAttribute(`cnt`, C_FRM_JDGMOTION);

	document.querySelector(`#lblShakin`).innerHTML = g_resultObj.shakin;
	if (++g_resultObj.combo > g_resultObj.maxCombo) {
		g_resultObj.maxCombo = g_resultObj.combo;
		document.querySelector(`#lblMCombo`).innerHTML = g_resultObj.maxCombo;
	}
	document.querySelector(`#comboJ`).innerHTML = `${g_resultObj.combo} Combo!!`;

	lifeRecovery();
	finishViewing();

	if (typeof customJudgeShakin === `function`) {
		customJudgeShakin(difFrame);
		if (typeof customJudgeShakin2 === `function`) {
			customJudgeShakin2(difFrame);
		}
	}
}

/**
 * 判定処理：マターリ
 * @param {number} difFrame 
 */
function judgeMatari(difFrame) {
	g_resultObj.matari++;
	g_currentArrows++;
	document.querySelector(`#charaJ`).innerHTML = `<span style=color:${C_CLR_MATARI}>${C_JCR_MATARI}</span>`;
	document.querySelector(`#charaJ`).setAttribute(`cnt`, C_FRM_JDGMOTION);

	document.querySelector(`#lblMatari`).innerHTML = g_resultObj.matari;
	document.querySelector(`#comboJ`).innerHTML = ``;

	finishViewing();

	if (typeof customJudgeMatari === `function`) {
		customJudgeMatari(difFrame);
		if (typeof customJudgeMatari2 === `function`) {
			customJudgeMatari2(difFrame);
		}
	}
}

/**
 * 判定処理：ショボーン
 * @param {number} difFrame 
 */
function judgeShobon(difFrame) {
	g_resultObj.shobon++;
	g_currentArrows++;
	document.querySelector(`#charaJ`).innerHTML = `<span style=color:${C_CLR_SHOBON}>${C_JCR_SHOBON}</span>`;
	document.querySelector(`#charaJ`).setAttribute(`cnt`, C_FRM_JDGMOTION);

	document.querySelector(`#lblShobon`).innerHTML = g_resultObj.shobon;
	g_resultObj.combo = 0;
	document.querySelector(`#comboJ`).innerHTML = ``;

	lifeDamage();

	if (typeof customJudgeShobon === `function`) {
		customJudgeShobon(difFrame);
		if (typeof customJudgeShobon2 === `function`) {
			customJudgeShobon2(difFrame);
		}
	}
}

/**
 * 判定処理：ウワァン
 * @param {number} difFrame 
 */
function judgeUwan(difFrame) {
	g_resultObj.uwan++;
	g_currentArrows++;
	document.querySelector(`#charaJ`).innerHTML = `<span style=color:${C_CLR_UWAN}>${C_JCR_UWAN}</span>`;
	document.querySelector(`#charaJ`).setAttribute(`cnt`, C_FRM_JDGMOTION);

	document.querySelector(`#lblUwan`).innerHTML = g_resultObj.uwan;
	g_resultObj.combo = 0;
	document.querySelector(`#comboJ`).innerHTML = ``;

	lifeDamage();

	if (typeof customJudgeUwan === `function`) {
		customJudgeUwan(difFrame);
		if (typeof customJudgeUwan2 === `function`) {
			customJudgeUwan2(difFrame);
		}
	}
}

/**
 * 判定処理：キター
 * @param {number} difFrame 
 */
function judgeKita(difFrame) {
	g_resultObj.kita++;
	g_currentArrows++;
	document.querySelector(`#lblKita`).innerHTML = g_resultObj.kita;
	document.querySelector(`#charaFJ`).innerHTML = `<span style=color:${C_CLR_KITA}>${C_JCR_KITA}</span>`;
	document.querySelector(`#charaFJ`).setAttribute(`cnt`, C_FRM_JDGMOTION);

	if (++g_resultObj.fCombo > g_resultObj.fmaxCombo) {
		g_resultObj.fmaxCombo = g_resultObj.fCombo;
		document.querySelector(`#lblFCombo`).innerHTML = g_resultObj.fmaxCombo;
	}
	document.querySelector(`#comboFJ`).innerHTML = `${g_resultObj.fCombo} Combo!!`;

	lifeRecovery();
	finishViewing();

	if (typeof customJudgeKita === `function`) {
		customJudgeKita(difFrame);
		if (typeof customJudgeKita2 === `function`) {
			customJudgeKita2(difFrame);
		}
	}
}

/**
 * 判定処理：イクナイ
 * @param {number} difFrame 
 */
function judgeIknai(difFrame) {
	g_resultObj.iknai++;
	g_currentArrows++;
	document.querySelector(`#lblIknai`).innerHTML = g_resultObj.iknai;
	document.querySelector(`#charaFJ`).innerHTML = `<span style=color:${C_CLR_IKNAI}>${C_JCR_IKNAI}</span>`;
	document.querySelector(`#charaFJ`).setAttribute(`cnt`, C_FRM_JDGMOTION);
	document.querySelector(`#comboFJ`).innerHTML = ``;
	g_resultObj.fCombo = 0;

	lifeDamage();

	if (typeof customJudgeIknai === `function`) {
		customJudgeIknai(difFrame);
		if (typeof customJudgeIknai2 === `function`) {
			customJudgeIknai2(difFrame);
		}
	}
}

function finishViewing() {
	if (g_currentArrows === g_allArrow + g_allFrz / 2) {
		if (g_headerObj.finishView !== C_DIS_NONE) {
			const fullArrows = g_allArrow + g_allFrz / 2;
			if (g_resultObj.ii + g_resultObj.kita === fullArrows) {
				document.querySelector(`#finishView`).innerHTML = `<span style=color:#ffffff>All Perfect!!</span>`;
				document.querySelector(`#finishView`).style.opacity = 1;
				document.querySelector(`#charaJ`).innerHTML = ``;
				document.querySelector(`#comboJ`).innerHTML = ``;
				document.querySelector(`#charaFJ`).innerHTML = ``;
				document.querySelector(`#comboFJ`).innerHTML = ``;
			} else if (g_resultObj.ii + g_resultObj.shakin + g_resultObj.kita === fullArrows) {
				document.querySelector(`#finishView`).innerHTML = `Perfect!!`;
				document.querySelector(`#finishView`).style.opacity = 1;
				document.querySelector(`#charaJ`).innerHTML = ``;
				document.querySelector(`#comboJ`).innerHTML = ``;
				document.querySelector(`#charaFJ`).innerHTML = ``;
				document.querySelector(`#comboFJ`).innerHTML = ``;
			} else if (g_resultObj.uwan === 0 && g_resultObj.shobon === 0 && g_resultObj.iknai === 0) {
				document.querySelector(`#finishView`).innerHTML = `<span style=color:#66ffff>FullCombo!</span>`;
				document.querySelector(`#finishView`).style.opacity = 1;
				document.querySelector(`#charaJ`).innerHTML = ``;
				document.querySelector(`#comboJ`).innerHTML = ``;
				document.querySelector(`#charaFJ`).innerHTML = ``;
				document.querySelector(`#comboFJ`).innerHTML = ``;
			}
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

	drawDefaultBackImage(``);
	const divRoot = document.querySelector(`#divRoot`);

	// タイトル文字描画
	const lblTitle = getTitleDivLabel(`lblTitle`,
		`<span style=color:#6666ff;font-size:40px>R</span>ESULT`, 0, 15);
	divRoot.appendChild(lblTitle);

	const playDataWindow = createSprite(`divRoot`, `playDataWindow`, g_sWidth / 2 - 225, 70 + (g_sHeight - 500) / 2, 450, 110);
	playDataWindow.style.border = `solid 0.5px #666666`;
	const resultWindow = createSprite(`divRoot`, `resultWindow`, g_sWidth / 2 - 180, 185 + (g_sHeight - 500) / 2, 360, 210);

	const playingArrows = g_resultObj.ii + g_resultObj.shakin +
		g_resultObj.matari + g_resultObj.shobon + g_resultObj.uwan +
		g_resultObj.kita + g_resultObj.iknai;
	const fullArrows = g_allArrow + g_allFrz / 2;

	// スコア計算(一括)
	const scoreTmp = g_resultObj.ii * 8 +
		g_resultObj.shakin * 4 +
		g_resultObj.matari * 2 +
		g_resultObj.kita * 8 +
		g_resultObj.sfsf * 4 +
		g_resultObj.maxCombo * 2 +
		g_resultObj.fmaxCombo * 2;

	const allScore = (g_allArrow + g_allFrz / 2) * 10;
	const resultScore = Math.round(scoreTmp / allScore * 1000000) || 0;
	g_resultObj.score = resultScore;

	// ランク計算
	let rankMark = ``;
	let rankColor = ``;
	if (g_gameOverFlg) {
		rankMark = g_rankObj.rankMarkF;
		rankColor = g_rankObj.rankColorF;
	} else if (playingArrows === fullArrows && g_stateObj.autoPlay === C_FLG_OFF) {
		if (g_resultObj.matari + g_resultObj.shobon + g_resultObj.uwan + g_resultObj.sfsf + g_resultObj.iknai === 0) {
			rankMark = g_rankObj.rankMarkPF;
			rankColor = g_rankObj.rankColorPF;
		} else {
			let rankPos = g_rankObj.rankRate.length;
			for (let j = 0, len = g_rankObj.rankRate.length; j < len; j++) {
				rankPos = len;
				if (resultScore / 10000 >= g_rankObj.rankRate[j]) {
					rankMark = g_rankObj.rankMarks[j];
					rankColor = g_rankObj.rankColor[j];
					break;
				}
			}
			if (resultScore / 10000 < g_rankObj.rankRate[rankPos - 1]) {
				rankMark = g_rankObj.rankMarkC;
				rankColor = g_rankObj.rankColorC;
			}
		}
	} else {
		rankMark = g_rankObj.rankMarkX;
		rankColor = g_rankObj.rankColorX;
	}

	// 曲名・オプション描画
	const musicTitle = g_headerObj.musicTitles[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.musicTitle;

	let musicTitleForView0;
	let musicTitleForView1;
	if (g_headerObj.musicTitlesForView[g_headerObj.musicNos[g_stateObj.scoreId]] !== undefined) {
		musicTitleForView0 = g_headerObj.musicTitlesForView[g_headerObj.musicNos[g_stateObj.scoreId]][0];
		musicTitleForView1 = g_headerObj.musicTitlesForView[g_headerObj.musicNos[g_stateObj.scoreId]][1];
	} else {
		musicTitleForView0 = g_headerObj.musicTitleForView[0];
		musicTitleForView1 = g_headerObj.musicTitleForView[1];
	}

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	let transKeyData = ``;
	if (setVal(g_keyObj[`transKey${keyCtrlPtn}`], ``, `string`) !== ``) {
		transKeyData = `(` + g_keyObj[`transKey${keyCtrlPtn}`] + `)`;
	}

	playDataWindow.appendChild(makeResultPlayData(`lblMusic`, 20, `#999999`, 0,
		`Music`, C_ALIGN_LEFT));
	playDataWindow.appendChild(makeResultPlayData(`lblMusicData`, 60, `#cccccc`, 0,
		musicTitleForView0, C_ALIGN_CENTER));
	playDataWindow.appendChild(makeResultPlayData(`lblMusicData`, 60, `#cccccc`, 1,
		setVal(musicTitleForView1, ``, `string`), C_ALIGN_CENTER));
	playDataWindow.appendChild(makeResultPlayData(`lblDifficulty`, 20, `#999999`, 2,
		`Difficulty`, C_ALIGN_LEFT));
	let difData = `${g_headerObj.keyLabels[g_stateObj.scoreId]}${transKeyData} key / ${g_headerObj.difLabels[g_stateObj.scoreId]}`;
	if (g_stateObj.shuffle !== `OFF`) {
		difData += ` [${g_stateObj.shuffle}]`;
	}
	playDataWindow.appendChild(makeResultPlayData(`lblDifData`, 60, `#cccccc`, 2, difData,
		C_ALIGN_CENTER));
	playDataWindow.appendChild(makeResultPlayData(`lblStyle`, 20, `#999999`, 3,
		`Playstyle`, C_ALIGN_LEFT));

	let playStyleData = ``;
	playStyleData = `${g_stateObj.speed}x`;
	if (g_stateObj.motion !== C_FLG_OFF) {
		playStyleData += `, ${g_stateObj.motion}`;
	}
	if (g_stateObj.reverse !== C_FLG_OFF) {
		playStyleData += `, Reverse`;
	}
	if (g_stateObj.gauge !== `Original` && g_stateObj.gauge !== `Normal`) {
		playStyleData += `, ${g_stateObj.gauge}`;
	}
	playDataWindow.appendChild(makeResultPlayData(`lblStyleData`, 60, `#cccccc`, 3,
		playStyleData, C_ALIGN_CENTER));

	playDataWindow.appendChild(makeResultPlayData(`lblDisplay`, 20, `#999999`, 4,
		`Display`, C_ALIGN_LEFT));

	let displayData = ``;
	if (g_stateObj.d_stepzone !== C_FLG_ON) {
		if (displayData !== ``) {
			displayData += `, `;
		}
		displayData += `Step`;
	}
	if (g_stateObj.d_judgement !== C_FLG_ON) {
		if (displayData !== ``) {
			displayData += `, `;
		}
		displayData += `Judge`;
	}
	if (g_stateObj.d_lifegauge !== C_FLG_ON) {
		if (displayData !== ``) {
			displayData += `, `;
		}
		displayData += `Life`;
	}
	if (g_stateObj.d_musicinfo !== C_FLG_ON) {
		if (displayData !== ``) {
			displayData += `, `;
		}
		displayData += `MusicInfo`;
	}
	if (displayData === ``) {
		displayData = `All Visible`;
	} else {
		displayData += ` : OFF`;
	}
	playDataWindow.appendChild(makeResultPlayData(`lblDisplayData`, 60, `#cccccc`, 4,
		displayData, C_ALIGN_CENTER));

	let display2Data = ``;
	if (g_stateObj.d_speed !== C_FLG_ON) {
		if (display2Data !== ``) {
			display2Data += `, `;
		}
		display2Data += `Speed`;
	}
	if (g_stateObj.d_color !== C_FLG_ON) {
		if (display2Data !== ``) {
			display2Data += `, `;
		}
		display2Data += `Color`;
	}
	if (g_stateObj.d_lyrics !== C_FLG_ON) {
		if (display2Data !== ``) {
			display2Data += `, `;
		}
		display2Data += `Lyrics`;
	}
	if (g_stateObj.d_background !== C_FLG_ON) {
		if (display2Data !== ``) {
			display2Data += `, `;
		}
		display2Data += `Background`;
	}
	if (display2Data !== ``) {
		display2Data += ` : OFF`;
	}
	playDataWindow.appendChild(makeResultPlayData(`lblDisplayData`, 60, `#cccccc`, 5,
		display2Data, C_ALIGN_CENTER));

	// キャラクタ描画
	resultWindow.appendChild(makeResultSymbol(`lblIi`, 0, C_CLR_II, 0, C_JCR_II, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol(`lblShakin`, 0, C_CLR_SHAKIN, 1, C_JCR_SHAKIN, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol(`lblMatari`, 0, C_CLR_MATARI, 2, C_JCR_MATARI, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol(`lblShobon`, 0, C_CLR_SHOBON, 3, C_JCR_SHOBON, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol(`lblUwan`, 0, C_CLR_UWAN, 4, C_JCR_UWAN, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol(`lblKita`, 0, C_CLR_KITA, 5, C_JCR_KITA, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol(`lblIknai`, 0, C_CLR_IKNAI, 6, C_JCR_IKNAI, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol(`lblMCombo`, 0, `#ffffff`, 7, `MaxCombo`, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol(`lblFCombo`, 0, `#ffffff`, 8, `FreezeCombo`, C_ALIGN_LEFT));

	resultWindow.appendChild(makeResultSymbol(`lblScore`, 0, `#ffffff`, 10, `Score`, C_ALIGN_LEFT));

	// スコア描画
	resultWindow.appendChild(makeResultSymbol(`lblIiS`, 50, `#ffffff`, 0, g_resultObj.ii, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol(`lblShakinS`, 50, `#ffffff`, 1, g_resultObj.shakin, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol(`lblMatariS`, 50, `#ffffff`, 2, g_resultObj.matari, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol(`lblShobonS`, 50, `#ffffff`, 3, g_resultObj.shobon, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol(`lblUwanS`, 50, `#ffffff`, 4, g_resultObj.uwan, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol(`lblKitaS`, 50, `#ffffff`, 5, g_resultObj.kita, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol(`lblIknaiS`, 50, `#ffffff`, 6, g_resultObj.iknai, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol(`lblMComboS`, 50, `#ffffff`, 7, g_resultObj.maxCombo, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol(`lblFComboS`, 50, `#ffffff`, 8, g_resultObj.fmaxCombo, C_ALIGN_RIGHT));

	resultWindow.appendChild(makeResultSymbol(`lblScoreS`, 50, `#ffffff`, 10, g_resultObj.score, C_ALIGN_RIGHT));

	// ランク描画
	const lblRank = createDivCustomLabel(`lblRank`, 340, 160, 70, 20, 50, `#ffffff`,
		`<span style=color:${rankColor}>${rankMark}</span>`, `"Bookman Old Style", "Meiryo UI", sans-serif`);
	lblRank.style.textAlign = C_ALIGN_CENTER;
	resultWindow.appendChild(lblRank);

	// ユーザカスタムイベント(初期)
	if (typeof customResultInit === `function`) {
		customResultInit();
		if (typeof customResultInit2 === `function`) {
			customResultInit2();
		}
	}

	// ハイスコア差分計算
	const scoreName = `${g_headerObj.keyLabels[g_stateObj.scoreId]}k-${g_headerObj.difLabels[g_stateObj.scoreId]}`;
	let iiDf = 0;
	let shakinDf = 0;
	let matariDf = 0;
	let shobonDf = 0;
	let uwanDf = 0;
	let kitaDf = 0;
	let iknaiDf = 0;
	let maxComboDf = 0;
	let fmaxComboDf = 0;
	let scoreDf = 0;

	if (g_stateObj.autoPlay === C_FLG_OFF && g_stateObj.shuffle === C_FLG_OFF &&
		setVal(g_keyObj[`transKey${keyCtrlPtn}`], ``, `string`) === ``) {

		if (scoreName in g_localStorage.highscores) {
			iiDf = g_resultObj.ii - g_localStorage.highscores[scoreName].ii;
			shakinDf = g_resultObj.shakin - g_localStorage.highscores[scoreName].shakin;
			matariDf = g_resultObj.matari - g_localStorage.highscores[scoreName].matari;
			shobonDf = g_resultObj.shobon - g_localStorage.highscores[scoreName].shobon;
			uwanDf = g_resultObj.uwan - g_localStorage.highscores[scoreName].uwan;
			kitaDf = g_resultObj.kita - g_localStorage.highscores[scoreName].kita;
			iknaiDf = g_resultObj.iknai - g_localStorage.highscores[scoreName].iknai;
			maxComboDf = g_resultObj.maxCombo - g_localStorage.highscores[scoreName].maxCombo;
			fmaxComboDf = g_resultObj.fmaxCombo - g_localStorage.highscores[scoreName].fmaxCombo;
			scoreDf = g_resultObj.score - g_localStorage.highscores[scoreName].score;

			if (scoreDf > 0 && g_stateObj.dataSaveFlg) {
				g_localStorage.highscores[scoreName].ii = g_resultObj.ii;
				g_localStorage.highscores[scoreName].shakin = g_resultObj.shakin;
				g_localStorage.highscores[scoreName].matari = g_resultObj.matari;
				g_localStorage.highscores[scoreName].shobon = g_resultObj.shobon;
				g_localStorage.highscores[scoreName].uwan = g_resultObj.uwan;
				g_localStorage.highscores[scoreName].kita = g_resultObj.kita;
				g_localStorage.highscores[scoreName].iknai = g_resultObj.iknai;
				g_localStorage.highscores[scoreName].maxCombo = g_resultObj.maxCombo;
				g_localStorage.highscores[scoreName].fmaxCombo = g_resultObj.fmaxCombo;
				g_localStorage.highscores[scoreName].score = g_resultObj.score;

				localStorage.setItem(location.href, JSON.stringify(g_localStorage));
			}
		} else {
			iiDf = g_resultObj.ii;
			shakinDf = g_resultObj.shakin;
			matariDf = g_resultObj.matari;
			shobonDf = g_resultObj.shobon;
			uwanDf = g_resultObj.uwan;
			kitaDf = g_resultObj.kita;
			iknaiDf = g_resultObj.iknai;
			maxComboDf = g_resultObj.maxCombo;
			fmaxComboDf = g_resultObj.fmaxCombo;
			scoreDf = g_resultObj.score;

			if (g_stateObj.dataSaveFlg) {
				g_localStorage.highscores[scoreName] = {};
				g_localStorage.highscores[scoreName].ii = g_resultObj.ii;
				g_localStorage.highscores[scoreName].shakin = g_resultObj.shakin;
				g_localStorage.highscores[scoreName].matari = g_resultObj.matari;
				g_localStorage.highscores[scoreName].shobon = g_resultObj.shobon;
				g_localStorage.highscores[scoreName].uwan = g_resultObj.uwan;
				g_localStorage.highscores[scoreName].kita = g_resultObj.kita;
				g_localStorage.highscores[scoreName].iknai = g_resultObj.iknai;
				g_localStorage.highscores[scoreName].maxCombo = g_resultObj.maxCombo;
				g_localStorage.highscores[scoreName].fmaxCombo = g_resultObj.fmaxCombo;
				g_localStorage.highscores[scoreName].score = g_resultObj.score;

				localStorage.setItem(location.href, JSON.stringify(g_localStorage));
			}
		}

		// ハイスコア差分描画
		resultWindow.appendChild(makeResultSymbol(`lblIiL1`, 210, `#999999`, 0, `(${iiDf >= 0 ? "+" : "－"}`, C_ALIGN_LEFT));
		resultWindow.appendChild(makeResultSymbol(`lblShakinL1`, 210, `#999999`, 1, `(${shakinDf >= 0 ? "+" : "－"}`, C_ALIGN_LEFT));
		resultWindow.appendChild(makeResultSymbol(`lblMatariL1`, 210, `#999999`, 2, `(${matariDf >= 0 ? "+" : "－"}`, C_ALIGN_LEFT));
		resultWindow.appendChild(makeResultSymbol(`lblShobonL1`, 210, `#999999`, 3, `(${shobonDf >= 0 ? "+" : "－"}`, C_ALIGN_LEFT));
		resultWindow.appendChild(makeResultSymbol(`lblUwanL1`, 210, `#999999`, 4, `(${uwanDf >= 0 ? "+" : "－"}`, C_ALIGN_LEFT));
		resultWindow.appendChild(makeResultSymbol(`lblKitaL1`, 210, `#999999`, 5, `(${kitaDf >= 0 ? "+" : "－"}`, C_ALIGN_LEFT));
		resultWindow.appendChild(makeResultSymbol(`lblIknaiL1`, 210, `#999999`, 6, `(${iknaiDf >= 0 ? "+" : "－"}`, C_ALIGN_LEFT));
		resultWindow.appendChild(makeResultSymbol(`lblMComboL1`, 210, `#999999`, 7, `(${maxComboDf >= 0 ? "+" : "－"}`, C_ALIGN_LEFT));
		resultWindow.appendChild(makeResultSymbol(`lblFComboL1`, 210, `#999999`, 8, `(${fmaxComboDf >= 0 ? "+" : "－"}`, C_ALIGN_LEFT));

		resultWindow.appendChild(makeResultSymbol(`lblScoreL1`, 210, `${scoreDf > 0 ? "#ffff66" : "#999999"}`, 10, `(${scoreDf >= 0 ? "+" : "－"}`, C_ALIGN_LEFT));

		resultWindow.appendChild(makeResultSymbol(`lblIiS`, 165, `#cccccc`, 0, Math.abs(iiDf), C_ALIGN_RIGHT));
		resultWindow.appendChild(makeResultSymbol(`lblShakinS`, 165, `#cccccc`, 1, Math.abs(shakinDf), C_ALIGN_RIGHT));
		resultWindow.appendChild(makeResultSymbol(`lblMatariS`, 165, `#cccccc`, 2, Math.abs(matariDf), C_ALIGN_RIGHT));
		resultWindow.appendChild(makeResultSymbol(`lblShobonS`, 165, `#cccccc`, 3, Math.abs(shobonDf), C_ALIGN_RIGHT));
		resultWindow.appendChild(makeResultSymbol(`lblUwanS`, 165, `#cccccc`, 4, Math.abs(uwanDf), C_ALIGN_RIGHT));
		resultWindow.appendChild(makeResultSymbol(`lblKitaS`, 165, `#cccccc`, 5, Math.abs(kitaDf), C_ALIGN_RIGHT));
		resultWindow.appendChild(makeResultSymbol(`lblIknaiS`, 165, `#cccccc`, 6, Math.abs(iknaiDf), C_ALIGN_RIGHT));
		resultWindow.appendChild(makeResultSymbol(`lblMComboS`, 165, `#cccccc`, 7, Math.abs(maxComboDf), C_ALIGN_RIGHT));
		resultWindow.appendChild(makeResultSymbol(`lblFComboS`, 165, `#cccccc`, 8, Math.abs(fmaxComboDf), C_ALIGN_RIGHT));

		resultWindow.appendChild(makeResultSymbol(`lblScoreS`, 165, `${scoreDf > 0 ? "#ffff99" : "#cccccc"}`, 10, Math.abs(scoreDf), C_ALIGN_RIGHT));


		resultWindow.appendChild(makeResultSymbol(`lblIiL2`, 320, `#999999`, 0, `)`, C_ALIGN_LEFT));
		resultWindow.appendChild(makeResultSymbol(`lblShakinL2`, 320, `#999999`, 1, `)`, C_ALIGN_LEFT));
		resultWindow.appendChild(makeResultSymbol(`lblMatariL2`, 320, `#999999`, 2, `)`, C_ALIGN_LEFT));
		resultWindow.appendChild(makeResultSymbol(`lblShobonL2`, 320, `#999999`, 3, `)`, C_ALIGN_LEFT));
		resultWindow.appendChild(makeResultSymbol(`lblUwanL2`, 320, `#999999`, 4, `)`, C_ALIGN_LEFT));
		resultWindow.appendChild(makeResultSymbol(`lblKitaL2`, 320, `#999999`, 5, `)`, C_ALIGN_LEFT));
		resultWindow.appendChild(makeResultSymbol(`lblIknaiL2`, 320, `#999999`, 6, `)`, C_ALIGN_LEFT));
		resultWindow.appendChild(makeResultSymbol(`lblMComboL2`, 320, `#999999`, 7, `)`, C_ALIGN_LEFT));
		resultWindow.appendChild(makeResultSymbol(`lblFComboL2`, 320, `#999999`, 8, `)`, C_ALIGN_LEFT));

		resultWindow.appendChild(makeResultSymbol(`lblScoreL2`, 320, `${scoreDf > 0 ? "#ffff66" : "#999999"}`, 10, `)`, C_ALIGN_LEFT));

	} else {
		resultWindow.appendChild(makeResultSymbol(`lblAutoView`, 230, `#999999`, 4, `(No Record)`, C_ALIGN_LEFT));
		const lblAutoView = document.querySelector(`#lblAutoView`);
		lblAutoView.style.fontSize = `24px`;
	}

	// Twitter用リザルト
	let hashTag;
	if (g_headerObj.hashTag !== undefined) {
		hashTag = ` ${g_headerObj.hashTag}`;
	} else {
		hashTag = ``;
	}
	let tweetDifData = `${g_headerObj.keyLabels[g_stateObj.scoreId]}${transKeyData}k-${g_headerObj.difLabels[g_stateObj.scoreId]}`;
	if (g_stateObj.shuffle !== `OFF`) {
		tweetDifData += `/${g_stateObj.shuffle}`;
	}
	const tweetResultTmp = `【#danoni${hashTag}】${musicTitle}(${tweetDifData})/
		${g_headerObj.tuning}/
		Rank:${rankMark}/
		Score:${g_resultObj.score}/
		Playstyle:${playStyleData}/
		${g_resultObj.ii}-${g_resultObj.shakin}-${g_resultObj.matari}-${g_resultObj.shobon}-${g_resultObj.uwan}/
		${g_resultObj.kita}-${g_resultObj.iknai}/
		${g_resultObj.maxCombo}-${g_resultObj.fmaxCombo} 
		${location.href}`.replace(/[\t\n]/g, ``);
	const tweetResult = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetResultTmp)}`;


	// Cleared & Failed表示
	const lblResultPre = createDivLabel(`lblResultPre`, g_sWidth / 2 - 150, g_sHeight / 2 - 160,
		200, 50, 60, `#ffff66`,
		`<span style=font-size:80px>C</span>LEARED!`);
	divRoot.appendChild(lblResultPre);
	lblResultPre.style.opacity = 0;

	let resultFlgTmp = ``;

	if (playingArrows === fullArrows) {
		if (g_resultObj.ii + g_resultObj.kita === fullArrows) {
			resultFlgTmp = `<span style=color:#ffffff>All Perfect!!</span>`;
		} else if (g_resultObj.ii + g_resultObj.shakin + g_resultObj.kita === fullArrows) {
			resultFlgTmp = `<span style=color:#ffffcc>Perfect!!</span>`;
		} else if (g_resultObj.uwan === 0 && g_resultObj.shobon === 0 && g_resultObj.iknai === 0) {
			resultFlgTmp = `<span style=color:#66ffff>FullCombo!</span>`;
		} else {
			resultFlgTmp = `CLEARED!`;
		}
	} else {
		resultFlgTmp = ``;
	}

	const lblResultPre2 = createDivLabel(`lblResultPre`, g_sWidth / 2 + 50, 40,
		200, 30, 20, `#ffff66`, resultFlgTmp);
	divRoot.appendChild(lblResultPre2);

	if (!g_gameOverFlg) {
		lblResultPre.style.animationDuration = `2.5s`;
		lblResultPre.style.animationName = `leftToRightFade`;
	} else {
		lblResultPre.style.animationDuration = `3s`;
		lblResultPre.innerHTML = `<span style=color:#ff6666><span style=font-size:80px>F</span>AILED...</span>`;
		lblResultPre.style.animationName = `upToDownFade`;

		lblResultPre2.innerHTML = `<span style=color:#ff6666>FAILED...</span>`;
	}

	// プレイデータは Cleared & Failed に合わせて表示
	playDataWindow.style.animationDuration = `3s`;
	playDataWindow.style.animationName = `slowlyAppearing`;


	// 戻るボタン描画
	const btnBack = createButton({
		id: `btnBack`,
		name: `Back`,
		x: 0,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_BACK,
		align: C_ALIGN_CENTER
	}, _ => {
		// タイトル画面へ戻る
		g_audio.pause();
		clearWindow();
		titleInit();
	});
	divRoot.appendChild(btnBack);

	// Tweetボタン描画
	const btnTweet = createButton({
		id: `btnTweet`,
		name: `Tweet`,
		x: g_sWidth / 3,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_TWEET,
		align: C_ALIGN_CENTER
	}, _ => window.open(tweetResult, `_blank`));
	divRoot.appendChild(btnTweet);

	// リトライボタン描画
	const btnRetry = createButton({
		id: `btnRetry`,
		name: `Retry`,
		x: g_sWidth / 3 * 2,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_RESET,
		align: C_ALIGN_CENTER
	}, _ => {
		g_audio.pause();
		clearWindow();
		loadMusic();
	});
	divRoot.appendChild(btnRetry);

	// キー操作イベント（デフォルト）
	document.onkeydown = evt => {
		// ブラウザ判定
		let setKey;
		if (g_userAgent.indexOf(`firefox`) !== -1) {
			setKey = evt.which;
		} else {
			setKey = event.keyCode;
		}
		for (let j = 0; j < C_BLOCK_KEYS.length; j++) {
			if (setKey === C_BLOCK_KEYS[j]) {
				return false;
			}
		}
	}
	document.onkeyup = evt => { }
	if (g_headerObj.fadeFrame !== undefined && g_headerObj.fadeFrame !== ``) {
		if (isNaN(parseInt(g_headerObj.fadeFrame[g_stateObj.scoreId]))) {
		} else {
			g_timeoutEvtId = setInterval(`resultFadeOut()`, 1000 / 60);
		}
	}
}

function resultFadeOut() {
	const tmpVolume = (g_audio.volume - (3 * g_stateObj.volume / 100) / 1000);
	if (tmpVolume < 0) {
		g_audio.volume = 0;
		clearInterval(g_timeoutEvtId);
		g_audio.pause();
	} else {
		g_audio.volume = tmpVolume;
	}
}

/**
 * 結果表示作成（曲名、オプション）
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
 * 結果表示作成（キャラクタ）
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
