var asyncParallel=require('../main.js');

console.log('execing map reduce');
asyncParallel.mapReduce([1,2,3,4], function(elem, innerC) {
	innerC(null, elem+1);
}, function(err, results) {
	console.log('one');
	console.log(results);
});
asyncParallel.mapReduce([5,6,7,8], function(elem, innerC) {
	innerC(null, elem+1);
}, function(err, results) {
	console.log('two');
	console.log(results);
});
asyncParallel.parallel(function() {
	setTimeout(function() {
		console.log("Executing locally.");
	}, 2000);
}, function(err,res) {
	console.log("Done executing on all machines");
});
