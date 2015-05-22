'use strict';

var metadata = function (node) {
  return function (req, res) {
    res.send(node.metadata);
  };
};

module.exports = metadata;
