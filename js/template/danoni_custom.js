'use strict';
/**
 * Dancing☆Onigiri カスタム用jsファイル
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
 * タイトル画面（初期）表示前
 */
g_customJsObj.preTitle.push(() => {

});

/**
 * タイトル画面 [Scene: Title / Melon]
 */
g_customJsObj.title.push(() => {

	// バージョン表記
	g_localVersion = ``;

});

/**
 * タイトル画面(フレーム毎表示) [Scene: Title / Melon]
 */
g_customJsObj.titleEnterFrame.push(() => {

});

/**
 * データ管理画面 [Scene: Data Management / Pear]
 */
g_customJsObj.dataMgt.push(() => {

});

/**
 * デバッグ確認画面 [Scene: Precondition / Mango]
 */
g_customJsObj.precondition.push(() => {

});

/**
 * オプション画面(初期表示) [Scene: Option / Lime]
 */
g_customJsObj.option.push(() => {

});

/**
 * 譜面選択(Difficultyボタン)時カスタム処理
 * @param {boolean} _initFlg 譜面変更フラグ (true:譜面変更選択時 / false:画面遷移による移動時)
 * @param {boolean} _canLoadDifInfoFlg 譜面初期化フラグ (true:譜面設定を再読込 / false:譜面設定を引き継ぐ)
 */
g_customJsObj.difficulty.push((_initFlg, _canLoadDifInfoFlg) => {

});

/**
 * 表示変更(初期表示) [Scene: Settings-Display / Lemon]
 */
g_customJsObj.settingsDisplay.push(() => {

});

/**
 * 表示変更(初期表示) [Scene: Ex-Settings / apple]
 */
g_customJsObj.exSetting.push(() => {

});

/**
 * キーコンフィグ画面(初期表示) [Scene: KeyConfig / Orange]
 */
g_customJsObj.keyconfig.push(() => {

});

/**
 * ロード開始時
 */
g_customJsObj.preloading.push(() => {

});

/**
 * 譜面読込画面 [Scene: Loading / Strawberry]
 * - この画面のみ、画面表示がありません。
 * - 処理が完了すると、自動的にメイン画面へ遷移します。
 */
g_customJsObj.loading.push(() => {

});

/**
 * ローディング中処理
 * @param {event} _event ローディングプロパティ
 * 	_event.loaded 読込済バイト数
 * 	_event.total  読込総バイト数 
 */
g_customJsObj.progress.push((_event) => {

});

/**
 * メイン画面(初期表示) [Scene: Main / Banana]
 */
g_customJsObj.main.push(() => {

});

/**
 * 矢印生成
 * @param {object} _attrs 矢印属性
 * @param {string} _arrowName 矢印名
 * @param {string} _name 矢印識別名
 * @param {number} _arrowCnt 矢印番号
 */
g_customJsObj.makeArrow.push((_attrs, _arrowName, _name, _arrowCnt) => {

});

/**
 * フリーズアロー生成
 * @param {object} _attrs 矢印属性
 * @param {string} _arrowName 矢印名
 * @param {string} _name 矢印識別名
 * @param {number} _arrowCnt 矢印番号
 */
g_customJsObj.makeFrzArrow.push((_attrs, _arrowName, _name, _arrowCnt) => {

});

/**
 * ダミー矢印判定時
 */
g_customJsObj.dummyArrow.push(() => {

});

/**
 * ダミーフリーズアロー判定時
 */
g_customJsObj.dummyFrz.push(() => {

});

/**
 * 判定カスタム処理 (引数は共通で1つ保持)
 * @param {number} _difFrame タイミング誤差(フレーム数)
 */
// イイ
g_customJsObj.judg_ii.push((_difFrame) => {

});

// シャキン
g_customJsObj.judg_shakin.push((_difFrame) => {

});

// マターリ
g_customJsObj.judg_matari.push((_difFrame) => {

});

// ショボーン
g_customJsObj.judg_shobon.push((_difFrame) => {

});

// ウワァン
g_customJsObj.judg_uwan.push((_difFrame) => {

});

// キター
g_customJsObj.judg_kita.push((_difFrame) => {

});

// イクナイ
g_customJsObj.judg_iknai.push((_difFrame) => {

});

// 通常フリーズアローヒット時
g_customJsObj.judg_frzHit.push((_difFrame) => {

});

// ダミーフリーズアローヒット時
g_customJsObj.judg_dummyFrzHit.push((_difFrame) => {

});

/**
 * メイン画面(フレーム毎表示) [Scene: Main / Banana]
 * - 現在のフレーム数は g_scoreObj.baseFrame で取得可能
 */
g_customJsObj.mainEnterFrame.push(() => {

});

/**
 * 結果画面(初期表示) [Scene: Result / Grape]
 */
g_customJsObj.result.push(() => {

});

/**
 * 結果画面(フレーム毎表示) [Scene: Result / Grape]
 * - 現在のフレーム数は g_scoreObj.backResultFrameNum / maskResultFrameNum で取得可能
 */
g_customJsObj.resultEnterFrame.push(() => {

});
