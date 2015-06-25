'use strict';

var util = require('util');

var Node = require('../../../lib/Node'),
    Peer = require('../../../lib/Peer');

var UnbalancedPeerWithoutPredecessor = function (options) {
  Peer.call(this, options);

  this.successor = new Node({ host: options.host, port: options.port + 1000 });
  this.predecessor = undefined;
};

util.inherits(UnbalancedPeerWithoutPredecessor, Peer);

module.exports = UnbalancedPeerWithoutPredecessor;
