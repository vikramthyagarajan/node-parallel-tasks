var async=require('async');

/**
 * @class
 * All executions in the system happen within a Sandbox. Every map and reduce function is executed here. All environment
 * initializations also happen within the sandbox. It holds the custom scope that every function is supposed to run on.
 */
function Sandbox(streamlogger) {
	// this.cleanSandbox();
	this.initializeUtilities(streamlogger);
}
/**
 * Function to clean and reset the Sandbox
 */
Sandbox.prototype.cleanSandbox = function() {
	this.mapFunction = "";
	this.reduceFunction = "";
	this.array = [];
	this.options = {};
	this.scope = null;
};


/**
 * Function to initialize Sandbox for executing remote procedures
 * @param  {Function} map    The map function that has to be executed
 * @param  {Function} reduce The reduce function that has to be executed on the server
 * @param  {JSON} scope  The custom scope that each function needs to be run on
 */
Sandbox.prototype.initializeSandbox = function(array, map, reduce, scope) {
	if(map && typeof map == 'string') {
		this.mapFunction = eval(map);
	}
	else this.mapFunction = map;
	if(reduce && typeof reduce == 'string') {
		this.reduceFunction = eval(reduce);
	}
	else this.reduceFunction = reduce;
	this.array = array;
	this.scope = scope;
};
Sandbox.prototype.initializeParallelSandbox = function(map, reduce, scope) {
	if(map && typeof map == 'string') {
		this.mapFunction = eval(map);
	}
	else this.mapFunction = map;
	if(reduce && typeof reduce == 'string') {
		this.reduceFunction = eval(reduce);
	}
	else this.reduceFunction = reduce;
	this.scope = scope;
}


/**
 * Setter for the array variable
 * @param {Array} array The array to be set
 */
Sandbox.prototype.setArray = function(array) {
	this.array = array;
};
/**
 * Getter to get the data which will be emitted to other sockets
 * @return {JSON} The data that needs to be emitted. The Map, Reduce and the Scope
 */
Sandbox.prototype.getSandboxEmitData = function() {
	var data = {
		mapFunction: this.mapFunction.toString(),
		reduceFunction: this.reduceFunction.toString(),
		scope: this.scope
	};
	return data;
};
Sandbox.prototype.initializeEnvironment = function(data, finalCallback) {
	map = data.mapFunction;
  reduce = data.reduceFunction;
	var i = 0;
	var func_arr = []
	if (data.array) {
		for (i = 0; i < data.array.length; i++) {
			func_arr.push(eval('('+data.arrn[i]+')'));
		}
	}
	scope = data.scope;
	if (map && typeof map == 'string') {
		this.mapFunction=eval('('+map+')');
	}
	else this.mapFunction = map;
	if (reduce && typeof reduce == 'string') {
		this.reduceFunction=eval('('+reduce+')');
	}
	else this.reduceFunction = reduce;
	if (data.array) {
		this.array = data.array;
	}
	this.arrn = func_arr;
	finalCallback();
};
/**
 * Trigger to execute the Map Function
 * @param  {Function} finalCallback Callback called at the end of the Map Function execution. Returns err and results
 */
Sandbox.prototype.executeMapFunction = function(finalCallback) {
	if (this.array.length == 0) {
		async.series([this.mapFunction.bind(this.utilities), finalCallback]);
	}
	else {
		var i = 0;
		if (this.array[0] != null) {
			async.map.call({}, this.array, this.mapFunction.bind(this.utilities), finalCallback);
		}
		else{
			var i = 0;
		  for (i = 0; i < this.arrn.length; i++) {
				this.arrn[i] = this.arrn[i].bind(this.utilities)
			}
			async.series(this.arrn, function() {
				finalCallback();
			});
		}
	}
};
/**
 * Trigger to execute the Reduce Function
 * @param  {Function} finalCallback Callback called at the end of the Reduce Function execution.
 */
Sandbox.prototype.executeReduceFunction = function(err, results, finalCallback) {
	this.reduceFunction.call(this.scope, err, results);
	finalCallback();
};

Sandbox.prototype.initializeUtilities = function(streamlogger) {
	this.utilities = {
		logger: streamlogger
	}
}
module.exports = Sandbox;
