var SocketCommunicator=require('./socketcomm.js');
var config=require('../config/config.js');
var _=require('lodash');

// var statuses=['idle','awaitingOrders','initializingEnvironment','processing','aggregatingResults'];
// var clientEvents=['requestResource','readyEnvironment','startExecution'];
// var serverEvents=['resourceAvailable','environmentReady','executionDone'];
// var statuses=['idle','awaitingReplies',]

/**
 * ExecutionEngine makes sure that the clients are ready for executing the functions.
 * If needed, the environment/stubs are created and then the required functions are executed
 */
function ExecutionEngine() {
	ExecutionEngine.executionEngine=this;
	this.status='idle';
	this.resources=[];
	this.resourcesenvironmentinitialized=[];
	this.startTime=null;
	this.mapFunction="";
	this.reduceFunction="";
	this.array=[];
	this.options={};
	this.socketCommunicator=SocketCommunicator.getSocketCommunicator();
}

// async.each(array,function(elem,innerC) {
// 	innerC(null,elem+1);
// },function(err,results) {
// 	console.log(results);
// });

/**
 * This does the mapReduce capabilities of the system. Usually, these are the functions within the async callbacks.
 * 
 * @param  {function} maps the stuff that needs to be done in each client
 * @param  {object options} {environment:{}}
 * @return {callback} which 
 */
ExecutionEngine.prototype.executeMapReduce = function(array,map,reduce,options) {
	if(this.status=='idle'){
		this.mapFunction=map;
		this.reduceFunction=reduceFunction;
		this.array=array;
		this.options=options;
		this.startTime=new Date().getTime();
		this.socketCommunicator.emitEvent('requestResource');
		setTimeout(this.onResourceAcquisitionTimeout,config.resourceAcquisitionTimeout);
	}
};
ExecutionEngine.prototype.onResourceAcquisitionTimeout=function() {
	//we gotta move on. The current resources are all the resources available.
	if(this.resources.length!=0&&this.resources.length>=this.array.length){
		var step=Math.floor(this.array.length/this.resources.length);
	}
	console.log('got the resources. There are '+this.resources.length);
	this.socketCommunicator.emitEvent('readyEnvironment',{},this.resources,function(){});
}
ExecutionEngine.prototype.addToResources = function(socketCommEngine) {
	if(new Date().getTime()-this.startTime>=config.resourceAcquisitionTimeout)
		this.resources.push(socketCommEngine);
};
ExecutionEngine.prototype.initializeEnvironment = function(data) {
	//initing the environment and stuff;
};
ExecutionEngine.prototype.executeMapFunction = function(err,finalCallback) {
	//execute the stuff
};
ExecutionEngine.prototype.executeReduceFunction = function(err,results,finalCallback) {
	//execute the stuff
};
ExecutionEngine.prototype.onSocketEnvironmentInitialized = function(socketCommEngine) {
	//check if everyone has initialized their env
	console.log('one person has inited environment');
	var ind=_.findIndex(this.resourcesEnvironmentInitialized,{id:socketCommEngine.socket.id});
	if(ind!=-1){
		this.resourcesEnvironmentInitialized.push(socketCommEngine);
	}
	if(this.resources.length==this.resourcesEnvironmentInitialized.length){
		console.log('everyone has initialized their environment');
		this.socketCommunicator.emitEvent('startExecution');
	}
};
ExecutionEngine.prototype.resetExecutionEngine = function() {
	//TODO:- reset everything to empty arrays
};
ExecutionEngine.getExecutionEngine=function () {
	if(this.executionEngine)
		return this.executionEngine;
	else return new ExecutionEngine();
};

module.exports=ExecutionEngine;
