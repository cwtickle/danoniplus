/**
 * Dancing☆Onigiri (CW Edition)
 * タイトル画面（＋選曲処理）、データ管理画面、デバッグ画面
 * - ページ: title, dataMgt, precondition
 *
 * Source by tickle
 * Created : 
 * Revised : 
 *
 * https://github.com/cwtickle/danoniplus
 */

/*-----------------------------------------------------------*/
/* Scene : TITLE [melon] */
/*-----------------------------------------------------------*/

/**
 * タイトル画面初期化
 * @param {boolean} _initFlg 初期化フラグ
 */
const titleInit = (_initFlg = false) => {

	clearWindow();
	g_currentPage = `title`;
	g_stateObj.settingSummaryVisible = false;

	// タイトル用フレーム初期化
	g_scoreObj.titleFrameNum = 0;

	// 設定画面位置初期化
	g_settings.settingWindowNum = 0;

	// タイトルアニメーション用フレーム初期化、ループカウンター設定
	g_animationData.forEach(sprite => {
		g_scoreObj[`${sprite}TitleFrameNum`] = 0;
		g_scoreObj[`${sprite}TitleLoopCount`] = 0;
	});

	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;

	// 譜面初期情報ロード許可フラグ
	// (初回読み込み時はローカルストレージのロードが必要なため、
	//  ローカルストレージ保存時はフラグを解除しない)
	if (!g_stateObj.dataSaveFlg || hasVal(g_keyObj[`transKey${keyCtrlPtn}`])) {
		g_canLoadDifInfoFlg = false;
	}
	const divRoot = document.getElementById(`divRoot`);

	// 曲時間制御変数
	let thisTime;
	let buffTime;
	let titleStartTime = performance.now();

	// 背景スプライトを作成
	createMultipleSprite(`backTitleSprite`, g_headerObj.backTitleMaxDepth);

	// タイトル文字描画
	divRoot.appendChild(
		getTitleDivLabel(`lblTitle`,
			`<div class="settings_Title">${g_lblNameObj.dancing}</div>
		<div class="settings_TitleStar">${g_lblNameObj.star}</div>
		<div class="settings_Title2">${g_lblNameObj.onigiri}</div>`
				.replace(/[\t\n]/g, ``), 0, 15, g_cssObj.flex_centering)
	);

	// 背景の矢印オブジェクトを表示
	const tmpCreatorList = [];
	if (g_headerObj.musicSelectUse) {
		if (getQueryParamVal(`scoreId`) !== null) {
			g_headerObj.viewLists = [];
			g_headerObj.musicNos.forEach((val, j) => {
				if ((g_headerObj.musicGroups?.[val] ?? val) === g_settings.musicIdxNum) {
					g_headerObj.viewLists.push(j);
					tmpCreatorList.push(g_headerObj.creatorNames[j]);
				}
			});
			divRoot.appendChild(drawBackArrow(g_headerObj.viewLists[0] + 1));
			loadLocalStorage(g_settings.musicIdxNum);
			makeInfoWindow(g_msgInfoObj.W_0041.split(`{0}`).join(g_localStorageUrl), ``,
				{ _backColor: `#333333`, _textColor: `#cccccc`, _pointerEvents: C_DIS_INHERIT });
		}
	} else if (!g_headerObj.customTitleArrowUse) {
		divRoot.appendChild(drawBackArrow());
	}

	let wheelHandler;
	if (g_headerObj.musicSelectUse && getQueryParamVal(`scoreId`) === null) {

		// 選曲画面の初期化
		const wheelCycle = 2;
		g_settings.musicLoopNum = 0;

		/**
		 * メイン以外の選曲ボタンの作成
		 * @param {number} _heightPos 
		 * @returns {HTMLDivElement}
		 */
		const createMSelectBtn = (_heightPos) => createCss2Button(`btnMusicSelect${_heightPos}`,
			``, () => changeMSelect(_heightPos), {
			x: g_btnX(1 / 3) + Math.abs(_heightPos) * 10,
			y: g_sHeight / 2 + _heightPos * 30 + (_heightPos > 0 ? 1 : -1) * 90,
			w: g_btnWidth(1 / 2), h: 27, siz: 14, border: `solid 1px #666666`,
			align: C_ALIGN_LEFT, padding: `0 10px`,
		}, g_cssObj.button_Default_NoColor, g_cssObj.title_base);

		/**
		 * 選曲画面上の音量調整
		 * @param {number} _num 
		 */
		const setBGMVolume = (_num = 1) => {
			g_settings.bgmVolumeNum = nextPos(g_settings.bgmVolumeNum, _num, g_settings.volumes.length);
			g_stateObj.bgmVolume = g_settings.volumes[g_settings.bgmVolumeNum];
			if (g_audioForMS) {
				g_audioForMS.volume = g_stateObj.bgmVolume / 100;
			}
			btnBgmVolume.textContent = `${g_stateObj.bgmVolume}${g_lblNameObj.percent}`;
		};

		for (let j = -g_settings.mSelectableTerms; j <= g_settings.mSelectableTerms; j++) {
			if (j !== 0) {
				divRoot.appendChild(createMSelectBtn(j));
			}
		}
		createEmptySprite(divRoot, `keyTitleSprite`, g_windowObj.keyTitleSprite);
		multiAppend(divRoot,
			createDivCss2Label(`lblMusicSelect`, ``, g_lblPosObj.lblMusicSelect),
			createDivCss2Label(`lblMusicSelectDetail`, ``, g_lblPosObj.lblMusicSelectDetail),
			createCss2Button(`btnStart`,
				`>`, () => {
					g_timerHandler.clearTimeout(g_timeoutEvtTitleId);
					g_handler.removeListener(wheelHandler);
					g_keyObj.prevKey = `Dummy${g_settings.musicIdxNum}`;
					g_langStorage.bgmVolume = g_stateObj.bgmVolume;
					localStorage.setItem(`danoni-locale`, JSON.stringify(g_langStorage));
				}, { ...g_lblPosObj.btnStart_music, resetFunc: () => optionInit() }, g_cssObj.button_Tweet),
			createCss2Button(`btnMusicSelectPrev`, `↑`, () => changeMSelect(-1),
				g_lblPosObj.btnMusicSelectPrev, g_cssObj.button_Setting),
			createCss2Button(`btnMusicSelectNext`, `↓`, () => changeMSelect(1),
				g_lblPosObj.btnMusicSelectNext, g_cssObj.button_Setting),
			createCss2Button(`btnMusicSelectRandom`, `Random`, () =>
				changeMSelect(Math.floor(Math.random() * (g_headerObj.musicIdxList.length - 1)) + 1),
				g_lblPosObj.btnMusicSelectRandom, g_cssObj.button_Default),
			createDivCss2Label(`lblMusicCnt`, ``, g_lblPosObj.lblMusicCnt),
		);
		createEmptySprite(divRoot, `lblCommentM`, g_lblPosObj.lblComment_music);
		multiAppend(lblCommentM,
			createDivCss2Label(`lblDifNameInfoM`, ``, g_lblPosObj.lblDifNameInfoM),
			createDivCss2Label(`lblDiffiInfoM`, ``, g_lblPosObj.lblDiffiInfoM),
			createDivCss2Label(`lblNotesInfoM`, ``, g_lblPosObj.lblNotesInfoM),
			createDivCss2Label(`lblCommentInfoM`, ``, g_lblPosObj.lblCommentInfoM),
		);

		if (g_headerObj.bgmUseFlg) {
			multiAppend(divRoot,
				createDivCss2Label(`lblBgmVolume`, g_lblNameObj.bgmVolume, g_lblPosObj.lblBgmVolume),
				createCss2Button(`btnBgmMute`, g_stateObj.bgmMuteFlg ? g_emojiObj.muted : g_emojiObj.speaker, evt => {
					g_stateObj.bgmMuteFlg = !g_stateObj.bgmMuteFlg;
					g_stateObj.bgmMuteFlg ? pauseBGM() : playBGM(0);
					evt.target.innerHTML = g_stateObj.bgmMuteFlg ? g_emojiObj.muted : g_emojiObj.speaker;
				}, g_lblPosObj.btnBgmMute, g_cssObj.button_Default),
				createCss2Button(`btnBgmVolume`, `${g_stateObj.bgmVolume}${g_lblNameObj.percent}`, () => setBGMVolume(), {
					...g_lblPosObj.btnBgmVolume, cxtFunc: () => setBGMVolume(-1),
				}, g_cssObj.button_Default),
				createCss2Button(`btnBgmVolumeL`, `<`, () => setBGMVolume(-1),
					g_lblPosObj.btnBgmVolumeL, g_cssObj.button_Setting),
				createCss2Button(`btnBgmVolumeR`, `>`, () => setBGMVolume(),
					g_lblPosObj.btnBgmVolumeR, g_cssObj.button_Setting),
			);
		} else {
			multiAppend(divRoot,
				createDivCss2Label(`lblBgmVolume`, `${g_lblNameObj.bgmMuted} ${g_emojiObj.muted}`, g_lblPosObj.btnBgmVolume),
			);
		}
		changeMSelect(0, _initFlg);

		let wheelCnt = 0;
		wheelHandler = g_handler.addListener(divRoot, `wheel`, e => {

			if (document.getElementById(`lblComment`) !== null && lblComment.style.display === C_DIS_INHERIT) {
				return;
			}
			// コメント欄（lblCommentM）のスクロール可能性をチェック
			const isScrollable = lblCommentM.scrollHeight > lblCommentM.clientHeight;

			// マウスがコメント欄上にあり、スクロールが可能ならイベントをスキップ
			if (lblCommentM.contains(e.target) && isScrollable) {
				// スクロール位置の判定
				const atTop = lblCommentM.scrollTop === 0 && e.deltaY < 0;
				const atBottom = (lblCommentM.scrollTop + lblCommentM.clientHeight >= lblCommentM.scrollHeight) && e.deltaY > 0;

				// スクロール可能＆上端または下端ではないなら処理をスキップ
				if (!atTop && !atBottom) {
					return;
				}
			}
			e.preventDefault();
			if (g_stateObj.keyInitial && wheelCnt === 0) {
				changeMSelect(e.deltaY > 0 ? 1 : -1);
			}
			wheelCnt = (wheelCnt + 1) % wheelCycle;
		});

		// 初期表示用 (2秒後に選曲画面を表示)
		if (_initFlg && !g_headerObj.customTitleUse) {
			if (g_audioForMS) {
				g_audioForMS.muted = true;
			}
			const mSelectTitleSprite = createEmptySprite(divRoot, `mSelectTitleSprite`,
				g_windowObj.mSelectTitleSprite, g_cssObj.settings_DifSelector);
			multiAppend(mSelectTitleSprite,
				drawBackArrow(),
				drawTitle(g_headerObj.packageNames),
			);

			let spriteOpacity = 1;
			let fadeOpacity = null;
			const fadeStartOpacity = g_timerHandler.setTimeout(() => {
				g_timerHandler.clearTimeout(fadeStartOpacity);
				setOpacity(spriteOpacity);
			}, 2000);

			const setOpacity = (_opacity) => {
				if (_opacity <= 0) {
					g_timerHandler.clearTimeout(fadeOpacity);
					mSelectTitleSprite.style.display = C_DIS_NONE;
					if (!g_stateObj.bgmMuteFlg && g_audioForMS) {
						g_audioForMS.muted = false;
						g_audioForMS.currentTime = g_headerObj.musicStarts[g_headerObj.musicIdxList[g_settings.musicIdxNum]] ?? 0;
						if (g_audioForMS instanceof AudioPlayer) {
							// AudioPlayerはシークを適用するために再起動が必要
							g_audioForMS.pause();
							g_audioForMS.play();
						}
					}
				} else {
					mSelectTitleSprite.style.opacity = _opacity;
					fadeOpacity = g_timerHandler.setTimeout(() => {
						spriteOpacity -= 0.25;
						setOpacity(spriteOpacity);
					}, 50);
				}
			};
		}
	} else if (!g_headerObj.customTitleUse) {
		// 曲名文字描画（曲名は譜面データから取得）
		divRoot.appendChild(
			g_headerObj.musicSelectUse
				? drawTitle(g_headerObj.musicTitlesForView[g_settings.musicIdxNum], g_headerObj.viewLists[0] + 1)
				: drawTitle()
		);
	}

	// クレジット表示
	externalWebTitle();

	if (g_errMsgObj.title !== ``) {
		makeWarningWindow();
	}

	// ユーザカスタムイベント(初期)
	safeExecuteCustomHooks(`g_customJsObj.title`, g_customJsObj.title);

	// バージョン情報取得
	let customVersion = ``;
	if (g_localVersion !== ``) {
		customVersion = ` / ${g_localVersion}`;
	}
	if (g_localVersion2 !== ``) {
		customVersion += ` / ${g_localVersion2}`;
	}
	const releaseDate = (g_headerObj.releaseDate !== `` ? ` @${g_headerObj.releaseDate}` : ``);
	const remoteDomainInfo = g_remoteDomain !== null ? ` (${g_remoteDomain})` : ``;
	const versionName = `&copy; 2018-${g_revisedDate.slice(0, 4)} ティックル, CW ${g_version}${remoteDomainInfo}${customVersion}${releaseDate}`;
	const getLinkSiz = _name => getFontSize2(_name, g_sWidth / 2 - 20, { maxSiz: g_limitObj.lnkSiz, minSiz: 12 });

	/**
	 * クレジット用リンク作成
	 * @param {string} _id 
	 * @param {string} _text 
	 * @param {string} _url 
	 * @returns {HTMLDivElement}
	 */
	const createCreditBtn = (_id, _text, _url) =>
		createCss2Button(_id, _text, () => true,
			{ ...g_lblPosObj[_id], siz: getLinkSiz(_text), whiteSpace: `normal`, resetFunc: () => openLink(_url) }, g_cssObj.button_Default);

	if (g_headerObj.musicSelectUse && getQueryParamVal(`scoreId`) === null) {
		// 選曲モードではクレジット表示は別で行われているため表示しない
	} else {
		if (tmpCreatorList.length === 0) {
			tmpCreatorList.push(g_headerObj.creatorNames[0]);
		}
		const [creatorName, creatorUrl] = getCreatorInfo(tmpCreatorList);

		multiAppend(divRoot,

			// Click Here
			createCss2Button(`btnStart`, g_lblNameObj.clickHere, () => {
				g_timerHandler.clearTimeout(g_timeoutEvtTitleId);
				g_keyObj.prevKey = `Dummy${g_settings.musicIdxNum}`;
			}, {
				x: g_btnX(), w: g_btnWidth(), siz: g_limitObj.titleSiz, resetFunc: () => optionInit(),
			}, g_cssObj.button_Start),

			// 製作者表示
			createCreditBtn(`lnkMaker`, `${g_lblNameObj.maker}: ${g_headerObj.musicSelectUse ? creatorName : g_headerObj.tuningInit}`,
				g_headerObj.musicSelectUse ? creatorUrl : g_headerObj.creatorUrl),

			// アーティスト表示
			createCreditBtn(`lnkArtist`, `${g_lblNameObj.artist}: ${g_headerObj.artistNames[g_settings.musicIdxNum]}`, g_headerObj.artistUrls[g_settings.musicIdxNum]),
		);
	}

	multiAppend(divRoot,

		// Reset
		createCss2Button(`btnReset`, g_lblNameObj.dataReset, () => {
			g_timerHandler.clearTimeout(g_timeoutEvtTitleId);
			g_handler.removeListener(wheelHandler);
			dataMgtInit();
		}, g_lblPosObj.btnReset, g_cssObj.button_Reset),

		// ロケール切替
		createCss2Button(`btnReload`, g_localeObj.val, () => true, {
			...g_lblPosObj.btnReload,
			resetFunc: () => {
				g_localeObj.num = (++g_localeObj.num) % g_localeObj.list.length;
				g_langStorage.locale = g_localeObj.list[g_localeObj.num];
				localStorage.setItem(`danoni-locale`, JSON.stringify(g_langStorage));
				location.reload();
			},
		}, g_cssObj.button_Start),

		// ヘルプ
		createCss2Button(`btnHelp`, `?`, () => true, {
			...g_lblPosObj.btnHelp,
			resetFunc: () => openLink(g_lblNameObj.helpUrl),
		}, g_cssObj.button_Setting),

		// バージョン描画
		createCss2Button(`lnkVersion`, versionName, () => true, {
			...g_lblPosObj.lnkVersion,
			siz: getFontSize2(versionName, g_sWidth * 3 / 4 - 20, { maxSiz: 12 }),
			resetFunc: () => openLink(`https://github.com/cwtickle/danoniplus`),
		}, g_cssObj.button_Tweet),

		// セキュリティリンク
		createCss2Button(`lnkComparison`, g_emojiObj.shield, () => true, {
			...g_lblPosObj.lnkComparison,
			resetFunc: () => openLink(g_lblNameObj.securityUrl),
		}, g_cssObj.button_Tweet),
	);

	// コメントエリア作成
	if (g_headerObj.commentVal !== ``) {

		// コメント文の加工
		const convCommentVal = convertStrToVal(g_headerObj.commentVal);
		if (g_headerObj.commentExternal) {
			if (document.getElementById(`commentArea`) !== null) {
				commentArea.innerHTML = convCommentVal;
			}
		} else {
			multiAppend(divRoot,
				createDivCss2Label(`lblComment`, convCommentVal, g_lblPosObj.lblComment),
				createCss2Button(`btnComment`, g_lblNameObj.comment, () => {
					const lblCommentDef = lblComment.style.display;
					lblComment.style.display = (lblCommentDef === C_DIS_NONE ? C_DIS_INHERIT : C_DIS_NONE);
				}, g_lblPosObj.btnComment, g_cssObj.button_Default),
			);
			if (g_headerObj.musicSelectUse && getQueryParamVal(`scoreId`) === null) {
				lblComment.style.height = wUnit(g_sHeight - 100);
			}
			setUserSelect(lblComment.style, `text`);
		}
	}

	// マスクスプライトを作成
	const maskTitleSprite = createMultipleSprite(`maskTitleSprite`, g_headerObj.maskTitleMaxDepth);
	maskTitleSprite.style.pointerEvents = g_headerObj.masktitleButton ? C_DIS_AUTO : C_DIS_NONE;

	/**
	 * タイトルのモーション設定
	 */
	const flowTitleTimeline = () => {

		// ユーザカスタムイベント(フレーム毎)
		safeExecuteCustomHooks(`g_customJsObj.titleEnterFrame`, g_customJsObj.titleEnterFrame);

		// 背景・マスクモーション、スキン変更
		drawTitleResultMotion(g_currentPage);

		thisTime = performance.now();
		buffTime = thisTime - titleStartTime - g_scoreObj.titleFrameNum * 1000 / g_fps;

		g_scoreObj.titleFrameNum++;
		g_animationData.forEach(sprite => g_scoreObj[`${sprite}TitleFrameNum`]++);
		g_timeoutEvtTitleId = g_timerHandler.setTimeout(flowTitleTimeline, 1000 / g_fps - buffTime);
	};

	g_timeoutEvtTitleId = g_timerHandler.setTimeout(flowTitleTimeline, 1000 / g_fps);

	// キー操作イベント（デフォルト）
	setShortcutEvent(g_currentPage, () => true, { dfEvtFlg: true });

	document.oncontextmenu = () => true;
	divRoot.oncontextmenu = () => false;

	safeExecuteCustomHooks(`g_skinJsObj.title`, g_skinJsObj.title);
};

/**
 * 外部のタイトル表示
 */
const externalWebTitle = () => {
	if (document.getElementById(`webMusicTitle`) !== null) {
		webMusicTitle.innerHTML =
			`<span style="font-size:${wUnit(32)}">${g_headerObj.musicTitlesForView[g_settings.musicIdxNum].join(`<br>`)}</span><br>
			<span style="font-size:${wUnit(16)}">(Artist: <a href="${g_headerObj.artistUrls[g_settings.musicIdxNum]}" target="_blank">${g_headerObj.artistNames[g_settings.musicIdxNum]}</a>)</span>`;
	}
};

/**
 * 背景矢印の表示
 * @param {string|number} _scoreId 
 * @returns {HTMLDivElement}
 */
const drawBackArrow = (_scoreId = ``) =>
	createColorObject2(`lblArrow`, {
		x: (g_sWidth - 500) / 2, y: -15 + (g_sHeight - 500) / 2,
		w: 500, h: 500, rotateEnabled: true,
		background: makeColorGradation(g_headerObj.titlearrowgrds[0] ||
			g_headerObj[`setColor${_scoreId}Org`]?.[0] || g_headerObj.setColorOrg[0], {
			_defaultColorgrd: [false, `#eeeeee`],
			_objType: `titleArrow`,
		}), rotate: `titleArrow:${g_headerObj.titleArrowRotate}`,
	});

/**
 * タイトル文字の表示
 * @param {string[]} _titleName 
 * @returns {HTMLDivElement}
 */
const drawTitle = (_titleName = g_headerObj.musicTitleForView, _scoreId = ``) => {

	// グラデーションの指定がない場合、
	// 矢印色の1番目と3番目を使ってタイトルをグラデーション
	const titlegrd1 = g_headerObj.titlegrds[0] || (g_headerObj[`setColor${_scoreId}Org`] ?
		`${g_headerObj[`setColor${_scoreId}Org`][0]}:${g_headerObj[`setColor${_scoreId}Org`][2]}` : `${g_headerObj.setColorOrg[0]}:${g_headerObj.setColorOrg[2]}`);
	const titlegrd2 = g_headerObj.titlegrds[1] || titlegrd1;

	const titlegrds = [];
	[titlegrd1, titlegrd2].forEach((titlegrd, j) =>
		titlegrds[j] = makeColorGradation(titlegrd, { _defaultColorgrd: false, _objType: `titleMusic` }));

	let titlefontsize = 64;
	for (let j = 0; j < _titleName.length; j++) {
		if (_titleName[j] !== ``) {
			titlefontsize = getFontSize2(_titleName[j], g_sWidth - 100, { font: g_headerObj.titlefonts[j], maxSiz: titlefontsize });
		}
	}

	// 変数 titlesize の定義 (使用例： |titlesize=40$20|)
	const titlefontsizes = (g_headerObj.titlesize?.split(`$`).join(`,`).split(`,`) || [titlefontsize, titlefontsize]);
	const titlefontsize1 = setIntVal(titlefontsizes[0], titlefontsize);
	const titlefontsize2 = setIntVal(titlefontsizes[1], titlefontsize1);

	// 変数 titlelineheight の定義 (使用例： |titlelineheight=50|)
	const titlelineheight = (g_headerObj.titlelineheight !== `` ? g_headerObj.titlelineheight - (titlefontsize2 + 10) : 0);

	const txtAnimations = [``, ``];
	if (!g_headerObj.customTitleAnimationUse) {
		for (let j = 0; j < txtAnimations.length; j++) {
			txtAnimations[j] = `animation-name:${g_headerObj.titleAnimationName[j]};
			animation-duration:${g_headerObj.titleAnimationDuration[j]}s;
			animation-delay:${g_headerObj.titleAnimationDelay[j]}s;
			animation-timing-function:${g_headerObj.titleAnimationTimingFunction[j]};`;
		}
	}
	return createDivCss2Label(`lblmusicTitle`,
		`<div id="lblmusicTitle1" style="
			font-family:${g_headerObj.titlefonts[0]};
			background: ${titlegrds[0]};
			background-clip: text;
			-webkit-background-clip: text;
			color: rgba(255,255,255,0.0);
			${txtAnimations[0]}
		" class="${g_headerObj.titleAnimationClass[0]}">
			${_titleName[0]}
		</div>
		<div id="lblmusicTitle2" style="
			font-size:${wUnit(titlefontsize2)};
			position:relative;left:${wUnit(g_headerObj.titlepos[1][0])};
			top:${wUnit(g_headerObj.titlepos[1][1] + titlelineheight)};
			font-family:${g_headerObj.titlefonts[1]};
			background: ${titlegrds[1]};
			background-clip: text;
			-webkit-background-clip: text;
			color: rgba(255,255,255,0.0);
			${txtAnimations[1]}
		" class="${g_headerObj.titleAnimationClass[1]}">
			${_titleName[1] ?? ``}
		</div>
		`,
		{
			x: Number(g_headerObj.titlepos[0][0]), y: Number(g_headerObj.titlepos[0][1]),
			w: g_sWidth, h: g_sHeight - 40, siz: titlefontsize1,
			display: `flex`, flexDirection: `column`, justifyContent: `center`, alignItems: `center`,
		}
	);
};

/**
 * 製作者情報の取得
 * @param {string[]} _creatorList 
 * @returns {[string, string, number]}
 */
const getCreatorInfo = (_creatorList) => {
	const creatorName = makeDedupliArray(_creatorList).length === 1 ? _creatorList[0] : `Various`;
	g_headerObj.makerView = g_headerObj.makerViewOrg ? true : creatorName === `Various`;
	const creatorIdx = g_headerObj.tuningNames.findIndex(val => val === creatorName);
	const creatorUrl = creatorIdx >= 0 ? g_headerObj.tuningUrls[creatorIdx] : ``;
	return [creatorName, creatorUrl, creatorIdx];
};

/**
 * BGMの停止
 */
const pauseBGM = () => {
	if (g_audioForMS) {
		g_handler.removeListener(g_stateObj.bgmTimeupdateEvtId);
		g_audioForMS.pause();
		if (!(g_audioForMS instanceof AudioPlayer)) {
			g_audioForMS.removeAttribute('src');
			g_audioForMS.load();
		}
	}
	[`bgmLooped`, `bgmFadeIn`, `bgmFadeOut`].forEach(id => {
		if (g_stateObj[id]) {
			g_timerHandler.clearTimeout(g_stateObj[id]);
			g_stateObj[id] = null;
		}
	});
};

/**
 * BGM再生処理
 * @param {number} _num 
 * @param {number} _currentLoopNum
 */
const playBGM = async (_num, _currentLoopNum = g_settings.musicLoopNum) => {
	const FADE_STEP = 0.05 * g_stateObj.bgmVolume / 100;
	const FADE_INTERVAL_MS = 100;
	const FADE_DELAY_MS = 500;

	const currentIdx = g_headerObj.musicIdxList[g_settings.musicIdxNum];
	const musicUrl = getMusicUrl(g_headerObj.viewLists[0]);
	const url = getFullMusicUrl(musicUrl);
	const encodeFlg = listMatching(musicUrl, [`.js`, `.txt`], { suffix: `$` });
	const musicStart = g_headerObj.musicStarts?.[currentIdx] ?? 0;
	const musicEnd = g_headerObj.musicEnds?.[currentIdx] ?? 0;
	const isTitle = () => g_currentPage === `title` && _currentLoopNum === g_settings.musicLoopNum;

	/**
	 * 汎用フェード処理
	 * @param {number} startVolume - 開始音量 (0〜1)
	 * @param {number} endVolume - 終了音量 (0〜1)
	 * @param {number} step - 1ステップの増減量
	 * @param {Function} onEnd - フェード完了時の処理
	 * @param {Function} isValid - フェード継続条件（true: 継続, false: 中断）
	 * @returns {number} timeoutId
	 */
	const fadeVolume = (startVolume, endVolume, step, onEnd, isValid) => {

		// 開始時点で終了音量とイコールの場合は終了
		if (startVolume === endVolume || step === 0) {
			g_audioForMS.volume = endVolume;
			onEnd(true);
			return null;
		}

		let volume = startVolume;
		g_audioForMS.volume = startVolume;

		const stepFunc = () => {
			// 継続条件チェック
			if (!isValid()) {
				onEnd(false); // 中断
				return;
			}

			// 終了判定
			const reached =
				(startVolume < endVolume && volume >= endVolume) ||
				(startVolume > endVolume && volume <= endVolume);

			if (reached) {
				g_audioForMS.volume = endVolume;
				onEnd(true); // 正常終了
				return;
			}

			// 音量更新
			volume += step;
			g_audioForMS.volume = Math.min(Math.max(volume, 0), 1);

			// 次のステップへ
			g_timerHandler.setTimeout(stepFunc, FADE_INTERVAL_MS);
		};

		return g_timerHandler.setTimeout(stepFunc, FADE_INTERVAL_MS);
	};

	/**
	 * 汎用ポーリング（監視）処理
	 * @param {Function} check - 条件チェック関数（true なら終了）
	 * @param {Function} onEnd - 終了時の処理
	 * @param {Function} isValid - 継続条件（true: 継続, false: 中断）
	 * @returns {number} timeoutId
	 */
	const poll = (check, onEnd, isValid) => {
		const step = () => {
			// 継続条件チェック
			if (!isValid()) {
				onEnd(false); // 中断
				return;
			}

			// 条件成立
			if (check()) {
				onEnd(true); // 正常終了
				return;
			}

			// 次のチェックへ
			g_timerHandler.setTimeout(step, FADE_INTERVAL_MS);
		};

		return g_timerHandler.setTimeout(step, FADE_INTERVAL_MS);
	};

	/**
	 * BGMのフェードアウトとシーク
	 */
	const fadeOutAndSeek = () => {
		const start = g_audioForMS.volume;
		const end = 0;

		g_stateObj.bgmFadeOut = fadeVolume(
			start,
			end,
			-FADE_STEP,
			/* onEnd */
			(finished) => {
				g_stateObj.bgmFadeOut = null;

				if (!finished) return; // 中断された

				g_audioForMS.pause();
				g_audioForMS.currentTime = musicStart;

				if (isTitle()) {
					g_timerHandler.setTimeout(() => {
						fadeIn();
						if (encodeFlg) repeatBGM();
					}, FADE_DELAY_MS);
				} else {
					pauseBGM();
				}
			},
			/* isValid */
			() =>
				isTitle() &&
				g_stateObj.bgmFadeOut !== null
		);
	};

	/**
	 * BGMのフェードイン
	 */
	const fadeIn = () => {
		if (!(g_audioForMS instanceof AudioPlayer) && !g_audioForMS.src) return;

		const start = 0;
		const end = g_stateObj.bgmVolume / 100;

		g_audioForMS.volume = 0;
		g_audioForMS.play();

		g_stateObj.bgmFadeIn = fadeVolume(
			start,
			end,
			FADE_STEP,
			/* onEnd */
			() => {
				g_stateObj.bgmFadeIn = null;
			},
			/* isValid */
			() =>
				isTitle() &&
				g_stateObj.bgmFadeIn !== null &&
				currentIdx === g_headerObj.musicIdxList[g_settings.musicIdxNum]
		);
	};

	/**
	 * BGMのループ処理 (base64エンコード時用)
	 * - base64エンコード時はtimeupdateイベントが発火しないため、監視しながらループ処理を行う
	 */
	const repeatBGM = () => {
		const numAtStart = g_settings.musicIdxNum;

		g_stateObj.bgmLooped = poll(
			/* check */
			() => {
				try {
					return (
						g_audioForMS.elapsedTime >= musicEnd ||
						numAtStart !== g_settings.musicIdxNum
					);
				} catch {
					return true; // エラー時は終了扱い
				}
			},
			/* onEnd */
			(finished) => {
				g_stateObj.bgmLooped = null;
				if (finished) {
					fadeOutAndSeek();
				}
			},
			/* isValid */
			() => g_stateObj.bgmLooped !== null
		);
	};

	/**
	 * 既存のAudio/AudioPlayerをクローズ
	 */
	const closeExistingAudio = () => {
		if (g_stateObj.bgmTimeupdateEvtId !== null && g_stateObj.bgmTimeupdateEvtId !== undefined) {
			g_handler.removeListener(g_stateObj.bgmTimeupdateEvtId);
			g_stateObj.bgmTimeupdateEvtId = null;
		}
		if (g_audioForMS instanceof AudioPlayer) {
			g_musicdata = ``;
			g_audioForMS.close();
		}
	};

	if (encodeFlg) {
		try {
			closeExistingAudio();
			const cachedBuffer = getAudioBufferFromCache(url);
			if (cachedBuffer !== undefined) {
				const tmpAudio = new AudioPlayer();
				tmpAudio.setBuffer(cachedBuffer);
				g_audioForMS = tmpAudio;
			} else {
				await loadScript2(url);
				musicInit();
				if (!isTitle()) { g_musicdata = ``; return; }

				const tmpAudio = new AudioPlayer();
				const array = base64ToUint8Array(g_musicdata);
				await tmpAudio.init(array.buffer);
				if (!isTitle()) { g_musicdata = ``; tmpAudio.close(); return; }

				cacheAudioBuffer(url, tmpAudio.getBuffer());
				g_audioForMS = tmpAudio;
			}
			g_audioForMS.volume = g_stateObj.bgmVolume / 100;
			if (g_currentPage === `title` && musicEnd > 0) {
				g_audioForMS.currentTime = musicStart;
				g_audioForMS.play();
				repeatBGM();
			}
		} catch (e) {
			// 音源の読み込みに失敗した場合、エラーを表示
			console.warn(`BGM load error: ${e}`);
		}

	} else {
		// 既存の監視を解除し、AudioPlayer を確実にクローズ
		closeExistingAudio();
		g_audioForMS = new Audio();
		g_audioForMS.src = url;
		g_audioForMS.autoplay = false;
		g_audioForMS.volume = g_stateObj.bgmVolume / 100;
		const loadedMeta = g_handler.addListener(g_audioForMS, `loadedmetadata`, () => {
			g_handler.removeListener(loadedMeta);
			if (!isTitle()) {
				return;
			}
			g_audioForMS.currentTime = musicStart;
			g_audioForMS.play();
		}, { once: true });

		if (musicEnd > 0) {
			g_stateObj.bgmTimeupdateEvtId = g_handler.addListener(g_audioForMS, "timeupdate", () => {
				if (g_audioForMS.currentTime >= musicEnd) {
					fadeOutAndSeek();
				}
			});
		}
	}
};

/**
 * 選曲ボタンを押したときの処理
 * @param {number} _num 
 * @param {boolean} _initFlg 
 */
const changeMSelect = (_num, _initFlg = false) => {
	if (document.getElementById(`lblComment`) !== null && lblComment.style.display === C_DIS_INHERIT) {
		return;
	}
	const limitedMLength = 35;
	pauseBGM();

	// 選択方向に合わせて楽曲リスト情報を再取得
	for (let j = -g_settings.mSelectableTerms; j <= g_settings.mSelectableTerms; j++) {
		const idx = g_headerObj.musicIdxList[(j + _num + g_settings.musicIdxNum + g_headerObj.musicIdxList.length * 10) % g_headerObj.musicIdxList.length];
		if (j === 0) {
		} else {
			document.getElementById(`btnMusicSelect${j}`).style.fontSize =
				getFontSize2(g_headerObj.musicTitles[idx].slice(0, limitedMLength), g_btnWidth(1 / 2));
			document.getElementById(`btnMusicSelect${j}`).innerHTML =
				`${g_headerObj.musicTitles[idx].slice(0, limitedMLength)}${g_headerObj.musicTitles[idx].length > limitedMLength ? '...' : ''}<br>` +
				`<span style="font-size:0.7em;line-height:9px"> / ${g_headerObj.artistNames[idx]}</span>`;
		}
	}
	// 現在選択中の楽曲IDを再設定
	g_settings.musicIdxNum = (g_settings.musicIdxNum + _num + g_headerObj.musicIdxList.length) % g_headerObj.musicIdxList.length;

	// 楽曲の多重読込防止（この値が変化していれば読み込まない）
	g_settings.musicLoopNum++;
	const currentLoopNum = g_settings.musicLoopNum;

	// 選択した楽曲に対応する譜面番号、製作者情報、曲長を取得
	g_headerObj.viewLists = [];
	const keyList = [], creatorList = [], playingFrameList = [], bpmList = [], difNameList = [], diffiList = [], notesList = [];
	const targetIdx = g_headerObj.musicIdxList[(g_settings.musicIdxNum + g_headerObj.musicIdxList.length * 20) % g_headerObj.musicIdxList.length];
	g_headerObj.musicNos.forEach((val, j) => {
		if ((g_headerObj.musicGroups?.[val] ?? val) === targetIdx) {
			g_headerObj.viewLists.push(j);
			keyList.push(g_headerObj.keyLabels[j]);
			creatorList.push(g_headerObj.creatorNames[j]);
			playingFrameList.push(g_detailObj.playingFrameWithBlank[j]);
			bpmList.push(g_headerObj.bpms[g_headerObj.musicNos[j]]);
			difNameList.push(`${g_headerObj.keyLabels[j]} / ${g_headerObj.difLabels[j]}`);
			diffiList.push(g_headerObj.difficulties[j]);
			notesList.push(`Arrows: ${sumData(g_detailObj.arrowCnt[j])}+${sumData(g_detailObj.frzCnt[j])}`);
		}
	});
	const playingFrames = makeDedupliArray(playingFrameList.map(val => transFrameToTimer(val))).join(`, `);
	const bpm = makeDedupliArray(bpmList).join(`, `);
	const [creatorName, creatorUrl, creatorIdx] = getCreatorInfo(creatorList);
	const creatorLink = creatorIdx >= 0 ?
		`<a href="${creatorUrl}" target="_blank">${creatorName}</a>` : creatorName;

	// 選択した楽曲の情報表示
	const idx = g_headerObj.musicIdxList[g_settings.musicIdxNum];
	document.getElementById(`lblMusicSelect`).innerHTML =
		`<span style="font-size:${getFontSize2(g_headerObj.musicTitlesForView[idx].join(`<br>`), g_btnWidth(1 / 2), { maxSiz: 18 })}px;` +
		`font-weight:bold">${g_headerObj.musicTitlesForView[idx].join(`<br>`)}</span>`;
	document.getElementById(`lblMusicSelectDetail`).innerHTML =
		`Maker: ${creatorLink} / Artist: <a href="${g_headerObj.artistUrls[idx]}" target="_blank">` +
		`${g_headerObj.artistNames[idx]}</a><br>Duration: ${playingFrames} / BPM: ${bpm}`;

	// 選択した楽曲で使われているキー種の一覧を作成
	deleteChildspriteAll(`keyTitleSprite`);
	makeDedupliArray(keyList).sort((a, b) => parseInt(a) - parseInt(b))
		.forEach((val, j) => keyTitleSprite.appendChild(
			createDivCss2Label(`btnKeyTitle${val}`, val, { ...g_lblPosObj.btnKeyTitle, x: 10 + j * 40 })));

	// 選択した楽曲の選択位置を表示
	lblMusicCnt.innerHTML = `${g_settings.musicIdxNum + 1} / ${g_headerObj.musicIdxList.length}`;

	// 楽曲別のローカルストレージを再取得
	loadLocalStorage(g_settings.musicIdxNum);
	viewKeyStorage.cache = new Map();

	// 初期化もしくは楽曲変更時に速度を初期化
	if (_initFlg || Math.abs(_num) % g_headerObj.musicIdxList.length !== 0) {
		g_stateObj.speed = g_headerObj.initSpeeds[g_headerObj.viewLists[0]];
		g_settings.speedNum = getCurrentNo(g_settings.speeds, g_stateObj.speed);
	}

	// 譜面情報、コメント文の加工
	lblDifNameInfoM.innerHTML = ``;
	lblDiffiInfoM.innerHTML = ``;
	lblNotesInfoM.innerHTML = ``;
	let notesInfo = ``;
	for (let j = 0; j < difNameList.length; j++) {
		let noteInfo = `${difNameList[j]}`;
		if (makeDedupliArray(creatorList).length > 1) {
			noteInfo += ` (${creatorList[j]})`;
		}
		lblDifNameInfoM.innerHTML += g_headerObj.difCustomLink[g_headerObj.viewLists[j]] !== undefined
			? `<a href="${g_headerObj.difCustomLink[g_headerObj.viewLists[j]]}" target="_blank" rel="noopener noreferrer">${noteInfo}</a>`
			: noteInfo;
		lblDifNameInfoM.innerHTML += `<br>`;
		notesInfo += `${noteInfo}<br>`;

		const difColorPart = g_headerObj.difColorList.find(val => diffiList[j] < val.threshold);
		lblDiffiInfoM.innerHTML += `${diffiList[j] > 0
			? `<span style="color:${difColorPart?.color || ''}">${diffiList[j]}</span>`
			: `-`}<br>`;
		lblNotesInfoM.innerHTML += `/ ${notesList[j]}<br>`;
	}
	lblDifNameInfoM.style.fontSize = wUnit(getFontSize2(notesInfo,
		g_lblPosObj.lblDifNameInfoM.w, { maxSiz: g_lblPosObj.lblDifNameInfoM.siz }));
	lblDiffiInfoM.style.fontSize = lblDifNameInfoM.style.fontSize;
	lblNotesInfoM.style.fontSize = lblDifNameInfoM.style.fontSize;
	lblCommentInfoM.style.top = wUnit(getStrHeight(lblDifNameInfoM.innerHTML, parseFloat(lblDifNameInfoM.style.fontSize)));
	lblCommentInfoM.innerHTML = convertStrToVal(g_headerObj[`commentVal${g_settings.musicIdxNum}`]);
	lblCommentM.scrollTop = 0;

	// BGM再生処理
	if (!g_stateObj.bgmMuteFlg) {
		if (_initFlg) {
			playBGM(_num);
		} else {
			g_timerHandler.setTimeout(() => {
				if (currentLoopNum === g_settings.musicLoopNum) {
					playBGM(_num, currentLoopNum);
				}
			}, 500);
		}
	}

	// 選曲変更時のカスタム関数実行
	safeExecuteCustomHooks(`g_customJsObj.musicSelect`, g_customJsObj.musicSelect, g_settings.musicIdxNum);
};

/**
 * 警告用ウィンドウ（汎用）を表示
 * @param {string} _text 
 * @param {boolean} [object.resetFlg=false] 警告リストをクリアして再作成
 * @param {boolean} [object.backBtnUse=false] Backボタンを付与
 */
const makeWarningWindow = (_text = ``, { resetFlg = false, backBtnUse = false } = {}) => {
	const displayName = (g_currentPage === `initial` ? `title` : g_currentPage);
	if (_text !== ``) {
		if (resetFlg) {
			g_errMsgObj[displayName] = [_text];
		} else if (g_errMsgObj[displayName].findIndex(val => val === _text) === -1) {
			g_errMsgObj[displayName].push(_text);
		}
	}
	if (g_errMsgObj[displayName].length > 0) {
		divRoot.appendChild(setWindowStyle(`<p>${g_errMsgObj[displayName].join('</p><p>')}</p>`, `#ffcccc`, `#660000`));
		setUserSelect(lblWarning.style, `text`);
	}
	if (backBtnUse) {
		// タイトルバック用ボタン
		divRoot.appendChild(createCss2Button(`btnBack`, g_lblNameObj.b_back, () => true, {
			resetFunc: () => titleInit(),
		}, g_cssObj.button_Back));
	}
};

/**
 * お知らせウィンドウ（汎用）を表示
 * @param {string} _text 
 * @param {string} _animationName
 * @param {string} [object._backColor='#ccccff']
 * @param {string} [object._textColor='#000066']
 * @param {string} [object._pointerEvents=C_DIS_NONE]
 */
const makeInfoWindow = (_text, _animationName = ``, { _backColor = `#ccccff`, _textColor = `#000066`, _pointerEvents = C_DIS_NONE } = {}) => {
	const lblWarning = setWindowStyle(`<p>${_text}</p>`, _backColor, _textColor, C_ALIGN_CENTER);
	lblWarning.style.pointerEvents = _pointerEvents;

	if (_animationName !== ``) {
		lblWarning.style.animationName = _animationName;
		lblWarning.style.animationDuration = `2.5s`;
		lblWarning.style.animationFillMode = `forwards`;
		lblWarning.style.animationTimingFunction = `cubic-bezier(1.000, 0.000, 0.000, 1.000)`;
	}
	divRoot.appendChild(lblWarning);
};

/**
 * 警告ウィンドウのスタイル設定
 * @param {string} _text 
 * @param {string} _bkColor 
 * @param {string} _textColor 
 * @param {string} _align
 * @param {number} [object._x=g_btnX()]
 * @param {number} [object._y=0]
 * @param {number} [object._w=g_btnWidth()]
 * @returns {HTMLDivElement}
 */
const setWindowStyle = (_text, _bkColor, _textColor, _align = C_ALIGN_LEFT, { _x = g_btnX(), _y = 0, _w = g_btnWidth() } = {}) => {

	deleteDiv(divRoot, `lblWarning`);

	// ウィンドウ枠の行を取得するために一時的な枠を作成
	const tmplbl = createDivCss2Label(`lblTmpWarning`, _text, {
		x: _x, y: 70, w: _w, h: 20, siz: g_limitObj.mainSiz, lineHeight: wUnit(15), fontFamily: getBasicFont(),
		whiteSpace: `normal`,
	});
	divRoot.appendChild(tmplbl);
	const range = new Range();
	range.selectNode(tmplbl);

	// ウィンドウ枠の行を元に縦の長さを決定(150pxを超えた場合は縦スクロールバーを付与)
	const warnHeight = Math.min(150, Math.max(range.getClientRects().length,
		_text.split(`<br>`).length + _text.split(`<p>`).length - 1) * 21);
	const lbl = createDivCss2Label(`lblWarning`, _text, {
		x: _x, y: 70 + _y, w: _w, h: warnHeight, siz: g_limitObj.mainSiz, backgroundColor: _bkColor,
		opacity: 0.9, lineHeight: wUnit(15), color: _textColor, align: _align, fontFamily: getBasicFont(),
		whiteSpace: `normal`, pointerEvents: C_DIS_AUTO,
	});
	if (warnHeight === 150) {
		lbl.style.overflow = C_DIS_AUTO;
	}

	// 一時的な枠を削除
	divRoot.removeChild(tmplbl);

	return lbl;
};

/*-----------------------------------------------------------*/
/* Scene : DATA MANAGEMENT [pear] */
/*-----------------------------------------------------------*/

const dataMgtInit = () => {
	clearWindow();
	pauseBGM();
	const prevPage = g_currentPage;
	g_currentPage = `dataMgt`;
	let selectedKey = g_keyObj.currentKey;

	multiAppend(divRoot,

		// 画面タイトル
		getTitleDivLabel(`lblTitle`,
			`<div class="settings_Title">DATA</div><div class="settings_Title2">MANAGEMENT</div>`
				.replace(/[\t\n]/g, ``), 0, 15, g_cssObj.flex_centering),

		createDescDiv(`dataDelMsg`, g_lblNameObj[`dataDelete${g_langStorage.safeMode}Desc`]),
	);

	// 各ボタン用のスプライトを作成
	const optionsprite = createEmptySprite(divRoot, `optionsprite`, g_windowObj.dataSprite);

	let reloadFlg = false;
	const list = [C_FLG_OFF, C_FLG_ON];
	const cssBarList = [C_FLG_OFF, C_FLG_ON];
	const cssBgList = [g_settings.d_cssBgName, g_settings.d_cssBgName];

	/**
	 * データ管理用ラベルの作成
	 * @param {string} _name 
	 * @param {number} _heightPos 
	 * @param {number} [x=0] 
	 * @returns {HTMLDivElement}
	 */
	const createMgtLabel = (_name, _heightPos, { x = 0 } = {}) =>
		createDivCss2Label(`lbl${toCapitalize(_name)}`, getStgDetailName(toCapitalize(_name)), {
			x, y: g_limitObj.setLblHeight * _heightPos + 40,
			siz: g_limitObj.setLblSiz, align: C_ALIGN_LEFT,
		});

	/**
	 * データ管理用ボタンの作成
	 * @param {string} _name 
	 * @param {number} _heightPos 
	 * @param {number} _widthPos 
	 * @param {number} [w=125]
	 * @param {Function} func 
	 * @returns {HTMLDivElement}
	 */
	const createMgtButton = (_name, _heightPos, _widthPos, { w = 125, func = () => true, ...rest } = {}) => {
		const linkId = `btn${toCapitalize(_name)}`;
		return createCss2Button(linkId, getStgDetailName(toCapitalize(_name)), () => {
			const prevDisp = g_settings.dataMgtNum[_name];
			const [prevBarColor, prevBgColor] = [cssBarList[prevDisp], cssBgList[prevDisp]];

			g_settings.dataMgtNum[_name] = (g_settings.dataMgtNum[_name] + 1) % 2;
			g_stateObj[`dm_${_name}`] = list[g_settings.dataMgtNum[_name]];

			const nextDisp = g_settings.dataMgtNum[_name];
			const [nextBarColor, nextBgColor] = [cssBarList[nextDisp], cssBgList[nextDisp]];
			document.getElementById(linkId).classList.replace(g_cssObj[`button_${prevBarColor}`], g_cssObj[`button_${nextBarColor}`]);
			document.getElementById(linkId).classList.replace(g_cssObj[`button_${prevBgColor}`], g_cssObj[`button_${nextBgColor}`]);
			func();
		}, {
			x: _widthPos * (w + 5) + 20, y: g_limitObj.setLblHeight * _heightPos + 40,
			w, h: 20, siz: g_limitObj.setLblSiz, borderStyle: `solid`, title: g_msgObj[_name], ...rest
		}, g_cssObj[`button_${cssBgList[g_settings.dataMgtNum[_name]]}`], g_cssObj[`button_${cssBarList[g_settings.dataMgtNum[_name]]}`]);
	};

	multiAppend(optionsprite,
		createMgtLabel(`workData`, 0),
		createMgtButton(`environment`, 1.5, 0),
		createMgtButton(`highscores`, 2.5, 0),
		createMgtButton(`customKey`, 3.5, 0),
		createMgtButton(`others`, 4.5, 0),
		createMgtLabel(`keyData`, 6),
		createDivCss2Label(`lblTargetKey`, `(${getKeyName(selectedKey)})`, {
			x: 90, y: g_limitObj.setLblHeight * 6 + 40,
			siz: g_limitObj.setLblSiz, align: C_ALIGN_LEFT,
		})
	);

	g_localStorageMgt = sortObjectByKeys(parseStorageData(g_localStorageUrl));

	multiAppend(divRoot,

		// 保存データの表示
		createDivCss2Label(`lblWorkDataView`,
			viewKeyStorage(`workStorage`), g_lblPosObj.lblWorkDataView),
		createDivCss2Label(`lblKeyDataView`, viewKeyStorage(`keyStorage`, selectedKey), g_lblPosObj.lblKeyDataView),

		// 保存データの出力ボタン
		createCss2Button(`btnWorkStorage`, g_lblNameObj.b_copyStorage, () =>
			copyTextToClipboard(formatObject(g_storageFunc.get(`workStorage`)(), 0, { colorFmt: false }), g_msgInfoObj.I_0006),
			g_lblPosObj.btnWorkStorage, g_cssObj.button_Default, g_cssObj.button_ON),
		createCss2Button(`btnKeyStorage`, g_lblNameObj.b_copyStorage, () =>
			copyTextToClipboard(formatObject(g_storageFunc.get(`keyStorage`)(selectedKey), 0, { colorFmt: false }), g_msgInfoObj.I_0006),
			g_lblPosObj.btnKeyStorage, g_cssObj.button_Default, g_cssObj.button_ON),
	);
	setUserSelect($id(`lblWorkDataView`), `text`);
	setUserSelect($id(`lblKeyDataView`), `text`);

	const keyList = makeDedupliArray(g_headerObj.keyLabels).sort((a, b) => parseInt(a) - parseInt(b));
	const keyListSprite = createEmptySprite(optionsprite, `keyListSprite`, g_windowObj.keyListSprite);
	keyList.forEach((key, j) => {
		g_stateObj[`dm_${key}`] = C_FLG_OFF;
		g_settings.dataMgtNum[key] = 0;

		const keyWidth = Math.min(Math.max(50, getStrWidth(getKeyName(key), g_limitObj.setLblSiz, getBasicFont())), 80);
		keyListSprite.appendChild(createMgtButton(key, j - 2, 0, {
			w: keyWidth,
			siz: getFontSize2(getKeyName(key), keyWidth, { maxSiz: g_limitObj.setLblSiz, minSiz: 10 }),
		}));
		document.getElementById(`btn${toCapitalize(key)}`).innerHTML = getKeyName(key);

		keyListSprite.appendChild(createCss2Button(`btnView${key}`, ``, evt => {
			keyList.forEach(keyx => {
				document.getElementById(`btnView${keyx}`).classList.replace(g_cssObj.button_Next, g_cssObj.button_Default);
				document.getElementById(`btnView${keyx}`).classList.replace(g_cssObj.button_ON, g_cssObj.button_OFF);
				document.getElementById(`btnView${keyx}`).textContent = ``;
			});
			document.getElementById(`btnView${key}`).classList.replace(g_cssObj.button_Default, g_cssObj.button_Next);
			document.getElementById(`btnView${key}`).classList.replace(g_cssObj.button_OFF, g_cssObj.button_ON);
			selectedKey = key;
			evt.target.textContent = `x`;
			lblKeyDataView.innerHTML = viewKeyStorage(`keyStorage`, key);
			lblKeyDataView.scrollTop = 0;
			lblTargetKey.innerHTML = `(${getKeyName(key)})`;
		}, {
			x: 0, y: g_limitObj.setLblHeight * (j - 2) + 40, w: 16, h: 20, siz: 12, borderStyle: `solid`
		}, g_cssObj.button_Default, g_cssObj.button_OFF));
	});
	document.getElementById(`btnView${selectedKey}`).click();

	// ユーザカスタムイベント(初期)
	safeExecuteCustomHooks(`g_customJsObj.dataMgt`, g_customJsObj.dataMgt);

	multiAppend(divRoot,
		createCss2Button(`btnBack`, g_lblNameObj.b_back, () => true, {
			...g_lblPosObj.btnResetBack,
			resetFunc: () => [`title`, `precondition`].includes(prevPage) ? titleInit() : g_moveSettingWindow(false),
		}, g_cssObj.button_Back),

		createCss2Button(`btnPrecond`, g_lblNameObj.b_precond, () => true, {
			...g_lblPosObj.btnPrecond,
			resetFunc: () => preconditionInit(),
		}, g_cssObj.button_Setting),

		createCss2Button(`btnSafeMode`, g_lblNameObj.b_safeMode +
			(g_langStorage.safeMode === C_FLG_ON ? C_FLG_OFF : C_FLG_ON), () => {
				if (window.confirm(g_msgObj[`safeMode${g_langStorage.safeMode}Confirm`])) {
					g_langStorage.safeMode = g_langStorage.safeMode === C_FLG_ON ? C_FLG_OFF : C_FLG_ON;
					localStorage.setItem(`danoni-locale`, JSON.stringify(g_langStorage));
					location.reload();
				}
			}, g_lblPosObj.btnSafeMode, g_cssObj.button_Setting),

		createCss2Button(`btnReset`, g_lblNameObj.b_cReset, () => {
			reloadFlg = false;
			const backupData = new Map();

			const selectedData = Object.keys(g_stateObj)
				.filter(key => key.startsWith('dm_') && g_stateObj[key] === C_FLG_ON)
				.map(key => key.slice(`dm_`.length));

			if (selectedData.length === 0) {
				window.alert(g_msgObj.noDataSelected);
				return;
			}

			if (window.confirm(g_msgObj.dataResetConfirm +
				`\n\n${selectedData.map(val => `- ${g_msgObj[val] || g_msgObj.keyTypes.split('{0}').join(val)}`).join(`\n`)}`)) {
				selectedData.forEach(key => {
					if (g_resetFunc.has(key)) {
						backupData.set(key, JSON.parse(JSON.stringify(g_localStorageMgt)));
						g_resetFunc.get(key)();
						localStorage.setItem(g_localStorageUrl, JSON.stringify(g_localStorageMgt));

					} else if (keyList.includes(key)) {
						const storage = parseStorageData(`danonicw-${key}k`);

						if (Object.keys(storage).length > 0) {
							backupData.set(key, JSON.parse(JSON.stringify(storage)));
							g_settings.keyStorages.forEach(val => delete storage[val]);
							localStorage.setItem(`danonicw-${key}k`, JSON.stringify(storage));
						} else {
							backupData.set(`XX` + key, JSON.parse(JSON.stringify(g_localStorageMgt)));
							g_settings.keyStorages.forEach(val => delete g_localStorageMgt[`${val}${key}`]);
							localStorage.setItem(g_localStorageUrl, JSON.stringify(g_localStorageMgt));
						}
					}
				});
				reloadFlg = true;
				sessionStorage.setItem(`resetBackup${g_settings.musicIdxNum}`, JSON.stringify(Array.from(backupData.entries())));
			}
		}, {
			...g_lblPosObj.btnResetN,
			visibility: g_langStorage.safeMode === C_FLG_OFF ? C_DIS_INHERIT : `hidden`,
			resetFunc: () => {
				if (reloadFlg) {
					location.reload();
				}
			},
		}, g_cssObj.button_Reset),

		// リカバリー用のボタン
		createCss2Button(`btnUndo`, g_lblNameObj.b_undo, () => {
			const backup = JSON.parse(sessionStorage.getItem(`resetBackup${g_settings.musicIdxNum}`));
			if (backup && window.confirm(g_msgObj.dataRestoreConfirm)) {
				backup.forEach(([key, data]) => {
					if (g_resetFunc.has(key) || keyList.includes(key.slice(`XX`.length))) {
						Object.assign(g_localStorageMgt, data);
						localStorage.setItem(g_localStorageUrl, JSON.stringify(g_localStorageMgt));
					} else if (keyList.includes(key)) {
						localStorage.setItem(`danonicw-${key}k`, JSON.stringify(data));
					}
				});
				sessionStorage.removeItem(`resetBackup${g_settings.musicIdxNum}`);
				location.reload();
			}
		}, g_lblPosObj.btnUndo, g_cssObj.button_Tweet)
	);
	if (sessionStorage.getItem(`resetBackup${g_settings.musicIdxNum}`) === null) {
		btnUndo.style.display = C_DIS_NONE;
	}

	// キー操作イベント（デフォルト）
	setShortcutEvent(g_currentPage, () => true, { dfEvtFlg: true });

	document.oncontextmenu = () => true;
	divRoot.oncontextmenu = () => false;

	safeExecuteCustomHooks(`g_skinJsObj.dataMgt`, g_skinJsObj.dataMgt);
};


/*-----------------------------------------------------------*/
/* Scene : PRECONDITION [mango] */
/*-----------------------------------------------------------*/

const preconditionInit = () => {
	clearWindow();
	pauseBGM();
	const prevPage = g_currentPage;
	g_currentPage = `precondition`;

	multiAppend(divRoot,

		// 画面タイトル
		getTitleDivLabel(`lblTitle`,
			`<div class="settings_Title">PRECONDITION</div>`
				.replace(/[\t\n]/g, ``), 0, 15, g_cssObj.flex_centering),

		createDivCss2Label(`lblPrecondView`, viewKeyStorage(`g_rootObj`), g_lblPosObj.lblPrecondView),
		createCss2Button(`btnPrecondView`, g_lblNameObj.b_copyStorage, () =>
			copyTextToClipboard((() => {
				const key = g_settings.preconditions[g_settings.preconditionNum * numOfPrecs + g_settings.preconditionNumSub];
				if (key === `g_editorTmp2`) {
					return g_editorTmp2.replaceAll(`<br>`, `\r\n`).replaceAll(`&nbsp;`, ` `);
				} else {
					return viewKeyStorage(key, ``, false);
				}
			})(), g_msgInfoObj.I_0007),
			g_lblPosObj.btnPrecondView, g_cssObj.button_Default, g_cssObj.button_ON),
	);
	setUserSelect($id(`lblPrecondView`), `text`);

	// 1ページあたりに表示するオブジェクト数
	const numOfPrecs = Math.round((g_btnWidth(1) / 500) / 2 * 10) * 2;

	// ボタン名切り替え
	const switchPreconditions = () => {
		g_settings.preconditionNum = nextPos(g_settings.preconditionNum, 1, Math.round(g_settings.preconditions.length / numOfPrecs) + 1);
		for (let j = 0; j < Math.min(g_settings.preconditions.length, numOfPrecs); j++) {
			if (g_settings.preconditionNum * numOfPrecs + j < g_settings.preconditions.length) {
				document.getElementById(`btnPrecond${j}`).innerHTML =
					g_settings.preconditions[g_settings.preconditionNum * numOfPrecs + j];
				document.getElementById(`btnPrecond${j}`).style.visibility = `visible`;
			} else {
				document.getElementById(`btnPrecond${j}`).style.visibility = `hidden`;
			}
		}
		btnPrecond0.click();
	};

	// オブジェクト表示ボタンの作成
	for (let j = 0; j < Math.min(g_settings.preconditions.length, numOfPrecs); j++) {
		divRoot.appendChild(createCss2Button(`btnPrecond${j}`, g_settings.preconditions[j], evt => {
			for (let k = 0; k < Math.min(g_settings.preconditions.length, numOfPrecs); k++) {
				document.getElementById(`btnPrecond${k}`).classList.replace(g_cssObj.button_Reset, g_cssObj.button_Default);
			}
			lblPrecondView.innerHTML = viewKeyStorage(g_settings.preconditions[g_settings.preconditionNum * numOfPrecs + j]);
			lblPrecondView.scrollTop = 0;
			g_settings.preconditionNumSub = j;
			evt.target.classList.replace(g_cssObj.button_Default, g_cssObj.button_Reset);
		}, {
			x: g_btnX() + g_btnWidth((j % (numOfPrecs / 2)) / (numOfPrecs / 2 + 1)),
			y: 70 + Number(j >= numOfPrecs / 2) * 20, w: g_btnWidth(1 / (numOfPrecs / 2 + 1)), h: 20, siz: 12,
		}, g_cssObj.button_Default));
	}
	btnPrecond0.classList.replace(g_cssObj.button_Default, g_cssObj.button_Reset);

	// 次のオブジェクト表示群の表示
	divRoot.appendChild(createCss2Button(`btnPrecondNext`, `>`, () => switchPreconditions(), {
		x: g_btnX() + g_btnWidth(numOfPrecs / 2 / (numOfPrecs / 2 + 1)),
		y: 70, w: g_btnWidth(1 / Math.max((numOfPrecs / 2 + 1), 12)), h: 40, siz: 12,
		visibility: (g_settings.preconditions.length > numOfPrecs ? `visible` : `hidden`),
	}, g_cssObj.button_Setting));

	// ユーザカスタムイベント(初期)
	safeExecuteCustomHooks(`g_customJsObj.precondition`, g_customJsObj.precondition);

	multiAppend(divRoot,

		// データ管理画面へ移動
		createCss2Button(`btnReset`, g_lblNameObj.dataReset, () => {
			dataMgtInit();
		}, g_lblPosObj.btnReset, g_cssObj.button_Reset),

		createCss2Button(`btnBack`, g_lblNameObj.b_back, () => true, {
			...g_lblPosObj.btnPrecond,
			resetFunc: () => {
				viewKeyStorage.cache = new Map();
				prevPage === `dataMgt` ? dataMgtInit() : g_moveSettingWindow(false);
			},
		}, g_cssObj.button_Back),
	);
	// キー操作イベント（デフォルト）
	setShortcutEvent(g_currentPage, () => true, { dfEvtFlg: true });

	document.oncontextmenu = () => true;
	divRoot.oncontextmenu = () => true;

	safeExecuteCustomHooks(`g_skinJsObj.precondition`, g_skinJsObj.precondition);
};
