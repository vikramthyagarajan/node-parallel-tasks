var asyncParallel=require('../main.js');
var arr = [];
var function1 = function(cb){
  console.log("Printing Function 1");
  cb();
}

var function2 = function(cb){
  var self = this;
  setTimeout(function(){
    self.logger.log("Executing function 2")
    console.log("Printing Function 2");
    cb();
  },1000);
}
var function3 = function(cb){
  setTimeout(function(){
    console.log("Printing Function 3");
    cb();
  },500);
}
var function4 = function(cb){
  this.logger.log("Executing function 4")
  console.log("Printing Function 4");
  cb();
}


arr.push(function1);
arr.push(function2);
arr.push(function3);
arr.push(function4);
asyncParallel.parallel(arr, function(cb) {
	setTimeout(function(cb) {
		console.log("Executing locally.");
		if (cb) cb();
	}, 2000);
}, function(err, res) {
	console.log("Done executing on all machines");
});
