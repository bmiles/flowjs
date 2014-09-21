'use strict';
var serialport = require('serialport');
var SerialPort = require('serialport').SerialPort;
var ld = require('lodash');
//var serialPort = new SerialPort('/dev/tty.usbserial-A501DRCS', {
//  baudrate: 115200,
//  parser: serialport.parsers.raw
//});


// Reads the content of the cleaned byte array and outputs a object
// containing the Flow meter address, which command was used to get the response
// the state, usually an error code, the number of data containing bytes, and
// finally the data itself.

var readContent = function(buf) {
  var buf = buf.slice(1,buf.length - 1);
  var bufferJSON = {
    'devAddress' : buf.readUInt8(0),
    'command' : buf.readUInt8(1),
    'state' : buf.readUInt8(2),
    'chksum' : buf.readUInt8(buf.length),
    'dataLength' : buf.readUInt8(3),
    'dataContent' : buf.slice(4,buf.length - 1)
  };
  return bufferJSON;
};

// the read data function acceps the dataContent buffer from the readcontent function.
var readData = function(dataBuf) {
  var scaleFactor = 13;
  var sensorOutput = (dataBuf.readUInt8(0) << 8) + dataBuf.readUInt8(1);
  // measurementDataType refers to if the sensor output is signed or unsigned.
  if (measurementDataType === 0) {
    // had to add in this l variable as doing the this in the if statement didn't work.
    var l = sensorOutput & 32768;
    if (l === 32768) {
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

// calculates the chksum for the byte array without stop and start
// returns an array with the chksum pushed to the end.
var addChkSum = function(bArr) {
  var byteSum = ld.reduce(bArr, function(sum, num) {
    return sum + num;
  });
  var chkSum = (byteSum & 0xFF) ^ 0xFF;
  bArr.push(chkSum);
  return bArr;
};

var addStartStop = function (bArr) {
  bArr.push(0x7e);
  bArr.unshift(0x7e);
  return bArr;
};

// var stuffIt = function(bArr) {
//   // reg ex for 0x7e
//   // stuff bytes to replace it
//   // ret corrected bArr
// };

function SLI1000(name, address) {
  this.name = name;
  this.address = address;
  this.latestMeasurement = 0;
  this.serialPort = new SerialPort('/dev/tty.usbserial-A501DRCS', {
    baudrate: 115200,
    parser: serialport.parsers.raw
  }, function(err) {
      if (err) {console.log(err);}
  });
}

SLI1000.prototype.getSensorStatus = function() {
  var command = 0x30;
  var address = this.address;
  var byteArr = [address, command];
  addChkSum(byteArr);
  addStartStop(byteArr);

  this.serialPort.on('open', function () {
    console.log('open');
    this.serialPort.on('data', function(data) {
      console.log('data received: ' + data);
      console.log(typeof(data));
      console.log('got %d bytes of data', data.length);
      console.log(data);
      var bufstring = data.slice().toString();
      console.log(bufstring);
    });
    //device info
    this.serialPort.write(byteArr, function(err, results) {
      console.log('err ' + err);
      console.log('results ' + results.toString());
      console.log(results);
    });
  });
};

SLI1000.prototype.startSingleMeasurement = function() {
  var command = 0x31;
  var address = this.address;
  var byteArr = [address, command];
  addChkSum(byteArr);
  addStartStop(byteArr);
  // Port open
  this.serialPort.on('open', function () {
    console.log('open');
    this.serialPort.on('data', function(err,data) {
      if (!err) {
        var content = readContent(data);
        if (content.state === 0x00) {
          return readData(content.dataContent);
        } else {
          return err;
        }
      } else {
        console.log(err);
        }
    });
    // Dispatch and read or err
    this.serialPort.write(byteArr, function(err, results) {
      if (!err) {
        var content = readContent(results);
        if (content.state === 0x00) {
          return readData(content.dataContent);
        } else {
          return err;
        }
      } else {
        console.log(err);
        }
      });
  });
};

SLI1000.prototype.getSingleMeasurement = function() {
  var command = 0x32;
  var address = this.address;
  var byteArr = [address, command];
  addChkSum(byteArr);
  addStartStop(byteArr);
  //dispatch;
};


module.exports.SLI1000 = SLI1000;


//
// serialPort.on('open', function () {
//   console.log('open');
//   serialPort.on('data', function(data) {
//     console.log('data received: ' + data);
//     console.log(typeof(data));
//     console.log('got %d bytes of data', data.length);
//     console.log(data);
//     var bufstring = data.slice().toString();
//     console.log(bufstring);
//   });
//   //device info
//   serialPort.write([0x7E, 0x00, 0xD0, 0x01, 0x01, 0x2D, 0x7E], function(err, results) {
//     console.log('err ' + err);
//     console.log('results ' + results.toString());
//     console.log(results);
//   });
//   //get single measurement
//
// });
