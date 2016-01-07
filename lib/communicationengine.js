var statuses=['idle','awaitingOrders','environmentInitialized','processed','aggregatingResults'];
var clientEvents=['requestResource','readyEnvironment','startExecution','finish'];
var serverEvents=['resourceAvailable','environmentReady','executionDone'];
var winston = require('winston');

/**
 * Constructor that creates a CommunicationEngine of a particular socket
 * @class
 * @classDesc
 * Comm Engine of every socket manager how the sockets interact. This class has the flow of control in the system
 * @param {Socket} socket The Socket that this is the engine for
 * @param {ExecutionEngine} executionEngine The global singleton Engine
 */
function CommunicationEngine(socket,executionEngine){
 	// Here, the status describes the status of the socket only. The status of the execution is in the ExecutionEngine.
	this.socket=socket;
	// this.host=socket.io.opts.host;
	this.executionEngine=executionEngine;
	this.status='idle';
	this.initializeEngine();
};
/**
 * Function that initializes the socket with the events that it should listen for;
 * @function
 */
CommunicationEngine.prototype.initializeEngine = function() {
	var commEngine=this;
	this.socket.on('requestResource',function(data){
		winston.info('this computer is requested as a resource');
		if(commEngine.status=='idle'){
			commEngine.socket.emit('resourceAvailable');
			commEngine.status=['awaitingOrders'];
		}
	});
	this.socket.on('readyEnvironment',function(data){
		winston.info('asked to ready environment');
		commEngine.executionEngine.initializeEnvironment(data,function() {
			commEngine.status='environmentInitialized';
			commEngine.socket.emit('environmentReady');
		});
	});
	this.socket.on('startExecution',function(data){
		winston.info('starting execution');
		commEngine.executionEngine.executeMapFunction(function(err,results) {
			commEngine.status='processed';
			commEngine.socket.emit('executionDone',{err:err,results:results});
		});
	});
	this.socket.on('resourceAvailable',function(data){
		winston.info('someone is available');
		commEngine.status='awaitingOrders';
		commEngine.executionEngine.addToResources(commEngine);
	});
	this.socket.on('environmentReady',function(data){
		winston.info('a resource has initialized its environment');
		commEngine.status='environmentInitialized';
		commEngine.executionEngine.onSocketEnvironmentInitialized(commEngine);
	});
	this.socket.on('executionDone',function(data){
		commEngine.executionEngine.aggregateResults(commEngine,data.err,data.results,function() {
			commEngine.status='idle';
			commEngine.socket.emit('finish');
		});
	});
	this.socket.on('finish',function(data) {
		commEngine.status='idle';
	});
};
/**
 * Function that collates and sends environment data in a standardized format
 * @function
 * @param  {JSON} data The data that must be sent
 */
CommunicationEngine.prototype.emitEnvironmentData = function(data) {
	this.socket.emit('readyEnvironment',data);
};

module.exports=CommunicationEngine;
