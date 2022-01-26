import { EventBase } from './event.js';
import { generateShortLink } from './shortlink.js';

export class UIManager extends EventBase {
  constructor(localPeerId, remotePeerId, isRobot) {
    super();

    this.peerIdInput = document.getElementById('peer-id-input');
    this.usernameInput = document.getElementById('username-input');

    this.peerIdContainer = document.getElementById('peer-id-container');
    this.particpantUrlContainer = document.getElementById('participant-url-container');
    this.peerVideoElement = document.getElementById('peer-video-element');
    this.localVideoElement = document.getElementById('local-video-element');

    this.connectRobotButton = document.getElementById('connect-robot-button');
    this.callButton = document.getElementById('call-button');
    this.hangupButton = document.getElementById('hangup-button');
    this.remotePanRightButton = document.getElementById('remote-pan-right-button');
    this.remotePanLeftButton = document.getElementById('remote-pan-left-button');
    this.remoteTiltUpButton = document.getElementById('remote-tilt-up-button');
    this.remoteTiltDownButton = document.getElementById('remote-tilt-down-button');

    this.peerIdContainer.innerHTML = localPeerId || 'loading...';
    this.peerIdInput.value = remotePeerId;

    generateShortLink(
      `https://mostley.github.io/diy_telepresence/webclient/src/index.html?robot=${!isRobot}` +
        `&remotePeerId=${localPeerId}`
    ).then((url) => {
      this.particpantUrlContainer.innerHTML = url;
    });

    if (isRobot) {
      document.body.classList.add('robot');
    }

    this.peerIdInput.addEventListener('keyup', () => {
      this.triggerEvent('peer-id-changed', this.peerIdInput.value);
    });

    this.usernameInput.addEventListener('keyup', () => {
      this.triggerEvent('username-changed', this.usernameInput.value);
    });

    this.connectRobotButton.addEventListener('click', () => {
      this.triggerEvent('connect-robot-button-clicked');
    });

    this.callButton.addEventListener('click', () => {
      this.triggerEvent('call-button-clicked');
    });
    this.hangupButton.addEventListener('click', () => {
      this.triggerEvent('hangup-button-clicked');
    });

    this.remotePanRightButton.addEventListener('click', () => {
      this.triggerEvent('remote-pan-right-button-clicked');
    });

    this.remotePanLeftButton.addEventListener('click', () => {
      this.triggerEvent('remote-pan-left-button-clicked');
    });

    this.remoteTiltUpButton.addEventListener('click', () => {
      this.triggerEvent('remote-tilt-up-button-clicked');
    });

    this.remoteTiltDownButton.addEventListener('click', () => {
      this.triggerEvent('remote-tilt-down-button-clicked');
    });
  }

  showMyPeerId(peerId) {
    this.peerIdContainer.innerHTML = peerId;
  }

  setRemotePeerId(peerId) {
    this.peerIdInput.value = peerId;
  }

  getRemotePeerId() {
    return this.peerIdInput.value;
  }

  showConnectDialog() {
    //todo
  }

  showLocalStream(stream) {
    console.log('showLocalStream');
    this.localVideoElement.srcObject = stream;
  }

  showRemoteStream(stream) {
    console.log('showRemoteStream');
    this.peerVideoElement.srcObject = stream;
  }

  showConnected() {
    document.body.classList.add('connected');
  }

  showDisconnected() {
    document.body.classList.remove('connected');
  }

  showRobotConnected() {
    document.body.classList.add('robot-connected');
  }

  showRobotDisconnected() {
    document.body.classList.remove('robot-connected');
  }
}
