'use strict';

var handle = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return function (req, res) {
    var action = req.params.action;

    if (!peer.handle[action]) {
      return res.sendStatus(404);
    }

    peer.handle[action](req.body, function (err, result) {
      if (err) {
        return res.sendStatus(500);
      }
      return res.send(result || {});
    });
  };
};

module.exports = handle;
