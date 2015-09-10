var io = require('socket.io')();
var config=require('../config/config.js');
var CommunicationEngine=require('./communicationengine.js');
var ExecutionEngine=require('./executionengine.js');
var _=require('lodash');
var async=require('async');

var socketClient=require('socket.io-client');
/**
 * Default Constructor that initializes the Communicator
 * @class
 * @classdesc
 * A global singleton object that handles all network communication with the clients
 */
function SocketCommunicator(){
	SocketCommunicator.socketCommunicator=this;
	this.connectedClients=[];
	this.serversConnectedTo=[];
	this.server=null;
	this.initalizeServer();
}
/**
 * Function that initializes the server to listen for connection on the specified port
 * and starts listening for connections
 * @function
 */
SocketCommunicator.prototype.initalizeServer=function(){
	var that=this;
	io.on('connection', function(socket){
		console.log('a client has connected');
		console.log(socket.handshake.address);
		var communicationEngine=new CommunicationEngine(socket,ExecutionEngine.getExecutionEngine());
		var oldIndex=_.findIndex(that.connectedClients,{address:socket.handshake.address});
		if(oldIndex>-1)
			that.connectedClients[oldIndex]={address:socket.handshake.address,engine:communicationEngine,socket:socket};
		else
			that.connectedClients.push({address:socket.handshake.address,engine:communicationEngine,socket:socket});
		socket.on('disconnect',function(){
			console.log('a user is disconnected');
			var index=_.findIndex(that.connectedClients,{address:socket.handshake.address});
			if(index&&index>-1)
				that.connectedClients.splice(index,1);
		});
	});
	this.server=io.listen(config.port);
	console.log('server listening at '+config.port);
};
SocketCommunicator.prototype.connectTo = function(hostArray,finalCallback) {
	var comm=this;
	async.each(hostArray,function(host,innerCallback){
		var currentSocket=socketClient('http://'+host+':'+config.port);
		currentSocket.on('connect',function(){
			console.log('connected to server at '+host);
			var communicationEngine=new CommunicationEngine(currentSocket,ExecutionEngine.getExecutionEngine());
			comm.serversConnectedTo.push({address:host,engine:communicationEngine,socket:currentSocket});
			innerCallback();
		});
		currentSocket.on('disconnect',function(){
			var index=_.findIndex(comm.serversConnectedTo,{address:currentSocket.io.host});
			if(index&&index>-1)
				comm.serversConnectedTo.splice(index,1);
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
SocketCommunicator.prototype.emitEvent = function(event,data,sockets,callback) {
	if(!sockets){
		var completeArray=_.flatten([this.connectedClients,this.serversConnectedTo]);
		completeArray=_.uniq(completeArray,'address');
		async.each(completeArray,function(clientObj,innerCallback){
			clientObj.socket.emit(event,data);
			innerCallback();
		},callback);
	}
	else{
		async.each(sockets,function(sock,innerCallback) {
			clientObj.socket.emit(event,data);
			innerCallback();
		},callback);
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
