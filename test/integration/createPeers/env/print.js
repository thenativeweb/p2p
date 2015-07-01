'use strict';

var util = require('util');

var buntstift = require('buntstift');

var format = function (peer) {
  return util.format('%s:%s', peer ? peer.host : '-', peer ? peer.port : '-');
};

var print = function (peers) {
  buntstift.table([
    [ 'Self', 'Successor', 'Predecessor' ],
    []
  ].concat(peers.map(function (peer) {
    return [ format(peer.self), format(peer.successor), format(peer.predecessor) ];
  })));
};

module.exports = print;
