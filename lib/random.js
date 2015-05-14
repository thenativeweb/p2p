'use strict';

var random = function (min, max) {
  if (min === undefined) {
    throw new Error('Minimum is missing.');
  }
  if (max === undefined) {
    throw new Error('Maximum is missing.');
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = random;
