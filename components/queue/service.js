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
var umbilical = require('umbilical')
  , Queue = require('./lib/queue')

/**
 * Options:
 *  port: the umbilical port that workers connect to
 */
module.exports = function(opts) {
  var pool = new Queue

  /**
   * Set up pool endpoint
   */
  umbilical.endpoint({port: opts['port']},
  {
    // Called by a front server
    queue: function(docId, cb) {
      var queue = Queue(docId)
      queue.push(function(callback) {
        queue.callback = callback
        cb(null)
      })
      queue.start()
    }
  , callback: function(docId, cb) {
      var queue = Queue(docId)
      queue.callback()
      cb()
    }
  }
  , function(client) {
    // onNewClient: do nothin
    client.on('error', function() { })
  })

  return pool
}
