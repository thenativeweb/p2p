'use strict';

var path = require('path');

var assert = require('assertthat'),
    nock = require('nock'),
    request = require('supertest'),
    requireAll = require('require-all');

var findPredecessor = require('../../lib/routes/findPredecessor');

var mocks = requireAll(path.join(__dirname, 'mocks'));

suite('findPredecessor', function () {
  test('is a function.', function (done) {
    assert.that(findPredecessor).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', function (done) {
    assert.that(function () {
      findPredecessor();
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
      assert.that(findPredecessor(peer)).is.ofType('function');
      done();
    });

    test('returns 400 if options are missing.', function (done) {
      request(peer.app).
        post('/find-predecessor').
        set('content-type', 'application/json').
        end(function (err, res) {
          assert.that(err).is.not.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('returns 400 if id is missing.', function (done) {
      request(peer.app).
        post('/find-predecessor').
        set('content-type', 'application/json').
        send({}).
        end(function (err, res) {
          assert.that(err).is.not.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('returns 500 if getting the successor fails.', function (done) {
      // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
      // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
      // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
      //
      // - ID: f424bb575238275aac70b0324ca3a77d5b3dddc4

      var remotePeerSuccessor = nock('https://localhost:3000').post('/successor').reply(500);

      request(peer.app).
        post('/find-predecessor').
        set('content-type', 'application/json').
        send({ id: 'f424bb575238275aac70b0324ca3a77d5b3dddc4' }).
        end(function (err, res) {
          assert.that(err).is.not.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(remotePeerSuccessor.isDone()).is.true();
          done();
        });
    });

    suite('returns the peer itself if the id', function () {
      test('is between the peer itself and its successor.', function (done) {
        // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
        // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
        // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
        //
        // - ID: ac70b0324ca3a77d5b3dddc4f424bb575238275a

        var remotePeerSuccessor = nock('https://localhost:3000').post('/successor').reply(200, peer.successor);

        request(peer.app).
          post('/find-predecessor').
          set('content-type', 'application/json').
          send({ id: 'ac70b0324ca3a77d5b3dddc4f424bb575238275a' }).
          end(function (err, res) {
            assert.that(err).is.null();
            assert.that(res.statusCode).is.equalTo(200);
            assert.that(res.body).is.equalTo({
              host: 'localhost',
              port: 3000,
              id: '12a30e3632a51fdab4fedd07bcc219b433e17343'
            });
            assert.that(remotePeerSuccessor.isDone()).is.true();
            done();
          });
      });

      test('matches the peer\'s successor.', function (done) {
        // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
        // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
        // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
        //
        // - ID: ac70b0324ca3a77d5b3dddc4f424bb575238275a

        var remotePeerSuccessor = nock('https://localhost:3000').post('/successor').reply(200, peer.successor);

        request(peer.app).
          post('/find-predecessor').
          set('content-type', 'application/json').
          send({ id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd' }).
          end(function (err, res) {
            assert.that(err).is.null();
            assert.that(res.statusCode).is.equalTo(200);
            assert.that(res.body).is.equalTo({
              host: 'localhost',
              port: 3000,
              id: '12a30e3632a51fdab4fedd07bcc219b433e17343'
            });
            assert.that(remotePeerSuccessor.isDone()).is.true();
            done();
          });
      });
    });

    test('does not return the peer itself if the id matches the peer.', function (done) {
      // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
      // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
      // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
      //
      // - ID: ac70b0324ca3a77d5b3dddc4f424bb575238275a

      var remotePeerSuccessor = nock('https://localhost:3000').post('/successor').reply(200, peer.successor);

      request(peer.app).
        post('/find-predecessor').
        set('content-type', 'application/json').
        send({ id: '12a30e3632a51fdab4fedd07bcc219b433e17343' }).
        end(function (err, res) {
          assert.that(err).is.not.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(remotePeerSuccessor.isDone()).is.true();
          done();
        });
    });

    test('returns 500 if getting the closest preceding finger fails.', function (done) {
      // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
      // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
      // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
      //
      // - ID: f424bb575238275aac70b0324ca3a77d5b3dddc4

      var remotePeerSuccessor = nock('https://localhost:3000').post('/successor').reply(200, peer.successor);
      var remotePeerClosestPrecedingFinger = nock('https://localhost:3000').post('/closest-preceding-finger', { id: 'f424bb575238275aac70b0324ca3a77d5b3dddc4' }).reply(500);

      request(peer.app).
        post('/find-predecessor').
        set('content-type', 'application/json').
        send({ id: 'f424bb575238275aac70b0324ca3a77d5b3dddc4' }).
        end(function (err, res) {
          assert.that(err).is.not.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(remotePeerSuccessor.isDone()).is.true();
          assert.that(remotePeerClosestPrecedingFinger.isDone()).is.true();
          done();
        });
    });

    test('finds the predecessor recursively.', function (done) {
      // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
      // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
      // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
      //
      // - ID: f424bb575238275aac70b0324ca3a77d5b3dddc4

      var remotePeerSuccessor = nock('https://localhost:3000').post('/successor').reply(200, peer.successor);
      var remotePeerClosestPrecedingFinger = nock('https://localhost:3000').post('/closest-preceding-finger', { id: 'f424bb575238275aac70b0324ca3a77d5b3dddc4' }).reply(200, peer.successor);
      var remotePeerSuccessorRecursive = nock('https://localhost:4000').post('/successor').reply(200, peer.predecessor);

      request(peer.app).
        post('/find-predecessor').
        set('content-type', 'application/json').
        send({ id: 'f424bb575238275aac70b0324ca3a77d5b3dddc4' }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({
            host: 'localhost',
            port: 4000,
            id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
          });
          assert.that(remotePeerSuccessor.isDone()).is.true();
          assert.that(remotePeerClosestPrecedingFinger.isDone()).is.true();
          assert.that(remotePeerSuccessorRecursive.isDone()).is.true();
          done();
        });
    });
  });
});
