const vscode = require('vscode');
const dif = require('./inclog');
const web = require('./web');
const help_text = require('./help_text');

// super globals (shared with another apps) --------
const TIME_INTERVAL = 5; // sec
const SEP_STATE = "@#$"; 

// globals -------
const tss_channel = vscode.window.createOutputChannel("TSS");
let model; // {ticketId, userName, taskId, taskTitle, taskCond, taskView, taskLang, restSeconds }
let last_text = null;
let log = null; // список списков изменений
let timer_log;
let timer_time;

//#region commands

// Login - input login & pass, get and save a ticket
// 
function cmd_login() {	
	vscode.window.showInputBox({prompt: "Input pin ", placeHolder: "pin"}).then( (pin) => {
					
		web.token(pin)
		.then((data) => {
			// save model to globals
			model = data;
			start_work();
		})
		.catch((err) => { 
			vscode.window.showErrorMessage(err.code); 
		});	
	});
}

// Check - send answer and log
//
function cmd_check() {
	const editor = vscode.window.activeTextEditor;		
	if (editor) {
		// check 	
		const selection = editor.selection;
		const userAnswer = editor.document.getText(selection);	
		if (!userAnswer) {
			vscode.window.showInformationMessage('No user answer');
			return;
		}
		vscode.window.showInformationMessage('WAIT');	
		web.check(model.ticketId, userAnswer, log)
			.then(after_checking)
			.catch((err) => { 
				vscode.window.showErrorMessage(err.code); 
			});	
	}	
}


function cmd_help() {
	tss_channel.clear();
	tss_channel.appendLine(help_text.content);
	vscode.window.showInformationMessage('See help in TSS channel.');
}

//#endregion  commands

//#region funcs

function start_work() 
{
	let {lang, open, close} = lang_suit(model.taskLang);
	let content = open+"\n" + model.taskCond + "\n"+close+"\n" + model.taskView;

	let doc = vscode.workspace.openTextDocument({content, language: lang});
	vscode.window.showTextDocument(doc);				
	// Start logging 
	clear_log();
	timer_log = setInterval(changes_to_memory, TIME_INTERVAL * 1000);
	// Start timing if exam
	if (model.examId) {
	    timer_time = setInterval(renew_time, TIME_INTERVAL * 2000, TIME_INTERVAL * 2) ;	
	}
}

//
function after_checking({ restTime, message })
{
	// rest time
	model.restSeconds = restTime;	
	// write state to log
	clear_log();
	changes_to_memory(message);
	let ok = message.indexOf("OK") === 0;
	if (ok) {
        // to save last message
		web.uppload_code_log(model.ticketId, log);
		vscode.window.showInformationMessage(message); 
		epilog();
	} else {
		vscode.window.showErrorMessage(message);
	}
	tss_channel.appendLine(message);
	tss_channel.appendLine("rest time: " + restTime);
}

function epilog() {
	setTimeout(function () {
        vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	}, 3000);
	clearInterval(timer_log);	
	clearInterval(timer_time);
}

function changes_to_memory(state) {
	const editor = vscode.window.activeTextEditor;		
	if (!editor)
		return;
	if (editor.document.fileName.startsWith('extension-output'))
	   return;

	let next_text = editor.document.getText();
	if (state)
		next_text += SEP_STATE + state;
		
	const increment = dif.changes(last_text, next_text);
	last_text = next_text;  			
	log.push(increment);	
}

function renew_time(t) {
	model.restSeconds -= t;
	vscode.window.showInformationMessage(seconds2timeStr(model.restSeconds));
	if (model.restSeconds < 0) {
		// fake check to close ticket
		web.check(model.ticketId, "xxx");
	}
}

//#endregion

//#region utils

function clear_log() {
	log = [];
	last_text = "";
}


function seconds2timeStr(n) {
    let sec = n % 60;
    let min = (n - sec) / 60;
    return `Rest time: ${min}' ${sec}"`;
}

// символы комментария в условии зависят от языка задачи
function lang_suit(la) {
	const dict = {
		'csharp': {'lang': 'csharp', 'open' : '/*', 'close' : '*/'}, 
		'python': {'lang': 'python', 'open' : '"""', 'close' : '"""'}, 
		'javascript': {'lang': 'javascript', 'open' : '/*', 'close' : '*/'}, 
		'haskell': {'lang': 'haskell', 'open' : '{-', 'close' : '-}'}, 
	};
	return dict[la] ? dict[la] : dict['csharp'];
}

//#endregion utils


/**
 * @param {vscode.ExtensionContext} context
 */

 function activate(context) 
 {	 
    // Регистрация команд
	let disposable = vscode.commands.registerCommand('codetss.loginCommand', cmd_login);
	context.subscriptions.push(disposable);
	disposable = vscode.commands.registerCommand('codetss.checkCommand', cmd_check);
	context.subscriptions.push(disposable);	
	disposable = vscode.commands.registerCommand('codetss.helpCommand', cmd_help);
	context.subscriptions.push(disposable);	
}
exports.activate = activate;


function deactivate() {}

module.exports = {
	activate,
	deactivate
}
