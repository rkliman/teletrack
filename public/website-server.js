/**
 * This script starts a https server accessible at https://localhost:8443
 * to test the chat
 *
 * @author Carlos Delgado
 */
var fs     = require('fs');
var http   = require('http');
var https  = require('https');
var path   = require("path");
var os     = require('os');
var ifaces = os.networkInterfaces();

// Public Self-Signed Certificates for HTTPS connection
var privateKey  = fs.readFileSync('./../certificates/privkey.pem', 'utf8');
var certificate = fs.readFileSync('./../certificates/fullchain.pem', 'utf8');

const Gpio = require('pigpio').Gpio;
const motor = new Gpio(14, {mode: Gpio.OUTPUT});
let pulseWidth = 1000;
let increment = 100;

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var { v4: uuidV4 } = require('uuid')
var app = express();

var httpsServer = https.createServer(credentials, app);

// var server = app.listen(80);
var io = require('socket.io')(httpsServer)
// var io = require('socket.io').listen(server)


var options = {
    host: 'teletrack.xyz',
    method: 'get',
    path: '/'
};

var request1 = https.request(options,
    function (response1) {
        console.log('certificate authorized:' + response1.socket.authorized);
    });

request1.end();

app.set('view engine', 'ejs')

users = [];
io.on('connection', socket => {

    // socket.on('set-username', function (data) {
    //     if(users.indexOf(data) > -1) {
    //         users.push(data);
    //         socket.emit('userSet', {username: data});
    //     } else {
    //         socket.emit('userExists', data + ' username is taken! Try some other username.');
    //     }
    // });

    socket.on('join-room', (roomId, userId) => {
        console.log(roomId, userId);
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId)
        socket.on('send-message', function (data) {
            socket.to(roomId).broadcast.emit('recieve-message', data);
            console.log(data.text);
        })
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId);
        });
    });
    socket.on('click-join', function () {
        socket.emit('uuid-sent', uuidV4());
    });

    socket.on('increase', () => {
        // console.log("increase");
        if (pulseWidth+100 < 2000) {
            pulseWidth += 100;
            motor.servoWrite(pulseWidth);
        }
    });
    socket.on('decrease', () => {
        // console.log("decrease");
        if (pulseWidth-100 > 500) {
            pulseWidth -= 100;
            motor.servoWrite(pulseWidth);
            // console.log(pulseWidth);
        }
    });
})

// Page Definitions

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+'/pages/index.html'));
});

app.get('/about', function (req, res) {
    res.sendFile(path.join(__dirname+'/pages/about.html'));
})

app.get('/chat', function (req, res) {
    res.sendFile(path.join(__dirname+'/pages/chat.html'));
})

app.get('/chat/:room', function (req, res) {
    res.render('room', {roomId: req.params.room})
})

// Expose the css and js resources as "resources"
app.use('/resources', express.static('./source'));

// Allow access from all the devices of the network (as long as connections are allowed by the firewall)
var LANAccess = "0.0.0.0";
// For http
// For https
httpsServer.listen(443);

var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);