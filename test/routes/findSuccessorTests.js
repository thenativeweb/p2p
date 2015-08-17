'use strict';

var path = require('path');

var assert = require('assertthat'),
    nock = require('nock'),
    request = require('supertest'),
    requireAll = require('require-all');

var findSuccessor = require('../../lib/routes/findSuccessor'),
    Node = require('../../lib/Node');

var mocks = requireAll(path.join(__dirname, 'mocks'));

suite('findSuccessor', function () {
  test('is a function.', function (done) {
    assert.that(findSuccessor).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', function (done) {
    assert.that(function () {
      findSuccessor();
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
      assert.that(findSuccessor(peer)).is.ofType('function');
      done();
    });

    test('returns 400 if options are missing.', function (done) {
      request(peer.app).
        post('/find-successor').
        set('content-type', 'application/json').
        end(function (err, res) {
          assert.that(err).is.not.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('returns 400 if id is missing.', function (done) {
      request(peer.app).
        post('/find-successor').
        set('content-type', 'application/json').
        send({}).
        end(function (err, res) {
          assert.that(err).is.not.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    suite('returns the successor if the id', function () {
      test('is between the peer itself and its successor.', function (done) {
        // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
        // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
        // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
        //
        // - ID: a51fdab4fedd07bcc219b433e1734312a30e3632

        request(peer.app).
          post('/find-successor').
          set('content-type', 'application/json').
          send({ id: 'a51fdab4fedd07bcc219b433e1734312a30e3632' }).
          end(function (err, res) {
            assert.that(err).is.null();
            assert.that(res.statusCode).is.equalTo(200);
            assert.that(res.body).is.equalTo({
              host: 'localhost',
              port: 4000,
              id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
            });
            done();
          });
      });

      test('matches the peer\'s successor.', function (done) {
        // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
        // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
        // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
        //
        // - ID: dc4f424bb575238275aac70b0324ca3a77d5b3dd

        request(peer.app).
          post('/find-successor').
          set('content-type', 'application/json').
          send({ id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd' }).
          end(function (err, res) {
            assert.that(err).is.null();
            assert.that(res.statusCode).is.equalTo(200);
            assert.that(res.body).is.equalTo({
              host: 'localhost',
              port: 4000,
              id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
            });
            done();
          });
      });
    });

    test('does not return the successor if the id matches the peer itself.', function (done) {
      // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
      // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
      // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
      //
      // - ID: 12a30e3632a51fdab4fedd07bcc219b433e17343

      request(peer.app).
        post('/find-successor').
        set('content-type', 'application/json').
        send({ id: '12a30e3632a51fdab4fedd07bcc219b433e17343' }).
        end(function (err, res) {
          assert.that(err).is.not.null();
          assert.that(res.statusCode).is.equalTo(500);
          done();
        });
    });

    test('returns 500 if finding the predecessor fails.', function (done) {
      // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
      // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
      // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
      //
      // - ID: f424bb575238275aac70b0324ca3a77d5b3dddc4

      var remotePeerFindPredecessor = nock('https://localhost:3000').post('/find-predecessor').reply(500);

      request(peer.app).
        post('/find-successor').
        set('content-type', 'application/json').
        send({ id: 'f424bb575238275aac70b0324ca3a77d5b3dddc4' }).
        end(function (err, res) {
          assert.that(err).is.not.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(remotePeerFindPredecessor.isDone()).is.true();
          done();
        });
    });

    test('returns 500 if getting the successor of the found predecessor fails.', function (done) {
      // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
      // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
      // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
      //
      // - ID: f424bb575238275aac70b0324ca3a77d5b3dddc4

      var remotePeerFindPredecessor = nock('https://localhost:3000').post('/find-predecessor').reply(200, new Node({
        host: 'localhost',
        port: 2000
      }));
      var remotePeerSuccessor = nock('https://localhost:2000').post('/successor').reply(500);

      request(peer.app).
        post('/find-successor').
        set('content-type', 'application/json').
        send({ id: 'f424bb575238275aac70b0324ca3a77d5b3dddc4' }).
        end(function (err, res) {
          assert.that(err).is.not.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(remotePeerFindPredecessor.isDone()).is.true();
          assert.that(remotePeerSuccessor.isDone()).is.true();
          done();
        });
    });

    test('returns the successor of the found predecessor.', function (done) {
      // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
      // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
      // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
      //
      // - ID: f424bb575238275aac70b0324ca3a77d5b3dddc4

      var remotePeerFindPredecessor = nock('https://localhost:3000').post('/find-predecessor').reply(200, new Node({
        host: 'localhost',
        port: 2000
      }));
      var remotePeerSuccessor = nock('https://localhost:2000').post('/successor').reply(200, new Node({
        host: 'localhost',
        port: 6000
      }));

      request(peer.app).
        post('/find-successor').
        set('content-type', 'application/json').
        send({ id: 'f424bb575238275aac70b0324ca3a77d5b3dddc4' }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({
            host: 'localhost',
            port: 6000,
            id: '6184ca5584478c69887da758e7d08fd83810a756'
          });
          assert.that(remotePeerFindPredecessor.isDone()).is.true();
          assert.that(remotePeerSuccessor.isDone()).is.true();
          done();
        });
    });

    test('adds the successor to the list of well-known peers.', function (done) {
      // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
      // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
      // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
      //
      // - ID: f424bb575238275aac70b0324ca3a77d5b3dddc4

      var remotePeerFindPredecessor = nock('https://localhost:3000').post('/find-predecessor').reply(200, new Node({
        host: 'localhost',
        port: 2000
      }));
      var remotePeerSuccessor = nock('https://localhost:2000').post('/successor').reply(200, new Node({
        host: 'localhost',
        port: 6000
      }));

      assert.that(peer.wellKnownPeers.get()).is.equalTo([
        { host: 'localhost', port: 3000 }
      ]);

      request(peer.app).
        post('/find-successor').
        set('content-type', 'application/json').
        send({ id: 'f424bb575238275aac70b0324ca3a77d5b3dddc4' }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(peer.wellKnownPeers.get()).is.equalTo([
            { host: 'localhost', port: 3000 },
            { host: 'localhost', port: 6000 }
          ]);
          assert.that(remotePeerFindPredecessor.isDone()).is.true();
          assert.that(remotePeerSuccessor.isDone()).is.true();
          done();
        });
    });
  });
});
