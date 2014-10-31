// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var PositionDescriptor = require("./position_descriptor.js");
var ElementCenter = require("./element_center.js");
var Position = require("../values/position.js");

describe("ElementCenter", function() {

	var element;
	var center;
	var middle;

	var CENTER = 85;
	var MIDDLE = 90;

	beforeEach(function() {
		var frame = reset.frame;

		frame.add(
			"<p id='one' style='position: absolute; left: 20px; width: 130px; top: 60px; height: 60px'>one</p>"
		);
		element = frame.get("#one");
		center = ElementCenter.x(element);
		middle = ElementCenter.y(element);
	});

	it("is a position descriptor", function() {
		assert.implements(center, PositionDescriptor);
	});

	it("resolves to value", function() {
		assert.objEqual(center.value(), Position.x(CENTER), "center");
		assert.objEqual(middle.value(), Position.y(MIDDLE), "middle");
	});

	it("converts comparison arguments", function() {
		assert.objEqual(center.convert(13, "number"), Position.x(13), "should convert numbers to x-positions");
		assert.objEqual(middle.convert(13, "number"), Position.y(13), "should convert numbers to y-positions");
	});

	it("converts to string", function() {
		assert.equal(center.toString(), "center of " + element, "center");
		assert.equal(middle.toString(), "middle of " + element, "middle");
	});

});