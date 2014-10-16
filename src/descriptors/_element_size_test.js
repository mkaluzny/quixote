// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var quixote = require("../quixote.js");
var Descriptor = require("./descriptor.js");
var ElementSize = require("./element_size.js");
var Size = require("../values/size.js");

describe("ElementSize", function() {

	var WIDTH = 130;
	var HEIGHT = 60;

	var frame;
	var element;
	var width;
	var height;

	before(function(done) {
		frame = quixote.createFrame(500, 500, { stylesheet: "/base/src/__reset.css" }, done);
	});

	after(function() {
		frame.remove();
	});

	beforeEach(function() {
		frame.reset();

		frame.addElement(
			"<p id='one' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>one</p>"
		);
		element = frame.getElement("#one");
		width = ElementSize.x(element);
		height = ElementSize.y(element);
	});

	it("is a descriptor", function() {
		assert.type(width, Descriptor);
	});

	it("resolves to value", function() {
		assert.objEqual(width.value(), new Size(WIDTH), "width");
		assert.objEqual(height.value(), new Size(HEIGHT), "height");
	});

	it("converts comparison arguments", function() {
		assert.objEqual(width.convert(13), new Size(13), "converts numbers to sizes");

		assert.equal(width.convert(width), width, "should return descriptors as-is");
	});

	it("describes a match", function() {
		assert.equal(width.describeMatch(), "match " + width.toString() + " (130px)");
	});

	it("converts to string", function() {
		assert.equal(width.toString(), "width of element '" + element.description() + "'");
		assert.equal(height.toString(), "height of element '" + element.description() + "'");
	});

});