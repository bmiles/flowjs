'use strict';
var serialport = require('serialport');
var SerialPort = require('serialport').SerialPort;
var ld = require('lodash');

// Reads the content of the cleaned byte array and outputs a object
// containing the Flow meter address, which command was used to get the response
// the state, usually an error code, the number of data containing bytes, and
// finally the data itself.

// Shared utility methods/////////////////////

var readResponse = function(buf) {
  //console.log(buf.toString());
  if (buf.toString().match(/~.*~/g)) {
    //console.log(buf);
    var bufferJSON = {
      'devAddress' : buf.readUInt8(1),
      'command' : buf.readUInt8(2),
      'state' : buf.readUInt8(3),
      'chksum' : buf.readUInt8(buf.length -2),
      'dataLength' : buf.readUInt8(4),
      // responseData assignment depends on length.
    };
    // DEBUG console.log(buf);
    if (bufferJSON.dataLength > 0) {
      bufferJSON.responseData = buf.slice(5,buf.length - 2);
    } else {
      bufferJSON.responseData = undefined;
    }
    return bufferJSON;
  } else {
    console.log('serial read failed');
    return undefined; }
};

// the read data function acceps the responseData buffer from the readResponse function.
var readData = function(dataBuf) {
  if (dataBuf === undefined) {
    console.log('no data');
    return undefined;
  } else {
    var scaleFactor = 13;
    var sensorOutput = (dataBuf.readUInt8(0) << 8) + dataBuf.readUInt8(1);
    // measurementDataType refers to if the sensor output is signed or unsigned.
    if (0 === 0) {
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
    console.log(physicalFlow + ' uL/min');
    return physicalFlow;
  };
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

// Error State Handling
var errorHandler = function (state) {
  switch(state) {
    case 0x00:
        return console.log('No Error');
    case 0x01:
        return console.log('RS485 Error: Wrong Data Size');
    case 0x02:
        return console.log('RS485 Error: Unknown command');
    case 0x03:
        return console.log('RS485 Error: No access rights for command');
    case 0x04:
        return console.log('RS485 Error: Invalid parameter');
    case 0x20:
        return console.log('Sensor Error: Sensor Busy');
    case 0x21:
        return console.log('Sensor Error: No Ack from Sensor');
    case 0x22:
        return console.log('Sensor Error: I2C CRC false');
    case 0x23:
        return console.log('Sensor Error: Sensor timeout');
    case 0x24:
        return console.log('Sensor Error: No measurement started');
    default:
        return console.log('No Error');
  }
};

// Place holder for byte stuffing
// var stuffIt = function(bArr) {
//   // reg ex for 0x7e
//   // stuff bytes to replace it
//   // ret corrected bArr
// };

// Main class for SLI1000 flow meter.

function SLI1000(name, address, port) {
  this.name = name;
  this.address = address || 0;
  this.serialPort = new SerialPort(port, {
    baudrate: 115200,
    parser: serialport.parsers.raw
  }, function(err) {
      if (err) {console.log(err);}
  });
}

SLI1000.prototype.startSingleMeasurement = function(callback) {
  var device = this;
  var command = 0x31;
  var address = device.address;
  var byteArr = [address, command, 0x00];
  addChkSum(byteArr);
  addStartStop(byteArr);
  // Port open
  device.serialPort.on('open', function () {
    console.log('open');
    device.serialPort.on('data', function(data) {
      var content = readResponse(data);
      console.log(content);
      if (content.state === 0x00) {
        console.log('Single measurement started...');
        //return callback;
      } else {
        return console.log(errorHandler(content.state));
      }
    });
    // Dispatch and read or err
    device.serialPort.write(byteArr, function(err, results) {
      if (!err) {
        device.serialPort.drain(function(error) {
          return console.log('Sent: ' + byteArr);
        });
      } else {
        return console.log(err);
        }
      });
 });
};

// Constrcut byte array
// Open Port
// start measurement
// on receive from device send get command as callback.
SLI1000.prototype.getSingleMeasurement = function() {
  var device = this;
  var command = 0x32;
  var address = device.address;
  var byteArr = [address, command, 0x00];
  addChkSum(byteArr);
  addStartStop(byteArr);
  // Port open
  device.serialPort.on('open', function () {
    console.log('open');
    device.serialPort.on('data', function(data) {
      var content = readResponse(data);
      console.log(content);
      if (content.state === 0x00) {
        //device.serialPort.close;
        return readData(content.responseData);
      } else {
        return console.log(errorHandler(content.state));
      }
    });
    //Dispatch and read or err
    device.serialPort.write(byteArr, function(err, results) {
      if (!err) {
        device.serialPort.drain(function(error) {
          return console.log('Sent: ' + byteArr);
        });
      } else {
        return console.log(err);
        }
      });
  });
};

SLI1000.prototype.simpleGet = function(callback) {
  var device = this;
  device.serialPort.on('open', function () {
  console.log('Serial Port Open');
  device.serialPort.flush(function(error) {
    device.serialPort.on('data', function(data) {
      console.log(data);
      var content = readResponse(data);
      console.log(content);
      if (content.state === 0x00) {
        if (content.command === 0x32) {
          device.serialPort.close();
          console.log('Port Closed');
          return callback(readData(content.responseData));
        } else {
            // Single measurement started, so send get request.
            setTimeout(function(){
              console.log('Measurement Started..');
              var command = 0x32;
              var address = device.address;
              var byteArr = [address, command, 0x00];
              addChkSum(byteArr);
              addStartStop(byteArr);

              device.serialPort.write(byteArr, function(err, results) {
                if (!err) {
                  device.serialPort.drain(function(error) {
                    return console.log('Sent: ' + byteArr);
                  });
                } else {
                  return console.log(err);
                  }
                });
                // 100ms delay to allow the flow meter to respond.
            }, 100);
          }
      } else {
        callback(new Error(errorHandler(content.state)));
      }
    });
  });
  // Now port is open send measurement start command.
  var command = 0x31;
  var address = device.address;
  var byteArr = [address, command, 0x00];
  addChkSum(byteArr);
  addStartStop(byteArr);

  device.serialPort.write(byteArr, function(err, results) {
    if (!err) {
      device.serialPort.drain(function(error) {
        console.log('Sent: ' + byteArr);
        return results;
      });
    } else {
      console.log(err)
      return err;
      }
    });
  });
};


// SLI1000.prototype.getSensorStatus = function() {
//   var device = this;
//   var command = 0x30;
//   var address = this.address;
//   var byteArr = [address, command];
//   addChkSum(byteArr);
//   addStartStop(byteArr);
//
//   device.serialPort.on('open', function () {
//     console.log('open');
//     device.this.serialPort.on('data', function(data) {
//       console.log('data received: ' + data);
//       console.log(typeof(data));
//       console.log('got %d bytes of data', data.length);
//       console.log(data);
//       var bufstring = data.slice().toString();
//       console.log(bufstring);
//     });
//     //device info
//     device.serialPort.write(byteArr, function(err, results) {
//       console.log('err ' + err);
//       console.log('results ' + results.toString());
//       console.log(results);
//       device.serialPort.drain(function(error) {return;});
//     });
//   });
// };



module.exports.SLI1000 = SLI1000;
