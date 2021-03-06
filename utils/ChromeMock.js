let data = {};
const chrome = {
  storage: {
    sync: {
      get: function (...parameters) {
        if (typeof parameters[0] === 'function') {
          parameters[0](data);
        }
        else if (typeof parameters[0] === 'string') {
          const object = {};
          if (typeof data[parameters[0]] !== 'undefined') {
            object[parameters[0]] = data[parameters[0]];
          }
          parameters[1](object);
        }
        else {
          let requestedData = {};
          parameters[0].forEach(key => {
            if (typeof data[key] !== 'undefined') {
              requestedData[key] = data[key];
            }
          });
          parameters[1](requestedData);
        }
      },
      set: (...parameters) => {
        const keys = Object.keys(parameters[0]);
        keys.forEach(key => data[key] = parameters[0][key]);
        if (parameters.length > 1) {
          parameters[1]();
        }
      },
      remove: (...parameters) => {
        if (typeof parameters[0] === 'string') {
          if (typeof data[parameters[0]] !== 'undefined') {
            delete  data[parameters[0]];
          }
        }
        else {
          parameters[0].forEach((key) => {
            if (typeof data[key] !== 'undefined') {
              delete  data[key];
            }
          });
        }

        // Run callback function if exists.
        if (parameters.length > 1) {
          parameters[1]();
        }
      },
      clear: (callback = null) => {
        data = {};
        if (callback !== null) {
          callback();
        }
      }
    }
  },
  runtime: {
    onMessage: {
      addListener: () => {
      }
    }
  },
  alarms: {
    create: () => {
    },
  }
};

export default chrome;
