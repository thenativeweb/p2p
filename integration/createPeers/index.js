'use strict';

var path = require('path');

var async = require('async'),
    requireAll = require('require-all');

var createPeer = require('./createPeer');

var env = requireAll(path.join(__dirname, 'env'));

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
