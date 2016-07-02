var asyncParallel=require('../main.js');

asyncParallel.broadcast(function(cb) {
	var self = this
	setTimeout(function() {
		console.log("Map", new Date().getTime())
		self.logger.log("Logger function")
		cb();
	}, 2000);
}, function(err,res) {
	console.log("Done executing on all machines");
});
