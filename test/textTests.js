'use strict';

var assert = require('assertthat');

var text = require('../lib/text');

suite('text', function () {
  test('is an object.', function (done) {
    assert.that(text).is.ofType('object');
    done();
  });

  suite('repeat', function () {
    test('is a function.', function (done) {
      assert.that(text.repeat).is.ofType('function');
      done();
    });

    test('throws an error if the character is missing.', function (done) {
      assert.that(function () {
        text.repeat();
      }).is.throwing('Character is missing.');
      done();
    });

    test('throws an error if the count is missing.', function (done) {
      assert.that(function () {
        text.repeat('a');
      }).is.throwing('Count is missing.');
      done();
    });

    test('returns a character repeated n times.', function (done) {
      assert.that(text.repeat('a', 5)).is.equalTo('aaaaa');
      done();
    });

    test('returns an empty string if count is 0.', function (done) {
      assert.that(text.repeat('a', 0)).is.equalTo('');
      done();
    });
  });

  suite('padLeft', function () {
    test('is a function.', function (done) {
      assert.that(text.padLeft).is.ofType('function');
      done();
    });

    test('throws an error if the text is missing.', function (done) {
      assert.that(function () {
        text.padLeft();
      }).is.throwing('Text is missing.');
      done();
    });

    test('throws an error if the character is missing.', function (done) {
      assert.that(function () {
        text.padLeft('foo');
      }).is.throwing('Character is missing.');
      done();
    });

    test('throws an error if the length is missing.', function (done) {
      assert.that(function () {
        text.padLeft('foo', ' ');
      }).is.throwing('Length is missing.');
      done();
    });

    test('returns the given text padded to the specified length.', function (done) {
      assert.that(text.padLeft('foo', ' ', 5)).is.equalTo('  foo');
      done();
    });

    test('returns the given text if the specified length matches the text length.', function (done) {
      assert.that(text.padLeft('foo', ' ', 3)).is.equalTo('foo');
      done();
    });

    test('returns the given text shortened if the specified length is less than the text length.', function (done) {
      assert.that(text.padLeft('foo', ' ', 2)).is.equalTo('fo');
      done();
    });
  });
});
