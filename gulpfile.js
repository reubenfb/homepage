var gulp = require('gulp');
var deploy = require('gulp-gh-pages');
var webserver = require('gulp-webserver')
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var _ = require('underscore');


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
    _: _
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

gulp.task('deploy', ['build'], function () {
  return gulp.src("./public/**/*")
    .pipe(deploy())
});

gulp.task('build', ['jade', 'sass'])
gulp.task('default', ['build', 'webserver']);
