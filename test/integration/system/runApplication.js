'use strict';

var freeport = require('freeport');

var Application = require('./Application');

var runApplication = function (callback) {
  freeport(function (errFreeport, port) {
    var application;

    if (errFreeport) {
      return callback(errFreeport);
    }

    application = new Application({ port: port });
    application.start(function (errStart) {
      if (errStart) {
        return callback(errStart);
      }

      callback(null, application);
    });
  });
};

module.exports = runApplication;
