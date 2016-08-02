"use strict";

const preferences = require("./preferencesManager");
const { getURLMatchPattern } = require("./urlUtils");
const { add, remove } = require("sdk/util/array");
const { getFavicon } = require("sdk/places/favicon");
const { all } = require("sdk/core/promise");

const closeMatchingTabs = (newTab) => {

	if (newTab.closedOrClosing) return;

	const window = newTab.window;
	const openedTabs = window.openedTabs;

	const patternURL = getURLMatchPattern(newTab.currentURL);

	for (let openedTab of openedTabs) {

		if (openedTab.id === newTab.id) continue;

		if (openedTab.loading && newTab.loading) continue;

		const openedTabURL = openedTab.currentURL;

		if (openedTabURL && patternURL.test(openedTabURL)) {

			const closeNewTab = !(preferences.keepNewerTab() || (!newTab.loading && openedTab.loading));
			const tabToClose = closeNewTab ? newTab : openedTab;
			const tabToSet = closeNewTab ? openedTab : newTab;

			if (keepIfHistory(tabToClose, tabToSet)) {
				tabToSet.stopAndClose();
				if (!closenewTab) break;
			}
			else {
				const tabToSetIndex = tabToSet.index;
				const tabToCloseActive = tabToClose.active;
				const tabToCloseIndex = tabToClose.index;

				tabToClose.stopAndClose();

				const tabsLength = window.openedTabs.length;

				if (preferences.applyNewTabBehavior()){
					if (tabToCloseIndex > 0 && tabsLength > 2 && tabToCloseIndex !== tabToSetIndex + 1) tabToSet.move(tabToCloseIndex);
					if (tabToCloseActive) tabToSet.activate();
				}
				else if (preferences.activateTab()){
					tabToSet.activate();
				}

				if (closeNewTab) break;
			}
		}
	}
};
exports.closeMatchingTabs = closeMatchingTabs;

const closeDuplicateTabs = window => searchDuplicateTabs(window, "close-duplicate-tabs");
exports.closeDuplicateTabs = closeDuplicateTabs;

const getDuplicateTabs = window => searchDuplicateTabs(window, "get-duplicate-tabs");
exports.getDuplicateTabs = getDuplicateTabs;

const getNbDuplicateTabs = window => searchDuplicateTabs(window, "get-duplicate-tabs-length");
exports.getNbDuplicateTabs = getNbDuplicateTabs;

const searchDuplicateTabs = (window, reason) => {

	let nbDuplicateTabs = 0;
	let parsedTabs = [];
	let duplicateTabs = [];

	const openedTabs = window.openedTabs;

	for (let openedTab of openedTabs) {

		if (!openedTab.closedOrClosing) {

			const openedTabURL = openedTab.currentURL;

			if (openedTabURL) {

				const patternURL = getURLMatchPattern(openedTabURL);

				const openedTabMatch = parsedTabs.some(item => {

					const parsedTab = item.tab;
					const parsedTabURL = item.url;

					if (patternURL.test(parsedTabURL)) {

						if (reason === "close-duplicate-tabs") {
							if (openedTab.active) {
								remove(parsedTabs, item);
								add(parsedTabs, {url: openedTabURL,	tab: openedTab});
								parsedTab.stopAndClose();
							}
							else {
								openedTab.stopAndClose();
							}
						}
						else {
							if (reason === "get-duplicate-tabs"){
								if (!item.groupId) {
									item.groupId = parsedTab.index;
									add(duplicateTabs, {id: parsedTab.id, url: parsedTab.url, title: parsedTab.title, groupId: item.groupId});
								}

								add(duplicateTabs, {id: openedTab.id, url: openedTabURL, title: openedTab.title, groupId: item.groupId});
							}
							nbDuplicateTabs++;
						}
						return true;
					}
				});

				if (!openedTabMatch && !openedTab.loading) {
					add(parsedTabs, {url: openedTabURL,	tab: openedTab});
				}
			}
		}
	}

	if (reason === "get-duplicate-tabs") {

		duplicateTabs.sort((a, b) => (a.groupId < b.groupId) ? -1 : (a.groupId > b.groupId) ? 1 : 0);

		const getTabInfo = (duplicateTab) => getFavicon(duplicateTab.url).then(favicon => duplicateTab.icon = favicon, _ => duplicateTab.icon = "");

		return all(duplicateTabs.map(duplicateTab => getTabInfo(duplicateTab))).then(result => {
			return {nbDuplicateTabs: nbDuplicateTabs, duplicateTabs: duplicateTabs};
		}, error => console.log("get-duplicate-tabs: " + error));

	}
	else if (reason === "get-duplicate-tabs-length") {
		return nbDuplicateTabs;
	}
};

const keepIfHistory = (tabToClose, tabMatching) => {

	if (preferences.keepTabWithHistory()) {

		const browserToClose = tabToClose.browser;

		if (browserToClose.canGoForward || browserToClose.canGoBack) {

			let browserMatching = tabMatching.browser;

			if (browserMatching && !browserMatching.canGoForward && !browserMatching.canGoBack) {
				return true;
			}
		}
	}

	return false;
};
