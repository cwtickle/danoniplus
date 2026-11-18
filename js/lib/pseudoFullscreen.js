/**
 * Dancing☆Onigiri (CW Edition)
 * 疑似フルスクリーン
 * - ページ: common
 *
 * Source by tickle
 * Created : 2026/11/16
 * Revised : 2026/11/16 (v53.0.0)
 *
 * https://github.com/cwtickle/danoniplus
 */

/*-----------------------------------------------------------*/
/* Scene : COMMON [pseudo fullscreen] */
/*-----------------------------------------------------------*/

/**
 * 疑似フルスクリーン管理
 * - 状態・補助関数はクロージャ内に保持し、外部には必要最小限のAPIのみ公開する
 */
const g_pseudoFullscreen = (() => {
	let active = false;
	let scale = 1;
	let listeners = [];
	let resizeObserver = null;
	let savedStyle = null;
	let savedScroll = null;
	let rafId = null;

	/**
	 * 疑似フルスクリーンで使用する表示領域を取得
	 * @returns {{ left: number, top: number, width: number, height: number }}
	 */
	const getViewport = () => {
		const vv = window.visualViewport;
		return {
			left: vv?.offsetLeft ?? 0,
			top: vv?.offsetTop ?? 0,
			width: vv?.width ?? window.innerWidth,
			height: vv?.height ?? window.innerHeight,
		};
	};

	/** 右上ボタンのアイコンサイズ(px) */
	const CONTROL_BTN_SIZES = { pause: 18, resume: 22, exit: 24 };

	/**
	 * 右上ボタンの表示を状態に応じて切り替え
	 * @param {string} _mode pause: ポーズ, resume: リジューム, exit: 全画面解除, hidden: 非表示
	 */
	const setControlMode = _mode => {
		const controlBtn = document.getElementById(`danoniPseudoFullscreenExit`);
		if (controlBtn === null) return;

		controlBtn.classList.remove(`isPause`, `isResume`);

		if (_mode === `hidden`) {
			controlBtn.style.display = `none`;
			controlBtn.onclick = null;
			return;
		}

		const uiScale = 1 / (window.visualViewport?.scale || 1);
		controlBtn.style.display = `flex`;
		controlBtn.style.fontSize = wUnit(CONTROL_BTN_SIZES[_mode] * uiScale);

		if (_mode === `pause`) {
			controlBtn.innerHTML = g_emojiObj.pause;
			controlBtn.classList.add(`isPause`);
			controlBtn.title = g_lblNameObj.b_pause;
			controlBtn.setAttribute(`aria-label`, g_lblNameObj.b_pause);
			controlBtn.onclick = () => {
				if (!active || g_retryInProgress) return;
				g_timelineHooks.pause(true);
			};
		} else if (_mode === `resume`) {
			controlBtn.innerHTML = g_emojiObj.play;
			controlBtn.classList.add(`isResume`);
			controlBtn.title = g_lblNameObj.b_resume;
			controlBtn.setAttribute(`aria-label`, g_lblNameObj.b_resume);
			controlBtn.onclick = () => {
				if (!active || g_retryInProgress) return;
				g_timelineHooks.resume(true);
			};
		} else {
			controlBtn.innerHTML = g_emojiObj.close;
			controlBtn.title = g_lblNameObj.b_exitFullscreen;
			controlBtn.setAttribute(`aria-label`, g_lblNameObj.b_exitFullscreen);
			controlBtn.onclick = () => exit();
		}
	};

	/**
	 * 疑似フルスクリーン時の画面状態を右上ボタンへ反映
	 * - プレイ中: ポーズ、ポーズ中: リジューム、タイトル: 全画面解除、それ以外: 非表示
	 * @param {boolean} [_isMain=g_currentPage === `main`]
	 * @param {boolean} [_isCountingDown=g_timelineHooks.isCountingDown()] ポーズ解除カウントダウン中かどうか
	 */
	const updateControls = (_isMain = g_currentPage === `main`,
		_isCountingDown = g_timelineHooks.isCountingDown?.() ?? false) => {
		if (!active) return;
		if (_isMain) {
			const isPaused = document.getElementById(`divRoot`)?.classList.contains(`gamePaused`) ?? false;
			setControlMode(isPaused && !_isCountingDown ? `resume` : `pause`);
		} else if (g_currentPage === `title` || g_currentPage === `initial`) {
			setControlMode(`exit`);
		} else {
			setControlMode(`hidden`);
		}
	};

	/**
	 * 疑似フルスクリーン時の表示サイズを計算して#canvas-frameへ適用
	 * - autoSpreadやwindowWidth等で横幅が変わった場合も実サイズを基準に再計算する
	 */
	const fit = () => {
		if (!active) return;

		const frame = document.getElementById(`canvas-frame`);
		if (frame === null) return;

		const frameW = frame.offsetWidth;
		const frameH = frame.offsetHeight;
		const viewport = getViewport();
		if (frameW <= 0 || frameH <= 0 || viewport.width <= 0 || viewport.height <= 0) return;

		scale = Math.min(viewport.width / frameW, viewport.height / frameH);

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
			const mode = exitBtn.classList.contains(`isPause`) ? `pause`
				: exitBtn.classList.contains(`isResume`) ? `resume` : `exit`;
			exitBtn.style.fontSize = wUnit(CONTROL_BTN_SIZES[mode] * uiScale);
			exitBtn.style.left = wUnit(viewport.left + viewport.width - btnSize - margin);
			exitBtn.style.top = wUnit(viewport.top + margin);
		}
	};

	/**
	 * 疑似フルスクリーンの再計算を次フレームに予約
	 */
	const requestFit = () => {
		if (rafId !== null) return;
		rafId = window.requestAnimationFrame(() => {
			rafId = null;
			fit();
		});
	};

	/**
	 * 疑似フルスクリーンのイベントリスナーを登録
	 * @param {HTMLDivElement} _frame
	 */
	const bindEvents = _frame => {
		listeners = [
			{ target: window, type: `resize`, listener: requestFit },
			{ target: window, type: `orientationchange`, listener: requestFit },
		];
		if (window.visualViewport !== undefined) {
			listeners.push(
				{ target: window.visualViewport, type: `resize`, listener: requestFit },
				{ target: window.visualViewport, type: `scroll`, listener: requestFit },
			);
		}
		listeners.forEach(({ target, type, listener }) =>
			target.addEventListener(type, listener));

		if (typeof ResizeObserver !== `undefined`) {
			resizeObserver = new ResizeObserver(() => fit());
			resizeObserver.observe(_frame);
		}
	};

	/**
	 * 疑似フルスクリーンのイベントリスナーを解除
	 */
	const unbindEvents = () => {
		listeners.forEach(({ target, type, listener }) =>
			target.removeEventListener(type, listener));
		listeners = [];
		resizeObserver?.disconnect();
		resizeObserver = null;
	};

	/**
	 * 疑似フルスクリーン開始
	 */
	const enter = () => {
		if (active) return;

		const frame = document.getElementById(`canvas-frame`);
		if (frame === null) return;

		active = true;
		savedStyle = {
			left: frame.style.left,
			top: frame.style.top,
			transform: frame.style.transform,
			transformOrigin: frame.style.transformOrigin,
		};
		savedScroll = { x: window.scrollX, y: window.scrollY };

		document.documentElement.classList.add(`danoni-pseudo-fullscreen`);

		const backdrop = document.createElement(`div`);
		backdrop.id = `danoniPseudoFullscreenBackdrop`;
		document.body.appendChild(backdrop);

		const exitBtn = document.createElement(`button`);
		exitBtn.id = `danoniPseudoFullscreenExit`;
		exitBtn.type = `button`;
		document.body.appendChild(exitBtn);

		bindEvents(frame);
		fit();
		updateControls();

		// レイアウト確定後に再計算（URLバーの表示状態など）
		requestFit();
	};

	/**
	 * 疑似フルスクリーン終了
	 */
	const exit = () => {
		if (!active) return;

		active = false;
		unbindEvents();
		if (rafId !== null) {
			window.cancelAnimationFrame(rafId);
			rafId = null;
		}

		const frame = document.getElementById(`canvas-frame`);
		if (frame !== null && savedStyle !== null) {
			frame.style.left = savedStyle.left;
			frame.style.top = savedStyle.top;
			frame.style.transform = savedStyle.transform;
			frame.style.transformOrigin = savedStyle.transformOrigin;
		}
		savedStyle = null;
		scale = 1;

		document.documentElement.classList.remove(`danoni-pseudo-fullscreen`);
		document.getElementById(`danoniPseudoFullscreenBackdrop`)?.remove();
		document.getElementById(`danoniPseudoFullscreenExit`)?.remove();

		if (savedScroll !== null) {
			window.scrollTo(savedScroll.x, savedScroll.y);
			savedScroll = null;
		}
	};

	/**
	 * 疑似フルスクリーンの表示/非表示を切り替え
	 */
	const toggle = () => {
		active ? exit() : enter();
	};

	return {
		toggle,
		fit,
		updateControls,
		isActive: () => active,
		getScale: () => scale,
	};
})();
