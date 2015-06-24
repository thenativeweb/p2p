'use strict';

var self = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return function (req, res) {
    res.send(peer.self);
  };
};

module.exports = self;
