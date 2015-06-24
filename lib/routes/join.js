'use strict';

var remote = require('../remote');

var join = function (peer) {
  return function (req, res) {
    var host = req.body.host,
        port = req.body.port;

    remote(host, port).run('find-successor', {
      id: peer.self.id
    }, function (err, successor) {
      if (err) {
        return res.sendStatus(500);
      }

      peer.setPredecessor(undefined);
      peer.setSuccessor({
        host: successor.host,
        port: successor.port
      });

      res.sendStatus(200);
    });
  };
};

module.exports = join;
