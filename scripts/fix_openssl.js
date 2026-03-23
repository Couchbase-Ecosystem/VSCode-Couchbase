const fsp = require('fs').promises;

async function main() {
  try {
    const cmakeListsFilename = './node_modules/couchbase/CMakeLists.txt';
    let contents = await fsp.readFile(cmakeListsFilename, 'utf-8');

    // Fix CMake policy version for compatibility with CMake 3.30+
    // This must be set before cmake_minimum_required() in dependencies like snappy
    console.log('Setting CMAKE_POLICY_VERSION_MINIMUM for CMake 3.30+ compatibility');
    if (!contents.includes('CMAKE_POLICY_VERSION_MINIMUM')) {
      contents = 'set(CMAKE_POLICY_VERSION_MINIMUM 3.5)\n' + contents;
    }

    // Disable OpenSSL dynamic linking
    console.log('Disabling OpenSSL dynamic linking');
    contents = contents.replace(/COUCHBASE_CXX_CLIENT_POST_LINKED_OPENSSL ON/g, 'COUCHBASE_CXX_CLIENT_POST_LINKED_OPENSSL OFF');

    await fsp.writeFile(cmakeListsFilename, contents);

    const openSslCmakeFilename = './node_modules/couchbase/deps/couchbase-cxx-client/cmake/OpenSSL.cmake';
    let openSslCmakeContents = await fsp.readFile(openSslCmakeFilename, 'utf-8');

    // Guard against empty date extraction from the Mozilla CA bundle metadata.
    // If this value is empty, build_config.hxx leaves the macro undefined and MSVC build fails.
    const dateExtractionLine = '  set(COUCHBASE_CXX_CLIENT_MOZILLA_CA_BUNDLE_DATE "${CMAKE_MATCH_1}")';
    const dateFallbackBlock =
      '  set(COUCHBASE_CXX_CLIENT_MOZILLA_CA_BUNDLE_DATE "${CMAKE_MATCH_1}")\n' +
      '  if(NOT COUCHBASE_CXX_CLIENT_MOZILLA_CA_BUNDLE_DATE)\n' +
      '    set(COUCHBASE_CXX_CLIENT_MOZILLA_CA_BUNDLE_DATE "unknown")\n' +
      '  endif()';

    if (openSslCmakeContents.includes(dateExtractionLine) && !openSslCmakeContents.includes('COUCHBASE_CXX_CLIENT_MOZILLA_CA_BUNDLE_DATE "unknown"')) {
      console.log('Patching OpenSSL.cmake with Mozilla CA bundle date fallback');
      openSslCmakeContents = openSslCmakeContents.replace(dateExtractionLine, dateFallbackBlock);
      await fsp.writeFile(openSslCmakeFilename, openSslCmakeContents);
    }
  } catch (err) {
    console.log(err);
  }
}

main();