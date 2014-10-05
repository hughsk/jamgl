var Store        = require('@jamgl/session-store')
var redirect     = require('response-redirect')
var wreq         = require('watchify-request')
var session      = require('express-session')
var cookieParser = require('cookie-parser')
var config       = require('@jamgl/config')
var views        = require('@jamgl/views')
var auth         = require('@jamgl/auth')
var db           = require('@jamgl/db')
var bodyParser   = require('body-parser')
var browserify   = require('browserify')
var watchify     = require('watchify')
var router       = require('course')()
var http         = require('http')

http.createServer(function(req, res) {
  router(req, res, function(err) {
    if (err) return bail(err, req, res)
    res.statusCode = 404
    res.end('404')
  })
}).listen(config.port, function(err) {
  if (err) throw err
  console.log('http://localhost:'+config.port+'/')
})

var bundle = browserify({
    cache: {}
  , packageCache: {}
  , fullPaths: config.shouldCache
  , entries: ['./index.js']
})

if (config.shouldCache) {
  bundle = watchify(bundle)
}

http.ServerResponse.prototype.redirect = redirect

router.all(
    cookieParser(config.secret)
  , bodyParser.urlencoded({ extended: false })
  , bodyParser.json()
  , session({
      secret: config.secret
    , resave: true
    , saveUninitialized: true
    , store: new (Store(db, session))
  })
  , auth.init
  , auth.session
  , function(req, res, next) {
    res.locals =
    req.locals = { user: req.user }
    next()
  }
)

router
  .get('/', views('index'))
  .get('/bundle.js', wreq(bundle))

router
  .get('/login', views('login'))
  .post('/login', auth.login)
  .get('/logout', auth.logout)
  .get('/register', views('register'))
  .post('/register', auth.register)

function bail(err, req, res) {
  res.statusCode = 500
  res.setHeader('content-type', 'text/plain')
  res.end([err.message, err.stack].join('\n'))
}
