'use strict';

var async = require('async');

var stop = function (peers, callback) {
  async.each(peers, function (peer, done) {
    peer.stop(done);
  }, callback);
};

module.exports = stop;
