var readdirp = require('fs-readdir-recursive')
var config   = require('@jamgl/config')
var path     = require('path')

module.exports = createPartials

function createPartials(directory, view) {
  var partials = readdirp(directory).map(function(p) {
    var partial = {}

    partial.abs  = path.join(directory, p)
    partial.view = path.join('partials', p)
    partial.rel  = p
    partial.name = p
      .replace(/\.[^\.]+$/, '')
      .replace(/\//g, '_')

    return partial
  })

  return partials.reduce(function(partials, partial) {
    Object.defineProperty(partials, partial.name, {
      get: function getPartialValue() {
        return view(partial.view)(partials._ctx)
      }
    })

    return partials
  }, {})
}
