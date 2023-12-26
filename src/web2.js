const vscode = require('vscode');
// const querystring = require('querystring');
const axios = require('axios');

const config = vscode.workspace.getConfiguration('tss');
const HOST = config.host;
const PORT = config.port;

let TOKEN;

// {pin} => {pin_token: JWT,  exam_model: модель задачи}
//
async function token(pin) 
{
  const url = `https://${HOST}:${PORT}/api/token_pin`;
  const postData = {
      'pin': pin,
  };

  const options = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    },
  };
  // Виконуємо POST-запит за допомогою axios та очікуємо на відповідь
  const res = await axios.post(url, postData, options);
      // Обробляємо відповідь сервера
  let obj = res.data;
  TOKEN = obj.pin_token;
  return obj.exam_model;
}

// // {ticketId, userAnswer, log, sender} =>  {message, restTime}
// //
// function check(ticketId, userAnswer, log) 
// {
//   return new Promise(function(resolve, reject) {
//     var postData = querystring.stringify({
//       'ticketId' : ticketId, 
//       'userAnswer': userAnswer,     
//       'log': JSON.stringify(log),
//       'sender': 'code'         
//     });       

//     var options = {
//       hostname: HOST,
//       port: PORT,
//       path: '/task/check',
//       method: 'POST',
//       headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             'Content-Length': postData.length,
//             'Authorization': "Bearer " + TOKEN
//       }
//     };

//     var req = http.request(options, (res) => {
        
//         if (res.statusCode > 299) {
//             reject(res.statusMessage);
//         }
//         let data = '';
        
//         res.on('data', (d) => {
//             data += d.toString();
//         });
        
//         res.on('end', () => { 
//             resolve(JSON.parse(data));
//         });
//     });
  
//     req.on('error', reject);

//     req.write(postData);
//     req.end(); 
//   });
// }

// // Отправляет накопленный лог на сервер
// // отправитель - 'code'
// //
// function uppload_code_log(ticket_id, log) 
// {
//   return new Promise(function(resolve, reject) {
//     let postData = querystring.stringify({
//       'ticketId' : ticket_id, 
//       'log': JSON.stringify(log),
//       'sender': 'code'         
//     });
  
//     let options = {
//       hostname: HOST,
//       port: PORT,
//       path: '/task/log',
//       method: 'POST',   
//       headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'Content-Length': postData.length,
//           'Authorization': "Bearer " + TOKEN
//         }
//     };

//     let req = http.request(options, (res) => {
//         if (res.statusCode > 299) {
//             reject(res.statusMessage);
//         }
//         // по-видимому, из-за того, что в ответе нет данных, нет и обработчика события 'end'
//         resolve(); 
//     });
    
//     req.on('error', reject);
    
//     req.write(postData);
//     req.end();
//   });
//  }

module.exports = {
    token,
    // check,   
    // uppload_code_log
}
