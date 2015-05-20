'use strict';

var self = function (node) {
  return function (req, res) {
    res.send(node.self);
  };
};

module.exports = self;
