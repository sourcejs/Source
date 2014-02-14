var path = require('path');

module.exports = function(grunt) {
    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    // measuring processing time
    require('time-grunt')(grunt);

    var removePathInDest = function(inputPath, destBase, destPath) {
        // remove some path from destination file path in public dir
        var newPath,
            regex = '^'+inputPath+'/|\\W'+inputPath+'/';

        newPath = destBase + destPath.replace(new RegExp(regex), '/');
        newPath = path.normalize(newPath).replace(/\\/g, '/');

        return newPath;
    };

    var getSourceOptions = function() {
        var options = require('./core/options');

        return options;
    };

    // Tasks
    grunt.initConfig({
        // load options from file
        options: getSourceOptions(),
        pathToSpecs: '<%= options.common.pathToSpecs %>',
        pathToSpecsOnRemote: '<%= options.grunt.remote.pathToDir %>',
        deployHost: '<%= options.grunt.remote.host %>',
        deployPort: '<%= options.grunt.remote.port %>',
        deployKey: '<%= options.grunt.remote.key %>',

        banner:'/*\n' +
                '* Source - Front-end documentation engine\n' +
                '* @copyright 2013 Sourcejs.com\n' +
                '* @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License\n' +
                '* */\n',

        filesToWatch:                       [
                                                'client-side/src/**',
                                                'client-side/src/**/*'
                                            ],

        excludedFilesForUpload:             ['**/.DS_Store'],

        // copy all files excluding ignored to project folder
        copy: {
            initClient: {
                files: [
                    {
                        src: [
                            'client-side/init/**',
                            'client-side/init/.gitignore'
                        ],
                        dest: '<%= pathToSpecs %>/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client-side/init',destBase, destPath);
                        }
                    },
                    {
                        src: ['client-side/src/data/**'],
                        dest: '<%= pathToSpecs %>/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client-side/src',destBase, destPath);
                        }
                    },
                    {
                        src: ['License.md'],
                        dest: '<%= pathToSpecs %>/'
                    },
                    {
                        src: ['_.ftppass'],
                        dest: '.ftppass'
                    }
                ]
            },

            initServer: {
                files: [
                    {
                        src: [
                            'init/**'
                        ],
                        dest: 'user/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('init',destBase, destPath);
                        }
                    }
                ]
            },

            main: {
                files: [
                    {
                        src: [
                            'client-side/src/**'
                            ],
                        dest: '<%= pathToSpecs %>/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client-side/src',destBase, destPath);
                        }
                    },
                    {
                        src: ['client-side/plugins/**','!client-side/plugins/package.json'],
                        dest: '<%= pathToSpecs %>/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client-side',destBase, destPath);
                        }
                    }
                ]
            },

            remote: {
                files: [
                    {
                        src: ['client-side/src/**'],
                        dest: 'build/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client-side/src',destBase, destPath);
                        }
                    },
                    {
                        src: ['client-side/plugins/**','!client-side/plugins/package.json'],
                        dest: 'build/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client-side',destBase, destPath);
                        }
                    }
                ]
            }
        },

        // minify all css needed files
        cssmin: {
            main: {
                files: [
                    {
                        src: [
                            'client-side/src/**/*.css',
                            '!client-side/src/core/css/core.css',
                            '!client-side/src/data/docs/project.css'
                        ],
                        dest: '<%= pathToSpecs %>/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client-side/src',destBase, destPath);
                        }
                    },
                    {
                        src: ['client-side/plugins/**/*.css'],
                        dest: '<%= pathToSpecs %>/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client-side',destBase, destPath);
                        }
                    }
                ]
            },

            remote: {
                files: [
                    {
                        src: [
                            'client-side/src/**/*.css',
                            '!client-side/src/core/css/core.css'
                        ],
                        dest: 'build/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client-side/src',destBase, destPath);
                        }
                    },
                    {
                        src: ['client-side/plugins/**/*.css'],
                        dest: 'build/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client-side',destBase, destPath);
                        }
                    }
                ]
            },

            addBanner: {
                expand: true,
                options: {
                    banner: '<%= banner %>'
                },
                src: ['client-side/src/core/css/defaults.css'],
                dest: '<%= pathToSpecs %>/',
                ext: '.css',
                rename: function(destBase, destPath) {
                    return removePathInDest('client-side/src',destBase, destPath);
                }
            },

            addRemoteBanner: {
                expand: true,
                options: {
                    banner: '<%= banner %>'
                },
                src: ['client-side/src/core/css/defaults.css'],
                dest: 'build/',
                ext: '.css',
                rename: function(destBase, destPath) {
                    return removePathInDest('client-side/src',destBase, destPath);
                }
            }
        },

        // minify all js files via uglify
        uglify: {

            // TODO: kill this copypaste
            main: {
                files: [
                    {
                        src: [
                            'client-side/src/**/*.js',
                            '!client-side/src/test/js/**/*.js',
                            '!client-side/src/test/spec/**/*.js'
                        ],
                        dest: '<%= pathToSpecs %>/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client-side/src',destBase, destPath);
                        }
                    },
                    {
                        src: ['client-side/plugins/**/*.js'],
                        dest: '<%= pathToSpecs %>/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client-side',destBase, destPath);
                        }
                    }
                ]
            },

            remote: {
                files: [
                    {
                        src: [
                            'client-side/src/**/*.js',
                            '!client-side/src/test/js/**/*.js',
                            '!client-side/src/test/spec/**/*.js'
                        ],
                        dest: 'build/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client-side/src',destBase, destPath);
                        }
                    },
                    {
                        src: ['client-side/plugins/**/*.js'],
                        dest: 'build/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client-side',destBase, destPath);
                        }
                    }
                ]
            },

            addBanner: {
                options: {
                        banner: '<%= banner %>\n'
                    },
                files: [{
                    expand: true,
                    src: 'client-side/src/core/js/*.js',
                    dest: '<%= pathToSpecs %>/',
                    rename: function(destBase, destPath) {
                        return removePathInDest('client-side/src',destBase, destPath);
                    }
                }]
            },

            addRemoteBanner: {
                options: {
                        banner: '<%= banner %>\n'
                    },
                files: [{
                    expand: true,
                    src: 'client-side/src/core/js/*.js',
                    dest: 'build/',
                    rename: function(destBase, destPath) {
                        return removePathInDest('client-side/src',destBase, destPath);
                    }
                }]
            }
        },

        // deploy to remote all needed file
        'sftp-deploy': {
            deploy: {
                auth: {
                    host: '<%= deployHost %>',
                    port: '<%= deployPort %>',
                    authKey: '<%= deployKey %>'
                },
                src: 'build',
                dest: '<%= pathToSpecsOnRemote %>',
                exclusions: '<%= excludedFilesForUpload %>'
            }
        },

        // clean files after build
        clean: {
            build: {
                src: ['build/']
            },
            all: {
                src: [
                    '<%= pathToSpecs %>/client-side'
                    ]
            },
            remote: {
                src: [
                    'build/client-side'
                    ]
            },
            initServer: {
                src: [
                    'user/init'
                    ]
            }
        },

        watch: {
            main: {
                files: '<%= filesToWatch %>',
                tasks: ['less:main','copy:main','clean:all'],
                options: {
                    nospawn: true
                }
            }
        },

        less: {
            main: {
                files: {
                    "client-side/src/core/css/defaults.css": "client-side/src/core/css/less/defaults.less"
                }
            }
        }
    });


    // TODO: make cleaning task for existing plugins update

    // Init server-side
    grunt.registerTask('initServer', ['copy:initServer', 'clean:initServer']);

    // Init client-side
    grunt.registerTask('initClient', ['copy:main', 'copy:initClient', 'uglify:main', 'uglify:addBanner', 'cssmin:main', 'cssmin:addBanner', 'clean:all']);

    // Init new project in Source
    grunt.registerTask('init', ['copy:initServer', 'clean:initServer', 'copy:main', 'copy:initClient', 'uglify:main', 'uglify:addBanner', 'cssmin:main', 'cssmin:addBanner', 'clean:all']);

    // Local deploy task to public folder without minimize
        grunt.registerTask('updateDebug', ['less:main','copy:main', 'clean:all']);
        grunt.registerTask('ud', ['updateDebug']); // alias

    // Local deploy task to public folder
    grunt.registerTask('update', ['less:main','copy:main', 'newer:uglify:main','newer:cssmin:main', 'newer:uglify:addBanner','newer:cssmin:addBanner', 'clean:all']);
        grunt.registerTask('u', ['update']); // alias
        grunt.registerTask('default', ['update']); // alias

    // Upload files to remote via sftp
    //TODO: refactor remote deploy tasks
//    grunt.registerTask('deployRemoteDebug', ['clean:build', 'less:main', 'copy:remote', 'clean:remote']);

    // Minify and upload files to remote via sftp
//    grunt.registerTask('deployRemote', ['clean:build', 'less:main', 'copy:remote',  'cssmin:remote', 'cssmin:addRemoteBanner', 'uglify:remote', 'uglify:addRemoteBanner', 'clean:remote', 'sftp-deploy:deploy']);

    // Watching client-side changes and running minify, less, copy to public
    grunt.registerTask('runWatch', ['watch']);
        grunt.registerTask('rw', ['runWatch']); // alias
};