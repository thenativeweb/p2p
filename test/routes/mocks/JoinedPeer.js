'use strict';

var util = require('util');

var Node = require('../../../lib/Node'),
    Peer = require('../../../lib/Peer');

var JoinedPeer = function (options) {
  Peer.call(this, options);

  this.successor = new Node({ host: options.host, port: options.port + 1000 });
  this.predecessor = new Node({ host: options.host, port: options.port - 1000 });
};

util.inherits(JoinedPeer, Peer);

module.exports = JoinedPeer;
