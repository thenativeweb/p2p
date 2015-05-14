'use strict';

var text = {};

text.repeat = function (character, count) {
  if (!character) {
    throw new Error('Character is missing.');
  }
  if (!count) {
    throw new Error('Count is missing.');
  }

  return (new Array(count + 1)).join(character);
};

text.padLeft = function (textToPad, character, length) {
  var pad,
      padded;

  if (!textToPad) {
    throw new Error('Text is missing.');
  }
  if (!character) {
    throw new Error('Character is missing.');
  }
  if (!length) {
    throw new Error('Length is missing.');
  }

  pad = this.repeat(character, length);
  padded = (pad.substring(0, pad.length - textToPad.length) + textToPad).substring(0, length);

  return padded;
};

module.exports = text;
