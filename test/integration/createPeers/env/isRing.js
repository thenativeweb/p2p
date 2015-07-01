'use strict';

var _ = require('lodash');

var isRing = function (peers) {
  var ringSize = peers.length;

  var getPeer = function (options) {
    return _.find(peers, function (peer) {
      return (
        peer.self.host === options.host &&
        peer.self.port === options.port
      );
    });
  };

  var isRingDirected = function (direction) {
    var currentPeer = peers[0];
    var numberOfPeersSeen = 0;

    /* eslint-disable no-constant-condition */
    while (true) {
    /* eslint-enable no-constant-condition */
      if (currentPeer.status() !== 'joined') {
        return false;
      }

      currentPeer = getPeer(currentPeer[direction]);
      numberOfPeersSeen++;

      // If we have seen all peers, the current peer has to be the first one
      // again.
      if (numberOfPeersSeen === ringSize) {
        return currentPeer === peers[0];
      }

      // If the current peer is the first one, but the number of seen peers is
      // too small (we know this, because otherwise the previous condition would
      // have been true), something obviously is wrong.
      if (currentPeer === peers[0]) {
        return false;
      }
    }
  };

  return isRingDirected('successor') && isRingDirected('predecessor');
};

module.exports = isRing;
