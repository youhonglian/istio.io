const { promisify } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
var _ = require('lodash');
const chalk = require('chalk');

// 获取所有子文件
async function getFiles(dir) {
  try {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
      const res = resolve(dir, subdir);
      const stats = await stat(res);
      return stats.isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
  } catch (e) {
    return [];
  }
}

// 获取更新时间
async function getMtime(file) {
  const regx = /\/en\//;
  const zh_file = file.replace(regx, '/zh/');
  let en_file_mtime = 0;
  let zh_file_mtime = 0;
  try {
    const en_stats = await stat(file);
    en_file_mtime = _.get(en_stats, 'mtimeMs');
    const zh_stats = await stat(zh_file);
    zh_file_mtime = _.get(zh_stats, 'mtimeMs');
    if (en_file_mtime > zh_file_mtime) {
      console.log(chalk.blue(`${file}` ), chalk.red('已过时'));
    }
  } catch (e) {
    // console.log(`出错: ${e}`);
  }
}

getFiles('./en')
  .then(files => files.forEach(file => getMtime(file)))
  .catch(e => console.error(e));
