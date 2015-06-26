'use strict';

var interval = require('../interval'),
    Node = require('../Node');

var notify = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return function (req, res) {
    var host = req.body.host,
        port = req.body.port;

    var possiblePredecessor;

    if (!host) {
      return res.sendStatus(400);
    }
    if (!port) {
      return res.sendStatus(400);
    }

    possiblePredecessor = new Node({
      host: host,
      port: port
    });

    if (!peer.predecessor || interval({
      left: peer.predecessor.id,
      right: peer.self.id,
      type: 'open'
    }).contains(possiblePredecessor.id)) {
      peer.setPredecessor(possiblePredecessor);
    }

    res.sendStatus(200);
  };
};

module.exports = notify;
