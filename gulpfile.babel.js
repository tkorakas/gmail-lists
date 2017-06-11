import gulp from 'gulp';
import webpack from 'webpack';
import rimraf from 'rimraf';
import loadPlugins from 'gulp-load-plugins';
const plugins = loadPlugins();

import popupWebpackConfig from './popup/webpack.config';
import contentWebpackConfig from './content/webpack.config';

gulp.task('popup-js', ['clean'], (cb) => {
    webpack(popupWebpackConfig, (err, stats) => {
        if(err) throw new plugins.util.PluginError('webpack', err);

        plugins.util.log('[webpack]', stats.toString());

        cb();
    });
});

gulp.task('content-js', ['clean'], (cb) => {
    webpack(contentWebpackConfig, (err, stats) => {
        if(err) throw new plugins.util.PluginError('webpack', err);

        plugins.util.log('[webpack]', stats.toString());

        cb();
    });
});

gulp.task('popup-html', ['clean'], () => {
    return gulp.src('popup/index.html')
        .pipe(plugins.rename('popup.html'))
        .pipe(gulp.dest('./build'))
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

gulp.task('build', ['copy-manifest', 'copy-libs', 'copy-assets', 'popup-js', 'popup-html', 'content-js']);

gulp.task('watch', ['default'], () => {
    gulp.watch('popup/**/*', ['build']);
    gulp.watch('content/**/*', ['build']);
    gulp.watch('event/**/*', ['build']);
});

gulp.task('default', ['build']);