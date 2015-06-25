'use strict';

var predecessor = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return function (req, res) {
    res.send(peer.predecessor);
  };
};

module.exports = predecessor;
