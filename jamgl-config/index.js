// The port for the HTTP server to listen to.
exports.port = parseInt(process.env.PORT || 19284, 10)

exports.dev = process.env.NODE_ENV === 'development'
exports.dev = true

exports.shouldCache = exports.dev

// secret key!
exports.secret = 'hello world'
console.log('TODO: change config.secret')
