'use strict';

var url = require('url');

var flaschenpost = require('flaschenpost'),
    request = require('request');

var errors = require('./errors');

var logger = flaschenpost.getLogger();

var remote = function (host, port) {
  if (!host) {
    throw new Error('Host is missing.');
  }
  if (!port) {
    throw new Error('Port is missing.');
  }

  return {
    run: function (fn, args, callback) {
      var target;

      if (!fn) {
        throw new Error('Function is missing.');
      }
      if (!args) {
        throw new Error('Callback is missing.');
      }
      if (!callback) {
        callback = args;
        args = {};
      }

      target = url.format({
        protocol: remote.protocol,
        hostname: host,
        port: port,
        pathname: fn
      });

      request.post(target, {
        body: args,
        json: true,
        keepAlive: true
      }, function (err, res, body) {
        var errorSummary;

        if (err) {
          return callback(err);
        }

        res.resume();

        if (res.statusCode !== 200) {
          errorSummary = {
            url: target,
            args: args,
            statusCode: res.statusCode,
            body: (body || '').trim('\n')
          };

          logger.warn('Failed to call a remote function.', errorSummary);
          return callback(new errors.UnexpectedStatusCode('Unexpected status code ' + res.statusCode + ' when running ' + fn + '.', errorSummary));
        }

        callback(null, body);
      });
    }
  };
};

remote.protocol = 'https';

module.exports = remote;
