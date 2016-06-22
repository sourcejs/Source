/*!
* SourceJS - Living Style Guides Engine and Integrated Maintenance Environment for Front-end Components
* @copyright 2013-2015 Sourcejs.com
* @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License
* */

if (process.version.node < 6) {
	require('babel-register');
}

require('./server');
