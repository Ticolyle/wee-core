import { _body, _doc, _html, _slice, _win, U } from 'core/variables';
import { $exec } from 'core/core';
import { _extend, $toArray } from 'core/types';

let range,
	refs = {};

/**
 * Check if a node contains another node
 *
 * @private
 * @param {HTMLElement} source
 * @param {HTMLElement} target
 * @returns {boolean} match
 */
const _contains = (source, target) => {
	return (source === _doc ? _html : source)
		.contains(target);
};

/**
 * Convert selection to array
 *
 * @protected
 * @param {($|HTMLElement|string)} selector
 * @param {object} [options]
 * @param {(HTMLElement|string)} [options.context=document]
 * @returns {($|Array)} nodes
 */
export const _selArray = (selector, options) => {
	if (selector && selector._$) {
		return selector;
	}

	options = options || {};

	let el = typeof selector == 'string' ?
		$(selector, options.context) :
		selector;

	return $toArray(el);
};

/**
 * Get matches to specified selector or return parsed HTML
 *
 * @param {($|HTMLElement|string)} selector
 * @param {($|HTMLElement|string)} [context=document]
 * @returns {Array} elements
 */
export const $ = (selector, context) => {
	let el = null,
		ref = [];

	if (typeof selector != 'string') {
		el = selector;
	} else {
		if (selector == 'window') {
			return [_win];
		}

		if (selector == 'document') {
			return [_doc];
		}

		// Return nothing if context doesn't exist
		context = context !== U ? $(context)[0] : _doc;

		if (! context) {
			return ref;
		}

		// Check for pre-cached elements
		if (selector.indexOf('ref:') > -1) {
			let split = selector.split(',').filter(function(sel) {
				sel = sel.trim();

				if (sel.slice(0, 4) == 'ref:') {
					sel = sel.slice(4);
					sel = refs[sel];

					// Apply context filter if not document
					if (sel) {
						ref = ref.concat(
							context === _doc ?
								sel :
								sel.filter(function(el) {
									return _contains(context, el);
								})
						);
					}

					return false;
				}

				return true;
			});

			if (split.length) {
				selector = split.join(',');
			} else {
				return ref;
			}
		}

		// Use third-party selector engine if defined
		if (_win.WeeSelector !== U) {
			el = _win.WeeSelector(selector, context);
		} else if (/^[#.]?[\w-]+$/.test(selector)) {
			let pre = selector[0];

			if (pre == '#') {
				el = _doc.getElementById(selector.substr(1));
			} else if (pre == '.') {
				el = context.getElementsByClassName(selector.substr(1));
			} else {
				el = context.getElementsByTagName(selector);
			}
		} else {
			try {
				el = context.querySelectorAll(selector);
			} catch (e) {
				el = $parseHTML(selector).childNodes;
			}
		}
	}

	if (! el) {
		el = ref;
	} else if (el.nodeType !== U || el === _win) {
		el = [el];
	} else {
		el = _slice.call(el);
	}

	// Join references if available
	return ref.length ? el.concat(ref) : el;
};

/**
 * Execute function for each matching selection
 *
 * @param {($|Array|HTMLElement|string)} target
 * @param {function} fn
 * @param {object} [options]
 * @param {Array} [options.args]
 * @param {($|HTMLElement|string)} [options.context=document]
 * @param {boolean} [options.reverse=false]
 * @param {object} [options.scope]
 */
export const $each = (target, fn, options) => {
	if (target) {
		let conf = _extend({
				args: []
			}, options),
			els = _selArray(target, conf),
			i = 0;

		if (conf.reverse && ! els._$) {
			els = els.reverse();
		}

		for (; i < els.length; i++) {
			let el = els[i],
				val = $exec(fn, {
					args: [el, i].concat(conf.args),
					scope: conf.scope || el
				});

			if (val === false) {
				return;
			}
		}
	}
};

/**
 * Create document fragment from an HTML string
 *
 * @param {string} html
 * @returns {HTMLElement} element
 */
export const $parseHTML = html => {
	let el;
	html = html.trim();

	if (! range) {
		range = _doc.createRange();
		range.selectNode(_body);
	}

	if (range && range.createContextualFragment) {
		el = range.createContextualFragment(html);
	} else {
		let div = _doc.createElement('div'),
			child;
		el = _doc.createDocumentFragment();

		div.innerHTML = html;

		while (child = div.firstChild) {
			el.appendChild(child);
		}
	}

	return el;
};

/**
 * Add ref elements to datastore
 *
 * @param {(HTMLElement|string)} [context=document]
 */
export const $setRef = context => {
	context = context ? $(context)[0] : _doc;

	// Clear existing refs if reset
	Object.keys(refs).forEach(function(val) {
		refs[val] = refs[val].filter(function(el) {
			return ! (
				! _contains(_doc, el) ||
				(_contains(context, el) && context !== el)
			);
		});
	});

	// Set refs from DOM
	$each('[data-ref]', function(el) {
		el.getAttribute('data-ref').split(/\s+/)
			.forEach(function(val) {
				refs[val] = refs[val] || [];
				refs[val].push(el);
			});
	}, {
		context: context
	});
};

/**
 * Execute specified function when document is ready
 *
 * @param {(Array|function|string)} fn
 */
export const ready = fn => {
	_doc.readyState == 'complete' ?
		$exec(fn) :
		_doc.addEventListener('DOMContentLoaded', function() {
			$exec(fn);
		});
};