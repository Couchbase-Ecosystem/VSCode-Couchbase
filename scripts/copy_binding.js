const fsp = require('fs').promises;

async function main() {
  try {
    // Copy binding file to local directory so it's included in VSCE package
    console.log('Copying new binding file to local directory');
    await fsp.mkdir('./build');
    await fsp.copyFile('./node_modules/couchbase/build/Release/couchbase_impl.node', './build/couchbase_impl.node');
  } catch (err) {
    console.log(err);
  }
}

main();
