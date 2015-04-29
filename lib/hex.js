'use strict';

var text = require('./text');

var hex = {};

hex.add = function (left, right) {
  var carry = 0,
      digit,
      i,
      sum = '';

  if (left.length < right.length) {
    left = text.padLeft(left, '0', right.length);
  } else if (right.length < left.length) {
    right = text.padLeft(right, '0', left.length);
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

  var power = Math.pow(2, moduloExponent) + text.repeat('0', overflow);

  return power;
};

module.exports = hex;
