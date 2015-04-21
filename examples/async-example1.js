var asyncParallel=require('../main.js');

asyncParallel.executionEngine.executeMapReduce([1,2,3,4],function(elem,innerC) {
	innerC(elem+1);
},function(err,results) {
	console.log('got results');
	console.log(results);
});