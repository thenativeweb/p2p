'use strict';

var successors = function (node) {
  return function (req, res) {
    res.send(node.successors.slice(0, 2));
  };
};

module.exports = successors;
