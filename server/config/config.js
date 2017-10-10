//===========================================================================
// SETUP OF DB TESTING AND PRODUCTION ENVIRONMENT
//===========================================================================
var env = process.env.NODE_ENV || 'development';

// We don't want secret info or api keys in a file on the repository
// So we store those in a config.json file that is gitignored. Then we require
// it and grab the variables.
if (env === 'development' || env === 'test') {
   var config = require('./config.json');
   var envConfig = config[env];      // When you use a variable to access a property you have to use brackets

   // We grab key values for the env (dev or test) then pass those keys and values to process.env
   Object.keys(envConfig).forEach((key) => {
      process.env[key] = envConfig[key];
   });
}
