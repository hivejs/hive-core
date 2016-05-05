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
var through = require('through2')
  , MuxDmx = require('mux-dmx')
  , duplexify = require('duplexify')
  , PassThrough = require('stream').PassThrough


module.exports = setup
module.exports.provides = ['broadcast']

function setup(plugin, imports, register) {
  var docStreams = {}
    , syncStreams = {}
  var broadcasts = {}
    , channels = {}

  var Broadcast = {
    broadcast: {
      stream: null
    , registerTransport: function(stream) {
        this.stream = MuxDmx()
        this.stream.pipe(stream).pipe(this.stream)
      }
    , registerChannel: function(id, fn) {
        if(channels[id.toString('base64')]) return
        channels[id.toString('base64')] = fn
      }
    , document: function(docId, user) {
        if(!this.stream) throw new Error('No broadcast implementation installed')
        if(!docStreams[docId]) {
          docStreams[docId] = this.stream.createDuplexStream(new Buffer('document:'+docId, 'utf8'))
        }

        var b = MuxDmx()
        if(!broadcasts[docId]) broadcasts[docId] = {}

        Object.keys(channels).forEach(function(channel) {
          var id = new Buffer(channel, 'base64')
            , client = b.createDuplexStream(id)
            , proxy = new PassThrough
            , otherClients = new PassThrough
          // Send to all local clients
          otherClients.pipe(through(function(buf, enc, cb) {
            if(Array.isArray(broadcasts[docId][channel])) {
              broadcasts[docId][channel].forEach(function(s) {
                if(s === proxy) return
                s.write(buf)
              })
            }
            cb()
          }))
          // Send to other workers
          otherClients.pipe(docStreams[docId])

          if(!Array.isArray(broadcasts[docId][channel])) broadcasts[docId][channel] = []
          broadcasts[docId][channel].push(proxy)

          // Set up channel authorization/validation
          // channel setup fn should expect (user, documentId, clientStream, broadcastStream)
          // Where clientStream data comes from a client and should be written to broadcastStream if validated to broadcast it
          // and broadcastStream data comes from another client and should be written to clientStream if authorized
          channels[channel](user, docId, client, duplexify(otherClients, proxy))

          b.on('close', function() {
            client.emit('close')
            proxy.emit('close')
            otherClients.unpipe()
            broadcasts[docId][channel].splice(broadcasts[docId][channel].indexOf(proxy), 1)
          })
        })

        return b
      }
    , sync: function(docId) {
        if(!this.stream) throw new Error('No broadcast implementation installed')
        if(!syncStreams[docId]) {
          syncStreams[docId] = this.stream.createDuplexStream(new Buffer('sync:'+docId, 'utf8'))
        }
        return syncStreams[docId]
      }
    }
  }
  register(null, Broadcast)
}
