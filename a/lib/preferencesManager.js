"use strict";

const preferences = require("sdk/simple-prefs");
const { when: unload } = require("sdk/system/unload");

const setPreferenceEvent = (eventName, listener) => {
	preferences.on(eventName, listener);
	unload( _ => preferences.removeListener(eventName, listener));
};

const onDuplicateTabDetectedChange = (listener) => {
	setPreferenceEvent("onDuplicateTabDetected", listener);
};
exports.onDuplicateTabDetectedChange = onDuplicateTabDetectedChange;

const ignoreHashPartChange = (listener) => {
	setPreferenceEvent("ignoreHashPart", listener);
};
exports.ignoreHashPartChange = ignoreHashPartChange;

const ignoreSearchPartChange = (listener) => {
	setPreferenceEvent("ignoreSearchPart", listener);
};
exports.ignoreSearchPartChange = ignoreSearchPartChange;

const ignoreTabsFromOtherGroupsChange = (listener) => {
	setPreferenceEvent("ignoreTabsFromOtherGroups", listener);
};
exports.ignoreTabsFromOtherGroupsChange = ignoreTabsFromOtherGroupsChange;

const getAll = () => {
	return [
		{name: "onDuplicateTabDetected", value: preferences.prefs.onDuplicateTabDetected, type: "combobox"},
		{name: "onRemainingTab", value: preferences.prefs.onRemainingTab, type: "combobox"},
		{name: "keepTabBasedOnAge", value: preferences.prefs.keepTabBasedOnAge, type: "combobox"},
		{name: "keepTabWithHistory", value: preferences.prefs.keepTabWithHistory, type: "checkbox"},
		{name: "ignoreHashPart", value: preferences.prefs.ignoreHashPart, type: "checkbox"},
		{name: "ignoreSearchPart", value: preferences.prefs.ignoreSearchPart, type: "checkbox"},
		{name: "ignoreTabsFromOtherGroups", value: preferences.prefs.ignoreTabsFromOtherGroups, type: "checkbox"}
	];
};
exports.getAll = getAll;

const get = (name) => preferences.prefs[name];
exports.get = get;

const set = (name, value) => preferences.prefs[name] = value;
exports.set = set;

const autoCloseTab = () => preferences.prefs.onDuplicateTabDetected === "A";
exports.autoCloseTab = autoCloseTab;

const showPanel = () => preferences.prefs.onDuplicateTabDetected === "S";
exports.showPanel = showPanel;

const applyNewTabBehavior = () => preferences.prefs.onRemainingTab === "B";
exports.applyNewTabBehavior = applyNewTabBehavior;

const activateTab = () => preferences.prefs.onRemainingTab === "A";
exports.activateTab = activateTab;

const keepNewerTab = () => preferences.prefs.keepTabBasedOnAge === "N";
exports.keepNewerTab = keepNewerTab;

const keepTabWithHistory = () => preferences.prefs.keepTabWithHistory;
exports.keepTabWithHistory = keepTabWithHistory;

const ignoreHashPart = () => preferences.prefs.ignoreHashPart;
exports.ignoreHashPart = ignoreHashPart;

const ignoreSearchPart = () => preferences.prefs.ignoreSearchPart;
exports.ignoreSearchPart = ignoreSearchPart;

const ignoreTabsFromOtherGroups = () => preferences.prefs.ignoreTabsFromOtherGroups;
exports.ignoreTabsFromOtherGroups = ignoreTabsFromOtherGroups;
