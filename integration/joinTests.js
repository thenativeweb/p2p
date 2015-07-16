'use strict';

var assert = require('assertthat'),
    async = require('async');

var createPeers = require('./createPeers');

/* eslint-disable no-process-env  */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/* eslint-enable no-process-env  */

suite('join', function () {
  this.timeout(5 * 60 * 1000);

  test('connects 2 peers.', function (done) {
    createPeers({ count: 2 }, function (err, peers, env) {
      assert.that(err).is.null();
      async.series([
        function (callback) {
          env.waitUntil(peers).have('status').equalTo({ status: 'lonely' }, callback);
        },
        function (callback) {
          env.formRing(peers, callback);
        },
        function (callback) {
          env.waitUntil(peers).have('status').equalTo({ status: 'joined' }, callback);
        },
        function (callback) {
          env.isRing(peers, callback);
        },
        function (callback) {
          env.stop(peers, callback);
        }
      ], done);
    });
  });

  test('connects 3 peers.', function (done) {
    createPeers({ count: 3 }, function (err, peers, env) {
      assert.that(err).is.null();
      async.series([
        function (callback) {
          env.waitUntil(peers).have('status').equalTo({ status: 'lonely' }, callback);
        },
        function (callback) {
          env.formRing(peers, callback);
        },
        function (callback) {
          env.waitUntil(peers).have('status').equalTo({ status: 'joined' }, callback);
        },
        function (callback) {
          env.isRing(peers, callback);
        },
        function (callback) {
          env.stop(peers, callback);
        }
      ], done);
    });
  });

  test('connects 5 peers.', function (done) {
    createPeers({ count: 5 }, function (err, peers, env) {
      assert.that(err).is.null();
      async.series([
        function (callback) {
          env.waitUntil(peers).have('status').equalTo({ status: 'lonely' }, callback);
        },
        function (callback) {
          env.formRing(peers, callback);
        },
        function (callback) {
          env.waitUntil(peers).have('status').equalTo({ status: 'joined' }, callback);
        },
        function (callback) {
          env.isRing(peers, callback);
        },
        function (callback) {
          env.stop(peers, callback);
        }
      ], done);
    });
  });

  test('connects 7 peers.', function (done) {
    createPeers({ count: 7 }, function (err, peers, env) {
      assert.that(err).is.null();
      async.series([
        function (callback) {
          env.waitUntil(peers).have('status').equalTo({ status: 'lonely' }, callback);
        },
        function (callback) {
          env.formRing(peers, callback);
        },
        function (callback) {
          env.waitUntil(peers).have('status').equalTo({ status: 'joined' }, callback);
        },
        function (callback) {
          env.isRing(peers, callback);
        },
        function (callback) {
          env.stop(peers, callback);
        }
      ], done);
    });
  });

  test('connects 11 peers.', function (done) {
    createPeers({ count: 11 }, function (err, peers, env) {
      assert.that(err).is.null();
      async.series([
        function (callback) {
          env.waitUntil(peers).have('status').equalTo({ status: 'lonely' }, callback);
        },
        function (callback) {
          env.formRing(peers, callback);
        },
        function (callback) {
          env.waitUntil(peers).have('status').equalTo({ status: 'joined' }, callback);
        },
        function (callback) {
          env.isRing(peers, callback);
        },
        function (callback) {
          env.stop(peers, callback);
        }
      ], done);
    });
  });
});
