var winston=require('winston');
var config=require('./config/config.js');
var SocketCommunicator=require('./lib/socketcomm.js');
var ExecutionEngine=require('./lib/executionengine.js');
var PortScanner=require('./lib/portscanner.js');

var currentSocketComm=SocketCommunicator.getSocketCommunicator();
var currentPortScanner=new PortScanner({lan:config.lan,port:config.port});
var executionEngine=ExecutionEngine.getExecutionEngine(currentSocketComm);

/**
 * Function that scans and connects to all available machines in the local network. Required befor doing all operations
 *
 */
function initializeEngine(callback) {
	currentPortScanner.scanPorts(function(err,connectedMachines){
		winston.log('Found '+ connectedMachines.length +' machines in local network');
		winston.info('Connected Machines are-');
		winston.info(connectedMachines)
		currentSocketComm.connectTo(connectedMachines,function(){
			winston.log('connected to the machines');
			callback();
		});
	});
};

module.exports = {
	mapReduce: function(arr, map, reduce) {
		initializeEngine(function() {
			executionEngine.executeMapReduce(arr, map, reduce);
		});
	}
};
