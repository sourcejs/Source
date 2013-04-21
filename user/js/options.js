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
            //bubble: true,
            //globalNav: true,
            //debuggmode: true,
            //search: true
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