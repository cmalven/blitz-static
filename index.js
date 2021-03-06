#! /usr/bin/env node
require('dotenv').config();
const fs = require('fs-extra');
const chalk = require('chalk');
const shell = require('shelljs');
const Crawler = require('simplecrawler');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const replace = require('gulp-replace');

//
//   Vars
//
//////////////////////////////////////////////////////////////////////

const webPath = process.cwd() + '/web';
const blitzCachePath = webPath + '/cache/blitz';
const webToCopy = [
  'dist',
  'favicons',
  'fonts',
  '.htaccess',
  'robots.txt'
];
let cacheDir = null;


//
//   Basic instructions
//
//////////////////////////////////////////////////////////////////////

const intro = () => {
  console.log(chalk.yellow(`For this to work, ensure that you have blitz caching enabled and dev mode disabled.`));
};


//
//   Clear the cache
//
//////////////////////////////////////////////////////////////////////

const build = () => {
  console.log(chalk.cyan(`Running build processes…`));
  shell.exec('NODE_ENV=production yarn build');
};


//
//   Clear the cache
//
//////////////////////////////////////////////////////////////////////

const blitzRefresh = () => {
  console.log(chalk.cyan(`Clearing Blitz cache…`));
  shell.exec('./craft clear-caches/seomatic-frontendtemplate-caches');
  shell.exec('./craft blitz/cache/clear');
  shell.exec('./craft blitz/cache/flush');
  shell.exec('./craft blitz/cache/purge');
};


//
//   Refresh the cache
//
//////////////////////////////////////////////////////////////////////

const crawl = () => {
  console.log(chalk.cyan(`Crawling site to generate new cache…`));
  return new Promise((res, rej) => {
    const c = new Crawler(process.env.APP_SITE_URL);
    c.respectRobotsTxt = false;
    c.on('complete', function() {
      res();
    }); 
    c.start();
  });
}


//
//   Copy Blitz caches 
//
//////////////////////////////////////////////////////////////////////

const copyCaches = () => {
  console.log(chalk.cyan(`Copying cache files…`));
  try {
    const cacheDirList = fs.readdirSync(blitzCachePath);
    cacheDir = cacheDirList[0];
  }
  catch {
    return console.log(chalk.red('Blitz caches are empty. ' + chalk.cyan('Make sure you’ve generated blitz caches.')));
  }
  const caches = blitzCachePath + '/' + cacheDir;
  return gulp.src(blitzCachePath + '/' + cacheDir + '/**/*.html')
    .pipe(replace(process.env.APP_SITE_URL, ''))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(process.cwd() + '/' + cacheDir));
}


//
//   Copy all other assets
//
//////////////////////////////////////////////////////////////////////

const copyAssets = () => {
  console.log(chalk.cyan(`Copying default assets…`));
  fs.copySync(__dirname + '/templates', process.cwd() + '/' + cacheDir);

  console.log(chalk.cyan(`Copying other assets…`));
  webToCopy.forEach(item => {
    try {
       fs.copySync(webPath + '/' + item, process.cwd() + '/' + cacheDir + '/' + item);
    }
    catch {}
  });
}


//
//   Success
//
//////////////////////////////////////////////////////////////////////

const finish = () => {
  console.log(chalk.green(`All done!`));
}


//
//   Process
//
//////////////////////////////////////////////////////////////////////

async function all() {
  intro();
  build();
  blitzRefresh();
  await crawl();
  copyCaches();
  copyAssets();
  finish();
}
all();