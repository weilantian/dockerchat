const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { Wechaty } = require('wechaty');
const qr = require('qr-image');
// const ejs = require('ejs');
const setObj = {
  start: false, setOrNot: false, reply: 'sss', emergency: { useIt: true, emergencyMsg: 'emergency' },
};
const path = require('path');
const path1 = path.resolve('qr.png');
const session = require('express-session');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
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
bot.on('scan', (qrcode) => {
  const qrImG = qr.image(qrcode, { type: 'png' });
  qrImG.pipe(require('fs').createWriteStream(path1));
  isLogin = false;
  gotTheCode = true;
  io.emit('finishWatting');
  isLogin = false;
}).on('login', () => {
  io.emit('loginSuccessed');
  isLogin = true;
}).on('message', (msg) => {
  if (setObj.start) {
    if (msg.room() === null) {
      if (!msg.self()) {
        if (msg.text() !== setObj.emergency.emergencyMsg) {
          msg.say(setObj.reply);
        }
      }
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
  if (!gotTheCode) {
    res.redirect('/wait');
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
      res.redirect('/admin.zzy');
    }
    if (isLogin && setObj.start) {
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

app.get('/wait', (req, res) => {
  res.render('wait');
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
    } else {
      let isEM = '';
      if (setObj.emergency.useIt) {
        isEM = 'Checked="checked"';
      }
      res.render('console', { reply: setObj.reply, openEmma: isEM, emergencyMsg: setObj.emergency.emergencyMsg });
    }
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
  }
});

app.get('/running.robot', (req, res) => {
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

app.get('/action/logout', (req, res) => {
  if (cookieChecker(req, res) && isLogin) {
    bot.logout();
    setTimeout(() => {
      bot.start();
      isLogin = false;
      res.redirect('/');
    }, 3000);
  }
});

io.on('connection', () => {});

http.listen(PORT, () => {});

// bot.on('login', () => {
//   console.log('Login Successful!!');
//   isLogin = true;
// });
