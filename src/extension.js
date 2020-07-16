const vscode = require('vscode');
const dif = require('./inc_diff');
const web = require('./web');


// globals
const TIME_INTERVAL = 5; // sec
const SEP_STATE = "@#$"; 

// local globals
let model; // ExamineViewModel
// userName = User.Identity.Name,
// examId = exam.Id,
// taskId = task.Id,
// taskTitle = task.Title,
// taskCond = task.Cond,
// taskView = task.View,
// taskLang = LangEncode(task.Lang),
// restTime = ticket != null ? ticket.GetRestTime().ToString("mm\\:ss") : "",
// ticketId = ticket != null ? ticket.Id : 0


let last_text = null;
let log = null; // список списков изменений
// Output channel TSS
let tss_channel = vscode.window.createOutputChannel("TSS");
let timer_log, timer_time;

//#region commands

// Login - input login & pass, get and save a ticket
// 
function cmd_login() {	
	vscode.window.showInputBox({prompt: "Input pin ", placeHolder: "pin"}).then( (pin) => {
					
		web.token(pin)
		.then((obj) => {
			// save model to globals
			model = obj.exam_model;
			start_work();
		})
		.catch(vscode.window.showErrorMessage);	
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
			.catch(vscode.window.showErrorMessage);
	}	
}

// Check - send answer and log
//
function cmd_help() {
	const help = 
	`    LOGIN
	CHECK
	HELP`;
	tss_channel.appendLine(help);
	vscode.window.showInformationMessage('See help in TSS channel.');
}

//#endregion  commands

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

// function atob(a) {
//     return Buffer.from(a).toString('base64');
// }
// function btoa(b) {
//     return Buffer.from(b, 'base64').toString('ascii');
// }

//#endregion utils

function start_work() 
{
	let {lang, open, close} = lang_suit(model.taskLang);
	let content = open+"\n" + model.taskCond + "\n"+close+"\n" + model.taskView;

	let doc = vscode.workspace.openTextDocument({content, language: lang});
	vscode.window.showTextDocument(doc);				
	// Start logging 
	clear_log();
	timer_log = setInterval(changes_to_memory, TIME_INTERVAL * 1000);
	timer_time = setInterval(renew_time, TIME_INTERVAL * 2000, TIME_INTERVAL * 2) ;	
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
		web.check(model.examId, "xxx");
	}
}


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

