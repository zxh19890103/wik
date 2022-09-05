const path = require('path');
const fs = require('fs');
const stage = process.argv[2].slice(8);

const devPkg = require('../package.json');
const pubPkg = require('../.npm/package.json');

console.log('--stage--', stage);

const rootPath = path.join(__dirname, '../');
const distPath = path.join(rootPath, './dist');

const pre = () => {
  if (!fs.existsSync(distPath)) return;

  fs.rm(distPath, { recursive: true }, (err) => {
    if (err) throw err;
    console.log(`${distPath} removed!`);
  });
};

const post = () => {
  pubPkg.version = devPkg.version;

  fs.writeFileSync(path.join(distPath, './package.json'), JSON.stringify(pubPkg, '  \n'));

  for (const file of ['global.d.ts', 'lib.d.ts']) {
    fs.copyFileSync(path.join(rootPath, file), path.join(distPath, file));
  }

  console.log('Now you should come in ./dist folder and run `npm publish`');
};

const main = () => {
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
