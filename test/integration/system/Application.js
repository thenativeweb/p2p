'use strict';

var getDockWorker = require('./getDockWorker');

var Application = function (options) {
  this.id = undefined;
  this.name = undefined;
  this.port = options.port;
};

Application.prototype.start = function (callback) {
  var that = this;

  getDockWorker(function (errGetDockWorker, dockWorker) {
    var name;

    if (errGetDockWorker) {
      return callback(errGetDockWorker);
    }

    name = 'thenativeweb-p2p-test-' + that.port;

    dockWorker.start({
      image: 'thenativeweb/p2p-test',
      name: name
    }, function (errStart, id) {
      if (errStart) {
        return callback(errStart);
      }

      that.id = id;
      that.name = name;

      callback(null);
    });
  });
};

Application.prototype.join = function () {};

Application.prototype.self = function () {};

Application.prototype.stop = function (callback) {
  var that = this;

  getDockWorker(function (errGetDockWorker, dockWorker) {
    if (errGetDockWorker) {
      return callback(errGetDockWorker);
    }

    dockWorker.stop(that.name, function (err) {
      if (err) {
        return callback(err);
      }

      callback(null);
    });
  });
};

module.exports = Application;
