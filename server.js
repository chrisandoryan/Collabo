var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var port = 9999;

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'collabo.html'));
});

// Starts the server.
server.listen(port, '0.0.0.0', function() {
  console.log(`Starting server on port ${port}`);
});

var users = {}

// Add the WebSocket handlers
io.sockets.on('connection', function(socket) {
    users[socket.id] = {
        ip: socket.request.connection.remoteAddress,
        caretPosition: 0
    };

    socket.on('getIP', function() {
        console.log('sending ip address to client');
        io.sockets.emit('ip', users[socket.id].ip);
    });

    socket.on('updateInput', function(data) { //update both caret position and textarea content
        users[socket.id].caretPosition = data.caretPosition;
        let newData = {
            caretPosition: data.caretPosition,
            keyPressed: String.fromCharCode(data.keyPressed)
        }
        console.log(newData);
        socket.broadcast.emit('update', newData);
    });
    
    socket.on('updateCaret', function(data) { //update only the caret position
        users[socket.id].caretPosition = data.caretPosition;
        //console.log(users[socket.id].caretPosition);
    });
});