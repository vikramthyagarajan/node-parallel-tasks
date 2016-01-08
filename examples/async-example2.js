var asyncParallel=require('../main.js');

var path = 'examples/async-example1.js'
asyncParallel.mapReduce([path], function(item, callback) {
	var fs = require('fs');
	return fs.stat(item, callback);
}, function(err, results) {
	console.log(results);
});
