'use strict';

var path = require('path');

var assert = require('assertthat'),
    nock = require('nock'),
    request = require('supertest'),
    requireAll = require('require-all');

var Endpoint = require('../../lib/Endpoint'),
    fixPredecessor = require('../../lib/routes/fixPredecessor');

var mocks = requireAll(path.join(__dirname, 'mocks'));

suite('fixPredecessor', function () {
  test('is a function.', function (done) {
    assert.that(fixPredecessor).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', function (done) {
    assert.that(function () {
      fixPredecessor();
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
      assert.that(fixPredecessor(peer)).is.ofType('function');
      done();
    });

    test('returns 200 if there is no predecessor.', function (done) {
      peer = new mocks.UnbalancedPeerWithoutPredecessor({
        host: 'localhost',
        port: 3000
      });

      request(peer.app).
        post('/fix-predecessor').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          done();
        });
    });

    test('does not change the predecessor if the predecessor is reachable.', function (done) {
      var remotePeerSelf = nock('https://localhost:2000').post('/self').reply(200, new Endpoint({
        host: 'localhost',
        port: 2000
      }));

      request(peer.app).
        post('/fix-predecessor').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(peer.predecessor).is.equalTo({
            host: 'localhost',
            port: 2000,
            id: '07f28618c6541e6949f387bbcfdfcbad854b6016'
          });
          assert.that(remotePeerSelf.isDone()).is.true();
          done();
        });
    });

    test('removes the predecessor if the predecessor is not reachable.', function (done) {
      request(peer.app).
        post('/fix-predecessor').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(peer.predecessor).is.undefined();
          done();
        });
    });
  });
});
