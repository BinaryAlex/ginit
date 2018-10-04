#!/usr/bin/env node

//1. above shebang line added to make command available globally
//2. add a bin property to our package.json
//3. install the module globally and you’ll have a working shell command: npm install -g

//tutorial: https://www.sitepoint.com/javascript-command-line-interface-cli-node-js/

const chalk = require('chalk'); //colorizes the output
const clear = require('clear'); //clears the terminal screen
const figlet = require('figlet'); //creates ASCII art from text
const files = require('./lib/files'); //basic file management
// const inquirer = require('./lib/inquirer'); //asks the user a series of questions
const repo = require('./lib/repo');
const github = require('./lib/github');

clear();
console.log(
  chalk.yellow(
      figlet.textSync('Ginit', { horizontalLayout: 'full' })
  )  
);

if (files.directoryExists('.git')) {
    console.log(chalk.red('Already a git repo!'));
    process.exit();
}

const getGithubToken = async () => {
    // Fetch token from config store
    let token = github.getStoredGithubToken();
    if(token) {
      return token;
    }
  
    // No token found, use credentials to access GitHub account
    await github.setGithubCredentials();
  
    // register new token
    token = await github.registerNewToken();
    return token;
}  

const run = async () => {
    // const credentials = await inquirer.askGithubCredentials();
    // console.log(credentials);

    // let token = github.getStoredGithubToken();
    // if (!token) {
    //     await github.setGithubCredentials();
    //     token = await github.registerNewToken();
    // }
    // console.log(token);

    try {
        // Retrieve & Set Authentication Token
        const token = await getGithubToken();
        github.githubAuth(token);
    
        // Create remote repository
        const url = await repo.createRemoteRepo();
    
        // Create .gitignore file
        await repo.createGitignore();
    
        // Set up local repository and push to remote
        const done = await repo.setupRepo(url);
        if(done) {
          console.log(chalk.green('All done!'));
        }
      } 
      catch(err) {
          if (err) {
            switch (err.code) {
              case 401:
                console.log(chalk.red('Couldn\'t log you in. Please provide correct credentials/token.'));
                break;
              case 422:
                console.log(chalk.red('There already exists a remote repository with the same name'));
                break;
              default:
                console.log(err);
            }
          }
    }
}

run();

// const Configstore = require('configstore');
// const conf = new Configstore('ginit'); //will automatically place config in: C:\Users\alexm4\.config\configstore\ginit.json

