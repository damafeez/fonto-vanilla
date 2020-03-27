const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const __root = path.resolve(__dirname, '../')
module.exports = {
  entry: './src/scripts/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ ".tsx", ".ts", ".js" ]
  },
	output: {
		path: path.resolve(__root, 'dist'),
    filename: 'bundle.js',
	},
  devServer: {
    contentBase: path.resolve(__root, '.'),
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({
			filename: './index.html',
      template: './index.html'
    }),
		new CopyWebpackPlugin([
			{
				from: path.resolve(__root, 'static'),
			}
		]),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
};