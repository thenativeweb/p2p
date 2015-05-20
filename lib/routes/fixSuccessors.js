'use strict';

var Node = require('../Node'),
    remote = require('../remote');

var fixSuccessors = function (node) {
  return function (req, res) {
    remote(node.successor.host, node.successor.port).run('successors', function (err, successors) {
      if (err) {
        node.fixSuccessor();
        return res.sendStatus(500);
      }

      successors.unshift(new Node({
        host: node.successor.host,
        port: node.successor.port
      }));

      node.successors = successors;

      res.sendStatus(200);
    });
  };
};

module.exports = fixSuccessors;
