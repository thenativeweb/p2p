'use strict';

var remote = require('../remote');

var join = function (node) {
  return function (req, res) {
    var host = req.body.host,
        port = req.body.port;

    remote(host, port).run('find-successor', {
      id: node.self.id
    }, function (err, successor) {
      if (err) {
        return res.sendStatus(500);
      }

      node.setPredecessor(undefined);
      node.setSuccessor({
        host: successor.host,
        port: successor.port
      });

      res.sendStatus(200);
    });
  };
};

module.exports = join;
