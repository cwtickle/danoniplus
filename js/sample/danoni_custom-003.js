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

	multiAppend(divRoot,
		// 背景の矢印オブジェクトを表示
		createColorObject2(`lblC`, {
			x: g_sWidth / 2 - 300, y: 0, w: 100, h: 100, rotate: `onigiri`, opacity: 0.25,
			background: `#ffffff`,
		}),

		// Infoボタン描画
		createCss2Button(`btnTweet`, `Info`, _ => clearTimeout(g_timeoutEvtTitleId), {
			x: g_sWidth / 4 * 3, y: 340, w: g_sWidth / 4,
			resetFunc: _ => customCommentInit(),
		}, g_cssObj.button_Tweet)
	);
}

/**
 * カスタム画面(コメントとか)
 */
function customCommentInit() {

	clearWindow(true);

	// テキスト
	const comment = `これはカスタムページのテストです。<br>
		このように、作品別に特殊なページを作ることもできます。<br><br>
		下記のような戻るボタンがあると良いですね。(・∀・)`;

	// 各種ラベル追加
	multiAppend(divRoot,

		// タイトル文字
		getTitleDivLabel(`lblTitle`,
			`<span style='color:#6666ff;font-size:40px;'>I</span>NFO`, 0, 15),

		// コメント文
		createDivCss2Label(`lblComment`, comment, {
			x: g_sWidth / 2 - 200, y: 100, w: 400, h: 20, siz: 14, color: `#cccccc`,
			align: C_ALIGN_LEFT,
		}),

		// おにぎりオブジェクトの配置
		createColorObject2(`lblC`, {
			x: g_sWidth / 2 + 200, y: 350, w: 100, h: 100, rotate: `onigiri`,
			background: `#ffffff`,
		}),

		// 戻るボタン描画
		createCss2Button(`btnBack`, g_lblNameObj.b_back, _ => true, { resetFunc: _ => titleInit() }, g_cssObj.button_Back),
	)
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