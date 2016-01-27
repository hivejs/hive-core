var AuthRegistry = require('./lib/AuthRegistry')

module.exports = setup
module.exports.provides = ['auth']

function setup(plugin, imports, register) {
  register(null, {auth: new AuthRegistry})
}
