'use strict';

var flow = require('./flowjs');

var sli1000 = new flow.SLI1000('sli1000',0);


sli1000.simpleGet(function(data) {
  console.log('measurement: ' + data);
});



//var measurement = sli1000.getSingleMeasurement();
