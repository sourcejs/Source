/**
 * Created by Alexey Ostrovsky.
 * Date: 04.04.13
 * Time: 14:33
 */

define(['modules/innerNavigation'], function (innerNavigation) {

    return describe('Inner Navigation module - innerNavigation.js', function () {

        var iNav;
        var TEST_SECTION =
                '<section class="source_section">' +
                        '<h2>Первый блок</h2>' +
                        '<section class="source_example" style="background-color:#F2F4F6">' +
                        '<div class="insert-ucard_avatar"></div>' +
                        '</section>' +
                        '</section>';


        beforeEach(function () {

            $('#sandbox').html('<div class="source_main"><h1>Test heading</h1></div>');

            iNav = innerNavigation.createInstance();
        });

        afterEach(function () {
            $('#sandbox').html('');
        });

        it('injects only navigation menu in DOM after .source_header element', function () {
            expect($('.source_main_nav').length).toEqual(1);
        });

    });

});