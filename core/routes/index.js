'use strict';

// Core routes
require("./redirects.js");

// User custom routes
try {
    require(global.userPath + "/core/routes");
} catch(e){}