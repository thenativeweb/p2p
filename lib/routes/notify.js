'use strict';

var interval = require('../interval'),
    Node = require('../Node');

var notify = function (node) {
  return function (req, res) {
    var possiblePredecessor = new Node({
      host: req.body.host,
      port: req.body.port
    });

    if (!node.predecessor || interval({
      left: node.predecessor.id,
      right: node.self.id,
      type: 'open'
    }).contains(possiblePredecessor.id)) {
      node.predecessor = possiblePredecessor;
    }

    res.sendStatus(200);
  };
};

module.exports = notify;
