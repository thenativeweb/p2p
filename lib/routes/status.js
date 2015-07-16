'use strict';

var status = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return function (req, res) {
    res.send({
      status: peer.status()
    });
  };
};

module.exports = status;
