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
var config = require('./lib/config')
module.exports = setup
module.exports.provides = ["config"]

function setup(plugin, imports, register) {
  config.file('./config/default.json')
  if(process.env['NODE_ENV']) {
     config.file('./config/'+process.env['NODE_ENV']+'.json')
  }
  config.env('hive')

  register(null, {config: config});
}
