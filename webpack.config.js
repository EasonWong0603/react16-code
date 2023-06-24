const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // babel-loader is used to load jsx and es6 code
          options: {
            presets: [['@babel/preset-env', { targets: 'defaults' }]], // presets to load
          },
        },
      },
    ],
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'React',
      template: path.join(__dirname, 'src/index.html'), // 源模版文件
    }),
  ],
};
