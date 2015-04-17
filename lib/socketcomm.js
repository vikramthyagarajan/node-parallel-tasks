var io = require('socket.io')();
var config=require('../config/config.js');

function SocketCommunicator(){
	this.stuff=null;
	function initalizeServer(){
		io.on('connection', function(socket){
			socket.on('event',function(data){
				console.log('an event- ');
				console.log(data);
			});
			socket.on('disconnect',function(){
				console.log('a user is disconnected');
				console.log(socket);
			});
		});
		io.listen(config.port);
	};
	initalizeServer();
}

module.exports=SocketCommunicator;
