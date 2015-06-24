'use strict';

var Node = require('../Node'),
    remote = require('../remote');

var fixSuccessors = function (peer) {
  return function (req, res) {
    remote(peer.successor.host, peer.successor.port).run('successors', function (err, successors) {
      if (err) {
        peer.fixSuccessor();
        return res.sendStatus(500);
      }

      successors.unshift(new Node({
        host: peer.successor.host,
        port: peer.successor.port
      }));

      peer.successors = successors;

      res.sendStatus(200);
    });
  };
};

module.exports = fixSuccessors;
