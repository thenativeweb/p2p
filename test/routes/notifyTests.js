'use strict';

var path = require('path');

var assert = require('assertthat'),
    request = require('supertest'),
    requireAll = require('require-all');

var Node = require('../../lib/Node'),
    notify = require('../../lib/routes/notify');

var mocks = requireAll(path.join(__dirname, 'mocks'));

suite('notify', function () {
  test('is a function.', function (done) {
    assert.that(notify).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', function (done) {
    assert.that(function () {
      notify();
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
      assert.that(notify(peer)).is.ofType('function');
      done();
    });

    test('returns 400 if options are missing.', function (done) {
      request(peer.app).
        post('/notify').
        set('content-type', 'application/json').
        end(function (err, res) {
          assert.that(err).is.not.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('returns 400 if host is missing.', function (done) {
      request(peer.app).
        post('/notify').
        set('content-type', 'application/json').
        send({ port: 4000 }).
        end(function (err, res) {
          assert.that(err).is.not.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('returns 400 if port is missing.', function (done) {
      request(peer.app).
        post('/notify').
        set('content-type', 'application/json').
        send({ host: 'localhost' }).
        end(function (err, res) {
          assert.that(err).is.not.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('sets the predecessor if the peer is unbalanced.', function (done) {
      peer = new mocks.UnbalancedPeerWithoutPredecessor({ host: 'localhost', port: 3000 });

      request(peer.app).
        post('/notify').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 2000 }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(peer.predecessor).is.equalTo({
            host: 'localhost',
            port: 2000,
            id: '07f28618c6541e6949f387bbcfdfcbad854b6016'
          });
          done();
        });
    });

    test('sets the predecessor if the peer is joined, but the new predecessor is closer than the old one.', function (done) {
      // Initially, the predecessor of 3000 is 4000. When 2000 notifies 3000,
      // 3000 detects that the id of 2000 is closer than the id of 4000, hence
      // it decides to accept 2000 as its new predecessor.
      //
      // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
      // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
      // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343

      peer.predecessor = new Node({ host: 'localhost', port: 4000 });

      request(peer.app).
        post('/notify').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 2000 }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(peer.predecessor).is.equalTo({
            host: 'localhost',
            port: 2000,
            id: '07f28618c6541e6949f387bbcfdfcbad854b6016'
          });
          done();
        });
    });

    test('does not set the predecessor if the peer is joined, but the new predecessor is farther away than the old one.', function (done) {
      // Initially, the predecessor of 3000 is 2000. When 4000 notifies 3000,
      // 3000 detects that the id of 4000 is farther away than the id of 2000,
      // hence it decides to ignore 4000 and to keep 2000 as its predecessor.
      //
      // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
      // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
      // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343

      peer.predecessor = new Node({ host: 'localhost', port: 2000 });

      request(peer.app).
        post('/notify').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 4000 }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(peer.predecessor).is.equalTo({
            host: 'localhost',
            port: 2000,
            id: '07f28618c6541e6949f387bbcfdfcbad854b6016'
          });
          done();
        });
    });
  });
});
