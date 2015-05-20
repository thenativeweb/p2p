'use strict';

var predecessor = function (node) {
  return function (req, res) {
    res.send(node.predecessor);
  };
};

module.exports = predecessor;
