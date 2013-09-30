/*
*
* Overriding core options
*
* */

define({

    sourceOptions : {
        modulesEnabled : {
            //Overriding example
            //trimSpaces: true
        },

        modulesOptions : {
            //Modules options example
            //innerNavigation : {
            //  hashSymb: '!'
            //  }
        },

        // Plugins
        pluginsEnabled : {
            //Plugins enabling
            //debugmode: true

            //PHP and proper chmod for file writing required for bubble (comments) plugin
            //bubble: true
        },

        pluginsOptions : {
            //Plugins options example
            //bubble : {
            //    someOption: true
            //}
        }
    },

    // Default options for landing page
    landingOptionsExceptions : {
        pluginsEnabled : {
            //bubble: false,
            //debuggmode: false
        }
    }

});