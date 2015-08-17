define(['source/load-options'], function(options) {

    'use strict';

    var $header = $(".source_header");
    var $footer = $(".source_footer");

    if(options.modulesEnabled.headerFooter) {
        var headerExists = $header.length > 0;
        var footerExists = $footer.length > 0;

        //Header and Footer injection
        var source_container = $('.source_container');

        if (!headerExists) {
            source_container.prepend($('<div class="source_header"></div>'));
        }

        if (!footerExists) {
            source_container.append($('<div class="source_footer"></div>'));
        }

        if (source_container.length && !(headerExists && footerExists)) {
            //some empty page
            if (!source_container.contents().length) {
                source_container.append($('<div class="source_main source_col-main" role="main">Welcome to Source!</div>'));
            }

            var insertHeader = function(data) {
                $('.source_header').replaceWith(data.responseText);
            };

            var headerFile = 'header.inc.html';
            var footerFile = 'footer.inc.html';

            $.ajax({
                url:"/assets/templates/"+headerFile,
                async:true,
                complete:function (data, status) {
                    if (status === 'success') {
                        insertHeader(data);
                    } else {
                        $.ajax({
                            url:"/source/assets/templates/"+headerFile,
                            async:true,
                            complete:function (data) {
                                insertHeader(data);
                            }
                        });
                    }
                }
            });

            var insertFooter = function(data) {
                $('.source_footer').replaceWith(data.responseText);
            };

            $.ajax({
                url:"/assets/templates/"+footerFile,
                async:true,
                complete:function (data, status) {
                    if (status === 'success') {
                        insertFooter(data);
                    } else {
                        $.ajax({
                            url:"/source/assets/templates/"+footerFile,
                            async:true,
                            complete:function (data) {
                                insertFooter(data);
                            }
                        });
                    }
                }
            });
        }
    }

    //click on header - go up
    $header.on({
        mouseover: function(e){
            if(e.target === this){
                $('.source_header').css('cursor', 'pointer');
            }else {
                $('.source_header').css('cursor', 'inherit');
            }
        },
        click: function(e){
            if(e.target === this){
                window.scrollTo(0, 0);
            }
        },
        mouseout : function(){
            $('.source_header').css('cursor', 'inherit');
        }
    });

});