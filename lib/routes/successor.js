'use strict';

var successor = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return function (req, res) {
    res.send(peer.successor);
  };
};

module.exports = successor;
