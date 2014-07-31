// Core routes
require("./redirects.js");

// User custom routes
try {
    require(global.app.get('user') + "/core/routes");
} catch(e){}