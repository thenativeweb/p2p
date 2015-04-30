'use strict';

var errors = require('./errors');

var interval = function (options) {
  var left = options.left,
      right = options.right,
      type = options.type;

  return {
    contains: function (id) {
      /*eslint-disable no-nested-ternary*/
      switch (type) {
        case 'open':
          return left < right ? left < id && id < right :
                 left > right ? left < id || id < right :
                 left !== id;
        case 'leftopen':
          return left < right ? left < id && id <= right :
                 left > right ? left < id || id <= right :
                 true;
        default:
          throw new errors.InvalidOperation('Unknown interval type ' + type + '.');
      }
      /*eslint-enable no-nested-ternary*/
    }
  };
};

module.exports = interval;
