let peer;
let localStream;
let peerStream;
let myId;
let myUsername;
let peerId;
let peerUsername;

const getPeerId = () => document.getElementById('peer-id-input').value;
const getUsername = () => document.getElementById('username-input').value;

const getPeerIdContainer = () => document.getElementById('peer-id-container');
const getPeerVideoElement = () => document.getElementById('peer-video-element');
const getLocalVideoElement = () => document.getElementById('local-video-element');
const getCallButton = () => document.getElementById('call-button');

async function initiateCall() {
  peerId = getPeerId();
  myUsername = getUsername();

  console.log('[initiateCall] requesting local video');

  await requestLocalVideo();

  console.log('[initiateCall] Connecting to peer: ' + peerId);
  conn = peer.connect(peerId, {
    metadata: {
      username: myUsername,
    },
  });

  conn.on('data', handleMessage);

  var call = peer.call(peerId, localStream);

  call.on('stream', function (remoteStream) {
    peerStream = remoteStream;
    getPeerVideoElement().srcObject = remoteStream;
  });
}

function onCallReceived(call) {
  console.log('[onCallReceived]');
  call.answer(localStream);

  call.on('stream', function (remoteStream) {
    peerStream = remoteStream;
    getPeerVideoElement().srcObject = remoteStream;
  });

  call.on('close', function () {
    alert('The videocall has finished');
  });
}

function onConnectionReceived(conn) {
  console.log('[onConnectionReceived]');
  peerId = peer.id;
  peerUsername = conn.metadata.username;

  conn.on('data', function (data) {
    // Will print 'hi!'
    console.log(data);
  });
}

function handleMessage(data) {
  console.log('[Message] from peer: ' + data);
}

async function requestLocalVideo() {
  //navigator.getUserMedia = navigator.getUserMedia; // || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  return navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localStream = stream;
      getLocalVideoElement().srcObject = localStream;
    })
    .catch((err) => {
      console.error('Failed to get local stream', err);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
  peer = new Peer();

  getCallButton().addEventListener('click', initiateCall);

  getPeerVideoElement().onloadedmetadata = function () {
    this.play();
  };
  getLocalVideoElement().onloadedmetadata = function () {
    this.play();
  };

  localStream = await requestLocalVideo();

  peer.on('open', function () {
    console.log('[Open]');
    getPeerIdContainer().innerHTML = peer.id;
  });

  peer.on('connection', onConnectionReceived);

  peer.on('error', (err) => {
    console.error(err);
  });
  peer.on('call', onCallReceived);
});
