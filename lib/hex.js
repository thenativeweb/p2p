'use strict';

var hex = {};

// The following line can be removed when ES7 is available.
require('string.prototype.padleft').shim();

hex.add = function (left, right) {
  var carry = 0,
      digit,
      i,
      sum = '';

  if (left.length < right.length) {
    left = left.padLeft(right.length, '0');
  } else if (right.length < left.length) {
    right = right.padLeft(left.length, '0');
  }

  for (i = left.length - 1; i >= 0; i--) {
    digit = parseInt(left[i], 16) + parseInt(right[i], 16) + carry;

    carry = digit >> 4;
    sum = (digit & 15).toString(16) + sum;
  }

  return sum;
};

hex.pow2x = function (exponent) {
  var moduloExponent = exponent % 4,
      overflow = Math.floor(exponent / 4);

  var power = Math.pow(2, moduloExponent) + '0'.repeat(overflow);

  return power;
};

module.exports = hex;
