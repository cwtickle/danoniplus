/**
 * Dancing☆Onigiri (CW Edition)
 * 結果画面
 * - ページ: result
 *
 * Source by tickle
 * Created : 
 * Revised : 
 *
 * https://github.com/cwtickle/danoniplus
 */

/*-----------------------------------------------------------*/
/* Scene : RESULT [grape] */
/*-----------------------------------------------------------*/

/**
 * リザルト画面初期化
 */
const resultInit = () => {

	clearWindow();
	g_currentPage = `result`;

	// 結果画面用フレーム初期化
	g_scoreObj.resultFrameNum = 0;

	// リザルトアニメーション用フレーム初期化、ループカウンター設定
	g_animationData.forEach(sprite => {
		g_scoreObj[`${sprite}ResultFrameNum`] = 0;
		g_scoreObj[`${sprite}ResultLoopCount`] = 0;
	});

	const divRoot = document.getElementById(`divRoot`);

	// 曲時間制御変数
	let thisTime;
	let buffTime;
	let resultStartTime = g_workObj.mainEndTime > 0 ? g_workObj.mainEndTime : performance.now();

	if (g_stateObj.d_background === C_FLG_OFF && g_headerObj.resultMotionSet) {
	} else {
		// ゲームオーバー時は失敗時のリザルトモーションを適用
		if (!g_finishFlg) {
			const scoreIdHeader = setScoreIdHeader(g_stateObj.scoreId, g_stateObj.scoreLockFlg, false);

			g_animationData.forEach(sprite => {
				const failedData = g_rootObj[`${sprite}failedS${scoreIdHeader}_data`] ?? g_rootObj[`${sprite}failedS_data`];
				if (failedData !== undefined) {
					[g_headerObj[`${sprite}ResultData`], g_headerObj[`${sprite}ResultMaxDepth`]] = g_animationFunc.make[sprite](failedData);
				}
			});
		} else if (g_gameOverFlg) {
			g_animationData.forEach(sprite => {
				g_headerObj[`${sprite}ResultData`] = g_headerObj[`${sprite}FailedData`].concat();
				g_headerObj[`${sprite}ResultMaxDepth`] = g_headerObj[`${sprite}FailedMaxDepth`];
			});
		}
	}

	// diffListから適正Adjを算出（20個以下の場合は算出しない）
	const getSign = _val => (_val > 0 ? `+` : ``);
	const getDiffFrame = _val => `${getSign(_val)}${_val}${g_lblNameObj.frame}`;
	const diffLength = g_workObj.diffList.length;
	const bayesFunc = (_offset, _length) => {
		let result = 0;
		for (let j = _offset; j < _length; j++) {
			result += (_length - j) * (j + 1) * g_workObj.diffList[j];
		}
		return result;
	};
	const bayesExVal = 6 * bayesFunc(0, diffLength) / (diffLength * (diffLength + 1) * (diffLength + 2));
	const estimatedAdj = (diffLength <= 20 ? `` : Math.round((g_stateObj.adjustment / g_headerObj.playbackRate - bayesExVal) * 10) / 10);

	// 背景スプライトを作成
	createMultipleSprite(`backResultSprite`, g_headerObj.backResultMaxDepth);

	// タイトル文字描画
	divRoot.appendChild(getTitleDivLabel(`lblTitle`, g_lblNameObj.result, 0, 15, `settings_Title`));

	const playDataWindow = createEmptySprite(divRoot, `playDataWindow`, g_windowObj.playDataWindow, g_cssObj.result_PlayDataWindow);
	const resultWindow = createEmptySprite(divRoot, `resultWindow`, g_windowObj.resultWindow);

	const playingArrows = g_resultObj.ii + g_resultObj.shakin +
		g_resultObj.matari + g_resultObj.shobon + g_resultObj.uwan +
		g_resultObj.kita + g_resultObj.iknai;

	// スコア計算(一括)
	const scoreTmp = Object.keys(g_pointAllocation).reduce(
		(score, name) => score + g_resultObj[name] * g_pointAllocation[name], 0);

	const allScore = g_fullArrows * 10;
	const resultScore = Math.round(scoreTmp / allScore * g_maxScore) || 0;
	g_resultObj.score = resultScore;
	const allArrowsPlayed = playingArrows === g_fullArrows;

	// ランク計算
	let rankMark = g_rankObj.rankMarkX;
	let rankColor = g_rankObj.rankColorX;
	if (g_gameOverFlg) {
		rankMark = g_rankObj.rankMarkF;
		rankColor = g_rankObj.rankColorF;
		g_resultObj.spState = `failed`;
	} else if (allArrowsPlayed && g_stateObj.autoAll === C_FLG_OFF && !(g_headerObj.excessiveJdgUse && g_stateObj.excessive === C_FLG_OFF)) {
		if (g_resultObj.spState === ``) {
			g_resultObj.spState = `cleared`;
		}
		if (g_resultObj.spState === `perfect` || g_resultObj.spState === `allPerfect`) {
			rankMark = g_rankObj[`rankMark${toCapitalize(g_resultObj.spState)}`];
			rankColor = g_rankObj[`rankColor${toCapitalize(g_resultObj.spState)}`];
		} else {
			const rPos = g_rankObj.rankRate.findIndex(rate => resultScore * 100 / g_maxScore >= rate);
			rankMark = g_rankObj.rankMarks[rPos];
			rankColor = g_rankObj.rankColor[rPos];
		}
	}

	// 曲名・オプション描画
	const playbackView = (g_headerObj.playbackRate === 1 ? `` : ` [Rate:${g_headerObj.playbackRate}]`);
	const musicTitle = (g_headerObj.musicTitles[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.musicTitle) + playbackView;

	const mTitleForView = [g_headerObj.musicTitleForView[0], (g_headerObj.musicTitleForView[1] || ``) + playbackView];
	if (g_headerObj.musicTitlesForView[g_headerObj.musicNos[g_stateObj.scoreId]] !== undefined) {
		mTitleForView.forEach((mTitle, j) =>
			mTitleForView[j] = g_headerObj.musicTitlesForView[g_headerObj.musicNos[g_stateObj.scoreId]][j] + (j === 1 ? playbackView : ``));
	}

	const transKeyName = getTransKeyName();
	const orgShuffleFlg = getOrgShuffleFlg();
	const shuffleName = getShuffleName();
	const settingData = getSelectedSettingList(orgShuffleFlg);

	const [lblRX, dataRX] = [20, 60];
	multiAppend(playDataWindow,
		makeCssResultPlayData(`lblMusic`, lblRX, g_cssObj.result_lbl, 0, g_lblNameObj.rt_Music, C_ALIGN_LEFT),
		makeCssResultPlayData(`lblMusicData`, dataRX, g_cssObj.result_style, 0, mTitleForView[0]),
		makeCssResultPlayData(`lblMusicData2`, dataRX, g_cssObj.result_style, 1, mTitleForView[1]),
		makeCssResultPlayData(`lblDifficulty`, lblRX, g_cssObj.result_lbl, 2, g_lblNameObj.rt_Difficulty, C_ALIGN_LEFT),
		makeCssResultPlayData(`lblDifData`, dataRX, g_cssObj.result_style, 2, settingData.difData, C_ALIGN_CENTER,
			{ siz: getFontSize2(settingData.difData, 350) }),
		makeCssResultPlayData(`lblStyle`, lblRX, g_cssObj.result_lbl, 3, g_lblNameObj.rt_Style, C_ALIGN_LEFT),
		makeCssResultPlayData(`lblStyleData`, dataRX, g_cssObj.result_style, 3, settingData.playStyleData),
		makeCssResultPlayData(`lblDisplay`, lblRX, g_cssObj.result_lbl, 4, g_lblNameObj.rt_Display, C_ALIGN_LEFT),
		makeCssResultPlayData(`lblDisplayData`, dataRX, g_cssObj.result_style, 4, settingData.displayData),
		makeCssResultPlayData(`lblDisplay2Data`, dataRX, g_cssObj.result_style, 5, settingData.display2Data),
	);

	// 設定項目が多い場合に2行に分解して表示する処理
	const [styleStr, styleSiz] = getFontSizeMulti(settingData.playStyleData, 350, { maxSizMulti: 10, len: 60 });
	lblStyleData.innerHTML = styleStr;
	lblStyleData.style.fontSize = wUnit(styleSiz);

	/**
	 * キャラクタ、スコア描画のID共通部、色CSS名、スコア変数名
	 * @property {number} pos 表示位置(縦)
	 * @property {string} id 表示用ラベルフッター
	 * @property {string} color CSS用ラベルフッター
	 * @property {string} label 表示名
	 * @property {string} dfColor 表示する文字のカラーコード (リザルト画像で使用)
	 */
	const jdgScoreObj = {
		ii: { pos: 0, id: `Ii`, color: `ii`, label: g_lblNameObj.j_ii, dfColor: `#66ffff`, },
		shakin: { pos: 1, id: `Shakin`, color: `shakin`, label: g_lblNameObj.j_shakin, dfColor: `#99ff99`, },
		matari: { pos: 2, id: `Matari`, color: `matari`, label: g_lblNameObj.j_matari, dfColor: `#ff9966`, },
		shobon: { pos: 3, id: `Shobon`, color: `shobon`, label: g_lblNameObj.j_shobon, dfColor: `#ccccff`, },
		uwan: { pos: 4, id: `Uwan`, color: `uwan`, label: g_lblNameObj.j_uwan, dfColor: `#ff9999`, },
		kita: { pos: 5, id: `Kita`, color: `kita`, label: g_lblNameObj.j_kita, dfColor: `#ffff99`, },
		iknai: { pos: 6, id: `Iknai`, color: `iknai`, label: g_lblNameObj.j_iknai, dfColor: `#99ff66`, },
		maxCombo: { pos: 7, id: `MCombo`, color: `combo`, label: g_lblNameObj.j_maxCombo, dfColor: `#ffffff`, },
		fmaxCombo: { pos: 8, id: `FCombo`, color: `combo`, label: g_lblNameObj.j_fmaxCombo, dfColor: `#ffffff`, },
		score: { pos: 10, id: `Score`, color: `score`, label: g_lblNameObj.j_score, dfColor: `#ffffff`, },
	};

	// キャラクタ、スコア描画
	Object.keys(jdgScoreObj).forEach(score =>
		multiAppend(resultWindow,
			makeCssResultSymbol(`lbl${jdgScoreObj[score].id}`, 0, g_cssObj[`common_${jdgScoreObj[score].color}`], jdgScoreObj[score].pos, jdgScoreObj[score].label),
			makeCssResultSymbol(`lbl${jdgScoreObj[score].id}S`, 50, g_cssObj.common_score, jdgScoreObj[score].pos, g_resultObj[score], C_ALIGN_RIGHT),
		));
	if (g_stateObj.autoAll === C_FLG_OFF) {
		const [lblPosX, dataPosX] = [350, 260];
		multiAppend(resultWindow,
			makeCssResultSymbol(`lblFast`, lblPosX, g_cssObj.common_diffFast, 0, g_lblNameObj.j_fast),
			makeCssResultSymbol(`lblSlow`, lblPosX, g_cssObj.common_diffSlow, 2, g_lblNameObj.j_slow),
			makeCssResultSymbol(`lblFastS`, dataPosX, g_cssObj.score, 1, g_resultObj.fast, C_ALIGN_RIGHT),
			makeCssResultSymbol(`lblSlowS`, dataPosX, g_cssObj.score, 3, g_resultObj.slow, C_ALIGN_RIGHT),
		);
		if (estimatedAdj !== ``) {
			multiAppend(resultWindow,
				makeCssResultSymbol(`lblAdj`, lblPosX, g_cssObj.common_estAdj, 4, g_lblNameObj.j_adj),
				makeCssResultSymbol(`lblAdjS`, dataPosX, g_cssObj.score, 5, `${getDiffFrame(estimatedAdj)}`, C_ALIGN_RIGHT),
			);
		}
		if (g_stateObj.excessive === C_FLG_ON) {
			multiAppend(resultWindow,
				makeCssResultSymbol(`lblExcessive`, lblPosX, g_cssObj.common_excessive, 6, g_lblNameObj.j_excessive),
				makeCssResultSymbol(`lblExcessiveS`, dataPosX, g_cssObj.score, 7, g_resultObj.excessive, C_ALIGN_RIGHT),
			);
		}
	}

	// ランク描画
	resultWindow.appendChild(
		createDivCss2Label(`lblRank`, rankMark, {
			...g_lblPosObj.lblRank, color: rankColor, fontFamily: getBasicFont(`"Bookman Old Style"`),
		})
	);

	// Cleared & Failed表示
	const lblResultPre = createDivCss2Label(
		`lblResultPre`,
		resultViewText(g_gameOverFlg ? `failed` : `cleared`),
		{
			...g_lblPosObj.lblResultPre,
			animationDuration: (g_gameOverFlg ? `3s` : `2.5s`),
			animationName: (g_gameOverFlg ? `upToDownFade` : `leftToRightFade`)
		}, g_cssObj.result_Cleared, g_cssObj.result_Window
	);
	divRoot.appendChild(lblResultPre);

	divRoot.appendChild(createDivCss2Label(`lblResultPre2`,
		resultViewText(g_gameOverFlg ? `failed` : (allArrowsPlayed ? g_resultObj.spState : ``)),
		g_lblPosObj.lblResultPre2, g_cssObj.result_Cleared));

	// プレイデータは Cleared & Failed に合わせて表示
	playDataWindow.style.animationDuration = `3s`;
	playDataWindow.style.animationName = `slowlyAppearing`;

	if (g_finishFlg && g_headerObj.resultDelayFrame > 0) {
		lblResultPre.style.animationDelay = `${g_headerObj.resultDelayFrame / g_fps}s`;
		playDataWindow.style.animationDelay = `${g_headerObj.resultDelayFrame / g_fps}s`;
	}

	// ハイスコア差分計算
	const assistFlg = (g_autoPlaysBase.includes(g_stateObj.autoPlay) ? `` : `-${g_stateObj.autoPlay}less`);
	const mirrorName = (g_stateObj.shuffle.indexOf(`Mirror`) !== -1 ? `-${g_stateObj.shuffle}` : ``);
	let scoreName = getStorageKeyName(g_headerObj.keyLabels[g_stateObj.scoreId], transKeyName, assistFlg, mirrorName, g_stateObj.scoreId);

	const highscoreDfObj = {
		ii: 0, shakin: 0, matari: 0, shobon: 0, uwan: 0,
		kita: 0, iknai: 0,
		maxCombo: 0, fmaxCombo: 0, score: 0,
	};

	const highscorePreCondition = (g_stateObj.autoAll === C_FLG_OFF && g_headerObj.playbackRate === 1 &&
		(g_stateObj.shuffle === C_FLG_OFF || (g_stateObj.shuffle.endsWith(`Mirror`) && orgShuffleFlg)));
	if (highscorePreCondition) {

		// ハイスコア差分描画
		Object.keys(jdgScoreObj).filter(score => score !== `score`).forEach(score =>
			multiAppend(resultWindow,
				makeCssResultSymbol(`lbl${jdgScoreObj[score].id}L1`, C_RLT_BRACKET_L, g_cssObj.result_scoreHiBlanket, jdgScoreObj[score].pos, `(+`),
				makeCssResultSymbol(`lbl${jdgScoreObj[score].id}LS`, C_RLT_HIDIF_X, g_cssObj.result_scoreHi, jdgScoreObj[score].pos, 0, C_ALIGN_RIGHT),
				makeCssResultSymbol(`lbl${jdgScoreObj[score].id}L2`, C_RLT_BRACKET_R, g_cssObj.result_scoreHiBlanket, jdgScoreObj[score].pos, `)`),
			));

	} else {
		resultWindow.appendChild(makeCssResultSymbol(`lblAutoView`, 215, g_cssObj.result_noRecord, 4, `(No Record)`));
		const lblAutoView = document.getElementById(`lblAutoView`);
		lblAutoView.style.fontSize = wUnit(20);
	}

	// ゲージ推移グラフの描画
	const gaugeTransitionWindow = createEmptySprite(divRoot, `gaugeTransitionWindow`, g_windowObj.gaugeTransition, g_cssObj.result_PlayDataWindow);
	for (let j = 0; j < 2; j++) {
		const canvas = document.createElement(`canvas`);
		canvas.id = `graphGaugeTransition${j > 0 ? j + 1 : ``}`;
		canvas.width = g_limitObj.gaugeTransitionWidth * g_dpr;
		canvas.height = g_limitObj.gaugeTransitionHeight * g_dpr;
		canvas.style.width = wUnit(g_limitObj.gaugeTransitionWidth);
		canvas.style.height = wUnit(g_limitObj.gaugeTransitionHeight);
		canvas.getContext(`2d`).scale(g_dpr, g_dpr);
		canvas.style.left = wUnit(0);
		canvas.style.top = wUnit(0);
		canvas.style.position = `absolute`;
		if (j > 0) {
			canvas.style.pointerEvents = C_DIS_NONE;
		}
		gaugeTransitionWindow.appendChild(canvas);
	}

	multiAppend(divRoot,
		createCss2Button(`btnGaugeTransition`, `i`, () => true, {
			x: g_sWidth / 2 - 250, y: 185, w: 30, h: 30, siz: g_limitObj.jdgCharaSiz,
			resetFunc: () => changeGaugeTransition(), cxtFunc: () => changeGaugeTransition(),
		}, g_cssObj.button_Mini),
	);
	multiAppend(gaugeTransitionWindow,
		createCss2Button(`btnGaugeTrL`, `<`, () => true, {
			x: -45, y: 35, w: 20, h: 30, siz: g_limitObj.jdgCharaSiz,
			resetFunc: () => moveCursor(keyIsShift() ? -10 : -1),
		}, g_cssObj.button_Setting),
		createCss2Button(`btnGaugeTrR`, `>`, () => true, {
			x: -25, y: 35, w: 20, h: 30, siz: g_limitObj.jdgCharaSiz,
			resetFunc: () => moveCursor(keyIsShift() ? 10 : 1),
		}, g_cssObj.button_Setting),
	);
	g_stateObj.gaugeTransitionViewFlg = false;

	const changeGaugeTransition = () => {
		if (g_stateObj.gaugeTransitionViewFlg) {
			resultWindow.style.opacity = `1`;
			gaugeTransitionWindow.style.visibility = `hidden`;
			g_stateObj.gaugeTransitionViewFlg = false;
		} else {
			resultWindow.style.opacity = `0.3`;
			gaugeTransitionWindow.style.visibility = `visible`;
			g_stateObj.gaugeTransitionViewFlg = true;
		}
	};

	const startFrame = g_detailObj.startFrame[g_stateObj.scoreId];
	let playingFrame = g_detailObj.playingFrameWithBlank[g_stateObj.scoreId];
	if (playingFrame <= 0) {
		playingFrame = 1;
	}
	const transitionObj = { frame: [0], life: [g_workObj.lifeInit] };

	const frame = transitionObj.frame;
	const life = transitionObj.life;
	const transitionData = g_resultObj.gaugeTransition;

	for (let i = 0; i < transitionData?.length; i++) {
		if (i === 0 || transitionData[i - 1][1] !== transitionData[i][1]) {
			frame.push(transitionData[i][0] - startFrame);
			life.push(transitionData[i][1]);
		}
	}

	frame.push(playingFrame);
	life.push(life.at(-1));

	// グラフ本体の描画
	const context = document.getElementById(`graphGaugeTransition`).getContext(`2d`);
	context.lineWidth = 2;

	let preX, preY;
	const borderY = (g_limitObj.gaugeTransitionHeight - 2) - g_workObj.lifeBorder * (g_limitObj.gaugeTransitionHeight - 2) / g_headerObj.maxLifeVal + 1;

	for (let i = 0; i < frame.length; i++) {
		const x = frame[i] * g_limitObj.gaugeTransitionWidth / playingFrame;
		const y = (g_limitObj.gaugeTransitionHeight - 2) - life[i] * (g_limitObj.gaugeTransitionHeight - 2) / g_headerObj.maxLifeVal + 1;

		if (i === 0) {
			context.beginPath();
			context.moveTo(x, y);
		} else {
			context.moveTo(preX, preY);
			context.lineTo(x, preY);

			if (life[i - 1] === 0 && life[i] === 0) {
				context.strokeStyle = g_graphColorObj.failed;

			} else if (life[i - 1] >= g_workObj.lifeBorder && life[i] >= g_workObj.lifeBorder) {
				context.lineTo(x, y);
				context.strokeStyle = g_graphColorObj.clear;

			} else if (life[i - 1] < g_workObj.lifeBorder && life[i] >= g_workObj.lifeBorder) {
				context.lineTo(x, borderY);
				context.strokeStyle = g_graphColorObj.failed;
				context.stroke();
				context.beginPath();
				context.moveTo(x, borderY);
				context.lineTo(x, y);
				context.strokeStyle = g_graphColorObj.clear;

			} else if (life[i - 1] >= g_workObj.lifeBorder && life[i] < g_workObj.lifeBorder) {
				context.lineTo(x, borderY);
				context.strokeStyle = g_graphColorObj.clear;
				context.stroke();
				context.beginPath();
				context.moveTo(x, borderY);
				context.lineTo(x, y);
				context.strokeStyle = g_graphColorObj.failed;

			} else {
				context.lineTo(x, y);
				context.strokeStyle = g_graphColorObj.failed;
			}

			context.stroke();
			context.beginPath();
		}
		preX = x;
		preY = y;
	}

	let cursorFrame = 0;   // 現在のカーソル位置（frame）
	const moveCursor = (sec = 1) => {
		cursorFrame = Math.max(0, Math.min(playingFrame, cursorFrame + sec * g_fps));
		drawOverlay();
	};

	// 既存のグラフの上から縦線と時間を重ねる
	const drawOverlay = () => {

		const canvas = document.getElementById(`graphGaugeTransition2`);
		const ctx = canvas.getContext(`2d`);
		const [w, h] = [parseInt(canvas.style.width), parseInt(canvas.style.height)];
		const x = cursorFrame / playingFrame * w;
		ctx.clearRect(0, 0, w, h);

		// 縦線
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, h);
		ctx.strokeStyle = "#009999";
		ctx.lineWidth = 1.5;
		ctx.stroke();

		// 時間表示
		const timer = transFrameToTimer(cursorFrame + startFrame);
		ctx.font = `14px ${getBasicFont()}`;
		ctx.fillStyle = "#009999";
		ctx.textAlign = x > w * 0.8 ? C_ALIGN_RIGHT : C_ALIGN_LEFT;
		ctx.fillText(
			`${timer}`,
			x > w * 0.8 ? x - 5 : x + 5,
			g_limitObj.gaugeTransitionHeight - 35
		);
	};
	drawOverlay();

	// ユーザカスタムイベント(初期)
	const currentDateTime = new Date().toLocaleString();
	safeExecuteCustomHooks(`g_customJsObj.result`, g_customJsObj.result);

	if (highscorePreCondition) {

		// 古いキー定義の情報を検索
		const relatedKeys = Object.entries(g_keyObj.keyTransPattern)
			.filter(([key, value]) => value === g_headerObj.keyLabels[g_stateObj.scoreId])
			.map(([key]) => key);

		// 古いキー定義のスコアデータを現行キー定義に移行
		for (const legacyKey of relatedKeys) {
			let tmpScoreName = getStorageKeyName(
				legacyKey, transKeyName, assistFlg, mirrorName, g_stateObj.scoreId
			);
			const src = g_localStorage.highscores?.[tmpScoreName];
			if (!hasVal(src)) {
				continue;
			}

			// 現行キー定義にスコアデータが存在しない場合、移行元のスコアデータをコピー
			if (!hasVal(g_localStorage.highscores?.[scoreName])) {
				g_localStorage.highscores[scoreName] = structuredClone(src);
			}

			// 古いキー定義は見つかった最初の1件のみ移行し、以降は削除
			delete g_localStorage.highscores[tmpScoreName];
		}

		Object.keys(jdgScoreObj).filter(judge => judge !== ``)
			.forEach(judge => highscoreDfObj[judge] = g_resultObj[judge] -
				(scoreName in g_localStorage.highscores ? g_localStorage.highscores[scoreName][judge] : 0));

		if (g_stateObj.dataSaveFlg) {

			const setScoreData = () => {
				g_localStorage.highscores[scoreName].dateTime = currentDateTime;
				g_localStorage.highscores[scoreName].rankMark = rankMark;
				g_localStorage.highscores[scoreName].rankColor = rankColor;
				g_localStorage.highscores[scoreName].playStyle = settingData.playStyleData;

				g_localStorage.highscores[scoreName].fast = g_resultObj.fast;
				g_localStorage.highscores[scoreName].slow = g_resultObj.slow;
				g_localStorage.highscores[scoreName].adj = estimatedAdj;
				g_localStorage.highscores[scoreName].excessive = g_stateObj.excessive === C_FLG_ON ?
					g_resultObj.excessive : C_FLG_HYPHEN;

				if (g_presetObj.resultVals !== undefined) {
					Object.keys(g_presetObj.resultVals).forEach(key =>
						g_localStorage.highscores[scoreName][g_presetObj.resultVals[key]] = g_resultObj[g_presetObj.resultVals[key]]);
				}
			};

			// All Perfect時(かつスコアが同一時)はFast+Slowが最小のときに更新処理を行う
			if (rankMark === g_rankObj.rankMarkAllPerfect &&
				g_localStorage.highscores[scoreName]?.score === g_resultObj.score) {
				if (g_localStorage.highscores[scoreName].fast === undefined ||
					g_localStorage.highscores[scoreName].fast + g_localStorage.highscores[scoreName].slow >
					g_resultObj.fast + g_resultObj.slow) {
					setScoreData();
					g_localStorage.highscores[scoreName].score = g_resultObj.score;
				}
			}

			// ハイスコア更新時処理
			if (highscoreDfObj.score > 0) {
				if (g_localStorage.highscores[scoreName] === undefined) {
					g_localStorage.highscores[scoreName] = {};
				}
				Object.keys(jdgScoreObj).filter(judge => judge !== ``)
					.forEach(judge => g_localStorage.highscores[scoreName][judge] = g_resultObj[judge]);
				setScoreData();
			}

			// クリアランプ点灯処理
			if (![``, `failed`, `cleared`].includes(g_resultObj.spState)) {
				g_localStorage.highscores[scoreName][g_resultObj.spState] = true;
			}
			const isGameCompleted = !g_gameOverFlg && g_finishFlg;
			const hasValidAccuracy = g_workObj.requiredAccuracy !== `----`;
			if (isGameCompleted && hasValidAccuracy && allArrowsPlayed) {
				if (g_localStorage.highscores[scoreName].clearLamps === undefined) {
					g_localStorage.highscores[scoreName].clearLamps = [];
				}
				g_localStorage.highscores[scoreName].clearLamps =
					makeDedupliArray(g_localStorage.highscores[scoreName].clearLamps, [g_stateObj.gauge]);
			}
			localStorage.setItem(g_localStorageUrl, JSON.stringify(g_localStorage));
		}

		// ハイスコア差分値適用、ハイスコア部分作成
		Object.keys(jdgScoreObj).forEach(score => {
			const jdgScore = jdgScoreObj[score];
			if (score === `score`) {
				multiAppend(resultWindow,
					makeCssResultSymbol(`lbl${jdgScore.id}L1`, C_RLT_BRACKET_L, `${highscoreDfObj.score > 0 ? g_cssObj.result_scoreHiPlus : g_cssObj.result_scoreHiBlanket}`,
						jdgScore.pos, `(${highscoreDfObj[score] >= 0 ? "+" : "－"}`),
					makeCssResultSymbol(`lbl${jdgScore.id}LS`, C_RLT_HIDIF_X, `${highscoreDfObj.score > 0 ? g_cssObj.result_scoreHiPlus : g_cssObj.result_scoreHi}`,
						jdgScore.pos, Math.abs(highscoreDfObj[score]), C_ALIGN_RIGHT),
					makeCssResultSymbol(`lbl${jdgScore.id}L2`, C_RLT_BRACKET_R, `${highscoreDfObj.score > 0 ? g_cssObj.result_scoreHiPlus : g_cssObj.result_scoreHiBlanket}`,
						jdgScore.pos, `)`),
				);
			} else {
				document.getElementById(`lbl${jdgScore.id}L1`).textContent = `(${highscoreDfObj[score] >= 0 ? "+" : "－"}`;
				document.getElementById(`lbl${jdgScore.id}LS`).textContent = Math.abs(highscoreDfObj[score]);
			}
		});

	}

	// X (Twitter)用リザルト
	// スコアを上塗りする可能性があるため、カスタムイベント後に配置
	const hashTag = (hasVal(g_headerObj.hashTag) ? ` ${g_headerObj.hashTag}` : ``);
	const keyUnitName = getStgDetailName(getKeyUnitName(g_keyObj.currentKey));
	const keyUnitAbbName = keyUnitName.slice(0, 1) || ``;
	let tweetDifData = `${getKeyName(g_headerObj.keyLabels[g_stateObj.scoreId])}${transKeyName}${getStgDetailName(keyUnitAbbName + '-')}${g_headerObj.difLabels[g_stateObj.scoreId]}${assistFlg}`;
	if (g_stateObj.shuffle !== `OFF`) {
		tweetDifData += `:${shuffleName}`;
	}
	const twiturl = new URL(g_localStorageUrl);
	twiturl.searchParams.append(`scoreId`, g_stateObj.scoreId);
	const baseTwitUrl = g_isLocal ? `` : `${twiturl.toString()}`.replace(/[\t\n]/g, ``);

	const tweetExcessive = (g_stateObj.excessive === C_FLG_ON) ? `(+${g_resultObj.excessive})` : ``;

	let tweetFrzJdg = ``;
	let tweetMaxCombo = `${g_resultObj.maxCombo}`;
	if (g_allFrz > 0) {
		tweetFrzJdg = `${g_resultObj.kita}-${g_resultObj.iknai}`;
		tweetMaxCombo += `-${g_resultObj.fmaxCombo}`;
	}

	const resultParams = {
		tuning: g_headerObj.tuning,
		highscore: g_resultObj,
		playStyleData: settingData.playStyleData,
		hashTag, musicTitle, tweetDifData, rankMark,
		tweetExcessive, tweetFrzJdg, tweetMaxCombo, baseTwitUrl
	};
	let tweetResultTmp = makeResultText(g_headerObj.resultFormat, resultParams);
	let resultCommonTmp = makeResultText(g_templateObj.resultFormatDf, resultParams);

	if (g_presetObj.resultVals !== undefined) {
		Object.keys(g_presetObj.resultVals).forEach(key =>
			tweetResultTmp = tweetResultTmp.split(`[${key}]`).join(g_resultObj[g_presetObj.resultVals[key]]));
	}
	const resultText = `${unEscapeHtml(tweetResultTmp)}`;
	const tweetResult = `${g_linkObj.x}?text=${encodeURIComponent(resultText)}`;

	/**
	 * リザルト画像をCanvasで作成しクリップボードへコピー
	 * @param {string} _msg 
	 */
	const copyResultImageData = _msg => {
		const tmpDiv = createEmptySprite(divRoot, `tmpDiv`, { x: 0, y: 0, w: g_sWidth, h: g_sHeight, pointerEvents: C_DIS_AUTO });
		tmpDiv.style.background = `#000000cc`;
		const canvas = document.createElement(`canvas`);
		const artistName = g_headerObj.artistNames[g_headerObj.musicNos[g_stateObj.scoreId]] || g_headerObj.artistName;
		const logicalWidth = 400;
		const logicalHeight = g_sHeight - 90;
		const flapWidth = 370;

		canvas.id = `resultImage`;
		canvas.width = logicalWidth * g_dpr;
		canvas.height = logicalHeight * g_dpr;
		canvas.style.width = wUnit(logicalWidth);
		canvas.style.height = wUnit(logicalHeight);
		canvas.style.left = wUnit((g_sWidth - parseFloat(canvas.style.width)) / 2);
		canvas.style.top = wUnit(20);
		canvas.style.position = `absolute`;

		const context = canvas.getContext(`2d`);
		context.scale(g_dpr, g_dpr);
		const drawText = (_text, { x = 30, dy = 0, hy, siz = 15, color = `#cccccc`, align = C_ALIGN_LEFT, font } = {}) => {
			context.font = `${wUnit(siz)} ${getBasicFont(font)}`;
			context.fillStyle = color;
			context.textAlign = align;
			context.fillText(_text, x, 35 + hy * 18 + dy);
		};
		makeBgCanvas(context, { w: logicalWidth, h: logicalHeight });

		drawText(`R`, { dy: -5, hy: 0, siz: 40, color: `#9999ff` });
		drawText(`ESULT`, { x: 57, dy: -5, hy: 0, siz: 25 });
		drawText(`${g_lblNameObj.dancing}${g_lblNameObj.star}${g_lblNameObj.onigiri}`,
			{ x: 280, dy: -15, hy: 0, siz: 20, color: `#999999`, align: C_ALIGN_CENTER });
		drawText(unEscapeHtml(mTitleForView[0]), { hy: 1 });
		drawText(unEscapeHtml(mTitleForView[1]), { hy: 2 });
		drawText(`${getEmojiForCanvas(g_emojiObj.memo)} ${unEscapeHtml(g_headerObj.tuning)} / ${getEmojiForCanvas(g_emojiObj.musical)} ${unEscapeHtml(artistName)}`,
			{ hy: mTitleForView[1] !== `` ? 3 : 2, siz: 12 });
		drawText(unEscapeHtml(settingData.difDataForImage), { hy: 4, siz: getFontSize2(settingData.difDataForImage, flapWidth) });

		if (settingData.playStyleData.length > 60) {
			const strs = styleStr.split(`<br>`);
			drawText(strs[0], { hy: 5, siz: getFontSize2(strs[0], flapWidth) });
			drawText(strs[1], { hy: 6, siz: getFontSize2(strs[1], flapWidth) });
		} else {
			drawText(settingData.playStyleData, { hy: 5, siz: getFontSize2(settingData.playStyleData, flapWidth, { maxSiz: 15 }) });
		}
		Object.keys(jdgScoreObj).forEach(score => {
			drawText(g_lblNameObj[`j_${score}`], { hy: 7 + jdgScoreObj[score].pos, color: jdgScoreObj[score].dfColor });
			drawText(g_resultObj[score], { x: 200, hy: 7 + jdgScoreObj[score].pos, align: C_ALIGN_RIGHT });
		});

		if (highscorePreCondition) {
			drawText(`(${highscoreDfObj.score >= 0 ? '+' : '-'} ${Math.abs(highscoreDfObj.score)})`,
				{ x: 206, hy: 18, color: highscoreDfObj.score > 0 ? `#ffff99` : `#cccccc`, align: C_ALIGN_RIGHT });
		}

		if (g_stateObj.autoAll === C_FLG_OFF) {
			drawText(g_lblNameObj.j_fast, { x: 240, hy: 7, color: `#ff9966` });
			drawText(g_resultObj.fast, { x: 360, hy: 7, align: C_ALIGN_RIGHT });
			drawText(g_lblNameObj.j_slow, { x: 240, hy: 8, color: `#ccccff` });
			drawText(g_resultObj.slow, { x: 360, hy: 8, align: C_ALIGN_RIGHT });
			if (estimatedAdj !== ``) {
				drawText(g_lblNameObj.j_adj, { x: 240, hy: 9, color: `#99ff99` });
				drawText(getDiffFrame(estimatedAdj), { x: 360, hy: 9, align: C_ALIGN_RIGHT });
			}
			if (g_stateObj.excessive === C_FLG_ON) {
				drawText(g_lblNameObj.j_excessive, { x: 240, hy: 10, color: `#ffff99` });
				drawText(g_resultObj.excessive, { x: 360, hy: 10, align: C_ALIGN_RIGHT });
			}
			g_headerObj.resultValsView
				.filter(key => hasVal(g_resultObj[g_presetObj.resultVals[key]]))
				.forEach((key, j) => {
					drawText(g_presetObj.resultVals[key], { x: 240, hy: j + 12, color: `#ffffff` });
					drawText(g_resultObj[g_presetObj.resultVals[key]], { x: 360, hy: j + 12, align: C_ALIGN_RIGHT });
				});
		}
		drawText(rankMark, { x: 240, hy: 18, siz: 50, color: rankColor, font: `"Bookman Old Style"` });
		drawText(baseTwitUrl, { hy: 19, siz: 8 });
		drawText(currentDateTime, { hy: 20 });

		tmpDiv.appendChild(canvas);

		const viewResultImage = () => {
			if (document.getElementById(`tmpClose`) === null) {
				divRoot.oncontextmenu = () => true;
				makeLinkButton(tmpDiv, `Tmp`);
				tmpDiv.appendChild(createCss2Button(`tmpClose`, g_lblNameObj.b_close, () => true, {
					...g_lblPosObj.btnRsCopyClose,
					resetFunc: () => {
						tmpDiv.removeChild(canvas);
						divRoot.removeChild(tmpDiv);
						divRoot.oncontextmenu = () => false;
					},
				}, g_cssObj.button_Back));
				tmpDiv.appendChild(createDescDiv(`resultImageDesc`, g_lblNameObj.resultImageDesc));
			}
		};

		try {
			if (ClipboardItem === undefined) {
				throw new Error(`error`);
			}
			if (keyIsShift()) {
				viewResultImage();
			} else {
				// Canvas の内容を PNG 画像として取得
				canvas.toBlob(async blob => {
					await navigator.clipboard.write([
						new ClipboardItem({
							'image/png': blob
						})
					]);
				});
				tmpDiv.removeChild(canvas);
				divRoot.removeChild(tmpDiv);
				makeInfoWindow(_msg, `leftToRightFade`);
			}

		} catch (err) {
			// 画像をクリップボードへコピーできないときは代替で画像保存可能な画面を表示
			viewResultImage();
		}
	};

	/**
	 * 音源、ループ処理の停止
	 * @param {string} _id 
	 * @param {string} _name 
	 * @param {object} _posObj 
	 * @param {Function} _func 
	 * @param {...any} _cssClass 
	 * @returns {HTMLDivElement}
	 */
	const resetCommonBtn = (_id, _name, _posObj, _func, _cssClass) =>
		createCss2Button(_id, _name, () => {
			if (g_finishFlg) {
				g_audio.pause();
			}
			g_timerHandler.clearTimeout(g_timeoutEvtId);
			g_timerHandler.clearTimeout(g_timeoutEvtResultId);
		}, { ..._posObj, resetFunc: () => _func() }, _cssClass);

	/**
	 * 外部リンクボタンを作成
	 * @param {object} _div 
	 * @param {string} _param 
	 */
	const makeLinkButton = (_div = divRoot, _param = ``) => {
		multiAppend(_div,
			// リザルトデータをX (Twitter)へ転送
			createCss2Button(`btnTweet${_param}`, g_lblNameObj.b_tweet, () => true, {
				...g_lblPosObj.btnRsTweet, resetFunc: () => openLink(tweetResult),
			}, g_cssObj.button_Tweet),

			// Discordへのリンク
			createCss2Button(`btnGitter${_param}`, g_lblNameObj.b_gitter, () => true, {
				...g_lblPosObj.btnRsGitter, resetFunc: () => openLink(g_linkObj.discord),
			}, g_cssObj.button_Discord),
		);
	};

	// ボタン描画
	multiAppend(divRoot,

		// タイトル画面へ戻る
		resetCommonBtn(`btnBack`, g_lblNameObj.b_back, g_lblPosObj.btnRsBack, titleInit, g_cssObj.button_Back),

		// リザルトデータをクリップボードへコピー
		createCss2Button(`btnCopy`, g_lblNameObj.b_copy, () =>
			copyTextToClipboard(keyIsShift() ?
				unEscapeHtml(resultCommonTmp) : resultText, g_msgInfoObj.I_0001),
			g_lblPosObj.btnRsCopy, g_cssObj.button_Setting),
	);
	makeLinkButton();
	multiAppend(divRoot,
		// リトライ
		resetCommonBtn(`btnRetry`, g_lblNameObj.b_retry, g_lblPosObj.btnRsRetry, loadMusic, g_cssObj.button_Reset),

		createCss2Button(`btnCopyImage`, g_emojiObj.camera, () => true, {
			...g_lblPosObj.btnRsCopyImage, resetFunc: () => copyResultImageData(g_msgInfoObj.I_0001),
		}, g_cssObj.button_Default_NoColor),
	);

	// マスクスプライトを作成
	const makeResultSprite = createMultipleSprite(`maskResultSprite`, g_headerObj.maskResultMaxDepth);
	makeResultSprite.style.pointerEvents = g_headerObj.maskresultButton ? C_DIS_AUTO : C_DIS_NONE;

	// リザルトモーションの0フレーム対応
	g_animationData.filter(sprite => g_scoreObj[`${sprite}ResultFrameNum`] === 0 && g_headerObj[`${sprite}ResultData`]?.[0] !== undefined)
		.forEach(sprite => {
			g_scoreObj[`${sprite}ResultFrameNum`] = g_animationFunc.draw[sprite](0, `result`, sprite);
			g_headerObj[`${sprite}ResultData`][0] = undefined;
		});

	/**
	 * タイトルのモーション設定
	 */
	const flowResultTimeline = () => {

		// ユーザカスタムイベント(フレーム毎)
		safeExecuteCustomHooks(`g_customJsObj.resultEnterFrame`, g_customJsObj.resultEnterFrame);

		// 背景・マスクモーション、スキン変更
		drawTitleResultMotion(g_currentPage);

		// リザルト画面移行後のフェードアウト処理
		if (g_scoreObj.fadeOutFrame >= g_scoreObj.frameNum) {
			if (g_scoreObj.frameNum >= g_scoreObj.fullFrame) {
				g_timerHandler.clearTimeout(g_timeoutEvtId);
			}
			g_scoreObj.frameNum++;
		} else {
			const tmpVolume = (g_audio.volume - (3 * g_stateObj.volume / 100 * C_FRM_AFTERFADE / g_scoreObj.fadeOutTerm) / 1000);
			if (tmpVolume < 0) {
				g_audio.volume = 0;
				g_timerHandler.clearTimeout(g_timeoutEvtId);
			} else {
				g_audio.volume = tmpVolume;
			}
		}

		thisTime = performance.now();
		buffTime = thisTime - resultStartTime - g_scoreObj.resultFrameNum * 1000 / g_fps;

		g_scoreObj.resultFrameNum++;
		g_animationData.forEach(sprite => g_scoreObj[`${sprite}ResultFrameNum`]++);
		g_timeoutEvtResultId = g_timerHandler.setTimeout(flowResultTimeline, 1000 / g_fps - buffTime);
	};
	flowResultTimeline();

	// キー操作イベント（デフォルト）
	setShortcutEvent(g_currentPage, () => true, { dfEvtFlg: true });
	document.oncontextmenu = () => true;

	safeExecuteCustomHooks(`g_skinJsObj.result`, g_skinJsObj.result);
};

/**
 * 選択した設定の情報を取得
 * @param {boolean} _orgShuffleFlg
 * @returns {object}
 */
const getSelectedSettingList = (_orgShuffleFlg) => {

	const transKeyName = getTransKeyName();
	/**
	 * プレイスタイルのカスタム有無
	 * @param {string} _flg 
	 * @param {string|boolean} _defaultSet デフォルト値
	 * @param {string} _displayText 
	 * @returns {string}
	 */
	const withOptions = (_flg, _defaultSet, _displayText = _flg) =>
		(_flg !== _defaultSet ? getStgDetailName(_displayText) : ``);

	const withDisplays = (_flg, _defaultSet, _displayText = _flg) =>
	(_flg !== _defaultSet
		? getStgDetailName(_displayText) + (_flg === C_FLG_OFF ? `` : ` : ${getStgDetailName(_flg)}`) : ``);

	// 譜面名の組み立て処理 (Ex: 9Akey / Normal-Leftless (maker) [X-Mirror])
	const keyUnitName = getStgDetailName(getKeyUnitName(g_keyObj.currentKey));
	const difDatas = [
		`${getKeyName(g_headerObj.keyLabels[g_stateObj.scoreId])}${transKeyName} ${keyUnitName} / ${g_headerObj.difLabels[g_stateObj.scoreId]}`,
		`${withOptions(g_autoPlaysBase.includes(g_stateObj.autoPlay), true, `-${getStgDetailName(g_stateObj.autoPlay)}${getStgDetailName('less')}`)}`,
		`${withOptions(g_headerObj.makerView, false, `(${g_headerObj.creatorNames[g_stateObj.scoreId]})`)}`,
		`${withOptions(g_stateObj.shuffle, C_FLG_OFF, `[${getShuffleName()}]`)}`
	];
	let difData = difDatas.filter(value => value !== ``).join(` `);
	const difDataForImage = difDatas.filter((value, j) => value !== `` && j !== 2).join(` `);

	// 設定の組み立て処理 (Ex: 4x, Brake, Reverse, Sudden+, NoRecovery)
	let playStyleData = [
		`${g_stateObj.speed}${g_lblNameObj.multi}`,
		withOptions(g_stateObj.motion, C_FLG_OFF),
		`${withOptions(g_stateObj.reverse, C_FLG_OFF,
			getStgDetailName(g_stateObj.scroll !== C_FLG_HYPHEN ? 'R-' : C_FLG_REVERSE))}${withOptions(g_stateObj.scroll, C_FLG_HYPHEN)}`,
		withOptions(g_stateObj.appearance, `Visible`) +
		((g_appearanceRanges.includes(g_stateObj.appearance) && g_stateObj.filterLock === C_FLG_ON) ? `(${g_hidSudObj.filterPos}%)` : ``),
		withOptions(g_stateObj.gauge, g_settings.gauges[0]),
		withOptions(g_stateObj.playWindow, `Default`,
			`${getStgDetailName(g_stateObj.playWindowType === C_FLG_REVERSE2 ? `R-` : ``)}${getStgDetailName(g_stateObj.playWindow)}`),
		withOptions(g_stateObj.stepArea, `Default`),
		withOptions(g_stateObj.frzReturn, C_FLG_OFF,
			`FR:${getStgDetailName(g_stateObj.frzReturn)}(${getStgDetailName(g_stateObj.frzReturnType)})`),
		withOptions(g_stateObj.shaking, C_FLG_OFF),
		withOptions(g_stateObj.effect, C_FLG_OFF),
		[
			withOptions(g_stateObj.camoufrage, C_FLG_OFF, `Cmf:${getStgDetailName(g_stateObj.camoufrage)}`),
			withOptions(g_stateObj.camoufrageType, C_FLG_HYPHEN,
				`${g_stateObj.camoufrage !== C_FLG_OFF ? '' : 'Cmf:'}${getStgDetailName(g_stateObj.camoufrageType)}`)
		].filter(value => value !== ``).join(`+`),
		withOptions(g_stateObj.swapping, C_FLG_OFF,
			`Swap:${getStgDetailName(g_stateObj.swapping)}${!_orgShuffleFlg && !g_stateObj.swapping.endsWith(`+`) ? getStgDetailName(`(S)`) : ``}`),
		withOptions(g_stateObj.judgRange, `Normal`, `Judg:${getStgDetailName(g_stateObj.judgRange)}`),
	].filter(value => value !== ``).join(`, `);

	// Display設定の組み立て処理 (Ex: Step : FlatBar, Judge, Life : OFF)
	let displayData = [
		withDisplays(g_stateObj.d_stepzone, C_FLG_ON, g_lblNameObj.rd_StepZone),
		withDisplays(g_stateObj.d_judgment, C_FLG_ON, g_lblNameObj.rd_Judgment),
		withDisplays(g_stateObj.d_lifegauge, C_FLG_ON, g_lblNameObj.rd_LifeGauge),
		withDisplays(g_stateObj.d_score, C_FLG_ON, g_lblNameObj.rd_Score),
		withDisplays(g_stateObj.d_musicinfo, C_FLG_ON, g_lblNameObj.rd_MusicInfo),
		withDisplays(g_stateObj.d_filterline, C_FLG_ON, g_lblNameObj.rd_FilterLine),
	].filter(value => value !== ``).join(`, `);
	if (displayData === ``) {
		displayData = getStgDetailName(`All Visible`);
	} else {
		// 表示設定のOFF項目を末尾にまとめる
		const displayList = displayData.split(`, `).sort((a, b) => b.includes(`:`) - a.includes(`:`));
		displayData = displayList.join(`, `);
		if (!displayList.at(-1).includes(`:`)) {
			displayData += ` : ${getStgDetailName(C_FLG_OFF)}`;
		}
	}

	let display2Data = [
		withDisplays(g_stateObj.d_velocity, C_FLG_ON, g_lblNameObj.rd_Velocity),
		withDisplays(g_stateObj.d_color, C_FLG_ON, g_lblNameObj.rd_Color),
		withDisplays(g_stateObj.d_background, C_FLG_ON, g_lblNameObj.rd_Background),
		withDisplays(g_stateObj.d_arroweffect, C_FLG_ON, g_lblNameObj.rd_ArrowEffect),
		withDisplays(g_stateObj.d_special, C_FLG_ON, g_lblNameObj.rd_Special),
	].filter(value => value !== ``).join(`, `);
	if (display2Data !== ``) {
		// 表示設定のOFF項目を末尾にまとめる
		const display2List = display2Data.split(`, `).sort((a, b) => b.includes(`:`) - a.includes(`:`));
		display2Data = display2List.join(`, `);
		if (!display2List.at(-1).includes(`:`)) {
			display2Data += ` : ${getStgDetailName(C_FLG_OFF)}`;
		}
	}

	return { difData, difDataForImage, playStyleData, displayData, display2Data };
};

/**
 * リザルトフォーマットの整形処理
 * @param {string} _format 
 * @param {object} object フォーマット置き換え変数群
 * @param {string} object.hashTag ハッシュタグ
 * @param {string} object.musicTitle 曲名
 * @param {string} object.tweetDifData 譜面名
 * @param {string} object.tuning 製作者名
 * @param {string} object.rankMark ランク
 * @param {string} object.playStyleData プレイ設定
 * @param {object} object.highscore ハイスコア（判定別）
 * @param {string} object.tweetExcessive 空押し判定状況
 * @param {string} object.tweetFrzJdg フリーズアロー判定状況
 * @param {string} object.tweetMaxCombo コンボ数状況
 * @param {string} object.baseTwitUrl X投稿用URL
 * @returns {string}
 */
const makeResultText = (_format, {
	hashTag, musicTitle, tweetDifData, tuning, rankMark, playStyleData,
	highscore, tweetExcessive, tweetFrzJdg, tweetMaxCombo, baseTwitUrl } = {}) =>
	replaceStr(_format, [
		[`[hashTag]`, hashTag],
		[`[musicTitle]`, musicTitle],
		[`[keyLabel]`, tweetDifData],
		[`[maker]`, tuning],
		[`[rank]`, rankMark],
		[`[score]`, highscore?.score],
		[`[playStyle]`, playStyleData],
		[`[arrowJdg]`, `${highscore?.ii}-${highscore?.shakin}-${highscore?.matari}-${highscore?.shobon}-${highscore?.uwan}${tweetExcessive}`],
		[`[frzJdg]`, tweetFrzJdg],
		[`[maxCombo]`, tweetMaxCombo],
		[`[url]`, baseTwitUrl]
	]);

/**
 * 結果表示作成（曲名、オプション）
 * @param {string} _id 
 * @param {number} _x
 * @param {string} _class 
 * @param {number} _heightPos 
 * @param {string} _text
 * @param {string} _align
 * @param {number} [object.w=400]
 * @param {number} [object.siz=g_limitObj.mainSiz]
 * @returns {HTMLDivElement}
 */
const makeCssResultPlayData = (_id, _x, _class, _heightPos, _text, _align = C_ALIGN_CENTER, { w = 400, siz = g_limitObj.mainSiz } = {}) =>
	createDivCss2Label(_id, _text, {
		x: _x, y: g_limitObj.setMiniSiz * _heightPos, w, h: g_limitObj.setMiniSiz, siz, align: _align,
	}, _class);

/**
 * 結果表示作成（キャラクタ）
 * @param {string} _id 
 * @param {number} _x
 * @param {string} _class
 * @param {number} _heightPos 
 * @param {string} _text
 * @param {string} _align
 * @returns {HTMLDivElement}
 */
const makeCssResultSymbol = (_id, _x, _class, _heightPos, _text, _align = C_ALIGN_LEFT) =>
	makeCssResultPlayData(_id, _x, _class, _heightPos, _text, _align, { w: 150, siz: g_limitObj.jdgCntsSiz });
