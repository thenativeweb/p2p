'use strict';

var metadata = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return function (req, res) {
    res.send(peer.metadata);
  };
};

module.exports = metadata;
