const fs = require('fs');
const path = require('path');

const srcDir = process.argv[2]; // First argument for src directory
const destFile = process.argv[3]; // Second argument for destination file
const ignoreDirsArg = process.argv[4]; // Third argument for directories to ignore

if (!srcDir || !destFile) {
  console.error(
    'Please provide both a source directory and a destination file.',
  );
  process.exit(1);
}

// Directories to ignore, split by comma and trimmed of whitespace
const ignoreDirs = ignoreDirsArg
  ? ignoreDirsArg.split(',').map((dir) => dir.trim())
  : [];

// Helper function to check if a path is a directory
const isDirectory = (source) => fs.lstatSync(source).isDirectory();

// Helper function to get all files recursively from a directory
const getFilesRecursively = (directory) => {
  const files = fs.readdirSync(directory);
  let allFiles = [];

  files.forEach((file) => {
    const fullPath = path.join(directory, file);

    // Check if the current directory is in the ignore list
    if (isDirectory(fullPath) && ignoreDirs.includes(path.basename(fullPath))) {
      return; // Skip this directory
    }

    if (isDirectory(fullPath)) {
      allFiles = allFiles.concat(getFilesRecursively(fullPath)); // Recurse for subdirectories
    } else {
      allFiles.push(fullPath);
    }
  });

  return allFiles;
};

// Function to append the content of each file into the destination file
const appendFilesToDest = (files, dest) => {
  let output = '';

  files.forEach((file) => {
    const relativePath = path.relative(srcDir, file); // Get the relative path for commenting
    const fileContent = fs.readFileSync(file, 'utf8');

    // Append the filename as a comment, then the file content
    output += `// ${relativePath}\n`;
    output += `\n${fileContent}\n\n\n`;
  });

  fs.writeFileSync(dest, output);
};

// Main script execution
try {
  const allFiles = getFilesRecursively(srcDir);
  appendFilesToDest(allFiles, destFile);

  console.log(`Successfully copied all files from ${srcDir} into ${destFile}`);
} catch (error) {
  console.error('Error processing files:', error);
}
