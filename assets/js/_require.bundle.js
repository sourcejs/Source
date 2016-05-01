"{%= grunt.file.read('assets/js/lib/require.js') %}"
"{%= grunt.file.read('assets/js/_require-config.js') %}"

// Extending base js config with npm packages list
sourcejs.amd.requirejs.config({
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
