const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                type: 'asset/resource',
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
            '@': path.resolve(__dirname, 'src/'),
        },
    },
    plugins: [
        new Dotenv({
            systemvars: true,
            safe: false,
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 9000,
        hot: false,
        open: true,
    },
    devtool: 'source-map',
};
