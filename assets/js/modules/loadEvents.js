/**
*
* Register any plugins and emit their finish events
*
*/

sourcejs.amd.define(["sourceModules/module", "sourceModules/utils"], function(module, utils) {

    'use strict';

    function LoadEvents() {}

    LoadEvents.prototype = module.createInstance();
    LoadEvents.prototype.constructor = LoadEvents;

    LoadEvents.prototype.init = function( callback ) {

        callback = callback || function () {};
        var evt;
        var complete = false;
        var debug = module.options.modulesEnabled.loadEvents && module.options.modulesOptions.loadEvents && module.options.modulesOptions.loadEvents.debug;

        if ( (!module.options.modulesEnabled.loadEvents) || (window.CustomEvent === undefined && document.createEvent === undefined) ) {
            if (debug && utils.isDevelopmentMode()) {
                console.log('LoadEvents Module disabled.');
            }

            callback();
            return;
        } else {
            if (debug && utils.isDevelopmentMode()) {
                console.log('LoadEvents Module enabled.');
            }
        }

        function checkPluginsDefinition() {
            return (window.source !== undefined)
                && (window.source.loadEvents !== undefined)
                && (Object.keys(window.source.loadEvents).length);
        }

        function phantomHook(event) {
            console.log('PhantomJS hook: %s', event);

            if (typeof window.callPhantom === 'function') {
                window.callPhantom({message: event});
            }
        }

        function generateSuccessEvent(eventName) {
            if (debug && utils.isDevelopmentMode()) {
                console.log('event happens ' + eventName );
            }

            if (typeof window.CustomEvent === 'function') {
                evt = new CustomEvent(eventName);
            } else {
                evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(eventName, false, false, {});
            }

            document.dispatchEvent(evt);


            if (!complete) {
                complete = true;
                callback();
            }
        }

        (function checkPluginsState() {

            // If there's no any render plugin, just skip checking section
            if ( !checkPluginsDefinition() ) {
                generateSuccessEvent('allPluginsFinish');
                phantomHook('allPluginsFinish');
                return;
            }

            var    pluginsSection = window.source.loadEvents;
            var defaultPluginTimeout = 700;

            function checkPlugins() {
                var now = new Date().getTime();
                var pluginFinish = 0;

                var onFinishEvent = function() {
                    if (debug && utils.isDevelopmentMode()) {
                        console.log(plugin + ' drop finishEvent' );
                    }

                    pluginsSection[plugin].finish = true;
                    pluginsSection[plugin].timeExpected = now-1;
                };

                var onUpdateEvent = function() {
                    var tmpExpected = now + parseInt(pluginsSection[plugin].timeout || defaultPluginTimeout, 10);

                    if (tmpExpected > pluginsSection[plugin].timeExpected) {
                        pluginsSection[plugin].timeExpected = tmpExpected;
                        if (debug && utils.isDevelopmentMode()) {
                            console.log(plugin + ' drop updateEvent and increase timeout to ' + pluginsSection[plugin].timeExpected );
                        }

                    }
                };
                /*jshint forin: false */
                for (var plugin in pluginsSection) { // jshint ignore:line
                    if (!pluginsSection.hasOwnProperty(plugin)) {
                        continue;
                    }
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

                            pluginsSection[plugin].timeExpected = now + parseInt(pluginsSection[plugin].timeout || defaultPluginTimeout, 10);
                            if (debug && utils.isDevelopmentMode()) {
                                console.log(plugin + ' was registred and set timeout ' +  pluginsSection[plugin].timeExpected);
                            }

                            // When plugin finish his work, it send "finishEvent", which differs for each plugin
                            pluginsSection[plugin].finishEvent && document.addEventListener(pluginsSection[plugin].finishEvent, onFinishEvent);

                            // When plugin need to update work's timeout, it generate "updateEvent"
                            pluginsSection[plugin].updateEvent && document.addEventListener(pluginsSection[plugin].updateEvent, onUpdateEvent);

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

                            if ( pluginsSection[plugin].length === subPluginFinish) {
                                pluginsSection[plugin].finish = true;
                                generateSuccessEvent(plugin + ' GroupFinish');
                            }
                        }
                    }

                }

                // if there's more than 0 plugins and all of them get timeout, continue,
                // otherwise make recursive call
                if ( Object.keys(pluginsSection).length !== pluginFinish ) {
                    setTimeout(function() {
                        checkPlugins();
                    }, 100);
                    return;
                }
                setTimeout(function () {
                    generateSuccessEvent('allPluginsFinish');
                    phantomHook('allPluginsFinish');

                }, defaultPluginTimeout);

                return;
            }

            checkPlugins();
        })();
    };

    return new LoadEvents();
});
