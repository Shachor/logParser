// DESC: Web interface that allows importing, parsing, and collation of LS logfiles


// REQUIRE PACKAGES
const express = require('express');
const fileUpload = require('express-fileupload');


// REQUIRE MODELS


// REQUIRE METHODS
const {decompressLogs, parseLog} = require('./utils/util');



// SETUP APP
const app = express();
const path = require('path');
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));
app.use(fileUpload());


// SETUP ENVIRONMENT VARIABLES
const port = process.env.PORT || 3000;
const sourceDir = './server/uploadFiles';


// APP ROUTES
app.get('/', (req, res) => {
   res.render('index');
});


app.post('/upload', (req, res) => {
   // Handle if no file uploaded
   if (!req.files) {
      return res.status(400).send('No files uploaded.');
   }

   let file = req.files.uploadFile;

   // Put file in uploadFiles dir
   file.mv(`./server/uploadFiles/${file.name}`, (err) => {
      if (err) {
         return res.status(500).send(err);
      }
      // Decompress the file into a dir with filename
      var dirName = `${file.name.substring(0, file.name.lastIndexOf('.'))}`;
      console.log('DIRNAME: ' + dirName);
      console.log('FILENAME: ' + file.name);


      decompressLogs(`${sourceDir}/${file.name}`, `${sourceDir}/${dirName}`);
      parseLog(`${sourceDir}/${dirName}/logfile.txt`);


      res.send('File Uploaded!');
   });


});








// SETUP LISTENING SERVER
app.listen(port, () => {
   console.log(`Server is up on port ${port}`);
});
