const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackIncludeSiblingChunksPlugin = require("html-webpack-include-sibling-chunks-plugin");
const PreloadWebpackPlugin = require("preload-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const pkg = require(path.resolve(__dirname, "package"));

module.exports = (env, args) => {
	const isProduction = args && args.mode === "production";
	const plugins = [];

	const bundlePath = "js/";

	if (isProduction) {
		const { LicenseWebpackPlugin } = require("license-webpack-plugin");
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
			new webpack.BannerPlugin({
				banner: [
					`${pkg.name}@${pkg.version}`,
					pkg.homepage,
					"HearthSim, LLC. All Rights Reserved.",
				].join("\n"),
				include: ["viewer", "config"].map(b => path.join(bundlePath, b)),
			}),
			new webpack.BannerPlugin({
				banner: [
					"This file contains various third-party libraries.",
					"See ../LICENSES file for the respective licenses.",
				].join("\n"),
				include: path.join(bundlePath, "vendor"),
			}),
			new CleanWebpackPlugin(["dist"]),
			new ZipPlugin({
				filename: "app.zip",
			}),
		);
	}

	return {
		entry: {
			viewer: path.resolve(__dirname, "src", "viewer"),
			config: path.resolve(__dirname, "src", "config"),
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
								plugins: [
									[
										"react-hot-loader/babel",
										"babel-plugin-styled-components",
										{
											displayName: !isProduction,
										},
									],
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
					test: /.js$/,
					include: /react-hs-components/,
					use: [
						{
							loader: "babel-loader",
							options: {
								presets: [
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
							},
						},
					],
				},
				{
					test: /\.(png|svg)$/,
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
				{
					test: /\.otf/,
					exclude: /node_modules/,
					use: [
						{
							loader: "file-loader",
							options: {
								name: "[name].[ext]",
								outputPath: "fonts/",
							},
						},
					],
				},
			],
		},
		optimization: {
			minimizer: [
				new UglifyJSPlugin({
					uglifyOptions: {
						compress: {
							drop_console: true,
							pure_funcs: ["onUnhandled"],
						},
						mangle: false,
						output: {
							comments: /^\**!/,
						},
					},
				}),
			],
			splitChunks: {
				cacheGroups: {
					commons: {
						test: /[\\/]node_modules[\\/]/,
						name: "vendor",
						chunks: "all",
						enforce: true,
					},
				},
			},
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
			new webpack.DefinePlugin({
				APPLICATION_VERSION: JSON.stringify(pkg.version),
			}),
			new HtmlWebpackPlugin({
				filename: "viewer.html",
				chunks: ["viewer"],
				template: path.resolve(__dirname, "template.html"),
			}),
			new HtmlWebpackPlugin({
				filename: "config.html",
				chunks: ["config"],
				template: path.resolve(__dirname, "template.html"),
			}),
			new HtmlWebpackIncludeSiblingChunksPlugin(),
			new PreloadWebpackPlugin({
				rel: "prefetch",
				include: "allAssets",
				fileWhitelist: [
					/img\/minion\.png/,
					/img\/spell.png/,
					/img\/weapon\.png/,
					/img\/hero\.png/,
					/img\/hero_power\.png/,
					/img\/gift\.png/,
					/img\/pin\.svg/,
					/img\/unpin\.svg/,
					/img\/copy_deck\.svg/,
				],
				excludeHtmlNames: ["config.html"],
			}),
		].concat(plugins),
	};
};
