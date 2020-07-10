const vscode = require('vscode');
// const fs = require('fs');
const dif = require('./inc_diff');
const web = require('./web');

const TIME_INTERVAL = 5; // sec
const SEP_STATE = "@#$"; 

// локальные данные
let model;
// UserName = User.Identity.Name,
// ExamId = exam.Id,
// TaskId = task.Id,
// TaskTitle = task.Title,
// TaskCond = task.Cond,
// TaskView = task.View,
// TaskLang = LangEncode(task.Lang),
// RestTime = ticket != null ? ticket.GetRestTime().ToString("mm\\:ss") : "",
// TicketId = ticket != null ? ticket.Id : 0


let last_text = null;
let log = null; // список списков изменений
//Create output channel
let tss_channel = vscode.window.createOutputChannel("TSS");



// Login - input login & pass, get and save a ticket
// 
function cmd_login() {	
	vscode.window.showInputBox({prompt: "Input Login ", placeHolder: "login"}).then( (login) => {
		vscode.window.showInputBox({prompt: "Input Password ", password: true}).then(
			(pass) => {
				web.token(login, pass)
				.then(web.details_code)
				.then(start_work)
				.catch(vscode.window.showErrorMessage);
			}
		)
	});
}


function start_work(obj) {
	model = obj;
	let content = "/*\n" + model.taskCond + "\n*/\n" + model.taskView;

	let doc = vscode.workspace.openTextDocument({content, language: lang(model.taskLang)});
	vscode.window.showTextDocument(doc);				
	// Start logging //
	clear_log();
	setInterval(save_changes, TIME_INTERVAL * 1000);
}


function clear_log() {
	log = [];
	last_text = "";
}

function lang(key) {
	let v = {'cs': 'csharp', 'py': 'python', 'js': 'javascript'}[key];
	return v ? v : 'csharp';
}
	

// Check - send answer and log
//
function cmd_check() {
	const editor = vscode.window.activeTextEditor;		
	if (editor) {
		// check 	
		const selection = editor.selection;
		const userAnswer = editor.document.getText(selection);	
		vscode.window.showInformationMessage('WAIT');	
		web.check(model.examId, userAnswer)
		.then(show_n_save)
		.then(() => {web.uppload_code_log(model.ticketId, log)})
		.then(clear_log)
		.catch(vscode.window.showErrorMessage);
	}	
}

function show_n_save(data) {

	tss_channel.appendLine(data.message);
	tss_channel.appendLine("rest time: " + data.restTime);
	vscode.window.showInformationMessage(data.message);

	save_changes(data.message)
}



// Сохраняет в памяти очередной список изменений 
//
function save_changes(state) {
	const editor = vscode.window.activeTextEditor;		
	if (editor) {		
		let next_text = editor.document.getText();
		if (state)
			next_text += SEP_STATE + state;
			
		const increment = dif.changes(last_text, next_text);
		last_text = next_text;  			
		log.push(increment);
	}
} 


/**
 * @param {vscode.ExtensionContext} context
 */

 function activate(context) 
 {	 
    // Регистрация команд
	let disposable = vscode.commands.registerCommand('codelog.loginCommand', cmd_login);
	context.subscriptions.push(disposable);
	disposable = vscode.commands.registerCommand('codelog.checkCommand', cmd_check);
	context.subscriptions.push(disposable);	
}
exports.activate = activate;


function deactivate() {}

module.exports = {
	activate,
	deactivate
}

