var async=require('async');
// var net    = require('net'), Socket = net.Socket;
//         var socket = new Socket(), status = null;
//         // Socket connection established, port is open
//         socket.on('connect', function() {
//             status = 'open';
//             console.log('socket is open');
//             console.log(port+' '+host);
//             socket.end();
//         });
//         socket.on('error', function(exception) {
//             console.log('socket is error');
//             console.log(port+' '+host);
//             console.log(exception)
//             status = 'closed';
//         });
//         socket.on('close', function(exception) {
//             console.log('socket is closed');
//             console.log(port+' '+host);
//             callback(null, status,host,port);
//         });
//         socket.connect('8000','192.158.1');

console.log('starting now')
var start=new Date().getTime();
console.log(start);
var a=0;
var testArray=[1,2,3,2,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6];
async.each(testArray,function(item,callback){
	a++;
	setTimeout(callback,2000);
},function(err){
	console.log('done now');
	var b=a;
	console.log(new Date().getTime()-start);
});