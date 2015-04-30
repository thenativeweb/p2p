'use strict';

var getId = require('./getId');

var Node = function (options) {
  this.host = options.host;
  this.port = options.port;
  this.id = getId(this.host + ':' + this.port);
};

module.exports = Node;
