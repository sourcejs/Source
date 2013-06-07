module.exports = function(grunt) {

     grunt.registerTask('rebase', 'Execute git pull and rebase.', function () {
        var done = this.async();

        grunt.util.spawn({
            cmd: "git",
            args: ["pull", "--rebase"]
        }, done)
     })

    // Tasks
    grunt.initConfig({
        // load options from file
        options: grunt.file.readJSON('./gruntOptions.json'),
        pathToAppDir: '<%= options.pathToAppDir %>',
        pathToSpecs: '<%= options.pathToSpecs %>',
        pathToSpecsOnServer: '<%= options.server.pathToDir %>',
        deployHost: '<%= options.server.host %>',
        deployPort: '<%= options.server.port %>',
        deployKey: '<%= options.server.key %>',

        banner:'/*\n' +
                '* Source - Front-end documentation engine\n' +
                '* @copyright 2013 Sourcejs.com\n' +
                '* @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License\n' +
                '* */\n',

        filesToCopy:                        ['<%= pathToAppDir %>/core/**',
                                            '<%= pathToAppDir %>/test/**',
                                            '<%= pathToAppDir %>/docs/**',
                                            '<%= pathToAppDir %>/plugins/bubble/**',
                                            '<%= pathToAppDir %>/plugins/debugmode/**',
                                            '<%= pathToAppDir %>/plugins/file_tree_generator/**',
                                            '<%= pathToAppDir %>/plugins/lib/jquery.cookie.js'],

        filesToUploadToServer:             ['<%= pathToAppDir %>'],

        excludedFilesForUpload:            ['<%= pathToAppDir %>/user',
                                            '<%= pathToAppDir %>/data',
                                            '<%= pathToAppDir %>/node_modules',
                                            '<%= pathToAppDir %>/build',
                                            '<%= pathToAppDir %>/**/.DS_Store',
                                            '<%= pathToAppDir %>/.ftppass',
                                            '<%= pathToAppDir %>/Gruntfile.js',
                                            '<%= pathToAppDir %>/gruntOptions.js',
                                            '<%= pathToAppDir %>/index.html',
                                            '<%= pathToAppDir %>/License.md',
                                            '<%= pathToAppDir %>/package.json',
                                            '<%= pathToAppDir %>/README.md',
                                            '<%= pathToAppDir %>/.git'],

        excludedFilesForProductionsUpload: ['<%= pathToAppDir %>/user',
                                            '<%= pathToAppDir %>/data',
                                            '<%= pathToAppDir %>/node_modules',
                                            '<%= pathToAppDir %>/**/.DS_Store',
                                            '<%= pathToAppDir %>/.ftppass',
                                            '<%= pathToAppDir %>/Gruntfile.js',
                                            '<%= pathToAppDir %>/gruntOptions.js',
                                            '<%= pathToAppDir %>/index.html',
                                            '<%= pathToAppDir %>/License.md',
                                            '<%= pathToAppDir %>/package.json',
                                            '<%= pathToAppDir %>/README.md',
                                            '<%= pathToAppDir %>/.git'],

        filesToUglify:                      ['<%= pathToAppDir %>/test/**/*.js',
                                            '<%= pathToAppDir %>/docs/**/*.js',
                                            '<%= pathToAppDir %>/plugins/bubble/**/*.js',
                                            '<%= pathToAppDir %>/plugins/debugmode/**/*.js',
                                            '<%= pathToAppDir %>/plugins/file_tree_generator/**/*.js',
                                            '<%= pathToAppDir %>/plugins/lib/jquery.cookie.js'],

        filesToCssMinify:                   ['<%= pathToAppDir %>/test/**/*.css',
                                            '<%= pathToAppDir %>/docs/**/*.css',
                                            '<%= pathToAppDir %>/plugins/bubble/**/*.css',
                                            '<%= pathToAppDir %>/plugins/debugmode/**/*.css',
                                            '<%= pathToAppDir %>/plugins/file_tree_generator/**/*.css',
                                            '!<%= pathToAppDir %>/build/**/*.css'],

        // copy all files without ignored to project folder
        copy: {
            init: {
                files: [
                    {
                        src: ['<%= pathToAppDir %>/user/**',
                                '<%= pathToAppDir %>/data/**',
                                '<%= pathToAppDir %>/index.html',
                                '<%= pathToAppDir %>/License.md'],
                        dest: '<%= pathToSpecs %>/'
                    },
                    {
                        src: ['<%= pathToAppDir %>/init/.gitignore'],
                        dest: '<%= pathToSpecs %>/.gitignore'
                    },
                    {
                        src: ['<%= pathToAppDir %>/init/README.md'],
                        dest: '<%= pathToSpecs %>/README.md'
                    }
                ]
            },

            main: {
                files: [
                    {
                        src: '<%= filesToCopy %>',
                        dest: '<%= pathToSpecs %>/'
                    }
                ]
            },

            server: {
                files: [
                    {
                        src: '<%= filesToCopy %>',
                        dest: '<%= pathToAppDir %>/build/'
                    }
                ]
            }
        },

        // minify all css needed files
        cssmin: {
            main: {
                expand: true,
                src: '<%= filesToCssMinify %>',
                dest: '<%= pathToSpecs %>/',
                ext: '.css'
            },

            addBanner: {
                expand: true,
                options: {
                    banner: '<%= banner %>'
                },
                src: [
                        '<%= pathToAppDir %>/core/**/*.css',
                        '!<%= pathToAppDir %>/core/css/core.css'
                    ],
                dest: '<%= pathToSpecs %>/',
                ext: '.css'
            },

            server: {
                expand: true,
                src: '<%= cssmin.main.src %>',
                dest: '<%= pathToAppDir %>/build/',
                ext: '.css'
            },

            addServerBanner: {
                expand: true,
                options: {
                    banner: '<%= banner %>'
                },
                src: [
                        '<%= pathToAppDir %>/core/**/*.css',
                        '!<%= pathToAppDir %>/core/css/core.css'
                    ],
                dest: '<%= pathToAppDir %>/build/',
                ext: '.css'
            }
        },

        // minify all js files via uglify
        uglify: {

            main: {
                files: [{
                    expand: true,
                    src: '<%= filesToUglify %>',
                    dest: '<%= pathToSpecs %>',
                    cwd: '<%= pathToAppDir %>'
                }]
            },

            addBanner: {
                options: {
                        banner: '<%= banner %>\n'
                    },
                files: [{
                    expand: true,
                    src: '<%= pathToAppDir %>/core/**/*.js',
                    dest: '<%= pathToSpecs %>',
                    cwd: '<%= pathToAppDir %>'
                }]
            },

            server: {
                files: [{
                    expand: true,
                    src: '<%= filesToUglify %>',
                    dest: '<%= pathToAppDir %>/build/',
                    cwd: '<%= pathToAppDir %>'
                }]
            },

            addServerBanner: {
                options: {
                        banner: '<%= banner %>\n'
                    },
                files: [{
                    expand: true,
                    src: '<%= pathToAppDir %>/core/**/*.js',
                    dest: '<%= pathToAppDir %>/build',
                    cwd: '<%= pathToAppDir %>'
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
                src: '<%= filesToUploadToServer %>',
                dest: '<%= pathToSpecsOnServer %>',
                exclusions: '<%= excludedFilesForUpload %>'
            },
            deployMinified: {
                auth: {
                    host: '<%= deployHost %>',
                    port: '<%= deployPort %>',
                    authKey: '<%= deployKey %>'
                },
                src: '<%= pathToAppDir %>/build',
                dest: '<%= pathToSpecsOnServer %>',
                exclusions: '<%= excludedFilesForProductionsUpload %>'
            }
        },

        // clean files after build
        clean: {
            main: {
                src: ['<%= pathToAppDir %>/build/']
            }
        },

        watch: {
            main: {
                files: '<%= filesToCopy %>',
                tasks: ['copy:main'],
                options: {
                    nospawn: true
                }
            }
        },

        // optimize all scripts via r.js
        requirejs: {
            compile: {
                options: {
                    appDir: '.',
                    baseUrl: '.',
                    dir: '<%= pathToSpecs %>',
                    fileExclusionRegExp: 'build.js|Gruntfile.js|^node_modules$',
                    paths: {
                            core: 'core/js',
                            modules: 'core/js/modules',
                            lib: 'core/js/lib',
                            templates: 'core/templates',
                            plugins: 'plugins',
                            user: 'user',
                            jquery: 'core/js/lib/jquery-1.9.1.min',
                            text: 'core/js/text',
                            data: 'data',
                            searchPlugin: 'empty:'
                        },
                    optimize: 'none',
                    preserveLicenseComments: false,
                    modules: [
                        {
                            name: '<%= pathToSpecs %>/core/js/source.js',
                            include: ['core/js/source.js']
                        },
                        {
                            name: '<%= pathToSpecs %>/core/js/source-nav.js',
                            include: ['core/js/source-nav.js']
                        }
                    ]
                }
            }
        }
    });

    // Load plugins installed via npm install
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-sftp-deploy');
    grunt.loadNpmTasks('grunt-ftp-deploy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Task for init project
    // Copying all needed files next to Source
    grunt.registerTask('init', ['copy:main', 'copy:init', 'uglify:main', 'cssmin:main']);

    // Local deploy task
    grunt.registerTask('update', ['copy:main', 'uglify:main', 'uglify:addBanner', 'cssmin:main', 'cssmin:addBanner']);

    // Minified and upload files to server via sftp
    grunt.registerTask('deployServer', ['copy:server', 'cssmin:server', 'cssmin:addServerBanner', 'uglify:server', 'uglify:addServerBanner', 'sftp-deploy:deployMinified']);

    // Upload file to server via sftp
    grunt.registerTask('deployServerDebug', ['sftp-deploy:deploy']);

    // Task for start watching
    grunt.registerTask('runWatch', ['watch']);
};