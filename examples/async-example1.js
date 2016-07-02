var asyncParallel=require('../main.js');

asyncParallel.mapReduce([1,2,3,4], function(elem, innerC) {
	this.logger.log("Executing Map now")
	innerC(null, elem+1);
}, function(err, results) {
	console.log('one');
	console.log(results);
});
asyncParallel.mapReduce([5,6,7,8], function(elem, innerC) {
	this.logger.log("Executing map 2 now")
	innerC(null, elem+1);
}, function(err, results) {
	console.log('two');
	console.log(results);
});
