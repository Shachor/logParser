// This file hold all of the functions needed to run the upload, decompression,
// line-reading, etc.

// REQUIRE PACKAGES
const Admzip = require('adm-zip');
const lineReader = require('line-reader');
const fs = require('fs');
const del = require('del');

const {LogEntry} = require('./../models/logEntry');

const sourceDir = './server/uploadFiles/';

//=============================================================================
// FUNCTIONS
//=============================================================================



// UNZIP THE LOG FILES
var decompressLogs = (file) => {
   try {
      // console.log('decompressLogs: ', file);
      // REQUIRE VARIABLES
      const zip = new Admzip(file);     // THIS is correct syntax for PATH/NAME
      var zipEntries = zip.getEntries();

      let files = [];

      // Change the entryName inside the zip header to remove path
      zipEntries.forEach((entry) => {
         str = String.raw`${entry.entryName}`;
         entry.entryName = str.substring(str.lastIndexOf(`\\`) + 1);
         files.push(entry.entryName.toString());
         console.log(entry.entryName.toString());

      });

      // Extract the archive
      let targetDir = `${file.substring(0, file.lastIndexOf('.'))}`;
      zip.extractAllTo(targetDir, true);     // THIS is correct syntax for PATH

      // SHOULD PROBABLY RETURN zipEntries TO GIVE ME FILE LISTENING
      let decompressed = {
         files,
         targetDir
      };

      return decompressed;


   } catch (e) {
      return console.log('ZIP process error', e);
   }

};




// PARSE THE LINES
var parseLog = async (logFile) => {
   var logLine = {};    // Init empty object
   var tempTs;    // Used for adding TS to stack errors to keep it attached in time to original log error

   await lineReader.eachLine(logFile, (line, last, cb) => {
      // REGEX patterns for parsing log lines
      ts = /^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2},\d{3})/g;
      dm = /([\[].*[\]])/g;
      lvl = /(INFO|DEBUG|ERROR|WARN)/g;
      mes = /\s-\s(.*$)/g;
      err = /.*/;

      // This will pull the dir structure and trailing extension off file name
      var logName = `${logFile.substring(logFile.lastIndexOf('/') + 1, logFile.lastIndexOf('.'))}`;

      // If line is stack error, attach previous timestamp. This will group the
      // stack with the error that generated it.
      if (!ts.test(line)) {
         logLine = {
            logName: logName,
            logTimestamp: tempTs || [''],
            processName: [''],
            level: [''],
            message: line.match(err)
         };
      // If not stack error, parse line and store in object
      } else {
         logLine = {
            logName: logName,
            logTimestamp: line.match(ts),
            processName: line.match(dm),
            level: line.match(lvl),
            message: line.match(mes)
         };
      }

      // This allows us to save previous TS for use with stack error
      tempTs = logLine.logTimestamp;


      // Create new Object from model and save to Mongo
      var logEntry = new LogEntry(logLine);
      logEntry.save();

      // console.log(`${logLine.logTimestamp[0]} ${logLine.processName[0]} ${logLine.level[0]} ${logLine.message[0]}`);

      cb();    // Once line is finished, call the next.
   });
};



//=============================================================================
// MAINTENANCE FUNCTIONS
//=============================================================================

// zipFilter FILTERS OUT ALL FILE UPLOADS EXCEPT ZIP
const zipFilter = function(req, file, cb) {
   if (!file.originalName.match(/\.(zip|zi_)$/)) {
      return cb(new Error('Only zip or zi_ files are allowed.'), false);
   }
   cb(null, true);
};


// cleanFolder() CLEARS OUT ALL TEST DATA
const cleanFolder = function(folderPath) {
   del.sync([`${folderPath}*`, `!${folderPath}`, `!${folderPath}.gitkeep`]);
   LogEntry.collection.drop();
};




module.exports = {
   decompressLogs,
   parseLog,
   zipFilter,
   cleanFolder
};
























// var str = String.raw`c:\Log\IDX-SNF1_9_12_12_31_20\servers-TableConverter.log.5`;
//
// var newStr = str.substring(str.lastIndexOf(`\\`) + 1);
// console.log(newStr);


//
// {
//         "entryName" : "c:\Log\IDX-SNF1_9_12_12_31_20\servers-TableConverter.log.5",
//         "name" : "c:\Log\IDX-SNF1_9_12_12_31_20\servers-TableConverter.log.5",
//         "comment" : "",
//         "isDirectory" : false,
//         "header" : {
//                 "made" : 20,
//                 "version" : 20,
//                 "flags" : 0,
//                 "method" : DEFLATED (8),
//                 "time" : 1227645937,
//                 "crc" : 0x560D9D5C,
//                 "compressedSize" : 49403 bytes,
//                 "size" : 1048649 bytes,
//                 "fileNameLength" : 58,
//                 "extraLength" : 0 bytes,
//                 "commentLength" : 0 bytes,
//                 "diskNumStart" : 0,
//                 "inAttr" : 0,
//                 "attr" : 0,
//                 "offset" : 16698025,
//                 "entryHeaderSize" : 104 bytes
// },
//         "compressedData" : <17692256 bytes buffer>
//         "data" : <null>
// }
