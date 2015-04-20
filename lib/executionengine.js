

var statuses=['idle','awaitingOrders','initializingEnvironment','processing','aggregatingResults'];
var clientEvents=['requestResource','readyEnvironment','startExecution'];
var serverEvents=['resourceAvailable','environmentReady','executionDone'];

function ExecutionEngine() {
	this.status='idle';
}

