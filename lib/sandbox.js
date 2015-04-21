

function Sandbox() {
	this.cleanSandbox();
}
Sandbox.prototype.cleanSandbox = function() {
	this.mapFunction="";
	this.reduceFunction="";
	this.array=[];
	this.options={};
	this.scope=null;
};
Sandbox.prototype.initializeSandbox = function(map,reduce,scope) {
	if(typeof map=='String'){
		this.mapFunction=eval(map);
	}
	else this.mapFunction=map;
	if(typeof reduce=='String'){
		this.reduceFunction=eval(reduce);
	}
	else this.reduceFunction=reduce;
	this.scope=scope;
};
Sandbox.prototype.setArray = function(array) {
	this.array=array;
};
Sandbox.prototype.getSandboxEmitData = function() {
	var data={
		mapFunction:this.mapFunction,
		reduceFunction:this.reduceFunction,
		scope:this.scope
	};
	return data;
};
Sandbox.prototype.initializeEnvironment = function(finalCallback) {
	finalCallback();
};
Sandbox.prototype.executeMapFunction = function(finalCallback) {
	async.map.call(this.scope,this.array,this.mapFunction,finalCallback);
};
Sandbox.prototype.executeReduceFunction = function(err,results,finalCallback) {
	var result=this.reduceFunction.call(this.scope,err,results);
};

module.exports=Sandbox;