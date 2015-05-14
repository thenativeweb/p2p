'use strict';

var assert = require('assertthat');

var Chord = require('../lib/Chord');

suite('Chord', function () {
  test('is a function.', function (done) {
    assert.that(Chord).is.ofType('function');
    done();
  });

  test.skip('...');
});
