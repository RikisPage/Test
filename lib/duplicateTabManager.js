"use strict";

const preferences = require("./preferencesManager");
const { matchingURL } = require("./urlUtils");
const { add, remove } = require("sdk/util/array");
const { getFavicon } = require("sdk/places/favicon");
const { all } = require("sdk/core/promise");

const closeMatchingTabs = (observedTab) => {

	const window = observedTab.window;

	if (!window) return;

	const openedTabs = window.openedTabs;

	let observedTabURL = observedTab.currentURL;

	if (!observedTabURL) return;

	observedTabURL = matchingURL(observedTabURL);

	for (let openedTab of openedTabs) {

		if (openedTab.id === observedTab.id) continue;

		if (!openedTab.loaded && !observedTab.loaded) continue;

		const openedTabURL = openedTab.currentURL;

		if (openedTabURL && (matchingURL(openedTabURL) === observedTabURL)) {

			const closeObservedTab = !(preferences.keepNewerTab() || (observedTab.loaded && !openedTab.loaded));
			const tabToClose = closeObservedTab ? observedTab : openedTab;
			const tabToSet = closeObservedTab ? openedTab : observedTab;

			if (keepIfHistory(tabToClose, tabToSet)) {
				tabToSet.stopAndClose();
				if (!closeObservedTab) break;
			}
			else {
				const tabToSetIndex = tabToSet.index;
				const tabToCloseActive = tabToClose.active;
				const tabToCloseIndex = tabToClose.index;

				tabToClose.stopAndClose();

				if (preferences.applyNewTabBehavior()) {
					if (tabToCloseIndex > 0 && window.openedTabs.length > 2 && tabToCloseIndex !== tabToSetIndex + 1) tabToSet.move(tabToCloseIndex);
					if (tabToCloseActive) tabToSet.activate();
				}
				else if (preferences.activateTab()) {
					tabToSet.activate();
				}

				if (closeObservedTab) break;
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
	let duplicateTabs = [];
	let tabUrls = [];

	const openedTabs = window.openedTabs;

	if (!window.openedTabs) return;

	for (let openedTab of openedTabs) {

		if ((openedTab.url === "about:blank") && openedTab.busy) {
			tabUrls.push("");
			continue;
		}

		let openedTabURL = openedTab.currentURL;
		if (!openedTabURL) {
			tabUrls.push("");
			continue;
		}

		openedTabURL = matchingURL(openedTabURL);

		const index = tabUrls.indexOf(openedTabURL);
		if (index === -1 ) {
			openedTab.loaded ? tabUrls.push(openedTabURL) : tabUrls.push("");
			continue;
		}

		const matchingTab = openedTabs[index];

		if (reason === "close-duplicate-tabs") {
			if (openedTab.active) {
				matchingTab.stopAndClose();
				tabUrls[index] = "";
				tabUrls.push(openedTabURL);
			}
			else {
				openedTab.stopAndClose();
				tabUrls.push("");
			}
		}
		else {
			if (reason === "get-duplicate-tabs"){
				tabUrls.push("");
				if (!findTab(matchingTab, duplicateTabs)) duplicateTabs.push({id: matchingTab.id, url: matchingTab.url, title: matchingTab.title, groupId: matchingTab.index});
				duplicateTabs.push({id: openedTab.id, url: openedTab.url, title: openedTab.title, groupId: matchingTab.index});
			}

			nbDuplicateTabs++;
		}
	}

	if (reason === "get-duplicate-tabs") {

		const getTabInfo = (duplicateTab) => getFavicon(duplicateTab.url).then(favicon => duplicateTab.icon = favicon, _ => duplicateTab.icon = null);

		duplicateTabs.sort((a, b) => (a.groupId < b.groupId) ? -1 : (a.groupId > b.groupId) ? 1 : 0);

		return all(duplicateTabs.map(duplicateTab => getTabInfo(duplicateTab))).then(result => {
			return {nbDuplicateTabs: nbDuplicateTabs, duplicateTabs: duplicateTabs};
		});

	}
	else if (reason === "get-duplicate-tabs-length") {
		return nbDuplicateTabs;
	}
};

const findTab = (tab, duplicateTabs) => {

	for (let duplicateTab of duplicateTabs) {
		if (duplicateTab.id === tab.id) {
			return true;
		}
	}

	return false;
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
