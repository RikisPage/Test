"use strict";

const preferences = require("./preferencesManager");
const { URL } = require("sdk/url");

const areMatchingURL = (matchURL, testURL) => {
	const pattern = getURLMatchPattern(matchURL);
	return pattern.test(testURL);
};
exports.areMatchingURL = areMatchingURL;

const areEqualURL = (matchURL, testURL) => matchURL.toUpperCase() === testURL.toUpperCase();
exports.areEqualURL = areEqualURL;

const areEqualBaseURL = (matchURL, testURL) => {
	const pattern = getURLBaseMatchPattern(matchURL);
	return pattern.test(testURL);
};
exports.areEqualBaseURL = areEqualBaseURL;

const getURLBaseMatchPattern = (url) => {

	const validUri = /^(f|ht)tps?:\/\//i;
	const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

	if (validUri.test(url)) {
		const uri = URL(url);
		const basePattern = "^" + uri.scheme + ":\\/\\/" + (uri.userPass ? uri.userPass + "@" : "") + uri.host.replace(/^(www.)?/,"(www.)?") + (uri.port ? ":" + uri.port : "");
		return new RegExp(basePattern + escapeRegExp(uri.path.split(/[?#]/)[0].replace(/\/?$/, "")) + "(\\/\\?|\\?|\\/#|#|\\/?$)", "i");
	}
	else {
		return new RegExp("^" + escapeRegExp(url) + "$", "i");
	}
};
exports.getURLBaseMatchPattern = getURLBaseMatchPattern;

const getURLMatchPattern = (url) => {

	const validUri = /^(f|ht)tps?:\/\//i;
	const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

	if (validUri.test(url)) {

		const uri = URL(url);
		const basePattern = "^" + uri.scheme + ":\\/\\/" + (uri.userPass ? uri.userPass + "@" : "") + uri.host.replace(/^(www.)?/,"(www.)?") + (uri.port ? ":" + uri.port : "");

		if (!preferences.ignoreSearchPart() && !preferences.ignoreHashPart()) {
			return new RegExp(basePattern + escapeRegExp(uri.path.replace(/(\/\?|\/#|\/|#|\?)?$/, "")) + "(\\/|#|\\?|\\/#|\\/\\?)?$", "i");
		}
		else if (preferences.ignoreSearchPart() && preferences.ignoreHashPart()) {
			return new RegExp(basePattern + escapeRegExp(uri.path.split(/[?#]/)[0].replace(/\/?$/, "")) + "(\\/\\?|\\?|\\/#|#|\\/?$)", "i");
		}
		else if (preferences.ignoreSearchPart()) {
			return new RegExp(basePattern + escapeRegExp(uri.path.split('?')[0].replace(/\/?$/, "")) + "(\\/\\?|\\?|\\/?$)", "i");
		}
		else if (preferences.ignoreHashPart()) {
			return new RegExp(basePattern + escapeRegExp(uri.path.split('#')[0].replace(/\/?$/, "")) + "(\\/#|#|\\/?$)", "i");
		}
	}
	else {
		return new RegExp("^" + escapeRegExp(url) + "$", "i");
	}
};
exports.getURLMatchPattern = getURLMatchPattern;
