'use strict';

var assert = require('assertthat');

var createPeers = require('./createPeers');

/* eslint-disable no-process-env  */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/* eslint-enable no-process-env  */

suite('join', function () {
  this.timeout(5 * 60 * 1000);

  test('connects 2 peers.', function (done) {
    createPeers({ count: 2 }, function (errCreatePeers, peers, env) {
      assert.that(errCreatePeers).is.null();

      peers[0].join(peers[1], function (errJoin) {
        assert.that(errJoin).is.null();

        setTimeout(function () {
          peers[0].predecessor(function (errPredecessor1, predecessor1) {
            assert.that(errPredecessor1).is.null();

            env.stop(peers, function (errStop) {
              assert.that(errStop).is.null();
              done();
            });
          });
        }, 5 * 1000);
      });
    });
  });
});
