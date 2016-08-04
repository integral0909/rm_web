var gulp = require("gulp"),
    path = require("path"),
    concat = require("gulp-concat"),
    concatCss = require("gulp-concat-css"),
    uglify = require("gulp-uglify"),
    clean = require("gulp-clean"),
    html_replace = require("gulp-html-replace"),
    order = require("gulp-order"),
    minifyCSS = require("gulp-minify-css"),
    replace = require('gulp-replace'),
    webserver = require('gulp-webserver');

var BUILD_PATH = "./build/";
var APP_PATH = "./";

var API_HOST = process.env.ROKKET_API_HOST || "rokketmed.herokuapp.com";

var paths = {
    js_files: [
        APP_PATH + "/bower_components/html5-boilerplate/js/vendor/modernizr-2.6.2.min.js",
        APP_PATH + "/bower_components/angular/angular.js",
        APP_PATH + "/bower_components/angular-scroll/angular-scroll.min.js",
        APP_PATH + "/bower_components/angular-route/angular-route.js",
        APP_PATH + "/bower_components/angular-sanitize/angular-sanitize.js",
        APP_PATH + "/bower_components/angularytics/dist/angularytics.js",
        APP_PATH + "/bower_components/lodash/lodash.min.js",
        APP_PATH + "/js/lib/*.js",
        APP_PATH + "/js/gmaps.js",
        APP_PATH + "/app.js",
        APP_PATH + "/services/**/*.js",
        APP_PATH + "/directives/**/*.js",
        APP_PATH + "/views/home/home.js",
        APP_PATH + "/views/treatments/treatments.js",
        APP_PATH + "/views/surgeries/surgeries.js",
        APP_PATH + "/views/surgeries/categories.js",
        APP_PATH + "/views/results/results.js",
        APP_PATH + "/views/details/details.js",
        APP_PATH + "/views/terms/terms.js",
        APP_PATH + "/views/search/search.js",
        APP_PATH + "/views/privacy/privacy.js",
        APP_PATH + "/views/new-home/home.js",
        APP_PATH + "/js/plugins.js",
        APP_PATH + "/js/html5shiv.js"
    ],
    css_files: [
        APP_PATH + "/bower_components/html5-boilerplate/css/normalize.css",
        APP_PATH + "/bower_components/html5-boilerplate/css/main.css",
        APP_PATH + "/css/animations.css",
        APP_PATH + "/css/animate.css"
    ]
};
var build_paths = {
    js: "",
    css: ""
};

gulp.task("clean", function () {
    gulp.src(BUILD_PATH)
        .pipe(clean());
});

gulp.task("build:js", function () {
    build_paths.js = "js/all." + Date.now() + ".js";
    gulp.src(paths.js_files)
        .pipe(replace("${ROKKET_API_HOST}", API_HOST))
        .pipe(uglify())
        .pipe(concat(build_paths.js))
        .pipe(gulp.dest(BUILD_PATH));
    gulp.src(APP_PATH + "/js/skel.min.js")
        .pipe(gulp.dest(BUILD_PATH + "/js"));
});

gulp.task("build:css", function () {
    build_paths.css = "css/all." + Date.now() + ".css";
    gulp.src(paths.css_files)
        .pipe(minifyCSS({keepBreaks: true}))
        .pipe(concatCss(build_paths.css))
        .pipe(gulp.dest(BUILD_PATH));
    gulp.src([APP_PATH + "/css/style.css", APP_PATH + "/css/style-*.css"])
        .pipe(gulp.dest(BUILD_PATH + "/css"));
});

gulp.task("build:font", function () {
    gulp.src(APP_PATH + "/fonts/*")
        .pipe(gulp.dest(BUILD_PATH + "/fonts"));
});

gulp.task("build:images", function () {
    gulp.src(APP_PATH + "/img/*")
        .pipe(gulp.dest(BUILD_PATH + "/img"));
    gulp.src(APP_PATH + "/*.png")
        .pipe(gulp.dest(BUILD_PATH));
    gulp.src(APP_PATH + "/*.ico")
        .pipe(gulp.dest(BUILD_PATH));
    gulp.src(APP_PATH + "/*.svg")
        .pipe(gulp.dest(BUILD_PATH));
});

gulp.task("build:html", function () {
    gulp.src(APP_PATH + "/views/**/*.html")
        .pipe(gulp.dest(BUILD_PATH + "/views/"));
    gulp.src(APP_PATH + "/directives/**/*.html")
        .pipe(gulp.dest(BUILD_PATH + "/directives/"));
    gulp.src(APP_PATH + "/index.html")
        .pipe(html_replace({
            js: build_paths.js,
            css: build_paths.css
        }))
        .pipe(gulp.dest(BUILD_PATH));
});

gulp.task("build", [
    "build:js",
    "build:css",
    "build:font",
    "build:images",
    "build:html"
]);


gulp.task('webserver', function () {
    var config = {
        port: process.env.PORT || 5000,
        https: false,
        fallback: 'index.html'
    };
    if(!process.env.LOCAL){
        config.host = '0.0.0.0';
    }

    gulp.src(['build'])
        .pipe(webserver(config));
});

gulp.task("default", ["build"]);