// const ASSET_FILE_END_WITH_PATTERN = /.(css|scss|svg|png|gif|jpg|jpeg)$/;

// const copyInFolder = (folder) => {
//   const dir = fs.opendirSync(join(rootPath, folder));

//   /**
//    * @type {fs.Dirent}
//    */
//   let ent = null;

//   while ((ent = dir.readSync())) {
//     if (ent.isDirectory()) {
//       copyInFolder(folder + '/' + ent.name);
//     } else if (ent.isFile() && ASSET_FILE_END_WITH_PATTERN.test(ent.name)) {
//       const destDir = join(distPath, folder);
//       const dest = join(destDir, ent.name);

//       if (!fs.existsSync(destDir)) {
//         fs.mkdirSync(destDir);
//       }

//       const src = join(rootPath, folder, ent.name);
//       fs.copyFileSync(src, dest);
//     }
//   }
// };
