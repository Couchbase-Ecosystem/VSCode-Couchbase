const fsp = require('fs').promises;

async function main() {
    try {
      // Copy binding file to local directory so it's included in VSCE package
      console.log('Copying secrets to dist');
      await fsp.mkdir('./dist', { recursive: true }).then(() => fsp.copyFile('./src/config.json', './dist/config.json'));
    } catch (err) {
      console.log(err);
    }
  }
  
  main();
  