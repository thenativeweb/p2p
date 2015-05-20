'use strict';

var remote = require('../remote');

var fixPredecessor = function (node) {
  return function (req, res) {
    if (!node.predecessor) {
      return res.sendStatus(200);
    }

    remote(node.predecessor.host, node.predecessor.port).run('self', function (err) {
      if (err) {
        node.setPredecessor(undefined);
      }

      res.sendStatus(200);
    });
  };
};

module.exports = fixPredecessor;
