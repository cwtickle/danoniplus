'use strict';
/**
 * Dancing☆Onigiri 設定用jsファイル
 * Template Update: 2024/01/28 (v35.0.0)
 * 
 * このファイルでは、作品全体に対しての初期設定を行うことができます。
 * 譜面データ側で個別に同様の項目が設定されている場合は、譜面データ側の設定が優先されます。
 * 例えばこのファイルで g_presetObj.tuning = `onigiri` とすると全ての作品に製作者名として「onigiri」が設定されますが、
 * 譜面データ側で |tuning=washoi| とするとその作品には製作者名として「washoi」が設定されます。
 */


/*
------------------------------------------------------------------------
   制作者クレジット・基本設定 
   https://github.com/cwtickle/danoniplus/wiki/dos-s0001-makerInfo 
------------------------------------------------------------------------
*/

/** 譜面製作者名 */
g_presetObj.tuning = `name`;

/** 譜面製作者URL */
g_presetObj.tuningUrl = `https://www.google.co.jp/`;

/** 自動横幅拡張設定 (true:有効、false:無効 / デフォルトは true) */
//g_presetObj.autoSpread = false;

/** 個人サイト別の最小横幅設定 */
//g_presetObj.autoMinWidth = 600;

/** 個人サイト別の最小高さ設定 */
//g_presetObj.autoMinHeight = 500;

/** 個人サイト別の高さ可変設定 (true: 有効、false: 無効 / デフォルトは false)*/
//g_presetObj.heightVariable = true;

/** 個人サイト別のウィンドウ位置 (left:左寄せ, center:中央, right:右寄せ)*/
//g_presetObj.windowAlign = `center`;

/*
------------------------------------------------------------------------
   カスタムファイル設定 
   https://github.com/cwtickle/danoniplus/wiki/dos-s0002-customFile
------------------------------------------------------------------------
*/

/** 既定スキン (デフォルトは default) */
g_presetObj.skinType = `default`;

/** skinTypeがdefaultのとき、Canvas背景を有効にするかどうかのフラグ (デフォルトは有効(true)。falseで無効化) */
//g_presetObj.bgCanvasUse = false;

/** 既定カスタムJs (デフォルトは danoni_custom.js) */
//g_presetObj.customJs = `danoni_custom.js,danoni_init.js`;

/** 既定カスタムCss (デフォルトは指定なし、cssフォルダを参照) */
//g_presetObj.customCss = `danoni_custom.css`;

/** 背景・マスクモーションで使用する画像パスの指定方法を他の設定に合わせる設定 (trueで有効化) */
//g_presetObj.syncBackPath = true;

/*
------------------------------------------------------------------------
   ゲージ設定 
   https://github.com/cwtickle/danoniplus/wiki/dos-s0003-initialGauge
------------------------------------------------------------------------
*/

/** ゲージ設定（デフォルト）*/
g_presetObj.gauge = {
	//	Border: 70,  // ノルマ制でのボーダーライン、ライフ制にしたい場合は `x` を指定
	//	Recovery: 2, // 回復量
	//	Damage: 7,   // ダメージ量
	//	Init: 25,    // 初期値
};

/** ゲージ設定（デフォルト以外）*/
g_presetObj.gaugeCustom = {
	Easy: {
		Border: 70,
		Recovery: 4,
		Damage: 7,
		Init: 25,
	},
	Hard: {
		Border: `x`,
		Recovery: 1,
		Damage: 50,
		Init: 100,
	},
	NoRecovery: {
		Border: `x`,
		Recovery: 0,
		Damage: 50,
		Init: 100,
	},
	SuddenDeath: {
		Border: `x`,
		Recovery: 0,
		Damage: setVal(g_rootObj.maxLifeVal, C_VAL_MAXLIFE, C_TYP_FLOAT),
		Init: 100,
	},
	Practice: {
		Border: `x`,
		Recovery: 0,
		Damage: 0,
		Init: 50,
	}
};

/** 
  カスタムゲージ設定(デフォルト)
  'ゲージ名': `回復・ダメージ量設定`　の形式で指定します。
  (F : 矢印数によらず固定, V: 矢印数により変動)
*/
/*
g_presetObj.gaugeList = {
	'Original': `F`,
	'Normal': `V`,
	'Hard': `V`,
};
*/

/**
  空押し判定を行うか
  判定させる場合は true を指定
*/
g_presetObj.excessiveJdgUse = false;


/*
------------------------------------------------------------------------
   フリーズアロー設定 
   https://github.com/cwtickle/danoniplus/wiki/dos-s0004-frzArrow
------------------------------------------------------------------------
*/

/** フリーズアローのデフォルト色セットの利用有無 (true: 使用, false: 矢印色を優先してセット) */
g_presetObj.frzColors = true;

/**
  矢印色変化に対応してフリーズアロー色を追随する範囲の設定 (Normal: 通常時、Hit: ヒット時)
  ※この設定は、g_presetObj.frzColors = false もしくは
	譜面ヘッダー：defaultFrzColorUse=false のときにのみ有効です。
*/
//g_presetObj.frzScopeFromAC = [`Normal`, `Hit`];

/**
  フリーズアローの始点で通常矢印の判定を行うか(dotさんソース方式)
  判定させる場合は true を指定
*/
g_presetObj.frzStartjdgUse = false;

/*
------------------------------------------------------------------------
   デフォルトデザイン・画像設定
   https://github.com/cwtickle/danoniplus/wiki/dos-s0005-defaultDesign
------------------------------------------------------------------------
*/

// デフォルトのデザインを使用せず、独自のデザインを使用するかを指定
// カスタムデザインにする場合は true を指定
g_presetObj.customDesignUse = {
	title: false,
	titleArrow: false,
	titleAnimation: false,
	back: false,
	backMain: false,
	ready: false,
};

/**
  デフォルト画像セットの設定
  (セット対象のフォルダ名, 拡張子, 画像回転有無(true or false), Flat時ステップ間隔の順に指定)

  事前に、[img]フォルダ配下にセット対象のサブフォルダを作成し、その中に一式を入れておく必要あり
  下記の場合は[classic]フォルダに[png]形式の画像一式をデフォルト画像セットとして使用する

  未指定の場合のデフォルト値は以下の通り
	セット対象のフォルダ名：`` (imgフォルダ直下)
	拡張子：`svg`形式
	画像回転有無：true(回転有り)
	Flat時ステップ間隔：50(px) ※矢印サイズ
*/
//g_presetObj.imageSets = [``, `classic,png`, `classic-thin,png`, `note,svg,false,0`];

/**
  デフォルト画像セット (C_IMG_XXXX, 厳密にはg_imgObj) に対して拡張子の上書きを行うか設定
  文字列の後ろ3文字をカットして、下記の値を適用する。コメントアウトした場合は、上書きを行わない。
	`svg`: デフォルト(svg形式)、`png`: 従来画像(png形式)
*/
//g_presetObj.overrideExtension = `svg`;

/**
  追加指定する画像のリスト（サーバ上の場合のみ有効）
  ここで設定した画像をimgフォルダに指定した名前で格納しておくことで、
  stepRtnX_Yで設定する名前に使用することができる

  `ball`と指定した場合、下記の画像を準備する必要あり
	- ball.svg, ballShadow.svg, ballStepHit.svg (g_presetOverrideExtension を pngにすれば、pngに変更可)
*/
//g_presetObj.customImageList = [`ball`, `square`];

/**
 * 背景・マスクモーションで利用する「animationFillMode」のデフォルト値
 * - none      : 初期画像へ戻す
 * - forwards  : アニメーション100%の状態を維持（デフォルト）
 * - backwards : アニメーション  0%の状態に戻す
 */
//g_presetObj.animationFillMode = `none`;


/*
------------------------------------------------------------------------
   オプション有効化
   https://github.com/cwtickle/danoniplus/wiki/dos-s0006-settingUse
------------------------------------------------------------------------
*/

/**
  オプション利用設定（デフォルト）
  一律使用させたくない場合は `false` を指定（デフォルトは `true`）
  Display設定の場合は `true,OFF`(設定は有効だが初期値はOFF)といったことができる
*/
g_presetObj.settingUse = {
	motion: `true`,
	scroll: `true`,
	shuffle: `true`,
	autoPlay: `true`,
	gauge: `true`,
	excessive: `true`,
	appearance: `true`,

	//	stepZone: `true`,
	//	judgment: `true`,
	//	fastSlow: `true`,
	//	lifeGauge: `true`,
	//	score: `true`,
	//	musicInfo: `true`,
	//	filterLine: `true`,
	//	speed: `true`,
	//	color: `true`,
	//	lyrics: `true`,
	//	background: `true`,
	//	arrowEffect: `true`,
	//	special: `true`,
};

/*
------------------------------------------------------------------------
   プレイ画面制御
   https://github.com/cwtickle/danoniplus/wiki/dos-s0007-viewControl
------------------------------------------------------------------------
*/

/**
  Reverse時の歌詞の自動反転制御設定

  通常は以下の条件でReverseが指定された場合、歌詞表示を反転します。
  この設定をどのように制御するか設定します。
	・上下スクロールを挟まないキーに限定（5key, 7key, 7ikey, 9A/9Bkeyなど）
	・リバース・スクロール拡張用の歌詞表示（wordRev_data / wordAlt_data）が設定されていない作品
	・SETTINGS 画面で Reverse：ON、Scroll：--- (指定なし) を指定してプレイ開始した場合
	・歌詞表示がすべて1段表示の場合

  ＜設定可能の値＞
	`auto`(既定)：上記ルールに従い設定 / `OFF`: 上記ルールに関わらず反転しない / `ON`: 上記ルールに関わらず反転する
*/
//g_presetObj.wordAutoReverse = `auto`;

/**
 * フェードイン時にそれ以前のデータを蓄積しない種別(word, back, mask)を指定
 */
g_presetObj.unStockCategories = [];

/** 
 * フェードイン時、プリロードを強制削除するリスト（英字は小文字で指定）
 * 指定例) back: [`fade`]   ※back_dataでアニメーション名に'fade'や'Fade'を含む
 */
g_presetObj.stockForceDelList = {
	word: [],
	back: [],
	mask: [],
};

/**
 * ショートカットキーが既定と異なる場合に表示する
 * ショートカットキーエリア用に、プレイ時のみ左右に拡張するサイズの設定
 * - 表示内容が収まるサイズは80px
 * - 下記のplayingLayoutの設定により拡張幅が変わる (center: 左右両方拡張, left: 右のみ拡張)
 */
//g_presetObj.scAreaWidth = 80;

/**
 * プレイ画面の表示レイアウト (既定: center)
 * - 現状影響する範囲は「scAreaWidth」の設定のみ
 */
//g_presetObj.playingLayout = `left`;

/**
 * プレイ画面の位置調整
 * - 譜面ヘッダーのplayingX, playingY, playingWidth, playingHeightと同じ
 */
//g_presetObj.playingX = 0;
//g_presetObj.playingY = 0;
//g_presetObj.playingWidth = 600;
//g_presetObj.playingHeight = 500;

/*
------------------------------------------------------------------------
   リザルトデータ
   https://github.com/cwtickle/danoniplus/wiki/dos-s0008-resultVals
------------------------------------------------------------------------
*/

/*
	リザルトデータのフォーマット設定
	   以下のタグは下記で置き換えられます。
	   [hashTag]   ハッシュタグ
	   [rank]      ランク
	   [score]     スコア
	   [playStyle] オプション設定
	   [arrowJdg]  矢印判定数
	   [frzJdg]    フリーズアロー判定数
	   [maxCombo]  マックスコンボ、フリーズコンボ
	   [url]       scoreId付きURL
*/
// デフォルトフォーマット
// g_presetObj.resultFormat = `【#danoni[hashTag]】[musicTitle]([keyLabel]) /[maker] /Rank:[rank]/Score:[score]/Playstyle:[playStyle]/[arrowJdg]/[frzJdg]/[maxCombo] [url]`;

// MFV2さんフォーマット（オプション設定なし・参考）
// g_presetObj.resultFormat = `【#danoni[hashTag]】[musicTitle]/[keyLabel] /[maker] /[rank]/[arrowJdg]/[frzJdg]/Mc[maxCombo]/Sco[score]-[exScore] [url]`;

/*
	リザルトデータ用のカスタム変数群

	   プロパティを定義するとそれに応じた変数に置換されます。
	   右側に定義する値は、g_resultObj配下に定義する必要があります。

	   例) exScore: `exScores`,
		   [exScore] -> g_resultObj.exScores
 */
g_presetObj.resultVals = {
	// exScore: `exScore`,
};

/* 
	リザルトカスタムデータの表示設定
	g_presetObj.resultVals から、リザルト画像データに表示したい項目を列挙します。
 */
//g_presetObj.resultValsView = [`exScore`];

/*
------------------------------------------------------------------------
   ラベルテキスト・メッセージの上書き
   https://github.com/cwtickle/danoniplus/wiki/dos-s0009-labelUpdate
------------------------------------------------------------------------
*/

/**
 * ラベルテキスト (g_lblNameObj) に対応するプロパティを上書きする設定
 * ※danoni_setting.js の他、customjsにも利用可
 * ※設定可能項目についてはdanoni_constants.jsをご覧ください。
 */
g_presetObj.lblName = {
	Ja: {

	},
	En: {

	},
};

/**
 * オンマウステキスト、確認メッセージ定義 (g_msgObj) に対応するプロパティを上書きする設定
 * ※danoni_setting.js の他、customjsにも利用可
 * ※設定可能項目についてはdanoni_constants.jsをご覧ください。
 */
g_presetObj.msg = {
	Ja: {

	},
	En: {

	},
};

/**
 * 設定名の上書き可否設定
 */
g_presetObj.lblRenames = {
	option: true,
	settingsDisplay: true,
	main: true,
	keyConfig: true,
	result: true,
};


/*
------------------------------------------------------------------------
   カスタムキー定義
   https://github.com/cwtickle/danoniplus/wiki/dos-s0010-customKeys
------------------------------------------------------------------------
*/

/**
 * カスタムキー定義（共通）
 * 指定方法は作品別にカスタムキーを定義する方法と同じ（ただし、keyExtraList必須）
 * 
 * 定義方法は下記を参照のこと
 * https://github.com/cwtickle/danoniplus/wiki/keys
 * https://github.com/cwtickle/danoniplus/wiki/tips-0004-extrakeys
 */
/*
g_presetObj.keysData = `

|keyExtraList=6,9v|
|color6=0,1,0,1,0,2$2,0,1,0,1,0|
|chara6=left,leftdia,down,rightdia,right,space$space,left,leftdia,down,rightdia,right|
|div6=6$6|
|stepRtn6=0,45,-90,135,180,onigiri$onigiri,0,45,-90,135,180|
|keyCtrl6=75/0,79/0,76/0,80/0,187/0,32/0$32/0,75/0,79/0,76/0,80/0,187/0|
|shuffle6=1,1,1,1,1,0$0,1,1,1,1,1|

|chara9v=9B_0$9B_0|
|color9v=1,0,1,0,2,0,1,0,1$9B_0|
|div9v=9$9|
|keyCtrl9v=52/0,82/0,70/0,86/0,32/0,78/0,74/0,73/0,57/0$9B_0|
|pos9v=0,1,2,3,4,5,6,7,8$0,1,2,3,4,5,6,7,8|
|scroll9v=---::1,1,-1,-1,-1,-1,-1,1,1/flat::1,1,1,1,1,1,1,1,1$9B_0|
|shuffle9v=9B_0$9B_0|
|stepRtn9v=90,120,150,180,onigiri,0,30,60,90$9B_0|
|transKey9v=$9B|

`;
*/