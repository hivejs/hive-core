/**
 * hive.js
 * Copyright (C) 2013-2016 Marcel Klehr <mklehr@gmx.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Mozilla Public License version 2
 * as published by the Mozilla Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the Mozilla Public License
 * along with this program.  If not, see <https://www.mozilla.org/en-US/MPL/2.0/>.
 */
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
