var ImportExportRegistry = require('./lib/ImportExportRegistry')

module.exports = setup
module.exports.consumes = ['orm']
module.exports.provides = ['importexport']

function setup(plugin, imports, register) {
  var orm = imports.orm
  var importexport = new ImportExportRegistry(orm)

  register(null, {importexport: importexport})
}
