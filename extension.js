// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
require('./src/cfg');

const path = require('path');
const fs = require('fs');
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





function openOrCreateSourceMirrorFile(shouldOpen) {
	const workspaceFolders = vscode.workspace.workspaceFolders;
  
	if (workspaceFolders && workspaceFolders.length > 0) {
	  const rootPath = workspaceFolders[0].uri.fsPath;
	  const sourceMirrorFilePath = path.join(rootPath, '.sourcemirror');
  
	  fs.access(sourceMirrorFilePath, fs.constants.F_OK, (err) => {
		if (err) {
		  // The file doesn't exist, create it if shouldOpen is false
		  if (!shouldOpen) {
			fs.writeFile(sourceMirrorFilePath, '', (err) => {
			  if (err) {
				console.error('Failed to create .sourcemirror file:', err);
				return;
			  }
			  console.log('.sourcemirror file created successfully.');
			});
		  }
		} else if (shouldOpen) {
		  // The file exists and should be opened
		  openTextDocument(sourceMirrorFilePath);
		}
  
		if (!shouldOpen) {
		  // Read the file content
		  /*
		  fs.readFile(sourceMirrorFilePath, 'utf8', (err, data) => {
			if (err) {
			  console.error('Failed to read .sourcemirror file:', err);
			  return;
			}
			console.log('.sourcemirror file content:', data);
		  });
		  */
		 return true;
		}
	  });
	} else {
	  vscode.window.showInformationMessage('No workspace is currently open.');
	}
}
  
function openTextDocument(filePath) {
	vscode.workspace.openTextDocument(filePath).then((document) => {
		vscode.window.showTextDocument(document);
	}).then(() => {
		console.log('.sourcemirror file opened successfully.');
	}, (error) => {
		console.error('Failed to open .sourcemirror file:', error);
	});
}

function start(autoLoaded) {


	openOrCreateSourceMirrorFile();

	const workspaceFolders = vscode.workspace.workspaceFolders;
	let sourceMirrorFilePath = "";
	let rootPath;

	if (workspaceFolders && workspaceFolders.length > 0) {
		rootPath = workspaceFolders[0].uri.fsPath;
		sourceMirrorFilePath = path.join(rootPath, '.sourcemirror');
	}

	mirror.startMirror(sourceMirrorFilePath, rootPath, 1000);

	global.extension.Running = true;
	if (autoLoaded) {
		msg("Autostarted");
	} else { 
		msg("Running!")
	};
};

function stop(){

	mirror.stopMirror();
	global.extension.Running = false;
	msg("Stopped!")
}

function configure(){
	openOrCreateSourceMirrorFile(true);
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
		}),
		vscode.commands.registerCommand('sourcemirror.stop', function () {
			if (!global.extension.Running) {
				msgWarn("Not running!");
			} else {
				msg("Stopping...");
				stop();
			}
		}),	
		vscode.commands.registerCommand('sourcemirror.configure', function () {
			msg("Opening configuration");
			configure();
		}),
		vscode.commands.registerCommand('sourcemirror.reload', function () {
			msg("Reloading...");
			if (!global.extension.Running) { stop(); };
			start();
		}),
	];



	disposables.forEach(disposable => context.subscriptions.push(disposable));
	//context.subscriptions.push(disposable);
	const configuration = vscode.workspace.getConfiguration('sourcemirror');
	if (configuration.get('autoStart')) {
		start(true);
	}
}



// This method is called when your extension is deactivated
function deactivate() {
	if (global.extension.Running) {
		stop();
	}
}

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