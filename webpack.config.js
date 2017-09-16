const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: {
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
							plugins: ["babel-plugin-styled-components"],
						},
					},
					{
						loader: "react-hot-loader/webpack",
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
			chunks: ["viewer"],
			template: path.resolve(__dirname, "template.html"),
		}),
		new webpack.NamedModulesPlugin(),
	],
};
