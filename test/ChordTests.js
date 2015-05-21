'use strict';

var events = require('events'),
    fs = require('fs'),
    path = require('path');

var assert = require('assertthat'),
    freeport = require('freeport'),
    nock = require('nock');

var Chord = require('../lib/Chord'),
    getId = require('../lib/getId'),
    remote = require('../lib/remote');

var EventEmitter = events.EventEmitter;

/*eslint-disable no-process-env*/
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/*eslint-enable no-process-env*/

suite('Chord', function () {
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
    assert.that(Chord).is.ofType('function');
    done();
  });

  test('throws an error if options are missing.', function (done) {
    assert.that(function () {
      /*eslint-disable no-new*/
      new Chord();
      /*eslint-enable no-new*/
    }).is.throwing('Options are missing.');
    done();
  });

  test('throws an error if the host is missing.', function (done) {
    assert.that(function () {
      /*eslint-disable no-new*/
      new Chord({
        port: port,
        privateKey: privateKey,
        certificate: certificate,
        serviceInterval: serviceInterval
      });
      /*eslint-enable no-new*/
    }).is.throwing('Host is missing.');
    done();
  });

  test('throws an error if the port is missing.', function (done) {
    assert.that(function () {
      /*eslint-disable no-new*/
      new Chord({
        host: 'localhost',
        privateKey: privateKey,
        certificate: certificate,
        serviceInterval: serviceInterval
      });
      /*eslint-enable no-new*/
    }).is.throwing('Port is missing.');
    done();
  });

  test('throws an error if the private key is missing.', function (done) {
    assert.that(function () {
      /*eslint-disable no-new*/
      new Chord({
        host: 'localhost',
        port: port,
        certificate: certificate,
        serviceInterval: serviceInterval
      });
      /*eslint-enable no-new*/
    }).is.throwing('Private key is missing.');
    done();
  });

  test('throws an error if the certificate is missing.', function (done) {
    assert.that(function () {
      /*eslint-disable no-new*/
      new Chord({
        host: 'localhost',
        port: port,
        privateKey: privateKey,
        serviceInterval: serviceInterval
      });
      /*eslint-enable no-new*/
    }).is.throwing('Certificate is missing.');
    done();
  });

  test('returns an event emitter.', function (done) {
    var chord = new Chord({
      host: 'localhost',
      port: port,
      privateKey: privateKey,
      certificate: certificate,
      serviceInterval: serviceInterval
    });

    assert.that(chord).is.instanceOf(EventEmitter);
    done();
  });

  suite('instance', function () {
    var chord;

    setup(function (done) {
      chord = new Chord({
        host: 'localhost',
        port: port,
        privateKey: privateKey,
        certificate: certificate,
        serviceInterval: serviceInterval
      });
      done();
    });

    test('runs a server.', function (done) {
      remote('localhost', port).run('self', function (err) {
        assert.that(err).is.null();
        done();
      });
    });

    suite('self', function () {
      test('contains information on the node itself.', function (done) {
        assert.that(chord.self).is.equalTo({
          host: 'localhost',
          port: port,
          id: getId('localhost:' + port)
        });
        done();
      });
    });

    suite('successor', function () {
      test('initially contains information on the node itself.', function (done) {
        assert.that(chord.successor).is.equalTo({
          host: 'localhost',
          port: port,
          id: getId('localhost:' + port)
        });
        done();
      });
    });

    suite('predecessor', function () {
      test('initially contains information on the node itself.', function (done) {
        assert.that(chord.predecessor).is.equalTo({
          host: 'localhost',
          port: port,
          id: getId('localhost:' + port)
        });
        done();
      });
    });

    suite('successors', function () {
      test('is initially empty.', function (done) {
        assert.that(chord.successors).is.equalTo([]);
        done();
      });
    });

    suite('fingers', function () {
      test('is initially empty.', function (done) {
        assert.that(chord.fingers).is.equalTo([]);
        done();
      });
    });

    suite('serviceInterval', function () {
      test('contains the given service interval in milliseconds.', function (done) {
        assert.that(chord.serviceInterval).is.equalTo(60 * 60 * 1000);
        done();
      });

      test('defaults to 30 seconds.', function (done) {
        freeport(function (err, freePort) {
          assert.that(err).is.null();

          chord = new Chord({
            host: 'localhost',
            port: freePort,
            privateKey: privateKey,
            certificate: certificate
          });

          assert.that(chord.serviceInterval).is.equalTo(30 * 1000);
          done();
        });
      });
    });

    suite('wobbleFactor', function () {
      test('contains half the service interval in milliseconds.', function (done) {
        assert.that(chord.wobbleFactor).is.equalTo(0.5 * chord.serviceInterval);
        done();
      });
    });

    suite('setSuccessor', function () {
      test('is a function.', function (done) {
        assert.that(chord.setSuccessor).is.ofType('function');
        done();
      });

      test('throws an error if successor is missing.', function (done) {
        assert.that(function () {
          chord.setSuccessor();
        }).is.throwing('Successor is missing.');
        done();
      });

      test('throws an error if the host is missing.', function (done) {
        assert.that(function () {
          chord.setSuccessor({ port: 3000 });
        }).is.throwing('Host is missing.');
        done();
      });

      test('throws an error if the port is missing.', function (done) {
        assert.that(function () {
          chord.setSuccessor({ host: 'localhost' });
        }).is.throwing('Port is missing.');
        done();
      });

      test('sets the successor to the given successor.', function (done) {
        chord.setSuccessor({ host: 'example.com', port: 3000 });
        assert.that(chord.successor).is.equalTo({
          host: 'example.com',
          port: 3000,
          id: 'f8f595e2159543d3b9dd3f3ebbe48d4faa0819f1'
        });
        done();
      });

      test('emits a changed-successor event.', function (done) {
        chord.once('changed-successor', function (successor) {
          assert.that(successor).is.equalTo({
            host: 'example.com',
            port: 3000,
            id: 'f8f595e2159543d3b9dd3f3ebbe48d4faa0819f1'
          });
          done();
        });
        chord.setSuccessor({ host: 'example.com', port: 3000 });
      });
    });

    suite('setPredecessor', function () {
      test('is a function.', function (done) {
        assert.that(chord.setPredecessor).is.ofType('function');
        done();
      });

      test('throws an error if the host is missing.', function (done) {
        assert.that(function () {
          chord.setPredecessor({ port: 3000 });
        }).is.throwing('Host is missing.');
        done();
      });

      test('throws an error if the port is missing.', function (done) {
        assert.that(function () {
          chord.setPredecessor({ host: 'localhost' });
        }).is.throwing('Port is missing.');
        done();
      });

      test('sets the predecessor to the given predecessor.', function (done) {
        chord.setPredecessor({ host: 'example.com', port: 3000 });
        assert.that(chord.predecessor).is.equalTo({
          host: 'example.com',
          port: 3000,
          id: 'f8f595e2159543d3b9dd3f3ebbe48d4faa0819f1'
        });
        done();
      });

      test('sets the predecessor to undefined if no predecessor is given.', function (done) {
        chord.setPredecessor();
        assert.that(chord.predecessor).is.undefined();
        done();
      });

      test('emits a changed-predecessor event.', function (done) {
        chord.once('changed-predecessor', function (predecessor) {
          assert.that(predecessor).is.equalTo({
            host: 'example.com',
            port: 3000,
            id: 'f8f595e2159543d3b9dd3f3ebbe48d4faa0819f1'
          });
          done();
        });
        chord.setPredecessor({ host: 'example.com', port: 3000 });
      });

      test('emits a changed-predecessor event when the predecessor is set to undefined.', function (done) {
        chord.once('changed-predecessor', function (predecessor) {
          assert.that(predecessor).is.undefined();
          done();
        });
        chord.setPredecessor();
      });
    });

    suite('status', function () {
      test('is a function.', function (done) {
        assert.that(chord.status).is.ofType('function');
        done();
      });

      test('returns lonely if the node only knows about itself.', function (done) {
        chord.setSuccessor({ host: chord.self.host, port: chord.self.port });
        chord.setPredecessor({ host: chord.self.host, port: chord.self.port });

        assert.that(chord.status()).is.equalTo('lonely');
        done();
      });

      test('returns joined if the node is not connected to itself.', function (done) {
        chord.setSuccessor({ host: 'example.com', port: 3000 });
        chord.setPredecessor({ host: 'example.com', port: 3000 });

        assert.that(chord.status()).is.equalTo('joined');
        done();
      });

      suite('returns unbalanced if the node', function () {
        suite('is its own successor and it', function () {
          test('does not have a predecessor.', function (done) {
            chord.setSuccessor({ host: chord.self.host, port: chord.self.port });
            chord.setPredecessor();

            assert.that(chord.status()).is.equalTo('unbalanced');
            done();
          });

          test('does have a predecessor other than itself.', function (done) {
            chord.setSuccessor({ host: chord.self.host, port: chord.self.port });
            chord.setPredecessor({ host: 'example.com', port: 3000 });

            assert.that(chord.status()).is.equalTo('unbalanced');
            done();
          });
        });

        suite('does have a successor other than itself and it', function () {
          test('does not have a predecessor.', function (done) {
            chord.setSuccessor({ host: 'example.com', port: 3000 });
            chord.setPredecessor();

            assert.that(chord.status()).is.equalTo('unbalanced');
            done();
          });

          test('is its own predecessor.', function (done) {
            chord.setSuccessor({ host: 'example.com', port: 3000 });
            chord.setPredecessor({ host: chord.self.host, port: chord.self.port });

            assert.that(chord.status()).is.equalTo('unbalanced');
            done();
          });
        });
      });
    });

    suite('fixSuccessor', function () {
      test('is a function.', function (done) {
        assert.that(chord.fixSuccessor).is.ofType('function');
        done();
      });

      test('sets itself as its successor if the successors list is empty.', function (done) {
        chord.setSuccessor({ host: 'example.com', port: 3000 });
        chord.successors = [];

        chord.fixSuccessor();

        assert.that(chord.successor).is.equalTo(chord.self);
        done();
      });

      test('sets itself as its successor if the successors list only has one element.', function (done) {
        chord.setSuccessor({ host: 'example.com', port: 3000 });
        chord.successors = [{ host: 'foo.com', port: 3000 }];

        chord.fixSuccessor();

        assert.that(chord.successor).is.equalTo(chord.self);
        done();
      });

      test('sets a new successor if the successors list has two elements.', function (done) {
        chord.setSuccessor({ host: 'example.com', port: 3000 });
        chord.successors = [
          { host: 'foo.com', port: 3000 },
          { host: 'bar.com', port: 3000 }
        ];

        chord.fixSuccessor();

        assert.that(chord.successor).is.equalTo({
          host: 'bar.com',
          port: 3000,
          id: '73b2c872ab0f76bc74f7f4d48a688d239c65ec4b'
        });
        done();
      });

      test('sets a new successor if the successors list has more than two elements.', function (done) {
        chord.setSuccessor({ host: 'example.com', port: 3000 });
        chord.successors = [
          { host: 'foo.com', port: 3000 },
          { host: 'bar.com', port: 3000 },
          { host: 'baz.com', port: 3000 },
          { host: 'bas.com', port: 3000 }
        ];

        chord.fixSuccessor();

        assert.that(chord.successor).is.equalTo({
          host: 'bar.com',
          port: 3000,
          id: '73b2c872ab0f76bc74f7f4d48a688d239c65ec4b'
        });
        done();
      });
    });

    suite('join', function () {
      test('is a function.', function (done) {
        assert.that(chord.join).is.ofType('function');
        done();
      });

      test('throws an error if options are missing.', function (done) {
        assert.that(function () {
          chord.join();
        }).is.throwing('Options are missing.');
        done();
      });

      test('throws an error if the host is missing.', function (done) {
        assert.that(function () {
          chord.join({ port: 3000 });
        }).is.throwing('Host is missing.');
        done();
      });

      test('throws an error if the port is missing.', function (done) {
        assert.that(function () {
          chord.join({ host: 'localhost' });
        }).is.throwing('Port is missing.');
        done();
      });

      test('throws an error if the callback is missing.', function (done) {
        assert.that(function () {
          chord.join({ host: 'localhost', port: 3000 });
        }).is.throwing('Callback is missing.');
        done();
      });

      test('calls join with the given node.', function (done) {
        var scope = nock('https://localhost:' + port).
          post('/join', { host: 'example.com', port: 3000 }).
          reply(200);

        chord.join({ host: 'example.com', port: 3000 }, function (err) {
          assert.that(err).is.null();
          assert.that(scope.isDone()).is.true();
          done();
        });
      });

      test('returns an error if the join fails.', function (done) {
        var scope = nock('https://localhost:' + port).
          post('/join', { host: 'example.com', port: 3000 }).
          reply(500);

        chord.join({ host: 'example.com', port: 3000 }, function (err) {
          assert.that(err).is.not.null();
          assert.that(err.message).is.equalTo('Failed to join.');
          assert.that(scope.isDone()).is.true();
          done();
        });
      });
    });

    suite('getNodeFor', function () {
      test('is a function.', function (done) {
        assert.that(chord.getNodeFor).is.ofType('function');
        done();
      });

      test('throws an error if value is missing.', function (done) {
        assert.that(function () {
          chord.getNodeFor();
        }).is.throwing('Value is missing.');
        done();
      });

      test('throws an error if callback is missing.', function (done) {
        assert.that(function () {
          chord.getNodeFor('foo');
        }).is.throwing('Callback is missing.');
        done();
      });

      test('calls findSuccessor with the id of the given value.', function (done) {
        var scope = nock('https://localhost:' + port).
          post('/find-successor', { id: '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33' }).
          reply(200, {
            host: 'example.com',
            port: 3000,
            id: getId('example.com:3000')
          });

        chord.getNodeFor('foo', function (err, successor) {
          assert.that(err).is.null();
          assert.that(successor).is.equalTo({
            host: 'example.com',
            port: 3000,
            id: getId('example.com:3000')
          });
          assert.that(scope.isDone()).is.true();
          done();
        });
      });

      test('returns an error if findSuccessor fails.', function (done) {
        var scope = nock('https://localhost:' + port).
          post('/find-successor', { id: '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33' }).
          reply(500);

        chord.getNodeFor('foo', function (err) {
          assert.that(err).is.not.null();
          assert.that(scope.isDone()).is.true();
          done();
        });
      });
    });
  });
});
