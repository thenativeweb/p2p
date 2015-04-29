'use strict';

var id = require('./id');

var Node = function (options) {
  this.host = options.host;
  this.port = options.port;
  this.id = id(this.host + ':' + this.port);
};

module.exports = Node;
