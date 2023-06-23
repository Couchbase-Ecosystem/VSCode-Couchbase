const comment = '//';

const file = require('fs').readFileSync('dist/reactBuild.js', 'utf8');

const lines = file.split('\n');

const newLines = lines.map((line) => {
  if (line === 'module.exports = __webpack_exports__;') {
    return comment + line;
  } else {
    return line;
  }
});

const newFile = newLines.join('\n');

require('fs').writeFileSync('dist/reactBuild.js', newFile, 'utf8');