# node-parallel-tasks
A tool to share tasks among machines in your localhost

This module can be run as a daemon on machines in your local area. This allows them to accept connections
in order to share tasks. When tasks need to be shared, then require this module in your code, and
the task gets equally divided into all the machines in you local area which have this module running.

## Install and run as daemon
```
npm install -g node-parallel-tasks
node-parallel-tasks --daemon
```

## Install and use as an npm module
In your project directory, run
```
npm install node-parallel-tasks
```
Then, require the module and use it in your code
```
var asyncParallel = require('node-parallel-tasks');
asyncParallel.mapReduce([1,2,3,4], function map() {
	callback(null, elem+1);
}, function reduce(err, results) {
	//results show [2,3,4,5]
});
```

## Usage
There are 3 functions as of now to share tasks among local machines-
1. MapReduce - Takes an array, a map function, and a reduce function. It shares the array among machines available, runs the map function on the machines. The results are then sent to the source machine and the reduce function is run on it.
2. Broadcast - Takes a broadcast function and a callback function. Runs the broadcast function on available machines and runs the callback on the source machine after all broadcasts are done
3. Parallel - Takes an array of functions, and a callback function. It shares the array among available machines, and runs them on the machines. The results are sent to the source machine, where the callback is called

You can check out the examples for further details

## Documentation
There are 3 ways to check out the docs-
1. Go to http://vikramthyagarajan.github.io/node-parallel-tasks/
2. Go to the docs/ folder and open index.html
3. Type 'grunt docs' in the terminal in the project. A window will open in your browser with the docs. 

NOTE: You might need grunt installed to work on the docs.
