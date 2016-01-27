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
 * User
 */
module.exports = {
  identity: 'user' // XXX: Is this necessary?
, connection: 'default'

, attributes: {
    name: 'string'

    // auth provider
  , type: 'string'

    // ID of the authenticating service (e.g. facebook's user id)
  , foreignId: 'string'

    // hasMany authored snapshots
  , snapshots: {
      collection: 'snapshot'
    , via: 'author'
    }

    // (see document.js)
  , documents: {
      collection: 'document'
    , via: 'authors'
    }

  , settings: 'object'

    //Automagically created:
//, id (auto-incrementing)
//, createdAt
//, updatedAt

  }
}
