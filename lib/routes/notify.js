'use strict';

var interval = require('../interval'),
    Node = require('../Node');

var notify = function (peer) {
  return function (req, res) {
    var possiblePredecessor = new Node({
      host: req.body.host,
      port: req.body.port
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
