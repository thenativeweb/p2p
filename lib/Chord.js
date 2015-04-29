'use strict';

var http = require('http');

var bodyParser = require('body-parser'),
    express = require('express'),
    flaschenpost = require('flaschenpost');

var interval = require('./interval'),
    Node = require('./Node'),
    remote = require('./remote');

var logger = flaschenpost.getLogger();

var Chord = function (options) {
  var app,
      that = this;

  that.self = new Node(options);
  that.successor = new Node(options);
  that.predecessor = new Node(options);
  that.fingers = [];

  app = express();

  app.use(bodyParser.json());

  app.post('/successor', function (req, res) {
    res.send(that.successor);
  });

  app.post('/predecessor', function (req, res) {
    res.send(that.predecessor);
  });

  app.post('/closest-preceding-finger', function (req, res) {
    var finger,
        i,
        id = req.body.id;

    for (i = 159; i >= 0; i--) {
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
      remote(possiblePredecessor.host, possiblePredecessor.port).run('successor', {}, function (err, successor) {
        if (err) {
          return res.sendStatus(500);
        }

        if (interval({ left: possiblePredecessor.id, right: successor.id, type: 'leftopen' }).contains(id)) {
          return res.send(possiblePredecessor);
        }

        remote(possiblePredecessor.host, possiblePredecessor.port).run('closest-preceding-finger', {
          id: id
        }, function (err, closestPrecedingFinger) {
          if (err) {
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

    remote(that.self.host, that.self.port).run('find-predecessor', {
      id: id
    }, function (err, predecessor) {
      if (err) {
        return res.sendStatus(500);
      }

      remote(predecessor.host, predecessor.port).run('successor', {}, function (err, successor) {
        if (err) {
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

      logger.info('Joined successor.', successor)
      res.sendStatus(200);
    });
  });

  http.createServer(app).listen(that.self.port, function () {
    logger.info('Server started.', that.self);
  });
};

module.exports = Chord;

// POST /Stabilize
// POST /Notify
// POST /FixFingers
