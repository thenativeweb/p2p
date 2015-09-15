'use strict';

var path = require('path');

var assert = require('assertthat'),
    request = require('supertest'),
    requireAll = require('require-all');

var closestPrecedingFinger = require('../../lib/routes/closestPrecedingFinger'),
    Node = require('../../lib/Node');

var mocks = requireAll(path.join(__dirname, 'mocks'));

suite('closestPrecedingFinger', function () {
  test('is a function.', function (done) {
    assert.that(closestPrecedingFinger).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', function (done) {
    assert.that(function () {
      closestPrecedingFinger();
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
      assert.that(closestPrecedingFinger(peer)).is.ofType('function');
      done();
    });

    test('returns 400 if options are missing.', function (done) {
      request(peer.app).
        post('/closest-preceding-finger').
        set('content-type', 'application/json').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('returns 400 if id is missing.', function (done) {
      request(peer.app).
        post('/closest-preceding-finger').
        set('content-type', 'application/json').
        send({}).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('returns itself if the finger table is empty.', function (done) {
      request(peer.app).
        post('/closest-preceding-finger').
        set('content-type', 'application/json').
        send({ id: '219b433e1734312a30e3632a51fdab4fedd07bcc' }).
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({
            host: 'localhost',
            port: 3000,
            id: '12a30e3632a51fdab4fedd07bcc219b433e17343'
          });
          done();
        });
    });

    suite('returns the correct finger if id', function () {
      test('is behind the last finger.', function (done) {
        // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
        // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
        // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
        //
        // - ID: 11c6541e6949f387bbcfdfcbad854b601607f286

        peer.fingers[23] = new Node({ host: 'localhost', port: 4000 });
        peer.fingers[42] = new Node({ host: 'localhost', port: 2000 });

        request(peer.app).
          post('/closest-preceding-finger').
          set('content-type', 'application/json').
          send({ id: '11c6541e6949f387bbcfdfcbad854b601607f286' }).
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

      test('is between two fingers.', function (done) {
        // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
        // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
        // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
        //
        // - ID: e6949f387bbcfdfcbad854b601607f28611c6541

        peer.fingers[23] = new Node({ host: 'localhost', port: 4000 });
        peer.fingers[42] = new Node({ host: 'localhost', port: 2000 });

        request(peer.app).
          post('/closest-preceding-finger').
          set('content-type', 'application/json').
          send({ id: 'e6949f387bbcfdfcbad854b601607f28611c6541' }).
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

      test('is before the first finger.', function (done) {
        // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
        // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
        // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
        //
        // - ID: 219b433e1734312a30e3632a51fdab4fedd07bcc

        peer.fingers[23] = new Node({ host: 'localhost', port: 4000 });
        peer.fingers[42] = new Node({ host: 'localhost', port: 2000 });

        request(peer.app).
          post('/closest-preceding-finger').
          set('content-type', 'application/json').
          send({ id: '219b433e1734312a30e3632a51fdab4fedd07bcc' }).
          end(function (err, res) {
            assert.that(err).is.null();
            assert.that(res.statusCode).is.equalTo(200);
            assert.that(res.body).is.equalTo({
              host: 'localhost',
              port: 3000,
              id: '12a30e3632a51fdab4fedd07bcc219b433e17343'
            });
            done();
          });
      });

      test('exactly matches a finger.', function (done) {
        // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
        // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
        // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
        //
        // - ID: 07f28618c6541e6949f387bbcfdfcbad854b6016

        peer.fingers[23] = new Node({ host: 'localhost', port: 4000 });
        peer.fingers[42] = new Node({ host: 'localhost', port: 2000 });

        request(peer.app).
          post('/closest-preceding-finger').
          set('content-type', 'application/json').
          send({ id: '07f28618c6541e6949f387bbcfdfcbad854b6016' }).
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

      test('exactly matches the peer itself.', function (done) {
        // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
        // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
        // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
        //
        // - ID: 12a30e3632a51fdab4fedd07bcc219b433e17343

        peer.fingers[23] = new Node({ host: 'localhost', port: 4000 });
        peer.fingers[42] = new Node({ host: 'localhost', port: 2000 });

        request(peer.app).
          post('/closest-preceding-finger').
          set('content-type', 'application/json').
          send({ id: '12a30e3632a51fdab4fedd07bcc219b433e17343' }).
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
    });
  });
});
