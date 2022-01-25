export const CommandByteCode = {
  PanLeft: 'l',
  PanRight: 'r',
  TiltUp: 'u',
  TiltDown: 'd',
};

export class Port {
  device_;
  interfaceNumber_ = 2; // original interface number of WebUSB Arduino demo
  endpointIn_ = 5; // original in endpoint ID of WebUSB Arduino demo
  endpointOut_ = 4; // original out endpoint ID of WebUSB Arduino demo

  constructor(device) {
    this.device_ = device;
  }

  async connect() {
    let readLoop = () => {
      this.device_.transferIn(this.endpointIn_, 64).then(
        (result) => {
          this.onReceive(result.data);
          readLoop();
        },
        (error) => {
          this.onReceiveError(error);
        }
      );
    };

    await this.device_.open();
    if (this.device_.configuration === null) {
      await this.device_.selectConfiguration(1);
    }

    var configurationInterfaces = this.device_.configuration.interfaces;
    configurationInterfaces.forEach((element) => {
      element.alternates.forEach((elementalt) => {
        if (elementalt.interfaceClass == 0xff) {
          this.interfaceNumber_ = element.interfaceNumber;
          elementalt.endpoints.forEach((elementendpoint) => {
            if (elementendpoint.direction == 'out') {
              this.endpointOut_ = elementendpoint.endpointNumber;
            }
            if (elementendpoint.direction == 'in') {
              this.endpointIn_ = elementendpoint.endpointNumber;
            }
          });
        }
      });
    });

    await this.device_.claimInterface(this.interfaceNumber_);
    await this.device_.selectAlternateInterface(this.interfaceNumber_, 0);

    // The vendor-specific interface provided by a device using this
    // Arduino library is a copy of the normal Arduino USB CDC-ACM
    // interface implementation and so reuses some requests defined by
    // that specification. This request sets the DTR (data terminal
    // ready) signal high to indicate to the device that the host is
    // ready to send and receive data.
    await this.device_.controlTransferOut({
      requestType: 'class',
      recipient: 'interface',
      request: 0x22,
      value: 0x01,
      index: this.interfaceNumber_,
    });

    readLoop();
  }

  disconnect() {
    // This request sets the DTR (data terminal ready) signal low to
    // indicate to the device that the host has disconnected.
    return this.device_
      .controlTransferOut({
        requestType: 'class',
        recipient: 'interface',
        request: 0x22,
        value: 0x00,
        index: this.interfaceNumber_,
      })
      .then(() => this.device_.close());
  }

  send(data) {
    return this.device_.transferOut(this.endpointOut_, data);
  }
}

export class SerialManager {
  currentPort = null;
  textEncoder;

  constructor() {
    this.textEncoder = new TextEncoder();
  }

  async getPorts() {
    const devices = await navigator.usb.getDevices();
    return devices.map((device) => new Port(device));
  }

  async requestPort() {
    const filters = [
      { vendorId: 0x2341, productId: 0x8036 }, // Arduino Leonardo
      { vendorId: 0x2341, productId: 0x8037 }, // Arduino Micro
      { vendorId: 0x2341, productId: 0x804d }, // Arduino/Genuino Zero
      { vendorId: 0x2341, productId: 0x804e }, // Arduino/Genuino MKR1000
      { vendorId: 0x2341, productId: 0x804f }, // Arduino MKRZERO
      { vendorId: 0x2341, productId: 0x8050 }, // Arduino MKR FOX 1200
      { vendorId: 0x2341, productId: 0x8052 }, // Arduino MKR GSM 1400
      { vendorId: 0x2341, productId: 0x8053 }, // Arduino MKR WAN 1300
      { vendorId: 0x2341, productId: 0x8054 }, // Arduino MKR WiFi 1010
      { vendorId: 0x2341, productId: 0x8055 }, // Arduino MKR NB 1500
      { vendorId: 0x2341, productId: 0x8056 }, // Arduino MKR Vidor 4000
      { vendorId: 0x2341, productId: 0x8057 }, // Arduino NANO 33 IoT
      { vendorId: 0x239a }, // Adafruit Boards!
    ];
    const device = await navigator.usb.requestDevice({ filters: filters });
    return new Port(device);
  }

  async sendCommand(command) {
    var result = false;

    if (this.currentPort) {
      try {
        await this.currentPort.send(this.textEncoder.encode(command));
        result = true;
      } catch (error) {
        console.error('[Serial] Send error: ' + error);
      }
    }

    return result;
  }

  async userRequestConnection() {
    let result = false;

    try {
      this.currentPort = await this.requestPort();
    } catch (error) {
      console.error('[Serial] Port request error: ' + error);
    }

    if (this.currentPort) {
      result = await this.connect();
    }

    return result;
  }

  async tryConnect() {
    console.log('[Serial] Try connect');
    let result = false;

    const ports = await this.getPorts();
    if (ports.length == 0) {
      console.log('[Serial] No devices found.');
    } else {
      this.currentPort = ports[0];
      result = await this.connect();
    }

    return result;
  }

  async connect() {
    if (this.currentPort == null) {
      return false;
    }

    console.log('[Serial] Connecting to ' + this.currentPort.device_.productName + '...');

    try {
      await this.currentPort.connect();

      console.log('[Serial] Connected to port', this.currentPort);
    } catch (error) {
      console.error('[Serial] Connection error: ' + error);
      return false;
    }

    this.currentPort.onReceive = (data) => {
      let textDecoder = new TextDecoder();
      console.log('[Serial] onReceive', textDecoder.decode(data));
    };
    this.currentPort.onReceiveError = (error) => {
      console.log('[Serial] onReceiveError', error);
    };

    return true;
  }

  async disconnect() {
    if (this.currentPort == null) {
      return false;
    }

    console.log('[Serial] Disconnecting from ' + this.currentPort.device_.productName + '...');

    try {
      await this.currentPort.disconnect();
    } catch (error) {
      console.error('[Serial] Disconnection error: ' + error);
      return false;
    }

    this.currentPort = null;

    return true;
  }
}
