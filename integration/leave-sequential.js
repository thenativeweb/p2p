'use strict';

var _ = require('lodash'),
    assert = require('assertthat'),
    async = require('async'),
    parse = require('parse-duration');

var createPeers = require('./createPeers'),
    runTest = require('./runTest');

runTest(__filename, function (configuration) {
  return function (done) {
    createPeers({ count: configuration.ringSize, serviceInterval: configuration.serviceInterval }, function (err, peers, env) {
      var peersJoined = _.clone(peers);

      assert.that(err).is.null();
      async.series([
        function (callback) {
          env.waitUntil(peers, { interval: configuration.serviceInterval }).have('status').equalTo({ status: 'lonely' }, callback);
        },
        function (callback) {
          env.formRing(peers, callback);
        },
        function (callback) {
          env.waitUntil(peers, { interval: configuration.serviceInterval }).have('status').equalTo({ status: 'joined' }, callback);
        },
        function (callback) {
          env.isRing(peers, callback);
        },
        function (callback) {
          async.eachSeries(peers, function (peer, callbackEachSeries) {
            if (peersJoined.length < 3) {
              return callbackEachSeries(null);
            }
            _.remove(peersJoined, peer);
            async.series([
              function (callbackSeries) {
                peer.stop(callbackSeries);
              },
              function (callbackSeries) {
                setTimeout(callbackSeries, parse(configuration.serviceInterval) * 1.5);
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
          env.stop(peersJoined, callback);
        }
      ], done);
    });
  };
});
