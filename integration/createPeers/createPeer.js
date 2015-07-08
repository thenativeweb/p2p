'use strict';

var freeport = require('freeport');

var Peer = require('./Peer');

var createPeer = function (callback) {
  freeport(function (errFreeport, port) {
    var peer;

    if (errFreeport) {
      return callback(errFreeport);
    }

    peer = new Peer({ port: port });
    peer.start(function (errStart) {
      if (errStart) {
        return callback(errStart);
      }

      callback(null, peer);
    });
  });
};

module.exports = createPeer;
