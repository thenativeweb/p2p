'use strict';

var async = require('async'),
    flaschenpost = require('flaschenpost');

var logger = flaschenpost.getLogger();

var stop = function (peers, callback) {
  logger.info('Stopping peers...');
  async.each(peers, function (peer, done) {
    peer.stop(done);
  }, callback);
};

module.exports = stop;
