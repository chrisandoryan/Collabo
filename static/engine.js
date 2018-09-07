//TODO: https://github.com/liftoff/HumanInput

var socket = io();

var HI = new HumanInput(window);
HI.filter = function(e) { return true };

HI.on('keyup', captureTextAreaInput);

function captureTextAreaInput(event, key, code) {
    var data = {
        caretPosition: event.target.selectionStart,
        keyPressed: ""
    }
    data.keyPressed = key.length == 1 ? key.charCodeAt(0) : event.which;
    HI.log.info(data.keyPressed);
    socket.emit('updateInput', data);
}

socket.on('connect', function() {
    getRemoteIP(function(ip) {
        writeDOMLog(`a client is connected from ${ip}`, 'notify');
    });
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

// function setCaretPosition(elemId, caretPos) {
//     var elem = document.getElementById(elemId);

//     if(elem != null) {
//         if(elem.createTextRange) {
//             var range = elem.createTextRange();
//             range.move('character', caretPos);
//             range.select();
//         }
//         else {
//             if(elem.selectionStart) {
//                 elem.focus();
//                 elem.setSelectionRange(caretPos, caretPos);
//             }
//             else
//                 elem.focus();
//         }
//     }
// }

socket.on('update', function(data) {
    var caretPosition = data.caretPosition;
    var textArea = $('#realtimeFormControl').val();
    var newText = data.keyPressed;

    if (newText == "\u0008")
    {
        $('#realtimeFormControl').val(
            textArea.slice(0, caretPosition - 1)
        );
    }
    else
    {
        $('#realtimeFormControl').val(
            textArea.substring(0, caretPosition) + newText + textArea.substring(caretPosition)
        );
    }
});
