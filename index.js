#! /usr/bin/env node
require('dotenv').config();
const fs = require('fs-extra');
const chalk = require('chalk');
const shell = require('shelljs');
var Crawler = require('simplecrawler');
const replace = require('replace-in-file');

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
  '.htaccess'
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
  fs.copySync(caches, process.cwd() + '/' + cacheDir);
}


//
//   Replace URLs
//
//////////////////////////////////////////////////////////////////////

const updateUrls = () => {
  console.log(chalk.cyan(`Updating URLs…`));
  try {
    const regex = new RegExp(process.env.APP_SITE_URL, 'g');
    const results = replace.sync({
      files: process.cwd() + '/' + cacheDir + '/**/*',
      from: regex,
      to: '',
    });
  }
  catch (error) {
    console.log(chalk.red(`An error occured when crawling the site.`));
  }
}


//
//   Copy all other assets
//
//////////////////////////////////////////////////////////////////////

const copyAssets = () => {
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
  updateUrls();
  finish();
}
all();