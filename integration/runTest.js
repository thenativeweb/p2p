'use strict';

var path = require('path');

var parse = require('parse-duration');

var configuration = require('./configuration.json');

var runTest = function (testName, callback) {
  testName = path.basename(testName, '.js');

  configuration.ringSizes.forEach(function (ringSize) {
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
