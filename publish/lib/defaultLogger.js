var logger = function(event, log){
    switch(event) {
        case 'info':
            break;
        case 'log':
            console.log(log);
            break;
        case 'warn':
            console.warn(log);
            break;
        case 'err':
            console.error(log);
            break;
    }
};

module.exports = logger;