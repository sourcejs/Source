module.exports = function (grunt) {
	'use strict';

	var fs = require('fs');
	var path = require('path');

	grunt.registerTask("release", "SourceJS release task", function() {
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
		grunt.task.run(["shipit:" + flagsOpts.envName, "deploy"]);
	});

	// TODO: implement rollback task (m.b. using map + proxy)
	grunt.registerTask("rollback", "SourceJS release task", function() {
		throw new Error("NotImplementedMethod");
	});

	// TODO: add customizable hooks into task configuration (if needed)
	var createReleaseHooks = function(hooks) {
		if (hooks && hooks.buildApp) {
			grunt.registerTask('buildApp', 'Build project', function () {
				grunt.shipit.local('grunt', this.async());
			});
			grunt.shipit.on('fetched', function () {
				grunt.task.run(['build']);
			});
		}
		if (hooks && hooks.install) {
			grunt.registerTask('remote:install', hooks.install);
			grunt.shipit.on('updated', function () {
				grunt.task.run(['remote:install']);
			});
		}
		if (hooks && hooks.restart) {
			grunt.registerTask('remote:restart', hooks.restart);
			grunt.shipit.on('published', function () {
				grunt.task.run(['remote:restart']);
			});
		}
	};

	// TODO: check if I shoud add flags redefinition which gonna have the highest priority
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