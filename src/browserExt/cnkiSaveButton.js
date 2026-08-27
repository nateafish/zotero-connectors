/*
 * This file is part of the Zotero Connector CNKI button fork.
 * It adds a page button only on CNKI and delegates saving to the
 * Connector's existing browser-action flow.
 */

'use strict';

(function () {
	const BUTTON_ID = 'zotero-cnki-save-button';
	const MESSAGE_TYPE = 'zotero-cnki-save';

	if (document.getElementById(BUTTON_ID)) {
		return;
	}

	const button = document.createElement('button');
	button.id = BUTTON_ID;
	button.type = 'button';
	button.title = '使用 Zotero Connector 保存当前页面';
	button.setAttribute('aria-label', '保存到 Zotero');
	button.innerHTML = '<span class="zotero-cnki-save-button-icon">Z</span>'
		+ '<span class="zotero-cnki-save-button-label">保存到 Zotero</span>';

	const style = document.createElement('style');
	style.id = `${BUTTON_ID}-style`;
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
		#${BUTTON_ID} .zotero-cnki-save-button-icon {
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
		#${BUTTON_ID} .zotero-cnki-save-button-label {
			all: initial;
			color: inherit;
			font: inherit;
			white-space: nowrap;
		}
	`;

	function setState(state, label) {
		button.dataset.state = state;
		button.disabled = state === 'saving';
		button.querySelector('.zotero-cnki-save-button-label').textContent = label;
	}

	button.addEventListener('click', async function () {
		setState('saving', '正在保存…');
		try {
			const response = await browser.runtime.sendMessage({ type: MESSAGE_TYPE });
			if (!response || !response.ok) {
				throw new Error(response && response.error || 'Connector 未响应');
			}
			setState('success', '已交给 Zotero');
		}
		catch (error) {
			console.error('Zotero CNKI save failed', error);
			setState('error', '保存失败');
		}
		setTimeout(() => setState('idle', '保存到 Zotero'), 2500);
	});

	(document.head || document.documentElement).appendChild(style);
	(document.body || document.documentElement).appendChild(button);
})();
