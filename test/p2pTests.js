'use strict';

var fs = require('fs'),
    path = require('path');

var assert = require('assertthat'),
    freeport = require('freeport');

var p2p = require('../lib/p2p'),
    Peer = require('../lib/Peer'),
    remote = require('../lib/remote');

/* eslint-disable no-process-env  */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/* eslint-enable no-process-env  */

suite('p2p', function () {
  test('is an object.', function (done) {
    assert.that(p2p).is.ofType('object');
    done();
  });

  suite('peer', function () {
    // Set the service interval to a very long timespan to avoid unwanted
    // side-effects in the unit tests that are caused by the housekeeping
    // functions.
    var serviceInterval = '1h';

    var certificate = fs.readFileSync(path.join(__dirname, '..', 'keys', 'localhost.selfsigned', 'certificate.pem')),
        privateKey = fs.readFileSync(path.join(__dirname, '..', 'keys', 'localhost.selfsigned', 'privateKey.pem'));

    var port;

    setup(function (done) {
      freeport(function (err, result) {
        port = result;
        done(err);
      });
    });

    test('is a function.', function (done) {
      assert.that(p2p.peer).is.ofType('function');
      done();
    });

    test('throws an error if options are missing.', function (done) {
      assert.that(function () {
        p2p.peer();
      }).is.throwing('Options are missing.');
      done();
    });

    test('throws an error if the host is missing.', function (done) {
      assert.that(function () {
        p2p.peer({
          port: port,
          privateKey: privateKey,
          certificate: certificate,
          serviceInterval: serviceInterval
        });
      }).is.throwing('Host is missing.');
      done();
    });

    test('throws an error if the port is missing.', function (done) {
      assert.that(function () {
        p2p.peer({
          host: 'localhost',
          privateKey: privateKey,
          certificate: certificate,
          serviceInterval: serviceInterval
        });
      }).is.throwing('Port is missing.');
      done();
    });

    test('throws an error if the private key is missing.', function (done) {
      assert.that(function () {
        p2p.peer({
          host: 'localhost',
          port: port,
          certificate: certificate,
          serviceInterval: serviceInterval
        });
      }).is.throwing('Private key is missing.');
      done();
    });

    test('throws an error if the certificate is missing.', function (done) {
      assert.that(function () {
        p2p.peer({
          host: 'localhost',
          port: port,
          privateKey: privateKey,
          serviceInterval: serviceInterval
        });
      }).is.throwing('Certificate is missing.');
      done();
    });

    test('returns an https peer.', function (done) {
      var peer = p2p.peer({
        host: 'localhost',
        port: port,
        privateKey: privateKey,
        certificate: certificate,
        serviceInterval: serviceInterval
      });

      assert.that(peer).is.instanceOf(Peer);
      done();
    });

    test('returns an http peer.', function (done) {
      var peer = p2p.peer({
        host: 'localhost',
        port: port,
        serviceInterval: serviceInterval
      });

      assert.that(peer).is.instanceOf(Peer);
      remote.protocol = 'https';
      done();
    });

    test('runs an https server.', function (done) {
      var peer = p2p.peer({
        host: 'localhost',
        port: port,
        privateKey: privateKey,
        certificate: certificate,
        serviceInterval: serviceInterval
      });

      remote(peer.self.host, peer.self.port).run('self', function (err) {
        assert.that(err).is.null();
        done();
      });
    });

    test('runs an http server.', function (done) {
      var peer = p2p.peer({
        host: 'localhost',
        port: port,
        serviceInterval: serviceInterval
      });

      remote(peer.self.host, peer.self.port).run('self', function (err) {
        assert.that(err).is.null();
        remote.protocol = 'https';
        done();
      });
    });
  });
});
