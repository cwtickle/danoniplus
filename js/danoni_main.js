'use strict';
/**
 * Dancing☆Onigiri (CW Edition)
 * 
 * Source by tickle
 * Created : 2018/10/08
 * Revised : 2018/11/13
 * 
 * https://github.com/cwtickle/danoniplus
 */
var g_version = "Ver 0.63.1";

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
 * ▽ レイヤーの考え方
 *  [マスク]-[メイン]-[背景]の3層を想定。
 *  ここで指定するものは基本的に中間の[メイン]に配置する。
 *  [背景]や[マスク]層はカスタムしやすいようにする予定。
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
var C_ALIGN_LEFT = "left";
var C_ALIGN_CENTER = "center";
var C_ALIGN_RIGHT = "right";
var C_VALIGN_TOP = "top";
var C_VALIGN_MIDDLE = "middle";
var C_VALIGN_BOTTOM = "bottom";

// ユーザインタフェース
var C_CLR_DEFAULT = "#333333";
var C_CLR_DEFHOVER = "#666666";
var C_CLR_BACK = "#000033";
var C_CLR_NEXT = "#330000";
var C_CLR_SETTING = "#333300";
var C_CLR_RESET = "#003300";
var C_CLR_TWEET = "#003333";
var C_CLR_TEXT = "#ffffff";
var C_CLR_TITLE = "#cccccc";

var C_LBL_TITLESIZE = 32;
var C_LBL_BTNSIZE = 28;
var C_LBL_LNKSIZE = 16;
var C_LBL_BASICFONT = "'Meiryo UI', sans-serif";

var C_CLR_LNK = "#111111";
var C_BTN_HEIGHT = 50;
var C_LNK_HEIGHT = 20;

// スプライト（ムービークリップ相当）のルート
var C_SPRITE_ROOT = "divRoot";

// 画像ファイル
var C_IMG_ARROW = "../img/arrow_500.png";
var C_IMG_ONIGIRI = "../img/onigiri_600.png";
var C_IMG_GIKO = "../img/giko_600.png";
var C_IMG_IYO = "../img/iyo_600.png";
var C_IMG_C = "../img/c_600.png";
var C_IMG_MORARA = "../img/morara_600.png";
var C_IMG_MONAR = "../img/monar_600.png";

// Motionオプション配列の基準位置
var C_MOTION_STD_POS = 15;

// キーブロック対象(キーコードを指定)
var C_BLOCK_KEYS = [
	8, 9, 13, 17, 18, 32, /* BackSpace, Tab, Enter, Ctrl, Alt, Space */
	37, 38, 39, 40, 46,   /* Left, Down, Up, Right, Delete */
	112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126 /* F1～F15 */
];

// 譜面データ持ち回り用
var g_rootObj = {};
var g_headerObj = {};
var g_scoreObj = {};
var g_stateObj = {
	scoreId: 0,
	speed: 3.5,
	motion: "OFF",
	reverse: "OFF",
	auto: "OFF",
	adjustment: 0,
	fadein: 0,
	volume: 100
};

var g_volumes = [100, 75, 50, 25, 10, 5, 2, 1, 0.5, 0.25, 0];
var g_volumeNum = 0;

// サイズ(後で指定)
var g_sWidth;
var g_sHeight;

// ステップゾーン位置、到達距離(後で指定)
var C_STEP_Y = 70;
var g_stepY;
var g_distY;

// キーコンフィグカーソル
var g_currentj = 0;
var g_currentk = 0;
var g_prevKey = -1;

// キーコード
var g_kCd = new Array();
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
var g_keyObj = {

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

	dummy: 0	// ダミー(カンマ抜け落ち防止)
};

/** 設定・オプション画面用共通 */
var C_LEN_SETLBL_LEFT = 140;
var C_LEN_SETLBL_WIDTH = 250;
var C_LEN_SETLBL_HEIGHT = 25;
var C_SIZ_SETLBL = 18;
var C_LEN_SETDIFLBL_HEIGHT = 25;
var C_SIZ_SETDIFLBL = 18;
var C_LEN_SETMINI_WIDTH = 40;
var C_SIZ_SETMINI = 18;

var C_LBL_SETMINIL = "<";
var C_LEN_SETMINIL_LEFT = C_LEN_SETLBL_LEFT - C_LEN_SETMINI_WIDTH / 2;
var C_LBL_SETMINILL = "<";
var C_LEN_SETMINILL_LEFT = C_LEN_SETMINIL_LEFT + C_LEN_SETMINI_WIDTH;
var C_LBL_SETMINIR = ">";
var C_LBL_SETMINIRR = ">";
var C_LEN_SETMINIR_LEFT = C_LEN_SETLBL_LEFT + C_LEN_SETLBL_WIDTH - C_LEN_SETMINI_WIDTH / 2;
var C_LEN_SETMINIRR_LEFT = C_LEN_SETMINIR_LEFT - C_LEN_SETMINI_WIDTH;

/** キーコンフィグ設定 */
var g_kcType = "Main";

/** メイン画面用共通オブジェクト */
var g_workObj = {};
g_workObj.stepX = new Array();
g_workObj.stepRtn = new Array();
g_workObj.keyCtrl = new Array();
g_workObj.keyHitFlg = new Array();
g_workObj.scrollDir = new Array();
g_workObj.dividePos = new Array();

var C_FRM_AFTERFADE = 420;

/** 判定系共通オブジェクト */
var g_judgObj = {
	arrowJ: [2, 4, 6, 8],
	frzJ: [2, 4, 8]
};
var C_JDG_II = 0;
var C_JDG_SHAKIN = 1;
var C_JDG_MATARI = 2;
var C_JDG_UWAN = 3;
var C_JDG_KITA = 0;
var C_JDG_SFSF = 1;
var C_JDG_IKNAI = 2;

var C_JCR_II = "(・∀・)ｲｲ!!";
var C_JCR_SHAKIN = "(`・ω・)ｼｬｷﾝ";
var C_JCR_MATARI = "( ´∀`)ﾏﾀｰﾘ";
var C_JCR_UWAN = "( `Д´)ｳﾜｧﾝ!!";
var C_JCR_KITA = "(ﾟ∀ﾟ)ｷﾀ-!!";
var C_JCR_SFSF = "";
var C_JCR_IKNAI = "(・A・)ｲｸﾅｲ";

var C_CLR_II = "#66ffff";
var C_CLR_SHAKIN = "#99ff99";
var C_CLR_MATARI = "#ff9966";
var C_CLR_UWAN = "#ff9999";
var C_CLR_KITA = "#ffff99";
var C_CLR_SFSF = "";
var C_CLR_IKNAI = "#99ff66";

var C_LEN_JDGCHARA_WIDTH = 200;
var C_LEN_JDGCHARA_HEIGHT = 20;
var C_SIZ_JDGCHARA = 20;

var C_LEN_JDGCNTS_WIDTH = 100;
var C_LEN_JDGCNTS_HEIGHT = 20;
var C_SIZ_JDGCNTS = 16;

var C_FRM_HITMOTION = 4;
var C_FRM_JDGMOTION = 60;

/** 結果画面用共通オブジェクト */
var g_resultObj = {
	ii: 0,
	shakin: 0,
	matari: 0,
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

var g_allArrow = 0;
var g_allFrz = 0;
var g_currentArrows = 0;
var g_rankObj = {
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

var g_gameOverFlg = false;

var g_userAgent = window.navigator.userAgent.toLowerCase(); // msie, edge, chrome, safari, firefox, opera

var g_audio = new Audio();
var g_timeoutEvtId = 0;
var g_inputKeyBuffer = new Array();

// 歌詞制御
var g_wordObj = {
	wordDir: 0,
	wordDat: "",
	fadeInFlg0: false,
	fadeInFlg1: false,
	fadeOutFlg0: false,
	fadeOutFlg1: false
};
var g_wordSprite;

/** 
 * メッセージ定義 
 * - 変数名は "C_MSG_X_YYYY" の形で、末尾に (X-YYYY) をつける。
 * - 記述不正の場合、書き方を2行目に指定すると親切。
*/
var C_MSG_W_0001 = "お使いのブラウザは動作保証外です。<br>" +
	"Chrome/Opera/Vivaldiなど、WebKit系ブラウザの利用を推奨します。(W-0001)";
var C_MSG_E_0011 = "アーティスト名が未入力です。(E-0011)";
var C_MSG_E_0012 = "曲名情報が未設定です。(E-0012)<br>" +
	"|musicTitle=曲名,アーティスト名,アーティストURL|";
var C_MSG_E_0021 = "譜面情報が未指定か、フォーマットが間違っています。(E-0021)<br>" +
	"|difData=キー数,譜面名,初期速度|";
var C_MSG_E_0031 = "楽曲ファイルが未指定か、フォーマットが間違っています。(E-0031)<br>" +
	"|musicUrl=****.mp3|";

var C_MSG_E_0101 = "新しいキー:{0}の[color]が未定義です。(E-0101)<br>" +
	"|color{0}=0,1,0,1,0,2|";
var C_MSG_E_0102 = "新しいキー:{0}の[chara]が未定義です。(E-0102)<br>" +
	"|chara{0}=arrowA,arrowB,arrowC,arrowD,arrowE,arrowF|";
var C_MSG_E_0103 = "新しいキー:{0}の[stepRtn]が未定義です。(E-0103)<br>" +
	"|stepRtn{0}=0,45,-90,135,180,onigiri|";
var C_MSG_E_0104 = "新しいキー:{0}の[keyCtrl]が未定義です。(E-0104)<br>" +
	"|keyCtrl{0}=75,79,76,80,187,32/0|";

/**
 * イベントハンドラ用オブジェクト
 * 参考: http://webkatu.com/remove-eventlistener/
 * 
 * - イベントリスナー作成時にリスナーキー(key)を発行する
 * - 削除時は発行したリスナーキーを指定して削除する
 */
var g_handler = (function () {
	var events = {},
		key = 0;

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
				var e = events[key];
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
	if (_checkStr == undefined && _checkStr != "") {
		return _defaultStr;
	}

	if (_type == "float") {
		// 数値型(小数可)の場合
		var isNaNflg = isNaN(parseFloat(_checkStr));
		return (isNaNflg == true ? _defaultStr : parseFloat(_checkStr));

	} else if (_type == "number") {
		// 数値型(整数のみ)の場合
		var isNaNflg = isNaN(parseInt(_checkStr));
		return (isNaNflg == true ? _defaultStr : parseInt(_checkStr));

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
	if (_checkArray == undefined || _checkArray == "") {
		return false;
	}

	// 配列かどうかをチェック
	if (Object.prototype.toString.call(_checkArray) != "[object Array]") {
		return false;
	}

	// 最小配列長が不正の場合は強制的に1を設定
	if (isNaN(parseFloat(_minLength))) {
		_minLength = 1;
	}
	if (_type == "float") {
		// 数値型(小数可)の場合
		var isNaNflg = isNaN(parseFloat(_checkArray[0]));
		if (isNaNflg == true) {
			return false;
		}
	} else if (_type == "number") {
		// 数値型(整数のみ)の場合
		var isNaNflg = isNaN(parseInt(_checkArray[0]));
		if (isNaNflg == true) {
			return false;
		}
	}

	// 配列長のチェック
	return (_checkArray.length >= _minLength ? true : false);
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
	var div = document.createElement("div");

	div.id = _id;
	var style = div.style;
	style.left = _x + "px";
	style.top = _y + "px";
	style.width = _width + "px";
	style.height = _height + "px";
	style.position = "absolute";

	style.userSelect = "none";
	style.webkitUserSelect = "none";
	style.msUserSelect = "none";
	style.mozUserSelect = "none";
	style.khtmlUserSelect = "none";
	style.webkitTouchCallout = "none";

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
	var div = createDiv(_id, _x, _y, _width, _height);
	var style = div.style;
	style.fontSize = _fontsize + "px";
	style.color = _color;
	style.fontFamily = C_LBL_BASICFONT;
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
	var div = createDiv(_id, _x, _y, _width, _height);
	var style = div.style;
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
	var div = createDiv(_id, _x, _y, _width, _height);
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
	if (isNaN(Number(_rotate))) {
		var rotate = 0;
		var charaStyle = _rotate;
		var charaImg = eval("C_IMG_" + _rotate.toUpperCase());
		var sizeX = _size;
	} else {
		var rotate = _rotate;
		var charaStyle = "arrow";
		var charaImg = C_IMG_ARROW;
		var sizeX = _size;
	}

	var div = createDiv(_id, _x, _y, sizeX, _size);
	div.align = C_ALIGN_CENTER;

	// IE/Edgeの場合は色なし版を表示
	if (g_userAgent.indexOf('msie') != -1 ||
		g_userAgent.indexOf('trident') != -1 ||
		g_userAgent.indexOf('edge') != -1) {
		div.innerHTML = "<img src='" + charaImg +
			"' style='width:" + sizeX + "px;height:" + _size +
			"px;transform:rotate(" + rotate + "deg);' id=" + _id + "img>";

		// それ以外は指定された色でマスク
	} else {
		if (_color != "") {
			div.style.backgroundColor = _color;
		}
		div.className = charaStyle;
		div.style.transform = "rotate(" + rotate + "deg)";
	}
	div.setAttribute("color", _color);

	return div;
}

function createColorObject(_id, _color, _x, _y, _width, _height,
	_rotate, _styleName, _imgName) {

	var div = createDiv(_id, _x, _y, _width, _height);

	// 矢印・おにぎり判定
	if (isNaN(Number(_rotate))) {
		var rotate = 0;
		var charaStyle = _rotate + _styleName;
		var charaImg = eval("C_IMG_" + _rotate.toUpperCase());
		div.setAttribute("type", "AA");
	} else {
		var rotate = _rotate;
		var charaStyle = _styleName;
		var charaImg = _imgName;
		div.setAttribute("type", "arrow");
	}
	div.align = C_ALIGN_CENTER;

	// IE/Edgeの場合は色なし版を表示
	if (g_userAgent.indexOf('msie') != -1 ||
		g_userAgent.indexOf('trident') != -1 ||
		g_userAgent.indexOf('edge') != -1) {
		div.innerHTML = "<img src='" + charaImg +
			"' style='width:" + _width + "px;height:" + _height +
			"px;transform:rotate(" + rotate + "deg);' id=" + _id + "img>";

		// それ以外は指定された色でマスク
	} else {
		if (_color != "") {
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
	if (document.getElementById(_newObjName) == null) {
		var parentsprite = document.getElementById(_parentObjName);
		var newsprite = createDiv(_newObjName, _x, _y, _width, _height);
		parentsprite.appendChild(newsprite);
	} else {
		var newsprite = document.getElementById(_newObjName);
	}
	return newsprite;
}

/**
 * 親スプライト配下の子スプライトを全削除
 * @param {object} _parentObjName 親スプライト名
 */
function deleteChildspriteAll(_parentObjName) {

	var parentsprite = document.getElementById(_parentObjName);
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
 *		var btnBack = createButton({
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
	var div = createDiv(_obj.id, _obj.x, _obj.y, _obj.width, _obj.height);

	// ボタンの装飾を定義
	var style = div.style;
	div.innerHTML = _obj.name;
	style.textAlign = _obj.align;
	style.verticalAlign = C_VALIGN_MIDDLE;
	style.color = C_CLR_TEXT;
	style.fontSize = _obj.fontsize + "px";
	style.fontFamily = C_LBL_BASICFONT;
	style.backgroundColor = _obj.normalColor;
	style.transition = "background-color 0.25s linear";

	// オンマウス・タップ時の挙動 (背景色変更、カーソル変化)
	div.onmouseover = function () {
		style.backgroundColor = _obj.hoverColor;
		style.cursor = "pointer";
	}
	var lsnrkeyTS = g_handler.addListener(div, "touchstart", function () {
		style.backgroundColor = _obj.hoverColor;
		style.cursor = "pointer";
	}, false);

	// 通常時の挙動 (背景色変更、カーソル変化)
	div.onmouseout = function () {
		style.backgroundColor = _obj.normalColor;
		style.cursor = "default";
	}
	var lsnrkeyTE = g_handler.addListener(div, "touchend", function () {
		style.backgroundColor = _obj.normalColor;
		style.cursor = "default";
	}, false);

	// ボタンを押したときの動作
	var lsnrkey = g_handler.addListener(div, "click", function () {
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
	var div = createDivLabel(_id, _x, _y, g_sWidth, 50, C_LBL_BTNSIZE, C_CLR_TITLE, _titlename);
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
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");
	var layer1 = document.getElementById("layer1");
	var l1ctx = layer1.getContext("2d");
	var layer2 = document.getElementById("layer2");
	var l2ctx = layer2.getContext("2d");
	g_sWidth = layer0.width;
	g_sHeight = layer0.height;
	var C_MARGIN = 0;

	// 線画、図形をクリア
	l0ctx.clearRect(0, 0, g_sWidth, g_sHeight);
	l1ctx.clearRect(0, 0, g_sWidth, g_sHeight);
	l2ctx.clearRect(0, 0, g_sWidth, g_sHeight);

	// ボタン、オブジェクトをクリア (divRoot配下のもの)
	var divRoot = document.getElementById("divRoot");
	while (divRoot.hasChildNodes()) {
		/*
		alert(divRoot.firstChild.getAttribute("lsnrkey"));
		*/
		g_handler.removeListener(divRoot.firstChild.getAttribute("lsnrkey"));
		g_handler.removeListener(divRoot.firstChild.getAttribute("lsnrkeyTS"));
		g_handler.removeListener(divRoot.firstChild.getAttribute("lsnrkeyTE"));
		divRoot.removeChild(divRoot.firstChild);
	}

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

function loadScript(url, callback) {
	var script = document.createElement("script");
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

	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");
	g_sWidth = layer0.width;
	g_sHeight = layer0.height;

	if (document.getElementById("divRoot") == null) {
		var stage = document.getElementById("canvas-frame");
		var divRoot = createDiv("divRoot", 0, 0, g_sWidth, g_sHeight);
		stage.appendChild(divRoot);
		clearWindow();
	} else {
		var divRoot = document.getElementById("divRoot");
	}

	// 譜面データの読み込み
	var dos = document.getElementById("dos").value;
	g_rootObj = dosConvert(dos);
	g_headerObj = headerConvert(g_rootObj);
	keysConvert(g_rootObj);

	g_keyObj.currentKey = g_headerObj["keyLabels"][g_stateObj.scoreId];
	g_keyObj.currentPtn = 0;

	loadScript("../js/" + g_headerObj.customjs, function () {
		titleInit();
	});
}

/**
 *  タイトル画面初期化
 */
function titleInit() {

	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");
	var layer1 = document.getElementById("layer1");
	var l1ctx = layer1.getContext("2d");
	var layer2 = document.getElementById("layer2");
	var l2ctx = layer2.getContext("2d");
	g_sWidth = layer0.width;
	g_sHeight = layer0.height;

	var divRoot = document.getElementById("divRoot");

	// ユーザカスタムイベント(初期)
	if (typeof customTitleInit == "function") {
		customTitleInit();
	}

	// タイトル文字描画
	var lblTitle = getTitleDivLabel("lblTitle",
		"<span style='color:#6666ff;font-size:40px;'>D</span>ANCING<span style='color:#ffff66;font-size:40px;'>☆</span><span style='color:#ff6666;font-size:40px;'>O</span>NIGIRI", 0, 15);
	lblTitle.style.zIndex = 1;
	divRoot.appendChild(lblTitle);

	// ブラウザチェック
	if (g_userAgent.indexOf('msie') != -1 ||
		g_userAgent.indexOf('trident') != -1 ||
		g_userAgent.indexOf('edge') != -1 ||
		g_userAgent.indexOf('firefox') != -1) {

		makeWarningWindow(C_MSG_W_0001);
	}

	// オーディオファイル指定
	g_audio.src = "../" + g_headerObj.musicFolder + "/" + g_headerObj.musicUrl;

	// ボタン描画
	var btnStart = createButton({
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
	btnStart.style.zIndex = 1;
	divRoot.appendChild(btnStart);

	// 製作者表示
	var lnkMaker = createButton({
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
	var lnkArtist = createButton({
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
	var lnkVersion = createButton({
		id: "lnkVersion",
		name: "&copy; 2018 ティックル, CW " + g_version,
		x: g_sWidth / 2,
		y: g_sHeight - 20,
		width: g_sWidth / 2 - 10,
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
		if (g_userAgent.indexOf("firefox") != -1) {
			var setKey = evt.which;
		} else {
			var setKey = event.keyCode;
		}
		if (setKey == 13) {
			clearWindow();
			optionInit();
		}
		for (var j = 0; j < C_BLOCK_KEYS.length; j++) {
			if (setKey == C_BLOCK_KEYS[j]) {
				return false;
			}
		}
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
	var lblWarning;
	if (document.getElementById("lblWarning") == null) {
		lblWarning = getTitleDivLabel("lblWarning", "<p>" + _text + "</p>", 0, 70);
		lblWarning.style.backgroundColor = "#ffcccc";
		lblWarning.style.opacity = 0.9;
	} else {
		lblWarning = document.getElementById("lblWarning");
		lblWarning.innerHTML += "<p>" + _text + "</p>";
	}
	var len = lblWarning.innerHTML.split("<br>").length + lblWarning.innerHTML.split("<p>").length - 1;
	var warnHeight = 21 * len;
	lblWarning.style.height = warnHeight + "px";
	lblWarning.style.lineHeight = "15px";
	lblWarning.style.fontSize = "14px";
	lblWarning.style.color = "#660000";
	lblWarning.style.textAlign = C_ALIGN_LEFT;
	lblWarning.style.fontFamily = C_LBL_BASICFONT;

	divRoot.appendChild(lblWarning);
}

/**
 * 譜面データを分割して値を取得
 * @param {string} _dos 譜面データ
 */
function dosConvert(_dos) {

	var obj = {};
	var paramsTmp = _dos.split("&").join("|");
	var params = paramsTmp.split("|");
	for (var j = 0; j < params.length; j++) {
		var pos = params[j].indexOf("=");
		if (pos > 0) {
			var pKey = params[j].substring(0, pos);
			var pValue = params[j].substring(pos + 1);
			if (pKey != undefined) {
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
	var obj = {};

	// 曲名
	if (_dosObj.musicTitle != undefined && _dosObj.musicTitle != "") {
		var musics = _dosObj.musicTitle.split(",");
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
	if (_dosObj.difData != undefined && _dosObj.difData != "") {
		var difs = _dosObj.difData.split("$");
		obj.keyLabels = new Array();
		obj.difLabels = new Array();
		obj.initSpeeds = new Array();
		for (var j = 0; j < difs.length; j++) {
			var difDetails = difs[j].split(",");
			obj.keyLabels.push(setVal(difDetails[0], "7", "string"));
			obj.difLabels.push(setVal(difDetails[1], "Normal", "string"));
			obj.initSpeeds.push(setVal(difDetails[2], 3.5, "float"));
		}
	} else {
		makeWarningWindow(C_MSG_E_0021);
		obj.keyLabels = ["7"];
		obj.difLabels = ["Normal"];
		obj.initSpeeds = [3.5];
	}
	if (obj.initSpeeds[0] != undefined) {
		g_stateObj.speed = obj.initSpeeds[0];
	}

	// 初期色情報
	obj.setColorInit = ["#cccccc", "#9999ff", "#ffffff", "#ffff99", "#99ff99"];

	if (_dosObj.setColor != undefined && _dosObj.setColor != "") {
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
	obj.frzColorInit = ["#66ffff", "#6600ff", "#ffff66", "#ffff99"];
	obj.frzColor = new Array();
	obj.frzColorDef = new Array();

	if (_dosObj.frzColor != undefined && _dosObj.frzColor != "") {
		var tmpFrzColors = _dosObj.frzColor.split("$");
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
	if (_dosObj.tuning != undefined && _dosObj.tuning != "") {
		var tunings = _dosObj.tuning.split(",");
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
	if (_dosObj.startFrame != undefined) {
		obj.startFrame = parseInt(_dosObj.startFrame);
	} else {
		obj.startFrame = 0;
	}

	// フェードアウトフレーム数(譜面別)
	if (_dosObj.fadeFrame != undefined) {
		obj.fadeFrame = _dosObj.fadeFrame.split("$");
	}

	// 終了フレーム数
	if (setVal(_dosObj.endFrame, 0, "number") != 0) {
		obj.endFrame = parseInt(_dosObj.endFrame / 60) * 60;
	}

	// 外部jsファイルの指定
	obj.customjs = setVal(_dosObj.customjs, "danoni_custom.js", "string");

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
	if (_dosObj.musicUrl != undefined) {
		obj.musicUrl = _dosObj.musicUrl;
	} else {
		makeWarningWindow(C_MSG_E_0031);
	}

	// hashTag
	if (_dosObj.hashTag != undefined) {
		obj.hashTag = _dosObj.hashTag;
	}
	// TODO:フリーズアロー色など他のヘッダー情報の分解

	return obj;
}

/**
 * 一時的な追加キーの設定
 * @param {object} _dosObj 
 */
function keysConvert(_dosObj) {

	var newKey = "";

	if (_dosObj.keyExtraList != undefined) {
		var keyExtraList = _dosObj.keyExtraList.split(",");
		var tmpKeyCtrl = new Array();
		var tmpKeyPtn = new Array();
		var tmpMinPatterns = 1;

		for (var j = 0; j < keyExtraList.length; j++) {
			newKey = keyExtraList[j];

			if (_dosObj["color" + newKey] != undefined) {
				var tmpColors = _dosObj["color" + newKey].split("$");
				if (checkArrayVal(tmpColors, "string", 1)) {
					for (var k = 0, len = tmpColors.length; k < len; k++) {
						g_keyObj["color" + newKey + "_" + k] = tmpColors[k].split(",");
					}
					tmpMinPatterns = tmpColors.length;
				}
			} else {
				makeWarningWindow(C_MSG_E_0101.split("{0}").join(newKey));
			}

			if (_dosObj["chara" + newKey] != undefined) {
				var tmpCharas = _dosObj["chara" + newKey].split("$");
				if (checkArrayVal(tmpCharas, "string", 1)) {
					for (var k = 0, len = tmpCharas.length; k < len; k++) {
						g_keyObj["chara" + newKey + "_" + k] = tmpCharas[k].split(",");
						g_keyObj["chara" + newKey + "_" + k + "d"] = tmpCharas[k].split(",");
					}
				}
			} else {
				makeWarningWindow(C_MSG_E_0102.split("{0}").join(newKey));
			}

			if (_dosObj["div" + newKey] != undefined) {
				var tmpDivs = _dosObj["div" + newKey].split("$");
				if (checkArrayVal(tmpDivs, "string", 1)) {
					for (var k = 0, len = tmpDivs.length; k < len; k++) {
						if (isNaN(Number(tmpDivs[k]))) {
							g_keyObj["div" + newKey + "_" + k] = minLength;
						} else {
							g_keyObj["div" + newKey + "_" + k] = tmpDivs[k];
						}
					}
				}
			}

			if (_dosObj["stepRtn" + newKey] != undefined) {
				var tmpStepRtns = _dosObj["stepRtn" + newKey].split("$");
				if (checkArrayVal(tmpStepRtns, "string", 1)) {
					for (var k = 0, len = tmpStepRtns.length; k < len; k++) {
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
			} else {
				makeWarningWindow(C_MSG_E_0103.split("{0}").join(newKey));
			}
			if (_dosObj["pos" + newKey] != undefined) {
				var tmpPoss = _dosObj["pos" + newKey].split("$");
				if (checkArrayVal(tmpPoss, "string", 1)) {
					for (var k = 0, len = tmpPoss.length; k < len; k++) {
						g_keyObj["pos" + newKey + "_" + k] = tmpPoss[k].split(",");
					}
				}

			} else {
				for (var j = 0; j < tmpMinPatterns; j++) {
					g_keyObj["pos" + newKey + "_" + j] = new Array();
					if (g_keyObj["color" + newKey + "_" + j] != undefined) {
						for (var k = 0; k < g_keyObj["color" + newKey + "_" + j].length; k++) {
							g_keyObj["pos" + newKey + "_" + j][k] = k;
						}
					}
				}
			}

			if (_dosObj["keyCtrl" + newKey] != undefined) {
				var tmpKeyCtrls = _dosObj["keyCtrl" + newKey].split("$");

				if (checkArrayVal(tmpKeyCtrls, "string", 1)) {
					for (var p = 0, len = tmpKeyCtrls.length; p < len; p++) {
						tmpKeyCtrl = tmpKeyCtrls[p].split(",");

						g_keyObj["keyCtrl" + newKey + "_" + p] = new Array();
						g_keyObj["keyCtrl" + newKey + "_" + p + "d"] = new Array();

						for (var k = 0; k < tmpKeyCtrl.length; k++) {
							tmpKeyPtn = tmpKeyCtrl[k].split("/");
							g_keyObj["keyCtrl" + newKey + "_" + p][k] = new Array();
							g_keyObj["keyCtrl" + newKey + "_" + p + "d"][k] = new Array();

							for (var m = 0; m < tmpKeyPtn.length; m++) {
								g_keyObj["keyCtrl" + newKey + "_" + p][k][m] = tmpKeyPtn[m];
								g_keyObj["keyCtrl" + newKey + "_" + p + "d"][k][m] = tmpKeyPtn[m];
							}
						}
					}
				}
			} else {
				makeWarningWindow(C_MSG_E_0104.split("{0}").join(newKey));
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

	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l1ctx = layer0.getContext("2d");
	var layer1 = document.getElementById("layer1");
	var l1ctx = layer1.getContext("2d");
	var layer2 = document.getElementById("layer2");
	var l2ctx = layer2.getContext("2d");
	var divRoot = document.getElementById("divRoot");

	// タイトル文字描画
	var lblTitle = getTitleDivLabel("lblTitle",
		"<span style='color:#6666ff;font-size:40px;'>S</span>ETTINGS", 0, 15);
	divRoot.appendChild(lblTitle);

	// オプションボタン用の設置
	createOptionWindow("divRoot");

	// ユーザカスタムイベント(初期)
	if (typeof customOptionInit == "function") {
		customOptionInit();
	}

	// 戻るボタン描画
	var btnBack = createButton({
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
	var btnKeyConfig = createButton({
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
	var btnPlay = createButton({
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

		if (g_audio.readyState == 4) {
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

	// キー操作イベント（デフォルト）
	document.onkeydown = function (evt) {
		// ブラウザ判定
		if (g_userAgent.indexOf("firefox") != -1) {
			var setKey = evt.which;
		} else {
			var setKey = event.keyCode;
		}
		if (setKey == 13) {
			clearWindow();
			g_audio.load();

			if (g_audio.readyState == 4) {
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
			if (setKey == C_BLOCK_KEYS[j]) {
				return false;
			}
		}
	}
}


/**
 * 設定・オプション画面のラベル・ボタン処理の描画
 * @param {Object} _sprite 基準とするスプライト(ここで指定する座標は、そのスプライトからの相対位置)
 */
function createOptionWindow(_sprite) {

	// 各ボタン用のスプライトを作成
	var optionsprite = createSprite(_sprite, "optionsprite", (g_sWidth - 400) / 2, 100, 400, 300);

	// 難易度(Difficulty)
	var lblDifficulty = createDivLabel("lblDifficulty", 0, C_LEN_SETLBL_HEIGHT * 0,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETDIFLBL, C_CLR_TITLE,
		"<span style='color:#ff9999'>D</span>ifficulty");
	optionsprite.appendChild(lblDifficulty);

	var lnkDifficulty = makeSettingLblButton("lnkDifficulty",
		g_headerObj["keyLabels"][g_stateObj.scoreId] + " key / " + g_headerObj["difLabels"][g_stateObj.scoreId], 0, function () {
			g_stateObj.scoreId = (g_stateObj.scoreId < g_headerObj["keyLabels"].length - 1 ? ++g_stateObj.scoreId : 0);
			setDifficulty();
		});
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
	}

	// 速度(Speed)
	var lblSpeed = createDivLabel("lblSpeed", 0, C_LEN_SETLBL_HEIGHT * 2,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#ffff99'>S</span>peed");
	optionsprite.appendChild(lblSpeed);

	var lnkSpeed = makeSettingLblButton("lnkSpeed", g_stateObj.speed + " x", 2, function () {
		g_stateObj.speed = (Number(g_stateObj.speed) < 10 ? Number(g_stateObj.speed) + 0.25 : 1);
		lnkSpeed.innerHTML = g_stateObj.speed + " x";
	});
	lnkSpeed.oncontextmenu = function () {
		g_stateObj.speed = (Number(g_stateObj.speed) > 1 ? Number(g_stateObj.speed) - 0.25 : 10);
		lnkSpeed.innerHTML = g_stateObj.speed + " x";
		return false;
	}
	optionsprite.appendChild(lnkSpeed);

	optionsprite.appendChild(makeMiniButton("lnkSpeed", "R", 2, function () {
		g_stateObj.speed = (Number(g_stateObj.speed) < 9 ? Number(g_stateObj.speed) + 1 : (Number(g_stateObj.speed) == 10 ? 1 : 10));
		lnkSpeed.innerHTML = g_stateObj.speed + " x";
	}));
	optionsprite.appendChild(makeMiniButton("lnkSpeed", "L", 2, function () {
		g_stateObj.speed = (Number(g_stateObj.speed) > 2 ? Number(g_stateObj.speed) - 1 : (Number(g_stateObj.speed) == 1 ? 10 : 1));
		lnkSpeed.innerHTML = g_stateObj.speed + " x";
	}));
	optionsprite.appendChild(makeMiniButton("lnkSpeed", "RR", 2, function () {
		g_stateObj.speed = (Number(g_stateObj.speed) < 10 ? Number(g_stateObj.speed) + 0.25 : 1);
		lnkSpeed.innerHTML = g_stateObj.speed + " x";
	}));
	optionsprite.appendChild(makeMiniButton("lnkSpeed", "LL", 2, function () {
		g_stateObj.speed = (Number(g_stateObj.speed) > 1 ? Number(g_stateObj.speed) - 0.25 : 10);
		lnkSpeed.innerHTML = g_stateObj.speed + " x";
	}));


	// 速度モーション (Motion)
	var lblMotion = createDivLabel("lblMotion", 0, C_LEN_SETLBL_HEIGHT * 3,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#eeff99'>M</span>otion");
	optionsprite.appendChild(lblMotion);

	var lnkMotion = makeSettingLblButton("lnkMotion", g_stateObj.motion, 3, function () {
		switch (g_stateObj.motion) {
			case "OFF":
				g_stateObj.motion = "Boost"; break;
			case "Boost":
				g_stateObj.motion = "Brake"; break;
			case "Brake":
				g_stateObj.motion = "OFF"; break;
		}
		lnkMotion.innerHTML = g_stateObj.motion;
	});
	lnkMotion.oncontextmenu = function () {
		switch (g_stateObj.motion) {
			case "OFF":
				g_stateObj.motion = "Brake"; break;
			case "Boost":
				g_stateObj.motion = "OFF"; break;
			case "Brake":
				g_stateObj.motion = "Boost"; break;
		}
		lnkMotion.innerHTML = g_stateObj.motion;
		return false;
	}
	optionsprite.appendChild(lnkMotion);

	optionsprite.appendChild(makeMiniButton("lnkMotion", "R", 3, function () {
		switch (g_stateObj.motion) {
			case "OFF":
				g_stateObj.motion = "Boost"; break;
			case "Boost":
				g_stateObj.motion = "Brake"; break;
			case "Brake":
				g_stateObj.motion = "OFF"; break;
		}
		lnkMotion.innerHTML = g_stateObj.motion;
	}));
	optionsprite.appendChild(makeMiniButton("lnkMotion", "L", 3, function () {
		switch (g_stateObj.motion) {
			case "OFF":
				g_stateObj.motion = "Brake"; break;
			case "Boost":
				g_stateObj.motion = "OFF"; break;
			case "Brake":
				g_stateObj.motion = "Boost"; break;
		}
		lnkMotion.innerHTML = g_stateObj.motion;
	}));


	// リバース
	var lblReverse = createDivLabel("lblReverse", 0, C_LEN_SETLBL_HEIGHT * 4,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#ddff99'>R</span>everse");
	optionsprite.appendChild(lblReverse);

	var lnkReverse = makeSettingLblButton("lnkReverse", g_stateObj.reverse, 4, function () {
		g_stateObj.reverse = (g_stateObj.reverse == "OFF" ? "ON" : "OFF");
		lnkReverse.innerHTML = g_stateObj.reverse;
	});
	lnkReverse.oncontextmenu = function () {
		g_stateObj.reverse = (g_stateObj.reverse == "OFF" ? "ON" : "OFF");
		lnkReverse.innerHTML = g_stateObj.reverse;
		return false;
	}
	optionsprite.appendChild(lnkReverse);

	optionsprite.appendChild(makeMiniButton("lnkReverse", "R", 4, function () {
		g_stateObj.reverse = (g_stateObj.reverse == "OFF" ? "ON" : "OFF");
		lnkReverse.innerHTML = g_stateObj.reverse;
	}));
	optionsprite.appendChild(makeMiniButton("lnkReverse", "L", 4, function () {
		g_stateObj.reverse = (g_stateObj.reverse == "OFF" ? "ON" : "OFF");
		lnkReverse.innerHTML = g_stateObj.reverse;
	}));


	// 鑑賞モード設定 (AutoPlay)
	var lblAutoPlay = createDivLabel("lblAutoPlay", 0, C_LEN_SETLBL_HEIGHT * 5,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#ccff99'>A</span>utoPlay");
	optionsprite.appendChild(lblAutoPlay);

	var lnkAutoPlay = makeSettingLblButton("lnkAutoPlay", g_stateObj.auto, 5, function () {
		g_stateObj.auto = (g_stateObj.auto == "OFF" ? "ON" : "OFF");
		lnkAutoPlay.innerHTML = g_stateObj.auto;
	});
	lnkAutoPlay.oncontextmenu = function () {
		g_stateObj.auto = (g_stateObj.auto == "OFF" ? "ON" : "OFF");
		lnkAutoPlay.innerHTML = g_stateObj.auto;
		return false;
	}
	optionsprite.appendChild(lnkAutoPlay);

	optionsprite.appendChild(makeMiniButton("lnkAutoPlay", "R", 5, function () {
		g_stateObj.auto = (g_stateObj.auto == "OFF" ? "ON" : "OFF");
		lnkAutoPlay.innerHTML = g_stateObj.auto;
	}));
	optionsprite.appendChild(makeMiniButton("lnkAutoPlay", "L", 5, function () {
		g_stateObj.auto = (g_stateObj.auto == "OFF" ? "ON" : "OFF");
		lnkAutoPlay.innerHTML = g_stateObj.auto;
	}));


	// タイミング調整 (Adjustment)
	var lblAdjustment = createDivLabel("lblAdjustment", 0, C_LEN_SETLBL_HEIGHT * 7,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#99ffff'>A</span>djustment");
	optionsprite.appendChild(lblAdjustment);

	var lnkAdjustment = makeSettingLblButton("lnkAdjustment", g_stateObj.adjustment, 7, function () {
		g_stateObj.adjustment = (g_stateObj.adjustment == 30 ? -30 : ++g_stateObj.adjustment);
		lnkAdjustment.innerHTML = g_stateObj.adjustment;
	});
	lnkAdjustment.oncontextmenu = function () {
		g_stateObj.adjustment = (g_stateObj.adjustment == -30 ? 30 : --g_stateObj.adjustment);
		lnkAdjustment.innerHTML = g_stateObj.adjustment;
		return false;
	}
	optionsprite.appendChild(lnkAdjustment);

	optionsprite.appendChild(makeMiniButton("lnkAdjustment", "R", 7, function () {
		g_stateObj.adjustment = (g_stateObj.adjustment >= 25 ? (g_stateObj.adjustment == 30 ? -30 : 30) : g_stateObj.adjustment + 5);
		lnkAdjustment.innerHTML = g_stateObj.adjustment;
	}));
	optionsprite.appendChild(makeMiniButton("lnkAdjustment", "L", 7, function () {
		g_stateObj.adjustment = (g_stateObj.adjustment <= -25 ? (g_stateObj.adjustment == -30 ? 30 : -30) : g_stateObj.adjustment - 5);
		lnkAdjustment.innerHTML = g_stateObj.adjustment;
	}));
	optionsprite.appendChild(makeMiniButton("lnkAdjustment", "RR", 7, function () {
		g_stateObj.adjustment = (g_stateObj.adjustment == 30 ? -30 : ++g_stateObj.adjustment);
		lnkAdjustment.innerHTML = g_stateObj.adjustment;
	}));
	optionsprite.appendChild(makeMiniButton("lnkAdjustment", "LL", 7, function () {
		g_stateObj.adjustment = (g_stateObj.adjustment == -30 ? 30 : --g_stateObj.adjustment);
		lnkAdjustment.innerHTML = g_stateObj.adjustment;
	}));


	// フェードイン (Fadein)
	var lblFadein = createDivLabel("lblFadein", 0, C_LEN_SETLBL_HEIGHT * 8,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#99eeff'>F</span>adein");
	optionsprite.appendChild(lblFadein);

	var lnkFadein = makeSettingLblButton("lnkFadein", g_stateObj.fadein + "%", 8, function () {
		g_stateObj.fadein = (g_stateObj.fadein == 95 ? 0 : g_stateObj.fadein + 5);
		lnkFadein.innerHTML = g_stateObj.fadein + "%";
	});
	lnkFadein.oncontextmenu = function () {
		g_stateObj.fadein = (g_stateObj.fadein == 0 ? 95 : g_stateObj.fadein - 5);
		lnkFadein.innerHTML = g_stateObj.fadein + "%";
		return false;
	}
	optionsprite.appendChild(lnkFadein);

	optionsprite.appendChild(makeMiniButton("lnkFadein", "R", 8, function () {
		g_stateObj.fadein = (g_stateObj.fadein >= 75 ? (g_stateObj.fadein == 95 ? 0 : 95) : g_stateObj.fadein + 25);
		lnkFadein.innerHTML = g_stateObj.fadein + "%";
	}));
	optionsprite.appendChild(makeMiniButton("lnkFadein", "L", 8, function () {
		g_stateObj.fadein = (g_stateObj.fadein <= 25 ? (g_stateObj.fadein == 0 ? 95 : 0) : g_stateObj.fadein - 25);
		lnkFadein.innerHTML = g_stateObj.fadein + "%";
	}));
	optionsprite.appendChild(makeMiniButton("lnkFadein", "RR", 8, function () {
		g_stateObj.fadein = (g_stateObj.fadein == 95 ? 0 : g_stateObj.fadein + 5);
		lnkFadein.innerHTML = g_stateObj.fadein + "%";
	}));
	optionsprite.appendChild(makeMiniButton("lnkFadein", "LL", 8, function () {
		g_stateObj.fadein = (g_stateObj.fadein == 0 ? 95 : g_stateObj.fadein - 5);
		lnkFadein.innerHTML = g_stateObj.fadein + "%";
	}));


	// ボリューム
	var lblVolume = createDivLabel("lblVolume", 0, C_LEN_SETLBL_HEIGHT * 9,
		100, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#99ddff'>V</span>olume");
	optionsprite.appendChild(lblVolume);

	var lnkVolume = makeSettingLblButton("lnkVolume", g_stateObj.volume + "%", 9, function () {
		g_volumeNum = (g_volumeNum == 0 ? g_volumes.length - 1 : --g_volumeNum);
		g_stateObj.volume = g_volumes[g_volumeNum];
		lnkVolume.innerHTML = g_stateObj.volume + "%";
	});
	lnkVolume.oncontextmenu = function () {
		g_volumeNum = (g_volumeNum == g_volumes.length - 1 ? 0 : ++g_volumeNum);
		g_stateObj.volume = g_volumes[g_volumeNum];
		lnkVolume.innerHTML = g_stateObj.volume + "%";
		return false;
	}
	optionsprite.appendChild(lnkVolume);

	optionsprite.appendChild(makeMiniButton("lnkVolume", "R", 9, function () {
		g_volumeNum = (g_volumeNum == 0 ? g_volumes.length - 1 : --g_volumeNum);
		g_stateObj.volume = g_volumes[g_volumeNum];
		lnkVolume.innerHTML = g_stateObj.volume + "%";
	}));
	optionsprite.appendChild(makeMiniButton("lnkVolume", "L", 9, function () {
		g_volumeNum = (g_volumeNum == g_volumes.length - 1 ? 0 : ++g_volumeNum);
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
	var settingLblButton = createButton({
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
	var miniButton = createButton({
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
/* Scene : KEYCONFIG [orange] */
/*-----------------------------------------------------------*/

/**
 * キーコンフィグ画面初期化
 */
function keyConfigInit() {

	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");
	var layer1 = document.getElementById("layer1");
	var l1ctx = layer1.getContext("2d");
	var layer2 = document.getElementById("layer2");
	var l2ctx = layer2.getContext("2d");
	var divRoot = document.getElementById("divRoot");

	// タイトル文字描画
	var lblTitle = getTitleDivLabel("lblTitle",
		"<span style='color:#6666ff;font-size:40px;'>K</span>EY<span style='color:#ff6666;font-size:40px;'>C</span>ONFIG", 0, 15);
	divRoot.appendChild(lblTitle);

	var kcDesc = createDivLabel("kcDesc", 0, 65, g_sWidth, 20, 14, C_CLR_TITLE,
		"[BackSpaceキー:スキップ / Deleteキー:(代替キーのみ)キー無効化]");
	kcDesc.style.align = C_ALIGN_CENTER;
	divRoot.appendChild(kcDesc);


	// キーの一覧を表示
	var keyconSprite = createSprite("divRoot", "keyconSprite", (g_sWidth - 400) / 2, 100, 400, 300);
	var kWidth = parseInt(keyconSprite.style.width);

	var keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	var keyNum = g_keyObj["chara" + keyCtrlPtn].length;
	var posMax = g_keyObj["pos" + keyCtrlPtn][keyNum - 1] + 1;
	var divideCnt = g_keyObj["div" + keyCtrlPtn];
	if (g_keyObj["blank" + keyCtrlPtn] != undefined) {
		g_keyObj.blank = g_keyObj["blank" + keyCtrlPtn];
	} else {
		g_keyObj.blank = g_keyObj.blank_def;
	}

	/** 同行の左から数えた場合の位置(x座標) */
	var leftCnt = 0;
	/** 同行の中心から見た場合の位置(x座標) */
	var stdPos = 0;
	/** 行位置 */
	var dividePos = 0;
	var posj = 0;

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
	var cursor = keyconSprite.appendChild(createImg("cursor", "../img/cursor.png",
		kWidth / 2 + g_keyObj.blank * (posj - divideCnt / 2) - 10, 45, 15, 30));

	// キーコンフィグタイプ切替ボタン
	var lblKcType = createDivLabel("lblKcType", 30, 10,
		70, C_LEN_SETLBL_HEIGHT, C_SIZ_SETLBL, C_CLR_TITLE,
		"<span style='color:#99ddff'>C</span>onfigType");
	divRoot.appendChild(lblKcType);

	var lnkKcType = makeSettingLblButton("lnkKcType", g_kcType, 0, function () {
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
	if (typeof customKeyConfigInit == "function") {
		customKeyConfigInit();
	}

	// 戻るボタン描画
	var btnBack = createButton({
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
	var btnPtnChange = createButton({
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
		var tempPtn = g_keyObj.currentPtn + 1;
		if (g_keyObj["keyCtrl" + g_keyObj.currentKey + "_" + tempPtn] != undefined) {
			g_keyObj.currentPtn = tempPtn;
		} else {
			g_keyObj.currentPtn = 0;
		}
		clearWindow();
		keyConfigInit();
		var keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
		eval("resetCursor" + g_kcType)(kWidth, g_keyObj["div" + keyCtrlPtn], keyCtrlPtn);
	});
	divRoot.appendChild(btnPtnChange);

	// キーコンフィグリセットボタン描画
	var btnReset = createButton({
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
			var keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
			var keyNum = g_keyObj["chara" + keyCtrlPtn].length;
			var divideCnt = g_keyObj["div" + keyCtrlPtn];

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
		var keyCdObj = document.getElementById("keycon" + g_currentj + "_" + g_currentk);
		var cursor = document.getElementById("cursor");

		// ブラウザ判定
		if (g_userAgent.indexOf("firefox") != -1) {
			var setKey = evt.which;
		} else {
			var setKey = event.keyCode;
		}

		// 全角切替、BackSpace、Deleteキーは割り当て禁止
		// また、直前と同じキーを押した場合(BackSpaceを除く)はキー操作を無効にする
		if (setKey == 229 || setKey == 242 || setKey == 243 || setKey == 244 ||
			setKey == 91 || setKey == 29 || setKey == 28 ||
			(setKey == 46 && g_currentk == 0) || setKey == g_prevKey) {
		} else {
			if (setKey == 8) {
			} else {
				if (setKey == 46) {
					setKey = 0;
				}
				keyCdObj.innerHTML = g_kCd[setKey];
				g_keyObj["keyCtrl" + keyCtrlPtn][g_currentj][g_currentk] = setKey;
				g_prevKey = setKey;
			}

			// 後続に代替キーが存在する場合
			if (g_currentk < g_keyObj["keyCtrl" + keyCtrlPtn][g_currentj].length - 1 &&
				g_kcType != "Main") {
				g_currentk++;
				cursor.style.top = (parseInt(cursor.style.top) + 20) + "px";

			} else if (g_currentj < g_keyObj["keyCtrl" + keyCtrlPtn].length - 1) {
				// 他の代替キーが存在せず、次の矢印がある場合
				g_currentj++;
				g_currentk = 0;

				// 代替キーのみの場合は次の代替キーがあるキーを探す
				if (g_kcType == "Replaced") {
					for (var j = g_currentj, len = g_keyObj["keyCtrl" + keyCtrlPtn].length; j < len; j++) {
						if (g_keyObj["keyCtrl" + keyCtrlPtn][j][1] != undefined) {
							g_currentj = j;
							g_currentk = 1;
							break;
						}
					}
					if (g_currentk == 0) {
						for (var j = 0, len = g_currentj; j < len; j++) {
							if (g_keyObj["keyCtrl" + keyCtrlPtn][j][1] != undefined) {
								g_currentj = j;
								g_currentk = 1;
								break;
							}
						}
					}
				}
				var posj = g_keyObj["pos" + keyCtrlPtn][g_currentj];

				leftCnt = (posj >= divideCnt ? posj - divideCnt : posj);
				stdPos = (posj >= divideCnt ? leftCnt - (posMax - divideCnt) / 2 : leftCnt - divideCnt / 2);
				dividePos = (posj >= divideCnt ? 1 : 0);

				cursor.style.left = (kWidth / 2 + g_keyObj.blank * stdPos - 10) + "px";
				cursor.style.top = (50 + 150 * dividePos) + "px";
				if (g_kcType == "Replaced") {
					cursor.style.top = (parseFloat(cursor.style.top) + 20) + "px";
				}

			} else {
				// 全ての矢印・代替キーの巡回が終わった場合は元の位置に戻す
				eval("resetCursor" + g_kcType)(kWidth, divideCnt, keyCtrlPtn);
			}
		}
		for (var j = 0; j < C_BLOCK_KEYS.length; j++) {
			if (setKey == C_BLOCK_KEYS[j]) {
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
	var posj = g_keyObj["pos" + _keyCtrlPtn][0];

	var cursor = document.getElementById("cursor");
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
	var keyNum = g_keyObj["chara" + _keyCtrlPtn].length;

	for (var j = 0; j < keyNum; j++) {
		if (g_keyObj["keyCtrl" + _keyCtrlPtn][j][1] != undefined) {
			g_currentj = j;
			g_currentk = 1;
			break;
		}
	}
	var posj = g_keyObj["pos" + _keyCtrlPtn][g_currentj];

	var cursor = document.getElementById("cursor");
	cursor.style.left = (_width / 2 + g_keyObj.blank * (posj - _divideCnt / 2) - 10) + "px";
	if (g_currentk == 1) {
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
	var posj = g_keyObj["pos" + _keyCtrlPtn][0];

	var cursor = document.getElementById("cursor");
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

	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");
	var layer1 = document.getElementById("layer1");
	var l1ctx = layer1.getContext("2d");
	var divRoot = document.getElementById("divRoot");

	var keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	var keyNum = g_keyObj["chara" + keyCtrlPtn].length;
	g_headerObj.blankFrame = g_headerObj.blankFrameDef;

	// 譜面データの読み込み
	var scoreIdHeader = "";
	if (g_stateObj.scoreId > 0) {
		scoreIdHeader = Number(g_stateObj.scoreId) + 1;
	}
	g_scoreObj = scoreConvert(g_rootObj, scoreIdHeader, 0);

	// 最終フレーム数の取得
	var lastFrame = getLastFrame(g_scoreObj) + g_headerObj.blankFrame;

	// 最初の矢印データがあるフレーム数を取得
	var firstArrowFrame = getFirstArrowFrame(g_scoreObj);

	// 開始フレーム数の取得(フェードイン加味)
	g_scoreObj.frameNum = getStartFrame(lastFrame);

	// フレームごとの速度を取得（配列形式）
	var speedOnFrame = setSpeedOnFrame(g_scoreObj.speedData, lastFrame);

	// Motionオプション適用時の矢印別の速度を取得（配列形式）
	var motionOnFrame = setMotionOnFrame();
	g_workObj.motionOnFrames = motionOnFrame.concat();

	// 最初のフレームで出現する矢印が、ステップゾーンに到達するまでのフレーム数を取得
	var firstFrame = (g_scoreObj.frameNum == 0 ? 0 : g_scoreObj.frameNum + g_headerObj.blankFrame);
	var arrivalFrame = getFirstArrivalFrame(firstFrame, speedOnFrame, motionOnFrame);

	// キーパターン(デフォルト)に対応する矢印番号を格納
	convertreplaceNums();

	// フレーム・曲開始位置調整
	var preblankFrame = 0;
	if (g_scoreObj.frameNum == 0) {
		if (firstArrowFrame < arrivalFrame) {
			preblankFrame = arrivalFrame - firstArrowFrame + 10;

			// 譜面データの再読み込み
			var tmpObj = scoreConvert(g_rootObj, scoreIdHeader, preblankFrame);
			for (var j = 0; j < keyNum; j++) {
				if (tmpObj.arrowData[j] != undefined) {
					g_scoreObj.arrowData[j] = tmpObj.arrowData[j].concat();
				}
				if (tmpObj.frzData[j] != undefined) {
					g_scoreObj.frzData[j] = tmpObj.frzData[j].concat();
				}
			}
			if (tmpObj.speedData != undefined && tmpObj.speedData.length >= 2) {
				g_scoreObj.speedData = tmpObj.speedData.concat();
			}
			if (tmpObj.boostData != undefined && tmpObj.boostData.length >= 2) {
				g_scoreObj.boostData = tmpObj.boostData.concat();
			}
			if (tmpObj.colorData != undefined && tmpObj.colorData.length >= 3) {
				g_scoreObj.colorData = tmpObj.colorData.concat();
			}
			if (tmpObj.acolorData != undefined && tmpObj.acolorData.length >= 3) {
				g_scoreObj.acolorData = tmpObj.acolorData.concat();
			}
			if (tmpObj.wordData != undefined && tmpObj.wordData.length >= 3) {
				g_scoreObj.wordData = tmpObj.wordData.concat();
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
	if (typeof customLoadingInit == "function") {
		customLoadingInit();
	}

	clearWindow();
	MainInit();
}

/**
 * 譜面データの分解
 * @param {object} _dosObj 
 * @param {string} _scoreNo
 */
function scoreConvert(_dosObj, _scoreNo, _preblankFrame) {

	// 矢印群の格納先
	var obj = {};
	g_allArrow = 0;
	g_allFrz = 0;

	var keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	var keyNum = g_keyObj["chara" + keyCtrlPtn].length;
	obj.arrowData = new Array();
	obj.frzData = new Array();
	var frzName;
	var tmpData;
	for (var j = 0, k = 0; j < keyNum; j++) {

		// 矢印データの分解
		if (_dosObj[g_keyObj["chara" + keyCtrlPtn][j] + _scoreNo + "_data"] != undefined) {
			tmpData = _dosObj[g_keyObj["chara" + keyCtrlPtn][j] + _scoreNo + "_data"].split("\r").join("");
			tmpData = tmpData.split("\n").join("");

			if (tmpData != undefined) {
				obj.arrowData[j] = new Array();
				obj.arrowData[j] = tmpData.split(",");
				if (isNaN(parseFloat(obj.arrowData[j][0]))) {
				} else {
					g_allArrow += obj.arrowData[j].length;
					for (k = 0; k < obj.arrowData[j].length; k++) {
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

		// フリーズアローデータの分解
		if (_dosObj[frzName + _scoreNo + "_data"] != undefined) {
			tmpData = _dosObj[frzName + _scoreNo + "_data"].split("\r").join("");
			tmpData = tmpData.split("\n").join("");

			if (tmpData != undefined) {
				obj.frzData[j] = new Array();
				obj.frzData[j] = tmpData.split(",");
				if (isNaN(parseFloat(obj.frzData[j][0]))) {
				} else {
					g_allFrz += obj.frzData[j].length;
					for (k = 0; k < obj.frzData[j].length; k++) {
						obj.frzData[j][k] = parseFloat(obj.frzData[j][k]) + parseFloat(g_stateObj.adjustment) + _preblankFrame;
					}
				}
			}
		}
	}

	// 速度変化・色変化データの分解
	obj.speedData = [];
	var speedFooter = (g_keyObj.currentKey == "5" ? "_data" : "_change");
	if (_dosObj["speed" + _scoreNo + speedFooter] != undefined) {
		obj.speedData = _dosObj["speed" + _scoreNo + speedFooter].split(",");
		for (k = 0; k < obj.speedData.length; k += 2) {
			obj.speedData[k] = parseFloat(obj.speedData[k]) + parseFloat(g_stateObj.adjustment) + _preblankFrame;
			obj.speedData[k + 1] = parseFloat(obj.speedData[k + 1]);
		}
	}
	obj.boostData = [];
	if (_dosObj["boost" + _scoreNo + "_data"] != undefined) {
		obj.boostData = _dosObj["boost" + _scoreNo + "_data"].split(",");
		for (k = 0; k < obj.boostData.length; k += 2) {
			obj.boostData[k] = parseFloat(obj.boostData[k]) + parseFloat(g_stateObj.adjustment) + _preblankFrame;
			obj.boostData[k + 1] = parseFloat(obj.boostData[k + 1]);
		}
	}
	obj.colorData = [];
	if (_dosObj["color" + _scoreNo + "_data"] != undefined && _dosObj["color" + _scoreNo + "_data"] != "") {
		obj.colorData = _dosObj["color" + _scoreNo + "_data"].split(",");
		for (k = 0; k < obj.colorData.length; k += 3) {
			obj.colorData[k] = parseFloat(obj.colorData[k]) + parseFloat(g_stateObj.adjustment) + _preblankFrame;
			obj.colorData[k + 1] = parseFloat(obj.colorData[k + 1]);
		}
	}
	obj.acolorData = [];
	if (_dosObj["acolor" + _scoreNo + "_data"] != undefined && _dosObj["acolor" + _scoreNo + "data"] != "") {
		obj.acolorData = _dosObj["acolor" + _scoreNo + "_data"].split(",");
		for (k = 0; k < obj.acolorData.length; k += 3) {
			obj.acolorData[k] = parseFloat(obj.acolorData[k]) + parseFloat(g_stateObj.adjustment) + _preblankFrame;
			obj.acolorData[k + 1] = parseFloat(obj.acolorData[k + 1]);
		}
	}

	// 歌詞データの分解
	obj.wordData = new Array();
	if (_dosObj["word" + _scoreNo + "_data"] != undefined) {

		tmpData = _dosObj["word" + _scoreNo + "_data"].split("\r").join("");
		tmpData = tmpData.split("\n").join("");

		if (tmpData != undefined && tmpData != "") {
			var tmpWordData = tmpData.split(",");
			for (k = 0; k < tmpWordData.length; k += 3) {
				tmpWordData[k] = parseFloat(tmpWordData[k]) + parseFloat(g_stateObj.adjustment) + _preblankFrame;
				tmpWordData[k + 1] = parseFloat(tmpWordData[k + 1]);

				if (obj.wordData[tmpWordData[k]] == undefined) {
					obj.wordData[tmpWordData[k]] = new Array();
				}
				obj.wordData[tmpWordData[k]].push(tmpWordData[k + 1], tmpWordData[k + 2]);
			}
		}

	}

	return obj;
}

/**
 * 最終フレーム数の取得
 * @param {object} _dataObj 
 */
function getLastFrame(_dataObj) {

	var tmpLastNum = 0;
	var keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	var keyNum = g_keyObj["chara" + keyCtrlPtn].length;

	for (var j = 0; j < keyNum; j++) {
		if (_dataObj.arrowData[j] != undefined && _dataObj.arrowData[j] != "") {
			if (_dataObj.arrowData[j][_dataObj.arrowData[j].length - 1] > tmpLastNum) {
				tmpLastNum = _dataObj.arrowData[j][_dataObj.arrowData[j].length - 1];
			}
		}
		if (_dataObj.frzData[j] != undefined && _dataObj.frzData[j] != "") {
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

	var tmpFirstNum = Infinity;
	var keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	var keyNum = g_keyObj["chara" + keyCtrlPtn].length;

	for (var j = 0; j < keyNum; j++) {
		if (_dataObj.arrowData[j] != undefined && _dataObj.arrowData[j] != "") {
			if (_dataObj.arrowData[j][0] < tmpFirstNum && _dataObj.arrowData[j][0] > 0) {
				tmpFirstNum = _dataObj.arrowData[j][0];
			}
		}
		if (_dataObj.frzData[j] != undefined && _dataObj.frzData[j] != "") {
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
	var frameNum = 0;
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

	var speedOnFrame = new Array();
	var currentSpeed = g_stateObj.speed * 2;

	for (var frm = 0, s = 0; frm <= _lastFrame; frm++) {
		if (_speedData != undefined && frm == _speedData[s]) {
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

	var motionOnFrame = new Array();

	// 矢印が表示される最大フレーム数
	var motionLastFrame = g_sHeight * 20;
	var brakeLastFrame = g_sHeight / 2;

	for (var j = 0; j <= motionLastFrame; j++) {
		motionOnFrame[j] = 0;
	}

	if (g_stateObj.motion == "OFF") {
	} else if (g_stateObj.motion == "Boost") {
		// ステップゾーンに近づくにつれて加速量を大きくする (16 → 85)
		for (var j = C_MOTION_STD_POS + 1; j < C_MOTION_STD_POS + 70; j++) {
			motionOnFrame[j] = (C_MOTION_STD_POS + 70 - j) * g_stateObj.speed * 2 / 50;
		}
	} else if (g_stateObj.motion == "Brake") {
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
	var startY = 0;
	var frm = _startFrame;
	var motionFrm = C_MOTION_STD_POS;

	while (g_distY - startY > 0) {
		startY += _speedOnFrame[frm];

		if (_speedOnFrame[frm] != 0) {
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

	var startPoint = new Array();
	var frzStartPoint = new Array();

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

	var spdNext = Infinity;
	var spdPrev = 0;
	var spdk;
	var lastk;
	var tmpObj;
	var arrowArrivalFrm;
	var frmPrev;

	for (var j = 0; j < _dataObj.arrowData.length; j++) {

		// 矢印の出現フレーム数計算
		if (_dataObj.arrowData[j] != undefined) {

			startPoint[j] = new Array();
			if (_dataObj.speedData != undefined) {
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

			if (g_workObj.mkArrow[startPoint[j][lastk]] == undefined) {
				g_workObj.mkArrow[startPoint[j][lastk]] = new Array();
			}
			g_workObj.mkArrow[startPoint[j][lastk]].push(j);

			for (var k = lastk - 1; k >= 0; k--) {
				arrowArrivalFrm = _dataObj.arrowData[j][k];

				// 矢印の出現位置が開始前の場合は除外
				if (arrowArrivalFrm < _firstArrivalFrame) {
					break;

					// 最初から最後まで同じスピードのときは前回のデータを流用
				} else if ((arrowArrivalFrm - g_workObj.arrivalFrame[frmPrev] > spdPrev)
					&& arrowArrivalFrm < spdNext) {

					var tmpFrame = arrowArrivalFrm - g_workObj.arrivalFrame[frmPrev];
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
					if (g_workObj.mkArrow[startPoint[j][k]] == undefined) {
						g_workObj.mkArrow[startPoint[j][k]] = new Array();
					}
					g_workObj.mkArrow[startPoint[j][k]].push(j);
				}
			}
		}

		// フリーズアローの出現フレーム数計算
		if (_dataObj.frzData[j] != undefined) {

			frzStartPoint[j] = new Array();
			g_workObj.mkFrzLength[j] = new Array();
			if (_dataObj.speedData != undefined) {
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

			if (g_workObj.mkFrzArrow[frzStartPoint[j][lastk]] == undefined) {
				g_workObj.mkFrzArrow[frzStartPoint[j][lastk]] = new Array();
			}
			g_workObj.mkFrzArrow[frzStartPoint[j][lastk]].push(j);

			// フリーズアローは2つで1セット
			for (var k = lastk - 2; k >= 0; k -= 2) {
				arrowArrivalFrm = _dataObj.frzData[j][k];

				// フリーズアローの出現位置が開始前の場合は除外
				if (arrowArrivalFrm < _firstArrivalFrame) {
					if (g_workObj.mkFrzLength[j] != undefined) {
						g_workObj.mkFrzLength[j] = g_workObj.mkFrzLength[j].slice(k + 2).concat();
					}
					break;

					// 最初から最後まで同じスピードのときは前回のデータを流用
				} else if ((arrowArrivalFrm - g_workObj.arrivalFrame[frmPrev] > spdPrev)
					&& arrowArrivalFrm < spdNext) {

					var tmpFrame = arrowArrivalFrm - g_workObj.arrivalFrame[frmPrev];
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
					if (g_workObj.mkFrzArrow[frzStartPoint[j][k]] == undefined) {
						g_workObj.mkFrzArrow[frzStartPoint[j][k]] = new Array();
					}
					g_workObj.mkFrzArrow[frzStartPoint[j][k]].push(j);

				} else {
					if (g_workObj.mkFrzLength[j] != undefined) {
						g_workObj.mkFrzLength[j] = g_workObj.mkFrzLength[j].slice(k + 2).concat();
					}
				}
			}
		}
	}

	// 個別加速のタイミング更新
	if (_dataObj.boostData != undefined && _dataObj.boostData.length >= 2) {

		var delBoostIdx = 0;
		for (var k = _dataObj.boostData.length - 2; k >= 0; k -= 2) {
			if (_dataObj.boostData[k] < g_scoreObj.frameNum) {
				delBoostIdx = k;
				break;
			} else {
				tmpObj = getArrowStartFrame(_dataObj.boostData[k], _speedOnFrame, _motionOnFrame);
				_dataObj.boostData[k] = tmpObj.frm;
			}
		}
		for (var k = 0; k < delBoostIdx; k++) {
			_dataObj.boostData.shift();
		}
		g_workObj.boostData = new Array();
		g_workObj.boostData = _dataObj.boostData.concat();
	}

	// 個別色変化のタイミング更新
	if (_dataObj.colorData != undefined && _dataObj.colorData.length >= 3) {
		if (_dataObj.speedData != undefined) {
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
	if (_dataObj.acolorData != undefined && _dataObj.acolorData.length >= 3) {

		for (var k = _dataObj.acolorData.length - 3; k >= 0; k -= 3) {
			pushColors("A", _dataObj.acolorData[k], _dataObj.acolorData[k + 1], _dataObj.acolorData[k + 2].replace("0x", "#"));
		}
	}

	// 実際に処理させる途中変速配列を作成
	g_workObj.speedData = new Array();
	g_workObj.speedData.push(g_scoreObj.frameNum);
	g_workObj.speedData.push(_speedOnFrame[g_scoreObj.frameNum]);

	if (_dataObj.speedData != undefined) {
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

	var obj = {
		frm: _frame,
		startY: 0,
		arrivalFrm: 0,
		motionFrm: C_MOTION_STD_POS
	};

	while (g_distY - obj.startY > 0) {
		obj.startY += _speedOnFrame[obj.frm];

		if (_speedOnFrame[obj.frm] != 0) {
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
	var frzLength = 0;

	for (var frm = _startFrame; frm < _endFrame; frm++) {
		frzLength += _speedOnFrame[frm];
	}
	return frzLength;
}

/**
 * キーパターン(デフォルト)に対応する矢印番号を格納
 */
function convertreplaceNums() {
	var keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	var keyNum = g_keyObj["chara" + keyCtrlPtn].length;
	var baseCharas = g_keyObj["chara" + g_keyObj.currentKey + "_0"];
	var convCharas = g_keyObj["chara" + keyCtrlPtn];

	g_workObj.replaceNums = new Array();

	for (var j = 0; j < keyNum; j++) {
		for (var k = 0; k < keyNum; k++) {
			if (baseCharas[j] == convCharas[k]) {
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

	var keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	var keyNum = g_keyObj["chara" + keyCtrlPtn].length;

	if (_val < 30) {
		// 矢印の色変化
		if (g_workObj["mk" + _header + "Color"][_frame] == undefined) {
			g_workObj["mk" + _header + "Color"][_frame] = new Array();
			g_workObj["mk" + _header + "ColorCd"][_frame] = new Array();
		}
		if (_val < 20) {
			var realVal = g_workObj.replaceNums[_val];
			g_workObj["mk" + _header + "Color"][_frame].push(realVal);
			g_workObj["mk" + _header + "ColorCd"][_frame].push(_colorCd);
		} else if (_val >= 20) {
			var colorNum = _val - 20;
			for (var j = 0; j < keyNum; j++) {
				if (g_keyObj["color" + keyCtrlPtn][j] == colorNum) {
					g_workObj["mk" + _header + "Color"][_frame].push(j);
					g_workObj["mk" + _header + "ColorCd"][_frame].push(_colorCd);
				}
			}
		}
	} else {
		// フリーズアローの色変化
		if (g_workObj["mkF" + _header + "Color"][_frame] == undefined) {
			g_workObj["mkF" + _header + "Color"][_frame] = new Array();
			g_workObj["mkF" + _header + "ColorCd"][_frame] = new Array();
		}
		if (_val < 50) {
			g_workObj["mkF" + _header + "Color"][_frame].push(_val % 30);
			g_workObj["mkF" + _header + "ColorCd"][_frame].push(_colorCd);
		} else if (_val < 60) {
			var tmpVal = (_val % 50) * 2;
			g_workObj["mkF" + _header + "Color"][_frame].push(tmpVal, tmpVal + 1);
			g_workObj["mkF" + _header + "ColorCd"][_frame].push(_colorCd, _colorCd);
		} else {
			if (_val == 60) {
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

	var keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	var keyNum = g_keyObj["chara" + keyCtrlPtn].length;
	var posMax = g_keyObj["pos" + keyCtrlPtn][keyNum - 1] + 1;
	var divideCnt = g_keyObj["div" + keyCtrlPtn];
	if (g_keyObj["blank" + keyCtrlPtn] != undefined) {
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

		var posj = g_keyObj["pos" + keyCtrlPtn][j];
		var leftCnt = (posj >= divideCnt ? posj - divideCnt : posj);
		var stdPos = (posj >= divideCnt ? leftCnt - (posMax - divideCnt) / 2 : leftCnt - divideCnt / 2);
		g_workObj.stepX[j] = g_keyObj.blank * stdPos + g_sWidth / 2;

		if (g_stateObj.reverse == "ON") {
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
	g_resultObj.uwan = 0;
	g_resultObj.combo = 0;
	g_resultObj.maxCombo = 0;

	g_resultObj.kita = 0;
	g_resultObj.sfsf = 0;
	g_resultObj.iknai = 0;
	g_resultObj.fCombo = 0;
	g_resultObj.fmaxCombo = 0;
}

/*-----------------------------------------------------------*/
/* Scene : MAIN [banana] */
/*-----------------------------------------------------------*/

/**
 * メイン画面初期化
 */
function MainInit() {

	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");
	var layer1 = document.getElementById("layer1");
	var l1ctx = layer1.getContext("2d");
	var divRoot = document.getElementById("divRoot");

	g_workObj.word0Data = "";
	g_workObj.word1Data = "";
	g_currentArrows = 0;

	// ステップゾーン、矢印のメインスプライトを作成
	var mainSprite = createSprite("divRoot", "mainSprite", 0, 0, g_sWidth, g_sHeight);

	// 曲情報・判定カウント用スプライトを作成（メインスプライトより上位）
	var infoSprite = createSprite("divRoot", "infoSprite", 0, 0, g_sWidth, g_sHeight);

	// 判定系スプライトを作成（メインスプライトより上位）
	var judgeSprite = createSprite("divRoot", "judgeSprite", 0, 0, g_sWidth, g_sHeight);

	var keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	var keyNum = g_keyObj["chara" + keyCtrlPtn].length;

	// ステップゾーンを表示
	for (var j = 0; j < keyNum; j++) {
		var step = createArrowEffect("step" + j, "#999999",
			g_workObj.stepX[j],
			g_stepY + (g_distY - g_stepY - 50) * g_workObj.dividePos[j], 50,
			g_workObj.stepRtn[j]);
		mainSprite.appendChild(step);

		var stepHit = createArrowEffect("stepHit" + j, "#999999",
			g_workObj.stepX[j] - 15,
			g_stepY + (g_distY - g_stepY - 50) * g_workObj.dividePos[j] - 15, 80,
			g_workObj.stepRtn[j]);
		stepHit.style.opacity = 0;
		stepHit.setAttribute("cnt", 0);
		mainSprite.appendChild(stepHit);
	}

	// 矢印・フリーズアロー・速度変化 移動/判定/変化対象の初期化
	var arrowCnts = new Array();
	var frzCnts = new Array();
	for (var j = 0; j < keyNum; j++) {
		arrowCnts[j] = 0;
		frzCnts[j] = 0;
	}
	var speedCnts = 0;
	var boostCnts = 0;

	// 現在の矢印・フリーズアローの速度、個別加算速度の初期化 (速度変化時に直す)
	g_workObj.currentSpeed = 2;
	g_workObj.boostSpd = 1;

	// 開始位置、楽曲再生位置の設定
	var firstFrame = g_scoreObj.frameNum;
	if (firstFrame < g_headerObj.blankFrame) {
		var musicStartFrame = g_headerObj.blankFrame;
		g_audio.volume = g_stateObj.volume / 100;
	} else {
		var musicStartFrame = firstFrame + g_headerObj.blankFrame;
		g_audio.volume = 0;
	}

	// 曲時間制御変数
	var thisTime;
	var buffTime;
	var musicStartFlg = false;

	g_inputKeyBuffer = [];

	// 終了時間の設定
	var fullSecond = Math.floor(g_headerObj.blankFrame / 60 + g_audio.duration);
	var fullMin = Math.floor(fullSecond / 60);
	var fullSec = ("00" + Math.floor(fullSecond % 60)).slice(-2);
	var fullTime = fullMin + ":" + fullSec;
	var fadeOutFrame = Infinity;
	var preblankFrame = g_headerObj.blankFrame - g_headerObj.blankFrameDef + g_stateObj.adjustment;

	// フェードアウト時間指定の場合、その7秒(=420フレーム)後に終了する
	if (g_headerObj.fadeFrame != undefined) {
		if (isNaN(parseInt(g_headerObj.fadeFrame[g_stateObj.scoreId]))) {
		} else {
			fadeOutFrame = parseInt(g_headerObj.fadeFrame[g_stateObj.scoreId]);
			var fadeTmp = Math.floor((parseInt(g_headerObj.fadeFrame[g_stateObj.scoreId]) + C_FRM_AFTERFADE + preblankFrame) / 60) * 60;

			fullMin = Math.floor(fadeTmp / 3600);
			fullSec = ("00" + (fadeTmp / 60) % 60).slice(-2);
			fullTime = fullMin + ":" + fullSec;
		}
		// 終了時間指定の場合、その値を適用する
	} else if (g_headerObj.endFrame != undefined) {
		if (isNaN(parseInt(g_headerObj.endFrame))) {
		} else {
			var fullTmp = Math.floor((parseInt(g_headerObj.endFrame) + preblankFrame) / 60) * 60;

			fullMin = Math.floor(fullTmp / 3600);
			fullSec = ("00" + (fullTmp / 60) % 60).slice(-2);
			fullTime = fullMin + ":" + fullSec;
		}
	}

	// フレーム数
	var lblframe = createDivLabel("lblframe", 0, 0, 100, 30, 20, C_CLR_TITLE,
		g_scoreObj.frameNum);
	divRoot.appendChild(lblframe);

	// 判定カウンタ表示
	infoSprite.appendChild(makeCounterSymbol("lblIi", g_sWidth - 110, C_CLR_II, 1, 0));
	infoSprite.appendChild(makeCounterSymbol("lblShakin", g_sWidth - 110, C_CLR_SHAKIN, 2, 0));
	infoSprite.appendChild(makeCounterSymbol("lblMatari", g_sWidth - 110, C_CLR_MATARI, 3, 0));
	infoSprite.appendChild(makeCounterSymbol("lblUwan", g_sWidth - 110, C_CLR_UWAN, 4, 0));
	infoSprite.appendChild(makeCounterSymbol("lblMCombo", g_sWidth - 110, "#ffffff", 5, 0));

	infoSprite.appendChild(makeCounterSymbol("lblKita", g_sWidth - 110, C_CLR_KITA, 7, 0));
	infoSprite.appendChild(makeCounterSymbol("lblIknai", g_sWidth - 110, C_CLR_IKNAI, 8, 0));
	infoSprite.appendChild(makeCounterSymbol("lblFCombo", g_sWidth - 110, "#ffffff", 9, 0));

	// 歌詞表示1
	var lblWord0 = createDivLabel("lblword0", g_sWidth / 2 - 200, 10, g_sWidth - 100, 30, 14, "#ffffff",
		g_workObj.word0Data);
	lblWord0.style.textAlign = C_ALIGN_LEFT;
	judgeSprite.appendChild(lblWord0);

	// 歌詞表示2
	var lblWord1 = createDivLabel("lblword1", g_sWidth / 2 - 200, g_sHeight - 60, g_sWidth - 100, 20, 14, "#ffffff",
		g_workObj.word1Data);
	lblWord1.style.textAlign = C_ALIGN_LEFT;
	judgeSprite.appendChild(lblWord1);

	// 曲名・アーティスト名表示
	var lblCredit = createDivLabel("lblCredit", 125, g_sHeight - 30, g_sWidth - 125, 20, 14, "#cccccc",
		g_headerObj.musicTitle + " / " + g_headerObj.artistName);
	lblCredit.style.textAlign = C_ALIGN_LEFT;
	infoSprite.appendChild(lblCredit);

	// 曲時間表示1
	var lblTime1 = createDivLabel("lblTime1", 0, g_sHeight - 30, 50, 20, 14, "#cccccc",
		"-:--");
	lblTime1.style.textAlign = C_ALIGN_RIGHT;
	infoSprite.appendChild(lblTime1);

	// 曲時間表示2
	var lblTime2 = createDivLabel("lblTime2", 60, g_sHeight - 30, 50, 20, 14, "#cccccc",
		"/ " + fullTime);
	lblTime1.style.textAlign = C_ALIGN_RIGHT;
	infoSprite.appendChild(lblTime2);

	// 判定キャラクタ表示：矢印
	var charaJ = createDivLabel("charaJ", g_sWidth / 2 - 200, g_sHeight / 2 - 50,
		C_LEN_JDGCHARA_WIDTH, C_LEN_JDGCHARA_HEIGHT, C_SIZ_JDGCHARA, C_CLR_II, "");
	charaJ.style.textAlign = C_ALIGN_CENTER;
	charaJ.setAttribute("cnt", 0);
	judgeSprite.appendChild(charaJ);

	// コンボ表示：矢印
	var comboJ = createDivLabel("comboJ", g_sWidth / 2 - 50, g_sHeight / 2 - 50,
		C_LEN_JDGCHARA_WIDTH, C_LEN_JDGCHARA_HEIGHT, C_SIZ_JDGCHARA, C_CLR_KITA, "");
	comboJ.style.textAlign = C_ALIGN_CENTER;
	comboJ.setAttribute("cnt", 0);
	judgeSprite.appendChild(comboJ);

	// 判定キャラクタ表示：フリーズアロー
	var charaFJ = createDivLabel("charaFJ", g_sWidth / 2 - 100, g_sHeight / 2,
		C_LEN_JDGCHARA_WIDTH, C_LEN_JDGCHARA_HEIGHT, C_SIZ_JDGCHARA, C_CLR_KITA, "");
	charaFJ.style.textAlign = C_ALIGN_CENTER;
	charaFJ.setAttribute("cnt", 0);
	judgeSprite.appendChild(charaFJ);

	// コンボ表示：フリーズアロー
	var comboFJ = createDivLabel("comboFJ", g_sWidth / 2 + 50, g_sHeight / 2,
		C_LEN_JDGCHARA_WIDTH, C_LEN_JDGCHARA_HEIGHT, C_SIZ_JDGCHARA, C_CLR_II, "");
	comboFJ.style.textAlign = C_ALIGN_CENTER;
	comboFJ.setAttribute("cnt", 0);
	judgeSprite.appendChild(comboFJ);

	// パーフェクト演出
	var finishView = createDivLabel("finishView", g_sWidth / 2 - 150, g_sHeight / 2 - 50,
		300, 20, 50, C_CLR_KITA, "");
	finishView.style.textAlign = C_ALIGN_CENTER;
	judgeSprite.appendChild(finishView);

	// ユーザカスタムイベント(初期)
	if (typeof customMainInit == "function") {
		customMainInit();
	}

	// キー操作イベント
	document.onkeydown = function (evt) {

		// ブラウザ判定
		if (g_userAgent.indexOf("firefox") != -1) {
			var setKey = evt.which;
		} else {
			var setKey = event.keyCode;
		}
		g_inputKeyBuffer[setKey] = true;

		eval("mainKeyDownAct" + g_stateObj.auto)(setKey);

		// 曲中リトライ、タイトルバック
		if (setKey == 8) {
			g_audio.pause();
			clearTimeout(g_timeoutEvtId);
			clearWindow();
			g_audio.load();

			if (g_audio.readyState == 4) {
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
		} else if (setKey == 46) {
			g_audio.pause();
			clearTimeout(g_timeoutEvtId);
			clearWindow();
			if (keyIsDown(16)) {
				g_gameOverFlg = true;
				resultInit();
			} else {
				titleInit();
			}
		}

		for (var j = 0; j < C_BLOCK_KEYS.length; j++) {
			if (setKey == C_BLOCK_KEYS[j]) {
				return false;
			}
		}
	}

	/**
	 * キーを押したときの処理 (AutoPlay:OFF時)
	 * @param {number} _keyCode 
	 */
	function mainKeyDownActOFF(_keyCode) {
		var matchKeys = g_keyObj["keyCtrl" + keyCtrlPtn];

		for (var j = 0; j < keyNum; j++) {
			for (var k = 0; k < matchKeys[j].length; k++) {
				if (_keyCode == matchKeys[j][k] && g_workObj.keyHitFlg[j][k] == false) {
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
		if (g_userAgent.indexOf("firefox") != -1) {
			var setKey = evt.which;
		} else {
			var setKey = event.keyCode;
		}
		g_inputKeyBuffer[setKey] = false;

		eval("mainKeyUpAct" + g_stateObj.auto)();
	}

	/**
	 * キーを離したときの処理 (AutoPlay:OFF時)
	 */
	function mainKeyUpActOFF() {
		for (var j = 0; j < keyNum; j++) {

			var keyDownFlg = false;
			for (var m = 0, len = g_workObj.keyCtrl[j].length; m < len; m++) {
				if (keyIsDown(g_workObj.keyCtrl[j][m])) {
					keyDownFlg = true;
					break;
				}
			}
			if (keyDownFlg == false) {

				// ステップゾーンに対応するキーを離したとき
				var stepDiv = document.getElementById("step" + j);
				stepDiv.style.backgroundColor = "#999999";

				// フリーズアローを離したとき
				var k = g_workObj.judgFrzCnt[j];
				var frzRoot = document.getElementById("frz" + j + "_" + k);
				if (frzRoot != null) {
					if (frzRoot.getAttribute("judgEndFlg") == "false") {
						if (frzRoot.getAttribute("isMoving") == "false") {
							judgeIknai();
							frzRoot.setAttribute("judgEndFlg", "true");

							changeFailedFrz(j, k);
						}
					}
				}
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
		for (var j = 0; j < keyNum; j++) {
			for (var m = 0, len = g_workObj.keyCtrl[j].length; m < len; m++) {
				g_workObj.keyHitFlg[j][m] = keyIsDown(g_workObj.keyCtrl[j][m]);
			}
		}

		if (g_scoreObj.frameNum == musicStartFrame) {
			g_audio.play();
			musicStartFlg = true;
			g_audio.currentTime = firstFrame / 60;
			g_audio.dispatchEvent(new CustomEvent("timeupdate"));
		}

		// フェードイン・アウト
		if (g_audio.volume >= g_stateObj.volume / 100) {
			musicStartFlg = false;
			if (g_scoreObj.frameNum >= fadeOutFrame && g_scoreObj.frameNum < fadeOutFrame + C_FRM_AFTERFADE) {
				var tmpVolume = (g_audio.volume - (2.5 * g_stateObj.volume / 100) / 1000);
				if (tmpVolume < 0) {
					g_audio.volume = 0;
				} else {
					g_audio.volume = tmpVolume;
				}
			}
		} else {
			if (musicStartFlg == true) {
				var tmpVolume = (g_audio.volume + 5 / 1000);
				if (tmpVolume > 1) {
					g_audio.volume = 1;
				} else {
					g_audio.volume = tmpVolume;
				}
			} else if (g_scoreObj.frameNum >= fadeOutFrame && g_scoreObj.frameNum < fadeOutFrame + C_FRM_AFTERFADE) {
				var tmpVolume = (g_audio.volume - 5 / 1000);
				if (tmpVolume < 0) {
					g_audio.volume = 0;
				} else {
					g_audio.volume = tmpVolume;
				}
			}
		}

		// ユーザカスタムイベント(フレーム毎)
		if (typeof customMainEnterFrame == "function") {
			customMainEnterFrame();
		}

		// 速度変化 (途中変速, 個別加速)
		if (g_workObj.speedData != undefined && g_scoreObj.frameNum == g_workObj.speedData[speedCnts]) {
			g_workObj.currentSpeed = g_workObj.speedData[speedCnts + 1];
			speedCnts += 2;
		}
		if (g_workObj.boostData != undefined && g_scoreObj.frameNum == g_workObj.boostData[boostCnts]) {
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
		if (g_workObj.mkArrow[g_scoreObj.frameNum] != undefined) {
			for (var j = 0, len = g_workObj.mkArrow[g_scoreObj.frameNum].length; j < len; j++) {

				var targetj = g_workObj.mkArrow[g_scoreObj.frameNum][j];

				var step = createArrowEffect("arrow" + targetj + "_" + (++arrowCnts[targetj]), g_workObj.arrowColors[targetj],
					g_workObj.stepX[targetj],
					g_stepY + (g_distY - g_stepY - 50) * g_workObj.dividePos[targetj] + g_workObj.initY[g_scoreObj.frameNum] * g_workObj.boostSpd * g_workObj.scrollDir[targetj], 50,
					g_workObj.stepRtn[targetj]);
				step.setAttribute("cnt", g_workObj.arrivalFrame[g_scoreObj.frameNum]);
				step.setAttribute("boostCnt", g_workObj.motionFrame[g_scoreObj.frameNum]);
				step.setAttribute("judgEndFlg", "false");
				step.setAttribute("boostSpd", g_workObj.boostSpd);

				mainSprite.appendChild(step);
			}
			//delete g_workObj.mkArrow[g_scoreObj.frameNum];
		}

		// 矢印移動＆消去
		for (var j = 0; j < keyNum; j++) {

			var stepDivHit = document.getElementById("stepHit" + j);

			for (var k = g_workObj.judgArrowCnt[j]; k <= arrowCnts[j]; k++) {
				var arrow = document.getElementById("arrow" + j + "_" + k);
				var boostCnt = arrow.getAttribute("boostCnt");
				var boostSpd = arrow.getAttribute("boostSpd");
				var cnt = arrow.getAttribute("cnt");

				// 全体色変化 (移動時)
				if (g_workObj.mkAColor[g_scoreObj.frameNum] != undefined) {
					if (arrow.getAttribute("color") != g_workObj.arrowColors[j]) {
						if (g_workObj.arrowColors[j] == g_workObj.arrowColorsAll[j]) {
							arrow.style.backgroundColor = g_workObj.arrowColorsAll[j];
							arrow.setAttribute("color", g_workObj.arrowColorsAll[j]);
						}
					}
				}

				// 移動
				if (g_workObj.currentSpeed != 0) {
					arrow.style.top = (parseFloat(arrow.style.top) -
						(g_workObj.currentSpeed + g_workObj.motionOnFrames[boostCnt]) * boostSpd * g_workObj.scrollDir[j]) + "px";
					arrow.setAttribute("boostCnt", --boostCnt);
				}
				arrow.setAttribute("cnt", --cnt);

				if (g_stateObj.auto == "ON") {
					if (cnt == 0) {
						judgeIi();
						stepDivHit.style.opacity = 1;
						stepDivHit.setAttribute("cnt", C_FRM_HITMOTION);
						g_workObj.judgArrowCnt[j]++;
						mainSprite.removeChild(arrow);
					}

				} else if (cnt < (-1) * g_judgObj.arrowJ[C_JDG_UWAN]) {
					judgeUwan();
					g_workObj.judgArrowCnt[j]++;
					mainSprite.removeChild(arrow);
				}
			}

			// ステップゾーンのヒット領域は一定時間で非表示化
			var hitCnt = stepDivHit.getAttribute("cnt");
			if (hitCnt > 0) {
				stepDivHit.setAttribute("cnt", --hitCnt);
				if (hitCnt == 0) {
					stepDivHit.style.opacity = 0;
				}
			}
		}

		// フリーズアロー生成
		if (g_workObj.mkFrzArrow[g_scoreObj.frameNum] != undefined) {
			for (var j = 0, len = g_workObj.mkFrzArrow[g_scoreObj.frameNum].length; j < len; j++) {
				var targetj = g_workObj.mkFrzArrow[g_scoreObj.frameNum][j];
				var frzLength = g_workObj.mkFrzLength[targetj][frzCnts[targetj] * 2];
				var rev = g_workObj.scrollDir[targetj];

				var frzRoot = createSprite("mainSprite", "frz" + targetj + "_" + (++frzCnts[targetj]),
					g_workObj.stepX[targetj],
					g_stepY + (g_distY - g_stepY - 50) * g_workObj.dividePos[targetj] + g_workObj.initY[g_scoreObj.frameNum] * g_workObj.boostSpd * rev,
					50, 100 + frzLength);
				frzRoot.setAttribute("cnt", g_workObj.arrivalFrame[g_scoreObj.frameNum]);
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
				var frzBar = createColorObject("frzBar" + targetj + "_" + (frzCnts[targetj]), g_workObj.frzNormalBarColors[targetj],
					5, 25 - frzLength * g_workObj.boostSpd * g_workObj.dividePos[targetj], 40, frzLength * g_workObj.boostSpd, 0, "frzBar", "../img/frzBar.png");
				frzRoot.appendChild(frzBar);

				// 開始矢印の塗り部分。ヒット時は前面に出て光る。
				var frzTopShadow = createColorObject("frzTopShadow" + targetj + "_" + (frzCnts[targetj]), "#000000",
					0, 0, 50, 50, g_workObj.stepRtn[targetj], "arrowShadow", "../img/arrowshadow_500.png");
				frzRoot.appendChild(frzTopShadow);

				// 開始矢印。ヒット時は隠れる。
				var frzTop = createArrowEffect("frzTop" + targetj + "_" + (frzCnts[targetj]), g_workObj.frzNormalColors[targetj],
					0, 0, 50, g_workObj.stepRtn[targetj]);
				frzRoot.appendChild(frzTop);

				// 後発矢印の塗り部分
				var frzBtmShadow = createColorObject("frzBtmShadow" + targetj + "_" + (frzCnts[targetj]), "#000000",
					0, frzLength * g_workObj.boostSpd * rev, 50, 50, g_workObj.stepRtn[targetj], "arrowShadow", "../img/arrowshadow_500.png");
				frzRoot.appendChild(frzBtmShadow);

				// 後発矢印
				var frzBtm = createArrowEffect("frzBtm" + targetj + "_" + (frzCnts[targetj]), g_workObj.frzNormalColors[targetj],
					0, frzLength * g_workObj.boostSpd * rev, 50, g_workObj.stepRtn[targetj]);
				frzRoot.appendChild(frzBtm);
			}
		}

		// フリーズアロー移動＆消去
		for (var j = 0; j < keyNum; j++) {
			for (var k = g_workObj.judgFrzCnt[j]; k <= frzCnts[j]; k++) {
				var frzRoot = document.getElementById("frz" + j + "_" + k);
				var boostCnt = frzRoot.getAttribute("boostCnt");
				var boostSpd = frzRoot.getAttribute("boostSpd");
				var cnt = frzRoot.getAttribute("cnt");

				var frzTop = document.getElementById("frzTop" + j + "_" + k);
				var frzBar = document.getElementById("frzBar" + j + "_" + k);
				var frzBtm = document.getElementById("frzBtm" + j + "_" + k);
				var frzBarLength = frzRoot.getAttribute("frzBarLength");

				if (frzRoot.getAttribute("judgEndFlg") == "false") {
					if (frzRoot.getAttribute("isMoving") == "true") {

						// 全体色変化 (通常時)
						if (g_workObj.mkFAColor[g_scoreObj.frameNum] != undefined) {
							if (frzBtm.getAttribute("color") != g_workObj.frzNormalColors[j]) {
								if (g_workObj.frzNormalColors[j] == g_workObj.frzNormalColorsAll[j]) {
									frzTop.style.backgroundColor = g_workObj.frzNormalColorsAll[j];
									frzBtm.style.backgroundColor = g_workObj.frzNormalColorsAll[j];
									frzBtm.setAttribute("color", g_workObj.frzNormalColorsAll[j]);
								}
							}
							if (frzBar.getAttribute("color") != g_workObj.frzNormalBarColors[j]) {
								if (g_workObj.frzNormalBarColors[j] == g_workObj.frzNormalBarColorsAll[j]) {
									frzBar.style.backgroundColor = g_workObj.frzNormalBarColorsAll[j];
									frzBar.setAttribute("color", g_workObj.frzNormalBarColorsAll[j]);
								}
							}
						}

						// 移動
						if (g_workObj.currentSpeed != 0) {
							frzRoot.style.top = (parseFloat(frzRoot.style.top) -
								(g_workObj.currentSpeed + g_workObj.motionOnFrames[boostCnt]) * boostSpd * g_workObj.scrollDir[j]) + "px";
							frzRoot.setAttribute("boostCnt", --boostCnt);
						}
						frzRoot.setAttribute("cnt", --cnt);

						if (g_stateObj.auto == "ON" && cnt == 0) {
							changeHitFrz(j, k);
						}
					} else {
						var frzBtmShadow = document.getElementById("frzBtmShadow" + j + "_" + k);

						// 全体色変化 (ヒット時)
						if (g_workObj.mkFAColor[g_scoreObj.frameNum] != undefined) {
							if (frzBtm.getAttribute("color") != g_workObj.frzHitColors[j]) {
								if (g_workObj.frzHitColors[j] == g_workObj.frzHitColorsAll[j]) {
									frzBtm.style.backgroundColor = g_workObj.frzHitColorsAll[j];
									frzBtm.setAttribute("color", g_workObj.frzHitColorsAll[j]);
								}
							}
							if (frzBar.getAttribute("color") != g_workObj.frzHitBarColors[j]) {
								if (g_workObj.frzHitBarColors[j] == g_workObj.frzHitBarColorsAll[j]) {
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
						} else {
							judgeKita();

							g_workObj.judgFrzCnt[j]++;
							frzRoot.setAttribute("judgEndFlg", "true");
							mainSprite.removeChild(frzRoot);
						}
					}

					// フリーズアローが枠外に出たときの処理
					if (cnt < (-1) * g_judgObj.frzJ[C_JDG_IKNAI]) {
						judgeIknai();
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
		if (g_scoreObj.wordData[g_scoreObj.frameNum] != undefined) {
			g_wordObj.wordDir = g_scoreObj.wordData[g_scoreObj.frameNum][0];
			g_wordObj.wordDat = g_scoreObj.wordData[g_scoreObj.frameNum][1];
			g_wordSprite = document.getElementById("lblword" + g_wordObj.wordDir);

			if (g_wordObj.wordDat == "[fadein]") {
				g_wordObj["fadeInFlg" + g_wordObj.wordDir] = true;
				g_wordObj["fadeOutFlg" + g_wordObj.wordDir] = false;
				g_wordSprite.style.opacity = 0;

			} else if (g_wordObj.wordDat == "[fadeout]") {
				g_wordObj["fadeInFlg" + g_wordObj.wordDir] = false;
				g_wordObj["fadeOutFlg" + g_wordObj.wordDir] = true;
				g_wordSprite.style.opacity = 1;

			} else {
				if (g_wordObj["fadeOutFlg" + g_wordObj.wordDir] == false
					&& g_wordSprite.style.opacity == 0) {
					g_wordSprite.style.opacity = 1;
				}
				g_workObj["word" + g_wordObj.wordDir + "Data"] = g_wordObj.wordDat;
				g_wordSprite.innerHTML = g_wordObj.wordDat;
			}
		}

		// 歌詞フェードイン・アウト
		fadeWord("0");
		fadeWord("1");

		// 判定キャラクタ消去
		var charaJCnt = document.getElementById("charaJ").getAttribute("cnt");
		if (charaJCnt > 0) {
			document.getElementById("charaJ").setAttribute("cnt", --charaJCnt);
			if (charaJCnt == 0) {
				document.getElementById("charaJ").innerHTML = "";
				document.getElementById("comboJ").innerHTML = "";
			}
		}
		var charaFJCnt = document.getElementById("charaFJ").getAttribute("cnt");
		if (charaFJCnt > 0) {
			document.getElementById("charaFJ").setAttribute("cnt", --charaFJCnt);
			if (charaFJCnt == 0) {
				document.getElementById("charaFJ").innerHTML = "";
				document.getElementById("comboFJ").innerHTML = "";
			}
		}

		// タイマー、曲終了判定
		if (g_scoreObj.frameNum % 60 == 0) {
			var currentMin = Math.floor(g_scoreObj.frameNum / 3600);
			var currentSec = ("00" + (g_scoreObj.frameNum / 60) % 60).slice(-2);
			var currentTime = currentMin + ":" + currentSec;
			lblTime1.innerHTML = currentTime;

			if (currentTime == fullTime) {
				g_audio.pause();
				clearTimeout(g_timeoutEvtId);
				clearWindow();
				resultInit();
			}
		}

		// 60fpsから遅延するため、その差分を取って次回のタイミングで遅れをリカバリする
		thisTime = new Date();
		buffTime = (thisTime.getTime() - mainStartTime.getTime() - (g_scoreObj.frameNum - firstFrame) * 1000 / 60);
		g_scoreObj.frameNum++;
		g_timeoutEvtId = setTimeout(function () { flowTimeline() }, 1000 / 60 - buffTime);
	}
	var mainStartTime = new Date();
	g_timeoutEvtId = setTimeout(flowTimeline(), 1000 / 60);
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
	var counter = createDivLabel(_id, _x, C_LEN_JDGCNTS_HEIGHT * _heightPos,
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

	if (_mkColor != undefined) {
		for (var j = 0, len = _mkColor.length; j < len; j++) {
			var targetj = _mkColor[j];
			g_workObj.arrowColors[targetj] = _mkColorCd[j];
			if (_allFlg == "A") {
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

	if (_mkColor != undefined) {
		for (var j = 0, len = _mkColor.length; j < len; j++) {

			var targetj = _mkColor[j];

			// targetj=0,2,4,6,8 ⇒ Arrow, 1,3,5,7,9 ⇒ Bar
			if (targetj < 10) {
				if (targetj % 2 == 0) {
					// 矢印 (通常)
					for (var k = 0; k < _keyNum; k++) {
						if (targetj / 2 == _colorPatterns[k]) {
							g_workObj.frzNormalColors[k] = _mkColorCd[j];
							if (_allFlg == "A") {
								g_workObj.frzNormalColorsAll[k] = _mkColorCd[j];
							}
						}
					}
				} else {
					// 帯 (通常)
					for (var k = 0; k < _keyNum; k++) {
						if ((targetj - 1) / 2 == _colorPatterns[k]) {
							g_workObj.frzNormalBarColors[k] = _mkColorCd[j];
							if (_allFlg == "A") {
								g_workObj.frzNormalBarColorsAll[k] = _mkColorCd[j];
							}
						}
					}
				}
			} else {
				targetj -= 10;
				if (targetj % 2 == 0) {
					// 矢印 (ヒット時)
					for (var k = 0; k < _keyNum; k++) {
						if (targetj / 2 == _colorPatterns[k]) {
							g_workObj.frzHitColors[k] = _mkColorCd[j];
							if (_allFlg == "A") {
								g_workObj.frzHitColorsAll[k] = _mkColorCd[j];
							}
						}
					}
				} else {
					// 帯 (ヒット時)
					for (var k = 0; k < _keyNum; k++) {
						if ((targetj - 1) / 2 == _colorPatterns[k]) {
							g_workObj.frzHitBarColors[k] = _mkColorCd[j];
							if (_allFlg == "A") {
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

	if (g_wordObj["fadeInFlg" + _wordDir] == true) {
		var wordAlpha = parseFloat(document.getElementById("lblword" + _wordDir).style.opacity);
		if (wordAlpha + 0.04 >= 0.99) {
			g_wordObj["fadeInFlg" + _wordDir] = false;
			document.getElementById("lblword" + _wordDir).style.opacity = 1;
		} else {
			wordAlpha += 0.04;
			document.getElementById("lblword" + _wordDir).style.opacity = wordAlpha;
		}
	} else if (g_wordObj["fadeOutFlg" + _wordDir] == true) {
		var wordAlpha = parseFloat(document.getElementById("lblword" + _wordDir).style.opacity);
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

	var frzTopShadow = document.getElementById("frzTopShadow" + _j + "_" + _k);
	if (frzTopShadow.getAttribute("type") == "arrow") {
		var fstyle = frzTopShadow.style;
		fstyle.backgroundColor = "#ffffff";
		fstyle.top = "-10px";
		fstyle.left = "-10px";
		fstyle.width = "70px";
		fstyle.height = "70px";
		fstyle.opacity = 70;
		document.getElementById("frzTop" + _j + "_" + _k).style.opacity = 0;
	} else {
		document.getElementById("frzTop" + _j + "_" + _k).style.backgroundColor = g_workObj.frzHitColors[_j];
	}

	var frzBar = document.getElementById("frzBar" + _j + "_" + _k);
	frzBar.style.backgroundColor = g_workObj.frzHitBarColors[_j];
	document.getElementById("frzBtm" + _j + "_" + _k).style.backgroundColor = g_workObj.frzHitColors[_j];
	document.getElementById("frz" + _j + "_" + _k).setAttribute("isMoving", "false");
}

/**
 * フリーズアロー失敗時の描画変更
 * @param {number} _j 
 * @param {number} _k 
 */
function changeFailedFrz(_j, _k) {
	var frzTopShadow = document.getElementById("frzTopShadow" + _j + "_" + _k);
	var fstyle = frzTopShadow.style;
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

	if (g_judgObj.lockFlgs[_j] == false) {
		g_judgObj.lockFlgs[_j] = true;

		var mainSprite = document.getElementById("mainSprite");
		var currentNo = g_workObj.judgArrowCnt[_j];
		var stepDivHit = document.getElementById("stepHit" + _j);
		var judgArrow = document.getElementById("arrow" + _j + "_" + currentNo);

		var fcurrentNo = g_workObj.judgFrzCnt[_j];

		if (judgArrow != null) {
			var difCnt = Math.abs(judgArrow.getAttribute("cnt"));
			var judgEndFlg = judgArrow.getAttribute("judgEndFlg");

			if (difCnt <= g_judgObj.arrowJ[C_JDG_UWAN] && judgEndFlg == "false") {
				stepDivHit.style.opacity = 0.75;
				var charaJ = document.getElementById("charaJ");

				if (difCnt <= g_judgObj.arrowJ[C_JDG_II]) {
					judgeIi();
					stepDivHit.style.background = C_CLR_II;
				} else if (difCnt <= g_judgObj.arrowJ[C_JDG_SHAKIN]) {
					judgeShakin();
					stepDivHit.style.background = C_CLR_SHAKIN;
				} else if (difCnt <= g_judgObj.arrowJ[C_JDG_MATARI]) {
					judgeMatari();
					stepDivHit.style.background = C_CLR_MATARI;
				} else {
					judgeUwan();
					stepDivHit.style.background = C_CLR_UWAN;
				}
				stepDivHit.setAttribute("cnt", C_FRM_HITMOTION);

				mainSprite.removeChild(judgArrow);
				g_workObj.judgArrowCnt[_j]++;

				g_judgObj.lockFlgs[_j] = false;
				return;
			}
		}

		var judgFrz = document.getElementById("frz" + _j + "_" + fcurrentNo);

		if (judgFrz != null) {
			var difCnt = Math.abs(judgFrz.getAttribute("cnt"));
			var judgEndFlg = judgFrz.getAttribute("judgEndFlg");

			if (difCnt <= g_judgObj.frzJ[C_JDG_SFSF] && judgEndFlg == "false") {
				changeHitFrz(_j, fcurrentNo);
				g_judgObj.lockFlgs[_j] = false;
				return;
			}
		}
		var stepDiv = document.getElementById("step" + _j);
		stepDiv.style.backgroundColor = "#66ffff";
		g_judgObj.lockFlgs[_j] = false;
	}
}

function judgeIi() {
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

	finishViewing();
}

function judgeShakin() {
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

	finishViewing();
}

function judgeMatari() {
	g_resultObj.matari++;
	g_currentArrows++;
	document.getElementById("charaJ").innerHTML = "<span style='color:" + C_CLR_MATARI + "'>" + C_JCR_MATARI + "</span>";
	document.getElementById("charaJ").setAttribute("cnt", C_FRM_JDGMOTION);

	document.getElementById("lblMatari").innerHTML = g_resultObj.matari;
	document.getElementById("comboJ").innerHTML = "";

	finishViewing();
}

function judgeUwan() {
	g_resultObj.uwan++;
	g_currentArrows++;
	document.getElementById("charaJ").innerHTML = "<span style='color:" + C_CLR_UWAN + "'>" + C_JCR_UWAN + "</span>";
	document.getElementById("charaJ").setAttribute("cnt", C_FRM_JDGMOTION);

	document.getElementById("lblUwan").innerHTML = g_resultObj.uwan;
	g_resultObj.combo = 0;
	document.getElementById("comboJ").innerHTML = "";
}

function judgeKita() {
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

	finishViewing();
}

function judgeIknai() {
	g_resultObj.iknai++;
	g_currentArrows++;
	document.getElementById("lblIknai").innerHTML = g_resultObj.iknai;
	document.getElementById("charaFJ").innerHTML = "<span style='color:" + C_CLR_IKNAI + "'>" + C_JCR_IKNAI + "</span>";
	document.getElementById("charaFJ").setAttribute("cnt", C_FRM_JDGMOTION);
	document.getElementById("comboFJ").innerHTML = "";
	g_resultObj.fCombo = 0;
}

function finishViewing() {
	if (g_currentArrows == g_allArrow + g_allFrz / 2) {
		var fullArrows = g_allArrow + g_allFrz / 2;
		if (g_resultObj.ii + g_resultObj.kita == fullArrows) {
			document.getElementById("finishView").innerHTML = "<span style='color:#ffffff;'>All Perfect!!</span>";
			document.getElementById("finishView").style.opacity = 1;
			document.getElementById("charaJ").innerHTML = "";
			document.getElementById("comboJ").innerHTML = "";
			document.getElementById("charaFJ").innerHTML = "";
			document.getElementById("comboFJ").innerHTML = "";
		} else if (g_resultObj.ii + g_resultObj.shakin + g_resultObj.kita == fullArrows) {
			document.getElementById("finishView").innerHTML = "Perfect!!";
			document.getElementById("finishView").style.opacity = 1;
			document.getElementById("charaJ").innerHTML = "";
			document.getElementById("comboJ").innerHTML = "";
			document.getElementById("charaFJ").innerHTML = "";
			document.getElementById("comboFJ").innerHTML = "";
		} else if (g_resultObj.uwan == 0 && g_resultObj.iknai == 0) {
			document.getElementById("finishView").innerHTML = "<span style='color:#66ffff;'>FullCombo!</span>";
			document.getElementById("finishView").style.opacity = 1;
			document.getElementById("charaJ").innerHTML = "";
			document.getElementById("comboJ").innerHTML = "";
			document.getElementById("charaFJ").innerHTML = "";
			document.getElementById("comboFJ").innerHTML = "";
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

	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");
	var layer1 = document.getElementById("layer1");
	var l1ctx = layer1.getContext("2d");
	var layer2 = document.getElementById("layer2");
	var l2ctx = layer2.getContext("2d");
	var divRoot = document.getElementById("divRoot");

	// タイトル文字描画
	var lblTitle = getTitleDivLabel("lblTitle",
		"<span style='color:#6666ff;font-size:40px;'>R</span>ESULT", 0, 15);
	divRoot.appendChild(lblTitle);

	var resultWindow = createSprite("divRoot", "resultWindow", g_sWidth / 2 - 150, 100, 300, 310);

	// スコア計算(一括)
	var scoreTmp = g_resultObj.ii * 8 +
		g_resultObj.shakin * 4 +
		g_resultObj.matari * 2 +
		g_resultObj.kita * 8 +
		g_resultObj.sfsf * 4 +
		g_resultObj.maxCombo * 2 +
		g_resultObj.fmaxCombo * 2;

	var allScore = (g_allArrow + g_allFrz / 2) * 10;
	var resultScore = Math.round(scoreTmp / allScore * 1000000);
	g_resultObj.score = resultScore;

	// ランク計算
	var rankMark = "";
	var rankColor = "";
	if (g_gameOverFlg == true) {
		rankMark = g_rankObj.rankMarkF;
		rankColor = g_rankObj.rankColorF;
	} else if (g_headerObj.startFrame == 0 && g_stateObj.auto == "OFF") {
		if (g_resultObj.matari + g_resultObj.uwan + g_resultObj.sfsf + g_resultObj.iknai == 0) {
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


	// Twitter用リザルト
	if (g_headerObj.hashTag != undefined) {
		var hashTag = " " + g_headerObj.hashTag;
	} else {
		var hashTag = "";
	}
	var tweetResultTmp = "【#danoni" + hashTag + "】" + g_headerObj.musicTitle + "(" +
		g_headerObj.keyLabels[g_stateObj.scoreId] + "k-" + g_headerObj.difLabels[g_stateObj.scoreId] + ")/" +
		g_headerObj.tuning + "/" +
		"Rank:" + rankMark + "/" +
		"Score:" + resultScore + "/" +
		g_resultObj.ii + "-" + g_resultObj.shakin + "-" + g_resultObj.matari + "-" + g_resultObj.uwan + "/" +
		g_resultObj.kita + "-" + g_resultObj.iknai + "/" +
		g_resultObj.maxCombo + "-" + g_resultObj.fmaxCombo + " " +
		location.href;
	var tweetResult = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(tweetResultTmp);

	// キャラクタ描画
	resultWindow.appendChild(makeResultSymbol("lblIi", 0, C_CLR_II, 0, C_JCR_II, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol("lblShakin", 0, C_CLR_SHAKIN, 1, C_JCR_SHAKIN, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol("lblMatari", 0, C_CLR_MATARI, 2, C_JCR_MATARI, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol("lblUwan", 0, C_CLR_UWAN, 3, C_JCR_UWAN, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol("lblKita", 0, C_CLR_KITA, 4, C_JCR_KITA, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol("lblIknai", 0, C_CLR_IKNAI, 5, C_JCR_IKNAI, C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol("lblMCombo", 0, "#ffffff", 6, "MaxCombo", C_ALIGN_LEFT));
	resultWindow.appendChild(makeResultSymbol("lblFCombo", 0, "#ffffff", 7, "FreezeCombo", C_ALIGN_LEFT));

	resultWindow.appendChild(makeResultSymbol("lblScore", 0, "#ffffff", 9, "Score", C_ALIGN_LEFT));

	// スコア描画
	resultWindow.appendChild(makeResultSymbol("lblIiS", 130, "#ffffff", 0, g_resultObj.ii, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol("lblShakinS", 130, "#ffffff", 1, g_resultObj.shakin, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol("lblMatariS", 130, "#ffffff", 2, g_resultObj.matari, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol("lblUwanS", 130, "#ffffff", 3, g_resultObj.uwan, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol("lblKitaS", 130, "#ffffff", 4, g_resultObj.kita, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol("lblIknaiS", 130, "#ffffff", 5, g_resultObj.iknai, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol("lblMComboS", 130, "#ffffff", 6, g_resultObj.maxCombo, C_ALIGN_RIGHT));
	resultWindow.appendChild(makeResultSymbol("lblFComboS", 130, "#ffffff", 7, g_resultObj.fmaxCombo, C_ALIGN_RIGHT));

	resultWindow.appendChild(makeResultSymbol("lblScoreS", 130, "#ffffff", 9, g_resultObj.score, C_ALIGN_RIGHT));

	// ランク描画
	var lblRank = createDivCustomLabel("lblRank", 300, 200, 70, 20, 50, "#ffffff",
		"<span style='color:" + rankColor + ";'>" + rankMark + "</span>", "'Bookman Old Style', 'Meiryo UI', sans-serif");
	lblRank.style.textAlign = C_ALIGN_CENTER;
	resultWindow.appendChild(lblRank);

	// ユーザカスタムイベント(初期)
	if (typeof customResultInit == "function") {
		customResultInit();
	}

	// 戻るボタン描画
	var btnBack = createButton({
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

	// Tweetボタン描画
	var btnTweet = createButton({
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
	var btnRetry = createButton({
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
		clearWindow();
		g_audio.load();

		if (g_audio.readyState == 4) {
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
		if (g_userAgent.indexOf("firefox") != -1) {
			var setKey = evt.which;
		} else {
			var setKey = event.keyCode;
		}
		for (var j = 0; j < C_BLOCK_KEYS.length; j++) {
			if (setKey == C_BLOCK_KEYS[j]) {
				return false;
			}
		}
	}
}

/**
 * 結果表示作成
 * @param {string} _id 
 * @param {number} _x
 * @param {string} _color 
 * @param {number} _heightPos 
 * @param {string, number} _text
 */
function makeResultSymbol(_id, _x, _color, _heightPos, _text, _align) {
	var symbol = createDivLabel(_id, _x, 24 * _heightPos,
		150, 24, 20, _color, _text);
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