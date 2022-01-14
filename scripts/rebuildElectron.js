const rebuild = require('electron-rebuild').default;
const fs = require("fs");
const fsp = require("fs/promises");
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

Promise.resolve()
  .then(_ => {
    return rebuild({
      buildPath: ROOT_DIR,
      electronVersion: '13.5.1'
    });
  })
  .then(_ => {
    if (!fs.existsSync(`${ROOT_DIR}/build/couchbase_impl.node`)) {
      return fsp.mkdir(path.dirname(`${ROOT_DIR}/build/couchbase_impl.node`));
    }
    return Promise.resolve();
  })
  .then(_ => {
    return fsp.copyFile(`${ROOT_DIR}/node_modules/couchbase/build/Release/couchbase_impl.node`, `${ROOT_DIR}/build/couchbase_impl.node`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(-1);
  });
