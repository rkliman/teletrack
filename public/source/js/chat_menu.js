var socket = io()
document.addEventListener("DOMContentLoaded", function(event) {
    socket.emit('enter-menu');

    var user_uuid;

    document.getElementById("startCall").onclick = function () {
        window.location.href = window.location.href + "/" + user_uuid;
    };

    document.getElementById("joinCall").onclick = function () {
        var roomid = document.getElementById("peer-id-input").value;
        window.location.href = window.location.href + "/" + roomid;
    }

    socket.on('uuid-sent', function (uuid) {
        console.log(uuid);
        user_uuid = uuid;
        document.getElementById('peer-id-label').innerHTML = uuid;
    })
});

