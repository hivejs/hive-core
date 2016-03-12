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
