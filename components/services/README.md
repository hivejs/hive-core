# hive-services
The services component is an integral part of every hive application. It is responsible
for registering and starting your services.

Components register services with the service provider. If the main hive command is called
without subcommands the services component will start the services specified in the command line arguments.

```
$ hive -s worker-pool -s someservice
```

If the service expects options, those can be passed by prefixing the command line option with the associated service name.

```
$ hive -s worker-pool --worker-pool.port=7896
```

Usually services will use the config provider (which reads from the the config files) to retrieve configuration options.
