'use strict';

var path = require('path');

var parse = require('parse-duration');

var algorithms = require('./algorithms'),
    configuration = require('./configuration.json');

var runTest = function (testName, callback) {
  var ringSizes = algorithms[configuration.ringSizes.algorithm](configuration.ringSizes.iterations);

  testName = path.basename(testName, '.js');

  ringSizes.forEach(function (ringSize) {
    var individualConfiguration = {
      serviceInterval: configuration.serviceInterval,
      ringSize: ringSize,
      timeout: configuration.timeout
    };

    var testFunction = callback(individualConfiguration);

    suite(testName, function () {
      /* eslint-disable no-process-env  */
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      /* eslint-enable no-process-env  */

      this.timeout(parse(configuration.timeout));
      test('ringSize ' + ringSize, testFunction);
    });
  });
};

module.exports = runTest;
