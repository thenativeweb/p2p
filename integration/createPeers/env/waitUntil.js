'use strict';

var async = require('async'),
    cmp = require('comparejs'),
    flaschenpost = require('flaschenpost'),
    parse = require('parse-duration');

var logger = flaschenpost.getLogger();

var waitUntil = function (peers, options) {
  return {
    have: function (fn) {
      return {
        equalTo: function (expected, callback) {
          logger.info('Waiting for peers to fulfill predicate...', { expected: expected });

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
