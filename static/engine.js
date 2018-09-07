//TODO: https://github.com/liftoff/HumanInput

var socket = io();

socket.on('connect', function() {
    getRemoteIP(function(ip) {
        writeDOMLog(`a client is connected from ${ip}`, 'notify');
        app.getMessage();
    });
});

socket.on('sync', function(text) {
    console.log(text);
    app.message = text;
});

function writeDOMLog(data, mode) {
    switch (mode) {
        case 'general':
            $('#console-log').append($('<p class="mb-0 text-primary">').text(data));
            break;
        case 'warning':
            $('#console-log').append($('<p class="mb-0 text-warning">').text(data));
            break;
        case 'notify':
            $('#console-log').append($('<p class="mb-0 text-info">').text(data));
            break;
        case 'success':
            $('#console-log').append($('<p class="mb-0 text-success">').text(data));
            break;
        case 'error':
            $('#console-log').append($('<p class="mb-0 text-danger">').text(data));
            break;
    }
}

function getRemoteIP(callback) {
    socket.emit('getIP', 1);
    socket.on('ip', function(ip) {
        callback(ip);
    });
}

function scanNetworkForHosts() {
    getRemoteIP(function(ip) {
        var networkPortion = ip.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\b/)[0];
        for(var i = 0; i < 255; i++) {
            let hostToScan = `http://${networkPortion}.${i}:5000`;
            let s = io.connect(hostToScan, { reconnection: false });
            s.on('connect', function () {
                writeDOMLog(`discovered a live host at ${hostToScan}`);
            });
            s.on('connect_error', function (err) {
                console.log(`the host ${hostToScan} is unreachable`);
            });
        }
    });
}

$('#realtimeFormControl').change(function(event) {
    var data = {
        caretPosition: event.target.selectionStart,
        keyPressed: ""
    }
    if(event.which !== 0) {
        data.keyPressed = event.keyCode;
    }
    socket.emit('updateInput', data);
});

$('#realtimeFormControl').click(function(event) {
    var data = {
        caretPosition: event.target.selectionStart,
    }
    socket.emit('updateCaret', data);
});

socket.on('update', function(data) {
    $('#realtimeFormControl').val(data);
});

let app = new Vue({
    el: '#app',
    data: {
        message: ''
    },
    methods : {
        sendMessage: function(e) {
            socket.emit('updateInput', this.message);
        },
        getMessage: function() {
            $('#realtimeFormControl').val(this.message);
        }
    }
});