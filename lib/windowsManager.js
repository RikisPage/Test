"use strict";

const preferences = require("./preferencesManager");
const { has } = require("sdk/util/array");
const { viewFor } = require("sdk/view/core");
const { defer } = require("sdk/core/promise");
const Windows = require("sdk/windows").browserWindows;

const domWindow = window => viewFor(window);

const extendWindow = (window) => {

	if (Object.prototype.hasOwnProperty.call(window, "extended")) return;

	Object.defineProperties(window, {
		"extended": {
			value: true,
			writable: false
		},
		"closedOrClosing": {
			get: function() {
				const _domWindow = domWindow(this);
				return (_domWindow && !_domWindow.closed) ? false : true;
			}
		},
		"openedTabs": {
			get: function() {
				if (preferences.ignoreTabsFromOtherGroups() && domWindow(this).TabView.getContentWindow()) {
					const contentWindow = domWindow(this).TabView.getContentWindow();
					const xulTabs = contentWindow.GroupItems.getActiveGroupItem().getChildren().map(item => item.tab);
					return Array.from(this.tabs).filter(tab => has(xulTabs, tab.xulTab));
				}
				else {
					return Array.from(this.tabs);
				}
			}
		}
	});

};

for (let window of Windows) {
	extendWindow(window);
}

Windows.on("open", window => extendWindow(window));

module.exports.Windows = Windows;
