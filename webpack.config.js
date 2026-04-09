const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    app: ['core-js/stable', 'regenerator-runtime/runtime', './examples/Router/index.js'],
  },
  stats: 'errors-warnings',
  context: __dirname,
  output: {
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  devServer: {
    allowedHosts: 'all',
    host: 'localhost',
    hot: true,
    port: process.env.PORT || 5050,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: true,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ],
};
