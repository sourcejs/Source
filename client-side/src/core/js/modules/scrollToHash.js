//In separate module, to trace script ready state
define([
    "modules/utils",
    "modules/sectionFolding"
    ], function(utils) {
    var navHash = utils.parseNavHash(),
	    sections = document.querySelectorAll('.source_section'),
	    navigation = document.querySelector('.source_nav'),
	    mainContainer = document.querySelector('.source_main'),
    	defaultTimeOut = 1000;

	// Show hidden sections and navigation
	function showSections() {
		for (var i = 0; i < sections.length; i++) {
			sections[i].className += ' __loaded';
		}

		navigation.className += ' __loaded';
		mainContainer.className = mainContainer.className.replace(' __loading', '');
	}

	// If any navigation hash exists, let's scroll
    if (navHash != '') {

		mainContainer.className += ' __loading';

    	(function checkForScroll() {
    		// Any different render plugins can be used,
    		// so we need variables for count all registered plugins and
    		// all loaded plugins

    		var pluginCount = 0,
    			pluginReady = 0;

			// If there's no any render plugin, just skip checking section
			if (window.render !== undefined) {

				for (var plugin in window.render) {
					pluginCount++;

					// first time
					if (window.render[plugin].timeExpected === undefined) {
						window.render[plugin].timeExpected = new Date().getTime() + (window.render[plugin].timeOut || defaultTimeOut);

						// When plugin finish his work, it send "finishEvent", which differs for each plugin
						window.render[plugin].finishEvent && document.addEventListener(window.render[plugin].finishEvent, function() {
							window.render[plugin].timeExpected = new Date().getTime();
						})

						// When plugin need to update work's timeout, it generate "updateEvent"
						window.render[plugin].updateEvent && document.addEventListener(window.render[plugin].updateEvent, function() {
							window.render[plugin].timeExpected = new Date().getTime() + (window.render[plugin].timeOut || defaultTimeOut);
						})

					// Plugin already was initialized
					} else {
						// If timeout come, increase counter
						if ( window.render[plugin].timeExpected < new Date().getTime() ) {
							pluginReady++;
						}
					}
				}

				// if there's more than 0 plugins and all of them get timeout, continue,
				// otherwise make recursive call
				if ( !((pluginCount) && (pluginCount == pluginReady)) ) {
					setTimeout(function() {
						checkForScroll();
					}, 100);
					return;
				}
			}

			showSections();

			// Chrome scroll bug
			if ( document.querySelector('html').className.indexOf('webkit') != '-1' ) {

				var t = setInterval(function() {
					if (window.pageYOffset != 0) {
						clearInterval(t);
					}

					window.scrollTo(0, 1);
					utils.scrollToSection(navHash);
				}, 100)
			} else {
				utils.scrollToSection(navHash);
			}
    	})();

    } else {
    	showSections();
    }
});