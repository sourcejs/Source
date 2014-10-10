module.exports = function (grunt) {
	'use strict';

	var fs = require('fs');
	var path = require('path');

	grunt.registerTask("release", "SourceJS release task", function() {
		var envName = grunt.option('env');
		var pkg = grunt.file.readJSON('package.json');

		var options = this.options({
			"configsPath": "configs",
			"workspace": ".",
			"keepReleases": 5,
			"repositoryUrl": pkg.repository.url
		});

		var config = formatShipitConfig(envName, options);
		grunt.config.set('shipit', config);
		createHooks();

		grunt.task.run(["shipit:" + envName, "deploy"]);
	});

	var createHooks = function() {
		grunt.registerTask('remote:restart', function () {
			grunt.shipit.remote([
					'cd ' + path.join(grunt.shipit.config.deployTo, 'current'),
					'npm i',
					'echo "test"'
				].join(' && '),
				this.async()
			);
			grunt.shipit.remote('echo "test"', this.async());
		});

		grunt.shipit.on('published', function () {
			grunt.task.run(['remote:restart']);
		});		
	};

	var formatShipitConfig = function(envName, options) {
		var config = {};
		var envConfigPath = path.join(options.configsPath, envName + '.json');
		if (!fs.existsSync(envConfigPath)) {
			throw new Error("FileNotFoundError", "Config file " + envConfigPath + " not found");
		}
		var envConfig = grunt.file.readJSON(envConfigPath);
		config.options = {
                workspace: options.workspace || ".",
                ignores: envConfig.ignores || [],
                keepReleases: options.keepReleases,
                repositoryUrl: options.repositoryUrl,
                servers: envConfig.servers
            };
        config[envName] = {
        	"branch": envConfig.branch,
        	"deployTo": envConfig.deployTo
        };
		return config;
	};
	
};