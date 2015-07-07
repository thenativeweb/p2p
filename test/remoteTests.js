'use strict';

var assert = require('assertthat'),
    nock = require('nock');

var remote = require('../lib/remote');

suite('remote', function () {
  test('is a function.', function (done) {
    assert.that(remote).is.ofType('function');
    done();
  });

  test('throws an error if host is missing.', function (done) {
    assert.that(function () {
      remote();
    }).is.throwing('Host is missing.');
    done();
  });

  test('throws an error if port is missing.', function (done) {
    assert.that(function () {
      remote('localhost');
    }).is.throwing('Port is missing.');
    done();
  });

  test('returns an object.', function (done) {
    assert.that(remote('localhost', 3000)).is.ofType('object');
    done();
  });

  suite('run', function () {
    test('is a function.', function (done) {
      assert.that(remote('localhost', 3000).run).is.ofType('function');
      done();
    });

    test('throws an error if the function to be called is missing.', function (done) {
      assert.that(function () {
        remote('localhost', 3000).run();
      }).is.throwing('Function is missing.');
      done();
    });

    test('throws an error if the callback is missing.', function (done) {
      assert.that(function () {
        remote('localhost', 3000).run('rpc');
      }).is.throwing('Callback is missing.');
      done();
    });

    test('calls the remote function with the given arguments.', function (done) {
      var scope = nock('https://localhost:3000').
        post('/rpc', { foo: 'ping' }).
        reply(200, { foo: 'pong' });

      remote('localhost', 3000).run('rpc', { foo: 'ping' }, function (err, result) {
        assert.that(err).is.null();
        assert.that(result).is.equalTo({ foo: 'pong' });
        assert.that(scope.isDone()).is.true();
        done();
      });
    });

    test('calls the remote function with an empty object if no arguments are given.', function (done) {
      var scope = nock('https://localhost:3000').
        post('/rpc', {}).
        reply(200, { foo: 'pong' });

      remote('localhost', 3000).run('rpc', function (err, result) {
        assert.that(err).is.null();
        assert.that(result).is.equalTo({ foo: 'pong' });
        assert.that(scope.isDone()).is.true();
        done();
      });
    });

    test('returns an error if the target is not reachable.', function (done) {
      // Increase timeout to make this test work even when on slow networks
      // (such as hotels' wireless networks).
      this.timeout(10 * 1000);

      remote('non-existent.local', 3000).run('rpc', function (err) {
        assert.that(err).is.not.null();
        done();
      });
    });

    test('returns an error if a status code other than 200 is returned.', function (done) {
      var scope = nock('https://localhost:3000').
        post('/rpc', {}).
        reply(500);

      remote('localhost', 3000).run('rpc', function (err) {
        assert.that(err).is.not.null();
        assert.that(err.message).is.equalTo('Unexpected status code 500 when running rpc.');
        assert.that(scope.isDone()).is.true();
        done();
      });
    });
  });
});
