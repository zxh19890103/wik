const path = require('path');
const fs = require('fs');

const folder = path.join(__dirname, '../src/2d/images');

const outfile = path.join(folder, './index.ts');

const tsfile = fs.createWriteStream(outfile, { encoding: 'utf-8' });

const files = fs.readdirSync(folder).filter((x) => x.endsWith('.svg'));

const names = [];
// imports
for (const file of files) {
  const name = 'SVG_' + file.replace(/[-+]/g, '_').replace(/.svg$/, '').toUpperCase();
  names.push(name);
  tsfile.write(`import ${name} from './${file}';\n`);
}

// exports
tsfile.write('export {\n');
for (const name of names) {
  tsfile.write(`  ${name},\n`);
}
tsfile.write('};\n');
