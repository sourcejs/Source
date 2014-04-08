/**
*
* Register any plugins and drop their finish events
*
*/

define(["modules/module", "modules/utils"], function(module, utils) {

	function LoadEvents() {}

	LoadEvents.prototype = module.createInstance();
	LoadEvents.prototype.constructor = LoadEvents;

	LoadEvents.prototype.init = function( callback ) {

		var callback = callback || function () {},
			complete = false,
			debug = false;

		function checkPluginsDefinition() {
			return ( (window.source !== undefined) && (window.source.loadEvents !== undefined) && (Object.keys(window.source.loadEvents).length) );
		};

		function generateSuccessEvent(eventName) {
			if (debug && utils.isDevelopmentMode()) {
				console.log('event happens ' + eventName );
			}

			if (window.CustomEvent) {
				event = new CustomEvent(eventName);
			} else {
				event = document.createEvent('CustomEvent');
				event.initCustomEvent(eventName, true, true);
			}

			document.dispatchEvent(event);

			if (!complete) {
				complete = true;
				callback();
			}
		}

		(function checkPluginsState() {

			// If there's no any render plugin, just skip checking section
			if ( !checkPluginsDefinition() ) {
				generateSuccessEvent('allPluginsFinish');
				return;
			}

			var	pluginsSection = window.source.loadEvents,
				defaultPluginTimeout = 1000;

			function checkPlugins() {
				var now = new Date().getTime(),
					pluginFinish = 0;

				for (var plugin in pluginsSection) {
					if (debug && utils.isDevelopmentMode()) {
						console.log(plugin + ' checking... ');
					}

					if (pluginsSection[plugin].finish) {
						pluginsSection[plugin].timeExpected = now-1;
						if (debug && utils.isDevelopmentMode()) {
							console.log(plugin + ' marked as finished');
						}
					}

					if ( !Array.isArray( pluginsSection[plugin]) ) {
						// first time

						if (pluginsSection[plugin].timeExpected === undefined) {

							pluginsSection[plugin].timeExpected = now + parseInt(pluginsSection[plugin].timeout || defaultPluginTimeout);
							if (debug && utils.isDevelopmentMode()) {
								console.log(plugin + ' was registred and set timeout ' +  pluginsSection[plugin].timeExpected);
							}

							// When plugin finish his work, it send "finishEvent", which differs for each plugin
							pluginsSection[plugin].finishEvent && document.addEventListener(pluginsSection[plugin].finishEvent, function() {
								if (debug && utils.isDevelopmentMode()) {
									console.log(plugin + ' drop finishEvent' );
								}

								pluginsSection[plugin].finish = true;
								pluginsSection[plugin].timeExpected = now-1;
							})

							// When plugin need to update work's timeout, it generate "updateEvent"
							pluginsSection[plugin].updateEvent && document.addEventListener(pluginsSection[plugin].updateEvent, function() {
								var tmpExpected = now + parseInt(pluginsSection[plugin].timeout || defaultPluginTimeout);

								if (tmpExpected > pluginsSection[plugin].timeExpected) {
									pluginsSection[plugin].timeExpected = tmpExpected;
									if (debug && utils.isDevelopmentMode()) {
										console.log(plugin + ' drop updateEvent and increase timeout to ' + pluginsSection[plugin].timeExpected );
									}

								}
							})

						// Plugin already was initialized
						} else {

							// If timeout come, increase counter
							if ( pluginsSection[plugin].timeExpected < now ) {
								if (!pluginsSection[plugin].finish) {
									generateSuccessEvent(plugin + ' timeout, ' + new Date().getTime());
									pluginsSection[plugin].finish = true;
								}

								pluginFinish++;
							}
						}

					} else {
						var subPluginFinish = 0;
						pluginFinish++;

						if ( (pluginsSection[plugin].length) && (!pluginsSection[plugin].finish) ) {

							for (var i = 0; i < pluginsSection[plugin].length; i++ ) {
								var subPlugin = pluginsSection[plugin][i];

								if ( (pluginsSection[subPlugin] !== undefined) && (pluginsSection[subPlugin].timeExpected < now) ) {
									subPluginFinish++;
								}
							}

							if ( pluginsSection[plugin].length == subPluginFinish) {
								pluginsSection[plugin].finish = true;
								generateSuccessEvent(plugin + ' GroupFinish');
							}
						}
					}

				}

				// if there's more than 0 plugins and all of them get timeout, continue,
				// otherwise make recursive call
				if ( Object.keys(pluginsSection).length != pluginFinish ) {
					setTimeout(function() {
						checkPlugins();
					}, 100);
					return;
				}

				generateSuccessEvent('allPluginsFinish');
				return;
			}

			checkPlugins();

		})();
	};

	return new LoadEvents();
});
