var fs = require('fs');
var PeerServer = require('peer').PeerServer;

var server = PeerServer({
    port: 444,
    path: '/peerjs',
    ssl: {
        key: fs.readFileSync('./../certificates/privkey.pem', 'utf8'),
        cert: fs.readFileSync('./../certificates/fullchain.pem', 'utf8')
    }
});