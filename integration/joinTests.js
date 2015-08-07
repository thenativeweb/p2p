'use strict';

var assert = require('assertthat'),
    async = require('async');

var createPeers = require('./createPeers');

var serviceInterval = '5s';

/* eslint-disable no-process-env  */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/* eslint-enable no-process-env  */

suite('join', function () {
  var run = function (numberOfPeers) {
    test('connects ' + numberOfPeers + ' peers.', function (done) {
      createPeers({ count: numberOfPeers, serviceInterval: serviceInterval }, function (err, peers, env) {
        assert.that(err).is.null();
        async.series([
          function (callback) {
            env.waitUntil(peers, { interval: serviceInterval }).have('status').equalTo({ status: 'lonely' }, callback);
          },
          function (callback) {
            env.formRing(peers, callback);
          },
          function (callback) {
            env.waitUntil(peers, { interval: serviceInterval }).have('status').equalTo({ status: 'joined' }, callback);
          },
          function (callback) {
            env.isRing(peers, callback);
          },
          function (callback) {
            env.stop(peers, callback);
          }
        ], done);
      });
    });
  };

  this.timeout(30 * 60 * 1000);

  run(100);
});
