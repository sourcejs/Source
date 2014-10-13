module.exports = function (grunt) {
	'use strict';

	var fs = require('fs');
	var path = require('path');

	grunt.registerTask("release", "SourceJS release task", function() {
		var envName = grunt.option('env');
		var options = this.options({
			"configsPath": "configs",
			"workspace": ".",
			"ignores": [],
			"keepReleases": 5,
			"repositoryUrl": grunt.file.readJSON('package.json').repository.url,
			"hooks": {}
		});

		grunt.config.set('shipit', getNormalizedConfig(envName, options));
		createReleaseHooks(options.hooks);
		grunt.task.run(["shipit:" + envName, "deploy"]);
	});

	// TODO: implement rollback task (m.b. using map + proxy)
	grunt.registerTask("rollback", "SourceJS release task", function() {
		throw new Error("NotImplementedMethod");
	});

	// TODO: add customizable hooks into task configuration (if needed)
	var createReleaseHooks = function(hooks) {
		grunt.registerTask('remote:restart', function () {
			grunt.shipit.remote([
					'cd ' + path.join(grunt.shipit.config.deployTo, 'current'),
					'cp ' + path.join(grunt.shipit.config.deployTo, "options.js") + " ./",
					'node app'
				].join(' && '),
				this.async()
			);
		});

		grunt.shipit.on('published', function () {
			grunt.task.run(['remote:restart']);
		});		
	};

	// TODO: check if I shoud add flags redefinition which gonna have the highest priority
	var getNormalizedConfig = function(envName, options) {
		var envConfigPath = path.join(options.configsPath, envName + '.json');
		if (!fs.existsSync(envConfigPath)) {
			throw new Error("FileNotFoundError", "Config file " + envConfigPath + " not found");
		}
		var envConfig = grunt.file.readJSON(envConfigPath);
		var config = {
			"options": getNormalizedOptions(envConfig, options)
		};
		config[envName] = getNormalizedEnvOptions(envConfig, options);
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

	var getNormalizedEnvOptions = function(envOpts, taskOpts) {
		return {
        	"branch": envOpts.branch || taskOpts.branch,
        	"deployTo": envOpts.deployTo || taskOpts.deployTo
        }
	};
	
};