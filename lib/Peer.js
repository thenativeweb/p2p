'use strict';

var events = require('events'),
    https = require('https'),
    path = require('path'),
    util = require('util');

var bodyParser = require('body-parser'),
    express = require('express'),
    flaschenpost = require('flaschenpost'),
    parse = require('parse-duration'),
    requireAll = require('require-all'),
    Timer = require('timer2');

var errors = require('./errors'),
    getId = require('./getId'),
    Node = require('./Node'),
    remote = require('./remote');

var routes = requireAll(path.join(__dirname, 'routes'));

var EventEmitter = events.EventEmitter;

var logger = flaschenpost.getLogger();

var Peer = function (options) {
  var app,
      that = this;

  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.privateKey) {
    throw new Error('Private key is missing.');
  }
  if (!options.certificate) {
    throw new Error('Certificate is missing.');
  }

  EventEmitter.call(that);

  that.self = new Node(options);
  that.metadata = options.metadata || {};

  that.successor = new Node(options);
  that.predecessor = new Node(options);
  that.successors = [];
  that.fingers = [];

  that.serviceInterval = parse(options.serviceInterval || '30s');
  that.wobbleFactor = that.serviceInterval * 0.5;

  that.handle = {};

  app = express();

  app.use(bodyParser.json());

  app.post('/self', routes.self(that));
  app.post('/metadata', routes.metadata(that));

  app.post('/successor', routes.successor(that));
  app.post('/successors', routes.successors(that));
  app.post('/predecessor', routes.predecessor(that));

  app.post('/closest-preceding-finger', routes.closestPrecedingFinger(that));
  app.post('/find-predecessor', routes.findPredecessor(that));
  app.post('/find-successor', routes.findSuccessor(that));

  app.post('/join', routes.join(that));

  app.post('/notify', routes.notify(that));
  app.post('/stabilize', routes.stabilize(that));
  app.post('/fix-fingers', routes.fixFingers(that));
  app.post('/fix-successors', routes.fixSuccessors(that));
  app.post('/fix-predecessor', routes.fixPredecessor(that));

  app.post('/handle/:action', routes.handle(that));

  https.createServer({
    key: options.privateKey,
    cert: options.certificate
  }, app).listen(that.self.port, function () {
    logger.info('Server started.', {
      node: that.self,
      status: that.status()
    });
  });

  [ 'stabilize', 'fix-successors', 'fix-fingers', 'fix-predecessor' ].forEach(function (fn) {
    new Timer(that.serviceInterval, { variation: that.wobbleFactor }).on('tick', function () {
      remote(that.self.host, that.self.port).run(fn, function () {});
    });
  });
};

util.inherits(Peer, EventEmitter);

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
  if (!successor) {
    throw new Error('Successor is missing.');
  }

  this.successor = new Node({
    host: successor.host,
    port: successor.port
  });
  this.emit('changed-successor', this.successor);
};

Peer.prototype.setPredecessor = function (predecessor) {
  if (predecessor) {
    this.predecessor = new Node({
      host: predecessor.host,
      port: predecessor.port
    });
  } else {
    this.predecessor = undefined;
  }

  this.emit('changed-predecessor', this.predecessor);
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
  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.host) {
    throw new Error('Host is missing.');
  }
  if (!options.port) {
    throw new Error('Port is missing.');
  }
  if (!callback) {
    throw new Error('Callback is missing.');
  }

  remote(this.self.host, this.self.port).run('join', {
    host: options.host,
    port: options.port
  }, function (err) {
    if (err) {
      return callback(new errors.JoinFailed('Failed to join.', err));
    }

    callback(null);
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
