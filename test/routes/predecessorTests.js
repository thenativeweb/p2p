'use strict';

var path = require('path');

var assert = require('assertthat'),
    request = require('supertest'),
    requireAll = require('require-all');

var predecessor = require('../../lib/routes/predecessor');

var mocks = requireAll(path.join(__dirname, 'mocks'));

suite('predecessor', function () {
  test('is a function.', function (done) {
    assert.that(predecessor).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', function (done) {
    assert.that(function () {
      predecessor();
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
      assert.that(predecessor(peer)).is.ofType('function');
      done();
    });

    test('returns predecessor.', function (done) {
      request(peer.app).
        post('/predecessor').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({
            host: 'localhost',
            port: 2000,
            id: '07f28618c6541e6949f387bbcfdfcbad854b6016'
          });
          done();
        });
    });

    test('returns an empty object if peer is unbalanced.', function (done) {
      peer = new mocks.UnbalancedPeerWithoutPredecessor({
        host: 'localhost',
        port: 3000
      });

      request(peer.app).
        post('/predecessor').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({});
          done();
        });
    });
  });
});
