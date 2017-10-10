const mongoose = require('mongoose');


var LogEntry = mongoose.model('LogEntry', {
   logName: {
      type: String,
      required: true
   },
   logTimestamp: {
      type: String
   },
   processName: {
      type: String
   },
   level: {
      type: String
   },
   message: {
      type: String
   }
});


module.exports = {LogEntry};
