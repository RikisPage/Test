"use strict";

self.port.on("set-preferences", setPreferences);

self.port.on("get-panel-size", setPanelSize);

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

$(".list-group").on("click", ".list-group-item", function(e) {
	self.port.emit("activate-tab", this.id);
});

$("#closeDuplicateTabs").on("click", function(e) {
	if (!$(this).hasClass("disabled")) {
		self.port.emit("close-duplicate-tabs");
		self.port.emit("hide-panel");
	}
});

$(".panel-heading span.clickable").on("click", function (e) {
	$(this).parents(".panel").find(".panel-body").slideToggle(0, "linear", setPanelSize);
	$(this).find("i").toggleClass("glyphicon-chevron-down glyphicon-chevron-up");
});

function changeAutoCloseOptionState(state) {
	$("#onRemainingTabGroup").toggleClass("hidden", state !== "A");
	$("#priorityTabGroup").toggleClass("hidden", state !== "A");
	setPanelSize();
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
	$("#duplicateTabs").has("a").length ? showDuplicateTabsPanel() : hideDuplicateTabsPanel();
}

function setPanelUpdateMode() {
	$("#duplicateTabs").has("a").length ? showDuplicateTabsPanel() : hideDuplicateTabsPanel();
}

function showOptionPanel() {
	const optionGlyphicon = $("#panel-options").parents(".panel").find("i");
	if (optionGlyphicon.hasClass("glyphicon-chevron-down")) {
		$("#panel-options").slideDown(0, "linear", setPanelSize);
		optionGlyphicon.toggleClass("glyphicon-chevron-down glyphicon-chevron-up");
	}
}

function hideOptionPanel() {
	const optionGlyphicon = $("#panel-options").parents(".panel").find("i");
	if (optionGlyphicon.hasClass("glyphicon-chevron-up")) {
		$("#panel-options").slideUp(0, "linear", setPanelSize);
		optionGlyphicon.toggleClass("glyphicon-chevron-up glyphicon-chevron-down");
	}
}

function showDuplicateTabsPanel() {
	const duplicateTabsGlyphicon = $("#panel-duplicateTabs").parents(".panel").find("i");
	if (duplicateTabsGlyphicon.hasClass("glyphicon-chevron-down")) {
		$("#panel-duplicateTabs").slideDown(0, "linear", setPanelSize);
		duplicateTabsGlyphicon.toggleClass("glyphicon-chevron-down glyphicon-chevron-up");
	}
}

function hideDuplicateTabsPanel() {
	const duplicateTabsGlyphicon = $("#panel-duplicateTabs").parents(".panel").find("i");
	if (duplicateTabsGlyphicon.hasClass("glyphicon-chevron-up")) {
		$("#panel-duplicateTabs").slideUp(0, "linear", setPanelSize);
		duplicateTabsGlyphicon.toggleClass("glyphicon-chevron-up glyphicon-chevron-down");
	}
}

function setButtonState(action) {
	$("#closeDuplicateTabs").toggleClass("disabled", action === "disable");
}

function setPanelSize() {
	self.port.emit("resize-panel", {width: document.body.scrollWidth, height: document.body.scrollHeight});
}

function clearDuplicateTabs() {
	$("#duplicateTabs").empty();
}

function addDuplicateTab(tab) {
	const icon = tab.icon || "../images/default-favicon.png";
	$("#duplicateTabs").append("<a href='#' class='list-group-item' id='" + tab.id + "' groupId='" + tab.groupId + "'> <img src=" + icon + ">" + tab.title + "</a>");
}
