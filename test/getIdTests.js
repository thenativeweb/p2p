'use strict';

var assert = require('assertthat');

var getId = require('../lib/getId');

suite('getId', function () {
  test('is a function.', function (done) {
    assert.that(getId).is.ofType('function');
    done();
  });

  test('throws an error if the value is missing.', function (done) {
    assert.that(function () {
      getId();
    }).is.throwing('Value is missing.');
    done();
  });

  test('returns the SHA1 of the given value.', function (done) {
    assert.that(getId('foo')).is.equalTo('0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33');
    done();
  });
});
