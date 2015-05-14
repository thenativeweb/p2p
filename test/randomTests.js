'use strict';

var assert = require('assertthat');

var random = require('../lib/random');

suite('random', function () {
  test('is a function.', function (done) {
    assert.that(random).is.ofType('function');
    done();
  });

  test('throws an error if the minimum is missing.', function (done) {
    assert.that(function () {
      random();
    }).is.throwing('Minimum is missing.');
    done();
  });

  test('throws an error if the maximum is missing.', function (done) {
    assert.that(function () {
      random(23);
    }).is.throwing('Maximum is missing.');
    done();
  });

  test('returns a number between min and max.', function (done) {
    assert.that(random(23, 42)).is.between(23, 42);
    done();
  });
});
