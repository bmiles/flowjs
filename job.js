var flow = require('./flowjs');

var sli1000 = new flow.SLI1000('sli1000',0);

sli1000.getSensorStatus();

sli1000.startSingleMeasurement();
var measurement = sli1000.getSingleMeasurement();
console.log(measurement);
