/*
 * This file is part of the Zotero Connector page-button fork.
 * It adds a save button to Web of Science / Web of Knowledge search-result
 * and record pages and delegates saving to the Connector's existing browser-action flow.
 */

'use strict';

(function () {
	const BUTTON_ID = 'zotero-wos-save-button';
	const STYLE_ID = `${BUTTON_ID}-style`;
	const MESSAGE_TYPE = 'zotero-wos-save';
	let resetTimer;
	let syncScheduled = false;

	function isSupportedPage() {
		const hostname = window.location.hostname.toLowerCase();
		const pathname = window.location.pathname.toLowerCase();
		const isNextgenHost = hostname === 'www.webofscience.com'
			|| hostname === 'webofscience.clarivate.cn';
		const isLegacyHost = hostname === 'webofknowledge.com'
			|| hostname.endsWith('.webofknowledge.com');

		if (isNextgenHost) {
			return pathname.includes('/full-record/')
				|| pathname.includes('/summary/')
				|| pathname.includes('/smart-search')
				|| pathname.includes('/basic-search')
				|| pathname.includes('/advanced-search')
				|| pathname.startsWith('/wos/');
		}
		if (isLegacyHost) {
			return /(?:full_record|citedfullrecord|inboundservice|summary)\.do/i.test(pathname)
				|| /search_mode=/i.test(window.location.search)
				|| pathname.endsWith('.do')
				|| pathname === '/' || pathname === '';
		}
		return false;
	}

	function setState(button, state, label) {
		button.dataset.state = state;
		button.disabled = state === 'saving';
		button.querySelector('.zotero-wos-save-button-label').textContent = label;
	}

	function createButton() {
		const button = document.createElement('button');
		button.id = BUTTON_ID;
		button.type = 'button';
		button.title = '使用 Zotero Connector 保存当前页面（详情页直接保存，检索页弹出条目选择）';
		button.setAttribute('aria-label', '保存到 Zotero');
		button.innerHTML = '<span class="zotero-wos-save-button-icon">Z</span>'
			+ '<span class="zotero-wos-save-button-label">保存到 Zotero</span>';

		button.addEventListener('click', async function () {
			clearTimeout(resetTimer);
			setState(button, 'saving', '正在保存…');
			try {
				const response = await browser.runtime.sendMessage({ type: MESSAGE_TYPE });
				if (!response || !response.ok) {
					throw new Error(response && response.error || 'Connector 未响应');
				}
				setState(button, 'success', '已触发 Zotero');
			}
			catch (error) {
				console.error('Zotero Web of Science save failed', error);
				setState(button, 'error', '保存失败');
			}
			resetTimer = setTimeout(() => {
				if (button.isConnected) {
					setState(button, 'idle', '保存到 Zotero');
				}
			}, 2500);
		});

		return button;
	}

	function ensureStyle() {
		if (document.getElementById(STYLE_ID)) {
			return;
		}
		const style = document.createElement('style');
		style.id = STYLE_ID;
		style.textContent = `
			#${BUTTON_ID} {
				all: initial;
				position: fixed;
				right: 24px;
				bottom: 24px;
				z-index: 2147483647;
				display: inline-flex;
				align-items: center;
				gap: 8px;
				box-sizing: border-box;
				min-height: 42px;
				padding: 8px 14px 8px 9px;
				border: 0;
				border-radius: 21px;
				background: #cc2936;
				box-shadow: 0 4px 14px rgba(0, 0, 0, .25);
				color: #fff;
				cursor: pointer;
				font: 600 14px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
				transition: transform .15s ease, background-color .15s ease, opacity .15s ease;
			}
			#${BUTTON_ID}:hover {
				transform: translateY(-1px);
				background: #b5222e;
			}
			#${BUTTON_ID}:focus-visible {
				outline: 3px solid rgba(204, 41, 54, .35);
				outline-offset: 3px;
			}
			#${BUTTON_ID}:disabled {
				cursor: default;
				opacity: .78;
				transform: none;
			}
			#${BUTTON_ID}[data-state="success"] {
				background: #2e7d32;
			}
			#${BUTTON_ID}[data-state="error"] {
				background: #555;
			}
			#${BUTTON_ID} .zotero-wos-save-button-icon {
				display: inline-flex;
				align-items: center;
				justify-content: center;
				box-sizing: border-box;
				width: 26px;
				height: 26px;
				border-radius: 50%;
				background: #fff;
				color: #cc2936;
				font: 700 16px/1 Georgia, serif;
			}
			#${BUTTON_ID} .zotero-wos-save-button-label {
				all: initial;
				color: inherit;
				font: inherit;
				white-space: nowrap;
			}
		`;
		(document.head || document.documentElement).appendChild(style);
	}

	function syncButton() {
		const button = document.getElementById(BUTTON_ID);
		if (isSupportedPage()) {
			if (!button) {
				ensureStyle();
				(document.body || document.documentElement).appendChild(createButton());
			}
		}
		else {
			clearTimeout(resetTimer);
			button && button.remove();
			document.getElementById(STYLE_ID)?.remove();
		}
	}

	function scheduleSync() {
		if (syncScheduled) {
			return;
		}
		syncScheduled = true;
		requestAnimationFrame(() => {
			syncScheduled = false;
			syncButton();
		});
	}

	new MutationObserver(scheduleSync).observe(document.documentElement, {
		childList: true,
		subtree: true
	});
	window.addEventListener('popstate', scheduleSync);
	window.addEventListener('hashchange', scheduleSync);
	syncButton();
})();
