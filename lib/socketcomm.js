var io = require('socket.io')();
var config=require('../config/config.js');
var CommunicationEngine=require('./communicationengine.js');
var ExecutionEngine=require('./executionengine.js');
var _=require('lodash');
var async=require('async');
var ipaddr = require('ipaddr.js');
var winston = require('winston');
var portastic = require('portastic');
var eventEmitter = require('events').EventEmitter;
var util = require('util');


var socketClient=require('socket.io-client');
/**
 * Default Constructor that initializes the Communicator
 * @class
 * @classdesc
 * @extends EventEmitter
 * A global singleton object that handles all network communication with the clients
 */
function SocketCommunicator() {
	eventEmitter.call(this);
	SocketCommunicator.socketCommunicator = this;
	this.connectedClients = [];
	this.serversConnectedTo = [];
	this.server = null;
	this.initalizeServer();
}
util.inherits(SocketCommunicator, eventEmitter);
/**
 * Function that initializes the server to listen for connection on the specified port
 * and starts listening for connections
 * @function
 */
SocketCommunicator.prototype.initalizeServer=function(){
	var that = this;
	io.on('connection', function(socket) {
		var socketAddress = ipaddr.process(socket.handshake.address).octets.join('.');
		winston.info('a client has connected');
		winston.info(socketAddress);
		var communicationEngine = new CommunicationEngine(socket, ExecutionEngine.getExecutionEngine());
		var oldIndex = _.findIndex(that.connectedClients, {address:socketAddress});
		if(oldIndex > -1)
			that.connectedClients[oldIndex] = {address:socketAddress, engine:communicationEngine, socket:socket};
		else
			that.connectedClients.push({address:socketAddress, engine:communicationEngine, socket:socket});
		socket.on('disconnect', function() {
			winston.info('a user is disconnected');
			var index = _.findIndex(that.connectedClients, {address:socketAddress});
			if(index&&index > -1)
				that.connectedClients.splice(index, 1);
		});
	});
	var that = this;
	portastic.test(config.port).then(function(isOpen) {
		if (isOpen) {
			that.server=io.listen(config.port);
			winston.info('server listening at '+config.port);
			that.emit('server initialized');
		}
		else {
			winston.warn('WARNING: port occupied. Did not start server. Either choose a different port, or ignore if port is being ' +
				'used by node-parallel-task run as a daemon')
			that.emit('server initialized');
		}
	});
};

SocketCommunicator.prototype.connectTo = function(hostArray, finalCallback) {
	var comm = this;
	async.each(hostArray, function(host, innerCallback) {
		var currentSocket = socketClient('http://'+host+':'+config.port);
		currentSocket.on('connect', function() {
			winston.info('connected to server at '+host);
			var communicationEngine = new CommunicationEngine(currentSocket, ExecutionEngine.getExecutionEngine());
			comm.serversConnectedTo.push({address:host, engine:communicationEngine, socket:currentSocket});
			innerCallback();
		});
		currentSocket.on('disconnect', function() {
			var index = _.findIndex(comm.serversConnectedTo, {address:currentSocket.io.host});
			if(index&&index > -1)
				comm.serversConnectedTo.splice(index, 1);
		});
	},finalCallback);
};

/**
 * Function that emits the specified event and data to all sockets. If an array of sockets are
 * given, then the event is emitted to only those clients
 * @function
 * @param  {String}   event    The name of the event
 * @param  {JSON}   data     Data to be send

 * @param  {Array}   sockets  Clients to emit event to (if applicable)
 * @param  {Function} callback Called after all events are emitted
 */
SocketCommunicator.prototype.emitEvent = function(event, data, sockets, callback) {
	if(!sockets) {
		var completeArray = _.flatten([this.connectedClients, this.serversConnectedTo]);
		completeArray = _.uniq(completeArray, 'address');
		async.each(completeArray, function(clientObj, innerCallback) {
			clientObj.socket.emit(event, data);
			innerCallback();
		}, callback);
	}
	else {
		async.each(sockets, function(sock, innerCallback) {
			clientObj.socket.emit(event, data);
			innerCallback();
		}, callback);
	}
};
/**
 * Static Function to get the singleton SocketCommunicator
 * @function
 */
SocketCommunicator.getSocketCommunicator = function() {
	if(this.socketCommunicator)
		return this.socketCommunicator;
	else return new SocketCommunicator();
};

module.exports=SocketCommunicator;
