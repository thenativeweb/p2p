'use strict';

var path = require('path'),
    util = require('util');

var bodyParser = require('body-parser'),
    eventEmitter2 = require('eventemitter2'),
    express = require('express'),
    requireAll = require('require-all'),
    sha1 = require('sha1');

var Endpoint = require('./Endpoint'),
    remote = require('./remote'),
    WellKnownPeers = require('./WellKnownPeers');

var EventEmitter2 = eventEmitter2.EventEmitter2;

var routes = requireAll(path.join(__dirname, 'routes'));

var Peer = function (options) {
  var that = this;

  if (!options) {
    throw new Error('Options are missing.');
  }

  EventEmitter2.call(that, {
    wildcard: true,
    delimiter: '::'
  });

  that.self = new Endpoint(options);
  that.metadata = options.metadata || {};

  that.successor = new Endpoint(options);
  that.predecessor = new Endpoint(options);
  that.successors = [];
  that.fingers = [];

  that.wellKnownPeers = new WellKnownPeers();
  that.wellKnownPeers.add(that.self);
  that.wellKnownPeers.add(options.wellKnownPeers || []);

  that.handle = {};

  that.app = express();

  that.app.use(bodyParser.json());

  that.app.post('/self', routes.self(that));
  that.app.post('/status', routes.status(that));
  that.app.post('/metadata', routes.metadata(that));

  that.app.post('/successor', routes.successor(that));
  that.app.post('/successors', routes.successors(that));
  that.app.post('/predecessor', routes.predecessor(that));

  that.app.post('/closest-preceding-finger', routes.closestPrecedingFinger(that));
  that.app.post('/find-predecessor', routes.findPredecessor(that));
  that.app.post('/find-successor', routes.findSuccessor(that));

  that.app.post('/join', routes.join(that));

  that.app.post('/notify', routes.notify(that));
  that.app.post('/stabilize', routes.stabilize(that));
  that.app.post('/fix-fingers', routes.fixFingers(that));
  that.app.post('/fix-successors', routes.fixSuccessors(that));
  that.app.post('/fix-predecessor', routes.fixPredecessor(that));

  that.app.post('/handle/:action', routes.handle(that));
};

util.inherits(Peer, EventEmitter2);

Peer.prototype.remote = function (target) {
  if (!target) {
    throw new Error('Target is missing.');
  }
  if (!target.host) {
    throw new Error('Host is missing.');
  }
  if (!target.port) {
    throw new Error('Port is missing.');
  }

  return {
    run: function (fn, args, callback) {
      remote(target.host, target.port).run('handle/' + fn, args, callback);
    }
  };
};

Peer.prototype.setSuccessor = function (successor) {
  var fromStatus = this.status(),
      toStatus;

  if (!successor) {
    throw new Error('Successor is missing.');
  }

  this.successor = new Endpoint({
    host: successor.host,
    port: successor.port
  });
  this.emit('environment::successor', this.successor);

  toStatus = this.status();
  if (toStatus !== fromStatus) {
    this.emit('status::' + toStatus, {
      from: fromStatus,
      to: toStatus
    });
  }
};

Peer.prototype.setPredecessor = function (predecessor) {
  var fromStatus = this.status(),
      toStatus;

  if (predecessor) {
    this.predecessor = new Endpoint({
      host: predecessor.host,
      port: predecessor.port
    });
  } else {
    this.predecessor = undefined;
  }
  this.emit('environment::predecessor', this.predecessor);

  toStatus = this.status();
  if (toStatus !== fromStatus) {
    this.emit('status::' + toStatus, {
      from: fromStatus,
      to: toStatus
    });
  }
};

Peer.prototype.status = function () {
  if (!this.predecessor) {
    return 'unbalanced';
  }

  if ((this.self.id === this.successor.id) && (this.self.id === this.predecessor.id)) {
    return 'lonely';
  }

  if ((this.self.id !== this.successor.id) && (this.self.id !== this.predecessor.id)) {
    return 'joined';
  }

  return 'unbalanced';
};

Peer.prototype.fixSuccessor = function () {
  this.successors.shift();

  if (this.successors.length === 0) {
    return this.setSuccessor({
      host: this.self.host,
      port: this.self.port
    });
  }

  this.setSuccessor({
    host: this.successors[0].host,
    port: this.successors[0].port
  });
};

Peer.prototype.getEndpointFor = function (value, callback) {
  if (!value) {
    throw new Error('Value is missing.');
  }
  if (!callback) {
    throw new Error('Callback is missing.');
  }

  remote(this.self.host, this.self.port).run('find-successor', {
    id: sha1(value)
  }, function (errFindSuccessor, successor) {
    if (errFindSuccessor) {
      return callback(errFindSuccessor);
    }

    remote(successor.host, successor.port).run('metadata', function (errMetadata, metadata) {
      if (errMetadata) {
        return callback(errMetadata);
      }

      callback(null, successor, metadata);
    });
  });
};

module.exports = Peer;
