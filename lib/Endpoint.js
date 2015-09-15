'use strict';

var getId = require('./getId');

var Endpoint = function (options) {
  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.host) {
    throw new Error('Host is missing.');
  }
  if (!options.port) {
    throw new Error('Port is missing.');
  }

  this.host = options.host;
  this.port = options.port;
  this.id = getId(this.host + ':' + this.port);
};

module.exports = Endpoint;
