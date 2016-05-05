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
  , co = require('co')
  , noop = function() {}

module.exports = function(opts) {

  /**
   * Connect to queue endpoint
   */
  var queue
  co(function*() {
    while(!queue) {
      yield function(cb) {
        queue = umbilical({port: opts['port'], address: opts['address']}
                            ,{})
        queue.on('error', function(er) {
          queue = null
          cb(er)
        })
        setTimeout(cb, 500)
      }
      yield function(cb) {
        setTimeout(cb, 1000)
      }
    }

    processWaiting()
  })

  var waiting = {}
  var provider = {
    document: function(docId) {
      return {
        push: function(fn) {
          if(!queue) {
            if(!waiting[docId]) waiting[docId] = []
            waiting[docId].push(fn)
          }
          queue.request('queue', docId, function(er) {
            fn(callback)
            function callback() {
              queue.request('callback', docId, noop)
            }
          })
        }
      , start: function() {}
      }
    }
  }

  return provider

  function processWaiting() {
    Object.keys(waiting).forEach(function(document) {
      queue = provider.document(document)
      waiting[document].forEach(function(fn) {
        queue.push(fn)
      })
    })
  }
}
