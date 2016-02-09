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
var match = require('mime-match')

function ImportExportRegistry(orm) {
  this.orm = orm
  this.exports = {}
  this.imports = {}
}
module.exports = ImportExportRegistry

var proto = ImportExportRegistry.prototype

proto.registerExportProvider = function(type, exportType, provider) {
  if(!this.exports[type]) this.exports[type] = {}
  this.exports[type][exportType] = provider
}

proto.export = function *(snapshotId, exportType) {
  var collections = this.orm.collections
  var snapshot = yield collections.snapshot.findOne({id: snapshotId})
    , document = yield collections.document.findOne({id: snapshot.document})
  if(!this.exports[document.type]) {
    throw new Error('No export for this document type available')
  }
  if(!this.exports[document.type][exportType]) {
    throw new Error('Can\'t export '+document.type+' to '+exportType)
  }
  return yield this.exports[document.type][exportType](document, snapshot)
}


proto.registerImportProvider = function(type, importType, provider) {
  if(!this.imports[type]) this.imports[type] = {}
  this.imports[type][importType] = provider
}

proto.import = function *(documentId, user, importType, data) {
  var document = yield this.orm.collections.document.findOneById(documentId)
    , availableTypes = this.imports[document.type]
  var chosenType = Object.keys(availableTypes).filter(match(importType))[0]
  if(!chosenType) throw new Error('Unsupported import file type: '+importType)
  yield availableTypes[chosenType](document, user, data)
}
