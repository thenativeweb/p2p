'use strict';

var http = require('http'),
    path = require('path');

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

var logger = flaschenpost.getLogger();

var Chord = function (options) {
  var app,
      that = this;

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

  http.createServer(app).listen(that.self.port, function () {
    logger.info('Server started.', that.self);
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

Chord.prototype.fixSuccessor = function () {
  var that = this;

  that.successors.shift();

  if (that.successors.length === 0) {
    that.successor = new Node({
      host: that.self.host,
      port: that.self.port
    });
    return;
  }

  that.successor = new Node({
    host: that.successors[0].host,
    port: that.successors[0].port
  });
};

Chord.prototype.join = function (options, callback) {
  var that = this;

  remote(that.self.host, that.self.port).run('join', {
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
  var that = this;

  remote(that.self.host, that.self.port).run('find-successor', {
    id: getId(value)
  }, function (err, successor) {
    if (err) {
      return callback(err);
    }

    callback(null, successor);
  });
};

module.exports = Chord;
