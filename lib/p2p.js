'use strict';

var http = require('http'),
    https = require('https');

var _ = require('lodash'),
    flaschenpost = require('flaschenpost'),
    parse = require('parse-duration'),
    Timer = require('timer2');

var Peer = require('./Peer'),
    remote = require('./remote');

var logger = flaschenpost.getLogger();

var p2p = {};

p2p.peer = function (options) {
  var peer,
      serviceInterval,
      useHttps,
      wobbleFactor;

  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.privateKey && options.certificate) {
    throw new Error('Private key is missing.');
  }
  if (options.privateKey && !options.certificate) {
    throw new Error('Certificate is missing.');
  }

  useHttps = !!options.privateKey && !!options.certificate;

  peer = new Peer(options);

  serviceInterval = parse(options.serviceInterval || '30s');
  wobbleFactor = serviceInterval * 0.5;

  if (useHttps) {
    https.createServer({
      key: options.privateKey,
      cert: options.certificate
    }, peer.app).listen(peer.self.port, function () {
      logger.info('Server started.', {
        node: peer.self,
        status: peer.status()
      });
    });
  } else {
    http.createServer(peer.app).listen(peer.self.port, function () {
      logger.info('Server started.', {
        node: peer.self,
        status: peer.status()
      });
    });
  }

  remote.protocol = useHttps ? 'https' : 'http';

  [ 'stabilize', 'fix-successors', 'fix-fingers', 'fix-predecessor' ].forEach(function (fn) {
    new Timer(serviceInterval, { variation: wobbleFactor }).on('tick', function () {
      remote(peer.self.host, peer.self.port).run(fn, function () {});
    });
  });

  new Timer(serviceInterval, { variation: wobbleFactor }).on('tick', function () {
    remote(peer.self.host, peer.self.port).run('join', _.sample(peer.wellKnownPeers.get()), function () {});
  });

  return peer;
};

module.exports = p2p;
