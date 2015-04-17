var winston=require('winston');
var PortScanner=require('./lib/portscanner.js');

var currentPortScanner=new PortScanner({lan:'192.168.1',port:'8000'});
console.log('out')
console.log(currentPortScanner.lan)
currentPortScanner.scanPorts(function(err,connectedMachines){console.log(connectedMachines)});
currentPortScanner.lan;
