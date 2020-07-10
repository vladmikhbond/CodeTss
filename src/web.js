// const vscode = require('vscode');
const querystring = require('querystring');
const http = require('http');

//const HOST = 'tss.co.ua';
//const PORT = 5555;
const HOST = 'localhost';
const PORT = 49847;

let TOKEN;

// 
function token(name, pass) 
{
    return new Promise(function(resolve, reject) {

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
              reject('Wrong login or pass.');

          let data = "";
          
          res.on('data', (d) => {
            data += d.toString();
          });
          
          res.on('end', () => {
            let obj = JSON.parse(data);
            TOKEN = obj["access_token"];
            resolve(data);  // resolve  
          });

        });
        
        req.on('error', reject);
        
        req.write(postData);
        req.end();
    });
}


function details_code() 
{
    return new Promise(function(resolve, reject) {

      var postData = "";

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
              reject('Wrong something.');

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
function check(examId, userAnswer) 
{
  return new Promise(function(resolve, reject) {
    var postData = querystring.stringify({
      'examId' : examId, 
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
