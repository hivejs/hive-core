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
var jwt = require('jsonwebtoken')
  , path = require('path')
module.exports = setup
module.exports.consumes = ["auth", "orm", "config"]
module.exports.provides = ["authToken"]

function setup(plugin, imports, register) {
  var auth = imports.auth
    , orm = imports.orm

  var secret = imports.config.get('authToken:secret')

  auth.registerAuthenticationProvider('token', function*(credentials) {
    if(!credentials) return
    // verify JWT
    var decoded = yield function(cb) {
      jwt.verify(credentials, secret, cb)
    }

    var user = yield orm.collections.user.findOne({id: decoded.user})
    if(user) user.scope = decoded.scope
    return user
  })

  register(null, {authToken: {sign: function*(payload) {
    return yield function(cb) {
      cb(null, jwt.sign(payload, secret))
    }
  }}})
}
