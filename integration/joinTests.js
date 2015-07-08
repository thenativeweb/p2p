'use strict';

var assert = require('assertthat');

var system = require('./system');

/* eslint-disable no-process-env  */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/* eslint-enable no-process-env  */

suite('join', function () {
  this.timeout(5 * 60 * 1000);

  test('connects 2 peers.', function (done) {
    system.runApplication(function (errRunApplication1, application1) {
      assert.that(errRunApplication1).is.null();

      system.runApplication(function (errRunApplication2, application2) {
        assert.that(errRunApplication2).is.null();

        application2.self(function (errSelf2, self2) {
          assert.that(errSelf2).is.null();

          application1.join(self2, function (errJoin1) {
            assert.that(errJoin1).is.null();

            setTimeout(function () {
              application1.predecessor(function (errPredecessor1, predecessor1) {
                assert.that(errPredecessor1).is.null();
                assert.that(predecessor1).is.equalTo(self2);

                application1.stop(function (errStop1) {
                  assert.that(errStop1).is.null();

                  application2.stop(function (errStop2) {
                    assert.that(errStop2).is.null();
                    done();
                  });
                });
              });
            }, 5 * 1000);
          });
        });
      });
    });
  });
});
