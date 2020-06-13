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

	// 背景の矢印オブジェクトを表示
	var lblC = createArrowEffect("lblC", "#ffffff", g_sWidth / 2 - 300, 0, 100, "onigiri");
	lblC.style.opacity = 0.25;
	divRoot.appendChild(lblC);


	// Tweetボタン描画
	var btnTweet = createButton({
		id: "btnTweet",
		name: "Info",
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

	// タイトル文字描画
	var lblTitle = getTitleDivLabel("lblTitle",
		"<span style='color:#6666ff;font-size:40px;'>I</span>NFO", 0, 15);
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

}

/**
 * キーコンフィグ画面(初期表示)
 */
function customKeyConfigInit() {

}

/**
 * メイン画面(初期表示)
 */
function customMainInit() {

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

}