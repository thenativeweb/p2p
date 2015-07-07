'use strict';

var assert = require('assertthat');

var system = require('./system');

suite('join', function () {
  this.timeout(5 * 60 * 1000);

  test('foo', function (done) {
    system.runApplication(function (errRunApplication, application) {
      assert.that(errRunApplication).is.null();

      application.stop(function (errStop) {
        assert.that(errStop).is.null();
        done();
      });
    });
  });
});
