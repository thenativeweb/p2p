'use strict';

var knock = require('knockat');

var getDockWorker = require('./getDockWorker'),
    getId = require('../../lib/getId'),
    remote = require('../../lib/remote');

var Application = function (options) {
  this.containerName = undefined;

  this.id = undefined;
  this.port = options.port;
  this.serviceInterval = options.serviceInterval;
};

Application.prototype.start = function (callback) {
  var that = this;

  getDockWorker(function (errGetDockWorker, dockWorker) {
    var containerName;

    if (errGetDockWorker) {
      return callback(errGetDockWorker);
    }

    containerName = 'thenativeweb-p2p-test-' + that.port;

    dockWorker.startContainer({
      image: 'thenativeweb/p2p-test',
      name: containerName,
      env: {
        HOST: dockWorker.options.host,
        PORT: that.port,
        SERVICE_INTERVAL: that.serviceInterval
      },
      ports: [
        { container: that.port, host: that.port }
      ]
    }, function (errStart) {
      if (errStart) {
        return callback(errStart);
      }

      that.containerName = containerName;
      that.id = getId(dockWorker.options.host + ':' + that.port);

      knock.at(dockWorker.options.host, that.port, callback);
    });
  });
};

Application.prototype.join = function (target, callback) {
  var that = this;

  getDockWorker(function (errGetDockWorker, dockWorker) {
    if (errGetDockWorker) {
      return callback(errGetDockWorker);
    }

    remote(dockWorker.options.host, target.port).run('self', function (errTargetSelf, targetSelf) {
      if (errTargetSelf) {
        return callback(errTargetSelf);
      }

      remote(dockWorker.options.host, that.port).run('join', targetSelf, callback);
    });
  });
};

Application.prototype.stop = function (callback) {
  var that = this;

  getDockWorker(function (errGetDockWorker, dockWorker) {
    if (errGetDockWorker) {
      return callback(errGetDockWorker);
    }

    dockWorker.stopContainer(that.containerName, function (err) {
      if (err) {
        return callback(err);
      }

      callback(null);
    });
  });
};

[
  'self',
  'successor',
  'predecessor',
  'status'
].forEach(function (fn) {
  Application.prototype[fn] = function (callback) {
    var that = this;

    getDockWorker(function (errGetDockWorker, dockWorker) {
      if (errGetDockWorker) {
        return callback(errGetDockWorker);
      }

      remote(dockWorker.options.host, that.port).run(fn, callback);
    });
  };
});

module.exports = Application;
