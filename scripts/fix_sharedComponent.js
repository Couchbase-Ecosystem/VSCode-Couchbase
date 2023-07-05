const fs = require('fs-extra');

const filePath = 'src/reactViews/app/types/sharedComponents.d.ts';

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file: ${err}`);
    return;
  }

  // FIX: Removing the const keyword, the type parameter declaration becomes valid
  const updatedContent = data.replace(`TabBarMenu<const T extends string>`, 'TabBarMenu<T extends string>');

  fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing file: ${err}`);
      return;
    }
  });
});