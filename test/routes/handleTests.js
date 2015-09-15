'use strict';

var path = require('path');

var assert = require('assertthat'),
    request = require('supertest'),
    requireAll = require('require-all');

var handle = require('../../lib/routes/handle');

var mocks = requireAll(path.join(__dirname, 'mocks'));

suite('handle', function () {
  test('is a function.', function (done) {
    assert.that(handle).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', function (done) {
    assert.that(function () {
      handle();
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
      assert.that(handle(peer)).is.ofType('function');
      done();
    });

    test('returns 404 if there is no action handler.', function (done) {
      request(peer.app).
        post('/handle/non-existent').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(404);
          done();
        });
    });

    test('calls the registered action handler.', function (done) {
      var wasActionHandlerCalled = false;

      peer.handle.foo = function (payload, callback) {
        wasActionHandlerCalled = true;
        callback(null);
      };

      request(peer.app).
        post('/handle/foo').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(wasActionHandlerCalled).is.true();
          done();
        });
    });

    test('hands over the body of the request to the action handler.', function (done) {
      peer.handle.foo = function (payload, callback) {
        assert.that(payload).is.equalTo({ foo: 'bar' });
        callback(null);
      };

      request(peer.app).
        post('/handle/foo').
        set('content-type', 'application/json').
        send({ foo: 'bar' }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          done();
        });
    });

    test('hands over an empty object if no request body is given.', function (done) {
      peer.handle.foo = function (payload, callback) {
        assert.that(payload).is.equalTo({});
        callback(null);
      };

      request(peer.app).
        post('/handle/foo').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          done();
        });
    });

    test('returns 200 if the action handler does not return an error.', function (done) {
      peer.handle.foo = function (payload, callback) {
        callback(null);
      };

      request(peer.app).
        post('/handle/foo').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          done();
        });
    });

    test('returns the result of the action handler.', function (done) {
      peer.handle.foo = function (payload, callback) {
        callback(null, { foo: 'bar' });
      };

      request(peer.app).
        post('/handle/foo').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({ foo: 'bar' });
          done();
        });
    });

    test('returns 500 if the action handler returns an error.', function (done) {
      peer.handle.foo = function (payload, callback) {
        callback(new Error('foobar'));
      };

      request(peer.app).
        post('/handle/foo').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(500);
          done();
        });
    });
  });
});
