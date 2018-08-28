const express = require('express');
const jsonfile = require('jsonfile');
const app = express();
const { Wechaty } = require('wechaty');
const qr = require('qr-image');
// const ejs = require('ejs');
const file = './settings.json';
const setObj = jsonfile.readFileSync(file);
const path = require('path');
const path1 = path.resolve('qr.png');
const session = require('express-session');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
let gotTheCode = false;
let isLogin = false;
app.set('view engine', 'ejs');
app.set('views', __dirname);
app.use(session({
  secret: 'ZzyIsTheCoolestPersonInTheWorld',
  resave: false,
  saveUninitialized: true,
}));
app.use(bodyParser());
const bot = Wechaty.instance();
bot.on('scan', (qrcode, status) => {
  console.log('gotCode');
  const qrImG = qr.image(qrcode, { type: 'png' });
  qrImG.pipe(require('fs').createWriteStream(path1));
  gotTheCode = true;
  console.log(status);
}).on('login', () => {
  console.log('登陆完成！');
  isLogin = true;
}).on('message', (msg) => {
  if (setObj.start) {
    if (msg.room() === null) {
      if (!msg.self()) {
        if (msg.text() === setObj.emergency.emergencyMsg) {
          console.log('Emergency消息收到');
        } else {
          msg.say(setObj.reply);
        }
      } else {
        console.log('send by myself');
      }
    } else {
      console.log('send by group');
    }
  }
  if (msg.self()) {
    if (msg.text() === '关闭勿扰模式') {
      setObj.start = false;
      msg.say('成功');
    } else if (msg.text() === '开启勿扰模式') {
      setObj.start = true;
      msg.say('成功');
    }
  }
})
  .start();
function cookieChecker(req, res) {
  if (req.session.pwd !== 'ZZYzzy98y') {
    res.redirect('/auth');
    return false;
  }
  return true;
}
function startService() {
  setObj.start = true;
}
app.get('/auth', (req, res) => {
  res.render('pass');
});
app.get('/', (req, res) => {
  if (cookieChecker(req, res)) {
    if (!isLogin) {
      res.render('index');
    }
    if (isLogin && !setObj.start) {
      console.log('sss');
      res.redirect('/admin.zzy');
    }
    if (isLogin && setObj.start) {
      console.log('sssss');
      res.redirect('/running.robot');
    }
  }
});

app.get('/getCode', (req, res) => {
  if (cookieChecker(req, res)) {
    setTimeout(() => {
      if (gotTheCode) {
        res.sendfile(path1);
      } else {
        res.send('err');
      }
    }, 800);
  }
});

app.get('/action/scaned', (req, res) => {
  if (cookieChecker(req, res)) {
    cookieChecker(req, res);
    setTimeout(() => {
      if (isLogin) {
        res.redirect('/admin.zzy');
      } else {
        res.send('err');
      }
    }, 1000);
  }
});

app.get('/admin.zzy', (req, res) => {
  if (cookieChecker(req, res)) {
    if (!isLogin || setObj.start) {
      res.redirect('/');
    }
    let isEM = '';
    if (setObj.emergency.useIt) {
      isEM = 'Checked="checked"';
    }
    res.render('console', { reply: setObj.reply, openEmma: isEM, emergencyMsg: setObj.emergency.emergencyMsg });
  }
});


app.get('/action/startService', (req, res) => {
  if (cookieChecker(req, res)) {
    setObj.reply = req.query.reply;
    if (req.query.useit === 'true') {
      setObj.emergency.useIt = true;
    } else {
      setObj.emergency.useIt = false;
    }
    setObj.emergency.emergencyMsg = req.query.emergencyMsg;
    setObj.setOrNot = true;
    startService();
    res.redirect('/running.robot');
    console.log(setObj);
  }
});

app.get('/running.robot', (req, res) => {
  console.log('ru');
  if (cookieChecker(req, res)) {
    if (setObj.start) {
      let useIt = '停止';
      if (setObj.emergency.useIt) {
        useIt = '启动';
      }
      res.render('running', { useit: useIt, reply: setObj.reply, emergencyMsg: setObj.emergency.emergencyMsg });
    } else {
      res.redirect('/');
    }
  }
});

app.get('/action/stop', (req, res) => {
  if (cookieChecker(req, res)) {
    setObj.start = false;
    res.redirect('/admin.zzy');
  }
});

app.post('/auth/login', (req, res) => {
  if (req.body.pwd === 'ZZYzzy98y') {
    req.session.pwd = req.body.pwd;
    res.redirect('/');
  } else {
    res.send('ARE U STUPID OR SOMETHING?<a href="../auth">I JUST INPUTED WRONG...WHO IS LAUGHING Auh?</a>');
  }
});

app.listen(PORT, () => {
  console.warn('服务器开始运行');
});

// bot.on('login', () => {
//   console.log('Login Successful!!');
//   isLogin = true;
// });
