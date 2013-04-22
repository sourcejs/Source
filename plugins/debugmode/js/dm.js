/**
 * Created by Anton Korochinsky. 
 * Mail: anton.korochinskiy@gmail.com , twitter: korochinskiy 
 * Date: 19.01.13
 */

define(["jquery", "modules/module"], function ($, module) {

// rules table for checklist
function initializeRulesTable(options) {
	var rules_table = {
		simple : {
			'dt_l_no-title' : {
				body_class : 'dt_l_no-title',
				callback : function(){
					var els = $('.' + options.exampleSectionClass + ' a:not([title])')
					return {
						els : els,
						count : els.length,
						errorMessage : 'Ссылка без атрибута title'
					}
				}
			},
			'dt_l_target' : {
				body_class : 'dt_l_target',
				callback : function() {
					var els = $('.'+ options.exampleSectionClass + ' a[target]');
					return {
						els : els,
						count : els.length,
						errorMessage : 'Ссылка с атрибутом title'
					}
				}
			},
			'dt_l_href' : {
				body_class : 'dt_l_href',
				callback: function() {
					var count =0,
						all_l = $('.' + options.exampleSectionClass + ' a'),
						els = [];

						all_l.each(function(idx,el){
							var attr = $(el).attr('href');
							if(!attr || attr=="#" || attr=="")
								count++
								els.push($(el))
						})
					return {
						els : els,
						count : els.length,
						errorMessage : 'Ссылка с неправильным href'
					}
				}
			},
			'dt_img_alt' : {
				body_class : 'dt_img_alt',
				callback : function() {
					var count = 0,
						all_img = $('.' + options.exampleSectionClass + ' img'),
						els = [];

						all_img.each(function(idx,el){
							var alt = el.alt;
							if(!alt || alt==""){
								count++;
								els.push($(el));
							}
						})
					return {
						els : els,
						count : els.length,
						errorMessage : 'Изображение без атрибута alt'
					}
				}
			},
			'dt_img_title' : {
				body_class : 'dt_img_title',
				callback : function() {
					var count = 0,
						all_img = $('.' + options.exampleSectionClass + ' img'),
						els = [];

						all_img.each(function(idx,el){
							var title = el.title;
							if(!title || title==""){
								count++;
								els.push($(el));
							}
						})

					return {
						els : els,
						count : els.length,
						errorMessage : 'Изображение без атрибута title'
					}
				}
			}
		}
	}

	return rules_table;
};

// some options 
var 
	dmUtilityClasses = {
		classError : 'dm_class_count_error',
		domLevelError : 'dm_dom_level_error'
	},
	dmOtions = {
		switchOffEvent : 'debugmodeSwitchOff'
	};


// debugmode controller
function Debugmode(){
	
	this.inDebugmode = false;
	this._body = $('body');
	this.pathToDmCss = '/plugins/debugmode/css/debugmode.css';
	this._window = $(window);
	this.switcherActiveClass = 'active';
	this.toolbarTransparentClass = '__transparent';
}
	// get all needed parameters
	Debugmode.prototype.initialize = function(paramSwitcher, paramOptions) {
		this.switcher = paramSwitcher;
		this.options = paramOptions;
		this.rulesTable = initializeRulesTable(this.options);
		this.containers = $('.' + this.options.exampleSectionClass);
		this.sectionToolbar = new DmSectionToolbar(this,this.containers);	
	};	

	// toggle mode
	Debugmode.prototype.switchMode = function(){
		if(this.inDebugmode){
			this.offDebugMode();
		} else {
			this.runDebugMode();
		}
	};

	// switch debugmode on
	Debugmode.prototype.runDebugMode = function(){
		this.switcher.toggleClass(this.switcherActiveClass);

		this.inDebugmode = true;

		if(!this.dmToolbar){
			// if DmToolbar isn't created
			this.dmToolbar = new DmToolbar(this, this.options);
		} else {
			this.dmToolbar.toolbar.removeClass(this.toolbarTransparentClass);
		};

		this._window.trigger(dmOtions.switchOffEvent);
	};
	
	// switch debugmode off
	Debugmode.prototype.offDebugMode = function(){
		this.switcher.toggleClass(this.switcherActiveClass);
		this.inDebugmode = false;

		this.dmToolbar.toolbar.addClass(this.toolbarTransparentClass);

		this._window.trigger(dmOtions.switchOffEvent);
	};

	// add suitable class to body due to rule id
	Debugmode.prototype.showSimpleTrouble = function(id){
		// id - identifier of rulse we need to find in checklist rulses table
		var rules = this.getRulesById(id);
		// add to body class that shows trouble elements
		this._body.addClass(rules.body_class);
		//return count of trouble elements and trubles elements
		return rules.callback();
	};

	// remove suitable class to body due to rule id
	Debugmode.prototype.hideSimpleTrouble = function(id){
		// id - identifier of rules we need to find in checklist rulses table
		// and after it remove class from body
		var rule = this.getRulesById(id);

		if (rule) {
			this._body.removeClass(rule.body_class);
		};
	};

	// get rule from rules table due to id
	Debugmode.prototype.getRulesById = function(id){
		// find rules by id in big json rules table
		return this.rulesTable.simple[id];
	};



// debugmode toolbar in section 
function  DmSectionToolbar(dm,sections){

	var 
		_this = this,
		toolbarContent = { /* dtoolbar items */
			'dm_editable':'Редактировать контент',
			'dm_uneditable':'Закончить редактирование',
			'dm_revert': 'Отменить изменения',
			'dm_close': 'Выйти из дебагг-режима'
		},
		dmToolbarClass = 'dm_dtoolbar';
	
	this.sections = sections;
	this.dm = dm;

	this._body = $('body');
	this.toolbar = $('<div />', {
				'class': dmToolbarClass,
				'contenteditable': false
			});
	this.debugmoodeIsOn = true;
	this.firstStates = {};
	
	// fill dtoolbar by dtoolbars items
	for(var key in toolbarContent){
		$('<a />',{
			id: key,
			text: toolbarContent[key]
		}).appendTo(this.toolbar);			
	};

	// apend toolbar to the bottom of body
	this.toolbar.appendTo(this._body);

	// bind all toolbar controls click
	$(document.getElementById('dm_editable')).click(function(){
		_this.makeSectionEditable(_this.currentSection,true);
	});
	$(document.getElementById('dm_uneditable')).click(function(){
		_this.makeSectionEditable(_this.currentSection,false);
	})
	$(document.getElementById('dm_revert')).click(function(){
		_this.revertSectionContent(_this.currentSection,_this.currentSectionIdx);
	})
	$(document.getElementById('dm_close')).click(function(){
		_this.removeDebugToolbar(_this.currentSection);
		_this.offDebugMode();
	});

	// every section section
	this.sections.each(function(i){
		(function(i){
			// bind mouseenter for showing section toolbar
			$(_this.sections[i]).mouseenter(function(){
				_this.currentSectionIdx = i;
				// mark mouseentered section as current
				_this.currentSection = $(_this.sections[i]);

				// add toolbar to current section 
				_this.addDebugToolbar(_this.currentSection, i);
			// bind mouseleaving
			}).mouseleave(function(){
				// hide toolbar in this section
				_this.removeDebugToolbar(_this.currentSection, i);
			});
		})(i);
	});
};	
	// append section toolbar to section
	DmSectionToolbar.prototype.addDebugToolbar = function(section,i){
		// if debugmode is on
		if(this.dm.inDebugmode) {
			// save start content for reverting
			if(!this.firstStates['item_' + i]) {
				this.firstStates['item_' + i] = this.sections[i].innerHTML;
			}
			// append toolbar to section
			section.css('position','relative').append(this.toolbar);
		// id gebugmode is off, no section toolbar
		} else {
			return false;
		};
	};

	// remove section toolbar from section
	DmSectionToolbar.prototype.removeDebugToolbar = function(section,i){
		var section = $(this.sections[i]);
		// move toolbar from section to body
		this.toolbar.appendTo(this._body);
		// remove utility relative position
		section.css('position','');
	};

	// let or no edit content in section
	DmSectionToolbar.prototype.makeSectionEditable = function(currentSection, letEdit){
		// add to section editable attribute
		currentSection.attr('contenteditable',letEdit);
	};

	// replace section content with saved first state
	DmSectionToolbar.prototype.revertSectionContent = function(currentSection,currentSectionIdx){
		// move toolbar to body cause will replace all content in section
		this.toolbar.appendTo(this._body);
		// replace section content with saved content
		currentSection.html(this.firstStates['item_' + currentSectionIdx]);
		// move toolbar back to section
		this.toolbar.appendTo(currentSection);
	};

	// switch debugmode off
	DmSectionToolbar.prototype.offDebugMode = function() {
		var _this = this;
		
		this.dm.offDebugMode();
		// make all section uneditable
		this.sections.each(function(i){
			_this.makeSectionEditable($(this),false);
		});
	};



// debugmode toolbar 
function DmToolbar(debugmode, options) {
	
	this.options = options;
	this.debugmode = debugmode;
	// path to dm toolbar template
	this.toolbarUrl = this.options.pluginsDir + 'debugmode/templates/toolbar.html';

	this.window = $(window);
	this.body = $('body');

	this.toolbar = false;

	// get html of dn toolbar
	this.getToolbar();
	// create tooltip object for tooltip appearence
	this.tooltip = new DmTooltip();

	this.toolbarId = 'dm_controls';
	this.toolbarTransparentClass = '__transparent';

	// class added to all simple forms, rules are descripted in rules table 
	this.formsIds = {
		simpleForm : 'dm_simple_form',
		troubleClassesForm : 'trouble_classes',
		troubleDOMLevelsForm : 'trouble_dom',
		resetLink : 'dm_form_hide'
	};

	// info for function calculates class count
	this.classForm = {
		countId : 'dt_lots_classes',
		countShow : 'count_dt_lots_classes',
		maxCountController : 'dt_classes_max_count',
		pathToControllerFunction : this.options.pluginsDir + 'debugmode/js/domclassuncorrect.js' 
	}

	// info for function calculates DOM level count
	this.DOMLevelForm = {
		countId : 'dt_level_count',
		countShow : 'count_dt_level_count',
		maxCountController : 'dt_level_max_count',
		pathToControllerFunction : this.options.pluginsDir + 'debugmode/js/domleveluncorrect.js' 
	};

	// info about toolbar controls
	this.toolbarControls = {
		controls : 'dm_controls_inner',
		hider : 'dm_hider',
		resizer : 'dm_resizer'
	};

	this.noTroublesContent = '<span class="no-troubles">0</span>';

	this.formsObj = {};

};
	
	// get toolbar layout from server
	DmToolbar.prototype.getToolbar = function(){
		// we don't have toolbar on the page at start, 
		// and this is how we get it from server 
		var _this = this,
			animationDuration = 200;

		// if toolbar isn't gotten
		 if(!this.toolbar) {
		 	// send request for toolbar template
		 	$.get(_this.toolbarUrl,function(data){
		 		// append toolbar to body
		 		_this.body.append(data);
		 		_this.toolbar = $(document.getElementById(_this.toolbarId));

		 		// show toolbar smoothly
		 		setTimeout(function(){
		 			_this.toolbar.removeClass(_this.toolbarTransparentClass);
		 		}, animationDuration);
		 		
		 		// create resize controller of toolbar
		 		new DmResizer($('#' + _this.toolbarControls.controls), _this.toolbar,$('#' + _this.toolbarControls.hider),$('#' + _this.toolbarControls.resizer));

		 		// initilaize all forms in toolbar for showing troubles
		 		_this.initilaizeForms();
		 	})
		 // if if toolbar is gotten
		 } else {
		 	return this.toolbar;
		 };
	};

	// initialize all forms toolbar contains
	DmToolbar.prototype.initilaizeForms = function(){
		// for all forms bind submit for showing results
		var _this = this,
			forms = $('.' + this.formsIds.simpleForm, this.toolbar);

		// initilize every simple form
		forms.each(function(){
			_this.initializeSimpleForm($(this));
		})

		//initialize form that show clasese and DOM levels count
		this.initializeClassForm($('#' + this.formsIds.troubleClassesForm, this.toolbar));
		this.initializeDomLevelsCountForm($('#' + this.formsIds.troubleDOMLevelsForm, this.toolbar));
	};

	// initialize all forms get rules from rules table
	DmToolbar.prototype.initializeSimpleForm = function(form){
		// check show trouble classes submit form
		var 
			_this = this,
			// get all checkboxes
			controls = form.find('input[type="checkbox"]'),
			// this form reset link
			reset = form.find('.' + this.formsIds.resetLink);

		// if form is submitted
		form.submit(function(e){
			// get all checboxes value
			controls.each(function(idx,el){
				// if it's checked, show troubles and show count
				var result = _this.debugmode.showSimpleTrouble(el.id);

				_this.addOrRemoveTooltipObservers(el, result.els, 'remove');
				if($(el).is(':checked')){
					// add observers to show or hide tooltip
					_this.addTroublesCount(el.id, result.count);

					_this.addOrRemoveTooltipObservers(el, result.els, 'add', result.errorMessage);
				// else hide count if it is shown
				} else {
					_this.debugmode.hideSimpleTrouble(el.id);
					_this.removeTroublesCount(el.id);
				};
			});
			return false;
		});

		// if we want reset all shown truubles in this form
		reset.click(function(){
			_this.resetForm(form, controls);
			return false;
		})

		// if debugmode is switched off
		this.window.bind(dmOtions.switchOffEvent, function(){
			_this.resetForm(form, controls);
		}) 
	};

	// add or remove observer to elements need to show tooltip with error name
	DmToolbar.prototype.addOrRemoveTooltipObservers = function(control, elements, functionType, errorMessage) {
		
		var _this = this,
			id = control.id,
			callback;

		if(id) {

			if(!this.formsObj[id]) {
				
				this.formsObj[id] = {
					showTooltip : function(errorMessage) {
						_this.tooltip.show(errorMessage.data.errorMessage);
					},

					hideTooltip : function() {
						_this.tooltip.hide();
					},

					addOrRemoveObservers : function(elements, callback, errorMessage) {
						// if returned jquery object
						if(typeof(elements.each) == 'function') {
							// bind to every returned element tooltip appearence
							elements.each(function(){
								callback.call(_this, this, errorMessage);
							});
						// else if returned array
						} else {
							var i = elements.length;

							while(i--) {
								callback.call(_this, elements[i], errorMessage);
							};
						};
					},

					addTooltipObserverToElement : function(element, errorMessage) {
						// bind tooltip appearence to problematic elements
						$(element)
							.bind('mouseenter', {errorMessage: errorMessage}, _this.formsObj[id].showTooltip)
							.bind('mouseleave', _this.formsObj[id].hideTooltip);
					}, 

					removeTooltipObserverToElement : function(element) {
						$(element)
							.unbind('mouseenter', _this.formsObj[id].showTooltip)
							.unbind('mouseleave', _this.formsObj[id].hideTooltip);
					}
				}
			}

			if(functionType == 'add') {
				callback = this.formsObj[id].addTooltipObserverToElement;
			} else {
				callback = this.formsObj[id].removeTooltipObserverToElement;
			};

			this.formsObj[id].addOrRemoveObservers(elements, callback, errorMessage);
		} else {
			return false;
		};

	};

	// initialize form calculates class count
	DmToolbar.prototype.initializeClassForm = function(form){
		//initialize forrm that show classes count
		var 
			_this = this,
			// checbox in this form
			countControl = $('#' + this.classForm.countId, form),
			// container shows troubles count
			countShow = $('#' + this.classForm.countShow, form),
			// controller via can point max count of classes
			maxCountController = $('#' + this.classForm.maxCountController, form),
			// form reset link
			reset = $('.' + this.formsIds.resetLink, form),
			// function controls element count
			domClassUncorrect = false;

		form.submit(function(e){
			require([_this.classForm.pathToControllerFunction], function() {
				// if have no domClassUncorrect function initialized yet
				if(!domClassUncorrect)
					domClassUncorrect = new DomClassUncorrect(_this.options.exampleSectionClass, dmUtilityClasses, _this.tooltip);

				// hide previous shown suitable elements
				domClassUncorrect.hideUncorrect();

				// if need to show elements
				if(countControl.is(':checked')){
					//show new suitable elements
					var count = domClassUncorrect.showUncorrect(maxCountController.val());
					// show count next to checkbox
					_this.addTroublesCount(_this.classForm.countId, count);
				// else hide problematic elements count
				} else {
					countShow.text('');
				};
			});
			return false;
		});

		// reset form by reset link clicked
		reset.click(function(e){
			_this.resetForm(form, countControl);

			return false;
		});

		// if debugmode is switched off
		this.window.bind(dmOtions.switchOffEvent, function(){
			_this.resetForm(form, countControl);
		});
	};

	// initialize form calculates DOM level count
	DmToolbar.prototype.initializeDomLevelsCountForm = function(form){
		var 
			_this = this,
			// checbox in this form
			countControl = $('#' + this.DOMLevelForm.countId, form),
			// container shows troubles count
			countShow = $('#' + this.DOMLevelForm.countShow, form),
			// controller via can point max count of classes
			maxCountController = $('#' + this.DOMLevelForm.maxCountController, form),
			// form reset link
			reset = $('.' + this.formsIds.resetLink, form),
			// function controls element count
			domLevelUncorrect = false;


		form.submit(function(e){
			require([_this.DOMLevelForm.pathToControllerFunction], function() {
				// if have no domLevelUncorrect function initialized yet
				if(!domLevelUncorrect)
					domLevelUncorrect = new LevelUncorrect(_this.options.exampleSectionClass, dmUtilityClasses, _this.tooltip);	
				
				//hide previous classed effects	
				domLevelUncorrect.hideUncorrect();
				
				if(countControl.is(':checked')){
					//get count of troubles elements
					var uncorrectElements = domLevelUncorrect.showUncorrect(maxCountController.val());
					
					_this.addTroublesCount(_this.DOMLevelForm.countId, uncorrectElements.count);
				} else {
					countShow.text('');
				};

			});

			return false;
		});

		// reset form by reset link clicked
		reset.click(function(e){
			_this.resetForm(form, countControl);
			return false;
		})

		// if debugmode switchoff
		this.window.bind(dmOtions.switchOffEvent, function(){
			_this.resetForm(form, countControl);
		}) 
	}

	// reset form - hide all shown trubles by this form
	DmToolbar.prototype.resetForm = function(form, controls){
		// for each checkboxes uncheck it
		controls.each(function(idx,el){
			el.checked = false;
		});

		// and submit form with no one checked checkbox
		form.trigger('submit');

		this.tooltip.hide();
	}

	// show trubles count next to every checkbox
	DmToolbar.prototype.addTroublesCount = function(id, count){
		// if there are troubles, show count
		if(count > 0) {
			document.getElementById('count_' + id).innerHTML = count;
		// else add wrapper for green font color, if we have no troubles 
		} else {
			document.getElementById('count_' + id).innerHTML = this.noTroublesContent;
		};
	};

	// hide troubles count next to checkbox
	DmToolbar.prototype.removeTroublesCount = function(id){
		document.getElementById('count_' + id).innerHTML = "";	
	}





// debugmode tooltip
function DmTooltip() {

	this.hiddenClass = '__hidden';
	this.tooltipClass = 'dm_tooltip';
	this.tooltipRowClass = 'dm_tooltip_row';
	this.tooltipWrapperClass =  'dm_tooltip_w';
	this.tooltipHiddenClass = '__hidden';
	
	// create layout of tooltip
	this.getContainerHTML();

};
	// get test to show and show tooltip with this text
	DmTooltip.prototype.show = function(text) {
		var row = this.getRowHtml(text);

		if(row) {
			// append row with current text to common container
			row.appendTo(this.container);
			
			// if tooltip is unvisible, show it
			if(!this.tooltipIsVisible) {
				this.container.removeClass(this.hiddenClass);
				this.tooltipIsVisible = true;
			};
		} else {
			return false;
		};
	};

	// hide tooltip 
	DmTooltip.prototype.hide = function() {
		// if tooltip is visible, hide it
		if(this.tooltipIsVisible) {
			this.container.addClass(this.hiddenClass);
			// remove all rows
			this.container.empty();

			this.tooltipIsVisible = false;
		} else {
			return false;
		};
	};

	// create layout of tooltip container
	DmTooltip.prototype.getContainerHTML = function() {
		this.container = $('<div />', {
							'class'	: this.tooltipWrapperClass + ' ' + this.tooltipHiddenClass
						}).appendTo($(document.body));

		$('<div />', {
			'class'	: this.tooltipClass
		}).appendTo(this.container);
	};

	// get row with one error text for append to container
	DmTooltip.prototype.getRowHtml = function(text) {
		if (text)
			return $('<p />', {
						'class' : this.tooltipRowClass,
						'text'	: text
					});
		else
			return false;
	};
	

// resizer of debugmode toolbar
function DmResizer(dmToolbarContent, dmToolbar, dmHider, dmResizer) {
	
	// content of toolbar
	this.dmToolbarContent = dmToolbarContent;
	// toolbar
	this.dmToolbar = dmToolbar;
	// link to minimize or maximaze toolbar
	this.dmHider = dmHider;
	// active area for resize
	this.dmResizer = dmResizer;

	// in cookie write last height of toolbar
	this.lastDmHeightCookieName = 'lastDmHeight';
	this.currentHeight = $.cookie(this.lastDmHeightCookieName) || 300;

	this.body = $('body');
	this.window = $(window);

	this.lastHeight = start_height = 20;

	this.dmIsHidden = false;
	this.hiddenClass = '__closed';
	
	var _this = this;
	
	if(this.currentHeight){
		this.dmToolbarContent.css('height',this.currentHeight);
	} else {
		this.currentHeight = this.dmToolbar.height();
	}
	
	this.dmResizer.mousedown(function(){
		_this.window.bind('mousemove',resizeToolbar);
		_this.makeBodyUnselectable(true);
		_this.changeVisibleStatus(true);
	});

	this.body.mouseup(function(){
		_this.window.unbind('mousemove',resizeToolbar);
		_this.makeBodyUnselectable(false);
	});

	function resizeToolbar(e){
		_this.currentHeight = (_this.window.height()  - e.clientY);
		this.lastHeight = _this.currentHeight;
		_this.dmToolbarContent.css('height', _this.currentHeight);
		$.cookie(_this.lastDmHeightCookieName, _this.currentHeight);
	}

	this.initializeToolbar();
};

	DmResizer.prototype.hideToolbar = function(){
		this.dmToolbarContent.css('height',start_height);
		this.changeVisibleStatus(false);
	}

	DmResizer.prototype.showToolbar = function(){
		this.dmToolbarContent.css('height',this.lastHeight);
		this.changeVisibleStatus(true);
	}

	DmResizer.prototype.initializeToolbar = function(){
		// initialize toolbar after it's gotten from server
		var _this = this;

		this.lastHeight = this.dmToolbarContent.height();

		this.dmHider.click(function(e){
			e.preventDefault();
			checkState();
		});

		function checkState(state){
			var os = _this.dmHider.text();;
			if(_this.dmIsHidden){
				_this.showToolbar();
			} else {
				_this.hideToolbar();
			};
		};
	};

	DmResizer.prototype.changeVisibleStatus = function(isToBeVisible) {
		if(isToBeVisible == this.dmIsHidden) {
			var otherState = this.dmHider.text();

			this.dmHider.text(this.dmHider.attr('data-other-state'));
			this.dmHider.attr('data-other-state', otherState);

			this.dmIsHidden = !this.dmIsHidden;

			if(this.dmIsHidden) {
				this.dmToolbarContent.addClass(this.hiddenClass);
			} else {
				this.dmToolbarContent.removeClass(this.hiddenClass);
			};

			return true;
		} else {
			return false;
		};
	};


	DmResizer.prototype.makeBodyUnselectable = function (toBeUnselectable){
		var params = new Array();

		if (toBeUnselectable) {
			params[0] = 'on';
			params[1] = 'none';
			params[2] = false;
		} else {
			params[0] = 'off';
			params[1] = 'auto';
			params[2] = true;
		};

		this.body
			.attr('unselectable', params[0])
            .css('user-select', params[1])
            .css('-webkit-user-select', params[1]);
	};

	
	return new Debugmode();

});