/**
 * Dancing☆Onigiri (CW Edition)
 * 譜面及び楽曲データの読込・変換処理
 * - ページ: loading, loadingIos
 *
 * Source by tickle
 * Created : 
 * Revised : 
 *
 * https://github.com/cwtickle/danoniplus
 */

/*-----------------------------------------------------------*/
/* Scene : LOADING [strawberry] */
/*-----------------------------------------------------------*/

const loadMusic = async () => {

	clearWindow();
	pauseBGM();
	g_currentPage = `loading`;

	const musicUrl = getMusicUrl(g_stateObj.scoreId);
	const url = getFullMusicUrl(musicUrl);
	g_headerObj.musicUrl = musicUrl;
	g_musicEncodedFlg = listMatching(musicUrl, [`.js`, `.txt`], { suffix: `$` });

	// Now Loadingを表示
	const lblLoading = getLoadingLabel();
	divRoot.appendChild(lblLoading);

	// 音源準備Promise(ローカル/オンライン双方を吸収)
	const audioReadyPromise = loadAndSetupAudio(url, lblLoading);

	// 譜面データ読込・変換処理Promise(g_audioに依存しない部分)
	const chartReadyPromise = loadChartFile().then(() => prepareScoreData());

	// 両方の完了を待つ
	let loadSucceeded = true;
	try {
		await Promise.all([audioReadyPromise, chartReadyPromise]);
	} catch (e) {
		console.warn(`Loading error: ${e}`);
		loadSucceeded = false;
	} finally {
		deleteDiv(divRoot, `lblLoading`);
	}

	if (loadSucceeded) {
		// 初回プレイ時に出力デバイスの起動待ちでずれるのを防ぐため、
		// メイン画面へ移行する前にAudioContextを起動させておく
		await warmUpAudioContext();
		mainInit(); // 音源・譜面変換双方の完了後にまとめて呼ぶ
	}
};

/**
 * ローディング文字用ラベルの作成
 * @returns {HTMLDivElement}
 */
const getLoadingLabel = () => createDivCss2Label(`lblLoading`, g_lblNameObj.nowLoading, {
	x: 0, y: g_sHeight - 40, w: g_sWidth, h: g_limitObj.setLblHeight,
	siz: g_limitObj.setLblSiz, align: C_ALIGN_RIGHT,
});

/**
 * 音源の取得とセットアップ
 * - エンコード形式(base64)か通常の音声ファイルかを判定し、それぞれの準備処理に振り分ける
 * - iOSの場合はユーザー操作(ジェスチャー)を待ってから再生準備を行う(readyToStart経由)
 * - キャッシュヒット時はダウンロード自体を行わないよう、取得処理はsetupWebAudioへ
 *   コールバックとして渡し、キャッシュミス時にのみ評価されるようにしている
 * @param {string} _url 音源の取得元URL
 * @param {HTMLDivElement} _lblLoading ローディング表示用のDiv要素
 * @returns {Promise<void>} 再生準備(canplaythrough相当)が完了したら解決するPromise
 */
const loadAndSetupAudio = async (_url, _lblLoading) => {

	/**
	 * iOSの場合はユーザー操作(ジェスチャー)を待ってから_funcを実行する
	 * - AudioContextの制約上、iOSはジェスチャーを起点にしないと音声再生が許可されないため
	 * @param {() => Promise<void>} _func 実行する音源準備処理
	 * @returns {Promise<void>}
	 */
	const readyToStart = _func => {
		if (!g_isIos) {
			return _func(); // 通常環境はそのまま実行するだけ
		}
		return new Promise((resolve, reject) => {
			g_currentPage = `loadingIos`;
			_lblLoading.textContent = `Click to Start!`;
			divRoot.appendChild(makePlayButton(evt => {
				getSharedAudioContext().resume();
				g_currentPage = `loading`;
				resetKeyControl();
				divRoot.removeChild(evt.target);
				_func().then(resolve).catch(reject);
			}));
			setShortcutEvent(g_currentPage);
		});
	};

	// 音源準備処理そのものを、条件に応じて組み立てる
	const setupAudioFunc = (() => {

		// エンコードなし & ローカル実行: Audio要素で直接再生
		if (!g_musicEncodedFlg && g_isFile) {
			return () => {
				g_audio = new Audio();
				g_audio.src = _url;
				return musicAfterLoaded();
			};
		}

		// エンコードなし & オンライン: WebAudioAPI経由(URLからfetch)
		if (!g_musicEncodedFlg) {
			return () => setupWebAudio(async () => {
				const blobUrl = await fetchMusicBlobUrl(_url, _lblLoading);
				try {
					const response = await fetch(blobUrl);
					return await response.arrayBuffer();
				} finally {
					URL.revokeObjectURL(blobUrl);
				}
			}, _url);
		}

		// エンコードあり: スクリプト読込・musicInit実行を経てWebAudioAPI準備
		return () => setupWebAudio(async () => {
			const scriptSrc = g_isFile ? _url : await fetchMusicBlobUrl(_url, _lblLoading);
			try {
				await loadScript2(scriptSrc);
			} finally {
				if (!g_isFile) {
					URL.revokeObjectURL(scriptSrc);
				}
			}
			if (typeof musicInit !== C_TYP_FUNCTION) {
				makeWarningWindow(g_msgInfoObj.E_0031, { backBtnUse: true });
				throw new Error(`musicInit is not defined`);
			}
			musicInit();
			return base64ToUint8Array(g_musicdata).buffer;
		}, _url);
	})();

	return readyToStart(setupAudioFunc);
};

/**
 * XHRによる音源ファイルのダウンロード(Promise化)
 * - ダウンロードして Blob URL を返す
 * @param {string} _url 音源ファイルのURL
 * @param {HTMLDivElement} _lblLoading ローディング表示用のDiv要素
 * @returns {Promise<string>} Blob URL
 */
const fetchMusicBlobUrl = (_url, _lblLoading) => new Promise((resolve, reject) => {
	const request = new XMLHttpRequest();
	request.open(`GET`, _url, true);
	request.responseType = `blob`;

	const STALL_TIMEOUT_MS = 30000; // 30秒間、進捗がなければ停滞とみなす
	let stallTimer = null;

	// 停滞タイマーをリセット
	const resetStallTimer = () => {
		g_timerHandler.clearTimeout(stallTimer);
		stallTimer = g_timerHandler.setTimeout(() => {
			request.abort();
			makeWarningWindow(g_msgInfoObj.E_0033, { backBtnUse: true });
			reject(new Error(`stalled`));
		}, STALL_TIMEOUT_MS);
	};

	// 読み込み完了時
	request.addEventListener(`load`, () => {
		g_timerHandler.clearTimeout(stallTimer);
		if (request.status >= 200 && request.status < 300) {
			const blobUrl = URL.createObjectURL(request.response);
			createEmptySprite(divRoot, `loader`, g_windowObj.loader);
			_lblLoading.textContent = g_lblNameObj.pleaseWait;
			resolve(blobUrl);
		} else {
			makeWarningWindow(`${g_msgInfoObj.E_0041.split('{0}').join(getFullPath(_url))}<br>(${request.status} ${request.statusText})`, { backBtnUse: true });
			reject(new Error(`HTTP ${request.status}`));
		}
	});

	// 進捗時
	request.addEventListener(`progress`, _event => {
		resetStallTimer(); // 進捗があるたびにタイマーをリセット
		const lblLoadingElem = document.getElementById(`lblLoading`);
		if (lblLoadingElem === null) return; // 並列処理で先に削除されている場合の防御

		if (_event.lengthComputable) {
			const rate = _event.loaded / _event.total;
			createEmptySprite(divRoot, `loader`, { y: g_sHeight - 10, h: 10, w: g_sWidth * rate, backgroundColor: `#eeeeee` });
			lblLoadingElem.textContent = `${g_lblNameObj.nowLoading} ${Math.floor(rate * 100)}%`;
		} else {
			lblLoadingElem.textContent = `${g_lblNameObj.nowLoading} ${_event.loaded}Bytes`;
		}
		// ユーザカスタムイベント
		safeExecuteCustomHooks(`g_customJsObj.progress`, g_customJsObj.progress, _event);
	});

	request.addEventListener(`error`, () => {
		g_timerHandler.clearTimeout(stallTimer);
		makeWarningWindow(g_msgInfoObj.E_0034, { backBtnUse: true });
		reject(new Error(`network error`));
	});

	resetStallTimer(); // 初回(最初のprogressが来るまで)のタイマーも開始
	request.send();
});

/**
 * WebAudioAPIによる音源再生の準備(共通処理)
 * - AudioPlayerを生成し、canplaythrough/errorの発火待ちを開始した上で、
 *   ArrayBufferを取得してデコードする(キャッシュヒット時はデコードをスキップ)
 * @param {() => Promise<ArrayBuffer>} _fetchArrayBuffer 未キャッシュの場合にArrayBufferを取得する関数
 * @param {string} [_cacheKey] AudioBufferキャッシュ照合用のキー(省略時はキャッシュを使わない)
 * @returns {Promise<void>} 再生準備(canplaythrough相当)が完了したら解決するPromise
 */
const setupWebAudio = async (_fetchArrayBuffer, _cacheKey) => {
	g_audio = new AudioPlayer();
	const loadedPromise = musicAfterLoaded(); // canplaythrough/errorの発火をここで待つ

	const cachedBuffer = _cacheKey ? getAudioBufferFromCache(_cacheKey) : undefined;
	if (cachedBuffer !== undefined) {
		g_audio.setBuffer(cachedBuffer);
	} else {
		const arrayBuffer = await _fetchArrayBuffer();
		await g_audio.init(arrayBuffer);
		if (_cacheKey) {
			cacheAudioBuffer(_cacheKey, g_audio.getBuffer());
		}
	}
	return loadedPromise;
};

const g_audioBufferCache = new Map();
const AUDIO_CACHE_MAX = 5;

/**
 * デコード済みAudioBufferのキャッシュからの取得
 * - Mapは挿入順を保持するのみでアクセス順を保持しないため、
 *   ヒット時にエントリを一度削除して再挿入し、最新として扱う(LRU方式)
 * @param {string} _key キャッシュキー(楽曲の実URL)
 * @returns {AudioBuffer|undefined} キャッシュされたAudioBuffer。存在しない場合はundefined
 */
const getAudioBufferFromCache = (_key) => {
	if (!g_audioBufferCache.has(_key)) {
		return undefined;
	}
	const buffer = g_audioBufferCache.get(_key);
	g_audioBufferCache.delete(_key);
	g_audioBufferCache.set(_key, buffer); // 末尾(最新)に再挿入
	return buffer;
};

/**
 * デコード済みAudioBufferのキャッシュへの登録
 * - 直近 AUDIO_CACHE_MAX 件を保持するLRU方式。上限を超えた場合は最も古いエントリから破棄する
 * @param {string} _key キャッシュキー(楽曲の実URL)
 * @param {AudioBuffer} _buffer デコード済みのAudioBuffer
 */
const cacheAudioBuffer = (_key, _buffer) => {
	g_audioBufferCache.set(_key, _buffer);
	if (g_audioBufferCache.size > AUDIO_CACHE_MAX) {
		g_audioBufferCache.delete(g_audioBufferCache.keys().next().value); // 古い順に破棄
	}
};

/**
 * base64文字列をUint8Arrayに変換
 * - Uint8Array.from(atob(str), callback)によるコールバック呼び出し形式は
 *   大容量データで変換オーバーヘッドが大きいため、forループによる直接代入で高速化している
 * @param {string} _base64Str base64エンコードされた文字列
 * @returns {Uint8Array} 変換後のバイト配列
 */
const base64ToUint8Array = (_base64Str) => {
	const binaryStr = atob(_base64Str);
	const len = binaryStr.length;
	const array = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		array[i] = binaryStr.charCodeAt(i);
	}
	return array;
};

/**
 * 音源の再生準備完了を待つ
 * - g_audio が Audio要素の場合は canplaythrough/error イベントの発火を待つ
 * - g_audio が AudioPlayer の場合、readyState が既に4(デコード済み、キャッシュヒット時など)であれば即時解決する
 * - canplaythrough/error のどちらが発火しても、もう一方のリスナーも確実に削除する(cleanup)
 * @returns {Promise<void>} 再生準備が完了したら解決し、読込エラー時は例外を投げて拒否するPromise
 */
const musicAfterLoaded = () => new Promise((resolve, reject) => {
	g_audio.load();

	if (g_audio.readyState === 4) {
		resolve();
	} else {
		const onCanPlay = () => { cleanup(); resolve(); };
		const onError = () => {
			cleanup();
			makeWarningWindow(g_msgInfoObj.E_0041.split(`{0}`).join(g_audio.src), { backBtnUse: true });
			reject(new Error(`audio load error`));
		};
		const cleanup = () => {
			g_audio.removeEventListener(`canplaythrough`, onCanPlay, false);
			g_audio.removeEventListener(`error`, onError, false);
		};
		g_audio.addEventListener(`canplaythrough`, onCanPlay, false);
		g_audio.addEventListener(`error`, onError, false);
	}
});

/**
 * 譜面データの変換処理
 * - 音源データの状態に依存しない部分のみを担う(g_audio非参照)
 * - loadMusic経由(並行フロー)、executeRetry経由(曲中リトライ)の両方から呼ばれる
 */
const prepareScoreData = () => {

	const tkObj = getKeyInfo();
	const [keyCtrlPtn, keyNum] = [tkObj.keyCtrlPtn, tkObj.keyNum];
	g_headerObj.blankFrameDef = setVal(g_headerObj.blankFrameDefs[g_stateObj.scoreId], g_headerObj.blankFrameDefs[0]);
	g_headerObj.blankFrame = g_headerObj.blankFrameDef;

	// ユーザカスタムイベント
	safeExecuteCustomHooks(`g_customJsObj.preloading`, g_customJsObj.preloading);
	safeExecuteCustomHooks(`g_skinJsObj.preloading`, g_skinJsObj.preloading);

	let dummyIdHeader = ``;
	if (g_stateObj.dummyId !== ``) {
		if (g_stateObj.dummyId === 0 || g_stateObj.dummyId === 1) {
			dummyIdHeader = ``;
		} else {
			dummyIdHeader = g_stateObj.dummyId;
		}
	}
	g_scoreObj = scoreConvert(g_rootObj, g_stateObj.scoreId, 0, dummyIdHeader);

	// Motionオプション適用時の矢印別の速度を取得（配列形式）
	g_workObj.motionOnFrames = setMotionOnFrame();
	g_workObj.motionReverseFlg = g_workObj.motionOnFrames.filter(val => g_stateObj.speed + val < 0).length > 0;

	// 矢印描画時間の引き伸ばし設定（個別加速がある場合かつ逆走を伴うモーションは初期倍速によりさらに引き伸ばしを行う）
	// ただし、速度による引き伸ばし(boostFactor)の上限は描画の関係で2倍までとする
	let maxBoost = 1;
	for (let j = 0; j < g_scoreObj.boostData.length; j += 2) {
		maxBoost = Math.max(maxBoost, g_scoreObj.boostData[j + 1]);
	}
	const boostFactor = 1 + (
		(g_settings.motionDistRates[g_settings.motionNum] === 1 || !g_workObj.motionReverseFlg)
			? 0
			: (
				g_stateObj.speed * g_headerObj.baseSpeed - g_settings.motionBoostFactorMinSpd > 0 && maxBoost > 1
					? Math.min(maxBoost / 4, 1) : 0
			)
	);
	g_scoreObj.distY = Math.max(
		g_headerObj.stretchYRate[g_stateObj.scoreId], g_settings.motionDistRates[g_settings.motionNum] * boostFactor
	) * g_posObj.distY;

	// 最終フレーム数の取得
	let lastFrame = getLastFrame(g_scoreObj) + g_headerObj.blankFrame;

	// 最初の矢印データがあるフレーム数を取得
	let firstArrowFrame = getFirstArrowFrame(g_scoreObj);

	// 開始フレーム数の取得(フェードイン加味)
	g_scoreObj.frameNum = getStartFrame(lastFrame, g_stateObj.fadein);

	// フレームごとの速度を取得（配列形式）
	let speedOnFrame = setSpeedOnFrame(g_scoreObj.speedData, lastFrame);

	// 最初のフレームで出現する矢印が、ステップゾーンに到達するまでのフレーム数を取得
	const firstFrame = (g_scoreObj.frameNum === 0 ? 0 : g_scoreObj.frameNum + g_headerObj.blankFrame);
	let arrivalFrame = getFirstArrivalFrame(firstFrame, speedOnFrame);

	// キーパターン(デフォルト)に対応する矢印番号を格納
	convertReplaceNums();

	const setData = (_data, _minLength = 1) => hasArrayList(_data, _minLength) ? _data.concat() : [];

	// フレーム・曲開始位置調整
	let preblankFrame = 0;
	if (g_scoreObj.frameNum === 0) {
		if (firstArrowFrame - g_limitObj.adjustment < arrivalFrame) {
			preblankFrame = arrivalFrame - firstArrowFrame + g_limitObj.adjustment;

			// 譜面データの再読み込み
			const noteExistObj = {
				arrow: true,
				frz: true,
				dummyArrow: g_stateObj.shuffle === C_FLG_OFF,
				dummyFrz: g_stateObj.shuffle === C_FLG_OFF,
			};
			const tmpObj = scoreConvert(g_rootObj, g_stateObj.scoreId, preblankFrame, dummyIdHeader);
			for (let j = 0; j < keyNum; j++) {
				Object.keys(noteExistObj).filter(name => tmpObj[`${name}Data`][j] !== undefined && noteExistObj[name])
					.forEach(name => g_scoreObj[`${name}Data`][j] = structuredClone(tmpObj[`${name}Data`][j]));
			}

			Object.keys(g_dataMinObj).forEach(dataType =>
				g_scoreObj[`${dataType}Data`] = setData(tmpObj[`${dataType}Data`], g_dataMinObj[dataType]));

			lastFrame += preblankFrame;
			firstArrowFrame += preblankFrame;
			speedOnFrame = setSpeedOnFrame(g_scoreObj.speedData, lastFrame);
			arrivalFrame = getFirstArrivalFrame(firstFrame, speedOnFrame);
			g_headerObj.blankFrame += preblankFrame;
		}
	}
	g_scoreObj.baseFrame = g_scoreObj.frameNum - g_stateObj.intAdjustment;

	// シャッフルグループ未定義の場合
	if (g_keyObj[`shuffle${keyCtrlPtn}`] === undefined) {
		g_keyObj[`shuffle${keyCtrlPtn}`] = fillArray(keyNum);
	}

	// シャッフルグループを扱いやすくする
	// [0, 0, 0, 1, 0, 0, 0] -> [[0, 1, 2, 4, 5, 6], [3]]
	g_workObj.shuffleGroupMap = {};
	g_keyObj[`shuffle${keyCtrlPtn}`].forEach((_val, _i) =>
		g_workObj.shuffleGroupMap[_val]?.push(_i) || (g_workObj.shuffleGroupMap[_val] = [_i]));

	// Mirror,Random,S-Randomの適用
	g_shuffleFunc.get(g_stateObj.shuffle)(keyNum, Object.values(g_workObj.shuffleGroupMap));

	// アシスト用の配列があれば、ダミーデータで上書き
	if (typeof g_keyObj[`assistPos${keyCtrlPtn}`] === C_TYP_OBJECT &&
		!g_autoPlaysBase.includes(g_stateObj.autoPlay)) {
		const assistArray = g_keyObj[`assistPos${keyCtrlPtn}`][g_stateObj.autoPlay];
		for (let j = 0; j < keyNum; j++) {
			if (assistArray[j] === 1) {
				g_scoreObj.dummyArrowData[j] = g_scoreObj.arrowData[j].concat();
				g_scoreObj.arrowData[j] = [];
				g_scoreObj.dummyFrzData[j] = g_scoreObj.frzData[j].concat();
				g_scoreObj.frzData[j] = [];
			} else {
				g_scoreObj.dummyArrowData[j] = [];
				g_scoreObj.dummyFrzData[j] = [];
			}
		}
	}

	// 矢印・フリーズアロー数をカウント
	g_allArrow = 0;
	g_allFrz = 0;
	g_scoreObj.arrowData.forEach(data => g_allArrow += data.length);
	g_scoreObj.frzData.forEach(data => g_allFrz += Math.floor(data.length / 2) * 2);

	// ライフ回復・ダメージ量の計算
	// フリーズ始点でも通常判定させる場合は総矢印数を水増しする
	if (g_headerObj.frzStartjdgUse) {
		g_allArrow += g_allFrz / 2;
	}
	g_fullArrows = g_allArrow + g_allFrz / 2;

	calcLifeVals(g_fullArrows);

	// 矢印・フリーズアロー・速度/色変化格納処理
	pushArrows(g_scoreObj, speedOnFrame, arrivalFrame);

	// メインに入る前の最終初期化処理
	getArrowSettings();

	// ユーザカスタムイベント
	safeExecuteCustomHooks(`g_customJsObj.loading`, g_customJsObj.loading);
};

/**
 * 譜面番号の取得
 * @param {number} _scoreId 
 * @param {boolean} _scoreLockFlg 
 * @param {boolean} _useOne 1譜面目指定有無フラグ (初期色に関する箇所のみ指定)
 * @returns {number|string}
 */
const setScoreIdHeader = (_scoreId = 0, _scoreLockFlg = false, _useOne = false) => {
	if (!_scoreLockFlg && _scoreId > 0) {
		return Number(_scoreId) + 1;
	} else if (_scoreLockFlg && g_headerObj.scoreNos?.[_scoreId] > 1) {
		return g_headerObj.scoreNos[_scoreId];
	}
	return _useOne ? 1 : ``;
};

/**
 * 譜面ファイル番号の取得
 * @param {number} [_scoreId=0] 
 * @param {boolean} [_scoreLockFlg=false] 
 * @returns {number|string}
 */
const setDosIdHeader = (_scoreId = 0, _scoreLockFlg = false) => {
	if (_scoreLockFlg && g_headerObj.dosNos?.[_scoreId] > 0) {
		return g_headerObj.dosNos?.[_scoreId] > 1 ? g_headerObj.dosNos[_scoreId] : ``;
	} else if (_scoreId > 0) {
		return Number(_scoreId) + 1;
	}
	return ``;
};

/**
 * Mirror,Randomの適用
 * @param {number} _keyNum
 * @param {number[][]} _shuffleGroup
 * @param {number[][]} _style
 */
const applyShuffle = (_keyNum, _shuffleGroup, _style) => {
	// 並べ替え用の配列を作成
	// index[i]番目のキーの譜面がi番目のキーに流れるようになります
	const index = [...Array(_keyNum).keys()];
	for (let i = 0; i < _shuffleGroup.length; i++) {
		for (let j = 0; j < _shuffleGroup[i].length; j++) {
			index[_shuffleGroup[i][j]] = _style[i][j];
		}
	}

	// indexに従って並べ替え
	g_typeLists.arrow.forEach(type => {
		const tmpData = structuredClone(g_scoreObj[`${type}Data`]);
		for (let i = 0; i < _keyNum; i++) {
			g_scoreObj[`${type}Data`][i] = tmpData[index[i]] || [];
		}
	});
};

/**
 * X-Mirror作成用の入れ替え関数
 * グループが4の倍数のとき、4n+1, 4n+2のみ入れ替える
 * @param {number[][]} _style 
 * @param {number[]} _group 
 * @param {number} _i 
 * @param {number} _divideNum 
 * @returns {number[][]}
 */
const swapGroupNums = (_style, _group, _i, _divideNum) => {
	if (_group.length % _divideNum === 0) {
		for (let k = 0; k < _group.length / _divideNum; k++) {
			const swap1 = Math.floor(_divideNum * (k + 1 / 2) - 1);
			const swap2 = Math.ceil(_divideNum * (k + 1 / 2));
			[_style[_i][swap1], _style[_i][swap2]] = [_style[_i][swap2], _style[_i][swap1]];
		}
	}
	return _style;
};

/**
 * Mirrorの適用
 * @param {number} _keyNum
 * @param {number[][]} _shuffleGroup
 * @param {boolean} [_swapFlg=false]
 */
const applyMirror = (_keyNum, _shuffleGroup, _swapFlg = false) => {

	// シャッフルグループごとにミラー
	const style = structuredClone(_shuffleGroup).map(_group => _group.reverse());
	const mirStyle = structuredClone(style);

	if (_swapFlg) {
		style.forEach((group, i) => {
			g_settings.swapPattern.forEach(val => {
				swapGroupNums(style, group, i, val);
			});
		});
		let swapUseFlg = false;
		style.forEach((_group, j) => {
			_group.forEach((val, k) => {
				if (style[j][k] !== mirStyle[j][k]) {
					swapUseFlg = true;
					return;
				}
			});
		});
		if (!swapUseFlg) {
			g_stateObj.shuffle = `Mirror`;
		}
	}
	applyShuffle(_keyNum, _shuffleGroup, style);
};

/**
 * Turningの適用
 * @param {number} _keyNum 
 * @param {number[][]} _shuffleGroup 
 */
const applyTurning = (_keyNum, _shuffleGroup) => {
	const mirrorOrNot = _array => Math.random() >= 0.5 ? _array.reverse() : _array;
	const style = structuredClone(_shuffleGroup).map(_group => {
		const startNum = Math.floor(Math.random() * (_group.length - 1)) + 1;
		return mirrorOrNot(makeDedupliArray(_group.slice(startNum), _group.slice(0, startNum)));
	});
	applyShuffle(_keyNum, _shuffleGroup, style);
};

/**
 * Randomの適用
 * @param {number} _keyNum
 * @param {number[][]} _shuffleGroup
 */
const applyRandom = (_keyNum, _shuffleGroup) => {
	// シャッフルグループごとにシャッフル(Fisher-Yates)
	const style = structuredClone(_shuffleGroup).map(_group => {
		for (let i = _group.length - 1; i > 0; i--) {
			const random = Math.floor(Math.random() * (i + 1));
			[_group[i], _group[random]] = [_group[random], _group[i]];
		}
		return _group;
	});
	applyShuffle(_keyNum, _shuffleGroup, style);
};

/**
 * S-Randomの適用
 * @param {number} _keyNum
 * @param {number[][]} _shuffleGroup
 * @param {string} _arrowHeader
 * @param {string} _frzHeader
 */
const applySRandom = (_keyNum, _shuffleGroup, _arrowHeader, _frzHeader) => {

	const tmpArrowData = [...Array(_keyNum)].map(() => []);
	const tmpFrzData = [...Array(_keyNum)].map(() => []);
	const scatterFrame = 10;

	// シャッフルグループごとに処理
	_shuffleGroup.forEach(_group => {
		// 全フリーズを開始フレーム順に並べる
		const allFreezeArrows = [];
		_group.forEach(_key => {
			const frzData = g_scoreObj[`${_frzHeader}Data`][_key] || [];
			for (let i = 0; i < frzData.length; i += 2) {
				allFreezeArrows.push({ begin: frzData[i], end: frzData[i + 1] });
			}
		});
		allFreezeArrows.sort((_a, _b) => _a.begin - _b.begin);

		// 重ならないようにフリーズを配置
		allFreezeArrows.forEach(_freeze => {
			// 置ける場所を検索
			const freeSpacesFlat = _group.filter(
				_key => tmpFrzData[_key].find(_other => _freeze.begin - scatterFrame <= _other.end + scatterFrame) === undefined
			);
			const freeSpaces = _group.filter(
				_key => tmpFrzData[_key].find(_other => _freeze.begin <= _other.end) === undefined
			);
			let currentFreeSpaces = freeSpaces;
			if (g_stateObj.shuffle.startsWith(`Scatter`)) {
				currentFreeSpaces = freeSpacesFlat.length > 0 ? freeSpacesFlat : freeSpaces;
			}
			// ランダムに配置
			const random = Math.floor(Math.random() * currentFreeSpaces.length);
			tmpFrzData[currentFreeSpaces[random]].push(_freeze);
		});

		// 通常矢印の配置
		const allArrows = _group.map(_key => g_scoreObj[`${_arrowHeader}Data`][_key]).flat();
		allArrows.sort((_a, _b) => _a - _b);
		let prev2Num = 0, prevNum = 0, sameFlg = true;
		allArrows.forEach(_arrow => {

			// 直前の矢印のフレーム数を取得
			sameFlg = true;
			if (prev2Num !== _arrow && prevNum !== _arrow) {
				prev2Num = prevNum;
				prevNum = _arrow;
				sameFlg = false;
			}

			const getFreeSpaces = ({ scatterFrame = 0, frzFlg = false, prevFlg = false } = {}) =>
				_group.filter(_key =>
					// 通常矢印と重ならない
					tmpArrowData[_key].find(_other => _arrow >= _other - scatterFrame && _arrow <= _other + scatterFrame) === undefined
					// フリーズと重ならない
					&& (!frzFlg || tmpFrzData[_key].find(_freeze => _arrow >= _freeze.begin - scatterFrame && _arrow <= _freeze.end + scatterFrame) === undefined)
					// 直前の矢印と重ならない
					&& (!prevFlg || tmpArrowData[_key].find(_other => prev2Num === _other) === undefined)
				);

			// 置ける場所を検索
			const freeSpacesFlat = getFreeSpaces({ scatterFrame, frzFlg: true, prevFlg: true });
			const freeSpaces = getFreeSpaces({ frzFlg: true });
			const freeSpacesAlt = getFreeSpaces();

			// ランダムに配置
			let currentFreeSpaces = freeSpaces.length > 0 ? freeSpaces : freeSpacesAlt;
			if (g_stateObj.shuffle.startsWith(`Scatter`)) {
				currentFreeSpaces = freeSpacesFlat.length > 0 && !sameFlg ? freeSpacesFlat : currentFreeSpaces;
			}
			const random = Math.floor(Math.random() * currentFreeSpaces.length);
			tmpArrowData[currentFreeSpaces[random]].push(_arrow);
		})
	});

	g_scoreObj[`${_arrowHeader}Data`] = tmpArrowData;
	g_scoreObj[`${_frzHeader}Data`] = tmpFrzData.map(_freezes =>
		_freezes.map(_freeze => [_freeze.begin, _freeze.end]).flat()
	);
};

/**
 * 譜面データの分解
 * @param {object} _dosObj 
 * @param {number} _scoreId 譜面番号
 * @param {number} _preblankFrame 補完フレーム数
 * @param {string} [_dummyNo] ダミー用譜面番号添え字
 * @param {string} [_keyCtrlPtn] 選択キー及びパターン
 * @param {boolean} [_scoreAnalyzeFlg=false] 譜面詳細データのために必要分で読込を中断
 * @returns {object} 矢印・フリーズアロー・速度/色変化データの格納オブジェクト
 */
const scoreConvert = (_dosObj, _scoreId, _preblankFrame, _dummyNo = ``,
	_keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`, _scoreAnalyzeFlg = false) => {

	// 矢印群の格納先
	const obj = {};

	const scoreIdHeader = setScoreIdHeader(_scoreId, g_stateObj.scoreLockFlg, false);
	const keyNum = g_keyObj[`${g_keyObj.defaultProp}${_keyCtrlPtn}`].length;
	obj.arrowData = [];
	obj.frzData = [];
	obj.dummyArrowData = [];
	obj.dummyFrzData = [];

	// realAdjustment: 全体, intAdjustment: 整数値のみ(切り捨て、ファイル時のみ四捨五入), decimalAdjustment: 小数値のみ
	const headerAdjustment = parseFloat(g_headerObj.adjustment[g_stateObj.scoreId] || g_headerObj.adjustment[0]);
	g_stateObj.realAdjustment = (parseFloat(g_stateObj.adjustment) + headerAdjustment) / g_headerObj.playbackRate + _preblankFrame;
	g_stateObj.intAdjustment = isLocalMusicFile(g_stateObj.scoreId) ?
		Math.round(g_stateObj.realAdjustment) : Math.floor(g_stateObj.realAdjustment);
	g_stateObj.decimalAdjustment = g_stateObj.realAdjustment - g_stateObj.intAdjustment;

	const blankFrame = g_headerObj.blankFrame;
	const calcFrame = _frame => Math.round((parseFloat(_frame) - blankFrame) / g_headerObj.playbackRate + blankFrame + g_stateObj.intAdjustment);

	/**
	 * 矢印データの格納
	 * @param {string} _data 
	 * @returns {number[]}
	 */
	const storeArrowData = _data => hasVal(_data) ?
		splitLF(_data)?.join(``).split(`,`).filter(data => !isNaN(parseFloat(data))).map(data => calcFrame(data)).sort((_a, _b) => _a - _b) : [];

	for (let j = 0; j < keyNum; j++) {

		// 矢印データの分解
		const arrowName = g_keyObj[`chara${_keyCtrlPtn}`][j];
		obj.arrowData[j] = storeArrowData(_dosObj[`${arrowName}${scoreIdHeader}_data`]);

		if (g_stateObj.dummyId !== ``) {
			obj.dummyArrowData[j] = storeArrowData(_dosObj[`${arrowName}${_dummyNo}_data`]);
		}

		// 矢印名からフリーズアロー名への変換
		let frzName = replaceStr(g_keyObj[`chara${_keyCtrlPtn}`][j], g_escapeStr.frzName);
		if (frzName.indexOf(`frz`) === -1 && frzName.indexOf(`foni`) === -1) {
			frzName = frzName.replaceAll(frzName, `frz${toCapitalize(frzName)}`);
		}

		// フリーズアローデータの分解 (2つで1セット)
		obj.frzData[j] = storeArrowData(_dosObj[`${frzName}${scoreIdHeader}_data`]);

		if (g_stateObj.dummyId !== ``) {
			obj.dummyFrzData[j] = storeArrowData(_dosObj[`${frzName}${_dummyNo}_data`]);
		}
	}

	/**
	 * 速度変化データの分解・格納（フレーム数, 矢印番号）
	 * @param {string} _header 
	 * @param {number} _scoreNo 
	 * @param {string} _footer 
	 * @returns {number[]}
	 */
	const setSpeedData = (_header, _scoreNo, _footer = `_data`) => {
		const dosSpeedData = getRefData(_header, `${_scoreNo}${_footer}`);
		const speedData = [];

		if (hasVal(dosSpeedData) && g_stateObj.d_velocity !== C_FLG_OFF) {
			const tmpArrayData = splitLF(dosSpeedData);

			tmpArrayData.filter(data => hasVal(data)).forEach(tmpData => {
				const tmpSpeedData = tmpData.split(`,`);
				for (let k = 0; k < tmpSpeedData.length; k += 2) {
					if (!hasVal(tmpSpeedData[k])) {
						continue;
					} else if (tmpSpeedData[k + 1] === `-`) {
						break;
					}
					const frame = calcFrame(setVal(tmpSpeedData[k], ``, C_TYP_CALC));
					const speed = setVal(tmpSpeedData[k + 1], 1, C_TYP_CALC);

					speedData.push([frame, speed]);
				}
			});
			return speedData.sort((_a, _b) => _a[0] - _b[0]).flat();
		}
		return [];
	};

	/**
	 * 個別・全体色変化データをマージして整列し、単純配列として返却
	 * @param {string} _header 
	 * @returns {any[]}
	 */
	const mergeColorData = (_header = ``) => {
		if (obj[`color${_header}Data`] === undefined) return [];
		const tmpArr = obj[`color${_header}Data`].concat(obj[`acolor${_header}Data`]);
		delete obj[`acolor${_header}Data`];
		return tmpArr.sort((_a, _b) => _a[0] - _b[0]).flat();
	};

	/**
	 * 色変化データの分解・格納（フレーム数, 矢印番号）
	 * 後で個別・全体色変化をマージするため、二次元配列として返却
	 * @param {string} _header 
	 * @param {number} _scoreNo 
	 * @returns {any[][]}
	 */
	const setColorData = (_header, _scoreNo) => {
		const dosColorData = getRefData(_header, `${_scoreNo}_data`);
		const colorData = [];
		const allFlg = (_header.charAt(0) === `a`);

		if (hasVal(dosColorData) && g_stateObj.d_color === C_FLG_ON) {
			const tmpArrayData = splitLF(dosColorData);

			tmpArrayData.filter(data => hasVal(data)).forEach(tmpData => {
				const tmpColorData = tmpData.split(`,`);
				for (let k = 0; k < tmpColorData.length; k += 3) {
					if (!hasVal(tmpColorData[k])) {
						continue;
					} else if (tmpColorData[k + 1] === `-`) {
						break;
					}
					const frame = calcFrame(setVal(tmpColorData[k], ``, C_TYP_CALC));
					const colorNum = setVal(tmpColorData[k + 1], 0, C_TYP_CALC);
					const colorCd = tmpColorData[k + 2];

					// フレーム数、色番号、カラーコード、全体色変化フラグをセットとして配列化
					colorData.push([frame, colorNum, colorCd, allFlg]);
				}
			});
			return colorData.sort((_a, _b) => _a[0] - _b[0]);
		}
		return [];
	};

	/**
	 * 色変化データの分解・格納（新形式）
	 * - 個別・全体色変化を一体で管理するため通常の配列で返却
	 * @param {string} _header 
	 * @param {number} _scoreNo 
	 * @returns {any[][]}
	 */
	const setColor2Data = (_header, _scoreNo) => {
		const dosColorData = getRefData(_header, `${_scoreNo}_data`);
		const colorData = {
			Arrow: [], ArrowShadow: [], Normal: [], NormalBar: [], NormalShadow: [],
			Hit: [], HitBar: [], HitShadow: [],
		};

		if (hasVal(dosColorData) && g_stateObj.d_color === C_FLG_ON) {

			splitLF(dosColorData).filter(data => hasVal(data)).forEach(tmpData => {
				const tmpColorData = tmpData.split(`,`).map(val => trimStr(val));
				if (!hasVal(tmpColorData[0]) || tmpColorData[1] === `-`) {
					return;
				}
				const frame = calcFrame(setVal(tmpColorData[0], ``, C_TYP_CALC));
				const colorCd = tmpColorData[2];

				// 色変化対象の取得
				const pos = tmpColorData[1]?.indexOf(`:`);
				const patternStr = pos > 0 ? [trimStr(tmpColorData[1].substring(0, pos)), trimStr(tmpColorData[1].substring(pos + 1))]
					: [tmpColorData[1]];
				const patterns = replaceStr(trimStr(patternStr[1] || `Arrow`), g_escapeStr.colorPatternName).split(`/`);

				// 矢印番号の組み立て
				const colorVals = [];
				replaceStr(patternStr[0], g_escapeStr.targetPatternName)?.split(`/`)?.forEach(val => {
					if (val.indexOf(`...`) > 0) {
						// 範囲指定表記の補完 例. 0...3 -> 0/1/2/3
						const [valMin, valMax] = [val.split(`...`)[0], val.split(`...`)[1]].map(val => setIntVal(val));
						for (let k = valMin; k <= valMax; k++) {
							colorVals.push(String(k));
						}
					} else {
						colorVals.push(val);
					}
				});

				// フレーム数、色番号、カラーコード、全体色変化フラグ、変更対象をセットとして配列化し、色変化対象ごとのプロパティへ追加
				patterns.forEach(pattern => {
					try {
						colorVals.forEach(val => colorData[pattern].push([frame, val, colorCd, hasVal(tmpColorData[3]), pattern]));
					} catch (error) {
						makeWarningWindow(g_msgInfoObj.E_0201.split(`{0}`).join(pattern));
					}
				});
			});
			// 色変化対象ごとにフレーム数をキーにソートしてフラット化
			Object.keys(colorData).forEach(pattern =>
				colorData[pattern] = colorData[pattern].sort((_a, _b) => _a[0] - _b[0]).flat());
		}
		return colorData;
	};

	/**
	 * 矢印モーションデータの分解・格納（フレーム数, 矢印番号）
	 * @param {string} _header 
	 * @param {number} _scoreNo 
	 * @returns {any[]}
	 */
	const setCssMotionData = (_header, _scoreNo) => {
		const dosCssMotionData = getRefData(`${_header}Motion`, `${_scoreNo}_data`) || _dosObj[`${_header}Motion_data`];
		const cssMotionData = [];

		if (hasVal(dosCssMotionData) && g_stateObj.d_arroweffect === C_FLG_ON) {
			splitLF(dosCssMotionData).filter(data => hasVal(data)).forEach(tmpData => {
				const tmpcssMotionData = tmpData.split(`,`);
				if (isNaN(parseInt(tmpcssMotionData[0]))) {
					return;
				}
				const frame = calcFrame(tmpcssMotionData[0]);
				const arrowNum = parseFloat(tmpcssMotionData[1]);
				const styleUp = (tmpcssMotionData[2] === `none` ? `` : tmpcssMotionData[2]);
				const styleDown = (tmpcssMotionData[3] === `none` ? `` : setVal(tmpcssMotionData[3], styleUp));
				const movLock = setBoolVal(tmpcssMotionData[4] === `movLock`, false);
				const initManual = setBoolVal(tmpcssMotionData[5] === `initManual`, false);

				cssMotionData.push([frame, arrowNum, styleUp, styleDown, movLock, initManual]);
			});

			// 個別のモーションデータが存在する場合、Effect設定を自動リセット
			if (cssMotionData.length > 0) {
				g_stateObj.effect = C_FLG_OFF;
				g_settings.effectNum = 0;
			}
			return cssMotionData.sort((_a, _b) => _a[0] - _b[0]).flat();
		}
		return [];
	};

	/**
	 * スクロール変化データの分解
	 * @param {number} _scoreNo 
	 * @returns {number[]}
	 */
	const setScrollchData = (_scoreNo) => {
		const dosScrollchData = getRefData(`scrollch`, `${_scoreNo}_data`) || _dosObj.scrollch_data;
		const scrollchData = [];
		let maxLayerGroup = 0;

		if (hasVal(dosScrollchData)) {
			splitLF(dosScrollchData).filter(data => hasVal(data)).forEach(tmpData => {
				const tmpScrollchData = tmpData.split(`,`);
				if (isNaN(parseInt(tmpScrollchData[0]))) {
					return;
				}
				const frame = calcFrame(tmpScrollchData[0]);
				const arrowNum = parseFloat(tmpScrollchData[1]);
				const scrollDir = parseFloat(tmpScrollchData[2] ?? `1`);
				const layerGroup = parseFloat(tmpScrollchData[3] ?? `-1`);
				let layerTrans = tmpScrollchData[4] ?? ``;
				maxLayerGroup = Math.max(maxLayerGroup, layerGroup);
				if (g_stateObj.reverse === C_FLG_ON) {
					layerTrans = invertSpecificTransforms(layerTrans, [`translateX`]);
				}
				if (g_stateObj.swapping === `Mirror+`) {
					layerTrans = invertSpecificTransforms(layerTrans, [`translateY`]);
				}

				scrollchData.push([frame, arrowNum, frame, scrollDir, layerGroup, layerTrans]);
			});
			g_stateObj.layerNumDf = Math.max((maxLayerGroup + 1) * 2, 2);
			return scrollchData.sort((_a, _b) => _a[0] - _b[0]).flat();
		}
		return [];
	};

	/**
	 * 譜面データに別の関連名が含まれていた場合、関連名の変数を返す
	 * 例) |backA2_data=back_data| -> back_dataで定義された値を使用
	 * @param {string} _header 
	 * @param {string} _dataName 
	 * @returns {string|undefined}
	 */
	const getRefData = (_header, _dataName) => {
		const data = _dosObj[`${_header}${_dataName}`];
		let dataStr = data;
		splitLF(data)?.filter(val => val?.startsWith(_header) && _dosObj[val] !== undefined)
			.forEach(val => dataStr = dataStr.replace(val, _dosObj[val]));
		return dataStr;
	};

	/**
	 * 譜面データの優先順配列パターンの取得
	 * @param {string} _type 
	 * @param {number} _scoreNo 
	 * @returns {string[]}
	 */
	const getPriorityVal = (_type, _scoreNo) => [
		`${_type}${g_localeObj.val}${_scoreNo}_data`,
		`${_type}${g_localeObj.val}_data`,
		`${_type}${_scoreNo}_data`,
		`${_type}_data`
	];

	/**
	 * 歌詞表示、背景・マスクデータの優先順取得
	 * @param {string[]} _defaultHeaders 
	 * @returns {string[]}
	 */
	const getPriorityHeader = (_defaultHeaders = []) => {
		if (_defaultHeaders.length > 0) {
			return makeDedupliArray(_defaultHeaders);
		}

		const list = [];
		const ptnName = `${(g_keyObj.currentPtn === -1 ? g_keyObj.storagePtn : g_keyObj.currentPtn) + 1}`;
		const keyName = setVal(g_keyObj[`transKey${_keyCtrlPtn}`], g_keyObj.currentKey);
		let type = ``;
		if (g_stateObj.scroll !== C_FLG_HYPHEN) {
			type = `Alt`;
		} else if (g_stateObj.reverse === C_FLG_ON) {
			type = `Rev`;
		}

		[g_stateObj.scroll, type, ``].forEach(header => {
			list.push(`${header}[${ptnName}]`, `${header}<${keyName}>`);
			if (hasVal(g_keyObj[`transKey${_keyCtrlPtn}`])) {
				list.push(`${header}A`);
			}
		});
		list.push(g_stateObj.scroll, type, ``);

		return makeDedupliArray(list);
	};

	/**
	 * 歌詞データの分解
	 * @param {string} _scoreNo 
	 * @returns {string[][]}
	 */
	const makeWordData = _scoreNo => {
		const wordDataList = [];
		const wordTargets = [];
		let wordReverseFlg = false;
		const divideCnt = getKeyInfo().divideCnt;
		const addDataList = (_type = ``) => wordTargets.push(...getPriorityVal(_type, _scoreNo));
		getPriorityHeader().forEach(val => addDataList(val));
		makeDedupliArray(wordTargets).forEach(val => wordDataList.push(getRefData(`word`, val)));

		if (g_stateObj.reverse === C_FLG_ON) {
			let wordTarget = ``;
			for (let val of makeDedupliArray(wordTargets)) {
				if (getRefData(`word`, val) !== undefined) {
					wordTarget = val;
					break;
				}
			}

			// wordRev_dataが指定されている場合はそのままの位置を採用
			// word_dataのみ指定されている場合、下記ルールに従って設定
			if (!wordTarget.includes(`Rev`) && g_stateObj.scroll === C_FLG_HYPHEN) {
				// Reverse時の歌詞の自動反転制御設定
				if (g_headerObj.wordAutoReverse !== C_DIS_AUTO) {
					wordReverseFlg = g_headerObj.wordAutoReverse === C_FLG_ON;
				} else if (keyNum === divideCnt + 1) {
					wordReverseFlg = true;
				}
			}
		}

		const inputWordData = wordDataList.find((v) => v !== undefined);
		return (inputWordData !== undefined ? makeSpriteWordData(inputWordData, wordReverseFlg) : [[], -1]);
	};

	/**
	 * 多層歌詞データの格納処理
	 * @param {object} _data 
	 * @param {boolean} _reverseFlg
	 * @returns
	 */
	const makeSpriteWordData = (_data, _reverseFlg = false) => {
		const wordData = [];
		let wordMaxDepth = -1;
		let wordReverseFlg = _reverseFlg;
		const tmpArrayData = splitLF(_data);

		if (g_headerObj.wordAutoReverse === C_DIS_AUTO) {
			tmpArrayData.filter(data => hasVal(data) && data?.indexOf(`<br>`) !== -1).forEach(() => wordReverseFlg = false);
		}

		tmpArrayData.filter(data => hasVal(data)).forEach(tmpData => {
			const tmpWordData = tmpData.split(`,`).map(val => trimStr(val));
			for (let k = 0; k < tmpWordData.length; k += 3) {
				if (!hasVal(tmpWordData[k])) {
					continue;
				} else if (tmpWordData[k + 1] === `-`) {
					break;
				}
				tmpWordData[k] = calcFrame(setVal(tmpWordData[k], ``, C_TYP_CALC));
				tmpWordData[k + 1] = setVal(tmpWordData[k + 1], 0, C_TYP_CALC);
				tmpWordData[k + 1] = Math.floor(tmpWordData[k + 1] / 2) * 2 +
					(tmpWordData[k + 1] + Number(wordReverseFlg)) % 2;

				if (tmpWordData[k + 1] > wordMaxDepth) {
					wordMaxDepth = tmpWordData[k + 1];
				}

				// 同一行数で数字が取得できるまでは歌詞表示と見做して結合
				let m = 3;
				while (hasVal(tmpWordData[m]) && isNaN(parseInt(tmpWordData[m])) && m < tmpWordData.length) {
					tmpWordData[k + 2] += `,${tmpWordData[k + m]}`;
					tmpWordData.splice(k + m, 1);
				}

				// 歌詞表示データの格納
				let dataCnts = 0;
				[wordData[tmpWordData[k]], dataCnts] =
					checkDuplicatedObjects(wordData[tmpWordData[k]]);

				if (tmpWordData.length > 3 && tmpWordData.length < 6) {
					tmpWordData[3] = setIntVal(tmpWordData[3], C_WOD_FRAME);
					wordData[tmpWordData[0]][dataCnts].push(tmpWordData[1],
						escapeHtmlForEnabledTag(tmpWordData[2]), tmpWordData[3]);
					break;
				} else {
					wordData[tmpWordData[k]][dataCnts].push(tmpWordData[k + 1],
						escapeHtmlForEnabledTag(tmpWordData[k + 2] ?? ``));
				}
			}
		});

		return [wordData, wordMaxDepth];
	};

	/**
	 * 背景・マスク、スキン変更データの分解
	 * @param {string} _header 
	 * @param {string} _scoreNo 譜面番号
	 * @param {string[]} [object.resultTypes] リザルトモーションの種類 (result, failedB, failedS)
	 * @returns {any[][]}
	 */
	const makeBackgroundData = (_header, _scoreNo, { resultTypes = [] } = {}) => {
		const dataList = [];
		const animationTargets = [];
		const calcFrameFunc = resultTypes.length > 0 ? undefined : calcFrame;
		const addDataList = (_type = ``) => animationTargets.push(...getPriorityVal(_type, _scoreNo));
		getPriorityHeader(resultTypes).forEach(val => addDataList(val));
		makeDedupliArray(animationTargets).forEach(val => dataList.push(getRefData(_header, val)));

		const data = dataList.find((v) => v !== undefined);
		return (data !== undefined ? g_animationFunc.make[_header](data, calcFrameFunc) : [[], -1]);
	};

	// 速度変化データの分解 (2つで1セット)
	let speedFooter = ``;
	if (hasVal(_dosObj[`speed${scoreIdHeader}_data`])) {
		speedFooter = `_data`;
	}
	if (hasVal(_dosObj[`speed${scoreIdHeader}_change`])) {
		speedFooter = `_change`;
	}

	// 速度変化（個別・全体）の分解 (2つで1セット, セット毎の改行区切り可)
	obj.boostData = setSpeedData(`boost`, scoreIdHeader);
	obj.speedData = setSpeedData(`speed`, scoreIdHeader, speedFooter);

	// 色変化（個別・全体）の分解 (3つで1セット, セット毎の改行区切り可)
	g_typeLists.color.forEach(sprite => {
		obj[`${sprite}Data`] = setColorData(sprite, scoreIdHeader);
		if (g_stateObj.dummyId !== ``) {
			obj[`${sprite}DummyData`] = setColorData(sprite, _dummyNo);
		}
	});
	// 色変化（新形式）の分解（3～4つで1セット, セット毎の改行区切り）
	obj.ncolorData = setColor2Data(`ncolor`, scoreIdHeader);
	if (g_stateObj.dummyId !== ``) {
		obj.ncolorDummyData = setColor2Data(`ncolor`, _dummyNo);
	}

	if (_scoreAnalyzeFlg) {
		return obj;
	}

	obj.colorData = mergeColorData();
	obj.dummyColorData = mergeColorData(`Dummy`);

	// レイヤー数の初期値設定（譜面ごとに設定のため）
	g_stateObj.layerNumDf = 2;

	// 矢印モーション（個別）データの分解（3～4つで1セット, セット毎の改行区切り）
	obj.arrowCssMotionData = setCssMotionData(`arrow`, scoreIdHeader);
	obj.frzCssMotionData = setCssMotionData(`frz`, scoreIdHeader);
	if (g_stateObj.dummyId !== ``) {
		obj.dummyArrowCssMotionData = setCssMotionData(`arrow`, _dummyNo);
		obj.dummyFrzCssMotionData = setCssMotionData(`frz`, _dummyNo);
	}

	// スクロール変化データの分解
	obj.scrollchData = setScrollchData(scoreIdHeader);

	// 歌詞データの分解 (3つで1セット, セット毎の改行区切り可)
	obj.wordData = [];
	obj.wordMaxDepth = -1;
	if (g_stateObj.d_background === C_FLG_OFF) {
	} else {
		[obj.wordData, obj.wordMaxDepth] = makeWordData(scoreIdHeader);
	}

	// 背景・マスク・スキン変更データの分解 (下記すべてで1セット、改行区切り)
	// - 背景・マスク: [フレーム数, 階層, 背景パス, class(CSSで別定義), X, Y, width, height, opacity, animationName, animationDuration, animationFillMode]
	// - スキン変更  : [フレーム数, CSSカスタムプロパティ名, 設定内容]
	g_animationData.forEach(sprite => {
		obj[`${sprite}Data`] = [];
		obj[`${sprite}MaxDepth`] = -1;

		if (g_stateObj.d_background === C_FLG_OFF) {
		} else {
			[obj[`${sprite}Data`], obj[`${sprite}MaxDepth`]] = makeBackgroundData(sprite, scoreIdHeader);
		}

		if (g_stateObj.d_background === C_FLG_OFF && g_headerObj.resultMotionSet) {
			[`Result`, `Failed`].forEach(backName => {
				g_headerObj[`${backName}Data`] = [];
				g_headerObj[`${backName}MaxDepth`] = -1;
			});
		} else {
			[g_headerObj[`${sprite}ResultData`], g_headerObj[`${sprite}ResultMaxDepth`]] =
				makeBackgroundData(sprite, scoreIdHeader, { resultTypes: [`result`] });
			[g_headerObj[`${sprite}FailedData`], g_headerObj[`${sprite}FailedMaxDepth`]] =
				makeBackgroundData(sprite, scoreIdHeader, { resultTypes: [`failed${g_stateObj.lifeMode.slice(0, 1)}`, `result`] });
		}
	});

	// キー変化定義
	obj.keychFrames = [];
	obj.keychTarget = [];
	obj.keychTargetAlpha = [];
	if (hasVal(getRefData(`keych`, `${scoreIdHeader}_data`))) {
		const keychdata = splitLF2(getRefData(`keych`, `${scoreIdHeader}_data`), `,`);
		obj.keychFrames.push(...(keychdata.filter((val, j) => j % 2 === 0)).map(val => val === `0` ? 0 : calcFrame(val)));

		keychdata.filter((val, j) => j % 2 === 1)?.forEach(targets => {
			const targetKeyList = [], targetKeyAlpha = [];
			targets?.split(`/`).forEach(target => {
				targetKeyList.push(trimStr(target?.split(`:`)[0]));
				targetKeyAlpha.push(trimStr(target?.split(`:`)[1]) || 1);
			})
			obj.keychTarget.push(targetKeyList);
			obj.keychTargetAlpha.push(targetKeyAlpha);
		});
	}
	obj.keychFrames.unshift(0);
	obj.keychTarget.unshift([`0`]);
	obj.keychTargetAlpha.unshift([1]);

	return obj;
};

/**
 * ライフ回復量・ダメージ量の算出
 * @param {number} _allArrows 
 */
const calcLifeVals = _allArrows => {

	if (g_stateObj.lifeVariable === C_FLG_ON) {
		g_workObj.lifeRcv = calcLifeVal(g_stateObj.lifeRcv, _allArrows);
		g_workObj.lifeDmg = calcLifeVal(g_stateObj.lifeDmg, _allArrows);
	} else {
		g_workObj.lifeRcv = g_stateObj.lifeRcv;
		g_workObj.lifeDmg = g_stateObj.lifeDmg;
	}
	g_workObj.lifeBorder = g_headerObj.maxLifeVal * g_stateObj.lifeBorder / 100;
	g_workObj.lifeInit = g_headerObj.maxLifeVal * g_stateObj.lifeInit / 100;
};

/**
 * ライフ回復量・ダメージ量の算出
 * @param {number} _val 
 * @param {number} _allArrows 
 * @returns {number}
 */
const calcLifeVal = (_val, _allArrows) => _val * g_headerObj.maxLifeVal / _allArrows;

/**
 * 最終フレーム数の取得
 * @param {object} _dataObj 
 * @param {string} [_keyCtrlPtn]
 * @returns {number}
 */
const getLastFrame = (_dataObj, _keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`) => {

	let tmpLastNum = 0;
	const keyNum = g_keyObj[`${g_keyObj.defaultProp}${_keyCtrlPtn}`].length;

	for (let j = 0; j < keyNum; j++) {
		const data = [
			_dataObj.arrowData[j],
			_dataObj.frzData[j],
			_dataObj.dummyArrowData[j],
			_dataObj.dummyFrzData[j]
		];

		data.filter(data => hasVal(data)).forEach(_objData => {
			if (_objData.at(-1) > tmpLastNum) {
				tmpLastNum = _objData.at(-1);
			}
		});
	}
	return tmpLastNum;
};

/**
 * 最初の矢印フレームの取得
 * @param {object} _dataObj 
 * @param {string} [_keyCtrlPtn]
 * @returns {number}
 */
const getFirstArrowFrame = (_dataObj, _keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`) => {

	let tmpFirstNum = Infinity;
	const keyNum = g_keyObj[`${g_keyObj.defaultProp}${_keyCtrlPtn}`].length;

	for (let j = 0; j < keyNum; j++) {
		const data = [
			_dataObj.arrowData[j],
			_dataObj.frzData[j],
			_dataObj.dummyArrowData[j],
			_dataObj.dummyFrzData[j]
		];

		data.filter(data => hasVal(data)).forEach(_objData => {
			if (_objData[0] !== `` && _objData[0] < tmpFirstNum && _objData[0] + g_limitObj.adjustment > 0) {
				tmpFirstNum = _objData[0];
			}
		});
	}
	return (tmpFirstNum === Infinity ? 0 : tmpFirstNum);
};

/**
 * 開始フレームの取得
 * @param {number} _lastFrame 
 * @param {number} [_fadein=0]
 * @param {number} [_scoreId=g_scoreObj.scoreId]
 * @returns {number}
 */
const getStartFrame = (_lastFrame, _fadein = 0, _scoreId = g_stateObj.scoreId) => {
	let frameNum = setIntVal(g_headerObj.startFrame?.[_scoreId], setIntVal(g_headerObj.startFrame?.[0], 0));
	if (_lastFrame >= frameNum) {
		frameNum = Math.round(_fadein / 100 * (_lastFrame - frameNum)) + frameNum;
	}
	return frameNum;
};

/**
 * 速度補正値の算出
 * @param {number} _speed 
 * @returns {number}
 */
const getSpeedFactor = _speed => {
	if (Math.abs(_speed) === 1) {
		// ±1 はそのまま返して符号を保持
		return _speed;
	}
	if (g_stateObj.d_velocity === `Extreme`) {
		// |speed|>1 を強めに、<1 を弱めに
		return _speed * (Math.abs(_speed) > 1 ? 1.5 : 0.75);
	}
	if (g_stateObj.d_velocity === `Soft`) {
		// 変化幅を緩和（符号は維持）
		return (1 + Math.abs(_speed)) / 2 * Math.sign(_speed);
	}
	return _speed;
};

/**
 * 各フレームごとの速度を格納
 * @param {object} _speedData 
 * @param {number} _lastFrame 
 * @returns {number[]}
 */
const setSpeedOnFrame = (_speedData, _lastFrame) => {

	const speedOnFrame = [];
	let currentSpeed = g_stateObj.speed * g_headerObj.baseSpeed * 2;

	for (let frm = 0, s = 0; frm <= _lastFrame; frm++) {
		while (frm >= _speedData?.[s]) {
			currentSpeed = getSpeedFactor(_speedData[s + 1]) * g_stateObj.speed * g_headerObj.baseSpeed * 2;
			s += 2;
		}
		speedOnFrame[frm] = currentSpeed;
	}
	return speedOnFrame;
};

/**
 * Motionオプション適用時の矢印別の速度設定
 * - 矢印が表示される最大フレーム数を 101フレーム と定義。
 * @returns {number[]}
 */
const setMotionOnFrame = () => g_motionFunc.get(g_stateObj.motion)(fillArray(101));

/**
 * Boost用の適用関数
 * - ステップゾーンに近づくにつれて加速量を大きく/小さくする (16 → 85)
 * @param {number[]} _frms 
 * @param {number} _spd 
 * @param {number} [_pnFlg=1] 正負(1 もしくは -1) 
 * @returns {number[]}
 */
const getBoostTrace = (_frms, _spd, _pnFlg = 1) => {
	for (let j = C_MOTION_STD_POS + 1; j < C_MOTION_STD_POS + 70; j++) {
		_frms[j] = (C_MOTION_STD_POS + 70 - j) * _pnFlg * _spd / 50;
	}
	return _frms;
};

/**
 * Brake用の適用関数
 * - 初期は+2x、ステップゾーンに近づくにつれて加速量を下げる (20 → 34)
 * @param {number[]} _frms
 * @returns {number[]} 
 */
const getBrakeTrace = _frms => {
	for (let j = C_MOTION_STD_POS + 5; j < C_MOTION_STD_POS + 19; j++) {
		_frms[j] = (j - 15) * 4 / 14;
	}
	for (let j = C_MOTION_STD_POS + 19; j <= g_headerObj.playingHeight / 2; j++) {
		_frms[j] = 4;
	}
	return _frms;
};

/**
 * Fountain用の適用関数
 * - 反対側から出現し、画面中央付近で折り返す。タイミングは初期速度により変化。
 * @param {number[]} _frms 
 * @param {number} _spd
 * @returns {number[]}
 */
const getFountainTrace = (_frms, _spd) => {
	const minj = C_MOTION_STD_POS + 1;
	const maxj = C_MOTION_STD_POS + Math.ceil(400 / _spd) + 1;
	const maxMotionFrm = Math.max(maxj, C_MOTION_STD_POS + g_sHeight / 2);
	const diff = 50 / (maxj - minj);
	const factor = 0.5 + _spd / 40;

	for (let j = minj; j < maxMotionFrm; j++) {
		_frms[j] = Math.floor((10 - (j - C_MOTION_STD_POS - 1) * diff) * factor);
	}
	return _frms;
};

/**
 * 最初のフレームで出現する矢印が、ステップゾーンに到達するまでのフレーム数を取得
 * @param {number} _startFrame 
 * @param {object} _speedOnFrame
 * @returns {number} 
 */
const getFirstArrivalFrame = (_startFrame, _speedOnFrame) => {
	let startY = 0;
	let frm = _startFrame;

	while (g_scoreObj.distY - startY > 0) {
		startY += _speedOnFrame[frm];
		frm++;
	}
	return frm;
};

/**
 * 矢印・フリーズアロー・速度/色変化格納処理
 * @param {object} _dataObj 
 * @param {object} _speedOnFrame 
 * @param {number} _firstArrivalFrame
 */
const pushArrows = (_dataObj, _speedOnFrame, _firstArrivalFrame) => {

	// 矢印・フリーズアロー・速度/色変化用 フレーム別処理配列
	[``, `Dummy`].forEach(header =>
		g_typeLists.dataList.forEach(name => g_workObj[`mk${header}${name}`] = []));

	const boostData = [];
	if (hasArrayList(_dataObj.boostData, 2)) {
		const _data = _dataObj.boostData.concat();
		for (let k = 0; k < _data.length; k += 2) {
			boostData.push({ frame: _data[k], spd: getSpeedFactor(_data[k + 1]) });
		}
		if (boostData.length > 0 && boostData[0].frame > 0) {
			boostData.unshift({ frame: 0, spd: 1 });
		}
	}
	const getSpdByFrame = _targetFrame => {
		// targetFrame 以下の frame を持つ要素の中で、最後（最新）のものを見つける
		const result = boostData.findLast((item) => _targetFrame >= item.frame);

		// 該当するものがない場合（frame: 0 未満など）のフォールバック
		return result ? result.spd : 1;
	};

	/**
	 * 矢印・フリーズアローのデータ格納処理
	 * @param {number} _j 
	 * @param {number} _k 
	 * @param {number[]} _data 
	 * @param {number} _startPoint 
	 * @param {string} _header 
	 * @param {boolean} _frzFlg 
	 * @param {number} object.initY
	 * @param {number} object.initBoostY
	 * @param {number} object.arrivalFrame
	 * @param {number} object.motionFrame 
	 */
	const setNotes = (_j, _k, _data, _startPoint, _header, _frzFlg = false, { initY, initBoostY, arrivalFrame, motionFrame, boostSpd } = {}) => {
		if (_startPoint >= 0) {
			const arrowAttrs = {
				pos: _j, initY, initBoostY, arrivalFrame, motionFrame, boostSpd,
				get boostDir() {
					return Math.sign(this.boostSpd);
				}
			};
			if (g_workObj[`mk${_header}Arrow`][_startPoint] === undefined) {
				g_workObj[`mk${_header}Arrow`][_startPoint] = [arrowAttrs];
			} else {
				let insertFlg = false;
				for (let m = 0; m < g_workObj[`mk${_header}Arrow`][_startPoint].length; m++) {
					if (arrowAttrs.arrivalFrame < g_workObj[`mk${_header}Arrow`][_startPoint][m].arrivalFrame) {
						g_workObj[`mk${_header}Arrow`][_startPoint].splice(m, 0, arrowAttrs);
						insertFlg = true;
						break;
					}
				}
				if (!insertFlg) {
					g_workObj[`mk${_header}Arrow`][_startPoint].push(arrowAttrs);
				}
			}
			if (_frzFlg) {
				g_workObj[`mk${_header}Length`][_j][_k] = getFrzLength(_speedOnFrame, _data[_k], _data[_k + 1]);
			}
		} else if (_frzFlg && g_workObj[`mk${_header}Length`][_j] !== undefined) {
			g_workObj[`mk${_header}Length`][_j] = structuredClone(g_workObj[`mk${_header}Length`][_j].slice(_k + 2));
		}
	};

	/**
	 * 矢印・フリーズアローの出現位置計算
	 * @param {number} _j 
	 * @param {number[]} _data 
	 * @param {string} _header 
	 * @param {boolean} _frzFlg 
	 */
	const calcNotes = (_j, _data, _header = ``, _frzFlg = false) => {
		if (_data === undefined) {
			return;
		}

		const calcInitBoostY = _arrivalFrame => sumData(g_workObj.motionOnFrames.filter((val, j) => j <= _arrivalFrame));
		const camelHeader = toCapitalize(_header);
		const setcnt = (_frzFlg ? 2 : 1);
		if (_frzFlg && _data.length % 2 !== 0) {
			_data.pop();
		}

		let spdNext = Infinity;
		let spdk = (_dataObj.speedData?.length ?? 0) - 2;
		let spdPrev = _dataObj.speedData?.[spdk] ?? 0;

		// 最後尾のデータから計算して格納
		const lastk = _data.length - setcnt;
		let arrowArrivalFrm = _data[lastk];
		let tmpObj = getArrowStartFrame(arrowArrivalFrm, _speedOnFrame);

		let startPoint = tmpObj.frm;
		let arrivalFrm = tmpObj.arrivalFrm;
		let minNotesFrame = startPoint;

		if (_frzFlg) {
			g_workObj[`mk${camelHeader}Length`][_j] = [];
		}
		setNotes(_j, lastk, _data, startPoint, camelHeader, _frzFlg, {
			initY: tmpObj.startY, initBoostY: calcInitBoostY(tmpObj.motionFrm),
			arrivalFrame: tmpObj.arrivalFrm, motionFrame: tmpObj.motionFrm, boostSpd: getSpdByFrame(arrowArrivalFrm)
		});

		// 矢印は1つずつ、フリーズアローは2つで1セット
		for (let k = lastk - setcnt; k >= 0; k -= setcnt) {
			arrowArrivalFrm = _data[k];

			if (arrowArrivalFrm < _firstArrivalFrame) {

				// 出現位置が開始前の場合は除外
				if (_frzFlg && g_workObj[`mk${camelHeader}Length`][_j] !== undefined) {
					g_workObj[`mk${camelHeader}Length`][_j] = structuredClone(g_workObj[`mk${camelHeader}Length`][_j].slice(k + 2));
				}
				break;

			} else if ((arrowArrivalFrm - arrivalFrm > spdPrev)
				&& arrowArrivalFrm < spdNext) {

				// 最初から最後まで同じスピードのときは前回のデータを流用（ステップゾーン到達フレーム - 移動フレーム）
				startPoint = arrowArrivalFrm - arrivalFrm;

			} else {

				// 速度変化が間に入るときは再計算
				while (arrowArrivalFrm < spdPrev) {
					spdk -= 2;
					spdNext = spdPrev;
					spdPrev = _dataObj.speedData[spdk];
				}
				tmpObj = getArrowStartFrame(arrowArrivalFrm, _speedOnFrame);
				startPoint = tmpObj.frm;
				arrivalFrm = tmpObj.arrivalFrm;

				// --- 逆転検知ロジック ---
				// 後ろからループしているため、minNotesFrameには「自分より譜面上後ろにあるノーツ」の
				// 最小生成フレーム（最も早く出現するもの）が入っている。

				// 「自分より後ろのノーツ」の方が、「自分」よりも早く出現する場合、
				// 配列の順序と出現時間の順序が入れ替わっている（逆転）とみなす。
				// 逆転している場合は、最小生成フレームまでさらに遡って、出現フレームを再計算する。
				if (minNotesFrame < startPoint) {
					tmpObj = getAdjArrowStartFrame({ ...tmpObj, frm: startPoint }, _speedOnFrame, minNotesFrame);
					startPoint = tmpObj.frm;
					arrivalFrm = tmpObj.arrivalFrm;
				}
			}
			// 最小値を更新
			minNotesFrame = Math.min(minNotesFrame, startPoint);

			// 出現タイミングを保存
			setNotes(_j, k, _data, startPoint, camelHeader, _frzFlg, {
				initY: tmpObj.startY, initBoostY: calcInitBoostY(tmpObj.motionFrm),
				arrivalFrame: tmpObj.arrivalFrm, motionFrame: tmpObj.motionFrm, boostSpd: getSpdByFrame(arrowArrivalFrm)
			});
		}
	};

	for (let j = 0; j < getKeyInfo().keyNum; j++) {

		// 矢印の出現フレーム数計算
		calcNotes(j, _dataObj.arrowData[j]);
		calcNotes(j, _dataObj.dummyArrowData[j], `dummy`);

		// フリーズアローの出現フレーム数計算
		calcNotes(j, _dataObj.frzData[j], `frz`, true);
		calcNotes(j, _dataObj.dummyFrzData[j], `dummyFrz`, true);
	}

	/**
	 * 色変化・モーションデータ・スクロール反転データのタイミング更新
	 * - この関数を使用する場合、配列グループの先頭2つが「フレーム数、矢印番号」となっていないと動作しない
	 * @param {string} _type 
	 * @param {string} _header 
	 * @param {Function} _setFunc 後続実行関数
	 * @param {number} object._term 1セット当たりのデータ数(デフォルトは後続実行関数の引数の数-1, デフォルト引数・オブジェクト引数除く) 
	 * @param {boolean} object._colorFlg 個別色変化フラグ
	 * @param {boolean} object._calcFrameFlg 逆算を無条件で行うかどうかの可否
	 * @param {string} object._propName 色変化種類 (Arrow, ArrowShadow, FrzNormal, FrzNormalBar, ...)
	 */
	const calcDataTiming = (_type, _header, _setFunc = () => true,
		{ _term = _setFunc.length - 1, _colorFlg = false, _calcFrameFlg = false, _propName = `` } = {}) => {

		const camelHeader = _header === `` ? _type : `${_header}${toCapitalize(_type)}`;
		const baseData = hasVal(_propName) ? _dataObj[`${camelHeader}Data`][_propName] : _dataObj[`${camelHeader}Data`];

		if (!hasArrayList(baseData, _term)) {
			return;
		}
		const frontData = [];
		let minDataFrame = Infinity;
		for (let k = baseData.length - _term; k >= 0; k -= _term) {
			const calcFrameFlg = (_colorFlg && !baseData[k + 3]) || _calcFrameFlg;

			if (baseData[k] < g_scoreObj.frameNum) {
				// フェードイン直前にある色変化・モーションデータ・スクロール反転データを取得して格納
				if (!hasValInArray(baseData[k + 1], frontData)) {
					frontData.unshift(baseData.slice(k + 1, k + _term));
				}
			} else {
				if (calcFrameFlg) {
					let tmpObj = getArrowStartFrame(baseData[k], _speedOnFrame);

					// 到達フレームがより早い(=baseData[k]がより小さい)要素なのに、
					// より遅い要素より後ろで出現してしまう場合は矢印と同様に補正する
					if (minDataFrame < tmpObj.frm) {
						tmpObj = getAdjArrowStartFrame(tmpObj, _speedOnFrame, minDataFrame);
					}
					if (tmpObj.frm < g_scoreObj.frameNum) {
						const diff = g_scoreObj.frameNum - tmpObj.frm;
						tmpObj.frm = g_scoreObj.frameNum;
						tmpObj.arrivalFrm -= diff;
					}
					minDataFrame = Math.min(minDataFrame, tmpObj.frm);
					baseData[k] = tmpObj.frm;
				}
				_setFunc(toCapitalize(_header), ...baseData.slice(k, k + _term));
			}
		}
		frontData.forEach(data => _setFunc(toCapitalize(_header), g_scoreObj.frameNum, ...data));
	};

	/**
	 * 歌詞表示、背景・マスク表示のフェードイン時調整処理
	 * @param {string} _type
	 * @param {object} _data 
	 * @returns {object}
	 */
	const calcAnimationData = (_type, _data) => {

		const startNum = g_scoreObj.frameNum;
		const cgArrays = [`word`];

		const isSameDepth = (_j, _k) =>
			_data[startNum][_j] !== undefined &&
			_data[startNum][_k] !== undefined &&
			(cgArrays.includes(_type) ? _data[startNum][_j][0] === _data[startNum][_k][0] :
				_data[startNum][_j].depth === _data[startNum][_k].depth);

		const isExceptData = {
			word: (_exceptList, _j) => listMatching(_data[startNum][_j][1] || ``, _exceptList.word),
			back: (_exceptList, _j) => listMatching(_data[startNum][_j].animationName || ``, _exceptList.back),
			mask: (_exceptList, _j) => listMatching(_data[startNum][_j].animationName || ``, _exceptList.mask),
			style: (_exceptList, _j) => listMatching(_data[startNum][_j].depth || ``, _exceptList.style),
		};

		const getLength = _list =>
			_list === undefined ? 0 :
				(cgArrays.includes(_type) ? _list.length : Object.keys(_list).length);

		// フェードイン位置にそれ以前のデータを前追加
		if (startNum > 0 && _data[startNum] === undefined) {
			_data[startNum] = [];
		}
		for (let j = _data.length - 1; j >= 0; j--) {
			if (_data[j] !== undefined && j < g_scoreObj.frameNum) {
				_data[startNum].unshift(..._data[j]);
				_data[j] = undefined;
			}
		}

		// 重複する深度をカット（後方優先）
		// ただし、除外リストにあるデータは残す
		for (let j = getLength(_data[startNum]) - 1; j >= 0; j--) {
			if (_data[startNum][j] !== undefined) {
				for (let k = j - 1; k >= 0; k--) {
					if (isSameDepth(j, k) && !isExceptData[_type](g_preloadExceptList, k)) {
						_data[startNum][k] = undefined;
					}
				}
			}
		}
		// g_stockForceDelList に合致する消去対象データを検索し、削除
		for (let j = getLength(_data[startNum]) - 1; j >= 0; j--) {
			if (_data[startNum][j] !== undefined && isExceptData[_type](g_stockForceDelList, j)) {
				_data[startNum][j] = undefined;
			}
		}

		// カットした箇所をリストから削除
		if (getLength(_data[startNum]) > 0) {
			_data[startNum] = _data[startNum].filter(list => getLength(list) > 0);
		}

		return _data;
	};

	// 個別・全体色変化、モーションデータ・スクロール反転データのタイミング更新
	[``, `dummy`].forEach(type => {
		calcDataTiming(`color`, type, pushColors, { _term: 4, _colorFlg: true });
		if (_dataObj[`ncolor${type}Data`] !== undefined) {
			Object.keys(_dataObj[`ncolor${type}Data`]).forEach(pattern =>
				calcDataTiming(`ncolor`, type, pushColors, { _term: 5, _colorFlg: true, _propName: pattern }));
		}
	});

	g_typeLists.arrow.forEach(header =>
		calcDataTiming(`cssMotion`, header, pushCssMotions, { _calcFrameFlg: true }));

	calcDataTiming(`scrollch`, ``, pushScrollchs, { _calcFrameFlg: true });

	g_fadeinStockList.forEach(type =>
		_dataObj[`${type}Data`] = calcAnimationData(type, _dataObj[`${type}Data`]));


	// 実際に処理させる途中変速配列を作成
	g_workObj.speedData = [];
	g_workObj.speedData.push(g_scoreObj.frameNum);
	g_workObj.speedData.push(_speedOnFrame[g_scoreObj.frameNum]);

	for (let k = 0; k < _dataObj?.speedData.length; k += 2) {
		if (_dataObj.speedData[k] >= g_scoreObj.frameNum) {
			g_workObj.speedData.push(_dataObj.speedData[k]);
			g_workObj.speedData.push(_speedOnFrame[_dataObj.speedData[k]]);
		}
	}
};

/**
 * 出現フレームを指定フレームまで強制的に遡って再計算する（逆転補正用）
 * @param {object} _obj getArrowStartFrameの戻り値
 * @param {object} _speedOnFrame 
 * @param {number} _targetFrame 
 * @returns {{ frm: number, startY: number, arrivalFrm: number, motionFrm: number }}
 */
const getAdjArrowStartFrame = (_obj, _speedOnFrame, _targetFrame) => {
	while (_obj.frm > _targetFrame) {
		_obj.startY += _speedOnFrame[_obj.frm - 1];

		if (_speedOnFrame[_obj.frm - 1] !== 0) {
			_obj.motionFrm++;
		}
		_obj.frm--;
		_obj.arrivalFrm++;
	}
	return _obj;
};

/**
 * ステップゾーン到達地点から逆算して開始フレームを取得
 * @param {number} _frame 
 * @param {object} _speedOnFrame
 * @returns {{ frm: number, startY: number, arrivalFrm: number, motionFrm: number }}
 */
const getArrowStartFrame = (_frame, _speedOnFrame) => {

	const obj = {
		frm: _frame,
		startY: 0,
		arrivalFrm: 0,
		motionFrm: C_MOTION_STD_POS
	};

	while (g_scoreObj.distY - obj.startY > 0) {
		obj.startY += _speedOnFrame[obj.frm - 1];

		if (_speedOnFrame[obj.frm - 1] !== 0) {
			obj.motionFrm++;
		}
		obj.frm--;
		obj.arrivalFrm++;
	}

	return obj;
};

/**
 * 速度を加味したフリーズアローの長さを取得
 * @param {object} _speedOnFrame 
 * @param {number} _startFrame 
 * @param {number} _endFrame 
 * @returns {number}
 */
const getFrzLength = (_speedOnFrame, _startFrame, _endFrame) => {
	let frzLength = 0;

	for (let frm = _startFrame; frm < _endFrame; frm++) {
		frzLength += _speedOnFrame[frm];
	}
	return frzLength;
};

/**
 * キーパターン(デフォルト)に対応する矢印番号を格納
 * - 色変化、矢印・フリーズアローモーション、スクロール変化で
 *   矢印レーンの番号を実際のキーパターンに対応する番号に置き換える際に使用
 * - 例: [0, 1, 2, 3, 4] -> [4, 0, 1, 2, 3]
 */
const convertReplaceNums = () => {
	const tkObj = getKeyInfo();
	const baseCharas = g_keyObj[`chara${g_keyObj.currentKey}_0`];
	const convCharas = g_keyObj[`chara${tkObj.keyCtrlPtn}`];

	g_workObj.replaceNums = [];

	for (let j = 0; j < tkObj.keyNum; j++) {
		for (let k = 0; k < tkObj.keyNum; k++) {
			if (baseCharas[j] === convCharas[k]) {
				g_workObj.replaceNums[j] = k;
				continue;
			}
		}
	}
};

/**
 * 色情報の格納
 * @param {string} _header 
 * @param {number} _frame 
 * @param {number} _val 色番号
 * @param {string} _colorCd カラーコード
 * @param {string} _allFlg 全体色変化有無
 * @param {string} _pattern 色変化種類 (Arrow, ArrowShadow, FrzNormal, FrzNormalBar, ...)
 */
const pushColors = (_header, _frame, _val, _colorCd, _allFlg, _pattern = ``) => {

	const tkObj = getKeyInfo();
	const grdFlg = (g_colorType === `Type0` ? !g_headerObj.defaultColorgrd[0] : g_headerObj.defaultColorgrd[0]);
	const colorCd = makeColorGradation(_colorCd, { _defaultColorgrd: [grdFlg, g_headerObj.defaultColorgrd[1]] });
	const addAll = Number(_allFlg) * 1000;
	const allUseTypes = [];

	/**
	 * 全体色変化の有効化（フレーム別）
	 * @param  {...any} _types 
	 */
	const enabledAll = (..._types) => {
		if (_allFlg) {
			_types.forEach(type => g_workObj[`mk${type}ColorChangeAll`][_frame] = true);
		}
	};

	/**
	 * 色変化用配列（フレーム別）へのデータ追加
	 * @param {string} _baseStr 
	 * @param {number} _cVal 
	 */
	const pushColor = (_baseStr, _cVal) => {
		g_workObj[_baseStr][_frame]?.push(_cVal) || (g_workObj[_baseStr][_frame] = [_cVal]);
		g_workObj[`${_baseStr}Cd`][_frame]?.push(colorCd) || (g_workObj[`${_baseStr}Cd`][_frame] = [colorCd]);
	};

	/**
	 * 色変化データ(ncolor_data)の格納処理
	 */
	const executePushColors = () => {
		const baseHeaders = [];
		if (_pattern.startsWith(`Arrow`)) {
			baseHeaders.push(`mk${_header}Color${_pattern.slice('Arrow'.length)}`);
			allUseTypes.push(`Arrow`);

			// フリーズアロー色の追随設定がある場合、対象を追加
			if (_pattern === `Arrow`) {
				g_headerObj.frzScopeFromArrowColors.forEach(type =>
					baseHeaders.push(`mk${_header}FColor${type}`, `mk${_header}FColor${type}Bar`));
				if (g_headerObj.frzScopeFromArrowColors.length > 0) {
					allUseTypes.push(`Frz`);
				}
			}
		} else {
			baseHeaders.push(`mk${_header}FColor${_pattern}`);
			allUseTypes.push(`Frz`);
		}
		// 色変化情報の格納
		if (_val.startsWith('g')) {
			// g付きの場合は矢印グループから対象の矢印番号を検索
			const groupVal = setIntVal(_val.slice(1));
			for (let j = 0; j < tkObj.keyNum; j++) {
				if (g_keyObj[`color${tkObj.keyCtrlPtn}`][j] === groupVal) {
					baseHeaders.forEach(baseHeader => pushColor(baseHeader, j + addAll));
				}
			}
		} else {
			baseHeaders.forEach(baseHeader => pushColor(baseHeader, g_workObj.replaceNums[setIntVal(_val)] + addAll));
		}
	};

	/**
	 * 従来の色変化データ派生(color_data, acolor_data)の格納処理
	 */
	const executePushColorsOld = () => {

		if (_val < 30 || _val >= 1000) {
			const baseHeaders = [`mk${_header}Color`];
			allUseTypes.push(`Arrow`);

			// フリーズアロー色の追随設定がある場合、対象を追加
			g_headerObj.frzScopeFromArrowColors.forEach(type =>
				baseHeaders.push(`mk${_header}FColor${type}`, `mk${_header}FColor${type}Bar`));
			if (g_headerObj.frzScopeFromArrowColors.length > 0) {
				allUseTypes.push(`Frz`);
			}

			// 矢印の色変化 (追随指定時はフリーズアローも色変化)
			baseHeaders.forEach(baseHeader => {
				if (_val < 20 || _val >= 1000) {
					pushColor(baseHeader, g_workObj.replaceNums[_val % 1000] + addAll);
				} else if (_val >= 20) {
					const colorNum = _val - 20;
					for (let j = 0; j < tkObj.keyNum; j++) {
						if (g_keyObj[`color${tkObj.keyCtrlPtn}`][j] === colorNum) {
							pushColor(baseHeader, j + addAll);
						}
					}
				}
			});

		} else {
			const baseHeader = `mk${_header}FColor`;
			allUseTypes.push(`Frz`);

			// フリーズアローの色変化
			const tmpVals = [];
			if (_val < 50) {
				tmpVals.push(_val % 30);
			} else if (_val < 60) {
				tmpVals.push((_val % 50) * 2, (_val % 50) * 2 + 1);
			} else {
				if (_val === 60) {
					tmpVals.push(...Array(8).keys());
				} else {
					tmpVals.push(...[...Array(8).keys()].map(j => j + 10));
				}
			}
			tmpVals.forEach(targetj => {

				// targetj=0,2,4,6,8 ⇒ Arrow, 1,3,5,7,9 ⇒ Bar
				const ctype = (targetj >= 10 ? `Hit` : `Normal`) + (targetj % 2 === 0 ? `` : `Bar`);
				const colorPos = Math.ceil((targetj % 10 - 1) / 2);

				g_keyObj[`color${tkObj.keyCtrlPtn}`].forEach((cpattern, k) => {
					if (colorPos === cpattern) {
						pushColor(baseHeader + ctype, k + addAll);
					}
				});
			});
		}
	};
	hasVal(_pattern) ? executePushColors() : executePushColorsOld();
	enabledAll(...allUseTypes);
};

/**
 * CSSモーション情報の格納
 * @param {string} _header 
 * @param {number} _frame 
 * @param {number} _val 
 * @param {string} _styleName
 * @param {string} _styleNameRev
 * @param {boolean|undefined} _movLock
 * @param {boolean|undefined} _initManual
 */
const pushCssMotions = (_header, _frame, _val, _styleName, _styleNameRev, _movLock, _initManual) => {

	const camelHeader = toCapitalize(_header);
	const tkObj = getKeyInfo();

	// 矢印のモーション
	if (g_workObj[`mk${camelHeader}CssMotion`][_frame] === undefined) {
		g_workObj[`mk${camelHeader}CssMotion`][_frame] = [];
		g_workObj[`mk${camelHeader}CssMotionName`][_frame] = [];
		g_workObj[`mk${camelHeader}MovLock`][_frame] = [];
		g_workObj[`mk${camelHeader}InitManual`][_frame] = [];
	}
	if (_val < 20 || _val >= 1000) {
		const realVal = g_workObj.replaceNums[_val % 1000];
		g_workObj[`mk${camelHeader}CssMotion`][_frame].push(realVal);
		g_workObj[`mk${camelHeader}CssMotionName`][_frame].push(_styleName, _styleNameRev);
		g_workObj[`mk${camelHeader}MovLock`][_frame].push(_movLock);
		g_workObj[`mk${camelHeader}InitManual`][_frame].push(_initManual);

	} else {
		const colorNum = _val - 20;
		for (let j = 0; j < tkObj.keyNum; j++) {
			if (g_keyObj[`color${tkObj.keyCtrlPtn}`][j] === colorNum) {
				g_workObj[`mk${camelHeader}CssMotion`][_frame].push(j);
				g_workObj[`mk${camelHeader}CssMotionName`][_frame].push(_styleName, _styleNameRev);
				g_workObj[`mk${camelHeader}MovLock`][_frame].push(_movLock);
				g_workObj[`mk${camelHeader}InitManual`][_frame].push(_initManual);
			}
		}
	}
};

/**
 * スクロール変化情報の格納
 * @param {string} _header 
 * @param {number} _frameArrow 
 * @param {number} _val 
 * @param {number} _frameStep 
 * @param {number} _scrollDir 
 * @param {number} _layerGroup
 * @param {number} _layerTrans
 */
const pushScrollchs = (_header, _frameArrow, _val, _frameStep, _scrollDir, _layerGroup, _layerTrans) => {
	const tkObj = getKeyInfo();
	g_stateObj.layerNum = Math.max(g_stateObj.layerNum, (_layerGroup + 1) * 2);

	const frameArrow = Math.max(_frameArrow, g_scoreObj.frameNum);
	const frameStep = Math.max(_frameStep, g_scoreObj.frameNum);
	const pushData = (_pattern, _frame, _val) =>
		g_workObj[`mkScrollch${_pattern}`][_frame]?.push(_val) || (g_workObj[`mkScrollch${_pattern}`][_frame] = [_val]);
	const pushScrollData = _j => {
		pushData(`Arrow`, frameArrow, _j);
		pushData(`ArrowDir`, frameArrow, _scrollDir);
		pushData(`ArrowLayerGroup`, frameArrow, _layerGroup);
		pushData(`ArrowLayerTrans`, frameArrow, _layerTrans);
		pushData(`Step`, frameStep, _j);
		pushData(`StepDir`, frameStep, _scrollDir);
		pushData(`StepLayerGroup`, frameStep, _layerGroup);
		pushData(`StepLayerTrans`, frameStep, _layerTrans);
	};

	if (_val < 20 || _val >= 1000) {
		const realVal = g_workObj.replaceNums[_val % 1000];
		pushScrollData(realVal);

	} else {
		const colorNum = _val - 20;
		for (let j = 0; j < tkObj.keyNum; j++) {
			if (g_keyObj[`color${tkObj.keyCtrlPtn}`][j] === colorNum) {
				pushScrollData(j);
			}
		}
	}
};

/**
 * ホワイトリストに登録されたCSS関数内の数値符号のみを反転する関数
 * @param {string} cssString 
 * @param {string[]} exceptList 反転対象から除外するCSS関数名のリスト
 * @returns {string} 
 */
const invertSpecificTransforms = (cssString, exceptList = []) => {
	// 反転対象にしたいCSS関数名を指定（ホワイトリスト）
	const baseTargetFunctions = [
		`rotate`, `rotateX`, `rotateY`, `rotateZ`, `rotate3d`,
		`translate`, `translateX`, `translateY`, `translateZ`, `translate3d`,
		`skew`, `skewX`, `skewY`
	];
	const targetFunctions = baseTargetFunctions.filter(pattern => !exceptList.includes(pattern));
	if (targetFunctions.length === 0) {
		return cssString; // 反転対象がない場合は元の文字列を返す
	}

	// RegExパターンを作成: /(rotate|translate...)\(([^)]+)\)/g
	const pattern = new RegExp(`\\b(${targetFunctions.join(`|`)})\\(([^)]+)\\)`, `g`);

	return cssString.replace(pattern, (match, funcName, args) => {
		// 関数の中身（引数）に含まれる数値だけを符号反転
		const invertedArgs = args.replace(/(-?\d+(?:\.\d+)?)/g, (numStr) => {
			return numStr.startsWith(`-`) ? numStr.slice(1) : `-` + numStr;
		});

		return `${funcName}(${invertedArgs})`;
	});
}

/**
 * メイン画面前の初期化処理
 */
const getArrowSettings = () => {

	g_attrObj = {};
	const tkObj = getKeyInfo();
	const [keyCtrlPtn, keyNum, posMax, divideCnt] =
		[tkObj.keyCtrlPtn, tkObj.keyNum, tkObj.posMax, tkObj.divideCnt];

	g_keyCopyLists.simpleDef.forEach(header => updateKeyInfo(header, keyCtrlPtn));
	g_headerObj.tuning = g_headerObj.creatorNames[g_stateObj.scoreId];

	// 各種初期化
	// g_workObj.frzArrowInitRtnはフリーズアロー(初期表示)としての利用に限定
	g_workObj.stepX = [];
	g_workObj.stepX_df = [];
	g_workObj.scrollDir = [];
	g_workObj.scrollDirDefault = [];
	g_workObj.dividePos = [];
	g_workObj.scale = g_keyObj.scale;
	g_workObj.stepRtn = structuredClone(g_keyObj[`stepRtn${keyCtrlPtn}`]);
	g_workObj.stepHitRtn = structuredClone(g_keyObj[`stepRtn${keyCtrlPtn}`]);
	g_workObj.arrowRtn = structuredClone(g_keyObj[`stepRtn${keyCtrlPtn}`]);
	g_workObj.frzArrowInitRtn = structuredClone(g_keyObj[`stepRtn${keyCtrlPtn}`]);
	g_workObj.keyCtrl = structuredClone(g_keyObj[`keyCtrl${keyCtrlPtn}`]);
	g_workObj.diffList = [];
	g_workObj.mainEndTime = 0;
	g_workObj.currentLifeState = ``;
	g_workObj.layerTrans = [];
	g_errorCache['g_customJsObj.mainEnterFrame'] = [];

	const rotateBy = (val, delta) => {
		// numeric
		const n = Number(val);
		if (Number.isFinite(n)) return n + delta;

		// "type:deg"
		const [type, degStr = `0`] = String(val).split(`:`);
		const deg = Number(degStr);
		return Number.isFinite(deg) ? `${type}:${deg + delta}` : val;
	};
	const changeStepRtn = (_name, _angle) =>
		g_workObj[_name] = g_workObj[_name].map(v => rotateBy(v, _angle));

	if (g_stateObj.playWindow === `SideScroll`) {
		if (g_stateObj.rotateEnabled) {
			const sign = g_stateObj.playWindowType === C_FLG_REVERSE2 ? -1 : 1;
			changeStepRtn(`stepRtn`, 90 * sign);
			changeStepRtn(`stepHitRtn`, 90 * sign);
			changeStepRtn(`arrowRtn`, 90 * sign);
			changeStepRtn(`frzArrowInitRtn`, 90 * sign);
		}
		const div = g_keyObj[`div${keyCtrlPtn}`];
		const divMax = g_keyObj[`divMax${keyCtrlPtn}`] ?? posMax;
		const denom = (Math.max(div, divMax - div) + 1) * g_keyObj.blank;
		if (Number.isFinite(denom) && denom > 0) {
			g_workObj.scale *= Math.min(g_sHeight / denom, 1);
		}
	}

	// CamoufrageType: FrzArrowの場合のみ、フリーズアロー(初期)の矢印を180度回転
	if (g_stateObj.rotateEnabled && g_stateObj.camoufrageType === `FrzArrow`) {
		changeStepRtn(`frzArrowInitRtn`, 180);
	}

	g_workObj.keyGroupMaps = tkObj.keyGroupMaps;
	g_workObj.keyGroupList = tkObj.keyGroupList;

	if (g_keyObj[`layerTrans${keyCtrlPtn}`]?.[0]) {
		g_workObj.layerTrans = structuredClone(g_keyObj[`layerTrans${keyCtrlPtn}`][0]);
		if (g_stateObj.reverse === C_FLG_ON) {
			// Reverse時はX軸反転のため、X軸の座標変換では符号を変換しない
			g_workObj.layerTrans = g_workObj.layerTrans.map(val => invertSpecificTransforms(val, [`translateX`]));
		}
		if (g_stateObj.swapping === `Mirror+`) {
			// Swapping: Mirror+ はY軸反転のため、Y軸の座標変換では符号を変換しない
			g_workObj.layerTrans = g_workObj.layerTrans.map(val => invertSpecificTransforms(val, [`translateY`]));
		}
	}

	const keyCtrlLen = g_workObj.keyCtrl.length;
	g_workObj.keyCtrlN = [...Array(keyCtrlLen)].map(() => []);
	g_workObj.keyHitFlg = [...Array(keyCtrlLen)].map(() => []);
	for (let j = 0; j < g_workObj.keyCtrl.length; j++) {
		for (let k = 0; k < g_workObj.keyCtrl[j].length; k++) {
			g_workObj.keyCtrlN[j][k] = g_kCdN[g_workObj.keyCtrl[j][k]];
			g_workObj.keyHitFlg[j][k] = false;
		}
	}

	g_typeLists.arrow.forEach(type => g_workObj[`judg${toCapitalize(type)}Cnt`] = fillArray(keyNum, 1));
	g_workObj.judgFrzHitCnt = fillArray(keyNum, 1);
	g_judgObj.lockFlgs = fillArray(keyNum, false);

	// 矢印色管理 (個別・全体)
	const eachOrAll = [``, `All`];
	eachOrAll.forEach(type => {
		[`arrow`, `dummyArrow`].forEach(arrowType =>
			g_typeLists.arrowColor.forEach(objType => g_workObj[`${arrowType}${objType}Colors${type}`] = []));

		[`frz`, `dummyFrz`].forEach(arrowType =>
			g_typeLists.frzColor.forEach(frzType => g_workObj[`${arrowType}${frzType}Colors${type}`] = []));
	});

	// モーション管理
	g_typeLists.arrow.forEach(type => {
		g_workObj[`${type}CssMotions`] = fillArray(keyNum, ``);
		g_workObj[`${type}MovLock`] = fillArray(keyNum, ``);
		g_workObj[`${type}InitManual`] = fillArray(keyNum, ``);
	});
	g_workObj.frzArrowCssMotions = fillArray(keyNum, ``);
	g_workObj.dummyFrzArrowCssMotions = fillArray(keyNum, ``);

	const scrollDirOptions = g_keyObj[`scrollDir${keyCtrlPtn}`]?.[g_stateObj.scroll] ?? fillArray(keyNum, 1);

	g_stateObj.autoAll = boolToSwitch(g_stateObj.autoPlay === C_FLG_ALL);
	g_workObj.hitPosition = (g_stateObj.autoAll === C_FLG_ON ? 0 : g_stateObj.hitPosition);
	changeSetColor();

	for (let j = 0; j < keyNum; j++) {

		const posj = g_keyObj[`pos${keyCtrlPtn}`][j];
		const colorj = g_keyObj[`color${keyCtrlPtn}`][j];
		let stdPos = posj - ((posj > divideCnt ? posMax : 0) + divideCnt) / 2;

		if (g_stateObj.swapping === `Mirror+`) {
			g_workObj.stepX_df[j] = g_keyObj.blank * stdPos + (g_headerObj.playingWidth - C_ARW_WIDTH) / 2;
			stdPos = -stdPos;
		}

		g_workObj.stepX[j] = g_keyObj.blank * stdPos + (g_headerObj.playingWidth - C_ARW_WIDTH) / 2;
		const baseLayer = g_keyObj[`layerGroup${keyCtrlPtn}`]?.[j] || 0;
		g_workObj.dividePos[j] = baseLayer * 2 + ((posj <= divideCnt ? 0 : 1) + (scrollDirOptions[j] === 1 ? 0 : 1) + (g_stateObj.reverse === C_FLG_OFF ? 0 : 1)) % 2;
		g_workObj.scrollDir[j] = (posj <= divideCnt ? 1 : -1) * scrollDirOptions[j] * (g_stateObj.reverse === C_FLG_OFF ? 1 : -1);

		// 個別色設定
		g_workObj.arrowColors[j] = g_headerObj.setColor[colorj];
		g_workObj.dummyArrowColors[j] = g_headerObj.setDummyColor[colorj];
		g_workObj.arrowShadowColors[j] = g_headerObj.setShadowColor[colorj] || ``;
		g_workObj.dummyArrowShadowColors[j] = g_headerObj.setDummyColor[colorj] || ``;

		g_typeLists.frzColor.forEach((frzType, k) => {
			g_workObj[`frz${frzType}Colors`][j] = g_headerObj.frzColor[colorj][k] || ``;
			g_workObj[`dummyFrz${frzType}Colors`][j] =
				frzType.includes(`Shadow`) ? `` : g_headerObj.setDummyColor[colorj] || ``;
		});
		g_workObj.frzNormalShadowColors[j] = g_headerObj.frzShadowColor[colorj][0] || ``;
		g_workObj.frzHitShadowColors[j] = g_headerObj.frzShadowColor[colorj][1] || ``;

		// 全体色設定
		g_workObj.arrowColorsAll[j] = ``;
		g_workObj.dummyArrowColorsAll[j] = ``;
		g_workObj.arrowShadowColorsAll[j] = ``;
		g_workObj.dummyArrowShadowColorsAll[j] = ``;

		g_typeLists.frzColor.forEach((frzType, k) => {
			g_workObj[`frz${frzType}ColorsAll`][j] = ``;
			g_workObj[`dummyFrz${frzType}ColorsAll`][j] = ``;
		});
		g_workObj.frzNormalShadowColorsAll[j] = ``;
		g_workObj.frzHitShadowColorsAll[j] = ``;

	}
	g_workObj.orgFlatFlg = g_workObj.dividePos.every(v => v % 2 === g_workObj.dividePos[0] % 2);
	g_stateObj.layerNumDf = Math.max(g_stateObj.layerNumDf, Math.ceil((Math.max(...g_workObj.dividePos) + 1) / 2) * 2);

	// Swapping設定に応じたステップゾーンの入れ替え
	// Mirror+のみ事前にオリジナルの位置を設定済みのためスキップする
	if (g_workObj.stepX_df.length === 0) {
		g_workObj.stepX_df = structuredClone(g_workObj.stepX);
	}
	if (g_settings.swappingSubs.includes(g_stateObj.swapping)) {

		// Swappingにおけるグループ単位での入れ替えでは、上下でステップゾーンが分かれている場合は分離してシャッフルする
		let _style = structuredClone(Object.values(g_workObj.shuffleGroupMap));
		const _styleTrans = _style.flatMap(arr => {
			// g_workObj.devidePosの値ごとにグループ化する
			const groups = {};

			arr.forEach(n => {
				const div = g_workObj.dividePos[n];
				if (!groups[div]) groups[div] = [];
				groups[div].push(n);
			});

			// groups は {0:[...], 1:[...], 2:[...]} のような形になるので
			// これを配列に変換して返す
			return Object.values(groups);
		});
		const _styleTransDf = structuredClone(Object.values(_styleTrans));

		if (g_stateObj.swapping === `Mirror` || g_stateObj.swapping === `OuterSwap`) {
			_styleTrans.map(_group => _group.reverse());
		}
		if (g_stateObj.swapping.endsWith(`Swap`)) {
			// グループの内側だけ入れ替える
			_styleTrans.forEach((group, i) => {
				g_settings.swapPattern.forEach(val => {
					swapGroupNums(_styleTrans, group, i, val);
				});
			});
		}
		// オリジナルと同一の場合、設定をOFFに戻す
		if (JSON.stringify(_styleTransDf) === JSON.stringify(_styleTrans)) {
			g_stateObj.swapping = C_FLG_OFF;
			g_settings.swappingNum = 0;
		}

		// 入れ替えた結果に合わせてX座標位置を入れ替える
		_styleTrans.forEach((_group, _i) => {
			_group.forEach((_val, _j) => {
				g_workObj.stepX[_group[_j]] = g_workObj.stepX_df[_styleTransDf[_i][_j]];
			});
		});
	}

	// StepArea(Default, Halfway以外)によるレイヤー移動
	// ずらした位置に表示するため、レイヤーを倍化して倍化した先に割り当てる
	const assignLayer = _func => {
		for (let j = 0; j < keyNum; j++) {
			g_workObj.dividePos[j] = (_func(j) ? 0 : 1) * g_stateObj.layerNumDf + g_workObj.dividePos[j];
		}
	}
	if (g_stateObj.stepArea === `X-Flower` || (g_stateObj.stepArea.includes(`Mismatched`) && g_workObj.orgFlatFlg)) {
		assignLayer(j => g_workObj.stepX[j] < (g_headerObj.playingWidth - C_ARW_WIDTH) / 2);
	} else if (g_stateObj.stepArea === `Alt-Crossing`) {
		assignLayer(j => Math.round(g_keyObj[`pos${keyCtrlPtn}`][j]) % 2 === 0);
	}
	if (g_stateObj.stepArea === `2Step`) {
		for (let j = 0; j < keyNum; j++) {
			if (g_workObj.orgFlatFlg && g_workObj.stepX[j] >= (g_headerObj.playingWidth - C_ARW_WIDTH) / 2) {
				g_workObj.dividePos[j] = Math.floor(g_workObj.dividePos[j] / 2) * 2 + (g_workObj.dividePos[j] + 1) % 2;
				g_workObj.scrollDir[j] *= -1;
			}
			if (g_workObj.dividePos[j] % 2 === (Number(g_stateObj.reverse === C_FLG_ON) + 1) % 2) {
				g_workObj.dividePos[j] = g_stateObj.layerNumDf + g_workObj.dividePos[j] + Number(g_stateObj.reverse === C_FLG_ON ? 1 : -1);
				g_workObj.scrollDir[j] *= -1;
			}
		}
	}
	g_workObj.scrollDirDefault = g_workObj.scrollDir.concat();
	g_workObj.dividePosDefault = g_workObj.dividePos.concat();
	g_stateObj.layerNum = g_stateObj.layerNumDf * (g_settings.stepAreaLayers.includes(g_stateObj.stepArea) ? 2 : 1);

	// g_workObjの不要なプロパティを削除
	if (g_stateObj.dummyId === `` && g_autoPlaysBase.includes(g_stateObj.autoPlay)) {
		Object.keys(g_workObj).filter(key => key.startsWith(`dummy`) || key.startsWith(`mkDummy`))
			.forEach(key => delete g_workObj[key]);
	}
	const targetColorKeys = [`mkColor`, `mkColorShadow`];
	const usedColorKeys = [];
	targetColorKeys.push(...g_typeLists.frzColor.map(type => `mkFColor${type}`));
	targetColorKeys.forEach(key => {
		if (g_workObj[key].length === 0) {
			delete g_workObj[key];
			delete g_workObj[`${key}Cd`];
		} else {
			usedColorKeys.push(key);
		}
	});
	[`Arrow`, `Step`].forEach(type => {
		[``, `Dir`, `LayerGroup`, `LayerTrans`].forEach(type2 => {
			if (g_workObj[`mkScrollch${type}${type2}`].length === 0) {
				delete g_workObj[`mkScrollch${type}${type2}`];
			}
		});
	});
	[`Arrow`, `Frz`].forEach(type => {
		if (g_workObj[`mk${type}ColorChangeAll`].length === 0) {
			delete g_workObj[`mk${type}ColorChangeAll`];
		}
		[``, `Name`].forEach(type2 => {
			if (g_workObj[`mk${type}CssMotion${type2}`].length === 0) {
				delete g_workObj[`mk${type}CssMotion${type2}`];
			}
		});
	});

	// 初期位置、ライフ設定の初期化
	Object.keys(g_resultObj).forEach(judgeCnt => g_resultObj[judgeCnt] = 0);
	g_resultObj.spState = ``;
	g_resultObj.gaugeTransition = [];

	g_displays.forEach(_disp => {
		const lowerDisp = _disp.toLowerCase();
		g_workObj[`${lowerDisp}Disp`] = (g_stateObj[`d_${lowerDisp}`] === C_FLG_OFF ? C_DIS_NONE : C_DIS_INHERIT);
	});
	g_workObj.judgmentDisp = g_stateObj.d_judgment !== C_FLG_ON ? C_DIS_NONE : C_DIS_INHERIT;
	g_workObj.fastslowDisp = g_stateObj.d_judgment === C_FLG_OFF ? C_DIS_NONE : C_DIS_INHERIT;

	g_workObj.lifeVal = Math.floor(g_workObj.lifeInit * 100) / 100;
	g_workObj.arrowReturnVal = 0;
	g_gameOverFlg = false;
	g_finishFlg = true;
	g_workObj.nonDefaultSc = g_headerObj.keyRetry !== C_KEY_RETRY || g_headerObj.keyTitleBack !== C_KEY_TITLEBACK || g_headerObj.keyPause !== C_KEY_PAUSE;
	if (g_headerObj.scAreaWidth === 0 && (
		g_headerObj.keyRetry !== g_headerObj.keyRetryDef2 ||
		g_headerObj.keyTitleBack !== g_headerObj.keyTitleBackDef2 ||
		g_headerObj.keyPause !== g_headerObj.keyPauseDef2
	)) {
		g_workObj.nonDefaultSc = false;
	}
	if (g_diffObj.shortcutX !== 0 || g_diffObj.shortcutY !== 0) {
		g_workObj.nonDefaultSc = true;
	}

	g_workObj.backX = (g_workObj.nonDefaultSc && g_headerObj.playingLayout ? g_headerObj.scAreaWidth : 0);
	g_workObj.playingX = g_headerObj.playingX + g_workObj.backX;

	// FrzReturnの初期化
	g_workObj.frzReturnFlg = false;
	g_workObj.frzReturnSeq = g_frzReturnSeqFunc.get(g_stateObj.frzReturnType)();
	if (g_workObj.frzReturnTimerId) {
		g_timerHandler.clearTimeout(g_workObj.frzReturnTimerId);
		g_workObj.frzReturnTimerId = null;
	}

	// Camoufrageの設定
	if (g_stateObj.camoufrage !== C_FLG_OFF) {

		const eachOrAll = [``, `All`];
		const keyNum = g_keyObj[`chara${g_keyObj.currentKey}_${g_keyObj.currentPtn}`].length;

		// 位置変更用の配列を作成
		const randArray = [...Array(keyNum).keys()].map(_i => _i);
		let _i = randArray.length;
		while (_i) {
			const _j = Math.floor(Math.random() * _i--);
			[randArray[_i], randArray[_j]] = [randArray[_j], randArray[_i]];
		}

		// 位置変更用の配列に従い、初期矢印・初期色の位置変更
		const getSwapArray = (_array) => {
			const _copiedArray = structuredClone(_array);
			return _array.map((_val, _i) => _array[_i] = _copiedArray[randArray[_i]]);
		};

		// 矢印ヒット時に元の矢印がわかるようにするため、あえて g_workObj.stepHitRtn はそのままにする
		if (g_stateObj.camoufrage.includes(`Step`)) {
			g_workObj.stepRtn = getSwapArray(g_workObj.stepRtn);
		}
		if (g_stateObj.camoufrage.includes(`Arrow`)) {
			g_workObj.arrowRtn = getSwapArray(g_workObj.arrowRtn);
			g_workObj.frzArrowInitRtn = getSwapArray(g_workObj.frzArrowInitRtn);
		}
		if (g_stateObj.camoufrage.includes(`Color`)) {
			eachOrAll.forEach(type => {
				// ダミー矢印は対象外
				g_workObj[`arrowColors${type}`] = getSwapArray(g_workObj[`arrowColors${type}`]);
				g_workObj[`arrowShadowColors${type}`] = getSwapArray(g_workObj[`arrowShadowColors${type}`]);

				g_typeLists.frzColor.forEach(frzType => {
					g_workObj[`frz${frzType}Colors${type}`] = getSwapArray(g_workObj[`frz${frzType}Colors${type}`]);
				});
				g_workObj[`frzNormalShadowColors${type}`] = getSwapArray(g_workObj[`frzNormalShadowColors${type}`]);
				g_workObj[`frzHitShadowColors${type}`] = getSwapArray(g_workObj[`frzHitShadowColors${type}`]);
			});

			// 位置変更用の配列に従い、個別・全体色変化の位置変更
			const getSwapList = (_array) => {
				const _copiedArray = structuredClone(_array);
				return _array.map((_val, _i) => _array[_i] = randArray[_copiedArray[_i]]);
			};
			usedColorKeys.filter(type => g_workObj[type] !== undefined).forEach(type => {
				for (let j = 0; j < g_workObj[type].length; j++) {
					if (g_workObj[type][j] === undefined) {
						continue;
					}
					g_workObj[type][j] = getSwapList(g_workObj[type][j]);
				}
			});
		}
	}

	// Shaking: Drunkでの画面揺れ設定 (X方向、Y方向、移動軸条件、回転軸条件)
	g_workObj.drunkXFlg = false;
	g_workObj.drunkYFlg = false;
	g_workObj.drunkAxisFlg = false;
	g_workObj.drunkRotateFlg = false;

	// AppearanceFilterの可視範囲設定
	g_workObj.aprFilterCnt = 0;

	// キー別の移動ロック制御、初期位置のマニュアル可否設定の初期値
	// 矢印・フリーズアローモーションよりも優先される
	g_workObj.movLockEnabled = g_keyObj[`movLock${g_keyObj.currentKey}`] === true;
	g_workObj.initManualEnabled = g_keyObj[`initManual${g_keyObj.currentKey}`] === true;

	if (g_stateObj.dataSaveFlg) {
		// ローカルストレージへAdjustment, HitPosition, Volume設定を保存
		// 変更が確定した時点で表示用のキャッシュを解放
		g_storeSettings.forEach(setting => g_localStorage[setting] = g_stateObj[setting]);
		viewKeyStorage.cache = new Map();
		localStorage.setItem(g_localStorageUrl, JSON.stringify(g_localStorage));
	}

	// リバース、キーコンフィグなどをローカルストレージへ保存（Data Save: ON かつ別キーモードで無い場合) 
	if (g_stateObj.dataSaveFlg && !hasVal(g_keyObj[`transKey${keyCtrlPtn}`])) {

		// 次回キーコンフィグ画面へ戻ったとき、保存済みキーコンフィグ設定が表示されるようにする
		g_keyObj.prevKey = `Dummy`;

		// ローカルストレージへcolorType設定を保存
		g_localStorage.colorType = g_colorType;

		let storageObj = g_localKeyStorage;
		let addKey = ``;

		// リバース、キーコンフィグの保存（キー別）
		if (g_stateObj.extraKeyFlg) {
			storageObj = g_localStorage;
			addKey = g_keyObj.currentKey;
		}
		if (g_headerObj.reverseUse) {
			storageObj[`reverse${addKey}`] = g_stateObj.reverse;
		}
		storageObj[`keyCtrl${addKey}`] = setKeyCtrl(g_localKeyStorage, keyNum, keyCtrlPtn);
		if (g_keyObj.currentPtn !== -1) {
			storageObj[`keyCtrlPtn${addKey}`] = g_keyObj.currentPtn;
			g_keyObj[`keyCtrl${keyCtrlPtn}`] = structuredClone(g_keyObj[`keyCtrl${keyCtrlPtn}d`]);
		}

		// カラーセットの保存（キー別）
		if (!g_keycons.colorDefTypes.includes(g_colorType)) {

			resetColorType({ _toObj: storageObj, _to: addKey });
			resetColorType({ _from: g_colorType, _to: g_colorType, _fromObj: g_dfColorObj });

			g_colorType = g_keycons.colorSelf;
			g_localStorage.colorType = g_keycons.colorSelf;
			g_keycons.colorTypes = addValtoArray(g_keycons.colorTypes, g_keycons.colorSelf);
			resetColorType({ _to: g_keycons.colorSelf });
		}

		g_keycons.groups.forEach(type => {
			const groupNum = g_keycons[`${type}GroupNum`];
			storageObj[`${type}${addKey}`] = structuredClone(g_keyObj[`${type}${keyCtrlPtn}_${groupNum}`]);
			g_keyObj[`${type}${g_keyObj.currentKey}_-1_${groupNum}`] = structuredClone(g_keyObj[`${type}${keyCtrlPtn}_${groupNum}d`]);
			g_keyObj[`${type}${keyCtrlPtn}_${groupNum}`] = structuredClone(g_keyObj[`${type}${keyCtrlPtn}_${groupNum}d`]);

			// 古いキーデータの削除 (互換用)
			if (storageObj[`${type}${g_keyObj.currentKey}_-1_-1`] !== undefined) {
				delete storageObj[`${type}${g_keyObj.currentKey}_-1_-1`];
			}
		});

		if (!g_stateObj.extraKeyFlg) {
			localStorage.setItem(`danonicw-${g_keyObj.currentKey}k`, JSON.stringify(g_localKeyStorage));
		}

		localStorage.setItem(g_localStorageUrl, JSON.stringify(g_localStorage));
		g_canLoadDifInfoFlg = true;

	} else {
		// データ未保存 もしくは 別キーモード時はキーコンフィグ設定を初期化しない
		g_keyObj.prevKey = g_keyObj.currentKey;
		g_canLoadDifInfoFlg = false;
	}
};

/**
 * キーコンフィグ保存処理
 * @param {object} _localStorage 保存先のローカルストレージ名
 * @param {number} _keyNum 
 * @param {string} _keyCtrlPtn 
 * @returns {any[][]}
 */
const setKeyCtrl = (_localStorage, _keyNum, _keyCtrlPtn) => {
	const localPtn = `${g_keyObj.currentKey}_-1`;
	const keyCtrl = [...Array(_keyNum)].map(() => []);
	for (let j = 0; j < _keyNum; j++) {
		for (let k = 0; k < g_keyObj[`keyCtrl${_keyCtrlPtn}`][j].length; k++) {
			keyCtrl[j][k] = g_keyObj[`keyCtrl${_keyCtrlPtn}`][j][k];
		}
		if (g_keyObj[`keyCtrl${localPtn}`] !== undefined) {
			if (g_keyObj[`keyCtrl${_keyCtrlPtn}`][j].length < g_keyObj[`keyCtrl${localPtn}`][j].length) {
				for (let k = g_keyObj[`keyCtrl${_keyCtrlPtn}`][j].length; k < g_keyObj[`keyCtrl${localPtn}`][j].length; k++) {
					keyCtrl[j][k] = undefined;
				}
			}
		}
	}
	return keyCtrl;
};

/**
 * キー数基礎情報の取得
 * @returns {{ 
 * 	keyCtrlPtn: string, keyNum: number, posMax: number,
 * 	divideCnt: number, keyGroupMaps: string[], keyGroupList: string[] 
 * }}
 */
const getKeyInfo = () => {
	const keyCtrlPtn = `${g_keyObj.currentKey}_${g_keyObj.currentPtn}`;
	const keyNum = g_keyObj[`${g_keyObj.defaultProp}${keyCtrlPtn}`].length;
	const posMax = g_keyObj[`divMax${keyCtrlPtn}`] ?? Math.max(...g_keyObj[`pos${keyCtrlPtn}`]) + 1;
	const divideCnt = g_keyObj[`div${keyCtrlPtn}`] - 1;
	const keyGroupMaps = setVal(g_keyObj[`keyGroup${keyCtrlPtn}`], fillArray(keyNum, [`0`]), C_TYP_STRING);
	const keyGroupList = makeDedupliArray(keyGroupMaps.flat()).sort((a, b) => parseInt(a) - parseInt(b));

	return {
		keyCtrlPtn, keyNum, posMax, divideCnt, keyGroupMaps, keyGroupList,
	};
};

/*-----------------------------------------------------------*/
/* その他の共通設定                                           */
/*-----------------------------------------------------------*/

// WebAudioAPIでAudio要素風に再生するクラス
class AudioPlayer {
	constructor() {
		this._context = getSharedAudioContext();
		this._gain = this._context.createGain();
		this._gain.connect(this._context.destination);
		this._startTime = 0;
		this._scheduledTime = 0;
		this._fadeinPosition = 0;
		this._eventListeners = {};
		this.playbackRate = 1;
		this._muted = false;
		this._savedVolume = 1;
	}

	async init(_arrayBuffer) {
		this._arrayBuffer = _arrayBuffer;
		await this._context.decodeAudioData(this._arrayBuffer, _buffer => {
			this._duration = _buffer.duration;
			this._buffer = _buffer;
		});
		this._eventListeners[`canplaythrough`]?.forEach(_listener => _listener());
	}

	/**
	 * 再生処理
	 * @param {number} _adjustmentTime
	 * - 実際の再生開始時間は、scheduleLead + _adjustmentTime から開始される
	 * - ただしゲーム内での経過時間計算は _adjustmentTime を基準に行う
	 * - scheduleLead は安定した再生タイミングを確保するための内部マージン
	 */
	play(_adjustmentTime = 0) {
		// AudioContextの時計は1回だけ読み、以降はその値を使い回す
		// - currentTimeはレンダークォンタム単位でしか進まないため、複数回読むと
		//   予約時刻と論理開始時刻が最大1クォンタム分ずれる
		const ctxNow = this._context.currentTime;

		this._source = this._context.createBufferSource();
		this._source.buffer = this._buffer;
		this._source.playbackRate.value = this.playbackRate;
		this._source.connect(this._gain);

		// 実際の予約時刻（内部スケジューリング用のマージンを含む）
		const startAt = ctxNow + g_scheduleLead + _adjustmentTime;
		this._source.start(startAt, this._fadeinPosition);

		// ゲーム側の論理的開始時刻（g_scheduleLead を含めない）
		this._startTime = ctxNow + _adjustmentTime;

		// 実際に音が鳴り始めるAudioContext上の時刻（フレーム同期の基準）
		this._scheduledTime = startAt;
	}

	pause() {
		if (this._source) {
			this._source.stop(0);
		}
	}

	close() {
		if (this._source) {
			this._source.stop(0);
			this._source.disconnect(this._gain);
			this._source = null;
		}
		if (this._gain) {
			this._gain.disconnect();
			this._gain = null;
		}
	}

	get elapsedTime() {
		return (this._context.currentTime - this._scheduledTime) * this.playbackRate + g_scheduleLead + this._fadeinPosition;
	}

	/** AudioContextの現在時刻(秒) */
	get contextTime() {
		return this._context.currentTime;
	}

	/** 実際に音が鳴り始めるAudioContext上の時刻(秒) */
	get scheduledTime() {
		return this._scheduledTime;
	}

	/** 音が出力デバイスから実際に出るまでの遅延(秒) */
	get outputLatency() {
		return this._context.outputLatency || this._context.baseLatency || 0;
	}

	/** AudioContextの状態(running / suspended / closed) */
	get contextState() {
		return this._context.state;
	}

	set currentTime(_currentTime) {
		this._fadeinPosition = _currentTime;
	}

	get volume() {
		// ミュート中でも設定されている音量を返す
		return this._muted ? this._savedVolume : this._gain.gain.value;
	}

	set volume(_volume) {
		if (this._muted) {
			// ミュート中でも音量設定は保存
			this._savedVolume = _volume;
		} else {
			this._gain.gain.value = _volume;
		}
	}

	get duration() {
		return this._duration;
	}

	get readyState() {
		if (this._duration) {
			return 4;
		} else {
			return 0;
		}
	}

	get muted() {
		return this._muted;
	}

	set muted(_muted) {
		if (this._muted === _muted) {
			return;
		}
		this._muted = _muted;

		if (_muted) {
			// ミュート時：現在の音量を保存してゲインを0に
			this._savedVolume = this._gain.gain.value;
			this._gain.gain.value = 0;
		} else {
			// ミュート解除時：保存した音量を復元
			this._gain.gain.value = this._savedVolume;
		}
	}

	addEventListener(_type, _listener) {
		this._eventListeners[_type]?.push(_listener) || (this._eventListeners[_type] = [_listener]);
	}

	removeEventListener(_type, _listener) {
		if (this._eventListeners[_type] === undefined) {
			return;
		}
		this._eventListeners[_type] = this._eventListeners[_type].filter(_element => _element !== _listener);
	}

	getBuffer() {
		return this._buffer;
	}

	setBuffer(_buffer) {
		this._buffer = _buffer;
		this._duration = _buffer.duration;
		this._eventListeners[`canplaythrough`]?.forEach(_listener => _listener());
	}

	load() { }
	dispatchEvent() { }
}

// グローバルで1つだけ保持(遅延生成)
const getSharedAudioContext = () => {
	if (!g_sharedAudioContext) {
		g_sharedAudioContext = new AudioContext();
	}
	// タブのバックグラウンド化等でsuspendedになることがあるため念のためresume
	if (g_sharedAudioContext.state === `suspended`) {
		g_sharedAudioContext.resume();
	}
	return g_sharedAudioContext;
};

/**
 * AudioContextのウォームアップ
 * - 生成直後・resume直後のAudioContextは出力デバイスの起動待ちのため、
 *   しばらく currentTime が進まない(環境により数十〜数百ms)
 * - この状態で音源をスケジュールすると、起動に要した時間がそのまま
 *   音源と譜面のずれになるため、無音を1回鳴らして時計が動き出すまで待つ
 * @returns {Promise<void>}
 */
const warmUpAudioContext = async () => {
	const ctx = getSharedAudioContext();
	if (ctx.state !== `running`) {
		await ctx.resume().catch(() => { });
	}
	if (ctx.state !== `running`) {
		return; // ジェスチャー未取得等でresumeできない場合は何もしない
	}

	// 無音を1サンプルだけ鳴らして出力デバイスを起動させる
	const source = ctx.createBufferSource();
	source.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
	source.connect(ctx.destination);
	source.start();

	// currentTimeが実際に進み始めるまで待機(最大500ms)
	const baseTime = ctx.currentTime;
	const limitTime = performance.now() + 500;
	while (ctx.currentTime === baseTime && performance.now() < limitTime) {
		await new Promise(resolve => g_timerHandler.setTimeout(resolve, 10));
	}
};
