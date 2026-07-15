'use strict';
/**
 * Dancing☆Onigiri カスタム例 -003
 * 
 * このファイルは、作品個別に設定できる項目となっています。
 * 譜面データ側で下記のように作品別の外部jsファイルを指定することで、
 * danoni_main.js の中身を変えることなく設定が可能です。
 * 
 * 設定例：
 * |customjs=sample/danoni_custom-003.js|
 * 
 * ・グローバル変数、div要素、関数は danoni_main.js のものがそのまま利用できます。
 * ・danoni_main.jsの変数を直接書き換えると、動かなくなることがあります。
 * 　こまめのバックアップをおススメします。
 * ・ラベルなどのdiv要素を作る場合、「divRoot」の下にappendChild（div要素を追加）することで
 * 　画面遷移したときにきれいに消してくれます。
 */

/*
 * 独自の変数名や関数名は、"c_"などの接頭辞をつけると、
 * danoni_main.jsの変数名と衝突しないのでおすすめです。
 * 
 * このサンプルは横幅650px以上の動作を確認しています。
 * 
 * 参考）主要変数の説明 (danoni_main.js側で定義)
 *   - g_btnX()     : ボタンの初期X座標。引数でg_btnWidth()を足した効果。
 *   - g_btnWidth() : ボタンが配置できる最大横幅長。引数で比率を指定できる。
 *   - g_sWidth     : 画面の横幅
 *   - g_sHeight    : 画面の高さ
 *   - clearWindow  : 画面の消去
 */

/**
 * 初期化
 * - タイトル画面より前で定義するため、タイトル画面に戻ってもこの処理は通過しない
 */
g_customJsObj.preTitle.push(() => {

	// -----------------------------------
	// 拡張設定（背景色変更）
	// -----------------------------------

	// 設定項目名
	g_lblNameObj.BackColor = `BackColor`;

	// 設定項目の選択肢に対応する背景色
	// 0番目の色がdivBackの背景色、1番目の色がc_backSampleの背景色
	g_settings.c_backColorset = {
		Default: [``, ``],
		Black: [`#000000`, `#222222`],
		Gray: [`#202020`, `#404040`],
		Red: [`#110000`, `#331111`],
		Green: [`#001100`, `#114411`],
		Blue: [`#000011`, `#111144`],
		Yellow: [`#111100`, `#333311`],
	};

	// 設定項目の選択肢と初期カーソル位置
	g_settings.backColors = Object.keys(g_settings.c_backColorset);  // [`Default`, `Black`, ... , `Yellow`]
	g_settings.backColorNum = 0;

	// 設定項目の初期値
	g_stateObj.backColor = g_settings.backColors[g_settings.backColorNum];

	// カスタム画面のショートカット定義
	g_shortcutObj.c_info = {
		ShiftLeft_KeyC: { id: `lnkBackColorL` },
		ShiftRight_KeyC: { id: `lnkBackColorL` },
		KeyC: { id: `lnkBackColorR` },
		Escape: { id: `c_btnBack` },
		Enter: { id: `c_btnNext` },
	};
});

/**
 * 背景色を変更するカスタム関数
 */
const c_changeBackColor = () => {
	if (document.getElementById(`divBack`) !== null) {
		// divBackの背景色を変更する
		$id(`divBack`).background = g_settings.c_backColorset[g_stateObj.backColor][0];

		// divBackの下にc_backSampleL/Rがなければ作成して背景色を変更
		if (document.getElementById(`c_backSampleL`) === null) {
			createEmptySprite(divBack, `c_backSampleL`, {
				x: g_btnX() + 50,
				y: 0,
				w: 50,
				h: g_sHeight,
				background: g_settings.c_backColorset[g_stateObj.backColor][1],
			});
		}
		$id(`c_backSampleL`).background = g_settings.c_backColorset[g_stateObj.backColor][1];

		if (document.getElementById(`c_backSampleR`) === null) {
			createEmptySprite(divBack, `c_backSampleR`, {
				x: g_btnX(1) - 100,
				y: 0,
				w: 50,
				h: g_sHeight,
				background: g_settings.c_backColorset[g_stateObj.backColor][1],
			});
		}
		$id(`c_backSampleR`).background = g_settings.c_backColorset[g_stateObj.backColor][1];
	}
};

/**
 * タイトル画面
 */
g_customJsObj.title.push(() => {

	multiAppend(divRoot,
		// 背景の矢印オブジェクトを表示
		createColorObject2(`c_lblC`, {
			x: g_btnX(1 / 2) - 300,
			y: 0,
			w: 100,
			h: 100,
			rotate: `onigiri`,
			opacity: 0.25,
			background: `#ffffff`,
		}),

		// Infoボタン描画
		createCss2Button(`c_btnInfo`, `Info`, _ => clearTimeout(g_timeoutEvtTitleId), {
			x: g_btnX(3 / 4),
			y: 340,
			w: g_btnWidth(1 / 4),
			resetFunc: _ => c_infoInit(),
		}, g_cssObj.button_Tweet)
	);
});

/**
 * カスタム画面
 */
const c_infoInit = () => {

	clearWindow();
	g_currentPage = `c_info`;

	// テキスト
	const c_comment = `
		これはカスタムページのテストです。
		このように、作品別に特殊なページを作ることもできます。

		下記のような戻るボタンがあると良いですね。(・∀・)

		
		このようなスクロールもできます。
		`.trim().split(`\n`).join(`<br>`);

	// 拡張設定表示用div要素を作成（divRootの中に作成）
	// 親div, 子divのid, 子divのCSS設定を記述
	const c_extraSet = createEmptySprite(divRoot, `c_extraSet`, {
		x: g_sWidth / 2 - 305,
		y: 250,
		w: 610,
		h: 140,
		overflow: `auto`,
		// border: `1px dashed #999999`,  // 枠がわかるように表示
	});

	// ---------------------------------------------------------------
	// ▽ BackColor設定
	// ---------------------------------------------------------------
	// 拡張設定ヘッダー表示
	c_extraSet.appendChild(
		createDivCss2Label(`c_lblExtraSet`, `Original Settings`, {
			x: 5,
			y: 0,
			w: 600,
			h: 22,
			siz: 20,
			color: `#ffffff`,
			align: C_ALIGN_CENTER,
			background: `#333333`,
			border: `1px solid #666666`,
		})
	);

	// 設定用項目のdiv要素を作成
	const c_backColor = createEmptySprite(c_extraSet, `c_backColor`, {
		x: 105,
		y: 40,
		w: 410,
		h: 22,
		overflow: `auto`,
		// border: `1px dashed #999999`,  // 枠がわかるように表示
	});
	createGeneralSetting(c_backColor, `backColor`, {
		addRFunc: () => {
			// 設定変更時に背景色を変更する
			c_changeBackColor();
		}
	});
	c_changeBackColor();

	// ショートカットキー表示
	createScText(c_backColor, `backColor`, { displayName: `c_info` });

	// △ BackColor設定　ここまで
	// ---------------------------------------------------------------

	// AAオブジェクトをランダムに表示
	const c_aaList = [`onigiri`, `giko`, `iyo`, `c`, `morara`, `monar`];
	const c_randomidx = Math.floor(Math.random() * c_aaList.length);

	// 各種ラベル追加
	multiAppend(divRoot,

		// タイトル文字
		getTitleDivLabel(`c_lblTitle`,
			`<span style='color:#6666ff;font-size:40px;'>I</span>NFO &amp; ` +
			`<span style='color:#ff6666;font-size:40px;'>O</span>RIGINAL`, 0, 15),

		// コメント文
		createDivCss2Label(`c_lblComment`, c_comment, {
			x: g_sWidth / 2 - 300,
			y: 100,
			w: 450,
			h: 100,
			siz: 14,
			color: `#cccccc`,
			align: C_ALIGN_LEFT,
			overflow: `auto`,
			border: `1px solid #666666`,
			padding: `5px`,
		}),

		// オブジェクトの配置（ページごとに切り替え、ランダム）
		createColorObject2(`c_lblC`, {
			x: g_sWidth / 2 + 200,
			y: 100,
			w: 100,
			h: 100,
			rotate: c_aaList[c_randomidx],
			animationDuration: `3s`,
			animationName: `spinY`,
			animationIterationCount: `infinite`,
			background: `#ffffff`,
		}),

		// 戻るボタン描画
		createCss2Button(`c_btnBack`, g_lblNameObj.b_back, _ => true, {
			x: g_btnX(),
			y: g_sHeight - 50,
			w: g_btnWidth(1 / 2),
			h: 25,
			siz: 20,
			resetFunc: _ => titleInit(),
		}, g_cssObj.button_Back),

		// 次へボタン描画
		createCss2Button(`c_btnNext`, `Setting`, _ => true, {
			x: g_btnX(1 / 2),
			y: g_sHeight - 50,
			w: g_btnWidth(1 / 2),
			h: 25,
			siz: 20,
			resetFunc: _ => optionInit()
		}, g_cssObj.button_Setting),

		// 外部リンク用ボタン描画
		createCss2Button(`c_btnLink`, `Custom JSに関する情報はGitHub WikiのTipsへ`, _ => true, {
			x: g_btnX(1 / 2) - 300,
			y: g_sHeight - 100,
			w: 600,
			h: 25,
			siz: 14,
			border: `1px solid #999999`,
			borderRadius: `10px`,
			resetFunc: _ => openLink(
				g_localeObj.val === `Ja`
					? `https://github.com/cwtickle/danoniplus/wiki/tips-index`
					: `https://github.com/cwtickle/danoniplus-docs/wiki/tips-index`
			),
		}, g_cssObj.button_Default),
	);

	// ショートカットキー表示
	createScText(c_btnBack, `c_btnBack`, { displayName: `c_info`, targetLabel: `c_btnBack` });
	createScText(c_btnNext, `c_btnNext`, { displayName: `c_info`, targetLabel: `c_btnNext` });

	// カスタム画面のショートカット表示
	setShortcutEvent(g_currentPage);

	document.oncontextmenu = () => true;
	divRoot.oncontextmenu = () => false;
};

// 各画面で背景色を変更する
g_skinJsObj.title.push(() => c_changeBackColor());
g_skinJsObj.dataMgt.push(() => c_changeBackColor());
g_skinJsObj.precondition.push(() => c_changeBackColor());
g_skinJsObj.option.push(() => c_changeBackColor());
g_skinJsObj.settingsDisplay.push(() => c_changeBackColor());
g_skinJsObj.exSetting.push(() => c_changeBackColor());
g_skinJsObj.keyconfig.push(() => c_changeBackColor());
g_skinJsObj.main.push(() => c_changeBackColor());
g_skinJsObj.result.push(() => c_changeBackColor());
