var Sandbox=require('./sandbox.js');
var config=require('../config/config.js');
var eventEmitter=require('events').EventEmitter;
var async=require('async');
var _=require('lodash');

// var statuses=['idle','awaitingOrders','initializingEnvironment','processing','aggregatingResults'];
// var clientEvents=['requestResource','readyEnvironment','startExecution'];
// var serverEvents=['resourceAvailable','environmentReady','executionDone'];
// var statuses=['idle','awaitingReplies',]

/**
 * ExecutionEngine makes sure that the clients are ready for executing the functions.
 * If needed, the environment/stubs are created and then the required functions are executed
 */
function ExecutionEngine(socketCommunicator) {
	ExecutionEngine.executionEngine=this;
	this.sandbox=new Sandbox();
	this.status='idle';
	this.resources=[];
	this.resourcesEnvironmentInitialized=[];
	this.resourcesExecutionDone=[];
	this.startTime=null;
	this.array=[];
	this.err=null;
	this.results=[];
	this.socketCommunicator=socketCommunicator;
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
 * @param  {object} {environment:{}}
 * @return {callback} which 
 */
ExecutionEngine.prototype.executeMapReduce = function(array,map,reduce,options) {
	if(this.status=='idle'){
		this.status='running';
		this.resetExecutionEngine();
		this.sandbox.initializeSandbox(array,map,reduce,options.scope);
		this.array=array;
		this.options=options;
		this.startTime=new Date().getTime();
		this.socketCommunicator.emitEvent('requestResource');
		var that=this;
		setTimeout(function() {
			onResourceAcquisitionTimeout(that.array,that.resources,that.sandbox,that.socketCommunicator,that);
		},config.resourceAcquisitionTimeout);
	}
};
var onResourceAcquisitionTimeout=function(array,resources,sandbox,socketCommunicator,currentEngine) {
	//we gotta move on. The current resources are all the resources available.
	if(resources.length!=0){
		var step=Math.floor(array.length/resources.length);
		var lastStep=0;
		var commonData=sandbox.getSandboxEmitData();
		resources.forEach(function(resource) {
			var data=_.clone(commonData);
			data.array=array.slice(lastStep,lastStep+step);
			lastStep+=step;
			resource.emitEnvironmentData(data);
		});
		// sandbox.setArray(array.slice(lastStep));
	}
	// else sandbox.setArray(array);
	console.log('got the resources. There are '+resources.length);
	if(resources.length==0){
		console.log('there are no resources. Performing function locally');
		ExecutionEngine.executeFunctionLocally(array, sandbox, currentEngine);
	}
	socketCommunicator.emitEvent('readyEnvironment');
}
ExecutionEngine.prototype.addToResources = function(socketCommEngine) {
	if(new Date().getTime()-this.startTime<=config.resourceAcquisitionTimeout)
		this.resources.push(socketCommEngine);
};
ExecutionEngine.prototype.initializeEnvironment = function(data,finalCallback) {
	this.sandbox.initializeEnvironment(finalCallback);
};
ExecutionEngine.prototype.executeMapFunction = function(finalCallback) {
	this.sandbox.executeMapFunction(finalCallback);
};
ExecutionEngine.prototype.onSocketEnvironmentInitialized = function(socketCommEngine) {
	//check if everyone has initialized their env
	console.log('one person has inited environment');
	var ind=_.findIndex(this.resourcesEnvironmentInitialized,{id:socketCommEngine.socket.id});
	if(ind==-1){
		this.resourcesEnvironmentInitialized.push(socketCommEngine);
	}
	if(this.resources.length==this.resourcesEnvironmentInitialized.length){
		console.log('everyone has initialized their environment');
		this.socketCommunicator.emitEvent('startExecution');
	}
};
ExecutionEngine.prototype.aggregateResults = function(socketCommEngine,err,results,finalCallback) {
	console.log('one person has executed map');
	var ind=_.findIndex(this.resourcesExecutionDone,{id:socketCommEngine.socket.id});
	if(ind==-1){
		this.resourcesExecutionDone.push(socketCommEngine);
		if(err)
			this.err=err;
		if(results){
			this.results=this.results.concat(results);
		}
	}
	if(this.resources.length==this.resourcesExecutionDone.length){
		console.log('everyone has finished execution');
		console.log('aggregating results done');
		this.sandbox.executeReduceFunction(this.err,this.results,finalCallback);
	}
};
ExecutionEngine.prototype.resetExecutionEngine = function() {
	this.status='idle';
	this.resources=[];
	this.resourcesEnvironmentInitialized=[];
	this.resourcesExecutionDone=[];
	this.startTime=null;
	this.array=[];
	this.err=null;
	this.results=[];
	this.sandbox.cleanSandbox();
};
ExecutionEngine.executeFunctionLocally = function(array,sandbox,execEngine) {
	async.map(array,sandbox.mapFunction,function(err,results) {
		sandbox.reduceFunction(err,results);
		execEngine.status='idle';
	});
};
ExecutionEngine.getExecutionEngine=function (socketCommunicator) {
	if(this.executionEngine)
		return this.executionEngine;
	else return new ExecutionEngine(socketCommunicator);
};

module.exports=ExecutionEngine;
