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
var HookRegistry = require('./lib/HookRegistry')
  , path = require('path')

module.exports = setup
module.exports.consumes = ['logger']
module.exports.provides = ['hooks']

function setup(plugin, imports, register) {
  var logger = imports.logger.getLogger('hooks')

  register(null, {hooks: new HookRegistry(logger)})
}
