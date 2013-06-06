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
        options: grunt.file.readJSON('user/grunt/options.json'),
        pathToAppDir: '<%= options.pathToAppDir %>',
        pathToProductionVersion: '<%= options.pathToProductionVersion %>',
        pathToProductionVersionOnServer: '<%= options.server.pathToProduction %>',
        deployHost: '<%= options.server.host %>',
        deployPort: '<%= options.server.port %>',
        deployKey: '<%= options.server.key %>',

        filesToCopy: ['<%= pathToAppDir %>/core/**', 
                      '<%= pathToAppDir %>/test/**', 
                      '<%= pathToAppDir %>/docs/**', 
                      '<%= pathToAppDir %>/plugins/bubble/**',
                      '<%= pathToAppDir %>/plugins/debugmode/**',
                      '<%= pathToAppDir %>/plugins/file_tree_generator/**',
                      '<%= pathToAppDir %>/plugins/lib/jquery.cookie.js'
                      ],

        filesToUploadToServer: ['<%= pathToAppDir %>'],
        excludedFilesForUpload: [
                                '<%= pathToAppDir %>/user',
                                '<%= pathToAppDir %>/data',
                                '<%= pathToAppDir %>/node_modules',
                                '<%= pathToAppDir %>/build',
                                '<%= pathToAppDir %>/**/.DS_Store',
                                '<%= pathToAppDir %>/.ftppass',
                                '<%= pathToAppDir %>/Gruntfile.js',
                                '<%= pathToAppDir %>/index.html',
                                '<%= pathToAppDir %>/License.md',
                                '<%= pathToAppDir %>/package.json',
                                '<%= pathToAppDir %>/README.md',
                                '<%= pathToAppDir %>/.git'
                                ],

        excludedFilesForProductionsUpload: [
                                '<%= pathToAppDir %>/user',
                                '<%= pathToAppDir %>/data',
                                '<%= pathToAppDir %>/node_modules',
                                '<%= pathToAppDir %>/**/.DS_Store',
                                '<%= pathToAppDir %>/.ftppass',
                                '<%= pathToAppDir %>/Gruntfile.js',
                                '<%= pathToAppDir %>/index.html',
                                '<%= pathToAppDir %>/License.md',
                                '<%= pathToAppDir %>/package.json',
                                '<%= pathToAppDir %>/README.md',
                                '<%= pathToAppDir %>/.git'
                                ],

        filesToUglify: ['<%= pathToAppDir %>/core/**/*.js', 
                        '<%= pathToAppDir %>/test/**/*.js', 
                        '<%= pathToAppDir %>/docs/**/*.js', 
                        '<%= pathToAppDir %>/plugins/bubble/**/*.js',
                        '<%= pathToAppDir %>/plugins/debugmode/**/*.js',
                        '<%= pathToAppDir %>/plugins/file_tree_generator/**/*.js',
                        '<%= pathToAppDir %>/plugins/lib/jquery.cookie.js'
                        ],

        filesToCssMinify: ['<%= pathToAppDir %>/core/**/*.css',
                           '<%= pathToAppDir %>/test/**/*.css',
                           '<%= pathToAppDir %>/docs/**/*.css', 
                           '<%= pathToAppDir %>/plugins/bubble/**/*.css',
                           '<%= pathToAppDir %>/plugins/debugmode/**/*.css',
                           '<%= pathToAppDir %>/plugins/file_tree_generator/**/*.css',
                           '!<%= pathToAppDir %>/build/**/*.css'
                           ],

        // copy all files without ignored to project folder
        copy: {
            main: {
                files: [
                    {
                        src: '<%= filesToCopy %>', 
                        dest: '<%= pathToProductionVersion %>/'
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
                dest: '<%= pathToProductionVersion %>/',
                ext: '.css'
            },
            server: {
                expand: true,
                src: '<%= cssmin.main.src %>',
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
                    dest: '<%= pathToProductionVersion %>',
                    cwd: '.'
                }]
            },
            server: {
                files: [{
                    expand: true,
                    src: '<%= filesToUglify %>',
                    dest: '<%= pathToAppDir %>/build/',
                    cwd: '.'
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
                dest: '<%= pathToProductionVersionOnServer %>',
                exclusions: '<%= excludedFilesForUpload %>'
            },
            deployMinified: {
                auth: {
                    host: '<%= deployHost %>',
                    port: '<%= deployPort %>',
                    authKey: '<%= deployKey %>'
                },
                src: '<%= pathToAppDir %>/build',
                dest: '<%= pathToProductionVersionOnServer %>',
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
                    dir: '<%= pathToProductionVersion %>',
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
                            name: '<%= pathToProductionVersion %>/core/js/source.js',
                            include: ['core/js/source.js']
                        },
                        {
                            name: '<%= pathToProductionVersion %>/core/js/source-nav.js',
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

    // Default task - copy/
    grunt.registerTask('default', ['copy:main']);

    // Deploy task
    grunt.registerTask('deploy', ['copy:main', 'uglify:main', 'cssmin:main']);

    // Upload file to server via sftp
    grunt.registerTask('deployServer', ['sftp-deploy:deploy']);

    // Minified and upload files to server via sftp
    grunt.registerTask('deployProductionServer', [
                        'copy:server', 
                        'cssmin:server',
                        'uglify:server',
                        'sftp-deploy:deployMinified']
                        );

    // Task for only require optimization DONT USE IT NOW!!
    grunt.registerTask('r', ['requirejs']);

    // Task for start watching
    grunt.registerTask('runWatch', ['watch']);
};