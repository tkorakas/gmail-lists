const webstore_upload = require('./lib/webstore_upload');
const uploadOptions = require('./webstore_credentials');

webstore_upload(uploadOptions)
  .then(function (result) {
    console.log(result);
    // do somethings nice
    return 'yay';
  })
  .catch(function (err) {
    console.error(err);
  });
