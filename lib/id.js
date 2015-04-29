'use strict';

var crypto = require('crypto');

var id = function (value) {
  var sha1 = crypto.createHash('sha1');

  sha1.setEncoding('hex');
  sha1.end(value, 'utf8');

  return sha1.read();
};

module.exports = id;
