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
"use strict";
var gulf = require('gulf')
  , WaterlineAdapter = require('./lib/waterline-adapter')

module.exports = setup
module.exports.consumes = ['orm', 'ot', 'queue', 'broadcast']
module.exports.provides = ['sync']

function setup(plugin, imports, register) {
  var orm = imports.orm
    , ot = imports.ot
    , queue = imports.queue
    , broadcast = imports.broadcast

  var sync = {
    documents: {}
  , createDocument: function*(type) {
      var ottype = ot.getOTType(type)
      if(!ottype) throw new Error('Specified document type is not available')

      var content = ottype.create()
        , adapter = new WaterlineAdapter(orm.collections)
      var doc = yield function(cb) {
        gulf.Document.create(adapter, ottype, content, cb)
      }
      wireDocument(doc.id, doc)
      this.documents[doc.id] = doc

      yield orm.collections.document.update({id: doc.id}, {type: type})

      return yield orm.collections.document.findOne({id: doc.id})
    }
  , getDocument: function*(docId) {
      docId = parseInt(docId)
      if(this.documents[docId]) return this.documents[docId]
      var doc = yield orm.collections.document.findOne({id: docId})
        , ottype = ot.getOTType(doc.type)
      var document
      yield function(cb) {
	document = gulf.Document.load(
	  new WaterlineAdapter(orm.collections)
	, ottype
	, docId
	, cb)
      }
      this.documents[docId] = document
      wireDocument(docId, document)
      return document
    }
  }

  function wireDocument(docId, doc) {
    // Use worker queue
    doc.queue = queue.document(docId)

    var b = broadcast.sync(docId)
    // send edits to other workers
    doc.on('edit', function(edit) {
      b.write(edit.pack())
    })
    // listen to, apply and distribute edits of other workers
    b.on('readable', function() {
      var chunk
      while(chunk = broadcast.read()) {
        var edit = gulf.Edit.unpack(chunk.toString(), doc.ottype)
        try {
          doc.applyEdit(edit)
        }catch(e) {
          console.warn('Applying foreign edit failed', edit, e.stack)
        }
        doc.distributeEdit(edit)
      }
    })
  }

  register(null, {sync: sync})
}
