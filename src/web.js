const vscode = require('vscode');
const querystring = require('querystring');
const http = require('http');

//const HOST = 'tss.co.ua';
//const PORT = 5555;
const HOST = 'localhost';
const PORT = 49847;

let TOKEN;

//
function token(name, pass, callback) 
{
  var postData = querystring.stringify({
    'username' : name, 
    'password': pass       
  });

  var options = {
    hostname: HOST,
    port: PORT,
    path: '/api/token',
    method: 'POST',
    headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length
    }
  };
    
  var req = http.request(options, (res) => {
    if (res.statusCode > 299)
        vscode.window.showWarningMessage('Wrong login or pass.');

    let data = "";
    
    res.on('data', (d) => {
      data += d.toString();
    });
    
    res.on('end', () => {
      let obj = JSON.parse(data);
      TOKEN = obj["access_token"];
      vscode.window.showInformationMessage('Successful login');
      if (callback) 
          callback(); 
    });

  });
  
  req.on('error', (e) => {
    console.error(e);
  });
  
  req.write(postData);
  req.end();
}


function tss_task(taskId, callback) 
{
    var postData = querystring.stringify({
      'taskId' : taskId
    });       

    var options = {
      hostname: HOST,
      port: PORT,
      path: '/examine/tsstask',
      method: 'POST',
      headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
            'Authorization': "Bearer " + TOKEN
      }
    };

    
    var req = http.request(options, (res) => {

        // vscode.window.showInformationMessage('tss_task: ' + res.statusCode);
        let data = '';

        res.on('data', (d) => {
            data += d.toString();
        });
        
        res.on('end', () => {            
            callback(data); 
        });

    });
  
  req.on('error', (e) => {
    console.error(e);
  });

  req.write(postData);
  req.end();
}

//
function uppload_code_log(ticket_id, log, callback) 
{
    var postData = querystring.stringify({
        'ticketId' : ticket_id, 
        'data': JSON.stringify(log),
        'sender': 'code'         
    });
    
    var options = {
      hostname: HOST,
      port: PORT,
      path: '/examine/codelog',
      method: 'POST',
      headers: {
           'Content-Type': 'application/x-www-form-urlencoded',
           'Content-Length': postData.length
         }
    };
    
    var req = http.request(options, (res) => {
      // vscode.window.showInformationMessage('uppload_code_log: ' + res.statusCode);

      res.on('end', () => {            
          callback(); 
      });

    });
    
    req.on('error', (e) => {
      console.error(e);
    });
    
    req.write(postData);
    req.end();
}


// collback(mes), where mes is result of cheching
//
function check(examId, taskId, userAnswer, callback) 
{
    var postData = querystring.stringify({
      'examId' : examId, 
      'taskId' : taskId, 
      'userAnswer': userAnswer, 
    });       

    var options = {
      hostname: HOST,
      port: PORT,
      path: '/examstud/check',
      method: 'POST',
      headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
            'Authorization': "Bearer " + TOKEN
      }
    };

    var req = http.request(options, (res) => {
        // vscode.window.showInformationMessage('check: ' + res.statusCode);
        let data = '';
        
        
        res.on('data', (d) => {
            data += d.toString();
        });
        
        res.on('end', () => { 
            const mes = JSON.parse(data).message;
            callback(mes);
        });

    });
  
  req.on('error', (e) => {
    console.error(e);
  });

  req.write(postData);
  req.end();
}



module.exports = {
    uppload_code_log, 
    token,
    tss_task,
    check
}
