var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('default', function() {
  return gulp.src('js/main.js')
  .pipe(uglify())
  .pipe(rename("dist.js"))
  .pipe(gulp.dest('js'))
});
