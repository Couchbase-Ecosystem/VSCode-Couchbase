const fsp = require('fs').promises;
const spawn = require('child_process').spawn;
const path = require('path');

async function rebuildBinding() {
    return new Promise((resolve, reject) => {
        let child = spawn(
            path.resolve('./node_modules/.bin/cmake-js'),
            ['rebuild', '-d', 'node_modules/couchbase', '-r', 'electron', '-v', '19.1.8'],
            { shell: true, stdio: 'inherit' }
        );

        child.on('error', reject);
        child.on('exit', (code) => code === 0 ? resolve() : reject(code));
    });
}

async function main() {
  try {
    // Disable OpenSSL dynamic linking
    console.log('Disabling OpenSSL dynamic linking');
    const filename = './node_modules/couchbase/CMakeLists.txt';
    const contents = await fsp.readFile(filename, 'utf-8');
    const replaced = contents.replace(/COUCHBASE_CXX_CLIENT_POST_LINKED_OPENSSL ON/g, 'COUCHBASE_CXX_CLIENT_POST_LINKED_OPENSSL OFF');
    await fsp.writeFile(filename, replaced);

    // Rebuild Couchbase SDK binding file using cmake-js targeting electron
    console.log('Rebuilding binding file fo Electron');
    await rebuildBinding();

    // Copy binding file to local directory so it's included in VSCE package
    console.log('Copying new binding file to local directory');
    await fsp.mkdir('./build');
    await fsp.copyFile('./node_modules/couchbase/build/Release/couchbase_impl.node', './build/couchbase_impl.node');
  } catch (err) {
    console.log(err);
  }
}

main();
