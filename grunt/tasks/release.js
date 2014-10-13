module.exports = function (grunt) {
	'use strict';

	var fs = require('fs');
	var path = require('path');

	[{
		"name": "release",
		"description": "SourceJS release task",
		"command": "deploy"
	}, {
		"name": "revert",
		"description": "SourceJS rollback task",
		"command": "rollback"
	}].forEach(function(task) {
		grunt.registerTask(task.name, task.description, function() {
			commonTask.call(this, task.command);
		});
	});

	var commonTask = function(cmd) {
		console.log(cmd, this);
		var options = this.options({
			"configsPath": "configs",
			"workspace": ".",
			"ignores": [],
			"keepReleases": 5,
			"repositoryUrl": grunt.file.readJSON('package.json').repository.url,
			"hooks": {}
		});
		var flagsOpts = {
			"branch": grunt.option('branch'),
			"envName": grunt.option('env')
		};
		grunt.config.set('shipit', getNormalizedConfig(options, flagsOpts));
		createReleaseHooks(options.hooks);
		grunt.task.run(["shipit:" + flagsOpts.envName, cmd]);
	};

	var createReleaseHooks = function(hooks) {
		if (!hooks) return;
		Object.keys(hooks).forEach(function(key) {
			var hook = hooks[key];
			if (typeof hook.callback === "function" && typeof hook.event === "string") {
				grunt.registerTask(key, hook.callback);
				grunt.shipit.on(hook.event, function() {
					grunt.task.run([key]);
				});
			}
		});
	};

	var getNormalizedConfig = function(options, flagsOpts) {
		var envConfigPath = path.join(options.configsPath, flagsOpts.envName + '.json');
		if (!fs.existsSync(envConfigPath)) {
			throw new Error("Config file " + envConfigPath + " not found. Please use example.json to create it.");
		}
		var envConfig = grunt.file.readJSON(envConfigPath);
		var config = {
			"options": getNormalizedOptions(envConfig, options)
		};
		config[flagsOpts.envName] = getNormalizedEnvOptions(envConfig, options, flagsOpts);
		return config;
	};

	var getNormalizedOptions = function(envOpts, taskOpts) {
		return {
			"workspace": envOpts.workspace || taskOpts.workspace,
			"ignores": envOpts.ignores || taskOpts.ignores,
			"keepReleases": envOpts.keepReleases || taskOpts.keepReleases,
			"repositoryUrl": envOpts.keepReleases || taskOpts.repositoryUrl,
			"servers": envOpts.servers || taskOpts.servers
		};
	};

	var getNormalizedEnvOptions = function(envOpts, taskOpts, flagsOpts) {
		return {
			"branch": flagsOpts.branch || envOpts.branch || taskOpts.branch,
			"deployTo": envOpts.deployTo || taskOpts.deployTo
		}
	};
	
};