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
	let controls = null;

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

	/**
	 * 疑似フルスクリーン時のプレイ用ボタンの位置を更新
	 * - 画面右下に配置し、ゲーム領域との余白が足りない場合はゲーム画面に重ねる
	 */
	const positionControls = () => {
		if (controls === null || controls.style.display === `none`) return;

		const viewport = getViewport();
		const uiScale = 1 / (window.visualViewport?.scale || 1);
		const buttonW = 72 * uiScale;
		const buttonH = 36 * uiScale;
		const gap = 8 * uiScale;
		const margin = 12 * uiScale;

		Array.from(controls.querySelectorAll(`button`)).forEach(btn => {
			btn.style.width = wUnit(buttonW);
			btn.style.height = wUnit(buttonH);
			btn.style.fontSize = wUnit(14 * uiScale);
		});
		controls.style.gap = wUnit(gap);

		const buttonCount = controls.querySelectorAll(`button`).length;
		const totalH = buttonH * buttonCount + gap * Math.max(0, buttonCount - 1);
		controls.style.left = wUnit(Math.max(
			viewport.left + margin,
			viewport.left + viewport.width - buttonW - margin
		));
		controls.style.top = wUnit(Math.max(
			viewport.top + margin,
			viewport.top + viewport.height - totalH - margin
		));
	};

	/**
	 * 疑似フルスクリーン時のプレイ用ボタンの表示/非表示を更新
	 * @param {boolean} [_isMain=g_currentPage === `main`]
	 */
	const updateControls = (_isMain = g_currentPage === `main`) => {
		if (!active || controls === null) return;

		controls.style.display = _isMain ? `flex` : `none`;
		if (_isMain) {
			positionControls();
		}
	};

	/**
	 * 疑似フルスクリーン時のプレイ用ボタンを作成
	 */
	const createControls = () => {
		if (controls !== null) return;

		const controlRoot = document.createElement(`div`);
		controlRoot.id = `danoniPseudoFullscreenControls`;

		const isPaused = () => document.getElementById(`divRoot`)?.classList.contains(`gamePaused`) ?? false;

		const backBtn = document.createElement(`button`);
		backBtn.id = `danoniPseudoFullscreenBack`;
		backBtn.type = `button`;
		backBtn.textContent = g_lblNameObj.b_back;
		backBtn.title = g_lblNameObj.l_titleBack;
		backBtn.onclick = () => {
			if (!active || g_currentPage !== `main` || g_retryInProgress || isPaused()) return;
			g_audio.pause();
			g_timerHandler.clearTimeout(g_timeoutEvtId);
			titleInit();
		};

		const retryBtn = document.createElement(`button`);
		retryBtn.id = `danoniPseudoFullscreenRetry`;
		retryBtn.type = `button`;
		retryBtn.textContent = g_lblNameObj.b_retry;
		retryBtn.title = g_lblNameObj.l_retry;
		retryBtn.onclick = async () => {
			if (!active || g_currentPage !== `main` || g_retryInProgress || isPaused()) return;
			retryBtn.disabled = true;
			try {
				await executeRetry(`Retry`);
			} finally {
				retryBtn.disabled = false;
			}
		};

		const pauseBtn = document.createElement(`button`);
		pauseBtn.id = `danoniPseudoFullscreenPause`;
		pauseBtn.type = `button`;
		pauseBtn.textContent = g_lblNameObj.b_pause;
		pauseBtn.title = g_lblNameObj.l_pause;
		pauseBtn.onclick = () => {
			if (!active || g_currentPage !== `main` || g_retryInProgress) return;
			isPaused() ? g_timelineHooks.resume(true) : g_timelineHooks.pause(true);
		};

		controlRoot.appendChild(backBtn);
		controlRoot.appendChild(retryBtn);
		controlRoot.appendChild(pauseBtn);
		document.body.appendChild(controlRoot);
		controls = controlRoot;

		updateControls();
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
			exitBtn.style.fontSize = wUnit(24 * uiScale);
			exitBtn.style.left = wUnit(viewport.left + viewport.width - btnSize - margin);
			exitBtn.style.top = wUnit(viewport.top + margin);
		}

		positionControls();
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
		exitBtn.innerHTML = `&#x2715;`;
		exitBtn.title = g_lblNameObj.b_exitFullscreen;
		exitBtn.setAttribute(`aria-label`, g_lblNameObj.b_exitFullscreen);
		exitBtn.onclick = () => exit();
		document.body.appendChild(exitBtn);

		createControls();

		bindEvents(frame);
		fit();

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
		controls?.remove();
		controls = null;

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
		getScale: () => scale,
	};
})();
