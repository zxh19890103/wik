const fs = require('fs');
const { join } = require('path');

/**
 * @type {Array<string>}
 */
const currContext = [];
let depth = 0;
let total = 0;

/**
 * @param {string} dir absolute directory path
 * @param {(file: string) => void} onFile
 * @param {(total: number) => void} onComplete
 */
const traverse = (dir, onFile, onComplete) => {
  const fsDir = fs.opendirSync(dir);
  /**
   * @type {fs.Dirent}
   */
  let ent = null;
  const currContextStr = currContext.join('/');

  while ((ent = fsDir.readSync())) {
    if (ent.isFile()) {
      onFile(`${currContextStr}/${ent.name}`);
      total += 1;
    } else if (ent.isDirectory()) {
      currContext.push(ent.name);
      depth++;
      traverse(join(dir, ent.name), onFile);
      depth--;
      currContext.pop();
    }
  }

  if (depth === 0) {
    onComplete && onComplete(total);
    total = 0;
  }

  fsDir.closeSync();
};

module.exports = {
  traverse,
};
