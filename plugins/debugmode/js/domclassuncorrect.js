function DomClassUncorrect(exampleSectionClass, utilityClasses, tooltip) {
	// get classes count and show troubles element
	this.containers;
	this.utilityClasses = utilityClasses;
	this.tooltip = tooltip;
	this.errorClass = utilityClasses.classError;
	this.detectedElements;
	this.errorMessage = 'Количество классов: ';

	// if have current target for dm
	if(exampleSectionClass) {
		this.containers = $('.' + exampleSectionClass);
	// if no, check classes count on whole page
	} else {
		this.containers = $('body');
	}
};

DomClassUncorrect.prototype.getOverclassedElements = function(maxCount){
	//get class count of every single element
	var 
		_this = this,
		allEls = this.containers.find('*'),
		countEls = allEls.size(),
		maxCount = maxCount || 2,
		overClassedElements = [],
		
		count = function(_class){
			// take all classes of single element
			var count = 0,
				//divide it to array with all classes of element 
				classes = (_class.replace(/^\s+|\s+$/g, "")).split(" "),
				length = classes.length;
			
			// for each single class of element
			for(var i = 0; i < length; i++) {
				var _class = classes[i];

				// check if class is utility class that can
				// be leaft by other functions of dm
				if(_class) {
					// if no - count it as layout class
					if (!isInUtilityClass(_class))
						count++;
				// if element has no classes
				} else {
					count = 0;
				}
			}
		
			return count;
		},
		isInUtilityClass = function(_class) {
			var res = false;

			// go through all utility classes
			for (key in _this.utilityClasses)
				// check if this class equals to one utility
				if (_this.utilityClasses[key] == _class)
					res = true

			return res;
		}

	// go with every node
	while(countEls--){
		// get classes count of current node
		tmp = count(allEls[countEls].className);

		// if count meets the condition of max count,
		// add element and class count to return result
		if ( tmp > maxCount){
			overClassedElements.push({el:allEls[countEls],count:tmp})
		}
	}

	this.detectedElements = overClassedElements;

	return overClassedElements;
};

DomClassUncorrect.prototype.showUncorrect = function(maxCount){
	// get all elements meet the condition
	var _this = this,
		overClassedElements = this.getOverclassedElements(maxCount),
		i = count = overClassedElements.length;

	// if we have elements
	if(i) {
		// add to every gotten element error class
		while(i--){
			var element = $(overClassedElements[i].el);
			
			element.addClass(this.errorClass);

			if(this.tooltip)
				element.bind('mouseenter', {count:overClassedElements[i].count, self:_this}, _this.showTooltip)
				  .bind('mouseleave', { self:_this}, _this.hideTooltip);
		}
		
		// return count of elements with much more classes
		return count;
	// if all elements have less classes count
	} else {
		return '0';
	}
};

DomClassUncorrect.prototype.hideUncorrect = function(){
	// if have filled array of classes elements
	if(this.detectedElements){
		//if we have strict pointer to all classed elements
		var i = this.detectedElements.length,
			element,
			elements;

		while(i--){
			element = $(this.detectedElements[i].el);
			
			element.removeClass(this.errorClass);

			if (this.tooltip)
				element.unbind('mouseenter', this.showTooltip)
				  .unbind('mouseleave', this.hideTooltip);
		}
	// else - find all elements in DOM by error class
	} else {
		// remove error class form all elements
		elements = $('.' + this.errorClass);

		elements.removeClass(this.errorClass);

		// unbind tooltip appearence
		if (this.tooltip) {
			elements.each(function(){
				_this.unbindTooltipAppearence(this);
			})
		}
	}
};

DomClassUncorrect.prototype.showTooltip = function(event) {
	event.data.self.tooltip.show(event.data.self.errorMessage + event.data.count);
};

DomClassUncorrect.prototype.hideTooltip = function(event) {
	event.data.self.tooltip.hide();
};

DomClassUncorrect.prototype.unbindTooltipAppearence = function(element) {
	// unbind from element tooltip appearence by hover
	$(element)
		.unbind('mouseenter', this.showTooltip)
		.unbind('mouseleave', this.hideTooltip);
};