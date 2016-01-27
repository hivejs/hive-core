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
var ServiceManager = require('./lib/ServiceManager')
  , yargs = require('yargs')

module.exports = setup
module.exports.consumes = ['config','cli']
module.exports.provides = ['services']

function setup(plugin, imports, register) {
  var cli = imports.cli

  var serviceManager = new ServiceManager(cli)

  // The main hive routine. Will kick things off.
  cli.registerCommand("", function(argv) {
    var opts = yargs.parse(argv)
    var startServices = []
    if(opts.s) {
      if(Array.isArray(opts.s)) startServices = startServices.concat(opts.s)
      else startServices.push(opts.s)
    }
    if(opts.start) {
      if(Array.isArray(opts.start)) startServices = startServices.concat(opts.start)
      else startServices.push(opts.start)
    }

    startServices.forEach(function(service) {
      // start all mentioned services internally and provide them with their options
      serviceManager.startService(service, opts[service], true)
    })
  })

  register(null, {
    services: serviceManager
  })
}
