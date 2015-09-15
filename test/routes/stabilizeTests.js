'use strict';

var path = require('path');

var assert = require('assertthat'),
    nock = require('nock'),
    request = require('supertest'),
    requireAll = require('require-all');

var Node = require('../../lib/Node'),
    stabilize = require('../../lib/routes/stabilize');

var mocks = requireAll(path.join(__dirname, 'mocks'));

suite('stabilize', function () {
  test('is a function.', function (done) {
    assert.that(stabilize).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', function (done) {
    assert.that(function () {
      stabilize();
    }).is.throwing('Peer is missing.');
    done();
  });

  suite('route', function () {
    var peer;

    setup(function () {
      peer = new mocks.JoinedPeer({
        host: 'localhost',
        port: 3000
      });
    });

    test('is a function.', function (done) {
      assert.that(stabilize(peer)).is.ofType('function');
      done();
    });

    test('fixes the successor if the successor is not reachable.', function (done) {
      var fixSuccessorCalled = false;

      peer.fixSuccessor = function () {
        fixSuccessorCalled = true;
      };

      request(peer.app).
        post('/stabilize').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(fixSuccessorCalled).is.true();
          done();
        });
    });

    suite('asks the successor about the successor\'s predecessor and', function () {
      suite('does not update its successor if the successor', function () {
        test('does not have a predecessor.', function (done) {
          var remotePeerPredecessor = nock('https://localhost:4000').post('/predecessor').reply(200);
          var remotePeerNotify = nock('https://localhost:4000').post('/notify').reply(200);

          request(peer.app).
            post('/stabilize').
            end(function (err, res) {
              assert.that(err).is.null();
              assert.that(res.statusCode).is.equalTo(200);
              assert.that(peer.successor).is.equalTo({
                host: 'localhost',
                port: 4000,
                id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
              });
              assert.that(remotePeerPredecessor.isDone()).is.true();
              assert.that(remotePeerNotify.isDone()).is.true();
              done();
            });
        });

        test('returns the peer itself.', function (done) {
          var remotePeerPredecessor = nock('https://localhost:4000').post('/predecessor').reply(200, peer.self);
          var remotePeerNotify = nock('https://localhost:4000').post('/notify').reply(200);

          request(peer.app).
            post('/stabilize').
            end(function (err, res) {
              assert.that(err).is.null();
              assert.that(res.statusCode).is.equalTo(200);
              assert.that(peer.successor).is.equalTo({
                host: 'localhost',
                port: 4000,
                id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
              });
              assert.that(remotePeerPredecessor.isDone()).is.true();
              assert.that(remotePeerNotify.isDone()).is.true();
              done();
            });
        });

        test('returns the successor itself.', function (done) {
          var remotePeerPredecessor = nock('https://localhost:4000').post('/predecessor').reply(200, peer.successor.self);
          var remotePeerNotify = nock('https://localhost:4000').post('/notify').reply(200);

          request(peer.app).
            post('/stabilize').
            end(function (err, res) {
              assert.that(err).is.null();
              assert.that(res.statusCode).is.equalTo(200);
              assert.that(peer.successor).is.equalTo({
                host: 'localhost',
                port: 4000,
                id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
              });
              assert.that(remotePeerPredecessor.isDone()).is.true();
              assert.that(remotePeerNotify.isDone()).is.true();
              done();
            });
        });

        test('returns a peer between the successor and the peer.', function (done) {
          var remotePeerPredecessor = nock('https://localhost:4000').post('/predecessor').reply(200, new Node({
            host: 'localhost',
            port: 2000
          }));
          var remotePeerNotify = nock('https://localhost:4000').post('/notify').reply(200);

          request(peer.app).
            post('/stabilize').
            end(function (err, res) {
              assert.that(err).is.null();
              assert.that(res.statusCode).is.equalTo(200);
              assert.that(peer.successor).is.equalTo({
                host: 'localhost',
                port: 4000,
                id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
              });
              assert.that(remotePeerPredecessor.isDone()).is.true();
              assert.that(remotePeerNotify.isDone()).is.true();
              done();
            });
        });
      });

      suite('updates its successor if the successor', function () {
        test('returns a peer between the peer itself and the successor.', function (done) {
          var remotePeerPredecessor = nock('https://localhost:2000').post('/predecessor').reply(200, new Node({
            host: 'localhost',
            port: 4000
          }));
          var remotePeerNotify = nock('https://localhost:4000').post('/notify').reply(200);

          peer.successor = new Node({
            host: 'localhost',
            port: 2000
          });

          request(peer.app).
            post('/stabilize').
            end(function (err, res) {
              assert.that(err).is.null();
              assert.that(res.statusCode).is.equalTo(200);
              assert.that(peer.successor).is.equalTo({
                host: 'localhost',
                port: 4000,
                id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
              });
              assert.that(remotePeerPredecessor.isDone()).is.true();
              assert.that(remotePeerNotify.isDone()).is.true();
              done();
            });
        });
      });
    });

    test('notifies its successor about itself as potential predecessor.', function (done) {
      var remotePeerPredecessor = nock('https://localhost:4000').post('/predecessor').reply(200);
      var remotePeerNotify = nock('https://localhost:4000').post('/notify', peer.successor.self).reply(200);

      request(peer.app).
        post('/stabilize').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(remotePeerPredecessor.isDone()).is.true();
          assert.that(remotePeerNotify.isDone()).is.true();
          done();
        });
    });

    test('fixes successor if notifying the successor fails.', function (done) {
      var remotePeerPredecessor = nock('https://localhost:4000').post('/predecessor').reply(200);
      var fixSuccessorCalled = false;

      peer.fixSuccessor = function () {
        fixSuccessorCalled = true;
      };

      request(peer.app).
        post('/stabilize').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(fixSuccessorCalled).is.true();
          assert.that(remotePeerPredecessor.isDone()).is.true();
          done();
        });
    });
  });
});
