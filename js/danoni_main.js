/**
 * Dancing☆Onigiri
 * Ver 0.21.1
 * 
 * Source by tickle
 * created : 2018/10/08
 * Revised : 2018/10/15
 */
'use strict';

// ショートカット用文字列(↓の文字列を検索することで対称箇所へジャンプできます)
//  タイトル:melon  オプション:lime  キーコンフィグ:orange  譜面読込:strawberry  メイン:banana  結果:grape
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
 *  [タイトル]-[オプション]-[キーコンフィグ]-[譜面読込]-[メイン]-[リザルト]
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

window.onload = function(){
	titleInit();
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
var C_LBL_BASICFONT = "Meiryo UI";

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
	adjustment: 0
};

// サイズ(後で指定)
var g_sWidth;
var g_sHeight;

// キーコンフィグカーソル
var g_currentj = 0;
var g_currentk = 0;
var g_prevKey = -1;

// キーコード
var g_kCd = new Array();
for(var j=0; j<255; j++){
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
	chara5_0: ["left","down","up","right","space"],
	chara7_0: ["left","leftdia","down","space","up","rightdia","right"],
	chara7i_0: ["left","leftdia","down","space","up","rightdia","right"],
	chara8_0: ["left","leftdia","down","space","up","rightdia","right","sleft"],
	chara9A_0: ["left","down","up","right","space","sleft","sdown","sup","sright"],
	chara9B_0: ["left","down","up","right","space","sleft","sdown","sup","sright"],
	chara9i_0: ["left","down","up","right","space","sleft","sdown","sup","sright"],
	chara11_0: ["sleft","sdown","sup","sright",
		"left","leftdia","down","space","up","rightdia","right"],
	chara11L_0: ["sleft","sdown","sup","sright",
		"left","leftdia","down","space","up","rightdia","right"],
	chara12_0: ["sleft","sdown","sup","sright",
		"oni","left","leftdia","down","space","up","rightdia","right"],
	chara14_0: ["sleftdia","sleft","sdown","sup","sright","srightdia",
		"oni","left","leftdia","down","space","up","rightdia","right"],
	chara17_0: ["aleft","bleft","adown","bdown","aup","bup","aright","bright","space",
		"cleft","dleft","cdown","ddown","cup","dup","cright","dright"],

	chara5_1: ["space","left","down","up","right"],
	chara9A_1: ["left","down","up","right","space","sleft","sdown","sup","sright"],
	chara11_1: ["space","sleft","sdown","sup","sright",
		"left","leftdia","down","up","rightdia","right"],
	chara11L_1: ["sleft","sdown","sup","sright","space",
		"left","leftdia","down","up","rightdia","right"],
	chara12_1: ["sleft","sdown","sup","sright",
		"oni","left","leftdia","down","space","up","rightdia","right"],
	chara14_1: ["sleftdia","sleft","sdown","sup","sright","srightdia",
		"oni","left","leftdia","down","space","up","rightdia","right"],

	chara5_2: ["left","down","space","up","right"],

	// カラーパターン
	color5_0: [0,0,0,0,2],
	color7_0: [0,1,0,2,0,1,0],
	color7i_0: [2,2,2,0,0,0,0],
	color8_0: [0,1,0,2,0,1,0,2],
	color9A_0: [0,0,0,0,2,3,3,3,3],
	color9B_0: [1,0,1,0,2,0,1,0,1],
	color9i_0: [2,2,2,2,2,0,0,0,0],
	color11_0: [3,3,3,3,0,1,0,2,0,1,0],
	color11L_0: [3,3,3,3,0,1,0,2,0,1,0],
	color12_0: [3,3,3,3,2,0,1,0,1,0,1,0],
	color14_0: [4,3,3,3,3,4,2,0,1,0,1,0,1,0],
	color17_0: [0,1,0,1,0,1,0,1,2,1,0,1,0,1,0,1,0],

	color5_1: [2,0,0,0,0],
	color9A_1: [0,0,0,0,2,3,3,3,3],
	color11_1: [2,3,3,3,3,0,1,0,0,1,0],
	color11L_1: [3,3,3,3,2,0,1,0,0,1,0],
	color12_1: [3,3,3,3,2,0,1,0,1,0,1,0],
	color14_1: [4,3,3,3,3,4,2,0,1,0,1,0,1,0],

	color5_2: [0,0,2,0,0],

	// 基本パターン (矢印回転、AAキャラクタ)
	// - AAキャラクタの場合、キャラクタ名を指定
	stepRtn5_0: [0, -90, 90, 180, "onigiri"],
	stepRtn7_0: [0, -45, -90, "onigiri", 90, 135, 180],
	stepRtn7i_0: ["giko", "onigiri", "iyo", 0, -90, 90, 180],
	stepRtn8_0: [0, -45, -90, "onigiri", 90, 135, 180, "onigiri"],
	stepRtn9A_0: [0, -90, 90, 180, "onigiri", 0, -90, 90, 180],
	stepRtn9B_0: [45, 0, -45, -90, "onigiri", 90, 135, 180, 225],
	stepRtn9i_0: ["monar", "giko", "c", "morara", "onigiri", 0, -90, 90, 180],
	stepRtn11_0: [0, -90, 90, 180, 0, -45, -90, "onigiri", 90, 135, 180],
	stepRtn11L_0: [0, -90, 90, 180, 0, -45, -90, "onigiri", 90, 135, 180],
	stepRtn12_0: [0, -90, 90, 180, "onigiri", 0, 30, 60, 90, 120, 150, 180],
	stepRtn14_0: [45, 0, -90, 90, 180, 135, "onigiri", 0, 30, 60, 90, 120, 150, 180],
	stepRtn17_0: [0, -22.5, -45, -67.5, -90, -112.5, -135, -157.5, "onigiri", 
		22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180],
	
	// 変則パターン (矢印回転、AAキャラクタ)
	// - 末尾の番号をカウントアップさせることで実現できる。keyCtrlと合わせること
	// - 配列の数は、通常パターンと同数で無くてはいけない（keyCtrlも同様）
	stepRtn5_1: ["onigiri", 0, -90, 90, 180],
	stepRtn9A_1: [0, -90, 90, 180, "onigiri", 0, -90, 90, 180],
	stepRtn11_1: ["onigiri", 0, -90, 90, 180, 0, -45, -90, 90, 135, 180],
	stepRtn11L_1: [0, -90, 90, 180, "onigiri", 0, -45, -90, 90, 135, 180],
	stepRtn12_1: [0, -90, 90, 180, "onigiri", 0, 30, 60, 90, 120, 150, 180],
	stepRtn14_1: [45, 0, -90, 90, 180, 135, "onigiri", 0, 30, 60, 90, 120, 150, 180],

	stepRtn5_2: [0, -90, "onigiri", 90, 180],

	// 各キーの区切り位置
	div5_0: 5,
	div7_0: 7,
	div7i_0: 7,
	div8_0: 8,
	div9A_0: 9,
	div9B_0: 9,
	div9i_0: 9,
	div11_0: 6,
	div11L_0: 6,
	div12_0: 5,
	div14_0: 7,
	div17_0: 9,

	div5_1: 5,
	div9A_1: 9,
	div11_1: 6,
	div11L_1: 6,
	div12_1: 5,
	div14_1: 7,

	div5_2: 5,

	// 各キーの位置関係
	pos5_0: [0,1,2,3,4],
	pos7_0: [0,1,2,3,4,5,6],
	pos7i_0: [0,1,2,3,4,5,6],
	pos8_0: [0,1,2,3,4,5,6,7],
	pos9A_0: [0,1,2,3,4,5,6,7,8],
	pos9B_0: [0,1,2,3,4,5,6,7,8],
	pos9i_0: [0,1,2,3,4,5,6,7,8],
	pos11_0: [2,3,4,5,6,7,8,9,10,11,12],
	pos11L_0: [0,1,2,3,6,7,8,9,10,11,12],
	pos12_0: [1,2,3,4,5,6,7,8,9,10,11,12],
	pos14_0: [1,2,3,4,5,6,7,8,9,10,11,12,13,14],
	pos17_0: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],

	pos5_1: [0,1,2,3,4],
	pos9A_1: [0,1,2,3,4,5,6,7,8],
	pos11_1: [1,2,3,4,5,6,7,8,10,11,12],
	pos11L_1: [0,1,2,3,4,6,7,8,10,11,12],
	pos12_1: [1,2,3,4,5,6,7,8,9,10,11,12],
	pos14_1: [1,2,3,4,5,6,7,8,9,10,11,12,13,14],

	pos5_2: [0,1,2,3,4],


	// 基本パターン (キーコンフィグ)
	// - 末尾dなし(実際の設定値)と末尾dあり(デフォルト値)は必ずセットで揃えること。配列数も合わせる。
	// - 順番はchara, stepRtnと対応している。
	// - 多次元配列内はステップに対応するキーコードを示す。カンマ区切りで複数指定できる。
	keyCtrl5_0: [[37],[40],[38,0],[39],[32,0]],
	keyCtrl7_0: [[83],[68,0],[70],[32,0],[74],[75,0],[76]],
	keyCtrl7i_0: [[90],[88],[67],[37],[40],[38,0],[39]],
	keyCtrl8_0: [[83],[68,0],[70],[32,0],[74],[75,0],[76],[13,0]],
	keyCtrl9A_0:[[83],[68],[69,82],[70],[32],[74],[75],[73,0],[76]],
	keyCtrl9B_0:[[65],[83],[68],[70],[32],[74],[75],[76],[187]],
	keyCtrl9i_0:[[65],[83],[68],[70],[32],[37],[40],[38,0],[39]],
	keyCtrl11_0:[[37],[40],[38,0],[39],[83],[68],[70],[32],[74],[75],[76]],
	keyCtrl11L_0:[[87],[69],[51,52],[82],[83],[68],[70],[32],[74],[75],[76]],
	keyCtrl12_0:[[85],[73],[56,57],[79],[32],[78],[74],[77,0],[75,0],[188],[76],[190]],
	keyCtrl14_0:[[84,89],[85],[73],[56,55,57,48],[79],[192,80],[32],[78],[74],[77,0],[75,0],[188],[76],[190]],
	keyCtrl17_0:[[65],[90],[83],[88],[68],[67],[70],[86],[32],[78],[74],[77],[75],[188],[76],[190],[187]],

	keyCtrl5_0d: [[37],[40],[38,0],[39],[32,0]],
	keyCtrl7_0d: [[83],[68,0],[70],[32,0],[74],[75,0],[76]],
	keyCtrl7i_0d: [[90],[88],[67],[37],[40],[38,0],[39]],
	keyCtrl8_0d: [[83],[68,0],[70],[32,0],[74],[75,0],[76],[13,0]],
	keyCtrl9A_0d:[[83],[68],[69,82],[70],[32],[74],[75],[73,0],[76]],
	keyCtrl9B_0d:[[65],[83],[68],[70],[32],[74],[75],[76],[187]],
	keyCtrl9i_0d:[[65],[83],[68],[70],[32],[37],[40],[38,0],[39]],
	keyCtrl11_0d:[[37],[40],[38,0],[39],[83],[68],[70],[32],[74],[75],[76]],
	keyCtrl11L_0d:[[83],[68],[70],[32],[74],[75],[76],[87],[69],[51,52],[82]],
	keyCtrl12_0d:[[85],[73],[56,57],[79],[32],[78],[74],[77,0],[75,0],[188],[76],[190]],
	keyCtrl14_0d:[[84,89],[85],[73],[56,55,57,48],[79],[192,80],[32],[78],[74],[77,0],[75,0],[188],[76],[190]],
	keyCtrl17_0d:[[65],[90],[83],[88],[68],[67],[70],[86],[32],[78],[74],[77],[75],[188],[76],[190],[187]],

	// 変則パターン (キーコンフィグ)
	// - 末尾dなし(実際の設定値)と末尾dあり(デフォルト値)は必ずセットで揃えること。配列数も合わせる。
	// - _0, _0dの数字部分をカウントアップすることで実現できる。
	// - 配列数は合わせる必要はあるが、代替キーの数は _X, _Xdで揃っていれば合わせる必要はない。
	keyCtrl5_1: [[32,0],[37],[40],[38,0],[39]],
	keyCtrl9A_1:[[83],[68],[69,82],[70],[32],[37],[40],[38,0],[39]],
	keyCtrl11_1:[[32],[37],[40],[38,0],[39],[83],[68],[70],[74],[75],[76]],
	keyCtrl11L_1:[[87],[69],[51,52],[82],[32],[83],[68],[70],[74],[75],[76]],
	keyCtrl12_1:[[89],[85,73],[56,55,57],[79],[32],[66],[72],[78,77],[74,75],[188],[76],[190]],
	keyCtrl14_1:[[82,84],[89],[85,73],[56,54,55,57,48],[79],[192,80],[32],[66],[72],[78,77],[74,75],[188],[76],[190]],

	keyCtrl5_1d: [[32,0],[37],[40],[38,0],[39]],
	keyCtrl9A_1d:[[83],[68],[69,82],[70],[32],[37],[40],[38,0],[39]],
	keyCtrl11_1d:[[32],[37],[40],[38,0],[39],[83],[68],[70],[74],[75],[76]],
	keyCtrl11L_1d:[[87],[69],[51,52],[82],[32],[83],[68],[70],[74],[75],[76]],
	keyCtrl12_1d:[[89],[85,73],[56,55,57],[79],[32],[66],[72],[78,77],[74,75],[188],[76],[190]],
	keyCtrl14_1d:[[82,84],[89],[85,73],[56,54,55,57,48],[79],[192,80],[32],[66],[72],[78,77],[74,75],[188],[76],[190]],

	keyCtrl5_2: [[37],[40],[32,0],[38,0],[39]],

	keyCtrl5_2d: [[37],[40],[32,0],[38,0],[39]],

	dummy: 0	// ダミー(カンマ抜け落ち防止)
};

var g_workObj = {};
var g_userAgent = window.navigator.userAgent.toLowerCase(); // msie, edge, chrome, safari, firefox, opera

var g_audio = new Audio();

/**
 * イベントハンドラ用オブジェクト
 * 参考: http://webkatu.com/remove-eventlistener/
 * 
 * - イベントリスナー作成時にリスナーキー(key)を発行する
 * - 削除時は発行したリスナーキーを指定して削除する
 */
var g_handler = (function(){
	var events = {},
	key = 0;

	return {
		addListener: function(_target, _type, _listener, _capture) {
			if(window.addEventListener){
				_target.addEventListener(_type, _listener, _capture);
			}else if(window.attachEvent){
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
		removeListener: function(key){
			if(key in events){
				var e = events[key];
				if(window.removeEventListener){
					e.target.removeEventListener(e.type, e.listener, e.capture);
				}else if(window.detachEvent){
					e.target.detachEvent('on' + e.type, e.listener);
				}
			}
		}
	}
})();

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
function createDiv(_id, _x, _y, _width, _height){
	var div = document.createElement("div");
	div.id = _id;
	div.style.left   = _x + "px";
	div.style.top    = _y + "px";
	div.style.width  = _width + "px";
	div.style.height = _height + "px";
	div.style.position = "absolute";

	div.style.userSelect = "none";
	div.style.webkitUserSelect = "none";
	div.style.msUserSelect = "none";
	div.style.mozUserSelect = "none";
	div.style.khtmlUserSelect = "none";
	div.style.webkitTouchCallout = "none";

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
function createDivLabel(_id, _x, _y, _width, _height, _fontsize, _color, _text){
	var div = createDiv(_id, _x, _y, _width, _height);
	div.style.font = _fontsize + "px '" + C_LBL_BASICFONT + "'";
	div.style.color = _color;
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
function createImg(_id, _imgPath, _x, _y, _width, _height){
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
function createArrowEffect(_id, _color, _x, _y, _size, _rotate){

	// 矢印・おにぎり判定
	if(isNaN(Number(_rotate))){
		var rotate = 0;
		var charaStyle = _rotate;
		var charaImg = eval("C_IMG_" + _rotate.toUpperCase());
		var sizeX = _size; 
	}else{
		var rotate = _rotate;
		var charaStyle = "arrow";
		var charaImg = C_IMG_ARROW;
		var sizeX = _size;
	}

	var div = createDiv(_id, _x, _y, sizeX, _size);
	div.align = C_ALIGN_CENTER;

	// IE/Edgeの場合は色なし版を表示
	if(g_userAgent.indexOf('msie') != -1 ||
		g_userAgent.indexOf('trident') != -1 ||
		g_userAgent.indexOf('edge') != -1) {
			div.innerHTML = "<img src='" + charaImg +
				"' style='width:" + sizeX + "px;height:" + _size +
				"px;transform:rotate(" + rotate + "deg);' id=" + _id + "img>";

	// それ以外は指定された色でマスク
	}else{
		if(_color != ""){
			div.style.backgroundColor = _color;
		}
		div.className = charaStyle;
		div.style.transform = "rotate(" + rotate +"deg)";
	}

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
function createSprite(_parentObjName, _newObjName, _x, _y, _width, _height){
	if(document.getElementById(_newObjName) == null){
		var parentsprite = document.getElementById(_parentObjName);
		var newsprite = createDiv(_newObjName, _x, _y, _width, _height);
		parentsprite.appendChild(newsprite);
	}else{
		var newsprite = document.getElementById(_newObjName);
	}
	return newsprite;
}

/**
 * 親スプライト配下の子スプライトを全削除
 * @param {object} _parentObjName 親スプライト名
 */
function deleteChildspriteAll(_parentObjName){

	var parentsprite = document.getElementById(_parentObjName);
	while (parentsprite.hasChildNodes()){
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
function createButton(_obj, _func){

	// ボタン用の子要素divを作成
	var div = createDiv(_obj.id, _obj.x, _obj.y, _obj.width, _obj.height);

	// ボタンの装飾を定義
	div.style.font = _obj.fontsize + "px '" + C_LBL_BASICFONT + "'";
	div.innerHTML = _obj.name;
	div.style.textAlign = _obj.align;
	div.style.verticalAlign = C_VALIGN_MIDDLE;
	div.style.color = C_CLR_TEXT;
	div.style.backgroundColor = _obj.normalColor;

	// オンマウス・タップ時の挙動 (背景色変更、カーソル変化)
	div.onmouseover = function(){
		div.style.backgroundColor = _obj.hoverColor;
		div.style.cursor = "pointer";
	}
	var lsnrkeyTS = g_handler.addListener(div, "touchstart", function(){
		div.style.backgroundColor = _obj.hoverColor;
		div.style.cursor = "pointer";
	}, false);

	// 通常時の挙動 (背景色変更、カーソル変化)
	div.onmouseout = function(){
		div.style.backgroundColor = _obj.normalColor;
		div.style.cursor = "default";
	}
	var lsnrkeyTE = g_handler.addListener(div, "touchend", function(){
		div.style.backgroundColor = _obj.normalColor;
		div.style.cursor = "default";
	}, false);

	// ボタンを押したときの動作
	var lsnrkey = g_handler.addListener(div, "click", function(){
		_func();
	}, false);

	// イベントリスナー用のキーをセット
	div.setAttribute("lsnrkey",lsnrkey);
	div.setAttribute("lsnrkeyTS",lsnrkeyTS);
	div.setAttribute("lsnrkeyTE",lsnrkeyTE);
	
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
function createLabel(_ctx, _text, _x, _y, _fontsize, _fontname, _color, _align){
	_ctx.font = _fontsize + "px '"+ _fontname +"'";
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
function getTitleDivLabel(_id, _titlename, _x, _y){
	var div = createDivLabel(_id, _x, _y, g_sWidth, 50, C_LBL_BTNSIZE, C_CLR_TITLE, _titlename);
	div.style.align = C_ALIGN_CENTER;
	return div;
}

/**
 * 画面上の描画、オブジェクトを全てクリア
 * - divオブジェクト(ボタンなど)はdivRoot配下で管理しているため、子要素のみを全削除している。
 * - dicRoot自体を削除しないよう注意すること。
 * - 再描画時に共通で表示する箇所はここで指定している。
 */
function clearWindow(){

	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");
	var layer1 = document.getElementById("layer1");
	var l1ctx = layer1.getContext("2d");
	var layer2 = document.getElementById("layer2");
	var l2ctx = layer2.getContext("2d");
	g_sWidth = layer0.width;
	g_sHeight = layer0.height;
	var C_MARGIN = 10;

	// 線画、図形をクリア
	l0ctx.clearRect(0,0,g_sWidth,g_sHeight);
	l1ctx.clearRect(0,0,g_sWidth,g_sHeight);
	l2ctx.clearRect(0,0,g_sWidth,g_sHeight);

	// ボタン、オブジェクトをクリア (divRoot配下のもの)
	var divRoot = document.getElementById("divRoot");
	while (divRoot.hasChildNodes()){
		/*
		alert(divRoot.firstChild.getAttribute("lsnrkey"));
		*/
		g_handler.removeListener(divRoot.firstChild.getAttribute("lsnrkey"));
		g_handler.removeListener(divRoot.firstChild.getAttribute("lsnrkeyTS"));
		g_handler.removeListener(divRoot.firstChild.getAttribute("lsnrkeyTE"));
		divRoot.removeChild(divRoot.firstChild);
	}

	// 画面背景を指定 (background-color)
	var grd = l0ctx.createLinearGradient(0,0,0,g_sHeight);
	grd.addColorStop(0, "#000000");
	grd.addColorStop(1, "#222222");
	l0ctx.fillStyle=grd;
	l0ctx.fillRect(0,0,g_sWidth,g_sHeight);

	// 線画 (title-line)
	l1ctx.beginPath();
	l1ctx.strokeStyle="#cccccc";
	l1ctx.moveTo(C_MARGIN,C_MARGIN);
	l1ctx.lineTo(g_sWidth-C_MARGIN,C_MARGIN);
	l1ctx.stroke();
	
	l1ctx.beginPath();
	l1ctx.strokeStyle="#cccccc";
	l1ctx.moveTo(C_MARGIN,g_sHeight-C_MARGIN);
	l1ctx.lineTo(g_sWidth-C_MARGIN,g_sHeight-C_MARGIN);
	l1ctx.stroke();
	
}

/*-----------------------------------------------------------*/
/* Scene : TITLE [melon] */
/*-----------------------------------------------------------*/

/**
 *  タイトル画面初期化
 */
function titleInit(){

	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");
	var layer1 = document.getElementById("layer1");
	var l1ctx = layer1.getContext("2d");
	var layer2 = document.getElementById("layer2");
	var l2ctx = layer2.getContext("2d");
	g_sWidth = layer0.width;
	g_sHeight = layer0.height;

	if(document.getElementById("divRoot") == null){
		var stage = document.getElementById("canvas-frame");
		var divRoot = createDiv("divRoot",0,0,g_sWidth,g_sHeight);
		stage.appendChild(divRoot);
		clearWindow();
	}else{
		var divRoot = document.getElementById("divRoot");
	}

	// タイトル文字描画
	var lblTitle = getTitleDivLabel("lblTitle", 
	"<span style='color:#6666ff;font-size:40px;'>D</span>ANCING<span style='color:#ffff66;font-size:40px;'>☆</span><span style='color:#ff6666;font-size:40px;'>O</span>NIGIRI", 0, 15);
	lblTitle.style.zIndex = 1;
	divRoot.appendChild(lblTitle);

	// 譜面データの読み込み
	var dos = document.getElementById("dos").value;
	g_rootObj = dosConvert(dos);
	g_headerObj = headerConvert(g_rootObj);
	keysConvert(g_rootObj);

	g_keyObj.currentKey = g_headerObj["keyLabels"][g_stateObj.scoreId];
	g_keyObj.currentPtn = 0;

	// 背景の矢印オブジェクトを表示
	var lblArrow = createArrowEffect("lblArrow", g_headerObj["setColor"][0], (g_sWidth-500)/2, -15, 500, 180);
	lblArrow.style.opacity = 0.25;
	lblArrow.style.zIndex = 0;
	divRoot.appendChild(lblArrow);
	

	// 曲名文字描画（曲名は譜面データから取得）
	// TEST:試験的に矢印色の1番目と3番目を使ってタイトルをグラデーション
	var grd = l1ctx.createLinearGradient(0,0,g_sHeight,0);
	if(g_headerObj["setColor"][0]!=undefined){
		grd.addColorStop(0, g_headerObj["setColor"][0]);
	}else{
		grd.addColorStop(0, "#ffffff");
	}
	if(g_headerObj["setColor"][2]!=undefined){
		grd.addColorStop(1, g_headerObj["setColor"][2]);
	}else{
		grd.addColorStop(1, "#66ffff");
	}
	var titlefontsize = 64 * (12 / g_headerObj["musicTitle"].length);
	createLabel(l1ctx, g_headerObj["musicTitle"], g_sWidth/2, g_sHeight/2, 
		titlefontsize, "Century Gothic", grd, C_ALIGN_CENTER);

	// オーディオ読込テスト
	g_audio.src = "../music/" + g_headerObj.musicUrl;
	g_audio.load();
	
	if(g_audio.readyState == 4){
		// audioの読み込みが終わった後の処理

		// ボタン描画
		var btnStart = createButton({
			id: "btnStart", 
			name: "Click Here!!", 
			x: 0, 
			y: g_sHeight-100, 
			width: g_sWidth, 
			height: C_BTN_HEIGHT, 
			fontsize: C_LBL_TITLESIZE,
			normalColor: C_CLR_DEFAULT, 
			hoverColor: C_CLR_DEFHOVER, 
			align: C_ALIGN_CENTER
		}, function(){
			clearWindow();
			optionInit();
		});
		btnStart.style.zIndex = 1;
		divRoot.appendChild(btnStart);
	}else{
		// 読込中の状態
		g_audio.addEventListener('canplaythrough', (function(){
			return function f(){
				g_audio.removeEventListener('canplaythrough',f,false);
				
				// ボタン描画
				var btnStart = createButton({
					id: "btnStart", 
					name: "Click Here!!", 
					x: 0, 
					y: g_sHeight-100, 
					width: g_sWidth, 
					height: C_BTN_HEIGHT, 
					fontsize: C_LBL_TITLESIZE,
					normalColor: C_CLR_DEFAULT, 
					hoverColor: C_CLR_DEFHOVER, 
					align: C_ALIGN_CENTER
				}, function(){
					clearWindow();
					optionInit();
				});
				btnStart.style.zIndex = 1;
				divRoot.appendChild(btnStart);
			}
		})(),false);
	}

	// 製作者表示
	var lnkMaker = createButton({
		id: "lnkMaker", 
		name: "Maker: "+ g_headerObj["tuning"], 
		x: 20, 
		y: g_sHeight-40, 
		width: g_sWidth/2-10, 
		height: C_LNK_HEIGHT, 
		fontsize: C_LBL_LNKSIZE,
		normalColor: C_CLR_LNK, 
		hoverColor: C_CLR_DEFAULT, 
		align: C_ALIGN_LEFT
	}, function(){
		window.open(g_headerObj["creatorUrl"], '_blank');
	});
	divRoot.appendChild(lnkMaker);

	// 作曲者リンク表示
	var lnkArtist = createButton({
		id: "lnkArtist", 
		name: "Artist: " + g_headerObj["artistName"], 
		x: g_sWidth/2, 
		y: g_sHeight-40, 
		width: g_sWidth/2-10, 
		height: C_LNK_HEIGHT, 
		fontsize: C_LBL_LNKSIZE,
		normalColor: C_CLR_LNK, 
		hoverColor: C_CLR_DEFAULT, 
		align: C_ALIGN_LEFT
	}, function(){
		window.open(g_headerObj["artistUrl"], '_blank');
	});
	divRoot.appendChild(lnkArtist);

	// キー操作イベント（デフォルト）
	document.onkeydown = function(evt){
		// ブラウザ判定
		if(g_userAgent.indexOf("firefox") != -1){
			var setKey = evt.which;
		}else{
			var setKey = event.keyCode;
		}
		if(setKey == 8 || setKey == 46 || setKey == 9 || (setKey >= 37 && setKey <= 40)){
			return false;
		}
	}
}

/**
 * 譜面データを分割して値を取得
 * @param {string} _dos 譜面データ
 */
function dosConvert(_dos){

	var obj = {};
	var params = _dos.split("&");
	for(var j=0; j<params.length; j++){
		var pos = params[j].indexOf("=");
		if(pos > 0){
			var pKey = params[j].substring(0,pos);
			var pValue = params[j].substring(pos+1);
			if(pKey != undefined){
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
function headerConvert(_dosObj){

	// ヘッダー群の格納先
	var obj = {};

	// 曲名
	var musics = _dosObj.musicTitle.split(",");
	obj.musicTitle = musics[0];
	obj.artistName = musics[1];
	obj.artistUrl  = musics[2];

	// 譜面情報
	var difs = _dosObj.difData.split("$");
	obj.keyLabels = new Array();
	obj.difLabels = new Array();
	obj.initSpeeds = new Array();
	for(var j=0; j<difs.length; j++){
		var difDetails = difs[j].split(",");
		obj.keyLabels.push(difDetails[0]);
		obj.difLabels.push(difDetails[1]);
		obj.initSpeeds.push(difDetails[2]);
	}
	// 初期色情報
	obj.setColor = _dosObj.setColor.split(",");
	for(var j=0; j<obj.setColor.length; j++){
		obj.setColor[j] = obj.setColor[j].replace("0x","#");
	}

	// 製作者表示
	var tunings = _dosObj.tuning.split(",");
	obj.tuning = tunings[0];
	obj.creatorUrl = tunings[1];

	// 無音のフレーム数
	obj.blankFrame = 200;
	if(isNaN(parseFloat(_dosObj.blankFrame))){
	}else{
		obj.blankFrame = parseFloat(_dosObj.blankFrame);
	}
	
	// 楽曲URL
	if(_dosObj.musicUrl != undefined){
		obj.musicUrl = _dosObj.musicUrl;
	}

	// TODO:フリーズアロー色など他のヘッダー情報の分解

	return obj;
}

/**
 * 一時的な追加キーの設定
 * @param {object} _dosObj 
 */
function keysConvert(_dosObj){

	var newKey = "";

	if(_dosObj.keyExtraList != undefined){
		var keyExtraList = _dosObj.keyExtraList.split(",");
		var tempKeyCtrl = new Array();
		var tempKeyPtn = new Array();

		for(var j=0; j<keyExtraList.length; j++){
			newKey = keyExtraList[j];

			if(_dosObj["arrBaseMC" + newKey] != undefined){
				g_keyObj["color" + newKey + "_0"] = _dosObj["arrBaseMC" + newKey].split(",");
			}else{
				alert("新しいキー:" + newKey + "の[arrBaseMC]が未定義です。");
			}
			if(_dosObj["headerDat" + newKey] != undefined){
				g_keyObj["chara" + newKey + "_0"] = _dosObj["headerDat" + newKey].split(",");
				g_keyObj["chara" + newKey + "_0d"] = _dosObj["headerDat" + newKey].split(",");
			}else{
				alert("新しいキー:" + newKey + "の[headerDat]が未定義です。");
			}
			if(isNaN(Number(_dosObj["div" + newKey]))){
				g_keyObj["div" + newKey + "_0"] = g_keyObj["chara" + newKey + "_0"].length;
			}else{
				g_keyObj["div" + newKey + "_0"] = _dosObj["div" + newKey];
			}
			if(_dosObj["stepRtn" + newKey] != undefined){
				g_keyObj["stepRtn" + newKey + "_0"] = _dosObj["stepRtn" + newKey].split(",");
				g_keyObj["stepRtn" + newKey + "_0d"] = _dosObj["stepRtn" + newKey].split(",");
				for(var k=0; k<g_keyObj["stepRtn" + newKey + "_0"].length; k++){
					if(isNaN(Number(g_keyObj["stepRtn" + newKey + "_0"][k]))){
					}else{
						g_keyObj["stepRtn" + newKey + "_0"][k] = parseFloat(g_keyObj["stepRtn" + newKey + "_0"][k]);
						g_keyObj["stepRtn" + newKey + "_0d"][k] = parseFloat(g_keyObj["stepRtn" + newKey + "_0d"][k]);
					}
				}
			}else{
				alert("新しいキー:" + newKey + "の[stepRtn]が未定義です。");
			}
			if(_dosObj["pos" + newKey] != undefined){
				g_keyObj["pos" + newKey + "_0"] = _dosObj["pos" + newKey].split(",");
			}else{
				g_keyObj["pos" + newKey + "_0"] = new Array();
				for(var k=0; k<g_keyObj["chara" + newKey + "_0"].length; k++){
					g_keyObj["pos" + newKey + "_0"][k] = k;
				}
			}
			if(_dosObj["keyCtrl" + newKey] != undefined){
				tempKeyCtrl = _dosObj["keyCtrl" + newKey].split(",");

				g_keyObj["keyCtrl" + newKey + "_0"] = new Array();
				g_keyObj["keyCtrl" + newKey + "_0d"] = new Array();

				for(var k=0; k<tempKeyCtrl.length; k++){
					tempKeyPtn = tempKeyCtrl[k].split("/");
					g_keyObj["keyCtrl" + newKey + "_0"][k] = new Array();
					g_keyObj["keyCtrl" + newKey + "_0d"][k] = new Array();

					for(var m=0; m<tempKeyPtn.length; m++){
						g_keyObj["keyCtrl" + newKey + "_0"][k][m] = tempKeyPtn[m];
						g_keyObj["keyCtrl" + newKey + "_0d"][k][m] = tempKeyPtn[m];
					}
				}
			}else{
				alert("新しいキー:" + newKey + "の[keyCtrl]が未定義です。");
			}
		}
	}
}


/*-----------------------------------------------------------*/
/* Scene : OPTION [lime] */
/*-----------------------------------------------------------*/

/**
 * オプション画面初期化
 */
function optionInit(){

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
	"<span style='color:#6666ff;font-size:40px;'>O</span>PTION", 0, 15);
	divRoot.appendChild(lblTitle);

	// オプションボタン用の設置
	createOptionWindow("divRoot");

//	g_audio.play();

	// 戻るボタン描画
	var btnBack = createButton({
		id: "btnBack", 
		name: "Back", 
		x: 0, 
		y: g_sHeight-100, 
		width: g_sWidth/3, 
		height: C_BTN_HEIGHT, 
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT, 
		hoverColor: C_CLR_BACK, 
		align: C_ALIGN_CENTER
	}, function(){
		// タイトル画面へ戻る
//		g_audio.pause();
//		g_audio.currentTime = 0;
		clearWindow();
		titleInit();
	});
	divRoot.appendChild(btnBack);

	// キーコンフィグボタン描画
	var btnKeyConfig = createButton({
		id: "btnKeyConfig", 
		name: "KeyConfig", 
		x: g_sWidth/3, 
		y: g_sHeight-100, 
		width: g_sWidth/3, 
		height: C_BTN_HEIGHT, 
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT, 
		hoverColor: C_CLR_SETTING, 
		align: C_ALIGN_CENTER
	}, function(){
		// キーコンフィグ画面へ遷移
//		g_audio.pause();
//		g_audio.currentTime = 0;
		clearWindow();
		keyConfigInit();
	});
	divRoot.appendChild(btnKeyConfig);
	
	// 進むボタン描画
	var btnPlay = createButton({
		id: "btnPlay", 
		name: "Play", 
		x: g_sWidth/3 * 2, 
		y: g_sHeight-100, 
		width: g_sWidth/3, 
		height: C_BTN_HEIGHT, 
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT, 
		hoverColor: C_CLR_NEXT, 
		align: C_ALIGN_CENTER
	}, function(){
//		g_audio.pause();
//		g_audio.currentTime = 0;
		clearWindow();
		loadingScoreInit();
	});
	divRoot.appendChild(btnPlay);

	// キー操作イベント（デフォルト）
	document.onkeydown = function(evt){
		// ブラウザ判定
		if(g_userAgent.indexOf("firefox") != -1){
			var setKey = evt.which;
		}else{
			var setKey = event.keyCode;
		}
		if(setKey == 8 || setKey == 46 || setKey == 9 || (setKey >= 37 && setKey <= 40)){
			return false;
		}
	}
}


/**
 * オプション画面のラベル・ボタン処理の描画
 * @param {Object} _sprite 基準とするスプライト(ここで指定する座標は、そのスプライトからの相対位置)
 */
function createOptionWindow(_sprite){

	// 各ボタン用のスプライトを作成
	var optionsprite = createSprite(_sprite, "optionsprite", (g_sWidth-400)/2, 100, 400, 300);

	// 難易度(Difficulty)
	var lblDifficulty = createDivLabel("lblDifficulty", 0, 0, 100, 30, 20, C_CLR_TITLE, 
					"<span style='color:#ff9999'>D</span>ifficulty");
	optionsprite.appendChild(lblDifficulty);

	var lnkDifficulty = createButton({
		id: "lnkDifficulty", 
		name: g_headerObj["keyLabels"][g_stateObj.scoreId] + " key / " + g_headerObj["difLabels"][g_stateObj.scoreId], 
		x: 170, 
		y: 0, 
		width: 250, 
		height: 30, 
		fontsize: 20,
		normalColor: C_CLR_LNK, 
		hoverColor: C_CLR_DEFAULT, 
		align: C_ALIGN_CENTER
	}, function(){
		// 難易度変更ボタン押下時は譜面名及び初期速度を変更
		g_stateObj.scoreId = (g_stateObj.scoreId < g_headerObj["keyLabels"].length-1 ? ++g_stateObj.scoreId : 0);
		lnkDifficulty.innerHTML = g_headerObj["keyLabels"][g_stateObj.scoreId] + " key / " + g_headerObj["difLabels"][g_stateObj.scoreId];
		g_stateObj.speed = g_headerObj["initSpeeds"][g_stateObj.scoreId];
		lnkSpeed.innerHTML = g_stateObj.speed + " x";
		g_keyObj.currentKey = g_headerObj["keyLabels"][g_stateObj.scoreId];
		g_keyObj.currentPtn = 0;
	});
	optionsprite.appendChild(lnkDifficulty);

	// 速度(Speed)
	var lblSpeed = createDivLabel("lblSpeed", 0, 30, 100, 30, 20, C_CLR_TITLE, 
				"<span style='color:#ff9977'>S</span>peed");
	optionsprite.appendChild(lblSpeed);
	var lnkSpeed = createButton({
		id: "lnkSpeed", 
		name: g_stateObj.speed + " x", 
		x: 170, 
		y: 30, 
		width: 250, 
		height: 30, 
		fontsize: 20,
		normalColor: C_CLR_LNK, 
		hoverColor: C_CLR_DEFAULT, 
		align: C_ALIGN_CENTER
	}, function(){
		g_stateObj.speed = (Number(g_stateObj.speed) < 10 ? Number(g_stateObj.speed) + 0.25 : 1);
		lnkSpeed.innerHTML = g_stateObj.speed + " x";
	});
	optionsprite.appendChild(lnkSpeed);

	// 速度モーション (Motion)
	var lblMotion = createDivLabel("lblMotion", 0, 60, 100, 30, 20, C_CLR_TITLE, 
				"<span style='color:#ffff66'>M</span>otion");
	optionsprite.appendChild(lblMotion);
	var lnkMotion = createButton({
		id: "lnkMotion", 
		name: g_stateObj.motion, 
		x: 170, 
		y: 60, 
		width: 250, 
		height: 30, 
		fontsize: 20,
		normalColor: C_CLR_LNK, 
		hoverColor: C_CLR_DEFAULT, 
		align: C_ALIGN_CENTER
	}, function(){
		switch(g_stateObj.motion){
			case "OFF": 
				g_stateObj.motion = "Boost";	break;
			case "Boost":
				g_stateObj.motion = "Brake";	break;
			case "Brake":
				g_stateObj.motion = "OFF";	break;
		}
		lnkMotion.innerHTML = g_stateObj.motion;
	});
	optionsprite.appendChild(lnkMotion);

	// リバース
	var lblReverse = createDivLabel("lblReverse", 0, 90, 100, 30, 20, C_CLR_TITLE, 
				"<span style='color:#66ffff'>R</span>everse");
	optionsprite.appendChild(lblReverse);
	var lnkReverse = createButton({
		id: "lnkReverse", 
		name: g_stateObj.reverse, 
		x: 170, 
		y: 90, 
		width: 250, 
		height: 30, 
		fontsize: 20,
		normalColor: C_CLR_LNK, 
		hoverColor: C_CLR_DEFAULT, 
		align: C_ALIGN_CENTER
	}, function(){
		g_stateObj.reverse = (g_stateObj.reverse == "OFF" ? "ON" : "OFF");
		lnkReverse.innerHTML = g_stateObj.reverse;
	});
	optionsprite.appendChild(lnkReverse);

	// 鑑賞モード設定 (AutoPlay)
	var lblAutoPlay = createDivLabel("lblAutoPlay", 0, 120, 100, 30, 20, C_CLR_TITLE, 
				"<span style='color:#999999'>A</span>utoPlay");
	optionsprite.appendChild(lblAutoPlay);
	var lnkAutoPlay = createButton({
		id: "lnkAutoPlay", 
		name: g_stateObj.auto, 
		x: 170, 
		y: 120, 
		width: 250, 
		height: 30, 
		fontsize: 20,
		normalColor: C_CLR_LNK, 
		hoverColor: C_CLR_DEFAULT, 
		align: C_ALIGN_CENTER
	}, function(){
		g_stateObj.auto = (g_stateObj.auto == "OFF" ? "ON" : "OFF");
		lnkAutoPlay.innerHTML = g_stateObj.auto;
	});
	optionsprite.appendChild(lnkAutoPlay);

	// タイミング調整 (Adjustment)
	var lblAdjustment = createDivLabel("lblAdjustment", 0, 150, 100, 30, 20, C_CLR_TITLE, 
				"<span style='color:#cc66ff'>A</span>djustment");
	optionsprite.appendChild(lblAdjustment);
	var lnkAdjustment = createButton({
		id: "lnkAutoPlay", 
		name: g_stateObj.adjustment, 
		x: 170, 
		y: 150, 
		width: 250, 
		height: 30, 
		fontsize: 20,
		normalColor: C_CLR_LNK, 
		hoverColor: C_CLR_DEFAULT, 
		align: C_ALIGN_CENTER
	}, function(){
		g_stateObj.adjustment = (g_stateObj.adjustment == 15 ? -15 : ++g_stateObj.adjustment);
		lnkAdjustment.innerHTML = g_stateObj.adjustment;
	});
	optionsprite.appendChild(lnkAdjustment);

}

/*-----------------------------------------------------------*/
/* Scene : KEYCONFIG [orange] */
/*-----------------------------------------------------------*/

/**
 * キーコンフィグ画面初期化
 */
function keyConfigInit(){

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

	// 戻るボタン描画
	var btnBack = createButton({
		id: "btnBack", 
		name: "Back", 
		x: 0, 
		y: g_sHeight-100, 
		width: g_sWidth/3, 
		height: C_BTN_HEIGHT, 
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT, 
		hoverColor: C_CLR_BACK, 
		align: C_ALIGN_CENTER
	}, function(){
		// オプション画面へ戻る
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
		x: g_sWidth/3, 
		y: g_sHeight-100, 
		width: g_sWidth/3, 
		height: C_BTN_HEIGHT, 
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT, 
		hoverColor: C_CLR_SETTING, 
		align: C_ALIGN_CENTER
	}, function(){
		var tempPtn = g_keyObj.currentPtn + 1;
		if(g_keyObj["keyCtrl"+ g_keyObj.currentKey + "_" + tempPtn] != undefined){
			g_keyObj.currentPtn = tempPtn;
		}else{
			g_keyObj.currentPtn = 0;
		}
		clearWindow();
		keyConfigInit();
		g_currentj = 0;
		g_currentk = 0;
		g_prevKey = -1;
	});
	divRoot.appendChild(btnPtnChange);
	
	// キーコンフィグリセットボタン描画
	var btnReset = createButton({
		id: "btnReset", 
		name: "Reset", 
		x: g_sWidth/3 * 2, 
		y: g_sHeight-100, 
		width: g_sWidth/3, 
		height: C_BTN_HEIGHT, 
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT, 
		hoverColor: C_CLR_RESET, 
		align: C_ALIGN_CENTER
	}, function(){
		if(window.confirm('キーを初期配置に戻します。よろしいですか？')){
			g_keyObj.currentKey = g_headerObj["keyLabels"][g_stateObj.scoreId];
			var keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
			var keyNum = g_keyObj["chara" + keyCtrlPtn].length;
			var divideCnt = g_keyObj["div"+ keyCtrlPtn];

			for(var j=0; j<keyNum; j++){
				for(var k=0;k<g_keyObj["keyCtrl"+ keyCtrlPtn][j].length;k++){
					g_keyObj["keyCtrl"+ keyCtrlPtn][j][k] = g_keyObj["keyCtrl"+ keyCtrlPtn + "d"][j][k];
					document.getElementById("keycon" + j + "_" + k).innerHTML = g_kCd[g_keyObj["keyCtrl"+ keyCtrlPtn][j][k]];
				}
			}
			g_currentj = 0;
			g_currentk = 0;
			g_prevKey = -1;
			posj = g_keyObj["pos" + keyCtrlPtn][0];

			var cursor = document.getElementById("cursor");
			cursor.style.left = (kWidth/2 + 55 * (posj - divideCnt/2) -10) + "px";
			cursor.style.top = "45px";
		}
	});
	divRoot.appendChild(btnReset);

	// キーの一覧を表示
	var keyconSprite = createSprite("divRoot","keyconSprite",(g_sWidth-400)/2,100,400,300);
	var kWidth = parseInt(keyconSprite.style.width);
	
	var keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	var keyNum = g_keyObj["chara" + keyCtrlPtn].length;
	var posMax = g_keyObj["pos" + keyCtrlPtn][keyNum-1] +1;
	var divideCnt = g_keyObj["div"+ keyCtrlPtn];

	/** 同行の左から数えた場合の位置(x座標) */
	var leftCnt = 0;
	/** 同行の中心から見た場合の位置(x座標) */
	var stdPos = 0;
	/** 行位置 */
	var dividePos = 0;
	var posj = 0;

	for(var j=0; j<keyNum; j++){

		posj = g_keyObj["pos" + keyCtrlPtn][j];
		leftCnt = (posj >= divideCnt ? posj - divideCnt : posj);
		stdPos  = (posj >= divideCnt ? leftCnt - (posMax - divideCnt)/2 : leftCnt - divideCnt / 2);
		dividePos = (posj >= divideCnt ? 1 : 0);

		// キーコンフィグ表示用の矢印・おにぎりを表示
		keyconSprite.appendChild(createArrowEffect("arrow" + j, g_headerObj.setColor[g_keyObj["color" + keyCtrlPtn][j]], 
			55 * stdPos + kWidth/2, 
			150 * dividePos, 50, 
			g_keyObj["stepRtn" + keyCtrlPtn][j]));

		// 対応キーに応じた値を表示
		for(var k=0;k<g_keyObj["keyCtrl"+ keyCtrlPtn][j].length;k++){
			keyconSprite.appendChild(createDivLabel("keycon" + j + "_" + k, 
				55 * stdPos + kWidth/2, 
				50 + 20 * k + 150 * dividePos,
				50, 20, 16, "#cccccc", g_kCd[g_keyObj["keyCtrl"+ keyCtrlPtn][j][k]]));
		}
	}
	posj = g_keyObj["pos" + keyCtrlPtn][0];

	// カーソルの作成
	var cursor = keyconSprite.appendChild(createImg("cursor", "../img/cursor.png", 
		kWidth/2 + 55 * (posj - divideCnt/2) -10, 45, 15, 30 ));

	
	// キーボード押下時処理
	document.onkeydown = function(evt){
		var keyCdObj = document.getElementById("keycon" + g_currentj + "_" + g_currentk);
		var cursor = document.getElementById("cursor");

		// ブラウザ判定
		if(g_userAgent.indexOf("firefox") != -1){
			var setKey = evt.which;
		}else{
			var setKey = event.keyCode;
		}

		// 全角切替、BackSpace、Deleteキーは割り当て禁止
		// また、直前と同じキーを押した場合(BackSpaceを除く)はキー操作を無効にする
		if(setKey == 229 || setKey == 242 || setKey == 243 || setKey == 244 || 
			setKey == 91 || setKey == 29 || setKey == 28 || 
			(setKey == 46 && g_currentk == 0) || setKey == g_prevKey){
		}else{
			if(setKey == 8){
			}else{
				if(setKey == 46){
					setKey = 0;
				}
				keyCdObj.innerHTML = g_kCd[setKey];
				g_keyObj["keyCtrl"+ keyCtrlPtn][g_currentj][g_currentk] = setKey;
				g_prevKey = setKey;
			}

			// 後続に代替キーが存在する場合
			if(g_currentk < g_keyObj["keyCtrl"+ keyCtrlPtn][g_currentj].length -1){
				g_currentk++;
				cursor.style.top = (parseInt(cursor.style.top) + 20) + "px";

			// 他の代替キーが存在せず、次の矢印がある場合
			}else if(g_currentj < g_keyObj["keyCtrl"+ keyCtrlPtn].length -1){
				g_currentj++;
				g_currentk = 0;
				var posj = g_keyObj["pos" + keyCtrlPtn][g_currentj];

				leftCnt = (posj >= divideCnt ? posj - divideCnt : posj);
				stdPos  = (posj >= divideCnt ? leftCnt - (posMax - divideCnt)/2 : leftCnt - divideCnt / 2);
				dividePos = (posj >= divideCnt ? 1 : 0);

				if(posj == divideCnt){
					cursor.style.left = (kWidth/2 + 55 * stdPos -10) + "px";
					cursor.style.top = (50 + 150) + "px";
				}else{
					cursor.style.left = (parseInt(cursor.style.left) + 55) + "px";
					cursor.style.top = (50 + 150 * dividePos) + "px";
				}

			// 全ての矢印・代替キーの巡回が終わった場合は元の位置に戻す
			}else{
				g_currentj = 0;
				g_currentk = 0;
				var posj = g_keyObj["pos" + keyCtrlPtn][g_currentj];
				cursor.style.left = (kWidth/2 + 55 * (posj - divideCnt/2) -10) + "px";
				cursor.style.top = "45px";
			}
		}
		if(setKey == 8 || setKey == 46 || setKey == 9 || (setKey >= 37 && setKey <= 40)){
			return false;
		}
	}
}

function createArrowRoot(_parentObjName){

}

/*-----------------------------------------------------------*/
/* Scene : LOAGING [strawberry] */
/*-----------------------------------------------------------*/

/**
 * 読込画面初期化
 */
function loadingScoreInit(){

	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");
	var layer1 = document.getElementById("layer1");
	var l1ctx = layer1.getContext("2d");
	var layer2 = document.getElementById("layer2");
	var l2ctx = layer2.getContext("2d");
	var divRoot = document.getElementById("divRoot");

	// 譜面データの読み込み
	var scoreIdHeader = "";
	if(g_stateObj.scoreId > 0){
		scoreIdHeader = Number(g_stateObj.scoreId) + 1;
	}
	g_scoreObj = scoreConvert(g_rootObj, scoreIdHeader);
	var finalFrame = getFinalFrame(g_scoreObj) + g_headerObj.blankFrame;

	// 戻るボタン描画 (本来は不要だがデバッグ用に作成)
	var btnBack = createButton({
		id: "btnBack", 
		name: "Back", 
		x: 0, 
		y: g_sHeight-100, 
		width: g_sWidth/2, 
		height: C_BTN_HEIGHT, 
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT, 
		hoverColor: C_CLR_BACK, 
		align: C_ALIGN_CENTER
	}, function(){
		// オプション画面へ戻る
		clearWindow();
		optionInit();
	});
	divRoot.appendChild(btnBack);

	// キー操作イベント（デフォルト）
	document.onkeydown = function(evt){
		// ブラウザ判定
		if(g_userAgent.indexOf("firefox") != -1){
			var setKey = evt.which;
		}else{
			var setKey = event.keyCode;
		}
		if(setKey == 8 || setKey == 46 || setKey == 9 || (setKey >= 37 && setKey <= 40)){
			return false;
		}
	}
}

/**
 * 譜面データの分解
 * @param {object} _dosObj 
 * @param {string} _scoreNo
 */
function scoreConvert(_dosObj, _scoreNo){

	// 矢印群の格納先
	var obj = {};

	var keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	var keyNum = g_keyObj["chara" + keyCtrlPtn].length;
	obj.arrowData = new Array();
	obj.frzData = new Array();
	var frzName;
	var tmpData;
	for(var j=0, k=0; j<keyNum; j++){

		// 矢印データの分解
		if(_dosObj[g_keyObj["chara" + keyCtrlPtn][j] + _scoreNo + "_data"] != undefined){
			tmpData = _dosObj[g_keyObj["chara" + keyCtrlPtn][j] + _scoreNo + "_data"].replace("\r","");
			tmpData = tmpData.replace("\n","");

			if(tmpData != undefined){
				obj.arrowData[j] = new Array();
				obj.arrowData[j] = tmpData.split(",");
				for(k=0; k<obj.arrowData[j].length; k++){
					obj.arrowData[j][k] = parseFloat(obj.arrowData[j][k]) + parseFloat(g_stateObj.adjustment);
				}
			}
		}
		
		// 矢印名からフリーズアロー名への変換
		frzName = g_keyObj["chara" + keyCtrlPtn][j].replace("leftdia","frzLdia");
		frzName = frzName.replace("rightdia","frzRdia");
		frzName = frzName.replace("left","frzLeft");
		frzName = frzName.replace("down","frzDown");
		frzName = frzName.replace("up","frzUp");
		frzName = frzName.replace("right","frzRight");
		frzName = frzName.replace("space","frzSpace");
		frzName = frzName.replace("iyo","frzIyo");
		frzName = frzName.replace("gor","frzGor");
		frzName = frzName.replace("oni","foni");

		// フリーズアローデータの分解
		if(_dosObj[frzName + _scoreNo + "_data"] != undefined){
			tmpData = _dosObj[frzName + _scoreNo + "_data"].replace("\r","");
			tmpData = tmpData.replace("\n","");

			if(tmpData != undefined){
				obj.frzData[j] = new Array();
				obj.frzData[j] = tmpData.split(",");
				for(k=0; k<obj.frzData[j].length; k++){
					obj.frzData[j][k] = parseFloat(obj.frzData[j][k]) + parseFloat(g_stateObj.adjustment);
				}
			}
		}
	}

	// 速度変化・色変化データの分解
	var speedFooter = (g_keyObj.currentKey == "5" ? "_data" : "_change");
	if(_dosObj["speed" + _scoreNo + "_" + speedFooter] != undefined){
		obj.speedData = _dosObj["speed" + _scoreNo + "_" + speedFooter].split(",");
		for(k=0; k<obj.speedData.length; k+=2){
			obj.speedData[k] = parseFloat(obj.speedData[k]) + parseFloat(g_stateObj.adjustment);
			obj.speedData[k+1] = parseFloat(obj.speedData[k+1]);
		}
	}
	if(_dosObj["boost_" + _scoreNo + "data"] != undefined){
		obj.boostData = _dosObj["boost" + _scoreNo + "_data"].split(",");
		for(k=0; k<obj.boostData.length; k+=2){
			obj.boostData[k] = parseFloat(obj.boostData[k]) + parseFloat(g_stateObj.adjustment);
			obj.boostData[k+1] = parseFloat(obj.boostData[k+1]);
		}
	}
	if(_dosObj["color_" + _scoreNo + "data"] != undefined){
		obj.colorData = _dosObj["color" + _scoreNo + "_data"].split(",");
		for(k=0; k<obj.colorData.length; k+=3){
			obj.colorData[k] = parseFloat(obj.colorData[k]) + parseFloat(g_stateObj.adjustment);
			obj.colorData[k+1] = parseFloat(obj.colorData[k+1]);
		}
	}
	if(_dosObj["acolor_" + _scoreNo + "data"] != undefined){
		obj.acolorData = _dosObj["acolor" + _scoreNo + "_data"].split(",");
		for(k=0; k<obj.acolorData.length; k+=3){
			obj.acolorData[k] = parseFloat(obj.acolorData[k]) + parseFloat(g_stateObj.adjustment);
			obj.acolorData[k+1] = parseFloat(obj.acolorData[k+1]);
		}
	}

	// 歌詞データの分解
	if(_dosObj["word_" + _scoreNo + "data"] != undefined){
		tmpData = _dosObj["word_" + _scoreNo + "data"].replace("\r","");
		tmpData = tmpData.replace("\n","");
		obj.wordData = new Array();

		if(tmpData != undefined){
			var tmpWordData = tmpData.split(",");
			for(k=0; k<tmpWordData.length; k+=3){
				tmpWordData[k] = parseFloat(tmpWordData[k]) + parseFloat(g_stateObj.adjustment);
				tmpWordData[k+1] = parseFloat(tmpWordData[k+1]);

				if(obj.wordData[tmpWordData[k]] != undefined){
					obj.wordData[tmpWordData[k]] = new Array();
				}
				obj.wordData[tmpWordData[k]].push(tmpWordData[k+1],tmpWordData[k+2]);
			}
		}
	}

	return obj;
}

/**
 * 最終フレーム数の取得
 * @param {object} _dataObj 
 */
function getFinalFrame(_dataObj){
	
	var tmpFinalNum = 0;
	var keyCtrlPtn = g_keyObj.currentKey + "_" + g_keyObj.currentPtn;
	var keyNum = g_keyObj["chara" + keyCtrlPtn].length;
	
	for(var j=0; j<keyNum; j++){
		if(_dataObj.arrowData[j] != undefined){
			if(_dataObj.arrowData[j][_dataObj.arrowData[j].length -1] > tmpFinalNum){
				tmpFinalNum = _dataObj.arrowData[j][_dataObj.arrowData[j].length -1];
			}
		}
		if(_dataObj.frzData[j] != undefined){
			if(_dataObj.frzData[j][_dataObj.frzData[j].length -1] > tmpFinalNum){
				tmpFinalNum = _dataObj.frzData[j][_dataObj.frzData[j].length -1];
			}
		}
	}
	return tmpFinalNum;
}

/*-----------------------------------------------------------*/
/* Scene : MAIN [banana] */
/*-----------------------------------------------------------*/

/*-----------------------------------------------------------*/
/* Scene : RESULT [grape] */
/*-----------------------------------------------------------*/

/**
 * リザルト画面初期化
 */
function resultInit(){

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

	// 戻るボタン描画
	var btnBack = createButton({
		id: "btnBack", 
		name: "Back", 
		x: 0, 
		y: g_sHeight-100, 
		width: g_sWidth/3, 
		height: C_BTN_HEIGHT, 
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT, 
		hoverColor: C_CLR_BACK, 
		align: C_ALIGN_CENTER
	}, function(){
		// タイトル画面へ戻る
		clearWindow();
		titleInit();
	});
	divRoot.appendChild(btnBack);

	// Tweetボタン描画
	var btnTweet = createButton({
		id: "btnTweet", 
		name: "Tweet", 
		x: g_sWidth/3, 
		y: g_sHeight-100, 
		width: g_sWidth/3, 
		height: C_BTN_HEIGHT, 
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT, 
		hoverColor: C_CLR_TWEET, 
		align: C_ALIGN_CENTER
	}, function(){
		// TODO:Tweet画面へ
	});
	divRoot.appendChild(btnTweet);
	
	// リトライボタン描画
	var btnRetry = createButton({
		id: "btnRetry", 
		name: "Retry", 
		x: g_sWidth/3 * 2, 
		y: g_sHeight-100, 
		width: g_sWidth/3, 
		height: C_BTN_HEIGHT, 
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT, 
		hoverColor: C_CLR_RESET, 
		align: C_ALIGN_CENTER
	}, function(){
		// TODO:メイン画面への遷移
	});
	divRoot.appendChild(btnRetry);

	// キー操作イベント（デフォルト）
	document.onkeydown = function(evt){
		// ブラウザ判定
		if(g_userAgent.indexOf("firefox") != -1){
			var setKey = evt.which;
		}else{
			var setKey = event.keyCode;
		}
		if(setKey == 8 || setKey == 46 || setKey == 9 || (setKey >= 37 && setKey <= 40)){
			return false;
		}
	}
}

/*-----------------------------------------------------------*/