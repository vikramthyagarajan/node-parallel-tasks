//LLRP DEVICE SCANNER
var net    = require('net'), Socket = net.Socket;
var async = require('async');
var socketIo=require('socket.io-client');
var winston = require('winston');

/**
 * Scans ports based on the lan subnet, port and timeout specified in its parameters 
 * @class PortScanner
 * @param {JSON} options Takes the following parameters-
 *                       lan: The lan subnet, for example: 192.168.1
 *                       port: The port to be scanned
 *                       timeout: The maximum time to listen for replies
 */
function PortScanner(options){
    this.data=null;
    /**
     * Function that checks connection with a specific host
     * @function
     * @param  {Number}   port     The port of the host to check; eg 8000
     * @param  {String}   host     The host to check connection with; eg 192.168.2.2
     * @param  {Function} callback Callback which takes params error,status,host,port and socket
     */
    var checkPort = function(port, host, callback) {
        var socket = socketIo('http://'+host+':'+port,{reconnection:false,timeout:5000,forceNew:true}),status = null;
        socket.on('connect', function() {
            // Socket connection established, port is open
            status = 'open';
            callback(null,status,host,port,socket);
        });
        socket.on('connect_timeout',function() {
            status = 'closed';
            callback('timeout');
        });
        socket.on('connect_error', function(exception) {
            if(exception=='timeout'){
                return;
            }
            status = 'errored';
            return callback('error',exception);
        });
        socket.connect(port, host);
    }
    var LAN = options.lan;
    var PORT = options.port;

    /**
     * Function that scans every machine on the local area
     * @function
     * @param  {Function} callback Callback which executes after all ports are scanned. Returns error,array of connected machines
     */
    PortScanner.prototype.scanPorts = function(callback) {
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
            winston.info('port scanning done');
            return callback(err,connectedMachines);
        });
    };
}
module.exports=PortScanner;
