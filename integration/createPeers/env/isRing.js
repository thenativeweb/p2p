'use strict';

var _ = require('lodash'),
    async = require('async');

var isRing = function (peers, callback) {
  var peersWithNeighbours = [];

  var getPeerIndex = function (self) {
    if (!self) {
      return -1;
    }

    return _.findIndex(peersWithNeighbours, function (peerWithNeighbours) {
      return (
        peerWithNeighbours.self.host === self.host &&
        peerWithNeighbours.self.port === self.port
      );
    });
  };

  async.each(peers, function (peer, doneEach) {
    async.parallel({
      self: function (done) {
        peer.self(done);
      },
      successor: function (done) {
        peer.successor(done);
      },
      predecessor: function (done) {
        peer.predecessor(done);
      }
    }, function (err, peerWithNeighbours) {
      if (err) {
        return doneEach(err);
      }
      peersWithNeighbours.push(peerWithNeighbours);
      doneEach(null);
    });
  }, function (err) {
    var predecessors,
        successors;

    if (err) {
      return callback(err);
    }

    peersWithNeighbours.forEach(function (peerWithNeighbours) {
      peerWithNeighbours.successor = getPeerIndex(peerWithNeighbours.successor);
      peerWithNeighbours.predecessor = getPeerIndex(peerWithNeighbours.predecessor);
    });

    successors = _.uniq(_.pluck(peersWithNeighbours, 'successor').sort(), true);
    if (successors[0] !== 0 || successors.length !== peers.length) {
      return callback(new Error('Successors are broken.'));
    }

    predecessors = _.uniq(_.pluck(peersWithNeighbours, 'predecessor').sort(), true);
    if (predecessors[0] !== 0 || predecessors.length !== peers.length) {
      return callback(new Error('Predecessors are broken.'));
    }

    callback(null);
  });
};

module.exports = isRing;
