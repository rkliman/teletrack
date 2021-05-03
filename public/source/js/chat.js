// When the DOM is ready
document.addEventListener("DOMContentLoaded", function(event) {
    var username;
    var peer_id;
    var username;
    var conn;
    var isHost = false;
    var isPi = false;
    const peers = {};
    var myVideoStream;
    var myCall;
    // var call;
    var hostId = null;
    var idMap = new Map()
    var remoteUsername;

    /**
     * Important: the host needs to be changed according to your requirements.
     * e.g if you want to access the Peer server from another device, the
     * host would be the IP of your host namely 192.xxx.xxx.xx instead
     * of localhost.
     *
     * The iceServers on this example are public and can be used for your project.
     */
    const socket = io('/');
    var videoGrid = document.getElementById('video-grid');

    var myPeer = new Peer({
        host: "143.215.191.80",
        port: 3000,
        path: '/',
        debug: 2,
        secure: true,
        config: {
            'iceServers': [
                {
                    url: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                },
                {
                    url: 'turn:192.158.29.39:3478?transport=udp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                },
                {
                    url: 'turn:192.158.29.39:3478?transport=tcp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                },
                {
                    url: 'turn:turn.bistri.com:80',
                    credential: 'homeo',
                    username: 'homeo'
                },
                {
                    url: 'turn:turn.anyfirewall.com:443?transport=tcp',
                    credential: 'webrtc',
                    username: 'webrtc'
                }
            ]
        }
    });

    myPeer.on('open', (id) => {
        peer_id = id;
    })

    myPeer.on('connection', function(conn) {
        conn.on('open', function () {
            conn.on('data', function(user) {
                remoteUsername = user;
                console.log("Remote Username: " + remoteUsername)
            })
        })
    })

    myPeer.on('call', function(remoteCall) {
        console.log('Call From' + remoteUsername)
        remoteCall.answer(myVideoStream);
        // if(!peers[remoteCall.peer]) {
        //     getUserMedia({video: true, audio: true}).then((stream) => {
        //         console.log("pain")
        //         if (!isPi) {
        //             const call = myPeer.call(remoteCall.peer, stream);
        //             peers[remoteCall.peer] = call;
        //         }
        //     }, (err) => {
        //         console.error('Failed to get local stream', err);
        //     });
        // }
        const video = document.createElement('video')
        remoteCall.on('stream', remoteVideoStream => {
            console.log('Remote Video Stream - second')
            console.log(remoteCall.peer)
            if (isPi) {
                addPiStream(video,remoteVideoStream, remoteUsername)
            } else {
                addRemoteStream(video,remoteVideoStream, remoteUsername)
            }
        })

        remoteCall.on('close', () => {
            video.parentElement.parentElement.remove()
            console.log("Remote User Disconnected")
        });
    });

    document.getElementById("continue").onclick = function () {

        username = document.getElementById("username").value;
        $('#popup-menu').fadeOut('slow')
        setTimeout(function(){
            $('#popup-menu').addClass('d-none')
            if (document.getElementById("piCheck").checked) {
                isPi = true;
                username = username + " [Pi]";
                $('#pi-view').fadeIn('slow')
                $('#pi-view').removeAttr('hidden')
                videoGrid = document.getElementById('pi-video-grid');
                socket.emit('join-room', ROOM_ID, peer_id, username, isHost, isPi);
                //eunsan
            } else {
                $('#desktop-view').fadeIn('slow')
                $('#desktop-view').removeAttr('hidden')
                videoGrid = document.getElementById('video-grid');
                socket.emit('join-room', ROOM_ID, peer_id, username, isHost, isPi);
            }
        }, 400);

        //this is for the video
        const myVideo = document.createElement('video');
        myVideo.muted = true;
        var getUserMedia = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mozGetUserMedia;
        getUserMedia({
            video: true,
            audio:true
        }).then(stream => {
            myVideoStream = stream;
            if(!isPi) {
                addLocalStream(myVideo, myVideoStream, username);
            }
        })

        socket.on('user-connected', function(userId, user, hostBool, piBool) {
            console.log("User Connected. Is Pi? " + piBool)
            idMap[userId] = user
            // connect to user and send username
            var conn = myPeer.connect(userId);
            conn.on('open', function () {
                conn.send(username)
            })
            var messageHTML =  '<div href="javascript:void(0);" class="list-group-item' + '">';
            messageHTML += '<p class="list-group-item-text">'+ 'A user has joined the chat!' +'</p>';
            messageHTML += '</div>';

            var msgbox = document.getElementById("messages");
            msgbox.innerHTML += messageHTML;
            msgbox.scrollTop += msgbox.scrollHeight;

            getUserMedia({video: true, audio: true}).then((stream) => {
                const call = myPeer.call(userId, stream);
                const video = document.createElement('video')
                video.setAttribute("id",userId);
                call.on('stream', (remoteVideoStream) => {
                    console.log('Remote Video Stream - initial')
                    if (isPi) {
                        addPiStream(video,remoteVideoStream, user)
                    } else {
                        addRemoteStream(video,remoteVideoStream, user)
                    }
                })
                peers[userId] = call;

                call.on('close', () => {
                    video.parentElement.parentElement.remove()
                    console.log("Remote User Disconnected")
                });
            }, (err) => {
                console.error('Failed to get local stream', err);
            });
            console.log("Call from " + user)


        })

        socket.on('user-disconnected', userId => {
            if(peers[userId]) peers[userId].close();
        });

        socket.on('recieve-message', data => {
            handleMessage(data);
        })

        // Handle Messages
        document.getElementById("send-message").addEventListener("click", function(){
            // Get the text to send
            var text = document.getElementById("message").value;


            var data = {
                from: username,
                text: text
            }
            // Prepare the data to send
            socket.emit('send-message', data);

            // Handle the message on the UI
            handleMessage(data);

            document.getElementById("message").value = "";
        }, false);

        document.getElementById("message").addEventListener("keyup", function(event){
            if(event.keyCode == 13) {
                document.getElementById("send-message").click();
            }
        }, false);
    }

    /*
    Robot Movement
     */
    document.getElementById("track-left").onclick = function () {
        socket.emit('track-left')
    }
    document.getElementById("track-right").onclick = function () {
        socket.emit('track-right')
    }
    document.getElementById("robot-left").onclick = function () {
        socket.emit('robot-left')
    }
    document.getElementById("robot-right").onclick = function () {
        socket.emit('robot-right')
    }
    document.getElementById("robot-up").onclick = function () {
        socket.emit('robot-up')
	console.log('robot-up')
    }
    document.getElementById("robot-down").onclick = function () {
        socket.emit('robot-down')
    }
    document.getElementById("laser-left").onclick = function () {
        socket.emit('laser-left')
    }
    document.getElementById("laser-right").onclick = function () {
        socket.emit('laser-right')
    }
    document.getElementById("laser-up").onclick = function () {
        socket.emit('laser-up')
    }
    document.getElementById("laser-down").onclick = function () {
        socket.emit('laser-down')
    }
    document.getElementById("laser").onclick = function() {
        if(document.getElementById("laser").checked) {
            socket.emit('laser-on');
        } else {
            socket.emit('laser-off');
        }
    }


    /*
    Adds remote video as well as a username
     */
    function addRemoteStream(video, stream, username) {
        console.log("Remote Video Added")
        if (stream == null) {
            return
        }
        const video_panel = document.getElementById("remoteVideo")
        const myUsername = document.getElementById("remoteUsername")
        video.srcObject = stream;
        video.classList.add("remoteStream")
        video.addEventListener('loadedmetadata', () => {
            video.play()
        });
        myUsername.innerHTML = username;
        video_panel.append(video);
        // recalculateLayout();
    }

    /*
    Adds remote video as well as a username
     */
    function addPiStream(video, stream, username) {
        console.log("Remote Video Added")
        if (stream == null) {
            return
        }
        const video_panel = document.getElementById("piRemoteVideo")
        const myUsername = document.getElementById("remoteUsername")
        video.srcObject = stream;
        video.classList.add("remoteStream")
        video.addEventListener('loadedmetadata', () => {
            video.play()
        });
        myUsername.innerHTML = username;
        video_panel.append(video);
        // recalculateLayout();
    }

    function addLocalStream(video, stream, username) {
        if (stream == null) {
            return
        }
        const video_panel = document.getElementById("video-panel")
        const myUsername = document.getElementById("myUsername")
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play()
        });
        myUsername.innerHTML = username;
        video_panel.append(video);
    }

    function handleMessage(data) {
        var orientation = "text-left";

        // If the message is yours, set text to right !
        if(data.from == username){
            orientation = "text-right"
        }

        var messageHTML =  '<div href="javascript:void(0);" class="list-group-item' + orientation + '">';
        messageHTML += '<h4 class="list-group-item-heading">'+ data.from +'</h4>';
        messageHTML += '<p class="list-group-item-text">'+ data.text +'</p>';
        messageHTML += '</div>';

        var msgbox = document.getElementById("messages");
        msgbox.innerHTML += messageHTML;
        msgbox.scrollTop += msgbox.scrollHeight;
    }
});
