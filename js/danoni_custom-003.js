'use strict';
/**
 * Dancing☆Onigiri カスタム例 -003
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
 * タイトル画面
 */
function customTitleInit() {

	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");

	// 画面背景を指定 (background-color)
	var grd = l0ctx.createLinearGradient(0, 0, 0, g_sHeight);
	grd.addColorStop(0, "#000000");
	grd.addColorStop(1, "#000022");
	l0ctx.fillStyle = grd;
	l0ctx.fillRect(0, 0, g_sWidth, g_sHeight);


	// 背景の矢印オブジェクトを表示
	var lblC = createArrowEffect("lblC", "#ffffff", g_sWidth / 2 - 300, 0, 100, "onigiri");
	lblC.style.opacity = 0.25;
	divRoot.appendChild(lblC);

	var lblArrow = createArrowEffect("lblArrow", g_headerObj["setColor"][0], (g_sWidth - 500) / 2, -15, 500, 180);
	lblArrow.style.opacity = 0.25;
	divRoot.appendChild(lblArrow);

	// 曲名文字描画（曲名は譜面データから取得）
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
		titlefontsize, "Century Gothic", grd, "center");

	// Tweetボタン描画
	var btnTweet = createButton({
		id: "btnTweet",
		name: "Comment",
		x: g_sWidth / 4 * 3,
		y: 340,
		width: g_sWidth / 4,
		height: C_BTN_HEIGHT,
		fontsize: C_LBL_BTNSIZE,
		normalColor: C_CLR_DEFAULT,
		hoverColor: C_CLR_TWEET,
		align: C_ALIGN_CENTER
	}, function () {
		clearWindow();
		customCommentInit();
	});
	divRoot.appendChild(btnTweet);
}

/**
 * カスタム画面(コメントとか)
 */
function customCommentInit() {
	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");

	// 画面背景を指定 (background-color)
	var grd = l0ctx.createLinearGradient(0, 0, 0, g_sHeight);
	grd.addColorStop(0, "#000000");
	grd.addColorStop(1, "#002222");
	l0ctx.fillStyle = grd;
	l0ctx.fillRect(0, 0, g_sWidth, g_sHeight);

	// タイトル文字描画
	var lblTitle = getTitleDivLabel("lblTitle",
		"<span style='color:#6666ff;font-size:40px;'>C</span>OMMENT", 0, 15);
	divRoot.appendChild(lblTitle);

	var comment = "これはカスタムページのテストです。<br>" +
		"このように、作品別に特殊なページを作ることもできます。<br><br>" +
		"下記のような戻るボタンがあると良いですね。(・∀・)";

	var lblComment = createDivLabel("lblComment", g_sWidth / 2 - 200, 100, 400, 20, 14, "#cccccc",
		comment);
	lblComment.style.textAlign = C_ALIGN_LEFT;
	divRoot.appendChild(lblComment);

	var lblC = createArrowEffect("lblC", "#ffffff", g_sWidth / 2 + 200, 350, 100, "onigiri");
	divRoot.appendChild(lblC);

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
}

/**
 * オプション画面(初期表示)
 */
function customOptionInit() {
	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");

	// 画面背景を指定 (background-color)
	var grd = l0ctx.createLinearGradient(0, 0, 0, g_sHeight);
	grd.addColorStop(0, "#000000");
	grd.addColorStop(1, "#171700");
	l0ctx.fillStyle = grd;
	l0ctx.fillRect(0, 0, g_sWidth, g_sHeight);

}

/**
 * キーコンフィグ画面(初期表示)
 */
function customKeyConfigInit() {
	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");

	// 画面背景を指定 (background-color)
	var grd = l0ctx.createLinearGradient(0, 0, 0, g_sHeight);
	grd.addColorStop(0, "#000000");
	grd.addColorStop(1, "#171700");
	l0ctx.fillStyle = grd;
	l0ctx.fillRect(0, 0, g_sWidth, g_sHeight);

}

/**
 * メイン画面(初期表示)
 */
function customMainInit() {
	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");

	// 画面背景を指定 (background-color)
	var grd = l0ctx.createLinearGradient(0, 0, 0, g_sHeight);
	grd.addColorStop(0, "#000000");
	grd.addColorStop(1, "#111100");
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
 * メイン画面(フレーム毎表示)
 */
function customMainEnterFrame() {

}

/**
 * 結果画面(初期表示)
 */
function customResultInit() {
	// レイヤー情報取得
	var layer0 = document.getElementById("layer0");
	var l0ctx = layer0.getContext("2d");

	// 画面背景を指定 (background-color)
	var grd = l0ctx.createLinearGradient(0, 0, 0, g_sHeight);
	grd.addColorStop(0, "#000000");
	grd.addColorStop(1, "#001717");
	l0ctx.fillStyle = grd;
	l0ctx.fillRect(0, 0, g_sWidth, g_sHeight);

}