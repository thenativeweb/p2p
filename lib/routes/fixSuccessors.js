'use strict';

const Endpoint = require('../Endpoint'),
    remote = require('../remote');

const fixSuccessors = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    remote(peer.successor.host, peer.successor.port).run('successors', (err, successors) => {
      if (err) {
        peer.fixSuccessor();
        return res.sendStatus(500);
      }

      successors.unshift(new Endpoint({
        host: peer.successor.host,
        port: peer.successor.port
      }));

      peer.successors = successors;

      res.sendStatus(200);
    });
  };
};

module.exports = fixSuccessors;
