'use strict';
/**
 * Dancing☆Onigiri (CW Edition)
 * 
 * Source by tickle
 * Created : 2018/10/08
 * Revised : 2019/07/21
 * 
 * https://github.com/cwtickle/danoniplus
 */
const g_version = "Ver 1.15.11";

// カスタム用バージョン (danoni_custom.js 等で指定可)
let g_localVersion = "";
let g_localVersion2 = "";

// ショートカット用文字列(↓の文字列を検索することで対象箇所へジャンプできます)
//  タイトル:melon  設定・オプション:lime  キーコンフィグ:orange  譜面読込:strawberry  メイン:banana  結果:grape
//  シーンジャンプ:Scene

/**
 * ▽ ソースコーディングルール
 * - 定数・変数名はわかりやすく、名前で判断がつくように。
 * -- 定数　　　　　： "C_(カテゴリ)_(名前)"の形式。全て英大文字、数字、アンダースコアのみを使用。
 * -- グローバル変数： 変数の頭に"g_"をつける。
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
 *  基本的にdiv要素で管理。最下層を[difRoot]とし、createSprite()でdiv子要素を作成していく。
 *  clearWindow()で[difRoot]以外の全てのスプライトを削除できる。
 *  特定のスプライトに限り削除する場合は deleteChildspriteAll() で実現。
 */

window.onload = function () {
	initialControl();
}

/*-----------------------------------------------------------*/
/* Scene : COMMON [water] */
/*-----------------------------------------------------------*/

/**
 * 汎用定数定義
 */
// 表示位置
const C_ALIGN_LEFT = "left";
const C_ALIGN_CENTER = "center";
const C_ALIGN_RIGHT = "right";
const C_VALIGN_TOP = "top";
const C_VALIGN_MIDDLE = "middle";
const C_VALIGN_BOTTOM = "bottom";

// ユーザインタフェース
const C_CLR_DEFAULT = "#333333";
const C_CLR_DEFHOVER = "#666666";
const C_CLR_BACK = "#000033";
const C_CLR_NEXT = "#330000";
const C_CLR_SETTING = "#333300";
const C_CLR_RESET = "#003300";
const C_CLR_TWEET = "#003333";
const C_CLR_TEXT = "#ffffff";
const C_CLR_TITLE = "#cccccc";

const C_LBL_TITLESIZE = 32;
const C_LBL_BTNSIZE = 28;
const C_LBL_LNKSIZE = 16;
const C_LBL_BASICFONT = "'Meiryo UI', sans-serif";

const C_CLR_LNK = "#111111";
const C_BTN_HEIGHT = 50;
const C_LNK_HEIGHT = 20;

// スプライト（ムービークリップ相当）のルート
const C_SPRITE_ROOT = "divRoot";

// 画像ファイル
const C_IMG_ARROW = "../img/arrow_500.png";
const C_IMG_ARROWSD = "../img/arrowShadow_500.png";
const C_IMG_ONIGIRI = "../img/onigiri_600.png";
const C_IMG_AASD = "../img/aaShadow_500.png";
const C_IMG_GIKO = "../img/giko_600.png";
const C_IMG_IYO = "../img/iyo_600.png";
const C_IMG_C = "../img/c_600.png";
const C_IMG_MORARA = "../img/morara_600.png";
const C_IMG_MONAR = "../img/monar_600.png";
const C_IMG_CURSOR = "../img/cursor.png";
const C_IMG_FRZBAR = "../img/frzbar.png";
const C_IMG_LIFEBAR = "../img/frzbar.png";
const C_IMG_LIFEBORDER = "../img/borderline.png";

const C_IMG_ARROWSHADOW = "../img/arrowShadow_500.png";
const C_IMG_ONIGIRIARROWSHADOW = "../img/aaShadow_500.png";
const C_IMG_GIKOARROWSHADOW = "../img/aaShadow_500.png";
const C_IMG_IYOARROWSHADOW = "../img/aaShadow_500.png";
const C_IMG_CARROWSHADOW = "../img/aaShadow_500.png";
const C_IMG_MORARAARROWSHADOW = "../img/aaShadow_500.png";
const C_IMG_MONARARROWSHADOW = "../img/aaShadow_500.png";

const C_IMG_ONIGIRIFRZBAR = "../img/frzbar.png";
const C_IMG_GIKOFRZBAR = "../img/frzbar.png";
const C_IMG_IYOFRZBAR = "../img/frzbar.png";
const C_IMG_CFRZBAR = "../img/frzbar.png";
const C_IMG_MORARAFRZBAR = "../img/frzbar.png";
const C_IMG_MONARFRZBAR = "../img/frzbar.png";

// 音楽ファイル エンコードフラグ
let g_musicEncodedFlg = false;
let g_musicdata = "";

// Motionオプション配列の基準位置
const C_MOTION_STD_POS = 15;

// キーブロック対象(キーコードを指定)
const C_BLOCK_KEYS = [
	8, 9, 13, 17, 18, 32, /* BackSpace, Tab, Enter, Ctrl, Alt, Space */
	37, 38, 39, 40, 46,   /* Left, Down, Up, Right, Delete */
	112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126 /* F1～F15 */
];

// ON/OFFスイッチ
const C_FLG_ON = "ON";
const C_FLG_OFF = "OFF";
const C_DIS_NONE = "none";

// 譜面データ持ち回り用
let g_rootObj = {};
let g_headerObj = {};
let g_scoreObj = {};
const g_stateObj = {
	scoreId: 0,
	speed: 3.5,
	motion: C_FLG_OFF,
	reverse: C_FLG_OFF,
	auto: C_FLG_OFF,
	adjustment: 0,
	fadein: 0,
	volume: 100,
	lifeRcv: 2,
	lifeDmg: 7,
	lifeMode: "Border",
	lifeBorder: 70,
	lifeInit: 25,
	lifeSetName: "Normal",
	lifeId: 0,

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
let C_CLR_MAXLIFE = "#444400";
let C_CLR_CLEARLIFE = "#004444";
let C_CLR_DEFAULTLIFE = "#444444";
let C_CLR_BORDER = "#555555";
let C_CLR_BACKLIFE = "#222222";
const C_LFE_SURVIVAL = "Survival";
const C_LFE_BORDER = "Border";

const g_gaugeOptionObj = {
	survival: ["Original", "Light", "No Recovery", "SuddenDeath", "Practice"],
	border: ["Normal", "Easy", "Hard", "SuddenDeath"],

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

const g_volumes = [100, 75, 50, 25, 10, 5, 2, 1, 0.5, 0.25, 0];
let g_volumeNum = 0;

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
const g_kCd = new Array();
for (var j = 0; j < 255; j++) {
	g_kCd[j] = "";
}
g_kCd[0] = "×";
g_kCd[8] = "BS";
g_kCd[9] = "Tab";
g_kCd[12] = "Clear";
g_kCd[13] = "Enter";
g_kCd[16] = "Shift";
g_kCd[17] = "Ctrl";
g_kCd[18] = "Alt";
g_kCd[19] = "Pause";
g_kCd[27] = "Esc";
g_kCd[29] = "noCh";
g_kCd[32] = "Space";
g_kCd[33] = "PgUp";
g_kCd[34] = "PgDown";
g_kCd[35] = "End";
g_kCd[36] = "Home";
g_kCd[37] = "←";
g_kCd[38] = "↑";
g_kCd[39] = "→";
g_kCd[40] = "↓";
g_kCd[44] = "PS";
g_kCd[45] = "Insert";
g_kCd[46] = "Delete";
g_kCd[47] = "Help";
g_kCd[48] = "0";
g_kCd[49] = "1";
g_kCd[50] = "2";
g_kCd[51] = "3";
g_kCd[52] = "4";
g_kCd[53] = "5";
g_kCd[54] = "6";
g_kCd[55] = "7";
g_kCd[56] = "8";
g_kCd[57] = "9";
g_kCd[65] = "A";
g_kCd[66] = "B";
g_kCd[67] = "C";
g_kCd[68] = "D";
g_kCd[69] = "E";
g_kCd[70] = "F";
g_kCd[71] = "G";
g_kCd[72] = "H";
g_kCd[73] = "I";
g_kCd[74] = "J";
g_kCd[75] = "K";
g_kCd[76] = "L";
g_kCd[77] = "M";
g_kCd[78] = "N";
g_kCd[79] = "O";
g_kCd[80] = "P";
g_kCd[81] = "Q";
g_kCd[82] = "R";
g_kCd[83] = "S";
g_kCd[84] = "T";
g_kCd[85] = "U";
g_kCd[86] = "V";
g_kCd[87] = "W";
g_kCd[88] = "X";
g_kCd[89] = "Y";
g_kCd[90] = "Z";
g_kCd[91] = "Window";
g_kCd[93] = "Appli";
g_kCd[96] = "T0";
g_kCd[97] = "T1";
g_kCd[98] = "T2";
g_kCd[99] = "T3";
g_kCd[100] = "T4";
g_kCd[101] = "T5";
g_kCd[102] = "T6";
g_kCd[103] = "T7";
g_kCd[104] = "T8";
g_kCd[105] = "T9";
g_kCd[106] = "T*";
g_kCd[107] = "T+";
g_kCd[108] = "TEnter";
g_kCd[109] = "T-";
g_kCd[110] = "T_";
g_kCd[111] = "T/";
g_kCd[112] = "F1";
g_kCd[113] = "F2";
g_kCd[114] = "F3";
g_kCd[115] = "F4";
g_kCd[116] = "F5";
g_kCd[117] = "F6";
g_kCd[118] = "F7";
g_kCd[119] = "F8";
g_kCd[120] = "F9";
g_kCd[121] = "F10";
g_kCd[122] = "F11";
g_kCd[123] = "F12";
g_kCd[124] = "F13";
g_kCd[125] = "F14";
g_kCd[126] = "F15";
g_kCd[134] = "FN";
g_kCd[144] = "NumLk";
g_kCd[145] = "SL";
g_kCd[186] = "： *";
g_kCd[187] = "; +";
g_kCd[188] = ", <";
g_kCd[189] = "- =";
g_kCd[190] = ". >";
g_kCd[191] = "/ ?";
g_kCd[192] = "@ `";
g_kCd[219] = "[ {";
g_kCd[220] = "\\ |";
g_kCd[221] = "] }";
g_kCd[222] = "^ ~";
g_kCd[226] = "\\ _";
g_kCd[229] = "Z/H";
g_kCd[240] = "CapsLk";

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
	chara5_0: ["left", "down", "up", "right", "space"],
	chara7_0: ["left", "leftdia", "down", "space", "up", "rightdia", "right"],
	chara7i_0: ["left", "leftdia", "down", "space", "up", "rightdia", "right"],
	chara8_0: ["left", "leftdia", "down", "space", "up", "rightdia", "right", "sleft"],
	chara9A_0: ["left", "down", "up", "right", "space", "sleft", "sdown", "sup", "sright"],
	chara9B_0: ["left", "down", "up", "right", "space", "sleft", "sdown", "sup", "sright"],
	chara9i_0: ["sleft", "sdown", "sup", "sright", "left", "down", "up", "right", "space"],
	chara11_0: ["sleft", "sdown", "sup", "sright",
		"left", "leftdia", "down", "space", "up", "rightdia", "right"],
	chara11L_0: ["sleft", "sdown", "sup", "sright",
		"left", "leftdia", "down", "space", "up", "rightdia", "right"],
	chara11i_0: ["left", "down", "gor", "up", "right", "space",
		"sleft", "sdown", "siyo", "sup", "sright"],
	chara11W_0: ["sleft", "sdown", "sup", "sright",
		"left", "leftdia", "down", "space", "up", "rightdia", "right"],
	chara12_0: ["sleft", "sdown", "sup", "sright",
		"oni", "left", "leftdia", "down", "space", "up", "rightdia", "right"],
	chara13_0: ["tleft", "tdown", "tup", "tright",
		"left", "down", "up", "right", "space", "sleft", "sdown", "sup", "sright"],
	chara14_0: ["sleftdia", "sleft", "sdown", "sup", "sright", "srightdia",
		"oni", "left", "leftdia", "down", "space", "up", "rightdia", "right"],
	chara14i_0: ["gor", "space", "iyo", "left", "down", "up", "right",
		"sleft", "sleftdia", "sdown", "sspace", "sup", "srightdia", "sright"],
	chara15A_0: ["sleft", "sdown", "sup", "sright", "tleft", "tdown", "tup", "tright",
		"left", "leftdia", "down", "space", "up", "rightdia", "right"],
	chara15B_0: ["sleft", "sdown", "sup", "sright", "tleft", "tdown", "tup", "tright",
		"left", "leftdia", "down", "space", "up", "rightdia", "right"],
	chara16i_0: ["gor", "space", "iyo", "left", "down", "up", "right",
		"sleft", "sdown", "sup", "sright", "aspace", "aleft", "adown", "aup", "aright"],
	chara17_1: ["aleft", "bleft", "adown", "bdown", "aup", "bup", "aright", "bright", "space",
		"cleft", "dleft", "cdown", "ddown", "cup", "dup", "cright", "dright"],

	chara5_1: ["space", "left", "down", "up", "right"],
	chara9A_1: ["left", "down", "up", "right", "space", "sleft", "sdown", "sup", "sright"],
	chara9i_1: ["left", "down", "up", "right", "space", "sleft", "sdown", "sup", "sright"],
	chara11_1: ["space", "sleft", "sdown", "sup", "sright",
		"left", "leftdia", "down", "up", "rightdia", "right"],
	chara11L_1: ["sleft", "sdown", "sup", "sright", "space",
		"left", "leftdia", "down", "up", "rightdia", "right"],
	chara12_1: ["sleft", "sdown", "sup", "sright",
		"oni", "left", "leftdia", "down", "space", "up", "rightdia", "right"],
	chara14_1: ["sleftdia", "sleft", "sdown", "sup", "sright", "srightdia",
		"oni", "left", "leftdia", "down", "space", "up", "rightdia", "right"],
	chara15A_1: ["sleft", "sdown", "sup", "sright", "tleft", "tdown", "tup", "tright",
		"left", "leftdia", "down", "space", "up", "rightdia", "right"],
	chara15B_1: ["sleft", "sdown", "sup", "sright", "tleft", "tdown", "tup", "tright",
		"left", "leftdia", "down", "space", "up", "rightdia", "right"],
	chara17_0: ["aleft", "adown", "aup", "aright", "space", "dleft", "ddown", "dup", "dright",
		"bleft", "bdown", "bup", "bright", "cleft", "cdown", "cup", "cright"],

	chara5_2: ["left", "down", "space", "up", "right"],

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
	color17_1: [0, 1, 0, 1, 0, 1, 0, 1, 2, 3, 4, 3, 4, 3, 4, 3, 4],

	color5_1: [2, 0, 0, 0, 0],
	color9A_1: [0, 0, 0, 0, 2, 3, 3, 3, 3],
	color9i_1: [2, 2, 2, 2, 2, 0, 0, 0, 0],
	color11_1: [2, 3, 3, 3, 3, 0, 1, 0, 0, 1, 0],
	color11L_1: [3, 3, 3, 3, 2, 0, 1, 0, 0, 1, 0],
	color12_1: [3, 3, 3, 3, 2, 0, 1, 0, 1, 0, 1, 0],
	color14_1: [4, 3, 3, 3, 3, 4, 2, 0, 1, 0, 1, 0, 1, 0],
	color15A_1: [3, 3, 3, 3, 4, 4, 4, 4, 0, 1, 0, 2, 0, 1, 0],
	color15B_1: [3, 3, 3, 3, 4, 4, 4, 4, 0, 1, 0, 2, 0, 1, 0],
	color17_0: [0, 0, 0, 0, 2, 4, 4, 4, 4, 1, 1, 1, 1, 3, 3, 3, 3],

	color5_2: [0, 0, 2, 0, 0],

	// 基本パターン (矢印回転、AAキャラクタ)
	// - AAキャラクタの場合、キャラクタ名を指定
	stepRtn5_0: [0, -90, 90, 180, "onigiri"],
	stepRtn7_0: [0, -45, -90, "onigiri", 90, 135, 180],
	stepRtn7i_0: ["giko", "onigiri", "iyo", 0, -90, 90, 180],
	stepRtn8_0: [0, -45, -90, "onigiri", 90, 135, 180, "onigiri"],
	stepRtn9A_0: [0, -90, 90, 180, "onigiri", 0, -90, 90, 180],
	stepRtn9B_0: [45, 0, -45, -90, "onigiri", 90, 135, 180, 225],
	stepRtn9i_0: [0, -90, 90, 180, "monar", "giko", "c", "morara", "onigiri"],
	stepRtn11_0: [0, -90, 90, 180, 0, -45, -90, "onigiri", 90, 135, 180],
	stepRtn11L_0: [0, -90, 90, 180, 0, -45, -90, "onigiri", 90, 135, 180],
	stepRtn11W_0: ["giko", 135, 45, "iyo", 0, -45, -90, "onigiri", 90, 135, 180],
	stepRtn11i_0: [0, -90, "giko", 90, 180, "onigiri", 0, -90, "iyo", 90, 180],
	stepRtn12_0: [0, -90, 90, 180, "onigiri", 0, 30, 60, 90, 120, 150, 180],
	stepRtn13_0: [0, -90, 90, 180, 0, -90, 90, 180, "onigiri", 0, -90, 90, 180],
	stepRtn14_0: [45, 0, -90, 90, 180, 135, "onigiri", 0, 30, 60, 90, 120, 150, 180],
	stepRtn14i_0: ["giko", "onigiri", "iyo", 0, -90, 90, 180, 0, -45, -90, "onigiri", 90, 135, 180],
	stepRtn15A_0: [0, -90, 90, 180, 0, -90, 90, 180, 0, -45, -90, "onigiri", 90, 135, 180],
	stepRtn15B_0: [0, -90, 90, 180, 0, -90, 90, 180, 0, -45, -90, "onigiri", 90, 135, 180],
	stepRtn16i_0: ["giko", "onigiri", "iyo", 0, -90, 90, 180, 45, 0, -45, -90, "onigiri", 90, 135, 180, 225],
	stepRtn17_1: [0, -22.5, -45, -67.5, -90, -112.5, -135, -157.5, "onigiri",
		22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180],

	// 変則パターン (矢印回転、AAキャラクタ)
	// - 末尾の番号をカウントアップさせることで実現できる。keyCtrlと合わせること
	// - 配列の数は、通常パターンと同数で無くてはいけない（keyCtrlも同様）
	stepRtn5_1: ["onigiri", 0, -90, 90, 180],
	stepRtn9A_1: [0, -90, 90, 180, "onigiri", 0, -90, 90, 180],
	stepRtn9i_1: ["monar", "giko", "c", "morara", "onigiri", 0, -90, 90, 180],
	stepRtn11_1: ["onigiri", 0, -90, 90, 180, 0, -45, -90, 90, 135, 180],
	stepRtn11L_1: [0, -90, 90, 180, "onigiri", 0, -45, -90, 90, 135, 180],
	stepRtn12_1: [0, -90, 90, 180, "onigiri", 0, 30, 60, 90, 120, 150, 180],
	stepRtn14_1: [45, 0, -90, 90, 180, 135, "onigiri", 0, 30, 60, 90, 120, 150, 180],
	stepRtn15A_1: [0, -90, 90, 180, 0, -90, 90, 180, 0, -45, -90, "onigiri", 90, 135, 180],
	stepRtn15B_1: [0, -90, 90, 180, 0, -90, 90, 180, 0, -45, -90, "onigiri", 90, 135, 180],
	stepRtn17_0: [0, -45, -90, -135, "onigiri", 45, 90, 135, 180,
		-22.5, -67.5, -112.5, -157.5, 22.5, 67.5, 112.5, 157.5],

	stepRtn5_2: [0, -90, "onigiri", 90, 180],

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
	div17_1: 17,

	div5_1: 5,
	div9A_1: 9,
	div9i_1: 9,
	div11_1: 6,
	div11L_1: 6,
	div12_1: 5,
	div14_1: 7,
	div15A_1: 8,
	div15B_1: 8,
	div17_0: 9,

	div5_2: 5,

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
	pos17_1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],

	pos5_1: [0, 1, 2, 3, 4],
	pos9A_1: [0, 1, 2, 3, 4, 5, 6, 7, 8],
	pos9i_1: [0, 1, 2, 3, 4, 5, 6, 7, 8],
	pos11_1: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12],
	pos11L_1: [0, 1, 2, 3, 4, 6, 7, 8, 10, 11, 12],
	pos12_1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
	pos14_1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
	pos15A_1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
	pos15B_1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
	pos17_0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],

	pos5_2: [0, 1, 2, 3, 4],


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
	keyCtrl12_0: [[85], [73], [56, 57], [79], [32], [78], [74], [77, 0], [75, 0], [188], [76], [190]],
	keyCtrl13_0: [[37], [40], [38, 0], [39], [83], [68], [69, 82], [70], [32], [74], [75], [73, 0], [76]],
	keyCtrl14_0: [[84, 89], [85], [73], [56, 55, 57, 48], [79], [192, 80], [32], [78], [74], [77, 0], [75, 0], [188], [76], [190]],
	keyCtrl14i_0: [[90], [88], [67], [37], [40], [38, 0], [39], [83], [68], [70], [32], [74], [75], [76]],
	keyCtrl15A_0: [[87], [69], [51, 52], [82], [37], [40], [38, 0], [39], [83], [68], [70], [32], [74], [75], [76]],
	keyCtrl15B_0: [[87], [69], [51, 52], [82], [85], [73], [56, 57], [79], [83], [68], [70], [32], [74], [75], [76]],
	keyCtrl16i_0: [[90], [88], [67], [37], [40], [38, 0], [39], [65], [83], [68], [70], [32], [74], [75], [76], [187]],
	keyCtrl17_1: [[65], [90], [83], [88], [68], [67], [70], [86], [32], [78], [74], [77], [75], [188], [76], [190], [187]],

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
	keyCtrl12_0d: [[85], [73], [56, 57], [79], [32], [78], [74], [77, 0], [75, 0], [188], [76], [190]],
	keyCtrl13_0d: [[37], [40], [38, 0], [39], [83], [68], [69, 82], [70], [32], [74], [75], [73, 0], [76]],
	keyCtrl14_0d: [[84, 89], [85], [73], [56, 55, 57, 48], [79], [192, 80], [32], [78], [74], [77, 0], [75, 0], [188], [76], [190]],
	keyCtrl14i_0d: [[90], [88], [67], [37], [40], [38, 0], [39], [83], [68], [70], [32], [74], [75], [76]],
	keyCtrl15A_0d: [[87], [69], [51, 52], [82], [37], [40], [38, 0], [39], [83], [68], [70], [32], [74], [75], [76]],
	keyCtrl15B_0d: [[87], [69], [51, 52], [82], [85], [73], [56, 57], [79], [83], [68], [70], [32], [74], [75], [76]],
	keyCtrl16i_0d: [[90], [88], [67], [37], [40], [38, 0], [39], [65], [83], [68], [70], [32], [74], [75], [76], [187]],
	keyCtrl17_1d: [[65], [90], [83], [88], [68], [67], [70], [86], [32], [78], [74], [77], [75], [188], [76], [190], [187]],

	// 変則パターン (キーコンフィグ)
	// - 末尾dなし(実際の設定値)と末尾dあり(デフォルト値)は必ずセットで揃えること。配列数も合わせる。
	// - _0, _0dの数字部分をカウントアップすることで実現できる。
	// - 配列数は合わせる必要はあるが、代替キーの数は _X, _Xdで揃っていれば合わせる必要はない。
	keyCtrl5_1: [[32, 0], [37], [40], [38, 0], [39]],
	keyCtrl9A_1: [[83], [68], [69, 82], [70], [32], [37], [40], [38, 0], [39]],
	keyCtrl9i_1: [[65], [83], [68], [70], [32], [37], [40], [38, 0], [39]],
	keyCtrl11_1: [[32], [37], [40], [38, 0], [39], [83], [68], [70], [74], [75], [76]],
	keyCtrl11L_1: [[87], [69], [51, 52], [82], [32], [83], [68], [70], [74], [75], [76]],
	keyCtrl12_1: [[89], [85, 73], [56, 55, 57], [79], [32], [66], [72], [78, 77], [74, 75], [188], [76], [190]],
	keyCtrl14_1: [[82, 84], [89], [85, 73], [56, 54, 55, 57, 48], [79], [192, 80], [32], [66], [72], [78, 77], [74, 75], [188], [76], [190]],
	keyCtrl15A_1: [[87], [69], [51, 52], [82], [85], [73], [56, 57], [79], [83], [68], [70], [32], [74], [75], [76]],
	keyCtrl15B_1: [[87], [69], [51, 52], [82], [37], [40], [38, 0], [39], [83], [68], [70], [32], [74], [75], [76]],
	keyCtrl17_0: [[65], [83], [68], [70], [32], [74], [75], [76], [187], [90], [88], [67], [86], [78], [77], [188], [190]],

	keyCtrl5_1d: [[32, 0], [37], [40], [38, 0], [39]],
	keyCtrl9A_1d: [[83], [68], [69, 82], [70], [32], [37], [40], [38, 0], [39]],
	keyCtrl9i_1d: [[65], [83], [68], [70], [32], [37], [40], [38, 0], [39]],
	keyCtrl11_1d: [[32], [37], [40], [38, 0], [39], [83], [68], [70], [74], [75], [76]],
	keyCtrl11L_1d: [[87], [69], [51, 52], [82], [32], [83], [68], [70], [74], [75], [76]],
	keyCtrl12_1d: [[89], [85, 73], [56, 55, 57], [79], [32], [66], [72], [78, 77], [74, 75], [188], [76], [190]],
	keyCtrl14_1d: [[82, 84], [89], [85, 73], [56, 54, 55, 57, 48], [79], [192, 80], [32], [66], [72], [78, 77], [74, 75], [188], [76], [190]],
	keyCtrl15A_1d: [[87], [69], [51, 52], [82], [85], [73], [56, 57], [79], [83], [68], [70], [32], [74], [75], [76]],
	keyCtrl15B_1d: [[87], [69], [51, 52], [82], [37], [40], [38, 0], [39], [83], [68], [70], [32], [74], [75], [76]],
	keyCtrl17_0d: [[65], [83], [68], [70], [32], [74], [75], [76], [187], [90], [88], [67], [86], [78], [77], [188], [190]],

	keyCtrl5_2: [[37], [40], [32, 0], [38, 0], [39]],

	keyCtrl5_2d: [[37], [40], [32, 0], [38, 0], [39]],

	// 矢印間隔補正
	blank: 55,
	blank_def: 55,
	blank11i_0: 50,
	blank17_1: 45,
	blank5_0: 57.5,
	blank5_1: 57.5,
	blank5_2: 57.5,
	blank9A_0: 52.5,
	blank9A_1: 52.5,
	blank9B_0: 52.5,

	dummy: 0	// ダミー(カンマ抜け落ち防止)
};

/** 設定・オプション画面用共通 */
const C_LEN_SETLBL_LEFT = 140;
const C_LEN_SETLBL_WIDTH = 250;
const C_LEN_SETLBL_HEIGHT = 25;
const C_SIZ_SETLBL = 18;
const C_LEN_SETDIFLBL_HEIGHT = 25;
const C_SIZ_SETDIFLBL = 18;
const C_LEN_SETMINI_WIDTH = 40;
const C_SIZ_SETMINI = 18;

const C_LBL_SETMINIL = "<";
const C_LEN_SETMINIL_LEFT = C_LEN_SETLBL_LEFT - C_LEN_SETMINI_WIDTH / 2;
const C_LBL_SETMINILL = "<";
const C_LEN_SETMINILL_LEFT = C_LEN_SETMINIL_LEFT + C_LEN_SETMINI_WIDTH;
const C_LBL_SETMINIR = ">";
const C_LBL_SETMINIRR = ">";
const C_LEN_SETMINIR_LEFT = C_LEN_SETLBL_LEFT + C_LEN_SETLBL_WIDTH - C_LEN_SETMINI_WIDTH / 2;
const C_LEN_SETMINIRR_LEFT = C_LEN_SETMINIR_LEFT - C_LEN_SETMINI_WIDTH;

const C_MAX_ADJUSTMENT = 30;
const C_MAX_SPEED = 10;
const C_MIN_SPEED = 1;

/** キーコンフィグ設定 */
let g_kcType = "Main";

/** メイン画面用共通オブジェクト */
const g_workObj = {};
g_workObj.stepX = new Array();
g_workObj.stepRtn = new Array();
g_workObj.keyCtrl = new Array();
g_workObj.keyHitFlg = new Array();
g_workObj.scrollDir = new Array();
g_workObj.dividePos = new Array();

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

const C_CLR_II = "#66ffff";
const C_CLR_SHAKIN = "#99ff99";
const C_CLR_MATARI = "#ff9966";
const C_CLR_UWAN = "#ff9999";
const C_CLR_SHOBON = "#ccccff";
const C_CLR_KITA = "#ffff99";
const C_CLR_SFSF = "";
const C_CLR_IKNAI = "#99ff66";

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
	rankMarks: ["SS", "S", "SA", "AAA", "AA", "A", "B"],
	rankRate: [97, 90, 85, 80, 75, 70, 50],
	rankColor: ["#00ccff", "#6600ff", "#ff9900", "#ff0000", "#00ff00", "#ff00ff", "#cc00ff"],

	rankMarkPF: "PF",
	rankColorPF: "#cccc00",
	rankMarkC: "C",
	rankColorC: "#cc9933",
	rankMarkF: "F",
	rankColorF: "#999999",
	rankMarkX: "X",
	rankColorX: "#996600"
};

let g_gameOverFlg = false;

const g_hostName = location.hostname;
const g_userAgent = window.navigator.userAgent.toLowerCase(); // msie, edge, chrome, safari, firefox, opera

const g_audio = new Audio();
const g_timeupdate = (function () {
	if (g_userAgent.indexOf("trident") === -1) {
		return new CustomEvent("timeupdate");
	}
	const event = document.createEvent("CustomEvent");
	event.initCustomEvent("timeupdate", false, false, {});
	return event;
})();
let g_timeoutEvtId = 0;
let g_inputKeyBuffer = new Array();

// 歌詞制御
const g_wordObj = {
	wordDir: 0,
	wordDat: "",
	fadeInFlg0: false,
	fadeInFlg1: false,
	fadeOutFlg0: false,
	fadeOutFlg1: false
};
let g_wordSprite;

/** 
 * メッセージ定義 
 * - 変数名は "C_MSG_X_YYYY" の形で、末尾に (X-YYYY) をつける。
 * - 記述不正の場合、書き方を2行目に指定すると親切。
*/
const C_MSG_W_0001 = "お使いのブラウザは動作保証外です。<br>" +
	"Chrome/Opera/Vivaldiなど、WebKit系ブラウザの利用を推奨します。(W-0001)";
const C_MSG_E_0011 = "アーティスト名が未入力です。(E-0011)";
const C_MSG_E_0012 = "曲名情報が未設定です。(E-0012)<br>" +
	"|musicTitle=曲名,アーティスト名,アーティストURL|";
const C_MSG_E_0021 = "譜面情報が未指定か、フォーマットが間違っています。(E-0021)<br>" +
	"|difData=キー数,譜面名,初期速度|";
const C_MSG_E_0031 = "楽曲ファイルが未指定か、フォーマットが間違っています。(E-0031)<br>" +
	"|musicUrl=****.mp3|";

const C_MSG_E_0101 = "新しいキー:{0}の[color]が未定義です。(E-0101)<br>" +
	"|color{0}=0,1,0,1,0,2|";
const C_MSG_E_0102 = "新しいキー:{0}の[chara]が未定義です。(E-0102)<br>" +
	"|chara{0}=arrowA,arrowB,arrowC,arrowD,arrowE,arrowF|";
const C_MSG_E_0103 = "新しいキー:{0}の[stepRtn]が未定義です。(E-0103)<br>" +
	"|stepRtn{0}=0,45,-90,135,180,onigiri|";
const C_MSG_E_0104 = "新しいキー:{0}の[keyCtrl]が未定義です。(E-0104)<br>" +
	"|keyCtrl{0}=75,79,76,80,187,32/0|";

/**
 * イベントハンドラ用オブジェクト
 * 参考: http://webkatu.com/remove-eventlistener/
 * 
 * - イベントリスナー作成時にリスナーキー(key)を発行する
 * - 削除時は発行したリスナーキーを指定して削除する
 */
const g_handler = (function () {
	const events = {};
	let key = 0;

	return {
		addListener: function (_target, _type, _listener, _capture) {
			if (window.addEventListener) {
				_target.addEventListener(_type, _listener, _capture);
			} else if (window.attachEvent) {
				_target.attachment('on' + _type, _listener);
			}
			events[key] = {
				target: _target,
				type: _type,
				listener: _listener,
				capture: _capture
			};
			return key++;
		},
		removeListener: function (key) {
			if (key in events) {
				const e = events[key];
				if (window.removeEventListener) {
					e.target.removeEventListener(e.type, e.listener, e.capture);
				} else if (window.detachEvent) {
					e.target.detachEvent('on' + e.type, e.listener);
				}
			}
		}
	}
})();

/**
 * 文字列を想定された型に変換
 * - _type は "float"(小数)、"number"(整数)、"string"(文字列)から選択
 * - 型に合わない場合は _defaultStr を返却するが、_defaultStr自体の型チェック・変換は行わない
 * @param {string} _checkStr 
 * @param {string} _defaultStr 
 * @param {string} _type 
 */
function setVal(_checkStr, _defaultStr, _type) {

	// 値がundefined相当の場合は無条件でデフォルト値を返却
	if (_checkStr === undefined || _checkStr === "") {
		return _defaultStr;
	}

	let isNaNflg;
	if (_type === "float") {
		// 数値型(小数可)の場合
		isNaNflg = isNaN(parseFloat(_checkStr));
		return (isNaNflg ? _defaultStr : parseFloat(_checkStr));

	} else if (_type === "number") {
		// 数値型(整数のみ)の場合
		isNaNflg = isNaN(parseInt(_checkStr));
		return (isNaNflg ? _defaultStr : parseInt(_checkStr));

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
	if (_checkArray === undefined || _checkArray === "") {
		return false;
	}

	// 配列かどうかをチェック
	if (Object.prototype.toString.call(_checkArray) !== "[object Array]") {
		return false;
	}

	// 最小配列長が不正の場合は強制的に1を設定
	if (isNaN(parseFloat(_minLength))) {
		_minLength = 1;
	}

	let isNaNflg;
	if (_type === "float") {
		// 数値型(小数可)の場合
		isNaNflg = isNaN(parseFloat(_checkArray[0]));
		if (isNaNflg) {
			return false;
		}
	} else if (_type === "number") {
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
	const link = document.createElement('link');
	link.rel = 'preload';
	link.as = _as;
	link.href = _href;
	if (_type !== "") {
		link.type = _type;
	}
	if (_crossOrigin !== "") {
		link.crossOrigin = _crossOrigin
	}
	document.head.appendChild(link);
}

/**
 * 基本フォントを取得
 */
function getBasicFont() {
	return (g_headerObj.customFont === "" ? C_LBL_BASICFONT : g_headerObj.customFont + "," + C_LBL_BASICFONT);
}

/**
 * 半角換算の文字数を計算
 * @param {string} str 
 */
function getStrLength(str) {
	var result = 0;
	for (var i = 0; i < str.length; i++) {
		var chr = str.charCodeAt(i);
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
	const div = document.createElement("div");

	div.id = _id;
	const style = div.style;
	style.left = _x + "px";
	style.top = _y + "px";
	style.width = _width + "px";
	style.height = _height + "px";
	style.position = "absolute";

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
	style.fontSize = _fontsize + "px";
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
	style.fontSize = _fontsize + "px";
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
	div.innerHTML = "<img src='" + _imgPath +
		"' style='width:" + _width + "px;height:" + _height +
		"px;' id=" + _id + "img>";

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
		charaImg = eval("C_IMG_" + _rotate.toUpperCase());
		sizeX = _size;
	} else {
		rotate = _rotate;
		charaStyle = "arrow";
		charaImg = C_IMG_ARROW;
		sizeX = _size;
	}

	const div = createDiv(_id, _x, _y, sizeX, _size);
	div.align = C_ALIGN_CENTER;

	let edgeVersion = 0;
	if (g_userAgent.indexOf('edge') !== -1) {
		edgeVersion = Math.floor(g_userAgent.slice(g_userAgent.indexOf('edge') + 5));
	}

	// IE/Edge(V17以前)の場合は色なし版を表示
	if (g_userAgent.indexOf('msie') !== -1 ||
		g_userAgent.indexOf('trident') !== -1 ||
		(g_userAgent.indexOf('edge') !== -1 && edgeVersion < 18)) {
		div.innerHTML = "<img src='" + charaImg +
			"' style='width:" + sizeX + "px;height:" + _size +
			"px;transform:rotate(" + rotate + "deg);' id=" + _id + "img>";

	} else {
		// それ以外は指定された色でマスク
		if (_color !== "") {
			div.style.backgroundColor = _color;
		}
		div.className = charaStyle;
		div.style.transform = "rotate(" + rotate + "deg)";
	}
	div.setAttribute("color", _color);

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
		div.setAttribute("type", "AA");
	} else {
		rotate = _rotate;
		charaStyle = _styleName;
		div.setAttribute("type", "arrow");
	}
	charaImg = eval("C_IMG_" + charaStyle.toUpperCase());
	div.align = C_ALIGN_CENTER;

	let edgeVersion = 0;
	if (g_userAgent.indexOf('edge') !== -1) {
		edgeVersion = Math.floor(g_userAgent.slice(g_userAgent.indexOf('edge') + 5));
	}

	// IE/Edge(V17以前)の場合は色なし版を表示
	if (g_userAgent.indexOf('msie') !== -1 ||
		g_userAgent.indexOf('trident') !== -1 ||
		(g_userAgent.indexOf('edge') !== -1 && edgeVersion < 18)) {
		div.innerHTML = "<img src='" + charaImg +
			"' style='width:" + _width + "px;height:" + _height +
			"px;transform:rotate(" + rotate + "deg);' id=" + _id + "img>";

	} else {
		// それ以外は指定された色でマスク
		if (_color !== "") {
			div.style.backgroundColor = _color;
		}
		div.className = charaStyle;
		div.style.transform = "rotate(" + rotate + "deg)";
	}
	div.setAttribute("color", _color);

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
	if (document.getElementById(_newObjName) === null) {
		const parentsprite = document.getElementById(_parentObjName);
		newsprite = createDiv(_newObjName, _x, _y, _width, _height);
		parentsprite.appendChild(newsprite);
	} else {
		newsprite = document.getElementById(_newObjName);
	}
	return newsprite;
}

/**
 * 親スプライト配下の子スプライトを全削除
 * @param {object} _parentObjName 親スプライト名
 */
function deleteChildspriteAll(_parentObjName) {

	const parentsprite = document.getElementById(_parentObjName);
	while (parentsprite.hasChildNodes()) {
		g_handler.removeListener(parentsprite.firstChild.getAttribute("lsnrkey"));
		g_handler.removeListener(parentsprite.firstChild.getAttribute("lsnrkeyTS"));
		g_handler.removeListener(parentsprite.firstChild.getAttribute("lsnrkeyTE"));
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
 *			id: "btnBack",
 *			// ボタンに表示する名前
 *			name: "Back",
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
 *		}, function(){
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
	style.fontSize = _obj.fontsize + "px";
	style.fontFamily = getBasicFont();
	style.backgroundColor = _obj.normalColor;
	style.transition = "background-color 0.25s linear";

	// オンマウス・タップ時の挙動 (背景色変更、カーソル変化)
	div.onmouseover = function () {
		style.backgroundColor = _obj.hoverColor;
		style.cursor = "pointer";
	}
	const lsnrkeyTS = g_handler.addListener(div, "touchstart", function () {
		style.backgroundColor = _obj.hoverColor;
		style.cursor = "pointer";
	}, false);

	// 通常時の挙動 (背景色変更、カーソル変化)
	div.onmouseout = function () {
		style.backgroundColor = _obj.normalColor;
		style.cursor = "default";
	}
	const lsnrkeyTE = g_handler.addListener(div, "touchend", function () {
		style.backgroundColor = _obj.normalColor;
		style.cursor = "default";
	}, false);

	// ボタンを押したときの動作
	const lsnrkey = g_handler.addListener(div, "click", function () {
		_func();
	}, false);

	// イベントリスナー用のキーをセット
	div.setAttribute("lsnrkey", lsnrkey);
	div.setAttribute("lsnrkeyTS", lsnrkeyTS);
	div.setAttribute("lsnrkeyTE", lsnrkeyTE);

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
	_ctx.font = _fontsize + "px '" + _fontname + "'";
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
	const layer0 = document.getElementById("layer0");
	const l0ctx = layer0.getContext("2d");

	g_sWidth = layer0.width;
	g_sHeight = layer0.height;
	const C_MARGIN = 0;

	// 線画、図形をクリア
	l0ctx.clearRect(0, 0, g_sWidth, g_sHeight);

	if (document.getElementById("layer1") !== null) {
		const layer1 = document.getElementById("layer1");
		const l1ctx = layer1.getContext("2d");
		l1ctx.clearRect(0, 0, g_sWidth, g_sHeight);

		// 線画 (title-line)
		l1ctx.beginPath();
		l1ctx.strokeStyle = "#cccccc";
		l1ctx.moveTo(C_MARGIN, C_MARGIN);
		l1ctx.lineTo(g_sWidth - C_MARGIN, C_MARGIN);
		l1ctx.stroke();

		l1ctx.beginPath();
		l1ctx.strokeStyle = "#cccccc";
		l1ctx.moveTo(C_MARGIN, g_sHeight - C_MARGIN);
		l1ctx.lineTo(g_sWidth - C_MARGIN, g_sHeight - C_MARGIN);
		l1ctx.stroke();
	}
	if (document.getElementById("layer2") !== null) {
		const layer2 = document.getElementById("layer2");
		const l2ctx = layer2.getContext("2d");
		l2ctx.clearRect(0, 0, g_sWidth, g_sHeight);
	}

	// ボタン、オブジェクトをクリア (divRoot配下のもの)
	const divRoot = document.getElementById("divRoot");
	while (divRoot.hasChildNodes()) {
		/*
		alert(divRoot.firstChild.getAttribute("lsnrkey"));
		*/
		g_handler.removeListener(divRoot.firstChild.getAttribute("lsnrkey"));
		g_handler.removeListener(divRoot.firstChild.getAttribute("lsnrkeyTS"));
		g_handler.removeListener(divRoot.firstChild.getAttribute("lsnrkeyTE"));
		divRoot.removeChild(divRoot.firstChild);
	}

}

function loadScript(url, callback) {
	const script = document.createElement("script");
	script.type = "text/javascript";
	script.src = url;

	if (script.readyState) {
		script.onreadystatechange = function () {
			if (script.readyState === "loaded" || script.readyState === "complete") {
				script.onreadystatechange = null;
				callback();
			}
		};
	} else {
		script.onload = function () {
			callback();
		};
	}
	document.getElementsByTagName("head")[0].appendChild(script);
}

/*-----------------------------------------------------------*/
/* Scene : TITLE [melon] */
/*-----------------------------------------------------------*/

function initialControl() {

	g_sWidth = layer0.width;
	g_sHeight = layer0.height;

	let divRoot;
	if (document.getElementById("divRoot") === null) {
		const stage = document.getElementById("canvas-frame");
		divRoot = createDiv("divRoot", 0, 0, g_sWidth, g_sHeight);
		stage.style.margin = "auto";
		stage.style.letterSpacing = "normal";
		stage.appendChild(divRoot);
		clearWindow();
	} else {
		divRoot = document.getElementById("divRoot");
	}

	// 譜面データの読み込み
	const dos = document.getElementById("dos").value;
	g_rootObj = dosConvert(dos);
	g_headerObj = headerConvert(g_rootObj);
	keysConvert(g_rootObj);

	g_keyObj.currentKey = g_headerObj["keyLabels"][g_stateObj.scoreId];
	g_keyObj.currentPtn = 0;

	// 画像ファイルの読み込み
	preloadFile("image", C_IMG_ARROW, "", "");
	preloadFile("image", C_IMG_ARROWSD, "", "");
	preloadFile("image", C_IMG_ONIGIRI, "", "");
	preloadFile("image", C_IMG_AASD, "", "");
	preloadFile("image", C_IMG_GIKO, "", "");
	preloadFile("image", C_IMG_IYO, "", "");
	preloadFile("image", C_IMG_C, "", "");
	preloadFile("image", C_IMG_MORARA, "", "");
	preloadFile("image", C_IMG_MONAR, "", "");
	preloadFile("image", C_IMG_CURSOR, "", "");
	preloadFile("image", C_IMG_FRZBAR, "", "");
	preloadFile("image", C_IMG_LIFEBORDER, "", "");

	// その他の画像ファイルの読み込み
	for (var j = 0, len = g_headerObj.preloadImages.length; j < len; j++) {
		if (setVal(g_headerObj.preloadImages[j], "", "string") !== "") {
			preloadFile("image", g_headerObj.preloadImages[j], "", "");
		}
	}

	// customjs、音楽ファイルの読み込み
	const randTime = new Date().getTime();
	loadScript("../js/" + g_headerObj.customjs + "?" + randTime, function () {
		if (g_headerObj.customjs2 !== "") {
			loadScript("../js/" + g_headerObj.customjs2 + "?" + randTime, function () {
				if (g_musicEncodedFlg) {
					loadScript("../" + g_headerObj.musicFolder + "/" + g_headerObj.musicUrl + "?" + randTime, function () {
						titleInit();
					});
				} else {
					titleInit();
				}
			});
		} else {
			if (g_musicEncodedFlg) {
				loadScript("../" + g_headerObj.musicFolder + "/" + g_headerObj.musicUrl + "?" + randTime, function () {
					titleInit();
				});
			} else {
				titleInit();
			}
		}
	});
}

/**
 *  タイトル画面初期化
 */
function titleInit() {

	g_sWidth = layer0.width;
	g_sHeight = layer0.height;

	const divRoot = document.getElementById("divRoot");

	// タイトル文字描画
	const lblTitle = getTitleDivLabel("lblTitle",
		"<span style='color:#6666ff;font-size:40px;'>D</span>ANCING<span style='color:#ffff66;font-size:40px;'>☆</span><span style='color:#ff6666;font-size:40px;'>O</span>NIGIRI", 0, 15);
	divRoot.appendChild(lblTitle);

	// ユーザカスタムイベント(初期)
	if (typeof customTitleInit === "function") {
		customTitleInit();
		if (typeof customTitleInit2 === "function") {
			customTitleInit2();
		}
	}

	// ブラウザチェック
	if (g_userAgent.indexOf('msie') !== -1 ||
		g_userAgent.indexOf('trident') !== -1 ||
		g_userAgent.indexOf('edge') !== -1) {

		makeWarningWindow(C_MSG_W_0001);
	}

	// オーディオファイル指定
	if (g_musicEncodedFlg) {
		if (typeof musicInit === "function") {
			musicInit();
			g_audio.src = "data:audio/mp3;base64," + g_musicdata;
		} else {
			makeWarningWindow(C_MSG_E_0031);
		}
	} else {
		g_audio.src = "../" + g_headerObj.musicFolder + "/" + g_headerObj.musicUrl;
	}

	// ボタン描画
	const btnStart = createButton({
		id: "btnStart",
		name: "Click Here!!",
		x: 0,
		y: g_sHeight - 100,
		width: g_sWidth,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_TITLESIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_DEFHOVER,
		align: C_ALIGN_CENTER
	}, function () {
		clearWindow();
		optionInit();
	});
	divRoot.appendChild(btnStart);

	// リロードボタン
	const btnReload = createButton({
		id: "btnReload",
		name: "R",
		x: 10,
		y: 10,
		width: 30,
		height: 30,
		fontsize: 20,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_DEFHOVER,
		align: C_ALIGN_CENTER
	}, function () {
		location.reload(true);
	});
	divRoot.appendChild(btnReload);

	// 製作者表示
	const lnkMaker = createButton({
		id: "lnkMaker",
		name: "Maker: " + g_headerObj["tuning"],
		x: 20,
		y: g_sHeight - 45,
		width: g_sWidth / 2 - 10,
		height: C_LNK_HEIGHT,
		fontsize: C_LBL_LNKSIZE,
		normalColor: C_CLR_LNK,
		hoverColor: C_CLR_DEFAULT,
		align: C_ALIGN_LEFT
	}, function () {
		window.open(g_headerObj["creatorUrl"], '_blank');
	});
	divRoot.appendChild(lnkMaker);

	// 作曲者リンク表示
	const lnkArtist = createButton({
		id: "lnkArtist",
		name: "Artist: " + g_headerObj["artistName"],
		x: g_sWidth / 2,
		y: g_sHeight - 45,
		width: g_sWidth / 2 - 10,
		height: C_LNK_HEIGHT,
		fontsize: C_LBL_LNKSIZE,
		normalColor: C_CLR_LNK,
		hoverColor: C_CLR_DEFAULT,
		align: C_ALIGN_LEFT
	}, function () {
		window.open(g_headerObj["artistUrl"], '_blank');
	});
	divRoot.appendChild(lnkArtist);

	// バージョン描画
	let customVersion = "";
	if (setVal(g_localVersion, "", "string") !== "") {
		customVersion = " / " + g_localVersion;
	}
	if (setVal(g_localVersion2, "", "string") !== "") {
		customVersion += " / " + g_localVersion2;
	}
	const lnkVersion = createButton({
		id: "lnkVersion",
		name: "&copy; 2018 ティックル, CW " + g_version + customVersion,
		x: g_sWidth / 3,
		y: g_sHeight - 20,
		width: g_sWidth * 2 / 3 - 10,
		height: 16,
		fontsize: 12,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_TWEET,
		align: C_ALIGN_RIGHT
	}, function () {
		window.open("https://github.com/cwtickle/danoniplus", '_blank');
	});
	divRoot.appendChild(lnkVersion);

	// キー操作イベント（デフォルト）
	document.onkeydown = function (evt) {
		// ブラウザ判定
		let setKey;
		if (g_userAgent.indexOf("firefox") !== -1) {
			setKey = evt.which;
		} else {
			setKey = event.keyCode;
		}
		if (setKey === 13) {
			clearWindow();
			optionInit();
		}
		for (var j = 0; j < C_BLOCK_KEYS.length; j++) {
			if (setKey === C_BLOCK_KEYS[j]) {
				return false;
			}
		}
	}

	document.onkeyup = function (evt) {
	}

	divRoot.oncontextmenu = function () {
		return false;
	}
}

/**
 * 警告用ウィンドウ（汎用）を表示
 * @param {string} _id 
 * @param {string} _text 
 */
function makeWarningWindow(_text) {
	let lblWarning;
	if (document.getElementById("lblWarning") === null) {
		lblWarning = getTitleDivLabel("lblWarning", "<p>" + _text + "</p>", 0, 70);
		lblWarning.style.backgroundColor = "#ffcccc";
		lblWarning.style.opacity = 0.9;
	} else {
		lblWarning = document.getElementById("lblWarning");
		lblWarning.innerHTML += "<p>" + _text + "</p>";
	}
	const len = lblWarning.innerHTML.split("<br>").length + lblWarning.innerHTML.split("<p>").length - 1;
	const warnHeight = 21 * len;
	lblWarning.style.height = warnHeight + "px";
	lblWarning.style.lineHeight = "15px";
	lblWarning.style.fontSize = "14px";
	lblWarning.style.color = "#660000";
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
	const paramsTmp = _dos.split("&").join("|");
	const params = paramsTmp.split("|");
	for (var j = 0; j < params.length; j++) {
		const pos = params[j].indexOf("=");
		if (pos > 0) {
			const pKey = params[j].substring(0, pos);
			const pValue = params[j].substring(pos + 1);
			if (pKey !== undefined) {
				obj[pKey] = pValue;
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
	if (_dosObj.musicTitle !== undefined && _dosObj.musicTitle !== "") {
		const musics = _dosObj.musicTitle.split(",");
		obj.musicTitle = musics[0];
		if (musics.length > 1) {
			obj.artistName = musics[1];
		} else {
			makeWarningWindow(C_MSG_E_0011);
			obj.artistName = "artistName";
		}
		if (musics.length > 2) {
			obj.artistUrl = musics[2];
		} else {
			obj.artistUrl = location.href;
		}
	} else {
		makeWarningWindow(C_MSG_E_0012);
		obj.musicTitle = "musicName";
		obj.artistName = "artistName";
		obj.artistUrl = location.href;
	}

	// 譜面情報
	if (_dosObj.difData !== undefined && _dosObj.difData !== "") {
		const difs = _dosObj.difData.split("$");
		obj.keyLabels = new Array();
		obj.difLabels = new Array();
		obj.initSpeeds = new Array();
		obj.lifeBorders = new Array();
		obj.lifeRecoverys = new Array();
		obj.lifeDamages = new Array();
		obj.lifeInits = new Array();
		for (var j = 0; j < difs.length; j++) {
			const difDetails = difs[j].split(",");
			obj.keyLabels.push(setVal(difDetails[0], "7", "string"));
			obj.difLabels.push(setVal(difDetails[1], "Normal", "string"));
			obj.initSpeeds.push(setVal(difDetails[2], 3.5, "float"));
			if (difDetails.length > 3 && difDetails[3] !== "x") {
				obj.lifeBorders.push(setVal(difDetails[3], 70, "number"));
			} else {
				obj.lifeBorders.push("x");
			}
			obj.lifeRecoverys.push(setVal(difDetails[4], 6, "float"));
			obj.lifeDamages.push(setVal(difDetails[5], 40, "float"));
			obj.lifeInits.push(setVal(difDetails[6], 25, "float") * 10);
		}
	} else {
		makeWarningWindow(C_MSG_E_0021);
		obj.keyLabels = ["7"];
		obj.difLabels = ["Normal"];
		obj.initSpeeds = [3.5];
		obj.lifeBorders = ["x"];
		obj.lifeRecoverys = [6];
		obj.lifeDamages = [40];
		obj.lifeInits = [250];
	}
	if (obj.initSpeeds[0] !== undefined) {
		g_stateObj.speed = obj.initSpeeds[0];
	}
	if (obj.lifeBorders[0] === "x") {
		g_stateObj.lifeBorder = 0;
		g_stateObj.lifeMode = C_LFE_SURVIVAL;
		g_gaugeType = C_LFE_SURVIVAL;
	} else {
		g_stateObj.lifeBorder = obj.lifeBorders[0];
		g_stateObj.lifeMode = C_LFE_BORDER;
		g_gaugeType = C_LFE_BORDER;
	}

	// ノルマ制設定
	for (var j = 0; j < g_gaugeOptionObj.border.length; j++) {
		if (g_gaugeOptionObj.border[j] != "SuddenDeath") {
			getGaugeSetting(_dosObj, g_gaugeOptionObj.border[j], obj);
		}
	}

	g_stateObj.lifeSetName = g_gaugeOptionObj[g_gaugeType.toLowerCase()][g_stateObj.lifeId];

	if (g_gaugeOptionObj["gauge" + g_stateObj.lifeSetName + "s"] != undefined) {
		if (g_gaugeOptionObj["gauge" + g_stateObj.lifeSetName + "s"].lifeBorders[0] === "x") {
			g_stateObj.lifeBorder = 0;
		} else {
			g_stateObj.lifeBorder = g_gaugeOptionObj["gauge" + g_stateObj.lifeSetName + "s"].lifeBorders[0];
		}
		g_stateObj.lifeRcv = g_gaugeOptionObj["gauge" + g_stateObj.lifeSetName + "s"].lifeRecoverys[0];
		g_stateObj.lifeDmg = g_gaugeOptionObj["gauge" + g_stateObj.lifeSetName + "s"].lifeDamages[0];
		g_stateObj.lifeInit = g_gaugeOptionObj["gauge" + g_stateObj.lifeSetName + "s"].lifeInits[0];
	} else {
		g_stateObj.lifeRcv = obj.lifeRecoverys[0];
		g_stateObj.lifeDmg = obj.lifeDamages[0];
		g_stateObj.lifeInit = obj.lifeInits[0];
	}

	// 初期色情報
	obj.setColorInit = ["#cccccc", "#9999ff", "#ffffff", "#ffff99", "#99ff99"];

	if (_dosObj.setColor !== undefined && _dosObj.setColor !== "") {
		obj.setColor = _dosObj.setColor.split(",");
		for (var j = 0; j < obj.setColor.length; j++) {
			obj.setColor[j] = obj.setColor[j].replace("0x", "#");
		}
		for (var j = obj.setColor.length; j < obj.setColorInit.length; j++) {
			obj.setColor[j] = obj.setColorInit[j];
		}
	} else {
		obj.setColor = obj.setColorInit.concat();
	}
	//obj.setColorDef = obj.setColor.concat();


	// フリーズアロー初期色情報
	obj.frzColorInit = ["#66ffff", "#6600ff", "#cccc33", "#999933"];
	obj.frzColor = new Array();
	obj.frzColorDef = new Array();

	if (_dosObj.frzColor !== undefined && _dosObj.frzColor !== "") {
		const tmpFrzColors = _dosObj.frzColor.split("$");
		for (var j = 0, len = tmpFrzColors.length; j < len; j++) {
			obj.frzColor[j] = new Array();
			obj.frzColor[j] = tmpFrzColors[j].split(",");

			for (var k = 0; k < obj.frzColor[j].length; k++) {
				obj.frzColor[j][k] = obj.frzColor[j][k].replace("0x", "#");
			}
			for (var k = obj.frzColor[j].length; k < obj.frzColorInit.length; k++) {
				obj.frzColor[j][k] = obj.frzColorInit[k];
			}

			obj.frzColorDef[j] = new Array();
			obj.frzColorDef[j] = obj.frzColor[j].concat();
		}
		for (var j = tmpFrzColors.length, len = obj.setColorInit.length; j < len; j++) {
			obj.frzColor[j] = new Array();
			obj.frzColor[j] = obj.frzColor[0].concat();
			obj.frzColorDef[j] = new Array();
			obj.frzColorDef[j] = obj.frzColor[j].concat();
		}

	} else {
		for (var j = 0, len = obj.setColorInit.length; j < len; j++) {
			obj.frzColor[j] = new Array();
			obj.frzColor[j] = obj.frzColorInit.concat();
			obj.frzColorDef[j] = new Array();
			obj.frzColorDef[j] = obj.frzColor[j].concat();
		}
	}


	// 製作者表示
	if (_dosObj.tuning !== undefined && _dosObj.tuning !== "") {
		const tunings = _dosObj.tuning.split(",");
		obj.tuning = tunings[0];
		if (tunings.length > 1) {
			obj.creatorUrl = tunings[1];
		} else {
			obj.creatorUrl = location.href;
		}
	} else {
		obj.tuning = "name";
		obj.creatorUrl = location.href;
	}

	// 無音のフレーム数
	obj.blankFrame = 200;
	obj.blankFrameDef = 200;
	if (isNaN(parseFloat(_dosObj.blankFrame))) {
	} else {
		obj.blankFrame = parseInt(_dosObj.blankFrame);
		obj.blankFrameDef = parseInt(_dosObj.blankFrame);
	}

	// フェードインフレーム数
	if (_dosObj.startFrame !== undefined) {
		obj.startFrame = parseInt(_dosObj.startFrame);
	} else {
		obj.startFrame = 0;
	}

	// フェードアウトフレーム数(譜面別)
	if (_dosObj.fadeFrame !== undefined) {
		obj.fadeFrame = _dosObj.fadeFrame.split("$");
	}

	// 終了フレーム数
	if (_dosObj.endFrame !== undefined) {
		obj.endFrame = _dosObj.endFrame.split("$");
	}

	// 外部jsファイルの指定
	if (_dosObj.customjs !== undefined && _dosObj.customjs !== "") {
		const customjss = _dosObj.customjs.split(",");
		if (customjss.length > 1) {
			obj.customjs2 = customjss[1];
		} else {
			obj.customjs2 = "";
		}
		obj.customjs = setVal(customjss[0], "danoni_custom.js", "string");
	} else {
		obj.customjs = "danoni_custom.js";
		obj.customjs2 = "";
	}

	// ステップゾーン位置
	if (isNaN(parseFloat(_dosObj.stepY))) {
		g_stepY = C_STEP_Y;
	} else {
		g_stepY = parseFloat(_dosObj.stepY);
	}
	g_distY = g_sHeight - g_stepY;

	// musicフォルダ設定
	obj.musicFolder = setVal(_dosObj.musicFolder, "music", "string");

	// 楽曲URL
	if (_dosObj.musicUrl !== undefined) {
		if (_dosObj.musicUrl.slice(-3) === ".js" || _dosObj.musicUrl.slice(-4) === ".txt") {
			g_musicEncodedFlg = true;
		}
		obj.musicUrl = _dosObj.musicUrl;
	} else {
		makeWarningWindow(C_MSG_E_0031);
	}

	// hashTag
	if (_dosObj.hashTag !== undefined) {
		obj.hashTag = _dosObj.hashTag;
	}

	// 読込対象の画像を指定(rel:preload)と同じ
	obj.preloadImages = new Array();
	if (_dosObj.preloadImages !== undefined) {
		const preloadImgs = preloadImages.split(",");

		for (var j = 0, len = preloadImgs.length; j < len; j++) {
			if (setVal(preloadImgs[j], "", "string") !== "") {
				obj.preloadImages[j] = preloadImgs[j];
			}
		}
	}

	// フォントの設定
	obj.customFont = setVal(_dosObj.customFont, "", "string");

	// 最終演出表示有無（noneで無効化）
	obj.finishView = setVal(_dosObj.finishView, "", "string");

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

	if (_dosObj["gauge" + _name] !== undefined && _dosObj["gauge" + _name] !== "") {
		const gauges = _dosObj["gauge" + _name].split("$");

		g_gaugeOptionObj["gauge" + _name + "s"] = {
			lifeBorders: [],
			lifeRecoverys: [],
			lifeDamages: [],
			lifeInits: []
		};

		for (var j = 0; j < gauges.length; j++) {
			const gaugeDetails = gauges[j].split(",");
			if (gaugeDetails[0] === "x") {
				g_gaugeOptionObj["gauge" + _name + "s"].lifeBorders.push("x");
			} else {
				g_gaugeOptionObj["gauge" + _name + "s"].lifeBorders.push(setVal(gaugeDetails[0], 70, "float"));
			}
			g_gaugeOptionObj["gauge" + _name + "s"].lifeRecoverys.push(setVal(gaugeDetails[1], 2, "float"));
			g_gaugeOptionObj["gauge" + _name + "s"].lifeDamages.push(setVal(gaugeDetails[2], 7, "float"));
			g_gaugeOptionObj["gauge" + _name + "s"].lifeInits.push(C_VAL_MAXLIFE * setVal(gaugeDetails[3], 25, "float") / 100);
		}
		if (gauges.length < difLength) {
			for (var j = gauges.length; j < difLength; j++) {
				g_gaugeOptionObj["gauge" + _name + "s"].lifeBorders.push(_headerObj.lifeBorders[j]);
				g_gaugeOptionObj["gauge" + _name + "s"].lifeRecoverys.push(_headerObj.lifeRecoverys[j]);
				g_gaugeOptionObj["gauge" + _name + "s"].lifeDamages.push(_headerObj.lifeDamages[j]);
				g_gaugeOptionObj["gauge" + _name + "s"].lifeInits.push(_headerObj.lifeInits[j]);
			}
		}
	}
}

/**
 * 一時的な追加キーの設定
 * @param {object} _dosObj 
 */
function keysConvert(_dosObj) {

	let newKey = "";

	if (_dosObj.keyExtraList !== undefined) {
		const keyExtraList = _dosObj.keyExtraList.split(",");
		let tmpKeyCtrl = new Array();
		let tmpKeyPtn = new Array();
		let tmpMinPatterns = 1;

		for (var j = 0; j < keyExtraList.length; j++) {
			newKey = keyExtraList[j];

			// 矢印色パターン (colorX_Y)
			if (_dosObj["color" + newKey] !== undefined) {
				const tmpColors = _dosObj["color" + newKey].split("$");
				if (tmpColors.length > 0) {
					for (var k = 0, len = tmpColors.length; k < len; k++) {
						if (setVal(tmpColors[k], "", "string") === "" && g_keyObj["color" + newKey + "_" + k] !== undefined) {
							continue;
						}
						g_keyObj["color" + newKey + "_" + k] = tmpColors[k].split(",");
						for (var m = 0, len2 = g_keyObj["color" + newKey + "_" + k].length; m < len2; m++) {
							g_keyObj["color" + newKey + "_" + k][m] = Number(g_keyObj["color" + newKey + "_" + k][m]);
						}
					}
					tmpMinPatterns = tmpColors.length;
				}
			} else if (g_keyObj["color" + newKey + "_0"] === undefined) {
				makeWarningWindow(C_MSG_E_0101.split("{0}").join(newKey));
			}

			// 読込変数の接頭辞 (charaX_Y)
			if (_dosObj["chara" + newKey] !== undefined) {
				const tmpCharas = _dosObj["chara" + newKey].split("$");
				if (tmpCharas.length > 0) {
					for (var k = 0, len = tmpCharas.length; k < len; k++) {
						if (setVal(tmpCharas[k], "", "string") === "" && g_keyObj["chara" + newKey + "_" + k] !== undefined) {
							continue;
						}
						g_keyObj["chara" + newKey + "_" + k] = tmpCharas[k].split(",");
						g_keyObj["chara" + newKey + "_" + k + "d"] = tmpCharas[k].split(",");
					}
				}
			} else if (g_keyObj["chara" + newKey + "_0"] === undefined) {
				makeWarningWindow(C_MSG_E_0102.split("{0}").join(newKey));
			}

			// 各キーの区切り位置 (divX_Y)
			if (_dosObj["div" + newKey] !== undefined) {
				const tmpDivs = _dosObj["div" + newKey].split("$");
				if (tmpDivs.length > 0) {
					for (var k = 0, len = tmpDivs.length; k < len; k++) {
						if (setVal(tmpDivs[k], -1, "number") === -1) {
							if (setVal(g_keyObj["div" + newKey + "_" + k], -1, "number") !== -1) {
								continue;
							} else if (g_keyObj["chara" + newKey + "_0"] !== undefined) {
								g_keyObj["div" + newKey + "_" + k] = g_keyObj["chara" + newKey + "_0"].length;
							}
						} else {
							g_keyObj["div" + newKey + "_" + k] = tmpDivs[k];
						}
					}
				}
			}

			// 矢印の回転量指定、キャラクタパターン (StepRtnX_Y)
			if (_dosObj["stepRtn" + newKey] !== undefined) {
				const tmpStepRtns = _dosObj["stepRtn" + newKey].split("$");
				if (tmpStepRtns.length > 0) {
					for (var k = 0, len = tmpStepRtns.length; k < len; k++) {
						if (setVal(tmpStepRtns[k], "", "string") === "" && g_keyObj["stepRtn" + newKey + "_" + k] !== undefined) {
							continue;
						}
						g_keyObj["stepRtn" + newKey + "_" + k] = tmpStepRtns[k].split(",");
						g_keyObj["stepRtn" + newKey + "_" + k + "d"] = tmpStepRtns[k].split(",");

						for (var m = 0, lenc = g_keyObj["stepRtn" + newKey + "_" + k].length; m < lenc; m++) {
							if (isNaN(Number(g_keyObj["stepRtn" + newKey + "_" + k][m]))) {
							} else {
								g_keyObj["stepRtn" + newKey + "_" + k][m] = parseFloat(g_keyObj["stepRtn" + newKey + "_" + k][m]);
								g_keyObj["stepRtn" + newKey + "_" + k + "d"][m] = g_keyObj["stepRtn" + newKey + "_" + k][m];
							}
						}
					}
				}
			} else if (g_keyObj["stepRtn" + newKey + "_0"] === undefined) {
				makeWarningWindow(C_MSG_E_0103.split("{0}").join(newKey));
			}

			// ステップゾーン位置 (posX_Y)
			if (_dosObj["pos" + newKey] !== undefined) {
				const tmpPoss = _dosObj["pos" + newKey].split("$");
				if (tmpPoss.length > 0) {
					for (var k = 0, len = tmpPoss.length; k < len; k++) {
						if (setVal(tmpPoss[k], "", "string") === "" && g_keyObj["pos" + newKey + "_" + k] !== undefined) {
							continue;
						}
						g_keyObj["pos" + newKey + "_" + k] = tmpPoss[k].split(",");
						for (var m = 0, len2 = g_keyObj["pos" + newKey + "_" + k].length; m < len2; m++) {
							g_keyObj["pos" + newKey + "_" + k][m] = Number(g_keyObj["pos" + newKey + "_" + k][m]);
						}
					}
				}

			} else {
				for (var k = 0; k < tmpMinPatterns; k++) {
					if (g_keyObj["color" + newKey + "_" + k] !== undefined) {
						g_keyObj["pos" + newKey + "_" + k] = new Array();
						for (var m = 0; m < g_keyObj["color" + newKey + "_" + k].length; m++) {
							g_keyObj["pos" + newKey + "_" + k][m] = m;
						}
					}
				}
			}

			// キーコンフィグ (keyCtrlX_Y)
			if (_dosObj["keyCtrl" + newKey] !== undefined) {
				const tmpKeyCtrls = _dosObj["keyCtrl" + newKey].split("$");

				if (tmpKeyCtrls.length > 0) {
					for (var p = 0, len = tmpKeyCtrls.length; p < len; p++) {
						if (setVal(tmpKeyCtrls[p], "", "string") === "" && g_keyObj["keyCtrl" + newKey + "_" + p] !== undefined) {
							continue;
						}
						tmpKeyCtrl = tmpKeyCtrls[p].split(",");

						g_keyObj["keyCtrl" + newKey + "_" + p] = new Array();
						g_keyObj["keyCtrl" + newKey + "_" + p + "d"] = new Array();

						for (var k = 0; k < tmpKeyCtrl.length; k++) {
							tmpKeyPtn = tmpKeyCtrl[k].split("/");
							g_keyObj["keyCtrl" + newKey + "_" + p][k] = new Array();
							g_keyObj["keyCtrl" + newKey + "_" + p + "d"][k] = new Array();

							for (var m = 0; m < tmpKeyPtn.length; m++) {
								g_keyObj["keyCtrl" + newKey + "_" + p][k][m] = Number(tmpKeyPtn[m]);
								g_keyObj["keyCtrl" + newKey + "_" + p + "d"][k][m] = Number(tmpKeyPtn[m]);
							}
						}
					}
				}
			} else if (g_keyObj["keyCtrl" + newKey + "_0"] === undefined) {
				makeWarningWindow(C_MSG_E_0104.split("{0}").join(newKey));
			}

			// ステップゾーン間隔 (blankX_Y)
			if (_dosObj["blank" + newKey] !== undefined) {
				const tmpBlanks = _dosObj["blank" + newKey].split("$");
				if (tmpBlanks.length > 0) {
					for (var k = 0, len = tmpBlanks.length; k < len; k++) {
						if (isNaN(Number(tmpBlanks[k]))) {
						} else {
							g_keyObj["blank" + newKey + "_" + k] = parseFloat(tmpBlanks[k]);
						}
					}
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

	const divRoot = document.getElementById("divRoot");

	// タイトル文字描画
	const lblTitle = getTitleDivLabel("lblTitle",
		"<span style='color:#6666ff;font-size:40px;'>S</span>ETTINGS", 0, 15);
	divRoot.appendChild(lblTitle);

	// オプションボタン用の設置
	createOptionWindow("divRoot");

	// ユーザカスタムイベント(初期)
	if (typeof customOptionInit === "function") {
		customOptionInit();
		if (typeof customOptionInit2 === "function") {
			customOptionInit2();
		}
	}

	// 戻るボタン描画
	const btnBack = createButton({
		id: "btnBack",
		name: "Back",
		x: 0,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_BACK,
		align: C_ALIGN_CENTER
	}, function () {
		// タイトル画面へ戻る
		clearWindow();
		titleInit();
	});
	divRoot.appendChild(btnBack);

	// キーコンフィグボタン描画
	const btnKeyConfig = createButton({
		id: "btnKeyConfig",
		name: "KeyConfig",
		x: g_sWidth / 3,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_SETTING,
		align: C_ALIGN_CENTER
	}, function () {
		// キーコンフィグ画面へ遷移
		g_kcType = "Main";
		clearWindow();
		keyConfigInit();
	});
	divRoot.appendChild(btnKeyConfig);

	// 進むボタン描画
	const btnPlay = createButton({
		id: "btnPlay",
		name: "Play",
		x: g_sWidth / 3 * 2,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_NEXT,
		align: C_ALIGN_CENTER
	}, function () {
		clearWindow();
		g_audio.load();

		if (g_audio.readyState === 4) {
			// audioの読み込みが終わった後の処理
			loadingScoreInit();
		} else {
			// 読込中の状態
			g_audio.addEventListener('canplaythrough', (function () {
				return function f() {
					g_audio.removeEventListener('canplaythrough', f, false);
					loadingScoreInit();
				}
			})(), false);
		}
	});
	divRoot.appendChild(btnPlay);

	// SETTING-DISPLAYボタン描画
	const btnDisplay = createButton({
		id: "btnDisplay",
		name: ">",
		x: g_sWidth / 2 + 175 - C_LEN_SETMINI_WIDTH / 2,
		y: 25,
		width: C_LEN_SETMINI_WIDTH,
		height: 40,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_SETTING,
		align: C_ALIGN_CENTER
	}, function () {
		// タイトル画面へ戻る
		clearWindow();
		settingsDisplayInit();
	});
	divRoot.appendChild(btnDisplay);

	// キー操作イベント（デフォルト）
	document.onkeydown = function (evt) {
		// ブラウザ判定
		let setKey;
		if (g_userAgent.indexOf("firefox") !== -1) {
			setKey = evt.which;
		} else {
			setKey = event.keyCode;
		}
		if (setKey === 13) {
			clearWindow();
			g_audio.load();

			if (g_audio.readyState === 4) {
				// audioの読み込みが終わった後の処理
				loadingScoreInit();
			} else {
				// 読込中の状態
				g_audio.addEventListener('canplaythrough', (function () {
					return function f() {
						g_audio.removeEventListener('canplaythrough', f, false);
						loadingScoreInit();
					}
				})(), false);
			}
		}
		for (var j = 0; j < C_BLOCK_KEYS.length; j++) {
			if (setKey === C_BLOCK_KEYS[j]) {
				return false;
			}
		}
	}
	document.onkeyup = function (evt) {
	}
}

/**
 * 設定・オプション画面のラベル・ボタン処理の描画
 * @param {Object} _sprite 基準とするスプライト(ここで指定する座標は、そのスプライトからの相対位置)
 */
function createOptionWindow(_sprite) {

	// 各ボタン用のスプライトを作成
	const optionsprite = createSprite(_sprite, "optionsprite", (g_sWidth - 400) / 2, 90, 400, 300);

	// 難易度(Difficulty)
	const lblDifficulty = createDivLabel("lblDifficulty", 0, C_LEN_SETLBL_HEIGHT * 0,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETDIFLBL, C_CLR_TITLE,
		"<span style='color:#ff9999'>D</span>ifficulty");
	optionsprite.appendChild(lblDifficulty);

	const lnkDifficulty = makeSettingLblButton("lnkDifficulty",
		g_headerObj["keyLabels"][g_stateObj.scoreId] + " key / " + g_headerObj["difLabels"][g_stateObj.scoreId], 0, function () {
			g_stateObj.scoreId = (g_stateObj.scoreId < g_headerObj["keyLabels"].length - 1 ? ++g_stateObj.scoreId : 0);
			setDifficulty();
		});
	if (getStrLength(lnkDifficulty.innerHTML) > 25) {
		lnkDifficulty.style.fontSize = "14px";
	} else if (getStrLength(lnkDifficulty.innerHTML) > 18) {
		lnkDifficulty.style.fontSize = "16px";
	}
	lnkDifficulty.oncontextmenu = function () {
		g_stateObj.scoreId = (g_stateObj.scoreId > 0 ? --g_stateObj.scoreId : g_headerObj["keyLabels"].length - 1);
		setDifficulty();
		return false;
	}
	optionsprite.appendChild(lnkDifficulty);

	optionsprite.appendChild(makeMiniButton("lnkDifficulty", "R", 0, function () {
		g_stateObj.scoreId = (g_stateObj.scoreId < g_headerObj["keyLabels"].length - 1 ? ++g_stateObj.scoreId : 0);
		setDifficulty();
	}));
	optionsprite.appendChild(makeMiniButton("lnkDifficulty", "L", 0, function () {
		g_stateObj.scoreId = (g_stateObj.scoreId > 0 ? --g_stateObj.scoreId : g_headerObj["keyLabels"].length - 1);
		setDifficulty();
	}));

	/**
	 * 難易度変更ボタン押下時処理：譜面名及び初期速度を変更
	 */
	function setDifficulty() {
		lnkDifficulty.innerHTML = g_headerObj["keyLabels"][g_stateObj.scoreId] + " key / " + g_headerObj["difLabels"][g_stateObj.scoreId];
		g_stateObj.speed = g_headerObj["initSpeeds"][g_stateObj.scoreId];
		lnkSpeed.innerHTML = g_stateObj.speed + " x";
		g_keyObj.currentKey = g_headerObj["keyLabels"][g_stateObj.scoreId];
		g_keyObj.currentPtn = 0;

		g_stateObj.lifeId = 0;
		gaugeChange(g_stateObj.lifeId);

		lnkGauge.innerHTML = g_stateObj.lifeSetName;
		lblGauge2.innerHTML = gaugeFormat(g_stateObj.lifeMode, g_stateObj.lifeBorder, g_stateObj.lifeRcv, g_stateObj.lifeDmg, g_stateObj.lifeInit);

		if (getStrLength(lnkDifficulty.innerHTML) > 25) {
			lnkDifficulty.style.fontSize = "14px";
		} else if (getStrLength(lnkDifficulty.innerHTML) > 18) {
			lnkDifficulty.style.fontSize = "16px";
		}
	}

	// 速度(Speed)
	const lblSpeed = createDivLabel("lblSpeed", 0, C_LEN_SETLBL_HEIGHT * 2,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#ffff99'>S</span>peed");
	optionsprite.appendChild(lblSpeed);

	const lnkSpeed = makeSettingLblButton("lnkSpeed", g_stateObj.speed + " x", 2, function () {
		g_stateObj.speed = (Number(g_stateObj.speed) < C_MAX_SPEED ? Number(g_stateObj.speed) + 0.25 : C_MIN_SPEED);
		lnkSpeed.innerHTML = g_stateObj.speed + " x";
	});
	lnkSpeed.oncontextmenu = function () {
		g_stateObj.speed = (Number(g_stateObj.speed) > C_MIN_SPEED ? Number(g_stateObj.speed) - 0.25 : C_MAX_SPEED);
		lnkSpeed.innerHTML = g_stateObj.speed + " x";
		return false;
	}
	optionsprite.appendChild(lnkSpeed);

	optionsprite.appendChild(makeMiniButton("lnkSpeed", "R", 2, function () {
		g_stateObj.speed = (Number(g_stateObj.speed) < C_MAX_SPEED - 1 ? Number(g_stateObj.speed) + 1 : (Number(g_stateObj.speed) === C_MAX_SPEED ? C_MIN_SPEED : C_MAX_SPEED));
		lnkSpeed.innerHTML = g_stateObj.speed + " x";
	}));
	optionsprite.appendChild(makeMiniButton("lnkSpeed", "L", 2, function () {
		g_stateObj.speed = (Number(g_stateObj.speed) > C_MIN_SPEED + 1 ? Number(g_stateObj.speed) - 1 : (Number(g_stateObj.speed) === C_MIN_SPEED ? C_MAX_SPEED : C_MIN_SPEED));
		lnkSpeed.innerHTML = g_stateObj.speed + " x";
	}));
	optionsprite.appendChild(makeMiniButton("lnkSpeed", "RR", 2, function () {
		g_stateObj.speed = (Number(g_stateObj.speed) < C_MAX_SPEED ? Number(g_stateObj.speed) + 0.25 : C_MIN_SPEED);
		lnkSpeed.innerHTML = g_stateObj.speed + " x";
	}));
	optionsprite.appendChild(makeMiniButton("lnkSpeed", "LL", 2, function () {
		g_stateObj.speed = (Number(g_stateObj.speed) > C_MIN_SPEED ? Number(g_stateObj.speed) - 0.25 : C_MAX_SPEED);
		lnkSpeed.innerHTML = g_stateObj.speed + " x";
	}));


	// 速度モーション (Motion)
	const lblMotion = createDivLabel("lblMotion", 0, C_LEN_SETLBL_HEIGHT * 3,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#eeff99'>M</span>otion");
	optionsprite.appendChild(lblMotion);

	const lnkMotion = makeSettingLblButton("lnkMotion", g_stateObj.motion, 3, function () {
		switch (g_stateObj.motion) {
			case C_FLG_OFF:
				g_stateObj.motion = "Boost"; break;
			case "Boost":
				g_stateObj.motion = "Brake"; break;
			case "Brake":
				g_stateObj.motion = C_FLG_OFF; break;
		}
		lnkMotion.innerHTML = g_stateObj.motion;
	});
	lnkMotion.oncontextmenu = function () {
		switch (g_stateObj.motion) {
			case C_FLG_OFF:
				g_stateObj.motion = "Brake"; break;
			case "Boost":
				g_stateObj.motion = C_FLG_OFF; break;
			case "Brake":
				g_stateObj.motion = "Boost"; break;
		}
		lnkMotion.innerHTML = g_stateObj.motion;
		return false;
	}
	optionsprite.appendChild(lnkMotion);

	optionsprite.appendChild(makeMiniButton("lnkMotion", "R", 3, function () {
		switch (g_stateObj.motion) {
			case C_FLG_OFF:
				g_stateObj.motion = "Boost"; break;
			case "Boost":
				g_stateObj.motion = "Brake"; break;
			case "Brake":
				g_stateObj.motion = C_FLG_OFF; break;
		}
		lnkMotion.innerHTML = g_stateObj.motion;
	}));
	optionsprite.appendChild(makeMiniButton("lnkMotion", "L", 3, function () {
		switch (g_stateObj.motion) {
			case C_FLG_OFF:
				g_stateObj.motion = "Brake"; break;
			case "Boost":
				g_stateObj.motion = C_FLG_OFF; break;
			case "Brake":
				g_stateObj.motion = "Boost"; break;
		}
		lnkMotion.innerHTML = g_stateObj.motion;
	}));


	// リバース
	const lblReverse = createDivLabel("lblReverse", 0, C_LEN_SETLBL_HEIGHT * 4,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#ddff99'>R</span>everse");
	optionsprite.appendChild(lblReverse);

	const lnkReverse = makeSettingLblButton("lnkReverse", g_stateObj.reverse, 4, function () {
		g_stateObj.reverse = (g_stateObj.reverse === C_FLG_OFF ? C_FLG_ON : C_FLG_OFF);
		lnkReverse.innerHTML = g_stateObj.reverse;
	});
	lnkReverse.oncontextmenu = function () {
		g_stateObj.reverse = (g_stateObj.reverse === C_FLG_OFF ? C_FLG_ON : C_FLG_OFF);
		lnkReverse.innerHTML = g_stateObj.reverse;
		return false;
	}
	optionsprite.appendChild(lnkReverse);

	optionsprite.appendChild(makeMiniButton("lnkReverse", "R", 4, function () {
		g_stateObj.reverse = (g_stateObj.reverse === C_FLG_OFF ? C_FLG_ON : C_FLG_OFF);
		lnkReverse.innerHTML = g_stateObj.reverse;
	}));
	optionsprite.appendChild(makeMiniButton("lnkReverse", "L", 4, function () {
		g_stateObj.reverse = (g_stateObj.reverse === C_FLG_OFF ? C_FLG_ON : C_FLG_OFF);
		lnkReverse.innerHTML = g_stateObj.reverse;
	}));


	// 鑑賞モード設定 (AutoPlay)
	const lblAutoPlay = createDivLabel("lblAutoPlay", 0, C_LEN_SETLBL_HEIGHT * 5,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#ccff99'>A</span>utoPlay");
	optionsprite.appendChild(lblAutoPlay);

	const lnkAutoPlay = makeSettingLblButton("lnkAutoPlay", g_stateObj.auto, 5, function () {
		g_stateObj.auto = (g_stateObj.auto === C_FLG_OFF ? C_FLG_ON : C_FLG_OFF);
		lnkAutoPlay.innerHTML = g_stateObj.auto;
	});
	lnkAutoPlay.oncontextmenu = function () {
		g_stateObj.auto = (g_stateObj.auto === C_FLG_OFF ? C_FLG_ON : C_FLG_OFF);
		lnkAutoPlay.innerHTML = g_stateObj.auto;
		return false;
	}
	optionsprite.appendChild(lnkAutoPlay);

	optionsprite.appendChild(makeMiniButton("lnkAutoPlay", "R", 5, function () {
		g_stateObj.auto = (g_stateObj.auto === C_FLG_OFF ? C_FLG_ON : C_FLG_OFF);
		lnkAutoPlay.innerHTML = g_stateObj.auto;
	}));
	optionsprite.appendChild(makeMiniButton("lnkAutoPlay", "L", 5, function () {
		g_stateObj.auto = (g_stateObj.auto === C_FLG_OFF ? C_FLG_ON : C_FLG_OFF);
		lnkAutoPlay.innerHTML = g_stateObj.auto;
	}));

	// ゲージ設定 (Gauge)
	const lblGauge = createDivLabel("lblGauge", 0, C_LEN_SETLBL_HEIGHT * 6,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#99ff99'>G</span>auge");
	optionsprite.appendChild(lblGauge);

	const lblGauge2 = createDivLabel("lblGauge2", C_LEN_SETLBL_LEFT, C_LEN_SETLBL_HEIGHT * 7 - 3,
		C_LEN_SETLBL_WIDTH, C_LEN_SETLBL_HEIGHT, 11, C_CLR_TITLE,
		gaugeFormat(g_stateObj.lifeMode, g_stateObj.lifeBorder, g_stateObj.lifeRcv, g_stateObj.lifeDmg, g_stateObj.lifeInit));
	optionsprite.appendChild(lblGauge2);

	const lnkGauge = makeSettingLblButton("lnkGauge",
		g_stateObj.lifeSetName, 6, function () {
			g_stateObj.lifeId = (g_stateObj.lifeId + 1 >= g_gaugeOptionObj[g_gaugeType.toLowerCase()].length ? 0 : ++g_stateObj.lifeId);
			gaugeChange(g_stateObj.lifeId);

			lnkGauge.innerHTML = g_stateObj.lifeSetName;
			lblGauge2.innerHTML = gaugeFormat(g_stateObj.lifeMode, g_stateObj.lifeBorder, g_stateObj.lifeRcv, g_stateObj.lifeDmg, g_stateObj.lifeInit);
		});
	lnkGauge.oncontextmenu = function () {
		g_stateObj.lifeId = (g_stateObj.lifeId === 0 ? g_gaugeOptionObj[g_gaugeType.toLowerCase()].length - 1 : --g_stateObj.lifeId);
		gaugeChange(g_stateObj.lifeId);

		lnkGauge.innerHTML = g_stateObj.lifeSetName;
		lblGauge2.innerHTML = gaugeFormat(g_stateObj.lifeMode, g_stateObj.lifeBorder, g_stateObj.lifeRcv, g_stateObj.lifeDmg, g_stateObj.lifeInit);
		return false;
	}
	optionsprite.appendChild(lnkGauge);

	optionsprite.appendChild(makeMiniButton("lnkGauge", "R", 6, function () {
		g_stateObj.lifeId = (g_stateObj.lifeId + 1 >= g_gaugeOptionObj[g_gaugeType.toLowerCase()].length ? 0 : ++g_stateObj.lifeId);
		gaugeChange(g_stateObj.lifeId);

		lnkGauge.innerHTML = g_stateObj.lifeSetName;
		lblGauge2.innerHTML = gaugeFormat(g_stateObj.lifeMode, g_stateObj.lifeBorder, g_stateObj.lifeRcv, g_stateObj.lifeDmg, g_stateObj.lifeInit);
	}));
	optionsprite.appendChild(makeMiniButton("lnkGauge", "L", 6, function () {
		g_stateObj.lifeId = (g_stateObj.lifeId === 0 ? g_gaugeOptionObj[g_gaugeType.toLowerCase()].length - 1 : --g_stateObj.lifeId);
		gaugeChange(g_stateObj.lifeId);

		lnkGauge.innerHTML = g_stateObj.lifeSetName;
		lblGauge2.innerHTML = gaugeFormat(g_stateObj.lifeMode, g_stateObj.lifeBorder, g_stateObj.lifeRcv, g_stateObj.lifeDmg, g_stateObj.lifeInit);
	}));

	/**
	 * ゲージ設定の切替処理
	 * @param {number} _lifeId 
	 */
	function gaugeChange(_lifeId) {
		g_stateObj.lifeSetName = g_gaugeOptionObj[g_gaugeType.toLowerCase()][_lifeId];
		g_stateObj.lifeMode = g_gaugeOptionObj["type" + g_gaugeType][_lifeId];

		g_stateObj.lifeBorder = g_gaugeOptionObj["clear" + g_gaugeType][_lifeId];
		g_stateObj.lifeInit = g_gaugeOptionObj["init" + g_gaugeType][_lifeId];
		g_stateObj.lifeRcv = g_gaugeOptionObj["rcv" + g_gaugeType][_lifeId];
		g_stateObj.lifeDmg = g_gaugeOptionObj["dmg" + g_gaugeType][_lifeId];

		if (_lifeId === 0) {
			if (setVal(g_headerObj.lifeBorders[g_stateObj.scoreId], "", "string") !== "") {
				if (g_headerObj.lifeBorders[g_stateObj.scoreId] === "x") {
					g_gaugeType = C_LFE_SURVIVAL;
					g_stateObj.lifeBorder = 0;
					g_stateObj.lifeMode = C_LFE_SURVIVAL;
					g_stateObj.lifeSetName = g_gaugeOptionObj[g_gaugeType.toLowerCase()][_lifeId];
				} else {
					g_gaugeType = C_LFE_BORDER;
					g_stateObj.lifeBorder = g_headerObj.lifeBorders[g_stateObj.scoreId];
					g_stateObj.lifeMode = C_LFE_BORDER;
					g_stateObj.lifeSetName = g_gaugeOptionObj[g_gaugeType.toLowerCase()][_lifeId];
				}
			}
			if (setVal(g_headerObj.lifeInits[g_stateObj.scoreId], "", "number") !== "") {
				g_stateObj.lifeInit = g_headerObj.lifeInits[g_stateObj.scoreId];
			}
			if (setVal(g_headerObj.lifeRecoverys[g_stateObj.scoreId], "", "number") !== "") {
				g_stateObj.lifeRcv = g_headerObj.lifeRecoverys[g_stateObj.scoreId];
			}
			if (setVal(g_headerObj.lifeDamages[g_stateObj.scoreId], "", "number") !== "") {
				g_stateObj.lifeDmg = g_headerObj.lifeDamages[g_stateObj.scoreId];
			}

		} else if (g_stateObj.lifeSetName == "Light" || g_stateObj.lifeSetName == "Easy") {
			// ゲージ設定がLight/Easyのとき、Original/Normalに合わせて設定を見直す

			if (setVal(g_headerObj.lifeInits[g_stateObj.scoreId], "", "number") !== "") {
				g_stateObj.lifeInit = g_headerObj.lifeInits[g_stateObj.scoreId];
			}
			if (setVal(g_headerObj.lifeRecoverys[g_stateObj.scoreId], "", "number") !== "") {
				g_stateObj.lifeRcv = g_headerObj.lifeRecoverys[g_stateObj.scoreId] * 2;
			}
			if (setVal(g_headerObj.lifeDamages[g_stateObj.scoreId], "", "number") !== "") {
				g_stateObj.lifeDmg = g_headerObj.lifeDamages[g_stateObj.scoreId];
			}
		}

		// ゲージ設定別に個別設定した場合はここで設定を上書き
		const tmpScoreId = g_stateObj.scoreId;

		if (g_gaugeOptionObj["gauge" + g_stateObj.lifeSetName + "s"] != undefined) {
			const tmpGaugeObj = g_gaugeOptionObj["gauge" + g_stateObj.lifeSetName + "s"];

			if (setVal(tmpGaugeObj.lifeBorders[tmpScoreId], "string") != "") {
				if (tmpGaugeObj.lifeBorders[tmpScoreId] === "x") {
					g_stateObj.lifeBorder = 0;
				} else {
					g_stateObj.lifeBorder = tmpGaugeObj.lifeBorders[tmpScoreId];
				}
			}
			if (setVal(tmpGaugeObj.lifeRecoverys[tmpScoreId], "float") != "") {
				g_stateObj.lifeRcv = tmpGaugeObj.lifeRecoverys[tmpScoreId];
			}
			if (setVal(tmpGaugeObj.lifeDamages[tmpScoreId], "float") != "") {
				g_stateObj.lifeDmg = tmpGaugeObj.lifeDamages[tmpScoreId];
			}
			if (setVal(tmpGaugeObj.lifeInits[tmpScoreId], "float") != "") {
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
				return "[Start:" + initVal + ", Border:" + borderVal + ", <br>Rcv:" + _rcv + ", Dmg:" + _dmg + "]";
			}
		}
		return "[Start:" + initVal + ", Rcv:" + _rcv + ", Dmg:" + _dmg + "]";
	}


	// タイミング調整 (Adjustment)
	const lblAdjustment = createDivLabel("lblAdjustment", 0, C_LEN_SETLBL_HEIGHT * 8,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#99ffff'>A</span>djustment");
	optionsprite.appendChild(lblAdjustment);

	const lnkAdjustment = makeSettingLblButton("lnkAdjustment", g_stateObj.adjustment, 8, function () {
		g_stateObj.adjustment = (g_stateObj.adjustment === C_MAX_ADJUSTMENT ? -C_MAX_ADJUSTMENT : ++g_stateObj.adjustment);
		lnkAdjustment.innerHTML = g_stateObj.adjustment;
	});
	lnkAdjustment.oncontextmenu = function () {
		g_stateObj.adjustment = (g_stateObj.adjustment === -C_MAX_ADJUSTMENT ? C_MAX_ADJUSTMENT : --g_stateObj.adjustment);
		lnkAdjustment.innerHTML = g_stateObj.adjustment;
		return false;
	}
	optionsprite.appendChild(lnkAdjustment);

	optionsprite.appendChild(makeMiniButton("lnkAdjustment", "R", 8, function () {
		g_stateObj.adjustment = (g_stateObj.adjustment >= C_MAX_ADJUSTMENT - 5 ? (g_stateObj.adjustment === C_MAX_ADJUSTMENT ? -C_MAX_ADJUSTMENT : C_MAX_ADJUSTMENT) : g_stateObj.adjustment + 5);
		lnkAdjustment.innerHTML = g_stateObj.adjustment;
	}));
	optionsprite.appendChild(makeMiniButton("lnkAdjustment", "L", 8, function () {
		g_stateObj.adjustment = (g_stateObj.adjustment <= -(C_MAX_ADJUSTMENT - 5) ? (g_stateObj.adjustment === -C_MAX_ADJUSTMENT ? C_MAX_ADJUSTMENT : -C_MAX_ADJUSTMENT) : g_stateObj.adjustment - 5);
		lnkAdjustment.innerHTML = g_stateObj.adjustment;
	}));
	optionsprite.appendChild(makeMiniButton("lnkAdjustment", "RR", 8, function () {
		g_stateObj.adjustment = (g_stateObj.adjustment === C_MAX_ADJUSTMENT ? -C_MAX_ADJUSTMENT : ++g_stateObj.adjustment);
		lnkAdjustment.innerHTML = g_stateObj.adjustment;
	}));
	optionsprite.appendChild(makeMiniButton("lnkAdjustment", "LL", 8, function () {
		g_stateObj.adjustment = (g_stateObj.adjustment === -C_MAX_ADJUSTMENT ? C_MAX_ADJUSTMENT : --g_stateObj.adjustment);
		lnkAdjustment.innerHTML = g_stateObj.adjustment;
	}));


	// フェードイン (Fadein)
	const lblFadein = createDivLabel("lblFadein", 0, C_LEN_SETLBL_HEIGHT * 9,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#99eeff'>F</span>adein");
	optionsprite.appendChild(lblFadein);

	const lnkFadein = createDivLabel("lblFadein", C_LEN_SETLBL_LEFT, C_LEN_SETLBL_HEIGHT * 9,
		C_LEN_SETLBL_WIDTH, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TEXT, g_stateObj.fadein + "%");
	optionsprite.appendChild(lnkFadein);

	optionsprite.appendChild(makeMiniButton("lnkFadein", "R", 9, function () {
		g_stateObj.fadein = (g_stateObj.fadein === 99 ? 0 : g_stateObj.fadein + 1);
		fadeinSlider.value = g_stateObj.fadein;
		lnkFadein.innerHTML = g_stateObj.fadein + "%";
	}));
	optionsprite.appendChild(makeMiniButton("lnkFadein", "L", 9, function () {
		g_stateObj.fadein = (g_stateObj.fadein === 0 ? 99 : g_stateObj.fadein - 1);
		fadeinSlider.value = g_stateObj.fadein;
		lnkFadein.innerHTML = g_stateObj.fadein + "%";
	}));

	let addXPos = 0;
	let addYPos = 0;
	if (g_userAgent.indexOf('firefox') !== -1) {
		addXPos = -8;
		addYPos = 1;
	}
	const lblFadeinSlider = createDivLabel("lblFadeinBar", 160 + addXPos, 225 + addYPos, "", "", "", "",
		"<input id='fadeinSlider' type='range' value='0' min='0' max='99' step='1'>");
	optionsprite.appendChild(lblFadeinSlider);

	const fadeinSlider = document.getElementById("fadeinSlider");
	fadeinSlider.value = g_stateObj.fadein;

	fadeinSlider.addEventListener("input", function () {
		g_stateObj.fadein = parseInt(this.value);
		lnkFadein.innerHTML = g_stateObj.fadein + "%";
	}, false);

	fadeinSlider.addEventListener("change", function () {
		g_stateObj.fadein = parseInt(this.value);
		lnkFadein.innerHTML = g_stateObj.fadein + "%";
	}, false);


	// ボリューム
	const lblVolume = createDivLabel("lblVolume", 0, C_LEN_SETLBL_HEIGHT * 10,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#99ddff'>V</span>olume");
	optionsprite.appendChild(lblVolume);

	const lnkVolume = makeSettingLblButton("lnkVolume", g_stateObj.volume + "%", 10, function () {
		g_volumeNum = (g_volumeNum === 0 ? g_volumes.length - 1 : --g_volumeNum);
		g_stateObj.volume = g_volumes[g_volumeNum];
		lnkVolume.innerHTML = g_stateObj.volume + "%";
	});
	lnkVolume.oncontextmenu = function () {
		g_volumeNum = (g_volumeNum === g_volumes.length - 1 ? 0 : ++g_volumeNum);
		g_stateObj.volume = g_volumes[g_volumeNum];
		lnkVolume.innerHTML = g_stateObj.volume + "%";
		return false;
	}
	optionsprite.appendChild(lnkVolume);

	optionsprite.appendChild(makeMiniButton("lnkVolume", "R", 10, function () {
		g_volumeNum = (g_volumeNum === 0 ? g_volumes.length - 1 : --g_volumeNum);
		g_stateObj.volume = g_volumes[g_volumeNum];
		lnkVolume.innerHTML = g_stateObj.volume + "%";
	}));
	optionsprite.appendChild(makeMiniButton("lnkVolume", "L", 10, function () {
		g_volumeNum = (g_volumeNum === g_volumes.length - 1 ? 0 : ++g_volumeNum);
		g_stateObj.volume = g_volumes[g_volumeNum];
		lnkVolume.innerHTML = g_stateObj.volume + "%";
	}));

	optionsprite.oncontextmenu = function () {
		return false;
	}
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
		name: eval("C_LBL_SETMINI" + _directionFlg),
		x: eval("C_LEN_SETMINI" + _directionFlg + "_LEFT"),
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
	const divRoot = document.getElementById("divRoot");

	// タイトル文字描画
	const lblTitle = getTitleDivLabel("lblTitle",
		"<span style='color:#ffff66;font-size:40px;'>D</span>ISPLAY", 0, 15);
	divRoot.appendChild(lblTitle);

	// オプションボタン用の設置
	createSettingsDisplayWindow("divRoot");

	// ユーザカスタムイベント(初期)
	if (typeof customSettingsDisplayInit === "function") {
		customSettingsDisplayInit();
		if (typeof customSettingsDisplayInit2 === "function") {
			customSettingsDisplayInit2();
		}
	}

	// 戻るボタン描画
	const btnBack = createButton({
		id: "btnBack",
		name: "Back",
		x: 0,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_BACK,
		align: C_ALIGN_CENTER
	}, function () {
		// タイトル画面へ戻る
		clearWindow();
		titleInit();
	});
	divRoot.appendChild(btnBack);

	// キーコンフィグボタン描画
	const btnKeyConfig = createButton({
		id: "btnKeyConfig",
		name: "KeyConfig",
		x: g_sWidth / 3,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_SETTING,
		align: C_ALIGN_CENTER
	}, function () {
		// キーコンフィグ画面へ遷移
		g_kcType = "Main";
		clearWindow();
		keyConfigInit();
	});
	divRoot.appendChild(btnKeyConfig);

	// 進むボタン描画
	const btnPlay = createButton({
		id: "btnPlay",
		name: "Play",
		x: g_sWidth / 3 * 2,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_NEXT,
		align: C_ALIGN_CENTER
	}, function () {
		clearWindow();
		g_audio.load();

		if (g_audio.readyState === 4) {
			// audioの読み込みが終わった後の処理
			loadingScoreInit();
		} else {
			// 読込中の状態
			g_audio.addEventListener('canplaythrough', (function () {
				return function f() {
					g_audio.removeEventListener('canplaythrough', f, false);
					loadingScoreInit();
				}
			})(), false);
		}
	});
	divRoot.appendChild(btnPlay);

	// SETTINGボタン描画
	const btnSettings = createButton({
		id: "btnSettings",
		name: "<",
		x: g_sWidth / 2 - 175 - C_LEN_SETMINI_WIDTH / 2,
		y: 25,
		width: C_LEN_SETMINI_WIDTH,
		height: 40,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_SETTING,
		align: C_ALIGN_CENTER
	}, function () {
		// タイトル画面へ戻る
		clearWindow();
		optionInit();
	});
	divRoot.appendChild(btnSettings);


	// キー操作イベント（デフォルト）
	document.onkeydown = function (evt) {
		// ブラウザ判定
		let setKey;
		if (g_userAgent.indexOf("firefox") !== -1) {
			setKey = evt.which;
		} else {
			setKey = event.keyCode;
		}
		if (setKey === 13) {
			clearWindow();
			g_audio.load();

			if (g_audio.readyState === 4) {
				// audioの読み込みが終わった後の処理
				loadingScoreInit();
			} else {
				// 読込中の状態
				g_audio.addEventListener('canplaythrough', (function () {
					return function f() {
						g_audio.removeEventListener('canplaythrough', f, false);
						loadingScoreInit();
					}
				})(), false);
			}
		}
		for (var j = 0; j < C_BLOCK_KEYS.length; j++) {
			if (setKey === C_BLOCK_KEYS[j]) {
				return false;
			}
		}
	}
	document.onkeyup = function (evt) {
	}
}

/**
 * 設定・オプション画面のラベル・ボタン処理の描画
 * @param {Object} _sprite 基準とするスプライト(ここで指定する座標は、そのスプライトからの相対位置)
 */
function createSettingsDisplayWindow(_sprite) {

	// 各ボタン用のスプライトを作成
	const optionsprite = createSprite(_sprite, "optionsprite", (g_sWidth - 400) / 2, 100, 400, 300);

	makeDisplayButton("stepZone", 0);
	makeDisplayButton("judgement", 1);
	makeDisplayButton("lifeGauge", 2);
	makeDisplayButton("musicInfo", 3);
	makeDisplayButton("speed", 5);
	makeDisplayButton("color", 6);
	makeDisplayButton("lyrics", 7);
	makeDisplayButton("background", 8);

	function makeDisplayButton(_name, _heightPos) {
		//const charStart = _name.slice(0, 1);
		const lbl = createDivLabel("lbl" + _name, -10, C_LEN_SETLBL_HEIGHT * _heightPos,
			120, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
			"<span style='color:#999999'>" + _name.slice(0, 1).toUpperCase() + "</span>" + _name.slice(1));
		optionsprite.appendChild(lbl);

		const lnk = makeSettingLblButton("lnk" + _name, g_stateObj["d_" + _name.toLowerCase()], _heightPos, function () {
			g_stateObj["d_" + _name.toLowerCase()] = (g_stateObj["d_" + _name.toLowerCase()] === C_FLG_OFF ? C_FLG_ON : C_FLG_OFF);
			lnk.innerHTML = g_stateObj["d_" + _name.toLowerCase()];
		});
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

	const divRoot = document.getElementById("divRoot");

	// タイトル文字描画
	const lblTitle = getTitleDivLabel("lblTitle",
		"<span style='color:#6666ff;font-size:40px;'>K</span>EY<span style='color:#ff6666;font-size:40px;'>C</span>ONFIG", 0, 15);
	divRoot.appendChild(lblTitle);

	const kcDesc = createDivLabel("kcDesc", 0, 65, g_sWidth, 20, 14, C_CLR_TITLE,
		"[BackSpaceキー:スキップ / Deleteキー:(代替キーのみ)キー無効化]");
	kcDesc.style.align = C_ALIGN_CENTER;
	divRoot.appendChild(kcDesc);


	// キーの一覧を表示
	const keyconSprite = createSprite("divRoot", "keyconSprite", (g_sWidth - 400) / 2, 100, 400, 300);
	const kWidth = parseInt(keyconSprite.style.width);

	const keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	const keyNum = g_keyObj["chara" + keyCtrlPtn].length;
	const posMax = g_keyObj["pos" + keyCtrlPtn][keyNum - 1] + 1;
	const divideCnt = g_keyObj["div" + keyCtrlPtn];
	if (g_keyObj["blank" + keyCtrlPtn] !== undefined) {
		g_keyObj.blank = g_keyObj["blank" + keyCtrlPtn];
	} else {
		g_keyObj.blank = g_keyObj.blank_def;
	}

	/** 同行の左から数えた場合の位置(x座標) */
	let leftCnt = 0;
	/** 同行の中心から見た場合の位置(x座標) */
	let stdPos = 0;
	/** 行位置 */
	let dividePos = 0;
	let posj = 0;

	for (var j = 0; j < keyNum; j++) {

		posj = g_keyObj["pos" + keyCtrlPtn][j];
		leftCnt = (posj >= divideCnt ? posj - divideCnt : posj);
		stdPos = (posj >= divideCnt ? leftCnt - (posMax - divideCnt) / 2 : leftCnt - divideCnt / 2);
		dividePos = (posj >= divideCnt ? 1 : 0);

		// キーコンフィグ表示用の矢印・おにぎりを表示
		keyconSprite.appendChild(createArrowEffect("arrow" + j, g_headerObj.setColor[g_keyObj["color" + keyCtrlPtn][j]],
			g_keyObj.blank * stdPos + kWidth / 2,
			150 * dividePos, 50,
			g_keyObj["stepRtn" + keyCtrlPtn][j]));

		for (var k = 0; k < g_keyObj["keyCtrl" + keyCtrlPtn][j].length; k++) {
			keyconSprite.appendChild(createDivLabel("keycon" + j + "_" + k,
				g_keyObj.blank * stdPos + kWidth / 2,
				50 + 20 * k + 150 * dividePos,
				50, 20, 16, "#cccccc", g_kCd[g_keyObj["keyCtrl" + keyCtrlPtn][j][k]]));
		}
	}
	posj = g_keyObj["pos" + keyCtrlPtn][0];

	// カーソルの作成
	const cursor = keyconSprite.appendChild(createImg("cursor", C_IMG_CURSOR,
		kWidth / 2 + g_keyObj.blank * (posj - divideCnt / 2) - 10, 45, 15, 30));
	cursor.style.transitionDuration = "0.125s";

	// キーコンフィグタイプ切替ボタン
	const lblKcType = createDivLabel("lblKcType", 30, 10,
		70, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#99ddff'>C</span>onfigType");
	divRoot.appendChild(lblKcType);

	const lnkKcType = makeSettingLblButton("lnkKcType", g_kcType, 0, function () {
		switch (g_kcType) {
			case "Main":
				g_kcType = "Replaced";
				resetCursorReplaced(kWidth, divideCnt, keyCtrlPtn);
				break;

			case "Replaced":
				g_kcType = "ALL";
				resetCursorALL(kWidth, divideCnt, keyCtrlPtn);
				break;

			case "ALL":
				g_kcType = "Main";
				resetCursorMain(kWidth, divideCnt, keyCtrlPtn);
				break;
		}
		lnkKcType.innerHTML = g_kcType;
	});
	lnkKcType.style.width = "100px";
	lnkKcType.style.left = "30px";
	lnkKcType.style.top = "35px";
	divRoot.appendChild(lnkKcType);


	// ユーザカスタムイベント(初期)
	if (typeof customKeyConfigInit === "function") {
		customKeyConfigInit();
		if (typeof customKeyConfigInit2 === "function") {
			customKeyConfigInit2();
		}
	}

	// 戻るボタン描画
	const btnBack = createButton({
		id: "btnBack",
		name: "Back",
		x: 0,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_BACK,
		align: C_ALIGN_CENTER
	}, function () {
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
		id: "btnPtnChange",
		name: "PtnChange",
		x: g_sWidth / 3,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_SETTING,
		align: C_ALIGN_CENTER
	}, function () {
		const tempPtn = g_keyObj.currentPtn + 1;
		if (g_keyObj["keyCtrl" + g_keyObj.currentKey + "_" + tempPtn] !== undefined) {
			g_keyObj.currentPtn = tempPtn;
		} else {
			g_keyObj.currentPtn = 0;
		}
		clearWindow();
		keyConfigInit();
		const keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
		eval("resetCursor" + g_kcType)(kWidth, g_keyObj["div" + keyCtrlPtn], keyCtrlPtn);
	});
	divRoot.appendChild(btnPtnChange);

	// キーコンフィグリセットボタン描画
	const btnReset = createButton({
		id: "btnReset",
		name: "Reset",
		x: g_sWidth / 3 * 2,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_RESET,
		align: C_ALIGN_CENTER
	}, function () {
		if (window.confirm('キーを初期配置に戻します。よろしいですか？')) {
			g_keyObj.currentKey = g_headerObj["keyLabels"][g_stateObj.scoreId];
			const keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
			const keyNum = g_keyObj["chara" + keyCtrlPtn].length;
			const divideCnt = g_keyObj["div" + keyCtrlPtn];

			for (var j = 0; j < keyNum; j++) {
				for (var k = 0; k < g_keyObj["keyCtrl" + keyCtrlPtn][j].length; k++) {
					g_keyObj["keyCtrl" + keyCtrlPtn][j][k] = g_keyObj["keyCtrl" + keyCtrlPtn + "d"][j][k];
					document.getElementById("keycon" + j + "_" + k).innerHTML = g_kCd[g_keyObj["keyCtrl" + keyCtrlPtn][j][k]];
				}
			}
			eval("resetCursor" + g_kcType)(kWidth, divideCnt, keyCtrlPtn);
		}
	});
	divRoot.appendChild(btnReset);


	// キーボード押下時処理
	document.onkeydown = function (evt) {
		const keyCdObj = document.getElementById("keycon" + g_currentj + "_" + g_currentk);
		const cursor = document.getElementById("cursor");

		// ブラウザ判定
		let setKey;
		if (g_userAgent.indexOf("firefox") !== -1) {
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
				keyCdObj.innerHTML = g_kCd[setKey];
				g_keyObj["keyCtrl" + keyCtrlPtn][g_currentj][g_currentk] = setKey;
				g_prevKey = setKey;
			}

			// 後続に代替キーが存在する場合
			if (g_currentk < g_keyObj["keyCtrl" + keyCtrlPtn][g_currentj].length - 1 &&
				g_kcType !== "Main") {
				g_currentk++;
				cursor.style.top = (parseInt(cursor.style.top) + 20) + "px";

			} else if (g_currentj < g_keyObj["keyCtrl" + keyCtrlPtn].length - 1) {
				// 他の代替キーが存在せず、次の矢印がある場合
				g_currentj++;
				g_currentk = 0;

				// 代替キーのみの場合は次の代替キーがあるキーを探す
				if (g_kcType === "Replaced") {
					for (var j = g_currentj, len = g_keyObj["keyCtrl" + keyCtrlPtn].length; j < len; j++) {
						if (g_keyObj["keyCtrl" + keyCtrlPtn][j][1] !== undefined) {
							g_currentj = j;
							g_currentk = 1;
							break;
						}
					}
					if (g_currentk === 0) {
						for (var j = 0, len = g_currentj; j < len; j++) {
							if (g_keyObj["keyCtrl" + keyCtrlPtn][j][1] !== undefined) {
								g_currentj = j;
								g_currentk = 1;
								break;
							}
						}
					}
				}
				const posj = g_keyObj["pos" + keyCtrlPtn][g_currentj];

				leftCnt = (posj >= divideCnt ? posj - divideCnt : posj);
				stdPos = (posj >= divideCnt ? leftCnt - (posMax - divideCnt) / 2 : leftCnt - divideCnt / 2);
				dividePos = (posj >= divideCnt ? 1 : 0);

				cursor.style.left = (kWidth / 2 + g_keyObj.blank * stdPos - 10) + "px";
				cursor.style.top = (50 + 150 * dividePos) + "px";
				if (g_kcType === "Replaced") {
					cursor.style.top = (parseFloat(cursor.style.top) + 20) + "px";
				}

			} else {
				// 全ての矢印・代替キーの巡回が終わった場合は元の位置に戻す
				eval("resetCursor" + g_kcType)(kWidth, divideCnt, keyCtrlPtn);
			}
		}
		for (var j = 0; j < C_BLOCK_KEYS.length; j++) {
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
	const posj = g_keyObj["pos" + _keyCtrlPtn][0];

	const cursor = document.getElementById("cursor");
	cursor.style.left = (_width / 2 + g_keyObj.blank * (posj - _divideCnt / 2) - 10) + "px";
	cursor.style.top = "45px";
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
	const keyNum = g_keyObj["chara" + _keyCtrlPtn].length;

	for (var j = 0; j < keyNum; j++) {
		if (g_keyObj["keyCtrl" + _keyCtrlPtn][j][1] !== undefined) {
			g_currentj = j;
			g_currentk = 1;
			break;
		}
	}
	const posj = g_keyObj["pos" + _keyCtrlPtn][g_currentj];

	const cursor = document.getElementById("cursor");
	cursor.style.left = (_width / 2 + g_keyObj.blank * (posj - _divideCnt / 2) - 10) + "px";
	if (g_currentk === 1) {
		cursor.style.top = "65px";
	} else {
		g_kcType = "ALL";
		cursor.style.top = "45px";
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
	const posj = g_keyObj["pos" + _keyCtrlPtn][0];

	const cursor = document.getElementById("cursor");
	cursor.style.left = (_width / 2 + g_keyObj.blank * (posj - _divideCnt / 2) - 10) + "px";
	cursor.style.top = "45px";
}

/*-----------------------------------------------------------*/
/* Scene : LOADING [strawberry] */
/*-----------------------------------------------------------*/

/**
 * 読込画面初期化
 */
function loadingScoreInit() {

	const keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	const keyNum = g_keyObj["chara" + keyCtrlPtn].length;
	g_headerObj.blankFrame = g_headerObj.blankFrameDef;

	// 楽曲データのバックグラウンド再生 (Firefoxのみ)
	startPreloadingAudio();

	// 譜面データの読み込み
	let scoreIdHeader = "";
	if (g_stateObj.scoreId > 0) {
		scoreIdHeader = Number(g_stateObj.scoreId) + 1;
	}
	g_scoreObj = scoreConvert(g_rootObj, scoreIdHeader, 0);

	// ライフ回復・ダメージ量の計算
	calcLifeVals(g_allArrow + g_allFrz / 2);

	// 最終フレーム数の取得
	let lastFrame = getLastFrame(g_scoreObj) + g_headerObj.blankFrame;

	// 最初の矢印データがあるフレーム数を取得
	let firstArrowFrame = getFirstArrowFrame(g_scoreObj);

	// 開始フレーム数の取得(フェードイン加味)
	g_scoreObj.frameNum = getStartFrame(lastFrame);

	// フレームごとの速度を取得（配列形式）
	let speedOnFrame = setSpeedOnFrame(g_scoreObj.speedData, lastFrame);

	// Motionオプション適用時の矢印別の速度を取得（配列形式）
	const motionOnFrame = setMotionOnFrame();
	g_workObj.motionOnFrames = motionOnFrame.concat();

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
			for (var j = 0; j < keyNum; j++) {
				if (tmpObj.arrowData[j] !== undefined) {
					g_scoreObj.arrowData[j] = tmpObj.arrowData[j].concat();
				}
				if (tmpObj.frzData[j] !== undefined) {
					g_scoreObj.frzData[j] = tmpObj.frzData[j].concat();
				}
			}
			if (tmpObj.speedData !== undefined && tmpObj.speedData.length >= 2) {
				g_scoreObj.speedData = tmpObj.speedData.concat();
			}
			if (tmpObj.boostData !== undefined && tmpObj.boostData.length >= 2) {
				g_scoreObj.boostData = tmpObj.boostData.concat();
			}
			if (tmpObj.colorData !== undefined && tmpObj.colorData.length >= 3) {
				g_scoreObj.colorData = tmpObj.colorData.concat();
			}
			if (tmpObj.acolorData !== undefined && tmpObj.acolorData.length >= 3) {
				g_scoreObj.acolorData = tmpObj.acolorData.concat();
			}
			if (tmpObj.wordData !== undefined && tmpObj.wordData.length >= 3) {
				g_scoreObj.wordData = tmpObj.wordData.concat();
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

	// 矢印・フリーズアロー・速度/色変化格納処理
	pushArrows(g_scoreObj, speedOnFrame, motionOnFrame, arrivalFrame);

	// メインに入る前の最終初期化処理
	getArrowSettings();

	// ユーザカスタムイベント
	if (typeof customLoadingInit === "function") {
		customLoadingInit();
		if (typeof customLoadingInit2 === "function") {
			customLoadingInit2();
		}
	}

	clearWindow();
	MainInit();
}

/**
 * 楽曲データのバックグラウンド再生 (Firefoxのみ)
 * - Firefoxのみ楽曲の読み込みが遅れることがあるため、先にミュートで再生させておく。
 * - @see {@link prepareAudio} とセット。
 */
function startPreloadingAudio() {
	if (g_userAgent.indexOf("msie") !== -1 ||
		g_userAgent.indexOf("trident") !== -1 ||
		g_userAgent.indexOf('edge') !== -1 ||
		g_userAgent.indexOf("chrome") !== -1 ||
		g_userAgent.indexOf("safari") !== -1) {
	} else if (g_userAgent.indexOf("firefox") !== -1) {
		g_audio.play();
		g_audio.muted = true;
	} else if (g_userAgent.indexOf("opera") !== -1) {
	}
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

	const keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	const keyNum = g_keyObj["chara" + keyCtrlPtn].length;
	obj.arrowData = new Array();
	obj.frzData = new Array();
	let frzName;
	let tmpData;
	let tmpArrayData = new Array();

	for (var j = 0, k = 0; j < keyNum; j++) {

		// 矢印データの分解
		if (_dosObj[g_keyObj["chara" + keyCtrlPtn][j] + _scoreNo + "_data"] !== undefined) {
			tmpData = _dosObj[g_keyObj["chara" + keyCtrlPtn][j] + _scoreNo + "_data"].split("\r").join("");
			tmpData = tmpData.split("\n").join("");

			if (tmpData !== undefined) {
				obj.arrowData[j] = new Array();
				obj.arrowData[j] = tmpData.split(",");
				if (isNaN(parseFloat(obj.arrowData[j][0]))) {
				} else {
					g_allArrow += obj.arrowData[j].length;
					for (var k = 0; k < obj.arrowData[j].length; k++) {
						obj.arrowData[j][k] = parseInt(obj.arrowData[j][k]) + parseInt(g_stateObj.adjustment) + _preblankFrame;
					}
				}
			}
		}

		// 矢印名からフリーズアロー名への変換
		frzName = g_keyObj["chara" + keyCtrlPtn][j].replace("leftdia", "frzLdia");
		frzName = frzName.replace("rightdia", "frzRdia");
		frzName = frzName.replace("left", "frzLeft");
		frzName = frzName.replace("down", "frzDown");
		frzName = frzName.replace("up", "frzUp");
		frzName = frzName.replace("right", "frzRight");
		frzName = frzName.replace("space", "frzSpace");
		frzName = frzName.replace("iyo", "frzIyo");
		frzName = frzName.replace("gor", "frzGor");
		frzName = frzName.replace("oni", "foni");
		frzName = frzName.replace("arrow", "frzArrow");

		// フリーズアローデータの分解 (2つで1セット)
		if (_dosObj[frzName + _scoreNo + "_data"] !== undefined) {
			tmpData = _dosObj[frzName + _scoreNo + "_data"].split("\r").join("");
			tmpData = tmpData.split("\n").join("");

			if (tmpData !== undefined) {
				obj.frzData[j] = new Array();
				obj.frzData[j] = tmpData.split(",");
				if (isNaN(parseFloat(obj.frzData[j][0]))) {
				} else {
					g_allFrz += obj.frzData[j].length;
					for (var k = 0; k < obj.frzData[j].length; k++) {
						obj.frzData[j][k] = parseFloat(obj.frzData[j][k]) + parseFloat(g_stateObj.adjustment) + _preblankFrame;
					}
				}
			}
		}
	}

	// 速度変化・色変化データの分解 (2つで1セット)
	obj.speedData = [];
	obj.speedData.length = 0;
	const speedFooter = (g_keyObj.currentKey === "5" ? "_data" : "_change");
	if (_dosObj["speed" + _scoreNo + speedFooter] !== undefined && g_stateObj.d_speed === C_FLG_ON) {
		obj.speedData = _dosObj["speed" + _scoreNo + speedFooter].split(",");
		for (var k = 0; k < obj.speedData.length; k += 2) {
			obj.speedData[k] = parseFloat(obj.speedData[k]) + parseFloat(g_stateObj.adjustment) + _preblankFrame;
			obj.speedData[k + 1] = parseFloat(obj.speedData[k + 1]);
		}
	}
	obj.boostData = [];
	obj.boostData.length = 0;
	if (_dosObj["boost" + _scoreNo + "_data"] !== undefined && g_stateObj.d_speed === C_FLG_ON) {
		obj.boostData = _dosObj["boost" + _scoreNo + "_data"].split(",");
		for (var k = 0; k < obj.boostData.length; k += 2) {
			obj.boostData[k] = parseFloat(obj.boostData[k]) + parseFloat(g_stateObj.adjustment) + _preblankFrame;
			obj.boostData[k + 1] = parseFloat(obj.boostData[k + 1]);
		}
	}

	obj.colorData = [];
	obj.colorData.length = 0;
	if (_dosObj["color" + _scoreNo + "_data"] !== undefined && _dosObj["color" + _scoreNo + "_data"] !== "" && g_stateObj.d_color === C_FLG_ON) {
		obj.colorData = _dosObj["color" + _scoreNo + "_data"].split(",");
		for (var k = 0; k < obj.colorData.length; k += 3) {
			obj.colorData[k] = parseFloat(obj.colorData[k]) + parseFloat(g_stateObj.adjustment) + _preblankFrame;
			obj.colorData[k + 1] = parseFloat(obj.colorData[k + 1]);
		}
	}
	obj.acolorData = [];
	obj.acolorData.length = 0;
	if (_dosObj["acolor" + _scoreNo + "_data"] !== undefined && _dosObj["acolor" + _scoreNo + "data"] !== "" && g_stateObj.d_color === C_FLG_ON) {
		obj.acolorData = _dosObj["acolor" + _scoreNo + "_data"].split(",");
		for (var k = 0; k < obj.acolorData.length; k += 3) {
			obj.acolorData[k] = parseFloat(obj.acolorData[k]) + parseFloat(g_stateObj.adjustment) + _preblankFrame;
			obj.acolorData[k + 1] = parseFloat(obj.acolorData[k + 1]);
		}
	}

	// 歌詞データの分解 (3つで1セット)
	obj.wordData = [];
	obj.wordData.length = 0;
	if (_dosObj["word" + _scoreNo + "_data"] !== undefined && g_stateObj.d_lyrics === C_FLG_ON) {

		tmpData = _dosObj["word" + _scoreNo + "_data"].split("\r").join("");
		tmpData = tmpData.split("\n").join("");

		if (tmpData !== undefined && tmpData !== "") {
			const tmpWordData = tmpData.split(",");
			for (var k = 0; k < tmpWordData.length; k += 3) {
				tmpWordData[k] = parseFloat(tmpWordData[k]) + parseFloat(g_stateObj.adjustment) + _preblankFrame;
				tmpWordData[k + 1] = parseFloat(tmpWordData[k + 1]);

				let addFrame = 0;
				if (obj.wordData[tmpWordData[k]] === undefined) {
					obj.wordData[tmpWordData[k]] = new Array();
				} else {
					for (var m = 1; ; m++) {
						if (obj.wordData[tmpWordData[k] + m] === undefined) {
							obj.wordData[tmpWordData[k] + m] = new Array();
							addFrame = m;
							break;
						}
					}
				}
				obj.wordData[tmpWordData[k] + addFrame].push(tmpWordData[k + 1], tmpWordData[k + 2]);
			}
		}

	}

	// 背景データの分解 (下記すべてで1セット、改行区切り)
	// [フレーム数,階層,背景パス,class(CSSで別定義),X,Y,width,height,opacity,animationName,animationDuration]
	obj.backData = [];
	obj.backData.length = 0;
	obj.backMaxDepth = -1;
	if (_dosObj["back" + _scoreNo + "_data"] !== undefined && g_stateObj.d_background === C_FLG_ON) {

		tmpArrayData = _dosObj["back" + _scoreNo + "_data"].split("\r").join("\n");
		tmpArrayData = tmpArrayData.split("\n");

		for (var j = 0, len = tmpArrayData.length; j < len; j++) {
			tmpData = tmpArrayData[j];

			if (tmpData !== undefined && tmpData !== "") {
				const tmpBackData = tmpData.split(",");

				// 値チェックとエスケープ処理
				const tmpFrame = setVal(tmpBackData[0], 200, "number") + parseFloat(g_stateObj.adjustment) + _preblankFrame;
				const tmpDepth = setVal(tmpBackData[1], 0, "number");
				const tmpPath = escapeHtml(setVal(tmpBackData[2], "", "string"));
				const tmpClass = escapeHtml(setVal(tmpBackData[3], "", "string"));
				const tmpX = setVal(tmpBackData[4], 0, "float");
				const tmpY = setVal(tmpBackData[5], 0, "float");
				const tmpWidth = setVal(tmpBackData[6], 0, "number");					// spanタグの場合は font-size
				const tmpHeight = escapeHtml(setVal(tmpBackData[7], "", "string"));	// spanタグの場合は color(文字列可)
				const tmpOpacity = setVal(tmpBackData[8], 1, "float");
				const tmpAnimationName = escapeHtml(setVal(tmpBackData[9], C_DIS_NONE, "string"));
				const tmpAnimationDuration = setVal(tmpBackData[10], 0, "number") / 60;

				if (tmpDepth > obj.backMaxDepth) {
					obj.backMaxDepth = tmpDepth;
				}

				let addFrame = 0;
				if (obj.backData[tmpFrame] === undefined) {
					obj.backData[tmpFrame] = {};
				} else {
					for (var m = 1; ; m++) {
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
	let newstr = _str.split("<").join("&lt;");
	newstr = newstr.split(">").join("&gt;");
	newstr = newstr.split('"').join("&quot;");
	newstr = newstr.split('&').join("&amp;");

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
	const keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	const keyNum = g_keyObj["chara" + keyCtrlPtn].length;

	for (var j = 0; j < keyNum; j++) {
		if (_dataObj.arrowData[j] !== undefined && _dataObj.arrowData[j] !== "") {
			if (_dataObj.arrowData[j][_dataObj.arrowData[j].length - 1] > tmpLastNum) {
				tmpLastNum = _dataObj.arrowData[j][_dataObj.arrowData[j].length - 1];
			}
		}
		if (_dataObj.frzData[j] !== undefined && _dataObj.frzData[j] !== "") {
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
	const keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	const keyNum = g_keyObj["chara" + keyCtrlPtn].length;

	for (var j = 0; j < keyNum; j++) {
		if (_dataObj.arrowData[j] !== undefined && _dataObj.arrowData[j] !== "") {
			if (_dataObj.arrowData[j][0] < tmpFirstNum && _dataObj.arrowData[j][0] > 0) {
				tmpFirstNum = _dataObj.arrowData[j][0];
			}
		}
		if (_dataObj.frzData[j] !== undefined && _dataObj.frzData[j] !== "") {
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
	frameNum = g_headerObj.startFrame;
	if (_lastFrame >= g_headerObj.startFrame) {
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

	const speedOnFrame = new Array();
	let currentSpeed = g_stateObj.speed * 2;

	for (var frm = 0, s = 0; frm <= _lastFrame; frm++) {
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

	const motionOnFrame = new Array();

	// 矢印が表示される最大フレーム数
	const motionLastFrame = g_sHeight * 20;
	const brakeLastFrame = g_sHeight / 2;

	for (var j = 0; j <= motionLastFrame; j++) {
		motionOnFrame[j] = 0;
	}

	if (g_stateObj.motion === C_FLG_OFF) {
	} else if (g_stateObj.motion === "Boost") {
		// ステップゾーンに近づくにつれて加速量を大きくする (16 → 85)
		for (var j = C_MOTION_STD_POS + 1; j < C_MOTION_STD_POS + 70; j++) {
			motionOnFrame[j] = (C_MOTION_STD_POS + 70 - j) * g_stateObj.speed * 2 / 50;
		}
	} else if (g_stateObj.motion === "Brake") {
		// 初期は+2x、ステップゾーンに近づくにつれて加速量を下げる (20 → 34)
		for (var j = C_MOTION_STD_POS + 5; j < C_MOTION_STD_POS + 19; j++) {
			motionOnFrame[j] = (j - 15) * 4 / 14;
		}
		for (var j = C_MOTION_STD_POS + 19; j <= brakeLastFrame; j++) {
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

	const startPoint = new Array();
	const frzStartPoint = new Array();

	// 矢印・フリーズアロー・速度/色変化用 フレーム別処理配列
	g_workObj.mkArrow = new Array();
	g_workObj.mkFrzArrow = new Array();
	g_workObj.mkFrzLength = new Array();
	g_workObj.mkColor = new Array();
	g_workObj.mkColorCd = new Array();
	g_workObj.mkFColor = new Array();
	g_workObj.mkFColorCd = new Array();
	g_workObj.mkAColor = new Array();
	g_workObj.mkAColorCd = new Array();
	g_workObj.mkFAColor = new Array();
	g_workObj.mkFAColorCd = new Array();

	/** 矢印の移動距離 */
	g_workObj.initY = new Array();
	/** 矢印がステップゾーンに到達するまでのフレーム数 */
	g_workObj.arrivalFrame = new Array();
	/** Motionの適用フレーム数 */
	g_workObj.motionFrame = new Array();

	let spdNext = Infinity;
	let spdPrev = 0;
	let spdk;
	let lastk;
	let tmpObj;
	let arrowArrivalFrm;
	let frmPrev;

	const keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	const keyNum = g_keyObj["chara" + keyCtrlPtn].length;

	for (let j = 0; j < keyNum; j++) {

		// 矢印の出現フレーム数計算
		if (_dataObj.arrowData[j] !== undefined) {

			startPoint[j] = new Array();
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
				g_workObj.mkArrow[startPoint[j][lastk]] = new Array();
			}
			g_workObj.mkArrow[startPoint[j][lastk]].push(j);

			for (var k = lastk - 1; k >= 0; k--) {
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
						g_workObj.mkArrow[startPoint[j][k]] = new Array();
					}
					g_workObj.mkArrow[startPoint[j][k]].push(j);
				}
			}
		}

		// フリーズアローの出現フレーム数計算
		if (_dataObj.frzData[j] !== undefined) {

			frzStartPoint[j] = new Array();
			g_workObj.mkFrzLength[j] = new Array();
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
				g_workObj.mkFrzArrow[frzStartPoint[j][lastk]] = new Array();
			}
			g_workObj.mkFrzArrow[frzStartPoint[j][lastk]].push(j);

			// フリーズアローは2つで1セット
			for (var k = lastk - 2; k >= 0; k -= 2) {
				arrowArrivalFrm = _dataObj.frzData[j][k];

				if (arrowArrivalFrm < _firstArrivalFrame) {

					// フリーズアローの出現位置が開始前の場合は除外
					if (g_workObj.mkFrzLength[j] !== undefined) {
						g_workObj.mkFrzLength[j] = g_workObj.mkFrzLength[j].slice(k + 2).concat();
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
						g_workObj.mkFrzArrow[frzStartPoint[j][k]] = new Array();
					}
					g_workObj.mkFrzArrow[frzStartPoint[j][k]].push(j);

				} else {
					if (g_workObj.mkFrzLength[j] !== undefined) {
						g_workObj.mkFrzLength[j] = g_workObj.mkFrzLength[j].slice(k + 2).concat();
					}
				}
			}
		}
	}

	// 個別加速のタイミング更新
	g_workObj.boostData = new Array();
	g_workObj.boostData.length = 0;
	if (_dataObj.boostData !== undefined && _dataObj.boostData.length >= 2) {

		let delBoostIdx = 0;
		for (var k = _dataObj.boostData.length - 2; k >= 0; k -= 2) {
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
		for (var k = 0; k < delBoostIdx; k++) {
			_dataObj.boostData.shift();
		}
		g_workObj.boostData = _dataObj.boostData.concat();
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
		pushColors("", tmpObj.frm, _dataObj.colorData[lastk + 1], _dataObj.colorData[lastk + 2].replace("0x", "#"));

		for (var k = lastk - 3; k >= 0; k -= 3) {

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
			pushColors("", _dataObj.colorData[k], _dataObj.colorData[k + 1], _dataObj.colorData[k + 2].replace("0x", "#"));
		}
	}

	// 全体色変化のタイミング更新
	if (_dataObj.acolorData !== undefined && _dataObj.acolorData.length >= 3) {

		for (var k = _dataObj.acolorData.length - 3; k >= 0; k -= 3) {
			pushColors("A", _dataObj.acolorData[k], _dataObj.acolorData[k + 1], _dataObj.acolorData[k + 2].replace("0x", "#"));
		}
	}

	// 実際に処理させる途中変速配列を作成
	g_workObj.speedData = new Array();
	g_workObj.speedData.length = 0;
	g_workObj.speedData.push(g_scoreObj.frameNum);
	g_workObj.speedData.push(_speedOnFrame[g_scoreObj.frameNum]);

	if (_dataObj.speedData !== undefined) {
		for (var k = 0; k < _dataObj.speedData.length; k += 2) {
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

	for (var frm = _startFrame; frm < _endFrame; frm++) {
		frzLength += _speedOnFrame[frm];
	}
	return frzLength;
}

/**
 * キーパターン(デフォルト)に対応する矢印番号を格納
 */
function convertreplaceNums() {
	const keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	const keyNum = g_keyObj["chara" + keyCtrlPtn].length;
	const baseCharas = g_keyObj["chara" + g_keyObj.currentKey + "_0"];
	const convCharas = g_keyObj["chara" + keyCtrlPtn];

	g_workObj.replaceNums = new Array();

	for (var j = 0; j < keyNum; j++) {
		for (var k = 0; k < keyNum; k++) {
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

	const keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	const keyNum = g_keyObj["chara" + keyCtrlPtn].length;

	if (_val < 30) {
		// 矢印の色変化
		if (g_workObj["mk" + _header + "Color"][_frame] === undefined) {
			g_workObj["mk" + _header + "Color"][_frame] = new Array();
			g_workObj["mk" + _header + "ColorCd"][_frame] = new Array();
		}
		if (_val < 20) {
			const realVal = g_workObj.replaceNums[_val];
			g_workObj["mk" + _header + "Color"][_frame].push(realVal);
			g_workObj["mk" + _header + "ColorCd"][_frame].push(_colorCd);
		} else if (_val >= 20) {
			const colorNum = _val - 20;
			for (var j = 0; j < keyNum; j++) {
				if (g_keyObj["color" + keyCtrlPtn][j] === colorNum) {
					g_workObj["mk" + _header + "Color"][_frame].push(j);
					g_workObj["mk" + _header + "ColorCd"][_frame].push(_colorCd);
				}
			}
		}
	} else {
		// フリーズアローの色変化
		if (g_workObj["mkF" + _header + "Color"][_frame] === undefined) {
			g_workObj["mkF" + _header + "Color"][_frame] = new Array();
			g_workObj["mkF" + _header + "ColorCd"][_frame] = new Array();
		}
		if (_val < 50) {
			g_workObj["mkF" + _header + "Color"][_frame].push(_val % 30);
			g_workObj["mkF" + _header + "ColorCd"][_frame].push(_colorCd);
		} else if (_val < 60) {
			const tmpVal = (_val % 50) * 2;
			g_workObj["mkF" + _header + "Color"][_frame].push(tmpVal, tmpVal + 1);
			g_workObj["mkF" + _header + "ColorCd"][_frame].push(_colorCd, _colorCd);
		} else {
			if (_val === 60) {
				g_workObj["mkF" + _header + "Color"][_frame].push(0, 1, 2, 3, 4, 5, 6, 7);
			} else {
				g_workObj["mkF" + _header + "Color"][_frame].push(10, 11, 12, 13, 14, 15, 16, 17);
			}
			g_workObj["mkF" + _header + "ColorCd"][_frame].push(_colorCd, _colorCd, _colorCd, _colorCd, _colorCd, _colorCd, _colorCd, _colorCd);
		}
	}
}

/**
 * メイン画面前の初期化処理
 */
function getArrowSettings() {

	const keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	const keyNum = g_keyObj["chara" + keyCtrlPtn].length;
	const posMax = g_keyObj["pos" + keyCtrlPtn][keyNum - 1] + 1;
	const divideCnt = g_keyObj["div" + keyCtrlPtn];
	if (g_keyObj["blank" + keyCtrlPtn] !== undefined) {
		g_keyObj.blank = g_keyObj["blank" + keyCtrlPtn];
	} else {
		g_keyObj.blank = g_keyObj.blank_def;
	}

	g_workObj.stepX = [];
	g_workObj.scrollDir = [];
	g_workObj.dividePos = [];
	g_workObj.stepRtn = g_keyObj["stepRtn" + keyCtrlPtn].concat();
	g_workObj.keyCtrl = g_keyObj["keyCtrl" + keyCtrlPtn].concat();
	g_workObj.keyHitFlg = [];
	for (var j = 0; j < g_workObj.keyCtrl.length; j++) {
		g_workObj.keyHitFlg[j] = [];
		for (var k = 0; k < g_workObj.keyCtrl[j].length; k++) {
			g_workObj.keyHitFlg[j][k] = false;
		}
	}

	g_workObj.judgArrowCnt = new Array();
	g_workObj.judgFrzCnt = new Array();
	g_judgObj.lockFlgs = new Array();

	// 矢印色管理 (個別)
	g_workObj.arrowColors = new Array();
	g_workObj.frzNormalColors = new Array();
	g_workObj.frzNormalBarColors = new Array();
	g_workObj.frzHitColors = new Array();
	g_workObj.frzHitBarColors = new Array();

	// 矢印色管理 (全体)
	g_workObj.arrowColorsAll = new Array();
	g_workObj.frzNormalColorsAll = new Array();
	g_workObj.frzNormalBarColorsAll = new Array();
	g_workObj.frzHitColorsAll = new Array();
	g_workObj.frzHitBarColorsAll = new Array();

	for (var j = 0; j < keyNum; j++) {

		const posj = g_keyObj["pos" + keyCtrlPtn][j];
		const leftCnt = (posj >= divideCnt ? posj - divideCnt : posj);
		const stdPos = (posj >= divideCnt ? leftCnt - (posMax - divideCnt) / 2 : leftCnt - divideCnt / 2);
		g_workObj.stepX[j] = g_keyObj.blank * stdPos + g_sWidth / 2;

		if (g_stateObj.reverse === C_FLG_ON) {
			g_workObj.dividePos[j] = (posj >= divideCnt ? 0 : 1);
			g_workObj.scrollDir[j] = (posj >= divideCnt ? 1 : -1);
		} else {
			g_workObj.dividePos[j] = (posj >= divideCnt ? 1 : 0);
			g_workObj.scrollDir[j] = (posj >= divideCnt ? -1 : 1);
		}

		g_workObj.judgArrowCnt[j] = 1;
		g_workObj.judgFrzCnt[j] = 1;
		g_judgObj.lockFlgs[j] = false;

		g_workObj.arrowColors[j] = g_headerObj.setColor[g_keyObj["color" + keyCtrlPtn][j]];

		g_workObj.frzNormalColors[j] = g_headerObj.frzColor[g_keyObj["color" + keyCtrlPtn][j]][0];
		g_workObj.frzNormalBarColors[j] = g_headerObj.frzColor[g_keyObj["color" + keyCtrlPtn][j]][1];
		g_workObj.frzHitColors[j] = g_headerObj.frzColor[g_keyObj["color" + keyCtrlPtn][j]][2];
		g_workObj.frzHitBarColors[j] = g_headerObj.frzColor[g_keyObj["color" + keyCtrlPtn][j]][3];

		g_workObj.arrowColorsAll[j] = g_headerObj.setColor[g_keyObj["color" + keyCtrlPtn][j]];

		g_workObj.frzNormalColorsAll[j] = g_headerObj.frzColor[g_keyObj["color" + keyCtrlPtn][j]][0];
		g_workObj.frzNormalBarColorsAll[j] = g_headerObj.frzColor[g_keyObj["color" + keyCtrlPtn][j]][1];
		g_workObj.frzHitColorsAll[j] = g_headerObj.frzColor[g_keyObj["color" + keyCtrlPtn][j]][2];
		g_workObj.frzHitBarColorsAll[j] = g_headerObj.frzColor[g_keyObj["color" + keyCtrlPtn][j]][3];
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
}

/*-----------------------------------------------------------*/
/* Scene : MAIN [banana] */
/*-----------------------------------------------------------*/

/**
 * メイン画面初期化
 */
function MainInit() {

	const divRoot = document.getElementById("divRoot");

	g_workObj.word0Data = "";
	g_workObj.word1Data = "";
	g_currentArrows = 0;

	// 背景スプライトを作成
	const backSprite = createSprite("divRoot", "backSprite", 0, 0, g_sWidth, g_sHeight);
	for (var j = 0; j <= g_scoreObj.backMaxDepth; j++) {
		createSprite("backSprite", "backSprite" + j, 0, 0, g_sWidth, g_sHeight);
	}

	// ステップゾーン、矢印のメインスプライトを作成
	const mainSprite = createSprite("divRoot", "mainSprite", 0, 0, g_sWidth, g_sHeight);

	// 曲情報・判定カウント用スプライトを作成（メインスプライトより上位）
	const infoSprite = createSprite("divRoot", "infoSprite", 0, 0, g_sWidth, g_sHeight);

	// 判定系スプライトを作成（メインスプライトより上位）
	const judgeSprite = createSprite("divRoot", "judgeSprite", 0, 0, g_sWidth, g_sHeight);

	const keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	const keyNum = g_keyObj["chara" + keyCtrlPtn].length;

	// ステップゾーンを表示
	for (var j = 0; j < keyNum; j++) {
		const step = createArrowEffect("step" + j, "#999999",
			g_workObj.stepX[j],
			g_stepY + (g_distY - g_stepY - 50) * g_workObj.dividePos[j], 50,
			g_workObj.stepRtn[j]);
		mainSprite.appendChild(step);

		const stepHit = createArrowEffect("stepHit" + j, "#999999",
			g_workObj.stepX[j] - 15,
			g_stepY + (g_distY - g_stepY - 50) * g_workObj.dividePos[j] - 15, 80,
			g_workObj.stepRtn[j]);
		stepHit.style.opacity = 0;
		stepHit.setAttribute("cnt", 0);
		mainSprite.appendChild(stepHit);

		// ステップゾーンOFF設定
		if (g_stateObj.d_stepzone === C_FLG_OFF) {
			step.style.display = C_DIS_NONE;
		}
	}

	// 矢印・フリーズアロー・速度変化 移動/判定/変化対象の初期化
	const arrowCnts = new Array();
	const frzCnts = new Array();
	for (var j = 0; j < keyNum; j++) {
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
	let musicStartFlg = false;

	g_inputKeyBuffer = [];

	// 終了時間の設定
	const fullSecond = Math.ceil(g_headerObj.blankFrame / 60 + g_audio.duration);
	let fullMin = Math.floor(fullSecond / 60);
	let fullSec = ("00" + Math.floor(fullSecond % 60)).slice(-2);
	let fullTime = fullMin + ":" + fullSec;
	let fadeOutFrame = Infinity;
	const preblankFrameForTime = Number(g_headerObj.blankFrame - g_headerObj.blankFrameDef);

	// フェードアウト時間指定の場合、その7秒(=420フレーム)後に終了する
	if (g_headerObj.fadeFrame !== undefined) {
		if (isNaN(parseInt(g_headerObj.fadeFrame[g_stateObj.scoreId]))) {
		} else {
			fadeOutFrame = parseInt(g_headerObj.fadeFrame[g_stateObj.scoreId]);
			const fadeTmp = Math.floor((parseInt(g_headerObj.fadeFrame[g_stateObj.scoreId]) + C_FRM_AFTERFADE + preblankFrameForTime) / 60) * 60;

			fullMin = Math.floor(fadeTmp / 3600);
			fullSec = ("00" + (fadeTmp / 60) % 60).slice(-2);
			fullTime = fullMin + ":" + fullSec;
		}
	}

	// 終了時間指定の場合、その値を適用する
	if (g_headerObj.endFrame !== undefined) {
		if (!isNaN(parseInt(g_headerObj.endFrame[g_stateObj.scoreId]))) {
			const fullTmp = Math.floor((parseInt(g_headerObj.endFrame[g_stateObj.scoreId]) + preblankFrameForTime) / 60) * 60;

			fullMin = Math.floor(fullTmp / 3600);
			fullSec = ("00" + (fullTmp / 60) % 60).slice(-2);
			fullTime = fullMin + ":" + fullSec;

		} else if (!isNaN(parseInt(g_headerObj.endFrame[0]))) {
			const fullTmp = Math.floor((parseInt(g_headerObj.endFrame[0]) + preblankFrameForTime) / 60) * 60;

			fullMin = Math.floor(fullTmp / 3600);
			fullSec = ("00" + (fullTmp / 60) % 60).slice(-2);
			fullTime = fullMin + ":" + fullSec;
		}
	}

	// フレーム数
	const lblframe = createDivLabel("lblframe", 0, 0, 100, 30, 20, C_CLR_TITLE,
		g_scoreObj.frameNum);
	divRoot.appendChild(lblframe);

	// ライフ(数字)
	const lblLife = createDivLabel("lblLife", 0, 30, 70, 20, 16, C_CLR_TITLE,
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
	divRoot.appendChild(lblLife);

	// ライフ背景
	const lifeBackObj = createColorObject("lifeBackObj", C_CLR_BACKLIFE,
		5, 50,
		15, g_sHeight - 100, 0, "lifeBar");
	infoSprite.appendChild(lifeBackObj);

	// ライフ本体
	const lifeBar = createColorObject("lifeBar", lblInitColor,
		5, 50 + (g_sHeight - 100) * (C_VAL_MAXLIFE - g_workObj.lifeVal) / C_VAL_MAXLIFE,
		15, (g_sHeight - 100) * g_workObj.lifeVal / C_VAL_MAXLIFE, 0, "lifeBar");
	infoSprite.appendChild(lifeBar);

	// ライフ：ボーダーライン
	// この背景の画像は40x16で作成しているが、"padding-right:5px"があるためサイズを35x16で作成
	const lifeBorderObj = createColorObject("lifeBorderObj", C_CLR_BORDER,
		5, 42 + (g_sHeight - 100) * (C_VAL_MAXLIFE - g_workObj.lifeBorder) / C_VAL_MAXLIFE,
		35, 16, 0, "lifeBorder");
	lifeBorderObj.innerHTML = g_workObj.lifeBorder;
	lifeBorderObj.style.textAlign = C_ALIGN_RIGHT;
	lifeBorderObj.style.paddingRight = "5px";
	lifeBorderObj.style.fontFamily = getBasicFont();
	lifeBorderObj.style.fontSize = "14px";
	lifeBorderObj.style.color = "#cccccc";
	infoSprite.appendChild(lifeBorderObj);

	if (g_stateObj.lifeBorder === 0 || g_workObj.lifeVal === C_VAL_MAXLIFE) {
		lifeBorderObj.style.display = C_DIS_NONE;
	}

	// 判定カウンタ表示
	infoSprite.appendChild(makeCounterSymbol("lblIi", g_sWidth - 110, C_CLR_II, 1, 0));
	infoSprite.appendChild(makeCounterSymbol("lblShakin", g_sWidth - 110, C_CLR_SHAKIN, 2, 0));
	infoSprite.appendChild(makeCounterSymbol("lblMatari", g_sWidth - 110, C_CLR_MATARI, 3, 0));
	infoSprite.appendChild(makeCounterSymbol("lblShobon", g_sWidth - 110, C_CLR_SHOBON, 4, 0));
	infoSprite.appendChild(makeCounterSymbol("lblUwan", g_sWidth - 110, C_CLR_UWAN, 5, 0));
	infoSprite.appendChild(makeCounterSymbol("lblMCombo", g_sWidth - 110, "#ffffff", 6, 0));

	infoSprite.appendChild(makeCounterSymbol("lblKita", g_sWidth - 110, C_CLR_KITA, 8, 0));
	infoSprite.appendChild(makeCounterSymbol("lblIknai", g_sWidth - 110, C_CLR_IKNAI, 9, 0));
	infoSprite.appendChild(makeCounterSymbol("lblFCombo", g_sWidth - 110, "#ffffff", 10, 0));

	// 歌詞表示1
	const lblWord0 = createDivLabel("lblword0", 100, 10, g_sWidth - 200, 30, 14, "#ffffff",
		g_workObj.word0Data);
	lblWord0.style.textAlign = C_ALIGN_LEFT;
	judgeSprite.appendChild(lblWord0);

	// 歌詞表示2
	const lblWord1 = createDivLabel("lblword1", 100, g_sHeight - 60, g_sWidth - 200, 20, 14, "#ffffff",
		g_workObj.word1Data);
	lblWord1.style.textAlign = C_ALIGN_LEFT;
	judgeSprite.appendChild(lblWord1);

	// 歌詞表示3
	const lblWord2 = createDivLabel("lblword2", 100, 10, g_sWidth - 200, 30, 14, "#ffffff",
		g_workObj.word0Data);
	lblWord2.style.textAlign = C_ALIGN_LEFT;
	judgeSprite.appendChild(lblWord2);

	// 歌詞表示4
	const lblWord3 = createDivLabel("lblword3", 100, g_sHeight - 60, g_sWidth - 200, 20, 14, "#ffffff",
		g_workObj.word1Data);
	lblWord3.style.textAlign = C_ALIGN_LEFT;
	judgeSprite.appendChild(lblWord3);

	// 曲名・アーティスト名表示
	const lblCredit = createDivLabel("lblCredit", 125, g_sHeight - 30, g_sWidth - 125, 20, 14, "#cccccc",
		g_headerObj.musicTitle + " / " + g_headerObj.artistName);
	lblCredit.style.textAlign = C_ALIGN_LEFT;
	infoSprite.appendChild(lblCredit);

	// 曲時間表示：現在時間
	const lblTime1 = createDivLabel("lblTime1", 18, g_sHeight - 30, 40, 20, 14, "#cccccc",
		"-:--");
	lblTime1.style.textAlign = C_ALIGN_RIGHT;
	infoSprite.appendChild(lblTime1);

	// 曲時間表示：総時間
	const lblTime2 = createDivLabel("lblTime2", 60, g_sHeight - 30, 60, 20, 14, "#cccccc",
		"/ " + fullTime);
	lblTime1.style.textAlign = C_ALIGN_RIGHT;
	infoSprite.appendChild(lblTime2);

	// 判定キャラクタ表示：矢印
	const charaJ = createDivLabel("charaJ", g_sWidth / 2 - 200, g_sHeight / 2 - 50,
		C_LEN_JDGCHARA_WIDTH, C_LEN_JDGCHARA_HEIGHT, C_SIZ_JDGCHARA, C_CLR_II, "");
	charaJ.style.textAlign = C_ALIGN_CENTER;
	charaJ.setAttribute("cnt", 0);
	judgeSprite.appendChild(charaJ);

	// コンボ表示：矢印
	const comboJ = createDivLabel("comboJ", g_sWidth / 2 - 50, g_sHeight / 2 - 50,
		C_LEN_JDGCHARA_WIDTH, C_LEN_JDGCHARA_HEIGHT, C_SIZ_JDGCHARA, C_CLR_KITA, "");
	comboJ.style.textAlign = C_ALIGN_CENTER;
	comboJ.setAttribute("cnt", 0);
	judgeSprite.appendChild(comboJ);

	// 判定キャラクタ表示：フリーズアロー
	const charaFJ = createDivLabel("charaFJ", g_sWidth / 2 - 100, g_sHeight / 2,
		C_LEN_JDGCHARA_WIDTH, C_LEN_JDGCHARA_HEIGHT, C_SIZ_JDGCHARA, C_CLR_KITA, "");
	charaFJ.style.textAlign = C_ALIGN_CENTER;
	charaFJ.setAttribute("cnt", 0);
	judgeSprite.appendChild(charaFJ);

	// コンボ表示：フリーズアロー
	const comboFJ = createDivLabel("comboFJ", g_sWidth / 2 + 50, g_sHeight / 2,
		C_LEN_JDGCHARA_WIDTH, C_LEN_JDGCHARA_HEIGHT, C_SIZ_JDGCHARA, C_CLR_II, "");
	comboFJ.style.textAlign = C_ALIGN_CENTER;
	comboFJ.setAttribute("cnt", 0);
	judgeSprite.appendChild(comboFJ);

	// パーフェクト演出
	const finishView = createDivLabel("finishView", g_sWidth / 2 - 150, g_sHeight / 2 - 50,
		300, 20, 50, C_CLR_KITA, "");
	finishView.style.textAlign = C_ALIGN_CENTER;
	judgeSprite.appendChild(finishView);

	// 判定系OFF設定
	if (g_stateObj.d_judgement === C_FLG_OFF) {
		document.getElementById("lblIi").style.display = C_DIS_NONE;
		document.getElementById("lblShakin").style.display = C_DIS_NONE;
		document.getElementById("lblMatari").style.display = C_DIS_NONE;
		document.getElementById("lblShobon").style.display = C_DIS_NONE;
		document.getElementById("lblUwan").style.display = C_DIS_NONE;
		document.getElementById("lblMCombo").style.display = C_DIS_NONE;

		document.getElementById("lblKita").style.display = C_DIS_NONE;
		document.getElementById("lblIknai").style.display = C_DIS_NONE;
		document.getElementById("lblFCombo").style.display = C_DIS_NONE;

		document.getElementById("comboJ").style.display = C_DIS_NONE;
		document.getElementById("charaJ").style.display = C_DIS_NONE;
		document.getElementById("comboFJ").style.display = C_DIS_NONE;
		document.getElementById("charaFJ").style.display = C_DIS_NONE;
	}

	// 曲情報OFF
	if (g_stateObj.d_musicinfo === C_FLG_OFF) {
		document.getElementById("lblCredit").style.left = "20px";
		document.getElementById("lblTime1").style.display = C_DIS_NONE;
		document.getElementById("lblTime2").style.display = C_DIS_NONE;
	}

	// ライフゲージOFF (フレーム数もテスト的に消す)
	if (g_stateObj.d_lifegauge === C_FLG_OFF) {
		document.getElementById("lblLife").style.display = C_DIS_NONE;
		document.getElementById("lifeBackObj").style.display = C_DIS_NONE;
		document.getElementById("lifeBar").style.display = C_DIS_NONE;
		document.getElementById("lifeBorderObj").style.display = C_DIS_NONE;
		document.getElementById("lblframe").style.display = C_DIS_NONE;
	}

	// ローカル時のみフレーム数を残す
	if (g_hostName === "localhost" || g_hostName === "127.0.0.1" || g_hostName === "") {
	} else {
		document.getElementById("lblframe").style.display = C_DIS_NONE;
	}

	// ユーザカスタムイベント(初期)
	if (typeof customMainInit === "function") {
		customMainInit();
		if (typeof customMainInit2 === "function") {
			customMainInit2();
		}
	}

	// キー操作イベント
	document.onkeydown = function (evt) {

		// ブラウザ判定
		let setKey;
		if (g_userAgent.indexOf("firefox") !== -1) {
			setKey = evt.which;
		} else {
			setKey = event.keyCode;
		}
		g_inputKeyBuffer[setKey] = true;

		eval("mainKeyDownAct" + g_stateObj.auto)(setKey);

		// 曲中リトライ、タイトルバック
		if (setKey === 8) {
			g_audio.pause();
			clearTimeout(g_timeoutEvtId);
			clearWindow();
			g_audio.load();

			if (g_audio.readyState === 4) {
				// audioの読み込みが終わった後の処理
				loadingScoreInit();
			} else {
				// 読込中の状態
				g_audio.addEventListener('canplaythrough', (function () {
					return function f() {
						g_audio.removeEventListener('canplaythrough', f, false);
						loadingScoreInit();
					}
				})(), false);
			}
		} else if (setKey === 46) {
			g_audio.pause();
			clearTimeout(g_timeoutEvtId);
			setTimeout(function () {
				clearWindow();
				if (keyIsDown(16)) {
					g_gameOverFlg = true;
					resultInit();
				} else {
					titleInit();
				}
			}, 200);
		}

		for (var j = 0; j < C_BLOCK_KEYS.length; j++) {
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
		const matchKeys = g_keyObj["keyCtrl" + keyCtrlPtn];

		for (var j = 0; j < keyNum; j++) {
			for (var k = 0; k < matchKeys[j].length; k++) {
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

	document.onkeyup = function (evt) {
		// ブラウザ判定
		let setKey;
		if (g_userAgent.indexOf("firefox") !== -1) {
			setKey = evt.which;
		} else {
			setKey = event.keyCode;
		}
		g_inputKeyBuffer[setKey] = false;

		eval("mainKeyUpAct" + g_stateObj.auto)();
	}

	/**
	 * キーを離したときの処理 (AutoPlay:OFF時)
	 */
	function mainKeyUpActOFF() {
		for (var j = 0; j < keyNum; j++) {

			let keyDownFlg = false;
			for (var m = 0, len = g_workObj.keyCtrl[j].length; m < len; m++) {
				if (keyIsDown(g_workObj.keyCtrl[j][m])) {
					keyDownFlg = true;
					break;
				}
			}
			if (!keyDownFlg) {

				// ステップゾーンに対応するキーを離したとき
				const stepDiv = document.getElementById("step" + j);
				stepDiv.style.backgroundColor = "#999999";

			}
		}
	}

	/**
	 * キーを離したときの処理 (AutoPlay:ON時)
	 */
	function mainKeyUpActON() {

	}

	/**
	 * 楽曲の再生処理
	 * - Firefoxはすでに @see {@link startPreloadingAudio} で楽曲再生しているためミュートのみ外す。
	 */
	function prepareAudio() {
		if (g_userAgent.indexOf("msie") !== -1 ||
			g_userAgent.indexOf("trident") !== -1 ||
			g_userAgent.indexOf('edge') !== -1 ||
			g_userAgent.indexOf("chrome") !== -1 ||
			g_userAgent.indexOf("safari") !== -1) {

			g_audio.play();
		} else if (g_userAgent.indexOf("firefox") !== -1) {
			g_audio.muted = false;
		} else if (g_userAgent.indexOf("opera") !== -1) {
			g_audio.play();
		}
	}

	/**
	 * フレーム処理(譜面台)
	 */
	function flowTimeline() {
		lblframe.innerHTML = g_scoreObj.frameNum;

		// キーの押下状態を取得
		for (var j = 0; j < keyNum; j++) {
			for (var m = 0, len = g_workObj.keyCtrl[j].length; m < len; m++) {
				g_workObj.keyHitFlg[j][m] = keyIsDown(g_workObj.keyCtrl[j][m]);
			}
		}

		if (g_scoreObj.frameNum === musicStartFrame) {
			prepareAudio();
			musicStartFlg = true;
			g_audio.currentTime = firstFrame / 60;
			g_audio.dispatchEvent(g_timeupdate);
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
		if (typeof customMainEnterFrame === "function") {
			customMainEnterFrame();
			if (typeof customMainEnterFrame2 === "function") {
				customMainEnterFrame2();
			}
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
		changeArrowColors(g_workObj.mkColor[g_scoreObj.frameNum], g_workObj.mkColorCd[g_scoreObj.frameNum], "");

		// 個別色変化（フリーズアロー）
		changeFrzColors(g_workObj.mkFColor[g_scoreObj.frameNum], g_workObj.mkFColorCd[g_scoreObj.frameNum],
			g_keyObj["color" + keyCtrlPtn], keyNum, "");

		// 全体色変化 (矢印)
		changeArrowColors(g_workObj.mkAColor[g_scoreObj.frameNum], g_workObj.mkAColorCd[g_scoreObj.frameNum], "A");

		// 全体色変化 (フリーズアロー)
		changeFrzColors(g_workObj.mkFAColor[g_scoreObj.frameNum], g_workObj.mkFAColorCd[g_scoreObj.frameNum],
			g_keyObj["color" + keyCtrlPtn], keyNum, "A");

		// 矢印生成
		if (g_workObj.mkArrow[g_scoreObj.frameNum] !== undefined) {
			for (var j = 0, len = g_workObj.mkArrow[g_scoreObj.frameNum].length; j < len; j++) {

				const targetj = g_workObj.mkArrow[g_scoreObj.frameNum][j];

				const step = createArrowEffect("arrow" + targetj + "_" + (++arrowCnts[targetj]), g_workObj.arrowColors[targetj],
					g_workObj.stepX[targetj],
					g_stepY + (g_distY - g_stepY - 50) * g_workObj.dividePos[targetj] + g_workObj.initY[g_scoreObj.frameNum] * g_workObj.boostSpd * g_workObj.scrollDir[targetj], 50,
					g_workObj.stepRtn[targetj]);
				step.setAttribute("cnt", g_workObj.arrivalFrame[g_scoreObj.frameNum] + 1);
				step.setAttribute("boostCnt", g_workObj.motionFrame[g_scoreObj.frameNum]);
				step.setAttribute("judgEndFlg", "false");
				step.setAttribute("boostSpd", g_workObj.boostSpd);

				mainSprite.appendChild(step);
			}
			//delete g_workObj.mkArrow[g_scoreObj.frameNum];
		}

		// 矢印移動＆消去
		for (var j = 0; j < keyNum; j++) {

			const stepDivHit = document.getElementById("stepHit" + j);

			for (var k = g_workObj.judgArrowCnt[j]; k <= arrowCnts[j]; k++) {
				const arrow = document.getElementById("arrow" + j + "_" + k);
				let boostCnt = arrow.getAttribute("boostCnt");
				const boostSpd = arrow.getAttribute("boostSpd");
				let cnt = arrow.getAttribute("cnt");

				// 全体色変化 (移動時)
				if (g_workObj.mkAColor[g_scoreObj.frameNum] !== undefined) {
					if (arrow.getAttribute("color") !== g_workObj.arrowColors[j]) {
						if (g_workObj.arrowColors[j] === g_workObj.arrowColorsAll[j]) {
							arrow.style.backgroundColor = g_workObj.arrowColorsAll[j];
							arrow.setAttribute("color", g_workObj.arrowColorsAll[j]);
						}
					}
				}

				// 移動
				if (g_workObj.currentSpeed !== 0) {
					arrow.style.top = (parseFloat(arrow.style.top) -
						(g_workObj.currentSpeed + g_workObj.motionOnFrames[boostCnt]) * boostSpd * g_workObj.scrollDir[j]) + "px";
					arrow.setAttribute("boostCnt", --boostCnt);
				}
				arrow.setAttribute("cnt", --cnt);

				if (g_stateObj.auto === C_FLG_ON) {
					if (cnt === 0) {
						judgeIi(cnt);
						stepDivHit.style.opacity = 1;
						stepDivHit.setAttribute("cnt", C_FRM_HITMOTION);
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
			let hitCnt = stepDivHit.getAttribute("cnt");
			if (hitCnt > 0) {
				stepDivHit.setAttribute("cnt", --hitCnt);
				if (hitCnt === 0) {
					stepDivHit.style.opacity = 0;
				}
			}
		}

		// フリーズアロー生成
		if (g_workObj.mkFrzArrow[g_scoreObj.frameNum] !== undefined) {
			for (var j = 0, len = g_workObj.mkFrzArrow[g_scoreObj.frameNum].length; j < len; j++) {
				const targetj = g_workObj.mkFrzArrow[g_scoreObj.frameNum][j];
				const frzLength = g_workObj.mkFrzLength[targetj][frzCnts[targetj] * 2];
				const rev = g_workObj.scrollDir[targetj];

				const frzRoot = createSprite("mainSprite", "frz" + targetj + "_" + (++frzCnts[targetj]),
					g_workObj.stepX[targetj],
					g_stepY + (g_distY - g_stepY - 50) * g_workObj.dividePos[targetj] + g_workObj.initY[g_scoreObj.frameNum] * g_workObj.boostSpd * rev,
					50, 100 + frzLength);
				frzRoot.setAttribute("cnt", g_workObj.arrivalFrame[g_scoreObj.frameNum] + 1);
				frzRoot.setAttribute("boostCnt", g_workObj.motionFrame[g_scoreObj.frameNum]);
				frzRoot.setAttribute("judgEndFlg", "false");
				frzRoot.setAttribute("isMoving", "true");
				frzRoot.setAttribute("frzBarLength", frzLength);
				frzRoot.setAttribute("frzAttempt", 0);
				frzRoot.setAttribute("boostSpd", g_workObj.boostSpd);
				mainSprite.appendChild(frzRoot);

				// フリーズアローは、下記の順で作成する。
				// 後に作成するほど前面に表示される。

				// フリーズアロー帯(frzBar)
				const frzBar = createColorObject("frzBar" + targetj + "_" + (frzCnts[targetj]), g_workObj.frzNormalBarColors[targetj],
					5, 25 - frzLength * g_workObj.boostSpd * g_workObj.dividePos[targetj], 40, frzLength * g_workObj.boostSpd, 0, "frzBar");
				frzRoot.appendChild(frzBar);

				// 開始矢印の塗り部分。ヒット時は前面に出て光る。
				const frzTopShadow = createColorObject("frzTopShadow" + targetj + "_" + (frzCnts[targetj]), "#000000",
					0, 0, 50, 50, g_workObj.stepRtn[targetj], "arrowShadow");
				frzRoot.appendChild(frzTopShadow);

				// 開始矢印。ヒット時は隠れる。
				const frzTop = createArrowEffect("frzTop" + targetj + "_" + (frzCnts[targetj]), g_workObj.frzNormalColors[targetj],
					0, 0, 50, g_workObj.stepRtn[targetj]);
				frzRoot.appendChild(frzTop);

				// 後発矢印の塗り部分
				const frzBtmShadow = createColorObject("frzBtmShadow" + targetj + "_" + (frzCnts[targetj]), "#000000",
					0, frzLength * g_workObj.boostSpd * rev, 50, 50, g_workObj.stepRtn[targetj], "arrowShadow");
				frzRoot.appendChild(frzBtmShadow);

				// 後発矢印
				const frzBtm = createArrowEffect("frzBtm" + targetj + "_" + (frzCnts[targetj]), g_workObj.frzNormalColors[targetj],
					0, frzLength * g_workObj.boostSpd * rev, 50, g_workObj.stepRtn[targetj]);
				frzRoot.appendChild(frzBtm);
			}
		}

		// フリーズアロー移動＆消去
		for (var j = 0; j < keyNum; j++) {
			for (var k = g_workObj.judgFrzCnt[j]; k <= frzCnts[j]; k++) {
				const frzRoot = document.getElementById("frz" + j + "_" + k);
				let boostCnt = frzRoot.getAttribute("boostCnt");
				const boostSpd = frzRoot.getAttribute("boostSpd");
				let cnt = frzRoot.getAttribute("cnt");
				let frzAttempt = frzRoot.getAttribute("frzAttempt");

				const frzTop = document.getElementById("frzTop" + j + "_" + k);
				const frzBar = document.getElementById("frzBar" + j + "_" + k);
				const frzBtm = document.getElementById("frzBtm" + j + "_" + k);
				let frzBarLength = frzRoot.getAttribute("frzBarLength");

				if (frzRoot.getAttribute("judgEndFlg") === "false") {
					if (frzRoot.getAttribute("isMoving") === "true") {

						// 全体色変化 (通常時)
						if (g_workObj.mkFAColor[g_scoreObj.frameNum] !== undefined) {
							if (frzBtm.getAttribute("color") !== g_workObj.frzNormalColors[j]) {
								if (g_workObj.frzNormalColors[j] === g_workObj.frzNormalColorsAll[j]) {
									frzTop.style.backgroundColor = g_workObj.frzNormalColorsAll[j];
									frzBtm.style.backgroundColor = g_workObj.frzNormalColorsAll[j];
									frzBtm.setAttribute("color", g_workObj.frzNormalColorsAll[j]);
								}
							}
							if (frzBar.getAttribute("color") !== g_workObj.frzNormalBarColors[j]) {
								if (g_workObj.frzNormalBarColors[j] === g_workObj.frzNormalBarColorsAll[j]) {
									frzBar.style.backgroundColor = g_workObj.frzNormalBarColorsAll[j];
									frzBar.setAttribute("color", g_workObj.frzNormalBarColorsAll[j]);
								}
							}
						}

						// 移動
						if (g_workObj.currentSpeed !== 0) {
							frzRoot.style.top = (parseFloat(frzRoot.style.top) -
								(g_workObj.currentSpeed + g_workObj.motionOnFrames[boostCnt]) * boostSpd * g_workObj.scrollDir[j]) + "px";
							frzRoot.setAttribute("boostCnt", --boostCnt);
						}
						frzRoot.setAttribute("cnt", --cnt);

						if (g_stateObj.auto === C_FLG_ON && cnt === 0) {
							changeHitFrz(j, k);
						}

						// フリーズアローの判定領域に入った場合、前のフリーズアローを強制的に削除
						// ただし、前のフリーズアローの判定領域がジャスト付近(キター領域)の場合は削除しない
						// 削除する場合、前のフリーズアローの判定はイクナイ(＆ウワァン)扱い
						if (g_workObj.judgFrzCnt[j] !== k && Number(cnt) <= g_judgObj.frzJ[C_JDG_SFSF] + 1) {
							const prevFrzRoot = document.getElementById("frz" + j + "_" + g_workObj.judgFrzCnt[j]);
							const prevCnt = Number(prevFrzRoot.getAttribute("cnt"));
							if (prevCnt >= (-1) * g_judgObj.frzJ[C_JDG_KITA]) {
							} else {

								// 枠外判定前の場合、このタイミングで枠外判定を行う
								if (prevCnt >= (-1) * g_judgObj.frzJ[C_JDG_IKNAI]) {
									judgeIknai(cnt);
									if (g_headerObj.frzStartjdgUse === "true") {
										judgeUwan(cnt);
									}
								}
								mainSprite.removeChild(prevFrzRoot);
								g_workObj.judgFrzCnt[j]++;
							}
						}
					} else {
						const frzBtmShadow = document.getElementById("frzBtmShadow" + j + "_" + k);

						// 全体色変化 (ヒット時)
						if (g_workObj.mkFAColor[g_scoreObj.frameNum] !== undefined) {
							if (frzBtm.getAttribute("color") !== g_workObj.frzHitColors[j]) {
								if (g_workObj.frzHitColors[j] === g_workObj.frzHitColorsAll[j]) {
									frzBtm.style.backgroundColor = g_workObj.frzHitColorsAll[j];
									frzBtm.setAttribute("color", g_workObj.frzHitColorsAll[j]);
								}
							}
							if (frzBar.getAttribute("color") !== g_workObj.frzHitBarColors[j]) {
								if (g_workObj.frzHitBarColors[j] === g_workObj.frzHitBarColorsAll[j]) {
									frzBar.style.backgroundColor = g_workObj.frzHitBarColorsAll[j];
									frzBar.setAttribute("color", g_workObj.frzHitBarColorsAll[j]);
								}
							}
						}

						// フリーズアローがヒット中の処理
						if (frzBarLength > 0) {
							frzBarLength = parseFloat(frzBar.style.height) - g_workObj.currentSpeed * boostSpd;
							frzRoot.setAttribute("frzBarLength", frzBarLength);
							frzBar.style.height = frzBarLength + "px";
							frzBar.style.top = (parseFloat(frzBar.style.top) + g_workObj.currentSpeed * boostSpd * g_workObj.dividePos[j]) + "px";
							frzBtm.style.top = (parseFloat(frzBtm.style.top) - g_workObj.currentSpeed * boostSpd * g_workObj.scrollDir[j]) + "px";
							frzBtmShadow.style.top = (parseFloat(frzBtmShadow.style.top) - g_workObj.currentSpeed * boostSpd * g_workObj.scrollDir[j]) + "px";

							let keyDownFlg = false;
							for (var m = 0, len = g_workObj.keyCtrl[j].length; m < len; m++) {
								if (g_workObj.keyHitFlg[j][m]) {
									keyDownFlg = true;
									break;
								}
							}
							if (!keyDownFlg && g_stateObj.auto === C_FLG_OFF) {
								frzRoot.setAttribute("frzAttempt", ++frzAttempt);

								if (frzAttempt > C_FRM_FRZATTEMPT) {

									// フリーズアローを離したとき
									if (frzRoot.getAttribute("judgEndFlg") === "false") {
										if (frzRoot.getAttribute("isMoving") === "false") {
											judgeIknai(cnt);
											frzRoot.setAttribute("judgEndFlg", "true");

											changeFailedFrz(j, k);
										}
									}
								}
							}
						} else {
							judgeKita(cnt);

							g_workObj.judgFrzCnt[j]++;
							frzRoot.setAttribute("judgEndFlg", "true");
							mainSprite.removeChild(frzRoot);
						}
					}

					// フリーズアローが枠外に出たときの処理
					if (cnt < (-1) * g_judgObj.frzJ[C_JDG_IKNAI]) {
						judgeIknai(cnt);
						frzRoot.setAttribute("judgEndFlg", "true");

						changeFailedFrz(j, k);
					}
				} else {
					frzBarLength -= g_workObj.currentSpeed;
					frzRoot.setAttribute("frzBarLength", frzBarLength);
					frzRoot.style.top = (parseFloat(frzRoot.style.top) - (g_workObj.currentSpeed) * boostSpd * g_workObj.scrollDir[j]) + "px";

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
			g_wordSprite = document.getElementById("lblword" + g_wordObj.wordDir);

			if (g_wordObj.wordDat === "[fadein]") {
				g_wordObj["fadeInFlg" + g_wordObj.wordDir] = true;
				g_wordObj["fadeOutFlg" + g_wordObj.wordDir] = false;
				g_wordSprite.style.opacity = 0;

			} else if (g_wordObj.wordDat === "[fadeout]") {
				g_wordObj["fadeInFlg" + g_wordObj.wordDir] = false;
				g_wordObj["fadeOutFlg" + g_wordObj.wordDir] = true;
				g_wordSprite.style.opacity = 1;

			} else if (g_wordObj.wordDat === "[center]" ||
				g_wordObj.wordDat === "[left]" || g_wordObj.wordDat === "[right]") {

			} else {
				if (!g_wordObj["fadeOutFlg" + g_wordObj.wordDir]
					&& Number(g_wordSprite.style.opacity) === 0) {
					g_wordSprite.style.opacity = 1;
				}
				g_workObj["word" + g_wordObj.wordDir + "Data"] = g_wordObj.wordDat;
				g_wordSprite.innerHTML = g_wordObj.wordDat;
			}

			if (g_wordObj.wordDat === "[center]") {
				g_wordSprite.style.textAlign = C_ALIGN_CENTER;
				g_wordSprite.style.display = "block";
				g_wordSprite.style.margin = "auto";
			} else if (g_wordObj.wordDat === "[left]") {
				g_wordSprite.style.textAlign = C_ALIGN_LEFT;
				g_wordSprite.style.display = "inline";
				g_wordSprite.style.margin = "0";
			} else if (g_wordObj.wordDat === "[right]") {
				g_wordSprite.style.textAlign = C_ALIGN_RIGHT;
				g_wordSprite.style.display = "block";
				g_wordSprite.style.margin = "auto";
			}
		}

		// 歌詞フェードイン・アウト
		fadeWord("0");
		fadeWord("1");
		fadeWord("2");
		fadeWord("3");

		// 背景表示・背景モーション
		if (g_scoreObj.backData[g_scoreObj.frameNum] !== undefined) {
			const tmpObj = g_scoreObj.backData[g_scoreObj.frameNum];
			const backSprite = document.getElementById("backSprite" + tmpObj.depth);
			if (tmpObj.path !== "") {
				if (tmpObj.path.indexOf(".png") !== -1 || tmpObj.path.indexOf(".gif") !== -1 ||
					tmpObj.path.indexOf(".bmp") !== -1 || tmpObj.path.indexOf(".jpg") !== -1) {

					// imgタグの場合
					let tmpInnerHTML = "<img src='" + tmpObj.path + "' class='" + tmpObj.class + "' " +
						"style='position:absolute; left:" + tmpObj.left + "px; top:" + tmpObj.top + "px;";
					if (tmpObj.width !== 0 && tmpObj.width > 0) {
						tmpInnerHTML += "width:" + tmpObj.width + "px;";
					}
					if (tmpObj.height !== "" && setVal(tmpObj.height, 0, "number") > 0) {
						tmpInnerHTML += "height:" + tmpObj.height + "px;";
					}
					tmpInnerHTML += "animation-name:" + tmpObj.animationName +
						"; animation-duration:" + tmpObj.animationDuration +
						"s; opacity:" + tmpObj.opacity + ";'>";
					backSprite.innerHTML = tmpInnerHTML;

				} else {

					// spanタグの場合
					let tmpInnerHTML = "<span class='" + tmpObj.class + "' " +
						"style='display:inline-block;position:absolute; left:" + tmpObj.left + "px; top:" + tmpObj.top + "px;";

					// この場合のwidthは font-size と解釈する
					if (tmpObj.width !== 0 && tmpObj.width > 0) {
						tmpInnerHTML += "font-size:" + tmpObj.width + "px;";
					}

					// この場合のheightは color と解釈する
					if (tmpObj.height !== "") {
						tmpInnerHTML += "color:" + tmpObj.height + ";";
					}
					tmpInnerHTML += "animation-name:" + tmpObj.animationName +
						"; animation-duration:" + tmpObj.animationDuration +
						"s; opacity:" + tmpObj.opacity + ";'>" + tmpObj.path + "</span>";
					backSprite.innerHTML = tmpInnerHTML;
				}
			} else {
				backSprite.innerHTML = "";
			}

		}

		// 判定キャラクタ消去
		let charaJCnt = document.getElementById("charaJ").getAttribute("cnt");
		if (charaJCnt > 0) {
			document.getElementById("charaJ").setAttribute("cnt", --charaJCnt);
			if (charaJCnt === 0) {
				document.getElementById("charaJ").innerHTML = "";
				document.getElementById("comboJ").innerHTML = "";
			}
		}
		let charaFJCnt = document.getElementById("charaFJ").getAttribute("cnt");
		if (charaFJCnt > 0) {
			document.getElementById("charaFJ").setAttribute("cnt", --charaFJCnt);
			if (charaFJCnt === 0) {
				document.getElementById("charaFJ").innerHTML = "";
				document.getElementById("comboFJ").innerHTML = "";
			}
		}

		// 60fpsから遅延するため、その差分を取って次回のタイミングで遅れをリカバリする
		thisTime = performance.now();
		buffTime = (thisTime - mainStartTime - (g_scoreObj.frameNum - firstFrame) * 1000 / 60);
		g_scoreObj.frameNum++;
		g_timeoutEvtId = setTimeout(function () { flowTimeline() }, 1000 / 60 - buffTime);

		// タイマー、曲終了判定
		if (g_scoreObj.frameNum % 60 === 0) {
			const currentMin = Math.floor(g_scoreObj.frameNum / 3600);
			const currentSec = ("00" + (g_scoreObj.frameNum / 60) % 60).slice(-2);
			const currentTime = currentMin + ":" + currentSec;
			lblTime1.innerHTML = currentTime;

			if (currentTime === fullTime) {
				if (fadeOutFrame === Infinity && isNaN(parseInt(g_headerObj.endFrame))) {
					g_audio.pause();
				}
				if (g_stateObj.lifeMode === C_LFE_BORDER && g_workObj.lifeVal < g_workObj.lifeBorder) {
					g_gameOverFlg = true;
				}
				clearTimeout(g_timeoutEvtId);
				setTimeout(function () {
					clearWindow();
					resultInit();
				}, 100);
			}
		}
	}
	const mainStartTime = performance.now();
	g_timeoutEvtId = setTimeout(function () { flowTimeline(); }, 1000 / 60);
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
		for (var j = 0, len = _mkColor.length; j < len; j++) {
			const targetj = _mkColor[j];
			g_workObj.arrowColors[targetj] = _mkColorCd[j];
			if (_allFlg === "A") {
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
		for (var j = 0, len = _mkColor.length; j < len; j++) {

			const targetj = _mkColor[j];

			// targetj=0,2,4,6,8 ⇒ Arrow, 1,3,5,7,9 ⇒ Bar
			if (targetj < 10) {
				if (targetj % 2 === 0) {
					// 矢印 (通常)
					for (var k = 0; k < _keyNum; k++) {
						if (targetj / 2 === _colorPatterns[k]) {
							g_workObj.frzNormalColors[k] = _mkColorCd[j];
							if (_allFlg === "A") {
								g_workObj.frzNormalColorsAll[k] = _mkColorCd[j];
							}
						}
					}
				} else {
					// 帯 (通常)
					for (var k = 0; k < _keyNum; k++) {
						if ((targetj - 1) / 2 === _colorPatterns[k]) {
							g_workObj.frzNormalBarColors[k] = _mkColorCd[j];
							if (_allFlg === "A") {
								g_workObj.frzNormalBarColorsAll[k] = _mkColorCd[j];
							}
						}
					}
				}
			} else {
				const targetj2 = targetj - 10;
				if (targetj2 % 2 === 0) {
					// 矢印 (ヒット時)
					for (var k = 0; k < _keyNum; k++) {
						if (targetj2 / 2 === _colorPatterns[k]) {
							g_workObj.frzHitColors[k] = _mkColorCd[j];
							if (_allFlg === "A") {
								g_workObj.frzHitColorsAll[k] = _mkColorCd[j];
							}
						}
					}
				} else {
					// 帯 (ヒット時)
					for (var k = 0; k < _keyNum; k++) {
						if ((targetj2 - 1) / 2 === _colorPatterns[k]) {
							g_workObj.frzHitBarColors[k] = _mkColorCd[j];
							if (_allFlg === "A") {
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
 * 歌詞のフェードイン・アウト
 * @param {string} _wordDir 
 */
function fadeWord(_wordDir) {

	if (g_wordObj["fadeInFlg" + _wordDir]) {
		let wordAlpha = parseFloat(document.getElementById("lblword" + _wordDir).style.opacity);
		if (wordAlpha + 0.04 >= 0.99) {
			g_wordObj["fadeInFlg" + _wordDir] = false;
			document.getElementById("lblword" + _wordDir).style.opacity = 1;
		} else {
			wordAlpha += 0.04;
			document.getElementById("lblword" + _wordDir).style.opacity = wordAlpha;
		}
	} else if (g_wordObj["fadeOutFlg" + _wordDir]) {
		let wordAlpha = parseFloat(document.getElementById("lblword" + _wordDir).style.opacity);
		if (wordAlpha - 0.04 <= 0.01) {
			g_wordObj["fadeOutFlg" + _wordDir] = false;
			document.getElementById("lblword" + _wordDir).style.opacity = 0;
		} else {
			wordAlpha -= 0.04;
			document.getElementById("lblword" + _wordDir).style.opacity = wordAlpha;
		}
	}
}

/**
 * フリーズアローヒット時の描画変更
 * @param {number} _j 
 * @param {number} _k 
 */
function changeHitFrz(_j, _k) {

	const frzTopShadow = document.getElementById("frzTopShadow" + _j + "_" + _k);
	if (frzTopShadow.getAttribute("type") === "arrow") {
		const fstyle = frzTopShadow.style;
		fstyle.backgroundColor = "#ffffff";
		fstyle.top = "-10px";
		fstyle.left = "-10px";
		fstyle.width = "70px";
		fstyle.height = "70px";
		document.getElementById("frzTop" + _j + "_" + _k).style.opacity = 0;
	} else {
		document.getElementById("frzTop" + _j + "_" + _k).style.backgroundColor = g_workObj.frzHitColors[_j];
	}

	const frzBar = document.getElementById("frzBar" + _j + "_" + _k);
	const frzRoot = document.getElementById("frz" + _j + "_" + _k);
	const frzBtm = document.getElementById("frzBtm" + _j + "_" + _k);
	const frzBtmShadow = document.getElementById("frzBtmShadow" + _j + "_" + _k);

	frzBar.style.backgroundColor = g_workObj.frzHitBarColors[_j];
	frzBtm.style.backgroundColor = g_workObj.frzHitColors[_j];

	// フリーズアロー位置の修正（ステップゾーン上に来るように）
	const delFrzLength = parseFloat(document.getElementById("step" + _j).style.top) - parseFloat(frzRoot.style.top);

	frzRoot.style.top = document.getElementById("step" + _j).style.top;
	frzBtm.style.top = (parseFloat(frzBtm.style.top) - delFrzLength) + "px";
	frzBtmShadow.style.top = (parseFloat(frzBtmShadow.style.top) - delFrzLength) + "px";
	frzBar.style.top = (parseFloat(frzBar.style.top) - delFrzLength * g_workObj.dividePos[_j]) + "px";
	frzBar.style.height = (parseFloat(frzBar.style.height) - delFrzLength * g_workObj.scrollDir[_j]) + "px";

	frzRoot.setAttribute("isMoving", "false");
}

/**
 * フリーズアロー失敗時の描画変更
 * @param {number} _j 
 * @param {number} _k 
 */
function changeFailedFrz(_j, _k) {
	const frzTopShadow = document.getElementById("frzTopShadow" + _j + "_" + _k);
	const fstyle = frzTopShadow.style;
	fstyle.backgroundColor = "#000000";
	fstyle.top = "0px";
	fstyle.left = "0px";
	fstyle.width = "50px";
	fstyle.height = "50px";
	fstyle.opacity = 1;
	document.getElementById("frzTop" + _j + "_" + _k).style.opacity = 1;
	document.getElementById("frzTop" + _j + "_" + _k).style.backgroundColor = "#cccccc";
	document.getElementById("frzBar" + _j + "_" + _k).style.backgroundColor = "#999999";
	document.getElementById("frzBtm" + _j + "_" + _k).style.backgroundColor = "#cccccc";
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

		const mainSprite = document.getElementById("mainSprite");
		const currentNo = g_workObj.judgArrowCnt[_j];
		const stepDivHit = document.getElementById("stepHit" + _j);
		const judgArrow = document.getElementById("arrow" + _j + "_" + currentNo);

		const fcurrentNo = g_workObj.judgFrzCnt[_j];

		if (judgArrow !== null) {
			const difFrame = Number(judgArrow.getAttribute("cnt"));
			const difCnt = Math.abs(judgArrow.getAttribute("cnt"));
			const judgEndFlg = judgArrow.getAttribute("judgEndFlg");

			if (difCnt <= g_judgObj.arrowJ[C_JDG_UWAN] && judgEndFlg === "false") {
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
				stepDivHit.setAttribute("cnt", C_FRM_HITMOTION);

				mainSprite.removeChild(judgArrow);
				g_workObj.judgArrowCnt[_j]++;

				g_judgObj.lockFlgs[_j] = false;
				return;
			}
		}

		const judgFrz = document.getElementById("frz" + _j + "_" + fcurrentNo);

		if (judgFrz !== null) {
			const difCnt = Math.abs(judgFrz.getAttribute("cnt"));
			const judgEndFlg = judgFrz.getAttribute("judgEndFlg");

			if (difCnt <= g_judgObj.frzJ[C_JDG_SFSF] && judgEndFlg === "false") {
				changeHitFrz(_j, fcurrentNo);
				g_judgObj.lockFlgs[_j] = false;
				return;
			}
		}
		const stepDiv = document.getElementById("step" + _j);
		stepDiv.style.backgroundColor = "#66ffff";
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
	document.getElementById("lblLife").style.backgroundColor = lifeColor;
	document.getElementById("lblLife").innerHTML = Math.floor(g_workObj.lifeVal);
	document.getElementById("lifeBar").style.backgroundColor = lifeColor;
	document.getElementById("lifeBar").style.top = (50 + (g_sHeight - 100) * (C_VAL_MAXLIFE - g_workObj.lifeVal) / C_VAL_MAXLIFE) + "px";
	document.getElementById("lifeBar").style.height = ((g_sHeight - 100) * g_workObj.lifeVal / C_VAL_MAXLIFE) + "px";
}

function lifeDamage() {
	let lifeColor;
	g_workObj.lifeVal -= g_workObj.lifeDmg;
	if (g_workObj.lifeVal <= 0) {
		g_workObj.lifeVal = 0;
		if (g_workObj.lifeBorder === 0) {
			g_audio.pause();
			clearTimeout(g_timeoutEvtId);
			setTimeout(function () {
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
	document.getElementById("lblLife").style.backgroundColor = lifeColor;
	document.getElementById("lblLife").innerHTML = Math.floor(g_workObj.lifeVal);
	document.getElementById("lifeBar").style.backgroundColor = lifeColor;
	document.getElementById("lifeBar").style.top = (50 + (g_sHeight - 100) * (C_VAL_MAXLIFE - g_workObj.lifeVal) / C_VAL_MAXLIFE) + "px";
	document.getElementById("lifeBar").style.height = ((g_sHeight - 100) * g_workObj.lifeVal / C_VAL_MAXLIFE) + "px";
}

/**
 * 判定処理：イイ
 * @param {number} difFrame 
 */
function judgeIi(difFrame) {
	g_resultObj.ii++;
	g_currentArrows++;
	document.getElementById("charaJ").innerHTML = "<span style='color:" + C_CLR_II + "'>" + C_JCR_II + "</span>";
	document.getElementById("charaJ").setAttribute("cnt", C_FRM_JDGMOTION);

	document.getElementById("lblIi").innerHTML = g_resultObj.ii;
	if (++g_resultObj.combo > g_resultObj.maxCombo) {
		g_resultObj.maxCombo = g_resultObj.combo;
		document.getElementById("lblMCombo").innerHTML = g_resultObj.maxCombo;
	}
	document.getElementById("comboJ").innerHTML = g_resultObj.combo + " Combo!!";

	lifeRecovery();
	finishViewing();

	if (typeof customJudgeIi === "function") {
		customJudgeIi(difFrame);
		if (typeof customJudgeIi2 === "function") {
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
	document.getElementById("charaJ").innerHTML = "<span style='color:" + C_CLR_SHAKIN + "'>" + C_JCR_SHAKIN + "</span>";
	document.getElementById("charaJ").setAttribute("cnt", C_FRM_JDGMOTION);

	document.getElementById("lblShakin").innerHTML = g_resultObj.shakin;
	if (++g_resultObj.combo > g_resultObj.maxCombo) {
		g_resultObj.maxCombo = g_resultObj.combo;
		document.getElementById("lblMCombo").innerHTML = g_resultObj.maxCombo;
	}
	document.getElementById("comboJ").innerHTML = g_resultObj.combo + " Combo!!";

	lifeRecovery();
	finishViewing();

	if (typeof customJudgeShakin === "function") {
		customJudgeShakin(difFrame);
		if (typeof customJudgeShakin2 === "function") {
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
	document.getElementById("charaJ").innerHTML = "<span style='color:" + C_CLR_MATARI + "'>" + C_JCR_MATARI + "</span>";
	document.getElementById("charaJ").setAttribute("cnt", C_FRM_JDGMOTION);

	document.getElementById("lblMatari").innerHTML = g_resultObj.matari;
	document.getElementById("comboJ").innerHTML = "";

	finishViewing();

	if (typeof customJudgeMatari === "function") {
		customJudgeMatari(difFrame);
		if (typeof customJudgeMatari2 === "function") {
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
	document.getElementById("charaJ").innerHTML = "<span style='color:" + C_CLR_SHOBON + "'>" + C_JCR_SHOBON + "</span>";
	document.getElementById("charaJ").setAttribute("cnt", C_FRM_JDGMOTION);

	document.getElementById("lblShobon").innerHTML = g_resultObj.shobon;
	g_resultObj.combo = 0;
	document.getElementById("comboJ").innerHTML = "";

	lifeDamage();

	if (typeof customJudgeShobon === "function") {
		customJudgeShobon(difFrame);
		if (typeof customJudgeShobon2 === "function") {
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
	document.getElementById("charaJ").innerHTML = "<span style='color:" + C_CLR_UWAN + "'>" + C_JCR_UWAN + "</span>";
	document.getElementById("charaJ").setAttribute("cnt", C_FRM_JDGMOTION);

	document.getElementById("lblUwan").innerHTML = g_resultObj.uwan;
	g_resultObj.combo = 0;
	document.getElementById("comboJ").innerHTML = "";

	lifeDamage();

	if (typeof customJudgeUwan === "function") {
		customJudgeUwan(difFrame);
		if (typeof customJudgeUwan2 === "function") {
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
	document.getElementById("lblKita").innerHTML = g_resultObj.kita;
	document.getElementById("charaFJ").innerHTML = "<span style='color:" + C_CLR_KITA + "'>" + C_JCR_KITA + "</span>";
	document.getElementById("charaFJ").setAttribute("cnt", C_FRM_JDGMOTION);

	if (++g_resultObj.fCombo > g_resultObj.fmaxCombo) {
		g_resultObj.fmaxCombo = g_resultObj.fCombo;
		document.getElementById("lblFCombo").innerHTML = g_resultObj.fmaxCombo;
	}
	document.getElementById("comboFJ").innerHTML = g_resultObj.fCombo + " Combo!!";

	lifeRecovery();
	finishViewing();

	if (typeof customJudgeKita === "function") {
		customJudgeKita(difFrame);
		if (typeof customJudgeKita2 === "function") {
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
	document.getElementById("lblIknai").innerHTML = g_resultObj.iknai;
	document.getElementById("charaFJ").innerHTML = "<span style='color:" + C_CLR_IKNAI + "'>" + C_JCR_IKNAI + "</span>";
	document.getElementById("charaFJ").setAttribute("cnt", C_FRM_JDGMOTION);
	document.getElementById("comboFJ").innerHTML = "";
	g_resultObj.fCombo = 0;

	lifeDamage();

	if (typeof customJudgeIknai === "function") {
		customJudgeIknai(difFrame);
		if (typeof customJudgeIknai2 === "function") {
			customJudgeIknai2(difFrame);
		}
	}
}

function finishViewing() {
	if (g_currentArrows === g_allArrow + g_allFrz / 2) {
		if (g_headerObj.finishView !== C_DIS_NONE) {
			const fullArrows = g_allArrow + g_allFrz / 2;
			if (g_resultObj.ii + g_resultObj.kita === fullArrows) {
				document.getElementById("finishView").innerHTML = "<span style='color:#ffffff;'>All Perfect!!</span>";
				document.getElementById("finishView").style.opacity = 1;
				document.getElementById("charaJ").innerHTML = "";
				document.getElementById("comboJ").innerHTML = "";
				document.getElementById("charaFJ").innerHTML = "";
				document.getElementById("comboFJ").innerHTML = "";
			} else if (g_resultObj.ii + g_resultObj.shakin + g_resultObj.kita === fullArrows) {
				document.getElementById("finishView").innerHTML = "Perfect!!";
				document.getElementById("finishView").style.opacity = 1;
				document.getElementById("charaJ").innerHTML = "";
				document.getElementById("comboJ").innerHTML = "";
				document.getElementById("charaFJ").innerHTML = "";
				document.getElementById("comboFJ").innerHTML = "";
			} else if (g_resultObj.uwan === 0 && g_resultObj.shobon === 0 && g_resultObj.iknai === 0) {
				document.getElementById("finishView").innerHTML = "<span style='color:#66ffff;'>FullCombo!</span>";
				document.getElementById("finishView").style.opacity = 1;
				document.getElementById("charaJ").innerHTML = "";
				document.getElementById("comboJ").innerHTML = "";
				document.getElementById("charaFJ").innerHTML = "";
				document.getElementById("comboFJ").innerHTML = "";
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

	const divRoot = document.getElementById("divRoot");

	// タイトル文字描画
	const lblTitle = getTitleDivLabel("lblTitle",
		"<span style='color:#6666ff;font-size:40px;'>R</span>ESULT", 0, 15);
	divRoot.appendChild(lblTitle);

	const playDataWindow = createSprite("divRoot", "playDataWindow", g_sWidth / 2 - 225, 70, 450, 110);
	playDataWindow.style.border = "solid 0.5px #666666";
	const resultWindow = createSprite("divRoot", "resultWindow", g_sWidth / 2 - 150, 185, 300, 210);

	// スコア計算(一括)
	const scoreTmp = g_resultObj.ii * 8 +
		g_resultObj.shakin * 4 +
		g_resultObj.matari * 2 +
		g_resultObj.kita * 8 +
		g_resultObj.sfsf * 4 +
		g_resultObj.maxCombo * 2 +
		g_resultObj.fmaxCombo * 2;

	const allScore = (g_allArrow + g_allFrz / 2) * 10;
	const resultScore = Math.round(scoreTmp / allScore * 1000000);
	g_resultObj.score = resultScore;

	// ランク計算
	let rankMark = "";
	let rankColor = "";
	if (g_gameOverFlg) {
		rankMark = g_rankObj.rankMarkF;
		rankColor = g_rankObj.rankColorF;
	} else if (g_headerObj.startFrame === 0 && g_stateObj.auto === C_FLG_OFF) {
		if (g_resultObj.matari + g_resultObj.shobon + g_resultObj.uwan + g_resultObj.sfsf + g_resultObj.iknai === 0) {
			rankMark = g_rankObj.rankMarkPF;
			rankColor = g_rankObj.rankColorPF;
		} else {
			for (var j = 0, len = g_rankObj.rankRate.length; j < len; j++) {
				if (resultScore / 10000 >= g_rankObj.rankRate[j]) {
					rankMark = g_rankObj.rankMarks[j];
					rankColor = g_rankObj.rankColor[j];
					break;
				}
			}
			if (resultScore / 10000 < g_rankObj.rankRate[len - 1]) {
				rankMark = g_rankObj.rankMarkC;
				rankColor = g_rankObj.rankColorC;
			}
		}
	} else {
		rankMark = g_rankObj.rankMarkX;
		rankColor = g_rankObj.rankColorX;
	}

	// 曲名・オプション描画
	playDataWindow.appendChild(makeResultPlayData("lblMusic", 20, "#999999", 0,
		"Music", C_ALIGN_LEFT));
	playDataWindow.appendChild(makeResultPlayData("lblMusicData", 60, "#cccccc", 0,
		g_headerObj.musicTitle, C_ALIGN_CENTER));
	playDataWindow.appendChild(makeResultPlayData("lblDifficulty", 20, "#999999", 2,
		"Difficulty", C_ALIGN_LEFT));
	playDataWindow.appendChild(makeResultPlayData("lblDifData", 60, "#cccccc", 2,
		g_headerObj.keyLabels[g_stateObj.scoreId] + " key / " + g_headerObj.difLabels[g_stateObj.scoreId],
		C_ALIGN_CENTER));
	playDataWindow.appendChild(makeResultPlayData("lblStyle", 20, "#999999", 3,
		"Playstyle", C_ALIGN_LEFT));

	let playStyleData = "";
	playStyleData = g_stateObj.speed + "x";
	if (g_stateObj.motion !== C_FLG_OFF) {
		playStyleData += ", " + g_stateObj.motion;
	}
	if (g_stateObj.reverse !== C_FLG_OFF) {
		playStyleData += ", Reverse";
	}
	if (g_stateObj.lifeSetName !== "Original" && g_stateObj.lifeSetName !== "Normal") {
		playStyleData += ", " + g_stateObj.lifeSetName;
	}
	playDataWindow.appendChild(makeResultPlayData("lblStyleData", 60, "#cccccc", 3,
		playStyleData, C_ALIGN_CENTER));

	playDataWindow.appendChild(makeResultPlayData("lblDisplay", 20, "#999999", 4,
		"Display", C_ALIGN_LEFT));

	let displayData = "";
	if (g_stateObj.d_stepzone !== C_FLG_ON) {
		if (displayData !== "") {
			displayData += ", ";
		}
		displayData += "Step";
	}
	if (g_stateObj.d_judgement !== C_FLG_ON) {
		if (displayData !== "") {
			displayData += ", ";
		}
		displayData += "Judge";
	}
	if (g_stateObj.d_lifegauge !== C_FLG_ON) {
		if (displayData !== "") {
			displayData += ", ";
		}
		displayData += "Life";
	}
	if (g_stateObj.d_musicinfo !== C_FLG_ON) {
		if (displayData !== "") {
			displayData += ", ";
		}
		displayData += "MusicInfo";
	}
	if (displayData === "") {
		displayData = "All Visible";
	} else {
		displayData += " : OFF";
	}
	playDataWindow.appendChild(makeResultPlayData("lblDisplayData", 60, "#cccccc", 4,
		displayData, C_ALIGN_CENTER));

	let display2Data = "";
	if (g_stateObj.d_speed !== C_FLG_ON) {
		if (display2Data !== "") {
			display2Data += ", ";
		}
		display2Data += "Speed";
	}
	if (g_stateObj.d_color !== C_FLG_ON) {
		if (display2Data !== "") {
			display2Data += ", ";
		}
		display2Data += "Color";
	}
	if (g_stateObj.d_lyrics !== C_FLG_ON) {
		if (display2Data !== "") {
			display2Data += ", ";
		}
		display2Data += "Lyrics";
	}
	if (g_stateObj.d_background !== C_FLG_ON) {
		if (display2Data !== "") {
			display2Data += ", ";
		}
		display2Data += "Background";
	}
	if (display2Data !== "") {
		display2Data += " : OFF";
	}
	playDataWindow.appendChild(makeResultPlayData("lblDisplayData", 60, "#cccccc", 5,
		display2Data, C_ALIGN_CENTER));

	// キャラクタ描画
	resultWindow.appendChild(makeResultSymbol("lblIi", 0, C_CLR_II, 0, C_JCR_II, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol("lblShakin", 0, C_CLR_SHAKIN, 1, C_JCR_SHAKIN, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol("lblMatari", 0, C_CLR_MATARI, 2, C_JCR_MATARI, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol("lblShobon", 0, C_CLR_SHOBON, 3, C_JCR_SHOBON, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol("lblUwan", 0, C_CLR_UWAN, 4, C_JCR_UWAN, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol("lblKita", 0, C_CLR_KITA, 5, C_JCR_KITA, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol("lblIknai", 0, C_CLR_IKNAI, 6, C_JCR_IKNAI, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol("lblMCombo", 0, "#ffffff", 7, "MaxCombo", C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol("lblFCombo", 0, "#ffffff", 8, "FreezeCombo", C_ALIGN_LEFT));

	resultWindow.appendChild(makeResultSymbol("lblScore", 0, "#ffffff", 10, "Score", C_ALIGN_LEFT));

	// スコア描画
	resultWindow.appendChild(makeResultSymbol("lblIiS", 130, "#ffffff", 0, g_resultObj.ii, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol("lblShakinS", 130, "#ffffff", 1, g_resultObj.shakin, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol("lblMatariS", 130, "#ffffff", 2, g_resultObj.matari, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol("lblShobonS", 130, "#ffffff", 3, g_resultObj.shobon, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol("lblUwanS", 130, "#ffffff", 4, g_resultObj.uwan, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol("lblKitaS", 130, "#ffffff", 5, g_resultObj.kita, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol("lblIknaiS", 130, "#ffffff", 6, g_resultObj.iknai, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol("lblMComboS", 130, "#ffffff", 7, g_resultObj.maxCombo, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol("lblFComboS", 130, "#ffffff", 8, g_resultObj.fmaxCombo, C_ALIGN_RIGHT));

	resultWindow.appendChild(makeResultSymbol("lblScoreS", 130, "#ffffff", 10, g_resultObj.score, C_ALIGN_RIGHT));

	// ランク描画
	const lblRank = createDivCustomLabel("lblRank", 300, 160, 70, 20, 50, "#ffffff",
		"<span style='color:" + rankColor + ";'>" + rankMark + "</span>", "'Bookman Old Style', 'Meiryo UI', sans-serif");
	lblRank.style.textAlign = C_ALIGN_CENTER;
	resultWindow.appendChild(lblRank);

	// ユーザカスタムイベント(初期)
	if (typeof customResultInit === "function") {
		customResultInit();
		if (typeof customResultInit2 === "function") {
			customResultInit2();
		}
	}

	// Twitter用リザルト
	let hashTag;
	if (g_headerObj.hashTag !== undefined) {
		hashTag = " " + g_headerObj.hashTag;
	} else {
		hashTag = "";
	}
	const tweetResultTmp = "【#danoni" + hashTag + "】" + g_headerObj.musicTitle + "(" +
		g_headerObj.keyLabels[g_stateObj.scoreId] + "k-" + g_headerObj.difLabels[g_stateObj.scoreId] + ")/" +
		g_headerObj.tuning + "/" +
		"Rank:" + rankMark + "/" +
		"Score:" + g_resultObj.score + "/" +
		"Playstyle:" + playStyleData + "/" +
		g_resultObj.ii + "-" + g_resultObj.shakin + "-" + g_resultObj.matari + "-" + g_resultObj.shobon + "-" + g_resultObj.uwan + "/" +
		g_resultObj.kita + "-" + g_resultObj.iknai + "/" +
		g_resultObj.maxCombo + "-" + g_resultObj.fmaxCombo + " " +
		location.href;
	const tweetResult = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(tweetResultTmp);


	// Cleared & Failed表示
	const lblResultPre = createDivLabel("lblResultPre", g_sWidth / 2 - 150, g_sHeight / 2 - 160,
		200, 50, 60, "#ffff66",
		"<span style='font-size:80px'>C</span>LEARED!");
	divRoot.appendChild(lblResultPre);
	lblResultPre.style.opacity = 0;

	const fullArrows = g_allArrow + g_allFrz / 2;
	let resultFlgTmp = "";
	if (g_resultObj.ii + g_resultObj.kita === fullArrows) {
		resultFlgTmp = "<span style='color:#ffffff;'>All Perfect!!</span>";
	} else if (g_resultObj.ii + g_resultObj.shakin + g_resultObj.kita === fullArrows) {
		resultFlgTmp = "<span style='color:#ffffcc;'>Perfect!!</span>";
	} else if (g_resultObj.uwan === 0 && g_resultObj.shobon === 0 && g_resultObj.iknai === 0) {
		resultFlgTmp = "<span style='color:#66ffff;'>FullCombo!</span>";
	} else {
		resultFlgTmp = "CLEARED!";
	}

	const lblResultPre2 = createDivLabel("lblResultPre", g_sWidth / 2 + 50, 40,
		200, 30, 20, "#ffff66", resultFlgTmp);
	divRoot.appendChild(lblResultPre2);

	if (!g_gameOverFlg) {
		lblResultPre.style.animationDuration = "2.5s";
		lblResultPre.style.animationName = "leftToRightFade";
	} else {
		lblResultPre.style.animationDuration = "3s";
		lblResultPre.innerHTML = "<span style='color:#ff6666;'><span style='font-size:80px;'>F</span>AILED...</span>";
		lblResultPre.style.animationName = "upToDownFade";

		lblResultPre2.innerHTML = "<span style='color:#ff6666;'>FAILED...</span>";
	}

	// プレイデータは Cleared & Failed に合わせて表示
	playDataWindow.style.animationDuration = "3s";
	playDataWindow.style.animationName = "slowlyAppearing";


	// 戻るボタン描画
	const btnBack = createButton({
		id: "btnBack",
		name: "Back",
		x: 0,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_BACK,
		align: C_ALIGN_CENTER
	}, function () {
		// タイトル画面へ戻る
		g_audio.pause();
		clearTimeout(g_timeoutEvtId);
		clearWindow();
		titleInit();
	});
	divRoot.appendChild(btnBack);

	// Tweetボタン描画
	const btnTweet = createButton({
		id: "btnTweet",
		name: "Tweet",
		x: g_sWidth / 3,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_TWEET,
		align: C_ALIGN_CENTER
	}, function () {
		window.open(tweetResult, '_blank');
	});
	divRoot.appendChild(btnTweet);

	// リトライボタン描画
	const btnRetry = createButton({
		id: "btnRetry",
		name: "Retry",
		x: g_sWidth / 3 * 2,
		y: g_sHeight - 100,
		width: g_sWidth / 3,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_RESET,
		align: C_ALIGN_CENTER
	}, function () {
		g_audio.pause();
		clearTimeout(g_timeoutEvtId);
		clearWindow();
		g_audio.load();

		if (g_audio.readyState === 4) {
			// audioの読み込みが終わった後の処理
			g_gameOverFlg = false;
			loadingScoreInit();
		} else {
			// 読込中の状態
			g_audio.addEventListener('canplaythrough', (function () {
				return function f() {
					g_audio.removeEventListener('canplaythrough', f, false);
					loadingScoreInit();
				}
			})(), false);
		}
	});
	divRoot.appendChild(btnRetry);

	// キー操作イベント（デフォルト）
	document.onkeydown = function (evt) {
		// ブラウザ判定
		let setKey;
		if (g_userAgent.indexOf("firefox") !== -1) {
			setKey = evt.which;
		} else {
			setKey = event.keyCode;
		}
		for (var j = 0; j < C_BLOCK_KEYS.length; j++) {
			if (setKey === C_BLOCK_KEYS[j]) {
				return false;
			}
		}
	}
	document.onkeyup = function (evt) {
	}
	if (g_headerObj.fadeFrame !== undefined && g_headerObj.fadeFrame !== "") {
		if (isNaN(parseInt(g_headerObj.fadeFrame[g_stateObj.scoreId]))) {
		} else {
			g_timeoutEvtId = setInterval("resultFadeOut()", 1000 / 60);
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
