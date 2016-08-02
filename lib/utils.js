"use strict"

const { Cr, Cc, Ci, Cu } = require("chrome");
// const tabUtils = require("./tabUtils");
// const windowUtils = require("./windowUtils")

const getContextInfoShort = (window) => {

	if (window) {

		if (window instanceof Ci.nsIDOMWindow) console.log("window instance of nsIDOMWindow"); else console.log("window not instance of nsIDOMWindow");
		window.opener ? console.log("window opener: true") : console.log("window opener: false");
		window.content ? console.log("window content: true") : console.log("window content: false");
		//if (window.content) console.log("window content == top: ") +  window.content === window.top;
		console.log("window location: " + window.location.href);
		console.log("window length: " + window.length);
		console.log("window name: " + window.name);
		console.log("window history length: " + window.history.length);
		console.log("window history state: " + window.history.state);
		console.log("window closed: " + window.closed);

		const document = window.document;
		if (document) {
			console.log("document location: " + document.location);
			console.log("document URL: " + document.URL);
			console.log("document documentURI: " + document.documentURI);
			console.log("document referrer: " + document.referrer);
			console.log("document title: " +  document.title);
			console.log("document head: " +  document.head);
			console.log("document origin: " +  document.origin);
			console.log("document state: " + document.readyState);
			console.log("document nodeName: " + document.nodeName);
			console.log("document nodePrincipal: " + document.nodePrincipal);
			console.log("document body: " + document.body);
			console.log("document doctype: " + document.doctype);
			console.log("document contentType: " + document.contentType);
			console.log("document currentScript: " +  document.currentScript);
			console.log("document documentElement: " + document.documentElement);
			console.log("document firstChild: " + document.firstChild);
			console.log("document lastModified: " + document.lastModified);
			if (document instanceof Ci.nsIDOMHTMLDocument) console.log("document instance of nsIDOMHTMLDocument"); else console.log("document not instance of nsIDOMHTMLDocument");
		}
	}
};
exports.getContextInfoShort = getContextInfoShort;

const getContextInfo = (eventType, window, document, tab) => {

	if (window) {
		window.opener ? console.log(eventType + " window has opener:" + window.opener) : console.log(eventType + " window has NO opener");
		window instanceof Ci.nsIDOMWindow ? console.log(eventType + " window instanceof Ci.nsIDOMWindow") : console.log(eventType + " window NOT instanceof Ci.nsIDOMWindow")
	}

	try {
		if (window) console.log(eventType + " window location: " + window.location.href);
	}
	catch (e) {	console.log(eventType + " window location: error");	}
	try {
		if (document) console.log(eventType + " document location: " + document.location);
	}
	catch (e) {console.log(eventType + " document location: error");	}
	try {
		if (document) console.log(eventType + " document URL: " + document.URL);
	}
	catch (e) {console.log(eventType + " document URL: error");	}
	try {
		if (document) console.log(eventType + " document documentURI: " + document.documentURI);
	}
	catch (e) {console.log(eventType + " document documentURI: error");	}
	// try {
	// if (tab) console.log(eventType + " tab URL: " + tabUtils.getTabURL(tab));
	// }
	// catch (e) {	}

	if (document) console.log(eventType + " document title: " +  document.title);
	// if (tab) console.log(eventType + " tab title: " + tabUtils.getTabTitle(tab));
	if (tab) console.log(eventType + " tab label: " + tab.label);
	if (tab) console.log(eventType + " tab readyState: " + tab.readyState);
	if (tab) console.log(eventType + " tab currentURL: " + tab.currentURL);
	// if (tab) console.log(eventType + " tab ID: " + tabUtils.getTabId(tab));
	// if (tab) console.log(eventType + " tab index: " + tabUtils.getTabIndex(tab));
	if (document) console.log("document referrer: " + document.referrer);
	if (document) console.log("document title: " +  document.title);
	if (document) console.log("document head: " +  document.head);
	if (document) console.log("document origin: " +  document.origin);
	if (document) console.log("document currentScript: " +  document.currentScript);
	if (document) console.log(eventType + " document state: " + document.readyState);
	if (document) console.log(eventType + " document nodeName: " + document.nodeName);
	if (document) console.log(eventType + " document nodePrincipal: " + document.nodePrincipal);
	if (document) console.log(eventType + " document body: " + document.body);
	if (document) console.log(eventType + " document documentElement: " + document.documentElement);
	if (document) console.log(eventType + " document firstChild: " + document.firstChild);
	if (document) console.log(eventType + " document lastModified: " + document.lastModified);
	if (document) document instanceof Ci.nsIDOMHTMLDocument ? console.log(eventType + " document instanceof Ci.nsIDOMHTMLDocument") : console.log(eventType + " document NOT instanceof Ci.nsIDOMHTMLDocument")

	if (document && document.documentURIObject && document.documentURIObject.scheme) {
		var scheme = document.documentURIObject.scheme;
		console.log(eventType + " document scheme: " + scheme);
	}
	else
	console.log(eventType + " document scheme: ");
};
exports.getContextInfo = getContextInfo;

const getStateFlagsInfo = (stateFlags) => {

	let state = "";

	if (stateFlags & Ci.nsIWebProgressListener.STATE_START)
	state = state + " - " + "STATE_START";

	if (stateFlags & Ci.nsIWebProgressListener.STATE_REDIRECTING)
	state = state + " - " + "STATE_REDIRECTING";

	if (stateFlags & Ci.nsIWebProgressListener.STATE_TRANSFERRING)
	state = state + " - " + "STATE_TRANSFERRING";

	if (stateFlags & Ci.nsIWebProgressListener.STATE_NEGOTIATING)
	state = state + " - " + "STATE_NEGOTIATING";

	if (stateFlags & Ci.nsIWebProgressListener.STATE_STOP)
	state = state + " - " + "STATE_STOP";

	if (stateFlags & Ci.nsIWebProgressListener.STATE_IS_REQUEST)
	state = state + " - " + "STATE_IS_REQUEST";

	if (stateFlags & Ci.nsIWebProgressListener.STATE_IS_DOCUMENT)
	state = state + " - " + "STATE_IS_DOCUMENT";

	if (stateFlags & Ci.nsIWebProgressListener.STATE_IS_NETWORK)
	state = state + " - " + "STATE_IS_NETWORK";

	if (stateFlags & Ci.nsIWebProgressListener.STATE_IS_WINDOW)
	state = state + " - " + "STATE_IS_WINDOW";

	if (stateFlags & Ci.nsIWebProgressListener.STATE_RESTORING)
	state = state + " - " + "STATE_RESTORING";

	if (stateFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT)
	state = state + " - " + "LOCATION_CHANGE_SAME_DOCUMENT";

	if (stateFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_ERROR_PAGE)
	state = state + " - " + "LOCATION_CHANGE_ERROR_PAGE";

	console.log("state flag: " + stateFlags)
	console.log("states: " + state);
};
exports.getStateFlagsInfo = getStateFlagsInfo;

const getChannelInfo = (httpChannel) => {

	let channelFlag = "";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_BACKGROUND)
	channelFlag = channelFlag + " - " + "LOAD_BACKGROUND";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_DOCUMENT_URI)
	channelFlag = channelFlag + " - " + "LOAD_DOCUMENT_URI";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_RETARGETED_DOCUMENT_URI)
	channelFlag = channelFlag + " - " + "LOAD_RETARGETED_DOCUMENT_URI";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_REPLACE)
	channelFlag = channelFlag + " - " + "LOAD_REPLACE";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_INITIAL_DOCUMENT_URI)
	channelFlag = channelFlag + " - " + "LOAD_INITIAL_DOCUMENT_URI";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_TARGETED)
	channelFlag = channelFlag + " - " + "LOAD_TARGETED";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_CALL_CONTENT_SNIFFERS)
	channelFlag = channelFlag + " - " + "LOAD_CALL_CONTENT_SNIFFERS";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_CLASSIFY_URI)
	channelFlag = channelFlag + " - " + "LOAD_CLASSIFY_URI";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_ANONYMOUS)
	channelFlag = channelFlag + " - " + "LOAD_ANONYMOUS";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_BYPASS_CACHE)
	channelFlag = channelFlag + " - " + "LOAD_BYPASS_CACHE";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_FROM_CACHE)
	channelFlag = channelFlag + " - " + "LOAD_FROM_CACHE";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_BYPASS_LOCAL_CACHE)
	channelFlag = channelFlag + " - " + "LOAD_BYPASS_LOCAL_CACHE";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_ONLY_FROM_CACHE)
	channelFlag = channelFlag + " - " + "LOAD_ONLY_FROM_CACHE";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_ONLY_IF_MODIFIED)
	channelFlag = channelFlag + " - " + "LOAD_ONLY_IF_MODIFIED";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_BYPASS_LOCAL_CACHE_IF_BUSY)
	channelFlag = channelFlag + " - " + "LOAD_BYPASS_LOCAL_CACHE_IF_BUSY";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_NORMAL)
	channelFlag = channelFlag + " - " + "LOAD_NORMAL";

	if (httpChannel.loadFlags & Ci.nsIChannel.INHIBIT_CACHING)
	channelFlag = channelFlag + " - " + "INHIBIT_CACHING";

	if (httpChannel.loadFlags & Ci.nsIChannel.INHIBIT_PERSISTENT_CACHING)
	channelFlag = channelFlag + " - " + "INHIBIT_PERSISTENT_CACHING";

	if (httpChannel.loadFlags & Ci.nsIChannel.INHIBIT_PIPELINE)
	channelFlag = channelFlag + " - " + "INHIBIT_PIPELINE";

	if (httpChannel.loadFlags & Ci.nsIChannel.VALIDATE_ALWAYS)
	channelFlag = channelFlag + " - " + "VALIDATE_ALWAYS";

	if (httpChannel.loadFlags & Ci.nsIChannel.VALIDATE_NEVER)
	channelFlag = channelFlag + " - " + "VALIDATE_NEVER";

	if (httpChannel.loadFlags & Ci.nsIChannel.VALIDATE_ONCE_PER_SESSION)
	channelFlag = channelFlag + " - " + "VALIDATE_ONCE_PER_SESSION";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_REQUESTMASK)
	channelFlag = channelFlag + " - " + "LOAD_REQUESTMASK";

	if (httpChannel.loadFlags & Ci.nsIChannel.LOAD_FRESH_CONNECTION)
	channelFlag = channelFlag + " - " + "LOAD_FRESH_CONNECTION";

	console.log("channelFlag: " + channelFlag);

	if (httpChannel.originalURI.spec == httpChannel.URI.spec) {
		console.log("originalURI && URI: " + httpChannel.originalURI.spec);
	}
	else {
		console.log("originalURI: " + httpChannel.originalURI.spec);
		console.log("URI: " + httpChannel.URI.spec);
	}
	try {
		console.log("referrer: " + httpChannel.referrer.spec);
	}
	catch (e) {
		console.log("referrer: ");
	}

	try {
		console.log("dcumentURI: " + httpChannel.documentURI);
	}
	catch (e) {
		//console.log("referrer: ");
	}

	try {
		console.log("name: " + httpChannel.name);
	}
	catch (e) {
		//console.log("referrer: ");
	}

	console.log("requestMethod: " + httpChannel.requestMethod);
	try {
		if (httpChannel.contentType) console.log("contentType: " + httpChannel.contentType);
	}
	catch (e) {
		console.log("contentType: ");
	}

	try {
		if (httpChannel.contentLength) console.log("contentLength: " + httpChannel.contentLength);
	}
	catch (e) {
		console.log("contentLength: ");
	}

	try {
		if (httpChannel.responseStatus) console.log("responseStatus: " + httpChannel.responseStatus);
	}
	catch (e) {
		console.log("responseStatus: ");
	}

	printRequestHeader(httpChannel, "Accept");
	printRequestHeader(httpChannel, "Accept-Language");
	printRequestHeader(httpChannel, "Host");
	printRequestHeader(httpChannel, "User-Agent");
	printResponseHeader(httpChannel, "Content-Length");
	printResponseHeader(httpChannel, "Content-Type");
	printResponseHeader(httpChannel, "Expires");
	printResponseHeader(httpChannel, "Server");
	printResponseHeader(httpChannel, "X-ResponseOrigin");

	try {
		console.log("getAllResponseHeaders: " + httpChannel.getAllResponseHeaders());
	}
	catch (e) {
		console.log("getAllResponseHeaders: ");
	}


};
exports.getChannelInfo = getChannelInfo;

const printRequestHeader = (channel, header) => {
	try {
		console.log(header + "= " + channel.getRequestHeader(header));
	}
	catch (e) {
		// the header did not exist, just continue
	}
};

const printResponseHeader = (channel, header) => {
	try {
		console.log(header + "= " + channel.getResponseHeader(header));
	} catch (e) {
		// the header did not exist, just continue
	}
};
