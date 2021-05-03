# Teletrack telepresence video conferencing

This code runs on a raspberry pi and controls a Teletrack telepresence robot. It runs on node.js.

The project was a telepresence robot. It existed in a space to allow a remote user with a screen to view and control the robot. The device was mounted on a ceiling or upper wall-mounted track, which is important because it kept the robot out of the way when not in use. The camera assembly consisted of a camera turret that could rotate. The robot had the capability to move around the track, moving the camera’s point of view. This led to a more natural form of remote human interaction than a traditional webcam setup. All of these motions were controlled by a remote operator via a website, and the video feed from the robot was relayed back to the operator via the internet. As the robot’s range is relatively long as it drives around the track, it has an onboard battery to keep its various components powered. At a few points in the track, or perhaps the whole track, there might have been some sort of charging system to keep the robot’s cell topped off. The whole battery charging system, and indeed the whole robot, was designed for safety and reliability. The goal for the project was to bring a bit more normalcy to the webcam-dominated cyberspace we currently are living in.

## Usage
To use this project, clone this repository into the /home/ directory of the pi and run the following commands:

`cd ~/teletrack/public`

`node webserver.js`

open a new window,

`cd ~/teletrack/server`

`node peer_server.js`

Make sure that the IP here in /public/source/js/chat.js is changed to your IP.

![image](https://user-images.githubusercontent.com/67759534/116907068-131bad80-ac0f-11eb-8564-0117ef6a698d.png)

## Contributors
Larry Kresse
Randall Kliman
Eunsan Mo
Ian Graham

## Further reading
A full report of the project can be found on this website: https://eceseniordesign2021spring.ece.gatech.edu/sd21p41/
