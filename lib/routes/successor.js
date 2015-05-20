'use strict';

var successor = function (node) {
  return function (req, res) {
    res.send(node.successor);
  };
};

module.exports = successor;
