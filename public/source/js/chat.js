// When the DOM is ready
document.addEventListener("DOMContentLoaded", function(event) {
    var peer_id;
    var username;
    var conn;

    /**
     * Important: the host needs to be changed according to your requirements.
     * e.g if you want to access the Peer server from another device, the
     * host would be the IP of your host namely 192.xxx.xxx.xx instead
     * of localhost.
     *
     * The iceServers on this example are public and can be used for your project.
     */
    const socket = io('/');
    const videoGrid = document.getElementById('video-grid');
    var myPeer = new Peer({
        host: "143.215.191.80",
        port: 3000,
        path: '/peerjs',
        debug: 3,
        // config: {
        //     'iceServers': [
        //         {url: 'stun:stun1.l.google.com:19302'},
        //         {
        //             url: 'turn:numb.viagenie.ca',
        //             credential: 'muazkh',
        //             username: 'webrtc@live.com'
        //         }
        //     ]
        // }
    });


    const myVideo = document.createElement('video');
    myVideo.muted = true;
    const peers = {};

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio:true
    }).then(stream => {
        addVideoStream(myVideo, stream);

        myPeer.on('call', call => {
            call.answer(stream);
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
        });

        socket.on('user-connected', userId => {
            console.log("new user connected")
            connectToNewUser(userId, stream)
        })
    })

    socket.on('user-disconnected', userId => {
        console.log("F")
        if(peers[userId]) peers[userId].close()
    });

    socket.on('recieve-message', data => {
        console.log("recieve-message");
        console.log(data.text);
        handleMessage(data);
    })

    // Handle Messages
    document.getElementById("send-message").addEventListener("click", function(){
        // Get the text to send
        var text = document.getElementById("message").value;


        var data = {
            from: "user",
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
        socket.emit('join-room', ROOM_ID, id);
    });


// socket.on('user-connected', userID => {
//   console.log('User Connected: ' + userID)
// });

    function addVideoStream(video, stream) {
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play()
        });
        videoGrid.append(video)
    }

    function connectToNewUser(userId, stream) {
        const call = myPeer.call(userId, stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        });
        call.on('close', () => {
            video.remove()
            console.log("F")
        });

        peers[userId] = call;
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
