var asyncParallel=require('../main.js');
var arr = [];
var function1 = function(cb){
  console.log("Printing Function 1");
  cb();
}

var function2 = function(cb){
  setTimeout(function(){
    console.log("Printing Function 2");
    cb();
  },1000);
}
var function3 = function(cb){
  console.log("Printing Function 3");
  cb();
}
var function4 = function(cb){
  console.log("Printing Function 4");
  cb();
}


arr.push(function1);
arr.push(function2);
arr.push(function3);
arr.push(function4);

asyncParallel.parallel(arr, function(cb) {
	setTimeout(function() {
		console.log("Executing locally.");
		if (cb) cb();
	}, 2000);
}, function(err, res) {
	console.log("Done executing on all machines");
});
