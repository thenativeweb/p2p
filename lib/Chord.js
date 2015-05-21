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

var getId = require('./getId'),
    Node = require('./Node'),
    remote = require('./remote');

var routes = requireAll(path.join(__dirname, 'routes'));

var EventEmitter = events.EventEmitter;

var logger = flaschenpost.getLogger();

var Chord = function (options) {
  var app,
      that = this;

  EventEmitter.call(this);

  that.self = new Node(options);
  that.successor = new Node(options);
  that.predecessor = new Node(options);

  that.successors = [];
  that.fingers = [];

  that.serviceInterval = parse(options.serviceInterval || '30s');
  that.wobbleFactor = that.serviceInterval * 0.5;

  app = express();

  app.use(bodyParser.json());

  app.post('/self', routes.self(this));
  app.post('/successor', routes.successor(this));
  app.post('/successors', routes.successors(this));
  app.post('/predecessor', routes.predecessor(this));

  app.post('/closest-preceding-finger', routes.closestPrecedingFinger(this));
  app.post('/find-predecessor', routes.findPredecessor(this));
  app.post('/find-successor', routes.findSuccessor(this));

  app.post('/join', routes.join(this));

  app.post('/notify', routes.notify(this));
  app.post('/stabilize', routes.stabilize(this));
  app.post('/fix-fingers', routes.fixFingers(this));
  app.post('/fix-successors', routes.fixSuccessors(this));
  app.post('/fix-predecessor', routes.fixPredecessor(this));

  https.createServer({
    key: options.privateKey,
    cert: options.certificate
  }, app).listen(that.self.port, function () {
    logger.info('Server started.', {
      node: that.self,
      status: that.status()
    });
  });

  new Timer(that.serviceInterval, { variation: that.wobbleFactor }).on('tick', function () {
    remote(that.self.host, that.self.port).run('stabilize', function () {});
  });

  new Timer(that.serviceInterval, { variation: that.wobbleFactor }).on('tick', function () {
    remote(that.self.host, that.self.port).run('fix-successors', function () {});
  });

  new Timer(that.serviceInterval, { variation: that.wobbleFactor }).on('tick', function () {
    remote(that.self.host, that.self.port).run('fix-fingers', function () {});
  });

  new Timer(that.serviceInterval, { variation: that.wobbleFactor }).on('tick', function () {
    remote(that.self.host, that.self.port).run('fix-predecessor', function () {});
  });
};

util.inherits(Chord, EventEmitter);

Chord.prototype.status = function () {
  if (!this.predecessor) {
    return 'joining';
  }

  if ((this.self.id === this.successor.id) && (this.self.id === this.predecessor.id)) {
    return 'lonely';
  }

  return 'joined';
};

Chord.prototype.setSuccessor = function (successor) {
  this.successor = new Node({
    host: successor.host,
    port: successor.port
  });
  this.emit('changed-successor', this.successor);
};

Chord.prototype.setPredecessor = function (predecessor) {
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

Chord.prototype.fixSuccessor = function () {
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

Chord.prototype.join = function (options, callback) {
  remote(this.self.host, this.self.port).run('join', {
    host: options.host,
    port: options.port
  }, function (err) {
    if (err) {
      return callback(err);
    }

    callback(null);
  });
};

Chord.prototype.getNodeFor = function (value, callback) {
  remote(this.self.host, this.self.port).run('find-successor', {
    id: getId(value)
  }, function (err, successor) {
    if (err) {
      return callback(err);
    }

    callback(null, successor);
  });
};

module.exports = Chord;
