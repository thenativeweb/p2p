'use strict';

var _ = require('lodash');

var waitUntil = function (peers, predicate, callback) {
  peers = _.flatten([ peers ]);

  if (_.every(peers, predicate)) {
    return callback();
  }

  setTimeout(function () {
    waitUntil(peers, predicate, callback);
  }, 100);
};

module.exports = waitUntil;
