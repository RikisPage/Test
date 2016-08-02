"use strict";

const { Class } = require("sdk/core/heritage");
const { EventTarget } = require("sdk/event/target");
const { emit, off, count } = require("sdk/event/core");
const { setImmediate, setInterval, clearInterval } = require("sdk/timers");
const { defer } = require("sdk/core/promise");
const { when: unload } = require("sdk/system/unload");

const EventTimer = Class({
	initialize: function() {
		this.event = EventTarget();
		unload( _ => off(this.event));
	},
	signal: function(eventId) {
		if (count(this.event, eventId) !== 0) emit(this.event, eventId);
	},
	onSignal: function(eventId, worker, breaker, resolver) {
		let { promise, resolve } = defer();

		const timerId = setInterval(() => {

			if (breaker()) {
				stop();
			}
			else if (resolver()) {
				stop();
				resolve();
			}

		}, 100);

		const stop = () => {
			clearInterval(timerId);
			this.event.off(eventId);
		};

		this.event.once(eventId, _ => {
			clearInterval(timerId);
			worker();
		});

		return promise;
	}
});
exports.EventTimer = EventTimer;
