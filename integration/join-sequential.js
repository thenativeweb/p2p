'use strict';

var assert = require('assertthat'),
    async = require('async');

var createPeers = require('./createPeers'),
    runTest = require('./runTest');

runTest(__filename, function (configuration) {
  return function (done) {
    createPeers({ count: configuration.ringSize, serviceInterval: configuration.serviceInterval }, function (err, peers, env) {
      assert.that(err).is.null();
      async.series([
        function (callback) {
          env.waitUntil(peers, { interval: configuration.serviceInterval }).have('status').equalTo({ status: 'lonely' }, callback);
        },
        function (callback) {
          var peersJoined = [];
          async.eachSeries(peers, function (peer, callback) {
            peersJoined.push(peer);
            if (peersJoined.length === 1) {
              return callback(null);
            }
            async.series([
              function (callback) {
                peer.join(peersJoined[0], callback);
              },
              function (callback) {
                env.waitUntil(peersJoined, { interval: configuration.serviceInterval }).have('status').equalTo({ status: 'joined' }, callback);
              },
              function (callback) {
                env.isRing(peersJoined, callback);
              }
            ], callback);
          }, callback);
        },
        function (callback) {
          env.stop(peers, callback);
        }
      ], done);
    });
  };
});
