const vscode = require('vscode');
const UglifyJS = require("uglify-js");
const cleanCSS = require('clean-css');

let cache = {}; // Initialize cache object

function minifyCurrentFile() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No file is currently open');
        return;
    }

    let filepath = editor.document.fileName;
    let ext = filepath.substring(filepath.lastIndexOf('.') + 1);

    if (ext !== 'js' && ext !== 'css') {
        vscode.window.showErrorMessage('This extension only supports JS and CSS files');
        return;
    }

    let content = editor.document.getText();
    let minifiedContent;

    try {
        if(cache[filepath]) {
            minifiedContent = cache[filepath];
        }else {
            minifiedContent = minify(content, { js: ext === 'js', css: ext === 'css' });
            cache[filepath] = minifiedContent;
        }
        // Create a new untitled document
        vscode.workspace.openTextDocument({ content: minifiedContent }).then(doc => {
            vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside, true);
        });
    } catch (error) {
        vscode.window.showErrorMessage(error.toString());
        sendErrorReport();
    }
}

function sendErrorReport() {

}

function minify(content, ext) {
    let minifiedContent;
    if (ext.js) {
        minifiedContent = UglifyJS.minify(content).code;
    } else if (ext.css) {
        minifiedContent = new cleanCSS().minify(content).styles;
    }
    return minifiedContent;
}

function activate(context) {
    let disposable = vscode.commands.registerCommand('vscode-minify.minifyCurrentFile', minifyCurrentFile);
    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}