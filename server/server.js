// DESC: Web interface that allows importing, parsing, and collation of LS logfiles


// REQUIRE PACKAGES
const express = require('express');
const multer = require('multer');   // FILE UPLOADS
const mongo = require('mongodb');
const handlebars = require('handlebars');    //TEMPLATE
const hbs = require('hbs');   // TEMPLATE VIEW ENGINE
const del = require('del');   // DELETE TEST DATA
const fs = require('fs');     // ACCESS TO FILESYSTEM


// REQUIRE MODELS


// REQUIRE METHODS
const {decompressLogs, parseLog, zipFilter, cleanFolder} = require('./utils/util');


// SETUP DB
require('./config/config');
const {mongoose} = require('./config/mongoose');


// SETUP APP
const app = express();
const path = require('path');
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');

// MULTER SETTINGS
var storage = multer.diskStorage({
   destination: './server/uploadFiles/',
   filename: (req, file, cb) => {
      cb(null, file.originalname);
   }
});
var upload = multer({storage: storage
                     // , fileFilter: zipFilter
                  });



// SETUP ENVIRONMENT VARIABLES
const port = process.env.PORT;
const sourceDir = './server/uploadFiles/';



// CLEAN EVERYTHING BEFORE RUNNING - TESTING
cleanFolder(sourceDir);



// APP ROUTES
app.get('/', (req, res) => {
   res.render('index');
});


app.post('/upload', upload.single('upload'), async (req, res) => {
   try {
      // console.log('BODY: ', req.body);
      // console.log('FILE: ', req.file);
      let file = req.file.filename;

      let decomp = await decompressLogs(sourceDir + file);

      console.log(decomp.files);

      decomp.files.forEach((file) => {
         logfile = /.log/;
         if (logfile.test(file)) {
            parseLog(decomp.targetDir + '/' + file);
         }
      });

      res.render('upload');
   } catch (e) {
      res.status(400).send('Something went wrong. ', e);
   }



});



// USING EXPRESS_FILEUPLOAD

   // Handle if no file uploaded
   // if (!req.files) {
   //    return res.status(400).send('No files uploaded.');
   // }
   //
   // zip = /zip|zi_/;
   // if (zip.test(req.files.name)) {
   //    return res.status(400).send('File must be a compressed zip with extension .zip or .zi_');
   // }
   //
   // let zipFile = req.files.uploadFile;

//    // Put file in uploadFiles dir
//    zipFile.mv(`./server/uploadFiles/${zipFile.name}`, (err) => {
//       if (err) {
//          return res.status(500).send(err);
//       }
//
//       // Decompress the zipFile into a dir with zipFilename
//       var dirName = `${zipFile.name.substring(0, zipFile.name.lastIndexOf('.'))}`;
//       console.log('DIRNAME: ' + dirName);
//       console.log('FILENAME: ' + zipFile.name);
//
//       // Unzip the logs into a directory based on zip file name
//       files = decompressLogs(`${sourceDir}${zipFile.name}`, `${sourceDir}${dirName}`);
//
//       // Get a list of all the names of files and stick in files[]
//       // files = fileList(`${sourceDir}${dirName}`);
//
//       // Pull out each line from each file, parse it, and create a document in Mongo
//       files.forEach(file => {
//          logfile = /.log/;
//          if (logfile.test(file)) {
//             parseLog(`${sourceDir}${dirName}/${file}`);
//          }
//       });
//
//
//
//       res.send('File Uploaded!');
//
//    });
//
// });









// SETUP LISTENING SERVER
app.listen(port, () => {
   console.log(`Server is up on port ${port}`);
});
