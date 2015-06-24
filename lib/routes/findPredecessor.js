'use strict';

var interval = require('../interval'),
    Node = require('../Node'),
    remote = require('../remote');

var findPredecessor = function (peer) {
  return function (req, res) {
    var id = req.body.id;

    var possiblePredecessor = new Node({
      host: peer.self.host,
      port: peer.self.port
    });

    var findPredecessorRecursive = function () {
      remote(possiblePredecessor.host, possiblePredecessor.port).run('successor', function (err, successor) {
        if (err) {
          return res.sendStatus(500);
        }

        if (interval({ left: possiblePredecessor.id, right: successor.id, type: 'leftopen' }).contains(id)) {
          return res.send(possiblePredecessor);
        }

        remote(possiblePredecessor.host, possiblePredecessor.port).run('closest-preceding-finger', {
          id: id
        }, function (errClosestPrecedingFinger, closestPrecedingFinger) {
          if (errClosestPrecedingFinger) {
            return res.sendStatus(500);
          }

          possiblePredecessor = new Node({
            host: closestPrecedingFinger.host,
            port: closestPrecedingFinger.port
          });

          findPredecessorRecursive();
        });
      });
    };

    findPredecessorRecursive();
  };
};

module.exports = findPredecessor;
