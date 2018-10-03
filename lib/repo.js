const _           = require('lodash');
const fs          = require('fs');
const git         = require('simple-git')();
const CLI         = require('clui')
const Spinner     = CLI.Spinner;

const inquirer    = require('./inquirer');
const gh          = require('./github');

module.exports = {

  createRemoteRepo: async () => {
    const github = gh.getInstance();
    const answers = await inquirer.askRepoDetails();

    const data = {
      name : answers.name,
      description : answers.description,
      private : (answers.visibility === 'private')
    };

    const status = new Spinner('Creating remote repository...');
    status.start();

    try {
      const response = await github.repos.create(data);
      return response.data.ssh_url;
    } 
    catch(err) {
      throw err;
    } 
    finally {
      status.stop();
    }
  },

  createGitignore: async () => {
    //scan the current directory, ignoring the .git folder and any existing .gitignore file (we do this by making use of lodash’s without method):
    const filelist = _.without(fs.readdirSync('.'), '.git', '.gitignore');

    if (filelist.length) {
      const answers = await inquirer.askIgnoreFiles(filelist);
      if (answers.ignore.length) {
        fs.writeFileSync( '.gitignore', answers.ignore.join( '\n' ) );
      }
      else {
        //nothing to add, there’s no point in continuing, so let’s simply touch the current .gitignore file 
        touch( '.gitignore' );
      }
    } 
    else {
        //nothing to add, there’s no point in continuing, so let’s simply touch the current .gitignore file 
        touch('.gitignore');
    }
  },

  setupRepo: async (url) => {
    const status = new Spinner('Initializing local repository and pushing to remote...');
    status.start();

    try {
    //use simple-git package to automate
    //1. run git init
    //2. add the .gitignore file
    //3. add the remaining contents of the working directory
    //4. perform an initial commit
    //5. add the newly-created remote repository
    //6. push the working directory up to the remote.
      await git
        .init()
        .add('.gitignore')
        .add('./*')
        .commit('Initial commit')
        .addRemote('origin', url)
        .push('origin', 'master');
      return true;
    } 
    catch(err) {
      throw err;
    } 
    finally {
      status.stop();
    }
  },

}
