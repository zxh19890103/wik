const path = require('path');
const fs = require('fs');

const { join } = path;

const stage = process.argv[2].slice(8);

const devPkg = require('../package.json');
const tsConfig = require('../tsconfig.prod.json');

const rootPath = join(__dirname, '../');
const npmPath = join(__dirname, '../.npm');
const srcPath = join(__dirname, '../src');

const distPath = join(rootPath, tsConfig.compilerOptions.outDir);
const pubPkg = require(join(npmPath, './package.json'));

/**
 * remove dist folder.
 */
const pre = () => {
  if (!fs.existsSync(distPath)) return;

  fs.rm(distPath, { recursive: true }, (err) => {
    if (err) throw err;
    console.log(`${distPath} removed!`);
  });
};

/**
 * use vite and tsc
 */
const post = () => {
  // package file
  pubPkg.version = devPkg.version;
  pubPkg.name = devPkg.name;

  fs.writeFileSync(join(distPath, './package.json'), JSON.stringify(pubPkg, '  \n'));

  // other files in .npm
  for (const file of [
    '.npm/.npmrc',
    './LICENSE',
    './README.md',
    'src/lib.d.ts',
    'src/lib.internal.d.ts',
  ]) {
    fs.copyFileSync(join(rootPath, file), join(distPath, file.split('/')[1]));
  }

  console.log('Open ./dist folder and run `npm publish`');
};

const main = () => {
  console.log('--stage--', stage);

  switch (stage) {
    case 'pre': {
      pre();
      break;
    }
    case 'post': {
      post();
      break;
    }
  }
};

main();
