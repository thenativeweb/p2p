'use strict';

var util = require('util');

var Peer = require('../../../lib/Peer');

var LonelyPeer = function (options) {
  Peer.call(this, options);
};

util.inherits(LonelyPeer, Peer);

module.exports = LonelyPeer;
