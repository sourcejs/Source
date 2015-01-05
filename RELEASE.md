# Realease procedure.

Deployment and rollback actions are availible from grunt. They are implemented using [grunt-shipit](https://github.com/neoziro/grunt-shipit) task. If you want to get more information about it please read [this docs](https://github.com/neoziro/grunt-shipit/blob/master/README.md).

Mentioned grunt task for deployment is added using small wrapper. It is added to simplify deployment configuration. Als grunt-shipit is able to use directly, as is.

## Release wrapper description.

Deployment wrapper provides some new abilities, here they are:
 * Several deployment environments for project (e.g. production, staging, test, etc.);
 * Simple merging configuration using inline parameters;
 * Simple and configurable deployment hooks (on build, on deploy and restart hooks);
 * Flexible configuration using both project options and deployment config;

Summarizing mentioned facts, the custom grunt-shipit deployment wrapper is quite simple and flexible. There are only two commands. `grunt release` and `grunt revert`. For each of them you can choose a specific environment and branch (as a parameter). E.g. `grunt release --env=production` or `grunt release --env=staging --branch=rc.0.4.1`. Both this options and others are described below.

## Release wrapper configuration.

Deployment configuration is quite simple. Mostly, wrapper options are inherited from grunt-shipit configuration, but the place of their definition is changed. Please follow the deployment wrapper configuration guide, described below. If you need some more information about any of described options you can read [grunt-shipit configuration guide](https://github.com/neoziro/grunt-shipit/blob/master/README.md).

## Wrapper configuration.

As it was allready mentioned, wrapper provides an ability to configure several deployment environments at the same time. To configure new environment you are to create config file. It should be named according to next template: `deploy-<%environmentName%>.json`, e.g. `deploy-test.json` or `deploy-production.json`.
Environment config (by default) should be placed into `<appRoot>/configs` directory. You can change this path if needed using your local project `options.js` file, here is [the example](/RELEASE.md##release-wrapper-configuration-example).

Then environment config is defined you can define some options in your own options.js file and use following commands to release:

```
grunt release --env=<%your-environment-name%> --branch=<%branch-to-release-name%>
grunt rollback --env=<%your-environment-name%> --branch=<%branch-to-release-name%>
```

## Options description.

#### release.configs.

Type: `String`

This options defines path for environmets definition files (deploy-test.json, deploy-production.json, etc.).

#### release.workspace.

Type: `String`

Define the local working path of the project deployed.

#### release.keepReleases.

Type: `Number`

Number of release to keep on the remote server.

#### release.ignores (ignores in environment config for isolated releases).

Type: `Array<String>`

An array of paths that match ignored files. These paths are used in the rsync command.

#### release.repositoryUrl

Type: `String`

Git URL of the project repository. Default value is the repository url from `package.json`.

#### release.branch (brunch in environment config for isolated releases).

Type: `String`

Tag, branch or commit to do local merge and deploy.

#### release.deployTo (deployTo in environment config for isolated releases).

Type: `String`

Defines the remote path where the project will be deployed. Local directory `releases` is automatically created. A symlink `current` is linked to the current release.

#### release.servers (servers in environment config for isolated releases).

Type: `String` or `Array<String>`

Servers on which the project will be deployed. Pattern must be `user@myserver.com` if user is not specified (`myserver.com`) the default user will be "deploy".

## Deployment hooks.

Hooks definition is availible in project options.js file. It is possible to define hooks set for each of defined environment. There are 3 predefined hooks which you can use as is. For each of them you can use grunt-shipit methods and variables. Also you can define your own hooks using grunt-shipit events as topics.

Each predefined hook is an object which has 2 properties: `topic` (binding event name) and `create` - callback to create hook body.
Create function has 2 arguments: grunt and path node modules. Please look at the examples below.

#### release.hooks.<envName>.install

Type: `Object`

This remote hook would be executed after files deployment, before `current` link change.
Example:

```
release: {
	...
	hooks: {
		test: {
			install: {
                topic: "updated",
                create: function(grunt, path) {
	                return function() {
	                    grunt.shipit.remote('echo "on update hook"', this.async());
	                };
	            }
            }
		}
	}
	...
}
```

#### release.hooks.<envName>.restart

Type: `Object`

This remote hook would be executed after `current` link changing.
Example:

```
release: {
	...
	hooks: {
		test: {
			restart: {
                topic: "published",
                create: function(grunt, path) {
	                return function() {
	                    grunt.shipit.remote('echo "on published hook"', this.async());
	                };
	            }
            }
		}
	}
	...
}
```

#### release.hooks.<envName>.restart

Type: `Object`

This is local hook would be executed before deployment start.
Example:

```
release: {
	...
	hooks: {
		test: {
			build: {
                topic: "fetched",
                create: function(grunt, path) {
	                return function() {
	                    grunt.shipit.local('echo "on fetched hook"', this.async());
	                };
	            }
            }
		}
	}
	...
}
```

## Release wrapper configuration example.

#### Project options.

As it was mentioned above, release wrapper options can be defined both in project options.js and environment config file. If you want to define some options in your project `options.js` file, please look at the following example:

`<appRoot>/user/options.js`
```
/** your project options **/
module.exports = {
	release: {
        configsPath: "configs", // path to environments configs is defined to <appRoot>/configs/
        workspace: ".", // <appRoot> directory is defined as base dir to deploy
        keepReleases: 2, // we should keep 2 releases at the same time (to have an ability to rollback changes)
        ignores: [".git", "*.idea", "*.iml", "*.DS_Store", "build", "node_modules"], // this files should not be deployed
        hooks: { // deployment hooks definition
            production: { // hooks for production environement only
            	// this hook is going to be executed after files deployment,
            	// before soft link to previous release will be changed to the new one
            	"install": {
                    topic: "updated", 
                    create: function() {
                        return function() {
                            grunt.shipit.remote('my-node-service stop', this.async());
                        };
                    }
                },
                // this hook is going to be executed after the soft link changing
                 "restart": {
                    topic: "published",
                    create: function(grunt, path) {
                        return function() {
                            var destination = grunt.shipit.config.deployTo; // current deployment path
                            grunt.shipit.remote([
                                    'cd ' + path.join(dest, 'current'),
                                    'npm install',
                                    'my-node-service stop'
                                ].join(' && '),
                                this.async()
                            );
                        };
                    }
                }
            },
            test: { . . . }
        }
	}
}

```

## Release wrapper configuration example.

#### Environment config.

`<appRoot>/configs/deploy-test.json` file content:

```
{
	"branch": "tests-brunch",
	"servers": "user@123.45.67.89",
    "deployTo": "/home/source/builds/test"
}
```


