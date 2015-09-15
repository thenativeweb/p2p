'use strict';

const url = require('url');

const flaschenpost = require('flaschenpost'),
    request = require('request');

const errors = require('./errors');

const logger = flaschenpost.getLogger();

const remote = function (host, port) {
  if (!host) {
    throw new Error('Host is missing.');
  }
  if (!port) {
    throw new Error('Port is missing.');
  }

  return {
    run: (fn, args, callback) => {
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

      const target = url.format({
        protocol: remote.protocol,
        hostname: host,
        port,
        pathname: fn
      });

      request.post(target, {
        body: args,
        json: true,
        keepAlive: true
      }, (err, res, body) => {
        if (err) {
          return callback(err);
        }

        res.resume();

        if (res.statusCode !== 200) {
          const errorSummary = {
            url: target,
            args,
            statusCode: res.statusCode,
            body: (body || '').trim('\n')
          };

          logger.warn('Failed to call a remote function.', errorSummary);
          return callback(new errors.UnexpectedStatusCode(`Unexpected status code ${res.statusCode} when running ${fn}.`, errorSummary));
        }

        callback(null, body);
      });
    }
  };
};

remote.protocol = 'https';

module.exports = remote;
