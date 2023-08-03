var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var proxyRouter = require('./routes/proxy.js');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 解决API跨域问题
const config = require('./config');
app.all("/*", function (req, res, next) {
  if (config.allowedOrigins === '*' || config.allowedOrigins.includes(req.headers.origin)) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Content-Type', 'application/json;charset=utf-8');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, PATCH ,OPTIONS');
    res.header("Access-Control-Allow-Credentials", true); // 跨域的时候是否携带cookie
    if (req.method.toLowerCase() == 'options')
      res.send(200); // 让options 尝试请求快速结束
    else 
      next();
  }else{
    res.json({
      code: 9403,
      msg: '没有访问权限',
      data: null
    })
  }
})

app.use('/', proxyRouter);

// 最后兜底的路由
app.all('*', (req,res) => {
  res.json({
    code: 9001,
    msg: '无效的访问',
    data: null
  })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
