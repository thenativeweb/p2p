'use strict';

var async = require('async');

var formRing = function (peers, callback) {
  async.each(peers, function (peer, done) {
    peer.join(peers[0], done);
  }, callback);
};

module.exports = formRing;
