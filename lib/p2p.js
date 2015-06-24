'use strict';

var https = require('https');

var flaschenpost = require('flaschenpost'),
    parse = require('parse-duration'),
    Timer = require('timer2');

var Peer = require('./Peer'),
    remote = require('./remote');

var logger = flaschenpost.getLogger();

var p2p = {};

p2p.peer = function (options) {
  var peer,
      serviceInterval,
      wobbleFactor;

  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.privateKey) {
    throw new Error('Private key is missing.');
  }
  if (!options.certificate) {
    throw new Error('Certificate is missing.');
  }

  peer = new Peer(options);

  serviceInterval = parse(options.serviceInterval || '30s');
  wobbleFactor = serviceInterval * 0.5;

  https.createServer({
    key: options.privateKey,
    cert: options.certificate
  }, peer.app).listen(peer.self.port, function () {
    logger.info('Server started.', {
      node: peer.self,
      status: peer.status()
    });
  });

  [ 'stabilize', 'fix-successors', 'fix-fingers', 'fix-predecessor' ].forEach(function (fn) {
    new Timer(serviceInterval, { variation: wobbleFactor }).on('tick', function () {
      remote(peer.self.host, peer.self.port).run(fn, function () {});
    });
  });

  return peer;
};

module.exports = p2p;
