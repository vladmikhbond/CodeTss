const vscode = require('vscode');
const dif = require('./inc_diff');
const web = require('./web');
const { utils } = require('mocha');

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
//Create output channel TSS
let tss_channel = vscode.window.createOutputChannel("TSS");


//#region commands

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
		web.check(model.examId, userAnswer)
		.then(show_n_save)
		.then(() => {web.uppload_code_log(model.ticketId, log)})
		.then(clear_log)
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


function sec2timeStr(n) {
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

function start_work(m) {
	// save model to globals
	model = m;
	let {lang, open, close} = lang_suit(model.taskLang);
	let content = open+"\n" + model.taskCond + "\n"+close+"\n" + model.taskView;

	let doc = vscode.workspace.openTextDocument({content, language: lang});
	vscode.window.showTextDocument(doc);				
	// Start logging 
	clear_log();
	setInterval(changes_to_memory, TIME_INTERVAL * 1000);
	setInterval(renew_time, TIME_INTERVAL * 2000, TIME_INTERVAL * 2) ;
	
}


function show_n_save(data) {
	model.restSeconds = data.restTime;
	tss_channel.appendLine(data.message);
	tss_channel.appendLine("rest time: " + data.restTime);
	vscode.window.showInformationMessage(data.message);

	changes_to_memory(data.message)
}


function changes_to_memory(state) {
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

function renew_time(t) {
	model.restSeconds -= t;
	vscode.window.showInformationMessage(sec2timeStr(model.restSeconds));
	if (model.restSeconds < 0) {
		web.check(model.examId, "xxx"); ///////////////
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
	disposable = vscode.commands.registerCommand('codelog.helpCommand', cmd_help);
	context.subscriptions.push(disposable);	
}
exports.activate = activate;


function deactivate() {}

module.exports = {
	activate,
	deactivate
}

