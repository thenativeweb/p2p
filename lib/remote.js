'use strict';

var url = require('url');

var flaschenpost = require('flaschenpost'),
    request = require('request');

var errors = require('./errors');

var logger = flaschenpost.getLogger();

var remote = function (host, port) {
  return {
    run: function (fn, args, callback) {
      request.post(url.format({
        protocol: 'http',
        hostname: host,
        port: port,
        pathname: fn
      }), {
        body: args,
        json: true
      }, function (err, res, body) {
        if (err) {
          return callback(err);
        }

        res.resume();

        if (res.statusCode !== 200) {
          var errorSummary = {
            host: host,
            port: port,
            fn: fn,
            args: args,
            statusCode: res.statusCode,
            body: body.trim('\n')
          };

          logger.error('Remote call failed.', errorSummary);
          return callback(new errors.UnexpectedStatusCode('Unexpected status code ' + res.statusCode + ' when running ' + fn + '.', errorSummary));
        }

        callback(null, body);
      });
    }
  };
};

module.exports = remote;
