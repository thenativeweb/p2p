'use strict';

var http = require('http');

var bodyParser = require('body-parser'),
    express = require('express'),
    flaschenpost = require('flaschenpost'),
    Timer = require('timer2');

var getId = require('./getId'),
    hex = require('./hex'),
    interval = require('./interval'),
    Node = require('./Node'),
    random = require('./random'),
    remote = require('./remote');

var logger = flaschenpost.getLogger();

var serviceInterval = 0.5 * 1000,
    wobbleFactor = serviceInterval * 0.5;

var Chord = function (options) {
  var app,
      that = this;

  that.self = new Node(options);
  that.successor = new Node(options);
  that.predecessor = new Node(options);

  that.successors = [];
  that.fingers = [];

  app = express();

  app.use(bodyParser.json());

  app.post('/self', function (req, res) {
    res.send(that.self);
  });

  app.post('/successor', function (req, res) {
    res.send(that.successor);
  });

  app.post('/successors', function (req, res) {
    res.send(that.successors.slice(0, 2));
  });

  app.post('/predecessor', function (req, res) {
    res.send(that.predecessor);
  });

  app.post('/closest-preceding-finger', function (req, res) {
    var finger,
        i,
        id = req.body.id;

    for (i = 160; i >= 1; i--) {
      finger = that.fingers[i];

      if (!finger) {
        continue;
      }

      if (interval({ left: that.self.id, right: id, type: 'open' }).contains(finger.id)) {
        return res.send(finger);
      }
    }

    res.send(that.self);
  });

  app.post('/find-predecessor', function (req, res) {
    var id = req.body.id;

    var possiblePredecessor = new Node({
      host: that.self.host,
      port: that.self.port
    });

    var findPredecessorRecursive = function () {
      remote(possiblePredecessor.host, possiblePredecessor.port).run('successor', function (err, successor) {
        if (err) {
          return res.sendStatus(500);
        }

        if (interval({ left: possiblePredecessor.id, right: successor.id, type: 'leftopen' }).contains(id)) {
          return res.send(possiblePredecessor);
        }

        remote(possiblePredecessor.host, possiblePredecessor.port).run('closest-preceding-finger', {
          id: id
        }, function (errClosestPrecedingFinger, closestPrecedingFinger) {
          if (errClosestPrecedingFinger) {
            return res.sendStatus(500);
          }

          possiblePredecessor = new Node({
            host: closestPrecedingFinger.host,
            port: closestPrecedingFinger.port
          });

          findPredecessorRecursive();
        });
      });
    };

    findPredecessorRecursive();
  });

  app.post('/find-successor', function (req, res) {
    var id = req.body.id;

    if (interval({ left: that.self.id, right: that.successor.id, type: 'leftopen' }).contains(id)) {
      return res.send(that.successor);
    }

    remote(that.self.host, that.self.port).run('find-predecessor', {
      id: id
    }, function (err, predecessor) {
      if (err) {
        return res.sendStatus(500);
      }

      remote(predecessor.host, predecessor.port).run('successor', function (errSuccessor, successor) {
        if (errSuccessor) {
          return res.sendStatus(500);
        }

        res.send(successor);
      });
    });
  });

  app.post('/join', function (req, res) {
    var host = req.body.host,
        port = req.body.port;

    remote(host, port).run('find-successor', {
      id: that.self.id
    }, function (err, successor) {
      if (err) {
        return res.sendStatus(500);
      }

      that.predecessor = undefined;
      that.successor = new Node({
        host: successor.host,
        port: successor.port
      });

      logger.info('Joined successor.', successor);
      res.sendStatus(200);
    });
  });

  app.post('/notify', function (req, res) {
    var possiblePredecessor = new Node({
      host: req.body.host,
      port: req.body.port
    });

    if (!that.predecessor || interval({
      left: that.predecessor.id,
      right: that.self.id,
      type: 'open'
    }).contains(possiblePredecessor.id)) {
      that.predecessor = possiblePredecessor;
    }

    res.sendStatus(200);
  });

  app.post('/stabilize', function (req, res) {
    remote(that.successor.host, that.successor.port).run('predecessor', function (err, predecessor) {
      if (err) {
        that.fixSuccessor();
        return res.sendStatus(500);
      }

      if (
        (predecessor) &&
        (interval({ left: that.self.id, right: that.successor.id, type: 'open' }).contains(predecessor.id))
      ) {
        that.successor = new Node({
          host: predecessor.host,
          port: predecessor.port
        });
      }

      remote(that.successor.host, that.successor.port).run('notify', {
        host: that.self.host,
        port: that.self.port
      }, function (errNotify) {
        if (errNotify) {
          that.fixSuccessor();
          return res.sendStatus(500);
        }

        res.sendStatus(200);
      });
    });
  });

  app.post('/fix-fingers', function (req, res) {
    var i = random(2, 160),
        id = hex.add(that.self.id, hex.pow2x(i - 1));

    remote(that.self.host, that.self.port).run('find-successor', {
      id: id
    }, function (err, successor) {
      if (err) {
        return res.sendStatus(500);
      }

      that.fingers[i] = new Node({
        host: successor.host,
        port: successor.port
      });

      res.sendStatus(200);
    });
  });

  app.post('/fix-successors', function (req, res) {
    remote(that.successor.host, that.successor.port).run('successors', function (err, successors) {
      if (err) {
        that.fixSuccessor();
        return res.sendStatus(500);
      }

      successors.unshift(new Node({
        host: that.successor.host,
        port: that.successor.port
      }));

      that.successors = successors;

      res.sendStatus(200);
    });
  });

  app.post('/fix-predecessor', function (req, res) {
    if (!that.predecessor) {
      return res.sendStatus(200);
    }

    remote(that.predecessor.host, that.predecessor.port).run('self', function (err) {
      if (err) {
        that.predecessor = undefined;
      }

      res.sendStatus(200);
    });
  });

  http.createServer(app).listen(that.self.port, function () {
    logger.info('Server started.', that.self);
  });

  new Timer(serviceInterval, { variation: wobbleFactor }).on('tick', function () {
    remote(that.self.host, that.self.port).run('stabilize', function () {});
  });

  new Timer(serviceInterval, { variation: wobbleFactor }).on('tick', function () {
    remote(that.self.host, that.self.port).run('fix-successors', function () {});
  });

  new Timer(serviceInterval, { variation: wobbleFactor }).on('tick', function () {
    remote(that.self.host, that.self.port).run('fix-fingers', function () {});
  });

  new Timer(serviceInterval, { variation: wobbleFactor }).on('tick', function () {
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
