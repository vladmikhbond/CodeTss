const vscode = require('vscode');
const querystring = require('querystring');
const http = require('http');

//const HOST = 'tss.co.ua';
//const PORT = 5555;
const HOST = 'localhost';
const PORT = 63751;

let TOKEN;

//
function token(name, pass) 
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
    let data = "";
    
    res.on('data', (d) => {
      data += d.toString();
    });
    
    res.on('end', () => {
      let obj = JSON.parse(data);
      TOKEN = obj["access_token"];
      vscode.window.showInformationMessage('successful login'); 
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
        let data = '';

        res.on('data', (d) => {
            data += d.toString();
        });
        
        res.on('end', () => {            
            callback(JSON.parse(data)); 
        });

    });
  
  req.on('error', (e) => {
    console.error(e);
  });

  req.write(postData);
  req.end();
}


//
function write_to_server(log_id, all_changes) 
{
    var postData = querystring.stringify({
        'ticketId' : log_id, 
        'data': JSON.stringify(all_changes),
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
      if (res.statusCode == 200)
         vscode.window.showInformationMessage("Saved on END");	
      else
         vscode.window.showInformationMessage('Not Saved');
 
      res.on('data', (d) => {
        process.stdout.write(d);
      });
    });
    
    req.on('error', (e) => {
      console.error(e);
    });
    
    req.write(postData);
    req.end();
}


function check(examId, taskId, userAnswer) 
{
    var postData = querystring.stringify({
      'examId' : examId, 
      'taskId' : taskId, 
      'userAnswer': userAnswer, 
    });       

    var options = {
      hostname: HOST,
      port: PORT,
      path: '/examine/check',
      method: 'POST',
      headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
            'Authorization': "Bearer " + TOKEN
      }
    };

    
    var req = http.request(options, (res) => {
        let data = '';
        vscode.window.showInformationMessage(res.statusCode);	     
        
        res.on('data', (d) => {
            data += d.toString();
        });
        
        res.on('end', () => {
            vscode.window.showInformationMessage(data);	 
            console.log(data);
        });

    });
  
  req.on('error', (e) => {
    console.error(e);
  });

  req.write(postData);
  req.end();
}



module.exports = {
    write_to_server, 
    token,
    tss_task,
    check
}
