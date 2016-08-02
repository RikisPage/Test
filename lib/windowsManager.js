"use strict";

const preferences = require("./preferencesManager");
const { has } = require("sdk/util/array");
const { viewFor } = require("sdk/view/core");
const { defer } = require("sdk/core/promise");
const Windows = require("sdk/windows").browserWindows;
const windowsUtils = require("sdk/window/utils");

let windowOpenedCallback;
const onWindowOpened = (callback) => windowOpenedCallback = callback;
exports.onWindowOpened = onWindowOpened;

let windowClosedCallback;
const onWindowClosed = (callback) => windowClosedCallback = callback;
exports.onWindowClosed = onWindowClosed;

const domWindow = window => viewFor(window);

const extendWindow = (window) => {

	if (Object.prototype.hasOwnProperty.call(window, "extended")) return;

	Object.defineProperties(window, {
		"extended": {
			value: true
		},
		"closedOrClosing": {
			get: function() {
				const _domWindow = domWindow(this);
				return (_domWindow && !_domWindow.closed) ? false : true;
			}
		},
		"openedTabs": {
			get: function() {
				if (preferences.ignoreTabsFromOtherGroups() && domWindow(this).TabView && domWindow(this).TabView.getContentWindow()) {
					const contentWindow = domWindow(this).TabView.getContentWindow();
					const xulTabs = contentWindow.GroupItems.getActiveGroupItem().getChildren().map(item => item.tab);
					return Array.from(this.tabs).filter(tab => has(xulTabs, tab.xulTab));
				}
				else {
					return Array.from(this.tabs);
				}
			}
		},
		"tabBrowser": {
			get: function() {
				const _domWindow = domWindow(this);
				return _domWindow.gBrowser || _domWindow.getBrowser();
			}
		}
	});

	window.addTabsProgressListener = function(listener) {
		this.tabBrowser.addTabsProgressListener(listener);
	};

	window.removeTabsProgressListener = function(listener) {
		this.tabBrowser.removeTabsProgressListener(listener);
	};

};

for (let window of Windows) {
	extendWindow(window);
}

Windows.on("open", window => {
	extendWindow(window)
	if (windowOpenedCallback) windowOpenedCallback(window);
});

Windows.on("close", window => {
	if (windowClosedCallback) windowClosedCallback(window);
});

module.exports.Windows = Windows;
