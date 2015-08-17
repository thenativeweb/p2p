'use strict';

var fs = require('fs'),
    http = require('http'),
    path = require('path');

var bodyParser = require('body-parser'),
    express = require('express'),
    flaschenpost = require('flaschenpost'),
    processEnv = require('processenv');

var p2p = require('../../lib/p2p');

var httpPort = processEnv('HTTP_PORT') || 3000,
    p2pPort = processEnv('P2P_PORT') || httpPort + 1,
    p2pPortJoin = processEnv('P2P_PORT_JOIN') || 3001,
    serviceInterval = processEnv('SERVICE_INTERVAL') || '1s';

var certificate = fs.readFileSync(path.join(__dirname, '..', '..', 'keys', 'localhost.selfsigned', 'certificate.pem')),
    privateKey = fs.readFileSync(path.join(__dirname, '..', '..', 'keys', 'localhost.selfsigned', 'privateKey.pem'));

var app,
    logger = flaschenpost.getLogger(),
    peer;

/* eslint-disable no-process-env */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/* eslint-enable no-process-env */

peer = p2p.peer({
  host: 'localhost',
  port: p2pPort,
  privateKey: privateKey,
  certificate: certificate,
  metadata: {
    host: 'localhost',
    port: httpPort
  },
  serviceInterval: serviceInterval
});

peer.on('status', function (status) {
  logger.info('Changed status.', {
    status: status
  });
});

peer.on('environment::successor', function (successor) {
  logger.info('Changed successor.', {
    successor: successor
  });
});

peer.on('environment::predecessor', function (predecessor) {
  logger.info('Changed predecessor.', {
    predecessor: predecessor
  });
});

peer.handle.process = function (payload, done) {
  logger.info('Processing job.', payload);
  done(null, {
    node: peer.self
  });
};

peer.join({
  peer: { host: 'localhost', port: p2pPortJoin }
}, function (errJoin) {
  if (errJoin) {
    logger.fatal('Failed to join.', errJoin);
    /* eslint-disable no-process-exit */
    process.exit(1);
    /* eslint-enable no-process-exit */
  }

  app = express();

  app.use(bodyParser.json());

  app.post('/job', function (req, res) {
    peer.getPeerFor(req.body.value, function (errGetPeerFor, node) {
      if (errGetPeerFor) {
        return res.sendStatus(500);
      }
      peer.remote(node).run('process', req.body, function (err, result) {
        if (err) {
          return res.sendStatus(500);
        }
        res.send(result);
      });
    });
  });

  http.createServer(app).listen(httpPort);
});
