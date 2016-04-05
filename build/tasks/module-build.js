/* global config, fs, path, project */
/* jshint maxdepth: 8 */

module.exports = function(grunt) {
	grunt.registerTask('buildModules', function() {
		// Loop through module directories
		var children = fs.readdirSync(config.paths.moduleSource);

		for (var directory in children) {
			var name = children[directory],
				modulePath = config.paths.moduleSource + children[directory];

			// Ensure the child is a directory
			if (fs.statSync(modulePath).isDirectory()) {
				var configFile = modulePath + '/module.json';

				// Ensure the module.json file exists
				if (fs.existsSync(configFile)) {
					// Get module config
					var module = fs.readJsonSync(configFile),
						scriptRoot = modulePath + '/core/js/',
						moduleScript = [
							config.paths.temp + 'moduleView-' + name + '.js',
							scriptRoot + 'vendor/**/*.js',
							scriptRoot + 'init.js',
							scriptRoot + '**/*.js',
							'!' + scriptRoot + 'script.js'
						],
						vars = JSON.parse(JSON.stringify(config.style.vars)),
						less = fs.readFileSync(config.paths.wee + 'css/wee.module.less', 'utf8'),
						coreScript = [],
						globalScript = [],
						namespaceOpen = '',
						namespaceClose = '';

					// Push into model list
					config.modules.push(name);

					if (module.autoload) {
						config.autoload.push(name);
					}

					// Set module variables
					vars.moduleName = name;
					vars.responsive = false;

					// Template variables
					var inject = '',
						responsive = '';

					// Reference core Less and inherit namespace if extension
					if (module.extension) {
						inject += "@import (reference) 'wee.less';\n";

						namespaceOpen = config.style.namespaceOpen || '';
						namespaceClose = config.style.namespaceClose || '';
					}

					if (module.style) {
						// Namespace mixins and reset
						if (module.style.core && typeof module.style.core.namespace == 'string') {
							namespaceOpen = module.style.core.namespace + ' {';
							namespaceClose = '}';
						}

						// Build additional style
						if (module.style.build) {
							var buildStyleSources = Wee.$toArray(module.style.build);

							buildStyleSources.forEach(function(filepath) {
								inject += '@import (less) "' +
									config.paths.moduleSource + name +
									'/' + filepath + '";\n';
							});
						}

						// Compile additional style
						if (module.style.compile) {
							for (var compileStyleTarget in module.style.compile) {
								var compileStyleTaskName = compileStyleTarget.replace(/\./g, '-') + '-' + name + '-style',
									compileStyleSources = Wee.$toArray(module.style.compile[compileStyleTarget]),
									files = [];

								for (var sourcePath in compileStyleSources) {
									files.push(Wee.buildPath(modulePath, compileStyleSources[sourcePath]));
								}

								// Merge watch config
								grunt.config.set('watch.' + compileStyleTaskName, {
									files: files,
									tasks: [
										'less:' + compileStyleTaskName
									]
								});

								// Create Less task
								grunt.config.set('less.' + compileStyleTaskName, {
									files: [{
										dest: Wee.buildPath(config.paths.module + name, compileStyleTarget),
										src: files
									}],
									options: {
										globalVars: {
											weePath: '"' + config.paths.weeTemp + '"'
										}
									}
								});

								// Push style task
								config.style.tasks.push('less:' + compileStyleTaskName);

								// Run task
								grunt.task.run('less:' + compileStyleTaskName);
							}
						}
					}

					// Append core style
					inject += '@import (optional) "' +
						config.paths.moduleSource + name +
						'/core/css/screen.less";\n',

					module.style = module.style || {};
					module.script = module.script || {};
					module.namespace = 'Wee';

					if (module.script) {
						// Set global data variables
						if (
							(module.data && Object.keys(module.data).length) ||
							(module.script && module.script.data && Object.keys(module.script.data).length)
						) {
							var configScriptVars = Wee.$extend(
								module.data || {},
								module.script.data || {}
							);

							globalScript.push('Wee.$set("' + name + '.global", ' + JSON.stringify(configScriptVars) + ');');
						}

						// Inject global script
						if (globalScript.length) {
							var tempPath = config.paths.temp + name + '.global.js';

							fs.writeFileSync(
								tempPath,
								globalScript.join('')
							);

							moduleScript.unshift(tempPath);
						}

						// Build additional script
						if (module.script.build) {
							var buildScriptSources = Wee.$toArray(module.script.build);

							buildScriptSources.forEach(function(filepath) {
								moduleScript.push(path.join(modulePath, filepath));
							});
						}

						// Set module namespace
						if (module.script.core && module.script.core.namespace) {
							module.namespace = module.script.core.namespace;
						}

						config.namespaces[name] = module.namespace;

						// Include Core if needed
						if (! module.autoload && module.script.core && module.script.core.enable) {
							var features = module.script.core.features,
								weeScriptRoot = config.paths.wee + 'js/',
								chained = [];

							coreScript.push(weeScriptRoot + 'wee.js');

							if (features.chain === true) {
								chained.push(weeScriptRoot + 'wee.chain.js');
							}

							if (features.animate === true) {
								coreScript.push(weeScriptRoot + 'wee.animate.js');

								if (features.chain === true) {
									chained.push(weeScriptRoot + 'chain/wee.chain.animate.js');
								}
							}

							if (features.assets === true) {
								coreScript.push(weeScriptRoot + 'wee.assets.js');
							}

							if (features.data === true) {
								coreScript.push(weeScriptRoot + 'wee.data.js');
							}

							if (features.dom === true) {
								coreScript.push(weeScriptRoot + 'wee.dom.js');

								if (features.chain === true) {
									chained.push(weeScriptRoot + 'chain/wee.chain.dom.js');
								}
							}

							if (features.events === true) {
								coreScript.push(weeScriptRoot + 'wee.events.js');

								if (features.chain === true) {
									chained.push(weeScriptRoot + 'chain/wee.chain.events.js');
								}
							}

							if (features.history === true) {
								coreScript.push(weeScriptRoot + 'wee.history.js');
							}

							if (features.routes === true) {
								coreScript.push(weeScriptRoot + 'wee.routes.js');
							}

							if (features.screen === true) {
								coreScript.push(weeScriptRoot + 'wee.screen.js');
							}

							if (features.touch === true) {
								coreScript.push(weeScriptRoot + 'wee.touch.js');
							}

							if (features.view === true) {
								coreScript.push(weeScriptRoot + 'wee.view.js');
								coreScript.push(weeScriptRoot + 'wee.view.diff.js');

								if (features.chain === true) {
									chained.push(weeScriptRoot + 'chain/wee.chain.view.js');
								}
							}

							coreScript = coreScript.concat(chained);
						}

						// Compile additional script
						if (module.script.compile) {
							for (var compileScriptTarget in module.script.compile) {
								var compileScriptTaskName = compileScriptTarget.replace(/\./g, '-') + '-' + name + '-script',
									compileScriptSources = module.script.compile[compileScriptTarget],
									src = [];

								if (compileScriptSources instanceof Array) {
									for (var source in compileScriptSources) {
										src.push(Wee.buildPath(modulePath, compileScriptSources[source]));
									}
								} else {
									src = Wee.buildPath(modulePath, compileScriptSources);
								}

								// Merge watch config
								grunt.config.set('watch.' + compileScriptTaskName, {
									files: src,
									tasks: [
										'uglify:' + compileScriptTaskName
									]
								});

								// Create uglify task
								grunt.config.set('uglify.' + compileScriptTaskName, {
									files: [{
										dest: Wee.buildPath(config.paths.module + name, compileScriptTarget),
										src: src
									}]
								});

								// Run task
								grunt.task.run('uglify:' + compileScriptTaskName);
							}
						}
					}

					// Append primary script
					moduleScript.push(scriptRoot + 'script.js');

					// Determine if module is responsive
					if (project.style.core.responsive.enable) {
						if (fs.existsSync(modulePath + '/core/css/breakpoints')) {
							vars.responsive = true;

							responsive +=
								'.wee-' + name + '-mobile-landscape () when not (@mobileLandscapeWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/core/css/breakpoints/mobile-landscape.less";\n' +
								'}\n' +
								'.wee-' + name + '-tablet-portrait () when not (@tabletPortraitWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/core/css/breakpoints/tablet-portrait.less";\n' +
								'}\n' +
								'.wee-' + name + '-desktop-small () when not (@desktopSmallWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/core/css/breakpoints/desktop-small.less";\n' +
								'}\n' +
								'.wee-' + name + '-desktop-medium () when not (@desktopMediumWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/core/css/breakpoints/desktop-medium.less";\n' +
								'}\n' +
								'.wee-' + name + '-desktop-large () when not (@desktopLargeWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/core/css/breakpoints/desktop-large.less";\n' +
								'}\n';
						}

						if (fs.existsSync(modulePath + '/css/breakpoints')) {
							vars.responsive = true;

							responsive +=
								'.wee-' + name + '-mobile-landscape () when not (@mobileLandscapeWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/css/breakpoints/mobile-landscape.less";\n' +
								'}\n' +
								'.wee-' + name + '-tablet-portrait () when not (@tabletPortraitWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/css/breakpoints/tablet-portrait.less";\n' +
								'}\n' +
								'.wee-' + name + '-desktop-small () when not (@desktopSmallWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/css/breakpoints/desktop-small.less";\n' +
								'}\n' +
								'.wee-' + name + '-desktop-medium () when not (@desktopMediumWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/css/breakpoints/desktop-medium.less";\n' +
								'}\n' +
								'.wee-' + name + '-desktop-large () when not (@desktopLargeWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/css/breakpoints/desktop-large.less";\n' +
								'}\n';
						}
					}

					// Inject empty mixins if no breakpoints exist
					if (! vars.responsive) {
						responsive +=
							'.wee-' + name + '-mobile-landscape () {}\n' +
							'.wee-' + name + '-tablet-portrait () {}\n' +
							'.wee-' + name + '-desktop-small () {}\n' +
							'.wee-' + name + '-desktop-medium () {}\n' +
							'.wee-' + name + '-desktop-large () {}\n';
					}

					// Process import injection
					var fontPath = '/' + project.paths.assets +
						'/modules/'+ name + '/fonts/';

					less = less.replace(/{{moduleName}}/g, name)
						.replace('{{namespaceOpen}}', namespaceOpen)
						.replace('{{namespaceClose}}', namespaceClose)
						.replace('{{fontPath}}', fontPath)
						.replace('{{imports}}', inject)
						.replace('{{responsive}}', responsive);

					// Write temporary file
					fs.writeFileSync(config.paths.temp + name + '.less', less);

					// Set global data variables
					if (
						(module.data && Object.keys(module.data).length) ||
						(module.style && module.style.data && Object.keys(module.style.data).length)
					) {
						var configStyleVars = Wee.$extend(module.data || {}, module.style.data || {});

						for (var key in configStyleVars) {
							var value = configStyleVars[key];

							if (typeof value === 'string') {
								vars[key] = value;
							}
						}
					}

					// Create module style compile task
					var dest = (module.autoload === true) ?
							config.paths.temp + name + '.css' :
							config.paths.module + name + '/style.min.css',
						obj = {};

					obj[name] = {
						files: [{
							dest: dest,
							src: config.paths.temp + name + '.less'
						}],
						options: {
							globalVars: {
								weePath: '"' + config.paths.weeTemp + '"'
							},
							modifyVars: vars
						}
					};

					grunt.config.merge({
						less: obj
					});

					// Push style task
					config.style.tasks.push('less:' + name);

					// Configure style watch task
					grunt.config.set('watch.' + name + '-style', {
						files: modulePath + '/**/*.less',
						tasks: [
							'less:' + name,
							'concat:style'
						]
					});

					// Run initial tasks
					grunt.task.run('less:' + name);
					grunt.task.run('concat:style');

					if (module.autoload === true) {
						// Push temporary style to concat list
						config.style.concat.push(dest);

						// Add script paths to uglify
						config.script.build = config.script.build.concat(moduleScript);
					} else {
						var tasks = [];

						// Process core script compilation
						if (coreScript.length) {
							obj[name + '-core'] = {
								files: [{
									dest: config.paths.temp + name + '-core.min.js',
									src: coreScript
								}]
							};

							if (module.namespace) {
								obj[name + '-core'].options = {
									wrap: module.namespace
								};
							}

							grunt.task.run('uglify:' + name + '-core');

							obj[name + '-build'] = {
								files: [{
									dest: config.paths.temp + name + '-build.min.js',
									src: moduleScript
								}]
							};

							tasks.push('uglify:' + name + '-build');

							// Concatenate module core and build
							grunt.config.set('concat.' + name + '-concat', {
								files: [{
									dest: config.paths.module + name + '/script.min.js',
									src: [
										'<%= config.paths.temp %>' + name + '-core.min.js',
										'<%= config.paths.temp %>' + name + '-build.min.js'
									]
								}]
							});

							tasks.push('concat:' + name + '-concat');

							if (project.script.sourceMaps === true) {
								grunt.config.set('uglify.' + name + '-core.options.sourceMap', true);
								grunt.config.set('uglify.' + name + '-core.options.sourceMapIncludeSources', true);
								grunt.config.set(
									'uglify.' + name + '-core.options.sourceMapName',
									path.join(config.paths.temp, name + '-core.js.map')
								);

								grunt.config.set('uglify.' + name + '-build.options.sourceMap', true);
								grunt.config.set('uglify.' + name + '-build.options.sourceMapIncludeSources', true);
								grunt.config.set(
									'uglify.' + name + '-build.options.sourceMapName',
									path.join(config.paths.temp, name + '-build.js.map')
								);

								grunt.config.set('concat.' + name + '-concat.options.sourceMap', true);
								grunt.config.set(
									'concat.' + name + '-concat.options.sourceMapName',
									path.join(config.paths.jsMaps, name + '.script.js.map')
								);
							}
						} else {
							// Create module script compile task
							obj[name] = {
								files: [{
									dest: config.paths.module + name + '/script.min.js',
									src: moduleScript
								}]
							};

							tasks.push('uglify:' + name);

							if (project.script.sourceMaps === true) {
								grunt.config.set('uglify.' + name + '.options.sourceMap', true);
								grunt.config.set('uglify.' + name + '.options.sourceMapIncludeSources', true);
								grunt.config.set(
									'uglify.' + name + '.options.sourceMapName',
									path.join(config.paths.jsMaps, name + '.script.js.map')
								);
							}
						}

						grunt.config.merge({
							uglify: obj
						});

						// Configure script watch task
						grunt.config.set('watch.' + name + '-script', {
							files: moduleScript,
							tasks: tasks
						});

						// Execute script task
						grunt.task.run(tasks);
					}
				} else {
					var msg = 'Missing module.json for "' + name + '" module.';

					Wee.notify({
						title: 'Module Error',
						message: msg
					}, 'error');

					grunt.fail.fatal(msg);
				}
			}
		}
	});
};