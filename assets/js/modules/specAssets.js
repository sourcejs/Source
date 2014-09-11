define([
    "source/load-options"
    //, other modules
    ], function(options) {

    'use strict';

    var o = $.extend({}, {
        postponedInit : true,
        postponedTo : 1000,
        assetAttrClone : 'clone',
        assetAttrCopy : 'copy',
        assetAttrPaste : 'paste'
    }, options.modulesOptions.specAssets),
    // for the copy-paste asset
    Copies = {};

    $.fn.assetCloner = function(){
        var _this = $(this);
        _this.each(function(){
            var
                    cloneImage = $(this),
                    clonesTotal = cloneImage.data(o.assetAttrClone);

            cloneImage.removeAttr("data-" + o.assetAttrClone);
            while(--clonesTotal){
                cloneImage.clone().insertAfter(cloneImage);
            }
        });
    };

    //todo: remove attributes
    //todo: check for multiple copy
    $.fn.assetCopyPaste = function(){
        var _this = $(this);
        _this.each(function(){
            var _this = $(this);
            var name = _this.data(o.assetAttrPaste);
            if(!Copies[name]){
                Copies[name] = $('[data-' + o.assetAttrCopy + '=' + name + ']');
            }
            _this.replaceWith(Copies[name].clone());
        });
    };

    if(o.postponedInit){
        //todo: move to post-init script
        setTimeout(function(){
            $("[data-" + o.assetAttrClone + "]").assetCloner();
            $("[data-" + o.assetAttrPaste + "]").assetCopyPaste();
        }, o.postponedTo);
    }
    else {
        $("[data-" + o.assetAttrClone + "]").assetCloner();
        $("[data-" + o.assetAttrPaste + "]").assetCopyPaste();
    }

    //
    // HTML CLONER
    //
    /*
    $("[data-" + o.assetAttrClone + "]").each(function(){
        var
                cloneImage = $(this),
                clonesTotal = cloneImage.data(o.assetAttrClone);

        cloneImage.removeAttr("data-" + o.assetAttrClone);
        while(--clonesTotal){
            cloneImage.clone().insertAfter(cloneImage);
        }
    });
    */

    //
    // HTML COPY-PASTE
    //
    /*
    $("[data-" + o.assetAttrCopy + "]").each(function(){
        var _this = $(this);
        var name = _this.data(o.assetAttrPaste);
        if(!Copies[name]){
            Copies[name] = $('[data-' + o.assetAttrCopy + '=' + name + ']');
        }
        _this.replaceWith(Copies[name].clone());
    });
    */

});