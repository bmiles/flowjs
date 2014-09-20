var flow=require('flowjs.js');

serialPort.on('open', function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
    console.log(typeof(data));
    console.log('got %d bytes of data', data.length);
    console.log(data);
    var bufstring = data.slice().toString();
    console.log(bufstring);
    serialPort.write([0x7E, 0x00, 0x32, 0x00, 0xCD, 0x7E], function(err, results) {
      console.log('err ' + err);
      console.log('results ' + results.toString());
      console.log(results);
    });
  });
  //device info
  serialPort.write([0x7E, 0x00, 0xD0, 0x01, 0x01, 0x2D, 0x7E], function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results.toString());
    console.log(results);
  });
  //get single measurement

});
