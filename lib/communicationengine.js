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
	this.host=socket.io.opts.host;
	this.executionEngine=executionEngine;
	this.status='connected';
	this.initializeEngine();
};

CommunicationEngine.prototype.initializeEngine = function() {
	this.socket.on('requestResource',function(data){
		if(this.status=='idle'){
			this.socket.emit('resourceAvailable');
			this.status=['awaitingOrders'];
		}
	});
	this.socket.on('readyEnvironment',function(data){
		console.log('asked to ready');
		this.executionEngine.initializeEnvironment(data,function() {
			this.status='environmentInitialized';
			this.socket.emit('environmentReady');
		});
	});
	this.socket.on('startExecution',function(data){
		this.executionEngine.executeMapFunction(function(err,results) {
			this.status='processed';
			this.socket.emit('executionDone',{err:err,results:results});
		});
	});
	this.socket.on('resourceAvailable',function(data){
		this.status='awaitingOrders';
		this.executionEngine.addToResources(this);
	});
	this.socket.on('environmentReady',function(data){
		this.status='environmentInitialized';
		this.executionEngine.onSocketEnvironmentInitialized(this);
	});
	this.socket.on('executionDone',function(data){
		this.executionEngine.aggregateResults(this,data.err,data.results,function() {
			this.status='idle';
			this.socket.emit('finish');
		});
	});
	this.socket.on('finish',function(data) {
		this.status='idle';
	});
};

CommunicationEngine.prototype.emitEnvironmentData = function(data) {
	this.socket.emit('readyEnvironment',data);
};

module.exports=CommunicationEngine;
