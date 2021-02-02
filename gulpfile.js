const projectFolder = "dist";
const sourceFolder = "src";

const path = {
  build: {
    html: projectFolder + "/",
    css: projectFolder + "/css/",
    js: projectFolder + "/js/",
    img: projectFolder + "/img/",
    fonts: projectFolder + "/fonts/"
  },
  src: {
    html: [sourceFolder + "/*.html", "!" + sourceFolder + "/_*.html"],
    css: sourceFolder + "/sass/style.sass",
    js: sourceFolder + "/js/script.js",
    img: sourceFolder + "/img/**/*.{jpg, jpeg, png, gif, webp, ico, svg}",
    fonts: sourceFolder + "/fonts/*.ttf"
  },
  watch: {
    html: sourceFolder + "/**/*.html",
    css: sourceFolder + "/sass/**/*.sass",
    js: sourceFolder + "/js/**/*.js",
    img: sourceFolder + "/img/**/*.{jpg, jpeg, png, gif, webp, ico, svg}"
  },
  clean: "./" + projectFolder + "/"
}

const {
  src,
  dest
} = require('gulp'),
  gulp = require('gulp'),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  del = require("del"),
  sass = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  groupMedia = require("gulp-group-css-media-queries"),
  cleanCss = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  uglify = require("gulp-uglify-es").default,
  babel = require('gulp-babel'),
  imagemin = require('gulp-imagemin'),
  webp = require('gulp-webp'),
  webpHtml = require('gulp-webp-html'),
  webpCss = require('gulp-webp-css'),
  svgSprite = require('gulp-svg-sprite');
  

function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: "./" + projectFolder + "/"
    },
    port: 3000,
    notify: false
  });
}

function html(params) {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webpHtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function js(params) {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(dest(path.build.js))
    .pipe(
      uglify()
    )
    .pipe(
      rename({
        extname: ".min.js"
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function images() {
  return src(['./src/img/**.jpg', './src/img/**.png', './src/img/**.jpeg', './src/img/**.webp'])
    .pipe(webp({
      quality: 70
    }))
    .pipe(dest(path.build.img))
    .pipe(src(['./src/img/**.jpg', './src/img/**.png', './src/img/**.jpeg', './src/img/**.webp']))
    .pipe(
      imagemin({
        interlaced: true,
        progressive: true,
        svgoPlugins: [{
          removeViewBox: false
        }],
        optimizationLevel: 3
      }),
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

function clean(params) {
  return del(path.clean)
}

// gulp.task('svgSprite', function () {
//   return gulp.src([sourceFolder + '/iconsprite/*.svg'])
//     .pipe(svgSprite({
//       mode: {
//         stack: {
//           sprite: "../svg/sprite.svg",
//           // example: true
//         }
//       },
//     }))
//     .pipe(dest(path.build.img))

// })

function svg () {
  return gulp.src([sourceFolder + '/iconsprite/*.svg'])
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../svg/sprite.svg",
          // example: true
        }
      },
    }))
    .pipe(dest(path.build.img))

}

function css() {
  return src(path.src.css)
    .pipe(
      sass({
        outputStyle: "expanded"
      })
    )
    .pipe(groupMedia())
    .pipe(autoprefixer({
      overrideBrowserslist: ["last 5 versions"],
      cascade: true
    }))
    .pipe(webpCss())
    .pipe(dest(path.build.css))
    .pipe(cleanCss())
    .pipe(
      rename({
        extname: ".min.css"
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function watchFiles(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images),
  gulp.watch(["/iconsprite/*.svg"], svg);
}


let build = gulp.series(clean, gulp.parallel(js, css, html, svg, images));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;