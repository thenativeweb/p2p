'use strict';

var interval = require('../interval'),
    remote = require('../remote');

var stabilize = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return function (req, res) {
    remote(peer.successor.host, peer.successor.port).run('predecessor', function (err, predecessor) {
      if (err) {
        peer.fixSuccessor();
        return res.sendStatus(500);
      }

      if (
        (predecessor) &&
        (interval({ left: peer.self.id, right: peer.successor.id, type: 'open' }).contains(predecessor.id))
      ) {
        peer.setSuccessor({
          host: predecessor.host,
          port: predecessor.port
        });
      }

      remote(peer.successor.host, peer.successor.port).run('notify', {
        host: peer.self.host,
        port: peer.self.port
      }, function (errNotify) {
        if (errNotify) {
          peer.fixSuccessor();
          return res.sendStatus(500);
        }

        res.sendStatus(200);
      });
    });
  };
};

module.exports = stabilize;
