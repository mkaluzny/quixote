!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.quixote=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var shim = require("../util/shim.js");

var Me = module.exports = function Descriptor() {};

Me.extend = function extend(Subclass) {
	ensure.signature(arguments, [ Function ]);

	Subclass.prototype = shim.objectDotCreate(Me.prototype);
	Subclass.prototype.constructor = Subclass;
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ [Number, Me] ]);
	expected = this.convert(expected);

	var actualValue = this.value();
	var expectedValue = expected.value();

	if (actualValue.equals(expectedValue)) return "";

	return "Expected " + this.toString() + " (" + this.value() + ")" +
		" to " + expected.describeMatch() +
		", but was " + actualValue.diff(expectedValue);
};

Me.prototype.value = mustImplement("value");
Me.prototype.convert = mustImplement("convert");
Me.prototype.describeMatch = mustImplement("describeMatch");
Me.prototype.toString = mustImplement("toString");

function mustImplement(name) {
	return function() {
		ensure.unreachable("Descriptor subclasses must implement " + name + "() method");
	};
}
},{"../util/ensure.js":8,"../util/shim.js":9}],2:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var Position = require("../values/position.js");

var Me = module.exports = function ElementCenter(element) {
	// TODO: ensure.signature (circular dependency)

	this._element = element;
};
Descriptor.extend(Me);

Me.x = function(element) {
	return new Me(element);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var position = this._element.getRawPosition();
	return Position.x(position.left + ((position.right - position.left) / 2));
};

Me.prototype.convert = function convert(arg) {
	ensure.signature(arguments, [ [Number, Descriptor ]]);

	if (typeof arg === "number") return Position.x(arg);
	else return arg;
};

Me.prototype.toString = function toString() {
	return "center of element '" + this._element.description() + "'";
};
},{"../util/ensure.js":8,"../values/position.js":10,"./descriptor.js":1}],3:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");
var ElementPosition = require("./element_position.js");
var Descriptor = require("./descriptor.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function ElementEdge(element, position) {
//	ensure.signature(arguments, [ QElement ]);      // TODO: creates circular dependency
	this._element = element;
	this._position = position;
};
Descriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

Me.prototype.plus = function plus(amount) {
	ensure.signature(arguments, [ Number ]);

	if (this._position === TOP || this._position === BOTTOM) return ElementPosition.y(this, amount);
	if (this._position === RIGHT || this._position === LEFT) return ElementPosition.x(this, amount);

	ensure.unreachable();
};

Me.prototype.minus = function minus(amount) {
	ensure.signature(arguments, [ Number ]);

	return this.plus(amount * -1);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var result = this._element.getRawPosition()[this._position];
	return createPosition(this, result);
};

Me.prototype.convert = function convert(arg) {
	ensure.signature(arguments, [ [Number, Descriptor] ]);

	if (typeof arg === "number") return createPosition(this, arg);
	else return arg;
};

Me.prototype.describeMatch = function describeMatch() {
	ensure.signature(arguments, []);

	return "match " + this.toString() + " (" + this.value() + ")";
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return this._position + " edge of element '" + this._element.description() + "'";
};

function factoryFn(position) {
	return function factory(element) {
		return new Me(element, position);
	};
}

function createPosition(self, value) {
	if (self._position === TOP || self._position === BOTTOM) return Position.y(value);
	if (self._position === RIGHT || self._position === LEFT) return Position.x(value);

	ensure.unreachable();
}
},{"../util/ensure.js":8,"../values/position.js":10,"./descriptor.js":1,"./element_position.js":4}],4:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var ElementEdge = require("./element_edge.js");
var Position = require("../values/position.js");
var Descriptor = require("./descriptor.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function ElementPosition(dimension, edge, relativeAmount) {
//	ensure.signature(arguments, [ String, ElementEdge, Number ]); // TODO: creates circular dependency
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._edge = edge;
	this._amount = relativeAmount;
};
Descriptor.extend(Me);

Me.x = function x(edge, relativeAmount) {
	return new Me(X_DIMENSION, edge, relativeAmount);
};

Me.y = function y(edge, relativeAmount) {
	return new Me(Y_DIMENSION, edge, relativeAmount);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	return this._edge.value().plus(this._amount);
};

Me.prototype.convert = function convert(arg) {
	ensure.signature(arguments, [ [Number, Descriptor] ]);

	if (typeof arg === "number") return createPosition(this, arg);
	else return arg;
};

Me.prototype.describeMatch = function describeMatch() {
	ensure.signature(arguments, []);

	return "be " + this.toString() + " (" + this.value() + ")";
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return relativeAmount(this) + this._edge.toString();
};

function relativeAmount(self) {
	if (self._amount === 0) return "";

	var direction;
	if (self._dimension === X_DIMENSION) direction = (self._amount < 0) ? "left of" : "right of";
	else direction = (self._amount < 0) ? "above" : "below";

	return Math.abs(self._amount) + "px " + direction + " ";
}

function createPosition(self, value) {
	if (self._dimension === X_DIMENSION) return Position.x(value);
	else return Position.y(value);
}
},{"../util/ensure.js":8,"../values/position.js":10,"./descriptor.js":1,"./element_edge.js":3}],5:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var QElement = require("./q_element.js");

var Me = module.exports = function Frame(domElement) {
	ensure.signature(arguments, [ Object ]);
	ensure.that(domElement.tagName === "IFRAME", "DOM element must be an iframe");

	this._domElement = domElement;
	this._loaded = false;
	this._removed = false;
};

function loaded(self) {
	self._loaded = true;
	self._document = self._domElement.contentDocument;
	self._originalBody = self._document.body.innerHTML;
}

Me.create = function create(parentElement, width, height, options, callback) {
	ensure.signature(arguments, [ Object, Number, Number, [ Object, Function ], [ undefined, Function ] ]);

	if (callback === undefined) {
		callback = options;
		options = {};
	}

	// WORKAROUND Mobile Safari 7.0.0: weird style results occur when both src and stylesheet are loaded (see test)
	ensure.that(
		!(options.src && options.stylesheet),
		"Cannot specify HTML URL and stylesheet URL simultaneously due to Mobile Safari issue"
	);

	if (options.src){
		ensure.that(urlExists(options.src), "The HTML document does not exist at the specified URL");
	}

	if (options.stylesheet){
		ensure.that(urlExists(options.stylesheet), "The stylesheet does not exist at the specified URL");
	}

	var iframe = document.createElement("iframe");
	iframe.setAttribute("width", width);
	iframe.setAttribute("height", height);
	iframe.setAttribute("frameborder", "0");    // WORKAROUND IE 8: don't include frame border in position calcs
	if (options.src) iframe.setAttribute("src", options.src);

	var frame = new Me(iframe);
	addLoadListener(iframe, onFrameLoad);
	parentElement.appendChild(iframe);
	return frame;

	function onFrameLoad() {
		// WORKAROUND Mobile Safari 7.0.0, Safari 6.2.0, Chrome 38.0.2125: frame is loaded synchronously
		// We force it to be asynchronous here
		setTimeout(function() {
			loaded(frame);
			loadStylesheet(frame, options.stylesheet, function() {
				callback(null, frame);
			});
		}, 0);
	}
};

function urlExists(url) {
  var http = new XMLHttpRequest();
  http.open('HEAD', url, false);
  http.send();
  return http.status !== 404;
}

function loadStylesheet(self, url, callback) {
	ensure.signature(arguments, [ Me, [ undefined, String ], Function ]);
	if (url === undefined) return callback();

	var link = document.createElement("link");
	addLoadListener(link, onLinkLoad);
	link.setAttribute("rel", "stylesheet");
	link.setAttribute("type", "text/css");
	link.setAttribute("href", url);

	documentHead(self).appendChild(link);

	function onLinkLoad() {
		callback();
	}
}

Me.prototype.reset = function() {
	ensure.signature(arguments, []);
	ensureUsable(this);

	this._document.body.innerHTML = this._originalBody;
};

Me.prototype.toDomElement = function() {
	ensure.signature(arguments, []);
	ensureNotRemoved(this);

	return this._domElement;
};

Me.prototype.remove = function() {
	ensure.signature(arguments, []);
	ensureLoaded(this);
	if (this._removed) return;

	this._removed = true;
	this._domElement.parentNode.removeChild(this._domElement);
};

Me.prototype.addElement = function(html) {
	ensure.signature(arguments, [ String ]);
	ensureUsable(this);

	var tempElement = document.createElement("div");
	tempElement.innerHTML = html;
	ensure.that(
		tempElement.childNodes.length === 1,
		"Expected one element, but got " + tempElement.childNodes.length + " (" + html + ")"
	);

	var insertedElement = tempElement.childNodes[0];
	this._document.body.appendChild(insertedElement);
	return new QElement(insertedElement, html);
};

Me.prototype.getElement = function(selector) {
	ensure.signature(arguments, [ String ]);
	ensureUsable(this);

	var nodes = this._document.querySelectorAll(selector);
	ensure.that(nodes.length === 1, "Expected one element to match '" + selector + "', but found " + nodes.length);
	return new QElement(nodes[0], selector);
};

// WORKAROUND IE8: no addEventListener()
function addLoadListener(iframeDom, callback) {
	if (iframeDom.addEventListener) iframeDom.addEventListener("load", callback);
	else iframeDom.attachEvent("onload", callback);
}

// WORKAROUND IE8: no document.head
function documentHead(self) {
	if (self._document.head) return self._document.head;
	else return self._document.querySelector("head");
}

function ensureUsable(self) {
	ensureLoaded(self);
	ensureNotRemoved(self);
}

function ensureLoaded(self) {
	ensure.that(self._loaded, "Frame not loaded: Wait for frame creation callback to execute before using frame");
}

function ensureNotRemoved(self) {
	ensure.that(!self._removed, "Attempted to use frame after it was removed");
}

},{"./q_element.js":6,"./util/ensure.js":8}],6:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var camelcase = require("../vendor/camelcase-1.0.1-modified.js");
var ElementEdge = require("./descriptors/element_edge.js");
var ElementCenter = require("./descriptors/element_center.js");

var Me = module.exports = function QElement(domElement, description) {
	ensure.signature(arguments, [ Object, [ String ] ]);

	this._domElement = domElement;
	this._description = description;

	this.top = ElementEdge.top(this);
	this.right = ElementEdge.right(this);
	this.bottom = ElementEdge.bottom(this);
	this.left = ElementEdge.left(this);

	this.center = ElementCenter.x(this);
};

Me.prototype.assert = function assert(expected, message) {
	ensure.signature(arguments, [ Object, [undefined, String] ]);
	if (message === undefined) message = "Differences found";

	var diff = this.diff(expected);
	if (diff !== "") throw new Error(message + ":\n" + diff);
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ Object ]);

	var result = [];
	var keys = objectKeys(expected);
	var key, oneDiff, constraint;
	for (var i = 0; i < keys.length; i++) {
		key = keys[i];
		constraint = this[key];
		ensure.that(constraint !== undefined, "'" + key + "' is unknown and can't be used with diff()");
		oneDiff = constraint.diff(expected[key]);
		if (oneDiff !== "") result.push(oneDiff);
	}

	return result.join("\n");
};

Me.prototype.getRawStyle = function getRawStyle(styleName) {
	ensure.signature(arguments, [ String ]);

	var styles;
	var result;

	// WORKAROUND IE8: no getComputedStyle()
	if (window.getComputedStyle) {
		styles = window.getComputedStyle(this._domElement);
		result = styles.getPropertyValue(styleName);
	}
	else {
		styles = this._domElement.currentStyle;
		result = styles[camelcase(styleName)];
	}
	if (result === null || result === undefined) result = "";
	return result;
};

Me.prototype.getRawPosition = function getRawPosition() {
	ensure.signature(arguments, []);

	// WORKAROUND IE8: No TextRectangle.height or .width
	var rect = this._domElement.getBoundingClientRect();
	return {
		left: rect.left,
		right: rect.right,
		width: rect.width !== undefined ? rect.width : rect.right - rect.left,

		top: rect.top,
		bottom: rect.bottom,
		height: rect.height !== undefined ? rect.height : rect.bottom - rect.top
	};
};

Me.prototype.toDomElement = function toDomElement() {
	ensure.signature(arguments, []);

	return this._domElement;
};

Me.prototype.description = function description() {
	return this._description;
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return this._domElement.outerHTML;
};

Me.prototype.equals = function equals(that) {
	ensure.signature(arguments, [ Me ]);

	return this._domElement === that._domElement;
};

// WORKAROUND IE8: No Object.keys
function objectKeys(obj) {
	if (Object.keys) return Object.keys(obj);

	// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
  var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
      dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],
      dontEnumsLength = dontEnums.length;

  if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
    throw new TypeError('Object.keys called on non-object');
  }

  var result = [], prop, i;

  for (prop in obj) {
    if (hasOwnProperty.call(obj, prop)) {
      result.push(prop);
    }
  }

  if (hasDontEnumBug) {
    for (i = 0; i < dontEnumsLength; i++) {
      if (hasOwnProperty.call(obj, dontEnums[i])) {
        result.push(dontEnums[i]);
      }
    }
  }
  return result;
}
},{"../vendor/camelcase-1.0.1-modified.js":11,"./descriptors/element_center.js":2,"./descriptors/element_edge.js":3,"./util/ensure.js":8}],7:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var Frame = require("./frame.js");

exports.createFrame = function(width, height, options, callback) {
	return Frame.create(document.body, width, height, options, callback);
};
},{"./frame.js":5,"./util/ensure.js":8}],8:[function(require,module,exports){
// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

// Runtime assertions for production code. (Contrast to assert.js, which is for test code.)

var shim = require("./shim.js");

exports.that = function(variable, message) {
	if (message === undefined) message = "Expected condition to be true";

	if (variable === false) throw new EnsureException(exports.that, message);
	if (variable !== true) throw new EnsureException(exports.that, "Expected condition to be true or false");
};

exports.unreachable = function(message) {
	if (!message) message = "Unreachable code executed";

	throw new EnsureException(exports.unreachable, message);
};

exports.signature = function(args, signature) {
	signature = signature || [];
	var expectedArgCount = signature.length;
	var actualArgCount = args.length;

	if (actualArgCount > expectedArgCount) {
		throw new EnsureException(
			exports.signature,
			"Function called with too many arguments: expected " + expectedArgCount + " but got " + actualArgCount
		);
	}

	var type, arg, name;
	for (var i = 0; i < signature.length; i++) {
		type = signature[i];
		arg = args[i];
		name = "Argument " + i;

		if (!shim.arrayDotIsArray(type)) type = [ type ];
		if (!typeMatches(type, arg, name)) {
			throw new EnsureException(
				exports.signature,
				name + " expected " + explainType(type) + ", but was " + explainArg(arg)
			);
		}
	}
};

function typeMatches(type, arg) {
	for (var i = 0; i < type.length; i++) {
		if (oneTypeMatches(type[i], arg)) return true;
	}
	return false;

	function oneTypeMatches(type, arg) {
		switch (getType(arg)) {
			case "boolean": return type === Boolean;
			case "string": return type === String;
			case "number": return type === Number;
			case "array": return type === Array;
			case "function": return type === Function;
			case "object": return type === Object || arg instanceof type;
			case "undefined": return type === undefined;
			case "null": return type === null;
			case "NaN": return isNaN(type);

			default: exports.unreachable();
		}
	}
}

function explainType(type) {
	var joiner = "";
	var result = "";
	for (var i = 0; i < type.length; i++) {
		result += joiner + explainOneType(type[i]);
		joiner = (i === type.length - 2) ? ", or " : ", ";
	}
	return result;

	function explainOneType(type) {
		switch (type) {
			case Boolean: return "boolean";
			case String: return "string";
			case Number: return "number";
			case Array: return "array";
			case Function: return "function";
			case null: return "null";
			default:
				if (typeof type === "number" && isNaN(type)) return "NaN";
				else {
					return shim.functionDotName(type) + " instance";
				}
		}
	}
}

function explainArg(arg) {
	var type = getType(arg);
	if (type !== "object") return type;

	var prototype = shim.objectDotGetPrototypeOf(arg);
	if (prototype === null) return "an object without a prototype";
	else {
		return shim.functionDotName(prototype.constructor) + " instance";
	}
}

function getType(variable) {
	var type = typeof variable;
	if (variable === null) type = "null";
	if (shim.arrayDotIsArray(variable)) type = "array";
	if (type === "number" && isNaN(variable)) type = "NaN";
	return type;
}


/*****/

var EnsureException = exports.EnsureException = function(fnToRemoveFromStackTrace, message) {
	if (Error.captureStackTrace) Error.captureStackTrace(this, fnToRemoveFromStackTrace);
	else this.stack = (new Error()).stack;
	this.message = message;
};
EnsureException.prototype = shim.objectDotCreate(Error.prototype);
EnsureException.prototype.constructor = EnsureException;
EnsureException.prototype.name = "EnsureException";

},{"./shim.js":9}],9:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// WORKAROUND IE 8: no Object.create()
exports.objectDotCreate = function objectDotCreate(prototype) {
	if (Object.create) return Object.create(prototype);

	var Temp = function Temp() {};
	Temp.prototype = prototype;
	return new Temp();
};

// WORKAROUND IE 8, IE 9, IE 10, IE 11: no function.name
exports.functionDotName = function functionDotName(fn) {
	if (fn.name) return fn.name;

	// This workaround is based on code by Jason Bunting et al, http://stackoverflow.com/a/332429
	var funcNameRegex = /function\s+(.{1,})\s*\(/;
	var results = (funcNameRegex).exec((fn).toString());
	return (results && results.length > 1) ? results[1] : "<anon>";
};

// WORKAROUND IE 8: no Array.isArray
exports.arrayDotIsArray = function arrayDotIsArray(thing) {
	if (Array.isArray) return Array.isArray(thing);

	return Object.prototype.toString.call(thing) === '[object Array]';
};

// WORKAROUND IE 8: no Object.getPrototypeOf
exports.objectDotGetPrototypeOf = function objectDotGetPrototypeOf(obj) {
	if (Object.getPrototypeOf) return Object.getPrototypeOf(obj);

	var result = obj.constructor ? obj.constructor.prototype : null;
	return result || null;
};
},{}],10:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function Position(dimension, value) {
	ensure.signature(arguments, [ String, Number ]);

	this._dimension = dimension;
	this._position = value;
};

Me.x = function x(value) {
	return new Me(X_DIMENSION, value);
};

Me.y = function y(value) {
	return new Me(Y_DIMENSION, value);
};

Me.prototype.plus = function plus(amount) {
	ensure.signature(arguments, [ Number ]);

	return new Me(this._dimension, this._position + amount);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	return this;
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ Me ]);
	ensure.that(this._dimension === expected._dimension, "Can't compare X dimension to Y dimension");

	var actualValue = this._position;
	var expectedValue = expected._position;

	var direction;
	if (this._dimension === X_DIMENSION) direction = expectedValue > actualValue ? "to the left" : "to the right";
	else direction = expectedValue > actualValue ? "lower" : "higher";

	var value = Math.abs(expectedValue - actualValue);
	if (value === 0) return "";
	else return value + "px " + direction;
};

Me.prototype.equals = function equals(that) {
	ensure.signature(arguments, [ Me ]);

	return (this.diff(that) === "");
};

Me.prototype.describeMatch = function describeMatch() {
	ensure.signature(arguments, []);

	return "be " + this;
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return this._position + "px";
};

},{"../util/ensure.js":8}],11:[function(require,module,exports){
'use strict';
module.exports = function (str) {
	if (str.length === 1) {
		return str;
	}

	return str
	.replace(/^[_.\- ]+/, '')
	.toLowerCase()
	.replace(/[_.\- ]+(\w|$)/g, function (m, p1) {
		return p1.toUpperCase();
	});
};

},{}]},{},[7])(7)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9kZXNjcmlwdG9yLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvZGVzY3JpcHRvcnMvZWxlbWVudF9jZW50ZXIuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9lbGVtZW50X2VkZ2UuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9lbGVtZW50X3Bvc2l0aW9uLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvZnJhbWUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9xX2VsZW1lbnQuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9xdWl4b3RlLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvdXRpbC9lbnN1cmUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy91dGlsL3NoaW0uanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy92YWx1ZXMvcG9zaXRpb24uanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3ZlbmRvci9jYW1lbGNhc2UtMS4wLjEtbW9kaWZpZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuLi91dGlsL3NoaW0uanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRGVzY3JpcHRvcigpIHt9O1xuXG5NZS5leHRlbmQgPSBmdW5jdGlvbiBleHRlbmQoU3ViY2xhc3MpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgRnVuY3Rpb24gXSk7XG5cblx0U3ViY2xhc3MucHJvdG90eXBlID0gc2hpbS5vYmplY3REb3RDcmVhdGUoTWUucHJvdG90eXBlKTtcblx0U3ViY2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3ViY2xhc3M7XG59O1xuXG5NZS5wcm90b3R5cGUuZGlmZiA9IGZ1bmN0aW9uIGRpZmYoZXhwZWN0ZWQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgW051bWJlciwgTWVdIF0pO1xuXHRleHBlY3RlZCA9IHRoaXMuY29udmVydChleHBlY3RlZCk7XG5cblx0dmFyIGFjdHVhbFZhbHVlID0gdGhpcy52YWx1ZSgpO1xuXHR2YXIgZXhwZWN0ZWRWYWx1ZSA9IGV4cGVjdGVkLnZhbHVlKCk7XG5cblx0aWYgKGFjdHVhbFZhbHVlLmVxdWFscyhleHBlY3RlZFZhbHVlKSkgcmV0dXJuIFwiXCI7XG5cblx0cmV0dXJuIFwiRXhwZWN0ZWQgXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIiAoXCIgKyB0aGlzLnZhbHVlKCkgKyBcIilcIiArXG5cdFx0XCIgdG8gXCIgKyBleHBlY3RlZC5kZXNjcmliZU1hdGNoKCkgK1xuXHRcdFwiLCBidXQgd2FzIFwiICsgYWN0dWFsVmFsdWUuZGlmZihleHBlY3RlZFZhbHVlKTtcbn07XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IG11c3RJbXBsZW1lbnQoXCJ2YWx1ZVwiKTtcbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gbXVzdEltcGxlbWVudChcImNvbnZlcnRcIik7XG5NZS5wcm90b3R5cGUuZGVzY3JpYmVNYXRjaCA9IG11c3RJbXBsZW1lbnQoXCJkZXNjcmliZU1hdGNoXCIpO1xuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gbXVzdEltcGxlbWVudChcInRvU3RyaW5nXCIpO1xuXG5mdW5jdGlvbiBtdXN0SW1wbGVtZW50KG5hbWUpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdGVuc3VyZS51bnJlYWNoYWJsZShcIkRlc2NyaXB0b3Igc3ViY2xhc3NlcyBtdXN0IGltcGxlbWVudCBcIiArIG5hbWUgKyBcIigpIG1ldGhvZFwiKTtcblx0fTtcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKFwiLi4vdmFsdWVzL3Bvc2l0aW9uLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEVsZW1lbnRDZW50ZXIoZWxlbWVudCkge1xuXHQvLyBUT0RPOiBlbnN1cmUuc2lnbmF0dXJlIChjaXJjdWxhciBkZXBlbmRlbmN5KVxuXG5cdHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xufTtcbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUueCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcblx0cmV0dXJuIG5ldyBNZShlbGVtZW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uIHZhbHVlKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBwb3NpdGlvbiA9IHRoaXMuX2VsZW1lbnQuZ2V0UmF3UG9zaXRpb24oKTtcblx0cmV0dXJuIFBvc2l0aW9uLngocG9zaXRpb24ubGVmdCArICgocG9zaXRpb24ucmlnaHQgLSBwb3NpdGlvbi5sZWZ0KSAvIDIpKTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgW051bWJlciwgRGVzY3JpcHRvciBdXSk7XG5cblx0aWYgKHR5cGVvZiBhcmcgPT09IFwibnVtYmVyXCIpIHJldHVybiBQb3NpdGlvbi54KGFyZyk7XG5cdGVsc2UgcmV0dXJuIGFyZztcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRyZXR1cm4gXCJjZW50ZXIgb2YgZWxlbWVudCAnXCIgKyB0aGlzLl9lbGVtZW50LmRlc2NyaXB0aW9uKCkgKyBcIidcIjtcbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9wb3NpdGlvbi5qc1wiKTtcbnZhciBFbGVtZW50UG9zaXRpb24gPSByZXF1aXJlKFwiLi9lbGVtZW50X3Bvc2l0aW9uLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xuXG52YXIgVE9QID0gXCJ0b3BcIjtcbnZhciBSSUdIVCA9IFwicmlnaHRcIjtcbnZhciBCT1RUT00gPSBcImJvdHRvbVwiO1xudmFyIExFRlQgPSBcImxlZnRcIjtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBFbGVtZW50RWRnZShlbGVtZW50LCBwb3NpdGlvbikge1xuLy9cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFFFbGVtZW50IF0pOyAgICAgIC8vIFRPRE86IGNyZWF0ZXMgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHR0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcblx0dGhpcy5fcG9zaXRpb24gPSBwb3NpdGlvbjtcbn07XG5EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnRvcCA9IGZhY3RvcnlGbihUT1ApO1xuTWUucmlnaHQgPSBmYWN0b3J5Rm4oUklHSFQpO1xuTWUuYm90dG9tID0gZmFjdG9yeUZuKEJPVFRPTSk7XG5NZS5sZWZ0ID0gZmFjdG9yeUZuKExFRlQpO1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IGZ1bmN0aW9uIHBsdXMoYW1vdW50KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE51bWJlciBdKTtcblxuXHRpZiAodGhpcy5fcG9zaXRpb24gPT09IFRPUCB8fCB0aGlzLl9wb3NpdGlvbiA9PT0gQk9UVE9NKSByZXR1cm4gRWxlbWVudFBvc2l0aW9uLnkodGhpcywgYW1vdW50KTtcblx0aWYgKHRoaXMuX3Bvc2l0aW9uID09PSBSSUdIVCB8fCB0aGlzLl9wb3NpdGlvbiA9PT0gTEVGVCkgcmV0dXJuIEVsZW1lbnRQb3NpdGlvbi54KHRoaXMsIGFtb3VudCk7XG5cblx0ZW5zdXJlLnVucmVhY2hhYmxlKCk7XG59O1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBmdW5jdGlvbiBtaW51cyhhbW91bnQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTnVtYmVyIF0pO1xuXG5cdHJldHVybiB0aGlzLnBsdXMoYW1vdW50ICogLTEpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIHJlc3VsdCA9IHRoaXMuX2VsZW1lbnQuZ2V0UmF3UG9zaXRpb24oKVt0aGlzLl9wb3NpdGlvbl07XG5cdHJldHVybiBjcmVhdGVQb3NpdGlvbih0aGlzLCByZXN1bHQpO1xufTtcblxuTWUucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiBjb252ZXJ0KGFyZykge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBbTnVtYmVyLCBEZXNjcmlwdG9yXSBdKTtcblxuXHRpZiAodHlwZW9mIGFyZyA9PT0gXCJudW1iZXJcIikgcmV0dXJuIGNyZWF0ZVBvc2l0aW9uKHRoaXMsIGFyZyk7XG5cdGVsc2UgcmV0dXJuIGFyZztcbn07XG5cbk1lLnByb3RvdHlwZS5kZXNjcmliZU1hdGNoID0gZnVuY3Rpb24gZGVzY3JpYmVNYXRjaCgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gXCJtYXRjaCBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiIChcIiArIHRoaXMudmFsdWUoKSArIFwiKVwiO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHRoaXMuX3Bvc2l0aW9uICsgXCIgZWRnZSBvZiBlbGVtZW50ICdcIiArIHRoaXMuX2VsZW1lbnQuZGVzY3JpcHRpb24oKSArIFwiJ1wiO1xufTtcblxuZnVuY3Rpb24gZmFjdG9yeUZuKHBvc2l0aW9uKSB7XG5cdHJldHVybiBmdW5jdGlvbiBmYWN0b3J5KGVsZW1lbnQpIHtcblx0XHRyZXR1cm4gbmV3IE1lKGVsZW1lbnQsIHBvc2l0aW9uKTtcblx0fTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUG9zaXRpb24oc2VsZiwgdmFsdWUpIHtcblx0aWYgKHNlbGYuX3Bvc2l0aW9uID09PSBUT1AgfHwgc2VsZi5fcG9zaXRpb24gPT09IEJPVFRPTSkgcmV0dXJuIFBvc2l0aW9uLnkodmFsdWUpO1xuXHRpZiAoc2VsZi5fcG9zaXRpb24gPT09IFJJR0hUIHx8IHNlbGYuX3Bvc2l0aW9uID09PSBMRUZUKSByZXR1cm4gUG9zaXRpb24ueCh2YWx1ZSk7XG5cblx0ZW5zdXJlLnVucmVhY2hhYmxlKCk7XG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIEVsZW1lbnRFZGdlID0gcmVxdWlyZShcIi4vZWxlbWVudF9lZGdlLmpzXCIpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9wb3NpdGlvbi5qc1wiKTtcbnZhciBEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvci5qc1wiKTtcblxudmFyIFhfRElNRU5TSU9OID0gXCJ4XCI7XG52YXIgWV9ESU1FTlNJT04gPSBcInlcIjtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBFbGVtZW50UG9zaXRpb24oZGltZW5zaW9uLCBlZGdlLCByZWxhdGl2ZUFtb3VudCkge1xuLy9cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZywgRWxlbWVudEVkZ2UsIE51bWJlciBdKTsgLy8gVE9ETzogY3JlYXRlcyBjaXJjdWxhciBkZXBlbmRlbmN5XG5cdGVuc3VyZS50aGF0KGRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04gfHwgZGltZW5zaW9uID09PSBZX0RJTUVOU0lPTiwgXCJVbnJlY29nbml6ZWQgZGltZW5zaW9uOiBcIiArIGRpbWVuc2lvbik7XG5cblx0dGhpcy5fZGltZW5zaW9uID0gZGltZW5zaW9uO1xuXHR0aGlzLl9lZGdlID0gZWRnZTtcblx0dGhpcy5fYW1vdW50ID0gcmVsYXRpdmVBbW91bnQ7XG59O1xuRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS54ID0gZnVuY3Rpb24geChlZGdlLCByZWxhdGl2ZUFtb3VudCkge1xuXHRyZXR1cm4gbmV3IE1lKFhfRElNRU5TSU9OLCBlZGdlLCByZWxhdGl2ZUFtb3VudCk7XG59O1xuXG5NZS55ID0gZnVuY3Rpb24geShlZGdlLCByZWxhdGl2ZUFtb3VudCkge1xuXHRyZXR1cm4gbmV3IE1lKFlfRElNRU5TSU9OLCBlZGdlLCByZWxhdGl2ZUFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbiB2YWx1ZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gdGhpcy5fZWRnZS52YWx1ZSgpLnBsdXModGhpcy5fYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgW051bWJlciwgRGVzY3JpcHRvcl0gXSk7XG5cblx0aWYgKHR5cGVvZiBhcmcgPT09IFwibnVtYmVyXCIpIHJldHVybiBjcmVhdGVQb3NpdGlvbih0aGlzLCBhcmcpO1xuXHRlbHNlIHJldHVybiBhcmc7XG59O1xuXG5NZS5wcm90b3R5cGUuZGVzY3JpYmVNYXRjaCA9IGZ1bmN0aW9uIGRlc2NyaWJlTWF0Y2goKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIFwiYmUgXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIiAoXCIgKyB0aGlzLnZhbHVlKCkgKyBcIilcIjtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiByZWxhdGl2ZUFtb3VudCh0aGlzKSArIHRoaXMuX2VkZ2UudG9TdHJpbmcoKTtcbn07XG5cbmZ1bmN0aW9uIHJlbGF0aXZlQW1vdW50KHNlbGYpIHtcblx0aWYgKHNlbGYuX2Ftb3VudCA9PT0gMCkgcmV0dXJuIFwiXCI7XG5cblx0dmFyIGRpcmVjdGlvbjtcblx0aWYgKHNlbGYuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIGRpcmVjdGlvbiA9IChzZWxmLl9hbW91bnQgPCAwKSA/IFwibGVmdCBvZlwiIDogXCJyaWdodCBvZlwiO1xuXHRlbHNlIGRpcmVjdGlvbiA9IChzZWxmLl9hbW91bnQgPCAwKSA/IFwiYWJvdmVcIiA6IFwiYmVsb3dcIjtcblxuXHRyZXR1cm4gTWF0aC5hYnMoc2VsZi5fYW1vdW50KSArIFwicHggXCIgKyBkaXJlY3Rpb24gKyBcIiBcIjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUG9zaXRpb24oc2VsZiwgdmFsdWUpIHtcblx0aWYgKHNlbGYuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIHJldHVybiBQb3NpdGlvbi54KHZhbHVlKTtcblx0ZWxzZSByZXR1cm4gUG9zaXRpb24ueSh2YWx1ZSk7XG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUUVsZW1lbnQgPSByZXF1aXJlKFwiLi9xX2VsZW1lbnQuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRnJhbWUoZG9tRWxlbWVudCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBPYmplY3QgXSk7XG5cdGVuc3VyZS50aGF0KGRvbUVsZW1lbnQudGFnTmFtZSA9PT0gXCJJRlJBTUVcIiwgXCJET00gZWxlbWVudCBtdXN0IGJlIGFuIGlmcmFtZVwiKTtcblxuXHR0aGlzLl9kb21FbGVtZW50ID0gZG9tRWxlbWVudDtcblx0dGhpcy5fbG9hZGVkID0gZmFsc2U7XG5cdHRoaXMuX3JlbW92ZWQgPSBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIGxvYWRlZChzZWxmKSB7XG5cdHNlbGYuX2xvYWRlZCA9IHRydWU7XG5cdHNlbGYuX2RvY3VtZW50ID0gc2VsZi5fZG9tRWxlbWVudC5jb250ZW50RG9jdW1lbnQ7XG5cdHNlbGYuX29yaWdpbmFsQm9keSA9IHNlbGYuX2RvY3VtZW50LmJvZHkuaW5uZXJIVE1MO1xufVxuXG5NZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUocGFyZW50RWxlbWVudCwgd2lkdGgsIGhlaWdodCwgb3B0aW9ucywgY2FsbGJhY2spIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgT2JqZWN0LCBOdW1iZXIsIE51bWJlciwgWyBPYmplY3QsIEZ1bmN0aW9uIF0sIFsgdW5kZWZpbmVkLCBGdW5jdGlvbiBdIF0pO1xuXG5cdGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0Y2FsbGJhY2sgPSBvcHRpb25zO1xuXHRcdG9wdGlvbnMgPSB7fTtcblx0fVxuXG5cdC8vIFdPUktBUk9VTkQgTW9iaWxlIFNhZmFyaSA3LjAuMDogd2VpcmQgc3R5bGUgcmVzdWx0cyBvY2N1ciB3aGVuIGJvdGggc3JjIGFuZCBzdHlsZXNoZWV0IGFyZSBsb2FkZWQgKHNlZSB0ZXN0KVxuXHRlbnN1cmUudGhhdChcblx0XHQhKG9wdGlvbnMuc3JjICYmIG9wdGlvbnMuc3R5bGVzaGVldCksXG5cdFx0XCJDYW5ub3Qgc3BlY2lmeSBIVE1MIFVSTCBhbmQgc3R5bGVzaGVldCBVUkwgc2ltdWx0YW5lb3VzbHkgZHVlIHRvIE1vYmlsZSBTYWZhcmkgaXNzdWVcIlxuXHQpO1xuXG5cdGlmIChvcHRpb25zLnNyYyl7XG5cdFx0ZW5zdXJlLnRoYXQodXJsRXhpc3RzKG9wdGlvbnMuc3JjKSwgXCJUaGUgSFRNTCBkb2N1bWVudCBkb2VzIG5vdCBleGlzdCBhdCB0aGUgc3BlY2lmaWVkIFVSTFwiKTtcblx0fVxuXG5cdGlmIChvcHRpb25zLnN0eWxlc2hlZXQpe1xuXHRcdGVuc3VyZS50aGF0KHVybEV4aXN0cyhvcHRpb25zLnN0eWxlc2hlZXQpLCBcIlRoZSBzdHlsZXNoZWV0IGRvZXMgbm90IGV4aXN0IGF0IHRoZSBzcGVjaWZpZWQgVVJMXCIpO1xuXHR9XG5cblx0dmFyIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7XG5cdGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCB3aWR0aCk7XG5cdGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcblx0aWZyYW1lLnNldEF0dHJpYnV0ZShcImZyYW1lYm9yZGVyXCIsIFwiMFwiKTsgICAgLy8gV09SS0FST1VORCBJRSA4OiBkb24ndCBpbmNsdWRlIGZyYW1lIGJvcmRlciBpbiBwb3NpdGlvbiBjYWxjc1xuXHRpZiAob3B0aW9ucy5zcmMpIGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgb3B0aW9ucy5zcmMpO1xuXG5cdHZhciBmcmFtZSA9IG5ldyBNZShpZnJhbWUpO1xuXHRhZGRMb2FkTGlzdGVuZXIoaWZyYW1lLCBvbkZyYW1lTG9hZCk7XG5cdHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcblx0cmV0dXJuIGZyYW1lO1xuXG5cdGZ1bmN0aW9uIG9uRnJhbWVMb2FkKCkge1xuXHRcdC8vIFdPUktBUk9VTkQgTW9iaWxlIFNhZmFyaSA3LjAuMCwgU2FmYXJpIDYuMi4wLCBDaHJvbWUgMzguMC4yMTI1OiBmcmFtZSBpcyBsb2FkZWQgc3luY2hyb25vdXNseVxuXHRcdC8vIFdlIGZvcmNlIGl0IHRvIGJlIGFzeW5jaHJvbm91cyBoZXJlXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdGxvYWRlZChmcmFtZSk7XG5cdFx0XHRsb2FkU3R5bGVzaGVldChmcmFtZSwgb3B0aW9ucy5zdHlsZXNoZWV0LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgZnJhbWUpO1xuXHRcdFx0fSk7XG5cdFx0fSwgMCk7XG5cdH1cbn07XG5cbmZ1bmN0aW9uIHVybEV4aXN0cyh1cmwpIHtcbiAgdmFyIGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgaHR0cC5vcGVuKCdIRUFEJywgdXJsLCBmYWxzZSk7XG4gIGh0dHAuc2VuZCgpO1xuICByZXR1cm4gaHR0cC5zdGF0dXMgIT09IDQwNDtcbn1cblxuZnVuY3Rpb24gbG9hZFN0eWxlc2hlZXQoc2VsZiwgdXJsLCBjYWxsYmFjaykge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBNZSwgWyB1bmRlZmluZWQsIFN0cmluZyBdLCBGdW5jdGlvbiBdKTtcblx0aWYgKHVybCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gY2FsbGJhY2soKTtcblxuXHR2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xuXHRhZGRMb2FkTGlzdGVuZXIobGluaywgb25MaW5rTG9hZCk7XG5cdGxpbmsuc2V0QXR0cmlidXRlKFwicmVsXCIsIFwic3R5bGVzaGVldFwiKTtcblx0bGluay5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dC9jc3NcIik7XG5cdGxpbmsuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCB1cmwpO1xuXG5cdGRvY3VtZW50SGVhZChzZWxmKS5hcHBlbmRDaGlsZChsaW5rKTtcblxuXHRmdW5jdGlvbiBvbkxpbmtMb2FkKCkge1xuXHRcdGNhbGxiYWNrKCk7XG5cdH1cbn1cblxuTWUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHR0aGlzLl9kb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IHRoaXMuX29yaWdpbmFsQm9keTtcbn07XG5cbk1lLnByb3RvdHlwZS50b0RvbUVsZW1lbnQgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0ZW5zdXJlTm90UmVtb3ZlZCh0aGlzKTtcblxuXHRyZXR1cm4gdGhpcy5fZG9tRWxlbWVudDtcbn07XG5cbk1lLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0ZW5zdXJlTG9hZGVkKHRoaXMpO1xuXHRpZiAodGhpcy5fcmVtb3ZlZCkgcmV0dXJuO1xuXG5cdHRoaXMuX3JlbW92ZWQgPSB0cnVlO1xuXHR0aGlzLl9kb21FbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fZG9tRWxlbWVudCk7XG59O1xuXG5NZS5wcm90b3R5cGUuYWRkRWxlbWVudCA9IGZ1bmN0aW9uKGh0bWwpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nIF0pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0dmFyIHRlbXBFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblx0dGVtcEVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbDtcblx0ZW5zdXJlLnRoYXQoXG5cdFx0dGVtcEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPT09IDEsXG5cdFx0XCJFeHBlY3RlZCBvbmUgZWxlbWVudCwgYnV0IGdvdCBcIiArIHRlbXBFbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoICsgXCIgKFwiICsgaHRtbCArIFwiKVwiXG5cdCk7XG5cblx0dmFyIGluc2VydGVkRWxlbWVudCA9IHRlbXBFbGVtZW50LmNoaWxkTm9kZXNbMF07XG5cdHRoaXMuX2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW5zZXJ0ZWRFbGVtZW50KTtcblx0cmV0dXJuIG5ldyBRRWxlbWVudChpbnNlcnRlZEVsZW1lbnQsIGh0bWwpO1xufTtcblxuTWUucHJvdG90eXBlLmdldEVsZW1lbnQgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcgXSk7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHR2YXIgbm9kZXMgPSB0aGlzLl9kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcblx0ZW5zdXJlLnRoYXQobm9kZXMubGVuZ3RoID09PSAxLCBcIkV4cGVjdGVkIG9uZSBlbGVtZW50IHRvIG1hdGNoICdcIiArIHNlbGVjdG9yICsgXCInLCBidXQgZm91bmQgXCIgKyBub2Rlcy5sZW5ndGgpO1xuXHRyZXR1cm4gbmV3IFFFbGVtZW50KG5vZGVzWzBdLCBzZWxlY3Rvcik7XG59O1xuXG4vLyBXT1JLQVJPVU5EIElFODogbm8gYWRkRXZlbnRMaXN0ZW5lcigpXG5mdW5jdGlvbiBhZGRMb2FkTGlzdGVuZXIoaWZyYW1lRG9tLCBjYWxsYmFjaykge1xuXHRpZiAoaWZyYW1lRG9tLmFkZEV2ZW50TGlzdGVuZXIpIGlmcmFtZURvbS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBjYWxsYmFjayk7XG5cdGVsc2UgaWZyYW1lRG9tLmF0dGFjaEV2ZW50KFwib25sb2FkXCIsIGNhbGxiYWNrKTtcbn1cblxuLy8gV09SS0FST1VORCBJRTg6IG5vIGRvY3VtZW50LmhlYWRcbmZ1bmN0aW9uIGRvY3VtZW50SGVhZChzZWxmKSB7XG5cdGlmIChzZWxmLl9kb2N1bWVudC5oZWFkKSByZXR1cm4gc2VsZi5fZG9jdW1lbnQuaGVhZDtcblx0ZWxzZSByZXR1cm4gc2VsZi5fZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImhlYWRcIik7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZVVzYWJsZShzZWxmKSB7XG5cdGVuc3VyZUxvYWRlZChzZWxmKTtcblx0ZW5zdXJlTm90UmVtb3ZlZChzZWxmKTtcbn1cblxuZnVuY3Rpb24gZW5zdXJlTG9hZGVkKHNlbGYpIHtcblx0ZW5zdXJlLnRoYXQoc2VsZi5fbG9hZGVkLCBcIkZyYW1lIG5vdCBsb2FkZWQ6IFdhaXQgZm9yIGZyYW1lIGNyZWF0aW9uIGNhbGxiYWNrIHRvIGV4ZWN1dGUgYmVmb3JlIHVzaW5nIGZyYW1lXCIpO1xufVxuXG5mdW5jdGlvbiBlbnN1cmVOb3RSZW1vdmVkKHNlbGYpIHtcblx0ZW5zdXJlLnRoYXQoIXNlbGYuX3JlbW92ZWQsIFwiQXR0ZW1wdGVkIHRvIHVzZSBmcmFtZSBhZnRlciBpdCB3YXMgcmVtb3ZlZFwiKTtcbn1cbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIGNhbWVsY2FzZSA9IHJlcXVpcmUoXCIuLi92ZW5kb3IvY2FtZWxjYXNlLTEuMC4xLW1vZGlmaWVkLmpzXCIpO1xudmFyIEVsZW1lbnRFZGdlID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvcnMvZWxlbWVudF9lZGdlLmpzXCIpO1xudmFyIEVsZW1lbnRDZW50ZXIgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9ycy9lbGVtZW50X2NlbnRlci5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBRRWxlbWVudChkb21FbGVtZW50LCBkZXNjcmlwdGlvbikge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBPYmplY3QsIFsgU3RyaW5nIF0gXSk7XG5cblx0dGhpcy5fZG9tRWxlbWVudCA9IGRvbUVsZW1lbnQ7XG5cdHRoaXMuX2Rlc2NyaXB0aW9uID0gZGVzY3JpcHRpb247XG5cblx0dGhpcy50b3AgPSBFbGVtZW50RWRnZS50b3AodGhpcyk7XG5cdHRoaXMucmlnaHQgPSBFbGVtZW50RWRnZS5yaWdodCh0aGlzKTtcblx0dGhpcy5ib3R0b20gPSBFbGVtZW50RWRnZS5ib3R0b20odGhpcyk7XG5cdHRoaXMubGVmdCA9IEVsZW1lbnRFZGdlLmxlZnQodGhpcyk7XG5cblx0dGhpcy5jZW50ZXIgPSBFbGVtZW50Q2VudGVyLngodGhpcyk7XG59O1xuXG5NZS5wcm90b3R5cGUuYXNzZXJ0ID0gZnVuY3Rpb24gYXNzZXJ0KGV4cGVjdGVkLCBtZXNzYWdlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgW3VuZGVmaW5lZCwgU3RyaW5nXSBdKTtcblx0aWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCkgbWVzc2FnZSA9IFwiRGlmZmVyZW5jZXMgZm91bmRcIjtcblxuXHR2YXIgZGlmZiA9IHRoaXMuZGlmZihleHBlY3RlZCk7XG5cdGlmIChkaWZmICE9PSBcIlwiKSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSArIFwiOlxcblwiICsgZGlmZik7XG59O1xuXG5NZS5wcm90b3R5cGUuZGlmZiA9IGZ1bmN0aW9uIGRpZmYoZXhwZWN0ZWQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgT2JqZWN0IF0pO1xuXG5cdHZhciByZXN1bHQgPSBbXTtcblx0dmFyIGtleXMgPSBvYmplY3RLZXlzKGV4cGVjdGVkKTtcblx0dmFyIGtleSwgb25lRGlmZiwgY29uc3RyYWludDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0a2V5ID0ga2V5c1tpXTtcblx0XHRjb25zdHJhaW50ID0gdGhpc1trZXldO1xuXHRcdGVuc3VyZS50aGF0KGNvbnN0cmFpbnQgIT09IHVuZGVmaW5lZCwgXCInXCIgKyBrZXkgKyBcIicgaXMgdW5rbm93biBhbmQgY2FuJ3QgYmUgdXNlZCB3aXRoIGRpZmYoKVwiKTtcblx0XHRvbmVEaWZmID0gY29uc3RyYWludC5kaWZmKGV4cGVjdGVkW2tleV0pO1xuXHRcdGlmIChvbmVEaWZmICE9PSBcIlwiKSByZXN1bHQucHVzaChvbmVEaWZmKTtcblx0fVxuXG5cdHJldHVybiByZXN1bHQuam9pbihcIlxcblwiKTtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXRSYXdTdHlsZSA9IGZ1bmN0aW9uIGdldFJhd1N0eWxlKHN0eWxlTmFtZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcgXSk7XG5cblx0dmFyIHN0eWxlcztcblx0dmFyIHJlc3VsdDtcblxuXHQvLyBXT1JLQVJPVU5EIElFODogbm8gZ2V0Q29tcHV0ZWRTdHlsZSgpXG5cdGlmICh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSkge1xuXHRcdHN0eWxlcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuX2RvbUVsZW1lbnQpO1xuXHRcdHJlc3VsdCA9IHN0eWxlcy5nZXRQcm9wZXJ0eVZhbHVlKHN0eWxlTmFtZSk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0c3R5bGVzID0gdGhpcy5fZG9tRWxlbWVudC5jdXJyZW50U3R5bGU7XG5cdFx0cmVzdWx0ID0gc3R5bGVzW2NhbWVsY2FzZShzdHlsZU5hbWUpXTtcblx0fVxuXHRpZiAocmVzdWx0ID09PSBudWxsIHx8IHJlc3VsdCA9PT0gdW5kZWZpbmVkKSByZXN1bHQgPSBcIlwiO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuTWUucHJvdG90eXBlLmdldFJhd1Bvc2l0aW9uID0gZnVuY3Rpb24gZ2V0UmF3UG9zaXRpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0Ly8gV09SS0FST1VORCBJRTg6IE5vIFRleHRSZWN0YW5nbGUuaGVpZ2h0IG9yIC53aWR0aFxuXHR2YXIgcmVjdCA9IHRoaXMuX2RvbUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdHJldHVybiB7XG5cdFx0bGVmdDogcmVjdC5sZWZ0LFxuXHRcdHJpZ2h0OiByZWN0LnJpZ2h0LFxuXHRcdHdpZHRoOiByZWN0LndpZHRoICE9PSB1bmRlZmluZWQgPyByZWN0LndpZHRoIDogcmVjdC5yaWdodCAtIHJlY3QubGVmdCxcblxuXHRcdHRvcDogcmVjdC50b3AsXG5cdFx0Ym90dG9tOiByZWN0LmJvdHRvbSxcblx0XHRoZWlnaHQ6IHJlY3QuaGVpZ2h0ICE9PSB1bmRlZmluZWQgPyByZWN0LmhlaWdodCA6IHJlY3QuYm90dG9tIC0gcmVjdC50b3Bcblx0fTtcbn07XG5cbk1lLnByb3RvdHlwZS50b0RvbUVsZW1lbnQgPSBmdW5jdGlvbiB0b0RvbUVsZW1lbnQoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHRoaXMuX2RvbUVsZW1lbnQ7XG59O1xuXG5NZS5wcm90b3R5cGUuZGVzY3JpcHRpb24gPSBmdW5jdGlvbiBkZXNjcmlwdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX2Rlc2NyaXB0aW9uO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHRoaXMuX2RvbUVsZW1lbnQub3V0ZXJIVE1MO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh0aGF0KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE1lIF0pO1xuXG5cdHJldHVybiB0aGlzLl9kb21FbGVtZW50ID09PSB0aGF0Ll9kb21FbGVtZW50O1xufTtcblxuLy8gV09SS0FST1VORCBJRTg6IE5vIE9iamVjdC5rZXlzXG5mdW5jdGlvbiBvYmplY3RLZXlzKG9iaikge1xuXHRpZiAoT2JqZWN0LmtleXMpIHJldHVybiBPYmplY3Qua2V5cyhvYmopO1xuXG5cdC8vIEZyb20gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2tleXNcbiAgdmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcbiAgICAgIGhhc0RvbnRFbnVtQnVnID0gISh7IHRvU3RyaW5nOiBudWxsIH0pLnByb3BlcnR5SXNFbnVtZXJhYmxlKCd0b1N0cmluZycpLFxuICAgICAgZG9udEVudW1zID0gW1xuICAgICAgICAndG9TdHJpbmcnLFxuICAgICAgICAndG9Mb2NhbGVTdHJpbmcnLFxuICAgICAgICAndmFsdWVPZicsXG4gICAgICAgICdoYXNPd25Qcm9wZXJ0eScsXG4gICAgICAgICdpc1Byb3RvdHlwZU9mJyxcbiAgICAgICAgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJyxcbiAgICAgICAgJ2NvbnN0cnVjdG9yJ1xuICAgICAgXSxcbiAgICAgIGRvbnRFbnVtc0xlbmd0aCA9IGRvbnRFbnVtcy5sZW5ndGg7XG5cbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnICYmICh0eXBlb2Ygb2JqICE9PSAnZnVuY3Rpb24nIHx8IG9iaiA9PT0gbnVsbCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3Qua2V5cyBjYWxsZWQgb24gbm9uLW9iamVjdCcpO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IFtdLCBwcm9wLCBpO1xuXG4gIGZvciAocHJvcCBpbiBvYmopIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSB7XG4gICAgICByZXN1bHQucHVzaChwcm9wKTtcbiAgICB9XG4gIH1cblxuICBpZiAoaGFzRG9udEVudW1CdWcpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgZG9udEVudW1zTGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgZG9udEVudW1zW2ldKSkge1xuICAgICAgICByZXN1bHQucHVzaChkb250RW51bXNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufSIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIEZyYW1lID0gcmVxdWlyZShcIi4vZnJhbWUuanNcIik7XG5cbmV4cG9ydHMuY3JlYXRlRnJhbWUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0LCBvcHRpb25zLCBjYWxsYmFjaykge1xuXHRyZXR1cm4gRnJhbWUuY3JlYXRlKGRvY3VtZW50LmJvZHksIHdpZHRoLCBoZWlnaHQsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzIFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBTZWUgTElDRU5TRS5UWFQgZm9yIGRldGFpbHMuXG5cInVzZSBzdHJpY3RcIjtcblxuLy8gUnVudGltZSBhc3NlcnRpb25zIGZvciBwcm9kdWN0aW9uIGNvZGUuIChDb250cmFzdCB0byBhc3NlcnQuanMsIHdoaWNoIGlzIGZvciB0ZXN0IGNvZGUuKVxuXG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuL3NoaW0uanNcIik7XG5cbmV4cG9ydHMudGhhdCA9IGZ1bmN0aW9uKHZhcmlhYmxlLCBtZXNzYWdlKSB7XG5cdGlmIChtZXNzYWdlID09PSB1bmRlZmluZWQpIG1lc3NhZ2UgPSBcIkV4cGVjdGVkIGNvbmRpdGlvbiB0byBiZSB0cnVlXCI7XG5cblx0aWYgKHZhcmlhYmxlID09PSBmYWxzZSkgdGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihleHBvcnRzLnRoYXQsIG1lc3NhZ2UpO1xuXHRpZiAodmFyaWFibGUgIT09IHRydWUpIHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oZXhwb3J0cy50aGF0LCBcIkV4cGVjdGVkIGNvbmRpdGlvbiB0byBiZSB0cnVlIG9yIGZhbHNlXCIpO1xufTtcblxuZXhwb3J0cy51bnJlYWNoYWJsZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0aWYgKCFtZXNzYWdlKSBtZXNzYWdlID0gXCJVbnJlYWNoYWJsZSBjb2RlIGV4ZWN1dGVkXCI7XG5cblx0dGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihleHBvcnRzLnVucmVhY2hhYmxlLCBtZXNzYWdlKTtcbn07XG5cbmV4cG9ydHMuc2lnbmF0dXJlID0gZnVuY3Rpb24oYXJncywgc2lnbmF0dXJlKSB7XG5cdHNpZ25hdHVyZSA9IHNpZ25hdHVyZSB8fCBbXTtcblx0dmFyIGV4cGVjdGVkQXJnQ291bnQgPSBzaWduYXR1cmUubGVuZ3RoO1xuXHR2YXIgYWN0dWFsQXJnQ291bnQgPSBhcmdzLmxlbmd0aDtcblxuXHRpZiAoYWN0dWFsQXJnQ291bnQgPiBleHBlY3RlZEFyZ0NvdW50KSB7XG5cdFx0dGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihcblx0XHRcdGV4cG9ydHMuc2lnbmF0dXJlLFxuXHRcdFx0XCJGdW5jdGlvbiBjYWxsZWQgd2l0aCB0b28gbWFueSBhcmd1bWVudHM6IGV4cGVjdGVkIFwiICsgZXhwZWN0ZWRBcmdDb3VudCArIFwiIGJ1dCBnb3QgXCIgKyBhY3R1YWxBcmdDb3VudFxuXHRcdCk7XG5cdH1cblxuXHR2YXIgdHlwZSwgYXJnLCBuYW1lO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNpZ25hdHVyZS5sZW5ndGg7IGkrKykge1xuXHRcdHR5cGUgPSBzaWduYXR1cmVbaV07XG5cdFx0YXJnID0gYXJnc1tpXTtcblx0XHRuYW1lID0gXCJBcmd1bWVudCBcIiArIGk7XG5cblx0XHRpZiAoIXNoaW0uYXJyYXlEb3RJc0FycmF5KHR5cGUpKSB0eXBlID0gWyB0eXBlIF07XG5cdFx0aWYgKCF0eXBlTWF0Y2hlcyh0eXBlLCBhcmcsIG5hbWUpKSB7XG5cdFx0XHR0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKFxuXHRcdFx0XHRleHBvcnRzLnNpZ25hdHVyZSxcblx0XHRcdFx0bmFtZSArIFwiIGV4cGVjdGVkIFwiICsgZXhwbGFpblR5cGUodHlwZSkgKyBcIiwgYnV0IHdhcyBcIiArIGV4cGxhaW5BcmcoYXJnKVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cbn07XG5cbmZ1bmN0aW9uIHR5cGVNYXRjaGVzKHR5cGUsIGFyZykge1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAob25lVHlwZU1hdGNoZXModHlwZVtpXSwgYXJnKSkgcmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xuXG5cdGZ1bmN0aW9uIG9uZVR5cGVNYXRjaGVzKHR5cGUsIGFyZykge1xuXHRcdHN3aXRjaCAoZ2V0VHlwZShhcmcpKSB7XG5cdFx0XHRjYXNlIFwiYm9vbGVhblwiOiByZXR1cm4gdHlwZSA9PT0gQm9vbGVhbjtcblx0XHRcdGNhc2UgXCJzdHJpbmdcIjogcmV0dXJuIHR5cGUgPT09IFN0cmluZztcblx0XHRcdGNhc2UgXCJudW1iZXJcIjogcmV0dXJuIHR5cGUgPT09IE51bWJlcjtcblx0XHRcdGNhc2UgXCJhcnJheVwiOiByZXR1cm4gdHlwZSA9PT0gQXJyYXk7XG5cdFx0XHRjYXNlIFwiZnVuY3Rpb25cIjogcmV0dXJuIHR5cGUgPT09IEZ1bmN0aW9uO1xuXHRcdFx0Y2FzZSBcIm9iamVjdFwiOiByZXR1cm4gdHlwZSA9PT0gT2JqZWN0IHx8IGFyZyBpbnN0YW5jZW9mIHR5cGU7XG5cdFx0XHRjYXNlIFwidW5kZWZpbmVkXCI6IHJldHVybiB0eXBlID09PSB1bmRlZmluZWQ7XG5cdFx0XHRjYXNlIFwibnVsbFwiOiByZXR1cm4gdHlwZSA9PT0gbnVsbDtcblx0XHRcdGNhc2UgXCJOYU5cIjogcmV0dXJuIGlzTmFOKHR5cGUpO1xuXG5cdFx0XHRkZWZhdWx0OiBleHBvcnRzLnVucmVhY2hhYmxlKCk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGV4cGxhaW5UeXBlKHR5cGUpIHtcblx0dmFyIGpvaW5lciA9IFwiXCI7XG5cdHZhciByZXN1bHQgPSBcIlwiO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpKyspIHtcblx0XHRyZXN1bHQgKz0gam9pbmVyICsgZXhwbGFpbk9uZVR5cGUodHlwZVtpXSk7XG5cdFx0am9pbmVyID0gKGkgPT09IHR5cGUubGVuZ3RoIC0gMikgPyBcIiwgb3IgXCIgOiBcIiwgXCI7XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcblxuXHRmdW5jdGlvbiBleHBsYWluT25lVHlwZSh0eXBlKSB7XG5cdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0XHRjYXNlIEJvb2xlYW46IHJldHVybiBcImJvb2xlYW5cIjtcblx0XHRcdGNhc2UgU3RyaW5nOiByZXR1cm4gXCJzdHJpbmdcIjtcblx0XHRcdGNhc2UgTnVtYmVyOiByZXR1cm4gXCJudW1iZXJcIjtcblx0XHRcdGNhc2UgQXJyYXk6IHJldHVybiBcImFycmF5XCI7XG5cdFx0XHRjYXNlIEZ1bmN0aW9uOiByZXR1cm4gXCJmdW5jdGlvblwiO1xuXHRcdFx0Y2FzZSBudWxsOiByZXR1cm4gXCJudWxsXCI7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRpZiAodHlwZW9mIHR5cGUgPT09IFwibnVtYmVyXCIgJiYgaXNOYU4odHlwZSkpIHJldHVybiBcIk5hTlwiO1xuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gc2hpbS5mdW5jdGlvbkRvdE5hbWUodHlwZSkgKyBcIiBpbnN0YW5jZVwiO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGV4cGxhaW5BcmcoYXJnKSB7XG5cdHZhciB0eXBlID0gZ2V0VHlwZShhcmcpO1xuXHRpZiAodHlwZSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIHR5cGU7XG5cblx0dmFyIHByb3RvdHlwZSA9IHNoaW0ub2JqZWN0RG90R2V0UHJvdG90eXBlT2YoYXJnKTtcblx0aWYgKHByb3RvdHlwZSA9PT0gbnVsbCkgcmV0dXJuIFwiYW4gb2JqZWN0IHdpdGhvdXQgYSBwcm90b3R5cGVcIjtcblx0ZWxzZSB7XG5cdFx0cmV0dXJuIHNoaW0uZnVuY3Rpb25Eb3ROYW1lKHByb3RvdHlwZS5jb25zdHJ1Y3RvcikgKyBcIiBpbnN0YW5jZVwiO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldFR5cGUodmFyaWFibGUpIHtcblx0dmFyIHR5cGUgPSB0eXBlb2YgdmFyaWFibGU7XG5cdGlmICh2YXJpYWJsZSA9PT0gbnVsbCkgdHlwZSA9IFwibnVsbFwiO1xuXHRpZiAoc2hpbS5hcnJheURvdElzQXJyYXkodmFyaWFibGUpKSB0eXBlID0gXCJhcnJheVwiO1xuXHRpZiAodHlwZSA9PT0gXCJudW1iZXJcIiAmJiBpc05hTih2YXJpYWJsZSkpIHR5cGUgPSBcIk5hTlwiO1xuXHRyZXR1cm4gdHlwZTtcbn1cblxuXG4vKioqKiovXG5cbnZhciBFbnN1cmVFeGNlcHRpb24gPSBleHBvcnRzLkVuc3VyZUV4Y2VwdGlvbiA9IGZ1bmN0aW9uKGZuVG9SZW1vdmVGcm9tU3RhY2tUcmFjZSwgbWVzc2FnZSkge1xuXHRpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIGZuVG9SZW1vdmVGcm9tU3RhY2tUcmFjZSk7XG5cdGVsc2UgdGhpcy5zdGFjayA9IChuZXcgRXJyb3IoKSkuc3RhY2s7XG5cdHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59O1xuRW5zdXJlRXhjZXB0aW9uLnByb3RvdHlwZSA9IHNoaW0ub2JqZWN0RG90Q3JlYXRlKEVycm9yLnByb3RvdHlwZSk7XG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW5zdXJlRXhjZXB0aW9uO1xuRW5zdXJlRXhjZXB0aW9uLnByb3RvdHlwZS5uYW1lID0gXCJFbnN1cmVFeGNlcHRpb25cIjtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxuLy8gV09SS0FST1VORCBJRSA4OiBubyBPYmplY3QuY3JlYXRlKClcbmV4cG9ydHMub2JqZWN0RG90Q3JlYXRlID0gZnVuY3Rpb24gb2JqZWN0RG90Q3JlYXRlKHByb3RvdHlwZSkge1xuXHRpZiAoT2JqZWN0LmNyZWF0ZSkgcmV0dXJuIE9iamVjdC5jcmVhdGUocHJvdG90eXBlKTtcblxuXHR2YXIgVGVtcCA9IGZ1bmN0aW9uIFRlbXAoKSB7fTtcblx0VGVtcC5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG5cdHJldHVybiBuZXcgVGVtcCgpO1xufTtcblxuLy8gV09SS0FST1VORCBJRSA4LCBJRSA5LCBJRSAxMCwgSUUgMTE6IG5vIGZ1bmN0aW9uLm5hbWVcbmV4cG9ydHMuZnVuY3Rpb25Eb3ROYW1lID0gZnVuY3Rpb24gZnVuY3Rpb25Eb3ROYW1lKGZuKSB7XG5cdGlmIChmbi5uYW1lKSByZXR1cm4gZm4ubmFtZTtcblxuXHQvLyBUaGlzIHdvcmthcm91bmQgaXMgYmFzZWQgb24gY29kZSBieSBKYXNvbiBCdW50aW5nIGV0IGFsLCBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zMzI0Mjlcblx0dmFyIGZ1bmNOYW1lUmVnZXggPSAvZnVuY3Rpb25cXHMrKC57MSx9KVxccypcXCgvO1xuXHR2YXIgcmVzdWx0cyA9IChmdW5jTmFtZVJlZ2V4KS5leGVjKChmbikudG9TdHJpbmcoKSk7XG5cdHJldHVybiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDEpID8gcmVzdWx0c1sxXSA6IFwiPGFub24+XCI7XG59O1xuXG4vLyBXT1JLQVJPVU5EIElFIDg6IG5vIEFycmF5LmlzQXJyYXlcbmV4cG9ydHMuYXJyYXlEb3RJc0FycmF5ID0gZnVuY3Rpb24gYXJyYXlEb3RJc0FycmF5KHRoaW5nKSB7XG5cdGlmIChBcnJheS5pc0FycmF5KSByZXR1cm4gQXJyYXkuaXNBcnJheSh0aGluZyk7XG5cblx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0aGluZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG4vLyBXT1JLQVJPVU5EIElFIDg6IG5vIE9iamVjdC5nZXRQcm90b3R5cGVPZlxuZXhwb3J0cy5vYmplY3REb3RHZXRQcm90b3R5cGVPZiA9IGZ1bmN0aW9uIG9iamVjdERvdEdldFByb3RvdHlwZU9mKG9iaikge1xuXHRpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKSByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaik7XG5cblx0dmFyIHJlc3VsdCA9IG9iai5jb25zdHJ1Y3RvciA/IG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgOiBudWxsO1xuXHRyZXR1cm4gcmVzdWx0IHx8IG51bGw7XG59OyIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcblxudmFyIFhfRElNRU5TSU9OID0gXCJ4XCI7XG52YXIgWV9ESU1FTlNJT04gPSBcInlcIjtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBQb3NpdGlvbihkaW1lbnNpb24sIHZhbHVlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZywgTnVtYmVyIF0pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fcG9zaXRpb24gPSB2YWx1ZTtcbn07XG5cbk1lLnggPSBmdW5jdGlvbiB4KHZhbHVlKSB7XG5cdHJldHVybiBuZXcgTWUoWF9ESU1FTlNJT04sIHZhbHVlKTtcbn07XG5cbk1lLnkgPSBmdW5jdGlvbiB5KHZhbHVlKSB7XG5cdHJldHVybiBuZXcgTWUoWV9ESU1FTlNJT04sIHZhbHVlKTtcbn07XG5cbk1lLnByb3RvdHlwZS5wbHVzID0gZnVuY3Rpb24gcGx1cyhhbW91bnQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTnVtYmVyIF0pO1xuXG5cdHJldHVybiBuZXcgTWUodGhpcy5fZGltZW5zaW9uLCB0aGlzLl9wb3NpdGlvbiArIGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbiB2YWx1ZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbk1lLnByb3RvdHlwZS5kaWZmID0gZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBNZSBdKTtcblx0ZW5zdXJlLnRoYXQodGhpcy5fZGltZW5zaW9uID09PSBleHBlY3RlZC5fZGltZW5zaW9uLCBcIkNhbid0IGNvbXBhcmUgWCBkaW1lbnNpb24gdG8gWSBkaW1lbnNpb25cIik7XG5cblx0dmFyIGFjdHVhbFZhbHVlID0gdGhpcy5fcG9zaXRpb247XG5cdHZhciBleHBlY3RlZFZhbHVlID0gZXhwZWN0ZWQuX3Bvc2l0aW9uO1xuXG5cdHZhciBkaXJlY3Rpb247XG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSBkaXJlY3Rpb24gPSBleHBlY3RlZFZhbHVlID4gYWN0dWFsVmFsdWUgPyBcInRvIHRoZSBsZWZ0XCIgOiBcInRvIHRoZSByaWdodFwiO1xuXHRlbHNlIGRpcmVjdGlvbiA9IGV4cGVjdGVkVmFsdWUgPiBhY3R1YWxWYWx1ZSA/IFwibG93ZXJcIiA6IFwiaGlnaGVyXCI7XG5cblx0dmFyIHZhbHVlID0gTWF0aC5hYnMoZXhwZWN0ZWRWYWx1ZSAtIGFjdHVhbFZhbHVlKTtcblx0aWYgKHZhbHVlID09PSAwKSByZXR1cm4gXCJcIjtcblx0ZWxzZSByZXR1cm4gdmFsdWUgKyBcInB4IFwiICsgZGlyZWN0aW9uO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh0aGF0KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE1lIF0pO1xuXG5cdHJldHVybiAodGhpcy5kaWZmKHRoYXQpID09PSBcIlwiKTtcbn07XG5cbk1lLnByb3RvdHlwZS5kZXNjcmliZU1hdGNoID0gZnVuY3Rpb24gZGVzY3JpYmVNYXRjaCgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gXCJiZSBcIiArIHRoaXM7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gdGhpcy5fcG9zaXRpb24gKyBcInB4XCI7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyKSB7XG5cdGlmIChzdHIubGVuZ3RoID09PSAxKSB7XG5cdFx0cmV0dXJuIHN0cjtcblx0fVxuXG5cdHJldHVybiBzdHJcblx0LnJlcGxhY2UoL15bXy5cXC0gXSsvLCAnJylcblx0LnRvTG93ZXJDYXNlKClcblx0LnJlcGxhY2UoL1tfLlxcLSBdKyhcXHd8JCkvZywgZnVuY3Rpb24gKG0sIHAxKSB7XG5cdFx0cmV0dXJuIHAxLnRvVXBwZXJDYXNlKCk7XG5cdH0pO1xufTtcbiJdfQ==
