define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert');

	require('js/tests/support/exports.js');

	registerSuite({
		name: 'Data',

		get: {
			'standard': function() {
				var promise = this.async(1000);

				// TODO: File path is relative to wee-core. Need solution that
				// TODO: uses conditional path that works with Browsersync as well.
				Wee.data.request({
					url: '/js/tests/support/sample-files/sample.json',
					json: true,
					success: promise.callback(function(data) {
						assert.strictEqual(data.person.firstName, 'Don',
							'Sample file was not loaded successfully'
						);
					})
				});
			},

			'with data': function() {
				var promise = this.async(1000);

				Wee.data.request({
					url: 'https://httpbin.org/get',
					json: true,
					data: {
						test: 'test'
					},
					success: promise.callback(function(data) {
						assert.strictEqual(data.args.test, 'test',
							'Data posted successfully'
						);
					}),
					complete: function() {
						assert.isTrue(true,
							'Complete callback called on error'
						);
					}
				});
			},

			'with query string': function() {
				var promise = this.async(1000);

				Wee.data.request({
					url: 'https://httpbin.org/get?test=test',
					json: true,
					success: promise.callback(function(data) {
						assert.strictEqual(data.args.test, 'test',
							'Data posted successfully'
						);
					})
				});
			}
		},

		post: {
			'with data': function() {
				var promise = this.async(1000);

				Wee.data.request({
					root: 'https://httpbin.org/',
					url: 'post',
					method: 'post',
					json: true,
					data: {
						test: 'test'
					},
					success: promise.callback(function(data) {
						var response = JSON.parse(data.data);

						assert.strictEqual(response.test, 'test',
							'Data posted successfully'
						);
					})
				});
			},
			type: {
				form: function() {
					var promise = this.async(1000);

					Wee.data.request({
						url: 'https://httpbin.org/post',
						method: 'post',
						json: true,
						type: 'form',
						data: {
							test: 'test'
						},
						success: promise.callback(function(data) {
							assert.strictEqual(data.form.test, 'test',
								'Data posted successfully'
							);

							assert.strictEqual(data.headers['Content-Type'],
								'application/x-www-form-urlencoded; charset=UTF-8',
								'Incorrect headers sent'
							);
						})
					});
				},
				html: function() {
					var promise = this.async(1000);

					Wee.data.request({
						url: 'https://httpbin.org/post',
						method: 'post',
						json: true,
						type: 'xml',
						success: promise.callback(function(data) {
							assert.strictEqual(data.headers['Content-Type'],
								'text/xml; charset=UTF-8',
								'Incorrect headers sent'
							);
						})
					});
				},
				json: function() {
					var promise = this.async(1000);

					Wee.data.request({
						url: 'https://httpbin.org/post',
						method: 'post',
						json: true,
						type: 'json',
						success: promise.callback(function(data) {
							assert.equal(data.data, '{}',
								'Data posted successfully'
							);

							assert.strictEqual(data.headers['Content-Type'],
								'application/json; charset=UTF-8',
								'Incorrect headers sent'
							);
						})
					});
				},
				xml: function() {
					var promise = this.async(1000);

					Wee.data.request({
						url: 'https://httpbin.org/post',
						method: 'post',
						json: true,
						type: 'xml',
						success: promise.callback(function(data) {
							assert.strictEqual(data.headers['Content-Type'],
								'text/xml; charset=UTF-8',
								'Incorrect headers sent'
							);
						})
					});
				}
			}
		}
	});
});
