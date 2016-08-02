"use strict";

exports.main = function(options, callback) {
	require("./lib/tabsObserver");
	require("./lib/panelManager").PanelManager();
};
