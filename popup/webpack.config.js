const webpack = require('webpack');

module.exports = {
  entry: './popup/index.js',
  output: {
    path: __dirname,
    filename: '../build/popup.js'
  },
  devServer: {
    inline: true,
    port: 3333
  },
  module: { 
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    })
  ],
};
