var memoize   = require('lodash.memoize')
var config    = require('@jamgl/config')
var minstache = require('minstache')
var path      = require('path')
var fs        = require('fs')

module.exports = config.shouldCache
  ? memoize(compile)
  : retry

var partials = require('./partials')(
    path.join(__dirname, 'partials')
  , module.exports
)

function compile(file) {
  if (!path.extname(file)) file = file + '.html'

  file = path.resolve(__dirname, file)
  file = fs.readFileSync(file, 'utf8')
  file = minstache.compile(file)

  return function renderView(req, res) {
    partials._ctx = this

    if (res) {
      res.locals.partials = partials
    } else {
      req.partials = partials
    }

    return arguments.length === 1
      ? file(req)
      : res.end(file(res.locals))
  }
}

function retry(file) {
  return function(req, res) {
    return arguments.length === 1
      ? compile(file)(req)
      : res.end(compile(file).call(this, req, res))
  }
}
