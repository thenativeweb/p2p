'use strict';

var util = require('util');

var Endpoint = require('../../../lib/Endpoint'),
    Peer = require('../../../lib/Peer');

var JoinedPeer = function (options) {
  Peer.call(this, options);

  this.successor = new Endpoint({ host: options.host, port: options.port + 1000 });
  this.predecessor = new Endpoint({ host: options.host, port: options.port - 1000 });
};

util.inherits(JoinedPeer, Peer);

module.exports = JoinedPeer;
