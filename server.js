var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var port = 9999;

var users = {}
var text = ""

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'collabo.html'));
});

app.get('/saveas/:name', function(req, res) {
    res.set({"Content-Disposition":"attachment; filename=" + req.params.name});
    res.send(text);
});

// Starts the server.
server.listen(port, '0.0.0.0', function() {
  console.log(`Starting server on port ${port}`);
});

// Add the WebSocket handlers
io.sockets.on('connection', function(socket) {
    users[socket.id] = {
        ip: socket.request.connection.remoteAddress,
        caretPosition: 0
    };

    socket.emit('sync', text);

    socket.on('getIP', function() {
        console.log('sending ip address to client');
        io.sockets.emit('ip', users[socket.id].ip);
    });

    socket.on('updateInput', function(data) { //update both caret position and textarea content
        text = data;
        socket.broadcast.emit('update', data);
    });
    
    socket.on('updateCaret', function(data) { //update only the caret position
        users[socket.id].caretPosition = data.caretPosition;
        //console.log(users[socket.id].caretPosition);
    });
});