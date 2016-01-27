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


function Adapter(documentId, models) {
  this.documentId = documentId
  this.Document = models.document
  this.Snapshot = models.snapshot
}

Adapter.prototype.createDocument = function(initialSnapshot, cb) {
  var document = this.Document.create(
  { firstSnapshot: initialSnapshot.id
  , latestSnapshot: initialSnapshot.id
  }, function(er, document) {
    if(er) return cb(er)
    this.documentId = document.id
    this.storeSnapshot(initialSnapshot, cb)
  }.bind(this))
}

Adapter.prototype.getFirstSnapshot = function(cb) {
  this.Document.findOne({id: this.documentId}, function(er, doc) {
    if(er) return cb(er)
    this.Snapshot.findOne({document: this.documentId, id: doc.firstSnapshot}, function(er, snapshot) {
      if(er) return cb(er)
      cb(null, {changes: snapshot.changes, parent: snapshot.parent, id: snapshot.id, contents: snapshot.contents})
    })
  }.bind(this))
}

Adapter.prototype.getLatestSnapshot = function(cb) {
  this.Document.findOne({id: this.documentId}, function(er, doc) {
    if(er) return cb(er)
    if(!doc) return cb(new Error('Document '+this.documentId+' not found'))
    this.Snapshot.findOne({document: this.documentId, id: doc.latestSnapshot}, function(er, snapshot) {
      if(er) return cb(er)
      cb(null, {changes: snapshot.changes, parent: snapshot.parent, id: snapshot.id, contents: snapshot.contents})
    })
  }.bind(this))
}

Adapter.prototype.storeSnapshot = function(snapshot, cb) {
  var snapshotId = snapshot.id
  this.Snapshot.create({changes: snapshot.changes, parent: snapshot.parent, contents: snapshot.contents, id: snapshot.id, document: this.documentId}, function(er) {
    if(er) return cb(er)
    this.Document.findOne({id: this.documentId}, function(er, doc) {
      if(er) return cb(er)
      doc.latestSnapshot = snapshotId
      doc.save(cb)
    }.bind(this))
  }.bind(this))
}

Adapter.prototype.existsSnapshot = function(editId, cb) {
  this.Snapshot.findOne({id: editId, document: this.documentId}, function(er, snapshot) {
    cb(null, !!snapshot)
  })
}

Adapter.prototype.getSnapshotsAfter = function(editId, cb) {
  var snapshots = []
  findAfter.bind(this)(null, {id: editId})
  function findAfter(er, snapshot) {
    if(!snapshot) return cb(null, snapshots)
    if(snapshot.id !== editId) snapshots.push(snapshot)
    findSnapshotAfter.bind(this)(this.documentId, snapshot.id, findAfter.bind(this))
  }
  function findSnapshotAfter(documentId, editId, cb) {
    this.Snapshot.findOne({document: documentId, parent: editId}, function(er, s) {
      if(er) return cb(er)
      cb(null, s)
    })
  }
}
