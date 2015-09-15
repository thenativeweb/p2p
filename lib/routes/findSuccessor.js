'use strict';

const interval = require('../interval'),
    remote = require('../remote');

const findSuccessor = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    const id = req.body.id;

    if (!id) {
      return res.sendStatus(400);
    }

    if (interval({ left: peer.self.id, right: peer.successor.id, type: 'leftopen' }).contains(id)) {
      return res.send(peer.successor);
    }

    remote(peer.self.host, peer.self.port).run('find-predecessor', {
      id
    }, (err, predecessor) => {
      if (err) {
        return res.sendStatus(500);
      }

      remote(predecessor.host, predecessor.port).run('successor', (errSuccessor, successor) => {
        if (errSuccessor) {
          return res.sendStatus(500);
        }

        peer.wellKnownPeers.add(successor);
        res.send(successor);
      });
    });
  };
};

module.exports = findSuccessor;
