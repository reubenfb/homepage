var gulp = require('gulp');
var deploy = require('gulp-gh-pages-cname');
var webserver = require('gulp-webserver')
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var runSequence = require('run-sequence');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var merge = require('merge-stream');
var glob = require('glob');
var path = require('path');

var _ = require('underscore');
var utils = require('./src/js/utils.js');


gulp.task('webserver', function() {
  gulp.src('./public')
    .pipe(webserver({
      host: '0.0.0.0',
      //https: true,
      fallback: 'index.html',
      livereload: false,
      open: false,
      port: 4000
    }));
});

gulp.task('jade', ['sass'], function() {

  var locals = {
    data: require('./data/data.json'),
    _: _,
    utils: utils
  }
 
  gulp.src('./src/templates/**/*.jade')
    .pipe(jade({
      locals: locals
    }))
    .pipe(gulp.dest('./public/'))
});

gulp.task('sass', function () {
  return gulp.src('./src/stylesheets/**/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./public/'));
});

gulp.task('scripts', function() {

  let misc = glob.sync('./src/js/misc/**/*.js');

  // do the assorted scripts first
  merge(misc.map(function(file){
    return browserify(`${file}`)
      .bundle()
      .pipe(source((path.basename(file, '.js') + '.js')))
      .pipe(gulp.dest('./public/js/'));
    }));

  // then the main script (with uglify)
  return browserify('./src/js/app.js')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./public/'));
});

gulp.task('images', function () {
  return gulp.src('./src/images/compressed/*.{png,jpg,gif,jpeg,mp4}')
    .pipe(gulp.dest('./public/images/'));
});

gulp.task('miscFiles', function () {
  return gulp.src('./src/miscFiles/**/*')
    .pipe(gulp.dest('./public/miscFiles/'));
});

gulp.task('git', function () {
  return gulp.src("./public/**/*")
    .pipe(deploy({
      cname: 'www.reubenfb.com'
    }))
});

gulp.task('deploy', function(done){
  runSequence('build', 'git', done);
});

gulp.task('watch', function() {
  gulp.watch('./src/stylesheets/**/*.scss', ['sass']);
  gulp.watch('./src/templates/**/*.jade', ['jade']);
  gulp.watch('./src/js/**/*.js', ['scripts']);
});

gulp.task('build', ['sass', 'scripts', 'jade', 'images', 'miscFiles']);

gulp.task('default', ['build', 'watch', 'webserver']);
