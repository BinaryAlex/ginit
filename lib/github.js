const octokit     = require('@octokit/rest')();
const Configstore = require('configstore');
const pkg         = require('../package.json');
const _           = require('lodash');
const CLI         = require('clui'); //provides some enhancements for console-based applications, among them an animated spinner
const Spinner     = CLI.Spinner;
const chalk       = require('chalk'); //colorizes the output

const inquirer    = require('./inquirer'); //asks the user a series of questions

const conf = new Configstore(pkg.name); //will automatically place config in: C:\Users\alexm4\.config\configstore\ginit.json

//function that allows other libs to access octokit(GitHub) functions
module.exports = {

    getInstance: () => {
        return octokit;
    },

    setGithubCredentials: async () => {
        //prompt the user for their credentials
        const credentials = await inquirer.askGithubCredentials();
        //use basic authentication prior to trying to obtain an OAuth token
        octokit.authenticate(
            _.extend(
                {
                    type: 'basic',
                },
                credentials
            )
        );
    },

    //attempt to register a new access token for our application
    registerNewToken: async () => {
        const status = new Spinner('Authenticating you, please wait...');
        status.start();
        try {
            const response = await octokit.authorization.create({
                scopes: ['user', 'public_repo', 'repo', 'repo:status'],
                note: 'ginits, the command-line tool for initalizing Git repos'
              });
              const token = response.data.token;
              //if we manage to get an access token, we set it in the configstore for next time
              if(token) {
                conf.set('github.token', token);
                return token;
              } 
              else {
                throw new Error("Missing Token","GitHub token was not found in the response");
              }
        }
        catch (err) {
            throw err;
        }
        finally {
            status.stop();
        }
    },

    //setting up an oauth authentication:
    githubAuth : (token) => {
        octokit.authenticate({
          type : 'oauth',
          token : token
        });
    },

    //convenient function for accessing the stored token
    getStoredGithubToken : () => {
        return conf.get('github.token');
    },

    hasAccessToken : async () => {
        const status = new Spinner('Authenticating you, please wait...');
        status.start();
    
        try {
          const response = await octokit.authorization.getAll();
          const accessToken = _.find(response.data, (row) => {
            if(row.note) {
              return row.note.indexOf('ginit') !== -1;
            }
          });
          return accessToken;
        } catch (err) {
          throw err;m
        } finally {
          status.stop();
        }
    },

    regenerateNewToken : async (id) => {
        const tokenUrl = 'https://github.com/settings/tokens/' + id;
        console.log('Please visit ' + chalk.underline.blue.bold(tokenUrl) + ' and click the ' + chalk.red.bold('Regenerate Token Button.\n'));
        const input = await inquirer.askRegeneratedToken();
        if(input) {
          conf.set('github.token', input.token);
          return input.token;
        }
    }
}
