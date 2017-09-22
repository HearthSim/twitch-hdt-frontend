const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const package = require(path.resolve(__dirname, "package"));

const isProduction = process.env.NODE_ENV === "production";
const plugins = [];

const vendorLibraries = [
	"react",
	"react-dom",
	"prop-types",
	"styled-components",
	"hearthstonejson",
	"react-hot-loader",
];

if (isProduction) {
	const { LicenseWebpackPlugin } = require("license-webpack-plugin");
	const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
	const CleanWebpackPlugin = require("clean-webpack-plugin");
	const ZipPlugin = require("zip-webpack-plugin");

	plugins.push(
		new LicenseWebpackPlugin({
			pattern: /^(MIT|ISC|BSD.*|.*)$/,
			unacceptablePattern: /GPL/,
			abortOnUnacceptableLicense: true,
			perChunkOutput: false,
			outputFilename: "LICENSES",
		}),
		new UglifyJSPlugin({
			uglifyOptions: {
				output: {
					comments: false,
				},
			},
		}),
		new webpack.BannerPlugin({
			banner: [
				`${package.name}@${package.version}`,
				package.homepage,
				"HearthSim, LLC. All Rights Reserved.",
			].join("\n"),
			include: "viewer",
		}),
		new webpack.BannerPlugin({
			banner: [
				`This bundle contains the following third party libraries and their dependencies:`,
				vendorLibraries.map(v => `- ${v}`).join("\n"),
				"See the LICENSES file for third-party licenses.",
			].join("\n"),
			include: "vendor",
		}),
		new CleanWebpackPlugin(["dist"]),
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("production"),
			},
			APPLICATION_VERSION: JSON.stringify(package.version),
		}),
		new ZipPlugin({
			filename: "app.zip",
		}),
	);
} else {
	plugins.push(
		new webpack.DefinePlugin({
			APPLICATION_VERSION: JSON.stringify(package.version),
		}),
		new webpack.NamedModulesPlugin(),
	);
}

module.exports = {
	entry: {
		vendor: vendorLibraries,
		viewer: [
			!isProduction ? "react-hot-loader/patch" : null,
			"babel-polyfill",
			path.resolve(__dirname, "src", "viewer"),
		].filter(x => x),
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
	].concat(plugins),
};
