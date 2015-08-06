'use strict';

var async = require('async'),
    cmp = require('comparejs'),
    parse = require('parse-duration');

var waitUntil = function (peers, options) {
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
                  setTimeout(function () {
                    doneUntil(null);
                  }, parse(options.interval));
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
