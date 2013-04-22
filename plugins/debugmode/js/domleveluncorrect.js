function LevelUncorrect(exampleSectionClass, utilityClasses, tooltip){
	// get dom level count and show troubles element
	this.exampleSectionClass = exampleSectionClass;
	this.errorClass = utilityClasses.domLevelError;
	this.errorMessage = 'Уровень вложенности: ';
	this.tooltip = tooltip;

	// if have current target for dm
	if(this.exampleSectionClass) {
		this.sections = $('.' + this.exampleSectionClass);
	// if no, check classes count on whole page
	} else {
		this.sections = $('body');
	}
}

LevelUncorrect.prototype.getOverLeveledElements = function(level){
	
	var _this = this,
		overLeveledElements = new Array(),
		_level = level || 10;

	// go over all sections
	this.sections.each(function(i){
		// get current single section
		var currentSection = $(this);

		// get all elements in this section
		currentSection.find('*').each(function(i){
			// get level count of all element
			var element = $(this),
				level_count = _this.getLevelCountOfElement(element,this.exampleSectionClass);

			// if count of this element more than required
			if (level_count > _level) {
				// add this element to overLeveledElements array
				overLeveledElements.push({element: element, count: level_count})
			}
		})
	})

	// record all detected elements
	this.detectedElements = overLeveledElements;

	return overLeveledElements;
}

LevelUncorrect.prototype.showUncorrect = function(level){
	//  show elementw with needed lebel in DOM
	var overLeveledElements,
		i;

	// get all elements having lots of level
	overLeveledElements = this.getOverLeveledElements(level);
	i = overLeveledElements.length;

	while(i--) {
		// for every element add error class
		var element = overLeveledElements[i];
		
		element.element.addClass(this.errorClass);

		if(this.tooltip)
			element.element.bind('mouseenter', {count:element.count, self: this}, this.showTooltip)
			  .bind('mouseleave', { self: this}, this.hideTooltip);
	}

	return {count:overLeveledElements.length,els:overLeveledElements}
}

LevelUncorrect.prototype.hideUncorrect = function(){
	// if we record previous detected elements
	if(this.detectedElements) {
		var i = this.detectedElements.length,
			element,
			elements;

		while(i--){
			element = $(this.detectedElements[i].element);
			
			element.removeClass(this.errorClass);

			if (this.tooltip)
				this.unbindTooltipAppearence(element);
				
		}
	} else {
		// find this elements again
		elements = $('.' + this.errorClass);
		elements.removeClass(this.errorClass);

		// unbind tooltip appearence
		if (this.tooltip) {
			elements.each(function(){
				_this.unbindTooltipAppearence(this);
			})
		}
	}
}

LevelUncorrect.prototype.getLevelCountOfElement = function(element,lastParentClass){
	var count = 0;

	if(!lastParentClass)
		lastParentClass = this.exampleSectionClass;

	// go over all parent node of element until section
	for(;;){
		// got to parent node
		element = element.parent();

		// if reach last element for search, break
		if(element.hasClass(lastParentClass)){
			break;
		}
		// if reach body within section container, break
		if(element.tagName == 'body' || !element){
			count = false;
			break;
		}

		count++;
	}

	return count;
}

LevelUncorrect.prototype.showTooltip = function(event) {
	event.data.self.tooltip.show(event.data.self.errorMessage + event.data.count);
};

LevelUncorrect.prototype.hideTooltip = function(event) {
	event.data.self.tooltip.hide();
};

LevelUncorrect.prototype.unbindTooltipAppearence = function(element) {
	// unbind from element tooltip appearence by hover
	$(element)
		.unbind('mouseenter', this.showTooltip)
		.unbind('mouseleave', this.hideTooltip);
};
