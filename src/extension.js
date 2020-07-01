 




const vscode = require('vscode');
const fs = require('fs');
const dif = require('./text_difference');
const web = require('./web');

const TIME_INTERVAL = 5;  // in sec

// локальные данные
let exam_id = null;
let task_id = null;
let ticket_id = null;

let last_text = null;
let log = null; // список списков изменений



// Login - input login & pass, get and save a ticket
// 
function cmd_login() {	
	vscode.window.showInputBox({prompt: "Input Login "}).then( (login) => {
		vscode.window.showInputBox({prompt: "Input Password ", password: true}).then(
			(pass) => {
				web.token(login, pass);
			}
		)
	});
}


// public int Id { get; set; }
// public string Title { get; set; }
// public string Attr { get; set; }
// public string Lang { get; set; }
// public string Cond { get; set; }
// public string View { get; set; }
// public string Hint { get; set; }
// public string Code { get; set; }

// Pin - input pin and save it. get a problem condition. open an editor window.
//
function cmd_pin() {		
	vscode.window.showInputBox({prompt: "Input Login ", placeHolder: "xxx-xxx-xxx"}).then(
		(v) => {
			[exam_id, task_id, ticket_id] = v.split('-');
			

			web.tss_task(task_id, (tssTask) => {
				let cont = "/*\n" + tssTask.cond + "\n*/" + tssTask.View;
				vscode.workspace.openTextDocument({content: cont, language: 'csharp'});
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

// Check - send answer and log
//
function cmd_check() {
	const editor = vscode.window.activeTextEditor;		
	if (editor) {	
		const selection = editor.selection;
		const userAnswer = editor.document.getText(selection);		
		web.check(exam_id, task_id, userAnswer); 	
	}
    // log
	web.write_to_server(ticket_id, log);	
	write_to_file();  // for debug only
	save_changes();
	clear_log();				
}


// Сохраняет в памяти очередной список изменений 
//
function save_changes() {
	const editor = vscode.window.activeTextEditor;		
	if (editor) {		
		const next_text = editor.document.getText();
		const increment = dif.changes(last_text, next_text, 3);
		last_text = next_text;  			
		log.push(increment);
		vscode.window.showInformationMessage("save_one_inc()");			
	} else {
		vscode.window.showInformationMessage("Idle");
	}

} 

// Выводит список инкрементов в файл в формате json
//
function write_to_file() {
	fs.writeFileSync(`c:/spy/${ticket_id}.txt`, JSON.stringify(log));			
} 


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

