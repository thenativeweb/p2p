'use strict';

var assert = require('assertthat');

var Endpoint = require('../lib/Endpoint');

suite('Endpoint', function () {
  test('is a function.', function (done) {
    assert.that(Endpoint).is.ofType('function');
    done();
  });

  test('throws an error if options are missing.', function (done) {
    assert.that(function () {
      /* eslint-disable no-new */
      new Endpoint();
      /* eslint-enable no-new */
    }).is.throwing('Options are missing.');
    done();
  });

  test('throws an error if host is missing.', function (done) {
    assert.that(function () {
      /* eslint-disable no-new */
      new Endpoint({ port: 3000 });
      /* eslint-enable no-new */
    }).is.throwing('Host is missing.');
    done();
  });

  test('throws an error if port is missing.', function (done) {
    assert.that(function () {
      /* eslint-disable no-new */
      new Endpoint({ host: 'localhost' });
      /* eslint-enable no-new */
    }).is.throwing('Port is missing.');
    done();
  });

  test('sets the host.', function (done) {
    var endpoint = new Endpoint({ host: 'localhost', port: 3000 });

    assert.that(endpoint.host).is.equalTo('localhost');
    done();
  });

  test('sets the port.', function (done) {
    var endpoint = new Endpoint({ host: 'localhost', port: 3000 });

    assert.that(endpoint.port).is.equalTo(3000);
    done();
  });

  test('calculates the id as SHA1 from the host and the port.', function (done) {
    var endpoint = new Endpoint({ host: 'localhost', port: 3000 });

    assert.that(endpoint.id).is.equalTo('12a30e3632a51fdab4fedd07bcc219b433e17343');
    done();
  });
});
