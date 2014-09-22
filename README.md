flowjs
======

Node JS interface for the Sensirion SLI-1000 liquid flow meter


SLI1000 Class Methods
=====================

### startSingleMeasurement()
Initialises measurement on the device, and makes a reply.
Reply contains no data.

### getSingleMeasurement()
Retrieves the single measurement from the SLI1000.
Returns a ```Number``` which is the flow rate in uL/min (microlitres per minute)
