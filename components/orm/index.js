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
var Waterline = require('waterline')
  , co = require('co')

module.exports = setup
module.exports.consumes = ["config", "services", "hooks"]
module.exports.provides = ["orm"]

function setup(plugin, imports, register) {
  var config = imports.config
    , services = imports.services
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

  services.registerService('orm', function(opts){
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
