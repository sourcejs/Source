//In separate module, to trace script ready state
define([
    "modules/utils",
    "modules/loadEvents",
    "modules/sectionFolding"
    ], function(utils, loadEvents) {
    var navHash = utils.parseNavHash(),
	    sections = document.querySelectorAll('.source_section'),
	    navigation = document.querySelector('.source_nav'),
	    mainContainer = document.querySelector('.source_main');

	// Show hidden sections and navigation
	function showSections() {
		for (var i = 0; i < sections.length; i++) {
			sections[i].className += ' __loaded';
		}

		navigation.className += ' __loaded';
		mainContainer.className = mainContainer.className.replace(' __loading', '');
	}

	mainContainer.className += ' __loading';

	loadEvents.init(function() {
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
	});

});