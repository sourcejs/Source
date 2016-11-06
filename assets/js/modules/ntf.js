'use strict';

sourcejs.amd.define([
    'jquery',
    'sourceModules/module'
], function($, module) {

    function Notification() {
        if ($('.source_ntf').length === 0) {
            $('.source_container').append('<div class="source_ntf"></div>');

            this.$el = $('.source_ntf');
        }
    }

    Notification.prototype = module.createInstance();
    Notification.prototype.constructor = Notification;

    Notification.prototype.alert = function(msg){
        var _this = this;

        clearTimeout(this.clearNotif);

        this.$el.text(msg).addClass('__active');

        this.clearNotif = setTimeout(function(){
            _this.$el.text('');
            _this.$el.removeClass('__active');
        }, 1000);
    };

    return new Notification();
});
