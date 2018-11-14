'use strict';
/**
 * Dancing☆Onigiri カスタム用jsファイル
 * ver 0.43.0 以降向け
 * 
 * このファイルは、作品個別に設定できる項目となっています。
 * 譜面データ側で下記のように作品別の外部jsファイルを指定することで、
 * danoni_main.js の中身を変えることなく設定が可能です。
 * 
 * 設定例：
 * |customjs=danoni_custom-003.js|
 * 
 * ・グローバル変数、div要素、関数は danoni_main.js のものがそのまま利用できます。
 * ・danoni_main.jsの変数を直接書き換えると、動かなくなることがあります。
 * 　こまめのバックアップをおススメします。
 * ・ラベルなどのdiv要素を作る場合、「divRoot」の下にappendChild（div要素を追加）することで
 * 　画面遷移したときにきれいに消してくれます。
 */


/**
 * タイトル画面 [Scene: Title / Melon]
 */
function customTitleInit() {

	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");

	// 画面背景を指定 (background-color)
	var grd = l0ctx.createLinearGradient(0, 0, 0, g_sHeight);
	grd.addColorStop(0, "#000000");
	grd.addColorStop(1, "#222222");
	l0ctx.fillStyle = grd;
	l0ctx.fillRect(0, 0, g_sWidth, g_sHeight);


	// 背景の矢印オブジェクトを表示
	var lblArrow = createArrowEffect("lblArrow", g_headerObj["setColor"][0], (g_sWidth - 500) / 2, -15, 500, 180);
	lblArrow.style.opacity = 0.25;
	lblArrow.style.zIndex = 0;
	divRoot.appendChild(lblArrow);

	// 曲名文字描画（曲名は譜面データから取得）
	// TEST:試験的に矢印色の1番目と3番目を使ってタイトルをグラデーション
	var grd = l0ctx.createLinearGradient(0, 0, g_sHeight, 0);
	if (g_headerObj["setColor"][0] != undefined) {
		grd.addColorStop(0, g_headerObj["setColor"][0]);
	} else {
		grd.addColorStop(0, "#ffffff");
	}
	if (g_headerObj["setColor"][2] != undefined) {
		grd.addColorStop(1, g_headerObj["setColor"][2]);
	} else {
		grd.addColorStop(1, "#66ffff");
	}
	var titlefontsize = 64 * (12 / g_headerObj["musicTitle"].length);
	if (titlefontsize >= 64) {
		titlefontsize = 64;
	}
	createLabel(l0ctx, g_headerObj["musicTitle"], g_sWidth / 2, g_sHeight / 2,
		titlefontsize, "メイリオ", grd, "center");
}

/**
 * オプション画面(初期表示) [Scene: Option / Lime]
 */
function customOptionInit() {
	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");

	// 画面背景を指定 (background-color)
	var grd = l0ctx.createLinearGradient(0, 0, 0, g_sHeight);
	grd.addColorStop(0, "#000000");
	grd.addColorStop(1, "#222222");
	l0ctx.fillStyle = grd;
	l0ctx.fillRect(0, 0, g_sWidth, g_sHeight);

}

/**
 * キーコンフィグ画面(初期表示) [Scene: KeyConfig / Orange]
 */
function customKeyConfigInit() {
	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");

	// 画面背景を指定 (background-color)
	var grd = l0ctx.createLinearGradient(0, 0, 0, g_sHeight);
	grd.addColorStop(0, "#000000");
	grd.addColorStop(1, "#222222");
	l0ctx.fillStyle = grd;
	l0ctx.fillRect(0, 0, g_sWidth, g_sHeight);

}

/**
 * 譜面読込画面 [Scene: Loading / Strawberry]
 * - この画面のみ、画面表示がありません。
 * - 処理が完了すると、自動的にメイン画面へ遷移します。
 */
function customLoadingInit() {

}

/**
 * メイン画面(初期表示) [Scene: Main / Banana]
 */
function customMainInit() {
	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");

	// 画面背景を指定 (background-color)
	var grd = l0ctx.createLinearGradient(0, 0, 0, g_sHeight);
	grd.addColorStop(0, "#000000");
	grd.addColorStop(1, "#222222");
	l0ctx.fillStyle = grd;
	l0ctx.fillRect(0, 0, g_sWidth, g_sHeight);

	// ここにカスタム処理を記述する
	var lblReady = createDivLabel("lblReady", g_sWidth / 2 - 100, g_sHeight / 2 - 100,
		200, 50, 40, C_CLR_TITLE,
		"<span style='color:#9999ff;font-size:60px;'>R</span>EADY?");
	divRoot.appendChild(lblReady);
	lblReady.style.animationDuration = "2.5s";
	lblReady.style.animationName = "leftToRightFade";
	lblReady.style.opacity = 0;

}

/**
 * メイン画面(フレーム毎表示) [Scene: Main / Banana]
 */
function customMainEnterFrame() {

}

/**
 * 結果画面(初期表示) [Scene: Result / Grape]
 */
function customResultInit() {
	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");

	// 画面背景を指定 (background-color)
	var grd = l0ctx.createLinearGradient(0, 0, 0, g_sHeight);
	grd.addColorStop(0, "#000000");
	grd.addColorStop(1, "#222222");
	l0ctx.fillStyle = grd;
	l0ctx.fillRect(0, 0, g_sWidth, g_sHeight);

}