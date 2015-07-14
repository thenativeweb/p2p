'use strict';

var path = require('path');

var assert = require('assertthat'),
    nock = require('nock'),
    request = require('supertest'),
    requireAll = require('require-all');

var fixSuccessors = require('../../lib/routes/fixSuccessors'),
    Node = require('../../lib/Node');

var mocks = requireAll(path.join(__dirname, 'mocks'));

suite('fixSuccessors', function () {
  test('is a function.', function (done) {
    assert.that(fixSuccessors).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', function (done) {
    assert.that(function () {
      fixSuccessors();
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
      assert.that(fixSuccessors(peer)).is.ofType('function');
      done();
    });

    test('fixes the successor if the successor is not reachable.', function (done) {
      var fixSuccessorCalled = false;

      peer.fixSuccessor = function () {
        fixSuccessorCalled = true;
      };

      request(peer.app).
        post('/fix-successors').
        end(function (err, res) {
          assert.that(err).is.not.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(fixSuccessorCalled).is.true();
          done();
        });
    });

    test('stores the successors returned by its successor and prepends it with the successor itself.', function (done) {
      var remotePeerSuccessors = nock('https://localhost:4000').post('/successors').reply(200, [
        new Node({
          host: 'localhost',
          port: 5000
        }),
        new Node({
          host: 'localhost',
          port: 6000
        })
      ]);

      request(peer.app).
        post('/fix-successors').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(peer.successors).is.equalTo([
            {
              host: 'localhost',
              port: 4000,
              id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
            }, {
              host: 'localhost',
              port: 5000,
              id: '74ed504de10a894a40d9545a0d4ca6d3885af8ed'
            }, {
              host: 'localhost',
              port: 6000,
              id: '6184ca5584478c69887da758e7d08fd83810a756'
            }
          ]);
          assert.that(remotePeerSuccessors.isDone()).is.true();
          done();
        });
    });

    test('stores at least the successor if the successor does not have any successors.', function (done) {
      var remotePeerSuccessors = nock('https://localhost:4000').post('/successors').reply(200, []);

      request(peer.app).
        post('/fix-successors').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(peer.successors).is.equalTo([
            {
              host: 'localhost',
              port: 4000,
              id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
            }
          ]);
          assert.that(remotePeerSuccessors.isDone()).is.true();
          done();
        });
    });
  });
});
