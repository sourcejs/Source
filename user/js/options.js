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

        // Plugins
        pluginsEnabled : {
            //Plugins enabling
            //debugmode: true,

            //PHP and proper chmod for file writing required for these plugins
            //bubble: true,
            //globalNav: true
        },

        pluginsOptions : {
            //Plugins options example
            //globalNav : {
            //    pageLimit: 999
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