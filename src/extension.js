const vscode = require('vscode');
const fs = require('fs');
const dif = require('./inc_diff');
const web = require('./web');

const TIME_INTERVAL = 5; // sec
const SEP_STATE = "@#$"; 

// локальные данные
let exam_id = null;
let task_id = null;
let ticket_id = null;

let last_text = null;
let log = null; // список списков изменений



// Login - input login & pass, get and save a ticket
// 
function cmd_login() {	
	vscode.window.showInputBox({prompt: "Input Login ", placeHolder: "login"}).then( (login) => {
		vscode.window.showInputBox({prompt: "Input Password ", password: true}).then(
			(pass) => {
				web.token(login, pass, cmd_pin);
			}
		)
	});
}


// Pin - input pin and save it. get a tssTask. Open an editor window.
// tssTask = {id, title, attr, lang, cond, view, hint, code}
//
function cmd_pin() {		
	vscode.window.showInputBox({prompt: "Input Login ", placeHolder: "xxx-xxx-xxx"}).then(
		(v) => {
			[exam_id, task_id, ticket_id] = v.split('-');
			
			web.tss_task(task_id, (data) => {
				const tssTask = JSON.parse(data);
				// Show problem condition //
				let content = "/*\n" + tssTask.cond + "\n*/\n" + tssTask.view;

				let doc = vscode.workspace.openTextDocument({content, language: lang(tssTask.lang)});
				vscode.window.showTextDocument(doc);				
				// Start logging //
				clear_log();
				setInterval(save_changes, TIME_INTERVAL * 1000);
			} );
		}
	);
}

function clear_log() {
	log = [];
	last_text = "";
}
function lang(key) {
	let v = {'cs': 'csharp'}[key];
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
		web.check(exam_id, task_id, userAnswer, (message) => {
			vscode.window.showInformationMessage(message);
			// запись состояния в лог
			save_changes(message)
			// сохранение  лога
			web.uppload_code_log(ticket_id, log, clear_log);
		}); 	
	}	
}


// Сохраняет в памяти очередной список изменений 
//
function save_changes(state) {
	const editor = vscode.window.activeTextEditor;		
	if (editor) {		
		let next_text = editor.document.getText();
		if (state)
			next_text += SEP_STATE + state;
			
		const increment = dif.changes(last_text, next_text, 3);
		last_text = next_text;  			
		log.push(increment);
	}
} 

// Выводит список инкрементов в файл в формате json
//
// function write_to_file() {
// 	fs.writeFileSync(`c:/spy/${ticket_id}.txt`, JSON.stringify(log));			
// } 


/**
 * @param {vscode.ExtensionContext} context
 */

 function activate(context) 
 {	 
    // Регистрация команд
	let disposable = vscode.commands.registerCommand('codelog.loginCommand', cmd_login);
	context.subscriptions.push(disposable);
	disposable = vscode.commands.registerCommand('codelog.pinCommand', cmd_pin);
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

