'use strict';

var assert = require('assertthat');

var WellKnownPeers = require('../lib/WellKnownPeers');

suite('WellKnownPeers', function () {
  test('is a function.', function (done) {
    assert.that(WellKnownPeers).is.ofType('function');
    done();
  });

  suite('get', function () {
    test('returns an empty array.', function (done) {
      var wellKnownPeers = new WellKnownPeers();

      assert.that(wellKnownPeers.get()).is.equalTo([]);
      done();
    });

    test('returns an array with all added peers.', function (done) {
      var wellKnownPeers = new WellKnownPeers();

      wellKnownPeers.add([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 }
      ]);

      assert.that(wellKnownPeers.get()).is.equalTo([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 }
      ]);
      done();
    });
  });

  suite('add', function () {
    test('adds a single peer.', function (done) {
      var wellKnownPeers = new WellKnownPeers();

      wellKnownPeers.add({ host: 'localhost', port: 3000 });

      assert.that(wellKnownPeers.get()).is.equalTo([
        { host: 'localhost', port: 3000 }
      ]);
      done();
    });

    test('adds multiple peers at once.', function (done) {
      var wellKnownPeers = new WellKnownPeers();

      wellKnownPeers.add([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 }
      ]);

      assert.that(wellKnownPeers.get()).is.equalTo([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 }
      ]);
      done();
    });

    test('adds multiple peers one by one.', function (done) {
      var wellKnownPeers = new WellKnownPeers();

      wellKnownPeers.add({ host: 'localhost', port: 3000 });
      wellKnownPeers.add({ host: 'localhost', port: 4000 });

      assert.that(wellKnownPeers.get()).is.equalTo([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 }
      ]);
      done();
    });

    test('does not add duplicate peers.', function (done) {
      var wellKnownPeers = new WellKnownPeers();

      wellKnownPeers.add([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 }
      ]);

      wellKnownPeers.add([
        { host: 'localhost', port: 4000 },
        { host: 'localhost', port: 5000 }
      ]);

      assert.that(wellKnownPeers.get()).is.equalTo([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 },
        { host: 'localhost', port: 5000 }
      ]);
      done();
    });

    test('ignores empty arrays.', function (done) {
      var wellKnownPeers = new WellKnownPeers();

      wellKnownPeers.add([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 }
      ]);

      wellKnownPeers.add([]);

      assert.that(wellKnownPeers.get()).is.equalTo([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 }
      ]);
      done();
    });
  });
});
