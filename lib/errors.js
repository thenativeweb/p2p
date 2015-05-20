'use strict';

var defekt = require('defekt');

var errors = defekt([
  'InvalidOperation',
  'ServiceTemporarilyUnavailable',
  'UnexpectedStatusCode'
]);

module.exports = errors;
