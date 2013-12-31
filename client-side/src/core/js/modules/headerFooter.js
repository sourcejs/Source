define(["core/options"], function(options) {
    if(options.modulesEnabled.headerFooter) {
        var headerExists = $(".source_header").length;
        var footerExists = $(".source_footer").length;

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

            var insertHeader = function(data) { $('.source_header').replaceWith(data.responseText);}

            var headerFile = 'header.inc.html',
                    footerFile = 'footer.inc.html';

            $.ajax({
                url:"/user/templates/"+headerFile,
                async:false,
                complete:function (data, status) {
                    if (status === 'success') {
                        insertHeader(data);
                    } else {
                        $.ajax({
                            url:"/core/templates/"+headerFile,
                            async:false,
                            complete:function (data) {
                                insertHeader(data);
                            }
                        });
                    }
                }
            });

            var insertFooter = function(data) { $('.source_footer').replaceWith(data.responseText); }

            $.ajax({
                url:"/user/templates/"+footerFile,
                async:false,
                complete:function (data, status) {
                    if (status === 'success') {
                        insertFooter(data);
                    } else {
                        $.ajax({
                            url:"/core/templates/"+footerFile,
                            async:false,
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
    $('.source_header').on({
        'mouseover' : function(e){
            if(e.target === this){
                $('.source_header').css('cursor', 'pointer');
            }else {
                $('.source_header').css('cursor', 'inherit');
            }
        },
        'click' : function(e){
            if(e.target === this){
                window.scrollTo(0, 0);
            }
        },
        'mouseout' : function(e){
            $('.source_header').css('cursor', 'inherit');
        }
    });

});