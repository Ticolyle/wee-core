import { getRouteMap } from './route-map';
import { parseLocation } from './location';
import { createRoute } from './route';
import { _castString } from '../core/types';

/**
 * Match route against current path and assign params
 *
 * @param {RegExp} regex
 * @param {string} path
 * @param {Object} [params]
 * @returns {boolean}
 */
export function matchRoute (regex, path, params = {}) {
	const match = path.match(regex);
	let i = 0;
	let length;

	if (! match) {
		return false;
	}

	length = match.length;

	for (; i < length; i++) {
		const key = regex.keys[i - 1];
		const val = typeof match[i] === 'string' ? decodeURIComponent(match[i]) : match[i];

		if (key) {
			params[key.name] = _castString(val);
		}
	}

	return true
}

/**
 * Evaluate given path against registered route records
 *
 * @param {string|Object} [path]
 * @returns {Object}
 */
export function match(path) {
	const { notFound, pathList, pathMap } = getRouteMap();
	const location = parseLocation(path);
	let i = 0;
	let routeCount = pathList.length;

	location.params = {};

	for (; i < routeCount; i++) {
		const record = pathMap[pathList[i]];

		// Add params to location object as part of check
		if (matchRoute(record.regex, location.path, location.params)) {
			return createRoute(location, record);
		}
	}

	// No match
	return createRoute(location, notFound);
}

/**
 * Evaluates if matched route is actually default notFound route
 * in which case we want route evaluation stopped
 *
 * @param {Object} route
 * @returns {boolean}
 */
export function noMatch(route) {
	return (route.meta && route.meta.noMatch);
}