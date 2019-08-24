const path = require('path');
const webpack = require('webpack');
const extractTextPlugin = require('extract-text-webpack-plugin');
const htmlWebpackPlugin = require('html-webpack-plugin');
const glob = require('glob');
const config = require('config');

const publishPath = config.publishPath;
const publicPath = config.publicPath;

let webpackConfig = {
	entry: {},
	context: path.resolve(__dirname, "entries"),
	output: {
		filename: '[name].page.[chunkhash].js',
		path: path.join(__dirname, publishPath), //告诉webpack将文件生成到这个路径下
		sourceMapFilename: '[file].map',
		publicPath: '/' + publicPath.replace(/\//g, '') + '/'
	},
	target: 'web', 

	module: {
		noParse: /jquery/,
		rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: ['env']
				}
			}
		}, {
			test: /\.less$/,
			use: extractTextPlugin.extract({
				fallback: "style-loader",
				use: [{
					loader: "style-loader" // creates style nodes from JS strings
				}, {
					loader: "css-loader" // translates CSS into CommonJS
				}, {
					loader: "less-loader" // compiles Less to CSS
				}]
			})
		}, {
			test: /\.(png|svg|jpg|jpeg|gif)$/,
			use: [{
				loader: 'url-loader',
				options: {
					limit: 1000
				}
			}]
		}, {
			test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
			use: [{
				loader: "file-loader?name=[name].[hash].[ext]"
			}]
		}, {
			test: /\.vue$/,
			loader: 'vue-loader',
			options: {
				loaders: {
					'css': extractTextPlugin.extract({
						use: [{
							loader: 'css-loader'
						}, {
							loader: 'less-loader'
						}],
						fallback: 'vue-style-loader'
					}),
					'less': extractTextPlugin.extract({
						use: [{
							loader: 'css-loader'
						}, {
							loader: 'less-loader'
						}],
						fallback: 'vue-style-loader'
					}),
				},
				extractCSS: true
			}
		}]
	},
	plugins: [
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
			'window.jQuery': 'jquery'
		}),
		new extractTextPlugin('[name].page.[contenthash].css'),
		new webpack.DefinePlugin({
			'process.env.ASSET_PATH': publishPath
		})
	],
	resolve: {
		alias: {
			'components': path.join(__dirname, 'components')
		}
	},
	devtool: 'cheap-module-source-map',
}

//业务入口文件所在的目录
let chunknames = [];
let entries = [];
let entryDir = path.join(__dirname, 'entries/');
glob.sync(entryDir + '*').forEach(function (entry) {
	let basename = path.basename(entry);
	if (basename !== 'admin') {
		chunknames.push(basename);
		entries.push({
			name: basename,
			path: entry
		});
	}
});

let adminEntryDir = path.join(__dirname, 'entries/admin/');
glob.sync(adminEntryDir + '*').forEach(function (entry) {
	let basename = path.basename(entry);
	chunknames.push('admin/' + basename);
	entries.push({
		name: 'admin/' + basename,
		path: entry
	});
});

entries.forEach(function (entry) {
	//添加entry
	webpackConfig.entry[entry.name] = [path.join(entry.path, 'index.js')];
});

webpackConfig.plugins.push(new webpack.optimize.CommonsChunkPlugin({
	name: 'common',
	minChunks: 2, //只要有两个以上的模块包含同样的模块就提取到公共js中
	chunks: chunknames
}));

module.exports = webpackConfig;