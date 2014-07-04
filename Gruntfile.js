module.exports = function(grunt) {
    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    // measuring processing time
    require('time-grunt')(grunt);

    var getSourceOptions = function() {
        return require('./core/options');
    };

    // Tasks
    grunt.initConfig({
        // load options from file
        options: getSourceOptions(),
        pathToUser: '<%= options.common.pathToUser %>',

        banner:'/*!\n' +
                '* SourceJS - IME for front-end components documentation and maintenance.\n' +
                '* @copyright 2014 Sourcejs.com\n' +
                '* @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License\n' +
                '* */\n',

        // clean files after build
        clean: {
            build: [
                'build'
            ]
        },

        uglify: {
            main: {
                options: {
                    preserveComments: 'some'
                },
                expand: true,
                dest: 'build',
                src: [
                    'assets/**/*.js',
                    '<%= pathToUser %>/assets/**/*.js',
                    '!assets/test/**/*.js'
                ]
            }
        },

        cssmin: {
            main: {
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

        htmlcompressor: {
            main: {
                options: {
                    type: 'html',
                    preserveServerScript: true
                },
                expand: true,
                dest: 'build',
                src: [
                    'assets/**/*.html',
                    '<%= pathToUser %>/assets/**/*.html',
                    '!assets/test/**/*.html'
                ]
            }
        },

        less: {
            main: {
                files: {
                    "build/assets/css/defaults.css": "assets/css/defaults.less"
                }
            }
        },

        watch: {
            main: {
                files: [
                    'assets/**/*.{less}'
                ],
                tasks: ['newer:less:dev'],
                options: {
                    nospawn: true
                }
            }
        },
    });

    grunt.registerTask('clean-build', ['clean:build']);

    // Regular development update task
    grunt.registerTask('update', ['newer:less:main']);

    // Prod build, path to minified resources is routed by nodejs server
    grunt.registerTask('build', ['clean-build','less:main','cssmin:build','cssmin:main','uglify:main','htmlcompressor:main']);

    grunt.registerTask('default', ['clean-build','update']);

    grunt.registerTask('watch-css', ['update','watch']);

};