//LLRP DEVICE SCANNER
var net    = require('net'), Socket = net.Socket;
var async = require('async');

function PortScanner(options){
    this.data=null;
    var checkPort = function(port, host, callback) {
        var socket = new Socket(), status = null;
        // Socket connection established, port is open
        socket.on('connect', function() {
            status = 'open';
            callback(null,status,host,port);
            socket.end();
        });
        socket.setTimeout(1500);// If no response, assume port is not listening
        socket.on('timeout', function() {
            status = 'closed';
            console.log('socket is timed out');
            console.log(port+' '+host);
            socket.destroy();
        });
        socket.on('error', function(exception) {
            console.log('socket is error');
            console.log(port+' '+host);
            console.log(exception)
            status = 'errored';
        });
        socket.on('close', function(exception) {
            console.log('socket is closed');
            console.log(port+' '+host);
            status = 'closed';
            callback(null, status,host,port);
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
                checkPort(PORT, LAN+'.'+i, function(error, status, host, port){
                    if(status == "open"){
                        connectedMachines.push(host);
                    }
                    innerCallback();
                });
            }
        },function(err){
            return callback(err,connectedMachines);
        });
    };
}

PortScanner.prototype.initPortScanner = function(options) {
};

module.exports=PortScanner;
