'use strict';

var text = {};

text.repeat = function (character, times) {
  return (new Array(times + 1)).join(character);
};

text.padLeft = function (text, character, length) {
  var pad = this.repeat(character, length),
      padded = pad.substring(0, pad.length - text.length) + text;

  return padded;
};

module.exports = text;
