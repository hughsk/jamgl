var sublevel = require('level-sublevel')
var level    = require('level')
var path     = require('path')

var db = module.exports = sublevel(
  level(path.join(__dirname, '.db'), {
    valueEncoding: 'json'
  })
)

db.users   = db.sublevel('users')
db.entries = db.sublevel('entries')
