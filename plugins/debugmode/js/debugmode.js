/**
 * Created by Anton Korochinsky. 
 * Mail: anton.korochinskiy@gmail.com , twitter: korochinskiy 
 * Date: 19.01.13
 */

define([
    "core/options",
    "plugins/lib/jquery.cookie",
    "modules/css"
    ], function (options, cookie, Css) {

	function DmInitialize(pathToScript, pathToStyles){
		// path to script and style to load if dm will be switched on
		this.pathToScript = pathToScript || options.pluginsDir + 'debugmode/js/dm.js';
		this.pathToStyles = pathToStyles || 'debugmode/css/dm.css';

		// path to styles need to load necessary
		this.pathToStartStyles = 'debugmode/css/debugmode.css';

		this.switcherFeatures = {
			'class' : 'debugbar_corner',
			'id' : 'dm_open',
			'iconClass' : 'debugbar_corner_ic'
		}

		this.switcher = this.addDebugSwitcher();
		this.debugmode = false;
	};

	// add layout of debugmode switcher
	DmInitialize.prototype.addDebugSwitcher = function(){
		var
			_this = this,
			// create left panel switch off and on dm
			switcher = $('<div />', {
							'class'	: this.switcherFeatures.class,
							'id'	: this.switcherFeatures.id,
							click	:  function(){
											_this.switchMode();
										}
						}).appendTo($(document.body)),

			icon = $('<i />', {
						'class'	: this.switcherFeatures.iconClass
					}).appendTo(switcher);

		// load styles for dm switcher
		new Css(this.pathToStartStyles);

		return switcher;
	};

	// switch mode off or on
	DmInitialize.prototype.switchMode = function() {
		var _this = this;

		if(!this.debugmode) {
			// if object wasn't created
			require([this.pathToScript], function(debugmode) {
				// create object if script is loaded
				_this.debugmode = debugmode;
				_this.debugmode.initialize(_this.switcher, options, Css);

				//load styles for dm toolbars
				new Css(_this.pathToStyles,options.pluginsDir);
				// switch debuggmode on first time
				return _this.debugmode.switchMode();
			});

		} else {
			// switch on or off debugmode
			return this.debugmode.switchMode();
		};
	};

	$(function () {
		new DmInitialize();
	})

})

