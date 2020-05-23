`use strict`;
/**
 * Dancing☆Onigiri 設定用jsファイル
 * Template Update: 2020/05/21 (v15.1.0)
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

// ゲージ設定（デフォルト）
const g_presetGauge = {
	//	Border: 70,  // ノルマ制でのボーダーライン、ライフ制にしたい場合は `x` を指定
	//	Recovery: 2, // 回復量
	//	Damage: 7,   // ダメージ量
	//	Init: 25,    // 初期値
};

// フリーズアローのデフォルト色セットの利用有無 (true: 使用, false: 矢印色を優先してセット)
const g_presetFrzColors = true;

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

// デフォルトのデザインを使用せず、独自のデザインを使用するかを指定
// カスタムデザインにする場合は `true` を指定
const g_presetCustomDesignUse = {
	title: `false`,
	titleArrow: `false`,
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

// デフォルト画像セット (C_IMG_XXXX, 厳密にはg_imgObj) に対して拡張子の上書きを行うか設定
// 文字列の後ろ3文字をカットして、下記の値を適用する。コメントアウトした場合は、上書きを行わない。
// `svg`: デフォルト(svg形式)、`png`: 従来画像(png形式)

// const g_presetOverrideExtension = `svg`;