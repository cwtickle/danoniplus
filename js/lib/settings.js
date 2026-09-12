/**
 * Dancing☆Onigiri (CW Edition)
 * Settings, Display, Ex-Settings画面
 * - ページ: option, difSelector, scoreDetail, settingsDisplay, displayPreview, exSetting
 *
 * Source by tickle
 * Created : 
 * Revised : 
 *
 * https://github.com/cwtickle/danoniplus
 */

/*-----------------------------------------------------------*/
/* Scene : SETTINGS [lime] */
/*-----------------------------------------------------------*/

const commonSettingBtn = _labelName => {

	const switchSave = evt => {
		const from = boolToSwitch(g_stateObj.dataSaveFlg);
		g_stateObj.dataSaveFlg = !g_stateObj.dataSaveFlg;
		updateSettingSummary();

		const to = boolToSwitch(g_stateObj.dataSaveFlg);
		evt.target.classList.replace(g_cssObj[`button_${from}`], g_cssObj[`button_${to}`]);
	};

	multiAppend(divRoot,

		// タイトル画面へ戻る
		createCss2Button(`btnBack`, g_lblNameObj.b_back, () => true, {
			...g_lblPosObj.btnBack,
			animationName: (g_initialFlg ? `` : `smallToNormalY`), resetFunc: () => titleInit(),
		}, g_cssObj.button_Back),

		// キーコンフィグ画面へ移動
		createCss2Button(`btnKeyConfig`, g_lblNameObj.b_keyConfig, () => true, {
			...g_lblPosObj.btnKeyConfig,
			animationName: (g_initialFlg ? `` : `smallToNormalY`), resetFunc: () => keyConfigInit(`Main`, true),
		}, g_cssObj.button_Setting),

		// プレイ開始
		makePlayButton(() => loadMusic()),

		// Display設定へ移動
		createCss2Button(`btn${_labelName}`, `>`, () => true, {
			...g_lblPosObj.btnSwitchSetting,
			title: g_msgObj[`to${_labelName}`], resetFunc: () => g_moveSettingWindow(),
			cxtFunc: () => g_moveSettingWindow(true, -1),
		}, g_cssObj.button_Mini),

		// データセーブフラグの切替
		createCss2Button(`btnSave`, g_lblNameObj.dataSave, evt => switchSave(evt), {
			...g_lblPosObj.btnSave,
			cxtFunc: evt => switchSave(evt),
			visibility: g_langStorage.safeMode === C_FLG_OFF ? C_DIS_INHERIT : `hidden`,
		}, g_cssObj.button_Default, (g_stateObj.dataSaveFlg ? g_cssObj.button_ON : g_cssObj.button_OFF)),

		// データ管理画面へ移動
		createCss2Button(`btnReset`, g_lblNameObj.dataReset, () => {
			dataMgtInit();
		}, g_lblPosObj.btnReset, g_cssObj.button_Reset),

		// 前提条件表示用画面へ移動（debug=trueの場合のみ）
		createCss2Button(`btnPrecond`, g_lblNameObj.b_precond, () => true, {
			...g_lblPosObj.btnPrecond,
			resetFunc: () => preconditionInit(),
		}, g_cssObj.button_Setting),

		// 設定内容サマリを表示
		createCss2Button(`btnSettingSummary`, `>`, () => true, {
			...g_lblPosObj.btnSettingSummary,
			resetFunc: () => {
				g_stateObj.settingSummaryVisible = !g_stateObj.settingSummaryVisible;
				visibleSettingSummary(g_stateObj.settingSummaryVisible);
			},
		}, g_cssObj.button_Mini),
	);
	makeSettingSummary();
};

const makeSettingSummary = () => {
	const tmpDiv = createEmptySprite(divRoot, `settingSumSprite`, g_windowObj.settingSumSprite);
	tmpDiv.style.background = g_headerObj.baseBrightFlg ? `#ffffffee` : `#000000cc`;

	multiAppend(tmpDiv,
		createDivCss2Label(`lblSummaryHeader`, g_lblNameObj.settingSummary, g_lblPosObj.lblSummaryHeader),
		createDivCss2Label(`lblSummaryEnvironment`, ``, g_lblPosObj.lblSummaryEnvironment),
		createDivCss2Label(`lblSummaryDifHeader`, g_lblNameObj.rt_Difficulty, g_lblPosObj.lblSummaryDifHeader),
		createDivCss2Label(`lblSummaryDifInfo`, ``, g_lblPosObj.lblSummaryDifInfo),
		createDivCss2Label(`lblSummaryPlaystyleHeader`, g_lblNameObj.rt_Style, g_lblPosObj.lblSummaryPlaystyleHeader),
		createDivCss2Label(`lblSummaryPlaystyleInfo`, ``, g_lblPosObj.lblSummaryPlaystyleInfo),
		createDivCss2Label(`lblSummaryDisplayHeader`, g_lblNameObj.rt_Display, g_lblPosObj.lblSummaryDisplayHeader),
		createDivCss2Label(`lblSummaryDisplayInfo`, ``, g_lblPosObj.lblSummaryDisplayInfo),
		createDivCss2Label(`lblSummaryDisplay2Info`, ``, g_lblPosObj.lblSummaryDisplay2Info),
	);
	tmpDiv.style.visibility = g_stateObj.settingSummaryVisible ? `visible` : `hidden`;
	dragDiv(`settingSumSprite`, {
		minX: g_btnX() + 25, maxX: g_btnX() + 25, minY: 10, maxY: g_sHeight - 10,
	});
	if (g_posObj.settingSumSprite?.y !== undefined) {
		document.getElementById(`settingSumSprite`).style.top = wUnit(g_posObj.settingSumSprite.y);
	}
};

const visibleSettingSummary = _visible => {
	const summaryDiv = document.getElementById(`settingSumSprite`);
	if (summaryDiv) {
		summaryDiv.style.visibility = _visible ? `visible` : `hidden`;
		updateSettingSummary();
	}
};

const updateSettingSummary = () => {
	if (document.getElementById(`settingSumSprite`) === null) return;
	const orgShuffleFlg = getOrgShuffleFlg();
	const settingData = getSelectedSettingList(orgShuffleFlg);
	const estimatedHighscoreCondition = g_stateObj.dataSaveFlg && (g_stateObj.autoPlay !== C_FLG_ALL && g_headerObj.playbackRate === 1 && g_stateObj.fadein < 10 &&
		(g_stateObj.shuffle === C_FLG_OFF || (g_stateObj.shuffle.endsWith(`Mirror`) && orgShuffleFlg)));

	document.getElementById(`lblSummaryDifInfo`).innerHTML = settingData.difData + `${estimatedHighscoreCondition ? '' : ` | <span class="common_auto common_bold">No Records</span>`}`;
	document.getElementById(`lblSummaryPlaystyleInfo`).textContent = settingData.playStyleData + `${g_stateObj.excessive === C_FLG_ON ? ' | Excessive' : ''}`;
	document.getElementById(`lblSummaryDisplayInfo`).textContent = settingData.displayData;
	document.getElementById(`lblSummaryDisplay2Info`).textContent = settingData.display2Data;
	document.getElementById(`lblSummaryEnvironment`).textContent =
		`(Adj: ${g_stateObj.adjustment} f, Volume: ${g_stateObj.volume}%, ` +
		`ColorType: ${g_colorType}, KeyPattern: ${g_keyObj.currentPtn === -1 ? 'Self' : g_keyObj.currentPtn + 1})`;

	safeExecuteCustomHooks(`g_customJsObj.settingSummary`, g_customJsObj.settingSummary);
};

/**
 * PLAYボタンの作成
 * @param {Function} _func 
 * @returns {HTMLDivElement}
 */
const makePlayButton = _func => createCss2Button(`btnPlay`, g_lblNameObj.b_play, () => true, {
	...g_lblPosObj.btnPlay, animationName: (g_initialFlg ? `` : `smallToNormalY`), resetFunc: _func,
}, g_cssObj.button_Next);

/**
 * 設定・オプション画面初期化
 */
const optionInit = () => {

	clearWindow();
	pauseBGM();
	const divRoot = document.getElementById(`divRoot`);
	g_currentPage = `option`;
	g_stateObj.filterKeys = ``;

	// 楽曲データの表示
	const text = getMusicInfoView();
	divRoot.appendChild(createDivCss2Label(`lblMusicInfo`, text,
		{ ...g_lblPosObj.lblMusicInfo, siz: getFontSize2(text, g_btnWidth(3 / 4), { maxSiz: 12 }) }));

	// タイトル文字描画
	divRoot.appendChild(getTitleDivLabel(`lblTitle`, g_lblNameObj.settings, 0, 15, `settings_Title`));

	// オプションボタン用の設置
	createOptionWindow(divRoot);

	// ユーザカスタムイベント(初期)
	safeExecuteCustomHooks(`g_customJsObj.option`, g_customJsObj.option);

	// ボタン描画
	commonSettingBtn(`Display`);

	// キー操作イベント（デフォルト）
	setShortcutEvent(g_currentPage, () => true, { dfEvtFlg: true });
	document.oncontextmenu = () => true;
	g_initialFlg = true;

	safeExecuteCustomHooks(`g_skinJsObj.option`, g_skinJsObj.option);
};

/**
 * 設定画面に表示する楽曲・BPM情報の取得
 * @returns {string}
 */
const getMusicInfoView = () => {
	const idx = g_headerObj.musicNos[g_stateObj.scoreId] || 0;
	let text = `♪` + (g_headerObj.musicSelectUse ? `${unEscapeHtml(g_headerObj.musicTitles[idx])} / ` : ``) +
		`BPM: ${g_headerObj.bpms[idx]}`;
	if (!g_headerObj.musicSelectUse && g_headerObj.bpms[idx] === `----`) {
		text = ``;
	}
	return text;
};

/**
 * 設定画面用スプライトリストの作成
 * @param {object} _settingList (設定名、縦位置、縦位置差分、幅差分、高さ差分)を設定別にリスト化
 * @returns
 */
const setSpriteList = _settingList => {
	const optionWidth = (g_sWidth - 450) / 2;
	const spriteList = [];
	Object.keys(_settingList).forEach(setting =>
		spriteList[setting] = createEmptySprite(optionsprite, `${setting}Sprite`, {
			x: 25, y: _settingList[setting].heightPos * g_limitObj.setLblHeight + (_settingList[setting].y || 0) + 20,
			w: optionWidth + (_settingList[setting].dw || 0), h: g_limitObj.setLblHeight + (_settingList[setting].dh || 0),
		}));
	return spriteList;
};

/**
 * スライダー共通処理 (Fadein, Appearance)
 * @param {HTMLInputElement} _slider 
 * @param {HTMLDivElement} _link 
 * @param {string} _type 
 * @returns {string}
 */
const inputSlider = (_slider, _link, _type) => {
	const value = parseInt(_slider.value);
	_link.textContent = g_sliderView.get(_type)(value);
	return value;
};

/**
 * 譜面変更セレクターの削除
 */
const resetDifWindow = () => {
	if (document.getElementById(`difList`) !== null) {
		deleteChildspriteAll(`difList`);
		[`difList`, `difCover`, `btnDifU`, `btnDifD`].forEach(obj => document.getElementById(obj).remove());
		g_currentPage = `option`;
		setShortcutEvent(g_currentPage, () => true, { displayFlg: false, dfEvtFlg: true });
	}
};

/**
 * 次の譜面番号を取得 
 * @param {number} _scoreId 
 * @param {number} _scrollNum 
 * @returns {number}
 */
const getNextDifficulty = (_scoreId, _scrollNum) => {
	const currentPosIdx = g_headerObj.viewLists.findIndex(val => val === _scoreId);
	const nextPosIdx = (currentPosIdx === -1 ? 0 : nextPos(currentPosIdx, _scrollNum, g_headerObj.viewLists.length));
	return g_headerObj.viewLists[nextPosIdx];
};

/**
 * 譜面選択処理
 * @param {number} _scrollNum 
 */
const nextDifficulty = (_scrollNum = 1) => {
	g_keyObj.prevKey = g_headerObj.keyLabels[g_stateObj.scoreId];
	g_stateObj.scoreId = getNextDifficulty(g_stateObj.scoreId, _scrollNum);
	setDifficulty(true);
	resetDifWindow();
};

/**
 * 譜面リストの作成
 * @param {HTMLDivElement} _difList 
 * @param {string} _targetKey 
 */
const makeDifList = (_difList, _targetKey = ``) => {
	let k = 0, pos = 0, curk = -1;
	g_headerObj.viewLists.forEach(j => {
		const keyLabel = g_headerObj.keyLabels[j];
		if (_targetKey === `` || keyLabel === _targetKey) {

			// 譜面名の表示
			const prefix = `${getKeyName(keyLabel)} / `;
			let text = `${g_headerObj.difLabels[j]}`;
			if (g_headerObj.makerView) {
				text += ` (${g_headerObj.creatorNames[j]})`;
			}
			// キー種と譜面名に分割し、譜面名が長すぎる場合は二段に分割して表示
			const [difText, difSiz] = getFontSizeMulti(text, g_limitObj.difSelectorWidth, {
				maxSiz: g_limitObj.difSelectorSiz, maxSizMulti: 9, prefix, len: 30,
			})
			_difList.appendChild(makeDifLblCssButton(`dif${k}`, difText, k, () => nextDifficulty(j - g_stateObj.scoreId), {
				btnStyle: (j === g_stateObj.scoreId ? `Setting` : `Default`), siz: difSiz,
			}));
			document.getElementById(`dif${k}`).style.lineHeight = `9px`;
			if (j === g_stateObj.scoreId) {
				pos = k + 6.5 * (g_sHeight - 239) / 261;
				curk = k;
			}
			k++;
		}
	});
	if (document.getElementById(`lblDifCnt`) === null) {
		difCover.appendChild(createDivCss2Label(`lblDifCnt`, ``, {
			x: 0, y: 27, w: g_limitObj.difCoverWidth, h: 16, siz: 12, fontWeight: `bold`,
		}));
	}
	// フィルタなし> ALL: 1/ 5, フィルタあり> 7k: 1/ 1 のように現在位置と(フィルタされた)譜面数を表示
	// 現在位置が不確定の場合は、7k: -/ 1 のように現在位置を「-」で表示
	const keyUnitAbbName = getStgDetailName(getKeyUnitName(_targetKey)).slice(0, 1) || ``;
	lblDifCnt.innerHTML = `${_targetKey === '' ? 'ALL' : getKeyName(_targetKey) + keyUnitAbbName}: ${curk === -1 ? '-' : curk + 1} / ${k}`;
	_difList.scrollTop = Math.max(pos * g_limitObj.setLblHeight - parseInt(_difList.style.height), 0);
};

/**
 * 譜面セレクター位置の変更ボタン
 * @param {number} _scrollNum 
 */
const makeDifBtn = (_scrollNum = 1) => {
	const dir = _scrollNum === 1 ? `D` : `U`;
	return createCss2Button(`btnDif${dir}`, g_settingBtnObj.chara[dir], () => {
		do {
			g_stateObj.scoreId = getNextDifficulty(g_stateObj.scoreId, _scrollNum);
		} while (g_stateObj.filterKeys !== `` && g_stateObj.filterKeys !== g_headerObj.keyLabels[g_stateObj.scoreId]);
		setDifficulty(true);
		deleteChildspriteAll(`difList`);
		makeDifList(difList, g_stateObj.filterKeys);
		g_keyObj.prevKey = g_keyObj.currentKey;
	}, {
		x: 430 + _scrollNum * 10, y: 40, w: 20, h: 20, siz: g_limitObj.jdgCntsSiz,
	}, g_cssObj.button_Mini);
};

/**
 * 譜面変更セレクターの作成・再作成
 * @param {string} [_key=''] 絞り込みするキー名(無指定で絞り込みしない)
 */
const createDifWindow = (_key = ``) => {
	g_currentPage = `difSelector`;
	setShortcutEvent(g_currentPage);
	const difList = createEmptySprite(optionsprite, `difList`, g_windowObj.difList, g_cssObj.settings_DifSelector);
	const difCover = createEmptySprite(optionsprite, `difCover`, g_windowObj.difCover, g_cssObj.settings_DifSelector);
	const difFilter = createEmptySprite(difCover, `difFilter`, g_windowObj.difFilter, g_cssObj.settings_DifSelector)

	// リスト再作成
	makeDifList(difList, _key);

	// ランダム選択
	difCover.appendChild(
		makeDifLblCssButton(`difRandom`, `RANDOM`, 0, () => {
			nextDifficulty(Math.floor(Math.random() * g_headerObj.keyLabels.length));
		}, { w: g_limitObj.difCoverWidth })
	);

	// 全リスト
	difCover.appendChild(
		makeDifLblCssButton(`keyFilter`, `ALL`, 1.9, () => {
			resetDifWindow();
			g_stateObj.filterKeys = ``;
			createDifWindow();
		}, { w: g_limitObj.difCoverWidth, btnStyle: (g_stateObj.filterKeys === `` ? `Setting` : `Default`) })
	);

	// キー別フィルタボタン作成
	let pos = 0;
	g_headerObj.viewKeyLists.forEach((targetKey, m) => {
		difFilter.appendChild(
			makeDifLblCssButton(`keyFilter${m}`, `${getKeyName(targetKey)} ${getStgDetailName(getKeyUnitName(targetKey))}`, m, () => {
				resetDifWindow();
				g_stateObj.filterKeys = targetKey;
				createDifWindow(targetKey);
			}, { w: g_limitObj.difCoverWidth, btnStyle: (g_stateObj.filterKeys === targetKey ? `Setting` : `Default`) })
		);
		if (g_stateObj.filterKeys === targetKey) {
			pos = m + 5 * (g_sHeight - 300) / 200;
		}
	});
	difFilter.scrollTop = Math.max(pos * g_limitObj.setLblHeight - parseInt(difFilter.style.height), 0);

	multiAppend(optionsprite, makeDifBtn(-1), makeDifBtn());
};

/**
 * 譜面変更ボタンを押したときの処理
 * @param {number} [_num=1] 
 */
const changeDifficulty = (_num = 1) => {
	if (g_headerObj.difSelectorUse) {
		g_stateObj.filterKeys = ``;
		if (document.getElementById(`difList`) === null) {
			g_keyObj.prevKey = g_keyObj.currentKey;
			createDifWindow();
		} else {
			resetDifWindow();
		}
	} else {
		nextDifficulty(_num);
	}
};

/**
 * 譜面基礎データの取得
 * @param {number} _scoreId 
 * @returns {{ arrowCnts: number, frzCnts: number, apm: number, playingTime: string }}
 */
const getScoreBaseData = _scoreId => {
	const arrowCnts = sumData(g_detailObj.arrowCnt[_scoreId]);
	const frzCnts = sumData(g_detailObj.frzCnt[_scoreId]);
	return {
		arrowCnts: arrowCnts,
		frzCnts: frzCnts,
		apm: Math.round((arrowCnts + frzCnts) / (g_detailObj.playingFrame[_scoreId] / g_fps / 60)),
		playingTime: transFrameToTimer(g_detailObj.playingFrame[_scoreId]),
	};
};

/**
 * 速度変化グラフの描画
 * @param {number} _scoreId
 */
const drawSpeedGraph = _scoreId => {
	const startFrame = g_detailObj.startFrame[_scoreId];
	const playingFrame = g_detailObj.playingFrameWithBlank[_scoreId];
	const speedObj = {
		speed: { frame: [0], speed: [1], cnt: 0, strokeColor: g_graphColorObj.speed },
		boost: { frame: [0], speed: [1], cnt: 0, strokeColor: g_graphColorObj.boost }
	};

	const tmpSpeedPoint = [0];
	Object.keys(speedObj).forEach(speedType => {
		const frame = speedObj[speedType].frame;
		const speed = speedObj[speedType].speed;
		const speedData = g_detailObj[`${speedType}Data`][_scoreId];

		for (let i = 0; i < speedData?.length; i += 2) {
			if (speedData[i] >= startFrame) {
				frame.push(speedData[i] - startFrame);
				speed.push(getSpeedFactor(speedData[i + 1]));
				tmpSpeedPoint.push(speedData[i] - startFrame);
			}
			speedObj[speedType].cnt++;
		}
		frame.push(playingFrame);
		speed.push(speed.at(-1));
		tmpSpeedPoint.push(playingFrame);
	});
	const speedPoints = makeDedupliArray(tmpSpeedPoint).sort((a, b) => a - b);
	let speedPointIdx = 0;

	const canvas = document.getElementById(`graphSpeed`);
	const context = canvas.getContext(`2d`);
	const [_a, _b] = [-75, 100];
	const [_min, _max] = [-0.2, 2.2];
	const lineX = [0, 150], lineY = 208;

	const avgX = [0, 0];
	const avgSubX = [0, 0];
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawBaseLine(context, { _fixed: 1, _mark: `x`, _a, _b, _min, _max });

	Object.keys(speedObj).forEach((speedType, j) => {
		const frame = speedObj[speedType].frame;
		const speed = speedObj[speedType].speed;

		context.beginPath();
		let preY;
		let avgSubFrame = 0;

		for (let i = 0; i < frame.length; i++) {
			const x = frame[i] * (g_limitObj.graphWidth - 30) / playingFrame + 30;
			const y = (Math.min(Math.max(speed[i], _min - 0.05), _max + 0.05) - 1) * _a + _b;

			context.lineTo(x, preY);
			context.lineTo(x, y);
			preY = y;

			const prevFrame = (i > 0 ? frame[i - 1] : 0);   // frame[] は startFrame 相対。初回は 0 起点
			const deltaFrame = frame[i] - prevFrame;
			const prevSpeed = (i > 0 ? speed[i - 1] : 1);
			avgX[j] += deltaFrame * prevSpeed;
			if (prevSpeed !== 1) {
				avgSubFrame += deltaFrame;
				avgSubX[j] += deltaFrame * prevSpeed;
			}
		}
		avgX[j] /= playingFrame;
		avgSubX[j] /= Math.max(avgSubFrame, 1);

		context.lineWidth = 2;
		context.strokeStyle = speedObj[speedType].strokeColor;
		context.stroke();

		context.beginPath();
		context.moveTo(lineX[j], lineY);
		context.lineTo(lineX[j] + 25, lineY);
		context.stroke();
		context.font = `${wUnit(g_limitObj.mainSiz)} ${getBasicFont()}`;
		context.fillText(g_lblNameObj[`s_${speedType}`], lineX[j] + 30, lineY + 3);

		const maxSpeed = Math.max(...speed);
		const minSpeed = Math.min(...speed);
		context.font = `${wUnit(g_limitObj.graphMiniSiz)} ${getBasicFont()}`;
		context.fillText(`(${minSpeed.toFixed(2)}x` + (minSpeed === maxSpeed ? `` : ` -- ${Math.max(...speed).toFixed(2)}x`) + `)`, lineX[j] + 30, lineY + 16);
		context.fillText(`Avg. ` + (avgX[j] === 1 ? `----` : `${(avgSubX[j]).toFixed(2)}x`), lineX[j] + 30, lineY + 29);
		updateScoreDetailLabel(`Speed`, `${speedType}S`, speedObj[speedType].cnt, j, g_lblNameObj[`s_${speedType}`]);
	});
	updateScoreDetailLabel(`Speed`, `avgS`, `${(avgX[0] * avgX[1]).toFixed(2)}x`, 2, g_lblNameObj.s_avg);

	/**
	 * 速度ポインタ位置の変更
	 * @param {number} _num 
	 */
	const changeSpdCursor = (_num = 1) => {
		speedPointIdx = nextPos(speedPointIdx, _num, speedPoints.length);
		movePointer(speedPoints[speedPointIdx]);
	}

	/**
	 * 速度ポインタの移動
	 * @param {number} _frame 
	 */
	const movePointer = _frame => {
		const canvasP = document.getElementById(`graphSpeed2`);
		const contextP = canvasP.getContext(`2d`);
		contextP.clearRect(0, 0, canvas.width, canvas.height);

		const offsetX = _frame * (g_limitObj.graphWidth - 30) / playingFrame + 30;
		const speed = { speed: 0, boost: 0 };

		Object.keys(speedObj).forEach(speedType => {
			const speedFrames = speedObj[speedType].frame.concat(Infinity);
			const speedIndex = speedObj[speedType].frame.findIndex((frame, i) => frame <= _frame && _frame < speedFrames[i + 1]);
			speed[speedType] = speedObj[speedType].speed[speedIndex];
			const y = (Math.min(Math.max(speed[speedType], _min - 0.05), _max + 0.05) - 1) * _a + _b;

			contextP.beginPath();
			contextP.fillStyle = g_graphColorObj[speedType];
			contextP.arc(offsetX, y, 5, 0, 360);
			contextP.closePath();
			contextP.fill();
		});
		calculateTotalSpeed(speed.speed, speed.boost, _frame);
	};

	// 速度計算用ラベルの再作成
	deleteDiv(detailSpeed, `btnSpdCursorL`);
	deleteDiv(detailSpeed, `btnSpdCursorR`);
	if (document.getElementById(`lblSpdHeader`) === null) {
		multiAppend(detailSpeed,
			createDivCss2Label(`lblSpdHeader`, `TotalSpeed`, g_lblPosObj.lblSpdHeader),
			createDivCss2Label(`lblSpdBase`, ``, g_lblPosObj.lblSpdBase),
			createDivCss2Label(`lblSpdOverall`, ``, g_lblPosObj.lblSpdOverall),
			createDivCss2Label(`lblSpdBoost`, ``, g_lblPosObj.lblSpdBoost),
			createDivCss2Label(`lblSpdTotal`, ``, g_lblPosObj.lblSpdTotal),
			createDivCss2Label(`lblSpdFrame`, ``, g_lblPosObj.lblSpdFrame),
		);
	}
	multiAppend(detailSpeed,
		createCss2Button(`btnSpdCursorL`, `<`, () => changeSpdCursor(-1),
			g_lblPosObj.btnSpdCursorL, g_cssObj.button_Mini),
		createCss2Button(`btnSpdCursorR`, `>`, () => changeSpdCursor(),
			g_lblPosObj.btnSpdCursorR, g_cssObj.button_Mini),
	);
	movePointer(0);
};

/**
 * 合計速度の表示更新
 * @param {number} _speed 
 * @param {number} _boost 
 * @param {number} _frame 
 */
const calculateTotalSpeed = (_speed = null, _boost = null, _frame = 0) => {
	if (document.getElementById(`lblSpdHeader`) === null) {
		return;
	}
	let speed, boost;
	if (_speed !== null && _boost !== null) {
		speed = _speed;
		boost = _boost;
		lblSpdOverall.textContent = `x${_speed.toFixed(2)}`;
		lblSpdBoost.textContent = `x${_boost.toFixed(2)}`;
	} else {
		speed = Number(lblSpdOverall.textContent.slice(1));
		boost = Number(lblSpdBoost.textContent.slice(1));
	}
	lblSpdBase.textContent = `${g_stateObj.speed.toFixed(2)}`;
	lblSpdTotal.textContent = `=${(g_stateObj.speed * speed * boost).toFixed(2)}`;
	lblSpdFrame.textContent = `[${transFrameToTimer(_frame + g_detailObj.startFrame[g_stateObj.scoreId])}]`;
};

/**
 * 譜面密度グラフの描画
 * @param {number} _scoreId 
 */
const drawDensityGraph = _scoreId => {

	const canvas = document.getElementById(`graphDensity`);
	const context = canvas.getContext(`2d`);
	drawBaseLine(context);
	for (let j = 0; j < g_limitObj.densityDivision; j++) {
		context.beginPath();
		[``, `2Push`, `3Push`].forEach(val => {
			context.fillStyle = (g_detailObj.maxDensity[_scoreId].includes(j) ? g_graphColorObj[`max${val}`] : g_graphColorObj[`default${val}`]);
			context.fillRect(16 * j * 16 / g_limitObj.densityDivision + 30, 195 - 9 * g_detailObj[`density${val}Data`][_scoreId][j] / 10,
				15.5 * 16 / g_limitObj.densityDivision, 9 * g_detailObj[`density${val}Diff`][_scoreId][j] / 10
			);
		});
		context.stroke();
	}

	const lineNames = [`Single`, `Chord`, `Triad+`];
	Object.keys(g_graphColorObj).filter(val => val.indexOf(`max`) !== -1).forEach((val, j) => {
		const lineX = 70 + j * 70;

		context.beginPath();
		context.lineWidth = 3;
		context.fillStyle = g_rankObj.rankColorAllPerfect;
		context.strokeStyle = g_graphColorObj[val];
		context.moveTo(lineX, 215);
		context.lineTo(lineX + 20, 215);
		context.stroke();
		context.font = `${wUnit(g_limitObj.difSelectorSiz)} ${getBasicFont()}`;
		context.fillText(lineNames[j], lineX + 20, 218);
	});

	const obj = getScoreBaseData(_scoreId);
	updateScoreDetailLabel(`Density`, `APM`, obj.apm, 0, g_lblNameObj.s_apm);
	updateScoreDetailLabel(`Density`, `Time`, obj.playingTime, 1, g_lblNameObj.s_time);
	updateScoreDetailLabel(`Density`, `Arrow`, obj.arrowCnts, 3, g_lblNameObj.s_arrow);
	updateScoreDetailLabel(`Density`, `Frz`, obj.frzCnts, 4, `${g_lblNameObj.s_frz}${g_headerObj.frzStartjdgUse ? ' <span class="common_bold">(2x)</span>' : ''}`);
};

/**
 * 譜面明細内の補足情報の登録・更新
 * @param {string} _name 表示する譜面明細のラベル
 * @param {string} _label 
 * @param {string} _value 
 * @param {number} [_pos=0] 表示位置
 * @param {string} [_labelname=_label]
 */
const updateScoreDetailLabel = (_name, _label, _value, _pos = 0, _labelname = _label) => {
	const baseLabel = (_bLabel, _bLabelname, _bAlign) =>
		document.getElementById(`detail${_name}`).appendChild(
			createDivCss2Label(_bLabel, _bLabelname, {
				x: 10, y: 130 + _pos * 16, w: 100, h: 16, siz: g_limitObj.difSelectorSiz, align: _bAlign,
			})
		);
	if (document.getElementById(`data${_label}`) === null) {
		baseLabel(`lbl${_label}`, `${_labelname}`, C_ALIGN_LEFT);
		baseLabel(`data${_label}`, `${_value}`, C_ALIGN_RIGHT);
	} else {
		document.getElementById(`data${_label}`).textContent = `${_value}`;
	}
};

/**
 * グラフの縦軸を描画
 * @param {CanvasRenderingContext2D} _context 
 * @param {number} [object._fixed=2] y座標）目盛表記する小数桁数
 * @param {string} [object._mark=''] y座標）目盛の単位
 * @param {number} [object._resolution=10] y座標）明細分割数
 * @param {number} [object._a=-90]
 * @param {number} [object._b=105]
 * @param {number} [object._min=0] y座標）目盛の下限値
 * @param {number} [object._max=2] y座標）目盛の上限値
 */
const drawBaseLine = (_context, { _fixed = 2, _mark = ``, _resolution = 10, _a = -90, _b = 105, _min = 0, _max = 2 } = {}) => {
	_context.clearRect(0, 0, g_limitObj.graphWidth, g_limitObj.graphHeight);

	for (let j = _min * _resolution; j <= _max * _resolution; j += 5) {
		for (let k = 0; k < 5; k++) {
			if ((j + k) % 5 === 0) {
				drawLine(_context, (j + k) / _resolution, `main`, { _fixed, _mark, _a, _b });
			} else {
				drawLine(_context, (j + k) / _resolution, `sub`, { _fixed, _mark, _a, _b });
			}
		}
	}
};

/**
 * グラフ上に目盛を表示
 * @param {CanvasRenderingContext2D} _context 
 * @param {number} _y 
 * @param {string} _lineType 
 * @param {number} [object._fixed] y座標）目盛表記する小数桁数
 * @param {string} [object._mark] y座標）目盛の単位
 * @param {number} [object._a]
 * @param {number} [object._b]
 */
const drawLine = (_context, _y, _lineType, { _fixed, _mark, _a, _b } = {}) => {
	const lineY = (_y - 1) * _a + _b;
	_context.beginPath();
	_context.moveTo(30, lineY);
	_context.lineTo(g_limitObj.graphWidth, lineY);
	_context.lineWidth = 1;

	if (_lineType === `main`) {
		const textBaseObj = document.getElementById(`lnkDifficulty`);
		const textColor = window.getComputedStyle(textBaseObj, ``).color;
		_context.strokeStyle = textColor;
		_context.font = `${wUnit(12)} ${getBasicFont()}`;
		_context.fillStyle = textColor;
		_context.fillText(_y.toFixed(_fixed) + _mark, 2, lineY + 4);
	} else {
		_context.strokeStyle = `#646464`;
	}
	_context.stroke();
};

/**
 * 譜面の難易度情報用ラベル作成
 * @param {number} _scoreId 
 */
const makeDifInfoLabels = _scoreId => {

	// ツール難易度
	const detailToolDif = document.getElementById(`detailToolDif`);
	/**
	 * 譜面の難易度情報ラベルの作成
	 * @param {string} _lbl 
	 * @param {string} _data 
	 * @param {object} _obj 
	 * @returns {HTMLDivElement}
	 */
	const makeDifInfoLabel = (_lbl, _data, { x = 130, y = 25, w = 125, h = 35, siz = g_limitObj.difSelectorSiz, ...rest } = {}) =>
		createDivCss2Label(_lbl, _data, { x, y, w, h, siz, align: C_ALIGN_LEFT, ...rest });

	let printData = ``;
	for (let j = 0; j < g_detailObj.arrowCnt.length; j++) {
		const obj = getScoreBaseData(j);
		printData +=
			// 譜面番号
			`[${j + 1}]\t` +
			// ツール値
			`${g_detailObj.toolDif[j].tool}\t` +
			// 同時
			`${g_detailObj.toolDif[j].douji}\t` +
			// 縦連
			`${g_detailObj.toolDif[j].tate}\t` +
			// 総矢印数
			`${(obj.arrowCnts + obj.frzCnts)}\t` +
			// 矢印
			`${obj.arrowCnts}\t` +
			// フリーズアロー
			`${obj.frzCnts}\t` +
			// APM
			`${obj.apm}\t` +
			// 時間(分秒)
			`${obj.playingTime}\r\n`;
	}
	multiAppend(detailToolDif,
		makeDifInfoLabel(`lblTooldif`, g_lblNameObj.s_level, g_lblPosObj.lblTooldif),
		makeDifInfoLabel(`dataTooldif`, ``, g_lblPosObj.dataTooldif),
		makeDifInfoLabel(`lblDouji`, g_lblNameObj.s_douji, g_lblPosObj.lblDouji),
		makeDifInfoLabel(`lblTate`, g_lblNameObj.s_tate, g_lblPosObj.lblTate),
		makeDifInfoLabel(`dataDouji`, ``, g_lblPosObj.dataDouji),
		makeDifInfoLabel(`dataTate`, ``, g_lblPosObj.dataTate),
		makeDifInfoLabel(`lblArrowInfo`, g_lblNameObj.s_cnts, g_lblPosObj.lblArrowInfo),
		makeDifInfoLabel(`dataArrowInfo`, ``, g_lblPosObj.dataArrowInfo),
		makeDifInfoLabel(`lblArrowInfo2`, ``, g_lblPosObj.lblArrowInfo2),
		makeDifInfoLabel(`dataArrowInfo2`, ``, g_lblPosObj.dataArrowInfo2),
		makeDifLblCssButton(`lnkDifInfo`, g_lblNameObj.s_print, 8, () => {
			copyTextToClipboard(
				`****** ${g_lblNameObj.s_printTitle} [${g_version}] ******\r\n\r\n`
				+ `\t${g_lblNameObj.s_printHeader}\r\n\r\n${printData}`, g_msgInfoObj.I_0003
			);
		}, g_lblPosObj.lnkDifInfo),
	);
	createScText(lnkDifInfo, `DifInfo`, { targetLabel: `lnkDifInfo`, x: -10 });
};

/**
 * 譜面の難易度情報更新
 * @param {number} _scoreId 
 */
const makeDifInfo = _scoreId => {

	const arrowCnts = sumData(g_detailObj.arrowCnt[_scoreId]);
	const frzCnts = sumData(g_detailObj.frzCnt[_scoreId].map(val => Math.floor(val)));
	const push3CntStr = (g_detailObj.toolDif[_scoreId].push3.length === 0 ? `None` : `(${g_detailObj.toolDif[_scoreId].push3.join(', ')})`);

	if (document.getElementById(`lblTooldif`) === null) {
		makeDifInfoLabels(_scoreId);
	}
	dataTooldif.textContent = g_detailObj.toolDif[_scoreId].tool;
	dataDouji.textContent = g_detailObj.toolDif[_scoreId].douji;
	dataTate.textContent = g_detailObj.toolDif[_scoreId].tate;
	lblArrowInfo2.innerHTML = g_lblNameObj.s_linecnts.split(`{0}`)
		.join(`${makeDedupliArray(g_detailObj.toolDif[_scoreId].push3).length} /cnt:${g_detailObj.toolDif[_scoreId].push3cnt}`);
	dataArrowInfo.innerHTML = `${arrowCnts + frzCnts * (g_headerObj.frzStartjdgUse ? 2 : 1)} 
	<span style="font-size:${wUnit(g_limitObj.difSelectorSiz)};">(${arrowCnts} + ${frzCnts}${g_headerObj.frzStartjdgUse ? ' <span class="common_bold">x 2</span>' : ''})</span>`;

	const makeArrowCntsView = (_cntlist) => {
		const targetKey = g_headerObj.keyLabels[_scoreId];
		const cntlist = [
			_cntlist.filter((val, j) =>
				g_keyObj[`pos${targetKey}_0`][j] < g_keyObj[`div${targetKey}_0`]),
			_cntlist.filter((val, j) =>
				g_keyObj[`pos${targetKey}_0`][j] >= g_keyObj[`div${targetKey}_0`])
		];

		let cntlistStr = ``;
		cntlist.filter(array => array.length > 0).forEach(array => {
			const maxVal = array.reduce((a, b) => Math.max(a, b));
			const minVal = array.reduce((a, b) => Math.min(a, b));

			cntlistStr += `[ `;
			array.forEach((val, j) => {
				if (maxVal !== minVal) {
					array[j] = (val === minVal ? `<span class="settings_minArrowCnts">${val}</span>` :
						(val === maxVal ? `<span class="settings_maxArrowCnts common_bold">${val}</span>` : val));
				}
				if (val - Math.floor(val) > 0) {
					array[j] = `<span class="keyconfig_warning">${val}</span>`;
				}
			});
			cntlistStr += array.join(`, `) + ` ]`;
		});

		return cntlistStr;
	}

	dataArrowInfo2.innerHTML = `<br>${makeArrowCntsView(g_detailObj.arrowCnt[_scoreId])}<br><br>
			${makeArrowCntsView(g_detailObj.frzCnt[_scoreId])}<br><br>${push3CntStr}`;
};

/**
 * ハイスコア表示
 * @param {number} _scoreId 
 */
const makeHighScore = _scoreId => {
	const detailHighScore = document.getElementById(`detailHighScore`);

	// 再描画のため一度クリア
	deleteChildspriteAll(`detailHighScore`);

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const assistFlg = (g_autoPlaysBase.includes(g_stateObj.autoPlay) ? `` : `-${getStgDetailName(g_stateObj.autoPlay)}${getStgDetailName('less')}`);
	const mirrorName = (g_stateObj.shuffle === C_FLG_OFF ? `` : `-${g_stateObj.shuffle}`);
	const transKeyName = getTransKeyName();
	let scoreName = getStorageKeyName(g_headerObj.keyLabels[_scoreId], transKeyName, assistFlg, mirrorName, _scoreId);

	if (!hasVal(g_localStorage.highscores?.[scoreName])) {

		// 古いキー定義の情報を検索
		const relatedKeys = Object.entries(g_keyObj.keyTransPattern)
			.filter(([key, value]) => value === g_headerObj.keyLabels[_scoreId])
			.map(([key]) => key);

		// 古いキー定義のハイスコアがいる場合は、現行キー定義として表示
		for (const legacyKey of relatedKeys) {
			let tmpScoreName = getStorageKeyName(legacyKey, transKeyName, assistFlg, mirrorName, _scoreId);
			const src = g_localStorage.highscores?.[tmpScoreName];
			if (hasVal(src)) {
				g_localStorage.highscores[scoreName] = structuredClone(src);
				break;
			}
		}
	}

	const createScoreLabel = (_id, _text, { xPos = 0, yPos = 0, dx = 0, w = 150, h = 17, colorName = _id, align = C_ALIGN_LEFT, overflow = `visible` } = {}) =>
		createDivCss2Label(`lblH${toCapitalize(_id)}`, _text, {
			x: xPos * 150 + 130 + dx, y: yPos * 16 + 5, w, h, siz: 14, align, overflow,
		}, g_cssObj[`common_${colorName}`]);

	const charas = [
		`ii`, `shakin`, `matari`, `shobon`, `uwan`, `kita`, `iknai`, `maxCombo`, `fmaxCombo`, ``, `score`,
	];
	const extData = {
		fast: `diffFast`, slow: `diffSlow`, adj: `estAdj`, excessive: `excessive`,
	};
	// 各判定 (FreezeComboとScoreの間に1行の空白を入れる)
	charas.forEach((chara, j) => {
		if (chara === ``) {
			return;
		}
		multiAppend(detailHighScore,
			createScoreLabel(chara, g_lblNameObj[`j_${chara}`], { yPos: j }),
			createScoreLabel(`${chara}S`, g_localStorage.highscores?.[scoreName]?.[chara] ?? C_FLG_HYPHEN,
				{ xPos: 0, yPos: j, align: C_ALIGN_RIGHT }),
		);
	});
	// Fast, Slow, 推定Adj, Excessive (値が無ければスキップ)
	Object.keys(extData).forEach((chara, j) => {
		if (!hasVal(g_localStorage.highscores?.[scoreName]?.[chara], C_FLG_HYPHEN)) {
			return;
		}
		multiAppend(detailHighScore,
			createScoreLabel(chara, g_lblNameObj[`j_${chara}`], { xPos: 1, yPos: j, dx: 20, colorName: extData[chara] }),
			createScoreLabel(`${chara}S`, g_localStorage.highscores?.[scoreName]?.[chara],
				{ xPos: 1, yPos: j, dx: -25, align: C_ALIGN_RIGHT }),
		);
	});
	if (hasVal(g_localStorage.highscores?.[scoreName]?.adj)) {
		multiAppend(detailHighScore, createScoreLabel(`adjF`, `f`, { xPos: 2, yPos: 2, dx: -23 }));
	}

	// カスタム表示 (resultValsViewに指定した表示のみ)
	g_headerObj.resultValsView
		.filter(key => hasVal(g_localStorage.highscores?.[scoreName]?.[g_presetObj.resultVals?.[key]]))
		.forEach((key, j) => {
			multiAppend(detailHighScore,
				createScoreLabel(key, g_presetObj.resultVals[key], { xPos: 1, yPos: j + 5, dx: 20 }),
				createScoreLabel(`${key}S`, g_localStorage.highscores?.[scoreName]?.[g_presetObj.resultVals[key]],
					{ xPos: 1, yPos: j + 5, dx: -25, align: C_ALIGN_RIGHT }),
			);
		});
	// ランク、クリアランプ、特殊設定条件
	multiAppend(detailHighScore,
		createDivCss2Label(`lblHRank`, g_localStorage.highscores?.[scoreName]?.rankMark ?? `--`, {
			...g_lblPosObj.lblHRank,
			color: g_localStorage.highscores?.[scoreName]?.rankColor ?? `#666666`,
			fontFamily: getBasicFont(`"Bookman Old Style"`),
		}),
		createScoreLabel(`lblHDateTime`, g_localStorage.highscores?.[scoreName]?.dateTime ?? `----/--/-- --:--`, { yPos: 12 }),
		createScoreLabel(`lblHMarks`,
			`${g_localStorage.highscores?.[scoreName]?.fullCombo ?? '' ? '<span class="result_FullCombo">◆</span>' : ''}` +
			`${g_localStorage.highscores?.[scoreName]?.perfect ?? '' ? '<span class="result_Perfect">◆</span>' : ''}` +
			`${g_localStorage.highscores?.[scoreName]?.allPerfect ?? '' ? '<span class="result_AllPerfect">◆</span>' : ''}`, { xPos: 1, dx: 20, yPos: 12, w: 100, align: C_ALIGN_CENTER }),
		createScoreLabel(`lblHClearLamps`, `Cleared: ` + (g_localStorage.highscores?.[scoreName]?.clearLamps?.join(', ') ?? C_FLG_HYPHEN), { yPos: 13, overflow: C_DIS_AUTO, w: g_sWidth / 2 + 40, h: 37 }),

		createScoreLabel(`lblHShuffle`, g_stateObj.shuffle.indexOf(`Mirror`) < 0 ? `` : `Shuffle: <span class="common_shuffle">${g_stateObj.shuffle}</span>`, { yPos: 11.5, dx: -130 }),
		createScoreLabel(`lblHAssist`, g_autoPlaysBase.includes(g_stateObj.autoPlay) ? `` : `Assist: <span class="common_assist">${g_stateObj.autoPlay}</span>`, { yPos: 12.5, dx: -130 }),
		createScoreLabel(`lblHAnother`, !hasVal(g_keyObj[`transKey${keyCtrlPtn}`]) ? `` : `A.Keymode: <span class="common_another">${g_keyObj[`transKey${keyCtrlPtn}`]}</span>`, { yPos: 13.5, dx: -130 }),
	);

	// 結果をクリップボードへコピー (ハイスコア保存分)
	if (g_localStorage.highscores?.[scoreName] !== undefined) {
		const twiturl = new URL(g_localStorageUrlOrg);
		twiturl.searchParams.append(`scoreId`, _scoreId);
		const baseTwitUrl = g_isLocal ? `` : `${twiturl.toString()}`.replace(/[\t\n]/g, ``);

		let tweetFrzJdg = ``;
		let tweetMaxCombo = `${g_localStorage.highscores?.[scoreName]?.maxCombo}`;
		if (sumData(g_detailObj.frzCnt[_scoreId]) > 0) {
			tweetFrzJdg = `${g_localStorage.highscores?.[scoreName]?.kita}-${g_localStorage.highscores?.[scoreName]?.iknai}`;
			tweetMaxCombo += `-${g_localStorage.highscores?.[scoreName]?.fmaxCombo}`;
		}

		const musicTitle = g_headerObj.musicTitles[g_headerObj.musicNos[_scoreId]] || g_headerObj.musicTitle;
		let tweetDifData = `${getKeyName(g_headerObj.keyLabels[_scoreId])}${transKeyName}${getStgDetailName('k-')}${g_headerObj.difLabels[_scoreId]}${assistFlg}`;
		if (g_stateObj.shuffle !== `OFF`) {
			tweetDifData += `:${getStgDetailName(g_stateObj.shuffle)}`;
		}

		const storedExcessive = g_localStorage.highscores[scoreName]?.excessive;
		const resultParams = {
			hashTag: (hasVal(g_headerObj.hashTag) ? ` ${g_headerObj.hashTag}` : ``),
			tuning: g_headerObj.creatorNames[_scoreId],
			rankMark: g_localStorage.highscores?.[scoreName]?.rankMark || `--`,
			playStyleData: g_localStorage.highscores[scoreName]?.playStyle || `--`,
			highscore: g_localStorage.highscores[scoreName],
			tweetExcessive: hasVal(storedExcessive, C_FLG_HYPHEN) ? `(+${storedExcessive})` : ``,
			musicTitle, tweetDifData, tweetFrzJdg, tweetMaxCombo, baseTwitUrl,
		};
		const resultCommon = unEscapeHtml(makeResultText(g_templateObj.resultFormatDf, resultParams));
		let tweetResultTmp = makeResultText(g_headerObj.resultFormat, resultParams);
		if (g_presetObj.resultVals !== undefined) {
			Object.keys(g_presetObj.resultVals).forEach(key =>
				tweetResultTmp = tweetResultTmp.split(`[${key}]`).join(g_localStorage.highscores[scoreName][g_presetObj.resultVals[key]] || ``));
		}
		const resultText = `${unEscapeHtml(tweetResultTmp)}`;
		multiAppend(detailHighScore,
			makeDifLblCssButton(`lnkResetHighScore`, g_lblNameObj.s_resetResult, 7, () => {
				if (window.confirm(g_msgObj.highscResetConfirm)) {
					delete g_localStorage.highscores[scoreName];
					makeHighScore(_scoreId);
				}
			}, { ...g_lblPosObj.lnkHighScore, btnStyle: `Reset` }),
			makeDifLblCssButton(`lnkHighScore`, g_lblNameObj.s_result, 8, () => {
				copyTextToClipboard(keyIsShift() ? resultCommon : resultText, g_msgInfoObj.I_0001);
			}, g_lblPosObj.lnkHighScore),
		);
	}
};

/**
 * 譜面ミニマップを描画し、適切なスクロール位置へ調整する。
 * デフォルトはスクロール反転で、現在位置を保つように上下反転する。
 * @param {string} _scoreId - 描画対象の譜面ID
 * @param {object} [_options={}] - オプションパラメータ
 * @param {boolean} [_options._initFlg=false] - 譜面切替モード
 * - 前の譜面での演奏進行度（時間軸の比率）を算出し、新しい譜面でも同じ進行位置を表示する。
 *   位置記憶がない場合はフェードイン設定に基づく初期位置を表示。
 * @param {boolean} [_options._fadeinFlg=false] - フェードインモード。フェードイン設定値を優先して移動する。
 */
const drawMinimap = (_scoreId, { _initFlg = false, _fadeinFlg = false } = {}) => {
	const detailMiniMap = document.getElementById(`detailMiniMap`);
	if (detailMiniMap === null) return;   // scoreDetailUse=false 等で未生成の場合は何もしない

	const isRev = g_stateObj.miniMapRevFlg;
	const subEl = document.getElementById(`detailMiniMapSub`);
	const currentScrollTop = subEl ? subEl.scrollTop : 0;

	// 前の譜面でスクロール可能な状態だったかを判定
	const hasPreviousScrollRange = subEl && subEl.scrollHeight > subEl.clientHeight;

	// 前の譜面での「スクロール位置の比率」を計算
	// 完全に一番上のときは 0、一番下のときは 1 となる比率
	let progressRatio = 0;
	if (hasPreviousScrollRange) {
		const rawRatio = currentScrollTop / (subEl.scrollHeight - subEl.clientHeight);
		// リバース時は「上が終点」なので、進行度としては反転させる
		progressRatio = isRev ? (1.0 - rawRatio) : rawRatio;
	}

	// 再描画のため一度クリア
	deleteChildspriteAll(`detailMiniMap`);

	// --- ミニマップ生成/取得 (Lazy Generation) ---
	let savedCanvases = isRev
		? g_detailObj.scoreMinimapReverse[_scoreId]
		: g_detailObj.scoreMinimap[_scoreId];

	const params = g_detailObj.miniMapParams[_scoreId];
	const kPtn = params._keyCtrlPtn;
	if (!g_detailObj.scoreMinimapHeader[kPtn]) {
		// ヘッダーはキー種ごとに共通なので、未作成の場合のみ生成してキャッシュ
		g_detailObj.scoreMinimapHeader[kPtn] = createMinimapHeader(params.config, kPtn, params._keyNum);
	}
	if (!savedCanvases) {
		// 未作成の場合のみミニマップを生成（Lazy Generation）
		savedCanvases = generateMinimapData(params, isRev);

		// 生成したものをキャッシュに保存
		if (isRev) {
			g_detailObj.scoreMinimapReverse[_scoreId] = savedCanvases;
		} else {
			g_detailObj.scoreMinimap[_scoreId] = savedCanvases;
		}
	}

	// --- ヘッダー部分 ---
	const detailMiniMapHeader = createEmptySprite(detailMiniMap, `detailMiniMapHeader`, g_windowObj.detailMiniMapHeader);
	$id(`detailMiniMapHeader`).top = wUnit(g_stateObj.miniMapRevFlg ? 230 + g_sHeight - 500 : 0);
	detailMiniMapHeader.appendChild(g_detailObj.scoreMinimapHeader[kPtn]);

	// --- メイン（譜面）部分 ---
	const detailMiniMapSub = createEmptySprite(detailMiniMap, `detailMiniMapSub`, g_windowObj.detailMiniMapSub);
	$id(`detailMiniMapSub`).top = wUnit(g_stateObj.miniMapRevFlg ? 0 : 15);

	Object.assign(detailMiniMapSub.style, {
		overflowX: 'hidden',
		overflowY: 'auto',
		pointerEvents: 'auto',
		display: 'block',
		textAlign: 'left',
	});

	if (savedCanvases && Array.isArray(savedCanvases)) {
		// 退避したCanvasそのものをDOMに追加（再描画不要で高速）
		savedCanvases.forEach(canvas => {
			Object.assign(canvas.style, { position: 'static', display: 'block', height: 'auto' });
			detailMiniMapSub.appendChild(canvas);
		});
	}
	const scrollHeight = Math.max(detailMiniMapSub.scrollHeight - detailMiniMapSub.clientHeight, 0);
	const playingFrame = Math.max(g_detailObj.playingFrame[_scoreId], 1);
	const lastFrame = g_detailObj.startFrame[_scoreId] + g_detailObj.playingFrameWithBlank[_scoreId];
	const firstArrowFrame = lastFrame - g_detailObj.playingFrame[_scoreId];
	const fadeinFrameOffset = Math.max(0, Math.min(
		playingFrame,
		getStartFrame(lastFrame, g_stateObj.fadein, _scoreId) - firstArrowFrame
	));
	const fadeinScrollTop = scrollHeight * fadeinFrameOffset / playingFrame;
	const visualFadeinPos = isRev ? scrollHeight - fadeinScrollTop : fadeinScrollTop;

	// --- スクロール位置の決定ロジック
	let targetScrollTop = 0;

	if (_fadeinFlg) {
		// 【最優先】フェードイン操作時：設定値を強制適用
		targetScrollTop = visualFadeinPos;
	} else if (_initFlg) {
		// 【譜面切替時】
		if (hasPreviousScrollRange) {
			// 以前の進行度を継承
			const visualRatio = isRev ? (1.0 - progressRatio) : progressRatio;
			targetScrollTop = scrollHeight * visualRatio;
		} else {
			// 初回はフェードイン位置
			targetScrollTop = visualFadeinPos;
		}
	} else {
		// 【リバース切替時】物理反転
		targetScrollTop = scrollHeight - currentScrollTop;
	}
	detailMiniMapSub.scrollTop = targetScrollTop;

	if (document.getElementById(`lnkMiniMapRev`) === null) {
		scoreDetail.appendChild(
			makeDifLblCssButton(`lnkMiniMapRev`, g_lblNameObj.s_rev + `${g_stateObj.miniMapRevFlg ? `↑` : `↓`}`, 8, () => {
				g_stateObj.miniMapRevFlg = !g_stateObj.miniMapRevFlg;
				lnkMiniMapRev.textContent = g_lblNameObj.s_rev + `${g_stateObj.miniMapRevFlg ? `↑` : `↓`}`;
				drawMinimap(g_stateObj.scoreId);
				createScText(lnkMiniMapRev, `MiniMapRev`, { targetLabel: `lnkMiniMapRev`, x: -12 });
			}, g_lblPosObj.lnkMiniMapRev)
		);
		createScText(lnkMiniMapRev, `MiniMapRev`, { targetLabel: `lnkMiniMapRev`, x: -12 });
	}
};

/**
 * 指定したキー名のキー別ストレージオブジェクトを取得
 * @param {string} _keyName
 * @returns {[Object, string]} [storageObj, addKey]
 */
const getKeyStorageObjByName = (_keyName) => {
	if (g_headerObj.keyExtraList.includes(_keyName)) {
		return [g_localStorage, _keyName];
	}
	return [parseStorageData(`danonicw-${_keyName}k`, {
		reverse: C_FLG_OFF, keyCtrl: [[]], keyCtrlPtn: 0, setColor: [],
	}), ``];
};

/**
 * 別キーモード時、移行先キーが保持するSelf保存パターンの取得可否チェック
 * @param {string} _keyCtrlPtn 例: "7_2"
 * @returns {number[][]|undefined} 適用可能な場合はSelf保存済みkeyCtrl配列、不可ならundefined
 */
const getTransKeySelfCtrl = (_keyCtrlPtn) => {
	const transKeyName = g_keyObj[`transKey${_keyCtrlPtn}`];
	const transKeyPtn = g_keyObj[`transKeyPtn${_keyCtrlPtn}`];
	if (!hasVal(transKeyName) || transKeyPtn === undefined) {
		return undefined;
	}
	const [storageObj, addKey] = getKeyStorageObjByName(transKeyName);
	const savedCtrl = storageObj[`keyCtrl${addKey}`];
	const savedPtn = storageObj[`keyCtrlPtn${addKey}`];

	if (savedPtn !== transKeyPtn) {
		return undefined;
	}

	// 現在のキー配置(基準形状)とレーン数・各レーン長が完全一致することを確認
	const baseCtrl = g_keyObj[`keyCtrl${_keyCtrlPtn}`];
	const isValidShape = hasArrayList(savedCtrl, baseCtrl.length) &&
		savedCtrl.length === baseCtrl.length &&
		baseCtrl.every((lane, j) => hasArrayList(savedCtrl[j], lane.length) && savedCtrl[j].length === lane.length);

	return isValidShape ? savedCtrl : undefined;
};

/**
 * 別キーモードの移行先Selfパターンを現在のキー配置へ反映（保存はしない）
 */
const applyTransKeySelfPattern = () => {
	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const savedCtrl = getTransKeySelfCtrl(keyCtrlPtn);
	if (savedCtrl === undefined) {
		return;
	}
	const baseKeyNum = g_keyObj[`${g_keyObj.defaultProp}${keyCtrlPtn}`].length;
	for (let j = 0; j < baseKeyNum; j++) {
		for (let k = 0; k < (savedCtrl[j]?.length ?? 0); k++) {
			g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k] = setIntVal(savedCtrl[j][k], 0);
		}
	}
	keyConfigInit();
};

/**
 * 譜面初期化処理
 * - 譜面の基本設定（キー数、初期速度、リバース、ゲージ設定）をここで行う
 * - g_canLoadDifInfoFlg は譜面初期化フラグで、初期化したくない場合は対象画面にて false にしておく
 *   (Display設定画面、キーコンフィグ画面では通常OFF)
 *   この関数を実行後、このフラグはONに戻るようになっている 
 * - [キーコン]->[初期化]->[名称設定]の順に配置する。
 *   初期化処理にてキー数関連の設定を行っているため、この順序で無いとデータが正しく格納されない
 * 
 * @param {boolean} _initFlg
 */
const setDifficulty = (_initFlg) => {

	// ---------------------------------------------------
	// 1. キーコンフィグ設定 (KeyConfig)
	g_keyObj.currentKey = g_headerObj.keyLabels[g_stateObj.scoreId];
	const isNotSameKey = (g_keyObj.prevKey !== g_keyObj.currentKey);

	if (g_headerObj.dummyScoreNos !== undefined) {
		g_stateObj.dummyId = setIntVal(g_headerObj.dummyScoreNos[g_stateObj.scoreId], ``);
	}
	// 特殊キーフラグ
	g_stateObj.extraKeyFlg = g_headerObj.keyExtraList.includes(g_keyObj.currentKey);

	// ---------------------------------------------------
	// 2. 初期化設定

	// 保存した設定の再読込条件（設定画面切り替え時はスキップ）
	// ローカルストレージで保存した設定を呼び出し
	if ((g_canLoadDifInfoFlg && (isNotSameKey && g_stateObj.dataSaveFlg)) || _initFlg) {

		if (isNotSameKey && g_keyObj.prevKey !== `Dummy`) {
			// キーパターン初期化
			g_keyObj.currentPtn = 0;
			g_keycons.keySwitchNum = 0;
		}
		const [storageObj, addKey] = getKeyStorageObjByName(g_keyObj.currentKey);
		if (isNotSameKey) {
			if (!g_stateObj.extraKeyFlg) {
				g_localKeyStorage = storageObj;
			}
			getKeyReverse(storageObj, addKey);

			// キーコンフィグ初期値設定
			if (storageObj[`keyCtrlPtn${addKey}`] === undefined) {
				storageObj[`keyCtrlPtn${addKey}`] = 0;
			}
			getKeyCtrl(storageObj, addKey);

			// カラーセット初期値設定
			if (storageObj[`setColor${addKey}`] === undefined) {
				storageObj[`setColor${addKey}`] = [];
			}
			if (storageObj[`setColor${addKey}`].length > 0) {
				g_keycons.colorTypes = addValtoArray(g_keycons.colorTypes, g_keycons.colorSelf);
				resetColorType({ _fromObj: storageObj, _from: addKey, _to: g_keycons.colorSelf });
				resetColorType({ _fromObj: storageObj, _from: addKey, _toObj: g_dfColorObj, _to: g_keycons.colorSelf });

			} else {
				if (g_localStorage.colorType === g_keycons.colorSelf) {
					g_colorType = `Default`;
				}
				g_keycons.colorTypes = g_keycons.colorTypes.filter(val => val !== g_keycons.colorSelf);
			}

			const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;

			// カラーグループ、シャッフルグループの設定
			g_keycons.groups.forEach(type => {
				resetGroupList(type, keyCtrlPtn);
				if (g_keyObj.currentPtn === -1) {
					const storageKeyName = storageObj[`${type}${addKey}`] || storageObj[`${type}${g_keyObj.currentKey}_-1_-1`];
					if (storageKeyName !== undefined) {
						g_keyObj[`${type}${g_keyObj.currentKey}_-1`] = structuredClone(storageKeyName);
					}
					g_keyObj[`${type}${g_keyObj.currentKey}_-1_-1`] = structuredClone(g_keyObj[`${type}${g_keyObj.currentKey}_-1`]);
				} else {
					g_keyObj[`${type}${keyCtrlPtn}`] = structuredClone(g_keyObj[`${type}${keyCtrlPtn}_0`]);
				}
			});

		}
		// 曲中ショートカットキーの切り替え
		setPlayingShortcut();
	}

	// スクロール設定用の配列を入れ替え
	g_settings.scrolls = structuredClone(
		typeof g_keyObj[`scrollDir${g_keyObj.currentKey}_${g_keyObj.currentPtn}`] === C_TYP_OBJECT ?
			Object.keys(g_keyObj[`scrollDir${g_keyObj.currentKey}_${g_keyObj.currentPtn}`]) : g_keyObj.scrollName_def
	);

	// アシスト設定の配列を入れ替え
	g_settings.autoPlays = (typeof g_keyObj[`assistPos${g_keyObj.currentKey}_${g_keyObj.currentPtn}`] === C_TYP_OBJECT ?
		g_autoPlaysBase.concat(Object.keys(g_keyObj[`assistPos${g_keyObj.currentKey}_${g_keyObj.currentPtn}`])) :
		g_autoPlaysBase.concat());

	// ゲージ設定及びカーソル位置調整
	setGauge(0, true);

	// 速度、スクロール、アシスト設定のカーソル位置調整
	if (_initFlg) {
		g_stateObj.speed = g_headerObj.initSpeeds[g_stateObj.scoreId];
		g_settings.speedNum = getCurrentNo(g_settings.speeds, g_stateObj.speed);
	}
	g_settings.scrollNum = getCurrentNo(g_settings.scrolls, g_stateObj.scroll);
	g_settings.autoPlayNum = getCurrentNo(g_settings.autoPlays, g_stateObj.autoPlay);


	// 選択中のキーのヘルプ表示
	const targetKeymode = hasVal(g_keyObj[`transKey${g_keyObj.currentKey}_${g_keyObj.currentPtn}`])
		? g_keyObj[`transKey${g_keyObj.currentKey}_${g_keyObj.currentPtn}`] : g_keyObj.currentKey;
	btnKeymodeHelp.classList.remove(g_cssObj.button_Setting, g_cssObj.button_Tweet);
	btnKeymodeHelp.classList.add(
		g_cssObj[`button_${targetKeymode !== g_keyObj.currentKey
			&& (g_keyObj.defaultKeyList.includes(targetKeymode) || g_lblNameObj[`keyHelp${targetKeymode}`]) ? `Tweet` : `Setting`}`]
	);
	btnKeymodeHelp.style.display = (
		g_keyObj.defaultKeyList.includes(targetKeymode) || g_lblNameObj[`keyHelp${targetKeymode}`]
			? `` : C_DIS_NONE
	);

	// ---------------------------------------------------
	// 3. 名称の設定

	// 譜面名設定 (Difficulty)
	const difWidth = parseFloat(lnkDifficulty.style.width) - 20;
	const transKeyName = getTransKeyName();
	const keyUnitName = getStgDetailName(getKeyUnitName(g_keyObj.currentKey));

	const prefix = `${getKeyName(g_keyObj.currentKey)}${transKeyName} ${keyUnitName} / `;
	let difLabel = `${g_headerObj.difLabels[g_stateObj.scoreId]}`;

	const [difName, difSiz] = getFontSizeMulti(difLabel, difWidth, { maxSiz: g_limitObj.setLblSiz, prefix });
	lnkDifficulty.style.fontSize = wUnit(difSiz);

	const difNames = [difName];
	if (g_headerObj.makerView) {
		difNames.push(`(${g_headerObj.creatorNames[g_stateObj.scoreId]})`);
		difNames.forEach((difName, j) => {
			const tmpSize = getFontSize2(difName, difWidth);
			difNames[j] = `<span style="font-size:${wUnit(tmpSize)}">${difName}</span>`;
		});
	}
	lnkDifficulty.innerHTML = difNames.join(``);

	// 速度設定 (Speed)
	setSetting(0, `speed`, { unitName: ` ${g_lblNameObj.multi}` });

	// リバース設定 (Reverse, Scroll)
	if (g_headerObj.scrollUse) {
		g_stateObj.scroll = g_settings.scrolls[g_settings.scrollNum];
		const [visibleScr, hiddenScr] = (g_settings.scrolls.length > 1 ? [`scroll`, `reverse`] : [`reverse`, `scroll`]);
		document.getElementById(`${visibleScr}Sprite`).style.display = C_DIS_INHERIT;
		document.getElementById(`${hiddenScr}Sprite`).style.display = C_DIS_NONE;
		setSetting(0, visibleScr);

		g_shortcutObj.option.KeyR.id = g_settings.scrolls.includes(C_FLG_REVERSE) ?
			g_shortcutObj.option.KeyR.exId : g_shortcutObj.option.KeyR.dfId;

		if (g_settings.scrolls.length > 1) {
			setReverseView(document.getElementById(`btnReverse`));
		}
	} else {
		g_settings.scrolls = structuredClone(g_keyObj.scrollName_def);
		setSetting(0, `reverse`);
	}

	// オート・アシスト設定 (AutoPlay)
	g_stateObj.autoPlay = g_settings.autoPlays[g_settings.autoPlayNum];
	lnkAutoPlay.textContent = getStgDetailName(g_stateObj.autoPlay);

	// 譜面毎のExcessive再設定（意図的に変更した場合のみ元に戻さない）
	if (g_canLoadDifInfoFlg && (g_stateObj.excessiveScoreId !== g_stateObj.scoreId)) {
		g_headerObj.excessiveJdgUse = g_headerObj.excessiveJdgUses[g_stateObj.scoreId];
		g_stateObj.excessive = boolToSwitch(g_headerObj.excessiveJdgUse);
	}
	g_headerObj.excessiveUse = g_headerObj.excessiveUses[g_stateObj.scoreId];
	if (g_headerObj.excessiveUse) {
		setExcessive(document.getElementById(`lnkExcessive`), g_stateObj.excessive === C_FLG_ON);
		lblExcessive.style.display = C_DIS_NONE;
		lnkExcessive.style.display = C_DIS_INHERIT;
	} else {
		g_stateObj.excessiveChgFlg = false;
		lblExcessive.style.display = (g_headerObj.excessiveJdgUses[g_stateObj.scoreId] ? C_DIS_INHERIT : C_DIS_NONE);
		lnkExcessive.style.display = C_DIS_NONE;
	}

	// 譜面明細画面の再描画
	if (g_settings.scoreDetails.length > 0) {
		drawSpeedGraph(g_stateObj.scoreId);
		drawDensityGraph(g_stateObj.scoreId);
		makeDifInfo(g_stateObj.scoreId);
		makeHighScore(g_stateObj.scoreId);
		drawMinimap(g_stateObj.scoreId, { _initFlg: true });
	}

	// 楽曲データの表示
	lblMusicInfo.textContent = getMusicInfoView();
	lblMusicInfo.style.fontSize = wUnit(getFontSize2(lblMusicInfo.textContent, g_btnWidth(3 / 4), { maxSiz: 12 }));

	// ユーザカスタムイベント(初期)
	safeExecuteCustomHooks(`g_customJsObj.difficulty`, g_customJsObj.difficulty, _initFlg, g_canLoadDifInfoFlg);
	resolveKeyFamily();

	// 設定サマリー表示の更新
	updateSettingSummary();

	// ---------------------------------------------------
	// 4. 譜面初期情報ロード許可フラグの設定
	g_canLoadDifInfoFlg = true;
};

/**
 * keyLabelの系統ごとに、選択時に強制したい設定値・選択/離脱時の個別処理を登録する
 * @param {string} _name 系統名
 * @param {(key: string, context: { scoreId: number, ptn: string, prevKey: string }) => boolean} _match
 *   この系統に属するkeyLabelかどうかの判定関数。第二引数のcontextは任意で利用可能
 * @param {object} [_fields] path -> 値 or 値を返す関数（単純代入で済むもの）
 * @param {object} [_hooks] { onAcquire, onRelease } 選択/離脱の瞬間に1回だけ呼ばれる（複合処理用）
 * @param {object} [_appliers] path -> 個別の適用関数（単純代入で済まないfields用）
 */
const registerKeyFamily = (_name, _match, _fields = {}, _hooks = {}, _appliers = {}) => {
	g_familyObj.families.push({ name: _name, match: _match, fields: _fields, appliers: _appliers, ..._hooks });
};

/**
 * 現在のキー状態に応じて適用すべき設定群を判定し、
 * 各パラメータの値・スナップショット・フックを管理・適用する
 */
const resolveKeyFamily = () => {
	// match() へ渡す追加情報。第一引数(keyLabel)だけで判定できる場合は無視してよい
	const context = {
		scoreId: g_stateObj.scoreId,
		ptn: g_keyObj.currentPtn,
		prevKey: g_keyObj.prevKey,
	};

	// 1. 現在のキーに一致するファミリーを検索（見つからなければ null ＝ 標準状態）
	const newFamily = g_familyObj.families.find(f => f.match(g_keyObj.currentKey, context)) ?? null;

	// 2. ファミリーが切り替わった瞬間（入場・離脱）にフック（固有の副作用）を実行
	if (newFamily !== g_familyObj.currentFamily) {
		g_familyObj.currentFamily?.onRelease?.();
		newFamily?.onAcquire?.();
		g_familyObj.currentFamily = newFamily;
	}

	// 3. 登録されているすべてのファミリーが持つパス（プロパティ）の全リストを取得
	const allPaths = new Set(g_familyObj.families.flatMap(f => Object.keys(f.fields)));
	allPaths.forEach(path => {
		const spec = newFamily?.fields[path];

		if (spec !== undefined) {
			// 【変更値の適用】現在のファミリーにそのプロパティの設定がある場合
			// 初めて書き換えるプロパティの場合のみ、元の値をスナップショット（初期値）として退避
			if (!g_familyObj.ownership[path]) {
				g_familyObj.snapshot[path] = getPathVal(path);
			}
			// 関数なら評価し、値ならそのまま適用値とする
			g_familyObj.ownership[path] = newFamily;
			const applier = newFamily.appliers[path] ?? (v => setPathVal(path, v));
			applyIfChanged(path, typeof spec === `function` ? spec() : spec, applier);

		} else if (g_familyObj.ownership[path]) {
			// 【標準への復元】別のファミリーに移行し、かつ元々自分が書き換えていたプロパティの場合
			// スナップショットから元の値（初期値）を復元し、オーナーシップを解放
			const applier = g_familyObj.ownership[path].appliers[path] ?? (v => setPathVal(path, v));
			applyIfChanged(path, g_familyObj.snapshot[path], applier);
			g_familyObj.ownership[path] = null;
		}
		// ownership[path]がnullのままなら、標準同士の切り替えでも一切触らない
	});
};

/**
 * 値に変更がある場合のみ、代入またはカスタム処理を実行する
 * - 「エンジンが前回適用した値」ではなく「実際に今その場所にある値」と比較することで、
 *   ユーザーの手動操作など、本エンジンを介さずに値が変更されたケースでも
 *   正しく差分を検知できるようにしている
 * @param {string} _path 設定のパス
 * @param {string|number} _value 適用する値
 * @param {Function} _applier 実際の適用処理を行う関数
 */
const applyIfChanged = (_path, _value, _applier) => {
	// 実際の現在値と適用したい値が一致していれば、無駄な再描画や再代入を防ぐためスキップ
	if (getPathVal(_path) === _value) return;

	// 実際の反映処理（値の代入、または画像再描画などの副作用）を実行
	_applier(_value);
};

/**
 * 設定・オプション画面のラベル・ボタン処理の描画
 * @param {Object} _sprite 基準とするスプライト(ここで指定する座標は、そのスプライトからの相対位置)
 */
const createOptionWindow = _sprite => {

	// 各ボタン用のスプライトを作成
	const optionsprite = createEmptySprite(_sprite, `optionsprite`, g_windowObj.optionSprite);

	// 設定毎に個別のスプライトを作成し、その中にラベル・ボタン類を配置
	const spriteList = setSpriteList(g_settingPos.option);

	// ---------------------------------------------------
	// 難易度 (Difficulty)
	// 縦位置: 0 
	spriteList.difficulty.appendChild(createLblSetting(`Difficulty`, -5));

	const lnkDifficulty = makeSettingLblCssButton(`lnkDifficulty`, ``, 0, () => changeDifficulty(), {
		y: -10, h: g_limitObj.setLblHeight + 10, cxtFunc: () => changeDifficulty(-1),
	});

	// 譜面選択ボタン（メイン、右回し、左回し）
	multiAppend(spriteList.difficulty,
		lnkDifficulty,
		makeMiniCssButton(`lnkDifficulty`, `R`, 0, () => nextDifficulty(), { dy: -10, dh: 10 }),
		makeMiniCssButton(`lnkDifficulty`, `L`, 0, () => nextDifficulty(-1), { dy: -10, dh: 10 }),
	);
	createScText(spriteList.difficulty, `Difficulty`);
	if (g_headerObj.difSelectorUse) {
		createScText(spriteList.difficulty, `DifficultyList`, { x: 154, y: -10, targetLabel: `lnkDifficulty` });
	}
	multiAppend(difficultySprite,
		createCss2Button(`btnKeymodeHelp`, `?`, () => {
			const targetKeymode = hasVal(g_keyObj[`transKey${g_keyObj.currentKey}_${g_keyObj.currentPtn}`])
				? g_keyObj[`transKey${g_keyObj.currentKey}_${g_keyObj.currentPtn}`] : g_keyObj.currentKey;
			openLink(
				g_keyObj.defaultKeyList.includes(targetKeymode)
					? g_lblNameObj.keymodeUrl + targetKeymode
					: g_lblNameObj[`keyHelp${targetKeymode}`]);
		}, g_lblPosObj.btnKeymodeHelp, g_cssObj.button_Setting),
	)

	// ---------------------------------------------------
	// ハイスコア機能実装時に使用予定のスペース
	// 縦位置: 1

	// ---------------------------------------------------
	// 速度(Speed)
	// 縦位置: 2  短縮ショートカットあり
	createGeneralSetting(spriteList.speed, `speed`, {
		skipTerms: g_settings.speedTerms, hiddenBtn: true, scLabel: g_lblNameObj.sc_speed, roundNum: 5,
		unitName: ` ${g_lblNameObj.multi}`, addRFunc: () => calculateTotalSpeed(),
	});
	if (g_headerObj.baseSpeed !== 1) {
		divRoot.appendChild(
			createDivCss2Label(`lblBaseSpd`, `Δv: ${Math.round(g_headerObj.baseSpeed * 100) / 100}x`, g_lblPosObj.lblBaseSpd)
		);
	}

	/**
	 * 譜面明細子画面・グラフの作成
	 * @param {string} _name 
	 * @param {boolean} _graphUseFlg
	 * @returns {HTMLDivElement}
	 */
	const createScoreDetail = (_name, _graphUseFlg = true, _graphNum = 1) => {
		const detailObj = createEmptySprite(scoreDetail, `detail${_name}`, g_windowObj.detailObj);

		if (_graphUseFlg) {
			for (let j = 0; j < _graphNum; j++) {
				const graphObj = document.createElement(`canvas`);
				const textBaseObj = document.getElementById(`lnkDifficulty`);
				const bkColor = window.getComputedStyle(textBaseObj, ``).backgroundColor;

				graphObj.id = `graph${_name}${j > 0 ? j + 1 : ``}`;
				graphObj.width = g_limitObj.graphWidth * g_dpr;
				graphObj.height = g_limitObj.graphHeight * g_dpr;
				graphObj.style.width = wUnit(g_limitObj.graphWidth);
				graphObj.style.height = wUnit(g_limitObj.graphHeight);
				graphObj.style.left = wUnit(125);
				graphObj.style.top = wUnit(0);
				graphObj.style.position = `absolute`;
				graphObj.style.background = j === 0 ? bkColor : `#ffffff00`;
				const ctx = graphObj.getContext(`2d`);
				ctx.scale(g_dpr, g_dpr);

				detailObj.appendChild(graphObj);
			}
		}

		return detailObj;
	};

	if (g_settings.scoreDetails.length > 0) {
		multiAppend(spriteList.speed,
			createCss2Button(`btnGraphB`, ``, () => true, {
				x: -25, y: -60, w: 0, h: 0, opacity: 0, resetFunc: () => setScoreDetail(true),
			}, g_cssObj.button_Mini),
			createCss2Button(`btnGraph`, `i`, () => true, {
				x: -25, y: -60, w: 30, h: 30, siz: g_limitObj.jdgCharaSiz, title: g_msgObj.graph,
				resetFunc: () => setScoreDetail(), cxtFunc: () => setScoreDetail(),
			}, g_cssObj.button_Mini)
		);
		g_stateObj.scoreDetailViewFlg = false;
		const scoreDetail = createEmptySprite(optionsprite, `scoreDetail`, g_windowObj.scoreDetail, g_cssObj.settings_DifSelector);

		/**
		 * 譜面明細表示の切替
		 * @param {number} _val 
		 */
		const changeScoreDetail = (_val = 0) => {
			if (g_currentPage === `difSelector`) {
				resetDifWindow();
			}
			g_currentPage = `scoreDetail`;
			setShortcutEvent(g_currentPage, () => true, { displayFlg: false });
			g_stateObj.scoreDetailViewFlg = true;
			scoreDetail.style.visibility = `visible`;
			visibleSettingSummary(false);

			// 表示内容を非表示化、ボタン色をデフォルトに戻す
			$id(`detail${g_stateObj.scoreDetail}`).visibility = `hidden`;
			document.getElementById(`lnk${g_stateObj.scoreDetail}G`).classList.replace(g_cssObj.button_Setting, g_cssObj.button_Default);

			// 選択先を表示、ボタン色を選択中に変更
			// Qキーを押したときのリンク先を次の明細へ変更
			g_stateObj.scoreDetail = g_settings.scoreDetails[_val];
			[`option`, `difSelector`, `scoreDetail`].forEach(page => g_shortcutObj[page].KeyQ.id = g_settings.scoreDetailCursors[nextPos(_val, 1, g_settings.scoreDetailCursors.length)]);
			g_shortcutObj.scoreDetail.ArrowDown.id = g_settings.scoreDetailCursorsOrg[nextPos(_val, 1, g_settings.scoreDetailCursorsOrg.length)];
			g_shortcutObj.scoreDetail.ArrowUp.id = g_settings.scoreDetailCursorsOrg[nextPos(_val, -1, g_settings.scoreDetailCursorsOrg.length)];

			$id(`detail${g_stateObj.scoreDetail}`).visibility = `visible`;
			document.getElementById(`lnk${g_stateObj.scoreDetail}G`).classList.replace(g_cssObj.button_Default, g_cssObj.button_Setting);

			document.getElementById(`lnkMiniMapRev`).style.display =
				g_stateObj.scoreDetail === `MiniMap` && g_stateObj.scoreDetailViewFlg ? C_DIS_INHERIT : C_DIS_NONE;
		};

		multiAppend(scoreDetail,
			createScoreDetail(`Speed`, true, 2),
			createScoreDetail(`Density`),
			createScoreDetail(`ToolDif`, false),
			createScoreDetail(`HighScore`, false),
			createScoreDetail(`MiniMap`, false),
		);
		g_settings.scoreDetails.forEach((sd, j) => {
			scoreDetail.appendChild(
				makeDifLblCssButton(`lnk${sd}G`, getStgDetailName(sd), j, () => changeScoreDetail(j), {
					w: g_limitObj.difCoverWidth, h: 20, title: g_msgObj[`s_${sd}`],
					btnStyle: (g_stateObj.scoreDetail === sd ? `Setting` : `Default`),
				})
			);
			createScText(document.getElementById(`lnk${sd}G`), `${sd}G`, { targetLabel: `lnk${sd}G`, x: -5 });
		});
	}

	/**
	 * 譜面明細表示／非表示ボタンの処理
	 * @param {boolean} _resetFlg
	 */
	const setScoreDetail = (_resetFlg = false) => {
		if (g_currentPage === `difSelector`) {
			resetDifWindow();
			g_stateObj.scoreDetailViewFlg = false;
			g_shortcutObj.difSelector.KeyQ.id = g_settings.scoreDetailCursors[0];
		}
		const scoreDetail = document.getElementById(`scoreDetail`);
		const detailObj = document.getElementById(`detail${g_stateObj.scoreDetail}`);
		const visibles = [`hidden`, `visible`];

		g_stateObj.scoreDetailViewFlg = !g_stateObj.scoreDetailViewFlg;
		scoreDetail.style.visibility = visibles[Number(g_stateObj.scoreDetailViewFlg)];
		detailObj.style.visibility = visibles[Number(g_stateObj.scoreDetailViewFlg)];
		visibleSettingSummary(g_stateObj.scoreDetailViewFlg ? false : g_stateObj.settingSummaryVisible);

		g_currentPage = g_stateObj.scoreDetailViewFlg ? `scoreDetail` : `option`;
		setShortcutEvent(g_currentPage, () => true, { displayFlg: false });

		// Qキーのカーソル位置は、ハードリセットまたはスコア明細を閉じるときに先頭へ戻す
		if (_resetFlg || !g_stateObj.scoreDetailViewFlg) {
			[`option`, `difSelector`, `scoreDetail`].forEach(page => g_shortcutObj[page].KeyQ.id = g_settings.scoreDetailCursors[0]);
		}
		document.getElementById(`lnkMiniMapRev`).style.display =
			g_stateObj.scoreDetail === `MiniMap` && g_stateObj.scoreDetailViewFlg ? C_DIS_INHERIT : C_DIS_NONE;
	};

	// ---------------------------------------------------
	// 速度モーション (Motion)
	// 縦位置: 3
	createGeneralSetting(spriteList.motion, `motion`);

	// ---------------------------------------------------
	// リバース (Reverse) / スクロール (Scroll)
	// 縦位置: 4
	createGeneralSetting(spriteList.reverse, `reverse`, {
		addRFunc: () => {
			if (g_headerObj.scrollUse && g_settings.scrolls.length > 1) {
				setReverseView(document.getElementById(`btnReverse`));
			}
		}
	});
	if (g_headerObj.scrollUse) {
		createGeneralSetting(spriteList.scroll, `scroll`, { scLabel: g_lblNameObj.sc_scroll });
		[$id(`lnkScroll`).left, $id(`lnkScroll`).width] = [
			wUnit(parseFloat($id(`lnkScroll`).left) + 90), wUnit(parseFloat($id(`lnkScroll`).width) - 90)
		];

		spriteList.scroll.appendChild(
			createCss2Button(`btnReverse`, `${g_lblNameObj.Reverse}:${getStgDetailName(g_stateObj.reverse)}`, evt => setReverse(evt.target), {
				...g_lblPosObj.btnReverse,
				cxtFunc: evt => setReverse(evt.target),
			}, g_cssObj.button_Default, g_cssObj[`button_Rev${g_stateObj.reverse}`])
		);
		spriteList[g_settings.scrolls.length > 1 ? `reverse` : `scroll`].style.display = C_DIS_NONE;
	} else {
		spriteList.scroll.style.pointerEvents = C_DIS_NONE;
	}

	// ---------------------------------------------------
	// ミラー・ランダム (Shuffle)
	// 縦位置: 5.5
	createGeneralSetting(spriteList.shuffle, `shuffle`, g_settings.scoreDetails.length > 0 ? {
		addRFunc: () => makeHighScore(g_stateObj.scoreId),
	} : {});

	// ---------------------------------------------------
	// 鑑賞モード設定 (AutoPlay)
	// 縦位置: 6.5
	createGeneralSetting(spriteList.autoPlay, `autoPlay`, g_settings.scoreDetails.length > 0 ? {
		addRFunc: () => makeHighScore(g_stateObj.scoreId),
	} : {});

	// ---------------------------------------------------
	// ゲージ設定 (Gauge)
	// 縦位置: 7.5
	spriteList.gauge.appendChild(createLblSetting(`Gauge`));

	// ゲージ設定詳細 縦位置: ゲージ設定+1
	spriteList.gauge.appendChild(createDivCss2Label(`lblGauge2`, ``, g_lblPosObj.lblGauge2));

	if (g_headerObj.gaugeUse) {
		multiAppend(spriteList.gauge,
			makeSettingLblCssButton(`lnkGauge`, ``, 0, () => setGauge(1), { cxtFunc: () => setGauge(-1) }),
			makeMiniCssButton(`lnkGauge`, `R`, 0, () => setGauge(1)),
			makeMiniCssButton(`lnkGauge`, `L`, 0, () => setGauge(-1)),
		);
		createScText(spriteList.gauge, `Gauge`);
	} else {
		lblGauge.classList.add(g_cssObj.settings_Disabled);
		spriteList.gauge.appendChild(makeDisabledLabel(`lnkGauge`, 0, getStgDetailName(g_stateObj.gauge)));
	}

	// 空押し判定設定 (Excessive)
	spriteList.gauge.appendChild(
		createDivCss2Label(`lblExcessive`, `${g_lblNameObj.Excessive}:${C_FLG_ON}`,
			g_lblPosObj.lblExcessive, g_cssObj[`button_Disabled${C_FLG_ON}`]
		)
	);
	spriteList.gauge.appendChild(
		createCss2Button(`lnkExcessive`, g_lblNameObj.Excessive, evt => setExcessive(evt.target), {
			...g_lblPosObj.btnExcessive,
			title: g_msgObj.excessive, cxtFunc: evt => setExcessive(evt.target),
		}, g_cssObj.button_Default, g_cssObj[`button_Rev${g_stateObj.excessive}`])
	);
	createScText(lnkExcessive, `Excessive`, { x: -13, targetLabel: `lnkExcessive` });

	// ---------------------------------------------------
	// タイミング調整 (Adjustment)
	// 縦位置: 10.5  短縮ショートカットあり
	createGeneralSetting(spriteList.adjustment, `adjustment`, {
		skipTerms: g_settings.adjustmentTerms, hiddenBtn: true, scLabel: g_lblNameObj.sc_adjustment, roundNum: 5,
		unitName: g_lblNameObj.frame, addRFunc: () => viewAdjustment(),
	});

	const viewAdjustment = () => {
		if (g_headerObj.playbackRate !== 1) {
			const adjustmentVal = isLocalMusicFile(g_stateObj.scoreId)
				? Math.round(g_stateObj.adjustment / g_headerObj.playbackRate)
				: (g_stateObj.adjustment / g_headerObj.playbackRate).toFixed(1);
			document.getElementById(`lnkAdjustment`).textContent = ``;
			if (document.getElementById(`lnkAdjustment1`) === null) {
				multiAppend(
					adjustmentSprite,
					createDivCss2Label(`lnkAdjustment1`, ``, g_lblPosObj.lnkAdjustment1),
					createDivCss2Label(`lnkAdjustment2`, ``, g_lblPosObj.lnkAdjustment2),
				);
			}
			document.getElementById(`lnkAdjustment1`).textContent = `${adjustmentVal}${g_lblNameObj.frame}`;
			document.getElementById(`lnkAdjustment2`).textContent = `(${g_stateObj.adjustment.toFixed(1)}${g_localStorage.adjustment === g_stateObj.adjustment ? '*' : ''})`;
		}
	};
	viewAdjustment();

	// ---------------------------------------------------
	// フェードイン (Fadein)
	// 縦位置: 11.5 スライダーあり
	spriteList.fadein.appendChild(createLblSetting(`Fadein`));

	const lnkFadein = createDivCss2Label(`lnkFadein`, `${g_stateObj.fadein}${g_lblNameObj.percent}`,
		g_lblPosObj.lnkFadein, g_cssObj.settings_FadeinBar);
	spriteList.fadein.appendChild(lnkFadein);

	const setFadein = _sign => {
		g_stateObj.fadein = nextPos(g_stateObj.fadein, _sign, 100);
		fadeinSlider.value = g_stateObj.fadein;
		lnkFadein.textContent = `${g_stateObj.fadein}${g_lblNameObj.percent}`;
		updateSettingSummary();
		drawMinimap(g_stateObj.scoreId, { _fadeinFlg: true });
	};

	multiAppend(spriteList.fadein,

		// 右回し・左回しボタン
		makeMiniCssButton(`lnkFadein`, `R`, 0, () => setFadein(1)),
		makeMiniCssButton(`lnkFadein`, `L`, 0, () => setFadein(-1)),

		// フェードインのスライダー処理
		createDivCss2Label(`lblFadeinBar`, `<input id="fadeinSlider" type="range" value="${g_stateObj.fadein}" min="0" max="99" step="1">`,
			g_lblPosObj.lblFadeinBar),

	);

	const fadeinSlider = document.getElementById(`fadeinSlider`);
	g_handler.addListener(fadeinSlider, `input`, () => {
		g_stateObj.fadein = inputSlider(fadeinSlider, lnkFadein, `fadein`);
		updateSettingSummary();
		drawMinimap(g_stateObj.scoreId, { _fadeinFlg: true });
	}, false);

	// ---------------------------------------------------
	// ボリューム (Volume) 
	// 縦位置: 12.5
	createGeneralSetting(spriteList.volume, `volume`, { unitName: g_lblNameObj.percent });

	// 譜面番号の再取得
	g_stateObj.scoreId = getNextDifficulty(g_stateObj.scoreId, 0);
	const keyLists = makeDedupliArray(g_headerObj.viewLists.map(j => g_headerObj.keyLabels[j]));
	g_headerObj.viewKeyLists = keyLists.sort((a, b) => parseInt(a) - parseInt(b));
	g_headerObj.difSelectorUse = getDifSelectorUse(g_rootObj.difSelectorUse);

	// 設定画面の一通りのオブジェクトを作成後に譜面・速度・ゲージ設定をまとめて行う
	setDifficulty(false);
	optionsprite.oncontextmenu = () => false;
};

/**
 * 汎用設定
 * @param {HTMLDivElement} _obj 
 * @param {string} _settingName 
 * @param {string} [object.unitName=''] 設定名の単位
 * @param {number[]} [object.skipTerms] ボタンの設定スキップ間隔(デフォルト:[1(外側), 1(内側), 1(最内側)])
 * @param {boolean} [object.hiddenBtn=false] 隠しボタン(ショートカットキーのみ)の利用有無
 * @param {Function} [object.addRFunc] 右側のボタンを押したときの追加処理
 * @param {Function} [object.addLFunc] 左側のボタンを押したときの追加処理
 * @param {string} [object.settingLabel=_settingName] 設定名
 * @param {string} [object.displayName] 画面名
 * @param {string} [object.scLabel=''] ショートカットキーの表示名
 * @param {number} [object.roundNum=0] 設定スキップ間隔の丸め基準数
 * @param {number} [object.adjY=0] 設定ボタンのY座標位置
 */
const createGeneralSetting = (_obj, _settingName, { unitName = ``,
	skipTerms = fillArray(3, 1), hiddenBtn = false, addRFunc = () => { }, addLFunc = addRFunc,
	settingLabel = _settingName, displayName = g_currentPage, scLabel = ``, roundNum = 0, adjY = 0 } = {}) => {

	const settingUpper = toCapitalize(_settingName);
	const linkId = `lnk${settingUpper}`;
	const initName = `${getStgDetailName(g_stateObj[_settingName])}${unitName}`;
	_obj.appendChild(createLblSetting(settingUpper, adjY, toCapitalize(settingLabel)));

	if (g_headerObj[`${_settingName}Use`] === undefined || g_headerObj[`${_settingName}Use`]) {

		multiAppend(_obj,
			makeSettingLblCssButton(linkId, `${initName}${g_localStorage[_settingName] === g_stateObj[_settingName] ? ' *' : ''}`, 0,
				() => {
					setSetting(skipTerms[1], _settingName, { func: () => addRFunc(), unitName, roundNum });
				}, {
				cxtFunc: () => {
					setSetting(skipTerms[1] * (-1), _settingName, { func: () => addLFunc(), unitName, roundNum });
				}
			}),

			// 右回し・左回しボタン（外側）
			makeMiniCssButton(linkId, `R`, 0, () =>
				setSetting(skipTerms[0], _settingName, { func: () => addRFunc(), unitName, roundNum })),
			makeMiniCssButton(linkId, `L`, 0, () =>
				setSetting(skipTerms[0] * (-1), _settingName, { func: () => addLFunc(), unitName, roundNum })),
		);

		// 右回し・左回しボタン（内側）
		if (skipTerms[1] > 1) {
			multiAppend(_obj,
				makeMiniCssButton(linkId, `RR`, 0, () =>
					setSetting(skipTerms[1], _settingName, { func: () => addRFunc(), unitName, roundNum })),
				makeMiniCssButton(linkId, `LL`, 0, () =>
					setSetting(skipTerms[1] * (-1), _settingName, { func: () => addLFunc(), unitName, roundNum })),
			);
		}

		// 右回し・左回しボタン（最内側）
		if (skipTerms[2] > 1) {
			multiAppend(_obj,
				makeMiniCssButton(linkId, `RRR`, 0, () =>
					setSetting(skipTerms[2], _settingName, { func: () => addRFunc(), unitName, roundNum })
					, { dw: -g_limitObj.setMiniWidth / 2 }),
				makeMiniCssButton(linkId, `LLL`, 0, () =>
					setSetting(skipTerms[2] * (-1), _settingName, { func: () => addLFunc(), unitName, roundNum })
					, { dw: -g_limitObj.setMiniWidth / 2 }),
			);
		}

		// 右回し・左回しボタン（不可視）
		if (hiddenBtn) {
			multiAppend(_obj,
				makeMiniCssButton(linkId, `HR`, 0, () => setSetting(1, _settingName, { func: () => addRFunc(), unitName, roundNum }), { visibility: `hidden` }),
				makeMiniCssButton(linkId, `HL`, 0, () => setSetting(-1, _settingName, { func: () => addLFunc(), unitName, roundNum }), { visibility: `hidden` }),
			);
		}

		// ショートカットキー表示
		createScText(_obj, settingUpper, { displayName: displayName, dfLabel: scLabel });

	} else {
		document.getElementById(`lbl${settingUpper}`).classList.add(g_cssObj.settings_Disabled);
		_obj.appendChild(makeDisabledLabel(linkId, 0, initName));
	}
};

/**
 * 設定画面用ラベルの作成
 * @param {string} _settingName 
 * @param {number} _adjY 
 * @param {string} _settingLabel 
 * @returns {HTMLDivElement}
 */
const createLblSetting = (_settingName, _adjY = 0, _settingLabel = _settingName) => {
	const lbl = createDivCss2Label(`lbl${_settingName}`, g_lblNameObj[_settingLabel], {
		x: -5, y: _adjY, w: 110, pointerEvents: C_DIS_AUTO,
	}, `settings_${_settingName}`);
	lbl.title = g_msgObj[`${_settingName.charAt(0).toLowerCase()}${_settingName.slice(1)}`];
	return lbl;
};

/**
 * 設定名の置き換え処理（未指定時は原則g_lblNameObjの値を使用、明示的な指定がある場合のみ元の名前を返却）
 * @param {string} _name 
 * @returns {string}
 */
const getStgDetailName = _name => {
	return g_lblNameObj[`u_${_name}`] !== undefined && (
		g_presetObj.lblRenames === undefined ||
		g_presetObj.lblRenames[g_currentPage] === undefined ||
		g_presetObj.lblRenames[g_currentPage]
	) ? g_lblNameObj[`u_${_name}`] : _name;
};

/**
 * 設定メイン・汎用
 * @param {number} _scrollNum 
 * @param {string} _settingName
 * @param {Function} [func=()=>true] 設定ボタンを押した後の追加処理
 * @param {string} [unitName=''] 設定の単位名
 * @param {number} [roundNum=0] 設定スキップ間隔の丸め基準数
 */
const setSetting = (_scrollNum, _settingName, { func = () => true, unitName = ``, roundNum = 0, maxSiz = g_limitObj.setLblSiz } = {}) => {
	let settingNum = g_settings[`${_settingName}Num`];
	const settingList = g_settings[`${_settingName}s`];
	const settingMax = settingList.length - 1;

	// _roundNum単位で丸める
	if (roundNum > 0 && _scrollNum >= roundNum) {
		settingNum = Math.floor(settingNum / roundNum) * roundNum;
	} else if (roundNum > 0 && -_scrollNum >= roundNum) {
		settingNum = Math.ceil(settingNum / roundNum) * roundNum;
	}

	if (_scrollNum > 0) {
		settingNum = (settingNum === settingMax ? 0 : Math.min(settingNum + _scrollNum, settingMax));
	} else if (_scrollNum < 0) {
		settingNum = (settingNum === 0 ? settingMax : Math.max(settingNum + _scrollNum, 0));
	}
	g_stateObj[_settingName] = settingList[settingNum];
	g_settings[`${_settingName}Num`] = settingNum;

	const settingName = `${getStgDetailName(g_stateObj[_settingName])}${unitName}${g_localStorage[_settingName] === g_stateObj[_settingName] ? ' *' : ''}`;
	const lnkName = `lnk${toCapitalize(_settingName)}`;
	document.getElementById(lnkName).textContent = settingName;
	$id(lnkName).fontSize = wUnit(getFontSize2(settingName, parseFloat($id(lnkName).width), { maxSiz }));

	func();

	if (document.getElementById(`settingSumSprite`) !== null) {
		updateSettingSummary();
	}
};

/**
 * 無効化用ラベル作成
 * @param {string} _id 
 * @param {number} _heightPos 
 * @param {string} _defaultStr 
 * @returns {HTMLDivElement}
 */
const makeDisabledLabel = (_id, _heightPos, _defaultStr) =>
	createDivCss2Label(_id, _defaultStr, {
		x: g_limitObj.setLblLeft, y: g_limitObj.setLblHeight * _heightPos,
	}, g_cssObj.settings_Disabled);

/**
 * 保存済みリバース取得処理
 * @param {object} _localStorage 保存先のローカルストレージ名
 * @param {string} _extraKeyName 特殊キー名(通常キーは省略)
 */
const getKeyReverse = (_localStorage, _extraKeyName = ``) => {
	if (_localStorage[`reverse${_extraKeyName}`] !== undefined && g_headerObj.reverseUse) {
		g_stateObj.reverse = _localStorage[`reverse${_extraKeyName}`] ?? C_FLG_OFF;
		g_settings.reverseNum = roundZero(g_settings.reverses.findIndex(reverse => reverse === g_stateObj.reverse));
	} else {
		setReverseDefault();
	}
};

/**
 * リバースのデフォルト化処理
 */
const setReverseDefault = () => {
	g_stateObj.reverse = C_FLG_OFF;
	g_settings.reverseNum = 0;
};

const setReverse = _btn => {
	if (!g_settings.scrolls.includes(C_FLG_REVERSE) && g_headerObj.reverseUse) {
		g_settings.reverseNum = (g_settings.reverseNum + 1) % 2;
		g_stateObj.reverse = g_settings.reverses[g_settings.reverseNum];
		setReverseView(_btn);
		updateSettingSummary();
	}
};

const setReverseView = _btn => {
	_btn.classList.replace(g_cssObj[`button_Rev${g_settings.reverses[(g_settings.reverseNum + 1) % 2]}`],
		g_cssObj[`button_Rev${g_settings.reverses[g_settings.reverseNum]}`]);
	if (!g_settings.scrolls.includes(C_FLG_REVERSE) && g_headerObj.reverseUse) {
		_btn.textContent = `${g_lblNameObj.Reverse}:${getStgDetailName(g_stateObj.reverse)}`;
	} else {
		_btn.textContent = `X`;
		setReverseDefault();
	}
};

/**
 * ゲージ設定メイン
 * @param {number} _scrollNum 
 * @param {boolean} _gaugeInitFlg
 */
const setGauge = (_scrollNum, _gaugeInitFlg = false) => {

	/**
	 * 数式からゲージ値に変換
	 * arrow[] -> 矢印数, frz[] -> フリーズアロー数, all[] -> 矢印＋フリーズアロー数に置換する
	 * @param {string} _val 
	 * @param {string} _defaultVal
	 * @returns {number}
	 */
	const getGaugeCalc = (_val, _defaultVal) => {
		return setVal(convertStrToVal(
			replaceStr(_val, g_escapeStr.gaugeParamName)?.split(`{0}`).join(g_stateObj.scoreId)
		), _defaultVal, C_TYP_CALC);
	};
	/**
	 * ゲージ詳細一括変更
	 * @param {object} _baseObj 
	 * @param {number} object.magInit
	 * @param {number} object.magRcv
	 * @param {number} object.magDmg
	 */
	const setLifeCategory = (_baseObj, { _magInit = 1, _magRcv = 1, _magDmg = 1 } = {}) => {
		g_stateObj.lifeInit = getGaugeCalc(_baseObj.lifeInits[g_stateObj.scoreId], g_stateObj.lifeInit) * _magInit;
		g_stateObj.lifeRcv = getGaugeCalc(_baseObj.lifeRecoverys[g_stateObj.scoreId], g_stateObj.lifeRcv) * _magRcv;
		g_stateObj.lifeDmg = getGaugeCalc(_baseObj.lifeDamages[g_stateObj.scoreId], g_stateObj.lifeDmg) * _magDmg;
	};

	/**
	 * ライフモード切替
	 * @param {object} _baseObj 
	 */
	const changeLifeMode = (_baseObj) => {
		if (_baseObj.lifeBorders[g_stateObj.scoreId] === `x`) {
			g_stateObj.lifeBorder = 0;
			g_stateObj.lifeMode = C_LFE_SURVIVAL;
		} else {
			g_stateObj.lifeBorder = getGaugeCalc(_baseObj.lifeBorders[g_stateObj.scoreId], g_stateObj.lifeBorder);
			g_stateObj.lifeMode = C_LFE_BORDER;
		}
	};

	// ゲージ初期化

	// カスタムゲージの設定取得
	const defaultCustomGauge = g_gaugeOptionObj.custom0 || g_gaugeOptionObj.customDefault;
	if (hasVal(defaultCustomGauge)) {
		g_gaugeOptionObj.custom = (g_gaugeOptionObj[`custom${g_stateObj.scoreId}`] || defaultCustomGauge).concat();
		g_gaugeOptionObj.varCustom = (g_gaugeOptionObj[`varCustom${g_stateObj.scoreId}`] || g_gaugeOptionObj.varCustom0 || g_gaugeOptionObj.varCustomDefault).concat();
	}

	// ゲージタイプの設定
	changeLifeMode(g_headerObj);
	g_gaugeType = (g_gaugeOptionObj.custom.length > 0 ? C_LFE_CUSTOM : g_stateObj.lifeMode);

	// ゲージ配列を入れ替え
	g_settings.gauges = structuredClone(g_gaugeOptionObj[g_gaugeType.toLowerCase()]);
	g_settings.gaugeNum = getCurrentNo(g_settings.gauges, g_stateObj.gauge);
	g_stateObj.gauge = g_settings.gauges[g_settings.gaugeNum];

	setSetting(_scrollNum, `gauge`);
	g_stateObj.lifeVariable = g_gaugeOptionObj[`var${g_gaugeType}`][g_settings.gaugeNum];

	// デフォルトゲージの設定を適用（g_gaugeOptionObjから取得）
	if (g_settings.gaugeNum !== 0 &&
		(g_gaugeOptionObj.custom.length === 0 ||
			g_gaugeOptionObj.defaultList.includes(g_gaugeOptionObj[`defaultGauge${g_stateObj.scoreId}`]))) {

		const gType = (g_gaugeType === C_LFE_CUSTOM ?
			toCapitalize(g_gaugeOptionObj[`defaultGauge${g_stateObj.scoreId}`]) : g_gaugeType);
		const getGaugeVal = _type => g_gaugeOptionObj[`${_type}${gType}`][g_settings.gaugeNum];
		g_stateObj.lifeMode = getGaugeVal(`type`);
		g_stateObj.lifeBorder = getGaugeVal(`clear`);
		g_stateObj.lifeInit = getGaugeVal(`init`);
		g_stateObj.lifeRcv = getGaugeVal(`rcv`);
		g_stateObj.lifeDmg = getGaugeVal(`dmg`);
	}

	// デフォルトゲージの初期設定（Light, Easyでは回復量を2倍にする）
	if ([`Original`, `Light`, `Normal`, `Easy`].includes(g_stateObj.gauge)) {
		setLifeCategory(g_headerObj, { _magRcv: [`Light`, `Easy`].includes(g_stateObj.gauge) ? 2 : 1 });
	}

	// ゲージ設定別に個別設定した場合はここで設定を上書き
	// 譜面ヘッダー：gaugeXXX で設定した値がここで適用される
	if (hasVal(g_gaugeOptionObj[`gauge${g_stateObj.gauge}s`])) {
		const tmpGaugeObj = g_gaugeOptionObj[`gauge${g_stateObj.gauge}s`];
		if (hasVal(tmpGaugeObj.lifeBorders[g_stateObj.scoreId])) {
			changeLifeMode(tmpGaugeObj);
		}
		setLifeCategory(tmpGaugeObj);
	}

	// ゲージ詳細情報を表示
	lblGauge2.innerHTML = gaugeFormat(g_stateObj.lifeMode,
		g_stateObj.lifeBorder, g_stateObj.lifeRcv, g_stateObj.lifeDmg, g_stateObj.lifeInit, g_stateObj.lifeVariable);
};

/**
 * ゲージ設定の詳細表示を整形
 * @param {string} _mode 
 * @param {number} _border 
 * @param {number} _rcv 
 * @param {number} _dmg 
 * @param {number} _init 
 * @param {string} _lifeValFlg 
 * @returns {string}
 */
const gaugeFormat = (_mode, _border, _rcv, _dmg, _init, _lifeValFlg) => {
	const initVal = g_headerObj.maxLifeVal * _init / 100;
	const borderVal = g_headerObj.maxLifeVal * _border / 100;

	// 整形用にライフ初期値を整数、回復・ダメージ量を小数第2位に丸める
	const init = Math.round(initVal);
	const borderText = (_mode === C_LFE_BORDER && _border !== 0 ? Math.round(borderVal) : `-`);
	const round2 = _val => Math.round(_val * 100) / 100;

	let rcvText = round2(_rcv), dmgText = round2(_dmg);
	let realRcv = _rcv, realDmg = _dmg;
	const allCnt = sumData(g_detailObj.arrowCnt[g_stateObj.scoreId]) +
		(g_headerObj.frzStartjdgUse ? 2 : 1) * sumData(g_detailObj.frzCnt[g_stateObj.scoreId]);

	// ゲージ設定が矢印数依存の場合、実際の値に変換して表示する
	// 表示上、計算した値は小数第二位までの表示とする（それ以外はそのまま）
	if (_lifeValFlg === C_FLG_ON) {
		rcvText = ``, dmgText = ``;
		if (allCnt > 0) {
			realRcv = Math.min(calcLifeVal(_rcv, allCnt), g_headerObj.maxLifeVal);
			realDmg = Math.min(calcLifeVal(_dmg, allCnt), g_headerObj.maxLifeVal);
			rcvText = `${realRcv.toFixed(2)}<br>`;
			dmgText = `${realDmg.toFixed(2)}<br>`;
		}
		rcvText += `<span class="settings_lifeVal">(${round2(_rcv)})</span>`;
		dmgText += `<span class="settings_lifeVal">(${round2(_dmg)})</span>`;
	}

	// 達成率(Accuracy)・許容ミス数の計算
	const [rateText, allowableCntsText] = getAccuracy(borderVal, realRcv, realDmg, initVal, allCnt);
	g_workObj.requiredAccuracy = rateText;

	// このテーブルのみpointer-eventsを有効にする（オンマウス許可）
	return `<div id="gaugeDivCover" class="settings_gaugeDivCover" style="pointer-events: auto;">
		<div id="lblGaugeDivTable" class="settings_gaugeDivTable">
			<div id="lblGaugeStart" class="settings_gaugeDivTableCol settings_gaugeStart">
				${g_lblNameObj.g_start}
			</div>
			<div id="lblGaugeBorder" class="settings_gaugeDivTableCol settings_gaugeEtc">
				${g_lblNameObj.g_border}
			</div>
			<div id="lblGaugeRecovery" class="settings_gaugeDivTableCol settings_gaugeEtc">
				${g_lblNameObj.g_recovery}
			</div>
			<div id="lblGaugeDamage" class="settings_gaugeDivTableCol settings_gaugeEtc">
				${g_lblNameObj.g_damage}
			</div>
			<div id="lblGaugeRate" class="settings_gaugeDivTableCol settings_gaugeEtc">
				${g_lblNameObj.g_rate}
			</div>
		</div>
		<div id="dataGaugeDivTable" class="settings_gaugeDivTable">
			<div id="dataGaugeStart" class="settings_gaugeDivTableCol settings_gaugeVal settings_gaugeStart">
				${init}/${g_headerObj.maxLifeVal}
			</div>
			<div id="dataGaugeBorder" class="settings_gaugeDivTableCol settings_gaugeVal settings_gaugeEtc">
				${borderText}
			</div>
			<div id="dataGaugeRecovery" class="settings_gaugeDivTableCol settings_gaugeVal settings_gaugeEtc">
				${rcvText}
			</div>
			<div id="dataGaugeDamage" class="settings_gaugeDivTableCol settings_gaugeVal settings_gaugeEtc">
				${dmgText}
			</div>
			<div id="dataGaugeRate" class="settings_gaugeDivTableCol settings_gaugeVal settings_gaugeEtc" style="line-height: 12px;">
				${rateText}<br><span style="font-size: 10px;">${allowableCntsText}</span>
			</div>
		</div>
	</div>
	`;
};

/**
 * 達成率、許容ミス数の取得
 * @param {number} _border 
 * @param {number} _rcv 
 * @param {number} _dmg 
 * @param {number} _init 
 * @param {number} _allCnt 
 * @returns {string[]}
 */
const getAccuracy = (_border, _rcv, _dmg, _init, _allCnt) => {
	const justPoint = _rcv + _dmg > 0 ? Math.max(_border - _init + _dmg * _allCnt, 0) / (_rcv + _dmg) : 0;
	const minRecovery = (_border === 0 ? Math.floor(justPoint + 1) : Math.ceil(justPoint));
	const rate = Math.max(minRecovery / _allCnt * 100, 0);
	let rateText = _allCnt > 0 ? (rate <= 100 ? `${rate.toFixed(2)}%` : `<span class="settings_lifeVal">${rate.toFixed(2)}%</span>`) : `----`;

	// 許容ミス数の計算
	const allowableCnts = Math.min(_allCnt - minRecovery, _allCnt);
	let allowableCntsText = _allCnt > 0 && allowableCnts !== 0 ? (allowableCnts > 0 ? `${allowableCnts}miss↓` : `(${allowableCnts}miss)`) : ``;

	if ((_rcv === 0 && _dmg === 0) || _rcv < 0 || _dmg < 0) {
		rateText = `----`;
		allowableCntsText = ``;
	}
	return [rateText, allowableCntsText];
};

/**
 * 空押し判定の設定
 * @param {HTMLDivElement} _btn
 */
const setExcessive = (_btn, _val) => {
	const curExcessive = Number(g_settings.excessiveNum);
	g_settings.excessiveNum = _val !== undefined ? Number(_val) : (curExcessive + 1) % 2;
	g_stateObj.excessiveChgFlg = _val === undefined;
	if (g_stateObj.excessiveChgFlg) {
		g_stateObj.excessiveScoreId = g_stateObj.scoreId;
	}
	g_stateObj.excessive = g_settings.excessives[g_settings.excessiveNum];
	updateSettingSummary();
	_btn.classList.replace(g_cssObj[`button_Rev${g_settings.excessives[curExcessive]}`],
		g_cssObj[`button_Rev${g_settings.excessives[g_settings.excessiveNum]}`]);
};

/**
 * 保存済みキーコンフィグ取得処理
 * @param {object} _localStorage 保存先のローカルストレージ名
 * @param {string} _extraKeyName 特殊キー名(通常キーは省略)
 */
const getKeyCtrl = (_localStorage, _extraKeyName = ``) => {
	g_keyObj.storagePtn = _localStorage[`keyCtrlPtn${_extraKeyName}`];
	const basePtn = `${g_keyObj.currentKey}_${g_keyObj.storagePtn}`;
	if (g_keyObj[`keyCtrl${basePtn}`] === undefined || hasVal(g_keyObj[`transKey${basePtn}`])) {
		return;
	}
	const baseKeyNum = g_keyObj[`${g_keyObj.defaultProp}${basePtn}`].length;

	if (_localStorage[`keyCtrl${_extraKeyName}`]?.[0].length > 0) {
		const prevPtn = g_keyObj.currentPtn;
		g_keyObj.currentPtn = -1;
		const copyPtn = `${g_keyObj.currentKey}_-1`;
		g_keyObj[`keyCtrl${copyPtn}`] = [...Array(baseKeyNum)].map(() => []);
		g_keyObj[`keyCtrl${copyPtn}d`] = [...Array(baseKeyNum)].map(() => []);

		for (let j = 0; j < baseKeyNum; j++) {
			for (let k = 0; k < g_keyObj[`keyCtrl${basePtn}`][j].length; k++) {
				g_keyObj[`keyCtrl${copyPtn}d`][j][k] = g_keyObj[`keyCtrl${copyPtn}`][j][k] = _localStorage[`keyCtrl${_extraKeyName}`][j][k];
			}
		}

		const isUpdate = prevPtn !== -1 && g_keyObj.prevKey !== g_keyObj.currentKey;
		g_keyCopyLists.multiple.filter(header => g_keyObj[`${header}${basePtn}`] !== undefined && isUpdate)
			.forEach(header => g_keyObj[`${header}${copyPtn}`] = structuredClone(g_keyObj[`${header}${basePtn}`]));
		g_keyCopyLists.simple.filter(header => g_keyObj[`${header}${basePtn}`] !== undefined && isUpdate)
			.forEach(header => g_keyObj[`${header}${copyPtn}`] = g_keyObj[`${header}${basePtn}`]);

		g_keycons.groups.forEach(type => {
			let maxPtn = 0;
			while (g_keyObj[`${type}${basePtn}_${maxPtn}`] !== undefined) {
				maxPtn++;
			}
			for (let j = 0; j < maxPtn; j++) {
				g_keyObj[`${type}${copyPtn}_${j}`] = structuredClone(g_keyObj[`${type}${basePtn}_${j}`]);
			}
			g_keyObj[`${type}${copyPtn}_0d`] = structuredClone(g_keyObj[`${type}${copyPtn}_0`]);
		});
	}
};

/**
 * 設定・オプション表示用ボタン
 * @param {string} _id 
 * @param {string} _name 初期設定文字
 * @param {number} _heightPos 上からの配置順
 * @param {Function} _func 通常ボタン処理
 * @param {number} [object.x]
 * @param {number} [object.y]
 * @param {number} [object.w]
 * @param {number} [object.h]
 * @param {number} [object.siz]
 * @param {Function} [object.cxtFunc] 右クリック時の処理
 * @param {...any} [object.rest]
 * @param {...any} _classes 追加するクラス
 * @returns {HTMLDivElement}
 */
const makeSettingLblCssButton = (_id, _name, _heightPos, _func, {
	x = g_limitObj.setLblLeft, y = g_limitObj.setLblHeight * _heightPos,
	w = g_limitObj.setLblWidth, h = g_limitObj.setLblHeight, siz = g_limitObj.setLblSiz,
	cxtFunc = () => true, ...rest } = {}, ..._classes) =>
	createCss2Button(_id, _name, _func, { x, y, w, h, siz: getFontSize2(_name, w, { maxSiz: siz }), cxtFunc, ...rest }, g_cssObj.button_Default, ..._classes);

/**
 * 譜面変更セレクター用ボタン
 * @param {string} _id
 * @param {string} _name 初期設定文字
 * @param {number} _heightPos 上からの配置順
 * @param {Function} _func
 * @param {number} [object.x]
 * @param {number} [object.h]
 * @param {number} [object.y=h*_heightPos]
 * @param {number} [object.w]
 * @param {number} [object.siz]
 * @param {string} [object.btnStyle='Default']
 * @returns {HTMLDivElement}
 */
const makeDifLblCssButton = (_id, _name, _heightPos, _func, {
	x = 0, h = g_limitObj.setLblHeight, y = h * _heightPos,
	w = g_limitObj.difSelectorWidth, siz = g_limitObj.difSelectorSiz, btnStyle = `Default` } = {}) =>
	createCss2Button(_id, _name, _func, {
		x, y, w, h, siz, borderStyle: `solid`, title: g_msgObj[_id] ?? ``,
	}, g_cssObj[`button_${btnStyle}`], g_cssObj.button_ON);

/**
 * 設定・オプション用の設定変更ミニボタン
 * @param {string} _id 
 * @param {string} _directionFlg 表示用ボタンのどちら側に置くかを設定。(R, RR:右、L, LL:左)
 * @param {number} _heightPos 上からの配置順
 * @param {Function} _func 
 * @param {number} [object.dx=0]
 * @param {number} [object.dy=0]
 * @param {number} [object.dw=0]
 * @param {number} [object.dh=0]
 * @param {number} [object.dsiz=0]
 * @param {string} [object.visibility='visible']
 * @returns {HTMLDivElement}
 */
const makeMiniCssButton = (_id, _directionFlg, _heightPos, _func, { dx = 0, dy = 0, dw = 0, dh = 0, dsiz = 0, visibility = `visible` } = {}) =>
	createCss2Button(`${_id}${_directionFlg}`, g_settingBtnObj.chara[_directionFlg], _func, {
		x: g_settingBtnObj.pos[_directionFlg] + dx, y: g_limitObj.setLblHeight * _heightPos + dy,
		w: g_limitObj.setMiniWidth + dw, h: g_limitObj.setLblHeight + dh, siz: g_limitObj.setLblSiz + dsiz, visibility,
	}, g_cssObj.button_Mini);

/*-----------------------------------------------------------*/
/* Scene : SETTINGS-DISPLAY [lemon] */
/*-----------------------------------------------------------*/

const settingsDisplayInit = () => {

	clearWindow();
	const divRoot = document.getElementById(`divRoot`);
	g_currentPage = `settingsDisplay`;

	// 譜面初期情報ロード許可フラグ
	g_canLoadDifInfoFlg = false;

	// タイトル文字描画
	divRoot.appendChild(getTitleDivLabel(`lblTitle`, g_lblNameObj.display, 0, 15, `settings_Display`));

	// オプションボタン用の設置
	createSettingsDisplayWindow(divRoot);

	// ショートカットキーメッセージ
	multiAppend(divRoot,
		createDescDiv(`scMsg`, g_lblNameObj.sdShortcutDesc),
		createCss2Button(`btnDisplayPreview`, `↓ Preview`, _evt => {
			toggleDisplayPreview();
		}, g_lblPosObj.btnDisplayPreview, g_cssObj.button_Setting),
	);
	createScText(btnDisplayPreview, `DisplayPreview`, { displayName: `settingsDisplay`, targetLabel: `btnDisplayPreview`, x: -25 });

	// ユーザカスタムイベント(初期)
	safeExecuteCustomHooks(`g_customJsObj.settingsDisplay`, g_customJsObj.settingsDisplay);

	// ボタン描画
	commonSettingBtn(`Settings`);

	// キー操作イベント（デフォルト）
	setShortcutEvent(g_currentPage);
	document.oncontextmenu = () => true;

	safeExecuteCustomHooks(`g_skinJsObj.settingsDisplay`, g_skinJsObj.settingsDisplay);
};

/** プレビューウィンドウのルートdiv */
let g_previewRoot = null;

/** プレビュー内の各UIオブジェクトの現在座標 */
const g_previewPos = {
	arrowJdg: { x: null, y: null },   // 通常判定キャラクタ・コンボ
	frzJdg: { x: null, y: null },     // フリーズ判定キャラクタ・コンボ
	shortcut: { x: null, y: null },
};

/**
 * プレビューのトグル（表示 / 非表示）
 */
const toggleDisplayPreview = () => {
	if (g_previewRoot && document.getElementById(`displayPreviewOverlay`)) {
		closeDisplayPreview();
		g_currentPage = `settingsDisplay`;
	} else {
		openDisplayPreview();
		g_currentPage = `displayPreview`;
	}
	setShortcutEvent(g_currentPage, () => true, { displayFlg: false });
};

/**
 * プレビューオーバーレイを開く
 */
const openDisplayPreview = () => {
	const divRoot = document.getElementById(`divRoot`);
	if (!divRoot) return;

	// 既存があれば削除
	closeDisplayPreview();

	// ============================================================
	// オーバーレイ本体
	// ============================================================
	const overlay = createEmptySprite(divRoot, `displayPreviewOverlay`, {
		w: g_sWidth, h: g_sHeight, background: g_headerObj.baseBrightFlg ? `#eeeeeeee` : `#111111dd`, pointerEvents: C_DIS_AUTO,
	});
	g_previewRoot = overlay;
	multiAppend(overlay,
		createDivCss2Label(`lblDisplayPreview`, `Display Preview`,
			g_lblPosObj.lblDisplayPreview, g_cssObj.settings_Display),
		createCss2Button(`btnDisplayPreview2`, `↑ Preview`, _evt => {
			toggleDisplayPreview();
		}, g_lblPosObj.btnDisplayPreview, g_cssObj.button_Setting),
		createCss2Button(`btnDisplayReset`, `Reset`, _evt => {
			if (window.confirm(g_msgObj.displayPreviewResetConfirm)) {
				Object.assign(g_diffObj, g_diffInitObj);
				Object.keys(g_diffInitObj).forEach(key => {
					g_localStorage[key] = g_diffInitObj[key];
				});
				Object.keys(g_previewPos).forEach(key => g_previewPos[key] = { x: null, y: null });
				closeDisplayPreview();
				openDisplayPreview();
			}
		}, g_lblPosObj.btnDisplayReset, g_cssObj.button_Reset),
		createDescDiv(`lblDisplayPreviewMsg`, g_lblNameObj.displayPreviewDesc),
	);
	if (g_headerObj.scAreaWidth > 0) {
		overlay.appendChild(createDescDiv(`lblDisplayPreviewMsg2`, g_lblNameObj.displayPreviewDesc2));
	}
	createScText(btnDisplayReset, `DisplayPreviewReset`, { displayName: `displayPreview`, targetLabel: `btnDisplayReset`, x: -15 });

	// ============================================================
	// プレイ画面フレーム（白枠）
	// ============================================================
	const rate = 0.8;
	const playW = g_headerObj.playingWidth || g_sWidth;
	const playH = g_headerObj.playingHeight || g_sHeight;
	const frameX = Math.round((g_sWidth - playW) / 2);
	const frameY = Math.round((g_sHeight - playH) / 2);

	const frame = createEmptySprite(overlay, `previewFrame`, {
		x: frameX, y: frameY, w: playW, h: playH,
		background: g_headerObj.baseBrightFlg ? `#eeeeee` : `#111111`,
		border: `1px solid #444444`,
		boxSizing: `border-box`,
		transform: `scale(${rate})`,
	});

	// ============================================================
	// Display設定に応じたUIを描画
	// ============================================================
	buildPreviewUI(frame, playW, playH);
};

/**
 * プレビューオーバーレイを閉じる
 */
const closeDisplayPreview = () => {
	const overlay = document.getElementById(`displayPreviewOverlay`);
	if (overlay) {
		deleteChildspriteAll(`displayPreviewOverlay`);
		overlay.remove();
	}
	g_previewRoot = null;
};

/**
 * プレビュー内のUI要素を構築する
 * @param {HTMLElement} _frame     プレイ画面フレーム要素
 * @param {number}      _playW     プレイ幅(px)
 * @param {number}      _playH     プレイ高さ(px)
 */
const buildPreviewUI = (_frame, _playW, _playH) => {

	// --- Display設定の現在値を取得 ---
	const d = {
		stepzone: g_stateObj.d_stepzone,
		judgment: g_stateObj.d_judgment,
		lifegauge: g_stateObj.d_lifegauge,
		score: g_stateObj.d_score,
		musicinfo: g_stateObj.d_musicinfo,
	};

	const disableBox = (_name, { x, y, w, h } = {}) =>
		createDivCss2Label(`previewDisableBox_${_name}`, `${g_emojiObj.crossMark} ${_name}`, {
			x, y, w, h, background: `rgba(0,0,0,0.5)`, border: `1px dashed #555555`,
			size: 32, color: `#cccccc`, align: C_ALIGN_LEFT,
		});

	// ============================================================
	// ステップゾーン（中央横帯）
	// ============================================================
	const stepY = g_posObj.stepY ?? C_STEP_Y;
	const revStepY = g_posObj.reverseStepY;
	const hitPos = g_stateObj.hitPosition ?? 0;

	// 簡易ステップゾーン（7レーン分）
	const laneCount = 7;
	const laneW = 50;
	const totalW = laneCount * laneW;
	const startX = Math.round((_playW - totalW) / 2);

	if (d.stepzone === C_FLG_OFF) {
		multiAppend(_frame,
			disableBox(`StepZone`, { x: Math.round(_playW / 2 - 200), y: stepY, w: 400, h: 50 }),
			disableBox(`StepZone_Rev`, { x: Math.round(_playW / 2 - 200), y: C_STEP_Y + revStepY, w: 400, h: 50 }),
		);
	} else {
		for (let j = 0; j < laneCount; j++) {
			createEmptySprite(_frame, `previewStep${j}`, {
				x: startX + j * laneW + 2, y: stepY + 2, w: laneW - 4, h: laneW - 4,
				background: `rgba(100,100,200,0.25)`,
				border: `1px solid rgba(150,150,255,0.5)`,
			});
			createEmptySprite(_frame, `previewStepR${j}`, {
				x: startX + j * laneW + 2, y: C_STEP_Y + revStepY + 2, w: laneW - 4, h: laneW - 4,
				background: `rgba(200,100,100,0.20)`,
				border: `1px solid rgba(255,150,150,0.4)`,
			});
		}
	}

	// ============================================================
	// HitPosition を視覚化する判定基準ライン
	// ============================================================
	// 通常譜面用の判定ライン（赤または目立つ色で、レーン幅全体をカバー）
	// 上から下に流れる場合、hitPosがプラスなら「ステップゾーンより下」にラインが来る
	const lineNormal = createEmptySprite(_frame, `previewHitPosLine`, {
		x: startX,
		y: stepY + Math.round(laneW / 2) + hitPos, // ステップゾーンの中心 + hitPos 
		w: totalW,
		h: 2, // 2pxの横線
		background: `#33aaff`,
		boxShadow: `0 0 4px #33aaff`, // ネオンっぽく光らせて目立たせる
	});

	// 青いラインの右端（totalW から10pxほど外側）に数値を表示
	multiAppend(
		lineNormal,
		createDivCss2Label(`previewHitPosTitle`, `Hit`, {
			...g_lblPosObj.previewHitPosText, x: -60, y: -14, align: C_ALIGN_RIGHT,
		}),
		createDivCss2Label(`previewHitPosTitle2`, `Position`, {
			...g_lblPosObj.previewHitPosText, x: -60, y: -2, align: C_ALIGN_RIGHT,
		}),
		createDivCss2Label(`previewHitPosText`, `${hitPos > 0 ? '+' : ''}${hitPos}px↑↓`, {
			...g_lblPosObj.previewHitPosText, x: totalW + 5, y: -8, align: C_ALIGN_LEFT,
		}),
	);

	// リバース譜面用の判定ライン
	// 下から上に流れる場合、hitPosがプラスなら「ステップゾーンより上（座標としてはマイナス）」に来る
	createEmptySprite(_frame, `previewHitPosLineRev`, {
		x: startX,
		y: (C_STEP_Y + revStepY) + Math.round(laneW / 2) - hitPos, // ステップゾーンの中心 - hitPos
		w: totalW,
		h: 2,
		background: `#ffaa00`,
		boxShadow: `0 0 4px #ffaa00`,
	});

	// ============================================================
	// 判定エリア（ドラッグ可能）
	// ============================================================
	if (d.judgment === C_FLG_OFF) {
		_frame.appendChild(disableBox(`Judgment`, {
			x: Math.round(_playW / 2 - 220), y: Math.round((_playH + (g_posObj?.stepYR ?? 0)) / 2 - 60), w: 440, h: 120,
		}));
	} else {
		const opacity = g_stateObj.opacity / 100;
		const jdgCenterY = Math.round((_playH + (g_posObj?.stepYR ?? 0)) / 2);
		const groupW = 370;
		const groupH = 51;

		const jdgSettings = [
			{
				key: `arrowJdg`,
				stdYOffset: -60,
				offsetX: g_diffObj.arrowJdgX ?? 0,
				offsetY: g_diffObj.arrowJdgY ?? 0,
				chara: d.judgment === C_FLG_ON ? g_lblNameObj.j_ii : ``,
				css: [g_cssObj.common_ii, g_cssObj.common_kita], // [chara, combo]
				toast: g_lblNameObj.arrowJdgUpdate,
			},
			{
				key: `frzJdg`,
				stdYOffset: 10,
				offsetX: g_diffObj.frzJdgX ?? 0,
				offsetY: g_diffObj.frzJdgY ?? 0,
				chara: d.judgment === C_FLG_ON ? g_lblNameObj.j_kita : ``,
				css: [g_cssObj.common_kita, g_cssObj.common_ii],
				toast: g_lblNameObj.frzJdgUpdate,
			}
		];

		jdgSettings.forEach(item => {

			const stdX = Math.round(_playW / 2 - (item.key === `arrowJdg` ? 220 : 120));
			const initX = g_previewPos[item.key].x ?? (stdX + item.offsetX);
			const initY = g_previewPos[item.key].y ?? (jdgCenterY + item.offsetY + item.stdYOffset);

			// グループコンテナの生成
			const group = createEmptySprite(_frame, `previewGrp_${item.key}`, {
				x: initX, y: initY, w: groupW, h: groupH, pointerEvents: C_DIS_AUTO,
			});

			// ラベル類の配置
			multiAppend(group,
				createDivCss2Label(`previewChara_${item.key}`, item.chara, {
					x: 0, y: 0, w: g_limitObj.jdgCharaWidth, h: g_limitObj.jdgCharaHeight,
					siz: g_limitObj.jdgCharaSiz, opacity,
				}, item.css[0]),
				createDivCss2Label(`previewCombo_${item.key}`, d.judgment === C_FLG_ON ? `5 Combo!!` : ``, {
					x: 170, y: 0, w: g_limitObj.jdgCharaWidth, h: g_limitObj.jdgCharaHeight,
					siz: g_limitObj.jdgCharaSiz, opacity,
				}, item.css[1]),
				createDivCss2Label(`previewDiff_${item.key}`, `Fast 3 Frames`, {
					x: 170, y: 25, w: g_limitObj.jdgCharaWidth, h: g_limitObj.jdgCharaHeight,
					siz: g_limitObj.mainSiz, color: `#ff9966`, opacity,
				}, g_cssObj.common_fast),
			);

			// ドラッグ機能を付与
			makeElementDraggable(group, item.key, _playW, _playH, { w: groupW, h: groupH }, {
				toastTitle: item.toast,
				getStdPos: () => ({
					x: stdX,
					y: Math.round(jdgCenterY + item.stdYOffset),
				}),
			});
		});
	}

	// ============================================================
	// ライフゲージ（左縦帯）
	// ============================================================
	if (d.lifegauge === C_FLG_OFF) {
		_frame.appendChild(disableBox(`LifeGauge`, g_lblPosObj.previewLifeDisabled));
	} else {
		multiAppend(_frame,
			createDivCss2Label(`previewLifeBack`, ``, g_lblPosObj.previewLifeBack, g_cssObj.life_Background),
			createDivCss2Label(`previewLifeBar`, ``, g_lblPosObj.previewLifeBar, g_cssObj.life_Cleared),
			createDivCss2Label(`previewLifeNum`, `700`, g_lblPosObj.previewLifeNum, g_cssObj.life_Cleared),
		);
	}

	// ============================================================
	// スコア・判定カウンタ（右端縦列）
	// ============================================================
	if (d.score === C_FLG_OFF) {
		_frame.appendChild(disableBox(`Score`, g_lblPosObj.previewScoreDisabled));

		if (g_stateObj.frzReturn !== C_FLG_OFF) {
			_frame.appendChild(disableBox(`FrzReturnBar`, g_lblPosObj.previewLifeFrzDisabled));
		}
	} else {
		const scoreItems = [
			{ name: `ii`, cnt: `5` },
			{ name: `shakin`, cnt: `0` },
			{ name: `matari`, cnt: `0` },
			{ name: `shobon`, cnt: `0` },
			{ name: `uwan`, cnt: `0` },
			{ name: `combo`, cnt: `5` },
			{},
			{ name: `kita`, cnt: `5` },
			{ name: `iknai`, cnt: `0` },
			{ name: `combo`, cnt: `5` },
		];
		const sx = _playW - 110 + g_headerObj.scAreaWidth;
		scoreItems.forEach((item, i) => {
			_frame.appendChild(
				createDivCss2Label(`previewScore${i}`, item.cnt || ``, {
					x: sx + 50, y: 20 * (i + 1), w: 50, h: 20,
					siz: 16, align: `right`,
				}, g_cssObj[`common_${item.name}`]),
			);
		});

		// FrzReturn用ゲージ
		if (g_stateObj.frzReturn !== C_FLG_OFF) {
			multiAppend(_frame,
				createDivCss2Label(`previewFrzLifeBack`, ``, g_lblPosObj.previewFrzLifeBack, g_cssObj.life_Background),
				createDivCss2Label(`previewFrzLifeBar`, ``, g_lblPosObj.previewFrzLifeBar, g_cssObj.life_frzNormal),
			);
		}
	}

	// ============================================================
	// 曲名・制作者（左下）
	// ============================================================
	if (d.musicinfo === C_FLG_OFF) {
		_frame.appendChild(disableBox(`MusicInfo`, g_lblPosObj.previewMusicInfoDisabled));
		_frame.appendChild(disableBox(`GaugeName`, g_lblPosObj.previewGaugeNameDisabled));
	} else {
		const creditName = `Sample Music / Artist Name`;
		const difName = `[7key / Normal]`;
		const checkMusicSiz = (_text, _siz) => getFontSize2(_text, g_headerObj.playingWidth - g_headerObj.customViewWidth - 125, { maxSiz: _siz });

		multiAppend(_frame,
			createDivCss2Label(`previewCredit`, creditName, {
				...g_lblPosObj.lblCredit, siz: checkMusicSiz(creditName, g_limitObj.musicTitleSiz)
			}),
			createDivCss2Label(`previewDifName`, difName, {
				...g_lblPosObj.lblDifName, siz: checkMusicSiz(difName, 12)
			}),
			createDivCss2Label(`previewTime1`, `0:04 /`, {
				...g_lblPosObj.lblTime1,
			}),
			createDivCss2Label(`previewTime2`, `2:54`, g_lblPosObj.lblTime2),

			// ゲージ設定名
			createDivCss2Label(`previewGauge`, `Original`, g_lblPosObj.lblGaugeMode),
		)
	}

	// ============================================================
	// ショートカット表示
	// ============================================================
	const scGroup = createEmptySprite(_frame, `previewScGroup`, {
		x: g_sWidth + g_headerObj.scAreaWidth - 85 + g_diffObj.shortcutX,
		y: _playH - 100 + g_diffObj.shortcutY, w: 80, h: 100, pointerEvents: C_DIS_AUTO,
	});
	multiAppend(scGroup,
		createDivCss2Label(`lblRetry`, `[${g_lblNameObj.l_retry}]`, { ...g_lblPosObj.lblMainScHeader, x: 0, y: 0 }),
		createDivCss2Label(`lblRetrySc`, g_kCd[g_headerObj.keyRetry],
			{ ...g_lblPosObj.lblMainScKey, x: 0, y: 15, fontWeight: g_headerObj.keyRetry === C_KEY_RETRY ? `normal` : `bold` }),
		createDivCss2Label(`lblTitleBack`, `[${g_lblNameObj.l_titleBack}]`, { ...g_lblPosObj.lblMainScHeader, x: 0, y: 35 }),
		createDivCss2Label(`lblTitleBackSc`, g_isMac ? `Shift+${g_kCd[g_headerObj.keyRetry]}` : g_kCd[g_headerObj.keyTitleBack],
			{ ...g_lblPosObj.lblMainScKey, x: 0, y: 50, fontWeight: g_headerObj.keyTitleBack === C_KEY_TITLEBACK ? `normal` : `bold` }),
		createDivCss2Label(`lblPause`, `[${g_lblNameObj.l_pause}]`, { ...g_lblPosObj.lblMainScHeader, x: 0, y: 70 }),
		createDivCss2Label(`lblPauseSc`, g_kCd[g_headerObj.keyPause],
			{ ...g_lblPosObj.lblMainScKey, x: 0, y: 85, fontWeight: g_headerObj.keyPause === C_KEY_PAUSE ? `normal` : `bold` }),
	);
	const scConfig = {
		toastTitle: g_lblNameObj.shortcutUpdate,
		getStdPos: () => ({
			x: g_sWidth + g_headerObj.scAreaWidth - 85,
			y: _playH - 100
		}),
	};
	makeElementDraggable(scGroup, `shortcut`, _playW, _playH, { w: 80, h: 100 }, scConfig);

	// ユーザカスタムイベント(プレビュー表示用)
	safeExecuteCustomHooks(`g_customJsObj.displayPreview`, g_customJsObj.displayPreview, _frame, _playW, _playH);
};

/**
 * プレビューが表示されたまま、HitPositionのラインだけを動かす
 * @param {number} _newHitPos 新しい g_stateObj.hitPosition の値
 */
const updatePreviewHitPositionLine = (_newHitPos) => {

	// 表示用の文字列を作成（例: "+15px", "-8px", "0px"）
	const sign = _newHitPos > 0 ? `+` : ``;
	const textValue = `${sign}${_newHitPos}px↑↓`;

	// 1. 各種基準座標を再取得（buildPreviewUI 内の計算ロジックと同期）
	const stepY = g_posObj.stepY ?? C_STEP_Y;
	const revStepY = g_posObj.reverseStepY;
	const laneW = 50;

	// 2. DOM要素を直接取得
	const lineNormal = document.getElementById(`previewHitPosLine`);
	const lineReverse = document.getElementById(`previewHitPosLineRev`);
	const textNormal = document.getElementById(`previewHitPosText`);

	// 3. プレビューが表示されている場合のみ、style.top を直接書き換える
	if (lineNormal) {
		const newY = stepY + Math.round(laneW / 2) + _newHitPos;
		lineNormal.style.top = wUnit(newY);
	}
	if (textNormal) {
		textNormal.textContent = textValue;
	}

	if (lineReverse) {
		const newY = (C_STEP_Y + revStepY) + Math.round(laneW / 2) - _newHitPos;
		lineReverse.style.top = wUnit(newY);
	}
};

/**
 * 要素をドラッグ可能にする（汎用ユーティリティ）
 * @param {HTMLElement} _target ドラッグ対象の要素
 * @param {string} _key 座標保存用のキー（g_previewPosオブジェクトのプロパティ名）
 * @param {number} _playW 制限範囲の幅
 * @param {number} _playH 制限範囲の高さ
 * @param {object} _bounds 要素自体のサイズ { w, h, scale } (はみ出し防止用)
 * @param {object} _config 座標反映ルールオブジェクト
 */
const makeElementDraggable = (_target, _key, _playW, _playH, _bounds, _config) => {
	let dragging = false;
	let dragStartX = 0, dragStartY = 0;
	let elemStartX = 0, elemStartY = 0;

	const boundsW = _bounds?.w ?? _target.offsetWidth ?? 0;
	const boundsH = _bounds?.h ?? _target.offsetHeight ?? 0;
	const scale = _bounds?.scale ?? 0.8;

	// ドラッグハンドル（薄い枠）を作成
	const handleId = _target.id ? `handle_${_target.id}` : `dragHandle_${Math.random().toString(36).slice(2, 9)}`;
	_target.style.cursor = `grab`;

	const bgColor = g_headerObj.baseBrightFlg ? `0,0,0` : `255,255,255`;
	createEmptySprite(_target, handleId, {
		x: 0, y: 0, w: boundsW, h: boundsH,
		border: `1px dashed rgba(${bgColor},0.3)`,
		boxSizing: `border-box`, borderRadius: `2px`,
		background: `rgba(${bgColor},0.04)`,
	});

	g_handler.addListener(_target, `pointerdown`, _evt => {
		dragging = true;
		dragStartX = _evt.clientX;
		dragStartY = _evt.clientY;
		elemStartX = parseInt(_target.style.left, 10) || 0;
		elemStartY = parseInt(_target.style.top, 10) || 0;
		_target.style.cursor = `grabbing`;
		_target.setPointerCapture(_evt.pointerId);
		_evt.stopPropagation();
	});

	g_handler.addListener(_target, `pointermove`, _evt => {
		if (!dragging) return;

		// 1. マウスの実際の移動量を計算
		const mouseDx = _evt.clientX - dragStartX;
		const mouseDy = _evt.clientY - dragStartY;

		// 2. 【最重要】スケール逆算して、縮小空間内の移動量に変換
		const dx = mouseDx / scale;
		const dy = mouseDy / scale;

		// 3. 境界値制限
		const minX = g_headerObj.playingLayout ? -g_headerObj.scAreaWidth : 0;
		const newX = Math.max(minX, Math.min(_playW + g_headerObj.scAreaWidth - boundsW, elemStartX + dx));
		const newY = Math.max(0, Math.min(_playH - boundsH, elemStartY + dy));

		_target.style.left = wUnit(newX);
		_target.style.top = wUnit(newY);
		_evt.stopPropagation();
	});

	g_handler.addListener(_target, `pointerup`, _evt => {
		if (!dragging) return;
		dragging = false;
		_target.style.cursor = `grab`;

		const finalX = parseInt(_target.style.left, 10) || 0;
		const finalY = parseInt(_target.style.top, 10) || 0;

		if (g_previewPos[_key]) {
			g_previewPos[_key].x = finalX;
			g_previewPos[_key].y = finalY;
		}
		if (_config) {
			applyElementPositionToGame(finalX, finalY, _config, _key);
		}
		_evt.stopPropagation();
	});

	g_handler.addListener(_target, `pointercancel`, _evt => {
		dragging = false;
		_target.style.cursor = `grab`;
	});
};

/**
 * ドラッグ結果の座標をゲーム本体の設定に汎用的に反映する
 * @param {number} _x 確定したframe相対X
 * @param {number} _y 確定したframe相対Y
 * @param {object} _config 反映用の設定オブジェクト
 * @param {string} _key 保存用キー(g_diffObjのプロパティ名の接頭辞)
 */
const applyElementPositionToGame = (_x, _y, _config, _key) => {

	// 1. 各要素固有の「標準座標（基準点）」を計算
	const std = _config.getStdPos();

	// 2. オフセット（差分）を計算
	const diffX = _x - std.x;
	const diffY = _y - std.y;

	// 3. 指定された保存先にオフセットを格納
	g_diffObj[`${_key}X`] = diffX;
	g_diffObj[`${_key}Y`] = diffY;
	g_localStorage[`${_key}X`] = diffX;
	g_localStorage[`${_key}Y`] = diffY;

	// 4. トースト表示 (通知が不要な要素なら省略可能にする)
	if (_config.toastTitle) {
		showToast(`${_config.toastTitle}: dX=${diffX}, dY=${diffY}`);
	}
};

/**
 * 画面上部に一時的なトーストメッセージを表示する
 * @param {string} _msg
 */
const showToast = _msg => {
	const existing = document.getElementById(`previewToast`);
	if (existing) existing.remove();

	const toast = createDivCss2Label(`previewToast`, _msg, {
		x: g_btnX() + g_btnWidth() / 2, y: 50, w: g_btnWidth() / 2, h: 10, siz: 12,
		transform: `translateX(-50%)`,
		background: `rgba(0,40,80,0.92)`,
		color: `#aaddff`,
		border: `1px solid #3366aa`,
		borderRadius: `6px`,
		padding: `6px 16px`,
		fontFamily: `monospace`,
		whiteSpace: `nowrap`,
		pointerEvents: C_DIS_NONE,
		transition: `opacity 0.4s`,
		opacity: `1`,
	});
	divRoot.appendChild(toast);
	g_timerHandler.setTimeout(() => { toast.style.opacity = `0`; }, 2200);
	g_timerHandler.setTimeout(() => { if (toast.parentNode) toast.remove(); }, 2700);
};

/**
 * 設定・オプション画面のラベル・ボタン処理の描画
 * @param {Object} _sprite 基準とするスプライト(ここで指定する座標は、そのスプライトからの相対位置)
 */
const createSettingsDisplayWindow = _sprite => {

	/**
	 * Display表示/非表示ボタン
	 * @param {string} _name 
	 * @param {number} _heightPos 縦位置
	 * @param {number} _widthPos 横位置
	 */
	const makeDisplayButton = (_name, _heightPos, _widthPos) => {

		const flg = g_stateObj[`d_${_name.toLowerCase()}`];
		const linkId = `lnk${_name}`;

		if (g_headerObj[`${_name}Use`]) {

			// 設定名、CSS名(2種)、表示名
			const list = [C_FLG_OFF, C_FLG_ON].concat(g_settings[`d_${_name}s`] || []);
			const cssBarList = [C_FLG_OFF, C_FLG_ON].concat(Array(g_settings[`d_${_name}s`]?.length).fill(g_settings.d_cssBarExName) || []);
			const cssBgList = [g_settings.d_cssBgName, g_settings.d_cssBgName].concat(Array(g_settings[`d_${_name}s`]?.length).fill(g_settings.d_cssBgExName) || []);
			const lbls = [toCapitalize(_name), toCapitalize(_name)].concat(g_settings[`d_${_name}s`] || []);

			const dispView = () => [C_FLG_OFF, C_FLG_ON].includes(g_stateObj[`d_${_name.toLowerCase()}`]) ?
				g_lblNameObj[`d_${toCapitalize(_name)}`] : getStgDetailName(lbls[g_settings.displayNum[_name]]);

			const withShortCutDesc = () => createScText(document.getElementById(linkId), `${toCapitalize(_name)}`,
				{ displayName: g_currentPage, targetLabel: linkId, x: -5 });

			/**
			 * Displayボタン処理
			 * @param {number} _scrollNum 
			 * @param {boolean} _filterFlg 
			 */
			const switchDisplay = (_scrollNum = 1, _filterFlg = true) => {
				const prevDisp = g_settings.displayNum[_name];
				const [prevBarColor, prevBgColor] = [cssBarList[prevDisp], cssBgList[prevDisp]];

				g_settings.displayNum[_name] = nextPos(prevDisp, _scrollNum, _filterFlg ? 2 : list.length);
				const nextDisp = g_settings.displayNum[_name];
				const [nextBarColor, nextBgColor] = [cssBarList[nextDisp], cssBgList[nextDisp]];

				g_stateObj[`d_${_name.toLowerCase()}`] = list[g_settings.displayNum[_name]];
				document.getElementById(linkId).innerHTML = dispView();
				document.getElementById(linkId).classList.replace(g_cssObj[`button_${prevBarColor}`], g_cssObj[`button_${nextBarColor}`]);
				document.getElementById(linkId).classList.replace(g_cssObj[`button_${prevBgColor}`], g_cssObj[`button_${nextBgColor}`]);

				withShortCutDesc();
				interlockingButton(g_headerObj, _name, nextBarColor, prevBarColor, true);
				updateSettingSummary();
			};

			// Displayボタン初期化
			g_settings.displayNum[_name] = list.findIndex(flg => flg === g_stateObj[`d_${_name.toLowerCase()}`]);
			displaySprite.appendChild(
				makeSettingLblCssButton(linkId, dispView(), _heightPos, () => switchDisplay(), {
					x: 30 + 180 * _widthPos, y: 20 * _heightPos, w: 170, h: 18,
					title: g_msgObj[`d_${_name.toLowerCase()}`], borderStyle: `solid`,
					cxtFunc: () => switchDisplay(-1),
				}, `button_${cssBgList[g_settings.displayNum[_name]]}`, `button_${cssBarList[g_settings.displayNum[_name]]}`)
			);
			withShortCutDesc();

			// Display切替ボタン（ON/OFF以外用）
			if (g_settings[`d_${_name}s`] !== undefined) {
				displaySprite.appendChild(
					makeSettingLblCssButton(`${linkId}R`, `>`, _heightPos, () => switchDisplay(1, false), {
						x: 175 + 180 * _widthPos, w: 25, y: 2 + 20 * _heightPos, h: 18, cxtFunc: () => switchDisplay(-1, false),
					}, g_cssObj.button_Mini)
				);
			}
		} else {
			displaySprite.appendChild(
				createDivCss2Label(linkId, g_lblNameObj[`d_${toCapitalize(_name)}`] + `:${g_headerObj[`${_name}Set`]}`, {
					x: 30 + 180 * _widthPos, y: 3 + 20 * _heightPos,
					w: 170, siz: g_limitObj.difSelectorSiz,
				}, g_cssObj[`button_Disabled${flg}`])
			);
		}
	};

	// 各ボタン用のスプライトを作成
	const optionsprite = createEmptySprite(_sprite, `optionsprite`, g_windowObj.optionSprite);

	// 設定毎に個別のスプライトを作成し、その中にラベル・ボタン類を配置
	const displaySprite = createEmptySprite(optionsprite, `displaySprite`, g_windowObj.displaySprite);
	const spriteList = setSpriteList(g_settingPos.settingsDisplay);

	_sprite.appendChild(createDivCss2Label(`sdDesc`, g_lblNameObj.sdDesc, g_lblPosObj.sdDesc));
	g_displays.forEach((name, j) => makeDisplayButton(name, j % 6, Math.floor(j / 6)));

	// ---------------------------------------------------
	// 矢印の見え方 (Appearance)
	// 縦位置: 5.8
	createGeneralSetting(spriteList.appearance, `appearance`, {
		addRFunc: () => dispAppearanceSlider(),
	});

	// Hidden+/Sudden+初期値用スライダー、ロックボタン
	multiAppend(spriteList.appearance,
		createDivCss2Label(`lblAppearancePos`, `${g_hidSudObj.distH[g_stateObj.appearance](g_hidSudObj.filterPos)}`, g_lblPosObj.lblAppearancePos),
		createDivCss2Label(`lblAppearanceBar`, `<input id="appearanceSlider" type="range" value="${g_hidSudObj.filterPos}" min="0" max="100" step="1">`,
			g_lblPosObj.lblAppearanceBar),
		createCss2Button(`lnkLockBtn`, g_lblNameObj.filterLock, evt => setLockView(evt.target), {
			...g_lblPosObj.lnkLockBtn, cxtFunc: evt => setLockView(evt.target),
		}, g_cssObj.button_Default, g_cssObj[`button_Rev${g_stateObj.filterLock}`]),
	);

	const setLockView = (_btn) => {
		const prevLock = g_stateObj.filterLock;
		g_settings.filterLockNum = (g_settings.filterLockNum + 1) % 2;
		g_stateObj.filterLock = g_settings.filterLocks[g_settings.filterLockNum];

		_btn.classList.replace(g_cssObj[`button_Rev${prevLock}`],
			g_cssObj[`button_Rev${g_stateObj.filterLock}`]);
		updateSettingSummary();
	};

	const appearanceSlider = document.getElementById(`appearanceSlider`);
	g_handler.addListener(appearanceSlider, `input`, () => {
		g_hidSudObj.filterPos = inputSlider(appearanceSlider, lblAppearancePos, `appearance`);
		updateSettingSummary();
	}, false);

	const dispAppearanceSlider = () => {
		[`lblAppearanceBar`, `lnkLockBtn`, `lnkfilterLine`].forEach(obj =>
			$id(obj).visibility = g_appearanceRanges.includes(g_stateObj.appearance) ? `Visible` : `Hidden`);
		inputSlider(appearanceSlider, lblAppearancePos, `appearance`);
	};
	dispAppearanceSlider();

	// ---------------------------------------------------
	// 判定表示系の不透明度 (Opacity)
	// 縦位置: 7.4
	g_headerObj.opacityUse = g_headerObj.judgmentUse || g_headerObj.judgmentSet === C_FLG_ON;

	createGeneralSetting(spriteList.opacity, `opacity`, { unitName: g_lblNameObj.percent });

	// ---------------------------------------------------
	// タイミング調整 (HitPosition)
	// 縦位置: 8.4
	createGeneralSetting(spriteList.hitPosition, `hitPosition`, {
		skipTerms: g_settings.hitPositionTerms, scLabel: g_lblNameObj.sc_hitPosition, roundNum: 5,
		unitName: g_lblNameObj.pixel,
		addRFunc: () => updatePreviewHitPositionLine(g_stateObj.hitPosition),
	});
};

/**
 * Displayボタンを切り替えたときに連動して切り替えるボタンの設定
 * @param {object} _headerObj 
 * @param {string} _name 
 * @param {string} _current 変更元
 * @param {string} _next 変更先
 * @param {boolean} _buttonFlg ボタンフラグ (false: 初期, true: ボタン)
 */
const interlockingButton = (_headerObj, _name, _current, _next, _buttonFlg = false) => {
	let includeDefaults = [];
	if (g_stateObj[`d_${_name.toLowerCase()}`] === C_FLG_OFF) {
		g_displays.forEach(option => {
			if (option === _name) {
				return;
			}
			if (g_stateObj[`d_${option.toLowerCase()}`] === C_FLG_ON && _headerObj[`${option}Default`] !== undefined) {
				includeDefaults = includeDefaults.concat(_headerObj[`${option}ChainOFF`]);
			}
		});
	}

	if (_headerObj[`${_name}ChainOFF`].length !== 0) {

		// 連動してOFFにするボタンの設定
		_headerObj[`${_name}ChainOFF`].filter(defaultOption => !includeDefaults.includes(defaultOption))
			.forEach(defaultOption => {
				g_stateObj[`d_${defaultOption.toLowerCase()}`] = _next;
				if (_buttonFlg) {
					let txtDisabled = ``;
					if (!g_headerObj[`${defaultOption}Use`]) {
						txtDisabled = `Disabled`;
						document.getElementById(`lnk${defaultOption}`).textContent = `${toCapitalize(defaultOption)}:${_next}`;
					}
					document.getElementById(`lnk${defaultOption}`).classList.replace(g_cssObj[`button_${txtDisabled}${_current}`], g_cssObj[`button_Disabled${_next}`]);
				}
				// さらに連動する場合は設定を反転
				interlockingButton(_headerObj, defaultOption, _next, _current, _buttonFlg);
			});
	}
};

/*-----------------------------------------------------------*/
/* Scene : EX-SETTINGS [apple] */
/*-----------------------------------------------------------*/

const exSettingInit = () => {
	clearWindow();
	g_currentPage = `exSetting`;

	multiAppend(divRoot,

		// 画面タイトル
		getTitleDivLabel(`lblTitle`,
			`<div class="settings_Title">EX-</div><div class="settings_Title2">SETTINGS</div>`
				.replace(/[\t\n]/g, ``), 0, 15, g_cssObj.flex_centering),

	);

	// 各ボタン用のスプライトを作成
	createEmptySprite(divRoot, `optionsprite`, g_windowObj.optionSprite);
	const spriteList = setSpriteList(g_settingPos.exSetting);

	createGeneralSettingEx(spriteList, `playWindow`, { defaultList: [`Default`] });
	createGeneralSetting(spriteList.stepArea, `stepArea`);
	createGeneralSettingEx(spriteList, `frzReturn`);
	createGeneralSetting(spriteList.shaking, `shaking`);
	createGeneralSetting(spriteList.effect, `effect`, {
		addRFunc: () => {
			g_stateObj.d_arroweffect = boolToSwitch(g_stateObj.effect !== C_FLG_OFF || g_headerObj.arrowEffectSetFlg);
			g_headerObj.arrowEffectUse = g_stateObj.effect === C_FLG_OFF && g_headerObj.arrowEffectUseOrg;
			g_headerObj.arrowEffectSet = g_stateObj.d_arroweffect;
		},
	});
	createGeneralSettingEx(spriteList, `camoufrage`, { defaultList: [] });
	createGeneralSetting(spriteList.swapping, `swapping`);
	createGeneralSetting(spriteList.judgRange, `judgRange`, {
		addRFunc: () => {
			[g_judgObj.arrowJ, g_judgObj.frzJ] = g_judgRanges[g_stateObj.judgRange];
			lblJudgRangeView.innerHTML = getJudgRangeView();
		}
	});
	createGeneralSetting(spriteList.autoRetry, `autoRetry`);

	// 判定範囲の設定を表示
	const getJudgRangeView = () => `| ` +
		`<span class="common_ii">${g_lblNameObj.j_ii}</span>: ≦ <b>±${g_judgObj.arrowJ[0]} f</b> | ` +
		`<span class="common_shakin">${g_lblNameObj.j_shakin}</span>: ≦ <b>±${g_judgObj.arrowJ[1]} f</b> | ` +
		`<span class="common_matari">${g_lblNameObj.j_matari}</span>: ≦ <b>±${g_judgObj.arrowJ[2]} f</b> | <br>| ` +
		`<span class="common_shobon">${g_lblNameObj.j_shobon}</span>: ≦ <b>±${g_judgObj.arrowJ[3]} f</b> | ` +
		`<span class="common_uwan">${g_lblNameObj.j_uwan}</span>: > <b>±${g_judgObj.arrowJ[3]} f</b> | <br>| ` +
		`<span class="common_kita">${g_lblNameObj.j_kita}</span>: ≦ <b>±${g_judgObj.frzJ[1]} f</b> | ` +
		`<span class="common_iknai">${g_lblNameObj.j_iknai}</span>: > <b>±${g_judgObj.frzJ[1]} f</b> |`;

	multiAppend(judgRangeSprite,
		createDivCss2Label(`lblJudgRangeView`, getJudgRangeView(), {
			x: parseFloat($id(`lblJudgRange`).left) + 10, y: parseFloat($id(`lblJudgRange`).top) + 25, w: 300, h: 30, siz: 13,
			align: C_ALIGN_LEFT,
		}),
	);

	// ユーザカスタムイベント(初期)
	safeExecuteCustomHooks(`g_customJsObj.exSetting`, g_customJsObj.exSetting);

	// 設定系のボタン群をまとめて作成（Data Save, Display切替, Back, KeyConfig, Playボタン）
	commonSettingBtn(g_currentPage);

	// キー操作イベント（デフォルト）
	setShortcutEvent(g_currentPage, () => true, { dfEvtFlg: true });
	document.oncontextmenu = () => true;

	safeExecuteCustomHooks(`g_skinJsObj.exSetting`, g_skinJsObj.exSetting);
};

/**
 * 拡張設定込みの標準設定
 * @param {any[]} _spriteList
 * @param {string} _name 
 * @param {{ defaultList?: string[], displayName?: string, func?: Function, funcEx?: Function }} [options={}]
 * @param {string[]} [options.defaultList=[C_FLG_OFF]] 拡張設定未使用の設定リスト
 * @param {string} [options.displayName='exSetting']
 * @param {Function} [options.func=()=>true] 通常ボタン用追加関数
 * @param {Function} [options.funcEx=()=>true] 拡張ボタン用追加関数
 */
const createGeneralSettingEx = (_spriteList, _name, { defaultList = [C_FLG_OFF], displayName = `exSetting`,
	func = () => true, funcEx = () => true } = {}) => {
	if (_spriteList?.[_name] === undefined) return;

	/**
	 * 拡張ボタンの表示・非表示と通常ボタンの幅変更
	 */
	const setExpandedBtnSiz = () => {
		const camelH = toCapitalize(_name);
		const isDefault = defaultList.includes(g_stateObj[_name]);
		if (isDefault) {
			$id(`lnk${camelH}Type`).display = C_DIS_NONE;
			$id(`lnk${camelH}`).left = wUnit(g_limitObj.setLblLeft);
			$id(`lnk${camelH}`).width = wUnit(g_limitObj.setLblWidth);
		} else {
			$id(`lnk${camelH}Type`).display = C_DIS_INHERIT;
			$id(`lnk${camelH}`).left = wUnit(g_limitObj.setLblLeftShort);
			$id(`lnk${camelH}`).width = wUnit(g_limitObj.setLblWidthShort);
		}
		const labelWidth = isDefault ? g_limitObj.setLblWidth : g_limitObj.setLblWidthShort - 10;
		$id(`lnk${camelH}`).fontSize = wUnit(getFontSize2(getStgDetailName(g_stateObj[_name]), labelWidth, { maxSiz: g_limitObj.setLblSiz }));
	};

	/**
	 * 拡張ボタンの作成
	 * @returns {HTMLDivElement}
	 */
	const createExpandedBtn = () =>
		createCss2Button(`lnk${toCapitalize(_name)}Type`, getStgDetailName(g_stateObj[`${_name}Type`]),
			() => {
				setSetting(1, `${_name}Type`, { maxSiz: g_limitObj.difSelectorSiz });
				funcEx();
				createExpandedScView(_name);
			},
			{
				...g_lblPosObj.btnReverse,
				cxtFunc: () => {
					setSetting(-1, `${_name}Type`, { maxSiz: g_limitObj.difSelectorSiz });
					funcEx();
					createExpandedScView(_name);
				},
				title: g_msgObj[`${_name}Type`] ?? ``,
			}, g_cssObj.button_Default, g_cssObj.button_RevON);

	/**
	 * 拡張ボタンのショートカット表示、拡張ボタンのCSS切り替え
	 */
	const createExpandedScView = () => {
		const settingLabel = `${toCapitalize(_name)}Type`;
		if (document.getElementById(`sc${settingLabel}`) === null) {
			createScText(document.getElementById(`lnk${settingLabel}`), settingLabel, {
				displayName, targetLabel: `lnk${settingLabel}`, x: -13
			});
		}
		document.getElementById(`lnk${settingLabel}`).classList.remove(g_cssObj.button_RevON, g_cssObj.button_RevOFF);
		document.getElementById(`lnk${settingLabel}`).classList.add(g_cssObj[`button_Rev${boolToSwitch(g_stateObj[`${_name}Type`] !== C_FLG_HYPHEN)}`]);
	};

	// TypeUse 未定義時は true 扱いにする
	const typeEnabled = setBoolVal(g_headerObj[`${_name}TypeUse`], true);
	createGeneralSetting(_spriteList[_name], _name, {
		addRFunc: () => {
			if (typeEnabled) {
				setExpandedBtnSiz();
			}
			func();
		},
	});
	if (typeEnabled) {
		_spriteList[_name].appendChild(createExpandedBtn());
		setExpandedBtnSiz();
		createExpandedScView();
	}
};
