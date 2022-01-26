import { ConnectionManager, MessageType } from './connect.js';
import { UIManager } from './ui.js';
import { SerialManager, CommandByteCode } from './serial.js';
import { getURLParams, setURLParams } from './url.js';

console.log('Starting Telepresence');

const { isRobotUser, localPeerId, remotePeerId } = getURLParams();

const uiManager = new UIManager(localPeerId, remotePeerId, isRobotUser);
const connectionManager = new ConnectionManager(localPeerId, remotePeerId);

window.addEventListener('beforeunload', async () => {
  await connectionManager.hangup();
});

connectionManager.init();
connectionManager.addEventListener('local-peer-id-received', (peerId) => {
  uiManager.showMyPeerId(peerId);
  setURLParams({ localPeerId: peerId });
});
connectionManager.addEventListener('local-stream-received', (stream) => {
  uiManager.showLocalStream(stream);
});
connectionManager.addEventListener('remote-stream-received', (stream) => {
  uiManager.showRemoteStream(stream);
});
connectionManager.addEventListener('connected', () => {
  uiManager.showConnected();
});

uiManager.addEventListener('call-button-clicked', () => {
  connectionManager.initiateCall();
  setURLParams({ remotePeerId: uiManager.getRemotePeerId() });
});

uiManager.addEventListener('hangup-button-clicked', () => {
  connectionManager.hangup();
  uiManager.showDisconnected();
});
uiManager.addEventListener('username-changed', (value) => connectionManager.setUsername(value));
uiManager.addEventListener('peer-id-changed', (value) => connectionManager.setPeerId(value));

if (remotePeerId) {
  connectionManager.initiateCall();
}

if (isRobotUser) {
  const serialManager = new SerialManager();
  const connected = serialManager.tryConnect();
  if (!connected) {
    uiManager.showConnectDialog();
  }

  const messageToCommandMap = {
    [MessageType.PanLeft]: CommandByteCode.PanLeft,

    [MessageType.PanRight]: CommandByteCode.PanRight,

    [MessageType.TiltUp]: CommandByteCode.TiltUp,

    [MessageType.TiltDown]: CommandByteCode.TiltDown,
  };

  uiManager.addEventListener('connect-button-clicked', () => serialManager.userRequestConnection());
  connectionManager.addEventListener('message-received', async (message) => {
    const commandByteCode = messageToCommandMap[message];

    if (commandByteCode) {
      await serialManager.sendCommand(commandByteCode);
    } else if (message == MessageType.Hangup) {
      await connectionManager.hangup();
    }
  });
} else {
  uiManager.addEventListener('remote-pan-left-button-clicked', () =>
    connectionManager.sendMessage(MessageType.PanLeft)
  );

  uiManager.addEventListener('remote-pan-right-button-clicked', () =>
    connectionManager.sendMessage(MessageType.PanRight)
  );

  uiManager.addEventListener('remote-tilt-up-button-clicked', () => connectionManager.sendMessage(MessageType.TiltUp));

  uiManager.addEventListener('remote-tilt-down-button-clicked', () =>
    connectionManager.sendMessage(MessageType.TiltDown)
  );
}
