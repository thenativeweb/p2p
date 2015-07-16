'use strict';

var async = require('async'),
    cmp = require('comparejs');

var waitUntil = function (peers) {
  return {
    have: function (fn) {
      return {
        equalTo: function (expected, callback) {
          async.each(peers, function (peer, doneEach) {
            var actual;

            async.until(
              function () {
                return cmp.eq(actual, expected);
              },
              function (doneUntil) {
                peer[fn](function (err, result) {
                  if (err) {
                    return doneUntil(err);
                  }
                  actual = result;
                  doneUntil(null);
                });
              },
              doneEach
            );
          }, callback);
        }
      };
    }
  };
};

module.exports = waitUntil;
