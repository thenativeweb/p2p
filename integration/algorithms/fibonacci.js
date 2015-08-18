'use strict';

var fibonacci = function (iterations) {
  var i,
      result = [ 1, 1 ];

  for (i = 2; i < (iterations + 2); i++) {
    result[i] = result[i - 1] + result[i - 2];
  }

  return result.slice(2);
};

module.exports = fibonacci;
