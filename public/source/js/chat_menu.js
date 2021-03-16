var socket = io()
document.addEventListener("DOMContentLoaded", function(event) {
    var button = document.getElementById("startCall").onclick = function () {
        socket.emit('click-join');
    };

    socket.on('uuid-sent', function (uuid) {
        window.location.href = window.location.href + "/" + uuid;
    })
});

