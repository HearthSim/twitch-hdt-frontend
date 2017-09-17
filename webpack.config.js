const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: {
		vendor: [
			"react",
			"react-dom",
			"prop-types",
			"styled-components",
			"hearthstonejson",
			"react-hot-loader",
		],
		viewer: [
			"react-hot-loader/patch",
			path.resolve(__dirname, "src", "viewer"),
		],
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js"],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "react-hot-loader/webpack",
					},
					{
						loader: "babel-loader",
						options: {
							presets: [
								"react",
								[
									"env",
									{
										targets: {
											browsers: [
												"ie >= 11",
												"last 2 chrome versions",
												"last 2 firefox versions",
												"safari >= 9",
											],
										},
										modules: false,
									},
								],
							],
							plugins: [
								"babel-plugin-styled-components",
								"babel-plugin-transform-object-rest-spread",
							],
						},
					},
					{
						loader: "ts-loader",
					},
				],
			},
		],
	},
	devServer: {
		contentBase: "./dist",
		https: true,
		overlay: true,
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "dist"),
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: "viewer.html",
			chunks: ["viewer", "vendor"],
			template: path.resolve(__dirname, "template.html"),
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: "vendor",
			minChunks: Infinity,
		}),
		new webpack.NamedModulesPlugin(),
	],
};
