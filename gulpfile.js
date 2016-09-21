var gulp = require('gulp');
var deploy = require('gulp-gh-pages');
var webserver = require('gulp-webserver')


gulp.task('webserver', function() {
  gulp.src('./public')
    .pipe(webserver({
      fallback: 'index.html',
      livereload: true,
      open: true,
      port: 5380
    }));
});

gulp.task('deploy', function () {
  return gulp.src("./public/**/*")
    .pipe(deploy())
});

gulp.task('default', ['webserver']);
