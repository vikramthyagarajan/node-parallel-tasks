var winston=require('winston');
var config=require('./config/config.js');
var PortScanner=require('./lib/portscanner.js');
var SocketCommunicator=require('./lib/socketcomm.js');
var ExecutionEngine=require('./lib/executionengine.js');

var currentPortScanner=new PortScanner({lan:config.lan,port:config.port});
currentPortScanner.scanPorts(function(err,connectedMachines){
	console.log('Connected Machines are-');
	console.log(connectedMachines)
	var currentSocketComm=new SocketCommunicator();
	currentSocketComm.connectTo(connectedMachines);
});

