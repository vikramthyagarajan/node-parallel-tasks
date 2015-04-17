var winston=require('winston');
var PortScanner=require('./lib/portscanner.js');
var SocketCommunicator=require('./lib/socketcomm.js');

var currentSocketComm=new SocketCommunicator();

var currentPortScanner=new PortScanner({lan:'192.168.2',port:'8000'});
currentPortScanner.scanPorts(function(err,connectedMachines){console.log(connectedMachines)});

