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
