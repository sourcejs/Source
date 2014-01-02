//In separate module, to trace script ready state
define([
    "modules/utils",
    "modules/sectionFolding"
    ], function(utils) {
    var navHash = utils.parseNavHash();

    if (navHash != '') {
    	utils.scrollToSection(navHash);

		// Chrome scroll bug
		if ( document.querySelector('html').className.indexOf('webkit') != '-1' ) {

			var t = setInterval(function() {
				if (window.pageYOffset != 0) {
					clearInterval(t);
				}

				window.scrollTo(0, 1);
				utils.scrollToSection(navHash);
			}, 100)
		}

    }
});