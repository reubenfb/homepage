var gulp = require('gulp');
var deploy = require('gulp-gh-pages');
var webserver = require('gulp-webserver')
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var image = require('gulp-image');

var _ = require('underscore');
var utils = require('./src/js/utils.js');


gulp.task('webserver', function() {
  gulp.src('./public')
    .pipe(webserver({
      fallback: 'index.html',
      livereload: true,
      open: true,
      port: 5380
    }));
});

gulp.task('jade', function() {

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
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/'));
});

gulp.task('scripts', function() {
  return gulp.src('./src/js/*.js')
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./public/'));
});

gulp.task('images', function () {
  gulp.src('./src/images/*')
    .pipe(image())
    .pipe(gulp.dest('./public/images/'));
});

gulp.task('deploy', ['build'], function () {
  return gulp.src("./public/**/*")
    .pipe(deploy())
});

gulp.task('watch', function() {
    gulp.watch('./src/stylesheets/*.scss', ['sass']);
});

gulp.task('build', ['sass', 'scripts', 'images', 'jade'])
gulp.task('default', ['build', 'watch', 'webserver']);
