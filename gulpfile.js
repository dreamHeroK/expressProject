var gulp = require("gulp");
var webpack = require("webpack");
var uglify = require('gulp-uglify');
var run_sequence = require('run-sequence');


var webpack_config_; //模块weboack config配置对象组

var proName;

function registerTasks(proName_) {
    proName = proName_;
    webpack_config_ = require("./webpack.config");
    //src模块任务
    gulp.task('moduleTasks', function() {
        doWebPackTask(webpack_config_);
    });

    gulp.task('watch', function(callback) {
        gulp.watch('./src/**', function(file) {
            console.log(file);
            var path = file.path;
            path = path.replace(/\\/g, "/"); //path格式 /a/b/c/d

            if (path.search('/src') == -1) {
                return;
            }
            if (path.search('/yuepian') != -1) {
                run_sequence(['yuepian']);
                return;
            }

            webpackConfigByPath(path);

            function webpackConfigByPath(path) {
                var taskPath;
                for (var i = 0; i < webpack_config_.length; i++) {
                    taskPath = webpack_config_[i].path.join('/');
                    if (path.search(taskPath) != -1) {
                        doWebPackTask(webpack_config_[i]);
                        break;
                    }
                }
            }
        });
        callback();
    });

}


// 特殊配置 end


gulp.task('copyErrorPage', function() {
    gulp.src('./src/system/**').pipe(gulp.dest('./views/system'));
});

//启动命令
gulp.task('start', function(callback) {
    require('./bin/www');
});

gulp.task("all", function() {
    registerTasks();
    run_sequence(['copyErrorPage', 'moduleTasks'], function() {});
});

gulp.task('devAll', function() {
    registerTasks();
    run_sequence(['copyErrorPage', 'moduleTasks', 'watch', 'start']);
});


//
//非顺序执行webpack
function doWebPackTask(cfgObj) {
    var time1 = new Date();
    if (cfgObj instanceof Array) {
        doWebPackTaskItem(cfgObj[0], 0);
    } else {
        doWebPackTaskItem(cfgObj);
    }

    function doWebPackTaskItem(cfg, i) {
        if (proName && cfg.path.indexOf(proName) == -1) {
            if ((i || i == 0) && cfgObj[i + 1]) { doWebPackTaskItem(cfgObj[i + 1], i + 1); } else {
                finishTaskLog('all after ' + (new Date() - time1) / 1000 + "s");
                console.log("no Errors!");
            }
            return;
        }
        webpack(cfg.config, function(error, status) {
            if (error) errorLog('webpack', error);
            if (status.compilation.errors.length) {
                console.log(status.compilation.errors);
                return;
            }
            finishTaskLog(cfg.path);
            if ((i || i == 0) && cfgObj[i + 1]) { doWebPackTaskItem(cfgObj[i + 1], i + 1); } else {
                finishTaskLog('all after ' + (new Date() - time1) / 1000 + "s");
                console.log("no Errors!");
            }
        });
    }
}

function finishTaskLog(path) {
    if (path instanceof Array)
        console.log("finished:   " + path.join(" | "));
    else console.log("finished:   " + path);
}

function startTaskLog(path) {
    if (path instanceof Array)
        console.log("started:   " + path.join(" | "));
    else console.log("started:   " + path);
}

function errorLog(type, err) {
    console.log("Error! (by " + type + ")");
    console.log(err);
}