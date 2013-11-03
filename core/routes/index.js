require("./spec.js");
require("./redirects.js");

try {
    // user custom routes
    global.userRoutes = require("../../user/routes");
} catch(e) {
    console.log(e);
    process.exit(e.code);
}