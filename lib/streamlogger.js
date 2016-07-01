/**
 * The Stream Logger class which sends the message to be logged to the server
 * @class
 */
class streamlogger {
  /**
   * Default constructor that initializes the socket communicator
   * @function
   * @param {JSON} SocketCommunicator The SocketCommunicator object which will send data
   */
  constructor(SocketCommunicator) {
    this.socketCommunicator = SocketCommunicator;
  }
  /**
   * The logging function which emits the message to be logged to the communication engine
   * @function
   * @param {String} data The message to be logged on the server
   */
  log(data) {
    this.socketCommunicator.emitEvent('message', data);
  }
}
module.exports = streamlogger;
