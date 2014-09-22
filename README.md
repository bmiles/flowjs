flowjs
======

Node JS interface for the Sensirion SLI-1000 liquid flow meter

How to use:

```javascript
var flow = require('./flowjs');

// Initalize a new SLI1000 specifying the device name and address
var sli1000 = new flow.SLI1000('sli1000',0);
```

SLI1000 Class Methods
=====================

### startSingleMeasurement()
Initialises measurement on the device, and makes a reply.
Reply contains no data.

### getSingleMeasurement()
Retrieves the single measurement from the SLI1000.
Returns a ```Number``` which is the flow rate in uL/min (microlitres per minute)
