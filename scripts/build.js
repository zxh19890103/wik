const path = require('path');
const fs = require('fs');
const dtsG = require('dts-generator');

const { join } = path;

const stage = process.argv[2].slice(8);

const devPkg = require('../package.json');
const pubPkg = require('../.npm/package.json');

console.log('--stage--', stage);

const rootPath = join(__dirname, '../');
const distPath = join(rootPath, './dist');

const pre = () => {
  if (!fs.existsSync(distPath)) return;

  fs.rm(distPath, { recursive: true }, (err) => {
    if (err) throw err;
    console.log(`${distPath} removed!`);
  });
};

const post = () => {
  dtsG({
    name: 'hrGraphic',
    project: path.join(__dirname, '../'),
    out: 'hrGraphic.d.ts',
  });

  pubPkg.version = devPkg.version;

  fs.writeFileSync(join(distPath, './package.json'), JSON.stringify(pubPkg, '  \n'));

  // copy d.ts files
  // for (const file of ['global.d.ts', 'lib.d.ts']) {
  //   fs.copyFileSync(join(rootPath, file), join(distPath, file));
  // }

  // Copy assets like css/image.
  copyInFolder('2d');
  copyInFolder('3d');
  copyInFolder('dom');
  copyInFolder('mixins');
  copyInFolder('model');
  copyInFolder('utils');

  console.log('Now you should come in ./dist folder and run `npm publish`');
};

const ASSET_FILE_END_WITH_PATTERN = /.(css|scss|svg|png|gif|jpg|jpeg)$/;

const copyInFolder = (folder) => {
  const dir = fs.opendirSync(join(rootPath, folder));

  /**
   * @type {fs.Dirent}
   */
  let ent = null;

  while ((ent = dir.readSync())) {
    if (ent.isDirectory()) {
      copyInFolder(folder + '/' + ent.name);
    } else if (ent.isFile() && ASSET_FILE_END_WITH_PATTERN.test(ent.name)) {
      const destDir = join(distPath, folder);
      const dest = join(destDir, ent.name);

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir);
      }

      const src = join(rootPath, folder, ent.name);
      fs.copyFileSync(src, dest);
    }
  }
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
