/**
 * Dancing☆Onigiri (CW Edition)
 * 譜面データを分割してグローバル変数に格納する処理群
 * - ページ: initial
 *
 * Source by tickle
 * Created : 
 * Revised : 
 *
 * https://github.com/cwtickle/danoniplus
 */

/*-----------------------------------------------------------*/
/* Scene : INITIALIZE [peach] */
/*-----------------------------------------------------------*/

const initialControl = async () => {

	const stage = document.getElementById(`canvas-frame`);
	const divRoot = createEmptySprite(stage, `divRoot`, g_windowObj.divRoot);
	g_workPath = validatePath(document.getElementById(`jsRootUrl`)?.value,
		new URL(location.href).href.match(/(^.*\/)/)[0]);

	// 背景の表示
	if (document.getElementById(`layer0`) !== null) {
		const layer0 = document.getElementById(`layer0`);
		makeBgCanvas(layer0.getContext(`2d`));
	} else {
		createEmptySprite(divRoot, `divBack`, g_windowObj.divBack);
	}

	// Now Loadingを表示
	divRoot.appendChild(getLoadingLabel());

	// 譜面初期情報ロード許可フラグ
	g_canLoadDifInfoFlg = true;

	// 譜面データの読み込みオプション
	g_enableAmpersandSplit = setBoolVal(document.getElementById(`enableAmpersandSplit`)?.value, true);
	g_enableDecodeURI = setBoolVal(document.getElementById(`enableDecodeURI`)?.value);

	// 作品別ローカルストレージの読み込み
	loadLocalStorage();

	// 譜面データの読み込み(1ファイル目)
	await loadChartFile(0);

	// 共通設定ファイルの指定
	let tmpSettingType = g_rootObj.settingType ?? ``;
	if (g_remoteFlg && !tmpSettingType.includes(C_MRK_CURRENT_DIRECTORY)) {
		tmpSettingType = `${C_MRK_CURRENT_DIRECTORY}../js/${tmpSettingType}`;
	};
	let [settingType, settingRoot] = getFilePath(tmpSettingType);
	if (settingType !== ``) {
		settingType = `_${settingType}`;
	}

	// 共通設定ファイルの読込
	await loadScript2(`${settingRoot}danoni_setting${settingType}.js?${g_randTime}`, false);
	loadLegacySettingFunc();
	deleteDiv(divRoot, `lblLoading`);

	// クエリで譜面番号が指定されていればセット
	g_stateObj.scoreId = setIntVal(getQueryParamVal(`scoreId`));

	// 譜面ヘッダーの読込
	Object.assign(g_headerObj, preheaderConvert(g_rootObj));

	// CSSファイル内のbackgroundを取得するために再描画
	if (document.getElementById(`layer0`) === null) {
		deleteDiv(divRoot, `divBack`);
		createEmptySprite(divRoot, `divBack`);
	} else if (!g_headerObj.defaultSkinFlg && !g_headerObj.customBackUse) {
		createEmptySprite(divRoot, `divBack`);
	}

	// CSSファイルの読み込み
	const skinList = g_headerObj.jsData.filter(file => file[0].indexOf(`danoni_skin`) !== -1);
	await loadMultipleFiles2(skinList, `css`);

	// JSファイルの読み込み
	await loadMultipleFiles2(g_headerObj.jsData, `js`);
	loadLegacyCustomFunc();

	// 譜面ヘッダー、特殊キー情報の読込
	Object.assign(g_headerObj, headerConvert(g_rootObj));
	g_headerObj.undefinedKeyListFinal = [];
	const importKeysData = _data => {
		keysConvert(dosConvert(_data));
		g_headerObj.undefinedKeyLists = g_headerObj.undefinedKeyLists.filter(key => g_keyObj[`${g_keyObj.defaultProp}${key}_0`] === undefined);
	};
	g_presetObj.keysDataLib.forEach(list => importKeysData(list));
	if (g_presetObj.keysData !== undefined) {
		g_presetObj.keysDataLocal.unshift(g_presetObj.keysData);
	}
	g_presetObj.keysDataLocal.forEach(list => importKeysData(list));
	g_headerObj.keyExtraList = keysConvert(g_rootObj, {
		keyExtraList: makeDedupliArray(g_headerObj.undefinedKeyLists, g_rootObj.keyExtraList?.split(`,`)),
	});

	// キー定義でエラーになる場合は強制的にデフォルトキーへ変更して続行
	let hasUndefinedKey = false;
	for (let j = 0; j < g_headerObj.keyLabels.length; j++) {
		if (g_headerObj.undefinedKeyListFinal.includes(g_headerObj.keyLabels[j])) {
			g_headerObj.keyLists = g_headerObj.keyLists.filter(key => key !== g_headerObj.keyLabels[j]);
			g_headerObj.keyLabels[j] = g_keyObj.initKeyLabel;
			hasUndefinedKey = true;
		}
	}
	if (hasUndefinedKey) {
		g_headerObj.keyLists = makeDedupliArray(g_headerObj.keyLists, [g_keyObj.initKeyLabel])
			.sort((a, b) => parseInt(a) - parseInt(b));
	}

	// ラベルテキスト、オンマウステキスト、確認メッセージ定義の上書き設定
	Object.assign(g_lblNameObj, g_lang_lblNameObj[g_localeObj.val], g_presetObj.lblName?.[g_localeObj.val]);
	Object.assign(g_msgObj, g_lang_msgObj[g_localeObj.val], g_presetObj.msg?.[g_localeObj.val]);

	// デフォルトのカラー・シャッフルグループ設定を退避
	g_keycons.groups.forEach(type =>
		Object.keys(g_keyObj).filter(val => val.startsWith(type))
			.forEach(property => g_keyObj[`${property}d`] = structuredClone(g_keyObj[property])));

	// 自動横幅拡張設定
	if (g_headerObj.autoSpread) {
		g_sWidth = Math.max(g_sWidth, g_presetObj.autoMinWidth ?? g_keyObj.minWidth);
		g_headerObj.keyLists.forEach(key => {
			g_sWidth = Math.max(g_sWidth, g_keyObj[`minWidth${key}`] ?? g_keyObj.minWidthDefault);

			// 別キーモード有効時は、別キーモード毎の横幅を拡張対象へ追加
			if (g_headerObj.transKeyUse) {
				for (let k = 1; hasVal(g_keyObj[`keyCtrl${key}_${k}`]); k++) {
					const anotherKey = g_keyObj[`transKey${key}_${k}`] ?? ``;
					if (anotherKey !== ``) {
						g_sWidth = Math.max(g_sWidth, g_keyObj[`minWidth${anotherKey}`] ?? g_keyObj.minWidthDefault);
					}
				}
			}
		});

		$id(`canvas-frame`).width = wUnit(g_sWidth);
		$id(`divRoot`).width = wUnit(g_sWidth);
	}
	if (g_headerObj.playingWidth === `default`) {
		g_headerObj.playingWidth = g_sWidth;
	}

	// 可変ウィンドウサイズを更新
	updateWindowSiz();

	// キー数情報を初期化
	g_keyObj.currentKey = g_headerObj.keyLabels[g_stateObj.scoreId];
	g_keyObj.currentPtn = 0;

	// 画像ファイルの読み込み
	g_imgInitList.forEach(img => preloadFile(`image`, g_imgObj[img]));

	// その他の画像ファイルの読み込み
	g_headerObj.preloadImages.filter(image => hasVal(image)).forEach(preloadImage => {

		// Pattern A: |preloadImages=file.png|
		// Pattern B: |preloadImages=file*.png@10|  -> file01.png ~ file10.png
		// Pattern C: |preloadImages=file*.png@2-9| -> file2.png  ~ file9.png
		// Pattern D: |preloadImages=file*.png@003-018| -> file003.png  ~ file018.png

		const tmpPreloadImages = preloadImage.split(`@`);
		if (tmpPreloadImages.length === 1) {
			// Pattern Aの場合
			preloadFile(`image`, preloadImage);
		} else {
			const termRoopCnts = tmpPreloadImages[1].split(`-`);
			let startCnt = 1;
			let lastCnt;
			let paddingLen;

			if (termRoopCnts.length === 1) {
				// Pattern Bの場合
				lastCnt = setIntVal(tmpPreloadImages[1], 1);
				paddingLen = String(setVal(tmpPreloadImages[1], 1)).length;
			} else {
				// Pattern C, Dの場合
				startCnt = setIntVal(termRoopCnts[0], 1);
				lastCnt = setIntVal(termRoopCnts[1], 1);
				paddingLen = String(setVal(termRoopCnts[1], 1)).length;
			}
			for (let k = startCnt; k <= lastCnt; k++) {
				preloadFile(`image`, tmpPreloadImages[0].replaceAll(`*`, String(k).padStart(paddingLen, `0`)));
			}
		}
	});

	// ローカルファイル起動時に各種警告文を表示
	if (g_isFile) {
		makeWarningWindow(g_msgInfoObj.W_0011);
		if (!listMatching(getMusicUrl(g_stateObj.scoreId), [`.js`, `.txt`], { suffix: `$` })) {
			if (g_userAgent.indexOf(`firefox`) !== -1) {
				makeWarningWindow(g_msgInfoObj.W_0001);
			}
			makeWarningWindow(g_msgInfoObj.W_0012);
		}
	}

	if (g_loadObj.main) {

		// 譜面分割、譜面番号固定かどうかをチェック
		g_stateObj.dosDivideFlg = setBoolVal(document.getElementById(`externalDosDivide`)?.value ?? getQueryParamVal(`dosDivide`));
		g_stateObj.scoreLockFlg = setBoolVal(document.getElementById(`externalDosLock`)?.value ?? getQueryParamVal(`dosLock`));

		// 非分割時は resetGaugeSetting が全難易度を一括構築するため、初回のみで十分
		const loopCount = g_stateObj.dosDivideFlg ? g_headerObj.keyLabels.length : 1;

		for (let j = 0; j < g_headerObj.keyLabels.length; j++) {

			// 譜面ファイルが分割されている場合、譜面詳細情報取得のために譜面をロード
			if (g_stateObj.dosDivideFlg) {
				await loadChartFile(j);
				resetColorSetting(j);
			}
			getScoreDetailData(j);
			if (j < loopCount) {
				// 分割時は各譜面ごとに上書き・補完、非分割時は初回のみ実行
				resetGaugeSetting(j);
			}
		}
	}
	safeExecuteCustomHooks(`g_customJsObj.preTitle`, g_customJsObj.preTitle);
	const queryMusicId = getQueryParamVal(`musicId`);
	g_settings.musicIdxNum = queryMusicId !== null ? Number(queryMusicId) :
		g_headerObj.musicGroups?.[g_headerObj.musicNos[g_stateObj.scoreId]] ??
		g_headerObj.musicNos[g_stateObj.scoreId] ?? g_headerObj.musicNos[0];
	titleInit(true);

	// 未使用のg_keyObjプロパティを削除
	const keyProp = g_keyCopyLists.simple.concat(
		g_keyCopyLists.multiple,
		`keyCtrl`, `keyName`, `minWidth`, `movLock`, `initManual`, `ptchara`
	);
	const delKeyPropList = [`ptchara7`, `dfPtnNum`, `minKeyCtrlNum`, `minPatterns`];
	Object.keys(g_keyObj).forEach(key => {
		const type = keyProp.find(prop => key.startsWith(prop)) || ``;
		if (type !== ``) {
			const keyName = String(key.split(`_`)[0].slice(type.length));
			if (!g_headerObj.keyLists.includes(keyName) && keyName !== `` && keyName !== `Default`) {
				delete g_keyObj[key];
			}
		}
		if (key.match(/^chara7_[a-z]/) || delKeyPropList.includes(key) || g_keyObj[key] === undefined) {
			delete g_keyObj[key];
		}
	});

	g_stateObj.keyInitial = true;

	// エディター用のフォーマッター作成
	const customKeyList = g_headerObj.keyLists.filter(val =>
		g_keyObj.defaultKeyList.findIndex(key => key === val) < 0);

	if (customKeyList.length === 0) {
		g_settings.preconditions = g_settings.preconditions.filter(val => !val.includes(`g_editorTmp`));
	}

	const addNewOrderGroup = (_orgList, _sortRule) => {
		// インデックスを保持した配列を作成、ルールに従ってソート
		const indexedList = _orgList.map((value, idx) => ({ value, idx }));
		const sortedList = [...indexedList].sort(_sortRule);
		// ソート後の配列のインデックスに基づいて、元のインデックスを取得
		const newIdxs = sortedList.map(({ idx }) => indexedList.findIndex(({ idx: originalIdx }) => originalIdx === idx));
		return !newIdxs.every((val, j) => val === j) ? newIdxs : undefined;
	};

	customKeyList.forEach(key => {
		const keyBase = `${key}_0`;
		const keyCtrlPtn = `${g_keyObj.defaultProp}${keyBase}`;
		const keyGroup = g_keyObj[`keyGroup${keyBase}`];
		const keyGroupList = makeDedupliArray(keyGroup.flat());
		const orgKeyNum = g_keyObj[keyCtrlPtn].length;
		const baseX = Math.floor(Math.random() * (100 - keyGroupList.length));

		const divPos = g_keyObj[`div${keyBase}`];
		const divMaxPos = g_keyObj[`divMax${keyBase}`] ?? Math.max(...g_keyObj[`pos${keyBase}`]) + 1;
		const stdPos = Math.max(divPos, divMaxPos - divPos);
		const [deltaXAbove, deltaXBelow] = [(divPos - stdPos) / 2, (divMaxPos - divPos - stdPos) / 2];

		keyGroupList.forEach((keyGroupNo, j) => {
			const keyN = keyGroupNo === `0` ? key : `${key}_${j + 1}`;
			const filterCond = (r) => keyGroup[r].findIndex(val => val === keyGroupNo) >= 0;
			const keyCtrlList = g_keyObj[keyCtrlPtn].filter((val, r) => filterCond(r));
			const charaList = g_keyObj[`chara${keyBase}`].filter((val, r) => filterCond(r));
			const colorList = g_keyObj[`color${keyBase}_0`].filter((val, r) => filterCond(r));
			const stepRtnList = g_keyObj[`stepRtn${keyBase}_0`].filter((val, r) => filterCond(r));
			const keyNum = g_keyObj[keyCtrlPtn].filter((val, r) => filterCond(r)).length;

			// ---- Dancing☆Onigiri (CW Edition対応)のフォーマット
			g_editorTmp[keyN] = {};
			g_editorTmp[keyN].id = orgKeyNum * 100 + baseX + j;
			g_editorTmp[keyN].num = keyNum;
			g_editorTmp[keyN].chars = keyCtrlList.map(val => g_kCd[val[0]]);
			g_editorTmp[keyN].keys = keyCtrlList.map(val => g_kCdN[val[0]]).map(val => replaceStr(val, g_escapeStr.editorKey));
			g_editorTmp[keyN].alternativeKeys = keyCtrlList.map(val => val[1] === 0 ? `` : g_kCdN[val[1]]).map(val => replaceStr(val, g_escapeStr.editorKey));
			g_editorTmp[keyN].noteNames = charaList.map(val => `${val}_data`);
			g_editorTmp[keyN].freezeNames = charaList.map(val => {
				let frzName = replaceStr(val, g_escapeStr.frzName);
				if (frzName.indexOf(`frz`) === -1 && frzName.indexOf(`foni`) === -1) {
					frzName = frzName.replaceAll(frzName, `frz${toCapitalize(frzName)}`);
				}
				return `${frzName}_data`;
			});
			g_editorTmp[keyN].colorGroup = colorList.map(val => val % 3);

			// orderGroupsのカスタマイズ
			if (divMaxPos > divPos) {

				// posXの実際の相対位置を計算
				const orgPosList = g_keyObj[`pos${keyBase}`].filter((val, r) => filterCond(r));
				const posList = orgPosList.map(val => val < divPos ? val - deltaXAbove : val - divPos - deltaXBelow);

				g_editorTmp[keyN].orderGroups = [];

				// パターン1: 上下グループ分けして各グループ内で位置順にソート（上下反転）
				const upDownIdxs = addNewOrderGroup(orgPosList, (a, b) => {
					const aAbove = a.value < divPos;
					const bAbove = b.value < divPos;
					if (aAbove !== bAbove) return Number(aAbove) - Number(bAbove);
					return a.value - b.value;
				});
				if (upDownIdxs !== undefined) {
					g_editorTmp[keyN].orderGroups.push(upDownIdxs);
				}

				// パターン2: 単純にステップゾーンのX座標が小さい順にソート
				const sortedIdxs = addNewOrderGroup(posList, (a, b) => a.value - b.value);
				if (sortedIdxs !== undefined) {
					g_editorTmp[keyN].orderGroups.push(sortedIdxs);
				}
				if (g_editorTmp[keyN].orderGroups.length === 0) {
					delete g_editorTmp[keyN].orderGroups;
				}
			}

			// ---- ダンおに譜面作成エディタ ver3フォーマット

			// 既存のシャッフルグループからミラー配列を自動生成
			let k = 0, n = 0, convTxt = ``;
			let prevMirrorList = [];
			while (g_keyObj[`shuffle${keyBase}_${k}`] !== undefined) {

				const orgTmpList = []
				const mirrorTmpList = [];
				const mirrorList = [];
				g_keyObj[`shuffle${keyBase}_${k}`].filter((val, m) => filterCond(m))
					.forEach((_val, _i) => orgTmpList[_val]?.push(_i) || (orgTmpList[_val] = [_i]));
				orgTmpList.forEach((list, idx) => mirrorTmpList[idx] = list.toReversed());
				orgTmpList?.forEach((list, a) => list?.forEach((val, b) => mirrorList[orgTmpList[a][b]] = mirrorTmpList[a][b]));
				if (!mirrorList.every((val, p) => val === prevMirrorList[p])) {
					convTxt += `\$conv${n + 1}=Mirror${n + 1},${mirrorList.join(',')}<br>`;
					prevMirrorList = mirrorList.concat();
					n++;
				}
				k++;
			}

			// 矢印・フリーズアローのヘッダー情報を定義
			const noteTxt = g_editorTmp[keyN].noteNames.map((val, r) =>
				`|${val.slice(0, -(`_data`.length))}[i]_data=[a${String(r).padStart(2, `0`)}]|[E]<br>`).join(``);

			const freezeTxt = g_editorTmp[keyN].freezeNames.map((val, r) =>
				`|${val.slice(0, -(`_data`.length))}[i]_data=[f${String(r).padStart(2, `0`)}]|[E]<br>`).join(``);

			g_editorTmp2 += g_editorTmp2Template
				.replace(`[__KEY__]`, keyN)
				.replace(`[__MAP__]`, colorList.map(val => val < 3 ? (val + 1) % 3 : val % 7).join(','))
				.replace(`[__POS__]`, fillArray(keyNum).map((val, r) =>
					isNaN(parseFloat(stepRtnList[r])) ? 28 : 24).join(`,`))
				.replace(`[__TXT__]`, g_editorTmp[keyN].chars.map(val => val.replace(`, `, ``)).join(`,`))
				.replace(`[__CONV__]`, convTxt)
				.replace(`[__NOTE__]`, noteTxt)
				.replace(`[__FREEZE__]`, freezeTxt)
				.replaceAll(`\n`, ``);
		});
	});
};

/**
 * 作品別ローカルストレージの読み込み・初期設定
 * @param {string} _musicId 楽曲ID
 */
const loadLocalStorage = (_musicId = ``) => {

	// 作品別ローカルストレージのキー(URL)取得のため、
	// scoreId, h, debug, musicIdを削除
	// 選択中の楽曲ID(_musicId)がある場合は、キーとして区別するため追加
	const url = new URL(location.href);
	url.searchParams.delete(`scoreId`);
	url.searchParams.delete(`h`);
	url.searchParams.delete(`debug`);
	url.searchParams.delete(`musicId`);
	g_localStorageUrl = url.toString();

	// リザルト表示用のURL組み立てのため、_musicIdのないURLを保存
	g_localStorageUrlOrg = g_localStorageUrl;

	if (_musicId !== ``) {
		url.searchParams.append(`musicId`, _musicId);
		g_localStorageUrl = url.toString();
		if (g_langStorage.safeMode === C_FLG_ON) {
			return;
		}
	}

	/**
	 * ローカルストレージの初期値設定
	 * @param {string} _name 
	 * @param {string} _type 
	 * @param {number} _defaultPos 
	 */
	const checkLocalParam = (_name, _type = C_TYP_STRING, _defaultPos = 0) => {
		const defaultVal = g_settings[`${_name}s`][_defaultPos];
		if (g_localStorage[_name] !== undefined) {
			g_stateObj[_name] = setVal(g_localStorage[_name], defaultVal, _type);
			g_settings[`${_name}Num`] = roundZero(g_settings[`${_name}s`].findIndex(val => val === g_stateObj[_name]), defaultVal);
		} else {
			g_localStorage[_name] = defaultVal;
		}
	};

	// ロケールの読込、警告メッセージの入替
	g_langStorage = parseStorageData(`danoni-locale`);
	if (g_langStorage.locale !== undefined) {
		g_localeObj.val = g_langStorage.locale;
		g_localeObj.num = g_localeObj.list.findIndex(val => val === g_localeObj.val);
	}
	if (g_langStorage.safeMode === undefined) {
		g_langStorage.safeMode = C_FLG_OFF;
	}
	if (g_langStorage.bgmVolume === undefined) {
		g_langStorage.bgmVolume = 50;
	}
	g_stateObj.bgmVolume = g_langStorage.bgmVolume;
	g_settings.bgmVolumeNum = g_settings.volumes.findIndex(val => val === g_stateObj.bgmVolume);
	Object.assign(g_msgInfoObj, g_lang_msgInfoObj[g_localeObj.val]);
	Object.assign(g_kCd, g_lang_kCd[g_localeObj.val]);

	// 作品別ローカルストレージの読込
	if (g_langStorage.safeMode === C_FLG_OFF) {
		g_localStorage = parseStorageData(g_localStorageUrl, {
			adjustment: 0, hitPosition: 0, volume: 100, highscores: {},
		});
	} else {
		g_localStorage = {};
		g_stateObj.dataSaveFlg = false;
		makeWarningWindow(g_msgInfoObj.W_0031);
	}

	// Adjustment, Volume, Appearance, Opacity, HitPosition初期値設定
	checkLocalParam(`adjustment`, C_TYP_FLOAT, g_settings.adjustmentNum);
	checkLocalParam(`volume`, C_TYP_NUMBER, g_settings.volumes.length - 1);
	checkLocalParam(`appearance`);
	checkLocalParam(`opacity`, C_TYP_NUMBER, g_settings.opacitys.length - 1);
	checkLocalParam(`hitPosition`, C_TYP_FLOAT, g_settings.hitPositionNum);

	// ハイスコア取得準備
	if (g_localStorage.highscores === undefined) {
		g_localStorage.highscores = {};
	}

	// 廃棄済みリストからデータを消去
	g_storeSettingsEx.filter(val => g_localStorage[val] !== undefined)
		.forEach(val => delete g_localStorage[val]);
};

/**
 * 譜面データを分割して値を取得
 * @param {string} _dos 譜面データ
 * @returns 
 */
const dosConvert = (_dos = ``) => {

	const obj = {};
	const paramsTmp = g_enableAmpersandSplit ? _dos.split(`&`).join(`|`) : _dos;
	paramsTmp.split(`|`).filter(param => param.indexOf(`=`) > 0).forEach(param => {
		const pos = param.indexOf(`=`);
		const pKey = param.substring(0, pos);
		const pValue = param.substring(pos + 1);

		if (pKey !== undefined) {
			obj[pKey] = g_enableDecodeURI ? decodeURIComponent(pValue) : pValue;
		}
	});
	return obj;
};

/**
 * 譜面読込
 * @param {number} _scoreId 譜面番号
 */
const loadChartFile = async (_scoreId = g_stateObj.scoreId) => {

	const dosInput = document.getElementById(`dos`);
	const divRoot = document.getElementById(`divRoot`);
	const queryDos = getQueryParamVal(`dos`) !== null ?
		`dos/${getQueryParamVal('dos')}.txt` : encodeURI(document.getElementById(`externalDos`)?.value ?? ``);

	if (dosInput === null && queryDos === ``) {
		makeWarningWindow(g_msgInfoObj.E_0023);
		g_loadObj.main = false;
		return;
	}

	// 譜面分割あり、譜面番号固定時のみ譜面データを一時クリア
	if (queryDos !== `` && g_stateObj.dosDivideFlg && g_stateObj.scoreLockFlg) {
		Object.keys(g_rootObj).filter(data => fuzzyListMatching(data, g_checkStr.resetDosHeader, g_checkStr.resetDosFooter))
			.forEach(scoredata => g_rootObj[scoredata] = ``);
	}

	// HTML埋め込みdos
	if (dosInput !== null && _scoreId === 0) {
		Object.assign(g_rootObj, dosConvert(dosInput.value));
	}

	// 外部dos読み込み
	if (queryDos !== ``) {
		const charset = document.getElementById(`externalDosCharset`)?.value ?? document.characterSet;
		const fileBase = queryDos.match(/.+\..*/)[0];
		const fileExtension = fileBase.split(`.`).pop();
		const fileCommon = fileBase.split(`.${fileExtension}`)[0];
		const filename = `${fileCommon}${g_stateObj.dosDivideFlg ?
			setDosIdHeader(_scoreId, g_stateObj.scoreLockFlg) : ''}.${fileExtension}`;

		await loadScript2(`${filename}?${Date.now()}`, false, charset);
		if (typeof externalDosInit === C_TYP_FUNCTION) {

			// 外部データを読込（ファイルが見つからなかった場合は譜面追記をスキップ）
			externalDosInit();
			if (g_loadObj[filename]) {
				Object.assign(g_rootObj, dosConvert(g_externalDos));
			}

		} else {
			makeWarningWindow(g_msgInfoObj.E_0022);
		}
	}
};

/**
 * 譜面をファイルで分割している場合に初期色を追加取得
 * @param {string} _scoreId 
 */
const resetColorSetting = _scoreId => {
	// 初期矢印・フリーズアロー色の再定義
	if (g_stateObj.scoreLockFlg) {
		Object.assign(g_rootObj, copySetColor(g_rootObj, _scoreId));

		// 分割先のファイルで初期色が未定義の場合はデフォルト値を適用
		[``, `Shadow`].forEach(pattern =>
			[`set`, `frz`].forEach(arrow => {
				// frzShadowColorStrのみ、空で構成された初期配列があるためその条件を追加して除外条件とする
				if (!hasVal(g_rootObj[`${arrow}${pattern}Color${_scoreId + 1}`])
					&& g_headerObj[`${arrow}${pattern}ColorStr`]?.flat()?.some(val => hasVal(val))) {
					g_rootObj[`${arrow}${pattern}Color`] = g_headerObj[`${arrow}${pattern}ColorStr`].join(`,`);
				}
			})
		);
	}
	Object.assign(g_headerObj, resetBaseColorList(g_headerObj, g_rootObj, { scoreId: _scoreId, scoreLockFlg: false }));
};

/**
 * 譜面をファイルで分割している場合にゲージ情報を追加取得
 * @param {string} _scoreId 
 */
const resetGaugeSetting = _scoreId => {
	// ライフ設定のカスタム部分再取得（譜面ヘッダー加味）
	Object.assign(g_gaugeOptionObj, resetCustomGauge(g_rootObj, { scoreId: _scoreId }));
	Object.keys(g_gaugeOptionObj.customFulls).forEach(gaugePtn => getGaugeSetting(g_rootObj, gaugePtn, g_headerObj.difLabels.length, { scoreId: _scoreId }));
};

/**
 * 譜面番号固定かつ譜面ファイル分割時に初期色情報を他譜面へコピー
 * @param {object} _baseObj 
 * @param {number} _scoreId
 * @returns 
 */
const copySetColor = (_baseObj, _scoreId) => {
	const obj = {};
	// Todo: dosIdを引数にして、dosIdと一致するscoreIdを算出
	//       算出したscoreIdすべてに対して下記処理を実行
	const srcIdHeader = setScoreIdHeader(_scoreId, g_stateObj.scoreLockFlg, true);
	const targetIdHeader = setScoreIdHeader(_scoreId, false, true);
	[``, `Shadow`].forEach(pattern =>
		[`set`, `frz`].filter(arrow => hasVal(_baseObj[`${arrow}${pattern}Color${srcIdHeader}`] || _baseObj[`${arrow}${pattern}Color`]))
			.forEach(arrow => obj[`${arrow}${pattern}Color${targetIdHeader}`] =
				_baseObj[`${arrow}${pattern}Color${srcIdHeader}`] || _baseObj[`${arrow}${pattern}Color`]));
	return obj;
};

/**
 * MusicUrlの基本情報を取得
 * @param {number} _scoreId
 * @returns {string}
 */
const getMusicUrl = _scoreId =>
	g_headerObj.musicUrls?.[g_headerObj.musicNos[_scoreId]] ?? g_headerObj.musicUrls?.[0] ?? `nosound.mp3`;

/**
 * 音源データの実際のパスを取得
 * @param {string} _musicUrl 
 * @returns {string}
 */
const getFullMusicUrl = (_musicUrl = ``) => {
	let baseMusicUrl = _musicUrl;
	let baseDir = `../${g_headerObj.musicFolder}/`;

	if (_musicUrl.includes(C_MRK_CURRENT_DIRECTORY)) {
		// musicUrl, musicFolder両方にカレントパス指定がある場合は、musicUrlの値を優先

	} else if (g_headerObj.musicFolder.includes(C_MRK_CURRENT_DIRECTORY)) {
		// musicFolderにカレントパス指定がある場合は、ファイル名にmusicFolderの値も含める
		baseMusicUrl = `${g_headerObj.musicFolder}/${_musicUrl}`;
	}
	if (g_headerObj.musicFolder.includes(C_MRK_CURRENT_DIRECTORY)) {
		// musicFolderにカレントパス指定がある場合は、ディレクトリは指定しない
		baseDir = ``;
	}
	const [musicFile, musicPath] = getFilePath(baseMusicUrl, baseDir);
	return `${musicPath}${musicFile}`;
};

/**
 * 譜面ファイル読込後処理（譜面詳細情報取得用）
 * @param {number} _scoreId 
 */
const getScoreDetailData = _scoreId => {
	const keyCtrlPtn = `${g_headerObj.keyLabels[_scoreId]}_0`;
	storeBaseData(_scoreId, scoreConvert(g_rootObj, _scoreId, 0, ``, keyCtrlPtn, true), keyCtrlPtn);
};

/**
 * 譜面詳細データの格納
 * @param {number} _scoreId 
 * @param {object} _scoreObj 
 * @param {number} _keyCtrlPtn 
 */
const storeBaseData = (_scoreId, _scoreObj, _keyCtrlPtn) => {
	const lastFrame = getLastFrame(_scoreObj, _keyCtrlPtn) + 1;
	const startFrame = getStartFrame(lastFrame, 0, _scoreId);
	const firstArrowFrame = getFirstArrowFrame(_scoreObj, _keyCtrlPtn);
	const playingFrame = lastFrame - firstArrowFrame;
	const keyNum = g_keyObj[`${g_keyObj.defaultProp}${_keyCtrlPtn}`].length;

	// 譜面密度グラフ用のデータ作成
	const noteCnt = { arrow: [], frz: [] };
	const densityData = fillArray(g_limitObj.densityDivision);
	let allData = 0;

	const types = [`arrow`, `frz`];
	let fullData = [];
	for (let j = 0; j < keyNum; j++) {
		noteCnt.arrow[j] = 0;
		noteCnt.frz[j] = 0;

		const tmpFrzData = _scoreObj.frzData[j].filter((data, k) => k % 2 === 0);
		[_scoreObj.arrowData[j], tmpFrzData].forEach((typeData, m) =>
			typeData.forEach(note => {
				if (isNaN(parseFloat(note))) {
					return;
				}
				const point = Math.floor((note - firstArrowFrame) / playingFrame * g_limitObj.densityDivision);
				if (point >= 0) {
					densityData[point]++;
					noteCnt[types[m]][j]++;
					allData++;
				}
			}));
		fullData = fullData.concat(..._scoreObj.arrowData[j], ...tmpFrzData);
	}

	fullData = fullData.filter(val => !isNaN(parseFloat(val))).sort((a, b) => a - b);
	let pushCnt = 1;
	const density2PushData = fillArray(g_limitObj.densityDivision);
	const density3PushData = fillArray(g_limitObj.densityDivision);
	fullData.forEach((note, j) => {
		if (fullData[j] === fullData[j + 1]) {
			pushCnt++;
		} else {
			const point = Math.floor((note - firstArrowFrame) / playingFrame * g_limitObj.densityDivision);
			if (point >= 0) {
				if (pushCnt >= 2) {
					density2PushData[point] += pushCnt;
					if (pushCnt >= 3) {
						density3PushData[point] += pushCnt;
					}
				}
			}
			pushCnt = 1;
		}
	});

	g_detailObj.toolDif[_scoreId] = calcLevel(_scoreObj);
	g_detailObj.speedData[_scoreId] = _scoreObj.speedData.concat();
	g_detailObj.boostData[_scoreId] = _scoreObj.boostData.concat();

	const storeDensity = _densityData => {
		const dataList = [];
		for (let j = 0; j < g_limitObj.densityDivision; j++) {
			dataList.push(allData === 0 ? 0 : Math.round(_densityData[j] / allData * g_limitObj.densityDivision * 10000) / 100);
		}
		return dataList;
	};
	const diffArray = (_array1, _array2) => {
		const list = [];
		_array1.forEach((val, j) => list.push(_array1[j] - _array2[j]));
		return list;
	};
	g_detailObj.densityData[_scoreId] = storeDensity(densityData);
	g_detailObj.density2PushData[_scoreId] = storeDensity(density2PushData);
	g_detailObj.density3PushData[_scoreId] = storeDensity(density3PushData);

	g_detailObj.densityDiff[_scoreId] = diffArray(g_detailObj.densityData[_scoreId], g_detailObj.density2PushData[_scoreId]);
	g_detailObj.density2PushDiff[_scoreId] = diffArray(g_detailObj.density2PushData[_scoreId], g_detailObj.density3PushData[_scoreId]);
	g_detailObj.density3PushDiff[_scoreId] = g_detailObj.density3PushData[_scoreId].concat();

	g_detailObj.maxDensity[_scoreId] = getMaxValIdxs(densityData, g_limitObj.densityMaxVals).flat();

	g_detailObj.arrowCnt[_scoreId] = noteCnt.arrow.concat();
	g_detailObj.frzCnt[_scoreId] = noteCnt.frz.map((val, k) => _scoreObj.frzData[k].length % 2 === 0 ? val : val - 0.5);
	g_detailObj.startFrame[_scoreId] = startFrame;
	g_detailObj.playingFrame[_scoreId] = playingFrame;
	g_detailObj.playingFrameWithBlank[_scoreId] = lastFrame - startFrame;

	// --- ミニマップ設定 ---
	g_detailObj.miniMapParams[_scoreId] = {
		_scoreId, _scoreObj, _keyNum: keyNum,
		_playingFrame: playingFrame,
		_firstArrowFrame: firstArrowFrame,
		_keyCtrlPtn,
		config: {
			scale: 1.5,
			timeMargin: 35,
			mmWidthBase: (g_sWidth - 500) / 2 + 290,
			mmMarginY: 2,
			get laneWidth() {
				return Math.min((this.mmWidthBase - this.timeMargin) / keyNum, 40);
			},
			get logicalWidth() {
				const logicalWidth = this.timeMargin + (this.laneWidth * keyNum);
				return Math.ceil(logicalWidth * g_dpr) / g_dpr;
			}
		},
	};

	// Canvas保存用配列を空で初期化
	g_detailObj.scoreMinimap[_scoreId] = null;
	g_detailObj.scoreMinimapReverse[_scoreId] = null;
};

/**
 * 指定された高さに基づいて分割されたCanvasリストを生成する
 * @param {number} _width
 * @param {number} _totalHeight
 * @return {object[]} 分割されたCanvasとそのコンテキスト、オフセット情報を含むリスト
 */
const createSplitCanvases = (_width, _totalHeight) => {
	// バックバッファ（実際のピクセル数）の最大値を 8000 に設定（iOS Safari 8192px 対策）
	const BACKING_STORE_LIMIT = 8000;

	// 論理上の最大高さ（CSSピクセル）を計算
	// g_dpr=2なら4000px、g_dpr=3なら2666px が1枚の限界になる
	const maxLogicalHeight = Math.max(1, Math.floor(BACKING_STORE_LIMIT / g_dpr));
	if (_totalHeight <= 0) return [];

	const count = Math.ceil(_totalHeight / maxLogicalHeight);
	const list = [];

	for (let i = 0; i < count; i++) {
		const cvs = document.createElement('canvas');
		// 残りの高さを計算
		const logicalH = (i === count - 1)
			? _totalHeight - (maxLogicalHeight * i)
			: maxLogicalHeight;

		// 実際の描画解像度をセット
		cvs.width = _width * g_dpr;
		cvs.height = logicalH * g_dpr;

		// ブラウザ上の表示サイズをセット
		cvs.style.width = wUnit(_width);
		cvs.style.height = wUnit(logicalH);
		cvs.style.display = 'block';

		const ctx = cvs.getContext('2d');
		ctx.scale(g_dpr, g_dpr);

		list.push({
			canvas: cvs,
			ctx: ctx,
			offsetTop: i * maxLogicalHeight,
			logicalHeight: logicalH
		});
	}
	return list;
};

/**
 * 描画対象のCanvasを判定して描画を実行する
 * @param {object[]} _canvases
 * @param {HTMLCanvasElement} _canvases[].canvas 分割されたCanvas要素
 * @param {CanvasRenderingContext2D} _canvases[].ctx Canvasの描画コンテキスト
 * @param {number} _canvases[].offsetTop Canvasの論理上のオフセット位置
 * @param {number} _canvases[].logicalHeight Canvasの論理上の高さ
 * @param {number} _y
 * @param {number} _h
 * @param {number} _dpr
 * @param {Function} _drawFunc
 */
const distributeDrawing = (_canvases, _y, _h, _dpr, _drawFunc) => {
	_canvases.forEach(item => {
		const canvasHeight = item.logicalHeight;
		if (_y + _h >= item.offsetTop && _y <= item.offsetTop + canvasHeight) {
			item.ctx.save();
			item.ctx.translate(0, -item.offsetTop);
			_drawFunc(item.ctx);
			item.ctx.restore();
		}
	});
};

/**
 * 譜面ミニマップ：キー名を表示するヘッダーキャンバスを作成する
 * @param {object} _config ミニマップの基本設定
 * @param {number} _config.timeMargin 時間軸のマージン
 * @param {number} _config.laneWidth レーンの幅
 * @param {number} _config.logicalWidth キャンバスの論理幅
 * @param {string} _keyCtrlPtn キーコントロールパターン
 * @param {number} _keyNum キー数
 * @return {HTMLCanvasElement} ヘッダー用のキャンバス要素
 */
const createMinimapHeader = (_config, _keyCtrlPtn, _keyNum) => {
	const { timeMargin, laneWidth, logicalWidth } = _config;
	const headerHeight = 15; // ヘッダーの固定高

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	// 解像度と表示サイズの設定
	canvas.width = logicalWidth * g_dpr;
	canvas.height = headerHeight * g_dpr;
	canvas.style.width = wUnit(logicalWidth);
	canvas.style.height = wUnit(headerHeight);
	canvas.style.display = 'block';

	ctx.scale(g_dpr, g_dpr);

	// テキストのスタイル設定
	ctx.fillStyle = '#999';
	ctx.font = `10px ${getBasicFont()}`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	// 各レーンのキー名を描画
	for (let j = 0; j < _keyNum; j++) {
		// config.laneWidth を使って中央座標を計算
		const x = timeMargin + j * laneWidth + laneWidth / 2;
		const keyText = g_kCd[g_keyObj[`keyCtrl${_keyCtrlPtn}`][j][0]].split(` `).join(``);

		ctx.fillText(keyText, x, headerHeight / 2 + 2); // 視覚的な中央調整で +2px
	}

	return canvas;
};

/**
 * 譜面ミニマップ：譜面ミニマップ本体生成
 * @param {object} _params ミニマップ生成のためのパラメータオブジェクト
 * @param {object} _params._scoreObj 譜面データオブジェクト
 * @param {number} _params._keyNum キー数
 * @param {number} _params._playingFrame 演奏時間（フレーム数）
 * @param {number} _params._firstArrowFrame 最初の矢印のフレーム位置
 * @param {string} _params._keyCtrlPtn キーコントロールパターン
 * @param {object} _params.config ミニマップの基本設定
 * @param {number} _params.config.scale ミニマップの時間軸のスケール
 * @param {number} _params.config.timeMargin 時間軸のマージン
 * @param {number} _params.config.laneWidth レーンの幅
 * @param {number} _params.config.logicalWidth キャンバスの論理幅
 * @param {number} _params.config.mmMarginY ミニマップの上下マージン
 * @param {boolean} _isReverse ミニマップのリバース表示フラグ
 * @returns {HTMLCanvasElement[]} ミニマップ用のキャンバス要素の配列
 */
const generateMinimapData = (_params, _isReverse) => {
	const { _scoreObj, _keyNum, _playingFrame, _firstArrowFrame, _keyCtrlPtn, config } = _params;
	const { scale, timeMargin, laneWidth, logicalWidth, mmMarginY } = config;

	const mmHeightTotal = _playingFrame * scale + mmMarginY * 2;
	const canvases = createSplitCanvases(logicalWidth, mmHeightTotal);

	const getY = (frame) => {
		const relativeFrame = frame - _firstArrowFrame;
		const rawY = relativeFrame * scale;
		// mmHeightTotalから引くのではなく、中身の演奏時間部分(_playingFrame * scale)を基準にリバース
		return _isReverse
			? (_playingFrame * scale - rawY + mmMarginY)
			: (rawY + mmMarginY);
	};

	// 1. 時間軸描画
	const interval = g_fps;
	for (let f = Math.ceil(_firstArrowFrame / interval) * interval; f <= _firstArrowFrame + _playingFrame; f += interval) {
		const y = getY(f);
		distributeDrawing(canvases, y - 5, 10, g_dpr, (ctx) => {
			ctx.strokeStyle = '#444';
			ctx.fillStyle = '#999';
			ctx.font = `10px ${getBasicFont()}`;
			ctx.textAlign = 'right';
			ctx.textBaseline = 'middle';
			ctx.beginPath(); ctx.moveTo(timeMargin, y); ctx.lineTo(timeMargin + laneWidth * _keyNum, y); ctx.stroke();
			const [m, s] = transFrameToTimer(f).split(':');
			ctx.fillText(`${m.padStart(2, '0')}:${s}`, timeMargin, y);
		});
	}

	// 2. フリーズノート
	for (let j = 0; j < _keyNum; j++) {
		const frz = _scoreObj.frzData[j];
		for (let k = 0; k < frz.length; k += 2) {
			const start = frz[k];
			const end = frz[k + 1];

			// 終了地点がない、またはどちらかが数値でない場合はスキップ
			if (end === undefined || isNaN(start) || isNaN(end)) {
				console.warn(`Minimap: Incomplete freeze note pair at lane ${j}, index ${k}`);
				continue;
			}
			const y1 = getY(start);
			const y2 = getY(end);
			const top = Math.min(y1, y2);
			const h = Math.abs(y2 - y1);
			const x = timeMargin + j * laneWidth;
			distributeDrawing(canvases, top, h, g_dpr, (ctx) => {
				ctx.fillStyle = 'rgba(0, 200, 255, 0.4)';
				ctx.fillRect(x + 2, top, laneWidth - 3, h);
				ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)';
				ctx.strokeRect(x + 2, top, laneWidth - 3, h);
			});
		}
	}

	// 3. 通常ノート
	for (let j = 0; j < _keyNum; j++) {
		const color = g_dfColorObj.setColorType2[g_keyObj[`color${_keyCtrlPtn}_0`][j]] || '#ffffff';
		_scoreObj.arrowData[j].forEach(note => {
			const y = getY(parseFloat(note));
			distributeDrawing(canvases, y - 1.5, 3, g_dpr, (ctx) => {
				ctx.fillStyle = color;
				ctx.fillRect(timeMargin + j * laneWidth + 1, y - 1.5, laneWidth - 1, 3);
			});
		});
	}

	return canvases.map(item => item.canvas);
};

/**
 * ツール計算
 * @param {object} _scoreObj 
 * @param {number[][]} _scoreObj.arrowData 矢印データ
 * @param {number[][]} _scoreObj.frzData フリーズデータ
 * @returns {{tool: string, tate: number, douji: number, push3Cnt: number, push3: number[]}}
 */
const calcLevel = _scoreObj => {
	//--------------------------------------------------------------
	//＜フリーズデータ分解＞
	//  フリーズデータを分解し、矢印データに組み込む
	//
	//  (イメージ)
	//    &left_data=400,500,700&
	//    &frzLeft_data=550,650&
	//  ⇒
	//    left_data=[400,500,550,700];  // フリーズの始点を組込
	//    frzStartData=[550];	// フリーズ始点
	//    frzEndData  =[650];	// フリーズ終点
	//--------------------------------------------------------------
	const frzStartData = [];
	const frzEndData = [];

	_scoreObj.frzData.forEach((frzs, j) => {
		if (frzs.length > 1) {
			for (let k = 0; k < frzs.length; k += 2) {
				_scoreObj.arrowData[j].push(frzs[k]);
				frzStartData.push(frzs[k]);
				frzEndData.push(frzs[k + 1]);
			}
		}
		_scoreObj.arrowData[j] = _scoreObj.arrowData[j].sort((a, b) => a - b)
			.filter((x, i, self) => self.indexOf(x) === i && !isNaN(parseFloat(x)));
	})

	frzStartData.sort((a, b) => a - b);
	frzEndData.sort((a, b) => a - b);

	//--------------------------------------------------------------
	//＜データ結合･整理＞
	//  矢印データを連結してソートする。
	//
	//  重複は後の同時押し補正で使用する。
	//  後の同時押し補正の都合上、firstFrame-100, lastFrame+100 のデータを末尾に追加。
	//
	//  (イメージ)
	//    |left_data=300,400,550|	// フリーズデータ(始点)を含む
	//    |down_data=500|
	//    |up_data=600|
	//    |right_data=700,800|
	//    |space_data=200,300,1000|
	//    frzEndData = [650];	// フリーズデータ(終点) ※allScorebook対象外
	//  ⇒
	//    allScorebook = [100,200,300,300,400,500,550,600,700,800,1000,1100];
	//
	//--------------------------------------------------------------
	let allScorebook = [];
	_scoreObj.arrowData.forEach(data => allScorebook = allScorebook.concat(data));

	allScorebook.sort((a, b) => a - b);
	allScorebook.unshift(allScorebook[0] - 100);
	allScorebook.push(allScorebook.at(-1) + 100);
	const allCnt = allScorebook.length;

	frzEndData.push(allScorebook.at(-1));

	//--------------------------------------------------------------
	//＜間隔フレーム数の調和平均計算+いろいろ補正＞
	//  レベル計算メイン。
	//
	//  [レベル計算ツール++ ver1.18] 3つ押し以上でも同時押し補正ができるよう調整
	//--------------------------------------------------------------
	let levelcount = 0;   // 難易度レベル
	let freezenum = 0; // フリーズアロー数
	let pushCnt = 1;   // 同時押し数カウント
	let twoPushCount = 0; // 同時押し補正値
	const push3List = [];    // 3つ押し判定数

	for (let i = 1; i < allCnt - 2; i++) {
		// フリーズ始点の検索
		while (frzStartData[0] === allScorebook[i]) {
			// 同時押しの場合
			if (allScorebook[i] === allScorebook[i + 1]) {
				break;
			}

			// 現フレームに存在するフリーズ数を1増やす
			// (フリーズアローの同時チェック開始)
			frzStartData.shift();
			freezenum++;
		}

		// フリーズ終点の検索
		while (frzEndData[0] < allScorebook[i + 1]) {
			// 現フレームに存在するフリーズ数を1減らす
			frzEndData.shift();
			freezenum--;
		}

		// 同時押し補正処理(フリーズアローが絡まない場合)
		if (allScorebook[i + 1] === allScorebook[i] && !freezenum) {

			const chk = (allScorebook[i + 2] - allScorebook[i + 1]) * (allScorebook[i] - allScorebook[i - pushCnt]);
			if (chk !== 0) {
				twoPushCount += 40 / chk;
			} else {
				// 3つ押しが絡んだ場合は加算しない
				push3List.push(allScorebook[i]);
			}
			pushCnt++;

		} else {
			// 単押し＋フリーズアローの補正処理(フリーズアロー中の矢印)
			pushCnt = 1;
			const chk2 = (2 - freezenum) * (allScorebook[i + 1] - allScorebook[i]);
			if (chk2 > 0) {
				levelcount += 2 / chk2;
			} else {
				// 3つ押しが絡んだ場合は加算しない
				push3List.push(allScorebook[i]);
			}
		}
	}
	levelcount += twoPushCount;
	const leveltmp = levelcount;

	//--------------------------------------------------------------
	//＜同方向連打補正＞
	//  同方向矢印(フリーズアロー)の隣接間隔が10フレーム未満の場合に加算する。
	//--------------------------------------------------------------
	_scoreObj.arrowData.forEach(arrows =>
		arrows.forEach((val, k) => {
			if (arrows[k + 1] - arrows[k] < 10) {
				levelcount += 10 / Math.pow(arrows[k + 1] - arrows[k], 2) - 1 / 10;
			}
		}));

	//--------------------------------------------------------------
	//＜表示＞
	//  曲長、3つ押し補正を行い、最終的な難易度レベル値を表示する。
	//--------------------------------------------------------------
	const push3Cnt = push3List.length;
	const calcArrowCnt = allCnt - push3Cnt - 3;
	const toDecimal2 = num => Math.round(num * 100) / 100;
	const calcDifLevel = num => calcArrowCnt > 0 ? toDecimal2(num / Math.sqrt(calcArrowCnt) * 4) : 0;

	const baseDifLevel = calcDifLevel(levelcount);
	const difLevel = toDecimal2(baseDifLevel * (allCnt - 3) / calcArrowCnt);

	//--------------------------------------------------------------
	//＜計算結果を格納＞
	//--------------------------------------------------------------
	return {
		// 難易度レベル
		tool: (allCnt === 3 ? `0.01` : `${difLevel.toFixed(2)}${(push3Cnt > 0 ? "*" : "")}`),
		// 縦連打補正
		tate: toDecimal2(baseDifLevel - calcDifLevel(leveltmp)),
		// 同時押し補正
		douji: calcDifLevel(twoPushCount),
		// 3つ押し数
		push3cnt: push3Cnt,
		// 3つ押しリスト
		push3: makeDedupliArray(push3List),
	};
};

/**
 * ロケールを含んだヘッダーの優先度設定
 * @param {object} _obj 
 * @param {...any} [_params]
 * @returns {string}
 */
const getHeader = (_obj, ..._params) => {
	let headerLocale, headerDf;
	Object.keys(_params).forEach(j => {
		headerLocale ??= _obj[`${_params[j]}${g_localeObj.val}`];
		headerDf ??= _obj[_params[j]];
	});
	return headerLocale ?? headerDf;
};

/**
 * ヘッダー名の互換設定
 * @param {string} _param 
 * @returns {string[]}
 */
const getHname = _param => [_param, _param.toLowerCase()];

/**
 * 譜面ヘッダーの分解（スキン、jsファイルなどの設定）
 * @param {object} _dosObj
 * @returns {object}
 */
const preheaderConvert = _dosObj => {

	// ヘッダー群の格納先
	const obj = {};

	// ウィンドウ位置の設定
	const align = _dosObj.windowAlign ?? g_presetObj.windowAlign;
	if (align !== undefined) {
		g_windowAlign[align]();
	}

	obj.jsData = [];
	obj.stepRtnUse = true;

	const setJsFiles = (_files, _defaultDir, _type = `custom`) =>
		_files.filter(file => hasVal(file)).forEach(file => {
			const [jsFile, jsDir] = getFilePath(file, _defaultDir);
			obj.jsData.push([_type === `skin` ? `danoni_skin_${jsFile}.js` : jsFile, jsDir]);
		});

	const convLocalPath = (_file, _type) =>
		g_remoteFlg && hasVal(_file) && !_file.includes(C_MRK_CURRENT_DIRECTORY) && !hasRemoteDomain(_file)
			? `${C_MRK_CURRENT_DIRECTORY}../${_type}/${_file}`
			: _file;

	// 外部スキンファイルの指定
	const tmpSkinType = _dosObj.skinType ?? g_presetObj.skinType ?? `default`;
	const tmpSkinTypes = tmpSkinType.split(`,`).map(file => {

		// スキンタイプを取得（ディレクトリパス、カレント指定(..)を除去）
		const match = file.match(/.*\/(.+)|\(\.\.\)([^/]+)|(.+)/);
		const skinName = match[1] || match[2] || match[3];

		// デフォルトセット以外はリモート先のデータを使用しない
		return g_defaultSets.skinType.findIndex(val => val === skinName) < 0 ?
			convLocalPath(file, `skin`) : file;
	});
	obj.defaultSkinFlg = tmpSkinTypes.includes(`default`) && setBoolVal(_dosObj.bgCanvasUse ?? g_presetObj.bgCanvasUse, true);
	setJsFiles(tmpSkinTypes, C_DIR_SKIN, `skin`);

	// 外部jsファイルの指定
	const tmpCustomjs = getHeader(_dosObj, ...getHname(`customJs`)) ?? g_presetObj.customJs ?? C_JSF_CUSTOM;
	setJsFiles(tmpCustomjs.replaceAll(`*`, g_presetObj.customJs).split(`,`)
		.map(file => convLocalPath(file, `js`)), C_DIR_JS);

	// 外部cssファイルの指定
	const tmpCustomcss = getHeader(_dosObj, ...getHname(`customCss`)) ?? g_presetObj.customCss ?? ``;
	setJsFiles(tmpCustomcss.replaceAll(`*`, g_presetObj.customCss).split(`,`)
		.map(file => convLocalPath(file, `css`)), C_DIR_CSS);

	// デフォルト曲名表示、背景、Ready表示の利用有無
	g_titleLists.init.forEach(objName => {
		const objUpper = toCapitalize(objName);
		obj[`custom${objUpper}Use`] =
			setBoolVal(_dosObj[`custom${objUpper}Use`] ?? g_presetObj.customDesignUse?.[objName]);
	});

	// 背景・マスクモーションのパス指定方法を他の設定に合わせる設定
	obj.syncBackPath = setBoolVal(_dosObj.syncBackPath ?? g_presetObj.syncBackPath);

	return obj;
};

/**
 * 譜面ヘッダーの分解（その他の設定）
 * @param {object} _dosObj 譜面データオブジェクト
 * @returns {object}
 */
const headerConvert = _dosObj => {

	// ヘッダー群の格納先
	const obj = {};

	// 自動プリロードの設定
	obj.autoPreload = setBoolVal(_dosObj.autoPreload, true);
	g_headerObj.autoPreload = obj.autoPreload;

	// デフォルトスタイルのバックアップ
	getCssCustomProperties();

	// 初期で変更するカスタムプロパティを設定
	Object.keys(_dosObj).filter(val => val.startsWith(`--`) && hasVal(_dosObj[val])).forEach(prop => {
		g_cssBkProperties[prop] = getCssCustomProperty(prop, _dosObj[prop]);
		document.documentElement.style.setProperty(prop, g_cssBkProperties[prop]);
	});

	// フォントの設定
	obj.customFont = _dosObj.customFont ?? ``;
	g_headerObj.customFont = obj.customFont;

	// 画像ルートパス、拡張子の設定 (サーバ上のみ)
	obj.imgType = [];
	if (!g_isFile) {
		let tmpImgTypes = [];
		if (hasVal(_dosObj.imgType)) {
			tmpImgTypes = splitLF2(_dosObj.imgType);
		} else if (g_presetObj.imageSets !== undefined) {
			tmpImgTypes = g_presetObj.imageSets.concat();
		}
		tmpImgTypes.forEach((tmpImgType, j) => {
			const imgTypes = tmpImgType.split(`,`);
			obj.imgType[j] = {
				name: imgTypes[0],
				extension: imgTypes[1] || `svg`,
				rotateEnabled: setBoolVal(imgTypes[2], true),
				flatStepHeight: setVal(imgTypes[3], C_ARW_WIDTH, C_TYP_FLOAT),
				remoteDir: imgTypes[4] || ``,
			};
			g_keycons.imgTypes[j] = (imgTypes[0] === `` ? `Original` : imgTypes[0]);
		});
	}

	// 末尾にデフォルト画像セットが入るよう追加
	if (obj.imgType.findIndex(imgSets => imgSets.name === ``) === -1) {
		obj.imgType.push({ name: ``, extension: `svg`, rotateEnabled: true, flatStepHeight: C_ARW_WIDTH, remoteDir: `` });
		g_keycons.imgTypes.push(`Original`);
	}
	g_imgType = g_keycons.imgTypes[0];
	g_stateObj.rotateEnabled = obj.imgType[0].rotateEnabled;
	g_stateObj.flatStepHeight = obj.imgType[0].flatStepHeight;
	changeSettingListsForImg();

	const [titleArrowName, titleArrowRotate] = padArray(_dosObj.titleArrowName?.split(`:`), [`Original`, 180]);
	obj.titleArrowNo = roundZero(g_keycons.imgTypes.findIndex(imgType => imgType === titleArrowName));
	obj.titleArrowRotate = titleArrowRotate;

	// サーバ上の場合、画像セットを再読込（ローカルファイル時は読込済みのためスキップ）
	if (!g_isFile) {
		updateImgType(obj.imgType[obj.titleArrowNo], true);
		updateImgType(obj.imgType[0]);
	} else {
		g_imgObj.titleArrow = C_IMG_ARROW;
	}

	// 自動横幅拡張設定
	obj.autoSpread = setBoolVal(_dosObj.autoSpread, g_presetObj.autoSpread ?? true);

	// 横幅設定
	if (hasVal(_dosObj.windowWidth)) {
		g_sWidth = Math.max(setIntVal(_dosObj.windowWidth, g_sWidth), g_sWidth);
		$id(`canvas-frame`).width = wUnit(g_sWidth);
	}
	// 高さ設定
	obj.heightVariable = getQueryParamVal(`h`) !== null && (_dosObj.heightVariable || g_presetObj.heightVariable || false);
	if (hasVal(_dosObj.windowHeight || g_presetObj.autoMinHeight) || obj.heightVariable) {
		g_sHeight = Math.max(setIntVal(_dosObj.windowHeight, g_presetObj.autoMinHeight ?? g_sHeight),
			setIntVal(getQueryParamVal(`h`), g_sHeight), g_sHeight);
		$id(`canvas-frame`).height = wUnit(g_sHeight);
	}

	// 曲名
	obj.musicTitles = [`musicName`];
	obj.musicTitlesForView = [[`musicName`]];
	obj.artistNames = [``];
	obj.artistUrls = [``];
	obj.bpms = [`----`];
	obj.musicNos = hasVal(_dosObj.musicNo)
		? splitLF2(_dosObj.musicNo).map(Number).map(val => isNaN(val) ? 0 : val)
		: fillArray(_dosObj.difData?.split(`$`).length ?? 1);

	const dosMusicTitle = getHeader(_dosObj, `musicTitle`);
	let alternativeTitle;
	if (hasVal(dosMusicTitle)) {
		const musicData = splitLF2(dosMusicTitle);

		const lastIdx = Math.max(...obj.musicNos, musicData.length - 1);
		for (let j = 0; j <= lastIdx; j++) {
			const tmpMusicData = musicData[j] ?? ``;
			const musics = splitComma(tmpMusicData);

			obj.musicTitles[j] = hasVal(musics[0])
				? escapeHtml(getMusicNameSimple(musics[0]))
				: obj.musicTitles[0];
			obj.musicTitlesForView[j] = hasVal(musics[0])
				? escapeHtmlForArray(getMusicNameMultiLine(musics[0]))
				: obj.musicTitlesForView[0];
			obj.artistNames[j] = hasVal(musics[1])
				? escapeHtml(musics[1])
				: obj.artistNames[0];
			obj.artistUrls[j] = musics[2] || obj.artistUrls[0];
			obj.bpms[j] = musics[4] || obj.bpms[0];

			// 代替タイトル名
			if (j === 0 && hasVal(_dosObj.musicNo)) {
				alternativeTitle = musics[3];
			}
		}

	} else {
		makeWarningWindow(g_msgInfoObj.E_0012);
	}

	// 単一作品用の項目としての管理変数
	obj.musicTitle = obj.musicTitles[0];
	obj.musicTitleForView = obj.musicTitlesForView[0];
	obj.artistName = obj.artistNames[0];
	if (obj.artistName === ``) {
		makeWarningWindow(g_msgInfoObj.E_0011);
		obj.artistName = `artistName`;
	}
	obj.artistUrl = obj.artistUrls[0];

	// 代替タイトル名は曲名定義の後に設定する（複数曲を束ねる名前であり、曲名ではないため）
	if (hasVal(alternativeTitle)) {
		obj.musicTitles[0] = escapeHtml(getMusicNameSimple(alternativeTitle));
		obj.musicTitlesForView[0] = escapeHtmlForArray(getMusicNameMultiLine(alternativeTitle));
	}

	// 選曲機能の利用有無（最後のカンマ後の文字をBGM利用フラグとして利用）
	const rawPackageName = _dosObj.packageName || ``;
	const packageNameParts = rawPackageName.split(`,`);
	const bgmUseSwitch = setVal(trimStr(packageNameParts.at(-1)), ``, C_TYP_SWITCH);
	const packageName = bgmUseSwitch === ``
		? rawPackageName
		: packageNameParts.slice(0, -1).join(`,`);
	obj.packageNames = (packageName || ``).split(`<br>`);
	obj.musicSelectUse = _dosObj.packageName !== undefined;
	obj.bgmUseFlg = bgmUseSwitch === C_FLG_ON;

	if (!obj.bgmUseFlg) {
		g_stateObj.bgmMuteFlg = true;
	}

	// 最小・最大速度の設定
	obj.minSpeed = Math.round(setVal(_dosObj.minSpeed, C_MIN_SPEED, C_TYP_FLOAT) * 4) / 4;
	obj.maxSpeed = Math.round(setVal(_dosObj.maxSpeed, C_MAX_SPEED, C_TYP_FLOAT) * 4) / 4;
	if (obj.minSpeed > obj.maxSpeed || obj.minSpeed < 0.5 || obj.maxSpeed < 0.5) {
		obj.minSpeed = C_MIN_SPEED;
		obj.maxSpeed = C_MAX_SPEED;
	}
	g_settings.speeds = makeSpeedList(obj.minSpeed, obj.maxSpeed);

	// プレイ中のショートカットキー
	obj.keyRetry = setIntVal(getKeyCtrlVal(_dosObj.keyRetry), C_KEY_RETRY);
	obj.keyRetryDef = obj.keyRetry;
	obj.keyRetryDef2 = obj.keyRetry;
	obj.keyTitleBack = setIntVal(getKeyCtrlVal(_dosObj.keyTitleBack), C_KEY_TITLEBACK);
	obj.keyTitleBackDef = obj.keyTitleBack;
	obj.keyTitleBackDef2 = obj.keyTitleBack;
	obj.keyPause = setIntVal(getKeyCtrlVal(_dosObj.keyPause), C_KEY_PAUSE);
	obj.keyPauseDef = obj.keyPause;
	obj.keyPauseDef2 = obj.keyPause;

	// フリーズアローの許容フレーム数設定
	obj.frzAttempt = setIntVal(_dosObj.frzAttempt, C_FRM_FRZATTEMPT);

	// 製作者表示
	const dosTuning = getHeader(_dosObj, `tuning`);
	obj.tuningNames = [];
	obj.tuningUrls = [];
	if (hasVal(dosTuning)) {
		splitLF2(dosTuning).forEach(tuning => {
			const tuningData = tuning.split(`,`);
			obj.tuningNames.push(escapeHtmlForEnabledTag(tuningData[0]));
			obj.tuningUrls.push(tuningData[1] ||
				(getHeader(g_presetObj, `tuning`) === tuningData[0] ? g_presetObj.tuningUrl : ``));
		});
		obj.tuning = obj.tuningNames[0];
		obj.creatorUrl = obj.tuningUrls[0] || g_presetObj.tuningUrl || ``;
	} else {
		obj.tuning = escapeHtmlForEnabledTag(getHeader(g_presetObj, `tuning`) ?? `name`);
		obj.creatorUrl = g_presetObj.tuningUrl ?? ``;
	}
	obj.tuningInit = obj.tuning;

	obj.dosNos = [];
	obj.scoreNos = [];
	if (hasVal(_dosObj.dosNo)) {
		splitLF2(_dosObj.dosNo).map((val, j) => [obj.dosNos[j], obj.scoreNos[j]] = val.split(`,`));
		const dosNoCnt = {};
		obj.dosNos.forEach((val, j) => {
			if (dosNoCnt[val] === undefined) {
				dosNoCnt[val] = 0;
			}
			if (obj.scoreNos[j] === undefined) {
				dosNoCnt[val]++;
				obj.scoreNos[j] = dosNoCnt[val];
			} else {
				dosNoCnt[val] = Number(obj.scoreNos[j]);
			}
		});
	}

	// 譜面情報
	if (hasVal(_dosObj.difData)) {
		const difs = splitLF2(_dosObj.difData);
		const difpos = {
			Key: 0, Name: 1, Speed: 2, Border: 3, Recovery: 4, Damage: 5, Init: 6,
		};
		obj.keyLabels = [];
		obj.difLabels = [];
		obj.initSpeeds = [];
		obj.lifeBorders = [];
		obj.lifeRecoverys = [];
		obj.lifeDamages = [];
		obj.lifeInits = [];
		obj.creatorNames = [];
		obj.difficulties = [];
		g_stateObj.scoreId = (g_stateObj.scoreId < difs.length ? g_stateObj.scoreId : 0);

		difs.forEach(dif => {
			const difDetails = dif.split(`,`);
			const lifeData = (_type, _default) =>
				difDetails[difpos[_type]] || g_presetObj.gauge?.[_type] || _default;

			// ライフ：ノルマ、回復量、ダメージ量、初期値の設定
			obj.lifeBorders.push(lifeData(`Border`, `x`));
			obj.lifeRecoverys.push(lifeData(`Recovery`, 6));
			obj.lifeDamages.push(lifeData(`Damage`, 40));
			obj.lifeInits.push(lifeData(`Init`, 25));

			// キー数
			const keyLabel = difDetails[difpos.Key] || g_keyObj.initKeyLabel;
			obj.keyLabels.push(g_keyObj.keyTransPattern[keyLabel] ?? keyLabel);

			// 譜面名、制作者名
			if (hasVal(difDetails[difpos.Name])) {
				const difNameInfo = difDetails[difpos.Name].split(`::`);
				obj.difLabels.push(escapeHtml(difNameInfo[0] ?? `Normal`));
				obj.creatorNames.push(setVal(escapeHtml(difNameInfo[1]), obj.tuning));
				obj.difficulties.push(setIntVal(difNameInfo[2], 0));
			} else {
				obj.difLabels.push(`Normal`);
				obj.creatorNames.push(obj.tuning);
				obj.difficulties.push(0);
			}

			// 初期速度
			obj.initSpeeds.push(setVal(difDetails[difpos.Speed], 3.5, C_TYP_FLOAT));
		});
	} else {
		makeWarningWindow(g_msgInfoObj.E_0021);
		obj.keyLabels = [g_keyObj.initKeyLabel];
		obj.difLabels = [`Normal`];
		obj.initSpeeds = [3.5];
		obj.lifeBorders = [`x`];
		obj.lifeRecoverys = [6];
		obj.lifeDamages = [40];
		obj.lifeInits = [25];
		obj.creatorNames = [obj.tuning];
		obj.difficulties = [0];
	}
	const keyLists = makeDedupliArray(obj.keyLabels);
	obj.viewLists = [...Array(obj.keyLabels.length).keys()];
	obj.keyLists = keyLists.sort((a, b) => parseInt(a) - parseInt(b));
	obj.undefinedKeyLists = obj.keyLists.filter(key => g_keyObj[`${g_keyObj.defaultProp}${key}_0`] === undefined);

	// 楽曲別のグループ化設定（選曲モードのみ）
	if (hasVal(_dosObj.musicGroup)) {
		obj.musicGroups = _dosObj.musicGroup.split(`,`)
			.map((val, j) => setVal(val, j, C_TYP_NUMBER))
			.map((val, j) => val < 0 ? j + val : val);
		for (let k = obj.musicGroups.length; k <= Math.max(...obj.musicNos); k++) {
			obj.musicGroups[k] = k;
		}
		obj.musicIdxList = makeDedupliArray(obj.musicGroups);
	} else {
		obj.musicIdxList = [...Array(Math.max(...obj.musicNos) + 1).keys()];
	}

	// 難易度配色の設定（選曲画面でのみ使用）
	const normalizeCssColor = _color => {
		const tmp = document.createElement(`span`);
		tmp.style.color = ``;
		tmp.style.color = trimStr(_color ?? ``);
		return tmp.style.color;
	};
	obj.difColorList = [
		{ threshold: Infinity, color: `` }
	];
	if (hasVal(_dosObj.difColor)) {
		_dosObj.difColor.split(`,`).forEach(val => {
			const difColorSet = val.split(`/`);
			obj.difColorList.push({
				threshold: setIntVal(difColorSet[0]),
				color: hasVal(difColorSet[1]) ? normalizeCssColor(difColorSet[1]) : ``
			});
		})
	}
	obj.difColorList.sort((a, b) => a.threshold - b.threshold);

	const sanitizeCustomLink = _link => {
		try {
			const raw = trimStr(_link);
			if (!hasVal(raw)) return undefined;
			const url = new URL(raw, location.href); // allows relative inputs
			const allowed = g_isFile ? [`http:`, `https:`, `file:`] : [`http:`, `https:`];
			return allowed.includes(url.protocol) ? url.href : undefined;
		} catch {
			return undefined;
		}
	};
	obj.difCustomLink = [];
	if (hasVal(_dosObj.difCustomLink)) {
		splitLF2(_dosObj.difCustomLink).forEach(val => {
			const commaPos = val.indexOf(`,`);
			if (commaPos < 0) return;
			const idxStr = trimStr(val.slice(0, commaPos));
			const linkStr = val.slice(commaPos + 1);
			const idx = setIntVal(idxStr, -1);
			if (!Number.isFinite(idx) || idx < 0 || idx >= obj.difLabels.length) return;
			const safeHref = sanitizeCustomLink(linkStr);
			if (safeHref !== undefined) {
				obj.difCustomLink[idx] = safeHref;
			}
		});
	}

	// 譜面変更セレクターの利用有無
	obj.difSelectorUse = getDifSelectorUse(_dosObj.difSelectorUse, obj.viewLists);

	// 初期速度の設定
	g_stateObj.speed = obj.initSpeeds[g_stateObj.scoreId];
	g_settings.speedNum = roundZero(g_settings.speeds.findIndex(speed => speed === g_stateObj.speed));

	// グラデーションのデフォルト中間色を設定
	divRoot.appendChild(createDivCss2Label(`dummyLabel`, ``));
	obj.baseBrightFlg = setBoolVal(_dosObj.baseBright, checkLightOrDark(colorNameToCode(window.getComputedStyle(dummyLabel, ``).color)));
	const intermediateColor = obj.baseBrightFlg ? `#111111` : `#eeeeee`;

	// 矢印の色変化を常時グラデーションさせる設定
	obj.defaultColorgrd = [false, intermediateColor];
	if (hasVal(_dosObj.defaultColorgrd)) {
		obj.defaultColorgrd = _dosObj.defaultColorgrd.split(`,`);
		obj.defaultColorgrd[0] = setBoolVal(obj.defaultColorgrd[0]);
		obj.defaultColorgrd[1] = obj.defaultColorgrd[1] ?? intermediateColor;
	}
	g_rankObj.rankColorAllPerfect = intermediateColor;

	// カラーコードのゼロパディング有無設定
	obj.colorCdPaddingUse = setBoolVal(_dosObj.colorCdPaddingUse);

	// 最大ライフ
	obj.maxLifeVal = setVal(_dosObj.maxLifeVal, C_VAL_MAXLIFE, C_TYP_FLOAT);
	if (obj.maxLifeVal <= 0) {
		obj.maxLifeVal = C_VAL_MAXLIFE;
		makeWarningWindow(g_msgInfoObj.E_0042.split(`{0}`).join(`maxLifeVal`));
	}

	// ゲージ初期設定（最大ライフ反映）
	g_gaugeOptionObj.defaultList.forEach(type => {
		const pos = g_gaugeOptionObj[`dmg${toCapitalize(type)}`].findIndex(val => val === C_LFE_MAXLIFE);
		g_gaugeOptionObj[`dmg${toCapitalize(type)}`][pos] = obj.maxLifeVal;
	});

	// フリーズアローのデフォルト色セットの利用有無 (true: 使用, false: 矢印色を優先してセット)
	obj.defaultFrzColorUse = setBoolVal(_dosObj.defaultFrzColorUse ?? g_presetObj.frzColors, true);

	// 矢印色変化に対応してフリーズアロー色を追随する範囲の設定
	// (defaultFrzColorUse=false時のみ)
	obj.frzScopeFromArrowColors = [];

	if (!obj.defaultFrzColorUse) {
		const tmpFrzScope = [];

		if (hasVal(_dosObj.frzScopeFromAC)) {
			tmpFrzScope.push(..._dosObj.frzScopeFromAC.split(`,`));
		} else if (g_presetObj.frzScopeFromAC !== undefined) {
			tmpFrzScope.push(...g_presetObj.frzScopeFromAC);
		}
		tmpFrzScope.filter(type => [`Normal`, `Hit`].includes(type))
			.forEach(data => obj.frzScopeFromArrowColors.push(data));
	}

	// 初期色情報
	const baseColor = (obj.baseBrightFlg ? `light` : `dark`);
	Object.assign(g_dfColorObj, g_dfColorBaseObj[baseColor]);
	Object.keys(g_dfColorObj).forEach(key => obj[key] = g_dfColorObj[key].concat());
	obj.frzColorDefault = [];

	// ダミー用初期矢印色
	obj.setDummyColor = [`#777777`, `#444444`, `#777777`, `#444444`, `#777777`];
	obj.dfColorgrdSet = {
		'': obj.defaultColorgrd,
		'Type0': [!obj.defaultColorgrd[0], obj.defaultColorgrd[1]],
	};

	// カスタムゲージ設定（共通設定ファイル）
	addGaugeFulls(g_gaugeOptionObj.survival);
	addGaugeFulls(g_gaugeOptionObj.border);

	if (g_presetObj.gaugeList !== undefined) {
		Object.keys(g_presetObj.gaugeList).forEach(key => {
			g_gaugeOptionObj.customDefault.push(key);
			g_gaugeOptionObj.varCustomDefault.push(boolToSwitch(g_presetObj.gaugeList[key] === `V`));
		});
		g_gaugeOptionObj.custom = g_gaugeOptionObj.customDefault.concat();
		g_gaugeOptionObj.varCustom = g_gaugeOptionObj.varCustomDefault.concat();
		addGaugeFulls(g_gaugeOptionObj.customDefault);
	}

	// カスタムゲージ設定、初期色設定（譜面ヘッダー）の譜面別設定
	Object.assign(obj, resetBaseColorList(obj, _dosObj));
	for (let j = 0; j < obj.difLabels.length; j++) {
		Object.assign(g_gaugeOptionObj, resetCustomGauge(_dosObj, { scoreId: j }));
		Object.assign(obj, resetBaseColorList(obj, _dosObj, { scoreId: j }));
	}

	// ダミー譜面の設定
	if (hasVal(_dosObj.dummyId)) {
		obj.dummyScoreNos = _dosObj.dummyId.split(`$`);
	}

	// 無音のフレーム数
	obj.blankFrameDefs = [200];
	if (isNaN(parseFloat(_dosObj.blankFrame))) {
	} else {
		obj.blankFrameDefs = splitLF2(_dosObj.blankFrame).map(val => parseInt(val));
	}
	obj.blankFrame = obj.blankFrameDefs[0];
	obj.blankFrameDef = obj.blankFrameDefs[0];

	// 開始フレーム数（0以外の場合はフェードインスタート）、終了フレーム数
	[`startFrame`, `endFrame`].filter(tmpParam => hasVal(_dosObj[tmpParam]))
		.forEach(param => obj[param] = splitLF2(_dosObj[param]).map(frame => transTimerToFrame(frame)));

	// フェードアウトフレーム数(譜面別)
	if (hasVal(_dosObj.fadeFrame)) {
		const fadeFrames = splitLF2(_dosObj.fadeFrame);
		obj.fadeFrame = [];
		fadeFrames.forEach((fadeInfo, j) => {
			obj.fadeFrame[j] = fadeInfo.split(`,`);
			obj.fadeFrame[j][0] = transTimerToFrame(obj.fadeFrame[j][0]);
		});
	}

	// タイミング調整
	obj.adjustment = (hasVal(_dosObj.adjustment) ? _dosObj.adjustment.split(`$`) : [0]);

	// 再生速度
	obj.playbackRate = setVal(_dosObj.playbackRate, 1, C_TYP_FLOAT);
	if (obj.playbackRate <= 0) {
		obj.playbackRate = 1;
		makeWarningWindow(g_msgInfoObj.E_0042.split(`{0}`).join(`playbackRate`));
	}

	// プレイサイズ(X方向, Y方向)
	obj.playingWidth = setIntVal(_dosObj.playingWidth, g_presetObj.playingWidth ?? `default`);
	const tmpPlayingHeight = setIntVal(_dosObj.playingHeight, g_presetObj.playingHeight ?? g_sHeight);
	obj.playingHeight = Math.max(obj.heightVariable ?
		setIntVal(getQueryParamVal(`h`) - (g_sHeight - tmpPlayingHeight), tmpPlayingHeight) : tmpPlayingHeight, 400);

	// プレイ左上位置(X座標, Y座標)
	obj.playingX = setIntVal(_dosObj.playingX, g_presetObj.playingX ?? 0);
	obj.playingY = setIntVal(_dosObj.playingY, g_presetObj.playingY ?? 0);

	// ステップゾーン位置
	g_posObj.stepY = setVal(_dosObj.stepY, C_STEP_Y, C_TYP_FLOAT);
	g_posObj.stepYR = setVal(_dosObj.stepYR, C_STEP_YR, C_TYP_FLOAT);
	g_posObj.stepDiffY = g_posObj.stepY - C_STEP_Y;
	g_posObj.distY = obj.playingHeight - C_STEP_Y + g_posObj.stepYR;
	g_posObj.reverseStepY = g_posObj.distY - g_posObj.stepY - g_posObj.stepDiffY - C_ARW_WIDTH;
	g_posObj.arrowHeight = obj.playingHeight + g_posObj.stepYR - g_posObj.stepDiffY * 2;
	obj.bottomWordSetFlg = setBoolVal(_dosObj.bottomWordSet);

	// ウィンドウサイズ(高さ)とステップゾーン位置の組み合わせで基準速度を変更
	obj.baseSpeed = 1 + ((g_posObj.distY - (g_posObj.stepY - C_STEP_Y) * 2) / (500 - C_STEP_Y) - 1) * 0.85;

	// 矢印・フリーズアロー判定位置補正
	g_diffObj.arrowJdgX = setVal(_dosObj.arrowJdgX, 0, C_TYP_FLOAT);
	g_diffObj.arrowJdgY = setVal(_dosObj.arrowJdgY, 0, C_TYP_FLOAT);
	g_diffObj.frzJdgX = setVal(_dosObj.frzJdgX, 0, C_TYP_FLOAT);
	g_diffObj.frzJdgY = setVal(_dosObj.frzJdgY, 0, C_TYP_FLOAT);
	g_diffInitObj.arrowJdgX = g_diffObj.arrowJdgX;
	g_diffInitObj.arrowJdgY = g_diffObj.arrowJdgY;
	g_diffInitObj.frzJdgX = g_diffObj.frzJdgX;
	g_diffInitObj.frzJdgY = g_diffObj.frzJdgY;

	// ショートカット表示位置補正
	g_diffObj.shortcutX = setVal(_dosObj.shortcutX, 0, C_TYP_FLOAT);
	g_diffObj.shortcutY = setVal(_dosObj.shortcutY, 0, C_TYP_FLOAT);
	g_diffInitObj.shortcutX = g_diffObj.shortcutX;
	g_diffInitObj.shortcutY = g_diffObj.shortcutY;

	if (Object.keys(g_diffObj).some(key => g_localStorage[key] !== undefined)) {
		Object.keys(g_diffObj).forEach(key =>
			g_diffObj[key] = setIntVal(g_localStorage[key], g_diffObj[key])
		);
	}

	// musicフォルダ設定
	obj.musicFolder = _dosObj.musicFolder ?? (g_remoteFlg ? `${C_MRK_CURRENT_DIRECTORY}../music` : `music`);

	// 楽曲URL
	if (hasVal(_dosObj.musicUrl)) {
		const musicUrls = splitLF2(_dosObj.musicUrl);
		obj.musicUrls = [], obj.musicStarts = [], obj.musicEnds = [];
		musicUrls.forEach((val, j) => {
			const musicUrlPair = val.split(`,`);
			obj.musicUrls[j] = musicUrlPair[0] || ``;
			if (musicUrlPair[1] !== undefined) {
				const musicBGMTime = musicUrlPair[1].split(`-`).map(str => str.trim());
				obj.musicStarts[j] = Math.floor(transTimerToFrame(musicBGMTime[0] ?? 0) / g_fps);
				obj.musicEnds[j] = musicBGMTime[1] !== undefined ?
					Math.floor((transTimerToFrame(musicBGMTime[1] ?? 0)) / g_fps) :
					Math.floor((transTimerToFrame(musicBGMTime[0] ?? 0) + transTimerToFrame(`0:20`)) / g_fps);
			} else {
				obj.musicStarts[j] = 0;
				obj.musicEnds[j] = 20;
			}
		});
	} else {
		makeWarningWindow(g_msgInfoObj.E_0031);
	}

	// ハッシュタグ
	obj.hashTag = _dosObj.hashTag ?? ``;

	// 読込対象の画像を指定(rel:preload)と同じ
	obj.preloadImages = [];
	if (hasVal(_dosObj.preloadImages)) {
		obj.preloadImages = _dosObj.preloadImages.split(`,`).filter(image => hasVal(image)).map(preloadImage => preloadImage);
	}

	// 初期表示する部分キーの設定
	obj.keyGroupOrder = [];
	_dosObj.keyGroupOrder?.split(`$`).forEach((val, j) => {
		if (val !== ``) {
			obj.keyGroupOrder[j] = val.split(`,`);
		}
	});

	// 縦伸縮率の設定
	const stretchYRate = [];
	_dosObj.stretchYRate?.split(`$`).forEach((val, j) => {
		stretchYRate[j] = hasVal(val) ? setVal(val, 1, C_TYP_FLOAT) : 1;
	});
	obj.stretchYRate = makeBaseArray(stretchYRate, obj.difLabels.length, 1);
	// 最終演出表示有無（noneで無効化）
	obj.finishView = _dosObj.finishView ?? ``;

	// 更新日
	obj.releaseDate = _dosObj.releaseDate ?? ``;

	// デフォルトReady/リザルト表示の遅延時間設定
	[`ready`, `result`].forEach(objName =>
		obj[`${objName}DelayFrame`] = setIntVal(_dosObj[`${objName}DelayFrame`]));

	// デフォルトReady表示のアニメーション時間設定
	obj.readyAnimationFrame = setIntVal(_dosObj.readyAnimationFrame, 150);

	// デフォルトReady表示のアニメーション名
	obj.readyAnimationName = _dosObj.readyAnimationName ?? `leftToRightFade`;

	// デフォルトReady表示の先頭文字色
	obj.readyColor = _dosObj.readyColor ?? ``;

	// デフォルトReady表示を上書きするテキスト
	obj.readyHtml = _dosObj.readyHtml ?? ``;

	// デフォルト曲名表示のフォントサイズ
	obj.titlesize = getHeader(_dosObj, ...getHname(`titleSize`)) ?? ``;

	// デフォルト曲名表示のフォント名
	// (使用例： |titlefont=Century,Meiryo UI|)
	obj.titlefonts = g_titleLists.defaultFonts.concat();
	getHeader(_dosObj, ...getHname(`titleFont`))?.split(`$`).forEach((font, j) => obj.titlefonts[j] = `'${(font.replaceAll(`,`, `', '`))}'`);
	if (obj.titlefonts[1] === undefined) {
		obj.titlefonts[1] = obj.titlefonts[0];
	}

	// デフォルト曲名表示, 背景矢印のグラデーション指定css
	[`titlegrd`, `titleArrowgrd`].forEach(_name => {
		const objName = `${_name.toLowerCase()}`;
		obj[`${objName}s`] = [];
		const tmpTitlegrd = getHeader(_dosObj, ...getHname(_name))?.replaceAll(`,`, `:`);
		if (hasVal(tmpTitlegrd)) {
			obj[`${objName}s`] = tmpTitlegrd.split(`$`);
			obj[`${objName}`] = obj[`${objName}s`][0] ?? ``;
		}
	});

	// デフォルト曲名表示の表示位置調整
	obj.titlepos = [[0, 0], [0, 0]];
	getHeader(_dosObj, ...getHname(`titlePos`))?.split(`$`).forEach((pos, j) => obj.titlepos[j] = pos.split(`,`).map(x => parseFloat(x)));

	// タイトル文字のアニメーション設定
	obj.titleAnimationName = [`leftToRight`];
	obj.titleAnimationDuration = [1.5];
	obj.titleAnimationDelay = [0];
	obj.titleAnimationTimingFunction = [`ease`];
	obj.titleAnimationClass = [``];

	getHeader(_dosObj, ...getHname(`titleAnimation`))?.split(`$`).forEach((pos, j) => {
		const titleAnimation = pos.split(`,`);
		obj.titleAnimationName[j] = setVal(titleAnimation[0], obj.titleAnimationName[0]);
		obj.titleAnimationDuration[j] = setVal(titleAnimation[1] / g_fps, obj.titleAnimationDuration[0], C_TYP_FLOAT);
		obj.titleAnimationDelay[j] = setVal(titleAnimation[2] / g_fps, obj.titleAnimationDelay[0], C_TYP_FLOAT);
		obj.titleAnimationTimingFunction[j] = setVal(titleAnimation[3], obj.titleAnimationName[3]);
	});
	getHeader(_dosObj, ...getHname(`titleAnimationClass`))?.split(`$`).forEach((animationClass, j) =>
		obj.titleAnimationClass[j] = animationClass ?? ``);

	if (obj.titleAnimationName.length === 1) {
		g_titleLists.animation.forEach(pattern =>
			obj[`titleAnimation${pattern}`][1] = obj[`titleAnimation${pattern}`][0]);
	}
	if (obj.titleAnimationClass.length === 1) {
		obj.titleAnimationClass[1] = obj.titleAnimationClass[0];
	}

	// デフォルト曲名表示の複数行時の縦間隔
	obj.titlelineheight = setIntVal(getHeader(_dosObj, ...getHname(`titleLineHeight`)), ``);

	// フリーズアローの始点で通常矢印の判定を行うか(dotさんソース方式)
	obj.frzStartjdgUse = setBoolVal(_dosObj.frzStartjdgUse ?? g_presetObj.frzStartjdgUse);

	// 空押し判定の設定
	// excessiveUses   : 譜面毎の空押し有効化設定
	// excessiveJdgUses: 譜面毎の空押し初期設定
	obj.excessiveUses = [];
	obj.excessiveJdgUses = [];
	splitLF2(_dosObj.excessiveUse)?.forEach(val => {
		const tmpVal = val.split(`,`);
		obj.excessiveUses.push(setBoolVal(tmpVal[0]));
		obj.excessiveJdgUses.push(setVal(tmpVal[1], C_FLG_OFF, C_TYP_SWITCH) === C_FLG_ON);
	});
	if ((obj.excessiveUses?.length || 0) < obj.difLabels.length) {
		obj.excessiveUses = makeBaseArray(obj.excessiveUses, obj.difLabels.length,
			setBoolVal(obj.excessiveUses?.[0] ?? _dosObj.excessiveUse ?? g_presetObj.excessiveUse, true));
		obj.excessiveJdgUses = makeBaseArray(obj.excessiveJdgUses, obj.difLabels.length,
			setBoolVal(obj.excessiveJdgUses?.[0] ?? g_presetObj.excessiveJdgUse ?? false));
	}

	// excessiveJdgUseが有効な場合は全譜面に対して強制的に上書き
	if (_dosObj.excessiveJdgUse !== undefined) {
		const excessiveJdg = setBoolVal(_dosObj.excessiveJdgUse);
		if (excessiveJdg) {
			obj.excessiveJdgUses = obj.excessiveJdgUses.map(val => true);
		}
	}
	obj.excessiveJdgUse = obj.excessiveJdgUses[0];
	g_stateObj.excessive = boolToSwitch(obj.excessiveJdgUse);
	g_settings.excessiveNum = Number(obj.excessiveJdgUse);

	// 譜面名に制作者名を付加するかどうかのフラグ（選曲用に初期値を退避）
	obj.makerView = setBoolVal(_dosObj.makerView);
	obj.makerViewOrg = obj.makerView;

	// shuffleUse=group 時のみshuffle用配列を組み替える
	if (_dosObj.shuffleUse === `group`) {
		_dosObj.shuffleUse = true;
		g_settings.shuffles = g_settings.shuffles.filter(val => !val.endsWith(`+`));
	}

	// オプション利用可否設定
	g_canDisabledSettings.forEach(option =>
		obj[`${option}Use`] = setBoolVal(_dosObj[`${option}Use`] ?? g_presetObj.settingUse?.[option], true));

	let interlockingErrorFlg = false;
	g_displays.forEach((option, j) => {

		// Display使用可否設定を分解 |displayUse=false,ON|
		const displayTempUse = _dosObj[`${option}Use`] ?? g_presetObj.settingUse?.[option] ?? `true`;
		const displayUse = displayTempUse?.split(`,`) ?? [true, C_FLG_ON];

		// displayUse -> ボタンの有効/無効, displaySet -> ボタンの初期値(ON/OFF)
		obj[`${option}Use`] = setBoolVal(displayUse[0], true);
		obj[`${option}Set`] = setVal(displayUse.length > 1 ? displayUse[1] :
			boolToSwitch(obj[`${option}Use`]), ``, C_TYP_SWITCH);
		g_stateObj[`d_${option.toLowerCase()}`] = setVal(obj[`${option}Set`], C_FLG_ON, C_TYP_SWITCH);
		obj[`${option}ChainOFF`] = _dosObj[`${option}ChainOFF`]?.split(`,`) ?? [];

		// Displayのデフォルト設定で、双方向に設定されている場合は設定をブロック
		g_displays.filter((option2, k) =>
			j > k && (obj[`${option}ChainOFF`].includes(option2) && obj[`${option2}ChainOFF`].includes(option)))
			.forEach(() => {
				interlockingErrorFlg = true;
				makeWarningWindow(g_msgInfoObj.E_0051);
			});
		if (!interlockingErrorFlg && obj[`${option}ChainOFF`].includes(option)) {
			interlockingErrorFlg = true;
			makeWarningWindow(g_msgInfoObj.E_0051);
		}
	});

	if (!interlockingErrorFlg) {
		g_displays.forEach(option =>
			obj[`${option}ChainOFF`].forEach(defaultOption => {
				g_stateObj[`d_${defaultOption.toLowerCase()}`] = C_FLG_OFF;
				interlockingButton(obj, defaultOption, C_FLG_OFF, C_FLG_ON);
			}));
	}
	obj.arrowEffectUseOrg = obj.arrowEffectUse;
	obj.arrowEffectSetFlg = obj.arrowEffectSet === C_FLG_ON;

	// ローカルストレージに保存済みのColorType設定からDisplayのColor設定を反映
	if (g_localStorage.colorType !== undefined) {
		g_colorType = g_keycons.colorTypes.concat(g_keycons.colorSelf).includes(g_localStorage.colorType)
			? g_localStorage.colorType : `Default`;
		if (obj.colorUse) {
			g_stateObj.d_color = boolToSwitch(g_keycons.colorDefTypes.includes(g_colorType));
		}
	}

	// 別キーパターンの使用有無
	obj.transKeyUse = setBoolVal(_dosObj.transKeyUse, true);

	// タイトル画面用・背景/マスクデータの分解 (下記すべてで1セット、改行区切り)
	// [フレーム数,階層,背景パス,class(CSSで別定義),X,Y,width,height,opacity,animationName,animationDuration]
	g_animationData.forEach(sprite => {
		obj[`${sprite}TitleData`] = [];
		obj[`${sprite}TitleMaxDepth`] = -1;

		const dataList = [_dosObj[`${sprite}title${g_localeObj.val}_data`], _dosObj[`${sprite}title_data`]];
		const data = dataList.find((v) => v !== undefined);
		if (hasVal(data)) {
			[obj[`${sprite}TitleData`], obj[`${sprite}TitleMaxDepth`]] = g_animationFunc.make[sprite](data);
		}
	});

	// 結果画面用のマスク透過設定
	obj.masktitleButton = setBoolVal(_dosObj.masktitleButton);

	// 結果画面用のマスク透過設定
	obj.maskresultButton = setBoolVal(_dosObj.maskresultButton);

	// リザルトモーションをDisplay:BackgroundのON/OFFと連動させるかどうかの設定
	obj.resultMotionSet = setBoolVal(_dosObj.resultMotionSet, true);

	// 譜面明細の使用可否
	const tmpDetails = getHeader(_dosObj, `scoreDetailUse`, `chartDetailUse`)?.split(`,`).filter(val => hasVal(val) && val !== `false`)
		.map(val => replaceStr(val, g_settings.scoreDetailTrans));
	g_settings.scoreDetails = g_settings.scoreDetailDefs.filter(val => tmpDetails?.includes(val) || tmpDetails === undefined);

	g_stateObj.scoreDetail = g_settings.scoreDetails[0] || ``;
	g_settings.scoreDetailCursors = g_settings.scoreDetails.map(val => `lnk${val}G`);
	g_settings.scoreDetailCursorsOrg = g_settings.scoreDetailCursors.concat();
	g_settings.scoreDetailCursors.push(`btnGraphB`);
	[`option`, `difSelector`, `scoreDetail`].forEach(page => g_shortcutObj[page].KeyQ.id = g_settings.scoreDetailCursors[0]);
	g_shortcutObj.scoreDetail.ArrowDown.id = g_settings.scoreDetailCursorsOrg[nextPos(0, 1, g_settings.scoreDetailCursorsOrg.length)];
	g_shortcutObj.scoreDetail.ArrowUp.id = g_settings.scoreDetailCursorsOrg[nextPos(0, -1, g_settings.scoreDetailCursorsOrg.length)];

	// 判定位置をBackgroundのON/OFFと連動してリセットする設定
	obj.jdgPosReset = setBoolVal(_dosObj.jdgPosReset, true);

	// タイトル表示用コメント
	const newlineTag = setBoolVal(_dosObj.commentAutoBr, true) ? `<br>` : ``;
	const tmpComment = (_dosObj[`commentVal${g_localeObj.val}`] ?? _dosObj.commentVal ?? ``).split(`\r\n`).join(`\n`);
	obj.commentVal = tmpComment.split(`\n`).join(newlineTag);

	const maxMusicNo = Math.max(...obj.musicNos);
	for (let j = 0; j <= maxMusicNo; j++) {
		obj[`commentVal${j}`] = (_dosObj[`commentVal${j}`] || ``).split(`\n`)
			.filter((val, k) => k !== 0 || val !== ``).join(`<br>`);
	}

	// コメントの外部化設定
	obj.commentExternal = setBoolVal(_dosObj.commentExternal);

	// Reverse時の歌詞の自動反転制御
	obj.wordAutoReverse = _dosObj.wordAutoReverse ?? g_presetObj.wordAutoReverse ?? C_DIS_AUTO;

	// プレイ中クレジットを表示しないエリアのサイズ(X方向)
	obj.customViewWidth = setVal(_dosObj.customViewWidth ?? _dosObj.customCreditWidth, 0, C_TYP_FLOAT);

	// ショートカットキーが既定値ではない場合の左右の拡張エリアのサイズ
	if (hasVal(_dosObj.scArea)) {
		const tmp = _dosObj.scArea.split(`,`);
		obj.scAreaWidth = setVal(tmp[0], 0, C_TYP_FLOAT);
		obj.playingLayout = tmp[1] !== `left`;
	} else {
		obj.scAreaWidth = g_presetObj.scAreaWidth ?? 0;
		obj.playingLayout = g_presetObj.playingLayout ?? true;
	}

	// ジャストフレームの設定 (ローカル/デバッグ時: 0フレーム, 通常時: 1フレーム以内)
	obj.justFrames = g_isDebug ? 0 : 1;

	// リザルトデータのカスタマイズ
	obj.resultFormat = escapeHtmlForEnabledTag(_dosObj.resultFormat ?? g_presetObj.resultFormat ?? g_templateObj.resultFormatDf);

	// リザルト画像データのカスタム設定
	obj.resultValsView = _dosObj.resultValsView?.split(`,`) ?? g_presetObj.resultValsView ?? Array.from(Object.keys(g_presetObj.resultVals ?? {}));

	// フェードイン時にそれ以前のデータを蓄積しない種別(word, back, mask)を指定
	obj.unStockCategories = (_dosObj.unStockCategory ?? ``).split(`,`);
	if (g_presetObj.unStockCategories !== undefined) {
		obj.unStockCategories = makeDedupliArray(obj.unStockCategories, g_presetObj.unStockCategories);
	}
	g_fadeinStockList = g_fadeinStockList.filter(cg => obj.unStockCategories.indexOf(cg) === -1);

	// フェードイン時にそれ以前のデータを蓄積しないパターンを指定
	if (g_presetObj.stockForceDelList !== undefined) {
		Object.assign(g_stockForceDelList, g_presetObj.stockForceDelList);
	}
	g_fadeinStockList.filter(type => hasVal(_dosObj[`${type}StockForceDel`]))
		.forEach(type => g_stockForceDelList[type] = makeDedupliArray(g_stockForceDelList[type], _dosObj[`${type}StockForceDel`].split(`,`)));

	return obj;
};

/**
 * 譜面リスト作成有無の状態を取得
 * @param {boolean} _headerFlg 
 * @param {number[]} _viewLists 
 * @returns {boolean}
 */
const getDifSelectorUse = (_headerFlg, _viewLists = g_headerObj.viewLists) => setBoolVal(_headerFlg, _viewLists.length > 5);

/**
 * カラーセットの格納
 * @param {string} object._from コピー元矢印カラーセット（の譜面番号）
 * @param {string} object._to コピー先矢印のカラーセット（の譜面番号）
 * @param {object} object._fromObj コピー元オブジェクト
 * @param {object} object._toObj コピー先オブジェクト
 */
const resetColorType = ({ _from = ``, _to = ``, _fromObj = g_headerObj, _toObj = g_headerObj } = {}) => {
	_toObj[`setColor${_to}`] = structuredClone(_fromObj[`setColor${_from}`]);
	_toObj[`setShadowColor${_to}`] = structuredClone(_fromObj[`setShadowColor${_from}`]);
	_toObj[`frzColor${_to}`] = structuredClone(_fromObj[`frzColor${_from}`]);
	_toObj[`frzShadowColor${_to}`] = structuredClone(_fromObj[`frzShadowColor${_from}`]);
};

/**
 * 配列に対象がいない場合、配列の先頭にその対象を追加
 * @param {string[]|number[]} _arr 検索対象の配列
 * @param {string|number} _target 検索対象
 * @returns {string[]|number[]}
 */
const addValtoArray = (_arr, _target) => {
	if (!_arr.includes(_target)) {
		_arr.unshift(_target);
	}
	return _arr;
};

/**
 * 曲名（1行）の取得
 * @param {string} _musicName 
 * @returns {string}
 */
const getMusicNameSimple = _musicName => replaceStr(_musicName, g_escapeStr.musicNameSimple);

/**
 * 曲名（複数行）の取得
 * @param {string} _musicName 
 * @returns {string[]}
 */
const getMusicNameMultiLine = _musicName => {
	const tmpName = replaceStr(_musicName, g_escapeStr.musicNameMultiLine).split(`<br>`);
	return tmpName.length === 1 ? [tmpName[0], ``] : tmpName;
};

/**
 * 画像セットの入れ替え処理
 * @param {object} _imgType
 * @param {string} _imgType.name
 * @param {string} _imgType.extension
 * @param {string} _imgType.remoteDir
 * @param {boolean} _initFlg  
 */
const updateImgType = (_imgType, _initFlg = false) => {
	if (_initFlg) {
		const baseDir = (_imgType.name === `` ? `` : `${_imgType.name}/`);
		C_IMG_TITLE_ARROW = `../img/${baseDir}arrow.${_imgType.extension}`;
	}
	resetImgs(_imgType.name, _imgType.extension);
	reloadImgObj();
	const orgImgObj = structuredClone(g_imgObj);
	Object.keys(g_imgObj).forEach(key => g_imgObj[key] = `${g_rootPath}${orgImgObj[key]}`);

	// リモート時は作品ページ側にある画像を優先し、リモートに存在するもののみリモートから取得する
	// titleArrowについては他のImgTypeから取得するため、remoteDir属性には依存させない
	if (g_remoteFlg) {
		Object.keys(g_imgObj).forEach(key => g_imgObj[key] = `${g_workPath}${orgImgObj[key]}`);
		if (_imgType.remoteDir !== `` && hasRemoteDomain(_imgType.remoteDir)) {
			g_defaultSets.imgList.filter(val => val !== `titleArrow`)
				.forEach(key => g_imgObj[key] = `${_imgType.remoteDir}img/${orgImgObj[key]}`);
		} else if (g_defaultSets.imgType.findIndex(val => val === _imgType.name) >= 0) {
			g_defaultSets.imgList.forEach(key => g_imgObj[key] = `${g_rootPath}${orgImgObj[key]}`);
		}
	}
	if (_imgType.extension === undefined && g_presetObj.overrideExtension !== undefined) {
		Object.keys(g_imgObj).forEach(key => g_imgObj[key] = `${g_imgObj[key].slice(0, -3)}${g_presetObj.overrideExtension}`);
	}
	if (!g_isFile) {
		g_imgInitList.forEach(img => preloadFile(`image`, g_imgObj[img]));
	}
};

/**
 * ゲージ設定リストへの追加
 * @param {object} _obj
 */
const addGaugeFulls = _obj => _obj.map(key => g_gaugeOptionObj.customFulls[key] = false);

/**
 * 矢印・フリーズアロー色のデータ変換
 * @param {object} _baseObj 
 * @param {object} _dosObj
 * @param {string} [object.scoreId=''] 
 * @param {boolean} [object.scoreLockFlg=g_stateObj.scoreLockFlg]
 * @returns {object} ※Object.assign(obj, resetBaseColorList(...))の形で呼び出しが必要
 */
const resetBaseColorList = (_baseObj, _dosObj, { scoreId = ``, scoreLockFlg = g_stateObj.scoreLockFlg } = {}) => {

	const obj = {};
	const idHeader = setScoreIdHeader(scoreId, scoreLockFlg, scoreId !== ``);
	const getRefData = (_header, _dataName) => {
		const data = _dosObj[`${_header}${_dataName}`];
		return data?.startsWith(_header) ? _dosObj[data] : data;
	}

	[``, `Shadow`].forEach(pattern => {
		const _arrowCommon = `set${pattern}Color`;
		const _frzCommon = `frz${pattern}Color`;

		const _name = `${_arrowCommon}${idHeader}`;
		const _frzName = `${_frzCommon}${idHeader}`;
		const _arrowInit = `${_arrowCommon}Init`;
		const _frzInit = `${_frzCommon}Init`;

		const arrowColorTxt = getRefData(_arrowCommon, idHeader) || _dosObj[_arrowCommon];
		const frzColorTxt = getRefData(_frzCommon, idHeader) || _dosObj[_frzCommon];

		// 矢印色
		Object.keys(_baseObj.dfColorgrdSet).forEach(type => {
			[obj[`${_name}${type}`], obj[`${_name}Str${type}`], obj[`${_name}Org${type}`]] =
				setColorList(arrowColorTxt, _baseObj[_arrowInit], _baseObj[_arrowInit].length, {
					_defaultColorgrd: _baseObj.dfColorgrdSet[type],
					_colorCdPaddingUse: _baseObj.colorCdPaddingUse,
					_shadowFlg: pattern === `Shadow`,
				});

			obj[`${_frzName}${type}`] = [];
			obj[`${_frzName}Str${type}`] = [];
			obj[`${_frzName}Org${type}`] = [];
		});

		// フリーズアロー色
		const tmpFrzColors = (frzColorTxt !== undefined ? splitLF2(frzColorTxt) : []);
		const firstFrzColors = tmpFrzColors[0]?.split(`,`) ?? [];

		for (let j = 0; j < _baseObj.setColorInit.length; j++) {

			// デフォルト配列の作成（1番目の要素をベースに、フリーズアロー初期セット or 矢印色からデータを補完）
			const currentFrzColors = [];
			const baseLength = firstFrzColors.length === 0 || _baseObj.defaultFrzColorUse ?
				_baseObj[_frzInit].length : firstFrzColors.length;
			for (let k = 0; k < baseLength; k++) {
				currentFrzColors[k] = setVal(firstFrzColors[k],
					_baseObj.defaultFrzColorUse ? _baseObj[_frzInit][k] : obj[`${_name}Str`][j]);
			}

			Object.keys(_baseObj.dfColorgrdSet).forEach(type =>
				[obj[`${_frzName}${type}`][j], obj[`${_frzName}Str${type}`][j], obj[`${_frzName}Org${type}`][j]] =
				setColorList(tmpFrzColors[j], currentFrzColors, _baseObj[_frzInit].length, {
					_defaultColorgrd: _baseObj.dfColorgrdSet[type],
					_colorCdPaddingUse: _baseObj.colorCdPaddingUse,
					_defaultFrzColorUse: _baseObj.defaultFrzColorUse,
					_objType: `frz`,
					_shadowFlg: pattern === `Shadow`,
				}));
		}

		obj[`${_name}Default`] = obj[_name].concat();
		obj[`${_frzName}Default`] = obj[_frzName].concat();
	});

	return obj;
};

/**
 * 矢印・フリーズアロー色のデータ展開
 * @param {string} _data 
 * @param {string[]} _colorInit 
 * @param {number} _colorInitLength
 * @param {string[]} [object._defaultColorgrd=g_headerObj.defaultColorgrd]
 * @param {boolean} [object._colorCdPaddingUse=false]
 * @param {boolean} [object._defaultFrzColorUse=true]
 * @param {string} [object._objType='normal']
 * @param {boolean} [object._shadowFlg=false]
 * @returns {string[][]}
 */
const setColorList = (_data, _colorInit, _colorInitLength,
	{ _defaultColorgrd = g_headerObj.defaultColorgrd, _colorCdPaddingUse = false,
		_defaultFrzColorUse = true, _objType = `normal`, _shadowFlg = false } = {}) => {

	// グラデーション文字列 #ffff99:#9999ff@linear-gradient
	let colorStr = [];

	// カラーコード抽出用 #ffff99 - Ready文字、背景矢印のデフォルト色で使用
	let colorOrg = [];

	// グラデーション適用後文字列 linear-gradient(to right, #ffff99, #9999ff)
	let colorList = [];

	// 譜面側で指定されているデータを配列に変換
	if (hasVal(_data)) {
		colorList = _data.split(`,`);
		colorStr = colorList.concat();

		// データ補完処理
		const defaultLength = colorStr.length;
		if (_objType === `frz` && _defaultFrzColorUse) {
			// デフォルト配列に満たない・足りない部分はデフォルト配列で穴埋め
			for (let j = 0; j < _colorInitLength; j++) {
				if (!hasVal(colorStr[j])) {
					colorStr[j] = _colorInit[j];
				}
			}
		} else {
			// デフォルト配列長をループさせて格納
			for (let j = 0; j < _colorInitLength; j++) {
				colorStr[j] = colorStr[j % defaultLength];
			}
		}
		colorList = colorStr.concat();

		for (let j = 0; j < colorList.length; j++) {
			const tmpSetColorOrg = colorStr[j].replaceAll(`0x`, `#`).split(`:`);
			const hasColor = tmpSetColorOrg.some(tmpColorOrg => {
				if (hasVal(tmpColorOrg) && (isColorCd(tmpColorOrg) || !hasAnglePointInfo(tmpColorOrg) || tmpColorOrg === `Default`)) {
					colorOrg[j] = colorCdPadding(_colorCdPaddingUse, colorToHex(tmpColorOrg));
					return true;
				}
			});
			if (!hasColor) {
				colorOrg[j] = _colorInit[j];
			}
			colorList[j] = makeColorGradation(colorStr[j] === `` ? _colorInit[j] : colorStr[j], {
				_defaultColorgrd, _colorCdPaddingUse, _objType, _shadowFlg,
			});
		}

	} else {

		// 未定義の場合は指定されたデフォルト配列(_colorInit)で再定義
		colorStr = _colorInit.concat();
		colorOrg = _colorInit.concat();
		colorList = _colorInit.map(colorStr => makeColorGradation(colorStr, {
			_defaultColorgrd, _colorCdPaddingUse, _shadowFlg,
		}));
	}

	return [colorList, colorStr, colorOrg];
};

/**
 * 複合カスタムゲージの定義設定
 * |customGauge=_Original::F::Original,_Normal::V::Normal,Escape::V|
 * @param {object} _dosObj 
 * @param {string} [object.scoreId=0]
 * @returns {object} ※Object.assign(obj, resetCustomGauge(...))の形で呼び出しが必要
 */
const resetCustomGauge = (_dosObj, { scoreId = 0 } = {}) => {

	const obj = {};
	const scoreIdHeader = setScoreIdHeader(scoreId, g_stateObj.scoreLockFlg, false);
	const dosCustomGauge = _dosObj[`customGauge${scoreIdHeader}`];
	if (hasVal(dosCustomGauge)) {
		if (g_gaugeOptionObj.defaultPlusList.includes(dosCustomGauge)) {
			obj[`custom${scoreId}`] = g_gaugeOptionObj[dosCustomGauge].concat();
			obj[`varCustom${scoreId}`] = g_gaugeOptionObj[`var${toCapitalize(dosCustomGauge)}`].concat();
			if (g_gaugeOptionObj.defaultList.includes(dosCustomGauge)) {
				obj[`defaultGauge${scoreId}`] = dosCustomGauge;
				obj[`typeCustom${scoreId}`] = g_gaugeOptionObj[`type${toCapitalize(dosCustomGauge)}`].concat();
			}
		} else {
			const customGauges = dosCustomGauge.split(`,`);

			obj[`custom${scoreId}`] = [];
			obj[`varCustom${scoreId}`] = [];

			for (let j = 0; j < customGauges.length; j++) {
				const customGaugeSets = customGauges[j].split(`::`);
				obj[`custom${scoreId}`][j] = customGaugeSets[0];
				obj[`varCustom${scoreId}`][j] = boolToSwitch(customGaugeSets[1] === `V`);
				if (hasVal(customGaugeSets[2])) {
					g_lblNameObj[`u_${customGaugeSets[0]}`] = customGaugeSets[2];
				}
			}
			if (scoreId === 0) {
				obj.custom = obj.custom0.concat();
				obj.varCustom = obj.varCustom0.concat();
			}
			addGaugeFulls(obj[`custom${scoreId}`]);
		}
	}
	return obj;
};

/**
 * ゲージ別個別設定の取得
 * @param {object} _dosObj 
 * @param {string} _name 
 * @param {number} _difLength
 * @param {string} [object.scoreId=0]
 */
const getGaugeSetting = (_dosObj, _name, _difLength, { scoreId = 0 } = {}) => {

	const obj = {
		lifeBorders: [],
		lifeRecoverys: [],
		lifeDamages: [],
		lifeInits: []
	};
	/** ゲージ設定再作成フラグ */
	let gaugeCreateFlg = false;

	/** ゲージ設定上書きフラグ */
	const gaugeUpdateFlg = g_stateObj.scoreLockFlg && scoreId > 0;

	/**
	 * ゲージ別個別配列への値格納
	 * この時点では各種ゲージ設定は文字列のまま。setGauge関数にて数式に変換される
	 * @param {number} _scoreId 
	 * @param {string[]} _gaugeDetails
	 * @returns {boolean}
	 */
	const setGaugeDetails = (_scoreId, _gaugeDetails) => {

		obj.lifeBorders[_scoreId] = _gaugeDetails[0] === `x` ? `x` : _gaugeDetails[0];
		obj.lifeRecoverys[_scoreId] = _gaugeDetails[1];
		obj.lifeDamages[_scoreId] = _gaugeDetails[2];
		obj.lifeInits[_scoreId] = _gaugeDetails[3];

		if (gaugeUpdateFlg && hasVal(g_gaugeOptionObj[`gauge${_name}s`])) {
			// ゲージ上書き時は_gaugeDetails(obj)の値を優先し、デフォルト値で穴埋めする
			Object.keys(obj).forEach(key => g_gaugeOptionObj[`gauge${_name}s`][key] =
				fillMissingArrayElem(g_gaugeOptionObj[`gauge${_name}s`][key] || [], obj[key]));
			return false;
		}
		return true;
	};

	/**
	 * gaugeNormal2, gaugeEasy2などの個別設定があった場合にその値から配列を作成
	 * @param {number} _scoreId 
	 * @param {number[]} _defaultGaugeList
	 * @returns {number[]}
	 */
	const getGaugeDetailList = (_scoreId, _defaultGaugeList) => {
		if (_scoreId > 0) {
			const idHeader = setScoreIdHeader(_scoreId, g_stateObj.scoreLockFlg, false);
			const dosId = (idHeader || 0) - 1;
			const headerName = `gauge${_name}${idHeader}`;
			if (hasVal(_dosObj[headerName])) {
				const gauges = splitLF2(_dosObj[headerName]);
				return (gauges[dosId] || gauges[0])?.split(`,`);
			}
		}
		return _defaultGaugeList;
	};

	if (hasVal(_dosObj[`gauge${_name}`])) {

		const gauges = splitLF2(_dosObj[`gauge${_name}`]);
		if (gaugeUpdateFlg) {
			gaugeCreateFlg = setGaugeDetails(scoreId, (gauges[scoreId] || gauges[0])?.split(`,`));
		} else {
			for (let j = 0; j < _difLength; j++) {
				gaugeCreateFlg = setGaugeDetails(j, getGaugeDetailList(j, (gauges[j] || gauges[0]).split(`,`)));
			}
		}

	} else if (g_presetObj.gaugeCustom?.[_name] !== undefined) {

		const gaugeDetails = [
			g_presetObj.gaugeCustom[_name].Border, g_presetObj.gaugeCustom[_name].Recovery,
			g_presetObj.gaugeCustom[_name].Damage, g_presetObj.gaugeCustom[_name].Init,
		];
		if (gaugeUpdateFlg) {
			gaugeCreateFlg = setGaugeDetails(scoreId, gaugeDetails);
		} else {
			for (let j = 0; j < _difLength; j++) {
				gaugeCreateFlg = setGaugeDetails(j, getGaugeDetailList(j, gaugeDetails));
			}
		}
	}
	if (gaugeCreateFlg) {
		g_gaugeOptionObj[`gauge${_name}s`] = obj;
	}
};

/**
 * キー名の取得
 * @param {string} _key
 * @returns {string} キー名
 */
const getKeyName = _key => unEscapeHtml(escapeHtml(g_keyObj[`keyName${_key}`]?.[0] ?? _key));

/**
 * キー単位名の取得
 * @param {string} _key 
 * @returns {string} キー単位名(デフォルト: key)
 */
const getKeyUnitName = _key => unEscapeHtml(escapeHtml(g_keyObj[`keyName${_key}`]?.[1] ?? `key`));

/**
 * シャッフル名の取得
 * @returns {string}
 */
const getShuffleName = () => {
	const orgShuffleFlg = getOrgShuffleFlg();
	return `${getStgDetailName(g_stateObj.shuffle)}${!orgShuffleFlg && !g_stateObj.shuffle.endsWith(`+`) ? getStgDetailName('(S)') : ''}`;
};

/**
 * シャッフルカスタムフラグの取得
 * @returns {boolean}
 */
const getOrgShuffleFlg = () => {
	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	return g_keyObj[`shuffle${keyCtrlPtn}`].filter((shuffleGr, j) => shuffleGr !== g_keyObj[`shuffle${keyCtrlPtn}_0d`][j]).length === 0;
};

/**
 * 別キーモード時の表示名の取得
 * @param {boolean} _spaceFlg
 * @returns {string} 別キー名
 */
const getTransKeyName = (_spaceFlg = false) => hasVal(g_keyObj[`transKey${g_keyObj.currentKey}_${g_keyObj.currentPtn}`])
	? (_spaceFlg ? ` ` : ``) + `(${g_keyObj[`transKey${g_keyObj.currentKey}_${g_keyObj.currentPtn}`]})` : ``;

/**
 * ハイスコア定義を行う際のストレージキー名の取得
 * @param {string} _key 
 * @param {string} _transName 
 * @param {string} _assistFlg 
 * @param {string} _mirrorName 
 * @param {string} _scoreId 
 * @returns {string}
 */
const getStorageKeyName = (_key, _transName, _assistFlg, _mirrorName, _scoreId) => {
	let scoreName = `${_key}${_transName}${getStgDetailName('k-')}${g_headerObj.difLabels[_scoreId]}${_assistFlg}${_mirrorName}`;
	if (g_headerObj.makerView) {
		scoreName += `-${g_headerObj.creatorNames[_scoreId]}`;
	}
	return scoreName;
};

/**
 * KeyBoardEvent.code の値をCW Edition用のキーコードに変換
 * 簡略指定ができるように、以下の記述を許容
 * 例) KeyD -> D, ArrowDown -> Down, AltLeft -> Alt
 * @param {string} _kCdN
 * @returns {number}
 */
const getKeyCtrlVal = _kCdN => {
	const convVal = Object.keys(g_kCdN).findIndex(val =>
		[_kCdN, `Key${_kCdN}`, `Arrow${_kCdN}`].includes(g_kCdN[val]) || _kCdN === replaceStr(g_kCdN[val], g_escapeStr.keyCtrlName));
	return convVal !== -1 ? convVal : parseInt(_kCdN, 10);
};

/**
 * 一時的な追加キーの設定
 * - keyExtraListの指定がない場合は、_dosObj.keyCtrlXに合致するXを追加キーとして追加
 * @param {object} _dosObj 
 * @param {string[]} object.keyExtraList
 * @returns {string[]}
 */
const keysConvert = (_dosObj, { keyExtraList = _dosObj.keyExtraList?.split(`,`) } = {}) => {

	if (keyExtraList === undefined) {
		keyExtraList = [];
		Object.keys(_dosObj).filter(val => val.startsWith(g_keyObj.defaultProp))
			.forEach(keyName => keyExtraList.push(keyName.slice(g_keyObj.defaultProp.length)));

		if (keyExtraList.length === 0) {
			return [];
		}
	}

	const existParam = (_data, _paramName) => !hasVal(_data) && g_keyObj[_paramName] !== undefined;
	const toString = _str => _str;
	const toInt = _num => isNaN(parseInt(_num)) ? _num : parseInt(_num);
	const toFloat = _num => isNaN(parseFloat(_num)) ? _num : parseFloat(_num);
	const toKeyCtrlArray = _str =>
		makeBaseArray(_str.split(`/`).map(n => getKeyCtrlVal(n)), g_keyObj.minKeyCtrlNum, 0);
	const toSplitArrayStr = _str => _str.split(`/`).map(n => n);

	// 略記記法を元の文字列に復元後、配列に変換 (1...3,5...7 -> 1,2,3,5,6,7)
	const toOriginalArray = (_val, _func) => _val?.split(`,`).map(n => _func(n)).join(`,`).split(`,`);

	/**
	 * 略記記法を元の文字列に変換 (1...5 -> 1,2,3,4,5 / 3...+4 -> 3,4,5,6,7)
	 * @param {string} _str 
	 * @returns {string}
	 */
	const toFloatStr = _str => {
		const nums = _str?.split(`...`);
		const bottomMark = nums[0].startsWith(`b`) ? `b` : ``;
		const [startN, endN] = [parseFloat(bottomMark === `b` ? nums[0].slice(1) : nums[0]), parseFloat(nums[1])];

		if (nums.length === 2 && !isNaN(startN) && !isNaN(endN)) {
			const endN2 = nums[1].startsWith(`+`) ? startN + endN : endN;
			const arr = [];
			for (let k = startN; k <= endN2; k++) {
				arr.push(`${bottomMark}${k}`);
			}
			return arr.join(`,`);
		} else {
			return _str;
		}
	};

	/**
	 * 略記記法を元の文字列に変換 (1@:5 -> 1,1,1,1,1 / onigiri!giko!c@:2 -> onigiri,giko,c,onigiri,giko,c)
	 * @param {string} _str
	 * @returns {string}
	 */
	const toSameValStr = _str => {
		const nums = _str?.split(`@:`);
		const groupStr = toFloatStr(nums[0]).split(`!`).join(`,`);
		return nums.length === 2 && !isNaN(parseInt(nums[1])) ?
			fillArray(Math.floor(parseInt(nums[1])), groupStr).join(`,`) : groupStr;
	};

	/**
	 * キーパターン（相対パターン）をキーパターン（実際のパターン番号）に変換
	 * 例) 12_(0) -> 12_4
	 * それ以外の文字列が来た場合は、そのままの値を戻す
	 * @param {string} _str
	 * @returns {string}
	 */
	const getKeyPtnName = _str => {
		const regex = /\((\d+)\)/;
		const checkStr = _str.match(regex);
		if (checkStr !== null) {
			return _str.replace(regex, (match, p) => `${parseInt(p, 10) + setIntVal(g_keyObj.dfPtnNum)}`);
		}
		return _str;
	};

	/**
	 * divMaxX, posXの下段補完処理
	 * ・divXの1番目の指定があるとき、その値を元に下段の位置を補完
	 * 例) |div11x=7,b6|pos11x=0,1,2,3,4,5,6,b0,b1,b5,b6|
	 *  -> |div11x=7,13|pos11x=0,1,2,3,4,5,6,7,8,12,13|
	 * @param {number} _num 
	 * @param {number} _divNum 
	 * @returns {number}
	 */
	const getKeyPosNum = (_num, _divNum = 0) => {
		if (!hasVal(_num) || (!_num.startsWith(`b`) && isNaN(parseFloat(_num)))) {
			return _num;
		}
		return _num.startsWith(`b`) ? parseFloat(_num.slice(1)) + _divNum : parseFloat(_num);
	}

	/**
	 * キーパターンの略名から実際のデータへ展開
	 * - charaX の場合に限り、a>5_0 の形式を aleft, adown, aup, aright, aspace に変換する
	 * @param {string} _str 
	 * @param {string} _name 
	 * @param {Function} _convFunc
	 * @returns {string[]|number[]}
	 */
	const expandKeyPtn = (_str, _name, _convFunc) => {
		const pos = _str.indexOf(`>`);
		const expandData = _ptnstr => structuredClone(g_keyObj[`${_name}${getKeyPtnName(_ptnstr)}`]) ?? [_convFunc(_ptnstr)];

		if (pos > 0 && _name === `chara`) {
			const [header, ptn] = [_str.substring(0, pos), _str.substring(pos + 1)];
			return expandData(ptn)?.map(n => `${header}${n}`);
		} else {
			return expandData(_str);
		}
	};

	/**
	 * 新キー用複合パラメータ
	 * @param {string} _key キー数
	 * @param {string} _name 名前
	 * @param {Function} _convFunc マッピング関数
	 * @param {string} object.errCd エラーコード
	 * @param {boolean} object.baseCopyFlg コピー配列の準備可否
	 * @param {Function} object.loopFunc パターン別に処理する個別関数
	 * @returns {number} 最小パターン数
	 */
	const newKeyMultiParam = (_key, _name, _convFunc, { errCd = ``, baseCopyFlg = false, loopFunc = () => true } = {}) => {
		let tmpMinPatterns = 1;
		const keyheader = _name + _key;
		const dfPtn = setIntVal(g_keyObj.dfPtnNum);

		if (hasVal(_dosObj[keyheader])) {
			const tmpArray = splitLF2(_dosObj[keyheader]);
			tmpMinPatterns = tmpArray.length;
			for (let k = 0; k < tmpMinPatterns; k++) {
				if (existParam(tmpArray[k], `${keyheader}_${k + dfPtn}`)) {
					continue;
				}
				// |keyCtrl9j=Tab,7_0,Enter| -> |keyCtrl9j=Tab,S,D,F,Space,J,K,L,Enter| のように補完
				// |pos9j=0..4,6..9| -> |pos9j=0,1,2,3,4,6,7,8,9|
				g_keyObj[`${keyheader}_${k + dfPtn}`] =
					toOriginalArray(tmpArray[k], toSameValStr).map(n => expandKeyPtn(n, _name, _convFunc)).flat();
				if (baseCopyFlg) {
					g_keyObj[`${keyheader}_${k + dfPtn}d`] = structuredClone(g_keyObj[`${keyheader}_${k + dfPtn}`]);
				}
				loopFunc(k, keyheader);
			}

		} else if (errCd !== `` && g_keyObj[`${keyheader}_0`] === undefined) {
			makeWarningWindow(g_msgInfoObj[errCd].split(`{0}`).join(_key));
		}
		return tmpMinPatterns;
	};

	/**
	 * 新キー用複合パラメータ（特殊）
	 * @param {string} _key キー数
	 * @param {string} _name 名前
	 */
	const newKeyTripleParam = (_key, _name) => {
		const keyheader = _name + _key;
		const dfPtn = setIntVal(g_keyObj.dfPtnNum);

		if (hasVal(_dosObj[keyheader])) {
			splitLF2(_dosObj[keyheader])?.forEach((tmpParam, k) => {
				if (existParam(tmpParam, `${keyheader}_${k + dfPtn}`)) {
					return;
				}

				let ptnCnt = 0;
				tmpParam.split(`/`).forEach(list => {

					const keyPtn = getKeyPtnName(list);
					if (list === ``) {
						// 空指定の場合は一律同じグループへ割り当て
						g_keyObj[`${keyheader}_${k + dfPtn}_${ptnCnt}`] = fillArray(g_keyObj[`${g_keyObj.defaultProp}${_key}_${k + dfPtn}`].length);

					} else if (g_keyObj[`${_name}${keyPtn}_0`] !== undefined) {
						// 他のキーパターン (例: |shuffle8i=8_0| ) を直接指定した場合、該当があれば既存パターンからコピー
						// 既存パターンが複数ある場合、全てコピーする
						let m = 0;
						while (g_keyObj[`${_name}${keyPtn}_${m}`] !== undefined) {
							g_keyObj[`${keyheader}_${k + dfPtn}_${ptnCnt}`] = structuredClone(g_keyObj[`${_name}${keyPtn}_${m}`]);
							m++;
							ptnCnt++;
						}
					} else {
						// 通常の指定方法 (例: |shuffle8i=1,1,1,2,0,0,0,0/1,1,1,1,0,0,0,0| )の場合の取り込み
						// 部分的にキーパターン指定があった場合は既存パターンを展開 (例: |shuffle9j=2,7_0_0,2|)
						g_keyObj[`${keyheader}_${k + dfPtn}_${ptnCnt}`] =
							makeBaseArray(toOriginalArray(list, toSameValStr).map(n =>
								expandKeyPtn(n, _name, _str => isNaN(parseInt(_str)) ? _str : parseInt(_str, 10))
							).flat(), g_keyObj[`${g_keyObj.defaultProp}${_key}_${k + dfPtn}`].length, 0);
						ptnCnt++;
					}
				});
				g_keyObj[`${keyheader}_${k + dfPtn}`] = structuredClone(g_keyObj[`${keyheader}_${k + dfPtn}_0`]);
			});

		} else if (g_keyObj[`${keyheader}_${dfPtn}_0`] === undefined) {
			// 特に指定が無い場合はkeyCtrlX_Yの配列長で決定
			for (let k = 0; k < g_keyObj.minPatterns; k++) {
				const ptnName = `${_key}_${k + dfPtn}`;
				g_keyObj[`${_name}${ptnName}_0`] = fillArray(g_keyObj[`${g_keyObj.defaultProp}${ptnName}`].length);
				g_keyObj[`${_name}${ptnName}`] = structuredClone(g_keyObj[`${_name}${ptnName}_0`]);
			}
		}
	};

	/**
	 * 新キー用単一パラメータ
	 * @param {string} _key キー数
	 * @param {string} _name 名前
	 * @param {string} _type float, number, string, boolean
	 * @param {string} _defaultVal
	 */
	const newKeySingleParam = (_key, _name, _type, _defaultVal) => {
		const keyheader = _name + _key;
		const dfPtn = setIntVal(g_keyObj.dfPtnNum);
		if (_dosObj[keyheader] !== undefined) {
			const tmps = _dosObj[keyheader].split(`$`);
			for (let k = 0; k < tmps.length; k++) {
				g_keyObj[`${keyheader}_${k + dfPtn}`] = setVal(g_keyObj[`${_name}${getKeyPtnName(tmps[k])}`],
					tmps[k].indexOf(`_`) !== -1 ? _defaultVal : setVal(tmps[k], ``, _type));
			}
			for (let k = tmps.length; k < g_keyObj.minPatterns; k++) {
				g_keyObj[`${keyheader}_${k + dfPtn}`] = g_keyObj[`${keyheader}_0`];
			}
		}
	};

	/**
	 * 新キー用複合パラメータ（パターン設定用）
	 * @param {string} _key キー数
	 * @param {string} _name 名前
	 * @param {string} _pairName 詳細設定する変数名
	 * @param {string} _defaultName パラメータの初期値
	 * @param {number} _defaultVal パラメータの初期値の場合の一律設定値（colorX_Yの配列幅に対して設定値で埋める）
	 */
	const newKeyPairParam = (_key, _name, _pairName, _defaultName = ``, _defaultVal = 0) => {
		const keyheader = _name + _key;
		const dfPtn = setIntVal(g_keyObj.dfPtnNum);

		splitLF2(_dosObj[keyheader])?.forEach((tmpParam, k) => {
			const pairName = `${_pairName}${_key}_${k + dfPtn}`;
			if (!hasVal(tmpParam)) {
				return;
			}
			g_keyObj[pairName] = {};

			// デフォルト項目がある場合は先に定義
			if (_defaultName !== ``) {
				g_keyObj[pairName][_defaultName] = fillArray(g_keyObj[`${g_keyObj.defaultProp}${_key}_${k + dfPtn}`].length, _defaultVal);
			}
			tmpParam.split(`/`).forEach(pairs => {
				const keyPtn = getKeyPtnName(pairs);
				if (pairs === ``) {
				} else if (g_keyObj[`${_pairName}${keyPtn}`] !== undefined) {
					// 他のキーパターン指定時、該当があればプロパティを全コピー
					Object.assign(g_keyObj[pairName], g_keyObj[`${_pairName}${keyPtn}`]);
				} else {
					// 通常の指定方法（例：|scroll8i=Cross::1,1,1,-,-,-,1,1/Split::1,1,1,1,-,-,-,-|）から取り込み
					// 部分的にキーパターン指定があった場合は既存パターンを展開 (例: |scroll9j=Cross::1,7_0,1|)
					const tmpParamPair = pairs.split(`::`);
					g_keyObj[pairName][tmpParamPair[0]] =
						makeBaseArray(toOriginalArray(tmpParamPair[1], toSameValStr)?.map(n =>
							structuredClone(g_keyObj[`${_pairName}${getKeyPtnName(n)}`]?.[tmpParamPair[0]]) ??
							[n === `-` ? -1 : parseInt(n, 10)]
						).flat(), g_keyObj[`${g_keyObj.defaultProp}${_key}_${k + dfPtn}`].length, _defaultVal);
				}
			});
		});
	};

	// 対象キー毎に処理
	keyExtraList.forEach(newKey => {
		g_keyObj.minPatterns = 1;
		g_keyObj.dfPtnNum = 0;

		try {

			// キーパターンの追記 (appendX)
			if (setBoolVal(_dosObj[`append${newKey}`])) {
				for (let j = 0; ; j++) {
					if (g_keyObj[`${g_keyObj.defaultProp}${newKey}_${j}`] === undefined) {
						break;
					}
					g_keyObj.dfPtnNum++;
				}
			}
			const dfPtnNum = g_keyObj.dfPtnNum;

			// キーの名前 (keyNameX)
			g_keyObj[`keyName${newKey}`] = _dosObj[`keyName${newKey}`]?.split(`,`) ?? [newKey, `key`];

			// キーの最小横幅 (minWidthX)
			g_keyObj[`minWidth${newKey}`] = _dosObj[`minWidth${newKey}`] ?? g_keyObj[`minWidth${newKey}`] ?? g_keyObj.minWidthDefault;

			// 移動ロック (movLockX)
			g_keyObj[`movLock${newKey}`] = setBoolVal(_dosObj[`movLock${newKey}`] ?? g_keyObj[`movLock${newKey}`], false);

			// 位置マニュアル化 (initManualX)
			g_keyObj[`initManual${newKey}`] = setBoolVal(_dosObj[`initManual${newKey}`] ?? g_keyObj[`initManual${newKey}`], false);

			// カスタムキーの説明ページ（keyHelpJaX / keyHelpEnX）
			Object.keys(g_lang_lblNameObj).forEach(lang =>
				g_lang_lblNameObj[lang][`keyHelp${newKey}`] = _dosObj[`keyHelp${lang}${newKey}`] ?? _dosObj[`keyHelp${newKey}`] ?? ``);

			// キーコンフィグ (keyCtrlX_Y)
			g_keyObj.minPatterns = newKeyMultiParam(newKey, `keyCtrl`, toKeyCtrlArray, {
				errCd: `E_0104`, baseCopyFlg: true,
			});

			// 読込変数の接頭辞 (charaX_Y)
			newKeyMultiParam(newKey, `chara`, toString);

			// 矢印色パターン (colorX_Y)
			newKeyTripleParam(newKey, `color`);

			// 矢印の回転量指定、キャラクタパターン (stepRtnX_Y)
			newKeyTripleParam(newKey, `stepRtn`);

			// 各キーの区切り位置 (divX_Y)
			_dosObj[`div${newKey}`]?.split(`$`).forEach((tmpDiv, k) => {
				const tmpDivPtn = tmpDiv.split(`,`);
				const ptnName = `${newKey}_${k + dfPtnNum}`;

				if (g_keyObj[`div${tmpDivPtn[0]}`] !== undefined) {
					// 既定キーパターンが指定された場合、存在すればその値を適用
					g_keyObj[`div${ptnName}`] = g_keyObj[`div${tmpDivPtn[0]}`];
					g_keyObj[`divMax${ptnName}`] = setVal(g_keyObj[`divMax${tmpDivPtn[0]}`], undefined, C_TYP_FLOAT);
				} else if (!hasVal(tmpDivPtn[0]) && setIntVal(g_keyObj[`div${ptnName}`], -1) !== -1) {
					// カスタムキー側のdivXが未定義だが、すでに初期設定で定義済みの場合はスキップ
					return;
				} else {
					// それ以外の場合は指定された値を適用（未指定時はその後で指定）
					g_keyObj[`div${ptnName}`] = setVal(tmpDivPtn[0], undefined, C_TYP_NUMBER);
					g_keyObj[`divMax${ptnName}`] = setVal(getKeyPosNum(tmpDivPtn[1], g_keyObj[`div${ptnName}`]), undefined, C_TYP_FLOAT);
				}
			});

			// ステップゾーン位置 (posX_Y)
			newKeyMultiParam(newKey, `pos`, toFloat, {
				loopFunc: (k, keyheader) => {
					g_keyObj[`${keyheader}_${k + dfPtnNum}`].forEach((val, j) =>
						g_keyObj[`${keyheader}_${k + dfPtnNum}`][j] = getKeyPosNum(String(val), g_keyObj[`div${newKey}_${k + dfPtnNum}`]));
				},
			});

			// charaX_Y, posX_Y, keyGroupX_Y, divX_Y, divMaxX_Yが未指定の場合はkeyCtrlX_Yを元に適用
			for (let k = 0; k < g_keyObj.minPatterns; k++) {
				setKeyDfVal(`${newKey}_${k + dfPtnNum}`);
			}

			// ステップゾーン間隔 (blankX_Y)
			newKeySingleParam(newKey, `blank`, C_TYP_FLOAT, g_keyObj.blank_def);

			// 矢印群の倍率 (scaleX_Y)
			newKeySingleParam(newKey, `scale`, C_TYP_FLOAT, g_keyObj.scale_def);

			// プレイ中ショートカット：リトライ (keyRetryX_Y)
			newKeySingleParam(newKey, `keyRetry`, C_TYP_STRING, C_KEY_RETRY);

			// プレイ中ショートカット：タイトルバック (keyTitleBackX_Y)
			newKeySingleParam(newKey, `keyTitleBack`, C_TYP_STRING, C_KEY_TITLEBACK);

			// プレイ中ショートカット：タイトルバック (keyPauseX_Y)
			newKeySingleParam(newKey, `keyPause`, C_TYP_STRING, C_KEY_PAUSE);

			// 別キーフラグ (transKeyX_Y)
			newKeySingleParam(newKey, `transKey`, C_TYP_STRING, ``);

			// フラットモード (flatModeX_Y)
			newKeySingleParam(newKey, `flatMode`, C_TYP_BOOLEAN, false);

			// シャッフルグループ (shuffleX_Y)
			newKeyTripleParam(newKey, `shuffle`);

			// キーグループ (keyGroupX_Y)
			newKeyMultiParam(newKey, `keyGroup`, toSplitArrayStr);

			// キーグループの表示制御 (keyGroupOrderX_Y)
			newKeyMultiParam(newKey, `keyGroupOrder`, toString);

			// スクロールパターン (scrollX_Y)
			// |scroll(newKey)=Cross::1,1,-1,-1,-1,1,1/Split::1,1,1,-1,-1,-1,-1$...|
			newKeyPairParam(newKey, `scroll`, `scrollDir`, C_FLG_HYPHEN, 1);

			// アシストパターン (assistX_Y)
			// |assist(newKey)=Onigiri::0,0,0,0,0,1/AA::0,0,0,1,1,1$...|
			newKeyPairParam(newKey, `assist`, `assistPos`);

			// レーンごとの割当レイヤーグループ (layerGroupX_Y)
			newKeyMultiParam(newKey, `layerGroup`, toInt);

			// レイヤーごとのアニメーション情報 (layerTransX_Y)
			if (hasVal(_dosObj[`layerTrans${newKey}`])) {
				_dosObj[`layerTrans${newKey}`] = _dosObj[`layerTrans${newKey}`]?.replaceAll(`,`, `___`);
				newKeyMultiParam(newKey, `layerTrans`, toSplitArrayStr, {
					loopFunc: (k, keyheader) => {
						g_keyObj[`${keyheader}_${k + dfPtnNum}`][0] = g_keyObj[`${keyheader}_${k + dfPtnNum}`]?.[0]?.map(val => val.replaceAll(`___`, `,`));
					},
				});
			}
			// カスタムキーで定義されたtransKeyPtnを補完
			completeTransKeyPtn([newKey]);

			// keyRetry, keyTitleBack, keyPauseのキー名をキーコードに変換
			const keyTypePatterns = Object.keys(g_keyObj).filter(val =>
				val.startsWith(`keyRetry${newKey}`) || val.startsWith(`keyTitleBack${newKey}`) || val.startsWith(`keyPause${newKey}`));
			keyTypePatterns.forEach(name => g_keyObj[name] = getKeyCtrlVal(g_keyObj[name]));
		} catch (e) {
			g_headerObj.undefinedKeyListFinal.push(newKey);
			console.warn(`Error in key pattern conversion: ${newKey}`, e);
		}
	});

	return keyExtraList;
};

/**
 * キーパターンのデフォルト値設定
 * @param {string} _ptnName 
 */
const setKeyDfVal = _ptnName => {
	const baseLength = g_keyObj[`${g_keyObj.defaultProp}${_ptnName}`].length;
	g_keyObj[`chara${_ptnName}`] = padArray(g_keyObj[`chara${_ptnName}`], [...Array(baseLength).keys()].map(i => `${i + 1}a`));
	g_keyObj[`pos${_ptnName}`] = padArray(g_keyObj[`pos${_ptnName}`], [...Array(baseLength).keys()].map(i => i));
	g_keyObj[`keyGroup${_ptnName}`] = padArray(g_keyObj[`keyGroup${_ptnName}`], fillArray(baseLength, [`0`]));

	if (g_keyObj[`div${_ptnName}`] === undefined) {
		g_keyObj[`div${_ptnName}`] = Math.max(...g_keyObj[`pos${_ptnName}`]) + 1;
	}
	if (g_keyObj[`divMax${_ptnName}`] === undefined) {
		g_keyObj[`divMax${_ptnName}`] = Math.max(...g_keyObj[`pos${_ptnName}`]) + 1;
	}
};

/**
 * 背景・マスク用画像の描画
 * @param {object} _obj 
 * @param {string} _obj.path 画像のパス
 * @param {string} _obj.class 画像を装飾するCSSクラス名
 * @param {string} _obj.left 画像の位置(x座標)
 * @param {string} _obj.top 画像の位置(y座標)
 * @param {number} _obj.width 画像の幅
 * @param {string} _obj.height 画像の高さ (他との共用項目のため、stringで受ける)
 * @param {string} _obj.animationName アニメーション名
 * @param {string} _obj.animationDuration アニメーションを動かす間隔(秒)
 * @param {number} _obj.opacity 画像の不透明度
 * @returns {string}
 */
const makeSpriteImage = _obj => {
	let tmpInnerHTML = `<img src=${_obj.path} class="${_obj.class}"	style="position:absolute;left:${wUnit(_obj.left)};top:${wUnit(_obj.top)}`;
	if (_obj.width > 0) {
		tmpInnerHTML += `;width:${wUnit(_obj.width)}`;
	}
	if (setIntVal(_obj.height) > 0) {
		tmpInnerHTML += `;height:${wUnit(_obj.height)}`;
	}
	tmpInnerHTML += `;animation-name:${_obj.animationName};animation-duration:${_obj.animationDuration}s;opacity:${_obj.opacity}">`;
	return tmpInnerHTML;
};

/**
 * 背景・マスク用テキストの描画
 * @param {object} _obj 
 * @param {string} _obj.path テキスト本体
 * @param {string} _obj.class テキストを装飾するCSSクラス名
 * @param {string} _obj.left テキストの位置(x座標)
 * @param {string} _obj.top テキストの位置(y座標)
 * @param {number} _obj.width テキストのフォントサイズ (font-size)
 * @param {string} _obj.height テキストの色 (color)
 * @param {string} _obj.animationName アニメーション名
 * @param {string} _obj.animationDuration アニメーションを動かす間隔(秒)
 * @param {number} _obj.opacity テキストの不透明度
 * @returns {string}
 */
const makeSpriteText = _obj => {
	let tmpInnerHTML = `<span class="${_obj.class}"	style="display:inline-block;position:absolute;left:${wUnit(_obj.left)};top:${wUnit(_obj.top)}`;

	// この場合のwidthは font-size と解釈する
	if (_obj.width > 0) {
		tmpInnerHTML += `;font-size:${wUnit(_obj.width)}`;
	}

	// この場合のheightは color と解釈する
	if (_obj.height !== ``) {
		tmpInnerHTML += `;color:${_obj.height}`;
	}
	tmpInnerHTML += `;animation-name:${_obj.animationName};animation-duration:${_obj.animationDuration}s;opacity:${_obj.opacity}">${_obj.path}</span>`;
	return tmpInnerHTML;
};

/**
 * 多重配列の存在をチェックし、
 * 存在しない場合は作成、存在する場合は重複を避けて配列を新規作成
 * @param {any[][]} _obj 
 * @returns [多重配列(初期化済),配列初期化済数]
 */
const checkDuplicatedObjects = _obj => {
	let dataCnts = 0;
	if (_obj === undefined) {
		_obj = [];
		_obj[0] = [];
	} else {
		for (let m = 1; ; m++) {
			if (_obj[m] === undefined) {
				_obj[m] = [];
				dataCnts = m;
				break;
			}
		}
	}
	return [_obj, dataCnts];
};

/**
 * 多層スプライトデータの作成処理
 * @param {string} _data 
 * @param {Function} _calcFrame 
 * @returns [多層スプライトデータ, 最大深度]
 */
const makeSpriteData = (_data, _calcFrame = _frame => _frame) => {

	const spriteData = [];
	let maxDepth = -1;

	splitLF(_data).filter(data => hasVal(data)).forEach(tmpData => {
		const tmpSpriteData = tmpData.split(`,`).map(val => trimStr(val));

		// 深度が"-"の場合はスキップ
		if (tmpSpriteData[1] === undefined || tmpSpriteData[1] === `-` ||
			(tmpSpriteData[1] === `` && ![`[loop]`, `[jump]`].includes(tmpSpriteData[2]))) {
			return;
		}

		// 値チェックとエスケープ処理
		const tmpFrame = setIntVal(tmpSpriteData[0], -1) === 0 ? 0 :
			roundZero(_calcFrame(setVal(tmpSpriteData[0], 200, C_TYP_CALC)));
		const tmpDepth = (tmpSpriteData[1] === C_FLG_ALL ? C_FLG_ALL : setVal(tmpSpriteData[1], 0, C_TYP_CALC));
		if (tmpDepth !== C_FLG_ALL && tmpDepth > maxDepth) {
			maxDepth = tmpDepth;
		}

		const colorObjFlg = tmpSpriteData[2]?.startsWith(`[c]`) || false;
		const transformFlg = tmpSpriteData[2]?.startsWith(`[t]`) || false;
		const tmpObj = {
			path: escapeHtml(tmpSpriteData[2] ?? ``, g_escapeStr.escapeCode),   // 画像パス or テキスト
			class: escapeHtml(tmpSpriteData[3] ?? ``),                          // CSSクラス
			left: transformFlg
				? setVal(tmpSpriteData[4], 1000, C_TYP_NUMBER)					// [t]のみtransformのPriority
				: setVal(tmpSpriteData[4], `0`).includes(`{`)
					? `${setVal(tmpSpriteData[4], 0)}`
					: `{${setVal(tmpSpriteData[4], 0)}}`,                       // X座標
			top: setVal(tmpSpriteData[5], `0`).includes(`{`)
				? `${setVal(tmpSpriteData[5], 0)}`
				: `{${setVal(tmpSpriteData[5], 0)}}`, 							// Y座標
			width: `${setIntVal(tmpSpriteData[6])}`,                            // spanタグの場合は font-size
			height: `${escapeHtml(tmpSpriteData[7] ?? ``)}`,                    // spanタグの場合は color(文字列可)
			opacity: setVal(tmpSpriteData[8], 1, C_TYP_FLOAT),
			animationName: escapeHtml(setVal(tmpSpriteData[9], C_DIS_NONE)),
			animationDuration: setIntVal(tmpSpriteData[10]) / g_fps,
		};
		if (setVal(tmpSpriteData[11], g_presetObj.animationFillMode) !== undefined) {
			tmpObj.animationFillMode = setVal(tmpSpriteData[11], g_presetObj.animationFillMode);
		}
		tmpObj.path = preloadImgFile(tmpObj.path, { syncBackPath: g_headerObj.syncBackPath });

		let dataCnts = 0;
		[spriteData[tmpFrame], dataCnts] =
			checkDuplicatedObjects(spriteData[tmpFrame]);

		const emptyPatterns = [`[loop]`, `[jump]`];
		const spriteFrameData = spriteData[tmpFrame][dataCnts] = {
			depth: tmpDepth,
		};

		if (colorObjFlg) {
			// [c]始まりの場合、カラーオブジェクト用の作成準備を行う
			const data = tmpObj.path.slice(`[c]`.length).split(`/`);
			let objPart = data[0];
			if (!isNaN(parseInt(data[0]))) {
				const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
				objPart = g_keyObj[`stepRtn${keyCtrlPtn}`][data[0]];
				spriteFrameData.transform = parseInt(data[0]);
			}
			spriteFrameData.colorObjInfo = {
				x: tmpObj.left, y: tmpObj.top, w: tmpObj.width, h: tmpObj.height,
				rotate: setVal(objPart, `0`), opacity: tmpObj.opacity,
				background: makeColorGradation(setVal(data[1], `#ffffff`), { _defaultColorgrd: false }),
				animationName: tmpObj.animationName,
				animationDuration: `${tmpObj.animationDuration}s`,
			};
			spriteFrameData.colorObjId = `${tmpFrame}_${dataCnts}`;
			spriteFrameData.colorObjClass = setVal(tmpObj.class, undefined);
			if (tmpObj.animationFillMode !== undefined) {
				spriteFrameData.colorObjInfo.animationFillMode = tmpObj.animationFillMode;
			}
		} else if (transformFlg) {
			// [t]始まりの場合、レイヤーに対してtransformを掛ける準備を行う
			const transformData = tmpObj.path.slice(`[t]`.length);
			spriteFrameData.transform = transformData || ``;
			spriteFrameData.transformId = tmpObj.class;
			spriteFrameData.transPriority = tmpObj.left;

		} else if (tmpObj.path === ``) {
			spriteFrameData.command = ``;
		} else if (emptyPatterns.includes(tmpObj.path)) {
			// ループ、フレームジャンプの場合の処理
			spriteFrameData.command = tmpObj.path;
			spriteFrameData.jumpFrame = tmpObj.class;
			spriteFrameData.maxLoop = tmpObj.left;
			spriteFrameData.htmlText = ``;
		} else {
			// それ以外の画像、テキストの場合
			spriteFrameData.animationName = tmpObj.animationName;
			spriteFrameData.htmlText = (checkImage(tmpObj.path) ? makeSpriteImage(tmpObj) : makeSpriteText(tmpObj));
		}
	});

	return [spriteData, maxDepth];
};

/**
 * スタイル変更データの作成処理
 * @param {string} _data 
 * @param {Function} _calcFrame 
 * @returns [多層スプライトデータ, 1(固定)]
 */
const makeStyleData = (_data, _calcFrame = _frame => _frame) => {
	const spriteData = [];
	splitLF(_data).filter(data => hasVal(data)).forEach(tmpData => {
		const tmpSpriteData = tmpData.split(`,`).map(val => trimStr(val));

		// カスタムプロパティの名称(--始まり)で無い場合はコメントと見做してスキップ
		if (tmpSpriteData.length <= 1 || !tmpSpriteData[1].startsWith(`--`)) {
			return;
		}
		const tmpFrame = setIntVal(tmpSpriteData[0], -1) === 0 ? 0 :
			roundZero(_calcFrame(setVal(tmpSpriteData[0], 200, C_TYP_CALC)));

		let dataCnts = 0;
		[spriteData[tmpFrame], dataCnts] = checkDuplicatedObjects(spriteData[tmpFrame]);
		spriteData[tmpFrame][dataCnts] = {
			depth: tmpSpriteData[1],
			styleData: getCssCustomProperty(tmpSpriteData[1], tmpSpriteData[2]),
		};
	});
	return [spriteData, 1];
};

/**
 * 画像ファイルかどうかをチェック
 * @param {string} _str 
 * @returns {boolean}
 */
const checkImage = _str => listMatching(_str, g_imgExtensions, { prefix: `[.]`, suffix: `$` });

/**
 * back/masktitle(result)において、ジャンプ先のフレーム数を取得
 * @param {string} _frames ジャンプ先のフレーム数情報。コロン指定でジャンプ先を確率で分岐 (ex. 300:1500:1500)
 * @returns {number}
 */
const getSpriteJumpFrame = _frames => {
	const jumpFrames = _frames.split(`:`);
	const jumpCnt = Math.floor(Math.random() * jumpFrames.length);
	return setIntVal(Number(jumpFrames[jumpCnt]) - 1);
};

/**
 * 背景・マスクモーションの表示（共通処理）
 * @param {object} _spriteData 
 * @param {string} _name 
 * @param {boolean} [_condition=true] 
 */
const drawBaseSpriteData = (_spriteData, _name, _condition = true) => {
	const baseSprite = document.getElementById(`${_name}Sprite${_spriteData.depth}`);
	if (_spriteData.command === ``) {
		if (_spriteData.depth === C_FLG_ALL) {
			for (let j = 0; j <= g_scoreObj[`${_name}MaxDepth`]; j++) {
				document.getElementById(`${_name}Sprite${j}`).textContent = ``;
			}
		} else {
			baseSprite.textContent = ``;
		}
	} else {
		if (_condition) {
			if (_spriteData.colorObjInfo === undefined && _spriteData.transform === undefined) {
				baseSprite.innerHTML = convertStrToVal(_spriteData.htmlText);
				return;
			}
			if (_spriteData.colorObjInfo !== undefined) {
				const colorObjClass = _spriteData.colorObjClass?.split(`/`) ?? [];
				const id = `${_name}${_spriteData.depth}${_spriteData.colorObjId}`;
				[`x`, `y`, `w`, `h`].forEach(val => _spriteData.colorObjInfo[val] = convertStrToVal(_spriteData.colorObjInfo[val]));
				baseSprite.appendChild(
					createColorObject2(id, _spriteData.colorObjInfo, ...colorObjClass)
				);
			}
			if (_spriteData.transform !== undefined) {
				const targetId = `${_name}Sprite${_spriteData.depth}`;

				if (!isNaN(parseInt(_spriteData.transform))) {
					// PlayWindow由来のtransformを継承（別transformId）
					const transformId = `${_name}${_spriteData.depth}PlayWindow`;
					const transformData = getTransform(`mainSprite`, `playWindow`);

					if (hasVal(transformData)) {
						if (transformData !== getTransform(targetId, transformId)) {
							addTransform(targetId, transformId, transformData, g_transPriority.playWindow);
						}
					} else {
						delTransform(targetId, transformId);
					}
				} else {
					// 明示指定のtransformを適用
					const transformId = _spriteData.transformId || `${_name}${_spriteData.depth}`;

					if (hasVal(_spriteData.transform)) {
						addTransform(targetId, transformId, _spriteData.transform, _spriteData.transPriority);
					} else {
						delTransform(targetId, transformId);
					}
				}
			}
		}
	}
};

/**
 * 背景・マスクモーションの表示（タイトル・リザルト用）
 * @param {number} _frame 
 * @param {string} _displayName title / result
 * @param {string} _depthName back / mask
 * @returns {number}
 */
const drawSpriteData = (_frame, _displayName, _depthName) => {

	const spriteName = `${_depthName}${toCapitalize(_displayName)}`;
	const tmpObjs = g_headerObj[`${spriteName}Data`][_frame];

	for (let j = 0; j < tmpObjs.length; j++) {
		const tmpObj = tmpObjs[j];
		drawBaseSpriteData(tmpObj, spriteName, ![`[loop]`, `[jump]`].includes(tmpObj.command));
		if (tmpObj.command === `[loop]`) {
			// キーワード指定：ループ
			// 指定フレーム(class)へ移動する
			g_scoreObj[`${spriteName}LoopCount`]++;
			return getSpriteJumpFrame(tmpObj.jumpFrame);

		} else if (tmpObj.command === `[jump]`) {
			// キーワード指定：フレームジャンプ
			// 指定回数以上のループ(maxLoop)があれば指定フレーム(jumpFrame)へ移動する
			if (g_scoreObj[`${spriteName}LoopCount`] >= Number(tmpObj.maxLoop)) {
				g_scoreObj[`${spriteName}LoopCount`] = 0;
				return getSpriteJumpFrame(tmpObj.jumpFrame);
			}
		}
	}
	return _frame;
};

/**
 * 背景・マスクモーションの表示
 * @param {number} _frame 
 * @param {string} _depthName 
 */
const drawMainSpriteData = (_frame, _depthName) =>
	g_scoreObj[`${_depthName}Data`][_frame].forEach(tmpObj => drawBaseSpriteData(tmpObj, _depthName));

/**
 * スタイル切替
 * @param {number} _frame 
 * @param {string} _displayName
 * @returns {number}
 */
const drawStyleData = (_frame, _displayName) => {
	g_headerObj[`style${toCapitalize(_displayName)}Data`][_frame].forEach(tmpObj =>
		document.documentElement.style.setProperty(tmpObj.depth, tmpObj.styleData));

	return _frame;
};

const drawMainStyleData = (_frame) =>
	g_scoreObj.styleData[_frame].forEach(tmpObj =>
		document.documentElement.style.setProperty(tmpObj.depth, tmpObj.styleData));

/**
 * タイトル・リザルトモーションの描画
 * @param {string} _displayName
 */
const drawTitleResultMotion = _displayName =>
	g_animationData.forEach(sprite => {
		const spriteName = `${sprite}${toCapitalize(_displayName)}`;
		if (g_headerObj[`${spriteName}Data`][g_scoreObj[`${spriteName}FrameNum`]] !== undefined) {
			g_scoreObj[`${spriteName}FrameNum`] = g_animationFunc.draw[sprite](g_scoreObj[`${spriteName}FrameNum`], _displayName, sprite);
		}
	});
