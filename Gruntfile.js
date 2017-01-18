'use strict';
var path = require('path');
var fs = require('fs');

var pathToApp = path.resolve('./');
global.pathToApp = pathToApp;

var loadOptions = require('./core/loadOptions');

// NPM 3 compatibility fix
var getLoaderPackageName = function() {
    var packageName;
    var parentFolderName = path.basename(path.resolve('..'));
    var isSubPackage = parentFolderName === 'node_modules';
    var isLocalDepsAvailable = fs.existsSync('node_modules/grunt-autoprefixer') && fs.existsSync('node_modules/grunt-contrib-copy');

    if (isSubPackage && !isLocalDepsAvailable) {
        packageName = 'load-grunt-parent-tasks';
    } else {
        packageName = 'load-grunt-tasks';
    }

    return packageName;
};

module.exports = function(grunt) {
    var appPort = grunt.option('app-port') || 8080;

    // load all grunt tasks matching the `grunt-*` pattern
    require(getLoaderPackageName())(grunt, {pattern: ['grunt-*', '@*/grunt-*']});

    // measuring processing time
    require('time-grunt')(grunt);

    grunt.initConfig({
        options: loadOptions(pathToApp),

        pathToUser: '<%= options.core.common.pathToUser %>',

        banner:'/*!\n' +
                '* SourceJS - Living Style Guides Engine and Integrated Maintenance Environment for Front-end Components.\n' +
                '* @copyright 2013-2015 Sourcejs.com\n' +
                '* @license MIT license: http://github.com/sourcejs/sourcejs/wiki/MIT-License\n' +
                '* */\n',

        // clean files after build
        clean: {
            build: [
                'build'
            ]
        },

        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            gruntfile: ["Gruntfile.js"],
            modules: ["assets/js/modules/**/*.js"],
            core: [
                "app.js",
                "core/**/*.js"
            ]
        },

        copy: {
            js: {
                expand: true,
                dest: 'build',
                src: [
                    'assets/js/**/*.js',
                    '<%= pathToUser %>/assets/js/**/*.js',
                    '!assets/js/**/_*.js',
                    '!<%= pathToUser %>/assets/js/**/_*.js'
                ]
            }
        },

        uglify: {
            main: {
                options: {
                    preserveComments: 'some'
                },
                expand: true,
                dest: './',
                src: [
                    'build/**/*.js'
                ]
            }
        },

        cssmin: {
            user: {
                options: {
                    noAdvanced: true
                },
                expand: true,
                dest: 'build',
                src: [
                    '<%= pathToUser %>/assets/**/*.css'
                ]
            },

            // For processing files after preprocessors
            build: {
                options: {
                    noAdvanced: true
                },
                expand: true,
                dest: 'build',
                cwd: 'build',
                src: ['**/*.css']
            }
        },

        htmlmin: {
            main: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                expand: true,
                dest: 'build',
                src: [
                    'assets/templates/**/*.html',
                    '<%= pathToUser %>/assets/templates/**/*.html'
                ]
            }
        },

        less: {
            main: {
                files: {
                    "build/assets/css/defaults.css": "assets/css/defaults.less"
                }
            },
            bundles: {
                expand: true,
                dest: 'build/assets/css',
                cwd: 'assets/css',
                src: ['**/*.bundle.less'],
                ext: '.bundle.css'
            }
        },

        jsdoc: {
            core: {
                src: ['core/**/*.js'],
                options: {
                    destination: 'jsdoc/core'
                }
            },
            assets: {
                src: [
                    'assets/js/**/*.js',
                    '!assets/js/lib/**/*.js'
                ],
                options: {
                    destination: 'jsdoc/assets'
                }
            }
        },

        watch: {
            css: {
                files: [
                    'assets/css/**/*.less'
                ],
                tasks: ['less', 'autoprefixer'],
                options: {
                    nospawn: true
                }
            },
            js: {
                files: [
                    'assets/js/**/*.js'
                ],
                tasks: ['jshint:modules', 'resolve-js-bundles'],
                options: {
                    nospawn: true
                }
            }
        },

        autoprefixer: {
            options: {
                cascade: false,
                browsers: ['last 2 version']
            },
            main: {
                expand: true,
                dest: 'build',
                cwd: 'build',
                src: ['**/*.css']
            }
        },

        mochaTest: {
            test: {
                src: ['test/unit/**/*.js']
            },
            noApp: {
                src: ['test/unit/lib/**/*.js']
            }
        },

        casperjs: {
            options: {
                casperjsOptions: ['--app-port='+appPort]
            },
            files: ['test/functional/**/*.js']
        }
    });

    /*
    *
    * Custom tasks
    *
    * */

    grunt.registerTask('clean-build', 'Cleaning build dir if running new type of task', function(){
        if (
            grunt.file.exists('build/last-run') &&
            (grunt.task.current.args[0] === 'prod' && grunt.file.read('build/last-run') === 'dev' || grunt.task.current.args[0] === 'dev' && grunt.file.read('build/last-run') === 'prod')
            ) {

            grunt.task.run('clean:build');
        } else {
            console.log('Skipping clean build dir');
        }
    });

    grunt.registerTask('resolve-js-bundles', 'Resolving JS imports in _**.bundle.js', function(){
        // Setting custom delimiters for grunt.template
        grunt.template.addDelimiters('customBundleDelimiter', '"{%', '%}"');

        var files = grunt.file.expand([
            'assets/js/**/_*.bundle.js',
            '<%= pathToUser %>/assets/js/**/_*.bundle.js'
        ]);

        files.map(function(pathToFile){
            // **/_*.bundle.js -> build/**/*bundle.js
            var outputName = path.basename(pathToFile).replace(/^\_/, "");

            var outputDir = path.dirname(pathToFile);
            var outputFullPath = path.join('build', outputDir, outputName);

            grunt.file.write(
                outputFullPath,
                grunt.template.process(grunt.file.read(pathToFile), {
                    delimiters: 'customBundleDelimiter'
                })
            );
            grunt.log.ok('Writing to '+outputFullPath);
        });
    });

    grunt.registerTask('last-prod', 'Tag build: prod', function(){
        grunt.file.write('build/last-run', 'prod');
    });

    grunt.registerTask('last-dev', 'Tag build: dev', function(){
        grunt.file.write('build/last-run', 'dev');
    });


    /*
    *
    * Build tasks
    *
    * */

    // Regular development update task
    grunt.registerTask('update', [
        'clean-build:dev',
        'resolve-js-bundles',
        'less',
        'autoprefixer',
        'last-dev'
    ]);
    grunt.registerTask('default', ['jshint', 'update']);

    // Prod build, path to minified resources is routed by nodejs server
    grunt.registerTask('build', [
        'clean-build:prod',

        'less',
        'autoprefixer',
        'newer:cssmin:build',
        'newer:cssmin:user',
        'resolve-js-bundles',
        'newer:copy:js',
        'newer:uglify:main',

        'newer:htmlmin:main',
        'last-prod'
    ]);

    grunt.registerTask('watch-css', ['update','watch:css']);
    grunt.registerTask('watch-all', ['update','watch']);

    grunt.registerTask('ci-pre-run', [
        'jshint',
        'build',
        'update'
    ]);

    grunt.registerTask('ci-post-run', [
        'test',
        'test-func'
    ]);

    grunt.registerTask('ci-post-run-win', [
        'test'
    ]);

    /*
    *
    * Utils
    *
    * */

    // Test task. Execute with running app
    grunt.registerTask('test', 'Run ALL tests or specified by second param', function () {
        // if custom mask set - `grunt test --spec=test/unit/**/*.js`
        var spec = grunt.option('spec');
        if (spec) {
            grunt.config.set('mochaTest.test.src', [spec]);
            grunt.task.run('mochaTest:test');
        } else {
            grunt.task.run('mochaTest');
        }
    });

    // Test task. Execute with running app
    grunt.registerTask('test-func', 'Run ALL functional tests or specified by second param', function () {
        // if custom mask set - `grunt test --spec=test/functional/**/*.js`
        var spec = grunt.option('spec');
        if (spec) {
            grunt.config.set('casperjs.files', [spec]);
        }

        grunt.task.run('casperjs');
    });
};
