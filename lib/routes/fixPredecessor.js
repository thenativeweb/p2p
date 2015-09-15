'use strict';

const remote = require('../remote');

const fixPredecessor = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    if (!peer.predecessor) {
      return res.sendStatus(200);
    }

    remote(peer.predecessor.host, peer.predecessor.port).run('self', err => {
      if (err) {
        peer.setPredecessor(undefined);
      }

      res.sendStatus(200);
    });
  };
};

module.exports = fixPredecessor;
