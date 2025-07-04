const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const WebpackCopyOutputOnBuildPlugin = require("webpack-copy-output-on-build-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const isDebug = process.env.npm_lifecycle_event !== 'build_PROD';
const isDevInplace = process.env.npm_lifecycle_event === 'build_DEV_INPLACE';

const PATHS = {
    source: path.join(__dirname, 'src/main/ui'),
    build: path.join(__dirname, 'src/main/resources/static/build'),
    target_build: path.join(__dirname, 'target/classes/static/build'),
};

module.exports = {
    mode: 'development',
    watch: isDebug && process.env.npm_lifecycle_event !== 'build_DEV_NOWATCH',
    entry: {
        mlnt_test: path.join(PATHS.source, 'ReactEntry.jsx'),
    },
    output: {
        path: PATHS.build,
        filename: '[name]/[name].bundle.js',
        assetModuleFilename: '../assets/[name].[ext]?[hash]',
        clean: true // Очищать dist перед сборкой
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        alias: {
            react: path.resolve('./node_modules/react')
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react', "@babel/preset-typescript"],
                        plugins: [
                            ["@babel/plugin-proposal-decorators", {legacy: true}],
                            ["@babel/plugin-transform-class-properties"],
                            ["@babel/plugin-transform-runtime"]
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"]
            },
            {
                test: /\.less$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", "less-loader"]
            },
            {
                test: /\.(png|jpg|gif|woff|woff2|eot|ttf|otf|svg)$/,
                type: 'asset/resource'
            }
        ],
    },
    devServer: {
        static: path.resolve(__dirname, PATHS.source),         // или './build' — папка, куда собирается проект
        port: 3000,               // Порт, на котором будет запущен сервер
        open: true,               // Автоматически открывает браузер
        hot: true                 // Включает hot-reload
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src/main/resources/templates/hello.html'),
        }),
        new MiniCssExtractPlugin({
            filename: "[name]/[name].css"
        }),
        new SimpleProgressWebpackPlugin({
            format: process.stderr.isTTY ? 'compact' : 'simple'
        }),
        ...(isDevInplace ? [new WebpackCopyOutputOnBuildPlugin({
            copyPaths: [PATHS.target_build],
            logCopy: true,
        })] : []),
    ],
    optimization: {
        minimize: !isDebug,
        minimizer: [
            new TerserPlugin({
                minify: TerserPlugin.terserMinify,
                parallel: true,
                extractComments: false,
            }),
            new CssMinimizerPlugin({
                minify: CssMinimizerPlugin.parcelCssMinify,
                parallel: true
            })
        ],
    },
    stats: {
        assets: false,
        builtAt: true,
        chunks: false,
        entrypoints: false,
        colors: true,
        errors: true,
        errorDetails: true,
        modules: false,
        moduleTrace: true,
        performance: true,
        timings: true,
        hash: false,
        version: false,
        warnings: true,
    },
    devtool: isDebug ? "eval-source-map" : false,
    cache: isDebug,
};