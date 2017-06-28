const data = {};
const chrome = {
  storage: {
    sync: {
      get: function (...parameters) {
        if (typeof parameters[0] === 'function') {
          parameters[0](data);
        }
        else if (typeof parameters[0] === 'string') {
          const key = parameters[0];
          parameters[1]({key: data[key]});
        }
        else {
          let requestedData = {};
          parameters[0].forEach(key => {
            requestedData[key] = data[key];
          });
          parameters[1](data);
        }
      },
      set: (object, callback) => {
        const keys = Object.keys(object);
        keys.forEach(key => data[key] = object[key]);
        callback();
      },
      remove: (key, calback) => {
        calback();
      },
      clear: (calback) => {
        calback();
      }
    }
  }
};

export default chrome;
