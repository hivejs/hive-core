# hive-core
This is the core package of [hive.js](https://github.com/hivejs/hive) and the heart of every hive.js installation.

## Components
All components register with the [architect](https://npmjs.org/package/architect) hub.

The following components ship with hive-core:

hooks -- allows registration and emission of hooks
logger -- provides logging functionality
config -- loads and provides the configuration
cli -- Registry for subcommands of the hive command
services -- Registry for services that can be started via the cli (these kick off everything)
broadcast -- allows document-wise broadcasting of messages and new changes
http -- the koa.js app
orm -- Sets up the orm (waterline) and emits the orm:initialize hook to allow tweaking of settings
ot -- Allows registration of ot types
auth -- Allows registration of authentication methods and authorization implementations
sync -- Manages gulf Documents (for real-time editing)
importexport -- Coordinates import and export

## License
MPL 2.0
