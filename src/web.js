const vscode = require('vscode');
const querystring = require('querystring');
const http = require('http');

const config = vscode.workspace.getConfiguration('tss');
const HOST = config.host;
const PORT = config.port;

let TOKEN;

// {pin} => {pin_token: JWT,  exam_model: модель задачи}
//
function token(pin) 
{
    return new Promise(function(resolve, reject) {

        var postData = querystring.stringify({
          'pin': pin,
        });

        var options = {
          hostname: HOST,
          port: PORT,
          path: '/api/token_pin',
          method: 'POST',
          headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
          }
        };
          
        var req = http.request(options, (res) => {
          if (res.statusCode > 299) {
              reject(`${res.statusCode} - ${res.statusMessage}`);
          }

          let data = "";
          
          res.on('data', (d) => {
            data += d.toString();
          });
          
          res.on('end', () => {
            let obj = JSON.parse(data);
            TOKEN = obj.pin_token;
            resolve(obj.exam_model);  // resolve  
          });

        });
        
        req.on('error', e => { 
          reject(e.message); 
        });
        
        req.write(postData);
        req.end();
    });
}

// {ticketId, userAnswer, log, sender} =>  {message, restTime}
//
function check(ticketId, userAnswer, log) 
{
  return new Promise(function(resolve, reject) {
    var postData = querystring.stringify({
      'ticketId' : ticketId, 
      'userAnswer': userAnswer,     
      'log': JSON.stringify(log),
      'sender': 'code'         
    });       

    var options = {
      hostname: HOST,
      port: PORT,
      path: '/task/check',
      method: 'POST',
      headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
            'Authorization': "Bearer " + TOKEN
      }
    };

    var req = http.request(options, (res) => {
        
        if (res.statusCode > 299) {
            reject(res.statusMessage);
        }
        let data = '';
        
        res.on('data', (d) => {
            data += d.toString();
        });
        
        res.on('end', () => { 
            resolve(JSON.parse(data));
        });
    });
  
    req.on('error', reject);

    req.write(postData);
    req.end(); 
  });
}

// Отправляет накопленный лог на сервер
// отправитель - 'code'
//
function uppload_code_log(ticket_id, log) 
{
  return new Promise(function(resolve, reject) {
    let postData = querystring.stringify({
      'ticketId' : ticket_id, 
      'log': JSON.stringify(log),
      'sender': 'code'         
    });
  
    let options = {
      hostname: HOST,
      port: PORT,
      path: '/task/log',
      method: 'POST',   
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length,
          'Authorization': "Bearer " + TOKEN
        }
    };

    let req = http.request(options, (res) => {
        if (res.statusCode > 299) {
            reject(res.statusMessage);
        }
        // по-видимому, из-за того, что в ответе нет данных, нет и обработчика события 'end'
        resolve(); 
    });
    
    req.on('error', reject);
    
    req.write(postData);
    req.end();
  });
 }

module.exports = {
    token,
    check,   
    uppload_code_log
}
