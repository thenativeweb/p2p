'use strict';

var path = require('path');

var assert = require('assertthat'),
    request = require('supertest'),
    requireAll = require('require-all');

var metadata = require('../../lib/routes/metadata');

var mocks = requireAll(path.join(__dirname, 'mocks'));

suite('metadata', function () {
  test('is a function.', function (done) {
    assert.that(metadata).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', function (done) {
    assert.that(function () {
      metadata();
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
      assert.that(metadata(peer)).is.ofType('function');
      done();
    });

    test('returns an empty object if no metadata are set.', function (done) {
      request(peer.app).
        post('/metadata').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({});
          done();
        });
    });

    test('returns metadata.', function (done) {
      peer.metadata = { foo: 'bar' };

      request(peer.app).
        post('/metadata').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({ foo: 'bar' });
          done();
        });
    });
  });
});
