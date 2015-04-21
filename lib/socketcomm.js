var io = require('socket.io')();
var config=require('../config/config.js');
var CommunicationEngine=require('./communicationengine.js');
var ExecutionEngine=require('./executionengine.js');
var _=require('lodash');
var async=require('async');

var socketClient=require('socket.io-client');
function SocketCommunicator(){
	SocketCommunicator.socketCommunicator=this;
	this.connectedClients=[];
	this.serversConnectedTo=[];
	this.server=null;
	this.initalizeServer();
}
SocketCommunicator.prototype.initalizeServer=function(){
	console.log(this)
	var that=this;
	io.on('connection', function(socket){
		console.log('a client has connected');
		console.log(socket.handshake.address);
			var communicationEngine=new CommunicationEngine(socket,ExecutionEngine.getExecutionEngine());
			// console.log('server sock');
			// console.log(socket);
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
			console.log('is legit connected');
			var communicationEngine=new CommunicationEngine(currentSocket,ExecutionEngine.getExecutionEngine());
			comm.connectedClients.push({address:host,engine:communicationEngine,socket:currentSocket});
			innerCallback();
		});
		currentSocket.on('disconnect',function(){
			var index=_.findIndex(comm.serversConnectedTo,{address:currentSocket.io.host});
			if(index&&index>-1)
				comm.serversConnectedTo.splice(index,1);
		});
	},finalCallback);
};

SocketCommunicator.prototype.emitEvent = function(event,data,sockets,callback) {
	if(!sockets){
		var completeArray=[];
		this.connectedClients.forEach(function(client){
			completeArray.push(client.socket);
		});
		this.serversConnectedTo.forEach(function(client){
			completeArray.push(client.socket);
		});
		async.each(completeArray,function(sock,innerCallback){
			sock.emit(event,data);
			innerCallback();
		},callback);
	}
	else{
		async.each(sockets,function(sock,innerCallback) {
			sock.emit(event,data);
			innerCallback();
		},callback);
	}
};

SocketCommunicator.getSocketCommunicator = function() {
	if(this.socketCommunicator)
		return this.socketCommunicator;
	else return new SocketCommunicator();
};

module.exports=SocketCommunicator;
