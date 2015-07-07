FROM iojs:2.1.0
MAINTAINER the native web <hello@thenativeweb.io>

ADD . /p2p/

RUN cd /p2p && \
    npm install --production --silent

CMD [ "node", "/p2p/test/integration/p2p-test/app.js" ]
