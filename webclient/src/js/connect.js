import { EventBase } from './event.js';

export const MessageType = {
  Hangup: 'HANGUP',
  PanLeft: 'PAN_LEFT',
  PanRight: 'PAN_RIGHT',
  TiltUp: 'TILT_UP',
  TiltDown: 'TILT_DOWN',
};

export class ConnectionManager extends EventBase {
  peer;
  localStream;
  peerStream;
  myId;
  myUsername;
  peerId;
  peerUsername;
  connection;
  peerIdInput;
  usernameInput;
  peerIdContainer;
  peerVideoElement;
  localVideoElement;
  callButton;
  remotePanRightButton;
  remotePanLeftButton;
  remoteTiltUpButton;
  remoteTiltDownButton;

  constructor(localPeerId, remotePeerId) {
    super();

    this.peer = new Peer(localPeerId);
    this.peerId = remotePeerId;
  }

  setUsername(username) {
    this.myUsername = username;
  }

  setPeerId(peerId) {
    this.peerId = peerId;
  }

  sendMessage(message) {
    return this.connection.send(message);
  }

  async init() {
    this.localStream = await this.requestLocalVideo();

    this.peer.on('open', () => {
      console.log('[Open]');
      this.triggerEvent('local-peer-id-received', this.peer.id);
    });

    this.peer.on('connection', this.onConnectionReceived.bind(this));

    this.peer.on('error', (err) => {
      console.error(err);
    });
    this.peer.on('call', this.onCallReceived.bind(this));
  }

  async initiateCall() {
    console.log('[initiateCall] requesting local video');

    await this.requestLocalVideo();

    console.log('[initiateCall] Connecting to peer: ' + this.peerId);
    this.connection = this.peer.connect(this.peerId, {
      metadata: {
        username: this.myUsername,
      },
    });

    this.connection.on('data', this.handleMessage.bind(this));

    var call = this.peer.call(this.peerId, this.localStream);
    this.setupCall(call);

    this.triggerEvent('connected');
  }

  setupCall(call) {
    call.on('stream', (remoteStream) => {
      console.log('[onStream] remote stream received');

      this.peerStream = remoteStream;
      this.triggerEvent('remote-stream-received', remoteStream);
    });

    call.on('close', () => {
      alert('The videocall has finished');
    });
  }

  onCallReceived(call) {
    console.log('[onCallReceived]');
    call.answer(this.localStream);

    this.setupCall(call);

    this.triggerEvent('connected');
  }

  onConnectionReceived(conn) {
    console.log('[onConnectionReceived]');

    this.connection = conn;
    this.peerId = this.peer.id;
    this.peerUsername = this.connection.metadata.username;

    this.connection.on('data', this.handleMessage.bind(this));
  }

  handleMessage(data) {
    console.log('[Message] from peer: ' + data);

    this.triggerEvent('message-received', data);
  }

  async requestLocalVideo() {
    //navigator.getUserMedia = navigator.getUserMedia; // || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.localStream = stream;

      this.triggerEvent('local-stream-received', this.localStream);
    } catch (err) {
      console.error('Failed to get local stream', err);
    }
  }

  async hangup() {
    console.log('[ConnectionManager] hangup');

    await this.sendMessage(MessageType.Hangup);
    this.peer.disconnect();
    if (this.connection) {
      this.connection.close();
    }
    if (this.peerStream) {
      this.peerStream.getTracks().forEach((track) => track.stop());
    }
  }
}
