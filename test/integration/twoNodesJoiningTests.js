'use strict';

var assert = require('assertthat');

var createPeers = require('./createPeers');

suite('integration', function () {
  test('two nodes joining.', function (done) {
    createPeers({ count: 2 }, function (errCreatePeers, peers, env) {
      assert.that(errCreatePeers).is.null();

      assert.that(peers[0].status()).is.equalTo('lonely');
      assert.that(peers[1].status()).is.equalTo('lonely');

      peers[0].join(peers[1].self, function (errJoin) {
        assert.that(errJoin).is.null();

        env.waitUntil(peers, function (peer) {
          return peer.status() === 'joined';
        }, function () {
          env.print(peers);
          assert.that(env.isRing(peers)).is.true();
          done();
        });
      });
    });
  });
});
