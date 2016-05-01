"{%= grunt.file.read('assets/js/lib/require.js') %}"
"{%= grunt.file.read('assets/js/lib/jquery-2.1.4.min.js') %}"
"{%= grunt.file.read('assets/js/require-config.js') %}"

// Extending base js config with npm packages list
requirejs.config({
    // Create shorthands routes to clint-side npm plugins
    packages: function () {
        var modulesList = "{%= npmPluginsEnabled %}";

        var npmPackages = [];
        for (var module in modulesList) {
            npmPackages.push({
                name: module,
                location: '/node_modules/' + module + '/assets',
                main: 'index'
            })
        }

        return npmPackages;
    }()
});
