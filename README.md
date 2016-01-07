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

##Documentation
There are 2 ways to check out the docs-
1. Go to the docs/ folder and open index.html
2. Type 'grunt docs' in the terminal in the project. A window will open in your browser with the docs. 

NOTE: You might need grunt installed to work on the docs.
