'use strict';

var processEnv = require('processenv');

var Chord = require('../lib/Chord');

var chord = new Chord({
  host: processEnv('HOST') || 'localhost',
  port: processEnv('PORT') || 3000,
  serviceInterval: processEnv('SERVICE_INTERVAL') || '30s'
});
