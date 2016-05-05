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
var child_process = require('child_process')
  , yargs = require('yargs')
  , toArgv = require('obj-to-argv')

function ServiceManager(cli) {
  this.registry = {}
  this.processes = {}
  this.cli = cli
}

module.exports = ServiceManager

/**
 * @param name {String}
 * @param fn{Function} fn(opts)
 */
ServiceManager.prototype.registerService = function(name, fn) {
  this.registry[name] = fn
}

/**
 * @param name {String}
 * @param opts {Object}
 * @param runInternally {Boolean} Set to false to start the service in a new node process.
 */
ServiceManager.prototype.startService = function(name, opts, runInternally) {
  if(!opts) opts = {}
  try {
    if(!this.registry[name]) throw new Error('Service '+name+' does not exist')
    if(runInternally) {
      this.startServiceInternally(name, opts)
    }else{
      return this.startServiceExternally(name, opts)
    }
  } catch(e) {
    e.message = 'Failed to start service '+name+': '+e.message
    throw e
  }
}

ServiceManager.prototype.startServiceInternally = function(name, opts) {
  this.registry[name](opts)

  return _dummyEventEmitter
}

ServiceManager.prototype.startServiceExternally = function(name, opts) {
  var args, process

  // build argv from options hash
  args = []
  args.push(require.resolve('hive/bin/hive.js'))
  args.push('-s')
  args.push(name)
  toArgv(opts, args, "--"+name)

  process = ServiceManager.spawn(args)

  if(this.processes[name]) this.processes[name].push(process)
  else this.processes[name] = [process]

  return process
}

ServiceManager.spawn = function(args) {
  return child_process.spawn('node', args, {
    stdio: 'ignore' // Logging will happen through the logging provider
  , cwd: process.cwd()
  , env: process.env
  , detached: false // XXX: It might make sense to use detached,
                     //       since it should be possible to run services
                     //       on a different machine anyway
  })
}

var _noop = function(){}
  , _dummyEventEmitter = {on: _noop, once: _noop, removeListener: _noop, removeListeners: _noop, emit: _noop}
