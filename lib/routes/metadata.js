'use strict';

var metadata = function (peer) {
  return function (req, res) {
    res.send(peer.metadata);
  };
};

module.exports = metadata;
