'use strict';

var errors = require('./errors');

var interval = function (options) {
  var left,
      right;

  if (!options) {
    throw new Error('Options are missing.');
  }
  if (options.left === undefined) {
    throw new Error('Left is missing.');
  }
  if (options.right === undefined) {
    throw new Error('Right is missing.');
  }
  if (options.type === undefined) {
    throw new Error('Type is missing.');
  }

  left = options.left;
  right = options.right;

  switch (options.type) {
    case 'open':
      return {
        contains: function (id) {
          /* eslint-disable no-nested-ternary */
          return left < right ? left < id && id < right :
                 left > right ? left < id || id < right :
                 left !== id;
          /* eslint-enable no-nested-ternary */
        }
      };
    case 'leftopen':
      return {
        contains: function (id) {
          /* eslint-disable no-nested-ternary */
          return left < right ? left < id && id <= right :
                 left > right ? left < id || id <= right :
                 true;
          /* eslint-enable no-nested-ternary */
        }
      };
    default:
      throw new errors.InvalidOperation('Unknown interval type ' + options.type + '.');
  }
};

module.exports = interval;
