/* global config, JSCS, jshint, path, project, reloadPaths */

(function() {
	'use strict';

	var notifier = require('node-notifier');

	Wee.fn.extend({
		// Build root or relative path
		buildPath: function(loc, file) {
			return file.substring(0, 2) === './' ?
				file :
				path.join(loc, file);
		},
		// Append minified extension
		getMinExtension: function(dest, src, ext) {
			var dir = src.substring(0, src.lastIndexOf('/')),
				filename = src.substring(src.lastIndexOf('/'), src.length);
			filename = filename.substring(0, filename.lastIndexOf('.'));

			return dest + '/' + dir + filename + ext;
		},
		validate: function(config, grunt, filepath, log) {
			var ext = path.extname(filepath);

			if (filepath.indexOf('temp') === -1 &&
				filepath.indexOf('/vendor') === -1) {
				if (ext === '.js') {
					var js = grunt.file.read(filepath);

					if (project.script.validate.jshint) {
						this.validateJshint(js, grunt, filepath, log);
					}

					if (project.script.validate.jscs) {
						this.validateJscs(js, grunt, filepath, log);
					}
				}
			}
		},
		validateJshint: function(js, grunt, filepath) {
			var jshintConfig = grunt.file.readJSON(
				project.script.validate.jshint === true ?
					'wee/script/.jshintrc' :
					project.script.validate.jshint
			);

			if (! jshint(js, jshintConfig)) {
				var out = jshint.data(),
					errors = out.errors,
					total = errors.length;

				grunt.log.header('Script validation errors found');

				grunt.log.error('JSHint error' +
					((total > 1) ? 's' : '') + ' in ' + filepath + '.');

				errors.forEach(function(message) {
					Wee.logError(grunt, message.line + ':' + message.character, message.reason, message.evidence);
				});

				grunt.log.writeln();
				grunt.log.writeln();

				this.notify({
					title: 'JSHint Validation Error',
					message: 'Check console for error details'
				}, 'error', false);
			}
		},
		validateJscs: function(js, grunt, filepath) {
			var jscsConfig = grunt.file.readJSON(
					project.script.validate.jscs === true ?
						'wee/script/.jscs.json' :
						project.script.validate.jscs
				),
				checker = new JSCS();

			checker.registerDefaultRules();
			checker.configure(jscsConfig);

			var errors = checker.checkString(js),
				errorList = errors.getErrorList(),
				total = errorList.length;

			if (total > 0) {
				grunt.log.error('JSCS error' +
					((total > 1) ? 's' : '') + ' in ' + filepath + '.');

				errorList.forEach(function(message) {
					Wee.logError(grunt, message.line + ':' + message.column, message.rule, message.message);
				});

				this.notify({
					title: 'JSCS Validation Error',
					message: 'Check console for error details'
				}, 'error', false);
			}
		},
		logError: function(grunt, pos, msg, details) {
			grunt.log.writeln('['.cyan + pos + '] '.cyan + msg + ' ' + (details || '').magenta);
		},
		notify: function(options, type, log) {
			options.icon = 'node_modules/wee-core/build/img/' +
				(type || 'notice') + '.png';
			options.group = 1;

			if (type == 'error') {
				options.group = 2;
				options.sound = true;
				options.wait = true;
			}

			if (log !== false) {
				console.log(options.message);
			}

			notifier.notify(options);
		},
		serverWatch: function(url) {
			if (url.substring(0, 4) !== 'http') {
				reloadPaths.push(path.join(config.paths.root, url));
			}
		}
	});
})();