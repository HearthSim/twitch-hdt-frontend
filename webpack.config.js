const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ResourceHintWebpackPlugin = require("resource-hints-webpack-plugin");
const package = require(path.resolve(__dirname, "package"));

const isProduction = process.env.NODE_ENV === "production";
const plugins = [];

const bundlePath = "js/";
const vendorLibraries = [
	"babel-polyfill",
	"hearthstonejson",
	"prop-types",
	"react",
	"react-dom",
	"react-hot-loader",
	"styled-components",
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
			includedChunks: ["vendor"],
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
			include: ["viewer", "config"].map(b => path.join(bundlePath, b)),
		}),
		new webpack.BannerPlugin({
			banner: [
				`This bundle contains the following third party libraries and their dependencies:`,
				vendorLibraries.map(v => `- ${v}`).join("\n"),
				"See the LICENSES file for third-party licenses.",
			].join("\n"),
			include: path.join(bundlePath, "vendor"),
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
			path.resolve(__dirname, "src", "viewer"),
		].filter(x => x),
		config: [
			!isProduction ? "react-hot-loader/patch" : null,
			path.resolve(__dirname, "src", "config"),
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
			{
				test: /\.png$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "img/",
						},
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
		filename: path.join(bundlePath, "[name].js"),
		path: path.resolve(__dirname, "dist"),
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: "viewer.html",
			chunks: ["viewer", "vendor"],
			template: path.resolve(__dirname, "template.html"),
			// Hard code the following list of assets for now. See https://github.com/jantimon/resource-hints-webpack-plugin/issues/8
			prefetch: [
				"img/minion.png",
				"img/spell.png",
				"img/weapon.png",
				"img/hero.png",
				"img/hero_power.png",
			],
			preload: false,
		}),
		new HtmlWebpackPlugin({
			filename: "config.html",
			chunks: ["config", "vendor"],
			template: path.resolve(__dirname, "template.html"),
			prefetch: false,
			preload: false,
		}),
		new ResourceHintWebpackPlugin(),
		new webpack.optimize.CommonsChunkPlugin({
			name: "vendor",
			minChunks: Infinity,
		}),
	].concat(plugins),
};
