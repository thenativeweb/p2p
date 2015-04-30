# chord2

chord2 is a ring-based peer-to-peer protocol.

## Installation

    $ npm install chord2

## Quick start

First you need to add a reference to chord2.

```javascript
var Chord = require('chord2');
```

Then create a new node by calling the constructor function and specifying the host and the port to listen on.

```javascript
var chord = new Chord({
  host: 'localhost',
  port: 3000
});
```

To join another node, call the `join` function and provide the host and the port of the node you want to join.

```javascript
chord.join({
  host: 'localhost',
  port: 4000
}, function (err) {
  // ...
});
```

If you want to find the node responsible for a value, call the `getNodeFor` function and provide the value as a string.

```javascript
chord.getNodeFor('foobar', function (err, node) {
  // ...
});
```

## Running the build

This module can be built using [Grunt](http://gruntjs.com/). Besides running the tests, this also analyses the code. To run Grunt, go to the folder where you have installed chord2 and run `grunt`. You need to have [grunt-cli](https://github.com/gruntjs/grunt-cli) installed.

    $ grunt

## License

The MIT License (MIT)
Copyright (c) 2012-2015 the native web.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
