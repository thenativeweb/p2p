'use strict';

var async = require('async');

var createPeer = require('./createPeer'),
    env = require('./env');

var createPeers = function (options, callback) {
  async.times(options.count, function (n, next) {
    createPeer(next);
  }, function (err, peers) {
    if (err) {
      return callback(err);
    }
    callback(null, peers, env);
  });
};

module.exports = createPeers;
