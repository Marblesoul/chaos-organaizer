const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDev = process.env.NODE_ENV !== 'production';
const BACKEND_HTTP = process.env.BACKEND_URL || 'http://localhost:7070';
const BACKEND_WS = BACKEND_HTTP.replace(/^http/, 'ws');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: isDev ? '/' : '/chaos-organaizer/',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|jpg|gif|svg|ico)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    // Inject BACKEND_URL into client bundle so api/ws.js and api/http.js can use it
    new webpack.DefinePlugin({
      'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL || ''),
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.svg',
    }),
    ...(isDev ? [] : [new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' })]),
  ],
  devServer: {
    port: 8080,
    hot: true,
    historyApiFallback: true,
    // Move HMR socket away from /ws so it doesn't conflict with our backend WS
    client: {
      webSocketURL: { pathname: '/webpack-hmr' },
    },
    webSocketServer: {
      options: { path: '/webpack-hmr' },
    },
    proxy: [
      {
        context: ['/api'],
        target: BACKEND_HTTP,
        changeOrigin: true,
      },
      {
        context: ['/ws'],
        target: BACKEND_WS,
        ws: true,
        changeOrigin: true,
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
};
