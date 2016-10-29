module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        babel: {
			options: {
				sourceMap: true,
				presets: ['es2015']
			},
            build: {
                expand: true,
              	src: ['**/*.es6.js'],
              	dest: './build',
              	ext: '.js'
            }
		},
		eslint: {
			options: {
				format: 'node_modules/eslint-json',
				outputFile: `${__dirname}/logs/eslint/${'<%= pkg.name %>'}-checkstyle.json`,
				configFile: 'config/eslint.json',
				rulePaths: ['config/rules']
			},
			build: ['**/*.js', 'bin/www', '!node_modules/**']
		},
		nodemon: {
			dev: {
				script: '<%= pkg.scripts.dev %>',
				options: {
					callback: function(nodemon) {
						nodemon.on('log', function(event) {
							console.log(event.colour + '\n\t' + event.message);
						});
					},
					env: {
						PORT: '1334'
					},
					cwd: __dirname,
					ignore: ['node_modules/**'],
					ext: 'es6.js',
                    watch: [__dirname]
				}
			}
		},
		clean: {
			build: ['build/']
		},
        concurrent: {
            dev: {
                tasks: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
		watch: {
			scripts: {
				files: ['**/*.es6.js'],
				tasks: ['clean', 'build']
			}
		}
  });

  // Grunt plugins.
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-concurrent');

  // Grunt Tasks.
  grunt.registerTask('default', ['concurrent:dev']);
  grunt.registerTask('serve-dev', ['clean', 'babel', 'nodemon']);
  grunt.registerTask('build', ['babel']);
  grunt.registerTask('lint', ['eslint']);
};
