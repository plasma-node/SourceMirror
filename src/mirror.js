const fs = require('fs');
const path = require('path');

const workingDir = process.cwd();
const sourceDir = path.join(workingDir, 'Source'); // Replace with your source directory
const destDir = path.join(workingDir, 'Destination'); // Replace with your destination directory
const interval = 2000; // Interval in milliseconds (e.g., 2000ms = 2 seconds)


function mirrorFiles(dir = sourceDir) {
  //console.log('Current directory:', process.cwd());

  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}:`, err);
      return;
    }

    files.forEach(file => {
      const sourceFile = path.join(dir, file);
      const destFile = path.join(destDir, path.relative(sourceDir, sourceFile));

      fs.stat(sourceFile, (err, sourceStats) => {
        if (err) {
          console.error(`Error getting stats for ${sourceFile}:`, err);
          return;
        }

        if (sourceStats.isDirectory()) {
          const nestedDestDir = path.join(destDir, path.relative(sourceDir, sourceFile));

          fs.stat(nestedDestDir, (err, destStats) => {
            if (err && err.code === 'ENOENT') {
              fs.mkdir(nestedDestDir, { recursive: true }, err => {
                if (err) {
                  console.error(`Error creating directory ${nestedDestDir}:`, err);
                } else {
                  console.log(`Created directory: ${nestedDestDir}`);
                  mirrorFiles(sourceFile); // Recursively mirror files in nested directory
                }
              });
            } else if (!err && destStats.isDirectory()) {
              mirrorFiles(sourceFile); // Directory already exists, recursively mirror files in nested directory
            }
          });
        } else {
          fs.stat(destFile, (err, destStats) => {
            if (err && err.code === 'ENOENT') {
              // File doesn't exist in destination, so copy it
              fs.copyFile(sourceFile, destFile, err => {
                if (err) {
                  console.error(`Error copying ${sourceFile} to ${destFile}:`, err);
                } else {
                  console.log(`Copied ${sourceFile} to ${destFile}`);
                }
              });
            } else if (sourceStats.mtimeMs > destStats.mtimeMs) {
              // Source file is newer than destination file, so update it
              fs.copyFile(sourceFile, destFile, err => {
                if (err) {
                  console.error(`Error updating ${destFile} with ${sourceFile}:`, err);
                } else {
                  console.log(`Updated ${destFile} with ${sourceFile}`);
                }
              });
            }
          });
        }
      });
    });
  });
}

var intervalId;
function startMirror() {
  intervalId = setInterval(mirrorFiles, interval);
  console.log('Mirror started');
}

function stopMirror() {
  clearInterval(intervalId);
  console.log('Mirror stopped');
}

function testMessage () {
    return " mirror test message"
}
//stopMirror();

module.exports = {
    startMirror, stopMirror, testMessage
};