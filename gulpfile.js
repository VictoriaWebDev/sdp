const { src, dest, series, watch } = require('gulp'),
  htmlMin = require('gulp-htmlmin'),
  autoprefixer = require('gulp-autoprefixer'),
  image = require('gulp-image'),
  webp = require('gulp-webp'),
  avif = require('gulp-avif'),
  rename = require('gulp-rename'),
  gulpif = require('gulp-if'),
  sourcemaps = require('gulp-sourcemaps'),
  del = require('del'),
  sass = require('gulp-sass')(require('sass')),
  browserSync = require('browser-sync').create();

const srcFolder = 'src',
  buildFolder = 'dist';

const paths = {
  srcFontsFolder: `${srcFolder}/fonts`,
  buildFontsFolder: `${buildFolder}/fonts`,
  srcImgFolder: `${srcFolder}/img`,
  buildImgFolder: `${buildFolder}/img`,
  srcCssFolder: `${srcFolder}/css`,
  buildCssFolder: `${buildFolder}/css`,
}

let prod = false;

const isProd = (done) => {
  prod = true;
  done();
};

const clean = () => {
  return del([buildFolder]);
};

const fonts = () => {
  return src(`${paths.srcFontsFolder}/**`)
    .pipe(dest(paths.buildFontsFolder))
};

const htmlMinify = () => {
  return src(`${srcFolder}/**/*.html`)
    .pipe(gulpif(prod, htmlMin({
      collapseWhitespace: true,
    })))
    .pipe(dest(buildFolder))
    .pipe(browserSync.stream());
};

const styles = () => {
  return src(`${paths.srcCssFolder}/style.scss`)
    .pipe(gulpif(!prod, sourcemaps.init()))
    .pipe(sass(gulpif(prod, {
      outputStyle: 'compressed'
    })))
    .on('error', sass.logError)
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulpif(!prod, sourcemaps.write()))
    .pipe(dest(paths.buildCssFolder))
    .pipe(browserSync.stream());
};

const images = () => {
  return src([`${paths.srcImgFolder}/**/*.{jpg,jpeg,png,svg,avif}`])
  .pipe(image())
  .pipe(dest(paths.buildImgFolder))
};

const webpImages = () => {
  return src([`${paths.srcImgFolder}/**/*.{jpg,jpeg,png}`])
    .pipe(webp())
    .pipe(dest(paths.buildImgFolder))
};

const avifImages = () => {
  return src([`${paths.srcImgFolder}/**/*.{jpg,jpeg,png}`])
    .pipe(avif())
    .pipe(dest(paths.buildImgFolder))
};

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: `${buildFolder}`
    }
  })
};

watch(`${paths.srcFontsFolder}/**`, fonts);
watch(`${srcFolder}/**/*.html`, htmlMinify);
watch(`${paths.srcCssFolder}/**/*.scss`, styles);

exports.dev = series(clean, fonts, htmlMinify, styles, images, webpImages, avifImages, watchFiles);
exports.build = series(isProd, clean, fonts, htmlMinify, styles, images, webpImages, avifImages);
