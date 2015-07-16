# p2p

p2p implements a peer-to-peer protocol.

## Installation

    $ npm install p2p

## Quick start

First you need to add a reference to p2p.

```javascript
var p2p = require('p2p');
```

Then create a new peer by calling the `peer` function and specifying the host and the port to listen on.

Additionally, you need to specify a private key and a certificate. Please note that these values must be strings that contain data in `.pem` format.

```javascript
var peer = p2p.peer({
  host: 'localhost',
  port: 3000,
  privateKey: '...',
  certificate: '...'
});
```

Optionally you may specify a `metadata` property to attach arbitrary data to a node. These metadata will be available to others when asking for information about the peer. You may use it, e.g., to store information on services a peer offers.

```javascript
var peer = p2p.peer({
  host: 'localhost',
  port: 3000,
  privateKey: '...',
  certificate: '...',
  metadata: {
    foo: 'bar'
  }
});
```

### Configuring housekeeping

By default, a peer tries to do housekeeping around every 30 seconds. If you need to change this, provide a property called `serviceInterval`.

```javascript
var peer = p2p.peer({
  host: 'localhost',
  port: 3000,
  privateKey: '...',
  certificate: '...',
  serviceInterval: '10s'
});
```

Please note that this affects the way the protocol works. Hence setting the `serviceInterval` property should be avoided in most cases.

### Joining a p2p network

To join another node, call the `join` function and provide the host and the port of the node you want to join.

```javascript
peer.join({
  host: 'localhost',
  port: 4000
}, function (err) {
  // ...
});
```

To get the status of a node call its `status` function.

```javascript
console.log(peer.status());
// => 'lonely' or 'unbalanced' or 'joined'
```

### Finding the responsible peer

If you want to find the peer responsible for a value, call the `getPeerFor` function and provide the value as a string.

As a result you will get information on the peer itself as well as its metadata. If no metadata have been set, an empty object is returned.

```javascript
peer.getPeerFor('foobar', function (err, node, metadata) {
  // ...
});
```

### Detecting changes in your neighborhood

To detect whether the successor or predecessor of a peer changed, subscribe to the `changed-successor` and `changed-predecessor` events. Please note that the predecessor may be `undefined`.

```javascript
peer.on('changed-successor', function (successor) {
  // ...
});

peer.on('changed-predecessor', function (predecessor) {
  // ...
});
```

### Registering actions

To register custom actions, add them to the `handle` object. If an action is called on a peer, the module will call the appropriate function automatically. Once you are done you need to call the `done` callback. Optionally, you may provide a result.

```javascript
peer.handle.foo = function (payload, done) {
  // Do something with payload...
  if (err) {
    return done(err);
  }
  done(null);
  // or: done(null, result);
};
```

### Calling actions on remote peers

If you want to call an action on a remote peer, call the `remote.run` function, and provide the name of the action as well as its arguments and a callback. If the action returns a result, the callback has a `result` parameter.

```javascript
peer.remote({
  host: 'localhost',
  port: 4000
}).run('foo', { foo: 'bar' }, function (err, result) {
  // ...
});
```

## Running the build

This module can be built using [Grunt](http://gruntjs.com/). Besides running the tests, this also analyses the code. To run Grunt, go to the folder where you have installed p2p and run `grunt`. You need to have [grunt-cli](https://github.com/gruntjs/grunt-cli) installed.

    $ grunt

To run the integration tests setup Docker and run Grunt using the `integration command`.

    $ grunt integration

## License

The MIT License (MIT)
Copyright (c) 2012-2015 the native web.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
