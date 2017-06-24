var Q = require('q'),
    https = require('https'),
    path = require('path'),
    url = require('url'),
    fs = require('fs'),
    http = require('http'),
    util = require('util'),
    open = require('open'),
    _ = require('lodash'),
    glob = require('glob'),
    rp = require('request-promise'),
    request = require('request');

module.exports = function webstore_upload(uploadOptions, loggerFn) {
    var logger;
    var errs = {
        token: {
            failedRefresh: 'WU_FAILED_TO_REFRESH_TOKEN',
            failedGet: 'WU_FAILED_TO_GET_ACCOUNT_TOKEN',
            failedRequest: 'WU_FAILED_TO_REQUEST_TOKEN'
        },
        upload: {
            failed: 'WU_FAILED_TO_UPLOAD_EXTENSION'
        },
        publish: {
            failed: 'WU_FAILED_TO_PUBLISH_EXTENSION'
        }
    };

    if (!loggerFn || loggerFn === 'quiet') {
        logger = require('./quietLogger.js');
        logger('info', 'Loading quiet logger');
    } else if (loggerFn === 'default') {
        logger = require('./defaultLogger.js');
        logger('info', 'Loading default logger');
    } else if (typeof loggerFn === 'function') {
        logger = loggerFn;
        logger('info', 'Logger function was taken from arguments');
    } else if (typeof loggerFn !== 'function') {
        //logger('error', 'logger must be a function, "default" or "quiet"');
        throw new Error('Logger must be a function, "default" or "quiet"');
    }

    var extensions = uploadOptions.extensions;
    var accounts = uploadOptions.accounts;
    var tasks = uploadOptions.uploadExtensions || [];
    var extensionsToUpload = tasks.length ? _.pick(extensions, tasks) : extensions;

    //calculate tasks for accounts that we want to use
    var accountsTasksToUse = _.uniq( _.map( extensionsToUpload, function (extension) {
        var name = (extension.account || 'default');
        var tokenFn = (accounts[name].refresh_token !== undefined) ? refresh_account_token : get_account_token;
        return tokenFn(name);
    }) );

    logger('log', 'Refreshing tokens for all accounts');

    return Q.all(accountsTasksToUse)
        .then(function(values){
            var promises = [];

            for (var extension in extensionsToUpload) {
                promises.push(uploadExtension(extension));
            }

            logger('log', 'Uploading all extensions');
            return Q.all(promises);
        })
        .then(function (result) {
            return result;
        })
        .catch(function (err) {
            logger('err', err);
            return Q.reject(err);
        });

    // Get token for account
    function get_account_token(accountName){
        //prepare account for inner function
        var account = accounts[ accountName ];
        account['name'] = accountName;
        var getTokenFn = account['cli_auth'] ? getTokenForAccountCli : getTokenForAccount;

        logger('log', 'Getting token for account ' + accountName);
        return getTokenFn(account)
            .then(function (token) {
                //set token for provided account
                logger('info', 'New token for account ' + accountName + ': ' + token);
                accounts[accountName].token = token;
                return token;
            })
            .catch(function (err) {
                var responseError = {name: accountName, nameType: 'account', appError: errs.token.failedGet, more: {error: error}};
                logger('err', 'Failed to get new token for account: ' + JSON.stringify(responseError));
                return Q.reject(err);
            });
    }

    // Refresh token for account
    function refresh_account_token(accountName){
        //prepare account for inner function
        var account = accounts[ accountName ];
        account['name'] = accountName;

        logger('log', 'Refreshing access token for account ' + accountName);
        var post_data = util.format('client_id=%s' +
            '&client_secret=%s' +
            '&refresh_token=%s' +
            '&grant_type=refresh_token',
            account.client_id,
            account.client_secret,
            account.refresh_token);

        return rp({
                uri : 'https://accounts.google.com/o/oauth2/token',
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/x-www-form-urlencoded'
                },
                body : post_data,
                json : true
            })
            .then(function (body) {
                logger('log', 'Refreshed access token for account ' + accountName);
                accounts[accountName].token = body.access_token;
                return Q(body.access_token);
            })
            .catch(function (err) {
                var responseError = {name: accountName, nameType: 'account', appError: errs.token.failedRefresh, more: {statusCode: err.statusCode, error: err.error}};
                logger('err', 'Failed to refresh token for account ' + accountName + '\n' + JSON.stringify(responseError));
                return Q.reject(JSON.stringify(responseError));
            });
    }

    // uploading with token
    function uploadExtension(extensionName){
        var promises = [];
        var uploadExtensions = {};

        if (extensionName) {
            uploadExtensions[extensionName] = extensions[extensionName];
        } else {
            uploadExtensions = extensionsToUpload;
        }

        _.map(uploadExtensions, function (extension, extensionName) {
            var uploadConfig = Object.create(extension);
            var accountName = extension.account || 'default';

            uploadConfig['name'] = extensionName;
            uploadConfig['account'] = accounts[accountName];
            var p = handleUpload(uploadConfig);
            promises.push(p);
        });

        logger('log', 'Starting extensions upload');
        return Q.allSettled(promises).then(function (results) {
            var isError = false;
            var values = [];
            results.forEach(function (result) {
                if (result.state === 'fulfilled') {
                    values.push( result.value );
                } else {
                    isError = result.reason;
                }
            });

            if ( !isError ) {
                return values.length === 1 ? values[0] : values;
                //return values;
            } else {
                var responseError = {name: extensionName, nameType: 'extension', appError: errs.upload.failed, more: {error: JSON.parse(isError)}};
                logger('err', '================\n');
                logger('err', 'Error while uploading: ', JSON.stringify(responseError), '\n');
                return Q.reject(JSON.stringify(responseError));
            }
        });
    }

    //upload zip
    function handleUpload(options){
        var filePath, zip;
        var doPublish = false;
        if( typeof options.publish !== 'undefined' ){
            doPublish =  options.publish;
        }else if( typeof options.account.publish !== 'undefined' ){
            doPublish = options.account.publish;
        }
        //updating existing
        logger('log', '================');
        logger('log', ' ');
        logger('log', 'Updating app ('+ options.name +'): ', options.appID);
        logger('log', ' ');

        zip = options.zip;
        if( fs.statSync( zip ).isDirectory() ){
            zip = getRecentFile( zip );
        }
        filePath = path.resolve(zip);

        return Q.Promise(function(resolve, reject) {
            logger('log', 'Sending the upload request to google api');
            fs.createReadStream(filePath).pipe(request.put({
                    uri : 'https://www.googleapis.com/upload/chromewebstore/v1.1/items/' + options.appID,
                    headers : {
                        'Authorization' : 'Bearer ' + options.account.token,
                        'x-goog-api-version' : '2'
                    },
                    json : true
                }))
                .on('response', function(response) {
                    response.on('data', function(data) {
                        var dataString = data.toString('utf8');
                        var dataJson = JSON.parse(dataString);

                        if (dataJson.uploadState !== 'SUCCESS') {
                            return reject(dataString);
                        }

                        logger('log', '\nUploading done (' + options.name + ')', '\n');

                        var responseJson = {};
                        responseJson[options.name] = {
                            fileName        : zip,
                            extensionName   : options.name,
                            extensionId     : options.appID,
                            published       : doPublish
                        };

                        if (doPublish) {
                            return publishItem(options)
                                .then(function (result) {
                                    return resolve(responseJson);
                                })
                                .catch(function (err) {
                                    return reject(err);
                                });
                        } else {
                            return resolve(responseJson);
                        }
                    });

                    response.on('error', function(err) {
                        logger('err', err);
                        return reject(err);
                    });
                })
                .on('error', function(err) {
                    logger('err', err);
                    return reject(err);
                });
        });
    }

    //make item published
    function publishItem(options){
        return Q.Promise(function(resolve, reject) {
            logger('log', 'Publishing ('+ options.name +') ' + options.appID + '..');
            var url = util.format('/chromewebstore/v1.1/items/%s/publish%s', options.appID,
                options.publishTarget ? '?publishTarget=' + options.publishTarget : '');

            var responseError = {name: options.name, nameType: 'extension', appError: errs.publish.failed, more: {}};

            request.post({
                    uri : 'https://www.googleapis.com' + url,
                    headers : {
                        'Authorization' : 'Bearer ' + options.account.token,
                        'x-goog-api-version' : '2',
                        'Content-Length' : '0'
                    },
                    json : true
                })
                .on('response', function (response) {
                    var returnResult;
                    var isError = false;

                    response.on('data', function(data) {
                        var dataString = data.toString('utf8');
                        var dataJson = JSON.parse(dataString);

                        if (dataJson.error) {
                            isError = true;
                            returnResult = dataJson.error;
                        }
                    });

                    response.on('error', function(err) {
                        responseError.more = err;
                        logger('err', responseError);
                        return reject(responseError);
                    });

                    response.on('end', function() {
                        if (isError) {
                            responseError.more = returnResult;
                            logger('err', 'Error while publishing: ' + JSON.stringify(responseError));
                            return reject(responseError);
                        } else {
                            logger('log', 'Publishing done ('+ options.name +')');
                            return resolve('Publishing done ('+ options.name +')');
                        }
                    });
                })
                .on('error', function (err) {
                    responseError.more = err;
                    logger('err', 'Error while publishing: ' + JSON.stringify(responseError));
                    return reject(responseError);
                });
        });
    }

    //return most recent changed file in directory
    function getRecentFile( dirName ){
        var files = glob.sync( dirName + '/*.zip', { nodir: true}),
            mostRecentFile,
            currentFile;

        if( files.length ){
            for( var i = 0; i < files.length; i++ ){
                currentFile = files[i];
                if( !mostRecentFile ){
                    mostRecentFile = currentFile;
                }else{
                    if( fs.statSync( currentFile ).mtime > fs.statSync( mostRecentFile ).mtime ){
                        mostRecentFile = currentFile;
                    }
                }
            }
            return mostRecentFile;
        }else{
            return false;
        }
    }

    // Request access token from code
    function requestToken( account, redirectUri, code ){
        logger('info', 'code for account ' + account.name + ': ' + code);
        var post_data = util.format('client_id=%s&client_secret=%s&code=%s&grant_type=authorization_code&redirect_uri=%s', account.client_id, account.client_secret, code, redirectUri);

        return rp({
                uri : 'https://accounts.google.com/o/oauth2/token',
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/x-www-form-urlencoded'
                },
                body : post_data,
                json : true
            })
            .then(function (body) {
                return Q(body.access_token);
            })
            .catch(function (err) {
                logger('err', 'Failed to refresh token: ' + errs.token.failedRequest);
                return Q.reject(errs.token.failedRequest);
            });
    }

    // get OAuth token using ssh-friendly cli
    function getTokenForAccountCli( account ){
        return Q.Promise(function(resolve, reject) {
            var redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
            var codeUrl = util.format('https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=%s&redirect_uri=%s', account.client_id, redirectUri);
            var readline = require('readline');

            var rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question(util.format('Please open %s and enter code: ', codeUrl), function(code) {
                rl.close();
                return resolve(requestToken(account, redirectUri, code ));
            });
        });
    }

    //get OAuth token
    function getTokenForAccount( account ){
        return Q.Promise(function(resolve, reject) {
            var port = 14809,
                callbackURL = util.format('http://localhost:%s', port),
                server = http.createServer(),
                codeUrl = util.format('https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=%s&redirect_uri=%s', account.client_id, callbackURL);

            logger('log', ' ');
            logger('log', 'Authorization for account: ' + account.name);
            logger('log', '================');

            //due user interaction is required, we creating server to catch response and opening browser to ask user privileges
            server.on('connection', function(socket) {
                //reset Keep-Alive connections in order to quick close server
                socket.setTimeout(1000);
            });
            server.on('request', function(req, res){
                var code = url.parse(req.url, true).query['code'];  //user browse back, so code in url string
                if( code ){
                    res.end('Got it! Authorizations for account "' + account.name + '" done. Check your console for new details. Tab now can be closed.');
                    server.close(function () {
                        return resolve(requestToken(account, callbackURL, code ));
                    });
                }else{
                    res.end('<a href="' + codeUrl + '">Please click here and allow access for account "' + account.name + '", to continue uploading..</a>');
                }
            });
            server.listen( port, 'localhost' );

            logger('log', ' ');
            logger('log', 'Opening browser for authorization.. Please confirm privileges to continue..');
            logger('log', ' ');
            logger('log', util.format('If the browser didn\'t open within a minute, please visit %s manually to continue', callbackURL));
            logger('log', ' ');

            open(codeUrl);
        });
    }
};