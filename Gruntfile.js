module.exports = function(grunt) {

    var removePathInDest = function(path, destBase, destPath) {
        // remove some path from destination file path in public dir

        // TODO: refactor regex, to get rid off '//' in paths
        var newPath,
            regex = '^'+path+'/|\\W'+path+'/';

        newPath =  destBase + destPath.replace(new RegExp(regex), '/');

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
        pathToSpecsOnServer: '<%= options.grunt.server.pathToDir %>',
        deployHost: '<%= options.grunt.server.host %>',
        deployPort: '<%= options.grunt.server.port %>',
        deployKey: '<%= options.grunt.server.key %>',

        banner:'/*\n' +
                '* Source - Front-end documentation engine\n' +
                '* @copyright 2013 Sourcejs.com\n' +
                '* @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License\n' +
                '* */\n',

        filesToWatch:                       [
                                                'client/src/**',
                                                'client/src/**/*'
                                            ],

        excludedFilesForUpload:             ['**/.DS_Store'],

        // copy all files excluding ignored to project folder
        copy: {
            init: {
                files: [
                    {
                        src: [
                            'client/init/**',
                            'client/init/.gitignore'
                        ],
                        dest: '<%= pathToSpecs %>/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client/init',destBase, destPath);
                        }
                    },
                    {
                        src: ['client/src/data/**'],
                        dest: '<%= pathToSpecs %>/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client/src',destBase, destPath);
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
                            'client/src/**'
                            ],
                        dest: '<%= pathToSpecs %>/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client/src',destBase, destPath);
                        }
                    },
                    {
                        src: ['client/plugins/**','!client/plugins/package.json'],
                        dest: '<%= pathToSpecs %>/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client',destBase, destPath);
                        }
                    }
                ]
            },

            server: {
                files: [
                    {
                        src: ['client/src/**'],
                        dest: 'build/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client/src',destBase, destPath);
                        }
                    },
                    {
                        src: ['client/plugins/**','!client/plugins/package.json'],
                        dest: 'build/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client',destBase, destPath);
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
                            'client/src/**/*.css',
                            '!client/src/core/css/core.css',
                            '!client/src/data/docs/project.css'
                        ],
                        dest: '<%= pathToSpecs %>/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client/src',destBase, destPath);
                        }
                    },
                    {
                        src: ['client/plugins/**/*.css'],
                        dest: '<%= pathToSpecs %>/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client',destBase, destPath);
                        }
                    }
                ]
            },

            server: {
                files: [
                    {
                        src: [
                            'client/src/**/*.css',
                            '!client/src/core/css/core.css'
                        ],
                        dest: 'build/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client/src',destBase, destPath);
                        }
                    },
                    {
                        src: ['client/plugins/**/*.css'],
                        dest: 'build/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client',destBase, destPath);
                        }
                    }
                ]
            },

            addBanner: {
                expand: true,
                options: {
                    banner: '<%= banner %>'
                },
                src: ['client/src/core/css/defaults.css'],
                dest: '<%= pathToSpecs %>/',
                ext: '.css',
                rename: function(destBase, destPath) {
                    return removePathInDest('client/src',destBase, destPath);
                }
            },

            addServerBanner: {
                expand: true,
                options: {
                    banner: '<%= banner %>'
                },
                src: ['client/src/core/css/defaults.css'],
                dest: 'build/',
                ext: '.css',
                rename: function(destBase, destPath) {
                    return removePathInDest('client/src',destBase, destPath);
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
                            'client/src/**/*.js',
                            '!client/src/test/js/**/*.js',
                            '!client/src/test/spec/**/*.js'
                        ],
                        dest: '<%= pathToSpecs %>/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client/src',destBase, destPath);
                        }
                    },
                    {
                        src: ['client/plugins/**/*.js'],
                        dest: '<%= pathToSpecs %>/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client',destBase, destPath);
                        }
                    }
                ]
            },

            server: {
                files: [
                    {
                        src: [
                            'client/src/**/*.js',
                            '!client/src/test/js/**/*.js',
                            '!client/src/test/spec/**/*.js'
                        ],
                        dest: 'build/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client/src',destBase, destPath);
                        }
                    },
                    {
                        src: ['client/plugins/**/*.js'],
                        dest: 'build/',
                        expand: true,
                        rename: function(destBase, destPath) {
                            return removePathInDest('client',destBase, destPath);
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
                    src: 'client/src/core/js/*.js',
                    dest: '<%= pathToSpecs %>/',
                    rename: function(destBase, destPath) {
                        return removePathInDest('client/src',destBase, destPath);
                    }
                }]
            },

            addServerBanner: {
                options: {
                        banner: '<%= banner %>\n'
                    },
                files: [{
                    expand: true,
                    src: 'client/src/core/js/*.js',
                    dest: 'build/',
                    rename: function(destBase, destPath) {
                        return removePathInDest('client/src',destBase, destPath);
                    }
                }]
            }
        },

        // deploy to server all needed file
        'sftp-deploy': {
            deploy: {
                auth: {
                    host: '<%= deployHost %>',
                    port: '<%= deployPort %>',
                    authKey: '<%= deployKey %>'
                },
                src: 'build',
                dest: '<%= pathToSpecsOnServer %>',
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
                    '<%= pathToSpecs %>/client'
                    ]
            },
            server: {
                src: [
                    'build/client'
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
                    "client/src/core/css/defaults.css": "client/src/core/css/less/defaults.less"
                }
            }
        }
    });

    // Load plugins installed via npm install
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sftp-deploy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');

    // TODO: make cleaning task for existing plugins update

    // Init server
    grunt.registerTask('initServer', ['copy:initServer', 'clean:initServer']);

    // Init client
    grunt.registerTask('initClient', ['copy:main', 'copy:init', 'uglify:main', 'cssmin:main', 'clean:all']);

    // Init new project in Source
    grunt.registerTask('init', ['copy:initServer', 'clean:initServer', 'copy:main', 'copy:init', 'uglify:main', 'cssmin:main', 'clean:all']);

    // Local deploy task to public folder without minimize
    grunt.registerTask('updateDebug', ['less:main','copy:main', 'clean:all']);

    // Local deploy task to public folder
    grunt.registerTask('update', ['less:main','copy:main', 'uglify:main', 'uglify:addBanner', 'cssmin:main', 'cssmin:addBanner', 'clean:all']);

    // Upload files to server via sftp
    grunt.registerTask('deployServerDebug', ['clean:build', 'less:main', 'copy:server', 'clean:server']);

    // Minify and upload files to server via sftp
    grunt.registerTask('deployServer', ['clean:build', 'less:main', 'copy:server',  'cssmin:server', 'cssmin:addServerBanner', 'uglify:server', 'uglify:addServerBanner', 'clean:server', 'sftp-deploy:deploy']);

    // Watching client side changes and running minify, less, copy to public
    grunt.registerTask('runWatch', ['watch']);
};