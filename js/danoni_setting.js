'use strict';
/**
 * Dancing☆Onigiri 設定用jsファイル
 * Template Update: 2022/01/26 (v25.5.1)
 * 
 * このファイルでは、作品全体に対しての初期設定を行うことができます。
 * 譜面データ側で個別に同様の項目が設定されている場合は、譜面データ側の設定が優先されます。
 * 例えばこのファイルで g_presetTuning = `onigiri` とすると全ての作品に製作者名として「onigiri」が設定されますが、
 * 譜面データ側で |tuning=washoi| とするとその作品には製作者名として「washoi」が設定されます。
 */

// 譜面製作者名
const g_presetTuning = `name`;

// 譜面製作者URL
const g_presetTuningUrl = `https://www.google.co.jp/`;

// 既定スキン (デフォルトは default)
const g_presetSkinType = `default`;

// 既定カスタムJs (デフォルトは danoni_custom.js)
//const g_presetCustomJs = `danoni_custom.js,danoni_init.js`;

// 既定カスタムCss (デフォルトは指定なし、cssフォルダを参照)
//const g_presetCustomCss = `danoni_custom.css`;

// 背景・マスクモーションで使用する画像パスの指定方法を他の設定に合わせる設定 (trueで有効化)
// const g_presetSyncBackPath = true;

// ゲージ設定（デフォルト）
const g_presetGauge = {
	//	Border: 70,  // ノルマ制でのボーダーライン、ライフ制にしたい場合は `x` を指定
	//	Recovery: 2, // 回復量
	//	Damage: 7,   // ダメージ量
	//	Init: 25,    // 初期値
};

// フリーズアローのデフォルト色セットの利用有無 (true: 使用, false: 矢印色を優先してセット)
const g_presetFrzColors = true;

/**
	矢印色変化に対応してフリーズアロー色を追随する範囲の設定 (Normal: 通常時、Hit: ヒット時)
	※この設定は、g_presetFrzColors = false もしくは 
	譜面ヘッダー：defaultFrzColorUse=false のときにのみ有効です。
*/
// const g_presetFrzScopeFromAC = [`Normal`, `Hit`];

// ゲージ設定（デフォルト以外）
const g_presetGaugeCustom = {
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

// カスタムゲージ設定(デフォルト)
// 'ゲージ名': `回復・ダメージ量設定`　の形式で指定します。
// (F : 矢印数によらず固定, V: 矢印数により変動)
/*
const g_presetGaugeList = {
	'Original': `F`,
	'Normal': `V`,
	'Hard': `V`,
};
*/

// デフォルトのデザインを使用せず、独自のデザインを使用するかを指定
// カスタムデザインにする場合は `true` を指定
const g_presetCustomDesignUse = {
	title: `false`,
	titleArrow: `false`,
	titleAnimation: `false`,
	back: `false`,
	backMain: `false`,
	ready: `false`,
}

// オプション利用設定（デフォルト）
// 一律使用させたくない場合は `false` を指定（デフォルトは `true`）
const g_presetSettingUse = {
	motion: `true`,
	scroll: `true`,
	shuffle: `true`,
	autoPlay: `true`,
	gauge: `true`,
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

// フリーズアローの始点で通常矢印の判定を行うか(dotさんソース方式)
// 判定させる場合は `true` を指定
const g_presetFrzStartjdgUse = `false`;

/*
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
// const g_presetImageSets = [``, `classic,png`, `classic-thin,png`, `note,svg,false,0`];

// デフォルト画像セット (C_IMG_XXXX, 厳密にはg_imgObj) に対して拡張子の上書きを行うか設定
// 文字列の後ろ3文字をカットして、下記の値を適用する。コメントアウトした場合は、上書きを行わない。
// `svg`: デフォルト(svg形式)、`png`: 従来画像(png形式)

// const g_presetOverrideExtension = `svg`;

/**
 * 追加指定する画像のリスト（サーバ上の場合のみ有効）
 * ここで設定した画像をimgフォルダに指定した名前で格納しておくことで、
 * stepRtnX_Yで設定する名前に使用することができる
 * 
 * `ball`と指定した場合、下記の画像を準備する必要あり
 * - ball.svg, ballShadow.svg, ballStepHit.svg (g_presetOverrideExtension を pngにすれば、pngに変更可)
 */
// const g_presetCustomImageList = [`ball`, `square`];

/*
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
// const g_presetWordAutoReverse = `auto`;

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
// const g_presetResultFormat = `【#danoni[hashTag]】[musicTitle]([keyLabel]) /[maker] /Rank:[rank]/Score:[score]/Playstyle:[playStyle]/[arrowJdg]/[frzJdg]/[maxCombo] [url]`;

// MFV2さんフォーマット（オプション設定なし・参考）
// const g_presetResultFormat = `【#danoni[hashTag]】[musicTitle]/[keyLabel] /[maker] /[rank]/[arrowJdg]/[frzJdg]/Mc[maxCombo]/Sco[score]-[exScore] [url]`;

/*
	リザルトデータ用のカスタム変数群

	   プロパティを定義するとそれに応じた変数に置換されます。
	   右側に定義する値は、g_resultObj配下に定義する必要があります。

	   例) exScore: `exScores`,
		   [exScore] -> g_resultObj.exScores
 */
const g_presetResultVals = {
	// exScore: `exScore`,
};

/**
 * ラベルテキスト (g_lblNameObj) に対応するプロパティを上書きする設定
 * ※danoni_setting.js の他、customjsにも利用可
 * ※設定可能項目についてはdanoni_constants.jsをご覧ください。
 */
const g_local_lblNameObj = {
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
const g_local_msgObj = {
	Ja: {

	},
	En: {

	},
};

/**
 * 設定名の上書き可否設定
 */
const g_lblRenames = {
	option: true,
	settingsDisplay: true,
	main: true,
	keyConfig: true,
	result: true,
};

/**
 * フェードイン時にそれ以前のデータを蓄積しない種別(word, back, mask)を指定
 */
const g_presetUnStockCategories = [];

/** 
 * フェードイン時、プリロードを強制削除するリスト（英字は小文字で指定）
 * 指定例) back: [`fade`]   ※back_dataでアニメーション名に'fade'や'Fade'を含む
 */
const g_presetStockForceDelList = {
	word: [],
	back: [],
	mask: [],
};