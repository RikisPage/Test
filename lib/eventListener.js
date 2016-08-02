"use strict";

const { Class } = require("sdk/core/heritage");
const { EventTarget } = require("sdk/event/target");
const { off, emit } = require("sdk/event/core");
const { setImmediate } = require("sdk/timers");
const { when: unload } = require("sdk/system/unload");

const EventListener = Class({
	initialize: function() {
		this.target = EventTarget();
		this.eventName = "defaultEvent";
		unload( _ => off(this.target));
	},
	onSignal: function(listenerFunction) {
		this.target.on(this.eventName, listenerFunction);
	},
	signal: function(message) {
		setImmediate(() => emit(this.target, this.eventName, message));
	}
});
exports.EventListener = EventListener;
