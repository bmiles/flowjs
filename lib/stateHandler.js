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

module.exports.stateHandler = errorHandler;
