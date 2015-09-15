'use strict';

const Endpoint = require('../Endpoint'),
    interval = require('../interval'),
    remote = require('../remote');

const findPredecessor = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    const id = req.body.id;

    if (!id) {
      return res.sendStatus(400);
    }

    let possiblePredecessor = new Endpoint({
      host: peer.self.host,
      port: peer.self.port
    });

    const findPredecessorRecursive = function () {
      remote(possiblePredecessor.host, possiblePredecessor.port).run('successor', (err, successor) => {
        if (err) {
          return res.sendStatus(500);
        }

        if (interval({ left: possiblePredecessor.id, right: successor.id, type: 'leftopen' }).contains(id)) {
          return res.send(possiblePredecessor);
        }

        remote(possiblePredecessor.host, possiblePredecessor.port).run('closest-preceding-finger', {
          id
        }, (errClosestPrecedingFinger, closestPrecedingFinger) => {
          if (errClosestPrecedingFinger) {
            return res.sendStatus(500);
          }

          possiblePredecessor = new Endpoint({
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
