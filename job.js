'use strict';

var flow = require('./flowjs');

// Instantiate new sli1000 at address 0, and on specified serial port.
var sli1000 = new flow.SLI1000('sli1000',0,'/dev/tty.usbserial-A501DRCS');


sli1000.simpleGet(function(err,data) {
  if (!err) {
    console.log('measurement: ' + data);
  } else {
    console.log(err);
  }
});



//var measurement = sli1000.getSingleMeasurement();
