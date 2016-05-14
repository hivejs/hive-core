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
    try {
      yield this.hooks[hook][i].apply(null, args)
    }catch(e) {
      this.logger.fatal('Call-and-yield-ing a hook caused an error:', e.stack || e)
      this.logger.fatal('This is the code of the faulty hook:', '\n'+this.hooks[hook][i])
      process.exit(1)
    }
  }
}
