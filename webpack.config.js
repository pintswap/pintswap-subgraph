'use strict';

const path = require('path');
module.exports = {
  mode: process.env.NODE_ENV || 'production',
	target: 'node',
  entry: './tree/index.js',
  output: {
    path: path.join(__dirname, 'src'),
    filename: 'parse-trade.js',
    library: 'trade',
    libraryTarget: 'commonjs',
    globalObject: 'this'
  }
};
