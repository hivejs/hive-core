/**
 * hive.js
 * Copyright (C) 2013-2015 Marcel Klehr <mklehr@gmx.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var Waterline = require('waterline')
  , co = require('co')

module.exports = setup
module.exports.consumes = ["config", "hooks"]
module.exports.provides = ["orm"]

function setup(plugin, imports, register) {
  var config = imports.config
    , hooks = imports.hooks

  // Create a new instance
  var orm = new Waterline

  // Load adapters
  var adapters = {}
  config.get('orm:adapters')
    .forEach(function(adapter) {
      adapters[adapter] = require(adapter)
    })

  var settings = {
    adapters: adapters,
    connections: config.get('orm:connections'),

    defaults: {
      migrate: 'alter'
    }
  }

  setImmediate(function(){
  co(function* (){
    // defer initialization until all models have been registered
    yield hooks.callHook('orm:initialize', settings)
    try {
      var ontology = yield function(cb) {orm.initialize(settings, cb)}
    }catch(e) {
      console.error(e.stack || e)
      process.exit(1)
      return
    }
    yield hooks.callHook('orm:initialized', ontology.collections)
  }).then(function() {})
  })

  register(null, {orm: orm})
}
