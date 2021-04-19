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

    var myPeer;

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
                //eunsan
            } else if(document.getElementById("hostCheck").checked) {
                isHost = true;
                username = username + " [Host]";
                $('#desktop-view').fadeIn('slow')
                $('#desktop-view').removeAttr('hidden')
                videoGrid = document.getElementById('video-grid');
                //eunsan
            } else {
                $('#desktop-view').fadeIn('slow')
                $('#desktop-view').removeAttr('hidden')
                var link = document.getElementById('robotControl');
                link.style.visibility = 'hidden';
                videoGrid = document.getElementById('video-grid');
            }
        }, 400);

        myPeer = new Peer({
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
            console.log("User Connected. Is Host? " + hostBool)
            if (hostBool) {
                hostId = userId;
            }
            idMap[userId] = user
            // connect to user and send username
            var conn = myPeer.connect(userId);
            conn.send(username)
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
                    console.log('Remote Video Stream')
                    if (isPi) {
                        if (hostBool) {
                            addVideoStream(video, remoteVideoStream, user)
                        }
                    } else {
                        addVideoStream(video, remoteVideoStream, user)
                    }
                })
                peers[userId] = call;

                call.on('close', () => {
                    video.remove()
                    console.log("F2")
                });
            }, (err) => {
                console.error('Failed to get local stream', err);
            });
            console.log('User Call')


        })

        socket.on('request-host', function () {
            if (isHost) {
                socket.emit('host-response', id)
            }
        })

        socket.on('recieve-host', function (idHost) {
            hostId = id;
        })

        socket.on('user-disconnected', userId => {
            if(peers[userId]) peers[userId].close()
            const video = document.getElementById(userId);
            video.remove();
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

        myPeer.on('open', id => {
            socket.emit('join-room', ROOM_ID, id, username, isHost, isPi);
            //if not host, request hostID
            if (!isHost) {
                socket.emit('host-request')
            }
        });

        myPeer.on('connection', function(conn) {
            conn.on('data', function(remoteUsername) {
                idMap[conn.peer] = remoteUsername;
            })
        })

        myPeer.on('call', function(remoteCall) {
            console.log('Call Started')
            remoteCall.answer(myVideoStream);
            if(!peers[remoteCall.peer]) {
                getUserMedia({video: true, audio: true}).then((stream) => {
                    console.log("pain")
                    if (!isPi) {
                        const call = myPeer.call(remoteCall.peer, stream);
                        peers[remoteCall.peer] = call;
                    }
                }, (err) => {
                    console.error('Failed to get local stream', err);
                });
            }
            const video = document.createElement('video')
            video.setAttribute("id",remoteCall.peer);
            remoteCall.on('stream', remoteVideoStream => {
                console.log('Remote Video Stream')
                console.log(remoteCall.peer)
                console.log(hostId)
                if (isPi) {
                    if (remoteCall.peer == hostId) {
                        addPiHostStream(video, remoteVideoStream, idMap[remoteCall.peer] + "[Host]")
                    }
                } else {
                    addVideoStream(video, remoteVideoStream)
                }
            })
        });
    }


    /*
    Adds remote video as well as a username
     */
    function addVideoStream(video, stream, username) {
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play()
        });
        var video_container = document.createElement("div");
        video_container.classList.add("col-lg-3");
        video_container.append(video)
        var userText = document.createElement("div")
        var text = document.createElement("p")
        text.append(username)
        userText.append(text)
        userText.classList.add("usernameText")
        video_container.append(userText);
        videoGrid.append(video_container)
        // recalculateLayout();
    }

    function addLocalStream(video, stream, username) {
        const video_panel = document.getElementById("video-panel")
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play()
        });
        console.log(videoGrid.id)
        var video_container = document.createElement("div");
        video_container.append(video)
        var userText = document.createElement("div")
        var text = document.createElement("p")
        text.append(username)
        userText.append(text)
        userText.classList.add("usernameText")
        video_container.append(userText);
        video_panel.append(video_container)
        // recalculateLayout();
    }

    function addPiHostStream(video, stream, username) {
        const video_panel = document.getElementById("video-panel")
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play()
        });
        console.log(videoGrid.id)
        var video_container = document.createElement("div");
        video.classList.add("pi-host")
        video_container.append(video)
        var userText = document.createElement("div")
        var text = document.createElement("p")
        text.append(username)
        userText.append(text)
        userText.classList.add("usernameText")
        video_container.append(userText);
        video_panel.append(video_container)
        // recalculateLayout();
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
