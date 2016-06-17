sourcejs.amd.define([
    'jquery',
    'source/load-options'
], function($, options) {

    'use strict';

    $(function(){
        var headerEl = document.querySelector('.source_header');
        var footerEl = document.querySelector('.source_footer');

        if(options.modulesEnabled.headerFooter) {
            //Header and Footer injection
            var $sourceContainer = $('.source_container');

            if (!headerEl) {
                $sourceContainer.prepend($('<div class="source_header"></div>'));
            }

            if (!footerEl) {
                $sourceContainer.append($('<div class="source_footer"></div>'));
            }

            if ($sourceContainer.length && !(headerEl && footerEl)) {
                //some empty page
                if (!$sourceContainer.contents().length) {
                    $sourceContainer.append($('<div class="source_main source_col-main" role="main">Welcome to Source!</div>'));
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
    });
});
