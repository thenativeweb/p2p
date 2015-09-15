'use strict';

var Endpoint = require('../Endpoint'),
    hex = require('../hex'),
    random = require('../random'),
    remote = require('../remote');

var fixFingers = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return function (req, res) {
    var i = random(2, 160),
        id = hex.add(peer.self.id, hex.pow2x(i - 1));

    remote(peer.self.host, peer.self.port).run('find-successor', {
      id: id
    }, function (err, successor) {
      if (err) {
        return res.sendStatus(500);
      }

      peer.fingers[i] = new Endpoint({
        host: successor.host,
        port: successor.port
      });

      res.sendStatus(200);
    });
  };
};

module.exports = fixFingers;
