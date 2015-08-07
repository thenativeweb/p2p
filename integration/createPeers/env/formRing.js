'use strict';

var async = require('async'),
    flaschenpost = require('flaschenpost');

var logger = flaschenpost.getLogger();

var formRing = function (peers, callback) {
  logger.info('Forming ring...');
  async.each(peers, function (peer, done) {
    peer.join(peers[0], done);
  }, callback);
};

module.exports = formRing;
