'use strict';
/**
 * Dancing☆Onigiri カスタム用jsファイル
 * その２：作品個別用
 * 
 * このファイルは、作品個別に設定できる項目となっています。
 * 譜面データ側で下記のように作品別の外部jsファイルを指定することで、
 * danoni_main.js の中身を変えることなく設定が可能です。
 * 
 * 設定例：
 * |customjs=danoni_custom-003.js,danoni_custom2.js|
 * 
 * ・グローバル変数、div要素、関数は danoni_main.js のものがそのまま利用できます。
 * ・danoni_main.jsの変数を直接書き換えると、動かなくなることがあります。
 * 　こまめのバックアップをおススメします。
 * ・ラベルなどのdiv要素を作る場合、「divRoot」の下にappendChild（div要素を追加）することで
 * 　画面遷移したときにきれいに消してくれます。
 * ・1つ目のcustom.jsとの違いは、関数名の末尾に"2"がついていることが異なります。
 * 
 */

/**
 * ローディング中処理
 * @param {event} _event ローディングプロパティ
 * 	_event.loaded 読込済バイト数
 * 	_event.total  読込総バイト数 
 */
function customLoadingProgress2(_event) {

}

/**
 * タイトル画面 [Scene: Title / Melon]
 */
function customTitleInit2() {
    // バージョン表記
    g_localVersion2 = ``;
}

/**
 * 譜面選択(Difficultyボタン)時カスタム処理 
 * @param {boolean} _initFlg 譜面変更フラグ (true:譜面変更選択時 / false:画面遷移による移動時)
 * @param {boolean} _canLoadDifInfoFlg 譜面初期化フラグ (true:譜面設定を再読込 / false:譜面設定を引き継ぐ)
 */
function customSetDifficulty2(_initFlg, _canLoadDifInfoFlg) {

}

/**
 * タイトル画面(フレーム毎表示) [Scene: Title / Melon]
 */
function customTitleEnterFrame2() {

}

/**
 * オプション画面(初期表示) [Scene: Option / Lime]
 */
function customOptionInit2() {

}

/**
 * 表示変更(初期表示) [Scene: Settings-Display / Lemon]
 */
function customSettingsDisplayInit2() {

}

/**
 * キーコンフィグ画面(初期表示) [Scene: KeyConfig / Orange]
 */
function customKeyConfigInit2() {

}

/**
 * 譜面読込画面 [Scene: Loading / Strawberry]
 * - この画面のみ、画面表示がありません。
 * - 処理が完了すると、自動的にメイン画面へ遷移します。
 */
function customLoadingInit2() {

}

/**
 * メイン画面(初期表示) [Scene: Main / Banana]
 */
function customMainInit2() {

}

/**
 * メイン画面(フレーム毎表示) [Scene: Main / Banana]
 */
function customMainEnterFrame2() {

}

/**
 * 結果画面(初期表示) [Scene: Result / Grape]
 */
function customResultInit2() {

}

/**
 * 結果画面(フレーム毎表示) [Scene: Result / Grape]
 */
function customResultEnterFrame2() {

}

/**
 * 判定カスタム処理 (引数は共通で1つ保持)
 * @param {number} difFrame タイミング誤差(フレーム数)
 */
/*
// イイ
function customJudgeIi2(difFrame){

}

// シャキン
function customJudgeShakin2(difFrame){

}

// マターリ
function customJudgeMatari2(difFrame){

}

// ショボーン
function customJudgeShobon2(difFrame){

}

// ウワァン
function customJudgeUwan2(difFrame){

}

// キター
function customJudgeKita2(difFrame){

}

// イクナイ
function customJudgeIknai2(difFrame){

}

// ダミー矢印
function customJudgeDummyArrow2(difFrame){

}

// ダミーフリーズアロー
function customJudgeDummyFrz2(difFrame){

}
*/