export class EventBase {
  eventListeners = {};

  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }

    this.eventListeners[event].push(callback);
  }

  triggerEvent(event, data) {
    if (!this.eventListeners[event]) {
      return;
    }

    this.eventListeners[event].forEach((callback) => {
      callback(data);
    });
  }
}
