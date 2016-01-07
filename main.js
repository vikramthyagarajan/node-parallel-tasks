var winston=require('winston');
var async = require('async');
var _ = require('lodash');
var portastic = require('portastic');
var fs = require('fs');

var config=require('./config/config.js');
var SocketCommunicator=require('./lib/socketcomm.js');
var ExecutionEngine=require('./lib/executionengine.js');
var PortScanner=require('./lib/portscanner.js');

var args = process.argv;
var isDaemon = _.includes(args, "--daemon");
if (isDaemon) {
	winston.info('preparing to run the app as daemon');
	winston.info(process.pid);
	//before forking the process, checking if port is available
	portastic.test(config.port).then( function(isOpen) {
		if (isOpen) {
			require('daemon')({
				stderr: fs.openSync('./log/err.log', 'a'),
				stdout: fs.openSync('./log/out.log', 'a')
			});
			initializeEnvironment();
		}
		else {
			winston.info('Port '+ config.port +' is not available. Daemon not created');
			process.exit(0);
		}
	});
	console.log(process.pid);
}
else initializeEnvironment();

var currentSocketComm, currentPortScanner, executionEngine, queue;

/**
 * Function that initializes all required steps to get node-parallel tasks up and listening for requests
 *
 */
function initializeEnvironment() {
	currentSocketComm=SocketCommunicator.getSocketCommunicator();
	currentPortScanner=new PortScanner({lan:config.lan,port:config.port});
	executionEngine=ExecutionEngine.getExecutionEngine(currentSocketComm);
	queue = async.queue(function(task, callback) {
		winston.info('running task on the queue');
		task(callback);
	});
	queue.pause();
	initializeEngine();
}


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

module.exports = {
	mapReduce: function(arr, map, reduce) {
		winston.info('adding task to queue');
		queue.push(function(callback) {
			executionEngine.executeMapReduce(arr, map, reduce, {scope: {}}, callback);
		});
	}
};
