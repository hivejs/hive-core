var deap = require('deap')
  , fs = require('fs')

var config = module.exports = {
  data: null
, layers: []// last overrides former
, get: function(key) {
    if(!this.data) this.build()
    var val =
    key.split(':')
    .reduce((obj, key) => {
      return obj? obj[key]: obj
    }, this.data)
    // if('undefined' === typeof val) throw new Error('Config key not found: '+key)
    return val
  }
, build: function() {
    this.data = deap.extend.apply(deap, [{}].concat(this.layers))
  }
}
config.env = function(namespace, separator) {
  separator = separator || '_'
  var data =
  Object.keys(process.env)
  .filter((envVar) => namespace? envVar.indexOf(namespace+separator) === 0
                      : true)
  .reduce((obj, envVar) => {
    envVar
    .split(separator)
    .forEach((prop, i, split) => {
      if (namespace && 0 === i) return
      if (i+1 < split.length)
        obj = obj[prop]
      else
        obj[prop] = JSON.parse(process.env[envVar])    
    })
  }, {})
  return this.obj(data)
}
config.file = function(file) {
  var data = JSON.parse(fs.readFileSync(file))
  return this.obj(data)
}
config.obj = function(obj) {
  this.layers.push(obj)
  return this
}
