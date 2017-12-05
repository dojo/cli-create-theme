module.exports = function (grunt) {
	var staticFiles = [
		'intern/**',
		'templates/**'
	];
	require('grunt-dojo2').initConfig(grunt, {
		ts: {
			dist: {
				exclude: [
					'./src/intern',
					'./tests/**/*.ts',
					'./src/templates/src/theme.ts.ejs'
				]
			}
		},
		copy: {
			staticDistFiles: {
				expand: true,
				cwd: 'src',
				src: staticFiles,
				dest: '<%= distDirectory %>'
			},
			staticDevFiles: {
				expand: true,
				cwd: 'src',
				src: staticFiles,
				dest: '<%= devDirectory %>/src'
			}
		},
		intern: {
			version: 4
		}
	});

	grunt.registerTask('dist', grunt.config.get('distTasks').concat(['copy:staticDistFiles']));
	grunt.registerTask('dev', grunt.config.get('devTasks').concat(['copy:staticDevFiles']));
};
