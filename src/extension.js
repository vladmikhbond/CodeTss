const vscode = require('vscode');
const fs = require('fs');
const dif = require('./text_difference');
const web = require('./web');

// локальные данные
let ticket_id = null;
let last_text = null;
let all_changes = null; // список списков изменений
let timer = null;
const time_interval = 5;

function cmd_begin() {		
	vscode.window.showInputBox().then(
		(v) => {
			vscode.window.showInformationMessage(v);
			ticket_id = v; 
			all_changes = [];
			last_text = "";
			timer = setInterval(save_changes, time_interval * 1000);

			vscode.window.showInformationMessage("BEGIN");
		}
	);
}

function cmd_end() {
	if (timer) {
		save_changes();
		clearInterval(timer);
		timer = null;
		write_to_file();  // for debug only
		web.write_to_server(ticket_id, all_changes, time_interval);
		
		vscode.window.showInformationMessage("END");	
	}
}


// Сохраняет в памяти очередной список изменений 
//
function save_changes() {
	const editor = vscode.window.activeTextEditor;		
	if (editor) {		
		const next_text = editor.document.getText();
		const increment = dif.changes(last_text, next_text, 3);
		last_text = next_text;  			
		all_changes.push(increment);
		vscode.window.showInformationMessage("save_one_inc()");			
	} else {
		vscode.window.showInformationMessage("Idle");
	}

} 

// Выводит список инкрементов в файл в формате json
//
function write_to_file() {
	fs.writeFileSync(`c:/spy/${ticket_id}.txt`, JSON.stringify(all_changes));			
} 


/**
 * @param {vscode.ExtensionContext} context
 */

 function activate(context) 
 {	 
    // Регистрация команд
	// let disposable = vscode.commands.registerCommand('codelog.beginCommand', cmd_begin);

	let disposable = vscode.commands.registerCommand('codelog.beginCommand', function() {
		web.token("py", "qweszxc"); 
	});
	context.subscriptions.push(disposable);

	// disposable = vscode.commands.registerCommand('codelog.endCommand', cmd_end);
    disposable = vscode.commands.registerCommand('codelog.endCommand', function() {
		web.check(1, 2, "aaa"); 
	});
	context.subscriptions.push(disposable);	
}
exports.activate = activate;


function deactivate() {}

module.exports = {
	activate,
	deactivate
}

