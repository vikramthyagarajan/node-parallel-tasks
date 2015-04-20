

var statuses=['idle','awaitingOrders','initializingEnvironment','processing','aggregatingResults'];
var clientEvents=['requestResource','readyEnvironment','startExecution'];
var serverEvents=['resourceAvailable','environmentReady','executionDone'];

function CommunicationEngine(socket){
	this.socket=socket;
	this.status='connected';
	this.initializeEngine();
};

CommunicationEngine.prototype.initializeEngine = function() {
	this.socket.on('requestResource',function(data){
	});
	this.socket.on('readyEnvironment',function(data){
	});
	this.socket.on('startExecution',function(data){
	});
	this.socket.on('resourceAvailable',function(data){
	});
	this.socket.on('environmentReady',function(data){
	});
	this.socket.on('executionDone',function(data){
	});
};
