# CNKI Save Button Fork

This fork keeps Zotero Connector's existing detection, translation, attachment, snapshot, and save behavior unchanged. It adds one page button on `*.cnki.net`.

Clicking **保存到 Zotero** sends an internal extension message to the background process, which invokes the same `_browserAction(tab)` function used by the Connector toolbar button. The page script does not parse CNKI metadata and does not call CNKI export APIs.

## Install in Chrome

1. Build the Manifest V3 extension with `./build.sh -p b -v 5.0.212.1`.
2. Open `chrome://extensions` and enable Developer mode.
3. Choose **Load unpacked** and select `build/manifestv3`.
4. Disable the Chrome Web Store Connector while testing this fork to avoid duplicate toolbar actions and shortcut conflicts.

The button is injected only on `http://*.cnki.net/*` and `https://*.cnki.net/*`.
