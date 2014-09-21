var flow = require('flowjs.js');
    sli1000 = new flow.sli1000();

sli1000.on("ready", function() {


});
serialPort.on('open', function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
    console.log(typeof(data));
    console.log('got %d bytes of data', data.length);
    console.log(data);
    var buffData = readContent(flow.stripStartStop(data))
  });
  //device info
  serialPort.write([0x7E, 0x00, 0xD0, 0x01, 0x01, 0x2D, 0x7E], function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results.toString());
    console.log(results);
  });
  //get single measurement

});
