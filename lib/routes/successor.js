'use strict';

var successor = function (peer) {
  return function (req, res) {
    res.send(peer.successor);
  };
};

module.exports = successor;
