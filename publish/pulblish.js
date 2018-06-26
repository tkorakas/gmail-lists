const webstore_upload = require('webstore-upload');
const uploadOptions = require('./webstore_credentials');

webstore_upload(uploadOptions, console.log)
  .then(function (result) {
    console.log(result);
    return 'yay';
  })
  .catch(function (err) {
    console.error(err);
  });
