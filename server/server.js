// DESC: Web interface that allows importing, parsing, and collation of LS logfiles


// REQUIRE PACKAGES
const express = require('express');
const fileUpload = require('express-fileupload');
const mongo = require('mongodb');
const fs = require('fs');


// REQUIRE MODELS


// REQUIRE METHODS
const {decompressLogs, parseLog, fileList} = require('./utils/util');


// SETUP DB
require('./config/config');
const {mongoose} = require('./config/mongoose');


// SETUP APP
const app = express();
const path = require('path');
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));
app.use(fileUpload());


// SETUP ENVIRONMENT VARIABLES
const port = process.env.PORT;
const sourceDir = './server/uploadFiles/';





// APP ROUTES
app.get('/', (req, res) => {
   res.render('index');
});


app.post('/upload', (req, res) => {
   // Handle if no file uploaded
   if (!req.files) {
      return res.status(400).send('No files uploaded.');
   }

   zip = /zip|zi_/;
   if (zip.test(req.files.name)) {
      return res.status(400).send('File must be a compressed zip with extension .zip or .zi_');
   }

   let zipFile = req.files.uploadFile;

   // Put file in uploadFiles dir
   zipFile.mv(`./server/uploadFiles/${zipFile.name}`, (err) => {
      if (err) {
         return res.status(500).send(err);
      }
      // Decompress the zipFile into a dir with zipFilename
      var dirName = `${zipFile.name.substring(0, zipFile.name.lastIndexOf('.'))}`;
      console.log('DIRNAME: ' + dirName);
      console.log('FILENAME: ' + zipFile.name);

      // Unzip the logs into a directory based on zip file name
      decompressLogs(`${sourceDir}${zipFile.name}`, `${sourceDir}${dirName}`);

      // Get a list of all the names of files and stick in files[]
      files = fileList(`${sourceDir}${dirName}`);

      // Pull out each line from each file, parse it, and create a document in Mongo
      files.forEach(file => {
         lf = /.log/;
         if (lf.test(file)) {
            parseLog(`${sourceDir}${dirName}/${file}`);
         }
      });



      res.send('File Uploaded!');
   });


});








// SETUP LISTENING SERVER
app.listen(port, () => {
   console.log(`Server is up on port ${port}`);
});
