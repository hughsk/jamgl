var bcrypt = require('bcrypt')
var db     = require('./')
var users  = db.users

module.exports = User

function User() {
  if (!(this instanceof User)) return new User

  this.username = null
  this.password = null
  this.hashed   = null
  this.email    = null
}

User.hashPassword = function(password, done) {
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return done(err)
    bcrypt.hash(password, salt, done)
  })
}

User.get = function(username, done) {
  users.get(username, function(err, data) {
    if (err) return done(err)

    var user = new User

    user.username = data.username
    user.hashed   = data.hashed
    user.email    = data.email

    return done(null, user)
  })
}

User.prototype.hashPassword = function(done) {
  if (!this.password) return done(new Error('No password set'))
  var self = this

  User.hashPassword(self.password, function(err, hash) {
    if (err) return done(err)
    done(null, self.hashed = hash)
  })
}

User.prototype.checkPassword = function(password, done) {
  bcrypt.compare(password, this.hashed, done)
}

User.prototype.save = function(done) {
  if (!this.username) return done(new Error('No username set'))
  users.put(this.username, this.toJSON(), done)
}

User.prototype.toJSON = function() {
  return {
    username: this.username
    , hashed: this.hashed
    , email: this.email
  }
}
