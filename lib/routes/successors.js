'use strict';

var successors = function (peer) {
  return function (req, res) {
    res.send(peer.successors.slice(0, 16));
  };
};

module.exports = successors;
