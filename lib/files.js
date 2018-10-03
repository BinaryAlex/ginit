const fs = require('fs');
const path = require('path');

//1. get the current directory (to get a default repo name)
//   you might be tempted to use the fs module’s realpathSync method to get the current directory:
//   path.basename(path.dirname(fs.realpathSync(__filename)));
//   but this will only work if calling from same directory.  we want ginit to be global, so use process.cwd

//2. check whether a directory exists (to determine whether the current folder is already a Git repository by looking for a folder named .git)
//   the preferred method of checking whether a file or directory exists keeps changing.The current way is to use fs.stat or fs.statSync. 
//   These throw an error if there’s no file, so we need to use a try … catch block.
//   When writing a command-line application, using the synchronous version of these sorts of methods is just fine

module.exports = {
    //1
    getCurrentDirectoryBase : () => {
        return path.basename(process.cwd());
    },
    //2
    directoryExists : (filePath) => {
        try {
            return fs.statSync(filePath).isDirectory();
        } catch (err) {
            return false;
        }
    }
}