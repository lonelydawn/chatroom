/**
 * Created by lonelydawn on 2017-11-20.
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: __dirname + '/app/main.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: './dist',      // 本地服务器所加载的页面所在的目录
        historyApiFallback: true,   // 不跳转
        inline: true,               // 实时刷新
        port: 8081,
        hot: true
    },
    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: 'raw-loader'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.(scss|sass)$/,
                loader: 'style-loader!css-loader!sass-loader'
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
                loader: 'file-loader'
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'url-loader?limit=8192&name=images/[hash].[ext]'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Chat room',
            filename: './index.html',
            template: 'app/index.html',
            inject: 'body',
            hash: true
        })
    ]
}