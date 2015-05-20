'use strict';

var interval = require('../interval'),
    remote = require('../remote');

var stabilize = function (node) {
  return function (req, res) {
    remote(node.successor.host, node.successor.port).run('predecessor', function (err, predecessor) {
      if (err) {
        node.fixSuccessor();
        return res.sendStatus(500);
      }

      if (
        (predecessor) &&
        (interval({ left: node.self.id, right: node.successor.id, type: 'open' }).contains(predecessor.id))
      ) {
        node.setSuccessor({
          host: predecessor.host,
          port: predecessor.port
        });
      }

      remote(node.successor.host, node.successor.port).run('notify', {
        host: node.self.host,
        port: node.self.port
      }, function (errNotify) {
        if (errNotify) {
          node.fixSuccessor();
          return res.sendStatus(500);
        }

        res.sendStatus(200);
      });
    });
  };
};

module.exports = stabilize;
