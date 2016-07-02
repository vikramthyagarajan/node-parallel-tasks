var Sandbox=require('./sandbox.js');
var config=require('../config/config.js');
var eventEmitter=require('events').EventEmitter;
var async=require('async');
var _=require('lodash');
var winston = require('winston');
var StreamLogger = require('./streamlogger.js')


// var statuses=['idle','awaitingOrders','initializingEnvironment','processing','aggregatingResults'];
// var clientEvents=['requestResource','readyEnvironment','startExecution'];
// var serverEvents=['resourceAvailable','environmentReady','executionDone'];
// var statuses=['idle','awaitingReplies',]
/**
 * Constructor that sets up the Execution engine and initializes it
 * @class
 * @requires Sandbox
 * @classdesc
 * ExecutionEngine is a Singleton that manages the clients executing the functions.
 * It makes sure that the environment/stubs are created and ready for the required functions to be executed
 * @constructor
 * @param {SocketCommunicator} socketCommunicator The Global Singleton SocketCommunicator for this instance
 */

function ExecutionEngine(socketCommunicator) {
	ExecutionEngine.executionEngine = this;
	this.sandbox = new Sandbox(new StreamLogger(socketCommunicator));
	this.status = 'idle';
	this.resources = [];
	this.resourcesEnvironmentInitialized = [];
	this.resourcesExecutionDone = [];
	this.startTime = null;
	this.array = [];
	this.err = null;
	this.results = [];
	this.defaultCallback = this.currentCallback = function() {
		winston.info('default callback called. WARNING.');
	};
	this.socketCommunicator = socketCommunicator;

}
/**
 * @function
 * @inner
 * Function that runs after a timeout. Is used to collect the resources that are available and are willing to
 * ready to execute functions on them. This function waits for a timeout and only the machines which respond
 * are picked. All these arguments are required because this function runs on a setTimeout
 * @param  {Array} array              The whole array that needs to be shared
 * @param  {Array} resources          The current set of resources
 * @param  {Sandbox} sandbox            The current Sandbox that is being used
 * @param  {SocketCommunicator} socketCommunicator The global singleton SocketCommunicator of this instance
 * @param  {ExecutionEngine} currentEngine      The self ExecutionEngine for making changes
 */
var onResourceAcquisitionTimeout=function(array, resources, sandbox, socketCommunicator, currentEngine) {
	//we gotta move on. The current resources are all the resources available.
	if (resources.length != 0) {
		var step = Math.floor(array.length/resources.length);
		var lastStep = 0;
		var commonData = sandbox.getSandboxEmitData();
		resources.forEach(function(resource) {
			var data = _.clone(commonData);
			data.array = array.slice(lastStep, lastStep+step);
			lastStep+=step;
			data['arrn'] = []
			if (typeof(data.array[0]) == 'function') {
				var i = 0;
				for (i = 0; i < data.array.length; i++){
					var func = "func" + i.toString();
					var f = data.array[i].toString();
					data['arrn'].push(f);
				}
			}
			resource.emitEnvironmentData(data);
		});
	}
	winston.info('got the resources. There are ' + resources.length);
	if (resources.length == 0) {
		winston.info('there are no resources. Performing function locally');
		ExecutionEngine.executeFunctionLocally(array, sandbox, currentEngine);
	}
}
/**
 * This does the mapReduce capabilities of the system. Usually, these are the functions within the async callbacks.
 * @param  {JSON} array The array on which the map has to be executed
 * @param  {function} map  Function to map the stuff that needs to be done in each client
 * @param  {function} reduce  The reduce function to collate the results
 * @param  {object} options Contains options like the scope of the closure example {scope:{testVariable:1}} default scope is {}
 */
ExecutionEngine.prototype.executeMapReduce = function(array, map, reduce, options, callback) {
	if (!options) {
		options = {
			scope: {}
		};
	}
	if(this.status == 'idle') {
		this.status = 'running';
		this.resetExecutionEngine();
		this.sandbox.initializeSandbox(array, map, reduce, options.scope);
		this.array = array;
		this.options = options;
		this.startTime = new Date().getTime();
		this.socketCommunicator.emitEvent('requestResource');
		this.currentCallback = callback;
		var that = this;
		setTimeout(function() {
			onResourceAcquisitionTimeout(that.array, that.resources, that.sandbox, that.socketCommunicator, that);
		}, config.resourceAcquisitionTimeout);
	}
};
/**
 * Executes the Spawn functionality
 * @param  {function} map  Function to map the stuff that needs to be done in each client
 * @param  {function} reduce  The reduce function to collate the results
 * @param  {JSON} options Contains options like the scope of the closure example {scope:{testVariable:1}} default scope is {}
 * @param  {function} array The function to be called after completion of execution
 */
ExecutionEngine.prototype.executeBroadcast = function(map, reduce, options, callback) {
	if (!options) {
		options = {
			scope: {}
		};
	}
	if (this.status == 'idle') {
		this.status = 'running';
		this.resetExecutionEngine();
		this.sandbox.initializeParallelSandbox(map, reduce, options.scope);
		this.options = options;
		this.startTime = new Date().getTime();
		this.socketCommunicator.emitEvent('requestResource');
		this.currentCallback = callback;
		var that = this;
		setTimeout(function() {
			onResourceAcquisitionTimeout([], that.resources, that.sandbox, that.socketCommunicator, that);
		}, config.resourceAcquisitionTimeout);
	}
};
/**
 * Executes the Parallel functionality
 * @param  {Array} array The array of functions to be executed in parallel
 * @param  {function} map  Function to map the stuff that needs to be done in each client
 * @param  {function} reduce  The reduce function to collate the results
 * @param  {JSON} options Contains options like the scope of the closure example {scope:{testVariable:1}} default scope is {}
 * @param  {function} array The function to be called after completion of execution
 */
ExecutionEngine.prototype.executeParallel = function(array, map, reduce, options, callback) {
	if (!options) {
		options = {
			scope: {}
		};
	}
	if(this.status == 'idle') {
		this.status = 'running';
		this.resetExecutionEngine();
		this.sandbox.initializeSandbox(array, map, reduce, options.scope);
		this.array = array;
		this.options = options;
		this.startTime = new Date().getTime();
		this.socketCommunicator.emitEvent('requestResource');
		this.currentCallback = callback;
		var that = this;

		setTimeout(function() {
			onResourceAcquisitionTimeout(that.array, that.resources, that.sandbox, that.socketCommunicator, that);
		}, config.resourceAcquisitionTimeout);
	}
};
/**
 * Function that adds to available resources if within the resrouce timeout
 * @function
 * @param {CommunicationEngine} socketCommEngine The CommunicationEngine of the socket to add to resources
 */
ExecutionEngine.prototype.addToResources = function(socketCommEngine) {
	if (new Date().getTime()-this.startTime <= config.resourceAcquisitionTimeout)
		this.resources.push(socketCommEngine);
};
/**
 * Function that initializes environment for execution
 * @function
 * @param  {JSON} data          The data used to initialize the Sandbox
 * @param  {Function} finalCallback Callback called once environment is initialized
 */
ExecutionEngine.prototype.initializeEnvironment = function(data, finalCallback) {
	this.sandbox.initializeEnvironment(data, finalCallback);
};
/**
 * Function to trigger the map function execution
 * @function
 * @param  {Function} finalCallback Callback called after map function executes
 */
ExecutionEngine.prototype.executeMapFunction = function(finalCallback) {
	this.sandbox.executeMapFunction(finalCallback);
};
/**
 * Function that is called when a client initializes its Environment. Used to keep track of resources and start execution once they're done
 * @function
 * @param  {CommunicationEngine} socketCommEngine The CommunicationEngine of the socket
 */
ExecutionEngine.prototype.onSocketEnvironmentInitialized = function(socketCommEngine) {
	//check if everyone has initialized their env
	winston.info('one person has initialized environment');
	var ind = _.findIndex(this.resourcesEnvironmentInitialized, {id: socketCommEngine.socket.id});
	if (ind == -1) {
		this.resourcesEnvironmentInitialized.push(socketCommEngine);
	}
	if (this.resources.length == this.resourcesEnvironmentInitialized.length) {
		winston.info('everyone has initialized their environment');
		this.socketCommunicator.emitEvent('startExecution');
	}
};
/**
 * Function that aggregates the results from all the clients
 * @function
 * @param  {CommunicationEngine} socketCommEngine
 * @param  {Error} err              Error returned by client
 * @param  {JSON} results          Results returned by client
 * @param  {Function} finalCallback    Called after results are aggregated
 */
ExecutionEngine.prototype.aggregateResults = function(socketCommEngine,err, results, finalCallback) {
	winston.info('one person has executed map');
	var ind = _.findIndex(this.resourcesExecutionDone, {id: socketCommEngine.socket.id});
	if (ind == -1) {
		this.resourcesExecutionDone.push(socketCommEngine);
		if (err) {
			this.err = err;
		}
		if (results) {
			this.results = this.results.concat(results);
		}
	}
	if(this.resources.length == this.resourcesExecutionDone.length) {
		var that = this;
		//execution is done by all resources and data received. The sandbox will now
		//execute the reduce function, and then call 2 callbacks (in parallel, no dependency)-
		// 1. The callback for the communication engine to do its comm cleanup like set itself to idle
		// 2. The callback to the original function to let it know that mapreduce is done
		this.sandbox.executeReduceFunction(this.err, this.results, function(err, results) {
			finalCallback(err, results);
			var oldCallback = that.currentCallback;
			//resetting the currentCallback to the default one, so that warnings can be logged on wrong call of callback
			winston.info('resetting the callback. MapReduce is done');
			that.currentCallback = that.defaultCallback;
			oldCallback(err);
		});
	}
};
/**
 * Function to reset the Engine
 * @function
 */
ExecutionEngine.prototype.resetExecutionEngine = function() {
	this.status = 'idle';
	this.resources = [];
	this.resourcesEnvironmentInitialized = [];
	this.resourcesExecutionDone = [];
	this.startTime = null;
	this.array = [];
	this.err = null;
	this.results = [];
	this.sandbox.cleanSandbox();
};
/**
 * Function to Execute the function locally if no resources are available
 * @function
 */
ExecutionEngine.executeFunctionLocally = function(array, sandbox, execEngine) {
	async.map(array, sandbox.mapFunction, function(err, results) {
		sandbox.reduceFunction(err, results);
		execEngine.status='idle';
	});
};
/**
 * Getter for the current singleton ExecutionEngine
 * @function
 */
ExecutionEngine.getExecutionEngine = function (socketCommunicator) {
	if (this.executionEngine) {
		return this.executionEngine;
	}
	else {
		return new ExecutionEngine(socketCommunicator);
	}
};


module.exports = ExecutionEngine;
