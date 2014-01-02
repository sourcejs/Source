require("./src.js");
require("./redirects.js");

// user custom routes
try {
    global.userRoutes = require("../../user/routes");
} catch(e) {
    console.log(e);
    process.exit(e.code);
}