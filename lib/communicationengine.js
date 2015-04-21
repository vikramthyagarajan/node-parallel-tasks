var statuses=['idle','awaitingOrders','environmentInitialized','processed','aggregatingResults'];
var clientEvents=['requestResource','readyEnvironment','startExecution','finish'];
var serverEvents=['resourceAvailable','environmentReady','executionDone'];

/**
 * Comm Engine of every socket manager how the sockets interact. This class has the flow of control in the system
 * @param {socket-io socket}
 * Here, the status describes the status of the socket only. The status of the execution is in the ExecutionEngine.
 */
function CommunicationEngine(socket,executionEngine){
	this.socket=socket;
	// this.host=socket.io.opts.host;
	this.executionEngine=executionEngine;
	this.status='connected';
	this.initializeEngine();
};
CommunicationEngine.prototype.initializeEngine = function() {
	var commEngine=this;
	this.socket.on('requestResource',function(data){
		console.log('is reqr res');
		if(commEngine=='idle'){
			commEngine.socket.emit('resourceAvailable');
			commEngine.status=['awaitingOrders'];
		}
	});
	this.socket.on('readyEnvironment',function(data){
		console.log('asked to ready');
		commEngine.executionEngine.initializeEnvironment(data,function() {
			commEngine.status='environmentInitialized';
			commEngine.socket.emit('environmentReady');
		});
	});
	this.socket.on('startExecution',function(data){
		console.log('is sta exe');
		commEngine.executionEngine.executeMapFunction(function(err,results) {
			commEngine.status='processed';
			commEngine.socket.emit('executionDone',{err:err,results:results});
		});
	});
	this.socket.on('resourceAvailable',function(data){
		console.log('is res ava');
		console.log('someone is available');
		commEngine.status='awaitingOrders';
		commEngine.executionEngine.addToResources(this);
	});
	this.socket.on('environmentReady',function(data){
		console.log('is env rea');
		commEngine.status='environmentInitialized';
		commEngine.executionEngine.onSocketEnvironmentInitialized(this);
	});
	this.socket.on('executionDone',function(data){
		commEngine.executionEngine.aggregateResults(this,data.err,data.results,function() {
			commEngine.status='idle';
			commEngine.socket.emit('finish');
		});
	});
	this.socket.on('finish',function(data) {
		commEngine.status='idle';
	});
};

CommunicationEngine.prototype.emitEnvironmentData = function(data) {
	this.socket.emit('readyEnvironment',data);
};

module.exports=CommunicationEngine;
