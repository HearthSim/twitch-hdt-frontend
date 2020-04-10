const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackIncludeSiblingChunksPlugin = require("html-webpack-include-sibling-chunks-plugin");
const TerserPlugin = require("terser-webpack-plugin");
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
				include: ["viewer", "mobile", "config"].map(b =>
					path.join(bundlePath, b),
				),
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
			viewer: [
				"@babel/polyfill",
				path.resolve(__dirname, "src", "viewer", "overlay"),
			],
			mobile: [
				"@babel/polyfill",
				path.resolve(__dirname, "src", "viewer", "mobile"),
			],
			config: ["@babel/polyfill", path.resolve(__dirname, "src", "config")],
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
									"@babel/preset-react",
									[
										"@babel/preset-env",
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
									!isProduction ? "react-hot-loader/babel" : null,
									[
										"babel-plugin-styled-components",
										{
											ssr: false,
											displayName: !isProduction,
										},
									],
									//"@babel/plugin-proposal-class-properties",
									//"babel-plugin-transform-object-rest-spread",
								].filter(x => x !== null),
							},
						},
						{
							loader: "awesome-typescript-loader",
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
										"@babel/preset-env",
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
				new TerserPlugin({
					terserOptions: {
						drop_console: true,
						pure_funcs: ["onUnhandled"],
						mangle: false,
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
			new HtmlWebpackPlugin({
				filename: "mobile.html",
				chunks: ["mobile"],
				template: path.resolve(__dirname, "template.html"),
			}),
			new HtmlWebpackIncludeSiblingChunksPlugin(),
		].concat(plugins),
	};
};
