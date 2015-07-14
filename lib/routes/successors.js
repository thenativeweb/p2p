'use strict';

var successors = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return function (req, res) {
    res.send(peer.successors.slice(0, 16));
  };
};

module.exports = successors;
