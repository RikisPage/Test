"use strict";

const { Class } = require("sdk/core/heritage");
const preferences  = require("./preferencesManager");
const { ToggleButton } = require("sdk/ui/button/toggle");
const { closeDuplicateTabs, getDuplicateTabs, getNbDuplicateTabs } = require("./duplicateTabManager");
const { activateTab } = require("./tabsManager");
const { onTabEvent } = require("./tabsObserver");
const { Panel } = require("sdk/panel");
const { when: unload } = require("sdk/system/unload");
const data = require("sdk/self").data;
const icon_enabled = data.url("images/tab_enable.png");
const icon_disabled = data.url("images/tab_disable.png");
const Windows = require("./windowsManager").Windows;

const PanelManager = Class({
	initialize: function initialize() {

		this.panelMode;

		this.button = new ToggleButton({
			id: "close-duplicate-tabs-btn",
			label: "-.-",
			icon: preferences.autoCloseTab() ? icon_enabled : icon_disabled,
			onChange: state => {
				if (state.checked) {
					this._updatePanel("click");
				}
			},
			badge: 0,
			badgeColor: "rgba(30, 144, 255, 0.6)"
		});

		this.panel = new Panel({
			contentURL: data.url("panel/panel.html"),
			contentScriptFile: [data.url("jquery/jquery-2.1.4.min.js"), data.url("panel/panel.js")],
			onHide: () => {
				this.button.state("window", {checked: false, badge: this.button.state("window").badge, label: this.button.state("window").label});
			}
		});

		preferences.onDuplicateTabDetectedChange(() => this._setIcon());
		preferences.ignoreHashPartChange(() => this._refreshAll());
		preferences.ignoreSearchPartChange(() => this._refreshAll());
		preferences.ignoreTabsFromOtherGroupsChange(() => this._refreshAll());

		this.panel.port.on("resize-panel", size => this.panel.resize(size.width, size.height));
		this.panel.port.on("hide-panel", () => this.panel.hide());
		this.panel.port.on("update-preference", preference => preferences.set(preference.name, preference.value));
		this.panel.port.on("activate-tab", index => activateTab(index));
		this.panel.port.on("close-duplicate-tabs", () => closeDuplicateTabs(Windows.activeWindow));

		onTabEvent(window => this._refresh(window));

		this._refreshAll();
	},
	_setIcon: function() {
		this.button.icon = preferences.autoCloseTab() ? icon_enabled : icon_disabled;
	},
	_updatePanel: function(reason) {

		const worker = (result) => {

			if (!this.panel.isShowing && reason !== "click" && (!preferences.showPanel() || (preferences.showPanel() && result.nbDuplicateTabs <= this.button.state("window").badge))) {
				var lbl = "";
				if (result.nbDuplicateTabs === 0 ) 
					 lbl = "No dublicate tabs."
				else {
					lbl = "  Dublicate tabs:\r\n";	
				  result.duplicateTabs.forEach(tab => lbl = lbl +'\r\n' + tab.title);
				}
				this.button.label = lbl;
				this.button.state("window", {badge: result.nbDuplicateTabs, label: lbl});
			}
			else if (this.panel.isShowing && this.panelMode === "notify" && result.nbDuplicateTabs === 0) {
				this.panel.hide();
				var lbl = "";
				if (result.nbDuplicateTabs === 0 ) 
					 lbl = "No dublicate tabs."
				else {
					lbl = "  Dublicate tabs:\r\n";	
				  result.duplicateTabs.forEach(tab => lbl = lbl +'\r\n' + tab.title);
				}
				this.button.label = lbl;
				this.button.state("window", {badge: result.nbDuplicateTabs, label: lbl});
			}
			else {
				this.panel.port.emit("clear-duplicate-tabs-list");

				if (result.nbDuplicateTabs === 0 ) {
					this.panel.port.emit("set-button-state", "disable");
				}
				else {
					this.panel.port.emit("set-button-state", "activate");
					result.duplicateTabs.forEach(tab => this.panel.port.emit("set-duplicate-tabs-list", tab));
				}

				if (this.panel.isShowing) {
					this.panel.port.emit("get-panel-size");
					this.panel.port.emit("set-panel-update-mode");
				}
				else {
					this.panel.port.emit("set-preferences", preferences.getAll());

					if (reason === "click") {
						this.panel.port.emit("set-panel-default-mode");
						this.panelMode = "user";
					}
					else {
						this.panel.port.emit("set-panel-notify-mode");
						this.panelMode = "notify";
					}

					this.panel.port.emit("get-panel-size");
					this.panel.show({position: this.button});
				}

				this.button.state("window", {checked: true, badge: result.nbDuplicateTabs});
			}
		};

		getDuplicateTabs(Windows.activeWindow).then(result => worker(result), error => console.log(error));
	},
	_refresh: function(window) {

		if (window && !window.closedOrClosing) {
			if (window == Windows.activeWindow) {
				this._updatePanel();
			}
			else {
				const result = getDuplicateTabs(window);
				var lbl = "";
				if (result.nbDuplicateTabs === 0 ) 
					 lbl = "No dublicate tabs."
				else {
					lbl = "  Dublicate tabs:\r\n";	
				  result.duplicateTabs.forEach(tab => lbl = lbl +'\r\n' + tab.title);
				}
				this.button.label = lbl;
				this.button.state(window, {badge: result.nbDuplicateTabs, label: lbl});
				
				/*getDuplicateTabs
				const nbDuplicateTabs = getNbDuplicateTabs(window);
				this.button.state(window, {badge: nbDuplicateTabs});*/
			}
		}
	},
	_refreshAll: function() {
		for (let window of Windows) {
			this._refresh(window);
		}
	}
});
exports.PanelManager = PanelManager;
