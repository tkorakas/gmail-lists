import gulp from 'gulp';
import webpack from 'webpack';
import rimraf from 'rimraf';
import loadPlugins from 'gulp-load-plugins';
const plugins = loadPlugins();
import sass from 'gulp-sass';
import popupWebpackConfig from './popup/webpack.config';
import contentWebpackConfig from './content/webpack.config';

// Compile sass to css for dev.
gulp.task('sass:dev', ['clean'], () => {
  return gulp.src('./sass/*.scss')
  // Initializes sourcemaps.
    .pipe(plugins.sourcemaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(plugins.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    // Writes sourcemaps into the CSS file.
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest('./build/css'))
    .pipe(plugins.livereload());
});

// Compile sass to css.
gulp.task('sass', function() {
  return gulp.src('./sass/*.scss')
    .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(plugins.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('.build/css'))
    .pipe(plugins.livereload());
});

// Zip app to upload on Google web store.
gulp.task('zip-app', () =>
  gulp.src('build/**/**')
    .pipe(plugins.zip('build.zip'))
    .pipe(gulp.dest('./'))
);

gulp.task('popup-js', ['clean'], (cb) => {
  webpack(popupWebpackConfig, (err, stats) => {
    if (err) throw new plugins.util.PluginError('webpack', err);

    // plugins.util.log('[webpack]', stats.toString());
    plugins.livereload();
    cb();
  });
});

gulp.task('content-js', ['clean'], (cb) => {
  webpack(contentWebpackConfig, (err, stats) => {
    if (err) throw new plugins.util.PluginError('webpack', err);

    // plugins.util.log('[webpack]', stats.toString());
    plugins.livereload();
    cb();
  });
});

gulp.task('popup-html', ['clean'], () => {
  return gulp.src('popup/index.html')
    .pipe(plugins.rename('popup.html'))
    .pipe(gulp.dest('./build'))
    .pipe(plugins.livereload());
});

gulp.task('copy-manifest', ['clean'], () => {
  return gulp.src('manifest.json')
    .pipe(gulp.dest('./build'));
});

gulp.task('copy-libs', ['clean'], () => {
  return gulp.src('./libs/*')
    .pipe(gulp.dest('./build'));
});

gulp.task('copy-assets', ['clean'], () => {
  return gulp.src('./assets/*')
    .pipe(gulp.dest('./build/assets/'));
});

gulp.task('clean', (cb) => {
  rimraf('./build', cb);
});

gulp.task('build', ['copy-manifest', 'copy-libs', 'copy-assets', 'popup-js', 'popup-html', 'content-js', 'sass:dev']);

gulp.task('watch', ['default'], () => {
  plugins.livereload.listen();
  gulp.watch('popup/**/*', ['build']);
  gulp.watch('content/**/*', ['build']);
  gulp.watch('sass/*.scss', ['build']);
});

gulp.task('default', ['build']);
