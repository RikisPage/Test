"use strict";

const { Cr, Cc, Ci, Cu } = require("chrome");
const { autoCloseTab } = require("./preferencesManager");
const { areMatchingURL } = require("./urlUtils");
const { closeMatchingTabs } = require("./duplicateTabManager");
const tabsManager = require("./tabsManager");
const observer = require("sdk/system/events");
const { EventListener } = require("./eventListener");
const { hasAny } = require("sdk/util/array");
const { when: unload } = require("sdk/system/unload");
const utils = require("./utils");

const tabEventListener = new EventListener();

const onTabEvent = listener => tabEventListener.onSignal(listener);
exports.onTabEvent = onTabEvent;

const onHttpRequest = (event) => {

	const httpChannel = event.subject.QueryInterface(Ci.nsIHttpChannel);

	if ((httpChannel.loadFlags & Ci.nsIChannel.LOAD_INITIAL_DOCUMENT_URI) && (httpChannel.requestMethod === "GET")) {

		const tab = tabsManager.getTabForHttpChannel(httpChannel);

		if (tab) {

			let channelURL = httpChannel.URI.spec;

			if (httpChannel.originalURI.spec !== httpChannel.URI.spec) {
				if (/^view-source:*/.test(httpChannel.originalURI.spec)) {
					channelURL = httpChannel.originalURI.spec;
				}
			}

			if (!tab.loadingURL || !areMatchingURL(tab.loadingURL, channelURL)) {
				tab.loadingURL = channelURL;
				searchForDuplicateTabs(tab);
			}
		}
	}
};

const onHttpResponse = (event) => {

	const httpChannel = event.subject.QueryInterface(Ci.nsIHttpChannel);

	// redirection response
	if ((httpChannel.loadFlags & Ci.nsIChannel.LOAD_INITIAL_DOCUMENT_URI) && (httpChannel.requestMethod === "GET")) {

		if (hasAny([300, 301, 302, 303, 305, 307], httpChannel.responseStatus)) {

			const tab = tabsManager.getTabForHttpChannel(httpChannel);

			if (tab) {

				// get redirection location
				let redirectURL = httpChannel.getResponseHeader("location");

				// check URL location is relative
				const SCHEMEPATTERN = /^(f|ht)tps?:\/\//i;
				if (!SCHEMEPATTERN.test(redirectURL)) {
					redirectURL = httpChannel.URI.prePath + redirectURL;
				}

				// check missing hash value
				if (httpChannel.URI.ref !== "") {
					redirectURL = redirectURL + "#" + httpChannel.URI.ref;
				}

				if (!tab.loadingURL || !areMatchingURL(tab.loadingURL, redirectURL)) {
					tab.loadingURL = redirectURL;
					searchForDuplicateTabs(tab);
				}
			}
		}
	}
};

const onTabOpened = (tab) => {
	searchForDuplicateTabs(tab);
};

const onTabShown = (tab) => {
	searchForDuplicateTabs(tab);
};

const onTabUrlLocationChanged = (tab) => {
	searchForDuplicateTabs(tab);
};

const onTabActivated = (tab) => {
	tabEventListener.signal(tab.window, "onTabActivated");
};

const onTabClosed = (tab) => {
	if (tab.referenceWindow) tabEventListener.signal(tab.referenceWindow, "onTabClosed");
};

const searchForDuplicateTabs = (tab) => {
	autoCloseTab() ? closeMatchingTabs(tab) : tabEventListener.signal(tab.window, "searchForDuplicateTabs");
};

tabsManager.onTabOpened(onTabOpened);
tabsManager.onTabShown(onTabShown);
tabsManager.onTabActivated(onTabActivated);
tabsManager.onTabClosed(onTabClosed);
tabsManager.onTabUrlLocationChanged(onTabUrlLocationChanged);

observer.on("http-on-modify-request", onHttpRequest, false);
observer.on("http-on-examine-response", onHttpResponse, false);
observer.on("http-on-examine-cached-response", onHttpResponse, false);
observer.on("http-on-examine-merged-response", onHttpResponse, false);

unload( _ => {
	observer.off("http-on-modify-request", onHttpRequest);
	observer.off("http-on-examine-response", onHttpResponse);
	observer.off("http-on-examine-cached-response", onHttpResponse);
	observer.off("http-on-examine-merged-response", onHttpResponse);
});
