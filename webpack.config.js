const webpack = require("webpack");
const dotenv = require("dotenv");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const env = dotenv.config().parsed;

const envKeys = Object.keys(env).reduce((prev, next) => {
	prev[`process.env.${next}`] = JSON.stringify(env[next]);
	return prev;
}, {});

module.exports = {
	entry: "./src/index.jsx",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js",
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: "babel-loader",
			},
			{
				test: /\.module\.css$/,
				use: [
					"style-loader",
					{
						loader: "css-loader",
						options: {
							modules: true,
						},
					},
				],
			},
			{
				test: /\.css$/,
				exclude: /\.module\.css$/,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	resolve: {
		extensions: [".js", ".jsx"],
		fallback: {
			path: false,
			os: false,
			crypto: false,
		},
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./public/index.html",
		}),
		new webpack.DefinePlugin(envKeys),
	],
	devServer: {
		static: "./dist",
		hot: true,
		port: 3000,
		historyApiFallback: true,
	},
	mode: "development",
};
