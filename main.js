var winston=require('winston');
var config=require('./config/config.js');
var SocketCommunicator=require('./lib/socketcomm.js');
var ExecutionEngine=require('./lib/executionengine.js');
var PortScanner=require('./lib/portscanner.js');
var async = require('async');

var currentSocketComm=SocketCommunicator.getSocketCommunicator();
var currentPortScanner=new PortScanner({lan:config.lan,port:config.port});
var executionEngine=ExecutionEngine.getExecutionEngine(currentSocketComm);

var queue = async.queue(function(task, callback) {
	winston.info('running task on the queue');
	task(callback);
});
queue.pause();
/**
 * Function that scans and connects to all available machines in the local network. Required befor doing all operations
 *
 */
function initializeEngine() {
	currentPortScanner.scanPorts(function(err,connectedMachines){
		winston.log('Found '+ connectedMachines.length +' machines in local network');
		winston.info('Connected Machines are-');
		winston.info(connectedMachines)
		currentSocketComm.connectTo(connectedMachines,function(){
			winston.log('connected to the machines');
			queue.resume();
		});
	});
};
initializeEngine();

module.exports = {
	mapReduce: function(arr, map, reduce) {
		winston.info('adding task to queue');
		queue.push(function(callback) {
			executionEngine.executeMapReduce(arr, map, reduce);
			callback();
		});
	}
};
