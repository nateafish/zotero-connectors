# Web of Science / Web of Knowledge Save Button

This fork adds `#zotero-wos-save-button` to search-result and full-record pages supported by Zotero's official Web of Science translators. Clicking it delegates to the Connector's existing `_browserAction(tab)` flow; the page script does not scrape or construct metadata.

## Supported sites

- Next-generation Web of Science: `https://www.webofscience.com/wos/<database>/summary/...` and `/full-record/<record-id>`
- China mirror supported by the official translator: `https://webofscience.clarivate.cn/wos/...`
- Legacy Web of Knowledge hosts: `*.webofknowledge.com` result pages and record paths ending in `full_record.do`, `CitedFullRecord.do`, or `InboundService.do`

`www.webofknowledge.com` currently redirects an authenticated session to `www.webofscience.com`, but the legacy hosts remain explicitly supported because Zotero still ships a dedicated Web of Science translator for them. The next-generation translator also uses `www.webofknowledge.com` as its session gateway.

On a result page, the Connector opens its normal item-selection dialog. On a full-record page, it saves the current record. Web of Science is a single-page application, so the content script observes route-driven DOM changes and adds or removes the button when navigation enters or leaves a supported route.

The button's “已触发 Zotero” state only confirms handoff to the Connector. Zotero's local API is the authoritative success signal.
