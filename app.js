'use strict';

var Chord = require('./lib/Chord');

var chord = new Chord({
  host: 'localhost',
  port: (process.env.PORT - 0) || 3000
});

setInterval(function () {
  console.log();
  console.log('Self: ', chord.self.host, chord.self.port, chord.self.id);
  console.log('Succ: ', chord.successor.host, chord.successor.port, chord.successor.id);
  if (chord.predecessor) {
    console.log('Pred: ', chord.predecessor.host, chord.predecessor.port, chord.predecessor.id);
  } else {
    console.log('Pred: n/a');
  }
  console.log();
}, 2 * 1000);
