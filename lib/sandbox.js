

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
	var oldThis=this;
	this=scope;
	async.each(this.array,this.mapFunction,finalCallback);
	this=oldThis;
};
Sandbox.prototype.executeReduceFunction = function(err,results,finalCallback) {
	var oldThis=this;
	this=scope;
	var result=this.reduceFunction(err,results);
	this=oldThis;
};

module.exports=Sandbox;