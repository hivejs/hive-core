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
function AuthRegistry() {
  this.authentication = {}
  this.authorization = []
}
module.exports = AuthRegistry

AuthRegistry.prototype.registerAuthenticationProvider = function(type, provider) {
  this.authentication[type] = provider
}

/**
 * Returns a User object or undefined
 */
AuthRegistry.prototype.authenticate = function *(authType, credentials) {
  if(!this.authentication[authType]) return
  return yield this.authentication[authType](credentials)
}


AuthRegistry.prototype.registerAuthorizationProvider = function(provider) {
  this.authorization.push(provider)
}

/**
 * Returns a boolean value
 */
AuthRegistry.prototype.authorize = function *(user, action, data) {
  if(!this.authorization.length) return true

  var result = null

  for(var i=0; i<this.authorization.length; i++) {
    var allow = yield this.authorization[i](user, action, data)
    if(allow === false) return false
    if(allow === true) result = true
  }
  return !!result
}
