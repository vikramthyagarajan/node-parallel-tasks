class streamlogger {
  constructor(SocketCommunicator) {
    this.socketCommunicator = SocketCommunicator;
  }
  log(data) {
    this.socketCommunicator.emitEvent('message', data);
  }
}

module.exports = streamlogger;
