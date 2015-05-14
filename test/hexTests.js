'use strict';

var assert = require('assertthat');

var hex = require('../lib/hex');

suite('hex', function () {
  suite('pow2x', function () {
    test('2 ^ 0 => 1', function (done) {
      assert.that(hex.pow2x(0)).is.equalTo('1');
      done();
    });

    test('2 ^ 1 => 2', function (done) {
      assert.that(hex.pow2x(1)).is.equalTo('2');
      done();
    });

    test('2 ^ 2 => 4', function (done) {
      assert.that(hex.pow2x(2)).is.equalTo('4');
      done();
    });

    test('2 ^ 3 => 8', function (done) {
      assert.that(hex.pow2x(3)).is.equalTo('8');
      done();
    });

    test('2 ^ 4 => 10', function (done) {
      assert.that(hex.pow2x(4)).is.equalTo('10');
      done();
    });

    test('2 ^ 5 => 20', function (done) {
      assert.that(hex.pow2x(5)).is.equalTo('20');
      done();
    });

    test('2 ^ 6 => 40', function (done) {
      assert.that(hex.pow2x(6)).is.equalTo('40');
      done();
    });

    test('2 ^ 7 => 80', function (done) {
      assert.that(hex.pow2x(7)).is.equalTo('80');
      done();
    });

    test('2 ^ 8 => 100', function (done) {
      assert.that(hex.pow2x(8)).is.equalTo('100');
      done();
    });

    test('2 ^ 159 => 8000000000000000000000000000000000000000', function (done) {
      assert.that(hex.pow2x(159)).is.equalTo('8000000000000000000000000000000000000000');
      done();
    });
  });

  suite('add', function () {
    suite('single digit', function () {
      suite('without overflow', function () {
        test('0 + 1 => 1', function (done) {
          assert.that(hex.add('0', '1')).is.equalTo('1');
          done();
        });

        test('0 + c => c', function (done) {
          assert.that(hex.add('0', 'c')).is.equalTo('c');
          done();
        });

        test('a + 3 => d', function (done) {
          assert.that(hex.add('a', '3')).is.equalTo('d');
          done();
        });
      });

      suite('with overflow', function () {
        test('d + 6 => 3', function (done) {
          assert.that(hex.add('d', '6')).is.equalTo('3');
          done();
        });

        test('f + 1 => 0', function (done) {
          assert.that(hex.add('f', '1')).is.equalTo('0');
          done();
        });

        test('f + a => 9', function (done) {
          assert.that(hex.add('f', 'a')).is.equalTo('9');
          done();
        });
      });
    });

    suite('multiple digits', function () {
      suite('without overflow', function () {
        test('f3 + 1 => f4', function (done) {
          assert.that(hex.add('f3', '1')).is.equalTo('f4');
          done();
        });

        test('20 + 20 => 40', function (done) {
          assert.that(hex.add('20', '20')).is.equalTo('40');
          done();
        });

        test('a3dc + 1c => a3f8', function (done) {
          assert.that(hex.add('a3dc', '1c')).is.equalTo('a3f8');
          done();
        });

        test('74d4fb84cd8479953830f31e5bfec2fcde452760 + 74d4fb84cd8479953830f31e5bfec2fcde452760 => e9a9f7099b08f32a7061e63cb7fd85f9bc8a4ec0', function (done) {
          assert.that(hex.add('74d4fb84cd8479953830f31e5bfec2fcde452760', '74d4fb84cd8479953830f31e5bfec2fcde452760')).is.equalTo('e9a9f7099b08f32a7061e63cb7fd85f9bc8a4ec0');
          done();
        });
      });

      suite('with overflow', function () {
        test('fe + 2 => 00', function (done) {
          assert.that(hex.add('fe', '2')).is.equalTo('00');
          done();
        });

        test('ff + ff => fe', function (done) {
          assert.that(hex.add('ff', 'ff')).is.equalTo('fe');
          done();
        });
      });
    });
  });
});
