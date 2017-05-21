import { parseLocation } from 'routes/location';
import Handler from 'routes/route-handler';
import { getRouteMap, mapRoutes, resetRouteMap, setNotFound } from 'routes/route-map';
import History from './routes/history';
import { addAfterEach, addBeforeEach, resetHooks } from './routes/global-hooks';
import { START } from './routes/route';

let _history = new History();

/**
 * Set base configurations for router
 *
 * @param {Object} config
 * @returns {router}
 */
function router(config = {}) {
	return router;
}

/**
 * Register global after hook
 *
 * @param {Function} fn
 * @returns {router}
 */
router.afterEach = function registerAfterEach(fn) {
	addAfterEach(fn);

	return this;
}

/**
 * Register global before hook
 *
 * @param {Function} fn
 * @returns {router}
 */
router.beforeEach = function registerBeforeEach(fn) {
	addBeforeEach(fn);

	return this;
};

/**
 * Retrieve current route
 *
 * @returns {Object}
 */
router.currentRoute = function currentRoute() {
	return _history.current;
}

// TODO: Change map to register
/**
 * Register routes
 *
 * @param {Array} routes
 * @returns {router}
 */
router.map = function routerMap(routes) {
	mapRoutes(routes);

	return this;
}

/**
 * Set the catch all route that is matched if no other routes match
 *
 * @param {Object} route
 * @returns {router}
 */
router.notFound = function notFound(route) {
	route.path = '*';
	route.name = 'notFound';

	setNotFound(route);

	return this;
}

/**
 * Reset all routes - mainly for testing purposes
 */
router.reset = function reset() {
	resetRouteMap();
	resetHooks();
	_history.current = START;
}

/**
 * Retrieve all routes or specific route by name/path
 *
 * @param {string} [value]
 * @param {string} keyType
 * @returns {Object|Array}
 */
router.routes = function routes(key, keyType = 'path') {
	let routeMaps = getRouteMap();
	let map;

	if (key) {
		if (routeMaps.pathMap.hasOwnProperty(key)) {
			return routeMaps.pathMap[key];
		} else if (routeMaps.nameMap.hasOwnProperty(key)) {
			return routeMaps.nameMap[key];
		} else {
			return null;
		}
	}

	if (keyType === 'path') {
		map = routeMaps.pathMap;
	} else if (keyType === 'name') {
		map = routeMaps.nameMap;
	} else if (keyType === 'list') {
		map = routeMaps.pathList;
	}

	return map;
}

/**
 * Evaluate mapped routes against current or provided URL
 *
 * @param {string} value
 * @returns {router}
 */
router.run = function runRoutes(value) {
	if (! value) {
		_history.navigate(this.uri().full);
		return this;
	}

	// TODO: This is going to set the state of the current route in history
	// TODO: I don't think that will be desirable
	// TODO: Do we need a way to evaluate routes without changing history state?
	const { pathMap, nameMap } = getRouteMap();

	if (pathMap[value]) {
		_history.navigate(value);
	} else if (nameMap[value]) {
		_history.navigate(value);
	}
}

// TODO: Perhaps break out location methods into own module
/**
 * Retrieve the current path's segments as an array or segment by index
 *
 * @param index
 * @returns {Array|string}
 */
router.segments = function uriSegments(index) {
	const segments = this.uri().segments;

	if (index >= 0 && segments[index]) {
		return segments[index];
	}

	return segments;
}

/**
 * Retrieve information about current location
 *
 * @param {string} [value]
 * @returns {Object}
 */
router.uri = function uri(value) {
	return parseLocation(value);
}

export default router;
export const RouteHandler = Handler;