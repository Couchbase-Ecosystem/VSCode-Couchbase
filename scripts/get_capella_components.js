const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const recast = require('recast');
const parser = require('@babel/parser');
const { execSync } = require('child_process');
const readlineSync = require('readline-sync');
const { ENOENT } = require('constants');

const pathToCapella = '../couchbase-cloud/cmd/cp-ui-v3/src/';
const sourceDirs = ['components/query-results'];
const destinationPath = 'src/reactViews/app';

// Excluded file extensions
const excludedExtensions = ['.stories.tsx', '.test.tsx', '.test.ts'];

// Function to recursively create directories
const createDirectories = (directory) => {
  const parentDir = path.dirname(directory);
  if (!fs.existsSync(parentDir)) {
    createDirectories(parentDir);
  }
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
};

// Function to recursively copy directories and files
const copyDirectory = (source, destination) => {
  // Create the destination directory if it doesn't exist
  try{
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }
} catch(err) {
    createDirectories(destination);
    copyDirectory(source, destination);
}

  // Read the contents of the source directory
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
      }
    }
  });
};

// Function to read file and analyze import statements
// Function to read file and analyze import statements
const analyzeImports = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const ast = ts.createSourceFile(filePath, fileContent, ts.ScriptTarget.Latest, true);

  const componentImports = [];
  const externalDependencies = [];

  const visitNode = (node) => {
    if (ts.isImportDeclaration(node)) {
      const importPath = node.moduleSpecifier.text;
      if (importPath.startsWith('components') || importPath.startsWith('hooks')) {
        // Component import
        componentImports.push(importPath);
      } else if(!importPath.startsWith('types')){
        // External dependency import
        externalDependencies.push(importPath);
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
    const { componentImports, externalDependencies } = analyzeImports(filePath);

    // Run copyDirectory for each component import
    componentImports.forEach((importPath) => {
      const sourceComponentPath = path.join(pathToCapella, importPath);
      const destinationComponentPath = path.join(destinationPath, importPath);
      console.log(destinationComponentPath);
      copyDirectory(sourceComponentPath, destinationComponentPath);
    });

    // Install dependencies in destination
    installDependencies(externalDependencies);
  });
});
