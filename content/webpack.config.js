const webpack = require('webpack');

module.exports = {
  entry: './content/script.js',
  output: {
    path: __dirname,
    filename: '../build/content.js'
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
