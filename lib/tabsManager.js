"use strict";

const { Ci, Cu, components } = require("chrome");
const { getBrowserForTab, getTabForContentWindow, getTabForBrowser } = require("sdk/tabs/utils");
const { viewFor } = require("sdk/view/core");
const { modelFor } = require("sdk/model/core");
const Tabs = require("sdk/tabs");
const WindowsManager = require("./windowsManager");
const { areEqualURL } = require("./urlUtils");
const { when: unload } = require("sdk/system/unload");
const utils = require("./utils");

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

const xulTab = tab => viewFor(tab);
const browser = tab => getBrowserForTab(xulTab(tab));

const tabsProgressListener = {
	onStateChange: function(browser, webProgress, request, flags, status) {
		try {

			if ((flags & Ci.nsIWebProgressListener.STATE_STOP) && (flags & Ci.nsIWebProgressListener.STATE_IS_NETWORK) && (flags & Ci.nsIWebProgressListener.STATE_IS_WINDOW)) {

				if (!isTopWindow(webProgress.DOMWindow)) return;

				const tab = modelFor(getTabForBrowser(browser));

				if (tab) tab.loadingURL = "";

			}
		}
		catch (e) {}
	},
	onLocationChange: function(browser, webProgress, request, URI, flags) {

		try {
			if (flags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT) {

				if (!isTopWindow(webProgress.DOMWindow)) return;

				const tab = modelFor(getTabForBrowser(browser));

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
		"browser": {
			get: function() {
				return browser(this);
			}
		},
		"xulTab": {
			get: function() {
				return xulTab(this);
			}
		},
		"busy": {
			get: function() {
				return this.xulTab.hasAttribute("busy");
			}
		},
		"pending": {
			get: function() {
				return this.xulTab.hasAttribute("pending");
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
		"loaded": {
			get: function() {
				return !this.loadingURL && !this.busy && (this.readyState === "complete" || this.readyState === "interactive");
			}
		},
		"closedOrClosing": {
			get: function() {
				try {

					let _xulTab = this.xulTab;

					if (!_xulTab || !_xulTab.parentNode || _xulTab.closing || !this.browser) {
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
		"loadingURL": {
			value: "",
			writable: true
		},
		"currentURL": {
			get: function() {

				if (this.loadingURL) return this.loadingURL;

				if (this.pending) return this.url;

				if (this.uninitialized) return null;

				return this.url;
			}
		},
		"_previousLocationURL": {
			value: tab.url,
			writable: true
		},
		"referenceWindow": {
			value: tab.window,
			writable: true
		}
	});

	// Add methods

	tab.stopAndClose = function() {
		this.browser.stop();
		this.close();
	};

	tab.move = function(index) {
		this.index = index;
	};

};

Tabs.on("open", (tab) => {
	if (tab.window) {
		extendTab(tab);
		if (tabOpenedCallback && tab.complete) tabOpenedCallback(tab);
	}
});

Tabs.on("pageshow", (tab) => {
	if (tab.window && !tab.uninitialized && tab.url) {
		extendTab(tab);
		if (tabShownCallback) tabShownCallback(tab);
	}
});

Tabs.on("activate", tab => {
	if (tab.window && !tab.uninitialized) {
		extendTab(tab);
		if (tabActivatedCallback) tabActivatedCallback(tab);
	}
});

Tabs.on("close", (tab) => {
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
		catch (e) {
		}
	}

	if (loadContext) {
		try {
			if (loadContext.associatedWindow) {
				return getTabForWindow(loadContext.associatedWindow);
			}
		}
		catch (e) {}

		try {
			if (loadContext.topFrameElement) {
				return modelFor(getTabForBrowser(loadContext.topFrameElement));
			}
		}
		catch (e) {}
	}

	return null;
};
exports.getTabForHttpChannel = getTabForHttpChannel;

const isTopWindow = window => (window && (window === window.top) && !window.frameElement);

const getTabForWindow = window => {

	try {
		if (isTopWindow(window)) {
			return modelFor(getTabForContentWindow(window));
		}
	}
	catch (e) {}

	return null;
};

for (let window of WindowsManager.Windows) {
	window.addTabsProgressListener(tabsProgressListener);
}

WindowsManager.onWindowOpened(window => {
	try {
		window.addTabsProgressListener(tabsProgressListener);
	}
	catch (e) {}
});

WindowsManager.onWindowClosed(window => {
	try {
		window.removeTabsProgressListener(tabsProgressListener);
	}
	catch (e) {}
});

for (let tab of Tabs) {
	if (tab.window) extendTab(tab);
	extendTab(tab);
}

unload( _ => {
	for (let window of WindowsManager.Windows) {
		try {
			window.removeTabsProgressListener(tabsProgressListener);
		}
		catch (e) {}
	}
});
