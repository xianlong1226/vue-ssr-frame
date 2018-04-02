const path = require('path');
const webpack = require('webpack');
const extractTextPlugin = require('extract-text-webpack-plugin');
const htmlWebpackPlugin = require('html-webpack-plugin');
const glob = require('glob');

const ASSET_PATH = process.env.ASSET_PATH || '/';
const env = process.env.NODE_ENV || 'development';

let config = {
	entry: {},
	context: path.resolve(__dirname, "entries"),
	output: {
		filename: '[name].node.[chunkhash].js',
		path: path.resolve(__dirname, 'dist/'), //告诉webpack将文件生成到这个路径下
		sourceMapFilename: '[file].map',
		libraryTarget: 'commonjs2'
	},
	target: 'node',

	module: {
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
			loader: 'vue-loader'
		}]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.ASSET_PATH': JSON.stringify(ASSET_PATH),
			'process.env.NODE_ENV': JSON.stringify(env),
      'process.env.VUE_ENV': '"server"' // 配置 vue 的环境变量，告诉 vue 是服务端渲染，就不会做耗性能的 dom-diff 操作了
		})
	],
	resolve: {
		alias: {
			'components': path.join(__dirname, 'components'),
			'fonts': path.join(__dirname, 'fonts')
		}
	},
	devtool: 'source-map',
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
	config.entry[entry.name] = [path.join(entry.path, 'index.server.js')];
});

module.exports = config;