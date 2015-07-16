'use strict';

var assert = require('assertthat'),
    async = require('async');

var createPeers = require('./createPeers');

/* eslint-disable no-process-env  */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/* eslint-enable no-process-env  */

suite('join', function () {
  this.timeout(5 * 60 * 1000);

  test('connects 2 peers.', function (done) {
    createPeers({ count: 2 }, function (err, peers, env) {
      assert.that(err).is.null();
      async.series([
        function (callback) {
          env.waitUntil(peers).have('status').equalTo({ status: 'lonely' }, callback);
        },
        function (callback) {
          peers[0].join(peers[1], callback);
        },
        function (callback) {
          env.waitUntil(peers).have('status').equalTo({ status: 'joined' }, callback);
        },
        function (callback) {
          peers[0].predecessor(callback);
        },
        function (callback) {
          env.stop(peers, callback);
        }
      ], done);
    });
  });
});
