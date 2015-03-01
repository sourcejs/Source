'use strict';

var parser = require('./specs-parser');

process.on('message', function(msg) {

	this.dataCollectionTask = function(message) {
		parser.init(message.config);
		parser.parse(message.config.specsRoot, function(specsData) {
			process.send(specsData);
		});
	};
	
	this._init = function() {
		if(msg) {
			this.dataCollectionTask(msg);
		} else {
			console.log("Child process received empty message. Unable to start processing.");
		}
	}.bind(this)();
});