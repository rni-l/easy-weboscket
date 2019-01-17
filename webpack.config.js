const path = require('path')
const ora = require('ora')
const rm = require('rimraf')
const chalk = require('chalk')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const pkg = require('./package.json')
const rootPath = path.resolve(__dirname)
const pluginName = pkg.pluginName
const ENV = process.env.NODE_ENV
const isDevelopment = ENV === 'development'

const defaultPlugin = [
  new HtmlWebpackPlugin({
    title: 'Development',
    template: './index.html'
  })
]

const entry = isDevelopment
  ? {
    app: path.resolve(rootPath, 'src', 'index.ts')
  }
  : {
    app: path.resolve(rootPath, 'src', `${pluginName}.ts`)
  }

const output = isDevelopment
  ? {
    filename: 'index.js',
    path: path.resolve(rootPath, 'dist')
  }
  : {
    filename: `${pluginName}.js`,
    path: path.resolve(rootPath, 'dist'),
    library: {
      root: pluginName,
      amd: pluginName,
      commonjs: pluginName
    },
    libraryTarget: 'umd'
  }

const config = {
  mode: isDevelopment ? 'development' : 'production',

  entry,

  devServer: {
    contentBase: './dist',
    hot: true,
    inline: true
  },

  output,

  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [path.resolve(rootPath, 'src')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        use: isDevelopment
          ? [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'sass-loader' }]
          : ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader']
          })
      }
    ]
  },

  plugins: [].concat(
    isDevelopment
      ? defaultPlugin
      : [
        new UglifyJsPlugin({
          uglifyOptions: {
            ie8: true
          }
        }),
        new ExtractTextPlugin('styles.css')
      ]
  )
}

module.exports = config
