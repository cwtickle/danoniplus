/**
 * Dancing☆Onigiri (CW Edition)
 * キーコンフィグ画面
 * - ページ: keyConfig
 *
 * Source by tickle
 * Created : 
 * Revised : 
 *
 * https://github.com/cwtickle/danoniplus
 */

/*-----------------------------------------------------------*/
/* Scene : KEYCONFIG [orange] */
/*-----------------------------------------------------------*/

/**
 * キーコンフィグ画面初期化
 * @param {string} _kcType
 * @param {boolean} _initFlg 初期表示フラグ
 */
const keyConfigInit = (_kcType = g_kcType, _initFlg = false) => {

	clearWindow();
	const divRoot = document.getElementById(`divRoot`);
	g_kcType = _kcType;
	g_currentPage = `keyConfig`;
	let selectedKc = `Default`;

	// 譜面初期情報ロード許可フラグ
	g_canLoadDifInfoFlg = false;

	if (_initFlg) {
		g_stateObj.keyLockFlg = false;
		g_stateObj.kbPreviewFlg = false;
	}

	multiAppend(divRoot,

		// キーコンフィグ画面タイトル
		getTitleDivLabel(`lblTitle`,
			`<div class="settings_Title">${g_lblNameObj.key}</div><div class="settings_Title2">${g_lblNameObj.config}</div>`
				.replace(/[\t\n]/g, ``), 0, 15, g_cssObj.flex_centering),

		createDescDiv(`kcDesc`, getKcDescMsg()),

		createDescDiv(`kcShuffleDesc`,
			g_headerObj.shuffleUse && g_settings.shuffles.filter(val => val.endsWith(`+`)).length > 0
				? g_lblNameObj.kcShuffleDesc : g_lblNameObj.kcNoShuffleDesc),
	);

	/**
	 * keyconSpriteのスクロール位置調整
	 * @param {number} _targetX 
	 */
	const adjustScrollPoint = _targetX => {
		if (maxLeftX !== 0) {
			keyconSprite.scrollLeft = Math.max(0, _targetX - g_sWidth / 2);
		}
	};

	/**
	 * キーコンフィグ用の矢印色を取得
	 * @param {number} _j
	 * @param {number} _colorPos
	 * @returns {string} 
	 */
	const getKeyConfigColor = (_j, _colorPos) => {
		let arrowColor = g_headerObj.setColor[_colorPos];

		// 色変化データの利用条件設定（Default/Type0限定）
		const storageObj = g_stateObj.extraKeyFlg ? g_localStorage : g_localKeyStorage;
		const baseGroupNum = g_keycons.colorGroupNum === -1
			? (storageObj?.[`keyCtrlPtn${g_keyObj.currentKey}`] ?? storageObj?.keyCtrlPtn ?? 0)
			: g_keycons.colorGroupNum;
		const currentColorGr = g_keyObj[`color${keyCtrlPtn}_${g_keycons.colorGroupNum}`];
		const baseColorGr = g_baseColorGrs?.[`color${keyCtrlPtn}_${baseGroupNum}`];
		if (hasVal(initColors[_j]) && g_keycons.colorDefTypes.includes(g_colorType)
			&& currentColorGr?.[_j] === baseColorGr?.[_j]) {
			arrowColor = initColors[_j];
		}

		// アシスト設定時はアシストの色を優先して適用
		if (typeof g_keyObj[`assistPos${keyCtrlPtn}`] === C_TYP_OBJECT &&
			g_keyObj[`assistPos${keyCtrlPtn}`][g_stateObj.autoPlay] !== undefined &&
			!g_autoPlaysBase.includes(g_stateObj.autoPlay)) {
			if (g_keyObj[`assistPos${keyCtrlPtn}`][g_stateObj.autoPlay][_j] === 1) {
				arrowColor = g_headerObj.setDummyColor[_colorPos];
			}
		}
		return arrowColor;
	};

	/**
	 * 対象割り当てキーの色変更
	 * @param {number} _j 
	 * @param {number} _k 
	 * @param {string} _cssName 
	 */
	const changeKeyConfigColor = (_j, _k, _cssName) =>
		changeConfigColor(document.getElementById(`keycon${_j}_${_k}`), _cssName);

	/**
	 * 一時的に矢印色・シャッフルグループを変更（共通処理）
	 * @param {string} _type 
	 * @param {number} _len 
	 * @param {number} _j 
	 * @param {number} _scrollNum 
	 * @returns {number}
	 */
	const changeTmpData = (_type, _len, _j, _scrollNum) => {
		const tmpNo = nextPos(g_keyObj[`${_type}${keyCtrlPtn}_${g_keycons[`${_type}GroupNum`]}`][_j], _scrollNum, _len);
		g_keyObj[`${_type}${keyCtrlPtn}`][_j] = tmpNo;
		g_keyObj[`${_type}${keyCtrlPtn}_${g_keycons[`${_type}GroupNum`]}`][_j] = tmpNo;

		return tmpNo;
	};

	/**
	 * 一時的に矢印色を変更
	 * @param {number} _j
	 * @param {number} _scrollNum 
	 */
	const changeTmpColor = (_j, _scrollNum = 1) => {
		const changeTmpOneColor = _idx => {
			changeTmpData(`color`, g_headerObj.setColor.length, _idx, _scrollNum);
			const arrowColor = getKeyConfigColor(_idx, g_keyObj[`color${keyCtrlPtn}`][_idx]);
			$id(`arrow${_idx}`).background = arrowColor;
			$id(`arrowShadow${_idx}`).background = getShadowColor(g_keyObj[`color${keyCtrlPtn}`][_idx], arrowColor);
		};

		if (g_stateObj.keyLockFlg && keyIsShift()) {
			const tmpList = [];
			g_keyObj[`color${keyCtrlPtn}`].forEach((val, idx) => {
				if (val === g_keyObj[`color${keyCtrlPtn}`][_j]) {
					tmpList.push(idx);
				}
			});
			tmpList.forEach(idx => changeTmpOneColor(idx));
		} else {
			changeTmpOneColor(_j);
		}
		adjustScrollPoint(parseFloat($id(`keyGroup${_j}`).left));
	};

	/**
	 * 一時的にシャッフルグループ番号を変更
	 * @param {number} _j 
	 * @param {number} _scrollNum 
	 */
	const changeTmpShuffleNum = (_j, _scrollNum = 1) => {
		const changeTmpOneShuffle = _idx => {
			const tmpShuffle = changeTmpData(`shuffle`, g_keyObj[`keyCtrl${keyCtrlPtn}`].length - 1, _idx, _scrollNum);
			document.getElementById(`sArrow${_idx}`).textContent = tmpShuffle + 1;
			changeShuffleConfigColor(keyCtrlPtn, g_keyObj[`shuffle${keyCtrlPtn}_${g_keycons.shuffleGroupNum}`][_idx], _idx);
		};

		if (g_stateObj.keyLockFlg && keyIsShift()) {
			const tmpList = [];
			g_keyObj[`shuffle${keyCtrlPtn}`].forEach((val, idx) => {
				if (val === g_keyObj[`shuffle${keyCtrlPtn}`][_j]) {
					tmpList.push(idx);
				}
			});
			tmpList.forEach(idx => changeTmpOneShuffle(idx));
		} else {
			changeTmpOneShuffle(_j);
		}
		adjustScrollPoint(parseFloat($id(`keyGroup${_j}`).left));
	};

	/**
	 * 指定関数群だけを抽出したtransform文字列を作成
	 * @param {string} _cssString
	 * @param {string[]} _funcNames
	 * @returns {string}
	 */
	const extractTransformFuncs = (_cssString, _funcNames) => {
		const pattern = new RegExp(`\\b(${_funcNames.join(`|`)})\\([^)]*\\)`, `g`);
		return (_cssString.match(pattern) || []).join(` `);
	};

	/**
	 * 対象レーンのレイヤー番号を取得
	 * @param {number} _j
	 * @param {number} _posj
	 * @returns {number}
	 */
	const getLayerIdx = (_j, _posj) => {
		const baseLayer = g_keyObj[`layerGroup${keyCtrlPtn}`]?.[_j] || 0;
		const rowFlg = Number(_posj > divideCnt); // reverse/scrollDirは考慮せず固定
		return baseLayer * 2 + rowFlg;
	};

	/**
	 * 対象レイヤーの回転変形を取得
	 * @param {string} _keyCtrlPtn
	 * @returns {string[]}
	 */
	const getLayerRotateParts = _keyCtrlPtn => {
		const raw = g_keyObj[`layerTrans${_keyCtrlPtn}`]?.[0] ?? [``, ``, ``, ``];
		return raw.map(trans => trans === `` ? `` : extractTransformFuncs(trans, [`rotate`, `rotateX`, `rotateY`, `rotateZ`, `rotate3d`]));
	};

	// キーの一覧を表示するための準備
	const C_LAYER_Y_OFFSET = 10; // baseLayerごとの縦オフセット量
	const keyconSprite = createEmptySprite(divRoot, `keyconSprite`, g_windowObj.keyconSprite);
	const tkObj = getKeyInfo();
	const [keyCtrlPtn, keyNum, posMax, divideCnt] =
		[tkObj.keyCtrlPtn, tkObj.keyNum, tkObj.posMax, tkObj.divideCnt];

	g_keyCopyLists.simpleDef.forEach(header => updateKeyInfo(header, keyCtrlPtn));
	addTransform(`keyconSprite`, `root`, `scale(${g_keyObj.scale})`, g_transPriority.scale);
	keyconSprite.style.height = wUnit(parseFloat(keyconSprite.style.height) / ((1 + g_keyObj.scale) / 2));
	const kWidth = parseInt(keyconSprite.style.width);
	changeSetColor();

	const maxLeftPos = Math.max(divideCnt, posMax - divideCnt - 2) / 2;
	const maxLeftX = Math.min(0, (kWidth - C_ARW_WIDTH) / 2 - maxLeftPos * g_keyObj.blank);

	g_keycons.cursorNumList = [...Array(keyNum).keys()].map(i => i);
	const configKeyGroupList = g_headerObj.keyGroupOrder[g_stateObj.scoreId] ??
		g_keyObj[`keyGroupOrder${keyCtrlPtn}`] ?? tkObj.keyGroupList;
	g_keycons.colorCursorNum = 0;

	// 色変化中の初期色を取得（矢印枠のみ）
	const arrowColorTmp = g_detailObj.miniMapParams[g_stateObj.scoreId]._scoreObj.ncolorData.Arrow;
	const arrowColors = Array.from({ length: Math.ceil(arrowColorTmp.length / 5) }, (_, i) =>
		arrowColorTmp.slice(i * 5, i * 5 + 5)
	).filter(val => val[0] === 0);
	const initColors = [];
	arrowColors.forEach(val => {
		const laneToken = val[1];
		const laneStr = String(laneToken ?? ``);
		if (laneStr.startsWith('g')) {
			// g付きの場合は矢印グループから対象の矢印番号を検索
			const groupVal = setIntVal(laneStr.slice(1));
			for (let j = 0; j < tkObj.keyNum; j++) {
				if (g_keyObj[`color${tkObj.keyCtrlPtn}`][j] === groupVal) {
					initColors[j] = makeColorGradation(val[2]);
				}
			}
		} else {
			const laneIdx = setIntVal(laneToken, -1);
			if (laneIdx >= 0 && laneIdx < tkObj.keyNum) {
				initColors[laneIdx] = makeColorGradation(val[2]);
			}
		}
	});
	if (_initFlg) {
		g_baseColorGrs = {};
		const colorKey = Object.keys(g_keyObj).filter(val => val.startsWith(`color${g_keyObj.currentKey}`));
		colorKey.forEach(val => g_baseColorGrs[val] = g_keyObj[val]);
	}

	const layerParts = getLayerRotateParts(keyCtrlPtn);
	g_keycons.layerIdxList = [];

	// キーコンフィグの矢印表示
	const addLeft = (maxLeftX === 0 ? 0 : - maxLeftX + g_limitObj.kcColorPickerX);
	for (let j = 0; j < keyNum; j++) {

		const posj = g_keyObj[`pos${keyCtrlPtn}`][j];
		const stdPos = posj - ((posj > divideCnt ? posMax : 0) + divideCnt) / 2;
		const baseLayer = g_keyObj[`layerGroup${keyCtrlPtn}`]?.[j] || 0;
		const layerIdx = getLayerIdx(j, posj); // baseLayer*2 + Number(posj > divideCnt)
		const layerRotate = layerParts[layerIdx] || ``;
		g_keycons.layerIdxList[j] = layerIdx;

		const keyconX = g_keyObj.blank * stdPos + (kWidth - C_ARW_WIDTH) / 2 + addLeft;
		const keyconY = C_KYC_HEIGHT * (Number(posj > divideCnt)) + 12 + baseLayer * C_LAYER_Y_OFFSET;
		const colorPos = g_keyObj[`color${keyCtrlPtn}`][j];
		const arrowColor = getKeyConfigColor(j, colorPos);

		keyconSprite.appendChild(
			createCss2Button(`color${j}`, ``, () => changeTmpColor(j), {
				x: keyconX, y: keyconY, w: C_ARW_WIDTH, h: C_ARW_WIDTH,
				cxtFunc: () => changeTmpColor(j, -1),
			}, g_cssObj.button_Default_NoColor, g_cssObj.title_base)
		);

		// キーごとの親コンテナ（矢印要素を囲う）
		const keyGroup = createEmptySprite(keyconSprite, `keyGroup${j}`, { x: keyconX, y: keyconY, w: C_ARW_WIDTH, h: C_ARW_WIDTH });
		if (layerRotate !== ``) {
			keyGroup.style.transform = layerRotate; // ここだけがlayer変形の適用箇所
		}
		// キーコンフィグ表示用の矢印・おにぎりを表示
		multiAppend(keyGroup,
			// 矢印の塗り部分
			createColorObject2(`arrowShadow${j}`, {
				background: hasVal(g_headerObj[`setShadowColor${g_colorType}`][colorPos]) ? getShadowColor(colorPos, arrowColor) : ``,
				rotate: g_keyObj[`stepRtn${keyCtrlPtn}_${g_keycons.stepRtnGroupNum}`][j], styleName: `Shadow`,
			}),
			// 矢印本体
			createColorObject2(`arrow${j}`, {
				background: arrowColor, rotate: g_keyObj[`stepRtn${keyCtrlPtn}_${g_keycons.stepRtnGroupNum}`][j],
			}),
		);
		if (g_headerObj.shuffleUse && g_keyObj[`shuffle${keyCtrlPtn}`] !== undefined) {
			keyconSprite.appendChild(
				createCss2Button(`sArrow${j}`, ``, () => changeTmpShuffleNum(j), {
					x: keyconX, y: keyconY - 12, w: C_ARW_WIDTH, h: 15, siz: 12, fontWeight: `bold`,
					pointerEvents: (g_settings.shuffles.filter(val => val.endsWith(`+`)).length > 0 ? C_DIS_AUTO : C_DIS_NONE),
					cxtFunc: () => changeTmpShuffleNum(j, -1),
				}, g_cssObj.button_Default_NoColor, g_cssObj.title_base)
			);
		}
		if (g_isDebug) {
			keyconSprite.appendChild(
				createDivCss2Label(`arrowChara${j}`, g_keyObj[`chara${keyCtrlPtn}`][j], {
					x: keyconX, y: keyconY + 40, w: C_ARW_WIDTH, h: 10, siz: 10, align: C_ALIGN_CENTER,
					background: g_headerObj.baseBrightFlg ? `rgba(255,255,255,0.5)` : `rgba(0,0,0,0.5)`,
				}, g_cssObj.title_base)
			);
		}

		// 割り当て先のキー名を表示
		for (let k = 0; k < g_keyObj[`keyCtrl${keyCtrlPtn}`][j].length; k++) {
			g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k] = setIntVal(g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]);
			g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k] = setIntVal(g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k]);

			keyconSprite.appendChild(
				createCss2Button(`keycon${j}_${k}`, g_kCd[g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]], () => {
					g_currentj = j;
					g_currentk = k;
					g_prevKey = -1;
					selectedKc = `Default`;
					g_keycons.cursorNum = g_keycons.cursorNumList.findIndex(val => val === g_currentj);
					setKeyConfigCursor();
				}, {
					x: keyconX - 5, y: 50 + C_KYC_REPHEIGHT * k + keyconY,
					w: C_ARW_WIDTH + 10, h: C_KYC_REPHEIGHT, siz: g_limitObj.keySetSiz,
				}, g_cssObj.button_Default_NoColor, g_cssObj.title_base)
			);

			// キーに色付け
			if (g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k] !== g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]) {
				changeKeyConfigColor(j, k, g_cssObj.keyconfig_Changekey);
			} else if (g_keyObj.currentPtn === -1) {
				changeKeyConfigColor(j, k, g_cssObj.keyconfig_Defaultkey);
			}
		}
	}
	const posj = g_keyObj[`pos${keyCtrlPtn}`][0];

	// カーソルの作成
	const cursor = keyconSprite.appendChild(createImg(`cursor`, g_imgObj.cursor,
		(kWidth - C_ARW_WIDTH) / 2 + g_keyObj.blank * (posj - divideCnt / 2) - 10, 57, 15, 30));
	cursor.style.transitionDuration = `0.125s`;

	const viewGroupObj = {
		shuffle: (_type = ``) => {
			if (g_keyObj[`shuffle${keyCtrlPtn}`] !== undefined) {
				for (let j = 0; j < keyNum; j++) {
					document.getElementById(`sArrow${j}`).textContent = g_keyObj[`shuffle${keyCtrlPtn}${_type}`][j] + 1;
				}
			}
		},
		color: (_type = ``) => {
			for (let j = 0; j < keyNum; j++) {
				const colorPos = g_keyObj[`color${keyCtrlPtn}${_type}`][j];
				const arrowColor = getKeyConfigColor(j, colorPos);
				$id(`arrow${j}`).background = arrowColor;
				$id(`arrowShadow${j}`).background = hasVal(g_headerObj.setShadowColor[colorPos]) ?
					getShadowColor(colorPos, arrowColor) : ``;
				if (g_headerObj.setShadowColor[colorPos] === `Default`) {
					$id(`arrowShadow${j}`).opacity = 0.5;
				}
			}
		},
		stepRtn: (_type = ``) => { },
	};

	/**
	 * カラー・シャッフルグループ設定の表示
	 * - シャッフルグループではデフォルトからの差異表示もここで行う
	 * @param {string} _type 
	 */
	const viewGroup = _type => {
		if (g_headerObj[`${_type}Use`]) {
			const num = g_keycons[`${_type}GroupNum`] === -1 ? g_keycons.groupSelf : g_keycons[`${_type}GroupNum`] + 1;
			if (document.getElementById(`lnk${toCapitalize(_type)}Group`) !== null) {
				document.getElementById(`lnk${toCapitalize(_type)}Group`).textContent = getStgDetailName(num);
			}
			viewGroupObj[_type](`_${g_keycons[`${_type}GroupNum`]}`);

			if (_type === `shuffle`) {
				changeShuffleConfigColor(keyCtrlPtn, g_keyObj[`shuffle${keyCtrlPtn}_${g_keycons.shuffleGroupNum}`]);
			}
		}
	};
	/**
	 * カラー・シャッフルグループ設定
	 * @param {string} _type 
	 * @param {number} [_scrollNum=1] 
	 */
	const setGroup = (_type, _scrollNum = 1) => {
		g_keycons[`${_type}GroupNum`] = g_keycons[`${_type}Groups`][getNextNum(_scrollNum, `${_type}Groups`, g_keycons[`${_type}GroupNum`])];
		g_keyObj[`${_type}${keyCtrlPtn}`] = structuredClone(g_keyObj[`${_type}${keyCtrlPtn}_${g_keycons[`${_type}GroupNum`]}`]);
		viewGroup(_type);
		if (_type === `stepRtn`) {
			keyConfigInit(g_kcType);
		}
	};

	/**
	 * キーコンフィグ用設定ラベル
	 * @param {string} _id 
	 * @param {string} _name 
	 * @param {number} [object.x=g_btnX(5 / 6)]
	 * @param {number} [object.y=0]
	 * @param {number} [object.w=g_btnWidth(1 / 6)]
	 * @param {number} [object.h=20]
	 * @param {number} [object.siz=12]
	 * @param {string} [object.align='left']
	 * @param {...any} [object.rest]
	 * @param {...any} _classes 
	 * @returns {HTMLDivElement}
	 */
	const makeKCButtonHeader = (_id, _name, {
		x = g_btnX(5 / 6) - 30, y = 0, w = g_btnWidth(1 / 6), h = 20, siz = 12, align = C_ALIGN_LEFT, ...rest
	} = {}, ..._classes) => createDivCss2Label(_id, g_lblNameObj[_name], { x, y, w, h, siz, align, ...rest }, ..._classes);

	/**
	 * キーコンフィグ用設定ボタン
	 * @param {string} _id 
	 * @param {string} _text 
	 * @param {Function} _func 
	 * @param {number} [object.x=g_btnX(5 / 6) - 20]
	 * @param {number} [object.y=15]
	 * @param {number} [object.w=g_btnWidth(1 / 6)]
	 * @param {number} [object.h=18]
	 * @param {number} [object.siz=g_limitObj.jdgCntsSiz]
	 * @param {string} [object.borderStyle='solid']
	 * @param {Function} [object.cxtFunc]
	 * @param {...any} [object.rest]
	 * @param {string} [_mainClass=g_cssObj.button_RevOFF] 
	 * @param  {...any} _classes 
	 * @returns {HTMLDivElement}
	 */
	const makeKCButton = (_id, _text, _func, { x = g_btnX(5 / 6) - 20, y = 15, w = g_btnWidth(1 / 6), h = 18,
		siz = g_limitObj.jdgCntsSiz, borderStyle = C_DIS_NONE, cxtFunc, ...rest } = {}, _mainClass = g_cssObj.button_RevOFF, ..._classes) =>
		makeSettingLblCssButton(_id, getStgDetailName(_text), 0, _func, { x, y, w, h, siz, cxtFunc, borderStyle, ...rest }, _mainClass, ..._classes);

	/**
	 * キーコンフィグ用ミニボタン
	 * @param {string} _id 
	 * @param {string} _directionFlg 
	 * @param {Function} _func 
	 * @param {number} [object.x=g_btnX(5 / 6) - 30]
	 * @param {number} [object.y=15]
	 * @param {number} [object.w=15]
	 * @param {number} [object.h=20]
	 * @param {number} [object.siz=g_limitObj.mainSiz]
	 */
	const makeMiniKCButton = (_id, _directionFlg, _func, { x = g_btnX(5 / 6) - 30, y = 15, w = 15, h = 20, siz = g_limitObj.mainSiz } = {}) =>
		createCss2Button(`${_id}${_directionFlg}`, g_settingBtnObj.chara[_directionFlg], _func, { x, y, w, h, siz }, g_cssObj.button_Mini);

	/**
	 * キーコンフィグ用グループ設定ラベル・ボタンの作成
	 * @param {string} _type 
	 * @param {number} [object.baseX=g_btnX(5 / 6) - 20]
	 * @param {number} [object.baseY=0]
	 * @param {string} [object.cssName]
	 */
	const makeGroupButton = (_type, { baseX = g_btnX(5 / 6) - 20, baseY = 0, cssName } = {}) => {
		if (g_headerObj[`${_type}Use`] && g_keycons[`${_type}Groups`].length > 1) {
			const typeName = toCapitalize(_type);
			multiAppend(divRoot,
				makeKCButtonHeader(`lbl${_type}Group`, `${typeName}Group`, { x: baseX - 10, y: baseY }, cssName),
				makeKCButton(`lnk${typeName}Group`, ``, () => setGroup(_type), {
					x: baseX, y: baseY + 13, w: g_btnWidth(1 / 18), title: g_msgObj[`${_type}Group`], cxtFunc: () => setGroup(_type, -1),
				}),
				makeMiniKCButton(`lnk${typeName}Group`, `L`, () => setGroup(_type, -1), { x: baseX - 10, y: baseY + 13 }),
				makeMiniKCButton(`lnk${typeName}Group`, `R`, () => setGroup(_type), { x: baseX + g_btnWidth(1 / 18), y: baseY + 13 }),
			);
		} else {
			g_keycons[`${_type}GroupNum`] = 0;
		}
		viewGroup(_type);
	};

	const kcSubX = parseFloat(keyconSprite.style.width) * ((1 - g_keyObj.scale) / 4);
	const kcSubY = parseFloat(keyconSprite.style.height) / ((1 + g_keyObj.scale) / 2) - parseFloat(keyconSprite.style.height);
	multiAppend(divRoot,

		// ショートカットキーメッセージ
		createDescDiv(`scMsg`, g_lblNameObj.kcShortcutDesc, { altId: `scKcMsg` }),

		// タイトルバックのショートカットキー変更
		createCss2Button(`scTitleBack`, getScMsg.TitleBack(), () => {
			if (!g_isMac) {
				cursor.style.left = wUnit(g_btnX(1 / 4) - kcSubX);
				cursor.style.top = wUnit(g_sHeight - 160 + kcSubY);
				selectedKc = `TitleBack`;
			}
		}, g_lblPosObj.scTitleBack, g_cssObj.button_Default_NoColor,
			g_headerObj.keyTitleBack === g_headerObj.keyTitleBackDef2 ?
				g_cssObj.title_base : g_cssObj.keyconfig_Changekey),

		// リトライのショートカットキー変更
		createCss2Button(`scRetry`, getScMsg.Retry(), () => {
			cursor.style.left = wUnit(g_btnX(1 / 2) + kcSubX);
			cursor.style.top = wUnit(g_sHeight - 160 + kcSubY);
			selectedKc = `Retry`;
		}, g_lblPosObj.scRetry, g_cssObj.button_Default_NoColor,
			g_headerObj.keyRetry === g_headerObj.keyRetryDef2 ?
				g_cssObj.title_base : g_cssObj.keyconfig_Changekey),

		// ポーズのショートカットキー変更
		createCss2Button(`scPause`, getScMsg.Pause(), () => {
			cursor.style.left = wUnit(g_btnX(3 / 4) + kcSubX);
			cursor.style.top = wUnit(g_sHeight - 160 + kcSubY);
			selectedKc = `Pause`;
		}, g_lblPosObj.scPause, g_cssObj.button_Default_NoColor,
			g_headerObj.keyPause === g_headerObj.keyPauseDef2 ?
				g_cssObj.title_base : g_cssObj.keyconfig_Changekey),

		// 別キーモード警告メッセージ
		createDivCss2Label(
			`kcMsg`,
			hasVal(g_keyObj[`transKey${keyCtrlPtn}`]) ? g_lblNameObj.transKeyDesc : ``,
			g_lblPosObj.kcMsg, g_cssObj.keyconfig_warning
		),
		// ColorType警告メッセージ
		createDivCss2Label(
			`kcMsg2`,
			g_keycons.colorDefTypes.includes(g_colorType) ? `` : g_lblNameObj.colorTypeDesc,
			g_lblPosObj.kcMsg2, g_cssObj.keyconfig_Defaultkey
		),

		// キーカラータイプ切替ボタン
		makeKCButtonHeader(`lblcolorType`, `ColorType`, { x: 10 + g_btnX() }, g_cssObj.keyconfig_ColorType),
		makeKCButton(`lnkColorType`, g_colorType, () => setColorType(), {
			x: 20 + g_btnX(), title: g_msgObj.colorType, cxtFunc: () => setColorType(-1),
		}),
		makeMiniKCButton(`lnkColorType`, `L`, () => setColorType(-1), { x: 10 + g_btnX() }),
		makeMiniKCButton(`lnkColorType`, `R`, () => setColorType(), { x: 20 + g_btnX(1 / 6) }),
	);

	if (g_headerObj.imgType.length > 1) {
		const [imgBaseX, imgBaseY] = [20 + g_btnX(), 50];
		multiAppend(divRoot,
			// オブジェクトタイプの切り替え（リロードあり）
			makeKCButtonHeader(`lblImgType`, `ImgType`, { x: imgBaseX - 10, y: 37 }, g_cssObj.keyconfig_ConfigType),
			makeKCButton(`lnkImgType`, g_imgType, () => setImgType(), {
				x: imgBaseX, y: imgBaseY, title: g_msgObj.imgType, cxtFunc: () => setImgType(-1),
			}),
			makeMiniKCButton(`lnkImgType`, `L`, () => setImgType(-1), { x: imgBaseX - 10, y: imgBaseY }),
			makeMiniKCButton(`lnkImgType`, `R`, () => setImgType(), { x: imgBaseX + g_btnWidth(1 / 6), y: imgBaseY }),
		);
	}

	// カラー/シャッフルグループ切替ボタン（カラー/シャッフルパターンが複数ある場合のみ）
	makeGroupButton(`color`, { cssName: g_cssObj.keyconfig_ColorGr });
	makeGroupButton(`shuffle`, { baseX: g_btnX(11 / 12) - 10, cssName: g_cssObj.keyconfig_ShuffleGr });
	makeGroupButton(`stepRtn`, { baseY: 37, cssName: g_cssObj.keyconfig_StepRtnGr });

	/**
	 * カーソル位置の設定
	 */
	const setKeyConfigCursor = () => {
		const posj = g_keyObj[`pos${keyCtrlPtn}`][g_currentj];
		const stdPos = posj - ((posj > divideCnt ? posMax : 0) + divideCnt) / 2;
		const baseLayer = g_keyObj[`layerGroup${keyCtrlPtn}`]?.[g_currentj] || 0;

		const nextLeft = (kWidth - C_ARW_WIDTH) / 2 + g_keyObj.blank * stdPos + addLeft - 10;
		cursor.style.left = wUnit(nextLeft);
		cursor.style.top = wUnit(C_KYC_HEIGHT * Number(posj > divideCnt) + 57 + C_KYC_REPHEIGHT * g_currentk + baseLayer * C_LAYER_Y_OFFSET);
		g_kcType = (g_currentk === 0 ? `Main` : `Replaced`);

		// 次の位置が見えなくなったらkeyconSpriteの位置を調整する
		adjustScrollPoint(nextLeft);
	};

	/**
	 * カーソル位置の変更
	 * @param {number} [_nextj] 次のカーソル位置
	 */
	const changeConfigCursor = (_nextj = ++g_keycons.cursorNum % g_keycons.cursorNumList.length) => {
		g_keycons.cursorNum = _nextj;

		g_currentj = g_keycons.cursorNumList[_nextj];
		g_currentk = 0;
		if (g_kcType === `Replaced`) {
			g_currentk = 1;

			// 代替キー設定の場合は次の代替キーが見つかるまで移動
			while (g_keyObj[`keyCtrl${keyCtrlPtn}`][g_currentj][1] === undefined) {
				g_keycons.cursorNum = (g_keycons.cursorNum + 1) % g_keycons.cursorNumList.length;
				g_currentj = g_keycons.cursorNumList[g_keycons.cursorNum];

				// 一周して対象が無い場合は代替キーが無いため処理を抜ける（無限ループ対策）
				if (g_keycons.cursorNum === _nextj) {
					g_kcType = `Main`;
					g_currentk = 0;
					break;
				}
			}
		}
		setKeyConfigCursor();
	};

	/**
	 * 次のカーソル位置の取得
	 * @param {number} _scrollNum 
	 * @param {string} _groupName 
	 * @param {string} _target 
	 * @returns {number}
	 */
	const getNextNum = (_scrollNum, _groupName, _target) =>
		nextPos(g_keycons[_groupName].findIndex(value => value === _target), _scrollNum, g_keycons[_groupName].length);

	/**
	 * ConfigTypeの制御
	 * @param {number} _scrollNum 
	 */
	const setConfigType = (_scrollNum = 1) => {
		g_kcType = g_keycons.configTypes[getNextNum(_scrollNum, `configTypes`, g_kcType)];
		changeConfigCursor(g_keycons.cursorNum);
	};

	/**
	 * 一部のキーコンフィグを表示する
	 * （キーグループ毎にフィルターされたもののみを表示する）
	 * @param {number} _num 
	 */
	const appearConfigSteps = _num => {

		const appearConfigView = (_j, _display) => {
			$id(`arrow${_j}`).display = _display;
			$id(`arrowShadow${_j}`).display = _display;
			$id(`color${_j}`).display = _display;
			if (document.getElementById(`sArrow${_j}`) !== null) {
				$id(`sArrow${_j}`).display = _display;
			}
			if (document.getElementById(`arrowChara${_j}`) !== null) {
				$id(`arrowChara${_j}`).display = _display;
			}
			const ctrlPtn = g_keyObj[`keyCtrl${g_headerObj.keyLabels[g_stateObj.scoreId]}_${g_keyObj.currentPtn}`][_j];
			for (let k = 0; k < ctrlPtn.length; k++) {
				$id(`keycon${_j}_${k}`).display = _display;
			}
		};

		g_keycons.keySwitchNum = _num;
		g_keycons.cursorNumList = [];
		for (let j = 0; j < keyNum; j++) {
			appearConfigView(j, C_DIS_NONE);

			if (tkObj.keyGroupMaps[j].includes(configKeyGroupList[_num])) {
				g_keycons.cursorNumList.push(j);
				appearConfigView(j, C_DIS_INHERIT);
			}
		}
		if (g_keycons.cursorNumList.length === 0) {
			makeInfoWindow(g_msgInfoObj.I_0011, ``);
		} else {
			changeConfigCursor(0);

			// keySwitchボタンを一旦非選択にして、選択中のものを再度色付け
			if (configKeyGroupList.length > 1) {
				for (let j = 0; j < configKeyGroupList.length; j++) {
					document.getElementById(`key${j}`).classList.replace(g_cssObj.button_Next, g_cssObj.button_Mini);
				}
				document.getElementById(`key${_num}`).classList.replace(g_cssObj.button_Mini, g_cssObj.button_Next);
			}
		}
		keyconfigKeyboardPreview.refresh();
	};

	/**
	 * ColorPickerの色切替
	 * @param {number} _j 
	 * @param {string} _type 
	 * @param {string} _color 
	 */
	const changeColorPicker = (_j, _type, _color) => {
		if (_color !== ``) {
			document.getElementById(`pick${_type}${_j}`).value = _color.slice(0, 7);
			$id(`pick${_type}${_j}`).display = C_DIS_INHERIT;
		} else {
			$id(`pick${_type}${_j}`).display = C_DIS_NONE;
		}
	};

	/**
	 * ColorPickerに対応する実際の番号を取得
	 * @param {number} _j 
	 */
	const getGroupNum = _j => _j + g_keycons.colorCursorNum * g_limitObj.kcColorPickerNum;

	/**
	 * ColorPicker（一式）の切替
	 */
	const changeColorPickers = () => {
		lnkColorR.textContent = `[${g_keycons.colorCursorNum + 1} /`;
		for (let j = 0; j < g_limitObj.kcColorPickerNum; j++) {
			const m = getGroupNum(j);
			changeColorPicker(j, `arrow`, g_headerObj.setColor[m]);
			changeColorPicker(j, `arrowShadow`, g_headerObj.setShadowColor[m]);
			changeColorPicker(j, `frz`, g_headerObj.frzColor[m][0]);
			changeColorPicker(j, `frzBar`, g_headerObj.frzColor[m][1]);
		}
	};

	/**
	 * ColorTypeの制御
	 * @param {number} [_scrollNum=1] 
	 * @param {boolean} [_reloadFlg=true]
	 */
	const setColorType = (_scrollNum = 1, _reloadFlg = true) => {
		const nextNum = getNextNum(_scrollNum, `colorTypes`, g_colorType);
		g_colorType = g_keycons.colorTypes[nextNum];
		const isDefault = g_keycons.colorDefTypes.includes(g_colorType);
		if (g_headerObj.colorUse) {
			g_stateObj.d_color = boolToSwitch(g_keycons.colorDefTypes.findIndex(val => val === g_colorType) !== -1);
		}
		changeSetColor();
		viewGroupObj.color(`_${g_keycons.colorGroupNum}`);
		lnkColorType.textContent = `${getStgDetailName(g_colorType)}${g_localStorage.colorType === g_colorType ? ' *' : ''}`;
		kcMsg2.textContent = (isDefault || !g_headerObj.colorUse) ? `` : g_lblNameObj.colorTypeDesc;
		kcMsg2.style.top = wUnit(hasVal(g_keyObj[`transKey${keyCtrlPtn}`]) ? g_lblPosObj.kcMsg2.y : g_lblPosObj.kcMsg.y);
		kcMsg2.style.fontSize = wUnit(getFontSize2(kcMsg2.textContent, g_btnWidth()));
		if (_reloadFlg) {
			colorPickSprite.style.display = isDefault ? C_DIS_NONE : C_DIS_INHERIT;
			g_keycons.colorCursorNum = g_keycons.colorCursorNum % Math.ceil(g_headerObj.setColor.length / g_limitObj.kcColorPickerNum);
			changeColorPickers();
		}
	};

	/**
	 * ImgTypeの制御
	 * @param {number} [_scrollNum=1] 
	 */
	const setImgType = (_scrollNum = 1) => {
		const nextNum = getNextNum(_scrollNum, `imgTypes`, g_imgType);
		g_imgType = g_keycons.imgTypes[nextNum];
		g_stateObj.rotateEnabled = g_headerObj.imgType[nextNum].rotateEnabled;
		g_stateObj.flatStepHeight = g_headerObj.imgType[nextNum].flatStepHeight;

		changeSettingListsForImg();
		updateImgType(g_headerObj.imgType[nextNum]);
		keyConfigInit(g_kcType);
	};

	const colorPickSprite = createEmptySprite(divRoot, `colorPickSprite`, { ...g_windowObj.colorPickSprite, title: g_msgObj.pickArrow });
	if (g_keycons.colorDefTypes.includes(g_colorType)) {
		colorPickSprite.style.display = C_DIS_NONE;
	}
	multiAppend(colorPickSprite,

		// ColorPickerの切替
		createCss2Button(`lnkColorR`, `[${g_keycons.colorCursorNum + 1} /`, () => {
			g_keycons.colorCursorNum = (g_keycons.colorCursorNum + 1) % Math.ceil(g_headerObj.setColor.length / g_limitObj.kcColorPickerNum);
			changeColorPickers();
		}, g_lblPosObj.lnkColorR, g_cssObj.button_Start),

		// 矢印の配色をフリーズアローへ反映
		createCss2Button(`lnkColorCopy`, `↓]`, () => {
			if (window.confirm(g_msgObj.colorCopyConfirm)) {
				for (let j = 0; j < g_headerObj.setColor.length; j++) {
					g_headerObj.frzColor[j] = g_headerObj[`frzColor${g_colorType}`][j] =
						fillArray(g_headerObj[`frzColor${g_colorType}`][j].length, g_headerObj[`setColor${g_colorType}`][j]);
				}
				for (let j = 0; j < g_limitObj.kcColorPickerNum; j++) {
					const m = getGroupNum(j);
					[``, `Bar`].forEach((val, k) =>
						document.getElementById(`pickfrz${val}${j}`).value = g_headerObj[`frzColor${g_colorType}`][m][k]);
				}
			}
		}, g_lblPosObj.lnkColorCopy, g_cssObj.button_Start),

		createDivCss2Label(`lblPickArrow`, g_lblNameObj.s_arrow, { ...g_lblPosObj.pickPos, y: 0 }),
		createDivCss2Label(`lblPickFrz`, g_lblNameObj.s_frz, { ...g_lblPosObj.pickPos, y: 140 }),

		// ColorPickerの色を元に戻す
		createCss2Button(`lnkColorReset`, g_lblNameObj.b_cReset, () => {
			if (window.confirm(g_msgObj.colorResetConfirm)) {
				resetColorType({ _from: g_colorType, _to: ``, _fromObj: g_dfColorObj });
				resetColorType({ _from: g_colorType, _to: g_colorType, _fromObj: g_dfColorObj });

				// 影矢印が未指定の場合はType1, Type2の影矢印指定を無くす
				const _idHeader = setScoreIdHeader(g_stateObj.scoreId, false, true);
				const _shadowDefault = g_headerObj[`setShadowColor${_idHeader}Default`];
				if ((!Array.isArray(_shadowDefault) || !hasVal(_shadowDefault[0])) &&
					[`Type1`, `Type2`].includes(g_colorType)) {

					g_headerObj.setShadowColor = fillArray(g_headerObj.setColorInit.length, ``);
					g_headerObj[`setShadowColor${g_colorType}`] = fillArray(g_headerObj.setColorInit.length, ``);
				}

				changeColorPickers();
				viewGroupObj.color(`_${g_keycons.colorGroupNum}`);
			}
		}, g_lblPosObj.lnkColorReset, g_cssObj.button_Reset),
	);

	/**
	 * ColorPicker部分の作成
	 * @param {number} _j 
	 * @param {string} _type 
	 * @param {Function} _func 
	 * @param {number} [object.x=0]
	 * @param {number} [object.y=15] 
	 */
	const createColorPickWindow = (_j, _type, _func, { x = 0, y = 15 } = {}) =>
		createColorPicker(colorPickSprite, `pick${_type}${_j}`, _func, { x, y: y + 25 * _j });

	for (let j = 0; j < g_limitObj.kcColorPickerNum; j++) {
		createColorPickWindow(j, `arrow`, () => {
			g_headerObj[`setColor${g_colorType}`][getGroupNum(j)] = document.getElementById(`pickarrow${j}`).value;
			setColorType(0, false);
		});

		createColorPickWindow(j, `arrowShadow`, () => {
			g_headerObj[`setShadowColor${g_colorType}`][getGroupNum(j)] = `${document.getElementById(`pickarrowShadow${j}`).value}80`;
			setColorType(0, false);
		}, { x: 25 });

		[``, `Bar`].forEach((val, k) =>
			createColorPickWindow(j, `frz${val}`, () => {
				g_headerObj[`frzColor${g_colorType}`][getGroupNum(j)][k] = document.getElementById(`pickfrz${val}${j}`).value;
			}, { x: 25 * k, y: 155 }));
	}

	// ConfigType, ColorTypeの初期設定
	setConfigType(0);
	setColorType(0);
	keyconSprite.scrollLeft = - maxLeftX;

	// キーパターン表示
	const lblTransKey = hasVal(g_keyObj[`transKey${keyCtrlPtn}`]) ? `(${g_keyObj[`transKey${keyCtrlPtn}`] ?? ''})` : ``;

	/**
	 * キーパターン検索
	 * @param {number} _tempPtn 
	 * @param {number} _sign 
	 * @param {boolean} [_transKeyUse=false] 
	 * @param {boolean} [_skipFlg=false]
	 */
	const searchPattern = (_tempPtn, _sign, _transKeyUse = false, _skipFlg = false) => {
		let nextPtn = _tempPtn + _sign;
		const initialPtn = hasVal(g_keyObj[`keyCtrl${g_keyObj.currentKey}_-1`]) ? -1 : 0;

		const searchStart = () => {
			if (!hasVal(g_keyObj[`keyCtrl${g_keyObj.currentKey}_${nextPtn}`])) {
				nextPtn = 0;
				while (hasVal(g_keyObj[`keyCtrl${g_keyObj.currentKey}_${nextPtn}`])) {
					nextPtn -= _sign;
				}
				nextPtn += _sign;
			}
		};

		const searchNextGroup = () => {
			while (nextPtn !== initialPtn &&
				g_keyObj[`transKey${g_keyObj.currentKey}_${_tempPtn}`] === g_keyObj[`transKey${g_keyObj.currentKey}_${nextPtn}`] &&
				hasVal(g_keyObj[`keyCtrl${g_keyObj.currentKey}_${nextPtn}`])) {
				nextPtn += _sign;
			}
		};

		searchStart();
		if (_skipFlg) {
			searchNextGroup();
			searchStart();
		}
		if (!_transKeyUse) {
			while (hasVal(g_keyObj[`transKey${g_keyObj.currentKey}_${nextPtn}`])) {
				nextPtn += _sign;
			}
			searchStart();
		}
		return nextPtn;
	};

	/**
	 * キーパターン変更時処理
	 * @param {number} [_sign=1] 
	 * @param {boolean} [_skipFlg=false]
	 */
	const changePattern = (_sign = 1, _skipFlg = false) => {

		// キーパターンの変更
		g_keyObj.currentPtn = searchPattern(g_keyObj.currentPtn, _sign, g_headerObj.transKeyUse, _skipFlg);

		// カラーグループ、シャッフルグループの再設定
		g_keycons.groups.forEach(type => resetGroupList(type, `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`));

		// 曲中ショートカットキーの切り替え
		setPlayingShortcut();

		// キーコンフィグ画面を再呼び出し
		keyConfigInit();

		// シャッフルグループのデフォルト値からの差異表示（色付け）
		// 再描画後で無いと色付けできないため、keyConfigInit() 実行後に処理
		if (g_headerObj.shuffleUse) {
			changeShuffleConfigColor(`${g_keyObj.currentKey}_${g_keyObj.currentPtn}`, g_keyObj[`shuffle${g_keyObj.currentKey}_${g_keyObj.currentPtn}_${g_keycons.shuffleGroupNum}`]);
		}
	};

	// ユーザカスタムイベント(初期)
	safeExecuteCustomHooks(`g_customJsObj.keyconfig`, g_customJsObj.keyconfig);

	// 部分キー表示用ボタン描画
	if (configKeyGroupList.length > 1) {
		multiAppend(divRoot,
			createDivCss2Label(`lblkey`, `KeySwitch`, g_lblPosObj.lblkey));
		configKeyGroupList.forEach((val, j) =>
			divRoot.appendChild(
				createCss2Button(`key${j}`, `${j + 1}`, () => appearConfigSteps(j),
					{ ...g_lblPosObj.lnkKeySwitch, y: 110 + j * 20 }, g_cssObj.button_Mini),
			));
	}

	// カーソル位置の初期化
	appearConfigSteps(g_keycons.keySwitchNum);

	keyconfigKeyboardPreview.dispose();
	keyconfigKeyboardPreview.init(divRoot);

	// ラベル・ボタン描画
	multiAppend(divRoot,

		// 設定画面へ戻る
		createCss2Button(`btnBack`, g_lblNameObj.b_settings, () => {
			g_currentj = 0;
			g_currentk = 0;
			g_prevKey = 0;
		}, {
			...g_lblPosObj.btnKcBack, resetFunc: () => g_moveSettingWindow(false),
		}, g_cssObj.button_Back),

		createDivCss2Label(`lblPattern`, `${g_lblNameObj.KeyPattern}: ${g_keyObj.currentPtn === -1 ?
			'Self' : g_keyObj.currentPtn + 1}${lblTransKey}`, g_lblPosObj.lblPattern),

		// パターン変更ボタン描画(右回り)
		createCss2Button(`btnPtnChangeR`, `>`, () => true, {
			...g_lblPosObj.btnPtnChangeR, resetFunc: () => changePattern(),
		}, g_cssObj.button_Mini),

		// パターン変更ボタン描画(左回り)
		createCss2Button(`btnPtnChangeL`, `<`, () => true, {
			...g_lblPosObj.btnPtnChangeL, resetFunc: () => changePattern(-1),
		}, g_cssObj.button_Mini),

		// パターン変更ボタン描画(右回り/別キーモード間スキップ)
		createCss2Button(`btnPtnChangeRR`, `|>`, () => true, {
			...g_lblPosObj.btnPtnChangeRR, resetFunc: () => changePattern(1, true),
		}, g_cssObj.button_Setting),

		// パターン変更ボタン描画(左回り/別キーモード間スキップ)
		createCss2Button(`btnPtnChangeLL`, `<|`, () => true, {
			...g_lblPosObj.btnPtnChangeLL, resetFunc: () => changePattern(-1, true),
		}, g_cssObj.button_Setting),

		// キーコンフィグリセットボタン描画
		createCss2Button(`btnReset`, g_lblNameObj.b_reset, () => {
			if (window.confirm(g_msgObj.keyResetConfirm)) {
				const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;

				for (let m = 0; m < g_keycons.cursorNumList.length; m++) {
					const j = g_keycons.cursorNumList[m];
					for (let k = 0; k < g_keyObj[`keyCtrl${keyCtrlPtn}`][j].length; k++) {
						g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k] = setIntVal(g_keyObj[`keyCtrl${keyCtrlPtn}d`][j][k]);
						document.getElementById(`keycon${j}_${k}`).textContent = g_kCd[g_keyObj[`keyCtrl${keyCtrlPtn}`][j][k]];
						changeKeyConfigColor(j, k, g_keyObj.currentPtn === -1 ? g_cssObj.keyconfig_Defaultkey : g_cssObj.title_base);
					}
				}
				changeConfigCursor(0);
			}
		}, g_lblPosObj.btnKcReset, g_cssObj.button_Reset),

		createCss2Button(`btnKeyLock`, getKeyLockName(), () => {
			g_stateObj.keyLockFlg = !g_stateObj.keyLockFlg;
			makeInfoWindow(g_msgInfoObj.I_0012.split(`{0}`).join(boolToSwitch(!g_stateObj.keyLockFlg)), `leftToRightFade`);
			toggleKcDesc();
		}, g_lblPosObj.btnKcKeyLock, g_cssObj.button_Mini),

		// プレイ開始
		makePlayButton(() => loadMusic())
	);
	toggleKcDesc();

	// Selfパターン取込ボタン（条件成立時のみ表示）
	const keyCtrlPtnForSelf = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	if (getTransKeySelfCtrl(keyCtrlPtnForSelf) !== undefined) {
		divRoot.appendChild(
			createCss2Button(`btnPtnSelf`, `Self`, () => applyTransKeySelfPattern(), {
				x: g_lblPosObj.lblPattern.x + g_lblPosObj.lblPattern.w - 50,
				y: g_lblPosObj.lblPattern.y - 14,
				w: 50, h: 14, siz: 10, title: g_msgObj.ptnSelfImport,
			}, g_cssObj.button_Mini)
		);
	}

	// キーボード押下時処理
	setShortcutEvent(g_currentPage, (kbCode) => {
		const C_KEY_ESCAPE = 27;
		const C_KEY_IME = 229;
		const keyCdObj = document.getElementById(`keycon${g_currentj}_${g_currentk}`);
		let setKey = g_kCdN.findIndex(kCd => kCd === kbCode);

		if (g_stateObj.keyLockFlg) {
			if (setKey === C_KEY_ESCAPE) {
				btnBack.click();
			}
			return;
		}

		// 全角切替、BackSpace、Deleteキー、Escキーは割り当て禁止
		// また、直前と同じキーを押した場合(BackSpaceを除く)はキー操作を無効にする
		const disabledKeys = [240, 242, 243, 244, 91, 29, 28, 259, g_prevKey];

		if (g_localeObj.val === `Ja`) {
			disabledKeys.unshift(C_KEY_IME);
		}
		if (disabledKeys.includes(setKey) || g_kCdN[setKey] === undefined) {
			makeInfoWindow(g_msgInfoObj.I_0002, `fadeOut0`);
			return;
		} else if ((keyIsDown(g_kCdNameObj.metaLKey) || keyIsDown(g_kCdNameObj.metaRKey)) && keyIsShift()) {
			return;
		}
		if (selectedKc === `TitleBack` || selectedKc === `Retry` || selectedKc === `Pause`) {
			// タイトルバックキー、リトライキー、ポーズキーはプレイ中の操作キーと重複しないようにする（簡易的）
			if (g_keyObj[`keyCtrl${keyCtrlPtn}`].flat().includes(setKey)) {
				makeInfoWindow(g_msgInfoObj.I_0002, `fadeOut0`);
				return;
			}
			// プレイ中ショートカットキー変更
			g_headerObj[`key${selectedKc}`] = setKey;
			g_headerObj[`key${selectedKc}Def`] = setKey;
			document.getElementById(`sc${selectedKc}`).textContent = getScMsg[selectedKc]();
			document.getElementById(`sc${selectedKc}`).style.fontSize =
				wUnit(getFontSize2(getScMsg[selectedKc](), g_btnWidth(1 / 4) - 40, { maxSiz: g_limitObj.mainSiz }));
			if (g_isMac) {
				scTitleBack.textContent = getScMsg.TitleBack();
				scTitleBack.style.fontSize = wUnit(getFontSize2(getScMsg.TitleBack(), g_btnWidth(1 / 4) - 40, { maxSiz: g_limitObj.mainSiz }));
			}
			changeConfigColor(document.getElementById(`sc${selectedKc}`),
				g_headerObj[`key${selectedKc}`] === g_headerObj[`key${selectedKc}Def2`] ?
					g_cssObj.title_base : g_cssObj.keyconfig_Changekey);
			return;
		}

		if (setKey === C_KEY_ESCAPE) {
			// リトライキー、タイトルバックキーにEscキーを割り当て可能にするため、
			// 例外的にEscキーで戻る対応をここで処理
			btnBack.click();
			return;
		} else if (setKey === C_KEY_TITLEBACK && g_currentk === 0) {
			return;
		}

		if (setKey === C_KEY_RETRY && (!g_isMac || g_currentk === 0)) {
			// スキップ
		} else {
			// キー割り当て処理
			if (setKey === C_KEY_TITLEBACK || setKey === C_KEY_RETRY) {
				// キー無効化（代替キーのみ）
				setKey = 0;
			}
			if (g_keyObj[`keyCtrl${keyCtrlPtn}d`][g_currentj][g_currentk] !== setKey) {
				// 既定キーと異なる場合は色付け
				changeKeyConfigColor(g_currentj, g_currentk, g_cssObj.keyconfig_Changekey);
			}
			keyCdObj.textContent = g_kCd[setKey];
			g_keyObj[`keyCtrl${keyCtrlPtn}`][g_currentj][g_currentk] = setKey;
			g_prevKey = setKey;
		}

		// カーソル移動
		if (g_currentk < g_keyObj[`keyCtrl${keyCtrlPtn}`][g_currentj].length - 1 && g_kcType !== `Main`) {
			// 後続に代替キーが存在する場合
			g_currentk++;
			cursor.style.top = wUnit(parseInt(cursor.style.top) + C_KYC_REPHEIGHT);

		} else {
			changeConfigCursor();
		}
	});

	// 戻るボタンのショートカットキー表示
	multiAppend(btnBack,
		createDivCss2Label(`scKeyConfigBack`, `${g_lblNameObj.sc_keyConfigBack})`, {
			x: 0, siz: 12, fontWeight: `bold`, opacity: 0.75, align: C_ALIGN_LEFT,
		})
	);

	if (g_stateObj.kbPreviewFlg) {
		btnKbPreview.click();
	}

	safeExecuteCustomHooks(`g_skinJsObj.keyconfig`, g_skinJsObj.keyconfig);
	document.onkeyup = evt => commonKeyUp(evt);
	document.oncontextmenu = () => false;
};

/**
 * transKeyPtnの自動補完処理
 * - 明示指定(transKeyPtn)が無いパターンについて、
 *   キー内で同一のtransKey対象へ向かうパターンを出現順(パターン番号昇順)に
 *   0から連番で補完する
 * @param {string[]} _keyList 対象とするキー名一覧
 */
const completeTransKeyPtn = (_keyList) => {
	_keyList.forEach(keyName => {
		const counterMap = {};
		let ptnNum = 0;
		while (g_keyObj[`keyCtrl${keyName}_${ptnNum}`] !== undefined) {
			const keyPtn = `${keyName}_${ptnNum}`;
			const targetKey = g_keyObj[`transKey${keyPtn}`];
			if (hasVal(targetKey)) {
				if (g_keyObj[`transKeyPtn${keyPtn}`] === undefined) {
					counterMap[targetKey] = counterMap[targetKey] ?? 0;
					g_keyObj[`transKeyPtn${keyPtn}`] = counterMap[targetKey];
					counterMap[targetKey]++;
				} else {
					// 明示指定がある場合は以降の自動採番と重複しないよう位置を合わせる
					counterMap[targetKey] = Math.max(counterMap[targetKey] ?? 0, g_keyObj[`transKeyPtn${keyPtn}`] + 1);
				}
			}
			ptnNum++;
		}
	});
};

// KeyLockボタンを押したときの表示切替
const toggleKcDesc = () => {
	if (document.getElementById(`kcDesc`) !== null) {
		kcDesc.textContent = getKcDescMsg();
		kcDesc.style.fontSize = wUnit(getFontSize2(kcDesc.textContent, g_lblPosObj.kcDesc.w, { maxSiz: g_limitObj.mainSiz }));
		kcDesc.classList.remove(g_cssObj.title_base, g_cssObj.keyconfig_Defaultkey);
		kcDesc.classList.add(g_stateObj.keyLockFlg ? g_cssObj.keyconfig_Defaultkey : g_cssObj.title_base);
		btnKeyLock.innerHTML = getKeyLockName();
	}
};

// KeyLockボタンの表示文字列を取得
const getKcDescMsg = () =>
	g_stateObj.keyLockFlg
		? g_lblNameObj.kcNonDesc
		: g_lblNameObj.kcDesc.split(`{0}`).join(g_kCd[C_KEY_RETRY]).split(`{1}:`).join(g_isMac ? `` : `Delete:`);

// KeyLockボタンで使用する絵文字の取得
const getKeyLockName = () =>
	`${g_lblNameObj.b_keyLock}${g_stateObj.keyLockFlg ? g_emojiObj.locked : g_emojiObj.unlocked}`;

/**
 * キーボードレイアウトプレビュー（Canvas版）
 *
 * キーコンフィグ画面(divRoot)配下に以下の要素を追加する:
 *   - [Preview] ボタン (createCss2Button)
 *   - プレビュー用コンテナ div (createEmptySprite)
 *     ├ キーボード背景 canvas  (_state.canvasBase)  ← 起動時のみ描画
 *     └ マッピング強調 canvas  (_state.canvasMap)   ← キー変更・表示時に再描画
 *
 * 前提:
 *   - g_kCd         : グローバル定義済み。ロケール切替後は g_lang_kCd がマージ済み。
 *                     未設定キーは空文字列 `""` で初期化。
 *                     右Shift/Ctrl/Alt は 256/257/258 の独自コードで定義。
 *   - g_btnWidth()  : 画面の横幅(px)を返すグローバル関数。
 *   - g_sHeight     : 画面の縦幅(px)を保持するグローバル変数。
 *   - createCss2Button, createEmptySprite : danoniplus 本体のグローバル関数。
 *
 * 使い方:
 *   【初期化時】
 *     keyconfigKeyboardPreview.init(divRoot);
 *
 *   【キー割り当てが変わった時】
 *     keyconfigKeyboardPreview.refresh();
 *     ※ g_keyObj.currentKey / currentPtn から自動取得する
 *
 *   【キーコンフィグ画面を離脱する時】
 *     keyconfigKeyboardPreview.dispose();
 */

const keyconfigKeyboardPreview = (() => {

	// -------------------------------------------------------------------------
	// 定数
	// -------------------------------------------------------------------------
	const C_PREVIEW_ID = `kbPreviewArea`;
	const C_CANVAS_BASE_ID = `kbCanvasBase`;
	const C_CANVAS_MAP_ID = `kbCanvasMap`;

	// 色定義（既存ゲームの配色に合わせたダーク系）
	const C_COLOR = {
		normal: {
			fill: `#1a1a2e`,      // 通常キー背景
			stroke: `#555577`,    // 通常キー枠
			text: `#ccccdd`,      // 通常キー文字
			subText: `#888899`,   // サブラベル（Shift面）
		},
		mapped: {
			fill: `#003366`,      // メインキー背景
			stroke: `#4488ff`,    // メインキー枠
			text: `#aaddff`,      // メインキー文字
		},
		alt: {
			fill: `#3e3e1a`,      // 代替キー背景
			stroke: `#777755`,    // 代替キー枠
			text: `#eeeecc`,      // 代替キー文字
		},
		shortcut: {
			fill: `#330011`,      // ショートカットキー背景
			stroke: `#ff4466`,    // ショートカットキー枠
			text: `#ffaacc`,      // ショートカットキー文字
		},
		bgFill: `#0d0d1a`,        // Canvas 背景
		legendText: `#cccccc`,    // 凡例テキスト
	};

	// 凡例エリアの高さ
	const LEGEND_H = 25;

	// -------------------------------------------------------------------------
	// キーレイアウト定義
	//
	// 各行: { offsetX, keys }
	//   offsetX : 行左端の水平オフセット（単位: BASE_KEY_W）。未指定時は0
	//   keys    : キー定義の配列
	//
	// 各キー: { code, w?, h?, label? }
	//   code   : KeyboardEvent.code（文字列）。空文字 "" はスペーサー（描画・キャッシュなし）。
	//   w      : 幅倍率（BASE_KEY_W 基準。省略時 1）
	//   h      : 高さ倍率（BASE_KEY_H 基準。省略時 1）
	//   label  : 省略時は g_kCd[keyCode] を参照。g_kCd が空文字のキーや
	//            左右を区別したいキーに指定する。
	// -------------------------------------------------------------------------
	/**
	 * g_localeObj.val に応じた MAIN_ROWS を生成して返す。
	 * drawBase / calcScale の都度呼び出し、locale 変化を反映する。
	 *
	 * @returns {Array} MAIN_ROWS 相当の配列
	 */
	const buildMainRows = () => {
		const isJa = g_localeObj.val === `Ja`;
		return [
			// Row0: Fn キー行（JIS/US 共通）
			{
				keys: [
					{ code: `Escape` },
					{ code: ``, w: 0.5 },            // スペーサー
					{ code: `F1` }, { code: `F2` }, { code: `F3` }, { code: `F4` },
					{ code: ``, w: 0.25 },           // スペーサー
					{ code: `F5` }, { code: `F6` }, { code: `F7` }, { code: `F8` },
					{ code: ``, w: 0.25 },           // スペーサー
					{ code: `F9` }, { code: `F10` }, { code: `F11` }, { code: `F12` },
				],
			},
			// Row1: 数字行
			// JIS: ..., Minus, Equal, IntlYen, BS
			// US : ..., Minus, Equal,          BS
			{
				keys: [
					{ code: `Backquote` },
					{ code: `Digit1` }, { code: `Digit2` }, { code: `Digit3` }, { code: `Digit4` }, { code: `Digit5` }, { code: `Digit6` },
					{ code: `Digit7` }, { code: `Digit8` }, { code: `Digit9` }, { code: `Digit0` }, { code: `Minus` }, { code: `Equal` },
					...(isJa
						? [{ code: `IntlYen`, w: 0.75 }, { code: `Backspace`, label: `Back\nSpace` }]  // JIS: IntlYen + BS
						: [{ code: `Backspace`, w: 1.7 }]                                             // US : BS のみ（広い）
					),
				],
			},
			// Row2: QWERTY
			// JIS: ..., BracketLeft, BracketRight, Enter(縦長)
			// US : ..., BracketLeft, BracketRight, Backslash
			{
				keys: [
					{ code: `Tab`, w: 1.5 },
					{ code: `KeyQ` }, { code: `KeyW` }, { code: `KeyE` }, { code: `KeyR` }, { code: `KeyT` }, { code: `KeyY` },
					{ code: `KeyU` }, { code: `KeyI` }, { code: `KeyO` }, { code: `KeyP` }, { code: `BracketLeft` },
					...(isJa
						? [{ code: `BracketRight` }, { code: `Enter`, w: 1.25, h: 2 }]  // JIS: BracketRight + Enter縦長
						: [{ code: `BracketRight` }, { code: `Backslash`, w: 1.2 }]     // US : BracketRight + Backslash
					),
				],
			},
			// Row3: ASDF
			// JIS: ..., KeyL, Semicolon, Quote, Backslash
			// US : ..., KeyL, Semicolon, Quote, Enter(横長)
			{
				keys: [
					{ code: `CapsLock`, w: 1.75, label: `Caps\nLock` },
					{ code: `KeyA` }, { code: `KeyS` }, { code: `KeyD` }, { code: `KeyF` }, { code: `KeyG` }, { code: `KeyH` },
					{ code: `KeyJ` }, { code: `KeyK` }, { code: `KeyL` }, { code: `Semicolon` }, { code: `Quote` },
					...(isJa
						? [{ code: `Backslash` }]           // JIS: Backslash(¥)
						: [{ code: `Enter`, w: 1.9 }]       // US : Enter横長
					),
				],
			},
			// Row4: ZXCV
			// L)Shift の幅で行頭位置を揃える
			// JIS: L)Shift, ..., IntlRo, R)Shift
			// US : L)Shift, ...,         R)Shift
			{
				keys: [
					{ code: `ShiftLeft`, w: 2.25 },
					{ code: `KeyZ` }, { code: `KeyX` }, { code: `KeyC` }, { code: `KeyV` }, { code: `KeyB` }, { code: `KeyN` },
					{ code: `KeyM` }, { code: `Comma` }, { code: `Period` }, { code: `Slash` },
					...(isJa
						? [{ code: `IntlRo` }, { code: `ShiftRight`, w: 1.5 }]  // JIS: IntlRo + R)Shift
						: [{ code: `ShiftRight`, w: 2.4 }]                      // US : R)Shift のみ（広い）
					),
				],
			},
			// Row5: スペースバー行
			// JIS: ..., NonConvert, Space, Convert, KanaMode, ...
			// US : ..., Space, ...
			{
				keys: [
					{ code: `ControlLeft`, w: 1.25 }, { code: `MetaLeft` }, { code: `AltLeft` },
					...(isJa
						// JIS: NonConvert + Space + Convert + KanaMode
						? [{ code: `NonConvert` }, { code: `Space`, w: 5.25 }, { code: `Convert` }, { code: `KanaMode` }]
						// US : Space のみ（広い）
						: [{ code: `Space`, w: 8.25 }]
					),
					{ code: `AltRight` }, { code: `ContextMenu` },
					...(isJa
						? [{ code: `ControlRight`, w: 1.2 }]
						: [{ code: `ControlRight`, w: 1.05 }]
					),
				],
			},
		];
	};

	// 編集キークラスター（PrintSc/ScrollLk/Pause/Insert/Delete/Home/End/PgUp/PgDn + 矢印キー）
	// MAIN_ROWS と行インデックスを揃えて配置する。空行はスキップされる。
	const NAV_ROWS = [
		{ keys: [{ code: `PrintScreen`, label: `Print\nScreen` }, { code: `ScrollLock`, label: `Scroll\nLock` }, { code: `Pause` }] },
		{ keys: [{ code: `Insert` }, { code: `Home` }, { code: `PageUp`, label: `Page\nUp` }] },    // Insert Home PgUp
		{ keys: [{ code: `Delete` }, { code: `End` }, { code: `PageDown`, label: `Page\nDown` }] },  // Delete End  PgDn
		{ keys: [] },                                                                               // ASDF行：空
		{ keys: [{ code: `` }, { code: `ArrowUp` }, { code: `` }] },                                // ↑
		{ keys: [{ code: `ArrowLeft` }, { code: `ArrowDown` }, { code: `ArrowRight` }] },           // ← ↓ →
	];

	// テンキー（MAIN_ROWS と行インデックスを揃えて配置。1行目は空行で Fn行に揃える）
	// 標準テンキーレイアウト（2行目から）:
	//   [NumLk] [T/] [T*] [T-]
	//   [T7][T8][T9] [T+]
	//   [T4][T5][T6] [T+]  ← T+ は縦2u
	//   [T1][T2][T3] [TEnter]
	//   [  T0  ][T.] [TEnter]  ← T0 は横2u、TEnter は縦2u
	const NUM_ROWS = [
		{ keys: [] },
		{ keys: [{ code: `NumLock`, label: `Num\nLock` }, { code: `NumpadDivide` }, { code: `NumpadMultiply` }, { code: `NumpadSubtract` }] }, // NumLk T/ T* T-
		{ keys: [{ code: `Numpad7` }, { code: `Numpad8` }, { code: `Numpad9` }, { code: `NumpadAdd`, h: 2 }] },                               // T7 T8 T9 T+(縦2u)
		{ keys: [{ code: `Numpad4` }, { code: `Numpad5` }, { code: `Numpad6` }] },                                                             // T4 T5 T6
		{ keys: [{ code: `Numpad1` }, { code: `Numpad2` }, { code: `Numpad3` }, { code: `NumpadEnter`, h: 2 }] },                             // T1 T2 T3 TEnter(縦2u)
		{ keys: [{ code: `Numpad0`, w: 2 }, { code: `NumpadDecimal` }] },                                                                     // T0(横2u) T.
	];

	// -------------------------------------------------------------------------
	// 内部状態
	// -------------------------------------------------------------------------
	const _state = {
		visible: false,
		mappedSet: new Set(),     // メインキー（code文字列）
		altSet: new Set(),        // 代替キー（code文字列）
		shortcutSet: new Set(),   // ショートカットキー（code文字列）
		canvasBase: null,
		canvasMap: null,
		keyDataList: [],          // { code, x, y, w, h, label } — drawMap で照合するキャッシュ
		scale: 1,                 // BASE_KEY_W/H に掛けるスケール係数
		cvsX: 0,                  // Canvas の左上 X 座標（divRoot 内の相対座標）
		cvsW: 500,                // 実際の Canvas 幅（スケール計算後）
		cvsH: 240,                // 実際の Canvas 高さ（スケール計算後）
	};

	// -------------------------------------------------------------------------
	// スケール計算
	// -------------------------------------------------------------------------

	/**
	 * g_btnWidth() / g_sHeight を元にスケール係数と Canvas サイズを算出して
	 * _state に書き込む。init 時に呼ぶ。
	 *
	 * 基準サイズ（フルキーボード = メイン + ナビクラスター）:
	 *   横: MAIN最大行幅 + ナビ幅(3キー) + 余白
	 *   縦: 6行 × (BASE_KEY_H + BASE_KEY_GAP) - BASE_KEY_GAP
	 *   BASE_KEY_W = BASE_KEY_H = 28px、BASE_KEY_GAP = 3px を基準とする。
	 */
	const BASE_KEY_W = 28;
	const BASE_KEY_H = 28;
	const BASE_KEY_GAP = 3;
	const MAIN_ROWS_LEN = 6;  // MAIN_ROWS の行数（Fn行を含む）

	// 行幅計算（スペーサー含む）
	const calcRowBaseW = row =>
		row.keys.reduce((acc, k) => acc + (k.w || 1) * BASE_KEY_W + BASE_KEY_GAP, -BASE_KEY_GAP);

	const BASE_NAV_W = 3 * BASE_KEY_W + 2 * BASE_KEY_GAP;  // NAV は 3列固定
	const BASE_ROW_H = MAIN_ROWS_LEN * (BASE_KEY_H + BASE_KEY_GAP) - BASE_KEY_GAP;  // MAIN+NAV 分の高さ
	const NUM_ROWS_LEN = 6;  // テンキーの行数（1行目は空行、2行目からテンキー配置）
	const NUM_GAP_H = BASE_KEY_H * 0.4;  // テンキー上部の余白（基準キー高の40%）
	const BASE_NUM_ROW_H = NUM_ROWS_LEN * (BASE_KEY_H + BASE_KEY_GAP) - BASE_KEY_GAP;  // テンキー部の高さ
	const BASE_NUM_W = 4 * BASE_KEY_W + 3 * BASE_KEY_GAP;  // テンキー横幅（4列固定）

	const calcScale = () => {
		// locale に依存した行幅を毎回計算する
		const rows = buildMainRows();
		const baseMainW = Math.max(...rows.map(calcRowBaseW));
		// 横幅: メイン + NAV + テンキー + 余白
		const totalW = baseMainW + BASE_KEY_GAP * 2 + BASE_NAV_W + BASE_KEY_GAP * 2
			+ BASE_KEY_GAP * 3 + BASE_NUM_W;

		const tkObj = getKeyInfo();
		const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
		const configKeyGroupList = g_headerObj.keyGroupOrder[g_stateObj.scoreId] ??
			g_keyObj[`keyGroupOrder${keyCtrlPtn}`] ?? tkObj.keyGroupList;

		const availW = g_btnWidth() + (configKeyGroupList.length > 1 ? -g_lblPosObj.lnkKeySwitch.w - 10 : 0);
		const availH = g_sHeight - 200 - LEGEND_H;  // 下部 UI ぶんを除いた高さ

		// 縦幅基準: MAIN/NAV 高さ と テンキー高さ（余白込み）の大きい方
		const totalH = Math.max(BASE_ROW_H, BASE_NUM_ROW_H + Math.ceil(NUM_GAP_H));

		const scaleW = availW / totalW;
		const scaleH = availH / totalH;
		_state.scale = Math.min(scaleW, scaleH, 1.5);  // 最大 1.5 倍まで拡大可

		_state.cvsX = configKeyGroupList.length > 1 ? (-g_lblPosObj.lnkKeySwitch.w - 10) / 2 : 0;
		_state.cvsW = Math.floor(totalW * _state.scale);
		_state.cvsH = Math.floor(totalH * _state.scale) + LEGEND_H;
	};

	// -------------------------------------------------------------------------
	// ラベル取得
	// -------------------------------------------------------------------------

	/**
	 * code に対応する [primaryLabel, subLabel] を返す。
	 *
	 * @param {string}           code
	 * @param {string|undefined} forcedLabel - ROWS の label 指定がある場合に優先
	 * @returns {string[]} [primary, sub]
	 */
	const getKeyLabels = (code, forcedLabel) => {
		if (!code) return [``, ``];
		if (forcedLabel !== undefined) return [forcedLabel, ``];

		// code 文字列から従来の keyCode を逆引きして g_kCd から取得
		const kc = g_kCdN.indexOf(code);
		if (kc >= 0) {
			const raw = g_kCd[kc];
			if (raw && raw !== g_kCd[0] && raw !== g_kCd[1]) {
				const parts = raw.split(` `);
				return [parts[0] || ``, parts[1] || ``];
			}
		}
		return [`?`, ``];
	};

	// -------------------------------------------------------------------------
	// Canvas ヘルパー
	// -------------------------------------------------------------------------

	// スケール済みの各寸法を返すヘルパー
	const kw = w => Math.floor(w * BASE_KEY_W * _state.scale + (w - 1) * BASE_KEY_GAP * _state.scale);
	const kh = h => Math.floor(h * BASE_KEY_H * _state.scale + (h - 1) * BASE_KEY_GAP * _state.scale);
	const kg = () => Math.max(1, Math.round(BASE_KEY_GAP * _state.scale));
	const kr = () => Math.max(2, Math.round(4 * _state.scale));

	/**
	 * Canvasの共通初期化処理
	 * @param {HTMLCanvasElement} canvas
	 * @returns {CanvasRenderingContext2D|null}
	 */
	const setupCanvasContext = (canvas) => {
		if (!canvas) return null;
		canvas.style.top = wUnit(40);
		canvas.width = _state.cvsW * g_dpr;
		canvas.height = _state.cvsH * g_dpr;
		canvas.style.width = wUnit(_state.cvsW);
		canvas.style.height = wUnit(_state.cvsH);

		const ctx = canvas.getContext(`2d`);
		ctx.scale(g_dpr, g_dpr);
		return ctx;
	};

	/**
	 * 円角矩形を描画する
	 * @param {CanvasRenderingContext2D} ctx 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {number} w 
	 * @param {number} h 
	 * @param {number} r 
	 */
	const roundRect = (ctx, x, y, w, h, r) => {
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + w - r, y);
		ctx.quadraticCurveTo(x + w, y, x + w, y + r);
		ctx.lineTo(x + w, y + h - r);
		ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		ctx.lineTo(x + r, y + h);
		ctx.quadraticCurveTo(x, y + h, x, y + h - r);
		ctx.lineTo(x, y + r);
		ctx.quadraticCurveTo(x, y, x + r, y);
		ctx.closePath();
	};

	/**
	 * 単一キーを描画する（枠の描画と内部テキストの書き込みを一括化）
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Object} keyData - 位置・サイズ・キーコードを含むキー情報
	 * @param {Object} style   - fill, stroke, text 等の色セット
	 * @param {number} lw      - 枠線の太さ(lineWidth)
	 */
	const drawOneKey = (ctx, { keyData, style, lw = 1 }) => {
		const { x, y, w: keyW, h: keyH, code, label } = keyData;

		// 1. キーの枠線・背景を描画
		roundRect(ctx, x + 0.5, y + 0.5, keyW - 1, keyH - 1, kr());
		ctx.fillStyle = style.fill;
		ctx.strokeStyle = style.stroke;
		ctx.lineWidth = lw;
		ctx.fill();
		ctx.stroke();

		// 2. キー内部のテキスト（メイン・サブ）を描画
		const [primary, sub] = getKeyLabels(code, label);

		const fs = (_textLen) => _textLen >= 5 * keyW / BASE_KEY_W
			? Math.max(6, Math.floor(9 * _state.scale))
			: Math.max(7, Math.floor(11 * _state.scale));

		// サブラベル（Shift面などの表記）がある場合
		if (sub) {
			ctx.fillStyle = style.subText || style.text;
			ctx.font = `bold ${Math.max(6, Math.floor(9 * _state.scale))}px monospace`;
			ctx.textAlign = `right`;
			ctx.textBaseline = `top`;
			ctx.fillText(sub, x + keyW - 2, y + 2);
		}

		// メインラベルの描画（改行表記に対応）
		const [primary1, primary2] = primary.split(`\n`);
		ctx.fillStyle = style.text;
		ctx.textAlign = `center`;
		ctx.textBaseline = `middle`;
		const subDiff = sub ? 2 : 0;

		if (primary2) {
			const siz = fs(Math.max(primary1.length, primary2.length));
			ctx.font = `bold ${siz}px monospace`;
			ctx.fillText(primary1, x + keyW / 2, y + keyH / 2 - siz / 2 + subDiff);
			ctx.fillText(primary2, x + keyW / 2, y + keyH / 2 + siz / 2 + subDiff);
		} else {
			ctx.font = `bold ${fs(primary.length)}px monospace`;
			ctx.fillText(primary, x + keyW / 2, y + keyH / 2 + subDiff);
		}
	};

	// -------------------------------------------------------------------------
	// レイアウト計算・描画
	// -------------------------------------------------------------------------

	/**
	 * rows 配列から各キーの矩形座標を計算し、
	 * canvas に描画しながら keyDataList へキャッシュする。
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Array}  rows    - MAIN_ROWS または NAV_ROWS（{offsetX, keys} 形式）
	 * @param {number} originX - セクション左端の X 座標（canvas 座標）
	 * @param {number} originY - セクション上端の Y 座標（canvas 座標）
	 */
	const layoutSection = (ctx, rows, originX, originY) => {
		const gap = kg();
		const baseKeyH = kh(1);

		rows.forEach((rowDef, rowIdx) => {
			if (rowDef.keys.length === 0) return;

			const rowY = originY + rowIdx * (baseKeyH + gap);
			const startX = originX + Math.floor((rowDef.offsetX || 0) * BASE_KEY_W * _state.scale);
			let curX = startX;

			rowDef.keys.forEach(keyDef => {
				const keyW = kw(keyDef.w || 1);
				const keyH = kh(keyDef.h || 1);

				if (keyDef.code !== ``) {
					const keyData = {
						code: keyDef.code,
						x: curX,
						y: rowY,
						w: keyW,
						h: keyH,
						label: keyDef.label,
					};
					_state.keyDataList.push(keyData);
					drawOneKey(ctx, { keyData, style: C_COLOR.normal, lw: 1 });
				}

				curX += keyW + gap;
			});
		});
	};

	/**
	 * キーボード背景レイヤーを描画し keyDataList をキャッシュする。
	 * init 時に呼ぶ。
	 */
	const drawBase = () => {
		const ctx = setupCanvasContext(_state.canvasBase);
		if (!ctx) return;

		ctx.clearRect(0, 0, _state.cvsW, _state.cvsH);
		ctx.fillStyle = C_COLOR.bgFill;
		ctx.fillRect(0, 0, _state.cvsW, _state.cvsH);

		_state.keyDataList = [];

		const mainRows = buildMainRows();
		const gap = kg();
		const baseMainW = Math.max(...mainRows.map(calcRowBaseW));
		const mainW = Math.floor(baseMainW * _state.scale);
		const originY = gap;
		const navOriginX = mainW + gap * 3;

		// テンキー: NAV クラスターの右に gap*3 の余白を空けて配置
		const numOriginX = navOriginX + Math.floor(BASE_NAV_W * _state.scale) + gap * 3;
		// テンキーは MAIN 全体に対して縦方向センタリング
		const numH = Math.floor(BASE_NUM_ROW_H * _state.scale);
		const mainH = Math.floor(BASE_ROW_H * _state.scale);
		const numOriginY = originY + Math.floor((mainH - numH) / 2);

		layoutSection(ctx, mainRows, 0, originY);
		layoutSection(ctx, NAV_ROWS, navOriginX, originY);
		layoutSection(ctx, NUM_ROWS, numOriginX, numOriginY);

		// 凡例
		const ly = _state.cvsH - 10;
		ctx.font = `${Math.max(9, Math.floor(12 * _state.scale))}px ${getBasicFont()}`;
		ctx.textAlign = `left`;
		ctx.textBaseline = `middle`;

		const legends = [
			{ style: C_COLOR.normal, label: g_lblNameObj.unallocated },
			{ style: C_COLOR.mapped, label: g_lblNameObj.allocated },
			{ style: C_COLOR.alt, label: g_lblNameObj.altAllocated },
			{ style: C_COLOR.shortcut, label: g_lblNameObj.shortcutKey }
		];

		let lx = 8;
		legends.forEach(item => {
			roundRect(ctx, lx, ly - 5, 10, 10, 2);
			ctx.fillStyle = item.style.fill; ctx.fill();
			ctx.strokeStyle = item.style.stroke; ctx.lineWidth = 1; ctx.stroke();
			ctx.fillStyle = C_COLOR.legendText;
			ctx.fillText(item.label, lx + 14, ly);
			lx += ctx.measureText(item.label).width + 28;
		});
	};

	/**
	 * マッピング強調レイヤーを再描画する。
	 * メインキー（mappedSet）を青系、代替キー（altSet）を黄系で色分けする。
	 * 同一キーにメインと代替が重なる場合はメインを優先する。
	 */
	const drawMap = () => {
		const ctx = setupCanvasContext(_state.canvasMap);
		if (!ctx) return;

		ctx.clearRect(0, 0, _state.cvsW, _state.cvsH);

		// キー状態に応じた色取得ロジック（優先度: ショートカット > メイン > 代替）
		const getKeyStyle = (code) => {
			if (_state.shortcutSet.has(code)) return C_COLOR.shortcut;
			if (_state.mappedSet.has(code)) return C_COLOR.mapped;
			if (_state.altSet.has(code)) return C_COLOR.alt;
			return null;
		};

		_state.keyDataList.forEach(keyData => {
			const style = getKeyStyle(keyData.code);
			if (style) {
				drawOneKey(ctx, { keyData, style, lw: 1.5 });
			}
		});
	};

	// -------------------------------------------------------------------------
	// 公開 API
	// -------------------------------------------------------------------------

	/**
	 * キーボードプレビューを初期化し、ボタンと Canvas コンテナを divRoot に追加する。
	 *
	 * @param {HTMLElement} divRoot - キーコンフィグ画面のルート div
	 */
	const init = divRoot => {
		calcScale();

		// "↓ Preview" → 展開、"↑ Preview" → 閉じる のトグルボタン
		const btn = createCss2Button(`btnKbPreview`, `↓ Preview`, () => {
			togglePreview();
			btn.textContent = _state.visible ? `↑ Preview` : `↓ Preview`;
		}, g_lblPosObj.btnKbPreview, g_cssObj.button_Setting);
		divRoot.appendChild(btn);

		// プレビューエリア: 水平・垂直センタリング
		const areaX = g_btnX() + Math.floor((g_btnWidth() - _state.cvsW) / 2) + _state.cvsX;
		const areaY = 130;

		const areaDiv = createEmptySprite(divRoot, C_PREVIEW_ID, {
			x: areaX, y: areaY - 60, w: _state.cvsW, h: _state.cvsH + 80,
			pointerEvents: C_DIS_AUTO, background: `#00000080`, display: C_DIS_NONE, overflow: `hidden`,
		});

		const canvasBase = document.createElement(`canvas`);
		canvasBase.id = C_CANVAS_BASE_ID;
		areaDiv.appendChild(canvasBase);
		_state.canvasBase = canvasBase;

		const canvasMap = document.createElement(`canvas`);
		canvasMap.id = C_CANVAS_MAP_ID;
		areaDiv.appendChild(canvasMap);
		_state.canvasMap = canvasMap;

		drawBase();
	};

	/**
	 * プレビューの表示 / 非表示を切り替える。
	 * 表示するたびにマッピングレイヤーを最新化する。
	 */
	const togglePreview = () => {
		const area = document.getElementById(C_PREVIEW_ID);
		if (!area) return;

		_state.visible = !_state.visible;
		area.style.display = _state.visible ? `block` : `none`;
		g_stateObj.kbPreviewFlg = _state.visible;
		g_stateObj.keyLockFlg = _state.visible;
		toggleKcDesc();
		if (_state.visible) refresh();
	};

	/**
	 * g_keyObj から現在のキー割り当てを取得して mappedSet / altSet を更新し、
	 * プレビューが表示中なら即時再描画する。
	 *
	 * g_keyObj[`keyCtrl${keyCtrlPtn}`] は二次元配列:
	 *   [ [矢印0のメインkeyCode, 代替keyCode, ...], [矢印1のメインkeyCode, ...], ... ]
	 * 各サブ配列の index 0 がメインキー、index 1 以降が代替キー。
	 */
	const refresh = () => {
		const tkObj = getKeyInfo();
		const configKeyGroupList = g_headerObj.keyGroupOrder[g_stateObj.scoreId] ??
			g_keyObj[`keyGroupOrder${tkObj.keyCtrlPtn}`] ?? tkObj.keyGroupList;
		const ctrl = g_keyObj[`keyCtrl${tkObj.keyCtrlPtn}`]
			.filter((val, idx) => tkObj.keyGroupMaps[idx].includes(configKeyGroupList[g_keycons.keySwitchNum]));

		// 数値から code 文字列へ安全に変換するヘルパー
		const toCodeStr = (num) => g_kCdN[num] || ``;

		_state.mappedSet = new Set(ctrl.map(arr => toCodeStr(arr[0])).filter(v => v !== ``));
		_state.altSet = new Set(ctrl.flatMap(arr => arr.slice(1)).map(toCodeStr).filter(v => v !== ``));

		// プレイ中ショートカット: keyRetry / keyTitleBack / keyPause は g_headerObj から取得、PgDn(34) / PgUp(33) は固定
		_state.shortcutSet = new Set(
			[g_headerObj.keyRetry, g_headerObj.keyTitleBack, g_headerObj.keyPause, 34, 33].map(toCodeStr).filter(v => v !== ``)
		);

		if (_state.visible) drawMap();
	};

	/**
	 * プレビューを強制非表示にしてリセットする。
	 * キーコンフィグ画面の離脱時に呼ぶ。
	 */
	const dispose = () => {
		_state.visible = false;
		_state.mappedSet = new Set();
		_state.altSet = new Set();
		_state.shortcutSet = new Set();
		_state.keyDataList = [];
		_state.canvasBase = null;
		_state.canvasMap = null;
	};

	return { init, refresh, togglePreview, dispose };

})();

/**
 * 回転できないオブジェクトの場合に設定の自動絞り込みを行う
 */
const changeSettingListsForImg = () => {
	if (g_stateObj.rotateEnabled) {
		g_settings.camoufrages = g_settings.camoufrageRotates.concat();
	} else {
		g_settings.camoufrages = g_settings.camoufrageNoRotates.concat();
		if (g_stateObj.camoufrage.startsWith(`Color`)) {
			g_stateObj.camoufrage = `Color`;
		} else {
			g_stateObj.camoufrage = C_FLG_OFF;
		}
	}
	g_settings.camoufrageNum = g_settings.camoufrages.findIndex(val => val === g_stateObj.camoufrage);
};

/**
 * 影矢印色の取得
 * @param {number} _colorPos 
 * @param {string} _arrowColor 
 * @returns {string}
 */
const getShadowColor = (_colorPos, _arrowColor) => g_headerObj.setShadowColor[_colorPos] === `Default` ?
	_arrowColor : g_headerObj.setShadowColor[_colorPos];

/**
 * デフォルトの曲中ショートカットをキー数・キーパターンにより切り替え
 * - キーコンフィグ画面で個別に変えていた場合は変更しない
 */
const setPlayingShortcut = () => {
	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	if (g_headerObj.keyRetryDef === C_KEY_RETRY) {
		g_headerObj.keyRetry = setIntVal(getKeyCtrlVal(g_keyObj[`keyRetry${keyCtrlPtn}`]), g_headerObj.keyRetryDef);
	}
	if (g_headerObj.keyTitleBackDef === C_KEY_TITLEBACK) {
		g_headerObj.keyTitleBack = setIntVal(getKeyCtrlVal(g_keyObj[`keyTitleBack${keyCtrlPtn}`]), g_headerObj.keyTitleBackDef);
	}
	if (g_headerObj.keyPauseDef === C_KEY_PAUSE) {
		g_headerObj.keyPause = setIntVal(getKeyCtrlVal(g_keyObj[`keyPause${keyCtrlPtn}`]), g_headerObj.keyPauseDef);
	}
};

/**
 * ステップゾーン間隔、大きさの更新
 * @param {string} _header 
 * @param {string} _keyCtrlPtn 
 */
const updateKeyInfo = (_header, _keyCtrlPtn) => {
	const kcPtn = hasVal(g_keyObj[`${_header}${_keyCtrlPtn}`]) ? _keyCtrlPtn : `_def`;
	g_keyObj[_header] = g_keyObj[`${_header}${kcPtn}`];
};

/**
 * 初期矢印色・フリーズアロー色の変更
 * - ここでのID管理は1譜面目も区別して設定する (setScoreIdHeaderの第三引数を使用)
 */
const changeSetColor = () => {
	const isDefault = g_keycons.colorDefTypes.includes(g_colorType);
	const idHeader = setScoreIdHeader(g_stateObj.scoreId, false, true);
	const defaultType = idHeader + g_colorType;
	const currentTypes = {
		'': (isDefault ? defaultType : g_colorType),
		'Shadow': (isDefault ? defaultType : `${idHeader}Default`),
	};
	Object.keys(currentTypes).forEach(pattern => {
		g_headerObj[`set${pattern}Color`] = structuredClone(g_headerObj[`set${pattern}Color${currentTypes[pattern]}`]);
		if (g_headerObj[`frz${pattern}Color`] === undefined) {
			g_headerObj[`frz${pattern}Color`] = fillArray(g_headerObj.setColorInit.length, ``);
		}
		for (let j = 0; j < g_headerObj.setColorInit.length; j++) {
			g_headerObj[`frz${pattern}Color`][j] = structuredClone(g_headerObj[`frz${pattern}Color${currentTypes[pattern]}`][j]);
		}
		if (!isDefault) {
			g_headerObj[`set${pattern}Color`] = structuredClone(g_headerObj[`set${pattern}Color${g_colorType}`]);
		}
	});

	// 影矢印が未指定の場合はType1, Type2の影矢印指定を無くす
	if (!hasVal(g_headerObj[`setShadowColor${idHeader}Default`][0]) && [`Type1`, `Type2`].includes(g_colorType)) {
		g_headerObj.setShadowColor = fillArray(g_headerObj.setColorInit.length, ``);
	}
};

/**
 * コンフィグの色変更
 * @param {HTMLDivElement} _obj 
 * @param {string} _cssName 
 */
const changeConfigColor = (_obj, _cssName) => {
	_obj.classList.remove(g_cssObj.keyconfig_Changekey, g_cssObj.keyconfig_Defaultkey, g_cssObj.title_base);
	_obj.classList.add(_cssName);
};

/**
 * シャッフルグループの色変更
 * - デフォルト値と違う番号になった場合、色付けする
 * @param {string} _keyCtrlPtn キーコンフィグパターン
 * @param {number[]} _vals シャッフルグループ番号（群）
 * @param {number} _j (-1: 全体に対して色付け, それ以外: 指定箇所のみ色付け)
 */
const changeShuffleConfigColor = (_keyCtrlPtn, _vals, _j = -1) => {
	const changeTargetColor = (_val, _k) => {
		const isEqualShuffleGr = (_val === g_keyObj[`shuffle${_keyCtrlPtn}_0d`][_k]);
		changeConfigColor(document.getElementById(`sArrow${_k}`), isEqualShuffleGr ? g_cssObj.title_base : g_cssObj.keyconfig_Changekey);
	};

	if (_j === -1) {
		_vals.forEach((val, m) => changeTargetColor(val, m));
	} else {
		changeTargetColor(_vals, _j);
	}
};

/**
 * カラーグループ、シャッフルグループの再設定
 * @param {string} _type 
 * @param {string} _keyCtrlPtn
 */
const resetGroupList = (_type, _keyCtrlPtn) => {
	let k = 1;
	g_keycons[`${_type}Groups`] = [0];

	while (g_keyObj[`${_type}${_keyCtrlPtn}_${k}`] !== undefined) {
		g_keycons[`${_type}Groups`].push(k);
		k++;
	}
	if (g_keyObj.currentPtn === -1
		&& (_type !== `stepRtn` || (_type === `stepRtn` && g_keycons[`${_type}Groups`].length > 1))) {
		g_keycons[`${_type}Groups`] = addValtoArray(g_keycons[`${_type}Groups`], -1);
	}
	g_keycons[`${_type}GroupNum`] = Math.min(g_keyObj.currentPtn, 0);
};
