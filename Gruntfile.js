module.exports = function(grunt) {
    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    // measuring processing time
    require('time-grunt')(grunt);

    // Tasks
    grunt.initConfig({
        // load options from file
        options: require('./core/options'),
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
                    'assets/css/**/*.{less}'
                ],
                tasks: ['less'],
                options: {
                    nospawn: true
                }
            }
        },
    });

    grunt.registerTask('clean-build', 'Cleaning build dir if running new type of task', function(){
        if (
            grunt.file.exists('build/last-run') &&
            (grunt.task.current.args[0] === 'prod' && grunt.file.read('build/last-run') === 'dev' || grunt.task.current.args[0] === 'dev' && grunt.file.read('build/last-run') === 'prod')
            ) {

            grunt.task.run('clean:build')
        } else {
            console.log('Skipping clean build dir');
        }
    });

    grunt.registerTask('last-prod', 'Tag build: prod', function(){
        grunt.file.write('build/last-run', 'prod');
    });

    grunt.registerTask('last-dev', 'Tag build: dev', function(){
        grunt.file.write('build/last-run', 'dev');
    });

    // Regular development update task
    grunt.registerTask('update', [
        'less:main',
        'last-dev'
    ]);

    // Prod build, path to minified resources is routed by nodejs server
    grunt.registerTask('build', [
        'clean-build:prod',
        'less:main',
        'newer:cssmin:build',
        'newer:cssmin:user',
        'newer:uglify:main',
        'newer:htmlcompressor:main',
        'last-prod'
    ]);

    grunt.registerTask('default', [
        'clean-build:dev',
        'update',
        'last-dev'
    ]);

    grunt.registerTask('watch-css', ['update','watch']);

};
