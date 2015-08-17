'use strict';

var defekt = require('defekt');

var errors = defekt([
  'InvalidOperation',
  'UnexpectedStatusCode'
]);

module.exports = errors;
