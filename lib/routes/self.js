'use strict';

var self = function (peer) {
  return function (req, res) {
    res.send(peer.self);
  };
};

module.exports = self;
