const path = require('path');
const ssh2 = require('ssh2');
const { traverse } = require('./traverse');

const client = new ssh2.Client();

/**
 * @todo
 * 未完成
 */
// hairou@172.20.8.54:/data/workspace/essp-editor-doc

client
  .on('ready', () => {
    client.sftp((err, sftp) => {
      if (err) throw err;
      const context = path.join(__dirname, '../doc');
      const remoteContext = '/data/workspace/hrgui-doc';

      let rpath = null;
      let file = null;
      let total = 0;

      const dir_has = {};

      const put = () => {
        const localFile = path.join(context, file);
        const remoteFile = rpath;

        total--;
        console.log('uploaded:', remoteFile);
        if (total === 0) console.log('completed');

        // sftp.fastPut(localFile, remoteFile, {}, (err) => {
        //   total--;
        //   if (err) throw err;
        //   console.log('uploaded:', remoteFile);
        //   if (total === 0) {
        //     console.log('completed');
        //   }
        // });
      };

      traverse(
        context,
        (_file) => {
          file = _file;
          rpath = path.join(remoteContext, _file);
          const rdirname = path.dirname(rpath);

          dir_has[rdirname] = true;

          console.log('is dir existing?', rdirname);

          sftp.exists(rdirname, (has) => {
            if (has) {
              put();
              return;
            }

            sftp.mkdir(rdirname, put);
          });
        },
        (_total) => {
          total = _total;
          console.log('total:', _total);
        },
      );
    });
  })
  .connect({
    host: '172.20.8.54',
    password: 'hairou',
    username: 'hairou',
  });
