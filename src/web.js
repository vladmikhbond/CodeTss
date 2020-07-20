// const vscode = require('vscode');
const querystring = require('querystring');
const http = require('http');
const vscode = require('vscode');

const config = vscode.workspace.getConfiguration('tss');
// const HOST = config.host;
// const PORT = config.port;

// const HOST = 'tss.co.ua';
// const PORT = 5556;
const HOST = 'localhost';
const PORT = 49847;

let TOKEN;

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
          if (res.statusCode > 299)
              reject('Wrong pin.');

          let data = "";
          
          res.on('data', (d) => {
            data += d.toString();
          });
          
          res.on('end', () => {
            let obj = JSON.parse(data);
            TOKEN = obj["pin_token"];
            resolve(obj);  // resolve  
          });

        });
        
        req.on('error', reject);
        
        req.write(postData);
        req.end();
    });
}


function details_code(examId=-1) 
{
    return new Promise(function(resolve, reject) {

      var postData = querystring.stringify({
        'examId' : examId, 
      });

      var options = {
        hostname: HOST,
        port: PORT,
        path: '/examstud/detailscode',
        method: 'POST',
        headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': postData.length,
              'Authorization': "Bearer " + TOKEN
        }
      };
        
      var req = http.request(options, (res) => {
        if (res.statusCode != 200)
            reject(`Something wrong. StatusCode ${res.statusCode}`);

        let data = "";
        
        res.on('data', (d) => {
          data += d.toString();
        });
        
        res.on('end', () => {    
          let model = JSON.parse(data); 
          if (typeof(model) === "object")               
              resolve(model);
          else
              reject(model);
        });

      });
      
      req.on('error', reject);
            
      req.write(postData);
      req.end();
  });
}

// result of checking: {message, restTime}
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
      path: '/taskexam/check',
      method: 'POST',
      headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
            'Authorization': "Bearer " + TOKEN
      }
    };

    var req = http.request(options, (res) => {
        
      if (res.statusCode > 299)
           reject(res.statusMessage);

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

//
function uppload_code_log(ticket_id, log) 
{
  return new Promise(function(resolve, reject) {
    var postData = querystring.stringify({
      'ticketId' : ticket_id, 
      'log': JSON.stringify(log),
      'sender': 'code'         
    });
  
    var options = {
      hostname: HOST,
      port: PORT,
      path: '/taskexam/log',
      method: 'POST',   
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length,
          'Authorization': "Bearer " + TOKEN
        }
    };
  
    var req = http.request(options, (res) => {
      res.on('end', resolve);
    });
    
    req.on('error', reject);
    
    req.write(postData);
    req.end();
  });
 }

module.exports = {
    token,
    details_code,
    check,   
    uppload_code_log
}
