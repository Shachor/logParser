// This file hold all of the functions needed to run the upload, decompression,
// line-reading, etc.

// REQUIRE PACKAGES
const Admzip = require('adm-zip');
const lineReader = require('line-reader');


//=============================================================================
// FUNCTIONS
//=============================================================================

// UNZIP THE LOG FILES
var decompressLogs = (file, targetDir) => {
   try {
      // REQUIRE VARIABLES
      const zip = new Admzip(file);     // THIS is correct syntax for PATH/NAME
      var zipEntries = zip.getEntries();

      // Change the entryName inside the zip header to remove path
      zipEntries.forEach((entry) => {
         str = String.raw`${entry.entryName}`;
         entry.entryName = str.substring(str.lastIndexOf(`\\`) + 1);
         console.log(entry.entryName.toString());
      });

      // Extract the archive
      zip.extractAllTo(targetDir, true);     // THIS is correct syntax for PATH
   } catch (e) {
      return console.log('ZIP process error', e);
   }

};

// decompressLogs(`./server/utils/test.zip`, './temp');


// PARSE THE LINES
var parseLog = (logFile) => {
   var logLine = {};
   var tempTs;

   lineReader.eachLine(logFile, (line, last, cb) => {
      ts = /^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2},\d{3})/g;
      dm = /([\[].*[\]])/g;
      lvl = /(INFO|DEBUG|ERROR|WARN)/g;
      mes = /\s-\s(.*$)/g;
      err = /.*/;

      if (!ts.test(line)) {
         logLine = {
            timestamp: tempTs || [''],
            daemon: [''],
            level: [''],
            message: line.match(err)
         };
      } else {
         logLine = {
            timestamp: line.match(ts),
            daemon: line.match(dm),
            level: line.match(lvl),
            message: line.match(mes)
         };
      }

      tempTs = logLine.timestamp;

      console.log(`${logLine.timestamp[0]} ${logLine.daemon[0]} ${logLine.level[0]} ${logLine.message[0]}`);

      cb();
   });
};


module.exports = {
   decompressLogs,
   parseLog
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
