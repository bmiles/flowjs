'use strict';

var flow = require('./flowjs');

var sli1000 = new flow.SLI1000('sli1000',0);

//sli1000.getSensorStatus();
setInterval(function(){
  sli1000.startSingleMeasurement();
  setTimeout(function(){
    console.log('getting...');
    sli1000.getSingleMeasurement();
  }, 1000);
}, 3000);


//var measurement = sli1000.getSingleMeasurement();
