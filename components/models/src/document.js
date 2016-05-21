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
var gulf = require('gulf')
  , co = require('co')
/**
 * Document
 */
module.exports = function(ot) {
  return {
    identity: 'document'
  , connection: 'default'

  , attributes: {
      // ot adapter
      type: 'string'

      // hasMany snapshots
    , snapshots: {
        collection: 'snapshot'
      , via: 'document' // Snapshot.document
      }

      // hasOne latest snapshot
    , latestSnapshot: {
        model: 'snapshot'
      }

      // hasMany authors (manyToMany through snapshot??)
      // https://github.com/balderdashy/waterline/issues/391
    , authors: {
        collection: 'user'
      , via: 'documents'
      , dominant: true
      }

      , settings: 'json'

      //Automagically created:
  //, id (auto-incrementing)
  //, createdAt
  //, updatedAt
   
    }

    // Class methods
  , createWithSnapshot: createWithSnapshot
  , override_create: createWithSnapshot // hook for interface-rest-api
  , afterDestroy: afterDestroy
  }

  function* createWithSnapshot(obj) {
    var ottype = ot.getOTType(obj.type)
    if(!ottype) throw new Error('Specified document type is not available')
    
    var edit = gulf.Edit.newInitial(ottype)
    var contents = ottype.serialize? ottype.serialize(ottype.create()) : ottype.create()
    obj.firstSnapshot = edit.id
    obj.latestSnapshot = edit
    var doc = yield this.create(obj)
     
    var snapshot = {
      id: edit.id
    , document: doc.id
    , changes: JSON.stringify(edit.changeset)
    , contents: new Buffer(JSON.stringify(contents))
  //, author: not given, since this not a change, but an initial snapshot
    }
    // `create` throws in MySql for example, because the doc creation triggers the creation of an empty snapshot with that id :/
    yield this.waterline.collections.snapshot.update({id: edit.id}, snapshot) 
    return doc
  }

  function afterDestroy(deletedRecord, next) {
    co(function*() {
      var snapshots = yield this.waterline.collections.snapshot.find({document: deletedRecord.id})
      for(var i=0; i<snapshots.length; i++) {
	yield snapshots[i].destroy()
      }
    }).then(next, next)
  }
}
