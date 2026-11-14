/**
 * Dancing☆Onigiri (CW Edition)
 * 疑似フルスクリーン
 * - ページ: common
 *
 * Source by tickle
 * Created : 2026/11/14
 * Revised : 2026/11/14 (v52.6.1)
 *
 * https://github.com/cwtickle/danoniplus
 */

/*-----------------------------------------------------------*/
/* Scene : COMMON [pseudo fullscreen] */
/*-----------------------------------------------------------*/

/** 疑似フルスクリーン表示中か */
let g_pseudoFullscreen = false;

/** 疑似フルスクリーン時の拡縮率 */
let g_pseudoFullscreenScale = 1;

/** 疑似フルスクリーン用のイベントリスナー */
let g_pseudoFullscreenListeners = [];

/** 疑似フルスクリーン用のResizeObserver */
let g_pseudoFullscreenResizeObserver = null;

/** 疑似フルスクリーン解除時に戻す#canvas-frameのインラインスタイル */
let g_pseudoFullscreenSavedStyle = null;

/** 疑似フルスクリーン解除時に戻すスクロール位置 */
let g_pseudoFullscreenSavedScroll = null;

/** 疑似フルスクリーンの再計算待ちID */
let g_pseudoFullscreenRafId = null;

/**
 * 疑似フルスクリーンの表示倍率を取得
 * @returns {number}
 */
const getPseudoFullscreenScale = () => g_pseudoFullscreenScale;

/**
 * 疑似フルスクリーンで使用する表示領域を取得
 * @returns {{ left: number, top: number, width: number, height: number }}
 */
const getPseudoFullscreenViewport = () => {
	const vv = window.visualViewport;
	return {
		left: vv?.offsetLeft ?? 0,
		top: vv?.offsetTop ?? 0,
		width: vv?.width ?? window.innerWidth,
		height: vv?.height ?? window.innerHeight,
	};
};

/**
 * 疑似フルスクリーン時の表示サイズを計算して#canvas-frameへ適用
 * - autoSpreadやwindowWidth等で横幅が変わった場合も実サイズを基準に再計算する
 */
const fitPseudoFullscreen = () => {
	if (!g_pseudoFullscreen) return;

	const frame = document.getElementById(`canvas-frame`);
	if (frame === null) return;

	const frameW = frame.offsetWidth;
	const frameH = frame.offsetHeight;
	const viewport = getPseudoFullscreenViewport();
	if (frameW <= 0 || frameH <= 0 || viewport.width <= 0 || viewport.height <= 0) return;

	const scale = Math.min(viewport.width / frameW, viewport.height / frameH);
	g_pseudoFullscreenScale = scale;

	// #canvas-frameの左上を表示領域の左上に合わせ、中央寄せ分をtransformで移動
	frame.style.left = wUnit(viewport.left + (viewport.width - frameW * scale) / 2);
	frame.style.top = wUnit(viewport.top + (viewport.height - frameH * scale) / 2);
	frame.style.transform = `scale(${scale})`;
	frame.style.transformOrigin = `0 0`;

	// 終了ボタンはページの拡縮に影響されないよう、実サイズを基準に補正
	const exitBtn = document.getElementById(`danoniPseudoFullscreenExit`);
	if (exitBtn !== null) {
		const uiScale = 1 / (window.visualViewport?.scale || 1);
		const btnSize = 44 * uiScale;
		const margin = 8 * uiScale;
		exitBtn.style.width = wUnit(btnSize);
		exitBtn.style.height = wUnit(btnSize);
		exitBtn.style.fontSize = wUnit(24 * uiScale);
		exitBtn.style.left = wUnit(viewport.left + viewport.width - btnSize - margin);
		exitBtn.style.top = wUnit(viewport.top + margin);
	}
};

/**
 * 疑似フルスクリーンの再計算を次フレームに予約
 */
const requestFitPseudoFullscreen = () => {
	if (g_pseudoFullscreenRafId !== null) return;
	g_pseudoFullscreenRafId = window.requestAnimationFrame(() => {
		g_pseudoFullscreenRafId = null;
		fitPseudoFullscreen();
	});
};

/**
 * 疑似フルスクリーンのイベントリスナーを登録
 * @param {HTMLDivElement} _frame
 */
const bindPseudoFullscreenEvents = _frame => {
	g_pseudoFullscreenListeners = [
		{ target: window, type: `resize`, listener: requestFitPseudoFullscreen },
		{ target: window, type: `orientationchange`, listener: requestFitPseudoFullscreen },
	];
	if (window.visualViewport !== undefined) {
		g_pseudoFullscreenListeners.push(
			{ target: window.visualViewport, type: `resize`, listener: requestFitPseudoFullscreen },
			{ target: window.visualViewport, type: `scroll`, listener: requestFitPseudoFullscreen },
		);
	}
	g_pseudoFullscreenListeners.forEach(({ target, type, listener }) =>
		target.addEventListener(type, listener));

	if (typeof ResizeObserver !== `undefined`) {
		g_pseudoFullscreenResizeObserver = new ResizeObserver(() => fitPseudoFullscreen());
		g_pseudoFullscreenResizeObserver.observe(_frame);
	}
};

/**
 * 疑似フルスクリーンのイベントリスナーを解除
 */
const unbindPseudoFullscreenEvents = () => {
	g_pseudoFullscreenListeners.forEach(({ target, type, listener }) =>
		target.removeEventListener(type, listener));
	g_pseudoFullscreenListeners = [];
	g_pseudoFullscreenResizeObserver?.disconnect();
	g_pseudoFullscreenResizeObserver = null;
};

/**
 * 疑似フルスクリーン開始
 */
const enterPseudoFullscreen = () => {
	if (g_pseudoFullscreen) return;

	const frame = document.getElementById(`canvas-frame`);
	if (frame === null) return;

	g_pseudoFullscreen = true;
	g_pseudoFullscreenSavedStyle = {
		left: frame.style.left,
		top: frame.style.top,
		transform: frame.style.transform,
		transformOrigin: frame.style.transformOrigin,
	};
	g_pseudoFullscreenSavedScroll = { x: window.scrollX, y: window.scrollY };

	document.documentElement.classList.add(`danoni-pseudo-fullscreen`);

	const backdrop = document.createElement(`div`);
	backdrop.id = `danoniPseudoFullscreenBackdrop`;
	document.body.appendChild(backdrop);

	const exitBtn = document.createElement(`button`);
	exitBtn.id = `danoniPseudoFullscreenExit`;
	exitBtn.type = `button`;
	exitBtn.innerHTML = `&#x2715;`;
	exitBtn.title = g_lblNameObj.b_exitFullscreen;
	exitBtn.setAttribute(`aria-label`, g_lblNameObj.b_exitFullscreen);
	exitBtn.onclick = () => exitPseudoFullscreen();
	document.body.appendChild(exitBtn);

	bindPseudoFullscreenEvents(frame);
	fitPseudoFullscreen();

	// レイアウト確定後に再計算（URLバーの表示状態など）
	requestFitPseudoFullscreen();
};

/**
 * 疑似フルスクリーン終了
 */
const exitPseudoFullscreen = () => {
	if (!g_pseudoFullscreen) return;

	g_pseudoFullscreen = false;
	unbindPseudoFullscreenEvents();
	if (g_pseudoFullscreenRafId !== null) {
		window.cancelAnimationFrame(g_pseudoFullscreenRafId);
		g_pseudoFullscreenRafId = null;
	}

	const frame = document.getElementById(`canvas-frame`);
	if (frame !== null && g_pseudoFullscreenSavedStyle !== null) {
		frame.style.left = g_pseudoFullscreenSavedStyle.left;
		frame.style.top = g_pseudoFullscreenSavedStyle.top;
		frame.style.transform = g_pseudoFullscreenSavedStyle.transform;
		frame.style.transformOrigin = g_pseudoFullscreenSavedStyle.transformOrigin;
	}
	g_pseudoFullscreenSavedStyle = null;
	g_pseudoFullscreenScale = 1;

	document.documentElement.classList.remove(`danoni-pseudo-fullscreen`);
	document.getElementById(`danoniPseudoFullscreenBackdrop`)?.remove();
	document.getElementById(`danoniPseudoFullscreenExit`)?.remove();

	if (g_pseudoFullscreenSavedScroll !== null) {
		window.scrollTo(g_pseudoFullscreenSavedScroll.x, g_pseudoFullscreenSavedScroll.y);
		g_pseudoFullscreenSavedScroll = null;
	}
};

/**
 * 疑似フルスクリーンの表示/非表示を切り替え
 */
const togglePseudoFullscreen = () => {
	g_pseudoFullscreen ? exitPseudoFullscreen() : enterPseudoFullscreen();
};
