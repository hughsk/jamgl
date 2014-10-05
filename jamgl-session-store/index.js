var inherits = require('inherits')

module.exports = createStore

function createStore(db, session) {
  var Store = session.Store

  inherits(LevelStore, Store)
  function LevelStore(options) {
    if (!(this instanceof LevelStore)) return new LevelStore(options)
    options = options || {}
    Store.call(this, options)
  }

  LevelStore.prototype.get = function(sid, done) {
    db.get(sid, function(err, session) {
      if (err && err.type !== 'NotFoundError') return done(err)
      session = session || {}
      session.cookie = session.cookie || {}
      done(null, session)
    })
  }

  LevelStore.prototype.set = function(sid, session, done) {
    db.put(sid, session, done)
  }

  LevelStore.prototype.destroy = function(sid, done) {
    db.del(sid, done)
  }

  return LevelStore
}
