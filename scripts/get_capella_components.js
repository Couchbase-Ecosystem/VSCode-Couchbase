const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const recast = require('recast');
const parser = require('@babel/parser');
const { execSync } = require('child_process');
const readlineSync = require('readline-sync');
const { ENOENT } = require('constants');
const { constants } = require('buffer');

const pathToCapella = '../couchbase-cloud/cmd/cp-ui-v3/src/';
const sourceDirs = ['components/data-table'];
const destinationPath = 'src/reactViews/app';

// Excluded file extensions
const excludedExtensions = ['.stories.tsx', '.stories.ts', '.test.tsx', '.test.ts'];

// Function to recursively create directories
const createDirectories = (source, directory) => {
  const parentDir = path.dirname(directory);
  if (!fs.existsSync(parentDir)) {
    createDirectories(parentDir);
  }
  if (!fs.existsSync(directory)) {
    if(!fs.statSync(source).isFile()) {
      fs.mkdirSync(directory);
    }
  }
};

// Function to recursively copy directories and files
const copyDirectory = (source, destination) => {
try{
   if(doesFileExist(source) && !fs.existsSync(destination))
   {
     // Create the parent destination directory if it doesn't exist
     const parentDir = path.dirname(destination);
     if (!fs.existsSync(parentDir)) {
       fs.mkdirSync(parentDir, { recursive: true });
     }
   }
   else if (!fs.existsSync(destination)) {
  fs.mkdirSync(destination, { recursive: true });
}

  // Read the contents of the source directory
  if(fs.statSync(source).isFile()) {
    if (!excludedExtensions.some((ext) => source.endsWith(ext))) {
      // If not excluded, copy the file to the destination directory
      fs.copyFileSync(source, destination);
      analyzeImports(source);
    }
    return;
  }
  const files = fs.readdirSync(source);

  // Loop through the files and directories in the source directory
  files.forEach((file) => {
    const sourceFilePath = path.join(source, file);
    const destinationFilePath = path.join(destination, file);

    // Check if the current item is a file or directory
    const isDirectory = fs.statSync(sourceFilePath).isDirectory();

    if (isDirectory) {
      // If it's a directory, recursively copy its contents
      copyDirectory(sourceFilePath, destinationFilePath);
    } else {
      if (!excludedExtensions.some((ext) => sourceFilePath.endsWith(ext))) {
        // If not excluded, copy the file to the destination directory
        fs.copyFileSync(sourceFilePath, destinationFilePath);
        analyzeImports(sourceFilePath, destinationFilePath);
      }
    }
  });
} catch(err)
{
  console.log(err);
}
};

const componentImports = [];
const componentImported = [];
const externalDependencies = [];


const doesFileExist = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return stats.isFile(); // Returns true if it's a file, false if it's a directory or does not exist.
  } catch (err) {
    return false; // File does not exist or there was an error accessing it.
  }
};

const isLastTwoComponentsSame = (pathString) => {
  const components = pathString.split('/');
  if (components.length < 2) {return false;}
  const lastComponent = components.pop();
  const secondLastComponent = components.pop();
  return lastComponent === secondLastComponent;
};

// Function to read file and analyze import statements
const analyzeImports = (filePath, destinationPath) => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const ast = ts.createSourceFile(filePath, fileContent, ts.ScriptTarget.Latest, true);

  const visitNode = (node) => {
    if (ts.isImportDeclaration(node)) {
      let importPath = node.moduleSpecifier.text;

      if(isLastTwoComponentsSame(importPath))
      {
        importPath = path.dirname(importPath);
      }
      const sourceComponentPath = path.join(pathToCapella, importPath + ".ts");
      if(doesFileExist(sourceComponentPath))
      {
        const directoryName = path.dirname(importPath);
        if(directoryName === "utils" || directoryName === "constants" || directoryName === "types" || directoryName === "error" || directoryName === "sync" ) {
          importPath = importPath + ".ts";
        }
        else {
        importPath = path.dirname(importPath);
        }
      }
      if (importPath.startsWith('components') || importPath.startsWith('hooks') || importPath.startsWith('types') || importPath.startsWith('utils') || importPath.startsWith('sync') || importPath.startsWith('.') || importPath.startsWith('constants') || importPath.startsWith('error')) {
        if(importPath.startsWith('.'))
        {
        }
        else if((importPath.endsWith('utils') && !importPath.startsWith('utils')) || importPath.endsWith('types') && !importPath.startsWith('types'))
        {
          if(doesFileExist(path.join(destinationPath, importPath)))
          {}
          else{
            const parentDir = path.dirname(importPath);
            if(!componentImports.includes(parentDir) && !componentImported.includes(parentDir))
            {
              componentImports.push(parentDir);
            }
          }
        }

        // Component import
        else if(!componentImports.includes(importPath) && !componentImported.includes(importPath)) {
          componentImports.push(importPath);
        }
      } else {
        // External dependency import
        if(!externalDependencies.includes(importPath))
        {
          externalDependencies.push(importPath);
        }
       
      }
    }

    ts.forEachChild(node, visitNode);
  };

  visitNode(ast);

  return { componentImports, externalDependencies };
};

// Function to install dependencies in destination
const installDependencies = (dependencies) => {
  dependencies.forEach((dependency) => {
    try {
      // Check if the dependency is already installed in the destination
      execSync(`npm list ${dependency} --depth 0`, { stdio: 'ignore' });

      // If the dependency is already installed, log it and skip installation
      console.log(`${dependency} is already installed in the destination.`);
    } catch (err) {
      // If the dependency is not installed, get the version from the source package.json
      const sourcePackageJsonPath = path.join(pathToCapella, '../package.json');
      const sourcePackageJson = JSON.parse(fs.readFileSync(sourcePackageJsonPath, 'utf8'));
      const version = sourcePackageJson.dependencies[dependency];

      if (version) {
        // Install the dependency with the specified version
        console.log(`Installing ${dependency}@${version} in the destination...`);
        execSync(`npm install ${dependency}@${version}`, { stdio: 'inherit' });
      } else {
        console.log(`Dependency ${dependency} not found in the source package.json. Skipping installation.`);
      }
    }
  });
};

// Call the copyDirectory function for each source directory
sourceDirs.forEach((sourceDir) => {
  const sourcePath = path.join(pathToCapella, sourceDir);
  // Get the base directory name from the source path

  const baseDirectoryName = path.basename(sourcePath);
  if (!fs.existsSync(destinationPath + '/components')) {
      fs.mkdirSync(destinationPath + '/components');
    }
  // Create the destination directory if it doesn't exist
  const destinationDir = path.join(destinationPath, '/components/', baseDirectoryName);
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir);
  }

  // Copy files and analyze imports
  copyDirectory(sourcePath, destinationDir);
  const destinationFiles = fs.readdirSync(destinationDir);
  destinationFiles.forEach((file) => {
    const filePath = path.join(destinationDir, file);

    // Run copyDirectory for each component import
    while(componentImports.length !== 0) {
      const importPath = componentImports.pop();
      if(importPath === ".")
      {
        console.log("HERE");
        continue;
      }
      componentImported.push(importPath);
      const sourceComponentPath = path.join(pathToCapella, importPath);
      const destinationComponentPath = path.join(destinationPath, importPath);
      if((!importPath.startsWith('utils') && sourceComponentPath.endsWith('utils')) || (sourceComponentPath.endsWith('types') && !importPath.startsWith('types')))
      {
        copyDirectory(sourceComponentPath + '.ts', destinationComponentPath + '.ts');
      }
      else {
        copyDirectory(sourceComponentPath, destinationComponentPath);
      }
      
    }
  });
      // Install dependencies in destination
      installDependencies(externalDependencies);
      removeStarAsFromFile(destinationPath + "/utils/dayjs.ts");
      fixTypeIssue(destinationPath + "/utils/bytes/bytes.utils.ts");
      
});

function fixTypeIssue(filePath) {
  // Read the content of the file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
    } else {
      // Remove * as from the content
      let updatedContent = data.replace(`opts.outputUnit && (isBinaryUnit(opts.outputUnit) ? 'binary' : 'decimal');`, `(opts.outputUnit && (isBinaryUnit(opts.outputUnit) ? 'binary' : 'decimal')) || undefined`);
      updatedContent = updatedContent.replace(`opts.outputUnit && toByteUnit(opts.outputUnit)`, `(opts.outputUnit && toByteUnit(opts.outputUnit)) || undefined`);
      // Write the updated content back to the file
      fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
        if (err) {
          console.error(`Error writing to file ${filePath}:`, err);
        } else {
          console.log(`Type Error resolved`);
        }
      });
    }
  });
}


function removeStarAsFromContent(content) {
  // Regular expression to remove * as from the content
  return content.replace(/\* as /g, '');
}

function removeStarAsFromFile(filePath) {
  // Read the content of the file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
    } else {
      // Remove * as from the content
      const updatedContent = removeStarAsFromContent(data);

      // Write the updated content back to the file
      fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
        if (err) {
          console.error(`Error writing to file ${filePath}:`, err);
        } else {
          console.log(`Removed * as from ${filePath}.`);
        }
      });
    }
  });
}
