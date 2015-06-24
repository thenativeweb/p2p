'use strict';

var predecessor = function (peer) {
  return function (req, res) {
    res.send(peer.predecessor);
  };
};

module.exports = predecessor;
