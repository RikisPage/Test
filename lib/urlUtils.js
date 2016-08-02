"use strict";

const preferences = require("./preferencesManager");
const { URL } = require("sdk/url");

const isValidUrl = (url) => {
	const regex  = /^(f|ht)tps?:\/\//i;
	return regex.test(url);
};

const areMatchingURL = (url1, url2, transform) => {

	if (isValidUrl(url1) && isValidUrl(url2)) {

		if (preferences.ignorePathPart()) {
			let uri1 = new URL(url1);
			url1 =  uri1.origin;
			let uri2 = new URL(url2);
			url2 =  uri2.origin;
		}
		else if (preferences.ignoreSearchPart()) {
			url1 = url1.split("?")[0];
			url2 = url2.split("?")[0];
		}
		else if (preferences.ignoreHashPart()) {
			url1 = url1.split("#")[0];
			url2 = url2.split("#")[0];
		}
	}

	url1 = url1.toUpperCase().replace(/\/$/, "");
	url2 = url2.toUpperCase().replace(/\/$/, "");

	return url1 === url2;
};
exports.areMatchingURL = areMatchingURL;

const matchingURL = (url) => {

	if (isValidUrl(url)) {
		
		if (preferences.ignorePathPart()) {
			let uri = new URL(url);
			url =  uri.origin;
		}
		else if (preferences.ignoreSearchPart()) {
			url = url.split("?")[0];
		}
		else if (preferences.ignoreHashPart()) {
			url = url.split("#")[0];
		}
	}

	return url.toUpperCase().replace(/\/$/, "");;
};
exports.matchingURL = matchingURL;
