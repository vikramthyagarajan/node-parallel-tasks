var winston=require('winston');
var config=require('./config/config.js');
var SocketCommunicator=require('./lib/socketcomm.js');
var ExecutionEngine=require('./lib/executionengine.js');
var PortScanner=require('./lib/portscanner.js');

var currentSocketComm=SocketCommunicator.getSocketCommunicator();
var currentPortScanner=new PortScanner({lan:config.lan,port:config.port});
var executionEngine=ExecutionEngine.getExecutionEngine(currentSocketComm);
currentPortScanner.scanPorts(function(err,connectedMachines){
	console.log('Connected Machines are-');
	console.log(connectedMachines)
	currentSocketComm.connectTo(connectedMachines,function(){
		console.log('connected is done');
		executionEngine.executeMapReduce([1,2,3,4],function(elem,innerC) {
			innerC(null,elem+1);
		},function(err,results) {
			console.log('got results');
			console.log(results);
		},{});
	});
});

