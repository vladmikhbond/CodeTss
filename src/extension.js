const vscode = require('vscode');
const dif = require('./inclog');
const web = require('./web');
const help_text = require('./help_text');
const { clearInterval } = require('timers');

// super globals (shared with another apps) --------
const TIME_INTERVAL = 5; // sec
const SEP_STATE = "@#$"; 

// globals -------
const tssChannel = vscode.window.createOutputChannel("TSS");
let model; // {ticketId, examId, userName, taskId, taskTitle, taskCond, taskView, taskLang, restSeconds }
let lastText = null;
let log = null; // список списков изменений
let timerLog = null;
let timerPeriodical = null;

//#region commands

// Pin - input pin, get and save a model (see above)
// 
function cmd_pin() {	
	vscode.window.showInputBox({prompt: "Input pin ", placeHolder: "pin"}).then( (pin) => {
					
		web.token(pin)
		.then((data) => {
			// save model to globals
			model = data;
			startToSolve();
		})
		.catch(vscode.window.showErrorMessage);	
	});
}

// Check - send answer and log
//
function cmd_check() {
	const editor = vscode.window.activeTextEditor;		
	if (editor) {
		let userAnswer = getAnswer(editor);

		web.check(model.ticketId, userAnswer, log)
			.then(afterChecking)
			.catch((err) => { 
				vscode.window.showErrorMessage(err.code); 
			});	
	}	
}

// Определяется вид ограничителей и из текста редактора извлекается решение задачи
//         
function getAnswer(editor)
{
	let screen = editor.document.getText();	
	let suit = lang_suit(model.taskLang);
	try {
		let match = suit.regex.exec(screen);
		return match[2];
	} catch (err) {
        vscode.window.showInformationMessage(`Поставьте ограничители решения ${suit.bounds}`);	
		return screen;
	}
}


function cmd_help() {
	tssChannel.clear();
	tssChannel.appendLine(help_text.content);
	vscode.window.showInformationMessage('See help in TSS channel.');
}

//#endregion  commands

//#region funcs

function startToSolve() 
{
	let {lang, open, close} = lang_suit(model.taskLang);
	let content = open+"\n" + model.taskCond + "\n"+close+"\n" + model.taskView;

	let doc = vscode.workspace.openTextDocument({content, language: lang});
	vscode.window.showTextDocument(doc);				
	// Start logging 
	clearLog();
	if (timerLog) clearInterval(timerLog);
	timerLog = setInterval(changesToMemory, TIME_INTERVAL * 1000);
	// Start display rest time if exam
	if (model.examId) {
		if (timerPeriodical) {
			clearInterval(timerPeriodical);
		}
	    timerPeriodical = setInterval( function() {		
			// extra check exam to close ticket 
			if (model.restSeconds < -2) {		
				cmd_check();
			}
		}, TIME_INTERVAL * 1000 * 60) ;	// 1'
	}
	tssChannel.show();
}

//
function afterChecking({ restTime, message })
{
	// rest time
	model.restSeconds = restTime;	
	// write state to log
	clearLog();
	changesToMemory(message);
	let ok = message.indexOf("OK") === 0;
	if (ok) 
	{
		vscode.window.showInformationMessage(message); 
        // to save last check result in log 
		web.uppload_code_log(model.ticketId, log)
		    .then(epilog);
	} else 
	{
		vscode.window.showErrorMessage(message);
	}
	tssChannel.appendLine(message);
	if (model.examId) {
		showRestTime();
	}
}

function epilog() {
	clearInterval(timerLog);	
	clearInterval(timerPeriodical);
    // close editor 
	setTimeout(function () {
        vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	}, 3000);
}

function changesToMemory(state) {
	const editor = vscode.window.activeTextEditor;		
	if (!editor)
		return;
	if (editor.document.fileName.startsWith('extension-output'))
	   return;

	//let next_text = editor.document.getText();  // v 0.0.3
	let next_text = getAnswer(editor);
	if (state)
		next_text += SEP_STATE + state;
		
	const increment = dif.changes(lastText, next_text);
	lastText = next_text;  			
	log.push(increment);	
}

function showRestTime() {
	let sec = model.restSeconds % 60;
    let min = (model.restSeconds - sec) / 60;
    let timeStr = `Rest time: ${min}' ${sec}"`;

	vscode.window.showInformationMessage(timeStr);
	tssChannel.appendLine(timeStr);	
}

//#endregion

//#region utils

function clearLog() {
	log = [];
	lastText = "";
}


// Символы комментария в условии задачи и регулярное выражение для выделения решения
// зависят от языка задачи
//
function lang_suit(lang) {
	const dict = {
		'csharp': {'lang': 'csharp', 'open': '/*', 'close': '*/', "regex": /(\/\/BEGIN)([\w\W]*)(\/\/END)/g, bounds:'//BEGIN...//ENG' }, 
		'python': {'lang': 'python', 'open': '"""', 'close': '"""', "regex": /(#BEGIN)([\w\W]*)(#END)/g, bounds:'#BEGIN...#ENG'  }, 
		'javascript': {'lang': 'javascript', 'open' : '/*', 'close' : '*/', "regex": /(\/\/BEGIN)([\w\W]*)(\/\/END)/g, bounds:'//BEGIN...//ENG'  }, 
		'haskell': {'lang': 'haskell', 'open': '{-', 'close': '-}', "regex": /(--BEGIN)([\w\W]*)(--END)/g, bounds:'--BEGIN...--ENG'  }, 
	};
	return dict[lang] ? dict[lang] : dict['csharp'];
}

//#endregion utils


/**
 * @param {vscode.ExtensionContext} context
 */

 function activate(context) 
 {	 
    // Регистрация команд
	let disposable = vscode.commands.registerCommand('codetss.pinCommand', cmd_pin);
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
