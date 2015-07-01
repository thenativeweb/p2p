'use strict';

var fs = require('fs'),
    path = require('path');

var async = require('async'),
    freeport = require('freeport'),
    requireAll = require('require-all');

var p2p = require('../../../lib/p2p');

var certificate = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'keys', 'localhost.selfsigned', 'certificate.pem')),
    privateKey = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'keys', 'localhost.selfsigned', 'privateKey.pem'));

var env = requireAll(path.join(__dirname, 'env'));

var createPeers = function (options, callback) {
  async.times(options.count, function (n, next) {
    freeport(function (err, port) {
      if (err) {
        return next(err);
      }

      next(null, p2p.peer({
        host: 'localhost',
        port: port,
        privateKey: privateKey,
        certificate: certificate,
        serviceInterval: '500ms'
      }));
    });
  }, function (err, peers) {
    if (err) {
      return callback(err);
    }
    callback(null, peers, env);
  });
};

module.exports = createPeers;
