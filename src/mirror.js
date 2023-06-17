const fs = require('fs');
const path = require('path');

var mirroredPairs = [];

function mirrorFiles(sourceDir, destDir) {
    fs.readdir(sourceDir, (err, files) => {
      if (err) {
        console.error(`Error reading directory ${sourceDir}:`, err);
        return;
      }
  
      files.forEach(file => {
        const sourceFile = path.join(sourceDir, file);
        const destFile = path.join(destDir, file);
  
        fs.stat(sourceFile, (err, sourceStats) => {
          if (err) {
            console.error(`Error getting stats for ${sourceFile}:`, err);
            return;
          }
  
          if (sourceStats.isDirectory()) {
            const nestedDestDir = path.join(destDir, file);
  
            fs.stat(nestedDestDir, (err, destStats) => {
              if (err && err.code === 'ENOENT') {
                fs.mkdir(nestedDestDir, { recursive: true }, err => {
                  if (err) {
                    console.error(`Error creating directory ${nestedDestDir}:`, err);
                  } else {
                    //console.log(`Created directory: ${nestedDestDir}`);
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
                    //console.log(`Copied ${sourceFile} to ${destFile}`);
                  }
                });
              } else if (sourceStats.mtimeMs > destStats.mtimeMs) {
                // Source file is newer than destination file, so update it
                fs.copyFile(sourceFile, destFile, err => {
                  if (err) {
                    console.error(`Error updating ${destFile} with ${sourceFile}:`, err);
                  } else {
                    //console.log(`Updated ${destFile} with ${sourceFile}`);
                  }
                });
              }
            });
          }
        });
      });
  
      // Check for files in the destination directory that don't exist in the source directory
      fs.readdir(destDir, (err, destFiles) => {
        if (err) {
          console.error(`Error reading directory ${destDir}:`, err);
          return;
        }
  
        destFiles.forEach(destFile => {
          const sourceFile = path.join(sourceDir, destFile);
          const destFilePath = path.join(destDir, destFile);
  
          fs.stat(sourceFile, (err) => {
            if (err && err.code === 'ENOENT') {
              if (fs.statSync(destFilePath).isDirectory()) {
                fs.rm(destFilePath, { recursive: true }, err => {
                  if (err) {
                    console.error(`Error deleting directory ${destFilePath}:`, err);
                  } else {
                    //console.log(`Deleted directory ${destFilePath}`);
                  }
                });
              } else {
                fs.rm(destFilePath, err => {
                  if (err) {
                    console.error(`Error deleting file ${destFilePath}:`, err);
                  } else {
                    //console.log(`Deleted file ${destFilePath}`);
                  }
                });
              }
            }
          });
        });
      });
    });
  }
  
  

function checkDirectoriesExist(source, destination) {
  const sourceExists = fs.existsSync(source);
  const destinationExists = fs.existsSync(destination);

  if (sourceExists && destinationExists) {
    return true;
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
      source = path.join(root, source);
      destination = path.join(root, destination);
      callback(source, destination);
    });
  });
}

function processDirectories(source, destination) {
  if (!checkDirectoriesExist(source, destination)) {
    return;
  }

  //console.log(`Source: ${source}, Destination: ${destination}`);
  mirroredPairs.push([source, destination]);
}

function startMirror(config, root, interval = 1000, err) {
  readFileAndProcess(config, root, processDirectories);

    setInterval(() => {
        mirroredPairs.forEach((paired) => {
            try {
                mirrorFiles(paired[0], paired[1]);
            } catch (error) {
                err("Encountered an error!");
                console.error("Error encountered: " + error);
            }
        });
    }, interval);
}

function stopMirror() {
  mirroredPairs = [];
}

module.exports = {
  startMirror,
  stopMirror,
};
