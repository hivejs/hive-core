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
var queueService = require('./service')
  , queueProxy = require('./proxy')

module.exports = setup
module.exports.consumes = ['services', 'config']
module.exports.provides = ['queue']

function setup(plugin, imports, register) {
  var services = imports.services
    , config = imports.config

  services.registerService('queue', function(opts) {
    queueService({ "port": config.get('queue:port')
                , "control-port": config.get('queue:control-port')
                }
    )
  })

  register(null, {queue: queueProxy({
                           port: config.get('queue:port')
                         , address: config.get('queue:address')
                         })
  })
}
