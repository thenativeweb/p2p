'use strict';

var flaschenpost = require('flaschenpost'),
    processEnv = require('processenv');

var Chord = require('../lib/Chord');

var logger = flaschenpost.getLogger();

var chord = new Chord({
  host: processEnv('HOST') || 'localhost',
  port: processEnv('PORT') || 3000,
  serviceInterval: processEnv('SERVICE_INTERVAL') || '30s'
});

chord.on('changed-successor', function (successor) {
  logger.info('Changed successor.', {
    successor: successor,
    status: chord.status()
  });
});

chord.on('changed-predecessor', function (predecessor) {
  logger.info('Changed predecessor.', {
    predecessor: predecessor,
    status: chord.status()
  });
});
