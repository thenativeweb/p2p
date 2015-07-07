'use strict';

var fs = require('fs'),
    path = require('path');

var p2p = require('../../../lib/p2p');

p2p.peer({
  host: 'localhost',
  port: 3000,
  privateKey: fs.readFileSync(path.join(__dirname, '..', '..', '..', 'keys', 'localhost.selfsigned', 'privateKey.pem')),
  certificate: fs.readFileSync(path.join(__dirname, '..', '..', '..', 'keys', 'localhost.selfsigned', 'certificate.pem')),
  serviceInterval: '1s'
});
