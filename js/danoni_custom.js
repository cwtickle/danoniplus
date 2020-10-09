'use strict';
/**
 * Dancing☆Onigiri カスタム用jsファイル
 * その１：共通設定用
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
 * ローディング中処理
 * @param {event} _event ローディングプロパティ
 * 	_event.loaded 読込済バイト数
 * 	_event.total  読込総バイト数 
 */
function customLoadingProgress(_event) {

}

/**
 * タイトル画面 [Scene: Title / Melon]
 */
function customTitleInit() {

	// バージョン表記
	g_localVersion = ``;

}

/**
 * 譜面選択(Difficultyボタン)時カスタム処理
 * @param {boolean} _initFlg 譜面変更フラグ (true:譜面変更選択時 / false:画面遷移による移動時)
 * @param {boolean} _canLoadDifInfoFlg 譜面初期化フラグ (true:譜面設定を再読込 / false:譜面設定を引き継ぐ)
 */
function customSetDifficulty(_initFlg, _canLoadDifInfoFlg) {

}

/**
 * タイトル画面(フレーム毎表示) [Scene: Title / Melon]
 */
function customTitleEnterFrame() {

}

/**
 * オプション画面(初期表示) [Scene: Option / Lime]
 */
function customOptionInit() {

}

/**
 * 表示変更(初期表示) [Scene: Settings-Display / Lemon]
 */
function customSettingsDisplayInit() {

}

/**
 * キーコンフィグ画面(初期表示) [Scene: KeyConfig / Orange]
 */
function customKeyConfigInit() {

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

	// ここにカスタム処理を記述する

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

}

/**
 * 結果画面(フレーム毎表示) [Scene: Result / Grape]
 */
function customResultEnterFrame() {

}

/**
 * 判定カスタム処理 (引数は共通で1つ保持)
 * @param {number} difFrame タイミング誤差(フレーム数)
 */
/*
// イイ
function customJudgeIi(difFrame){

}

// シャキン
function customJudgeShakin(difFrame){

}

// マターリ
function customJudgeMatari(difFrame){

}

// ショボーン
function customJudgeShobon(difFrame){

}

// ウワァン
function customJudgeUwan(difFrame){

}

// キター
function customJudgeKita(difFrame){

}

// イクナイ
function customJudgeIknai(difFrame){

}

// ダミー矢印
function customJudgeDummyArrow(difFrame){

}

// ダミーフリーズアロー
function customJudgeDummyFrz(difFrame){

}
*/