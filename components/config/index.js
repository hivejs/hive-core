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
var nconf = require('nconf');

module.exports = setup
module.exports.provides = ["config"]

function setup(plugin, imports, register) {
  nconf
   .overrides({})
// .argv() // better not let argv influence this, cause we'd have to copy that to the services
   .env('__')
   .file('environment', { file: './config/'+process.env['NODE_ENV']+'.json' })
   .defaults({})

  register(null, {config: nconf});
}
