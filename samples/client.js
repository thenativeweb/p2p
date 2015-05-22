'use strict';

var url = require('url');

var flaschenpost = require('flaschenpost'),
    processEnv = require('processenv'),
    request = require('request'),
    uuid = require('uuidv4');

var logger = flaschenpost.getLogger();

var port = processEnv('PORT') || 3000;

var job = {
  id: process.argv[2] || uuid(),
  data: process.argv[3] || 'foo'
};

request.post(url.format({
  protocol: 'http',
  hostname: 'localhost',
  port: port,
  pathname: '/get-node-for'
}), {
  body: { value: job.id },
  json: true
}, function (errGetNodeFor, resGetNodeFor, node) {
  if (errGetNodeFor) {
    logger.fatal('Failed to get the responsible node.', errGetNodeFor);
    /*eslint-disable no-process-exit*/
    process.exit(1);
    /*eslint-enable no-process-exit*/
  }

  request.post(url.format({
    protocol: 'http',
    hostname: node.host,
    port: node.port,
    pathname: '/job'
  }), {
    body: job,
    json: true
  }, function (errJob, resJob) {
    if (errJob || (resJob.statusCode !== 200)) {
      logger.fatal('Failed to send job.', errJob);
      /*eslint-disable no-process-exit*/
      process.exit(1);
      /*eslint-enable no-process-exit*/
    }

    logger.info('Sent job {{job.id}} to {{target.host}}:{{target.port}}.', {
      job: job,
      target: node
    });
  });
});
