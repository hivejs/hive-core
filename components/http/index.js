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
var koa = require('koa')
  , router = require('koa-router')
  , co = require('co')
  , cash = require('koa-cash')
  , http = require('http')
  , conditional = require('koa-conditional-get')
  , etag = require('koa-etag')

module.exports = setup
module.exports.provides = ['http']
module.exports.consumes = ['services', 'config', 'logger', 'hooks']

function setup(plugin, imports, register) {
  var services = imports.services
    , config = imports.config
    , logger = imports.logger.getLogger('http')
    , hooks = imports.hooks


  // Set up koa
  var koaApp = koa()
  var server = http.createServer()
  koaApp.server = server

  co(function*() {

  })

  // Use a router
  koaApp.router = router()

  // Error-handling middleware
  koaApp.on('error', function(er) {
    logger.error(er.stack || er.message || er)
  })

  // Register hive service
  services.registerService('http', function(opts) {
    var port = opts.port || config.get('http:port')

    // Log requests
    koaApp.use(function*(next) {
      logger.debug(this.request.method, this.request.url)
      yield next
    })

    // Support conditional GET for client-side resource caching
    koaApp.use(conditional())
    koaApp.use(etag())

    // Add caching
    var cache = {}
    koaApp.use(cash({
      get: function*(key, maxAge) {
        if(!cache[key] || +Date - cache[key].timestamp > maxAge) return
        return cache[key].data
      }
    , set: function*(key, data) {
        cache[key] = { data: data, timestamp: +Date}
      }
    , maxAge: 2*60*60*1000
    }))
 
    co(function*() {
      yield hooks.callHook('http:bindMiddleware')

      // add router middleware last
      koaApp.use(koaApp.router.routes())

      server.on('request', koaApp.callback())

      yield (cb) => server.listen(port, cb)
      yield hooks.callHook('http:listening', server)
    })
    .then(()=>{})
    .catch((er) => logger.error(er))
  })

  // register provider
  register(null, {
      http: koaApp
  })
}
