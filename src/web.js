const vscode = require('vscode');
const axios = require('axios');

const config = vscode.workspace.getConfiguration('tss');

const URL = `https://${config.host}:${config.port}`;
const SENDER = 'code008';
let TOKEN;

// {pin} => {pin_token: JWT,  exam_model: модель задачи}
//
async function token(pin) 
{
  const url = URL + '/api/token_pin';

  const postData = {
      'pin': pin,
  };

  const options = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    },
  };

  const res = await axios.post(url, postData, options);

  let obj = res.data;
  TOKEN = obj.pin_token;
  return obj.exam_model;
}

// {ticketId, userAnswer, log, sender} =>  {message, restTime}
//
async function check(ticketId, userAnswer, log) 
{
  const url = URL + '/task/check';

  const postData = {
    'ticketId' : ticketId, 
    'userAnswer': userAnswer,     
    'log': JSON.stringify(log),
    'sender': SENDER         
  };

  const options = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length,
      'Authorization': "Bearer " + TOKEN
    }
  };

  const res = await axios.post(url, postData, options);

  if (res.status > 299) {
      throw Error(res.statusMessage);
  }
  return res.data;
}

// Отправляет накопленный лог на сервер
// отправитель - 'code'
//
async function uppload_code_log(ticketId, log) 
{
  const url = URL + '/task/log';

  const postData = {
    'ticketId' : ticketId, 
    'log': JSON.stringify(log),
    'sender': SENDER         
  };

  const options = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length,
      'Authorization': "Bearer " + TOKEN
    }
  };
  
  const res = await axios.post(url, postData, options);

  if (res.status > 299) {
    throw Error(res.statusMessage);
  }
}

module.exports = {
    token,
    check,   
    uppload_code_log
}
