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

module.exports = setup
module.exports.consumes = ["orm", "hooks", "ot"]

function setup(plugin, imports, register) {
  var hooks = imports.hooks
    , orm = imports.orm
    , ot = imports.ot

  hooks.on('orm:initialize', function*(ormSettings) {
    var models = {
      user: require('./src/user')
    , document: require('./src/document')(ot)
    , snapshot: require('./src/snapshot')
    }

    // Allow addition of new models
    yield hooks.callHook('models:load', models)

    var extendedModels = {}
    for(var name in models) {
      extendedModels[name] = Waterline.Collection.extend(models[name])
      orm.loadCollection(extendedModels[name])
    }
    yield hooks.callHook('models:loaded', extendedModels)
  })

  register()
}
