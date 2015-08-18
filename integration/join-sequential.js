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

          async.eachSeries(peers, function (peer, callbackEachSeries) {
            peersJoined.push(peer);
            if (peersJoined.length === 1) {
              return callbackEachSeries(null);
            }
            async.series([
              function (callbackSeries) {
                peer.join(peersJoined[0], callbackSeries);
              },
              function (callbackSeries) {
                env.waitUntil(peersJoined, { interval: configuration.serviceInterval }).have('status').equalTo({ status: 'joined' }, callbackSeries);
              },
              function (callbackSeries) {
                env.isRing(peersJoined, callbackSeries);
              }
            ], callbackEachSeries);
          }, callback);
        },
        function (callback) {
          env.stop(peers, callback);
        }
      ], done);
    });
  };
});
