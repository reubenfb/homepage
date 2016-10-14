var gulp = require('gulp');
var deploy = require('gulp-gh-pages-cname');
var webserver = require('gulp-webserver')
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var tinypng = require('gulp-tinypng');
var runSequence = require('run-sequence');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var cloudflare = require("gulp-cloudflare");

var keys = require('./apiKeys.json');
var _ = require('underscore');
var utils = require('./src/js/utils.js');


gulp.task('webserver', function() {
  gulp.src('./public')
    .pipe(webserver({
      fallback: 'index.html',
      livereload: false,
      open: false,
      port: 5380
    }));
});

gulp.task('jade', ['sass'], function() {

  var locals = {
    data: require('./data/data.json'),
    _: _,
    utils: utils
  }
 
  gulp.src('./src/templates/*.jade')
    .pipe(jade({
      locals: locals
    }))
    .pipe(gulp.dest('./public/'))
});

gulp.task('sass', function () {
  return gulp.src('./src/stylesheets/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./src/stylesheets/compiled/'));
});

gulp.task('scripts', function() {
  return browserify('./src/js/app.js')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./public/'));
});

gulp.task('compress-images', function () {
  return gulp.src('./src/images/*.png')
    .pipe(tinypng(keys.tinypng))
    .pipe(gulp.dest('./src/images/compressed/'));
});

gulp.task('images', function () {
  return gulp.src('./src/images/compressed/*.png')
    .pipe(gulp.dest('./public/images/'));
});

gulp.task('git', function () {
  return gulp.src("./public/**/*")
    .pipe(deploy({
      cname: 'www.reubenfb.com'
    }))
});

gulp.task('purge-cdn-cache', function() {
  var options = {
      token  : keys.cloudflare.token,
      email  : keys.cloudflare.email,
      domain : 'reubenfb.com'
  };

  cloudflare(options);
})

gulp.task('deploy', function(done){
  runSequence('build', 'git', done);
});

gulp.task('watch', function() {
  gulp.watch('./src/stylesheets/*.scss', ['sass']);
  gulp.watch('./src/templates/*.jade', ['jade']);
});

gulp.task('build', ['sass', 'scripts', 'jade', 'images']);

gulp.task('default', ['build', 'watch', 'webserver']);
