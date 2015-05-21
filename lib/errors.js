'use strict';

var defekt = require('defekt');

var errors = defekt([
  'InvalidOperation',
  'JoinFailed',
  'UnexpectedStatusCode'
]);

module.exports = errors;
