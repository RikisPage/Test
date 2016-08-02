"use strict";

const { Ci, Cu } = require("chrome");
const { getBrowserForTab, getTabForContentWindow } = require("sdk/tabs/utils");
const { viewFor } = require("sdk/view/core");
const { modelFor } = require("sdk/model/core");
const Tabs = require("sdk/tabs");
const WindowsManager = require("./windowsManager");
const { when: unload } = require("sdk/system/unload");
const utils = require("./utils");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

//Tab events callback

let tabOpenedCallback;
const onTabOpened = (callback) => tabOpenedCallback = callback;
exports.onTabOpened = onTabOpened;

let tabShownCallback;
const onTabShown = (callback) => tabShownCallback = callback;
exports.onTabShown = onTabShown;

let tabActivatedCallback;
const onTabActivated = (callback) => tabActivatedCallback = callback;
exports.onTabActivated = onTabActivated;

let tabClosedCallback;
const onTabClosed = (callback) => tabClosedCallback = callback;
exports.onTabClosed = onTabClosed;

let tabUrlLocationChangedCallBack;
const onTabUrlLocationChanged = (callback) => tabUrlLocationChangedCallBack = callback;
exports.onTabUrlLocationChanged = onTabUrlLocationChanged;

let tabRequestStoppedCallBack;
const onTabRequestStopped = (callback) => tabRequestStoppedCallBack = callback;
exports.onTabRequestStopped = onTabRequestStopped;

const xulTab = tab => viewFor(tab);
const browser = tab => getBrowserForTab(xulTab(tab));

const progressListener = {
	QueryInterface: XPCOMUtils.generateQI([Ci.nsIWebProgressListener, Ci.nsISupportsWeakReference]),
	onStateChange: function(webProgress, request, flags, status) {
		try {
			if ((flags & Ci.nsIWebProgressListener.STATE_STOP) && (flags & Ci.nsIWebProgressListener.STATE_IS_NETWORK) && (flags & Ci.nsIWebProgressListener.STATE_IS_WINDOW)) {
				if (request.URI && status !== 0) {

					const tab = getTabForWindow(webProgress.DOMWindow);

					if (tab) {

						if (tab.stopping) {
							tab.stopping = false;
						}
						else {
							tab.loadingURL = request.URI.spec;
							if (tabRequestStoppedCallBack) tabRequestStoppedCallBack(tab);
						}

					}
				}
			}
		}
		catch (e) {}
	},
	onLocationChange: function(webProgress, request, URI, flags) {
		try {
			if (flags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT) {

				const tab = getTabForWindow(webProgress.DOMWindow);
				if (tab && (tab._previousLocationURL !== URI.spec)) {
					if (tabUrlLocationChangedCallBack) tabUrlLocationChangedCallBack(tab);
					tab._previousLocationURL = URI.spec;
				}
			}
		}
		catch (e) {}
	}
};

const extendTab = (tab) => {

	if (Object.prototype.hasOwnProperty.call(tab, "extended")) return;

	// Add properties

	Object.defineProperties(tab, {
		"extended": {
			value: true
		},
		"closedOrClosing": {
			get: function() {
				try {

					let _xulTab = xulTab(this);

					if (!_xulTab || !_xulTab.parentNode || _xulTab.closing) {
						return true;
					}

					let _browser = getBrowserForTab(_xulTab);

					if (!_browser || !_browser.docShell || !_browser.contentDocument) {
						return true;
					}

				}
				catch (e) {}

				return false;
			}
		},
		"active": {
			get: function() {
				return Tabs.activeTab === this;
			}
		},
		"browser": {
			get: function() {
				return browser(this);
			}
		},
		"stopping": {
			value: false,
			writable: true
		},
		"loading": {
			get: function() {
				return this.loadingURL ? true : false;
			}
		},
		"opening": {
			value: false,
			writable: true
		},
		"pending": {
			get: function() {
				return xulTab(this).hasAttribute("pending");
			}
		},
		"complete": {
			get: function() {
				return this.readyState === "complete";
			}
		},
		"uninitialized": {
			get: function() {
				return this.readyState === "uninitialized";
			}
		},
		"loadingURL": {
			value: "",
			writable: true
		},
		"currentURL": {
			get: function() {
				// tab is loading.
				if (this.loadingURL) return this.loadingURL;

				// tab is uninitialized.
				if (this.uninitialized) return null;

				// tab is ready.
				return this.url;
			}
		},
		"_previousLocationURL": {
			value: tab.url,
			writable: true
		},
		"xulTab": {
			get: function() {
				return xulTab(this);
			}
		},
		"referenceWindow": {
			value: tab.window,
			writable: true
		}
	});

	// Add methods

	tab.stopAndClose = function() {
		this.stopping = true;
		browser(this).stop();
		this.close();
	};

	tab.move = function(index) {
		this.index = index;
	};

	try {
		browser(tab).addProgressListener(progressListener);
	}
	catch (e) {}

};

Tabs.on("open", (tab) => {
	if (tab.window) {
		extendTab(tab);
		tab.opening = true;
		if (tabOpenedCallback) tabOpenedCallback(tab);
	}
});

Tabs.on("pageshow", (tab) => {
	extendTab(tab);
	if (tabShownCallback) tabShownCallback(tab);
});

Tabs.on("activate", (tab) => {
	extendTab(tab);
	if (tabActivatedCallback) tabActivatedCallback(tab);
});

Tabs.on("close", (tab) => {
	try {
		browser(tab).removeProgressListener(progressListener);
	}
	catch (e) {}

	if (tabClosedCallback) tabClosedCallback(tab);
});

const activateTab = tabId => {

	const currentTabs = WindowsManager.Windows.activeWindow.tabs;

	for (let tab of currentTabs) {
		if (tab.id === tabId) {
			tab.activate();
			break;
		}
	}
};
exports.activateTab = activateTab;

const closeTab = tabId => {

	const currentTabs = WindowsManager.Windows.activeWindow.tabs;

	for (let tab of currentTabs) {
		if (tab.id === tabId) {
			tab.stopAndClose();
			break;
		}
	}
};
exports.closeTab = closeTab;

const getTabForHttpChannel = httpChannel => {

	let loadContext = null;

	try {
		if (httpChannel.notificationCallbacks) {
			loadContext = httpChannel.notificationCallbacks.getInterface(Ci.nsILoadContext);
		}
	}
	catch (e) {
		try {
			if (httpChannel.loadGroup && httpChannel.loadGroup.notificationCallbacks) {
				loadContext = httpChannel.loadGroup.notificationCallbacks.getInterface(Ci.nsILoadContext);
			}
		}
		catch (e) {}
	}

	if (loadContext) {
		try {
			return getTabForWindow(loadContext.associatedWindow);
		}
		catch (e) {}

		return null;
	}
};
exports.getTabForHttpChannel = getTabForHttpChannel;

const getTabForWindow = window => {

	try {
		if (window && (window === window.top) && !window.frameElement) {
			const _xulTab = getTabForContentWindow(window);
			if (_xulTab) return modelFor(_xulTab);
		}
	}
	catch (e) {}

	return null;
};

for (let tab of Tabs) {
	extendTab(tab);
}

unload( _ => {
	for (let tab of Tabs) {
		try {
			browser(tab).removeProgressListener(progressListener);
		}
		catch (e) {}
	}
});
