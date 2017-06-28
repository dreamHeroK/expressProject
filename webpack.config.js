var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require('webpack');

//文件夹目录：
var srcDir = "/src";
var publicDir = "/public";
var viewsDir = "/views";

//加载器
var commonLoaders = [{
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
    }, {
        test: /\.html$/,
        loader: 'html-loader'
    }, {
        test: /\.json$/,
        loader: "json-loader"
    }, {
        test: /\.(png|jpg|jpeg|gif)$/,
        // loader: 'file-loader?name=../images/[name].[ext]'
        loader: 'file-loader?name=/[hash].[ext]'
    }, {
        test: /\.sass$/,
        loader: 'style!css!sass'
    }

];

//配置别名
var resolve = {
    alias: {}
};

var getPlugins = function(pluginArr) {
    pluginArr.push(new ExtractTextPlugin("[name].min.css"));
    // if (!global.ifDevLocal) {
    //     pluginArr.push(new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }));
    // }
    return pluginArr;
};


var myCOnfig = require('./webpack_config/default_config.js');


module.exports = webpackConfigify(myCOnfig);

function webpackConfigify(config) {
    var webPackConfigArr = [];
    findModule([]);

    function setWebpackConfig(obj, path) {
        var objEntry = obj.entry,
            objHtml = obj.html;
        var _entry = {},
            _output = {},
            _module = {},
            _plugins = {},
            _resolve = {};
        var relPath = '/' + path.join('/');
        //setEntry
        for (var i = 0, ent; ent = objEntry[i++];) {
            if (ent.search("/") != -1) {
                _entry[ent] = __dirname + srcDir + ent + ".js";
            } else {
                _entry[ent] = __dirname + srcDir + relPath + "/js/" + ent + ".js";
            }
        }
        //setOutput
        _output = {
            path: __dirname + publicDir + relPath,
            publicPath: relPath,
            filename: '[name].min.js'
        };
        //setModule
        _module = {
            loaders: commonLoaders
        };
        //setPlugins
        var htmlWebpackPlugins = [];
        var chunksSortIndex = {};
        for (var i = 0, ent; ent = objEntry[i++];) {
            chunksSortIndex[ent] = i + 1;
        }
        for (var i = 0, html; html = objHtml[i++];) {
            htmlWebpackPlugins.push(new HtmlWebpackPlugin({
                // 生成出来的html文件名
                filename: __dirname + viewsDir + relPath + '/' + html.name + '.html',
                // 每个html的模版，这里多个页面使用同一个模版
                template: __dirname + srcDir + relPath + '/html/' + html.name + '.html',
                // 自动将引用插入html
                inject: true,
                hash: global.ifDevLocal ? true : false,
                // hash:  false,
                minify: { html5: true, collapseWhitespace: true },
                chunks: html.chunk,
                chunksSortMode: function(a, b) {
                    var index = chunksSortIndex,
                        aI = index[a.origins[0].name],
                        bI = index[b.origins[0].name];
                    return aI && bI ? aI - bI : 1;
                    // return 0;
                }
            }));
        }
        _plugins = getPlugins(htmlWebpackPlugins);

        //setResolve
        _resolve = resolve;
        return {
            entry: _entry,
            output: _output,
            module: _module,
            plugins: _plugins,
            resolve: _resolve
        };
    }

    function findModule(path) {
        var obj;
        obj = deepClone(config);
        for (var i = 0; i < path.length; i++) {
            obj = obj[path[i]];
        }
        if (obj.entry && obj.html) {
            webPackConfigArr.push({
                path: path,
                config: setWebpackConfig(obj, path)
            });
        } else {
            for (var i in obj) {
                // if (typeof obj[i] != 'function') {
                var path2 = path.concat(i);
                findModule(path2);
                // }
            }
        }
    }

    return webPackConfigArr;
}
//深度克隆
function deepClone(obj) {
    var result, oClass = isClass(obj);
    //确定result的类型
    if (oClass === "Object") {
        result = {};
    } else if (oClass === "Array") {
        result = [];
    } else {
        return obj;
    }
    for (var key in obj) {
        var copy = obj[key];
        if (isClass(copy) == "Object") {
            result[key] = arguments.callee(copy); //递归调用
        } else if (isClass(copy) == "Array") {
            result[key] = arguments.callee(copy);
        } else {
            result[key] = obj[key];
        }
    }
    return result;
}
//返回传递给他的任意对象的类
function isClass(o) {
    if (o === null) return "Null";
    if (o === undefined) return "Undefined";
    return Object.prototype.toString.call(o).slice(8, -1);
}