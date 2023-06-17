// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
require('./src/cfg');

const mirror = require('./src/mirror');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

function msg(string) {
	vscode.window.showInformationMessage("SourceMirror: " + string)
};

function msgWarn(string) {
	vscode.window.showWarningMessage("SourceMirror: " + string)
};

function msgError(string) {
	vscode.window.showErrorMessage("SourceMirror: " + string)
};


function start() {



	global.extension.Running = true;
	msg("Running!")
};

function stop(){


	global.extension.Running = false;
	msg("Stopped!")
}

function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "sourcemirror" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	/*
	let disposable = vscode.commands.registerCommand('sourcemirror.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from SourceMirror!' + mirror.testMessage());
		//vscode.window.showInformationMessage('Hello World from SourceMirror!');

	});
	*/

	const disposables = [
		vscode.commands.registerCommand('sourcemirror.start', function () {
			//vscode.window.showInformationMessage('Attempting to start');
			if (global.extension.Running) {
				msgWarn("Already running!");
			} else {
				msg("Starting...");
				start();
			}

			/*
			msg("Attempting to start: " + global.Test);
			msgWarn("Test warning");
			msgError("Test error")
			*/
		}),
		vscode.commands.registerCommand('sourcemirror.stop', function () {
			if (!global.extension.Running) {
				msgWarn("Not running!");
			} else {
				msg("Stopping...");
				stop();
			}
		}),
	];



	disposables.forEach(disposable => context.subscriptions.push(disposable));
	//context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

/**
const vscode = require('vscode');

function getExtensionSettings() {
  const configuration = vscode.workspace.getConfiguration('myExtension');
  const enableFeature = configuration.get('enableFeature');
  const username = configuration.get('username');

  console.log(`Enable Feature: ${enableFeature}`);
  console.log(`Username: ${username}`);
}

// Example usage
getExtensionSettings();
*/