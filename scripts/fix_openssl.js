const fsp = require('fs').promises;

async function main() {
  try {
    // Disable OpenSSL dynamic linking
    console.log('Disabling OpenSSL dynamic linking');
    const filename = './node_modules/couchbase/CMakeLists.txt';
    const contents = await fsp.readFile(filename, 'utf-8');
    const replaced = contents.replace(/COUCHBASE_CXX_CLIENT_POST_LINKED_OPENSSL ON/g, 'COUCHBASE_CXX_CLIENT_POST_LINKED_OPENSSL OFF');
    await fsp.writeFile(filename, replaced);
  } catch (err) {
    console.log(err);
  }
}

main();
