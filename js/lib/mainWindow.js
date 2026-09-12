/**
 * Dancing☆Onigiri (CW Edition)
 * プレイ画面
 * - ページ: main
 *
 * Source by tickle
 * Created : 
 * Revised : 
 *
 * https://github.com/cwtickle/danoniplus
 */

/*-----------------------------------------------------------*/
/* Scene : MAIN [banana] */
/*-----------------------------------------------------------*/

/**
 * メイン画面初期化
 */
const mainInit = () => {
	clearWindow(`Main`);
	const divRoot = document.getElementById(`divRoot`);
	document.oncontextmenu = () => false;
	g_currentPage = `main`;

	g_currentArrows = 0;
	const wordMaxLen = g_scoreObj.wordMaxDepth + 1;
	g_workObj.fadeInNo = fillArray(wordMaxLen);
	g_workObj.fadeOutNo = fillArray(wordMaxLen);
	g_workObj.lastFadeFrame = fillArray(wordMaxLen);
	g_workObj.wordFadeFrame = fillArray(wordMaxLen);
	const mainCommonPos = { w: g_headerObj.playingWidth, h: g_posObj.arrowHeight };
	const objOpacity = g_stateObj.opacity / 100;

	// 背景スプライトを作成
	createMultipleSprite(`backSprite`, g_scoreObj.backMaxDepth, { x: g_workObj.backX });

	// ステップゾーン、矢印のメインスプライトを作成
	const mainSprite = createEmptySprite(divRoot, `mainSprite`, mainCommonPos);
	if (g_stateObj.frzReturn !== C_FLG_OFF) {
		divRoot.style.perspective = `1400px`;
		divRoot.style.perspectiveOrigin = `center 60%`;
		mainSprite.style.transformOrigin = `center 55%`;
	}

	addTransform(`mainSprite`, `root`, `scale(${g_workObj.scale})`, g_transPriority.scale);
	addTransform(`mainSprite`, `main`, `translateX(${wUnit(g_workObj.playingX)}) translateY(${wUnit(g_posObj.stepY - C_STEP_Y + g_headerObj.playingY)})`, g_transPriority.base);

	// 曲情報・判定カウント用スプライトを作成（メインスプライトより上位）
	const infoSprite = createEmptySprite(divRoot, `infoSprite`, mainCommonPos);
	addTransform(`infoSprite`, `main`, `translateX(${wUnit(g_workObj.playingX)}) translateY(${wUnit(g_headerObj.playingY)})`, g_transPriority.base);

	// 判定系スプライトを作成（メインスプライトより上位）
	const judgeSprite = createEmptySprite(divRoot, `judgeSprite`, mainCommonPos);
	addTransform(`judgeSprite`, `main`, `translateX(${wUnit(g_workObj.playingX)}) translateY(${wUnit(g_headerObj.playingY)})`, g_transPriority.base);
	const tkObj = getKeyInfo();
	const [keyCtrlPtn, keyNum] = [tkObj.keyCtrlPtn, tkObj.keyNum];

	// マスクスプライトを作成 (最上位)
	createMultipleSprite(`maskSprite`, g_scoreObj.maskMaxDepth, { x: g_workObj.backX });

	// カラー・モーションを適用するオブジェクトの種類
	const objList = (g_stateObj.dummyId === `` && g_autoPlaysBase.includes(g_stateObj.autoPlay)
		? [``] : [`dummy`, ``]);

	// 背景・マスクモーション、スキン変更(0フレーム指定)
	if (g_scoreObj.frameNum === 0) {
		g_animationData.filter(sprite => g_scoreObj[`${sprite}Data`][0] !== undefined).forEach(sprite => {
			g_animationFunc.drawMain[sprite](0, sprite);
			g_scoreObj[`${sprite}Data`][0] = undefined;
		});
	}

	// 矢印・フリーズアロー・速度変化 移動/判定/変化対象の初期化
	const arrowCnts = fillArray(keyNum);
	const frzCnts = fillArray(keyNum);
	const dummyArrowCnts = fillArray(keyNum);
	const dummyFrzCnts = fillArray(keyNum);
	let speedCnts = 0;
	let keychCnts = 0;

	g_workObj.flatMode = g_stateObj.d_stepzone === `FlatBar` ||
		g_stateObj.scroll.endsWith(`Flat`) ||
		g_keyObj[`flatMode${keyCtrlPtn}`] ||
		(g_stateObj.stepArea === `Halfway` &&
			g_keyObj[`div${keyCtrlPtn}`] < g_keyObj[`${g_keyObj.defaultProp}${keyCtrlPtn}`].length);
	g_workObj.stepZoneDisp = (g_stateObj.d_stepzone === C_FLG_OFF || g_workObj.flatMode) ? C_DIS_NONE : C_DIS_INHERIT;

	// mainSprite配下に層別のスプライトを作成し、ステップゾーン・矢印本体・フリーズアローヒット部分に分ける
	const mainSpriteN = [], stepSprite = [], arrowSprite = [], frzHitSprite = [];

	// Hidden+, Sudden+用のライン、パーセント表示
	const filterCss = g_stateObj.filterLock === C_FLG_OFF ? g_cssObj.life_Failed : g_cssObj.life_Cleared;
	const doubleFilterFlg = getDoubleFilterFlg();

	for (let j = 0; j < g_stateObj.layerNum; j++) {
		const mainSpriteJ = createEmptySprite(mainSprite, `mainSprite${j}`, mainCommonPos);
		mainSpriteN.push(mainSpriteJ);
		mainSpriteJ.appendChild(createColorObject2(`filterBar${j}`, g_lblPosObj.filterBar, filterCss));
		if (doubleFilterFlg) {
			mainSpriteJ.appendChild(createColorObject2(`filterBar${j % 2 == 0 ? j + 1 : j - 1}_HS`, g_lblPosObj.filterBar, filterCss));
		}

		// レイヤーごとのTransition設定
		// StepAreaオプションにより、レイヤーが倍化される場合があるため基準レイヤー数ごとに設定
		const transj = j % g_stateObj.layerNumDf;
		addTransform(`mainSprite${j}`, `mainSprite${j}`,
			g_workObj.layerTrans[Math.floor(transj / 2) * 2 + (transj + Number(g_stateObj.reverse === C_FLG_ON)) % 2], g_transPriority.layer);

		stepSprite.push(createEmptySprite(mainSpriteJ, `stepSprite${j}`, mainCommonPos));
		arrowSprite.push(createEmptySprite(mainSpriteJ, `arrowSprite${j}`, { ...mainCommonPos, y: g_workObj.hitPosition * (j % 2 === 0 ? 1 : -1) }));
		frzHitSprite.push(createEmptySprite(mainSpriteJ, `frzHitSprite${j}`, mainCommonPos));
	}

	if (g_appearanceRanges.includes(g_stateObj.appearance)) {
		mainSprite.appendChild(createDivCss2Label(`filterView`, ``, g_lblPosObj.filterView));
		if (g_stateObj.d_filterline === C_FLG_ON) {
			$id(`filterView`).opacity = 1;
			for (let j = 0; j < g_stateObj.layerNum; j++) {
				$id(`filterBar${j}`).opacity = 1;
				if (doubleFilterFlg) {
					$id(`filterBar${j}_HS`).opacity = 1;
				}
			}
		}
	}

	// ステップゾーン、フリーズアローヒット部分の生成
	for (let j = 0; j < keyNum; j++) {
		makeStepZone(j, keyCtrlPtn);
	}
	if (g_workObj.flatMode && g_stateObj.d_stepzone !== C_FLG_OFF) {

		// スクロール名に`R-`が含まれていればリバースと見做す
		const reverseFlg = g_stateObj.reverse === C_FLG_ON || g_stateObj.scroll.startsWith(`R-`);

		// ステップゾーンの代わり
		const lineY = [(C_ARW_WIDTH - g_stateObj.flatStepHeight) / 2, (C_ARW_WIDTH + g_stateObj.flatStepHeight) / 2];
		const reverses = [reverseFlg, reverseFlg];
		if (makeDedupliArray(g_workObj.scrollDir).length > 1) {
			lineY.push(lineY[0], lineY[1]);
			reverses.push(!reverses[0], !reverses[1]);
		}
		for (let k = 0; k < g_stateObj.layerNum; k += 2) {
			lineY.forEach((y, j) => {
				stepSprite[Number(reverses[j]) + k].appendChild(
					createColorObject2(`stepBar${j + k}`, {
						x: 0, y: C_STEP_Y + g_posObj.reverseStepY * Number(reverses[j]) + y,
						w: g_headerObj.playingWidth - 50, h: 1, styleName: `lifeBar`,
					}, g_cssObj.life_Failed)
				);
			});
		}
	}

	// Appearanceのオプション適用時は一部描画を隠す
	changeAppearanceBar(g_appearanceRanges.includes(g_stateObj.appearance)
		? g_hidSudObj.filterPos : g_hidSudObj.filterPosDefault[g_stateObj.appearance], 0);

	// StepArea処理
	g_stepAreaFunc.get(g_stateObj.stepArea)();

	// mainSpriteのtransform追加処理
	addTransform(`mainSprite`, `playWindow`, g_playWindowFunc.get(g_stateObj.playWindow)(), g_transPriority.playWindow);

	// EffectのArrowEffect追加処理
	g_effectFunc.get(g_stateObj.effect)();

	// 現在の矢印・フリーズアローの速度の初期化 (速度変化時に直す)
	g_workObj.currentSpeed = 2;

	// 開始位置、楽曲再生位置の設定
	const firstFrame = g_scoreObj.frameNum;
	let musicStartFrame = firstFrame + g_headerObj.blankFrame;
	const fadeFlgs = { fadein: [`In`, `Out`], fadeout: [`Out`, `In`] };
	g_audio.volume = (firstFrame === 0 ? g_stateObj.volume / 100 : 0);

	// 曲時間制御変数
	let thisTime;
	let buffTime;
	let musicStartTime;
	let musicStartCtxTime;
	let musicStartFlg = false;
	let isPaused = false; // 一時停止中かどうか(経路によらず共通のフラグ)
	let manualPauseFlg = false; // 手動ポーズによる一時停止かどうか(true時はvisibilitychangeでの自動再開をスキップ)
	let pausedElapsedTime = null; // [AudioPlayer/開始後のみ] 一時停止時点の再生位置(秒)
	let pausedStartAdjustment = null; // [AudioPlayer/開始前のみ] 開始予定までの残り時間(秒)
	let countdownTimeoutId = null; // 再開前カウントダウンのタイマーID。null=カウントダウン中でない
	const mySessionId = ++g_timelineSessionId; // このmainInit()実行を識別するID

	g_inputKeyBuffer = {};

	// 終了時間の設定
	let duration = g_audio.duration * g_fps;
	g_scoreObj.fadeOutFrame = Infinity;
	g_scoreObj.fadeOutTerm = C_FRM_AFTERFADE;

	// フェードアウト時間指定の場合、その7秒(=420フレーム)後に終了する
	let fadeNo = -1;
	if (g_headerObj.fadeFrame?.length >= g_stateObj.scoreId + 1) {
		fadeNo = (isNaN(parseInt(g_headerObj.fadeFrame[g_stateObj.scoreId][0])) ? -1 : g_stateObj.scoreId);
	}
	if (fadeNo !== -1) {
		// フェードアウト指定の場合、曲長(フェードアウト開始まで)は FadeFrame - (本来のblankFrame)
		duration = parseInt(g_headerObj.fadeFrame[fadeNo][0]) - g_headerObj.blankFrameDef;
		g_scoreObj.fadeOutFrame = Math.ceil(duration / g_headerObj.playbackRate + g_headerObj.blankFrame + g_stateObj.adjustment);

		if (g_headerObj.fadeFrame[fadeNo].length > 1) {
			g_scoreObj.fadeOutTerm = Number(g_headerObj.fadeFrame[fadeNo][1]);
		}
	}

	// 終了時間指定の場合、その値を適用する
	let endFrameUseFlg = false;
	const tmpEndFrame = g_headerObj.endFrame?.[g_stateObj.scoreId] || g_headerObj.endFrame?.[0];
	if (!isNaN(parseInt(tmpEndFrame))) {
		// 終了時間指定の場合、曲長は EndFrame - (本来のblankFrame)
		duration = parseInt(tmpEndFrame) - g_headerObj.blankFrameDef;
		endFrameUseFlg = true;
	}

	let fullFrame = Math.ceil(duration / g_headerObj.playbackRate + g_headerObj.blankFrame + g_stateObj.adjustment);
	if (g_scoreObj.fadeOutFrame !== Infinity && !endFrameUseFlg) {
		fullFrame += g_scoreObj.fadeOutTerm;
	}
	g_scoreObj.fullFrame = fullFrame;
	const fullTime = transFrameToTimer(fullFrame - g_stateObj.intAdjustment);

	// フレーム数
	divRoot.appendChild(createDivCss2Label(`lblframe`, g_scoreObj.baseFrame, { ...g_lblPosObj.lblframe, display: g_workObj.lifegaugeDisp }));

	// ライフ(数字)部作成
	const intLifeVal = Math.floor(g_workObj.lifeVal);
	let lblInitColor = g_cssObj.life_Failed;
	if (g_workObj.lifeVal === g_headerObj.maxLifeVal) {
		lblInitColor = g_cssObj.life_Max;
	} else if (g_workObj.lifeVal >= g_workObj.lifeBorder) {
		lblInitColor = g_cssObj.life_Cleared;
	}

	// 曲名・アーティスト名、譜面名表示
	const playbackView = (g_headerObj.playbackRate === 1 ? `` : ` [Rate:${g_headerObj.playbackRate}]`);
	const musicTitle = (g_headerObj.musicTitles[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.musicTitle) + playbackView;
	const artistName = g_headerObj.artistNames[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.artistName;
	const assistFlg = (g_autoPlaysBase.includes(g_stateObj.autoPlay) ? `` : `-${getStgDetailName(g_stateObj.autoPlay)}${getStgDetailName('less')}`);
	const shuffleName = (g_stateObj.shuffle !== C_FLG_OFF ? `: ${getShuffleName()}` : ``);

	// 曲名・アーティスト名、譜面名のサイズ調整
	const checkMusicSiz = (_text, _siz) => getFontSize2(_text, g_headerObj.playingWidth - g_headerObj.customViewWidth - 125, { maxSiz: _siz });

	const makerView = g_headerObj.makerView ? ` (${g_headerObj.creatorNames[g_stateObj.scoreId]})` : ``;
	const transKeyName = getTransKeyName();
	const autoAll = g_stateObj.autoAll === C_FLG_ON ? ` &gt; AutoPlay` : ``;
	let difName = `[${getKeyName(g_headerObj.keyLabels[g_stateObj.scoreId])}${transKeyName} / ${g_headerObj.difLabels[g_stateObj.scoreId]}${assistFlg}${shuffleName}${makerView}${autoAll}]`;
	let creditName = `${musicTitle} / ${artistName}`;
	if (checkMusicSiz(creditName, g_limitObj.musicTitleSiz) < 12) {
		creditName = `${musicTitle}`;
		difName = `/ ${artistName} ` + difName;
	}

	multiAppend(infoSprite,

		// ライフ（数字）
		createDivCss2Label(`lblLife`, intLifeVal, {
			x: 0, y: 30, w: 70, h: 20, siz: g_limitObj.jdgCntsSiz, display: g_workObj.lifegaugeDisp,
		}, lblInitColor),

		// ゲージ種類
		createDivCss2Label(`lblGaugeMode`, g_stateObj.gauge, { ...g_lblPosObj.lblGaugeMode, display: g_workObj.musicinfoDisp }),

		// ライフ背景
		createColorObject2(`lifeBackObj`, { ...g_lblPosObj.lifeBackObj, display: g_workObj.lifegaugeDisp }, g_cssObj.life_Background),

		// ライフ本体
		createColorObject2(`lifeBar`, {
			x: 5, y: 50 + (g_headerObj.playingHeight - 100) * (g_headerObj.maxLifeVal - intLifeVal) / g_headerObj.maxLifeVal,
			w: 15, h: (g_headerObj.playingHeight - 100) * intLifeVal / g_headerObj.maxLifeVal, styleName: `lifeBar`,
			display: g_workObj.lifegaugeDisp,
		}, lblInitColor),

		// ライフ：ボーダーライン
		// この背景の画像は40x16で作成しているが、`padding-right:5px`があるためサイズを35x16で作成
		createColorObject2(`lifeBorderObj`, {
			x: 10, y: 42 + (g_headerObj.playingHeight - 100) * (g_headerObj.maxLifeVal - g_workObj.lifeBorder) / g_headerObj.maxLifeVal,
			w: 35, h: 16, background: C_CLR_BORDER, styleName: `lifeBorder`,
			fontFamily: getBasicFont(), display: g_workObj.lifegaugeDisp,
		}, g_cssObj.life_Border, g_cssObj.life_BorderColor),

		// 曲名・アーティスト名表示
		createDivCss2Label(`lblCredit`, creditName, { ...g_lblPosObj.lblCredit, siz: checkMusicSiz(creditName, g_limitObj.musicTitleSiz) }),

		// 譜面名表示
		createDivCss2Label(`lblDifName`, difName, { ...g_lblPosObj.lblDifName, siz: checkMusicSiz(difName, 12) }),

		// 曲時間表示：現在時間
		createDivCss2Label(`lblTime1`, `-:--`, { ...g_lblPosObj.lblTime1, display: g_workObj.musicinfoDisp }),

		// 曲時間表示：総時間
		createDivCss2Label(`lblTime2`, `/ ${fullTime}`, { ...g_lblPosObj.lblTime2, display: g_workObj.musicinfoDisp }),
	);

	if (g_stateObj.frzReturn !== C_FLG_OFF) {
		multiAppend(infoSprite,
			// FrzReturnゲージ
			createColorObject2(`lifeBackFrzObj`, { ...g_lblPosObj.lifeBackFrzObj, display: g_workObj.scoreDisp }, g_cssObj.life_Background),
			createColorObject2(`lifeBarFrz`, { ...g_lblPosObj.lifeBarFrz, display: g_workObj.scoreDisp }, g_cssObj.life_frzNormal),
		)
	}

	if (g_workObj.nonDefaultSc) {
		const diffX = g_sWidth + g_headerObj.scAreaWidth - 85 + g_diffObj.shortcutX;
		const diffY = g_headerObj.playingHeight + g_diffObj.shortcutY;
		multiAppend(infoSprite,
			createDivCss2Label(`lblRetry`, `[${g_lblNameObj.l_retry}]`, {
				...g_lblPosObj.lblMainScHeader, x: diffX, y: diffY - 95,
			}),
			createDivCss2Label(`lblRetrySc`, g_kCd[g_headerObj.keyRetry], {
				...g_lblPosObj.lblMainScKey, x: diffX, y: diffY - 80,
				fontWeight: g_headerObj.keyRetry === C_KEY_RETRY ? `normal` : `bold`,
			}),
			createDivCss2Label(`lblTitleBack`, `[${g_lblNameObj.l_titleBack}]`, {
				...g_lblPosObj.lblMainScHeader, x: diffX, y: diffY - 65,
			}),
			createDivCss2Label(`lblTitleBackSc`, g_isMac ? `Shift+${g_kCd[g_headerObj.keyRetry]}` : g_kCd[g_headerObj.keyTitleBack], {
				...g_lblPosObj.lblMainScKey, x: diffX, y: diffY - 50,
				fontWeight: g_headerObj.keyTitleBack === C_KEY_TITLEBACK ? `normal` : `bold`,
			}),
			createDivCss2Label(`lblPause`, `[${g_lblNameObj.l_pause}]`, {
				...g_lblPosObj.lblMainScHeader, x: diffX, y: diffY - 35,
			}),
			createDivCss2Label(`lblPauseSc`, g_kCd[g_headerObj.keyPause], {
				...g_lblPosObj.lblMainScKey, x: diffX, y: diffY - 20,
				fontWeight: g_headerObj.keyPause === C_KEY_PAUSE ? `normal` : `bold`,
			}),
		);
	}

	// ボーダーライン表示
	lifeBorderObj.textContent = g_workObj.lifeBorder;
	if (g_stateObj.lifeBorder === 0 || g_workObj.lifeVal === g_headerObj.maxLifeVal) {
		lifeBorderObj.style.display = C_DIS_NONE;
	}

	// 歌詞表示
	const wordSprite = createEmptySprite(judgeSprite, `wordSprite`, { w: g_headerObj.playingWidth });
	for (let j = 0; j <= g_scoreObj.wordMaxDepth; j++) {
		const wordY = (j % 2 === 0 ? 10 : (g_headerObj.bottomWordSetFlg ? g_posObj.distY + 10 : g_headerObj.playingHeight - 60));
		wordSprite.appendChild(createDivCss2Label(`lblword${j}`, ``, { ...g_lblPosObj.lblWord, y: wordY, fontFamily: getBasicFont() }));
	}

	const jdgGroups = [`J`, `FJ`];
	const jdgX = [g_headerObj.playingWidth / 2 - 220, g_headerObj.playingWidth / 2 - 120];
	const jdgY = [(g_headerObj.playingHeight + g_posObj.stepYR) / 2 - 60, (g_headerObj.playingHeight + g_posObj.stepYR) / 2 + 10];
	if (g_stateObj.d_background === C_FLG_OFF && g_headerObj.jdgPosReset && g_diffObj.arrowJdgX === 0) {
		// jdgPosResetオプションにより判定位置変更が阻害されることを防ぐため、
		// X座標が変わった場合は判定位置変更が行われたと判断
	} else {
		jdgX[0] += g_diffObj.arrowJdgX;
		jdgX[1] += g_diffObj.frzJdgX;
		jdgY[0] += g_diffObj.arrowJdgY;
		jdgY[1] += g_diffObj.frzJdgY;
	}
	if (g_stateObj.playWindow === `SideScroll`) {
		jdgX[0] += 30;
		jdgX[1] -= 60;
	}

	jdgGroups.forEach((jdg, j) => {
		// キャラクタ表示
		const charaJ = createDivCss2Label(`chara${jdg}`, ``, {
			x: jdgX[j], y: jdgY[j],
			w: g_limitObj.jdgCharaWidth, h: g_limitObj.jdgCharaHeight, siz: g_limitObj.jdgCharaSiz,
			opacity: objOpacity, display: g_workObj.judgmentDisp,
		}, g_cssObj.common_ii);
		charaJ.setAttribute(`cnt`, 0);

		multiAppend(judgeSprite,

			// キャラクタ表示
			charaJ,

			// コンボ表示
			createDivCss2Label(`combo${jdg}`, ``, {
				x: jdgX[j] + 170, y: jdgY[j],
				w: g_limitObj.jdgCharaWidth, h: g_limitObj.jdgCharaHeight, siz: g_limitObj.jdgCharaSiz,
				opacity: objOpacity, display: g_workObj.judgmentDisp,
			}, g_cssObj[`common_combo${jdg}`]),

			// Fast/Slow表示
			createDivCss2Label(`diff${jdg}`, ``, {
				x: jdgX[j] + 170, y: jdgY[j] + 25,
				w: g_limitObj.jdgCharaWidth, h: g_limitObj.jdgCharaHeight, siz: g_limitObj.mainSiz,
				opacity: objOpacity, display: g_workObj.fastslowDisp,
			}, g_cssObj.common_combo),

		);
	});

	// 判定カウンタ表示
	const jdgMainScoreObj = {
		Ii: [`ii`, 0], Shakin: [`shakin`, 1], Matari: [`matari`, 2], Shobon: [`shobon`, 3], Uwan: [`uwan`, 4],
		MCombo: [`combo`, 5], Kita: [`kita`, 7], Iknai: [`iknai`, 8], FCombo: [`combo`, 9],
	};
	Object.keys(jdgMainScoreObj).forEach(jdgScore =>
		infoSprite.appendChild(makeCounterSymbol(`lbl${jdgScore}`, g_headerObj.playingWidth - 110 + (g_workObj.nonDefaultSc ? g_headerObj.scAreaWidth : 0),
			g_cssObj[`common_${jdgMainScoreObj[jdgScore][0]}`], jdgMainScoreObj[jdgScore][1] + 1, 0, g_workObj.scoreDisp)));

	// パーフェクト演出
	judgeSprite.appendChild(createDivCss2Label(`finishView`, ``, g_lblPosObj.finishView, g_cssObj.common_kita));

	// 曲情報OFF
	if (g_stateObj.d_musicinfo === C_FLG_OFF) {
		[`lblCredit`, `lblDifName`].forEach(labelName => changeStyle(labelName, g_lblPosObj.musicInfoOFF));
	}

	// デバッグ時のみフレーム数を残す
	if (!g_isDebug) {
		lblframe.style.display = C_DIS_NONE;
	}

	// Ready?表示
	if (!g_headerObj.customReadyUse) {
		const readyColor = g_headerObj.readyColor || g_headerObj.setColorOrg[0];
		let readyDelayFrame = 0;
		if (g_stateObj.fadein === 0 && g_headerObj.readyDelayFrame > 0 &&
			g_headerObj.readyDelayFrame + g_stateObj.adjustment > 0) {
			readyDelayFrame = g_headerObj.readyDelayFrame + g_stateObj.adjustment;
		}
		const readyHtml = g_headerObj.readyHtml ||
			`<span style='color:${readyColor};font-size:${wUnit(60)};'>R</span>EADY<span style='font-size:${wUnit(50)};'>?</span>`;

		divRoot.appendChild(
			createDivCss2Label(`lblReady`, readyHtml, {
				x: g_workObj.playingX + (g_headerObj.playingWidth - g_sWidth) / 2,
				y: g_headerObj.playingY + (g_headerObj.playingHeight + g_posObj.stepYR) / 2 - 75,
				w: g_sWidth, h: 50, siz: 40,
				animationDuration: `${g_headerObj.readyAnimationFrame / g_fps}s`,
				animationName: g_headerObj.readyAnimationName,
				animationDelay: `${readyDelayFrame / g_fps}s`, opacity: 0,
			})
		);
	}

	const msg = [];
	if (getMusicUrl(g_stateObj.scoreId) === `nosound.mp3`) {
		msg.push(g_msgInfoObj.I_0004);
	}
	if (g_stateObj.shuffle.indexOf(`Mirror`) !== -1 &&
		g_stateObj.dataSaveFlg && g_stateObj.autoAll === C_FLG_OFF &&
		g_keyObj[`shuffle${keyCtrlPtn}`].filter((shuffleGr, j) => shuffleGr !== g_keyObj[`shuffle${keyCtrlPtn}_0d`][j]).length > 0) {
		msg.push(g_msgInfoObj.I_0005);
	}
	if (msg.length > 0) {
		makeInfoWindow(msg.join(`<br>`), `leftToRightFade`, { _x: g_workObj.playingX, _y: g_headerObj.playingY });
	}

	// ユーザカスタムイベント(初期)
	safeExecuteCustomHooks(`g_customJsObj.main`, g_customJsObj.main);

	/**
	 * キーを押したときの処理
	 */
	const mainKeyDownActFunc = {

		OFF: (_code) => {
			const matchKeys = g_workObj.keyCtrlN;

			for (let j = 0; j < keyNum; j++) {
				matchKeys[j].filter((key, k) => _code === key && !g_workObj.keyHitFlg[j][k] && !g_judgObj.lockFlgs[j])
					.forEach(() => {
						g_judgObj.lockFlgs[j] = true;
						judgeArrow(j);
						g_judgObj.lockFlgs[j] = false;
					});
			}
		},

		ON: (_code) => { },
	};

	// キー操作イベント
	document.onkeydown = async evt => {
		evt.preventDefault();
		const setCode = transCode(evt);

		if (evt.repeat && !g_mainRepeatObj.key.includes(setCode)) {
			return blockCode(setCode);
		}
		if (setCode === g_kCdN[g_headerObj.keyPause]) {
			isPaused ? resumeTimeline(true) : pauseTimeline(true);
			return blockCode(setCode);
		}
		// ポーズ中でも押下状態バッファ自体は常に最新化しておく
		g_inputKeyBuffer[setCode] = true;
		if (isPaused) {
			return blockCode(setCode);
		}
		mainKeyDownActFunc[g_stateObj.autoAll](setCode);

		// 曲中リトライ、タイトルバック
		if (setCode === g_kCdN[g_headerObj.keyRetry]) {

			if (g_isMac && keyIsShift()) {
				// Mac OS、IPad OSはDeleteキーが無いためShift+BSで代用
				g_audio.pause();
				g_timerHandler.clearTimeout(g_timeoutEvtId);
				titleInit();

			} else {
				// その他の環境では単にRetryに対応するキーのみで適用
				await executeRetry(`Retry`);
			}

		} else if (setCode === g_kCdN[g_headerObj.keyTitleBack]) {
			g_audio.pause();
			g_timerHandler.clearTimeout(g_timeoutEvtId);
			if (keyIsShift()) {
				if (g_currentArrows !== g_fullArrows || g_stateObj.lifeMode === C_LFE_BORDER && g_workObj.lifeVal < g_workObj.lifeBorder) {
					g_gameOverFlg = true;
					g_finishFlg = false;
					g_resultObj.gaugeTransition.push([g_scoreObj.baseFrame, 0]);
				}
				resultInit();
			} else {
				titleInit();
			}

		} else if (g_appearanceRanges.includes(g_stateObj.appearance) && g_stateObj.filterLock === C_FLG_OFF) {
			const MAX_FILTER_POS = 100;
			const MIN_FILTER_POS = 0;

			if (setCode === g_hidSudObj.pgDown[g_stateObj.appearance][g_stateObj.reverse]) {
				keyIsShift()
					? changeAppearanceBar(g_hidSudObj.filterPos, 2)
					: changeAppearanceFilter(Math.min(g_hidSudObj.filterPos + 1, MAX_FILTER_POS));
			} else if (setCode === g_hidSudObj.pgUp[g_stateObj.appearance][g_stateObj.reverse]) {
				keyIsShift()
					? changeAppearanceBar(g_hidSudObj.filterPos, -2)
					: changeAppearanceFilter(Math.max(g_hidSudObj.filterPos - 1, MIN_FILTER_POS));
			}
		}
		return blockCode(setCode);
	};

	/**
	 * キーを離したときの処理
	 */
	const mainKeyUpActFunc = {

		OFF: () => {
			for (let j = 0; j < keyNum; j++) {
				if (g_workObj.keyCtrlN[j].find(key => keyIsDown(key)) === undefined) {
					$id(`stepDiv${j}`).display = C_DIS_NONE;
				}
			}
		},

		ON: () => { },
	};

	document.onkeyup = evt => {
		g_inputKeyBuffer[transCode(evt)] = false;
		mainKeyUpActFunc[g_stateObj.autoAll]();
	};

	/**
	 * 全体色変化（矢印）
	 * @param {number} _j 矢印位置
	 * @param {number} _k 矢印の表示順
	 * @param {string} _name 通常, ダミー
	 */
	const changeArrowColor = (_j, _k, _name) => {
		if (g_workObj[`mk${toCapitalize(_name)}ColorChangeAll`]?.[g_scoreObj.frameNum]) {

			/**
			 * 全体色の変更処理
			 * - 次の全体色変化対象の色と比較して一致した場合に色を変更
			 * @param {string} _type 
			 * @param {element} _baseObj 
			 */
			const changeColor = (_type, _baseObj) => {
				const cArrowColor = g_workObj[`${_name}${_type}Colors`][_j];
				const cArrowColorAll = g_workObj[`${_name}${_type}ColorsAll`][_j];
				if (_baseObj.getAttribute(`color`) !== cArrowColor && cArrowColorAll === cArrowColor) {
					_baseObj.style.background = cArrowColorAll;
					_baseObj.setAttribute(`color`, cArrowColorAll);
				}
			};

			// 矢印枠の色変化
			const arrowTop = document.getElementById(`${_name}Top${_j}_${_k}`);
			changeColor(``, arrowTop);

			// 矢印塗りつぶし部分の色変化
			if (g_headerObj.setShadowColor[0] !== ``) {
				const arrowShadow = document.getElementById(`${_name}Shadow${_j}_${_k}`);
				changeColor(`Shadow`, arrowShadow);
			}
		}
	};

	/**
	 * 全体色変化（フリーズアロー）
	 * @param {number} _j 矢印位置
	 * @param {number} _k 矢印の表示順
	 * @param {string} _name 通常, ダミー
	 * @param {string} _state フリーズアローの色変化対象 (Normal: 通常時、Hit: ヒット時)
	 */
	const changeFrzColor = (_j, _k, _name, _state) => {

		if (g_workObj[`mk${toCapitalize(_name)}ColorChangeAll`]?.[g_scoreObj.frameNum]) {
			const frzNo = `${_j}_${_k}`;
			const frzTop = document.getElementById(`${_name}Top${frzNo}`);
			const frzBar = document.getElementById(`${_name}Bar${frzNo}`);
			const frzBtm = document.getElementById(`${_name}Btm${frzNo}`);
			const frzTopShadow = document.getElementById(`${_name}TopShadow${frzNo}`);
			const frzBtmShadow = document.getElementById(`${_name}BtmShadow${frzNo}`);

			/**
			 * 全体色の変更処理
			 * @param {string} _type 
			 * @param {element} _baseObj 
			 * @param {element} _baseObj2 
			 */
			const changeColor = (_type, _baseObj, _baseObj2) => {
				const cFrzColor = g_workObj[`${_name}${_state}${_type}Colors`][_j];
				const cFrzColorAll = g_workObj[`${_name}${_state}${_type}ColorsAll`][_j];
				if (_baseObj.getAttribute(`color${_state}`) !== cFrzColor && cFrzColorAll === cFrzColor) {
					if (_baseObj2 && _state === `Normal`) {
						_baseObj2.style.background = cFrzColorAll;
					}
					_baseObj.style.background = cFrzColorAll;
					_baseObj.setAttribute(`color${_state}`, cFrzColorAll);
				}
			};

			// 矢印部分の色変化
			changeColor(``, frzBtm, frzTop);

			// 帯部分の色変化
			changeColor(`Bar`, frzBar);

			// 矢印塗りつぶし部分の色変化
			changeColor(`Shadow`, frzBtmShadow, frzTopShadow);
		}
	};


	/**
	 * 全体色変化
	 */
	const changeColorFunc = {
		arrow: (_j, _k) => changeArrowColor(_j, _k, `arrow`),
		dummyArrow: (_j, _k) => changeArrowColor(_j, _k, `dummyArrow`),
		frz: (_j, _k, _state) => changeFrzColor(_j, _k, `frz`, _state),
		dummyFrz: (_j, _k, _state) => changeFrzColor(_j, _k, `dummyFrz`, _state),
	};

	/**
	 * 矢印・フリーズアロー消去
	 * 
	 * @param {number} _j 矢印位置
	 * @param {string} _deleteName 削除オブジェクト名
	 */
	const judgeObjDelete = {};
	g_typeLists.arrow.forEach(type =>
		judgeObjDelete[type] = (_j, _deleteName) => {
			delTransform(_deleteName, `root`);
			g_workObj[`judg${toCapitalize(type)}Cnt`][_j]++;
			document.getElementById(_deleteName).remove();
			delete g_attrObj[_deleteName];
		});

	/**
	 * 自動判定
	 * ※mainInit内部で指定必須（arrowSprite指定）
	 * 
	 * @param {number} _j 矢印位置
	 * @param {object} _arrow 矢印(オブジェクト)
	 * 
	 * @param {number} _k 矢印の表示順
	 * @param {object} _frzRoot フリーズアロー(オブジェクト)
	 * @param {number} _cnt ステップゾーン到達までのフレーム数
	 * @param {number} _keyUpFrame キーを離したフレーム数
	 */
	const judgeMotionFunc = {

		// 矢印(枠外判定、AutoPlay: OFF)
		arrowOFF: (_j, _arrowName, _cnt) => {
			if (_cnt < (-1) * g_judgObj.arrowJ[g_judgPosObj.shobon]) {
				judgeUwan(_cnt, _j);
				judgeObjDelete.arrow(_j, _arrowName);
			}
		},

		// 矢印(オート、AutoPlay: ON)
		arrowON: (_j, _arrowName, _cnt) => {
			if (_cnt === 0) {
				const stepDivHit = document.getElementById(`stepHit${_j}`);

				judgeIi(_cnt, _j);
				stepDivHit.style.opacity = 1;
				stepDivHit.setAttribute(`cnt`, C_FRM_HITMOTION);
				judgeObjDelete.arrow(_j, _arrowName);
			}
		},

		// ダミー矢印(オート、AutoPlay: OFF)
		dummyArrowOFF: (_j, _arrowName, _cnt) => {
			if (_cnt === 0) {
				const stepDivHit = document.getElementById(`stepHit${_j}`);

				safeExecuteCustomHooks(`g_customJsObj.dummyArrow`, g_customJsObj.dummyArrow, _j);
				stepDivHit.style.top = wUnit(-15);
				stepDivHit.style.opacity = 1;
				stepDivHit.classList.value = ``;
				stepDivHit.classList.add(g_cssObj.main_stepDummy);
				stepDivHit.setAttribute(`cnt`, C_FRM_HITMOTION);
				judgeObjDelete.dummyArrow(_j, _arrowName);
			}
		},

		get dummyArrowON() {
			return this.dummyArrowOFF;
		},

		// フリーズアロー(成功時)
		frzOK: (_j, _k, _frzName, _cnt) => {
			judgeKita(_cnt, _j);
			$id(`frzHit${_j}`).opacity = 0;
			g_attrObj[_frzName].judgEndFlg = true;
			judgeObjDelete.frz(_j, _frzName);
		},

		// ダミーフリーズアロー(成功時)
		dummyFrzOK: (_j, _k, _frzName, _cnt) => {
			safeExecuteCustomHooks(`g_customJsObj.dummyFrz`, g_customJsObj.dummyFrz, _j);
			$id(`frzHit${_j}`).opacity = 0;
			g_attrObj[_frzName].judgEndFlg = true;
			judgeObjDelete.dummyFrz(_j, _frzName);
		},

		// フリーズアロー(枠外判定)
		frzNG: (_j, _k, _frzName, _cnt) => {
			if (_cnt < (-1) * g_judgObj.frzJ[g_judgPosObj.iknai]) {
				judgeIknai(_cnt, _j);
				g_attrObj[_frzName].judgEndFlg = true;

				changeFailedFrz(_j, _k);
				if (g_headerObj.frzStartjdgUse) {
					judgeUwan(_cnt, _j);
				}
			}
		},

		// ダミーフリーズアロー(枠外判定)
		dummyFrzNG: (_j, _k, _frzName, _cnt) => { },

		// フリーズアロー(キーを離したときの処理)
		frzKeyUp: (_j, _k, _frzName, _cnt) => {
			if (g_attrObj[_frzName].keyUpFrame > g_headerObj.frzAttempt) {
				judgeIknai(_cnt, _j);
				g_attrObj[_frzName].judgEndFlg = true;
				changeFailedFrz(_j, _k);
			}
		},

		// ダミーフリーズアロー(キーを離したときの処理)
		// ※処理上通ることはないが、統一のために定義
		get dummyFrzKeyUp() {
			return this.dummyFrzNG;
		}

	};

	/**
	 * 次矢印・フリーズアローへ判定を移すかチェック
	 * 
	 * - 判定対象の矢印／フリーズアローが未判定の状態で、現在の矢印／フリーズアローの判定領域が回復判定内に入った場合、
	 *   自身より前の判定をNG判定とした上で、判定対象の矢印／フリーズアローを強制的に削除
	 * - ただし、判定対象の矢印／フリーズアローがジャスト付近の場合は判定対象を優先する
	 *   (フリーズアローの場合、ヒット中の場合も判定対象が優先される)
	 * 
	 * @param {number} _j 矢印の位置
	 * @param {number} _k 矢印の表示順
	 * @param {number} _cnt ステップゾーン到達までのフレーム数
	 */
	const judgeNextFunc = {

		arrowOFF: (_j, _k, _cnt) => {

			// 直前のフリーズアローが未判定で、自身の判定範囲がキター(O.K.)の範囲内のとき判定対象を矢印側へ移す
			// 本来はシャキン(Great)の範囲内としたいところだが、実装が複雑になるため上記条件とする
			judgeNextFunc.frzOFF(_j, g_workObj.judgFrzCnt[_j] + 1, _cnt);

			if (g_workObj.judgArrowCnt[_j] === _k - 1 && _cnt <= g_judgObj.arrowJ[g_judgPosObj.shakin]) {
				const prevArrowName = `arrow${_j}_${g_workObj.judgArrowCnt[_j]}`;
				const prevArrow = g_attrObj[prevArrowName];

				if (prevArrow.cnt < (-1) * g_judgObj.arrowJ[g_judgPosObj.ii]) {

					// 自身より前の矢印が未判定の場合、強制的に枠外判定を行い矢印を削除
					if (prevArrow.cnt >= (-1) * g_judgObj.arrowJ[g_judgPosObj.uwan]) {
						judgeUwan(prevArrow.cnt, _j);
						judgeObjDelete.arrow(_j, prevArrowName);
					}
				}
			}
		},

		arrowON: (_j, _k, _cnt) => true,
		get dummyArrowOFF() {
			return this.arrowON;
		},
		get dummyArrowON() {
			return this.arrowON;
		},

		frzOFF: (_j, _k, _cnt) => {

			// 判定対象が自身より前のフリーズアローで、自身の判定範囲がキター(O.K.)の範囲内のとき
			if (g_workObj.judgFrzCnt[_j] === _k - 1 && _cnt <= g_judgObj.frzJ[g_judgPosObj.sfsf]) {
				const prevFrzName = `frz${_j}_${g_workObj.judgFrzCnt[_j]}`;
				const prevFrz = g_attrObj[prevFrzName];

				// 自身より前のフリーズアローが移動中かつキター(O.K.)の領域外のとき
				if (prevFrz && prevFrz.isMoving && prevFrz.cnt < (-1) * g_judgObj.frzJ[g_judgPosObj.kita]) {

					// 自身より前のフリーズアローが未判定の場合、強制的に枠外判定を行う
					if (prevFrz.cnt >= (-1) * g_judgObj.frzJ[g_judgPosObj.iknai] && !prevFrz.judgEndFlg) {
						judgeIknai(prevFrz.cnt, _j);
						if (g_headerObj.frzStartjdgUse) {
							judgeUwan(prevFrz.cnt, _j);
						}
					}
					// 自身より前のフリーズアローを削除して判定対象を自身に変更 (g_workObj.judgFrzCnt[_j]をカウントアップ)
					judgeObjDelete.frz(_j, prevFrzName);
				}
			}
		},

		frzON: (_j, _k, _cnt) => {

			if (_cnt === 0) {
				changeHitFrz(_j, _k, `frz`);
				if (g_headerObj.frzStartjdgUse) {
					judgeIi(_cnt, _j);
				}
			}
		},

		dummyFrzOFF: (_j, _k, _cnt) => {
			if (_cnt === 0) {
				changeHitFrz(_j, _k, `dummyFrz`);
			}
		},
		get dummyFrzON() {
			return this.dummyFrzOFF;
		},
	};

	/**
	 * フリーズアローヒット中に手を離したかどうかをチェック
	 * 
	 * @param _j 矢印の位置
	 */
	const checkKeyUpFunc = {
		frzOFF: (_j) => g_workObj.keyHitFlg[_j].find(flg => flg),
		frzON: (_j) => true,
		dummyFrzOFF: (_j) => true,
		dummyFrzON: (_j) => true,
	};

	/**
	 * 矢印生成
	 * @param {object} _attrs 矢印個別の属性
	 *   (pos: 矢印種類, arrivalFrame: 到達フレーム数, initY: 初期表示位置, 
	 *    initBoostY: Motion有効時の初期表示位置加算, motionFrame: アニメーション有効フレーム数)
	 * @param {number} _arrowCnt 現在の判定矢印順
	 * @param {string} _name 矢印名
	 * @param {string} _color 矢印色
	 * @param {string} _shadowColor 矢印塗りつぶし部分の色
	 */
	const makeArrow = (_attrs, _arrowCnt, _name, _color, _shadowColor) => {
		const _j = _attrs.pos;
		const dividePos = g_workObj.dividePos[_j] % 2;
		const colorPos = g_keyObj[`color${keyCtrlPtn}`][_j];

		const arrowName = `${_name}${_j}_${_arrowCnt}`;
		const stepY = C_STEP_Y + g_posObj.reverseStepY * dividePos;
		const firstPosY = stepY + (_attrs.initY * _attrs.boostSpd +
			_attrs.initBoostY * _attrs.boostDir) * g_workObj.scrollDir[_j];

		const arrowRoot = createEmptySprite(arrowSprite[g_workObj.dividePos[_j]], arrowName, {
			x: 0, y: 0, w: C_ARW_WIDTH, h: C_ARW_WIDTH,
		});
		/**
		 * 矢印毎の属性情報
		 */
		g_attrObj[arrowName] = {
			// 生存フレーム数
			cnt: _attrs.arrivalFrame + 1,
			// 生存フレーム数 (ストップ分除去、個別加速/Motionオプション用)
			boostCnt: _attrs.motionFrame,
			// 個別加速量
			boostSpd: _attrs.boostSpd,
			// ステップゾーン位置 (0: デフォルト, 1: リバース)
			dividePos: dividePos,
			// スクロール方向 (1: デフォルト, -1: リバース)
			dir: g_workObj.scrollDir[_j],
			// 個別加速方向 (1: 順方向加速, -1: 逆方向加速)
			boostDir: _attrs.boostDir,
			// 前フレーム時の位置 (判定で使用)
			prevY: firstPosY,
			// 現フレーム時の位置
			y: firstPosY,
			// 移動ロックフラグ(矢印モーション設定後に再設定)
			movLockFlg: false,
		};

		// 矢印色の設定
		// - 枠/塗りつぶし色: g_attrObj[arrowName].Arrow / ArrowShadow
		g_typeLists.arrowColor.forEach(val => g_attrObj[arrowName][`Arrow${val}`] = g_workObj[`${_name}${val}Colors`][_j]);

		// g_attrObj定義後のカスタムイベント
		safeExecuteCustomHooks(`g_customJsObj.preMakeArrow`, g_customJsObj.preMakeArrow, _attrs, arrowName, _name, _arrowCnt);

		arrowSprite[g_workObj.dividePos[_j]].appendChild(arrowRoot);
		const arrowSubRoot = createEmptySprite(arrowRoot, `sub${arrowName}`, { x: 0, y: 0, w: C_ARW_WIDTH, h: C_ARW_WIDTH });

		if (g_workObj[`${_name}CssMotions`][_j] !== ``) {
			arrowSubRoot.classList.add(g_workObj[`${_name}CssMotions`][_j]);
			arrowSubRoot.style.animationDuration = `${_attrs.arrivalFrame / g_fps}s`;
		}
		g_attrObj[arrowName].movLockFlg = g_workObj[`${_name}MovLock`][_j] || g_workObj.movLockEnabled;
		const initManualFlg = g_workObj[`${_name}InitManual`][_j] || g_workObj.initManualEnabled;
		const setArrowYCondition = `${String(g_attrObj[arrowName].movLockFlg)}_${String(initManualFlg)}`;
		setArrowY.get(setArrowYCondition)(arrowName, firstPosY, stepY);
		if (!initManualFlg) {
			addTransform(arrowName, `rootX`, `translateX(${wUnit(g_workObj.stepX[_j])})`);
		}

		/**
		 * 矢印オブジェクトの生成
		 * - 後で生成されたものが手前に表示されるため、塗りつぶし ⇒ 枠の順で作成
		 */
		// 矢印の内側を塗りつぶすか否か
		if (g_headerObj.setShadowColor[colorPos] !== ``) {
			// 矢印 (塗りつぶし)
			const arrShadow = createColorObject2(`${_name}Shadow${_j}_${_arrowCnt}`, {
				background: _shadowColor === `Default` ? _color : _shadowColor,
				rotate: g_workObj.arrowRtn[_j], styleName: `Shadow`,
			});
			if (_shadowColor === `Default`) {
				arrShadow.style.opacity = 0.5;
			}
			arrowSubRoot.appendChild(arrShadow);
		}

		// 矢印 (枠)
		arrowSubRoot.appendChild(createColorObject2(`${_name}Top${_j}_${_arrowCnt}`, {
			background: _color, rotate: g_workObj.arrowRtn[_j],
		}));
		safeExecuteCustomHooks(`g_customJsObj.makeArrow`, g_customJsObj.makeArrow, _attrs, arrowName, _name, _arrowCnt);
	};

	/**
	 * 矢印移動メイン
	 * @param {number} _j 
	 * @param {number} _k 
	 * @param {string} _name 
	 */
	const movArrow = (_j, _k, _name) => {
		const arrowName = `${_name}${_j}_${_k}`;
		const currentArrow = g_attrObj[arrowName];

		// 全体色変化 (移動時)
		changeColorFunc[_name](_j, _k);

		// 移動
		if (g_workObj.currentSpeed !== 0) {
			const boostCnt = currentArrow.boostCnt;
			currentArrow.prevY = currentArrow.y;
			currentArrow.y -= (g_workObj.currentSpeed * currentArrow.boostSpd +
				(g_workObj.motionOnFrames[boostCnt] || 0) * currentArrow.boostDir) * currentArrow.dir;
			movArrowY.get(currentArrow.movLockFlg)(arrowName, currentArrow.y);
			g_motionAlphaFunc.get(g_stateObj.motion)(arrowName, currentArrow);
			currentArrow.boostCnt--;
		}
		judgeMotionFunc[`${_name}${g_stateObj.autoAll}`](_j, arrowName, --currentArrow.cnt);
		judgeNextFunc[`${_name}${g_stateObj.autoAll}`](_j, _k, currentArrow.cnt);
	};

	/**
	 * フリーズアロー生成
	 * @param {object} _attrs フリーズアロー個別の属性
	 *   (pos: 矢印種類, arrivalFrame: 到達フレーム数, initY: 初期表示位置, 
	 *    initBoostY: Motion有効時の初期表示位置加算, motionFrame: アニメーション有効フレーム数)
	 * @param {number} _arrowCnt 現在の判定フリーズアロー順
	 * @param {string} _name フリーズアロー名
	 * @param {string} _normalColor フリーズアロー(矢印)の色
	 * @param {string} _barColor フリーズアロー(帯)の色
	 * @param {string} _shadowColor フリーズアロー(塗りつぶし)の色
	 */
	const makeFrzArrow = (_attrs, _arrowCnt, _name, _normalColor, _barColor, _shadowColor) => {
		const _j = _attrs.pos;
		const dividePos = g_workObj.dividePos[_j] % 2;
		const frzNo = `${_j}_${_arrowCnt}`;
		const frzName = `${_name}${frzNo}`;
		const stepY = C_STEP_Y + g_posObj.reverseStepY * dividePos;
		const firstPosY = stepY + (_attrs.initY * _attrs.boostSpd +
			_attrs.initBoostY * _attrs.boostDir) * g_workObj.scrollDir[_j];
		const firstBarLength = g_workObj[`mk${toCapitalize(_name)}Length`][_j][(_arrowCnt - 1) * 2] * _attrs.boostSpd;

		const frzRoot = createEmptySprite(arrowSprite[g_workObj.dividePos[_j]], frzName, {
			x: 0, y: 0, w: C_ARW_WIDTH, h: C_ARW_WIDTH + firstBarLength,
		});

		// CamoufrageType: FrzArrowの場合のみ、フリーズアローの帯を隠す
		if (g_stateObj.camoufrageType === `FrzArrow`) {
			_barColor = `#00000000`;
		}

		/**
		 * フリーズアロー毎の属性情報
		 */
		g_attrObj[frzName] = {
			// 生存フレーム数
			cnt: _attrs.arrivalFrame + 1,
			// 生存フレーム数 (ストップ分除去、個別加速/Motionオプション用)
			boostCnt: _attrs.motionFrame,
			// 判定終了フラグ (false: 未判定, true: 判定済)
			judgEndFlg: false,
			// 移動中フラグ (false: 押しっぱなしの状態, true: 移動中)
			isMoving: true,
			// フリーズアローの長さ
			frzBarLength: firstBarLength,
			// キーを離していたフレーム数 (基準値超えでNG判定)
			keyUpFrame: 0,
			// 個別加速量
			boostSpd: _attrs.boostSpd,
			// ステップゾーン位置 (0: デフォルト, 1: リバース)
			dividePos: dividePos,
			// スクロール方向 (1: デフォルト, -1: リバース)
			dir: g_workObj.scrollDir[_j],
			// 個別加速方向 (1: 順方向加速, -1: 逆方向加速)
			boostDir: _attrs.boostDir,
			// 現フレーム時のフリーズアロー本体の位置
			y: firstPosY,
			// フリーズアロー(帯)の相対位置
			barY: C_ARW_WIDTH / 2 - firstBarLength * dividePos,
			// フリーズアロー(対矢印)の相対位置
			btmY: firstBarLength * g_workObj.scrollDir[_j],
			// 移動ロックフラグ(矢印モーション設定後に再設定)
			movLockFlg: false,
		};

		// フリーズアロー色の設定
		// - 通常時 (矢印枠/矢印塗りつぶし/帯): g_attrObj[frzName].Normal / NormalShadow / NormalBar
		// - ヒット時 (矢印枠/矢印塗りつぶし/帯): g_attrObj[frzName].Hit / HitShadow / HitBar
		// - ヒット時（矢印枠/矢印塗りつぶし/帯別の生成時全体色）: g_attrObj[frzName].HitAll / HitShadowAll / HitBarAll
		g_typeLists.frzColor.forEach(val => {
			g_attrObj[frzName][val] = g_workObj[`${_name}${val}Colors`][_j];
			if (val.startsWith(`Hit`)) {
				g_attrObj[frzName][`${val}All`] = g_workObj[`${_name}${val}ColorsAll`][_j];
			}
		});

		// g_attrObj定義後のカスタムイベント
		safeExecuteCustomHooks(`g_customJsObj.preMakeFrzArrow`, g_customJsObj.preMakeFrzArrow, _attrs, frzName, _name, _arrowCnt);

		arrowSprite[g_workObj.dividePos[_j]].appendChild(frzRoot);
		let shadowColor = _shadowColor === `Default` ? _normalColor : _shadowColor;
		const frzSubRoot = createEmptySprite(frzRoot, `sub${frzName}`, { x: 0, y: 0, w: C_ARW_WIDTH, h: C_ARW_WIDTH + firstBarLength });

		/**
		 * フリーズアローオブジェクトの生成
		 * - 後で生成されたものが手前に表示されるため、以下の順で作成
		 */
		multiAppend(frzSubRoot,

			// フリーズアロー帯(frzBar)
			createColorObject2(`${_name}Bar${frzNo}`, {
				x: 5, y: g_attrObj[frzName].barY, w: C_ARW_WIDTH - 10, h: firstBarLength, background: _barColor, styleName: `frzBar`,
				opacity: 0.75,
			}),
		);
		const frzTopRoot = createEmptySprite(frzSubRoot, `${_name}TopRoot${frzNo}`,
			{ x: 0, y: 0, w: C_ARW_WIDTH, h: C_ARW_WIDTH });
		const frzBtmRoot = createEmptySprite(frzSubRoot, `${_name}BtmRoot${frzNo}`,
			{ x: 0, y: g_attrObj[frzName].btmY, w: C_ARW_WIDTH, h: C_ARW_WIDTH });

		multiAppend(frzTopRoot,

			// 開始矢印の塗り部分。ヒット時は前面に表示
			createColorObject2(`${_name}TopShadow${frzNo}`, {
				background: shadowColor, rotate: g_workObj.frzArrowInitRtn[_j], styleName: `Shadow`,
			}, g_cssObj.main_objShadow),

			// 開始矢印。ヒット時は非表示
			createColorObject2(`${_name}Top${frzNo}`, {
				background: _normalColor, rotate: g_workObj.frzArrowInitRtn[_j],
			}),
		);

		multiAppend(frzBtmRoot,

			// 後発矢印の塗り部分
			createColorObject2(`${_name}BtmShadow${frzNo}`, {
				background: shadowColor, rotate: g_workObj.frzArrowInitRtn[_j], styleName: `Shadow`,
			}, g_cssObj.main_objShadow),

			// 後発矢印
			createColorObject2(`${_name}Btm${frzNo}`, {
				background: _normalColor, rotate: g_workObj.frzArrowInitRtn[_j],
			}),

		);
		if (g_workObj[`${_name}CssMotions`][_j] !== ``) {
			frzSubRoot.classList.add(g_workObj[`${_name}CssMotions`][_j]);
			frzSubRoot.style.animationDuration = `${_attrs.arrivalFrame / g_fps}s`;
		}
		if (g_workObj[`${_name}ArrowCssMotions`][_j] !== ``) {
			[frzTopRoot, frzBtmRoot].forEach(obj => {
				obj.classList.add(g_workObj[`${_name}ArrowCssMotions`][_j]);
				obj.style.animationDuration = `${_attrs.arrivalFrame / g_fps}s`;
			});
		}
		g_attrObj[frzName].movLockFlg = g_workObj[`${_name}MovLock`][_j] || g_workObj.movLockEnabled;
		const initManualFlg = g_workObj[`${_name}InitManual`][_j] || g_workObj.initManualEnabled;
		const setArrowYCondition = `${String(g_attrObj[frzName].movLockFlg)}_${String(initManualFlg)}`;
		setArrowY.get(setArrowYCondition)(frzName, firstPosY, stepY);
		if (!initManualFlg) {
			addTransform(frzName, `rootX`, `translateX(${wUnit(g_workObj.stepX[_j])})`);
		}

		safeExecuteCustomHooks(`g_customJsObj.makeFrzArrow`, g_customJsObj.makeFrzArrow, _attrs, frzName, _name, _arrowCnt);
	};

	/**
	 * フリーズアロー処理メイン
	 * @param {number} _j 
	 * @param {number} _k 
	 * @param {string} _name 
	 */
	const movFrzArrow = (_j, _k, _name) => {
		const frzNo = `${_j}_${_k}`;
		const frzName = `${_name}${frzNo}`;
		const currentFrz = g_attrObj[frzName];
		const movY = g_workObj.currentSpeed * currentFrz.boostSpd * currentFrz.dir;

		if (!currentFrz.judgEndFlg) {
			if (currentFrz.isMoving) {

				// 全体色変化 (通常時)
				changeColorFunc[_name](_j, _k, `Normal`);

				// 移動
				if (g_workObj.currentSpeed !== 0) {
					currentFrz.prevY = currentFrz.y;
					currentFrz.y -= movY + (g_workObj.motionOnFrames[currentFrz.boostCnt] || 0) * currentFrz.dir * currentFrz.boostDir;
					movArrowY.get(currentFrz.movLockFlg)(frzName, currentFrz.y);
					g_motionAlphaFunc.get(g_stateObj.motion)(frzName, currentFrz);
					currentFrz.boostCnt--;
				}
				currentFrz.cnt--;

				// 次フリーズアローへ判定を移すかチェック
				judgeNextFunc[`${_name}${g_stateObj.autoAll}`](_j, _k, currentFrz.cnt);

			} else {

				// 全体色変化 (ヒット時)
				changeColorFunc[_name](_j, _k, `Hit`);

				// フリーズアローがヒット中の処理
				if (currentFrz.frzBarLength > 0) {

					currentFrz.frzBarLength -= movY * currentFrz.dir;
					currentFrz.barY -= movY * currentFrz.dividePos;
					currentFrz.btmY -= movY;

					$id(`${_name}Bar${frzNo}`).height = wUnit(currentFrz.frzBarLength);
					$id(`${_name}Bar${frzNo}`).top = wUnit(currentFrz.barY);
					$id(`${_name}BtmRoot${frzNo}`).top = wUnit(currentFrz.btmY);

					if (!checkKeyUpFunc[`${_name}${g_stateObj.autoAll}`](_j)) {
						currentFrz.keyUpFrame++;
						judgeMotionFunc[`${_name}KeyUp`](_j, _k, frzName, currentFrz.cnt);
					}
				} else {
					judgeMotionFunc[`${_name}OK`](_j, _k, frzName, currentFrz.cnt);
				}
			}
			// フリーズアローが枠外に出たときの処理
			judgeMotionFunc[`${_name}NG`](_j, _k, frzName, currentFrz.cnt);

		} else {
			currentFrz.frzBarLength -= movY * currentFrz.dir;
			if (currentFrz.frzBarLength > 0) {
				currentFrz.y -= movY;
				movArrowY.get(currentFrz.movLockFlg)(frzName, currentFrz.y);
			} else {
				judgeObjDelete[_name](_j, frzName);
			}
		}
	};

	/**
	 * フレーム処理(譜面台)
	 */
	const flowTimeline = () => {

		const currentFrame = g_scoreObj.frameNum;
		lblframe.textContent = g_scoreObj.baseFrame;

		// キーの押下状態を取得
		for (let j = 0; j < keyNum; j++) {
			for (let m = 0; m < g_workObj.keyCtrlN[j].length; m++) {
				g_workObj.keyHitFlg[j][m] = keyIsDown(g_workObj.keyCtrlN[j][m]);
			}
		}

		if (currentFrame === musicStartFrame) {
			musicStartFlg = true;

			// ローカルかつBase64エンコード無し(WebAudioAPI使用不可)のときは従来通り再生
			if (!(g_audio instanceof AudioPlayer)) {
				musicStartTime = performance.now();
				g_audio.play();
				g_audio.dispatchEvent(new CustomEvent(`timeupdate`));
			}
		}

		// 背景・マスクモーション、スキン変更
		g_animationData.filter(sprite => g_scoreObj[`${sprite}Data`][currentFrame] !== undefined)
			.forEach(sprite => g_animationFunc.drawMain[sprite](currentFrame, sprite));

		// フェードイン・アウト
		const isFadeOutArea = currentFrame >= g_scoreObj.fadeOutFrame && currentFrame < g_scoreObj.fadeOutFrame + g_scoreObj.fadeOutTerm;
		if (g_audio.volume >= g_stateObj.volume / 100) {
			musicStartFlg = false;
		}
		if (musicStartFlg) {
			g_audio.volume = Math.min((g_audio.volume + (3 * g_stateObj.volume / 100) / 1000), 1);
		} else if (isFadeOutArea) {
			g_audio.volume = Math.max((g_audio.volume - (3 * g_stateObj.volume / 100 * C_FRM_AFTERFADE / g_scoreObj.fadeOutTerm) / 1000), 0);
		}

		// 画面揺れの設定
		if (g_scoreObj.baseFrame % 2 === 0) {
			g_shakingFunc.get(g_stateObj.shaking)();
		}

		// ユーザカスタムイベント(フレーム毎)
		safeExecuteCustomHooks(`g_customJsObj.mainEnterFrame`, g_customJsObj.mainEnterFrame);

		// 速度変化 (途中変速, 個別加速)
		while (currentFrame >= g_workObj.speedData?.[speedCnts]) {
			g_workObj.currentSpeed = g_workObj.speedData[speedCnts + 1];
			speedCnts += 2;
		}

		objList.forEach(header => {
			const headerU = toCapitalize(header);

			// 個別・全体色変化 (矢印)
			g_typeLists.arrowColor.forEach(ctype =>
				changeColors(g_workObj[`mk${headerU}Color${ctype}`]?.[currentFrame],
					g_workObj[`mk${headerU}Color${ctype}Cd`]?.[currentFrame], header, `arrow${ctype}`));

			// 個別・全体色変化（フリーズアロー）
			g_typeLists.frzColor.forEach(ctype =>
				changeColors(g_workObj[`mk${headerU}FColor${ctype}`]?.[currentFrame],
					g_workObj[`mk${headerU}FColor${ctype}Cd`]?.[currentFrame], header, `frz${ctype}`));

			// 矢印モーション
			changeCssMotions(header, `arrow`, currentFrame);

			// フリーズアローモーション
			changeCssMotions(header, `frz`, currentFrame);

		});

		// キー変化
		while (currentFrame >= g_scoreObj.keychFrames[keychCnts]) {
			for (let j = 0; j < keyNum; j++) {
				appearKeyTypes(j, g_scoreObj.keychTarget[keychCnts], g_scoreObj.keychTargetAlpha[keychCnts]);
			}
			keychCnts++;
		}

		// スクロール変化
		changeScrollArrowDirs(currentFrame);
		changeStepY(currentFrame);

		// ダミー矢印生成（背面に表示するため先に処理）
		g_workObj.mkDummyArrow?.[currentFrame]?.forEach(data =>
			makeArrow(data, ++dummyArrowCnts[data.pos], `dummyArrow`, g_workObj.dummyArrowColors[data.pos], g_workObj.dummyArrowShadowColors[data.pos]));

		// 矢印生成
		g_workObj.mkArrow[currentFrame]?.forEach(data =>
			makeArrow(data, ++arrowCnts[data.pos], `arrow`, g_workObj.arrowColors[data.pos], g_workObj.arrowShadowColors[data.pos]));

		// ダミーフリーズアロー生成
		g_workObj.mkDummyFrzArrow?.[currentFrame]?.forEach(data =>
			makeFrzArrow(data, ++dummyFrzCnts[data.pos], `dummyFrz`, g_workObj.dummyFrzNormalColors[data.pos],
				g_workObj.dummyFrzNormalBarColors[data.pos], g_workObj.dummyFrzNormalShadowColors[data.pos]));

		// フリーズアロー生成
		g_workObj.mkFrzArrow[currentFrame]?.forEach(data =>
			makeFrzArrow(data, ++frzCnts[data.pos], `frz`, g_workObj.frzNormalColors[data.pos],
				g_workObj.frzNormalBarColors[data.pos], g_workObj.frzNormalShadowColors[data.pos]));

		// 矢印・フリーズアロー移動＆消去
		for (let j = 0; j < keyNum; j++) {
			const stepDivHit = document.getElementById(`stepHit${j}`);

			// ダミー矢印
			for (let k = g_workObj.judgDummyArrowCnt[j]; k <= dummyArrowCnts[j]; k++) {
				movArrow(j, k, `dummyArrow`);
			}

			// 通常矢印
			for (let k = g_workObj.judgArrowCnt[j]; k <= arrowCnts[j]; k++) {
				movArrow(j, k, `arrow`);
			}

			// ダミーフリーズアロー移動
			for (let k = g_workObj.judgDummyFrzCnt[j]; k <= dummyFrzCnts[j]; k++) {
				movFrzArrow(j, k, `dummyFrz`);
			}

			// フリーズアロー移動
			for (let k = g_workObj.judgFrzCnt[j]; k <= frzCnts[j]; k++) {
				movFrzArrow(j, k, `frz`);
			}

			// ステップゾーンのヒット領域は一定時間で非表示化
			let hitCnt = stepDivHit.getAttribute(`cnt`);
			if (hitCnt > 0) {
				stepDivHit.setAttribute(`cnt`, --hitCnt);
				if (hitCnt === 0) {
					stepDivHit.style.opacity = 0;
				}
			}
		}

		// 歌詞表示
		g_scoreObj.wordData[currentFrame]?.forEach(tmpObj => {
			g_wordObj.wordDir = tmpObj[0];
			g_wordObj.wordDat = tmpObj[1];
			g_wordSprite = document.getElementById(`lblword${g_wordObj.wordDir}`);

			const wordDepth = Number(g_wordObj.wordDir);
			if (g_wordObj.wordDat.substring(0, 5) === `[fade`) {

				// フェードイン・アウト開始
				const fkey = fadeFlgs[Object.keys(fadeFlgs).find(flg => g_wordObj.wordDat === `[${flg}]`)];
				g_wordObj[`fade${fkey[0]}Flg${wordDepth}`] = true;
				g_wordObj[`fade${fkey[1]}Flg${wordDepth}`] = false;
				g_wordSprite.style.animationName =
					`fade${fkey[0]}${(++g_workObj[`fade${fkey[0]}No`][wordDepth] % 2)}`;

				g_workObj.lastFadeFrame[wordDepth] = currentFrame;
				g_workObj.wordFadeFrame[wordDepth] = (tmpObj.length > 2 ?
					setIntVal(tmpObj[2], C_WOD_FRAME) : C_WOD_FRAME);

				g_wordSprite.style.animationDuration = `${g_workObj.wordFadeFrame[wordDepth] / g_fps}s`;
				g_wordSprite.style.animationTimingFunction = `linear`;
				g_wordSprite.style.animationFillMode = `forwards`;

			} else if ([`[center]`, `[left]`, `[right]`].includes(g_wordObj.wordDat)) {

				// 歌詞位置変更
				g_wordSprite.style.textAlign = g_wordObj.wordDat.slice(1, -1);

			} else if (/\[fontSize=\d+\]/.test(g_wordObj.wordDat)) {

				// フォントサイズ変更
				const fontSize = setIntVal(g_wordObj.wordDat.match(/\d+/)[0], g_limitObj.mainSiz);
				g_wordSprite.style.fontSize = wUnit(fontSize);

			} else {

				// フェードイン・アウト処理後、表示する歌詞を表示
				const fadingFlg = currentFrame - g_workObj.lastFadeFrame[wordDepth] >= g_workObj.wordFadeFrame[wordDepth];
				[`Out`, `In`].filter(pattern => g_wordObj[`fade${pattern}Flg${g_wordObj.wordDir}`] && fadingFlg).forEach(pattern => {
					g_wordSprite.style.animationName = `none`;
					g_wordObj[`fade${pattern}Flg${g_wordObj.wordDir}`] = false;
				});
				g_workObj[`word${g_wordObj.wordDir}Data`] = g_wordObj.wordDat;
				g_wordSprite.innerHTML = g_wordObj.wordDat;
			}
		});

		// 判定キャラクタ消去
		jdgGroups.forEach(jdg => {
			let charaJCnt = document.getElementById(`chara${jdg}`).getAttribute(`cnt`);
			if (charaJCnt > 0) {
				document.getElementById(`chara${jdg}`).setAttribute(`cnt`, --charaJCnt);
				if (charaJCnt === 0) {
					document.getElementById(`chara${jdg}`).textContent = ``;
					document.getElementById(`combo${jdg}`).textContent = ``;
					document.getElementById(`diff${jdg}`).textContent = ``;
				}
			}
		});

		// ユーザカスタムイベント(フレーム毎、タイマー直前)
		safeExecuteCustomHooks(`g_customJsObj.mainBeforeFrameTimer`, g_customJsObj.mainBeforeFrameTimer, {
			arrowCnts, frzCnts, dummyArrowCnts, dummyFrzCnts,
		});

		// 曲終了判定
		if (currentFrame >= fullFrame) {
			if (g_stateObj.lifeMode === C_LFE_BORDER && g_workObj.lifeVal < g_workObj.lifeBorder) {
				g_gameOverFlg = true;
			}
			resetKeyControl();
			g_timerHandler.clearTimeout(g_timeoutEvtId);
			g_workObj.mainEndTime = thisTime;
			resultInit();

		} else if (g_workObj.lifeVal === 0 && g_workObj.lifeBorder === 0) {

			// ライフ制＆ライフ０の場合は途中終了
			g_audio.pause();
			g_timerHandler.clearTimeout(g_timeoutEvtId);
			g_gameOverFlg = true;
			g_finishFlg = false;
			resultInit();

		} else {

			// タイマー
			if (Math.floor(g_scoreObj.baseFrame % g_fps) === 0) {
				if (g_scoreObj.baseFrame >= 0) {
					lblTime1.textContent = transFrameToTimer(g_scoreObj.baseFrame);
				}
			}

			// 60fpsから遅延するため、その差分を取って次回のタイミングで遅れをリカバリする
			// - WebAudioAPI使用時は音源クロック(AudioContext.currentTime)を基準とする
			//   performance.now()とAudioContextの時計は独立して進むため、後者を基準にしないと
			//   再生開始時のオフセットずれやsuspend/resumeによるずれを吸収できない
			thisTime = performance.now();
			buffTime = 0;
			let holdFrame = false;

			if (g_audio instanceof AudioPlayer && g_audioClockSync && musicStartCtxTime !== undefined) {
				if (g_audio.contextState === `running`) {
					buffTime = (g_audio.contextTime - musicStartCtxTime) * 1000
						- (currentFrame - musicStartFrame) * 1000 / g_fps;
				} else {
					// AudioContext停止中は音源も止まっているため、フレーム進行も止めて復帰を待つ
					getSharedAudioContext(); // suspended時はresumeを試行
					holdFrame = true;
				}
			} else if (g_audio instanceof AudioPlayer || currentFrame >= musicStartFrame) {
				buffTime = (thisTime - musicStartTime - (currentFrame - musicStartFrame) * 1000 / g_fps);
			}

			if (!holdFrame) {
				g_scoreObj.frameNum++;
				g_scoreObj.baseFrame++;
			}
			g_timeoutEvtId = g_timerHandler.setTimeout(flowTimeline, holdFrame ? g_maxFrameWait :
				Math.min(Math.max(1000 / g_fps - buffTime, 0), g_maxFrameWait));
		}
	};

	/*
	 * タブのバックグラウンド化に伴う一時停止/再開
	 * - 【既知の制限】movLock/initManual設定(movArrowYがCSS animation任せになるケース)では、
	 *   矢印移動そのものがCSS animation駆動になるため、この一時停止機能はバックグラウンド中の
	 *   一時停止を保証できない(演出効果と異なり判定位置に直結するため実プレイには不適)。
	 *   対処は行わず、既知の制限として明記するに留める。
	 */
	const cancelResumeCountdown = () => {
		if (countdownTimeoutId !== null) {
			g_timerHandler.clearTimeout(countdownTimeoutId);
			countdownTimeoutId = null;
		}
		document.getElementById(`lblResumeCountdown`)?.remove();
	};

	let nativeAudioWasPlaying = false;

	const pauseTimeline = (_manual = false) => {
		// カウントダウン中に再度バックグラウンド化した場合は、カウントダウンのみ中断する
		// (音源は既に停止済み・gamePausedも付与済みのため、以降の処理は不要)
		cancelResumeCountdown();
		if (isPaused) {
			if (_manual) {
				// カウントダウン中に手動ポーズキーが押された場合、手動扱いに切り替える
				manualPauseFlg = true;
			}
			return;
		}
		isPaused = true;
		manualPauseFlg = _manual;
		pausedElapsedTime = null;
		pausedStartAdjustment = null;
		if (document.getElementById(`lblPauseMark`) == null) {
			const countdownLabel = createDivCss2Label(`lblPauseMark`, `Pause`, {
				...g_lblPosObj.lblPauseMark, x: g_workObj.playingX,
			});
			divRoot.appendChild(countdownLabel);
		}

		if (g_audio instanceof AudioPlayer) {
			if (g_audio.contextTime < g_audio.scheduledTime) {
				// 音源開始前は、再生位置ではなく開始予定時刻までの残り時間を保持する。
				// g_audio.play() は g_scheduleLead を加算するため、その分を除く。
				pausedStartAdjustment = g_audio.scheduledTime
					- g_audio.contextTime - g_scheduleLead;
			} else {
				// 音源開始後: 再生位置を保存する。
				pausedElapsedTime = g_audio.elapsedTime - g_scheduleLead;
			}
		} else {
			// `paused` が false の場合だけ、再開時に play() を呼ぶ
			nativeAudioWasPlaying = !g_audio.paused;
		}
		if (g_workObj.frzReturnTimerId) {
			// FrzReturn演出はflowTimelineと独立したタイマーで動いているため、
			// 一時停止時点で早期終了させる(位置復元はせず、通常終了時と同じ後片付けを行う)
			resetFrzReturn();
		}
		g_timerHandler.clearTimeout(g_timeoutEvtId);
		g_audio.pause();

		// 自動ポーズ(タブ非表示等)の場合のみ強制的に全キー「離した」状態に戻す
		if (!_manual) {
			g_inputKeyBuffer = {};
			g_workObj.keyHitFlg.forEach(lane => lane.fill(false));
			mainKeyUpActFunc[g_stateObj.autoAll]();
		}
	};

	const resumeTimeline = (_manual = false) => {
		if (!isPaused || countdownTimeoutId !== null) {
			return;
		}
		if (!_manual && manualPauseFlg) {
			// 手動ポーズ中は、タブ復帰による自動再開をスキップする
			if (document.getElementById(`lblPauseMark`) == null) {
				const countdownLabel = createDivCss2Label(`lblPauseMark`, `Pause`, {
					...g_lblPosObj.lblPauseMark, x: g_workObj.playingX,
				});
				divRoot.appendChild(countdownLabel);
			}
			return;
		}
		deleteDiv(divRoot, `lblPauseMark`);
		const countdownLabel = createDivCss2Label(`lblResumeCountdown`, ``, {
			...g_lblPosObj.lblPauseMark, x: g_workObj.playingX,
		});
		divRoot.appendChild(countdownLabel);

		const finishResume = () => {
			countdownTimeoutId = null;
			countdownLabel.remove();

			// カウントダウン中に曲中リトライ等でmainInit()が再実行されたりプレイ画面外に移動した場合、
			// 古いセッションのfinishResumeが後から発火して二重再生・二重ループを起こすのを防ぐ
			if (mySessionId !== g_timelineSessionId || g_currentPage !== `main`) {
				return;
			}

			if (g_audio instanceof AudioPlayer) {
				// バックグラウンド中にsuspendされていた場合に備え、先に明示的にresumeを試みる
				getSharedAudioContext();

				if (pausedStartAdjustment !== null) {
					// 開始前: 音源と譜面の残り開始時間を両方維持する。
					g_audio.play(pausedStartAdjustment);
					musicStartCtxTime = g_audio.scheduledTime
						+ (g_audioLatencyCompensation ? g_audio.outputLatency : 0);
					// musicStartFrame は変更しない。
				} else {
					// 開始後: 再生位置から再開し、現在フレームを基準に再アンカーする。
					g_audio.currentTime = pausedElapsedTime;
					g_audio.play();
					musicStartCtxTime = g_audio.scheduledTime
						+ (g_audioLatencyCompensation ? g_audio.outputLatency : 0);
					musicStartFrame = g_scoreObj.frameNum;
				}

			} else {
				if (nativeAudioWasPlaying) {
					g_audio.play();
				}
			}
			// バックグラウンド経過時間をフレーム計算から除外する
			musicStartTime = performance.now() - (g_scoreObj.frameNum - musicStartFrame) * 1000 / g_fps;

			divRoot.classList.remove(`gamePaused`);
			isPaused = false;
			manualPauseFlg = false;
			pausedElapsedTime = null;
			pausedStartAdjustment = null;
			g_timeoutEvtId = g_timerHandler.setTimeout(flowTimeline, 1000 / g_fps);
		};

		const tick = _remaining => {
			if (_remaining <= 0) {
				finishResume();
				return;
			}
			countdownLabel.innerHTML = String(_remaining);
			countdownTimeoutId = g_timerHandler.setTimeout(() => tick(_remaining - 1), 1000);
		};
		tick(3);
	};

	g_timelineHooks.pause = pauseTimeline;
	g_timelineHooks.resume = resumeTimeline;
	safeExecuteCustomHooks(`g_skinJsObj.main`, g_skinJsObj.main);

	g_audio.currentTime = firstFrame / g_fps * g_headerObj.playbackRate;
	g_audio.playbackRate = g_headerObj.playbackRate;

	// WebAudioAPIが使用できる場合は小数フレーム分だけ音源位置を調整
	if (g_audio instanceof AudioPlayer) {
		const musicStartAdjustment = (g_headerObj.blankFrame - g_stateObj.decimalAdjustment + 1) / g_fps;
		musicStartTime = performance.now() + (musicStartAdjustment + g_scheduleLead) * 1000;
		g_audio.play(musicStartAdjustment);

		// 音源クロック基準の開始時刻(フレーム進行の基準)
		// - g_audioLatencyCompensationが有効な場合は出力遅延分だけ表示を後ろへずらす
		musicStartCtxTime = g_audio.scheduledTime
			+ (g_audioLatencyCompensation ? g_audio.outputLatency : 0);
	}

	if (document.hidden) {
		pauseTimeline();
	} else {
		g_timeoutEvtId = g_timerHandler.setTimeout(flowTimeline, 1000 / g_fps);
	}
};

/**
 * 矢印・フリーズアローの初期位置
 * - true_true:    スクロールなし/初期位置マニュアル
 * - true_false:   スクロールなし/初期位置自動
 * - false_true:   スクロールあり/初期位置マニュアル
 * - false_false:  スクロールあり/初期位置自動
 */
const setArrowY = new Map([
	[`true_true`, (_name, _startY, _stepY) => { }],
	[`true_false`, (_name, _startY, _stepY) => addTransform(_name, `root`, `translateY(${wUnit(_stepY)})`)],
	[`false_true`, (_name, _startY, _stepY) => addTransform(_name, `root`, `translateY(${wUnit(_startY)})`)],
	[`false_false`, (_name, _startY, _stepY) => addTransform(_name, `root`, `translateY(${wUnit(_startY)})`)],
]);

/**
 * 矢印・フリーズアローの移動処理
 */
const movArrowY = new Map([
	[true, (_name, _y) => { }],
	[false, (_name, _y) => addTransform(_name, `root`, `translateY(${wUnit(_y)})`)],
]);

/**
 * ステップゾーン、フリーズアローヒット部分の生成
 * @param {number} _j 
 * @param {string} _keyCtrlPtn 
 */
const makeStepZone = (_j, _keyCtrlPtn) => {

	const colorPos = g_keyObj[`color${_keyCtrlPtn}`][_j];
	const stepSpriteJ = document.getElementById(`stepSprite${g_workObj.dividePos[_j]}`);
	const frzHitSpriteJ = document.getElementById(`frzHitSprite${g_workObj.dividePos[_j]}`);

	// ステップゾーンルート
	const stepRoot = createEmptySprite(stepSpriteJ, `stepRoot${_j}`, {
		x: g_workObj.stepX[_j], y: C_STEP_Y + g_posObj.reverseStepY * (g_workObj.dividePos[_j] % 2),
		w: C_ARW_WIDTH, h: C_ARW_WIDTH,
	});

	// 矢印の内側を塗りつぶすか否か
	if (g_headerObj.setShadowColor[colorPos] !== ``) {
		stepRoot.appendChild(
			createColorObject2(`stepShadow${_j}`, {
				rotate: g_workObj.stepRtn[_j], styleName: `ShadowStep`,
				opacity: 0.7, display: g_workObj.stepZoneDisp,
			}, g_cssObj.main_objStepShadow)
		);
	}

	appearStepZone(_j, C_DIS_NONE);

	// ステップゾーン
	multiAppend(stepRoot,

		// 本体
		createColorObject2(`step${_j}`, {
			rotate: g_workObj.stepRtn[_j], styleName: `Step`, display: g_workObj.stepZoneDisp,
		}, g_cssObj[`main_step${g_workObj.stepX[_j] === g_workObj.stepX_df[_j] ? 'Default'
			: g_stateObj.swapping === 'Mirror+' ? 'Shobon' : 'Matari'}`]),

		// 空押し
		createColorObject2(`stepDiv${_j}`, {
			rotate: g_workObj.stepRtn[_j], styleName: `Step`, display: C_DIS_NONE,
		}, g_cssObj.main_stepKeyDown),

		// ヒット時モーション
		createColorObject2(`stepHit${_j}`, {
			...g_lblPosObj.stepHit, rotate: g_workObj.stepHitRtn[_j], styleName: `StepHit`, opacity: 0,
		}, g_cssObj.main_stepDefault),

	);

	// フリーズアローヒット部分
	const frzHit = createEmptySprite(frzHitSpriteJ, `frzHit${_j}`, {
		x: g_workObj.stepX[_j], y: C_STEP_Y + g_posObj.reverseStepY * (g_workObj.dividePos[_j] % 2),
		w: C_ARW_WIDTH, h: C_ARW_WIDTH, opacity: 0,
	});
	if (isNaN(parseFloat(g_workObj.arrowRtn[_j]))) {
		multiAppend(frzHit,
			createColorObject2(`frzHitShadow${_j}`, {
				rotate: g_workObj.arrowRtn[_j], styleName: `Shadow`,
			}, g_cssObj.main_objShadow),
			createColorObject2(`frzHitTop${_j}`, {
				background: g_workObj.frzHitColors[_j], rotate: g_workObj.arrowRtn[_j],
			})
		);
	} else {
		frzHit.appendChild(
			createColorObject2(`frzHitTop${_j}`, {
				...g_lblPosObj.frzHitTop, rotate: g_workObj.arrowRtn[_j], styleName: `Shadow`,
			}, g_cssObj.main_frzHitTop)
		);
	}
};

/**
 * フィルターバーが同一層で複数必要かを確認
 * @returns {boolean}
 */
const getDoubleFilterFlg = () =>
	g_settings.stepAreaLayers.includes(g_stateObj.stepArea) ||
	(g_stateObj.stepArea === `Halfway` && g_stateObj.appearance === `Hid&Sud+`);

/**
 * フィルターバーの対象表示変更
 * @param {number} _num 
 * @param {number} _dirPlus 
 */
const changeAppearanceBar = (_num = 10, _dirPlus = 2) => {
	if (_dirPlus !== 0) {
		const step = Math.trunc(_dirPlus / 2) * 2;
		g_workObj.aprFilterCnt = nextPos(g_workObj.aprFilterCnt, step, g_stateObj.layerNum);
	}
	const doubleFilterFlg = changeAppearanceFilter(_num);

	// フィルターバーを使用するオプションのみ以下を適用
	if (g_appearanceRanges.includes(g_stateObj.appearance) && g_stateObj.d_filterline === C_FLG_ON) {

		// 階層が多い場合はShift+pgUp/pgDownで表示する階層グループを切り替え
		const topNum = g_hidSudObj[g_stateObj.appearance];
		const bottomNum = (g_hidSudObj[g_stateObj.appearance] + 1) % 2;

		for (let j = 0; j < g_stateObj.layerNum; j += 2) {
			[`${topNum + j}`, `${bottomNum + j}`].forEach(type => {
				const displayState = (j === g_workObj.aprFilterCnt ? C_DIS_INHERIT : C_DIS_NONE);
				$id(`filterBar${type}`).display = displayState;

				if (doubleFilterFlg) {
					$id(`filterBar${type}_HS`).display = displayState;
				}
			});
		}

		// フィルターバーの非表示条件
		const baseLayer = g_workObj.aprFilterCnt;
		const dividePosPart = g_workObj.dividePos.filter(v => Math.floor(v / 2) === g_workObj.aprFilterCnt / 2);
		const currentBarNum = g_hidSudObj.std[g_stateObj.appearance][
			dividePosPart.length > 0
				? dividePosPart[0] % 2 === 0 ? C_FLG_OFF : C_FLG_ON
				: g_stateObj.reverse
		];

		if (dividePosPart.length > 0
			&& dividePosPart.every(v => v % 2 === dividePosPart[0] % 2)) {
			if (g_stateObj.appearance !== `Hid&Sud+` || (g_stateObj.appearance === `Hid&Sud+` && g_stateObj.stepArea === `Halfway`)) {
				// スクロールが1種類の場合、対面のフィルターバーは不要なため非表示にする
				$id(`filterBar${(currentBarNum + 1) % 2 + baseLayer}`).display = C_DIS_NONE;

				if (g_settings.stepAreaLayers.includes(g_stateObj.stepArea)) {
					$id(`filterBar${(currentBarNum + 1) % 2 + baseLayer}_HS`).display = C_DIS_NONE;
				} else if (g_stateObj.appearance === `Hid&Sud+` && g_stateObj.stepArea === `Halfway`) {
					$id(`filterBar${(currentBarNum) % 2 + baseLayer}_HS`).display = C_DIS_NONE;
				}
			}
		}
	}
};

/**
 * アルファマスクの再描画 (Appearance: Hidden+, Sudden+ 用)
 * @param {number} _num 
 * @returns {boolean} フィルターバーを複数利用するかどうかのフラグ (changeAppearanceBarで利用)
 */
const changeAppearanceFilter = (_num = 10) => {
	const MAX_FILTER_POS = 100;
	const topNum = g_hidSudObj[g_stateObj.appearance];
	const bottomNum = (g_hidSudObj[g_stateObj.appearance] + 1) % 2;
	if (g_stateObj.appearance === `Hid&Sud+` && _num > MAX_FILTER_POS / 2) {
		_num = MAX_FILTER_POS / 2;
	}

	// アルファマスクの位置設定
	const numPlus = (g_stateObj.appearance === `Hid&Sud+` ? _num : 0);
	const topShape = `inset(${_num}% 0% ${numPlus}% 0%)`;
	const bottomShape = `inset(${numPlus}% 0% ${_num}% 0%)`;

	// フィルターバーの位置設定
	const appearPers = [_num, MAX_FILTER_POS - _num];
	const topDist = g_posObj.arrowHeight * appearPers[topNum] / MAX_FILTER_POS;
	const bottomDist = g_posObj.arrowHeight * appearPers[bottomNum] / MAX_FILTER_POS;
	const doubleFilterFlg = getDoubleFilterFlg();

	for (let j = 0; j < g_stateObj.layerNum; j += 2) {
		$id(`arrowSprite${topNum + j}`).clipPath = topShape;
		$id(`arrowSprite${bottomNum + j}`).clipPath = bottomShape;

		addTransform(`filterBar${topNum + j}`, `appearance`, `translateY(${wUnit(parseFloat($id(`arrowSprite${j}`).top) + topDist)})`, g_transPriority.layer);
		addTransform(`filterBar${bottomNum + j}`, `appearance`, `translateY(${wUnit(parseFloat($id(`arrowSprite${j + 1}`).top) + bottomDist)})`, g_transPriority.layer);

		if (doubleFilterFlg) {
			addTransform(`filterBar${bottomNum + j}_HS`, `appearance`, `translateY(${wUnit(parseFloat($id(`arrowSprite${j}`).top) + bottomDist)})`, g_transPriority.layer);
			addTransform(`filterBar${topNum + j}_HS`, `appearance`, `translateY(${wUnit(parseFloat($id(`arrowSprite${j + 1}`).top) + topDist)})`, g_transPriority.layer);
		}
	}

	// フィルターバーのパーセント表示（フィルターバーが複数表示されるなど複雑なため、最初の階層グループの位置に追従）
	if (g_appearanceRanges.includes(g_stateObj.appearance)) {
		const currentBarNum = g_hidSudObj.std[g_stateObj.appearance][g_stateObj.reverse];
		addTransform(`filterView`, `appearance`, `translateY(${wUnit(parseFloat($id(`arrowSprite${currentBarNum % 2}`).top) +
			(currentBarNum % 2 === 0 ? bottomDist : topDist))})`, g_transPriority.layer);
		filterView.textContent = `${_num}%`;
		g_hidSudObj.filterPos = _num;
	}

	// ユーザカスタムイベント(アルファマスクの再描画)
	safeExecuteCustomHooks(`g_customJsObj.appearanceFilter`, g_customJsObj.appearanceFilter, topNum, bottomNum);

	return doubleFilterFlg;
};

/**
 * 判定カウンタ表示作成
 * @param {string} _id 
 * @param {number} _x
 * @param {string} _class 
 * @param {number} _heightPos 
 * @param {string|number} _text
 * @param {string} [_display='inherit'] 表示有無 (inherit: 表示 / none: 非表示)
 * @returns {HTMLDivElement}
 */
const makeCounterSymbol = (_id, _x, _class, _heightPos, _text, _display = C_DIS_INHERIT) => {
	return createDivCss2Label(_id, _text, {
		x: _x, y: g_limitObj.jdgCntsHeight * _heightPos,
		w: g_limitObj.jdgCntsWidth, h: g_limitObj.jdgCntsHeight, siz: g_limitObj.jdgCntsSiz, align: C_ALIGN_RIGHT,
		display: _display,
	}, _class);
};

/**
 * ステップゾーンの表示・非表示切替
 * @param {number} _j
 * @param {string} _display
 * @param {number} [_alpha=1] 
 */
const appearStepZone = (_j, _display, _alpha = 1) => {
	$id(`stepRoot${_j}`).display = _display;
	$id(`stepRoot${_j}`).opacity = _alpha;
};

/**
 * 部分キーのステップゾーン出現処理
 * @param {number} _j 
 * @param {string[]} _targets
 * @param {number[]} [_alphas] ステップゾーン毎の可視状況 (style.opacity の値)
 */
const appearKeyTypes = (_j, _targets, _alphas = fillArray(_targets.length, 1)) => {
	appearStepZone(_j, C_DIS_NONE);
	_targets.forEach((target, k) => {
		if (g_workObj.keyGroupMaps[_j].includes(target)) {
			appearStepZone(_j, C_DIS_INHERIT, _alphas[k]);
		}
	});
};

/**
 * FrzReturnの開始条件
 */
const startFrzReturn = () => {
	if (!g_workObj.frzReturnFlg) {
		if (g_workObj.frzReturnTimerId) {
			g_timerHandler.clearTimeout(g_workObj.frzReturnTimerId);
			g_workObj.frzReturnTimerId = null;
		}
		lifeBarFrz.classList.remove(g_cssObj.life_frzNormal, g_cssObj.life_frzActive);
		lifeBarFrz.classList.add(g_cssObj.life_frzActive);
		const seqLen = g_workObj.frzReturnSeq.length;
		executeFrzReturn(
			g_workObj.frzReturnSeq[seqLen > 1 ? Math.floor(Math.random() * seqLen) : 0], 0,
			g_frzReturnFunc.get(g_stateObj.frzReturn)()
		);
	}
};

/**
 * FrzReturnの停止・後片付け(通常終了時／一時停止による中断時で共通)
 */
const resetFrzReturn = () => {
	if (g_workObj.frzReturnTimerId) {
		g_timerHandler.clearTimeout(g_workObj.frzReturnTimerId);
	}
	g_workObj.frzReturnTimerId = null;
	g_workObj.frzReturnFlg = false;
	delTransform(`mainSprite`, `frzReturn`);
	const mainSprite = document.getElementById(`mainSprite`);
	if (mainSprite) {
		mainSprite.style.opacity = 1;
	}
	const frzReturnGauge = document.getElementById(`lifeBarFrz`);
	if (frzReturnGauge) {
		frzReturnGauge.classList.remove(g_cssObj.life_frzNormal, g_cssObj.life_frzActive);
		frzReturnGauge.classList.add(g_cssObj.life_frzNormal);
	}
};

/**
 * FrzReturnの実行
 * @param {number[]} _seq FrzReturnの移動配列
 * @param {number} _idx FrzReturnの移動配列のインディクス（transformの決定に利用）
 * @param {number[]} _axis 回転軸（X, Y, X-Yなど）
 */
const executeFrzReturn = (_seq, _idx, _axis) => {

	const sprite = document.getElementById(`mainSprite`);
	if (sprite === null) {
		// 画面がプレイ画面から移動した場合
		g_workObj.frzReturnFlg = false;
		g_workObj.frzReturnTimerId = null;
		return;
	}

	if (!_seq || _idx >= _seq.length) {
		// 移動終了時
		resetFrzReturn();
		return;
	}

	g_workObj.frzReturnFlg = true;
	const _rad = _seq[_idx];

	let _transform = `rotate${_axis[0]}(${_rad}deg)`;
	if (_axis[1] !== undefined) {
		_transform += ` rotate${_axis[1]}(${_rad}deg)`;
	}

	sprite.style.transformStyle = `preserve-3d`;
	const rad360 = ((_rad % 360) + 360) % 360;

	let isBack = false;

	// 単軸回転
	if (_axis.length === 1) {
		const axis = _axis[0];
		if (axis === 'Y' || axis === 'X') {
			isBack = rad360 > 90 && rad360 < 270;
		}
		// Z軸は平面回転なので「裏側」は存在しない
	}

	// 2軸回転（XZ / XY / YZ）
	if (_axis.length === 2) {
		// 2軸回転は「どちらかの軸が裏側なら裏側」とみなす
		const [a1, a2] = _axis;
		const back1 = (a1 === 'Y' || a1 === 'X') && (rad360 > 90 && rad360 < 270);
		const back2 = (a2 === 'Y' || a2 === 'X') && (rad360 > 90 && rad360 < 270);
		isBack = back1 || back2;
	}
	sprite.style.opacity = isBack ? 0.7 : 1;

	addTransform(`mainSprite`, `frzReturn`, _transform, g_transPriority.frzReturn);

	g_workObj.frzReturnTimerId = g_timerHandler.setTimeout(() => executeFrzReturn(_seq, _idx + 1, _axis), 20);
};

/**
 * 曲中リトライの共通処理
 * - 手動リトライ、AutoRetryの両方から呼ばれる
 * - g_retryInProgressによる多重実行防止、失敗時のログ出力・フラグ復帰を一括で行う
 * @param {string} [_logLabel='Retry'] エラーログに表示するラベル(手動/自動の区別用)
 */
const executeRetry = async (_logLabel = `Retry`) => {
	if (g_retryInProgress) {
		return;
	}
	g_retryInProgress = true;
	try {
		g_audio.pause();
		g_timerHandler.clearTimeout(g_timeoutEvtId);
		clearWindow(`Main`);
		await musicAfterLoaded();
		await loadChartFile();
		prepareScoreData();
		mainInit();
	} catch (e) {
		console.warn(`${_logLabel} audio load error: ${e}`);
	} finally {
		g_retryInProgress = false;
	}
};

/**
 * AutoRetryの設定
 * @param {string} _retryCondition リトライ基準となるAutoRetry名
 */
const quickRetry = (_retryCondition) => {
	const retryNum = g_settings.autoRetrys.findIndex(val => val === _retryCondition);
	if (retryNum < 0) {
		return;
	}
	if (g_settings.autoRetryNum >= retryNum && !g_retryInProgress) {
		g_timerHandler.setTimeout(async () => {
			await executeRetry(`AutoRetry`);
		}, 16);
	}
};

/**
 * 個別・全体色変化
 * @param {number[]} _mkColor 
 * @param {string[]} _mkColorCd 
 * @param {string} _header
 * @param {string} _name
 */
const changeColors = (_mkColor, _mkColorCd, _header, _name) => {

	if (_mkColor === undefined) {
		return;
	}
	const camelHeader = _header === `` ? _name : `${_header}${toCapitalize(_name)}`;
	_mkColor.forEach((tempj, j) => {
		const targetj = tempj % 1000;
		g_workObj[`${camelHeader}Colors`][targetj] = _mkColorCd[j];
		if (tempj >= 1000) {
			g_workObj[`${camelHeader}ColorsAll`][targetj] = _mkColorCd[j];
			if (camelHeader.indexOf(`frzHitBar`) !== -1 && isNaN(Number(g_workObj.arrowRtn[targetj]))) {
				$id(`frzHitTop${targetj}`).background = _mkColorCd[j];
			}
		}
	});
};

/**
 * 個別モーション
 * @param {string} _header
 * @param {string} _name
 * @param {number} _frameNum
 */
const changeCssMotions = (_header, _name, _frameNum) => {
	const camelHeader = _header === `` ? _name : `${_header}${toCapitalize(_name)}`;
	g_workObj[`mk${toCapitalize(camelHeader)}CssMotion`]?.[_frameNum]?.forEach((targetj, j) => {
		g_workObj[`${camelHeader}CssMotions`][targetj] =
			g_workObj[`mk${toCapitalize(camelHeader)}CssMotionName`][_frameNum][2 * j + (g_workObj.dividePos[targetj] % 2)]
		g_workObj[`${camelHeader}MovLock`][targetj] = g_workObj[`mk${toCapitalize(camelHeader)}MovLock`][_frameNum][j];
		g_workObj[`${camelHeader}InitManual`][targetj] = g_workObj[`mk${toCapitalize(camelHeader)}InitManual`][_frameNum][j];
	});
};

/**
 * 基準となる階層グループの取得
 * @param {number} _layerGroup 
 * @param {number} _j 
 * @returns {number}
 */
const getBaseLayerGroup = (_layerGroup, _j) =>
	_layerGroup === -1
		? Math.floor(g_workObj.dividePosDefault[_j] / 2)
		: _layerGroup + (g_workObj.dividePosDefault[_j] > g_stateObj.layerNumDf ? g_stateObj.layerNumDf / 2 : 0);

/**
 * スクロール方向、レイヤーの変更（矢印・フリーズアロー）
 * StepAreaがDefault/Halfway以外の場合はレイヤー数が倍化するため、その設定にも追従する
 * @param {number} _frameNum 
 */
const changeScrollArrowDirs = (_frameNum) => {
	if (g_workObj.mkScrollchArrow?.[_frameNum] === undefined) {
		return;
	}
	const tmpObj = new Map();
	g_workObj.mkScrollchArrow?.[_frameNum]?.forEach((targetj, j) => {
		g_workObj.scrollDir[targetj] = g_workObj.scrollDirDefault[targetj] * g_workObj.mkScrollchArrowDir[_frameNum][j];

		// レイヤー変更
		const baseLayer = getBaseLayerGroup(g_workObj.mkScrollchArrowLayerGroup[_frameNum][j], targetj);
		g_workObj.dividePos[targetj] = baseLayer * 2 + (g_workObj.scrollDir[targetj] === 1 ? 0 : 1);

		// 対象の矢印が属するレイヤーに対するTransitionを設定
		// ステップゾーンの移動よりも矢印・フリーズアローの方が早く変わるため、この関数のみ適用
		if (g_workObj.mkScrollchArrowLayerTrans[_frameNum][j] !== ``) {
			tmpObj.set(g_workObj.dividePos[targetj], g_workObj.mkScrollchArrowLayerTrans[_frameNum][j]);
		}
	});
	tmpObj.forEach((val, key, map) => addTransform(`mainSprite${key}`, `scrollch`, val, g_transPriority.layer));
};

/**
 * ステップゾーンの位置反転
 * @param {number} _frameNum 
 */
const changeStepY = (_frameNum) =>
	g_workObj.mkScrollchStep?.[_frameNum]?.forEach((targetj, j) => {
		const dividePos = (g_workObj.scrollDirDefault[targetj] * g_workObj.mkScrollchStepDir[_frameNum][j] === 1 ? 0 : 1);

		// 移動元のステップゾーンの不透明度、表示・非表示を退避
		const _stepOpacity = $id(`stepRoot${targetj}`).opacity;
		const _stepDisplay = $id(`stepRoot${targetj}`).display;

		// 移動元のステップゾーンを消去
		document.getElementById(`stepRoot${targetj}`).remove();
		document.getElementById(`frzHit${targetj}`).remove();

		// レイヤーを変更しステップゾーンを再生成。移動元の不透明度、表示・非表示を反映
		const baseLayer = getBaseLayerGroup(g_workObj.mkScrollchStepLayerGroup[_frameNum][j], targetj);
		g_workObj.dividePos[targetj] = baseLayer * 2 + dividePos;
		makeStepZone(targetj, `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`);
		appearStepZone(targetj, _stepDisplay, _stepOpacity);
	});

/**
 * フリーズアローヒット時の描画変更
 * @param {number} _j 
 * @param {number} _k 
 * @param {string} _name
 * @param {number} [_difFrame=0]
 */
const changeHitFrz = (_j, _k, _name, _difFrame = 0) => {
	const frzNo = `${_j}_${_k}`;
	const frzName = `${_name}${frzNo}`;
	const currentFrz = g_attrObj[frzName];

	if (currentFrz.keyUpFrame !== 0) {
		return;
	}

	const styfrzBar = $id(`${_name}Bar${frzNo}`);
	const styfrzBtmRoot = $id(`${_name}BtmRoot${frzNo}`);
	const styfrzBtm = $id(`${_name}Btm${frzNo}`);
	const styfrzTopRoot = $id(`${_name}TopRoot${frzNo}`);
	const styfrzBtmShadow = $id(`${_name}BtmShadow${frzNo}`);

	// フリーズアロー位置の修正（ステップゾーン上に来るように）
	const delFrzLength = parseFloat($id(`stepRoot${_j}`).top) - currentFrz.y;

	// 早押ししたboostCnt分のフリーズアロー終端位置の修正
	const delFrzMotionLength = sumData(g_workObj.motionOnFrames.slice(0, currentFrz.boostCnt + 1));

	// 判定位置調整分の補正
	const hitPos = g_workObj.hitPosition * g_workObj.scrollDir[_j];

	currentFrz.frzBarLength -= (delFrzLength + delFrzMotionLength) * currentFrz.dir;
	currentFrz.barY -= (delFrzLength + delFrzMotionLength) * currentFrz.dividePos + hitPos;
	currentFrz.btmY -= delFrzLength + delFrzMotionLength + hitPos;
	currentFrz.y += delFrzLength;
	currentFrz.isMoving = false;
	movArrowY.get(currentFrz.movLockFlg)(frzName, currentFrz.y);

	/**
	 * フリーズアロー(ヒット時)の色変更
	 * - 生成時以降で全体色変化がある場合はその値へ置き換える
	 * @param {string} _type 
	 * @returns {string}
	 */
	const getColor = (_type) => {
		const cColorAll = g_workObj[`${_name}${_type}ColorsAll`][_j];
		return currentFrz[_type] !== cColorAll && currentFrz[`${_type}All`] !== cColorAll
			? cColorAll : currentFrz[_type];
	};

	const tmpHitColor = getColor(`Hit`);
	styfrzBar.top = wUnit(currentFrz.barY);
	styfrzBar.height = wUnit(currentFrz.frzBarLength);
	styfrzBar.background = getColor(`HitBar`);
	styfrzBtmRoot.top = wUnit(currentFrz.btmY);
	styfrzBtm.background = tmpHitColor;
	styfrzTopRoot.top = wUnit(- hitPos);
	if (_name === `frz`) {
		const tmpShadowColor = getColor(`HitShadow`);
		styfrzBtmShadow.background = tmpShadowColor === `Default` ? tmpHitColor : tmpShadowColor;
		$id(`frzHit${_j}`).opacity = 0.9;
		$id(`frzTop${frzNo}`).display = C_DIS_NONE;
		if (isNaN(parseFloat(g_workObj.arrowRtn[_j]))) {
			$id(`frzHitTop${_j}`).background = tmpHitColor;
		}
	}

	// FrzReturnの設定
	if (g_stateObj.frzReturn !== C_FLG_OFF) {
		startFrzReturn();
	}
	safeExecuteCustomHooks(`g_customJsObj.judg_${_name}Hit`, g_customJsObj[`judg_${_name}Hit`], _difFrame, _j);
};

/**
 * フリーズアロー失敗時の描画変更
 * @param {number} _j 
 * @param {number} _k 
 */
const changeFailedFrz = (_j, _k) => {
	const frzNo = `${_j}_${_k}`;
	$id(`frzHit${_j}`).opacity = 0;
	$id(`frzTop${frzNo}`).display = C_DIS_INHERIT;
	$id(`frzTop${frzNo}`).background = `#cccccc`;
	$id(`frzTopShadow${frzNo}`).background = `#333333`;
	$id(`frzBtmShadow${frzNo}`).background = `#333333`;
	$id(`frzBar${frzNo}`).background = `#999999`;
	$id(`frzBar${frzNo}`).opacity = 1;
	$id(`frzBtm${frzNo}`).background = `#cccccc`;

	// FrzReturnの設定
	if (g_stateObj.frzReturn !== C_FLG_OFF) {
		startFrzReturn();
	}
};

/**
 * キーを押したかどうかを判定
 * @param {number} _keyCode 
 * @returns {boolean}
 */
const keyIsDown = _keyCode => g_inputKeyBuffer[_keyCode];

/**
 * 押したキーがシフトキーかどうかを判定
 * @returns {boolean}
 */
const keyIsShift = () => keyIsDown(g_kCdNameObj.shiftLKey) || keyIsDown(g_kCdNameObj.shiftRKey);

/**
 * 矢印・フリーズアロー判定
 * @param {number} _j 対象矢印・フリーズアロー
 */
const judgeArrow = _j => {

	const currentNo = g_workObj.judgArrowCnt[_j];
	const arrowName = `arrow${_j}_${currentNo}`;
	const currentArrow = g_attrObj[arrowName];
	const existJudgArrow = document.getElementById(arrowName) !== null;

	const fcurrentNo = g_workObj.judgFrzCnt[_j];
	const frzName = `frz${_j}_${fcurrentNo}`;
	const currentFrz = g_attrObj[frzName];
	const existJudgFrz = document.getElementById(frzName) !== null;

	const judgeTargetArrow = _difFrame => {
		const _difCnt = Math.abs(_difFrame);
		const stepHitTargetArrow = _resultJdg => {
			const stepDivHit = document.getElementById(`stepHit${_j}`);
			stepDivHit.style.top = wUnit(currentArrow.prevY - parseFloat($id(`stepRoot${_j}`).top) - 15 + g_workObj.hitPosition * g_workObj.scrollDir[_j]);
			stepDivHit.style.opacity = 0.75;
			stepDivHit.classList.value = ``;
			stepDivHit.classList.add(g_cssObj[`main_step${_resultJdg}`]);
			stepDivHit.setAttribute(`cnt`, C_FRM_HITMOTION);
		};

		if (g_stateObj.excessive === C_FLG_ON && _difFrame <= g_judgObj.arrowJ[g_judgPosObj.uwan] && _difFrame > g_judgObj.arrowJ[g_judgPosObj.shobon]) {
			// 空押し判定（有効かつ早押し時のみ）
			displayDiff(_difFrame);
			stepHitTargetArrow(`Excessive`);
			safeExecuteCustomHooks(`g_customJsObj.judg_excessive`, g_customJsObj.judg_excessive, _difFrame, _j);
			return true;

		} else if (_difCnt <= g_judgObj.arrowJ[g_judgPosObj.shobon]) {
			// 通常判定
			const [resultFunc, resultJdg] = checkJudgment(_difCnt);
			resultFunc(_difFrame, _j);
			displayDiff(_difFrame);
			stepHitTargetArrow(resultJdg);
			document.getElementById(arrowName).remove();
			g_workObj.judgArrowCnt[_j]++;
			return true;
		}
		return false;
	};

	const judgeTargetFrzArrow = _difFrame => {
		const _difCnt = Math.abs(_difFrame);
		if (_difCnt <= g_judgObj.frzJ[g_judgPosObj.iknai] && !currentFrz.judgEndFlg
			&& g_workObj.judgFrzHitCnt[_j] <= fcurrentNo) {

			if (g_headerObj.frzStartjdgUse) {
				const [resultFunc] = checkJudgment(_difCnt);
				resultFunc(_difFrame, _j);
				displayDiff(_difFrame);
			} else {
				displayDiff(_difFrame, `F`);
			}

			if (_difCnt <= g_judgObj.frzJ[g_judgPosObj.sfsf]) {
				changeHitFrz(_j, fcurrentNo, `frz`, _difFrame);
			} else {
				changeFailedFrz(_j, fcurrentNo);
				if (g_headerObj.frzStartjdgUse) {
					judgeIknai(_difFrame, _j);
					currentFrz.judgEndFlg = true;
				}
			}
			g_workObj.judgFrzHitCnt[_j] = fcurrentNo + 1;
			return true;
		}
		return false;
	};

	let judgeFlg = false;
	const difFrame = (existJudgArrow ? currentArrow.cnt : Infinity);
	const frzDifFrame = (existJudgFrz ? currentFrz.cnt : Infinity);
	if (difFrame < frzDifFrame) {
		judgeFlg = judgeTargetArrow(difFrame);
	} else if (difFrame > frzDifFrame) {
		judgeFlg = judgeTargetFrzArrow(frzDifFrame);
	}
	if (!judgeFlg) {
		$id(`stepDiv${_j}`).display = C_DIS_INHERIT;
	}
};

/**
 * タイミングズレを表示
 * @param {number} _difFrame 
 * @param {string} _fjdg フリーズアロー判定有無 (フリーズアローのときは"F"が入る)
 * @param {number} _justFrames Fast/Slowの表示条件フレーム数
 */
const displayDiff = (_difFrame, _fjdg = ``, _justFrames = g_headerObj.justFrames) => {
	g_workObj.diffList.push(_difFrame);

	const difCnt = Math.abs(_difFrame);
	const diffJ = document.getElementById(`diff${_fjdg}J`);

	let text = ``;
	let activeClass = ``;

	// 1. 各条件の処理
	if (_difFrame > g_judgObj.arrowJ[g_judgPosObj.shobon]) {
		text = `Excessive`;
		activeClass = g_cssObj.common_Excessive;
		g_resultObj.excessive++;
		lifeDamage(true);

	} else if (_difFrame > _justFrames) {
		text = `Fast ${difCnt} Frames`;
		activeClass = g_cssObj.common_diffFast;
		g_resultObj.fast++;
		quickRetry(`Fast/Slow`);

	} else if (_difFrame < _justFrames * -1) {
		text = `Slow ${difCnt} Frames`;
		activeClass = g_cssObj.common_diffSlow;
		g_resultObj.slow++;
		quickRetry(`Fast/Slow`);

	}

	// 2. DOMへの反映
	diffJ.textContent = text;
	diffJ.classList.value = ``;
	if (activeClass) {
		diffJ.classList.add(activeClass);
	}
};

/**
 * ライフゲージバーの色、数値を変更
 * @param {string} [_state=''] 
 */
const changeLifeColor = (_state = ``) => {
	const lblLife = document.getElementById(`lblLife`);
	const lifeBar = document.getElementById(`lifeBar`);

	if (_state !== `` && _state !== g_workObj.currentLifeState) {
		const lifeCss = g_cssObj[`life_${_state}`];
		lblLife.classList.remove(g_cssObj.life_Max, g_cssObj.life_Cleared, g_cssObj.life_Failed);
		lifeBar.classList.remove(g_cssObj.life_Max, g_cssObj.life_Cleared, g_cssObj.life_Failed);
		lblLife.classList.add(lifeCss);
		lifeBar.classList.add(lifeCss);

		g_workObj.currentLifeState = _state;
	}

	const intLifeVal = Math.floor(g_workObj.lifeVal);
	lblLife.textContent = intLifeVal;

	const playableHeight = g_headerObj.playingHeight - 100;
	lifeBar.style.top = wUnit(50 + playableHeight * (g_headerObj.maxLifeVal - intLifeVal) / g_headerObj.maxLifeVal);
	lifeBar.style.height = wUnit(playableHeight * intLifeVal / g_headerObj.maxLifeVal);
};

/**
 * ゲージ回復処理
 */
const lifeRecovery = () => {
	g_workObj.lifeVal += g_workObj.lifeRcv;

	if (g_workObj.lifeVal >= g_headerObj.maxLifeVal) {
		g_workObj.lifeVal = g_headerObj.maxLifeVal;
		changeLifeColor(`Max`);
	} else {
		changeLifeColor(g_workObj.lifeVal >= g_workObj.lifeBorder ? `Cleared` : ``);
	}
	g_resultObj.gaugeTransition.push([g_scoreObj.baseFrame, g_workObj.lifeVal]);
};

/**
 * ゲージダメージ処理
 * @param {boolean} [_excessive=false] 空押し判定有無
 */
const lifeDamage = (_excessive = false) => {
	g_workObj.lifeVal -= g_workObj.lifeDmg * (_excessive ? 0.25 : 1);
	quickRetry(`Miss`);

	if (g_workObj.lifeVal <= 0) {
		g_workObj.lifeVal = 0;
		changeLifeColor();
	} else {
		changeLifeColor(g_workObj.lifeVal < g_workObj.lifeBorder ? `Failed` : `Cleared`);
	}
	g_resultObj.gaugeTransition.push([g_scoreObj.baseFrame, g_workObj.lifeVal]);
};

/**
 * 判定キャラクタの表示、判定済矢印数・判定数のカウンタ
 * @param {string} _name 
 * @param {string} _character 
 * @param {string} [_fjdg=''] 
 */
const changeJudgeCharacter = (_name, _character, _fjdg = ``) => {
	g_resultObj[_name]++;
	g_currentArrows++;
	const jdgJ = document.getElementById(`chara${_fjdg}J`);
	jdgJ.classList.value = ``;
	jdgJ.classList.add(g_cssObj[`common_${_name}`]);
	jdgJ.textContent = _character;
	jdgJ.setAttribute(`cnt`, C_FRM_JDGMOTION);
	document.getElementById(`lbl${toCapitalize(_name)}`).textContent = g_resultObj[_name];
};

/**
 * コンボの更新
 */
const updateCombo = () => {
	if (++g_resultObj.combo > g_resultObj.maxCombo) {
		g_resultObj.maxCombo = g_resultObj.combo;
		lblMCombo.textContent = g_resultObj.maxCombo;
	}
	comboJ.textContent = `${g_resultObj.combo} Combo!!`;
};

/**
 * 回復判定の共通処理
 * @param {string} _name 
 * @param {number} _difFrame 
 * @param {number} _j
 */
const judgeRecovery = (_name, _difFrame, _j) => {
	changeJudgeCharacter(_name, g_lblNameObj[`j_${_name}`]);
	updateCombo();
	lifeRecovery();
	finishViewing();

	if (g_stateObj.frzReturn !== C_FLG_OFF) {
		g_workObj.arrowReturnVal = (g_resultObj.ii + g_resultObj.shakin) % 100;
		const playableHeight = g_headerObj.playingHeight - 100;
		$id(`lifeBarFrz`).top = wUnit(50 + playableHeight * (100 - g_workObj.arrowReturnVal) / 100);
		$id(`lifeBarFrz`).height = wUnit(playableHeight * g_workObj.arrowReturnVal / 100);
		if (g_workObj.arrowReturnVal === 0) {
			startFrzReturn();
		}
	}
	if (_name === `shakin`) {
		quickRetry(`Shakin(Great)`);
	}
	safeExecuteCustomHooks(`g_customJsObj.judg_${_name}`, g_customJsObj[`judg_${_name}`], _difFrame, _j);
};

/**
 * ダメージ系共通処理
 * @param {string} _name 
 * @param {number} _difFrame 
 * @param {number} _j
 */
const judgeDamage = (_name, _difFrame, _j) => {
	changeJudgeCharacter(_name, g_lblNameObj[`j_${_name}`]);
	g_resultObj.combo = 0;
	comboJ.textContent = ``;
	diffJ.textContent = ``;
	lifeDamage();
	safeExecuteCustomHooks(`g_customJsObj.judg_${_name}`, g_customJsObj[`judg_${_name}`], _difFrame, _j);
};

/**
 * 判定処理：イイ
 * @param {number} _difFrame 
 * @param {number} _j
 */
const judgeIi = (_difFrame, _j) => judgeRecovery(`ii`, _difFrame, _j);

/**
 * 判定処理：シャキン
 * @param {number} _difFrame 
 * @param {number} _j
 */
const judgeShakin = (_difFrame, _j) => judgeRecovery(`shakin`, _difFrame, _j);

/**
 * 判定処理：マターリ
 * @param {number} _difFrame 
 * @param {number} _j
 */
const judgeMatari = (_difFrame, _j) => {
	changeJudgeCharacter(`matari`, g_lblNameObj.j_matari);
	comboJ.textContent = ``;
	finishViewing();
	quickRetry(`Matari(Good)`);

	safeExecuteCustomHooks(`g_customJsObj.judg_matari`, g_customJsObj.judg_matari, _difFrame, _j);
};

/**
 * 判定処理：ショボーン
 * @param {number} _difFrame 
 * @param {number} _j
 */
const judgeShobon = (_difFrame, _j) => judgeDamage(`shobon`, _difFrame, _j);

/**
 * 判定処理：ウワァン
 * @param {number} _difFrame 
 * @param {number} _j
 */
const judgeUwan = (_difFrame, _j) => judgeDamage(`uwan`, _difFrame, _j);

/**
 * 判定処理：キター
 * @param {number} _difFrame 
 * @param {number} _j
 */
const judgeKita = (_difFrame, _j) => {
	changeJudgeCharacter(`kita`, g_lblNameObj.j_kita, `F`);

	if (++g_resultObj.fCombo > g_resultObj.fmaxCombo) {
		g_resultObj.fmaxCombo = g_resultObj.fCombo;
		lblFCombo.textContent = g_resultObj.fmaxCombo;
	}
	comboFJ.textContent = `${g_resultObj.fCombo} Combo!!`;

	lifeRecovery();
	finishViewing();

	safeExecuteCustomHooks(`g_customJsObj.judg_kita`, g_customJsObj.judg_kita, _difFrame, _j);
};

/**
 * 判定処理：イクナイ
 * @param {number} _difFrame 
 * @param {number} _j
 */
const judgeIknai = (_difFrame, _j) => {
	changeJudgeCharacter(`iknai`, g_lblNameObj.j_iknai, `F`);
	comboFJ.textContent = ``;
	g_resultObj.fCombo = 0;

	lifeDamage();

	safeExecuteCustomHooks(`g_customJsObj.judg_iknai`, g_customJsObj.judg_iknai, _difFrame, _j);
};

const jdgList = [`ii`, `shakin`, `matari`, `shobon`].map(jdg => toCapitalize(jdg));
const jdgFuncList = [judgeIi, judgeShakin, judgeMatari, judgeShobon];
const checkJudgment = (_difCnt) => {
	const idx = g_judgObj.arrowJ.findIndex(jdgCnt => _difCnt <= jdgCnt);
	return [jdgFuncList[idx], jdgList[idx]];
};

/**
 * クリア表示
 * @param {string} _state 
 * @returns {string}
 */
const resultViewText = _state => _state === `` ? `` :
	`<span class="result_${toCapitalize(_state)}">${g_lblNameObj[_state]}</span>`;

/**
 * フルコンボ・パーフェクト演出の作成
 * @param {string} _text 
 */
const makeFinishView = _text => {
	finishView.innerHTML = _text;
	finishView.style.opacity = 1;
	[`charaJ`, `comboJ`, `diffJ`, `charaFJ`, `comboFJ`, `diffFJ`].forEach(label =>
		document.getElementById(label).textContent = ``);
};

const finishViewing = () => {
	if (g_currentArrows === g_fullArrows) {
		if (g_resultObj.ii + g_resultObj.kita === g_fullArrows) {
			g_resultObj.spState = `allPerfect`;
		} else if (g_resultObj.ii + g_resultObj.shakin + g_resultObj.kita === g_fullArrows) {
			g_resultObj.spState = `perfect`;
		} else if (g_resultObj.uwan === 0 && g_resultObj.shobon === 0 && g_resultObj.iknai === 0) {
			g_resultObj.spState = `fullCombo`;
		}
		if (g_headerObj.finishView !== C_DIS_NONE && [`allPerfect`, `perfect`, `fullCombo`].includes(g_resultObj.spState)) {
			makeFinishView(resultViewText(g_resultObj.spState));
		}
	}
};
