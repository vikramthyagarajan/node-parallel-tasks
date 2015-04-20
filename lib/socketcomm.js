var io = require('socket.io')();
var config=require('../config/config.js');
var CommunicationEngine=require('./communicationengine.js');
var _=require('lodash');

var socketClient=require('socket.io-client');
function SocketCommunicator(){
	this.stuff=null;
	this.connectedClients=[];
	this.serversConnectedTo=[];
	this.server=null;
	this.initalizeServer();
	// var testSock=test.connect('http://localhost:'+config.port);
	// testSock.emit('event',{message:'test'});
	// console.log(testSock.send('hshs'))
}
SocketCommunicator.prototype.initalizeServer=function(){
	console.log(this)
	io.on('connection', function(socket){
		console.log('a client has connected');
		console.log(socket.handshake.address);
		socket.on('connect',function(){
			var communicationEngine=new CommunicationEngine(socket);
			this.connectedClients.push({address:socket.handshake.address,engine:communicationEngine,socket:socket});
		})
		socket.on('disconnect',function(){
			console.log('a user is disconnected');
			console.log(socket);
		});
	});
	this.server=io.listen(config.port);
	console.log('server listening at '+config.port);
};

SocketCommunicator.prototype.connectTo = function(hostArray) {
	hostArray.forEach(function(host){
		var currentSocket=socketClient.connect('http://'+host+':'+config.port);
		currentSocket.on('connect',function(){
			var communicationEngine=new CommunicationEngine(socket);
			this.connectedClients.push({address:socket.handshake.address,engine:communicationEngine,socket:socket});
		});
		currentSocket.on('disconnect',function(){
			var index=_.findIndex(this.serversConnectedTo,{address:currentSocket.handshake.address});
			if(index&&index>-1)
				this.serversConnectedTo.splice(index,1);
		});
	});
};

module.exports=SocketCommunicator;
