//In separate module, to trace script ready state
define([
    "modules/utils",
    "modules/sectionFolding"
    ], function(utils) {
    var navHash = utils.parseNavHash(),
	    sections = document.querySelectorAll('.source_section'),
	    navigation = document.querySelector('.source_nav'),
	    mainContainer = document.querySelector('.source_main'),
    	maxTimeout = 1000,
    	startRenderTime = new Date().getTime();

    if (navHash != '') {

    	function showSections() {
			for (var i = 0; i < sections.length; i++) {
				sections[i].className = sections[i].className.replace(' __hidden', '');
			}

			navigation.className = navigation.className.replace(' __hidden', '');
			mainContainer.className = mainContainer.className.replace(' __loading', '');
    	}

    	(function hideSections() {
			for (var i = 0; i < sections.length; i++) {
				sections[i].className += ' __hidden';
			}
			navigation.className += ' __hidden';
			mainContainer.className += ' __loading';
    	})();

    	(function checkForScroll() {
    		var now = new Date().getTime(),
    			hooksCount = document.querySelectorAll('[class^="rdk-"]').length;

			if ( (hooksCount !== 0) && (now < startRenderTime + maxTimeout)  ) {

				setTimeout(function() {
					checkForScroll();
				}, 100);
				return;
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

    	document.addEventListener('rdk-render', function() {
    		startRenderTime = new Date().getTime();
    	})
    }
});