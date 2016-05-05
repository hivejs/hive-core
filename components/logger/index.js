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
var log4js = require('log4js')

module.exports = setup
module.exports.consumes = ['config']
module.exports.provides = ['logger']

function setup(plugin, imports, register) {
  var config = imports.config

  log4js.replaceConsole()

  log4js.configure({appenders: config.get('logger:appenders') })

  // register provider
  register(null, {
      logger: log4js
  })
}
