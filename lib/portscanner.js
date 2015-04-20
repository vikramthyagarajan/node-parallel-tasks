//LLRP DEVICE SCANNER
var net    = require('net'), Socket = net.Socket;
var async = require('async');
var socketIo=require('socket.io-client');

function PortScanner(options){
    this.data=null;
    var checkPort = function(port, host, callback) {
        var socket = socketIo('http://'+host+':'+port,{reconnection:false,timeout:10000}),status = null;
        // Socket connection established, port is open
        socket.on('connect', function() {
            status = 'open';
            console.log('is open '+host);
            callback(null,status,host,port,socket);
        });
        socket.on('connect_timeout',function() {
            status = 'closed';
            // console.log('connection timouts at '+host);
            callback('timeout');
        });
        socket.on('connect_error', function(exception) {
            if(exception=='timeout'){
                // console.log('is not'+host);
                return;
            }
            // console.log('socket is error');
            // console.log(port+' '+host);
            // console.log(exception)
            status = 'errored';
            return callback('error',exception);
        });
        socket.on('disconnect', function(exception) {
            status = 'closed';
            // console.log('is closed');
            callback('closed',exception);
        });
        socket.connect(port, host);
    }
    var LAN = options.lan; //Local area network to scan (this is rough)
    var PORT = options.port; //globally recognized PORT port for RFID readers

    //making scan ports a privileged method so as to access the private variables LAN and PORT
    this.scanPorts = function(callback) {
        //scan over a range of IP addresses and execute a function each time the PORT port is shown to be open.
        var connectedMachines=[];
        async.times(256,function(i,innerCallback){
            if(i==0)
                innerCallback();
            else{
                checkPort(PORT, LAN+'.'+i, function(error, status, host, port, socket){
                    if(status == "open"){
                        connectedMachines.push(host);
                    }
                    innerCallback();
                });
            }
        },function(err){
            console.log('is run');
            return callback(err,connectedMachines);
        });
    };
}
module.exports=PortScanner;
