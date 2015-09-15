'use strict';

var path = require('path');

var assert = require('assertthat'),
    nock = require('nock'),
    request = require('supertest'),
    requireAll = require('require-all');

var join = require('../../lib/routes/join');

var mocks = requireAll(path.join(__dirname, 'mocks'));

suite('join', function () {
  test('is a function.', function (done) {
    assert.that(join).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', function (done) {
    assert.that(function () {
      join();
    }).is.throwing('Peer is missing.');
    done();
  });

  suite('route', function () {
    var peer;

    setup(function () {
      peer = new mocks.LonelyPeer({
        host: 'localhost',
        port: 3000
      });
    });

    test('is a function.', function (done) {
      assert.that(join(peer)).is.ofType('function');
      done();
    });

    test('returns 400 if options are missing.', function (done) {
      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('returns 400 if host is missing.', function (done) {
      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ port: 4000 }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('returns 400 if port is missing.', function (done) {
      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ host: 'localhost' }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('does nothing if the peer is told to join itself.', function (done) {
      var findSuccessor = nock('https://localhost:3000').post('/find-successor').reply(500);

      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 3000 }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(findSuccessor.isDone()).is.false();
          nock.cleanAll();
          done();
        });
    });

    test('does nothing if the peer is unbalanced.', function (done) {
      var findSuccessor = nock('https://localhost:3000').post('/find-successor').reply(500);

      peer = new mocks.UnbalancedPeerWithoutPredecessor({
        host: 'localhost',
        port: 3000
      });

      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 3000 }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(findSuccessor.isDone()).is.false();
          nock.cleanAll();
          done();
        });
    });

    test('does nothing if the peer is joined.', function (done) {
      var findSuccessor = nock('https://localhost:3000').post('/find-successor').reply(500);

      peer = new mocks.JoinedPeer({
        host: 'localhost',
        port: 3000
      });

      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 3000 }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(findSuccessor.isDone()).is.false();
          nock.cleanAll();
          done();
        });
    });

    test('asks the remote peer for the local peer\'s successor.', function (done) {
      var remotePeer = new mocks.LonelyPeer({ host: 'localhost', port: 4000 });
      var remotePeerFindSuccessor = nock('https://localhost:4000').post('/find-successor').reply(200, remotePeer.self);

      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 4000 }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(remotePeerFindSuccessor.isDone()).is.true();
          done();
        });
    });

    test('returns 500 if the remote peer can not be reached.', function (done) {
      var remotePeerFindSuccessor = nock('https://localhost:4000').post('/find-successor').reply(500);

      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 4000 }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(remotePeerFindSuccessor.isDone()).is.true();
          done();
        });
    });

    test('sets the successor to the successor returned by the remote peer.', function (done) {
      var remotePeer = new mocks.LonelyPeer({ host: 'localhost', port: 4000 });
      var remotePeerFindSuccessor = nock('https://localhost:4000').post('/find-successor').reply(200, remotePeer.self);

      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 4000 }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(remotePeerFindSuccessor.isDone()).is.true();
          assert.that(peer.successor).is.equalTo(remotePeer.self);
          done();
        });
    });

    test('sets the predecessor to undefined.', function (done) {
      var remotePeer = new mocks.LonelyPeer({ host: 'localhost', port: 4000 });
      var remotePeerFindSuccessor = nock('https://localhost:4000').post('/find-successor').reply(200, remotePeer.self);

      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 4000 }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(remotePeerFindSuccessor.isDone()).is.true();
          assert.that(peer.predecessor).is.undefined();
          done();
        });
    });
  });
});
