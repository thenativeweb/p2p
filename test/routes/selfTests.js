'use strict';

var path = require('path');

var assert = require('assertthat'),
    express = require('express'),
    request = require('supertest'),
    requireAll = require('require-all');

var self = require('../../lib/routes/self');

var mocks = requireAll(path.join(__dirname, 'mocks'));

suite('self', function () {
  test('is a function.', function (done) {
    assert.that(self).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', function (done) {
    assert.that(function () {
      self();
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
      assert.that(self(peer)).is.ofType('function');
      done();
    });

    test('returns self.', function (done) {
      request(express().post('/self', self(peer))).
        post('/self').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo(peer.self);
          done();
        });
    });
  });
});
