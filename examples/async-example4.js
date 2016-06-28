var asyncParallel=require('../main.js');
var arr = [];
var function1 = function(){
  console.log("Printing Function 1");
}

var function2 = function(){
  console.log("Printing Function 2");
}

arr.push(function1);
arr.push(function2);
arr.push(function1);
arr.push(function2);

asyncParallel.parallel(arr, function(cb) {
	setTimeout(function() {
		console.log("Executing locally.");
		if (cb) cb();
	}, 2000);
}, function(err, res) {
	console.log("Done executing on all machines");
});
