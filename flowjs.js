'use strict';
var serialport = require('serialport');
var SerialPort = require('serialport').SerialPort;
var ls = require('underscore');
//var serialPort = new SerialPort('/dev/tty.usbserial-A501DRCS', {
//  baudrate: 115200,
//  parser: serialport.parsers.raw
//});

var stripStartStopChk = function(buf) {
  return buf.slice(1,buf.length - 2);
};

var readContent = function(buf) {
  var bufferJSON = {
    "devAddress" : buf.readUInt8(0),
    "command" : buf.readUInt8(1),
    "state" : buf.readUInt8(2),
    "dataLength" : buf.readUInt8(3),
    "dataContent" : buf.slice(4)
  };
  return bufferJSON;
};

// the read data function acceps the dataContent buffer from the readcontent function.
var readData = function(dataBuf) {
  var scaleFactor = 13;
  var sensorOutput = (dataBuf.readUInt8(0) << 8) + dataBuf.readUInt8(1);
  // measurementDataType refers to if the sensor output is signed or unsigned.
  if (measurementDataType == 0) {
    // had to add in this l variable as doing the this in the if statement didn't work.
    var l = sensorOutput & 32768;
    if (l == 32768) {
      var flowTicks = -((sensorOutput ^ 65535) +1);
    } else {
      var flowTicks = sensorOutput;
    }
  } else {
    var flowTicks = sensorOutput;
    }
  var physicalFlow = flowTicks / scaleFactor;
  return physicalFlow;
};

var addChk = function(bArr) {
  var byteSum = ls.reduce(bArr, function(sum, num) {
    return sum + num;
  });
  chkSum = (byteSum & 0xFF) ^ 0xFF;
  bArr.push(chkSum);
  return bArr;
  // summ arry of bytes
  // & answer to 255 0xFF
  // invert ^ answer by 0xFF
};

var addStartStop = function (bArr) {
  bArr.push(0x7e);
  bArr.unshift(0x7e);
  return bArr;
};

var stuffIt = function(bArr) {
  // reg ex for 0x7e
  // stuff bytes to replace it
  // ret corrected bArr
};

serialPort.on('open', function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
    console.log(typeof(data));
    console.log('got %d bytes of data', data.length);
    console.log(data);
    var bufstring = data.slice().toString();
    console.log(bufstring);
  });
  //device info
  serialPort.write([0x7E, 0x00, 0xD0, 0x01, 0x01, 0x2D, 0x7E], function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results.toString());
    console.log(results);
  });
  //get single measurement

});
