'use strict';

var fs = require('fs'),
    http = require('http'),
    path = require('path');

var bodyParser = require('body-parser'),
    express = require('express'),
    flaschenpost = require('flaschenpost'),
    processEnv = require('processenv');

var Chord = require('../lib/Chord');

var httpPort = processEnv('HTTP_PORT') || 3000,
    p2pPort = processEnv('P2P_PORT') || 3001,
    p2pPortJoin = processEnv('P2P_PORT_JOIN') || p2pPort,
    serviceInterval = processEnv('SERVICE_INTERVAL') || '30s';

var certificate = fs.readFileSync(path.join(__dirname, '..', 'keys', 'localhost.selfsigned', 'certificate.pem')),
    privateKey = fs.readFileSync(path.join(__dirname, '..', 'keys', 'localhost.selfsigned', 'privateKey.pem'));

var app,
    chord,
    logger = flaschenpost.getLogger();

/*eslint-disable no-process-env*/
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/*eslint-enable no-process-env*/

chord = new Chord({
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

chord.on('changed-successor', function (successor) {
  logger.debug('Changed successor.', {
    successor: successor,
    status: chord.status()
  });
});

chord.on('changed-predecessor', function (predecessor) {
  logger.debug('Changed predecessor.', {
    predecessor: predecessor,
    status: chord.status()
  });
});

chord.join({ host: 'localhost', port: p2pPortJoin }, function (errJoin) {
  if (errJoin) {
    logger.fatal('Failed to join.', errJoin);
    /*eslint-disable no-process-exit*/
    process.exit(1);
    /*eslint-enable no-process-exit*/
  }

  app = express();

  app.use(bodyParser.json());

  app.post('/get-node-for', function (req, res) {
    chord.getNodeFor(req.body.value, function (errGetNodeFor, node, metadata) {
      if (errGetNodeFor) {
        return res.sendStatus(500);
      }
      res.send(metadata);
    });
  });

  app.post('/job', function (req, res) {
    logger.info('Received job.', req.body);
    res.sendStatus(200);
  });

  http.createServer(app).listen(httpPort);
});
