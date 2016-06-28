var asyncParallel=require('../main.js');

asyncParallel.broadcast(function(cb) {
	setTimeout(function() {
		console.log("Executing locally.");
		cb();
	}, 2000);
}, function(err,res) {
	console.log("Done executing on all machines");
});
