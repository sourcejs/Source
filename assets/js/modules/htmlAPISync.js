'use strict';

sourcejs.amd.define([
    "jquery",
    "sourceModules/module",
    "sourceModules/utils",
    "sourceModules/innerNavigation",
    "sourceModules/ntf",
    "sourceModules/sectionsParser"
], function($, module, utils, innerNavigation, ntf) {
    function HtmlAPiSync() {
        this.specID = utils.getPathToPage().substring(1);

        innerNavigation.addMenuItemSimple('HTML API', [
            {
                name: 'Sync',
                callback: this.syncHTML
            },
            {
                name: 'Delete',
                callback: this.deleteHTML
            }
        ], this);
    }

    HtmlAPiSync.prototype = module.createInstance();
    HtmlAPiSync.prototype.constructor = HtmlAPiSync;

    HtmlAPiSync.prototype.syncHTML = function(){
        var parser = new SourceGetSections();

        var specObj = {};
        specObj[this.specID + '/specFile'] = parser.getSpecFull();

        // Marking hand synced content
        specObj[this.specID + '/specFile/forcedSave'] = true;

        var dataToSend = {
            unflatten: true,
            data: specObj
        };

        $.ajax({
            url: '/api/specs/html',
            method: 'POST',
            data: JSON.stringify(dataToSend),
            contentType: "application/json",
            dataType: 'json',
            success: function(){
                ntf.alert('HTML Sync done');
            }
        });
    };

    HtmlAPiSync.prototype.deleteHTML = function(){
        var dataToSend = {
            id: this.specID
        };

        $.ajax({
            url: '/api/specs/html',
            method: 'DELETE',
            data: JSON.stringify(dataToSend),
            contentType: "application/json",
            dataType: 'json',
            success: function(){
                ntf.alert('HTML Delete done');
            }
        });
    };

    return new HtmlAPiSync();
});
