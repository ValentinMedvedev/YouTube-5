//Подключаем gulp
const {src, dest, watch, parallel, series} = require('gulp');
//подключаем транслятор с SCSS в CSS
const scss = require('gulp-sass')(require('sass'));
//изменяем имя файла
const concat = require('gulp-concat');
//добавляем префиксы для старых браузеров
const autoprefixer = require('gulp-autoprefixer');
//минифицирует js файлы, сжимая его
const uglify = require('gulp-uglify');
//Оптимизируем картинки
const imagemin = require('gulp-imagemin');
//Плагин очистки папки
const del = require('del');
//подключаем движок для обновления браузера
const browserSync = require('browser-sync').create();


function browsersync(){
    browserSync.init({
        server: {
            baseDir: 'app/'
        },
        port: 3000,
        notify:false, //без уведомлений
        open: true
    });
}

function styles() {
    return src('app/scss/style.scss')
        //конвентарция из scss в css
        //[
            //объединяем несколько css файлов в один, все указваем здесь
         //   'app/scss/style.scss',
        //]
        //)
        //.pipe(scss({outputStyle: 'expanded'}))
        //.pipe(scss({outputStyle: 'composser'}))
        .pipe(scss())
        //переименовываем выходной файл в style.min.css
        .pipe(concat('style.min.css'))
        //Вносим префиксы
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        //сохраняем в файл app/css/style.css
        .pipe(dest('app/css'))
        // .pipe(browserSync.reload())
        //Добавление css стилей, без перезагрузки страницы
        .pipe(browserSync.stream());
        // .pipe(browserSync.reload({ stream:true }));
}

function scripts() {
    return src([
        //объединяем несколько css файлов в один, все указваем здесь
        'node_modules/jquery/dist/jquery.js',
        'node_modules/slick-carousel/slick/slick.js',
        'app/js/main.js'
    ])
    //Изменяем имя файла на 'main.min.js'
    .pipe(concat('main.min.js'))
    //минифицированный файл 'main.min.js'
    .pipe(uglify())
    //сохраняем минифицированный файл js в 'app/js'
    .pipe(dest('app/js'))
    // .pipe(browserSync.reload({ stream:true }));// или .pipe(browsersync.reload())
    .pipe(browserSync.stream());
}

function images(){
    return src('app/images/**/*.*')
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(dest('dist/images'))
}

//переносим в папку dist финальные файлы
function build() {
    return src([
        'app/**/*.html',
        'app/css/style.min.css',
        'app/js/main.min.js',
    ], {base: 'app'})
    .pipe(dest('dist'))
}

function cleanDist() {
    return del('dist')
}

//функция слежения за изменениями в файлах, за которыми идет наблюдение
function watching() {
    //следим за всеми каталогами и файлами scss в папке 'app/scss/' и при изменениях запускаем exports.styles = styles;
    watch(['app/scss/**/*.scss'], styles);
    //следим за всеми каталогами и файлами js в папке 'app/js/' кроме файла '!app/js/main.min.js' и при изменениях запускаем exports.scripts = scripts;
    watch(['app/js/**/*.js','!app/js/main.min.js'], scripts);
    //при изменении html файлов обязательно перегружаем страницу
    watch(['app/**/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, build);

//Задача запускаемая по умолчанию
exports.default = parallel(styles, scripts,  watching, browsersync);