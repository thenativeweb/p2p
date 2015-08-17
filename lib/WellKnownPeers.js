'use strict';

var _ = require('lodash');

var WellKnownPeers = function () {
  this.peers = [];
};

WellKnownPeers.prototype.get = function () {
  return _.cloneDeep(this.peers);
};

WellKnownPeers.prototype.add = function (newPeers) {
  var i,
      newPeer;

  newPeers = _.flatten([ newPeers ]);

  for (i = 0; i < newPeers.length; i++) {
    newPeer = newPeers[i];
    if (!_.find(this.peers, newPeer)) {
      this.peers.push({ host: newPeer.host, port: newPeer.port });
    }
  }
};

module.exports = WellKnownPeers;
