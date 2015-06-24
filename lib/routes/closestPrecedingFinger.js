'use strict';

var interval = require('../interval');

var closestPrecedingFinger = function (peer) {
  return function (req, res) {
    var finger,
        i,
        id = req.body.id;

    for (i = 160; i >= 1; i--) {
      finger = peer.fingers[i];

      if (!finger) {
        continue;
      }

      if (interval({ left: peer.self.id, right: id, type: 'open' }).contains(finger.id)) {
        return res.send(finger);
      }
    }

    res.send(peer.self);
  };
};

module.exports = closestPrecedingFinger;
