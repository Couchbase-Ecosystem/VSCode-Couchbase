const fsp = require('fs').promises;

async function main() {
  try {
    const filename = './node_modules/couchbase/CMakeLists.txt';
    let contents = await fsp.readFile(filename, 'utf-8');

    // Fix CMake policy version for compatibility with CMake 3.30+
    // This must be set before cmake_minimum_required() in dependencies like snappy
    console.log('Setting CMAKE_POLICY_VERSION_MINIMUM for CMake 3.30+ compatibility');
    if (!contents.includes('CMAKE_POLICY_VERSION_MINIMUM')) {
      contents = 'set(CMAKE_POLICY_VERSION_MINIMUM 3.5)\n' + contents;
    }

    // Disable OpenSSL dynamic linking
    console.log('Disabling OpenSSL dynamic linking');
    contents = contents.replace(/COUCHBASE_CXX_CLIENT_POST_LINKED_OPENSSL ON/g, 'COUCHBASE_CXX_CLIENT_POST_LINKED_OPENSSL OFF');
    
    await fsp.writeFile(filename, contents);
  } catch (err) {
    console.log(err);
  }
}

main();
