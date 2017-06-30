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
      remove: (key, calback) => {
        if (typeof data[key] !== 'undefined') {
          delete  data[key];
          calback();
        }
        throw new Error;
      },
      clear: () => {
        data = {};
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
    create: () => {},
  }
};

export default chrome;
