var asyncParallel=require('../main.js');

asyncParallel.parallel(function() {
	setTimeout(function() {
		console.log("Executing locally.");
	}, 2000);
}, function(err,res) {
	console.log("Done executing on all machines");
});
