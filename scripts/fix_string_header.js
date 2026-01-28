const fsp = require('fs').promises;
const path = require('path');

async function main() {
  try {
    const filename = path.join(__dirname, '../node_modules/couchbase/deps/couchbase-cxx-client/core/platform/string_hex.h');
    console.log(`Fixing string header in: ${filename}`);
    
    let contents = await fsp.readFile(filename, 'utf-8');

    // Check if <string> is already included
    if (!contents.includes('#include <string>')) {
      console.log('Adding #include <string> to string_hex.h for MSVC compatibility');
      
      // Find the first #include directive and add <string> after it
      // or add it after the header guard/pragma once
      if (contents.includes('#pragma once')) {
        contents = contents.replace('#pragma once', '#pragma once\n#include <string>');
      } else if (contents.match(/#ifndef.*\n#define.*\n/)) {
        // Handle traditional header guards
        contents = contents.replace(/(#ifndef.*\n#define.*\n)/, '$1#include <string>\n');
      } else {
        // Fallback: add at the beginning
        contents = '#include <string>\n' + contents;
      }
      
      await fsp.writeFile(filename, contents);
      console.log('Successfully patched string_hex.h');
    } else {
      console.log('string_hex.h already includes <string>');
    }
  } catch (err) {
    console.log('Error patching string_hex.h:', err.message);
    console.log('This is expected if npm install has not been run yet.');
  }
}

main();
