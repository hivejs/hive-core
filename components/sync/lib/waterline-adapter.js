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
module.exports = Adapter


function Adapter(models) {
  this.Document = models.document
  this.Snapshot = models.snapshot
}

Adapter.prototype.createDocument = function(initialSnapshot, cb) {
  this.Document.create(
  { firstSnapshot: initialSnapshot.id
  , latestSnapshot: initialSnapshot.id
  }, function(er, document) {
    if(er) return cb(er)
    this.storeSnapshot(document.id, initialSnapshot, function(er) {
      if(er) return cb(er)
      cb(null, document.id)
    })
  }.bind(this))
}

Adapter.prototype.getFirstSnapshot = function(docId, cb) {
  this.Document.findOne({id: docId}, function(er, doc) {
    if(er) return cb(er)
    this.Snapshot.findOne({
      document: docId
    , id: doc.firstSnapshot
    }, function(er, snapshot) {
      if(er) return cb(er)
      cb(null, {
        changes: snapshot.changes
      , parent: snapshot.parent
      , id: snapshot.id
      , contents: snapshot.contents
      , author: snapshot.author.toString('utf8')
      })
    })
  }.bind(this))
}

Adapter.prototype.getLatestSnapshot = function(docId, cb) {
  this.Document.findOne({id: docId}, function(er, doc) {
    if(er) return cb(er)
    if(!doc) return cb(new Error('Document '+this.documentId+' not found'))
    this.Snapshot.findOne({
      document: docId
    , id: doc.latestSnapshot
    }, function(er, snapshot) {
      if(er) return cb(er)
      if(!snapshot) return cb(new Error('Could not findCould not find last snapshot of document '+docId))
      cb(null, {
        changes: snapshot.changes
      , parent: snapshot.parent
      , id: snapshot.id
      , contents: snapshot.contents.toString('utf8')
      , author: snapshot.author
      })
    })
  }.bind(this))
}

Adapter.prototype.storeSnapshot = function(docId, snapshot, cb) {
  var snapshotId = snapshot.id
  this.Snapshot.create({
    changes: snapshot.changes
  , parent: snapshot.parent
  , contents: new Buffer(snapshot.contents)
  , id: snapshot.id
  , document: docId
  , author: snapshot.author
  }, function(er) {
    if(er) return cb(er)
    this.Document.findOne({id: docId}, function(er, doc) {
      if(er) return cb(er)
      doc.latestSnapshot = snapshotId
      doc.save(cb)
    }.bind(this))
  }.bind(this))
}

Adapter.prototype.existsSnapshot = function(docId, editId, cb) {
  this.Snapshot.findOne({
    id: editId
  , document: docId
  }, function(er, snapshot) {
    cb(null, !!snapshot)
  })
}

Adapter.prototype.getSnapshotsAfter = function(docId, editId, cb) {
  var snapshots = []
  findAfter.call(this, null, {id: editId})
  function findAfter(er, snapshot) {
    if(er) return cb(er)
    if(!snapshot) return cb(null, snapshots)
    if(snapshot.id !== editId) snapshots.push(snapshot)
    findSnapshotAfter.call(this, snapshot.id, findAfter.bind(this))
  }
  function findSnapshotAfter(editId, cb) {
    this.Snapshot.findOne({document: docId, parent: editId}, function(er, s) {
      if(er) return cb(er)
      cb(null, s)
    })
  }
}
