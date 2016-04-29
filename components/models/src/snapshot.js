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
/**
 * Snapshot
 */
module.exports = {
  identity: 'snapshot'
, connection: 'default'
, autoPK: false

, attributes: {
    id: {
      type: 'string'
    , primaryKey: true
    }

    // the changeset
  , changes: 'binary'

    // the content resulting from the changes
  , contents: 'binary'

    // belongsTo a document
  , document: {
      model: 'document'
    }

    // belongsTo an author
  , author: {
      model: 'user'
    }
  
  , parent: {
      model: 'snapshot'
    }

    //Automagically created:
//, createdAt
//, updatedAt

  }

// Class methods

, post: function*() {
    this.throw(403)
  }
}
