const fs = require('fs');
const path = require('path');

//const workingDir = process.cwd();
/*
const sourceDir = path.join(workingDir, 'Source'); // Replace with your source directory
const destDir = path.join(workingDir, 'Destination'); // Replace with your destination directory
const interval = 2000; // Interval in milliseconds (e.g., 2000ms = 2 seconds)
*/

var mirroredPairs = [];
function mirrorFiles(sourceDir, destDir) {
  //console.log('Current directory:', process.cwd());

  fs.readdir(sourceDir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${sourceDir}:`, err);
      return;
    }

    files.forEach(file => {
        console.log("for file: " + file)
      const sourceFile = path.join(sourceDir, file);
      const destFile = path.join(destDir, path.relative(sourceDir, sourceFile));

      fs.stat(sourceFile, (err, sourceStats) => {
        if (err) {
          console.error(`Error getting stats for ${sourceFile}:`, err);
          return;
        }

        console.log("stat");

        if (sourceStats.isDirectory()) {
          const nestedDestDir = path.join(destDir, path.relative(sourceDir, sourceFile));

          fs.stat(nestedDestDir, (err, destStats) => {
            if (err && err.code === 'ENOENT') {
              fs.mkdir(nestedDestDir, { recursive: true }, err => {
                if (err) {
                  console.error(`Error creating directory ${nestedDestDir}:`, err);
                } else {
                  console.log(`Created directory: ${nestedDestDir}`);
                  mirrorFiles(sourceFile, nestedDestDir); // Recursively mirror files in nested directory
                }
              });
            } else if (!err && destStats.isDirectory()) {
              mirrorFiles(sourceFile, nestedDestDir); // Directory already exists, recursively mirror files in nested directory
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

function checkDirectoriesExist(source, destination) {
    const sourceExists = fs.existsSync(source);
    const destinationExists = fs.existsSync(destination);
  
    if (sourceExists && destinationExists) {
        return true;
      //console.log(`Both source directory '${source}' and destination directory '${destination}' exist.`);
    } else {
      console.log(`One or both of the directories do not exist.`);
      if (!sourceExists) {
        console.log(`Source directory '${source}' does not exist.`);
      }
      if (!destinationExists) {
        console.log(`Destination directory '${destination}' does not exist.`);
      }
      return false;
    }
  }
  
  
function readFileAndProcess(file, root, callback) {

    fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading file ${file}:`, err);
                return;
            }

        const pairs = data.split('\n');
        pairs.forEach(pair => {
            let [source, destination] = pair.split('->').map(str => str.trim());
            source = root + "/" + source;
            destination = root + "/" + destination;
            console.log("source: " + source + " dest: " + destination);
            callback(source, destination);
        });
    });
}
  
  // Example callback function
function processDirectories(source, destination) {
      if (!checkDirectoriesExist(source, destination)) { 
          console.log("failed"); return; 
      };
    console.log(`Source: ${source}, Destination: ${destination}`);
    // Call your function or logic here for each source and destination pair
    mirroredPairs.push([source, destination]);
}
  
  // Usage

var intervalId;
function startMirror(config, root, interval = 1000) {
    readFileAndProcess(config, root, processDirectories);
    //intervalId = setInterval(mirrorFiles, interval);
    intervalId = setInterval(() => {
        console.log("interval")
        mirroredPairs.forEach((paired) => {
            console.log("mirrored: ", paired);
            mirrorFiles(paired[1], paired[2]);
        });
    }, interval);
    
}

function stopMirror() {
    clearInterval(intervalId);
}

function testMessage () {
    return " mirror test message"
}
//stopMirror();

module.exports = {
    startMirror, stopMirror, testMessage
};