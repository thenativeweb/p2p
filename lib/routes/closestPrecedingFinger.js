'use strict';

var interval = require('../interval');

var closestPrecedingFinger = function (node) {
  return function (req, res) {
    var finger,
        i,
        id = req.body.id;

    for (i = 160; i >= 1; i--) {
      finger = node.fingers[i];

      if (!finger) {
        continue;
      }

      if (interval({ left: node.self.id, right: id, type: 'open' }).contains(finger.id)) {
        return res.send(finger);
      }
    }

    res.send(node.self);
  };
};

module.exports = closestPrecedingFinger;
