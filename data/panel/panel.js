"use strict";

self.port.on("set-preferences", setPreferences);

self.port.on("get-panel-size", resizePanel);

self.port.on("set-button-state", setButtonState);

self.port.on("set-panel-notify-mode", setPanelNotifyTabMode);
self.port.on("set-panel-update-mode", setPanelUpdateMode);
self.port.on("set-panel-default-mode", setPanelDefaultMode);

self.port.on("clear-duplicate-tabs-list", clearDuplicateTabs);

self.port.on("set-duplicate-tabs-list", addDuplicateTab);

$("#panel-options input:checkbox").on("change", function() {
	self.port.emit("update-preference", {name: this.id,	value: this.checked});
});

$("#panel-options select").on("change", function() {
	self.port.emit("update-preference", {name: this.id,	value: this.value});
	if (this.id === "onDuplicateTabDetected") changeAutoCloseOptionState(this.value);
});

$(".table-tabs").on("click", ".link-cell", function(e) {
	self.port.emit("activate-tab", $(this).parent().attr("tabId"));
});

$(".table-tabs").on("click", ".button-cell", function(e) {
	e.stopPropagation();
	self.port.emit("close-tab", $(this).parent().attr("tabId"));
});

$("#closeDuplicateTabs").on("click", function(e) {
	if (!$(this).hasClass("disabled")) {
		self.port.emit("close-duplicate-tabs");
		self.port.emit("hide-panel");
	}
});

$(".clickable-span").on("click", function (e) {
	$(this).parents(".panel").find(".panel-body").slideToggle(0, "linear", resizePanel);
	$(this).find("i").toggleClass("glyphicon-chevron-down glyphicon-chevron-up");
});

function changeAutoCloseOptionState(state) {
	$("#onRemainingTabGroup").toggleClass("hidden", state !== "A");
	$("#priorityTabGroup").toggleClass("hidden", state !== "A");
	resizePanel();
}

function setPreferences(preferences) {
	preferences.forEach(preference => {
		if (preference.type === "checkbox") {
			$("#" + preference.name).prop("checked", preference.value);
		}
		else {
			$("#" + preference.name + " option[value='" + preference.value + "']").prop("selected", true);
			if (preference.name === "onDuplicateTabDetected") changeAutoCloseOptionState(preference.value);
		}
	});
}

function setPanelNotifyTabMode() {
	hideOptionPanel();
	showDuplicateTabsPanel();
}

function setPanelDefaultMode() {
	showOptionPanel();
	$("#duplicateTabs").has("tr").length ? showDuplicateTabsPanel() : hideDuplicateTabsPanel();
}

function setPanelUpdateMode() {
	$("#duplicateTabs").has("tr").length ? showDuplicateTabsPanel() : hideDuplicateTabsPanel();
}

function showOptionPanel() {
	const optionGlyphicon = $("#panel-options").parents(".panel").find("i");
	if (optionGlyphicon.hasClass("glyphicon-chevron-down")) {
		$("#panel-options").slideDown(0, "linear", resizePanel);
		optionGlyphicon.toggleClass("glyphicon-chevron-down glyphicon-chevron-up");
	}
}

function hideOptionPanel() {
	const optionGlyphicon = $("#panel-options").parents(".panel").find("i");
	if (optionGlyphicon.hasClass("glyphicon-chevron-up")) {
		$("#panel-options").slideUp(0, "linear", resizePanel);
		optionGlyphicon.toggleClass("glyphicon-chevron-up glyphicon-chevron-down");
	}
}

function showDuplicateTabsPanel() {
	const duplicateTabsGlyphicon = $("#panel-duplicateTabs").parents(".panel").find("i");
	if (duplicateTabsGlyphicon.hasClass("glyphicon-chevron-down")) {
		$("#panel-duplicateTabs").slideDown(0, "linear", resizePanel);
		duplicateTabsGlyphicon.toggleClass("glyphicon-chevron-down glyphicon-chevron-up");
	}
}

function hideDuplicateTabsPanel() {
	const duplicateTabsGlyphicon = $("#panel-duplicateTabs").parents(".panel").find("i");
	if (duplicateTabsGlyphicon.hasClass("glyphicon-chevron-up")) {
		$("#panel-duplicateTabs").slideUp(0, "linear", resizePanel);
		duplicateTabsGlyphicon.toggleClass("glyphicon-chevron-up glyphicon-chevron-down");
	}
}

function setButtonState(action) {
	$("#closeDuplicateTabs").toggleClass("disabled", action === "disable");
}

function resizePanel() {
	self.port.emit("resize-panel", {width: document.body.scrollWidth, height: document.body.scrollHeight});
}

function clearDuplicateTabs() {
	$("#duplicateTabs").empty();
}

function addDuplicateTab(tab) {
	const icon = tab.icon || "../images/default-favicon.png";
	$("#duplicateTabs").append("<tbody><tr tabId='" + tab.id + "' groupId='" + tab.groupId + "'><td class='link-cell'> <img src=" + icon + ">" + tab.title +"</td><td class='button-cell'><button type='button' class='close'>&times;</button></td></tr></tbody>");
}
