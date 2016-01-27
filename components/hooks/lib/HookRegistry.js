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
function HookRegistry(logger) {
  this.logger = logger
  this.hooks = {}
}
module.exports = HookRegistry

HookRegistry.prototype.on =
HookRegistry.prototype.registerHook = function(hook, fn) {
  if(!this.hooks[hook]) this.hooks[hook] = []
  this.hooks[hook].push(fn)
}

HookRegistry.prototype.callHook = function *(hook) {
  this.logger.debug('calling '+hook)
  if(!this.hooks[hook]) return

  var args = Array.prototype.slice.apply(arguments, [1])
  for(var i=0; i<this.hooks[hook].length; i++) {
    yield* this.hooks[hook][i].apply(null, args)
  }
}
