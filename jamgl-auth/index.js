var LocalStrategy = require('passport-local').Strategy
var passport      = require('passport')
var User          = require('@jamgl/db/User')

var auth = module.exports = {}

auth.login    = login
auth.logout   = logout
auth.register = register

auth.init    = passport.initialize()
auth.session = passport.session()

var authenticate = passport.authenticate('local', {
  failureRedirect: '/login'
})

function login(req, res, next) {
  authenticate(req, res, function(err) {
    if (err) return next(err)
    res.redirect('/')
  })
}

function logout(req, res, next) {
  req.logout()
  res.redirect('/')
}

function register(req, res, next) {
  var body = req.body
  if (!req.body) return next(new Error('missing form request body'))

  var name = body.username
  var pass = body.password
  var mail = body.email
  if (!name) return next(new Error('missing username'))
  if (!pass) return next(new Error('missing password'))
  if (!mail) return next(new Error('missing email'))

  var user = new User

  user.username = name
  user.password = pass
  user.email = mail
  user.hashPassword(function(err) {
    if (err) return next(err)

    user.save(function(err) {
      if (err) return next(err)

      req.login(user, function(err) {
        if (err) return next(err)
        res.redirect('/')
      })
    })
  })
}

passport.use(new LocalStrategy(checkUser))
passport.serializeUser(serialize)
passport.deserializeUser(deserialize)

function checkUser(name, pass, done) {
  User.get(name, function(err, user) {
    if (err && err.type === 'NotFoundError') return done(null, false)
    if (err) return done(err)

    user.checkPassword(pass, function(err, matching) {
      if (err) return done(err)

      if (!matching) return done(null, false)
      return done(null, user)
    })
  })
}

function serialize(user, done) {
  done(null, user.username)
}

function deserialize(name, done) {
  User.get(name, done)
}
