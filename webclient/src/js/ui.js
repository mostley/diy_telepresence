import { EventBase } from './event.js';
import { generateShortLink } from './shortlink.js';

export class UIManager extends EventBase {
  isRobot;
  localPeerId;

  constructor(localPeerId, remotePeerId, isRobot) {
    super();

    this.isRobot = isRobot;
    this.localPeerId = localPeerId;
    this.remotePeerId = remotePeerId;

    this.peerIdInput = document.getElementById('peer-id-input');
    this.usernameInput = document.getElementById('username-input');

    this.peerIdContainer = document.getElementById('peer-id-container');
    this.particpantUrlContainer = document.getElementById('participant-url-container');
    this.peerVideoElement = document.getElementById('peer-video-element');
    this.localVideoElement = document.getElementById('local-video-element');

    this.connectRobotButton = document.getElementById('connect-robot-button');
    this.callButton = document.getElementById('call-button');
    this.unmuteButton = document.getElementById('unmute-button');
    this.muteButton = document.getElementById('mute-button');
    this.hangupButton = document.getElementById('hangup-button');
    this.remotePanRightButton = document.getElementById('remote-pan-right-button');
    this.remotePanLeftButton = document.getElementById('remote-pan-left-button');
    this.remoteTiltUpButton = document.getElementById('remote-tilt-up-button');
    this.remoteTiltDownButton = document.getElementById('remote-tilt-down-button');

    this.peerIdContainer.innerHTML = localPeerId || 'loading...';
    this.peerIdInput.value = remotePeerId;

    if (localPeerId) {
      this.setLocalPeerId(localPeerId);
    } else {
      this.particpantUrlContainer.innerHTML = 'loading...';
    }

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
    this.unmuteButton.addEventListener('click', () => {
      this.triggerEvent('unmute-button-clicked');
    });
    this.muteButton.addEventListener('click', () => {
      this.triggerEvent('mute-button-clicked');
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

  setLocalPeerId(peerId) {
    this.localPeerId = peerId;
    this.peerIdContainer.innerHTML = peerId;

    generateShortLink(
      `https://mostley.github.io/diy_telepresence/webclient/src/index.html?robot=${!this.isRobot}` +
        `&remotePeerId=${this.localPeerId}`
    ).then((url) => {
      this.particpantUrlContainer.innerHTML = url;
    });
  }

  setRemotePeerId(peerId) {
    this.remotePeerId = peerId;
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

  showMuted() {
    document.body.classList.add('muted');
  }

  showUnmuted() {
    document.body.classList.remove('muted');
  }
}
