'use strict';

var assert = require('assertthat');

var Node = require('../lib/Node');

suite('Node', function () {
  test('is a function.', function (done) {
    assert.that(Node).is.ofType('function');
    done();
  });

  test('throws an error if options are missing.', function (done) {
    assert.that(function () {
      /* eslint-disable no-new */
      new Node();
      /* eslint-enable no-new */
    }).is.throwing('Options are missing.');
    done();
  });

  test('throws an error if host is missing.', function (done) {
    assert.that(function () {
      /* eslint-disable no-new */
      new Node({ port: 3000 });
      /* eslint-enable no-new */
    }).is.throwing('Host is missing.');
    done();
  });

  test('throws an error if port is missing.', function (done) {
    assert.that(function () {
      /* eslint-disable no-new */
      new Node({ host: 'localhost' });
      /* eslint-enable no-new */
    }).is.throwing('Port is missing.');
    done();
  });

  test('sets the host.', function (done) {
    var node = new Node({ host: 'localhost', port: 3000 });

    assert.that(node.host).is.equalTo('localhost');
    done();
  });

  test('sets the port.', function (done) {
    var node = new Node({ host: 'localhost', port: 3000 });

    assert.that(node.port).is.equalTo(3000);
    done();
  });

  test('calculates the id as SHA1 from the host and the port.', function (done) {
    var node = new Node({ host: 'localhost', port: 3000 });

    assert.that(node.id).is.equalTo('12a30e3632a51fdab4fedd07bcc219b433e17343');
    done();
  });
});
