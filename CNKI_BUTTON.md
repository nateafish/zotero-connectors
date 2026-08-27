# CNKI Save Button Fork

This fork keeps Zotero Connector's existing detection, translation, attachment, snapshot, and save behavior unchanged. It adds one page button on CNKI article detail pages.

Clicking **保存到 Zotero** sends an internal extension message to the background process, which invokes the same `_browserAction(tab)` function used by the Connector toolbar button. The page script does not parse CNKI metadata and does not call CNKI export APIs.

## Install in Chrome

1. Build the Manifest V3 extension with `./build.sh -p b -v 5.0.212.2`.
2. Open `chrome://extensions` and enable Developer mode.
3. Choose **Load unpacked** and select `build/manifestv3`.
4. Disable the Chrome Web Store Connector while testing this fork to avoid duplicate toolbar actions and shortcut conflicts.

The content script runs only on `http://*.cnki.net/*` and `https://*.cnki.net/*`. It renders the button only on `/kcms2/article/abstract` and `/kcms/detail/detail.aspx` article detail paths, so login, CAPTCHA, search, and home pages do not show a misleading save action.

## End-to-end testing

Test the fork in the user's actual Chrome profile, because CNKI authentication and institutional access belong to that profile. A separate clean or headless Chrome can verify extension loading and button injection, but it cannot validate the authenticated CNKI-to-Zotero workflow.

The verified workflow is:

1. Confirm `#zotero-cnki-save-button` exists on a rendered CNKI article detail page in the user's Chrome.
2. Record whether the article already exists in Zotero.
3. Click the page button.
4. Query Zotero's local API and require a newly saved bibliographic item in the selected collection.
5. Verify the item type, title, creators, date, abstract, and child attachments from Zotero rather than trusting the button's temporary visual state.

This was verified on 2026-08-27 using a live CNKI detail page in the user's Chrome. Zotero saved a typed bibliographic item with an abstract and an imported CNKI PDF attachment.
