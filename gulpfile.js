const gulp = require('gulp');
const concat = require('gulp-concat');
const replace = require('gulp-replace');

const now = new Date().toISOString();
const path = 'dist/token-platform-backoffice/en/';

console.log('now', now);

gulp.task('concat-js', function() {
  return gulp
    .src([path + 'runtime.js', path + 'es2015-polyfills.js', path + 'polyfills.js', path + 'main.js'])
    .pipe(concat('ng-bundled.js'))
    .pipe(gulp.dest(path));
});

gulp.task('update-html', function() {
  return (
    gulp
      .src([path + 'index.html'])
      // our ng styles
      .pipe(replace(/styles.css/g, 'styles.css?v=' + now))
      // theme scripts
      .pipe(replace(/scripts.js/g, 'scripts.js?v=4.3.1'))
      // remove concated files
      .pipe(replace(/src="\/[a-z]{2}\/runtime.js"/g, ''))
      .pipe(replace(/src="\/[a-z]{2}\/es2015-polyfills.js"/g, ''))
      .pipe(replace(/src="\/[a-z]{2}\/polyfills.js"/g, ''))
      // result of concated file
      .pipe(replace(/main.js/g, 'ng-bundled.js?v=' + now))
      // chunk of all modules
      .pipe(replace(/common.js/g, 'common.js?v=' + now))
      .pipe(gulp.dest(path))
  );
});

gulp.task(
  'default',
  gulp.series('concat-js', 'update-html', function(done) {
    done();
  })
);
