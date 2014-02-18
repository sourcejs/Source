/*
*
* Navigation scroll highlighter
*
* @author Ivan Metelev (http://welovehtml.ru)
*
* */

"use strict";

define([
    'modules/module'
    ], function (module) {

	function navHighlight() {

		var _this = this;

		navHighlight.prototype = module.createInstance();
		navHighlight.prototype.constructor = navHighlight;

		// basic utils
		var utils = (function() {

			return {
				offsetTop: function(elem) {
					var box = elem.getBoundingClientRect();
					var clientTop = document.body.clientTop || 0;
					var top = box.top +  window.pageYOffset - clientTop;

					return Math.round(top);
				},
				hasClass: function(elem, cls) {
					if (elem !== null) {
						return elem.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
					} else {
						return false;
					}
				},
				addClass: function(elem, cls) {
					if (!this.hasClass(elem,cls)) {
						elem.className += " "+cls;
						elem.className.replace(/ +/g,' ');
					}
				},
				removeClass: function(elem, cls) {
					if (this.hasClass(elem,cls)) {
						var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
						elem.className=elem.className.replace(reg,'');
					}
				},
				closest: function(elem, cls) { //console.log(elem, cls);
					if (elem.tagName == 'html') return false;

					var elemParent = elem.parentNode;
					if (!utils.hasClass(elem, cls)) {
						return utils.closest(elemParent, cls);
					}

					return elem;
				}
			}

		})()

		var sourceHeaders = [],
			navHeaders,
			currentHeader = -1,
			filename, extension;

		filename = document.location.href.split('/').pop().split('.');

		extension = /\w+/.exec(filename[1]);
		filename = filename[0];

		// watch headers position
		var watchSectionTop = function () {

			var headersLength = sourceHeaders.length,
				minDistance = Number.MAX_VALUE,
				closestHeader = -1;

			// catch section which is closed for top window border
			for (var i=0; i < headersLength; i++) {

				if ((sourceHeaders[i].tagName == 'H3') && (!utils.hasClass(utils.closest(sourceHeaders[i], 'source_section'), 'source_section__open')) ) {
					continue;
				}

				var currentDist = Math.abs( utils.offsetTop(sourceHeaders[i]) - 60 - window.pageYOffset ); //60 = Header heights
				if (currentDist < minDistance) {
					closestHeader = i;
					minDistance = currentDist;
				}
			}

			if (closestHeader !== currentHeader) {
				utils.removeClass( document.querySelector('.source_main_nav_li.__active'), '__active');
				utils.removeClass( document.querySelector('.source_main_nav_a.__active'), '__active');

				utils.addClass(navHeaders[closestHeader], '__active');

				var parent = utils.closest(navHeaders[closestHeader], 'source_main_nav_li'),
					href = navHeaders[closestHeader].getAttribute('href');

				if (!!parent && parent) {
					utils.addClass(parent, '__active');
				}

				// Modern browsers uses history API for correct back-button-browser functionality
				if (!!(window.history && history.pushState)) {
					window.history.replaceState({anchor: closestHeader+1}, document.title, filename + '.' +  extension + href);
				} else { // ie9 fallback
					 window.location.hash = href;
				}

				currentHeader = closestHeader;
			}
		}

		// watch navmenu render
		var checkNavInterval,
			h2Nodes, h3Nodes,
			bodyNode = document.querySelector('body'),
			checkOnNav = function checkOnNav() {

			if ((document.querySelector('.source_section') !== null) &&
				(document.querySelector('.source_main_nav_a') !== null)) {

				clearInterval(checkNavInterval);

				navHeaders = document.querySelectorAll('.source_main_nav_a');
				h2Nodes = document.querySelectorAll('.source_section');

				for (var h2 = 0; h2 < h2Nodes.length; h2++) {
					var h3Nodes = h2Nodes[h2].getElementsByTagName('h3');

					sourceHeaders.push( h2Nodes[h2].querySelector('h2') );
					for (var h3 = 0; h3 < h3Nodes.length; h3++) {
						sourceHeaders.push( h3Nodes[h3] );
					}

				}

				if (utils.hasClass(bodyNode, 'source__scrolled-down')) {
					watchSectionTop();
				}

				window.onscroll = function() {
					watchSectionTop();
				}

				return;
			}
		}

		checkNavInterval = setInterval(checkOnNav, 1000);
	}

	return new navHighlight();
})




