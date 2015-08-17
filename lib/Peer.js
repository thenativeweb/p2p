'use strict';

var path = require('path'),
    util = require('util');

var _ = require('lodash'),
    bodyParser = require('body-parser'),
    eventEmitter2 = require('eventemitter2'),
    express = require('express'),
    requireAll = require('require-all');

var errors = require('./errors'),
    getId = require('./getId'),
    Node = require('./Node'),
    remote = require('./remote');

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

  that.self = new Node(options);
  that.metadata = options.metadata || {};

  that.successor = new Node(options);
  that.predecessor = new Node(options);
  that.successors = [];
  that.fingers = [];

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
  var previousStatus = this.status();

  if (!successor) {
    throw new Error('Successor is missing.');
  }

  this.successor = new Node({
    host: successor.host,
    port: successor.port
  });
  this.emit('environment::successor', this.successor);

  if (this.status() !== previousStatus) {
    this.emit('status', this.status());
  }
};

Peer.prototype.setPredecessor = function (predecessor) {
  var previousStatus = this.status();

  if (predecessor) {
    this.predecessor = new Node({
      host: predecessor.host,
      port: predecessor.port
    });
  } else {
    this.predecessor = undefined;
  }
  this.emit('environment::predecessor', this.predecessor);

  if (this.status() !== previousStatus) {
    this.emit('status', this.status());
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

Peer.prototype.join = function (options, callback) {
  var that = this;

  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.peers && !options.peer) {
    throw new Error('Peers are missing.');
  }
  if (!callback) {
    throw new Error('Callback is missing.');
  }

  options.peers = _.flatten([ options.peers || options.peer ]);

  remote(that.self.host, that.self.port).run('join', _.first(options.peers), function (err) {
    if (!err) {
      return callback(null);
    }
    if (options.peers.length > 1) {
      options.peers = _.rest(options.peers);
      return that.join(options, callback);
    }
    callback(new errors.JoinFailed('Failed to join.', err));
  });
};

Peer.prototype.getPeerFor = function (value, callback) {
  if (!value) {
    throw new Error('Value is missing.');
  }
  if (!callback) {
    throw new Error('Callback is missing.');
  }

  remote(this.self.host, this.self.port).run('find-successor', {
    id: getId(value)
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
