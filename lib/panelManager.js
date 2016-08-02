"use strict";

const { Class } = require("sdk/core/heritage");
const preferences  = require("./preferencesManager");
const { ToggleButton } = require("sdk/ui/button/toggle");
const { closeDuplicateTabs, getDuplicateTabs, getNbDuplicateTabs } = require("./duplicateTabManager");
const { activateTab, closeTab } = require("./tabsManager");
const { onTabEvent } = require("./tabsObserver");
const { Panel } = require("sdk/panel");
const { when: unload } = require("sdk/system/unload");
const data = require("sdk/self").data;
const icon16_auto_close = data.url("images/auto_close_16.png");
const icon16_manual_close = data.url("images/manual_close_16.png");
const icon32_auto_close = data.url("images/auto_close_32.png");
const icon32_manual_close = data.url("images/manual_close_32.png");
const Windows = require("./windowsManager").Windows;


const PanelManager = Class({
	initialize: function initialize() {

		this.panelMode;

		this.button = new ToggleButton({
			id: "close-duplicate-tabs-btn",
			label: "Duplicate Tabs Closer",
			icon: preferences.autoCloseTab() ? icon16_auto_close : icon16_manual_close,
			onChange: state => {
				if (state.checked) {
					this._updatePanel("click");
				}
			},
			badge: 0,
			badgeColor: preferences.noDuplicateTabBadgeColor()
		});

		this.panel = new Panel({
			contentURL: data.url("panel/panel.html"),
			contentScriptFile: [data.url("../data/jquery/dist/jquery.min.js"), data.url("../data/bootstrap/dist/js/bootstrap.min.js"), data.url("panel/panel.js")],
			contentStyleFile: [data.url("../data/bootstrap/dist/css/bootstrap.min.css"), data.url("../data/bootstrap/dist/css/bootstrap-theme.min.css"), data.url("panel/panel.css")],
			onHide: () => {
				this._setButtonState("window", this.button.state("window").badge, false);
			}
		});

		this.panel.port.on("resize-panel", size => this.panel.resize(size.width, size.height));
		this.panel.port.on("hide-panel", () => this.panel.hide());
		this.panel.port.on("update-preference", preference => preferences.set(preference.name, preference.value));
		this.panel.port.on("activate-tab", index => activateTab(index));
		this.panel.port.on("close-tab", index => closeTab(index));
		this.panel.port.on("close-duplicate-tabs", () => closeDuplicateTabs(Windows.activeWindow));

		preferences.onDuplicateTabDetectedChange(() => this._setIcon());
		preferences.ignoreHashPartChange(() => this._refreshAll());
		preferences.ignoreSearchPartChange(() => this._refreshAll());
		preferences.ignorePathPartChange(() => this._refreshAll());
		preferences.ignoreTabsFromOtherGroupsChange(() => this._refreshAll());

		onTabEvent(window => this._refresh(window));

		this._setIcon();
		this._refreshAll();
	},
	_setIcon: function() {
		if (preferences.autoCloseTab()) {
			this.button.icon = {
				"16": icon16_auto_close,
				"32": icon32_auto_close
			};
		}
		else {
			this.button.icon = {
				"16": icon16_manual_close,
				"32": icon32_manual_close
			};
		}
	},
	_setButtonState: function(window, nbDuplicateTabs, checkState) {
		const badgeColor = nbDuplicateTabs > 0 ? preferences.duplicateTabBadgeColor() : preferences.noDuplicateTabBadgeColor();
		this.button.state(window, {checked: checkState, badge: nbDuplicateTabs, badgeColor: badgeColor});
	},
	_updatePanel: function(reason) {

		const worker = (result) => {
			if (!this.panel.isShowing && reason !== "click" && (!preferences.showPanel() || (preferences.showPanel() && result.nbDuplicateTabs <= this.button.state("window").badge))) {
				this._setButtonState("window", result.nbDuplicateTabs, false);
			}
			else if (this.panel.isShowing && this.panelMode === "notify" && result.nbDuplicateTabs === 0) {
				this.panel.hide();
				this._setButtonState("window", result.nbDuplicateTabs, false);
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

				this.panel.port.emit("get-panel-size");

				if (this.panel.isShowing) {
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

					this.panel.show({position: this.button});
				}

				this._setButtonState("window", result.nbDuplicateTabs, true);
			}

		};

		getDuplicateTabs(Windows.activeWindow).then(tabs => worker(tabs));
	},
	_refresh: function(window) {

		if (window && !window.closedOrClosing) {
			if (window == Windows.activeWindow) {
				this._updatePanel();
			}
			else {
				const nbDuplicateTabs = getNbDuplicateTabs(window);
				this._setButtonState(window, nbDuplicateTabs, false);
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
