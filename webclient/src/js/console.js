(function () {
  'use strict';

  hterm.defaultStorage = new lib.Storage.Local();

  var port;

  let textEncoder = new TextEncoder();

  let t = new hterm.Terminal();
  function sendTextToSerial(text) {
    if (port !== undefined) {
      port.send(textEncoder.encode(text)).catch((error) => {
        t.io.println('Send error: ' + error);
      });
    }
  }

  t.onTerminalReady = () => {
    console.log('Terminal ready.');
    let io = t.io.push();

    io.onVTKeystroke = (text) => sendTextToSerial(text);

    io.sendString = (str) => {
      if (port !== undefined) {
        port.send(textEncoder.encode(str)).catch((error) => {
          t.io.println('Send error: ' + error);
        });
      }
    };
  };

  document.addEventListener('DOMContentLoaded', (event) => {
    let connectButton = document.querySelector('#connect-button');
    let panLeftButton = document.querySelector('#pan-left-button');
    let panRightButton = document.querySelector('#pan-right-button');

    t.decorate(document.querySelector('#terminal'));
    t.setWidth(80);
    t.setHeight(24);
    t.installKeyboard();

    function connect() {
      t.io.println('Connecting to ' + port.device_.productName + '...');
      port.connect().then(
        () => {
          console.log(port);
          t.io.println('Connected.');
          connectButton.textContent = 'Disconnect';
          port.onReceive = (data) => {
            let textDecoder = new TextDecoder();
            t.io.print(textDecoder.decode(data));
          };
          port.onReceiveError = (error) => {
            t.io.println('Receive error: ' + error);
          };
        },
        (error) => {
          t.io.println('Connection error: ' + error);
        }
      );
    }

    connectButton.addEventListener('click', function () {
      if (port) {
        port.disconnect();
        connectButton.textContent = 'Connect';
        port = null;
      } else {
        serial
          .requestPort()
          .then((selectedPort) => {
            port = selectedPort;
            connect();
          })
          .catch((error) => {
            t.io.println('Connection error: ' + error);
          });
      }
    });

    panLeftButton.addEventListener('click', function () {
      sendTextToSerial('e');
    });
    panRightButton.addEventListener('click', function () {
      sendTextToSerial('r');
    });

    serial.getPorts().then((ports) => {
      if (ports.length == 0) {
        t.io.println('No devices found.');
      } else {
        port = ports[0];
        connect();
      }
    });
  });
})();
